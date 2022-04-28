import Web3 from 'web3';
import tokenABI from 'constants/abi/erc20.json';
import {
  evmTokens,
  gravityContracts,
  TokenItemType
} from 'constants/bridgeTokens';
import GravityABI from 'constants/abi/gravity.json';
import erc20ABI from 'constants/abi/erc20.json';
import { AbiItem } from 'web3-utils';
import { BSC_CHAIN_ID } from 'constants/constants';

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

  public async checkOrIncreaseAllowance(
    chainId: string,
    tokenAddr: string,
    owner: string,
    spender: string,
    amount: string
  ) {
    const weiAmount = Web3.utils.toWei(amount);
    const web3 = new Web3(window.ethereum);
    const tokenContract = new web3.eth.Contract(
      erc20ABI as AbiItem[],
      tokenAddr
    );
    const currentAllowance = await tokenContract.methods
      .allowance(owner, spender)
      .call();

    if (+currentAllowance >= +weiAmount) return;

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
    const allowance = Web3.utils.toWei('99999999999999999');

    const result = await tokenContract.methods
      .approve(spender, allowance)
      .send({
        from: owner
      });
    return result;
  }

  public getOraiToken(): TokenItemType | undefined {
    return evmTokens.find(
      (token) => token.denom === (this.isBsc() ? 'bep20_orai' : 'erc20_orai')
    );
  }

  public async getOraiBalance(
    address: string | null,
    inputToken?: TokenItemType
  ) {
    // must has chainId and contractAddress
    const token = inputToken || this.getOraiToken();
    if (!token || !token.contractAddress) return '0';

    const provider =
      token.chainId !== window.ethereum.chainId ? token.rpc : window.ethereum;

    const web3 = new Web3(provider);
    try {
      const tokenInst = new web3.eth.Contract(
        tokenABI as AbiItem[],
        token.contractAddress
      );
      const balance = await tokenInst.methods.balanceOf(address).call();
      return balance;
    } catch (ex) {
      return '0';
    }
  }
}
