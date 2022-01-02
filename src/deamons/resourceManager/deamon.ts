import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";
import { ServerData } from "/models/ServerData.js";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const deamon = new ResourceManagerDeamon(ns);
    await deamon.run();
}

class ResourceManagerDeamon extends Deamon {
    private readonly percentOfHomeRam: number = 0.1;
    private readonly homeRamReserverd: number = 64; // TODO: move this somewhere global

    constructor(ns: NS) {
        super(ns);
    }

    async run() {
        while(true) {
            const resources = [];
            let ram = 0;
            const home = new ServerData(this.ns.getServer('home'));
            resources.push(home);
            ram += Math.max(home.ram - this.homeRamReserverd, 0);
            const purchasedServers = this.ns.getPurchasedServers();

            for(const server of purchasedServers) {
                const serverData = new ServerData(this.ns.getServer(server));
                resources.push(serverData);
                ram += serverData.ram;
            }

            const minRam = home.ram * this.percentOfHomeRam;
            // TODO: do we need to copy the servers array? will it ever get editied while we are working on it? I expect as long as both sides don't sleep while editing we don't.
            for(const server of this.spiderData.routedServers) {
                if (server.ram >= minRam && server.hasRootAccess) {
                    resources.push(server);
                    ram += server.ram;
                }
            }

            resources.push(home); // add home to the end

            this.resourceManagerData.resources = resources;
            this.resourceManagerData.totalRam = ram;

            if (!this.resourceManagerData.initialised) this.resourceManagerData.initialised = true;
            await this.ns.sleep(1000); // TODO: move this somewhere and work out how often this needs to run
        }
    }

}