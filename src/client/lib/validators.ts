import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  organizationName: z.string().min(1, 'Organization name is required').max(100),
});

export const equipmentSchema = z.object({
  assetNumber: z.string().min(1, 'Asset number is required'),
  name: z.string().min(1, 'Name is required').max(100),
  equipmentType: z.enum(['HAUL_TRUCK', 'EXCAVATOR', 'LOADER', 'DOZER', 'GRADER', 'DRILL', 'CRUSHER', 'CONVEYOR', 'GENERATOR', 'PUMP', 'OTHER']),
  siteId: z.string().uuid('Select a valid site'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  yearManufactured: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchaseCost: z.number().min(0, 'Purchase cost must be positive'),
  fuelType: z.enum(['DIESEL', 'GASOLINE', 'ELECTRIC', 'HYBRID', 'NATURAL_GAS']).optional(),
  status: z.enum(['OPERATIONAL', 'IN_USE', 'MAINTENANCE', 'REPAIR', 'IDLE', 'DECOMMISSIONED']).optional(),
});

export const maintenanceSchema = z.object({
  equipmentId: z.string().uuid('Select equipment'),
  maintenanceType: z.enum(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'BREAKDOWN', 'INSPECTION']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  description: z.string().min(1, 'Description is required').max(500),
  notes: z.string().max(1000).optional(),
  performedById: z.string().uuid().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EquipmentFormData = z.infer<typeof equipmentSchema>;
export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
