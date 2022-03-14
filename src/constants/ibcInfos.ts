import { IBCInfo } from 'types/ibc';
import { network, NetworkKey } from './networks';

export interface IBCInfoMap {
  [key: string]: { [key: string]: IBCInfo };
}

const ibcInfosMap: { [key: string]: IBCInfoMap } = {
  [NetworkKey.TESTNET]: {
    'gravity-test': {
      'Oraichain-testnet': {
        source: 'transfer',
        channel: 'channel-0',
        timeout: 60
      }
    },
    'osmosis-1': {
      'Oraichain-testnet': {
        source: 'transfer',
        channel: 'channel-202',
        timeout: 60
      }
    },
    'Oraichain-testnet': {
      'gravity-test': {
        source: 'transfer',
        channel: 'channel-1',
        timeout: 60
      },
      'osmosis-1': {
        source: 'transfer',
        channel: 'channel-3',
        timeout: 60
      }
    }
  },
  [NetworkKey.MAINNET]: {
    'cosmoshub-4': {
      Oraichain: {
        source: 'transfer',
        channel: 'channel-295',
        timeout: 60
      }
    },
    Oraichain: {
      'cosmoshub-4': {
        source: 'transfer',
        channel: 'channel-9',
        timeout: 60
      }
    }
  }
};

export const ibcInfos = ibcInfosMap[network.id];
