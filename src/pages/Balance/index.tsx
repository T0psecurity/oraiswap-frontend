import { Input } from 'antd';
import classNames from 'classnames';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { coin } from '@cosmjs/proto-signing';
import { IBCInfo } from 'types/ibc';
import styles from './Balance.module.scss';
import { ReactComponent as ToggleTransfer } from 'assets/icons/toggle_transfer.svg';

import { SigningStargateClient } from '@cosmjs/stargate';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import _ from 'lodash';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import TokenBalance from 'components/TokenBalance';
import NumberFormat from 'react-number-format';
import { ibcInfos } from 'constants/ibcInfos';
import {
  filteredTokens,
  gravityContracts,
  TokenItemType,
  tokens
} from 'constants/bridgeTokens';
import { network } from 'constants/networks';
import { fetchBalance } from 'rest/api';
import Content from 'layouts/Content';
import { getUsd } from 'libs/utils';
import Loader from 'components/Loader';
import { Bech32Address, ibc } from '@keplr-wallet/cosmos';
import Long from 'long';
import { isMobile } from '@walletconnect/browser-utils';
import useGlobalState from 'hooks/useGlobalState';
import { AbiItem } from 'web3-utils';
import GravityABI from 'constants/abi/gravity.json';
import Web3 from 'web3';
import { useWeb3React } from '@web3-react/core';
// import detectEthereumProvider from '@metamask/detect-provider';

interface BalanceProps {}

type AmountDetail = {
  amount: number;
  usd: number;
};
interface TokenItemProps {
  token: TokenItemType;
  active: Boolean;
  className?: string;
  onClick?: Function;
  amountDetail?: AmountDetail;
}

const TokenItem: React.FC<TokenItemProps> = ({
  token,
  amountDetail,
  active,
  className,
  onClick
}) => {
  return (
    <div
      className={classNames(
        styles.tokenWrapper,
        { [styles.active]: active },
        className
      )}
      onClick={() => onClick?.(token)}
    >
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
          decimalScale={token.decimals}
        />
        <TokenBalance
          balance={amountDetail ? amountDetail.usd : 0}
          className={styles.subLabel}
          decimalScale={2}
        />
      </div>
    </div>
  );
};

type AmountDetails = { [key: string]: AmountDetail };

