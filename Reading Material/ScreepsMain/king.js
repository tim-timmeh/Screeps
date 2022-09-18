const SpawnGroup = require('../../spawnGroup');

const RESOURCE_VALUE = {
  energy: .05,
  H: 1,
  O: 1,
  Z: 1,
  K: 1,
  U: 1,
  L: 1,
  X: 1,
};

/**
 * King is top level management. Manages nukes, terminal, trade etc
 * @constructor how to build the object
 */
function King() {
  if (!Memory.empire) Memory.empire = {};
  this.memory = Memory.empire;
  this.spawnGroups = {}
}
/**
 * Initialize / build objects required
 */
King.prototype.init = function () {

};
/**
 * perform rolecall on required creeps spawn if needed
 */
King.prototype.rolecall = function () {

};
/**
 * perform actions / missions
 */
King.prototype.action = function () {

};
/**
 * Finalise?
 */
King.prototype.finalize = function () {

};

// Additional methods/functions below

King.prototype.getSpawnGroup = function (roomName) {
  if (this.spawnGroups[roomName]) {
    return this.spawnGroups[roomName];
  }
  else {
    let room = Game.rooms[roomName];
    if (room && room.find(FIND_MY_SPAWNS).length > 0) {
      this.spawnGroups[roomName] = new SpawnGroup(room);
      return this.spawnGroups[roomName];
    }
  }
}

King.prototype.closestSpawnGroup = function (targetRoomName) {
  let closest;
  let bestDistance = 20;
  for (let roomName in this.spawnGroups) {
    //if (this.spawnGroups[roomName].spawns < 2 ) continue;
    let distance = Game.map.getRoomLinearDistance(targetRoomName,roomName);
    if (distance < bestDistance) {
      bestDistance = distance;
      closest = this.spawnGroups[roomName];
    }
  }
  if (closest) { //&& (closest.isAvailable)) {
    return closest
  }
  console.log(`NO CLOSE SPAWN FOUND FOR ${targetRoomName}`)
}

King.prototype.sellExcess = function (room, resourceType, dealAmount, forceSell = false, totalCurrentStore) {
  let resourcePriceAvg = Game.market.getHistory(resourceType)[0].avgPrice;
  let resourcePercentCutoff = 80;
  let resourcePriceCutoff = parseFloat(((resourcePercentCutoff / 100) * resourcePriceAvg).toFixed(3));
  let orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: resourceType });
  this.removeOrders(ORDER_BUY, resourceType);
  let bestOrder;
  let highestGain = 0;
  for (let order of orders) {
    if (order.remainingAmount < 101) continue;
    // TODO: If .username == an enemy then skip order
    let gain = order.price;
    let transferCost = Game.market.calcTransactionCost(100, room.name, order.roomName) / 100;
    gain -= transferCost * RESOURCE_VALUE[RESOURCE_ENERGY];
    if (gain > highestGain) {
      highestGain = gain;
      bestOrder = order;
      if (global.debug) console.log(" I could sell it to", order.roomName, "for", order.price, "(+" + transferCost + ")");
    }
  }

  if (bestOrder) {
    if (highestGain < resourcePriceCutoff && !forceSell) {
      if (global.debug) {
        console.log("TERMINAL: Have too much", resourceType, "in", room, "@", totalCurrentStore);
        console.log(` Failed. Below ${resourcePercentCutoff}% Avg For ${resourceType}. Current: ${highestGain.toFixed(3)}, Cutoff: ${resourcePriceCutoff}, Avg: ${resourcePriceAvg}`);
      }
      return;
    }
    console.log("TERMINAL: Have too much", resourceType, "in", room, "@", totalCurrentStore);
    if (forceSell) console.log(" FORCE SELLING")
    let amount = Math.min(bestOrder.remainingAmount, dealAmount);
    let outcome = Game.market.deal(bestOrder.id, amount, room.name);
    let notYetSelling = this.orderCount(ORDER_SELL, resourceType, bestOrder.price) === 0;
    if (notYetSelling) {
      Game.market.createOrder({ type: ORDER_SELL, resourceType, price: bestOrder.price, totalAmount: dealAmount, roomName: room.name });
      console.log(" Placed ORDER_SELL for", resourceType, "at", bestOrder.price, "Cr, to be sent from", room.name);
    }

    if (outcome === OK) {
      console.log(" Sold", amount, resourceType, "to", bestOrder.roomName, "for", bestOrder.price, ` Cr (${(bestOrder.price/resourcePriceAvg*100).toFixed(3)}%)`);
    } else if (outcome === ERR_INVALID_ARGS) {
      console.log(" invalid deal args:", bestOrder.id, amount, room.name);
    } else {
      console.log(" there was a problem trying to deal:", outcome);
    }
  }
}

King.prototype.removeOrders = function (type, resourceType) {
  for (let orderId in Game.market.orders) {
    let order = Game.market.orders[orderId];
    if (order.type === type && order.resourceType === resourceType) {
      Game.market.cancelOrder(orderId);
    }
  }
}

King.prototype.orderCount = function (type, resourceType, adjustPrice) {
  let count = 0;
  for (let orderId in Game.market.orders) {
    let order = Game.market.orders[orderId];
    if (order.remainingAmount < 10) {
      Game.market.cancelOrder(orderId);
    }
    else if (order.type === type && order.resourceType === resourceType) {
      count++;
      if (adjustPrice && adjustPrice < order.price) {
        console.log("MARKET: lowering price for", resourceType, type, "from", order.price, "to", adjustPrice);
        Game.market.changeOrderPrice(order.id, adjustPrice);
      }
    }
  }
  return count;
}


module.exports = King;