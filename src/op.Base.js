

const Operation = require('./Operation');
const { OP_PRIORITY } = require('./util.config');
const MissionButler = require('./miss.Butler');
const MissionMiner = require('./miss.Miner');
const MissionUpgrader = require('./miss.Upgrader');
const MissionBuilder = require('./miss.Builder');
const MissionPlanner = require('./miss.Planner');
const MissionTower = require('./miss.Tower');
const MissionDefender = require('./miss.Defender');
const MissionTerminal = require('./miss.Terminal');
const MissionMinMiner = require('./miss.MinMiner');

//const {PRIORITY} = require('./config'); 

/**
 * General running of the base
 * @param {object} flag missions will operate relative to this flag, use colors to determine flag type via opCode
 * @param {string} flagName flag.name should be default set flag1/2/3 etc maybe need to add additional incase of doubleup?
 * @param {string} flagType decoded flag color used to determine which operation to instantiate (eg green/green = 55 = OpBase)
 * @param {object} king object used for king-scoped behavior (terminal transmission, etc.)
 * @constructor extends Operation
 */
function OperationBase(flag, flagName, flagType, king) {
  Operation.call(this, flag, flagName, flagType, king); // uses params to pass object through operation constructor first
  this.priority = OP_PRIORITY.CORE;
  //this.memory.bootstrapTimer = this.memory.bootstrapTimer || 280 // may or may not need?
  this.spawnGroup = this.king.getSpawnGroup(this.flag.pos.roomName);
}

OperationBase.prototype = Object.create(Operation.prototype); // makes operationbase protos copy of operation protos
OperationBase.prototype.constructor = OperationBase; // reset constructor to operationbase, or else constructor is operation

OperationBase.prototype.initOp = function () { // Initialize / build objects required
  //Room Layout?
  if (!this.room) return
  if (!this.spawnGroup) {
    this.spawnGroup = this.king.closestSpawnGroup(this.flag.pos.roomName);
    if (global.debug) console.log(`No spawn group in room, setting spawn group to ${this.spawnGroup.room}`);
  }
  this.droppedResources = this.room.find(FIND_DROPPED_RESOURCES)
  let storageContainerPos = new RoomPosition(this.pos.x + 1, this.pos.y + 1, this.room.name)
  this.storageContainer = storageContainerPos.lookFor(LOOK_STRUCTURES);
  this.addMission(new MissionButler(this));
  if (this.room.energyCapacityAvailable >= 700) { // min miner size
    for (let i = 0; i < this.room.sources.length; i++) {
      this.addMission(new MissionMiner(this, undefined, `miner${i}`, this.room.sources[i]));
    }
  }
  this.addMission(new MissionTower(this));
  this.addMission(new MissionDefender(this))
  if (this.storageContainer.length || (this.room.storage && this.room.storage.my)) {
    this.addMission(new MissionUpgrader(this));
    this.addMission(new MissionBuilder(this));
  }
  this.addMission(new MissionPlanner(this));
  if (this.room.terminal && this.room.storage) {
    this.addMission(new MissionTerminal(this));
  }
  if (this.room.controller.level >= 8 && this.room.terminal){
    this.addMission(new MissionMinMiner(this));
  }
};

OperationBase.prototype.roleCallOp = function () { // perform rolecall on required creeps spawn if needed

};
OperationBase.prototype.actionOp = function () { // perform actions / missions

};
OperationBase.prototype.finalizeOp = function () { // finalize?

};

// Additional methods/functions below
module.exports = OperationBase;
