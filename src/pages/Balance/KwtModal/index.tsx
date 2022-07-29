import { FC, useState } from 'react';
import Modal from 'components/Modal';
import cn from 'classnames/bind';
import style from './index.module.scss';
const cx = cn.bind(style);
interface ModalProps {}

const KwtModal: FC<ModalProps> = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Modal
    
      isOpen={isOpen}
      close={() => setIsOpen(false)}
      open={() => {}}
      isCloseBtn={true}
      className={cx('modal')}
    >
      <img
        src="https://cdn.discordapp.com/attachments/973546340128788480/1002407867766296636/Kawaiiverse_token_flow.png"
        width="100%"
      />
    </Modal>
  );
};

export default KwtModal;
