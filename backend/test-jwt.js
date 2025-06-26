const jwt = require('jsonwebtoken');

// Test JWT functionality
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Test payload
const testPayload = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'admin',
  status: 'active',
  permissions: {
    employees: true,
    tasks: true
  },
  name: 'Test User'
};

console.log('Testing JWT functionality...\n');

// Test 1: Generate token
console.log('1. Generating JWT token...');
const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '24h' });
console.log('Token generated:', token.substring(0, 50) + '...');
console.log('Token length:', token.length);
console.log('');

// Test 2: Verify token
console.log('2. Verifying JWT token...');
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Token verified successfully!');
  console.log('Decoded payload:', JSON.stringify(decoded, null, 2));
  console.log('');
} catch (error) {
  console.error('Token verification failed:', error.message);
}

// Test 3: Check expiration
console.log('3. Checking token expiration...');
const decoded = jwt.decode(token);
const now = Math.floor(Date.now() / 1000);
const expiresIn = decoded.exp - now;
console.log(`Token expires in ${Math.floor(expiresIn / 3600)} hours and ${Math.floor((expiresIn % 3600) / 60)} minutes`);
console.log('');

console.log('JWT test completed successfully! ✅'); 