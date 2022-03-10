import LoginMetamask from "components/LoginMetamask";
import LoginWidget from "components/LoginWidget";
import Modal from "components/Modal";
import React from "react";
import SSOWidget, { SSOWidgetType } from "./SSOWidget";
import "./SSOWidget.scss";
import MESSAGE from "lang/MESSAGE.json";

interface ConnectWalletModalProps {
  isOpen: boolean;
  close: () => void;
  open: () => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  close,
  open,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      close={close}
      open={open}
      className={"popup-connect"}
      isCloseBtn
    >
      <LoginWidget text={MESSAGE.Form.Button.ConnectKeplr} />
      <LoginMetamask text={MESSAGE.Form.Button.ConnectMetamask} />
      <SSOWidget
        type={SSOWidgetType.inline}
        text="Connect Wallet"
        buttonStyle={{
          height: "40px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          fontFamily: "Source Sans Pro",
          fontSize: "16px",
          lineHeight: "150%",
          color: "#f6f7fb",
          margin: "0 0 0px",
          borderRadius: "4px",
          background: "linear-gradient(180deg, #DD4AE0 0%, #E14A6E 100%)",
        }}
      />
    </Modal>
  );
};

export default ConnectWalletModal;
