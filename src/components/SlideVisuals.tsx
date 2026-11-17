import React from 'react';

export const BrandGeometricMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 360 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer architectural ring */}
    <circle cx="180" cy="180" r="164" stroke="#E5A93B" strokeOpacity="0.28" strokeWidth="1" />
    <circle
      cx="180"
      cy="180"
      r="134"
      stroke="#8FD1BD"
      strokeOpacity="0.22"
      strokeWidth="1"
      strokeDasharray="4 6"
    />

    {/* Intersecting corporate triad geometry representing Marketing, Training, Consulting */}
    <rect
      x="88"
      y="88"
      width="184"
      height="184"
      rx="20"
      stroke="#E5A93B"
      strokeOpacity="0.45"
      strokeWidth="1.5"
      transform="rotate(45 180 180)"
    />
    <rect
      x="104"
      y="104"
      width="152"
      height="152"
      rx="12"
      fill="#0F6E56"
      fillOpacity="0.35"
      stroke="#8FD1BD"
      strokeOpacity="0.4"
      strokeWidth="1.25"
    />

    {/* Gold precision center focal */}
    <circle cx="180" cy="180" r="46" fill="#0B3D38" stroke="#E5A93B" strokeWidth="2" />
    <path
      d="M180 148L204 180L180 212L156 180L180 148Z"
      fill="#E5A93B"
      fillOpacity="0.9"
    />
    <circle cx="180" cy="180" r="8" fill="#0B3D38" />

    {/* Three satellite nodes: Marketing, Training, Consulting */}
    <circle cx="180" cy="46" r="10" fill="#E5A93B" />
    <circle cx="296" cy="247" r="10" fill="#8FD1BD" />
    <circle cx="64" cy="247" r="10" fill="#8FD1BD" />

    <line x1="180" y1="56" x2="180" y2="134" stroke="#E5A93B" strokeOpacity="0.4" strokeWidth="1" />
    <line x1="287" y1="242" x2="220" y2="203" stroke="#8FD1BD" strokeOpacity="0.35" strokeWidth="1" />
    <line x1="73" y1="242" x2="140" y2="203" stroke="#8FD1BD" strokeOpacity="0.35" strokeWidth="1" />
  </svg>
);

export const RehabWordmarkIcon: React.FC<{ className?: string; variant?: 'dark' | 'light' }> = ({
  className = 'w-8 h-8',
  variant = 'dark',
}) => {
  const strokeColor = variant === 'dark' ? '#E5A93B' : '#0B3D38';
  const accentColor = variant === 'dark' ? '#8FD1BD' : '#0F6E56';
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="32"
        height="32"
        rx="8"
        stroke={strokeColor}
        strokeWidth="1.75"
      />
      <path
        d="M20 10L29 20L20 30L11 20L20 10Z"
        stroke={accentColor}
        strokeWidth="1.75"
      />
      <circle cx="20" cy="20" r="3.5" fill={strokeColor} />
    </svg>
  );
};
