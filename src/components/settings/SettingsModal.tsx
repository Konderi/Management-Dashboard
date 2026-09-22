import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Loader2,
  AlertCircle,
  Sliders,
  Network,
  Zap,
  Server,
  Layers,
  Cpu,
  Globe,
  Lock
} from 'lucide-react';
import { IntegrationConfig } from '../../types/index.js';
import { api } from '../../services/api.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [config, setConfig] = useState<IntegrationConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<Record<string, { loading: boolean; success?: boolean; message?: string }>>({});

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getConfig().then((cfg) => {
        setConfig(cfg);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (service: string) => {
    setTestStatus((prev) => ({ ...prev, [service]: { loading: true } }));
    try {
      const res = await api.testConnection(service);
      setTestStatus((prev) => ({
        ...prev,
        [service]: { loading: false, success: res.success, message: res.message }
      }));
    } catch (err: any) {
      setTestStatus((prev) => ({
        ...prev,
        [service]: { loading: false, success: false, message: err.message }
      }));
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.updateConfig(config);
      setSaving(false);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          background: 'var(--bg-surface-elevated)',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sliders size={20} color="var(--accent-unifi)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Integrations & Credentials Manager</h2>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-icon" style={{ background: 'transparent', border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        {loading || !config ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 size={32} className="animate-spin" color="var(--accent-unifi)" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Mode Switcher */}
            <div className="glass-panel-subtle" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Operating Mode</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Switch between High-Fidelity Simulation (safe playground) and Live Hardware Control.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, mode: 'simulation' })}
                  className={`btn btn-sm ${config.mode === 'simulation' ? 'btn-primary' : ''}`}
                >
                  Simulation Mode
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, mode: 'live' })}
                  className={`btn btn-sm ${config.mode === 'live' ? 'btn-primary' : ''}`}
                  style={{
                    background: config.mode === 'live' ? 'var(--status-healthy)' : 'var(--bg-surface)',
                    borderColor: config.mode === 'live' ? 'var(--status-healthy)' : 'var(--border-subtle)'
                  }}
                >
                  Live Hardware Mode
                </button>
              </div>
            </div>

            {/* Ubiquiti UDM-SE */}
            <div className="glass-panel-subtle" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Network size={16} color="var(--accent-unifi)" />
                  Ubiquiti Dream Machine SE (UDM-SE)
                </div>
                <button
                  onClick={() => handleTestConnection('unifi')}
                  disabled={testStatus.unifi?.loading}
                  className="btn btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  {testStatus.unifi?.loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>Test Connection</span>
                </button>
              </div>

              {testStatus.unifi?.message && (
                <div style={{ fontSize: '0.78rem', color: testStatus.unifi.success ? 'var(--status-healthy)' : 'var(--status-danger)', marginBottom: '0.65rem' }}>
                  {testStatus.unifi.message}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Host / IP</label>
                  <input
                    type="text"
                    value={config.unifi.host}
                    onChange={(e) => setConfig({ ...config, unifi: { ...config.unifi, host: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Username</label>
                  <input
                    type="text"
                    value={config.unifi.user}
                    onChange={(e) => setConfig({ ...config, unifi: { ...config.unifi, user: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    onChange={(e) => setConfig({ ...config, unifi: { ...config.unifi, pass: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Aruba 2530-8G-PoE */}
            <div className="glass-panel-subtle" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Zap size={16} color="var(--accent-aruba)" />
                  Aruba 2530-8G-PoE Switch
                </div>
                <button
                  onClick={() => handleTestConnection('aruba')}
                  disabled={testStatus.aruba?.loading}
                  className="btn btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  {testStatus.aruba?.loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>Test Connection</span>
                </button>
              </div>

              {testStatus.aruba?.message && (
                <div style={{ fontSize: '0.78rem', color: testStatus.aruba.success ? 'var(--status-healthy)' : 'var(--status-danger)', marginBottom: '0.65rem' }}>
                  {testStatus.aruba.message}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Switch IP</label>
                  <input
                    type="text"
                    value={config.aruba.host}
                    onChange={(e) => setConfig({ ...config, aruba: { ...config.aruba, host: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Username (Manager)</label>
                  <input
                    type="text"
                    value={config.aruba.user}
                    onChange={(e) => setConfig({ ...config, aruba: { ...config.aruba, user: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    onChange={(e) => setConfig({ ...config, aruba: { ...config.aruba, pass: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Proxmox VE */}
            <div className="glass-panel-subtle" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Server size={16} color="var(--accent-proxmox)" />
                  Proxmox VE Cluster
                </div>
                <button
                  onClick={() => handleTestConnection('proxmox')}
                  disabled={testStatus.proxmox?.loading}
                  className="btn btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  {testStatus.proxmox?.loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>Test Connection</span>
                </button>
              </div>

              {testStatus.proxmox?.message && (
                <div style={{ fontSize: '0.78rem', color: testStatus.proxmox.success ? 'var(--status-healthy)' : 'var(--status-danger)', marginBottom: '0.65rem' }}>
                  {testStatus.proxmox.message}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Proxmox API URL</label>
                  <input
                    type="text"
                    value={config.proxmox.host}
                    onChange={(e) => setConfig({ ...config, proxmox: { ...config.proxmox, host: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>API Token User</label>
                  <input
                    type="text"
                    value={config.proxmox.tokenUser}
                    onChange={(e) => setConfig({ ...config, proxmox: { ...config.proxmox, tokenUser: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>API Token Secret (UUID)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    onChange={(e) => setConfig({ ...config, proxmox: { ...config.proxmox, tokenSecret: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {/* AI Workers (Ollama & vLLM) */}
            <div className="glass-panel-subtle" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Cpu size={16} color="var(--accent-ai)" />
                  AI Workers (Ollama & vLLM)
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleTestConnection('ollama')}
                    disabled={testStatus.ollama?.loading}
                    className="btn btn-sm"
                  >
                    Test Ollama
                  </button>
                  <button
                    onClick={() => handleTestConnection('vllm')}
                    disabled={testStatus.vllm?.loading}
                    className="btn btn-sm"
                  >
                    Test vLLM
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ollama Host</label>
                  <input
                    type="text"
                    value={config.ai.ollamaHost}
                    onChange={(e) => setConfig({ ...config, ai: { ...config.ai, ollamaHost: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>vLLM Host</label>
                  <input
                    type="text"
                    value={config.ai.vllmHost}
                    onChange={(e) => setConfig({ ...config, ai: { ...config.ai, vllmHost: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Cloudflare Zero Trust & Local Security */}
            <div className="glass-panel-subtle" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                <Globe size={16} color="var(--accent-cloudflare)" />
                Cloudflare Zero Trust & Local Security
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cloudflare Team Name</label>
                  <input
                    type="text"
                    value={config.cloudflare.teamName}
                    onChange={(e) => setConfig({ ...config, cloudflare: { ...config.cloudflare, teamName: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Zero Trust Audience Tag (AUD)</label>
                  <input
                    type="text"
                    value={config.cloudflare.zeroTrustAud}
                    onChange={(e) => setConfig({ ...config, cloudflare: { ...config.cloudflare, zeroTrustAud: e.target.value } })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Local LAN Admin PIN</label>
                  <input
                    type="text"
                    value={config.localAuthPin}
                    onChange={(e) => setConfig({ ...config, localAuthPin: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={onClose} className="btn" disabled={saving}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving || loading}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
