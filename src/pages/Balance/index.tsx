import Layout from 'layouts/Layout';
import { Input } from 'antd';
import classNames from 'classnames';
import React, { ReactElement, useCallback, useState } from 'react';
import { coin } from '@cosmjs/proto-signing';
import { IBCInfo } from 'types/ibc';
import styles from './Balance.module.scss';
import { ReactComponent as Transfer } from 'assets/icons/transfer.svg';
import { ReactComponent as ATOMCOSMOS } from 'assets/icons/atom_cosmos.svg';
import { ReactComponent as BNB } from 'assets/icons/bnb.svg';
import { ReactComponent as ETH } from 'assets/icons/eth.svg';
import { ReactComponent as ORAI } from 'assets/icons/oraichain.svg';
import { ReactComponent as OSMO } from 'assets/icons/osmosis.svg';
import { SigningStargateClient } from '@cosmjs/stargate';
import useLocalStorage from 'libs/useLocalStorage';
import { displayToast, TToastType } from 'components/Toasts/Toast';

interface IBCInfoMap {
  [key: string]: { [key: string]: IBCInfo };
}

const ibcInfos: IBCInfoMap = {
  'gravity-test': {
    'Oraichain-testnet': {
      source: 'transfer',
      channel: 'channel-0',
      timeout: 60
    }
  },
  'Oraichain-testnet': {
    'gravity-test': {
      source: 'transfer',
      channel: 'channel-1',
      timeout: 60
    }
  }
};

interface BalanceProps {}

type TokenItemType = {
  name?: string;
  org?: string;
  icon?: ReactElement;
  active?: Boolean;
  chainId: string;
  rpc: string;
  decimals: number;
  contract_addr: string;
  amount?: {
    token: number;
    usd: number;
  };
};
interface TokenItemProps {
  name?: string;
  org?: string;
  icon?: ReactElement;
  active?: Boolean;
  className?: string;
  amount?: {
    token: number;
    usd: number;
  };
  onClick?: Function;
}

const tokens: TokenItemType[] = [
  {
    name: 'ATOM',
    org: 'Cosmos Hub',
    amount: {
      token: 123123.45,
      usd: 100003221
    },
    decimals: 6,
    contract_addr: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
    chainId: 'cosmoshub',
    rpc: 'http://125.212.192.225:26657',
    icon: <ATOMCOSMOS className={styles.tokenIcon} />
  },
  {
    name: 'ORAI',
    org: 'Oraichain',
    amount: {
      token: 123123.45,
      usd: 100003221
    },
    contract_addr: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
    decimals: 6,
    chainId: 'Oraichain',
    rpc: 'http://125.212.192.225:26657',
    icon: <ORAI className={styles.tokenIcon} />
  },
  {
    name: 'ETH',
    org: 'Etherium',
    amount: {
      token: 123123.45,
      usd: 100003221
    },
    contract_addr: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
    decimals: 6,
    chainId: 'ethereum',
    rpc: 'http://125.212.192.225:26657',
    icon: <ETH className={styles.tokenIcon} />
  },
  {
    name: 'BNB',
    org: 'Cosmos Hub',
    chainId: 'bnb',
    rpc: 'http://125.212.192.225:26657',
    decimals: 6,
    contract_addr: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
    amount: {
      token: 123123.45,
      usd: 100003221
    },
    icon: <BNB className={styles.tokenIcon} />
  },
  {
    name: 'OSMO',
    org: 'Cosmos Hub',
    chainId: 'osmosis-1',
    rpc: 'http://125.212.192.225:26657',
    decimals: 6,
    contract_addr: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
    amount: {
      token: 123123.45,
      usd: 100003221
    },
    icon: <OSMO className={styles.tokenIcon} />
  }
];

const TokenItem: React.FC<TokenItemProps> = ({
  name,
  org,
  icon,
  amount,
  active,
  className,
  onClick
}) => {
  return (
    <div
      className={classNames(
        styles.tokenWrapper,
        { [styles.active]: active },
        className
      )}
      onClick={() =>
        onClick &&
        onClick({
          name,
          org,
          icon,
          amount
        })
      }
    >
      <div className={styles.token}>
        {icon ?? <ATOMCOSMOS className={styles.tokenIcon} />}
        <div className={styles.tokenInfo}>
          <div className={styles.tokenName}>{name}</div>
          <div className={styles.tokenOrg}>
            <span className={styles.tokenOrgTxt}>{org}</span>
          </div>
        </div>
      </div>
      <div className={styles.tokenBalance}>
        <div className={styles.tokenAmount}>{amount?.token}</div>
        <div className={styles.subLabel}>${amount?.usd}</div>
      </div>
    </div>
  );
};

