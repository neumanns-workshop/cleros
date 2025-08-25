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

## Build & Deploy

```bash
cd web
npm install
npm run build
```

The built files will be in `web/dist/` ready for deployment.
