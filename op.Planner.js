
const Operation = require('./Operation');
const PRIORITY = require('./config');

/**
 * General running of the Planner
 * @param {object} flag missions will operate relative to this flag, use colors to determine flag type via opCode
 * @param {string} flagName flag.name should be default set flag1/2/3 etc maybe need to add additional incase of doubleup?
 * @param {string} flagType decoded flag color used to determine which operation to instantiate (eg green/green = 55 = OpPlanner)
 * @param {object} king object used for king-scoped behavior (terminal transmission, etc.)
 * @constructor extends Operation
 */
function OperationPlanner(flag, flagName, flagType, king) {
  Operation.call(this, flag, flagName, flagType, king); // uses params to pass object through operation constructor first
}

OperationPlanner.prototype = Object.create(Operation.prototype); // makes operationPlanner protos copy of operation protos
OperationPlanner.prototype.constructor = OperationPlanner; // reset constructor to operationPlanner, or else constructor is operation

OperationPlanner.prototype.initOp = function () { // Initialize / build objects required
  
};
OperationPlanner.prototype.roleCallOp = function () { // perform rolecall on required creeps spawn if needed

};
OperationPlanner.prototype.actionOp = function () { // perform actions / missions

};
OperationPlanner.prototype.finalizeOp = function () { // finalize?

};

// Additional methods/functions below
module.exports = OperationPlanner;
