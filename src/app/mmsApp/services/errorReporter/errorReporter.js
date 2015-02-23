/*globals angular*/

'use strict';

angular.module('mms.errorReporter', [])
    .service('errorReporter', [ '$log',
        function ($log) {

            var errors = [];

            this.log = function (e) {
                $log.error(e);
                errors.push(e);
            };

            this.flush = function() {

                var result;

                result = errors.slice(0);

                return result;

            };

        }
    ]);
