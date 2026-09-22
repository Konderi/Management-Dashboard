import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Server,
  Box,
  RefreshCcw
} from 'lucide-react';
import { K8sNode, K8sPod, K8sDeployment } from '../../types/index.js';
import { api } from '../../services/api.js';
import { QuickActionModal } from '../layout/QuickActionModal.js';

interface K8sOverviewProps {
  nodes: K8sNode[];
  pods: K8sPod[];
  deployments: K8sDeployment[];
  onRefresh?: () => void;
}

export const K8sOverview: React.FC<K8sOverviewProps> = ({
  nodes,
  pods,
  deployments,
  onRefresh
}) => {
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
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

  const namespaces = ['all', ...Array.from(new Set(pods.map((p) => p.namespace)))];

  const filteredPods = pods.filter((p) => {
    if (selectedNamespace === 'all') return true;
    return p.namespace === selectedNamespace;
  });

  const handleRolloutRestart = (dep: K8sDeployment) => {
    setModalAction({
      isOpen: true,
      title: `Rollout Restart Deployment: ${dep.name}`,
      description: `Triggering a rollout restart will sequentially recreate all pods in deployment '${dep.name}' without downtime.`,
      target: `${dep.namespace} / ${dep.name}`,
      action: async () => {
        await api.restartK8sDeployment(dep.name, dep.namespace);
        if (onRefresh) onRefresh();
      }
    });
  };

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
                background: 'hsla(221, 85%, 58%, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid hsla(221, 85%, 58%, 0.3)'
              }}
            >
              <Layers size={22} color="var(--accent-k8s)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Kubernetes Cluster (k8s)</h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Version: <span className="font-mono">v1.31.1</span> • Containerd Runtime • Calico CNI
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-k8s">{nodes.length} Nodes</span>
            <span className="badge badge-k8s">{pods.length} Active Pods</span>
            <span className="badge badge-k8s">{deployments.length} Deployments</span>
          </div>
        </div>
      </div>

      {/* Nodes Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {nodes.map((node) => (
          <div key={node.name} className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-dot healthy" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{node.name}</h3>
              </div>
              <span className="badge" style={{ background: 'var(--bg-surface)', fontSize: '0.68rem' }}>
                {node.role.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>CPU Allocatable</span>
                  <span className="font-mono">{node.cpuPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${node.cpuPercent}%`, height: '100%', background: 'var(--accent-k8s)', borderRadius: '3px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Memory Allocated</span>
                  <span className="font-mono">{node.memPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${node.memPercent}%`, height: '100%', background: 'var(--accent-k8s)', borderRadius: '3px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '0.2rem' }}>
                <span>Pods: {node.podCount}</span>
                <span className="font-mono">{node.kubeletVersion}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deployments Section with Rollout Restart */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Deployments & Workloads</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {deployments.map((dep) => (
            <div key={`${dep.namespace}-${dep.name}`} className="glass-panel-subtle" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{dep.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ns: {dep.namespace}</div>
                </div>
                <button
                  onClick={() => handleRolloutRestart(dep)}
                  className="btn btn-sm"
                  style={{ gap: '0.35rem', background: 'var(--bg-surface)' }}
                  title="Trigger Rollout Restart"
                >
                  <RotateCw size={13} color="var(--accent-k8s)" />
                  <span style={{ fontSize: '0.75rem' }}>Restart</span>
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Replicas: <span className="font-mono" style={{ color: 'var(--status-healthy)' }}>{dep.replicasReady} / {dep.replicasDesired} Ready</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Image: {dep.image}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pods Matrix Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Active Pods Matrix</h3>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {namespaces.map((ns) => (
              <button
                key={ns}
                onClick={() => setSelectedNamespace(ns)}
                className={`btn btn-sm ${selectedNamespace === ns ? 'btn-primary' : ''}`}
                style={{ fontSize: '0.75rem' }}
              >
                {ns}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem 1rem' }}>Pod Name</th>
                <th style={{ padding: '0.65rem 1rem' }}>Namespace</th>
                <th style={{ padding: '0.65rem 1rem' }}>Status</th>
                <th style={{ padding: '0.65rem 1rem' }}>Restarts</th>
                <th style={{ padding: '0.65rem 1rem' }}>CPU / Memory</th>
                <th style={{ padding: '0.65rem 1rem' }}>Node</th>
                <th style={{ padding: '0.65rem 1rem' }}>Age</th>
              </tr>
            </thead>
            <tbody>
              {filteredPods.map((pod) => (
                <tr key={pod.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.8rem 1rem', fontWeight: 500 }} className="font-mono">
                    {pod.name}
                  </td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <span className="badge" style={{ background: 'var(--bg-surface)' }}>{pod.namespace}</span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <span className="status-indicator">
                      <span className="status-dot healthy" />
                      <span style={{ color: 'var(--status-healthy)', fontSize: '0.78rem' }}>{pod.status}</span>
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem' }} className="font-mono">
                    {pod.restarts}
                  </td>
                  <td style={{ padding: '0.8rem 1rem' }} className="font-mono">
                    {pod.cpuMillicores}m / {pod.memMb}MB
                  </td>
                  <td style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)' }}>
                    {pod.node}
                  </td>
                  <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>
                    {pod.age}
                  </td>
                </tr>
              ))}
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
        isDestructive={false}
        onConfirm={modalAction.action}
        onClose={() => setModalAction((prev) => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
