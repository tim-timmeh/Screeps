'use strict'

// Custom functions reusable in code
module.exports = {

  convertArrayToObject: function(array, key) { // Converts an array to object with key as the key
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: item,
      };
    }, initialValue);
  },

  isEmpty: function(obj) { // Is object empty?
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  },

  ensureMemTreeObj: function(fn,defaultVal) { // Pass Memory location as function, will return if exists, will create if error
    try {
      return fn(); // will exit if parent exists
    } catch (e) { // will create tree if parent does not exist
      if(global.debug)console.log(`  #Setting Memory Tree: Memory.${defaultVal}`);
      _.set(Memory, defaultVal,{});
      return  _.get(Memory,defaultVal)
    }
  },


  //myFunc.tryWrap(() => {
  //
  //},`ERROR `)
  tryWrap : function (fn, description = 'Nondescript Error') { // wrap any function in a try/catch to let code keep running around error
    try {
      return fn(); // try to do function. (Not sure if to use return or not?)
    } catch (e) {
      console.log(`${description} @ ${__file} : ${__line}\n${e.stack}`) // if error console log stack at error
    }
  },

  getKeyByValue : function (object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }


};
//   exportStats : function () { // Sets Memory.stats for populating screepspl.us graph
//     // Reset stats object
//     Memory.stats = {
//       gcl: {},
//       rooms: {},
//       cpu: {},
//     };
//     Memory.stats.time = Game.time;
//     // Collect room stats
//     for (let roomName in Game.rooms) {
//       let room = Game.rooms[roomName];
//       let isMyRoom = (room.controller ? room.controller.my : false);
//       if (isMyRoom) {
//         let roomStats = Memory.stats.rooms[roomName] = {};
//         roomStats.storageEnergy           = (room.storage ? room.storage.store.energy : 0);
//         roomStats.terminalEnergy          = (room.terminal ? room.terminal.store.energy : 0);
//         roomStats.energyAvailable         = room.energyAvailable;
//         roomStats.energyCapacityAvailable = room.energyCapacityAvailable;
//         roomStats.controllerProgress      = room.controller.progress;
//         roomStats.controllerProgressTotal = room.controller.progressTotal;
//         roomStats.controllerLevel         = room.controller.level;
//       }
//     }
//     // Collect GCL stats
//     Memory.stats.gcl.progress      = Game.gcl.progress;
//     Memory.stats.gcl.progressTotal = Game.gcl.progressTotal;
//     Memory.stats.gcl.level         = Game.gcl.level;
//     // Collect CPU stats
//     Memory.stats.cpu.bucket        = Game.cpu.bucket;
//     Memory.stats.cpu.limit         = Game.cpu.limit;
//     Memory.stats.cpu.used          = Game.cpu.getUsed();
//   },
//
// };



// let setValue = (propertyPath, value, obj) => {
//   // this is a super simple parsing, you will want to make this more complex to handle correctly any path
//   // it will split by the dots at first and then simply pass along the array (on next iterations)
//   let properties = Array.isArray(propertyPath) ? propertyPath : propertyPath.split(".")
//   // Not yet at the last property so keep digging
//   if (properties.length > 1) {
//     // The property doesn't exists OR is not an object (and so we overwritte it) so we create it
//     if (!obj.hasOwnProperty(properties[0]) || typeof obj[properties[0]] !== "object") obj[properties[0]] = {}
//       // We iterate.
//     return setValue(properties.slice(1), value, obj[properties[0]])
//       // This is the last property - the one where to set the value
//   } else {
//     // We set the value to the last property
//     obj[properties[0]] = value
//     return true // this is the end
//   }
// }
// let our = {
//   adventure: {
//     is: {
//       getting: {
//       anotherThere: '4'
//       }
//     }
//   }
// }
// setValue("adventure.is.getting.there", true, our)

// function checkNested(obj, level,  ...rest) {
//   if (obj === undefined) return false
//   if (rest.length == 0 && obj.hasOwnProperty(level)) return true
//   return checkNested(obj[level], ...rest)
// }
