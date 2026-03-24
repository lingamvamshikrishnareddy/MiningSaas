import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

type UserRole = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'OPERATOR' | 'MAINTENANCE_TECH' | 'VIEWER';

/**
 * Role hierarchy (higher roles have all permissions of lower roles)
 */
const roleHierarchy: Record<UserRole, number> = {
  ADMIN: 6,
  MANAGER: 5,
  SUPERVISOR: 4,
  MAINTENANCE_TECH: 3,
  OPERATOR: 2,
  VIEWER: 1,
};

/**
 * Require specific roles to access a route
 */
export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const userRole = req.user.role as UserRole;

    if (!roles.includes(userRole)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

/**
 * Require minimum role level (includes all higher roles)
 */
export const requireMinRole = (minRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const userRole = req.user.role as UserRole;
    const userRoleLevel = roleHierarchy[userRole] || 0;
    const minRoleLevel = roleHierarchy[minRole] || 0;

    if (userRoleLevel < minRoleLevel) {
      return next(
        new AppError(
          `This action requires ${minRole} role or higher`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = requireRoles('ADMIN');

/**
 * Require manager or higher
 */
export const requireManager = requireMinRole('MANAGER');

/**
 * Require supervisor or higher
 */
export const requireSupervisor = requireMinRole('SUPERVISOR');

/**
 * Check if user has permission for specific resource
 */
export const checkResourcePermission = (
  resourceType: 'equipment' | 'maintenance' | 'site' | 'organization'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Admins have access to everything
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // For other users, check if resource belongs to their organization
    // This would be implemented based on specific resource type
    // For now, we'll allow same-organization access

    next();
  };
};

/**
 * Allow user to access only their own resources or if they're admin/manager
 */
export const requireOwnershipOrManager = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const targetUserId = req.params[userIdParam] || req.body[userIdParam];
    const userRole = req.user.role as UserRole;

    // Admins and managers can access any user's resources
    if (userRole === 'ADMIN' || userRole === 'MANAGER') {
      return next();
    }

    // Users can only access their own resources
    if (req.user.id !== targetUserId) {
      return next(
        new AppError('You can only access your own resources', 403)
      );
    }

    next();
  };
};

/**
 * Check if user belongs to the same organization as the resource
 */
export const requireSameOrganization = (
  organizationIdParam: string = 'organizationId'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const targetOrgId = req.params[organizationIdParam] || req.body[organizationIdParam];

    // If no org ID in request, allow (will be set to user's org)
    if (!targetOrgId) {
      return next();
    }

    // Check if user's org matches target org
    if (req.user.organizationId !== targetOrgId) {
      return next(
        new AppError('You can only access resources in your organization', 403)
      );
    }

    next();
  };
};

/**
 * Permission matrix for different operations
 */
export const permissions = {
  equipment: {
    view: requireMinRole('VIEWER'),
    create: requireMinRole('SUPERVISOR'),
    update: requireMinRole('SUPERVISOR'),
    delete: requireMinRole('MANAGER'),
  },
  maintenance: {
    view: requireMinRole('VIEWER'),
    create: requireMinRole('MAINTENANCE_TECH'),
    update: requireMinRole('MAINTENANCE_TECH'),
    delete: requireMinRole('SUPERVISOR'),
    schedule: requireMinRole('SUPERVISOR'),
  },
  users: {
    view: requireMinRole('MANAGER'),
    create: requireMinRole('ADMIN'),
    update: requireMinRole('MANAGER'),
    delete: requireMinRole('ADMIN'),
  },
  reports: {
    view: requireMinRole('VIEWER'),
    create: requireMinRole('SUPERVISOR'),
    export: requireMinRole('MANAGER'),
  },
  settings: {
    view: requireMinRole('MANAGER'),
    update: requireMinRole('ADMIN'),
  },
};