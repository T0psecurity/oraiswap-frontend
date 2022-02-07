export const CHROME = 'https://google.com/chrome';

/* oraiswap:unit */
export const ORAI = 'ORAI';
export const UAIRI = 'uAIRI';
export const AIRI = 'AIRI';
export const LP = 'LP';

export const NATIVE_TOKENS = [ORAI];

/* oraiswap:configs */
export const DEFAULT_MAX_SPREAD = 0.5;
export const MAX_MSG_LENGTH = 1024;

/* network:settings */
export const TX_POLLING_INTERVAL = 1000;
export const MAX_TX_POLLING_RETRY = 20;
export const DEFAULT_EXT_NETWORK: ExtNetworkConfig = {
  name: process.env.REACT_APP_NETWORK ?? 'Oraichain',
  chainID: process.env.REACT_APP_NETWORK ?? 'Oraichain',
  rpc: process.env.REACT_APP_RPC_URL ?? 'https://rpc.orai.io',
  lcd: process.env.REACT_APP_LCD ?? 'https://lcd.orai.io'
};

/* project */
export const MEDIUM = '';
export const DISCORD = '';
export const TELEGRAM = '';
export const WECHAT = '';
export const GITHUB = 'https://github.com/oraichain/oraiswap-frontend.git';
