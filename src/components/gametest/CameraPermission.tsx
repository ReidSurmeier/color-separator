'use client';

interface CameraPermissionProps {
  onEnable: () => void;
  onSkip: () => void;
}

export default function CameraPermission({ onEnable, onSkip }: CameraPermissionProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '40px',
        maxWidth: '420px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {/* Webcam icon */}
        <div style={{ marginBottom: '24px' }}>
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#333" strokeWidth="1.5">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111', marginBottom: '12px' }}>
          Camera Access
        </h2>

        <p style={{
          fontSize: '14px',
          color: '#555',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          This test uses your webcam for eye tracking. Your video is processed
          locally and never leaves your browser.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onEnable}
            style={{
              padding: '12px 24px',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Enable Camera
          </button>
          <button
            onClick={onSkip}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Skip &mdash; Use Mouse Only
          </button>
        </div>
      </div>
    </div>
  );
}
