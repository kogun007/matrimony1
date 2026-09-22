export async function onRequest(context) {
  const method = context.request.method;
  
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-user-id'
      }
    });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  return new Response(JSON.stringify({
    success: true,
    limit: 75,
    used: 1,
    total_views: 1,
    remaining: 74,
    is_view_limit_reached: false,
    validity_months: 3,
    profile_created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    days_remaining: 90,
    is_time_expired: false,
    is_limit_reached: false,
    can_view_contact: true
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
