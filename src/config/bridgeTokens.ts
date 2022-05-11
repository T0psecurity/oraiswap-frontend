import React, { ReactElement } from 'react';
import { ReactComponent as BNB } from 'assets/icons/bnb.svg';
import { ReactComponent as ETH } from 'assets/icons/eth.svg';
import { ReactComponent as ORAI } from 'assets/icons/oraichain.svg';
import { ReactComponent as OSMO } from 'assets/icons/osmosis.svg';
import { ReactComponent as ATOMCOSMOS } from 'assets/icons/atom_cosmos.svg';
import { ReactComponent as LUNA } from 'assets/icons/luna.svg';
import { ReactComponent as UST } from 'assets/icons/luna_ust.svg';
import { ReactComponent as AIRI } from 'assets/icons/airi.svg';
import { ReactComponent as USDT } from 'assets/icons/tether.svg';
import { network, NetworkKey } from './networks';
import _ from 'lodash';
import {
  AIRI_BSC_CONTRACT,
  BEP20_ORAI,
  BSC_CHAIN_ID,
  BSC_RPC,
  ERC20_ORAI,
  ETHEREUM_CHAIN_ID,
  ETHEREUM_RPC,
  ORAI_BRIDGE_CHAIN_ID,
  ORAI_BRIDGE_EVM_DENOM_PREFIX,
  ORAI_BRIDGE_LCD,
  ORAI_BRIDGE_PREFIX,
  ORAI_BRIDGE_RPC,
  ORAI_BRIDGE_UDENOM,
  ORAI_BSC_CONTRACT,
  ORAI_ETH_CONTRACT,
  USDT_BSC_CONTRACT
} from './constants';

