import React, { useState } from 'react';
import Tooltip from './Tooltip';

const CenterEllipsis: React.FC<{
  text: string | String;
  size: number;
  className?: string;
}> = ({ text, size, className }) => {
  const [content, setContent] = useState(text);

  return (
    <Tooltip
      content={content}
      onClick={() => {
        navigator.clipboard.writeText(text.toString());
        setContent('Address copied!');
      }}
      onUntrigger={() => {
        setContent(text);
      }}
      maxWidth={'none'}
    >
      <span
        className={className}
        style={{ overflow: 'hidden', marginBottom: 0 }}
      >{`${text.slice(0, size)}...${text.slice(-size)}`}</span>
    </Tooltip>
  );
};

export default CenterEllipsis;
