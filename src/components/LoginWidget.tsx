//@ts-nocheck
import React, { useEffect, useState } from 'react';
import CenterEllipsis from './CenterEllipsis';
import classNames from 'classnames';
import styles from './LoginWidget.module.scss';
import Button from 'components/Button';
import Icon from './Icon';

export const LoginWidget = ({ type = 'onPage', text, style = {} }) => {
  const [childKey, setChildKey] = useState(window.Wasm.testChildKey());
  const connectWallet = async () => {
    setChildKey(await window.Wasm.getChildKey());
  };
  const disconnectWallet = () => {
    window.Wasm.removeChildkey();
    setChildKey(undefined);
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
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default LoginWidget;
