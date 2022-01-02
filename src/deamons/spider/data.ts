import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";
import { ServerData } from "/models/ServerData";

export class SpiderData extends Data {
    public routes: Routes = {
        "CSEC": [],
        "avmnite-02h": [],
        "I.I.I.I": [],
        "run4theh111z": [],
        "fulcrumassets": [],
        "w0r1d_d43m0n": []
    };

    public servers: ServerData[] = [];
    public routedServers: ServerData[] = [];
    
    public static instance(ns: NS): SpiderData {
        const port = Data.getDataPort(ns);
        port.spider = port.spider ?? new SpiderData();
        return port.spider;
    }
}

type Routes = {
    [key: string]: string[];
}