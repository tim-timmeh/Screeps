"use strict";
var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");
var roleBuilder = require("role.builder");
var roleRepairer = require("role.repairer");
var roleTower = require("role.tower");
var roleMiner = require("role.miner");
var roleHauler = require("role.hauler");
var roleButler = require("role.butler");
var roleClaimer = require("role.claimer");
var rolePioneer = require("role.pioneer");
var roleAttacker = require("role.attacker");
var roleTank = require("role.tank");
var roleDefender = require("role.defender");
var roleHealer = require("role.healer");
var exportStats = require('stats');
let enemyspotted;
let globalResetTick = Game.time;


// Is obj empty?
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}
const profiler = require('screeps-profiler');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
  profiler.wrap(function () {

    /*TODO*
    ***claimer to change signs
    ** Research Overmind.

    *** Check if MemoryPathing broke resource pickup from ground
    *** Wipe old containers from memory if they die.
    *** Check how miners are spawned and not limited by haulers as when starting miners will be more (building containers for hauler spawn)
    *** If get stuck do normal move
    ** Creeps get from storage > container > source
    ** Dynamic creep size spawning
    ** Miners to place/build container and add id to memory. (Needs work part)
    ** Upgrader if storage.rangeTo(Upgrader) > 4 then Build Link (Or spawn with MOVE/CARRY parts? untill link?)
    ** Haulers to build Roads
    * while above ~50% storage spawn super || multiple upgraders?
    * find resource(not in mem), add to mem, if hauler.xy close to mem.xy & !carryCapacity, pickup, continue
    * breakup main into different modules (spawner etc)
    * Optimise vars to .deserialize from memory if possible, if not do find then .serialize to memory.
    * .serializePath && .deserializePath - if memory false -> Do findClosestByPath -> serialize to memory ->
    creep.move via memory -> at error || end = clear memory
    */

    // Clear memory of old creeps.
    for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log("Clearing non-existing creep memory: ", name);
      }
    }
    let targetsSt = undefined;
    // Multi room - run code on each room
    for (var spawnName in Game.spawns) {
      var spawn = Game.spawns[spawnName];
      var spawnRoomCreeps = spawn.room.find(FIND_MY_CREEPS);
      // Create array of each creep role.
      var harvesters = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "harvester");
      var repairers = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "repairer");
      var upgraders = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "upgrader");
      var builders = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "builder");
      var miners = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "miner");
      var haulers = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "hauler");
      var butlers = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "butler");
      var defender = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "defender");
      var roomSources = spawn.room.find(FIND_SOURCES);
      var roomMinerals = spawn.room.find(FIND_MINERALS, {
        filter: a => a.mineralAmount > 0
      });
      var roomAllSources = roomSources//.concat(roomMinerals);
      //roomSources.push(...roomMinerals)
      if (spawn.room.find(FIND_MY_STRUCTURES, {filter: e => e.structureType == STRUCTURE_EXTRACTOR}) != "") {
        roomAllSources = roomSources.concat(roomMinerals);
      }
      var newName;
      var lastContainer;
      var spawnRoomContainers = spawn.room.name;


      // Check role array, spawn if below specified count.
      if (butlers.length < 2) {
        newName = "Butler" + Game.time + spawn.room.name;
        console.log("Butlers: " + spawn.room.name + " - " + butlers.length + "\nSpawning new butler: " + newName);
        spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
          memory: {
            role: "butler"
          }
        });

      } else if ((enemyspotted = spawn.room.find(FIND_HOSTILE_CREEPS)).length > 0 && defender.length < 1){
        console.log('ENEMYS FOUND' + enemyspotted.length);
        if (enemyspotted[0].owner.username != 'Invader' || spawn.room.controller.level <= 2 || enemyspotted.length >=2) {

          if (spawn.room.energyCapacityAvailable < 520) {
            console.log('Requires Defender!');
            newName = "Defender" + Game.time + spawn.room.name;
            console.log("Spawning new Defender: " + newName);
            spawn.spawnCreep([MOVE, ATTACK, MOVE, ATTACK], newName, {
              //spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
              memory: {
                role: "defender"
              }
            });
          } else {
            console.log('Requires Defender!');
            newName = "Defender" + Game.time + spawn.room.name;
            console.log("Spawning new Defender: " + newName);
            spawn.spawnCreep([MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK], newName, {
              //spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
              memory: {
                role: "defender"
              }
            });
          }
        }

      } else if (spawn.room.energyCapacityAvailable > 800 && (miners.length < 1 || !(isEmpty(targetsSt = spawn.room.find(FIND_MY_STRUCTURES, {
        filter: (s) => {
          return (s.structureType == STRUCTURE_STORAGE);
        }
      }))) && (miners.length < roomAllSources.length && haulers.length > 0))) {
        for (var source of roomAllSources) {
          let filteredCreep = _.filter(Game.creeps, (creep) => creep.memory.minerSource == source.id);
          if (filteredCreep != "") {
            continue;
          } else if (roomMinerals != "" && source.id == roomMinerals[0].id) {
            newName = "Mineral Miner" + Game.time + spawn.room.name;
            console.log("This source has no creep: " + spawn.room.name + " - " + source + "\nSpawning new mineral miner: " + newName);
            spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {
              memory: {
                role: "miner",
                minerSource: source.id
              }
            });
            break;
          } else {
            newName = "Miner" + Game.time + spawn.room.name;
            console.log("This source has no creep: " + spawn.room.name + " - " + source + "\nSpawning new miner: " + newName);
            spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], newName, {
              memory: {
                role: "miner",
                minerSource: source.id
              }
            });
            break;
          }
        }
      } else if (spawn.room.energyCapacityAvailable > 800 && (Memory.containersTest[spawnRoomContainers] && haulers.length < Memory.containersTest[spawnRoomContainers].length)) {
        for (var container of Memory.containersTest[spawnRoomContainers]) {
          if (lastContainer == container || _.filter(Game.creeps, (creep) => creep.memory.role == "hauler" && creep.memory.haulerSource == container) == "") {
            newName = "Hauler" + Game.time + spawn.room.name;
            console.log("Haulers: " + spawn.room.name + " - " + haulers.length + "\nSpawning new hauler: " + newName + "\nFor container : " + container);
            spawn.spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], newName, {
              memory: {
                role: "hauler",
                haulerSource: container
              }
            });
            lastContainer = container;
            break;
          } else {
            lastContainer = container;
            continue;
          }
          //lastContainer = container
        }
      } else if (upgraders.length < 1 && spawn.room.energyCapacityAvailable < 500) {
        newName = "Upgrader" + Game.time + spawn.room.name;
        console.log("Upgraders: " + spawn.room.name + " - " + upgraders.length + "\nSpawning new upgrader: " + newName);
        spawn.spawnCreep([ WORK, CARRY, MOVE], newName, {
          memory: {
            role: "upgrader"
          }
        });
      } else if (upgraders.length < 1 && spawn.room.energyCapacityAvailable <= 800) {
          console.log(spawn.room.energyCapacityAvailable);
        newName = "Upgrader" + Game.time + spawn.room.name;
        console.log("Upgraders: " + spawn.room.name + " - " + upgraders.length + "\nSpawning new upgrader: " + newName);
        spawn.spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, {
          memory: {
            role: "upgrader"
          }
        });
      } else if (upgraders.length < 1) {
        newName = "Upgrader" + Game.time + spawn.room.name;
        console.log("Upgraders: " + spawn.room.name + " - " + upgraders.length + "\nSpawning new upgrader: " + newName);
        spawn.spawnCreep([ WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE,], newName, {
          memory: {
            role: "upgrader"
          }
        });
      } else if (repairers.length < 1 || (repairers.length < 4 && spawn.room.energyCapacityAvailable <= 800)) {
        if (spawn.room.energyCapacityAvailable < 500) {
          newName = "Repairer" + Game.time + spawn.room.name;
          console.log("repairer: " + spawn.room.name + " - " + repairers.length + "\nSpawning new repairer: " + newName);
          spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
            memory: {
              role: "repairer"
            }
          });
        } else if (spawn.room.energyCapacityAvailable < 800){
          newName = "Repairer" + Game.time + spawn.room.name;
          console.log("repairer: " + spawn.room.name + " - " + repairers.length + "\nSpawning new repairer: " + newName);
          spawn.spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, {
            memory: {
              role: "repairer"
            }
          });
        } else if (repairers.length < 1){
          newName = "Repairer" + Game.time + spawn.room.name;
          console.log("repairer: " + spawn.room.name + " - " + repairers.length + "\nSpawning new repairer: " + newName);
          spawn.spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName, {
            memory: {
              role: "repairer"
            }
          });
        }
      } else if (spawn.room.energyCapacityAvailable > 800 && (builders.length < 1 || (builders.length <= spawn.room.find(FIND_CONSTRUCTION_SITES).length / 10))) {
        newName = "Builder" + Game.time + spawn.room.name;
        console.log("Builders: " + spawn.room.name + " - " + builders.length + "\nSpawning new builder: " + newName);
        spawn.spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName, {
          memory: {
            role: "builder"
          }
        });
      }

      // Check for claimer flag
      if (!isEmpty(Game.flags) && Game.flags.claimFlag) {
        var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == "claimer");
        if (claimers.length == 0) {
          newName = "Claimer" + Game.time + spawn.room.name;
          console.log("Spawning new claimer: " + newName);
          spawn.spawnCreep([CLAIM, MOVE], newName, {
            memory: {
              role: "claimer"
            }
          });
        }
      }

      // Check for pioneer flag
      if (!isEmpty(Game.flags) && Game.flags.pioneerFlag) {
        var pioneers = _.filter(Game.creeps, (creep) => creep.memory.role == "pioneer");
        if (pioneers.length < 2) {
          newName = "Pioneer" + Game.time + spawn.room.name;
          console.log("Spawning new pioneer: " + newName);
          spawn.spawnCreep([MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE], newName, {
            memory: {
              role: "pioneer"
            }
          });
        }
      }

      // Check for attacker flag
      if (!isEmpty(Game.flags) && Game.flags.attackerFlag) {
        var attackers = _.filter(Game.creeps, (creep) => creep.memory.role == "attacker");
        if (attackers.length < 1) {
          newName = "Attacker" + Game.time + spawn.room.name;
          console.log("Spawning new attacker: " + newName);
          spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            //spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            memory: {
              role: "attacker"
            }
          });
        }
      }

      // Check tank flag
      if (!isEmpty(Game.flags) && Game.flags.tankFlag) {
        var tanks = _.filter(Game.creeps, (creep) => creep.memory.role == "tank");
        if (tanks.length < 1) {
          newName = "Tank" + Game.time + spawn.room.name;
          console.log("Spawning new Tank: " + newName);
          //spawn.spawnCreep([MOVE], newName, {
          spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            //spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            //spawn.spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK], newName, {
            memory: {
              role: "tank"
            }
          });
        }
      }
      // Check defender flag
      if (!isEmpty(Game.flags) && Game.flags.defenderFlag) {
        var defender = _.filter(Game.creeps, (creep) => creep.memory.role == "defender");
        if (defender.length < 1) {
          newName = "Defender" + Game.time + spawn.room.name;
          console.log("Spawning new Defender: " + newName);
          //spawn.spawnCreep([MOVE], newName, {
          spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            //spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            //spawn.spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK], newName, {
            memory: {
              role: "defender"
            }
          });
        }
      }
      // Check for healer flag
      if (!isEmpty(Game.flags) && Game.flags.healerFlag) {
        var healer = _.filter(Game.creeps, (creep) => creep.memory.role == "healer");
        if (healer.length < 3) {
          newName = "Healer" + Game.time + spawn.room.name;
          console.log("Spawning new Healer: " + newName);
          spawn.spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE], newName, {
            memory: {
              role: "healer"
            }
          });
        }
      }
      //Spawning dialog.
      if (spawn.spawning) {
        var spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
          "\u2692" + spawningCreep.memory.role,
          spawn.pos.x + 1,
          spawn.pos.y, {
            align: "left",
            opacity: 0.8
          });
        }
      }

      // Creep AI
      for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (creep.memory.role == "butler") {
          roleButler.run(creep);
          continue;
        }
        if (creep.memory.role == "upgrader") {
          roleUpgrader.run(creep);
          continue;
        }
        if (creep.memory.role == "builder") {
          roleBuilder.run(creep);
          continue;
        }
        if (creep.memory.role == "repairer") {
          roleRepairer.run(creep);
          continue;
        }
        if (creep.memory.role == "miner") {
          roleMiner.run(creep);
          continue;
        }
        if (creep.memory.role == "hauler") {
          roleHauler.run(creep);
          continue;
        }
        if (creep.memory.role == "claimer") {
          roleClaimer.run(creep);
          continue;
        }
        if (creep.memory.role == "pioneer") {
          rolePioneer.run(creep);
          continue;
        }
        if (creep.memory.role == "attacker") {
          roleAttacker.run(creep);
          continue;
        }
        if (creep.memory.role == "tank") {
          roleTank.run(creep);
          continue;
        }
        if (creep.memory.role == "defender") {
          roleDefender.run(creep);
          continue;
        }
        if (creep.memory.role == "healer") {
          roleHealer.run(creep);
          continue;
        }
      }

      // Tower AI
      var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
      for (var tower of towers) {
        roleTower.run(tower);
      }
      exportStats(globalResetTick)
    });
  };
