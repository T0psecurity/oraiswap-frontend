import axiosClass from 'axios';
import { network } from 'constants/networks';
import { TokenItemType } from 'constants/bridgeTokens';
import { PairInfo } from 'types/oraiswap_pair/pair_info';
import { PoolResponse } from 'types/oraiswap_pair/pool_response';
import _ from 'lodash';

interface TokenInfo {
  name: string;
  symbol: string;
  denom: string;
  decimals: number;
  total_supply: string;
  contract_addr?: string;
  icon?: string;
  verified?: boolean;
}

export enum Type {
  'TRANSFER' = 'Transfer',
  'SWAP' = 'Swap',
  'PROVIDE' = 'Provide',
  'WITHDRAW' = 'Withdraw'
}

// override with timeout
const axios = axiosClass.create({
  timeout: 10000
});

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
  const url = `${
    lcd ?? network.lcd
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

async function fetchTokenInfo(tokenSwap: TokenItemType): Promise<TokenInfo> {
  let tokenInfo: TokenInfo = {
    symbol: '',
    name: tokenSwap.name,
    contract_addr: tokenSwap.contractAddress,
    decimals: 6,
    denom: tokenSwap.denom,
    icon: '',
    verified: false,
    total_supply: ''
  };
  if (!tokenSwap.contractAddress) {
    tokenInfo.symbol = tokenSwap.name;
    tokenInfo.icon = tokenSwap.name;
    tokenInfo.verified = true;
  } else {
    const data = await querySmart(tokenSwap.contractAddress, {
      token_info: {}
    });
    tokenInfo = {
      ...tokenInfo,
      symbol: data.symbol,
      name: data.name,
      contract_addr: tokenSwap.contractAddress,
      decimals: data.decimals,
      icon: data.icon,
      verified: data.verified
    };
  }
  return tokenInfo;
}

async function fetchPool(pairAddr: string): Promise<PoolResponse> {
  const data = await querySmart(pairAddr, { pool: {} });
  return data;
}

async function fetchPoolInfoAmount(
  fromTokenInfo: TokenInfo,
  toTokenInfo: TokenInfo
) {
  const { info: fromInfo } = parseTokenInfo(fromTokenInfo, undefined);
  const { info: toInfo } = parseTokenInfo(toTokenInfo, undefined);
  const pairInfo = await querySmart(network.factory, {
    pair: { asset_infos: [fromInfo, toInfo] }
  });
  const poolInfo = await fetchPool(pairInfo.contract_addr);
  const offerPoolAmount = parseInt(
    poolInfo.assets.find((asset) => _.isEqual(asset.info, fromInfo))?.amount ??
      '0'
  );
  const askPoolAmount = parseInt(
    poolInfo.assets.find((asset) => _.isEqual(asset.info, toInfo))?.amount ??
      '0'
  );
  return { offerPoolAmount, askPoolAmount };
}

async function fetchPairInfo(
  assetInfos: [TokenInfo, TokenInfo]
): Promise<PairInfo> {
  let { info: firstAsset } = parseTokenInfo(assetInfos[0]);
  let { info: secondAsset } = parseTokenInfo(assetInfos[1]);
  const data = await querySmart(network.factory, {
    pair: { asset_infos: [firstAsset, secondAsset] }
  });
  return data;
}

async function fetchTokenBalance(
  tokenAddr: string,
  walletAddr: string,
  lcd?: string
) {
  const data = await querySmart(
    tokenAddr,
    {
      balance: { address: walletAddr }
    },
    lcd
  );
  return data.balance;
}

async function fetchNativeTokenBalance(
  walletAddr: string,
  denom: string,
  lcd?: string
) {
  const url = `${
    lcd ?? network.lcd
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
) {
  if (!tokenAddr) return fetchNativeTokenBalance(walletAddr, denom, lcd);
  else return fetchTokenBalance(tokenAddr, walletAddr, lcd);
}

const parseTokenInfo = (tokenInfo: TokenInfo, amount?: string | number) => {
  if (!tokenInfo?.contract_addr) {
    if (amount)
      return {
        fund: { denom: tokenInfo.denom, amount },
        info: { native_token: { denom: tokenInfo.denom } }
      };
    return { info: { native_token: { denom: tokenInfo.denom } } };
  }
  return { info: { token: { contract_addr: tokenInfo?.contract_addr } } };
};

const handleSentFunds = (...funds: (Fund | undefined)[]): Funds | null => {
  let sent_funds = [];
  for (let fund of funds) {
    if (fund) sent_funds.push(fund);
  }
  if (sent_funds.length === 0) return null;
  return sent_funds;
};

async function fetchExchangeRate(base_denom: string, quote_denom: string) {
  const data = await querySmart(network.oracle, {
    exchange: { exchange_rate: { base_denom, quote_denom } }
  });
  return data?.item?.exchange_rate;
}

async function simulateSwap(query: {
  fromInfo: TokenInfo;
  toInfo: TokenInfo;
  amount: number | string;
}) {
  const { amount, fromInfo, toInfo } = query;
  const { fund: offerSentFund, info: offerInfo } = parseTokenInfo(
    fromInfo,
    amount.toString()
  );
  const { fund: askSentFund, info: askInfo } = parseTokenInfo(
    toInfo,
    undefined
  );
  let msg = {
    simulate_swap_operations: {
      operations: [
        {
          orai_swap: {
            offer_asset_info: offerInfo,
            ask_asset_info: askInfo
          }
        }
      ],
      offer_amount: amount.toString()
    }
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
  from: string;
  to: string;
  fromInfo: TokenInfo;
  toInfo: TokenInfo;
  fromAmount: number | string;
  toAmount: number | string;
  slippage: number | string;
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

async function generateContractMessages(
  query: SwapQuery | ProvideQuery | WithdrawQuery
) {
  // @ts-ignore
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
        swapQuery.toInfo,
        undefined
      );
      sent_funds = handleSentFunds(offerSentFund as Fund, askSentFund as Fund);
      let inputTemp = {
        execute_swap_operations: {
          operations: [
            {
              orai_swap: {
                offer_asset_info: offerInfo,
                ask_asset_info: askInfo
              }
            }
          ]
        }
      };
      // if cw20 => has to send through cw20 contract
      if (!swapQuery.fromInfo.contract_addr) {
        input = inputTemp;
      } else {
        input = {
          send: {
            contract: contractAddr,
            amount: swapQuery.amount.toString(),
            msg: btoa(JSON.stringify(inputTemp))
          }
        };
        contractAddr = swapQuery.fromInfo.contract_addr;
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
              amount: provideQuery.toAmount
            },
            { info: fromInfoData, amount: provideQuery.fromAmount }
          ]
        }
      };
      contractAddr = provideQuery.pair;
      break;
    case Type.WITHDRAW:
      const withdrawQuery = params as WithdrawQuery;

      input = {
        send: {
          owner: sender,
          contract: withdrawQuery.pair,
          amount: withdrawQuery.amount,
          msg: 'eyJ3aXRoZHJhd19saXF1aWRpdHkiOnt9fQ==' // withdraw liquidity msg in base64 : {"withdraw_liquidity":{}}
        }
      };
      contractAddr = withdrawQuery.lpAddr;
      break;
    default:
      break;
  }

  console.log('input: ', input);

  const msgs = [
    {
      contract: contractAddr,
      msg: Buffer.from(JSON.stringify(input)),
      sender,
      sent_funds
    }
  ];

  return msgs;
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
  fetchExchangeRate,
  simulateSwap,
  fetchPoolInfoAmount
};
