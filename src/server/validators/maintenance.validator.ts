import { body } from 'express-validator';

export const createMaintenanceValidator = [
  body('equipmentId').isUUID().withMessage('equipmentId must be a valid UUID'),
  body('maintenanceType').isIn(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'BREAKDOWN', 'INSPECTION'])
    .withMessage('Invalid maintenance type'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority'),
  body('scheduledDate').isISO8601().withMessage('scheduledDate must be a valid date'),
  body('description').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Description is required'),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
  body('performedById').optional().isUUID().withMessage('performedById must be a valid UUID'),
];

export const updateMaintenanceValidator = [
  body('maintenanceType').optional().isIn(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'BREAKDOWN', 'INSPECTION']),
  body('status').optional().isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  body('scheduledDate').optional().isISO8601(),
  body('laborHours').optional().isFloat({ min: 0 }),
  body('laborCost').optional().isFloat({ min: 0 }),
  body('partsCost').optional().isFloat({ min: 0 }),
  body('totalCost').optional().isFloat({ min: 0 }),
];
