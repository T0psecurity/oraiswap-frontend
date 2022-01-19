import React from 'react';
import { truncate } from '../libs/text';

import ExtLink from '../components/ExtLink';
import styles from './SwapTxHash.module.scss';

const TxHash = ({ children: hash }: { children: string }) => {
  return (
    <ExtLink href={'finder(hash, "tx")'} className={styles.link}>
      {truncate(hash, [8, 8])}
    </ExtLink>
  );
};

export default TxHash;
