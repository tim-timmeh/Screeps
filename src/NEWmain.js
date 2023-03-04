'use strict';
// Requires
const { printTest, printHello } = require("./functions");



// Pre-Init
global.tickLimit = Game.cpu.limit; //? Adjust to include Sigmoid function of bucket %
global.load = Math.round(Game.cpu.getUsed());

global.king = {
  stats: {},
  main: {},
};

global.roles = {};

//? Init heap data
global.data = global.data || {};
global.data.creeps = global.data.creeps || {};
global.data.rooms = global.data.rooms || {};
global.data.stats = global.data.stats || {
  cpuIdle: 0,
  memoryFree: 0,
  heapFree: 0,
};

console.log(`#Global has been reset!\n#Overhead reset CPU: ${Game.cpu.getUsed().toFixed(2)} (${(Game.cpu.getUsed() / Game.cpu.limit * 100).toFixed(2) || '(sim)'}%), Memory: ${global.memorySize / 1000} KB(${(global.memorySize / 2048000 * 100).toFixed(2)}%)`); //? Add bucket to print

module.exports.loop = function(){
  printTest("arg")

  king.queen.execute()


  //? main loop

  //? Pixels

  //? Update Stats
}

king.queen.execute = function() {
  king.queen.roomExecution();
}

king.queen.roomExecution = function() {
  Memory.myRooms = _(Game.rooms).filter((r) => r.execute()).map((r) => r.name).value();
};