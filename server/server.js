/**
 * Express REST API Server for Jain Matrimony Platform (PostgreSQL)
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query, initDatabase, getDbType } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. Health & Database Engine Status
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await query('SELECT NOW() as current_time, COUNT(*) as candidate_count FROM candidates');
    res.json({
      status: 'healthy',
      database: 'PostgreSQL 16',
      dbType: getDbType(),
      candidate_count: parseInt(dbRes.rows[0].candidate_count, 10),
      timestamp: dbRes.rows[0].current_time
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. Fetch Candidates with Dynamic PostgreSQL Filtering
// Supports: id, query (name/id), age_max, age_min, height_min, height_max, sub_caste, city, marital_status, gender, verified_only, premium_only, sort
app.get('/api/candidates', async (req, res) => {
  try {
    const {
      id,
      query: searchQuery,
      age_max,
      age_min,
      height_min,
      height_max,
      sub_caste,
      city,
      marital_status,
      gender,
      verified_only,
      premium_only,
      sort
    } = req.query;

    let sql = `
      SELECT 
        id, name, gender, age, height, religion, sub_caste, gothram,
        education, occupation, company, annual_income, city, state,
        mother_tongue, marital_status, diet, match_score, is_verified,
        is_premium, photo_url, about_me, interests, created_at
      FROM candidates
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    // Filter by Candidate ID (exact or partial)
    if (id) {
      sql += ` AND LOWER(id) LIKE LOWER($${paramIdx})`;
      params.push(`%${id}%`);
      paramIdx++;
    }

    // General Search query (ID, Name, Profession, City)
    if (searchQuery) {
      sql += ` AND (
        LOWER(id) LIKE LOWER($${paramIdx}) OR 
        LOWER(name) LIKE LOWER($${paramIdx}) OR 
        LOWER(occupation) LIKE LOWER($${paramIdx}) OR 
        LOWER(city) LIKE LOWER($${paramIdx})
      )`;
      params.push(`%${searchQuery}%`);
      paramIdx++;
    }

    // Age Filter
    if (age_min) {
      sql += ` AND age >= $${paramIdx}`;
      params.push(parseInt(age_min, 10));
      paramIdx++;
    }
    if (age_max) {
      sql += ` AND age <= $${paramIdx}`;
      params.push(parseInt(age_max, 10));
      paramIdx++;
    }

    // Height Filter
    if (height_min) {
      sql += ` AND height >= $${paramIdx}`;
      params.push(parseFloat(height_min));
      paramIdx++;
    }
    if (height_max) {
      sql += ` AND height <= $${paramIdx}`;
      params.push(parseFloat(height_max));
      paramIdx++;
    }

    // Sub-caste Filter
    if (sub_caste) {
      sql += ` AND LOWER(sub_caste) = LOWER($${paramIdx})`;
      params.push(sub_caste);
      paramIdx++;
    }

    // City Filter
    if (city) {
      sql += ` AND LOWER(city) = LOWER($${paramIdx})`;
      params.push(city);
      paramIdx++;
    }

    // Gender Filter
    if (gender) {
      sql += ` AND LOWER(gender) = LOWER($${paramIdx})`;
      params.push(gender);
      paramIdx++;
    }

    // Marital Status
    if (marital_status) {
      sql += ` AND LOWER(marital_status) = LOWER($${paramIdx})`;
      params.push(marital_status);
      paramIdx++;
    }

    // Verified Only
    if (verified_only === 'true') {
      sql += ` AND is_verified = TRUE`;
    }

    // Premium Only
    if (premium_only === 'true') {
      sql += ` AND is_premium = TRUE`;
    }

    // Sorting
    if (sort === 'score_desc' || sort === 'score') {
      sql += ` ORDER BY match_score DESC, created_at DESC`;
    } else if (sort === 'age_asc') {
      sql += ` ORDER BY age ASC`;
    } else if (sort === 'age_desc') {
      sql += ` ORDER BY age DESC`;
    } else if (sort === 'height_desc') {
      sql += ` ORDER BY height DESC`;
    } else if (sort === 'name_asc' || sort === 'name') {
      sql += ` ORDER BY name ASC`;
    } else {
      sql += ` ORDER BY match_score DESC, id ASC`;
    }

    const result = await query(sql, params);
    
    // Parse interests JSON if needed
    const formatted = result.rows.map(row => ({
      ...row,
      height: parseFloat(row.height),
      interests: typeof row.interests === 'string' ? JSON.parse(row.interests || '[]') : row.interests
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Fetch Single Candidate by ID
app.get('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM candidates WHERE LOWER(id) = LOWER($1)', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Candidate with ID '${id}' not found` });
    }

    const candidate = result.rows[0];
    candidate.height = parseFloat(candidate.height);
    candidate.interests = typeof candidate.interests === 'string' ? JSON.parse(candidate.interests || '[]') : candidate.interests;

    res.json({ success: true, data: candidate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Fetch Sub-Castes List for Jain Community
app.get('/api/subcastes', async (req, res) => {
  try {
    const result = await query(`
      SELECT sub_caste, COUNT(*) as count 
      FROM candidates 
      GROUP BY sub_caste 
      ORDER BY count DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Fetch Aggregate Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalRes = await query('SELECT COUNT(*) as total, AVG(match_score) as avg_score FROM candidates');
    const verifiedRes = await query('SELECT COUNT(*) as verified FROM candidates WHERE is_verified = TRUE');
    const citiesRes = await query('SELECT city, COUNT(*) as count FROM candidates GROUP BY city ORDER BY count DESC LIMIT 5');

    res.json({
      success: true,
      total_candidates: parseInt(totalRes.rows[0].total, 10),
      avg_compatibility: Math.round(parseFloat(totalRes.rows[0].avg_score)),
      verified_candidates: parseInt(verifiedRes.rows[0].verified, 10),
      top_cities: citiesRes.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Create / Register a New Jain Candidate Profile
app.post('/api/candidates', async (req, res) => {
  try {
    const {
      name,
      gender,
      age,
      height,
      sub_caste,
      gothram,
      education,
      occupation,
      company,
      annual_income,
      city,
      state,
      mother_tongue,
      marital_status,
      diet,
      photo_url,
      about_me,
      interests
    } = req.body;

    if (!name || !age || !height || !sub_caste) {
      return res.status(400).json({ success: false, message: 'Name, age, height, and sub_caste are required fields.' });
    }

    // Generate unique Jain ID
    const countRes = await query('SELECT COUNT(*) as count FROM candidates');
    const nextNum = parseInt(countRes.rows[0].count, 10) + 1001;
    const newId = `JAIN-${nextNum}`;

    const sql = `
      INSERT INTO candidates (
        id, name, gender, age, height, religion, sub_caste, gothram,
        education, occupation, company, annual_income, city, state,
        mother_tongue, marital_status, diet, match_score, is_verified,
        is_premium, photo_url, about_me, interests
      ) VALUES (
        $1, $2, $3, $4, $5, 'Jain', $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18,
        $19, $20, $21, $22
      ) RETURNING *
    `;

    const params = [
      newId,
      name,
      gender || 'Female',
      parseInt(age, 10),
      parseFloat(height),
      sub_caste,
      gothram || 'Kashyapa',
      education || 'Graduate',
      occupation || 'Professional',
      company || 'Self-Employed',
      annual_income || '₹25 - 35 LPA',
      city || 'Mumbai',
      state || 'Maharashtra',
      mother_tongue || 'Gujarati',
      marital_status || 'Never Married',
      diet || 'Pure Jain Vegetarian',
      95,
      true,
      true,
      photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80',
      about_me || 'Looking for an understanding life partner with traditional Jain values.',
      JSON.stringify(interests || ["Jain Values", "Reading", "Travel"])
    ];

    const result = await query(sql, params);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server and Initialize PostgreSQL
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Jain Matrimony PostgreSQL API Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

start();
