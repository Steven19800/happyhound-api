import express from 'express';
import { AppDataSource } from '../database';
import { Service } from '../models/Service';
import { auth, requireRole } from '../middleware/auth';

const router = express.Router();
const serviceRepository = AppDataSource.getRepository(Service);

interface AuthRequest extends express.Request {
  user?: {
    userId: number;
    role: string;
  };
}

// Get all services (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, minPrice, maxPrice } = req.query;
    const where: any = {};
    
    if (type) where.type = type;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const services = await serviceRepository.find({
      where,
      relations: ['provider']
    });
    
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching services' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await serviceRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['provider', 'bookings']
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching service' });
  }
});

// Create new service (requires provider role)
router.post('/', [auth, requireRole(['provider'])], async (req: AuthRequest, res) => {
  try {
    const { title, description, price, duration, type, imageUrl } = req.body;
    const userId = req.user?.userId;

    const service = serviceRepository.create({
      title,
      description,
      price,
      duration,
      type,
      imageUrl,
      provider: { id: userId }
    });

    await serviceRepository.save(service);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Error creating service' });
  }
});

// Update service (requires provider role and ownership)
router.put('/:id', [auth, requireRole(['provider'])], async (req: AuthRequest, res) => {
  try {
    const service = await serviceRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['provider']
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (service.provider.id !== req.user?.userId) {
      return res.status(403).json({ error: 'Not authorized to update this service' });
    }

    const { title, description, price, duration, type, imageUrl } = req.body;
    
    Object.assign(service, {
      title: title || service.title,
      description: description || service.description,
      price: price || service.price,
      duration: duration || service.duration,
      type: type || service.type,
      imageUrl: imageUrl || service.imageUrl
    });

    await serviceRepository.save(service);
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Error updating service' });
  }
});

// Delete service (requires provider role and ownership)
router.delete('/:id', [auth, requireRole(['provider'])], async (req: AuthRequest, res) => {
  try {
    const service = await serviceRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['provider']
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (service.provider.id !== req.user?.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this service' });
    }

    await serviceRepository.remove(service);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting service' });
  }
});

export default router; 