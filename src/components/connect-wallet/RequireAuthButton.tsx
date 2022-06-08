import { Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { network } from 'config/networks';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import ConnectWalletModal from './ConnectWalletModal';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import { injected, useEagerConnect } from 'hooks/useMetamask';

const RequireAuthButton: React.FC<any> = ({
  address,
  metamaskAddress,
  setAddress,
  ...props
}) => {
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);
  const [isInactiveMetamask, setIsInactiveMetamask] = useState(false);
  const { activate, deactivate } = useWeb3React();

  useEagerConnect(isInactiveMetamask);
  const onClick = () => {
    setOpenConnectWalletModal(true);
  };

  const connectMetamask = async () => {
    try {
      await activate(injected, (ex) => {
        displayToast(TToastType.METAMASK_FAILED, {message: ex.message});
      });
    } catch (ex) {
      console.log(ex);
    }
  };

  const disconnectMetamask = async () => {
    try {
      deactivate();
      setIsInactiveMetamask(true);
    } catch (ex) {
      console.log(ex);
    }
  };

  const connectKeplr = async () => {
    if (!(await window.Keplr.getKeplr())) {
      return displayToast(
        TToastType.TX_INFO,
        {
          message: 'You must install Keplr to continue',
        },
        { toastId: 'install_keplr' }
      );
    }

    await window.Keplr.suggestChain(network.chainId);
    const address = await window.Keplr.getKeplrAddr();
    setAddress(address as string);
  };

  const disconnectKeplr = async () => {
    try {
      window.Keplr.disconnect();
      setAddress('');
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <React.Fragment>
      <Button {...props} onClick={onClick}>
        {props.children}
      </Button>
      {openConnectWalletModal && (
        <ConnectWalletModal
          connectMetamask={connectMetamask}
          connectKeplr={connectKeplr}
          disconnectMetamask={disconnectMetamask}
          disconnectKeplr={disconnectKeplr}
          address={address}
          metamaskAddress={metamaskAddress}
          isOpen={openConnectWalletModal}
          close={() => {
            setOpenConnectWalletModal(false);
          }}
          open={() => {
            setOpenConnectWalletModal(true);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default RequireAuthButton;
