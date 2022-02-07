//@ts-nocheck
import React, { useEffect, useState } from 'react';
import { fromPrivateKey } from 'bip32';
import CenterEllipsis from './CenterEllipsis';
import classNames from 'classnames';
import styles from './LoginWidget.module.scss';
import Button from 'components/Button';
import Icon from './Icon';
import useLocalStorage from 'libs/useLocalStorage';

export const LoginWidget = ({ text }) => {
  const [childKeyData, setChildKeyData] = useLocalStorage<ChildKeyData>(
    'childkey'
  );

  let childKey;
  if (childKeyData) {
    const { privateKey, chainCode, network } = childKeyData;
    childKey = fromPrivateKey(
      Buffer.from(Object.values(privateKey)),
      Buffer.from(Object.values(chainCode)),
      network
    );

    window.Wasm.setChildkey(childKey);
  } else {
    window.Wasm.removeChildkey();
  }

  const connectWallet = async () => {
    setChildKeyData(await window.Wasm.getChildKeyValue());
  };
  const disconnectWallet = () => {
    setChildKeyData(undefined);
  };

  return (
    <div className={classNames(styles.container)}>
      {childKey ? (
        <Button
          onClick={disconnectWallet}
          className={classNames(styles.connected)}
        >
          <Icon size={16} name="account_balance_wallet" />
          <p className={classNames(styles.address)}>
            <CenterEllipsis
              size={10}
              text={window.Wasm.getAddress(childKey) ?? '0x'}
            />
            {' | '}
            {process.env.REACT_APP_NETWORK}
          </p>
          <Icon size={20} name="close" />
        </Button>
      ) : (
        <Button className={classNames(styles.connect)} onClick={connectWallet}>
          {text}
        </Button>
      )}
    </div>
  );
};

export default LoginWidget;
