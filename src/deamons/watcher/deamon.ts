import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.tail();

    const deamon = new WatcherDeamon(ns);
    await deamon.run();
}

/*
    got this idea from drak as well
    https://github.com/zeddrak/bitburner-scripts
    https://discord.com/channels/415207508303544321/923707505698283560/927176443002228796
*/

// TODO Update this to make a hidable popup html pannel with the same info

class WatcherDeamon extends Deamon {
    constructor(ns: NS) {
        super(ns);
    }

    async run() {
        while (true) {
            await this.ns.sleep(1);
            this.ns.clearLog();

            const target = this.targeterData.targets[0];
            this.ns.print(' SERVER NAME     $/ms    $/ms/GB   cost     hN     hAmt cL(ms) totProcs');
            const outS = target.serverData.name.padStart(10)
                + this.ns.nFormat(target.moneyPerMs, '0.00e+0').padStart(13)
                + this.ns.nFormat(target.score, '0.00e+0').padStart(9)
                + this.ns.nFormat(target.ramCost / this.resourceManagerData.totalRam, '0.0%').padStart(7)
                + this.ns.nFormat(target.hackThreads, '0.00e+0').padStart(9)
                + this.ns.nFormat(target.amountHacked, '0.0%').padStart(7)
                + this.ns.nFormat(target.cycleLength, '0.0').padStart(7)
                + this.ns.nFormat(target.totalProcesses, '0,000').padStart(9)
                + this.ns.nFormat(target.hackTime, '0,000').padStart(9);
            this.ns.print(outS);
            this.ns.print("");
            const secS = this.ns.nFormat(target.serverData.security, '0').padStart(3)
            const secD = this.ns.nFormat(this.ns.getServerSecurityLevel(target.serverData.name) - target.serverData.security, '+0').padStart(4);

            const current = this.ns.getServerMoneyAvailable(target.serverData.name);
            const monS = ('$' + this.ns.nFormat(target.serverData.money, '0.0e+0')).padStart(9)
                    + ('  $' + this.ns.nFormat(current, '0.0e+0')).padStart(9);
            const monP = this.ns.nFormat(current / target.serverData.money, '%').padStart(5);

            this.ns.print(' SERVER NAME  Defense  $ %      Max$     Cur$');
            this.ns.print(target.serverData.name.padStart(10) + secS.padStart(6) + secD + ' ' + monP + ' ' + monS);
        }
    }
}
