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
    destination : RoomObject | {pos: RoomPosition} | {x:number,y:number},
    ignore? : boolean,
    ticks? : number,
  ):CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
  /**
   * Move to room.controller and upgrade
   */
  doUpgradeController(): void;
  /**
   * Move to target CSite or search and move to closest CSite and build.
   */
  doBuildCsite(target?:ConstructionSite): ConstructionSite;
}

interface MissionButler {
  creepRoleCall(
    roleName  : string,
    creepBody : body,
    creepAmount : number,
    options : any,
  ) : [Creep]
}

interface PathFinder {
  searchCustom(
    origin : RoomPosition,
    goal : RoomPosition,
    range? : Number = 0,
    opts? : ?,
  ) : PathFinderPath,
}