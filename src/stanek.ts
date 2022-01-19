import { NS } from "../types/NetscriptDefinitions";

export async function main(ns: NS) {
    const x = ns.args[0] as number;
    const y = ns.args[1] as number;

    await ns.stanek.charge(x, y);
}