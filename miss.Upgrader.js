'use strict';
const Mission = require("./Mission");

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionUpgrader(operation) { // constructor, how to build the object
  Mission.call(this, operation, 'upgrader'); // uses params to pass object through parnt operation constructor first
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
  this.paveRoad(this.storage, this.controller, 3);
  this.upgraderCap = this.room.controller.level == 8 ? 5 : undefined; // Max 15w per tick on RCL8
};

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

MissionUpgrader.prototype.actionMiss = function () { // perform actions / missions
  for (let upgrader of this.upgraders) {
    this.upgraderActions(upgrader);
  }
};

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
    let droppedSource = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3); //change to inRangeTo (cheaper) and managed by mission not creep logic?
    if (droppedSource.length) {
      if (creep.pickup(droppedSource[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSource[0], {
          visualizePathStyle: {
            stroke: '#fa0'
          }
        });
      }
    } else if (creep.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.room.storage);
    } else {
      creep.giveWay()
    }
  } else {
    creep.doUpgradeController()
  }
};

module.exports = MissionUpgrader;