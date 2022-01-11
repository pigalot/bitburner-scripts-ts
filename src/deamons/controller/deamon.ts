import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";

// Notes
// TODO: optimise hacknet servers by queuing up the same upgrade for all identical servers,
//          this way optimisation only needs to be done on weekest server and copyed for
//          any with the same stats. weekest server will always be the last created.

export async function main(ns: NS) {
    //ns.disableLog("ALL");
    ns.disableLog("sleep");
    ns.clearLog();

    const deamon = new ControllerDeamon(ns);
    await deamon.run();
}

class ControllerDeamon extends Deamon {
    private saveButton: HTMLButtonElement | null = null;

    constructor(ns: NS) {
        super(ns);
        // const hook2 = eval("document").getElementById("overview-extra-hook-2")
        // const tbody = hook2.parentElement.parentElement.parentElement;
        // const button = tbody.children[tbody.children - 1].children[0].children[0];
        // if (button.type === "button") {
        //     this.saveButton = button;
        // }
    }

    async run() {
        // @ts-ignore

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

        // Get our static server data.
        this.ns.run("/deamons/spider/deamon.js");
        do {
            await this.ns.sleep(100);
        } while (this.spiderData.initialised === false)

        // Get servers we can run stuff on
        this.ns.run("/deamons/resourceManager/deamon.js");
        do {
            await this.ns.sleep(100);
        } while (this.resourceManagerData.initialised === false)

        this.ns.run("/deamons/stonks/deamon.js");
        do {
            await this.ns.sleep(100);
        } while (this.stonksData.initialised === false)

        this.ns.run("/deamons/targeter/deamon.js");
        do {
            await this.ns.sleep(100);
        } while (this.targeterData.initialised === false)

        this.ns.run("/deamons/scheduler/deamon.js");

        this.ns.run("/deamons/watcher/deamon.js");
    }

    // async save() {
    //     if (this.saveButton === null) {
    //         // TODO add option to disable this
    //         throw new Error("Save button not found could not auto save.")
    //     }
    //     this.saveButton.click();
    //     // TODO: wait fo save to finish
    // }
}