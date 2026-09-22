import type {
  FullTelemetrySnapshot,
  SystemOverview,
  UdmGateway,
  U7MeshAp,
  NetworkClient,
  ArubaSwitch,
  ProxmoxNode,
  ProxmoxVm,
  K8sNode,
  K8sPod,
  K8sDeployment,
  AiWorker,
  BenchmarkResult,
  BotFarmBot
} from '../../src/types/index.js';

class TelemetrySimulator {
  private udm: UdmGateway;
  private u7Mesh: U7MeshAp;
  private clients: NetworkClient[];
  private aruba: ArubaSwitch;
  private proxmoxNodes: ProxmoxNode[];
  private proxmoxVms: ProxmoxVm[];
  private k8sNodes: K8sNode[];
  private k8sPods: K8sPod[];
  private k8sDeployments: K8sDeployment[];
  private aiWorkers: AiWorker[];
  private botFarmBots: BotFarmBot[];
  private lastBenchmark?: BenchmarkResult;
  private wanLatency: number = 5.2;

  constructor() {
    this.udm = {
      model: 'UniFi Dream Machine Special Edition (UDM-SE)',
      version: 'v4.0.20',
      cpuUsage: 16,
      memUsage: 48,
      tempC: 43,
      uptime: '42d 18h 35m',
      wanPorts: [
        { port: 9, name: 'WAN 1 (2.5GbE RJ45)', speed: '2500FDx', ip: '85.156.92.144', status: 'up' },
        { port: 10, name: 'WAN 2 (10G SFP+)', speed: '10000FDx', ip: '10.0.0.2', status: 'down' }
      ],
      dpi: [
        { category: 'AI Inference & Cloud', bytes: 142850000000, percentage: 38 },
        { category: 'Streaming & Media', bytes: 112500000000, percentage: 30 },
        { category: 'VPN & Encrypted', bytes: 67500000000, percentage: 18 },
        { category: 'Web & General', bytes: 52500000000, percentage: 14 }
      ]
    };

    this.u7Mesh = {
      model: 'UniFi U7 Mesh (Wi-Fi 7)',
      name: 'AP-LivingRoom-U7Mesh',
      ip: '192.168.1.15',
      mac: '74:83:c2:fa:19:bc',
      status: 'online',
      clientsConnected: 14,
      wifi7Clients: 4,
      channel24: 6,
      channel5: 36,
      channel6: 37,
      txPower24: 18,
      txPower5: 23,
      txPower6: 24,
      memoryUsage: 41,
      cpuUsage: 19,
      uptime: '28d 4h 12m',
      utilization24: 28,
      utilization5: 42,
      utilization6: 12
    };

    this.clients = [
      {
        id: 'client-1',
        name: 'Toni-iPhone-16-Pro',
        ip: '192.168.1.105',
        mac: '38:f9:d3:a1:88:02',
        type: 'wireless',
        wifiStandard: 'Wi-Fi 7 (802.11be)',
        band: '6GHz',
        signalDbm: -46,
        rxRateMbps: 2882,
        txRateMbps: 2882,
        apName: 'AP-LivingRoom-U7Mesh',
        activityKbps: 4250,
        blocked: false
      },
      {
        id: 'client-2',
        name: 'MacBook-Pro-M3-Max',
        ip: '192.168.1.106',
        mac: 'a4:83:e7:51:24:cf',
        type: 'wireless',
        wifiStandard: 'Wi-Fi 7 (802.11be)',
        band: '6GHz',
        signalDbm: -42,
        rxRateMbps: 2882,
        txRateMbps: 2400,
        apName: 'AP-LivingRoom-U7Mesh',
        activityKbps: 18400,
        blocked: false
      },
      {
        id: 'client-3',
        name: 'Samsung-S24-Ultra',
        ip: '192.168.1.108',
        mac: '90:32:4b:61:99:f1',
        type: 'wireless',
        wifiStandard: 'Wi-Fi 7 (802.11be)',
        band: '6GHz',
        signalDbm: -54,
        rxRateMbps: 2400,
        txRateMbps: 2400,
        apName: 'AP-LivingRoom-U7Mesh',
        activityKbps: 850,
        blocked: false
      },
      {
        id: 'client-4',
        name: 'iPad-Pro-M2',
        ip: '192.168.1.112',
        mac: '44:d9:e7:82:11:4a',
        type: 'wireless',
        wifiStandard: 'Wi-Fi 6E',
        band: '6GHz',
        signalDbm: -58,
        rxRateMbps: 1800,
        txRateMbps: 1800,
        apName: 'AP-LivingRoom-U7Mesh',
        activityKbps: 120,
        blocked: false
      },
      {
        id: 'client-5',
        name: 'Apple-TV-4K',
        ip: '192.168.1.120',
        mac: '70:ef:00:21:44:91',
        type: 'wireless',
        wifiStandard: 'Wi-Fi 6',
        band: '5GHz',
        signalDbm: -49,
        rxRateMbps: 1200,
        txRateMbps: 1200,
        apName: 'AP-LivingRoom-U7Mesh',
        activityKbps: 28500,
        blocked: false
      },
      {
        id: 'client-6',
        name: 'Philips-Hue-Bridge',
        ip: '192.168.1.130',
        mac: '00:17:88:2d:4f:8a',
        type: 'wired',
        switchPort: 7,
        activityKbps: 45,
        blocked: false
      }
    ];

    this.aruba = {
      model: 'Aruba 2530-8G-PoE+ Switch (J9774A)',
      ip: '192.168.1.2',
      firmware: 'YA.16.11.0004',
      uptime: '94d 11h 22m',
      cpuUsage: 8,
      memUsage: 34,
      poeTotalBudgetWatts: 67,
      poeActiveWatts: 27.6,
      poeRemainingWatts: 39.4,
      ports: [
        {
          portNumber: 1,
          name: 'Port 1 (AP-U7-Mesh)',
          enabled: true,
          linkStatus: 'up',
          speed: '1000FDx',
          poeCapable: true,
          poeStatus: 'delivering',
          poeWatts: 18.4,
          poeClass: 4,
          connectedDevice: 'Ubiquiti U7 Mesh AP',
          vlan: 1
        },
        {
          portNumber: 2,
          name: 'Port 2 (UDM-SE Trunk)',
          enabled: true,
          linkStatus: 'up',
          speed: '1000FDx',
          poeCapable: true,
          poeStatus: 'disabled',
          poeWatts: 0,
          poeClass: 0,
          connectedDevice: 'UDM-SE Port 1',
          vlan: 1
        },
        {
          portNumber: 3,
          name: 'Port 3 (AI-Worker-01)',
          enabled: true,
          linkStatus: 'up',
          speed: '1000FDx',
          poeCapable: true,
          poeStatus: 'disabled',
          poeWatts: 0,
          poeClass: 0,
          connectedDevice: 'AI Node 01 (RTX 4090)',
          vlan: 20
        },
        {
          portNumber: 4,
          name: 'Port 4 (AI-Worker-02)',
          enabled: true,
          linkStatus: 'up',
          speed: '1000FDx',
          poeCapable: true,
          poeStatus: 'disabled',
          poeWatts: 0,
          poeClass: 0,
          connectedDevice: 'AI Node 02 (A100)',
          vlan: 20
        },
        {
          portNumber: 5,
          name: 'Port 5 (Proxmox-PVE-01)',
          enabled: true,
          linkStatus: 'up',
          speed: '1000FDx',
          poeCapable: true,
          poeStatus: 'disabled',
          poeWatts: 0,
          poeClass: 0,
          connectedDevice: 'PVE Cluster Host 1',
          vlan: 10
        },
        {
          portNumber: 6,
          name: 'Port 6 (UniFi-G5-Bullet)',
          enabled: true,
          linkStatus: 'up',
          speed: '1000FDx',
          poeCapable: true,
          poeStatus: 'delivering',
          poeWatts: 5.8,
          poeClass: 3,
          connectedDevice: 'UniFi G5 Bullet Camera',
          vlan: 30
        },
        {
          portNumber: 7,
          name: 'Port 7 (HomeAssistant-PoE)',
          enabled: true,
          linkStatus: 'up',
          speed: '100FDx',
          poeCapable: true,
          poeStatus: 'delivering',
          poeWatts: 3.4,
          poeClass: 2,
          connectedDevice: 'Zigbee/ZWave PoE Gateway',
          vlan: 40
        },
        {
          portNumber: 8,
          name: 'Port 8 (Bench / Spare)',
          enabled: true,
          linkStatus: 'down',
          speed: 'down',
          poeCapable: true,
          poeStatus: 'searching',
          poeWatts: 0,
          poeClass: 0,
          connectedDevice: 'Unassigned',
          vlan: 1
        },
        {
          portNumber: 9,
          name: 'SFP 9 (10G DAC)',
          enabled: true,
          linkStatus: 'up',
          speed: '1000FDx',
          poeCapable: false,
          poeStatus: 'disabled',
          poeWatts: 0,
          poeClass: 0,
          connectedDevice: 'Storage Backplane',
          vlan: 10
        },
        {
          portNumber: 10,
          name: 'SFP 10 (Spare)',
          enabled: true,
          linkStatus: 'down',
          speed: 'down',
          poeCapable: false,
          poeStatus: 'disabled',
          poeWatts: 0,
          poeClass: 0,
          connectedDevice: 'Unassigned',
          vlan: 1
        }
      ]
    };

    this.proxmoxNodes = [
      {
        id: 'node/pve-control',
        name: 'pve-control (HP Prodesk 600 G3)',
        role: 'control-plane-host',
        hardware: 'HP Prodesk 600 G3 (Intel i5-6500, 16GB)',
        status: 'online',
        cpuUsage: 14,
        cpuCores: 4,
        memUsage: 52,
        memTotalGb: 16,
        diskUsage: 38,
        diskTotalGb: 500,
        uptime: '92d 08h',
        loadAverage: [0.65, 0.72, 0.68],
        ip: '192.168.50.15'
      },
      {
        id: 'node/pve-01',
        name: 'pve-01 (EliteDesk 800 G4 Mini)',
        role: 'cluster-node',
        hardware: 'HP EliteDesk 800 G4 Mini (Intel i7-8700T, 32GB)',
        status: 'online',
        cpuUsage: 24,
        cpuCores: 6,
        memUsage: 68,
        memTotalGb: 32,
        diskUsage: 45,
        diskTotalGb: 1000,
        uptime: '68d 14h',
        loadAverage: [1.35, 1.42, 1.30],
        ip: '192.168.50.11'
      },
      {
        id: 'node/pve-02',
        name: 'pve-02 (EliteDesk 800 G4 Mini)',
        role: 'cluster-node',
        hardware: 'HP EliteDesk 800 G4 Mini (Intel i7-8700T, 32GB)',
        status: 'online',
        cpuUsage: 31,
        cpuCores: 6,
        memUsage: 74,
        memTotalGb: 32,
        diskUsage: 52,
        diskTotalGb: 1000,
        uptime: '68d 14h',
        loadAverage: [1.85, 1.70, 1.62],
        ip: '192.168.50.12'
      },
      {
        id: 'node/pve-03',
        name: 'pve-03 (EliteDesk 800 G4 Mini)',
        role: 'cluster-node',
        hardware: 'HP EliteDesk 800 G4 Mini (Intel i7-8700T, 32GB)',
        status: 'online',
        cpuUsage: 28,
        cpuCores: 6,
        memUsage: 62,
        memTotalGb: 32,
        diskUsage: 41,
        diskTotalGb: 1000,
        uptime: '68d 14h',
        loadAverage: [1.45, 1.50, 1.48],
        ip: '192.168.50.13'
      }
    ];

    this.botFarmBots = [
      {
        id: 'konderi',
        name: 'Konderi Main Bot',
        partner: 'Konderi',
        port: 8080,
        url: 'http://192.168.99.15:8080',
        status: 'running',
        strategy: 'KonderiAuto v4',
        timeframe: '5m',
        dryRun: false,
        openTrades: 3,
        maxTrades: 5,
        stakeAmount: 150,
        winRatePercent: 68.4,
        totalProfitUsdt: 412.50,
        totalTrades: 124,
        lastTradeTime: '12m ago'
      },
      {
        id: 'konderi_dynamic',
        name: 'Konderi Dynamic',
        partner: 'Konderi',
        port: 8081,
        url: 'http://192.168.99.15:8081',
        status: 'running',
        strategy: 'KonderiAuto v4',
        timeframe: '5m',
        dryRun: false,
        openTrades: 2,
        maxTrades: 4,
        stakeAmount: 200,
        winRatePercent: 71.2,
        totalProfitUsdt: 589.20,
        totalTrades: 158,
        lastTradeTime: '4m ago'
      },
      {
        id: 'tehoz',
        name: 'Tehoz Breakout',
        partner: 'Tehoz',
        port: 8090,
        url: 'http://192.168.99.15:8090',
        status: 'running',
        strategy: 'AggressiveBreakoutStrategy',
        timeframe: '15m',
        dryRun: false,
        openTrades: 1,
        maxTrades: 3,
        stakeAmount: 100,
        winRatePercent: 62.8,
        totalProfitUsdt: 294.10,
        totalTrades: 92,
        lastTradeTime: '38m ago'
      },
      {
        id: 'zeller',
        name: 'Zeller Trend',
        partner: 'Zeller',
        port: 8100,
        url: 'http://192.168.99.15:8100',
        status: 'running',
        strategy: 'SupertrendMacdStrategy',
        timeframe: '1h',
        dryRun: false,
        openTrades: 2,
        maxTrades: 3,
        stakeAmount: 120,
        winRatePercent: 65.0,
        totalProfitUsdt: 345.80,
        totalTrades: 86,
        lastTradeTime: '1h 14m ago'
      },
      {
        id: 'coali',
        name: 'Coali Macd',
        partner: 'Coali',
        port: 8110,
        url: 'http://192.168.99.15:8110',
        status: 'running',
        strategy: 'SupertrendMacdStrategy',
        timeframe: '1h',
        dryRun: false,
        openTrades: 1,
        maxTrades: 3,
        stakeAmount: 100,
        winRatePercent: 64.2,
        totalProfitUsdt: 278.40,
        totalTrades: 78,
        lastTradeTime: '2h 05m ago'
      }
    ];

    this.proxmoxVms = [
      {
        vmid: 100,
        name: 'k8s-cp-01',
        node: 'pve-alpha',
        type: 'qemu',
        status: 'running',
        cpuUsage: 8,
        memUsage: 45,
        memTotalMb: 8192,
        diskUsageMb: 24500,
        uptime: '68d 12h',
        ip: '192.168.1.100',
        tags: ['k8s', 'control-plane', 'etcd']
      },
      {
        vmid: 101,
        name: 'k8s-worker-01',
        node: 'pve-alpha',
        type: 'qemu',
        status: 'running',
        cpuUsage: 34,
        memUsage: 68,
        memTotalMb: 16384,
        diskUsageMb: 52000,
        uptime: '68d 12h',
        ip: '192.168.1.101',
        tags: ['k8s', 'worker', 'inference']
      },
      {
        vmid: 102,
        name: 'k8s-worker-02',
        node: 'pve-beta',
        type: 'qemu',
        status: 'running',
        cpuUsage: 29,
        memUsage: 61,
        memTotalMb: 16384,
        diskUsageMb: 48000,
        uptime: '45d 01h',
        ip: '192.168.1.102',
        tags: ['k8s', 'worker', 'monitoring']
      },
      {
        vmid: 200,
        name: 'ai-worker-gpu1',
        node: 'pve-alpha',
        type: 'qemu',
        status: 'running',
        cpuUsage: 45,
        memUsage: 82,
        memTotalMb: 32768,
        diskUsageMb: 120000,
        uptime: '18d 08h',
        ip: '192.168.1.50',
        tags: ['ai', 'nvidia-passthrough', 'ollama']
      },
      {
        vmid: 201,
        name: 'ai-worker-gpu2',
        node: 'pve-beta',
        type: 'qemu',
        status: 'running',
        cpuUsage: 62,
        memUsage: 88,
        memTotalMb: 49152,
        diskUsageMb: 210000,
        uptime: '22d 15h',
        ip: '192.168.1.51',
        tags: ['ai', 'a100-sxm', 'vllm']
      },
      {
        vmid: 300,
        name: 'truenas-zfs',
        node: 'pve-gamma',
        type: 'lxc',
        status: 'running',
        cpuUsage: 5,
        memUsage: 52,
        memTotalMb: 16384,
        diskUsageMb: 85000,
        uptime: '31d 18h',
        ip: '192.168.1.30',
        tags: ['storage', 'nfs', 'zfs']
      },
      {
        vmid: 400,
        name: 'dev-sandbox',
        node: 'pve-gamma',
        type: 'qemu',
        status: 'stopped',
        cpuUsage: 0,
        memUsage: 0,
        memTotalMb: 8192,
        diskUsageMb: 18000,
        uptime: '0',
        ip: '192.168.1.40',
        tags: ['dev', 'lab']
      }
    ];

    this.k8sNodes = [
      {
        name: 'k8s-cp-01',
        role: 'control-plane',
        status: 'Ready',
        cpuPercent: 12,
        memPercent: 44,
        podCount: 14,
        kubeletVersion: 'v1.31.1'
      },
      {
        name: 'k8s-worker-01',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 38,
        memPercent: 67,
        podCount: 22,
        kubeletVersion: 'v1.31.1'
      },
      {
        name: 'k8s-worker-02',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 31,
        memPercent: 59,
        podCount: 18,
        kubeletVersion: 'v1.31.1'
      }
    ];

    this.k8sPods = [
      {
        name: 'vllm-deepseek-r1-7d8b9-x2k4p',
        namespace: 'ai-workloads',
        status: 'Running',
        restarts: 0,
        age: '12d',
        cpuMillicores: 1450,
        memMb: 8200,
        node: 'k8s-worker-01'
      },
      {
        name: 'ollama-cluster-daemon-4z89q',
        namespace: 'ai-workloads',
        status: 'Running',
        restarts: 0,
        age: '18d',
        cpuMillicores: 950,
        memMb: 4100,
        node: 'k8s-worker-01'
      },
      {
        name: 'cloudflared-tunnel-67df9-m5p9a',
        namespace: 'cloudflare',
        status: 'Running',
        restarts: 0,
        age: '34d',
        cpuMillicores: 45,
        memMb: 128,
        node: 'k8s-worker-02'
      },
      {
        name: 'nexus-dashboard-69d4b-7c4l2',
        namespace: 'default',
        status: 'Running',
        restarts: 0,
        age: '4d',
        cpuMillicores: 80,
        memMb: 210,
        node: 'k8s-worker-02'
      },
      {
        name: 'ingress-nginx-controller-89bf-q9w1',
        namespace: 'ingress-nginx',
        status: 'Running',
        restarts: 0,
        age: '42d',
        cpuMillicores: 110,
        memMb: 320,
        node: 'k8s-cp-01'
      },
      {
        name: 'prometheus-server-54d9b-w7q4l',
        namespace: 'monitoring',
        status: 'Running',
        restarts: 0,
        age: '42d',
        cpuMillicores: 340,
        memMb: 1850,
        node: 'k8s-worker-02'
      },
      {
        name: 'grafana-core-86c4f-9q2b8',
        namespace: 'monitoring',
        status: 'Running',
        restarts: 0,
        age: '42d',
        cpuMillicores: 65,
        memMb: 410,
        node: 'k8s-worker-02'
      }
    ];

    this.k8sDeployments = [
      {
        name: 'vllm-deepseek-r1',
        namespace: 'ai-workloads',
        replicasReady: 1,
        replicasDesired: 1,
        image: 'vllm/vllm-openai:v0.6.3',
        lastUpdated: '12d ago'
      },
      {
        name: 'ollama-cluster-daemon',
        namespace: 'ai-workloads',
        replicasReady: 1,
        replicasDesired: 1,
        image: 'ollama/ollama:0.5.4',
        lastUpdated: '18d ago'
      },
      {
        name: 'cloudflared-tunnel',
        namespace: 'cloudflare',
        replicasReady: 2,
        replicasDesired: 2,
        image: 'cloudflare/cloudflared:latest',
        lastUpdated: '34d ago'
      },
      {
        name: 'nexus-dashboard',
        namespace: 'default',
        replicasReady: 2,
        replicasDesired: 2,
        image: 'nexus/management-platform:latest',
        lastUpdated: 'Just now'
      }
    ];

    this.aiWorkers = [
      {
        id: 'worker-1',
        name: 'AI-Node-01 (Ollama)',
        host: '192.168.1.50:11434',
        status: 'online',
        engine: 'Ollama',
        gpus: [
          {
            id: 0,
            name: 'NVIDIA GeForce RTX 4090 (24GB)',
            vramUsedMb: 19850,
            vramTotalMb: 24576,
            utilizationPercent: 78,
            temperatureC: 58,
            powerWatts: 285,
            powerLimitWatts: 450
          }
        ],
        loadedModels: [
          {
            name: 'llama3.3:70b-instruct-q4_K_M',
            sizeGb: 42.5,
            vramUsageMb: 19200,
            quantization: 'Q4_K_M',
            contextLength: 131072
          },
          {
            name: 'nomic-embed-text:latest',
            sizeGb: 0.6,
            vramUsageMb: 650,
            quantization: 'F16',
            contextLength: 8192
          }
        ]
      },
      {
        id: 'worker-2',
        name: 'AI-Node-02 (vLLM)',
        host: '192.168.1.51:8000',
        status: 'online',
        engine: 'vLLM',
        gpus: [
          {
            id: 0,
            name: 'NVIDIA A100-SXM4-80GB HBM2e',
            vramUsedMb: 43200,
            vramTotalMb: 81920,
            utilizationPercent: 86,
            temperatureC: 52,
            powerWatts: 310,
            powerLimitWatts: 400
          }
        ],
        loadedModels: [
          {
            name: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
            sizeGb: 32.8,
            vramUsageMb: 43200,
            quantization: 'AWQ-4bit',
            contextLength: 65536
          }
        ]
      }
    ];
  }

