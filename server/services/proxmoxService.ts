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

  public async getNodes(): Promise<any[]> {
    const config = configManager.getConfig().proxmox;
    try {
      const res = await this.client.get(`${config.host}/api2/json/nodes`, {
        headers: { Authorization: this.getAuthHeader() }
      });
      return res.data?.data || [];
    } catch (err: any) {
      console.warn('Could not fetch Proxmox nodes:', err.message);
      return [];
    }
  }

  public async getLiveNodesAndVms(): Promise<{ nodes: any[]; vms: any[] }> {
    const config = configManager.getConfig().proxmox;
    if (!config.host || !config.tokenSecret) {
      return { nodes: [], vms: [] };
    }

    try {
      const rawNodes = await this.getNodes();
      let resources: any[] = [];
      try {
        resources = await this.getClusterResources() || [];
      } catch (e: any) {
        console.warn('Could not fetch cluster resources:', e.message);
      }

      const vms = resources
        .filter((r: any) => r.type === 'qemu' || r.type === 'lxc')
        .map((r: any) => ({
          vmid: r.vmid,
          name: r.name || `${r.type}-${r.vmid}`,
          node: r.node,
          type: r.type as 'qemu' | 'lxc',
          status: r.status === 'running' ? 'running' : 'stopped',
          cpuUsage: Math.round((r.cpu || 0) * 100),
          memUsage: r.maxmem ? Math.round(((r.mem || 0) / r.maxmem) * 100) : 0,
          memTotalMb: Math.round((r.maxmem || 0) / 1024 / 1024),
          diskUsageMb: Math.round((r.disk || 0) / 1024 / 1024),
          uptime: r.uptime ? `${Math.floor(r.uptime / 86400)}d ${Math.floor((r.uptime % 86400) / 3600)}h` : '0m',
          ip: r.ip || `192.168.50.${r.vmid}`,
          tags: r.tags ? r.tags.split(';') : []
        }));

      const nodes = await Promise.all(
        rawNodes.map(async (n: any) => {
          let cpuUsage = 15;
          let memUsage = 45;
          let memTotalGb = n.node.includes('control') ? 16 : 32;
          let diskUsage = 30;
          let diskTotalGb = n.node.includes('control') ? 500 : 1000;
          let uptime = 'Online';
          let loadAverage = [0.8, 0.75, 0.7];
          let cpuCores = n.node.includes('control') ? 4 : 6;

          try {
            const statusRes = await this.client.get(`${config.host}/api2/json/nodes/${n.node}/status`, {
              headers: { Authorization: this.getAuthHeader() },
              timeout: 3000
            });
            const d = statusRes.data?.data;
            if (d) {
              cpuUsage = Math.round((d.cpu || 0) * 100);
              if (d.memory) {
                memUsage = Math.round((d.memory.used / d.memory.total) * 100);
                memTotalGb = Math.round(d.memory.total / 1024 / 1024 / 1024);
              }
              if (d.rootfs) {
                diskUsage = Math.round((d.rootfs.used / d.rootfs.total) * 100);
                diskTotalGb = Math.round(d.rootfs.total / 1024 / 1024 / 1024);
              }
              if (d.uptime) {
                uptime = `${Math.floor(d.uptime / 86400)}d ${Math.floor((d.uptime % 86400) / 3600)}h`;
              }
              if (d.loadavg) {
                loadAverage = d.loadavg.map((l: any) => parseFloat(l));
              }
              if (d.cpuinfo?.cpus) {
                cpuCores = d.cpuinfo.cpus;
              }
            }
          } catch {
            // If privilege separation restricts /status endpoint, use defaults/estimates
          }

          const isControl = n.node.toLowerCase().includes('control');
          const ipMap: Record<string, string> = {
            'pve-control': '192.168.50.15',
            'pve01': '192.168.50.11',
            'pve02': '192.168.50.12',
            'pve03': '192.168.50.13',
            'pve-01': '192.168.50.11',
            'pve-02': '192.168.50.12',
            'pve-03': '192.168.50.13'
          };
          const nodeIp = ipMap[n.node] || (isControl ? '192.168.50.15' : '192.168.50.11');

          return {
            id: `node/${n.node}`,
            name: `${n.node} (${isControl ? 'HP Prodesk 600 G3' : 'HP EliteDesk 800 G4 Mini'})`,
            role: isControl ? 'control-plane-host' : 'cluster-node',
            hardware: isControl ? 'HP Prodesk 600 G3 (Intel i5-6500, 16GB)' : 'HP EliteDesk 800 G4 Mini (Intel i7-8700T, 32GB)',
            status: n.status === 'online' ? 'online' : 'offline',
            cpuUsage,
            cpuCores,
            memUsage,
            memTotalGb,
            diskUsage,
            diskTotalGb,
            uptime,
            loadAverage,
            ip: nodeIp
          };

        })
      );

      return { nodes, vms };
    } catch (err: any) {
      console.error('Error fetching live Proxmox nodes/VMs:', err.message);
      return { nodes: [], vms: [] };
    }
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
