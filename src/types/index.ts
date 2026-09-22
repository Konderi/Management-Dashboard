// Shared TypeScript definitions for Nexus Infrastructure Control Plane

export interface SystemOverview {
  status: 'healthy' | 'warning' | 'degraded';
  wan: {
    ip: string;
    provider: string;
    latencyMs: number;
    downloadMbps: number;
    uploadMbps: number;
    packetLossPercent: number;
  };
  cloudflareTunnel: {
    status: 'healthy' | 'degraded' | 'offline';
    tunnelId: string;
    tunnelName: string;
    pop: string;
    activeConnections: number;
    ingressUrl: string;
  };
  authSession: {
    type: 'cloudflare_zero_trust' | 'local_pin';
    email?: string;
    name?: string;
    role: string;
    authenticated: boolean;
  };
  vpnStatus: {
    wifimanActive: boolean;
    clientIp?: string;
    connectedDevices: number;
  };
  quickStats: {
    totalDevices: number;
    totalVms: number;
    totalPods: number;
    totalGpus: number;
    activePoEWatts: number;
  };
}

export interface UdmGateway {
  model: string;
  version: string;
  cpuUsage: number;
  memUsage: number;
  tempC: number;
  uptime: string;
  wanPorts: Array<{
    port: number;
    name: string;
    speed: string;
    ip: string;
    status: 'up' | 'down';
  }>;
  dpi: Array<{
    category: string;
    bytes: number;
    percentage: number;
  }>;
}

export interface U7MeshAp {
  model: string;
  name: string;
  ip: string;
  mac: string;
  status: 'online' | 'offline';
  clientsConnected: number;
  channel24: number;
  channel5: number;
  channel6: number;
  txPower24: number;
  txPower5: number;
  txPower6: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: string;
  wifi7Clients: number;
  utilization24: number;
  utilization5: number;
  utilization6: number;
}

export interface NetworkClient {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: 'wired' | 'wireless';
  wifiStandard?: 'Wi-Fi 7 (802.11be)' | 'Wi-Fi 6E' | 'Wi-Fi 6' | 'Wi-Fi 5';
  band?: '6GHz' | '5GHz' | '2.4GHz';
  signalDbm?: number;
  rxRateMbps?: number;
  txRateMbps?: number;
  apName?: string;
  switchPort?: number;
  activityKbps: number;
  blocked: boolean;
}

export interface ArubaSwitchPort {
  portNumber: number;
  name: string;
  enabled: boolean;
  linkStatus: 'up' | 'down';
  speed: '1000FDx' | '100FDx' | '10FDx' | 'down';
  poeCapable: boolean;
  poeStatus: 'delivering' | 'searching' | 'disabled' | 'fault';
  poeWatts: number;
  poeClass: number;
  connectedDevice?: string;
  vlan: number;
}

export interface ArubaSwitch {
  model: string;
  ip: string;
  firmware: string;
  uptime: string;
  cpuUsage: number;
  memUsage: number;
  poeTotalBudgetWatts: number;
  poeActiveWatts: number;
  poeRemainingWatts: number;
  ports: ArubaSwitchPort[];
}

export interface ProxmoxNode {
  id: string;
  name: string;
  role: 'control-plane-host' | 'cluster-node';
  hardware: string;
  status: 'online' | 'offline';
  cpuUsage: number;
  cpuCores: number;
  memUsage: number;
  memTotalGb: number;
  diskUsage: number;
  diskTotalGb: number;
  uptime: string;
  loadAverage: number[];
  ip: string;
}

export interface BotFarmBot {
  id: string;
  name: string;
  partner: 'Konderi' | 'Tehoz' | 'Zeller' | 'Coali';
  port: number;
  url: string;
  status: 'running' | 'stopped';
  strategy: string;
  timeframe: string;
  dryRun: boolean;
  openTrades: number;
  maxTrades: number;
  stakeAmount: number;
  winRatePercent: number;
  totalProfitUsdt: number;
  totalTrades: number;
  lastTradeTime: string;
}

export interface ProxmoxVm {
  vmid: number;
  name: string;
  node: string;
  type: 'qemu' | 'lxc';
  status: 'running' | 'stopped';
  cpuUsage: number;
  memUsage: number;
  memTotalMb: number;
  diskUsageMb: number;
  uptime: string;
  ip: string;
  tags: string[];
}

export interface K8sNode {
  name: string;
  role: 'control-plane' | 'worker';
  status: 'Ready' | 'NotReady';
  cpuPercent: number;
  memPercent: number;
  podCount: number;
  kubeletVersion: string;
}

export interface K8sPod {
  name: string;
  namespace: string;
  status: 'Running' | 'CrashLoopBackOff' | 'Pending' | 'Completed';
  restarts: number;
  age: string;
  cpuMillicores: number;
  memMb: number;
  node: string;
}

export interface K8sDeployment {
  name: string;
  namespace: string;
  replicasReady: number;
  replicasDesired: number;
  image: string;
  lastUpdated: string;
}

export interface GpuTelemetry {
  id: number;
  name: string;
  vramUsedMb: number;
  vramTotalMb: number;
  utilizationPercent: number;
  temperatureC: number;
  powerWatts: number;
  powerLimitWatts: number;
}

export interface LoadedModel {
  name: string;
  sizeGb: number;
  vramUsageMb: number;
  quantization: string;
  contextLength: number;
}

export interface AiWorker {
  id: string;
  name: string;
  host: string;
  status: 'online' | 'busy' | 'offline';
  engine: 'Ollama' | 'vLLM';
  gpus: GpuTelemetry[];
  loadedModels: LoadedModel[];
}

export interface BenchmarkResult {
  prompt: string;
  model: string;
  tokensGenerated: number;
  totalTimeSec: number;
  tokensPerSec: number;
  timeToFirstTokenMs: number;
  timestamp: string;
}

export interface IntegrationConfig {
  mode: 'simulation' | 'live';
  unifi: {
    host: string;
    user: string;
    pass: string;
    site: string;
  };
  aruba: {
    host: string;
    protocol: 'rest' | 'ssh';
    user: string;
    pass: string;
  };
  proxmox: {
    host: string;
    tokenUser: string;
    tokenSecret: string;
  };
  k8s: {
    kubeconfig: string;
    inCluster: boolean;
  };
  ai: {
    ollamaHost: string;
    vllmHost: string;
  };
  cloudflare: {
    accountId: string;
    apiToken: string;
    tunnelId: string;
    zeroTrustAud: string;
    teamName: string;
  };
  localAuthPin: string;
}

export interface FullTelemetrySnapshot {
  timestamp: string;
  overview: SystemOverview;
  udm: UdmGateway;
  u7Mesh: U7MeshAp;
  clients: NetworkClient[];
  aruba: ArubaSwitch;
  proxmoxNodes: ProxmoxNode[];
  proxmoxVms: ProxmoxVm[];
  k8sNodes: K8sNode[];
  k8sPods: K8sPod[];
  k8sDeployments: K8sDeployment[];
  aiWorkers: AiWorker[];
  botFarmBots: BotFarmBot[];
}
