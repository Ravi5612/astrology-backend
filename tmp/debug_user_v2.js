const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_r94TzaWBnjVv@ep-wispy-sky-a1j6w3i2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function debugUser() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    const userCount = await client.query('SELECT count(*) FROM users');
    const uCount = userCount.rows[0].count;
    console.log(`Total users: ${uCount}`);
    
    if (uCount > 0) {
      const users = await client.query('SELECT id, email, name FROM users');
      console.log('Users:');
      console.log(JSON.stringify(users.rows, null, 2));
      
      const roles = await client.query(`
        SELECT u.email, r.name as role_name 
        FROM users u 
        JOIN user_roles ur ON u.id = ur.user_id 
        JOIN roles r ON ur.role_id = r.id
      `);
      console.log('User Roles:');
      console.log(JSON.stringify(roles.rows, null, 2));
    }
    
    const merchantCount = await client.query('SELECT count(*) FROM profile_merchants');
    console.log(`Total profile_merchants: ${merchantCount.rows[0].count}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}
debugUser();
