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
      gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
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
      phone VARCHAR(30),
      email VARCHAR(100),
      guardian_contact VARCHAR(150),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure contact columns exist on already created table
  try {
    await query(`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`);
    await query(`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS email VARCHAR(100)`);
    await query(`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS guardian_contact VARCHAR(150)`);
    // Enforce strictly only two genders ('Male' and 'Female')
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_candidates_two_genders'
        ) THEN
          ALTER TABLE candidates ADD CONSTRAINT chk_candidates_two_genders CHECK (gender IN ('Male', 'Female'));
        END IF;
      END $$;
    `);
  } catch (err) {
    console.warn('Column/Constraint alteration note:', err.message);
  }

  // Create user profile_views table for tracking profile view quotas (limit: 75 unique views per user)
  await query(`
    CREATE TABLE IF NOT EXISTS profile_views (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      candidate_id VARCHAR(30) NOT NULL,
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT profile_views_user_candidate_unique UNIQUE (user_id, candidate_id)
    );
  `);

  // Deduplicate and enforce unique constraint so viewing the same profile repeatedly does not increment views
  try {
    await query(`
      DELETE FROM profile_views a USING profile_views b
      WHERE a.id > b.id AND a.user_id = b.user_id AND LOWER(a.candidate_id) = LOWER(b.candidate_id);
    `);
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'profile_views_user_candidate_unique'
        ) THEN
          ALTER TABLE profile_views ADD CONSTRAINT profile_views_user_candidate_unique UNIQUE (user_id, candidate_id);
        END IF;
      END $$;
    `);
  } catch (err) {
    console.warn('profile_views constraint note:', err.message);
  }

  // Create PostgreSQL Indexes for high-speed candidate filtering & view lookups
  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_age ON candidates(age)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_height ON candidates(height)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_sub_caste ON candidates(sub_caste)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_city ON candidates(city)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(match_score)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_profile_views_user ON profile_views(user_id)`);

  // Create user_accounts table for tracking profile creation date and 3-month validity limit
  await query(`
    CREATE TABLE IF NOT EXISTS user_accounts (
      user_id VARCHAR(100) PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '3 months'),
      is_active BOOLEAN DEFAULT FALSE
    );
  `);
  try {
    await query(`ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '3 months')`);
    await query(`ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE`);
    await query(`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);
  } catch (e) {}
  await query(`CREATE INDEX IF NOT EXISTS idx_user_accounts_user ON user_accounts(user_id)`);

  // Create user_photos table for saving photos directly in database
  await query(`
    CREATE TABLE IF NOT EXISTS user_photos (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      photo_data TEXT NOT NULL,
      caption VARCHAR(255),
      mime_type VARCHAR(50) DEFAULT 'image/jpeg',
      is_primary BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create user_biodata table for storing user-submitted candidate biodata
  await query(`
    CREATE TABLE IF NOT EXISTS user_biodata (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) UNIQUE NOT NULL,
      full_name VARCHAR(120),
      gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
      dob VARCHAR(30),
      marital_status VARCHAR(50),
      mother_tongue VARCHAR(50),
      diet VARCHAR(80),
      location VARCHAR(120),
      about_me TEXT,
      education VARCHAR(150),
      college VARCHAR(150),
      occupation VARCHAR(150),
      company VARCHAR(120),
      annual_income VARCHAR(60),
      rashi VARCHAR(80),
      nakshatra VARCHAR(80),
      gothram VARCHAR(80),
      manglik VARCHAR(50),
      pref_age VARCHAR(50),
      pref_height VARCHAR(50),
      pref_education VARCHAR(150),
      pref_locations VARCHAR(150),
      photo_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_user_photos_user ON user_photos(user_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_user_biodata_user ON user_biodata(user_id)`);

  // Seed or Update Indian Jain Profiles
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
          is_premium, photo_url, about_me, interests, phone, email, guardian_contact
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26
        ) ON CONFLICT (id) DO NOTHING
      `, [
        p.id, p.name, p.gender, p.age, p.height, p.religion, p.sub_caste, p.gothram,
        p.education, p.occupation, p.company, p.annual_income, p.city, p.state,
        p.mother_tongue, p.marital_status, p.diet, p.match_score, p.is_verified,
        p.is_premium, p.photo_url, p.about_me, p.interests,
        p.phone, p.email, p.guardian_contact
      ]);
    }
    console.log('✅ PostgreSQL seeding completed successfully!');
  } else {
    console.log(`ℹ️ Updating contact details for ${existingCount} candidates...`);
    for (const p of JAIN_PROFILES) {
      await query(`
        UPDATE candidates 
        SET phone = $1, email = $2, guardian_contact = $3 
        WHERE id = $4
      `, [p.phone, p.email, p.guardian_contact, p.id]);
    }
    console.log(`✅ Candidates contact details synchronized.`);
  }
}

module.exports = {
  getDb,
  query,
  initDatabase,
  getDbType: () => dbType
};
