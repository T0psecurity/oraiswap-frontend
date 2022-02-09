import React from 'react';
import logo from '../images/logo.png';
import Container from '../components/Container';
import styles from './Header.module.scss';
import LoginWidget from 'components/LoginWidget';
import MESSAGE from 'lang/MESSAGE.json';

const Header = () => {
  return (
    <header className={styles.header}>
      <Container className={styles.container}>
        <section className={styles.wrapper}>
          <a className={styles.logo} href="https://swap.orai.io">
            <img src={logo} />
          </a>
          <span>Oraiswap</span>
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
