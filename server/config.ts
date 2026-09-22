import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { IntegrationConfig } from '../src/types/index.js';

dotenv.config();

const CONFIG_FILE = path.join(process.cwd(), 'data', 'config.json');

const defaultConfig: IntegrationConfig = {
  mode: 'simulation',
  unifi: {
    host: process.env.UNIFI_HOST || 'https://192.168.1.1',
    user: process.env.UNIFI_USER || 'admin',
    pass: process.env.UNIFI_PASS || '',
    site: 'default'
  },
  aruba: {
    host: process.env.ARUBA_HOST || 'https://192.168.20.2',
    protocol: 'rest',
    user: process.env.ARUBA_USER || 'manager',
    pass: process.env.ARUBA_PASS || ''
  },
  proxmox: {
    host: process.env.PROXMOX_HOST || 'https://192.168.50.15:8006',
    tokenUser: process.env.PVE_TOKEN_ID || process.env.PVE_TOKEN_USER || 'root@pam!ControlPlane',
    tokenSecret: process.env.PVE_TOKEN_SECRET || ''
  },

  k8s: {
    kubeconfig: process.env.KUBECONFIG || '',
    inCluster: process.env.K8S_IN_CLUSTER === 'true'
  },
  ai: {
    ollamaHost: process.env.OLLAMA_HOST || 'http://192.168.50.21:11434',
    vllmHost: process.env.VLLM_HOST || 'http://192.168.50.22:8000'
  },
  cloudflare: {
    accountId: process.env.CF_ACCOUNT_ID || '',
    apiToken: process.env.CF_API_TOKEN || '',
    tunnelId: process.env.CF_TUNNEL_ID || 'd3b07384-d113-4632-a5e2-8b94157d74f2',
    zeroTrustAud: process.env.CF_ZERO_TRUST_AUD || '',
    teamName: process.env.CF_TEAM_NAME || 'konderi'
  },
  localAuthPin: process.env.LOCAL_AUTH_PIN || '1337'
};


export class ConfigManager {
  private config: IntegrationConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): IntegrationConfig {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return { ...defaultConfig, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('Could not read config.json, using defaults:', err);
    }
    return { ...defaultConfig };
  }

  public getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<IntegrationConfig>): IntegrationConfig {
    this.config = { ...this.config, ...partial };
    try {
      const dir = path.dirname(CONFIG_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist config to file:', err);
    }
    return this.config;
  }
}

export const configManager = new ConfigManager();
