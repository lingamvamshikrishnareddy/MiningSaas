import { body } from 'express-validator';

export const createEquipmentValidator = [
  body('assetNumber').isString().trim().notEmpty().withMessage('Asset number is required'),
  body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('equipmentType').isIn([
    'HAUL_TRUCK', 'EXCAVATOR', 'LOADER', 'DOZER', 'GRADER',
    'DRILL', 'CRUSHER', 'CONVEYOR', 'GENERATOR', 'PUMP', 'OTHER',
  ]).withMessage('Invalid equipment type'),
  body('siteId').isUUID().withMessage('siteId must be a valid UUID'),
  body('manufacturer').isString().trim().notEmpty().withMessage('Manufacturer is required'),
  body('model').isString().trim().notEmpty().withMessage('Model is required'),
  body('serialNumber').isString().trim().notEmpty().withMessage('Serial number is required'),
  body('yearManufactured').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
  body('purchaseDate').isISO8601().withMessage('Purchase date must be a valid date'),
  body('purchaseCost').isFloat({ min: 0 }).withMessage('Purchase cost must be a positive number'),
  body('fuelType').optional().isIn(['DIESEL', 'GASOLINE', 'ELECTRIC', 'HYBRID', 'NATURAL_GAS']),
  body('status').optional().isIn(['OPERATIONAL', 'IN_USE', 'MAINTENANCE', 'REPAIR', 'IDLE', 'DECOMMISSIONED']),
];

export const updateEquipmentValidator = [
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('equipmentType').optional().isIn([
    'HAUL_TRUCK', 'EXCAVATOR', 'LOADER', 'DOZER', 'GRADER',
    'DRILL', 'CRUSHER', 'CONVEYOR', 'GENERATOR', 'PUMP', 'OTHER',
  ]),
  body('status').optional().isIn(['OPERATIONAL', 'IN_USE', 'MAINTENANCE', 'REPAIR', 'IDLE', 'DECOMMISSIONED']),
  body('fuelType').optional().isIn(['DIESEL', 'GASOLINE', 'ELECTRIC', 'HYBRID', 'NATURAL_GAS']),
];

export const updateStatusValidator = [
  body('status').isIn(['OPERATIONAL', 'IN_USE', 'MAINTENANCE', 'REPAIR', 'IDLE', 'DECOMMISSIONED'])
    .withMessage('Invalid status value'),
];
