"use strict";
require("moveToModule")
var roleMiner = {
  run: function(creep) {
    var source = Game.getObjectById(creep.memory.minerSource);
    var creepRoomName = creep.room.name
    var structures = [];
    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveToModule(source);
    } else if (creep.harvest(source) == !ERR_BUSY && ((structures = creep.pos.lookFor(LOOK_STRUCTURES)) != undefined && structures.length < 1)) {
      var construction = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
      if (construction.length < 1) {
        creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
      } else if (_.sum(creep.carry) >= (creep.carryCapacity - 25)) {
        creep.build(construction[0]);
      }
    } else if (!Memory.containersTest[creepRoomName]) {
      Memory.containersTest[creepRoomName] = [];
    } else if ((structures != undefined && structures != "") && Memory.containersTest[creepRoomName].indexOf(structures[0].id) == -1) {
      Memory.containersTest[creepRoomName].push(structures[0].id);
    }
  }
};
module.exports = roleMiner;
