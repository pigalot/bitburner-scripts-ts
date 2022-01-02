import { BitNodeMultipliers, NS, SourceFileLvl } from "/../types/NetscriptDefinitions";
import { Data } from "/deamons/Data.js";

export class GameInfoData extends Data {
    public bitNodeMultipliers: BitNodeMultipliers | null = null;
    public ownedSourceFiles: SourceFileLvl[] | null = null;

    public static instance(ns: NS): GameInfoData {
        const port = Data.getDataPort(ns);
        port.gameInfo = port.gameInfo ?? new GameInfoData();
        return port.gameInfo;
    }
}