import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class StanekData extends Data {
    public hello: string = "";
    
    public static instance(ns: NS): StanekData {
        const port = Data.getDataPort(ns);
        port.stanek = port.stanek ?? new StanekData();
        return port.stanek;
    }
}