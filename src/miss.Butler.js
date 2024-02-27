
const Mission = require('./Mission');
const Operation = require('./Operation');

/**
 * 
 * @param {Operation} operation 
 */
function MissionButler(operation, priority = 2) { // constructor, how to build the object
  Mission.call(this, operation, 'butler', priority) // .call sends this object and uses it on Mission constructer.
  this.storage = this.room.storage && this.room.storage.my ? this.room.storage : this.storageContainer[0];
}

MissionButler.prototype = Object.create(Mission.prototype); // makes MissionButler proto copy of Mission proto
MissionButler.prototype.constructor = MissionButler; // reset constructor to MissionButler, or else constructor is Mission

MissionButler.prototype.initMiss = function () { // Initialize / build objects required

};
/**
 * Perform rolecall on required creeps, spawn if needed 
 */
MissionButler.prototype.roleCallMiss = function () { //?? will always make 2x and bigger and bigger, need alt plan in low spawning times to save energy. max size 300 carry (for Spawn)?
  let swarmQty;
  let body;
  if (this.spawnGroup.room.energyCapacityAvailable < 700 || !this.storage) { // 700 - min miner size
    swarmQty = 6
    if (this.spawnGroup.room.name != this.room.name) {
      body = this.getBody({ WORK: 1, CARRY: 1, MOVE: 2 }, { maxRatio: 12 });
    } else {
      body = this.getBody({ WORK: 1, CARRY: 1, MOVE: 1 }, { addBodyPart: { MOVE: 1, CARRY: 1 }, maxRatio: 12 });
    }
    this.butlers = this.creepRoleCall('butler', body, swarmQty) //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory})
  } else {
    swarmQty = 1; //this.spawnGroup.spawns.length;
    body = this.getBody({ CARRY: 2, MOVE: 1 }, { addBodyPart: { WORK: 1 }, removeBodyPart: 'CARRY', maxRatio: 12 });
    this.butlers = this.creepRoleCall('butler', body, swarmQty, { prespawn: 50 }) //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory})
  } if (!this.butlers || !this.butlers.length) {
    if (global.debug) console.log(`No Butlers found, Bootstrapping - ${this.room} - ${this.opName} (${this.opType}) - ${this.name}`);
    body = this.getBody({ WORK: 1, CARRY: 1, MOVE: 1 }, { addBodyPart: { MOVE: 1, CARRY: 1 }, forceSpawn: true });
    this.butlers = this.creepRoleCall('butler', body, 2) //{ CARRY: 2, MOVE: 1 }, { addBodyPart: { WORK: 1 }, removeBodyPart: 'CARRY', forceSpawn: true }), 2) // if no butlers forceSpawn (total creep wipe)
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
      delete creep.memory.currentSourceId;
      delete creep.memory.currentContainerId;
      creep.say("Urg");
    }

    if (!creep.memory.building) {
      let sourceMy;
      let containerMy;
      let result;
      let sourceMem;
      let storageMy = creep.room.storage;
      // let droppedSource = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3); //change to inRangeTo (cheaper) and managed by mission not creep logic?
      // if (droppedSource.length) {
      //   if (creep.pickup(droppedSource[0]) == ERR_NOT_IN_RANGE) {
      //     creep.moveToModule(droppedSource[0], {
      //       visualizePathStyle: {
      //         stroke: '#fa0'
      //       }
      //     });
      //   }
      if (this.creepScavenge(creep)) {

      } else if (storageMy && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
        if (creep.withdraw(storageMy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(storageMy);
        }
      } else if (creep.memory.currentContainerId && Game.getObjectById(creep.memory.currentContainerId).store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        sourceMem = Game.getObjectById(creep.memory.currentContainerId);
        if (sourceMem && sourceMem.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.withdraw(sourceMem, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          result = creep.moveToModule(sourceMem);
        }
      } else if (creep.memory.currentSourceId) {
        sourceMem = Game.getObjectById(creep.memory.currentSourceId)
        if (sourceMem && creep.harvest(sourceMem) == ERR_NOT_IN_RANGE) {
          result = creep.moveToModule(sourceMem);
        } else {
          creep.giveWay({ pos: sourceMem.pos, range: 1 })
        }
      } else if (containerMy = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => {
          return (s.structureType == STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 100 && s.id != this.memoryOp.controllerContainer)
        }
      })) {
        if (creep.withdraw(containerMy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          result = creep.moveToModule(containerMy);
          creep.memory.currentContainerId = containerMy.id;
        }
      } else if (creep.harvest(sourceMy = creep.pos.findClosestByPath(FIND_SOURCES, {
        filter: (s) => {
          return (s.energy > 0)
        }})) == ERR_NOT_IN_RANGE) { // add to check is not empty
        result = creep.moveToModule(sourceMy);
        creep.memory.currentSourceId = sourceMy.id;
      } else {
        creep.giveWay()
      }
      if (result === -2) { // add if result is source/container is empty the delete
        delete creep.memory.currentSourceId;
        delete creep.memory.currentContainerId;
        if (global.debug) console.log(`ERR_NO_PATH, deleting currentSourceId from butler memory ${creep.name} - ${this.missionLog}`)
      }
    } else if (!(creep.room.name == this.flag.pos.roomName)) {
      creep.moveToModule(this.flag);
    } else {
      let currentJob = creep.memory.currentJob || {};
      let { fill, build, tower } = currentJob;
      if (creep.memory.currentJob = creep.doFillEnergy(fill)) return;
      if (creep.memory.currentJob = creep.doFillTower(tower)) return;
      if (creep.memory.currentJob = creep.doBuildCsite(build)) return;
      if (creep.room.controller.sign && creep.room.controller.sign.text != "The Princess is in another castle") {
        if (creep.signController(creep.room.controller, "The Princess is in another castle") == ERR_NOT_IN_RANGE) {
          creep.moveToModule(creep.room.controller);
        }
        return
      };
      if (this.memoryOp.upgrader && this.memoryOp.upgrader.upgraderPos && Object.keys(this.memoryOp.upgrader.upgraderPos).length) {
        let memPos = this.memoryOp.upgrader.upgraderPos
        let lastPos = new RoomPosition(memPos.x, memPos.y, memPos.roomName);
        let container = lastPos.findInRange(FIND_STRUCTURES, 1, {
          filter: { structureType: STRUCTURE_CONTAINER }
        })[0];
        if (container && container.store.getFreeCapacity() > 0) {
          creep.doFillContainer(container)
          return
        }
      }
      if (this.room.terminal && this.room.terminal.store[RESOURCE_ENERGY] < 50000 && (creep.memory.currentJob = creep.doFillEnergy(this.room.terminal.id))) return;
      if (creep.memory.currentJob = creep.doUpgradeController()) return;
      if (global.debug) console.log(`No task, build standby task here ${this.missionLog}`);
      creep.giveWay();
    }
  }
};

module.exports = MissionButler;
