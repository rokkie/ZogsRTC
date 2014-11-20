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

(function (config) {
    // require dependencies
    require('./src/polyfills');
    var express = require('express'),
        app     = express(),
        http    = require('http').Server(app),
        io      = require('socket.io')(http);

    var routes = require('./src/routes/channels')(io);

    app.use('/', routes);

    // ...
    http.listen(config.port, function () {
        console.log('listening on *:', config.port);
    });

}({
    port: 3000
}));