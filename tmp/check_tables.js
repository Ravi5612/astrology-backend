const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_r94TzaWBnjVv@ep-wispy-sky-a1j6w3i2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function listTables() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in public schema:');
    console.log(res.rows.map(r => r.table_name).join(', '));
    
    const merchantCount = await client.query('SELECT count(*) FROM profile_merchants');
    console.log(`Total records in profile_merchants: ${merchantCount.rows[0].count}`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}
listTables();
