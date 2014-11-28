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
 * Main application
 */
(function (module) {
    // require dependencies
    require('./src/polyfills');
    var express = require('express'),
        app     = express(),
        http    = require('http').Server(app),
        io      = require('socket.io')(http);

    var routes = require('./src/routes/channels')(io);

    app.use('/', routes);


    // ------- temporary implementation for testing
    io.on('connection', function (socket) {
        socket.on('call', function (msg) {
            socket.broadcast.emit('call', msg);
        });

        socket.on('candidate', function (msg) {
            socket.broadcast.emit('candidate', msg);
        });
    });
    // -------


    var run = function (host, port) {
        app.set('port', port || process.env.PORT || 3000);
        app.set('host', host || 'localhost');

        var server = http.listen(app.get('port'), app.get('host'), function () {
            var addr   = server.address(),
                msgTpl = 'Signaling server listening on http://%s:%s';
            console.log(msgTpl, addr.address, addr.port);
        });
    };

    module.exports = {
        run: run
    };
}(module));