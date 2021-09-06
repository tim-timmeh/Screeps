'use strict'
require('mission');

function MissionButler(operation) { // constructor, how to build the object
  Mission.call(operation,'Mission Butler')
}

MissionButler.prototype = Object.create(Mission.prototype); // makes operationbase protos copy of operation protos
MissionButler.prototype.constructor = MissionButler; // reset constructor to operationbase, or else constructor is operation

MissionButler.prototype.init = function () { // Initialize / build objects required

};
MissionButler.prototype.rolecall = function () { // perform rolecall on required creeps spawn if needed
  this.butlers = this.creepRoleCall('butler', getBody({CARRY : 2, MOVE : 1},{addBodyPart: {work: 1}, removeBodyPart: 'CARRY'}), 2) //work, carry, move, {maxRatio, maxEnergyPercent}
  if (!this.butlers) {
    this.butlers = this.creepRoleCall('butler', getBody({CARRY : 2, MOVE : 1},{addBodyPart: {work: 1}, removeBodyPart: 'CARRY', forceSpawn: true}), 2) // if no butlers forceSpawn (total creep wipe)
  }
};
MissionButler.prototype.action = function () { // perform actions / missions

};
MissionButler.prototype.finalize = function () { // finalize?

};

// Additional methods/functions below
