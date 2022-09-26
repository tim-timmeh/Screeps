// @ts-nocheck
//----- TooAngel -----

/**
 * The data property represent the current data of the creep stored on the heap
 */
 Object.defineProperty(Creep.prototype, 'data', {
  get() {
    if (!global.data.creeps[this.name]) {
      global.data.creeps[this.name] = {};
    }
    return global.data.creeps[this.name];
  },
});

/**
 * getMineral - Gets the mineral from heap data, or sets if missing
 *
 * @param {object} creep - The creep
 * @return {object} - The tower
 **/
 function getMineral(creep) {
  if (!creep.data.mineral) {
    const minerals = creep.room.findMinerals();
    creep.data.mineral = minerals[0].id;
  }
  return Game.getObjectById(creep.data.mineral);
}

/**
 * The data property represent the current data of the room stored on the heap
 */
 Object.defineProperty(Room.prototype, 'data', {
  get() {
    if (!global.data.rooms[this.name]) {
      const data = {
        routing: {},
        positions: {
          creep: {},
          structure: {},
        },
      };
      if (this.isMy()) {
        data.positions = this.memory.position || {};
        // TODO do not store costMatrix in memory, this can be generated from positions
        data.costMatrix = PathFinder.CostMatrix.deserialize(this.memory.costMatrix);
        data.routing = {};
        if (this.memory.routing) {
          for (const pathName of Object.keys(this.memory.routing)) {
            const path = Room.stringToPath(this.memory.routing[pathName].path);
            data.routing[pathName] = {
              path: path,
              created: this.memory.routing[pathName].created,
              fixed: this.memory.routing[pathName].fixed,
              name: this.memory.routing[pathName].name,
            };
          }
        }
      }
      global.data.rooms[this.name] = data;
    }
    return global.data.rooms[this.name];
  },
});


// STEP THROUGH CODE 

brain.main.execute = function() {
  if (Game.time > 1000 && Game.cpu.bucket < 1.5 * Game.cpu.tickLimit && Game.cpu.bucket < Game.cpu.limit * 10) {
    console.log(`${Game.time} Skipping tick CPU Bucket too low. bucket: ${Game.cpu.bucket} tickLimit: ${Game.cpu.tickLimit} limit: ${Game.cpu.limit}`);
    return;
  }
  Memory.time = Game.time;
  try {
    brain.prepareMemory();
    brain.buyPower();
    brain.handleNextroomer();
    brain.handleSquadManager();
    brain.handleIncomingTransactions();
    handleQuests();
    checkPlayers();
  } catch (e) {
    console.log('Brain Exception', e.stack);
  }

  brain.stats.addRoot();
  brain.main.roomExecution();
  brain.main.visualizeRooms();
  brain.main.updateSkippedRoomsLog();
  brain.stats.add(['cpu'], {
    used: Game.cpu.getUsed(),
  });

  if (global.config.tickSummary.gcl) {
    console.log(`${Game.time} GCL ${Game.gcl.level}: ${global.utils.leftPadRound(Game.gcl.progress/Game.gcl.progressTotal*100, 3, 5)} %  ${Math.round(Game.gcl.progress)}/${Math.round(Game.gcl.progressTotal)}`);
  }
  if (global.config.tickSummary.bucket) {
    console.log(`${Game.time} Bucket: ${Game.cpu.bucket}`);
  }
  if (global.config.tickSummary.separator) {
    console.log(Game.time, '-----------');
  }
};

brain.main.roomExecution = function() {
  Memory.myRooms = _(Game.rooms).filter((r) => r.execute()).map((r) => r.name).value();
};

Room.prototype.execute = function() {
  try {
    const returnCode = this.handle();
    for (const creep of this.findMyCreeps()) {
      creep.handle();
    }
    return returnCode;
  } catch (err) {
    this.log('Executing room failed: ' + this.name + ' ' + err + ' ' + err.stack);
    Game.notify('Executing room failed: ' + this.name + ' ' + err + ' ' + err.stack, 30);
    return false;
  } finally {
    this.data.lastSeen = Game.time;
    if (this.isMy()) {
      this.memory.lastSeen = Game.time;
    }
  }
};

Room.prototype.handle = function() {
  updateBasicData(this);
  if (this.isMy()) {
    this.myHandleRoom();
    return true;
  }
  this.externalHandleRoom();
  return false;
};

/**
 * updateBasicData - Updates basic room data
 * - Sets the number of sources
 * - Sets the controller id
 * - Sets the hostile count
 *
 * @param {object} room - The room to init
 * @return {void}
 **/
 function updateBasicData(room) {
  if (room.data.sources === undefined) {
    room.data.sources = room.findSources().length;
  }
  if (room.data.controllerId === undefined) {
    room.data.controllerId = false;
    if (room.controller) {
      room.data.controllerId = room.controller.id;
      if (!room.data.mineral) {
        const minerals = room.findMinerals();
        room.data.mineral = minerals[0].mineralType;
      }
    }
  }
  room.data.hostileCreepCount = room.find(FIND_HOSTILE_CREEPS).length;
}

Room.prototype.myHandleRoom = function() {
  this.data.state = 'Controlled';
  if (!Memory.username) {
    Memory.username = this.controller.owner.username;
  }

  if (!this.memory.queue) {
    this.memory.queue = [];
  }

  const hostiles = this.findEnemies();
  if (hostiles.length === 0) {
    delete this.memory.hostile;
  } else {
    this.memory.hostile = {
      lastUpdate: Game.time,
      hostiles: hostiles,
    };
  }
  if (this.memory.unclaim) {
    return this.unclaimRoom();
  }
  return this.executeRoom();
};

