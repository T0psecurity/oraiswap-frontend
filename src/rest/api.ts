import { network } from 'config/networks';
import { TokenItemType } from 'config/bridgeTokens';
import { AssetInfo, PairInfo } from 'types/oraiswap_pair/pair_info';
import { PoolResponse } from 'types/oraiswap_pair/pool_response';
import _ from 'lodash';
import { ORAI, ORAIX_CLAIM_CONTRACT } from 'config/constants';
import { getPair, Pair, pairs } from 'config/pools';
import axios from './request';
import { TokenInfo } from 'types/token';

export enum Type {
  'TRANSFER' = 'Transfer',
  'SWAP' = 'Swap',
  'PROVIDE' = 'Provide',
  'WITHDRAW' = 'Withdraw',
  'INCREASE_ALLOWANCE' = 'Increase allowance',
  'BOND_LIQUIDITY' = 'Bond liquidity',
  'WITHDRAW_LIQUIDITY_MINING' = 'Withdraw Liquidity Mining Rewards',
  'UNBOND_LIQUIDITY' = 'Unbond Liquidity Tokens',
  'CONVERT_TOKEN' = 'Convert IBC or CW20 Tokens',
  'CLAIM_ORAIX' = 'Claim ORAIX tokens',
  'CONVERT_TOKEN_REVERSE' = 'Convert reverse IBC or CW20 Tokens',
}

const oraiInfo = { native_token: { denom: ORAI } };

const toQueryMsg = (msg: string) => {
  try {
    return Buffer.from(JSON.stringify(JSON.parse(msg))).toString('base64');
  } catch (error) {
    return '';
  }
};

const querySmart = async (
  contract: string,
  msg: string | object,
  lcd?: string
) => {
  const params =
    typeof msg === 'string'
      ? toQueryMsg(msg)
      : Buffer.from(JSON.stringify(msg)).toString('base64');
  const url = `${lcd ?? network.lcd
    }/wasm/v1beta1/contract/${contract}/smart/${params}`;

  const res = (await axios.get(url)).data;
  if (res.code) throw new Error(res.message);
  return res.data;
};

async function fetchPairs() {
  const data = await querySmart(network.factory, { pairs: {} });
  return data;
}

async function fetchTaxRate() {
  const data = await querySmart(network.oracle, { treasury: { tax_rate: {} } });
  return data;
}

function fetchPoolMiningInfo(tokenInfo: TokenInfo) {
  let { info: token_asset } = parseTokenInfo(tokenInfo);
  if (token_asset.token)
    return querySmart(network.staking, {
      pool_info: { asset_token: token_asset.token.contract_addr },
    });
  // currently ibc pool is not supported
  else throw 'IBC native pool is not supported';
}

function fetchRewardMiningInfo(address: string, asset_info: AssetInfo) {
  return querySmart(network.staking, {
    reward_info: { staker_addr: address, asset_info },
  });
}

async function fetchTokenInfo(tokenSwap: TokenItemType): Promise<TokenInfo> {
  let tokenInfo: TokenInfo = {
    ...tokenSwap,
    symbol: '',
    name: tokenSwap.name,
    contractAddress: tokenSwap.contractAddress,
    decimals: 6,
    icon: '',
    denom: tokenSwap.denom,
    verified: false,
    total_supply: '',
  };
  if (!tokenSwap.contractAddress) {
    tokenInfo.symbol = tokenSwap.name;
    tokenInfo.verified = true;
  } else {
    const data = await querySmart(tokenSwap.contractAddress, {
      token_info: {},
    });
    tokenInfo = {
      ...tokenInfo,
      symbol: data.symbol,
      name: data.name,
      contractAddress: tokenSwap.contractAddress,
      decimals: data.decimals,
      icon: data.icon,
      verified: data.verified,
      total_supply: data.total_supply,
    };
  }
  return tokenInfo;
}

async function fetchPool(pairAddr: string): Promise<PoolResponse> {
  const data = await querySmart(pairAddr, { pool: {} });
  return data;
}

function parsePoolAmount(poolInfo: PoolResponse, trueAsset: any) {
  return parseInt(
    poolInfo.assets.find((asset) => _.isEqual(asset.info, trueAsset))?.amount ??
    '0'
  );
}

