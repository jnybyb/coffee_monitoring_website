const { getPromisePool } = require('../config/database');
const path = require('path');
const { generatePlotID } = require('../utils/generatePlotID');

class FarmPlot {
  static async findAll() {
    // First get all farm plots with beneficiary details
    const [plotRows] = await getPromisePool().query(
      `SELECT fp.plot_id AS id,
              fp.beneficiary_id AS beneficiaryId,
              fp.hectares,
              bd.first_name, bd.middle_name, bd.last_name,
              bd.purok, bd.barangay, bd.municipality, bd.province,
              bd.picture
       FROM farm_plots fp
       LEFT JOIN beneficiaries bd ON bd.beneficiary_id = fp.beneficiary_id
       ORDER BY fp.plot_id DESC`
    );

    // Get all coordinates for all plots
    const [coordRows] = await getPromisePool().query(
      `SELECT plot_id, latitude, longitude, elevation
       FROM plot_coordinates
       ORDER BY plot_id, point_order, coordinate_id`
    );

    // Group coordinates by plot_id
    const coordsByPlot = {};
    coordRows.forEach(coord => {
      if (!coordsByPlot[coord.plot_id]) {
        coordsByPlot[coord.plot_id] = [];
      }
      coordsByPlot[coord.plot_id].push({
        lat: parseFloat(coord.latitude),
        lng: parseFloat(coord.longitude),
        elevation: coord.elevation
      });
    });

    // Map plots with their coordinates
    return plotRows.map(r => ({
      id: r.id,
      beneficiaryId: r.beneficiaryId,
      hectares: r.hectares,
      coordinates: coordsByPlot[r.id] || [],
      beneficiaryName: r.first_name ? `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim() : 'Unknown Beneficiary',
      address: r.purok ? `${r.purok || ''}, ${r.barangay || ''}, ${r.municipality || ''}, ${r.province || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',') : 'No address',
      beneficiaryPicture: r.picture ? `/uploads/${path.basename(r.picture)}` : null
    }));
  }

  static async findById(id) {
    // First get the farm plot
    const [plotRows] = await getPromisePool().query(
      'SELECT * FROM farm_plots WHERE plot_id = ?',
      [id]
    );
    
    if (!plotRows.length) return null;
    
    const plot = plotRows[0];
    
    // Get coordinates for this plot
    const [coordRows] = await getPromisePool().query(
      `SELECT latitude, longitude, elevation
       FROM plot_coordinates
       WHERE plot_id = ?
       ORDER BY point_order, coordinate_id`,
      [id]
    );
    
    const coordinates = coordRows.map(coord => ({
      lat: parseFloat(coord.latitude),
      lng: parseFloat(coord.longitude),
      elevation: coord.elevation
    }));
    
    return {
      id: plot.plot_id,
      beneficiaryId: plot.beneficiary_id,
      hectares: plot.hectares,
      coordinates: coordinates
    };
  }

