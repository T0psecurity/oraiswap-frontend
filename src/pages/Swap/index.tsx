//@ts-nocheck
import Layout from "layouts/Layout";
import React, { useEffect, useState } from "react";
import style from "./index.module.scss";
import cn from "classnames/bind";
import { TooltipIcon } from "components/Tooltip";
import SettingModal from "./Modals/SettingModal";
import SelectTokenModal from "./Modals/SelectTokenModal";
import { useQuery } from 'react-query'
import { fetchBalance, fetchPairInfo, fetchPool, fetchTaxRate, fetchTokenInfo, generateContractMessages } from "rest/api";
import { Type } from 'pages/Swap';
import { decimal } from "libs/parse";
import CosmJs from "libs/cosmjs";
import { ORAI } from "constants/constants";
import { parseAmount, parseDisplayAmount } from "libs/utils";

const cx = cn.bind(style);

const mockPair = {
  "ORAI-AIRI": {
    contractAddress: "orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v",
  },
  "ORAI-TEST1": {
    contractAddress: "orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v",
  },
  "ORAI-TEST2": {
    contractAddress: "orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v",
  },
  "AIRI-TEST1": {
    contractAddress: "orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v",
  },
  "AIRI-TEST2": {
    contractAddress: "orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v",
  },
};

const mockToken = {
  ORAI: {
    contractAddress: "orai",
    denom: "orai",
    logo: "oraichain.svg",
  },
  AIRI: {
    contractAddress: "orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2",
    logo: "airi.svg",
  },
  TEST1: {
    contractAddress: "orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2",
    logo: "atom.svg",
  },
  TEST2: {
    contractAddress: "orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2",
    logo: "atom.svg",
  },
};

const mockBalance = {
  ORAI: 800000,
  AIRI: 800000,
  TEST1: 800000,
  TEST2: 800000,
};

type TokenName = keyof typeof mockToken;

interface ValidToken {
  title: TokenName;
  balance: number;
  contractAddress: string;
  logo: string;
}

interface SwapProps { }

