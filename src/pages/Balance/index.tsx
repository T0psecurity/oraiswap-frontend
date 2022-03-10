import Layout from "layouts/Layout";
import React from "react";
import styles from "./Balance.module.scss";

interface BalanceProps {}

const Balance: React.FC<BalanceProps> = () => {
  return (
    <Layout>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span className={styles.totalAssets}>Total Assets</span>
          <span className={styles.balance}>$18,039.65</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.transferTab}>
          <div className={styles.from}>From</div>
          <div className={styles.transferBtn}>Transfer</div>
          <div className={styles.to}>To</div>
        </div>
      </div>
    </Layout>
  );
};

export default Balance;
