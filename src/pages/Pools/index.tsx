import React, { memo, useEffect, useState } from 'react';
import styles from './index.module.scss';
import { ReactComponent as Logo } from 'assets/icons/logo.svg';
import { Button, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import Content from 'layouts/Content';
import { fetchPairs } from 'rest/api';

const { Search } = Input;

interface PoolsProps {}

const Header = memo(({}) => {
  return (
    <div className={styles.header}>
      <div className={styles.header_title}>Pools</div>
      <div className={styles.header_data}>
        <div className={styles.header_data_item}>
          <span className={styles.header_data_name}>ORAI Price</span>
          <span className={styles.header_data_value}>$6.45</span>
        </div>
        <div className={styles.header_data_item}>
          <span className={styles.header_data_name}>Total Liquidity</span>
          <span className={styles.header_data_value}>$21,083,915</span>
        </div>
      </div>
    </div>
  );
});

const PairBox = memo(({}) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.pairbox}
      onClick={() => navigate('../pool/atom-orai', { replace: true })}
    >
      <div className={styles.pairbox_header}>
        <div className={styles.pairbox_logo}>
          {
            <Logo
              className={styles.pairbox_logo1}
              style={{ width: 40, height: 40 }}
            />
          }
          {
            <Logo
              className={styles.pairbox_logo2}
              style={{ width: 40, height: 40 }}
            />
          }
        </div>
        <div className={styles.pairbox_pair}>
          <div className={styles.pairbox_pair_name}>ATOM/ORAI</div>
          <div className={styles.pairbox_pair_rate}>ATOM (50%)/ORAI (50%)</div>
          <span className={styles.pairbox_pair_apr}>APR: 54.32%</span>
        </div>
      </div>
      <div className={styles.pairbox_content}>
        <div className={styles.pairbox_data}>
          <span className={styles.pairbox_data_name}>Swap Fee</span>
          <span className={styles.pairbox_data_value}>0.3%</span>
        </div>
        <div className={styles.pairbox_data}>
          <span className={styles.pairbox_data_name}>Liquidity</span>
          <span className={styles.pairbox_data_value}>$5,289,043</span>
        </div>
      </div>
    </div>
  );
});

const WatchList = memo(({}) => {
  return (
    <div className={styles.watchlist}>
      <div className={styles.watchlist_title}>Your watchlist</div>
      <PairBox />
    </div>
  );
});

const ListPools = memo(({}) => {
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    fetchPairs().then((data) => {
      console.log(data);
    });
  });

  return (
    <div className={styles.listpools}>
      <div className={styles.listpools_title}>All pools</div>
      <div className={styles.listpools_search}>
        <Search
          placeholder="Search by pools or tokens name"
          onSearch={() => {}}
          style={{ width: 420 }}
        />
        <Button className={styles.listpools_create + ` primary-btn`}>
          Create a pool
        </Button>
      </div>
      <div className={styles.listpools_list}>
        <PairBox />
        <PairBox />
        <PairBox />
      </div>
      <div className={styles.listpools_list}>
        <PairBox />
        <PairBox />
        <PairBox />
      </div>
    </div>
  );
});
const Pools: React.FC<PoolsProps> = () => {
  return (
    <Content nonBackground={true}>
      <div className={styles.pools}>
        <Header />
        <WatchList />
        <ListPools />
      </div>
    </Content>
  );
};

export default Pools;
