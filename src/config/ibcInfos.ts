import { IBCInfo } from 'types/ibc';
import { IBC_TRANSFER_TIMEOUT } from './constants';
import { network, NetworkKey } from './networks';

const [atom2oraichain, oraicbain2atom] =
  process.env.REACT_APP_ATOM_ORAICHAIN_CHANNELS.split(/\s+/);
const [terra2oraichain, oraicbain2terra] =
  process.env.REACT_APP_TERRA_ORAICHAIN_CHANNELS.split(/\s+/);
const [osmosis2oraichain, oraicbain2osmosis] =
  process.env.REACT_APP_OSMOSIS_ORAICHAIN_CHANNELS.split(/\s+/);

export interface IBCInfoMap {
  [key: string]: { [key: string]: IBCInfo };
}

const ibcInfosMap: Record<NetworkKey, IBCInfoMap> = {
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
        channel: atom2oraichain,
        timeout: IBC_TRANSFER_TIMEOUT
      }
    },
    'columbus-5': {
      Oraichain: {
        source: 'transfer',
        channel: terra2oraichain,
        timeout: IBC_TRANSFER_TIMEOUT
      }
    },
    'osmosis-1': {
      Oraichain: {
        source: 'transfer',
        channel: osmosis2oraichain,
        timeout: IBC_TRANSFER_TIMEOUT
      }
    },
    Oraichain: {
      'cosmoshub-4': {
        source: 'transfer',
        channel: oraicbain2atom,
        timeout: IBC_TRANSFER_TIMEOUT
      },
      'columbus-5': {
        source: 'transfer',
        channel: oraicbain2terra,
        timeout: IBC_TRANSFER_TIMEOUT
      },
      'osmosis-1': {
        source: 'transfer',
        channel: oraicbain2osmosis,
        timeout: IBC_TRANSFER_TIMEOUT
      }
    }
  }
};

export const ibcInfos = ibcInfosMap[network.id];
