//@ts-nocheck

import React from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import useQuerySmart from 'hooks/useQuerySmart';
import { network } from 'constants/networks';
import { Type } from 'pages/Swap';
import { TokenInfo as TokenInfoExtend } from 'types/token';
import { ORAI } from 'constants/constants';

const toQueryMsg = (msg: string) => {
    try {
        return Buffer.from(JSON.stringify(JSON.parse(msg))).toString('base64');
    } catch (error) {
        return '';
    }
};

const querySmart = async (contract: string, msg: string | object) => {
    const params =
        typeof msg === 'string'
            ? toQueryMsg(msg)
            : Buffer.from(JSON.stringify(msg)).toString('base64');
    const url = `${network.lcd}/wasm/v1beta1/contract/${contract}/smart/${params}`;

    const res = (await axios.get(url)).data;
    if (res.code) throw new Error(res.message);
    return res.data;
};

async function fetchTaxRate(oracleAddr: string) {

    const data = await querySmart(oracleAddr, { treasury: { tax_rate: {} } });
    return data
}

async function fetchTokenInfo(tokenAddr: string) {

    const data = await querySmart(tokenAddr, { token_info: {} });
    return data
}

async function fetchPool(pairAddr: string) {

    const data = await querySmart(pairAddr, { pool: {} });
    return data
}

async function fetchPairInfo(factoryAddr: string, assetInfos: any[]) {

    const data = await querySmart(factoryAddr, { pair: { asset_infos: assetInfos } });
    return data
}

async function fetchTokenBalance(tokenAddr: string, walletAddr: string) {

    const data = await querySmart(tokenAddr, { balance: { address: walletAddr } });
    return data.balance;
}

async function fetchNativeTokenBalance(walletAddr: string) {
    const url = `${network.lcd}/cosmos/bank/v1beta1/balances/${walletAddr}`;
    const res: any = (await axios.get(url)).data;
    return parseInt(res.balances.find(balance => balance.denom === ORAI).amount);
}

async function fetchBalance(tokenAddr: string, walletAddr: string) {
    if (tokenAddr === 'native') return fetchNativeTokenBalance(walletAddr);
    else return fetchTokenBalance(tokenAddr, walletAddr);
}

const parseTokenInfo = (tokenInfo: TokenInfoExtend, addr: string, amount?: string) => {
    if (tokenInfo?.denom) return { fund: { denom: addr, amount }, info: { native_token: { denom: addr } } };
    return { info: { token: { contract_addr: addr } } };
}

const handleSentFunds = (...funds: any[]) => {
    let sent_funds = [];
    for (let fund of funds) {
        if (fund) sent_funds.push(fund);
    }
    if (sent_funds.length === 0) return null;
    return sent_funds;
}

async function generateContractMessages(
    query:
        | {
            type: Type.SWAP;
            from: string;
            to: string;
            fromInfo: TokenInfoExtend;
            toInfo: TokenInfoExtend;
            amount: number | string;
            max_spread: number | string;
            belief_price: number | string;
            sender: string;
        }
        | {
            type: Type.PROVIDE;
            from: string;
            to: string;
            fromInfo: TokenInfoExtend;
            toInfo: TokenInfoExtend;
            fromAmount: number | string;
            toAmount: number | string;
            slippage: number | string;
            sender: string;
            pair: string; // oraiswap pair contract addr, handle provide liquidity
        }
        | {
            type: Type.WITHDRAW;
            lpAddr: string;
            amount: number | string;
            sender: string;
            pair: string; // oraiswap pair contract addr, handle withdraw liquidity
        }
) {
    // @ts-ignore
    const { type, amount, sender, from, to, fromAmount, toAmount, lpAddr, fromInfo, toInfo, info, pair, ...params } = query;
    let sent_funds = [];
    // for withdraw & provide liquidity methods, we need to interact with the oraiswap pair contract
    let contractAddr = network.router;
    let input;
    switch (type) {
        case Type.SWAP:
            const { fund: offerSentFund, info: offerInfo } = parseTokenInfo(fromInfo, from, amount.toString());
            const { fund: askSentFund, info: askInfo } = parseTokenInfo(toInfo, to, undefined);
            sent_funds = handleSentFunds(offerSentFund, askSentFund);
            input = {
                execute_swap_operations: {
                    operations: [
                        {
                            orai_swap: {
                                offer_asset_info: offerInfo,
                                ask_asset_info: askInfo
                            }
                        }
                    ]
                }
            };
            break;
        // TODO: provide liquidity and withdraw liquidity
        case Type.PROVIDE:
            const { fund: fromSentFund, info: fromInfoData } = parseTokenInfo(fromInfo, from, fromAmount);
            const { fund: toSentFund, info: toInfoData } = parseTokenInfo(toInfo, to, toAmount);
            sent_funds = handleSentFunds(fromSentFund, toSentFund);
            input = {
                provide_liquidity: {
                    assets: [{
                        info: toInfoData,
                        amount: toAmount
                    },
                    { info: fromInfoData, amount: fromAmount }]
                }
            };
            contractAddr = pair;
            break;
        case Type.WITHDRAW:
            input = {
                send: {
                    owner: sender,
                    contract: pair,
                    amount,
                    msg: "eyJ3aXRoZHJhd19saXF1aWRpdHkiOnt9fQ==" // withdraw liquidity msg in base64
                }
            }
            contractAddr = lpAddr;
            break;
        default:
            break;
    }

    console.log("input: ", input)
    console.log("sent funds: ", sent_funds)
    console.log("contract addr: ", contractAddr)

    const msgs = [
        {
            contract: contractAddr,
            msg: Buffer.from(JSON.stringify(input)),
            sender,
            sent_funds
        }
    ];

    return msgs;
};


export { fetchTaxRate, fetchNativeTokenBalance, fetchPairInfo, fetchPool, fetchTokenBalance, fetchBalance, fetchTokenInfo, generateContractMessages }