export type TokenItemType = {
  name: string;
  org?: string;
  denom: string;
  prefix?: string;
  contractAddress?: string;
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
  | 'tether';
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
        decimals: 6,
        chainId: 'cosmoshub-4',
        rpc: 'https://rpc-cosmos.oraidex.io',
        lcd: 'https://lcd-cosmoshub.keplr.app',
        cosmosBased: true,
        maxGas: 20000 * 0.16,
        Icon: ATOMCOSMOS
      },
      {
        name: 'LUNA',
        org: 'Terra',
        prefix: 'terra',
        coinType: 330,
        coingeckoId: 'terra-luna',
        denom: 'uluna',
        decimals: 6,
        chainId: 'columbus-5',
        rpc: 'https://rpc-terra.orai.io',
        lcd: 'https://lcd-columbus.keplr.app',
        cosmosBased: true,
        maxGas: 20000 * 0.16,
        Icon: LUNA
      },
      {
        name: 'UST',
        org: 'Terra',
        prefix: 'terra',
        coinType: 330,
        coingeckoId: 'terrausd',
        denom: 'uusd',
        decimals: 6,
        chainId: 'columbus-5',
        rpc: 'https://rpc-terra.orai.io',
        lcd: 'https://lcd-columbus.keplr.app',
        cosmosBased: true,
        Icon: UST
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
        decimals: 6,
        coingeckoId: 'osmosis',
        cosmosBased: true,
        maxGas: 20000 * 0.025,
        Icon: OSMO
      },
      {
        name: 'BEP20 ORAI',
        prefix: ORAI_BRIDGE_PREFIX,
        org: 'OraiBridge',
        chainId: ORAI_BRIDGE_CHAIN_ID,
        coinType: 118,
        denom: ORAI_BRIDGE_EVM_DENOM_PREFIX + ORAI_BSC_CONTRACT,
        rpc: ORAI_BRIDGE_RPC,
        lcd: ORAI_BRIDGE_LCD,
        decimals: 6,
        coingeckoId: 'oraichain-token',
        cosmosBased: true,
        Icon: ORAI
      },
      // {
      //   name: 'ERC20 ORAI',
      //   org: 'Ethereum',
      //   coingeckoId: 'oraichain-token',
      //   denom: ERC20_ORAI,
      //   contractAddress: ORAI_ETH_CONTRACT,
      //   decimals: 18,
      //   chainId: ETHEREUM_CHAIN_ID,
      //   rpc: ETHEREUM_RPC,
      //   cosmosBased: false,
      //   Icon: ORAI
      // },
      {
        name: 'BEP20 ORAI',
        org: 'BNB Chain',
        chainId: BSC_CHAIN_ID,
        denom: BEP20_ORAI,
        contractAddress: ORAI_BSC_CONTRACT,
        rpc: BSC_RPC,
        decimals: 18,
        coingeckoId: 'oraichain-token',
        cosmosBased: false,
        Icon: ORAI
      },
      {
        name: 'BEP20 AIRI',
        org: 'BNB Chain',
        chainId: BSC_CHAIN_ID,
        denom: 'bep20_airi',
        contractAddress: AIRI_BSC_CONTRACT,
        rpc: BSC_RPC,
        decimals: 18,
        coingeckoId: 'airight',
        cosmosBased: false,
        Icon: AIRI
      },
      {
        name: 'BEP20 USDT',
        org: 'BNB Chain',
        chainId: BSC_CHAIN_ID,
        denom: 'bep20_usdt',
        contractAddress: USDT_BSC_CONTRACT,
        rpc: BSC_RPC,
        decimals: 18,
        coingeckoId: 'tether',
        cosmosBased: false,
        Icon: USDT
      }
    ],
    [
      {
        name: 'ORAI',
        org: 'Oraichain',
        prefix: 'orai',
        coinType: 118,
        denom: 'orai',
        coingeckoId: 'oraichain-token',
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ORAI
      },
      {
        name: 'ATOM',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'cosmos',
        coinType: 118,
        denom: process.env.REACT_APP_ATOM_ORAICHAIN_DENOM,
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ATOMCOSMOS
      },
      {
        name: 'LUNA',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'terra-luna',
        coinType: 118,
        denom: process.env.REACT_APP_LUNA_ORAICHAIN_DENOM,
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: LUNA
      },
      {
        name: 'UST',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'terrausd',
        coinType: 118,
        denom: process.env.REACT_APP_UST_ORAICHAIN_DENOM,
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: UST
      },
      {
        name: 'AIRI',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'airight',
        denom: 'airi',
        contractAddress: process.env.REACT_APP_AIRI_CONTRACT,
        decimals: 6,
        coinType: 118,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: AIRI
      },
      {
        name: 'USDT',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'tether',
        denom: 'usdt',
        contractAddress: process.env.REACT_APP_USDT_CONTRACT,
        decimals: 6,
        coinType: 118,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: USDT
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
      //   decimals: 6,
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
      //   decimals: 6,
      //   chainId: 'Oraichain',
      //   rpc: 'https://rpc.orai.io',
      //   lcd: 'https://lcd.orai.io',
      //   cosmosBased: true,
      //   Icon: ETH
      // },
      {
        name: 'BEP20 ORAI',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'oraichain-token',
        denom: process.env.REACT_APP_ORAIBSC_ORAICHAIN_DENOM,
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ORAI
      },
      {
        name: 'BEP20 AIRI',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'airight',
        denom: process.env.REACT_APP_AIRIBSC_ORAICHAIN_DENOM,
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: AIRI
      },
      {
        name: 'BEP20 USDT',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'tether',
        denom: process.env.REACT_APP_USDTBSC_ORAICHAIN_DENOM,
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: USDT
      },
      {
        name: 'ORAIX',
        org: 'Oraichain',
        prefix: 'orai',
        coinType: 118,
        denom: 'oraix',
        contractAddress: process.env.REACT_APP_ORAIX_CONTRACT,
        coingeckoId: 'oraix',
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ORAI
      }
    ]
  ]
};

export const tokens = tokensMap[network.id];

export const filteredTokens = _.uniqBy(
  _.flatten(tokens).filter(
    // TODO: contractAddress for ethereum use different method
    (token) =>
      // !token.contractAddress &&
      token.denom && token.cosmosBased && token.coingeckoId
  ),
  (c) => c.denom
);

export const evmTokens = _.uniqBy(
  _.flatten(tokens).filter(
    // TODO: contractAddress for ethereum use different method
    (token) =>
      // !token.contractAddress &&
      token.denom && !token.cosmosBased && token.coingeckoId
  ),
  (c) => c.denom
);

export const gravityContracts: { [key: string]: string } = {
  [BSC_CHAIN_ID]: process.env.REACT_APP_GRAVITY_BSC_CONTRACT,
  [ETHEREUM_CHAIN_ID]: process.env.REACT_APP_GRAVITY_ETH_CONTRACT
};
