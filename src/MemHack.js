// @ts-nocheck
import {debug} from './config'
/**
 * This code will
 * At top of main: import MemHack from './MemHack'.
 * At top of loop(): MemHack.pretick()
 */
const MemHack = {
    memory: null,
    parseTime: -1,
    /**
     * Parse Memory to MemHack.memory
     */
    register () {
      const start = Game.cpu.getUsed()
      this.memory = Memory
      const end = Game.cpu.getUsed()
      this.parseTime = end - start
      if (debug) console.log(this.parseTime);
      this.memory = RawMemory._parsed
    },
    /**
     * Deletes & Sets Memory to MemHack.Memory, Then get screeps to parse MemHack.memory 
     */
    pretick () {
      delete global.Memory
      global.Memory = this.memory
      RawMemory._parsed = this.memory
    }
  }
  MemHack.register()
  export default MemHack