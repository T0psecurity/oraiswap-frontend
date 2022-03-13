import Layout from "layouts/Layout";
import React, { memo } from "react";
import styles from './index.module.scss';
import { ReactComponent as Logo } from "assets/icons/logo.svg";
import { Button, Input } from "antd";
const { Search } = Input;

interface PoolDetailProps {
  
}

 
const PoolDetail: React.FC<PoolDetailProps> = () => {
  return (
    <Layout nonBackground={true}>
      Pool detail
    </Layout>
  );
}
 
export default PoolDetail;