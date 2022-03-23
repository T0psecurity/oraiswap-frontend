interface ExtNetworkConfig {
  chainId: string;
  rpc: string;
  lcd: string;
  explorer: string;
}

export interface NetworkConfig extends ExtNetworkConfig {
  /** Chain ID */
  id: string;

  /** Fixed fee */
  fee: { gasPrice: string; amount: string; gas: string };
  factory: string;
  oracle: string;
  router: string;
  denom: string;
}

export interface Network extends NetworkConfig {
  /** Get finder link */
  finder: (address: string, path?: string) => string;

  /** Refresh the network from the extension */
  refresh: () => void;
}
