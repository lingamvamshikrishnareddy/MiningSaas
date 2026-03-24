import { Request, Response, NextFunction } from 'express';
import fuelService from '../services/fuel.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.util';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const filters = {
      equipmentId: req.query.equipmentId as string,
      siteId: req.query.siteId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const { data, total } = await fuelService.getAll(req.user!.organizationId, page, limit, filters);
    return sendSuccess(res, data, 200, { pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await fuelService.getById(req.params.id, req.user!.organizationId);
    return sendSuccess(res, log);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await fuelService.create(req.body, req.user!.organizationId);
    return sendCreated(res, log);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await fuelService.update(req.params.id, req.body, req.user!.organizationId);
    return sendSuccess(res, log);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await fuelService.delete(req.params.id, req.user!.organizationId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await fuelService.getSummary(
      req.user!.organizationId,
      req.query.startDate as string,
      req.query.endDate as string
    );
    return sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};
