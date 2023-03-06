
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
    3:300,
    4:400,
    5:500,
    6:600,
    7:700,
    8:800,
    9:900,
    10:1000,
  }

};

module.exports = CONSTS;