Room.prototype.executeRoom = function() {
  const cpuUsed = Game.cpu.getUsed();
  this.memory.constants = this.memory.constants || {};
  this.buildBase();
  this.executeRoomHandleHostiles();
  this.executeRoomCheckBasicCreeps();
  this.checkForBuilder();
  this.checkForExtractor();
  this.checkForMineral();
  this.handleScout();
  this.handleTower();
  if (this.controller.level > 1 && this.memory.walls && this.memory.walls.finished) {
    this.checkRoleToSpawn('repairer');
  }

  if (this.memory.setup && this.memory.setup.completed) {
    this.handleEconomyStructures();
    this.handleNukeAttack();
  }
  this.spawnCheckForCreate();
  this.handleMarket();
  brain.stats.addRoom(this.name, cpuUsed);
  return true;
};

//---- Modus - discord -----------
export function distanceTransform(room: Room) {
  // compute the distance transform away from non open squares
  // Step1: set the edges and non open vlaues to 0
  // Step2: First pass using the min of stencil:
  // | +1 | +1 |
  // | +1 | X  |
  // wwhere x is set to value of min of its current value and +1 the others
  // Step3: second pass in reverse with
  // |  X | +1 |
  // | +1 | +1 |

  const v = new PathFinder.CostMatrix();
  for (let y = 0; y < 50; y++) {
    // init
    for (let x = 0; x < 50; x++) {
      v.set(x, y, initValue(x, y, room.name));
    }
  }
  for (let y = 0; y < 49; y++) {
    for (let x = 0; x < 49; x++) {
      const xp = x + 1;
      const yp = y + 1;
      const min = Math.min(v.get(xp, yp), v.get(xp, y) + 1, v.get(x, yp) + 1, v.get(x, y) + 1);
      v.set(xp, yp, min);
    }
  }
  // backward pass
  for (let y = 49; y > 1; y--) {
    for (let x = 49; x > 1; x--) {
      const xm = x - 1;
      const ym = y - 1;
      const min = Math.min(v.get(xm, ym), v.get(xm, y) + 1, v.get(x, ym) + 1, v.get(x, y) + 1);
      v.set(xm, ym, min);
    }
  }
  return v;
}

//---- CarsonBurke - github --------------
Room.prototype.distanceTransform = function(initialCM, enableVisuals) {

  const room = this

  // Use a costMatrix to record distances. Use the initialCM if provided, otherwise create one

  const distanceCM = initialCM || new PathFinder.CostMatrix()

  for (let x = 0; x < constants.roomDimensions; x++) {
      for (let y = 0; y < constants.roomDimensions; y++) {

          // Iterate if pos is to be avoided

          if (distanceCM.get(x, y) == 255) continue

          // Otherwise construct a rect and get the positions in a range of 1

          const rect = { x1: x - 1, y1: y - 1, x2: x + 1, y2: y + 1 }
          const adjacentPositions = generalFuncs.findPositionsInsideRect(rect)

          // Construct the distance value as the avoid value

          let distanceValue = 255

          // Iterate through positions

          for (const adjacentPos of adjacentPositions) {

              // Get the value of the pos in distanceCM

              const value = distanceCM.get(adjacentPos.x, adjacentPos.y)

              // Iterate if the value has yet to be configured

              if (value == 0) continue

              // If the value is to be avoided, stop the loop

              if (value == 255) {

                  distanceValue = 1
                  break
              }

              // Otherwise check if the depth is less than the distance value. If so make it the new distance value plus one

              if (value < distanceValue) distanceValue = 1 + value
          }

          // If the distance value is that of avoid, set it to 1

          if (distanceValue == 255) distanceValue = 1

          // Record the distanceValue in the distance cost matrix

          distanceCM.set(x, y, distanceValue)
      }
  }

  for (let x = constants.roomDimensions -1; x > -1; x--) {
      for (let y = constants.roomDimensions -1; y > -1; y--) {

          // Iterate if pos is to be avoided

          if (distanceCM.get(x, y) == 255) continue

          // Otherwise construct a rect and get the positions in a range of 1

          const rect = { x1: x - 1, y1: y - 1, x2: x + 1, y2: y + 1 }
          const adjacentPositions = generalFuncs.findPositionsInsideRect(rect)

          // Construct the distance value as the avoid value

          let distanceValue = 255

          // Iterate through positions

          for (const adjacentPos of adjacentPositions) {

              // Get the value of the pos in distanceCM

              const value = distanceCM.get(adjacentPos.x, adjacentPos.y)

              // Iterate if the value has yet to be configured

              if (value == 0) continue

              // If the value is to be avoided, stop the loop

              if (value == 255) {

                  distanceValue = 1
                  break
              }

              // Otherwise check if the depth is less than the distance value. If so make it the new distance value plus one

              if (value < distanceValue) distanceValue = 1 + value
          }

          // If the distance value is that of avoid, set it to 1

          if (distanceValue == 255) distanceValue = 1

          // Record the distanceValue in the distance cost matrix

          distanceCM.set(x, y, distanceValue)

          // If roomVisuals are enabled, show the terrain's distanceValue

          if (enableVisuals && Memory.roomVisuals) room.visual.rect(x - 0.5, y - 0.5, 1, 1, {
              fill: 'hsl(' + 200 + distanceValue * 10 + ', 100%, 60%)',
              opacity: 0.4,
          })
      }
  }

  return distanceCM
}

//---- Minty - Discord (Random snippet to get lowest item of array?) ------------
let target = _.minBy(targets, function(ts){
  let t = Game.getObjectById(ts)
  return ( /*creep.pos.getRangeTo(t)*/ +  t.hits > 3000 ? t.hits > 12000 ? t.hits > 25000 ? 300 : 200 : 100 : 0 )
})