let profilerBonzAI = {
  start(identifier) {
    if (!Memory.stats.profilerBonzAI) Memory.stats.profilerBonzAI = {};
    if (!Memory.stats.profilerBonzAI[identifier]) Memory.stats.profilerBonzAI[identifier] = {
      tickBegin: Game.time,
      lastTickTracked: undefined,
      total: 0,
      count: 0,
      costPerCall: undefined,
      costPerTick: undefined,
      callsPerTick: undefined,
      cpu: 0,
    };
    Memory.stats.profilerBonzAI[identifier].lastTickTracked = Game.time;
    Memory.stats.profilerBonzAI[identifier].cpu = Game.cpu.getUsed();
  },

  end(identifier, period = 10) {
    let profile = Memory.stats.profilerBonzAI[identifier];
    profile.total += Game.cpu.getUsed() - Memory.stats.profilerBonzAI[identifier].cpu;
    profile.count++;

    if (Game.time - profile.tickBegin >= period - 1) {
      profile.costPerCall = _.round(profile.total / profile.count, 2);
      profile.costPerTick = _.round(profile.total / period, 2);
      profile.callsPerTick = _.round(profile.count / period, 2);
      if (global.debug) console.log("PROFILER:", identifier, "perTick:", profile.costPerTick, ", perCall:", profile.costPerCall, ", calls per tick:", profile.callsPerTick);
      profile.tickBegin = Game.time + 1;
      profile.total = 0;
      profile.count = 0;
    }
  }
}

module.exports = profilerBonzAI;