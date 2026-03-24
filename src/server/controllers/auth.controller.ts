import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response.util';
import { LoginCredentials, RegisterData } from '../types/auth.types';

/**
 * Register new user
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: RegisterData = req.body;
    const result = await authService.register(data);
    return sendCreated(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const credentials: LoginCredentials = req.body;
    const result = await authService.login(credentials);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Google Login
 */
export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return sendError(res, 'Google ID token is required', 400);
    }

    // Verify token and get user data
    const result = await authService.googleLogin(idToken);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    return sendSuccess(res, tokens);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    return sendSuccess(res, {
      message: 'If the email exists, a reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    return sendSuccess(res, { message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }
    await authService.logout(req.user.id);
    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};