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
import GravityABI from 'constants/abi/gravity.json';
import Erc20ABI from 'constants/abi/erc20.json';
import useLocalStorage from 'libs/useLocalStorage';
import { bridgeNetworks, NetworkItem } from 'constants/networks';
import bridgeTokens from 'constants/bridge-tokens.json';

const TokenItem: FC<{ name: string; icon: string }> = ({ name, icon }) => {
  return (
    <div className={styles.tokenItem}>
      <img src={icon} />
      <span>{name}</span>
    </div>
  );
};

const TransferForm = () => {
  const [metamaskAddress] = useLocalStorage<string>('metamask-address');
  const [keplrAddress] = useLocalStorage<string>('address');
  const [loading, setLoading] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(bridgeNetworks[0]);
  const tokens = bridgeTokens[selectedNetwork.chainId];
  const [selectedToken, setSelectedToken] = useState<TokenInfo>(tokens[0]);

  const [toggle, setToggle] = useState(true);

  // call sendToCosmos(tokenContract,destination,amount) to send token to cosmos, then show the balance

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

  const bridgeTransfer = async () => {
    const amountVal = inputAmountRef.current.value.trim();
    if (!amountVal) return;
    if (selectedNetwork.cosmosBased || !toggle) {
      alert('Currently supporte transfering from Ethereum to cosmos');
      return;
    }

    try {
      const balance = window.web3.utils.toWei(amountVal);
      const tokenContract = selectedToken.contract_addr;
      const gravityContract = new window.web3.eth.Contract(
        GravityABI as AbiItem[],
        GRAVITY_CONTRACT_ADDRESS
      );

      setLoading(true);
      const result = await gravityContract.methods
        .sendToCosmos(
          tokenContract,
          window.web3.utils.toHex(keplrAddress),
          balance
        )
        .send({
          from: metamaskAddress
        });
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
  }, []);

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
