const User = require('./models/userModel');

async function createSpecialAdmin() {
  try {
    console.log('🔧 Creating special admin user with hardcoded credentials...');
    
    const specialAdmin = {
      email: 'info@rtechsl.lk',
      password: 'rtechsl.lk',
      name: 'R Tech Solutions Admin',
      role: 'admin',
      status: 'active',
      permissions: {} // Admin has all permissions
    };

    // Check if special admin already exists
    const existingAdmin = await User.findByEmail(specialAdmin.email);
    if (existingAdmin) {
      console.log('⚠️  Special admin user already exists:', existingAdmin.email);
      console.log('   Updating password...');
      
      // Update the password
      await User.update(existingAdmin.id, {
        password: specialAdmin.password,
        name: specialAdmin.name,
        role: specialAdmin.role,
        status: specialAdmin.status
      });
      
      console.log('✅ Special admin user updated successfully');
      return;
    }

    const newAdmin = await User.create(specialAdmin);
    console.log('✅ Special admin user created successfully:');
    console.log('   Name:', newAdmin.name);
    console.log('   Email:', newAdmin.email);
    console.log('   Role:', newAdmin.role);
    console.log('   Status:', newAdmin.status);
    console.log('\n🔑 Login credentials:');
    console.log('   Email: info@rtechsl.lk');
    console.log('   Password: rtechsl.lk');
    console.log('\n📝 Note: This user has full admin access to the system');
    
  } catch (error) {
    console.error('❌ Failed to create special admin user:', error.message);
  }
}

// Run the script
createSpecialAdmin(); 