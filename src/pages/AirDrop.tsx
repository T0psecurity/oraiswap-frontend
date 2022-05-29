import Big from 'big.js';
import { FunctionComponent, useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import axios from 'rest/request';
import cn from 'classnames/bind';
import styles from './index.module.scss';
import { Input } from 'antd';
import { bech32 } from 'bech32-2.0';
import _ from 'lodash';

const cx = cn.bind(styles);

const CustomInput: React.FC<{ chainName: string, address: string, onChange: any }> = ({ chainName, address, onChange }) => {
  return (
    <div className={cx('input')}>
      <Input
        placeholder={`Paste your ${chainName} address here `}
        type="text"
        value={address}
        onChange={onChange}
        style={{
          width: '100%',
          textAlign: 'center',
          padding: 10
        }}
      />
    </div>
  )
}

const chainDenomMap = {
  cosmos: 'atom',
}

const AirDrop: FunctionComponent = () => {

  const { chain } = useParams();
  const chainUpper = chain.toUpperCase();
  const [oraiAddress, setOraiAddress] = useState('');
  const [otherNetworkAddr, setOtherNetworkAddr] = useState('');

  const parseAmount = (amount: number) => {
    if (typeof amount === 'number' && isFinite(amount) && !isNaN(amount)) return new Big(amount).div(Math.pow(10, 6)).toNumber();
    return 0;
  }

  const filterAddress = (prefix: string, address: string) => {
    const totalLength = prefix.length + 39;
    try {
      const result = bech32.decode(address, totalLength);
      if (result.prefix === prefix) return true;
    } catch (error) {
    }
    return false;
  }

  const useQueryProps = { retry: 1, retryDelay: 3000, refetchOnMount: false, refetchOnWindowFocus: false, refetchOnReconnect: false };
  const timeout = 20000;

  const handleotherNetworkAddrChange = _.throttle(({ target }) => {
    setOtherNetworkAddr(target.value || '')
  }, 2000, { trailing: true })

  const handleOraiAddrChange = _.throttle(({ target }) => {
    setOraiAddress(target.value || '')
  }, 2000, { trailing: true })

  const { data: airdropAmount } = useQuery(
    ['airdrop', otherNetworkAddr],
    () => fetchAirDrop(), { enabled: !!otherNetworkAddr, ...useQueryProps }
  );

  const { data: airdropLp } = useQuery(
    ['airdrop-lp', oraiAddress],
    () => fetchAirDropLp(), { enabled: !!oraiAddress, ...useQueryProps }
  );

  async function fetchAirDrop() {
    if (!filterAddress(chain, otherNetworkAddr)) return;
    let url = `https://airdrop-api.oraidex.io/${chain}/delegator/${otherNetworkAddr}`;
    let res: any = (await axios.get(url, { timeout })).data;

    let response = { delegatedAmount: parseAmount(res.delegated), undelegatedAmount: parseAmount(res.undelegated), available: parseAmount(res.available) };

    return response;
  }

  async function fetchAirDropLp() {
    if (!filterAddress('orai', oraiAddress)) return;
    try {
      let url = `https://airdrop-api.oraidex.io/lp/${chain}/account/${oraiAddress}`;
      let res = (await axios.get(url, { timeout })).data;
      const denom = Object.keys(res).find(key => key === chainDenomMap[`${chain}`]);
      return { denom, ...res };
    } catch (error) {
      console.log("no airdrop lp for this chain's account");
      return null;
    }
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
      {chain !== 'cosmos' && (<CustomInput chainName={chainUpper} address={otherNetworkAddr} onChange={handleotherNetworkAddrChange} />)}
      {chain === 'cosmos' && <CustomInput chainName={"ORAI"} address={oraiAddress} onChange={handleOraiAddrChange} />}

      {!!airdropAmount && (
        <div style={{ marginTop: 10 }}>
          <div >{`${chainUpper} address: ${otherNetworkAddr}`}</div>
          <div>{`Delegated amount: ${airdropAmount.delegatedAmount} ${chainUpper}`}</div>
          <div>{`Undelegated amount: ${airdropAmount.undelegatedAmount} ${chainUpper}`}</div>
          <div>{`Current ${chainUpper} balance: ${airdropAmount.available} ${chainUpper}`}</div>
        </div>
      )
      }
      {!!airdropLp && !isNaN(airdropLp.lp) && (
        <div>
          <div>{`Total liquidity in ${airdropLp.denom.toUpperCase()}-ORAI: ${airdropLp.lp} LP`}</div>
          <div>{`Total IBC ${airdropLp.denom.toUpperCase()} on Oraichain: ${airdropLp[airdropLp.denom]} ${airdropLp.denom.toUpperCase()}`}</div>
        </div>

      )}
    </div>
  );
};

export default AirDrop;

