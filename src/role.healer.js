"use strict";
require('./moveToModule');
const _ = require('lodash');

const roleHealer = {

  /** @param {Creep} creep **/
  run: function(creep) {
    let healerFlag;
    let friendlyCreep;
    healerFlag = _.filter(Game.flags, f => f.name == "healerFlag")
    if (healerFlag[0] && creep.pos.roomName != healerFlag[0].pos.roomName) {
      creep.moveToModule(healerFlag[0].pos)
      if (creep.hits < creep.hitsMax) {
        creep.heal(creep)
      }
    } else {
      friendlyCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter : c => c.hits < c.hitsMax});
      if (friendlyCreep) {
        if (creep.heal(friendlyCreep) == ERR_NOT_IN_RANGE) {
          creep.moveToModule(friendlyCreep);
          creep.heal(friendlyCreep);
        }
      } else if (healerFlag[0] && !creep.pos.isNearTo(healerFlag)) {
        creep.moveToModule(healerFlag[0].pos)
      }
      if (creep.hits < creep.hitsMax) {
        creep.heal(creep)
      }
    }
  }
};

module.exports = roleHealer;
