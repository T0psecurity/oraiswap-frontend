import React from 'react';
import classNames from 'classnames';
import styles from './Loader.module.scss';

const Loader: React.FC<{
  className?: string;
  width?: number;
  height?: number;
}> = ({ className, width, height }) => (
  <div
    className={classNames(styles.loader, className)}
    style={{ width, height }}
  />
);

export default Loader;
