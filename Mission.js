const Operation = require('./Operation');
const { MISS_PRIORITY } = require('./util.config');
//const _ = require("lodash");

//** Set emergency room mode incase of wipe/fresh spawn.

/**
 * 
 * @param {Operation} operation 
 * @param {string} name 
 */
function Mission(operation, name, priority) {
  this.name = name;
  this.operation = operation;
  this.opName = operation.name;
  this.opType = operation.type;
  this.flag = operation.flag;
  this.room = operation.flag.room; // should change to operation.flag.pos.roomname incase no vision?
  this.king = operation.king;
  this.spawnGroup = operation.spawnGroup;
  this.sources = operation.sources;
  this.priority = MISS_PRIORITY[priority];
  this.nameTemplate = this.opType.substring(2, 5) + this.opName.split("g")[1] + '.';
  if (!operation.flag.memory[this.name]) operation.flag.memory[this.name] = {};
  this.memory = operation.flag.memory[this.name];
  this.memoryOp = operation.flag.memory;
  if (this.room) this.hasVision = true;
  if (!this.memory.spawn) this.memory.spawn = {};
  this.missionLog = `${this.room} - ${this.opName} (${this.opType}) - ${this.name}`;
}

Mission.prototype.init = function () { // Initialize / build objects required

};
Mission.prototype.roleCall = function () { // perform rolecall on required creeps spawn if needed

};
Mission.prototype.action = function () { // perform actions / missions

};
Mission.prototype.finalize = function () { // finalize? Invalidate Cache's/Re-calculate stuff (eg, hauler transports requried, may have gained GCL and benefit from analyzeHauler re-calc)

};

// Additional methods/functions below

/**
 * Role call creeps via mission.memory.spawn creep array, else spawn if needed
 * @param {string} roleName Creeps role title
 * @param {BodyPartConstant[]} creepBody Creep body to spawn, use this.getBody return to get dynamic size
 * @param {number} creepAmount How many creeps for role
 * @param {*} [options] .prespawn, .memory,
 * @returns Array of Creeps matching roleName
 */
Mission.prototype.creepRoleCall = function (roleName, creepBody, creepAmount = 1, options = {}) { // what mission needs. job name, what kinda body, how many, additional options (Pre-spawn, priority reservation etc)
  let creepArray = [];
  if (!this.memory.spawn[roleName]) {
    this.memory.spawn[roleName] = this.getLostCreeps(roleName);
    console.log("GETTING LOST CREEPS");
  };
  let creepCount = 0;
  for (let i = 0; i < this.memory.spawn[roleName].length; i++) {
    let creepName = this.memory.spawn[roleName][i];
    let creep = Game.creeps[creepName];
    if (creep) {
      creepArray.push(creep);
      let creepPrespawnTicks = 0;
      if (options.prespawn !== undefined) { // eg if prespawn is 30ticks
        creepPrespawnTicks += creep.body.length * 3; // each bodypart = 3s
        creepPrespawnTicks += options.prespawn; // add prespawn timer to spawn timer (miner 30 ticks from base + time to spawn = get there when old miner dies)
      }
      if (creep.spawning || creep.ticksToLive > creepPrespawnTicks) {
        creepCount++;
      }
    } else {
      this.memory.spawn[roleName].splice(i, 1);
      Memory.creeps[creepName] = undefined;
      i--;
    }
  };
  if (this.spawnGroup.isAvailable && (creepCount < creepAmount) /*&& this.hasVision*/) {
    let creepName = (this.nameTemplate + roleName + '.' + (Game.time % 100));//add this.spawnGroup.room.name
    let result = this.spawnGroup.spawn(creepBody, creepName, options.memory);
    if (result.spawnResults == 0) {
      this.memory.spawn[roleName].push(result.creepName);
    } else {
      if (global.debug) console.log(result.spawnResults);
    }
  }
  return creepArray;
};

/**
 * Searches for creeps created by this mission by roleName
 * @param {string} roleName 
 * @returns {string[]}
 */
Mission.prototype.getLostCreeps = function (roleName) {
  let creepNames = [];
  for (let creepName in Game.creeps) {
    if (creepName.indexOf(this.nameTemplate + roleName + '.') > -1) {
      creepNames.push(creepName);
    }
  }
  return creepNames;
};

