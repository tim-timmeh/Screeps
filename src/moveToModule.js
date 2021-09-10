
let positionMem;

/**
 * Patches moveTo() function to include reset pathing on creep stuck count
 * @param {RoomObject | RoomPosition} destination 
 * @param {Boolean} [ignore] 
 * @param {number} [ticks]
 * @returns 
 */
Creep.prototype.moveToModule = function (destination, ignore = true, ticks = 2) {
  let reusePath = 50;
  if (!this.memory.stuckCount) {
    this.memory.stuckCount = 0;
  }
  if (this.memory.position) {
    positionMem = new RoomPosition(this.memory.position.x, this.memory.position.y, this.memory.position.roomName);
    if (positionMem.toString() == this.pos.toString()) {
      this.say("🤨");
      this.memory.stuckCount += 1;
    } else {
      this.memory.stuckCount = 0;
    }
  }
  if (this.memory.stuckCount >= ticks) { // currently only runs once then next call skips and re-paths.
    this.say("🤬");
    ignore = false;
    reusePath = 1;
  }
  let moveResult = ERR_TIRED
  if (this.fatigue <= 0){
    this.memory.position = this.pos;
    moveResult = this.moveTo(destination, {
      reusePath: reusePath,
      ignoreCreeps: ignore,
      visualizePathStyle: { stroke: '#fff' },
    });
  }
  (moveResult == ERR_TIRED) ? this.say("😰"):"";
  return moveResult ;
};
module.exports = Creep.prototype.moveToModule;
