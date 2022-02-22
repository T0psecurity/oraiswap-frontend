//@ts-nocheck
import React, { FC, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Loading from './Loading';
import { AbiItem } from 'web3-utils';
import styles from './TransferForm.module.scss';
import GravityBridgeImage from 'images/gravity-bridge.png';
import SvgArrow from 'images/arrow.svg';
import ComboBox from './ComboBox';
import { TokenInfo } from 'types/token';
import Button from './Button';
import { GRAVITY_CONTRACT_ADDRESS } from 'constants/constants';
import ibcInfos from 'constants/ibc.json';
import GravityABI from 'constants/abi/gravity.json';
import Erc20ABI from 'constants/abi/erc20.json';
import useLocalStorage from 'libs/useLocalStorage';
import { SigningStargateClient } from '@cosmjs/stargate';
import { MsgSendToEth } from 'libs/proto/gravity/v1/msgs';
import {
  bridgeNetworks,
  NetworkItem,
  oraiBridgeNetwork
} from 'constants/networks';
import gravityRegistry from 'libs/gravity-registry';
import bridgeTokens from 'constants/bridge-tokens.json';
import { coin } from '@cosmjs/proto-signing';
import { IBCInfo } from 'types/ibc';

const TokenItem: FC<{ name: string; icon: string }> = ({ name, icon }) => {
  return (
    <div title={name} className={styles.tokenItem}>
      <img alt={icon} src={icon} />
      <span>{name}</span>
    </div>
  );
};

const TransferForm = () => {
  const [metamaskAddress] = useLocalStorage<string>('metamask-address');
  const [keplrAddress] = useLocalStorage<string>('address');
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState(bridgeNetworks[0]);
  let [sourceNetwork, destNetwork] = [selectedNetwork, oraiBridgeNetwork];
  if (!toggle) {
    [sourceNetwork, destNetwork] = [destNetwork, sourceNetwork];
  }
  const tokens = bridgeTokens[sourceNetwork.chainId][destNetwork.chainId];

  const [selectedToken, setSelectedToken] = useState<TokenInfo>(tokens[0]);

  const onTokenSelect = (item: TokenInfo) => {
    setSelectedToken(item);
  };

  const onNetworkSelect = (item: NetworkItem) => {
    setSelectedNetwork(item);
  };

  const swapNetworks = () => {
    setToggle(!toggle);
  };

  const inputAmountRef = useRef();
  const onAmountChanged = (e: React.ChangeEvent<HTMLInputElement>) => {};

  const transferFromGravity = async (amountVal: string) => {
    await window.keplr.enable(sourceNetwork.chainId);
    const rawAmount = Math.round(
      parseFloat(amountVal) * 10 ** selectedToken.decimals
    ).toString();

    const offlineSigner = window.getOfflineSigner(sourceNetwork.chainId);
    // Initialize the gaia api with the offline signer that is injected by Keplr extension.
    const client = await SigningStargateClient.connectWithSigner(
      sourceNetwork.rpc,
      offlineSigner,
      { registry: gravityRegistry }
    );

    const message = {
      typeUrl: '/gravity.v1.MsgSendToEth',
      value: MsgSendToEth.fromPartial({
        sender: keplrAddress,
        ethDest: metamaskAddress,
        amount: {
          denom: selectedToken.contract_addr,
          amount: rawAmount
        },
        bridgeFee: {
          denom: selectedToken.contract_addr,
          // just a number to make sure there is a friction
          amount: '50000000000'
        }
      })
    };
    const fee = {
      amount: [],
      gas: '200000'
    };
    const result = await client.signAndBroadcast(keplrAddress, [message], fee);
    return result;
  };

  const transferToGravity = async (amountVal: string) => {
    const balance = window.web3.utils.toWei(amountVal);
    const tokenContract = selectedToken.contract_addr;
    const gravityContract = new window.web3.eth.Contract(
      GravityABI as AbiItem[],
      GRAVITY_CONTRACT_ADDRESS
    );
    const result = await gravityContract.methods
      .sendToCosmos(tokenContract, keplrAddress, balance)
      .send({
        from: metamaskAddress
      });
    return result;
  };

  // such as Oraichain to Gravity
  const transferIBC = async (amountVal: string) => {
    await window.keplr.enable(sourceNetwork.chainId);
    const amount = coin(
      Math.round(parseFloat(amountVal) * 10 ** selectedToken.decimals),
      selectedToken.contract_addr
    );
    const offlineSigner = window.getOfflineSigner(sourceNetwork.chainId);
    // Initialize the gaia api with the offline signer that is injected by Keplr extension.
    const client = await SigningStargateClient.connectWithSigner(
      sourceNetwork.rpc,
      offlineSigner
    );
    const ibcInfo: IBCInfo =
      ibcInfos[sourceNetwork.chainId][destNetwork.chainId];

    const result = await client.sendIbcTokens(
      keplrAddress,
      keplrAddress,
      amount,
      ibcInfo.source,
      ibcInfo.channel,
      undefined,
      (Date.now() + ibcInfo.timeout * 1000) * 10 ** 6
    );

    return result;
  };

  // do bridge transfer based on conditions
  const bridgeTransfer = async () => {
    const amountVal = inputAmountRef.current.value.trim();
    if (!amountVal) return;

    try {
      let result;
      setLoading(true);

      // from bridge

      // transfer with IBC
      if (selectedNetwork.cosmosBased) {
        // transfer to ibc
        result = await transferIBC(amountVal);
      } else {
        // transfer gravity from bridge
        if (toggle) {
          // transfer to bridge from evm based
          result = await transferToGravity(amountVal);
        } else {
          // transfer to evm based from bridge
          result = await transferFromGravity(amountVal);
        }
      }

      console.log(result);
      setLoading(false);
    } catch (ex) {
      alert(ex.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // const getBalances = async () => {
    //   const result = await oraiContract.methods
    //     .balanceOf(metamaskAddress)
    //     .call();
    //   const balance = window.web3.utils.fromWei(result);
    // };
    // getBalances();
    setSelectedToken(tokens[0]);
  }, [tokens]);

  return (
    <div className={styles.container}>
      <div className={toggle ? styles.networksReversed : styles.networks}>
        <div className={classNames(styles['network-container'])}>
          <div className={styles['network-container-left']}>
            <p className={styles['network-container-name']}>Orai Bridge</p>
          </div>
          <div className={styles['network-container-right']}>
            <img
              className={styles['network-container-icon']}
              src={GravityBridgeImage}
              alt="from network"
            />
          </div>
        </div>
        <button
          type="button"
          className={styles['toggle-button']}
          onClick={swapNetworks}
        >
          <img src={SvgArrow} alt="toggle" />
        </button>
        <div className={classNames(styles['network-container'])}>
          <div className={styles['network-container-left']}>
            <div className={styles['network-container-name']}>
              <ComboBox
                className={styles.network}
                headerClass={styles.networkHeader}
                listContainerClass={styles.networkListContainer}
                items={bridgeNetworks}
                selected={selectedNetwork}
                onSelect={onNetworkSelect}
                getId={(item: NetworkItem) => item.chainId}
                getValue={(item: NetworkItem) => (
                  <TokenItem name={item.name} icon={item.icon} />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tokenContainer}>
        <input
          placeholder="0.000000"
          step="0.000001"
          type="number"
          className={styles.textAmount}
          ref={inputAmountRef}
          onChange={onAmountChanged}
        />
        <div>
          <ComboBox
            className={styles.tokens}
            items={tokens}
            selected={selectedToken}
            onSelect={onTokenSelect}
            getId={(item: TokenInfo) => item.symbol}
            getValue={(item: TokenInfo) => (
              <TokenItem name={item.name} icon={item.icon} />
            )}
          />

          {loading ? (
            <Loading className={styles.loading} />
          ) : (
            <Button type="button" onClick={bridgeTransfer}>
              Transfer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferForm;
