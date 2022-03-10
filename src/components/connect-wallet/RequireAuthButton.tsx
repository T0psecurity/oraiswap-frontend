import { Button } from "antd";
import { isLoggedIn } from "providers/AuthProvider";
import React, { useState } from "react";
import ConnectWalletModal from "./ConnectWalletModal";

const RequireAuthButton: React.FC<any> = (props: any) => {
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);
  const onClick = () => {
    if (!isLoggedIn()) setOpenConnectWalletModal(true);
    else props.onClick && props.onClick();
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
