import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class AccountantData extends Data {
    
    public static instance(ns: NS): AccountantData {
        const port = Data.getDataPort(ns);
        port.accountant = port.accountant ?? new AccountantData();
        return port.accountant;
    }
}