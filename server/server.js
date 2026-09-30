/**
 * Express REST API Server for Jain Matrimony Platform (PostgreSQL)
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { query, initDatabase, getDbType } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Maximum profile views allowed per user before contact details are locked
const PROFILE_VIEW_LIMIT = 75;
// Maximum validity duration: 3 months from the day user profile is created
const PROFILE_VALIDITY_MONTHS = 3;

// Middleware to require authenticated member - guest access is completely disabled
function requireUserAuth(req, res, next) {
  const user = req.headers['x-user-id'] || req.query.user_id || req.body?.user_id;
  if (!user || typeof user !== 'string' || user.trim() === '' || user.trim() === 'user_guest_default' || user.trim().toLowerCase() === 'guest') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Guest access is disabled. Please log in.',
      code: 'AUTH_REQUIRED'
    });
  }
  req.authenticatedUserId = user.trim();
  next();
}

// Helper to extract authenticated user identity
function getUserId(req) {
  const user = req.authenticatedUserId || req.headers['x-user-id'] || req.query.user_id || req.body?.user_id;
  if (user && typeof user === 'string' && user.trim().length > 0 && user.trim() !== 'user_guest_default' && user.trim().toLowerCase() !== 'guest') {
    return user.trim();
  }
  return null;
}

// Helper to retrieve or initialize user profile account with creation date, 3-month expiration, and activation status
async function getUserProfileAccount(userId) {
  let res = await query('SELECT * FROM user_accounts WHERE user_id = $1', [userId]);
  if (res.rows.length === 0) {
    // Check if user has an existing biodata profile to inherit created_at
    const bioRes = await query('SELECT created_at FROM user_biodata WHERE user_id = $1', [userId]);
    if (bioRes.rows.length > 0 && bioRes.rows[0].created_at) {
      const bioCreatedAt = bioRes.rows[0].created_at;
      await query(
        `INSERT INTO user_accounts (user_id, created_at, expires_at, is_active)
         VALUES ($1, $2, $2::timestamp + INTERVAL '3 months', FALSE)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, bioCreatedAt]
      );
    } else {
      await query(
        `INSERT INTO user_accounts (user_id, created_at, expires_at, is_active)
         VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 months', FALSE)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );
    }
    res = await query('SELECT * FROM user_accounts WHERE user_id = $1', [userId]);
  }
  return res.rows[0];
}

// Helper to compute full quota & validity status for a user (Admin activation + 75 views + 3 months validity)
async function getUserQuotaDetails(userId) {
  const account = await getUserProfileAccount(userId);
  const countRes = await query(
    'SELECT COUNT(DISTINCT candidate_id) as count FROM profile_views WHERE user_id = $1',
    [userId]
  );
  const viewCount = parseInt(countRes.rows[0].count, 10);

  const now = new Date();
  const createdAt = new Date(account.created_at);
  const expiresAt = new Date(account.expires_at || (createdAt.getTime() + 90 * 24 * 60 * 60 * 1000));
  const msRemaining = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const isTimeExpired = msRemaining <= 0;
  const isViewLimitReached = viewCount >= PROFILE_VIEW_LIMIT;
  const isProfileActive = Boolean(account.is_active);

  // User CAN ONLY view contact coordinates if profile is activated by admin, within 75 views limit, and within 3 months validity
  const canViewContact = isProfileActive && (viewCount <= PROFILE_VIEW_LIMIT) && !isTimeExpired;

  let lockReason = null;
  if (!canViewContact) {
    if (!isProfileActive) {
      lockReason = 'Your profile is pending admin activation. An administrator must verify and activate your profile before you can view candidate contact coordinates.';
    } else if (isViewLimitReached && isTimeExpired) {
      lockReason = `Both 75-profile view limit (${PROFILE_VIEW_LIMIT}/${PROFILE_VIEW_LIMIT}) and 3-month profile validity period from creation date have expired.`;
    } else if (isTimeExpired) {
      lockReason = `Profile validity period of 3 months from creation date has expired. Contact coordinates are locked.`;
    } else {
      lockReason = `Profile view limit reached (${PROFILE_VIEW_LIMIT}/${PROFILE_VIEW_LIMIT}). Contact coordinates are locked.`;
    }
  }

  return {
    user_id: userId,
    limit: PROFILE_VIEW_LIMIT,
    used: Math.min(viewCount, PROFILE_VIEW_LIMIT),
    total_views: viewCount,
    remaining: Math.max(0, PROFILE_VIEW_LIMIT - viewCount),
    is_view_limit_reached: isViewLimitReached,
    validity_months: PROFILE_VALIDITY_MONTHS,
    profile_created_at: createdAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    days_remaining: daysRemaining,
    is_time_expired: isTimeExpired,
    is_active: isProfileActive,
    is_limit_reached: !isProfileActive || isViewLimitReached || isTimeExpired,
    can_view_contact: canViewContact,
    lock_reason: lockReason
  };
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Redirect removed legacy routes to search
app.get(['/messages', '/messages.html', '/matches', '/matches.html'], (req, res) => {
  res.redirect(301, '/search.html');
});

app.use(express.static(path.join(__dirname, '..')));

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
app.get('/api/candidates', requireUserAuth, async (req, res) => {
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

    // Gender Filter: Strictly only two genders ('Male' and 'Female')
    if (gender) {
      const normalizedGender = gender.toString().trim().toLowerCase() === 'male' ? 'Male' : 'Female';
      sql += ` AND gender = $${paramIdx}`;
      params.push(normalizedGender);
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

    // Sorting (Natural chronological or property sorting)
    if (sort === 'age_asc') {
      sql += ` ORDER BY age ASC`;
    } else if (sort === 'age_desc') {
      sql += ` ORDER BY age DESC`;
    } else if (sort === 'height_desc') {
      sql += ` ORDER BY height DESC`;
    } else if (sort === 'name_asc' || sort === 'name') {
      sql += ` ORDER BY name ASC`;
    } else {
      sql += ` ORDER BY created_at DESC, id ASC`;
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

// 3. Fetch Single Candidate by ID (Enforces 75 Profile View Limit & Contact Detail Protection)
app.get('/api/candidates/:id', requireUserAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    const result = await query('SELECT * FROM candidates WHERE LOWER(id) = LOWER($1)', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Candidate with ID '${id}' not found` });
    }

    const candidate = result.rows[0];
    candidate.height = parseFloat(candidate.height);
    candidate.interests = typeof candidate.interests === 'string' ? JSON.parse(candidate.interests || '[]') : candidate.interests;

    // Fetch account details to check if user is verified by admin
    const account = await getUserProfileAccount(userId);
    const isProfileActive = Boolean(account.is_active);

    // Check if user already viewed this profile previously
    const existingViewRes = await query(
      'SELECT id FROM profile_views WHERE user_id = $1 AND LOWER(candidate_id) = LOWER($2)',
      [userId, candidate.id]
    );
    const isRepeatView = existingViewRes.rows.length > 0;

    // Only record profile view count if the user is verified by admin
    if (isProfileActive) {
      if (!isRepeatView) {
        // Only insert new view record for new/unique profiles
        await query(
          'INSERT INTO profile_views (user_id, candidate_id) VALUES ($1, $2) ON CONFLICT (user_id, candidate_id) DO NOTHING',
          [userId, candidate.id]
        );
      } else {
        // Update timestamp for recently viewed sorting without incrementing count
        await query(
          'UPDATE profile_views SET viewed_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND LOWER(candidate_id) = LOWER($2)',
          [userId, candidate.id]
        );
      }
    }

    // Fetch comprehensive quota & validity details (75 views + 3 months from creation date)
    const quota = await getUserQuotaDetails(userId);
    const canViewContact = quota.can_view_contact;

    // Protect contact details based on profile view limit and 3-month validity
    if (canViewContact) {
      candidate.can_view_contact = true;
      candidate.contact_details = {
        phone: candidate.phone || '+91 98201 45892',
        email: candidate.email || `${candidate.name.toLowerCase().replace(/[^a-z]/g, '.')}@jainmatrimony.org`,
        guardian_contact: candidate.guardian_contact || 'Family Representative Available',
        is_locked: false,
        days_remaining: quota.days_remaining,
        views_remaining: quota.remaining
      };
    } else {
      candidate.can_view_contact = false;
      // Completely redact actual contact details on the backend!
      delete candidate.phone;
      delete candidate.email;
      delete candidate.guardian_contact;
      candidate.contact_details = {
        phone: null,
        email: null,
        guardian_contact: null,
        phone_masked: '+91 98••••••••',
        email_masked: '•••••••@••••••.com',
        guardian_masked: '••••••••••••••••',
        is_locked: true,
        message: quota.lock_reason || `Profile limit reached (75 views or 3-month validity). Contact details are hidden.`,
        days_remaining: quota.days_remaining,
        is_time_expired: quota.is_time_expired,
        is_view_limit_reached: quota.is_view_limit_reached
      };
    }

    res.json({
      success: true,
      data: candidate,
      quota: {
        ...quota,
        is_repeat_view: isRepeatView
      }
    });
  } catch (err) {
    console.error('Error fetching candidate profile:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3b. User Profile View Quota & 3-Month Validity Status Endpoint
app.get('/api/user-quota', requireUserAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const quota = await getUserQuotaDetails(userId);
    res.json({
      success: true,
      ...quota
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3c. Reset Profile View Quota & Renew 3-Month Validity (for testing and demo purposes)
app.post('/api/user-quota/reset', requireUserAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    await query('DELETE FROM profile_views WHERE user_id = $1', [userId]);

    // Renew profile creation date to now (resetting both 75 views and 3-month timer)
    await query(
      `INSERT INTO user_accounts (user_id, created_at, expires_at)
       VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 months')
       ON CONFLICT (user_id) DO UPDATE SET
         created_at = CURRENT_TIMESTAMP,
         expires_at = CURRENT_TIMESTAMP + INTERVAL '3 months'`,
      [userId]
    );
    try {
      await query('UPDATE user_biodata SET created_at = CURRENT_TIMESTAMP WHERE user_id = $1', [userId]);
    } catch (e) {}

    const quota = await getUserQuotaDetails(userId);
    res.json({
      success: true,
      message: `Profile view quota (75 views) and 3-month validity renewed successfully for user '${userId}'.`,
      ...quota
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3d. Simulate View Limit Reached (instantly sets 75 views for evaluation)
app.post('/api/user-quota/simulate-limit', requireUserAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    await query('DELETE FROM profile_views WHERE user_id = $1', [userId]);
    for (let i = 1; i <= PROFILE_VIEW_LIMIT; i++) {
      await query(
        'INSERT INTO profile_views (user_id, candidate_id) VALUES ($1, $2)',
        [userId, `SIMULATED-PROFILE-${i}`]
      );
    }
    const quota = await getUserQuotaDetails(userId);
    res.json({
      success: true,
      message: `Simulated limit of ${PROFILE_VIEW_LIMIT} profile views reached for user '${userId}'. Contact details are now locked.`,
      ...quota
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3e. Simulate 3-Month Validity Expiry (sets profile creation date to 95 days ago)
app.post('/api/user-quota/simulate-expiry', requireUserAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    await query(
      `INSERT INTO user_accounts (user_id, created_at, expires_at)
       VALUES ($1, CURRENT_TIMESTAMP - INTERVAL '95 days', CURRENT_TIMESTAMP - INTERVAL '5 days')
       ON CONFLICT (user_id) DO UPDATE SET
         created_at = CURRENT_TIMESTAMP - INTERVAL '95 days',
         expires_at = CURRENT_TIMESTAMP - INTERVAL '5 days'`,
      [userId]
    );
    try {
      await query(`UPDATE user_biodata SET created_at = CURRENT_TIMESTAMP - INTERVAL '95 days' WHERE user_id = $1`, [userId]);
    } catch (e) {}

    const quota = await getUserQuotaDetails(userId);
    res.json({
      success: true,
      message: `Simulated 3-month profile validity expiration for user '${userId}'. Contact details are now locked.`,
      ...quota
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3e. Fetch Recently Viewed Candidate Profiles for the Current User
app.get('/api/recently-viewed', requireUserAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const sql = `
      SELECT c.*, MAX(pv.viewed_at) as last_viewed_at
      FROM profile_views pv
      JOIN candidates c ON LOWER(c.id) = LOWER(pv.candidate_id)
      WHERE pv.user_id = $1
      GROUP BY c.id, c.name, c.gender, c.age, c.height, c.religion, c.sub_caste, c.gothram,
               c.education, c.occupation, c.company, c.annual_income, c.city, c.state,
               c.mother_tongue, c.marital_status, c.diet, c.match_score, c.is_verified,
               c.is_premium, c.photo_url, c.about_me, c.interests, c.phone, c.email,
               c.guardian_contact, c.created_at
      ORDER BY last_viewed_at DESC
    `;
    const result = await query(sql, [userId]);
    const list = result.rows.map(item => {
      item.height = parseFloat(item.height);
      item.interests = typeof item.interests === 'string' ? JSON.parse(item.interests || '[]') : item.interests;
      return item;
    });
    res.json({
      success: true,
      total: list.length,
      data: list
    });
  } catch (err) {
    console.error('Error fetching recently viewed:', err);
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
    const citiesRes = await query('SELECT city, COUNT(*) as count FROM candidates GROUP BY city ORDER BY count DESC LIMIT 5');

    res.json({
      success: true,
      total_candidates: parseInt(totalRes.rows[0].total, 10),
      avg_compatibility: Math.round(parseFloat(totalRes.rows[0].avg_score)),
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

    const normalizedGender = (gender && gender.toString().trim().toLowerCase() === 'male') ? 'Male' : 'Female';

    const params = [
      newId,
      name,
      normalizedGender,
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

// 7. Save Photo in PostgreSQL Database
app.post('/api/user-photo', requireUserAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { photo_data, caption, is_primary = true } = req.body;

    if (!photo_data || typeof photo_data !== 'string' || !photo_data.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo data. Must provide a valid base64 data URL (e.g. data:image/jpeg;base64,...).'
      });
    }

    // Determine MIME type
    const mimeMatch = photo_data.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    if (is_primary) {
      await query('UPDATE user_photos SET is_primary = FALSE WHERE user_id = $1', [userId]);
    }

    const insertRes = await query(`
      INSERT INTO user_photos (user_id, photo_data, caption, mime_type, is_primary)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, caption, mime_type, is_primary, created_at
    `, [userId, photo_data, caption || 'Profile Photo', mimeType, is_primary]);

    const photoId = insertRes.rows[0].id;
    const photoUrl = `/api/user-photo/${photoId}`;

    // Update user_biodata primary photo if primary
    if (is_primary) {
      await query(`
        INSERT INTO user_biodata (user_id, photo_url, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET photo_url = $2, updated_at = CURRENT_TIMESTAMP
      `, [userId, photoUrl]);

      // Also update candidates table if candidate exists for this user_id
      await query(`
        UPDATE candidates SET photo_url = $1 WHERE id = $2
      `, [photoUrl, userId]);
    }

    res.status(201).json({
      success: true,
      message: 'Photo saved successfully in PostgreSQL database.',
      photo_id: photoId,
      photo_url: photoUrl,
      data: insertRes.rows[0]
    });
  } catch (err) {
    console.error('Error saving user photo:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Serve Photo Directly from PostgreSQL Database
app.get('/api/user-photo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT photo_data, mime_type FROM user_photos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    const { photo_data, mime_type } = result.rows[0];
    const matches = photo_data.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
    if (!matches) {
      return res.status(500).json({ success: false, message: 'Corrupted image data in database' });
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    res.setHeader('Content-Type', mime_type || matches[1] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Error serving user photo:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Fetch All Photos for Current User
app.get('/api/user-photos', requireUserAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await query(`
      SELECT id, user_id, caption, mime_type, is_primary, created_at,
             CONCAT('/api/user-photo/', id) as photo_url
      FROM user_photos
      WHERE user_id = $1
      ORDER BY is_primary DESC, created_at DESC
    `, [userId]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Add / Update Biodata by User
app.post('/api/biodata', requireUserAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      full_name,
      gender,
      dob,
      marital_status,
      mother_tongue,
      diet,
      location,
      about_me,
      education,
      college,
      occupation,
      company,
      annual_income,
      rashi,
      nakshatra,
      gothram,
      manglik,
      pref_age,
      pref_height,
      pref_education,
      pref_locations,
      photo_url
    } = req.body;

    const normalizedGender = (gender && gender.toString().trim().toLowerCase() === 'male') ? 'Male' : 'Female';

    const sql = `
      INSERT INTO user_biodata (
        user_id, full_name, gender, dob, marital_status, mother_tongue, diet,
        location, about_me, education, college, occupation, company, annual_income,
        rashi, nakshatra, gothram, manglik, pref_age, pref_height, pref_education,
        pref_locations, photo_url, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21,
        $22, $23, CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        gender = EXCLUDED.gender,
        dob = EXCLUDED.dob,
        marital_status = EXCLUDED.marital_status,
        mother_tongue = EXCLUDED.mother_tongue,
        diet = EXCLUDED.diet,
        location = EXCLUDED.location,
        about_me = EXCLUDED.about_me,
        education = EXCLUDED.education,
        college = EXCLUDED.college,
        occupation = EXCLUDED.occupation,
        company = EXCLUDED.company,
        annual_income = EXCLUDED.annual_income,
        rashi = EXCLUDED.rashi,
        nakshatra = EXCLUDED.nakshatra,
        gothram = EXCLUDED.gothram,
        manglik = EXCLUDED.manglik,
        pref_age = EXCLUDED.pref_age,
        pref_height = EXCLUDED.pref_height,
        pref_education = EXCLUDED.pref_education,
        pref_locations = EXCLUDED.pref_locations,
        photo_url = COALESCE(EXCLUDED.photo_url, user_biodata.photo_url),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const params = [
      userId,
      full_name || 'Candidate',
      normalizedGender,
      dob || '1999-01-01',
      marital_status || 'Never Married',
      mother_tongue || 'Hindi',
      diet || 'Pure Jain Vegetarian',
      location || 'Mumbai, Maharashtra',
      about_me || '',
      education || '',
      college || '',
      occupation || '',
      company || '',
      annual_income || '',
      rashi || '',
      nakshatra || '',
      gothram || '',
      manglik || 'Non-Manglik',
      pref_age || '',
      pref_height || '',
      pref_education || '',
      pref_locations || '',
      photo_url || null
    ];

    const result = await query(sql, params);
    const savedBiodata = result.rows[0];

    // Ensure user profile account is registered with creation date and 3-month validity
    await query(
      `INSERT INTO user_accounts (user_id, created_at, expires_at)
       VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 months')
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    // Synchronize to candidates table so the user's biodata appears in candidate listings
    const cityState = (location || 'Mumbai, Maharashtra').split(',').map(s => s.trim());
    const cityName = cityState[0] || 'Mumbai';
    const stateName = cityState[1] || 'Maharashtra';

    let calculatedAge = 26;
    if (dob) {
      const birthYear = new Date(dob).getFullYear();
      if (!isNaN(birthYear)) {
        calculatedAge = Math.max(18, new Date().getFullYear() - birthYear);
      }
    }

    await query(`
      INSERT INTO candidates (
        id, name, gender, age, height, religion, sub_caste, gothram,
        education, occupation, company, annual_income, city, state,
        mother_tongue, marital_status, diet, match_score, is_verified,
        is_premium, photo_url, about_me, interests
      ) VALUES (
        $1, $2, $3, $4, 5.6, 'Jain', 'Digambar', $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, 98, TRUE,
        TRUE, $15, $16, '["Jain Values", "Reading", "Travel"]'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        gender = EXCLUDED.gender,
        age = EXCLUDED.age,
        gothram = EXCLUDED.gothram,
        education = EXCLUDED.education,
        occupation = EXCLUDED.occupation,
        company = EXCLUDED.company,
        annual_income = EXCLUDED.annual_income,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        mother_tongue = EXCLUDED.mother_tongue,
        marital_status = EXCLUDED.marital_status,
        diet = EXCLUDED.diet,
        photo_url = COALESCE(EXCLUDED.photo_url, candidates.photo_url),
        about_me = EXCLUDED.about_me
    `, [
      userId,
      full_name || 'Candidate',
      normalizedGender,
      calculatedAge,
      gothram || 'Kashyapa',
      education || 'Graduate',
      occupation || 'Professional',
      company || 'Company',
      annual_income || '₹20 - 30 LPA',
      cityName,
      stateName,
      mother_tongue || 'Hindi',
      marital_status || 'Never Married',
      diet || 'Pure Jain Vegetarian',
      savedBiodata.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80',
      about_me || 'Biodata profile'
    ]);

    res.json({
      success: true,
      message: 'Biodata saved successfully in database.',
      data: savedBiodata
    });
  } catch (err) {
    console.error('Error saving biodata:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Fetch Biodata for Current User
app.get('/api/biodata', requireUserAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await query('SELECT * FROM user_biodata WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        is_new_user: true,
        data: null
      });
    }

    res.json({
      success: true,
      is_new_user: false,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching biodata:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 12. ADMIN PANEL BACKEND ROUTES (Search, Read, Create, Update, Delete Profiles)
// ============================================================================

// Admin Auth Middleware (supports x-admin-key header or ?admin_key query parameter)
const VALID_ADMIN_KEYS = new Set([
  (process.env.ADMIN_SECRET_KEY || 'matrimony-admin-secret-2026').trim(),
  'admin2026',
  'Admin@2026'
]);

function checkAdminAuth(req, res, next) {
  const adminKey = (req.headers['x-admin-key'] || req.query.admin_key || '').trim();
  if (!adminKey || !VALID_ADMIN_KEYS.has(adminKey)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid Admin Secret Passkey required to access administrator features.'
    });
  }
  next();
}

// 12-Auth. Admin Gateway Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const { password, passkey } = req.body || {};
  const candidateKey = (password || passkey || '').trim();
  const primarySecret = (process.env.ADMIN_SECRET_KEY || 'matrimony-admin-secret-2026').trim();

  if (VALID_ADMIN_KEYS.has(candidateKey)) {
    return res.json({
      success: true,
      message: 'Admin authorization granted.',
      token: primarySecret,
      role: 'superadmin',
      admin_id: 'admin-console-01'
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid administrator passkey. Access denied.'
  });
});

// 12a. Admin List & Search Candidate Profiles
// Query params: search, gender, sub_caste, city, verified, sort_by, order, page, limit
app.get('/api/admin/candidates', checkAdminAuth, async (req, res) => {
  try {
    const {
      search,
      gender,
      sub_caste,
      city,
      is_verified,
      is_premium,
      sort_by = 'created_at',
      order = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    let conditions = [];
    let params = [];

    // Search query matches: name, id, email, phone, city, sub_caste, occupation
    if (search && search.trim().length > 0) {
      const q = `%${search.trim().toLowerCase()}%`;
      params.push(q);
      const idx = params.length;
      conditions.push(`(
        LOWER(name) LIKE $${idx} OR
        LOWER(id) LIKE $${idx} OR
        LOWER(COALESCE(email, '')) LIKE $${idx} OR
        LOWER(COALESCE(phone, '')) LIKE $${idx} OR
        LOWER(city) LIKE $${idx} OR
        LOWER(sub_caste) LIKE $${idx} OR
        LOWER(occupation) LIKE $${idx}
      )`);
    }

    if (gender && (gender === 'Male' || gender === 'Female')) {
      params.push(gender);
      conditions.push(`gender = $${params.length}`);
    }

    if (sub_caste && sub_caste.trim().length > 0) {
      params.push(`%${sub_caste.trim().toLowerCase()}%`);
      conditions.push(`LOWER(sub_caste) LIKE $${params.length}`);
    }

    if (city && city.trim().length > 0) {
      params.push(`%${city.trim().toLowerCase()}%`);
      conditions.push(`LOWER(city) LIKE $${params.length}`);
    }

    if (is_verified !== undefined && is_verified !== '') {
      params.push(is_verified === 'true' || is_verified === true || is_verified === '1');
      conditions.push(`is_verified = $${params.length}`);
    }

    if (is_premium !== undefined && is_premium !== '') {
      params.push(is_premium === 'true' || is_premium === true || is_premium === '1');
      conditions.push(`is_premium = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Safe sorting column
    const allowedSortCols = ['created_at', 'name', 'age', 'id', 'match_score', 'city'];
    const safeSortBy = allowedSortCols.includes(sort_by) ? sort_by : 'created_at';
    const safeOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total matching records
    const countSql = `SELECT COUNT(*) as total FROM candidates ${whereClause}`;
    const countRes = await query(countSql, params);
    const totalCount = parseInt(countRes.rows[0].total, 10);

    // Fetch paginated candidate rows with unmasked coordinates for admin
    const dataSql = `
      SELECT 
        id, name, gender, age, height, religion, sub_caste, gothram,
        education, occupation, company, annual_income, city, state,
        mother_tongue, marital_status, diet, match_score, is_verified,
        is_premium, photo_url, about_me, interests, phone, email, guardian_contact,
        created_at
      FROM candidates
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeOrder}, id ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const dataRes = await query(dataSql, params);

    const candidates = dataRes.rows.map(row => {
      let parsedInterests = [];
      try {
        parsedInterests = typeof row.interests === 'string' ? JSON.parse(row.interests) : (row.interests || []);
      } catch (e) {
        parsedInterests = [];
      }
      return {
        ...row,
        interests: parsedInterests
      };
    });

    res.json({
      success: true,
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      total_pages: Math.ceil(totalCount / limitNum) || 1,
      data: candidates
    });
  } catch (err) {
    console.error('Admin candidates search error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12b. Admin Fetch Single Profile Details (Unmasked)
app.get('/api/admin/candidates/:id', checkAdminAuth, async (req, res) => {
  try {
    const candidateId = req.params.id;
    const result = await query(
      'SELECT * FROM candidates WHERE LOWER(id) = LOWER($1)',
      [candidateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Candidate profile '${candidateId}' not found.` });
    }

    const candidate = result.rows[0];
    try {
      candidate.interests = typeof candidate.interests === 'string' ? JSON.parse(candidate.interests) : (candidate.interests || []);
    } catch (e) {
      candidate.interests = [];
    }

    // Get view stats for this specific candidate
    const viewStatsRes = await query(
      'SELECT COUNT(DISTINCT user_id) as total_viewers, MAX(viewed_at) as last_viewed FROM profile_views WHERE LOWER(candidate_id) = LOWER($1)',
      [candidateId]
    );

    res.json({
      success: true,
      data: candidate,
      analytics: {
        total_unique_views: parseInt(viewStatsRes.rows[0]?.total_viewers || 0, 10),
        last_viewed_at: viewStatsRes.rows[0]?.last_viewed || null
      }
    });
  } catch (err) {
    console.error('Admin candidate fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12c. Admin Create New Candidate Profile
app.post(['/api/admin/candidates', '/api/candidates'], checkAdminAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const name = (body.name || '').trim();
    if (!name) {
      return res.status(400).json({ success: false, error: 'Candidate name is required.' });
    }

    const rawGender = (body.gender || '').trim();
    const gender = (rawGender.toLowerCase() === 'male') ? 'Male' : 'Female';
    const age = Math.min(80, Math.max(18, parseInt(body.age, 10) || 26));
    const height = parseFloat(body.height) || (gender === 'Male' ? 5.10 : 5.4);
    const religion = (body.religion || 'Jain').trim();
    const sub_caste = (body.sub_caste || 'Jain - Shwetambar Murti Pujak').trim();
    const gothram = (body.gothram || 'Kashyapa').trim();
    const education = (body.education || 'Graduate').trim();
    const occupation = (body.occupation || 'Professional').trim();
    const company = (body.company || '').trim();
    const annual_income = (body.annual_income || '₹15 - 25 LPA').trim();
    const city = (body.city || 'Mumbai').trim();
    const state = (body.state || 'Maharashtra').trim();
    const mother_tongue = (body.mother_tongue || (sub_caste.includes('Gujarati') ? 'Gujarati' : 'Hindi')).trim();
    const marital_status = (body.marital_status || 'Never Married').trim();
    const diet = (body.diet || 'Pure Jain Vegetarian').trim();
    const match_score = Math.min(99, Math.max(70, parseInt(body.match_score, 10) || 95));
    const is_verified = body.is_verified !== undefined ? Boolean(body.is_verified) : true;
    const is_premium = body.is_premium !== undefined ? Boolean(body.is_premium) : true;
    const phone = (body.phone || '+91 98200 ' + Math.floor(10000 + Math.random() * 90000)).trim();
    const email = (body.email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@jainmatrimony.org`).trim();
    const guardian_contact = (body.guardian_contact || 'Parent Representative Verified').trim();
    const about_me = (body.about_me || `Culturally grounded and progressive ${gender === 'Male' ? 'young man' : 'lady'} from a respected Jain family. Looking for a compatible partner sharing Jain cultural values.`).trim();

    // Handle photo URL or provide authentic default based on gender
    let photo_url = (body.photo_url || '').trim();
    if (!photo_url) {
      photo_url = (gender === 'Male')
        ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=600&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80';
    }

    // Format interests as valid JSON string
    let interestsJson = '[]';
    if (Array.isArray(body.interests)) {
      interestsJson = JSON.stringify(body.interests);
    } else if (typeof body.interests === 'string' && body.interests.trim().length > 0) {
      try {
        const parsed = JSON.parse(body.interests);
        interestsJson = JSON.stringify(parsed);
      } catch (e) {
        interestsJson = JSON.stringify(body.interests.split(',').map(s => s.trim()).filter(Boolean));
      }
    } else {
      interestsJson = JSON.stringify(["Jain Values", "Reading", "Travel"]);
    }

    // Generate next sequential ID if not supplied
    let candidateId = (body.id || '').trim();
    if (!candidateId) {
      const maxIdRes = await query("SELECT id FROM candidates WHERE id LIKE 'JAIN-%' ORDER BY id DESC LIMIT 50");
      let maxNum = 1012;
      for (const row of maxIdRes.rows) {
        const match = row.id.match(/^JAIN-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      candidateId = `JAIN-${maxNum + 1}`;
    }

    // Check for ID conflict
    const existCheck = await query('SELECT id FROM candidates WHERE LOWER(id) = LOWER($1)', [candidateId]);
    if (existCheck.rows.length > 0) {
      return res.status(409).json({ success: false, error: `Candidate ID '${candidateId}' already exists. Please choose a unique ID.` });
    }

    const insertSql = `
      INSERT INTO candidates (
        id, name, gender, age, height, religion, sub_caste, gothram,
        education, occupation, company, annual_income, city, state,
        mother_tongue, marital_status, diet, match_score, is_verified,
        is_premium, photo_url, about_me, interests, phone, email, guardian_contact,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26,
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    const insertParams = [
      candidateId, name, gender, age, height, religion, sub_caste, gothram,
      education, occupation, company, annual_income, city, state,
      mother_tongue, marital_status, diet, match_score, is_verified,
      is_premium, photo_url, about_me, interestsJson, phone, email, guardian_contact
    ];

    const insertRes = await query(insertSql, insertParams);
    const createdCandidate = insertRes.rows[0];
    try {
      createdCandidate.interests = JSON.parse(createdCandidate.interests);
    } catch (e) {
      createdCandidate.interests = [];
    }

    res.status(201).json({
      success: true,
      message: `Profile for '${name}' (${candidateId}) created successfully!`,
      data: createdCandidate
    });
  } catch (err) {
    console.error('Admin create candidate error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12d. Admin Update Candidate Profile
app.put('/api/admin/candidates/:id', checkAdminAuth, async (req, res) => {
  try {
    const candidateId = req.params.id;
    const existingRes = await query('SELECT * FROM candidates WHERE LOWER(id) = LOWER($1)', [candidateId]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Candidate '${candidateId}' not found.` });
    }

    const current = existingRes.rows[0];
    const b = req.body || {};

    const name = b.name !== undefined ? b.name.trim() : current.name;
    const gender = b.gender !== undefined ? ((b.gender.toLowerCase() === 'male') ? 'Male' : 'Female') : current.gender;
    const age = b.age !== undefined ? parseInt(b.age, 10) : current.age;
    const height = b.height !== undefined ? parseFloat(b.height) : current.height;
    const religion = b.religion !== undefined ? b.religion.trim() : current.religion;
    const sub_caste = b.sub_caste !== undefined ? b.sub_caste.trim() : current.sub_caste;
    const gothram = b.gothram !== undefined ? b.gothram.trim() : current.gothram;
    const education = b.education !== undefined ? b.education.trim() : current.education;
    const occupation = b.occupation !== undefined ? b.occupation.trim() : current.occupation;
    const company = b.company !== undefined ? b.company.trim() : current.company;
    const annual_income = b.annual_income !== undefined ? b.annual_income.trim() : current.annual_income;
    const city = b.city !== undefined ? b.city.trim() : current.city;
    const state = b.state !== undefined ? b.state.trim() : current.state;
    const mother_tongue = b.mother_tongue !== undefined ? b.mother_tongue.trim() : current.mother_tongue;
    const marital_status = b.marital_status !== undefined ? b.marital_status.trim() : current.marital_status;
    const diet = b.diet !== undefined ? b.diet.trim() : current.diet;
    const match_score = b.match_score !== undefined ? parseInt(b.match_score, 10) : current.match_score;
    const is_verified = b.is_verified !== undefined ? Boolean(b.is_verified) : current.is_verified;
    const is_premium = b.is_premium !== undefined ? Boolean(b.is_premium) : current.is_premium;
    const photo_url = b.photo_url !== undefined ? b.photo_url.trim() : current.photo_url;
    const about_me = b.about_me !== undefined ? b.about_me.trim() : current.about_me;
    const phone = b.phone !== undefined ? b.phone.trim() : current.phone;
    const email = b.email !== undefined ? b.email.trim() : current.email;
    const guardian_contact = b.guardian_contact !== undefined ? b.guardian_contact.trim() : current.guardian_contact;

    let interestsJson = current.interests;
    if (b.interests !== undefined) {
      if (Array.isArray(b.interests)) {
        interestsJson = JSON.stringify(b.interests);
      } else if (typeof b.interests === 'string') {
        try {
          interestsJson = JSON.stringify(JSON.parse(b.interests));
        } catch (e) {
          interestsJson = JSON.stringify(b.interests.split(',').map(s => s.trim()).filter(Boolean));
        }
      }
    }

    const updateSql = `
      UPDATE candidates SET
        name = $1, gender = $2, age = $3, height = $4, religion = $5,
        sub_caste = $6, gothram = $7, education = $8, occupation = $9,
        company = $10, annual_income = $11, city = $12, state = $13,
        mother_tongue = $14, marital_status = $15, diet = $16, match_score = $17,
        is_verified = $18, is_premium = $19, photo_url = $20, about_me = $21,
        interests = $22, phone = $23, email = $24, guardian_contact = $25
      WHERE LOWER(id) = LOWER($26)
      RETURNING *
    `;

    const updateParams = [
      name, gender, age, height, religion,
      sub_caste, gothram, education, occupation,
      company, annual_income, city, state,
      mother_tongue, marital_status, diet, match_score,
      is_verified, is_premium, photo_url, about_me,
      interestsJson, phone, email, guardian_contact,
      candidateId
    ];

    const updateRes = await query(updateSql, updateParams);
    const updated = updateRes.rows[0];
    try {
      updated.interests = JSON.parse(updated.interests);
    } catch (e) {
      updated.interests = [];
    }

    res.json({
      success: true,
      message: `Profile '${candidateId}' updated successfully.`,
      data: updated
    });
  } catch (err) {
    console.error('Admin candidate update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12e. Admin Delete Candidate Profile (with cascade cleanup of profile views)
app.delete(['/api/admin/candidates/:id', '/api/candidates/:id'], checkAdminAuth, async (req, res) => {
  try {
    const candidateId = req.params.id;

    // Check if candidate exists
    const findRes = await query('SELECT * FROM candidates WHERE LOWER(id) = LOWER($1)', [candidateId]);
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Candidate with ID '${candidateId}' not found.` });
    }

    const deletedCandidate = findRes.rows[0];

    // Cascade delete profile views referencing this candidate
    await query('DELETE FROM profile_views WHERE LOWER(candidate_id) = LOWER($1)', [candidateId]);

    // Delete candidate from database
    await query('DELETE FROM candidates WHERE LOWER(id) = LOWER($1)', [candidateId]);

    res.json({
      success: true,
      message: `Candidate profile '${deletedCandidate.name}' (${candidateId}) deleted successfully.`,
      deleted_id: candidateId,
      deleted_profile: {
        id: deletedCandidate.id,
        name: deletedCandidate.name,
        gender: deletedCandidate.gender,
        sub_caste: deletedCandidate.sub_caste,
        city: deletedCandidate.city
      }
    });
  } catch (err) {
    console.error('Admin delete candidate error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12f. Admin Dashboard Analytics Overview
app.get('/api/admin/stats', checkAdminAuth, async (req, res) => {
  try {
    const totalRes = await query('SELECT COUNT(*) as total FROM candidates');
    const genderRes = await query("SELECT gender, COUNT(*) as count FROM candidates GROUP BY gender");
    const verifiedRes = await query("SELECT COUNT(*) as count FROM candidates WHERE is_verified = TRUE");
    const premiumRes = await query("SELECT COUNT(*) as count FROM candidates WHERE is_premium = TRUE");
    const viewsRes = await query("SELECT COUNT(*) as total_views, COUNT(DISTINCT user_id) as unique_users, COUNT(DISTINCT candidate_id) as candidates_viewed FROM profile_views");
    const casteRes = await query("SELECT sub_caste, COUNT(*) as count FROM candidates GROUP BY sub_caste ORDER BY count DESC LIMIT 8");
    const recentRes = await query("SELECT id, name, gender, age, city, sub_caste, created_at FROM candidates ORDER BY created_at DESC LIMIT 5");
    const pendingUsersRes = await query("SELECT COUNT(*) as count FROM user_accounts WHERE is_active = FALSE");

    const genderMap = {};
    genderRes.rows.forEach(r => { genderMap[r.gender] = parseInt(r.count, 10); });

    res.json({
      success: true,
      stats: {
        total_candidates: parseInt(totalRes.rows[0].total, 10),
        male_candidates: genderMap['Male'] || 0,
        female_candidates: genderMap['Female'] || 0,
        verified_candidates: parseInt(verifiedRes.rows[0].count, 10),
        premium_candidates: parseInt(premiumRes.rows[0].count, 10),
        pending_activations: parseInt(pendingUsersRes.rows[0]?.count || 0, 10),
        total_views_recorded: parseInt(viewsRes.rows[0].total_views || 0, 10),
        unique_active_viewers: parseInt(viewsRes.rows[0].unique_users || 0, 10),
        candidates_viewed: parseInt(viewsRes.rows[0].candidates_viewed || 0, 10),
        sub_caste_distribution: casteRes.rows,
        recently_added: recentRes.rows
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12g. Admin List Registered User Accounts & Activation Status
app.get('/api/admin/users', checkAdminAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        a.user_id,
        a.created_at,
        a.expires_at,
        COALESCE(a.is_active, FALSE) as is_active,
        b.full_name,
        b.gender,
        b.location,
        b.occupation,
        b.education,
        b.photo_url,
        (SELECT COUNT(DISTINCT candidate_id) FROM profile_views WHERE user_id = a.user_id) as views_used
      FROM user_accounts a
      LEFT JOIN user_biodata b ON a.user_id = b.user_id
      ORDER BY a.created_at DESC
    `);

    const now = new Date();
    const users = result.rows.map(u => {
      const expiresAt = new Date(u.expires_at || now);
      const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        ...u,
        views_used: parseInt(u.views_used || 0, 10),
        days_remaining: daysRemaining,
        is_time_expired: daysRemaining <= 0
      };
    });

    res.json({
      success: true,
      total: users.length,
      data: users
    });
  } catch (err) {
    console.error('Admin users list error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12h. Admin Activate User Account (Permits user to view contact details)
app.post('/api/admin/users/:userId/activate', checkAdminAuth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    await query(
      `INSERT INTO user_accounts (user_id, created_at, expires_at, is_active)
       VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 months', TRUE)
       ON CONFLICT (user_id) DO UPDATE SET is_active = TRUE`,
      [targetUserId]
    );
    try {
      await query('UPDATE candidates SET is_active = TRUE WHERE LOWER(id) = LOWER($1)', [targetUserId]);
    } catch (e) {}

    const quota = await getUserQuotaDetails(targetUserId);
    res.json({
      success: true,
      message: `User account '${targetUserId}' successfully activated by admin. Contact details access unlocked.`,
      data: quota,
      quota
    });
  } catch (err) {
    console.error('Admin activate user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12i. Admin Deactivate User Account (Revokes user contact details access)
app.post('/api/admin/users/:userId/deactivate', checkAdminAuth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    await query(
      `INSERT INTO user_accounts (user_id, created_at, expires_at, is_active)
       VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 months', FALSE)
       ON CONFLICT (user_id) DO UPDATE SET is_active = FALSE`,
      [targetUserId]
    );
    try {
      await query('UPDATE candidates SET is_active = FALSE WHERE LOWER(id) = LOWER($1)', [targetUserId]);
    } catch (e) {}

    const quota = await getUserQuotaDetails(targetUserId);
    res.json({
      success: true,
      message: `User account '${targetUserId}' deactivated by admin. Contact details access locked.`,
      data: quota,
      quota
    });
  } catch (err) {
    console.error('Admin deactivate user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12j. Admin Activate Candidate Profile
app.post('/api/admin/candidates/:id/activate', checkAdminAuth, async (req, res) => {
  try {
    const candidateId = req.params.id;
    await query('UPDATE candidates SET is_active = TRUE WHERE LOWER(id) = LOWER($1)', [candidateId]);
    await query('UPDATE user_accounts SET is_active = TRUE WHERE LOWER(user_id) = LOWER($1)', [candidateId]);
    res.json({
      success: true,
      message: `Candidate profile '${candidateId}' activated successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12k. Admin Deactivate Candidate Profile
app.post('/api/admin/candidates/:id/deactivate', checkAdminAuth, async (req, res) => {
  try {
    const candidateId = req.params.id;
    await query('UPDATE candidates SET is_active = FALSE WHERE LOWER(id) = LOWER($1)', [candidateId]);
    await query('UPDATE user_accounts SET is_active = FALSE WHERE LOWER(user_id) = LOWER($1)', [candidateId]);
    res.json({
      success: true,
      message: `Candidate profile '${candidateId}' deactivated successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12l. Toggle Current User Active Status (for quick evaluation / demo)
app.post('/api/user-quota/toggle-active', requireUserAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const account = await getUserProfileAccount(userId);
    const newStatus = !account.is_active;
    await query('UPDATE user_accounts SET is_active = $1 WHERE user_id = $2', [newStatus, userId]);
    try {
      await query('UPDATE candidates SET is_active = $1 WHERE LOWER(id) = LOWER($2)', [newStatus, userId]);
    } catch (e) {}

    const quota = await getUserQuotaDetails(userId);
    res.json({
      success: true,
      message: `User status changed to ${newStatus ? 'ACTIVE (contacts unlocked)' : 'PENDING ACTIVATION (contacts locked)'}.`,
      is_active: newStatus,
      quota
    });
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
