import React from 'react';

interface IconProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  color?: string;
}

const AlignBottomIcon: React.FC<IconProps> = ({ className, width = 16, height = 16, color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width={width}
    height={height}
    fill={color || 'currentColor'}
    className={className}
  >
    <path d="M3 12h10v2H3zm5-10h2v8H8z" />
  </svg>
);

export default AlignBottomIcon;
