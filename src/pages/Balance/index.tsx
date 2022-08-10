import React, { FC, useCallback, useEffect, useState } from 'react';
import { coin } from '@cosmjs/proto-signing';
import { IBCInfo } from 'types/ibc';
import styles from './Balance.module.scss';

import {
  BroadcastTxResponse,
  isBroadcastTxFailure,
  SigningStargateClient
} from '@cosmjs/stargate';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import _ from 'lodash';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import TokenBalance from 'components/TokenBalance';
import { ibcInfos, oraicbain2atom } from 'config/ibcInfos';
import {
  evmTokens,
  filteredTokens,
  gravityContracts,
  kawaiiTokens,
  TokenItemType,
  tokens
} from 'config/bridgeTokens';
import { network } from 'config/networks';
import { fetchBalance, fetchBalanceWithMapping, generateConvertCw20Erc20Message, generateConvertMsgs, Type } from 'rest/api';
import Content from 'layouts/Content';
import {
  buildMultipleMessages,
  getUsd,
  parseAmountFromWithDecimal as parseAmountFrom,
  parseAmountToWithDecimal as parseAmountTo,
  parseAmountToWithDecimal,
  parseBep20Erc20Name
} from 'libs/utils';
import { Bech32Address, ibc } from '@keplr-wallet/cosmos';
import useGlobalState from 'hooks/useGlobalState';
import {
  ERC20_ORAI,
  KAWAII_API_DEV,
  KWT,
  KWT_SUBNETWORK_CHAIN_ID,
  ORAI,
  ORAICHAIN_ID,
  ORAI_BRIDGE_CHAIN_ID,
  ORAI_BRIDGE_EVM_DENOM_PREFIX,
  ORAI_BRIDGE_EVM_FEE
} from 'config/constants';
import CosmJs, { getExecuteContractMsgs, HandleOptions, parseExecuteContractMultiple } from 'libs/cosmjs';
import gravityRegistry from 'libs/gravity-registry';
import { MsgSendToEth } from 'libs/proto/gravity/v1/msgs';
import { initEthereum } from 'polyfill';
import { useSearchParams } from 'react-router-dom';
import KawaiiverseJs from 'libs/kawaiiversejs';
import axios from 'axios';
import { useInactiveListener } from 'hooks/useMetamask';
import TokenItem, { AmountDetail } from './TokenItem';
import KwtModal from './KwtModal';
import { MsgTransfer } from '../../../node_modules/cosmjs-types/ibc/applications/transfer/v1/tx';
import Long from 'long';
import cosmwasmRegistry from 'libs/cosmwasm-registry';

interface BalanceProps { }



type AmountDetails = { [key: string]: AmountDetail };

