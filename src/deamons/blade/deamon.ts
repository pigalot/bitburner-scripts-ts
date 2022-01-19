import { NS } from "/../types/NetscriptDefinitions";

import { Deamon } from "/deamons/Deamon.js";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const deamon = new BladeDeamon(ns);
    await deamon.run();
}

class BladeDeamon extends Deamon {
    private readonly minChance = 0.33;

    private readonly actionData = [
        // Contracts
        {
            name: "Tracking",
            type: "Contract",
            reqdRank: 0,
            rewardFac: 1.041,
            rankGain: 0.3,
        },
        {
            name: "Bounty Hunter",
            type: "Contract",
            reqdRank: 0,
            rewardFac: 1.085,
            rankGain: 0.9,
        },
        {
            name: "Retirement",
            type: "Contract",
            reqdRank: 0,
            rewardFac: 1.065,
            rankGain: 0.6,
        },
        // Operations
        {
            name: "Investigation",
            type: "Operation",
            reqdRank: 25,
            rewardFac: 1.07,
            rankGain: 2.2,
        },
        {
            name: "Undercover Operation",
            type: "Operation",
            reqdRank: 100,
            rewardFac: 1.09,
            rankGain: 4.4,
        },
        // { // kills too much pop
        //     name: "Sting Operation",
        //     type: "Operation",
        //     reqdRank: 500,
        //     rewardFac: 1.095,
        //     rankGain: 5.5,
        // },
        // { // Too much chaos
        //     name: "Raid",
        //     type: "Operation",
        //     reqdRank: 3000,
        //     rewardFac: 1.1,
        //     rankGain: 55,
        // },
        // { // kills too much pop
        //     name: "Stealth Retirement Operation",
        //     type: "Operation",
        //     reqdRank: 20e3,
        //     rewardFac: 1.11,
        //     rankGain: 22,
        // },
        {
            name: "Assassination",
            type: "Operation",
            reqdRank: 50e3,
            rewardFac: 1.14,
            rankGain: 44,
        }
    ];

    private readonly skillsData = [
        {
            name: SkillNames.BladesIntuition,
            weight: 5,
            bonus: 3,
            max: -1
        },
        {
            name: SkillNames.Cloak,
            weight: 0.5,
            bonus: 5.5,
            max: 25
        },
        {
            name: SkillNames.ShortCircuit,
            weight: 0.5,
            bonus: 5.5,
            max: 25
        },
        {
            name: SkillNames.DigitalObserver,
            weight: 4,
            bonus: 4,
            max: -1
        },
        {
            name: SkillNames.Tracer,
            weight: 1,
            bonus: 4,
            max: 10
        },
        {
            name: SkillNames.Overclock,
            weight: 4,
            bonus: 1,
            max: 90
        },
        {
            name: SkillNames.Reaper,
            weight: 5,
            bonus: 2,
            max: -1
        },
        {
            name: SkillNames.EvasiveSystem,
            weight: 4,
            bonus: 4,
            max: -1
        },
    ];

    private readonly cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

    constructor(ns: NS) {
        super(ns);
    }

