import prisma from '../db/prisma';
import { AppError } from '../middleware/error.middleware';
import sitesService from './sites.service';

class ShiftsService {
  async getAll(organizationId: string, page: number, limit: number, filters: { siteId?: string; shiftType?: string; startDate?: string; endDate?: string; supervisorId?: string }) {
    const siteIds = await sitesService.getSiteIds(organizationId);

    const where: any = {
      siteId: { in: siteIds },
      ...(filters.siteId && { siteId: filters.siteId }),
      ...(filters.shiftType && { shiftType: filters.shiftType }),
      ...(filters.supervisorId && { supervisorId: filters.supervisorId }),
      ...(filters.startDate && { shiftDate: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && {
        shiftDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          lte: new Date(filters.endDate),
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.shift.findMany({
        where,
        include: {
          site: { select: { id: true, name: true, siteCode: true } },
          supervisor: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: [{ shiftDate: 'desc' }, { startTime: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.shift.count({ where }),
    ]);

    return { data, total };
  }

  async getById(id: string, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const shift = await prisma.shift.findFirst({
      where: { id, siteId: { in: siteIds } },
      include: {
        site: { select: { id: true, name: true, siteCode: true } },
        supervisor: { select: { id: true, firstName: true, lastName: true } },
        operatingLogs: {
          include: {
            equipment: { select: { id: true, name: true, assetNumber: true } },
          },
        },
      },
    });
    if (!shift) throw new AppError('Shift not found', 404);
    return shift;
  }

  async create(data: {
    siteId: string;
    shiftType: string;
    shiftDate: string | Date;
    startTime: string | Date;
    endTime: string | Date;
    supervisorId?: string;
    crewSize?: number;
    notes?: string;
  }, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    if (!siteIds.includes(data.siteId)) throw new AppError('Site not found or access denied', 403);

    return prisma.shift.create({
      data: {
        site: { connect: { id: data.siteId } },
        shiftType: data.shiftType as any,
        shiftDate: new Date(data.shiftDate),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        ...(data.supervisorId && { supervisor: { connect: { id: data.supervisorId } } }),
        crewSize: data.crewSize || 0,
        notes: data.notes,
      },
      include: {
        site: { select: { id: true, name: true } },
        supervisor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: any, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.shift.update({ where: { id }, data });
  }

  async delete(id: string, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.shift.delete({ where: { id } });
  }

  async getCurrent(organizationId: string, siteId?: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const now = new Date();

    return prisma.shift.findMany({
      where: {
        siteId: siteId ? undefined : { in: siteIds },
        ...(siteId && { siteId }),
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: {
        site: { select: { id: true, name: true } },
        supervisor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}

export default new ShiftsService();
