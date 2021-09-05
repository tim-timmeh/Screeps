'use strict';
const rolesMy = require('./rolesMy');

const creepRun = function () {
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    //let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if (creep.memory.role == "butler") {
      rolesMy.butler.run(creep);
      continue;
    }
    if (creep.memory.role == "upgrader") {
      rolesMy.upgrader.run(creep);
      continue;
    }
    if (creep.memory.role == "builder") {
      rolesMy.builder.run(creep);
      continue;
    }
    if (creep.memory.role == "repairer") {
      rolesMy.repairer.run(creep);
      continue;
    }
    if (creep.memory.role == "miner") {
      rolesMy.miner.run(creep);
      continue;
    }
    if (creep.memory.role == "hauler") {
      rolesMy.hauler.run(creep);
      continue;
    }
    if (creep.memory.role == "claimer") {
      rolesMy.claimer.run(creep);
      continue;
    }
    if (creep.memory.role == "pioneer") {
      rolesMy.pioneer.run(creep);
      continue;
    }
    if (creep.memory.role == "attacker") {
      rolesMy.attacker.run(creep);
      continue;
    }
    if (creep.memory.role == "tank") {
      rolesMy.tank.run(creep);
      continue;
    }
    if (creep.memory.role == "defender") {
      rolesMy.defender.run(creep);
      continue;
    }
    if (creep.memory.role == "healer") {
      rolesMy.healer.run(creep);
      continue;
    }
  }
};

module.exports = creepRun;