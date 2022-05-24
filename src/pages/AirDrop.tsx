import Big from 'big.js';
import React, { FunctionComponent } from 'react';
import { useQuery } from 'react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'rest/request';

const AirDrop: FunctionComponent = () => {

  const [searchParams] = useSearchParams();
  const addr = searchParams.get("addr");
  const oraiAddr = searchParams.get("oraiAddr");
  const { chain } = useParams();

  const parseAmount = (amount: number) => {
    return new Big(amount).div(Math.pow(10, 6)).toNumber();
  }

  const { data: airdropAmount } = useQuery(
    ['airdrop'],
    () => fetchAirDrop()
  );

  async function fetchAirDrop() {
    let url = `https://airdrop-api.oraidex.io/${chain}/delegator/${addr}`;
    let res: any = (await axios.get(url)).data;

    let response = { delegatedAmount: parseAmount(res.delegated), undelegatedAmount: parseAmount(res.undelegated), available: parseAmount(res.available), lp: 0 };

    try {
      url = `https://airdrop-api.oraidex.io/lp/${chain}/account/${oraiAddr}`;
      res = (await axios.get(url)).data;
      response.lp = res.lp;
    } catch (error) {
      console.log("no airdrop lp for this chain's account");
    }

    return response;
  }

  return (
    <div
      style={{
        width: '100%',
        textAlign: 'center',
        margin: 'auto 0',
        flexDirection: 'column',
        fontSize: 20
      }}
    >
      {!!airdropAmount && (
        <div>
          <div >{`${chain.toUpperCase()} address: ${addr}`}</div>
          <div>{`Delegated amount: ${airdropAmount.delegatedAmount} ${chain.toUpperCase()}`}</div>
          <div>{`Undelegated amount: ${airdropAmount.undelegatedAmount} ${chain.toUpperCase()}`}</div>
          <div>{`Current ${chain.toUpperCase()} balance: ${airdropAmount.available} ${chain.toUpperCase()}`}</div>
          {airdropAmount.lp !== 0 && (<div>{`Total liquidity from address ${oraiAddr}: ${airdropAmount.lp}`}</div>)}
        </div>
      )
      }
    </div>
  );
};

export default AirDrop;
