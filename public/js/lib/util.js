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
 * Utility functions
 *
 * @type Object
 */
var Util = (function () {

    var s4 = function () {
        var m = Math;

        return m.floor((1 + m.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };

    var encoder = new TextEncoder('utf-8');
    var decoder = new TextDecoder('utf-8');

    return {

        /**
         * Generate GUID
         *
         * @returns {string}
         */
        guid: function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' +
                   s4() + s4() + s4();
        },

        /**
         * Check if value is numeric
         *
         * @param   {Object} value
         * @returns {Boolean}
         */
        isNumeric: function (value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        /**
         * Check if value is string
         *
         * @param   {Object} value
         * @returns {Boolean}
         */
        isString: function(value) {
            return typeof value === 'string';
        },

        /**
         * Checks id object is ArrayBuffer
         *
         * @param   {Object} value
         * @returns {Boolean}
         */
        isArrayBuffer: function (value) {
            return (value.constructor && value.constructor === ArrayBuffer);
        },

        /**
         * Convert ArrayBuffer to String
         *
         * @param   {ArrayBuffer} ab
         * @returns {String}
         */
        ab2str: function (ab) {
            var view = new Uint8Array(ab);
            return decoder.decode(view);
        },

        /**
         * Convert String to ArrayBuffer
         *
         * @param   {String} str
         * @returns {ArrayBuffer}
         */
        str2ab: function (str) {
            var view = encoder.encode(str);
            return view.buffer.slice(0);
        },

        /**
         * Append one ArrayBuffer to another
         *
         * @param   {ArrayBuffer} a
         * @param   {ArrayBuffer} b
         * @returns {ArrayBuffer}
         */
        abAppend: function (a, b) {
            var len    = a.byteLength + b.byteLength,
                buffer = new ArrayBuffer(len),
                view   = new Uint8Array(buffer);

            view.set(new Uint8Array(a), 0);
            view.set(new Uint8Array(b), a.byteLength);

            return view.buffer;
        },

        /**
         * Convert number to byte array
         *
         * @param   {Number} value
         * @returns {Uint8Array}
         */
        nr2ba: function (value) {
            var uint8 = new Uint8Array(8),
                byte, i;

            for (i = 0; i < uint8.byteLength; i++) {
                byte = value & 0xff;
                uint8[i] = byte;
                value = (value - byte) / 256;
            }

            return uint8;
        },

        /**
         * Convert byte array to number
         *
         * @param   {Uint8Array} ba
         * @returns {Number}
         */
        ba2nr: function (ba) {
            var value = 0,
                i;

            for (i = ba.byteLength - 1; i >= 0; i--) {
                value = (value * 256) + (ba[i] * 1);
            }

            return value;
        }
    };

}());