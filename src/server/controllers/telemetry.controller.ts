import { Request, Response, NextFunction } from 'express';
import telemetryService from '../services/telemetry.service';
import { sendSuccess, sendCreated } from '../utils/response.util';

export const getByEquipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const limit = parseInt(req.query.limit as string) || 200;
    const data = await telemetryService.getByEquipment(req.params.equipmentId, req.user!.organizationId, { hours, limit });
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getLatest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await telemetryService.getLatest(req.params.equipmentId, req.user!.organizationId);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getFleetLatest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const siteId = req.query.siteId as string;
    const data = await telemetryService.getFleetLatest(req.user!.organizationId, siteId);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const ingest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await telemetryService.ingest(req.body);
    return sendCreated(res, data);
  } catch (error) {
    next(error);
  }
};

export const bulkIngest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await telemetryService.bulkIngest(req.body);
    return sendCreated(res, { count });
  } catch (error) {
    next(error);
  }
};

export const getAverages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const data = await telemetryService.getAverages(req.params.equipmentId, req.user!.organizationId, hours);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await telemetryService.getAlerts(req.user!.organizationId);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
