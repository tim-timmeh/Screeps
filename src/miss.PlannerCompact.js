'use strict';
const Mission = require("./Mission");
const bunkerLayout = require('./util.bunkerLayoutCompact');
const util_mincut = require('./util.min_cut');


//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionPlannerCompact(operation, priority = 6) { // constructor, how to build the object
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

MissionPlannerCompact.prototype = Object.create(Mission.prototype); // makes MissionPlannerCompact protos copy of Mission protos
MissionPlannerCompact.prototype.constructor = MissionPlannerCompact; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionPlannerCompact.prototype.initMiss = function () { // Initialize / build objects required
  this.checkBase(this.spawnAnchorPos);
  this.checkBaseRampart(this.spawnAnchorPos);
};

MissionPlannerCompact.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed

};

MissionPlannerCompact.prototype.actionMiss = function () { // perform actions / missions

};

MissionPlannerCompact.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

MissionPlannerCompact.prototype.checkBase = function (spawnAnchorPos) {
  if (!this.room.controller.my || !spawnAnchorPos || ((Game.time - this.memory.baseTick) < 1000)) return;
  let anchorOffset = { "x": 3, "y": 2 }; // bunkerFort x4/y4
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

MissionPlannerCompact.prototype.checkBaseRampart = function (spawnAnchorPos) {
  /* Psudocode
  done - set bounding box from spawnAnchorPos
  done (only base/controller) - set remaining bounding boxs (controller/source and maybe mineral?)
  done - retrieve mincut locations from memory, else calculate mincut.
  calculate mincut vs bunker rampart amount
  */

  if (!this.room.controller.my || !spawnAnchorPos || this.rcl < 5 || ((Game.time - this.memory.baseRampartTick) < 25)) return;
  
  let rampartPositions;
  this.memory.rampartPositions = this.memory.rampartPositions || [];
  
  if (this.memory.rampartPositions.length == 0 || Game.time % 100000 == 0){
    
    console.log("ENTERING mincut Refresh - ", this.memory.rampartPositions, this.memory.rampartPositions.length);

    let controllerPos = this.room.controller.pos
    let rectArray=[];

    let baseBoundingBox = this.setBaseBoundingBox(spawnAnchorPos)

    let controllerBoundingBox = this.setControllerBoundingBox(controllerPos)

    rectArray.push(baseBoundingBox); // Base bounding box
    rectArray.push(controllerBoundingBox); // controller bounding box
    
    this.memory.rampartPositions = this.runMinCut(this.room.name, rectArray)
  }

  rampartPositions = this.memory.rampartPositions

  if (rampartPositions.length > 40){
    console.log("MinCut has more ramparts than Bunker, review bunker instead")
  }
  let countConSites = this.room.find(FIND_CONSTRUCTION_SITES).length;

  let newConSites = [];
  
  for (let position of rampartPositions) {
    let positionObj = new RoomPosition(position.x, position.y, this.room.name);
    let building = positionObj.lookFor(LOOK_STRUCTURES).find(struct => struct.structureType == STRUCTURE_RAMPART); //?? break this up. if struct != buildingName then destroy. then create correct.
    if (building) {
      if (building.hits < building.hitsMax && building.hits < 10000) {
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
        console.log(`Already ${countConSites} conSites in room`, this.missionLog);
        break;
      }
      countConSites += 1;
      let buildingReturn;
      buildingReturn = newConSite.createConstructionSite(STRUCTURE_RAMPART);
      if (global.debug) console.log(`Building result ${buildingReturn} at X-${newConSite.x} Y-${newConSite.y} of ${newConSite.roomName}`);
    }
  } else {
    console.log(`Too many global constructionSites to place more ${this.missionLog}`);
  }

this.memory.baseRampartTick = Game.time;
}

MissionPlannerCompact.prototype.runMinCut = function(roomName, rectArray) {
  console.log("***ENTERING runMinCut****")
  let room = Game.rooms[roomName];
  if (!room) {
    console.log(`MinCut error, ${roomName} not valid`);
    return
  }
  let cpu = Game.cpu.getUsed();

  // rectArray, the Rectangles will be protected by the returned tiles

  // Boundary Array for Maximum Range
  let bounds={x1: 0, y1: 0, x2:49, y2: 49};
  // Get Min cut
  let rampartPositions = util_mincut.GetCutTiles(roomName,rectArray,bounds,true); // Positions is an array where to build walls/ramparts
  // Test output
  console.log('Positions returned', rampartPositions.length);
  cpu = Game.cpu.getUsed()-cpu;
  console.log('Needed',cpu,' cpu time');
  return rampartPositions;
};

MissionPlannerCompact.prototype.setBaseBoundingBox = function(spawnAnchorPos) {
  let anchorOffset = { "x": 4, "y": 4 }; // bunkerFort x4/y4
  let anchorPosTL = this.minusPosition(anchorOffset, spawnAnchorPos);
  let bunkerFortSize = { "x" : 10, "y": 10}; // BunkerFort width 10 height 10
  let anchorPosBR = this.addPosition(anchorPosTL, bunkerFortSize);
  return {x1: anchorPosTL.x, y1: anchorPosTL.y, x2: anchorPosBR.x, y2: anchorPosBR.y}
};

MissionPlannerCompact.prototype.setControllerBoundingBox = function(controllerPos) {
  let anchorOffset = { "x": 1, "y": 1 }; // set top left controller pos
  let anchorPosTL = this.minusPosition(anchorOffset, controllerPos);
  let controllerSize = { "x" : 2, "y": 2}; // box around controller
  let anchorPosBR = this.addPosition(anchorPosTL, controllerSize);
  return {x1: anchorPosTL.x, y1: anchorPosTL.y, x2: anchorPosBR.x, y2: anchorPosBR.y}
};

/* Old Rampart Planner

MissionPlannerCompact.prototype.checkBaseRampart = function (spawnAnchorPos) {
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
}*/

MissionPlannerCompact.prototype.minusPosition = function (anchorOffset, basePos) {
  let x1 = basePos.x,
    y1 = basePos.y,
    x2 = anchorOffset.x,
    y2 = anchorOffset.y;
  return { 'x': x1 - x2, 'y': y1 - y2 }
}

MissionPlannerCompact.prototype.addPosition = function (anchorOffset, basePos) {
  let x1 = basePos.x,
    y1 = basePos.y,
    x2 = anchorOffset.x,
    y2 = anchorOffset.y;
  return { 'x': x1 + x2, 'y': y1 + y2 }
}


module.exports = MissionPlannerCompact;

/*
for each building in bunkerCurrentReq.buildings, check building.pos + spawnAnchorPos
*/