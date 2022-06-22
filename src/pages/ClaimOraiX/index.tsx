import Big from 'big.js';
import React, { FunctionComponent, memo, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'rest/request';
import Loader from 'components/Loader';
import useGlobalState from 'hooks/useGlobalState';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import bech32 from 'bech32';
import { ORAI, ORAIX_DENOM } from 'config/constants';
import Content from 'layouts/Content';
import { parseAmountFromWithDecimal, reduceString } from 'libs/utils';
import { network } from 'config/networks';
import { generateClaimMsg, Type } from 'rest/api';
import CosmJs from 'libs/cosmjs';
import { isMobile, isIOS, isAndroid } from '@walletconnect/browser-utils';
import SelectTokenModal from '../Swap/Modals/SelectTokenModal';
import styles from './index.module.scss';
import { ReactComponent as LogoFull } from 'assets/images/OraiDEX_light.svg';
const ORAIX_CLAIM_URL = process.env.REACT_APP_ORAIX_CLAIM_URL;
const ORAIX_CLAIM_CONTRACT = process.env.REACT_APP_ORAIX_CLAIM_CONTRACT;
const arrayToken = [
  {
    denom: 'orai',
    name: 'ORAI',
  },
  {
    denom: 'atom-oraidex',
    name: 'ATOM (OraiDEX)',
  },
  {
    denom: 'atom-cosmos-hub',
    name: 'ATOM (Cosmos Hub)',
  },
  {
    denom: 'osmo',
    name: 'OSMO',
  },
  {
    denom: 'juno',
    name: 'JUNO',
  },
  {
    denom: 'kwt-milky',
    name: 'KWT-MILKY',
  },
  {
    denom: 'airi',
    name: 'AIRI',
  },
];

const objNetwork = {
  osmo: { network: 'osmo', stage: 14 },
  orai: { network: 'orai', stage: 13 },
  airi: { network: 'orai', stage: 15 },
  cosmos: { network: 'cosmos', stage: 10 },
  juno: { network: 'juno', stage: 11 },
  'atom-oraidex': { network: 'orai', stage: 16 },
  'atom-cosmos-hub': { network: 'orai', stage: 10 },
  'kwt-milky': { network: 'orai', stage: 12 },
};

type objNetworkKey = keyof typeof objNetwork;

const ClaimOraiX: FunctionComponent = () => {
  const [claimLoading, setClaimLoading] = useState(false);
  const [address] = useGlobalState('address');
  const [claimed, setIsClaimed] = useState(false);
  // const { network: userNetwork } = useParams();
  const [userNetwork, setUserNetWork] = useState('orai');
  const [isSelect, setIsSelect] = useState(false);
  const networkMapping = objNetwork[userNetwork as objNetworkKey]
    ? objNetwork[userNetwork as objNetworkKey]
    : { network: 'orai', stage: 1 };
  const networkConvert = networkMapping.network || ORAI;
  const getAddressStrFromAnotherAddr = (address: string) => {
    const fullWords = bech32.decode(address);
    if (fullWords.words) {
      return bech32.encode(networkConvert, fullWords.words);
    }
  };

  const ClaimOraiXBox = memo<Object>(({}) => {
    return (
      <>
        {address && !!networkConvert && (
          <div className={styles.pairbox}>
            <div className={styles.pairbox_header}>
              <div className={styles.pairbox_logos}>
                <LogoFull className={styles.pairbox_logo} />
              </div>
              <div className={styles.pairbox_pair}>
                <div className={styles.pairbox_pair_name}>
                  {`${
                    address &&
                    reduceString(
                      getAddressStrFromAnotherAddr(address)!,
                      networkConvert.length + 5,
                      10
                    )
                  }`}
                </div>
                <div
                  className={styles.pairbox_modal}
                  onClick={() => setIsSelect(true)}
                >
                  <span>{userNetwork}</span>
                  <div className={styles.pairbox_oraix_bonus} />
                </div>
                <span className={styles.pairbox_pair_apr}>ORAIX Bonus</span>
              </div>
            </div>
            <div className={styles.pairbox_content}>
              {oraiXAmount && (
                <div>
                  <div className={styles.pairbox_data}>
                    <span className={styles.pairbox_data_name}>
                      Total ORAIX
                    </span>
                    <span className={styles.pairbox_data_value}>
                      {!isLoading &&
                        !!oraiXAmount &&
                        parseAmountFromWithDecimal(
                          parseInt((parseInt(oraiXAmount) / 0.4).toString()),
                          6
                        ).toString()}{' '}
                      {ORAIX_DENOM}
                    </span>
                  </div>
                  <div className={styles.pairbox_data}>
                    <span className={styles.pairbox_data_name}>Claimable</span>
                    <span className={styles.pairbox_data_value}>
                      {!isLoading && !isClaimed
                        ? parseAmountFromWithDecimal(
                            parseInt(oraiXAmount),
                            6
                          ).toString()
                        : 0}{' '}
                      {ORAIX_DENOM}
                    </span>
                  </div>
                  <div className={styles.pairbox_data}>
                    <span className={styles.pairbox_data_name}>Claimed</span>
                    <span className={styles.pairbox_data_value}>
                      {!isLoading && isClaimed
                        ? parseAmountFromWithDecimal(
                            parseInt(oraiXAmount),
                            6
                          ).toString()
                        : 0}{' '}
                      {ORAIX_DENOM}
                    </span>
                  </div>
                </div>
              )}
              <div className={styles.pairbox_data}>
                <span className={styles.pairbox_data_name}>Whitelisted</span>
                <span className={styles.pairbox_data_value}>
                  {oraiXAmount ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>
            {/* && isMobile() */}
            {!isClaimedLoading && (
              <div>
                {!isClaimed && !!oraiXAmount && (isIOS() || isAndroid()) && (
                  <button
                    className={styles.pairbox_btn}
                    onClick={handleClaim}
                    disabled={claimLoading}
                  >
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {claimLoading && (
                        <div style={{ marginRight: 5 }}>
                          <Loader width={25} height={25} />
                        </div>
                      )}
                      <div>Claim {ORAIX_DENOM}</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: '5%', fontSize: 18}}>
          To claim ORAIX from the Claimable section, please use the OWallet app
          ( {' '}
          <a
            style={{ color: 'green' }}
            href="https://apps.apple.com/app/owallet/id1626035069"
          >
            iOS
          </a>
          {' '} / {' '}
          <a
            style={{ color: 'green' }}
            href="https://play.google.com/store/apps/details?id=com.io.owallet"
          >
            Android
          </a>
          {' '} )
        </div>
      </>
    );
  });

  const useQueryConfig = {
    enabled: !!address,
    retry: 1,
    retryDelay: 3000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };

  const handleClaim = async () => {
    try {
      setClaimLoading(true);
      // get merkle proof
      const { data: proofs } = await fetchProof();

      const msg = generateClaimMsg({
        type: Type.CLAIM_ORAIX,
        sender: address,
        stage: networkMapping.stage,
        amount: oraiXAmount,
        proofs,
      });

      const result = await CosmJs.execute({
        prefix: ORAI,
        address: msg.contract,
        walletAddr: address,
        handleMsg: msg.msg.toString(),
        gasAmount: { denom: ORAI, amount: '0' },
      });
      console.log('result swap tx hash: ', result);

      setTimeout(() => {
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `${network.explorer}/txs/${result.transactionHash}`,
        });
        setClaimLoading(false);
        setIsClaimed(true);
        setUserNetWork(userNetwork);
      }, 5000);
    } catch (error: any) {
      console.log('error message handle claim: ', error);
      setClaimLoading(false);
      return displayToast(TToastType.TX_FAILED, {
        message: error.message,
      });
    }
  };

  const { data: oraiXAmount, isLoading: isLoading } = useQuery(
    ['claim-oraix', address, claimed, userNetwork],
    () => fetchClaimOraiX(),
    useQueryConfig
  );

  console.log({ oraiXAmount });

  const { data: isClaimed, isLoading: isClaimedLoading } = useQuery(
    ['is-claimed', address, claimed, userNetwork],
    () => fetchIsClaimed(),
    useQueryConfig
  );

  async function fetchClaimOraiX() {
    try {
      const result = await axios.get(
        `${ORAIX_CLAIM_URL}/proof/amount/${userNetwork}?address=${address}`
      );
      if (result.status === 404) return undefined;
      const { data: amount } = result.data;
      return amount;
    } catch (error) {
      console.log('error fetch claim oraix: ', error);
      return undefined;
    }
  }

  async function fetchIsClaimed() {
    const msg = JSON.stringify({
      is_claimed: {
        address,
        stage: objNetwork[userNetwork as objNetworkKey].stage,
      },
    });
    const { data } = (
      await axios.get(
        `${
          network.lcd
        }/wasm/v1beta1/contract/${ORAIX_CLAIM_CONTRACT}/smart/${btoa(msg)}`
      )
    ).data;
    console.log('data is claimed: ', data.is_claimed);

    return data.is_claimed;
  }

  async function fetchProof() {
    const res: any = (
      await axios.get(
        `${ORAIX_CLAIM_URL}/proof/${userNetwork}?address=${address}&amount=${oraiXAmount}`
      )
    ).data;
    return res;
  }

  return (
    <Content>
      <div
        style={{
          width: '100%',
          height: '100%',
          textAlign: 'center',
          margin: 'auto 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          fontSize: 20,
        }}
      >
        <ClaimOraiXBox />
        <SelectTokenModal
          isOpen={isSelect}
          open={() => setIsSelect(true)}
          close={() => setIsSelect(false)}
          listToken={arrayToken}
          setToken={setUserNetWork}
          icon={true}
        />
      </div>
    </Content>
  );
};

export default ClaimOraiX;
