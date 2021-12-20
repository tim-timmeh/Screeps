"use strict";
const _ = require('lodash');

const roleTower = {

  run: function (tower) {
    let enemy = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    let targetsMyRepair = tower.room.find(FIND_MY_STRUCTURES, { filter: (hp) => hp.hits < (hp.hitsMax - 800) && hp.hits < 200000 });
    //--let targetsRepair = tower.pos.findClosestByPath(FIND_STRUCTURES, {filter : (hp) => hp.hits < hp.hitsMax})
    // get all damaged structures and list from lowest hits
    let targetsRepair = tower.room.find(FIND_STRUCTURES, { filter: (hp) => hp.hits < (hp.hitsMax - 800) && hp.hits < 200000 });
    let targetsCreepRepair = _.filter(Game.creeps, (creep) => creep.hits < creep.hitsMax);
    targetsRepair.sort((a, b) => a.hits - b.hits);
    targetsMyRepair.sort((a, b) => a.hits - b.hits);
    if (enemy) {
      console.log("Enemy Found, \ud83d\udd2b Attacking " + enemy);
      tower.attack(enemy);
      // Heal creeps while above 25% energy
    } else if (targetsCreepRepair && tower.energy > (tower.energyCapacity * 0.25)) {
      tower.heal(targetsCreepRepair[0]);
      // Repair my structures while above 50% energy
    } else if (targetsMyRepair != "" && targetsMyRepair[0].hits < 100000 && tower.energy > (tower.energyCapacity * 0.5)) {
      tower.repair(targetsMyRepair[0]);
    } else if (targetsRepair && tower.energy > (tower.energyCapacity * 0.75)) {
      tower.repair(targetsRepair[0]);
    }
  }
};

module.exports = roleTower;
