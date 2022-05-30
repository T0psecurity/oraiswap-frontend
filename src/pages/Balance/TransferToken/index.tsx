import { Input } from 'antd';
import classNames from 'classnames';
import { FC, useState } from 'react';
import styles from './index.module.scss';
import _ from 'lodash';
import TokenBalance from 'components/TokenBalance';
import NumberFormat from 'react-number-format';
import { filteredTokens, TokenItemType } from 'config/bridgeTokens';
import {
  parseAmountFromWithDecimal as parseAmountFrom,
  parseAmountToWithDecimal as parseAmountTo,
} from 'libs/utils';
import Loader from 'components/Loader';

type AmountDetail = {
  amount: number;
  usd: number;
};

interface TransferTokenProps {
  token: TokenItemType;
  amountDetail?: AmountDetail;
  convertToken?: any;
  transferIBC?: any;
  transferFromGravity?: any;
  name?: string;
  onClickTransfer?: any;
}

const TransferToken: FC<TransferTokenProps> = ({
  token,
  amountDetail,
  onClickTransfer,
}) => {
  const [[convertAmount, convertUsd], setConvertAmount] = useState([0, 0]);
  const [transferLoading, setTransferLoading] = useState(false);

  return (
    <div
      className={classNames(styles.tokenFromGroup, styles.small)}
      style={{ flexWrap: 'wrap' }}
    >
      <div
        className={styles.balanceDescription}
        style={{ width: '100%', textAlign: 'left' }}
      >
        Transfer Amount:
      </div>
      <NumberFormat
        thousandSeparator
        decimalScale={Math.min(6, token.decimals)}
        customInput={Input}
        value={convertAmount}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onValueChange={({ floatValue }) => {
          if (!floatValue) return setConvertAmount([0, 0]);

          const _floatValue = parseAmountTo(
            floatValue!,
            token.decimals
          ).toNumber();
          const usdValue =
            (_floatValue / (amountDetail?.amount ?? 0)) *
            (amountDetail?.usd ?? 0);

          setConvertAmount([floatValue!, usdValue]);
        }}
        className={styles.amount}
      />
      <div className={styles.balanceFromGroup} style={{ flexGrow: 1 }}>
        <button
          className={styles.balanceBtn}
          onClick={(event) => {
            event.stopPropagation();
            if (!amountDetail) return;
            const _amount = parseAmountFrom(
              amountDetail.amount,
              token.decimals
            ).toNumber();
            setConvertAmount([_amount, amountDetail.usd]);
          }}
        >
          MAX
        </button>
        <button
          className={styles.balanceBtn}
          onClick={(event) => {
            event.stopPropagation();
            if (!amountDetail) return;
            const _amount = parseAmountFrom(
              amountDetail.amount,
              token.decimals
            ).toNumber();
            setConvertAmount([_amount / 2, amountDetail.usd / 2]);
          }}
        >
          HALF
        </button>
      </div>
      <div>
        <TokenBalance
          balance={convertUsd}
          className={styles.balanceDescription}
          prefix="~$"
          decimalScale={2}
        />
      </div>
      <div
        className={styles.transferTab}
        style={{
          marginTop: '0px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          className={styles.tfBtn}
          disabled={transferLoading}
          onClick={async (event) => {
            event.stopPropagation();
            try {
              setTransferLoading(true);
              await onClickTransfer(convertAmount);
            } finally {
              setTransferLoading(false);
            }
          }}
        >
          {transferLoading && <Loader width={20} height={20} />}
          <span>Transfer</span>
        </button>
      </div>
    </div>
  );
};

export default TransferToken;
