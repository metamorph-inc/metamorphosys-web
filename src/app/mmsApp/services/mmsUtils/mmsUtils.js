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
    }
] );
