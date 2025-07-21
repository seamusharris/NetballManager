/**
 * Validation Middleware
 * 
 * Provides validation middleware that runs after case conversion
 * This ensures validation happens on properly converted data
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Create validation middleware for a specific schema
 */
export function validateSchema(schema: ZodSchema, options: {
  skipFields?: string[];
  errorMessage?: string;
} = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Remove context fields that shouldn't be validated
      const { clubId, teamId, ...dataToValidate } = req.body;
      
      // Skip specified fields if provided
      if (options.skipFields) {
        for (const field of options.skipFields) {
          delete dataToValidate[field];
        }
      }

      const parsedData = schema.safeParse(dataToValidate);

      if (!parsedData.success) {
        return res.status(400).json({
          message: options.errorMessage || "Validation failed",
          errors: parsedData.error.errors
        });
      }

      // Store validated data for use in route handler
      req.validatedData = parsedData.data;
      
      // Preserve context fields
      if (req.body.clubId !== undefined) req.validatedData.clubId = req.body.clubId;
      if (req.body.teamId !== undefined) req.validatedData.teamId = req.body.teamId;

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({ 
        message: "Internal validation error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

/**
 * Extend Express Request type to include validated data
 */
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
    }
  }
}