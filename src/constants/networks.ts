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
    coinType: 118,
    lcd: 'https://lcd.orai.io',
    rpc: 'https://rpc.orai.io',
    id: NetworkKey.MAINNET,
    fee: { gasPrice: '0.00506', amount: '1518', gas: '2000000' }, // 0.000500 ORAI
    factory: process.env.REACT_APP_FACTORY_CONTRACT,
    router: process.env.REACT_APP_ROUTER_CONTRACT,
    oracle: process.env.REACT_APP_ORACLE_CONTRACT,
    staking: process.env.REACT_APP_STAKING_CONTRACT,
    rewarder: process.env.REACT_APP_REWARDER_CONTRACT,
    explorer: 'https://scan.orai.io',    
    gravity: process.env.REACT_APP_GRAVITY_CONTRACT
  },
  [NetworkKey.TESTNET]: {
    chainId: 'Oraichain-testnet',
    prefix: 'orai',
    denom: 'orai',
    coinType: 118,
    lcd: 'https://testnet.lcd.orai.io',
    rpc: 'https://testnet.rpc.orai.io',
    id: NetworkKey.TESTNET,
    fee: { gasPrice: '0.00506', amount: '1518', gas: '2000000' }, // 0.050000 ORAI
    factory: 'orai1d5g77f27jg8wvrrdval36dd5q97rfgn7lmnmra',
    router: 'orai1g0pwp3rgzqywvt0xdut08gknyj5q37rtn5aecx',
    oracle: 'orai1pnujlcvcqwawclat8xrhw80rvjx2yynanpevpn',
    staking: process.env.REACT_APP_STAKING_CONTRACT,
    explorer: 'https://testnet.scan.orai.io',
    rewarder: process.env.REACT_APP_REWARDER_CONTRACT,    
    gravity: process.env.REACT_APP_GRAVITY_CONTRACT
  }
};

export default networks;

export const network =
  // sure have value
  networks[process.env.REACT_APP_NETWORK];

export interface NetworkItem {
  cosmosBased: boolean;
  name: string;
  chainId: string;
  icon: string;
  rpc: string;
}

// sadly our Oraichain is not added into keplr yet
export const blacklistNetworks: string[] = [network.chainId];
