import { Request, Response, NextFunction } from 'express';
import equipmentService from '../services/equipment.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.util';

export const getAllEquipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const filters = {
      equipmentType: req.query.equipmentType as any,
      status: req.query.status as any,
      siteId: req.query.siteId as string,
      zoneId: req.query.zoneId as string,
      manufacturer: req.query.manufacturer as string,
      search: req.query.search as string,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    };

    const { data, total } = await equipmentService.getAll(filters, req.user!.organizationId, page, limit);
    return sendSuccess(res, data, 200, { pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

export const getEquipmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const equipment = await equipmentService.getById(req.params.id, req.user!.organizationId);
    return sendSuccess(res, equipment);
  } catch (error) {
    next(error);
  }
};

export const createEquipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const equipment = await equipmentService.create(req.body, req.user!.organizationId);
    return sendCreated(res, equipment);
  } catch (error) {
    next(error);
  }
};

export const updateEquipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const equipment = await equipmentService.update(req.params.id, req.body, req.user!.organizationId);
    return sendSuccess(res, equipment);
  } catch (error) {
    next(error);
  }
};

export const deleteEquipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await equipmentService.delete(req.params.id, req.user!.organizationId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const updateEquipmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const equipment = await equipmentService.updateStatus(req.params.id, status, req.user!.organizationId);
    return sendSuccess(res, equipment);
  } catch (error) {
    next(error);
  }
};

export const getFleetOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const overview = await equipmentService.getFleetOverview(req.user!.organizationId);
    return sendSuccess(res, overview);
  } catch (error) {
    next(error);
  }
};

export const getEquipmentTelemetry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const telemetry = await equipmentService.getEquipmentTelemetry(req.params.id, req.user!.organizationId, hours);
    return sendSuccess(res, telemetry);
  } catch (error) {
    next(error);
  }
};