const Balance: React.FC<BalanceProps> = () => {
  const [keplrAddress] = useLocalStorage<string>('address');
  const [from, setFrom] = useState<TokenItemType>();
  const [to, setTo] = useState<TokenItemType>();
  const [fromAmount, setFromAmount] = useState<string>('0');

  const onClickToken = useCallback((type: string, token: TokenItemType) => {
    if (type === 'to') {
      setTo(token);
    } else {
      setFrom(token);
    }
  }, []);

  const onClickTokenFrom = useCallback(
    (token: TokenItemType) => {
      onClickToken('from', token);
    },
    [onClickToken]
  );

  const onClickTokenTo = useCallback(
    (token: TokenItemType) => {
      onClickToken('to', token);
    },
    [onClickToken]
  );

  const transferIBC = async () => {
    if (!from || !to) {
      displayToast(TToastType.TX_FAILED, {
        message: 'Please choose both from and to tokens'
      });
      return;
    }
    await window.Keplr.suggestChain(from.chainId);
    const amount = coin(
      Math.round(parseFloat(fromAmount) * 10 ** from.decimals),
      from.contract_addr
    );
    const offlineSigner = window.keplr.getOfflineSigner(from.chainId);
    // Initialize the gaia api with the offline signer that is injected by Keplr extension.
    const client = await SigningStargateClient.connectWithSigner(
      from.rpc,
      offlineSigner
    );
    const ibcInfo: IBCInfo = ibcInfos[from.chainId][to.chainId];

    const result = await client.sendIbcTokens(
      keplrAddress,
      keplrAddress,
      amount,
      ibcInfo.source,
      ibcInfo.channel,
      undefined,
      Math.floor(Date.now() / 1000) + 60,
      {
        gas: '200000',
        amount: []
      }
    );

    return result;
  };

  return (
    <Layout>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span className={styles.totalAssets}>Total Assets</span>
          <span className={styles.balance}>$18,039.65</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.transferTab}>
          {/* From Tab */}
          <div className={styles.from}>
            <div className={styles.tableHeader}>
              <span className={styles.label}>From</span>
              <div className={styles.fromBalanceDes}>
                <div className={styles.balanceFromGroup}>
                  <span className={styles.balanceDescription}>
                    Balance: 11,980.23 ATOM
                  </span>
                  <div
                    className={styles.balanceBtn}
                    onClick={() => {
                      setFromAmount(`${from?.amount?.token}` ?? '0');
                    }}
                  >
                    MAX
                  </div>
                  <div
                    className={styles.balanceBtn}
                    onClick={() => {
                      setFromAmount(
                        (from?.amount && `${from?.amount?.token / 2}`) ?? '0'
                      );
                    }}
                  >
                    HALF
                  </div>
                </div>
                <span className={styles.balanceDescription}>~$0.00</span>
              </div>
              {from?.name ? (
                <div className={styles.tokenFromGroup}>
                  <div className={styles.token}>
                    {from.icon}
                    <div className={styles.tokenInfo}>
                      <div className={styles.tokenName}>{from.name}</div>
                      <div className={styles.tokenOrg}>
                        <span className={styles.tokenOrgTxt}>{from.org}</span>
                      </div>
                    </div>
                  </div>
                  <Input
                    type="number"
                    defaultValue={fromAmount}
                    value={fromAmount}
                    onChange={(e) => {
                      setFromAmount(e.target.value);
                    }}
                    className={styles.amount}
                  />
                </div>
              ) : null}
            </div>
            <div className={styles.table}>
              <div className={styles.tableDes}>
                <span className={styles.subLabel}>Available assets</span>
                <span className={styles.subLabel}>Balance</span>
              </div>
              <div className={styles.tableContent}>
                {tokens.map((t: TokenItemType) => {
                  return (
                    <TokenItem
                      key={t.chainId}
                      className={styles.token_from}
                      active={from?.name === t.name}
                      {...t}
                      onClick={onClickTokenFrom}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          {/* End from tab */}
          {/* Transfer button */}
          <div className={styles.transferBtn} onClick={transferIBC}>
            <Transfer style={{ width: 44, height: 44, alignSelf: 'center' }} />
            <div className={styles.tfBtn}>
              <span className={styles.tfTxt}>Transfer</span>
            </div>
          </div>
          {/* End Transfer button */}
          {/* To Tab */}
          <div className={styles.to}>
            <div className={styles.tableHeader}>
              <span className={styles.label}>To</span>
              <span className={styles.balanceDescription}>
                Balance: 11,980.23 ATOM
              </span>
              {to ? (
                <div className={styles.token}>
                  {to.icon}
                  <div className={styles.tokenInfo}>
                    <div className={styles.tokenName}>{to.name}</div>
                    <div className={styles.tokenOrg}>
                      <span className={styles.tokenOrgTxt}>{to.org}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className={styles.table}>
              <div className={styles.tableDes}>
                <span className={styles.subLabel}>Available assets</span>
                <span className={styles.subLabel}>Balance</span>
              </div>
              <div className={styles.tableContent}>
                {tokens.map((t: TokenItemType) => {
                  return (
                    <TokenItem
                      key={t.chainId}
                      active={to?.name === t.name}
                      {...t}
                      onClick={onClickTokenTo}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          {/* End To Tab  */}
        </div>
      </div>
    </Layout>
  );
};

export default Balance;
