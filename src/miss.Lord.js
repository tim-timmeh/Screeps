'use strict'
const Mission = require("./Mission")

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionLord(operation, priority = 1) { // constructor, how to build the object
  Mission.call(this, operation, 'lord', priority); // uses params to pass object through parnt operation constructor first

}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionLord.prototype = Object.create(Mission.prototype); // makes MissionLord protos copy of Mission protos
MissionLord.prototype.constructor = MissionLord; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionLord.prototype.initMiss = function () { // Initialize / build objects required

};

MissionLord.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed
  let body = this.getBody({ CARRY }, {maxRatio : 6 });
  this.lords = this.creepRoleCall(this.name, body, 1); //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory}
};

MissionLord.prototype.actionMiss = function () { // perform actions / missions
  for (let lord of this.lords) {
    this.lordActions(lord);
  }
};

MissionLord.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

MissionLord.prototype.lordActions = function (creep) {
 
};


module.exports = MissionLord;