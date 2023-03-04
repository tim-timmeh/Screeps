const Operation = require('./Operation');
const {OP_PRIORITY} = require('./util.config');
const MissionLoot = require('./miss.Loot');

/*
Psudocode, placing Plunder flag:
find closest spawngroup
spawn dismantlers
spawn haulers
move to room
dismantle/withdraw required
sell excess
repeat until room cleared
remove flag
*/

/**
 * Plunder resources from defeated room
 * @param {object} flag missions will operate relative to this flag, use colors to determine flag type via opCode
 * @param {string} flagName flag.name should be default set flag1/2/3 etc maybe need to add additional incase of doubleup?
 * @param {string} flagType decoded flag color used to determine which operation to instantiate (eg green/green = 55 = OpBase)
 * @param {object} king object used for king-scoped behavior (terminal transmission, etc.)
 * @constructor extends Operation
 */
function OperationPlunder(flag, flagName, flagType, king) {
  Operation.call(this, flag, flagName, flagType, king); // uses params to pass object through operation constructor first
  this.priority = OP_PRIORITY.MED;
}

OperationPlunder.prototype = Object.create(Operation.prototype); // makes operationbase protos copy of operation protos
OperationPlunder.prototype.constructor = OperationPlunder; // reset constructor to operationbase, or else constructor is operation

OperationPlunder.prototype.initOp = function () { // Initialize / build objects required
  this.spawnGroup = this.king.getSpawnGroup(this.flag.pos.roomName);
  if (!this.spawnGroup) {
    this.spawnGroup = this.king.closestSpawnGroup(this.flag.pos.roomName);
  } 
  this.addMission(new MissionLoot(this));
};
OperationPlunder.prototype.roleCallOp = function () { // perform rolecall on required creeps spawn if needed

};
OperationPlunder.prototype.actionOp = function () { // perform actions / missions

};
OperationPlunder.prototype.finalizeOp = function () { // finalize?

};

// Additional methods/functions below
module.exports = OperationPlunder;
