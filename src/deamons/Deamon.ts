import { NS } from "/../types/NetscriptDefinitions";

import { ControllerData } from "/deamons/controller/data.js";
import { AccountantData } from "/deamons/accountant/data.js";

import { GameInfoData } from "/deamons/gameInfo/data.js";

import { SpiderData } from "/deamons/spider/data.js";
import { ResourceManagerData } from "/deamons/resourceManager/data.js";

import { StonksData } from "/deamons/stonks/data.js";

import { TargeterData } from "/deamons/targeter/data.js";

import { SchedulerData } from "/deamons/scheduler/data.js";
import { SleevesData } from "/deamons/sleeves/data.js";

export class Deamon {
    protected ns: NS;

    protected controllerData: ControllerData;
    protected accountantData: AccountantData;

    protected gameInfoData: GameInfoData;

    protected spiderData: SpiderData;
    protected resourceManagerData: ResourceManagerData;

    protected stonksData: StonksData;

    protected targeterData: TargeterData;

    protected schedulerData: SchedulerData;

    protected sleevesData: SleevesData;

    constructor(ns: NS) {
        this.ns = ns;

        this.controllerData = ControllerData.instance(ns);
        this.accountantData = AccountantData.instance(ns);

        this.gameInfoData = GameInfoData.instance(ns);

        this.spiderData = SpiderData.instance(ns);
        this.resourceManagerData = ResourceManagerData.instance(ns);

        this.stonksData = StonksData.instance(ns);

        this.targeterData = TargeterData.instance(ns);

        this.schedulerData = SchedulerData.instance(ns);

        this.sleevesData = SleevesData.instance(ns);
    }
}