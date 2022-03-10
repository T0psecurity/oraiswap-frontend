import React, { FC, useState } from "react";
import Modal from "components/Modal";
import style from "./SelectTokenModal.module.scss";
import cn from "classnames/bind";

const cx = cn.bind(style);

const SelectTokenModal: FC<Modal> = ({ isOpen, close, open }) => {

    const options = [
        {
            logo: "oraichain.svg",
            title: "Oraichain Token ",
            des: "12,890.25 ORAI",
        }, {
            logo: "oraichain.svg",
            title: "Oraichain Token ",
            des: "12,890.25 ORAI",
        }, {
            logo: "oraichain.svg",
            title: "Oraichain Token ",
            des: "12,890.25 ORAI",
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
                                <div>{option.title}</div>

                            </div>
                            <div>{option.des}</div>
                        </div>
                    )
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default SelectTokenModal;
