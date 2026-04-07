const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_r94TzaWBnjVv@ep-wispy-sky-a1j6w3i2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function checkShops() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT count(*) FROM profile_merchants');
    console.log(`Total shops in database: ${res.rows[0].count}`);
    
    if (res.rows[0].count > 0) {
      const details = await client.query('SELECT id, "shopName", city, status FROM profile_merchants LIMIT 5');
      console.log('Sample shops:');
      console.table(details.rows);
    }
  } catch (err) {
    console.error('Error connecting to database:', err.message);
  } finally {
    await client.end();
  }
}

checkShops();