  // Generate snapshot with slight live variations
  public getSnapshot(authSession?: any): FullTelemetrySnapshot {
    // Add realistic subtle jitter to live metrics
    this.wanLatency = Number((4.5 + Math.random() * 1.8).toFixed(1));
    const dlSpeed = Number((942 + Math.random() * 24).toFixed(1));
    const ulSpeed = Number((935 + Math.random() * 18).toFixed(1));

    // Slight fluctuations
    this.udm.cpuUsage = Math.min(65, Math.max(12, Math.round(this.udm.cpuUsage + (Math.random() * 4 - 2))));
    this.aiWorkers[0].gpus[0].utilizationPercent = Math.min(99, Math.max(45, Math.round(this.aiWorkers[0].gpus[0].utilizationPercent + (Math.random() * 6 - 3))));
    this.aiWorkers[0].gpus[0].temperatureC = Math.min(74, Math.max(52, Math.round(this.aiWorkers[0].gpus[0].temperatureC + (Math.random() * 2 - 1))));

    // Calculate active PoE
    const activePoE = Number(
      this.aruba.ports
        .filter((p) => p.poeStatus === 'delivering')
        .reduce((sum, p) => sum + p.poeWatts, 0)
        .toFixed(1)
    );
    this.aruba.poeActiveWatts = activePoE;
    this.aruba.poeRemainingWatts = Number((this.aruba.poeTotalBudgetWatts - activePoE).toFixed(1));

    const overview: SystemOverview = {
      status: 'healthy',
      wan: {
        ip: '85.156.92.144',
        provider: 'Telia Fiber 1000/1000M',
        latencyMs: this.wanLatency,
        downloadMbps: dlSpeed,
        uploadMbps: ulSpeed,
        packetLossPercent: 0.0
      },
      cloudflareTunnel: {
        status: 'healthy',
        tunnelId: 'd3b07384-d113-4632-a5e2-8b94157d74f2',
        tunnelName: 'nexus-home-edge',
        pop: 'HEL (Helsinki)',
        activeConnections: 4,
        ingressUrl: 'https://dashboard.konderi.fi'
      },
      authSession: authSession || {
        type: 'local_pin',
        email: 'operator@homelab.local',
        name: 'Operator (LAN / WifiMan)',
        role: 'admin',
        authenticated: true
      },
      vpnStatus: {
        wifimanActive: true,
        clientIp: '192.168.60.10',
        connectedDevices: 1
      },
      quickStats: {
        totalDevices: this.clients.length + 5,
        totalVms: this.proxmoxVms.length,
        totalPods: this.k8sPods.length,
        totalGpus: 2,
        activePoEWatts: activePoE
      }
    };

    return {
      timestamp: new Date().toISOString(),
      overview,
      udm: { ...this.udm },
      u7Mesh: { ...this.u7Mesh },
      clients: [...this.clients],
      aruba: { ...this.aruba, ports: [...this.aruba.ports] },
      proxmoxNodes: [...this.proxmoxNodes],
      proxmoxVms: [...this.proxmoxVms],
      k8sNodes: [...this.k8sNodes],
      k8sPods: [...this.k8sPods],
      k8sDeployments: [...this.k8sDeployments],
      aiWorkers: [...this.aiWorkers],
      botFarmBots: [...this.botFarmBots]
    };
  }

