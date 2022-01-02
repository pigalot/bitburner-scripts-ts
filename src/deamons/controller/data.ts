import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class ControllerData extends Data {
    public hello: string = "";
    
    public static instance(ns: NS): ControllerData {
        const port = Data.getDataPort(ns);
        port.scheduler = port.scheduler ?? new ControllerData();
        return port.scheduler;
    }
}