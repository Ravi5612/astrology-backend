const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_r94TzaWBnjVv@ep-wispy-sky-a1j6w3i2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function fixUserToMerchant() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const email = 'tk0159911@gmail.com';
    
    // 1. Get User ID
    const userRes = await client.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.log('User not found.');
      return;
    }
    const userId = userRes.rows[0].id;
    const userName = userRes.rows[0].name;
    
    // 2. Get Role IDs
    const rolesRes = await client.query("SELECT id, name FROM roles WHERE name IN ('expert', 'merchant')");
    const expertRoleId = rolesRes.rows.find(r => r.name === 'expert')?.id;
    const merchantRoleId = rolesRes.rows.find(r => r.name === 'merchant')?.id;
    
    if (!merchantRoleId) {
      console.log("Error: 'merchant' role not found in database.");
      return;
    }
    
    // 3. Remove expert role and add merchant role
    if (expertRoleId) {
      await client.query('DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2', [userId, expertRoleId]);
      console.log('Expert role removed.');
    }
    
    // Check if merchant role already linked
    const linkedRes = await client.query('SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2', [userId, merchantRoleId]);
    if (linkedRes.rows.length === 0) {
      await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, merchantRoleId]);
      console.log('Merchant role added.');
    }
    
    // 4. Create ProfileMerchant
    const profileRes = await client.query('SELECT * FROM profile_merchants WHERE user_id = $1', [userId]);
    if (profileRes.rows.length === 0) {
      await client.query(`
        INSERT INTO profile_merchants (user_id, "shopName", status, "kycStatus", created_at, updated_at, is_trusted, rating, review_count) 
        VALUES ($1, $2, 'active', 'active', NOW(), NOW(), true, 0, 0)
      `, [userId, userName || 'AIB Store']);
      console.log('ProfileMerchant created and activated!');
    } else {
      console.log('ProfileMerchant already exists, updating status to active...');
      await client.query("UPDATE profile_merchants SET status = 'active' WHERE user_id = $1", [userId]);
    }
    
    console.log('SUCCESS: User fixed to Merchant!');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}
fixUserToMerchant();
