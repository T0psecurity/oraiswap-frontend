import mainnetTokens from 'constants/mainnet-tokens.json';
import testnetTokens from 'constants/testnet-tokens.json';

export enum NetworkKey {
  MAINNET = 'Oraichain',
  TESTNET = 'Oraichain-testnet'
}

const networks = {
  mainnet: {
    name: NetworkKey.MAINNET,
    lcd: 'https://lcd.orai.io',
    rpc: 'https://rpc.orai.io',
    id: 'mainnet',
    contract: '/tequila.json',
    swap: '/swap.json',
    tokens: mainnetTokens,
    fee: { gasPrice: '0.00506', amount: '1518', gas: '2000000' }, // 0.000500 ORAI
    factory: 'orai1d5g77f27jg8wvrrdval36dd5q97rfgn7lmnmra',
    router: 'orai1g0pwp3rgzqywvt0xdut08gknyj5q37rtn5aecx',
    oracle: 'orai1pnujlcvcqwawclat8xrhw80rvjx2yynanpevpn'
  },
  testnet: {
    name: NetworkKey.TESTNET,
    lcd: 'https://testnet.lcd.orai.io',
    rpc: 'https://testnet.rpc.orai.io',
    id: 'testnet',
    contract: '/tequila.json',
    swap: '/swap.json',
    tokens: testnetTokens,
    fee: { gasPrice: '0.00506', amount: '1518', gas: '2000000' }, // 0.050000 ORAI
    factory: 'orai1d5g77f27jg8wvrrdval36dd5q97rfgn7lmnmra',
    router: 'orai1g0pwp3rgzqywvt0xdut08gknyj5q37rtn5aecx',
    oracle: 'orai1pnujlcvcqwawclat8xrhw80rvjx2yynanpevpn'
  }
};

export default networks;

// @ts-ignore
export const network =
  process.env.REACT_APP_NETWORK === 'mainnet'
    ? networks.mainnet
    : networks.testnet;
