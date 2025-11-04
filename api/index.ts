import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { appRouter } from '../server/routers';
import { createContext } from '../server/_core/context';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Create tRPC HTTP handler
const trpcHandler = createHTTPHandler({
  router: appRouter,
  createContext: ({ req, res }: any) => createContext({ req, res }),
});

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Convert Vercel request to standard format
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  
  // Call tRPC handler
  return trpcHandler({
    req: {
      method: req.method || 'GET',
      headers: req.headers as Record<string, string | string[]>,
      query: Object.fromEntries(url.searchParams),
      body: req.body,
    } as any,
    res: {
      statusCode: 200,
      setHeader: (key: string, value: string) => res.setHeader(key, value),
      end: (body?: any) => {
        if (body) {
          res.send(body);
        } else {
          res.end();
        }
      },
    } as any,
  });
}

