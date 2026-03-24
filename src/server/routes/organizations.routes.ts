import { Router } from 'express';
import * as controller from '../controllers/organizations.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/roles.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(controller.getMyOrganization));
router.put('/me', requireMinRole('ADMIN'), asyncHandler(controller.updateOrganization));
router.get('/me/stats', asyncHandler(controller.getOrganizationStats));
router.get('/', requireMinRole('ADMIN'), asyncHandler(controller.getAll));

export default router;
