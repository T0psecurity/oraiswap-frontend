import { NetworkConfig } from 'types/network';

export enum NetworkKey {
  MAINNET = 'mainnet',
  TESTNET = 'testnet'
}

const networks: { [key: string]: NetworkConfig } = {
  [NetworkKey.MAINNET]: {
    chainId: 'Oraichain',
    prefix: 'orai',
    denom: 'orai',
    lcd: 'https://lcd.orai.io',
    rpc: 'https://rpc.orai.io',
    id: NetworkKey.MAINNET,
    fee: { gasPrice: '0.00506', amount: '1518', gas: '2000000' }, // 0.000500 ORAI
    factory: 'orai1hemdkz4xx9kukgrunxu3yw0nvpyxf34v82d2c8',
    router: 'orai1x7s4a42y8scugcac5vj2zre96z86lhntq7qg23',
    oracle: 'orai18rgtdvlrev60plvucw2rz8nmj8pau9gst4q07m',
    explorer: 'https://scan.orai.io'
  },
  [NetworkKey.TESTNET]: {
    chainId: 'Oraichain-testnet',
    prefix: 'orai',
    denom: 'orai',
    lcd: 'https://testnet.lcd.orai.io',
    rpc: 'https://testnet.rpc.orai.io',
    id: NetworkKey.TESTNET,
    fee: { gasPrice: '0.00506', amount: '1518', gas: '2000000' }, // 0.050000 ORAI
    factory: 'orai1d5g77f27jg8wvrrdval36dd5q97rfgn7lmnmra',
    router: 'orai1g0pwp3rgzqywvt0xdut08gknyj5q37rtn5aecx',
    oracle: 'orai1pnujlcvcqwawclat8xrhw80rvjx2yynanpevpn',
    explorer: 'https://testnet.scan.orai.io'
  }
};

export default networks;

let networkKey = process.env.REACT_APP_NETWORK as NetworkKey;
if (networkKey !== NetworkKey.MAINNET) {
  networkKey = NetworkKey.TESTNET;
}

export const network =
  // sure have value
  networks[networkKey];

export interface NetworkItem {
  cosmosBased: boolean;
  name: string;
  chainId: string;
  icon: string;
  rpc: string;
}

// sadly our Oraichain is not added into keplr yet
export const blacklistNetworks: string[] = [network.chainId];
