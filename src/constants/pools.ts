import { TokenItemType, tokens } from './bridgeTokens';
import { network, NetworkKey } from './networks';

export type Pair = {
  contract_addr: string;
  asset_denoms: [string, string];
};

export enum PairKey {
  ORAI_AIRI = 'ORAI-AIRI',
  ORAI_ATOM = 'ORAI-ATOM',
  ORAI_UST = 'ORAI-UST',
  ORAI_LUNA = 'ORAI-LUNA'
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
        contract_addr: 'orai12j04ae0ql3jmmj20j97ve7q9u6guwxkv4wm8g3',
        asset_denoms: [
          'orai',
          'ibc/45C001A5AE212D09879BE4627C45B64D5636086285590D5145A51E18E9D16722'
        ]
      },
      [PairKey.ORAI_UST]: {
        contract_addr: 'orai13us9ewmhyxa3ntl7vyg0gewvwddudlnkuzd8pk',
        asset_denoms: [
          'orai',
          'ibc/D9CDEFD93E29F5C2175C7606DFF67490B2123BB93F299B3AFA53E8BB1DDD4FC4'
        ]
      },
      [PairKey.ORAI_LUNA]: {
        contract_addr: 'orai1ysnprvvmscxj6ukvdm5wtxvu29f9srwtjcrut4',
        asset_denoms: [
          'orai',
          'ibc/6896F977DF5B427359BA77B5AF1052E5512D460F3CE59C8F6A7CB51408351F3C'
        ]
      }
    }
  ]
};

export const mockToken: TokensSwap = Object.fromEntries(
  tokens[1]
    .filter((token) => token.cosmosBased)
    .map((item) => [item.denom, item])
);

export const pairsMap = pairs[network.id][0];
