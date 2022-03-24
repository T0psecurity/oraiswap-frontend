import React, { ReactElement } from 'react';
import { ReactComponent as BNB } from 'assets/icons/bnb.svg';
import { ReactComponent as ETH } from 'assets/icons/eth.svg';
import { ReactComponent as ORAI } from 'assets/icons/oraichain.svg';
import { ReactComponent as OSMO } from 'assets/icons/osmosis.svg';
import { ReactComponent as ATOMCOSMOS } from 'assets/icons/atom_cosmos.svg';
import { ReactComponent as LUNA } from 'assets/icons/luna.svg';
import { ReactComponent as UST } from 'assets/icons/luna_ust.svg';
import { ReactComponent as AIRI } from 'assets/icons/airi.svg';
import { network, NetworkKey } from './networks';
import _ from 'lodash';

export type TokenItemType = {
  name: string;
  org?: string;
  denom: string;
  prefix?: string;
  contractAddress?: string;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  chainId: string;
  rpc: string;
  lcd?: string;
  decimals: number;
  coingeckoId:
    | 'oraichain-token'
    | 'osmosis'
    | 'cosmos'
    | 'ethereum'
    | 'bnb'
    | 'airight'
    | 'terrausd'
    | 'terra-luna';
  cosmosBased: Boolean;
};

