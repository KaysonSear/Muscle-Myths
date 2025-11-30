import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const seedSuperAdmin = async () => {
  await connectDB();

  try {
    const superAdminExists = await User.findOne({ role: 'super_admin' });

    if (superAdminExists) {
      console.log('Super Admin already exists');
      process.exit();
    }

    const user = await User.create({
      name: 'Super Admin',
      username: 'superadmin',
      password: 'password123', // Should be changed
      role: 'super_admin',
      token: 'muscle_myths_super_secret_2025',
    });

    console.log('Super Admin created:', user.username);
    console.log('Token:', user.token);
    process.exit();
  } catch (error) {
    console.error('Error seeding super admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();

