"use strict";
var roleUpgrader = require("role.upgrader");
var roleBuilder = require("role.builder");
var rolePioneer = require("role.pioneer");
require("moveToModule");
var tankFlag;
var enemyRanged;
var enemyTower;
var enemyCreep;
var enemyStructure;
var roletank = {

  /** @param {Creep} creep **/
  run: function(creep) {
    tankFlag = _.filter(Game.flags, f => f.name == "tankFlag")
    if (tankFlag[0] && creep.pos.roomName != tankFlag[0].pos.roomName) {
      creep.moveToModule(tankFlag[0].pos)
      if (!enemyRanged && !enemyTower && creep.hits < creep.hitsMax) {
        creep.heal(creep)
      }
    } else {
      enemyRanged = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter : c => c.getActiveBodyparts(RANGED_ATTACK) > 0});
      if (enemyRanged) {
        if (creep.attack(enemyRanged) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(enemyRanged);
          if (creep.hits < creep.hitsMax) {
        creep.heal(creep)
      }
        }
      } else if ((enemyTower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType == STRUCTURE_TOWER}))) {
        if (creep.attack(enemyTower) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(enemyTower);
          if (creep.hits < creep.hitsMax) {
        creep.heal(creep)
      }
        }
      } else if ((enemyCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS))) {
        if (creep.attack(enemyCreep) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(enemyCreep);
          if (creep.hits < creep.hitsMax) {
        creep.heal(creep)
      }
        }
      } else if ((enemyStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType != STRUCTURE_CONTROLLER}))) {
        if (creep.attack(enemyStructure) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(enemyStructure);
          if (creep.hits < creep.hitsMax) {
        creep.heal(creep)
      }
        }
      } else if (tankFlag[0] && !creep.pos.isNearTo(tankFlag)) {
        creep.moveToModule(tankFlag[0].pos)
      } if (!enemyRanged && !enemyTower && !enemyCreep && creep.hits < creep.hitsMax) {
        creep.heal(creep)
      }
    }
  }
};

module.exports = roletank;

