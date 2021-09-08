"use strict";

require('./myGlobal');

const myFunc = require('./myFunc');
const profiler = require('./screeps-profiler');
const creepSpawn = require('./creepSpawn');
const creepRun = require('./creepRun');
const towerRun = require('./towerRun');
const memHack = require('./memHack');

// Only here for TS checking in VSCode.
const _ = require("lodash");

// Records tick of global reset for stats
const globalResetTick = Game.time;

/**
 * This line monkey patches the global prototypes. Broken?
 */
//profiler.enable();
module.exports.loop = function () {
  profiler.wrap(function () {

    // Run memHack
    memHack.pretick();

    // Clear memory of old creeps.
    for (let name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log("Clearing non-existing creep memory: ", name);
      }
    }

    // Multi room - run code on each room
    creepSpawn();

    // Creep AI
    creepRun();

    // Tower AI
    towerRun();

    myFunc.exportStats(globalResetTick);
  });
};