const tokensMap: { [key: string]: [TokenItemType[], TokenItemType[]] } = {
  [NetworkKey.TESTNET]: [
    [
      {
        name: 'ORAI',
        org: 'Ethereum',
        denom: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
        prefix: 'orai',
        contractAddress: 'ORAI',
        coingeckoId: 'oraichain-token',
        decimals: 6,
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet.rpc.orai.io',
        lcd: 'https://testnet.lcd.orai.io',
        cosmosBased: false,
        Icon: ORAI
      },
      {
        name: 'ATOM',
        org: 'Cosmos Hub',
        prefix: 'cosmos',
        coingeckoId: 'cosmos',
        denom: 'atom',
        decimals: 6,
        chainId: 'cosmoshub-4',
        rpc: 'https://rpc-cosmoshub.blockapsis.com',
        lcd: 'https://lcd-cosmoshub.blockapsis.com',
        cosmosBased: false,
        Icon: ATOMCOSMOS
      },
      {
        name: 'OSMO',
        org: 'Osmosis',
        prefix: 'osmo',
        denom: 'osmosis',
        chainId: 'osmosis-1',
        rpc: 'https://rpc-osmosis.blockapsis.com',
        lcd: 'https://lcd-osmosis.blockapsis.com',
        decimals: 6,
        coingeckoId: 'osmosis',
        cosmosBased: false,
        Icon: OSMO
      },
      {
        name: 'ETH',
        org: 'Ethereum',
        coingeckoId: 'ethereum',
        denom: 'ethereum',
        decimals: 18,
        chainId: 'ethereum',
        rpc: 'http://125.212.192.225:26657',
        cosmosBased: false,
        Icon: ETH
      },
      {
        name: 'BNB',
        org: 'BNB Chain',
        chainId: 'bsc',
        prefix: 'bsc',
        denom: 'bnb',
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        decimals: 18,
        coingeckoId: 'bnb',
        cosmosBased: false,
        Icon: BNB
      }
    ],
    [
      {
        name: 'ORAI',
        org: 'Oraichain',
        prefix: 'orai',
        denom: 'orai',
        coingeckoId: 'oraichain-token',
        decimals: 6,
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet.rpc.orai.io',
        lcd: 'https://testnet.lcd.orai.io',
        cosmosBased: true,
        Icon: ORAI
      },
      {
        name: 'ATOM',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'cosmos',
        denom: 'ibc/atom',
        decimals: 6,
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet.rpc.orai.io',
        lcd: 'https://testnet.lcd.orai.io',
        cosmosBased: false,
        Icon: ATOMCOSMOS
      },
      {
        name: 'OSMO',
        org: 'Oraichain',
        prefix: 'orai',
        denom: 'ibc/osmosis',
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet.rpc.orai.io',
        lcd: 'https://testnet.lcd.orai.io',
        decimals: 6,
        coingeckoId: 'osmosis',
        cosmosBased: false,
        Icon: OSMO
      },
      {
        name: 'ETH',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'ethereum',
        denom: 'ibc/ethereum',
        decimals: 18,
        chainId: 'Oraichain-testnet',
        rpc: 'http://125.212.192.225:26657',
        cosmosBased: false,
        Icon: ETH
      },
      {
        name: 'BNB',
        org: 'Oraichain',
        prefix: 'orai',
        chainId: 'Oraichain-testnet',
        denom: 'bnb',
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        decimals: 18,
        coingeckoId: 'bnb',
        cosmosBased: false,
        Icon: BNB
      },
      {
        name: 'AIRI',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'airight',
        denom: 'airi',
        contractAddress: 'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2',
        decimals: 6,
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet-rpc.orai.io',
        lcd: 'https://testnet-lcd.orai.io',
        cosmosBased: true,
        Icon: AIRI
      }
    ]
  ],
  [NetworkKey.MAINNET]: [
    [
      {
        name: 'ORAI',
        org: 'Ethereum',
        prefix: 'orai',
        denom: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
        coingeckoId: 'oraichain-token',
        contractAddress: 'orai',
        decimals: 6,
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet.rpc.orai.io',
        lcd: 'https://testnet.lcd.orai.io',
        cosmosBased: false,
        Icon: ORAI
      },
      {
        name: 'ATOM',
        org: 'Cosmos Hub',
        prefix: 'cosmos',
        coingeckoId: 'cosmos',
        denom: 'uatom',
        decimals: 6,
        chainId: 'cosmoshub-4',
        rpc: 'https://rpc-cosmos.oraidex.io',
        lcd: 'https://lcd-cosmos.oraidex.io',
        cosmosBased: true,
        Icon: ATOMCOSMOS
      },
      {
        name: 'LUNA',
        org: 'Terra',
        prefix: 'terra',
        coingeckoId: 'terra-luna',
        denom: 'uluna',
        decimals: 6,
        chainId: 'columbus-5',
        rpc: 'https://rpc-terra.orai.io',
        lcd: 'https://lcd-terra.orai.io',
        cosmosBased: true,
        Icon: LUNA
      },
      {
        name: 'UST',
        org: 'Terra',
        prefix: 'terra',
        coingeckoId: 'terrausd',
        denom: 'uusd',
        decimals: 6,
        chainId: 'columbus-5',
        rpc: 'https://rpc-terra.orai.io',
        lcd: 'https://lcd-terra.orai.io',
        cosmosBased: true,
        Icon: UST
      },
      {
        name: 'OSMO',
        org: 'Osmosis',
        prefix: 'osmo',
        denom: 'uosmo',
        chainId: 'osmosis-1',
        rpc: 'https://rpc-osmosis.blockapsis.com',
        lcd: 'https://lcd-osmosis.blockapsis.com',
        decimals: 6,
        coingeckoId: 'osmosis',
        cosmosBased: false,
        Icon: OSMO
      },
      {
        name: 'ETH',
        org: 'Ethereum',
        coingeckoId: 'ethereum',
        denom: 'ethereum',
        contractAddress: 'eth',
        decimals: 18,
        chainId: 'ethereum',
        rpc: 'http://125.212.192.225:26657',
        cosmosBased: false,
        Icon: ETH
      },
      {
        name: 'BNB',
        org: 'BNB Chain',
        chainId: 'bsc',
        denom: 'bnb',
        contractAddress: 'bnb',
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        decimals: 18,
        coingeckoId: 'bnb',
        cosmosBased: false,
        Icon: BNB
      }
    ],
    [
      {
        name: 'ORAI',
        org: 'Oraichain',
        prefix: 'orai',
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
        denom:
          'ibc/45C001A5AE212D09879BE4627C45B64D5636086285590D5145A51E18E9D16722',
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
        denom:
          'ibc/6896F977DF5B427359BA77B5AF1052E5512D460F3CE59C8F6A7CB51408351F3C',
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
        denom:
          'ibc/D9CDEFD93E29F5C2175C7606DFF67490B2123BB93F299B3AFA53E8BB1DDD4FC4',
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
        contractAddress: 'orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg',
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: AIRI
      },
      {
        name: 'OSMO',
        org: 'Oraichain',
        prefix: 'orai',
        denom: 'ibc/osmosis',
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        decimals: 6,
        coingeckoId: 'osmosis',
        cosmosBased: false,
        Icon: OSMO
      },
      {
        name: 'ETH',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'ethereum',
        denom: 'ibc/ethereum',
        decimals: 18,
        chainId: 'Oraichain-testnet',
        rpc: 'http://125.212.192.225:26657',
        cosmosBased: false,
        Icon: ETH
      },
      {
        name: 'BNB',
        org: 'Oraichain',
        prefix: 'orai',
        chainId: 'Oraichain-testnet',
        denom: 'bnb',
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        decimals: 18,
        coingeckoId: 'bnb',
        cosmosBased: false,
        Icon: BNB
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
