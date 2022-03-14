//@ts-nocheck
import { useCallback } from 'react';
import oraiswapConfig from 'constants/oraiswap.json';
import axios from './request';
import { Type } from 'pages/Swap';
import { AxiosError } from 'axios';
import { network } from 'constants/networks';
import { ORAI, UAIRI } from 'constants/constants';
import useQuerySmart from 'hooks/useQuerySmart';
import useLocalStorage from 'libs/useLocalStorage';
import { useContractsAddress } from 'hooks/useContractsAddress';
import { Coin } from '@cosmjs/cosmwasm-stargate/build/codec/cosmos/base/v1beta1/coin';
import { useContractsAddressToken } from 'hooks';
import { TokenInfo as TokenInfoExtend } from 'types/token';

export interface DenomBalanceResponse {
  balances: DenomInfo[];
}

interface DenomInfo {
  denom: string;
  amount: string;
}

interface ContractBalance {
  balance: string;
}

interface GasPriceResponse {
  orai: string;
}

interface Pairs {
  pairs: Pair[];
}

export interface Pair {
  pair: TokenInfo[];
  contract: string;
  liquidity_token: string;
}

interface TokenInfo {
  symbol: string;
  name: string;
  contract_addr: string;
}

interface PairsResponse {
  height: string;
  result: PairsResult;
}

interface PairsResult {
  pairs: PairResult[];
}

interface PairResult {
  oracle_addr: string;
  liquidity_token: string;
  contract_addr: string;
  asset_infos: (NativeInfo | AssetInfo)[];
}

interface TokenResult {
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
  contract_addr: string;
  icon: string;
  verified: boolean;
}

interface Pool {
  assets: Token[];
  total_share: string;
}

interface PoolResult {
  estimated: string;
  price1: string;
  price2: string;
  afterPool: string;
  LP: string;
  // fromLP: Asset[]
  // text: string
}

export interface SimulatedData {
  return_amount: string;
  offer_amount: string;
  commission_amount: string;
  spread_amount: string;
}
interface TaxRateResponse {
  rate: string;
}
interface TaxCapResponse {
  cap: string;
}

const blacklist = oraiswapConfig.blacklist.map(
  (blacklist) => blacklist.contract_addr
);

const isBlacklisted = (info: NativeInfo | AssetInfo) => {
  if (!isAssetInfo(info) || !blacklist.includes(info.token.contract_addr)) {
    return false;
  }

  return true;
};

export function isAssetInfo(object: any): object is AssetInfo {
  return 'token' in object;
}

export function isNativeInfo(object: any): object is NativeInfo {
  return 'native_token' in object;
}

