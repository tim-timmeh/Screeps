'use strict'
const Mission = require("./Mission")

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionClaim(operation, priority = 2) { // constructor, how to build the object
  Mission.call(this, operation, 'claim', priority); // uses params to pass object through parnt operation constructor first
  this.roomName = this.flag.pos.roomName;
  this.deleteFlag = false;
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionClaim.prototype = Object.create(Mission.prototype); // makes MissionClaim protos copy of Mission protos
MissionClaim.prototype.constructor = MissionClaim; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionClaim.prototype.initMiss = function () { // Initialize / build objects required

};

MissionClaim.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed
  let body = this.getBody({ MOVE: 1, CLAIM: 1 }, {maxRatio : 1 });
  this.claimers = this.creepRoleCall(this.name, body, 1); //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory}
};

MissionClaim.prototype.actionMiss = function () { // perform actions / missions
  for (let claimer of this.claimers) {
    this.claimerActions(claimer);
  }
};

MissionClaim.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

MissionClaim.prototype.claimerActions = function (creep) {
  if (!(creep.room.name == this.roomName)) {
    creep.moveToModule(this.flag);
  } else {
    if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE){
      creep.moveToModule(creep.room.controller)
    }
    if (creep.room.controller.my) {
      if (creep.room.controller.sign.text != "The Princess is in another castle") {
        if (creep.signController(creep.room.controller, "The Princess is in another castle") == ERR_NOT_IN_RANGE) {
          creep.moveToModule(creep.room.controller);
        }
        return
      }
      console.log(`Claimed ${creep.room}, Place Base Flag and Delete Claimer Flag!`)
    }
  }  
};


module.exports = MissionClaim;