import { Network } from 'bip32';
import { Buffer } from 'buffer';
import Keplr from '../libs/kelpr';
import { Keplr as keplr } from './kelpr/wallet';
import Wasm from '../libs/wasm';
import Web3 from 'web3';

declare global {
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
    Wasm: Wasm;
    Keplr: Keplr;
    web3: Web3;
    ethereum: provider;
    Metamask: Metamask;
    keplr: keplr;
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

      // config for ibc denom
      REACT_APP_ATOM_ORAICHAIN_DENOM: string;
      REACT_APP_LUNA_ORAICHAIN_DENOM: string;
      REACT_APP_UST_ORAICHAIN_DENOM: string;
      REACT_APP_OSMOSIS_ORAICHAIN_DENOM: string;

      // config for oraichain token
      REACT_APP_AIRI_CONTRACT: string;
      REACT_APP_ORAIX_CONTRACT: string;

      // config for oraichain contract
      REACT_APP_FACTORY_CONTRACT: string;
      REACT_APP_ROUTER_CONTRACT: string;
      REACT_APP_ORACLE_CONTRACT: string;
      REACT_APP_GRAVITY_CONTRACT: string;
      REACT_APP_STAKING_CONTRACT: string;
      REACT_APP_REWARDER_CONTRACT: string;
    }
  }
}

declare module 'crypto-hashing';

export {};