export default () => {
  const [address] = useLocalStorage<string>('address');
  const { getSymbol } = useContractsAddress();
  const querySmart = useQuerySmart();

  // useBalance
  const loadDenomBalance = useCallback(async () => {
    if (!address) return [];
    const url = `${network.lcd}/cosmos/bank/v1beta1/balances/${address}`;
    const res: DenomBalanceResponse = (await axios.get(url)).data;
    return res.balances;
  }, [address]);

  const loadContractBalance = useCallback(
    async (localContractAddr: string) => {
      const res: ContractBalance = await querySmart(localContractAddr, {
        balance: { address: address }
      });
      return res;
    },
    [address, querySmart]
  );

  // useGasPrice

  const loadGasPrice = useCallback(async (symbol: string) => {
    const symbolName = symbol;
    const url = `${network.lcd}/provider/minfees?valNum=0&OracleScriptName=min_gas_prices`;
    const res: GasPriceResponse = (await axios.get(url)).data;

    let gasPrice = '0';
    if ([UAIRI].includes(symbolName)) {
      gasPrice = (res as any)?.[symbolName];
    }

    return gasPrice;
  }, []);

  // usePairs
  const loadPairs = useCallback(async () => {
    let result: PairsResult = {
      pairs: []
    };
    let lastPair: (NativeInfo | AssetInfo)[] | null = null;

    try {
      const res: PairsResult = await querySmart(network.factory, { pairs: {} });

      if (res.pairs.length !== 0) {
        res.pairs
          .filter(
            (pair) =>
              !isBlacklisted(pair?.asset_infos?.[0]) &&
              !isBlacklisted(pair?.asset_infos?.[1])
          )
          .forEach((pair) => {
            result.pairs.push(pair);
          });

        return result;
      }
    } catch (error) {
      console.log(error);
    }

    while (true) {
      const pairs: PairsResponse = await querySmart(network.factory, {
        pairs: { limit: 30, start_after: lastPair }
      });

      if (!Array.isArray(pairs?.result?.pairs)) {
        // node might be down
        break;
      }

      if (pairs.result.pairs.length <= 0) {
        break;
      }

      pairs.result.pairs
        .filter(
          (pair) =>
            !isBlacklisted(pair?.asset_infos?.[0]) &&
            !isBlacklisted(pair?.asset_infos?.[1])
        )
        .forEach((pair) => {
          result.pairs.push(pair);
        });
      lastPair = pairs.result.pairs.slice(-1)[0]?.asset_infos;
    }
    return result;
  }, [querySmart]);

  const loadSwappableTokenAddresses = useCallback(
    async (from: string) => {
      const response = await fetch(network.swap);
      const data = await response.json();

      const res: string[] = data[from]
        ?.filter((item: any) => item.token)
        .map((item: any) => item.token.contract_addr);

      return res;
    },
    [network.swap]
  );

  const loadTokenInfo = useCallback(
    async (contract: string): Promise<TokenResult> => {
      const res: TokenResult = await querySmart(contract, { token_info: {} });
      return res;
    },
    [querySmart]
  );

  // usePool
  const loadPool = useCallback(
    async (contract: string) => {
      const res: Pool = await querySmart(contract, { pool: {} });
      return res;
    },
    [querySmart]
  );

  // useSwapSimulate
  const querySimulate = useCallback(
    async (variables: { msg: any }) => {
      try {
        const { msg } = variables;
        const {
          simulate_swap_operations: { offer_amount: amount, operations }
        } = msg;

        const swapInfo = operations[0].orai_swap;

        const input = {
          simulation: {
            offer_asset: {
              info: swapInfo.offer_asset_info,
              amount
            }
          }
        };

        const info: PairResult = await querySmart(network.factory, {
          pair: {
            asset_infos: [swapInfo.offer_asset_info, swapInfo.ask_asset_info]
          }
        });

        const res: SimulatedData = await querySmart(info.contract_addr, input);
        res.offer_amount = amount;
        return res;
      } catch (error: any) {
        console.log(error);
        return error.message;
      }
    },
    [querySmart]
  );

  const parseTokenInfo = (
    tokenInfo: TokenInfoExtend,
    addr: string,
    amount: string
  ) => {
    if (tokenInfo?.denom)
      return {
        fund: { denom: addr, amount },
        info: { native_token: { denom: addr } }
      };
    return { info: { token: { contract_addr: addr } } };
  };

  const handleSentFunds = (...funds) => {
    let sent_funds = [];
    for (let fund of funds) {
      if (fund) sent_funds.push(fund);
    }
    if (sent_funds.length === 0) return null;
    return sent_funds;
  };

  const generateContractMessages = useCallback(
    async (
      query:
        | {
            type: Type.SWAP;
            from: string;
            to: string;
            fromInfo: TokenInfoExtend;
            toInfo: TokenInfoExtend;
            amount: number | string;
            max_spread: number | string;
            belief_price: number | string;
            sender: string;
          }
        | {
            type: Type.PROVIDE;
            from: string;
            to: string;
            fromInfo: TokenInfoExtend;
            toInfo: TokenInfoExtend;
            fromAmount: number | string;
            toAmount: number | string;
            slippage: number | string;
            sender: string;
            pair: string; // oraiswap pair contract addr, handle provide liquidity
          }
        | {
            type: Type.WITHDRAW;
            lpAddr: string;
            amount: number | string;
            sender: string;
            pair: string; // oraiswap pair contract addr, handle withdraw liquidity
          }
    ) => {
      // @ts-ignore
      const {
        type,
        amount,
        sender,
        from,
        to,
        fromAmount,
        toAmount,
        lpAddr,
        fromInfo,
        toInfo,
        info,
        pair,
        ...params
      } = query;
      let sent_funds = [];
      // for withdraw & provide liquidity methods, we need to interact with the oraiswap pair contract
      let contractAddr = network.router;
      let input;
      switch (type) {
        case Type.SWAP:
          const { fund: offerSentFund, info: offerInfo } = parseTokenInfo(
            fromInfo,
            from,
            amount
          );
          const { fund: askSentFund, info: askInfo } = parseTokenInfo(
            toInfo,
            to
          );
          sent_funds = handleSentFunds(offerSentFund, askSentFund);
          input = {
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
          break;
        // TODO: provide liquidity and withdraw liquidity
        case Type.PROVIDE:
          const { fund: fromSentFund, info: fromInfoData } = parseTokenInfo(
            fromInfo,
            from,
            fromAmount
          );
          const { fund: toSentFund, info: toInfoData } = parseTokenInfo(
            toInfo,
            to,
            toAmount
          );
          sent_funds = handleSentFunds(fromSentFund, toSentFund);
          input = {
            provide_liquidity: {
              assets: [
                {
                  info: toInfoData,
                  amount: toAmount
                },
                { info: fromInfoData, amount: fromAmount }
              ]
            }
          };
          contractAddr = pair;
          break;
        case Type.WITHDRAW:
          input = {
            send: {
              owner: sender,
              contract: pair,
              amount,
              msg: 'eyJ3aXRoZHJhd19saXF1aWRpdHkiOnt9fQ==' // withdraw liquidity msg in base64
            }
          };
          contractAddr = lpAddr;
          break;
        default:
          break;
      }

      console.log('input: ', input);
      console.log('sent funds: ', sent_funds);
      console.log('contract addr: ', contractAddr);

      const msgs = [
        {
          contract: contractAddr,
          msg: Buffer.from(JSON.stringify(input)),
          sender,
          sent_funds
        }
      ];

      return msgs;
    },
    []
  );

  // useTax
  const loadTaxInfo = useCallback(async (denom: string) => {
    if (!denom) {
      return '';
    }

    let taxCap = '';
    try {
      const params = {
        treasury: {
          tax_cap: { denom: denom.match(/^orai\w+/) ? getSymbol(denom) : denom }
        }
      };

      // check denom
      if (params.treasury.tax_cap.denom) {
        const res: TaxCapResponse = await querySmart(network.oracle, params);
        taxCap = res.cap;
      }
    } catch (error) {
      console.log(error);
    }

    return taxCap;
  }, []);

  const loadTaxRate = useCallback(async () => {
    const res: TaxRateResponse = await querySmart(
      network.oracle,
      '{"treasury":{"tax_rate":{}}}'
    );
    return res.rate;
  }, []);

  return {
    loadDenomBalance,
    loadContractBalance,
    loadGasPrice,
    loadPairs,
    loadSwappableTokenAddresses,
    loadTokenInfo,
    loadPool,
    querySimulate,
    generateContractMessages,
    loadTaxInfo,
    loadTaxRate
  };
};
