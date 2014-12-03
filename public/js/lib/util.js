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
         * @param   {mixed} n
         * @returns {Boolean}
         */
        isNumeric: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        /**
         * Convert ArrayBuffer to String
         *
         * @param   {ArrayBuffer} ab
         * @returns {String}
         */
        ab2str: function (ab) {
            var view = new DataView(ab);
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
        }
    };

}());