export class StaticConfig {
    /**
     * //MINIMUM cycle Length (time between the START of complete hgw cycles, or time between hacks) in milliseconds - at least 2x MinbT, make longer for a generally more stable game and rotation
     * lower cL = more hacks per second (more effecient to a point)
     * but also means more chance of collissions and greater rounding error accumulation, which = reduced money
     * try to find the sweat spot for your computer and environment
     * @alias MincL
     */
    public static minimumCycleLength: number = 12;

    /**
     * buffer threads extra grow and weaken threads to help keep stability
     * @alias BN
     */
    public static BufferThreads: number = 1.10;

    /**Maximum allowed concurrent processes - raising this is like a game of chicken with a cliff...
     * as long as it's low enough, everything's fine... Raise it a little too much though and your game will become unstabe, take longer to recover after autosaves, and just generally make lag spikes worse - MUCH worse
     * Try to find a level that doesn't tax your game too much, but also doesn't completely nerf your income.
     * Recommended ranges are 4000-10000; but is heavily hardware and environment dependant, so feel free to go outside these ranges as long as things feel comfortable for you
     * @alias MaxProcess
     */
    public static MaxProcess: number = 8000;

    /**
     * Amount of your total ram to allow profiles to build from, actual usage will vary
     * don't just set this to 100%, as processes launched during high sec stick around a little longer;
     * so using all your memory can make it impossible to launch new attacks on time which can be more disruptive than just not launching them in the first place
     * @alias RamUse
     */
    public static RamUse: number = 0.90

    /**
     * max amount to steal per hack (decimal%) - can generally leave this alone, can raise to 1.0 if desired for stocks or the like
     * @alias MaxAmt
     */
    public static MaxAmount: number = 0.99;


    /**
     * max amt of ram to keep free at home
     */
    public static HomeReserveMax = 100;
    /**
     * min amt of ram to keep free at home
     */
    public static HomeReserveMin = 10;
    /**
     * decimal% of home's ram to reserve, bounded by above
     */
    public static HomeReservePortion = 0.10;
    public static homeReserve(homeRam: number) { //amt of ram to keep free at home
        try { return Math.min(StaticConfig.HomeReserveMax, Math.max(StaticConfig.HomeReserveMin, StaticConfig.HomeReservePortion * homeRam)); }
        catch { }
        return 10;
    }

    public static UseHacknetServers = false;
}