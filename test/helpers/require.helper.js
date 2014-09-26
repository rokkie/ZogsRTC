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
 * Helper function that to use instead of NodeJS' require so a path to instrumented
 * files is prepended when generating code coverage
 */
(function (module) {
    // require dependencies
    var p = require('path');

    var helperFn = function (path) {
        var resolved = p.resolve((process.env.INSTRUMENT_DIR || './') + path);
        return require(resolved);
    };

    module.exports = helperFn;
}(module));
