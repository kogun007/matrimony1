export async function onRequestGet() {
  return new Response(JSON.stringify({
    status: 'healthy',
    platform: 'Cloudflare Pages Edge',
    database: 'Cloudflare Edge Functions',
    candidates: 10,
    server_time: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
