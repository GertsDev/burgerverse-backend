// src/routes/auth.ts
// Thin routing layer: declares paths → validator → controller
import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from '../controllers/authController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';


const router = Router();

// Public routes
router.post(
  '/register',
  body('email').isEmail(),
  body('name').notEmpty(),
  body('password').isLength({ min: 6 }),
  validate,
  asyncHandler(ctrl.register)
);

router.post(
  '/login',
  body('email').isEmail(),
  body('password').exists(),
  validate,
  asyncHandler(ctrl.login)
);

router.post('/token', asyncHandler(ctrl.refresh));
router.post('/logout', asyncHandler(ctrl.logout));

// Protected routes
router.get('/user', authMiddleware, asyncHandler(ctrl.getUser));
router.patch(
  '/user',
  authMiddleware,
  body('email').optional().isEmail(),
  body('name').optional().isString(),
  body('password').optional().isLength({ min: 6 }),
  validate,
  asyncHandler(ctrl.updateUser)
);

export default router;
