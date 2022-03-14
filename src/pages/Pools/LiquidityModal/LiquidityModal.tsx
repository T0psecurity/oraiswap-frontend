import React, { FC, useState } from 'react';
import Modal from 'components/Modal';
import style from './LiquidityModal.module.scss';
import cn from 'classnames/bind';
import { TooltipIcon } from 'components/Tooltip';

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

interface ModalProps {
  className?: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  isCloseBtn?: boolean;
  token1: TokenName;
  token2: TokenName;
}

const LiquidityModal: FC<ModalProps> = ({
  isOpen,
  close,
  open,
  token1,
  token2,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [chosenWithdrawPercent, setChosenWithdrawPercent] = useState(2);
  const [withdrawPercent, setWithdrawPercent] = useState(10);

  const addTab = (
    <>
      <div className={cx('supply')}>
        <div className={cx('header')}>
          <div className={cx('title')}>Supply</div>
        </div>
        <div className={cx('balance')}>
          <span>Balance: 338.45 {token1}</span>
          <div className={cx('btn')}>MAX</div>
          <div className={cx('btn')} onClick={() => {}}>
            HALF
          </div>
          <span style={{ flexGrow: 1, textAlign: 'right' }}>$604.12</span>
        </div>
        <div className={cx('input')}>
          <div className={cx('token')}>
            <img
              className={cx('logo')}
              src={require(`assets/icons/${mockToken[token1].logo}`).default}
            />
            <div className={cx('title')}>
              <div>{token1}</div>
              <div className={cx('des')}>Cosmos Hub</div>
            </div>
          </div>
          <input
            className={cx('amount')}
            // value={fromAmount ? fromAmount : ""}
            placeholder="0"
            type="number"
            onChange={(e) => {
              // onChangeFromAmount(e.target.value);
            }}
          />
        </div>
      </div>
      <div className={cx('swap-icon')}>
        <img
          src={require('assets/icons/fluent_add.svg').default}
          onClick={() => {}}
        />
      </div>
      <div className={cx('supply')}>
        <div className={cx('header')}>
          <div className={cx('title')}>Supply</div>
        </div>
        <div className={cx('balance')}>
          <span>Balance: 338.45 {token1}</span>
          <div className={cx('btn')}>MAX</div>
          <div className={cx('btn')} onClick={() => {}}>
            HALF
          </div>
          <span style={{ flexGrow: 1, textAlign: 'right' }}>$604.12</span>
        </div>
        <div className={cx('input')}>
          <div className={cx('token')}>
            <img
              className={cx('logo')}
              src={require(`assets/icons/${mockToken[token1].logo}`).default}
            />
            <div className={cx('title')}>
              <div>{token1}</div>
              <div className={cx('highlight')}>Cosmos Hub</div>
            </div>
          </div>
          <input
            className={cx('amount')}
            // value={fromAmount ? fromAmount : ""}
            placeholder="0"
            type="number"
            onChange={(e) => {
              // onChangeFromAmount(e.target.value);
            }}
          />
        </div>
      </div>
      <div className={cx('detail')}>
        <div className={cx('row')}>
          <div className={cx('row-title')}>
            <span>Total supply</span>
            <TooltipIcon />
          </div>
          <span>$1,208.24</span>
        </div>
        <div className={cx('row')}>
          <div className={cx('row-title')}>
            <span>Received LP asset</span>
            <TooltipIcon />
          </div>
          <span>0.8 GAMM-1</span>
        </div>
      </div>
      <div className={cx('swap-btn')}>Add Liquidity</div>
    </>
  );

  const withdrawTab = (
    <>
      <div className={cx('supply')}>
        <div className={cx('header')}>
          <div className={cx('title')}>WITHDRAW</div>
        </div>
        <div className={cx('balance')}>
          <span>LP Token Balance: 0.8 GAMM-1</span>
          <span style={{ flexGrow: 1, textAlign: 'right' }}>$604.12</span>
        </div>
        <div className={cx('input')}>
          <input
            className={cx('amount')}
            // value={fromAmount ? fromAmount : ""}
            placeholder="0"
            type="number"
            onChange={(e) => {
              // onChangeFromAmount(e.target.value);
            }}
          />
        </div>
        <div className={cx('options')}>
          {[25, 50, 75, 100].map((option, idx) => (
            <div
              className={cx('item', {
                isChosen: chosenWithdrawPercent === idx,
              })}
              key={idx}
              onClick={() => {
                setWithdrawPercent(option);
                setChosenWithdrawPercent(idx);
              }}
            >
              {option}%
            </div>
          ))}
          <div
            className={cx('item', 'border', {
              isChosen: chosenWithdrawPercent === 4,
            })}
            onClick={() => setChosenWithdrawPercent(4)}
          >
            <input
              placeholder="0.00"
              type={'number'}
              className={cx('input')}
              value={
                chosenWithdrawPercent === 4 && !!withdrawPercent
                  ? withdrawPercent
                  : ''
              }
              onChange={(event) => {
                setWithdrawPercent(+event.target.value);
              }}
            />
            %
          </div>
        </div>
      </div>
      <div className={cx('swap-icon')}>
        <img
          src={require('assets/icons/fluent-arrow-down.svg').default}
          onClick={() => {}}
        />
      </div>
      <div className={cx('receive')}>
        <div className={cx('header')}>
          <div className={cx('title')}>RECEIVE</div>
        </div>
        <div className={cx('row')}>
          <img
            className={cx('logo')}
            src={require(`assets/icons/${mockToken[token1].logo}`).default}
          />
          <div className={cx('title')}>
            <div>{token1}</div>
            <div className={cx('des')}>Cosmos Hub</div>
          </div>
          <div className={cx('value')}>
            <div>22.71831913</div>
            <div className={cx('des')}>$604.12</div>
          </div>
        </div>
        <div className={cx('seporator')} />
        <div className={cx('row')}>
          <img
            className={cx('logo')}
            src={require(`assets/icons/${mockToken[token1].logo}`).default}
          />
          <div className={cx('title')}>
            <div>{token1}</div>
            <div className={cx('highlight')}>Cosmos Hub</div>
          </div>
          <div className={cx('value')}>
            <div>22.71831913</div>
            <div className={cx('des')}>$604.12</div>
          </div>
        </div>
      </div>

      <div className={cx('swap-btn')}>Withdraw Liquidity</div>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      close={close}
      open={open}
      isCloseBtn={true}
      className={cx('modal')}
    >
      <div className={cx('container')}>
        <div className={cx('title')}>{`${token1}/${token2} Pool`}</div>
        <div className={cx('switch')}>
          <div
            className={cx({ 'active-tab': activeTab === 0 })}
            onClick={() => setActiveTab(0)}
          >
            Add
          </div>
          <div
            className={cx({ 'active-tab': activeTab === 1 })}
            onClick={() => setActiveTab(1)}
          >
            Withdraw
          </div>
        </div>
        {activeTab === 0 ? addTab : withdrawTab}
      </div>
    </Modal>
  );
};

export default LiquidityModal;
