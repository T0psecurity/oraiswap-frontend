import React, { FC, useState } from "react";
import ReactModal from "react-modal";
import Modal from "components/Modal";
import { TooltipIcon } from "components/Tooltip";
import style from "./SettingModal.module.scss";
import cn from "classnames/bind";

const cx = cn.bind(style);

interface ModalProps {
    isOpen: boolean;
    close: () => void;
    open: () => void;
    slippage: number;
    setSlippage: any;
}

const SettingModal: FC<ModalProps> = ({
    isOpen,
    close,
    open,
    slippage,
    setSlippage,
}) => {
    const [chosenOption, setChosenOption] = useState(2);

    return (
        <Modal isOpen={isOpen} close={close} open={open} isCloseBtn={false}>
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
                            value={chosenOption === 3 ? slippage : ""}
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
