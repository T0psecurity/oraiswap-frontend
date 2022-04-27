//@ts-nocheck
import { Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { network } from 'constants/networks';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import ConnectWalletModal from './ConnectWalletModal';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 15]
});

const RequireAuthButton: React.FC<any> = ({
  address,
  metamaskAddress,
  setMetamaskAddress,
  setAddress,
  ...props
}) => {
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);

  const { active, error, activate, deactivate } = useWeb3React();

  const onClick = () => {
    setOpenConnectWalletModal(true);
  };

  const connectMetamask = async () => {
    try {
      await activate(injected);
      setMetamaskAddress(await injected.getAccount());
      // window.location.reload();
    } catch (ex) {
      console.log(ex);
    }
  };

  const disconnectMetamask = async () => {
    try {
      deactivate();
      setMetamaskAddress('');
    } catch (ex) {
      console.log(ex);
    }
  };

  const connectKeplr = async () => {
    console.log('suggest');
    if (!(await window.Keplr.getKeplr())) {
      alert('You must install Keplr to continue');
      return;
    }

    await window.Keplr.suggestChain(network.chainId);
    const address = await window.Keplr.getKeplrAddr();
    console.log(address);
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

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      try {
        if (!active && !metamaskAddress && !error) {
          await activate(injected);
          // reset provider
          setMetamaskAddress(await injected.getAccount());
        }
      } catch (err) {
        console.log(err);
      }
    };
    connectWalletOnPageLoad();
  }, []);

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
