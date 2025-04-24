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
import transporter from '../config/mailer';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';

const router = Router();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
console.log(process.env.JWT_SECRET);

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

// ─── PASSWORD RESET REQUEST ────────────────────────────────────────────────
router.post('/password-reset', body('email').isEmail(), async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    // Generate a 6-digit numeric code as a string
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.resetPasswordToken = code;
    user.resetPasswordExpires = expires;
    await user.save();
    // Send email with code and logo
    try {
      await transporter.sendMail({
        from: 'no-reply@burgerverse.space',
        to: user.email,
        subject: 'Burgerverse Password Reset',
        html: `
          <div style="max-width:420px;margin:40px auto;padding:32px 24px;background:#fff;border-radius:18px;box-shadow:0 2px 16px #0001;font-family:sans-serif;text-align:center">
            <img src="cid:burgerverse_logo" alt="Burgerverse Logo" style="width:250px;margin-bottom:16px;"/>
            <div style="font-size:2.5rem;font-weight:700;color:#fbbf24;margin-bottom:12px;letter-spacing:2px;">${code}</div>
            <div style="font-size:1rem;color:#222;margin-bottom:18px;">This reset code is valid for 1 hour.</div>
            <div style="font-size:1rem;color:#444;margin-bottom:18px;">You are receiving this because you (or someone else) have requested the reset of the password for your Burgerverse account.</div>
            <div style="font-size:0.95rem;color:#888;">If you did not request this, please ignore this email and your password will remain unchanged.</div>
          </div>
        `,
        attachments: [
          {
            filename: 'burgerverse_logo.png',
            path: __dirname + '/../images/burgerverse_logo_mail.png',
            cid: 'burgerverse_logo',
          },
        ],
      });
    } catch (e) {
      // Log but do not reveal to client
      console.error('Error sending reset email:', e);
    }
  }
  // Always respond success for security
  res.json({ success: true });
});

// ─── PASSWORD RESET SUBMIT ────────────────────────────────────────────────
router.post(
  '/password-reset/reset',
  body('password').isLength({ min: 6 }),
  body('token').isString(),
  async (req, res) => {
    const { password, token } = req.body;
    // Now token is a 6-digit code
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      res
        .status(400)
        .json({ success: false, message: 'Invalid or expired code' });
      return;
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ success: true });
  }
);

console.log('JWT_SECRET at config:', process.env.JWT_SECRET);

export default router;
