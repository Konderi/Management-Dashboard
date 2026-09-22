import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { configManager } from '../config.js';

export class ArubaService {
  private client: AxiosInstance;
  private cookie: string | null = null;

  constructor() {
    this.client = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 8000
    });
  }

  private async login(): Promise<boolean> {
    const config = configManager.getConfig().aruba;
    if (!config.host || !config.user || !config.pass) return false;

    try {
      const res = await this.client.post(`${config.host}/rest/v4/login`, {
        user_name: config.user,
        password: config.pass
      });
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        this.cookie = setCookie.join('; ');
        return true;
      }
    } catch (err) {
      console.warn('Aruba REST login error:', err instanceof Error ? err.message : err);
    }
    return false;
  }

  public async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    const config = configManager.getConfig().aruba;
    try {
      const loggedIn = await this.login();
      if (!loggedIn) {
        return { success: false, message: 'Aruba REST authentication failed (check username/password or if REST is enabled on switch)' };
      }
      const res = await this.client.get(`${config.host}/rest/v4/system/status`, {
        headers: { Cookie: this.cookie || '' }
      });
      return { success: true, message: 'Connected to Aruba 2530 switch successfully', data: res.data };
    } catch (err: any) {
      return { success: false, message: `Aruba connection error: ${err.message}` };
    }
  }

  public async powerCyclePort(portNumber: number): Promise<{ success: boolean; message: string }> {
    const config = configManager.getConfig().aruba;
    try {
      if (!this.cookie) await this.login();
      // Disable PoE on port
      await this.client.put(
        `${config.host}/rest/v4/poe/ports/${portNumber}`,
        { poe_port_power_enable: false },
        { headers: { Cookie: this.cookie || '' } }
      );
      // Wait 3 seconds and re-enable
      setTimeout(async () => {
        try {
          await this.client.put(
            `${config.host}/rest/v4/poe/ports/${portNumber}`,
            { poe_port_power_enable: true },
            { headers: { Cookie: this.cookie || '' } }
          );
        } catch (e) {
          console.error('Failed to re-enable PoE port:', e);
        }
      }, 3000);
      return { success: true, message: `PoE port ${portNumber} power-cycle initiated via REST` };
    } catch (err: any) {
      return { success: false, message: `PoE power-cycle failed: ${err.message}` };
    }
  }
}

export const arubaService = new ArubaService();