/**
 * Takes creep body and multiplies by max energy available, with options. Returns creep body array for spawning
 * @param {Object.<string,number>} bodyConfig Object containing bodypart as Key and amount as Value eg {move:3,attack:2}
 * @param {Object.<string,?>} [options={}] maxRatio = max block multiplier
 *                        maxEnergyPercent = max spawn ratio eg ration energy use % below max
 *                        forceSpawn = spawn at available energy or 300
 *                        keepFormat = duplicates body structure instead of making it even
 *                        addBodyPart = add non multiplying bodypart to bodyConfig
 *                        removeBodyPart = remove a body part (eg in haulers require 1-2 move/carry ratio but -1 carry for work)
 * @returns {BodyPartConstant[]} Returns body ready for spawning
 */
Mission.prototype.getBody = function (bodyConfig, options = {}) { // ?? Add max body size limit (Eg maxEnergyPercent == %200 then creep will be twice as big as what can spawn).
  let blockMultiplier = this.bodyBlockCalc(bodyConfig, options); // Calc max multiplier of bodyConfig
  let creepBody = [];
  if (options.keepFormat) { //To keep format eg [WORK, CARRY, MOVE, WORK, CARRY, MOVE]
    for (let bodyPart in bodyConfig) {
      creepBody.push(bodyPart.toLowerCase());
    }
    let arrays = Array.apply(null, new Array(blockMultiplier));// Create an array of size "n" with undefined values
    arrays = arrays.map(function () { return creepBody; });// Replace each "undefined" with our array, resulting in an array of n copies of our array
    creepBody = [].concat.apply([], arrays); // Flatten our array of arrays and apply to creepBody
  } else { //Spreads Format eg [WORK, WORK, CARRY, CARRY, MOVE, MOVE]

    for (let bodyPart in bodyConfig) {
      creepBody = creepBody.concat(Array((bodyConfig[bodyPart] * blockMultiplier)).fill(bodyPart.toLowerCase()));
    }
  }
  if (options.addBodyPart) { // add non multiplying body parts to end
    for (let bodyPart in options.addBodyPart) {
      creepBody = creepBody.concat(Array((options.addBodyPart[bodyPart])).fill(bodyPart.toLowerCase()));
    }
  }
  if (options.removeBodyPart) {
    let partIndex = creepBody.findIndex((p) => p == options.removeBodyPart.toLowerCase());
    if (partIndex > -1) {
      creepBody.splice(partIndex, 1);
    }
  }
  return creepBody;
};

/**
 * Calc Max/Req creep body block multiplier
 * @param {Object.<string,number>} bodyConfig Object containing bodypart as Key and amount as Value eg {move:3,attack:2}
 * @param {Object.<string,?>} [options={}] maxRatio = max block multiplier
 *                                      maxEnergyPercent = max spawn ratio eg ration energy use % below max
 *                                      forceSpawn = spawn at available energy or 300
 *                                      addBodyPart = add non multiplying bodypart to bodyConfig
 * @returns {number} body blockMultiplier
 */
Mission.prototype.bodyBlockCalc = function (bodyConfig, options = {}) {
  let { blockEnergyReq, blockPartsReq } = this.bodyBlockReq(bodyConfig);
  let blockEnergyReqExtra = 0, blockPartsReqExtra = 0;
  if (options.addBodyPart) { // Run bodyBlockReq on extra part and re-assign to Extra vars
    ({ blockEnergyReq: blockEnergyReqExtra, blockPartsReq: blockPartsReqExtra } = this.bodyBlockReq(options.addBodyPart)); //var { name: nameA } = { name: "Bender" }; console.log(nameA) == "Bender"
  }
  let blockLimit = options.maxRatio ? options.maxRatio : Math.floor((50 - blockPartsReqExtra) / blockPartsReq); //Work out max bodypart ratio - addBodyPart
  let energyPool = options.forceSpawn ? Math.max(this.spawnGroup.currentSpawnEnergy, 300) : this.spawnGroup.maxSpawnEnergy; // if forceSpawn true then spawn with current energy or 300(incase total creep death?)
  //if (this.room.name == "W17N38") {console.log("TEST", blockLimit, Math.min(Math.floor((energyPool - blockEnergyReqExtra) * (options.maxEnergyPercent || 1) / blockEnergyReq), blockLimit))};
  options.maxEnergyPercent = options.maxEnergyPercent ? Math.min(1, Math.max(0, options.maxEnergyPercent)) : 1;
  return Math.min(Math.floor((energyPool - blockEnergyReqExtra) * (options.maxEnergyPercent || 1) / blockEnergyReq), blockLimit); // works out available block multipler (maxratio vs max energy available), minus addBodyPart
};

