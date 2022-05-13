import { Network } from 'bip32';
import { Buffer } from 'buffer';
import { KVStore } from '@keplr-wallet/common';
import Keplr from '../libs/keplr';
import { Keplr as keplr } from '@keplr-wallet/types';
import Web3 from 'web3';
import Metamask from '../libs/metamask';
import { AbstractProvider } from 'web3-core';

declare global {
  type MetaMaskEthereumProvider = AbstractProvider & {
    chainId: string;
    isMetaMask?: boolean;
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    addListener(
      eventName: string | symbol,
      listener: (...args: any[]) => void
    ): this;
    removeListener(
      eventName: string | symbol,
      listener: (...args: any[]) => void
    ): this;
    removeAllListeners(event?: string | symbol): this;
  };

  type Browser = {
    storage: {
      local: KVStore;
    };
  };

  type Fund = {
    denom: string;
    amount: string;
  };

  type Funds = Fund[];

  type ExecuteOptions = {
    gas?: number;
    fees?: number;
    funds?: Funds;
    memo?: string;
  };

  type ExecuteKeplrOptions = {
    accountNumber: Long | null;
    sequence: number;
    gas: number;
    fees: number;
    mode?: BroadCastMode;
  };

  type SignedData = {
    signature: string;
    publicKey: string;
  };

  type ContractAddress = {
    marketplace: string | undefined;
    ow721: string | undefined;
    lock?: string | undefined;
    auction: string | undefined;
  };

  type StatusCode = {
    SUCCESS: number;
    NOT_FOUND: number;
    GENERIC_ERROR: number;
  };

  interface FileData {
    name: string;
    data: Buffer;
  }

  interface PoolInfo {
    offerPoolAmount: number;
    askPoolAmount: number;
  }

  interface ChildKeyData {
    privateKey: Buffer;
    chainCode: Buffer;
    network: Network;
  }

  declare class Wallet {
    getChildKey(path?: string): Promise<ChildKeyData>;
    send(message: any);
    deploy(file: FileData);
  }
  interface Window {
    MSStream: String;
    Keystation: any;
    Wallet: Wallet;
    Keplr: Keplr;
    web3: Web3;
    ethereum: MetaMaskEthereumProvider;
    Metamask: Metamask;
    keplr: keplr;
    browser: Browser;
    queryIfDatasetMinted({ tokenId: string }): Promise<boolean>;
  }

  declare const APP_SETTINGS: Record<string, any>;
  type keplrType = keplr;
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_NETWORK: 'testnet' | 'mainnet';

      REACT_APP_SITE_TITLE: string;
      REACT_APP_SITE_DESC: string;

      // config for relayer
      REACT_APP_ATOM_ORAICHAIN_CHANNELS: string;
      REACT_APP_TERRA_ORAICHAIN_CHANNELS: string;
      REACT_APP_OSMOSIS_ORAICHAIN_CHANNELS: string;
      REACT_APP_ORAIB_ORAICHAIN_CHANNELS: string;

      // config for ibc denom
      REACT_APP_ATOM_ORAICHAIN_DENOM: string;
      REACT_APP_LUNA_ORAICHAIN_DENOM: string;
      REACT_APP_UST_ORAICHAIN_DENOM: string;
      REACT_APP_OSMOSIS_ORAICHAIN_DENOM: string;
      REACT_APP_ORAIBSC_ORAICHAIN_DENOM: string;
      REACT_APP_AIRIBSC_ORAICHAIN_DENOM: string;
      REACT_APP_USDTBSC_ORAICHAIN_DENOM: string;

      // config for oraichain token
      REACT_APP_AIRI_CONTRACT: string;
      REACT_APP_ORAIX_CONTRACT: string;
      REACT_APP_USDT_CONTRACT: string;

      // config for oraichain contract
      REACT_APP_FACTORY_CONTRACT: string;
      REACT_APP_ROUTER_CONTRACT: string;
      REACT_APP_ORACLE_CONTRACT: string;
      REACT_APP_GRAVITY_BSC_CONTRACT: string;
      REACT_APP_GRAVITY_ETH_CONTRACT: string;
      REACT_APP_STAKING_CONTRACT: string;
      REACT_APP_REWARDER_CONTRACT: string;
      REACT_APP_CONVERTER_CONTRACT: string;
      REACT_APP_DEPRECATED: string;
    }
  }
}

declare module 'crypto-hashing';

export {};
