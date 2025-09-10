// Test script to verify lifeculture API endpoints
const axios = require('axios');

async function testLifeCultureAPI() {
  try {
    console.log('Testing Life & Culture API endpoints...\n');
    
    // Test books endpoint
    console.log('1. Testing GET /api/lifeculture/books');
    const booksResponse = await axios.get('https://5whmedia.com:5000/api/lifeculture/books');
    console.log('✅ Books endpoint working');
    console.log('Response:', JSON.stringify(booksResponse.data, null, 2));
    console.log('\n');
    
    // Test cultural events endpoint
    console.log('2. Testing GET /api/lifeculture/cultural-events');
    const eventsResponse = await axios.get('https://5whmedia.com:5000/api/lifeculture/cultural-events');
    console.log('✅ Cultural events endpoint working');
    console.log('Response:', JSON.stringify(eventsResponse.data, null, 2));
    console.log('\n');
    
    console.log('🎉 All Life & Culture API endpoints are working correctly!');
    console.log('📚 Books count:', booksResponse.data.data.length);
    console.log('🎭 Events count:', eventsResponse.data.data.length);
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLifeCultureAPI();
