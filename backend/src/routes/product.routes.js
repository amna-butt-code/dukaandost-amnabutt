import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { role } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', auth, role('seller'), createProduct);
router.put('/:id', auth, role('seller'), updateProduct);
router.delete('/:id', auth, role('seller'), deleteProduct);

export default router;
