export default async (request, context) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Only handle model file requests
  if (!pathname.startsWith('/models/')) {
    return;
  }
  
  // Extract the model path
  const modelPath = pathname.replace('/models/', '');
  
  // Map to HuggingFace URLs
  const huggingFaceUrl = `https://huggingface.co/${modelPath}`;
  
  try {
    // Fetch from HuggingFace with proper headers
    const response = await fetch(huggingFaceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Cleros/1.0)',
        'Accept': request.headers.get('Accept') || '*/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch model file: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Set appropriate content type based on file extension
    let finalContentType = contentType;
    if (pathname.endsWith('.json')) {
      finalContentType = 'application/json';
    } else if (pathname.endsWith('.onnx')) {
      finalContentType = 'application/octet-stream';
    } else if (pathname.endsWith('.wasm')) {
      finalContentType = 'application/wasm';
    }
    
    // Return the file with proper headers for caching
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': finalContentType,
        'Cache-Control': 'public, max-age=86400, immutable', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Model proxy error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to load model file',
      path: pathname,
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