const Balance: React.FC<BalanceProps> = () => {
  const { account, chainId, library } = useWeb3React();
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
    const bep20OraiAmount = await window.Metamask.getOraiBalance(
      metamaskAddress
    );
    const erc20OraiAmount = await window.Metamask.getOraiBalance(
      metamaskAddress,
      'erc20_orai'
    );
    const amountDetails = Object.fromEntries([
      [
        'bep20_orai',
        {
          amount: bep20OraiAmount,
          usd: getUsd(bep20OraiAmount, prices['oraichain-token'].price, 18)
        }
      ],
      [
        'erc20_orai',
        {
          amount: erc20OraiAmount,
          usd: getUsd(erc20OraiAmount, prices['oraichain-token'].price, 18)
        }
      ]
    ]);
    // update amounts
    setAmounts((old) => ({ ...old, ...amountDetails }));

    return amountDetails;
  };

  const loadTokenAmounts = async () => {
    if (pendingTokens.length == 0) return;
    try {
      let filteredPendingTokens = pendingTokens.filter(
        (pending) => pending.chainId
      );
      // console.log("filtered pending: ", filteredPendingTokens)
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
          filteredPendingTokens.map(async (token) => {
            const address = await window.Keplr.getKeplrBech32Address(
              token.coinType === network.coinType
                ? network.chainId
                : token.chainId
            );

            return loadAmountDetail(address, token, pendingList);
          })
        )
      );

      // if there is pending tokens, then retry loadtokensAmounts with new pendingTokens
      if (pendingList.length > 0) {
        setTimeout(() => setPendingTokens(pendingList), 3000);
      }
    } catch (ex) {
      console.log(ex);
    }
  };

  useEffect(() => {
    loadTokenAmounts();
  }, [prices, txHash, pendingTokens]);

  useEffect(() => {
    if (!!metamaskAddress) {
      loadEvmOraiAmounts();
    }
  }, [metamaskAddress, prices]);

  const onClickToken = useCallback((type: string, token: TokenItemType) => {
    if (!token.cosmosBased) {
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
    }
  }, []);

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

  const transferIBC = async () => {
    // disable send amount < 0
    if (fromAmount <= 0) {
      return;
    }

    if (!from || !to) {
      displayToast(TToastType.TX_FAILED, {
        message: 'Please choose both from and to tokens'
      });
      return;
    }

    setIBCLoading(true);
    displayToast(TToastType.TX_BROADCASTING);
    try {
      const keplr = await window.Keplr.getKeplr();
      if (keplr) {
        await window.Keplr.suggestChain(from.chainId);
        const fromAddress = await window.Keplr.getKeplrAddr(from.chainId);
        const toAddress = await window.Keplr.getKeplrAddr(to.chainId);
        const amount = coin(
          Math.round(fromAmount * 10 ** from.decimals),
          from.denom
        );
        const ibcInfo: IBCInfo = ibcInfos[from.chainId][to.chainId];

        // using app protocol to sign transaction
        if (isMobile() && from.chainId === network.chainId) {
          // check if is blacklisted like orai, using orai wallet
          const msgSend = new ibc.applications.transfer.v1.MsgTransfer({
            sourceChannel: ibcInfo.channel,
            sourcePort: ibcInfo.source,
            sender: fromAddress as string,
            receiver: toAddress as string,
            token: amount,
            timeoutTimestamp: Long.fromNumber(
              (Date.now() + ibcInfo.timeout * 1000) * 10 ** 6
            )
          });

          const value = Buffer.from(
            ibc.applications.transfer.v1.MsgTransfer.encode(msgSend).finish()
          ).toString('base64');

          // open app protocal
          const url = `oraiwallet://tx_sign?type_url=%2Fibc.applications.transfer.v1.MsgTransfer&value=${value}`;
          window.open(url);
        } else {
          const offlineSigner = window.keplr.getOfflineSigner(from.chainId);
          // Initialize the gaia api with the offline signer that is injected by Keplr extension.
          const client = await SigningStargateClient.connectWithSigner(
            from.rpc,
            offlineSigner
          );

          const result = await client.sendIbcTokens(
            fromAddress as string,
            toAddress as string,
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

          displayToast(TToastType.TX_SUCCESSFUL, {
            customLink: `${from.lcd}/cosmos/tx/v1beta1/txs/${result?.transactionHash}`
          });
          // set tx hash to trigger refetching amount values
          setTxHash(result?.transactionHash);
        }
      } else {
        displayToast(TToastType.TX_FAILED, {
          message: 'You must install Keplr to continue'
        });
        return;
      }
    } catch (ex: any) {
      displayToast(TToastType.TX_FAILED, {
        message: ex.message
      });
    }
    setIBCLoading(false);
  };

  const onClickTransfer = () => {
    if (from?.denom === 'bep20_orai') {
      if (!metamaskAddress || !keplrAddress) {
        displayToast(TToastType.TX_FAILED, {
          message: 'Please choose both from and to tokens'
        });
        return;
      }
      return window.Metamask.transferToGravity(
        from?.chainId,
        fromAmount.toString(),
        from?.contractAddress!,
        metamaskAddress,
        keplrAddress
      );
    }
    transferIBC();
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
                      decimalScale={from?.decimals}
                    />

                    <button
                      className={styles.balanceBtn}
                      onClick={() => {
                        setFromAmount(
                          from
                            ? [
                                amounts[from.denom].amount /
                                  10 ** from.decimals,
                                amounts[from.denom].usd
                              ]
                            : [0, 0]
                        );
                      }}
                    >
                      MAX
                    </button>
                    <button
                      className={styles.balanceBtn}
                      onClick={() => {
                        setFromAmount(
                          from
                            ? [
                                amounts[from.denom].amount /
                                  (2 * 10 ** from.decimals),
                                amounts[from.denom].usd / 2
                              ]
                            : [0, 0]
                        );
                      }}
                    >
                      HALF
                    </button>
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

                    <NumberFormat
                      thousandSeparator
                      decimalScale={from.decimals}
                      customInput={Input}
                      value={fromAmount}
                      onValueChange={({ floatValue }) => {
                        setFromAmount([
                          floatValue ?? 0,
                          getUsd(
                            (floatValue ?? 0) * 10 ** from.decimals,
                            prices[from.coingeckoId].price,
                            from.decimals
                          )
                        ]);
                      }}
                      className={styles.amount}
                    />
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
                        active={from?.name === t.name}
                        token={t}
                        onClick={onClickTokenFrom}
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
            <button
              className={styles.tfBtn}
              onClick={onClickTransfer}
              disabled={ibcLoading}
            >
              {ibcLoading && <Loader width={40} height={40} />}
              <span className={styles.tfTxt}>Transfer</span>
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
                  decimalScale={to?.decimals}
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
                    .filter((t) => !from || t.name === from.name)
                    .map((t: TokenItemType) => {
                      return (
                        <TokenItem
                          key={t.denom}
                          amountDetail={amounts[t.denom]}
                          active={to?.name === t.name}
                          token={t}
                          onClick={onClickTokenTo}
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
