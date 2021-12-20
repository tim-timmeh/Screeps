'use strict'
require('mission');

function MissionDefence(operation) { // constructor, how to build the object
  Mission.call(operation,'Mission Defence')
}

MissionDefence.prototype = Object.create(Mission.prototype); // makes operationbase protos copy of operation protos
MissionDefence.prototype.constructor = MissionDefence; // reset constructor to operationbase, or else constructor is operation

MissionDefence.prototype.init = function () { // Initialize / build objects required
  this.towers = this.room.findStructures(STRUCTURE_TOWER);
  //this.analyzeThreat() // Determine severity of attack
  //this.determineSafeMode // Calls to check if base has been breached / safe mode should be activated
};

MissionDefence.prototype.rolecall = function () { // perform rolecall on required creeps spawn if needed
  this.defenders = this.creepRoleCall('defender', getBody({TOUGH: 1, ATTACK : 3 , MOVE : 4},{maxRatio : 5}));
};

MissionDefence.prototype.action = function () { // perform actions / missions
  let order = 0;
  for(let defender of this.defenders) {
    this.defenderAction(defender, order);
    order++;
  }
};
MissionDefence.prototype.finalize = function () { // finalize?

};

// Additional methods/functions below
function defenderAction(defender, order) {

}
