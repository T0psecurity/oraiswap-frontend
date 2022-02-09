import Cosmos from '@oraichain/cosmosjs';
import { BIP32Interface, fromPrivateKey } from 'bip32';
import { Buffer } from 'buffer';
import { sha256 } from 'js-sha256';
import { getMobileOperatingSystem } from './utils';
import { network } from 'constants/networks';

/** basically query and execute, with param : contract, lcd, and simulate is true or false
 */
const message = Cosmos.message;

const loadKeyStation = (lcd: string, keystationUrl: string) => {
  if (window.Wallet) {
    return;
  }
  const script = document.createElement('script');
  script.src = `${keystationUrl}/lib/keystation.js?v=0.0.3`;
  script.async = true;
  script.onload = () => {
    window.Wallet = new window.Keystation({
      keystationUrl,
      lcd
    });
  };
  script.onerror = (error) => {
    // handle error
    console.log('Can not load keystation library!');
  };

  document.body.appendChild(script);
};

/**
 * If there is chainId it will interacte with blockchain, otherwise using simulator
 */
class Wasm {
  public cosmos: Cosmos;
  private childKeys: Map<string, BIP32Interface | undefined> = new Map();
  constructor(baseUrl: string, chainId = 'Simulate') {
    this.cosmos = new Cosmos(baseUrl.replace(/\/$/, ''), chainId);
    this.cosmos.setBech32MainPrefix('orai');
    loadKeyStation(baseUrl, network.walletUrl.replace(/\/$/, ''));
  }

  /**
   * query with json string
   * */
  async query(address: string, input: string) {
    const param = Buffer.from(input).toString('base64');
    if (this.cosmos.chainId === 'Simulate') {
      return this.cosmos.get(`/wasm/contract/${address}/query/${param}`);
    }
    return this.cosmos.get(`/wasm/v1beta1/contract/${address}/smart/${param}`);
  }

  /**
   * execute smart contract require childKey when interacting with blockchain
   * @param {*} address   : the wallet address
   * @param {*} input     : the string from JSON.stringify
   * @param {*} pathOrChildKey   : can be account on simulate or hd path | childKey on blockchain
   * @param {*} options   : custom options {gas, fees, funds: for swap native token}
   * @returns Promise<any>
   */

  async execute(
    address: string,
    input: string,
    {
      gas,
      fees,
      funds,
      memo,
      mode = 'BROADCAST_MODE_SYNC'
    }: ExecuteOptions = {}
  ): Promise<any> {
    const param = Buffer.from(input);
    const pathOrChildKey = await this.getChildKey();
    if (this.cosmos.chainId === 'Simulate') {
      return this.cosmos.get(
        `/wasm/contract/${address}/handle/${param.toString(
          'base64'
        )}?account=${pathOrChildKey}`
      );
    }

    const childKey =
      typeof pathOrChildKey === 'string'
        ? await this.getChildKey(pathOrChildKey as string)
        : pathOrChildKey;
    if (!childKey) {
      return;
    }
    const sender = this.cosmos.getAddress(childKey);
    const txBody = this.getHandleMessage(address, param, sender, funds, memo);

    return this.cosmos.submit(
      childKey,
      txBody,
      mode,
      fees ? fees : 0,
      gas ? gas : 200000
    );
  }

  testChildKey(path?: string): BIP32Interface | undefined {
    const key = path ?? 'default';
    return this.childKeys.get(key);
  }

  removeChildkey(path?: string): boolean {
    const key = path ?? 'default';
    return this.childKeys.delete(key);
  }

  setChildkey(childKey: BIP32Interface, path?: string) {
    const key = path ?? 'default';
    this.childKeys.set(key, childKey);
  }

  async getChildKeyValue(path?: string): Promise<ChildKeyData> {
    let childKeyValue;
    // @ts-ignore
    if (window?.ReactNativeWebView?.postMessage) {
      childKeyValue = await window.Wasm.getChildKeyFromMobile();
    } else {
      childKeyValue = await window.Wallet.getChildKey(path);
    }
    // @ts-ignore
    return childKeyValue || {};
  }

