import { Input } from 'antd';
import classNames from 'classnames';
import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react';
import { coin } from '@cosmjs/proto-signing';
import { IBCInfo } from 'types/ibc';
import styles from './Balance.module.scss';
import { ReactComponent as ToggleTransfer } from 'assets/icons/toggle_transfer.svg';

import {
  BroadcastTxResponse,
  isBroadcastTxFailure,
  SigningStargateClient
} from '@cosmjs/stargate';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import _ from 'lodash';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import TokenBalance from 'components/TokenBalance';
import NumberFormat from 'react-number-format';
import { ibcInfos } from 'config/ibcInfos';
import {
  evmTokens,
  filteredTokens,
  gravityContracts,
  TokenItemType,
  tokens
} from 'config/bridgeTokens';
import { network } from 'config/networks';
import { fetchBalance, generateConvertMsgs, Type } from 'rest/api';
import Content from 'layouts/Content';
import {
  getUsd,
  parseAmountFromWithDecimal as parseAmountFrom,
  parseAmountToWithDecimal as parseAmountTo
} from 'libs/utils';
import Loader from 'components/Loader';
import { Bech32Address, ibc } from '@keplr-wallet/cosmos';
import Long from 'long';
import { isMobile } from '@walletconnect/browser-utils';
import useGlobalState from 'hooks/useGlobalState';
import Big from 'big.js';
import {
  ERC20_ORAI,
  ORAI,
  ORAI_BRIDGE_CHAIN_ID,
  ORAI_BRIDGE_EVM_DENOM_PREFIX,
  ORAI_BRIDGE_EVM_FEE
} from 'config/constants';
import CosmJs, { HandleOptions } from 'libs/cosmjs';
import gravityRegistry from 'libs/gravity-registry';
import { MsgSendToEth } from 'libs/proto/gravity/v1/msgs';
import { initEthereum } from 'polyfill';

interface BalanceProps { }

type AmountDetail = {
  amount: number;
  usd: number;
};

interface ConvertToNativeProps {
  token: TokenItemType;
  amountDetail?: AmountDetail;
  convertToken?: any;
  transferIBC?: any;
  transferFromGravity?: any;
  name?: string;
  onClickTransfer?: any;
}
interface TokenItemProps extends ConvertToNativeProps {
  active: Boolean;
  className?: string;
  onClick?: Function;
}

