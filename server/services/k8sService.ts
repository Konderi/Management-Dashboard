import axios, { AxiosInstance } from 'axios';
import https from 'https';
import fs from 'fs';
import { configManager } from '../config.js';

export class K8sService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 8000
    });
  }

  public async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    const config = configManager.getConfig().k8s;
    if (config.inCluster) {
      try {
        const token = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf-8');
        const res = await this.client.get('https://kubernetes.default.svc/version', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, message: `Connected to Kubernetes in-cluster: ${res.data?.gitVersion}`, data: res.data };
      } catch (err: any) {
        return { success: false, message: `In-cluster K8s error: ${err.message}` };
      }
    }
    return { success: true, message: 'Kubernetes client configured (mock/simulation ready)' };
  }
}

export const k8sService = new K8sService();
