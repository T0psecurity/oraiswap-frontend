import { Bech32Address } from '@keplr-wallet/cosmos';
import { ChainInfo } from '@keplr-wallet/types';

/**
 * A list of Cosmos chain infos. If we need to add / remove any chains, just directly update this variable.
 */
export const embedChainInfos: ChainInfo[] = [
  {
    rpc: 'https://testnet-rpc.orai.io',
    rest: 'https://testnet-lcd.orai.io',
    chainId: 'Oraichain-testnet',
    chainName: 'Oraichain Testnet',
    stakeCurrency: {
      coinDenom: 'ORAI',
      coinMinimalDenom: 'orai',
      coinDecimals: 6,
      coinGeckoId: 'oraichain-token',
      coinImageUrl: 'https://orai.io/images/media-pack/logomark-light.png'
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('orai'),
    currencies: [
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'orai',
        coinDecimals: 6,
        coinGeckoId: 'oraichain-token',
        coinImageUrl: 'https://orai.io/images/media-pack/logomark-light.png'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'orai',
        coinDecimals: 6,
        coinGeckoId: 'oraichain-token',
        coinImageUrl: 'https://orai.io/images/media-pack/logomark-light.png'
      }
    ],
    gasPriceStep: {
      low: 0,
      average: 0.0025,
      high: 0.004
    },
    features: ['stargate', 'ibc-transfer', 'cosmwasm']
  },
  {
    rpc: 'https://rpc.orai.io',
    rest: 'https://lcd.orai.io',
    chainId: 'Oraichain',
    chainName: 'Oraichain',
    stakeCurrency: {
      coinDenom: 'ORAI',
      coinMinimalDenom: 'orai',
      coinDecimals: 6,
      coinGeckoId: 'oraichain-token',
      coinImageUrl: window.location.origin + '/public/assets/tokens/orai.png'
    },
    walletUrl: 'https://api.wallet.orai.io',
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config('orai'),
    currencies: [
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'orai',
        coinDecimals: 6,
        coinGeckoId: 'oraichain-token',
        coinImageUrl: window.location.origin + '/public/assets/tokens/orai.png'
      },
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'orai',
        coinDecimals: 6,
        coinGeckoId: 'oraichain-token',
        coinImageUrl: window.location.origin + '/public/assets/tokens/orai.png'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'ORAI',
        coinMinimalDenom: 'orai',
        coinDecimals: 6,
        coinGeckoId: 'oraichain-token',
        coinImageUrl: window.location.origin + '/public/assets/tokens/orai.png'
      }
    ],
    gasPriceStep: {
      low: 0,
      average: 0.000025,
      high: 0.00004
    },
    features: ['stargate', 'ibc-transfer', 'cosmwasm']
  },
  {
    rpc: 'https://rpc-columbus.keplr.app',
    rest: 'https://lcd-columbus.keplr.app',
    chainId: 'columbus-5',
    chainName: 'Terra',
    stakeCurrency: {
      coinDenom: 'LUNA',
      coinMinimalDenom: 'uluna',
      coinDecimals: 6,
      coinGeckoId: 'terra-luna',
      coinImageUrl: window.location.origin + '/public/assets/tokens/terra.png'
    },
    bip44: {
      coinType: 330
    },
    bech32Config: Bech32Address.defaultBech32Config('terra'),
    currencies: [
      {
        coinDenom: 'LUMA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna',
        coinImageUrl: window.location.origin + '/public/assets/tokens/terra.png'
      },
      {
        coinDenom: 'UST',
        coinMinimalDenom: 'uusd',
        coinDecimals: 6,
        coinGeckoId: 'terrausd',
        coinImageUrl: window.location.origin + '/public/assets/tokens/terra.png'
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna',
        coinImageUrl: window.location.origin + '/public/assets/tokens/terra.png'
      },
      {
        coinDenom: 'UST',
        coinMinimalDenom: 'uusd',
        coinDecimals: 6,
        coinGeckoId: 'terrausd',
        coinImageUrl: window.location.origin + '/public/assets/tokens/terra.png'
      }
    ],
    features: ['stargate', 'ibc-transfer', 'cosmwasm']
  }
];
