import { Request, Response, NextFunction } from 'express';

// Legacy URL patterns that need to be redirected
const URL_REDIRECTS = [
  {
    pattern: /^\/api\/game\/(\d+)\/team\/(\d+)\/stats$/,
    redirect: (match: RegExpMatchArray) => `/api/teams/${match[2]}/games/${match[1]}/stats`
  },
  {
    pattern: /^\/api\/game\/(\d+)\/team\/(\d+)\/rosters$/,
    redirect: (match: RegExpMatchArray) => `/api/teams/${match[2]}/games/${match[1]}/rosters`
  },
  {
    pattern: /^\/api\/game-stats\/(\d+)$/,
    redirect: (match: RegExpMatchArray) => `/api/games/stats/${match[1]}`
  }
];

const standardizeUrls = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalUrl = req.path;
    
    // Check if URL matches any redirect pattern
    for (const redirect of URL_REDIRECTS) {
      const match = originalUrl.match(redirect.pattern);
      if (match) {
        const newUrl = redirect.redirect(match);
        console.log(`🔄 URL Redirect: ${originalUrl} → ${newUrl}`);
        
        // Preserve query parameters
        const queryString = req.url.split('?')[1];
        const fullNewUrl = queryString ? `${newUrl}?${queryString}` : newUrl;
        
        // Perform redirect
        return res.redirect(301, fullNewUrl);
      }
    }
    
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
  // Import the smart case conversion
  const { smartCaseConversion } = require('./smart-case-conversion');
  return smartCaseConversion();
};

export { standardizeUrls, extractRequestContext, standardCaseConversion };