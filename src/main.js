require('./util.require'); // load globals / prototypes
const exportStats = require('./util.stats'); // stat function
const queen = require('./queen'); // Import Functions
const myFunc = require('./util.myFunctions'); // Import Functions
const profilerBonzAI = require('./profilerBonzAI');
const profiler = require('./screeps-profiler');

//profiler.enable();

console.log(`#Global has been reset!\n#Overhead reset CPU: ${Game.cpu.getUsed().toFixed(2)} (${(Game.cpu.getUsed() / Game.cpu.limit * 100).toFixed(2) || '(sim)'}%), Memory: ${global.memorySize / 1000} KB(${(global.memorySize / 2048000 * 100).toFixed(2)}%)`);
const globalResetTick = Game.time;
global.initRoomsMem(); // Ensure constant room features of visable rooms are in memory and structured eg. Sources
global.gcOwnedStructures() // Garbage Cleanup old ownedStructures
//global.profilerGlobalReset.set() // sets profiler monitor time after global reset, default 10, change in config.

// migrate to global testing below

global.data = {};
global.data.flag = {}
global.data.king = queen.initKing();

module.exports.loop = function () {
  profiler.wrap(function () {
  //global.profilerGlobalReset.run() // runs profiler if .set > 0

  profilerBonzAI.start('pre')
  /**
   * Clear memory of old creeps.
   */
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      if (global.debug) console.log("Clearing non-existing creep memory:", name);
    }
  }
  global.excuseMe.clearNudges()
  profilerBonzAI.end('pre')

  // Init Phase
  profilerBonzAI.start('init');
  let king = global.data.king // Asigns king Object
  let operations = queen.getOperations(king) // Instantiate list of Operation Flags
  for (let operation of operations) { // Loop through all Operation Objects

    operation.init() // Instantiate all of operations missions
  }
  profilerBonzAI.end('init');

  // Rolecall Phase
  profilerBonzAI.start('roleCall');
  for (let operation of operations) { // Loop through all Operation Objects
    operation.roleCall() // Instantiate all of operations missions
  }
  profilerBonzAI.end('roleCall');

  // Action Phase
  profilerBonzAI.start('action');
  for (let operation of operations) { // Loop through all Operation Objects
    operation.action() // Instantiate all of operations missions
  }
  profilerBonzAI.end('action');

  // Finalize Phase
  profilerBonzAI.start('finalize');
  for (let operation of operations) { // Loop through all Operation Objects
    operation.finalize() // Instantiate all of operations missions
  }
  profilerBonzAI.end('finalize');

  // Post Analasis / Utility
  profilerBonzAI.start('post');
  if (Game.cpu.bucket == 10000 && Game.cpu.generatePixel) {
     Game.cpu.generatePixel();
     console.log("Generated Pixel");
  }
  exportStats(globalResetTick) // Graphina
  profilerBonzAI.end('post');
  });
};
