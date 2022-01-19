import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class BladeData extends Data {  
    public static instance(ns: NS): BladeData {
        const port = Data.getDataPort(ns);
        port.blade = port.blade ?? new BladeData();
        return port.blade;
    }
}