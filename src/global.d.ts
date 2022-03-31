import { BroadCastMode } from '@oraichain/cosmosjs';
import Keplr from './libs/keplr';
import { Keplr as keplr } from './types/kelpr/wallet';

declare global {
  type keplrType = keplr;
  interface Window {
    Keplr: Keplr;
    keplr: keplr;
  }

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
    }
  }
}

export {};
