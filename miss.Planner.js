'use strict';
const Mission = require("./Mission");
const bunkerLayout = require('./util.bunkerLayout');


//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionPlanner(operation, priority = 9) { // constructor, how to build the object
  Mission.call(this, operation, 'planner', priority); // uses params to pass object through parnt operation constructor first
  if (this.spawnGroup.room == this.room) {
    this.spawnAnchorPos = this.spawnGroup.pos;
  } else {
    this.spawnAnchorPos = this.flag.pos;
  }
  this.rcl = this.room.controller.level;
  this.memoryOp = operation.flag.memory;
  this.memoryOp.roadRepairIds = this.memoryOp.roadRepairIds || [];
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionPlanner.prototype = Object.create(Mission.prototype); // makes MissionPlanner protos copy of Mission protos
MissionPlanner.prototype.constructor = MissionPlanner; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionPlanner.prototype.initMiss = function () { // Initialize / build objects required
  this.checkBase(this.spawnAnchorPos);
  this.checkBaseRampart(this.spawnAnchorPos);
};

MissionPlanner.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed

};

MissionPlanner.prototype.actionMiss = function () { // perform actions / missions

};

MissionPlanner.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below
MissionPlanner.prototype.checkBase = function (spawnAnchorPos) {
  if (!this.room.controller.my || !spawnAnchorPos || ((Game.time - this.memory.baseTick) < 1000)) return;
  let anchorOffset = { "x": 4, "y": 4 }; // bunkerFort x4/y4
  let anchorPos = this.minusPosition(anchorOffset, spawnAnchorPos)
  let bunkerCurrentReq = {};
  bunkerCurrentReq = bunkerLayout.getLayout(bunkerLayout.baseLayout, { levelLayout: bunkerLayout.baseLevels, rcl: this.rcl });
  let countConSites = this.room.find(FIND_CONSTRUCTION_SITES).length;
  for (let buildingName in bunkerCurrentReq.buildings) {
    let newConSites = [];
    for (let position of bunkerCurrentReq.buildings[buildingName].pos) {
      let positionOffset = this.addPosition(anchorPos, position);
      let positionObj = new RoomPosition(positionOffset.x, positionOffset.y, this.room.name);
      let building = positionObj.lookFor(LOOK_STRUCTURES).find(struct => struct.structureType == buildingName); //?? break this up. if struct != buildingName then destroy. then create correct.
      if (building) {
        if (building.hits < building.hitsMax && building.hits < 25000) {
          this.memoryOp.roadRepairIds.push(building.id)
        }
      continue;
      }
      let conSite = positionObj.lookFor(LOOK_CONSTRUCTION_SITES).find(struct => struct.structureType == buildingName);
      if (conSite) continue;
      newConSites.push(positionObj);
    }
    if ((Object.keys(Game.constructionSites).length) < 90) {
      for (let newConSite of newConSites) {
        //console.log("TEST", newConSite, newConSites, countConSites);
        if (countConSites >= 10) {
          console.log(`Already ${countConSites} conSites`, this.missionLog);
          break;
        }
        countConSites += 1;
        let buildingReturn
        if (buildingName == 'spawn') {
          buildingReturn = newConSite.createConstructionSite(buildingName, `mySpawn${Game.time}`);
        } else {
          buildingReturn = newConSite.createConstructionSite(buildingName);
        }
        if (global.debug) console.log(`Building result ${buildingReturn} at X-${newConSite.x} Y-${newConSite.y} of ${newConSite.roomName}`);
      }
    } else {
      console.log(`Too many constructionSites to place more ${this.missionLog}`);
    }
    /*
    if ((Object.keys(Game.constructionSites).length + newConSites.length) < 60) {
      for (let newConSite of newConSites) {
        let buildingReturn
        if (buildingName == 'spawn') {
          buildingReturn = newConSite.createConstructionSite(buildingName, `mySpawn${Game.time}`);
        } else {
          buildingReturn = newConSite.createConstructionSite(buildingName);
        }
        if (global.debug) console.log(`Building result ${buildingReturn} at X-${newConSite.x} Y-${newConSite.y} of ${newConSite.roomName}`);
      }
    } else {
      console.log(`Too many constructionSites to place more ${this.missionLog}`);
    }*/
  }
  this.memory.baseTick = Game.time;
}

MissionPlanner.prototype.checkBaseRampart = function (spawnAnchorPos) {
  if (!this.room.controller.my || !spawnAnchorPos || ((Game.time - this.memory.baseRampartTick) < 25)) return;
  let anchorOffset = { "x": 4, "y": 4 }; // bunkerFort x4/y4
  let anchorPos = this.minusPosition(anchorOffset, spawnAnchorPos)
  let bunkerCurrentReq = {};
  bunkerCurrentReq = bunkerLayout.getLayout(bunkerLayout.baseRampart, { levelLayout: bunkerLayout.baseRampartLevels, rcl: this.rcl });
  let countConSites = this.room.find(FIND_CONSTRUCTION_SITES).length;
  for (let buildingName in bunkerCurrentReq.buildings) {
    let newConSites = [];
    for (let position of bunkerCurrentReq.buildings[buildingName].pos) {
      let positionOffset = this.addPosition(anchorPos, position);
      let positionObj = new RoomPosition(positionOffset.x, positionOffset.y, this.room.name);
      let building = positionObj.lookFor(LOOK_STRUCTURES).find(struct => struct.structureType == buildingName); //?? break this up. if struct != buildingName then destroy. then create correct.
      if (building) {
        if (building.hits < building.hitsMax || building.hits > 25000) {
          this.memoryOp.roadRepairIds.push(building.id)
        }
      continue;
      }
      let conSite = positionObj.lookFor(LOOK_CONSTRUCTION_SITES);//.find(struct => struct.structureType == buildingName);
      if (conSite.length) continue;
      newConSites.push(positionObj);
    }
    if ((Object.keys(Game.constructionSites).length) < 90) {
      for (let newConSite of newConSites) {
        if (countConSites >= 10) {
          console.log(`Already ${countConSites} conSites`, this.missionLog);
          break;
        }
        countConSites += 1;
        let buildingReturn
        if (buildingName == 'spawn') {
          buildingReturn = newConSite.createConstructionSite(buildingName, `mySpawn${Game.time}`);
        } else {
          buildingReturn = newConSite.createConstructionSite(buildingName);
        }
        if (global.debug) console.log(`Building result ${buildingReturn} at X-${newConSite.x} Y-${newConSite.y} of ${newConSite.roomName}`);
      }
    } else {
      console.log(`Too many constructionSites to place more ${this.missionLog}`);
    }
  }
  this.memory.baseRampartTick = Game.time;
}

MissionPlanner.prototype.minusPosition = function (anchorOffset, basePos) {
  let x1 = basePos.x,
    y1 = basePos.y,
    x2 = anchorOffset.x,
    y2 = anchorOffset.y;
  return { 'x': x1 - x2, 'y': y1 - y2 }
}

MissionPlanner.prototype.addPosition = function (anchorOffset, basePos) {
  let x1 = basePos.x,
    y1 = basePos.y,
    x2 = anchorOffset.x,
    y2 = anchorOffset.y;
  return { 'x': x1 + x2, 'y': y1 + y2 }
}


module.exports = MissionPlanner;

/*
for each building in bunkerCurrentReq.buildings, check building.pos + spawnAnchorPos
*/