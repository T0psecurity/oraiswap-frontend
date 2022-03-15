import React, { ReactElement } from 'react';
import { ReactComponent as BNB } from 'assets/icons/bnb.svg';
import { ReactComponent as ETH } from 'assets/icons/eth.svg';
import { ReactComponent as ORAI } from 'assets/icons/oraichain.svg';
import { ReactComponent as OSMO } from 'assets/icons/osmosis.svg';
import { ReactComponent as ATOMCOSMOS } from 'assets/icons/atom_cosmos.svg';
import { ReactComponent as AIRI } from 'assets/icons/airi.svg';
import { network, NetworkKey } from './networks';

export type TokenItemType = {
  name: string;
  org?: string;
  denom: string;
  contractAddress?: string;
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  chainId: string;
  rpc: string;
  lcd?: string;
  decimals: number;
  coingeckoId: 'oraichain-token' | 'osmosis' | 'cosmos' | 'ethereum' | 'bnb' | 'airight';
  cosmosBased: Boolean;
  logo: string,
};

const tokensMap: { [key: string]: [TokenItemType[], TokenItemType[]] } = {
  [NetworkKey.TESTNET]: [
    [
      {
        name: 'ORAI',
        org: 'Ethereum',
        denom: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
        contractAddress: "ORAI",
        coingeckoId: 'oraichain-token',
        decimals: 6,
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet.rpc.orai.io',
        lcd: 'https://testnet.lcd.orai.io',
        cosmosBased: false,
        Icon: ORAI,
        logo: 'oraichain.svg'
      },
      {
        name: 'ATOM',
        org: 'Cosmos Hub',
        coingeckoId: 'cosmos',
        denom: 'atom',
        decimals: 6,
        chainId: 'cosmoshub-4',
        rpc: 'https://rpc-cosmoshub.blockapsis.com',
        lcd: 'https://lcd-cosmoshub.blockapsis.com',
        cosmosBased: false,
        Icon: ATOMCOSMOS,
        logo: 'oraichain.svg'
      },
      {
        name: 'OSMO',
        org: 'Osmosis',
        denom: 'osmosis',
        chainId: 'osmosis-1',
        rpc: 'https://rpc-osmosis.blockapsis.com',
        lcd: 'https://lcd-osmosis.blockapsis.com',
        decimals: 6,
        coingeckoId: 'osmosis',
        cosmosBased: false,
        Icon: OSMO,
        logo: 'oraichain.svg'
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
        Icon: ETH,
        logo: 'oraichain.svg'
      },
      {
        name: 'BNB',
        org: 'BNB Chain',
        chainId: 'bsc',
        denom: 'bnb',
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        decimals: 18,
        coingeckoId: 'bnb',
        cosmosBased: false,
        Icon: BNB,
        logo: 'oraichain.svg'
      }
    ],
    [
      {
        name: 'ORAI',
        org: 'Oraichain',
        denom: 'orai',
        coingeckoId: 'oraichain-token',
        decimals: 6,
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet.rpc.orai.io',
        lcd: 'https://testnet.lcd.orai.io',
        cosmosBased: true,
        Icon: ORAI,
        logo: "oraichain.svg"
      },
      {
        name: 'ATOM',
        org: 'Oraichain',
        coingeckoId: 'cosmos',
        denom: 'ibc/atom',
        decimals: 6,
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet.rpc.orai.io',
        lcd: 'https://testnet.lcd.orai.io',
        cosmosBased: false,
        Icon: ATOMCOSMOS,
        logo: 'oraichain.svg'
      },
      {
        name: 'OSMO',
        org: 'Oraichain',
        denom: 'ibc/osmosis',
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet.rpc.orai.io',
        lcd: 'https://testnet.lcd.orai.io',
        decimals: 6,
        coingeckoId: 'osmosis',
        cosmosBased: false,
        Icon: OSMO,
        logo: 'oraichain.svg'
      },
      {
        name: 'ETH',
        org: 'Oraichain',
        coingeckoId: 'ethereum',
        denom: 'ibc/ethereum',
        decimals: 18,
        chainId: 'Oraichain-testnet',
        rpc: 'http://125.212.192.225:26657',
        cosmosBased: false,
        Icon: ETH,
        logo: 'oraichain.svg'
      },
      {
        name: 'BNB',
        org: 'Oraichain',
        chainId: 'Oraichain-testnet',
        denom: 'bnb',
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        decimals: 18,
        coingeckoId: 'bnb',
        cosmosBased: false,
        Icon: BNB,
        logo: 'oraichain.svg'
      },
      {
        name: 'AIRI',
        org: 'Oraichain',
        coingeckoId: 'airight',
        denom: 'airi',
        contractAddress: 'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2',
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://testnet-rpc.orai.io',
        lcd: 'https://testnet-lcd.orai.io',
        cosmosBased: true,
        Icon: AIRI,
        logo: 'airi.svg'
      },
    ]
  ],
  [NetworkKey.MAINNET]: [
    [
      {
        name: 'ORAI',
        org: 'Ethereum',
        denom: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
        coingeckoId: 'oraichain-token',
        contractAddress: 'orai',
        decimals: 6,
        chainId: 'Oraichain-testnet',
        rpc: 'https://testnet.rpc.orai.io',
        lcd: 'https://testnet.lcd.orai.io',
        cosmosBased: false,
        Icon: ORAI,
        logo: 'oraichain.svg'
      },
      {
        name: 'ATOM',
        org: 'Cosmos Hub',
        coingeckoId: 'cosmos',
        denom: 'uatom',
        contractAddress: 'uatom',
        decimals: 6,
        chainId: 'cosmoshub-4',
        rpc: 'https://rpc-cosmoshub.blockapsis.com',
        lcd: 'https://lcd-cosmoshub.blockapsis.com',
        cosmosBased: true,
        Icon: ATOMCOSMOS,
        logo: 'oraichain.svg'
      },
      {
        name: 'OSMO',
        org: 'Osmosis',
        denom: 'uosmo',
        contractAddress: 'uosmo',
        chainId: 'osmosis-1',
        rpc: 'https://rpc-osmosis.blockapsis.com',
        lcd: 'https://lcd-osmosis.blockapsis.com',
        decimals: 6,
        coingeckoId: 'osmosis',
        cosmosBased: false,
        Icon: OSMO,
        logo: 'oraichain.svg'
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
        Icon: ETH,
        logo: 'oraichain.svg'
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
        Icon: BNB,
        logo: 'oraichain.svg'
      }
    ],
    [
      {
        name: 'ORAI',
        org: 'Oraichain',
        denom: 'orai',
        coingeckoId: 'oraichain-token',
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ORAI,
        logo: 'oraichain.svg'
      },
      {
        name: 'ATOM',
        org: 'Oraichain',
        coingeckoId: 'cosmos',
        denom:
          'ibc/45C001A5AE212D09879BE4627C45B64D5636086285590D5145A51E18E9D16722',
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: ATOMCOSMOS,
        logo: 'atom_cosmos.svg'
      },
      {
        name: 'AIRI',
        org: 'Oraichain',
        coingeckoId: 'airight',
        denom: 'airi',
        contractAddress: 'orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg',
        decimals: 6,
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        cosmosBased: true,
        Icon: AIRI,
        logo: 'airi.svg'
      },
      {
        name: 'OSMO',
        org: 'Oraichain',
        denom: 'ibc/osmosis',
        chainId: 'Oraichain',
        rpc: 'https://rpc.orai.io',
        lcd: 'https://lcd.orai.io',
        decimals: 6,
        coingeckoId: 'osmosis',
        cosmosBased: false,
        Icon: OSMO,
        logo: 'oraichain.svg'
      },
      {
        name: 'ETH',
        org: 'Oraichain',
        coingeckoId: 'ethereum',
        denom: 'ibc/ethereum',
        decimals: 18,
        chainId: 'Oraichain-testnet',
        rpc: 'http://125.212.192.225:26657',
        cosmosBased: false,
        Icon: ETH,
        logo: 'oraichain.svg'
      },
      {
        name: 'BNB',
        org: 'Oraichain',
        chainId: 'Oraichain-testnet',
        denom: 'bnb',
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        decimals: 18,
        coingeckoId: 'bnb',
        cosmosBased: false,
        Icon: BNB,
        logo: 'oraichain.svg'
      }
    ]
  ]
};

export const tokens = tokensMap[network.id];
