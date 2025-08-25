import type { Context } from "@netlify/edge-functions";

const HUGGINGFACE_BASE_URL = "https://huggingface.co";
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Extract the model file path from the request
  // Expected format: /models/all-MiniLM-L6-v2/filename
  const match = pathname.match(/^\/models\/all-MiniLM-L6-v2\/(.+)$/);
  
  if (!match) {
    return new Response("Not found", { status: 404 });
  }
  
  const filename = match[1];
  
  // Map common transformers.js files to their HuggingFace paths
  const fileMapping: Record<string, string> = {
    'config.json': `${HUGGINGFACE_BASE_URL}/${MODEL_NAME}/resolve/main/config.json`,
    'tokenizer.json': `${HUGGINGFACE_BASE_URL}/${MODEL_NAME}/resolve/main/tokenizer.json`,
    'tokenizer_config.json': `${HUGGINGFACE_BASE_URL}/${MODEL_NAME}/resolve/main/tokenizer_config.json`,
    'onnx/model.onnx': `${HUGGINGFACE_BASE_URL}/${MODEL_NAME}/resolve/main/onnx/model.onnx`,
    'onnx/model_quantized.onnx': `${HUGGINGFACE_BASE_URL}/${MODEL_NAME}/resolve/main/onnx/model_quantized.onnx`,
    // Add WASM files that transformers.js might need
    'ort-wasm.wasm': `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort-wasm.wasm`,
    'ort-wasm-simd.wasm': `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort-wasm-simd.wasm`,
    'ort-wasm-threaded.wasm': `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort-wasm-threaded.wasm`,
    'ort-wasm-simd-threaded.wasm': `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort-wasm-simd-threaded.wasm`,
  };
  
  const huggingfaceUrl = fileMapping[filename];
  
  if (!huggingfaceUrl) {
    return new Response("File not found", { status: 404 });
  }
  
  try {
    console.log(`Fetching model file: ${filename} from ${huggingfaceUrl}`);
    
    const response = await fetch(huggingfaceUrl);
    
    if (!response.ok) {
      throw new Error(`HuggingFace responded with ${response.status}: ${response.statusText}`);
    }
    
    // Set proper MIME types for different file types
    let contentType = response.headers.get('content-type');
    if (!contentType) {
      if (filename.endsWith('.json')) {
        contentType = 'application/json';
      } else if (filename.endsWith('.onnx')) {
        contentType = 'application/octet-stream';
      } else if (filename.endsWith('.wasm')) {
        contentType = 'application/wasm';
      } else if (filename.endsWith('.bin')) {
        contentType = 'application/octet-stream';
      } else {
        contentType = 'application/octet-stream';
      }
    }
    
    // Cache for 1 year since model files don't change
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    
    return new Response(response.body, {
      status: 200,
      headers,
    });
    
  } catch (error) {
    console.error(`Error fetching model file ${filename}:`, error);
    return new Response(`Error fetching model file: ${error.message}`, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
};

export const config = {
  path: "/models/all-MiniLM-L6-v2/*",
};
