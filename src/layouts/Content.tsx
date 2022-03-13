import React, { memo } from "react";
import styles from './Content.module.scss';
import Menu from "./Menu";

interface ContentProps {
  nonBackground?: boolean;
  children: any;
}
 
const Content: React.FC<ContentProps> = ({children, nonBackground}) => {
  return (
    <div className={styles.content + (nonBackground ? ` non_background` : "")} >
      {children}
    </div> 
  );
}
 
export default memo(Content);