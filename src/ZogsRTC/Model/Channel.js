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
    var events  = require('events').EventEmitter,
        Base    = require('./Base.js'),
        Room    = require('./Room.js');

    /**
     * Fires when a room is added
     *
     * @event roomadd
     * @param {Room} room
     */

    /**
     * @constructor
     * @param   {String} name   Channel name
     * @returns {Channel}
     */
    function Channel (name) {
        // call parent constructor
        Base.apply(this, [name]);
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
    Channel.prototype.constructor = Channel;
    Channel.prototype             = Object.assign({
        /**
         * Get information about this room
         *
         * @returns {Object}
         */
        getInfo: function () {
            return {
                name : this.name,
                rooms: this.getRooms()
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
         * Add a new room if it does not already exist
         *
         * @param   {Room} r Room or name
         * @returns {Room}
         */
        addRoom: function (r) {
            var roomName = (r instanceof Room) ? r.name : r,
                room     = this.hasRoom(roomName);

            if (!room) {
                room = new Room(roomName);
                this.rooms.push(room);

                events.emit('roomadd', room);
            }

            return room;
        },

        /**
         * Check if a room already exists
         *
         * @param   {Room} room Room instance or name
         * @returns {Room}
         */
        hasRoom: function (room) {
            var rooms    = this.rooms,
                roomName = (room instanceof Room) ? room.name : room;

            return this.rooms.find(function (r) {
                return (r.name === roomName);
            });
        }
    }, Object.create(Base.prototype));


    // export the constructor
    module.exports = Channel;
}(module));