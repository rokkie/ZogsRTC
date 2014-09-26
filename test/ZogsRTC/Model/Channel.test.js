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
    var Channel       = requireHelper('./src/ZogsRTC/Model/Channel.js');
    var Room          = requireHelper('./src/ZogsRTC/Model/Room.js');

    var shouldAddRoom = function (t) {
        var name1   = 'foo';
        var name2   = 'bar';
        var channel = new Channel({ name: 'baz' });

        channel.addRoom(name1);                     // using name
        channel.addRoom(new Room({ name: name2 })); // using instance

        var rooms = channel.getRooms();

        t.equal(2, rooms.length, '2 rooms were added but ' + rooms.length + ' were retrieved');
        t.equal(name1, rooms[0].name, "Expected room 1 to be '" + name1 + "' but was '" + rooms[0].name + "'");
        t.equal(name2, rooms[1].name, "Expected room 2 to be '" + name2 + "' but was '" + rooms[1].name + "'");

        t.done();
    };

    var shouldReturnRoom = function (t) {
        var name    = 'foo';
        var channel = new Channel({ name: 'bar' });

        var room = channel.addRoom(name);

        t.ok((room instanceof Room), 'Adding a room does not return added instance');
        t.equal(name, room.name, 'Adding room does not have correct name');
        t.done();
    };

    var shouldNotAddSameRoomTwice = function (t) {
        var name1   = 'foo';
        var name2   = 'foo';
        var channel = new Channel({ name: 'bar' });

        t.throws(function () {
            channel.addRoom(name1);
            channel.addRoom(name2);
        }, Error, 'Should not allow adding a room with the same name');
        t.done();
    };

    var shouldEmitEventOnAddRoom = function (t) {
        var event   = 'roomadd';
        var name    = 'foo';
        var channel = new Channel({ name: 'bar' });

        channel.on(event, function (room) {
            t.equal(name, room.name);
            t.done();
        });
        channel.addRoom(name);
    };

    var shouldNotReturnPrivateRoom = function (t) {
        var publicRoom  = new Room({ name: 'foo' });
        var privateRoom = new Room({ name: 'bar', isPublic: false });
        var channel     = new Channel({ name: 'baz' });

        channel.addRoom(publicRoom);
        channel.addRoom(privateRoom);

        var rooms = channel.getRooms();

        t.equal(1, rooms.length, '1 public and 1 private rooms were added but ' + rooms.length + ' were retrieved');
        t.done();
    };

    var shouldReturnCorrectInfo = function (t) {
        var room1 = 'foo';
        var room2 = 'bar';
        var name  = 'baz';
        var channel = new Channel({ name: name });

        channel.addRoom(room1);
        channel.addRoom(room2);

        var info = channel.getInfo();

        t.deepEqual(info, {
            name: name,
            rooms: [{
                name: room1
            }, {
                name: room2
            }]
        }, 'Channel info is incorrect');

        t.done();
    };

    module.exports = {
        shouldAddRoom             : shouldAddRoom,
        shouldReturnRoom          : shouldReturnRoom,
        shouldNotAddSameRoomTwice : shouldNotAddSameRoomTwice,
        shouldEmitEventOnAddRoom  : shouldEmitEventOnAddRoom,
        shouldNotReturnPrivateRoom: shouldNotReturnPrivateRoom,
        shouldReturnCorrectInfo   : shouldReturnCorrectInfo
    };
}(module));
