import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const messageFilter = (req: Request, res: Response, next: NextFunction): void => {
  const body = req.body;
  
  // Check message content if it exists
  if (body.message || body.description || body.notes) {
    const content = [body.message, body.description, body.notes].join(' ').toLowerCase();
    
    // Patterns to detect
    const patterns = [
      /(?:\+\d{1,3}[-.\s]?)?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,  // Phone numbers
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,      // Email addresses
      /(?:whatsapp|telegram|signal|facebook|fb|insta|instagram)/i,  // Social media references
      /(?:meet|contact|call|text|dm|pm|message me at)/i,       // Contact attempts
      /(?:http|https|www\.)/i                                  // Website links
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        throw new AppError(400, 'Messages cannot contain contact information or external links');
      }
    }
  }
  
  next();
}; 