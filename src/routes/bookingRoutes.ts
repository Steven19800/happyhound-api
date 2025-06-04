import { Router } from 'express';
import { messageFilter } from '../middleware/messageFilter';
import { PaymentService } from '../services/paymentService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all bookings
router.get('/', async (req, res, next) => {
  try {
    // Add your booking listing logic here
    res.status(200).json({ bookings: [] });
  } catch (error) {
    next(error);
  }
});

// Create a booking with payment escrow
router.post('/', messageFilter, async (req, res, next) => {
  try {
    const { serviceId, providerId, notes, amount } = req.body;
    
    // Hold payment in escrow
    const paymentId = await PaymentService.holdPayment(
      'booking-' + Math.random().toString(36).substring(7),
      amount,
      providerId
    );

    // Store booking with payment info
    const booking = {
      id: 'booking-' + Math.random().toString(36).substring(7),
      serviceId,
      providerId,
      notes,
      paymentId,
      status: 'pending'
    };

    res.status(201).json({ 
      message: 'Booking created successfully',
      booking 
    });
  } catch (error) {
    next(error);
  }
});

// Complete booking and release payment
router.post('/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentId } = req.body;

    // In real app, verify booking belongs to user
    await PaymentService.releasePayment(paymentId, id);

    res.status(200).json({ 
      message: 'Booking completed and payment released' 
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking and refund payment
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    // In real app, verify cancellation is allowed
    await PaymentService.refundPayment(paymentId);

    res.status(200).json({ 
      message: 'Booking cancelled and payment refunded' 
    });
  } catch (error) {
    next(error);
  }
});

export const bookingRouter = router; 