// @ts-nocheck

import { Dictionary } from 'ramda';

import { ORAI } from 'constants/constants';
import { sum } from 'libs/math';

import usePairPool from 'queries/usePairPool';
import useOraclePrice from 'queries/useOraclePrice';

import usePairConfig from 'queries/usePairConfig';
import useMintInfo from 'queries/useMintInfo';
import useLpTokenInfo from 'queries/useLpTokenInfo';

import useBankBalances from 'queries/useBankBalances';
import useMintPositions from 'queries/useMintPositions';

import useTokenBalance from 'queries/useTokenBalance';
import useLpTokenBalance from 'queries/useLpTokenBalance';
import useStakingReward from 'queries/useStakingReward';
import useStakingPool from 'queries/useStakingPool';
import useGovStake from 'queries/useGovStake';

import useNormalize from './useNormalize';

import createContext from './createContext';
import { useContractsAddress } from './useContractsAddress';
import { PriceKey, AssetInfoKey } from './contractKeys';
import { BalanceKey, AccountInfoKey } from './contractKeys';

export type DictionaryKey = PriceKey | BalanceKey | AssetInfoKey;
export type DataKey = PriceKey | BalanceKey | AssetInfoKey | AccountInfoKey;

interface Data extends Record<DictionaryKey, Dictionary<string> | undefined> {
  [AccountInfoKey.ORAI]: string;
  [AccountInfoKey.MINTPOSITIONS]?: MintPosition[];
}

interface Helpers {
  /** Find the value of the symbol in the data of the given key */
  find: (key: DictionaryKey, symbol: string) => string;
  /** Sum */
  rewards: string;
}

type Result = Record<DataKey, any>;
type Parsed = Record<PriceKey | BalanceKey, any>;

interface Contract extends Data, Helpers {
  result: Result;
  parsed: Parsed;
}

const contract = createContext<Contract>('useContract');
export const [useContract, ContractProvider] = contract;

