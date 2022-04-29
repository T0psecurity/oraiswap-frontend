import React, { memo } from 'react';
import styles from './Content.module.scss';
import classNames from 'classnames';
import useTheme from 'hooks/useTheme';

interface ContentProps {
  nonBackground?: boolean;
  children: any;
}

const Content: React.FC<ContentProps> = ({ children, nonBackground }) => {
  const theme = useTheme();
  return (
    <div
      className={classNames(styles.content, styles[theme], {
        non_background: nonBackground
      })}
    >
      {children}
    </div>
  );
};

export default memo(Content);
