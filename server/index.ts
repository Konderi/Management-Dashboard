import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from './middleware/auth.js';
import { apiRouter } from './routes/api.js';
import { sseRouter } from './routes/sse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Authentication middleware (Cloudflare Zero Trust JWT + Local PIN fallback)
app.use(authMiddleware);

// API routes
app.use('/api', apiRouter);
app.use('/api', sseRouter);

// Serve frontend build in production
const clientDist = path.join(__dirname, '../../dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Nexus Backend API is running on :3001 (Frontend dev server running on :3000)');
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  NEXUS Infrastructure Control Plane Backend Active`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Cloudflare Access Zero Trust & Local PIN Auth Ready`);
  console.log(`=======================================================`);
});
