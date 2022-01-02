import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const deamon = new GameInfoDeamon(ns);
    deamon.run();
}

class GameInfoDeamon extends Deamon {

    constructor(ns: NS) {
        super(ns);
    }

    run() {
        this.gameInfoData.bitNodeMultipliers = this.ns.getBitNodeMultipliers();
        this.gameInfoData.ownedSourceFiles = this.ns.getOwnedSourceFiles();
        this.gameInfoData.initialised = true;
    }

}