    async run() {
        if (!this.ns.bladeburner.joinBladeburnerDivision()) {
            const player = this.ns.getPlayer();
            if (player.bitNodeN === 8) return; // cant do this on 8

            while(player.strength < 100 || player.defense < 100 || player.dexterity < 100 || player.agility < 100) {
                await this.ns.sleep(10 * 1000);
            }

            if (!this.ns.bladeburner.joinBladeburnerDivision()) return; // how have we got here?
            else if (this.ns.bladeburner.getRank() > 25) this.ns.bladeburner.joinBladeburnerFaction();
        }

        let maxRequiredRank = 0;

        const blackOps = this.ns.bladeburner.getBlackOpNames().map(b => {
            const requiredRank = this.ns.bladeburner.getBlackOpRank(b);
            if (maxRequiredRank < requiredRank) maxRequiredRank = requiredRank;
            return {name: b, requiredRank};
        }).sort((a,b) => a.requiredRank - b.requiredRank);

        this.ns.print(`we need a total of ${maxRequiredRank} Rank`);

        let lastLookAround = 0;
        while(true) {
            this.ns.clearLog();
            const rank = this.ns.bladeburner.getRank();
            if (rank > 25) this.ns.bladeburner.joinBladeburnerFaction();

            const [amin, amax] = this.ns.bladeburner.getActionEstimatedSuccessChance("Operation", "Assassination");
            const average = (amin + amax) / 2;

            let points = this.ns.bladeburner.getSkillPoints();
            while (points > 0) {
                const skills = this.skillsData.filter(s => this.ns.bladeburner.getSkillLevel(s.name) < s.max || s.max === -1)
                    .map(s => {
                        const cost = this.ns.bladeburner.getSkillUpgradeCost(s.name);
                        return{ 
                            ...s, 
                            value: s.name === SkillNames.Overclock && average === 1 ? 100 : (s.bonus / cost),
                            cost,
                        }
                    }).sort((a,b) => b.value - a.value);
                //console.log(skills, average);
                if (skills.length === 0) break

                const skill = skills[0];
                this.ns.print(`I really want to buy ${skill.name} for ${skill.cost} it has a value of ${skill.value.toFixed(2)}`);
                if (skill.cost > points) break;
                this.ns.bladeburner.upgradeSkill(skill.name);
                points = this.ns.bladeburner.getSkillPoints();
            }

            let isFirst = true;
            for(const bop of blackOps) {
                if (rank < bop.requiredRank) continue;
                let [amin, amax] = this.ns.bladeburner.getActionEstimatedSuccessChance("BlackOps", bop.name);
                const average = (amin + amax) / 2;
                if (average !== 1) {
                    if (isFirst) {
                        isFirst = false;
                        if (amax != 1) continue;
                        this.ns.print(`bo: ${bop.name} needs analysis`);
                        let count = 0;
                        while(amin !== amax && count < 3) {
                            await this.doAction("general", "Field Analysis");
                            [amin, amax] = this.ns.bladeburner.getActionEstimatedSuccessChance("BlackOps", bop.name);
                            count++;
                        }
                        if (count == 2) this.ns.print(`bo: ${bop.name} took too long to analyse getting back on with our lives`);
                    }
                    continue;
                }
                await this.doAction("BlackOps", bop.name);
            }

            let city = this.ns.bladeburner.getCity();
            if (lastLookAround < Date.now() - 1 * 60 * 60 * 1000) {
                lastLookAround = Date.now();
                let bestPop = 0;
                let bestCity = "";
                for(const newCity of this.cities) {
                    this.ns.bladeburner.switchCity(newCity);
                    this.ns.print(`hmm ${newCity} is nice this time of year lets have a look around.`)
                    let [min, max] = this.ns.bladeburner.getActionEstimatedSuccessChance("Operation", "Assassination");
                    while(min !== max) {
                        await this.doAction("general", "Field Analysis");
                        [min, max] = this.ns.bladeburner.getActionEstimatedSuccessChance("Operation", "Assassination");
                    }
                    const pop = this.ns.bladeburner.getCityEstimatedPopulation(newCity);
                    if (pop > bestPop) {
                        bestPop = pop;
                        bestCity = newCity;
                    }
                }
                this.ns.bladeburner.switchCity(city);
                if (bestCity !== "" && city !== bestCity) {
                    city = bestCity;
                    this.ns.print(`I like ${city} lets stay.`);
                    this.ns.bladeburner.switchCity(city);
                }
            }

            const chaos = this.ns.bladeburner.getCityChaos(city);
            if (chaos >= 50) {
                await this.doAction("general", "Diplomacy");
                continue;
            }

            let needsFieldAnalysis = false;
            const actions = this.actionData.filter(a => {
                const [min, max] = this.ns.bladeburner.getActionEstimatedSuccessChance(a.type, a.name);
                const minMax = min === max;
                
                if (!minMax) needsFieldAnalysis = true;
                return this.ns.bladeburner.getActionCountRemaining(a.type, a.name) > 0
                    && (minMax)
                    && max >= this.minChance
                   // && rank > a.reqdRank
            }).map(a => {
                const level = this.ns.bladeburner.getActionCurrentLevel(a.type, a.name);
                const rewardMultiplier = Math.pow(a.rewardFac, level - 1);
                const gain = a.rankGain * rewardMultiplier * (this.gameInfoData.bitNodeMultipliers?.BladeburnerRank ?? 1);
                const time = this.ns.bladeburner.getActionTime(a.type, a.name);
                const [min, max] = this.ns.bladeburner.getActionEstimatedSuccessChance(a.type, a.name);
                return {
                    ...a,
                    gain,
                    level,
                    rewardMultiplier,
                    time,
                    chance: max
                }
            }).sort((a, b)=> ((b.gain * b.chance) / b.time) - ((a.gain * a.chance) / a.time));
            //console.log(actions);

            if (needsFieldAnalysis) {
                await this.doAction("general", "Field Analysis");
                continue;
            }

            const [stamina, maxStamina] = this.ns.bladeburner.getStamina();
            if (stamina < maxStamina * 0.5 || actions.length === 0) {
                await this.doAction("general", "Hyperbolic Regeneration Chamber");
                continue;
            }

            // TODO: Do investigations if we can and needsFieldAnalysis

            const action = actions[0];

            await this.doAction(action.type, action.name);
        }
        
    }

