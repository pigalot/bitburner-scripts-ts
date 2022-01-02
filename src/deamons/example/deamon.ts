import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const deamon = new ExampleDeamon(ns);
}

class ExampleDeamon extends Deamon {

    constructor(ns: NS) {
        super(ns);
        
    }

}