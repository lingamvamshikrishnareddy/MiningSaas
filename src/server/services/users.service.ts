import { User, Prisma } from '@prisma/client';
import { UserRole } from '../types/user.types';
import { usersRepository } from '../repositories/users.repository';
import { hashPassword } from '../utils/hash.util';
import { AppError } from '../middleware/error.middleware';
import { UserFilterOptions } from '../types/user.types';

class UsersService {
  async getAll(filters: UserFilterOptions, organizationId: string, page: number, limit: number) {
    const where: Prisma.UserWhereInput = {
      organizationId,
      isDeleted: false,
      ...(filters.role && { role: filters.role as UserRole }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      usersRepository.findAll({
        where,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      usersRepository.count(where),
    ]);

    return { data, total };
  }

  async getById(id: string, organizationId: string) {
    const user = await usersRepository.findById(id);
    if (!user || user.organizationId !== organizationId) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationId: string;
  }) {
    const existing = await usersRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('User with this email already exists', 409);
    }

    const passwordHash = await hashPassword(data.password);

    return usersRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      organization: { connect: { id: data.organizationId } },
    });
  }

  async update(id: string, organizationId: string, data: Prisma.UserUpdateInput) {
    const user = await usersRepository.findById(id);
    if (!user || user.organizationId !== organizationId) {
      throw new AppError('User not found', 404);
    }

    if (data.email) {
      const emailExists = await usersRepository.emailExists(data.email as string, id);
      if (emailExists) {
        throw new AppError('Email already in use', 409);
      }
    }

    return usersRepository.update(id, data);
  }

  async delete(id: string, organizationId: string, requestingUserId: string) {
    const user = await usersRepository.findById(id);
    if (!user || user.organizationId !== organizationId) {
      throw new AppError('User not found', 404);
    }

    if (id === requestingUserId) {
      throw new AppError('You cannot delete your own account', 400);
    }

    return usersRepository.softDelete(id);
  }

  async updateRole(id: string, organizationId: string, role: UserRole) {
    const user = await usersRepository.findById(id);
    if (!user || user.organizationId !== organizationId) {
      throw new AppError('User not found', 404);
    }
    return usersRepository.updateRole(id, role);
  }

  async setActiveStatus(id: string, organizationId: string, isActive: boolean) {
    const user = await usersRepository.findById(id);
    if (!user || user.organizationId !== organizationId) {
      throw new AppError('User not found', 404);
    }
    return usersRepository.setActiveStatus(id, isActive);
  }

  async getStats(organizationId: string) {
    return usersRepository.getOrganizationStats(organizationId);
  }

  async resetPassword(id: string, organizationId: string, newPassword: string) {
    const user = await usersRepository.findById(id);
    if (!user || user.organizationId !== organizationId) {
      throw new AppError('User not found', 404);
    }
    const passwordHash = await hashPassword(newPassword);
    return usersRepository.updatePassword(id, passwordHash);
  }
}

export default new UsersService();
