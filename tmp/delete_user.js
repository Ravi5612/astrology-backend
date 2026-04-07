const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_r94TzaWBnjVv@ep-wispy-sky-a1j6w3i2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function deleteUserByEmail() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const email = 'r66448251@gmail.com';
    
    console.log(`Searching for user with email: ${email}`);
    
    const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.log('User not found.');
      return;
    }
    const userId = userRes.rows[0].id;
    console.log(`User ID found: ${userId}`);

    // Start transaction
    await client.query('BEGIN');

    // Delete from related tables manually to avoid FK constraint issues if not cascaded
    await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM oauth_accounts WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM profile_merchants WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM profile_experts WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM profile_clients WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    
    // Finally delete from users
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');
    console.log(`Successfully deleted user ${email} and all related records.`);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', err.message);
  } finally {
    await client.end();
  }
}

deleteUserByEmail();
