const CANDIDATES = [
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
    annual_income: "₹35 - 45 LPA",
    city: "Mumbai",
    state: "Maharashtra",
    mother_tongue: "Gujarati",
    marital_status: "Never Married",
    diet: "Pure Jain Vegetarian",
    match_score: 97,
    is_verified: true,
    is_premium: true,
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=600&q=80",
    about_me: "Dedicated medical professional rooted in Jain Navkar traditions and Ahimsa principles. Passionate about dermatological research, classical harmonium, and weekend spiritual satsangs.",
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
    annual_income: "₹55 - 70 LPA",
    city: "Mumbai",
    state: "Maharashtra",
    mother_tongue: "Gujarati",
    marital_status: "Never Married",
    diet: "Jain Vegetarian",
    match_score: 98,
    is_verified: true,
    is_premium: true,
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=600&q=80",
    about_me: "Finance professional with an entrepreneurial mindset. Family-oriented, avid badminton player, and regular practitioner of Jain Samayik and meditation.",
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
    annual_income: "₹30 - 38 LPA",
    city: "Bengaluru",
    state: "Karnataka",
    mother_tongue: "Marwari",
    marital_status: "Never Married",
    diet: "Pure Jain Vegetarian",
    match_score: 94,
    is_verified: true,
    is_premium: true,
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=600&q=80",
    about_me: "CA rank holder from a respectable Terapanthi Jain family. Enthusiastic about Jain Preksha Dhyan, art curation, and exploring heritage temple architecture.",
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
    annual_income: "₹75 - 90 LPA",
    city: "Bengaluru",
    state: "Karnataka",
    mother_tongue: "Gujarati",
    marital_status: "Never Married",
    diet: "Jain Vegetarian",
    match_score: 95,
    is_verified: true,
    is_premium: true,
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=600&q=80",
    about_me: "AI engineer and tech innovator with rooted Jain values. Practicing Aparigraha (minimalism), passionate about long-distance running and Hindustani classical flute.",
    interests: ["AI Ethics", "Marathon Running", "Bansuri Flute", "Trekking", "Podcast Production"]
  },
  {
    id: "JAIN-1005",
    name: "Tanvi Gandhi",
    gender: "Female",
    age: 27,
    height: 5.3,
    religion: "Jain",
    sub_caste: "Jain - Shwetambar Sthanakwasi",
    gothram: "Gandhi / Kothari",
    education: "M.Sc. Clinical Nutrition, SNDT University",
    occupation: "Chief Clinical Dietitian",
    company: "Fortis Memorial Research Hospital",
    annual_income: "₹22 - 28 LPA",
    city: "Ahmedabad",
    state: "Gujarat",
    mother_tongue: "Gujarati",
    marital_status: "Never Married",
    diet: "Pure Jain Vegetarian",
    match_score: 92,
    is_verified: true,
    is_premium: false,
    photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&h=600&q=80",
    about_me: "Passionate healthcare professional advocating mindful plant-based Jain nourishment. Family-first, cheerful, and loves culinary experimentation with Jain-friendly recipes.",
    interests: ["Jain Culinary Arts", "Holistic Wellness", "Organic Gardening", "Mandala Art"]
  },
  {
    id: "JAIN-1006",
    name: "Aarav Jain",
    gender: "Male",
    age: 29,
    height: 5.10,
    religion: "Jain",
    sub_caste: "Jain - Digambar",
    gothram: "Jain / Kasliwal",
    education: "B.Arch (SPA Delhi) + Master of Urban Design (NUS)",
    occupation: "Associate Director - Sustainable Architecture",
    company: "HOK Design Global",
    annual_income: "₹45 - 55 LPA",
    city: "Pune",
    state: "Maharashtra",
    mother_tongue: "Hindi",
    marital_status: "Never Married",
    diet: "Pure Jain Vegetarian",
    match_score: 96,
    is_verified: true,
    is_premium: true,
    photo_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&h=600&q=80",
    about_me: "Digambar Jain architect committed to sustainable and biophilic design. Devout follower of Jain Jinendra puja, enthusiast of nature photography and heritage temple restoration.",
    interests: ["Heritage Restoration", "Jain Jinendra Puja", "Architecture Sketching", "Tennis"]
  },
  {
    id: "JAIN-1007",
    name: "Yashvi Parikh",
    gender: "Female",
    age: 28,
    height: 5.6,
    religion: "Jain",
    sub_caste: "Jain - Porwal",
    gothram: "Parikh / Munot",
    education: "B.Com + LL.B. (Government Law College, Mumbai)",
    occupation: "Senior Corporate Legal Counsel",
    company: "Tata Sons Legal Group",
    annual_income: "₹38 - 48 LPA",
    city: "Mumbai",
    state: "Maharashtra",
    mother_tongue: "Gujarati",
    marital_status: "Never Married",
    diet: "Pure Jain Vegetarian",
    match_score: 91,
    is_verified: true,
    is_premium: true,
    photo_url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&h=600&q=80",
    about_me: "Corporate attorney specializing in IP and cross-border transactions. Deep reverence for Jain philosophy of Anekantavada (multiplicity of viewpoints). Looking for a mutually respectful companion.",
    interests: ["Anekantavada Philosophy", "Debate & Rhetoric", "Violin", "Swimming"]
  },
  {
    id: "JAIN-1008",
    name: "Bhavik Kothari",
    gender: "Male",
    age: 31,
    height: 5.9,
    religion: "Jain",
    sub_caste: "Jain - Shwetambar Murti Pujak",
    gothram: "Kothari / Shah",
    education: "Chartered Accountant (FCA) + CS",
    occupation: "Partner - Corporate Tax & Regulatory",
    company: "Kothari & Associates LLP",
    annual_income: "₹60 - 75 LPA",
    city: "Surat",
    state: "Gujarat",
    mother_tongue: "Gujarati",
    marital_status: "Never Married",
    diet: "Jain Vegetarian",
    match_score: 93,
    is_verified: true,
    is_premium: true,
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=80",
    about_me: "Legal and taxation partner managing prominent Jain business groups. Active in Jain educational trusts and sports clubs. Looking for a cultured life partner with a warm heart.",
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
    annual_income: "₹26 - 32 LPA",
    city: "Jaipur",
    state: "Rajasthan",
    mother_tongue: "Marwari",
    marital_status: "Never Married",
    diet: "Pure Jain Vegetarian",
    match_score: 90,
    is_verified: true,
    is_premium: false,
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80",
    about_me: "Brand strategist from a traditional Jain family in Jaipur. Loves Marwari folk art, baking Jain desserts, and participating in Mahavir Jayanti cultural programs.",
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
    annual_income: "₹80 - 100 LPA",
    city: "Delhi NCR",
    state: "Delhi NCR",
    mother_tongue: "Hindi",
    marital_status: "Never Married",
    diet: "Pure Jain Vegetarian",
    match_score: 97,
    is_verified: true,
    is_premium: true,
    photo_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&h=600&q=80",
    about_me: "Clean energy entrepreneur motivated by Jain principles of environmental stewardship (Aparigraha & Jiva Raksha). Keen squash player, meditator, and angel investor.",
    interests: ["Clean Energy", "Squash", "Meditation", "Angel Investing", "Trekking"]
  }
];

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const gender = url.searchParams.get('gender');
  const query = url.searchParams.get('query');
  const ageMax = url.searchParams.get('age_max') ? parseInt(url.searchParams.get('age_max'), 10) : null;
  const heightMin = url.searchParams.get('height_min') ? parseFloat(url.searchParams.get('height_min')) : null;
  const subCaste = url.searchParams.get('sub_caste');
  const marital = url.searchParams.get('marital_status');

  let results = [...CANDIDATES];

  if (gender) {
    const target = gender.toLowerCase() === 'male' ? 'Male' : 'Female';
    results = results.filter(c => c.gender.toLowerCase() === target.toLowerCase());
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(c => c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }

  if (ageMax) {
    results = results.filter(c => c.age <= ageMax);
  }

  if (heightMin) {
    results = results.filter(c => c.height >= heightMin);
  }

  if (subCaste) {
    results = results.filter(c => c.sub_caste.toLowerCase() === subCaste.toLowerCase());
  }

  if (marital) {
    results = results.filter(c => c.marital_status.toLowerCase() === marital.toLowerCase());
  }

  return new Response(JSON.stringify({
    success: true,
    count: results.length,
    data: results
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
