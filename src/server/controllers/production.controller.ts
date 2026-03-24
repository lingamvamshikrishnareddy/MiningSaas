import { Request, Response, NextFunction } from 'express';
import productionService from '../services/production.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.util';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const filters = {
      siteId: req.query.siteId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      oreType: req.query.oreType as string,
    };
    const { data, total } = await productionService.getAll(req.user!.organizationId, page, limit, filters);
    return sendSuccess(res, data, 200, { pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await productionService.getById(req.params.id, req.user!.organizationId);
    return sendSuccess(res, record);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await productionService.create(req.body, req.user!.organizationId);
    return sendCreated(res, record);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await productionService.update(req.params.id, req.body, req.user!.organizationId);
    return sendSuccess(res, record);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productionService.delete(req.params.id, req.user!.organizationId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await productionService.getSummary(
      req.user!.organizationId,
      req.query.startDate as string,
      req.query.endDate as string,
      req.query.siteId as string
    );
    return sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};
