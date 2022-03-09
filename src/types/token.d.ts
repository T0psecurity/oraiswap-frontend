export interface TokenInfo {
  symbol: string;
  name: string;
  contract_addr: string;
  denom?: string;
  decimals: number;
  icon: string;
  verified: boolean;
}
