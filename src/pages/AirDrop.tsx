import Big from 'big.js';
import React, { FunctionComponent } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'rest/request';

const AirDrop: FunctionComponent = () => {

  const [searchParams] = useSearchParams();
  const addr = searchParams.get("addr");

  const parseAmount = (amount: number) => {
    return new Big(amount).div(Math.pow(10, 6)).toNumber();
  }

  const { data: airdropAmount, isLoading: isLoading } = useQuery(
    ['airdrop'],
    () => fetchAirDrop()
  );

  async function fetchAirDrop() {
    let url = `https://airdrop-api.oraidex.io/delegator/${addr}`;
    const res: any = (await axios.get(url)).data;
    return { delegatedAmount: parseAmount(res.delegated), undelegatedAmount: parseAmount(res.undelegated), available: parseAmount(res.available) };
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
          <div >{`Cosmos address: ${addr}`}</div>
          <div>{`Delegated amount: ${airdropAmount.delegatedAmount} ATOM`}</div>
          <div>{`Undelegated amount: ${airdropAmount.undelegatedAmount} ATOM`}</div>
          <div>{`Current ATOM balance: ${airdropAmount.available} ATOM`}</div>
        </div>
      )
      }
    </div>
  );
};

export default AirDrop;
