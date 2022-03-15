import React, { memo } from 'react';
import styles from './Content.module.scss';
import classNames from 'classnames';

interface ContentProps {
  nonBackground?: boolean;
  children: any;
}

const Content: React.FC<ContentProps> = ({ children, nonBackground }) => {
  return (
    <div
      className={classNames(styles.content, { non_background: nonBackground })}
    >
      {children}
    </div>
  );
};

export default memo(Content);
