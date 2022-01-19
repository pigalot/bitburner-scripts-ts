import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class StonksData extends Data {
    public isStonks: boolean = false;
    public stonksServer: string = "joesguns";
    public stonksSymble: string = "JGN";

    public forcast: Forcast = { ask: 0, bid: 0 };

    public effectHack: boolean = false;
    public effectGrow: boolean = true;
    
    public static instance(ns: NS): StonksData {
        const port = Data.getDataPort(ns);
        port.stonks = port.stonks ?? new StonksData();
        return port.stonks;
    }
}

export type Forcast = {
    ask: number;
    bid: number;
}