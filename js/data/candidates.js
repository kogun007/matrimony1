/**
 * Jain Matrimony Candidate Profiles Database & API Connector (PostgreSQL Backend & Cloudflare Edge)
 */
const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? (window.location.port === '3000' ? '/api' : 'http://localhost:3000/api')
  : '/api';

let CANDIDATE_DATABASE = [
  {
    id: "JAIN-1001",
    name: "Dr. Prisha Mehta",
    gender: "Female",
    age: 26,
    height: 5.4,
    religion: "Jain",
    sub_caste: "Jain - Shwetambar Murti Pujak",
    gothram: "Mehta / Kashyapa",
    education: "MD, Dermatology (Gold Medalist)",
    occupation: "Consultant Dermatologist",
    company: "Lilavati Hospital & Research Centre",
    annualIncome: "₹35 - 45 LPA",
    location: "Mumbai, Maharashtra",
    city: "Mumbai",
    motherTongue: "Gujarati",
    maritalStatus: "Never Married",
    diet: "Pure Jain Vegetarian",
    matchScore: 97,
    isVerified: true,
    isPremium: true,
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=600&q=80",
    about: "Dedicated medical professional rooted in Jain Navkar traditions and Ahimsa principles. Passionate about dermatological research, classical harmonium, and weekend spiritual satsangs. Looking for an educated, culturally grounded Jain partner with progressive family values.",
    interests: ["Jain Literature", "Harmonium", "Medical Camps", "Travel", "Yoga"]
  },
  {
    id: "JAIN-1002",
    name: "Rishabh Shah",
    gender: "Male",
    age: 28,
    height: 5.11,
    religion: "Jain",
    sub_caste: "Jain - Shwetambar Murti Pujak",
    gothram: "Shah / Golechha",
    education: "B.Tech (IIT Bombay) + MBA (IIM Ahmedabad)",
    occupation: "Vice President - FinTech Strategy",
    company: "Morgan Stanley India",
    annualIncome: "₹55 - 70 LPA",
    location: "Mumbai, Maharashtra",
    city: "Mumbai",
    motherTongue: "Gujarati",
    maritalStatus: "Never Married",
    diet: "Jain Vegetarian",
    matchScore: 98,
    isVerified: true,
    isPremium: true,
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=600&q=80",
    about: "Finance professional with an entrepreneurial mindset. Family-oriented, avid badminton player, and regular practitioner of Jain Samayik and meditation. Looking for an ambitious and kind-hearted Jain life partner.",
    interests: ["Fintech & Markets", "Badminton", "Vipassana", "Specialty Coffee", "Reading"]
  },
  {
    id: "JAIN-1003",
    name: "Ananya Singhi",
    gender: "Female",
    age: 25,
    height: 5.5,
    religion: "Jain",
    sub_caste: "Jain - Shwetambar Terapanthi",
    gothram: "Singhi / Surana",
    education: "Chartered Accountant (CA - All India Rank 14)",
    occupation: "Senior Manager - M&A Advisory",
    company: "Ernst & Young (EY)",
    annualIncome: "₹30 - 38 LPA",
    location: "Bengaluru, Karnataka",
    city: "Bengaluru",
    motherTongue: "Marwari",
    maritalStatus: "Never Married",
    diet: "Pure Jain Vegetarian",
    matchScore: 94,
    isVerified: true,
    isPremium: true,
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=600&q=80",
    about: "CA rank holder from a respectable Terapanthi Jain family. Enthusiastic about Jain Preksha Dhyan, art curation, and exploring heritage temple architecture. Looking for a partner who values ethical living and career growth.",
    interests: ["Preksha Dhyan", "Heritage Architecture", "Financial Modeling", "Classical Dance"]
  },
  {
    id: "JAIN-1004",
    name: "Siddharth Doshi",
    gender: "Male",
    age: 30,
    height: 6.0,
    religion: "Jain",
    sub_caste: "Jain - Oswal",
    gothram: "Doshi / Dugar",
    education: "MS in Artificial Intelligence, CMU",
    occupation: "Principal AI Architect",
    company: "Google Cloud",
    annualIncome: "₹75 - 90 LPA",
    location: "Bengaluru, Karnataka",
    city: "Bengaluru",
    motherTongue: "Gujarati",
    maritalStatus: "Never Married",
    diet: "Jain Vegetarian",
    matchScore: 95,
    isVerified: true,
    isPremium: true,
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=600&q=80",
    about: "Tech leader working on cutting-edge generative AI models. Passionate about vegetarian gastronomy, marathons, and Jain community youth initiatives. Seeking an intellectually compatible Jain partner.",
    interests: ["Artificial Intelligence", "Marathon Training", "Jain Philosophy", "Piano"]
  },
  {
    id: "JAIN-1005",
    name: "Tanvi Gandhi",
    gender: "Female",
    age: 27,
    height: 5.6,
    religion: "Jain",
    sub_caste: "Jain - Digambar",
    gothram: "Gandhi / Khandelwal",
    education: "M.Arch (Urban Design), CEPT University",
    occupation: "Lead Sustainable Architect",
    company: "Gandhi & Associates Studio",
    annualIncome: "₹28 - 35 LPA",
    location: "Ahmedabad, Gujarat",
    city: "Ahmedabad",
    motherTongue: "Gujarati",
    maritalStatus: "Never Married",
    diet: "Pure Jain Vegetarian",
    matchScore: 92,
    isVerified: true,
    isPremium: false,
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80",
    about: "Architect passionate about green eco-habitats, Jain temple restoration, and ceramic pottery. Raised with strong Digambar Jain values, Paryushan fasting traditions, and love for nature.",
    interests: ["Pottery", "Temple Restoration", "Sustainable Design", "Trekking"]
  },
  {
    id: "JAIN-1006",
    name: "Aarav Jain",
    gender: "Male",
    age: 29,
    height: 5.10,
    religion: "Jain",
    sub_caste: "Jain - Digambar",
    gothram: "Jain / Bothra",
    education: "B.Tech (NIT Trichy) + MS (Cornell University)",
    occupation: "Director - Enterprise Software",
    company: "Salesforce India",
    annualIncome: "₹60 - 75 LPA",
    location: "Pune, Maharashtra",
    city: "Pune",
    motherTongue: "Hindi",
    maritalStatus: "Never Married",
    diet: "Pure Jain Vegetarian",
    matchScore: 96,
    isVerified: true,
    isPremium: true,
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=600&q=80",
    about: "Software director with strong ethics and traditional values. Enjoys tennis, playing the sitar, and participating in Jain community seva. Looking for a partner who believes in mutual support, respect, and shared laughter.",
    interests: ["Sitar", "Tennis", "Philanthropy", "Astronomy", "Road Trips"]
  },
  {
    id: "JAIN-1007",
    name: "Yashvi Parikh",
    gender: "Female",
    age: 25,
    height: 5.3,
    religion: "Jain",
    sub_caste: "Jain - Porwal",
    gothram: "Parikh / Chhajed",
    education: "M.Sc Data Analytics, Warwick (UK)",
    occupation: "Senior Data Scientist",
    company: "Amazon Web Services",
    annualIncome: "₹32 - 40 LPA",
    location: "Mumbai, Maharashtra",
    city: "Mumbai",
    motherTongue: "Gujarati",
    maritalStatus: "Never Married",
    diet: "Jain Vegetarian",
    matchScore: 91,
    isVerified: true,
    isPremium: false,
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=600&q=80",
    about: "Cheerful data science enthusiast from a loving Jain family in South Mumbai. Passionate about culinary fusion, chess, and weekend nature walks. Seeking a compassionate and well-educated partner.",
    interests: ["Chess", "Jain Culinary Innovation", "Biking", "Podcasts"]
  },
  {
    id: "JAIN-1008",
    name: "Bhavik Kothari",
    gender: "Male",
    age: 31,
    height: 5.9,
    religion: "Jain",
    sub_caste: "Jain - Shwetambar Sthanakwasi",
    gothram: "Kothari / Bafna",
    education: "B.Com + LLB + Chartered Accountant (CA)",
    occupation: "Partner - Corporate Tax & Legal",
    company: "Kothari & Chambers Law LLP",
    annualIncome: "₹48 - 60 LPA",
    location: "Surat, Gujarat",
    city: "Surat",
    motherTongue: "Gujarati",
    maritalStatus: "Never Married",
    diet: "Pure Jain Vegetarian",
    matchScore: 93,
    isVerified: true,
    isPremium: true,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=80",
    about: "Legal and taxation partner managing prominent Jain business groups. Active in Jain educational trusts and sports clubs. Looking for a cultured life partner with a warm heart and strong family orientation.",
    interests: ["Corporate Law", "Swimming", "Community Seva", "Cricket"]
  },
  {
    id: "JAIN-1009",
    name: "Jhanvi Bhandari",
    gender: "Female",
    age: 27,
    height: 5.5,
    religion: "Jain",
    sub_caste: "Jain - Khandelwal",
    gothram: "Bhandari / Nahata",
    education: "MBA in Brand Strategy, SPJIMR",
    occupation: "Brand Marketing Lead",
    company: "Unilever India",
    annualIncome: "₹26 - 32 LPA",
    location: "Jaipur, Rajasthan",
    city: "Jaipur",
    motherTongue: "Marwari",
    maritalStatus: "Never Married",
    diet: "Pure Jain Vegetarian",
    matchScore: 90,
    isVerified: true,
    isPremium: false,
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80",
    about: "Brand strategist from a traditional Jain family in Jaipur. Loves Marwari folk art, baking Jain desserts, and participating in Mahavir Jayanti cultural programs. Looking for an educated, understanding partner.",
    interests: ["Brand Design", "Marwari Art", "Baking", "Cultural Events"]
  },
  {
    id: "JAIN-1010",
    name: "Moksh Chordia",
    gender: "Male",
    age: 32,
    height: 6.1,
    religion: "Jain",
    sub_caste: "Jain - Shwetambar Terapanthi",
    gothram: "Chordia / Lodha",
    education: "B.Tech + MBA (ISB Hyderabad)",
    occupation: "Founder & CEO",
    company: "Chordia CleanTech Ventures",
    annualIncome: "₹80 - 100 LPA",
    location: "Delhi NCR",
    city: "Delhi NCR",
    motherTongue: "Hindi",
    maritalStatus: "Never Married",
    diet: "Pure Jain Vegetarian",
    matchScore: 97,
    isVerified: true,
    isPremium: true,
    photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&h=600&q=80",
    about: "Clean energy entrepreneur motivated by Jain principles of environmental stewardship (Aparigraha & Jiva Raksha). Keen squash player, meditator, and angel investor. Seeking a partner to share life's purposeful journey.",
    interests: ["Clean Energy", "Squash", "Meditation", "Angel Investing", "Trekking"]
  }
];

