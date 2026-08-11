import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../artifacts/api-server/src/app';

type VercelRequest = IncomingMessage & { url?: string };

type VercelResponse = ServerResponse;

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!req.url) {
    req.url = '/api';
  } else if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }

  return new Promise<void>((resolve, reject) => {
    res.on('finish', resolve);
    res.on('error', reject);

    try {
      const expressHandler = app as unknown as (req: VercelRequest, res: VercelResponse) => void;
      expressHandler(req, res);
    } catch (error) {
      reject(error);
    }
  });
}
