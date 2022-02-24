import * as cosmwasm from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/cosmwasm-stargate/node_modules/@cosmjs/stargate/build'
import { network } from 'constants/networks';
import { Decimal } from "@cosmjs/math";
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

const collectWallet = async () => {
    const keplr = await window.Keplr.getKeplr();
    if (!keplr) {
        throw "You have to install Keplr first if you do not use a mnemonic to sign transactions";
    }
    // use keplr instead
    const wallet = keplr.getOfflineSigner(network.chainId);
    return wallet;
}

class CosmJs {
    /**
     * A wrapper method to execute a smart contract
     * @param args - an object containing essential parameters to execute contract
     * @returns - transaction hash after executing the contract
     */
    static async execute(args: { prefix?: string, walletAddr: string, address: string, handleMsg: string, handleOptions?: HandleOptions, gasAmount: { amount: string, denom: string }, gasLimits?: { exec: 20000000 } }) {
        try {
            const { address, handleMsg, handleOptions, gasAmount, gasLimits, prefix, walletAddr } = args;
            if (await window.Keplr.getKeplr()) await window.Keplr.suggestChain(network.chainId);
            const wallet = await collectWallet();
            const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(network.rpc, wallet, { gasPrice: new GasPrice(Decimal.fromUserInput(gasAmount.amount, 6), gasAmount.denom), prefix, gasLimits: { exec: 200000000 } });
            const input = JSON.parse(handleMsg);
            console.log("rpc: ", network.rpc)
            const result = await client.execute(walletAddr, address, input, undefined, handleOptions?.funds);
            return result;
        } catch (error) {
            console.log("error in executing contract: ", error);
            throw error;
        }
    }
};

export default CosmJs;