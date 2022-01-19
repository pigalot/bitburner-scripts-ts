import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";

/* Notes
    TODO: Accountant!!!
    TODO: Stats
    TODO: Asset manager - private servers and exes
    TODO: contracts script
    TODO: Faction script
    TODO: Augs script
    TODO: Simple Gang script
    TODO: Simple stocks trading script
    TODO: Hacknet Script
    TODO: optimise hacknet servers by queuing up the same upgrade for all identical servers,
        this way optimisation only needs to be done on weekest server and copyed for
        any with the same stats. weekest server will always be the last created.
    TODO: Resource allocation (like accountant but for ram)
*/

export async function main(ns: NS) {
    //ns.disableLog("ALL");
    ns.disableLog("sleep");
    ns.clearLog();

    const deamon = new ControllerDeamon(ns);
    await deamon.run();
}

class ControllerDeamon extends Deamon {
    constructor(ns: NS) {
        super(ns);
    }

    async run() {
        this.gameInfoData.initialised = false;
        this.spiderData.initialised = false;
        this.resourceManagerData.initialised = false;
        this.targeterData.initialised = false;
        this.stonksData.initialised = false;

        // Get basic game info like bitNode multipliers
        this.ns.run("/deamons/gameInfo/deamon.js");
        do {
            await this.ns.sleep(100);

        } while (this.gameInfoData.initialised === false)

        // // Get our static server data.
        this.ns.run("/deamons/spider/deamon.js");
        do {
            await this.ns.sleep(100);
        } while (this.spiderData.initialised === false)

        // // Get servers we can run stuff on
        this.ns.run("/deamons/resourceManager/deamon.js");
        do {
            await this.ns.sleep(100);
        } while (this.resourceManagerData.initialised === false)

        // if (this.stonksData.isStonks === true) {
        //     this.ns.run("/deamons/stonks/deamon.js");
        //     do {
        //         await this.ns.sleep(100);
        //     } while (this.stonksData.initialised === false)
        // }

        this.ns.run("/deamons/targeter/deamon.js");
        do {
            await this.ns.sleep(100);
        } while (this.targeterData.initialised === false)

        this.ns.run("/deamons/sleeves/deamon.js");
        do {
            await this.ns.sleep(100);
        } while (this.sleevesData.initialised === false)

        this.ns.run("/deamons/blade/deamon.js");

        //this.ns.run("/deamons/watcher/deamon.js");

        //this.ns.run("/deamons/scheduler/deamon.js");

        while(true) {
            await this.ns.sleep(10 * 60 * 1000);
        }
    }
}