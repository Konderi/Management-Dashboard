import React, { useState } from 'react';
import {
  Zap,
  Power,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowDownUp
} from 'lucide-react';
import { ArubaSwitch, ArubaSwitchPort } from '../../types/index.js';
import { api } from '../../services/api.js';
import { QuickActionModal } from '../layout/QuickActionModal.js';

interface ArubaSwitchPanelProps {
  aruba: ArubaSwitch;
  onRefresh?: () => void;
}

export const ArubaSwitchPanel: React.FC<ArubaSwitchPanelProps> = ({ aruba, onRefresh }) => {
  const [selectedPortNumber, setSelectedPortNumber] = useState<number>(1);
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

  const selectedPort = aruba.ports.find((p) => p.portNumber === selectedPortNumber) || aruba.ports[0];
  const poePercent = Math.round((aruba.poeActiveWatts / aruba.poeTotalBudgetWatts) * 100);

  const handlePowerCycle = (port: ArubaSwitchPort) => {
    setModalAction({
      isOpen: true,
      title: `Power Cycle PoE on Port ${port.portNumber}`,
      description: `This will momentarily cut PoE power to ${port.connectedDevice || port.name} and restore it, causing the attached hardware to reboot.`,
      target: `Port ${port.portNumber} (${port.connectedDevice || 'Unknown'})`,
      action: async () => {
        await api.powerCycleArubaPort(port.portNumber);
        if (onRefresh) onRefresh();
      }
    });
  };

  const handleTogglePort = async (port: ArubaSwitchPort) => {
    await api.toggleArubaPort(port.portNumber, !port.enabled);
    if (onRefresh) onRefresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner & PoE Budget */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'hsla(32, 100%, 50%, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid hsla(32, 100%, 50%, 0.3)'
                }}
              >
                <Zap size={20} color="var(--accent-aruba)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{aruba.model}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  IP: <span className="font-mono">{aruba.ip}</span> • Firmware: <span className="font-mono">{aruba.firmware}</span> • Uptime: <span className="font-mono">{aruba.uptime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PoE Budget Gauge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-surface)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PoE Power Budget (802.3at)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.2rem' }}>
                <span className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-aruba)' }}>
                  {aruba.poeActiveWatts}W
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  / {aruba.poeTotalBudgetWatts}W ({poePercent}%)
                </span>
              </div>
              <div style={{ width: '180px', height: '6px', background: 'var(--bg-base)', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
                <div style={{ width: `${poePercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-aruba), hsl(45, 100%, 50%))', borderRadius: '3px' }} />
              </div>
            </div>

            <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remaining</div>
              <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--status-healthy)', marginTop: '0.1rem' }}>
                {aruba.poeRemainingWatts}W
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Realistic Aruba 2530 Visual Faceplate */}
      <div className="glass-panel switch-faceplate">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #202b3d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em' }}>ARUBA 2530-8G-PoE+</span>
            <span style={{ fontSize: '0.72rem', color: '#687f9d', fontFamily: 'var(--font-mono)' }}>J9774A • GIGABIT ETHERNET</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.72rem', color: '#8aa2c2' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', background: '#00ff88', borderRadius: '1px' }} /> Link/Act
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', background: '#ffaa00', borderRadius: '1px' }} /> PoE Active
            </span>
          </div>
        </div>

        {/* Ports Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.5rem 0' }}>
          
          {/* 8 PoE+ RJ45 Ports */}
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {aruba.ports.slice(0, 8).map((port) => {
              const isSelected = selectedPortNumber === port.portNumber;
              const isLinkUp = port.linkStatus === 'up';
              const isPoeActive = port.poeStatus === 'delivering';

              return (
                <div
                  key={port.portNumber}
                  onClick={() => setSelectedPortNumber(port.portNumber)}
                  className={`rj45-port ${isSelected ? 'active' : ''} ${isPoeActive ? 'poe-active' : ''}`}
                  style={{
                    borderColor: isSelected ? 'var(--accent-aruba)' : isLinkUp ? '#2e4360' : '#1c2432',
                    boxShadow: isSelected ? '0 0 14px hsla(32, 100%, 50%, 0.4)' : 'none'
                  }}
                  title={`Port ${port.portNumber}: ${port.connectedDevice || port.name} (${port.poeWatts}W)`}
                >
                  {/* Top LEDs */}
                  <div className="port-leds">
                    <span className={`port-led ${isLinkUp ? 'link-up' : ''}`} />
                    <span className={`port-led ${isPoeActive ? 'poe-up' : ''}`} />
                  </div>

                  {/* Port Clip Slot */}
                  <div className="port-inner-clip" />

                  {/* Port Number & Wattage */}
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isSelected ? 'var(--accent-aruba)' : '#a5c0e5', fontFamily: 'var(--font-mono)' }}>
                      {port.portNumber}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: isPoeActive ? '#ffaa00' : '#455973', fontFamily: 'var(--font-mono)' }}>
                      {isPoeActive ? `${port.poeWatts}W` : port.linkStatus === 'up' ? '1G' : 'OFF'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dual SFP Ports (Ports 9 & 10) */}
          <div style={{ display: 'flex', gap: '0.65rem', borderLeft: '1px solid #202b3d', paddingLeft: '1rem' }}>
            {aruba.ports.slice(8, 10).map((port) => {
              const isSelected = selectedPortNumber === port.portNumber;
              const isLinkUp = port.linkStatus === 'up';

              return (
                <div
                  key={port.portNumber}
                  onClick={() => setSelectedPortNumber(port.portNumber)}
                  className="rj45-port"
                  style={{
                    background: '#0a0d14',
                    borderColor: isSelected ? 'var(--accent-unifi)' : isLinkUp ? '#254060' : '#161e2b',
                    boxShadow: isSelected ? '0 0 14px hsla(212, 100%, 55%, 0.4)' : 'none'
                  }}
                  title={`SFP Port ${port.portNumber}: ${port.connectedDevice || port.name}`}
                >
                  <div className="port-leds">
                    <span className={`port-led ${isLinkUp ? 'link-up' : ''}`} />
                    <span className="port-led" />
                  </div>
                  <div style={{ width: '22px', height: '14px', border: '1px solid #324765', background: '#121824', borderRadius: '1px' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isSelected ? 'var(--accent-unifi)' : '#8aa2c2', fontFamily: 'var(--font-mono)' }}>
                      SFP {port.portNumber}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: isLinkUp ? '#00ff88' : '#455973', fontFamily: 'var(--font-mono)' }}>
                      {isLinkUp ? '10G/1G' : 'OFF'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Selected Port Detailed Inspector & Control Box */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Port {selectedPort.portNumber} Details & Management
              </h3>
              <span className={`badge ${selectedPort.linkStatus === 'up' ? 'badge-aruba' : ''}`} style={{ background: selectedPort.linkStatus === 'up' ? 'hsla(152, 76%, 46%, 0.15)' : 'var(--bg-surface)', color: selectedPort.linkStatus === 'up' ? 'var(--status-healthy)' : 'var(--text-muted)' }}>
                {selectedPort.linkStatus === 'up' ? `LINK UP (${selectedPort.speed})` : 'LINK DOWN'}
              </span>
              {selectedPort.poeStatus === 'delivering' && (
                <span className="badge badge-aruba">
                  PoE+ DELIVERING ({selectedPort.poeWatts}W)
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Connected: <strong style={{ color: 'var(--text-primary)' }}>{selectedPort.connectedDevice || 'Unassigned'}</strong> • VLAN: {selectedPort.vlan}
            </div>
          </div>

          {/* Quick Management Buttons */}
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {selectedPort.poeCapable && (
              <button
                onClick={() => handlePowerCycle(selectedPort)}
                className="btn"
                style={{ borderColor: 'var(--accent-aruba)', color: 'var(--accent-aruba)', gap: '0.5rem' }}
                title="Power cycle PoE to reboot attached device"
              >
                <Power size={15} />
                <span>Power Cycle PoE</span>
              </button>
            )}

            <button
              onClick={() => handleTogglePort(selectedPort)}
              className="btn"
              style={{
                borderColor: selectedPort.enabled ? 'var(--status-danger)' : 'var(--status-healthy)',
                color: selectedPort.enabled ? 'var(--status-danger)' : 'var(--status-healthy)',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={15} />
              <span>{selectedPort.enabled ? 'Disable Port' : 'Enable Port'}</span>
            </button>
          </div>
        </div>

        {/* Port Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="glass-panel-subtle metric-card">
            <div className="metric-title">PoE Power Draw</div>
            <div className="metric-value" style={{ color: 'var(--accent-aruba)' }}>
              {selectedPort.poeWatts} W
            </div>
            <div className="metric-subtext">Class {selectedPort.poeClass} (802.3at)</div>
          </div>

          <div className="glass-panel-subtle metric-card">
            <div className="metric-title">Link Speed & Duplex</div>
            <div className="metric-value font-mono" style={{ fontSize: '1.25rem' }}>
              {selectedPort.speed}
            </div>
            <div className="metric-subtext">Auto-negotiation Active</div>
          </div>

          <div className="glass-panel-subtle metric-card">
            <div className="metric-title">Admin State</div>
            <div className="metric-value font-mono" style={{ fontSize: '1.25rem', color: selectedPort.enabled ? 'var(--status-healthy)' : 'var(--status-danger)' }}>
              {selectedPort.enabled ? 'ENABLED' : 'DISABLED'}
            </div>
            <div className="metric-subtext">Switch Port Mode</div>
          </div>

          <div className="glass-panel-subtle metric-card">
            <div className="metric-title">VLAN Membership</div>
            <div className="metric-value font-mono">
              VLAN {selectedPort.vlan}
            </div>
            <div className="metric-subtext">Untagged Access Port</div>
          </div>
        </div>
      </div>

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
