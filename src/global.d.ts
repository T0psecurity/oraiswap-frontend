import { BroadCastMode } from '@oraichain/cosmosjs';
import Keplr from './libs/keplr';
import { Keplr as keplr } from './types/kelpr/wallet';

declare global {
    type keplrType = keplr;
    interface Window {
        Keplr: Keplr;
        keplr: keplr;
    }
}

export { };
