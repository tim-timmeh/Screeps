const Mission = require("./Mission")

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionTower(operation, priority = 1, target = {}) { // constructor, how to build the object
  Mission.call(this, operation, 'tower', priority); // uses params to pass object through parnt operation constructor first
  this.targetAttack = target.attack;
  this.targetHeal = target.heal;
  this.targetRepair = target.repair;
  this.memoryOp = operation.flag.memory
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
  if (!this.targetAttack && this.towers[0]) {
    this.targetAttack = this.towers[0].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (!this.targetAttack && !this.targetHeal) {
      this.targetHeal = this.room.find(FIND_MY_CREEPS, {
        filter: (creep) => creep.room.name == this.room.name && creep.hits < creep.hitsMax
      });
      if (!this.targetHeal.length && !this.targetRepair && this.memoryOp.roadRepairIds && this.memoryOp.roadRepairIds.length) {
        this.memoryOp.roadRepairIds = _.shuffle(this.memoryOp.roadRepairIds);
        for (let i = this.memoryOp.roadRepairIds.length - 1; i >= 0 ; i--) {
          let targetRepair = Game.getObjectById(this.memoryOp.roadRepairIds[i]);
          //this.targetRepair = Game.getObjectById(this.memoryOp.roadRepairIds[i]);
          if (!targetRepair) {
            this.memoryOp.roadRepairIds.pop();
            continue;
          }
          let targetRepairHits = targetRepair.hitsMax - targetRepair.hits;
          if (targetRepairHits == 0 || targetRepair.hits >= 25000) {
            this.memoryOp.roadRepairIds.pop()
            continue
          }
          this.targetRepair = targetRepair;
          console.log("TEST", this.targetRepair)
          break;
        }
      }
    }
  }

};

MissionTower.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed

};

MissionTower.prototype.actionMiss = function () { // perform actions / missions
  if (this.targetAttack) {
    console.log("Enemy Found, \ud83d\udd2b " + this.targetAttack)
  }
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
  let targetRepair = this.targetRepair
  if (enemy && tower.store.energy > (tower.store.getCapacity('energy') * 0.20)) {
    if (global.debug) console.log(`Firing at Enemy ${enemy} (Tower: ${tower.id})`);
    tower.attack(enemy);
  } else if (targetsHeal.length && tower.store.energy > (tower.store.getCapacity() * 0.40)) {     // Heal creeps while above 25% energy
    if (global.debug) console.log(`Healing ${targetsHeal[0]} (Tower: ${tower.id})`);
    tower.heal(targetsHeal[0]);
  } else if (targetRepair && (this.targetRepairHits > 0) && tower.store.energy > (tower.store.getCapacity('energy') * 0.60)) { // Repair my structures while above 50% energy
    if (global.debug) console.log(`Repairing ${targetRepair} (Tower: ${tower.id})`);
    if (tower.repair(targetRepair) == OK) {
      this.targetRepairHits - 200
    }
  }
}

MissionTower.prototype.towerRepair = function () {
  if (this.memoryOp.roadRepairIds && tower.store.energy > (tower.store.getCapacity() * 0.20)) {
    
  }
}

module.exports = MissionTower;