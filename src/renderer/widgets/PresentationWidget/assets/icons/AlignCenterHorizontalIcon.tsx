import React from 'react';

interface IconProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  color?: string;
}

const AlignCenterHorizontalIcon: React.FC<IconProps> = ({ className, width = 16, height = 16, color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width={width}
    height={height}
    fill={color || 'currentColor'}
    className={className}
  >
    <path d="M7 2h2v12H7zM3 6h10v4H3z" />
  </svg>
);

export default AlignCenterHorizontalIcon;
