import Layout from "layouts/Layout";
import React, { useEffect, useState } from "react";
import style from "./index.module.scss";
import cn from "classnames/bind";
import { TooltipIcon } from "components/Tooltip";
import SettingModal from "./Modals/SettingModal";
import SelectTokenModal from "./Modals/SelectTokenModal";

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
        contractAddress: "native",
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

interface SwapProps {}

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
                            <span>Balance: 8,291.09 ORAI</span>
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
                            <span>Balance: 8,291.09 ORAI</span>

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
                        onClick={() => {
                            setFromToken("AIRI");
                        }}
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
