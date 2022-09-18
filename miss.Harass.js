'use strict'
const Mission = require("./Mission")

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionHarrass(operation, priority = 3) { // constructor, how to build the object
  Mission.call(this, operation, 'harrass', priority); // uses params to pass object through parnt operation constructor first
  this.roomName = this.flag.pos.roomName;
  this.deleteFlag = false;
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionHarrass.prototype = Object.create(Mission.prototype); // makes MissionHarrass protos copy of Mission protos
MissionHarrass.prototype.constructor = MissionHarrass; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionHarrass.prototype.initMiss = function () { // Initialize / build objects required

};

MissionHarrass.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed
  let body = this.getBody({ MOVE: 1, HEAL: 1 });
  this.harassers = this.creepRoleCall(this.name, body, 1); //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory})
};

MissionHarrass.prototype.actionMiss = function () { // perform actions / missions
  for (let harasser of this.harassers) {
    this.harasserActions(harasser);
  }
};

MissionHarrass.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

MissionHarrass.prototype.harasserActions = function (creep) {
  let totalHealParts = creep.getActiveBodyparts(HEAL);
  let healAmount = totalHealParts * 12;
  if ((creep.hitsMax - creep.hits) > (healAmount * 2)) {
    creep.moveToModule(this.spawnGroup.pos)
  } else {
    creep.moveToModule(this.flag);
  }
  creep.heal(creep)
};


module.exports = MissionHarrass;