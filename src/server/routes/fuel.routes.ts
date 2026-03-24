import { Router } from 'express';
import * as controller from '../controllers/fuel.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/roles.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.getAll));
router.get('/summary', asyncHandler(controller.getSummary));
router.post('/', requireMinRole('OPERATOR'), asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.getById));
router.put('/:id', requireMinRole('SUPERVISOR'), asyncHandler(controller.update));
router.delete('/:id', requireMinRole('SUPERVISOR'), asyncHandler(controller.remove));

export default router;
