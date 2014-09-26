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

require('../../../src/polyfills');

(function (module) {
    // require dependencies
    var requireHelper = require('../../helpers/require.helper.js');
    var Observable    = requireHelper('./src/ZogsRTC/Util/Observable.js');

    var shouldBeAbleToEmitAndListenToEvent = function (t) {
        var event      = 'foo';
        var arg        = 'bar';
        var observable = new Observable();

        t.expect(1);
        observable.on(event, function (a) {
            t.equal(arg, a, 'Argument from event is not what was expected');
            t.done();
        });
        observable.emit(event, arg);
    };

    module.exports = {
        shouldBeAbleToEmitAndListenToEvent: shouldBeAbleToEmitAndListenToEvent
    };
}(module));
