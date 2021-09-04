'use strict'
const _ = require("lodash");
const rolesMy = require('./rolesMy');

const towerRun = function() {
  let towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
  for (let tower of towers) {
    // @ts-ignore
    rolesMy.tower.run(tower);
  }
}

module.exports = towerRun