import { Request, Response, NextFunction } from 'express';
import inspectionsService from '../services/inspections.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.util';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const filters = {
      equipmentId: req.query.equipmentId as string,
      inspectorId: req.query.inspectorId as string,
      inspectionType: req.query.inspectionType as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const { data, total } = await inspectionsService.getAll(req.user!.organizationId, page, limit, filters);
    return sendSuccess(res, data, 200, { pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inspection = await inspectionsService.getById(req.params.id, req.user!.organizationId);
    return sendSuccess(res, inspection);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inspection = await inspectionsService.create(req.body, req.user!.organizationId);
    return sendCreated(res, inspection);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inspection = await inspectionsService.update(req.params.id, req.body, req.user!.organizationId);
    return sendSuccess(res, inspection);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await inspectionsService.delete(req.params.id, req.user!.organizationId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await inspectionsService.getStats(req.user!.organizationId);
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};
