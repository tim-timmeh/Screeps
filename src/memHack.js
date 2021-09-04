// @ts-nocheck
/**
 * Stores Memory in global to skip JSON.parse() at first-access of Memory in a tick. 
 * At top of main: import MemHack from './MemHack'.
 * At top of loop(): MemHack.pretick().
 */
const memHack = {
  memory: null,
  parseTime: -1,
  /**
   * Parses Memory to global.Memory
   */
  register () {
    const start = Game.cpu.getUsed()
    this.memory = Memory
    const end = Game.cpu.getUsed()
    this.parseTime = end - start
    if (global.debug) console.log(`MemHack Parse Time: ${this.parseTime}`)
    this.memory = RawMemory._parsed
  },
  /**
   * Sets Memory from global.Memory obj saving parse time.
   */
  pretick () {
    delete global.Memory
    global.Memory = this.memory
    RawMemory._parsed = this.memory
  }
}
memHack.register()
module.exports = memHack