async function fetchPoolInfoAmount(
  fromTokenInfo: TokenItemType,
  toTokenInfo: TokenItemType
): Promise<PoolInfo> {
  const { info: fromInfo } = parseTokenInfo(fromTokenInfo, undefined);
  const { info: toInfo } = parseTokenInfo(toTokenInfo, undefined);

  let offerPoolAmount = 0,
    askPoolAmount = 0;

  const pair = getPair(fromTokenInfo.denom, toTokenInfo.denom);

  if (pair) {
    const poolInfo = await fetchPool(pair.contract_addr);
    offerPoolAmount = parsePoolAmount(poolInfo, fromInfo);
    askPoolAmount = parsePoolAmount(poolInfo, toInfo);
  } else {
    // handle multi-swap case
    const fromPairInfo = getPair(fromTokenInfo.denom, ORAI) as Pair;
    const toPairInfo = getPair(ORAI, toTokenInfo.denom) as Pair;
    const fromPoolInfo = await fetchPool(fromPairInfo.contract_addr);
    const toPoolInfo = await fetchPool(toPairInfo.contract_addr);
    offerPoolAmount = parsePoolAmount(fromPoolInfo, fromInfo);
    askPoolAmount = parsePoolAmount(toPoolInfo, toInfo);
  }

  return { offerPoolAmount, askPoolAmount };
}

async function fetchPairInfo(
  assetInfos: [TokenItemType, TokenItemType]
): Promise<PairInfo> {
  let { info: firstAsset } = parseTokenInfo(assetInfos[0]);
  let { info: secondAsset } = parseTokenInfo(assetInfos[1]);

  const data = await fetchPairInfoRaw([firstAsset, secondAsset]);
  return data;
}

async function fetchPairInfoRaw(assetInfos: [any, any]): Promise<PairInfo> {
  const data = await querySmart(network.factory, {
    pair: { asset_infos: assetInfos },
  });
  return data;
}

async function fetchTokenBalance(
  tokenAddr: string,
  walletAddr: string,
  lcd?: string
): Promise<number> {
  const data = await querySmart(
    tokenAddr,
    {
      balance: { address: walletAddr },
    },
    lcd
  );
  return parseInt(data.balance);
}

async function fetchTokenAllowance(
  tokenAddr: string,
  walletAddr: string,
  spender: string,
  lcd?: string
) {
  const data = await querySmart(
    tokenAddr,
    {
      allowance: {
        owner: walletAddr,
        spender,
      },
    },
    lcd
  );
  return data.allowance;
}

async function fetchRewardInfo(
  staker_addr: string,
  asset_token: TokenItemType,
  lcd?: string
) {
  let { info: asset_info } = parseTokenInfo(asset_token);
  const data = await querySmart(
    network.staking,
    {
      reward_info: {
        staker_addr,
        asset_info,
      },
    },
    lcd
  );

  return data;
}

async function fetchRewardPerSecInfo(assetToken: TokenItemType, lcd?: string) {
  let { info: asset_info } = parseTokenInfo(assetToken);
  const data = await querySmart(
    network.staking,
    {
      rewards_per_sec: {
        asset_info,
      },
    },
    lcd
  );

  return data;
}

async function fetchStakingPoolInfo(assetToken: TokenItemType, lcd?: string) {
  let { info: asset_info } = parseTokenInfo(assetToken);
  const data = await querySmart(
    network.staking,
    {
      pool_info: {
        asset_info,
      },
    },
    lcd
  );

  return data;
}

async function fetchDistributionInfo(assetToken: TokenInfo, lcd?: string) {
  let { info: asset_info } = parseTokenInfo(assetToken);
  const data = await querySmart(
    network.rewarder,
    {
      distribution_info: {
        asset_info,
      },
    },
    lcd
  );

  return data;
}

async function fetchNativeTokenBalance(
  walletAddr: string,
  denom: string = ORAI,
  lcd?: string
) {
  const url = `${lcd ?? network.lcd
    }/cosmos/bank/v1beta1/balances/${walletAddr}`;
  const res: any = (await axios.get(url)).data;
  const amount =
    res.balances.find((balance: { denom: string }) => balance.denom === denom)
      ?.amount ?? 0;
  return parseInt(amount);
}

async function fetchBalance(
  walletAddr: string,
  denom: string,
  tokenAddr?: string,
  lcd?: string
): Promise<number> {
  if (!tokenAddr) return fetchNativeTokenBalance(walletAddr, denom, lcd);
  else return fetchTokenBalance(tokenAddr, walletAddr, lcd);
}

