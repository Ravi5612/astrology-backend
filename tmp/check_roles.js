const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_r94TzaWBnjVv@ep-wispy-sky-a1j6w3i2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function checkRoles() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM roles');
    console.log('Available Roles:');
    console.log(JSON.stringify(res.rows, null, 2));
    
    // Check if any user has 'merchant' role (by name)
    const merchantUsers = await client.query(`
      SELECT u.email, r.name 
      FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'merchant'
    `);
    console.log('Users with merchant role:');
    console.log(JSON.stringify(merchantUsers.rows, null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}
checkRoles();
