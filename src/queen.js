var myFunc = require('./util.myFunctions');
const OperationBase = require('./op.Base');
const King = require('./king');
const OperationPlunder = require('./op.Plunder');
const OperationClaim = require('./op.Claim');
const OperationOffence = require('./op.Offence');
//const OperationBaseCompact = require('./op.BaseCompact');

/**
 * Flag Primary / Secondary Code. (
 * COLOR_RED: 1,
 * COLOR_PURPLE: 2,
 * COLOR_BLUE: 3,
 * COLOR_CYAN: 4,
 * COLOR_GREEN: 5,
 * COLOR_YELLOW: 6,
 * COLOR_ORANGE: 7,
 * COLOR_BROWN: 8,s
 * COLOR_GREY: 9,
 * COLOR_WHITE: 10 )
 */
const decode = {
  44: 'OpBaseCompact', // ltblue, ltblue
  55: 'OpBase', // Green, Green
  66: 'OpPlunder', // Yellow, Yellow
  77: 'OpClaim', // Orange, Orange
  11: 'OpOffence', // Red, Red
}
const operationTypes = {
  //OpBaseCompact: OperationBaseCompact, // ltblue, ltblue
  OpBase: OperationBase, // Green, Green
  OpPlunder: OperationPlunder, // Yellow, Yellow
  OpClaim: OperationClaim, // Orange, Orange
  OpOffence: OperationOffence, // Red, Red
}

// Functions for setting up Object heirachy
let queen = {

  initKing: function () {
    let king = new King();
    king.init();
    return king;
  },

  getOperations: function (king) {
    let operationList = {};
    for (let flagName in Game.flags) { // iterate over all flags / designated operations
      let flag = Game.flags[flagName];
      let flagCode = `${flag.color}${flag.secondaryColor}`; // convert color to code
      if (flagCode == '1010') continue; // white flags do nothing
      let flagType = decode[flagCode];
      if (flagType) {
        let operationType = operationTypes[flagType];
        if (operationType) {
          let isCompact = flagCode == '44'; // Determine if the operation should run in compact mode based on flag color
          let operation;
          myFunc.tryWrap(() => { // try/catch wrapper function
            operation = new operationType(flag, flagName, flagType, king, isCompact);
          }, 'ERROR generating op from flag');
          operationList[flagName] = operation;
        } else {
          console.log('Error in Operation / flag matchup - ' + flagType);
        }
      } else {
        console.log(`Error in flag color classification, ${flagName} - ${flagType} `)
      }
    }
    let sortedList = _.sortBy(operationList, (op) => op.priority);
    return sortedList;
  },
};

module.exports = queen