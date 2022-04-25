import React, { FC, memo, useEffect, useState } from 'react';
import styles from './index.module.scss';
import { ReactComponent as Logo } from 'assets/icons/logo.svg';
import { Button, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import Content from 'layouts/Content';
import { mockToken, Pair, pairsMap, PairKey } from 'constants/pools';
import { fetchPairInfo, fetchPoolInfoAmount, fetchTokenInfo } from 'rest/api';
import { useQuery } from 'react-query';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import { filteredTokens } from 'constants/bridgeTokens';
import { getUsd } from 'libs/utils';
import TokenBalance from 'components/TokenBalance';
import _ from 'lodash';
import NewPoolModal from './NewPoolModal/NewPoolModal';
import { Fraction } from '@saberhq/token-utils';

const { Search } = Input;

interface PoolsProps {}

const Header: FC<{ amount: number; oraiPrice: number }> = ({
  amount,
  oraiPrice
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.header_title}>Pools</div>
      <div className={styles.header_data}>
        <div className={styles.header_data_item}>
          <span className={styles.header_data_name}>ORAI Price</span>
          <span className={styles.header_data_value}>
            <TokenBalance
              balance={oraiPrice}
              className={styles.header_data_value}
              decimalScale={2}
            />
          </span>
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
};

const PairBox = memo<PairInfoData>(({ pair, amount, commissionRate }) => {
  const navigate = useNavigate();
  const [token1, token2] = pair.asset_denoms.map((denom) => mockToken[denom]);

  return (
    <div
      className={styles.pairbox}
      onClick={() =>
        navigate(
          `../pool/${token1.name.toLowerCase()}-${token2.name.toLowerCase()}`
          // { replace: true }
        )
      }
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
          <span className={styles.pairbox_pair_apr}>
            APR: 150% + ORAIX Bonus
          </span>
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
      <div className={styles.watchlist_title}></div>
    </div>
  );
});

const ListPools = memo<{
  pairInfos: PairInfoData[];
  setIsOpenNewPoolModal: any;
}>(({ pairInfos, setIsOpenNewPoolModal }) => {
  const [filteredPairInfos, setFilteredPairInfos] = useState<PairInfoData[]>(
    []
  );

  useEffect(() => {
    setFilteredPairInfos(pairInfos);
  }, [pairInfos]);

  const filterPairs = (text: string) => {
    if (!text) {
      return setFilteredPairInfos(pairInfos);
    }
    const searchReg = new RegExp(text, 'i');
    const ret = pairInfos.filter((pairInfo) =>
      pairInfo.pair.asset_denoms.some(
        (denom) => mockToken[denom].name.search(searchReg) !== -1
      )
    );

    setFilteredPairInfos(ret);
  };

  return (
    <div className={styles.listpools}>
      <div className={styles.listpools_title}>All pools</div>
      <div className={styles.listpools_search}>
        <Search
          placeholder='Search by pools or tokens name'
          onSearch={filterPairs}
          style={{
            width: 420,
            background: '#1E1E21',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
        {/* <div
          className={styles.listpools_btn}
          onClick={() => setIsOpenNewPoolModal(true)}
        >
          Create new pool
        </div> */}
      </div>
      <div className={styles.listpools_list}>
        {filteredPairInfos.map((info) => (
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
  fromToken: any;
  toToken: any;
};

const Pools: React.FC<PoolsProps> = () => {
  const [pairInfos, setPairInfos] = useState<PairInfoData[]>([]);
  const [isOpenNewPoolModal, setIsOpenNewPoolModal] = useState(false);
  const [oraiPrice, setOraiPrice] = useState(Fraction.ZERO);

  let _oraiPrice = Fraction.ZERO;
  const fetchPairInfoData = async (pair: Pair): Promise<any> => {
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

    if (
      fromToken.denom == 'orai' &&
      toToken.denom ===
        'ibc/9E4F68298EE0A201969E583100E5F9FAD145BAA900C04ED3B6B302D834D8E3C4'
    ) {
      _oraiPrice = new Fraction(
        poolData.askPoolAmount,
        poolData.offerPoolAmount
      );
    }

    let amount = 0;
    if (fromToken.denom == 'orai') {
      const oraiValue = getUsd(
        poolData.offerPoolAmount,
        _oraiPrice,
        fromToken.decimals
      );
      amount = 2 * oraiValue;
    } else if (toToken.denom == 'orai') {
      const oraiValue = getUsd(
        poolData.askPoolAmount,
        _oraiPrice,
        toToken.decimals
      );
      amount = 2 * oraiValue;
    }
    return {
      ...poolData,
      pair,
      amount,
      commissionRate: infoData.commission_rate,
      fromToken,
      toToken
    };
  };

  const fetchPairInfoDataList = async () => {
    const t = await fetchPairInfoData(pairsMap[PairKey.ORAI_UST]);
    const poolList = await Promise.all(
      Object.keys(pairsMap)
        .filter((k) => k != PairKey.ORAI_UST)
        .map((k) => fetchPairInfoData(pairsMap[k]))
    );
    setPairInfos([...poolList, t]);
    setOraiPrice(_oraiPrice);
  };

  useEffect(() => {
    fetchPairInfoDataList();
  }, []);

  const totalAmount = _.sumBy(pairInfos, (c) => c.amount);

  return (
    <Content nonBackground>
      <div className={styles.pools}>
        <Header amount={totalAmount} oraiPrice={oraiPrice?.asNumber ?? 0} />
        <WatchList />
        <ListPools
          pairInfos={pairInfos}
          setIsOpenNewPoolModal={setIsOpenNewPoolModal}
        />
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
