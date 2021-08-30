'use strict'

module.exports = {

/**
 * Check if object empty
 * @param {object} obj 
 * @returns 
 */
  isEmpty : function (obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  },
  
};