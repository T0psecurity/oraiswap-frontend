//@ts-nocheck
import React, { useEffect, useState } from 'react';
import style from './index.module.scss';
import cn from 'classnames/bind';
import { TooltipIcon } from 'components/Tooltip';
import SettingModal from './Modals/SettingModal';
import SelectTokenModal from './Modals/SelectTokenModal';
import { useQuery } from 'react-query';
import useGlobalState from 'hooks/useGlobalState';
import {
  fetchBalance,
  fetchExchangeRate,
  fetchTaxRate,
  fetchTokenInfo,
  generateContractMessages,
  simulateSwap
} from 'rest/api';
import CosmJs from 'libs/cosmjs';
import {
  BEP20_ORAI,
  DECIMAL_FRACTION,
  ERC20_ORAI,
  ORAI
} from 'constants/constants';
import { parseAmount, parseDisplayAmount } from 'libs/utils';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import TokenBalance from 'components/TokenBalance';
import { network } from 'constants/networks';
import NumberFormat from 'react-number-format';
import { filteredTokens, TokenItemType, tokens } from 'constants/bridgeTokens';
import { Type } from 'rest/api';
import Loader from 'components/Loader';
import Content from 'layouts/Content';
import { isMobile } from '@walletconnect/browser-utils';

const cx = cn.bind(style);

interface ValidToken {
  title: string;
  contractAddress: string;
  Icon: string;
  denom: string;
}

interface SwapProps { }

const suggestToken = async (token: TokenItemType) => {
  if (token.contractAddress) {
    const keplr = await window.Keplr.getKeplr();
    if (!keplr) {
      return displayToast(TToastType.KEPLR_FAILED, {
        message: 'You need to install Keplr to continue'
      });
    }

    if (!isMobile())
      await keplr.suggestToken(token.chainId, token.contractAddress);
  }
};

