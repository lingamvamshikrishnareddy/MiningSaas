import { User } from '@prisma/client';
import prisma from '../db/prisma';
import { usersRepository } from '../repositories/users.repository';
import { hashPassword, comparePassword } from '../utils/hash.util';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.util';
import googleAuthService from './google-auth.service';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthTokens,
  UserAuthInfo,
} from '../types/auth.types';
import { AppError } from '../middleware/error.middleware';

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create organization if new
    let organizationId = data.organizationId;

    if (!organizationId && data.organizationName) {
      const organization = await prisma.organization.create({
        data: {
          name: data.organizationName,
          country: 'Unknown', // Should be provided in registration
          timezone: 'UTC',
        },
      });
      organizationId = organization.id;
    }

    if (!organizationId) {
      throw new AppError('Organization ID or name is required', 400);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'VIEWER',
        organizationId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Generate tokens
    const tokens = this.generateUserTokens(user);

    return {
      user: this.formatUserAuthInfo(user),
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user
    const user = await usersRepository.findByEmail(credentials.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      credentials.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await usersRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokens = this.generateUserTokens(user);

    return {
      user: this.formatUserAuthInfo(user),
      tokens,
    };
  }

  /**
   * Google Login
   */
  async googleLogin(idToken: string): Promise<AuthResponse> {
    // Verify the Google ID token
    const payload = await googleAuthService.verifyToken(idToken);
    
    const { email, sub: googleId, given_name, family_name, picture } = payload;

    if (!email) {
      throw new AppError('Google account must have an email', 400);
    }

    // Find user by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (user) {
      // If user exists but googleId is not set, link it
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId,
            ...(picture && { profilePicture: picture }),
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      }
    } else {
      // Create new user - need organization
      let organization = await prisma.organization.findFirst();
      if (!organization) {
        organization = await prisma.organization.create({
          data: {
            name: 'Default Organization',
            country: 'Unknown',
          },
        });
      }

      try {
        user = await prisma.user.create({
          data: {
            email,
            googleId,
            firstName: given_name || '',
            lastName: family_name || '',
            profilePicture: picture || null,
            passwordHash: 'GOOGLE_AUTH', // Placeholder for OAuth users
            role: 'VIEWER',
            organizationId: organization.id,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      } catch (err: any) {
        // Handle race condition: another request already created the user
        if (err?.code === 'P2002') {
          const existing = await prisma.user.findFirst({
            where: { OR: [{ googleId }, { email }] },
            include: { organization: { select: { id: true, name: true } } },
          });
          if (!existing) throw err;
          user = existing;
        } else {
          throw err;
        }
      }
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Update last login
    await usersRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokens = this.generateUserTokens(user);

    return {
      user: this.formatUserAuthInfo(user),
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await usersRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new tokens
      return this.generateUserTokens(user);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(userId: string): Promise<UserAuthInfo> {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.formatUserAuthInfo(user);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await usersRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // TODO: Generate reset token and send email
    // For now, just log
    console.log(`Password reset requested for ${email}`);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Verify token and reset password
    // This requires implementing token storage and verification
    throw new AppError('Not implemented yet', 501);
  }

  /**
   * Logout (invalidate token)
   */
  async logout(userId: string): Promise<void> {
    // In a stateless JWT system, logout is handled client-side
    // If using token blacklist or database sessions, implement here
    console.log(`User ${userId} logged out`);
  }

  /**
   * Helper: Generate tokens for user
   */
  private generateUserTokens(user: User): AuthTokens {
    return generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });
  }

  /**
   * Helper: Format user auth info
   */
  private formatUserAuthInfo(user: any): UserAuthInfo {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId,
      ...(user.organization && {
        organization: {
          id: user.organization.id,
          name: user.organization.name,
        },
      }),
    };
  }
}

export default new AuthService();