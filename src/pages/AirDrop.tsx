import React, { FunctionComponent } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'rest/request';

const AirDrop: FunctionComponent = () => {

  const [searchParams] = useSearchParams();
  const addr = searchParams.get("addr");

  const { data: airdropAmount, isLoading: isLoading } = useQuery(
    ['airdrop'],
    () => fetchAirDrop()
  );

  async function fetchAirDrop() {
    let url = `http://localhost:3000/airdrop/${addr}`;
    // const res: any = (await axios.get(url)).data;
    return 1000;
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
      <div>{`Airdrop address: ${addr}`}</div>
      <div>{`Airdrop amount: ${airdropAmount}`}</div>
    </div>
  );
};

export default AirDrop;
