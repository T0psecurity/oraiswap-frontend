import { TokenItemType } from 'config/bridgeTokens';

export type TokenInfo = TokenItemType & {
  symbol: string;
  total_supply: string;
  icon?: string;
  verified?: boolean;
};
