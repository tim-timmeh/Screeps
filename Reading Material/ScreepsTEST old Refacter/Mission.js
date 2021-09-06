'use strict'
require('SpawnGroup')

//** Set emergency room mode incase of wipe/fresh spawn.

function Mission(operation, name) {
  this.name = name
  this.opName = operation.name
  this.opType = operation.type
  this.flag = operation.flag
  this.room = operation.room
  this.king = operation.king
  this.spawnGroup = operation.spawnGroup
  this.sources = operation.Sources
  if (!operation.flag.memory[this.name]) operation.flag.memory[this.name] = {};
  this.memory = operation.flag.memory[this.name];
  if (this.room) this.hasVision = true;
}

Mission.prototype.init = function () { // Initialize / build objects required

};
Mission.prototype.rolecall = function () { // perform rolecall on required creeps spawn if needed

};
Mission.prototype.action = function () { // perform actions / missions

};
Mission.prototype.finalize = function () { // finalize? Invalidate Cache's/Re-calculate stuff (eg, hauler transports requried, may have gained GCL and benefit from analyzeHauler re-calc)

};

// Additional methods/functions below

/**
* [Role call creeps via mission.memory.spawn creep array, else spawn if needed]
* @param  {String} roleName        [Creeps role title]
* @param  {[creepBody]} creepBody        [Creep body to spawn, use this.getBody return to get dynamic size]
* @param  {Number} [creepAmount=1] [How many creeps for role]
* @param  {Object} [options={}]    [prespawn = ]
*                                  []
* @return {creep[]}                 [Array of Creeps matching roleName]
*/
Mission.prototype.creepRoleCall = function (roleName, creepBody, creepAmount = 1, options = {} ) { // what mission needs. job name, what kinda body, how many, additional options (Pre-spawn, priority reservation etc)
  let creepArray = [];
  if (!this.memory.spawn[roleName]) {
    console.log('Code TODO getlostcreeps');
    this.memory.spawn[roleName] = this.getLostCreeps(roleName); // DO GET LOST CREEPS FUNCTION
  }
  let creepCount = 0;
  for (let i = 0; i < this.memory.spawn[roleName].length; i++) {
    let creepName = this.memory.spawn[roleName][i];
    let creep = Game.creeps[creepName];
    if (creep){
      creepArray.push(creep);
      let creepPrespawnTicks = 0;
      if (options.prespawn != undefined) { // eg if prespawn is 30ticks
        creepPrespawnTicks += creep.body.length * 3; // each bodypart = 3s
        creepPrespawnTicks += options.prespawn; // add prespawn timer to spawn timer (miner 30 ticks from base + time to spawn = get there when old miner dies)
      }
      if (creep.ticksToLive > creepPrespawnTicks || creep.spawning) {
        creepCount++;
      }
    } else {
      this.memory.spawn[roleName].splice(i, 1);
      Memory.creeps[creepName] = undefined;
      i--
    }
  }
  if (this.SpawnGroup.isAvailable && creepCount < creepAmount && this.hasVision) {
    let creepName = this.opName.substring(9,12) + '.' + this.roleName.substring(0,3) + '.' + (Game.time % 100);//add spawngroup # to name
    if (this.SpawnGroup.spawn(creepBody, creepName, options.memory) == 0) {
      this.memory.spawn[roleName].push(creepName);
    }
  }
  return creepArray;
};

