import { FC } from "react";
import { InjectedConnector } from "@web3-react/injected-connector";
import styles from "./LoginWidget.module.scss";
import cn from "classnames/bind";
import SSOWidget, { SSOWidgetType } from "./connect-wallet/SSOWidget";

const cx = cn.bind(styles);

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 15],
});

const LoginOraiWallet: FC<{}> = () => {
  return (
    <>
      <div className={cx("item-orai")}>
        <img
          src={require(`assets/icons/oraichain_1.svg`).default}
          className={cx("logo")}
        />
        <div className={cx("grow")}>
          <SSOWidget
            type={SSOWidgetType.inline}
            text="Connect Oraichain Wallet"
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
              background: "linear-gradient(180deg, #1E1E21 0%, #1E1E21 100%)",
            }}
          />
        </div>
        <div className={cx("arrow-right")} />
      </div>
    </>
  );
};

export default LoginOraiWallet;
