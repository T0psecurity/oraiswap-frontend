import React, { useEffect, useRef } from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import Big from 'big.js';
import { parseBalanceNumber } from 'libs/utils';

type Props = {
  balance:
  | number
  | {
    amount: string | number;
    decimals?: number;
    denom: string;
  };

  className?: string;
} & NumberFormatProps;

const TokenBalance: React.FC<Props> = ({ balance, className, ...props }) => {

  const parseBalance = (balance: | number
    | {
      amount: string | number;
      decimals?: number;
      denom: string;
    }) => {
    if (typeof balance === 'number') return parseBalanceNumber(balance)
    let bigBalance = balance.amount;
    if (typeof balance.amount === 'number') bigBalance = parseBalanceNumber(balance.amount);
    return new Big(bigBalance)
      .div(new Big(10).pow(balance.decimals ?? 6))
      .toNumber();
  }

  const amount = parseBalance(balance);

  return (
    <NumberFormat
      className={className}
      value={amount}
      displayType={'text'}
      thousandSeparator={true}
      decimalScale={0}
      {...(typeof balance === 'number'
        ? { prefix: '$' }
        : { suffix: ` ${balance?.denom.toUpperCase()}` })}
      {...props}
    />
  );
};

export default TokenBalance;
