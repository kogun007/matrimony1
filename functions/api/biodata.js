// Cloudflare Pages Function: /api/biodata
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id'
    }
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const userId = context.request.headers.get('x-user-id') || url.searchParams.get('user_id') || 'JAIN-USER-CURRENT';

  return new Response(JSON.stringify({
    success: true,
    user_id: userId,
    is_new_user: false,
    data: {
      user_id: userId,
      full_name: 'Priya Sharma',
      gender: 'Female',
      dob: '1999-06-14',
      marital_status: 'Never Married',
      mother_tongue: 'Marathi',
      diet: 'Vegetarian',
      location: 'Pune, Maharashtra, India',
      about_me: 'Software engineer working at a leading cloud tech firm in Pune. Passionate about classical Indian dance, landscape painting, and weekend baking.',
      education: 'B.Tech in Computer Science',
      college: 'COEP Technological University, Pune',
      occupation: 'Senior Frontend Engineer',
      company: 'Cisco Systems',
      annual_income: '₹24 - 30 LPA',
      rashi: 'Kanya (Virgo)',
      nakshatra: 'Hasta',
      gothram: 'Kashyapa',
      manglik: 'Non-Manglik',
      pref_age: '26 to 32 Years',
      pref_height: '5.6 to 6.2 Feet',
      pref_education: 'B.Tech, MS, MBA, MBBS, MD',
      pref_locations: 'Pune, Mumbai, Bangalore, Hyderabad',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&h=250&q=80'
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const userId = context.request.headers.get('x-user-id') || body.user_id || 'JAIN-USER-CURRENT';

    return new Response(JSON.stringify({
      success: true,
      message: 'Biodata saved successfully.',
      data: {
        ...body,
        user_id: userId,
        updated_at: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
