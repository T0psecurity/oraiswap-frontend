import React, { FC, useEffect, useState } from 'react';
import CenterEllipsis from './CenterEllipsis';
import classNames from 'classnames';
import styles from './LoginWidget.module.scss';
import Button from 'components/Button';
import Icon from './Icon';
import useLocalStorage from 'libs/useLocalStorage';
import { network } from 'constants/networks';
import KeplrImage from 'images/keplr.png';
import cn from 'classnames/bind';

const cx = cn.bind(styles);

export const LoginWidget: FC<{
  text: string;
  onAddress: (address: string) => void;
}> = ({ text, onAddress }) => {
  // const [address, setAddress] = useLocalStorage<String>("address");

  const connectWallet = async () => {
    if (!(await window.Keplr.getKeplr())) {
      alert('You must install Keplr to continue');
      return;
    }
    await window.Keplr.suggestChain(network.chainId);
    const address = await window.Keplr.getKeplrAddr();

    onAddress(address as string);
  };
  // const disconnectWallet = () => {
  //   onAddress('');
  // };

  return (
    // <div className={classNames(styles.container)}>
    //   {address ? (
    //     <Button
    //       onClick={disconnectWallet}
    //       className={classNames(styles.connected)}
    //     >
    //       <Icon size={16} name="account_balance_wallet" />
    //       <p className={classNames(styles.address)}>
    //         <CenterEllipsis size={6} text={address as string} />
    //         {' | '}
    //         {network.id}
    //       </p>
    //       <Icon size={20} name="close" />
    //     </Button>
    //   ) : (
    //     <Button className={classNames(styles.connect)} onClick={connectWallet}>
    //       <img height={16} src={KeplrImage} alt="Keplr" />
    //       {text}
    //     </Button>
    //   )}
    // </div>
    <div
      className={cx('item')}
      // onClick={address ? disconnectWallet : connectWallet}
      onClick={connectWallet}
    >
      <img src={KeplrImage} className={cx('logo')} />
      <div className={cx('grow')}>
        <div className={cx('network-title')}>{text}</div>
        <div className={cx('des')}>
          {/* {address ? (
            <>
              <CenterEllipsis size={6} text={address as string} />
              {" | "}
              {network.id}
            </>
          ) : (
            "Connect using browser wallet"
          )} */}
          Connect using browser wallet
        </div>
      </div>
      {/* {address ? (
        <div>
          <Icon size={20} name="close" />
        </div>
      ) : (
        <></>
      )} */}
    </div>
  );
};

export default LoginWidget;
