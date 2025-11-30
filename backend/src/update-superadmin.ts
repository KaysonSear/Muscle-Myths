import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const updateSuperAdmin = async () => {
  await connectDB();

  try {
    // Remove existing super_admin to avoid conflicts or update it
    await User.deleteOne({ role: 'super_admin' });
    console.log('Removed old super_admin');

    // Create new Super Admin "Kayson"
    const user = await User.create({
      name: 'Kayson',
      username: 'Kayson',
      password: 'ksmusclemyths760810',
      role: 'super_admin',
      token: 'muscle_myths_super_secret_2025', // Keep token as backup backdoor just in case, or for API access
    });

    console.log('New Super Admin created:');
    console.log('Username:', user.username);
    console.log('Password updated.');
    
    process.exit();
  } catch (error) {
    console.error('Error updating super admin:', error);
    process.exit(1);
  }
};

updateSuperAdmin();

