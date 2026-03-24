import prisma from '../db/prisma';
import { telemetryRepository } from '../repositories/telemetry.repository';
import { AppError } from '../middleware/error.middleware';
import sitesService from './sites.service';

class TelemetryService {
  async getByEquipment(equipmentId: string, organizationId: string, options?: { hours?: number; limit?: number }) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const equipment = await prisma.equipment.findFirst({ where: { id: equipmentId, siteId: { in: siteIds } } });
    if (!equipment) throw new AppError('Equipment not found', 404);

    const hours = options?.hours || 24;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return telemetryRepository.findByEquipment(equipmentId, {
      startTime,
      limit: options?.limit || 200,
    });
  }

  async getLatest(equipmentId: string, organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const equipment = await prisma.equipment.findFirst({ where: { id: equipmentId, siteId: { in: siteIds } } });
    if (!equipment) throw new AppError('Equipment not found', 404);
    return telemetryRepository.findLatestByEquipment(equipmentId);
  }

  async getFleetLatest(organizationId: string, siteId?: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const filteredSiteIds = siteId ? [siteId] : siteIds;

    const equipment = await prisma.equipment.findMany({
      where: { siteId: { in: filteredSiteIds }, isActive: true },
      select: { id: true },
    });

    const equipmentIds = equipment.map((e) => e.id);
    return telemetryRepository.findLatestByMultipleEquipment(equipmentIds);
  }

  async ingest(data: {
    equipmentId: string;
    timestamp?: Date;
    engineHours?: number;
    fuelLevel?: number;
    speed?: number;
    engineTemp?: number;
    oilPressure?: number;
    coolantTemp?: number;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    vibration?: number;
    hydraulicPressure?: number;
    batteryVoltage?: number;
    warningCodes?: string[];
  }) {
    return prisma.telemetry.create({
      data: {
        equipment: { connect: { id: data.equipmentId } },
        timestamp: data.timestamp || new Date(),
        engineHours: data.engineHours,
        fuelLevel: data.fuelLevel,
        speed: data.speed,
        engineTemp: data.engineTemp,
        oilPressure: data.oilPressure,
        coolantTemp: data.coolantTemp,
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        vibration: data.vibration,
        hydraulicPressure: data.hydraulicPressure,
        batteryVoltage: data.batteryVoltage,
        warningCodes: data.warningCodes || [],
      },
    });
  }

  async bulkIngest(records: any[]) {
    return telemetryRepository.bulkCreate(
      records.map((r) => ({
        ...r,
        timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
        warningCodes: r.warningCodes || [],
      }))
    );
  }

  async getAverages(equipmentId: string, organizationId: string, hours: number = 24) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const equipment = await prisma.equipment.findFirst({ where: { id: equipmentId, siteId: { in: siteIds } } });
    if (!equipment) throw new AppError('Equipment not found', 404);

    const endTime = new Date();
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return telemetryRepository.getAverageMetrics(equipmentId, startTime, endTime);
  }

  async getAlerts(organizationId: string) {
    const siteIds = await sitesService.getSiteIds(organizationId);
    const equipment = await prisma.equipment.findMany({
      where: { siteId: { in: siteIds }, isActive: true },
      select: { id: true },
    });
    return telemetryRepository.findWithAlerts(equipment.map((e) => e.id));
  }
}

export default new TelemetryService();
