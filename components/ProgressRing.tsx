'use client';

interface ProgressRingProps {
  progress: number; // 0-1
  completed: boolean;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  completed,
  size = 42,
  strokeWidth = 3,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  // Color based on progress
  let color = '#00ff88'; // Green (0-70%)
  if (progress >= 0.9) {
    color = '#ff4444'; // Red (90-100%)
  } else if (progress >= 0.7) {
    color = '#ff8800'; // Orange (70-90%)
  }

  if (completed) {
    color = '#00ff88'; // Always green when completed
  }

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'rotate(-90deg)',
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
          }}
        />
      </svg>

      {/* Content (photo) */}
      <div
        style={{
          position: 'absolute',
          top: strokeWidth,
          left: strokeWidth,
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>

      {/* Checkmark when completed */}
      {completed && (
        <div
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: '#00ff88',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: '#000',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}
