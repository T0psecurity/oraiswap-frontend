import { tokens } from "./bridgeTokens";
import { network, NetworkKey } from "./networks";

export type Pair = {
    contract_addr: string,
};

export enum PairKey {
    ORAI_AIRI = 'ORAI-AIRI',
    ORAI_ATOM = 'ORAI-ATOM',
    AIRI_ATOM = 'AIRI-ATOM',
}

export type TokensSwap = { [key: string]: TokenSwap };

export type TokenSwap = {
    name: string,
    denom: string,
    contract_addr?: string,
    lcd?: string,
    Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>,
}

const pairs: { [networkKey: string]: [{ [key: string]: Pair }] } = {
    [NetworkKey.TESTNET]: [{
        [PairKey.ORAI_AIRI]: {
            contract_addr: 'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2',
        },
    }],
    [NetworkKey.MAINNET]: [{
        [PairKey.ORAI_AIRI]: {
            contract_addr: 'orai1wkhkazf88upf2dxqedggy3ldja342rzmfs2mep',
        },
        [PairKey.ORAI_ATOM]: {
            contract_addr: 'orai12j04ae0ql3jmmj20j97ve7q9u6guwxkv4wm8g3',
        }
    }],
}

const tokenSwaps: TokensSwap = Object.assign({}, ...(tokens[1].filter(token => token.cosmosBased).map(item => ({ [item.name]: { lcd: item.lcd, name: item.name, denom: item.denom, contract_addr: item.contractAddress, Icon: item.Icon } }))));;

export const pairsMap = pairs[network.id][0];
export const mockToken: TokensSwap = tokenSwaps;