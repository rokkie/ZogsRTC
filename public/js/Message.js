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

function Message (uuid) {
    var me         = this,
        _uuid       = uuid || Util.guid(),
        _type       = undefined,
        _chunkNr    = 0,
        _chunkCount = 1,
        _meta       = {},
        _data       = null;

    Object.defineProperties(me, {
        uuid: {
            get: function () {
                return _uuid;
            },
            set: function (uuid) {
                throw new Error('Cannot set UUID, this is generated and should not be modified');
            }
        },
        type: {
            get: function () {
                return _type;
            },
            set: function (type) {
                if (type !== Message.TYPE_TEXT && type !== Message.TYPE_FILE) {
                    throw new RangeError("Unsupported message type '" + type + "'");
                }
                _type = type;
            }
        },
        chunkNr: {
            get: function () {
                return _chunkNr;
            },
            set: function (n) {
                if (!Util.isNumeric(n)) {
                    throw new TypeError("Chunk number must be numeric");
                }
                if (0 > n) {
                    throw new RangeError("Chunk number must be greater than 0");
                }
                if (_chunkCount < n) {
                    throw new RangeError("Chunk number must be less than chunk count");
                }

                _chunkNr = n;
            }
        },
        chunkCount: {
            get: function () {
                return _chunkCount;
            },
            set: function (count) {
                if (!Util.isNumeric(count)) {
                    throw new TypeError("Chunk count must be numeric");
                }
                if (1 > count) {
                    throw new RangeError("Chunk number must be greater than 0");
                }

                _chunkCount = count;
            }
        },
        meta: {
            get: function () {
                return _meta;
            },
            set: function (meta) {
                _meta = meta;       // What i really want is key/value pairs
            }
        },
        data: {
            get: function () {
                return _data;
            },
            set: function (data) {
                _data = data;
            }
        }
    });
};

Message.prototype = {

    size: function () {
        var me   = this,
            data = me.data;

        return (null === data) ? 0 : data.length;
    },

    overhead: function () {
        var me = this;

        return me.toString().length - me.size();
    },

    toString: function () {
        var me = this;

        return JSON.stringify({
            uuid      : me.uuid,
            type      : me.type,
            chunkNr   : me.chunkNr,
            chunkCount: me.chunkCount,
            meta      : me.meta,
            data      : me.data
        });
    }
};

// statics
Message.TYPE_TEXT = 'text';
Message.TYPE_FILE = 'file';