const DEFAULT_FULL_CANDIDATES = JSON.parse(JSON.stringify(CANDIDATE_DATABASE));

// Strictly two genders: Male and Female
const VALID_GENDERS = Object.freeze(['Male', 'Female']);

function normalizeGender(gender) {
  if (!gender) return 'Female';
  const str = gender.toString().trim().toLowerCase();
  return str === 'male' ? 'Male' : 'Female';
}

// User Gender Configuration & Opposite-Gender Filter
function getUserGender() {
  const stored = localStorage.getItem('matrimony_user_gender');
  return normalizeGender(stored);
}

function getOppositeGender() {
  const current = getUserGender();
  return current === 'Female' ? 'Male' : 'Female';
}

function setUserGender(gender) {
  const normalized = normalizeGender(gender);
  localStorage.setItem('matrimony_user_gender', normalized);
  window.dispatchEvent(new CustomEvent('userGenderChanged', {
    detail: {
      userGender: normalized,
      oppositeGender: getOppositeGender()
    }
  }));
}

function toggleUserGender() {
  const current = getUserGender();
  const next = current.toLowerCase() === 'male' ? 'Female' : 'Male';
  setUserGender(next);
  if (window.toast) {
    const opp = getOppositeGender();
    const label = opp === 'Female' ? 'Brides (Female)' : 'Grooms (Male)';
    window.toast.show(`Your gender is set to <strong>${next}</strong>. Now viewing opposite-gender profiles: <strong>${label}</strong>`, 'success', 3000);
  }
}

