import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../server/routers';
import { createContext } from '../server/_core/context';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  // Convert Vercel request to Fetch API Request
  const url = new URL(req.url || '', `https://${req.headers.host}`);
  
  const fetchRequest = new Request(url.toString(), {
    method: req.method || 'GET',
    headers: new Headers(req.headers as Record<string, string>),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  });

  // Create a custom response handler
  const fetchResponse = await fetchRequestHandler({
    req: fetchRequest,
    router: appRouter,
    endpoint: '/api/trpc',
    createContext: () => createContext({ req: req as any, res: res as any }),
  });

  // Convert Fetch API Response to Vercel Response
  res.status(fetchResponse.status);
  
  fetchResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = await fetchResponse.text();
  res.send(body);
}
