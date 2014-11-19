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
    var Manager       = requireHelper('./src/ZogsRTC/Model/Manager.js');
    var Channel       = requireHelper('./src/ZogsRTC/Model/Channel.js');

    var shouldAddChannel = function (t) {
        var name1 = 'foo';
        var name2 = 'bar';
        var mngr  = new Manager({ name: 'baz' });

        mngr.addChannel(name1);                        // using name
        mngr.addChannel(new Channel({ name: name2 })); // using instance

        var channels = mngr.getChannels();

        t.equal(2, channels.length, '2 channels were added but ' + channels.length + ' were retrieved');
        t.equal(name1, channels[0].name, "Expected channel 1 to be '" + name1 + "' but was '" + channels[0].name + "'");
        t.equal(name2, channels[1].name, "Expected channel 2 to be '" + name2 + "' but was '" + channels[1].name + "'");

        t.done();
    };

    module.exports = {
        shouldAddChannel: shouldAddChannel
    };
}(module));