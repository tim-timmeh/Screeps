'use strict'
const myFunc = require('myfunctions'); // Adds random global functions to myFunc variable

function spawner() { // Spawn logic for Base flagged rooms.
  let bases = _.filter(Game.flags, (flag) => flag.color == COLOR_GREEN && flag.secondaryColor == COLOR_GREEN);
  for (let base of bases){ // Run spawn code on base flagged rooms
    let baseSpawns = _.filter(Game.spawns, (spawn) => spawn.room == base.room);
    for (let spawnName of baseSpawns) { // Run spawn code on spawns in base flagged rooms
      var spawn = Game.spawns[spawnName];
      var spawnRoomCreeps = spawn.room.find(FIND_MY_CREEPS);
      // Create array of each creep miss.
      var harvesters = _.filter(spawnRoomCreeps, (creep) => creep.memory.miss == "harvester");
      var repairers = _.filter(spawnRoomCreeps, (creep) => creep.memory.miss == "repairer");
      var upgraders = _.filter(spawnRoomCreeps, (creep) => creep.memory.miss == "upgrader");
      var builders = _.filter(spawnRoomCreeps, (creep) => creep.memory.miss == "builder");
      var miners = _.filter(spawnRoomCreeps, (creep) => creep.memory.miss == "miner");
      var haulers = _.filter(spawnRoomCreeps, (creep) => creep.memory.miss == "hauler");
      var butlers = _.filter(spawnRoomCreeps, (creep) => creep.memory.miss == "butler");
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


      // Check miss array, spawn if below specified count.
      if (butlers.length == 0) {
        newName = "Butler" + Game.time + spawn.room.name;
        console.log("Butlers: " + spawn.room.name + " - " + butlers.length + "\nSpawning new butler: " + newName);
        spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
          memory: {
            miss: "butler"
          }
        });

      } else if (spawn.room.energyCapacityAvailable > 800 && (miners.length < 1 || (miners.length < roomAllSources.length && haulers.length > 0))) {
        for (var source of roomAllSources) {
          let filteredCreep = _.filter(Game.creeps, (creep) => creep.memory.minerSource == source.id);
          if (filteredCreep != "") {
            continue;
          } else if (roomMinerals != "" && source.id == roomMinerals[0].id) {
            newName = "Mineral Miner" + Game.time + spawn.room.name;
            console.log("This source has no creep: " + spawn.room.name + " - " + source + "\nSpawning new mineral miner: " + newName);
            spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {
              memory: {
                miss: "miner",
                minerSource: source.id
              }
            });
            break;
          } else {
            newName = "Miner" + Game.time + spawn.room.name;
            console.log("This source has no creep: " + spawn.room.name + " - " + source + "\nSpawning new miner: " + newName);
            spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], newName, {
              memory: {
                miss: "miner",
                minerSource: source.id
              }
            });
            break;
          }
        }
      } else if (spawn.room.energyCapacityAvailable > 800 && (Memory.containersTest[spawnRoomContainers] && haulers.length < Memory.containersTest[spawnRoomContainers].length)) {
        for (var container of Memory.containersTest[spawnRoomContainers]) {
          if (lastContainer == container || _.filter(Game.creeps, (creep) => creep.memory.miss == "hauler" && creep.memory.haulerSource == container) == "") {
            newName = "Hauler" + Game.time + spawn.room.name;
            console.log("Haulers: " + spawn.room.name + " - " + haulers.length + "\nSpawning new hauler: " + newName + "\nFor container : " + container);
            spawn.spawnCreep([WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, {
              memory: {
                miss: "hauler",
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
      } else if (upgraders.length < 1) {
        newName = "Upgrader" + Game.time + spawn.room.name;
        console.log("Upgraders: " + spawn.room.name + " - " + upgraders.length + "\nSpawning new upgrader: " + newName);
        spawn.spawnCreep([WORK, WORK, CARRY, MOVE], newName, {
          memory: {
            miss: "upgrader"
          }
        });
      } else if (repairers.length < 1) {
        if (spawn.room.energyCapacityAvailable <= 300) {
          newName = "Repairer" + Game.time + spawn.room.name;
          console.log("repairer: " + spawn.room.name + " - " + repairers.length + "\nSpawning new repairer: " + newName);
          spawn.spawnCreep([WORK, WORK, CARRY, MOVE], newName, {
            memory: {
              miss: "repairer"
            }
          });
        } else {
          newName = "Repairer" + Game.time + spawn.room.name;
          console.log("repairer: " + spawn.room.name + " - " + repairers.length + "\nSpawning new repairer: " + newName);
          spawn.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, {
            memory: {
              miss: "repairer"
            }
          });
        }
      } else if (spawn.room.energyCapacityAvailable > 800 && (builders.length < 1 || (builders.length <= spawn.room.find(FIND_CONSTRUCTION_SITES).length / 10))) {
        newName = "Builder" + Game.time + spawn.room.name;
        console.log("Builders: " + spawn.room.name + " - " + builders.length + "\nSpawning new builder: " + newName);
        spawn.spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName, {
          memory: {
            miss: "builder"
          }
        });
      }

      // Check for claimer flag
      if (!myFunc.isEmpty(Game.flags) && Game.flags.claimFlag) {
        var claimers = _.filter(Game.creeps, (creep) => creep.memory.miss == "claimer");
        if (claimers.length == 0) {
          newName = "Claimer" + Game.time + spawn.room.name;
          console.log("Spawning new claimer: " + newName);
          spawn.spawnCreep([CLAIM, MOVE], newName, {
            memory: {
              miss: "claimer"
            }
          });
        }
      }

      // Check for pioneer flag
      if (!myFunc.isEmpty(Game.flags) && Game.flags.pioneerFlag) {
        var pioneers = _.filter(Game.creeps, (creep) => creep.memory.miss == "pioneer");
        if (pioneers.length < 3) {
          newName = "Pioneer" + Game.time + spawn.room.name;
          console.log("Spawning new pioneer: " + newName);
          spawn.spawnCreep([WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE], newName, {
            memory: {
              miss: "pioneer"
            }
          });
        }
      }

      // Check for attacker flag
      if (!myFunc.isEmpty(Game.flags) && Game.flags.attackerFlag) {
        var attackers = _.filter(Game.creeps, (creep) => creep.memory.miss == "attacker");
        if (attackers.length < 1) {
          newName = "Attacker" + Game.time + spawn.room.name;
          console.log("Spawning new attacker: " + newName);
          spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            //spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            memory: {
              miss: "attacker"
            }
          });
        }
      }

      // Check tank flag
      if (!myFunc.isEmpty(Game.flags) && Game.flags.tankFlag) {
        var tanks = _.filter(Game.creeps, (creep) => creep.memory.miss == "tank");
        if (tanks.length < 1) {
          newName = "Tank" + Game.time + spawn.room.name;
          console.log("Spawning new Tank: " + newName);
          //spawn.spawnCreep([MOVE], newName, {
          spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            //spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            //spawn.spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK], newName, {
            memory: {
              miss: "tank"
            }
          });
        }
      }
      // Check defender flag
      if (!myFunc.isEmpty(Game.flags) && Game.flags.defenderFlag) {
        var defender = _.filter(Game.creeps, (creep) => creep.memory.miss == "defender");
        if (defender.length < 1) {
          newName = "Defender" + Game.time + spawn.room.name;
          console.log("Spawning new Defender: " + newName);
          //spawn.spawnCreep([MOVE], newName, {
          spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            //spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, HEAL], newName, {
            //spawn.spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK], newName, {
            memory: {
              miss: "defender"
            }
          });
        }
      }
      // Check for healer flag
      if (!myFunc.isEmpty(Game.flags) && Game.flags.healerFlag) {
        var healer = _.filter(Game.creeps, (creep) => creep.memory.miss == "healer");
        if (healer.length < 3) {
          newName = "Healer" + Game.time + spawn.room.name;
          console.log("Spawning new Healer: " + newName);
          spawn.spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE], newName, {
            memory: {
              miss: "healer"
            }
          });
        }
      }
      //Spawning dialog.
      if (spawn.spawning) {
        var spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
          "\u2692" + spawningCreep.memory.miss,
          spawn.pos.x + 1,
          spawn.pos.y, {
            align: "left",
            opacity: 0.8
          });
        }
      }
    }
  }
  module.exports = spawner;
