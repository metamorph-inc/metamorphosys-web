/*globals angular*/

'use strict';

var inserter = require('./classes/simpleInsert.js');

angular.module('mms.utils', [])
    .service('mmsUtils', [
        function() {

            this.randomString = function(length) {
                var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

                if (!length) {
                    length = Math.floor(Math.random() * chars.length);
                }

                var str = '';
                for (var i = 0; i < length; i++) {
                    str += chars[Math.floor(Math.random() * chars.length)];
                }
                return str;
            };

            this.encodeGMEIdsForUIRouting = function(gmeId) {

                return gmeId.replace(/\//g, '\\');

            };

            this.decodeGMEIdsForUIRouting = function(gmeId) {

                return gmeId.replace(/\\/g, '/');

            };


            this.findByIdInArray = function(array, id) {
                return array.find(function(a) {
                    return a.id !== undefined && a.id === id;
                });
            };

            this.getRandomElementFromArray = function(array) {
                return array[Math.round(Math.random() * (array.length - 1))];
            };

            this.shuffleArray = function(array) {
                var currentIndex = array.length,
                    temporaryValue, randomIndex;

                // While there remain elements to shuffle...
                while (currentIndex !== 0) {

                    // Pick a remaining element...
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;

                    // And swap it with the current element.
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }

                return array;
            };

            this.ifNotFromInput = function(event) {

                var d,
                    result = true;

                d = event.srcElement || event.target;

                if (d.tagName) {

                    if ((d.tagName.toUpperCase() === 'INPUT' &&
                            (
                                d.type.toUpperCase() === 'TEXT' ||
                                d.type.toUpperCase() === 'PASSWORD' ||
                                d.type.toUpperCase() === 'FILE' ||
                                d.type.toUpperCase() === 'EMAIL' ||
                                d.type.toUpperCase() === 'SEARCH' ||
                                d.type.toUpperCase() === 'DATE')
                        ) ||
                        d.tagName.toUpperCase() === 'TEXTAREA') {
                        result = d.readOnly || d.disabled;
                    }
                }

                return result;

            };

            this.getPositionFromEvent = function(event) {
                var position,
                    x,
                    y;
                if (event) {

                    // FireFox offset is incorrectly smaller, layer matches that of Chrome
                    if (event.offsetX && event.layerX) {
                        x = Math.max(event.offsetX, event.layerX);
                        y = Math.max(event.offsetY, event.layerY);
                    }

                    x = x || 100;
                    y = y || 100;

                    position = {
                        x: x - 20,
                        y: y - 20
                    };

                }

                return position;
            };


            this.inserter = inserter;

        }
    ]);
