
import React, { FC, useState } from 'react';
import Modal from 'components/Modal';
import style from './NewPoolModal.module.scss';
import cn from 'classnames/bind';
import { TooltipIcon } from 'components/Tooltip';
import SelectTokenModal from 'pages/Swap/Modals/SelectTokenModal';
import { pairsMap as mockPair, mockToken } from 'constants/pools';
import { useQuery } from 'react-query';
import {
  fetchBalance,
  fetchExchangeRate,
  fetchPairInfo,
  fetchPool,
  fetchPoolInfoAmount,
  fetchTaxRate,
  fetchTokenInfo,
  generateContractMessages,
  simulateSwap,
} from 'rest/api';
import { Pie } from '@ant-design/plots';

const cx = cn.bind(style);

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

type TokenDenom = keyof typeof mockToken;

type TokenName = keyof typeof mockToken;
type PairName = keyof typeof mockPair;
interface ValidToken {
  title: TokenDenom;
  contractAddress: string | undefined;
  Icon: string | FC;
  denom: string;
}

interface ModalProps {
  className?: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  isCloseBtn?: boolean;
}




const steps = ['Set token ratio', 'Add Liquidity', 'Confirm'];

const NewPoolModal: FC<ModalProps> = ({ isOpen, close, open }) => {
  const allToken: ValidToken[] = Object.values(mockToken).map((token) => {
    return {
      contractAddress: token.contractAddress,
      Icon: token.Icon,
      title: token.name,
      denom: token.denom,
    };
  });
  const [step, setStep] = useState(1);
  const [isSelectingToken, setIsSelectingToken] = useState<
    'token1' | 'token2' | null
  >(null);
  const [token1, setToken1] = useState<TokenDenom | null>(null);
  const [token2, setToken2] = useState<TokenDenom | null>(null);
  const [listToken1Option, setListToken1Option] = useState<ValidToken[]>(allToken)
  const [listToken2Option, setListToken2Option] = useState<ValidToken[]>(allToken)
  const [supplyToken1, setSupplyToken1] = useState(0)
  const [supplyToken2, setSupplyToken2] = useState(0)
  const [amountToken1, setAmountToken1] = useState(0)
  const [amountToken2, setAmountToken2] = useState(0)



  const {
    data: token1InfoData,
    error: token1InfoError,
    isError: isToken1InfoError,
    isLoading: isToken1InfoLoading,
  } = useQuery(['token-info', token1], () => {
    if (!!token1) return fetchTokenInfo(mockToken[token1!]);
  });

  const {
    data: token2InfoData,
    error: token2InfoError,
    isError: isToken2InfoError,
    isLoading: isToken2InfoLoading,
  } = useQuery(['token-info', token2], () => {
    if (!!token2) return fetchTokenInfo(mockToken[token2!]);
  });

  const Token1Icon = mockToken[token1!]?.Icon;
  const Token2Icon = mockToken[token2!]?.Icon;

  const step1Component = (
    <>
      <div className={cx('supply')}>
        <div className={cx('header')}>
          <div className={cx('title')}>Supply</div>
        </div>
        <div className={cx('input')}>
          <div
            className={cx('token')}
            onClick={() => setIsSelectingToken('token1')}
          >
            {!!token1 ? (
              (() => {
                const Token1Icon = mockToken[token1!]?.Icon;

                return (
                  <>
                    <Token1Icon className={cx('logo')} />
                    <div className={cx('title')}>
                      <div>{token1InfoData?.symbol ?? ''}</div>
                      <div className={cx('des')}>Cosmos Hub</div>
                    </div>
                    <div className={cx('arrow-down')} />
                  </>
                );
              })()
            ) : (
              <>
                <div className={cx('placeholder-logo')} />
                <span className={cx('title')}>Select assets</span>
                <div className={cx('arrow-down')} />
              </>
            )}
          </div>
          <div className={cx('amount')}>
            <input
              // className={cx('amount')}
              // value={fromAmount ? fromAmount : ""}
              value={supplyToken1 ? supplyToken1 : ""}
              placeholder="0"
              type="number"
              onChange={(e) => {
                setSupplyToken1(+e.target.value);
              }}
            />
            <span>%</span>
          </div>
        </div>
      </div>
      <div className={cx('supply')}>
        <div className={cx('header')}>
          <div className={cx('title')}>Supply</div>
        </div>
        <div className={cx('input')}>
          <div
            className={cx('token')}
            onClick={() => setIsSelectingToken('token2')}
          >
            {!!token2 ? (
              (() => {
                const TokenIcon = mockToken[token2!]?.Icon;

                return (
                  <>
                    <TokenIcon className={cx('logo')} />
                    <div className={cx('title')}>
                      <div>{token2InfoData?.symbol ?? ''}</div>
                      <div className={cx('highlight')}>Cosmos Hub</div>
                    </div>
                    <div className={cx('arrow-down')} />
                  </>
                );
              })()
            ) : (
              <>
                <div className={cx('placeholder-logo')} />
                <span className={cx('title')}>Select assets</span>
                <div className={cx('arrow-down')} />
              </>
            )}
          </div>
          <div className={cx('amount')}>
            <input
              value={supplyToken2 ? supplyToken2 : ""}
              placeholder="0"
              type="number"
              onChange={(e) => {
                setSupplyToken2(+e.target.value);
              }}
            />
            <span>%</span>
          </div>
        </div>
      </div>
      <div className={cx('swap-btn')} onClick={() => setStep(2)}>Next</div>
    </>
  );

  const step2Component = (
    <>
      <div className={cx('supply')}>
        <div className={cx('header')}>
          <div className={cx('title')}>Supply</div>
          <div className={cx('percent')}>{supplyToken1}%</div>
        </div>
        <div className={cx('balance')}>
          <span>Balance: 338.45 {token1InfoData?.symbol}</span>
          <div className={cx('btn')}>MAX</div>
          <div className={cx('btn')} onClick={() => { }}>
            HALF
          </div>
          <span style={{ flexGrow: 1, textAlign: 'right' }}>$604.12</span>
        </div>
        <div className={cx('input')}>
          <div className={cx('token')}>
            <Token1Icon className={cx('logo')} />
            <div className={cx('title')}>
              <div>{token1InfoData?.symbol}</div>
              <div className={cx('des')}>Cosmos Hub</div>
            </div>
          </div>
          <input
            className={cx('amount')}
            value={!!amountToken1 ? amountToken1 : ""}
            placeholder="0"
            type="number"
            onChange={(e) => {
              setAmountToken1(+e.target.value)
            }}
          />
        </div>
      </div>

      <div className={cx('supply')}>
        <div className={cx('header')}>
          <div className={cx('title')}>Supply</div>
          <div className={cx('percent')}>{supplyToken2}%</div>
        </div>
        <div className={cx('balance')}>
          <span>Balance: 338.45 {token2InfoData?.symbol}</span>
          <div className={cx('btn')}>MAX</div>
          <div className={cx('btn')} onClick={() => { }}>
            HALF
          </div>
          <span style={{ flexGrow: 1, textAlign: 'right' }}>$604.12</span>
        </div>
        <div className={cx('input')}>
          <div className={cx('token')}>
            <Token2Icon className={cx('logo')} />
            <div className={cx('title')}>
              <div>{token2InfoData?.symbol}</div>
              <div className={cx('highlight')}>Cosmos Hub</div>
            </div>
          </div>
          <input
            className={cx('amount')}
            value={!!amountToken2 ? amountToken2 : ""}
            placeholder="0"
            type="number"
            onChange={(e) => {
              setAmountToken2(+e.target.value)
            }}
          />

        </div>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <div className={cx('back-btn')} onClick={() => setStep(1)}>Back</div>
        <div className={cx('swap-btn')} onClick={() => setStep(3)}>Next</div>
      </div>

    </>
  );

  const step3Component = (
    <>
      {DemoPie(
        [
          {
            type: token1InfoData?.symbol!,
            value: amountToken1
          },
          {
            type: token2InfoData?.symbol!,
            value: amountToken2
          }
        ])}
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      close={close}
      open={open}
      isCloseBtn={true}
      className={cx('modal')}
    >
      <div className={cx('container')}>
        <div className={cx('title')}>Create new pool</div>
        <div className={cx('steps')}>
          <div className={cx('progress')}>
            <div
              className={cx('purple-line')}
              style={{ width: `${50 * (step - 1)}%` }}
            />
            <div className={cx('white-line')} />
            {steps.map((undefine, _idx) => {
              const idx = _idx + 1;
              if (step > idx)
                return (
                  <img
                    key={idx}
                    className={cx('done', `point-${idx}`)}
                    src={require('assets/icons/done-step.svg').default}
                  />
                );
              if (step === idx)
                return (
                  <div
                    key={idx}
                    className={cx('point', `point-${idx}`, 'highlight')}
                  >
                    {idx}
                  </div>
                );
              return (
                <div key={idx} className={cx('point', `point-${idx}`)}>
                  {idx}
                </div>
              );
            })}
          </div>
          <div className={cx('text')}>
            {steps.map((step, idx) => (
              <div key={idx} className={cx(`point-${idx + 1}`)}>
                {step}
              </div>
            ))}
          </div>
        </div>
        {(() => {
          if (step === 1) return step1Component
          if (step === 2) return step2Component
          if (step === 3) return step3Component
        })()}
      </div>
      <SelectTokenModal
        isOpen={isSelectingToken === 'token1'}
        open={() => setIsSelectingToken('token1')}
        close={() => setIsSelectingToken(null)}
        setToken={(token1: TokenDenom) => {
          setToken1(token1)

          setListToken2Option(allToken.filter(t => t.denom !== token1))
        }}
        listToken={listToken1Option}
      />
      <SelectTokenModal
        isOpen={isSelectingToken === 'token2'}
        open={() => setIsSelectingToken('token2')}
        close={() => setIsSelectingToken(null)}
        setToken={(token2: TokenDenom) => {
          setToken2(token2)
          setListToken1Option(allToken.filter(t => t.denom !== token2))

        }}
        listToken={listToken2Option}
      />
    </Modal>
  );
};



const DemoPie = (data: {
  type: string,
  value: number
}[]) => {
  const config = {
    legend: undefined,
    autoFit: false,
    appendPadding: 10,
    data,
    height: 300,
    width: 300,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.8,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    color: ['#612FCA', '#FFD5AE'],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: '#ffffff',
          fontSize: '14px'

        },
        content: `${data[0].type}/${data[1].type}`,
      },
    },
  };
  return <Pie {...config} />;
};

export default NewPoolModal;
