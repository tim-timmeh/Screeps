const SpawnGroup = require('./spawnGroup');

/**
 * King is top level management. Manages nukes, terminal, trade etc
 * @constructor how to build the object
 */
function King() {
  if (!Memory.empire) Memory.empire = {};
  this.memory = Memory.empire;
  this.SpawnGroups = {}
}
/**
 * Initialize / build objects required
 */
King.prototype.init = function () {

};
/**
 * perform rolecall on required creeps spawn if needed
 */
King.prototype.rolecall = function () {

};
/**
 * perform actions / missions
 */
King.prototype.action = function () {

};
/**
 * Finalise?
 */
King.prototype.finalize = function () {

};

// Additional methods/functions below

King.prototype.getSpawnGroup = function (roomName) {
  if (this.SpawnGroups[roomName]) {
    return this.SpawnGroups[roomName];
  }
  else {
    let room = Game.rooms[roomName];
    if (room && room.find(FIND_MY_SPAWNS).length > 0) {
      this.SpawnGroups[roomName] = new SpawnGroup(room);
      return this.SpawnGroups[roomName];
    }
  }
}
module.exports = King;