import { tokens } from "./bridgeTokens";
import { network, NetworkKey } from "./networks";

export type Pair = {
    contractAddress: string,
};

export enum PairKey {
    ORAI_AIRI = 'ORAI-AIRI',
    ORAI_ATOM = 'ORAI-ATOM',
    AIRI_ATOM = 'AIRI-ATOM',
}

export type TokenSwap = {
    name: string,
    denom: string,
    contractAddress?: string,
    Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>,
}

const pairs: { [networkKey: string]: [{ [key: string]: Pair }] } = {
    [NetworkKey.TESTNET]: [{
        [PairKey.ORAI_AIRI]: {
            contractAddress: 'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2',
        },
    }],
    [NetworkKey.MAINNET]: [{
        [PairKey.ORAI_AIRI]: {
            contractAddress: 'orai1wkhkazf88upf2dxqedggy3ldja342rzmfs2mep',
        },
        [PairKey.ORAI_ATOM]: {
            contractAddress: 'orai12j04ae0ql3jmmj20j97ve7q9u6guwxkv4wm8g3',
        }
    }],
}

const tokenSwaps = Object.assign({}, ...(tokens[1].filter(token => token.cosmosBased).map(item => ({ [item.name]: { name: item.name, denom: item.denom, contractAddress: item.contractAddress, Icon: item.Icon } }))));;

export const pairsMap = pairs[network.id][0];
export const mockToken = tokenSwaps;