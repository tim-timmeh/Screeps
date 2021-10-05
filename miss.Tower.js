'use strict'
const Mission = require("./Mission")

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionTower(operation, target = {}) { // constructor, how to build the object
  Mission.call(this, operation, 'tower'); // uses params to pass object through parnt operation constructor first
  this.targetAttack = target.attack;
  this.targetHeal = target.heal;
  this.targetRepair = target.repair;
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionTower.prototype = Object.create(Mission.prototype); // makes MissionTower protos copy of Mission protos
MissionTower.prototype.constructor = MissionTower; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionTower.prototype.initMiss = function () { // Initialize / build objects required
  this.towers = this.room.find(FIND_MY_STRUCTURES, {
    filter: {
      structureType: STRUCTURE_TOWER
    }
  });
  if (!this.targetAttack) {
    this.targetAttack = this.towers[0].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (!this.targetAttack && !this.targetHeal) {
      this.targetHeal = this.room.find(FIND_MY_CREEPS, {
        filter: (creep) => creep.room.name == this.room.name && creep.hits < creep.hitsMax
      });
      if (!this.targetHeal && !this.targetRepair) {
        //Implement repair targeting here? 
        //this.targetRepair = tower.room.find(FIND_MY_STRUCTURES, { filter: (hp) => hp.hits < (hp.hitsMax - 800) && hp.hits < 200000 });
        //this.targetRepair.sort((a, b) => a.hits - b.hits);
      }
    }
  }

};

MissionTower.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed

};

MissionTower.prototype.actionMiss = function () { // perform actions / missions
  for (let tower of this.towers) {
    this.towerActions(tower);
  }
};

MissionTower.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

MissionTower.prototype.towerActions = function (tower) {
  let enemy = this.targetAttack;
  let targetsHeal = this.targetHeal;
  //let targetRepair = this.targetRepair
  //console.log(tower.store.energy + " " + tower.store.getCapacity())
  if (enemy && tower.store.energy > (tower.store.getCapacity() * 0.20)) {
    console.log("Enemy Found, \ud83d\udd2b Attacking " + enemy);
    tower.attack(enemy);
  } else if (targetsHeal && tower.store.energy > (tower.store.getCapacity() * 0.40)) {     // Heal creeps while above 25% energy
    tower.heal(targetsHeal[0]);
  }
  /*else if (targetsRepair != "" && targetsRepair[0].hits < 100000 && tower.store.energy > (tower.store.getCapacity * 0.60)) { // Repair my structures while above 50% energy
    tower.repair(targetsRepair[0]);
  }*/
}

module.exports = MissionTower;