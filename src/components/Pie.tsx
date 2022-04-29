// @ts-nocheck
import styles from './Pie.module.scss';
import cn from 'classnames/bind';
import { FC } from 'react';

const cx = cn.bind(styles);

const Pie: FC<{
  percent?: number;
  width?: number;
  backgroundColor?: string;
  indicatorColor?: string;
  children?: any;
}> = ({
  percent = 0,
  width = 6,
  backgroundColor = '#FFD5AE',
  indicatorColor = '#612FCA',
  children
}) => {
  const bWidth = `${width}px`;
  return (
    <div
      className={cx('pie', 'wrapper')}
      style={{ '--p': 180, '--b': bWidth, '--c': backgroundColor }}
    >
      <div
        className={cx('pie', 'animate')}
        style={{ '--p': percent, '--b': bWidth, '--c': indicatorColor }}
      >
        {children}
      </div>
    </div>
  );
};

export default Pie;
