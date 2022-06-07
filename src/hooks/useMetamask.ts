import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useLocation } from 'react-router-dom';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 56],
});

export function useEagerConnect(isInactive) {
  const web3React = useWeb3React();
  const { pathname } = useLocation();

  useEffect(() => {
    console.log(web3React.account);

    if (
      !web3React.account &&
      !isInactive &&
      (pathname === '/' || pathname === '/bridge')
    ) {
      web3React.activate(injected, undefined, true);
    }
  }, [web3React, pathname]);
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate, deactivate, library } = useWeb3React();

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleConnect = () => {
        activate(injected);
      };
      const handleChainChanged = (chainId) => {
        activate(injected);
      };
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          activate(injected);
        }
      };
      const handleNetworkChanged = (networkId) => {
        activate(injected);
      };

      const handleDisconnect = () => {
        if (library?.provider?.isMetamask) {
          deactivate();
        }
      };

      ethereum.on('connect', handleConnect);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('networkChanged', handleNetworkChanged);
      ethereum.on('disconnect', handleDisconnect);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect);
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('networkChanged', handleNetworkChanged);
          ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [active, error, suppress, activate]);
}
