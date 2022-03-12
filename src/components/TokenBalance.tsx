import React, { useEffect, useRef } from 'react';
import NumberFormat from 'react-number-format';
import Big from 'big.js';

type Props = {
  balance: {
    amount: string;
    denom: string;
  };
  className?: string;
};

const TokenBalance: React.FC<Props> = ({ balance, className }) => {
  const amount = new Big(balance.amount).div(10 ** 6).toString();

  return (
    <NumberFormat
      className={className}
      value={amount}
      displayType={'text'}
      thousandSeparator={true}
      suffix={` ${balance.denom.toUpperCase()}`}
    />
  );
};

export default TokenBalance;
