import React, { useState } from 'react';
import {
  Server,
  Play,
  Square,
  RotateCw,
  ExternalLink,
  Cpu,
  Layers,
  HardDrive,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { ProxmoxNode, ProxmoxVm } from '../../types/index.js';
import { api } from '../../services/api.js';
import { QuickActionModal } from '../layout/QuickActionModal.js';

interface ProxmoxClusterProps {
  nodes: ProxmoxNode[];
  vms: ProxmoxVm[];
  onRefresh?: () => void;
}

export const ProxmoxCluster: React.FC<ProxmoxClusterProps> = ({ nodes, vms, onRefresh }) => {
  const [filterType, setFilterType] = useState<'all' | 'qemu' | 'lxc'>('all');
  const [modalAction, setModalAction] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    target: string;
    isDestructive: boolean;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    target: '',
    isDestructive: false,
    action: async () => {}
  });

  const handleVmAction = (vm: ProxmoxVm, action: 'start' | 'stop' | 'reboot') => {
    const isDestructive = action === 'stop';
    setModalAction({
      isOpen: true,
      title: `${action.toUpperCase()} Virtual Machine / Container`,
      description: `Are you sure you want to ${action} ${vm.name} (VMID: ${vm.vmid}) on node ${vm.node}?`,
      target: `${vm.name} [ID: ${vm.vmid}] on ${vm.node}`,
      isDestructive,
      action: async () => {
        await api.setVmState(vm.vmid, vm.node, vm.type, action);
        if (onRefresh) onRefresh();
      }
    });
  };

  const filteredVms = vms.filter((v) => {
    if (filterType === 'all') return true;
    return v.type === filterType;
  });

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
                background: 'hsla(24, 100%, 48%, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid hsla(24, 100%, 48%, 0.3)'
              }}
            >
              <Server size={22} color="var(--accent-proxmox)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Proxmox VE 8.2 Cluster</h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                3 Physical Hosts • <span style={{ color: 'var(--status-healthy)', fontWeight: 600 }}>Quorum OK</span> • Ceph / ZFS Storage Pools Healthy
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-proxmox">{nodes.length} Physical Nodes</span>
            <span className="badge badge-proxmox">{vms.filter((v) => v.status === 'running').length} / {vms.length} Running</span>
          </div>
        </div>
      </div>

      {/* Nodes Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {nodes.map((node) => {
          const isControlPlane = node.role === 'control-plane-host';
          return (
            <div
              key={node.id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                borderColor: isControlPlane ? 'var(--accent-unifi)' : 'var(--border-subtle)',
                boxShadow: isControlPlane ? '0 0 16px hsla(212, 100%, 55%, 0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="status-dot healthy" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{node.name}</h3>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {node.hardware} • {node.ip}
                  </div>
                </div>

                <span
                  className="badge"
                  style={{
                    background: isControlPlane ? 'hsla(212, 100%, 55%, 0.15)' : 'hsla(24, 100%, 48%, 0.15)',
                    color: isControlPlane ? 'var(--accent-unifi)' : 'var(--accent-proxmox)',
                    fontSize: '0.68rem'
                  }}
                >
                  {isControlPlane ? 'STANDALONE CONTROL' : 'CLUSTER NODE'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {/* CPU */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>CPU Utilization ({node.cpuCores} Cores)</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>{node.cpuUsage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${node.cpuUsage}%`, height: '100%', background: isControlPlane ? 'var(--accent-unifi)' : 'var(--accent-proxmox)', borderRadius: '3px' }} />
                  </div>
                </div>

                {/* Memory */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Memory ({node.memTotalGb} GB Total)</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>{node.memUsage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${node.memUsage}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-proxmox), hsl(32, 100%, 50%))', borderRadius: '3px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '0.25rem' }}>
                  <span>Load Avg: <span className="font-mono">{node.loadAverage.join(', ')}</span></span>
                  <span className="font-mono">{node.uptime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VM & LXC Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Virtual Machines & LXC Containers</h3>
          
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button onClick={() => setFilterType('all')} className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : ''}`}>
              All ({vms.length})
            </button>
            <button onClick={() => setFilterType('qemu')} className={`btn btn-sm ${filterType === 'qemu' ? 'btn-primary' : ''}`}>
              QEMU VMs ({vms.filter((v) => v.type === 'qemu').length})
            </button>
            <button onClick={() => setFilterType('lxc')} className={`btn btn-sm ${filterType === 'lxc' ? 'btn-primary' : ''}`}>
              LXC ({vms.filter((v) => v.type === 'lxc').length})
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem 1rem' }}>VMID & Name</th>
                <th style={{ padding: '0.65rem 1rem' }}>Node</th>
                <th style={{ padding: '0.65rem 1rem' }}>Status</th>
                <th style={{ padding: '0.65rem 1rem' }}>Resources (CPU / RAM)</th>
                <th style={{ padding: '0.65rem 1rem' }}>IP Address</th>
                <th style={{ padding: '0.65rem 1rem' }}>Tags</th>
                <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Power Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVms.map((vm) => {
                const isRunning = vm.status === 'running';
                return (
                  <tr key={vm.vmid} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{vm.vmid}</span>
                        <span style={{ fontWeight: 600 }}>{vm.name}</span>
                        <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--bg-surface)' }}>{vm.type.toUpperCase()}</span>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {vm.node}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="status-indicator">
                        <span className={`status-dot ${isRunning ? 'healthy' : 'offline'}`} />
                        <span style={{ fontSize: '0.78rem', color: isRunning ? 'var(--status-healthy)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {vm.status}
                        </span>
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }} className="font-mono">
                      {isRunning ? (
                        <div>
                          <div>CPU: {vm.cpuUsage}%</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            RAM: {Math.round(vm.memUsage)}% ({Math.round(vm.memTotalMb / 1024)}GB)
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Offline</span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }} className="font-mono">
                      {vm.ip}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {vm.tags.map((tag) => (
                          <span key={tag} className="badge" style={{ fontSize: '0.65rem', background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {isRunning ? (
                          <>
                            <button
                              onClick={() => handleVmAction(vm, 'reboot')}
                              className="btn btn-sm btn-icon"
                              title="Reboot VM"
                              style={{ background: 'var(--bg-surface)' }}
                            >
                              <RotateCw size={14} color="var(--accent-proxmox)" />
                            </button>
                            <button
                              onClick={() => handleVmAction(vm, 'stop')}
                              className="btn btn-sm btn-icon"
                              title="Stop VM"
                              style={{ background: 'var(--bg-surface)' }}
                            >
                              <Square size={14} color="var(--status-danger)" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleVmAction(vm, 'start')}
                            className="btn btn-sm"
                            style={{ background: 'hsla(152, 76%, 46%, 0.15)', color: 'var(--status-healthy)', borderColor: 'hsla(152, 76%, 46%, 0.3)', gap: '0.3rem' }}
                          >
                            <Play size={13} />
                            <span>Start</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <QuickActionModal
        isOpen={modalAction.isOpen}
        title={modalAction.title}
        description={modalAction.description}
        affectedTarget={modalAction.target}
        isDestructive={modalAction.isDestructive}
        onConfirm={modalAction.action}
        onClose={() => setModalAction((prev) => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
