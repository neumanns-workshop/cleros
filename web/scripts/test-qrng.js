const axios = require('axios');

async function testQRNG() {
  const apiUrl = process.env.REACT_APP_QRNG_API_URL;
  const apiKey = process.env.REACT_APP_QRNG_API_KEY;
  
  console.log('Using API URL:', apiUrl);
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'x-api-key': apiKey
      },
      params: {
        length: 1,
        type: 'uint8'
      }
    });
    
    console.log('Response:', response.data);
    if (response.data && response.data.data) {
      const randomNumber = response.data.data[0] % 88;
      console.log('Random number between 0-87:', randomNumber);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testQRNG(); 