import { LocalKVStore } from '@keplr-wallet/common/build/kv-store/local';
import { ORAI } from 'config/constants';

// fix for mobile
window.browser = { storage: { local: new LocalKVStore(ORAI) } };

const initEthereum = async () => {
  const ethereumProvider = await detectEthereumProvider();

  if (ethereumProvider) {
    window.ethereum = ethereumProvider;
    console.log('Ethereum successfully detected!');
  } else {
    // if the provider is not detected, detectEthereumProvider resolves to null
    console.log('Please connect MetaMask!');
  }
};

function detectEthereumProvider<T = MetaMaskEthereumProvider>({
  mustBeMetaMask = false,
  silent = false,
  timeout = 3000
} = {}): Promise<T | null> {
  let handled = false;

  return new Promise((resolve) => {
    if ((window as Window).ethereum) {
      handleEthereum();
    } else {
      window.addEventListener('ethereum#initialized', handleEthereum, {
        once: true
      });

      setTimeout(() => {
        handleEthereum();
      }, timeout);
    }

    function handleEthereum() {
      if (handled) {
        return;
      }
      handled = true;

      window.removeEventListener('ethereum#initialized', handleEthereum);

      const { ethereum } = window as Window;

      if (ethereum && (!mustBeMetaMask || ethereum.isMetaMask)) {
        resolve(ethereum as unknown as T);
      } else {
        const message =
          mustBeMetaMask && ethereum
            ? 'Non-MetaMask window.ethereum detected.'
            : 'Unable to detect window.ethereum.';

        !silent && console.error('@metamask/detect-provider:', message);
        resolve(null);
      }
    }
  });
}

initEthereum();
