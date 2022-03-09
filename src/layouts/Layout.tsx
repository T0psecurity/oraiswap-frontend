import React, { memo } from "react";
import Content from "./Content";
import styles from './Layout.module.scss';
import Menu from "./Menu";

interface LayoutProps {
  
}
 
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Menu />
      <Content>
        {children}
      </Content>
    </div> 
  );
}
 
export default memo(Layout);