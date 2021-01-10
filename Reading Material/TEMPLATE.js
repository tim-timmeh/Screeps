'use strict'
const MainObj = require("MainObj")

//-- Constructor function, use .call to pass args through parent constructor first if req.

/**
 * [SubObj description]
 * @return {[type]} [description]
 */
function SubObj() { // constructor, how to build the object
  MainObj.call(this, ...args); // uses params to pass object through parnt operation constructor first
  this.properties = "SubObj properties";
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

SubObj.prototype = Object.create(MainObj.prototype); // makes SubObj protos copy of MainObj protos
SubObj.prototype.constructor = SubObj; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

/**
 * [description]
 * @return {[type]} [description]
 */
SubObj.prototype.init = function () { // Initialize / build objects required

};

/**
 * [description]
 * @return {[type]} [description]
 */
SubObj.prototype.rolecall = function () { // perform rolecall on required creeps spawn if needed

};

/**
 * [description]
 * @return {[type]} [description]
 */
SubObj.prototype.action = function () { // perform actions / missions

};

/**
 * [description]
 * @return {[type]} [description]
 */
SubObj.prototype.finalize = function () { // finalize?

};

// Additional methods/functions below

/**
 * [helperFunction description]
 * @return {[type]} [description]
 */
function helperFunction() {
  console.log("scope helper function")
}
