import express from 'express';
import { AppDataSource } from '../database';
import { Pet } from '../models/Pet';
import { auth } from '../middleware/auth';

const router = express.Router();
const petRepository = AppDataSource.getRepository(Pet);

interface AuthRequest extends express.Request {
  user?: {
    userId: number;
    role: string;
  };
}

// Get all pets (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, breed } = req.query;
    const where: any = {};
    
    if (type) where.type = type;
    if (breed) where.breed = breed;

    const pets = await petRepository.find({
      where,
      relations: ['owner']
    });
    
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pets' });
  }
});

// Get pet by ID
router.get('/:id', async (req, res) => {
  try {
    const pet = await petRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['owner', 'bookings']
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pet' });
  }
});

// Create new pet (requires authentication)
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const { name, type, breed, age, description, imageUrl } = req.body;
    const userId = req.user?.userId;

    const pet = petRepository.create({
      name,
      type,
      breed,
      age,
      description,
      imageUrl,
      owner: { id: userId }
    });

    await petRepository.save(pet);
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error creating pet' });
  }
});

// Update pet (requires authentication and ownership)
router.put('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const pet = await petRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['owner']
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (pet.owner.id !== req.user?.userId) {
      return res.status(403).json({ error: 'Not authorized to update this pet' });
    }

    const { name, type, breed, age, description, imageUrl } = req.body;
    
    Object.assign(pet, {
      name: name || pet.name,
      type: type || pet.type,
      breed: breed || pet.breed,
      age: age || pet.age,
      description: description || pet.description,
      imageUrl: imageUrl || pet.imageUrl
    });

    await petRepository.save(pet);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error updating pet' });
  }
});

// Delete pet (requires authentication and ownership)
router.delete('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const pet = await petRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['owner']
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (pet.owner.id !== req.user?.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this pet' });
    }

    await petRepository.remove(pet);
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting pet' });
  }
});

export default router; 