import { Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes as defaultStargateTypes } from '@cosmjs/stargate';
import { MsgSendToEth } from 'libs/proto/gravity/v1/msgs';

const gravityRegistry = new Registry(defaultStargateTypes);
gravityRegistry.register('/gravity.v1.MsgSendToEth', MsgSendToEth); // Replace with your own type URL and Msg class

export default gravityRegistry;
