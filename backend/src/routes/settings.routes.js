import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { role } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', getSettings);
router.put('/', auth, role('seller'), updateSettings);

export default router;
