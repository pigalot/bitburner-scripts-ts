import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const deamon = new SleevesDeamon(ns);
    await deamon.run();
}

class SleevesDeamon extends Deamon {
    private readonly requiredGangKarma: number = -54000;

    constructor(ns: NS) {
        super(ns);
    }

    async run() {
        while(true) {
            const sleeveCount = this.ns.sleeve.getNumSleeves();
            // @ts-ignore
            const karma = this.ns.heart.break();

            let task = "shock-recovery";

            if (karma > this.requiredGangKarma) {
                task = "crime";
            }

            for(let i = 0; i < sleeveCount; i++) {
                const sleeveStats = this.ns.sleeve.getSleeveStats(i);
                if (task === "crime" || sleeveStats.shock === 0) {
                    const crime = sleeveStats.strength < 100 ? 'Mug' : 'Homicide';
                    //console.log(this.ns.sleeve.getTask(i));
                    if (this.ns.sleeve.getTask(i).crime !== crime) {
                        this.ns.sleeve.setToCommitCrime(i, crime);
                    }
                } else {
                    if (this.ns.sleeve.getTask(i).task !== "Shock Recovery") {
                        //console.log(this.ns.sleeve.getTask(i));
                        this.ns.sleeve.setToShockRecovery(i);
                    }
                }
            }
            this.sleevesData.initialised = true;
            await this.ns.sleep(1000);
        }
    }

}