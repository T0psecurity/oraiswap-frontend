//@ts-nocheck

import { useCallback } from 'react';
import useURL from 'hooks/useQuerySmart';
import oraiswapConfig from 'constants/oraiswap.json';
import axios from './request';
import { Type } from 'pages/Swap';
import { AxiosError } from 'axios';
import { network } from 'constants/networks';
import { UAIRI } from 'constants/constants';
import useQuerySmart from 'hooks/useQuerySmart';
import useLocalStorage from 'libs/useLocalStorage';
interface DenomBalanceResponse {
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

interface SimulatedData {
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

  const loadSwappableTokenAddresses = useCallback(async (from: string) => {
    const res: string[] = (
      await axios.get(`${process.env.REACT_APP_LCD}/tokens/swap`, {
        params: { from }
      })
    ).data;
    return res;
  }, []);

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
    async (variables: { contract: string; msg: any }) => {
      try {
        const { contract, msg } = variables;
        const res: SimulatedData = await querySmart(contract, msg);
        return res;
      } catch (error) {
        const { response }: AxiosError = error;
        return response?.data;
      }
    },
    [querySmart]
  );

  const generateContractMessages = useCallback(
    async (
      query:
        | {
            type: Type.SWAP;
            from: string;
            to: string;
            amount: number | string;
            max_spread: number | string;
            belief_price: number | string;
            sender: string;
          }
        | {
            type: Type.PROVIDE;
            from: string;
            to: string;
            fromAmount: number | string;
            toAmount: number | string;
            slippage: number | string;
            sender: string;
          }
        | {
            type: Type.WITHDRAW;
            lpAddr: string;
            amount: number | string;
            sender: string;
          }
    ) => {
      const { type, ...params } = query;
      const url = `${process.env.REACT_APP_LCD}/tx/${type}`.toLowerCase();
      const res = (await axios.get(url, { params })).data;
      return res.map((data: Msg.Amino | Msg.Amino[]) => {
        return (Array.isArray(data) ? data : [data]).map((item: Msg.Amino) => {
          return Msg.fromAmino(item);
        });
      });
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
      const res: TaxCapResponse = await querySmart(
        network.oracle,
        `{"treasury":{"tax_cap":{"denom":"${denom}"}}}`
      );
      taxCap = res.cap;
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