/**
 * Calc Energy cost & Parts count
 * @param {Object.<string,number>} bodyConfig Object containing bodypart as Key and amount as Value eg {move:3,attack:2}
 * @returns {Object.<string,number>} 
 */
Mission.prototype.bodyBlockReq = function (bodyConfig) { // return object {blockEnergyReq:0,blockPartsReq:0}
  let blockEnergyReq = 0;
  let blockPartsReq = 0;
  for (let bodyPart in bodyConfig) { // bodypart = object key
    blockEnergyReq += BODYPART_COST[bodyPart.toLowerCase()] * bodyConfig[bodyPart];
    blockPartsReq += bodyConfig[bodyPart];
  }
  return { blockEnergyReq: blockEnergyReq, blockPartsReq: blockPartsReq };
};

/**
 * Pass a room position and find distance to spawn group
 * @param {RoomPosition} destination 
 * @returns {number} Distance to spawn
 */
Mission.prototype.findDistanceToSpawn = function (destination, range = 1) { // pass a room position and find distance to spawn group
  if (!this.memory.distanceToSpawn || (Game.time % 50000 == 0)) {
    this.memory.distanceToSpawn = this.room.findPath(this.spawnGroup.pos, destination, { ignoreCreeps: true }).length - range; //generates path from spawn to source -1 because creep doesnt stand ontop of source
  }
  return this.memory.distanceToSpawn;
};

/**
 * 
 * @param {RoomPosition} position 
 * @returns {StructureStorage}
 */
Mission.prototype.findStorage = function (position) { // pass a room position and return closest storage object
  /**
   * @type {StructureStorage}
   */
  let storage;
  if (this.room.storage && this.room.storage.my) { //if no mem find storage in room
    //this.memory.storageID = this.room.storage.id;
    storage = this.room.storage;
    return storage;
  }
  if (this.memory.storageID) { // if storage in memory
    storage = Game.getObjectById(this.memory.storageID);
    if (storage && storage.room.controller.level >= 4) { //check still true
      return storage;
    }
    if (global.debug) console.log(`Error finding storage from memory, clearing - ${this.room} - ${this.opName} (${this.opType}) - ${this.name}`);
    this.memory.storageID = ""; //else reset memory
  }
  if (this.room.controller.my) { // added this part, dont want miners to take energy from room when bootstrapping?
    if (global.debug) console.log(`Error finding storage, room looks to be in construction - ${this.room} - ${this.opName} (${this.opType}) - ${this.name}`);
    return;
  }

  if (this.spawnGroup.room.storage && this.spawnGroup.room.storage.my) { //if none in room find spawngroup room storage
    this.memory.storageID = this.spawnGroup.room.storage.id;
    if (global.debug) console.log(`Using spawnGroup Storage @ ${this.spawnGroup.room.name} for ${this.room} - ${this.opName} (${this.opType}) - ${this.name}`);
    return storage;
  }

  // ADD KING STORAGES?
  try {
    /**
     * @type {Array.<StructureStorage,string>}
     */
    let storages = _.filter(this.king.storages, (storage) => storage.room.controller.level >= 4); // if none in spawngroup search all storage
    if (storages.length == 0) return;
    if (storages.length == 1) return storages[0]; // if only 1 return that one, (add check for distance by room maybe?)
    let sorted = _.sortBy(storages, (s) => Game.map.findRoute(s.pos.roomName, Game.rooms[position.roomName]).length); // else find closest. VERY EXPENSIVE? refactor better solution
    if (global.debug) console.log(`Error finding storage, Searching all & finding closest - ${this.room} - ${this.opName} (${this.opType}) - ${this.name}\nFound ${sorted[0]}`);
    return sorted[0];
  } catch (e) {
    console.log(`FORGOT TO ADD KING.STORAGES @ \n${e.stack}`); // if error console log stack at error
  }
};