const parseTokenInfo = (tokenInfo: TokenItemType, amount?: string | number) => {
  if (!tokenInfo?.contractAddress) {
    if (amount)
      return {
        fund: { denom: tokenInfo.denom, amount: amount.toString() },
        info: { native_token: { denom: tokenInfo.denom } },
      };
    return { info: { native_token: { denom: tokenInfo.denom } } };
  }
  return { info: { token: { contract_addr: tokenInfo?.contractAddress } } };
};

const handleSentFunds = (...funds: (Fund | undefined)[]): Funds | null => {
  let sent_funds = [];
  for (let fund of funds) {
    if (fund) sent_funds.push(fund);
  }
  if (sent_funds.length === 0) return null;
  sent_funds.sort((a, b) => a.denom.localeCompare(b.denom));
  return sent_funds;
};

async function fetchExchangeRate(base_denom: string, quote_denom: string) {
  const data = await querySmart(network.oracle, {
    exchange: { exchange_rate: { base_denom, quote_denom } },
  });
  return data?.item?.exchange_rate;
}

const generateSwapOperationMsgs = (
  denoms: [string, string],
  offerInfo: any,
  askInfo: any
) => {
  const pair = getPair(denoms);

  return pair
    ? [
      {
        orai_swap: {
          offer_asset_info: offerInfo,
          ask_asset_info: askInfo,
        },
      },
    ]
    : [
      {
        orai_swap: {
          offer_asset_info: offerInfo,
          ask_asset_info: oraiInfo,
        },
      },
      {
        orai_swap: {
          offer_asset_info: oraiInfo,
          ask_asset_info: askInfo,
        },
      },
    ];
};

async function simulateSwap(query: {
  fromInfo: TokenInfo;
  toInfo: TokenInfo;
  amount: number | string;
}) {
  const { amount, fromInfo, toInfo } = query;
  // check if they have pairs. If not then we go through ORAI

  const { info: offerInfo } = parseTokenInfo(fromInfo, amount.toString());
  const { info: askInfo } = parseTokenInfo(toInfo, undefined);

  let operations = generateSwapOperationMsgs(
    [fromInfo.denom, toInfo.denom],
    offerInfo,
    askInfo
  );

  let msg = {
    simulate_swap_operations: {
      operations,
      offer_amount: amount.toString(),
    },
  };

  const data = await querySmart(network.router, msg);
  return data;
}

export type SwapQuery = {
  type: Type.SWAP;
  fromInfo: TokenInfo;
  toInfo: TokenInfo;
  amount: number | string;
  max_spread: number | string;
  belief_price: number | string;
  sender: string;
};

export type ProvideQuery = {
  type: Type.PROVIDE;
  // from: string;
  // to: string;
  fromInfo: TokenInfo;
  toInfo: TokenInfo;
  fromAmount: number | string;
  toAmount: number | string;
  slippage?: number | string;
  sender: string;
  pair: string; // oraiswap pair contract addr, handle provide liquidity
};

export type WithdrawQuery = {
  type: Type.WITHDRAW;
  lpAddr: string;
  amount: number | string;
  sender: string;
  pair: string; // oraiswap pair contract addr, handle withdraw liquidity
};

export type TransferQuery = {
  type: Type.TRANSFER;
  amount: number | string;
  sender: string;
  token: string;
  recipientAddress: string;
};

export type IncreaseAllowanceQuery = {
  type: Type.INCREASE_ALLOWANCE;
  amount: number | string;
  sender: string;
  spender: string;
  token: string; //token contract addr
};

