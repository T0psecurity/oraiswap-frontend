import { FC } from "react";
import { InjectedConnector } from "@web3-react/injected-connector";
import styles from "./LoginWidget.module.scss";
import cn from "classnames/bind";
import SSOWidget, { SSOWidgetType } from "./connect-wallet/SSOWidget";
import { isLoggedIn } from "providers/AuthProvider";
import CenterEllipsis from "./CenterEllipsis";
import Icon from "./Icon";
import LocalStorage, { LocalStorageKey } from "services/LocalStorage";

const cx = cn.bind(styles);

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 15],
});

const LoginOraiWallet: FC<{}> = () => {
  return (
    <>
      {isLoggedIn() ? (
        <div
          className={cx("item")}
          onClick={() => {
            LocalStorage.removeItem(LocalStorageKey.token);
            window.location.reload();
          }}
        >
          <img
            src={require(`assets/icons/oraichain_1.svg`).default}
            className={cx("logo")}
          />
          <div className={cx("grow")}>
            <>
              <div className={cx("network-title")}>Oraichain Wallet</div>
              <div className={cx("des")}>
                <CenterEllipsis size={6} text={"Unnamed connected"} />
              </div>
            </>
          </div>
          <div>
            <Icon size={20} name="close" />
          </div>
        </div>
      ) : (
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
      )}
    </>
  );
};

export default LoginOraiWallet;
