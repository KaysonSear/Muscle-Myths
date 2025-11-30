import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const fixToken = async () => {
  await connectDB();

  try {
    const user = await User.findOne({ role: 'super_admin' });

    if (user) {
      user.token = 'muscle_myths_super_secret_2025';
      await user.save();
      console.log('Super Admin token updated to:', user.token);
    } else {
      console.log('Super Admin not found, creating...');
      await User.create({
        name: 'Super Admin',
        username: 'superadmin',
        password: 'password123',
        role: 'super_admin',
        token: 'muscle_myths_super_secret_2025',
      });
      console.log('Super Admin created');
    }
    process.exit();
  } catch (error) {
    console.error('Error updating token:', error);
    process.exit(1);
  }
};

fixToken();

