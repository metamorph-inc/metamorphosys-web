/*globals angular, gapi*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.socialMediaButtons', [ 'djds4rce.angular-socialshare' ] )
    .run(function($FB){
        $FB.init('1517886365166675');
    })
    .controller('SocialMediaButtonsController', function(){


    })
    .directive( 'socialMediaButtons', [ '$rootScope',
        function () {

            return {
                controller: 'SocialMediaButtonsController',
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/socialMediaButtons.html',
                link: function() {
                    if (gapi !== undefined) {
                        gapi.plus.go();
                    }
                }
            };
        }] );
