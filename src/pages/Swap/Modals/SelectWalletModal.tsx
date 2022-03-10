import React, { FC, useState } from "react";
import Modal from "components/Modal";
import style from "./SelectWalletModal.module.scss";
import cn from "classnames/bind";

const cx = cn.bind(style);

const SelectWalletModal: FC<Modal> = ({ isOpen, close, open }) => {
    const [slippage, setSlippage] = useState(1);
    const [chosenOption, setChosenOption] = useState(2);

    const options = [
        {
            logo: "oraichain.svg",
            title: "Oraichain Wallet",
            des: "Connect using web app",
        },
        {
            logo: "metamask.svg",
            title: "Metamask",
            des: "Connect using browser wallet",
        },
        {
            logo: "walletconnect.svg",
            title: "WalletConnect",
            des: "Connect using mobile wallet",
        },
    ];

    return (
        <Modal isOpen={isOpen} close={close} open={open} isCloseBtn={true}>
            <div className={cx("select")}>
                <div className={cx("title")}>
                    <div>Connect wallet</div>
                </div>
                <div className={cx("options")}>
                    {options.map((option, idx) =>
                    (
                        <div
                            className={cx("item")}
                            key={idx}
                            onClick={() => { }}
                        >
                            <img src={require(`assets/icons/${option.logo}`).default} className={cx('logo')} />
                            <div className={cx('grow')}>
                                <div className={cx('network-title')}>{option.title}</div>
                                <div className={cx('des')}>{option.des}</div>
                            </div>
                            <div className={cx('arrow-right')} />
                        </div>
                    )
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default SelectWalletModal;
