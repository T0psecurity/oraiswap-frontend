import Web3 from 'web3';
import tokenABI from 'config/abi/erc20.json';
import {
  evmTokens,
  gravityContracts,
  TokenItemType,
} from 'config/bridgeTokens';
import GravityABI from 'config/abi/gravity.json';
import erc20ABI from 'config/abi/erc20.json';
import { AbiItem } from 'web3-utils';
import { BEP20_ORAI, BSC_CHAIN_ID, ERC20_ORAI, ETHEREUM_CHAIN_ID } from 'config/constants';

export default class Metamask {
  constructor() {}

  public isBsc() {
    return window.ethereum?.chainId === BSC_CHAIN_ID;
  }

  public isEth() {
    return window.ethereum?.chainId === ETHEREUM_CHAIN_ID;
  }

  public async transferToGravity(
    chainId: string,
    amountVal: string,
    tokenContract: string,
    from: string | null,
    to: string
  ) {
    const balance = Web3.utils.toWei(amountVal);

    await window.ethereum.request!({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
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
        from,
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
    await window.ethereum.request!({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
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

    await window.ethereum.request!({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    const allowance = Web3.utils.toWei('99999999999999999');

    const result = await tokenContract.methods
      .approve(spender, allowance)
      .send({
        from: owner,
      });
    return result;
  }

  public getOraiToken(): TokenItemType | undefined {
    return evmTokens.find(
      (token) => token.denom === (this.isBsc() ? BEP20_ORAI : ERC20_ORAI)
    );
  }

  public async getOraiBalance(
    address: string | null,
    inputToken?: TokenItemType
  ) {
    // must has chainId and contractAddress
    const token = inputToken || this.getOraiToken();
    if (!token || !token.contractAddress) return '0';

    try {
      const provider =
        token.chainId !== window.ethereum.chainId ? token.rpc : window.ethereum;

      const web3 = new Web3(provider);
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
