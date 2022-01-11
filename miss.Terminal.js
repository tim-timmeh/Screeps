const MINERALS_SELL = RESOURCES_ALL
const MINERAL_TERMINAL_TARGET = {
  silicon : 0, // add an amount to keep. default is 0 for RESOURCES_ALL
  energy : 50000,
}

const Mission = require('./Mission');
const Operation = require('./Operation');

//-- Constructor function, use .call to pass args through parent constructor first if req.

function MissionTerminal(operation) { // constructor, how to build the object
  Mission.call(this, operation, 'terminal'); // uses params to pass object through parnt operation constructor first

}

//-- Creates prototype inheritance, will give child obj the parents prototypes

MissionTerminal.prototype = Object.create(Mission.prototype); // makes MissionTerminal protos copy of Mission protos
MissionTerminal.prototype.constructor = MissionTerminal; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

MissionTerminal.prototype.initMiss = function () { // Initialize / build objects required
  this.terminal = this.room.terminal;
  this.storage = this.room.storage;
};

MissionTerminal.prototype.roleCallMiss = function () { // perform rolecall on required creeps spawn if needed

};

MissionTerminal.prototype.actionMiss = function () { // perform actions / missions
  this.sellOverstock();
};

MissionTerminal.prototype.finalizeMiss = function () { // finalize?

};

// Additional methods/functions below

MissionTerminal.prototype.sellOverstock = function () {
  if (Game.time % 100 !== 1) return;
  let forceSell
  if (this.terminal.store.getFreeCapacity() <= 50000) {
    forceSell = true;
  }
  for (let mineralType of MINERALS_SELL) {
    let saleAmount = this.terminal.store[mineralType] - (MINERAL_TERMINAL_TARGET[mineralType] || 0);
    if (saleAmount < (MINERAL_TERMINAL_TARGET[mineralType] / 2)) {
      continue;
    }
    if (saleAmount > 0) {
      if (saleAmount > 50000) {
        saleAmount = 50000;
      };
      //console.log("TERMINAL: Have too much", mineralType, "in", this.terminal.room, "@", this.terminal.store[mineralType]);
      this.king.sellExcess(this.room, mineralType, saleAmount, forceSell, this.terminal.store[mineralType]);
    }
  }
  /*if (this.terminal.store.energy >= 20000) {
    console.log("TERMINAL: Have too much energy in", this.terminal.room, "@", this.terminal.store.energy);
    this.king.sellExcess(this.room, RESOURCE_ENERGY, 10000, forceSell);
  }*/
  if (global.debug) console.log("Terminal Analysis Complete", this.terminal.room)
}

module.exports = MissionTerminal;