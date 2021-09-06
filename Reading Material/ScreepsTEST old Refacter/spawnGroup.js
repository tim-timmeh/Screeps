'use strict'

function SpawnGroup(room) { // Constructor, framework to build a SpawnGroup for a given (room)
  this.room = room;
  this.spawns = room.find(FIND_MY_SPAWNS); // replace with _.filter for lower cpu?? FIND with no arguments is actualy cached so cheap?
  if (!this.room.memory.spawnMemory) this.room.memory.spawnMemory = {}; //Memory.rooms[room].spawnMemory = {}
  this.memory = this.room.memory.spawnMemory; //Memory.rooms[room].spawnMemory
  this.extensions = room.findStructures(STRUCTURE_EXTENSION);
  this.manageSpawnLog();
  this.availableSpawnCount = this.getSpawnAvailability();
  this.isAvailable = this.availableSpawnCount > 0;
  this.currentSpawnEnergy = this.room.energyAvailable;
  this.maxSpawnEnergy = this.room.energyCapacityAvailable;
  this.pos = _.head(this.spawns).pos;
}
// Additional methods/functions below
SpawnGroup.prototype.spawn = function (body, name, memory) {
  let spawnResults;
  this.availableSpawnCount -= 1;
  this.isAvailable = this.availableSpawnCount > 0;
  //this.isAvailable = false;
  for (let spawn of this.spawns) {
    if (spawn.spawning == null){
      spawnResults = spawn.createCreep(body, name, memory);
      console.log(`Spawn: ${spawn.name}, Spawning: ${name}, Body: ${body}\n Results: ${spawnResults}`);
      break;
    }
  }
  return spawnResults;
}


SpawnGroup.prototype.manageSpawnLog = function () {
  if (!this.memory.log) this.memory.log = {idleSpawns : 0, availability: 0, history: [], longHistory: []}; //Memory.rooms[room].spawnMemory.log
  if (Game.time % 100 != 0) return; // early
  let log = this.memory.log;
  let average = log.availability / 100;
  log.availability = 0;
  log.history.push(average);
  while (log.history.length > 5) log.history.shift();
  //Memory.stats.rooms[`${this.room.name}.spawnGroup.idleHistory`] = log.history;
  if (Game.time % 500 != 0) return; // early
  let longAverage = _.sum(log.history) / 5;
  log.longHistory.push(longAverage);
  while (log.longHistory.length > 5) log.longHistory.shift();
  //Memory.stats.rooms[`${this.room.name}.spawnGroup.idleLongHistory`] = log.longHistory;
}

SpawnGroup.prototype.getSpawnAvailability = function () {
  let count = 0;
  for (let spawn of this.spawns) {
    if (spawn.spawning == null) {
      count++;
    }
  }
  this.memory.log.availability += count;
  this.memory.log.idleSpawns = count;
  //Memory.stats["SpawnGroups." + this.room.name + ".idleSpawns"] = count;
  return count;
}
