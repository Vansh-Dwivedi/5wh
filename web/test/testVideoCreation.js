const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testVideoCreation() {
  try {
    // First login to get admin token
    const loginResponse = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'admin@5whmedia.com',
      password: 'admin123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained');

    // Create test video data
    const formData = new FormData();
    formData.append('title', 'Test Video Creation');
    formData.append('description', 'This is a test video to check video creation functionality');
    formData.append('category', 'news');
    formData.append('videoType', 'youtube');
    formData.append('videoUrl', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    formData.append('duration', '3:32');
    formData.append('durationSeconds', '212');
    formData.append('quality', '1080p');
    formData.append('tags', JSON.stringify(['test', 'sample', 'video']));
    formData.append('status', 'published');
    formData.append('featured', 'false');
    formData.append('live', 'false');

    // Make request to create video
    const response = await axios.post('http://127.0.0.1:5000/api/videos', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Video created successfully!');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('❌ Error creating video:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data?.error);
    console.error('Full error:', error.message);
  }
}

testVideoCreation();
