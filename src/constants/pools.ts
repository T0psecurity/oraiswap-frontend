import { TokenItemType, tokens } from './bridgeTokens';
import { ORAI } from './constants';
import { network, NetworkKey } from './networks';

export type Pair = {
  contract_addr: string;
  asset_denoms: [string, string];
};

export type PairKey = 'ORAI_AIRI' | 'ORAI_ATOM' | 'ORAI_UST';
// | 'ORAI_LUNA'
// | 'ORAI_OSMO';

export type TokensSwap = { [key: string]: TokenItemType };

const pairs: { [networkKey: string]: Record<PairKey, Pair> } = {
  [NetworkKey.MAINNET]: {
    ORAI_AIRI: {
      contract_addr: 'orai1wkhkazf88upf2dxqedggy3ldja342rzmfs2mep',
      asset_denoms: [ORAI, 'airi']
    },
    ORAI_ATOM: {
      contract_addr: 'orai1jf74ry4m0jcy9emsaudkhe7vte9l8qy8enakvs',
      asset_denoms: [ORAI, process.env.REACT_APP_ATOM_ORAICHAIN_DENOM]
    },
    ORAI_UST: {
      contract_addr: 'orai14lpk5gnmj688f957xvd6c42w9dygl9c2dlxjzw',
      asset_denoms: [ORAI, process.env.REACT_APP_UST_ORAICHAIN_DENOM]
    }
    // ORAI_LUNA: {
    //   contract_addr: 'orai1d2h9phsu6rau87d2l8adlxfhrdun2wrgdhsqxt',
    //   asset_denoms: [
    //     ORAI,
    //     process.env.REACT_APP_LUNA_ORAICHAIN_DENOM
    //   ]
    // },
    // ORAI_OSMO: {
    //   contract_addr: 'orai1d37artrk4tkhz2qyjmaulc2jzjkx7206tmpfug',
    //   asset_denoms: [
    //     ORAI,
    //     process.env.REACT_APP_OSMOSIS_ORAICHAIN_DENOM
    //   ]
    // }
  }
};

export const mockToken: TokensSwap = Object.fromEntries(
  tokens[1]
    .filter((token) => token.cosmosBased)
    .map((item) => [item.denom, item])
);

export const pairsMap = pairs[network.id];
