import React, { FC, useEffect, useState } from "react";
import CenterEllipsis from "./CenterEllipsis";
import classNames from "classnames";
import styles from "./LoginWidget.module.scss";
import Button from "components/Button";
import Icon from "./Icon";
import useLocalStorage from "libs/useLocalStorage";
import { network } from "constants/networks";
import KeplrImage from "images/keplr.png";
import cn from "classnames/bind";

const cx = cn.bind(styles);

export const LoginWidget: FC<{ text: string }> = ({ text }) => {
  const [address, setAddress] = useLocalStorage<String>("address");

  const connectWallet = async () => {
    if (!(await window.Keplr.getKeplr())) {
      alert("You must install Keplr to continue");
      return;
    }
    await window.Keplr.suggestChain(network.chainId);
    const address = await window.Keplr.getKeplrAddr();

    setAddress(address as string);
  };
  const disconnectWallet = () => {
    setAddress("");
  };

  return (
    // <div className={classNames(styles.container)}>
    //   {address ? (
    //     <Button
    //       onClick={disconnectWallet}
    //       className={classNames(styles.connected)}
    //     >
    //       <Icon size={16} name="account_balance_wallet" />
    //       <p className={classNames(styles.address)}>
    //         <CenterEllipsis size={6} text={address as string} />
    //         {' | '}
    //         {network.id}
    //       </p>
    //       <Icon size={20} name="close" />
    //     </Button>
    //   ) : (
    //     <Button className={classNames(styles.connect)} onClick={connectWallet}>
    //       <img height={16} src={KeplrImage} alt="Keplr" />
    //       {text}
    //     </Button>
    //   )}
    // </div>
    <div
      className={cx("item")}
      onClick={address ? disconnectWallet : connectWallet}
    >
      <img src={KeplrImage} className={cx("logo")} />
      <div className={cx("grow")}>
        <div className={cx("network-title")}>Keplr</div>
        <div className={cx("des")}>
          {address ? (
            <p>
              <CenterEllipsis size={6} text={address as string} />
              {" | "}
              {network.id}
            </p>
          ) : (
            "Connect using browser wallet"
          )}
        </div>
      </div>
      {address ? (
        <div>
          <Icon size={20} name="close" />
        </div>
      ) : (
        <div className={cx("arrow-right")} />
      )}
    </div>
  );
};

export default LoginWidget;
