import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'pet_tracker.db');

async function initDatabase() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const schema = fs.readFileSync(path.join(__dirname, 'init_db.sql'), 'utf8');
  await db.exec(schema);

  console.log("Database initialized with KL/Selangor locations.");
}

initDatabase();
