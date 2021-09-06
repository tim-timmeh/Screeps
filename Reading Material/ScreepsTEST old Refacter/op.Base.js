'use strict'

require('Operation');
require('config');
require('Miss.Butler')
const {PRIORITY} = require('config'); //
/**
* [General running of the base]
* @param       {[object]} flag     [missions will operate relative to this flag, use colors to determine flag type via opCode]
* @param       {[string]} flagName [flag.name should be default set flag1/2/3 etc maybe need to add additional incase of doubleup?]
* @param       {[string]} flagType   [decoded flag color used to determine which operation to instantiate (eg green/green = 55 = OpBase)]
* @param       {[object]} king     [object used for king-scoped behavior (terminal transmission, etc.)]
* @constructor
* @extends Operation
*/
function OperationBase(flag, flagName, flagType, king) {
  Operation.call(this, flag, flagName, flagType, king); // uses params to pass object through operation constructor first
  this.priority = PRIORITY.CORE;
  this.memory.bootstrapTimer = this.memory.bootstrapTimer || 280
}

OperationBase.prototype = Object.create(Operation.prototype); // makes operationbase protos copy of operation protos
OperationBase.prototype.constructor = OperationBase; // reset constructor to operationbase, or else constructor is operation

OperationBase.prototype.initOp = function () { // Initialize / build objects required
  //Room Layout?

  this.spawnGroup = this.king.getSpawnGroup(this.flag.room);
  if (!this.spawnGroup){console.log('no spawn group in room, create remote spawngroup code')} //get closest spawn group

  this.addMission(new MissionButler(this));

  this.addMission(new DefenceMission(this));

  //base commander mission?
  for (let i = 0; i < this.sources.length; i++) {
    let source = sources[i];
    //if rcl 8 do link mining
    this.addMission(new MiningMission(this, 'Mission Miner' + i, source));
  }

  //building missions
  //
  //upgrader missions
  //
};
OperationBase.prototype.rolecall = function () { // perform rolecall on required creeps spawn if needed

};
OperationBase.prototype.action = function () { // perform actions / missions

};
OperationBase.prototype.finalize = function () { // finalize?

};

// Additional methods/functions below
