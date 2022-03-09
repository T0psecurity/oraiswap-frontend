import React, { memo } from "react";
import styles from './Content.module.scss';
import Menu from "./Menu";

interface ContentProps {
  
}
 
const Content: React.FC<ContentProps> = ({children}) => {
  return (
    <div className={styles.content} >
      {children}
    </div> 
  );
}
 
export default memo(Content);