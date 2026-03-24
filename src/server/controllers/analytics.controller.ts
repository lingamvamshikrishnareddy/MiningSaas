import { Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analytics.service';
import { sendSuccess } from '../utils/response.util';

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getDashboardStats(req.user!.organizationId);
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

export const getProductionTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const siteId = req.query.siteId as string;
    const data = await analyticsService.getProductionTrend(req.user!.organizationId, days, siteId);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceCostTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const data = await analyticsService.getMaintenanceCostTrend(req.user!.organizationId, months);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getFuelConsumptionTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const siteId = req.query.siteId as string;
    const data = await analyticsService.getFuelConsumptionTrend(req.user!.organizationId, days, siteId);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getEquipmentUtilization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const siteId = req.query.siteId as string;
    const data = await analyticsService.getEquipmentUtilization(req.user!.organizationId, siteId);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getSafetyMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = await analyticsService.getSafetyMetrics(req.user!.organizationId, days);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getKPISnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getKPISnapshot(req.user!.organizationId);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
