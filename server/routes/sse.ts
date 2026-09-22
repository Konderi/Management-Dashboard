import { Router } from 'express';
import { simulator } from '../services/simulator.js';

export const sseRouter = Router();

sseRouter.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial snapshot
  const initial = simulator.getSnapshot(req.user);
  res.write(`data: ${JSON.stringify(initial)}\n\n`);

  // Broadcast every 2.5 seconds
  const interval = setInterval(() => {
    try {
      const snapshot = simulator.getSnapshot(req.user);
      res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
    } catch (err) {
      clearInterval(interval);
    }
  }, 2500);

  req.on('close', () => {
    clearInterval(interval);
  });
});