/**
 * Pass a distance and source regen/tick to calc dynamic hauler size and qty based on spawnGroup max Energy
 * @param {number} distance Distance from dropoff to pickup
 * @param {number} regen How much energy regens per tick
 * @returns {{regen:number,distance:number,body:BodyPartConstant[],haulersNeeded:number,carryCount:number}} Return memory object containing regen, distance, body, haulersNeeded, carryCount
 */
Mission.prototype.analyzeHauler = function (distance, regen) {
  let haulerAnalysis;
  if (!this.memory.haulerAnalysis || regen !== this.memory.haulerAnalysis.regen || (Game.time % 10000 == 0)) {
    // distance to travel * there and back (and a little extra) * regen per tick
    let totalTickRegen = distance * 2.1 * regen;
    let bodyConfig = { carry: 2, move: 1 };
    let creepBlockCapacity = 100; //(2 CARRY, 1 MOVE)
    let creepBlocksNeeded = Math.ceil(totalTickRegen / creepBlockCapacity);
    let maxBlocksPossible = this.bodyBlockCalc(bodyConfig);
    let haulersNeeded = Math.ceil(creepBlocksNeeded / maxBlocksPossible);
    let haulBlocksPerHauler = Math.ceil(creepBlocksNeeded / haulersNeeded);
    let body = this.getBody(bodyConfig, { maxRatio: haulBlocksPerHauler }); //0, haulBlocksPerHauler * 2, haulBlocksPerHauler);
    haulerAnalysis = {
      regen, // regen per tick
      distance, // distance storage -> source
      body, // Body required per hauler
      haulersNeeded, // How many haulers
      carryCount: haulBlocksPerHauler * bodyConfig.carry // How many carry Parts total
    };
  }
  return haulerAnalysis || this.memory.haulerAnalysis;
};

/**
 * 
 * @param {RoomObject} startPos 
 * @param {RoomObject} dest 
 * @param {number} range 
 * @returns {PathFinderPath}
 */
Mission.prototype.paveRoad = function (start, dest, options = {}) {

  if (Game.time % 500 == 0) {
    this.memory.roadRepairIds = []; //?? rush implementation to avoid memory overload
  }
  if (Game.time - this.memory.paveTick < 500) return;// short circuit to run only x ticks
  let startPos = (start instanceof RoomPosition) ? start : start.pos;
  let destPos = (dest instanceof RoomPosition) ? dest : dest.pos;
  let range = options.range || 1;
  let path = options.path || PathFinder.searchCustom(startPos, destPos, range);
  if (!path) console.log(`Aborting Paving Road Function from ${startPos} to ${dest} - ${this.room} - ${this.opName} (${this.opType}) - ${this.name}`);
  let newConSites = this.fixRoad(path.path);
  if (newConSites.length) {
    if ((Object.keys(Game.constructionSites).length + newConSites.length) < 60) {
      if (global.debug) console.log(`Placing ${newConSites.length} roads for ${this.opName} in ${this.room}`);
      for (let newConSite of newConSites) {
        let roadReturn = newConSite.createConstructionSite(STRUCTURE_ROAD);
        if (global.debug) console.log(`Road result ${roadReturn} at X-${newConSite.x} Y-${newConSite.y} of ${newConSite.roomName}`);
      }
    } else {
      console.log(`Too many constructionSites to place more ${this.room} - ${this.opName} (${this.opType}) - ${this.name}`);
    }
  }
  this.memory.paveTick = Game.time;
  return path;
};

/**
 * Takes a path and checks road hp, will set this.memory.roadRepairIds to summon repairer. will return list of construction sites if no road found
 * @param {RoomPosition[]} path PathFinder path to perform roadworks
 * @returns {RoomPosition[]} An array of roomPositions to create road construction sites
 */
