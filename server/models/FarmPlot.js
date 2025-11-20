const { getPromisePool } = require('../config/database');
const path = require('path');

class FarmPlot {
  static async findAll() {
    const [rows] = await getPromisePool().query(
      `SELECT fp.id,
              fp.beneficiary_id AS beneficiaryId,
              fp.plot_number AS plotNumber,
              fp.color,
              fp.coordinates,
              bd.first_name, bd.middle_name, bd.last_name,
              bd.purok, bd.barangay, bd.municipality, bd.province,
              bd.picture
       FROM farm_plots fp
       JOIN beneficiaries bd ON bd.beneficiary_id = fp.beneficiary_id
       ORDER BY fp.created_at DESC`
    );

    return rows.map(r => ({
      id: r.id,
      beneficiaryId: r.beneficiaryId,
      plotNumber: r.plotNumber,
      color: r.color || '#2d7c4a',
      coordinates: Array.isArray(r.coordinates) ? r.coordinates : JSON.parse(r.coordinates || '[]'),
      beneficiaryName: `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      address: `${r.purok || ''}, ${r.barangay || ''}, ${r.municipality || ''}, ${r.province || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ','),
      beneficiaryPicture: r.picture ? `/uploads/${path.basename(r.picture)}` : null
    }));
  }

  static async findById(id) {
    const [rows] = await getPromisePool().query(
      'SELECT * FROM farm_plots WHERE id = ?',
      [id]
    );
    
    if (!rows.length) return null;
    
    const r = rows[0];
    return {
      id: r.id,
      beneficiaryId: r.beneficiary_id,
      plotNumber: r.plot_number,
      color: r.color || '#2d7c4a',
      coordinates: Array.isArray(r.coordinates) ? r.coordinates : JSON.parse(r.coordinates || '[]')
    };
  }

  static async create(farmPlotData) {
    const sql = `INSERT INTO farm_plots (beneficiary_id, plot_number, color, coordinates)
                 VALUES (?, ?, ?, ?)`;
    const params = [
      farmPlotData.beneficiaryId,
      farmPlotData.plotNumber || 'Plot',
      farmPlotData.color || '#2d7c4a',
      JSON.stringify(farmPlotData.coordinates || [])
    ];
    
    const [result] = await getPromisePool().query(sql, params);
    return result.insertId;
  }

  static async update(id, farmPlotData) {
    const sql = `UPDATE farm_plots SET 
                 beneficiary_id = ?, plot_number = ?, color = ?, coordinates = ?
                 WHERE id = ?`;
    const params = [
      farmPlotData.beneficiaryId,
      farmPlotData.plotNumber || 'Plot',
      farmPlotData.color || '#2d7c4a',
      JSON.stringify(farmPlotData.coordinates || []),
      id
    ];
    
    const [result] = await getPromisePool().query(sql, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await getPromisePool().query('DELETE FROM farm_plots WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findWithBeneficiaryDetails(id) {
    const [rows] = await getPromisePool().query(
      `SELECT fp.id,
              fp.beneficiary_id AS beneficiaryId,
              fp.plot_number AS plotNumber,
              fp.color,
              fp.coordinates,
              bd.first_name, bd.middle_name, bd.last_name,
              bd.purok, bd.barangay, bd.municipality, bd.province,
              bd.picture
       FROM farm_plots fp
       JOIN beneficiaries bd ON bd.beneficiary_id = fp.beneficiary_id
       WHERE fp.id = ?`,
      [id]
    );
    
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      beneficiaryId: r.beneficiaryId,
      plotNumber: r.plotNumber,
      color: r.color || '#2d7c4a',
      coordinates: Array.isArray(r.coordinates) ? r.coordinates : JSON.parse(r.coordinates || '[]'),
      beneficiaryName: `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      address: `${r.purok || ''}, ${r.barangay || ''}, ${r.municipality || ''}, ${r.province || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ','),
      beneficiaryPicture: r.picture ? `/uploads/${path.basename(r.picture)}` : null
    };
  }
}

module.exports = FarmPlot;
