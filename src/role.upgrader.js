"use strict";
require("moveToModule");
var roleUpgrader = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
      creep.say("\u26CF harvest");
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say("\uD83D\uDC8E Upgrade");
    }
    if (!creep.memory.building) {
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
    } else {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveToModule(creep.room.controller);
      }
    }
  }
};

module.exports = roleUpgrader;

