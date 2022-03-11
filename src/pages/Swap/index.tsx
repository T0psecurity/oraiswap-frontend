//@ts-nocheck
import Layout from "layouts/Layout";
import React, { useEffect, useState } from "react";
import style from './index.module.scss'
import cn from 'classnames/bind'
import { TooltipIcon } from "components/Tooltip";
import SettingModal from "./Modals/SettingModal";
import SelectTokenModal from "./Modals/SelectTokenModal";
import { useQuery } from 'react-query'
import { fetchBalance, fetchPairInfo, fetchPool, fetchTaxRate, fetchTokenInfo, generateContractMessages } from "rest/api";
import { Type } from 'pages/Swap';
import { decimal } from "libs/parse";
import CosmJs from "libs/cosmjs";
import { ORAI } from "constants/constants";

const cx = cn.bind(style)

const whitelist = {
  "contracts": {
    "gov": "orai102pll8yzs4knwvz0x20ymwauwvq46zk0adkwd8",
    "mirrorToken": "orai1dw9sjfvzm9udg3uqtnrr3cph8ce3welc9ljr83",
    "factory": "orai1d5g77f27jg8wvrrdval36dd5q97rfgn7lmnmra",
    "oracle": "orai1pnujlcvcqwawclat8xrhw80rvjx2yynanpevpn",
    "mint": "orai1ptrsap5h4n0ee29qxqjpgkmhqjc4pewe8j6lxz",
    "staking": "orai1wt65k5ugrpujen6r4unh3lddzr0678erny3f4q",
    "tokenFactory": "orai1n0mdp2fcwuk6mkhuwtwp65upza9z5v0deawvma",
    "collector": "orai18skkp9lsrv3sq0urf682nfk0cs49xdlfx3a0a8"
  },
  "whitelist": {
    "orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2": {
      "symbol": "uAIRI",
      "name": "aiRight Token",
      "token": "orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2",
      "pair": "orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v",
      "lpToken": "orai12dtk9pwlwyum9em2nkeefphsvg0c4ks88a2aju"
    }
  }
};
interface SwapProps {

}

const Swap: React.FC<SwapProps> = () => {
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false)
  const [isOpenSelectTokenModal, setIsOpenSelectTokenModal] = useState(false)

  const { data: taxData, error: taxError, isError: isTaxError, isLoading: isTaxLoading } = useQuery(['tax-rate'], () => fetchTaxRate(whitelist.contracts.oracle));
  const { data: pairInfoData, error: pairError, isError: isPairInfoError, isLoading: isPairLoading } = useQuery(['pair-info'], () => fetchPairInfo(whitelist.contracts.factory, [{ "native_token": { "denom": "orai" } }, { "token": { "contract_addr": "orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2" } }]));

  const { data: poolData, error: poolError, isError: isPoolError, isLoading: isPoolLoading } = useQuery(['pool'], () => fetchPool(whitelist.whitelist['orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2'].pair));

  const { data: firstTokenInfoData, error: firstTokenInfoError, isError: isFirstTokenInfoError, isLoading: isFirstTokenInfoLoading } = useQuery(['token-info'], () => fetchTokenInfo(whitelist.whitelist['orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2'].token));

  const { data: secTokenInfo, error: secTokenInfoError, isError: isSecTokenInfoError, isLoading: isSecTokenInfoLoading } = useQuery(['token-info'], () => fetchTokenInfo(whitelist.whitelist['orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2'].token));

  const { data: firstTokenBalance, error: firstTokenBalanceError, isError: isFirstTokenBalanceError, isLoading: isLoadingFirstTokenBalance } = useQuery(['first-token-balance'], () => fetchBalance(whitelist.whitelist['orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2'].token, "orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573"));

  const { data: secTokenBalance, error: secTokenBalanceError, isError: isSecTokenBalanceError, isLoading: isLoadingSecTokenBalance } = useQuery(['sec-token-balance'], () => fetchBalance('native', "orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573"));

  const parseAmount = (value, decimal) => {
    return `${(parseFloat(value) * Math.pow(10, decimal)).toFixed(0)}`;
  }

  // useEffect(() => {
  //   console.log("data tax rate: ", taxData);
  // }, [taxData])

  // useEffect(() => {
  //   console.log("data pair info rate: ", pairInfoData);
  // }, [pairInfoData])

  // useEffect(() => {
  //   console.log("pool data: ", poolData);
  // }, [poolData])

  // useEffect(() => {
  //   console.log("token info: ", firstTokenInfoData);
  // }, [firstTokenInfoData])

  // useEffect(() => {
  //   console.log("first balance token: ", firstTokenBalance);
  // }, [firstTokenBalance])

  // useEffect(() => {
  //   console.log("second balance token: ", secTokenBalance);
  // }, [secTokenBalance])

  const handleSubmit = async () => {
    console.log("data tax rate: ", taxData);
    console.log("data pair info rate: ", pairInfoData);
    console.log("pool data: ", poolData);
    console.log("token info: ", firstTokenInfoData);
    console.log("first balance token: ", firstTokenBalance);
    console.log("second balance token: ", secTokenBalance);

    try {
      let walletAddr;
      if (await window.Keplr.getKeplr()) walletAddr = await window.Keplr.getKeplrAddr();
      else throw "You have to install Keplr wallet to swap"

      const msgs = await generateContractMessages({
        type: Type.SWAP,
        sender: `${walletAddr}`,
        amount: parseAmount(1, 0),
        from: `${'orai'}`,
        to: `${'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2'}`,
        fromInfo: { denom: 'orai', contract_addr: 'orai' },
        toInfo: { contract_addr: 'orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2' },
      });

      const msg = msgs[0];
      console.log("msgs: ", msgs.map(msg => ({ ...msg, msg: Buffer.from(msg.msg).toString() })));
      const result = await CosmJs.execute({ prefix: ORAI, address: msg.contract, walletAddr, handleMsg: Buffer.from(msg.msg.toString()), gasAmount: { denom: ORAI, amount: "0" }, handleOptions: { funds: msg.sent_funds } });
      console.log("result swap tx hash: ", result);

      if (result) {
        console.log("in correct result");
        return;
      }
    } catch (error) {
      console.log("error in swap form: ", error);
    }
  }

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
          <button className={cx('swap-btn')} onClick={handleSubmit}>Swap</button>
          {/* <div className={cx('swap-btn')}>Swap</div> */}
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
    </Layout >
  );
}

export default Swap;