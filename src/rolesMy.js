'use strict';
const harvester = require("./role.harvester");
const upgrader = require("./role.upgrader");
const builder = require("./role.builder");
const repairer = require("./role.repairer");
const tower = require("./role.tower");
const miner = require("./role.miner");
const hauler = require("./role.hauler");
const butler = require("./role.butler");
const claimer = require("./role.claimer");
const pioneer = require("./role.pioneer");
const attacker = require("./role.attacker");
const tank = require("./role.tank");
const defender = require("./role.defender");
const healer = require("./role.healer");

const rolesMy = {
  harvester,
  upgrader,
  builder,
  repairer,
  tower,
  miner,
  hauler,
  butler,
  claimer,
  pioneer,
  attacker,
  tank,
  defender,
  healer,
};

module.exports = rolesMy;