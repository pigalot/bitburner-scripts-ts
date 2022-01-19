import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class SleevesData extends Data {
    public static instance(ns: NS): SleevesData {
        const port = Data.getDataPort(ns);
        port.sleeves = port.sleeves ?? new SleevesData();
        return port.sleeves;
    }
}