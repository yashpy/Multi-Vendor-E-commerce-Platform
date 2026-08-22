/* Runs all .sql files in db/migrations against DATABASE_URL, in filename order. */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const dir = path.join(__dirname, '..', 'db', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`Applying migration: ${file}`);
    await client.query(sql);
  }

  await client.end();
  console.log('Migrations complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
