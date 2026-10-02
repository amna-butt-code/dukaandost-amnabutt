import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { role } from '../middleware/role.middleware.js';

const router = Router();

router.post('/', auth, role('customer'), createOrder);
router.get('/my', auth, role('customer'), getMyOrders); // must stay above any "/:id" route
router.get('/', auth, role('seller'), getAllOrders);
router.patch('/:id/status', auth, role('seller'), updateOrderStatus);
router.patch('/:id/cancel', auth, role('customer'), cancelOrder);

export default router;
