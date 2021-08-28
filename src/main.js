'use strict'
import {debug} from './config'
import {hasRespawned, respawn, profilerGlobalReset} from './myHelperFn';
import MemHack from './MemHack'
import * as profiler from './screeps-profiler';
import {exportStats} from  './myFunctions';
profiler.enable();

hasRespawned() // check for respawn. needs fix?

if(debug)console.log(`#Global has been reset!\n#Overhead reset CPU: ${Game.cpu.getUsed().toFixed(2)} (${(Game.cpu.getUsed()/Game.cpu.limit*100).toFixed(2) || '(sim)'}%), Memory: ${global.memorySize/1000} KB(${(global.memorySize/2048000*100).toFixed(2)}%)`);

let profilerRun = profilerGlobalReset.prime() //primes to run profiler or not

export function loop () { // Main loop
  profiler.wrap(function(){ // profiler wrapper
    if (profilerRun) {profilerRun = profilerGlobalReset.run()} // if primed, run profiler
    MemHack.pretick();



  });
  exportStats()
}
