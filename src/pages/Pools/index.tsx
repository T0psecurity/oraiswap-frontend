import React, { FC, memo, useEffect, useState } from 'react';
import styles from './index.module.scss';
import { ReactComponent as Logo } from 'assets/icons/logo.svg';
import { Button, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import Content from 'layouts/Content';
import { mockToken, Pair, pairsMap } from 'constants/pools';
import { fetchPairInfo, fetchPoolInfoAmount, fetchTokenInfo } from 'rest/api';
import { useQuery } from 'react-query';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import { filteredTokens } from 'constants/bridgeTokens';
import { getUsd } from 'libs/utils';
import TokenBalance from 'components/TokenBalance';
import _ from 'lodash';
import NewPoolModal from './NewPoolModal/NewPoolModal'

const { Search } = Input;

interface PoolsProps { }

const Header = memo<{ amount: number; oraiPrice: number }>(
  ({ amount, oraiPrice }) => {
    return (
      <div className={styles.header}>
        <div className={styles.header_title}>Pools</div>
        <div className={styles.header_data}>
          <div className={styles.header_data_item}>
            <span className={styles.header_data_name}>ORAI Price</span>
            <span className={styles.header_data_value}>${oraiPrice}</span>
          </div>
          <div className={styles.header_data_item}>
            <span className={styles.header_data_name}>Total Liquidity</span>
            <TokenBalance
              balance={amount}
              className={styles.header_data_value}
              decimalScale={2}
            />
          </div>
        </div>
      </div>
    );
  }
);

const PairBox = memo<PairInfoData>(({ pair, amount, commissionRate }) => {
  const navigate = useNavigate();
  const [token1, token2] = pair.asset_denoms.map((denom) => mockToken[denom]);

  console.log(pair, amount)
  return (
    <div
      className={styles.pairbox}
      onClick={() => navigate('../pool/atom-orai', { replace: true })}
    >
      <div className={styles.pairbox_header}>
        <div className={styles.pairbox_logos}>
          <token1.Icon className={styles.pairbox_logo1} />
          <token2.Icon className={styles.pairbox_logo2} />
        </div>
        <div className={styles.pairbox_pair}>
          <div className={styles.pairbox_pair_name}>
            {token1.name}/{token2.name}
          </div>
          <div className={styles.pairbox_pair_rate}>
            {token1.name} (50%)/{token2.name} (50%)
          </div>
          <span className={styles.pairbox_pair_apr}>APR: 54.32%</span>
        </div>
      </div>
      <div className={styles.pairbox_content}>
        <div className={styles.pairbox_data}>
          <span className={styles.pairbox_data_name}>Swap Fee</span>
          <span className={styles.pairbox_data_value}>
            {100 * parseFloat(commissionRate)}%
          </span>
        </div>
        <div className={styles.pairbox_data}>
          <span className={styles.pairbox_data_name}>Liquidity</span>
          <TokenBalance
            balance={amount}
            className={styles.pairbox_data_value}
            decimalScale={2}
          />
        </div>
      </div>
    </div>
  );
});

const WatchList = memo(() => {
  return (
    <div className={styles.watchlist}>
      <div className={styles.watchlist_title}>Your watchlist</div>
    </div>
  );
});

const ListPools = memo<{ pairInfos: PairInfoData[] }>(({ pairInfos }) => {
  return (
    <div className={styles.listpools}>
      <div className={styles.listpools_title}>All pools</div>
      <div className={styles.listpools_search}>
        <Search
          placeholder="Search by pools or tokens name"
          onSearch={() => { }}
          style={{ width: 420, background: "#1E1E21", borderRadius: '8px', padding: '10px' }}
        />
        <div className={styles.listpools_btn}>Create new pool</div>
      </div>
      <div className={styles.listpools_list}>
        {pairInfos.map((info) => (
          <PairBox {...info} key={info.pair.contract_addr} />
        ))}
      </div>
    </div>
  );
});

type PairInfoData = {
  pair: Pair;
  amount: number;
  commissionRate: string;
};

const Pools: React.FC<PoolsProps> = () => {
  const { prices } = useCoinGeckoPrices(
    filteredTokens.map((t) => t.coingeckoId)
  );
  const [pairInfos, setPairInfos] = useState<PairInfoData[]>([]);
  const [isOpenNewPoolModal, setIsOpenNewPoolModal] = useState(true)

  const fetchPairInfoData = async (pair: Pair): Promise<PairInfoData> => {
    const [fromToken, toToken] = pair.asset_denoms.map(
      (denom) => mockToken[denom]
    );
    const [fromTokenInfoData, toTokenInfoData] = await Promise.all([
      fetchTokenInfo(fromToken),
      fetchTokenInfo(toToken)
    ]);
    const [poolData, infoData] = await Promise.all([
      fetchPoolInfoAmount(fromTokenInfoData, toTokenInfoData),
      fetchPairInfo([fromTokenInfoData, toTokenInfoData])
    ]);

    const fromAmount = getUsd(
      poolData.offerPoolAmount,
      prices[fromToken.coingeckoId].price,
      fromToken.decimals
    );
    const toAmount = getUsd(
      poolData.askPoolAmount,
      prices[toToken.coingeckoId].price,
      toToken.decimals
    );
    return {
      pair,
      amount: fromAmount + toAmount,
      commissionRate: infoData.commission_rate
    };
  };

  const fetchPairInfoDataList = async () => {
    const poolList = await Promise.all(
      Object.values(pairsMap).map(fetchPairInfoData)
    );
    setPairInfos(poolList);
  };
  useEffect(() => {
    fetchPairInfoDataList();
  }, [prices]);

  const totalAmount = _.sumBy(pairInfos, (c) => c.amount);

  return (
    <Content nonBackground>
      <div className={styles.pools}>
        <Header
          amount={totalAmount}
          oraiPrice={prices['oraichain-token'].price?.asNumber ?? 0}
        />
        <WatchList />
        <ListPools pairInfos={pairInfos} />
        <NewPoolModal
          isOpen={isOpenNewPoolModal}
          open={() => setIsOpenNewPoolModal(true)}
          close={() => setIsOpenNewPoolModal(false)}

        />
      </div>
    </Content>
  );
};

export default Pools;
