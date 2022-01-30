
// Debug #Info to console
//global.debug = true; // Default false
// Run profiler at global reset & debug = true
global.profilerGlobalResetSetTicks = 10; // Default 10


//Constants Below
const CONSTS = {

  OP_PRIORITY: {
    EMERGENCY: 0,
    CORE: 1,
    HIGH: 2,
    MED: 3,
    LOW: 4,
    VLOW: 5,
  },

  MISS_PRIORITY: { //Priority for missions, mapped to remaining bucket amount (eg 2:2000 means run when above 2k bucket)
    0:0,
    1:0,
    2:0,
    3:0,
    4:0,
    5:0,
    6:500,
    7:500,
    8:500,
    9:500,
    10:500,
  }

};

module.exports = CONSTS;
