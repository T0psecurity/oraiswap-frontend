import { NetworkConfig } from 'types/network';

export enum NetworkKey {
  MAINNET = 'mainnet',
  TESTNET = 'testnet'
}

const networks: { [key: string]: NetworkConfig } = {
  [NetworkKey.MAINNET]: {
    chainId: 'Oraichain',
    lcd: 'https://lcd.orai.io',
    rpc: 'https://rpc.orai.io',
    id: NetworkKey.MAINNET,
    contract: '/tequila.json',
    walletUrl: 'https://api.wallet.orai.io',
    swap: '/swap.json',
    fee: { gasPrice: '0.00506', amount: '1518', gas: '2000000' }, // 0.000500 ORAI
    factory: 'orai1hemdkz4xx9kukgrunxu3yw0nvpyxf34v82d2c8',
    router: 'orai1x7s4a42y8scugcac5vj2zre96z86lhntq7qg23',
    oracle: 'orai18rgtdvlrev60plvucw2rz8nmj8pau9gst4q07m',
    explorer: 'https://scan.orai.io'
  },
  [NetworkKey.TESTNET]: {
    chainId: 'Oraichain-testnet',
    lcd: 'https://testnet.lcd.orai.io',
    rpc: 'https://testnet.rpc.orai.io',
    id: NetworkKey.TESTNET,
    contract: '/tequila.json',
    walletUrl: 'https://testnet-wallet.web.app',
    swap: '/swap.json',
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

export const oraiBridgeNetwork: NetworkItem = {
  cosmosBased: true,
  name: 'OraiBridge',
  chainId: 'gravity-test',
  rpc: 'http://125.212.192.225:26657',
  icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
};

export const bridgeNetworks: NetworkItem[] = [
  {
    cosmosBased: false,
    name: 'Ethereum',
    chainId: 'ethereum',
    rpc: '',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
  },
  {
    cosmosBased: false,
    name: 'Binance Smart Chain',
    chainId: 'bsc',
    rpc: '',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
  },
  {
    cosmosBased: true,
    name: 'Oraichain-testnet',
    chainId: 'Oraichain-testnet',
    rpc: 'https://testnet.lcd.orai.io',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png'
  },
  {
    cosmosBased: true,
    name: 'Atom',
    chainId: 'Atom',
    rpc: '',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png'
  },
  {
    cosmosBased: true,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/14299.png',
    name: 'Juno',
    chainId: 'Juno',
    rpc: ''
  },
  {
    cosmosBased: true,
    name: 'Osmosis',
    chainId: 'Osmosis',
    rpc: '',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12220.png'
  }
];