async function generateContractMessages(
  query:
    | SwapQuery
    | ProvideQuery
    | WithdrawQuery
    | IncreaseAllowanceQuery
    | TransferQuery
) {
  const { type, sender, ...params } = query;
  let sent_funds;
  // for withdraw & provide liquidity methods, we need to interact with the oraiswap pair contract
  let contractAddr = network.router;
  let input;
  switch (type) {
    case Type.SWAP:
      const swapQuery = params as SwapQuery;
      const { fund: offerSentFund, info: offerInfo } = parseTokenInfo(
        swapQuery.fromInfo,
        swapQuery.amount.toString()
      );
      const { fund: askSentFund, info: askInfo } = parseTokenInfo(
        swapQuery.toInfo
      );
      sent_funds = handleSentFunds(offerSentFund as Fund, askSentFund as Fund);
      let inputTemp = {
        execute_swap_operations: {
          operations: generateSwapOperationMsgs(
            [swapQuery.fromInfo.denom, swapQuery.toInfo.denom],
            offerInfo,
            askInfo
          ),
        },
      };
      // if cw20 => has to send through cw20 contract
      if (!swapQuery.fromInfo.contractAddress) {
        input = inputTemp;
      } else {
        input = {
          send: {
            contract: contractAddr,
            amount: swapQuery.amount.toString(),
            msg: btoa(JSON.stringify(inputTemp)),
          },
        };
        contractAddr = swapQuery.fromInfo.contractAddress;
      }
      break;
    // TODO: provide liquidity and withdraw liquidity
    case Type.PROVIDE:
      const provideQuery = params as ProvideQuery;
      const { fund: fromSentFund, info: fromInfoData } = parseTokenInfo(
        provideQuery.fromInfo,
        provideQuery.fromAmount
      );
      const { fund: toSentFund, info: toInfoData } = parseTokenInfo(
        provideQuery.toInfo,
        provideQuery.toAmount
      );
      sent_funds = handleSentFunds(fromSentFund as Fund, toSentFund as Fund);
      input = {
        provide_liquidity: {
          assets: [
            {
              info: toInfoData,
              amount: provideQuery.toAmount.toString(),
            },
            { info: fromInfoData, amount: provideQuery.fromAmount.toString() },
          ],
        },
      };
      contractAddr = provideQuery.pair;
      break;
    case Type.WITHDRAW:
      const withdrawQuery = params as WithdrawQuery;

      input = {
        send: {
          owner: sender,
          contract: withdrawQuery.pair,
          amount: withdrawQuery.amount.toString(),
          msg: 'eyJ3aXRoZHJhd19saXF1aWRpdHkiOnt9fQ==', // withdraw liquidity msg in base64 : {"withdraw_liquidity":{}}
        },
      };
      contractAddr = withdrawQuery.lpAddr;
      break;
    case Type.INCREASE_ALLOWANCE:
      const increaseAllowanceQuery = params as IncreaseAllowanceQuery;
      input = {
        increase_allowance: {
          amount: increaseAllowanceQuery.amount.toString(),
          spender: increaseAllowanceQuery.spender,
        },
      };
      contractAddr = increaseAllowanceQuery.token;
      break;
    case Type.TRANSFER:
      const transferQuery = params as TransferQuery;
      input = {
        transfer: {
          recipient: transferQuery.recipientAddress,
          amount: transferQuery.amount,
        },
      };
      contractAddr = transferQuery.token;
      break;
    default:
      break;
  }

  const msgs = [
    {
      contract: contractAddr,
      msg: Buffer.from(JSON.stringify(input)),
      sender,
      sent_funds,
    },
  ];

  return msgs;
}

export type BondMining = {
  type: Type.BOND_LIQUIDITY;
  // from: string;
  // to: string;
  lpToken: string;
  amount: number | string;
  assetToken: TokenInfo;
  sender: string;
};

export type WithdrawMining = {
  type: Type.WITHDRAW_LIQUIDITY_MINING;
  sender: string;
  assetToken: TokenInfo;
};

export type UnbondLiquidity = {
  type: Type.UNBOND_LIQUIDITY;
  sender: string;
  amount: number | string;
  assetToken: TokenInfo;
};

async function generateMiningMsgs(
  msg: BondMining | WithdrawMining | UnbondLiquidity
) {
  const { type, sender, ...params } = msg;
  let sent_funds;
  // for withdraw & provide liquidity methods, we need to interact with the oraiswap pair contract
  let contractAddr = network.router;
  let input;
  switch (type) {
    case Type.BOND_LIQUIDITY: {
      const bondMsg = params as BondMining;
      // currently only support cw20 token pool
      let { info: asset_info } = parseTokenInfo(bondMsg.assetToken);
      input = {
        send: {
          contract: network.staking,
          amount: bondMsg.amount.toString(),
          msg: btoa(
            JSON.stringify({
              bond: {
                asset_info,
              },
            })
          ), // withdraw liquidity msg in base64 : {"withdraw_liquidity":{}}
        },
      };
      contractAddr = bondMsg.lpToken;
      break;
    }
    case Type.WITHDRAW_LIQUIDITY_MINING: {
      const msg = params as WithdrawMining;
      let { info: asset_info } = parseTokenInfo(msg.assetToken);
      input = { withdraw: { asset_info } };
      contractAddr = network.staking;
      break;
    }
    case Type.UNBOND_LIQUIDITY:
      const unbondMsg = params as UnbondLiquidity;
      let { info: unbond_asset } = parseTokenInfo(unbondMsg.assetToken);
      input = {
        unbond: {
          asset_info: unbond_asset,
          amount: unbondMsg.amount.toString(),
        },
      };
      contractAddr = network.staking;
      break;
    default:
      break;
  }

  const msgs = [
    {
      contract: contractAddr,
      msg: Buffer.from(JSON.stringify(input)),
      sender,
      sent_funds,
    },
  ];

  return msgs;
}