  // Manage Aruba Switch Port
  public powerCycleArubaPort(portNumber: number): { success: boolean; message: string } {
    const port = this.aruba.ports.find((p) => p.portNumber === portNumber);
    if (!port) return { success: false, message: `Port ${portNumber} not found` };
    if (!port.poeCapable) return { success: false, message: `Port ${portNumber} is not PoE capable` };

    const oldWatts = port.poeWatts;
    port.poeStatus = 'searching';
    port.poeWatts = 0;
    port.linkStatus = 'down';

    // Simulate power recovery after 4 seconds
    setTimeout(() => {
      port.poeStatus = 'delivering';
      port.poeWatts = oldWatts || 15.0;
      port.linkStatus = 'up';
    }, 4000);

    return { success: true, message: `PoE power cycle initiated on Port ${portNumber} (${port.connectedDevice || port.name})` };
  }

  public toggleArubaPort(portNumber: number, enabled: boolean): { success: boolean; message: string } {
    const port = this.aruba.ports.find((p) => p.portNumber === portNumber);
    if (!port) return { success: false, message: `Port ${portNumber} not found` };

    port.enabled = enabled;
    port.linkStatus = enabled ? 'up' : 'down';
    if (!enabled) {
      port.poeStatus = 'disabled';
      port.poeWatts = 0;
    } else if (port.poeCapable) {
      port.poeStatus = 'delivering';
      port.poeWatts = 14.5;
    }

    return { success: true, message: `Port ${portNumber} ${enabled ? 'enabled' : 'disabled'}` };
  }

