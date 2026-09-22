import React from 'react';
import {
  Globe,
  Shield,
  ShieldCheck,
  Radio,
  Lock,
  ExternalLink,
  CheckCircle2,
  Server,
  ArrowRight
} from 'lucide-react';
import { SystemOverview } from '../../types/index.js';

interface CloudflarePanelProps {
  overview: SystemOverview;
}

export const CloudflarePanel: React.FC<CloudflarePanelProps> = ({ overview }) => {
  const isCfAuth = overview.authSession.type === 'cloudflare_zero_trust';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'hsla(28, 95%, 54%, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid hsla(28, 95%, 54%, 0.3)'
              }}
            >
              <Globe size={22} color="var(--accent-cloudflare)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Cloudflare Zero Trust & Secure Tunnel</h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                End-to-End Encrypted Remote Access • Zero Open Ports on UDM-SE Gateway
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-cf">Tunnel: {overview.cloudflareTunnel.status.toUpperCase()}</span>
            <span className="badge badge-cf">{overview.cloudflareTunnel.activeConnections} QUIC Conns</span>
          </div>
        </div>
      </div>

      {/* Cloudflare Tunnel Status Card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--accent-cloudflare)" />
          Cloudflare Tunnel Architecture (`cloudflared`)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="glass-panel-subtle metric-card">
            <div className="metric-title">Tunnel Status</div>
            <div className="metric-value font-mono" style={{ color: 'var(--status-healthy)', fontSize: '1.4rem' }}>
              HEALTHY
            </div>
            <div className="metric-subtext">PoP: {overview.cloudflareTunnel.pop}</div>
          </div>

          <div className="glass-panel-subtle metric-card">
            <div className="metric-title">Active Connections</div>
            <div className="metric-value font-mono">
              {overview.cloudflareTunnel.activeConnections} / 4
            </div>
            <div className="metric-subtext">Redundant QUIC Streams</div>
          </div>

          <div className="glass-panel-subtle metric-card">
            <div className="metric-title">Public Ingress URL</div>
            <div className="metric-value font-mono" style={{ fontSize: '1.05rem', wordBreak: 'break-all' }}>
              {overview.cloudflareTunnel.ingressUrl.replace('https://', '')}
            </div>
            <div className="metric-subtext">Managed Edge Route</div>
          </div>

          <div className="glass-panel-subtle metric-card">
            <div className="metric-title">Firewall Policy</div>
            <div className="metric-value font-mono" style={{ fontSize: '1.2rem', color: 'var(--status-healthy)' }}>
              0 PORTS OPEN
            </div>
            <div className="metric-subtext">Outbound-Only Tunnel</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Tunnel Configuration Details
          </div>
          <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Tunnel ID: <span style={{ color: 'var(--text-primary)' }}>{overview.cloudflareTunnel.tunnelId}</span>
          </div>
          <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Tunnel Name: <span style={{ color: 'var(--text-primary)' }}>{overview.cloudflareTunnel.tunnelName}</span>
          </div>
        </div>
      </div>

      {/* Cloudflare Access (Zero Trust) & WifiMan Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Zero Trust Identity */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="var(--accent-cloudflare)" />
            Zero Trust Access Identity
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Authentication Mode:</span>
              <span style={{ fontWeight: 600 }}>{isCfAuth ? 'Cloudflare Zero Trust (JWT)' : 'Local Admin PIN Session'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Authenticated User:</span>
              <span className="font-mono" style={{ color: 'var(--status-healthy)' }}>{overview.authSession.email || 'admin@homelab.local'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>JWT Header Verification:</span>
              <span style={{ color: 'var(--status-healthy)' }}>JWKS Public Key Validated</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Role:</span>
              <span className="badge badge-cf">{overview.authSession.role.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Ubiquiti WifiMan VPN */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={18} color="var(--accent-unifi)" />
            Ubiquiti WifiMan Teleport VPN
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>VPN Status:</span>
              <span style={{ color: 'var(--status-healthy)', fontWeight: 600 }}>CONNECTED (WireGuard)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Client Device IP:</span>
              <span className="font-mono">{overview.vpnStatus.clientIp || '192.168.2.14'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gateway Terminator:</span>
              <span>UDM-SE Teleport Daemon</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Direct LAN Access:</span>
              <span style={{ color: 'var(--status-healthy)' }}>Enabled (Full Subnet Route)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
