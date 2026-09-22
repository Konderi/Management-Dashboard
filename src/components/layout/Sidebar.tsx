import React from 'react';
import {
  Network,
  Wifi,
  Server,
  Layers,
  Cpu,
  Shield,
  Sliders,
  Share2,
  Zap,
  Activity
} from 'lucide-react';
import { FullTelemetrySnapshot } from '../../types/index.js';

export type TabType = 'topology' | 'network' | 'switch' | 'proxmox' | 'k8s' | 'ai' | 'botfarm' | 'cloudflare' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  snapshot?: FullTelemetrySnapshot | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  snapshot
}) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.ReactNode; badge?: string; color: string }> = [
    {
      id: 'topology',
      label: 'Topology Map',
      icon: <Share2 size={18} />,
      color: 'var(--accent-unifi)'
    },
    {
      id: 'network',
      label: 'UniFi Gateway & U7',
      icon: <Wifi size={18} />,
      badge: `${snapshot?.u7Mesh.clientsConnected || 14} dev`,
      color: 'var(--accent-unifi)'
    },
    {
      id: 'switch',
      label: 'Aruba 2530 PoE+',
      icon: <Network size={18} />,
      badge: `${snapshot?.aruba.poeActiveWatts || 27.6}W`,
      color: 'var(--accent-aruba)'
    },
    {
      id: 'proxmox',
      label: 'Proxmox Cluster',
      icon: <Server size={18} />,
      badge: `${snapshot?.proxmoxVms.filter((v) => v.status === 'running').length || 6} VMs`,
      color: 'var(--accent-proxmox)'
    },
    {
      id: 'k8s',
      label: 'Kubernetes',
      icon: <Layers size={18} />,
      badge: `${snapshot?.k8sPods.length || 7} pods`,
      color: 'var(--accent-k8s)'
    },
    {
      id: 'ai',
      label: 'AI Worker Nodes',
      icon: <Cpu size={18} />,
      badge: 'Dual GPU',
      color: 'var(--accent-ai)'
    },
    {
      id: 'botfarm',
      label: 'BotFarm Trading',
      icon: <Activity size={18} />,
      badge: '5 Bots',
      color: 'var(--status-healthy)'
    },
    {
      id: 'cloudflare',
      label: 'Cloudflare & VPN',
      icon: <Shield size={18} />,
      badge: 'Zero Trust',
      color: 'var(--accent-cloudflare)'
    },
    {
      id: 'settings',
      label: 'Integrations',
      icon: <Sliders size={18} />,
      color: 'var(--text-secondary)'
    }
  ];

  const poePercent = snapshot?.aruba
    ? Math.round((snapshot.aruba.poeActiveWatts / snapshot.aruba.poeTotalBudgetWatts) * 100)
    : 41;

  return (
    <aside
      className="glass-panel"
      style={{
        width: '260px',
        minWidth: '260px',
        margin: '1rem 0 1rem 1rem',
        padding: '1.25rem 0.85rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ padding: '0 0.65rem 0.65rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          MANAGEMENT MODULES
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: isActive ? `1px solid ${item.color}` : '1px solid transparent',
                background: isActive ? 'var(--bg-glass-active)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
                fontWeight: isActive ? 600 : 400,
                boxShadow: isActive ? `0 0 14px -3px ${item.color}33` : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-glass-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: isActive ? item.color : 'var(--text-muted)', display: 'flex' }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '0.86rem' }}>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? `${item.color}22` : 'var(--bg-surface)',
                    color: isActive ? item.color : 'var(--text-muted)',
                    border: `1px solid ${isActive ? item.color + '44' : 'var(--border-subtle)'}`
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hardware Mini Telemetry Card */}
      <div
        className="glass-panel-subtle"
        style={{
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Zap size={14} color="var(--accent-aruba)" />
            Aruba PoE Load
          </span>
          <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {snapshot?.aruba.poeActiveWatts || 27.6}W / 67W
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${poePercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-aruba), hsl(45, 100%, 50%))',
              borderRadius: '3px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>U7 Mesh + Cam + IoT</span>
          <span className="font-mono">{poePercent}%</span>
        </div>
      </div>
    </aside>
  );
};