function getOppositeGenderCandidates(candidatesList) {
  const target = getOppositeGender().toLowerCase();
  const list = (candidatesList && candidatesList.length > 0) ? candidatesList : (CANDIDATE_DATABASE || []);
  const filtered = list.filter(c => c && c.gender && c.gender.toLowerCase() === target);
  if (filtered.length > 0) return filtered;
  if (typeof DEFAULT_FULL_CANDIDATES !== 'undefined' && Array.isArray(DEFAULT_FULL_CANDIDATES)) {
    return DEFAULT_FULL_CANDIDATES.filter(c => c && c.gender && c.gender.toLowerCase() === target);
  }
  return [];
}

// Async loader to fetch live data from PostgreSQL API filtered by opposite gender
async function loadCandidatesFromApi(queryParams = {}) {
  if (!isUserLoggedIn() || isNewUserRestricted()) {
    if (!isUserLoggedIn()) requireAuth();
    return [];
  }
  const userId = getCurrentUserId();
  try {
    const base = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'http://localhost:3000';
    const url = new URL(`${API_BASE_URL}/candidates`, base);
    // Enforce opposite gender filtering by default
    if (!queryParams.gender) {
      queryParams.gender = getOppositeGender();
    }
    if (userId) {
      url.searchParams.append('user_id', userId);
    }
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== '') {
        url.searchParams.append(key, queryParams[key]);
      }
    });

    const res = await fetch(url, {
      headers: {
        'x-user-id': userId
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    
    if (json.success && Array.isArray(json.data)) {
      // Map API schema to client model
      CANDIDATE_DATABASE = json.data.map(item => ({
        id: item.id,
        name: item.name,
        gender: item.gender,
        age: item.age,
        height: item.height,
        religion: item.religion,
        sub_caste: item.sub_caste,
        gothram: item.gothram,
        education: item.education,
        occupation: item.occupation,
        company: item.company,
        annualIncome: item.annual_income,
        location: `${item.city}, ${item.state}`,
        city: item.city,
        motherTongue: item.mother_tongue,
        maritalStatus: item.marital_status,
        diet: item.diet,
        matchScore: item.match_score,
        isVerified: item.is_verified,
        isPremium: item.is_premium,
        photo: item.photo_url,
        about: item.about_me,
        interests: item.interests || []
      }));
      return CANDIDATE_DATABASE;
    }
  } catch (err) {
    console.warn('API fetch fallback to local Jain dataset:', err.message);
  }
  return getOppositeGenderCandidates(CANDIDATE_DATABASE);
}

// Automatically load from API on script load only for authenticated users
if (typeof window !== 'undefined' && isUserLoggedIn()) {
  loadCandidatesFromApi();
}

// User Authentication & Session State Management (Guest access removed)
function isUserLoggedIn() {
  const status = localStorage.getItem('matrimony_is_logged_in');
  const userId = localStorage.getItem('matrimony_user_id');
  return status === 'true' && Boolean(userId && userId.trim() !== '' && userId.trim() !== 'user_guest_default' && userId.trim().toLowerCase() !== 'guest');
}

// Check if user is a restricted new user registered with email (only allowed to create profile)
function isNewUserRestricted() {
  if (!isUserLoggedIn()) return false;
  return localStorage.getItem('matrimony_is_new_user') === 'true';
}

function requireAuth() {
  if (typeof window === 'undefined') return true;
  const path = window.location.pathname.toLowerCase();
  // Allow login pages, admin console, and 404 page without authenticated user session
  if (path.includes('login') || path.includes('admin') || path.includes('404')) {
    return true;
  }
  if (!isUserLoggedIn()) {
    const isSubdir = window.location.pathname.includes('/login_page/') || window.location.pathname.includes('/search_page/');
    const targetUrl = isSubdir ? '../login.html' : 'login.html';
    window.location.replace(targetUrl);
    return false;
  }
  // Restricted new user with email: only allow access to profile creation page
  if (isNewUserRestricted()) {
    if (!path.includes('profile')) {
      const isSubdir = window.location.pathname.includes('/login_page/') || window.location.pathname.includes('/search_page/');
      const targetUrl = isSubdir ? '../profile.html' : 'profile.html';
      window.location.replace(targetUrl);
      return false;
    }
  }
  return true;
}

// Enforce authentication gate immediately on script load
if (typeof window !== 'undefined') {
  requireAuth();
}

function setUserLoggedIn(loggedIn) {
  if (loggedIn) {
    localStorage.setItem('matrimony_is_logged_in', 'true');
  } else {
    localStorage.setItem('matrimony_is_logged_in', 'false');
    localStorage.removeItem('matrimony_user_id');
    localStorage.removeItem('matrimony_profile_is_active');
    localStorage.removeItem('matrimony_user_views_count');
    localStorage.removeItem('matrimony_viewed_candidate_ids');
    localStorage.removeItem('matrimony_is_new_user');
    localStorage.removeItem('matrimony_user_email');
    localStorage.removeItem('matrimony_profile_completed');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('userAuthStateChanged', { detail: { isLoggedIn: loggedIn } }));
  }
}

