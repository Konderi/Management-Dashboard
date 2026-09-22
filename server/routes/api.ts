import { Router } from 'express';
import { simulator } from '../services/simulator.js';
import { configManager } from '../config.js';
import { unifiService } from '../services/unifiService.js';
import { arubaService } from '../services/arubaService.js';
import { proxmoxService } from '../services/proxmoxService.js';
import { k8sService } from '../services/k8sService.js';
import { aiWorkerService } from '../services/aiWorkerService.js';
import { cloudflareService } from '../services/cloudflareService.js';

export const apiRouter = Router();

// Full snapshot
apiRouter.get('/snapshot', (req, res) => {
  const snapshot = simulator.getSnapshot(req.user);
  res.json(snapshot);
});

// Aruba Switch PoE Power Cycle
apiRouter.post('/aruba/power-cycle', async (req, res) => {
  const { portNumber } = req.body;
  const config = configManager.getConfig();

  if (config.mode === 'live') {
    const result = await arubaService.powerCyclePort(Number(portNumber));
    return res.json(result);
  }

  const result = simulator.powerCycleArubaPort(Number(portNumber));
  res.json(result);
});

// Aruba Switch Port Toggle
apiRouter.post('/aruba/toggle-port', async (req, res) => {
  const { portNumber, enabled } = req.body;
  const result = simulator.toggleArubaPort(Number(portNumber), Boolean(enabled));
  res.json(result);
});

// Proxmox VM Power Action
apiRouter.post('/proxmox/vm-action', async (req, res) => {
  const { vmid, node, type, action } = req.body;
  const config = configManager.getConfig();

  if (config.mode === 'live' && node) {
    const result = await proxmoxService.vmPowerAction(node, Number(vmid), type || 'qemu', action);
    return res.json(result);
  }

  const result = simulator.setVmState(Number(vmid), action);
  res.json(result);
});

// Kubernetes Rollout Restart
apiRouter.post('/k8s/rollout-restart', (req, res) => {
  const { name, namespace } = req.body;
  const result = simulator.restartK8sDeployment(name, namespace);
  res.json(result);
});

// AI Inference Benchmark
apiRouter.post('/ai/benchmark', async (req, res) => {
  const { model, prompt } = req.body;
  const config = configManager.getConfig();

  if (config.mode === 'live') {
    const result = await aiWorkerService.runInferenceBenchmark(model, prompt);
    return res.json(result);
  }

  const result = simulator.runAiBenchmark(model || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', prompt || 'Explain quantum computing in 3 sentences.');
  res.json(result);
});

// UniFi Block Client
apiRouter.post('/unifi/toggle-block', (req, res) => {
  const { clientId } = req.body;
  const result = simulator.toggleClientBlock(clientId);
  res.json(result);
});

// UniFi Restart AP
apiRouter.post('/unifi/restart-ap', async (req, res) => {
  const { mac } = req.body;
  const config = configManager.getConfig();

  if (config.mode === 'live' && mac) {
    const result = await unifiService.restartDevice(mac);
    return res.json(result);
  }

  const result = simulator.restartAccessPoint();
  res.json(result);
});

// Config endpoints
apiRouter.get('/config', (req, res) => {
  const config = configManager.getConfig();
  // Mask sensitive passwords in response
  const sanitized = {
    ...config,
    unifi: { ...config.unifi, pass: config.unifi.pass ? '••••••••' : '' },
    aruba: { ...config.aruba, pass: config.aruba.pass ? '••••••••' : '' },
    proxmox: { ...config.proxmox, tokenSecret: config.proxmox.tokenSecret ? '••••••••' : '' },
    cloudflare: { ...config.cloudflare, apiToken: config.cloudflare.apiToken ? '••••••••' : '' }
  };
  res.json(sanitized);
});

apiRouter.post('/config', (req, res) => {
  const updated = configManager.updateConfig(req.body);
  res.json({ success: true, config: updated });
});

// Test Connection for individual services
apiRouter.post('/test-connection', async (req, res) => {
  const { service } = req.body;
  let result = { success: false, message: 'Unknown service' };

  switch (service) {
    case 'unifi':
      result = await unifiService.testConnection();
      break;
    case 'aruba':
      result = await arubaService.testConnection();
      break;
    case 'proxmox':
      result = await proxmoxService.testConnection();
      break;
    case 'k8s':
      result = await k8sService.testConnection();
      break;
    case 'ollama':
      result = await aiWorkerService.testConnection('ollama');
      break;
    case 'vllm':
      result = await aiWorkerService.testConnection('vllm');
      break;
    case 'cloudflare':
      result = await cloudflareService.testConnection();
      break;
  }

  res.json(result);
});

// Local PIN verification
apiRouter.post('/auth/verify-pin', (req, res) => {
  const { pin } = req.body;
  const config = configManager.getConfig();

  if (pin === config.localAuthPin) {
    return res.json({
      success: true,
      user: {
        type: 'local_pin',
        email: 'admin@homelab.local',
        name: 'Local Administrator',
        role: 'admin',
        authenticated: true
      }
    });
  }

  res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
});
