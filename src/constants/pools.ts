import { TokenItemType, tokens } from './bridgeTokens';
import { network, NetworkKey } from './networks';

export type Pair = {
  contract_addr: string;
  asset_denoms: [string, string];
};

export enum PairKey {
  ORAI_AIRI = 'orai-airi',
  ORAI_ATOM = 'orai-ibc/A2E2EEC9057A4A1C2C0A6A4C78B0239118DF5F278830F50B4A6BDD7A66506B78',
  ORAI_UST = 'orai-ibc/9E4F68298EE0A201969E583100E5F9FAD145BAA900C04ED3B6B302D834D8E3C4',
  ORAI_LUNA = 'orai-ibc/BA44E90EAFEA8F39D87A94A4A61C9FFED5887C2730DFBA668C197BA331372859',
  ORAI_OSMO = 'orai-ibc/9C4DCD21B48231D0BC2AC3D1B74A864746B37E4292694C93C617324250D002FC'
}

export type TokensSwap = { [key: string]: TokenItemType };

const pairs: { [networkKey: string]: [{ [key: string]: Pair }] } = {
  [NetworkKey.TESTNET]: [
    {
      [PairKey.ORAI_AIRI]: {
        contract_addr: 'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2',
        asset_denoms: ['orai', 'airi']
      }
    }
  ],
  [NetworkKey.MAINNET]: [
    {
      [PairKey.ORAI_AIRI]: {
        contract_addr: 'orai1wkhkazf88upf2dxqedggy3ldja342rzmfs2mep',
        asset_denoms: ['orai', 'airi']
      },
      [PairKey.ORAI_ATOM]: {
        contract_addr: 'orai1jf74ry4m0jcy9emsaudkhe7vte9l8qy8enakvs',
        asset_denoms: [
          'orai',
          'ibc/A2E2EEC9057A4A1C2C0A6A4C78B0239118DF5F278830F50B4A6BDD7A66506B78'
        ]
      },
      [PairKey.ORAI_UST]: {
        contract_addr: 'orai14lpk5gnmj688f957xvd6c42w9dygl9c2dlxjzw',
        asset_denoms: [
          'orai',
          'ibc/9E4F68298EE0A201969E583100E5F9FAD145BAA900C04ED3B6B302D834D8E3C4'
        ]
      }
      // [PairKey.ORAI_LUNA]: {
      //   contract_addr: 'orai1d2h9phsu6rau87d2l8adlxfhrdun2wrgdhsqxt',
      //   asset_denoms: [
      //     'orai',
      //     'ibc/BA44E90EAFEA8F39D87A94A4A61C9FFED5887C2730DFBA668C197BA331372859'
      //   ]
      // },
      // [PairKey.ORAI_OSMO]: {
      //   contract_addr: 'orai1d37artrk4tkhz2qyjmaulc2jzjkx7206tmpfug',
      //   asset_denoms: [
      //     'orai',
      //     'ibc/9C4DCD21B48231D0BC2AC3D1B74A864746B37E4292694C93C617324250D002FC'
      //   ]
      // }
    }
  ]
};

export const mockToken: TokensSwap = Object.fromEntries(
  tokens[1]
    .filter((token) => token.cosmosBased)
    .map((item) => [item.denom, item])
);

export const pairsMap = pairs[network.id][0];
