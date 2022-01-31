'use strict';
const Mission = require("./Mission");
const profiler = require('./screeps-profiler')
const { roomPosStrip } = require('./util.myFunctions');

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionUpgrader(operation, priority = 2) { // constructor, how to build the object
  Mission.call(this, operation, 'upgrader', priority); // uses params to pass object through parnt operation constructor first
  this.controller = this.room.controller;
  this.storage = this.room.storage;
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionUpgrader.prototype = Object.create(Mission.prototype); // makes MissionUpgrader protos copy of Mission protos
MissionUpgrader.prototype.constructor = MissionUpgrader; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionUpgrader.prototype.initMiss = function () { // Initialize / build objects required
  this.distanceToController = this.findDistanceToSpawn(this.controller.pos, 3);
  this.storageCapacity = this.storage.store.getCapacity()
  this.upperReserve = this.storageCapacity - (this.storageCapacity / 2); // 2=50% full, 3=66% full etc
  const lowerReserve = 0; //Forces a lower reserve limit to start scaling from. Eg 500k will only start spawning larger creeps from that limit.
  this.storagePercent = parseFloat(Math.max(0, (this.storage.store.getUsedCapacity() - lowerReserve) / this.upperReserve).toFixed(3)); // % of used storage
  let lastPos

  if (!this.memory.upgraderPos || !Object.keys(this.memory.upgraderPos).length) {
    let ret = PathFinder.searchCustom(this.storage.pos, this.controller.pos, 3);
    lastPos = ret.path[ret.path.length - 1]
    this.memory.upgraderPos = roomPosStrip(lastPos);;
  }

  lastPos = lastPos || new RoomPosition(this.memory.upgraderPos.x, this.memory.upgraderPos.y, this.memory.upgraderPos.roomName);
  this.container = lastPos.findInRange(FIND_STRUCTURES, 1, {
    filter: { structureType: STRUCTURE_CONTAINER }
  })[0];
  if (!this.container) {
    this.containerCsite = lastPos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
      filter: { structureType: STRUCTURE_CONTAINER }
    })[0];
    if (!this.containerCsite) {
      this.placeContainer(lastPos, 0);
    }
  } else {
    //let storageCheck = this.room.storage && this.room.storage.my ? this.room.storage : false
    this.paveRoad(this.storage, lastPos, 1);// Check path from container to storage || spawnGroup.spawns[0].pos ?? should add bunker entry as priority?
  }

  this.upgraderCap = this.room.controller.level == 8 ? 5 : undefined; // Max 15w per tick on RCL8
};

MissionUpgrader.prototype.initMiss = profiler.registerFN(MissionUpgrader.prototype.initMiss, `upgrader - initMiss`);

MissionUpgrader.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed
  let creepCount = 1;
  if (this.storagePercent >= 1 && this.controller.level != 8) {
    if (Game.time % 9 == 0) creepCount = 10;
  }
  //if (this.room.name == "W17N38") {console.log("TEST", this.storagePercent)};
  let body = this.getBody({ CARRY: 1, MOVE: 2, WORK: 3 }, { maxEnergyPercent: this.storagePercent, maxRatio: this.upgraderCap });
  //if (this.room.name == "W17N38") {console.log("TEST2", body, this.storagePercent)};
  if (!body.length) {
    body = ['carry', 'move', 'work']; // add this to getBody?, as if maxEnergyPercent too low will not spawn
  }
  this.upgraders = this.creepRoleCall('upgrader', body, creepCount, { prespawn: this.distanceToController });
};

MissionUpgrader.prototype.roleCallMiss = profiler.registerFN(MissionUpgrader.prototype.roleCallMiss, `upgrader - roleCallMiss`);

MissionUpgrader.prototype.actionMiss = function () { // perform actions / missions
  for (let upgrader of this.upgraders) {
    this.upgraderActions(upgrader);
  }
};

MissionUpgrader.prototype.actionMiss = profiler.registerFN(MissionUpgrader.prototype.actionMiss, `upgrader - actionMiss`);

MissionUpgrader.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below
/**
 * 
 * @param {Creep} creep 
 */
MissionUpgrader.prototype.upgraderActions = function (creep) {
  if (creep.memory.building && creep.store.energy == 0) {
    creep.memory.building = false;
    creep.say("Hmm");
  }
  if (!creep.memory.building && creep.store.energy == creep.store.getCapacity()) {
    creep.memory.building = true;
    creep.say("Urg");
  }
  if (!creep.memory.building) {
    if (this.creepScavenge(creep)) {

    } else if (this.container && this.container.store.energy >= 200) {
      if (creep.withdraw(this.container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveToModule(this.container);
      }
    } else if (creep.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.room.storage);
    } else {
      creep.giveWay()
    }
  } else {
    if (this.container && this.container.hits < (this.container.hitsMax - 1000)) {
      creep.doRepair(this.container.id);
    } else {
      creep.doUpgradeController()
    }
  }
};

module.exports = MissionUpgrader;