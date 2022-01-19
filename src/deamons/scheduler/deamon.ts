import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";

import { getGrowTime, getHackTime, getWeakenTime, coreMult } from "gameFunctions.js";
import { ServerData } from "/models/ServerData";
import { Data } from "../Data";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.enableLog("exec");

    //ns.disableLog("sleep");
    ns.clearLog();

    const deamon = new SchedulerDeamon(ns);
    await deamon.run();
}

/*
    this is a ts implimentation of Draks hacking script
    https://github.com/zeddrak/bitburner-scripts
    https://discord.com/channels/415207508303544321/923707505698283560/927176443002228796
*/

class SchedulerDeamon extends Deamon {

    constructor(ns: NS) {
        super(ns);
    }

    async run() {
        const startTime = Date.now();
        this.schedulerData.hackPids = [];
        let testServerLaunch = Date.now(); //test server launch

        let LastTarget = "";
        let lastScore = 0;

        let weakenLaunch = 0
        let growLaunch = 0;
        let hackLaunch = 0;

        let MoneyTol = 0;
        let SecurityTol = 0;

        while (true) {
            await this.ns.sleep(1);
            const target = this.targeterData.targets[0];
            if (!target) return;
            if (target.serverData.name != LastTarget && target.score !== lastScore) {
                const player = this.ns.getPlayer();

                const hackTime = getHackTime(target.serverData.server, player); // time required to finish a minSec Hack //
                const growTime = getGrowTime(target.serverData.server, player); // time required to finish a minSec Grow //
                const weakenTime = getWeakenTime(target.serverData.server, player); // time required to finish a minSec Weaken //

                weakenLaunch = startTime + 500; // weaken launch
                growLaunch = weakenLaunch + weakenTime - growTime - 200; //grow launch
                hackLaunch = growLaunch + growTime - hackTime + 100; //hack launch

                MoneyTol = (1.0 - target.amountHacked) * 0.9 * target.serverData.money; //don't allow more than 1 hack to hit
                SecurityTol = target.serverData.security + 1; //don't allow sec to rise by more than 1

                LastTarget = target.serverData.name;
            }

            if (this.schedulerData.hackPids.length > target.hackProcesses) {
                this.schedulerData.hackPids.slice(0, this.schedulerData.hackPids.length - target.hackProcesses);
            }

            //collission detection
            if (Date.now() > testServerLaunch && this.schedulerData.hackPids.length > 0
                && (
                    ((this.ns.getServerSecurityLevel(target.serverData.name) - SecurityTol) > 0) 
                    || (((this.ns.getServerMoneyAvailable(target.serverData.name) - MoneyTol) < 0))
                    )) {
                this.ns.print("collission?")
                for (let k = 0; k < 5 && this.schedulerData.hackPids.length > 0; k++) { //kill a few of the oldest hacks
                    await this.ns.sleep(0);
                    // @ts-ignore
                    while (this.schedulerData.hackPids.length > 0 && !this.ns.kill(this.schedulerData.hackPids.shift())) { await this.ns.sleep(0) } // kill until a hack is actually killed (or no hacks remain)
                    testServerLaunch = Date.now() + target.cycleLength;
                }
            }
            if (Date.now() > weakenLaunch) {
                this.launchAttack('w', target.serverData.name, target.weakenThreads);
                weakenLaunch = Date.now() + target.cycleLength;
            }
            if (Date.now() > growLaunch) {
                this.launchAttack('g', target.serverData.name, target.growThreads, this.stonksData.effectGrow);
                growLaunch = Date.now() + target.cycleLength;
            }
            if (Date.now() > hackLaunch) {
                this.launchAttack('h', target.serverData.name, target.hackThreads, this.stonksData.effectHack);
                hackLaunch = Date.now() + target.cycleLength;
            }
        }
    }

    launchAttack(type: string, target: string, threads = 1, stonks = false) {
        //const sfi = (type == 'h') ? 3 : (type == 'g') ? 5 : 1; //default to w
        const script = (type == 'h') ? "hack.js" : (type == 'g') ? "grow.js" : "weaken.js";
        const size = this.ns.getScriptRam(script);
        const start = ((type == 'g') ? 0 : 1);
        for (let i = start; i < this.resourceManagerData.resources.length && threads > 0; i++) { //sart at home for grows; largest non-home server for others.
            const resource = this.resourceManagerData.resources[i];
            const maxth = Math.max(0, Math.floor(this.freeRam(resource) / size))
            if (maxth >= 1) {
                //adjust threads needed if server has more cores
                const coreMultiplyer = ((resource.name === 'home') && (type == 'w' || type == 'g')) ? coreMult(resource.server.cpuCores) : 1.0;
                const th = Math.min(Math.max(1, Math.ceil(threads / coreMultiplyer)), maxth); //threads to assign to this attack
                const pid = this.ns.exec(script, resource.name, th, target, th, stonks, Date.now(), i);
                if (pid > 0) {
                    threads -= Math.floor(th * coreMultiplyer);
                    if (type == 'h') { this.schedulerData.hackPids.push(pid); }
                }
            }
        }
    }

    freeRam(server: ServerData) {
        try {
            return server.ram
                - this.ns.getServerUsedRam(server.name)
                - ((server.name == 'home') ? 64 : 0); // TODO: MOVE THIS
        }
        catch { return 0; }
    }
}