import { NS, Player, Server } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";
import { getGrowTime, getHackTime, getWeakenTime, growAnalyzeHackAmount, growAnalyzeSecurity, hackAnalyze, hackAnalyzeChance, hackAnalyzeSecurity, weakenAnalyze } from "gameFunctions.js";
import { ServerData } from "/models/ServerData.js";
import { Batch } from "/deamons/targeter/data.js";
import { StaticConfig } from "StaticConfig.js";

import * as nt from "gameFunctionsV2.js"

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const deamon = new TargeterDeamon(ns);
    await deamon.run2();
    await deamon.run(false);
}

/*
    this is a ts implimentation of Draks hacking script
    https://github.com/zeddrak/bitburner-scripts
    https://discord.com/channels/415207508303544321/923707505698283560/927176443002228796
*/

class TargeterDeamon extends Deamon {
    private readonly minBufferTime = 10;
    private readonly maxProcesses = 8000;
    private readonly threadBufferMultiplier = 1.10;
    private readonly MaxHackAmount = 0.95;
    private readonly maxRamToUse = 0.90;

    constructor(ns: NS) {
        super(ns);

    }

    public async run(detail: boolean) {
        while (true) {
            const batches: Batch[] = [];
            const player = this.ns.getPlayer();
            const servers = this.spiderData.routedServers.filter(s => (s.requiredHack <= player.hacking && s.money > 0 && !this.stonksData.isStonks) || (s.name === this.stonksData.stonksServer && this.stonksData.isStonks));
            const maxCost = this.resourceManagerData.totalRam * this.maxRamToUse;
            for (const target of servers) {
                await this.ns.sleep(1);

                let best = this.estimateBestScore(target, 1, player);
                while (best.ramCost / maxCost > 1.0) { //hN 1 profile to expensive, lengrhen cL to reduce cost
                    await this.ns.sleep(0);
                    best = this.estimateBestScore(target, 1, player, Math.ceil(best.calculatedBufferTime * best.ramCost / maxCost));
                }

                if (this.stonksData.isStonks) {
                    batches.push(best);
                    continue; // only need one hack for stonks
                }

                let ret = best;
                let hN = 2;

                do {
                    await this.ns.sleep(0);
                    //check for a better target
                    ret = this.estimateBestScore(target, hN, player);

                    if (ret.score > 0 && maxCost - ret.ramCost > 0 && (hN == 1 || this.MaxHackAmount - ret.amountHacked > 0) && ret.moneyPerMs - best.moneyPerMs > 0) {
                        best = ret;
                    } //new best target
                    if (detail) { hN++; } else { //high detail pass every 10th
                        if (ret.amountHacked < 0.01) { hN += hN < 10 ? 1 : hN < 100 ? 10 : Math.ceil(0.0001 / ret.hackAmount); } //step by 0.01%
                        else { hN += Math.ceil(0.02 / ret.hackAmount); } //step by 0.2%
                    }
                } while ((ret.score > 0) && (maxCost - ret.ramCost > 0) && (this.MaxHackAmount - ret.amountHacked > 0))
                batches.push(best);
            }
            const bestTargets = batches.sort((a, b) => (b.moneyPerMs - a.moneyPerMs > 0) ? 1 : (b.moneyPerMs == a.moneyPerMs) ? ((b.ramCost - a.ramCost > 0) ? -1 : 1) : -1);
            if (bestTargets.length > 0
                && (this.targeterData.targets.length === 0 // empty
                    || bestTargets[0].score > this.targeterData.targets[0].score * 1.1)) { // or 10% better
                this.targeterData.targets = bestTargets
            }
            this.targeterData.initialised = true;
        }
    }

