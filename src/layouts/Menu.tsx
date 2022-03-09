import { Button, Typography } from 'antd';
import { ReactComponent as Logo } from 'assets/icons/logo.svg';
import { ThemeContext, Themes } from 'context/theme-context';
import React, { memo, useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Menu.module.scss';

const { Text } = Typography;

const Menu: React.FC<{}> = React.memo((props) => {
  const location = useLocation();
  const [link, setLink] = useState('/');
  const { theme, setTheme } = useContext(ThemeContext);

  useEffect(() => {
    setLink(location.pathname);
  }, []);

  const renderLink = (to: string, title: string, onClick: any) => {
    return (
      <Link to={to} onClick={() => onClick(to)} className={styles.menu_item  + (link === to ? ` ${styles.active}` : '')}>
        <Logo style={{ width: 30, height: 30 }} />
        <Text className={styles.menu_item_text}>{title}</Text>
      </Link>
    );
  };

  return (
    <div className={styles.menu}>
      <Link to={'/'} onClick={() => setLink('/')} className={styles.logo}>
          <Logo style={{ width: 40, height: 40 }} />
          <Text className={styles.logo_text}>OraiBridge</Text>
      </Link>
      <div className={styles.menu_items}>
          {renderLink('/swap', 'Swap', setLink)}
          {renderLink('/pools', 'Pools', setLink)}
          {renderLink('/balance', 'Balance', setLink)}
      </div>

      <div className={styles.menu_themes}>
        <Button className={styles.menu_theme + (theme == Themes.dark ? ` ${styles.active}` : "")} onClick={() => {setTheme(Themes.dark)}}>
          <Logo style={{ width: 20, height: 20 }} />
          <Text className={styles.menu_theme_text}>Dark</Text>
        </Button>
        <Button className={styles.menu_theme + (theme == Themes.light ? ` ${styles.active}` : "")} onClick={() => {setTheme(Themes.light)}}>
          <Logo style={{ width: 20, height: 20 }} />
          <Text className={styles.menu_theme_text}>Light</Text>
        </Button>
      </div>
      
      <div className={styles.menu_footer}>© 2022 Powered by Oraichain</div>
    </div>
  );
});

export default memo(Menu);
