import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";

// @ts-ignore
import { Watcher } from "/jsx/index.js";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();
    //ns.tail();

    const deamon = new WatcherDeamon(ns);
    //await deamon.setupReact();
    //await deamon.update();
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

    async setupReact() {
        const doc = globalThis["document"];
        if (!doc.getElementById("pigalot")) {
            const unclickable = doc.getElementById("unclickable");

            const pigalot = doc.createElement("div");
            pigalot.id = "pigalot";
            unclickable?.insertAdjacentElement("beforebegin", pigalot);

            const css = doc.querySelector("head");
            // @ts-ignore
            const style = doc.createElement("style");
            style.id = "pigalot-style";
            css?.insertAdjacentElement("beforeend", style);
            style.insertAdjacentHTML("beforebegin", `<link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet">`);
        }

        const style = doc.getElementById("pigalot-style");
        const cssContent = this.ns.read("/css/main.txt");
        if (style !== null) style.innerHTML = cssContent;

        // @ts-ignore
        ReactDOM.render(
            // @ts-ignore
            React.createElement(Watcher),
            doc.getElementById("pigalot")
        );
    }
    
    async update() {
        // @ts-ignore
        globalThis['pigalotGameState'] = globalThis['pigalotGameState'] ?? {};
        // @ts-ignore
        globalThis['pigalotGameState'].target = globalThis['pigalotGameState'].target ?? {};
        // @ts-ignore
        const state = globalThis['pigalotGameState'];

        while(true) {
            const target = this.targeterData.targets[0];
            state.target.name = target.serverData.name;

            if (state.target?.update) state.target?.update();
            await this.ns.sleep(1000);
        }
    }

    async run() {
        while (true) {
            await this.ns.sleep(1);
            this.ns.clearLog();

            let totalProcs = 0;
            for(let i = 1; i < this.resourceManagerData.resources.length; i++) {
                const server = this.resourceManagerData.resources[i];
                const scripts = this.ns.ps(server.name);
                totalProcs += scripts.reduce((a, c) => c.filename === "grow.js" || c.filename === "hack.js" || c.filename === "weaken.js" ? a+1: a, 0);
            }

            const target = this.targeterData.targets[0];
            this.ns.print(' SERVER NAME     $/ms    $/ms/GB   cost     hN     hAmt cL(ms) totProcs');
            const outS = target.serverData.name.padStart(10)
                + this.ns.nFormat(target.moneyPerMs, '$0.0[00]a').padStart(13)
                + this.ns.nFormat(target.score, '$0.0[00]a').padStart(9)
                + this.ns.nFormat(target.ramCost / this.resourceManagerData.totalRam, '0.0%').padStart(7)
                + this.ns.nFormat(target.hackThreads, '0.0[00]a').padStart(9)
                + this.ns.nFormat(target.amountHacked, '0.0%').padStart(7)
                + this.ns.nFormat(target.cycleLength, '0.0').padStart(7)
                + this.ns.nFormat(target.totalProcesses, '0,000').padStart(9)
                + this.ns.nFormat(target.hackTime, '0,000').padStart(9);
            this.ns.print(outS);
            this.ns.print("");
            const secS = this.ns.nFormat(target.serverData.security, '0').padStart(3)
            const secD = this.ns.nFormat(this.ns.getServerSecurityLevel(target.serverData.name) - target.serverData.security, '+0').padStart(4);

            const current = this.ns.getServerMoneyAvailable(target.serverData.name);
            const monS = (this.ns.nFormat(target.serverData.money, '$0.0[00]a')).padStart(9)
                    + ('  ' + this.ns.nFormat(current, '$0.0[00]a')).padStart(9);
            const monP = this.ns.nFormat(current / target.serverData.money, '%').padStart(5);

            this.ns.print(' SERVER NAME  Defense  $ %      Max$     Cur$');
            this.ns.print(target.serverData.name.padStart(10) + secS.padStart(6) + secD + ' ' + monP + ' ' + monS);

            this.ns.print("");

            this.ns.print(' Running Procceses       Total Ram');
            this.ns.print(totalProcs.toString().padStart(10) + this.resourceManagerData.totalRam.toString().padStart(19));


            if (this.stonksData.isStonks) {
                this.ns.print("");
                this.ns.print('   Bid      Ask       forcing     forcast    profit');
                const bid = this.ns.stock.getBidPrice(this.stonksData.stonksSymble).toFixed(2).toString();
                const ask = this.ns.stock.getAskPrice(this.stonksData.stonksSymble).toFixed(2).toString();
                const [shares, avgPx, sharesShort, avgPxShort] = this.ns.stock.getPosition(this.stonksData.stonksSymble);
                const type = shares > 0 ? "long" : sharesShort > 0 ? "short" : "none";
                const profit = type === "none" ? "NA" : this.ns.nFormat(this.ns.stock.getSaleGain(this.stonksData.stonksSymble, type === "long" ? shares : sharesShort, type), "$0.0[00]a");
                this.ns.print(bid.padStart(2).padEnd(8-bid.length) + ask.padStart(10).padEnd(8-ask.length) + (this.stonksData.effectHack ? "down" : "up  ").padStart(9) + this.stonksData.forcast.ask.toFixed(2).toString().padStart(12) + "      " + profit);

            }
        }
    }
}
