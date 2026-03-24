import { Telemetry, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class TelemetryRepository extends BaseRepository<
  Telemetry,
  Prisma.TelemetryCreateInput,
  Prisma.TelemetryUpdateInput,
  Prisma.TelemetryWhereInput,
  Prisma.TelemetryWhereUniqueInput
> {
  constructor() {
    super('Telemetry' as Prisma.ModelName);
  }

  protected getDelegate() {
    return this.prisma.telemetry;
  }

  async findByEquipment(
    equipmentId: string,
    options?: { startTime?: Date; endTime?: Date; limit?: number }
  ): Promise<Telemetry[]> {
    return this.prisma.telemetry.findMany({
      where: {
        equipmentId,
        ...(options?.startTime && { timestamp: { gte: options.startTime } }),
        ...(options?.endTime && { timestamp: { lte: options.endTime } }),
      },
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
    });
  }

  async findLatestByEquipment(equipmentId: string): Promise<Telemetry | null> {
    return this.prisma.telemetry.findFirst({
      where: { equipmentId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findLatestByMultipleEquipment(equipmentIds: string[]): Promise<Telemetry[]> {
    // Get latest telemetry for each equipment
    const results = await Promise.all(
      equipmentIds.map((id) =>
        this.prisma.telemetry.findFirst({
          where: { equipmentId: id },
          orderBy: { timestamp: 'desc' },
        })
      )
    );

    return results.filter((t): t is Telemetry => t !== null);
  }

  async findInTimeRange(
    equipmentId: string,
    startTime: Date,
    endTime: Date
  ): Promise<Telemetry[]> {
    return this.prisma.telemetry.findMany({
      where: {
        equipmentId,
        timestamp: { gte: startTime, lte: endTime },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getAverageMetrics(
    equipmentId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{
    avgFuelLevel: number | null;
    avgSpeed: number | null;
    avgEngineTemp: number | null;
    avgEngineHours: number | null;
  }> {
    const result = await this.prisma.telemetry.aggregate({
      where: {
        equipmentId,
        timestamp: { gte: startTime, lte: endTime },
      },
      _avg: {
        fuelLevel: true,
        speed: true,
        engineTemp: true,
        engineHours: true,
      },
    });

    return {
      avgFuelLevel: result._avg.fuelLevel ? Number(result._avg.fuelLevel) : null,
      avgSpeed: result._avg.speed ? Number(result._avg.speed) : null,
      avgEngineTemp: result._avg.engineTemp ? Number(result._avg.engineTemp) : null,
      avgEngineHours: result._avg.engineHours ? Number(result._avg.engineHours) : null,
    };
  }

  async bulkCreate(data: Prisma.TelemetryCreateManyInput[]): Promise<number> {
    const result = await this.prisma.telemetry.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async deleteOldRecords(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.prisma.telemetry.deleteMany({
      where: { timestamp: { lt: cutoffDate } },
    });

    return result.count;
  }

  async findWithAlerts(siteEquipmentIds: string[]): Promise<Telemetry[]> {
    return this.prisma.telemetry.findMany({
      where: {
        equipmentId: { in: siteEquipmentIds },
        warningCodes: { isEmpty: false },
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      include: {
        equipment: { select: { id: true, name: true, assetNumber: true } },
      },
      orderBy: { timestamp: 'desc' },
    });
  }
}

export const telemetryRepository = new TelemetryRepository();
export default telemetryRepository;
