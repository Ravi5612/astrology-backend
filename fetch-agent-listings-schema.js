const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://aibdb_user:biz1M9QB2i54sKmr56zJ492jhmIXPWhO@dpg-d67hmlbuibrs73cltmn0-a.singapore-postgres.render.com/aibdb?ssl=true'
});

async function run() {
    await client.connect();
    const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'agent_listings'
  `);
    console.log(res.rows);
    await client.end();
}

run().catch(console.error);
