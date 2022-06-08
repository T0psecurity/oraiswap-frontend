import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 56]
});

export function useEagerConnect() {
  const { activate, connector, active, deactivate } = useWeb3React();
  const [onReload, setOnReload] = useState(true);

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }
    if (active || onReload) {
      activate(injected, undefined, true);
      setOnReload(false);
    }
  }, [activate, connector]);
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate, deactivate, library } = useWeb3React();

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleConnect = () => {
        console.log("Handling 'connect' event");
        activate(injected);
      };
      const handleChainChanged = (chainId) => {
        console.log("Handling 'chainChanged' event with payload", chainId);
        activate(injected);
      };
      const handleAccountsChanged = (accounts) => {
        console.log("Handling 'accountsChanged' event with payload", accounts);
        if (accounts.length > 0) {
          activate(injected);
        }
      };
      const handleNetworkChanged = (networkId) => {
        console.log("Handling 'networkChanged' event with payload", networkId);
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
