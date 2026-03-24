import prisma from '../db/prisma';
import { equipmentRepository } from '../repositories/equipment.repository';
import { AppError } from '../middleware/error.middleware';
import { CreateEquipmentData, UpdateEquipmentData, EquipmentListFilters, EquipmentStatus } from '../types/equipment.types';
import sitesService from './sites.service';

class EquipmentService {
  async getAll(filters: EquipmentListFilters, organizationId: string, page: number, limit: number) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const { data, total } = await equipmentRepository.findWithFiltersPaginated(filters, page, limit, siteIds);
    return { data, total };
  }

  async getById(id: string, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const equipment = await equipmentRepository.findById(id, {
      site: { select: { id: true, name: true, siteCode: true } },
      currentZone: { select: { id: true, name: true, zoneCode: true } },
    });

    if (!equipment || !siteIds.includes(equipment.siteId)) {
      throw new AppError('Equipment not found', 404);
    }
    return equipment;
  }

  async create(data: CreateEquipmentData, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    if (!siteIds.includes(data.siteId)) {
      throw new AppError('Site not found or access denied', 403);
    }

    const assetExists = await equipmentRepository.findByAssetNumber(data.assetNumber);
    if (assetExists) throw new AppError('Asset number already exists', 409);

    const serialExists = await equipmentRepository.findBySerialNumber(data.serialNumber);
    if (serialExists) throw new AppError('Serial number already exists', 409);

    return prisma.equipment.create({
      data: {
        assetNumber: data.assetNumber,
        name: data.name,
        equipmentType: data.equipmentType,
        site: { connect: { id: data.siteId } },
        ...(data.currentZoneId && { currentZone: { connect: { id: data.currentZoneId } } }),
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        yearManufactured: data.yearManufactured,
        purchaseDate: new Date(data.purchaseDate),
        purchaseCost: data.purchaseCost,
        status: data.status || 'OPERATIONAL',
        capacity: data.capacity,
        capacityUnit: data.capacityUnit,
        fuelType: data.fuelType,
        fuelCapacity: data.fuelCapacity,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
      },
      include: {
        site: { select: { id: true, name: true, siteCode: true } },
      },
    });
  }

  async update(id: string, data: UpdateEquipmentData, organizationId: string) {
    await this.getById(id, organizationId);

    return prisma.equipment.update({
      where: { id },
      data: {
        ...data,
        ...(data.nextServiceDue && { nextServiceDue: new Date(data.nextServiceDue) }),
        ...(data.warrantyExpiry && { warrantyExpiry: new Date(data.warrantyExpiry) }),
        ...(data.insuranceExpiry && { insuranceExpiry: new Date(data.insuranceExpiry) }),
      },
      include: {
        site: { select: { id: true, name: true, siteCode: true } },
        currentZone: { select: { id: true, name: true, zoneCode: true } },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.equipment.update({ where: { id }, data: { isActive: false } });
  }

  async updateStatus(id: string, status: EquipmentStatus, organizationId: string) {
    await this.getById(id, organizationId);
    return equipmentRepository.updateStatus(id, status as any);
  }

  async getFleetOverview(organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const stats = await equipmentRepository.getEquipmentStats(siteIds);

    const total = stats.total;
    const available = stats.operational + stats.idle;
    const utilizationRate = total > 0 ? (stats.inUse / total) * 100 : 0;
    const availabilityRate = total > 0 ? (available / total) * 100 : 0;

    return {
      ...stats,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      availabilityRate: Math.round(availabilityRate * 100) / 100,
    };
  }

  async getOverdueForMaintenance(organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    return equipmentRepository.findOverdueForMaintenance(siteIds);
  }

  async getEquipmentTelemetry(id: string, organizationId: string, hours: number = 24) {
    await this.getById(id, organizationId);
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return prisma.telemetry.findMany({
      where: { equipmentId: id, timestamp: { gte: startTime } },
      orderBy: { timestamp: 'desc' },
      take: 500,
    });
  }
}

export default new EquipmentService();
