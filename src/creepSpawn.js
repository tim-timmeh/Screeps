'use strict'
const myFunc = require('./myFunc');
const _ = require('lodash');

const creepSpawn = function () {
  let targetsSt; // ??
  let enemyspotted; // ??
  for (let spawnName in Game.spawns) {
    let spawn = Game.spawns[spawnName];
    let spawnRoomCreeps = spawn.room.find(FIND_MY_CREEPS);
    // Create array of each creep role.
    let repairers = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "repairer");
    let upgraders = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "upgrader");
    let builders = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "builder");
    let miners = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "miner");
    let haulers = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "hauler");
    let butlers = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "butler");
    let defender = _.filter(spawnRoomCreeps, (creep) => creep.memory.role == "defender");
    let roomSources = spawn.room.find(FIND_SOURCES);
    let roomMinerals = spawn.room.find(FIND_MINERALS, {
      filter: a => a.mineralAmount > 0
    });
    let roomAllSources = roomSources//.concat(roomMinerals);
    //roomSources.push(...roomMinerals)
    if (spawn.room.find(FIND_MY_STRUCTURES, {filter: e => e.structureType == STRUCTURE_EXTRACTOR}).length) {
      roomAllSources = roomSources.concat(roomMinerals);
    }
    let newName;
    let lastContainer;
    let spawnRoomContainers = spawn.room.name;
      //console.log((spawn.room.storage.store.getFreeCapacity(RESOURCE_ENERGY)))
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

    } else if (spawn.room.energyCapacityAvailable > 800 && (miners.length < 1 || !(myFunc.isEmpty(targetsSt = spawn.room.find(FIND_MY_STRUCTURES, {
      filter: (s) => {
        return (s.structureType == STRUCTURE_STORAGE);
      }
    }))) && (miners.length < roomAllSources.length && haulers.length > 0))) {
      for (let source of roomAllSources) {
        let filteredCreep = _.filter(Game.creeps, (creep) => creep.memory.minerSource == source.id);
        if (filteredCreep.length) {
          continue;
        } else if (roomMinerals.length && source.id == roomMinerals[0].id) {
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
      for (let container of Memory.containersTest[spawnRoomContainers]) {
        if (lastContainer == container || _.filter(Game.creeps, (creep) => creep.memory.role == "hauler" && creep.memory.haulerSource == container)) {
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
      newName = "Upgrader" + Game.time + spawn.room.name;
      console.log("Upgraders: " + spawn.room.name + " - " + upgraders.length + "\nSpawning new upgrader: " + newName);
      spawn.spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, {
        memory: {
          role: "upgrader"
        }
      });
    } else if (upgraders.length < 1 || (spawn.room.storage && (spawn.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) == 0))) {
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
    if (!myFunc.isEmpty(Game.flags) && Game.flags.claimFlag) {
      let claimers = _.filter(Game.creeps, (creep) => creep.memory.role == "claimer");
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
    if (!myFunc.isEmpty(Game.flags) && Game.flags.pioneerFlag) {
      let pioneers = _.filter(Game.creeps, (creep) => creep.memory.role == "pioneer");
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
    if (!myFunc.isEmpty(Game.flags) && Game.flags.attackerFlag) {
      let attackers = _.filter(Game.creeps, (creep) => creep.memory.role == "attacker");
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
    if (!myFunc.isEmpty(Game.flags) && Game.flags.tankFlag) {
      let tanks = _.filter(Game.creeps, (creep) => creep.memory.role == "tank");
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
    if (!myFunc.isEmpty(Game.flags) && Game.flags.defenderFlag) {
      let defender = _.filter(Game.creeps, (creep) => creep.memory.role == "defender");
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
    if (!myFunc.isEmpty(Game.flags) && Game.flags.healerFlag) {
      let healer = _.filter(Game.creeps, (creep) => creep.memory.role == "healer");
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
      let spawningCreep = Game.creeps[spawn.spawning.name];
      spawn.room.visual.text("\u2692" + spawningCreep.memory.role,
      spawn.pos.x + 1,
      spawn.pos.y, {
        align: "left",
        opacity: 0.8
      });
    }
  }
};

module.exports = creepSpawn