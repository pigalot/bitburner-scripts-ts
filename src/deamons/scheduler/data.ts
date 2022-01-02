import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class SchedulerData extends Data {
    public hackPids: number[] = [];
    
    public static instance(ns: NS): SchedulerData {
        const port = Data.getDataPort(ns);
        port.scheduler = port.scheduler ?? new SchedulerData();
        return port.scheduler;
    }
}