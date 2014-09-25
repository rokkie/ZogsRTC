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
 * Handles requests about channels
 *
 * @class ChannelController
 */
(function (module) {
    // require dependencies
    var Server  = require('socket.io'),
        Manager = require('../Model/Manager.js'),
        Channel = require('../Model/Channel.js');

    /**
     * Constructs a new ChannelController
     *
     * @constructor
     * @param   {Server}  io     IO socket
     * @param   {Manager} server The manager
     * @returns {ChannelController}
     */
    var ChannelController = function (io, mngr) {
        if (!(io instanceof Server)) {
            throw new TypeError('Provided argument is not a Server');
        }

        if (!(mngr instanceof Manager)) {
            throw new TypeError('Provided argument is not a Manager');
        }

        /**
         * @readonly
         * @private
         * @property {Server} io IO socket
         */
        this.io = io;

        /**
         * @readonly
         * @property {Manager} server The server instance
         */
        this.mngr = mngr;

        // register event listeners
        this.mngr.on('channeladd', this.onChannelAdd.bind(this));
    };

    ChannelController.prototype = {
        /**
         * List all available channels
         * Sends channel list to response
         *
         * @param   {IncomingMessage} req [Request](http://expressjs.com/4x/api.html#request)
         * @param   {ServerResponse}  res [Response](http://expressjs.com/4x/api.html#response)
         * @returns {void}
         */
        listChannels: function (req, res) {
            var channels = this.mngr.getChannels(),
                list     = channels.map(function (channel) {
                    return channel.name;
                });

            res.send(list);
        },

        /**
         * Get info from a requested channel
         * Sends channel info to response
         *
         * @param   {IncomingMessage} req [Request](http://expressjs.com/4x/api.html#request)
         * @param   {ServerResponse}  res [Response](http://expressjs.com/4x/api.html#response)
         * @returns {void}
         */
        readChannel: function (req, res) {
            var channel = this.mngr.addChannel(req.channelName),
                info    = channel.getInfo();

            res.send(info);
        },

        /**
         * Event listener for when a channel is added
         *
         * @param   {Channel} channel
         * @returns {void}
         */
        onChannelAdd: function (channel) {
            var nsp    = '/' + channel.name,
                socket = this.io.of(nsp);

            // TODO: emit event??
            console.log("channel '" + channel.name + "' added");
        }
    };

    module.exports = ChannelController;
}(module));
