import prisma from '../db/prisma';
import { AppError } from '../middleware/error.middleware';
import sitesService from './sites.service';

class InspectionsService {
  async getAll(organizationId: string, page: number, limit: number, filters: { equipmentId?: string; inspectorId?: string; inspectionType?: string; status?: string; startDate?: string; endDate?: string }) {
    const siteIds = await sitesService.getSiteIds(organizationId);

    const where: any = {
      equipment: { siteId: { in: siteIds } },
      ...(filters.equipmentId && { equipmentId: filters.equipmentId }),
      ...(filters.inspectorId && { inspectorId: filters.inspectorId }),
      ...(filters.inspectionType && { inspectionType: filters.inspectionType }),
      ...(filters.status && { overallStatus: filters.status }),
      ...(filters.startDate && { inspectionDate: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && {
        inspectionDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          lte: new Date(filters.endDate),
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        include: {
          equipment: { select: { id: true, assetNumber: true, name: true } },
          inspector: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { inspectionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inspection.count({ where }),
    ]);

    return { data, total };
  }

  async getById(id: string, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const inspection = await prisma.inspection.findFirst({
      where: { id, equipment: { siteId: { in: siteIds } } },
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true, equipmentType: true } },
        inspector: { select: { id: true, firstName: true, lastName: true } },
        checklistItems: true,
      },
    });
    if (!inspection) throw new AppError('Inspection not found', 404);
    return inspection;
  }

  async create(data: {
    equipmentId: string;
    inspectionType: string;
    inspectorId: string;
    overallStatus: string;
    meterReading?: number;
    findings?: string;
    recommendations?: string;
    nextInspectionDue?: string;
    checklistItems?: { category: string; checkPoint: string; status: string; notes?: string }[];
  }, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const equipment = await prisma.equipment.findFirst({ where: { id: data.equipmentId, siteId: { in: siteIds } } });
    if (!equipment) throw new AppError('Equipment not found or access denied', 403);

    return prisma.inspection.create({
      data: {
        equipment: { connect: { id: data.equipmentId } },
        inspectionType: data.inspectionType as any,
        inspector: { connect: { id: data.inspectorId } },
        overallStatus: data.overallStatus as any,
        meterReading: data.meterReading,
        findings: data.findings,
        recommendations: data.recommendations,
        nextInspectionDue: data.nextInspectionDue ? new Date(data.nextInspectionDue) : undefined,
        checklistItems: data.checklistItems
          ? {
              create: data.checklistItems.map((item) => ({
                category: item.category,
                checkPoint: item.checkPoint,
                status: item.status as any,
                notes: item.notes,
              })),
            }
          : undefined,
      },
      include: {
        equipment: { select: { id: true, assetNumber: true, name: true } },
        inspector: { select: { id: true, firstName: true, lastName: true } },
        checklistItems: true,
      },
    });
  }

  async update(id: string, data: any, organizationId: string) {
    await this.getById(id, organizationId);
    return prisma.inspection.update({ where: { id }, data });
  }

  async delete(id: string, organizationId: string) {
    await this.getById(id, organizationId);
    await prisma.inspectionItem.deleteMany({ where: { inspectionId: id } });
    return prisma.inspection.delete({ where: { id } });
  }

  async getStats(organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const where = { equipment: { siteId: { in: siteIds } } };

    const [total, passed, failed, needsMaintenance] = await Promise.all([
      prisma.inspection.count({ where }),
      prisma.inspection.count({ where: { ...where, overallStatus: { in: ['PASS', 'PASS_WITH_NOTES'] } } }),
      prisma.inspection.count({ where: { ...where, overallStatus: 'FAIL' } }),
      prisma.inspection.count({ where: { ...where, overallStatus: 'NEEDS_MAINTENANCE' } }),
    ]);

    return { total, passed, failed, needsMaintenance, passRate: total > 0 ? (passed / total) * 100 : 0 };
  }
}

export default new InspectionsService();
