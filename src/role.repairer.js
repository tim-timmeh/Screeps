"use strict";
require("moveToModule");
var roleBuilder = require("role.builder");
var roleRepairer = {

  /** @param {Creep} creep **/
  run: function(creep) {

    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
      creep.say("\u26CF harvest");
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say("\ud83d\udd27 Repair");
    }

    if (creep.memory.building) {
      var targetsRepair
      var targetsT = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
      });
      if (targetsT.length > 0 && !(creep.room.storage) || targetsT.length > 0 && (creep.room.storage && (creep.room.storage.store[RESOURCE_ENERGY] > 500))) {
        targetsT.sort((a, b) => a.energy - b.energy)
        if (creep.transfer(targetsT[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(targetsT[0]);
        }
      } else if (targetsRepair = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (hp) => hp.hits < (hp.hitsMax - 500) && hp.hits < 200000
      })) {
        if (creep.repair(targetsRepair) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(targetsRepair);
        }
      } else {
        roleBuilder.run(creep);
      }
    } else {
      var sources;
      var targetsS = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (s) => {
          return (s.structureType == STRUCTURE_STORAGE);
        }
      });
      if (targetsS != "" && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
        if (creep.withdraw(targetsS[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(targetsS[0]);
        }
      } else if (creep.harvest(sources = creep.pos.findClosestByPath(FIND_SOURCES)) == ERR_NOT_IN_RANGE) {
        creep.moveToModule(sources);
      }
    }
  }
};

module.exports = roleRepairer;
