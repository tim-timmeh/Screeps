interface StructureSpawn {
    /**
     * Test Description
     */
    spawnTest(): any;
}

interface Creep {
  /**
   * Patches moveTo() function to include reset pathing on creep stuck count
   * @param destination Can be an object with a room position, a room position object, or x,y position.
   * @param ignore Ignore Creep collision, Default True
   * @param ticks Stuck count
   */
  moveToModule(
    destination : object | {pos: RoomPosition} | {x:number,y:number},
    ignore? : boolean,
    ticks? : number,
  ):CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
}