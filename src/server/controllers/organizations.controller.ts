import { Request, Response, NextFunction } from 'express';
import organizationsService from '../services/organizations.service';
import { sendSuccess } from '../utils/response.util';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.util';

export const getMyOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await organizationsService.getById(req.user!.organizationId);
    return sendSuccess(res, org);
  } catch (error) {
    next(error);
  }
};

export const updateOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await organizationsService.update(req.user!.organizationId, req.body);
    return sendSuccess(res, org);
  } catch (error) {
    next(error);
  }
};

export const getOrganizationStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await organizationsService.getStats(req.user!.organizationId);
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const { data, total } = await organizationsService.getAll(page, limit);
    return sendSuccess(res, data, 200, { pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};
