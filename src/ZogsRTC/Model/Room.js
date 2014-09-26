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
 * A chatroom
 *
 * @class   Room
 * @extends Base
 */
(function (module) {
    // require dependencies
    var Util = require('../Util/Util.js'),
        Base = require('./Base.js');

    /**
     * Constructs a new Room
     *
     * @constructor
     * @param   {Object} config Key/Values to set
     * @returns {Room}
     */
    function Room (config) {
        // properties
        var isPublic = true;

        // define properties with accessors and mutators
        Object.defineProperties(this, {
            /**
             * @readonly
             * @property {String} name Room name
             */

            /**
             * @property {Boolean} isPublic
             * True if this is a public room
             */
            isPublic: {
                get: function () {
                    return isPublic;
                },
                set: function (value) {
                    isPublic = (value) ? true : false;
                }
            }
        });

        // call parent constructor
        Base.apply(this, [config]);
    }

    // assign the prototype and constructor
    Room.prototype = Util.copy({

    }, Object.create(Base.prototype));
    Room.prototype.constructor = Room;

    // export the constructor
    module.exports = Room;
}(module));