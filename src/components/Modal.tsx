import React, { FC, useState } from 'react';
import ReactModal from 'react-modal';
import styles from './Modal.module.scss';
import Icon from './Icon';

ReactModal.setAppElement('#oraiswap');

const Modal: FC<Modal> = ({
  className,
  isOpen,
  close,
  children,
  isCloseBtn = false
}) => (
  <ReactModal
    className={`${styles.modal} ${className || ''}`}
    overlayClassName={`${styles.overlay} ${className || ''}`}
    isOpen={isOpen}
    onRequestClose={close}
  >
    {isCloseBtn && (
      <div className={styles.close}>
        <span onClick={close}>
          <Icon name="close" size={30} color={'#ffffff'} />
        </span>
      </div>
    )}
    {children}
  </ReactModal>
);

export default Modal;

/* modal */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
};
