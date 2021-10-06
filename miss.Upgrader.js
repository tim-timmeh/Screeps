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
  this.storagePercent = Math.max(0, (this.storage.store.getUsedCapacity() - this.storage.store.getCapacity() / 3) / this.storage.store.getCapacity()).toFixed(3);
  this.paveRoad(this.storage, this.controller, 3);
};

MissionUpgrader.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed
  let body = this.getBody({ CARRY: 1, MOVE: 2, WORK: 3 }, { maxEnergyPercent: this.storagePercent });
  if (!body.length) {
    body = ['carry', 'move', 'work']; // add this to getBody?, as if maxEnergyPercent too low will not spawn
  }
  this.upgraders = this.creepRoleCall('upgrader', body, 1, { prespawn: this.distanceToController });
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
    }
  } else {
    if (creep.upgradeController(this.controller) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.controller, { range: 3 });
    }
  }
};

module.exports = MissionUpgrader;