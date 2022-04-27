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
  coinType?: number;
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
        coinType: 118,
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
        coinType: 118,
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
        name: 'ORAI',
        org: 'BNB Chain',
        chainId: 'bsc',
        prefix: 'orai',
        denom: '0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0',
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
        coinType: 118,
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
        coinType: 118,
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
        coinType: 118,
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
        name: 'Erc20 ORAI',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'oraichain-token',
        denom: 'ibc/ethereum',
        decimals: 18,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ETH
      },
      {
        name: 'Bep20 ORAI',
        org: 'Oraichain',
        prefix: 'orai',
        chainId: 'Oraichain',
        denom: 'ibc/bsc',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        decimals: 18,
        coingeckoId: 'oraichain-token',
        cosmosBased: true,
        Icon: BNB
      },
      {
        name: 'AIRI',
        org: 'Oraichain',
        prefix: 'orai',
        coinType: 118,
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
        name: 'ATOM',
        org: 'Cosmos Hub',
        coinType: 118,
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
        coinType: 330,
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
        coinType: 330,
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
        coinType: 118,
        chainId: 'osmosis-1',
        rpc: 'https://osmosis.rpc.orai.io',
        lcd: 'https://osmosis.lcd.orai.io',
        decimals: 6,
        coingeckoId: 'osmosis',
        cosmosBased: true,
        Icon: OSMO
      },
      {
        name: 'Erc20 ORAI',
        org: 'Ethereum',
        coingeckoId: 'oraichain-token',
        denom: 'erc20_orai',
        contractAddress: '0x4c11249814f11b9346808179cf06e71ac328c1b5',
        decimals: 18,
        chainId: '1',
        rpc: 'https://mainnet.infura.io/v3/648e041e75924b5c9d0254e4a76c9978',
        cosmosBased: false,
        Icon: ETH
      },
      {
        name: 'Bep20 ORAI',
        org: 'BNB Chain',
        chainId: '56',
        denom: 'bep20_orai',
        contractAddress: '0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0',
        rpc: 'https://bsc-dataseed1.ninicoin.io',
        decimals: 18,
        coingeckoId: 'oraichain-token',
        cosmosBased: false,
        Icon: BNB
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
      // {
      //   name: 'LUNA',
      //   org: 'Oraichain',
      //   prefix: 'orai',
      //   coingeckoId: 'terra-luna',
      //   coinType: 118,
      //   denom: process.env.REACT_APP_LUNA_ORAICHAIN_DENOM,
      //   decimals: 6,
      //   chainId: 'Oraichain',
      //   rpc: 'https://rpc.orai.io',
      //   lcd: 'https://lcd.orai.io',
      //   cosmosBased: true,
      //   Icon: LUNA
      // },
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
      {
        name: 'Erc20 ORAI',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'oraichain-token',
        denom: 'ibc/erc20_orai',
        decimals: 18,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ETH
      },
      {
        name: 'Bep20 ORAI',
        org: 'Oraichain',
        prefix: 'orai',
        coingeckoId: 'oraichain-token',
        denom: 'ibc/bep20_orai',
        decimals: 18,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: BNB
      },
      {
        name: 'ORAIX',
        org: 'Oraichain',
        prefix: 'orai',
        coinType: 118,
        denom: 'oraix',
        contractAddress: process.env.REACT_APP_ORAIX_CONTRACT,
        coingeckoId: 'oraichain-token',
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

export const emvTokens = _.uniqBy(
  _.flatten(tokens).filter(
    // TODO: contractAddress for ethereum use different method
    (token) =>
      // !token.contractAddress &&
      token.denom && !token.cosmosBased && token.coingeckoId
  ),
  (c) => c.denom
);
