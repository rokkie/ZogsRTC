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

        clean: {
            docs: ['./docs/jsapi']
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
                tasks  : ['clean:docs'],
                src    : ['./src'],
                dest   : 'docs/jsapi',
                options: {
                    'builtin-classes': true,
                    'seo'            : true,
                    'title'          : "Zogs' WebRTC API docs"
                }
            }
        },

        develop: {
            server: {
                tasks  : ['node-inspector'],
                file    : './index.js',
                nodeArgs: ['--debug']
            }
        },

        'node-inspector': {
            dev: {
                options: {
                    'web-port'      : 8080,
                    'web-host'      : 'localhost',
                    'debug-port'    : 5857,
                    'save-live-edit': true,
                    'hidden'        : [
                        'docs',
                        'nbproject',
                        'node_modules',
                        'test'
                    ]
                }
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
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-develop');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-jsduck');
    grunt.loadNpmTasks('grunt-node-inspector');

    // Default task(s)
    grunt.registerTask('default', ['develop:server', 'node-inspector:dev', 'watch']);
    grunt.registerTask('coverage', ['env:coverage', 'instrument', 'nodeunit', 'storeCoverage', 'makeReport']);
};
