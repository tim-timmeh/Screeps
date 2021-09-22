'use strict'
const Mission = require("./Mission")

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionUpgrader(operation) { // constructor, how to build the object
  Mission.call(this, operation, 'upgader'); // uses params to pass object through parnt operation constructor first
  this.controller = this.room.controller;
  this.storage = this.room.storage;
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionUpgrader.prototype = Object.create(Mission.prototype); // makes MissionUpgrader protos copy of Mission protos
MissionUpgrader.prototype.constructor = MissionUpgrader; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionUpgrader.prototype.init = function () { // Initialize / build objects required
  this.distanceToContoller = this.findDistanceToSpawn(this.controller, 3);
  this.storagePercent = this.storage
};

MissionUpgrader.prototype.roleCall = function () { // perform rolecall on required creeps spawn if needed
  let body = this.getBody({ CARRY: 1, MOVE: 1 , WORK: 1},{ addBodyPart: { MOVE: 1, CARRY: 1 }}, {options:{maxEnergyPercent:this.storagePercent}});
  this.upgraders = this.creepRoleCall('upgrader', body, 1);
};

MissionUpgrader.prototype.action = function () { // perform actions / missions

};

MissionUpgrader.prototype.finalize = function () { // finalize?

};

// Additional methods/functions below


