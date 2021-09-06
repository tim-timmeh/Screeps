'use strict';
// Debug #Info to console
global.debug = true; // Default false
// Run profiler at global reset & debug = true
global.profilerGlobalResetSetTicks = 10; // Default 10


//Constants Below
module.exports = {

  PRIORITY : {
    EMERGENCY : 0,
    CORE : 1,
    HIGH : 2,
    MED : 3,
    LOW : 4,
    VLOW : 5,
  },

};
