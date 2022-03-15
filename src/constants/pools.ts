import { TokenItemType, tokens } from './bridgeTokens';
import { network, NetworkKey } from './networks';

export type Pair = {
    contract_addr: string;
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
            }
        }
    ],
    [NetworkKey.MAINNET]: [
        {
            [PairKey.ORAI_AIRI]: {
                contract_addr: 'orai1wkhkazf88upf2dxqedggy3ldja342rzmfs2mep'
            },
            [PairKey.ORAI_ATOM]: {
                contract_addr: 'orai12j04ae0ql3jmmj20j97ve7q9u6guwxkv4wm8g3'
            },
            [PairKey.ORAI_UST]: {
                contract_addr: 'orai13us9ewmhyxa3ntl7vyg0gewvwddudlnkuzd8pk',
            },
            [PairKey.ORAI_LUNA]: {
                contract_addr: 'orai1ysnprvvmscxj6ukvdm5wtxvu29f9srwtjcrut4',
            }
        }
    ]
};

const tokenSwaps: TokensSwap = Object.fromEntries(
    tokens[1]
        .filter((token) => token.cosmosBased)
        .map((item) => [item.name, item])
);

export const pairsMap = pairs[network.id][0];
export const mockToken: TokensSwap = tokenSwaps;
