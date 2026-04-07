const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_r94TzaWBnjVv@ep-wispy-sky-a1j6w3i2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function seedMerchantRole() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    // Check if 'merchant' role already exists
    const checkRes = await client.query("SELECT * FROM roles WHERE name = 'merchant'");
    if (checkRes.rows.length === 0) {
      console.log("Seeding 'merchant' role...");
      await client.query("INSERT INTO roles (name, description) VALUES ('merchant', 'Store Owner / Service Provider')");
      console.log("Role 'merchant' seeded successfully.");
    } else {
      console.log("Role 'merchant' already exists.");
    }
    
  } catch (err) {
    console.error('Error seeding role:', err.message);
  } finally {
    await client.end();
  }
}
seedMerchantRole();
