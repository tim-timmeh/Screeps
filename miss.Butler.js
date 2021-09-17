
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
  let swarmQty;
  if (this.room.controller.level <= 2) {
    swarmQty = 6
    this.butlers = this.creepRoleCall('butler', this.getBody({ CARRY: 1, MOVE: 1 , WORK: 1},{ addBodyPart: { MOVE: 1, CARRY: 1 }}), swarmQty) //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory})
  } else {
    swarmQty = 2;
    this.butlers = this.creepRoleCall('butler', this.getBody({ CARRY: 2, MOVE: 1 }, { addBodyPart: { WORK: 1 }, removeBodyPart: 'CARRY' }), swarmQty) //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory})
  } if (!this.butlers) {
    console.log(`No Butlers found, Bootstrapping - ${this.room} - ${this.opName} (${this.opType}) - ${this.name}`)
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
      delete creep.memory.currentJob;
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
      let sourceMem;
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
      } else if (creep.memory.currentSource && creep.harvest(sourceMem = Game.getObjectById(creep.memory.currentSource)) == ERR_NOT_IN_RANGE) {
        result = creep.moveToModule(sourceMem);

      } else if (creep.harvest(sourceMy = creep.pos.findClosestByPath(FIND_SOURCES)) == ERR_NOT_IN_RANGE) {
        result = creep.moveToModule(sourceMy);
        creep.memory.currentSource = sourceMy.id;
      }
      if (result === -2) {
        delete creep.memory.currentSource;
      }
    } else {
      let currentJob = creep.memory.currentJob || {};
      let {fill, build, tower} = currentJob;
      if (creep.doFillEnergy(fill)) return;
      if (creep.doBuildCsite(build)) return;
      if (creep.doFillTower(tower)) return;
      if (creep.doUpgradeController()) return;
      console.log("No task, build standby task here");
    }
  }
};

module.exports = MissionButler;