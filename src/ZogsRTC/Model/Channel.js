/*
 * Copyright (C) 2014 rocco
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * A channels namespace
 *
 * @class   Channel
 * @extends Base
 */
(function (module) {
    // require dependencies
    var Util = require('../Util/Util.js'),
        Base = require('./Base.js'),
        Room = require('./Room.js');

    /**
     * Fires when a room is added
     *
     * @event roomadd
     * @param {Room} room
     */

    /**
     * @constructor
     * @param   {Object} config Key/Values to set
     * @returns {Channel}
     */
    function Channel (config) {
        // call parent constructor
        Base.apply(this, [config]);

        /**
         * @readonly
         * @property {String} name Channel name
         */

        /**
         * @readonly
         * @property {Array} rooms Rooms in this channel
         */
        this.rooms = [];
    }

    // assign the prototype and constructor
    Channel.prototype = Util.copy({
        /**
         * Get information about this room
         *
         * @returns {Object}
         */
        getInfo: function () {
            return {
                name : this.name,
                rooms: this.getRooms().map(function (room) {
                    return {
                        name: room.name
                    };
                })
            };
        },

        /**
         * Get all public rooms
         *
         * @returns {Array}
         */
        getRooms: function () {
            return this.rooms.filter(function (room) {
                return room.isPublic;
            });
        },

        /**
         * Add a new room to the channel if it does not already exist
         *
         * @param   {Room} r Room or name
         * @throws  {Error}  When tying to add a room with an existing name
         * @returns {Room}
         */
        addRoom: function (room) {
            if (this.hasRoom(room)) {
                throw new Error('A room with the same name already exists');
            }

            if (!(room instanceof Room)) {
                room = new Room({ name: room });
            }

            this.rooms.push(room);
            this.emit('roomadd', room);
            return room;
        },

        /**
         * Check if a room already exists
         *
         * @param   {Room} room Room instance or name
         * @returns {Room}
         */
        hasRoom: function (room) {
            var roomName = (room instanceof Room) ? room.name : room;

            return this.rooms.find(function (r) {
                return (r.name === roomName);
            });
        }
    }, Object.create(Base.prototype));
    Channel.prototype.constructor = Channel;

    // export the constructor
    module.exports = Channel;
}(module));