import React, { FC, useState } from "react";
import ReactModal from "react-modal";
import Modal from "components/Modal";
import { TooltipIcon } from "components/Tooltip";
import style from "./SettingModal.module.scss";
import cn from "classnames/bind";

const cx = cn.bind(style);

const SettingModal: FC<Modal> = ({
    className,
    isOpen,
    close,
    isCloseBtn = false,
    open,
}) => {
    const [slippage, setSlippage] = useState(1);
    const [chosenOption, setChosenOption] = useState(2);

    return (
        <Modal
            className={className}
            isOpen={isOpen}
            close={close}
            open={open}
            isCloseBtn={isCloseBtn}
        >
            <div className={cx("setting")}>
                <div className={cx("title")}>
                    <div>Slippage Tolerance</div>
                    <TooltipIcon
                        content="The transfer won’t go through if the bridge rate moves
                        unfavorably by more than this percentage when the
                        transfer is executed."
                    />
                </div>
                <div className={cx("options")}>
                    {[0.3, 0.5, 1].map((option, idx) => (
                        <div
                            className={cx("item", {
                                isChosen: chosenOption === idx,
                            })}
                            key={idx}
                            onClick={() => {
                                setSlippage(option);
                                setChosenOption(idx);
                            }}
                        >
                            {option}%
                        </div>
                    ))}
                    <div
                        className={cx("item", "border", {
                            isChosen: chosenOption === 3,
                        })}
                        onClick={() => setChosenOption(3)}
                    >
                        <input
                            placeholder="0.00"
                            type={"number"}
                            className={cx("input")}
                            onChange={(event) => {
                                setSlippage(+event.target.value);
                            }}
                        />
                        %
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SettingModal;
