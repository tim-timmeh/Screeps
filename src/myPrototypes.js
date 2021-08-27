'use strict'
// Prototypes are giving an object not yet created a function object to execute. Eg Certain creep/spawn/room to do something.

import _ from 'lodash';
import { ensureMemTreeObj } from './myFunctions';

//TEST FUNCTION
StructureSpawn.prototype.spawnTest = function() { //Prototypes like this will error until declared. defineProperty pre declared for get/set?
  console.log(this.name + ' spawnTest' + this.spawnTest);
};
// @ts-ignore
let testProto = new StructureSpawn('TestSpawnId');
testProto.spawnTest()
testProto.memory.get()
//TEST FUNCTION

Object.defineProperty(OwnedStructure.prototype, "memory", { // Shortcut for Owned Structures Memory
  get: function() { // Returns memory, if undefined creates & returns empty obj
    ensureMemTreeObj(() => Memory.rooms[this.room.name].ownedStructures[this.id],`rooms[${this.room.name}].ownedStructures[${this.id}]`);
    return Memory.rooms[this.room.name].ownedStructures[this.id] = Memory.rooms[this.room.name].ownedStructures[this.id] || {};
  },
  set: function(value) { // sets and returns the property
    return _.set(Memory, `rooms[${this.room.name}].ownedStructures.${this.id}`, value);
  },
  configurable: true,
  enumerable: false
});

Object.defineProperty(Source.prototype, 'memory', { // Shortcut for source memory
    configurable: true,
    get: function() {
        if(_.isUndefined(Memory.rooms[this.room.name].sourceIds)) {
            Memory.rooms[this.room.name].sourceIds = {};
        }
        if(!_.isObject(Memory.rooms[this.room.name].sourceIds)) {
            return undefined;
        }
        return Memory.rooms[this.room.name].sourceIds[this.id] =
                Memory.rooms[this.room.name].sourceIds[this.id] || {};
    },
    set: function(value) {
        if(_.isUndefined(Memory.rooms[this.room.name].sourceIds)) {
            Memory.mySourcesMemory = {};
        }
        if(!_.isObject(Memory.rooms[this.room.name].sourceIds)) {
            throw new Error('Could not set source memory');
        }
        Memory.rooms[this.room.name].sourceIds[this.id] = value;
    }
});

/*Object.defineProperty(Source.prototype, 'memory', { // Shortcut for source.memory OLD
  get: function(){ // Works as get and set as examples >       // console.log(Game.spawns.Spawn1.room.sources[0].memory.workers) // retrieves property
    //if (!Memory.rooms[this.room.name].sourceIds[this.id]) Memory.rooms[this.room.name].sourceIds[this.id] = {}; // untested, create obj if undefined
    return Memory.rooms[this.room.name].sourceIds[this.id]     // Game.spawns.Spawn1.room.sources[0].memory.testo = 'test'; // sets object/prop
  },
  set: function(newKey,newValue){ // Doesnt work. only 1 arg. set as in example above
    Memory.rooms[this.room.name].sourceIds[this.id][newKey] = newValue;
  },
  enumerable: false,
  configurable: true
});
*/

Object.defineProperty(Room.prototype, 'sources', { // Get stored room sources, Set if none stored
  /**
   * testy
   * @returns 
   */
  get: function() {
    if (!this._sources) { // If we dont have the value stored locally
      if (!this.memory.sourceIds) { // If we dont have the value stored in memory
        let arr = this.find(FIND_SOURCES).map(source => source.id); // Gets array of room sources id's
        let arrObj = arr.reduce((a,b)=> (a[b]={},a),{}); // Turns array into object keys. Original - (a[b]='',a),{});
        this.memory.sourceIds = arrObj // and stores to memory
        if (global.debug) console.log(`  #Adding memory for ${this.name} sources ${Object.keys(arrObj)}`)
      }
      this._sources = Object.keys(this.memory.sourceIds).map(id => Game.getObjectById(id)); // Get source object from memory id
    }
    return this._sources; // return the locally stored value
  },
  /**
   * 
   * @param {*} newValue 
   */
  set: function(newValue) { // Unsure of function or if it works here for reference.
    let arr = newValue.map(source => source.id);
    this.memory.sources = arr.reduce((a,b)=> (a[b]='',a),{});
    this._sources = newValue;
  },
  enumerable: false,
  configurable: true
});

/**
 * Old moveToModule, possibly needs rework
 * @param {Object} destination test
 * @param {Boolean} ignore test
 * @param {number} ticks test
 */
Creep.prototype['moveToModule'] = function(destination, ignore = true, ticks = 2) { 
  let positionMem
  let reusePath = 50;
  if (!this.memory.stuckCount) {
    this.memory.stuckCount = 0;
  }
  if (this.memory.position) {
    positionMem = new RoomPosition(this.memory.position.x, this.memory.position.y, this.memory.position.roomName);
    if (positionMem.toString() == this.pos.toString()) {
      this.memory.stuckCount += 1;
    } else {
      this.memory.stuckCount = 0;
    }
  }
  if (this.memory.stuckCount >= ticks) {
    ignore = false;
    reusePath = 1;
  }
  this.memory.position = this.pos;
  this.moveTo(destination, {
    reusePath: reusePath,
    ignoreCreeps: ignore,
    visualizePathStyle: {stroke: '#fff'},
  });
};