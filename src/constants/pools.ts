import { TokenItemType, tokens } from './bridgeTokens';
import { ORAI } from './constants';
import { network, NetworkKey } from './networks';

export type Pair = {
  contract_addr: string;
  asset_denoms: [string, string];
};

export type TokensSwap = { [key: string]: TokenItemType };

const pairsMap: Record<NetworkKey, Pair[]> = {
  [NetworkKey.TESTNET]: [],
  [NetworkKey.MAINNET]: [
    {
      contract_addr: 'orai1wkhkazf88upf2dxqedggy3ldja342rzmfs2mep',
      asset_denoms: [ORAI, 'airi']
    },
    {
      contract_addr: 'orai1jf74ry4m0jcy9emsaudkhe7vte9l8qy8enakvs',
      asset_denoms: [ORAI, process.env.REACT_APP_ATOM_ORAICHAIN_DENOM]
    },
    {
      contract_addr: 'orai14lpk5gnmj688f957xvd6c42w9dygl9c2dlxjzw',
      asset_denoms: [ORAI, process.env.REACT_APP_UST_ORAICHAIN_DENOM]
    }
    // {
    //   contract_addr: 'orai1d2h9phsu6rau87d2l8adlxfhrdun2wrgdhsqxt',
    //   asset_denoms: [
    //     ORAI,
    //     process.env.REACT_APP_LUNA_ORAICHAIN_DENOM
    //   ]
    // },
    // {
    //   contract_addr: 'orai1d37artrk4tkhz2qyjmaulc2jzjkx7206tmpfug',
    //   asset_denoms: [
    //     ORAI,
    //     process.env.REACT_APP_OSMOSIS_ORAICHAIN_DENOM
    //   ]
    // }
  ]
};

export const pairs = pairsMap[network.id];

export const getPair = (denom1: string, denom2: string): Pair | undefined => {
  const asset_denoms = [denom1, denom2];
  const denom = asset_denoms[1] === ORAI ? asset_denoms[0] : asset_denoms[1];

  return pairs.find((pair) => pair.asset_denoms[1] === denom);
};
