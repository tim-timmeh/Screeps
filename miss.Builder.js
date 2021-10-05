'use strict';
const Mission = require("./Mission");

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionBuilder(operation) { // constructor, how to build the object
  Mission.call(this, operation, 'builder'); // uses params to pass object through parnt operation constructor first
  this.storage = this.room.storage;
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionBuilder.prototype = Object.create(Mission.prototype); // makes MissionBuilder protos copy of Mission protos
MissionBuilder.prototype.constructor = MissionBuilder; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionBuilder.prototype.initMiss = function () { // Initialize / build objects required
  this.buildersReq = 0;
  if (this.room.find(FIND_CONSTRUCTION_SITES).length) {
    this.buildersReq = 1;
  }
};

MissionBuilder.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed
  let body = this.getBody({ CARRY: 1, MOVE: 1, WORK: 1 });
  this.builders = this.creepRoleCall('builder', body, this.buildersReq);
};

MissionBuilder.prototype.actionMiss = function () { // perform actions / missions
  for (let builder of this.builders) {
    this.builderActions(builder);
  }
};

MissionBuilder.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below
/**
 * 
 * @param {Creep} creep 
 */
MissionBuilder.prototype.builderActions = function (creep) {
  if (creep.memory.building && creep.store.energy == 0) {
    creep.memory.building = false;
    creep.say("Hmm");
  }
  if (!creep.memory.building && creep.store.energy == creep.store.getCapacity()) {
    creep.memory.building = true;
    creep.say("Urg");
  }
  if (!creep.memory.building) {
    let droppedSource = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1); //change to inRangeTo (cheaper) and managed by mission not creep logic?
    if (droppedSource.length && creep.pickup(droppedSource[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(droppedSource[0], {
        visualizePathStyle: {
          stroke: '#fa0'
        }
      });
    } else if (creep.withdraw(this.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.storage);
    }
  } else {
    let currentJob = creep.memory.currentJob || {};
    let { fill, build, tower } = currentJob;
    if (creep.memory.currentJob = creep.doBuildCsite(build)) return;
    if (this.spawnGroup.spawns[0].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.spawnGroup.spawns[0]);
    }
  }
};

module.exports = MissionBuilder;