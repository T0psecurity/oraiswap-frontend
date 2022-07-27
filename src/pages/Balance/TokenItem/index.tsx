import classNames from 'classnames';
import styles from './index.module.scss';
import _ from 'lodash';
import TokenBalance from 'components/TokenBalance';
import { TokenItemType } from 'config/bridgeTokens';
import TransferConvertToken from '../TransferConvertToken';

type AmountDetail = {
  amount: number;
  usd: number;
};

interface TokenItemProps {
  token: TokenItemType;
  amountDetail?: AmountDetail;
  convertToken?: any;
  transferIBC?: any;
  transferFromGravity?: any;
  name?: string;
  onClickTransfer?: any;
  toToken?: TokenItemType;
  active: Boolean;
  className?: string;
  onClick?: Function;
  onBlur?: Function;
  convertKwt?: any;
}

const TokenItem: React.FC<TokenItemProps> = ({
  token,
  amountDetail,
  active,
  className,
  onClick,
  convertToken,
  transferFromGravity,
  transferIBC,
  onClickTransfer,
  toToken,
  convertKwt,
}) => {
  return (
    <div
      className={classNames(
        styles.tokenWrapper,
        { [styles.active]: active },
        className
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(token);
      }}
    >
      <div className={styles.balanceAmountInfo}>
        <div className={styles.token}>
          {token.Icon && <token.Icon className={styles.tokenIcon} />}
          <div className={styles.tokenInfo}>
            <div className={styles.tokenName}>{token.name}</div>
            <div className={styles.tokenOrg}>
              <span className={styles.tokenOrgTxt}> {token.bridgeNetworkIdentifier ? `${token.org} (${token.bridgeNetworkIdentifier})` : token.org}</span>
            </div>
          </div>
        </div>
        <div className={styles.tokenBalance}>
          <TokenBalance
            balance={{
              amount: amountDetail ? amountDetail.amount.toString() : '0',
              denom: '',
              decimals: token.decimals,
            }}
            className={styles.tokenAmount}
            decimalScale={Math.min(6, token.decimals)}
          />
          <TokenBalance
            balance={amountDetail ? amountDetail.usd : 0}
            className={styles.subLabel}
            decimalScale={2}
          />
        </div>
      </div>
      <div>
        {active && (
          <TransferConvertToken
            token={token}
            amountDetail={amountDetail}
            convertToken={convertToken}
            transferFromGravity={transferFromGravity}
            transferIBC={transferIBC}
            onClickTransfer={onClickTransfer}
            toToken={toToken}
            convertKwt={convertKwt}
          />
        )}

        {/* // TODO: {active && token.contractAddress && token.cosmosBased && (
          <ConvertToNative
            name={evmName}
            token={token}
            amountDetail={amountDetail}
            convertToken={convertToken}
          />
        )} */}
      </div>
    </div>
  );
};

export default TokenItem;
