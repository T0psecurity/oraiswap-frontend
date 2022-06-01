import { BSC_RPC } from 'config/constants';
import { BSC_CHAIN_ID } from 'config/constants';
import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { isMobile } from '@walletconnect/browser-utils';

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
