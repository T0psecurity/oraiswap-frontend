import { BSC_RPC, ORAI } from 'config/constants';
import { BSC_CHAIN_ID } from 'config/constants';
import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { isMobile } from '@walletconnect/browser-utils';

// polyfill for keplr extension
if (!window.browser || !window.browser.storage) {
  const { LocalKVStore } = require('@keplr-wallet/common/build/kv-store/local');
  window.browser = { storage: { local: new LocalKVStore(ORAI) } };
}

export const initEthereum = async () => {
  // support only https
  if (isMobile() && !window.ethereum && window.location.protocol === 'https:') {
    const chainId = parseInt(BSC_CHAIN_ID, 16);
    const provider = new WalletConnectProvider({
      chainId,
      storageId: 'metamask',
      qrcode: true,
      rpc: { [chainId]: BSC_RPC },
      qrcodeModalOptions: {
        mobileLinks: ['metamask']
      }
    });
    await provider.enable();
    (window.ethereum as any) = provider;
  }
};
