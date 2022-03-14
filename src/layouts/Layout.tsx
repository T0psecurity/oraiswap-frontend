import { ThemeContext } from "context/theme-context";
import React, { memo, useContext } from "react";
import Content from "./Content";
import styles from './Layout.module.scss';
import Menu from "./Menu";

interface LayoutProps {
  nonBackground?: boolean;
  children: any;
}
 
const Layout: React.FC<LayoutProps> = ({ children, nonBackground }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${styles.layout} ${theme}`}>
      <Menu />
      <Content nonBackground={nonBackground}>
        {children}
      </Content>
    </div> 
  );
}
 
export default memo(Layout);