  async getChildKey(path?: string): Promise<BIP32Interface | undefined> {
    if (window.Wallet) {
      const key = path ?? 'default';
      let childKey = this.childKeys.get(key);
      if (!childKey) {
        // @ts-ignore
        const { privateKey, chainCode, network } = await this.getChildKeyValue(
          path
        );

        childKey = fromPrivateKey(
          Buffer.from(privateKey),
          Buffer.from(chainCode),
          network
        );
        this.childKeys.set(key, childKey);
      }

      return childKey;
    }
  }

  getChildKeyFromMobile() {
    return new Promise((resolve, reject) => {
      let listener = document;
      const isIOS = getMobileOperatingSystem() === 'iOS';
      if (isIOS) {
        // @ts-ignore
        listener = window;
      }
      listener.addEventListener('message', (res) => {
        // @ts-ignore
        const data = JSON.parse(res?.data);
        const { payload, type } = data || {};
        if (type === 'cancel') {
          resolve(null);
          return;
        }
        if (type === 'childKey' && payload) {
          const value = JSON.parse(payload);
          const childKey = window.Wasm.formatChildKeyFromMobile(value);
          resolve(childKey);
        }
      });
      window.Wasm.requestGetChildKey();
    });
  }

  requestGetChildKey = () => {
    const postMessageProxy = function (data: any) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(data);
    };
    postMessageProxy(JSON.stringify({ type: 'Login' }));
  };

  formatChildKeyFromMobile(childKeyMobile: any) {
    const { privateKey, chainCode, network } = childKeyMobile;
    const childKey = fromPrivateKey(
      Buffer.from(privateKey.data),
      Buffer.from(chainCode.data),
      network
    );
    return childKey;
  }

  /**
   * get the public wallet address given a child key
   * @returns string
   */
  getAddress(childKey: any): string {
    if (!childKey) return '';
    return this.cosmos.getAddress(childKey);
  }

  /**
   * get an object containing marketplace and ow721 contract addresses
   * @returns ContractAddress
   */
  get contractAddresses(): ContractAddress {
    return {
      marketplace: process.env.REACT_APP_MARKET_PLACE_CONTRACT,
      ow721: process.env.REACT_APP_NFT_TOKEN_CONTRACT,
      lock: process.env.REACT_APP_LOCK_CONTRACT_ADDR,
      auction: process.env.REACT_APP_AUCTION_CONTRACT
    };
  }

  get statusCode(): StatusCode {
    const { statusCode } = this.cosmos;
    console.log('status code: ', statusCode);
    return {
      SUCCESS: statusCode.SUCCESS,
      NOT_FOUND: statusCode.NOT_FOUND,
      GENERIC_ERROR: statusCode.GENERIC_ERROR
    };
  }

  async getSignedData(data: string): Promise<SignedData | undefined> {
    const pathOrChildKey = await this.getChildKey();
    const childKey =
      typeof pathOrChildKey === 'string'
        ? await this.getChildKey(pathOrChildKey as string)
        : pathOrChildKey;
    if (!childKey) {
      return;
    }
    const hash = Buffer.from(sha256.digest(data));
    const signature = Buffer.from(
      this.cosmos.signRaw(hash, childKey.privateKey as Uint8Array)
    );
    return {
      signature: signature.toString('base64'),
      publicKey: childKey.publicKey.toString('base64')
    };
  }

  getHandleMessage(
    contract: string,
    msg: Buffer,
    sender: string,
    funds?: string,
    memo?: string
  ): any {
    const sent_funds = funds
      ? [{ denom: this.cosmos.bech32MainPrefix, amount: funds }]
      : null;

    const msgSend = new message.cosmwasm.wasm.v1beta1.MsgExecuteContract({
      contract,
      msg,
      sender,
      sent_funds
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmwasm.wasm.v1beta1.MsgExecuteContract',
      value: message.cosmwasm.wasm.v1beta1.MsgExecuteContract.encode(
        msgSend
      ).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo
    });
  }

  getSendMessage(
    sender: string,
    memo: string,
    toAddress: string,
    amount: number
  ): any {
    const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
      from_address: sender,
      to_address: toAddress,
      amount: [
        { denom: this.cosmos.bech32MainPrefix, amount: amount.toString() }
      ]
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmos.bank.v1beta1.MsgSend',
      value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo
    });
  }

  encodeTxBody(txBody: any): Uint8Array {
    return message.cosmos.tx.v1beta1.TxBody.encode(txBody).finish();
  }
}

export default Wasm;
window.Wasm = new Wasm(network.lcd, network.chainId);
