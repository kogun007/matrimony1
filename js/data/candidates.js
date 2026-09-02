/**
 * Jain Matrimony Candidate Profiles Database & API Connector (PostgreSQL Backend)
 */
const API_BASE_URL = 'http://localhost:3000/api';

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

// Async loader to fetch live data from PostgreSQL API
async function loadCandidatesFromApi(queryParams = {}) {
  try {
    const url = new URL(`${API_BASE_URL}/candidates`);
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== '') {
        url.searchParams.append(key, queryParams[key]);
      }
    });

    const res = await fetch(url);
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
  return CANDIDATE_DATABASE;
}

// Automatically load from API on script load
loadCandidatesFromApi();

// Helper to generate candidate card HTML
function createCandidateCard(candidate) {
  const isShortlisted = isCandidateShortlisted(candidate.id);
  const isExpressed = isInterestExpressed(candidate.id);

  return `
    <article class="candidate-card" data-id="${candidate.id}" data-age="${candidate.age}" data-height="${candidate.height}">
      <div class="candidate-media-wrap">
        <img src="${candidate.photo}" alt="${candidate.name}" class="candidate-img" loading="lazy">
        <div class="candidate-gradient-overlay"></div>
        
        <div class="match-score-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#34d399"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span>${candidate.matchScore}% Match</span>
        </div>

        <button type="button" class="btn-shortlist-float ${isShortlisted ? 'favorited' : ''}" 
          onclick="toggleCandidateShortlist('${candidate.id}')" 
          aria-label="Shortlist ${candidate.name}"
          title="${isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isShortlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>

        <div class="candidate-media-footer">
          <div class="candidate-card-name">
            ${candidate.name}
            ${candidate.isVerified ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="#60a5fa" stroke="none" title="Verified Jain Profile"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>` : ''}
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
        <button type="button" class="btn btn-secondary btn-sm" onclick="openCandidateDetailModal('${candidate.id}')">
          <span>View Bio</span>
        </button>
        <button type="button" class="btn ${isExpressed ? 'btn-secondary' : 'btn-primary'} btn-sm" id="btn-interest-${candidate.id}" onclick="expressInterest('${candidate.id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span>${isExpressed ? 'Interest Sent' : 'Connect'}</span>
        </button>
      </div>
    </article>
  `;
}

// Local Storage helpers for dynamic client-side interactions
function getShortlist() {
  try {
    return JSON.parse(localStorage.getItem('matrimony_shortlist')) || ["JAIN-1001", "JAIN-1004"];
  } catch(e) {
    return [];
  }
}

function isCandidateShortlisted(id) {
  return getShortlist().includes(id);
}

function toggleCandidateShortlist(id) {
  let list = getShortlist();
  const candidate = CANDIDATE_DATABASE.find(c => c.id === id);
  const name = candidate ? candidate.name : id;
  
  if (list.includes(id)) {
    list = list.filter(item => item !== id);
    if (window.toast) window.toast.show(`Removed ${name} from your shortlist`, 'info');
  } else {
    list.push(id);
    if (window.toast) window.toast.show(`Added ${name} to your shortlisted Jain profiles! ⭐`, 'success');
  }
  
  localStorage.setItem('matrimony_shortlist', JSON.stringify(list));
  
  const buttons = document.querySelectorAll(`button[onclick="toggleCandidateShortlist('${id}')"]`);
  buttons.forEach(btn => {
    const isNowShortlisted = list.includes(id);
    btn.classList.toggle('favorited', isNowShortlisted);
    btn.querySelector('svg').setAttribute('fill', isNowShortlisted ? 'currentColor' : 'none');
    btn.title = isNowShortlisted ? 'Remove from shortlist' : 'Add to shortlist';
  });

  if (typeof window.onShortlistUpdated === 'function') {
    window.onShortlistUpdated();
  }
}

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
