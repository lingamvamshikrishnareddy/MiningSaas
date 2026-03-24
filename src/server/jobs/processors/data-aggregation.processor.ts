import { Job } from 'bull';
import prisma from '../../db/prisma';
import logger from '../../utils/logger.util';

export interface DataAggregationJob {
  type: 'daily_kpi';
  organizationId: string;
  date?: string;
}

export const dataAggregationProcessor = async (job: Job<DataAggregationJob>) => {
  const { organizationId, date } = job.data;
  const snapshotDate = date ? new Date(date) : new Date();
  snapshotDate.setHours(0, 0, 0, 0);

  logger.info(`Aggregating data for org: ${organizationId}, date: ${snapshotDate.toISOString()}`);

  const sites = await prisma.site.findMany({
    where: { organizationId, isActive: true },
    select: { id: true },
  });
  const siteIds = sites.map((s) => s.id);

  const [equipmentStats, incidentCount] = await Promise.all([
    prisma.equipment.groupBy({
      by: ['status'],
      where: { siteId: { in: siteIds }, isActive: true },
      _count: { id: true },
    }),
    prisma.incident.count({
      where: { siteId: { in: siteIds }, incidentDate: { gte: snapshotDate } },
    }),
  ]);

  const statusMap: Record<string, number> = {};
  equipmentStats.forEach((e) => { statusMap[e.status] = e._count.id; });

  const total = Object.values(statusMap).reduce((a, b) => a + b, 0);

  await prisma.kPISnapshot.upsert({
    where: {
      organizationId_siteId_snapshotDate_snapshotType: {
        organizationId,
        siteId: '',
        snapshotDate,
        snapshotType: 'DAILY',
      },
    },
    create: {
      organizationId,
      snapshotDate,
      snapshotType: 'DAILY',
      availableEquipment: (statusMap['OPERATIONAL'] || 0) + (statusMap['IDLE'] || 0),
      inUseEquipment: statusMap['IN_USE'] || 0,
      maintenanceEquipment: statusMap['MAINTENANCE'] || 0,
      fleetUtilization: total > 0 ? ((statusMap['IN_USE'] || 0) / total) * 100 : 0,
      incidentCount,
    },
    update: {
      availableEquipment: (statusMap['OPERATIONAL'] || 0) + (statusMap['IDLE'] || 0),
      inUseEquipment: statusMap['IN_USE'] || 0,
      maintenanceEquipment: statusMap['MAINTENANCE'] || 0,
      fleetUtilization: total > 0 ? ((statusMap['IN_USE'] || 0) / total) * 100 : 0,
      incidentCount,
    },
  });

  return { processed: true, organizationId };
};
