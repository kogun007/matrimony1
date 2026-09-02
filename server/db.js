/**
 * PostgreSQL Database Connection, Schema Migration & Seeding
 */
const path = require('path');
const fs = require('fs');
const { JAIN_PROFILES } = require('./seeds/jain_profiles');

let dbClient = null;
let dbType = 'pglite'; // 'pg' (native server) or 'pglite' (embedded postgres 16)

async function getDb() {
  if (dbClient) return dbClient;

  // Check if standard PostgreSQL connection string is provided in env
  if (process.env.DATABASE_URL) {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      // Test query
      await pool.query('SELECT 1');
      dbClient = pool;
      dbType = 'pg-server';
      console.log(' connected to external PostgreSQL server via DATABASE_URL');
      return dbClient;
    } catch (err) {
      console.warn(' External PostgreSQL connection failed, falling back to embedded PostgreSQL 16 (PGlite):', err.message);
    }
  }

  // Use Embedded PostgreSQL 16 (PGlite with persistent storage)
  const { PGlite } = require('@electric-sql/pglite');
  const dataDir = path.join(__dirname, 'postgres_data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pglite = new PGlite(dataDir);
  await pglite.waitReady;
  dbClient = pglite;
  dbType = 'pglite-postgres16';
  console.log(' Connected to PostgreSQL 16 Engine at:', dataDir);
  return dbClient;
}

// Helper query function that normalizes pg and pglite responses
async function query(sql, params = []) {
  const db = await getDb();
  if (dbType === 'pg-server') {
    return await db.query(sql, params);
  } else {
    // PGlite query
    const res = await db.query(sql, params);
    return {
      rows: res.rows || [],
      rowCount: (res.rows && res.rows.length) || 0
    };
  }
}

// Initialize PostgreSQL Database Schema & Seed Data
async function initDatabase() {
  await getDb();

  console.log('🔄 Initializing PostgreSQL schema for Indian Jain Matrimony candidates...');

  // Create candidates table in PostgreSQL
  await query(`
    CREATE TABLE IF NOT EXISTS candidates (
      id VARCHAR(30) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      gender VARCHAR(10) NOT NULL,
      age INT NOT NULL,
      height NUMERIC(3, 1) NOT NULL,
      religion VARCHAR(50) DEFAULT 'Jain',
      sub_caste VARCHAR(80) NOT NULL,
      gothram VARCHAR(80),
      education VARCHAR(120) NOT NULL,
      occupation VARCHAR(120) NOT NULL,
      company VARCHAR(100),
      annual_income VARCHAR(50),
      city VARCHAR(80) NOT NULL,
      state VARCHAR(80) NOT NULL,
      mother_tongue VARCHAR(50) NOT NULL,
      marital_status VARCHAR(50) DEFAULT 'Never Married',
      diet VARCHAR(80) DEFAULT 'Pure Jain Vegetarian',
      match_score INT DEFAULT 95,
      is_verified BOOLEAN DEFAULT TRUE,
      is_premium BOOLEAN DEFAULT TRUE,
      photo_url TEXT NOT NULL,
      about_me TEXT NOT NULL,
      interests TEXT DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create PostgreSQL Indexes for high-speed candidate filtering
  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_age ON candidates(age)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_height ON candidates(height)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_sub_caste ON candidates(sub_caste)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_city ON candidates(city)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(match_score)`);

  // Seed Indian Jain Profiles if table is empty
  const countRes = await query('SELECT COUNT(*) as count FROM candidates');
  const existingCount = parseInt(countRes.rows[0].count, 10);

  if (existingCount === 0) {
    console.log(`🌱 Seeding ${JAIN_PROFILES.length} authentic Indian Jain candidate profiles into PostgreSQL...`);
    
    for (const p of JAIN_PROFILES) {
      await query(`
        INSERT INTO candidates (
          id, name, gender, age, height, religion, sub_caste, gothram,
          education, occupation, company, annual_income, city, state,
          mother_tongue, marital_status, diet, match_score, is_verified,
          is_premium, photo_url, about_me, interests
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23
        ) ON CONFLICT (id) DO NOTHING
      `, [
        p.id, p.name, p.gender, p.age, p.height, p.religion, p.sub_caste, p.gothram,
        p.education, p.occupation, p.company, p.annual_income, p.city, p.state,
        p.mother_tongue, p.marital_status, p.diet, p.match_score, p.is_verified,
        p.is_premium, p.photo_url, p.about_me, p.interests
      ]);
    }
    console.log('✅ PostgreSQL seeding completed successfully!');
  } else {
    console.log(`ℹ️ PostgreSQL candidates table already has ${existingCount} records.`);
  }
}

module.exports = {
  getDb,
  query,
  initDatabase,
  getDbType: () => dbType
};
