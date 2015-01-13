/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.socialMediaButtons', [ 'djds4rce.angular-socialshare' ] )
    .run(function($FB){
        $FB.init('YOUR_APPID');
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
                templateUrl: '/mmsApp/templates/socialMediaButtons.html'
            };
        }] );
