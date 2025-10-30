import { createApp } from '../server/_core/app';

// Create Express app instance (reused across invocations)
const app = createApp();

// Vercel serverless function handler
export default function handler(req: any, res: any) {
  return app(req, res);
}

