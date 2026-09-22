import React, { useState } from 'react';
import {
  Wifi,
  Network,
  Activity,
  Radio,
  RotateCw,
  Shield,
  Smartphone,
  Laptop,
  Tv,
  Cpu,
  BarChart3,
  HardDrive
} from 'lucide-react';
import { UdmGateway, U7MeshAp, NetworkClient } from '../../types/index.js';
import { api } from '../../services/api.js';
import { QuickActionModal } from '../layout/QuickActionModal.js';

interface UdmPanelProps {
  udm: UdmGateway;
  u7Mesh: U7MeshAp;
  clients: NetworkClient[];
  onRefresh?: () => void;
}

export const UdmPanel: React.FC<UdmPanelProps> = ({ udm, u7Mesh, clients, onRefresh }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'wifi7' | 'clients'>('overview');
  const [modalAction, setModalAction] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    target: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    target: '',
    action: async () => {}
  });

  const handleRestartAp = () => {
    setModalAction({
      isOpen: true,
      title: 'Reboot Ubiquiti U7 Mesh Access Point',
      description: 'This will send a soft reboot command to the U7 Mesh AP. Connected wireless clients will momentarily roam or reconnect.',
      target: `${u7Mesh.name} (${u7Mesh.ip})`,
      action: async () => {
        await api.restartAccessPoint(u7Mesh.mac);
        if (onRefresh) onRefresh();
      }
    });
  };

  const handleToggleBlock = async (client: NetworkClient) => {
    await api.toggleClientBlock(client.id);
    if (onRefresh) onRefresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'hsla(212, 100%, 55%, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid hsla(212, 100%, 55%, 0.3)'
              }}
            >
              <Network size={22} color="var(--accent-unifi)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{udm.model}</h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                UniFi OS: <span className="font-mono">{udm.version}</span> • Uptime: <span className="font-mono">{udm.uptime}</span> • Core Temp: <span className="font-mono">{udm.tempC}°C</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedTab('overview')}
              className={`btn btn-sm ${selectedTab === 'overview' ? 'btn-primary' : ''}`}
            >
              Gateway Status
            </button>
            <button
              onClick={() => setSelectedTab('wifi7')}
              className={`btn btn-sm ${selectedTab === 'wifi7' ? 'btn-primary' : ''}`}
            >
              U7 Mesh (Wi-Fi 7)
            </button>
            <button
              onClick={() => setSelectedTab('clients')}
              className={`btn btn-sm ${selectedTab === 'clients' ? 'btn-primary' : ''}`}
            >
              Connected Clients ({clients.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Gateway Overview */}
      {selectedTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel metric-card">
              <div className="metric-title">Gateway CPU Load</div>
              <div className="metric-value" style={{ color: 'var(--accent-unifi)' }}>
                {udm.cpuUsage} %
              </div>
              <div className="metric-subtext">Quad-Core ARM Cortex-A57</div>
            </div>

            <div className="glass-panel metric-card">
              <div className="metric-title">System Memory</div>
              <div className="metric-value">
                {udm.memUsage} %
              </div>
              <div className="metric-subtext">4GB DDR4 Unified</div>
            </div>

            <div className="glass-panel metric-card">
              <div className="metric-title">WAN 1 Uplink</div>
              <div className="metric-value font-mono" style={{ fontSize: '1.25rem', color: 'var(--status-healthy)' }}>
                2.5 GbE (UP)
              </div>
              <div className="metric-subtext">{udm.wanPorts[0].ip}</div>
            </div>

            <div className="glass-panel metric-card">
              <div className="metric-title">WAN 2 (SFP+)</div>
              <div className="metric-value font-mono" style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
                10G SFP+ (STANDBY)
              </div>
              <div className="metric-subtext">Failover Configured</div>
            </div>
          </div>

          {/* DPI Traffic Breakdown */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="var(--accent-unifi)" />
              Deep Packet Inspection (DPI) Traffic Analysis
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {udm.dpi.map((item) => (
                <div key={item.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 500 }}>{item.category}</span>
                    <span className="font-mono" style={{ color: 'var(--accent-unifi)' }}>
                      {(item.bytes / 1e9).toFixed(1)} GB ({item.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent-unifi), hsl(221, 85%, 58%))',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tab 2: U7 Mesh (Wi-Fi 7) */}
      {selectedTab === 'wifi7' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'hsla(212, 100%, 55%, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid hsla(212, 100%, 55%, 0.3)'
                  }}
                >
                  <Wifi size={20} color="var(--accent-unifi)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{u7Mesh.name}</h3>
                    <span className="badge badge-unifi">Wi-Fi 7 (802.11be)</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    IP: <span className="font-mono">{u7Mesh.ip}</span> • MAC: <span className="font-mono">{u7Mesh.mac}</span> • Powered via Aruba PoE Port 1
                  </div>
                </div>
              </div>

              <button onClick={handleRestartAp} className="btn" style={{ borderColor: 'var(--accent-unifi)', color: 'var(--accent-unifi)', gap: '0.5rem' }}>
                <RotateCw size={15} />
                <span>Restart U7 Mesh AP</span>
              </button>
            </div>

            {/* Wi-Fi 7 Tri-Band Spectrum */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              
              {/* 6 GHz Band (Wi-Fi 7 320MHz MLO) */}
              <div className="glass-panel-subtle" style={{ padding: '1.25rem', border: '1px solid hsla(212, 100%, 65%, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-unifi)', fontSize: '0.9rem' }}>6 GHz Ultra-Wide Band</span>
                  <span className="badge badge-unifi">320 MHz Channel</span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Channel {u7Mesh.channel6}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  RF Channel Load: <strong style={{ color: 'var(--status-healthy)' }}>{u7Mesh.utilization6}%</strong> (Clean Spectrum)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Multi-Link Operation (MLO) & 4096-QAM enabled
                </div>
              </div>

              {/* 5 GHz Band */}
              <div className="glass-panel-subtle" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>5 GHz High-Speed Band</span>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>160 MHz</span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Channel {u7Mesh.channel5}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  RF Channel Load: <strong style={{ color: 'var(--status-warning)' }}>{u7Mesh.utilization5}%</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Tx Power: {u7Mesh.txPower5} dBm
                </div>
              </div>

              {/* 2.4 GHz Band */}
              <div className="glass-panel-subtle" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>2.4 GHz Legacy & IoT</span>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>20 MHz</span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Channel {u7Mesh.channel24}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  RF Channel Load: <strong>{u7Mesh.utilization24}%</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Tx Power: {u7Mesh.txPower24} dBm
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Connected Clients */}
      {selectedTab === 'clients' && (
        <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Device Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>IP & MAC</th>
                <th style={{ padding: '0.75rem 1rem' }}>Connection Standard</th>
                <th style={{ padding: '0.75rem 1rem' }}>Signal & Rates</th>
                <th style={{ padding: '0.75rem 1rem' }}>Activity</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {c.name.includes('iPhone') || c.name.includes('S24') ? (
                        <Smartphone size={16} color="var(--accent-unifi)" />
                      ) : c.name.includes('MacBook') ? (
                        <Laptop size={16} color="var(--accent-unifi)" />
                      ) : (
                        <Tv size={16} color="var(--text-muted)" />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: c.blocked ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                          {c.name} {c.blocked && '(BLOCKED)'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {c.type === 'wireless' ? c.apName : `Switch Port ${c.switchPort}`}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }} className="font-mono">
                    <div>{c.ip}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.mac}</div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    {c.wifiStandard ? (
                      <span className={`badge ${c.wifiStandard.includes('Wi-Fi 7') ? 'badge-unifi' : ''}`} style={{ background: c.wifiStandard.includes('Wi-Fi 7') ? 'hsla(212, 100%, 55%, 0.15)' : 'var(--bg-surface)' }}>
                        {c.wifiStandard} ({c.band})
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                        Wired Gigabit
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    {c.signalDbm ? (
                      <div>
                        <div className="font-mono" style={{ fontWeight: 600, color: c.signalDbm > -50 ? 'var(--status-healthy)' : 'var(--status-warning)' }}>
                          {c.signalDbm} dBm
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Rx: {c.rxRateMbps}M / Tx: {c.txRateMbps}M
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Wired 1000FDx</span>
                    )}
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }} className="font-mono">
                    {c.activityKbps > 1000 ? `${(c.activityKbps / 1000).toFixed(1)} Mbps` : `${c.activityKbps} Kbps`}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleBlock(c)}
                      className="btn btn-sm"
                      style={{
                        borderColor: c.blocked ? 'var(--status-healthy)' : 'var(--status-danger)',
                        color: c.blocked ? 'var(--status-healthy)' : 'var(--status-danger)',
                        padding: '0.25rem 0.55rem'
                      }}
                    >
                      {c.blocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      <QuickActionModal
        isOpen={modalAction.isOpen}
        title={modalAction.title}
        description={modalAction.description}
        affectedTarget={modalAction.target}
        isDestructive={false}
        onConfirm={modalAction.action}
        onClose={() => setModalAction((prev) => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
