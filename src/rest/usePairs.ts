//@ts-nocheck

import { useCallback, useEffect, useState } from 'react';
import useAPI from './useAPI';
import { AIRI, ORAI, UAIRI } from 'constants/constants';
import { network } from 'constants/networks';

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
  decimals: number;
  icon: string;
  verified: boolean;
}

interface PairsResponse {
  height: string;
  result: PairsResult;
}

interface PairsResult {
  pairs: PairResult[];
}

interface PairResult {
  liquidity_token: string;
  contract_addr: string;
  oracle_addr: string;
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

export let tokenInfos: Map<string, TokenInfo> = new Map<string, TokenInfo>([
  [
    ORAI,
    {
      contract_addr: ORAI,
      symbol: ORAI,
      name: ORAI,
      decimals: 6,
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png',
      verified: true
    }
  ]
]);

export let lpTokenInfos: Map<string, TokenInfo[]> = new Map<
  string,
  TokenInfo[]
>();

export let InitLP = '';

export default () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Pairs>({ pairs: [] });
  const { loadPairs, loadTokenInfo } = useAPI();

  const getTokenInfo = useCallback(
    async (info: NativeInfo | AssetInfo) => {
      let tokenInfo: TokenInfo | undefined;
      if (isAssetInfo(info)) {
        tokenInfo = tokenInfos.get(info.token.contract_addr);
        if (!tokenInfo) {
          const tokenResult: TokenResult | undefined = await loadTokenInfo(
            info.token.contract_addr
          );
          tokenInfo = {
            symbol: '',
            name: '',
            contract_addr: info.token.contract_addr,
            decimals: 6,
            icon: '',
            verified: false
          };
          if (tokenResult) {
            tokenInfo = {
              symbol: tokenResult.symbol,
              name: tokenResult.name,
              contract_addr: info.token.contract_addr,
              decimals: tokenResult.decimals,
              icon: tokenResult.icon,
              verified: tokenResult.verified
            };
          }
          tokenInfos.set(info.token.contract_addr, tokenInfo);
        }
      } else if (isNativeInfo(info)) {
        tokenInfo = tokenInfos.get(info.native_token.denom);
      }

      return tokenInfo;
    },
    [loadTokenInfo]
  );

  useEffect(() => {
    try {
      if (isLoading || result?.pairs.length > 0) {
        return;
      }
      setIsLoading(true);

      const fetchTokensInfo = async () => {
        try {
          network.tokens.forEach((tokenInfo: TokenResult) => {
            tokenInfos.set(tokenInfo.contract_addr, tokenInfo);
          });
        } catch (error) {
          console.log(error);
        }

        network.tokens.forEach((token) => {
          if (
            token !== undefined &&
            token.symbol &&
            !tokenInfos.has(token.contract_addr)
          ) {
            tokenInfos.set(token.contract_addr, {
              contract_addr: token.contract_addr,
              symbol: token.symbol,
              name: token.name,
              decimals: token.decimals ? token.decimals : 6,
              icon: '',
              verified: false
            });
          }
        });
      };

      const fetchPairs = async () => {
        const res: PairsResult = await loadPairs();
        const pairs = await Promise.all(
          res.pairs.map(async (pairResult: PairResult) => {
            try {
              const tokenInfo1 = await getTokenInfo(pairResult.asset_infos[0]);
              const tokenInfo2 = await getTokenInfo(pairResult.asset_infos[1]);
              if (tokenInfo1 === undefined || tokenInfo2 === undefined) {
                return;
              }

              const lpTokenInfo = await getTokenInfo({
                token: { contract_addr: pairResult.liquidity_token }
              });

              lpTokenInfos.set(pairResult.liquidity_token, [
                tokenInfo1,
                tokenInfo2
              ]);
              if (
                (tokenInfo1.symbol === ORAI && tokenInfo2.symbol === ORAI) ||
                (tokenInfo1.symbol === ORAI && tokenInfo2.symbol === ORAI)
              ) {
                InitLP = pairResult.liquidity_token;
              }

              lpTokenInfo &&
                tokenInfos.set(pairResult.liquidity_token, {
                  contract_addr: pairResult.liquidity_token,
                  name: lpTokenInfo.name,
                  symbol: lpTokenInfo.symbol,
                  decimals: lpTokenInfo.decimals,
                  icon: '',
                  verified: false
                });

              let pair: Pair = {
                contract: pairResult.contract_addr,
                pair: [tokenInfo1, tokenInfo2],
                liquidity_token: pairResult.liquidity_token
              };

              return pair;
            } catch (error) {
              console.log(error);
            }
            return undefined;
          })
        );

        if (pairs) {
          setResult({
            pairs: pairs.filter((pair) => !!pair) as Pair[]
          });
          setIsLoading(false);
        }
      };

      fetchTokensInfo().then(() => fetchPairs());
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [getTokenInfo, loadPairs, result]);

  return { ...result, isLoading };
};

export function isAssetInfo(object: any): object is AssetInfo {
  return 'token' in object;
}

export function isNativeInfo(object: any): object is NativeInfo {
  return 'native_token' in object;
}
