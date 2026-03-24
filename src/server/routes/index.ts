import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import organizationsRoutes from './organizations.routes';
import sitesRoutes from './sites.routes';
import equipmentRoutes from './equipment.routes';
import maintenanceRoutes from './maintenance.routes';
import telemetryRoutes from './telemetry.routes';
import fuelRoutes from './fuel.routes';
import productionRoutes from './production.routes';
import inspectionsRoutes from './inspections.routes';
import incidentsRoutes from './incidents.routes';
import shiftsRoutes from './shifts.routes';
import analyticsRoutes from './analytics.routes';
import subscriptionRoutes from './subscription.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/organizations', organizationsRoutes);
router.use('/sites', sitesRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/fuel', fuelRoutes);
router.use('/production', productionRoutes);
router.use('/inspections', inspectionsRoutes);
router.use('/incidents', incidentsRoutes);
router.use('/shifts', shiftsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;
