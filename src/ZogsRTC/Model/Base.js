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
 * Base class for Channels and Rooms
 *
 * @private
 * @class Base
 */
(function (module) {

    /**
     * Constructs a new Base
     *
     * @constructor
     * @param   {String} name   Name of the object
     * @returns {Base}
     */
    function Base (name) {
        // define properties with accessors and mutators
        Object.defineProperties(this, {
            /**
             * @readonly
             * @property {String} name Name of this object
             */
            name: {
                get: function () {
                    return this.value;
                },
                set: function (value) {
                    if (undefined !== this.value) {
                        throw new Error('Name cannot change');
                    }
                    if (undefined === name) {
                        throw new Error('No name provided');
                    }
                    if (name.match(/[^a-z0-9\-\_]+/i)) {
                        throw new Error('Name contains illegal characters');
                    }
                    this.value = value;
                }
            }
        });

        this.name = name;
    }

    // export the constructor
    module.exports = Base;
}(module));