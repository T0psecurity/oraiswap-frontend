export const CHROME = 'https://google.com/chrome';

/* oraiswap:unit */
export const ORAI = 'orai';
export const UAIRI = 'uAIRI';
export const AIRI = 'AIRI';
export const ATOM = 'ATOM';
export const LP = 'LP';
export const KWT = 'oraie';
export const STABLE_DENOM = 'usdt';
export const BEP20_ORAI = 'bep20_orai';
export const ERC20_ORAI = 'erc20_orai';

export const NATIVE_TOKENS = [ORAI];
export const EVM_DECIMALS = 18;
export const COSMOS_DECIMALS = 6;
export const DECIMAL_FRACTION = Math.pow(10, EVM_DECIMALS);

/* oraiswap:configs */
export const DEFAULT_MAX_SPREAD = 0.5;
export const MAX_MSG_LENGTH = 1024;

/* network:settings */
export const IBC_TRANSFER_TIMEOUT = 3600;
export const AXIOS_THROTTLE_THRESHOLD = 2000;
export const AXIOS_TIMEOUT = 10000;

/* project */
export const MEDIUM = '';
export const DISCORD = '';
export const TELEGRAM = '';
export const WECHAT = '';
export const GITHUB = 'https://github.com/oraichain/oraiswap-frontend.git';

// bsc and eth information
export const ETHEREUM_CHAIN_ID = '0x1';
export const ETHEREUM_RPC =
  'https://mainnet.infura.io/v3/648e041e75924b5c9d0254e4a76c9978';
export const BSC_CHAIN_ID = '0x38';
export const BSC_RPC = 'https://bsc-dataseed.binance.org';
export const ORAI_BRIDGE_CHAIN_ID = 'oraibridge-subnet-2';
export const KWT_SUBNETWORK_CHAIN_ID = 'kawaii_6886-1';
export const ORAICHAIN_ID = 'Oraichain';

export const ORAI_BRIDGE_DENOM = 'ORAIB';
export const ORAI_BRIDGE_UDENOM = 'uoraib';
export const ORAI_BRIDGE_EVM_DENOM_PREFIX = 'oraib';
export const ORAI_BRIDGE_EVM_FEE = '1';
export const ORAI_BRIDGE_RPC = 'https://bridge-v2.rpc.orai.io';
export const ORAI_BRIDGE_LCD = 'https://bridge-v2.lcd.orai.io';
export const ORAIX_CLAIM_URL = 'https://oraix-airdrop.oraidex.io';
export const ORAI_BRIDGE_PREFIX = 'oraib';

export const ORAI_ETH_CONTRACT = '0x4c11249814f11b9346808179cf06e71ac328c1b5';
export const ORAI_BSC_CONTRACT = '0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0';
export const AIRI_BSC_CONTRACT = '0x7e2A35C746F2f7C240B664F1Da4DD100141AE71F';
export const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
export const KWT_BSC_CONTRACT = '0x257a8d1E03D17B8535a182301f15290F11674b53';
export const ORAIX_DENOM = 'ORAIX';

// ORAIX claim
export const ORAIX_CLAIM_CONTRACT =
  'orai1z0ux6rjp5puectjhlmj96kzelax4nmf6zhsc23';

// Kawaiiverse subnetwork
export const KAWAII_RPC = 'https://tendermint1.kawaii.global';
export const KAWAII_LCD = 'https://cosmos1.kawaii.global';
export const KAWAII_API_DEV = 'https://developers.kawaii.global';
export const KAWAII_CONTRACT = '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd';
export const KAWAII_SUBNET_RPC = 'https://endpoint1.kawaii.global';
