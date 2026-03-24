import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('firstName').isString().trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
  body('lastName').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
  body('organizationName').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('organizationId').optional().isUUID().withMessage('organizationId must be a valid UUID'),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[a-z]/).withMessage('Must contain lowercase')
    .matches(/[0-9]/).withMessage('Must contain a number'),
];

export const forgotPasswordValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
];
