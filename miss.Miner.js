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
  this.distanceToSpawn = this.findDistanceToSpawn(this.minerSource);
  this.container = this.minerSource.findStructureNearby(STRUCTURE_CONTAINER, 1);
  if (!this.container) {
    this.placeMinerContainer(); //? Add logic that when no container but constructionsite go and mine/build
  }
};
/**
 * Perform rolecall on required creeps, spawn if needed 
 */
MissionMiner.prototype.roleCallMiss = function () { // 
  let body = this.getBody({ MOVE: 3, WORK: 5 }, { addBodyPart: { CARRY: 1 }, maxRatio: 1 }); //? will spawn 1 carry parts if controller 3 but not enough energy
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
  if (this.minerSource && creep.harvest(this.minerSource) == ERR_NOT_IN_RANGE) {
    let dest = this.container || this.minerSource;
    result = creep.moveToModule(dest, true, 1000);
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
  if (this.minerSource.pos.findInRange(FIND_CONSTRUCTION_SITES, 1).length > 0) return;
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