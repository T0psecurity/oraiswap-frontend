//@ts-nocheck
import React, { useEffect, useState } from 'react';
import style from './index.module.scss';
import cn from 'classnames/bind';
import { TooltipIcon } from 'components/Tooltip';
import SettingModal from './Modals/SettingModal';
import SelectTokenModal from './Modals/SelectTokenModal';
import { useQuery } from 'react-query';
import {
  fetchBalance,
  fetchExchangeRate,
  fetchPairInfo,
  fetchPool,
  fetchPoolInfoAmount,
  fetchTaxRate,
  fetchTokenInfo,
  generateContractMessages,
  simulateSwap
} from 'rest/api';
import CosmJs from 'libs/cosmjs';
import { DECIMAL_FRACTION, ORAI } from 'constants/constants';
import { parseAmount, parseDisplayAmount } from 'libs/utils';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import TokenBalance from 'components/TokenBalance';
import { network } from 'constants/networks';
import Big from 'big.js';
import NumberFormat from 'react-number-format';
import { pairsMap as mockPair, mockToken } from 'constants/pools';
import { TokenItemType, tokens } from 'constants/bridgeTokens';
import useLocalStorage from 'libs/useLocalStorage';
import { Type } from 'rest/api';
import { ReactComponent as LoadingIcon } from 'assets/icons/loading-spin.svg';
import Content from 'layouts/Content';

const cx = cn.bind(style);

type TokenDenom = keyof typeof mockToken;

interface ValidToken {
  title: TokenDenom;
  contractAddress: string;
  Icon: string;
  denom: string,
}

interface SwapProps { }

const suggestToken = async (token: TokenItemType) => {
  if (token.contractAddress) {
    const keplr = await window.Keplr.getKeplr();
    if (keplr) await keplr.suggestToken(token.chainId, token.contractAddress);
    else displayToast(TToastType.KEPLR_FAILED, { message: "You need to install Keplr to continue" });
  }
};

