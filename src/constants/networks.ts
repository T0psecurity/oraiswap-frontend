import mainnetTokens from 'constants/mainnet-tokens.json';
import testnetTokens from 'constants/testnet-tokens.json';
import { NetworkConfig } from 'types/network';

export enum NetworkKey {
  MAINNET = 'mainnet',
  TESTNET = 'testnet'
}

const networks: Map<NetworkKey, NetworkConfig> = new Map<
  NetworkKey,
  NetworkConfig
>([
  [
    NetworkKey.MAINNET,
    {
      chainId: 'Oraichain',
      lcd: 'https://lcd.orai.io',
      rpc: 'https://rpc.orai.io',
      id: NetworkKey.MAINNET,
      contract: '/tequila.json',
      walletUrl: 'https://api.wallet.orai.io',
      swap: '/swap.json',
      tokens: mainnetTokens,
      fee: { gasPrice: '0.00506', amount: '1518', gas: '2000000' }, // 0.000500 ORAI
      factory: 'orai1d5g77f27jg8wvrrdval36dd5q97rfgn7lmnmra',
      router: 'orai1g0pwp3rgzqywvt0xdut08gknyj5q37rtn5aecx',
      oracle: 'orai1pnujlcvcqwawclat8xrhw80rvjx2yynanpevpn'
    }
  ],
  [
    NetworkKey.TESTNET,
    {
      chainId: 'Oraichain-testnet',
      lcd: 'https://testnet.lcd.orai.io',
      rpc: 'https://testnet.rpc.orai.io',
      id: NetworkKey.TESTNET,
      contract: '/tequila.json',
      walletUrl: 'https://testnet-wallet.web.app',
      swap: '/swap.json',
      tokens: testnetTokens,
      fee: { gasPrice: '0.00506', amount: '1518', gas: '2000000' }, // 0.050000 ORAI
      factory: 'orai1d5g77f27jg8wvrrdval36dd5q97rfgn7lmnmra',
      router: 'orai1g0pwp3rgzqywvt0xdut08gknyj5q37rtn5aecx',
      oracle: 'orai1pnujlcvcqwawclat8xrhw80rvjx2yynanpevpn'
    }
  ]
]);

export default networks;

let networkKey = localStorage.getItem('network') as NetworkKey;
if (networkKey !== NetworkKey.MAINNET) {
  networkKey = NetworkKey.TESTNET;
}

export const network =
  // sure have value
  networks.get(networkKey)!;
