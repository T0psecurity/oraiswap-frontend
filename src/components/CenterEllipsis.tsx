import React from 'react';

const CenterEllipsis: React.FC<{
  text: string;
  size: number;
  className?: string;
}> = ({ text, size, className }) => {
  return (
    <span
      className={className}
      style={{ overflow: 'hidden', marginBottom: 0 }}
    >{`${text.slice(0, size)}...${text.slice(-size)}`}</span>
  );
};

export default CenterEllipsis;
