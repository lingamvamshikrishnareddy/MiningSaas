import prisma from '../db/prisma';
import { AppError } from '../middleware/error.middleware';
import sitesService from './sites.service';
import { v4 as uuidv4 } from 'uuid';

class IncidentsService {
  private generateIncidentNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INC-${year}${month}-${random}`;
  }

  async getAll(organizationId: string, page: number, limit: number, filters: { siteId?: string; incidentType?: string; severity?: string; status?: string; startDate?: string; endDate?: string }) {
    const siteIds = await sitesService.getSiteIds(organizationId);

    const where: any = {
      siteId: { in: siteIds },
      ...(filters.siteId && { siteId: filters.siteId }),
      ...(filters.incidentType && { incidentType: filters.incidentType }),
      ...(filters.severity && { severity: filters.severity }),
      ...(filters.status && { status: filters.status }),
      ...(filters.startDate && { incidentDate: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && {
        incidentDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          lte: new Date(filters.endDate),
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          site: { select: { id: true, name: true, siteCode: true } },
          zone: { select: { id: true, name: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { incidentDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.incident.count({ where }),
    ]);

    return { data, total };
  }

  async getById(id: string, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const incident = await prisma.incident.findFirst({
      where: { id, siteId: { in: siteIds } },
      include: {
        site: { select: { id: true, name: true, siteCode: true } },
        zone: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!incident) throw new AppError('Incident not found', 404);
    return incident;
  }

  async create(data: {
    siteId: string;
    zoneId?: string;
    incidentType: string;
    severity: string;
    incidentDate: string | Date;
    description: string;
    rootCause?: string;
    correctiveAction?: string;
    assignedToId?: string;
    injuryCount?: number;
    fatalityCount?: number;
    lostTimeHours?: number;
    isReportable?: boolean;
  }, userId: string, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    if (!siteIds.includes(data.siteId)) throw new AppError('Site not found or access denied', 403);

    return prisma.incident.create({
      data: {
        incidentNumber: this.generateIncidentNumber(),
        site: { connect: { id: data.siteId } },
        ...(data.zoneId && { zone: { connect: { id: data.zoneId } } }),
        incidentType: data.incidentType as any,
        severity: data.severity as any,
        incidentDate: new Date(data.incidentDate),
        description: data.description,
        rootCause: data.rootCause,
        correctiveAction: data.correctiveAction,
        createdBy: { connect: { id: userId } },
        ...(data.assignedToId && { assignedTo: { connect: { id: data.assignedToId } } }),
        injuryCount: data.injuryCount || 0,
        fatalityCount: data.fatalityCount || 0,
        lostTimeHours: data.lostTimeHours,
        isReportable: data.isReportable || false,
      },
      include: {
        site: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: any, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.incident.update({ where: { id }, data });
  }

  async close(id: string, data: { rootCause?: string; correctiveAction?: string }, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.incident.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        ...(data.rootCause && { rootCause: data.rootCause }),
        ...(data.correctiveAction && { correctiveAction: data.correctiveAction }),
      },
    });
  }

  async getStats(organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const where = { siteId: { in: siteIds } };

    const [total, open, bySeverity, byType] = await Promise.all([
      prisma.incident.count({ where }),
      prisma.incident.count({ where: { ...where, status: { in: ['OPEN', 'INVESTIGATING'] } } }),
      prisma.incident.groupBy({ by: ['severity'], where, _count: { id: true } }),
      prisma.incident.groupBy({ by: ['incidentType'], where, _count: { id: true } }),
    ]);

    return {
      total,
      open,
      bySeverity: bySeverity.map((s) => ({ severity: s.severity, count: s._count.id })),
      byType: byType.map((t) => ({ type: t.incidentType, count: t._count.id })),
    };
  }
}

export default new IncidentsService();
