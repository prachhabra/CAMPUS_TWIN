require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  const email = process.argv[2] || 'admin@campustwin.edu';
  const password = process.argv[3] || 'AdminPass123!';
  const name = process.argv[4] || 'Campus System Administrator';
  const department = process.argv[5] || 'Administration';

  if (!process.env.MONGO_URI) {
    console.error('[Error] MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Connected to MongoDB]');

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      existingAdmin.name = name;
      existingAdmin.role = 'admin';
      existingAdmin.department = department;
      existingAdmin.password = password; // pre-save will re-hash
      await existingAdmin.save();
      console.log(`[Success] Existing user with email "${email}" has been updated to Administrator role.`);
    } else {
      const admin = await User.create({
        name,
        email,
        password,
        role: 'admin',
        department,
        rollNumber: 'ADMIN-001',
        employeeId: 'EMP-ADMIN-01',
        year: 'Faculty/Staff',
        bio: 'Primary Administrator for CampusTwin Platform'
      });
      console.log(`[Success] New Administrator account created:`);
      console.log(`- ID: ${admin._id}`);
      console.log(`- Name: ${admin.name}`);
      console.log(`- Email: ${admin.email}`);
      console.log(`- Role: ${admin.role}`);
    }

    console.log('[Done] You can now log in using these administrator credentials.');
    process.exit(0);
  } catch (error) {
    console.error(`[Error creating admin]: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
