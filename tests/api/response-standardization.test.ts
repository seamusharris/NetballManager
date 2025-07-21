import { describe, it, expect } from 'vitest';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createArrayResponse,
  createPaginatedResponse 
} from '../../server/api-utils';

describe('API Response Standardization', () => {
  describe('createSuccessResponse', () => {
    it('should create a standard success response for objects', () => {
      const data = { id: 1, name: 'Test Club' };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.meta.timestamp).toBeDefined();
      expect(typeof response.meta.timestamp).toBe('string');
    });

    it('should create a standard success response for arrays with count', () => {
      const data = [{ id: 1, name: 'Club 1' }, { id: 2, name: 'Club 2' }];
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.meta.count).toBe(2);
      expect(response.meta.timestamp).toBeDefined();
    });

    it('should include custom meta data', () => {
      const data = { id: 1, name: 'Test Club' };
      const customMeta = { customField: 'customValue' };
      const response = createSuccessResponse(data, customMeta);

      expect(response.meta.customField).toBe('customValue');
      expect(response.meta.timestamp).toBeDefined();
    });
  });

  describe('createErrorResponse', () => {
    it('should create a standard error response', () => {
      const response = createErrorResponse('VALIDATION_ERROR', 'Invalid input');

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('VALIDATION_ERROR');
      expect(response.error.message).toBe('Invalid input');
      expect(response.meta.timestamp).toBeDefined();
    });

    it('should include error details when provided', () => {
      const details = { field: 'email', reason: 'Invalid format' };
      const response = createErrorResponse('VALIDATION_ERROR', 'Invalid input', details);

      expect(response.error.details).toEqual(details);
    });
  });

  describe('createArrayResponse', () => {
    it('should create a standard array response with count', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const response = createArrayResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.meta.count).toBe(3);
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create a paginated response with pagination meta', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createPaginatedResponse(data, 1, 10);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.meta.count).toBe(2);
      expect(response.meta.page).toBe(1);
      expect(response.meta.total).toBe(10);
    });
  });
});