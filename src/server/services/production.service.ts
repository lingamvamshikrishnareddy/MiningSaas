import prisma from '../db/prisma';
import { AppError } from '../middleware/error.middleware';
import sitesService from './sites.service';

class ProductionService {
  async getAll(organizationId: string, page: number, limit: number, filters: { siteId?: string; startDate?: string; endDate?: string; oreType?: string }) {
    const siteIds = await sitesService.getSiteIds(organizationId);

    const where: any = {
      siteId: { in: siteIds },
      ...(filters.siteId && { siteId: filters.siteId }),
      ...(filters.oreType && { oreType: { contains: filters.oreType, mode: 'insensitive' } }),
      ...(filters.startDate && { productionDate: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && {
        productionDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          lte: new Date(filters.endDate),
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.productionRecord.findMany({
        where,
        include: { site: { select: { id: true, name: true, siteCode: true } } },
        orderBy: { productionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productionRecord.count({ where }),
    ]);

    return { data, total };
  }

  async getById(id: string, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const record = await prisma.productionRecord.findFirst({
      where: { id, siteId: { in: siteIds } },
      include: { site: { select: { id: true, name: true, siteCode: true } } },
    });
    if (!record) throw new AppError('Production record not found', 404);
    return record;
  }

  async create(data: { siteId: string; productionDate: string | Date; oreType: string; tonnesMined: number; tonnesProcessed?: number; grade?: number; blastCount?: number; notes?: string }, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    if (!siteIds.includes(data.siteId)) throw new AppError('Site not found or access denied', 403);

    return prisma.productionRecord.create({
      data: {
        site: { connect: { id: data.siteId } },
        productionDate: new Date(data.productionDate),
        oreType: data.oreType,
        tonnesMined: data.tonnesMined,
        tonnesProcessed: data.tonnesProcessed,
        grade: data.grade,
        blastCount: data.blastCount,
        notes: data.notes,
      },
      include: { site: { select: { id: true, name: true, siteCode: true } } },
    });
  }

  async update(id: string, data: any, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.productionRecord.update({ where: { id }, data });
  }

  async delete(id: string, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.productionRecord.delete({ where: { id } });
  }

  async getSummary(organizationId: string, startDate?: string, endDate?: string, siteId?: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);

    const where: any = {
      siteId: { in: siteIds },
      ...(siteId && { siteId }),
      ...(startDate && { productionDate: { gte: new Date(startDate) } }),
      ...(endDate && {
        productionDate: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          lte: new Date(endDate),
        },
      }),
    };

    const [totals, bySite, byOreType] = await Promise.all([
      prisma.productionRecord.aggregate({
        where,
        _sum: { tonnesMined: true, tonnesProcessed: true, blastCount: true },
        _avg: { grade: true },
        _count: { id: true },
      }),
      prisma.productionRecord.groupBy({
        by: ['siteId'],
        where,
        _sum: { tonnesMined: true, tonnesProcessed: true },
      }),
      prisma.productionRecord.groupBy({
        by: ['oreType'],
        where,
        _sum: { tonnesMined: true, tonnesProcessed: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalTonnesMined: Number(totals._sum.tonnesMined) || 0,
      totalTonnesProcessed: Number(totals._sum.tonnesProcessed) || 0,
      avgGrade: Number(totals._avg.grade) || 0,
      totalBlasts: totals._sum.blastCount || 0,
      recordCount: totals._count.id,
      bySite,
      byOreType: byOreType.map((b) => ({
        oreType: b.oreType,
        tonnesMined: Number(b._sum.tonnesMined) || 0,
        tonnesProcessed: Number(b._sum.tonnesProcessed) || 0,
        count: b._count.id,
      })),
    };
  }
}

export default new ProductionService();