/* state */
export const useContractState = (address: string): Contract => {
  const { getListedItem } = useContractsAddress();

  /* price */
  const pairPool = usePairPool();
  const oraclePrices = useOraclePrice();

  /* contract info */
  const pairConfig = usePairConfig();
  const mintInfo = useMintInfo();
  const lpTokenInfo = useLpTokenInfo();

  /* balance */
  const tokenBalance = useTokenBalance(address);
  const lpTokenBalance = useLpTokenBalance(address);
  const stakingReward = useStakingReward(address);
  const govStake = useGovStake(address);
  const stakingPool = useStakingPool();

  /* account info */
  const bankBalance = useBankBalances(address);
  const mintPositions = useMintPositions(address);

  /* result */
  const result: Result = {
    [PriceKey.PAIR]: pairPool.result,
    [PriceKey.ORACLE]: oraclePrices.result,

    [AssetInfoKey.COMMISSION]: pairConfig.result,
    [AssetInfoKey.LIQUIDITY]: pairPool.result,
    [AssetInfoKey.MINCOLLATERALRATIO]: mintInfo.result,
    [AssetInfoKey.LPTOTALSTAKED]: stakingPool.result,
    [AssetInfoKey.LPTOTALSUPPLY]: lpTokenInfo.result,

    [BalanceKey.TOKEN]: tokenBalance.result,
    [BalanceKey.LPTOTAL]: lpTokenBalance.result, // with LPSTAKED
    [BalanceKey.LPSTAKABLE]: lpTokenBalance.result,
    [BalanceKey.LPSTAKED]: stakingReward.result,
    [BalanceKey.MIRGOVSTAKED]: govStake.result,
    [BalanceKey.REWARD]: stakingPool.result, // with LPSTAKE

    [AccountInfoKey.ORAI]: bankBalance,
    [AccountInfoKey.MINTPOSITIONS]: mintPositions.result
  };

  /* parsed */
  const parsed = {
    [PriceKey.PAIR]: pairPool.parsed,
    [PriceKey.ORACLE]: oraclePrices.parsed,

    [BalanceKey.TOKEN]: tokenBalance.parsed,
    [BalanceKey.LPTOTAL]: lpTokenBalance.parsed,
    [BalanceKey.LPSTAKABLE]: lpTokenBalance.parsed,
    [BalanceKey.LPSTAKED]: stakingReward.parsed,
    [BalanceKey.MIRGOVSTAKED]: govStake.parsed,
    [BalanceKey.REWARD]: stakingPool.parsed
  };

  /* Dictionary<string> */
  const { price, contractInfo, balance, accountInfo } = useNormalize();
  const dictionary = {
    [PriceKey.PAIR]: pairPool.parsed && price[PriceKey.PAIR](pairPool.parsed),
    [PriceKey.ORACLE]:
      oraclePrices.parsed && price[PriceKey.ORACLE](oraclePrices.parsed),

    [AssetInfoKey.COMMISSION]:
      pairConfig.parsed &&
      contractInfo[AssetInfoKey.COMMISSION](pairConfig.parsed),
    [AssetInfoKey.LIQUIDITY]:
      pairPool.parsed && contractInfo[AssetInfoKey.LIQUIDITY](pairPool.parsed),
    [AssetInfoKey.MINCOLLATERALRATIO]:
      mintInfo.parsed &&
      contractInfo[AssetInfoKey.MINCOLLATERALRATIO](mintInfo.parsed),
    [AssetInfoKey.LPTOTALSTAKED]:
      stakingPool.parsed &&
      contractInfo[AssetInfoKey.LPTOTALSTAKED](stakingPool.parsed),
    [AssetInfoKey.LPTOTALSUPPLY]:
      lpTokenInfo.parsed &&
      contractInfo[AssetInfoKey.LPTOTALSUPPLY](lpTokenInfo.parsed),

    [BalanceKey.TOKEN]:
      tokenBalance.parsed && balance[BalanceKey.TOKEN](tokenBalance.parsed),
    [BalanceKey.LPTOTAL]:
      lpTokenBalance.parsed &&
      stakingReward.parsed &&
      balance[BalanceKey.LPTOTAL](lpTokenBalance.parsed, stakingReward.parsed),
    [BalanceKey.LPSTAKABLE]:
      lpTokenBalance.parsed &&
      balance[BalanceKey.LPSTAKABLE](lpTokenBalance.parsed),
    [BalanceKey.LPSTAKED]:
      stakingReward.parsed &&
      balance[BalanceKey.LPSTAKED](stakingReward.parsed),
    [BalanceKey.MIRGOVSTAKED]:
      govStake.parsed && balance[BalanceKey.MIRGOVSTAKED](govStake.parsed),
    [BalanceKey.REWARD]:
      stakingPool.parsed &&
      stakingReward.parsed &&
      balance[BalanceKey.REWARD](stakingPool.parsed, stakingReward.parsed)
  };

  const data = {
    ...dictionary,
    [AccountInfoKey.ORAI]:
      bankBalance.data && accountInfo[AccountInfoKey.ORAI](bankBalance.data),
    [AccountInfoKey.MINTPOSITIONS]:
      mintPositions.parsed &&
      accountInfo[AccountInfoKey.MINTPOSITIONS](mintPositions.parsed)
  };

  /* utils */
  const find: Contract['find'] = (key, value) => {
    const { token } = getListedItem(value);
    const result = dictionary[key]?.[token];

    const ORAIPrice = '1';
    const isORAIPrice =
      value === ORAI && Object.values<string>(PriceKey).includes(key);

    const ORAIBalance = data[AccountInfoKey.ORAI];
    const isORAIBalance =
      value === ORAI && Object.values<string>(BalanceKey).includes(key);

    return (
      result ?? (isORAIPrice ? ORAIPrice : isORAIBalance ? ORAIBalance : '0')
    );
  };

  const rewards = sum(Object.values(dictionary[BalanceKey.REWARD] ?? {}));
  return { result, parsed, ...data, find, rewards };
};

/*
Terra Mantle returns the stringified JSON for the WasmContract query.
Therefore, it is necessary to parse them again and then convert them according to the format.
As a result, `data` value as a GraphQL result cannot be used as it is.
Eventually, GraphQL results are collected and provided as an object called `result`.
Developers should take out `data` according to `result`.
*/

export const useResult = () => {
  const { result } = useContract();
  return result;
};
