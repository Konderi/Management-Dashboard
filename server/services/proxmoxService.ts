import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { configManager } from '../config.js';

export class ProxmoxService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 8000
    });
  }

  private getAuthHeader(): string {
    const config = configManager.getConfig().proxmox;
    return `PVEAPIToken=${config.tokenUser}=${config.tokenSecret}`;
  }

  public async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    const config = configManager.getConfig().proxmox;
    if (!config.host || !config.tokenSecret) {
      return { success: false, message: 'Proxmox host or API token secret not configured' };
    }

    try {
      const res = await this.client.get(`${config.host}/api2/json/version`, {
        headers: { Authorization: this.getAuthHeader() }
      });
      return { success: true, message: `Connected to Proxmox VE ${res.data?.data?.version || ''}`, data: res.data?.data };
    } catch (err: any) {
      return { success: false, message: `Proxmox connection error: ${err.message}` };
    }
  }

  public async getClusterResources(): Promise<any> {
    const config = configManager.getConfig().proxmox;
    const res = await this.client.get(`${config.host}/api2/json/cluster/resources`, {
      headers: { Authorization: this.getAuthHeader() }
    });
    return res.data?.data;
  }

  public async vmPowerAction(node: string, vmid: number, type: 'qemu' | 'lxc', action: 'start' | 'stop' | 'reboot'): Promise<{ success: boolean; message: string }> {
    const config = configManager.getConfig().proxmox;
    try {
      await this.client.post(
        `${config.host}/api2/json/nodes/${node}/${type}/${vmid}/status/${action}`,
        {},
        { headers: { Authorization: this.getAuthHeader() } }
      );
      return { success: true, message: `VM ${vmid} ${action} command sent` };
    } catch (err: any) {
      return { success: false, message: `Action failed: ${err.message}` };
    }
  }
}

export const proxmoxService = new ProxmoxService();