/**
* [Takes creep body and multiplies by max energy available, with options. Returns creep body array for spawning]
* @param  {{string:number}} bodyConfig   [Object containing bodypart as Key and amount as Value eg {move:3,attack:2}]
* @param  {Object} [options={}] [maxRatio = max block multiplier]
*                                [maxEnergyPercent = max spawn ratio eg ration energy use % below max]
*                                [forceSpawn = spawn at available energy or 300]
*                                [keepFormat = duplicates body structure instead of making it even]
*                                [addBodyPart = add non multiplying bodypart to bodyConfig]
*                                [removeBodyPart = remove a body part (eg in haulers require 1-2 move/carry ratio but -1 carry for work)]
* @return {[creepBody]}              [Returns body ready for spawning]
*/
Mission.prototype.getBody = function (bodyConfig, options = {}) { //, ,
  let blockMultiplier = this.bodyBlockCalc(bodyConfig, options); // Calc max multiplier of bodyConfig
  let creepBody = []
  if (options.keepFormat) { //To keep format eg [WORK, CARRY, MOVE, WORK, CARRY, MOVE]
    for (let bodyPart in bodyConfig) {
      creepBody.push(bodyPart.toUpperCase())
    }
    let arrays = Array.apply(null, new Array(blockMultiplier));// Create an array of size "n" with undefined values
    arrays = arrays.map(function() { return creepBody });// Replace each "undefined" with our array, resulting in an array of n copies of our array
    creepBody = [].concat.apply([], arrays) // Flatten our array of arrays and apply to creepBody
  } else { //Spreads Format eg [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
    for (let bodyPart in bodyConfig) {
      creepBody = creepBody.concat(Array((bodyConfig[bodyPart] * blockMultiplier)).fill(bodyPart.toUpperCase()));
    }
  }
  if (options.addBodyPart) { // add non multiplying body parts to end
    for (let bodyPart in options.addBodyPart) {
      creepBody = creepBody.concat(Array((options.addBodyPart[bodyPart])).fill(bodyPart.toUpperCase()));
    }
  }
  if (options.removeBodyPart){
    let partIndex = creepBody.findIndex((p) => p == options.removeBodyPart.toUpperCase())
    if (partIndex > -1) {
      creepBody.splice(partIndex, 1);
    }
  }
  return creepBody
}

/**
* [Calc Max/Req creep body block multiplier]
* @param  {Object} bodyConfig   [Object containing bodypart as Key and amount as Value eg {move:3,attack:2}]
* @param  {Object} [options={}] [maxRatio = max block multiplier]
*                                [maxEnergyPercent = max spawn ratio eg ration energy use % below max]
*                                [forceSpawn = spawn at available energy or 300]
*                                [addBodyPart = add non multiplying bodypart to bodyConfig]
* @return {number}              [body blockMultiplier]
*/
Mission.prototype.bodyBlockCalc = function (bodyConfig, options = {}) {
  let { blockEnergyReq, blockPartsReq } = this.bodyBlockReq(bodyConfig);
  let blockEnergyReqExtra = 0, blockPartsReqExtra = 0;
  if (options.addBodyPart) { // Run bodyBlockReq on extra part and re-assign to Extra vars
    ({ blockEnergyReq:blockEnergyReqExtra, blockPartsReq:blockPartsReqExtra } = this.bodyBlockReq(options.addBodyPart)); //var { name: nameA } = { name: "Bender" }; console.log(nameA) == "Bender"
  }
  let blockLimit = options.maxRatio ? options.maxRatio : Math.floor((50 - blockPartsReqExtra) / blockPartsReq); //Work out max bodypart ratio - addBodyPart
  let energyPool = options.forceSpawn ? Math.max(this.spawnGroup.currentSpawnEnergy, 300) : this.spawnGroup.maxSpawnEnergy; // if forceSpawn true then spawn with current energy or 300(incase total creep death?)
  return Math.min(Math.floor((energyPool - blockEnergyReqExtra) * (options.maxEnergyPercent / 100 || 1) / blockEnergyReq), blockLimit); // works out available block multipler (maxratio vs max energy available), minus addBodyPart
}

