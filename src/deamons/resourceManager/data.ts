import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";
import { ServerData } from "/models/ServerData.js";

export class ResourceManagerData extends Data {
    public resources: ServerData[] = [];
    public totalRam: number = 0;
    public homeCoreMult: number = 0;
    
    public static instance(ns: NS): ResourceManagerData {
        const port = Data.getDataPort(ns);
        port.resourceManager = port.resourceManager ?? new ResourceManagerData();
        return port.resourceManager;
    }
}