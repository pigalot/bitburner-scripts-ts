import { NS } from "../types/NetscriptDefinitions";

export async function main(ns: NS) {
    const target = ns.args[0] as string;
    const threads = ns.args[1] as number;
    const stock = ns.args[2] as boolean;

    await ns.grow(target, { threads, stock });
}