    public async run2() {
        let count = 0;
        do {
            await this.ns.sleep(50);

            const player = this.ns.getPlayer();
            const servers = this.spiderData.routedServers.filter(s => (s.requiredHack <= player.hacking && s.money > 0));

            //update data
            let tars = servers.map(s => s.name);
            let dats = servers.map(s => s.server);
            let bests: any[] = [];

            for (const tardat of dats) {
                await this.ns.sleep(1);
                let tar = tardat.hostname;

                let hN = 1;
                let ret: any = { tar: tar, value: 0, score: 0, cost: 0, hN: 1, cL: StaticConfig.minimumCycleLength };

                const maxCost = StaticConfig.RamUse * this.resourceManagerData.totalRam;
                let bi = bests.findIndex(a => a.tar == tar);
                if (bi == -1) { bi = bests.length; bests.push(ret); } // add the new target to the profiles list
                else if (
                    (maxCost - bests[bi].cost < 0) //overRam, remove profile
                    || (StaticConfig.MaxAmount - bests[bi].amt < 0) //over hack amt limit, remove profile
                    //				|| (bests[bi].cL -1.1*asd.realcL > 0) //to far above realcL, remove profile
                    //				|| (bests[bi].cL -0.9*asd.realcL < 0) //to far below realcL, remove profile
                ) { bests[bi] = ret; } //check that profile is still valid
                do {
                    await this.ns.sleep(0);

                    //check for a better target
                    ret = this.estBestScore(tar, hN, tardat);
                    while (hN == 1 && (ret.cost / maxCost > 1.0)) { //hN 1 profile to expensive, lengrhen cL to reduce cost
                        await this.ns.sleep(0);
                        ret = this.estBestScore(tar, hN, tardat, Math.ceil(ret.cL * ret.cost / maxCost));
                    }
                    if (ret.score > 0 && maxCost - ret.cost > 0 && (hN == 1 || StaticConfig.MaxAmount - ret.amt > 0) && ret.value - bests[bi].value > 0) { //new best target
                        bests[bi] = ret;
                    }
                    if (count % 10 == 9) { hN++; } else { //high detail pass every 10th
                        const hA = nt.hAnalyze(tardat, player); // tardat.hA
                        if (ret.amt < 0.01) { hN += hN < 10 ? 1 : hN < 100 ? 10 : Math.ceil(0.0001 / hA); } //step by 0.01%
                        else { hN += Math.ceil(0.02 / hA); } //step by 0.2%
                    }
                } while ((ret.score > 0) && (maxCost - ret.cost > 0) && (StaticConfig.MaxAmount - ret.amt > 0))
                //updated best profile for server, re-sort and update global to new order (and profile)
            }
            bests.sort((a, b) => (b.value - a.value > 0) ? 1 : (b.value == a.value) ? ((b.cost - a.cost > 0) ? -1 : 1) : -1);
            console.log(bests);
            //asd.bests = bests;
            count++;
        } while (false);
    }

    //  tar is the target server's name (ex 'n00dles') as a string
    //  hN is the desired number of Hack threads to simulate for
    //  tarDat is a server object (ns.getServer()) for the target server, and is optional.
    //    If not provided, the idealized values will be used instead (from MasterData)
    //  cL is used to adjust strategies for high process count lag, and sub 1 hack thread, processes
    //  cores should be used to increase totRam and calculate actual launched threads at time of launch instead
    //    but is provided for here for situations where all or most processes get run on home - for instance
    private estBestScore(tar: string, hN: number, tardat: Server, cL = StaticConfig.minimumCycleLength, cores = 1): any { //tar = target server: string, hN = number of hack threads to model: integer > 0
        const ret: any = { tar: tar, value: 0, score: 0, cost: 0, hN: hN, cL: cL };
        const player = this.ns.getPlayer();
        //determine hack amt, chamce, and thread count numbers for hack, etc. (hN, gN, wN)
        ret.hA = nt.hAnalyze(tardat, player);//tardat.hA; //hack Amount PER THREAD
        ret.amt = ret.hA * ret.hN; //amt hacked (as portion of currentMoney) -- if Hacking/Growing properly, then of MaxMoney
        ret.hS = nt.hAnalyzeSecurity(ret.hN); //amount of security generated by each hack
        const postHackSec = Math.min(100, tardat.minDifficulty + ret.hS); //security level after hack hits (max 100)
        ret.gN = Math.max(1, Math.ceil(StaticConfig.BufferThreads * nt.gAnalyzeLost(tardat, player, ret.amt, postHackSec))); //number of Grow threads needed to offset each hack
        ret.gS = nt.gAnalyzeSecurity(ret.gN); //amount of security generated by the Grow threads
        const postGrowSec = Math.min(100, tardat.minDifficulty + ret.gS); //security level after hack hits
        ret.hC = 0.5 * (nt.hAnalyzeChance(tardat, player) + nt.hAnalyzeChance(tardat, player, postGrowSec));  // chance for a successful hack (at avg of minSec and minSec+growSec) - basically, assume hack lands first about half the time
        ret.maxSI = 100 - tardat.minDifficulty; // Caps weaken threads (max security is 100, so max security needing weaken is 100-minSec)
        ret.wA = nt.wAnalyze(1, cores); //amount of security offset by each weaken thread
        ret.wN = Math.max(1, Math.ceil(Math.min(ret.maxSI, (2 * StaticConfig.BufferThreads * (ret.hS + ret.gS))) / ret.wA)); // number of weaken threads needed to offset each HackGrow pair

        //determine process counts
        ret.hT = nt.getHTime(tardat, player);//tardat.hT; // time required to finish a minSec Hack
        ret.gT = nt.getGTime(tardat, player);//tardat.gT; // time required to finish a minSec Grow
        ret.wT = nt.getWTime(tardat, player);//tardat.wT; // time required to finish a minSec Weaken
        //	ret.bT = Math.ceil(Math.max(cL, (ret.hT * 8.2 / 3.0 / mc.MaxProcess))); // Buffer Time between attacks
        ret.cL = Math.ceil(Math.max(cL, (ret.hT * 8.2 / StaticConfig.MaxProcess)));//cL; // length of a cycle (hgw)
        ret.hP = Math.ceil(ret.hT / ret.cL); //number of Hack processes continuously running
        ret.gP = Math.ceil(ret.gT / ret.cL); //number of Grow processes continuously running
        ret.wP = Math.ceil(ret.wT / ret.cL); //number of Weaken processes continuously running
        ret.totP = ret.hP + ret.gP + ret.wP; //total number of processes needed to run this profile

        //put it all together
        ret.cost = this.ns.getScriptRam('hack.js') * ret.hN * ret.hP + this.ns.getScriptRam('grow.js') * ret.gN * ret.gP + this.ns.getScriptRam('weak.js') * ret.wN * ret.wP; //cost in GB
        ret.value = ret.amt * tardat.moneyMax * ret.hC / ret.cL; // $ per millisecond
        ret.score = ret.value / ret.cost; // $ / ms / GB
        return ret;
    }

