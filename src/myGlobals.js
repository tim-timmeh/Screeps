'use strict'
import './config';

/**
 * global.hasRespawned(), returns boolean whether this is the first tick after a respawn or not
 * @author:  SemperRabbit
 * @version: 1.1
 * @date:    180331
 * @return:  boolean whether this is the first tick after a respawn or not
 * The checks are set as early returns in case of failure, and are ordered
 * from the least CPU intensive checks to the most. The checks are as follows:
 *
 *      If it has returned true previously during this tick, return true again
 *      Check Game.time === 0 (returns true for sim room "respawns")
 *      There are no creeps
 *      There is only 1 room in Game.rooms
 *      The 1 room has a controller
 *      The controller is RCL 1 with no progress
 *      The controller is in safemode with the initial value
 *      There is only 1 StructureSpawn
 *
 * The only time that all of these cases are true, is the first tick of a respawn.
 * If all of these are true, you have respawned.
 *
 * v1.1 (by qnz): - fixed a condition where room.controller.safeMode can be SAFE_MODE_DURATION too
 *                - improved performance of creep number check (https://jsperf.com/isempty-vs-isemptyobject/23)
 */
global.hasRespawned = function () {
    if(Memory.respawnTick && Memory.respawnTick === Game.time) {    // check for multiple calls on same tick
        return true;
    }
    if(Game.time === 0) {   // server reset or sim
        Memory.respawnTick = Game.time;
        return true;
    }
    for(const creepName in Game.creeps) {    // check for 0 creeps
        return false;
    }
    const rNames = Object.keys(Game.rooms);    // check for only 1 room
    if(rNames.length !== 1) {
        return false;
    }
    const room = Game.rooms[rNames[0]];    // check for controller, progress and safe mode
    if(!room.controller || !room.controller.my || room.controller.level !== 1 || room.controller.progress ||
       !room.controller.safeMode || room.controller.safeMode <= SAFE_MODE_DURATION-1) {
        return false;
    }
    if(Object.keys(Game.spawns).length !== 1) {    // check for 1 spawn
        return false;
    }
    Memory.respawnTick = Game.time;    // if all cases point to a respawn, you've respawned
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

/**
 * Runs profiler, .prime will set it to run on global reset for config value or 10s, .run will run profiler at loop 
 * 
 */
global.profilerGlobalReset = {
    prime : function() {
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

export default function () {
    
}