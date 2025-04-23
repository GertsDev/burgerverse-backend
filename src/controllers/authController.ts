// src/controllers/authController.ts
// All business logic for /auth routes, using asyncHandler + validate
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  REFRESH_EXPIRES_IN
} from '../config/auth';
import RefreshToken from '../models/RefreshToken';
import User from '../models/User';

// Helper to sign tokens
function signAccessToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN
  });
}
function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN
  });
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (await User.findOne({ email })) {
    return res
      .status(400)
      .json({ success: false, message: 'Email already in use' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, password: hashed });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  // Persist the refresh token in Mongo
  await RefreshToken.create({ token: refreshToken, user: user.id });

  // Set HTTP‑only cookie for refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });

  res.status(201).json({
    success: true,
    user: { email: user.email, name: user.name },
    accessToken
  });
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid credentials' });
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await RefreshToken.create({ token: refreshToken, user: user.id });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({
    success: true,
    user: { email: user.email, name: user.name },
    accessToken
  });
};

// ─── REFRESH ─────────────────────────────────────────────────────────────────
export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  // Verify token exists in DB
  const stored = await RefreshToken.findOne({ token });
  if (!stored) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Rotate refresh token
  const newAccess = signAccessToken(payload.userId);
  const newRefresh = signRefreshToken(payload.userId);
  stored.token = newRefresh;
  await stored.save();

  res.cookie('refreshToken', newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({ success: true, accessToken: newAccess });
};

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await RefreshToken.deleteOne({ token });
  }
  res.clearCookie('refreshToken');
  res.json({ success: true });
};

// ─── GET & UPDATE USER ───────────────────────────────────────────────────────
import { AuthRequest } from '../middleware/authMiddleware';
export const getUser = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('email name');
  if (!user) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  res.json({ success: true, user });
};
export const updateUser = async (req: AuthRequest, res: Response) => {
  const updates: any = {};
  if (req.body.email) updates.email = req.body.email;
  if (req.body.name) updates.name = req.body.name;
  if (req.body.password) {
    updates.password = await bcrypt.hash(req.body.password, 10);
  }
  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    select: 'email name'
  });
  if (!user) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  res.json({ success: true, user });
};
