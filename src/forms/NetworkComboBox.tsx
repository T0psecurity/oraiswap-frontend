import React from 'react';
import networks, { network } from 'constants/networks';
import ComboBox from 'components/ComboBox';
import { NetworkConfig } from 'types/network';
import styles from './NetworkComboBox.module.scss';

const NetworkComboBox = () => {
  const items = Object.values(networks);

  const onNetworkSelect = (item: NetworkConfig) => {
    localStorage.setItem('network', item.id);
    window.location.reload();
  };

  return (
    <ComboBox
      label="Network:"
      className={styles.container}
      items={items}
      selected={network}
      onSelect={onNetworkSelect}
      getId={(item: NetworkConfig) => item.id}
      getValue={(item: NetworkConfig) => item.chainId}
    />
  );
};

export default NetworkComboBox;
