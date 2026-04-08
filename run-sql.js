import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

// **********************************************************************************
// IMPORTANT: Please replace [YOUR-PASSWORD] with your actual database password.
// **********************************************************************************
const connectionString = 'postgresql://postgres:[YOUR-PASSWORD]@db.kvfockaztqldgdobpntf.supabase.co:5432/postgres';

const sql = fs.readFileSync('c:/Users/VIKK/Downloads/Upendo/supabase/migrations/20260320162021_consolidated_migration.sql').toString();

async function runSql() {
  console.log('Connecting to the database...');
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connection successful. Executing SQL script...');
    await client.query(sql);
    console.log('Database reset and setup was successful!');
  } catch (err) {
    console.error('An error occurred while running the SQL script:', err);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

runSql();
