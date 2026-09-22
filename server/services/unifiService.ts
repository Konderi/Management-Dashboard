import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { configManager } from '../config.js';

export class UnifiService {
  private client: AxiosInstance;
  private cookie: string | null = null;

  constructor() {
    this.client = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 8000
    });
  }

  private async login(): Promise<boolean> {
    const config = configManager.getConfig().unifi;
    if (!config.host || !config.user || !config.pass) return false;

    try {
      const res = await this.client.post(`${config.host}/api/auth/login`, {
        username: config.user,
        password: config.pass
      });
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        this.cookie = setCookie.join('; ');
        return true;
      }
    } catch (err) {
      console.warn('UniFi login error:', err instanceof Error ? err.message : err);
    }
    return false;
  }

  public async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    const config = configManager.getConfig().unifi;
    try {
      const loggedIn = await this.login();
      if (!loggedIn) {
        return { success: false, message: 'Authentication failed: Invalid credentials or host unreachable' };
      }
      const res = await this.client.get(`${config.host}/proxy/network/api/s/${config.site}/stat/sysinfo`, {
        headers: { Cookie: this.cookie || '' }
      });
      return { success: true, message: 'Connected to UDM-SE successfully', data: res.data?.data?.[0] };
    } catch (err: any) {
      return { success: false, message: `Connection failed: ${err.message}` };
    }
  }

  public async restartDevice(mac: string): Promise<{ success: boolean; message: string }> {
    const config = configManager.getConfig().unifi;
    try {
      if (!this.cookie) await this.login();
      await this.client.post(
        `${config.host}/proxy/network/api/s/${config.site}/cmd/devmgr`,
        { cmd: 'restart', mac },
        { headers: { Cookie: this.cookie || '' } }
      );
      return { success: true, message: `Device ${mac} restart command sent` };
    } catch (err: any) {
      return { success: false, message: `Restart failed: ${err.message}` };
    }
  }
}

export const unifiService = new UnifiService();
