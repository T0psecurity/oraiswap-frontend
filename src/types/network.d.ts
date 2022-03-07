import { TokenInfoResponse } from './ow20/token_info_response';

interface ExtNetworkConfig {
  chainId: string;
  rpc: string;
  lcd: string;
  explorer: string;
}

interface NetworkConfig extends ExtNetworkConfig {
  /** Chain ID */
  id: string;
  /** Contract Addresses JSON URL */
  contract: string;
  /** Swap Contract Addresses JSON URL */
  swap: string;
  /** Wallet URL */
  walletUrl: string;

  /** Fixed fee */
  fee: { gasPrice: string; amount: string; gas: string };
  factory: string;
  oracle: string;
  router: string;
  tokens: TokenInfoResponse[];
}

interface Network extends NetworkConfig {
  /** Get finder link */
  finder: (address: string, path?: string) => string;

  /** Refresh the network from the extension */
  refresh: () => void;
}
