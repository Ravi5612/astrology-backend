
const { DataSource } = require('typeorm');
require('dotenv').config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    await dataSource.initialize();
    console.log('--- DATABASE SCHEMA CHECK ---');
    const result = await dataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profile_merchants'
      AND column_name IN ('bank_name', 'account_number', 'account_holder', 'ifsc');
    `);
    console.log('Found Columns:', JSON.stringify(result, null, 2));
    await dataSource.destroy();
  } catch (err) {
    console.error('Schema check failed:', err);
  }
}

checkSchema();
