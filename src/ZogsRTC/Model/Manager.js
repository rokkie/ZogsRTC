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
 * The RTC Signaling Server
 *
 * @class Manager
 */
(function (module) {
    // require dependencies
    var events  = require('events'),
        Channel = require('./Channel.js');

    /**
     * Fires when a channel is added
     *
     * @event channeladd
     * @param {Channel} channel
     */

    /**
     * Constructs a new Server
     *
     * @constructor
     * @returns {Manager}
     */
    var Manager = function () {
        /**
         * @private
         * @property {EventEmitter} emitter Event emitter
         */
        this.emitter = new events.EventEmitter();

        /**
         * @readonly
         * @property {Array} channels Active channels
         */
        this.channels = [];
    };

    Manager.prototype = {
        /**
         * @param  {String}   event    Event name
         * @param  {Function} listener Callback
         * @return {EventEmitter}      The event emitter
         */
        on: function (event, listener) {
            this.emitter.on(event, listener);
        },

        /**
         * Get the available channels
         *
         * @returns {Array}
         */
        getChannels: function () {
            return this.channels;
        },

        /**
         * Add a new channel if it does not already exist
         *
         * @param   {Channel} channel Channel or name
         * @returns {Channel}
         */
        addChannel: function (channel) {
            if (this.hasChannel(channel)) {
                throw new Error('A channel with the same name already exists');
            }

            if (!(channel instanceof Channel)) {
                channel = new Channel({ name: channel });
            }

            this.channels.push(channel);
            this.emitter.emit('channeladd', channel);
            return channel;
        },

        /**
         * Checks if channel already exists
         *
         * @param   {Channel} channel Channel instance or name
         * @returns {Channel}         Channel or undefined if not found
         */
        hasChannel: function (channel) {
            var channelName = (channel instanceof Channel) ? channel.name : channel;

            return this.channels.find(function (r) {
                return (r.name === channelName);
            });
        }
    };

    // export module
    module.exports = Manager;
}(module));