function logoutUser() {
  setUserLoggedIn(false);
  localStorage.removeItem('matrimony_user_id');
  localStorage.removeItem('matrimony_profile_is_active');
  localStorage.removeItem('matrimony_user_views_count');
  localStorage.removeItem('matrimony_viewed_candidate_ids');
  localStorage.removeItem('matrimony_user_biodata');
  localStorage.removeItem('matrimony_user_photo_url');
  localStorage.removeItem('matrimony_is_new_user');
  localStorage.removeItem('matrimony_user_email');
  localStorage.removeItem('matrimony_profile_completed');
  if (typeof window !== 'undefined') {
    if (window.toast) {
      window.toast.show('You have logged out successfully. 👋', 'info');
    }
    const isSubdir = window.location.pathname.includes('/login_page/') || window.location.pathname.includes('/search_page/');
    const targetUrl = isSubdir ? '../login.html' : 'login.html';
    setTimeout(() => {
      window.location.replace(targetUrl);
    }, 400);
  }
}

// User Identity & 75-Profile-View Quota API Connectors
function getCurrentUserId() {
  if (!isUserLoggedIn()) {
    return '';
  }
  const uid = localStorage.getItem('matrimony_user_id');
  return uid ? uid.trim() : '';
}

// Fetch single candidate profile with backend view-limit tracking (Max 75 profiles)
async function fetchCandidateProfileFromApi(candidateId) {
  if (!isUserLoggedIn() || isNewUserRestricted()) {
    if (!isUserLoggedIn()) requireAuth();
    return null;
  }
  const userId = getCurrentUserId();
  if (!userId) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/candidates/${encodeURIComponent(candidateId)}?user_id=${encodeURIComponent(userId)}`, {
      headers: {
        'x-user-id': userId
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend view tracking fetch error:', err.message);
    return null;
  }
}

// Get user's view count, 3-month profile validity and remaining credits
async function fetchUserQuota() {
  if (!isUserLoggedIn()) return null;
  const userId = getCurrentUserId();
  if (!userId) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/user-quota?user_id=${encodeURIComponent(userId)}`, {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json && json.success) {
      localStorage.setItem('matrimony_user_views_count', String(json.total_views || json.used || 0));
      if (json.profile_created_at) localStorage.setItem('matrimony_profile_created_at', json.profile_created_at);
      if (json.expires_at) localStorage.setItem('matrimony_profile_expires_at', json.expires_at);
      localStorage.setItem('matrimony_profile_days_remaining', String(json.days_remaining !== undefined ? json.days_remaining : 90));
      localStorage.setItem('matrimony_profile_is_expired', String(Boolean(json.is_time_expired)));
      localStorage.setItem('matrimony_profile_is_active', String(Boolean(json.is_active)));
    }
    return json;
  } catch (err) {
    return null;
  }
}

