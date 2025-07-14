import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from './apiClient';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

// Helper to mock fetch
function mockFetch(response: any, options: { status?: number, headers?: Record<string, string> } = {}) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: options.status || 200,
    statusText: 'OK',
    headers: {
      get: (key: string) => {
        if (options.headers && options.headers[key]) return options.headers[key];
        // If response is null, always return a string
        return 'application/json';
      },
      forEach: () => {},
    },
    json: async () => response,
    text: async () => JSON.stringify(response),
  }) as any;
}

describe('apiClient case conversion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('converts outgoing payloads to snake_case', async () => {
    const payload = { displayName: 'Test Name', isActive: true, nestedObject: { someValue: 1 } };
    let sentBody = null;
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      sentBody = opts.body;
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: () => 'application/json', forEach: () => {} },
        json: async () => ({}),
        text: async () => '{}',
      });
    }) as any;
    await apiClient.post('/api/test', payload);
    expect(sentBody).toBeDefined();
    const parsed = JSON.parse(sentBody);
    expect(parsed.display_name).toBe('Test Name');
    expect(parsed.is_active).toBe(true);
    expect(parsed.nested_object.some_value).toBe(1);
  });

  it('converts incoming responses to camelCase', async () => {
    const response = { display_name: 'Test Name', is_active: true, nested_object: { some_value: 1 } };
    mockFetch(response);
    const result = await apiClient.get('/api/test') as any;
    expect(result.displayName).toBe('Test Name');
    expect(result.isActive).toBe(true);
    expect(result.nestedObject.someValue).toBe(1);
  });

  it('handles arrays and nested objects', async () => {
    const response = [
      { display_name: 'A', nested: { some_value: 1 } },
      { display_name: 'B', nested: { some_value: 2 } },
    ];
    mockFetch(response);
    const result = await apiClient.get('/api/test') as any[];
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].displayName).toBe('A');
    expect(result[0].nested.someValue).toBe(1);
    expect(result[1].displayName).toBe('B');
    expect(result[1].nested.someValue).toBe(2);
  });

  it('handles null and empty responses', async () => {
    mockFetch(null);
    const result = await apiClient.get('/api/test') as any;
    expect(result).toBeNull();
    mockFetch({});
    const result2 = await apiClient.get('/api/test') as any;
    expect(result2).toEqual({});
  });
}); 