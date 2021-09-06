'use strict';
// Globals not related to specific objects

global.test1 = 'this is global.test1'; // Test global that works

global.memorySize = RawMemory.get().length; // size of memory in bytes

global.initRoomsMem = function() { // Ensure const room features of visable rooms are in mem eg. Sources
  //if (global.debug) console.log('#Checking For Missing Visable Room Memory...');
  for (let visableRoomName in Game.rooms){ //Iterate over all visable rooms
    Game.rooms[visableRoomName].sources;//Get stored room sources, Set if none stored via Room Prototype
  }
  //if (global.debug) console.log('#Visable Room Memory Check Complete.')
}

global.gcOwnedStructures = function() {
  for (let room in Memory.rooms) {
    for (let ownedStructure in Memory.rooms[room].ownedStructures) {
      if (!Game.structures[ownedStructure]) {
        if (global.debug) {
          console.log(`  #Garbage collecting from ${room} structure ${ownedStructure} as? ${JSON.stringify(Memory.rooms[room].ownedStructures[ownedStructure])}`);
        }
        delete Memory.rooms[room].ownedStructures[ownedStructure];
      }
    }
  }
}

global.hasRespawned = function hasRespawned(){ // check to see if you have just respawned. Needs fix.
  if(Memory.respawnTick && Memory.respawnTick === Game.time) { // check for multiple calls on same tick
    return true;
  }
  if(Game.time === 0) {  // server reset or sim
    Memory.respawnTick = Game.time;
    return true;
  }
  for(const creepName in Game.creeps) {  // check for 0 creeps
    return false;
  }
  const rNames = Object.keys(Game.rooms);
  if(rNames.length !== 1) {  // check for only 1 room
    return false;
  }
  const room = Game.rooms[rNames[0]];
  if(!room.controller || !room.controller.my || room.controller.level !== 1 || room.controller.progress || !room.controller.safeMode || room.controller.safeMode <= SAFE_MODE_DURATION-1) {// check for controller, progress and safe mode
    //if (global.debug) console.log('this is always false for some reason. need to fix');
    return false;
  }
  if(Object.keys(Game.spawns).length !== 1) {// check for 1 spawn
    return false;
  }
  Memory.respawnTick = Game.time;  // if all cases point to a respawn, you've respawned
  return true;
}

global.respawn = function() { // resets flags and memory
  for (let f in Game.flags) {
    Game.flags[f].remove();
  }
  //Memory = {}; // cant re-assign constant
  for (let member in Memory) delete Memory[member];
  RawMemory.set("");
};

global.profilerGlobalReset = {
  set : function() {
    if(global.debug){if(global.profilerGlobalResetSetTicks === undefined)global.profilerGlobalResetSetTicks = 10;
      global.profilerGlobalResetSetTicks ? console.log(`#Activating profiler for ${global.profilerGlobalResetSetTicks} ticks`):'';  // Set profiler to be run
    }
  },

  run : function() {
    if(global.debug && global.profilerGlobalResetSetTicks) { // Run profiler
      Game.profiler.profile(global.profilerGlobalResetSetTicks);
      global.profilerGlobalResetSetTicks = 0;
    }
  }
}

/**
* Posted 13 January 2018 by @knightshade
*/
Object.defineProperty(global, '__stack', {
  get: function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){
      return stack;
    };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function() {
    return __stack[1].getLineNumber();
  }
});

Object.defineProperty(global, '__function', {
  get: function() {
    return __stack[1].getFunctionName();
  }
});

Object.defineProperty(global, '__file', {
  get: function() {
    return __stack[1].getFileName();
  }
});
