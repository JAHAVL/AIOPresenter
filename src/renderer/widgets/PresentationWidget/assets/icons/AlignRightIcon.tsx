import React from 'react';

interface IconProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  color?: string;
}

const AlignRightIcon: React.FC<IconProps> = ({ className, width = 16, height = 16, color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width={width}
    height={height}
    fill={color || 'currentColor'}
    className={className}
  >
    <path d="M12 3h2v10h-2zM2 7h8v2H2z" />
  </svg>
);

export default AlignRightIcon;