// Reset view quota and renew 3-month profile validity (for evaluation/demo)
async function resetUserQuota() {
  const userId = getCurrentUserId();
  try {
    const res = await fetch(`${API_BASE_URL}/user-quota/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ user_id: userId })
    });
    const json = await res.json();
    localStorage.setItem('matrimony_user_views_count', '0');
    localStorage.removeItem('matrimony_viewed_candidate_ids');
    if (json && json.profile_created_at) {
      localStorage.setItem('matrimony_profile_created_at', json.profile_created_at);
      localStorage.setItem('matrimony_profile_expires_at', json.expires_at);
      localStorage.setItem('matrimony_profile_days_remaining', String(json.days_remaining !== undefined ? json.days_remaining : 90));
      localStorage.setItem('matrimony_profile_is_expired', 'false');
    }
    return json;
  } catch (err) {
    return null;
  }
}

// Simulate reaching the 75 view limit (for evaluation/demo)
async function simulateLimitQuota() {
  const userId = getCurrentUserId();
  try {
    const res = await fetch(`${API_BASE_URL}/user-quota/simulate-limit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ user_id: userId })
    });
    const json = await res.json();
    localStorage.setItem('matrimony_user_views_count', '75');
    return json;
  } catch (err) {
    return null;
  }
}

// Simulate reaching the 3-month profile validity expiration (for evaluation/demo)
async function simulateExpiryQuota() {
  const userId = getCurrentUserId();
  try {
    const res = await fetch(`${API_BASE_URL}/user-quota/simulate-expiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ user_id: userId })
    });
    const json = await res.json();
    if (json && json.success) {
      localStorage.setItem('matrimony_profile_is_expired', 'true');
      localStorage.setItem('matrimony_profile_days_remaining', '0');
      if (json.expires_at) localStorage.setItem('matrimony_profile_expires_at', json.expires_at);
    }
    return json;
  } catch (err) {
    return null;
  }
}

// Save User Photo into Database
async function saveUserPhotoToApi(photoData, caption = 'Profile Photo') {
  const userId = getCurrentUserId();
  try {
    const res = await fetch(`${API_BASE_URL}/user-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({
        photo_data: photoData,
        caption: caption,
        is_primary: true,
        user_id: userId
      })
    });
    const json = await res.json();
    if (json && json.success) {
      if (json.photo_url) {
        localStorage.setItem('matrimony_user_photo_url', json.photo_url);
      }
    }
    return json;
  } catch (err) {
    console.warn('API user-photo error, storing locally:', err.message);
    localStorage.setItem('matrimony_user_photo_url', photoData);
    return {
      success: true,
      photo_url: photoData,
      is_offline: true
    };
  }
}

