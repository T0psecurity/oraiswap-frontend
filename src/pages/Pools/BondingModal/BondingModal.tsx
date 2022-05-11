import React, { FC, useState } from 'react';
import Modal from 'components/Modal';
import style from './BondingModal.module.scss';
import cn from 'classnames/bind';
import { TooltipIcon } from 'components/Tooltip';
import TokenBalance from 'components/TokenBalance';
import { getUsd, parseAmount } from 'libs/utils';
import NumberFormat from 'react-number-format';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import { generateContractMessages, generateMiningMsgs, Type } from 'rest/api';
import CosmJs from 'libs/cosmjs';
import { ORAI } from 'config/constants';
import { network } from 'config/networks';
import Loader from 'components/Loader';
import useGlobalState from 'hooks/useGlobalState';
import { TokenInfo } from 'types/token';

const cx = cn.bind(style);

interface ModalProps {
  className?: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  isCloseBtn?: boolean;
  lpTokenInfoData: TokenInfo;
  lpTokenBalance: number;
  liquidityValue: number;
  assetToken: any;
  setTxHash: any;
}

const BondingModal: FC<ModalProps> = ({
  isOpen,
  close,
  open,
  lpTokenInfoData,
  lpTokenBalance,
  liquidityValue,
  assetToken,
  setTxHash
}) => {
  const [bondAmount, setBondAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [address] = useGlobalState('address');

  const onChangeAmount = (value: string) => {
    setBondAmount(value);
  };

  const handleBond = async (amount: string) => {
    const parsedAmount = +parseAmount(amount, lpTokenInfoData!.decimals);

    if (parsedAmount <= 0 || parsedAmount > lpTokenBalance)
      return displayToast(TToastType.TX_FAILED, {
        message: 'Amount is invalid!'
      });

    setActionLoading(true);
    displayToast(TToastType.TX_BROADCASTING);
    try {
      const msgs = await generateMiningMsgs({
        type: Type.BOND_LIQUIDITY,
        sender: address,
        amount: parsedAmount,
        lpToken: lpTokenInfoData.contractAddress!,
        assetToken
      });

      // const msgs = await generateMiningMsgs({
      //   type: Type.WITHDRAW_LIQUIDITY_MINING,
      //   sender: `${walletAddr}`,
      // })

      const msg = msgs[0];

      // console.log(
      //   'msgs: ',
      //   msgs.map((msg) => ({ ...msg, msg: Buffer.from(msg.msg).toString() }))
      // );

      const result = await CosmJs.execute({
        address: msg.contract,
        walletAddr: address,
        handleMsg: msg.msg.toString(),
        gasAmount: { denom: ORAI, amount: '0' },
        handleOptions: { funds: msg.sent_funds }
      });
      console.log('result provide tx hash: ', result);

      if (result) {
        console.log('in correct result');
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `${network.explorer}/txs/${result.transactionHash}`
        });
        setTxHash(result.transactionHash);
      }
    } catch (error) {
      console.log('error in bond form: ', error);
      let finalError = '';
      if (typeof error === 'string' || error instanceof String) {
        finalError = error as string;
      } else finalError = String(error);
      displayToast(TToastType.TX_FAILED, {
        message: finalError
      });
    } finally {
      setActionLoading(false);
    }
  };

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
              {/* <TooltipIcon /> */}
            </div>
            <span className={cx('row-des', 'highlight')}>
              150% + ORAIX Bonus
            </span>
          </div>
          {/* <div className={cx('row')}>
            <div className={cx('row-title')}>
              <span>Unbonding Duration</span>
              <TooltipIcon />
            </div>
            <span className={cx('row-des')}>7 days</span>
          </div> */}
        </div>
        <div className={cx('supply')}>
          <div className={cx('header')}>
            <div className={cx('title')}>AMOUNT TO BOND</div>
          </div>
          <div className={cx('balance')}>
            <TokenBalance
              balance={{
                amount: lpTokenBalance,
                denom: `${lpTokenInfoData?.symbol}`
              }}
              decimalScale={6}
              prefix="Balance: "
            />

            <div
              className={cx('btn')}
              onClick={() =>
                onChangeAmount(
                  `${lpTokenBalance / 10 ** lpTokenInfoData.decimals}`
                )
              }
            >
              MAX
            </div>
            <div
              className={cx('btn')}
              onClick={() =>
                onChangeAmount(
                  `${lpTokenBalance / 10 ** lpTokenInfoData.decimals / 2}`
                )
              }
            >
              HALF
            </div>
            <TokenBalance
              style={{ flexGrow: 1, textAlign: 'right' }}
              balance={liquidityValue}
              decimalScale={2}
            />
          </div>
          <div className={cx('input')}>
            <NumberFormat
              className={cx('amount')}
              thousandSeparator
              decimalScale={6}
              placeholder={'0'}
              // type="input"
              value={bondAmount ?? ''}
              onChange={(e: { target: { value: string } }) => {
                onChangeAmount(e.target.value.replaceAll(',', ''));
              }}
            />
          </div>
        </div>

        <button
          className={cx('swap-btn')}
          onClick={() => handleBond(bondAmount)}
          disabled={actionLoading}
        >
          {actionLoading && <Loader width={20} height={20} />}
          <span>Bond</span>
        </button>
      </div>
    </Modal>
  );
};

export default BondingModal;
