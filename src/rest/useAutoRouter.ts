//@ts-nocheck
import { div, times } from 'libs/math';
import { toAmount } from 'libs/parse';
import { Type } from 'pages/Swap';
import { useEffect, useMemo, useState } from 'react';
import useAPI, { SimulatedData } from './useAPI';
import { tokenInfos } from './usePairs';
import { Coin } from '@cosmjs/cosmwasm-stargate/build/codec/cosmos/base/v1beta1/coin';
import { TokenInfo } from 'types/token';

type Params = {
  from: string;
  to: string;
  fromInfo: TokenInfo;
  toInfo: TokenInfo;
  amount: number | string;
  type?: Type;
};

function sleep(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t));
}

const useAutoRouter = (params: Params) => {
  const { from, to, type, amount, fromInfo, toInfo } = params;
  // const amount = 1;
  const { generateContractMessages, querySimulate } = useAPI();
  const [isLoading, setIsLoading] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [simulatedAmounts, setSimulatedAmounts] = useState<number[]>([]);
  const [autoRefreshTicker, setAutoRefreshTicker] = useState(false);
  const profitableQuery = useMemo(() => {
    if (simulatedAmounts?.length > 0) {
      const index = simulatedAmounts.indexOf(
        Math.max(...simulatedAmounts.map((item) => (!item ? -1 : item)))
      );
      const simulatedAmount = simulatedAmounts[index];
      if (simulatedAmount < 0) {
        return undefined;
      }
      const msg = msgs[index];
      const execute_msg = (Array.isArray(msg) ? msg[0] : msg)
        ?.execute_msg as any;
      const tokenRoutes: string[] = [];
      const operations: any[] =
        execute_msg?.execute_swap_operations?.operations ||
        execute_msg?.send?.msg?.execute_swap_operations?.operations;
      if (operations) {
        operations.forEach((operation, index) => {
          if (operation?.terra_swap?.offer_asset_info?.native_token?.denom) {
            tokenRoutes.push(
              operation?.terra_swap?.offer_asset_info?.native_token?.denom
            );
          } else if (
            operation?.terra_swap?.offer_asset_info?.token?.contract_addr
          ) {
            tokenRoutes.push(
              operation?.terra_swap?.offer_asset_info?.token?.contract_addr
            );
          } else if (operation?.native_swap?.offer_denom) {
            tokenRoutes.push(operation?.native_swap?.offer_denom);
          }

          if (index >= operations.length - 1) {
            if (operation?.terra_swap?.ask_asset_info?.native_token?.denom) {
              tokenRoutes.push(
                operation?.terra_swap?.ask_asset_info?.native_token?.denom
              );
            } else if (
              operation?.terra_swap?.ask_asset_info?.token?.contract_addr
            ) {
              tokenRoutes.push(
                operation?.terra_swap?.ask_asset_info?.token?.contract_addr
              );
            } else if (operation?.native_swap?.ask_denom) {
              tokenRoutes.push(operation?.native_swap?.ask_denom);
            }
          }
        });
      }

      const tokenInfo = tokenInfos.get(to);
      const e = Math.pow(10, tokenInfo?.decimals || 6);
      return {
        msg,
        index,
        simulatedAmount,
        tokenRoutes,
        price: div(times(amount, e), simulatedAmount)
      };
    }
    return undefined;
  }, [to, amount, msgs, simulatedAmounts]);

  useEffect(() => {
    let isCanceled = false;
    const fetchMessages = async () => {
      if (!from || !to || !amount || !type) {
        return;
      }
      if (type === Type.PROVIDE || type === Type.WITHDRAW) {
        return;
      }
      const res = await generateContractMessages({
        type: Type.SWAP,
        amount,
        from,
        to,
        fromInfo,
        toInfo,
        sender: '-',
        max_spread: 0,
        belief_price: 0
      });
      if (Array.isArray(res) && !isCanceled) {
        setMsgs(res);
      }
    };
    setIsLoading(true);
    setMsgs([]);
    setSimulatedAmounts([]);
    const timerId = setTimeout(() => {
      fetchMessages();
    }, 500);

    return () => {
      clearTimeout(timerId);
      isCanceled = true;
    };
  }, [amount, from, generateContractMessages, to, type, autoRefreshTicker]);

  useEffect(() => {
    const timerId = setInterval(() => {
      if (window?.navigator?.onLine && window?.document?.hasFocus()) {
        setAutoRefreshTicker((current) => !current);
      }
    }, 30000);
    return () => {
      clearInterval(timerId);
    };
  }, [amount, from, to, type]);

  useEffect(() => {
    let isCanceled = false;
    const request = async () => {
      const simulateQueries = msgs.map((item) => {
        let { contract, msg } = (Array.isArray(item) ? item[0] : item) as any;

        const execute_msg = JSON.parse(msg.toString());

        if (execute_msg?.send) {
          contract = execute_msg?.send?.contract;
          execute_msg = execute_msg?.send?.msg;
        }
        if (execute_msg?.execute_swap_operations) {
          const { operations } = execute_msg.execute_swap_operations;
          return {
            contract,
            msg: {
              simulate_swap_operations: {
                offer_amount: toAmount(`${amount}`, from),
                operations
              }
            }
          };
        }
        if (execute_msg?.swap) {
          const offer_asset = execute_msg?.swap?.offer_asset || {
            amount: toAmount(`${amount}`, from),
            info: {
              token: {
                contract_addr: from
              }
            }
          };

          return {
            contract,
            msg: {
              simulation: { offer_asset }
            }
          };
        }
        return undefined;
      });

      const result: any[] = [];

      simulateQueries.forEach(async (query, index) => {
        if (isCanceled) {
          return;
        }

        await sleep(100 * index);

        const res: SimulatedData = await querySimulate(query);
        if (res) {
          result[index] = res;
        }
        if (isCanceled) {
          return;
        }

        if (index >= simulateQueries.length - 1) {
          // wait for all query done
          for (let i = 0; i < 30; i++) {
            if (JSON.parse(JSON.stringify(result)).includes(null)) {
              await sleep(100);
            }
          }

          setSimulatedAmounts(
            result
              .map((result) => {
                if (result?.return_amount) {
                  return parseInt(result?.return_amount, 10);
                }
                if (result?.amount) {
                  return parseInt(result?.amount, 10);
                }
                return -1;
              })
              .map((item) => (Number.isNaN(Number(item)) ? -1 : item))
          );
          setIsLoading(false);
        }
      });
    };

    setSimulatedAmounts([]);
    request();

    return () => {
      isCanceled = true;
    };
  }, [amount, from, msgs, querySimulate]);

  return {
    isLoading,
    profitableQuery
  };
};

export default useAutoRouter;
