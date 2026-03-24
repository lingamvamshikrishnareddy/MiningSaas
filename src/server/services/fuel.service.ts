import prisma from '../db/prisma';
import { AppError } from '../middleware/error.middleware';
import sitesService from './sites.service';

class FuelService {
  async getAll(organizationId: string, page: number, limit: number, filters: { equipmentId?: string; siteId?: string; startDate?: string; endDate?: string }) {
    const siteIds = await sitesService.getSiteIds(organizationId);

    const where: any = {
      equipment: { siteId: { in: siteIds } },
      ...(filters.equipmentId && { equipmentId: filters.equipmentId }),
      ...(filters.siteId && { equipment: { siteId: filters.siteId } }),
      ...(filters.startDate && { fuelDate: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && {
        fuelDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          lte: new Date(filters.endDate),
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where,
        include: {
          equipment: { select: { id: true, assetNumber: true, name: true } },
        },
        orderBy: { fuelDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.fuelLog.count({ where }),
    ]);

    return { data, total };
  }

  async getById(id: string, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const log = await prisma.fuelLog.findFirst({
      where: { id, equipment: { siteId: { in: siteIds } } },
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true } },
      },
    });
    if (!log) throw new AppError('Fuel log not found', 404);
    return log;
  }

  async create(data: {
    equipmentId: string;
    fuelDate?: Date;
    fuelType: string;
    quantityLiters: number;
    costPerLiter: number;
    totalCost: number;
    meterReading?: number;
    supplier?: string;
    invoiceNumber?: string;
    notes?: string;
  }, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const equipment = await prisma.equipment.findFirst({ where: { id: data.equipmentId, siteId: { in: siteIds } } });
    if (!equipment) throw new AppError('Equipment not found or access denied', 403);

    return prisma.fuelLog.create({
      data: {
        equipment: { connect: { id: data.equipmentId } },
        fuelDate: data.fuelDate || new Date(),
        fuelType: data.fuelType as any,
        quantityLiters: data.quantityLiters,
        costPerLiter: data.costPerLiter,
        totalCost: data.totalCost,
        meterReading: data.meterReading,
        supplier: data.supplier,
        invoiceNumber: data.invoiceNumber,
        notes: data.notes,
      },
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true } },
      },
    });
  }

  async update(id: string, data: any, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.fuelLog.update({ where: { id }, data });
  }

  async delete(id: string, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.fuelLog.delete({ where: { id } });
  }

  async getSummary(organizationId: string, startDate?: string, endDate?: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);

    const where: any = {
      equipment: { siteId: { in: siteIds } },
      ...(startDate && { fuelDate: { gte: new Date(startDate) } }),
      ...(endDate && {
        fuelDate: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          lte: new Date(endDate),
        },
      }),
    };

    const [totals, byType] = await Promise.all([
      prisma.fuelLog.aggregate({
        where,
        _sum: { quantityLiters: true, totalCost: true },
        _avg: { costPerLiter: true },
        _count: { id: true },
      }),
      prisma.fuelLog.groupBy({
        by: ['fuelType'],
        where,
        _sum: { quantityLiters: true, totalCost: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalLiters: Number(totals._sum.quantityLiters) || 0,
      totalCost: Number(totals._sum.totalCost) || 0,
      avgCostPerLiter: Number(totals._avg.costPerLiter) || 0,
      totalTransactions: totals._count.id,
      byFuelType: byType.map((b) => ({
        fuelType: b.fuelType,
        totalLiters: Number(b._sum.quantityLiters) || 0,
        totalCost: Number(b._sum.totalCost) || 0,
        count: b._count.id,
      })),
    };
  }
}

export default new FuelService();
