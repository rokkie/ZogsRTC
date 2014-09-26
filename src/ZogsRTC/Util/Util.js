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
 */
(function (module) {
    var enumerables = [
        //'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
        'valueOf', 'toLocaleString', 'toString', 'constructor'
    ];

    /**
     * This is shamelessly copied from Sencha's ExtJS
     *
     * Copies all the properties of `config` to the specified `object`. There are two levels
     * of defaulting supported:
     *
     *      Ext.apply(obj, { a: 1 }, { a: 2 });
     *      //obj.a === 1
     *
     *      Ext.apply(obj, {  }, { a: 2 });
     *      //obj.a === 2
     * 
     * @param {Object} object The receiver of the properties.
     * @param {Object} config The primary source of the properties.
     * @param {Object} [defaults] An object that will also be applied for default values.
     * @return {Object} returns `object`.
     */
    copy = function(object, config, defaults) {
        if (defaults) {
            copy(object, defaults);
        }

        if (object && config && typeof config === 'object') {
            var i, j, k;

            for (i in config) {
                object[i] = config[i];
            }

            if (enumerables) {
                for (j = enumerables.length; j--;) {
                    k = enumerables[j];
                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }

        return object;
    };

    module.exports = {
        copy: copy
    };
}(module));
