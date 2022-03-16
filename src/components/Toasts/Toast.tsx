import React, {
  FC,
  FunctionComponent,
  ReactComponentElement,
  ReactElement,
  ReactNode
} from 'react';
import styles from './Toast.module.scss';
import classNames from 'classnames';
import { toast, ToastOptions } from 'react-toastify';
import { ReactComponent as CloseIcon } from 'assets/icons/close.svg';
import { ReactComponent as SuccessIcon } from 'assets/icons/toast_success.svg';
import { ReactComponent as FailedIcon } from 'assets/icons/toast_failed.svg';
import { ReactComponent as InfoIcon } from 'assets/icons/toast_info.svg';
import { ReactComponent as LinkIcon } from 'assets/icons/link.svg';
import { ReactComponent as BroadcastingIcon } from 'assets/icons/toast_broadcasting.svg';

const CloseButton = ({ closeToast }: { closeToast: () => void }) => (
  <button onClick={closeToast} className={styles.btn_close}>
    <CloseIcon className={styles.btn_close_img} />
  </button>
);

const defaultOptions: ToastOptions = {
  position: 'top-right',
  theme: 'dark',
  autoClose: 7000,
  // autoClose: false,
  icon: false,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
  pauseOnFocusLoss: false,
  closeButton: CloseButton
};

const defaultExtraData = { message: '', customLink: '' };

export enum TToastType {
  TX_BROADCASTING,
  TX_SUCCESSFUL,
  TX_FAILED,
  TX_INFO,
  KEPLR_FAILED
}

interface IToastExtra {
  message: string;
  customLink: string;
}

export type DisplayToastFn = ((
  type: TToastType.TX_INFO,
  extraData?: Partial<Pick<IToastExtra, 'message'>>,
  options?: Partial<ToastOptions>
) => void) &
  ((
    type: TToastType.TX_BROADCASTING,
    options?: Partial<ToastOptions>
  ) => void) &
  ((
    type: TToastType.TX_SUCCESSFUL,
    extraData?: Partial<Pick<IToastExtra, 'customLink'>>,
    options?: Partial<ToastOptions>
  ) => void) &
  ((
    type: TToastType.TX_FAILED,
    extraData?: Partial<Pick<IToastExtra, 'message'>>,
    options?: Partial<ToastOptions>
  ) => void);

export interface DisplayToast {
  displayToast: DisplayToastFn;
}

export const displayToast: DisplayToastFn = (
  type: TToastType,
  extraData?: Partial<IToastExtra> | Partial<ToastOptions>,
  options?: Partial<ToastOptions>
) => {
  const refinedOptions =
    type === TToastType.TX_BROADCASTING ? extraData ?? {} : options ?? {};
  const refinedExtraData = extraData ? extraData : {};
  const inputExtraData = {
    ...defaultExtraData,
    ...refinedExtraData
  } as IToastExtra;
  const inputOptions = {
    ...defaultOptions,
    ...refinedOptions
  } as ToastOptions;

  switch (type) {
    case TToastType.TX_INFO:
      return toast(
        <ToastInfo message={inputExtraData.message} />,
        inputOptions
      );
    case TToastType.TX_BROADCASTING:
      return toast(<ToastTxBroadcasting />, inputOptions);
    case TToastType.TX_SUCCESSFUL:
      return toast(
        <ToastTxSuccess link={inputExtraData.customLink} />,
        inputOptions
      );
    case TToastType.TX_FAILED:
      return toast(
        <ToastTxFailed message={inputExtraData.message} />,
        inputOptions
      );
    case TToastType.KEPLR_FAILED:
      return toast(
        <ToastKeplrFailed message={inputExtraData.message} />,
        inputOptions
      );
    default:
      return console.error(`Undefined toast type - ${type}`);
  }
};

const ToastTxBroadcasting: FunctionComponent = () => (
  <div className={classNames(styles.toast_content, styles.toast_broadcasting)}>
    <BroadcastingIcon />
    <section className={styles.toast_section}>
      <h6>Transaction Broadcasting</h6>
      <p>Waiting for transaction to be included in the block</p>
    </section>
  </div>
);

const ToastInfo: FunctionComponent<{ message: string }> = ({ message }) => (
  <div className={classNames(styles.toast_content, styles.toast_info)}>
    <InfoIcon />
    <section className={styles.toast_section}>
      <p>{message}</p>
    </section>
  </div>
);

const ToastTxFailed: FunctionComponent<{ message: string }> = ({ message }) => (
  <div className={classNames(styles.toast_content, styles.toast_failed)}>
    <FailedIcon />
    <section className={styles.toast_section}>
      <h6>Transaction Failed</h6>
      <p>{message}</p>
    </section>
  </div>
);

const ToastKeplrFailed: FunctionComponent<{ message: string }> = ({
  message
}) => (
  <div className={classNames(styles.toast_content, styles.toast_failed)}>
    <FailedIcon />
    <section className={styles.toast_section}>
      <h6>Keplr failed</h6>
      <p>{message}</p>
    </section>
  </div>
);

const ToastTxSuccess: FunctionComponent<{ link: string }> = ({ link }) => (
  <div className={classNames(styles.toast_content, styles.toast_success)}>
    <SuccessIcon />
    <section className={styles.toast_section}>
      <h6>Transaction Successful</h6>
      <a target="__blank" href={link}>
        View on OraiScan <LinkIcon />
      </a>
    </section>
  </div>
);
