import { Button, Typography } from "antd";
import { ReactComponent as Logo } from "assets/icons/logo.svg";
import { ReactComponent as Swap } from "assets/icons/swap.svg";
import { ReactComponent as Wallet } from "assets/icons/wallet.svg";
import { ReactComponent as Pools } from "assets/icons/pool.svg";
import { ReactComponent as Dark } from "assets/icons/dark.svg";
import { ReactComponent as Light } from "assets/icons/light.svg";
import { ReactComponent as Logout } from "assets/icons/logout.svg";
import { ThemeContext, Themes } from "context/theme-context";
import LocalStorage, { LocalStorageKey } from "services/LocalStorage";
import React, {
  memo,
  useContext,
  useEffect,
  useState,
  ReactElement,
} from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Menu.module.scss";
import RequireAuthButton from "components/connect-wallet/RequireAuthButton";
import { isLoggedIn } from "providers/AuthProvider";

const { Text } = Typography;

const Menu: React.FC<{}> = React.memo((props) => {
  const location = useLocation();
  const [link, setLink] = useState("/");
  const { theme, setTheme } = useContext(ThemeContext);

  useEffect(() => {
    setLink(location.pathname);
  }, []);

  const renderLink = (
    to: string,
    title: string,
    onClick: any,
    icon: ReactElement
  ) => {
    return (
      <Link
        to={to}
        onClick={() => onClick(to)}
        className={styles.menu_item + (link === to ? ` ${styles.active}` : "")}
      >
        {icon}
        <Text className={styles.menu_item_text}>{title}</Text>
      </Link>
    );
  };

  return (
    <div className={styles.menu}>
      <Link to={"/"} onClick={() => setLink("/")} className={styles.logo}>
        {<Logo style={{ width: 40, height: 40 }} />}
        <Text className={styles.logo_text}>OraiBridge</Text>
      </Link>
      <div className={styles.menu_items}>
        <RequireAuthButton className={styles.connect_btn}>
          <div />
          <Text className={styles.connect}>
            {isLoggedIn() ? "Unnamed connected" : "Connect wallet"}
          </Text>
          {isLoggedIn() ? (
            <Logout
              onClick={(e) => {
                LocalStorage.removeItem(LocalStorageKey.token);
                window.location.reload();
              }}
              style={{ width: 35, height: 35 }}
            />
          ) : (
            <div />
          )}
        </RequireAuthButton>
        {renderLink(
          "/swap",
          "Swap",
          setLink,
          <Swap style={{ width: 30, height: 30 }} />
        )}
        {renderLink(
          "/pools",
          "Pools",
          setLink,
          <Pools style={{ width: 30, height: 30 }} />
        )}
        {renderLink(
          "/balance",
          "Balance",
          setLink,
          <Wallet style={{ width: 30, height: 30 }} />
        )}
      </div>

      <div className={styles.menu_themes}>
        <Button
          className={
            styles.menu_theme +
            (theme === Themes.dark ? ` ${styles.active}` : "")
          }
          onClick={() => {
            setTheme(Themes.dark);
          }}
        >
          <Dark style={{ width: 15, height: 15 }} />
          <Text className={styles.menu_theme_text}>Dark</Text>
        </Button>
        <Button
          className={
            styles.menu_theme +
            (theme === Themes.light ? ` ${styles.active}` : "")
          }
          onClick={() => {
            setTheme(Themes.light);
          }}
        >
          <Light style={{ width: 15, height: 15 }} />
          <Text className={styles.menu_theme_text}>Light</Text>
        </Button>
      </div>

      <div className={styles.menu_footer}>© 2022 Powered by Oraichain</div>
    </div>
  );
});

export default memo(Menu);