  // Manage Proxmox VM
  public setVmState(vmid: number, action: 'start' | 'stop' | 'reboot'): { success: boolean; message: string } {
    const vm = this.proxmoxVms.find((v) => v.vmid === vmid);
    if (!vm) return { success: false, message: `VM ${vmid} not found` };

    if (action === 'start') {
      vm.status = 'running';
      vm.cpuUsage = 15;
      vm.uptime = 'Just started';
    } else if (action === 'stop') {
      vm.status = 'stopped';
      vm.cpuUsage = 0;
      vm.uptime = '0';
    } else if (action === 'reboot') {
      vm.status = 'running';
      vm.uptime = 'Rebooted just now';
    }

    return { success: true, message: `VM ${vmid} (${vm.name}) ${action} executed successfully` };
  }

  // Manage Kubernetes Deployment
  public restartK8sDeployment(name: string, namespace: string): { success: boolean; message: string } {
    const dep = this.k8sDeployments.find((d) => d.name === name && d.namespace === namespace);
    if (!dep) return { success: false, message: `Deployment ${name} in ${namespace} not found` };

    dep.lastUpdated = 'Just now (rollout restart)';
    // Update matching pods age
    this.k8sPods.forEach((p) => {
      if (p.name.startsWith(name)) {
        p.age = '10s';
        p.restarts += 1;
      }
    });

    return { success: true, message: `Deployment ${namespace}/${name} rollout restart triggered` };
  }

