import { Express, Request, Response } from 'express';

export function registerDebugRoutes(app: Express) {
  // Debug endpoint to check case conversion
  app.get('/api/debug/case-conversion', (req: Request, res: Response) => {
    res.json({
      message: 'This is a debug endpoint to check case conversion',
      snake_case_field: 'This is a snake_case field',
      camelCaseField: 'This is a camelCase field',
      nested: {
        snake_case_nested: 'This is a nested snake_case field',
        camelCaseNested: 'This is a nested camelCase field'
      },
      array_with_objects: [
        { snake_case_item: 'item1', camelCaseItem: 'item1' },
        { snake_case_item: 'item2', camelCaseItem: 'item2' }
      ]
    });
  });

  // Debug endpoint to check request body conversion
  app.post('/api/debug/case-conversion', (req: Request, res: Response) => {
    res.json({
      message: 'This is the request body you sent',
      body: req.body,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  });

  // Test endpoint for team player assignment (configured endpoint)
  app.post('/api/debug/teams/123/players', (req: Request, res: Response) => {
    res.json({
      message: 'Debug team player assignment endpoint',
      receivedBody: req.body,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  });
}