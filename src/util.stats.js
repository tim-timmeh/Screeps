
const exportStats = function (globalResetTick) {
  // Reset/setup Memory Objects

  const clearStats = {
    gcl: {},
    rooms: {},
    cpu: {},
    memory: {},
    time: Game.time,
    market: {},
  }
  Object.assign(Memory.stats, clearStats);

  // Collect room stats
  for (let roomName in Game.rooms) {
    let spawnLog
    let room = Game.rooms[roomName];
    let isMyRoom = (room.controller ? room.controller.my : false);
    if (isMyRoom) {
      let roomStats = Memory.stats.rooms[roomName] = {};
      roomStats.storageEnergy = (room.storage ? room.storage.store.energy : 0);
      roomStats.terminalEnergy = (room.terminal ? room.terminal.store.energy : 0);
      roomStats.energyAvailable = room.energyAvailable;
      roomStats.energyCapacityAvailable = room.energyCapacityAvailable;
      roomStats.controllerProgress = room.controller.progress;
      roomStats.controllerProgressTotal = room.controller.progressTotal;
      roomStats.controllerLevel = room.controller.level;
      if (_.get(Memory, `rooms.${roomName}.spawnMemory`, false)) {
        roomStats.spawnLog = Memory.rooms[roomName].spawnMemory.log // Copy room spawn log to stats
      };
      /*if (Memory[`rooms.${roomName}.spawnMemory`]) { // OLD STAT CODE CHECK STATS AND DELETE
        roomStats.spawnLog = Memory.rooms[roomName].spawnMemory.log // Copy room spawn log to stats
      };
      if ((spawnLog = Memory[`rooms.${roomName}.spawnMemory.log.idleSpawns`])) { // if room has spawn group memory log
        roomStats.idleSpawns = spawnLog // add it too stats
      }*/
    }
  }
  // Collect GCL stats
  Memory.stats.gcl.progress = Game.gcl.progress;
  Memory.stats.gcl.progressTotal = Game.gcl.progressTotal;
  Memory.stats.gcl.progressPercent = (Game.gcl.progress / Game.gcl.progressTotal);
  Memory.stats.gcl.level = Game.gcl.level;
  // Collect CPU stats
  Memory.stats.cpu.lastGlobalReset = globalResetTick;
  Memory.stats.cpu.bucket = Game.cpu.bucket;
  Memory.stats.cpu.limit = Game.cpu.limit;
  Memory.stats.cpu.used = Game.cpu.getUsed();
  // Collect Memory stats
  Memory.stats.memory.used = RawMemory.get().length / 1000;
  Memory.stats.memory.limit = 2048;
  // Collect global stats
  Memory.stats.market.credits = Game.market.credits;
}

module.exports = exportStats;