const Mission = require('./Mission');
const Operation = require('./Operation');

/**
 * 5w3m1c miner creep to sit and mine from a source to container
 * @param {Operation} operation 
 * @param {string} name
 * @param {Source} source 
 */
function MissionMiner(operation, priority = 2, name, source) { // constructor, how to build the object
  Mission.call(this, operation, name, priority); // .call sends this object and uses it on Mission constructer.
  this.minerSource = source;
  this.haulerAnalysis = {};
  this.storageMy = this.room.storage && this.room.storage.my ? this.room.storage : this.storageContainer[0];


}

MissionMiner.prototype = Object.create(Mission.prototype); // makes MissionMiner proto copy of Mission proto
MissionMiner.prototype.constructor = MissionMiner; // reset constructor to MissionMiner, or else constructor is Mission

MissionMiner.prototype.initMiss = function () { // Initialize / build objects required
  let sourceRegen = Math.max(this.minerSource.energyCapacity, SOURCE_ENERGY_CAPACITY) / ENERGY_REGEN_TIME; // 3000 owned, 1500 unreserved. Need to add 4000 for center rooms
  this.distanceToSpawn = this.findDistanceToSpawn(this.minerSource.pos);
  //this.container = this.minerSource.findStructureNearby(STRUCTURE_CONTAINER, 1);
  this.container = this.minerSource.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: { structureType: STRUCTURE_CONTAINER }
  })[0];
  if (!this.container) {
    this.containerCsite = this.minerSource.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
      filter: { structureType: STRUCTURE_CONTAINER }
    })[0];
    if (!this.containerCsite) {
      this.placeContainer(this.minerSource, 1);
    }
  } else {
    //let storageCheck = this.room.storage && this.room.storage.my ? this.room.storage : false
    this.paveRoad(this.container, this.storageMy || this.spawnGroup);// Check path from container to storage || spawnGroup.spawns[0].pos ?? should add bunker entry as priority?
  }
  if (this.container && this.storageMy) {
    this.haulerAnalysis = this.analyzeHauler(this.distanceToSpawn, sourceRegen);
  }
};
/**
 * Perform rolecall on required creeps, spawn if needed 
 */
MissionMiner.prototype.roleCallMiss = function () { // ?? creepRoleCall all pull from same pool?
  //if (this.room.energyCapacityAvailable < 800) return; // min miner size
  let body = this.getBody({ MOVE: 1, WORK: 2 }, { addBodyPart: { CARRY: 1 }, maxRatio: 3 });
  this.miners = this.creepRoleCall(this.name, body, 1, { prespawn: this.memory.distanceToSpawn }); //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory})
  if (Object.keys(this.haulerAnalysis).length) {
    let { distance, body, haulersNeeded } = this.haulerAnalysis;
    this.haulers = this.creepRoleCall(this.name + ".hauler", body, haulersNeeded, { prespawn: distance });
  }
};
/**
 * Perform actions of mission
 */
MissionMiner.prototype.actionMiss = function () {
  if (!this.miners) return;
  for (let miner of this.miners) {
    this.minerActions(miner);
  }
  if (this.haulers) {
    for (let hauler of this.haulers) {
      this.haulerActions(hauler);
    }
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
    return;
  }
  result = creep.harvest(this.minerSource);
  if (result == ERR_NOT_IN_RANGE) {
    let dest = this.container || this.containerCsite;
    creep.moveToModule(dest, { ticks: 10, range: 0 });

  } else if (result == ERR_NOT_ENOUGH_RESOURCES) {
    if (creep.repair(this.container) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.container, { ticks: 10, range: 0 });
    }
  }
};

MissionMiner.prototype.haulerActions = function (creep) {
  if (creep.memory.building && creep.store.energy == 0) {
    creep.memory.building = false;
    creep.say("Hmm");
  }
  if (!creep.memory.building && creep.store.energy == creep.store.getCapacity()) {
    creep.memory.building = true;
    creep.say("Urg");
  }
  if (!creep.memory.building) {
    // let droppedSource = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 2); //change to inRangeTo (cheaper) and managed by mission not creep logic?
    // if (droppedSource.length) {
    //   if (creep.pickup(droppedSource[0]) == ERR_NOT_IN_RANGE) {
    //     creep.moveTo(droppedSource[0], {
    //       visualizePathStyle: {
    //         stroke: '#fa0'
    //       }
    //     });
    //   }
    if (this.creepScavenge(creep)){

    } else if (creep.withdraw(this.container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.container);
    } else {
      creep.giveWay({ pos: this.container.pos, range: 1 })
    }
  } else if (this.storageMy && (this.storageMy.store.getFreeCapacity() > 0)) {
    if (creep.transfer(this.storageMy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.storageMy);
    }
  } else if (this.room.terminal) {
    if (creep.transfer(this.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.room.terminal);
    } 
  } else if (this.memoryOp.controllerContainer && Game.getObjectById(this.memoryOp.controllerContainer).store.getFreeCapacity() > 0){
    if (creep.transfer(Game.getObjectById(this.memoryOp.controllerContainer), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(Game.getObjectById(this.memoryOp.controllerContainer));
    }
  } else {
    creep.giveWay()
  }
};

module.exports = MissionMiner;