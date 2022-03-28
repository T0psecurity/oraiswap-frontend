// @ts-nocheck
import React, { memo, useState } from 'react';
import { Button, Divider, Input } from 'antd';
import styles from './PoolDetail.module.scss';
import cn from 'classnames/bind';
import { useParams } from 'react-router-dom';
import LiquidityModal from './LiquidityModal/LiquidityModal';
import BondingModal from './BondingModal/BondingModal';
import Content from 'layouts/Content';
import Pie from 'components/Pie';

const cx = cn.bind(styles);

const mockPair = {
  'ORAI-AIRI': {
    contractAddress: 'orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v',
    amount1: 100,
    amount2: 1000
  },
  'AIRI-ATOM': {
    contractAddress: 'orai16wvac5gxlxqtrhhcsa608zh5uh2zltuzjyhmwh',
    amount1: 100,
    amount2: 1000
  },
  'ORAI-TEST2': {
    contractAddress: 'orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v',
    amount1: 100,
    amount2: 1000
  },
  'AIRI-TEST2': {
    contractAddress: 'orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v',
    amount1: 100,
    amount2: 1000
  },
  'ATOM-ORAI': {
    contractAddress: 'orai16wvac5gxlxqtrhhcsa608zh5uh2zltuzjyhmwh',
    amount1: 100,
    amount2: 1000
  }
};

const mockToken = {
  ORAI: {
    contractAddress: 'orai',
    denom: 'orai',
    logo: 'oraichain.svg'
  },
  AIRI: {
    contractAddress: 'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2',
    logo: 'airi.svg'
  },
  ATOM: {
    contractAddress: 'orai15e5250pu72f4cq6hfe0hf4rph8wjvf4hjg7uwf',
    logo: 'atom.svg'
  },
  TEST2: {
    contractAddress: 'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2',
    logo: 'atom.svg'
  }
};

const mockBalance = {
  ORAI: 800000,
  AIRI: 80000.09,
  ATOM: 50000.09,
  TEST1: 8000.122,
  TEST2: 800.3434
};

const mockPrice = {
  ORAI: 5.01,
  AIRI: 0.89,
  TEST1: 1,
  TEST2: 1
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
  const [isOpenBondingModal, setIsOpenBondingModal] = useState(false);

  return (
    <Content nonBackground>
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
            </div>
            <div className={cx('info')}>
              <div className={cx('row')}>
                <div className={cx('container', 'tokens')}>
                  <div className={cx('available-tokens')}>
                    <div className={cx('label')}>Available LP tokens</div>
                    <Pie percent={50}>102.57 GAMM-1 $52,749</Pie>
                  </div>
                  <div className={cx('liquidity')}>
                    <div className={cx('label')}>My liquidity</div>
                    <div className={cx('liquidity_token')}>
                      <div className={cx('liquidity_token_name')}>
                        <span
                          className={cx('mark')}
                          style={{ background: '#FFD5AE' }}
                        ></span>
                        <span className={cx('icon')}></span>
                        <span className={cx('token-name')}>ATOM</span>
                      </div>
                      <div className={cx('liquidity_token_value')}>
                        <span className={cx('amount')}>1,980.23</span>
                        <span className={cx('amount-usd')}>$26,445</span>
                      </div>
                    </div>
                    <div className={cx('liquidity_token')}>
                      <div className={cx('liquidity_token_name')}>
                        <span
                          className={cx('mark')}
                          style={{ background: '#612FCA' }}
                        ></span>
                        <span className={cx('icon')}></span>
                        <span className={cx('token-name')}>ORAI</span>
                      </div>
                      <div className={cx('liquidity_token_value')}>
                        <span className={cx('amount')}>1,980.23</span>
                        <span className={cx('amount-usd')}>$26,445</span>
                      </div>
                    </div>
                    <Button
                      className={cx('btn')}
                      style={{ marginTop: 30 }}
                      onClick={() => setIsOpenLiquidityModal(true)}
                    >
                      Add/Remove Liquidity
                    </Button>
                  </div>
                </div>

                <div className={cx('container', 'pool-catalyst')}>
                  <div className={cx('label')}>Pool Catalyst</div>
                  <div className={cx('content')}>
                    <div className={cx('pool-catalyst_token')}>
                      <div className={cx('pool-catalyst_token_name')}>
                        <span className={cx('icon')}></span>
                        <span className={cx('token-name')}>ORAI</span>
                      </div>
                      <div className={cx('pool-catalyst_token_value')}>
                        <span className={cx('amount')}>1,980.23</span>
                        <span className={cx('amount-usd')}>$26,445</span>
                      </div>
                    </div>
                    <div className={cx('pool-catalyst_token')}>
                      <div className={cx('pool-catalyst_token_name')}>
                        <span className={cx('icon')}></span>
                        <span className={cx('token-name')}>ORAI</span>
                      </div>
                      <div className={cx('pool-catalyst_token_value')}>
                        <span className={cx('amount')}>1,980.23</span>
                        <span className={cx('amount-usd')}>$26,445</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cx('row')}>
                <div className={cx('mining')}>
                  <div className={cx('label--bold')}>Liquidity Mining</div>
                  <div className={cx('label--sub')}>
                    Bond liquidity to earn ORAI liquidity reward and swap fees
                  </div>
                  <div className={cx('container', 'container_mining')}>
                    <img
                      className={cx('icon')}
                      src={
                        require('assets/images/Liquidity_mining_illus.png')
                          .default
                      }
                    />
                    <div className={cx('bonded')}>
                      <div className={cx('label')}>Bonded</div>
                      <div className={cx('amount')}>2.35 GAMM-1</div>
                      <div className={cx('amount-usd')}>$1,948.80</div>
                      <Divider
                        dashed
                        style={{
                          background: '#2D2938',
                          width: '100%',
                          height: '1px',
                          margin: '16px 0'
                        }}
                      />
                      <div className={cx('bonded-apr')}>
                        <div className={cx('bonded-name')}>Current APR</div>
                        <div className={cx('bonded-value')}>63.08%</div>
                      </div>
                      <div className={cx('bonded-unbouding')}>
                        <div className={cx('bonded-name')}>
                          Unbonding Duration
                        </div>
                        <div className={cx('bonded-value')}>7 days</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={cx('earning')}>
                  <Button className={cx('btn')}>Start Earning</Button>
                  <div className={cx('container', 'container_earning')}>
                    <div className={cx('label')}>Earnings</div>
                    <div className={cx('amount')}>0 ORAI</div>
                    <div className={cx('amount-usd')}>$0</div>
                    <Button
                      className={cx('btn', 'btn--dark')}
                      onClick={() => setIsOpenBondingModal(true)}
                    >
                      Unbond All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <LiquidityModal
            isOpen={isOpenLiquidityModal}
            open={() => setIsOpenLiquidityModal(true)}
            close={() => setIsOpenLiquidityModal(false)}
            token1Symbol={token1}
            token2Symbol={token2}
          />
          <BondingModal
            isOpen={isOpenBondingModal}
            open={() => setIsOpenBondingModal(true)}
            close={() => setIsOpenBondingModal(false)}
            token1={token1}
            token2={token2}
          />
        </>
      ) : (
        <>No Pool found</>
      )}
    </Content>
  );
};

export default PoolDetail;
