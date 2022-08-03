import React, { FC } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
import classNames from 'classnames';
import { isNil } from 'ramda';
import { ReactComponent as InfoIcon } from 'assets/icons/info.svg';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import styles from './Tooltip.module.scss';

export const DefaultTippyProps: TippyProps = {
  animation: false,
  interactive: true,
  appendTo: document.body
};

const TooltipTippyProps: TippyProps = {
  ...DefaultTippyProps,
  placement: 'top',
  theme: 'dark-border',
  className: styles.tooltip
};

interface Props extends Omit<TippyProps, 'children'> {
  onClick?: () => void;
}

const Tooltip: FC<Props> = ({ className, onClick, children, ...props }) => {
  const button = (
    <span className={classNames(styles.button, className)} onClick={onClick}>
      {children}
    </span>
  );

  return props.content ? (
    <Tippy
      {...TooltipTippyProps}
      {...props}
      hideOnClick={isNil(props.visible) ? false : undefined}
    >
      {button}
    </Tippy>
  ) : (
    button
  );
};

export const TooltipIcon: FC<Props> = ({ children, ...props }) => (
  <div className={styles.flex}>
    {children}
    <div className={styles.icon}>
      <Tooltip {...props}>
        <InfoIcon name="info" />
      </Tooltip>
    </div>
  </div>
);

export default Tooltip;
