//@ts-nocheck
import React, { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import Loading from './Loading';
import { AbiItem } from 'web3-utils';
import styles from './TransferForm.module.scss';
import GravityBridgeImage from 'images/gravity-bridge.png';
import EthereumImage from 'images/ethereum.png';
import SvgArrow from 'images/arrow.svg';
import ComboBox from './ComboBox';
import { TokenInfo } from 'types/token';
import Button from './Button';
import Icon from './Icon';
import {
  GRAVITY_CONTRACT_ADDRESS,
  ORAI_CONTRACT_ADDRESS
} from 'constants/constants';
import GravityABI from 'constants/abi/gravity.json';
import Erc20ABI from 'constants/abi/erc20.json';
import useLocalStorage from 'libs/useLocalStorage';
import { bridgeNetworks, NetworkItem } from 'constants/networks';
import bridgeTokens from 'constants/bridge-tokens.json';
interface Props {
  loading?: boolean;
  size?: number;
  className?: string;
}

const TokenItem: FC<{ name: string; icon: string }> = ({ name, icon }) => {
  return (
    <div className={styles.tokenItem}>
      <img src={icon} />
      <span>{name}</span>
    </div>
  );
};

const TransferForm: FC<Props> = ({ loading, size, className, children }) => {
  const [metamaskAddress] = useLocalStorage<string>('metamask-address');
  const [selectedNetwork, setSelectedNetwork] = useState(bridgeNetworks[0]);
  const tokens = bridgeTokens[selectedNetwork.chainId];
  const [selectedToken, setSelectedToken] = useState(tokens[0]);

  const [toggle, setToggle] = useState(true);

  const oraiContract = new window.web3.eth.Contract(
    Erc20ABI as AbiItem[],
    ORAI_CONTRACT_ADDRESS
  );

  const gravityContract = new window.web3.eth.Contract(
    GravityABI as AbiItem[],
    GRAVITY_CONTRACT_ADDRESS
  );
  // call lastBatchNonce to query nonce from submitter
  // call sendToCosmos to send token to cosmos, then show the balance

  const onTokenSelect = (item: TokenInfo) => {
    setSelectedToken(item);
  };

  const onNetworkSelect = (item: NetworkItem) => {
    setSelectedNetwork(item);
  };

  const swapNetworks = () => {
    setToggle(!toggle);
  };

  const onAmountChanged = (e: React.ChangeEvent<HTMLInputElement>) => {};

  useEffect(() => {
    const getBalances = async () => {
      const result = await oraiContract.methods
        .balanceOf(metamaskAddress)
        .call();
      const balance = window.web3.utils.fromWei(result);
      console.log(balance);
    };

    getBalances();
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

          <Button>Transfer</Button>
        </div>
      </div>
    </div>
  );
};

export default TransferForm;
