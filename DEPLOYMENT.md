# Cleros Deployment Guide

## Environment Variables Required

### Random.org API Configuration

Cleros requires a Random.org API key for Oracle mode functionality:

1. **Get API Key**: Visit [Random.org API Keys](https://api.random.org/api-keys) to create a free account and generate an API key
2. **Free Tier**: Provides 1,000 API requests per day at no cost
3. **Configuration**: Set the environment variable `RANDOMORG_API_KEY`

### For Local Development

1. Create a `.env` file in the project root:
   ```bash
   touch .env
   ```

2. Add your API configuration to `.env` (server-side only, never exposed to client):
   ```
   RANDOMORG_API_KEY=your-actual-api-key-here
   RANDOMORG_API_ENDPOINT=https://api.random.org/json-rpc/4/invoke
   ```

### For Netlify Deployment

1. In your Netlify dashboard, go to Site Settings → Environment Variables
2. Add the environment variables:
   - **Key**: `RANDOMORG_API_KEY` | **Value**: Your Random.org API key
   - **Key**: `RANDOMORG_API_ENDPOINT` | **Value**: `https://api.random.org/json-rpc/4/invoke`

### Without API Key

If no API key is configured:
- Oracle mode will be automatically disabled
- Users will see a warning message
- Counsel mode (semantic search) will still work normally

## Environment Variable Validation

### Testing Your Configuration

To test if your Random.org API key is working:

```bash
# Test locally (after setting up .env file)
curl -X POST http://localhost:3000/.netlify/functions/random-oracle \
  -H "Content-Type: application/json" \
  -d '{"min": 1, "max": 10, "count": 1}'

# Test on Netlify (replace with your domain)
curl -X POST https://your-site.netlify.app/.netlify/functions/random-oracle \
  -H "Content-Type: application/json" \
  -d '{"min": 1, "max": 10, "count": 1}'
```

**Expected Response** (if configured correctly):
```json
{
  "numbers": [7]
}
```

**Error Response** (if API key missing):
```json
{
  "error": "Random.org API key not configured",
  "details": "Please set RANDOMORG_API_KEY environment variable in Netlify dashboard",
  "setup_url": "https://docs.netlify.com/configure-builds/environment-variables/"
}
```

## Build & Deploy

```bash
cd web
npm install
npm run build
```

The built files will be in `web/dist/` ready for deployment.

## Troubleshooting

### Common Issues

1. **"Random.org API key not configured"**
   - Check that `RANDOMORG_API_KEY` is set in Netlify environment variables
   - Verify the API key is valid at [Random.org](https://api.random.org/api-keys)

2. **Large bundle size warnings**
   - The transformers library is now loaded on-demand
   - First-time semantic search users will see a loading indicator
   - Subsequent uses will be fast due to caching

3. **Edge function errors**
   - Ensure only the `.ts` version of edge functions exists
   - Netlify automatically compiles TypeScript edge functions
