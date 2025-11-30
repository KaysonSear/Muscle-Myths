import { Request, Response } from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req: Request, res: Response) => {
  const { username, password, token } = req.body;

  // Special login for Super Admin using Token
  if (token) {
    const cleanToken = token.trim();
    console.log(`Attempting login with token: ${cleanToken}`);
    const user = await User.findOne({ token: cleanToken });
    if (user) {
      console.log('Token login successful');
      res.json({
        _id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        token: generateToken(user._id as unknown as object),
      });
      return;
    }
    console.log('Token login failed: Token not found');
  }

  // Normal login
  const user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      token: generateToken(user._id as unknown as object),
    });
  } else {
    res.status(401).json({ message: '用户名或密码错误' });
  }
};

// @desc    Register a new admin
// @route   POST /api/admins
// @access  Private/SuperAdmin
export const registerAdmin = async (req: AuthRequest, res: Response) => {
  const { name, username, password } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400).json({ message: '用户已存在' });
    return;
  }

  const user = await User.create({
    name,
    username,
    password,
    role: 'admin',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    });
  } else {
    res.status(400).json({ message: '无效的用户数据' });
  }
};

// @desc    Get all admins
// @route   GET /api/admins
// @access  Private/SuperAdmin
export const getAdmins = async (req: AuthRequest, res: Response) => {
  const users = await User.find({ role: 'admin' });
  res.json(users);
};

// @desc    Delete admin
// @route   DELETE /api/admins/:id
// @access  Private/SuperAdmin
export const deleteAdmin = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: '管理员已移除' });
  } else {
    res.status(404).json({ message: '未找到该用户' });
  }
};
