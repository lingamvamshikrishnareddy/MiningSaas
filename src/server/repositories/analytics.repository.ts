import { KPISnapshot, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class AnalyticsRepository extends BaseRepository<
  KPISnapshot,
  Prisma.KPISnapshotCreateInput,
  Prisma.KPISnapshotUpdateInput,
  Prisma.KPISnapshotWhereInput,
  Prisma.KPISnapshotWhereUniqueInput
> {
  constructor() {
    super('KPISnapshot' as Prisma.ModelName);
  }

  protected getDelegate() {
    return this.prisma.kPISnapshot;
  }

  async findByOrganization(
    organizationId: string,
    options?: {
      siteId?: string;
      startDate?: Date;
      endDate?: Date;
      snapshotType?: string;
      limit?: number;
    }
  ): Promise<KPISnapshot[]> {
    return this.prisma.kPISnapshot.findMany({
      where: {
        organizationId,
        ...(options?.siteId && { siteId: options.siteId }),
        ...(options?.snapshotType && { snapshotType: options.snapshotType as any }),
        ...(options?.startDate && { snapshotDate: { gte: options.startDate } }),
        ...(options?.endDate && {
          snapshotDate: {
            ...(options.startDate ? { gte: options.startDate } : {}),
            lte: options.endDate,
          },
        }),
      },
      orderBy: { snapshotDate: 'desc' },
      take: options?.limit || 30,
    });
  }

  async findLatest(organizationId: string, siteId?: string): Promise<KPISnapshot | null> {
    return this.prisma.kPISnapshot.findFirst({
      where: {
        organizationId,
        ...(siteId && { siteId }),
        snapshotType: 'DAILY',
      },
      orderBy: { snapshotDate: 'desc' },
    });
  }

  async upsertDailySnapshot(data: Prisma.KPISnapshotCreateInput): Promise<KPISnapshot> {
    const { organizationId, siteId, snapshotDate, snapshotType } = data;

    return this.prisma.kPISnapshot.upsert({
      where: {
        organizationId_siteId_snapshotDate_snapshotType: {
          organizationId: organizationId as string,
          siteId: (siteId as string) || '',
          snapshotDate: snapshotDate as Date,
          snapshotType: (snapshotType as any) || 'DAILY',
        },
      },
      create: data,
      update: {
        totalProduction: data.totalProduction,
        fleetUtilization: data.fleetUtilization,
        availableEquipment: data.availableEquipment,
        inUseEquipment: data.inUseEquipment,
        maintenanceEquipment: data.maintenanceEquipment,
        plannedMaintenanceCompliance: data.plannedMaintenanceCompliance,
        meanTimeBetweenFailure: data.meanTimeBetweenFailure,
        totalFuelConsumed: data.totalFuelConsumed,
        fuelCost: data.fuelCost,
        incidentCount: data.incidentCount,
        lostTimeIncidents: data.lostTimeIncidents,
        safeDaysCount: data.safeDaysCount,
      },
    });
  }

  async getProductionTrend(
    organizationId: string,
    days: number,
    siteId?: string
  ): Promise<{ date: Date; production: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshots = await this.prisma.kPISnapshot.findMany({
      where: {
        organizationId,
        snapshotType: 'DAILY',
        snapshotDate: { gte: startDate },
        ...(siteId && { siteId }),
      },
      select: { snapshotDate: true, totalProduction: true },
      orderBy: { snapshotDate: 'asc' },
    });

    return snapshots.map((s) => ({
      date: s.snapshotDate,
      production: Number(s.totalProduction) || 0,
    }));
  }

  async getEquipmentProductionStats(
    siteIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    return this.prisma.productionRecord.groupBy({
      by: ['siteId', 'oreType'],
      where: {
        siteId: { in: siteIds },
        productionDate: { gte: startDate, lte: endDate },
      },
      _sum: { tonnesMined: true, tonnesProcessed: true },
    });
  }

  async getIncidentStats(
    siteIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    return this.prisma.incident.groupBy({
      by: ['incidentType', 'severity'],
      where: {
        siteId: { in: siteIds },
        incidentDate: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
    });
  }

  async getFuelConsumptionStats(
    equipmentIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    return this.prisma.fuelLog.aggregate({
      where: {
        equipmentId: { in: equipmentIds },
        fuelDate: { gte: startDate, lte: endDate },
      },
      _sum: { quantityLiters: true, totalCost: true },
      _avg: { costPerLiter: true },
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
export default analyticsRepository;
