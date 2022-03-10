import Layout from "layouts/Layout";
import React, { useState } from "react";
import style from './index.module.scss'
import cn from 'classnames/bind'
import { TooltipIcon } from "components/Tooltip";
import SettingModal from "./Modals/SettingModal";
import SelectTokenModal from "./Modals/SelectTokenModal";

const cx = cn.bind(style)

interface SwapProps {

}

const Swap: React.FC<SwapProps> = () => {
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false)
  const [isOpenSelectTokenModal, setIsOpenSelectTokenModal] = useState(false)

  return (
    <Layout>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className={cx('container')}>
          <div className={cx('from')}>
            <div className={cx('header')}>
              <div className={cx('title')}>FROM</div>
              <img className={cx('btn')} src={require('assets/icons/setting.svg').default}
                onClick={() => setIsOpenSettingModal(true)} />
              <img className={cx('btn')} src={require('assets/icons/refresh.svg').default} />
            </div>
            <div className={cx('balance')}>
              <span>Balance: 8,291.09 ORAI</span>
              <div className={cx('btn')}>MAX</div>
              <div className={cx('btn')}>HALF</div>
              <span style={{ flexGrow: 1, textAlign: 'right' }}>~$49,780.45</span>
            </div>
            <div className={cx('input')}>
              <div className={cx('token')} onClick={() => setIsOpenSelectTokenModal(true)}>
                <img className={cx('logo')} src={require('assets/icons/oraichain.svg').default} />
                <span>ORAI</span>
                <div className={cx('arrow-down')} /></div>
              <input className={cx('amount')} />
            </div>
            <div className={cx('fee')}>
              <span>Fee</span>
              <div className={cx('token')} onClick={() => setIsOpenSelectTokenModal(true)}>
                <img className={cx('logo')} src={require('assets/icons/oraichain.svg').default} />
                <span>AIRI</span>
                <div className={cx('arrow-down')} />
              </div>
            </div>
          </div>
          <div className={cx('swap-icon')}>
            <img src={require('assets/icons/ant_swap.svg').default} />
          </div>
          <div className={cx('from')}>
            <div className={cx('header')}>
              <div className={cx('title')}>TO</div>
            </div>
            <div className={cx('balance')}>
              <span>Balance: 8,291.09 ORAI</span>

              <span style={{ flexGrow: 1, textAlign: 'right' }}>~$49,780.45</span>
              <TooltipIcon />
            </div>
            <div className={cx('input')}>
              <div className={cx('token')} onClick={() => setIsOpenSelectTokenModal(true)}>
                <img className={cx('logo')} src={require('assets/icons/oraichain.svg').default} />
                <span>ORAI</span>
                <div className={cx('arrow-down')} /></div>
              <input className={cx('amount')} />
            </div>

          </div>
          <div className={cx('swap-btn')}>Swap</div>
          <div className={cx('detail')}>
            <div className={cx('row')}>
              <div className={cx('title')}>
                <span>Minimum Received</span>
                <TooltipIcon />
              </div>
              <span>2,959,898.60 AIRI</span>
            </div>
            <div className={cx('row')}>
              <div className={cx('title')}>
                <span>Tx Fee</span>
                <TooltipIcon />
              </div>
              <span>2,959,898.60 AIRI</span>
            </div>
            <div className={cx('row')}>
              <div className={cx('title')}>
                <span>Spread</span>
                <TooltipIcon />
              </div>
              <span>2,959,898.60 AIRI</span>
            </div>
          </div>
          <SettingModal isOpen={isOpenSettingModal}
            open={() => setIsOpenSettingModal(true)}
            close={() => setIsOpenSettingModal(false)} />

          <SelectTokenModal isOpen={isOpenSelectTokenModal}
            open={() => setIsOpenSelectTokenModal(true)}
            close={() => setIsOpenSelectTokenModal(false)} />

        </div>


      </div>
    </Layout>
  );
}

export default Swap;