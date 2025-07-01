const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const BACKEND_URL = 'http://localhost:3001';

// Test admin user token
const adminToken = jwt.sign({
  id: 'test-admin-id',
  email: 'admin@test.com',
  role: 'admin',
  status: 'active',
  permissions: {},
  name: 'Test Admin'
}, JWT_SECRET, { expiresIn: '24h' });

// Test regular user token with tasks permission
const userToken = jwt.sign({
  id: 'test-user-id',
  email: 'user@test.com',
  role: 'user',
  status: 'active',
  permissions: {
    tasks: true
  },
  name: 'Test User'
}, JWT_SECRET, { expiresIn: '24h' });

// Test regular user token without tasks permission
const userNoPermissionToken = jwt.sign({
  id: 'test-user-no-perm-id',
  email: 'user2@test.com',
  role: 'user',
  status: 'active',
  permissions: {
    employees: true
  },
  name: 'Test User No Perm'
}, JWT_SECRET, { expiresIn: '24h' });

async function testAuth() {
  console.log('Testing Authentication and Task Access...\n');

  // Test 1: Admin access to tasks
  try {
    console.log('Test 1: Admin access to tasks');
    const response = await axios.get(`${BACKEND_URL}/api/tasks`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin can access tasks:', response.status);
    console.log('Tasks count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin access failed:', error.response?.status, error.response?.data?.message);
  }

  // Test 2: User with tasks permission
  try {
    console.log('\nTest 2: User with tasks permission');
    const response = await axios.get(`${BACKEND_URL}/api/tasks`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ User with tasks permission can access tasks:', response.status);
    console.log('Tasks count:', response.data.length);
  } catch (error) {
    console.log('❌ User with tasks permission failed:', error.response?.status, error.response?.data?.message);
  }

  // Test 3: User without tasks permission
  try {
    console.log('\nTest 3: User without tasks permission');
    const response = await axios.get(`${BACKEND_URL}/api/tasks`, {
      headers: { Authorization: `Bearer ${userNoPermissionToken}` }
    });
    console.log('❌ User without tasks permission should not access tasks:', response.status);
  } catch (error) {
    console.log('✅ User without tasks permission correctly blocked:', error.response?.status, error.response?.data?.message);
  }

  // Test 4: No token
  try {
    console.log('\nTest 4: No token');
    const response = await axios.get(`${BACKEND_URL}/api/tasks`);
    console.log('❌ No token should not access tasks:', response.status);
  } catch (error) {
    console.log('✅ No token correctly blocked:', error.response?.status, error.response?.data?.message);
  }

  // Test 5: Create a task (admin)
  try {
    console.log('\nTest 5: Create task (admin)');
    const taskData = {
      name: 'Test Task',
      description: 'This is a test task',
      dueDate: '2024-12-31',
      department: 'IT',
      status: 'not-started',
      tags: ['test'],
      attachments: []
    };
    const response = await axios.post(`${BACKEND_URL}/api/tasks`, taskData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin can create task:', response.status);
    console.log('Task ID:', response.data.id);
  } catch (error) {
    console.log('❌ Admin create task failed:', error.response?.status, error.response?.data?.message);
  }

  console.log('\nTest completed!');
}

testAuth().catch(console.error); 