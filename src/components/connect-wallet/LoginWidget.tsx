import { FC } from 'react';
import styles from './LoginWidget.module.scss';
import cn from 'classnames/bind';
import CenterEllipsis from 'components/CenterEllipsis';
import Icon from 'components/Icon';

const cx = cn.bind(styles);

export const LoginWidget: FC<{
  logo: string;
  text: string;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}> = ({ logo, text, address, connect, disconnect }) => {
  return (
    <div className={cx('item')} onClick={address ? disconnect : connect}>
      <img src={logo} className={cx('logo')} />
      <div className={cx('grow')}>
        {address ? (
          <>
            <div className={cx('network-title')}>{text}</div>
            <div className={cx('des')}>
              <CenterEllipsis size={6} text={address} />
            </div>
          </>
        ) : (
          <>
            <div className={cx('network-title')}>{text}</div>
            <div className={cx('des')}>Connect using browser wallet</div>
          </>
        )}
      </div>
      {address ? (
        <div>
          <Icon size={20} name="close" />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default LoginWidget;
