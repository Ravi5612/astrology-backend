const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_r94TzaWBnjVv@ep-wispy-sky-a1j6w3i2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function debugUser() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    const userCount = await client.query('SELECT count(*) FROM users');
    console.log(`Total users: ${userCount.rows[0].count}`);
    
    if (userCount.rows[0].count > 0) {
      const users = await client.query('SELECT id, email, name, uid FROM users LIMIT 5');
      console.log('Sample users:');
      console.table(users.rows);
      
      const oauth = await client.query('SELECT user_id, provider FROM oauth_accounts LIMIT 5');
      console.log('OAuth Accounts:');
      console.table(oauth.rows);
      
      const roles = await client.query(`
        SELECT u.email, r.name as role_name 
        FROM users u 
        JOIN user_roles ur ON u.id = ur.user_id 
        JOIN roles r ON ur.role_id = r.id
      `);
      console.log('User Roles:');
      console.table(roles.rows);
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