const Balance: React.FC<BalanceProps> = () => {
  const [searchParams] = useSearchParams();
  let tokenUrl = searchParams.get('token');
  const [keplrAddress] = useGlobalState('address');
  const [kwtSubnetAddress, setKwtSubnetAddress] = useState<string>();
  const [from, setFrom] = useState<TokenItemType>();
  const [to, setTo] = useState<TokenItemType>();
  const [[fromAmount, fromUsd], setFromAmount] = useState<[number, number]>([
    0, 0
  ]);
  const [ibcLoading, setIBCLoading] = useState(false);
  const [amounts, setAmounts] = useState<AmountDetails>({});
  const [[fromTokens, toTokens], setTokens] = useState(() => {
    if (!tokenUrl) return tokens;
    const _tokenUrl = tokenUrl.toUpperCase();
    return tokens.map((childTokens) =>
      childTokens.filter((t) => t.name.includes(_tokenUrl))
    );
  });
  const [txHash, setTxHash] = useState('');
  const { prices } = useCoinGeckoPrices(
    filteredTokens.map((t) => t.coingeckoId)
  );
  // this help to retry loading and show something in processing
  const [pendingTokens, setPendingTokens] = useState(filteredTokens);
  const [metamaskAddress] = useGlobalState('metamaskAddress');

  useInactiveListener();
  useEffect(() => {
    _initEthereum();
  }, []);

  useEffect(() => {
    if (!keplrAddress) return;
    getKwtSubnetAddress();
  }, [keplrAddress]);

  useEffect(() => {
    loadTokenAmounts();
  }, [prices, txHash, pendingTokens, keplrAddress]);

  useEffect(() => {
    if (!!metamaskAddress) {
      loadEvmOraiAmounts();
    }
  }, [metamaskAddress, prices, txHash]);

  useEffect(() => {
    if (!!kwtSubnetAddress) {
      loadKawaiiSubnetAmount();
    }
  }, [kwtSubnetAddress, prices, txHash]);

  const getKwtSubnetAddress = async () => {
    try {
      const key = await window.Keplr.getKeplrKey();
      // TODO: need to support nano ledger for kwt with cointype 60
      if (key.isNanoLedger) {
        setKwtSubnetAddress('');
        return;
      }
      let address = await window.Keplr.getKeplrAddr(KWT_SUBNETWORK_CHAIN_ID);
      const { address_eth } = (
        await axios.get(
          `${KAWAII_API_DEV}/mintscan/v1/account/cosmos-to-eth/${address}`
        )
      ).data;
      setKwtSubnetAddress(address_eth);
    } catch (error) {
      displayToast(TToastType.TX_FAILED, {
        message: error.message
      });
    }
  };

  const _initEthereum = async () => {
    try {
      await initEthereum();
    } catch (error) {
      console.log(error);
    }
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
      let amountDetail: AmountDetail
      if (!!token.erc20Cw20Map) {
        const { amount, subAmounts } = await fetchBalanceWithMapping(addr, token)
        amountDetail = {
          subAmounts,
          amount,
          usd: getUsd(amount, prices[token.coingeckoId].price, token.decimals)
        };
      }
      else {
        const amount = await fetchBalance(
          addr,
          token.denom,
          token.contractAddress,
          token.lcd
        );
        amountDetail = {
          amount,
          usd: getUsd(amount, prices[token.coingeckoId].price, token.decimals)
        };
      }

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

  const loadKawaiiSubnetAmount = async () => {
    const entries = await Promise.all(
      kawaiiTokens
        .filter((t) => !!t.contractAddress)
        .map(async (token) => {
          const amount = await window.Metamask.getOraiBalance(
            kwtSubnetAddress,
            token
          );

          return [
            token.denom,
            {
              amount,
              usd: getUsd(
                amount,
                prices[token.coingeckoId].price,
                token.decimals
              )
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
        return displayToast(
          TToastType.TX_INFO,
          {
            message: 'You must install Keplr to continue'
          },
          { toastId: 'install_keplr' }
        );
      }
      const pendingList: TokenItemType[] = [];

      const amountDetails = Object.fromEntries(
        await Promise.all(
          pendingTokens.map(async (token) => {
            const address = await window.Keplr.getKeplrAddr(
              token.chainId
            ).catch((error) => {
              console.log(error);
              return undefined;
            });
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
    result: BroadcastTxResponse,
    customLink?: string
  ) => {
    if (isBroadcastTxFailure(result)) {
      displayToast(TToastType.TX_FAILED, {
        message: result.rawLog
      });
    } else {
      displayToast(TToastType.TX_SUCCESSFUL, {
        customLink: customLink
          ? customLink
          : `${token.lcd}/cosmos/tx/v1beta1/txs/${result.transactionHash}`
      });
    }
    setTxHash(result.transactionHash);
  };

  const onClickToken = useCallback(
    (type: string, token: TokenItemType) => {
      if (token.denom === ERC20_ORAI) {
        displayToast(TToastType.TX_INFO, {
          message: `Token ${token.name} on ${token.org} is currently not supported`
        });
        return;
      }

      if (type === 'to') {
        if (_.isEqual(to, token)) {
          setTo(undefined);
        } else setTo(token);
      } else {
        if (_.isEqual(from, token)) {
          setFrom(undefined);
          setTo(undefined);
        } else {
          setFrom(token);
          setFromAmount([0, 0]);
          const toToken = findDefaultToToken(toTokens, token);
          setTo(toToken);
        }
      }
    },
    [toTokens, from, to]
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

      if (!metamaskAddress || !fromAddress) {
        displayToast(TToastType.TX_FAILED, {
          message: 'Please login both metamask and keplr!'
        });
        return;
      }

      const rawAmount = parseAmountToWithDecimal(amount, fromToken.decimals)
        .minus(ORAI_BRIDGE_EVM_FEE)
        .toFixed(0);

      const offlineSigner = await window.Keplr.getOfflineSigner(
        fromToken.chainId
      );
      // Initialize the gaia api with the offline signer that is injected by Keplr extension.
      const client = await SigningStargateClient.connectWithSigner(
        fromToken.rpc,
        offlineSigner,
        { registry: gravityRegistry }
      );

      const key = await window.Keplr.getKeplrKey();
      if (key.isNanoLedger)
        throw 'This feature has not supported Ledger device yet!';

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

  const transferIbcCustom = async (
    fromToken: TokenItemType,
    toToken: TokenItemType,
    transferAmount: number
  ) => {
    console.log("from token: ", fromToken)
    console.log("to token: ", toToken)
    if (transferAmount === 0) throw { message: 'Transfer amount is empty' };
    const keplr = await window.Keplr.getKeplr();
    if (!keplr) return;
    await window.Keplr.suggestChain(toToken.chainId);
    // enable from to send transaction
    await window.Keplr.suggestChain(fromToken.chainId);
    const fromAddress = await window.Keplr.getKeplrAddr(fromToken.chainId);
    const toAddress = await window.Keplr.getKeplrAddr(toToken.chainId);
    if (!fromAddress || !toAddress) {
      displayToast(TToastType.TX_FAILED, {
        message: 'Please login keplr!'
      });
      return;
    }

    var amount = coin(
      parseAmountToWithDecimal(transferAmount, fromToken.decimals).toFixed(0),
      fromToken.denom
    );

    const ibcInfo: IBCInfo = ibcInfos[fromToken.chainId][toToken.chainId];

    // check if from token has erc20 map then we need to convert back to bep20 / erc20 first. TODO: need to filter if convert to ERC20 or BEP20
    if (!fromToken.erc20Cw20Map) await transferIBC({ fromToken, fromAddress, toAddress, amount, ibcInfo });
    else {
      // TODO: need to have filter to check denom & decimal of appropirate network (ERC20 or BEP20)
      amount = coin(
        parseAmountToWithDecimal(transferAmount, fromToken.erc20Cw20Map[0].decimals.erc20Decimals).toFixed(0),
        fromToken.erc20Cw20Map[0].erc20Denom
      );
      const msgConvertReverses = await generateConvertCw20Erc20Message(fromToken, fromAddress, amount);
      const executeContractMsgs = getExecuteContractMsgs(fromAddress, parseExecuteContractMultiple(buildMultipleMessages(undefined, msgConvertReverses)));

      // get raw ibc tx
      const msgTransfer = {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: MsgTransfer.fromPartial({
          sourcePort: ibcInfo.source, sourceChannel: ibcInfo.channel, token: amount, sender: fromAddress, receiver: toAddress, timeoutTimestamp: Long.fromNumber(Math.floor(Date.now() / 1000) + ibcInfo.timeout).multiply(1000000000)
        })
      }

      const offlineSigner = await window.Keplr.getOfflineSigner(
        fromToken.chainId
      );
      // Initialize the gaia api with the offline signer that is injected by Keplr extension.
      const client = await SigningStargateClient.connectWithSigner(
        fromToken.rpc,
        offlineSigner,
        { registry: cosmwasmRegistry }
      );

      try {
        const result = await client.signAndBroadcast(fromAddress, [...executeContractMsgs, msgTransfer], {
          gas: '300000',
          amount: []
        });
        processTxResult(fromToken, result);
      } catch (ex: any) {
        console.log("error in transfer ibc custom: ", ex);
        displayToast(TToastType.TX_FAILED, {
          message: ex.message
        });
      }
    }
  }

  const transferIBC = async (
    data: {
      fromToken: TokenItemType
      fromAddress: string,
      toAddress: string,
      amount: Coin,
      ibcInfo: IBCInfo,
    }
  ) => {

    const { fromToken, fromAddress, toAddress, amount, ibcInfo } = data;

    try {

      const offlineSigner = await window.Keplr.getOfflineSigner(
        fromToken.chainId
      );
      // Initialize the gaia api with the offline signer that is injected by Keplr extension.
      const client = await SigningStargateClient.connectWithSigner(
        fromToken.rpc,
        offlineSigner
      );

      // if (key.isNanoLedger && fromAddress.substring(0, 4) === ORAI) throw "This feature has not supported Ledger device yet!"
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
    } catch (ex: any) {
      displayToast(TToastType.TX_FAILED, {
        message: ex.message
      });
    }
  };

  const transferIBCKwt = async (
    fromToken: TokenItemType,
    toToken: TokenItemType,
    transferAmount: number
  ) => {
    try {
      if (transferAmount === 0) throw { message: 'Transfer amount is empty' };
      const keplr = await window.Keplr.getKeplr();
      if (!keplr) return;
      await window.Keplr.suggestChain(toToken.chainId);
      // enable from to send transaction
      await window.Keplr.suggestChain(fromToken.chainId);
      const fromAddress = await window.Keplr.getKeplrAddr(fromToken.chainId);
      const toAddress = await window.Keplr.getKeplrAddr(toToken.chainId);
      if (!fromAddress || !toAddress) {
        displayToast(TToastType.TX_FAILED, {
          message: 'Please login keplr!'
        });
        return;
      }

      var amount = coin(
        parseAmountToWithDecimal(transferAmount, fromToken.decimals).toFixed(0),
        fromToken.denom
      );

      const ibcInfo: IBCInfo = ibcInfos[fromToken.chainId][toToken.chainId];
      var customMessages: any[];

      // check if from token has erc20 map then we need to convert back to bep20 / erc20 first. TODO: need to filter if convert to ERC20 or BEP20
      if (fromToken.erc20Cw20Map) {
        const msgConvertReverses = await generateConvertCw20Erc20Message(fromToken, fromAddress, amount);
        const executeContractMsgs = getExecuteContractMsgs(fromAddress, parseExecuteContractMultiple(buildMultipleMessages(undefined, msgConvertReverses)));
        customMessages = executeContractMsgs.map(msg => ({ message: msg.value, path: msg.typeUrl.substring(1) }));
      }

      const result = await KawaiiverseJs.transferIBC({
        sender: fromAddress,
        gasAmount: { denom: '200000', amount: '0' },
        ibcInfo: {
          sourcePort: ibcInfo.source,
          sourceChannel: ibcInfo.channel,
          amount: amount.amount,
          denom: amount.denom,
          sender: fromAddress,
          receiver: toAddress,
          timeoutTimestamp: Math.floor(Date.now() / 1000) + ibcInfo.timeout
        },
        customMessages
      });

      processTxResult(
        fromToken,
        result,
        `https://scan.kawaii.global/tx/${result.transactionHash}`
      );
    } catch (ex: any) {
      displayToast(TToastType.TX_FAILED, {
        message: ex.message
      });
    }
  };

  const convertTransferIBCErc20Kwt = async (
    fromToken: TokenItemType,
    toToken: TokenItemType,
    transferAmount: number
  ) => {
    try {
      if (transferAmount === 0) throw { message: 'Transfer amount is empty' };
      const keplr = await window.Keplr.getKeplr();
      if (!keplr) return;
      await window.Keplr.suggestChain(toToken.chainId);
      // enable from to send transaction
      await window.Keplr.suggestChain(fromToken.chainId);
      const fromAddress = await window.Keplr.getKeplrAddr(fromToken.chainId);
      const toAddress = await window.Keplr.getKeplrAddr(toToken.chainId);
      if (!fromAddress || !toAddress) {
        displayToast(TToastType.TX_FAILED, {
          message: 'Please login keplr!'
        });
        return;
      }

      const amount = coin(
        parseAmountToWithDecimal(transferAmount, fromToken.decimals).toFixed(0),
        process.env.REACT_APP_KWT_SUB_NETWORK_DENOM
      );
      const ibcInfo: IBCInfo = ibcInfos[fromToken.chainId][toToken.chainId];

      const result = await KawaiiverseJs.convertIbcTransferERC20({
        sender: fromAddress,
        gasAmount: { denom: '200000', amount: '0' },
        ibcInfo: {
          sourcePort: ibcInfo.source,
          sourceChannel: ibcInfo.channel,
          amount: amount.amount,
          denom: amount.denom,
          sender: fromAddress,
          receiver: toAddress,
          timeoutTimestamp: Math.floor(Date.now() / 1000) + ibcInfo.timeout
        },
        amount: amount.amount
      });

      processTxResult(
        fromToken,
        result,
        `https://scan.kawaii.global/tx/${result.transactionHash}`
      );
    } catch (ex: any) {
      displayToast(TToastType.TX_FAILED, {
        message: ex.message
      });
    }
  };

  const transferEvmToIBC = async (fromAmount: number) => {
    // if (isMobile()) {
    //   displayToast(TToastType.TX_FAILED, {
    //     message: 'Metamask mobile app is not supported yet!',
    //   });
    //   return;
    // }

    await window.ethereum.request!({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: from!.chainId }]
    });

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
      console.log(result);
      processTxResult(
        from,
        result,
        `
      https://bscscan.com/tx/${result?.transactionHash}`
      );
    } catch (ex: any) {
      displayToast(TToastType.TX_FAILED, {
        message: ex.message
      });
    }
  };

  const onClickTransfer = async (
    fromAmount: number,
    from: TokenItemType,
    to: TokenItemType
  ) => {
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
    if (
      from.chainId === KWT_SUBNETWORK_CHAIN_ID &&
      to.chainId === ORAICHAIN_ID &&
      !!from.contractAddress
    ) {
      await convertTransferIBCErc20Kwt(from, to, fromAmount);
    } else if (
      from.chainId === KWT_SUBNETWORK_CHAIN_ID &&
      to.chainId === ORAICHAIN_ID
    ) {
      await transferIBCKwt(from, to, fromAmount);
    } else if (from.cosmosBased) {
      await transferIbcCustom(from, to, fromAmount);
    } else {
      await transferEvmToIBC(fromAmount);
    }
    setIBCLoading(false);
  };

  const convertToken = async (
    amount: number,
    token: TokenItemType,
    type: 'cw20ToNative' | 'nativeToCw20',
    outputToken?: TokenItemType
  ) => {
    if (amount <= 0)
      return displayToast(TToastType.TX_FAILED, {
        message: 'From amount should be higher than 0!'
      });

    displayToast(TToastType.TX_BROADCASTING);
    try {
      const _fromAmount = parseAmountTo(amount, token.decimals).toFixed(0);

      let msgs;
      if (type === 'nativeToCw20') {
        msgs = await generateConvertMsgs({
          type: Type.CONVERT_TOKEN,
          sender: keplrAddress,
          inputAmount: _fromAmount,
          inputToken: token
        });
      } else if (type === 'cw20ToNative') {
        msgs = await generateConvertMsgs({
          type: Type.CONVERT_TOKEN_REVERSE,
          sender: keplrAddress,
          inputAmount: _fromAmount,
          inputToken: token,
          outputToken
        });
      }

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
        console.log(result);
        processTxResult(
          token,
          result as any,
          `${network.explorer}/txs/${result.transactionHash}`
        );
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
    if (from?.chainId === KWT_SUBNETWORK_CHAIN_ID) {
      const name = parseBep20Erc20Name(from.name);
      return toTokens.find((t) => t.name.includes(name));
    }

    return toTokens.find(
      (t) =>
        !from || (from.chainId !== ORAI_BRIDGE_CHAIN_ID && t.name === from.name)
    );
  };

  const convertKwt = async (
    transferAmount: number,
    fromToken: TokenItemType
  ) => {
    try {
      if (transferAmount === 0) throw { message: 'Transfer amount is empty' };
      const keplr = await window.Keplr.getKeplr();
      if (!keplr) return;
      await window.Keplr.suggestChain(fromToken.chainId);
      const fromAddress = await window.Keplr.getKeplrAddr(fromToken.chainId);

      if (!fromAddress) {
        return;
      }

      const amount = coin(
        parseAmountToWithDecimal(transferAmount, fromToken.decimals).toFixed(0),
        fromToken.denom
      );

      let result: BroadcastTxResponse;

      if (!fromToken.contractAddress) {
        result = await KawaiiverseJs.convertCoin({
          sender: fromAddress,
          gasAmount: { amount: '0', denom: KWT },
          coin: amount
        });
      } else {
        result = await KawaiiverseJs.convertERC20({
          sender: fromAddress,
          gasAmount: { amount: '0', denom: KWT },
          amount: amount.amount
        });
      }
      processTxResult(
        fromToken,
        result,
        `https://scan.kawaii.global/tx/${result.transactionHash}`
      );
    } catch (ex: any) {
      console.log(ex);
      displayToast(TToastType.TX_FAILED, {
        message: ex.message
      });
    }
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
                <span className={styles.label}>Other chains</span>
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
                        convertToken={convertToken}
                        onClick={onClickTokenFrom}
                        onClickTransfer={
                          !!to
                            ? (fromAmount: number) =>
                              onClickTransfer(fromAmount, from, to)
                            : undefined
                        }
                        convertKwt={
                          t.chainId === KWT_SUBNETWORK_CHAIN_ID
                            ? convertKwt
                            : undefined
                        }
                        toToken={to}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.transferBtn} />
          <div className={styles.border_gradient}>
            <div className={styles.balance_block}>
              <div className={styles.tableHeader}>
                <span className={styles.label}>Oraichain</span>

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
                    .filter((t) => {
                      if (from?.chainId === KWT_SUBNETWORK_CHAIN_ID) {
                        const name = parseBep20Erc20Name(from.name);
                        return t.name.includes(name);
                      }
                      return (
                        !from ||
                        (from.chainId !== ORAI_BRIDGE_CHAIN_ID &&
                          t.name === from.name)
                      );
                    })
                    .map((t: TokenItemType) => {
                      const name = parseBep20Erc20Name(t.name);
                      const transferToToken = fromTokens.find(
                        (t) =>
                          t.cosmosBased &&
                          t.name.includes(name) &&
                          t.chainId !== ORAI_BRIDGE_CHAIN_ID
                      );

                      return (
                        <TokenItem
                          key={t.denom}
                          amountDetail={amounts[t.denom]}
                          active={to?.denom === t.denom}
                          token={t}
                          onClick={onClickTokenTo}
                          convertToken={convertToken}
                          transferIBC={transferIbcCustom}
                          onClickTransfer={
                            !!transferToToken
                              ? (fromAmount: number) =>
                                onClickTransfer(
                                  fromAmount,
                                  to,
                                  transferToToken
                                )
                              : undefined
                          }
                          toToken={transferToToken}
                        />
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
          {/* End To Tab  */}
        </div>
        {tokenUrl === 'kwt' && <KwtModal />}
      </div>
    </Content>
  );
};

export default Balance;
