import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class AccountantData extends Data {
    public hello: string = "";
    
    public static instance(ns: NS): AccountantData {
        const port = Data.getDataPort(ns);
        port.scheduler = port.scheduler ?? new AccountantData();
        return port.scheduler;
    }
}