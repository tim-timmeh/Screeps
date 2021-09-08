
require('./config'); // Custom config here
require('./globals'); // Global Variables
require('./prototypes'); // Modified Prototypes
require('./king') // king constructor
const exportStats = require('./stats'); // stat function
const queen = require('./queen'); // Import Functions
const myFunc = require('./myFunctions'); // Import Functions
const profiler = require('./screeps-profiler');

//profiler.enable();

if (global.debug) console.log(`#Global has been reset!\n#Overhead reset CPU: ${Game.cpu.getUsed().toFixed(2)} (${(Game.cpu.getUsed() / Game.cpu.limit * 100).toFixed(2) || '(sim)'}%), Memory: ${global.memorySize / 1000} KB(${(global.memorySize / 2048000 * 100).toFixed(2)}%)`);
var globalResetTick = Game.time
global.initRoomsMem(); // Ensure constant room features of visable rooms are in memory and structured eg. Sources
global.gcOwnedStructures() // Garbage Cleanup old ownedStructures
//global.profilerGlobalReset.set() // sets profiler monitor time after global reset, default 10, change in config.

module.exports.loop = function () {
  //profiler.wrap(function () {
  //global.profilerGlobalReset.run() // runs profiler if .set > 0

  /**
   * Clear memory of old creeps.
   */
  for (var name in Memory.creeps) {
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
    operation.roleCall() // Instantiate all of operations missions
  }

  // Action Phase

  for (let operation of operations) { // Loop through all Operation Objects
    operation.action() // Instantiate all of operations missions
  }

  // Finalize Phase

  for (let operation of operations) { // Loop through all Operation Objects
    operation.finalize() // Instantiate all of operations missions
  }

  // Post Analasis / Utility
  exportStats(globalResetTick) // Graphina
  //});
};
