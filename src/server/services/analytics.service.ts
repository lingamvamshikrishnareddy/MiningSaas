import prisma from '../db/prisma';
import sitesService from './sites.service';

class AnalyticsService {
  async getDashboardStats(organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);

    const [
      totalEquipment,
      operationalEquipment,
      inUseEquipment,
      maintenanceEquipment,
      openIncidents,
      pendingMaintenance,
      overdueMaintenance,
    ] = await Promise.all([
      prisma.equipment.count({ where: { site: { organizationId }, isActive: true } }),
      prisma.equipment.count({ where: { site: { organizationId }, status: 'OPERATIONAL', isActive: true } }),
      prisma.equipment.count({ where: { site: { organizationId }, status: 'IN_USE', isActive: true } }),
      prisma.equipment.count({ where: { site: { organizationId }, status: 'MAINTENANCE', isActive: true } }),
      prisma.incident.count({ where: { siteId: { in: siteIds }, status: { in: ['OPEN', 'INVESTIGATING'] } } }),
      prisma.maintenanceRecord.count({ where: { equipment: { siteId: { in: siteIds } }, status: 'SCHEDULED' } }),
      prisma.maintenanceRecord.count({
        where: {
          equipment: { siteId: { in: siteIds } },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          scheduledDate: { lt: new Date() },
        },
      }),
    ]);

    const fleetUtilization = totalEquipment > 0 ? ((inUseEquipment / totalEquipment) * 100).toFixed(1) : 0;
    const fleetAvailability = totalEquipment > 0 ? (((totalEquipment - maintenanceEquipment) / totalEquipment) * 100).toFixed(1) : 0;

    return {
      fleet: {
        total: totalEquipment,
        operational: operationalEquipment,
        inUse: inUseEquipment,
        maintenance: maintenanceEquipment,
        utilizationRate: parseFloat(String(fleetUtilization)),
        availabilityRate: parseFloat(String(fleetAvailability)),
      },
      safety: {
        openIncidents,
      },
      maintenance: {
        pending: pendingMaintenance,
        overdue: overdueMaintenance,
      },
    };
  }

  async getProductionTrend(organizationId: string, days: number = 30, siteId?: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await prisma.productionRecord.findMany({
      where: {
        siteId: siteId ? siteId : { in: siteIds },
        productionDate: { gte: startDate },
      },
      select: { productionDate: true, tonnesMined: true, tonnesProcessed: true, oreType: true },
      orderBy: { productionDate: 'asc' },
    });

    return records.map((r) => ({
      date: r.productionDate,
      tonnesMined: Number(r.tonnesMined),
      tonnesProcessed: Number(r.tonnesProcessed) || 0,
      oreType: r.oreType,
    }));
  }

  async getMaintenanceCostTrend(organizationId: string, months: number = 6) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const records = await prisma.maintenanceRecord.findMany({
      where: {
        equipment: { siteId: { in: siteIds } },
        status: 'COMPLETED',
        completedAt: { gte: startDate },
        totalCost: { not: null },
      },
      select: { completedAt: true, totalCost: true, maintenanceType: true, laborCost: true, partsCost: true },
    });

    // Group by month
    const byMonth: Record<string, { labor: number; parts: number; total: number }> = {};
    records.forEach((r) => {
      if (!r.completedAt) return;
      const key = `${r.completedAt.getFullYear()}-${String(r.completedAt.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[key]) byMonth[key] = { labor: 0, parts: 0, total: 0 };
      byMonth[key].labor += Number(r.laborCost) || 0;
      byMonth[key].parts += Number(r.partsCost) || 0;
      byMonth[key].total += Number(r.totalCost) || 0;
    });

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, costs]) => ({ month, ...costs }));
  }

  async getFuelConsumptionTrend(organizationId: string, days: number = 30, siteId?: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.fuelLog.findMany({
      where: {
        equipment: { siteId: siteId ? siteId : { in: siteIds } },
        fuelDate: { gte: startDate },
      },
      select: { fuelDate: true, quantityLiters: true, totalCost: true, fuelType: true },
      orderBy: { fuelDate: 'asc' },
    });

    return logs.map((l) => ({
      date: l.fuelDate,
      liters: Number(l.quantityLiters),
      cost: Number(l.totalCost),
      fuelType: l.fuelType,
    }));
  }

  async getEquipmentUtilization(organizationId: string, siteId?: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);

    const equipment = await prisma.equipment.findMany({
      where: {
        siteId: siteId ? siteId : { in: siteIds },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        assetNumber: true,
        equipmentType: true,
        status: true,
        totalHours: true,
        lastServiceHours: true,
      },
    });

    return equipment.map((e) => ({
      id: e.id,
      name: e.name,
      assetNumber: e.assetNumber,
      equipmentType: e.equipmentType,
      status: e.status,
      totalHours: Number(e.totalHours),
      hoursSinceService: Number(e.totalHours) - Number(e.lastServiceHours),
    }));
  }

  async getSafetyMetrics(organizationId: string, days: number = 30) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [total, byType, bySeverity, lostTime] = await Promise.all([
      prisma.incident.count({ where: { siteId: { in: siteIds }, incidentDate: { gte: startDate } } }),
      prisma.incident.groupBy({
        by: ['incidentType'],
        where: { siteId: { in: siteIds }, incidentDate: { gte: startDate } },
        _count: { id: true },
      }),
      prisma.incident.groupBy({
        by: ['severity'],
        where: { siteId: { in: siteIds }, incidentDate: { gte: startDate } },
        _count: { id: true },
      }),
      prisma.incident.aggregate({
        where: { siteId: { in: siteIds }, incidentDate: { gte: startDate } },
        _sum: { lostTimeHours: true, injuryCount: true, fatalityCount: true },
      }),
    ]);

    return {
      total,
      lostTimeHours: Number(lostTime._sum.lostTimeHours) || 0,
      totalInjuries: lostTime._sum.injuryCount || 0,
      totalFatalities: lostTime._sum.fatalityCount || 0,
      byType: byType.map((t) => ({ type: t.incidentType, count: t._count.id })),
      bySeverity: bySeverity.map((s) => ({ severity: s.severity, count: s._count.id })),
    };
  }

  async getKPISnapshot(organizationId: string) {
    const [dashboard, latestProduction] = await Promise.all([
      this.getDashboardStats(organizationId),
      prisma.productionRecord.findFirst({
        where: { site: { organizationId } },
        orderBy: { productionDate: 'desc' },
        select: { tonnesMined: true, productionDate: true },
      }),
    ]);

    return {
      ...dashboard,
      latestProduction: latestProduction
        ? { tonnes: Number(latestProduction.tonnesMined), date: latestProduction.productionDate }
        : null,
    };
  }
}

export default new AnalyticsService();
