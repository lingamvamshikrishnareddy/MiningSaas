import { Request, Response, NextFunction } from 'express';
import shiftsService from '../services/shifts.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.util';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const filters = {
      siteId: req.query.siteId as string,
      shiftType: req.query.shiftType as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      supervisorId: req.query.supervisorId as string,
    };
    const { data, total } = await shiftsService.getAll(req.user!.organizationId, page, limit, filters);
    return sendSuccess(res, data, 200, { pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shift = await shiftsService.getById(req.params.id, req.user!.organizationId);
    return sendSuccess(res, shift);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shift = await shiftsService.create(req.body, req.user!.organizationId);
    return sendCreated(res, shift);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shift = await shiftsService.update(req.params.id, req.body, req.user!.organizationId);
    return sendSuccess(res, shift);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await shiftsService.delete(req.params.id, req.user!.organizationId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const getCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shifts = await shiftsService.getCurrent(req.user!.organizationId, req.query.siteId as string);
    return sendSuccess(res, shifts);
  } catch (error) {
    next(error);
  }
};
