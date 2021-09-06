"use strict";
require('config'); // Custom config here
require('globals'); // Global Variables
require('prototypes'); // Modified Prototypes
require('King') // king constructor
var exportStats = require('stats'); // stat function
var queen = require('queen'); // Import Functions
var myFunc = require('myfunctions'); // Import Functions
var spawner = require('spawner'); // spawner logic
var creepAI = require('creepAI'); // creep logic
var towerAI = require('towerAI'); // tower logic
const profiler = require('screeps-profiler');

profiler.enable();

if(global.debug)console.log(`#Global has been reset!\n#Overhead reset CPU: ${Game.cpu.getUsed().toFixed(2)} (${(Game.cpu.getUsed()/Game.cpu.limit*100).toFixed(2) || '(sim)'}%), Memory: ${global.memorySize/1000} KB(${(global.memorySize/2048000*100).toFixed(2)}%)`);
var globalResetTick = Game.time
global.initRoomsMem(); // Ensure constant room features of visable rooms are in memory and structured eg. Sources
global.gcOwnedStructures() // Garbage Cleanup old ownedStructures
global.profilerGlobalReset.set() // sets profiler monitor time after global reset, default 10, change in config.

module.exports.loop = function () {
  profiler.wrap(function () {
    global.profilerGlobalReset.run() // runs profiler if .set > 0

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


    for (var name in Memory.creeps) { // Clear memory of old creeps.
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log("Clearing non-existing creep memory: ", name);
      }
    }

    // Init Phase
    let king = queen.initKing() // Creates king Object
    let operations = queen.getOperations(king) // Instantiate list of Operation Flags
    for (let operation of operations) { // Loop through all Operation Objects
      operation.init() // Instantiate all of operations missions
    }
    // Rolecall Phase
    for (let operation of operations) { // Loop through all Operation Objects
      operation.rolecall() // Instantiate all of operations missions
    }
    // Action Phase
    for (let operation of operations) { // Loop through all Operation Objects
      operation.action() // Instantiate all of operations missions
    }
    // Finalize Phase
    for (let operation of operations) { // Loop through all Operation Objects
      operation.finalize() // Instantiate all of operations missions
    }
    spawner(); // Spawner Logic

    creepAI(); // Creep Logic

    towerAI(); // Tower Logic

    // Post Analasis / Utility
    exportStats(globalResetTick) // Graphina
  });
};