    async doAction(type: string, name: string) {
        if (this.ns.bladeburner.getCurrentAction().name === name) {
            await this.ns.sleep(500);
            return;
        }
        const time = this.ns.bladeburner.getActionTime(type, name);
        const started = this.ns.bladeburner.startAction(type, name);
        if (started) {
            this.ns.print(`${type === "BlackOps"?"Shhhh ":""}Doing some ${name}`);
            await this.ns.sleep(time);
        }
        if(!(type === "BlackOps" && !started)) await this.ns.sleep(50);
    }

}

/*
    chaos only has effect above 50 I'm told

    move city when pop is 90% of biggest or less

    I would completely ignore the skill that only gives money
    I would not level tracer(the operation one) above lvl 10 or so
    I would stop levelling cloak and short-circuit at 25 or so
    since the last black ops has neither stealth no retirement attributes
    otherwise I would try to get assassination contracts to 100%, so level everything needed for that
    after that I recommend overclock 90 for 10x action speed
*/

function addOffset(midpoint: number, percentage: number): number {
    const maxPercent = 100;
    if (percentage < 0 || percentage > maxPercent) {
        return midpoint;
    }

    const offset: number = midpoint * (percentage / maxPercent);

    // Double the range to account for both sides of the midpoint.
    // tslint:disable-next-line:no-magic-numbers
    return midpoint + (Math.random() * (offset * 2) - offset);
    }

const SkillNames: {
    BladesIntuition: string;
    Cloak: string;
    Marksman: string;
    WeaponProficiency: string;
    ShortCircuit: string;
    DigitalObserver: string;
    Tracer: string;
    Overclock: string;
    Reaper: string;
    EvasiveSystem: string;
    Datamancer: string;
    CybersEdge: string;
    HandsOfMidas: string;
    Hyperdrive: string;
  } = {
    BladesIntuition: "Blade's Intuition",
    Cloak: "Cloak",
    Marksman: "Marksman",
    WeaponProficiency: "Weapon Proficiency",
    ShortCircuit: "Short-Circuit",
    DigitalObserver: "Digital Observer",
    Tracer: "Tracer",
    Overclock: "Overclock",
    Reaper: "Reaper",
    EvasiveSystem: "Evasive System",
    Datamancer: "Datamancer",
    CybersEdge: "Cyber's Edge",
    HandsOfMidas: "Hands of Midas",
    Hyperdrive: "Hyperdrive",
  };