/**
* [Calc Energy cost & Parts count]
* @param  {Object} bodyConfig [Object containing bodypart as Key and amount as Value eg {move:3,attack:2}]
* @return {{blockEnergyReq : number, blockPartsReq : number}}            [description]
*/
Mission.prototype.bodyBlockReq = function (bodyConfig) { // return object {blockEnergyReq:0,blockPartsReq:0}
  let blockEnergyReq = 0
  let blockPartsReq = 0
  for (let bodyPart in bodyConfig) { // bodypart = object key
    blockEnergyReq += BODYPART_COST[bodyPart.toLowerCase()] * bodyConfig[bodyPart];
    blockPartsReq += bodyConfig[bodyPart];
  }
  return {blockEnergyReq:blockEnergyReq, blockPartsReq:blockPartsReq}
}

/**
* [Pass a room position and find distance to spawn group]
* @param  {roomPosition} destination [description]
* @return {number}             [description]
*/
Mission.prototype.findDistanceToSpawn = function (destination) { // pass a room position and find distance to spawn group
  if (!this.memory.distanceToSpawn) {
    this.memory.distanceToSpawn = this.room.findPath(this.spawnGroup.pos, destination, {ignoreCreeps : true}).length - 1; //generates path from spawn to source -1 because creep doesnt stand ontop of source
  }
  return this.memory.distanceToSpawn
}

/**
* [Pass a room position and return closest storage object]
* @param  {roomPosition} position [description]
* @return {Object}          [description]
*/
Mission.prototype.findStorage = function (position) { // pass a room position and return closest storage object
  let storage
  if (this.room.storage && this.room.storage.my) { //if no mem find storage in room
    //this.memory.storageID = this.room.storage.id;
    storage = this.room.storage;
    return storage
  }
  if (this.memory.storageID) { // if storage in memory
    storage = Game.getObjectById(this.memory.storageID);
    if (storage && storage.room.controller.level >=4) { //check still true
      return storage
    }
    if (global.debug) console.log(`Error finding storage from memory, clearing - ${this.room} - ${this.opName} - ${this.name}`);
    this.memory.storageID = ""; //else reset memory
  }
  if (this.room.controller.my) { // added this part, dont want miners to take energy from room when bootstrapping?
    if (global.debug) console.log(`Error finding storage, room looks to be in construction - ${this.room} - ${this.opName} - ${this.name}`)
    return
  }

  if (this.spawnGroup.room.storage && this.spawnGroup.room.storage.my){ //if none in room find spawngroup room storage
    this.memory.storageID = this.spawnGroup.room.storage.id;
    if (global.debug) console.log(`Using spawnGroup Storage @ ${this.spawnGroup.room.name} for ${this.room} - ${this.opName} - ${this.name}`)
    return storage
  }

  // ADD KING STORAGES?
  try {
    let storages = _.filter(this.king.storages, (storage) => storage.room.controller.level >= 4); // if none in spawngroup search all storage
    if (storages.length == 0) return;
    if (storages.length == 1) return storages; // if only 1 return that one, (add check for distance by room maybe?)
    let sorted = _.sortBy(storages, (s) => Game.map.findPathTo(s.pos.roomName, position).length); // else find closest. VERY EXPENSIVE? refactor better solution
    if (global.debug) console.log(`Error finding storage, Searching all & finding closest - ${this.room} - ${this.opName} - ${this.name}\nFound ${sorted[0]}`);
    return sorted[0];
  } catch (e) {
    console.log(`FORGOT TO ADD KING.STORAGES @ ${__file} : ${__line}\n${e.stack}`) // if error console log stack at error
  }
}

