import { Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes as defaultStargateTypes } from '@cosmjs/stargate';
import { MsgExecuteContract } from '@cosmjs/cosmwasm-stargate/build/codec/cosmwasm/wasm/v1beta1/tx';

const cosmwasmRegistry = new Registry(defaultStargateTypes);
cosmwasmRegistry.register('/cosmwasm.wasm.v1beta1.MsgExecuteContract', MsgExecuteContract); // Replace with your own type URL and Msg class

export default cosmwasmRegistry;
