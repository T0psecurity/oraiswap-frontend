import Layout from "layouts/Layout";
import React, { ReactElement, useCallback, useState } from "react";
import styles from "./Balance.module.scss";
import { ReactComponent as Transfer } from "assets/icons/transfer.svg";
import { ReactComponent as ATOMCOSMOS } from "assets/icons/atom_cosmos.svg";
import { ReactComponent as BNB } from "assets/icons/bnb.svg";
import { ReactComponent as ETH } from "assets/icons/eth.svg";
import { ReactComponent as ORAI } from "assets/icons/oraichain.svg";
import { ReactComponent as OSMO } from "assets/icons/osmosis.svg";

interface BalanceProps {}

type TokenItemType = {
  name?: string;
  org?: string;
  icon?: ReactElement;
  active?: Boolean;
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
  amount?: {
    token: number;
    usd: number;
  };
  onClick?: Function;
}

const tokens = [
  {
    name: "ATOM",
    org: "Cosmos Hub",
    amount: {
      token: 123123.45,
      usd: 100003221,
    },
    icon: <ATOMCOSMOS style={{ width: 44, height: 44 }} />,
  },
  {
    name: "ORAI",
    org: "Oraichain",
    amount: {
      token: 123123.45,
      usd: 100003221,
    },
    icon: <ORAI style={{ width: 44, height: 44 }} />,
  },
  {
    name: "ETH",
    org: "Etherium",
    amount: {
      token: 123123.45,
      usd: 100003221,
    },
    icon: <ETH style={{ width: 44, height: 44 }} />,
  },
  {
    name: "BNB",
    org: "Cosmos Hub",
    amount: {
      token: 123123.45,
      usd: 100003221,
    },
    icon: <BNB style={{ width: 44, height: 44 }} />,
  },
  {
    name: "OSMO",
    org: "Cosmos Hub",
    amount: {
      token: 123123.45,
      usd: 100003221,
    },
    icon: <OSMO style={{ width: 44, height: 44 }} />,
  },
];

const TokenItem: React.FC<TokenItemProps> = ({
  name,
  org,
  icon,
  amount,
  active,
  onClick,
}) => {
  return (
    <div
      className={styles.tokenWrapper + (active ? ` ${styles.active}` : "")}
      onClick={() =>
        onClick &&
        onClick({
          name,
          org,
          icon,
          amount,
        })
      }
    >
      <div className={styles.token}>
        {icon ?? <ATOMCOSMOS style={{ width: 44, height: 44 }} />}
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
  const [from, setFrom] = useState<TokenItemType>({});
  const [to, setTo] = useState<TokenItemType>({});

  const onClickTokenFrom = useCallback((token: TokenItemType) => {
    setFrom(token);
  }, []);

  const onClickTokenTo = useCallback((token: TokenItemType) => {
    setTo(token);
  }, []);

  return (
    <Layout>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span className={styles.totalAssets}>Total Assets</span>
          <span className={styles.balance}>$18,039.65</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.transferTab}>
          <div className={styles.from}>
            <div className={styles.tableHeader}>
              <span className={styles.label}>From</span>
              <div className={styles.fromBalanceDes}>
                <div className={styles.balanceFromGroup}>
                  <span className={styles.balanceDescription}>
                    Balance: 11,980.23 ATOM
                  </span>
                  <div className={styles.balanceBtn}>MAX</div>
                  <div className={styles.balanceBtn}>HALF</div>
                </div>
                <span className={styles.balanceDescription}>~$0.00</span>
              </div>
              {from.name ? (
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
                  <input type="number" className={styles.amount} />
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
                      active={from.name === t.name}
                      {...t}
                      onClick={onClickTokenFrom}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className={styles.transferBtn}>
            <Transfer style={{ width: 44, height: 44, alignSelf: "center" }} />
            <div className={styles.tfBtn}>
              <span className={styles.tfTxt}>Transfer</span>
            </div>
          </div>
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
                      active={to.name === t.name}
                      {...t}
                      onClick={onClickTokenTo}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Balance;
