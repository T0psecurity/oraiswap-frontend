import { Button } from "antd";
import React, { useState } from "react";
import ConnectWalletModal from "./ConnectWalletModal";

const RequireAuthButton: React.FC<any> = (props: any) => {
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);
  const onClick = () => {
    setOpenConnectWalletModal(true);
    // if (!isLoggedIn()) setOpenConnectWalletModal(true);
    // else props.onClick && props.onClick();
  };

  return (
    <React.Fragment>
      <Button {...props} onClick={onClick}>
        {props.children}
      </Button>
      {openConnectWalletModal && (
        <ConnectWalletModal
          isOpen={openConnectWalletModal}
          close={() => {
            setOpenConnectWalletModal(false);
          }}
          open={() => {
            setOpenConnectWalletModal(true);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default RequireAuthButton;
