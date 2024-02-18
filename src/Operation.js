
const myFunc = require('./util.myFunctions');

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
  /** @type {RoomPosition} */
  this.pos = flag.pos
  /** @type {Room} */
  this.room = flag.room;
  /** @type {string} */
  this.name = flagName
  /** @type {string} */
  this.type = flagType
  /** @type {object} */
  this.king = king
  /** @type {object | Memory} */
  this.memory = flag.memory
  //this.nameTemplate = this.type.substring(2, 5) + this.name.split("g")[1];
  if (!this.missions) {
    this.missions = {};
  }
  if (this.flag.room) {
    this.hasVision = true; // is there vision in the room
    this.sources = this.flag.room.sources //get sources via room prototype (via variable/memory)
    //*this.minerals need to create
  }
}

Operation.prototype.init = function () { // Initialize / build objects required
  myFunc.tryWrap(() => {
    this.initOp(); // instantiate all objects require for operation including missions
  }, `ERROR initOp ${this.name} ${this.type}`, `initOp_${this.name}`);
  for (let missionName in this.missions) { // then instantiate objects required for missions and functions
    myFunc.tryWrap(() => {
      this.missions[missionName].initMiss();
    }, `ERROR initMiss ${this.name} (${this.type}) - ${missionName}`, `initMiss_${this.name}`);
  }
};
Operation.prototype.roleCall = function () { // perform rolecall on required creeps spawn if needed
  for (let missionName in this.missions) {
    myFunc.tryWrap(() => {
      this.missions[missionName].roleCallMiss();
    }, `ERROR roleCallMiss ${this.name} (${this.type}) - ${missionName}`, `RoleCallMiss_${this.name}`);
  }
};
Operation.prototype.action = function () { // perform actions / missions
  for (let missionName in this.missions) {
    let mission = this.missions[missionName]
    if (Game.cpu.bucket >= mission.priority) {
      myFunc.tryWrap(() => {
        mission.actionMiss();
      }, `ERROR actionMiss, ${this.name} (${this.type}) - ${missionName}`, `actionMiss_${this.name}`);
    } else {
      //console.log(`ERROR, Not enough bucket to execute (${mission.priority} - ${Game.cpu.bucket}/10000), skipping: ${this.name} (${this.type}) - ${missionName}`)
      //Add logging/cache here
    }
  }
};
Operation.prototype.finalize = function () { // finalize?
  for (let missionName in this.missions) {
    myFunc.tryWrap(() => {
      this.missions[missionName].finalizeMiss();
    }, `ERROR finalizeMiss ${this.name} (${this.type}) - ${missionName}`, `finalizeMiss_${this.name}`);
  };
  myFunc.tryWrap(() => {
    this.finalizeOp();
  }, `ERROR finalizeOp ${this.name} (${this.type}) - ${Object.keys(this.missions)}`, `finalizeOp_${this.name}`);
};

// Additional methods/functions below
Operation.prototype.addMission = function (mission) { // add missions
  this.missions[mission.name] = mission;
};

module.exports = Operation