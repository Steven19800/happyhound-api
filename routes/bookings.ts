import express from 'express';
import { AppDataSource } from '../database';
import { Booking } from '../models/Booking';
import { Service } from '../models/Service';
import { Pet } from '../models/Pet';
import { auth } from '../middleware/auth';

const router = express.Router();
const bookingRepository = AppDataSource.getRepository(Booking);
const serviceRepository = AppDataSource.getRepository(Service);
const petRepository = AppDataSource.getRepository(Pet);

interface AuthRequest extends express.Request {
  user?: {
    userId: number;
    role: string;
  };
}

// Get all bookings for authenticated user
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const bookings = await bookingRepository.find({
      where: userRole === 'provider' 
        ? { service: { provider: { id: userId } } }
        : { pet: { owner: { id: userId } } },
      relations: ['pet', 'service', 'pet.owner', 'service.provider']
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const booking = await bookingRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['pet', 'service', 'pet.owner', 'service.provider']
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user has access to this booking
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const hasAccess = userRole === 'provider'
      ? booking.service.provider.id === userId
      : booking.pet.owner.id === userId;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching booking' });
  }
});

// Create new booking
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const { serviceId, petId, date, notes } = req.body;
    const userId = req.user?.userId;

    // Verify pet ownership
    const pet = await petRepository.findOne({
      where: { id: petId },
      relations: ['owner']
    });

    if (!pet || pet.owner.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to book for this pet' });
    }

    // Get service details
    const service = await serviceRepository.findOne({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const booking = bookingRepository.create({
      date: new Date(date),
      status: 'pending',
      notes,
      pet,
      service,
      totalPrice: service.price
    });

    await bookingRepository.save(booking);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Error creating booking' });
  }
});

// Update booking status
router.put('/:id/status', auth, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const booking = await bookingRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['pet', 'service', 'pet.owner', 'service.provider']
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization
    const hasAccess = userRole === 'provider'
      ? booking.service.provider.id === userId
      : booking.pet.owner.id === userId;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    booking.status = status;
    await bookingRepository.save(booking);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Error updating booking status' });
  }
});

// Add review to booking
router.post('/:id/review', auth, async (req: AuthRequest, res) => {
  try {
    const { rating, reviewText } = req.body;
    const userId = req.user?.userId;

    const booking = await bookingRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['pet', 'pet.owner']
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.pet.owner.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to review this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed bookings' });
    }

    booking.rating = rating;
    booking.reviewText = reviewText;
    await bookingRepository.save(booking);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Error adding review' });
  }
});

export default router; 