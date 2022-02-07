import React from 'react';
import logo from '../images/logo.png';
import Container from '../components/Container';
import styles from './SwapHeader.module.scss';
import LoginWidget from 'components/LoginWidget';
import MESSAGE from 'lang/MESSAGE.json';

const Header = () => {
  return (
    <header className={styles.header}>
      <Container className={styles.container}>
        <section className={styles.wrapper}>
          <a href="https://swap.orai.io">
            <img height={38} className={styles.logo} src={logo} />
          </a>
          Oraiswap
        </section>

        <section className={styles.support}>
          <div className={styles.connect}>
            <LoginWidget text={MESSAGE.Form.Button.ConnectWallet} />
          </div>
        </section>
      </Container>
    </header>
  );
};

export default Header;
