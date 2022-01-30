
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

  MISS_PRIORITY: { //Priority for missions, based on remaining bucket amount (eg 2 = 2k bucket)
    0:0,
    1:1000,
    2:2000,
    3:3000,
    4:4000,
    5:5000,
    6:6000,
    7:7000,
    8:8000,
    9:9000,
    10:10000,
  }

};

module.exports = CONSTS;
