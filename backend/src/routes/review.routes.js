import { Router } from 'express';
import {
  createReview,
  getEligibility,
  getAllReviews,
} from '../controllers/review.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { role } from '../middleware/role.middleware.js';

const router = Router();

router.post('/', auth, role('customer'), createReview);
router.get('/eligibility/:productId', auth, role('customer'), getEligibility);
router.get('/', auth, role('seller'), getAllReviews);

export default router;
