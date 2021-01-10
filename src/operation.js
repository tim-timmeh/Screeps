'use strict'

/**
 * [Operation description]
 * @param       {object} flag     [description]
 * @param       {string} flagName [description]
 * @param       {string} flagType [description]
 * @param       {object} king     [description]
 * @constructor
 */
function Operation(flag, flagName, flagType, king) {
  this.flag = flag;
  this.name = flagName
  this.type = flagType
  this.king = king
  this.memory = flag.memory
  if (this.flag.room) {
    //this.hasVision = true; // is there vision in the room
    this.sources = this.flag.room.sources //get sources via room prototype (via variable/memory)
    //*this.minerals need to create
  }
}

Operation.
prototype.init = function () { // Initialize / build objects required
  myFunc.tryWrap(() => {
  this.initOp(); // instantiate all objects require for operation including missions
},`ERROR initOp ${this.name} ${this.type}`)
  for (missions in this.missions) { // then instantiate objects required for missions and functions

  }
};
Operation.prototype.rolecall = function () { // perform rolecall on required creeps spawn if needed

};
Operation.prototype.action = function () { // perform actions / missions

};
Operation.prototype.finalize = function () { // finalize?

};

// Additional methods/functions below
Operation.prototype.addMission = function (mission) { // add missions
  this.missions[mission.name] = mission;
};
