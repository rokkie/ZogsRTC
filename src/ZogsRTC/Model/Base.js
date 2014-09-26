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
 * @class   Base
 * @extends {Observable}
 */
(function (module) {
    // require dependencies
    var Util       = require('../Util/Util.js'),
        Observable = require('../Util/Observable.js');

    /**
     * Constructs a new Base
     *
     * @constructor
     * @param   {Object} config Key/Values to set
     * @throws  {TypeError}     When config is not an object
     * @returns {Base}
     */
    function Base (config) {
        // properties
        var name = undefined;

        // call parent constructor
        Observable.apply(this, [config]);

        // define properties with accessors and mutators
        Object.defineProperties(this, {
            /**
             * @readonly
             * @property {String} name Name of this object
             */
            name: {
                get: function () {
                    return name;
                },
                set: function (value) {
                    if ('string' !== typeof value) {
                        throw new Error('Name must me string');
                    }
                    if (undefined !== name) {
                        throw new Error('Name cannot change');
                    }
                    if (value.match(/[^a-z0-9\-\_]+/i)) {
                        throw new Error('Name contains illegal characters');
                    }
                    name = value;
                }
            }
        });

        // check argument
        if (!(config instanceof Object)) {
            throw new TypeError('Config should be object literal');
        };

        // set values in config object, triggering setters
        for (var key in config) {
            if (config.hasOwnProperty(key)) {
                this[key] = config[key];
            }
        }

        // check if name is present
        if (undefined === this.name) {
            throw new Error('No name has been set');
        }
    }

    // assign the prototype and constructor
    Base.prototype = Util.copy({

    }, Object.create(Observable.prototype));
    Base.prototype.constructor = Base;

    // export the constructor
    module.exports = Base;
}(module));