

const Operation = require('./Operation');
const { OP_PRIORITY } = require('./util.config');
const MissionButler = require('./miss.Butler');
const MissionMiner = require('./miss.Miner');
const MissionUpgrader = require('./miss.Upgrader');
const MissionBuilder = require('./miss.Builder');
const MissionPlannerCompact = require('./miss.PlannerCompact');
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
function OperationBaseCompact(flag, flagName, flagType, king) {
  Operation.call(this, flag, flagName, flagType, king); // uses params to pass object through operation constructor first
  this.priority = OP_PRIORITY.CORE;
  //this.memory.bootstrapTimer = this.memory.bootstrapTimer || 280 // may or may not need?
  this.spawnGroup = this.king.getSpawnGroup(this.flag.pos.roomName);
}

OperationBaseCompact.prototype = Object.create(Operation.prototype); // makes OperationBaseCompact protos copy of operation protos
OperationBaseCompact.prototype.constructor = OperationBaseCompact; // reset constructor to OperationBaseCompact, or else constructor is operation

OperationBaseCompact.prototype.initOp = function () { // Initialize / build objects required
  //Room Layout?
  if (!this.room) return
  if (!this.spawnGroup) {
    this.spawnGroup = this.king.closestSpawnGroup(this.flag.pos.roomName);
    if (global.debug) console.log(`No spawn group in room, setting spawn group to ${this.spawnGroup.room}`);
  }
  this.droppedResources = this.room.find(FIND_DROPPED_RESOURCES)
  let storageContainerPos = new RoomPosition(this.pos.x - 3, this.pos.y + 1, this.room.name) // in relation to flag
  this.storageContainer = storageContainerPos.lookFor(LOOK_STRUCTURES); //If road on container will error??
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
  this.addMission(new MissionPlannerCompact(this));
  if (this.room.terminal && this.room.storage) {
    this.addMission(new MissionTerminal(this));
  }
  if (this.room.controller.level >= 8 && this.room.terminal){
    this.addMission(new MissionMinMiner(this));
  }
};

OperationBaseCompact.prototype.roleCallOp = function () { // perform rolecall on required creeps spawn if needed

};
OperationBaseCompact.prototype.actionOp = function () { // perform actions / missions

};
OperationBaseCompact.prototype.finalizeOp = function () { // finalize?

};

// Additional methods/functions below
module.exports = OperationBaseCompact;
