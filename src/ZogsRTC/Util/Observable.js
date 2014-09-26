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
 * @class Base
 */
(function (module) {
    // require dependencies
    var events = require('events'),
        Util   = require('./Util.js');

    /**
     * Constructs a new Observable
     *
     * @constructor
     * @returns {Observable}
     */
    function Observable () {
        /**
         * @private
         * @property {EventEmitter} emitter Event emitter
         */
        this.emitter = new events.EventEmitter();
    }

    // assign the prototype and constructor
    Observable.prototype = Util.copy({
        /**
         * @param  {String}   event    Event name
         * @param  {Function} listener Callback
         * @return {EventEmitter}      The event emitter
         */
        on: function (event, listener) {
            this.emitter.on(event, listener);
        }
    }, Object.create(Object.prototype));
    Observable.prototype.constructor = Observable;

    // export the constructor
    module.exports = Observable;

}(module));
