'use strict'
const myFunc = require('./myFunctions');

/**
 * Top level operation constructor
 * @param {Flag} flag missions will operate relative to this flag, use colors to determine flag type via opCode
 * @param {string} flagName flag.name should be default set flag1/2/3 etc maybe need to add additional incase of doubleup?
 * @param {string} flagType decoded flag color used to determine which operation to instantiate (eg green/green = 55 = OpBase)
 * @param {object} king object used for king-scoped behavior (terminal transmission, etc.)
 * @class Operation
 */
function Operation(flag, flagName, flagType, king) {
  /** @type {Flag} */
  this.flag = flag;
  /** @type {string} */
  this.name = flagName
  /** @type {string} */
  this.type = flagType
  /** @type {object} */
  this.king = king
  /** @type {object | Memory} */
  this.memory = flag.memory
  if (this.flag.room) {
    this.hasVision = true; // is there vision in the room
    this.sources = this.flag.room.sources //get sources via room prototype (via variable/memory)
    //*this.minerals need to create
  }
}

Operation.prototype.init = function () { // Initialize / build objects required
  myFunc.tryWrap(() => {
    this.initOp(); // instantiate all objects require for operation including missions
  },`ERROR initOp ${this.name} ${this.type}`);
  for (let missionName in this.missions) { // then instantiate objects required for missions and functions
    myFunc.tryWrap(() => {
      this.missions[missionName].initMiss();
    },`ERROR initMiss ${missionName} , ${this.name}`);
  }
};
Operation.prototype.roleCall = function () { // perform rolecall on required creeps spawn if needed
  for (let missionName in this.missions) {
    myFunc.tryWrap(() => {
      this.missions[missionName].roleCallMiss();
    },`ERROR roleCallMiss ${missionName} , ${this.name}`);
  }
};
Operation.prototype.action = function () { // perform actions / missions
  for (let missionName in this.missions) {
    myFunc.tryWrap(() => {
      this.missions[missionName].actionMiss();
    },`ERROR actionMiss ${missionName} , ${this.name}`);
  }
};
Operation.prototype.finalize = function () { // finalize?
  for (let missionName in this.missions) {
    myFunc.tryWrap(() => {
      this.missions[missionName].finalizeMiss();
    },`ERROR finalizeMiss ${missionName} , ${this.name}`);
  };
  myFunc.tryWrap(() => {
    this.finalizeOp();
  },`ERROR finalizeOp ${this.name} ${this.type}`);
};

// Additional methods/functions below
Operation.prototype.addMission = function (mission) { // add missions
  this.missions[mission.name] = mission;
};

module.exports = Operation