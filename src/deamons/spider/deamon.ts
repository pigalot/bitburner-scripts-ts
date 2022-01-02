import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";
import { ServerData } from "/models/ServerData.js";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const deamon = new SpiderDeamon(ns);
    await deamon.run();
}

class SpiderDeamon extends Deamon {
    constructor(ns: NS) {
        super(ns);
    }

    public async run() {
        const servers = ['home'];
        this.spiderData.servers = [];
        this.spiderData.routedServers = [];
        for (const server of servers) {
            for (const childServer of (this.ns.scan(server).slice(server === 'home' ? 0 : 1))) { //home has no parent to skip
                servers.push(childServer);
                const serverData = new ServerData(this.ns.getServer(childServer));
                serverData.hasRootAccess = this.getRootAccess(serverData);
                this.spiderData.servers.push(serverData);
                await this.ns.scp(["hack.js", "grow.js", "weaken.js"], "home", childServer);
                if (serverData.hasRootAccess) this.spiderData.routedServers.push(serverData);
            }
        }
        for (const target of Object.keys(this.spiderData.routes)) {
            this.recursiveScan('', 'home', target, this.spiderData.routes[target]);
        }
        this.spiderData.initialised = true;
    }

    private recursiveScan(parent : string, server : string, target : string, route  : string[]) {
        const children = this.ns.scan(server);
        for (let child of children) {
            if (parent == child) {
                continue;
            }
            if (child == target) {
                route.unshift(child);
                route.unshift(server);
                return true;
            }
    
            if (this.recursiveScan(server, child, target, route)) {
                route.unshift(server);
                return true;
            }
        }
        return false;
    }

    private getRootAccess(server: ServerData) {
        const portAccessTools = {
          "BruteSSH.exe": this.ns.brutessh,
          "FTPCrack.exe": this.ns.ftpcrack,
          "RelaySMTP.exe": this.ns.relaysmtp,
          "HTTPWorm.exe": this.ns.httpworm,
          "SQLInject.exe": this.ns.sqlinject,
        };
    
        let openPorts = 0;
    
        for (const [name, func] of Object.entries(portAccessTools)) {
          if (this.ns.fileExists(name)) {
            func(server.name);
            openPorts++;
          }
        }
    
        if (openPorts >= server.portsRequired) {
            this.ns.nuke(server.name);
          return true;
        }
        return false;
    }
}