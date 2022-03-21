import React, { FC, useState } from 'react';
import Modal from 'components/Modal';
import style from './BondingModal.module.scss';
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

const BondingModal: FC<ModalProps> = ({
  isOpen,
  close,
  open,
  token1,
  token2,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [chosenWithdrawPercent, setChosenWithdrawPercent] = useState(2);
  const [withdrawPercent, setWithdrawPercent] = useState(10);



  return (
    <Modal
      isOpen={isOpen}
      close={close}
      open={open}
      isCloseBtn={true}
      className={cx('modal')}
    >
      <div className={cx('container')}>
        <div className={cx('title')}>Bond LP tokens</div>

        <div className={cx('detail')}>
          <div className={cx('row')}>
            <div className={cx('row-title')}>
              <span>Current APR</span>
              <TooltipIcon />
            </div>
            <span className={cx('row-des', 'highlight')}>63.08%</span>
          </div>
          <div className={cx('row')}>
            <div className={cx('row-title')}>
              <span>Unbonding Duration</span>
              <TooltipIcon />
            </div>
            <span className={cx('row-des')}>7 days</span>
          </div>
        </div>

        <div className={cx('supply')}>
          <div className={cx('header')}>
            <div className={cx('title')}>AMOUNT TO BOND</div>
          </div>
          <div className={cx('balance')}>
            <span>Balance: 102.57 {token1}</span>
            <div className={cx('btn')}>MAX</div>
            <div className={cx('btn')} onClick={() => { }}>
              HALF
            </div>
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
        </div>

        <div className={cx('swap-btn')}>Bond</div>
      </div>
    </Modal >
  );
};

export default BondingModal;
