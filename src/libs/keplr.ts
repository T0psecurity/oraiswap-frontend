import { ChainInfo } from '@keplr-wallet/types';
import { isAndroid, isMobile } from '@walletconnect/browser-utils';
import { network } from 'constants/networks';
import { embedChainInfos } from 'networks';
import WalletConnect from '@walletconnect/client';
import { KeplrWalletConnectV1 } from '@keplr-wallet/wc-client';
import { IJsonRpcRequest, IRequestOptions } from '@walletconnect/types';
import { BroadcastMode, StdTx } from '@cosmjs/launchpad';
import Axios from 'axios';
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal';

const sendTx = async (
  chainId: string,
  tx: StdTx | Uint8Array,
  mode: BroadcastMode
): Promise<Uint8Array> => {
  const restInstance = Axios.create({
    baseURL: network.lcd
  });

  const isProtoTx = Buffer.isBuffer(tx) || tx instanceof Uint8Array;

  const params = isProtoTx
    ? {
        tx_bytes: Buffer.from(tx as any).toString('base64'),
        mode: (() => {
          switch (mode) {
            case 'async':
              return 'BROADCAST_MODE_ASYNC';
            case 'block':
              return 'BROADCAST_MODE_BLOCK';
            case 'sync':
              return 'BROADCAST_MODE_SYNC';
            default:
              return 'BROADCAST_MODE_UNSPECIFIED';
          }
        })()
      }
    : {
        tx,
        mode: mode
      };

  const result = await restInstance.post(
    isProtoTx ? '/cosmos/tx/v1beta1/txs' : '/txs',
    params
  );

  const txResponse = isProtoTx ? result.data['tx_response'] : result.data;

  if (txResponse.code != null && txResponse.code !== 0) {
    throw new Error(txResponse['raw_log']);
  }

  return Buffer.from(txResponse.txhash, 'hex');
};
export default class Keplr {
  private walletConnector: WalletConnect | undefined;
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

  onWalletConnectDisconnected = (error: Error | null) => {
    if (error) {
      console.log(error);
    } else {
      this.disconnect();
    }
  };

  /**
   * Disconnect the wallet regardless of wallet type (extension, wallet connect)
   */
  disconnect() {
    if (this.walletConnector) {
      if (this.walletConnector.connected) {
        this.walletConnector.killSession();
      }
      this.walletConnector = undefined;
    }
  }

  async getMobileKeplr(): Promise<keplrType | undefined> {
    if (!this.walletConnector) {
      this.walletConnector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
        signingMethods: [],
        qrcodeModal: WalletConnectQRCodeModal
      });
      // XXX: I don't know why they designed that the client meta options in the constructor should be always ingored...
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.walletConnector._clientMeta = {
        name: 'Osmosis',
        description: 'Osmosis is the first IBC-native Cosmos interchain AMM',
        url: 'https://oraidex.io',
        icons: [
          window.location.origin + '/public/assets/osmosis-wallet-connect.png'
        ]
      };

      this.walletConnector!.on('disconnect', this.onWalletConnectDisconnected);
    }

    if (!this.walletConnector.connected) {
      try {
        await this.walletConnector!.connect();
      } catch (e) {
        console.log(e);
        // XXX: Due to the limitation of cureent account store implementation.
        //      We shouldn't throw an error (reject) on the `getKeplr()` method.
        //      So return the `undefined` temporarily.
        //      In this case, the wallet will be considered as `NotExist`
        return undefined;
      }
    }

    return;
    new KeplrWalletConnectV1(this.walletConnector!, {
      sendTx,
      onBeforeSendRequest: this.onBeforeSendRequest
    });
  }

  protected onBeforeSendRequest = (request: Partial<IJsonRpcRequest>): void => {
    if (!isMobile()) {
      return;
    }

    const deepLink = isAndroid()
      ? 'intent://wcV1#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;'
      : 'keplrwallet://wcV1';

    switch (request.method) {
      case 'keplr_enable_wallet_connect_v1':
        // Keplr mobile requests another per-chain permission for each wallet connect session.
        // By the current logic, `enable()` is requested immediately after wallet connect is connected.
        // However, in this case, two requests are made consecutively.
        // So in ios, the deep link modal pops up twice and confuses the user.
        // To solve this problem, enable on the osmosis chain does not open deep links.
        if (
          request.params &&
          request.params.length === 1 &&
          request.params[0] === network.chainId
        ) {
          break;
        }
        window.location.href = deepLink;
        break;
      case 'keplr_sign_amino_wallet_connect_v1':
        window.location.href = deepLink;
        break;
    }

    return;
  };

  async getKeplr(): Promise<keplrType | undefined> {
    if (isMobile()) {
      console.log('isMobile');
      return this.getMobileKeplr();
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
