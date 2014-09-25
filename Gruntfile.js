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

        jshint: {
            all: [
                './Gruntfile.js',
                './karma.conf.js',
                './index.js',
                './src/ZogsRTC/**/*.js',
                './src/ZogsRTC.js'
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

        develop: {
            server: {
                file: './index.js'
            }
        },

        karma: {
            unit: {
                configFile: './karma.conf.js',
                reporters : ['coverage', 'dots'],
                singleRun : true
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
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-develop');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-jsduck');

    // Default task(s).
    grunt.registerTask('default', ['develop']);

};
