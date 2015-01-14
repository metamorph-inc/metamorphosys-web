/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module('mms.headerButtons', [])
    .controller('HeaderButtonsController', function ($scope, $rootScope, $mdDialog, $log, $http, $mdToast, $cookies) {

        $scope.openSubscribeDialog = function (ev) {

            function DialogController($scope, $mdDialog) {

                $scope.user = {};

                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.send = function (userFields) {

                    $mdDialog.hide(userFields);

                    if ($scope.user && $scope.user.email) {

                        $http.post('http://mmsapp.metamorphsoftware.com/subscribe', {
                            user: $scope.user.name,
                            email: $scope.user.email,
                            webgmeSid: $cookies.webgmeSid
                        }).success(function () {

                        }).
                            error(function (data, status) {
                                $log.error('Saving contact errored', data, status);
                            });

                        $mdToast.show(
                            $mdToast.simple()
                            .content('Your contact information was submitted. Thank you!')
                        );


                    }

                };
            }

            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/mmsApp/templates/subscribeDialog.html',
                targetEvent: ev
            })
                .then(function (fields) {
                    $log.debug('Subscription', fields);
                }, function () {
                    $log.debug('Subscription cancelled.');
                });

        };


        $rootScope.openHelpDialog = $scope.openHelpDialog = function (ev) {

            function DialogController($scope, $mdDialog) {

                $scope.user = {};

                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.close = function () {
                    $mdDialog.hide();
                };
            }

            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/mmsApp/templates/aboutDialog.html',
                targetEvent: ev
            })
                .then(function () {
                });
        };


        $scope.openShareDialog = function (ev) {

            function DialogController($scope, $mdDialog, $window) {

                $scope.designUrl = $window.location.href;

                $scope.mailtoUrl =
                    'mailto:?subject=Check out my ARA module design&body=' + $scope.designUrl;

                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.close = function () {
                    $mdDialog.hide();
                };
            }

            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/mmsApp/templates/shareDialog.html',
                targetEvent: ev
            })
                .then(function () {
                });
        };


    })
    .directive('headerButtons', ['$rootScope',
        function () {

            return {
                controller: 'HeaderButtonsController',
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/headerButtons.html'
            };
        }]);
