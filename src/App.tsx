import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header.js';
import { Sidebar, TabType } from './components/layout/Sidebar.js';
import { NetworkTopology } from './components/topology/NetworkTopology.js';
import { UdmPanel } from './components/unifi/UdmPanel.js';
import { ArubaSwitchPanel } from './components/aruba/ArubaSwitchPanel.js';
import { ProxmoxCluster } from './components/proxmox/ProxmoxCluster.js';
import { K8sOverview } from './components/k8s/K8sOverview.js';
import { AiWorkerPanel } from './components/ai/AiWorkerPanel.js';
import { BotFarmPanel } from './components/botfarm/BotFarmPanel.js';
import { CloudflarePanel } from './components/cloudflare/CloudflarePanel.js';
import { SettingsModal } from './components/settings/SettingsModal.js';
import { AuthModal } from './components/layout/AuthModal.js';
import { FullTelemetrySnapshot } from './types/index.js';
import { api } from './services/api.js';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('topology');
  const [snapshot, setSnapshot] = useState<FullTelemetrySnapshot | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Subscribe to SSE telemetry stream
    const unsubscribe = api.subscribeTelemetry((newSnapshot) => {
      setSnapshot(newSnapshot);
    });

    // Initial fetch
    api.fetchSnapshot().then((data) => {
      if (data) setSnapshot(data);
    });

    return () => unsubscribe();
  }, []);

  const refreshSnapshot = () => {
    api.fetchSnapshot().then((data) => {
      if (data) setSnapshot(data);
    });
  };

  const handleTabSelect = (tab: TabType) => {
    if (tab === 'settings') {
      setSettingsOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  if (!snapshot) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Loader2 size={40} className="animate-spin" color="var(--accent-unifi)" />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
          INITIALIZING NEXUS CONTROL PLANE...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Global Header */}
      <Header
        overview={snapshot.overview}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleTabSelect}
          snapshot={snapshot}
        />

        {/* Content Pane */}
        <main style={{ flex: 1, padding: '1rem', minWidth: 0, overflowX: 'hidden' }}>
          <div className="animate-fade-in" key={activeTab}>
            {activeTab === 'topology' && (
              <NetworkTopology
                snapshot={snapshot}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'network' && (
              <UdmPanel
                udm={snapshot.udm}
                u7Mesh={snapshot.u7Mesh}
                clients={snapshot.clients}
                onRefresh={refreshSnapshot}
              />
            )}

            {activeTab === 'switch' && (
              <ArubaSwitchPanel
                aruba={snapshot.aruba}
                onRefresh={refreshSnapshot}
              />
            )}

            {activeTab === 'proxmox' && (
              <ProxmoxCluster
                nodes={snapshot.proxmoxNodes}
                vms={snapshot.proxmoxVms}
                onRefresh={refreshSnapshot}
              />
            )}

            {activeTab === 'k8s' && (
              <K8sOverview
                nodes={snapshot.k8sNodes}
                pods={snapshot.k8sPods}
                deployments={snapshot.k8sDeployments}
                onRefresh={refreshSnapshot}
              />
            )}

            {activeTab === 'ai' && (
              <AiWorkerPanel
                workers={snapshot.aiWorkers}
                onRefresh={refreshSnapshot}
              />
            )}

            {activeTab === 'botfarm' && (
              <BotFarmPanel
                bots={snapshot.botFarmBots || []}
                onRefresh={refreshSnapshot}
              />
            )}

            {activeTab === 'cloudflare' && (
              <CloudflarePanel
                overview={snapshot.overview}
              />
            )}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={refreshSnapshot}
      />

      {/* Local Auth PIN Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={refreshSnapshot}
      />
    </div>
  );
};
