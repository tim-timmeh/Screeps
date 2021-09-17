
const myFunc = require('./myFunctions');
// Giving an object not yet created a function to perform. Eg Certain creep/spawn/room to do something.

StructureSpawn.prototype.spawnTest = function () { // Test function
  console.log(this.name + ' spawnTest');
};

Object.defineProperty(Structure.prototype, "memory", { // Shortcut for Owned Structures Memory
  get: function () { // Returns memory, if undefined creates & returns empty obj
    myFunc.ensureMemTreeObj(() => Memory.rooms[this.room.name].structures[this.structureType][this.id], `rooms[${this.room.name}].structures[this.structureType][${this.id}]`);
    return Memory.rooms[this.room.name].structures[this.structureType][this.id] = Memory.rooms[this.room.name].structures[this.structureType][this.id] || {};
  },
  set: function (value) { // sets and returns the property
    return _.set(Memory, `rooms[${this.room.name}].structures[${this.structureType}].${this.id}`, value);
  },
  configurable: true,
  enumerable: false
});

Object.defineProperty(Source.prototype, 'memory', { // Shortcut for source memory
  configurable: true,
  get: function () {
    if (_.isUndefined(Memory.rooms[this.room.name].sourceIds)) {
      Memory.rooms[this.room.name].sourceIds = {};
    }
    if (!_.isObject(Memory.rooms[this.room.name].sourceIds)) {
      return undefined;
    }
    return Memory.rooms[this.room.name].sourceIds[this.id] =
      Memory.rooms[this.room.name].sourceIds[this.id] || {};
  },
  set: function (value) {
    if (_.isUndefined(Memory.rooms[this.room.name].sourceIds)) {
      Memory.mySourcesMemory = {};
    }
    if (!_.isObject(Memory.rooms[this.room.name].sourceIds)) {
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
  get: function () {
    if (!this._sources) { // If we dont have the value stored locally
      if (!this.memory.sourceIds) { // If we dont have the value stored in memory
        let arr = this.find(FIND_SOURCES).map(source => source.id); // Gets array of room sources id's
        let arrObj = arr.reduce((a, b) => (a[b] = {}, a), {}); // Turns array into object keys. Original - (a[b]='',a),{});
        this.memory.sourceIds = arrObj // and stores to memory
        if (global.debug) console.log(`  #Adding memory for ${this.name} sources ${Object.keys(arrObj)}`)
      }
      this._sources = Object.keys(this.memory.sourceIds).map(id => Game.getObjectById(id)); // Get source object from memory id
    }
    return this._sources; // return the locally stored value
  },
  set: function (newValue) { // Unsure of function or if it works here for reference.
    let arr = newValue.map(source => source.id);
    this.memory.sources = arr.reduce((a, b) => (a[b] = '', a), {});
    this._sources = newValue;
  },
  enumerable: false,
  configurable: true
});

/**
 * //
 * @param {*} structureType 
 * @param {*} range 
 * @returns 
 */
RoomObject.prototype.findStructureNearby = function (structureType, range) { // search for structuretype near this object ie container / link
  //if (!this.room.memory.structures[structureType]) this.room.memory.structures[structureType] = {};
  _.defaultsDeep(this.room.memory, { 'structures': { [structureType]: {} } })
  let structureId = getKeyByValue(this.room.memory.structures[structureType], this.id);
  if (structureId) {
    let structure = Game.getObjectById(this.room.memory.structures[structureType][structureId]);
    if (structure) {
      return structure //return object ie Container / Link
    } else {
      delete this.room.memory.structures[structureType][structureId]
      //this.room.memory.structures[structureType][structureID] = undefined;
      if (global.debug) console.log(`Structure not valid, erasing from memory ${structureId} @ ${this.room.name} for ${this.id}`)
    }
  }
  if ((Game.time % 2 == 0) && (Math.random() < .2)) { // Every 2 ticks, 20% chance to go (1/10 ticks) ?? Remove this?
    console.log(`Searching for ${structureType} in range at ${this.room.name} of ${this.id}`); // Add search for CSite?
    let structures = _.filter(this.pos.findInRange(FIND_STRUCTURES, range), (s) => {
      return s.structureType == structureType;
    });
    if (structures.length > 0) {
      console.log(`Found ${structures[0].id}`)
      this.room.memory.structures[structureType][structures[0].id] = this.id;
      return structures[0]
    }
    console.log('Could not find...');
  }
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

/**
 * Custom Pathfinder // This is confusing and cannot find the source why i created this.
 * @param {RoomPosition} origin 
 * @param {RoomPosition} goal
 * @param {number} [range=0] 
 * @param {?} [opts] 
 * @returns {PathFinderPath}
 */
PathFinder.searchCustom = function (origin, goal, range = 0, opts = {}) {
  let ret = PathFinder.search(origin, { pos: goal, range: range }, { // ?Might need to do -  [{pos: this.source.pos, range:1}]
    plainCost: opts.plainCost || 2,
    swampCost: opts.swampCost || 3,
    roomCallback: function (roomName) {
      let room = Game.rooms[roomName];
      if (!room) return;
      let costs = new PathFinder.CostMatrix;
      room.find(FIND_STRUCTURES).forEach(function (struct) {
        if (struct.structureType == STRUCTURE_ROAD) {
          costs.set(struct.pos.x, struct.pos.y, 1);
        } else if (struct.structureType != STRUCTURE_CONTAINER && (struct.structureType != STRUCTURE_RAMPART || !struct.my)) {
          costs.set(struct.pos.x, struct.pos.y, 0xff);
        }
      });
      // add construction site roads too?
      room.find(FIND_CONSTRUCTION_SITES).forEach(function (site) {
        if (site.structureType == STRUCTURE_ROAD) {
          costs.set(site.pos.x, site.pos.y, 1);
        }
      });
      return costs;
    },
  });
  if (ret.incomplete) {
    console.log(`Error path incomplete from ${origin} to ${goal}`);
  }
  return ret;
}

/**
 * Move to room.controller and upgrade
 */
Creep.prototype.doUpgradeController = function () {
  let controller = this.room.controller
  if (this.upgradeController(controller) == ERR_NOT_IN_RANGE) {
    this.moveToModule(controller);
  };
}

/**
 * 
 * @param {Id<ConstructionSite>} build 
 * @returns 
 */
Creep.prototype.doBuildCsite = function (build) {
  let targetB;
  let b;
  if (build && (b = Game.getObjectById(build))) {
    targetB = b;
  } else {
    let csites = this.room.find(FIND_CONSTRUCTION_SITES);
    if (csites.length) {
      targetB = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
    };
    if (targetB && Object.keys(targetB).length) this.memory.currentJob = { build: targetB.id };
  }
  if (targetB && Object.keys(targetB).length) {
    if (this.build(targetB) == ERR_NOT_IN_RANGE) {
      this.moveToModule(targetB);
    }
    return true;
  }
}

/**
 * 
 * @param {Id<StructureSpawn> | Id<StructureExtension>} fill 
 * @returns 
 */
Creep.prototype.doFillEnergy = function (fill) {
  let targetF;
  let f;
  if (fill && (f = Game.getObjectById(fill)) && (f.store.energy < f.store.getCapacity(RESOURCE_ENERGY))) {
    targetF = f;
  } else {
    targetF = this.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
          structure.energy < structure.energyCapacity;
      }
    });
    if (targetF && Object.keys(targetF).length) this.memory.currentJob = { fill: targetF.id };
  }
  if (targetF && Object.keys(targetF).length) {
    if (this.transfer(targetF, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.moveToModule(targetF);
    }
    return true;
  };
};

/**
 * 
 * @param {Id<StructureTower>} tower 
 * @returns 
 */
Creep.prototype.doFillTower = function (tower) {
  /**
   * @type {StructureTower[]}
   */
  let targetsT = [];
  let t;
  if (tower && (t = Game.getObjectById(tower)) && (t.store[RESOURCE_ENERGY] < t.store.getCapacity(RESOURCE_ENERGY))) {
    targetsT[0] = t;
  } else {
    targetsT = this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_TOWER) && structure.store[RESOURCE_ENERGY] < structure.store.getCapacity(RESOURCE_ENERGY);
      }
    });
    if (targetsT[0]) this.memory.currentJob = { tower: targetsT[0].id };
  };
  if (targetsT[0]) {
    targetsT.sort((a, b) => a.store.energy - b.store.energy);
    if (this.transfer(targetsT[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.moveToModule(targetsT[0]);
    }
    return true;
  }
};