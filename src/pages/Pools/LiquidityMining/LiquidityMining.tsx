import React, { FC, memo, useEffect, useState } from 'react';
import { Button, Divider, Input } from 'antd';
import styles from './LiquidityMining.module.scss';
import cn from 'classnames/bind';
import { useParams } from 'react-router-dom';
import Content from 'layouts/Content';
import Pie from 'components/Pie';
import { mockToken, PairKey, pairsMap, TokensSwap } from 'constants/pools';
import { Type, generateMiningMsgs } from 'rest/api';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import { filteredTokens, TokenItemType, tokens } from 'constants/bridgeTokens';
import { getUsd, parseAmount } from 'libs/utils';
import useLocalStorage from 'libs/useLocalStorage';
import { useQuery } from 'react-query';
import TokenBalance from 'components/TokenBalance';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import CosmJs from 'libs/cosmjs';
import { ORAI } from 'constants/constants';
import { network } from 'constants/networks';
import Loader from 'components/Loader';

const cx = cn.bind(styles);

interface LiquidityMiningProps {
  setIsOpenBondingModal: any;
  rewardInfoFirst: any;
  lpTokenInfoData: any;
  setIsOpenUnbondModal: any;
  pairAmountInfoData: any;
  assetToken: any;
  setWithdrawTxHash: any;
  totalRewardInfoData: any;
  rewardPerSecInfoData: any;
  stakingPoolInfoData: any;
  distributionInfoData: any;
}

const LiquidityMining: React.FC<LiquidityMiningProps> = ({
  setIsOpenBondingModal,
  rewardInfoFirst,
  lpTokenInfoData,
  setIsOpenUnbondModal,
  pairAmountInfoData,
  assetToken,
  setWithdrawTxHash,
  totalRewardInfoData,
  rewardPerSecInfoData,
  stakingPoolInfoData,
  distributionInfoData
}) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingRewards, setPendingRewards] = useState<[any]>();

  useEffect(() => {
    if (!!totalRewardInfoData && !!rewardPerSecInfoData) {
      let interval = setInterval(() => setNewReward(), 1000);
      return () => clearInterval(interval);
    }
  }, [
    JSON.stringify(totalRewardInfoData),
    JSON.stringify(rewardPerSecInfoData),
    JSON.stringify(stakingPoolInfoData),
    JSON.stringify(distributionInfoData)
  ]);

  const setNewReward = () => {
    let totalRewardAmount = !!totalRewardInfoData.reward_infos.length
      ? +totalRewardInfoData.reward_infos[0]?.pending_reward
      : 0;
    let bondAmount = !!totalRewardInfoData.reward_infos.length
      ? +totalRewardInfoData.reward_infos[0]?.bond_amount
      : 0;

    const totalRewardPerSec =
      rewardPerSecInfoData.length > 1
        ? rewardPerSecInfoData.reduce((a: any, b: any) => +a.amount + +b.amount)
        : +rewardPerSecInfoData[0].amount;

    if (
      !!stakingPoolInfoData?.total_bond_amount &&
      !!distributionInfoData?.last_distributed
    ) {
      const totalBond = +stakingPoolInfoData.total_bond_amount;
      const lastDistribution = distributionInfoData?.last_distributed;
      totalRewardAmount +=
        ((Date.now() / 1000 - lastDistribution) *
          (totalRewardPerSec * bondAmount)) /
        totalBond;
    }

    let res = rewardPerSecInfoData.map((r: any) => {
      const amount = (totalRewardAmount * +r.amount) / totalRewardPerSec;
      if (!!r.info.token) {
        let token = filteredTokens.find(
          (t) => t.contractAddress === r.info.token.contract_addr!
        );
        // const usdValue = getUsd(
        //   amount,
        //   prices[token!.coingeckoId].price,
        //   token!.decimals
        // );
        return {
          ...token,
          amount,
          rewardPerSec: +r.amount

          // usdValue
        };
      } else {
        let token = filteredTokens.find(
          (t) => t.denom === r.info.native_token.denom!
        );
        // const usdValue = getUsd(
        //   amount,
        //   prices[token!.coingeckoId].price,
        //   token!.decimals
        // );
        return {
          ...token,
          amount,
          rewardPerSec: +r.amount

          // usdValue
        };
      }
    });

    setPendingRewards(res);
  };

  const handleBond = async () => {
    setActionLoading(true);
    displayToast(TToastType.TX_BROADCASTING);
    try {
      let walletAddr;
      if (await window.Keplr.getKeplr())
        walletAddr = await window.Keplr.getKeplrAddr();
      else throw 'You have to install Keplr wallet to swap';

      // const msgs = await generateMiningMsgs({
      //   type: Type.BOND_LIQUIDITY,
      //   sender: `${walletAddr}`,
      //   amount: `${parsedAmount}`,
      //   lpToken: lpTokenInfoData.contract_addr,
      //   assetToken
      // });

      const msgs = await generateMiningMsgs({
        type: Type.WITHDRAW_LIQUIDITY_MINING,
        sender: `${walletAddr}`,
        assetToken: assetToken
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
        setWithdrawTxHash(result.transactionHash);
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

  return (
    <>
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
                  require('assets/images/Liquidity_mining_illus.png').default
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
              <div className={cx('label')}>Estimated Earnings</div>
              {!!pendingRewards &&
                pendingRewards.map((r: any, idx) => (
                  <div key={idx}>
                    <div className={cx('amount')}>
                      <TokenBalance
                        balance={{
                          amount: r.amount,
                          denom: r.denom.toUpperCase(),
                          decimals: 6
                        }}
                        decimalScale={6}
                      />
                    </div>
                    {/* <TokenBalance
                              balance={r.usdValue}
                              className={cx('amount-usd')}
                              decimalScale={2}
                            /> */}
                  </div>
                ))}
              <Button
                className={cx('btn')}
                onClick={() => handleBond()}
                disabled={
                  actionLoading ||
                  !+totalRewardInfoData?.reward_infos[0]?.pending_reward
                }
              >
                {actionLoading && <Loader width={20} height={20} />}
                <span>Claim Rewards</span>
              </Button>
              <Button
                className={cx('btn', 'btn--dark')}
                onClick={() => setIsOpenUnbondModal(true)}
              >
                <span>Unbond</span>
              </Button>
            </div>
          </div>
        </>
      </div>
    </>
  );
};

export default LiquidityMining;
