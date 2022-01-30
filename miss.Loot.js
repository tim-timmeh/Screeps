'use strict'
const Mission = require("./Mission")

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionLoot(operation, priority = 3) { // constructor, how to build the object
  Mission.call(this, operation, 'loot', priority); // uses params to pass object through parnt operation constructor first
  this.priority = priority;
  this.roomName = this.flag.pos.roomName;
  this.deleteFlag = false;
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionLoot.prototype = Object.create(Mission.prototype); // makes MissionLoot protos copy of Mission protos
MissionLoot.prototype.constructor = MissionLoot; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionLoot.prototype.initMiss = function () { // Initialize / build objects required

};

MissionLoot.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed
  let body = this.getBody({ CARRY: 1, MOVE: 1 });
  this.looters = this.creepRoleCall(this.name, body, 2); //(roleName, .getBody({work, carry, move}, {maxRatio, maxEnergyPercent, forceSpawn, keepFormat, addBodyPart, removeBodyPart}), qty, {prespawn, memory})
};

MissionLoot.prototype.actionMiss = function () { // perform actions / missions
  for (let looter of this.looters) {
    this.looterActions(looter);
  }
};

MissionLoot.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

MissionLoot.prototype.looterActions = function (creep) {
  if (creep.memory.building && creep.store.getUsedCapacity() == 0) {
    creep.memory.building = false;
    creep.say("Hmm");
  }
  if (!creep.memory.building && creep.store.getFreeCapacity() == 0 || this.deleteFlag == true) {
    creep.memory.building = true;
    creep.say("Urg");
  }
  if (!creep.memory.building) {
    let droppedSource = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3); //change to inRangeTo (cheaper) and managed by mission not creep logic?
    if (droppedSource.length) {
      if (creep.pickup(droppedSource[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSource[0], {
          visualizePathStyle: {
            stroke: '#fa0'
          }
        });
      }
    } else if (!(creep.room.name == this.roomName)) {
      creep.moveToModule(this.flag);
    } else {
      if (creep.room.terminal && creep.room.terminal.store.getUsedCapacity() > 0) {
        if (creep.withdraw(Game.rooms[this.roomName].terminal, Object.keys(Game.rooms[this.roomName].terminal.store)[0]) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(Game.rooms[this.roomName].terminal);
        }
      } else if (creep.room.storage && creep.room.storage.store.getUsedCapacity() > 0) {
        if (creep.withdraw(Game.rooms[this.roomName].storage, Object.keys(Game.rooms[this.roomName].storage.store)[0]) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(Game.rooms[this.roomName].storage);
        }
      } else {
        this.deleteFlag = true;
      }
    }
  } else {
    if (!(creep.room.name == this.spawnGroup.room.name)) {
      creep.moveToModule(this.spawnGroup.pos);
    } else if (creep.room.terminal) {
      if (creep.transfer(creep.room.terminal, Object.keys(creep.store)[0]) == ERR_NOT_IN_RANGE) {
        creep.moveToModule(creep.room.terminal);
      } else {
        creep.giveWay()
        if (this.deleteFlag && creep.store.getUsedCapacity() == 0) {
          creep.suicide();
          this.flag.remove()
        }
      }
    }
  }
};


module.exports = MissionLoot;