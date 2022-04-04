import React, { FC, useState } from 'react';
import ReactModal from 'react-modal';
import Modal from 'components/Modal';
import { TooltipIcon } from 'components/Tooltip';
import style from './UnbondModal.module.scss';
import cn from 'classnames/bind';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import { filteredTokens } from 'constants/bridgeTokens';
import { getUsd } from 'libs/utils';
import TokenBalance from 'components/TokenBalance';
import useLocalStorage from 'libs/useLocalStorage';
import { parseAmount, parseDisplayAmount } from 'libs/utils';
import NumberFormat from 'react-number-format';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import { generateContractMessages, generateMiningMsgs, Type } from 'rest/api';
import CosmJs from 'libs/cosmjs';
import { ORAI } from 'constants/constants';
import { network } from 'constants/networks';
import Loader from 'components/Loader';

const cx = cn.bind(style);

interface ModalProps {
  isOpen: boolean;
  close: () => void;
  open: () => void;
  bondAmount: number;
  bondAmountUsd: number;
  lpTokenInfoData: any;
  assetToken: any;
  setTxHash: any;
}

const SettingModal: FC<ModalProps> = ({
  isOpen,
  close,
  open,
  bondAmount,
  bondAmountUsd,
  lpTokenInfoData,
  assetToken,
  setTxHash
}) => {
  const [chosenOption, setChosenOption] = useState(-1);
  const [unbondAmount, setUnbondAmount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const handleUnbond = async (amount: number) => {
    const parsedAmount = +parseAmount(
      amount.toString(),
      lpTokenInfoData!.decimals
    );

    if (parsedAmount <= 0 || parsedAmount > bondAmount)
      return displayToast(TToastType.TX_FAILED, {
        message: 'Amount is invalid!'
      });

    setActionLoading(true);
    displayToast(TToastType.TX_BROADCASTING);
    try {
      let walletAddr;
      if (await window.Keplr.getKeplr())
        walletAddr = await window.Keplr.getKeplrAddr();
      else throw 'You have to install Keplr wallet to swap';

      const msgs = await generateMiningMsgs({
        type: Type.UNBOND_LIQUIDITY,
        sender: `${walletAddr}`,
        amount: `${parsedAmount}`,
        assetToken
      });

      const msg = msgs[0];

      // console.log(
      //   'msgs: ',
      //   msgs.map((msg) => ({ ...msg, msg: Buffer.from(msg.msg).toString() }))
      // );

      const result = await CosmJs.execute({
        address: msg.contract,
        walletAddr: walletAddr! as string,
        handleMsg: Buffer.from(msg.msg.toString()).toString(),
        gasAmount: { denom: ORAI, amount: '0' },
        // @ts-ignore
        handleOptions: { funds: msg.sent_funds }
      });
      console.log('result provide tx hash: ', result);

      if (result) {
        console.log('in correct result');
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `${network.explorer}/txs/${result.transactionHash}`
        });
        setActionLoading(false);
        setTxHash(result.transactionHash);
        return;
      }
    } catch (error) {
      console.log('error in unbond form: ', error);
      let finalError = '';
      if (typeof error === 'string' || error instanceof String) {
        finalError = error as string;
      } else finalError = String(error);
      displayToast(TToastType.TX_FAILED, {
        message: finalError
      });
    }
    setActionLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      close={close}
      open={open}
      isCloseBtn={false}
      className={cx('modal')}
    >
      <div className={cx('setting')}>
        <div className={cx('title')}>
          <div>Unbond LP tokens</div>
          {/* <TooltipIcon
            content="The transfer won’t go through if the bridge rate moves
                        unfavorably by more than this percentage when the
                        transfer is executed."
          /> */}
        </div>
        <div className={cx('supply')}>
          <div className={cx('balance')}>
            <TokenBalance
              balance={{
                amount: bondAmount ? bondAmount : 0,
                denom: lpTokenInfoData.symbol
              }}
              prefix="Bonded Token Balance: "
              decimalScale={6}
            />

            <TokenBalance
              balance={bondAmountUsd}
              style={{ flexGrow: 1, textAlign: 'right' }}
              decimalScale={2}
            />
          </div>
          <div className={cx('input')}>
            <NumberFormat
              className={cx('amount')}
              thousandSeparator
              decimalScale={6}
              placeholder={'0'}
              value={!!unbondAmount ? unbondAmount : ''}
              onValueChange={({ floatValue }) =>
                setUnbondAmount(floatValue ?? 0)
              }
            />
          </div>
          <div className={cx('options')}>
            {[25, 50, 75, 100].map((option, idx) => (
              <div
                className={cx('item', {
                  isChosen: chosenOption === idx
                })}
                key={idx}
                onClick={() => {
                  setUnbondAmount((option * bondAmount) / (10 ** 6 * 100));
                  setChosenOption(idx);
                }}
              >
                {option}%
              </div>
            ))}
            <div
              className={cx('item', 'border', {
                isChosen: chosenOption === 4
              })}
              onClick={() => setChosenOption(4)}
            >
              <input
                placeholder="0.00"
                type={'number'}
                className={cx('input')}
                // value={chosenOption === 4 && !!unbondAmount ? unbondAmount : ''}
                onChange={(event) => {
                  setUnbondAmount(
                    (+event.target.value * bondAmount) / (10 ** 6 * 100)
                  );
                }}
              />
              %
            </div>
          </div>
        </div>
        <button
          className={cx('swap-btn')}
          onClick={() => handleUnbond(unbondAmount)}
          disabled={actionLoading}
        >
          {actionLoading && <Loader width={20} height={20} />}
          <span>Unbond</span>
        </button>
      </div>
    </Modal>
  );
};

export default SettingModal;
