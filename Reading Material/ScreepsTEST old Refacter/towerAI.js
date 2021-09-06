var missTower = require("miss.tower");

function towerAI() {
  var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
  for (var tower of towers) {
    missTower.run(tower);
  }
}
module.exports = towerAI
