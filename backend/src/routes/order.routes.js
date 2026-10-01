import { Router } from 'express';
import { createOrder } from '../controllers/order.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { role } from '../middleware/role.middleware.js';

const router = Router();

router.post('/', auth, role('customer'), createOrder);

export default router;
