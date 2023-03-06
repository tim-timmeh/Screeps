'use strict'
const Mission = require("./Mission")

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionMinMiner(operation, priority = 7) { // constructor, how to build the object
  Mission.call(this, operation, 'minminer', priority); // uses params to pass object through parnt operation constructor first
  this.storage = this.room.storage;

}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionMinMiner.prototype = Object.create(Mission.prototype); // makes MissionMinMiner protos copy of Mission protos
MissionMinMiner.prototype.constructor = MissionMinMiner; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionMinMiner.prototype.initMiss = function () { // Initialize / build objects required
  this.mineral = this.room.find(FIND_MINERALS)[0]
  let resourcePriceAvg = Game.market.getHistory(this.mineral.mineralType)[0].avgPrice;
  let energyPriceAvg = Game.market.getHistory(RESOURCE_ENERGY)[0].avgPrice;
  let minLowValue = resourcePriceAvg < energyPriceAvg ? true : false; // If mineral is below energy price, skip
  let minLowEnergy = this.room.storage.store.energy < 450000 ? true : false; // if energy low, skip
  this.minMiningDisable = minLowValue || minLowEnergy
  this.mineralAmount = this.mineral.mineralAmount;
  this.distanceToSpawn = this.findDistanceToSpawn(this.mineral.pos);
  this.body = this.getBody({ MOVE: 1, WORK: 2 });
  let harvestSpeed = ((2 / 3) * this.body.length) / 5;
  this.extractor = this.mineral.pos.lookFor(LOOK_STRUCTURES)[0]
  if (!this.extractor) {
    this.extractorCsite = this.mineral.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0]
    if (!this.extractorCsite) {
      this.mineral.pos.createConstructionSite(STRUCTURE_EXTRACTOR)[0]
    }
  } else if (!this.minLowValue) {
    this.container = this.extractor.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: { structureType: STRUCTURE_CONTAINER }
    })[0];
    if (!this.container) {
      this.containerCsite = this.extractor.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
        filter: { structureType: STRUCTURE_CONTAINER }
      })[0];
      if (!this.containerCsite) {
        this.placeContainer(this.extractor, 1);
      }
    } else {
      //let storageCheck = this.room.storage && this.room.storage.my ? this.room.storage : false
      if (this.container.hits < this.container.hitsMax && this.container.hits < 25000) {
        this.memoryOp.roadRepairIds.push(this.container.id)
      }
      this.paveRoad(this.container, this.storageMy || this.spawnGroup);// Check path from container to storage || spawnGroup.spawns[0].pos ?? should add bunker entry as priority?
    }
    if (this.container && this.storage) {
      this.haulerAnalysis = this.analyzeHauler(this.distanceToSpawn, harvestSpeed);
    }
  }

};

MissionMinMiner.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed
  if (!this.extractor || !this.container) return;
  this.minMinerQty = this.mineralAmount == 0 || this.minMiningDisable ? 0 : 1;
  let body = this.body;
  this.minMiners = this.creepRoleCall(this.name, body, this.minMinerQty, { prespawn: this.distanceToSpawn }); //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory})
  if (Object.keys(this.haulerAnalysis).length) {
    let { distance, body, haulersNeeded } = this.haulerAnalysis;
    this.haulersNeeded = haulersNeeded;
    if (this.container.store.getUsedCapacity() == 0 && !this.minMinerQty) {
      this.haulersNeeded = 0
    }
    this.minHaulers = this.creepRoleCall(this.name + ".hauler", body, this.haulersNeeded, { prespawn: distance });
  }
};

MissionMinMiner.prototype.actionMiss = function () { // perform actions / missions
  if (this.minMiners) {
    for (let minMiner of this.minMiners) {
      this.minMinerActions(minMiner);
    }
  }
  if (this.minHaulers) {
    for (let minHauler of this.minHaulers) {
      this.minHaulerActions(minHauler);
    }
  }
};

MissionMinMiner.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

MissionMinMiner.prototype.minMinerActions = function (creep) {
  if (!this.minMinerQty) {
    if (this.spawnGroup.spawns[0].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.spawnGroup.spawns[0]);
    }
  } else if (!this.extractor.cooldown && creep.harvest(this.mineral) == ERR_NOT_IN_RANGE) {
    let dest = this.container;
    creep.moveToModule(dest, { ticks: 10, range: 0 });
  }
};

MissionMinMiner.prototype.minHaulerActions = function (creep) {
  if (creep.memory.building && creep.store.getUsedCapacity() == 0) {
    creep.memory.building = false;
    creep.say("Hmm");
  }
  if (!creep.memory.building && !creep.store.getFreeCapacity()) {
    creep.memory.building = true;
    creep.say("Urg");
  }
  if (!creep.memory.building) {
    if (this.creepScavenge(creep, {minerals:true})){
      
    } else if (!this.haulersNeeded) {
      if (creep.store.getUsedCapacity() == 0) {
        if (this.spawnGroup.spawns[0].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(this.spawnGroup.spawns[0]);
          //console.log("SUICIDING")
        }
      } else {
        creep.memory.building = true;
      }
    } else if (creep.withdraw(this.container, Object.keys(this.container.store)[0]) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.container);   
    } else {
      creep.giveWay({ pos: this.container.pos, range: 1 })
    }
  // } else if (this.room.storage && (this.room.storage.store.getFreeCapacity() > 0)) {
  //   if (creep.transfer(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
  //     creep.moveToModule(this.room.storage);
  //   }
  } else if (this.room.terminal) {
    if (creep.transfer(this.room.terminal, Object.keys(creep.store)[0]) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(this.room.terminal);
    } else {
      creep.giveWay()
    }
  }
};


module.exports = MissionMinMiner;