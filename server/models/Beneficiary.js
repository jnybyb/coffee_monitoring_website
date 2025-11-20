const { getPromisePool } = require('../config/database');
const path = require('path');

class Beneficiary {
  static async findAll() {
    const [rows] = await getPromisePool().query('SELECT * FROM beneficiaries ORDER BY created_at ASC');
    return rows.map(r => {
      const birth = r.birth_date instanceof Date ? r.birth_date.toISOString().slice(0, 10) : r.birth_date;
      return {
        id: r.id,
        beneficiaryId: r.beneficiary_id,
        firstName: r.first_name,
        middleName: r.middle_name,
        lastName: r.last_name,
        purok: r.purok,
        barangay: r.barangay,
        municipality: r.municipality,
        province: r.province,
        gender: r.gender,
        birthDate: birth,
        maritalStatus: r.marital_status,
        cellphone: r.cellphone_number,
        age: r.age,
        picture: r.picture ? `/uploads/${path.basename(r.picture)}` : null
      };
    });
  }

  static async findById(id) {
    const [rows] = await getPromisePool().query('SELECT * FROM beneficiaries WHERE id = ?', [id]);
    if (!rows.length) return null;
    
    const r = rows[0];
    const birth = r.birth_date instanceof Date ? r.birth_date.toISOString().slice(0, 10) : r.birth_date;
    return {
      id: r.id,
      beneficiaryId: r.beneficiary_id,
      firstName: r.first_name,
      middleName: r.middle_name,
      lastName: r.last_name,
      purok: r.purok,
      barangay: r.barangay,
      municipality: r.municipality,
      province: r.province,
      gender: r.gender,
      birthDate: birth,
      maritalStatus: r.marital_status,
      cellphone: r.cellphone_number,
      age: r.age,
      picture: r.picture ? `/uploads/${path.basename(r.picture)}` : null
    };
  }

  static async create(beneficiaryData, picturePath = null) {
    // Validate beneficiary_id length before inserting
    if (beneficiaryData.beneficiaryId && beneficiaryData.beneficiaryId.length > 20) {
      throw new Error(`Beneficiary ID "${beneficiaryData.beneficiaryId}" is too long (${beneficiaryData.beneficiaryId.length} characters). Maximum allowed is 20.`);
    }
    
    const sql = `INSERT INTO beneficiaries 
      (beneficiary_id, first_name, middle_name, last_name, purok, barangay, municipality, province, gender, birth_date, age, marital_status, cellphone_number, picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      beneficiaryData.beneficiaryId,
      beneficiaryData.firstName,
      beneficiaryData.middleName || null,
      beneficiaryData.lastName,
      beneficiaryData.purok,
      beneficiaryData.barangay,
      beneficiaryData.municipality,
      beneficiaryData.province,
      beneficiaryData.gender,
      beneficiaryData.birthDate,
      beneficiaryData.age,
      beneficiaryData.maritalStatus,
      beneficiaryData.cellphoneNumber || beneficiaryData.cellphone,  // Support both field names
      picturePath
    ];
    
    const [result] = await getPromisePool().query(sql, params);
    return { id: result.insertId, beneficiaryId: beneficiaryData.beneficiaryId };
  }

  static async update(id, beneficiaryData, picturePath = null) {
    const sql = `UPDATE beneficiaries SET 
      first_name = ?, middle_name = ?, last_name = ?, purok = ?, barangay = ?, municipality = ?, province = ?, 
      gender = ?, birth_date = ?, age = ?, marital_status = ?, cellphone_number = ?${picturePath ? ', picture = ?' : ''}
      WHERE id = ?`;
    
    const params = [
      beneficiaryData.firstName,
      beneficiaryData.middleName || null,
      beneficiaryData.lastName,
      beneficiaryData.purok,
      beneficiaryData.barangay,
      beneficiaryData.municipality,
      beneficiaryData.province,
      beneficiaryData.gender,
      beneficiaryData.birthDate,
      beneficiaryData.age,
      beneficiaryData.maritalStatus,
      beneficiaryData.cellphoneNumber || beneficiaryData.cellphone,  // Support both field names
      ...(picturePath ? [picturePath] : []),
      id
    ];
    
    const [result] = await getPromisePool().query(sql, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await getPromisePool().query('DELETE FROM beneficiaries WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findByBeneficiaryId(beneficiaryId) {
    const [rows] = await getPromisePool().query('SELECT * FROM beneficiaries WHERE beneficiary_id = ?', [beneficiaryId]);
    if (!rows.length) return null;
    
    const r = rows[0];
    const birth = r.birth_date instanceof Date ? r.birth_date.toISOString().slice(0, 10) : r.birth_date;
    return {
      id: r.id,
      beneficiaryId: r.beneficiary_id,
      firstName: r.first_name,
      middleName: r.middle_name,
      lastName: r.last_name,
      purok: r.purok,
      barangay: r.barangay,
      municipality: r.municipality,
      province: r.province,
      gender: r.gender,
      birthDate: birth,
      maritalStatus: r.marital_status,
      cellphone: r.cellphone_number,
      age: r.age,
      picture: r.picture ? `/uploads/${path.basename(r.picture)}` : null
    };
  }
}

module.exports = Beneficiary;