const Swap: React.FC<SwapProps> = () => {
  const allToken = filteredTokens.filter(
    (t) => t.denom !== ERC20_ORAI && t.denom !== BEP20_ORAI && t.name != 'ORAIX'
  );

  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [isSelectFrom, setIsSelectFrom] = useState(false);
  const [isSelectTo, setIsSelectTo] = useState(false);
  const [isSelectFee, setIsSelectFee] = useState(false);
  const [fromTokenDenom, setFromToken] = useState<string>('orai');
  const [toTokenDenom, setToToken] = useState<string>('airi');
  const [feeToken, setFeeToken] = useState<string>('airi');
  const [listValidTo, setListValidTo] = useState<ValidToken[]>([]);
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  // const [currentPair, setCurrentPair] = useState<PairName>("ORAI-AIRI");
  const [averageRatio, setAverageRatio] = useState(0);
  const [slippage, setSlippage] = useState(1);
  const [address, setAddress] = useGlobalState('address');
  const [swapLoading, setSwapLoading] = useState(false);
  const [txHash, setTxHash] = useState<String>();
  const [refresh, setRefresh] = useState(false);

  const onChangeFromAmount = (amount: number) => {
    setFromAmount(amount);
  };

  const onMaxFromAmount = (amount: number) => {
    let finalAmount = parseFloat(
      parseDisplayAmount(amount, fromTokenInfoData?.decimals) as string
    );
    setFromAmount(finalAmount);
  };

  // const onChangeToAmount = (amount: number) => {
  //   setToAmount(amount);
  //   setFromAmount(amount / fromToRatio);
  // };

  const { data: taxRate, isLoading: isTaxRateLoading } = useQuery(
    ['tax-rate'],
    () => fetchTaxRate()
  );

  const fromToken = filteredTokens.find(
    (token) => token.denom === fromTokenDenom
  );
  const toToken = filteredTokens.find((token) => token.denom === toTokenDenom);

  const {
    data: fromTokenInfoData,
    error: fromTokenInfoError,
    isError: isFromTokenInfoError,
    isLoading: isFromTokenInfoLoading
  } = useQuery(['from-token-info', fromToken], () =>
    fetchTokenInfo(fromToken!)
  );

  const {
    data: toTokenInfoData,
    error: toTokenInfoError,
    isError: isToTokenInfoError,
    isLoading: isToTokenInfoLoading
  } = useQuery(['to-token-info', toToken], () => fetchTokenInfo(toToken!));

  // suggest tokens
  useEffect(() => {
    if (fromToken && toToken) {
      suggestToken(fromToken);
      suggestToken(toToken);
    }
  }, [fromToken, toToken]);

  const {
    data: fromTokenBalance,
    error: fromTokenBalanceError,
    isError: isFromTokenBalanceError,
    isLoading: isFromTokenBalanceLoading
  } = useQuery(
    ['from-token-balance', fromToken, txHash],
    () =>
      fetchBalance(
        address,
        fromToken!.denom,
        fromToken!.contractAddress,
        fromToken!.lcd
      ),
    { enabled: !!address && !!fromToken }
  );

  const {
    data: toTokenBalance,
    error: toTokenBalanceError,
    isError: isToTokenBalanceError,
    isLoading: isLoadingToTokenBalance
  } = useQuery(
    ['to-token-balance', toToken, txHash],
    () =>
      fetchBalance(
        address,
        toToken!.denom,
        toToken!.contractAddress,
        toToken!.lcd
      ),
    { enabled: !!address && !!toToken }
  );

  const {
    data: exchangeRate,
    error: exchangeRateError,
    isError: isExchangeRateError,
    isLoading: isExchangeRateLoading
  } = useQuery(
    ['exchange-rate', fromTokenInfoData, toTokenInfoData],
    () => fetchExchangeRate(toTokenInfoData!.denom, fromTokenInfoData!.denom),
    { enabled: !!fromTokenInfoData && !!toTokenInfoData }
  );

  const {
    data: simulateData,
    error: simulateDataError,
    isError: isSimulateDataError,
    isLoading: isSimulateDataLoading
  } = useQuery(
    ['simulate-data', fromTokenInfoData, toTokenInfoData, fromAmount],
    () =>
      simulateSwap({
        fromInfo: fromTokenInfoData!,
        toInfo: toTokenInfoData!,
        amount: parseAmount(fromAmount, fromTokenInfoData?.decimals)
      }),
    { enabled: !!fromTokenInfoData && !!toTokenInfoData && fromAmount > 0 }
  );

  const { data: simulateAverageData, isLoading: isSimulateAverageDataLoading } =
    useQuery(
      ['simulate-average-data', fromTokenInfoData, toTokenInfoData],
      () =>
        simulateSwap({
          fromInfo: fromTokenInfoData!,
          toInfo: toTokenInfoData!,
          amount: parseAmount('1', fromTokenInfoData?.decimals)
        }),
      { enabled: !!fromTokenInfoData && !!toTokenInfoData }
    );

  useEffect(() => {
    console.log('simulate average data: ', simulateAverageData);
    setAverageRatio(
      parseFloat(
        parseDisplayAmount(
          simulateAverageData?.amount,
          toTokenInfoData?.decimals
        )
      ).toFixed(6)
    );
  }, [simulateAverageData]);

  useEffect(() => {
    setToAmount(
      parseFloat(
        parseDisplayAmount(simulateData?.amount, toTokenInfoData?.decimals)
      ).toFixed(6)
    );
  }, [simulateData]);

  useEffect(() => {
    const listToken = allToken.filter((t) => fromToken !== t.denom);
    setListValidTo([...listToken]);
    // if (!listTo.includes(toToken)) setToToken(listTo[0] as string);
  }, [fromToken]);

  // useEffect(() => {
  //   if (poolData && fromAmount && fromAmount > 0) {
  //     const finalToAmount =
  //       calculateToAmount(
  //         poolData,
  //         parseInt(parseAmount(fromAmount, fromTokenInfoData?.decimals)),
  //         parseFloat(taxRate?.rate)
  //       ) ?? 0;
  //     const newToAmount = parseFloat(
  //       parseDisplayAmount(finalToAmount, toTokenInfoData?.decimals)
  //     ).toFixed(6);
  //     setToAmount(newToAmount);
  //   } else if (fromAmount === 0) setToAmount(0);
  // }, [poolData, fromAmount]);

  // useEffect(() => {
  //   if (poolData) {
  //     const finalAverageRatio = calculateToAmount(
  //       poolData,
  //       1,
  //       parseFloat(taxRate?.rate)
  //     );
  //     setAverageRatio(parseFloat(finalAverageRatio));
  //   }
  // }, [poolData]);

  // const calculateToAmount = (poolData, offerAmount, taxRate) => {
  //   const offer = new Big(poolData.offerPoolAmount);
  //   const ask = new Big(poolData.askPoolAmount);

  //   return ask
  //     .minus(
  //       offer
  //         .mul(poolData.askPoolAmount)
  //         .div(poolData.offerPoolAmount + offerAmount)
  //     )
  //     .mul(1 - taxRate)
  //     .toNumber();

  //   // (poolData.askPoolAmount - cp / (poolData.offerPoolAmount + offerAmount)) *
  //   // (1 - taxRate)
  // };

  const handleSubmit = async () => {
    if (fromAmount <= 0)
      return displayToast(TToastType.TX_FAILED, {
        message: 'From amount should be higher than 0!'
      });

    setSwapLoading(true);
    displayToast(TToastType.TX_BROADCASTING);
    try {
      let walletAddr;
      if (await window.Keplr.getKeplr())
        walletAddr = await window.Keplr.getKeplrAddr();
      else throw 'You have to install Keplr wallet to swap';

      const msgs = await generateContractMessages({
        type: Type.SWAP,
        sender: `${walletAddr}`,
        amount: parseAmount(fromAmount, fromTokenInfoData?.decimals),
        fromInfo: fromTokenInfoData!,
        toInfo: toTokenInfoData!
      });

      // const msgs = await generateConvertMsgs({ type: Type.CONVERT_TOKEN, fromToken: fromTokenInfoData, fromAmount: "1", sender: `${walletAddr}` })

      const msg = msgs[0];
      console.log(
        'msgs: ',
        msgs.map((msg) => ({ ...msg, msg: Buffer.from(msg.msg).toString() }))
      );
      const result = await CosmJs.execute({
        prefix: ORAI,
        address: msg.contract,
        walletAddr,
        handleMsg: Buffer.from(msg.msg.toString()),
        gasAmount: { denom: ORAI, amount: '0' },
        handleOptions: { funds: msg.sent_funds }
      });
      console.log('result swap tx hash: ', result);

      if (result) {
        console.log('in correct result');
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `${network.explorer}/txs/${result.transactionHash}`
        });
        setSwapLoading(false);
        setTxHash(result.transactionHash);
        return;
      }
    } catch (error) {
      console.log('error in swap form: ', error);
      let finalError = '';
      if (typeof error === 'string' || error instanceof String) {
        finalError = error;
      } else finalError = String(error);
      displayToast(TToastType.TX_FAILED, {
        message: finalError
      });
    }
    setSwapLoading(false);
  };

  const FromIcon = fromToken?.Icon;
  const ToIcon = toToken?.Icon;

  return (
    <Content>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <div className={cx('container')}>
          <div className={cx('from')}>
            <div className={cx('header')}>
              <div className={cx('title')}>FROM</div>
              {/* <img
                className={cx('btn')}
                src={require('assets/icons/setting.svg').default}
                onClick={() => setIsOpenSettingModal(true)}
              /> */}
              <button onClick={() => setRefresh(!refresh)}>
                <img
                  className={cx('btn')}
                  src={require('assets/icons/refresh.svg').default}
                />
              </button>
            </div>
            <div className={cx('balance')}>
              <TokenBalance
                balance={{
                  amount: fromTokenBalance ? fromTokenBalance : 0,
                  denom: fromTokenInfoData?.symbol ?? ''
                }}
                prefix="Balance: "
                decimalScale={6}
              />

              <div
                className={cx('btn')}
                onClick={() => onMaxFromAmount(fromTokenBalance)}
              >
                MAX
              </div>
              <div
                className={cx('btn')}
                onClick={() => onMaxFromAmount(fromTokenBalance / 2)}
              >
                HALF
              </div>
              {/* <span style={{ flexGrow: 1, textAlign: "right" }}>
                {`~$${numberWithCommas(
                  +(
                    mockBalance[fromToken] *
                    mockPrice[fromToken]
                  ).toFixed(2)
                )}`}
              </span> */}
            </div>
            <div className={cx('input')}>
              <div
                className={cx('token')}
                onClick={() => setIsSelectFrom(true)}
              >
                {FromIcon && <FromIcon className={cx('logo')} />}
                <span>{fromTokenInfoData?.symbol}</span>
                <div className={cx('arrow-down')} />
              </div>

              <NumberFormat
                className={cx('amount')}
                thousandSeparator
                decimalScale={6}
                type="input"
                value={fromAmount}
                onValueChange={({ floatValue }) => {
                  onChangeFromAmount(floatValue);
                }}
              />

              {/* <input
                className={cx('amount')}
                value={fromAmount ? fromAmount : ''}
                placeholder="0"
                type="number"
                step={`${parseDisplayAmount(1, fromTokenInfoData?.decimals)}`}
                onChange={(e) => {
                  onChangeFromAmount(e.target.value);
                }}
              /> */}
            </div>
            {/* <div className={cx('fee')}>
              <span>Fee</span>
              <div className={cx('token')} onClick={() => setIsSelectFee(true)}>
                <FeeIcon className={cx('logo')} />
                <span>{feeToken}</span>
                <div className={cx('arrow-down')} />
              </div>
            </div> */}
          </div>
          <div className={cx('swap-icon')}>
            <img
              src={require('assets/icons/ant_swap.svg').default}
              onClick={() => {
                const t = fromToken,
                  k = fromAmount;
                setFromToken(toToken);
                setToToken(t);
                setFromAmount(toAmount);
                setToAmount(fromAmount);
              }}
            />
          </div>
          <div className={cx('to')}>
            <div className={cx('header')}>
              <div className={cx('title')}>TO</div>
            </div>
            <div className={cx('balance')}>
              <TokenBalance
                balance={{
                  amount: toTokenBalance ? toTokenBalance : 0,
                  denom: toTokenInfoData?.symbol ?? ''
                }}
                prefix="Balance: "
                decimalScale={6}
              />

              <span style={{ flexGrow: 1, textAlign: 'right' }}>
                {`1 ${fromTokenInfoData?.symbol} ≈ ${averageRatio} ${toTokenInfoData?.symbol}`}
              </span>
            </div>
            <div className={cx('input')}>
              <div className={cx('token')} onClick={() => setIsSelectTo(true)}>
                {ToIcon && <ToIcon className={cx('logo')} />}
                <span>{toTokenInfoData?.symbol}</span>
                <div className={cx('arrow-down')} />
              </div>

              <NumberFormat
                className={cx('amount')}
                thousandSeparator
                decimalScale={6}
                type="input"
                value={toAmount}
              // onValueChange={({ floatValue }) => {
              //   onChangeToAmount(floatValue);
              // }}
              />

              {/* <input
                className={cx('amount')}
                value={toAmount ? toAmount : ''}
                placeholder="0"
                type="number"
                step={`${parseDisplayAmount(1, toTokenInfoData?.decimals)}`}
                // onChange={(e) => {
                //   onChangeToAmount(e.target.value);
                // }}
                // disabled={true}
              /> */}
            </div>
          </div>
          <button
            className={cx('swap-btn')}
            onClick={handleSubmit}
            disabled={swapLoading}
          >
            {swapLoading && <Loader width={40} height={40} />}
            <span>Swap</span>
          </button>
          <div className={cx('detail')}>
            <div className={cx('row')}>
              <div className={cx('title')}>
                <span>Minimum Received</span>
                {/* <TooltipIcon /> */}
              </div>

              <TokenBalance
                balance={{
                  amount: simulateData ? simulateData?.amount : 0,
                  denom: toTokenInfoData?.symbol ?? ''
                }}
                decimalScale={6}
              />

              {/* <span>{`${parseDisplayAmount(
                  simulateData?.amount,
                  toTokenInfoData?.decimals
                )} ${toTokenInfoData?.symbol.toUpperCase()}`}</span> */}
            </div>
            <div className={cx('row')}>
              <div className={cx('title')}>
                <span>Tax rate</span>
                {/* <TooltipIcon /> */}
              </div>
              <span>{parseFloat(taxRate?.rate) * 100} %</span>
            </div>
            {/* <div className={cx('row')}>
              <div className={cx('title')}>
                <span>Exchange rate</span>
                <TooltipIcon />
              </div>
              <span>{parseFloat(exchangeRate).toFixed(6)}</span>
            </div> */}
          </div>
          <SettingModal
            isOpen={isOpenSettingModal}
            open={() => setIsOpenSettingModal(true)}
            close={() => setIsOpenSettingModal(false)}
            slippage={slippage}
            setSlippage={setSlippage}
          />

          {isSelectFrom ? (
            <SelectTokenModal
              isOpen={isSelectFrom}
              open={() => setIsSelectFrom(true)}
              close={() => setIsSelectFrom(false)}
              listToken={allToken}
              setToken={setFromToken}
            />
          ) : (
            <SelectTokenModal
              isOpen={isSelectTo}
              open={() => setIsSelectTo(true)}
              close={() => setIsSelectTo(false)}
              listToken={listValidTo}
              setToken={setToToken}
            />
          )}
          {/* <SelectTokenModal
            isOpen={isSelectFee}
            open={() => setIsSelectFee(true)}
            close={() => setIsSelectFee(false)}
            listToken={allToken}
            setToken={setFeeToken}
          /> */}
        </div>
      </div>
    </Content>
  );
};

export default Swap;
