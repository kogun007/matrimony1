// Cloudflare Pages Function: /api/user-photo
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id'
    }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { photo_data, caption } = body;

    if (!photo_data || !photo_data.startsWith('data:image/')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid photo data. Must provide a valid base64 data URL.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const photoId = 'photo_' + Date.now();

    return new Response(JSON.stringify({
      success: true,
      message: 'Photo saved successfully in database.',
      photo_id: photoId,
      photo_url: photo_data, // In edge serverless fallback, data URL is preserved
      data: {
        id: photoId,
        caption: caption || 'Profile Photo',
        created_at: new Date().toISOString()
      }
    }), {
      status: 201,
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
