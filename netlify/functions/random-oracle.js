exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const apiKey = process.env.RANDOMORG_API_KEY;
  const apiUrl = process.env.RANDOMORG_API_ENDPOINT;

  if (!apiKey || !apiUrl) {
    const missingVars = [];
    if (!apiKey) missingVars.push('RANDOMORG_API_KEY');
    if (!apiUrl) missingVars.push('RANDOMORG_API_ENDPOINT');
    
    console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Random.org API not configured',
        details: `Please set the following environment variables in Netlify dashboard: ${missingVars.join(', ')}`,
        setup_url: 'https://docs.netlify.com/configure-builds/environment-variables/'
      })
    };
  }

  try {
    const { min, max, count = 1 } = JSON.parse(event.body);

    if (typeof min !== 'number' || typeof max !== 'number' || typeof count !== 'number') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid parameters. min, max, and count must be numbers' })
      };
    }

    const requestBody = {
      jsonrpc: '2.0',
      method: 'generateIntegers',
      params: {
        apiKey: apiKey,
        n: count,
        min: min,
        max: max,
        replacement: true
      },
      id: Math.floor(Math.random() * 10000)
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Random.org API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Random.org API error: ${data.error.message}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: data.result.random.data,
        bitsUsed: data.result.bitsUsed,
        bitsLeft: data.result.bitsLeft,
        requestsLeft: data.result.requestsLeft
      })
    };

  } catch (error) {
    console.error('Random oracle function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
};
