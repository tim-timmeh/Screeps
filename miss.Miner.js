const Mission = require('./Mission');
const Operation = require('./Operation');

/**
 * 5w3m1c miner creep to sit and mine from a source to container
 * @param {Operation} operation 
 * @param {string} name
 * @param {Source} source 
 */
function MissionMiner(operation, name, source) { // constructor, how to build the object
  Mission.call(this, operation, name); // .call sends this object and uses it on Mission constructer.
  this.minerSource = source;

}

MissionMiner.prototype = Object.create(Mission.prototype); // makes MissionMiner proto copy of Mission proto
MissionMiner.prototype.constructor = MissionMiner; // reset constructor to MissionMiner, or else constructor is Mission

MissionMiner.prototype.initMiss = function () { // Initialize / build objects required
  let sourceRegen = this.room.controller.my ? 3000 : 1500; // 3000 owned, 1500 unreserved. Need to add 4000 for center rooms
  this.distanceToSpawn = this.findDistanceToSpawn(this.minerSource);
  //this.container = this.minerSource.findStructureNearby(STRUCTURE_CONTAINER, 1);
  this.container = this.minerSource.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: { structureType: STRUCTURE_CONTAINER }
  })[0];
  if (!this.container) {
    this.containerCsite = this.minerSource.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
      filter: { structureType: STRUCTURE_CONTAINER }
    })[0];
    if (!this.containerCsite) {
      this.placeMinerContainer();
    }
  } /*else {
    this.paveRoad(this.container, this.room.storage || this.spawnGroup[0])// Check path from container to storage || spawnGroup[0].pos ?? should add bunker entry as priority?
  }
  if (this.room.storage) {
    this.memory.haulerAnalysis = this.analyzeHauler(this.distanceToSpawn, sourceRegen);
  }*/
};
/**
 * Perform rolecall on required creeps, spawn if needed 
 */
MissionMiner.prototype.roleCallMiss = function () { // ?? creepRoleCall all pull from same pool?
  if  (this.room.energyCapacityAvailable < 700) return; // min miner size
  let body = this.getBody({ MOVE: 3, WORK: 5 }, { addBodyPart: { CARRY: 1 }, maxRatio: 1 }); 
  this.miners = this.creepRoleCall(this.name, body, 1, { prespawn: this.memory.distanceToSpawn }); //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory})
};
/**
 * Perform actions of mission
 */
MissionMiner.prototype.actionMiss = function () {
  for (let miner of this.miners) {
    this.minerActions(miner);
  }
};
/**
 * 
 */
MissionMiner.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

/**
 * 
 * @param {Creep} creep 
 */
MissionMiner.prototype.minerActions = function (creep) {
  let result;
  if (this.containerCsite && creep.store.getUsedCapacity(RESOURCE_ENERGY) >= 25) {
    creep.doBuildCsite(this.containerCsite.id);
    return
  }
  result = creep.harvest(this.minerSource)
  if (result == ERR_NOT_IN_RANGE) {
    let dest = this.container || this.containerCsite;
    creep.moveToModule(dest, true, 1000);
  }
};

/**
 * places a container at minerSource
 * @returns 
 */
MissionMiner.prototype.placeMinerContainer = function () {
  if (this.room.controller && this.room.controller.my && this.room.controller.level <= 2) return;
  let startingObject;
  if (this.storage) {
    startingObject = this.storage.pos;
  } else {
    startingObject = this.spawnGroup.pos;
    if (!startingObject) {
      console.log(`Error finding container start of path - ${this.missionLog}`);
      return
    };
  }
  if (this.minerSource.pos.findInRange(FIND_CONSTRUCTION_SITES, 1).length) {
    console.log("FOUND CONSTRUCTION SITE ABORTING");
    return;
  }
  console.log("NO FOUND CONSTRUCTION SITE, FINDING LOCATION TO BUILD AT");
  let ret = PathFinder.searchCustom(this.minerSource.pos, startingObject, 1); //? might need to switch ends?
  console.log(ret.path);
  if (ret.incomplete || ret.path.length == 0) {
    console.log(`Pathing for miner container placement failed - ${this.missionLog}`);
    return;
  }
  /**@type {RoomPosition} */
  let position = ret.path[0];
  console.log(`Miner: Placing container - ${this.missionLog}`);
  position.createConstructionSite(STRUCTURE_CONTAINER);
};

module.exports = MissionMiner;