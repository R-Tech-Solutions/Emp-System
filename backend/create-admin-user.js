const User = require('./models/userModel');

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    const adminUser = {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin',
      status: 'active',
      permissions: {} // Admin has all permissions
    };

    // Check if admin already exists
    const existingAdmin = await User.findByEmail(adminUser.email);
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      return;
    }

    const newAdmin = await User.create(adminUser);
    console.log('✅ Admin user created successfully:');
    console.log('   Name:', newAdmin.name);
    console.log('   Email:', newAdmin.email);
    console.log('   Role:', newAdmin.role);
    console.log('   Status:', newAdmin.status);
    console.log('\n🔑 Login credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
  }
}

// Run the script
createAdminUser(); 