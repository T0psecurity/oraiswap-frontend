import React, { ReactElement } from 'react';
import { ReactComponent as ORAI } from 'assets/icons/oraichain.svg';
import { ReactComponent as OSMO } from 'assets/icons/osmosis.svg';
import { ReactComponent as ATOMCOSMOS } from 'assets/icons/atom_cosmos.svg';
import { ReactComponent as LUNA } from 'assets/icons/luna.svg';
import { ReactComponent as UST } from 'assets/icons/luna_ust.svg';
import { ReactComponent as AIRI } from 'assets/icons/airi.svg';
import { ReactComponent as USDT } from 'assets/icons/tether.svg';
import { ReactComponent as KWT } from 'assets/icons/kwt.svg';
import { network, NetworkKey } from './networks';
import _ from 'lodash';
import {
  AIRI_BSC_CONTRACT,
  BEP20_ORAI,
  BSC_CHAIN_ID,
  BSC_ORG,
  BSC_RPC,
  COSMOS_DECIMALS,
  ERC20_ORAI,
  ETHEREUM_CHAIN_ID,
  ETHEREUM_RPC,
  EVM_DECIMALS,
  KAWAII_CONTRACT,
  KAWAII_LCD,
  KAWAII_RPC,
  KAWAII_SUBNET_RPC,
  KWT_BSC_CONTRACT,
  KWT_DENOM,
  KWT_SUBNETWORK_CHAIN_ID,
  ORAI_BRIDGE_CHAIN_ID,
  ORAI_BRIDGE_EVM_DENOM_PREFIX,
  ORAI_BRIDGE_LCD,
  ORAI_BRIDGE_PREFIX,
  ORAI_BRIDGE_RPC,
  ORAI_BRIDGE_UDENOM,
  ORAI_BSC_CONTRACT,
  ORAI_ETH_CONTRACT,
  STABLE_DENOM,
  USDT_BSC_CONTRACT,
} from './constants';

export type Erc20Cw20Map = {
  erc20Type: string;
  decimals: {
    erc20Decimals: number,
    cw20Decimals: number,
  };
  erc20Denom: string;
}

export type TokenItemType = {
  name: string;
  org?:
  | 'Terra'
  | 'Oraichain'
  | 'Cosmos Hub'
  | 'Osmosis'
  | 'OraiBridge'
  | 'BNB Chain'
  | 'Ethereum'
  | 'Kawaiiverse';
  denom: string;
  prefix?: string;
  contractAddress?: string;
  erc20Cw20Map?: Erc20Cw20Map[];
  bridgeNetworkIdentifier?: string;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  chainId: string;
  coinType?: number;
  rpc: string;
  lcd?: string;
  decimals: number;
  maxGas?: number;
  coingeckoId:
  | 'oraichain-token'
  | 'osmosis'
  | 'cosmos'
  | 'ethereum'
  | 'bnb'
  | 'airight'
  | 'terrausd'
  | 'terra-luna'
  | 'oraix'
  | 'tether'
  | 'kawaii-islands';
  cosmosBased: Boolean;
};

