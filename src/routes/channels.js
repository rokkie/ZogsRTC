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
 * Route definitions for channels
 */
(function (module) {
    // require dependencies
    var express = require('express'),
        router  = express.Router(),
        zogsrtc = require('../ZogsRTC'),
        factory = function (io) {
            var mngr        = new zogsrtc.Model.Manager(),
                channelCtrl = new zogsrtc.Ctrl.ChannelController(io, mngr);

            router.param('channelName', function (req, res, next, channelName) {
                if (channelName.match(/[^a-z0-9\-\_]+/i)) {
                    return;
                }

                req.channelName = channelName;
                next();
            });


            router.get('/channels', channelCtrl.listChannels.bind(channelCtrl));
            router.get('/:channelName', channelCtrl.readChannel.bind(channelCtrl));

            return router;
        };

    module.exports = factory;
}(module));