  // AI Inference Benchmark
  public runAiBenchmark(model: string, prompt: string): BenchmarkResult {
    const isBig = model.includes('70b') || model.includes('32b');
    const tokens = Math.floor(80 + Math.random() * 120);
    const speed = isBig ? Number((48 + Math.random() * 14).toFixed(1)) : Number((95 + Math.random() * 25).toFixed(1));
    const firstTokenMs = Number((140 + Math.random() * 60).toFixed(0));
    const totalTime = Number((tokens / speed).toFixed(2));

    this.lastBenchmark = {
      prompt,
      model,
      tokensGenerated: tokens,
      totalTimeSec: totalTime,
      tokensPerSec: speed,
      timeToFirstTokenMs: Number(firstTokenMs),
      timestamp: new Date().toISOString()
    };

    return this.lastBenchmark;
  }

  // UniFi Client Block/Unblock
  public toggleClientBlock(clientId: string): { success: boolean; message: string; blocked: boolean } {
    const client = this.clients.find((c) => c.id === clientId);
    if (!client) return { success: false, message: 'Client not found', blocked: false };

    client.blocked = !client.blocked;
    return {
      success: true,
      message: `Client ${client.name} ${client.blocked ? 'blocked' : 'unblocked'}`,
      blocked: client.blocked
    };
  }

  // Restart AP
  public restartAccessPoint(): { success: boolean; message: string } {
    this.u7Mesh.uptime = 'Restarting...';
    setTimeout(() => {
      this.u7Mesh.uptime = '1m 20s';
    }, 5000);
    return { success: true, message: 'U7 Mesh AP reboot signal transmitted' };
  }
}

export const simulator = new TelemetrySimulator();
