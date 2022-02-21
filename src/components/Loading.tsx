import React from 'react';
import styles from './Loading.module.scss';
import classNames from 'classnames';

interface Props {
  size?: number;
  className?: string;
  theme?: 'dark' | 'light';
}

const Loading = ({ size, className, theme = 'light' }: Props) => {
  const style: any = {};
  if (size) {
    style.width = size;
    style.height = size;
  }
  return (
    <div
      className={classNames(
        styles.loading,
        styles['lds-ripple'],
        styles[theme],
        className
      )}
      style={style}
    >
      <div></div>
      <div></div>
    </div>
  );
};

export default Loading;
