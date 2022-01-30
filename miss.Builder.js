'use strict';
const Mission = require("./Mission");
const {MISS_PRIORITY} = require('./util.config');

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionBuilder(operation, priority = 2) { // constructor, how to build the object
  Mission.call(this, operation, 'builder', priority); // uses params to pass object through parnt operation constructor first
  this.storage = this.room.storage;
  this.memoryOp = operation.flag.memory;
  if (this.memoryOp.roadRepairIds && this.memoryOp.roadRepairIds.length) {
    this.repairTarget = this.memoryOp.roadRepairIds[this.memoryOp.roadRepairIds.length - 1];
    this.repairTargetObj = Game.getObjectById(this.repairTarget);
    if (!this.repairTargetObj) {
      this.memoryOp.roadRepairIds.pop();
    } else {
      this.targetRepairHits = this.repairTargetObj.hitsMax - this.repairTargetObj.hits;
      if (this.targetRepairHits == 0 || this.repairTargetObj.hits > 25000) {
        this.memoryOp.roadRepairIds.pop()
      }
    }
  } 
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionBuilder.prototype = Object.create(Mission.prototype); // makes MissionBuilder protos copy of Mission protos
MissionBuilder.prototype.constructor = MissionBuilder; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionBuilder.prototype.initMiss = function () { // Initialize / build objects required
  this.buildersReq = 0;
  //this.storagePercent = Math.max(0, (this.storage.store.getUsedCapacity() / this.storage.store.getCapacity())).toFixed(3);
  this.upperReserve = this.storageCapacity - (this.storageCapacity / 1.5); // 2=50% full, 3=66% full etc
  const lowerReserve = 0; //Forces a lower reserve limit to start scaling from. Eg 500k will only start spawning larger creeps from that limit.
  this.storagePercent = parseFloat(Math.max(0, (this.storage.store.getUsedCapacity() - lowerReserve) / this.upperReserve).toFixed(3)); // % of used storage
  let csitesQty = this.room.find(FIND_CONSTRUCTION_SITES, {
    filter : (c) => {
      return (c.progressTotal > 1)
    }
  }).length;
  if (csitesQty > 10 && this.storage.store.energy > (this.storage.store.getCapacity() * 0.3)) {
    this.buildersReq = 2;
  } else if (csitesQty) {
    this.buildersReq = 1
  }
};

MissionBuilder.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed
  let body = this.getBody({ CARRY: 1, MOVE: 1, WORK: 1 }, { maxEnergyPercent: this.storagePercent });
  if (!body.length) {
    body = ['carry', 'move', 'work']
  }
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
    let droppedSource = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3); //change to inRangeTo (cheaper) and managed by mission not creep logic?
    if (droppedSource.length) {
      if (creep.pickup(droppedSource[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSource[0], {
          visualizePathStyle: {
            stroke: '#fa0'
          }
        });
      }
    } else if (creep.withdraw(this.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.storage);
    } else {
      creep.giveWay();
    }
  } else {
    let currentJob = creep.memory.currentJob || {};
    let { fill, build, tower, repair} = currentJob;
    if (!repair) repair = this.repairTarget;
    if (creep.memory.currentJob = creep.doBuildCsite(build)) return;
    if ((creep.memory.currentJob = creep.doRepair(repair)) || this.repairTarget) return;
    if (this.spawnGroup.spawns[0].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.spawnGroup.spawns[0]);
      //console.log("SUICIDING")
    }

  }
};

module.exports = MissionBuilder;