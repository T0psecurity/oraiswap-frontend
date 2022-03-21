import { ChainInfo } from '@keplr-wallet/types';
import { isMobile } from '@walletconnect/browser-utils';
import { network } from 'constants/networks';
import { embedChainInfos } from 'networks';

export default class Keplr {
  constructor() {
    window.onload = async () => {
      if (window.keplr) {
        // window.keplr.defaultOptions = {
        //     sign: {
        //         preferNoSetFee: true,
        //         preferNoSetMemo: true,
        //     },
        // };
      }
    };
  }

  suggestChain = async (chainId: string) => {
    const chainInfo = embedChainInfos.find(
      (chainInfo) => chainInfo.chainId === chainId
    );
    if (!chainInfo) return;
    await window.keplr.experimentalSuggestChain(chainInfo);
    await window.keplr.enable(chainInfo.chainId);
  };

  // private getKeplrMobile: Promise<Keplr | undefined> {

  //     if (!this.walletConnector) {
  //       this.walletConnector = new WalletConnect({
  //         bridge: 'https://bridge.walletconnect.org',
  //         signingMethods: [],
  //         qrcodeModal: new WalletConnectQRCodeModalV1Renderer()
  //       });
  //       // XXX: I don't know why they designed that the client meta options in the constructor should be always ingored...
  //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //       // @ts-ignore
  //       this.walletConnector._clientMeta = {
  //         name: 'Osmosis',
  //         description: 'Osmosis is the first IBC-native Cosmos interchain AMM',
  //         url: 'https://app.osmosis.zone',
  //         icons: [
  //           window.location.origin + '/public/assets/osmosis-wallet-connect.png'
  //         ]
  //       };

  //       this.walletConnector!.on(
  //         'disconnect',
  //         this.onWalletConnectDisconnected
  //       );
  //     }

  //     if (!this.walletConnector.connected) {
  //       return new Promise<Keplr | undefined>((resolve, reject) => {
  //         this.walletConnector!.connect()
  //           .then(() => {
  //             localStorage?.removeItem(KeyConnectingWalletType);
  //             localStorage?.setItem(
  //               KeyAutoConnectingWalletType,
  //               'wallet-connect'
  //             );
  //             this.autoConnectingWalletType = 'wallet-connect';

  //             resolve(
  //               new KeplrWalletConnectV1(this.walletConnector!, {
  //                 sendTx,
  //                 onBeforeSendRequest: this.onBeforeSendRequest
  //               })
  //             );
  //           })
  //           .catch((e) => {
  //             console.log(e);
  //             // XXX: Due to the limitation of cureent account store implementation.
  //             //      We shouldn't throw an error (reject) on the `getKeplr()` method.
  //             //      So return the `undefined` temporarily.
  //             //      In this case, the wallet will be considered as `NotExist`
  //             resolve(undefined);
  //           });
  //       });
  //     } else {
  //       localStorage?.removeItem(KeyConnectingWalletType);
  //       localStorage?.setItem(KeyAutoConnectingWalletType, 'wallet-connect');
  //       this.autoConnectingWalletType = 'wallet-connect';

  //       return Promise.resolve(
  //         new KeplrWalletConnectV1(this.walletConnector, {
  //           sendTx,
  //           onBeforeSendRequest: this.onBeforeSendRequest
  //         })
  //       );
  //     }

  // }

  async getKeplr(): Promise<keplrType | undefined> {
    if (isMobile()) {
      console.log('isMobile');
      return;
    }

    if (window.keplr) {
      return window.keplr;
    }

    if (document.readyState === 'complete') {
      return window.keplr;
    }

    return new Promise((resolve) => {
      const documentStateChange = (event: Event) => {
        if (
          event.target &&
          (event.target as Document).readyState === 'complete'
        ) {
          resolve(window.keplr);
          document.removeEventListener('readystatechange', documentStateChange);
        }
      };

      document.addEventListener('readystatechange', documentStateChange);
    });
  }

  private async getKeplrKey(chain_id?: string): Promise<any | undefined> {
    let chainId = network.chainId;
    if (chain_id) chainId = chain_id;
    if (!chainId) return undefined;
    const keplr = await this.getKeplr();
    if (keplr) {
      return keplr.getKey(chainId);
    }
    return undefined;
  }

  async getKeplrAddr(chain_id?: string): Promise<String | undefined> {
    const key = await this.getKeplrKey(chain_id);
    return key.bech32Address;
  }

  async getKeplrPubKey(): Promise<Uint8Array | undefined> {
    const key = await this.getKeplrKey();
    return key.pubKey;
  }
}
