import { Router } from 'express';

const router = Router();

// Get all pets
router.get('/', async (req, res, next) => {
  try {
    res.status(200).json({ pets: [] });
  } catch (error) {
    next(error);
  }
});

// Add a pet
router.post('/', async (req, res, next) => {
  try {
    const { name, type, age } = req.body;
    res.status(201).json({ message: 'Pet added successfully' });
  } catch (error) {
    next(error);
  }
});

export const petRouter = router; 