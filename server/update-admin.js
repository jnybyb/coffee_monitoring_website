const bcrypt = require('bcryptjs');
const { initializeDatabase, getPromisePool } = require('./config/database');

const updateAdminCredentials = async () => {
  try {
    await initializeDatabase();
    
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log(`Updating admin credentials for username: ${username}`);
    
    const hash = await bcrypt.hash(password, 10);
    
    // Update existing admin or insert if not exists
    const [result] = await getPromisePool().query(
      'UPDATE admins SET username = ?, password_hash = ? WHERE admin_id = 1',
      [username, hash]
    );
    
    if (result.affectedRows > 0) {
      console.log('✓ Admin credentials updated successfully!');
    } else {
      // If no rows affected, insert new admin
      await getPromisePool().query(
        'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)',
        [username, hash, 'admin']
      );
      console.log('✓ Admin user created successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin credentials:', error.message);
    process.exit(1);
  }
};

updateAdminCredentials();