const tokensMap: Record<NetworkKey, [TokenItemType[], TokenItemType[]]> = {
  [NetworkKey.TESTNET]: [[], []],
  [NetworkKey.MAINNET]: [
    [
      {
        name: 'ATOM',
        org: 'Cosmos Hub',
        coinType: 118,
        prefix: 'cosmos',
        coingeckoId: 'cosmos',
        denom: 'uatom',
        decimals: COSMOS_DECIMALS,
        chainId: 'cosmoshub-4',
        rpc: 'https://rpc-cosmos.oraidex.io',
        lcd: 'https://lcd-cosmoshub.keplr.app',
        cosmosBased: true,
        maxGas: 20000 * 0.16,
        Icon: ATOMCOSMOS,
      },
      {
        name: 'LUNA',
        org: 'Terra',
        prefix: 'terra',
        coinType: 330,
        coingeckoId: 'terra-luna',
        denom: 'uluna',
        decimals: COSMOS_DECIMALS,
        chainId: 'columbus-5',
        rpc: 'https://rpc-terra.orai.io',
        lcd: 'https://lcd-columbus.keplr.app',
        cosmosBased: true,
        maxGas: 20000 * 0.16,
        Icon: LUNA,
      },
      {
        name: 'UST',
        org: 'Terra',
        prefix: 'terra',
        coinType: 330,
        coingeckoId: 'terrausd',
        denom: 'uusd',
        decimals: COSMOS_DECIMALS,
        chainId: 'columbus-5',
        rpc: 'https://rpc-terra.orai.io',
        lcd: 'https://lcd-columbus.keplr.app',
        cosmosBased: true,
        Icon: UST,
      },
      {
        name: 'OSMO',
        org: 'Osmosis',
        prefix: 'osmo',
        denom: 'uosmo',
        coinType: 118,
        chainId: 'osmosis-1',
        rpc: 'https://osmosis.rpc.orai.io',
        lcd: 'https://lcd-osmosis.keplr.app',
        decimals: COSMOS_DECIMALS,
        coingeckoId: 'osmosis',
        cosmosBased: true,
        maxGas: 20000 * 0.025,
        Icon: OSMO,
      },
      {
        name: 'ORAI',
        prefix: ORAI_BRIDGE_PREFIX,
        org: 'OraiBridge',
        chainId: ORAI_BRIDGE_CHAIN_ID,
        coinType: 118,
        denom: ORAI_BRIDGE_EVM_DENOM_PREFIX + ORAI_BSC_CONTRACT,
        bridgeNetworkIdentifier: BSC_ORG,
        rpc: ORAI_BRIDGE_RPC,
        lcd: ORAI_BRIDGE_LCD,
        decimals: EVM_DECIMALS,
        coingeckoId: 'oraichain-token',
        cosmosBased: true,
        Icon: ORAI,
      },
      {
        name: 'AIRI',
        prefix: ORAI_BRIDGE_PREFIX,
        org: 'OraiBridge',
        chainId: ORAI_BRIDGE_CHAIN_ID,
        coinType: 118,
        denom: ORAI_BRIDGE_EVM_DENOM_PREFIX + AIRI_BSC_CONTRACT,
        bridgeNetworkIdentifier: BSC_ORG,
        rpc: ORAI_BRIDGE_RPC,
        lcd: ORAI_BRIDGE_LCD,
        decimals: EVM_DECIMALS,
        coingeckoId: 'airight',
        cosmosBased: true,
        Icon: AIRI,
      },
      {
        name: 'USDT',
        prefix: ORAI_BRIDGE_PREFIX,
        org: 'OraiBridge',
        chainId: ORAI_BRIDGE_CHAIN_ID,
        coinType: 118,
        denom: ORAI_BRIDGE_EVM_DENOM_PREFIX + USDT_BSC_CONTRACT,
        bridgeNetworkIdentifier: BSC_ORG,
        rpc: ORAI_BRIDGE_RPC,
        lcd: ORAI_BRIDGE_LCD,
        decimals: EVM_DECIMALS,
        coingeckoId: 'tether',
        cosmosBased: true,
        Icon: USDT,
      },
      {
        name: 'KWT',
        prefix: ORAI_BRIDGE_PREFIX,
        org: 'OraiBridge',
        chainId: ORAI_BRIDGE_CHAIN_ID,
        bridgeNetworkIdentifier: BSC_ORG,
        coinType: 118,
        denom: KWT_DENOM,
        rpc: ORAI_BRIDGE_RPC,
        lcd: ORAI_BRIDGE_LCD,
        decimals: EVM_DECIMALS,
        coingeckoId: 'kawaii-islands',
        cosmosBased: true,
        Icon: KWT,
      },
      // {
      //   name: 'ERC20 ORAI',
      //   org: 'Ethereum',
      //   coingeckoId: 'oraichain-token',
      //   denom: ERC20_ORAI,
      //   contractAddress: ORAI_ETH_CONTRACT,
      //   decimals: EVM_DECIMALS,
      //   chainId: ETHEREUM_CHAIN_ID,
      //   rpc: ETHEREUM_RPC,
      //   cosmosBased: false,
      //   Icon: ORAI
      // },
      {
        name: 'ORAI',
        org: BSC_ORG,
        chainId: BSC_CHAIN_ID,
        denom: BEP20_ORAI,
        contractAddress: ORAI_BSC_CONTRACT,
        rpc: BSC_RPC,
        decimals: EVM_DECIMALS,
        coingeckoId: 'oraichain-token',
        cosmosBased: false,
        Icon: ORAI,
      },
      {
        name: 'AIRI',
        org: BSC_ORG,
        chainId: BSC_CHAIN_ID,
        denom: 'bep20_airi',
        contractAddress: AIRI_BSC_CONTRACT,
        rpc: BSC_RPC,
        decimals: EVM_DECIMALS,
        coingeckoId: 'airight',
        cosmosBased: false,
        Icon: AIRI,
      },
      {
        name: 'USDT',
        org: BSC_ORG,
        chainId: BSC_CHAIN_ID,
        denom: 'bep20_usdt',
        contractAddress: USDT_BSC_CONTRACT,
        rpc: BSC_RPC,
        decimals: EVM_DECIMALS,
        coingeckoId: 'tether',
        cosmosBased: false,
        Icon: USDT,
      },
      {
        name: 'KWT',
        org: BSC_ORG,
        chainId: BSC_CHAIN_ID,
        denom: 'bep20_kwt',
        contractAddress: KWT_BSC_CONTRACT,
        rpc: BSC_RPC,
        decimals: EVM_DECIMALS,
        coingeckoId: 'kawaii-islands',
        cosmosBased: false,
        Icon: KWT,
      },
      {
        name: 'KWT',
        org: 'Kawaiiverse',
        chainId: KWT_SUBNETWORK_CHAIN_ID,
        denom: process.env.REACT_APP_KWT_SUB_NETWORK_DENOM,
        decimals: EVM_DECIMALS,
        coingeckoId: 'kawaii-islands',
        rpc: KAWAII_RPC,
        lcd: KAWAII_LCD,
        cosmosBased: true,
        maxGas: 200000 * 2,
        Icon: KWT,
      },
      {
        name: 'ERC20 KWT',
        org: 'Kawaiiverse',
        chainId: KWT_SUBNETWORK_CHAIN_ID,
        denom: 'erc20_kwt',
        contractAddress: KAWAII_CONTRACT,
        rpc: KAWAII_SUBNET_RPC,
        lcd: KAWAII_LCD,
        decimals: EVM_DECIMALS,
        coingeckoId: 'kawaii-islands',
        cosmosBased: false,
        Icon: KWT,
      },
    ],
    [
      {
        name: 'ORAI',
        org: 'Oraichain',
        prefix: 'orai',
        coinType: 118,
        denom: 'orai',
        coingeckoId: 'oraichain-token',
        erc20Cw20Map: [{ erc20Type: BSC_CHAIN_ID, decimals: { erc20Decimals: EVM_DECIMALS, cw20Decimals: COSMOS_DECIMALS }, erc20Denom: process.env.REACT_APP_ORAIBSC_ORAICHAIN_DENOM }],
        decimals: COSMOS_DECIMALS,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ORAI,
      },
      {
        name: 'ATOM',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'cosmos',
        coinType: 118,
        denom: process.env.REACT_APP_ATOM_ORAICHAIN_DENOM,
        decimals: COSMOS_DECIMALS,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ATOMCOSMOS,
      },
      {
        name: 'LUNA',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'terra-luna',
        coinType: 118,
        denom: process.env.REACT_APP_LUNA_ORAICHAIN_DENOM,
        decimals: COSMOS_DECIMALS,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: LUNA,
      },
      {
        name: 'UST',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'terrausd',
        coinType: 118,
        denom: process.env.REACT_APP_UST_ORAICHAIN_DENOM,
        decimals: COSMOS_DECIMALS,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: UST,
      },
      {
        name: 'AIRI',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'airight',
        denom: 'airi',
        contractAddress: process.env.REACT_APP_AIRI_CONTRACT,
        erc20Cw20Map: [{ erc20Type: BSC_CHAIN_ID, decimals: { erc20Decimals: EVM_DECIMALS, cw20Decimals: COSMOS_DECIMALS }, erc20Denom: process.env.REACT_APP_AIRIBSC_ORAICHAIN_DENOM }],
        decimals: COSMOS_DECIMALS,
        coinType: 118,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: AIRI,
      },
      {
        name: 'USDT',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'tether',
        denom: STABLE_DENOM,
        contractAddress: process.env.REACT_APP_USDT_CONTRACT,
        erc20Cw20Map: [{ erc20Type: BSC_CHAIN_ID, decimals: { erc20Decimals: EVM_DECIMALS, cw20Decimals: COSMOS_DECIMALS }, erc20Denom: process.env.REACT_APP_USDTBSC_ORAICHAIN_DENOM, }],
        decimals: COSMOS_DECIMALS,
        coinType: 118,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: USDT,
      },
      // {
      //   name: 'OSMO',
      //   org: 'Oraichain',
      //   denom: process.env.REACT_APP_OSMOSIS_ORAICHAIN_DENOM,
      //   prefix: 'orai',
      //   coinType: 118,
      //   chainId: 'Oraichain',
      //   rpc: 'https://rpc.orai.io',
      //   lcd: 'https://lcd.orai.io',
      //   decimals:COSMOS_DECIMALS,
      //   coingeckoId: 'osmosis',
      //   cosmosBased: true,
      //   Icon: OSMO
      // },
      // {
      //   name: 'Erc20 ORAI',
      //   org: 'Oraichain',
      //   prefix: 'orai',
      //   coingeckoId: 'oraichain-token',
      //   denom: 'ibc/erc20_orai',
      //   decimals:COSMOS_DECIMALS,
      //   chainId: 'Oraichain',
      //   rpc: 'https://rpc.orai.io',
      //   lcd: 'https://lcd.orai.io',
      //   cosmosBased: true,
      //   Icon: ETH
      // },
      // {
      //   name: 'ORAI',
      //   org: 'Oraichain',
      //   prefix: 'orai',
      //   coingeckoId: 'oraichain-token',
      //   denom: process.env.REACT_APP_ORAIBSC_ORAICHAIN_DENOM,
      //   decimals: EVM_DECIMALS,
      //   chainId: 'Oraichain',
      //   rpc: 'https://rpc.orai.io',
      //   lcd: 'https://lcd.orai.io',
      //   cosmosBased: true,
      //   Icon: ORAI,
      // },
      // {
      //   name: 'AIRI',
      //   org: 'Oraichain',
      //   prefix: 'orai',
      //   coingeckoId: 'airight',
      //   denom: process.env.REACT_APP_AIRIBSC_ORAICHAIN_DENOM,
      //   decimals: EVM_DECIMALS,
      //   chainId: 'Oraichain',
      //   rpc: 'https://rpc.orai.io',
      //   lcd: 'https://lcd.orai.io',
      //   cosmosBased: true,
      //   Icon: AIRI,
      // },
      // {
      //   name: 'USDT',
      //   org: 'Oraichain',
      //   prefix: 'orai',
      //   coingeckoId: 'tether',
      //   denom: process.env.REACT_APP_USDTBSC_ORAICHAIN_DENOM,
      //   decimals: EVM_DECIMALS,
      //   chainId: 'Oraichain',
      //   rpc: 'https://rpc.orai.io',
      //   lcd: 'https://lcd.orai.io',
      //   cosmosBased: true,
      //   Icon: USDT,
      // },
      // {
      //   name: 'KWT',
      //   org: 'Oraichain',
      //   prefix: 'orai',
      //   coingeckoId: 'kawaii-islands',
      //   denom: process.env.REACT_APP_KWTBSC_ORAICHAIN_DENOM,
      //   decimals: EVM_DECIMALS,
      //   chainId: 'Oraichain',
      //   rpc: 'https://rpc.orai.io',
      //   lcd: 'https://lcd.orai.io',
      //   cosmosBased: true,
      //   Icon: KWT,
      // },
      {
        name: 'KWT',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'kawaii-islands',
        denom: 'kwt',
        contractAddress: process.env.REACT_APP_KWT_CONTRACT,
        erc20Cw20Map: [{ erc20Type: BSC_CHAIN_ID, decimals: { erc20Decimals: EVM_DECIMALS, cw20Decimals: COSMOS_DECIMALS }, erc20Denom: process.env.REACT_APP_KWTBSC_ORAICHAIN_DENOM, }],
        decimals: COSMOS_DECIMALS,
        coinType: 118,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: KWT,
      },
      {
        name: 'ORAIX',
        org: 'Oraichain',
        prefix: 'orai',
        coinType: 118,
        denom: 'oraix',
        contractAddress: process.env.REACT_APP_ORAIX_CONTRACT,
        coingeckoId: 'oraix',
        decimals: COSMOS_DECIMALS,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ORAI,
      },
    ],
  ],
};

