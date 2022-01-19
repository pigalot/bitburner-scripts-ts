import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class ControllerData extends Data {
    
    public static instance(ns: NS): ControllerData {
        const port = Data.getDataPort(ns);
        port.controller = port.controller ?? new ControllerData();
        return port.controller;
    }
}