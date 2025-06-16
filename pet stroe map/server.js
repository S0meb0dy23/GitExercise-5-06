import express from 'express';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

let db;
async function initDb() {
  db = await open({
    filename: path.join(__dirname, 'pet_tracker.db'),
    driver: sqlite3.Database
  });
}
initDb();

app.get('/locations', async (req, res) => {
  const rows = await db.all('SELECT * FROM locations');
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
