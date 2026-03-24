import { Request, Response, NextFunction } from 'express';
import maintenanceService from '../services/maintenance.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.util';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const filters = {
      equipmentId: req.query.equipmentId as string,
      maintenanceType: req.query.maintenanceType as any,
      status: req.query.status as any,
      priority: req.query.priority as any,
      siteId: req.query.siteId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const { data, total } = await maintenanceService.getAll(filters, req.user!.organizationId, page, limit);
    return sendSuccess(res, data, 200, { pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await maintenanceService.getById(req.params.id, req.user!.organizationId);
    return sendSuccess(res, record);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await maintenanceService.create(req.body, req.user!.organizationId);
    return sendCreated(res, record);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await maintenanceService.update(req.params.id, req.body, req.user!.organizationId);
    return sendSuccess(res, record);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await maintenanceService.delete(req.params.id, req.user!.organizationId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const complete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await maintenanceService.complete(req.params.id, req.body, req.user!.organizationId);
    return sendSuccess(res, record);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await maintenanceService.getStats(req.user!.organizationId);
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

export const getUpcoming = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const records = await maintenanceService.getUpcoming(req.user!.organizationId, days);
    return sendSuccess(res, records);
  } catch (error) {
    next(error);
  }
};

export const getOverdue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await maintenanceService.getOverdue(req.user!.organizationId);
    return sendSuccess(res, records);
  } catch (error) {
    next(error);
  }
};
