'use strict'

module.exports = {

/**
 * Check if object empty
 * @param {object} obj 
 * @returns 
 */
  isEmpty : function (obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  },
    /**
   * Reset/setup Memory Objects
   * @param {number} globalResetTick 
   */
     exportStats : function (globalResetTick) {
      Memory.stats = {
        gcl: {},
        rooms: {},
        cpu: {},
        memory: {},
      }
  
      Memory.stats.time = Game.time;
      // Collect room stats
      for (let roomName in Game.rooms) {
        let spawnLog
        let room = Game.rooms[roomName];
        let isMyRoom = (room.controller ? room.controller.my : false);
        if (isMyRoom) {
          let roomStats = Memory.stats.rooms[roomName] = {};
          // @ts-ignore
          roomStats.storageEnergy = (room.storage ? room.storage.store.energy : 0);
          // @ts-ignore
          roomStats.terminalEnergy = (room.terminal ? room.terminal.store.energy : 0);
          // @ts-ignore
          roomStats.energyAvailable = room.energyAvailable;
          // @ts-ignore
          roomStats.energyCapacityAvailable = room.energyCapacityAvailable;
          // @ts-ignore
          roomStats.controllerProgress = room.controller.progress;
          // @ts-ignore
          roomStats.controllerProgressTotal = room.controller.progressTotal;
          // @ts-ignore
          roomStats.controllerLevel = room.controller.level;
        }
        if ((spawnLog = Memory[`rooms.${roomName}.spawnMemory.log.idleSpawns`])) { // if room has spawn group memory log
          Memory.stats.rooms[roomName].idleSpawns = spawnLog // add it too stats
        }
      }
      // Collect GCL stats
      Memory.stats.gcl.progress = Game.gcl.progress;
      Memory.stats.gcl.progressTotal = Game.gcl.progressTotal;
      Memory.stats.gcl.level = Game.gcl.level;
      // Collect CPU stats
      Memory.stats.cpu.lastGlobalReset = globalResetTick
      Memory.stats.cpu.bucket = Game.cpu.bucket;
      Memory.stats.cpu.limit = Game.cpu.limit;
      Memory.stats.cpu.used  = Game.cpu.getUsed();
      // Collect Memory stats
      Memory.stats.memory.used = RawMemory.get().length/1000;
      Memory.stats.memory.limit = 2048;
    }
    //Memory.rooms[room].spawnMemory.log
};