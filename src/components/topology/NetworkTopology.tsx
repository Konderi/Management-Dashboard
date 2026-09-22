import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  Globe,
  Wifi,
  Network,
  Server,
  Layers,
  Cpu,
  Zap,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { FullTelemetrySnapshot } from '../../types/index.js';

interface TopologyProps {
  snapshot: FullTelemetrySnapshot;
  onNavigateTab: (tab: any) => void;
}

interface ConnectionLine {
  id: string;
  d: string;
  color: string;
}

export const NetworkTopology: React.FC<TopologyProps> = ({ snapshot, onNavigateTab }) => {
  const [selectedNode, setSelectedNode] = useState<string>('udm');
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<ConnectionLine[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 1200, height: 600 });

  const nodes = [
    {
      id: 'wan',
      title: 'Internet / WAN',
      subtitle: `${snapshot.overview.wan.provider} (${snapshot.overview.wan.latencyMs}ms)`,
      icon: <Globe size={22} color="var(--accent-unifi)" />,
      badge: '1000/1000 Mbps',
      color: 'var(--accent-unifi)',
      details: `Public IP: ${snapshot.overview.wan.ip} • Packet Loss: ${snapshot.overview.wan.packetLossPercent}% • Cloudflare Tunnel Active (dashboard.konderi.fi)`
    },
    {
      id: 'udm',
      title: 'Ubiquiti UDM-SE',
      subtitle: 'Gateway & Controller',
      icon: <Network size={22} color="var(--accent-unifi)" />,
      badge: '2.5G WAN / 10G SFP+',
      color: 'var(--accent-unifi)',
      details: `CPU: ${snapshot.udm.cpuUsage}% • RAM: ${snapshot.udm.memUsage}% • Temp: ${snapshot.udm.tempC}°C • Uptime: ${snapshot.udm.uptime}`,
      tab: 'network'
    },
    {
      id: 'aruba',
      title: 'Aruba 2530-8G-PoE+',
      subtitle: 'Managed PoE+ Switch',
      icon: <Zap size={22} color="var(--accent-aruba)" />,
      badge: `${snapshot.aruba.poeActiveWatts}W / 67W PoE`,
      color: 'var(--accent-aruba)',
      details: `8x GbE PoE+ Ports • Active PoE Draw: ${snapshot.aruba.poeActiveWatts}W • Firmware: ${snapshot.aruba.firmware}`,
      tab: 'switch'
    },
    {
      id: 'u7mesh',
      title: 'UniFi U7 Mesh AP',
      subtitle: 'Wi-Fi 7 (802.11be)',
      icon: <Wifi size={22} color="var(--accent-unifi)" />,
      badge: `${snapshot.u7Mesh.clientsConnected} Clients (4x Wi-Fi 7)`,
      color: 'var(--accent-unifi)',
      details: `Bands: 6GHz (320MHz) / 5GHz / 2.4GHz • Powered by Aruba Port 1 (${snapshot.aruba.ports[0]?.poeWatts || 18.4}W)`,
      tab: 'network'
    },
    {
      id: 'control-plane',
      title: 'Control Node (HP Prodesk)',
      subtitle: 'Dedicated Standalone Host',
      icon: <Server size={22} color="var(--accent-proxmox)" />,
      badge: 'pve-control (VLAN 50/20)',
      color: 'var(--accent-proxmox)',
      details: 'HP Prodesk 600 G3 (192.168.50.15) • Hosts NEXUS Dashboard, Cloudflare Tunnel, Prometheus, Grafana, and AI Agents • Isolated from Compute Cluster',
      tab: 'proxmox'
    },
    {
      id: 'proxmox',
      title: '3-Node Compute Cluster',
      subtitle: 'HP EliteDesk 800 G4 Minis',
      icon: <Server size={22} color="var(--accent-proxmox)" />,
      badge: 'pve-01 / 02 / 03 (HA Quorum)',
      color: 'var(--accent-proxmox)',
      details: '3x HP EliteDesk 800 G4 Minis (pve-01, pve-02, pve-03) • 18 Cores / 96GB Total RAM • Runs Kubernetes, BotFarm Trading Fleet, and Inference Workloads',
      tab: 'proxmox'
    },
    {
      id: 'botfarm',
      title: 'BotFarm Trading Fleet',
      subtitle: 'Freqtrade Futures (VLAN 99)',
      icon: <Activity size={22} color="var(--status-healthy)" />,
      badge: '5 Bots (Konderi, Tehoz, Zeller, Coali)',
      color: 'var(--status-healthy)',
      details: '5 Autonomous Trading Bots on Bybit Futures • KonderiAuto v4, AggressiveBreakout, SupertrendMacd • VLAN 99 Isolated Network',
      tab: 'botfarm'
    },
    {
      id: 'k8s',
      title: 'Kubernetes Cluster',
      subtitle: 'Container Orchestration',
      icon: <Layers size={22} color="var(--accent-k8s)" />,
      badge: 'v1.31.1 (3 Nodes)',
      color: 'var(--accent-k8s)',
      details: `${snapshot.k8sPods.length} Pods Active • Cloudflared & Ingress-NGINX running`,
      tab: 'k8s'
    },
    {
      id: 'ai',
      title: 'AI Worker Nodes',
      subtitle: 'Ollama & vLLM Inference',
      icon: <Cpu size={22} color="var(--accent-ai)" />,
      badge: 'Dual GPU (104GB VRAM)',
      color: 'var(--accent-ai)',
      details: 'Node 01: RTX 4090 24GB (Llama 3.3 70B) • Node 02: A100 80GB (DeepSeek-R1 32B)',
      tab: 'ai'
    }
  ];

  // Dynamic Anchor Line Recalculation on Window Resize / DOM Layout Shift
  const updateConnections = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const cRect = container.getBoundingClientRect();

    setSvgSize({
      width: Math.max(container.scrollWidth, cRect.width),
      height: Math.max(container.scrollHeight, cRect.height)
    });

    const connections = [
      { from: 'wan', to: 'udm', color: 'var(--accent-unifi)' },
      { from: 'udm', to: 'aruba', color: 'var(--accent-aruba)' },
      { from: 'aruba', to: 'u7mesh', color: 'var(--accent-unifi)' },
      { from: 'aruba', to: 'control-plane', color: 'var(--accent-proxmox)' },
      { from: 'aruba', to: 'proxmox', color: 'var(--accent-proxmox)' },
      { from: 'proxmox', to: 'k8s', color: 'var(--accent-k8s)' },
      { from: 'proxmox', to: 'botfarm', color: 'var(--status-healthy)' },
      { from: 'proxmox', to: 'ai', color: 'var(--accent-ai)' }
    ];

    const computedLines: ConnectionLine[] = [];

    connections.forEach((conn) => {
      const fromEl = nodeRefs.current[conn.from];
      const toEl = nodeRefs.current[conn.to];
      if (!fromEl || !toEl) return;

      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();

      // Coordinates relative to container
      const fCenter = {
        x: fRect.left - cRect.left + container.scrollLeft + fRect.width / 2,
        y: fRect.top - cRect.top + container.scrollTop + fRect.height / 2
      };
      const tCenter = {
        x: tRect.left - cRect.left + container.scrollLeft + tRect.width / 2,
        y: tRect.top - cRect.top + container.scrollTop + tRect.height / 2
      };

      let startX: number, startY: number, endX: number, endY: number;

      // Determine best anchor sides based on relative position
      const dx = tCenter.x - fCenter.x;
      const dy = tCenter.y - fCenter.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal connection
        if (dx > 0) {
          startX = fRect.right - cRect.left + container.scrollLeft;
          startY = fCenter.y;
          endX = tRect.left - cRect.left + container.scrollLeft;
          endY = tCenter.y;
        } else {
          startX = fRect.left - cRect.left + container.scrollLeft;
          startY = fCenter.y;
          endX = tRect.right - cRect.left + container.scrollLeft;
          endY = tCenter.y;
        }
      } else {
        // Vertical / Diagonal connection
        if (dy > 0) {
          startX = fCenter.x;
          startY = fRect.bottom - cRect.top + container.scrollTop;
          endX = tCenter.x;
          endY = tRect.top - cRect.top + container.scrollTop;
        } else {
          startX = fCenter.x;
          startY = fRect.top - cRect.top + container.scrollTop;
          endX = tCenter.x;
          endY = tRect.bottom - cRect.top + container.scrollTop;
        }
      }

      // Generate smooth cubic bezier curve
      const curvature = Math.max(30, Math.min(100, Math.abs(dx) * 0.45));
      let pathD: string;

      if (Math.abs(dx) > Math.abs(dy)) {
        pathD = `M ${startX} ${startY} C ${startX + (dx > 0 ? curvature : -curvature)} ${startY}, ${endX - (dx > 0 ? curvature : -curvature)} ${endY}, ${endX} ${endY}`;
      } else {
        const vCurvature = Math.max(30, Math.min(80, Math.abs(dy) * 0.45));
        pathD = `M ${startX} ${startY} C ${startX} ${startY + (dy > 0 ? vCurvature : -vCurvature)}, ${endX} ${endY - (dy > 0 ? vCurvature : -vCurvature)}, ${endX} ${endY}`;
      }

      computedLines.push({
        id: `${conn.from}-${conn.to}`,
        d: pathD,
        color: conn.color
      });
    });

    setLines(computedLines);
  };

  useLayoutEffect(() => {
    updateConnections();
  }, [snapshot]);

  useEffect(() => {
    const handleResize = () => {
      updateConnections();
    };

    window.addEventListener('resize', handleResize);
    let observer: ResizeObserver | null = null;

    if (containerRef.current && window.ResizeObserver) {
      observer = new ResizeObserver(() => {
        updateConnections();
      });
      observer.observe(containerRef.current);
    }

    // Small timeout to ensure all fonts and DOM dimensions have stabilized
    const timer = setTimeout(updateConnections, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const currentNode = nodes.find((n) => n.id === selectedNode) || nodes[1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner & Overview */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Network size={20} color="var(--accent-unifi)" />
              Infrastructure Topology & Flow Matrix
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Real-time interconnection between UniFi Gateway, Aruba PoE Switch, U7 Mesh Wi-Fi 7, Prodesk Control Node, 3-Node EliteDesk Cluster, and AI Nodes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-unifi">WAN 1000M</span>
            <span className="badge badge-aruba">Aruba PoE 67W</span>
            <span className="badge badge-proxmox">Prodesk Control</span>
            <span className="badge badge-proxmox">3-Node Cluster</span>
            <span className="badge" style={{ background: 'hsla(152, 76%, 46%, 0.15)', color: 'var(--status-healthy)' }}>BotFarm Fleet</span>
          </div>
        </div>
      </div>

      {/* Responsive Visual Topology Diagram */}
      <div
        ref={containerRef}
        className="glass-panel"
        style={{
          padding: '2.5rem 1.75rem',
          position: 'relative',
          overflowX: 'auto',
          minHeight: '520px'
        }}
      >
        {/* Dynamic SVG Flow Lines Layer */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${svgSize.width}px`,
            height: `${svgSize.height}px`,
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {lines.map((line) => (
            <g key={line.id}>
              {/* Background Glow Path */}
              <path
                d={line.d}
                fill="none"
                stroke={line.color}
                strokeWidth="4"
                opacity="0.2"
                filter="url(#glow)"
              />
              {/* Animated Flowing Packet Path */}
              <path
                d={line.d}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                opacity="0.8"
                className="packet-path"
              />
            </g>
          ))}
        </svg>

        {/* Structured Responsive Tiered Nodes Layout */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '3.5rem',
            minWidth: '880px'
          }}
        >
          {/* TIER 1: WAN -> Gateway -> Core Switch */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            
            {/* WAN */}
            <div
              ref={(el) => { nodeRefs.current['wan'] = el; }}
              onClick={() => setSelectedNode('wan')}
              className={`glass-panel-subtle ${selectedNode === 'wan' ? 'active-node' : ''}`}
              style={{
                padding: '1.1rem',
                cursor: 'pointer',
                border: selectedNode === 'wan' ? '2px solid var(--accent-unifi)' : '1px solid var(--border-subtle)',
                boxShadow: selectedNode === 'wan' ? '0 0 20px hsla(212, 100%, 55%, 0.35)' : 'none',
                background: 'var(--bg-surface-elevated)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Globe size={20} color="var(--accent-unifi)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Internet / WAN</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Telia 1000M Fiber
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--status-healthy)', marginTop: '0.2rem' }}>
                {snapshot.overview.wan.latencyMs}ms ping • 0 ports open
              </div>
            </div>

            {/* UDM-SE */}
            <div
              ref={(el) => { nodeRefs.current['udm'] = el; }}
              onClick={() => setSelectedNode('udm')}
              className="glass-panel-subtle"
              style={{
                padding: '1.1rem',
                cursor: 'pointer',
                border: selectedNode === 'udm' ? '2px solid var(--accent-unifi)' : '1px solid var(--border-subtle)',
                boxShadow: selectedNode === 'udm' ? '0 0 20px hsla(212, 100%, 55%, 0.35)' : 'none',
                background: 'var(--bg-surface-elevated)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Network size={20} color="var(--accent-unifi)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>UDM-SE Gateway</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                2.5GbE WAN 1 • 10G SFP+
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                CPU: {snapshot.udm.cpuUsage}% • RAM: {snapshot.udm.memUsage}%
              </div>
            </div>

            {/* Aruba 2530 */}
            <div
              ref={(el) => { nodeRefs.current['aruba'] = el; }}
              onClick={() => setSelectedNode('aruba')}
              className="glass-panel-subtle"
              style={{
                padding: '1.1rem',
                cursor: 'pointer',
                border: selectedNode === 'aruba' ? '2px solid var(--accent-aruba)' : '1px solid var(--border-subtle)',
                boxShadow: selectedNode === 'aruba' ? '0 0 20px hsla(32, 100%, 50%, 0.35)' : 'none',
                background: 'var(--bg-surface-elevated)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Zap size={20} color="var(--accent-aruba)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Aruba 2530-8G-PoE</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                8x PoE+ GbE Ports
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-aruba)', marginTop: '0.2rem' }}>
                PoE: {snapshot.aruba.poeActiveWatts}W / 67W ({Math.round((snapshot.aruba.poeActiveWatts/67)*100)}%)
              </div>
            </div>

          </div>

          {/* TIER 2: Distribution Layer (Wireless + Standalone Control + 3-Node Cluster) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            
            {/* U7 Mesh */}
            <div
              ref={(el) => { nodeRefs.current['u7mesh'] = el; }}
              onClick={() => setSelectedNode('u7mesh')}
              className="glass-panel-subtle"
              style={{
                padding: '1.1rem',
                cursor: 'pointer',
                border: selectedNode === 'u7mesh' ? '2px solid var(--accent-unifi)' : '1px solid var(--border-subtle)',
                boxShadow: selectedNode === 'u7mesh' ? '0 0 20px hsla(212, 100%, 55%, 0.35)' : 'none',
                background: 'var(--bg-surface-elevated)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Wifi size={20} color="var(--accent-unifi)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>U7 Mesh (Wi-Fi 7)</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                6GHz (320M MLO) / 5GHz / 2.4GHz
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--status-healthy)', marginTop: '0.2rem' }}>
                {snapshot.u7Mesh.clientsConnected} clients ({snapshot.u7Mesh.wifi7Clients} Wi-Fi 7)
              </div>
            </div>

            {/* Standalone Control Node (HP Prodesk 600 G3) */}
            <div
              ref={(el) => { nodeRefs.current['control-plane'] = el; }}
              onClick={() => setSelectedNode('control-plane')}
              className="glass-panel-subtle"
              style={{
                padding: '1.1rem',
                cursor: 'pointer',
                border: selectedNode === 'control-plane' ? '2px solid var(--accent-proxmox)' : '1px solid var(--border-subtle)',
                boxShadow: selectedNode === 'control-plane' ? '0 0 20px hsla(24, 100%, 48%, 0.35)' : 'none',
                background: 'var(--bg-surface-elevated)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Server size={20} color="var(--accent-proxmox)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Control Node (Prodesk)</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Standalone Host • 192.168.50.15
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-unifi)', marginTop: '0.2rem' }}>
                NEXUS / Cloudflare Tunnel / Prom
              </div>
            </div>

            {/* 3-Node Compute Cluster (HP EliteDesk Minis) */}
            <div
              ref={(el) => { nodeRefs.current['proxmox'] = el; }}
              onClick={() => setSelectedNode('proxmox')}
              className="glass-panel-subtle"
              style={{
                padding: '1.1rem',
                cursor: 'pointer',
                border: selectedNode === 'proxmox' ? '2px solid var(--accent-proxmox)' : '1px solid var(--border-subtle)',
                boxShadow: selectedNode === 'proxmox' ? '0 0 20px hsla(24, 100%, 48%, 0.35)' : 'none',
                background: 'var(--bg-surface-elevated)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Server size={20} color="var(--accent-proxmox)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>3-Node Compute Cluster</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                pve-01 / 02 / 03 (EliteDesk Minis)
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--status-healthy)', marginTop: '0.2rem' }}>
                HA Quorum OK • 18 Cores / 96GB RAM
              </div>
            </div>

          </div>

          {/* TIER 3: Workloads Layer (Kubernetes + BotFarm Trading + AI Workers) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            
            {/* Kubernetes Cluster */}
            <div
              ref={(el) => { nodeRefs.current['k8s'] = el; }}
              onClick={() => setSelectedNode('k8s')}
              className="glass-panel-subtle"
              style={{
                padding: '1.1rem',
                cursor: 'pointer',
                border: selectedNode === 'k8s' ? '2px solid var(--accent-k8s)' : '1px solid var(--border-subtle)',
                boxShadow: selectedNode === 'k8s' ? '0 0 20px hsla(221, 85%, 58%, 0.35)' : 'none',
                background: 'var(--bg-surface-elevated)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Layers size={20} color="var(--accent-k8s)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kubernetes (k8s)</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                v1.31.1 (3 Cluster Nodes)
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {snapshot.k8sPods.length} Pods Active
              </div>
            </div>

            {/* BotFarm Trading Fleet */}
            <div
              ref={(el) => { nodeRefs.current['botfarm'] = el; }}
              onClick={() => setSelectedNode('botfarm')}
              className="glass-panel-subtle"
              style={{
                padding: '1.1rem',
                cursor: 'pointer',
                border: selectedNode === 'botfarm' ? '2px solid var(--status-healthy)' : '1px solid var(--border-subtle)',
                boxShadow: selectedNode === 'botfarm' ? '0 0 20px hsla(152, 76%, 46%, 0.35)' : 'none',
                background: 'var(--bg-surface-elevated)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Activity size={20} color="var(--status-healthy)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>BotFarm Trading Fleet</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                5 Freqtrade Bots • VLAN 99
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--status-healthy)', marginTop: '0.2rem' }}>
                Konderi, Tehoz, Zeller, Coali
              </div>
            </div>

            {/* AI Worker Nodes */}
            <div
              ref={(el) => { nodeRefs.current['ai'] = el; }}
              onClick={() => setSelectedNode('ai')}
              className="glass-panel-subtle"
              style={{
                padding: '1.1rem',
                cursor: 'pointer',
                border: selectedNode === 'ai' ? '2px solid var(--accent-ai)' : '1px solid var(--border-subtle)',
                boxShadow: selectedNode === 'ai' ? '0 0 20px hsla(92, 85%, 48%, 0.35)' : 'none',
                background: 'var(--bg-surface-elevated)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Cpu size={20} color="var(--accent-ai)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>AI Worker Nodes</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                RTX 4090 + A100 SXM4
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-ai)', marginTop: '0.2rem' }}>
                Ollama & vLLM (104GB VRAM)
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Selected Node Details Card */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${currentNode.color}44`
            }}
          >
            {currentNode.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{currentNode.title}</h3>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: currentNode.color, fontWeight: 600 }}>
                {currentNode.badge}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {currentNode.details}
            </p>
          </div>
        </div>

        {currentNode.tab && (
          <button
            onClick={() => onNavigateTab(currentNode.tab)}
            className="btn btn-primary"
            style={{ gap: '0.4rem' }}
          >
            <span>Open {currentNode.title} Console</span>
            <ArrowRight size={15} />
          </button>
        )}
      </div>

    </div>
  );
};
