import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root', // replace with your MySQL username
  password: '', // replace with your MySQL password
  database: 'pet_tracker'
};

async function initDatabase() {
  // Read the SQL schema file
  const schema = fs.readFileSync(path.join(__dirname, 'init_db.sql'), 'utf8');
  
  // Create a connection
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Split the schema into individual statements
    const statements = schema.split(';').filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log("Database initialized with KL/Selangor locations.");
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

initDatabase();
