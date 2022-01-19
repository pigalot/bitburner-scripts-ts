import { NS } from "../types/NetscriptDefinitions";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.tail();
    ns.clearLog();
    // @ts-ignore
    ns.print(JSON.stringify(ns.stanek.activeFragments().map(f => ({ rootX: f.x, rootY: f.y, rotation: f.rotation, fragmentId: f.id, type: f.type }))));
}