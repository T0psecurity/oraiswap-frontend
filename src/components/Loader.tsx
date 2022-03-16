import React from 'react';
import classNames from 'classnames';
import styles from './Loader.module.scss';
import { ReactComponent as BroadcastingIcon } from 'assets/icons/toast_broadcasting.svg';

const Loader: React.FC<{
  className?: string;
  width?: number;
  height?: number;
}> = ({ className, width, height }) => (
  <BroadcastingIcon
    className={classNames(styles.loader, className)}
    style={{ width, height }}
  />
);

export default Loader;