/**
* [Pass a distance and source regen/tick to calc dynamic hauler size and qty based on spawnGroup max Energy]
* @param  {number} distance [Distance from dropoff to pickup]
* @param  {number} regen    [How much energy regens per tick]
* @return {object}          [Return memory object containing regen, distance, body, haulersNeeded, carryCount]
*/
Mission.prototype.analyzeHauler = function (distance, regen){
  if (!this.memory.haulerAnalysis || regen !== this.memory.haulerAnalysis.regen) {
    // distance to travel * there and back (and a little extra) * regen per tick
    let totalTickRegen = distance * 2.1 * regen ;
    let bodyConfig = {carry: 2 , move: 1 };
    let creepBlockCapacity = 100 //(2 CARRY, 1 MOVE)
    let creepBlocksNeeded = Math.ceil(totalTickRegen / creepBlockCapacity);
    let maxBlocksPossible = this.bodyBlockCalc(bodyConfig);
    //let maxUnitsPossible = Math.min(Math.floor(this.spawnGroup.maxSpawnEnergy / blockEnergyReq) ,Math.floor(50 / blockPartsReq));
    let haulersNeeded = Math.ceil(creepBlocksNeeded / maxBlocksPossible );
    let haulBlocksPerHauler = Math.ceil(creepBlocksNeeded / haulersNeeded);
    let body = this.getBody(bodyConfig, {maxRatio: haulBlocksPerHauler }) //0, haulBlocksPerHauler * 2, haulBlocksPerHauler);
    this.memory.haulerAnalysis = {
      regen: regen, // regen per tick
      distance: distance, // distance storage -> source
      body: body, // Body required per hauler
      haulersNeeded: haulersNeeded, // How many haulers
      carryCount: haulBlocksPerHauler * bodyConfig.carry // How many carry Parts total
    };
  }
  return this.memory.haulerAnalysis;
}

/**
* [description]
* @param  {Object} startPos [description]
* @param  {Object} dest     [description]
* @param  {number} range    [description]
* @return {[type]}          [description]
*/
Mission.prototype.paveRoad = function (startPos, dest, range) {
  if (Game.time - this.memory.paveTick < 1000) return;//needs short circuit
  let path = PathFinder.searchCustom(startPos.pos, dest.pos, 2)
  if (!path) console.log(`Aborting Paving Road Function from ${startPos} to ${dest} - ${this.opName} - ${this.room.name} - ${this.name}`)
  let newConSites = this.fixRoad(path)
  if (newConSites) {
    if ((Object.keys(Game.constructionSites).length + newConSites.length) < 60) {
      if (global.debug) console.log(`Placing ${newConSites.length} roads for ${this.opName} in ${this.room}`);
      for (let newConSite of newConSites) {
        let roadReturn = newConSite.createConstructionSite(STRUCTURE_ROAD);
        if (global.debug) console.log(`Road result ${roadReturn} at X-${newConSite.x} Y-${newConSite.y} of ${newConSite.roomName}`);
      }
    } else {
      console.log(`Too many constructionSites to place more ${this.opName} - ${this.room}`)
    }
  }
  this.memory.paveTick = Game.time;
}

/**
* [Takes a path and checks road hp, will set this.memory.roadRepairIds to summon repairer. will return list of construction sites if no road found]
* @param  {[roomPosition]} path [PathFinder parth to perform roadworks]
* @return {[roomPosition]}      [An array of roomPositions to create road construction sites]
*/
Mission.prototype.fixRoad = function (path) {
  let roadIds = [];
  let roadRepairHP = 0
  let newConSites = [];
  for (let position of path) {
    if (!Game.rooms[position.roomName]) return;
    let road = position.lookFor(LOOK_STRUCTURES).find(struct => struct.structureType = STRUCTURE_ROAD);
    if (road) {
      roadIds.push(road.id);
      roadRepairHP += road.hitsMax - road.hits;
      let limitRoadRepairHp = 1000000; // change to dyamic?
      if (!this.memory.roadRepairIds && (roadRepairHP > limitRoadRepairHP || road.hits < road.hitsMax * .25)) {
        console.log(`Roadworks begun, spawning in ${this.opName} - ${this.room}`);
        this.memory.roadRepairIds = roadIds;
      }
      continue;
    }
    let conSite = position.lookFor(LOOK_CONSTRUCTION_SITES).find(struct => struct.structureType = STRUCTURE_ROAD);
    if (conSite) continue;
    newConSites.push(position)
  }
  return newConSites
}

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
