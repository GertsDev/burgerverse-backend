// src/routes/auth.ts
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import {
  ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  REFRESH_EXPIRES_IN,
} from '../config/auth';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';

const router = Router();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
console.log(process.env.JWT_SECRET)

// the shapes of our request‑bodies:
interface RegisterBody {
  email: string;
  name: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshBody {
  token: string;
}

interface UpdateUserBody {
  email?: string;
  name?: string;
  password?: string;
}

// in‐memory refresh tokens (swap for DB in prod)
const refreshTokens = new Set<string>();

function signAccessToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
router.post<{}, any, RegisterBody>(
  '/register',
  body('email').isEmail(),
  body('name').isString().notEmpty(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, name, password } = req.body;
    if (await User.findOne({ email })) {
      res
        .status(400)
        .json({ success: false, errors: [{ msg: 'Email in use' }] });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, password: hashed });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    refreshTokens.add(refreshToken);

    res.json({
      success: true,
      user: { email: user.email, name: user.name },
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
    });
  }
);

// ─── LOGIN ───────────────────────────────────────────────────────────────────
router.post<{}, any, RegisterBody>(
  '/login',
  body('email').isEmail(),
  body('password').isString(),
  async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    refreshTokens.add(refreshToken);

    res.json({
      success: true,
      user: { email: user.email, name: user.name },
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
    });
  }
);

// ─── REFRESH ─────────────────────────────────────────────────────────────────
router.post<
  {},
  { success: boolean; accessToken?: string; message?: string },
  RefreshBody
>('/token', body('token').isString(), (req, res) => {
  const { token } = req.body;
  if (!token || !refreshTokens.has(token)) {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  try {
    const { userId } = jwt.verify(token, JWT_REFRESH_SECRET) as {
      userId: string;
    };
    const newAccess = signAccessToken(userId);
    res.json({ success: true, accessToken: 'Bearer ' + newAccess });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
router.post<{}, { success: boolean }, RefreshBody>(
  '/logout',
  body('token').isString(),
  (req, res) => {
    refreshTokens.delete(req.body.token);
    res.json({ success: true });
  }
);

// ─── GET USER ────────────────────────────────────────────────────────────────
router.get('/user', authMiddleware, async (req, res) => {
  const userId = (req as AuthRequest).userId;
  const user = await User.findById(userId).select('email name');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, user: { email: user.email, name: user.name } });
});

// ─── UPDATE USER ─────────────────────────────────────────────────────────────
router.patch(
  '/user',
  authMiddleware,
  body('email').optional().isEmail(),
  body('name').optional().isString(),
  body('password').optional().isLength({ min: 6 }),
  async (req, res) => {
    const updates: UpdateUserBody = {};
    if (req.body.email) updates.email = req.body.email;
    if (req.body.name) updates.name = req.body.name;
    if (req.body.password)
      updates.password = await bcrypt.hash(req.body.password, 10);
    const userId = (req as AuthRequest).userId;
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      select: 'email name',
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, user: { email: user.email, name: user.name } });
  }
);

console.log('JWT_SECRET at config:', process.env.JWT_SECRET);

export default router;
