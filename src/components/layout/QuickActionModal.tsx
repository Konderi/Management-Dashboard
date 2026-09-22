import React, { useState } from 'react';
import { AlertTriangle, X, Check, Loader2 } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  affectedTarget: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  title,
  description,
  affectedTarget,
  isDestructive = false,
  onConfirm,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false);
        setLoading(false);
        onClose();
      }, 1000);
    } catch (err) {
      setLoading(false);
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
          maxWidth: '480px',
          padding: '1.5rem',
          background: 'var(--bg-surface-elevated)',
          borderColor: isDestructive ? 'var(--status-danger)' : 'var(--border-glow)',
          boxShadow: isDestructive ? '0 0 35px hsla(352, 82%, 58%, 0.25)' : 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: isDestructive ? 'hsla(352, 82%, 58%, 0.15)' : 'hsla(43, 96%, 56%, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={18} color={isDestructive ? 'var(--status-danger)' : 'var(--status-warning)'} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{title}</h3>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-icon" style={{ background: 'transparent', border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          {description}
        </p>

        <div
          style={{
            background: 'var(--bg-base)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Target Component
          </div>
          <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {affectedTarget}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleExecute}
            className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
            disabled={loading || confirmed}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Executing...
              </>
            ) : confirmed ? (
              <>
                <Check size={16} />
                Executed!
              </>
            ) : (
              'Confirm & Execute'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
