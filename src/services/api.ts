import { FullTelemetrySnapshot, BenchmarkResult, IntegrationConfig } from '../types/index.js';

class ApiClient {
  private listeners: Array<(snapshot: FullTelemetrySnapshot) => void> = [];
  private eventSource: EventSource | null = null;
  private localPin: string | null = null;

  constructor() {
    this.localPin = localStorage.getItem('nexus-local-pin');
  }

  public setLocalPin(pin: string) {
    this.localPin = pin;
    localStorage.setItem('nexus-local-pin', pin);
  }

  public getLocalPin(): string | null {
    return this.localPin;
  }

  public subscribeTelemetry(callback: (snapshot: FullTelemetrySnapshot) => void): () => void {
    this.listeners.push(callback);

    if (!this.eventSource) {
      this.connectEventSource();
    }

    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
      if (this.listeners.length === 0 && this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }

  private connectEventSource() {
    try {
      this.eventSource = new EventSource('/api/stream');

      this.eventSource.onmessage = (event) => {
        try {
          const snapshot: FullTelemetrySnapshot = JSON.parse(event.data);
          this.listeners.forEach((cb) => cb(snapshot));
        } catch (err) {
          console.error('Failed to parse SSE telemetry snapshot:', err);
        }
      };

      this.eventSource.onerror = () => {
        // Fallback polling
        this.fetchSnapshot().then((snapshot) => {
          if (snapshot) this.listeners.forEach((cb) => cb(snapshot));
        });
      };
    } catch (e) {
      console.warn('SSE not supported or failed, falling back to polling');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.localPin) {
      headers['x-local-pin'] = this.localPin;
    }
    return headers;
  }

  public async fetchSnapshot(): Promise<FullTelemetrySnapshot | null> {
    try {
      const res = await fetch('/api/snapshot', { headers: this.getHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch telemetry snapshot:', err);
      return null;
    }
  }

  public async powerCycleArubaPort(portNumber: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/aruba/power-cycle', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ portNumber })
    });
    return await res.json();
  }

  public async toggleArubaPort(portNumber: number, enabled: boolean): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/aruba/toggle-port', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ portNumber, enabled })
    });
    return await res.json();
  }

  public async setVmState(
    vmid: number,
    node: string,
    type: 'qemu' | 'lxc',
    action: 'start' | 'stop' | 'reboot'
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/proxmox/vm-action', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ vmid, node, type, action })
    });
    return await res.json();
  }

  public async restartK8sDeployment(name: string, namespace: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/k8s/rollout-restart', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, namespace })
    });
    return await res.json();
  }

  public async runAiBenchmark(model: string, prompt: string): Promise<BenchmarkResult> {
    const res = await fetch('/api/ai/benchmark', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ model, prompt })
    });
    return await res.json();
  }

  public async toggleClientBlock(clientId: string): Promise<{ success: boolean; message: string; blocked: boolean }> {
    const res = await fetch('/api/unifi/toggle-block', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ clientId })
    });
    return await res.json();
  }

  public async restartAccessPoint(mac?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/unifi/restart-ap', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mac })
    });
    return await res.json();
  }

  public async getConfig(): Promise<IntegrationConfig> {
    const res = await fetch('/api/config', { headers: this.getHeaders() });
    return await res.json();
  }

  public async updateConfig(config: Partial<IntegrationConfig>): Promise<{ success: boolean; config: IntegrationConfig }> {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config)
    });
    return await res.json();
  }

  public async testConnection(service: string): Promise<{ success: boolean; message: string; data?: any }> {
    const res = await fetch('/api/test-connection', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ service })
    });
    return await res.json();
  }

  public async verifyPin(pin: string): Promise<{ success: boolean; message?: string; user?: any }> {
    const res = await fetch('/api/auth/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    return await res.json();
  }
}

export const api = new ApiClient();