const Swap: React.FC<SwapProps> = () => {
  const allToken: ValidToken[] = Object.values(mockToken).map((token) => {
    return {
      contractAddress: token.contractAddress,
      Icon: token.Icon,
      title: token.name,
      denom: token.denom
    };
  });
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [isSelectFrom, setIsSelectFrom] = useState(false);
  const [isSelectTo, setIsSelectTo] = useState(false);
  const [isSelectFee, setIsSelectFee] = useState(false);
  const [fromToken, setFromToken] = useState<TokenDenom>('orai');
  const [toToken, setToToken] = useState<TokenDenom>('airi');
  const [feeToken, setFeeToken] = useState<TokenDenom>('airi');
  const [listValidTo, setListValidTo] = useState<ValidToken[]>([]);
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  // const [currentPair, setCurrentPair] = useState<PairName>("ORAI-AIRI");
  const [averageRatio, setAverageRatio] = useState(0);
  const [slippage, setSlippage] = useState(1);
  const [address, setAddress] = useLocalStorage<String>('address');
  const [swapLoading, setSwapLoading] = useState(false);

  const onChangeFromAmount = (amount: number) => {
    setFromAmount(amount);
  };

  const onMaxFromAmount = (amount: number) => {
    let finalAmount = parseFloat(
      parseDisplayAmount(amount, fromTokenInfoData?.decimals)
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

  const {
    data: fromTokenInfoData,
    error: fromTokenInfoError,
    isError: isFromTokenInfoError,
    isLoading: isFromTokenInfoLoading
  } = useQuery(['from-token-info', fromToken], () =>
    fetchTokenInfo(mockToken[fromToken])
  );

  const {
    data: toTokenInfoData,
    error: toTokenInfoError,
    isError: isToTokenInfoError,
    isLoading: isToTokenInfoLoading
  } = useQuery(['to-token-info', toToken], () =>
    fetchTokenInfo(mockToken[toToken])
  );

  const mockFromToken = mockToken[fromToken];
  const mockToToken = mockToken[toToken];

  // suggest tokens
  useEffect(() => {
    if (mockFromToken && mockToToken) {
      suggestToken(mockFromToken);
      suggestToken(mockToToken);
    }
  }, [mockFromToken, mockToToken]);

  const {
    data: fromTokenBalance,
    error: fromTokenBalanceError,
    isError: isFromTokenBalanceError,
    isLoading: isFromTokenBalanceLoading
  } = useQuery(
    ['from-token-balance', fromToken],
    () =>
      fetchBalance(
        address,
        mockFromToken.denom,
        mockFromToken.contractAddress,
        mockFromToken.lcd
      ),
    { enabled: !!address }
  );

  const {
    data: toTokenBalance,
    error: toTokenBalanceError,
    isError: isToTokenBalanceError,
    isLoading: isLoadingToTokenBalance
  } = useQuery(
    ['to-token-balance', toToken],
    () =>
      fetchBalance(
        address,
        mockToToken.denom,
        mockToToken.contractAddress,
        mockToToken.lcd
      ),
    { enabled: !!address }
  );

  const {
    data: exchangeRate,
    error: exchangeRateError,
    isError: isExchangeRateError,
    isLoading: isExchangeRateLoading
  } = useQuery(
    ['exchange-rate', fromTokenInfoData, toTokenInfoData],
    () => fetchExchangeRate(fromTokenInfoData?.denom, toTokenInfoData?.denom),
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
        fromInfo: fromTokenInfoData,
        toInfo: toTokenInfoData,
        amount: parseAmount(fromAmount, fromTokenInfoData?.decimals)
      }),
    { enabled: !!fromTokenInfoData && !!toTokenInfoData && fromAmount > 0 }
  );

  const { data: poolData, isLoading: isPoolDataLoading } = useQuery(
    ['pool-info-amount', fromTokenInfoData, toTokenInfoData],
    () => fetchPoolInfoAmount(fromTokenInfoData, toTokenInfoData),
    { enabled: !!fromTokenInfoData && !!toTokenInfoData && !!taxRate }
  );

  // const { data: pairInfo, isLoading: isPairInfoLoading } = useQuery(
  //   ['pair-info', fromTokenInfoData, toTokenInfoData],
  //   () => fetchPairInfo(mockToken),
  //   { enabled: !!fromTokenInfoData && !!toTokenInfoData }
  // );

  // useEffect(() => {
  //   console.log("pair info: ", pairInfo)
  // }, [pairInfo]);

  useEffect(() => {
    let listTo = getListPairedToken(fromToken);
    const listToken = allToken.filter((t) => listTo.includes(t.denom));
    setListValidTo([...listToken]);
    if (!listTo.includes(toToken)) setToToken(listTo[0] as TokenDenom);
  }, [fromToken]);

  useEffect(() => {
    if (poolData && fromAmount && fromAmount > 0) {
      const finalToAmount =
        calculateToAmount(
          poolData,
          parseInt(parseAmount(fromAmount, fromTokenInfoData?.decimals)),
          parseFloat(taxRate?.rate)
        ) ?? 0;
      const newToAmount = parseFloat(
        parseDisplayAmount(finalToAmount, toTokenInfoData?.decimals)
      ).toFixed(6);
      setToAmount(newToAmount);
    } else if (fromAmount === 0) setToAmount(0);
  }, [poolData, fromAmount]);

  useEffect(() => {
    if (poolData) {
      const finalAverageRatio = calculateToAmount(
        poolData,
        1,
        parseFloat(taxRate?.rate)
      );
      setAverageRatio(parseFloat(finalAverageRatio));
    }
  }, [poolData]);

  const calculateToAmount = (poolData, offerAmount, taxRate) => {
    const offer = new Big(poolData.offerPoolAmount);
    const ask = new Big(poolData.askPoolAmount);

    return ask
      .minus(
        offer
          .mul(poolData.askPoolAmount)
          .div(poolData.offerPoolAmount + offerAmount)
      )
      .mul(1 - taxRate)
      .toNumber();

    // (poolData.askPoolAmount - cp / (poolData.offerPoolAmount + offerAmount)) *
    // (1 - taxRate)
  };

  const handleSubmit = async () => {
    setSwapLoading(true);
    try {
      let walletAddr;
      if (await window.Keplr.getKeplr())
        walletAddr = await window.Keplr.getKeplrAddr();
      else throw 'You have to install Keplr wallet to swap';

      const msgs = await generateContractMessages({
        type: Type.SWAP,
        sender: `${walletAddr}`,
        amount: parseAmount(fromAmount, fromTokenInfoData?.decimals),
        fromInfo: fromTokenInfoData,
        toInfo: toTokenInfoData
      });

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
        return;
      }
    } catch (error) {
      console.log('error in swap form: ', error);
      let finalError = "";
      if (typeof error === 'string' || error instanceof String) {
        finalError = error;
      } else finalError = String(error);
      displayToast(TToastType.TX_FAILED, {
        message: finalError
      });
    }
    setSwapLoading(false);
  };

  const getListPairedToken = (tokenDenom: TokenDenom) => {
    let pairs = Object.keys(mockPair).filter((denom) =>
      denom.includes(tokenDenom)
    );
    return pairs!.map((denom) => denom.replace(tokenDenom, '').replace('-', ''));
  };

  const FromIcon = mockToken[fromToken]?.Icon;
  const ToIcon = mockToken[toToken]?.Icon;
  // const FeeIcon = mockToken[feeToken].Icon;

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
              <img
                className={cx('btn')}
                src={require('assets/icons/setting.svg').default}
                onClick={() => setIsOpenSettingModal(true)}
              />
              <img
                className={cx('btn')}
                src={require('assets/icons/refresh.svg').default}
              />
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
                {`1 ${fromTokenInfoData?.symbol} ≈ ${averageRatio.toFixed(6)} ${toTokenInfoData?.symbol}`}
              </span>
              <TooltipIcon />
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
            {swapLoading && <LoadingIcon width={40} height={40} />}
            <span>Swap</span>
          </button>
          <div className={cx('detail')}>
            <div className={cx('row')}>
              <div className={cx('title')}>
                <span>Minimum Received</span>
                <TooltipIcon />
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
                <TooltipIcon />
              </div>
              <span>{parseFloat(taxRate?.rate) * 100} %</span>
            </div>
            <div className={cx('row')}>
              <div className={cx('title')}>
                <span>Exchange rate</span>
                <TooltipIcon />
              </div>
              <span>{(1 / parseFloat(exchangeRate) * 100).toFixed(2)} %</span>
            </div>
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