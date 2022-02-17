import React, { FC } from 'react';
import classNames from 'classnames';
import Loading from './Loading';
import styles from './TransferForm.module.scss';
import GravityBridgeImage from 'images/gravity-bridge.png';
import EthereumImage from 'images/ethereum.png';
import SvgArrow from 'images/arrow.svg';

interface Props {
  loading?: boolean;
  size?: number;
  className?: string;
}

const TransferForm: FC<Props> = ({ loading, size, className, children }) => (
  <div className={styles.container}>
    <div
      className={classNames(styles.gravityBridge, styles['network-container'])}
    >
      <div className={styles['network-container-left']}>
        <p className={styles['network-container-muted']}>From</p>
        <p className={styles['network-container-name']}>Gravity Bridge</p>
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
        <p className={styles['network-container-name']}>Ethereum</p>
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
);

export default TransferForm;
