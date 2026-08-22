/* Loads db/seed.sql against DATABASE_URL. */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'seed.sql'), 'utf8');
  await client.query(sql);

  await client.end();
  console.log('Seed data loaded.');
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
