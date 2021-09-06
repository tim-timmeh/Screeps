"use strict";
var positionMem;
                                      //Destination, ignore creeps, stuck counter
Creep.prototype.moveToModule = function(destination, ignore = true, ticks = 2) {
  var reusePath = 50;
  if (!this.memory.stuckCount) {
    this.memory.stuckCount = 0;
  }
  if (this.memory.position) {
    positionMem = new RoomPosition(this.memory.position.x, this.memory.position.y, this.memory.position.roomName);
    if (positionMem.toString() == this.pos.toString()) {
      this.memory.stuckCount += 1;
    } else {
      this.memory.stuckCount = 0;
    }
  }  
  if (this.memory.stuckCount >= ticks) {
    ignore = false;
    reusePath = 1;
  }
  this.memory.position = this.pos;
  this.moveTo(destination, {
    reusePath: reusePath,
    ignoreCreeps: ignore,
    visualizePathStyle: {stroke: '#fff'},
  });
};
module.exports = Creep.prototype.moveToModule;
