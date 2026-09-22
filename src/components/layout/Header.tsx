import React from 'react';
import {
  ShieldCheck,
  Lock,
  Globe,
  Radio,
  Zap,
  SlidersHorizontal,
  Wifi,
  Activity,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { SystemOverview } from '../../types/index.js';

interface HeaderProps {
  overview?: SystemOverview;
  onOpenSettings: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  overview,
  onOpenSettings,
  onOpenAuthModal
}) => {
  const isCfAuth = overview?.authSession.type === 'cloudflare_zero_trust';

  return (
    <header className="glass-panel" style={{ margin: '1rem 1rem 0 1rem', padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & System Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, hsl(212, 100%, 50%), hsl(221, 85%, 56%))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px hsla(212, 100%, 55%, 0.4)'
            }}>
              <Zap size={20} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.04em' }}>NEXUS</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>// OPS-CORE</span>
              </div>
              <div className="status-indicator">
                <span className="status-dot healthy" />
                <span style={{ color: 'var(--status-healthy)', fontSize: '0.75rem', fontWeight: 600 }}>SYSTEMS OPERATIONAL</span>
              </div>
            </div>
          </div>

          <div style={{ height: '32px', width: '1px', background: 'var(--border-subtle)' }} />

          {/* WAN Telemetry Pill */}
          {overview && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-surface)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
                <Activity size={14} color="var(--accent-unifi)" />
                <span style={{ color: 'var(--text-muted)' }}>Ping:</span>
                <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{overview.wan.latencyMs}ms</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
                <ArrowDown size={14} color="var(--status-healthy)" />
                <span className="font-mono" style={{ fontWeight: 600 }}>{Math.round(overview.wan.downloadMbps)}M</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
                <ArrowUp size={14} color="var(--accent-unifi)" />
                <span className="font-mono" style={{ fontWeight: 600 }}>{Math.round(overview.wan.uploadMbps)}M</span>
              </div>
            </div>
          )}
        </div>

        {/* Security & Access Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Cloudflare Tunnel Status */}
          <div className="badge badge-cf" title="Cloudflare Tunnel active to Edge PoP">
            <Globe size={13} />
            <span>CF TUNNEL: {overview?.cloudflareTunnel.status.toUpperCase() || 'HEALTHY'}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>({overview?.cloudflareTunnel.pop || 'HEL'})</span>
          </div>

          {/* WifiMan VPN Status */}
          <div className="badge badge-unifi" title="Ubiquiti WifiMan Teleport VPN Connected">
            <Radio size={13} />
            <span>WIFIMAN VPN: ACTIVE</span>
          </div>

          {/* Authentication Badge */}
          <button
            onClick={onOpenAuthModal}
            className="btn btn-sm"
            style={{
              background: isCfAuth ? 'hsla(152, 76%, 46%, 0.12)' : 'var(--bg-surface)',
              borderColor: isCfAuth ? 'hsla(152, 76%, 46%, 0.35)' : 'var(--border-subtle)',
              gap: '0.5rem'
            }}
            title={isCfAuth ? 'Authenticated via Cloudflare Zero Trust' : 'Local Administrator PIN active'}
          >
            {isCfAuth ? <ShieldCheck size={15} color="var(--status-healthy)" /> : <Lock size={15} color="var(--accent-aruba)" />}
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
              {overview?.authSession.email || 'Local Admin'}
            </span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="btn btn-sm btn-icon"
            style={{ background: 'var(--bg-surface)' }}
            title="Integrations & Settings"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

      </div>
    </header>
  );
};