Mission.prototype.fixRoad = function (path) {
  let roadIds = [];
  let roadRepairHP = 0;
  let newConSites = [];
  for (let position of path) {
    if (!Game.rooms[position.roomName]) return;
    let road = position.lookFor(LOOK_STRUCTURES).find(struct => struct.structureType == STRUCTURE_ROAD);
    if (road) {
      roadIds.push(road.id);
      roadRepairHP += road.hitsMax - road.hits;
      let limitRoadRepairHp = 100000; // change to dyamic?
      if (!this.memoryOp.roadRepairIds || !this.memoryOp.roadRepairIds.length && roadRepairHP > limitRoadRepairHp || road.hits < road.hitsMax * .25) {
        console.log(`Roadworks begun, fixing in ${this.room} - ${this.opName} (${this.opType}) - ${this.name}`);
        this.memoryOp.roadRepairIds = roadIds;
      }
      continue;
    }
    let conSite = position.lookFor(LOOK_CONSTRUCTION_SITES).find(struct => struct.structureType == STRUCTURE_ROAD);
    if (conSite) continue;
    newConSites.push(position);
  }
  return newConSites;
};

// Mission.prototype.getBodyWorker = function (work, carry, move, options = {} ) {//maxRatio, maxEnergyPercent, forceSpawn keepFormat) { // Ratio of work/carry/move parts, max spawn ratio eg, ration energy use % below max
//   let blockEnergyReq = work * 100 + carry * 50 + move * 50; // get energy per creep block
//   let blockPartsReq = work + carry + move; // get amount of parts per creep block
//   let blockLimit = options.maxRatio ? blockPartsReq * options.maxRatio : Math.floor(50 / blockPartsReq); // max amount of blocks for creep
//   let energyPool = options.forceSpawn ? Math.max(this.spawnGroup.currentSpawnEnergy, 300) : this.spawnGroup.maxSpawnEnergy; // if forceSpawn true then spawn with current energy or 300(incase total creep death?)
//   let blockMultiplier = Math.min(Math.floor(energyPool * (options.maxEnergyPercent / 100 || 1) / blockEnergyReq), blockLimit); // block multipler
//   let creepBody = [];
//   for (let i = 0; i < work * blockMultiplier; i++){
//     creepBody.push(WORK);
//   }
//   for (let i = 0; i < carry * blockMultiplier; i++){
//     creepBody.push(CARRY);
//   }
//   for (let i = 0; i < move * blockMultiplier; i++){
//     creepBody.push(MOVE);
//   }
//   return creepBody
// };
//
// Mission.prototype.getBodyFighter = function (){
//
// }

/**
 * 
 * @param {RoomObject} targetObj 
 * @param {number} range 
 * @returns 
 */
Mission.prototype.placeContainer = function (targetObj, range) {
  if (this.room.controller && this.room.controller.my && this.room.controller.level <= 2) return;
  let targetObjPos = (targetObj instanceof RoomPosition) ? targetObj : targetObj.pos;
  let startingObject;
  if (this.storage && this.storage.my) {
    startingObject = this.storage.pos;
  } else {
    startingObject = this.spawnGroup.pos;
    if (!startingObject) {
      console.log(`Error finding container start of path - ${this.missionLog}`);
      return;
    };
  }
  if (targetObjPos.findInRange(FIND_CONSTRUCTION_SITES, range).length) {
    console.log("FOUND CONSTRUCTION SITE ABORTING");
    return;
  }
  console.log("NO FOUND CONSTRUCTION SITE, FINDING LOCATION TO BUILD AT");
  let ret = PathFinder.searchCustom(startingObject, targetObjPos, range); //? might need to switch ends?
  console.log(ret.path);
  if (ret.incomplete || ret.path.length == 0) {
    console.log(`Pathing for container placement failed - ${this.missionLog}`);
    return;
  }
  /**@type {RoomPosition} */
  let position = ret.path[ret.path.length - 1];
  console.log(`Placing container - ${this.missionLog}`);
  position.createConstructionSite(STRUCTURE_CONTAINER);
};

Mission.prototype.creepScavenge = function (creep, options = {}) {
    
  if (!this.operation.droppedResources.length || !creep) return false
  for (let resource of this.operation.droppedResources) {
    if (!resource[RESOURCE_ENERGY] && (!this.room.terminal || !options.minerals)) {
        continue
    }
    if (creep.store.getFreeCapacity() && creep.pos.isNearTo(resource)) {
      creep.pickup(resource)
      return true
    }
  }
  return false
}

module.exports = Mission;
