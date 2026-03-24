import { Router, Request, Response } from 'express';
import * as controller from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import googleOAuthService from '../services/google-oauth.service';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));
router.post('/google', asyncHandler(controller.googleLogin));

// Google OAuth authorization URL endpoint
router.get('/google/url', asyncHandler((req: Request, res: Response) => {
  const state = uuidv4();
  const authUrl = googleOAuthService.getAuthorizationUrl(state);
  res.json({ success: true, data: { url: authUrl, state } });
}));

// Google OAuth callback endpoint
router.get('/google/callback', asyncHandler(async (req: Request, res: Response) => {
  const { code, state, error } = req.query;
  
  if (error) {
    console.error('Google OAuth error:', error);
    return res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=oauth_failed`);
  }
  
  if (!code || typeof code !== 'string') {
    return res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=missing_code`);
  }
  
  try {
    const { tokens, payload } = await googleOAuthService.getTokensFromCode(code);
    
    // Find or create user with Google info
    // Note: We'll pass the tokens to the client which will send them to the /auth/google callback
    // For now, redirect to a page that handles the tokens
    const encodedTokens = encodeURIComponent(JSON.stringify(tokens));
    const encodedPayload = encodeURIComponent(JSON.stringify(payload));
    
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/callback?tokens=${encodedTokens}&payload=${encodedPayload}`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=oauth_failed`);
  }
}));

router.post('/refresh-token', asyncHandler(controller.refreshToken));
router.post('/forgot-password', asyncHandler(controller.forgotPassword));
router.post('/reset-password', asyncHandler(controller.resetPassword));
router.post('/logout', authenticate, asyncHandler(controller.logout));
router.get('/me', authenticate, asyncHandler(controller.getCurrentUser));
router.patch('/change-password', authenticate, asyncHandler(controller.changePassword));

export default router;
