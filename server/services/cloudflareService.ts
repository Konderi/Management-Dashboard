import axios from 'axios';
import { configManager } from '../config.js';

export class CloudflareService {
  public async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    const config = configManager.getConfig().cloudflare;
    if (!config.accountId || !config.apiToken) {
      return { success: false, message: 'Cloudflare Account ID or API Token not configured' };
    }

    try {
      const res = await axios.get(
        `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/cfd_tunnel/${config.tunnelId}`,
        {
          headers: {
            Authorization: `Bearer ${config.apiToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 6000
        }
      );
      const tunnel = res.data?.result;
      return {
        success: true,
        message: `Cloudflare Tunnel '${tunnel?.name || config.tunnelId}' is ${tunnel?.status || 'active'}`,
        data: tunnel
      };
    } catch (err: any) {
      return { success: false, message: `Cloudflare API error: ${err.message}` };
    }
  }
}

export const cloudflareService = new CloudflareService();
