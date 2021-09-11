'use strict'
const MainObj = require("./MainObj")

//-- Constructor function, use .call to pass args through parent constructor first if req.

function SubObj(...args) { // constructor, how to build the object
  MainObj.call(this, ...args); // uses params to pass object through parnt operation constructor first
  this.properties = "SubObj properties";
}

//-- Creates prototype inheritance, will give child obj the parents prototypes

SubObj.prototype = Object.create(MainObj.prototype); // makes SubObj protos copy of MainObj protos
SubObj.prototype.constructor = SubObj; // reset constructor to operationbase, or else constructor is operation

//-- Creates methods for prototype

SubObj.prototype.init = function () { // Initialize / build objects required

};

SubObj.prototype.roleCall = function () { // perform rolecall on required creeps spawn if needed

};

SubObj.prototype.action = function () { // perform actions / missions

};

SubObj.prototype.finalize = function () { // finalize?

};

// Additional methods/functions below

function helperFunction() {
  console.log("scope helper function")
}
