import axios, { AxiosError } from 'axios';

const API_URL = 'https://happyhound-api.onehappyhound4m.repl.co';

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  try {
    // Test 1: Register User
    console.log('Test 1: Register User');
    const registerResponse = await axios.post(`${API_URL}/api/users/register`, {
      email: 'test@example.com',
      password: 'test123'
    });
    console.log('✅ Register successful:', registerResponse.data);

    // Test 2: Login
    console.log('\nTest 2: Login');
    const loginResponse = await axios.post(`${API_URL}/api/users/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    console.log('✅ Login successful:', loginResponse.data);
    const token = loginResponse.data.token;

    // Test 3: Add Pet
    console.log('\nTest 3: Add Pet');
    const petResponse = await axios.post(`${API_URL}/api/pets`, {
      name: 'Max',
      type: 'Dog',
      age: 3
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Pet added:', petResponse.data);

    // Test 4: Create Service
    console.log('\nTest 4: Create Service');
    const serviceResponse = await axios.post(`${API_URL}/api/services`, {
      name: 'Dog Walking',
      price: 30,
      duration: 60
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Service created:', serviceResponse.data);

    // Test 5: Create Booking
    console.log('\nTest 5: Create Booking');
    const bookingResponse = await axios.post(`${API_URL}/api/bookings`, {
      serviceId: 'service-1',
      notes: 'Afternoon walk preferred'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Booking created:', bookingResponse.data);

    console.log('\n🎉 All tests passed successfully!');
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('\n❌ Test failed:', error.response?.data || error.message);
    } else {
      console.error('\n❌ Test failed:', error);
    }
  }
}

// Run the tests
runTests(); 