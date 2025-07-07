const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'user',
  status: 'active',
  permissions: {
    employees: true,
    tasks: true
  }
};

async function testUserManagement() {
  console.log('🧪 Testing User Management System...\n');

  try {
    // 1. Create a test user
    console.log('1. Creating test user...');
    const createResponse = await axios.post(`${BASE_URL}/users`, testUser);
    console.log('✅ User created successfully:', createResponse.data.data.name);
    
    // 2. Login with the test user
    console.log('\n2. Logging in with test user...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // 3. Get all users (requires authentication)
    console.log('\n3. Fetching all users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Users fetched successfully');
    console.log(`   Total users: ${usersResponse.data.count}`);
    console.log('   Users:', usersResponse.data.data.map(u => ({ name: u.name, email: u.email, status: u.status })));

    // 4. Get specific user
    console.log('\n4. Fetching specific user...');
    const userId = createResponse.data.data.id;
    const userResponse = await axios.get(`${BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Specific user fetched:', userResponse.data.data.name);

    // 5. Update user
    console.log('\n5. Updating user...');
    const updateResponse = await axios.put(`${BASE_URL}/users/${userId}`, {
      name: 'Updated Test User',
      status: 'active'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User updated successfully:', updateResponse.data.data.name);

    // 6. Delete user
    console.log('\n6. Deleting test user...');
    await axios.delete(`${BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User deleted successfully');

    console.log('\n🎉 All tests passed! User management system is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('   This might be due to missing authentication middleware.');
    }
  }
}

// Run the test
testUserManagement(); 