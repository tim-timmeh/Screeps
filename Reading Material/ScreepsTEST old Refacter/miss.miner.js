'use strict'
const Mission = require('Mission');

module.exports = {MissionMiner}

//** Set miner to check and spawn 2 miners and deposit into containers if (<= rcl2 || maxenergy < 800) move:1,work:2,carry:1 {forcespawn}

function MissionMiner(operation, name, source) { // constructor, how to build the object
  Mission.call(operation,name)
  this.source = source;
  this.memory.minerBootstrapTimer = this.memory.minerBootstrapTimer || 0; // memory to check for bootstrapping
}

MissionMiner.prototype = Object.create(Mission.prototype); // makes operationbase protos copy of operation protos
MissionMiner.prototype.constructor = MissionMiner; // reset constructor to operationbase, or else constructor is operation

MissionMiner.prototype.init = function () { // Initialize / build objects required
  this.distanceToSpawn = this.findDistanceToSpawn(this.source.pos)
  this.storage = this.findStorage(this.source.pos)// find closest storage for room,
  this.container = this.source.findStructureNearby(STRUCTURE_CONTAINER, 1) //? find container (add mem option?)
  // If no container, place one. Else Confirm Path from storage || Spawn
  if (!this.container) {
    this.placeMinerContainer()
  } else {
    let startPos = this.storage || this.room.find(FIND_MY_SPAWNS)[0];
    startPos ? this.paveRoad(startPos, this.container, 2) : console.log(`Error in start position, no storage or spawn - ${this.opName} - ${this.room.name} - ${this.name}`)
  }
  //
  this.needsEnergyHauler = this.storage != undefined;
  if (this.needsEnergyHauler) {
    this.runHaulerAnalysis();
  }
};


MissionMiner.prototype.rolecall = function () { // perform rolecall on required creeps spawn if needed
  this.miners = this.creepRoleCall('miner', this.getBody({work: 2, move: 1},{maxRatio: 3, addBodyPart: {carry: 1}}));
  this.minerBootstrap() // checks for miners, if 300 ticks without will spawn emergency miner.
  //if this.memory.roadRepairIds spawn paver
};

MissionMiner.prototype.action = function () { // perform actions / missions

};
MissionMiner.prototype.finalize = function () { // finalize?

};

// Additional methods/functions below

/*MissionMiner.prototype.findMinerContainer = function (source) {
let container = source.pos.findInRange(LOOK_STRUCTURES,1);
if (container) return container;
}*/

/**
 * [Checks for container at source if not then create.]
 */
MissionMiner.prototype.placeMinerContainer = function () {
  if (this.room.controller && this.room.controller.my && this.room.controller.level <= 2) return; //? why not create container at level 1?
  let startingObject = this.storage
  if (!startingObject) {
    startingObject = this.room.find(FIND_MY_SPAWNS)[0];
    if (!startingObject) return
  }
  if (this.source.pos.findInRange(FIND_CONSTRUCTION_SITES,1).length > 0) return;//** NEEDS WORK use mem? like findStructureNearby proto?
  let ret = PathFinder.searchCustom(this.source.pos, startingObject.pos, 1) //? might need to switch ends?
  if (ret.incomplete || ret.path.length == 0) {
    console.log(`Pathing for miner container placement failed - ${this.opName} - ${this.room} - ${this.name}`);
    return;
  }
  let position = ret.path[0];
  console.log(`Miner: Placing container in ${this.room} - ${this.opName} - ${this.name}`);
  position.createConstructionSite(STRUCTURE_CONTAINER);
}

/**
 * [If 300 ticks no miners create miner]
 */
MissionMiner.prototype.minerBootstrap = function (){
  if (!this.miners) {
    if (global.debug) console.log(`No miners found, tick ${this.memory.minerBootstrapTimer} - ${this.opName} - ${this.room} - ${this.name}`);
    this.memory.minerBootstrapTimer = this.memory.minerBootstrapTimer + 1 || 1; // failsafe
    if (this.memory.minerBootstrapTimer >= 300) { //** Move 300 to Constant in config?
      console.log(`No miners found, bootstrapping operation! - ${this.opName} - ${this.room} - ${this.name}`);
      this.miners = this.creepRoleCall('miner', this.getBody({work: 2, move: 1},{forceSpawn: true, maxRatio: 3, addBodyPart: {carry: 1}}))
    }
  } else {
    this.memory.minerBootstrapTimer = 0;
  }
}

/**
 * [Generates distance from storage to source and regen time to pass to analyzeHauler to calc bandwidth req]
 */
MissionMiner.prototype.runHaulerAnalysis = function () {
  if (!this.memory.distanceToStorage) {
    let path = PathFinder.search(this.storage.pos, {pos: this.source.pos, range: 1}).path;
    this.memory.distanceToStorage = path.length;
  }
  let distance = this.memory.distanceToStorage;
  let regen = Math.max(this.source.energyCapacity, SOURCE_ENERGY_CAPACITY) / ENERGY_REGEN_TIME;
  this.haulerAnalysis = this.analyzeHauler(distance, regen);
}