    /** 
     * @param hackThreads Must be an interger > 0
     */
    private estimateBestScore(target: ServerData, hackThreads: number, player: Player, bufferTime = this.minBufferTime, cores = 1): Batch {
        //const ret = { score: 0, tar: tar, hN: hN };
        //if (tardat == {}) try { tardat = asd.servers.dat[asd.servers.dat.indexof(tar) + 1]; } catch { return ret; }
        //if (tardat == {}) { return ret; } //can't get dat, abort

        const hackScriptSize = 1.70;
        const growScriptSize = 1.75;
        const weakenScriptSize = 1.75;

        const hackAmount = hackAnalyze(target.server, player, this.gameInfoData.bitNodeMultipliers?.ScriptHackMoney ?? 1); //PER THREAD
        const amountHacked = hackAmount * hackThreads; //amt hacked (as portion of currentMoney) -- if Hacking/Growing properly, then of MaxMoney
        const hackSecurity = hackAnalyzeSecurity(hackThreads); //amount of security generated by each hack
        const postHackSecurity = Math.min(100, target.security + hackSecurity); //security level after hack hits (max 100) //

        let growThreads = Math.max(1, Math.ceil(this.threadBufferMultiplier * growAnalyzeHackAmount(target.server, player, amountHacked, this.gameInfoData.bitNodeMultipliers?.ServerGrowthRate ?? 1, postHackSecurity))); //number of Grow threads needed to offset each hack
        if (this.stonksData.isStonks) growThreads = 1;
        const growSecurity = growAnalyzeSecurity(growThreads); //amount of security generated by the Grow threads
        const postGrowSec = Math.min(100, target.security + growSecurity);

        const hackChance = 0.5 * (hackAnalyzeChance(target.server, player) + hackAnalyzeChance(target.server, player, postGrowSec)); // chance for a successful hack (at minSec)

        const maxSecurityToWeaken = 100 - target.security; // Caps weaken threads (max security is 100, so max security needing weaken is 100-minSec)

        const weakenAmountOffset = weakenAnalyze(1, cores); //amount of security offset by each weaken thread
        const weakenThreads = Math.max(1, Math.ceil(Math.min(maxSecurityToWeaken, (2 * this.threadBufferMultiplier * (hackSecurity + growSecurity))) / weakenAmountOffset)); // number of weaken threads needed to offset each HackGrow pair

        const hackTime = getHackTime(target.server, player, target.security); // time required to finish a minSec Hack //
        const growTime = getGrowTime(target.server, player, target.security); // time required to finish a minSec Grow //
        const weakenTime = getWeakenTime(target.server, player, target.security); // time required to finish a minSec Weaken //

        const calculatedBufferTime = Math.ceil(Math.max(bufferTime, (hackTime * 8.2 / 3.0 / this.maxProcesses))); // Buffer Time between attacks
        const cycleLength = 3.0 * calculatedBufferTime; // length of a cycle (hgw)

        const hackProcesses = Math.ceil(hackTime / cycleLength); //number of Hack processes continuously running
        const growProcesses = Math.ceil(1.0 * growTime / cycleLength); //number of Grow processes continuously running
        const weakenProcesses = Math.ceil(1.0 * weakenTime / cycleLength); //number of Weaken processes continuously running
        const totalProcesses = hackProcesses + growProcesses + weakenProcesses; //total number of processes to run this profile

        const moneyPerMs = amountHacked * target.money * hackChance / cycleLength; // $ per millisecond
        const ramCost = hackScriptSize * hackThreads * hackProcesses + 1 *
            growScriptSize * growThreads * growProcesses + 1 *
            weakenScriptSize * weakenThreads * weakenProcesses; //cost in GB
        const score = moneyPerMs / ramCost; // $ / ms / GB
        return {
            serverData: target, // tar

            hackAmount, // hA
            amountHacked, // amt

            hackThreads, // hN
            growThreads, // gN
            weakenThreads, // wN

            hackProcesses, // hP
            growProcesses, // gP
            weakenProcesses, // wP
            totalProcesses, // totP

            hackTime, //hT

            calculatedBufferTime, // bT
            cycleLength, // cL

            moneyPerMs, // value
            ramCost, // cost
            score, // score
        };
    }

}