// Save User Biodata into Database
async function saveUserBiodataToApi(biodata) {
  const userId = getCurrentUserId();
  try {
    const res = await fetch(`${API_BASE_URL}/biodata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({
        ...biodata,
        user_id: userId
      })
    });
    const json = await res.json();
    if (json && json.success) {
      localStorage.setItem('matrimony_user_biodata', JSON.stringify(json.data));
      if (biodata.gender) {
        setUserGender(biodata.gender);
      }
    }
    return json;
  } catch (err) {
    console.warn('API biodata error, saving to local cache:', err.message);
    localStorage.setItem('matrimony_user_biodata', JSON.stringify(biodata));
    if (biodata.gender) {
      setUserGender(biodata.gender);
    }
    return {
      success: true,
      data: biodata,
      is_offline: true
    };
  }
}

// Fetch User Biodata from Database
async function fetchUserBiodataFromApi() {
  const userId = getCurrentUserId();
  try {
    const res = await fetch(`${API_BASE_URL}/biodata?user_id=${encodeURIComponent(userId)}`, {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json && json.success && json.data) {
      localStorage.setItem('matrimony_user_biodata', JSON.stringify(json.data));
      return json.data;
    }
  } catch (err) {
    console.warn('Could not fetch biodata from API:', err.message);
  }

  // Fallback to local cache
  const cached = localStorage.getItem('matrimony_user_biodata');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  return null;
}


// Helper to generate candidate card HTML - Displays only the "View Profile" button
function createCandidateCard(candidate) {
  return `
    <article class="candidate-card" data-id="${candidate.id}" data-age="${candidate.age}" data-height="${candidate.height}">
      <div class="candidate-media-wrap">
        <img src="${candidate.photo}" alt="${candidate.name}" class="candidate-img" loading="lazy">
        <div class="candidate-gradient-overlay"></div>
        <div class="candidate-media-footer">
          <div class="candidate-card-name">
            ${candidate.name}
          </div>
          <div class="candidate-card-id">${candidate.id} · ${candidate.age} Yrs · ${candidate.height} Ft</div>
        </div>
      </div>

      <div class="candidate-content">
        <div class="candidate-tags-row">
          <span class="tag-badge" style="color: var(--primary); font-weight: 700;">${candidate.sub_caste || 'Jain'}</span>
          <span class="tag-badge">${candidate.education}</span>
          <span class="tag-badge">${candidate.motherTongue}</span>
        </div>

        <div class="candidate-info-list">
          <div class="info-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            <span>${candidate.occupation} (${candidate.annualIncome})</span>
          </div>
          <div class="info-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${candidate.location}</span>
          </div>
          <div class="info-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>Gothram: ${candidate.gothram || 'Kashyapa'} · ${candidate.diet}</span>
          </div>
        </div>
      </div>

      <div class="candidate-card-actions">
        <button type="button" class="btn btn-primary" onclick="openCandidateDetailModal('${candidate.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          <span>View Profile</span>
        </button>
      </div>
    </article>
  `;
}

// Local Storage & API helpers for Recently Viewed Profiles
function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem('matrimony_recently_viewed')) || [];
  } catch(e) {
    return [];
  }
}

function addRecentlyViewed(id) {
  if (!id) return;
  let list = getRecentlyViewed();
  // Place latest viewed profile at the very top (index 0)
  list = list.filter(item => item !== id);
  list.unshift(id);
  // Cap at 75 recent profiles
  if (list.length > 75) list = list.slice(0, 75);
  localStorage.setItem('matrimony_recently_viewed', JSON.stringify(list));

  // Trigger callback if current page is listening
  if (typeof window.onRecentlyViewedUpdated === 'function') {
    window.onRecentlyViewedUpdated();
  }

  // Update on-page recently viewed stat count if element exists
  const countEl = document.getElementById('stat-recently-viewed-count');
  if (countEl) {
    countEl.textContent = list.length;
  }
}

function clearRecentlyViewed() {
  localStorage.removeItem('matrimony_recently_viewed');
  if (typeof window.onRecentlyViewedUpdated === 'function') {
    window.onRecentlyViewedUpdated();
  }
  const countEl = document.getElementById('stat-recently-viewed-count');
  if (countEl) countEl.textContent = '0';
}

// Fetch recently viewed profiles directly from PostgreSQL backend
async function fetchRecentlyViewedFromApi() {
  if (!isUserLoggedIn() || isNewUserRestricted()) return [];
  const userId = getCurrentUserId();
  if (!userId) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/recently-viewed?user_id=${encodeURIComponent(userId)}`, {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map(item => ({
        id: item.id,
        name: item.name,
        gender: item.gender,
        age: item.age,
        height: item.height,
        religion: item.religion,
        sub_caste: item.sub_caste,
        gothram: item.gothram,
        education: item.education,
        occupation: item.occupation,
        company: item.company,
        annualIncome: item.annual_income,
        location: `${item.city}, ${item.state}`,
        city: item.city,
        motherTongue: item.mother_tongue,
        maritalStatus: item.marital_status,
        diet: item.diet,
        matchScore: item.match_score,
        isVerified: item.is_verified,
        isPremium: item.is_premium,
        photo: item.photo_url,
        about: item.about_me,
        interests: item.interests || []
      }));
    }
  } catch (err) {
    console.warn('Fallback to localStorage recently viewed:', err.message);
  }
  return null;
}

// Compatibility stubs for any legacy references
function getShortlist() { return getRecentlyViewed(); }
function isCandidateShortlisted(id) { return getRecentlyViewed().includes(id); }
function toggleCandidateShortlist(id) { addRecentlyViewed(id); }

function getInterests() {
  try {
    return JSON.parse(localStorage.getItem('matrimony_interests')) || ["JAIN-1002"];
  } catch(e) {
    return [];
  }
}

function isInterestExpressed(id) {
  return getInterests().includes(id);
}

function expressInterest(id) {
  let interests = getInterests();
  const candidate = CANDIDATE_DATABASE.find(c => c.id === id);
  const name = candidate ? candidate.name : id;

  if (interests.includes(id)) {
    if (window.toast) window.toast.show(`You already sent an interest to ${name}`, 'info');
    return;
  }

  interests.push(id);
  localStorage.setItem('matrimony_interests', JSON.stringify(interests));
  
  if (window.toast) window.toast.show(`Interest request sent to ${name} successfully! 💖`, 'success');

  const interestBtn = document.getElementById(`btn-interest-${id}`);
  if (interestBtn) {
    interestBtn.className = 'btn btn-secondary btn-sm';
    interestBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      <span>Interest Sent</span>
    `;
  }
}

// ============================================================================
// ADMIN PANEL CLIENT CONNECTOR FUNCTIONS
// ============================================================================

function getAdminAuthKey() {
  return sessionStorage.getItem('matrimony_admin_key') || localStorage.getItem('matrimony_admin_key') || '';
}

function setAdminAuthKey(key) {
  sessionStorage.setItem('matrimony_admin_key', key);
  sessionStorage.setItem('matrimony_admin_authenticated', 'true');
  localStorage.setItem('matrimony_admin_key', key);
}

function isAdminAuthenticated() {
  return Boolean(sessionStorage.getItem('matrimony_admin_authenticated') === 'true' && getAdminAuthKey());
}

function adminLogout() {
  sessionStorage.removeItem('matrimony_admin_key');
  sessionStorage.removeItem('matrimony_admin_authenticated');
  localStorage.removeItem('matrimony_admin_key');
}

async function adminLogin(passkey) {
  const url = `${API_BASE_URL}/admin/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passkey })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Authentication failed: Invalid admin passkey.');
  }
  setAdminAuthKey(json.token || passkey);
  return json;
}

