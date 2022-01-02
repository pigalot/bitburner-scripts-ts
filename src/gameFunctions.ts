/*
    Made by Drak on discord
-- from function calculateServerGrowth(server: Server, threads: number, p: IPlayer, cores = 1): number
GM: Growth Multiplier (avail money * GM = new money)
B: base = Math.min(CONSTANTS.ServerMaxGrowthRate, (1 + (CONSTANTS.ServerBaseGrowthRate - 1) / server.hackDifficulty)
  (known for a given server at a given security)
TM: Thread Multiplier = (server.serverGrowth / 100) * p.hacking_grow_mult * (1 + (cores - 1) / 16) * BitNodeMultipliers.ServerGrowthRate
  (known for a given serverGrowth AND given Player Hack Skill AND given Core Count AND a given BitNodeMultiplier)

GM = Base ^ ( threads * TM)
Threads * TM = log (base Base) of GM // definition of log
Threads = log (base Base) of GM / TM // isolate threads (value we want)
Threads = log (GM / TM) / log (Base) // Log change of base rule (from log base "Base" to log base 10)
*/
//for those with bitnode stuff, you can use the following line if desired
//BitNodeMultipliersServerGrowthRate = ns.getBitNodeMultipliers().BitNodeMultipliers.ServerGrowthRate;
//cores is the # of cores of the ATTACKING (not target) server (where grow() is being run)
//capGrowMult false (default) = return threads for provided growth
//capGrowMult true = return threads for provided growth OR needed for growth to max money on provided server

import { Player, Server } from "../types/NetscriptDefinitions";

//  whichever is less
export function growAnalyze(server: Server, player: Player, growth: number, BitNodeMultipliersServerGrowthRate: number, difficulty = -1, cores = 1, capGrowMult = false) {
	if (difficulty < 0) { difficulty = server.minDifficulty; } // Assume min security
	else if (difficulty == 0) { difficulty = server.hackDifficulty; } // Use current security

	const fullGrow = (server.moneyMax / server.moneyAvailable); // grow multiplier needed to Max Money - can be >= 1
	const growthMultiplier = capGrowMult ? Math.min(growth, fullGrow) : growth; //if capMult, then cap growth to maxMoney

	const CONSTANTSServerBaseGrowthRate = 1.03;
	const CONSTANTSServerMaxGrowthRate = 1.0035;
	const adjGrowthRate = (1 + (CONSTANTSServerBaseGrowthRate - 1) / difficulty); // adj exponential base for security
	const exponentialBase = Math.min(adjGrowthRate, CONSTANTSServerMaxGrowthRate) //cap growth rate

	const serverGrowthPercentage = server.serverGrowth / 100.0;
	const coreMultiplier = coreMult(cores);
	const threadMultiplier = serverGrowthPercentage * player.hacking_grow_mult * coreMultiplier * BitNodeMultipliersServerGrowthRate; //total of all grow thread multipliers

	const cycles = Math.log(growthMultiplier) / (Math.log(exponentialBase)) / threadMultiplier;
	return cycles;
}

export function growAnalyzeHackAmount(server: Server, player: Player, hackAmt: number, BitNodeMultipliersServerGrowthRate: number, difficulty = -1, cores = 1, capGrowMult = false) {
	const growth = 1 / (1 - hackAmt);
	return growAnalyze(server, player, growth, BitNodeMultipliersServerGrowthRate, difficulty, cores, capGrowMult);
}
export function calculateIntelligenceMult(intelligence: number, weight = 1) {
	return 1 + (weight * Math.pow(intelligence, 0.8)) / 600;
}

export function getHackTime(server: Server, player: Player, difficulty = -1) { //target, server or server name
	if (difficulty <= 0) { difficulty = server.minDifficulty; }
	const difficultyMult = server.requiredHackingSkill * difficulty;

	const baseDiff = 500;
	const baseSkill = 50;
	const diffFactor = 2.5;
	const skillFactor = (diffFactor * difficultyMult + baseDiff) / (player.hacking + baseSkill);

	const hackTimeMultiplier = 5;
	const hackingTime = (hackTimeMultiplier * skillFactor) /
		(player.hacking_speed_mult * calculateIntelligenceMult(player.intelligence, 1));
	return hackingTime * 1000;
}

export function getGrowTime(server: Server, player: Player, difficulty = -1) {
	const growTimeMultiplier = 3.2; // Relative to hacking time. 16/5 = 3.2
	return growTimeMultiplier * getHackTime(server, player, difficulty);
}

export function getWeakenTime(server: Server, player: Player, difficulty = -1) {
	const weakenTimeMultiplier = 4; // Relative to hacking time
	return weakenTimeMultiplier * getHackTime(server, player, difficulty);
}

export function hackAnalyzeChance(server: Server, player: Player, difficulty = -1) {
	if (difficulty < 0) { difficulty = server.minDifficulty; } // Assume min security
	else if (difficulty == 0) { difficulty = server.hackDifficulty; } // Use current security

	const hackFactor = 1.75;
	const difficultyMult = (100 - difficulty) / 100;
	const skillMult = hackFactor * player.hacking;
	const skillChance = (skillMult - server.requiredHackingSkill) / skillMult;
	const chance = skillChance * difficultyMult * player.hacking_chance_mult
		* calculateIntelligenceMult(player.intelligence, 1);
	if (chance > 1) { return 1; }
	if (chance < 0) { return 0; }

	return chance;
}

export function hackAnalyze(server: Server, player: Player, BitNodeMultipliersScriptHackMoney: number, difficulty = -1) {
	if (difficulty < 0) { difficulty = server.minDifficulty; } // Assume min security
	else if (difficulty == 0) { difficulty = server.hackDifficulty; } // Use current security

	const balanceFactor = 240;

	const difficultyMult = (100 - difficulty) / 100;
	const skillMult = (player.hacking - (server.requiredHackingSkill - 1)) / player.hacking;
	const percentMoneyHacked = (difficultyMult * skillMult * player.hacking_money_mult) / balanceFactor;
	if (percentMoneyHacked < 0) { return 0; }
	if (percentMoneyHacked > 1) { return 1; }

	return percentMoneyHacked * BitNodeMultipliersScriptHackMoney;
}

export function coreMult(cores: number) { return (1.0 + (cores - 1.0) / 16.0); }

export function weakenAnalyze(threads: number, cores: number) {
	const CONSTANTSServerWeakenAmount = 0.05;
	return CONSTANTSServerWeakenAmount * threads * coreMult(cores);
}

export function growAnalyzeSecurity(threads: number) {
	const CONSTANTSServerFortifyAmount = 0.002;
	return 2 * CONSTANTSServerFortifyAmount * threads;
}

export function hackAnalyzeSecurity(threads: number) {
	const CONSTANTSServerFortifyAmount = 0.002;
	return CONSTANTSServerFortifyAmount * threads;
}