// filter with deprecated
export const tokens = tokensMap[network.id].map((tokens) =>
  tokens.filter((token) =>
    process.env.REACT_APP_DEPRECATED === 'true'
      ? true
      : token.org !== 'Terra' &&
      token.denom !== process.env.REACT_APP_LUNA_ORAICHAIN_DENOM &&
      token.denom !== process.env.REACT_APP_UST_ORAICHAIN_DENOM
  )
);

export const filteredTokens = _.uniqBy(
  _.flatten(tokens).filter(
    // TODO: contractAddress for ethereum use different method
    (token) =>
      // !token.contractAddress &&
      token.denom && token.cosmosBased && token.coingeckoId
  ),
  (c) => c.denom
);

export const cw20Tokens = _.uniqBy(
  _.flatten(filteredTokens).filter(
    // filter cosmos based tokens to collect tokens that have contract addresses
    // TODO: contractAddress for ethereum use different method
    (token) =>
      // !token.contractAddress &&
      token.contractAddress
  ),
  (c) => c.denom
);

export const evmTokens = _.uniqBy(
  _.flatten(tokens).filter(
    // TODO: contractAddress for ethereum use different method
    (token) =>
      // !token.contractAddress &&
      token.denom &&
      !token.cosmosBased &&
      token.coingeckoId &&
      token.chainId !== KWT_SUBNETWORK_CHAIN_ID
  ),
  (c) => c.denom
);

export const kawaiiTokens = _.uniqBy(
  _.flatten(tokens).filter(
    (token) => token.chainId === KWT_SUBNETWORK_CHAIN_ID
  ),
  (c) => c.denom
);

export const gravityContracts: { [key: string]: string } = {
  [BSC_CHAIN_ID]: process.env.REACT_APP_GRAVITY_BSC_CONTRACT,
  [ETHEREUM_CHAIN_ID]: process.env.REACT_APP_GRAVITY_ETH_CONTRACT,
};
