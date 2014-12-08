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
 * @constructor
 * @param   {String} uuid
 * @returns {Message}
 */
function Message (uuid) {
    var me = this,

    /**
     * @property {String} uuid Unique ID for this message
     */
    _uuid = uuid || Util.guid(),

    /**
     * @property {String} type Type of message text|file
     */
    _type = undefined,

    /**
     * @property {Number} chunkNr Total number of chucks
     */
    _chunkCount = 1,

    /**
     * @property {Number} chunkNr Chunk number
     */
    _chunkNr = 0,

    /**
     * @property {Boolean} complete If the message is complete
     */
    _complete = false,

    /**
     * @property {String} name Human readable name for the message
     */
    _name = undefined,

    /**
     * @property {String} mime MimeType of the file
     */
    _mime = undefined,

    /**
     * @property {ArrayBuffer} data Message data
     */
    _data = new ArrayBuffer(0),

    /**
     * @property {Array} chunks Chunks of data
     */
    _chunks = [];

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
        chunkCount: {
            get: function () {
                return _chunkCount;
            },
            set: function (count) {
                if (!Util.isNumeric(count)) {
                    throw new TypeError('Chunk count must be numeric');
                }
                if (1 > count) {
                    throw new RangeError('Chunk number must be greater than 0');
                }

                _chunkCount = count;
            }
        },
        chunkNr: {
            get: function () {
                return _chunkNr;
            },
            set: function (n) {
                if (!Util.isNumeric(n)) {
                    throw new TypeError('Chunk number must be numeric');
                }
                if (0 > n) {
                    throw new RangeError('Chunk number must be greater than 0');
                }
                if (_chunkCount < n) {
                    throw new RangeError('Chunk number must be less than chunk count');
                }

                _chunkNr = n;
            }
        },
        complete: {
            get: function () {
                if (!_complete) {
                    _complete = (me.chunks.length === me.chunkCount);
                }

                return _complete;
            },
            set: function (value) {
                throw new Error('Cannot set complete flag');
            }
        },
        name: {
            get: function () {
                return _name;
            },
            set: function (name) {
                _name = name.replace(/\u0000/g, '')
                            .replace(/[^a-z0-9\_\-\.]/gi, '-')
                            .toLowerCase()
                            .substr(0, 255);
            }
        },
        mime: {
            get: function () {
                return _mime;
            },
            set: function (mime) {
                if (!mime.match(/[a-z0-9\!\#\$\&\.\+\-\^\_]{1,127}\/[a-z0-9\!\#\$\&\.\+\-\^\_]{1,127}/i)) {
                    throw new Error("'" + mime + "' is not a valid MimeType format");
                }

                _mime = mime;
            }
        },
        data: {
            get: function () {
                return _data;
            },
            set: function (data) {
                if (Util.isString(data)) {
                    data = Util.str2ab(data);
                }

                _data = data;
            }
        },
        chunks: {
            get: function () {
                return _chunks;
            },
            set: function (value) {
                if (null === value) {
                    _chunks = [];
                    return;
                }

                throw new Error('Cannot set chunks directly, use addChunk instead');
            }
        }
    });
};

Message.prototype = {

    /**
     * Gets size of the data
     *
     * @returns {Number} Size of the data in bytes
     */
    size: function () {
        var me = this;

        return me.data.byteLength;
    },

    /**
     * Append data to the message
     *
     * @param   {ArrayBuffer} data  Data to append
     * @returns {void}
     */
    append: function (data) {
        var me = this;

        if (Util.isString(data)) {
            data = Util.str2ab(data);
        }

        me.data = Util.abAppend(me.data, data);
    },

    /**
     *
     * @param   {Number}      index
     * @param   {ArrayBuffer} chunk
     * @returns {void}
     */
    addChunk: function (index, chunk) {
        var me = this,
            c;

        if (!Util.isNumeric(index)) {
            throw new TypeError('index is not numeric');
        }

        if (!Util.isArrayBuffer(chunk)) {
            throw new TypeError('chunk is not an ArrayBuffer');
        }

        me.chunks[index] = chunk;

        if (me.complete) {
            me.data = new ArrayBuffer(0);

            me.chunks.forEach(function (el, i, arr) {
                var me = this;
                me.append(el);
            }, me);

            me.chunks = null;
        }
    }
};

/**
 * The message were sending over the line is an array buffer that includes
 * some metadata such as uuid and mime type etc. This means we can't chop the
 * message at an arbitrary length. Also the other side needs to know
 * how many chunk it's going to receive per message as well as which chunk
 * it's currently dealing with.
 * In order to do this we look at how much data the message contains that
 * is _not_ part of the content, in other words, overhead. We subtract that
 * from the chunk size to calculate how much of the content we can
 * stuff into one chunk without exceeding the chunk size.
 * We can then use that to determine how many chunk we'll be needing.
 * Now we loop as many times as we need chunks and return an array buffer
 * containing a part of the content.
 *
 * @returns {ArrayBuffer}
 */
Message.prototype[Symbol.iterator] = function* () {
    var me         = this,
        size       = me.size(),
        dataSize   = Message.CHUNKSIZE - 566,
        chunkCnt   = Math.ceil(size / dataSize),
        buffer     = new ArrayBuffer(Message.CHUNKSIZE),
        uuid       = new Uint8Array(buffer, 0, 36),
        type       = new Uint8Array(buffer, 36, 4),
        chunkCount = new Uint8Array(buffer, 40, 8),
        chunkNr    = new Uint8Array(buffer, 48, 8),
        name       = new Uint8Array(buffer, 56, 255),
        mime       = new Uint8Array(buffer, 311, 255),
        data       = new Uint8Array(buffer, 566),
        i          = 0,
        j;

    for (j = 0; j < size; j += dataSize, i++) {
        uuid.set( new Uint8Array(Util.str2ab(me.uuid)) );
        type.set( new Uint8Array(Util.str2ab(me.type)) );

        chunkCount.set( Util.nr2ba(chunkCnt) );
        chunkNr.set( Util.nr2ba(i) );

        name.set( new Uint8Array(Util.str2ab(me.name)) );
        mime.set( new Uint8Array(Util.str2ab(me.mime)) );
        data.set( new Uint8Array(me.data.slice(j, j + dataSize)) );

        yield buffer;
    }
};

/**
 * Parse buffer into message.
 * The format looks als follows:
 *
 * [ uuid | type | chunknr | countcnt | filename | data  ]
 * [  36  |  4   |    8    |     8    |    255   | 65221 ]
 *
 * @static
 * @param   {ArrayBuffer} buffer
 * @return  {Message}
 */
Message.parse = function (buffer) {
    var message = new Message(Util.ab2str(buffer.slice(0, 36)));

    message.type       = Util.ab2str(buffer.slice(36, 40));
    message.chunkCount = Util.ba2nr( new Uint8Array(buffer.slice(40, 48)) );
    message.chunkNr    = Util.ba2nr( new Uint8Array(buffer.slice(48, 56)) );
    message.name       = Util.ab2str(buffer.slice(56, 311));
    message.mime       = Util.ab2str(buffer.slice(311, 566));
    message.data       = buffer.slice(566);

    return message;
};

Message.CHUNKSIZE = 65536;  // 64k
Message.TYPE_TEXT = 'text';
Message.TYPE_FILE = 'file';
