import { Request, Response, NextFunction } from 'express';
import usersService from '../services/users.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.util';
import { UserRole, UserFilterOptions } from '../types/user.types';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const organizationId = req.user!.organizationId;
    const filters: UserFilterOptions = {
      role: req.query.role as UserRole | undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      search: req.query.search as string | undefined,
    };

    const { data, total } = await usersService.getAll(filters, organizationId, page, limit);
    return sendSuccess(res, data, 200, { pagination: getPaginationMeta(page, limit, total) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getById(req.params.id, req.user!.organizationId);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.create({
      ...req.body,
      organizationId: req.user!.organizationId,
    });
    return sendCreated(res, user);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.update(req.params.id, req.user!.organizationId, req.body);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersService.delete(req.params.id, req.user!.organizationId, req.user!.id);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const user = await usersService.updateRole(req.params.id, req.user!.organizationId, role as UserRole);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const setStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body;
    const user = await usersService.setActiveStatus(req.params.id, req.user!.organizationId, isActive);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await usersService.getStats(req.user!.organizationId);
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newPassword } = req.body;
    await usersService.resetPassword(req.params.id, req.user!.organizationId, newPassword);
    return sendSuccess(res, { message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
