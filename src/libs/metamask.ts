import Web3 from 'web3';
import tokenABI from 'constants/abi/erc20.json';
import { evmTokens, gravityContracts } from 'constants/bridgeTokens';
import GravityABI from 'constants/abi/gravity.json';
import { AbiItem } from 'web3-utils';
import {
  BSC_CHAIN_ID,
  ETHEREUM_CHAIN_ID,
  ORAI_BSC_CONTRACT,
  ORAI_ETH_CONTRACT
} from 'constants/constants';

const ethNetworks: { [key: string]: { [key: string]: string } } = {
  [ETHEREUM_CHAIN_ID]: {
    ORAI: ORAI_ETH_CONTRACT
  },
  [BSC_CHAIN_ID]: {
    ORAI: ORAI_BSC_CONTRACT
  }
};

export default class Metamask {
  constructor() {}

  public isBsc() {
    return window.ethereum?.chainId === BSC_CHAIN_ID;
  }

  public async transferToGravity(
    chainId: string,
    amountVal: string,
    tokenContract: string,
    from: string | null,
    to: string
  ) {
    const balance = Web3.utils.toWei(amountVal);

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });

    const web3 = new Web3(window.ethereum);
    const gravityContractAddr = gravityContracts[chainId] as string;
    if (!gravityContractAddr || !from || !to) return;
    const gravityContract = new web3.eth.Contract(
      GravityABI as AbiItem[],
      gravityContractAddr
    );
    const result = await gravityContract.methods
      .sendToCosmos(tokenContract, to, balance)
      .send({
        from
      });
    return result;
  }

  public async getOraiBalance(address: string | null, denom?: string) {
    const ethNetwork = ethNetworks[window.ethereum?.chainId];
    if (!ethNetwork || !window.ethereum) return '0';

    let provider;
    if (denom) {
      const token = evmTokens.find((item) => item.denom === denom);
      provider = token?.rpc;
    }
    const web3 = new Web3(provider || window.ethereum);
    try {
      const tokenInst = new web3.eth.Contract(
        tokenABI as AbiItem[],
        ethNetwork.ORAI
      );
      const balance = await tokenInst.methods.balanceOf(address).call();
      return balance;
    } catch (ex) {
      return '0';
    }
  }
}
