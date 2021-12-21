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
  /*for (let mineralType of MINERALS_RAW) {
      if (this.storage.store[mineralType] >= MINERAL_STORAGE_TARGET[mineralType]
          && this.storage.room.terminal.store[mineralType] >= RESERVE_AMOUNT) {
          console.log("TRADE: have too much", mineralType, "in", this.storage.room, this.storage.store[mineralType]);
          this.king.sellExcess(this.room, mineralType, RESERVE_AMOUNT);
      }
  }*/
  if (_.sum(this.terminal.store) >= 20000) {
      console.log("TERMINAL: have too much energy in", this.terminal.room,"@", this.terminal.store.energy);
      this.king.sellExcess(this.room, RESOURCE_ENERGY, 5000);
  }
  if (global.debug) console.log("Terminal Analysis Complete", this.terminal.room)
}

module.exports = MissionTerminal;