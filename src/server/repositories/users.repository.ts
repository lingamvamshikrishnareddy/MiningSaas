import { User, Prisma, UserRole } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { UserFilterOptions } from '../types/user.types';

/**
 * Users repository
 */
export class UsersRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereInput,
  Prisma.UserWhereUniqueInput
> {
  constructor() {
    super('User' as Prisma.ModelName);
  }

  protected getDelegate() {
    return this.prisma.user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });
  }

  /**
   * Find user by Google OAuth ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
      include: {
        organization: true,
      },
    });
  }

  /**
   * Find users by organization
   */
  async findByOrganization(
    organizationId: string,
    options?: {
      role?: UserRole;
      isActive?: boolean;
      includeDeleted?: boolean;
    }
  ): Promise<User[]> {
    const where: Prisma.UserWhereInput = {
      organizationId,
      ...(options?.role && { role: options.role }),
      ...(options?.isActive !== undefined && { isActive: options.isActive }),
      ...(options?.includeDeleted === false && { isDeleted: false }),
    };

    return this.prisma.user.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  /**
   * Find users with filters
   */
  async findWithFilters(filters: UserFilterOptions): Promise<User[]> {
    const where: Prisma.UserWhereInput = {
      ...(filters.organizationId && { organizationId: filters.organizationId }),
      ...(filters.role && { role: filters.role }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.emailVerified !== undefined && { emailVerified: filters.emailVerified }),
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      isDeleted: false,
    };

    return this.prisma.user.findMany({
      where,
      include: {
        organization: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  /**
   * Create user with organization
   */
  async createWithOrganization(
    userData: Omit<Prisma.UserCreateInput, 'organization'> & {
      organizationId: string;
    }
  ): Promise<User> {
    const { organizationId, ...rest } = userData;
    return this.prisma.user.create({
      data: {
        ...rest,
        organization: {
          connect: { id: organizationId },
        },
      },
      include: {
        organization: true,
      },
    });
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Update user's email verification status
   */
  async verifyEmail(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
  }

  /**
   * Update user's password
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });
  }

  /**
   * Activate/Deactivate user
   */
  async setActiveStatus(userId: string, isActive: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  /**
   * Update user role
   */
  async updateRole(userId: string, role: UserRole): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  /**
   * Get user statistics by organization
   */
  async getOrganizationStats(organizationId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    byRole: Record<UserRole, number>;
  }> {
    const users = await this.findByOrganization(organizationId, {
      includeDeleted: false,
    });

    const stats = {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      verified: users.filter((u) => u.emailVerified).length,
      unverified: users.filter((u) => !u.emailVerified).length,
      byRole: {} as Record<UserRole, number>,
    };

    // Initialize role counts
    Object.values(UserRole).forEach((role) => {
      stats.byRole[role] = 0;
    });

    // Count users by role
    users.forEach((user) => {
      stats.byRole[user.role]++;
    });

    return stats;
  }

  /**
   * Find recently active users
   */
  async findRecentlyActive(
    organizationId: string,
    days: number = 7,
    limit: number = 10
  ): Promise<User[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    return this.prisma.user.findMany({
      where: {
        organizationId,
        isActive: true,
        isDeleted: false,
        lastLoginAt: {
          gte: sinceDate,
        },
      },
      orderBy: {
        lastLoginAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole, organizationId?: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        role,
        ...(organizationId && { organizationId }),
        isActive: true,
        isDeleted: false,
      },
      include: {
        organization: true,
      },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    });

    return !!user;
  }

  /**
   * Bulk update users
   */
  async bulkUpdate(
    userIds: string[],
    data: Prisma.UserUpdateInput
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data,
    });
  }

  /**
   * Link Google account to existing user
   */
  async linkGoogleAccount(
    userId: string,
    googleId: string,
    googleData: {
      email?: string;
      profilePicture?: string;
    }
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        ...(googleData.email && { email: googleData.email }),
        ...(googleData.profilePicture && { profilePicture: googleData.profilePicture }),
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
  }

  /**
   * Unlink Google account
   */
  async unlinkGoogleAccount(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId: null,
      },
    });
  }
}

// Export singleton instance
export const usersRepository = new UsersRepository();