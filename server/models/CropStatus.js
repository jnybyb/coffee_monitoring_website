const { getPromisePool } = require('../config/database');
const path = require('path');

class CropStatus {
  static async findAll() {
    const [rows] = await getPromisePool().query(`
      SELECT cs.*, 
             bd.first_name, bd.middle_name, bd.last_name, bd.picture as beneficiary_picture
      FROM crop_survey_status cs
      JOIN beneficiaries bd ON bd.beneficiary_id = cs.beneficiary_id
      ORDER BY cs.survey_date DESC, cs.created_at DESC
    `);
    
    return rows.map(r => {
      const pictures = Array.isArray(r.pictures) ? r.pictures : (r.pictures ? JSON.parse(r.pictures) : []);
      
      return {
        id: r.id,
        surveyDate: r.survey_date,
        surveyer: r.surveyer,
        beneficiaryId: r.beneficiary_id,
        beneficiaryName: `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
        beneficiaryPicture: r.beneficiary_picture ? `/uploads/${path.basename(r.beneficiary_picture)}` : null,
        aliveCrops: r.alive_crops,
        deadCrops: r.dead_crops,
        plotId: r.plot_id || null,
        pictures: pictures
      };
    });
  }

  static async findById(id) {
    const [rows] = await getPromisePool().query(`
      SELECT cs.*, 
             bd.first_name, bd.middle_name, bd.last_name, bd.picture as beneficiary_picture
      FROM crop_survey_status cs
      JOIN beneficiaries bd ON bd.beneficiary_id = cs.beneficiary_id
      WHERE cs.id = ?
    `, [id]);
    
    if (!rows.length) return null;
    
    const r = rows[0];
    const pictures = Array.isArray(r.pictures) ? r.pictures : (r.pictures ? JSON.parse(r.pictures) : []);
    
    return {
      id: r.id,
      surveyDate: r.survey_date,
      surveyer: r.surveyer,
      beneficiaryId: r.beneficiary_id,
      beneficiaryName: `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      beneficiaryPicture: r.beneficiary_picture ? `/uploads/${path.basename(r.beneficiary_picture)}` : null,
      aliveCrops: r.alive_crops,
      deadCrops: r.dead_crops,
      plotId: r.plot_id || null,
      pictures: pictures
    };
  }

  static async create(cropStatusData, pictureFiles = []) {
    const files = pictureFiles.map(f => path.basename(f.path));
    
    const sql = `INSERT INTO crop_survey_status 
      (survey_date, surveyer, beneficiary_id, alive_crops, dead_crops, plot_id, pictures)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      cropStatusData.surveyDate,
      cropStatusData.surveyer,
      cropStatusData.beneficiaryId,
      parseInt(cropStatusData.aliveCrops),
      parseInt(cropStatusData.deadCrops || 0),
      cropStatusData.plotId || null,
      JSON.stringify(files)
    ];
    
    const [result] = await getPromisePool().query(sql, params);
    return result.insertId;
  }

  static async update(id, cropStatusData, pictureFiles = []) {
    const uploadedFiles = pictureFiles.map(f => path.basename(f.path));

    // Determine existing pictures to keep
    let existingPictures = [];
    if (cropStatusData.existingPictures) {
      try {
        const parsed = typeof cropStatusData.existingPictures === 'string'
          ? JSON.parse(cropStatusData.existingPictures)
          : cropStatusData.existingPictures;
        if (Array.isArray(parsed)) existingPictures = parsed.map(p => path.basename(p));
      } catch (_e) {
        existingPictures = [];
      }
    } else {
      // Fallback: fetch current pictures from DB if not explicitly provided
      const [rows] = await getPromisePool().query('SELECT pictures FROM crop_survey_status WHERE id = ?', [id]);
      if (rows && rows.length) {
        try {
          const parsed = Array.isArray(rows[0].pictures) ? rows[0].pictures : (rows[0].pictures ? JSON.parse(rows[0].pictures) : []);
          if (Array.isArray(parsed)) existingPictures = parsed.map(p => path.basename(p));
        } catch (_e) {
          existingPictures = [];
        }
      }
    }

    const finalPictures = [...existingPictures, ...uploadedFiles];

    const sql = `UPDATE crop_survey_status SET 
      survey_date = ?, surveyer = ?, beneficiary_id = ?, alive_crops = ?, dead_crops = ?, plot_id = ?, pictures = ?
      WHERE id = ?`;
    const params = [
      cropStatusData.surveyDate,
      cropStatusData.surveyer,
      cropStatusData.beneficiaryId,
      parseInt(cropStatusData.aliveCrops),
      parseInt(cropStatusData.deadCrops || 0),
      cropStatusData.plotId || null,
      JSON.stringify(finalPictures),
      id
    ];

    const [result] = await getPromisePool().query(sql, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await getPromisePool().query('DELETE FROM crop_survey_status WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = CropStatus;
