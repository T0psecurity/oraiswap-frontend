import React, { FC, memo, useEffect, useState } from 'react';
import { Button, Divider, Input } from 'antd';
import styles from './PoolDetail.module.scss';
import cn from 'classnames/bind';
import { useParams } from 'react-router-dom';
import LiquidityModal from './LiquidityModal/LiquidityModal';
import BondingModal from './BondingModal/BondingModal';
import Content from 'layouts/Content';
import Pie from 'components/Pie';
import { mockToken, PairKey, pairsMap, TokensSwap } from 'constants/pools';
import {
  fetchBalance,
  fetchPairInfo,
  fetchPoolInfoAmount,
  fetchTokenInfo,
  fetchRewardInfo,
  fetchRewardPerSecInfo,
  fetchStakingPoolInfo,
  fetchDistributionInfo
} from 'rest/api';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import { filteredTokens, TokenItemType, tokens } from 'constants/bridgeTokens';
import { getUsd, parseAmount } from 'libs/utils';
import useLocalStorage from 'libs/useLocalStorage';
import { useQuery } from 'react-query';
import TokenBalance from 'components/TokenBalance';
import UnbondModal from './UnbondModal/UnbondModal';
import LiquidityMining from './LiquidityMining/LiquidityMining';

const cx = cn.bind(styles);

interface PoolDetailProps {}

filteredTokens.push({
  name: 'ORAIX',
  org: 'Oraichain',
  prefix: 'orai',
  coinType: 118,
  denom: 'oraix',
  contractAddress: process.env.REACT_APP_ORAIX_CONTRACT,
  // coingeckoId: 'oraichain-token',
  decimals: 6,
  chainId: 'Oraichain',
  rpc: 'https://rpc.orai.io',
  lcd: 'https://lcd.orai.io'
  // cosmosBased: true,
  // Icon: ORAI
} as TokenItemType);

