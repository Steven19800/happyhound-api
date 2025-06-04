import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { userRouter } from './routes/userRoutes';
import { petRouter } from './routes/petRoutes';
import { serviceRouter } from './routes/serviceRoutes';
import { bookingRouter } from './routes/bookingRoutes';

const app = express();

// Security and basic settings
app.use(express.json({ limit: '10kb' }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Routes
app.use('/api/users', userRouter);
app.use('/api/pets', petRouter);
app.use('/api/services', serviceRouter);
app.use('/api/bookings', bookingRouter);

// Error handling
app.use(errorHandler);

export default app; 