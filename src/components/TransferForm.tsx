import React, { FC, useState } from 'react';
import classNames from 'classnames';
import Loading from './Loading';
import styles from './TransferForm.module.scss';
import GravityBridgeImage from 'images/gravity-bridge.png';
import EthereumImage from 'images/ethereum.png';
import SvgArrow from 'images/arrow.svg';
import ComboBox from './ComboBox';
import { TokenInfo } from 'types/token';
import Button from './Button';
import Icon from './Icon';

interface Props {
  loading?: boolean;
  size?: number;
  className?: string;
}

interface NetworkItem {
  cosmosBased: boolean;
  name: string;
  chainId: string;
  icon: string;
  rpc: string;
}

const tokens: TokenInfo[] = [
  {
    name: 'aiRight Token',
    symbol: 'AIRI',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11563.png',
    decimals: 16,
    contract_addr: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
    verified: true
  }
];

const networks: NetworkItem[] = [
  {
    cosmosBased: true,
    name: 'Atom',
    chainId: 'Atom',
    rpc: '',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png'
  },
  {
    cosmosBased: true,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/14299.png',
    name: 'Juno',
    chainId: 'Juno',
    rpc: ''
  },
  {
    cosmosBased: true,
    name: 'Osmosis',
    chainId: 'Osmosis',
    rpc: '',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12220.png'
  },
  {
    cosmosBased: false,
    name: 'Ethereum',
    chainId: 'ethereum',
    rpc: '',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
  },
  {
    cosmosBased: false,
    name: 'Binance Smart Chain',
    chainId: 'bsc',
    rpc: '',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
  }
];

const TokenItem: FC<{ name: string; icon: string }> = ({ name, icon }) => {
  return (
    <span className={styles.tokenItem}>
      <img src={icon} />
      {name}
    </span>
  );
};

const TransferForm: FC<Props> = ({ loading, size, className, children }) => {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);

  const onTokenSelect = (item: TokenInfo) => {
    setSelectedToken(item);
  };

  const onNetworkSelect = (item: NetworkItem) => {
    setSelectedNetwork(item);
  };

  return (
    <div className={styles.container}>
      <div className={styles.networks}>
        <div
          className={classNames(
            styles.gravityBridge,
            styles['network-container']
          )}
        >
          <div className={styles['network-container-left']}>
            <p className={styles['network-container-muted']}>From</p>
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
        <button className={styles['toggle-button']}>
          <img src={SvgArrow} alt="toggle" />
        </button>
        <div className={classNames(styles.eth, styles['network-container'])}>
          <div className={styles['network-container-left']}>
            <p className={styles['network-container-muted']}>To</p>
            <p className={styles['network-container-name']}>
              <ComboBox
                className={styles.network}
                headerClass={styles.networkHeader}
                listContainerClass={styles.networkListContainer}
                items={networks}
                selected={selectedNetwork}
                onSelect={onNetworkSelect}
                getId={(item: NetworkItem) => item.chainId}
                getValue={(item: NetworkItem) => (
                  <TokenItem name={item.name} icon={item.icon} />
                )}
              />
            </p>
          </div>
          <div className={styles['network-container-right']}>
            <img
              className={styles['network-container-icon']}
              src={EthereumImage}
              alt="to network"
            />
          </div>
        </div>
      </div>

      <div className={styles.tokenContainer}>
        <ComboBox
          label="Select Token:"
          className={styles.tokens}
          items={tokens}
          selected={selectedToken}
          onSelect={onTokenSelect}
          getId={(item: TokenInfo) => item.symbol}
          getValue={(item: TokenInfo) => (
            <TokenItem name={item.name} icon={item.icon} />
          )}
        />
        <input value="0" className={styles.textAmount} />
      </div>

      <div>
        <p>Withdraw your Orai Bridge token to Oraichain token.</p>
      </div>
      <div>
        <Button>Widthdraw</Button>
      </div>
    </div>
  );
};

export default TransferForm;