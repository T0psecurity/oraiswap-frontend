import { useWeb3React } from "@web3-react/core";
import { FC, useEffect, useState } from "react";
import { InjectedConnector } from "@web3-react/injected-connector";
import useLocalStorage from "libs/useLocalStorage";
import CenterEllipsis from "./CenterEllipsis";
// import classNames from "classnames";
import styles from "./LoginWidget.module.scss";
// import Button from "components/Button";
import Icon from "./Icon";
// import MetamaskImage from "images/metamask.png";
import Web3 from "web3";
import cn from "classnames/bind";

const cx = cn.bind(styles);

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 15],
});

const LoginMetamask: FC<{ text: string }> = ({ text }) => {
  const { account, active, error, activate, deactivate } = useWeb3React();

  const [address, setAddress] = useLocalStorage<string | undefined | null>(
    "metamask-address",
    account
  );

  async function connect() {
    try {
      await activate(injected);
      setAddress(await injected.getAccount());
      window.location.reload();
    } catch (ex) {
      console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
      setAddress("");
    } catch (ex) {
      console.log(ex);
    }
  }

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      try {
        if (!active && address && !error) {
          await activate(injected);
          // reset provider
          window.web3 = new Web3(await injected.getProvider());
        }
      } catch (err) {
        console.log(err);
      }
    };
    connectWalletOnPageLoad();
  }, []);

  return (
    <>
      {/* <div className={classNames(styles.container)}>
        {address ? (
          <Button onClick={disconnect} className={classNames(styles.connected)}>
            <Icon size={16} name="account_balance_wallet" />
            <p className={classNames(styles.address)}>
              <CenterEllipsis size={6} text={address} />
            </p>
            <Icon size={20} name="close" />
          </Button>
        ) : (
          <Button className={classNames(styles.connect)} onClick={connect}>
            <img height={16} src={MetamaskImage} alt="Metamask" />
            {text}
          </Button>
        )}
      </div> */}
      <div className={cx("item")} onClick={address ? disconnect : connect}>
        <img
          src={require(`assets/icons/metamask.svg`).default}
          className={cx("logo")}
        />
        <div className={cx("grow")}>
          {address ? (
            <>
              <div className={cx("network-title")}>Metamask</div>
              <div className={cx("des")}>
                <CenterEllipsis size={6} text={address} />
              </div>
            </>
          ) : (
            <>
              <div className={cx("network-title")}>Metamask</div>
              <div className={cx("des")}>Connect using browser wallet</div>
            </>
          )}
        </div>
        {address ? (
          <div>
            <Icon size={20} name="close" />
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default LoginMetamask;
