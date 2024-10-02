// routes/index.js

import { Router } from 'express';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';

const router = Router();

// Define the /status endpoint
router.get('/status', AppController.getStatus);

// Define the /stats endpoint
router.get('/stats', AppController.getStats);

// Define the /users endpoint for creating new users
router.post('/users', UsersController.postNew);

export default router;
