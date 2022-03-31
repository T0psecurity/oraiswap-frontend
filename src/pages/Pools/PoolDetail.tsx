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
  fetchExchangeRate,
  fetchPairInfo,
  fetchPool,
  fetchPoolInfoAmount,
  fetchTaxRate,
  fetchTokenInfo,
  generateContractMessages,
  simulateSwap,
  fetchPoolMiningInfo,
  fetchRewardMiningInfo,
  generateMiningMsgs,
  Type
} from 'rest/api';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import { filteredTokens, TokenItemType } from 'constants/bridgeTokens';
import { getUsd, parseAmount } from 'libs/utils';
import useLocalStorage from 'libs/useLocalStorage';
import { useQuery } from 'react-query';
import TokenBalance from 'components/TokenBalance';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import CosmJs from 'libs/cosmjs';
import { ORAI } from 'constants/constants';
import { network } from 'constants/networks';
import Loader from 'components/Loader';
import { TokenInfo } from '@saberhq/token-utils';

const cx = cn.bind(styles);

interface PoolDetailProps {}

const PoolDetail: React.FC<PoolDetailProps> = () => {
  let { poolUrl } = useParams();
  let pair;

  const [isOpenLiquidityModal, setIsOpenLiquidityModal] = useState(false);
  const [isOpenBondingModal, setIsOpenBondingModal] = useState(false);
  const [address] = useLocalStorage<string>('address');
  const [assetToken, setAssetToken] = useState<any>();
  const [bondingTxHash, setBondingTxHash] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
    ['token-balance', pairInfoData, bondingTxHash],
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

  const { data: rewardMiningInfoData } = useQuery(
    ['reward-info', address, bondingTxHash, pairInfoData],
    async () => {
      const token = pairInfoData?.asset_infos[1];
      let t = await fetchRewardMiningInfo(address, token!);
      // console.log(t);

      return t;
    },
    { enabled: !!address, refetchOnWindowFocus: false }
  );

  // const { data: poolMiningInfoData } = useQuery(
  //   ['pool-mining-info', address, pairInfoData],
  //   async () => {
  //     if (!!pairInfoData?.token1.contract_addr) {
  //       setAssetToken(pairInfoData.token1);
  //       // @ts-ignore
  //       let t = await fetchPoolMiningInfo(pairInfoData.token1);
  //       return t;
  //     } else if (!!pairInfoData?.token2.contract_addr) {
  //       setAssetToken(pairInfoData.token2);
  //       // @ts-ignore
  //       let t = await fetchPoolMiningInfo(pairInfoData.token2);
  //       return t;
  //     }

  //     return undefined;
  //   },
  //   { enabled: !!address && !!pairInfoData, refetchOnWindowFocus: false }
  // );

  useEffect(() => {
    if (pairInfoData?.token1.name === 'orai') {
      setAssetToken(pairInfoData.token1);
    } else if (!!pairInfoData) {
      setAssetToken(pairInfoData.token2);
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

  const handleUnbond = async () => {
    setActionLoading(true);
    displayToast(TToastType.TX_BROADCASTING);
    try {
      let walletAddr;
      if (await window.Keplr.getKeplr())
        walletAddr = await window.Keplr.getKeplrAddr();
      else throw 'You have to install Keplr wallet to swap';

      const msgs = await generateMiningMsgs({
        type: Type.WITHDRAW_LIQUIDITY_MINING,
        sender: `${walletAddr}`
      });

      const msg = msgs[0];

      // console.log(
      //   'msgs: ',
      //   msgs.map((msg) => ({ ...msg, msg: Buffer.from(msg.msg).toString() }))
      // );

      const result = await CosmJs.execute({
        address: msg.contract,
        walletAddr: walletAddr! as string,
        handleMsg: Buffer.from(msg.msg.toString()).toString(),
        gasAmount: { denom: ORAI, amount: '0' },
        // @ts-ignore
        handleOptions: { funds: msg.sent_funds }
      });
      console.log('result provide tx hash: ', result);

      if (result) {
        console.log('in correct result');
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `${network.explorer}/txs/${result.transactionHash}`
        });
        setActionLoading(false);
        setBondingTxHash(result.transactionHash);
        return;
      }
    } catch (error) {
      console.log('error in bond form: ', error);
      let finalError = '';
      if (typeof error === 'string' || error instanceof String) {
        finalError = error as string;
      } else finalError = String(error);
      displayToast(TToastType.TX_FAILED, {
        message: finalError
      });
    }
    setActionLoading(false);
  };

  const rewardInfoFirst = rewardMiningInfoData?.reward_infos[0];

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
                  pairInfoData.token2!.name
                } ≈ ${+(+pairAmountInfoData?.ratio).toFixed(2)} ${
                  pairInfoData.token1!.name
                }`}</div>
              )}
              {/* <div className={cx('btn', 'swap')}>Quick Swap</div> */}
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

              <div
                className={cx('row')}
                style={{ marginBottom: '30px', marginTop: '40px' }}
              >
                <>
                  <div className={cx('mining')}>
                    <div className={cx('label--bold')}>Liquidity Mining</div>
                    <div className={cx('label--sub')}>
                      Bond liquidity to earn ORAI liquidity reward and swap fees
                    </div>
                  </div>
                  <div className={cx('earning')}>
                    <Button
                      className={cx('btn')}
                      onClick={() => setIsOpenBondingModal(true)}
                    >
                      Start Earning
                    </Button>
                  </div>
                </>
              </div>
              <div className={cx('row')}>
                <>
                  <div className={cx('mining')}>
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
                        <div>
                          <TokenBalance
                            balance={{
                              amount: rewardInfoFirst
                                ? rewardInfoFirst.bond_amount ?? 0
                                : 0,
                              denom: `${lpTokenInfoData?.symbol}`
                            }}
                            className={cx('amount')}
                            decimalScale={6}
                          />
                          <div>
                            {!!pairAmountInfoData && !!lpTokenInfoData && (
                              <TokenBalance
                                balance={
                                  (rewardInfoFirst
                                    ? rewardInfoFirst.bond_amount *
                                      pairAmountInfoData.usdAmount
                                    : 0) / +lpTokenInfoData.total_supply
                                }
                                className={cx('amount-usd')}
                                decimalScale={2}
                              />
                            )}
                          </div>
                        </div>
                        <Divider
                          dashed
                          style={{
                            background: '#2D2938',
                            width: '100%',
                            height: '1px'
                            // margin: '16px 0'
                          }}
                        />
                        <div className={cx('bonded-apr')}>
                          <div className={cx('bonded-name')}>Current APR</div>
                          <div className={cx('bonded-value')}>ORAIX Bonus</div>
                        </div>
                        {/* <div className={cx('bonded-unbouding')}>
                          <div className={cx('bonded-name')}>
                            Unbonding Duration
                          </div>
                          <div className={cx('bonded-value')}>7 days</div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                  <div className={cx('earning')}>
                    <div className={cx('container', 'container_earning')}>
                      <div className={cx('label')}>Earnings</div>
                      {/* <>
                        <div className={cx('amount')}>0 ORAI</div>
                        <div className={cx('amount-usd')}>$0</div>
                      </> */}
                      <>
                        <div className={cx('amount')}>
                          {rewardInfoFirst && (
                            <TokenBalance
                              balance={{
                                amount: rewardInfoFirst.pending_reward,
                                denom: 'ORAIX',
                                decimals: 6
                              }}
                              decimalScale={6}
                            />
                          )}
                        </div>
                        {/* <div className={cx('amount-usd')}>$0</div> */}
                      </>
                      <Button
                        className={cx('btn', 'btn--dark')}
                        onClick={handleUnbond}
                        disabled={actionLoading}
                      >
                        {actionLoading && <Loader width={20} height={20} />}
                        <span>Unbond All</span>
                      </Button>
                    </div>
                  </div>
                </>
              </div>
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
              lpTokenInfoData={lpTokenInfoData}
              lpTokenBalance={lpTokenBalance}
              liquidityValue={liquidity1Usd + liquidity2Usd}
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
