import LoginMetamask from 'components/LoginMetamask';
import LoginWidget from 'components/LoginWidget';
import Modal from 'components/Modal';
import React from 'react';
import './SSOWidget.scss';
import MESSAGE from 'lang/MESSAGE.json';
import style from './ConnectWalletModal.module.scss';
import cn from 'classnames/bind';
import useLocalStorage from 'libs/useLocalStorage';

const cx = cn.bind(style);

interface ConnectWalletModalProps {
  isOpen: boolean;
  close: () => void;
  open: () => void;
  setAddress: (address: string) => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  close,
  setAddress,
  open
}) => {
  const onAddress = (address: string) => {
    setAddress(address);
    close();
  };
  return (
    <Modal isOpen={isOpen} close={close} open={open} isCloseBtn={true}>
      <div className={cx('select')}>
        <div className={cx('title')}>
          <div>Connect wallet</div>
        </div>
        <div className={cx('options')}>
          <LoginWidget
            text={MESSAGE.Form.Button.ConnectKeplr}
            onAddress={onAddress}
          />
          <LoginMetamask text={MESSAGE.Form.Button.ConnectMetamask} />
        </div>
      </div>
    </Modal>
  );
};

export default ConnectWalletModal;
