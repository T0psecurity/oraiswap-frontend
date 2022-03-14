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

const tokenSwaps = Object.assign({}, ...(tokens[1].filter(token => token.cosmosBased).map(item => ({ [item.name]: { denom: item.denom, contractAddress: item.contractAddress, logo: item.logo } }))));;

const mockTokens = {
    ORAI: {
        contractAddress: 'ORAI',
        denom: 'orai',
        logo: 'oraichain.svg'
    },
    AIRI: {
        contractAddress: 'orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg',
        logo: 'airi.svg'
    },
    ATOM: {
        contractAddress: 'ATOM',
        denom: 'ibc/45C001A5AE212D09879BE4627C45B64D5636086285590D5145A51E18E9D16722',
        logo: 'atom_cosmos.svg'
    }
};

export const pairsMap = pairs[network.id][0];
export const swapTokens = tokenSwaps;