/*globals angular*/

'use strict';

angular.module('mms.utils', [])
    .service( 'mmsUtils', [
    function () {

        this.randomString = function (length) {
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

    }
] );
