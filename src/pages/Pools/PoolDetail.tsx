import React, { FC, memo, useState } from 'react';
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
  fetchExchangeRate,
  fetchPairInfo,
  fetchPool,
  fetchPoolInfoAmount,
  fetchTaxRate,
  fetchTokenInfo,
  generateContractMessages,
  simulateSwap,
} from 'rest/api';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import { filteredTokens, TokenItemType } from 'constants/bridgeTokens';
import { getUsd } from 'libs/utils';
import useLocalStorage from 'libs/useLocalStorage';
import { useQuery } from 'react-query';
import TokenBalance from 'components/TokenBalance';

const cx = cn.bind(styles);

const mockPair = {
  'ORAI-AIRI': {
    contractAddress: 'orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v',
    amount1: 100,
    amount2: 1000,
  },
  'AIRI-ATOM': {
    contractAddress: 'orai16wvac5gxlxqtrhhcsa608zh5uh2zltuzjyhmwh',
    amount1: 100,
    amount2: 1000,
  },
  'ORAI-TEST2': {
    contractAddress: 'orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v',
    amount1: 100,
    amount2: 1000,
  },
  'AIRI-TEST2': {
    contractAddress: 'orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v',
    amount1: 100,
    amount2: 1000,
  },
  'ATOM-ORAI': {
    contractAddress: 'orai16wvac5gxlxqtrhhcsa608zh5uh2zltuzjyhmwh',
    amount1: 100,
    amount2: 1000,
  },
};

interface PoolDetailProps {}

const PoolDetail: React.FC<PoolDetailProps> = () => {
  let { poolUrl } = useParams();
  let pair,
    token1: TokenItemType | undefined,
    token2: TokenItemType | undefined;

  const [isOpenLiquidityModal, setIsOpenLiquidityModal] = useState(false);
  const [isOpenBondingModal, setIsOpenBondingModal] = useState(false);

  const allToken = Object.values(mockToken).map((token) => {
    return {
      ...token,
      title: token.name,
    };
  });

  const [address] = useLocalStorage<string>('address');

  const { prices } = useCoinGeckoPrices(
    filteredTokens.map((t) => t.coingeckoId)
  );

  type PriceKey = keyof typeof prices;

  const getPairInfo = async () => {
    const pairKey = Object.keys(PairKey).find((k) => {
      let [_token1, _token2] = poolUrl?.toUpperCase().split('-') ?? [
        undefined,
        undefined,
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
        contract_addr: mockToken[pair.asset_denoms[0]].contractAddress,
      },
      token2 = {
        ...mockToken[pair.asset_denoms[1]],
        contract_addr: mockToken[pair.asset_denoms[1]].contractAddress,
      };

    // Token1Icon = token1.Icon;
    // Token2Icon = token2.Icon;

    const pairInfo = await fetchPairInfo([
      // @ts-ignore
      token1,
      // @ts-ignore
      token2,
    ]);

    return {
      ...pairInfo,
      token1,
      token2,
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
      ratio: poolData.offerPoolAmount / poolData.askPoolAmount,
    };
  };

  const {
    data: pairInfoData,
    error: pairInfoError,
    isError: isPairInfoError,
    isLoading: isPairInfoLoading,
  } = useQuery(['pair-info', poolUrl], () => getPairInfo(), {
    // enabled: !!token1! && !!token2!,
    refetchOnWindowFocus: false,
  });

  let {
    data: pairAmountInfoData,
    error: pairAmountInfoError,
    isError: isPairAmountInfoError,
    isLoading: isPairAmountInfoLoading,
  } = useQuery(
    ['pair-amount-info', pairInfoData, prices],
    () => {
      console.log('t');

      return getPairAmountInfo();
    },
    {
      enabled: !!prices && !!pairInfoData,
      refetchOnWindowFocus: false,
      // refetchInterval: 10000,
    }
  );

  const {
    data: lpTokenBalance,
    error: lpTokenBalanceError,
    isError: isLpTokenBalanceError,
    isLoading: isLpTokenBalanceLoading,
  } = useQuery(
    ['token-balance', pairInfoData],
    () => fetchBalance(address, '', pairInfoData?.liquidity_token),
    {
      enabled: !!address && !!pairInfoData,
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: lpTokenInfoData,
    error: lpTokenInfoError,
    isError: isLpTokenInfoError,
    isLoading: isLpTokenInfoLoading,
  } = useQuery(
    ['token-info', pairInfoData],
    () => {
      // @ts-ignore
      return fetchTokenInfo({
        contractAddress: pairInfoData?.liquidity_token,
      });
    },
    {
      enabled: !!pairInfoData,
      refetchOnWindowFocus: false,
    }
  );

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
                <div className={cx('des')}>{`1 ${
                  pairInfoData.token1!.name
                } ≈ ${+(+pairAmountInfoData?.ratio).toFixed(2)} ${
                  pairInfoData.token2!.name
                }`}</div>
              )}
              <div className={cx('btn', 'swap')}>Quick Swap</div>
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
                              amount: lpTokenBalance,
                              denom: `${lpTokenInfoData?.symbol}`,
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
                              denom: '',
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
                              denom: '',
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
                    <div className={cx('label')}>Pool Catalyst</div>
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
                              denom: '',
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
                              denom: '',
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

              {/* <div className={cx('row')}>
                <div className={cx('mining')}>
                  <div className={cx('label--bold')}>Liquidity Mining</div>
                  <div className={cx('label--sub')}>
                    Bond liquidity to earn ORAI liquidity reward and swap fees
                  </div>
                  <div className={cx('container', 'container_mining')}>
                    <img
                      className={cx('icon')}
                      src={
                        require('assets/images/Liquidity_mining_illus.png')
                          .default
                      }
                    />
                    <div className={cx('bonded')}>
                      <div className={cx('label')}>Bonded</div>
                      <div className={cx('amount')}>2.35 GAMM-1</div>
                      <div className={cx('amount-usd')}>$1,948.80</div>
                      <Divider
                        dashed
                        style={{
                          background: '#2D2938',
                          width: '100%',
                          height: '1px',
                          margin: '16px 0',
                        }}
                      />
                      <div className={cx('bonded-apr')}>
                        <div className={cx('bonded-name')}>Current APR</div>
                        <div className={cx('bonded-value')}>63.08%</div>
                      </div>
                      <div className={cx('bonded-unbouding')}>
                        <div className={cx('bonded-name')}>
                          Unbonding Duration
                        </div>
                        <div className={cx('bonded-value')}>7 days</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={cx('earning')}>
                  <Button className={cx('btn')}>Start Earning</Button>
                  <div className={cx('container', 'container_earning')}>
                    <div className={cx('label')}>Earnings</div>
                    <div className={cx('amount')}>0 ORAI</div>
                    <div className={cx('amount-usd')}>$0</div>
                    <Button
                      className={cx('btn', 'btn--dark')}
                      onClick={() => setIsOpenBondingModal(true)}
                    >
                      Unbond All
                    </Button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
          {isOpenLiquidityModal && (
            <LiquidityModal
              isOpen={isOpenLiquidityModal}
              open={() => setIsOpenLiquidityModal(true)}
              close={() => setIsOpenLiquidityModal(false)}
              token1InfoData={pairInfoData.token1}
              token2InfoData={pairInfoData.token2}
            />
          )}
          {isOpenBondingModal && (
            <BondingModal
              isOpen={isOpenBondingModal}
              open={() => setIsOpenBondingModal(true)}
              close={() => setIsOpenBondingModal(false)}
              token1={'ORAI'}
              token2={'ATOM'}
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
