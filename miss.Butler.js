
const Mission = require('./Mission');
const Operation = require('./Operation');

/**
 * 
 * @param {Operation} operation 
 */
function MissionButler(operation) { // constructor, how to build the object
  Mission.call(this, operation, 'butler') // .call sends this object and uses it on Mission constructer.
}

MissionButler.prototype = Object.create(Mission.prototype); // makes MissionButler proto copy of Mission proto
MissionButler.prototype.constructor = MissionButler; // reset constructor to MissionButler, or else constructor is Mission

MissionButler.prototype.initMiss = function () { // Initialize / build objects required

};
/**
 * Perform rolecall on required creeps, spawn if needed 
 */
MissionButler.prototype.roleCallMiss = function () { // TODO: tweak RCL 2 & 3s transition to miners (Only 1 work plus goes to max 2 butlers). Also change removeBodyPart to object like addBodyParty.
  let swarmQty = 20;
  if (this.room.controller.level >= 3) swarmQty = 2;
  this.butlers = this.creepRoleCall('butler', this.getBody({ CARRY: 2, MOVE: 1 }, { addBodyPart: { WORK: 1 }, removeBodyPart: 'CARRY' }), swarmQty) //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory})
  if (!this.butlers) {
    this.butlers = this.creepRoleCall('butler', this.getBody({ CARRY: 2, MOVE: 1 }, { addBodyPart: { WORK: 1 }, removeBodyPart: 'CARRY', forceSpawn: true }), 2) // if no butlers forceSpawn (total creep wipe)
  }
};
/**
 * Perform actions of mission
 */
MissionButler.prototype.actionMiss = function () { 
  for (let butler of this.butlers) {
    this.butlerActions(butler)
  }
};
MissionButler.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

/**
 * 
 * @param {Creep} creep 
 */
MissionButler.prototype.butlerActions = function (creep) {
  {

    if (creep.memory.building && creep.store.energy == 0) {
      creep.memory.building = false;
      creep.say("Hmm");
    }
    if (!creep.memory.building && creep.store.energy == creep.store.getCapacity()) {
      creep.memory.building = true;
      delete creep.memory.currentSource;
      creep.say("Urg");
    }

    if (!creep.memory.building) {
      let sourceMy;
      let result;
      let storageMy = creep.room.storage;
      let droppedSource = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5); //change to inRangeTo (cheaper)
      if (droppedSource.length && creep.pickup(droppedSource[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSource[0], {
          visualizePathStyle: {
            stroke: '#fa0'
          }
        });
      } else if (storageMy && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
        if (creep.withdraw(storageMy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(storageMy);
        }
        delete creep.memory.currentSource;
      } else if (creep.memory.currentSource && creep.harvest(Game.getObjectById(creep.memory.currentSource)) == ERR_NOT_IN_RANGE) {
        result = creep.moveToModule(Game.getObjectById(creep.memory.currentSource));
        
      } else if (creep.harvest(sourceMy = creep.pos.findClosestByPath(FIND_SOURCES)) == ERR_NOT_IN_RANGE) {
        result = creep.moveToModule(sourceMy);
        creep.memory.currentSource = sourceMy.id;
      }
      if (result === -2) {
        delete creep.memory.currentSource;
      }
    } else {
      /** @type {Structure | undefined} */
      let targets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
            structure.energy < structure.energyCapacity;
        }
      });
      let targetsT; /*= creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
      });*/
      if (targets && Object.keys(targets).length) {
        if (creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(targets);
        }
      } else if ((targetsT = targetsTF(creep)).length) {
        targetsT.sort((a, b) => a.energy - b.energy);
        if (creep.transfer(targetsT[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(targetsT[0]);
        }
      } else {
        //roleBuilder.run(creep);
      }
    }
  }
};

/**
 * 
 * @param {Creep} creep 
 * @returns 
 */
function targetsTF(creep) {
  let t = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_TOWER) && structure.store[RESOURCE_ENERGY] < structure.store.getCapacity(RESOURCE_ENERGY);
    }
  });
  return t
};

module.exports = MissionButler;