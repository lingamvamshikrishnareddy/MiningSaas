import prisma from '../db/prisma';
import { AppError } from '../middleware/error.middleware';
import { Prisma } from '@prisma/client';

class OrganizationsService {
  async getById(id: string) {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        sites: { where: { isActive: true }, select: { id: true, name: true, siteCode: true } },
        _count: { select: { users: true, sites: true } },
      },
    });
    if (!org) throw new AppError('Organization not found', 404);
    return org;
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw new AppError('Organization not found', 404);
    return prisma.organization.update({ where: { id }, data });
  }

  async getStats(id: string) {
    const [userCount, siteCount, equipmentCount, activeIncidents] = await Promise.all([
      prisma.user.count({ where: { organizationId: id, isActive: true } }),
      prisma.site.count({ where: { organizationId: id, isActive: true } }),
      prisma.equipment.count({
        where: { site: { organizationId: id }, isActive: true },
      }),
      prisma.incident.count({
        where: { site: { organizationId: id }, status: { in: ['OPEN', 'INVESTIGATING'] } },
      }),
    ]);

    return { userCount, siteCount, equipmentCount, activeIncidents };
  }

  async updateSubscription(id: string, tier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE') {
    return prisma.organization.update({
      where: { id },
      data: { subscription: tier },
    });
  }

  async getAll(page: number, limit: number) {
    const [data, total] = await Promise.all([
      prisma.organization.findMany({
        include: { _count: { select: { users: true, sites: true } } },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.organization.count(),
    ]);
    return { data, total };
  }
}

export default new OrganizationsService();
