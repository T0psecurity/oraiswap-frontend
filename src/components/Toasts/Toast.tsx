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

const CloseButton = ({ closeToast }: { closeToast: () => void }) => (
  <button onClick={closeToast} className={styles.btn_close}>
    <img
      alt="x"
      className={styles.btn_close_img}
      src="/assets/Icons/ToastClose.png"
    />
  </button>
);

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 7000,
  // autoClose: false,
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
  TX_FAILED
}

interface IToastExtra {
  message: string;
  customLink: string;
}

export type DisplayToastFn = ((
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
  if (type === TToastType.TX_BROADCASTING) {
    toast(<ToastTxBroadcasting />, inputOptions);
  } else if (type === TToastType.TX_SUCCESSFUL) {
    toast(<ToastTxSuccess link={inputExtraData.customLink} />, inputOptions);
  } else if (type === TToastType.TX_FAILED) {
    toast(<ToastTxFailed message={inputExtraData.message} />, inputOptions);
  } else {
    console.error(`Undefined toast type - ${type}`);
  }
};

const ToastTxBroadcasting: FunctionComponent = () => (
  <div className={classNames(styles.toast_content, styles.toast_broadcasting)}>
    <img alt="ldg" src="/assets/Icons/Loading.png" />
    <section className={styles.toast_section}>
      <h6>Transaction Broadcasting</h6>
      <p>Waiting for transaction to be included in the block</p>
    </section>
  </div>
);

const ToastTxFailed: FunctionComponent<{ message: string }> = ({ message }) => (
  <div className={classNames(styles.toast_content, styles.toast_failed)}>
    <img alt="x" src="/assets/Icons/FailedTx.png" />
    <section className={styles.toast_section}>
      <h6>Transaction Failed</h6>
      <p>{message}</p>
    </section>
  </div>
);

const ToastTxSuccess: FunctionComponent<{ link: string }> = ({ link }) => (
  <div className={classNames(styles.toast_content, styles.toast_success)}>
    <img alt="b" src="/assets/Icons/ToastSuccess.png" />
    <section className={styles.toast_section}>
      <h6>Transaction Successful</h6>
      <a target="__blank" href={link}>
        View explorer <img alt="link" src="/assets/Icons/Link.png" />
      </a>
    </section>
  </div>
);