export type Convert = {
  type: Type.CONVERT_TOKEN;
  sender: string;
  inputToken: TokenItemType;
  inputAmount: string;
};

export type ConvertReverse = {
  type: Type.CONVERT_TOKEN_REVERSE;
  sender: string;
  inputToken: TokenItemType;
  inputAmount: string;
  outputToken: TokenItemType;
};

async function generateConvertMsgs(msg: Convert | ConvertReverse) {
  const { type, sender, inputToken, inputAmount } = msg;
  let sent_funds;
  // for withdraw & provide liquidity methods, we need to interact with the oraiswap pair contract
  let contractAddr = network.converter;
  let input;
  switch (type) {
    case Type.CONVERT_TOKEN: {
      // currently only support cw20 token pool
      let { info: assetInfo, fund } = parseTokenInfo(inputToken, inputAmount);
      // native case
      if (assetInfo.native_token) {
        input = {
          convert: {},
        };
        sent_funds = handleSentFunds(fund as Fund);
      } else {
        // cw20 case
        input = {
          send: {
            contract: network.converter,
            amount: inputAmount,
            msg: btoa(
              JSON.stringify({
                convert: {},
              })
            ),
          },
        };
        contractAddr = assetInfo.token.contract_addr;
      }
      break;
    }
    case Type.CONVERT_TOKEN_REVERSE: {
      const { outputToken } = msg as ConvertReverse;

      // currently only support cw20 token pool
      let { info: assetInfo, fund } = parseTokenInfo(inputToken, inputAmount);
      let { info: outputAssetInfo } = parseTokenInfo(outputToken, '0');
      // native case
      if (assetInfo.native_token) {
        input = {
          convert_reverse: {
            from_asset: outputAssetInfo,
          },
        };
        sent_funds = handleSentFunds(fund as Fund);
      } else {
        // cw20 case
        input = {
          send: {
            contract: network.converter,
            amount: inputAmount,
            msg: btoa(
              JSON.stringify({
                convert_reverse: {
                  from: outputAssetInfo,
                },
              })
            ),
          },
        };
        contractAddr = assetInfo.token.contract_addr;
      }
      break;
    }
    default:
      break;
  }

  const msgs = [
    {
      contract: contractAddr,
      msg: Buffer.from(JSON.stringify(input)),
      sender,
      sent_funds,
    },
  ];

  return msgs;
}

export type Claim = {
  type: Type.CLAIM_ORAIX;
  sender: string;
  stage: number;
  amount: string;
  proofs: string[];
};

function generateClaimMsg(msg: Claim) {
  const { type, sender, stage, amount, proofs } = msg;
  let sent_funds;
  // for withdraw & provide liquidity methods, we need to interact with the oraiswap pair contract
  let contractAddr = ORAIX_CLAIM_CONTRACT;
  let input;
  switch (type) {
    case Type.CLAIM_ORAIX:
      input = {
        claim: {
          stage,
          amount: amount.toString(),
          proof: proofs,
        }
      }
      break;
    default:
      break;
  }

  return {
    contract: contractAddr,
    msg: Buffer.from(JSON.stringify(input)),
    sender,
    sent_funds,
  };
}

export {
  querySmart,
  fetchTaxRate,
  fetchNativeTokenBalance,
  fetchPairInfo,
  fetchPool,
  fetchTokenBalance,
  fetchBalance,
  fetchPairs,
  fetchTokenInfo,
  generateContractMessages,
  generateClaimMsg,
  fetchExchangeRate,
  simulateSwap,
  fetchPoolInfoAmount,
  fetchTokenAllowance,
  fetchPoolMiningInfo,
  fetchRewardMiningInfo,
  generateMiningMsgs,
  generateConvertMsgs,
  fetchRewardInfo,
  fetchRewardPerSecInfo,
  fetchStakingPoolInfo,
  fetchDistributionInfo,
};
