import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { ORAI } from 'constants/constants';
import { gt } from 'libs/math';
import { insertIf } from 'libs/utils';
import { useContractsAddress, useContract, useCombineKeys } from 'hooks';
import Icon from 'components/Icon';
import { Config } from './useSelectAsset';
import Asset from './Asset';
import styles from './Assets.module.scss';

const cx = classNames.bind(styles);

interface Props extends Config {
  selected?: string;
  onSelect: (asset: string) => void;
}

const Assets = ({ selected, onSelect, ...props }: Props) => {
  const { priceKey, balanceKey } = props;
  const { useORAI, skip, formatTokenName } = props;

  const { listed } = useContractsAddress();
  const { orai, find } = useContract();
  const { loading } = useCombineKeys([priceKey, balanceKey]);

  /* search */
  const [value, setValue] = useState('');

  /* list */
  const list: AssetItem[] = [
    ...insertIf(useORAI, {
      symbol: ORAI,
      name: ORAI,
      price: '1',
      balance: orai
    }),
    ...listed
      .filter(({ symbol }) => !skip?.includes(symbol))
      .map(({ symbol, name, token }) => ({
        symbol,
        name,
        price: priceKey && find(priceKey, token),
        balance: balanceKey && find(balanceKey, token)
      }))
  ];

  return (
    <div className={styles.component}>
      <section className={styles.search}>
        <label htmlFor="search">
          <Icon name="search" size={16} />
        </label>

        <input
          id="search"
          name="search"
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoFocus
        />
      </section>

      <ul className={classNames(styles.list, { loading })}>
        {list
          .filter(({ symbol, name }) =>
            // search result
            [symbol, name].some((text) =>
              text.toLowerCase().includes(value.toLowerCase())
            )
          )
          .sort(({ symbol: a }, { symbol: b }) => {
            const hasA = balanceKey && gt(find(balanceKey, a), 0) ? 1 : 0;
            const hasB = balanceKey && gt(find(balanceKey, b), 0) ? 1 : 0;
            return hasB - hasA;
          })
          .map((item) => {
            const { symbol, price } = item;
            const isSelected = symbol === selected;

            return (
              <li key={symbol}>
                <button
                  type="button"
                  className={cx(styles.button, { disabled: isSelected })}
                  onClick={() => onSelect(symbol)}
                  disabled={priceKey && (!price || !gt(price, 0))}
                >
                  <Asset {...item} formatTokenName={formatTokenName} />
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default Assets;
