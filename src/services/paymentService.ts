import { AppError } from '../middleware/errorHandler';

export enum PaymentStatus {
  PENDING = 'pending',
  ESCROWED = 'escrowed',
  RELEASED = 'released',
  REFUNDED = 'refunded'
}

export class PaymentService {
  // In a real app, this would connect to a payment processor
  private static payments = new Map<string, {
    bookingId: string;
    amount: number;
    status: PaymentStatus;
    providerId: string;
  }>();

  static async holdPayment(bookingId: string, amount: number, providerId: string): Promise<string> {
    // In real implementation, this would create an escrow with a payment processor
    const paymentId = Math.random().toString(36).substring(7);
    
    this.payments.set(paymentId, {
      bookingId,
      amount,
      status: PaymentStatus.ESCROWED,
      providerId
    });

    return paymentId;
  }

  static async releasePayment(paymentId: string, bookingId: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    
    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    if (payment.bookingId !== bookingId) {
      throw new AppError(400, 'Payment does not match booking');
    }

    if (payment.status !== PaymentStatus.ESCROWED) {
      throw new AppError(400, 'Payment is not in escrow');
    }

    // In real implementation, this would release the escrow to the provider
    payment.status = PaymentStatus.RELEASED;
    this.payments.set(paymentId, payment);
  }

  static async refundPayment(paymentId: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    
    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    if (payment.status !== PaymentStatus.ESCROWED) {
      throw new AppError(400, 'Payment is not in escrow');
    }

    // In real implementation, this would refund the escrow to the customer
    payment.status = PaymentStatus.REFUNDED;
    this.payments.set(paymentId, payment);
  }
} 