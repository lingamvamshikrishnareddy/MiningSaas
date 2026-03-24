import { Request, Response, NextFunction } from 'express';
import incidentsService from '../services/incidents.service';
import { sendSuccess, sendCreated } from '../utils/response.util';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.util';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const filters = {
      siteId: req.query.siteId as string,
      incidentType: req.query.incidentType as string,
      severity: req.query.severity as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const { data, total } = await incidentsService.getAll(req.user!.organizationId, page, limit, filters);
    return sendSuccess(res, data, 200, { pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await incidentsService.getById(req.params.id, req.user!.organizationId);
    return sendSuccess(res, incident);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await incidentsService.create(req.body, req.user!.id, req.user!.organizationId);
    return sendCreated(res, incident);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await incidentsService.update(req.params.id, req.body, req.user!.organizationId);
    return sendSuccess(res, incident);
  } catch (error) {
    next(error);
  }
};

export const close = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await incidentsService.close(req.params.id, req.body, req.user!.organizationId);
    return sendSuccess(res, incident);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await incidentsService.getStats(req.user!.organizationId);
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};
