import { Modal } from "antd";
import React from "react";
import SSOWidget, { SSOWidgetType } from "./SSOWidget";

interface ConnectWalletModalProps {
  onClose: ()=>void,
}
 
const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ onClose }) => {
  return ( 
  <Modal visible={true} onCancel={onClose} footer={null} width={500}>
    <SSOWidget
      type={SSOWidgetType.inline}
      text='Connect Wallet'
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
}
 
export default ConnectWalletModal;