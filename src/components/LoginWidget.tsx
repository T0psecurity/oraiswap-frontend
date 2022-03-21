import React, { FC, useEffect, useState } from 'react';
import styles from './LoginWidget.module.scss';
import { network } from 'constants/networks';
import KeplrImage from 'assets/images/keplr.png';
import cn from 'classnames/bind';
import {
  isAndroid as checkIsAndroid,
  isMobile as checkIsMobile,
  saveMobileLinkInfo
} from '@walletconnect/browser-utils';

const cx = cn.bind(styles);

export const LoginWidget: FC<{
  text: string;
  onAddress: (address: string) => void;
}> = ({ text, onAddress }) => {
  // const [address, setAddress] = useLocalStorage<String>("address");
  const [isMobile] = useState(() => checkIsMobile());

  const connectWallet = async () => {
    if (!(await window.Keplr.getKeplr())) {
      alert('You must install Keplr to continue');
      return;
    }
    await window.Keplr.suggestChain(network.chainId);
    const address = await window.Keplr.getKeplrAddr();

    onAddress(address as string);
  };

  return (
    <div
      className={cx('item')}
      // onClick={address ? disconnectWallet : connectWallet}
      onClick={connectWallet}
    >
      <img src={KeplrImage} className={cx('logo')} />
      <div className={cx('grow')}>
        <div className={cx('network-title')}>{text}</div>
        <div className={cx('des')}>Connect using browser wallet</div>
      </div>
    </div>
  );
};

export default LoginWidget;
