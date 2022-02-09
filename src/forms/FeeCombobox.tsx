import React, { FC } from 'react';
import { NATIVE_TOKENS } from 'constants/constants';
import { tokenInfos } from 'rest/usePairs';
import styles from './FeeComboBox.module.scss';
import ComboBox from 'components/ComboBox';

interface FeeComboBoxProps {
  selected?: string;
  onSelect: (asset: string) => void;
}

const FeeComboBox: FC<FeeComboBoxProps> = ({ selected, onSelect }) => {
  const getValue = (value: string) => tokenInfos.get(value)?.symbol ?? '';

  return (
    <ComboBox
      label="Fee:"
      className={styles.container}
      items={NATIVE_TOKENS}
      selected={selected}
      onSelect={onSelect}
      getId={getValue}
      getValue={getValue}
    />
  );
};

export default FeeComboBox;
