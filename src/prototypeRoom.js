/**
 * data contains room information stored on the heap
 */
 Object.defineProperty(Room.prototype, 'data', {
  get() {
    if (!global.data.rooms[this.name]) {
      const data = {
        positions: {
          creep: {},
          structure: {},
        },
      };
      global.data.rooms[this.name] = data;
    }
    return global.data.rooms[this.name];
  },
});

Room.prototype.execute = function() {
  
};