// Fetch candidate list with search, filter, and pagination for Admin Panel
async function fetchAdminCandidates(params = {}) {
  const queryParts = [];
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.gender) queryParts.push(`gender=${encodeURIComponent(params.gender)}`);
  if (params.sub_caste) queryParts.push(`sub_caste=${encodeURIComponent(params.sub_caste)}`);
  if (params.city) queryParts.push(`city=${encodeURIComponent(params.city)}`);
  if (params.is_verified !== undefined && params.is_verified !== '') queryParts.push(`is_verified=${encodeURIComponent(params.is_verified)}`);
  if (params.sort_by) queryParts.push(`sort_by=${encodeURIComponent(params.sort_by)}`);
  if (params.order) queryParts.push(`order=${encodeURIComponent(params.order)}`);
  if (params.page) queryParts.push(`page=${encodeURIComponent(params.page)}`);
  if (params.limit) queryParts.push(`limit=${encodeURIComponent(params.limit)}`);

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const url = `${API_BASE_URL}/admin/candidates${qs}`;

  const res = await fetch(url, {
    headers: {
      'x-admin-key': getAdminAuthKey()
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// Fetch single candidate full profile for Admin
async function fetchAdminCandidateById(id) {
  const url = `${API_BASE_URL}/admin/candidates/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: {
      'x-admin-key': getAdminAuthKey()
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// Create new candidate profile
async function createAdminCandidate(candidateData) {
  const url = `${API_BASE_URL}/admin/candidates`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': getAdminAuthKey()
    },
    body: JSON.stringify(candidateData)
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json;
}

// Update existing candidate profile
async function updateAdminCandidate(id, candidateData) {
  const url = `${API_BASE_URL}/admin/candidates/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': getAdminAuthKey()
    },
    body: JSON.stringify(candidateData)
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json;
}

// Delete candidate profile by ID
async function deleteAdminCandidate(id) {
  const url = `${API_BASE_URL}/admin/candidates/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'x-admin-key': getAdminAuthKey()
    }
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json;
}

// Fetch admin analytics stats
async function fetchAdminStats() {
  const url = `${API_BASE_URL}/admin/stats`;
  const res = await fetch(url, {
    headers: {
      'x-admin-key': getAdminAuthKey()
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// Fetch all registered user accounts for Admin
async function fetchAdminUsers() {
  const url = `${API_BASE_URL}/admin/users`;
  const res = await fetch(url, {
    headers: {
      'x-admin-key': getAdminAuthKey()
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// Activate a user account by Admin (allows viewing candidate contact coordinates)
async function activateAdminUser(userId) {
  const url = `${API_BASE_URL}/admin/users/${encodeURIComponent(userId)}/activate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-admin-key': getAdminAuthKey()
    }
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json;
}

// Deactivate a user account by Admin
async function deactivateAdminUser(userId) {
  const url = `${API_BASE_URL}/admin/users/${encodeURIComponent(userId)}/deactivate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-admin-key': getAdminAuthKey()
    }
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json;
}

// Activate candidate profile by Admin
async function activateAdminCandidate(candidateId) {
  const url = `${API_BASE_URL}/admin/candidates/${encodeURIComponent(candidateId)}/activate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-admin-key': getAdminAuthKey()
    }
  });
  return await res.json();
}

// Deactivate candidate profile by Admin
async function deactivateAdminCandidate(candidateId) {
  const url = `${API_BASE_URL}/admin/candidates/${encodeURIComponent(candidateId)}/deactivate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-admin-key': getAdminAuthKey()
    }
  });
  return await res.json();
}

// Quick toggle current user active status (for demo and testing)
async function toggleUserActivation() {
  const userId = getCurrentUserId();
  try {
    const res = await fetch(`${API_BASE_URL}/user-quota/toggle-active`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId }
    });
    const json = await res.json();
    if (json && json.success) {
      localStorage.setItem('matrimony_profile_is_active', String(Boolean(json.is_active)));
    }
    return json;
  } catch (err) {
    return null;
  }
}
