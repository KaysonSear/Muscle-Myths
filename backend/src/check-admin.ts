import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const checkAdmin = async () => {
  try {
    await connectDB();
    const user = await User.findOne({ role: 'super_admin' });
    if (user) {
      console.log('Super Admin Found:');
      console.log('Username:', user.username);
      console.log('Token:', user.token);
    } else {
      console.log('Super Admin NOT found');
    }
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();