const Swap: React.FC<SwapProps> = () => {
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [isSelectFrom, setIsSelectFrom] = useState(true);
  const [isSelectTo, setIsSelectTo] = useState(false);
  const [fromToken, setFromToken] = useState<TokenName>("ORAI");
  const [toToken, setToToken] = useState<TokenName>("AIRI");
  const [listValidFrom, setListValidFrom] = useState<ValidToken[]>(
    Object.keys(mockToken).map((name) => {
      return {
        ...mockToken[name as TokenName],
        title: name as TokenName,
        balance: mockBalance[name as TokenName],
      };
    })
  );
  const [listValidTo, setListValidTo] = useState<ValidToken[]>([]);
  const [swapAmount, setSwapAmount] = useState(1);

  const getTokenDenom = (token) => {
    return mockToken[token].denom ? mockToken[token].denom : undefined
  }

  // const { data: taxData, error: taxError, isError: isTaxError, isLoading: isTaxLoading } = useQuery(['tax-rate'], () => fetchTaxRate(whitelist.contracts.oracle));
  // const { data: pairInfoData, error: pairError, isError: isPairInfoError, isLoading: isPairLoading } = useQuery(['pair-info'], () => fetchPairInfo(whitelist.contracts.factory, [{ "native_token": { "denom": "orai" } }, { "token": { "contract_addr": "orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2" } }]));

  // const { data: poolData, error: poolError, isError: isPoolError, isLoading: isPoolLoading } = useQuery(['pool'], () => fetchPool(whitelist.whitelist['orai1gwe4q8gme54wdk0gcrtsh4ykwvd7l9n3dxxas2'].pair));

  const { data: fromTokenInfoData, error: fromTokenInfoError, isError: isFromTokenInfoError, isLoading: isFromTokenInfoLoading } = useQuery(['from-token-info', fromToken], () => fetchTokenInfo(mockToken[fromToken].contractAddress, getTokenDenom(fromToken)));

  const { data: toTokenInfoData, error: toTokenInfoError, isError: isToTokenInfoError, isLoading: isToTokenInfoLoading } = useQuery(['to-token-info', toToken], () => fetchTokenInfo(mockToken[toToken].contractAddress, getTokenDenom(toToken)));

  const { data: fromTokenBalance, error: fromTokenBalanceError, isError: isFromTokenBalanceError, isLoading: isFromTokenBalanceLoading } = useQuery(['from-token-balance', fromToken], () => fetchBalance(mockToken[fromToken].contractAddress, "orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573", getTokenDenom(fromToken)));

  const { data: toTokenBalance, error: toTokenBalanceError, isError: isToTokenBalanceError, isLoading: isLoadingToTokenBalance } = useQuery(['to-token-balance', toToken], () => fetchBalance(mockToken[toToken].contractAddress, "orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573", getTokenDenom(toToken)));

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
  //   console.log("first balance token: ", fromTokenBalance);
  // }, [fromTokenBalance])

  // useEffect(() => {
  //   console.log("second balance token: ", secTokenBalance);
  // }, [secTokenBalance])

  const handleSubmit = async () => {
    try {
      let walletAddr;
      if (await window.Keplr.getKeplr()) walletAddr = await window.Keplr.getKeplrAddr();
      else throw "You have to install Keplr wallet to swap"

      const msgs = await generateContractMessages({
        type: Type.SWAP,
        sender: `${walletAddr}`,
        amount: parseAmount(swapAmount, fromTokenInfoData.decimals),
        from: `${fromTokenInfoData.contract_addr}`,
        to: `${toTokenInfoData.contract_addr}`,
        fromInfo: fromTokenInfoData,
        toInfo: toTokenInfoData,
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

  useEffect(() => {
    let listTo = getListPairedToken(fromToken);
    const listToken = listTo.map((name) => {
      return {
        ...mockToken[name as TokenName],
        title: name as TokenName,
        balance: mockBalance[name as TokenName],
      };
    });
    setListValidTo([...listToken]);
    if (!listTo.includes(toToken)) setToToken(listTo[0] as TokenName);
  }, [fromToken]);

  const getTokenInfo = (contract: string) => {
    return {
      price: 1,
    };
  };

  const getPairInfo = (contract: string) => {
    return {
      token1: "ORAI",
      amount1: 10000,
      token2: "AIRI",
      amount2: 1000,
    };
  };

  const getListPairedToken = (tokenName: TokenName) => {
    let pairs = Object.keys(mockPair).filter((name) =>
      name.includes(tokenName)
    );
    return pairs!.map((name) =>
      name.replace(tokenName, "").replace("-", "")
    );
  };

  return (
    <Layout>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className={cx("container")}>
          <div className={cx("from")}>
            <div className={cx("header")}>
              <div className={cx("title")}>FROM</div>
              <img
                className={cx("btn")}
                src={
                  require("assets/icons/setting.svg").default
                }
                onClick={() => setIsOpenSettingModal(true)}
              />
              <img
                className={cx("btn")}
                src={
                  require("assets/icons/refresh.svg").default
                }
              />
            </div>
            <div className={cx("balance")}>
              <span>Balance: {`${parseDisplayAmount(fromTokenBalance, fromTokenInfoData?.decimals)} ${fromTokenInfoData?.symbol.toUpperCase()}`}</span>
              <div className={cx("btn")}>MAX</div>
              <div className={cx("btn")}>HALF</div>
              <span style={{ flexGrow: 1, textAlign: "right" }}>
                ~$49,780.45
              </span>
            </div>
            <div className={cx("input")}>
              <div
                className={cx("token")}
                onClick={() => setIsSelectFrom(true)}
              >
                <img
                  className={cx("logo")}
                  src={
                    require(`assets/icons/${mockToken[fromToken].logo}`)
                      .default
                  }
                />
                <span>{fromToken}</span>
                <div className={cx("arrow-down")} />
              </div>
              <input className={cx("amount")} />
            </div>
            <div className={cx("fee")}>
              <span>Fee</span>
              <div
                className={cx("token")}
                onClick={() => setIsSelectFrom(true)}
              >
                <img
                  className={cx("logo")}
                  src={
                    require("assets/icons/oraichain.svg")
                      .default
                  }
                />
                <span>AIRI</span>
                <div className={cx("arrow-down")} />
              </div>
            </div>
          </div>
          <div className={cx("swap-icon")}>
            <img
              src={require("assets/icons/ant_swap.svg").default}
              onClick={() => {
                const t = fromToken;
                setFromToken(toToken);
                setToToken(t);
              }}
            />
          </div>
          <div className={cx("from")}>
            <div className={cx("header")}>
              <div className={cx("title")}>TO</div>
            </div>
            <div className={cx("balance")}>
              <span>Balance: {`${parseDisplayAmount(toTokenBalance, toTokenInfoData?.decimals)} ${toTokenInfoData?.symbol.toUpperCase()}`}</span>

              <span style={{ flexGrow: 1, textAlign: "right" }}>
                ~$49,780.45
              </span>
              <TooltipIcon />
            </div>
            <div className={cx("input")}>
              <div
                className={cx("token")}
                onClick={() => setIsSelectTo(true)}
              >
                <img
                  className={cx("logo")}
                  src={
                    require(`assets/icons/${mockToken[toToken].logo}`)
                      .default
                  }
                />
                <span>{toToken}</span>
                <div className={cx("arrow-down")} />
              </div>
              <input className={cx("amount")} />
            </div>
          </div>
          <div
            className={cx("swap-btn")}
            onClick={handleSubmit}
          >
            Swap
          </div>
          <div className={cx("detail")}>
            <div className={cx("row")}>
              <div className={cx("title")}>
                <span>Minimum Received</span>
                <TooltipIcon />
              </div>
              <span>2,959,898.60 AIRI</span>
            </div>
            <div className={cx("row")}>
              <div className={cx("title")}>
                <span>Tx Fee</span>
                <TooltipIcon />
              </div>
              <span>2,959,898.60 AIRI</span>
            </div>
            <div className={cx("row")}>
              <div className={cx("title")}>
                <span>Spread</span>
                <TooltipIcon />
              </div>
              <span>2,959,898.60 AIRI</span>
            </div>
          </div>
          <SettingModal
            isOpen={isOpenSettingModal}
            open={() => setIsOpenSettingModal(true)}
            close={() => setIsOpenSettingModal(false)}
          />

          {isSelectFrom ? (
            <SelectTokenModal
              isOpen={isSelectFrom}
              open={() => setIsSelectFrom(true)}
              close={() => setIsSelectFrom(false)}
              listToken={listValidFrom}
              setToken={setFromToken}
            />
          ) : (
            <SelectTokenModal
              isOpen={isSelectTo}
              open={() => setIsSelectTo(true)}
              close={() => setIsSelectTo(false)}
              listToken={listValidTo}
              setToken={setToToken}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Swap;
