import React, { FC, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ComboBox.module.scss';
import Icon from 'components/Icon';

const cx = classNames.bind(styles);

interface Props {
  className?: string;
  selected?: any;
  label?: string;
  onSelect: (value: any) => void;
  getId?: (value: any) => string;
  getValue?: (value: any) => React.ReactChild;
  items: any[];
  headerClass?: string;
  listContainerClass?: string;
}

const ComboBox: FC<Props> = ({
  selected,
  onSelect,
  className,
  getValue = (value) => value.name ?? value,
  getId = (value) => value.id ?? value,
  label,
  items,
  headerClass,
  listContainerClass
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(selected);
  const toggling = () => setIsOpen(!isOpen);

  useEffect(() => {
    // need update selectedOption when selected changed
    setSelectedOption(selected);
  }, [selected]);

  const onOptionClicked = (value: string) => {
    setSelectedOption(value);
    onSelect(value);
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
    <div className={classNames(cx(styles.body), className)}>
      {label && <div className={cx(styles.label)}>{label}</div>}
      <div className={cx(styles.container)} onClick={toggling}>
        <div
          className={[
            cx(styles.header, headerClass),
            isOpen ? cx(styles['header--open']) : ''
          ].join(' ')}
        >
          <div>{getValue(selectedOption)}</div>
          <Icon name={isOpen ? 'expand_less' : 'expand_more'} size={24} />
        </div>
        {isOpen && (
          <div className={cx(styles.listcontainer, listContainerClass)}>
            <ul className={cx(styles.list)}>
              {items
                .filter((value) => getId(value) !== getId(selectedOption))
                .map((value) => (
                  <li
                    key={getId(value)}
                    className={styles.listitem}
                    onClick={() => onOptionClicked(value)}
                  >
                    {getValue(value)}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboBox;
