import React, { useEffect, useRef } from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import Big from 'big.js';

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
  const amount =
    typeof balance === 'number'
      ? balance
      : new Big(balance.amount ?? 0)
          .div(new Big(10).pow(balance.decimals ?? 6))
          .toNumber();

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
