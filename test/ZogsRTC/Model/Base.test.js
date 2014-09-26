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
    var Base          = requireHelper('./src/ZogsRTC/Model/Base.js');

    var baseShouldRequireObjectLiteralAsConstructorArgument = function (t) {
        t.throws(function () {
            var base = new Base();
        }, TypeError, 'Base accepted constructor being called without arguments');

        t.throws(function () {
            var arg  = 'foo';
            var base = new Base(arg);
        }, TypeError, 'Base accepted a string as argument, only object literals are allowed');

        t.done();
    };

    var baseShouldNotAllowBlankName = function (t) {
        t.throws(function () {
            var base = new Base({});
        }, Error, 'Base should not allow the name to be undefined after construction');

        t.done();
    };

    var baseNameShouldBeString = function (t) {
        t.throws(function () {
            var base = new Base({
                name: 123
            });
        }, Error, 'Name should only accept string values');

        t.done();
    };

    var baseShouldSetName = function (t) {
        var name = 'foobar';
        var base = new Base({
            name: name
        });

        t.equal(name, base.name, 'Base should set the first constructor argument as name');
        t.done();
    };

    var baseShouldNotAllowNameChange = function (t) {
        t.throws(function () {
            var name1 = 'foo';
            var name2 = 'bar';
            var base  = new Base({
                name: name1
            });
            base.name = name2;
        }, Error, 'Base should not allow the name to change after it was initially set');

        t.done();
    };

    var baseShouldNotAllowIllegalCharactersInName = function (t) {
        t.throws(function () {
            var name = 'foo**bar';
            var base = new Base({
                name: name
            });
        }, Error, 'Base should only allow alphanumeric, dashes and underscores as valid characters for the name');

        t.done();
    };

    module.exports = {
        baseShouldRequireObjectLiteralAsConstructorArgument: baseShouldRequireObjectLiteralAsConstructorArgument,
        baseShouldNotAllowBlankName                        : baseShouldNotAllowBlankName,
        baseNameShouldBeString                             : baseNameShouldBeString,
        baseShouldSetName                                  : baseShouldSetName,
        baseShouldNotAllowNameChange                       : baseShouldNotAllowNameChange,
        baseShouldNotAllowIllegalCharactersInName          : baseShouldNotAllowIllegalCharactersInName
    };
}(module));
