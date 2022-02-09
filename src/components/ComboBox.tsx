import React, { FC, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ComboBox.module.scss';
import Icon from 'components/Icon';

const cx = classNames.bind(styles);

interface Props {
  selected?: string;
  label?: string;
  onSelect: (asset: string) => void;
  getValue?: (value: string) => string;
  items: string[];
}

const ComboBox: FC<Props> = ({
  selected,
  onSelect,
  getValue = (value) => value,
  label,
  items
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(selected);
  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = (value: string) => {
    setSelectedOption(value);
    onSelect(getValue(value));
    setIsOpen(false);
  };

  useEffect(() => {
    const handleWindowClick = () => {
      setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('click', handleWindowClick);
    }
    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, [isOpen]);

  return (
    <div className={cx(styles.body)}>
      {label && <div className={cx(styles.label)}>{label}</div>}
      <div className={cx(styles.container)} onClick={toggling}>
        <div
          className={[
            cx(styles.header),
            isOpen ? cx(styles['header--open']) : ''
          ].join(' ')}
        >
          <div>{selectedOption ? getValue(selectedOption) : ''}</div>
          <Icon name={isOpen ? 'expand_less' : 'expand_more'} size={24} />
        </div>
        {isOpen && (
          <div className={cx(styles.listcontainer)}>
            <ul className={cx(styles.list)}>
              {items.map((value) => {
                return (
                  <li
                    key={value}
                    className={styles.listitem}
                    onClick={() => onOptionClicked(value)}
                  >
                    {getValue(value)}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboBox;
