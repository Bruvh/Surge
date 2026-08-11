import app from '../artifacts/api-server/src/app';

export default function handler(req: any, res: any) {
  if (!req.url) {
    req.url = '/api';
  } else if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }

  return new Promise<void>((resolve, reject) => {
    res.on('finish', resolve);
    res.on('error', reject);

    try {
      app(req, res);
    } catch (error) {
      reject(error);
    }
  });
}
