import { Equipment, Prisma, EquipmentStatus, EquipmentType } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { EquipmentListFilters } from '../types/equipment.types';

export class EquipmentRepository extends BaseRepository<
  Equipment,
  Prisma.EquipmentCreateInput,
  Prisma.EquipmentUpdateInput,
  Prisma.EquipmentWhereInput,
  Prisma.EquipmentWhereUniqueInput
> {
  constructor() {
    super('Equipment' as Prisma.ModelName);
  }

  protected getDelegate() {
    return this.prisma.equipment;
  }

  async findBySite(siteId: string, includeInactive = false): Promise<Equipment[]> {
    return this.prisma.equipment.findMany({
      where: {
        siteId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        site: { select: { id: true, name: true, siteCode: true } },
        currentZone: { select: { id: true, name: true, zoneCode: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByType(equipmentType: EquipmentType, organizationSiteIds?: string[]): Promise<Equipment[]> {
    return this.prisma.equipment.findMany({
      where: {
        equipmentType,
        isActive: true,
        ...(organizationSiteIds && { siteId: { in: organizationSiteIds } }),
      },
      include: {
        site: { select: { id: true, name: true, siteCode: true } },
      },
    });
  }

  async findByStatus(status: EquipmentStatus, siteId?: string): Promise<Equipment[]> {
    return this.prisma.equipment.findMany({
      where: {
        status,
        isActive: true,
        ...(siteId && { siteId }),
      },
      include: {
        site: { select: { id: true, name: true, siteCode: true } },
        currentZone: { select: { id: true, name: true, zoneCode: true } },
      },
    });
  }

  async updateStatus(id: string, status: EquipmentStatus): Promise<Equipment> {
    return this.prisma.equipment.update({
      where: { id },
      data: { status },
    });
  }

  async findWithFilters(filters: EquipmentListFilters, organizationSiteIds?: string[]): Promise<Equipment[]> {
    const where: Prisma.EquipmentWhereInput = {
      ...(filters.equipmentType && { equipmentType: filters.equipmentType }),
      ...(filters.status && { status: filters.status }),
      ...(filters.siteId && { siteId: filters.siteId }),
      ...(filters.zoneId && { currentZoneId: filters.zoneId }),
      ...(filters.manufacturer && { manufacturer: { contains: filters.manufacturer, mode: 'insensitive' } }),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : { isActive: true }),
      ...(organizationSiteIds && !filters.siteId && { siteId: { in: organizationSiteIds } }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { assetNumber: { contains: filters.search, mode: 'insensitive' } },
          { model: { contains: filters.search, mode: 'insensitive' } },
          { serialNumber: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prisma.equipment.findMany({
      where,
      include: {
        site: { select: { id: true, name: true, siteCode: true } },
        currentZone: { select: { id: true, name: true, zoneCode: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findWithFiltersPaginated(
    filters: EquipmentListFilters,
    page: number,
    limit: number,
    organizationSiteIds?: string[]
  ): Promise<{ data: Equipment[]; total: number }> {
    const where: Prisma.EquipmentWhereInput = {
      ...(filters.equipmentType && { equipmentType: filters.equipmentType }),
      ...(filters.status && { status: filters.status }),
      ...(filters.siteId && { siteId: filters.siteId }),
      ...(filters.zoneId && { currentZoneId: filters.zoneId }),
      ...(filters.manufacturer && { manufacturer: { contains: filters.manufacturer, mode: 'insensitive' } }),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : { isActive: true }),
      ...(organizationSiteIds && !filters.siteId && { siteId: { in: organizationSiteIds } }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { assetNumber: { contains: filters.search, mode: 'insensitive' } },
          { model: { contains: filters.search, mode: 'insensitive' } },
          { serialNumber: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        include: {
          site: { select: { id: true, name: true, siteCode: true } },
          currentZone: { select: { id: true, name: true, zoneCode: true } },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.equipment.count({ where }),
    ]);

    return { data, total };
  }

  async getEquipmentStats(siteIds: string[]): Promise<{
    total: number;
    operational: number;
    inUse: number;
    maintenance: number;
    idle: number;
    repair: number;
    decommissioned: number;
  }> {
    const [total, operational, inUse, maintenance, idle, repair, decommissioned] = await Promise.all([
      this.prisma.equipment.count({ where: { siteId: { in: siteIds }, isActive: true } }),
      this.prisma.equipment.count({ where: { siteId: { in: siteIds }, status: 'OPERATIONAL', isActive: true } }),
      this.prisma.equipment.count({ where: { siteId: { in: siteIds }, status: 'IN_USE', isActive: true } }),
      this.prisma.equipment.count({ where: { siteId: { in: siteIds }, status: 'MAINTENANCE', isActive: true } }),
      this.prisma.equipment.count({ where: { siteId: { in: siteIds }, status: 'IDLE', isActive: true } }),
      this.prisma.equipment.count({ where: { siteId: { in: siteIds }, status: 'REPAIR', isActive: true } }),
      this.prisma.equipment.count({ where: { siteId: { in: siteIds }, status: 'DECOMMISSIONED' } }),
    ]);

    return { total, operational, inUse, maintenance, idle, repair, decommissioned };
  }

  async findOverdueForMaintenance(siteIds: string[]): Promise<Equipment[]> {
    return this.prisma.equipment.findMany({
      where: {
        siteId: { in: siteIds },
        isActive: true,
        nextServiceDue: { lt: new Date() },
      },
      include: {
        site: { select: { id: true, name: true } },
      },
      orderBy: { nextServiceDue: 'asc' },
    });
  }

  async updateHours(id: string, hours: number): Promise<Equipment> {
    return this.prisma.equipment.update({
      where: { id },
      data: { totalHours: hours },
    });
  }

  async findByAssetNumber(assetNumber: string): Promise<Equipment | null> {
    return this.prisma.equipment.findUnique({ where: { assetNumber } });
  }

  async findBySerialNumber(serialNumber: string): Promise<Equipment | null> {
    return this.prisma.equipment.findUnique({ where: { serialNumber } });
  }
}

export const equipmentRepository = new EquipmentRepository();
export default equipmentRepository;
