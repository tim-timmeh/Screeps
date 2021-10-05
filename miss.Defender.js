'use strict'
const Mission = require("./Mission")

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionDefender(operation, target = {}) { // constructor, how to build the object
  Mission.call(this, operation, 'defender'); // uses params to pass object through parnt operation constructor first
  this.targetAttack = target.attack;
  this.targetHeal = target.heal;
  this.defendersReq = 0;
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionDefender.prototype = Object.create(Mission.prototype); // makes MissionDefender protos copy of Mission protos
MissionDefender.prototype.constructor = MissionDefender; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionDefender.prototype.initMiss = function () { // Initialize / build objects required
  if (!this.targetAttack) {
    let enemyCreeps = this.room.find(FIND_HOSTILE_CREEPS);
    if (enemyCreeps.length && enemyCreeps[0].owner.username != 'Invader' || this.room.controller.level < 3 || enemyCreeps.length > 1) {
      this.targetAttack = this.flag.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    }
  }
  if (this.targetAttack) {
    this.defendersReq = 1;
  }
};

MissionDefender.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed
  let body = this.getBody({ ATTACK: 1, MOVE: 1 }, { maxRatio: 5 });
  this.defenders = this.creepRoleCall('defender', body, this.defendersReq);
};

MissionDefender.prototype.actionMiss = function () { // perform actions / missions
  if (this.defenders) {
    for (let defender of this.defenders) {
      this.defenderActions(defender);
    }
  }
};

MissionDefender.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

MissionDefender.prototype.defenderActions = function (creep) {
  let defenderFlag;
  let enemyRanged;
  let enemyTower;
  let enemyCreep;
  let enemyStructure;
  creep.memory.idleCount = creep.memory.idleCount || 0;
  console.log(creep.memoy.idleCount);
  defenderFlag = _.filter(Game.flags, f => f.name == "defenderFlag");
  if (defenderFlag[0] && creep.pos.roomName != defenderFlag[0].pos.roomName) {
    creep.moveToModule(defenderFlag[0].pos);
    if (!enemyRanged && !enemyTower && creep.hits < creep.hitsMax) {
      creep.heal(creep);
    }
  } else {
    enemyRanged = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, { filter: c => c.getActiveBodyparts(RANGED_ATTACK) > 0 });
    if (enemyRanged) {
      creep.memory.idleCount = 0;
      if (creep.attack(enemyRanged) == ERR_NOT_IN_RANGE) {
        creep.moveToModule(enemyRanged);
        if (creep.hits < creep.hitsMax) {
          creep.heal(creep);
        }
      }
    } else if ((enemyTower = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: s => s.structureType == STRUCTURE_TOWER }))) {
      creep.memory.idleCount = 0;
      if (creep.attack(enemyTower) == ERR_NOT_IN_RANGE) {
        creep.moveToModule(enemyTower);
        if (creep.hits < creep.hitsMax) {
          creep.heal(creep);
        }
      }
    } else if ((enemyCreep = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS))) {
      creep.memory.idleCount = 0;
      if (creep.attack(enemyCreep) == ERR_NOT_IN_RANGE) {
        creep.moveToModule(enemyCreep);
        //if (creep.hits < creep.hitsMax) {
        //creep.heal(creep)
        //}
      }
    } else if ((enemyStructure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: s => s.structureType != STRUCTURE_CONTROLLER }))) {
      creep.memory.idleCount = 0;
      if (creep.attack(enemyStructure) == ERR_NOT_IN_RANGE) {
        creep.moveToModule(enemyStructure);
        if (creep.hits < creep.hitsMax) {
          creep.heal(creep);
        }
      }
      // @ts-ignore
    } else if (defenderFlag[0] && !creep.pos.isNearTo(defenderFlag)) {
      creep.moveToModule(defenderFlag[0].pos);
    };
    if (!enemyRanged && !enemyTower && !enemyCreep && !enemyStructure && creep.hits < creep.hitsMax) {
      creep.heal(creep);
    } else {
      creep.memory.idleCount += 1
      if (creep.memory.idleCount == 10 && this.spawnGroup.spawns[0].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
        creep.moveToModule(this.spawnGroup.spawns[0]);
      }
    }
  }
}

module.exports = MissionDefender;