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

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        env: {
            coverage: {
                INSTRUMENT_DIR: './test/instrument/'
            }
        },

        jshint: {
            all: [
                './Gruntfile.js',
                './index.js',
                './src/ZogsRTC/**/*.js',
                './src/ZogsRTC.js',
                './test/ZogsRTC/**/*.js',
                './test/ZogsRTC.js'
            ]
        },

        watch: {
            js: {
                tasks  : ['develop'],
                options: {
                    nospawn: true
                },
                files  : [
                    './index.js',
                    './src/ZogsRTC/**/*.js',
                    './src/ZogsRTC.js'
                ]
            }
        },

        jsduck: {
            main: {
                src    : ['./src'],
                dest   : 'docs/api',
                options: {
                    'builtin-classes': true,
                    'seo'            : true,
                    'title'          : "Zogs' WebRTC API docs"
                }
            }
        },

        develop: {
            server: {
                file: './index.js'
            }
        },

        instrument: {
            files  : './src/**/*.js',
            options: {
                lazy    : true,
                basePath: './test/instrument/'
            }
        },

        nodeunit: {
            all    : ['./test/**/*.test.js'],
            options: {
                reporter: 'default'
            }
        },

        storeCoverage: {
            options: {
                dir: './test/coverage/'
            }
        },

        makeReport: {
            src    : './test/coverage/**/*.json',
            options: {
                type : 'lcov',
                dir  : './test/coverage/',
                print: 'detail'
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-develop');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-jsduck');

    // Default task(s).
    grunt.registerTask('default', ['develop']);
    grunt.registerTask('coverage', ['env:coverage', 'instrument', 'nodeunit', 'storeCoverage', 'makeReport']);

};
