// routes/index.js

import { Router } from 'express';
import AppController from '../controllers/AppController.js';

const router = Router();

// Define the /status endpoint
router.get('/status', AppController.getStatus);

// Define the /stats endpoint
router.get('/stats', AppController.getStats);

export default router;
