import { LocalKVStore } from '@keplr-wallet/common/build/kv-store/local';
import { BSC_RPC, ORAI } from 'config/constants';
import { WalletConnect } from '@web3-react/walletconnect';
import { BSC_CHAIN_ID } from 'config/constants';
import WalletConnectProvider from '@walletconnect/ethereum-provider';
import EthereumProvider from 'components/connect-wallet/EthereumProvider';

// fix for mobile
window.browser = { storage: { local: new LocalKVStore(ORAI) } };

export const initEthereum = async () => {
  if (!window.ethereum) {
    const chainId = parseInt(BSC_CHAIN_ID, 16);

    const provider = new EthereumProvider({
      chainId,
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
