import { NS } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";
import { ServerData } from "/models/ServerData.js";

export class TargeterData extends Data {
    public targets: Batch[] = [];
    
    public static instance(ns: NS): TargeterData {
        const port = Data.getDataPort(ns);
        port.targeter = port.targeter ?? new TargeterData();
        return port.targeter;
    }
}

export type Batch = {
    serverData: ServerData; // tar

    hackAmount: number; // amt
    amountHacked: number;

    hackThreads: number; // hN
    growThreads: number; // gN
    weakenThreads: number; // wN

    hackProcesses: number; // hP
    growProcesses: number; // gP
    weakenProcesses: number; // wP
    totalProcesses: number; // totP

    hackTime: number;

    calculatedBufferTime: number; // bT
    cycleLength: number; // cL

    moneyPerMs: number; // value
    ramCost: number; // cost
    score: number; // score
};
