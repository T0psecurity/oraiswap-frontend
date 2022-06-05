import LoginWidget from './LoginWidget';
import Modal from 'components/Modal';
import React from 'react';
import MESSAGE from 'lang/MESSAGE.json';
import style from './ConnectWalletModal.module.scss';
import cn from 'classnames/bind';
import MetamaskImage from 'assets/icons/metamask.svg';
import KeplrImage from 'assets/images/keplr.png';
import OWalletImage from 'assets/images/owallet.png';
import { isMobile } from '@walletconnect/browser-utils';

const cx = cn.bind(style);

interface ConnectWalletModalProps {
  isOpen: boolean;
  close: () => void;
  open: () => void;
  address: string;
  metamaskAddress: string | null;
  disconnectMetamask: () => Promise<void>;
  disconnectKeplr: () => Promise<void>;
  connectKeplr: () => Promise<void>;
  connectMetamask: () => Promise<void>;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  close,
  connectKeplr,
  disconnectKeplr,
  connectMetamask,
  metamaskAddress,
  disconnectMetamask,
  address,
  open,
}) => {
  const mobileMode = isMobile();

  return (
    <Modal isOpen={isOpen} close={close} open={open} isCloseBtn={true}>
      <div className={cx('select')}>
        <div className={cx('title')}>
          <div>Connect wallet</div>
        </div>
        <div className={cx('options')}>
          {mobileMode ? (
            <LoginWidget
              text={MESSAGE.Form.Button.ConnectOWallet}
              address={address}
              logo={OWalletImage}
              connect={connectKeplr}
              disconnect={disconnectKeplr}
            />
          ) : (
            <LoginWidget
              text={MESSAGE.Form.Button.ConnectKeplr}
              address={address}
              logo={KeplrImage}
              connect={connectKeplr}
              disconnect={disconnectKeplr}
            />
          )}

          <LoginWidget
            address={metamaskAddress}
            logo={MetamaskImage}
            text={MESSAGE.Form.Button.ConnectMetamask}
            connect={connectMetamask}
            disconnect={undefined}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConnectWalletModal;
