'use strict'
import './myGlobals';
import * as profiler from './screeps-profiler1';
import {exportStats} from  './myFunctions';
profiler.enable();

if (global.hasRespawned()) { // check for respawn. needs fix?
  console.log('******* RESPAWN DETECTED ********')
  global.respawn(); // reset flags and meory
}

if(global.debug)console.log(`#Global has been reset!\n#Overhead reset CPU: ${Game.cpu.getUsed().toFixed(2)} (${(Game.cpu.getUsed()/Game.cpu.limit*100).toFixed(2) || '(sim)'}%), Memory: ${global.memorySize/1000} KB(${(global.memorySize/2048000*100).toFixed(2)}%)`);

global.profilerGlobalReset.prime()

export function loop () { // Main loop
  profiler.wrap(function(){ // profiler wrapper
    global.profilerGlobalReset.run()
  });
  exportStats()
}
