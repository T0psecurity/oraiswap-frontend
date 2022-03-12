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
        amount1: 100,
        amount2: 1000,
    },
    "ORAI-TEST1": {
        contractAddress: "orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v",
        amount1: 100,
        amount2: 1000,
    },
    "ORAI-TEST2": {
        contractAddress: "orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v",
        amount1: 100,
        amount2: 1000,
    },
    "AIRI-TEST1": {
        contractAddress: "orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v",
        amount1: 100,
        amount2: 1000,
    },
    "AIRI-TEST2": {
        contractAddress: "orai14n2lr3trew60d2cpu2xrraq5zjm8jrn8fqan8v",
        amount1: 100,
        amount2: 1000,
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
    AIRI: 80000.09,
    TEST1: 8000.122,
    TEST2: 800.3434,
};

const mockPrice = {
    ORAI: 5.01,
    AIRI: 0.89,
    TEST1: 1,
    TEST2: 1,
};

function numberWithCommas(x: number) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

type TokenName = keyof typeof mockToken;
type PairName = keyof typeof mockPair;

interface ValidToken {
    title: TokenName;
    balance: number;
    contractAddress: string;
    logo: string;
}

interface SwapProps {}

const Swap: React.FC<SwapProps> = () => {
    const allToken: ValidToken[] = Object.keys(mockToken).map((name) => {
        return {
            ...mockToken[name as TokenName],
            title: name as TokenName,
            balance: mockBalance[name as TokenName],
        };
    });
    const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
    const [isSelectFrom, setIsSelectFrom] = useState(false);
    const [isSelectTo, setIsSelectTo] = useState(false);
    const [isSelectFee, setIsSelectFee] = useState(false);
    const [fromToken, setFromToken] = useState<TokenName>("ORAI");
    const [toToken, setToToken] = useState<TokenName>("AIRI");
    const [feeToken, setFeeToken] = useState<TokenName>("AIRI");
    const [listValidTo, setListValidTo] = useState<ValidToken[]>([]);
    const [fromAmount, setFromAmount] = useState(0);
    const [toAmount, setToAmount] = useState(0);
    const [currentPair, setCurrentPair] = useState<PairName>("ORAI-AIRI");
    const [fromToRatio, setFromToRatio] = useState(0);
    const [slippage, setSlippage] = useState(1);

    useEffect(() => {
        let listTo = getListPairedToken(fromToken);
        const listToken = allToken.filter((t) => listTo.includes(t.title));
        setListValidTo([...listToken]);
        if (!listTo.includes(toToken)) setToToken(listTo[0] as TokenName);
    }, [fromToken]);

    useEffect(() => {
        const pairName = Object.keys(mockPair).find(
            (p) => p.includes(fromToken) && p.includes(toToken)
        );
        setCurrentPair(pairName as PairName);

        const { amount1, amount2 } = mockPair[pairName as PairName];
        let rate;
        if (currentPair.indexOf(fromToken) === 0) rate = amount2 / amount1;
        else rate = amount1 / amount2;
        setFromToRatio(rate);
    }, [fromToken, toToken]);

    const onChangeFromAmount = (amount: number) => {
        setFromAmount(amount);
        setToAmount(amount * fromToRatio);
    };

    const onChangeToAmount = (amount: number) => {
        setToAmount(amount);
        setFromAmount(amount / fromToRatio);
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
                            <span>{`Balance: ${numberWithCommas(
                                +mockBalance[fromToken].toFixed(2)
                            )} ${fromToken}`}</span>
                            <div
                                className={cx("btn")}
                                onClick={() =>
                                    onChangeFromAmount(mockBalance[fromToken])
                                }
                            >
                                MAX
                            </div>
                            <div
                                className={cx("btn")}
                                onClick={() =>
                                    onChangeFromAmount(
                                        mockBalance[fromToken] / 2
                                    )
                                }
                            >
                                HALF
                            </div>
                            <span style={{ flexGrow: 1, textAlign: "right" }}>
                                {`~$${numberWithCommas(
                                    +(
                                        mockBalance[fromToken] *
                                        mockPrice[fromToken]
                                    ).toFixed(2)
                                )}`}
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
                            <input
                                className={cx("amount")}
                                value={!!fromAmount ? fromAmount : ""}
                                placeholder="0"
                                type="number"
                                onChange={(e) => {
                                    onChangeFromAmount(+e.target.value);
                                }}
                            />
                        </div>
                        <div className={cx("fee")}>
                            <span>Fee</span>
                            <div
                                className={cx("token")}
                                onClick={() => setIsSelectFee(true)}
                            >
                                <img
                                    className={cx("logo")}
                                    src={
                                        require(`assets/icons/${mockToken[feeToken].logo}`)
                                            .default
                                    }
                                />
                                <span>{feeToken}</span>
                                <div className={cx("arrow-down")} />
                            </div>
                        </div>
                    </div>
                    <div className={cx("swap-icon")}>
                        <img
                            src={require("assets/icons/ant_swap.svg").default}
                            onClick={() => {
                                const t = fromToken,
                                    k = fromAmount;
                                setFromToken(toToken);
                                setToToken(t);
                                setFromAmount(toAmount);
                                setToAmount(fromAmount);
                            }}
                        />
                    </div>
                    <div className={cx("from")}>
                        <div className={cx("header")}>
                            <div className={cx("title")}>TO</div>
                        </div>
                        <div className={cx("balance")}>
                            <span>{`Balance: ${numberWithCommas(
                                +mockBalance[toToken].toFixed(2)
                            )} ${toToken}`}</span>

                            <span style={{ flexGrow: 1, textAlign: "right" }}>
                                {`1 ${fromToken} ≈ ${numberWithCommas(
                                    +fromToRatio.toFixed(2)
                                )} ${toToken}`}
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
                            <input
                                className={cx("amount")}
                                value={!!toAmount ? toAmount : ""}
                                placeholder="0"
                                type="number"
                                onChange={(e) => {
                                    onChangeToAmount(+e.target.value);
                                }}
                            />
                        </div>
                    </div>
                    <div className={cx("swap-btn")} onClick={() => {}}>
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
                        slippage={slippage}
                        setSlippage={setSlippage}
                    />

                    {isSelectFrom ? (
                        <SelectTokenModal
                            isOpen={isSelectFrom}
                            open={() => setIsSelectFrom(true)}
                            close={() => setIsSelectFrom(false)}
                            listToken={allToken}
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
                    <SelectTokenModal
                        isOpen={isSelectFee}
                        open={() => setIsSelectFee(true)}
                        close={() => setIsSelectFee(false)}
                        listToken={allToken}
                        setToken={setFeeToken}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Swap;
