import React from 'react';
import {
  TrendingUp,
  Play,
  Square,
  RotateCw,
  ExternalLink,
  DollarSign,
  Percent,
  Activity,
  Layers,
  Shield,
  Clock
} from 'lucide-react';
import { BotFarmBot } from '../../types/index.js';

interface BotFarmPanelProps {
  bots: BotFarmBot[];
  onRefresh?: () => void;
}

export const BotFarmPanel: React.FC<BotFarmPanelProps> = ({ bots }) => {
  const totalProfit = bots.reduce((sum, b) => sum + b.totalProfitUsdt, 0);
  const totalTrades = bots.reduce((sum, b) => sum + b.totalTrades, 0);
  const avgWinRate = (bots.reduce((sum, b) => sum + b.winRatePercent, 0) / (bots.length || 1)).toFixed(1);
  const totalOpenTrades = bots.reduce((sum, b) => sum + b.openTrades, 0);

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
                background: 'hsla(152, 76%, 46%, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid hsla(152, 76%, 46%, 0.3)'
              }}
            >
              <TrendingUp size={22} color="var(--status-healthy)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>BotFarm Autonomous Trading Fleet</h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                5 Freqtrade Futures Bots • VLAN 99 Isolation • Bybit Exchange Connectors
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-unifi">VLAN 99</span>
            <span className="badge" style={{ background: 'hsla(152, 76%, 46%, 0.15)', color: 'var(--status-healthy)' }}>
              +{totalProfit.toFixed(2)} USDT
            </span>
          </div>
        </div>
      </div>

      {/* Aggregate Telemetry Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel metric-card">
          <div className="metric-title">Fleet Net Profit</div>
          <div className="metric-value font-mono" style={{ color: 'var(--status-healthy)' }}>
            +${totalProfit.toFixed(2)}
          </div>
          <div className="metric-subtext">Cumulative USDT Realized</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-title">Average Win Rate</div>
          <div className="metric-value font-mono" style={{ color: 'var(--accent-unifi)' }}>
            {avgWinRate}%
          </div>
          <div className="metric-subtext">Across All 5 Bots</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-title">Active Positions</div>
          <div className="metric-value font-mono">
            {totalOpenTrades} Open
          </div>
          <div className="metric-subtext">Bybit Futures Long/Short</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-title">Total Trades Executed</div>
          <div className="metric-value font-mono">
            {totalTrades}
          </div>
          <div className="metric-subtext">SQLite / Postgres Synchronized</div>
        </div>
      </div>

      {/* Bots Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {bots.map((bot) => (
          <div key={bot.id} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="status-dot healthy" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{bot.name}</h3>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Partner: <strong style={{ color: 'var(--text-primary)' }}>{bot.partner}</strong> • Port: <span className="font-mono">{bot.port}</span>
                </div>
              </div>

              <span className="badge badge-unifi">
                {bot.timeframe}
              </span>
            </div>

            {/* Strategy Box */}
            <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Strategy</div>
              <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-unifi)', marginTop: '0.15rem' }}>
                {bot.strategy}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Positions: <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{bot.openTrades} / {bot.maxTrades}</span> (Stake: ${bot.stakeAmount} USDT)
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="glass-panel-subtle" style={{ padding: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Net Profit</div>
                <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-healthy)', marginTop: '0.15rem' }}>
                  +${bot.totalProfitUsdt.toFixed(2)}
                </div>
              </div>

              <div className="glass-panel-subtle" style={{ padding: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Win Rate</div>
                <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-unifi)', marginTop: '0.15rem' }}>
                  {bot.winRatePercent}%
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Last: {bot.lastTradeTime}
              </span>

              <a
                href={bot.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{ background: 'var(--bg-surface)', gap: '0.35rem', fontSize: '0.78rem' }}
              >
                <span>FreqUI Console</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
