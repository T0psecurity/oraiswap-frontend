import React from 'react';
import classNames from 'classnames';

interface Props {
  name: string;
  size?: string | number;
  className?: string;
  color?: string;
  onClick?: () => void;
}

const Icon = ({ name, size, className, color, onClick }: Props) => (
  <i
    onClick={onClick}
    className={classNames('material-icons', className)}
    style={{ fontSize: size, color: color }}
  >
    {name}
  </i>
);

export default Icon;
