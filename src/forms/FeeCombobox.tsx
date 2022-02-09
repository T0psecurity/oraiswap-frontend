import React, { FC } from 'react';
import { NATIVE_TOKENS } from 'constants/constants';
import { tokenInfos } from 'rest/usePairs';
import ComboBox from 'components/ComboBox';

interface FeeComboBoxProps {
  selected?: string;
  onSelect: (asset: string) => void;
}

const FeeComboBox: FC<FeeComboBoxProps> = ({ selected, onSelect }) => {
  const getValue = (value: string) => tokenInfos.get(value)?.symbol ?? '';

  const items = NATIVE_TOKENS.filter((value) => {
    if (
      tokenInfos.get(value)?.name === selected ||
      tokenInfos.get(value)?.symbol === selected
    ) {
      return false;
    }
    return true;
  });

  return (
    <ComboBox
      // label="Fee:"
      items={items}
      selected={selected}
      onSelect={onSelect}
      getValue={getValue}
    />
  );
};

export default FeeComboBox;
