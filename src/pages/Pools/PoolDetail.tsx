import Layout from 'layouts/Layout';
import React, { memo, useState } from 'react';
import styles from './index.module.scss';
import { ReactComponent as Logo } from 'assets/icons/logo.svg';
import { Button, Input } from 'antd';
import style from './PoolDetail.module.scss';
import cn from 'classnames/bind';
import { useParams } from 'react-router-dom';
import LiquidityModal from './LiquidityModal/LiquidityModal';

const cx = cn.bind(style);

const mockPair = {
  'ORAI-AIRI': {
    contractAddress: 'orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v',
    amount1: 100,
    amount2: 1000,
  },
  'AIRI-ATOM': {
    contractAddress: 'orai16wvac5gxlxqtrhhcsa608zh5uh2zltuzjyhmwh',
    amount1: 100,
    amount2: 1000,
  },
  'ORAI-TEST2': {
    contractAddress: 'orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v',
    amount1: 100,
    amount2: 1000,
  },
  'AIRI-TEST2': {
    contractAddress: 'orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v',
    amount1: 100,
    amount2: 1000,
  },
  'ATOM-ORAI': {
    contractAddress: 'orai16wvac5gxlxqtrhhcsa608zh5uh2zltuzjyhmwh',
    amount1: 100,
    amount2: 1000,
  },
};

const mockToken = {
  ORAI: {
    contractAddress: 'orai',
    denom: 'orai',
    logo: 'oraichain.svg',
  },
  AIRI: {
    contractAddress: 'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2',
    logo: 'airi.svg',
  },
  ATOM: {
    contractAddress: 'orai15e5250pu72f4cq6hfe0hf4rph8wjvf4hjg7uwf',
    logo: 'atom.svg',
  },
  TEST2: {
    contractAddress: 'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2',
    logo: 'atom.svg',
  },
};

const mockBalance = {
  ORAI: 800000,
  AIRI: 80000.09,
  ATOM: 50000.09,
  TEST1: 8000.122,
  TEST2: 800.3434,
};

const mockPrice = {
  ORAI: 5.01,
  AIRI: 0.89,
  TEST1: 1,
  TEST2: 1,
};

type TokenName = keyof typeof mockToken;
type PairName = keyof typeof mockPair;

interface ValidToken {
  title: TokenName;
  balance: number;
  contractAddress: string;
  logo: string;
}

interface PoolDetailProps {}

const PoolDetail: React.FC<PoolDetailProps> = () => {
  let { namePool } = useParams();
  namePool = namePool?.toUpperCase();
  let token1, token2;
  {
    let [_token1, _token2] = namePool?.split('-') ?? [undefined, undefined];
    token1 = _token1 as TokenName;
    token2 = _token2 as TokenName;
  }
  const [isOpenLiquidityModal, setIsOpenLiquidityModal] = useState(false);

  return (
    <Layout nonBackground={true}>
      {!!namePool && namePool! in mockPair ? (
        <>
          <div className={cx('pool-detail')}>
            <div className={cx('header')}>
              <div className={cx('logo')}>
                <img
                  className={cx('token1')}
                  src={
                    require(`assets/icons/${mockToken[token1].logo}`).default
                  }
                />
                <img
                  className={cx('token2')}
                  src={
                    require(`assets/icons/${mockToken[token2].logo}`).default
                  }
                />
              </div>
              <div className={cx('title')}>
                <div className={cx('name')}>{`${token1}/${token2}`}</div>
                <div className={cx('value')}>$5,289,043</div>
              </div>
              <div className={cx('des')}>1 ATOM ≈ 4.85 ORAI</div>
              <div className={cx('btn', 'swap')}>Quick Swap</div>
              <div
                className={cx('btn', 'liquidity')}
                onClick={() => setIsOpenLiquidityModal(true)}
              >
                Add/Remove Liquidity
              </div>
            </div>
            <div className={cx('info')}>
              <div className={cx('container')}>
                <div className={cx('title')}>Total Amount</div>
                <div className={cx('row')}>
                  <img
                    className={cx('logo')}
                    src={
                      require(`assets/icons/${mockToken[token1].logo}`).default
                    }
                  />
                  <div>{token1}</div>
                  <div className={cx('amount')}>
                    <div>103,980.23</div>
                    <div className={cx('value')}>$2,644,521</div>
                  </div>
                </div>
                <div className={cx('row')}>
                  <img
                    className={cx('logo')}
                    src={
                      require(`assets/icons/${mockToken[token2].logo}`).default
                    }
                  />
                  <div>{token2}</div>
                  <div className={cx('amount')}>
                    <div>103,980.23</div>
                    <div className={cx('value')}>$2,644,521</div>
                  </div>
                </div>
              </div>
              <div className={cx('container')}>
                <div className={cx('title')}>Total Amount</div>
                <div className={cx('row')}>
                  <img
                    className={cx('logo')}
                    src={
                      require(`assets/icons/${mockToken[token1].logo}`).default
                    }
                  />
                  <div>{token1}</div>
                  <div className={cx('amount')}>
                    <div>103,980.23</div>
                    <div className={cx('value')}>$2,644,521</div>
                  </div>
                </div>
                <div className={cx('row')}>
                  <img
                    className={cx('logo')}
                    src={
                      require(`assets/icons/${mockToken[token2].logo}`).default
                    }
                  />
                  <div>{token2}</div>
                  <div className={cx('amount')}>
                    <div>103,980.23</div>
                    <div className={cx('value')}>$2,644,521</div>
                  </div>
                </div>
              </div>
              <div className={cx('ver-containers')}>
                <div className={cx('container', 'small-container')}>
                  <div className={cx('title')}>My Liquidity</div>
                  <div>$12,948.80</div>
                </div>
                <div className={cx('container', 'small-container')}>
                  <div className={cx('title')}>Bonded</div>
                  <div>$12,948.80</div>
                </div>
              </div>
            </div>
          </div>
          <LiquidityModal
            isOpen={isOpenLiquidityModal}
            open={() => setIsOpenLiquidityModal(true)}
            close={() => setIsOpenLiquidityModal(false)}
            token1={token1}
            token2={token2}
          />
        </>
      ) : (
        <>No Pool found</>
      )}
    </Layout>
  );
};

export default PoolDetail;
