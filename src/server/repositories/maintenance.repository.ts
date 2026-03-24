import { MaintenanceRecord, Prisma, MaintenanceStatus, MaintenanceType } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { MaintenanceListFilters } from '../types/maintenance.types';

export class MaintenanceRepository extends BaseRepository<
  MaintenanceRecord,
  Prisma.MaintenanceRecordCreateInput,
  Prisma.MaintenanceRecordUpdateInput,
  Prisma.MaintenanceRecordWhereInput,
  Prisma.MaintenanceRecordWhereUniqueInput
> {
  constructor() {
    super('MaintenanceRecord' as Prisma.ModelName);
  }

  protected getDelegate() {
    return this.prisma.maintenanceRecord;
  }

  async findByEquipment(equipmentId: string, includeCompleted = true): Promise<MaintenanceRecord[]> {
    return this.prisma.maintenanceRecord.findMany({
      where: {
        equipmentId,
        ...(includeCompleted ? {} : { status: { not: 'COMPLETED' } }),
      },
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true, equipmentType: true } },
        performedBy: { select: { id: true, firstName: true, lastName: true } },
        partsUsed: { include: { part: { select: { partNumber: true, partName: true } } } },
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async findWithFilters(filters: MaintenanceListFilters, siteIds?: string[]): Promise<MaintenanceRecord[]> {
    const where: Prisma.MaintenanceRecordWhereInput = {
      ...(filters.equipmentId && { equipmentId: filters.equipmentId }),
      ...(filters.maintenanceType && { maintenanceType: filters.maintenanceType }),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.performedById && { performedById: filters.performedById }),
      ...(filters.startDate && { scheduledDate: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && {
        scheduledDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          lte: new Date(filters.endDate),
        },
      }),
      ...(siteIds && { equipment: { siteId: { in: siteIds } } }),
      ...(filters.siteId && { equipment: { siteId: filters.siteId } }),
    };

    return this.prisma.maintenanceRecord.findMany({
      where,
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true, equipmentType: true } },
        performedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async findWithFiltersPaginated(
    filters: MaintenanceListFilters,
    page: number,
    limit: number,
    siteIds?: string[]
  ): Promise<{ data: MaintenanceRecord[]; total: number }> {
    const where: Prisma.MaintenanceRecordWhereInput = {
      ...(filters.equipmentId && { equipmentId: filters.equipmentId }),
      ...(filters.maintenanceType && { maintenanceType: filters.maintenanceType }),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.performedById && { performedById: filters.performedById }),
      ...(siteIds && { equipment: { siteId: { in: siteIds } } }),
      ...(filters.siteId && { equipment: { siteId: filters.siteId } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.maintenanceRecord.findMany({
        where,
        include: {
          equipment: { select: { id: true, assetNumber: true, name: true, equipmentType: true } },
          performedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { scheduledDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.maintenanceRecord.count({ where }),
    ]);

    return { data, total };
  }

  async findOverdue(siteIds?: string[]): Promise<MaintenanceRecord[]> {
    return this.prisma.maintenanceRecord.findMany({
      where: {
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        scheduledDate: { lt: new Date() },
        ...(siteIds && { equipment: { siteId: { in: siteIds } } }),
      },
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true, siteId: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async findUpcoming(days: number, siteIds?: string[]): Promise<MaintenanceRecord[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.maintenanceRecord.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: { gte: new Date(), lte: futureDate },
        ...(siteIds && { equipment: { siteId: { in: siteIds } } }),
      },
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true } },
        performedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async getStats(siteIds: string[]): Promise<{
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
  }> {
    const [total, scheduled, inProgress, completed, cancelled, overdue] = await Promise.all([
      this.prisma.maintenanceRecord.count({ where: { equipment: { siteId: { in: siteIds } } } }),
      this.prisma.maintenanceRecord.count({ where: { equipment: { siteId: { in: siteIds } }, status: 'SCHEDULED' } }),
      this.prisma.maintenanceRecord.count({ where: { equipment: { siteId: { in: siteIds } }, status: 'IN_PROGRESS' } }),
      this.prisma.maintenanceRecord.count({ where: { equipment: { siteId: { in: siteIds } }, status: 'COMPLETED' } }),
      this.prisma.maintenanceRecord.count({ where: { equipment: { siteId: { in: siteIds } }, status: 'CANCELLED' } }),
      this.prisma.maintenanceRecord.count({
        where: {
          equipment: { siteId: { in: siteIds } },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          scheduledDate: { lt: new Date() },
        },
      }),
    ]);

    return { total, scheduled, inProgress, completed, cancelled, overdue };
  }

  async getTotalCost(equipmentId?: string, siteIds?: string[]): Promise<number> {
    const result = await this.prisma.maintenanceRecord.aggregate({
      where: {
        status: 'COMPLETED',
        ...(equipmentId && { equipmentId }),
        ...(siteIds && { equipment: { siteId: { in: siteIds } } }),
      },
      _sum: { totalCost: true },
    });
    return Number(result._sum.totalCost) || 0;
  }

  async markOverdue(): Promise<number> {
    const result = await this.prisma.maintenanceRecord.updateMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: { lt: new Date() },
      },
      data: { status: 'OVERDUE' },
    });
    return result.count;
  }
}

export const maintenanceRepository = new MaintenanceRepository();
export default maintenanceRepository;
