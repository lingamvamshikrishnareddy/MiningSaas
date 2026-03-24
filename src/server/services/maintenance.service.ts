import prisma from '../db/prisma';
import { maintenanceRepository } from '../repositories/maintenance.repository';
import { AppError } from '../middleware/error.middleware';
import { CreateMaintenanceData, UpdateMaintenanceData, MaintenanceListFilters } from '../types/maintenance.types';
import sitesService from './sites.service';

class MaintenanceService {
  async getAll(filters: MaintenanceListFilters, organizationId: string, page: number, limit: number) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const { data, total } = await maintenanceRepository.findWithFiltersPaginated(filters, page, limit, siteIds);
    return { data, total };
  }

  async getById(id: string, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const record = await prisma.maintenanceRecord.findFirst({
      where: { id, equipment: { siteId: { in: siteIds } } },
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true, equipmentType: true } },
        performedBy: { select: { id: true, firstName: true, lastName: true } },
        partsUsed: { include: { part: { select: { partNumber: true, partName: true } } } },
      },
    });
    if (!record) throw new AppError('Maintenance record not found', 404);
    return record;
  }

  async create(data: CreateMaintenanceData, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const equipment = await prisma.equipment.findFirst({
      where: { id: data.equipmentId, siteId: { in: siteIds } },
    });
    if (!equipment) throw new AppError('Equipment not found or access denied', 403);

    return prisma.maintenanceRecord.create({
      data: {
        equipment: { connect: { id: data.equipmentId } },
        maintenanceType: data.maintenanceType,
        priority: data.priority || 'MEDIUM',
        scheduledDate: new Date(data.scheduledDate),
        description: data.description,
        notes: data.notes,
        ...(data.performedById && { performedBy: { connect: { id: data.performedById } } }),
      },
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true, equipmentType: true } },
      },
    });
  }

  async update(id: string, data: UpdateMaintenanceData, organizationId: string) {
    await this.getById(id, organizationId);

    return prisma.maintenanceRecord.update({
      where: { id },
      data: {
        ...(data.maintenanceType && { maintenanceType: data.maintenanceType }),
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
        ...(data.scheduledDate && { scheduledDate: new Date(data.scheduledDate) }),
        ...(data.startedAt && { startedAt: new Date(data.startedAt) }),
        ...(data.completedAt && { completedAt: new Date(data.completedAt) }),
        ...(data.description && { description: data.description }),
        notes: data.notes,
        ...(data.performedById && { performedBy: { connect: { id: data.performedById } } }),
        laborHours: data.laborHours,
        laborCost: data.laborCost,
        partsCost: data.partsCost,
        totalCost: data.totalCost,
        meterReading: data.meterReading,
      },
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true } },
        performedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.maintenanceRecord.delete({ where: { id } });
  }

  async complete(id: string, data: UpdateMaintenanceData, organizationId: string) {
    await this.getById(id, organizationId);

    const completedAt = data.completedAt ? new Date(data.completedAt) : new Date();
    const totalCost = (data.laborCost || 0) + (data.partsCost || 0);

    return prisma.maintenanceRecord.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt,
        startedAt: data.startedAt ? new Date(data.startedAt) : completedAt,
        laborHours: data.laborHours,
        laborCost: data.laborCost,
        partsCost: data.partsCost,
        totalCost: data.totalCost || totalCost,
        notes: data.notes,
      },
    });
  }

  async getStats(organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    return maintenanceRepository.getStats(siteIds);
  }

  async getUpcoming(organizationId: string, days: number = 7) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    return maintenanceRepository.findUpcoming(days, siteIds);
  }

  async getOverdue(organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    return maintenanceRepository.findOverdue(siteIds);
  }
}

export default new MaintenanceService();
