import { Player, Server } from "/../types/NetscriptDefinitions";
import { getGrowTime, getHackTime, getWeakenTime } from "/gameFunctions";

//** Server object that only has static data on it **/
export class ServerData {
    public readonly name: string;
    public readonly playerOwned: boolean;
    public readonly organizationName: string;

    public readonly money: number;
    public readonly ram: number;
    public readonly security: number;
    public readonly growth: number;

    public readonly requiredHack: number;
    public readonly portsRequired: number;

    public readonly server: Server;

    public hasRootAccess: boolean = false;

    constructor(server: Server) {
        this.name = server.hostname;
        this.playerOwned = server.purchasedByPlayer 
            || server.hostname === "home" 
            || server.hostname.startsWith("hacknet-node-");
        this.organizationName = server.organizationName

        this.money = server.moneyMax;
        this.ram = server.maxRam;
        this.security = server.minDifficulty;
        this.growth = server.serverGrowth;

        this.requiredHack = server.requiredHackingSkill;
        this.portsRequired = server.numOpenPortsRequired;

        this.server = server;
    }
}