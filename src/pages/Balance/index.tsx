import Layout from "layouts/Layout";
import React, { ReactElement } from "react";
import styles from "./Balance.module.scss";
import { ReactComponent as Transfer } from "assets/icons/transfer.svg";
import { ReactComponent as ATOMCOSMOS } from "assets/icons/atom_cosmos.svg";

interface BalanceProps {}

const Balance: React.FC<BalanceProps> = () => {
  const renderToken = ({
    name,
    org,
    icon,
    amount,
    active,
  }: {
    name?: string;
    org?: string;
    icon?: ReactElement;
    active?: Boolean;
    amount?: {
      token: string;
      usd: string;
    };
  }) => {
    return (
      <div
        className={styles.tokenWrapper + (active ? ` ${styles.active}` : "")}
      >
        <div className={styles.token}>
          <ATOMCOSMOS style={{ width: 44, height: 44 }} />
          <div className={styles.tokenInfo}>
            <div className={styles.tokenName}>ATOM</div>
            <div className={styles.tokenOrg}>
              <span className={styles.tokenOrgTxt}>Oraichain</span>
            </div>
          </div>
        </div>
        <div className={styles.tokenBalance}>
          <div className={styles.tokenAmount}>1,280.45</div>
          <div className={styles.subLabel}>$2,359.12</div>
        </div>
      </div>
    );
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
          <div className={styles.from}>
            <div className={styles.tableHeader}>
              <span className={styles.label}>From</span>
              <span className={styles.balanceDescription}>
                Balance: 11,980.23 ATOM
              </span>
              <div className={styles.token}>
                <ATOMCOSMOS style={{ width: 44, height: 44 }} />
                <div className={styles.tokenInfo}>
                  <div className={styles.tokenName}>ATOM</div>
                  <div className={styles.tokenOrg}>
                    <span className={styles.tokenOrgTxt}>Oraichain</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.table}>
              <div className={styles.tableDes}>
                <span className={styles.subLabel}>Available assets</span>
                <span className={styles.subLabel}>Balance</span>
              </div>
              <div className={styles.tableContent}>
                {renderToken({ active: true })}
                {renderToken({})}
                {renderToken({})}
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
              <div className={styles.token}>
                <ATOMCOSMOS style={{ width: 44, height: 44 }} />
                <div className={styles.tokenInfo}>
                  <div className={styles.tokenName}>ATOM</div>
                  <div className={styles.tokenOrg}>
                    <span className={styles.tokenOrgTxt}>Oraichain</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.table}>
              <div className={styles.tableDes}>
                <span className={styles.subLabel}>Available assets</span>
                <span className={styles.subLabel}>Balance</span>
              </div>
              <div className={styles.tableContent}>
                {renderToken({})}
                {renderToken({ active: true })}
                {renderToken({})}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Balance;
