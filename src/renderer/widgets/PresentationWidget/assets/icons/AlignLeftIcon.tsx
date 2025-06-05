import React from 'react';

interface IconProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  color?: string;
}

const AlignLeftIcon: React.FC<IconProps> = ({ className, width = 16, height = 16, color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width={width}
    height={height}
    fill={color || 'currentColor'}
    className={className}
  >
    <path d="M2 3h2v10H2zm4 3h8v4H6z" />
  </svg>
);

export default AlignLeftIcon;
