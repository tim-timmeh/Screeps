'use strict'

var missHarvester = require("miss.harvester");
var missUpgrader = require("miss.upgrader");
var missBuilder = require("miss.builder");
var missRepairer = require("miss.repairer");
var missMiner = require("miss.miner");
var missHauler = require("miss.hauler");
var missButler = require("miss.butler");
var missClaimer = require("miss.claimer");
var missPioneer = require("miss.pioneer");
var missAttacker = require("miss.attacker");
var missTank = require("miss.tank");
var missDefender = require("miss.defender");
var missHealer = require("miss.healer");

function creepAI() {
  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if (creep.memory.miss == "butler") {
      missButler.run(creep);
      continue;
    }
    if (creep.memory.miss == "upgrader") {
      missUpgrader.run(creep);
      continue;
    }
    if (creep.memory.miss == "builder") {
      missBuilder.run(creep);
      continue;
    }
    if (creep.memory.miss == "repairer") {
      missRepairer.run(creep);
      continue;
    }
    if (creep.memory.miss == "miner") {
      missMiner.run(creep);
      continue;
    }
    if (creep.memory.miss == "hauler") {
      missHauler.run(creep);
      continue;
    }
    if (creep.memory.miss == "claimer") {
      missClaimer.run(creep);
      continue;
    }
    if (creep.memory.miss == "pioneer") {
      missPioneer.run(creep);
      continue;
    }
    if (creep.memory.miss == "attacker") {
      missAttacker.run(creep);
      continue;
    }
    if (creep.memory.miss == "tank") {
      missTank.run(creep);
      continue;
    }
    if (creep.memory.miss == "defender") {
      missDefender.run(creep);
      continue;
    }
    if (creep.memory.miss == "healer") {
      missHealer.run(creep);
      continue;
    }
  }
}
module.exports = creepAI;
