const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_r94TzaWBnjVv@ep-wispy-sky-a1j6w3i2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function verifyRegistration() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const email = 'tk0159911@gmail.com';
    
    console.log(`Checking registration for: ${email}`);
    
    const userRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.log('User not found.');
      return;
    }
    const user = userRes.rows[0];
    console.log('User found:', JSON.stringify(user, null, 2));
    
    const rolesRes = await client.query(`
      SELECT r.name 
      FROM roles r 
      JOIN user_roles ur ON r.id = ur.role_id 
      WHERE ur.user_id = $1
    `, [user.id]);
    console.log('Roles:', rolesRes.rows.map(r => r.name).join(', '));
    
    const profileRes = await client.query('SELECT * FROM profile_merchants WHERE user_id = $1', [user.id]);
    if (profileRes.rows.length > 0) {
      console.log('ProfileMerchant found:', JSON.stringify(profileRes.rows[0], null, 2));
    } else {
      console.log('ProfileMerchant NOT found.');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}
verifyRegistration();
