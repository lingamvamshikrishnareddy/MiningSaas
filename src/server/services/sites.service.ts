import prisma from '../db/prisma';
import { AppError } from '../middleware/error.middleware';
import { Prisma } from '@prisma/client';

class SitesService {
  async getAll(organizationId: string, page: number, limit: number, search?: string) {
    const where: Prisma.SiteWhereInput = {
      organizationId,
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { siteCode: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.site.findMany({
        where,
        include: {
          _count: { select: { equipment: true, shifts: true } },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.site.count({ where }),
    ]);

    return { data, total };
  }

  async getById(id: string, organizationId: string) {
    const site = await prisma.site.findFirst({
      where: { id, organizationId },
      include: {
        zones: { where: { isActive: true } },
        _count: { select: { equipment: true, shifts: true, incidents: true } },
      },
    });
    if (!site) throw new AppError('Site not found', 404);
    return site;
  }

  async create(data: Prisma.SiteCreateInput & { organizationId: string }) {
    const existing = await prisma.site.findUnique({ where: { siteCode: data.siteCode as string } });
    if (existing) throw new AppError('Site code already exists', 409);

    const { organizationId, ...rest } = data;
    return prisma.site.create({
      data: {
        ...rest,
        organization: { connect: { id: organizationId } },
      },
    });
  }

  async update(id: string, organizationId: string, data: Prisma.SiteUpdateInput) {
    const site = await prisma.site.findFirst({ where: { id, organizationId } });
    if (!site) throw new AppError('Site not found', 404);
    return prisma.site.update({ where: { id }, data });
  }

  async delete(id: string, organizationId: string) {
    const site = await prisma.site.findFirst({ where: { id, organizationId } });
    if (!site) throw new AppError('Site not found', 404);
    return prisma.site.update({ where: { id }, data: { isActive: false } });
  }

  async getZones(siteId: string, organizationId: string) {
    const site = await prisma.site.findFirst({ where: { id: siteId, organizationId } });
    if (!site) throw new AppError('Site not found', 404);

    return prisma.zone.findMany({
      where: { siteId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createZone(siteId: string, organizationId: string, data: Prisma.ZoneCreateInput) {
    const site = await prisma.site.findFirst({ where: { id: siteId, organizationId } });
    if (!site) throw new AppError('Site not found', 404);

    return prisma.zone.create({
      data: {
        ...data,
        site: { connect: { id: siteId } },
      },
    });
  }

  async getSiteIds(organizationId: string): Promise<string[]> {
    const sites = await prisma.site.findMany({
      where: { organizationId, isActive: true },
      select: { id: true },
    });
    return sites.map((s) => s.id);
  }
}

export default new SitesService();
