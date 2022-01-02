import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class ExampleData extends Data {
    public hello: string = "";
    
    public static instance(ns: NS): ExampleData {
        const port = Data.getDataPort(ns);
        port.scheduler = port.scheduler ?? new ExampleData();
        return port.scheduler;
    }
}