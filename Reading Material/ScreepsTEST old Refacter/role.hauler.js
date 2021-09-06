"use strict";
require("moveToModule");
var missUpgrader = require("miss.upgrader");
var missHauler = {

  /** @param {Creep} creep **/
  run: function(creep) {

    if (creep.memory.building && _.sum(creep.carry) == 0) {
      creep.memory.building = false;
      creep.say("\ud83d\udc50 Collecting");
    }
    if (!creep.memory.building && _.sum(creep.carry) == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say("\ud83d\udce6 Hauling");
    }

    if (!creep.memory.building) {
      var haulerSource = Game.getObjectById(creep.memory.haulerSource);
      var droppedSource = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
      if (droppedSource != "" && creep.pickup(droppedSource[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSource[0], {
          visualizePathStyle: {
            stroke: '#fa0'
          }
        });
      } else if (creep.withdraw(haulerSource, RESOURCE_LEMERGIUM) == ERR_NOT_IN_RANGE || creep.withdraw(haulerSource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveToModule(haulerSource);
      }
    } else {
      var targets;
      if (creep.carry.energy != 0) {
        targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: (s) => {
            return (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) &&
              s.energy < s.energyCapacity;
          }
        });
      }
      var targetsS = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (s) => {
          return (s.structureType == STRUCTURE_STORAGE);
        }
      });

      if (targets != undefined) {
        if (creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(targets);
        }
      } else if (targetsS != "" && creep.room.storage.store[RESOURCE_ENERGY] < targetsS[0].storeCapacity) {
        if (creep.transfer(targetsS[0], RESOURCE_LEMERGIUM) == ERR_NOT_IN_RANGE || creep.transfer(targetsS[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(targetsS[0]);
        }
      } else {
        missUpgrader.run(creep);
      }
    }
  }
};

module.exports = missHauler;
