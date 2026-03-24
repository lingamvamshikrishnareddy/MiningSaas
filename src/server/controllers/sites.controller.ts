import { Request, Response, NextFunction } from 'express';
import sitesService from '../services/sites.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.util';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const { data, total } = await sitesService.getAll(
      req.user!.organizationId,
      page,
      limit,
      req.query.search as string
    );
    return sendSuccess(res, data, 200, { pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const site = await sitesService.getById(req.params.id, req.user!.organizationId);
    return sendSuccess(res, site);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const site = await sitesService.create({
      ...req.body,
      organizationId: req.user!.organizationId,
    });
    return sendCreated(res, site);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const site = await sitesService.update(req.params.id, req.user!.organizationId, req.body);
    return sendSuccess(res, site);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sitesService.delete(req.params.id, req.user!.organizationId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const getZones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const zones = await sitesService.getZones(req.params.id, req.user!.organizationId);
    return sendSuccess(res, zones);
  } catch (error) {
    next(error);
  }
};

export const createZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const zone = await sitesService.createZone(req.params.id, req.user!.organizationId, req.body);
    return sendCreated(res, zone);
  } catch (error) {
    next(error);
  }
};
