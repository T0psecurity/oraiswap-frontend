import React from 'react';
import { truncate } from '../libs/text';

import ExtLink from '../components/ExtLink';
import styles from './SwapTxHash.module.scss';
import { network } from 'constants/networks';

const TxHash = ({ children: hash }: { children: string }) => {
  return (
    <ExtLink href={`${network.lcd}/cosmos/tx/v1beta1/txs/${hash}`} className={styles.link}>
      {truncate(hash, [8, 8])}
    </ExtLink>
  );
};

export default TxHash;
