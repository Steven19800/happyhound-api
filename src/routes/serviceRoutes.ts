import { Router } from 'express';

const router = Router();

// Get all services
router.get('/', async (req, res, next) => {
  try {
    // Add your service listing logic here
    res.status(200).json({ services: [] });
  } catch (error) {
    next(error);
  }
});

// Create a service
router.post('/', async (req, res, next) => {
  try {
    // Add your service creation logic here
    res.status(201).json({ message: 'Service created successfully' });
  } catch (error) {
    next(error);
  }
});

export const serviceRouter = router; 