import React from 'react';
import logo from '../images/logo.png';
import styles from './Header.module.scss';
import LoginWidget from 'components/LoginWidget';
import MESSAGE from 'lang/MESSAGE.json';
import LoginMetamask from 'components/LoginMetamask';
import useLocalStorage from 'libs/useLocalStorage';

const Header = () => {
  const [address, setAddress] = useLocalStorage<String>('address');
  const onAddress = (address: string) => {
    setAddress(address);
  };
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <section className={styles.wrapper}>
          <a className={styles.logo} href="https://swap.orai.io">
            <img src={logo} />
          </a>
          <span>Oraiswap</span>
        </section>

        <section className={styles.support}>
          <div className={styles.connect}>
            <LoginWidget
              onAddress={onAddress}
              text={MESSAGE.Form.Button.ConnectKeplr}
            />
            <LoginMetamask text={MESSAGE.Form.Button.ConnectMetamask} />
          </div>
        </section>
      </div>
    </header>
  );
};

export default Header;
