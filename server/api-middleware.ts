import { Request, Response, NextFunction } from 'express';

const standardizeUrls = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔄 URL Middleware active for:', req.path);
    next();
  };
};

const extractRequestContext = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('📋 Context Middleware active for:', req.path);
    next();
  };
};

const standardCaseConversion = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔄 Case Middleware active for:', req.path);
    next();
  };
};

export { standardizeUrls, extractRequestContext, standardCaseConversion };