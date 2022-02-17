import { useWeb3React } from '@web3-react/core';
import { FC, useEffect, useState } from 'react';
import { InjectedConnector } from '@web3-react/injected-connector';
import useLocalStorage from 'libs/useLocalStorage';
import CenterEllipsis from './CenterEllipsis';
import classNames from 'classnames';
import styles from './LoginWidget.module.scss';
import Button from 'components/Button';
import Icon from './Icon';
import MetamaskImage from 'images/metamask.png';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 15]
});

const LoginMetamask: FC<{ text: string }> = ({ text }) => {
  const { account, active, error, activate, deactivate } = useWeb3React();

  const [address, setAddress] = useLocalStorage<string | undefined | null>(
    'metamask-address',
    account
  );

  async function connect() {
    try {
      await activate(injected);
      setAddress(await injected.getAccount());
    } catch (ex) {
      console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
      setAddress('');
    } catch (ex) {
      console.log(ex);
    }
  }

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      try {
        if (!active && address && !error) {
          await activate(injected);
        }
      } catch (err) {}
    };
    connectWalletOnPageLoad();
  }, []);

  return (
    <div className={classNames(styles.container)}>
      {address ? (
        <Button onClick={disconnect} className={classNames(styles.connected)}>
          <Icon size={16} name="account_balance_wallet" />
          <p className={classNames(styles.address)}>
            <CenterEllipsis size={6} text={address} />
          </p>
          <Icon size={20} name="close" />
        </Button>
      ) : (
        <Button className={classNames(styles.connect)} onClick={connect}>
          <img height={16} src={MetamaskImage} alt="Metamask" />
          {text}
        </Button>
      )}
    </div>
  );
};

export default LoginMetamask;