const ConvertToNative: FC<ConvertToNativeProps> = ({
  token,
  name,
  amountDetail,
  convertToken,
  transferIBC,
  transferFromGravity,
  onClickTransfer
}) => {
  const [[convertAmount, convertUsd], setConvertAmount] = useState([0, 0]);
  const [convertLoading, setConvertLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  return (
    <div
      className={classNames(styles.tokenFromGroup, styles.small)}
      style={{ flexWrap: 'wrap' }}
    >
      <div
        className={styles.balanceDescription}
        style={{ width: '100%', textAlign: 'left' }}
      >
        Convert Amount:
      </div>
      <NumberFormat
        thousandSeparator
        decimalScale={Math.min(6, token.decimals)}
        customInput={Input}
        value={convertAmount}
        onValueChange={({ floatValue }) => {
          if (!floatValue) return setConvertAmount([0, 0]);

          const _floatValue = parseAmountTo(
            floatValue!,
            token.decimals
          ).toNumber();
          const usdValue =
            (_floatValue / (amountDetail?.amount ?? 0)) *
            (amountDetail?.usd ?? 0);

          setConvertAmount([floatValue!, usdValue]);
        }}
        className={styles.amount}
      />
      <div className={styles.balanceFromGroup} style={{ flexGrow: 1 }}>
        <button
          className={styles.balanceBtn}
          onClick={() => {
            if (!amountDetail) return;
            const _amount = parseAmountFrom(
              amountDetail.amount,
              token.decimals
            ).toNumber();
            setConvertAmount([_amount, amountDetail.usd]);
          }}
        >
          MAX
        </button>
        <button
          className={styles.balanceBtn}
          onClick={() => {
            if (!amountDetail) return;
            const _amount = parseAmountFrom(
              amountDetail.amount,
              token.decimals
            ).toNumber();
            setConvertAmount([_amount / 2, amountDetail.usd / 2]);
          }}
        >
          HALF
        </button>
      </div>
      <div>
        <TokenBalance
          balance={convertUsd}
          className={styles.balanceDescription}
          prefix="~$"
          decimalScale={2}
        />
      </div>
      <div
        className={styles.transferTab}
        style={{
          marginTop: '0px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {!!onClickTransfer ? (
          <button
            className={styles.tfBtn}
            disabled={convertLoading}
            onClick={async () => {
              try {
                setConvertLoading(true);
                await onClickTransfer(convertAmount);
              } finally {
                setConvertLoading(false);
              }
            }}
          >
            {convertLoading && <Loader width={20} height={20} />}
            <span>Transfer</span>
          </button>
        ) : (
          <>
            {token.chainId === ORAI_BRIDGE_CHAIN_ID && (
              <>
                <button
                  className={styles.tfBtn}
                  disabled={transferLoading}
                  onClick={async () => {
                    try {
                      setTransferLoading(true);
                      await transferFromGravity(token, convertAmount);
                    } finally {
                      setTransferLoading(false);
                    }
                  }}
                >
                  {transferLoading && <Loader width={20} height={20} />}
                  <span>
                    Transfer To{' '}
                    <strong>
                      {token.name.match(/BEP20/)
                        ? 'Binance Smart Chain'
                        : 'Ethereum'}
                    </strong>
                  </span>
                </button>
                <small
                  style={{
                    backgroundColor: '#C69A24',
                    color: '#95452d',
                    padding: '0px 3px',
                    borderRadius: 3
                  }}
                >
                  Congested
                </small>
              </>
            )}

            {token.chainId !== ORAI_BRIDGE_CHAIN_ID && (
              <button
                className={styles.tfBtn}
                disabled={convertLoading}
                onClick={async () => {
                  try {
                    setConvertLoading(true);
                    await convertToken(convertAmount, token);
                  } finally {
                    setConvertLoading(false);
                  }
                }}
              >
                {convertLoading && <Loader width={20} height={20} />}
                <span>
                  Convert To <strong style={{ marginLeft: 5 }}>{name}</strong>
                </span>
              </button>
            )}

            {token.chainId !== ORAI_BRIDGE_CHAIN_ID && (
              <button
                disabled={transferLoading}
                className={styles.tfBtn}
                onClick={async () => {
                  try {
                    setTransferLoading(true);
                    const to = filteredTokens.find(
                      (t) =>
                        t.chainId === ORAI_BRIDGE_CHAIN_ID &&
                        t.name === token.name
                    );
                    await transferIBC(token, to, convertAmount);
                  } finally {
                    setTransferLoading(false);
                  }
                }}
              >
                {transferLoading && <Loader width={20} height={20} />}
                <span>
                  Transfer To <strong>OraiBridge</strong>
                </span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const TokenItem: React.FC<TokenItemProps> = ({
  token,
  amountDetail,
  active,
  className,
  onClick,
  convertToken,
  transferFromGravity,
  transferIBC,
  onClickTransfer
}) => {
  // get token name
  const evmName = token.name.match(/^(?:ERC20|BEP20)\s+(.+?)$/i)?.[1];
  return (
    <div
      className={classNames(
        styles.tokenWrapper,
        { [styles.active]: active },
        className
      )}
      onClick={() => onClick?.(token)}
    >
      <div className={styles.balanceAmountInfo}>
        <div className={styles.token}>
          {token.Icon && <token.Icon className={styles.tokenIcon} />}
          <div className={styles.tokenInfo}>
            <div className={styles.tokenName}>{token.name}</div>
            <div className={styles.tokenOrg}>
              <span className={styles.tokenOrgTxt}>{token.org}</span>
            </div>
          </div>
        </div>
        <div className={styles.tokenBalance}>
          <TokenBalance
            balance={{
              amount: amountDetail ? amountDetail.amount.toString() : '0',
              denom: '',
              decimals: token.decimals
            }}
            className={styles.tokenAmount}
            decimalScale={Math.min(6, token.decimals)}
          />
          <TokenBalance
            balance={amountDetail ? amountDetail.usd : 0}
            className={styles.subLabel}
            decimalScale={2}
          />
        </div>
      </div>
      <div>
        {active && onClickTransfer && (
          <ConvertToNative
            name={evmName}
            token={token}
            amountDetail={amountDetail}
            convertToken={convertToken}
            onClickTransfer={onClickTransfer}
          />
        )}
        {active && evmName && token.cosmosBased && (
          <ConvertToNative
            name={evmName}
            token={token}
            amountDetail={amountDetail}
            convertToken={convertToken}
            transferFromGravity={transferFromGravity}
            transferIBC={transferIBC}
          />
        )}
      </div>
    </div>
  );
};

type AmountDetails = { [key: string]: AmountDetail };

const Balance: React.FC<BalanceProps> = () => {
  const [keplrAddress] = useGlobalState('address');
  const [metamaskAddress] = useGlobalState('metamaskAddress');
  const [from, setFrom] = useState<TokenItemType>();
  const [to, setTo] = useState<TokenItemType>();
  const [[fromAmount, fromUsd], setFromAmount] = useState<[number, number]>([
    0, 0
  ]);
  const [ibcLoading, setIBCLoading] = useState(false);
  const [amounts, setAmounts] = useState<AmountDetails>({});
  const [[fromTokens, toTokens], setTokens] = useState(tokens);
  const [txHash, setTxHash] = useState('');
  const { prices } = useCoinGeckoPrices(
    filteredTokens.map((t) => t.coingeckoId)
  );
  // this help to retry loading and show something in processing
  const [pendingTokens, setPendingTokens] = useState(filteredTokens);

  useEffect(() => {
    const _initEthereum = async () => {
      try {
        await initEthereum();
      } catch (error) {
        console.log(error);
      }
    };
    _initEthereum();
  }, []);

  const toggleTransfer = () => {
    setTokens([toTokens, fromTokens]);
    setFrom(to);
    setTo(from);
    setFromAmount([0, 0]);
  };

  const loadAmountDetail = async (
    address: Bech32Address | string | undefined,
    token: TokenItemType,
    pendingList: TokenItemType[]
  ) => {
    let addr =
      address instanceof Bech32Address
        ? address.toBech32(token.prefix!)
        : address;

    try {
      if (!addr) throw new Error('Addr is undefined');
      // using this way we no need to enable other network
      const amount = await fetchBalance(
        addr,
        token.denom,
        token.contractAddress,
        token.lcd
      );

      const amountDetail: AmountDetail = {
        amount,
        usd: getUsd(amount, prices[token.coingeckoId].price, token.decimals)
      };

      return [token.denom, amountDetail];
    } catch (ex) {
      pendingList.push(token);
      return [token.denom, { amount: 0, usd: 0 }];
    }
  };

  const loadEvmOraiAmounts = async () => {
    const entries = await Promise.all(
      evmTokens.map(async (token) => {
        const amount = await window.Metamask.getOraiBalance(
          metamaskAddress,
          token
        );

        return [
          token.denom,
          {
            amount,
            usd: getUsd(amount, prices[token.coingeckoId].price, token.decimals)
          }
        ];
      })
    );

    const amountDetails = Object.fromEntries(entries);
    // update amounts
    setAmounts((old) => ({ ...old, ...amountDetails }));
  };

  const loadTokenAmounts = async () => {
    if (pendingTokens.length == 0) return;
    try {
      // let chainId = network.chainId;
      // we enable oraichain then use pubkey to calculate other address
      const keplr = await window.Keplr.getKeplr();
      if (!keplr) {
        return displayToast(TToastType.TX_FAILED, {
          message: 'You must install Keplr to continue'
        });
      }
      const pendingList: TokenItemType[] = [];

      const amountDetails = Object.fromEntries(
        await Promise.all(
          pendingTokens.map(async (token) => {
            const address = await window.Keplr.getKeplrAddr(token.chainId);
            return loadAmountDetail(address, token, pendingList);
          })
        )
      );

      setAmounts((old) => ({ ...old, ...amountDetails }));

      // if there is pending tokens, then retry loadtokensAmounts with new pendingTokens
      if (pendingList.length > 0) {
        setTimeout(() => setPendingTokens(pendingList), 3000);
      }
    } catch (ex) {
      console.log(ex);
    }
  };

  const processTxResult = (
    token: TokenItemType,
    result: BroadcastTxResponse
  ) => {
    if (isBroadcastTxFailure(result)) {
      displayToast(TToastType.TX_FAILED, {
        message: result.rawLog
      });
    } else {
      displayToast(TToastType.TX_SUCCESSFUL, {
        customLink: `${token.lcd}/cosmos/tx/v1beta1/txs/${result.transactionHash}`
      });
    }
    setTxHash(result.transactionHash);
  };

  useEffect(() => {
    loadTokenAmounts();
  }, [prices, txHash, pendingTokens]);

  useEffect(() => {
    if (!!metamaskAddress) {
      loadEvmOraiAmounts();
    }
  }, [metamaskAddress, prices]);

  const onClickToken = useCallback(
    (type: string, token: TokenItemType) => {
      if (token.denom === ERC20_ORAI) {
        displayToast(TToastType.TX_INFO, {
          message: `Token ${token.name} on ${token.org} is currently not supported`
        });
        return;
      }

      if (type === 'to') {
        setTo(token);
      } else {
        setFrom(token);
        setFromAmount([0, 0]);
        const toToken = findDefaultToToken(toTokens, token);
        setTo(toToken);
      }
    },
    [toTokens]
  );

  const onClickTokenFrom = useCallback(
    (token: TokenItemType) => {
      onClickToken('from', token);
    },
    [onClickToken]
  );

  const onClickTokenTo = useCallback(
    (token: TokenItemType) => {
      onClickToken('to', token);
    },
    [onClickToken]
  );

  const transferFromGravity = async (
    fromToken: TokenItemType,
    amount: number
  ) => {
    try {
      const keplr = await window.Keplr.getKeplr();
      if (!keplr) return;

      await window.Keplr.suggestChain(fromToken.chainId);
      const fromAddress = await window.Keplr.getKeplrAddr(fromToken.chainId);
      const rawAmount = Math.round(
        amount * 10 ** fromToken.decimals - parseInt(ORAI_BRIDGE_EVM_FEE)
      ).toString();

      const offlineSigner = window.keplr.getOfflineSigner(fromToken.chainId);
      // Initialize the gaia api with the offline signer that is injected by Keplr extension.
      const client = await SigningStargateClient.connectWithSigner(
        fromToken.rpc,
        offlineSigner,
        { registry: gravityRegistry }
      );

      const message = {
        typeUrl: '/gravity.v1.MsgSendToEth',
        value: MsgSendToEth.fromPartial({
          sender: fromAddress,
          ethDest: metamaskAddress,
          amount: {
            denom: fromToken.denom,
            amount: rawAmount
          },
          bridgeFee: {
            denom: fromToken.denom,
            // just a number to make sure there is a friction
            amount: ORAI_BRIDGE_EVM_FEE
          }
        })
      };
      const fee = {
        amount: [],
        gas: '200000'
      };
      const result = await client.signAndBroadcast(fromAddress, [message], fee);

      processTxResult(fromToken, result);
    } catch (ex: any) {
      displayToast(TToastType.TX_FAILED, {
        message: ex.message
      });
    }
  };

  const transferIBC = async (
    fromToken: TokenItemType,
    toToken: TokenItemType,
    transferAmount: number
  ) => {
    try {
      if (transferAmount === 0) throw { message: 'Transfer amount is empty' };
      const keplr = await window.Keplr.getKeplr();
      if (!keplr) return;
      await window.Keplr.suggestChain(fromToken.chainId);
      await window.Keplr.suggestChain(toToken.chainId);
      const fromAddress = await window.Keplr.getKeplrAddr(fromToken.chainId);
      const toAddress = await window.Keplr.getKeplrAddr(toToken.chainId);
      if (!fromAddress || !toAddress) {
        return;
      }

      const amount = coin(
        Math.round(transferAmount * 10 ** fromToken.decimals).toString(),
        fromToken.denom
      );
      const ibcInfo: IBCInfo = ibcInfos[fromToken.chainId][toToken.chainId];

      // using app protocol to sign transaction
      if (isMobile() && fromToken.chainId === network.chainId) {
        // check if is blacklisted like orai, using orai wallet
        const msgSend = new ibc.applications.transfer.v1.MsgTransfer({
          sourceChannel: ibcInfo.channel,
          sourcePort: ibcInfo.source,
          sender: fromAddress,
          receiver: toAddress,
          token: amount,
          timeoutTimestamp: Long.fromNumber(
            (Date.now() + ibcInfo.timeout * 1000) * 10 ** 6
          )
        });

        const value = Buffer.from(
          ibc.applications.transfer.v1.MsgTransfer.encode(msgSend).finish()
        ).toString('base64');

        // open app protocal
        const url = `oraiwallet://tx_sign?type_url=%2Fibc.applications.transfer.v1.MsgTransfer&sender=${fromAddress}&value=${value}`;
        console.log(url);
        window.location.href = url;
      } else {
        const offlineSigner = window.keplr.getOfflineSigner(fromToken.chainId);
        // Initialize the gaia api with the offline signer that is injected by Keplr extension.
        const client = await SigningStargateClient.connectWithSigner(
          fromToken.rpc,
          offlineSigner
        );

        const result = await client.sendIbcTokens(
          fromAddress,
          toAddress,
          amount,
          ibcInfo.source,
          ibcInfo.channel,
          undefined,
          Math.floor(Date.now() / 1000) + ibcInfo.timeout,
          {
            gas: '200000',
            amount: []
          }
        );

        processTxResult(fromToken, result);
      }
    } catch (ex: any) {
      displayToast(TToastType.TX_FAILED, {
        message: ex.message
      });
    }
  };

  const transferEvmToIBC = async (fromAmount: number) => {
    if (!metamaskAddress || !keplrAddress) {
      displayToast(TToastType.TX_FAILED, {
        message: 'Please login both metamask and keplr!'
      });
      return;
    }
    try {
      const gravityContractAddr = gravityContracts[from!.chainId!] as string;
      if (!gravityContractAddr || !from) {
        return;
      }

      await window.Metamask.checkOrIncreaseAllowance(
        from!.chainId,
        from!.contractAddress!,
        metamaskAddress,
        gravityContractAddr,
        fromAmount.toString()
      );
      const result = await window.Metamask.transferToGravity(
        from!.chainId,
        fromAmount.toString(),
        from!.contractAddress!,
        metamaskAddress,
        keplrAddress
      );

      displayToast(TToastType.TX_SUCCESSFUL, {
        customLink: `
        https://bscscan.com/tx/${result?.transactionHash}`
      });
      setTxHash(result?.transactionHash);
    } catch (ex: any) {
      displayToast(TToastType.TX_FAILED, {
        message: ex.message
      });
    }
  };

  const onClickTransfer = async (fromAmount: number) => {
    // disable send amount < 0

    if (!from || !to) {
      displayToast(TToastType.TX_FAILED, {
        message: 'Please choose both from and to tokens'
      });
      return;
    }
    const fromBalance =
      from && amounts[from.denom] ? amounts[from.denom].amount : 0;
    if (fromAmount <= 0 || fromAmount * from.decimals > fromBalance) {
      return;
    }
    displayToast(TToastType.TX_BROADCASTING);
    setIBCLoading(true);
    if (from.cosmosBased) {
      await transferIBC(from, to, fromAmount);
    } else {
      await transferEvmToIBC(fromAmount);
    }
    setIBCLoading(false);
  };

  const convertToken = async (amount: number, token: TokenItemType) => {
    if (amount <= 0)
      return displayToast(TToastType.TX_FAILED, {
        message: 'From amount should be higher than 0!'
      });

    displayToast(TToastType.TX_BROADCASTING);
    try {
      const _fromAmount = parseAmountTo(amount, token.decimals).toString();

      const msgs = await generateConvertMsgs({
        type: Type.CONVERT_TOKEN,
        sender: keplrAddress,
        fromAmount: _fromAmount,
        fromToken: token
      });

      const msg = msgs[0];
      console.log(
        'msgs: ',
        msgs.map((msg) => ({ ...msg, msg: Buffer.from(msg.msg).toString() }))
      );
      const result = await CosmJs.execute({
        prefix: ORAI,
        address: msg.contract,
        walletAddr: keplrAddress,
        handleMsg: msg.msg.toString(),
        gasAmount: { denom: ORAI, amount: '0' },
        handleOptions: { funds: msg.sent_funds } as HandleOptions
      });

      if (result) {
        console.log('in correct result');
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `${network.explorer}/txs/${result.transactionHash}`
        });
        setTxHash(result.transactionHash);
      }
    } catch (error) {
      console.log('error in swap form: ', error);
      let finalError = '';
      if (typeof error === 'string' || error instanceof String) {
        finalError = `${error}`;
      } else finalError = String(error);
      displayToast(TToastType.TX_FAILED, {
        message: finalError
      });
    }
  };

  const findDefaultToToken = (
    toTokens: TokenItemType[],
    from: TokenItemType
  ) => {
    return toTokens.find(
      (t) =>
        !from || (from.chainId !== ORAI_BRIDGE_CHAIN_ID && t.name === from.name)
    );
  };

  const totalUsd = _.sumBy(Object.values(amounts), (c) => c.usd);

  return (
    <Content nonBackground>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span className={styles.totalAssets}>Total Assets</span>
          <TokenBalance
            balance={totalUsd}
            className={styles.balance}
            decimalScale={2}
          />
        </div>
        <div className={styles.divider} />
        <div className={styles.transferTab}>
          {/* From Tab */}
          <div className={styles.border_gradient}>
            <div className={styles.balance_block}>
              <div className={styles.tableHeader}>
                <span className={styles.label}>From</span>
                <div className={styles.fromBalanceDes}>
                  <div className={styles.balanceFromGroup}>
                    <TokenBalance
                      balance={{
                        amount:
                          from && amounts[from.denom]
                            ? amounts[from.denom].amount
                            : 0,
                        denom: from?.name ?? '',
                        decimals: from?.decimals
                      }}
                      className={styles.balanceDescription}
                      prefix="Balance: "
                      decimalScale={Math.min(6, from?.decimals || 0)}
                    />
                  </div>
                  <TokenBalance
                    balance={fromUsd}
                    className={styles.balanceDescription}
                    prefix="~$"
                    decimalScale={2}
                  />
                </div>
                {from?.name ? (
                  <div className={styles.tokenFromGroup}>
                    <div className={styles.token}>
                      {from.Icon && <from.Icon />}
                      <div className={styles.tokenInfo}>
                        <div className={styles.tokenName}>{from.name}</div>
                        <div className={styles.tokenOrg}>
                          <span className={styles.tokenOrgTxt}>{from.org}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className={styles.table}>
                <div className={styles.tableDes}>
                  <span className={styles.subLabel}>Available assets</span>
                  <span className={styles.subLabel}>Balance</span>
                </div>
                <div className={styles.tableContent}>
                  {fromTokens.map((t: TokenItemType) => {
                    return (
                      <TokenItem
                        key={t.denom}
                        amountDetail={amounts[t.denom]}
                        className={styles.token_from}
                        active={from?.denom === t.denom}
                        token={t}
                        transferFromGravity={transferFromGravity}
                        onClick={onClickTokenFrom}
                        onClickTransfer={!!to ? onClickTransfer : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* End from tab */}
          {/* Transfer button */}

          <div className={styles.transferBtn}>
            <button onClick={toggleTransfer}>
              <ToggleTransfer
                style={{
                  width: 44,
                  height: 44,
                  alignSelf: 'center',
                  cursor: 'pointer'
                }}
              />
            </button>
          </div>
          {/* End Transfer button */}
          {/* To Tab */}
          <div className={styles.border_gradient}>
            <div className={styles.balance_block}>
              <div className={styles.tableHeader}>
                <span className={styles.label}>To</span>

                <TokenBalance
                  balance={{
                    amount:
                      to && amounts[to.denom] ? amounts[to.denom].amount : 0,
                    denom: to?.name ?? '',
                    decimals: to?.decimals
                  }}
                  className={styles.balanceDescription}
                  prefix="Balance: "
                  decimalScale={Math.min(6, to?.decimals || 0)}
                />

                {to ? (
                  <div className={styles.token} style={{ marginBottom: 10 }}>
                    {to.Icon && <to.Icon />}
                    <div className={styles.tokenInfo}>
                      <div className={styles.tokenName}>{to.name}</div>
                      <div className={styles.tokenOrg}>
                        <span className={styles.tokenOrgTxt}>{to.org}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className={styles.table}>
                <div className={styles.tableDes}>
                  <span className={styles.subLabel}>Available assets</span>
                  <span className={styles.subLabel}>Balance</span>
                </div>
                <div className={styles.tableContent}>
                  {toTokens
                    .filter(
                      (t) =>
                        !from ||
                        (from.chainId !== ORAI_BRIDGE_CHAIN_ID &&
                          t.name === from.name)
                    )
                    .map((t: TokenItemType) => {
                      return (
                        <TokenItem
                          key={t.denom}
                          amountDetail={amounts[t.denom]}
                          active={to?.denom === t.denom}
                          token={t}
                          onClick={onClickTokenTo}
                          convertToken={convertToken}
                          transferIBC={transferIBC}
                        />
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
          {/* End To Tab  */}
        </div>
      </div>
    </Content>
  );
};

export default Balance;
