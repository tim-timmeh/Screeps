'use strict'
require('SpawnGroup');

function King() { // constructor, how to build the object

}
King.prototype.init = function () { // Initialize / build objects required

};
King.prototype.rolecall = function () { // perform rolecall on required creeps spawn if needed

};
King.prototype.action = function () { // perform actions / missions

};
King.prototype.finalize = function () { // finalize?

};

// Additional methods/functions below

King.prototype.getSpawnGroup = function (roomName) {
        if (this.SpawnGroups[roomName]) {
            return this.SpawnGroups[roomName];
        }
        else {
            let room = Game.rooms[roomName];
            if (room && room.find(FIND_MY_SPAWNS).length > 0) {
                this.SpawnGroups[roomName] = new SpawnGroup(room);
                return this.SpawnGroups[roomName];
            }
        }
    }
