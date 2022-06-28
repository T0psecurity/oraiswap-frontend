import * as cosmwasm from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/cosmwasm-stargate/node_modules/@cosmjs/stargate/build';
import { network } from 'config/networks';
import { Decimal } from '@cosmjs/math';
import { OfflineSigner, GasPrice as GasPriceAmino } from '@cosmjs/launchpad';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-launchpad';
/**
 * The options of an .instantiate() call.
 * All properties are optional.
 */
export interface HandleOptions {
  readonly memo?: string;
  /**
   * The funds that are transferred from the sender to the newly created contract.
   * The funds are transferred as part of the message execution after the contract address is
   * created and before the instantiation message is executed by the contract.
   *
   * Only native tokens are supported.
   *
   * TODO: Rename to `funds` for consistency (https://github.com/cosmos/cosmjs/issues/806)
   */
  readonly funds?: readonly Coin[];
}

const collectWallet = async (chainId?: string) => {
  const keplr = await window.Keplr.getKeplr();
  if (!keplr) {
    throw 'You have to install Keplr first if you do not use a mnemonic to sign transactions';
  }
  // use keplr instead
  return await keplr.getOfflineSignerAuto(chainId ?? network.chainId);
};

class CosmJs {
  static async execute(data: {
    prefix?: string;
    walletAddr: string;
    address: string;
    handleMsg: string;
    handleOptions?: HandleOptions;
    gasAmount: { amount: string; denom: string };
    gasLimits?: { exec: number };
  }) {
    try {
      if (await window.Keplr.getKeplr()) {
        await window.Keplr.suggestChain(network.chainId);
        const key = await window.Keplr.getKeplrKey(network.chainId);
        if (key.isNanoLedger) return this.executeAmino(data);
        return this.executeDirect(data);
      } else {
        throw 'You need to install Keplr to execute the contract';
      }
    } catch (error) {
      console.log('error in executing contract: ' + error);
      throw error;
    }
  }

  static async executeAmino({
    address,
    handleMsg,
    handleOptions,
    gasAmount,
    gasLimits = { exec: 2000000 },
    prefix,
    walletAddr
  }: {
    prefix?: string;
    walletAddr: string;
    address: string;
    handleMsg: string;
    handleOptions?: HandleOptions;
    gasAmount: { amount: string; denom: string };
    gasLimits?: { exec: number };
  }) {
    try {
      await window.Keplr.suggestChain(network.chainId);
      const wallet = await collectWallet();

      const client = new SigningCosmWasmClient(
        network.lcd,
        walletAddr,
        wallet as OfflineSigner,
        GasPrice.fromString(gasAmount.amount + gasAmount.denom),
        gasLimits
      );

      const input = JSON.parse(handleMsg);

      const result = await client.execute(
        address,
        input,
        '',
        handleOptions?.funds
      );

      return result;
    } catch (error) {
      console.log('error in executing contract: ' + error);
      throw error;
    }
  }

  /**
   * A wrapper method to execute a smart contract
   * @param args - an object containing essential parameters to execute contract
   * @returns - transaction hash after executing the contract
   */
  static async executeDirect({
    address,
    handleMsg,
    handleOptions,
    gasAmount,
    gasLimits = { exec: 2000000 },
    prefix,
    walletAddr
  }: {
    prefix?: string;
    walletAddr: string;
    address: string;
    handleMsg: string;
    handleOptions?: HandleOptions;
    gasAmount: { amount: string; denom: string };
    gasLimits?: { exec: number };
  }) {
    try {
      const wallet = await collectWallet();
      const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(
        network.rpc,
        wallet,
        {
          gasPrice: new GasPrice(
            Decimal.fromUserInput(gasAmount.amount, 6),
            gasAmount.denom
          ),
          prefix,
          gasLimits
        }
      );
      const input = JSON.parse(handleMsg);
      const result = await client.execute(
        walletAddr,
        address,
        input,
        undefined,
        handleOptions?.funds
      );
      return result;
    } catch (error) {
      console.log('error in executing contract: ', error);
      throw error;
    }
  }
}

export { collectWallet };

export default CosmJs;
