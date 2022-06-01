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
import {
  KWT_SUBNETWORK_CHAIN_ID,
  ORAI_BRIDGE_CHAIN_ID,
} from 'config/constants';

type AmountDetail = {
  amount: number;
  usd: number;
};

interface ConvertToNativeProps {
  token: TokenItemType;
  amountDetail?: AmountDetail;
  convertToken?: any;
  transferIBC?: any;
  transferFromGravity?: any;
  name?: string;
  convertKwt?: any;
}

const ConvertToken: FC<ConvertToNativeProps> = ({
  token,
  name,
  amountDetail,
  convertToken,
  transferIBC,
  transferFromGravity,
  convertKwt,
}) => {
  const [[convertAmount, convertUsd], setConvertAmount] = useState([0, 0]);
  const [convertLoading, setConvertLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  const evmTokenOnOrai = filteredTokens.find(
    (t) =>
      t.cosmosBased &&
      (t.name === `ERC20 ${token.name}` || t.name === `BEP20 ${token.name}`) &&
      t.chainId !== ORAI_BRIDGE_CHAIN_ID
  );

  if (!name && !evmTokenOnOrai && token.chainId !== KWT_SUBNETWORK_CHAIN_ID)
    return <></>;
  return (
    <div
      className={classNames(styles.tokenFromGroup, styles.small)}
      style={{ flexWrap: 'wrap' }}
    >
      <div
        className={styles.balanceDescription}
        style={{ width: '100%', textAlign: 'left' }}
      >
        Convert Amount:
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
        {(() => {
          if (token.chainId === KWT_SUBNETWORK_CHAIN_ID) {
            return (
              <>
                <button
                  className={styles.tfBtn}
                  disabled={transferLoading}
                  onClick={async (event) => {
                    event.stopPropagation();
                    try {
                      setTransferLoading(true);
                      await convertKwt();
                    } finally {
                      setTransferLoading(false);
                    }
                  }}
                >
                  {transferLoading && <Loader width={20} height={20} />}
                  <span>Convert KWT</span>
                </button>
              </>
            );
          }

          if (token.chainId === ORAI_BRIDGE_CHAIN_ID) {
            return (
              <>
                <button
                  className={styles.tfBtn}
                  disabled={transferLoading}
                  onClick={async (event) => {
                    event.stopPropagation();
                    try {
                      setTransferLoading(true);
                      await transferFromGravity(token, convertAmount);
                    } finally {
                      setTransferLoading(false);
                    }
                  }}
                >
                  {transferLoading && <Loader width={20} height={20} />}
                  <span>
                    Transfer To{' '}
                    <strong>
                      {token.name.match(/BEP20/)
                        ? 'Binance Smart Chain'
                        : 'Ethereum'}
                    </strong>
                  </span>
                </button>
                <small
                  style={{
                    backgroundColor: '#C69A24',
                    color: '#95452d',
                    padding: '0px 3px',
                    borderRadius: 3,
                  }}
                >
                  Congested
                </small>
              </>
            );
          }

          return (
            <>
              {token.chainId !== ORAI_BRIDGE_CHAIN_ID &&
                (name || !!evmTokenOnOrai) && (
                  <button
                    className={styles.tfBtn}
                    disabled={convertLoading}
                    onClick={async (event) => {
                      event.stopPropagation();
                      try {
                        setConvertLoading(true);
                        if (!name)
                          await convertToken(
                            convertAmount,
                            token,
                            'cw20ToNative',
                            evmTokenOnOrai
                          );
                        else
                          await convertToken(
                            convertAmount,
                            token,
                            'nativeToCw20'
                          );
                      } finally {
                        setConvertLoading(false);
                      }
                    }}
                  >
                    {convertLoading && <Loader width={20} height={20} />}
                    <span>
                      Convert To{' '}
                      <strong style={{ marginLeft: 5 }}>
                        {name ?? evmTokenOnOrai.name}
                      </strong>
                    </span>
                  </button>
                )}

              {token.chainId !== ORAI_BRIDGE_CHAIN_ID && name && (
                <button
                  disabled={transferLoading}
                  className={styles.tfBtn}
                  onClick={async (event) => {
                    event.stopPropagation();
                    try {
                      setTransferLoading(true);
                      const to = filteredTokens.find(
                        (t) =>
                          t.chainId === ORAI_BRIDGE_CHAIN_ID &&
                          t.name === token.name
                      );
                      await transferIBC(token, to, convertAmount);
                    } finally {
                      setTransferLoading(false);
                    }
                  }}
                >
                  {transferLoading && <Loader width={20} height={20} />}
                  <span>
                    Transfer To <strong>OraiBridge</strong>
                  </span>
                </button>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};
export default ConvertToken;