const PoolDetail: React.FC<PoolDetailProps> = () => {
  let { poolUrl } = useParams();
  let pair;

  const [isOpenLiquidityModal, setIsOpenLiquidityModal] = useState(false);
  const [isOpenBondingModal, setIsOpenBondingModal] = useState(false);
  const [isOpenUnbondModal, setIsOpenUnbondModal] = useState(false);
  const [address] = useLocalStorage<string>('address');
  const [assetToken, setAssetToken] = useState<any>();
  const [bondingTxHash, setBondingTxHash] = useState('');
  const [liquidityTxHash, setLiquidityTxHash] = useState('');
  const [withdrawTxHash, setWithdrawTxHash] = useState('');

  const { prices } = useCoinGeckoPrices(
    filteredTokens.map((t) => t.coingeckoId)
  );

  const getPairInfo = async () => {
    const pairKey = Object.keys(PairKey).find((k) => {
      let [_token1, _token2] = poolUrl?.toUpperCase().split('-') ?? [
        undefined,
        undefined
      ];
      return (
        !!_token1 && !!_token2 && k.includes(_token1) && k.includes(_token2)
      );
    });
    const t = PairKey[pairKey! as keyof typeof PairKey];

    pair = pairsMap[t];
    if (!pair) return;
    let token1 = {
        ...mockToken[pair.asset_denoms[0]],
        contract_addr: mockToken[pair.asset_denoms[0]].contractAddress
      },
      token2 = {
        ...mockToken[pair.asset_denoms[1]],
        contract_addr: mockToken[pair.asset_denoms[1]].contractAddress
      };

    // Token1Icon = token1.Icon;
    // Token2Icon = token2.Icon;

    const pairInfo = await fetchPairInfo([
      // @ts-ignore
      token1,
      // @ts-ignore
      token2
    ]);

    return {
      ...pairInfo,
      token1,
      token2
    };
  };

  const getPairAmountInfo = async () => {
    const token1 = pairInfoData?.token1,
      token2 = pairInfoData?.token2;

    const poolData = await fetchPoolInfoAmount(
      // @ts-ignore
      token1!,
      token2!
    );

    const fromAmount = getUsd(
      poolData.offerPoolAmount,
      prices[token1!.coingeckoId].price,
      token1!.decimals
    );
    const toAmount = getUsd(
      poolData.askPoolAmount,
      prices[token2!.coingeckoId].price,
      token2!.decimals
    );

    return {
      token1Amount: poolData.offerPoolAmount,
      token2Amount: poolData.askPoolAmount,
      token1Usd: fromAmount,
      token2Usd: toAmount,
      usdAmount: fromAmount + toAmount,
      ratio: poolData.offerPoolAmount / poolData.askPoolAmount
    };
  };

  const {
    data: pairInfoData,
    error: pairInfoError,
    isError: isPairInfoError,
    isLoading: isPairInfoLoading
  } = useQuery(['pair-info', poolUrl], () => getPairInfo(), {
    // enabled: !!token1! && !!token2!,
    refetchOnWindowFocus: false
  });

  let {
    data: pairAmountInfoData,
    error: pairAmountInfoError,
    isError: isPairAmountInfoError,
    isLoading: isPairAmountInfoLoading
  } = useQuery(
    ['pair-amount-info', pairInfoData, prices],
    () => {
      return getPairAmountInfo();
    },
    {
      enabled: !!prices && !!pairInfoData,
      refetchOnWindowFocus: false
      // refetchInterval: 10000,
    }
  );

  const {
    data: lpTokenBalance,
    error: lpTokenBalanceError,
    isError: isLpTokenBalanceError,
    isLoading: isLpTokenBalanceLoading
  } = useQuery(
    [
      'token-balance',
      pairInfoData,
      bondingTxHash,
      liquidityTxHash,
      withdrawTxHash
    ],
    () => fetchBalance(address, '', pairInfoData?.liquidity_token),
    {
      enabled: !!address && !!pairInfoData,
      refetchOnWindowFocus: false
    }
  );

  const {
    data: lpTokenInfoData,
    error: lpTokenInfoError,
    isError: isLpTokenInfoError,
    isLoading: isLpTokenInfoLoading
  } = useQuery(
    ['token-info', pairInfoData],
    () => {
      // @ts-ignore
      return fetchTokenInfo({
        contractAddress: pairInfoData?.liquidity_token
      });
    },
    {
      enabled: !!pairInfoData,
      refetchOnWindowFocus: false
    }
  );

  const { data: totalRewardInfoData } = useQuery(
    [
      'reward-info',
      address,
      bondingTxHash,
      pairInfoData,
      assetToken,
      withdrawTxHash
    ],
    async () => {
      let t = await fetchRewardInfo(address, assetToken);

      return t;
    },
    { enabled: !!address && !!assetToken, refetchOnWindowFocus: false }
  );

  const { data: rewardPerSecInfoData } = useQuery(
    ['reward-per-sec-info', address, pairInfoData, assetToken],
    async () => {
      let t = await fetchRewardPerSecInfo(assetToken);

      return t.assets;
    },
    { enabled: !!address && !!assetToken, refetchOnWindowFocus: false }
  );

  const { data: stakingPoolInfoData } = useQuery(
    ['staking-pool-info', address, pairInfoData, assetToken],
    async () => {
      let t = await fetchStakingPoolInfo(assetToken);

      return t;
    },
    { enabled: !!address && !!assetToken, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (pairInfoData?.token1.name === 'ORAI') {
      setAssetToken(pairInfoData.token2);
    } else if (!!pairInfoData) {
      setAssetToken(pairInfoData.token1);
    }
  }, [pairInfoData]);

  const Token1Icon = pairInfoData?.token1.Icon,
    Token2Icon = pairInfoData?.token2.Icon;

  const lpTotalSupply = lpTokenInfoData ? +lpTokenInfoData.total_supply : 0;
  const liquidity1 =
    (lpTokenBalance * (pairAmountInfoData?.token1Amount ?? 0)) / lpTotalSupply;
  const liquidity2 =
    (lpTokenBalance * (pairAmountInfoData?.token2Amount ?? 0)) / lpTotalSupply;
  const liquidity1Usd =
    (lpTokenBalance * (pairAmountInfoData?.token1Usd ?? 0)) / lpTotalSupply;
  const liquidity2Usd =
    (lpTokenBalance * (pairAmountInfoData?.token2Usd ?? 0)) / lpTotalSupply;

  const rewardInfoFirst = !!totalRewardInfoData?.reward_infos.length
    ? totalRewardInfoData?.reward_infos[0]
    : 0;
  const bondAmountUsd = rewardInfoFirst
    ? (rewardInfoFirst.bond_amount * (pairAmountInfoData?.usdAmount ?? 0)) /
      +(lpTokenInfoData?.total_supply ?? 0)
    : 0;

  return (
    <Content nonBackground>
      {!!pairInfoData ? (
        <>
          <div className={cx('pool-detail')}>
            <div className={cx('header')}>
              <div className={cx('logo')}>
                {Token1Icon! && <Token1Icon className={cx('token1')} />}
                {Token2Icon! && <Token2Icon className={cx('token2')} />}
              </div>
              <div className={cx('title')}>
                <div className={cx('name')}>{`${pairInfoData.token1!.name}/${
                  pairInfoData.token2!.name
                }`}</div>
                <TokenBalance
                  balance={
                    pairAmountInfoData ? +pairAmountInfoData?.usdAmount : 0
                  }
                  className={cx('value')}
                  decimalScale={2}
                />
              </div>
              {!!pairAmountInfoData && (
                <div className={cx('des')}>
                  <span>{`1 ${pairInfoData.token2!.name} ≈ `}</span>
                  <span>{`${+pairAmountInfoData?.ratio.toFixed(6)} ${
                    pairInfoData.token1!.name
                  }`}</span>
                </div>
              )}
            </div>
            <div className={cx('info')}>
              {!!pairAmountInfoData && (
                <div className={cx('row')}>
                  <div className={cx('container', 'tokens')}>
                    <div className={cx('available-tokens')}>
                      <div className={cx('label')}>Available LP tokens</div>
                      <Pie percent={50}>
                        <div>
                          <TokenBalance
                            balance={{
                              amount: lpTokenBalance ?? 0,
                              denom: `${lpTokenInfoData?.symbol}`
                            }}
                            decimalScale={2}
                            className={cx('amount')}
                          />
                        </div>
                        <TokenBalance
                          balance={liquidity1Usd + liquidity2Usd}
                          decimalScale={2}
                          className={cx('amount-usd')}
                        />
                      </Pie>
                    </div>
                    <div className={cx('liquidity')}>
                      <div className={cx('label')}>My liquidity</div>
                      <div className={cx('liquidity_token')}>
                        <div className={cx('liquidity_token_name')}>
                          <span
                            className={cx('mark')}
                            style={{ background: '#FFD5AE' }}
                          ></span>
                          <span className={cx('icon')}></span>
                          <span className={cx('token-name')}>
                            {pairInfoData.token1.name}
                          </span>
                        </div>
                        <div className={cx('liquidity_token_value')}>
                          <TokenBalance
                            balance={{
                              amount: liquidity1,
                              denom: ''
                            }}
                            className={cx('amount')}
                            decimalScale={2}
                          />
                          <TokenBalance
                            balance={liquidity1Usd}
                            className={cx('amount-usd')}
                            decimalScale={2}
                          />
                        </div>
                      </div>
                      <div className={cx('liquidity_token')}>
                        <div className={cx('liquidity_token_name')}>
                          <span
                            className={cx('mark')}
                            style={{ background: '#612FCA' }}
                          ></span>
                          <span className={cx('icon')}></span>
                          <span className={cx('token-name')}>
                            {pairInfoData.token2.name}
                          </span>
                        </div>
                        <div className={cx('liquidity_token_value')}>
                          <TokenBalance
                            balance={{
                              amount: liquidity2,
                              denom: ''
                            }}
                            className={cx('amount')}
                            decimalScale={2}
                          />
                          <TokenBalance
                            balance={liquidity2Usd}
                            className={cx('amount-usd')}
                            decimalScale={2}
                          />
                        </div>
                      </div>
                      <Button
                        className={cx('btn')}
                        style={{ marginTop: 30 }}
                        onClick={() => setIsOpenLiquidityModal(true)}
                      >
                        Add/Remove Liquidity
                      </Button>
                    </div>
                  </div>

                  <div className={cx('container', 'pool-catalyst')}>
                    <div className={cx('label')}>Total liquidity</div>
                    <div className={cx('content')}>
                      <div className={cx('pool-catalyst_token')}>
                        <div className={cx('pool-catalyst_token_name')}>
                          {Token1Icon! && <Token1Icon className={cx('icon')} />}
                          <span className={cx('token-name')}>
                            {pairInfoData.token1!.name}
                          </span>
                        </div>
                        <div className={cx('pool-catalyst_token_value')}>
                          <TokenBalance
                            balance={{
                              amount: pairAmountInfoData.token1Amount,
                              denom: ''
                            }}
                            className={cx('amount')}
                            decimalScale={2}
                          />
                          <TokenBalance
                            balance={pairAmountInfoData.token1Usd}
                            className={cx('amount-usd')}
                            decimalScale={2}
                          />
                        </div>
                      </div>
                      <div className={cx('pool-catalyst_token')}>
                        <div className={cx('pool-catalyst_token_name')}>
                          {Token2Icon! && <Token2Icon className={cx('icon')} />}
                          <span className={cx('token-name')}>
                            {pairInfoData.token2.name}
                          </span>
                        </div>
                        <div className={cx('pool-catalyst_token_value')}>
                          <TokenBalance
                            balance={{
                              amount: pairAmountInfoData.token2Amount,
                              denom: ''
                            }}
                            className={cx('amount')}
                            decimalScale={2}
                          />
                          <TokenBalance
                            balance={pairAmountInfoData.token2Usd}
                            className={cx('amount-usd')}
                            decimalScale={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <LiquidityMining
                setIsOpenBondingModal={setIsOpenBondingModal}
                rewardInfoFirst={rewardInfoFirst}
                lpTokenInfoData={lpTokenInfoData}
                setIsOpenUnbondModal={setIsOpenUnbondModal}
                pairAmountInfoData={pairAmountInfoData}
                assetToken={assetToken}
                setWithdrawTxHash={setWithdrawTxHash}
                totalRewardInfoData={totalRewardInfoData}
                rewardPerSecInfoData={rewardPerSecInfoData}
                stakingPoolInfoData={stakingPoolInfoData}
              />
            </div>
          </div>
          {isOpenLiquidityModal && (
            <LiquidityModal
              isOpen={isOpenLiquidityModal}
              open={() => setIsOpenLiquidityModal(true)}
              close={() => setIsOpenLiquidityModal(false)}
              token1InfoData={pairInfoData.token1}
              token2InfoData={pairInfoData.token2}
              lpTokenInfoData={lpTokenInfoData}
              lpTokenBalance={lpTokenBalance}
              setLiquidityHash={setLiquidityTxHash}
              liquidityHash={liquidityTxHash}
            />
          )}
          {isOpenBondingModal && (
            <BondingModal
              isOpen={isOpenBondingModal}
              open={() => setIsOpenBondingModal(true)}
              close={() => setIsOpenBondingModal(false)}
              lpTokenInfoData={lpTokenInfoData}
              lpTokenBalance={lpTokenBalance}
              liquidityValue={liquidity1Usd + liquidity2Usd}
              assetToken={assetToken}
              setTxHash={setBondingTxHash}
            />
          )}
          {isOpenUnbondModal && (
            <UnbondModal
              isOpen={isOpenUnbondModal}
              open={() => setIsOpenUnbondModal(true)}
              close={() => setIsOpenUnbondModal(false)}
              bondAmount={
                rewardInfoFirst ? rewardInfoFirst.bond_amount ?? 0 : 0
              }
              bondAmountUsd={bondAmountUsd}
              lpTokenInfoData={lpTokenInfoData}
              assetToken={assetToken}
              setTxHash={setBondingTxHash}
            />
          )}
        </>
      ) : (
        <>No Pool found</>
      )}
    </Content>
  );
};

export default PoolDetail;
