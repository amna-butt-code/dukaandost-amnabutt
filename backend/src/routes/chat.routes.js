import { Router } from 'express';
import { chat } from '../controllers/chat.controller.js';

const router = Router();

router.post('/', chat); // public: visitors and customers can both ask questions

export default router;