  static async create(farmPlotData) {
    // Start a transaction
    const connection = await getPromisePool().getConnection();
    await connection.beginTransaction();
    
    try {
      // Generate plot ID if not provided
      const plotId = farmPlotData.plotId || await generatePlotID(farmPlotData.beneficiaryId);
      console.log('Generated plot ID:', plotId); // Debug log
      
      // Insert into farm_plots table
      const farmPlotSql = `INSERT INTO farm_plots (plot_id, beneficiary_id, hectares)
                   VALUES (?, ?, ?)`;
      const farmPlotParams = [
        plotId,
        farmPlotData.beneficiaryId,
        farmPlotData.hectares || null
      ];
      
      console.log('Inserting farm plot with params:', farmPlotParams); // Debug log
      const [farmPlotResult] = await connection.query(farmPlotSql, farmPlotParams);
      
      // Verify the farm plot insert was successful
      if (farmPlotResult.affectedRows !== 1) {
        throw new Error('Failed to insert farm plot');
      }
      
      // Insert coordinates if provided
      if (farmPlotData.coordinates && Array.isArray(farmPlotData.coordinates)) {
        console.log('Inserting coordinates:', farmPlotData.coordinates); // Debug log
        for (let i = 0; i < farmPlotData.coordinates.length; i++) {
          const coord = farmPlotData.coordinates[i];
          const coordSql = `INSERT INTO plot_coordinates (plot_id, latitude, longitude, elevation, point_order)
                    VALUES (?, ?, ?, ?, ?)`;
          const coordParams = [
            plotId,
            coord.lat,
            coord.lng,
            coord.elevation || null,
            i + 1
          ];
          
          const [coordResult] = await connection.query(coordSql, coordParams);
          
          // Verify each coordinate insert was successful
          if (coordResult.affectedRows !== 1) {
            throw new Error('Failed to insert coordinate');
          }
        }
      }
      
      // Commit the transaction
      await connection.commit();
      
      return plotId;
    } catch (error) {
      console.error('Error in FarmPlot.create:', error); // Debug log
      // Rollback the transaction in case of error
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  }

  static async update(id, farmPlotData) {
    // Start a transaction
    const connection = await getPromisePool().getConnection();
    await connection.beginTransaction();
    
    try {
      // Update farm_plots table
      const sql = `UPDATE farm_plots SET 
                   hectares = ?
                   WHERE plot_id = ?`;
      const params = [
        farmPlotData.hectares || null,
        id
      ];
      
      const [result] = await connection.query(sql, params);
      
      // If coordinates are provided, update them as well
      if (farmPlotData.coordinates && Array.isArray(farmPlotData.coordinates)) {
        // First delete existing coordinates
        await connection.query('DELETE FROM plot_coordinates WHERE plot_id = ?', [id]);
        
        // Then insert new coordinates
        for (let i = 0; i < farmPlotData.coordinates.length; i++) {
          const coord = farmPlotData.coordinates[i];
          const coordSql = `INSERT INTO plot_coordinates (plot_id, latitude, longitude, elevation, point_order)
                    VALUES (?, ?, ?, ?, ?)`;
          const coordParams = [
            id,
            coord.lat,
            coord.lng,
            coord.elevation || null,
            i + 1
          ];
          
          const [coordResult] = await connection.query(coordSql, coordParams);
          
          // Verify each coordinate insert was successful
          if (coordResult.affectedRows !== 1) {
            throw new Error('Failed to insert coordinate');
          }
        }
      }
      
      // Commit the transaction
      await connection.commit();
      
      return result.affectedRows > 0;
    } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  }

  static async delete(id) {
    // Start a transaction
    const connection = await getPromisePool().getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete coordinates first (foreign key constraint)
      await connection.query('DELETE FROM plot_coordinates WHERE plot_id = ?', [id]);
      
      // Then delete the farm plot
      const [result] = await connection.query('DELETE FROM farm_plots WHERE plot_id = ?', [id]);
      
      // Commit the transaction
      await connection.commit();
      
      return result.affectedRows > 0;
    } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  }

  static async findWithBeneficiaryDetails(id) {
    // First get the farm plot with beneficiary details
    const [plotRows] = await getPromisePool().query(
      `SELECT fp.plot_id AS id,
              fp.beneficiary_id AS beneficiaryId,
              fp.hectares,
              bd.first_name, bd.middle_name, bd.last_name,
              bd.purok, bd.barangay, bd.municipality, bd.province,
              bd.picture
       FROM farm_plots fp
       LEFT JOIN beneficiaries bd ON bd.beneficiary_id = fp.beneficiary_id
       WHERE fp.plot_id = ?`,
      [id]
    );
    
    if (!plotRows.length) return null;
    const plot = plotRows[0];
    
    // Get coordinates for this plot
    const [coordRows] = await getPromisePool().query(
      `SELECT latitude, longitude, elevation
       FROM plot_coordinates
       WHERE plot_id = ?
       ORDER BY point_order, coordinate_id`,
      [id]
    );
    
    const coordinates = coordRows.map(coord => ({
      lat: parseFloat(coord.latitude),
      lng: parseFloat(coord.longitude),
      elevation: coord.elevation
    }));
    
    return {
      id: plot.id,
      beneficiaryId: plot.beneficiaryId,
      hectares: plot.hectares,
      coordinates: coordinates,
      beneficiaryName: plot.first_name ? `${plot.first_name || ''} ${plot.middle_name ? plot.middle_name + ' ' : ''}${plot.last_name || ''}`.replace(/\s+/g, ' ').trim() : 'Unknown Beneficiary',
      address: plot.purok ? `${plot.purok || ''}, ${plot.barangay || ''}, ${plot.municipality || ''}, ${plot.province || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',') : 'No address',
      beneficiaryPicture: plot.picture ? `/uploads/${path.basename(plot.picture)}` : null
    };
  }
}

module.exports = FarmPlot;
