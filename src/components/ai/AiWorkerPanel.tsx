import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Flame,
  Activity,
  Play,
  CheckCircle2,
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';
import { AiWorker, BenchmarkResult } from '../../types/index.js';
import { api } from '../../services/api.js';

interface AiWorkerPanelProps {
  workers: AiWorker[];
  onRefresh?: () => void;
}

export const AiWorkerPanel: React.FC<AiWorkerPanelProps> = ({ workers, onRefresh }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || 'worker-1');
  const [prompt, setPrompt] = useState<string>('Write a high-performance Rust function for parallel matrix multiplication.');
  const [benchmarkLoading, setBenchmarkLoading] = useState<boolean>(false);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];

  const handleRunBenchmark = async () => {
    if (!selectedWorker) return;
    setBenchmarkLoading(true);
    const activeModel = selectedWorker.loadedModels[0]?.name || 'llama3.3:70b-instruct-q4_K_M';
    try {
      const res = await api.runAiBenchmark(activeModel, prompt);
      setBenchmarkResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setBenchmarkLoading(false);
    }
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
                background: 'hsla(92, 85%, 48%, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid hsla(92, 85%, 48%, 0.3)'
              }}
            >
              <Cpu size={22} color="var(--accent-ai)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Worker Nodes & GPU Acceleration</h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                NVIDIA CUDA Accelerated Inference • Ollama & vLLM Engines Active
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {workers.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWorkerId(w.id)}
                className={`btn btn-sm ${selectedWorkerId === w.id ? 'btn-primary' : ''}`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GPU Hardware Telemetry Cards */}
      {selectedWorker && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {selectedWorker.gpus.map((gpu) => {
              const vramPercent = Math.round((gpu.vramUsedMb / gpu.vramTotalMb) * 100);
              return (
                <div key={gpu.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="status-dot healthy" />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{gpu.name}</h3>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Device ID: cuda:{gpu.id} • Engine: {selectedWorker.engine}
                      </div>
                    </div>
                    <span className="badge badge-ai">CUDA 12.6</span>
                  </div>

                  {/* VRAM Progress Bar */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>VRAM Allocation</span>
                      <span className="font-mono" style={{ fontWeight: 600, color: 'var(--accent-ai)' }}>
                        {(gpu.vramUsedMb / 1024).toFixed(1)} GB / {(gpu.vramTotalMb / 1024).toFixed(1)} GB ({vramPercent}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${vramPercent}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--accent-ai), hsl(60, 100%, 50%))',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Metrics Row: Temp, Power, Load */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
                    <div className="glass-panel-subtle" style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Flame size={12} color="var(--status-danger)" /> Temp
                      </div>
                      <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.2rem' }}>
                        {gpu.temperatureC}°C
                      </div>
                    </div>

                    <div className="glass-panel-subtle" style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Zap size={12} color="var(--accent-aruba)" /> Power
                      </div>
                      <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.2rem' }}>
                        {gpu.powerWatts}W
                      </div>
                    </div>

                    <div className="glass-panel-subtle" style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Activity size={12} color="var(--accent-ai)" /> Load
                      </div>
                      <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--accent-ai)' }}>
                        {gpu.utilizationPercent}%
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Loaded Models Table */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-ai)" />
              Models In VRAM Memory ({selectedWorker.loadedModels.length})
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.65rem 1rem' }}>Model Name</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Quantization</th>
                    <th style={{ padding: '0.65rem 1rem' }}>VRAM Usage</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Disk Size</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Max Context</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedWorker.loadedModels.map((m) => (
                    <tr key={m.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }} className="font-mono">
                        {m.name}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge" style={{ background: 'var(--bg-surface)' }}>{m.quantization}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--accent-ai)' }} className="font-mono">
                        {(m.vramUsageMb / 1024).toFixed(1)} GB
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }} className="font-mono">
                        {m.sizeGb} GB
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }} className="font-mono">
                        {m.contextLength.toLocaleString()} tokens
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Benchmark Sandbox */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="var(--accent-ai)" />
                  Inference Latency & Throughput Benchmark
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Send a live prompt to test generation speed (tokens/sec) and first-token latency on {selectedWorker.name}.
                </p>
              </div>

              <button
                onClick={handleRunBenchmark}
                disabled={benchmarkLoading}
                className="btn btn-primary"
                style={{ gap: '0.5rem' }}
              >
                {benchmarkLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={15} />}
                <span>{benchmarkLoading ? 'Benchmarking...' : 'Execute Benchmark'}</span>
              </button>
            </div>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter prompt to benchmark..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem',
                outline: 'none',
                marginBottom: '1rem'
              }}
            />

            {benchmarkResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="glass-panel-subtle metric-card">
                  <div className="metric-title">Throughput Speed</div>
                  <div className="metric-value" style={{ color: 'var(--accent-ai)' }}>
                    {benchmarkResult.tokensPerSec} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>tok/s</span>
                  </div>
                  <div className="metric-subtext">Generation Rate</div>
                </div>

                <div className="glass-panel-subtle metric-card">
                  <div className="metric-title">Time to 1st Token</div>
                  <div className="metric-value font-mono">
                    {benchmarkResult.timeToFirstTokenMs} ms
                  </div>
                  <div className="metric-subtext">Prompt Evaluation</div>
                </div>

                <div className="glass-panel-subtle metric-card">
                  <div className="metric-title">Tokens Generated</div>
                  <div className="metric-value font-mono">
                    {benchmarkResult.tokensGenerated}
                  </div>
                  <div className="metric-subtext">Total Tokens</div>
                </div>

                <div className="glass-panel-subtle metric-card">
                  <div className="metric-title">Total Time</div>
                  <div className="metric-value font-mono">
                    {benchmarkResult.totalTimeSec} s
                  </div>
                  <div className="metric-subtext">End-to-End Latency</div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
