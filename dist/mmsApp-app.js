(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular*/

'use strict';

require('./libraryIncludes.js');

require('./utils.js');

require('./services/operationsManager/operationsManager.js');

require('./services/diagramService/diagramService.js');
require('./services/gridService/gridService.js');
require('./services/wiringService/wiringService.js');

require('./directives/diagramContainer/diagramContainer.js');
require('./directives/fabricCanvas/fabricCanvas.js');
require('./directives/svgDiagram/svgDiagram.js');

require('./directives/symbols/componentSymbol.js');

require('./directives/resizing/resizeToHeight.js');
require('./directives/resizing/resizeToWindow.js');

require('./directives/busyCover/busyCover.js');

require('./directives/designEditor/designEditor');

var CyPhyApp = angular.module('CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.mmsApp.templates',

    'ui.bootstrap',

    'mms.designVisualization.operationsManager',
    'mms.designVisualization.wiringService',
    'mms.designVisualization.diagramService',

    'mms.designVisualization.diagramContainer',
    'mms.designVisualization.fabricCanvas',
    'mms.designVisualization.svgDiagram',
    'mms.designVisualization.symbols',
    'mms.resizeToWindow',
    'mms.designVisualization.busyCover',
    'mms.designVisualization.designEditor',

    'angucomplete-alt',
    'ngTouch',

    'ngMaterial'
]);

CyPhyApp.config(function ($stateProvider, $urlRouterProvider) {

    var selectProject;

    selectProject = {
        load: function ($q, $stateParams, $rootScope, $state, $log, dataStoreService, projectService, workspaceService, designService, $timeout) {
            var
                connectionId,
                deferred;

            $rootScope.mainDbConnectionId = 'mms-main-db-connection-id';

            connectionId = $rootScope.mainDbConnectionId;
            deferred = $q.defer();

            $rootScope.loading = true;

            dataStoreService.connectToDatabase(connectionId, {
                host: window.location.basename
            })
                .then(function () {
                    $timeout(function () {
                        projectService.selectProject(connectionId, $stateParams.projectId)
                            .then(function (projectId) {
                                $log.debug('Project selected', projectId);

                                $rootScope.projectId = projectId;
                            });

                    });

                    var wsContext;


                    wsContext = {
                        db: $rootScope.mainDbConnectionId,
                        regionId: 'WorkSpaces_' + ( new Date() )
                            .toISOString()
                    };

                    $rootScope.$on('$destroy', function () {
                        workspaceService.cleanUpAllRegions(wsContext);
                    });


                    workspaceService.registerWatcher(wsContext, function (destroyed) {

                        $log.debug('WorkSpace watcher initialized, destroyed:', destroyed);

                        if (destroyed !== true) {
                            workspaceService.watchWorkspaces(wsContext,function (updateObject) {

                                if (updateObject.type === 'load') {
                                    console.log('load', updateObject);
                                } else if (updateObject.type === 'update') {
                                    console.log('update', updateObject);
                                } else if (updateObject.type === 'unload') {
                                    console.log('unload', updateObject);
                                } else {
                                    throw new Error(updateObject);

                                }

                            }).then(function (data) {

                                var hasFoundFirstWorkspace,
                                    hasFoundFirstDesign;

                                hasFoundFirstWorkspace = false;
                                hasFoundFirstDesign = false;


                                angular.forEach(data.workspaces, function (workSpace) {

                                    if (!hasFoundFirstWorkspace) {

                                        hasFoundFirstWorkspace = true;
                                        $rootScope.activeWorkSpace = workSpace;
                                        $log.debug('Active workspace:', $rootScope.activeWorkSpace);


                                    }

                                });

                                if (hasFoundFirstWorkspace) {

                                    designService.watchDesigns(wsContext, $rootScope.activeWorkSpace.id,function (/*designsUpdateObject*/) {

                                    }).then(function (designsData) {

                                        angular.forEach(designsData.designs, function (design) {

                                            if (!hasFoundFirstDesign) {

                                                hasFoundFirstDesign = true;
                                                $rootScope.activeDesign = design;
                                                $log.debug('Active design:', $rootScope.activeDesign);

                                            }

                                        });


                                        if (hasFoundFirstDesign) {

//                                            designService.watchInterfaces(wsContext, $rootScope.activeDesign.id, function(designInterfacesUpdateObject) {
//
//                                            }).then(function(designInterfaces) {
//
//                                                console.log(designInterfaces);
//
//                                            });


                                            deferred.resolve();
                                            $rootScope.loading = false;

                                        } else {

                                            $rootScope.loading = false;

                                            $log.debug('Could not find designs in workspace.');
                                            $state.go('404', {
                                                projectId: $stateParams.projectId
                                            });

                                            deferred.reject();
                                        }

                                    });

                                } else {

                                    $rootScope.loading = false;

                                    $log.debug('Could not find workspaces in project.');
                                    $state.go('404', {
                                        projectId: $stateParams.projectId
                                    });

                                    deferred.reject();

                                }

                            });

                        } else {
                            $log.debug('WokrspaceService destroyed...');
                        }
                    });

                }).catch(function (reason) {
                    $rootScope.loading = false;
                    $log.debug('Opening project errored:', $stateParams.projectId, reason);
                    $state.go('404', {
                        projectId: $stateParams.projectId
                    });
                });

            return deferred.promise;
        }
    };

    $urlRouterProvider.otherwise('/noProject');


    $stateProvider
        .state('editor', {
            url: '/editor/:projectId',
            templateUrl: '/mmsApp/templates/editor.html',
            resolve: selectProject,
            controller: 'EditorViewController'
        })
        .state('editor.inContainer', {
            url: '/:containerId'
        })
        .state('noProject', {
            url: '/noProject',
            templateUrl: '/mmsApp/templates/noProjectSpecified.html',
            controller: 'NoProjectController'
        })
        .state('404', {
            url: '/404/:projectId',
            controller: 'NoProjectController',
            templateUrl: '/mmsApp/templates/404.html'
        });
});

CyPhyApp.controller('MainNavigatorController', function ($rootScope, $scope, $window) {

    var defaultNavigatorItems;

    defaultNavigatorItems = [
        {
            id: 'root',
            label: 'MetaMorphosis',
            itemClass: 'cyphy-root'
        }
    ];

    $scope.navigator = {
        separator: true,
        items: angular.copy(defaultNavigatorItems, [])
    };

    $rootScope.$watch('projectId', function (projectId) {

        if (projectId) {

            $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
            $scope.navigator.items.push({
                id: 'project',
                label: projectId,
                action: function () {
                    $window.open('/?project=' + projectId);
                }
            });

        } else {
            $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
        }

    });

});

CyPhyApp.controller('EditorViewController', function () {

});

CyPhyApp.controller('NoProjectController', function ($rootScope, $scope, $stateParams, $http, $log, $state, growl) {

    $scope.projectId = $stateParams.projectId;
    $scope.errored = false;

    $scope.startNewProject = function () {

        $rootScope.processing = true;

        $log.debug('New project creation');

        $http.get('/rest/external/copyproject/noredirect')
            .
            success(function (data) {

                $rootScope.processing = false;
                $log.debug('New project creation successful', data);
                $state.go('editor', {
                    projectId: data
                });

            })
            .
            error(function (data, status) {

                $log.debug('New project creation failed', status);
                $rootScope.processing = false;
                growl.error('An error occured while project creation. Please retry later.');

            });

    };

});

},{"./directives/busyCover/busyCover.js":4,"./directives/designEditor/designEditor":7,"./directives/diagramContainer/diagramContainer.js":9,"./directives/fabricCanvas/fabricCanvas.js":11,"./directives/resizing/resizeToHeight.js":13,"./directives/resizing/resizeToWindow.js":14,"./directives/svgDiagram/svgDiagram.js":19,"./directives/symbols/componentSymbol.js":22,"./libraryIncludes.js":28,"./services/diagramService/diagramService.js":35,"./services/gridService/gridService.js":36,"./services/operationsManager/operationsManager.js":37,"./services/wiringService/wiringService.js":41,"./utils.js":42}],2:[function(require,module,exports){
// Array.prototype.find - MIT License (c) 2013 Paul Miller <http://paulmillr.com>
// For all details and docs: https://github.com/paulmillr/array.prototype.find
// Fixes and tests supplied by Duncan Hall <http://duncanhall.net> 
(function(globals){
  if (Array.prototype.find) return;

  var find = function(predicate) {
    var list = Object(this);
    var length = list.length < 0 ? 0 : list.length >>> 0; // ES.ToUint32;
    if (length === 0) return undefined;
    if (typeof predicate !== 'function' || Object.prototype.toString.call(predicate) !== '[object Function]') {
      throw new TypeError('Array#find: predicate must be a function');
    }
    var thisArg = arguments[1];
    for (var i = 0, value; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) return value;
    }
    return undefined;
  };

  if (Object.defineProperty) {
    try {
      Object.defineProperty(Array.prototype, 'find', {
        value: find, configurable: true, enumerable: false, writable: true
      });
    } catch(e) {}
  }

  if (!Array.prototype.find) {
    Array.prototype.find = find;
  }
})(this);

},{}],3:[function(require,module,exports){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.1
 */
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
(function(e){"use strict";var t={};typeof exports=="undefined"?typeof define=="function"&&typeof define.amd=="object"&&define.amd?(t.exports={},define(function(){return t.exports})):t.exports=typeof window!="undefined"?window:e:t.exports=exports,function(e){if(!t)var t=1e-6;if(!n)var n=typeof Float32Array!="undefined"?Float32Array:Array;if(!r)var r=Math.random;var i={};i.setMatrixArrayType=function(e){n=e},typeof e!="undefined"&&(e.glMatrix=i);var s=Math.PI/180;i.toRadian=function(e){return e*s};var o={};o.create=function(){var e=new n(2);return e[0]=0,e[1]=0,e},o.clone=function(e){var t=new n(2);return t[0]=e[0],t[1]=e[1],t},o.fromValues=function(e,t){var r=new n(2);return r[0]=e,r[1]=t,r},o.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e},o.set=function(e,t,n){return e[0]=t,e[1]=n,e},o.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e},o.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e},o.sub=o.subtract,o.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e},o.mul=o.multiply,o.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e},o.div=o.divide,o.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e},o.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e},o.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e},o.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e},o.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1];return Math.sqrt(n*n+r*r)},o.dist=o.distance,o.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1];return n*n+r*r},o.sqrDist=o.squaredDistance,o.length=function(e){var t=e[0],n=e[1];return Math.sqrt(t*t+n*n)},o.len=o.length,o.squaredLength=function(e){var t=e[0],n=e[1];return t*t+n*n},o.sqrLen=o.squaredLength,o.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e},o.normalize=function(e,t){var n=t[0],r=t[1],i=n*n+r*r;return i>0&&(i=1/Math.sqrt(i),e[0]=t[0]*i,e[1]=t[1]*i),e},o.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]},o.cross=function(e,t,n){var r=t[0]*n[1]-t[1]*n[0];return e[0]=e[1]=0,e[2]=r,e},o.lerp=function(e,t,n,r){var i=t[0],s=t[1];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e},o.random=function(e,t){t=t||1;var n=r()*2*Math.PI;return e[0]=Math.cos(n)*t,e[1]=Math.sin(n)*t,e},o.transformMat2=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[2]*i,e[1]=n[1]*r+n[3]*i,e},o.transformMat2d=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[2]*i+n[4],e[1]=n[1]*r+n[3]*i+n[5],e},o.transformMat3=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[3]*i+n[6],e[1]=n[1]*r+n[4]*i+n[7],e},o.transformMat4=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[4]*i+n[12],e[1]=n[1]*r+n[5]*i+n[13],e},o.forEach=function(){var e=o.create();return function(t,n,r,i,s,o){var u,a;n||(n=2),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],s(e,e,o),t[u]=e[0],t[u+1]=e[1];return t}}(),o.str=function(e){return"vec2("+e[0]+", "+e[1]+")"},typeof e!="undefined"&&(e.vec2=o);var u={};u.create=function(){var e=new n(3);return e[0]=0,e[1]=0,e[2]=0,e},u.clone=function(e){var t=new n(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t},u.fromValues=function(e,t,r){var i=new n(3);return i[0]=e,i[1]=t,i[2]=r,i},u.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e},u.set=function(e,t,n,r){return e[0]=t,e[1]=n,e[2]=r,e},u.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e},u.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e},u.sub=u.subtract,u.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e[2]=t[2]*n[2],e},u.mul=u.multiply,u.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e[2]=t[2]/n[2],e},u.div=u.divide,u.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e[2]=Math.min(t[2],n[2]),e},u.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e[2]=Math.max(t[2],n[2]),e},u.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e},u.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e},u.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return Math.sqrt(n*n+r*r+i*i)},u.dist=u.distance,u.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return n*n+r*r+i*i},u.sqrDist=u.squaredDistance,u.length=function(e){var t=e[0],n=e[1],r=e[2];return Math.sqrt(t*t+n*n+r*r)},u.len=u.length,u.squaredLength=function(e){var t=e[0],n=e[1],r=e[2];return t*t+n*n+r*r},u.sqrLen=u.squaredLength,u.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e},u.normalize=function(e,t){var n=t[0],r=t[1],i=t[2],s=n*n+r*r+i*i;return s>0&&(s=1/Math.sqrt(s),e[0]=t[0]*s,e[1]=t[1]*s,e[2]=t[2]*s),e},u.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]},u.cross=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2];return e[0]=i*a-s*u,e[1]=s*o-r*a,e[2]=r*u-i*o,e},u.lerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e[2]=o+r*(n[2]-o),e},u.random=function(e,t){t=t||1;var n=r()*2*Math.PI,i=r()*2-1,s=Math.sqrt(1-i*i)*t;return e[0]=Math.cos(n)*s,e[1]=Math.sin(n)*s,e[2]=i*t,e},u.transformMat4=function(e,t,n){var r=t[0],i=t[1],s=t[2];return e[0]=n[0]*r+n[4]*i+n[8]*s+n[12],e[1]=n[1]*r+n[5]*i+n[9]*s+n[13],e[2]=n[2]*r+n[6]*i+n[10]*s+n[14],e},u.transformMat3=function(e,t,n){var r=t[0],i=t[1],s=t[2];return e[0]=r*n[0]+i*n[3]+s*n[6],e[1]=r*n[1]+i*n[4]+s*n[7],e[2]=r*n[2]+i*n[5]+s*n[8],e},u.transformQuat=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2],f=n[3],l=f*r+u*s-a*i,c=f*i+a*r-o*s,h=f*s+o*i-u*r,p=-o*r-u*i-a*s;return e[0]=l*f+p*-o+c*-a-h*-u,e[1]=c*f+p*-u+h*-o-l*-a,e[2]=h*f+p*-a+l*-u-c*-o,e},u.rotateX=function(e,t,n,r){var i=[],s=[];return i[0]=t[0]-n[0],i[1]=t[1]-n[1],i[2]=t[2]-n[2],s[0]=i[0],s[1]=i[1]*Math.cos(r)-i[2]*Math.sin(r),s[2]=i[1]*Math.sin(r)+i[2]*Math.cos(r),e[0]=s[0]+n[0],e[1]=s[1]+n[1],e[2]=s[2]+n[2],e},u.rotateY=function(e,t,n,r){var i=[],s=[];return i[0]=t[0]-n[0],i[1]=t[1]-n[1],i[2]=t[2]-n[2],s[0]=i[2]*Math.sin(r)+i[0]*Math.cos(r),s[1]=i[1],s[2]=i[2]*Math.cos(r)-i[0]*Math.sin(r),e[0]=s[0]+n[0],e[1]=s[1]+n[1],e[2]=s[2]+n[2],e},u.rotateZ=function(e,t,n,r){var i=[],s=[];return i[0]=t[0]-n[0],i[1]=t[1]-n[1],i[2]=t[2]-n[2],s[0]=i[0]*Math.cos(r)-i[1]*Math.sin(r),s[1]=i[0]*Math.sin(r)+i[1]*Math.cos(r),s[2]=i[2],e[0]=s[0]+n[0],e[1]=s[1]+n[1],e[2]=s[2]+n[2],e},u.forEach=function(){var e=u.create();return function(t,n,r,i,s,o){var u,a;n||(n=3),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],e[2]=t[u+2],s(e,e,o),t[u]=e[0],t[u+1]=e[1],t[u+2]=e[2];return t}}(),u.str=function(e){return"vec3("+e[0]+", "+e[1]+", "+e[2]+")"},typeof e!="undefined"&&(e.vec3=u);var a={};a.create=function(){var e=new n(4);return e[0]=0,e[1]=0,e[2]=0,e[3]=0,e},a.clone=function(e){var t=new n(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},a.fromValues=function(e,t,r,i){var s=new n(4);return s[0]=e,s[1]=t,s[2]=r,s[3]=i,s},a.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},a.set=function(e,t,n,r,i){return e[0]=t,e[1]=n,e[2]=r,e[3]=i,e},a.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e[3]=t[3]+n[3],e},a.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e[3]=t[3]-n[3],e},a.sub=a.subtract,a.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e[2]=t[2]*n[2],e[3]=t[3]*n[3],e},a.mul=a.multiply,a.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e[2]=t[2]/n[2],e[3]=t[3]/n[3],e},a.div=a.divide,a.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e[2]=Math.min(t[2],n[2]),e[3]=Math.min(t[3],n[3]),e},a.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e[2]=Math.max(t[2],n[2]),e[3]=Math.max(t[3],n[3]),e},a.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e[3]=t[3]*n,e},a.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e[3]=t[3]+n[3]*r,e},a.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2],s=t[3]-e[3];return Math.sqrt(n*n+r*r+i*i+s*s)},a.dist=a.distance,a.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2],s=t[3]-e[3];return n*n+r*r+i*i+s*s},a.sqrDist=a.squaredDistance,a.length=function(e){var t=e[0],n=e[1],r=e[2],i=e[3];return Math.sqrt(t*t+n*n+r*r+i*i)},a.len=a.length,a.squaredLength=function(e){var t=e[0],n=e[1],r=e[2],i=e[3];return t*t+n*n+r*r+i*i},a.sqrLen=a.squaredLength,a.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e[3]=-t[3],e},a.normalize=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*n+r*r+i*i+s*s;return o>0&&(o=1/Math.sqrt(o),e[0]=t[0]*o,e[1]=t[1]*o,e[2]=t[2]*o,e[3]=t[3]*o),e},a.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]+e[3]*t[3]},a.lerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2],u=t[3];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e[2]=o+r*(n[2]-o),e[3]=u+r*(n[3]-u),e},a.random=function(e,t){return t=t||1,e[0]=r(),e[1]=r(),e[2]=r(),e[3]=r(),a.normalize(e,e),a.scale(e,e,t),e},a.transformMat4=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3];return e[0]=n[0]*r+n[4]*i+n[8]*s+n[12]*o,e[1]=n[1]*r+n[5]*i+n[9]*s+n[13]*o,e[2]=n[2]*r+n[6]*i+n[10]*s+n[14]*o,e[3]=n[3]*r+n[7]*i+n[11]*s+n[15]*o,e},a.transformQuat=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2],f=n[3],l=f*r+u*s-a*i,c=f*i+a*r-o*s,h=f*s+o*i-u*r,p=-o*r-u*i-a*s;return e[0]=l*f+p*-o+c*-a-h*-u,e[1]=c*f+p*-u+h*-o-l*-a,e[2]=h*f+p*-a+l*-u-c*-o,e},a.forEach=function(){var e=a.create();return function(t,n,r,i,s,o){var u,a;n||(n=4),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],e[2]=t[u+2],e[3]=t[u+3],s(e,e,o),t[u]=e[0],t[u+1]=e[1],t[u+2]=e[2],t[u+3]=e[3];return t}}(),a.str=function(e){return"vec4("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},typeof e!="undefined"&&(e.vec4=a);var f={};f.create=function(){var e=new n(4);return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e},f.clone=function(e){var t=new n(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},f.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},f.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e},f.transpose=function(e,t){if(e===t){var n=t[1];e[1]=t[2],e[2]=n}else e[0]=t[0],e[1]=t[2],e[2]=t[1],e[3]=t[3];return e},f.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*s-i*r;return o?(o=1/o,e[0]=s*o,e[1]=-r*o,e[2]=-i*o,e[3]=n*o,e):null},f.adjoint=function(e,t){var n=t[0];return e[0]=t[3],e[1]=-t[1],e[2]=-t[2],e[3]=n,e},f.determinant=function(e){return e[0]*e[3]-e[2]*e[1]},f.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1],f=n[2],l=n[3];return e[0]=r*u+s*a,e[1]=i*u+o*a,e[2]=r*f+s*l,e[3]=i*f+o*l,e},f.mul=f.multiply,f.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+s*u,e[1]=i*a+o*u,e[2]=r*-u+s*a,e[3]=i*-u+o*a,e},f.scale=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1];return e[0]=r*u,e[1]=i*u,e[2]=s*a,e[3]=o*a,e},f.str=function(e){return"mat2("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},f.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2))},f.LDU=function(e,t,n,r){return e[2]=r[2]/r[0],n[0]=r[0],n[1]=r[1],n[3]=r[3]-e[2]*n[1],[e,t,n]},typeof e!="undefined"&&(e.mat2=f);var l={};l.create=function(){var e=new n(6);return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e[4]=0,e[5]=0,e},l.clone=function(e){var t=new n(6);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t},l.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e},l.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e[4]=0,e[5]=0,e},l.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=n*s-r*i;return a?(a=1/a,e[0]=s*a,e[1]=-r*a,e[2]=-i*a,e[3]=n*a,e[4]=(i*u-s*o)*a,e[5]=(r*o-n*u)*a,e):null},l.determinant=function(e){return e[0]*e[3]-e[1]*e[2]},l.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=n[0],l=n[1],c=n[2],h=n[3],p=n[4],d=n[5];return e[0]=r*f+s*l,e[1]=i*f+o*l,e[2]=r*c+s*h,e[3]=i*c+o*h,e[4]=r*p+s*d+u,e[5]=i*p+o*d+a,e},l.mul=l.multiply,l.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=Math.sin(n),l=Math.cos(n);return e[0]=r*l+s*f,e[1]=i*l+o*f,e[2]=r*-f+s*l,e[3]=i*-f+o*l,e[4]=u,e[5]=a,e},l.scale=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=n[0],l=n[1];return e[0]=r*f,e[1]=i*f,e[2]=s*l,e[3]=o*l,e[4]=u,e[5]=a,e},l.translate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=n[0],l=n[1];return e[0]=r,e[1]=i,e[2]=s,e[3]=o,e[4]=r*f+s*l+u,e[5]=i*f+o*l+a,e},l.str=function(e){return"mat2d("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+")"},l.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2)+Math.pow(e[4],2)+Math.pow(e[5],2)+1)},typeof e!="undefined"&&(e.mat2d=l);var c={};c.create=function(){var e=new n(9);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1,e},c.fromMat4=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[4],e[4]=t[5],e[5]=t[6],e[6]=t[8],e[7]=t[9],e[8]=t[10],e},c.clone=function(e){var t=new n(9);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t},c.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e},c.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1,e},c.transpose=function(e,t){if(e===t){var n=t[1],r=t[2],i=t[5];e[1]=t[3],e[2]=t[6],e[3]=n,e[5]=t[7],e[6]=r,e[7]=i}else e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8];return e},c.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=l*o-u*f,h=-l*s+u*a,p=f*s-o*a,d=n*c+r*h+i*p;return d?(d=1/d,e[0]=c*d,e[1]=(-l*r+i*f)*d,e[2]=(u*r-i*o)*d,e[3]=h*d,e[4]=(l*n-i*a)*d,e[5]=(-u*n+i*s)*d,e[6]=p*d,e[7]=(-f*n+r*a)*d,e[8]=(o*n-r*s)*d,e):null},c.adjoint=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8];return e[0]=o*l-u*f,e[1]=i*f-r*l,e[2]=r*u-i*o,e[3]=u*a-s*l,e[4]=n*l-i*a,e[5]=i*s-n*u,e[6]=s*f-o*a,e[7]=r*a-n*f,e[8]=n*o-r*s,e},c.determinant=function(e){var t=e[0],n=e[1],r=e[2],i=e[3],s=e[4],o=e[5],u=e[6],a=e[7],f=e[8];return t*(f*s-o*a)+n*(-f*i+o*u)+r*(a*i-s*u)},c.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=n[0],p=n[1],d=n[2],v=n[3],m=n[4],g=n[5],y=n[6],b=n[7],w=n[8];return e[0]=h*r+p*o+d*f,e[1]=h*i+p*u+d*l,e[2]=h*s+p*a+d*c,e[3]=v*r+m*o+g*f,e[4]=v*i+m*u+g*l,e[5]=v*s+m*a+g*c,e[6]=y*r+b*o+w*f,e[7]=y*i+b*u+w*l,e[8]=y*s+b*a+w*c,e},c.mul=c.multiply,c.translate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=n[0],p=n[1];return e[0]=r,e[1]=i,e[2]=s,e[3]=o,e[4]=u,e[5]=a,e[6]=h*r+p*o+f,e[7]=h*i+p*u+l,e[8]=h*s+p*a+c,e},c.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=Math.sin(n),p=Math.cos(n);return e[0]=p*r+h*o,e[1]=p*i+h*u,e[2]=p*s+h*a,e[3]=p*o-h*r,e[4]=p*u-h*i,e[5]=p*a-h*s,e[6]=f,e[7]=l,e[8]=c,e},c.scale=function(e,t,n){var r=n[0],i=n[1];return e[0]=r*t[0],e[1]=r*t[1],e[2]=r*t[2],e[3]=i*t[3],e[4]=i*t[4],e[5]=i*t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e},c.fromMat2d=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=0,e[3]=t[2],e[4]=t[3],e[5]=0,e[6]=t[4],e[7]=t[5],e[8]=1,e},c.fromQuat=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n+n,u=r+r,a=i+i,f=n*o,l=r*o,c=r*u,h=i*o,p=i*u,d=i*a,v=s*o,m=s*u,g=s*a;return e[0]=1-c-d,e[3]=l-g,e[6]=h+m,e[1]=l+g,e[4]=1-f-d,e[7]=p-v,e[2]=h-m,e[5]=p+v,e[8]=1-f-c,e},c.normalFromMat4=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15],y=n*u-r*o,b=n*a-i*o,w=n*f-s*o,E=r*a-i*u,S=r*f-s*u,x=i*f-s*a,T=l*v-c*d,N=l*m-h*d,C=l*g-p*d,k=c*m-h*v,L=c*g-p*v,A=h*g-p*m,O=y*A-b*L+w*k+E*C-S*N+x*T;return O?(O=1/O,e[0]=(u*A-a*L+f*k)*O,e[1]=(a*C-o*A-f*N)*O,e[2]=(o*L-u*C+f*T)*O,e[3]=(i*L-r*A-s*k)*O,e[4]=(n*A-i*C+s*N)*O,e[5]=(r*C-n*L-s*T)*O,e[6]=(v*x-m*S+g*E)*O,e[7]=(m*w-d*x-g*b)*O,e[8]=(d*S-v*w+g*y)*O,e):null},c.str=function(e){return"mat3("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+", "+e[6]+", "+e[7]+", "+e[8]+")"},c.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2)+Math.pow(e[4],2)+Math.pow(e[5],2)+Math.pow(e[6],2)+Math.pow(e[7],2)+Math.pow(e[8],2))},typeof e!="undefined"&&(e.mat3=c);var h={};h.create=function(){var e=new n(16);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},h.clone=function(e){var t=new n(16);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},h.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},h.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},h.transpose=function(e,t){if(e===t){var n=t[1],r=t[2],i=t[3],s=t[6],o=t[7],u=t[11];e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=n,e[6]=t[9],e[7]=t[13],e[8]=r,e[9]=s,e[11]=t[14],e[12]=i,e[13]=o,e[14]=u}else e[0]=t[0],e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=t[1],e[5]=t[5],e[6]=t[9],e[7]=t[13],e[8]=t[2],e[9]=t[6],e[10]=t[10],e[11]=t[14],e[12]=t[3],e[13]=t[7],e[14]=t[11],e[15]=t[15];return e},h.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15],y=n*u-r*o,b=n*a-i*o,w=n*f-s*o,E=r*a-i*u,S=r*f-s*u,x=i*f-s*a,T=l*v-c*d,N=l*m-h*d,C=l*g-p*d,k=c*m-h*v,L=c*g-p*v,A=h*g-p*m,O=y*A-b*L+w*k+E*C-S*N+x*T;return O?(O=1/O,e[0]=(u*A-a*L+f*k)*O,e[1]=(i*L-r*A-s*k)*O,e[2]=(v*x-m*S+g*E)*O,e[3]=(h*S-c*x-p*E)*O,e[4]=(a*C-o*A-f*N)*O,e[5]=(n*A-i*C+s*N)*O,e[6]=(m*w-d*x-g*b)*O,e[7]=(l*x-h*w+p*b)*O,e[8]=(o*L-u*C+f*T)*O,e[9]=(r*C-n*L-s*T)*O,e[10]=(d*S-v*w+g*y)*O,e[11]=(c*w-l*S-p*y)*O,e[12]=(u*N-o*k-a*T)*O,e[13]=(n*k-r*N+i*T)*O,e[14]=(v*b-d*E-m*y)*O,e[15]=(l*E-c*b+h*y)*O,e):null},h.adjoint=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15];return e[0]=u*(h*g-p*m)-c*(a*g-f*m)+v*(a*p-f*h),e[1]=-(r*(h*g-p*m)-c*(i*g-s*m)+v*(i*p-s*h)),e[2]=r*(a*g-f*m)-u*(i*g-s*m)+v*(i*f-s*a),e[3]=-(r*(a*p-f*h)-u*(i*p-s*h)+c*(i*f-s*a)),e[4]=-(o*(h*g-p*m)-l*(a*g-f*m)+d*(a*p-f*h)),e[5]=n*(h*g-p*m)-l*(i*g-s*m)+d*(i*p-s*h),e[6]=-(n*(a*g-f*m)-o*(i*g-s*m)+d*(i*f-s*a)),e[7]=n*(a*p-f*h)-o*(i*p-s*h)+l*(i*f-s*a),e[8]=o*(c*g-p*v)-l*(u*g-f*v)+d*(u*p-f*c),e[9]=-(n*(c*g-p*v)-l*(r*g-s*v)+d*(r*p-s*c)),e[10]=n*(u*g-f*v)-o*(r*g-s*v)+d*(r*f-s*u),e[11]=-(n*(u*p-f*c)-o*(r*p-s*c)+l*(r*f-s*u)),e[12]=-(o*(c*m-h*v)-l*(u*m-a*v)+d*(u*h-a*c)),e[13]=n*(c*m-h*v)-l*(r*m-i*v)+d*(r*h-i*c),e[14]=-(n*(u*m-a*v)-o*(r*m-i*v)+d*(r*a-i*u)),e[15]=n*(u*h-a*c)-o*(r*h-i*c)+l*(r*a-i*u),e},h.determinant=function(e){var t=e[0],n=e[1],r=e[2],i=e[3],s=e[4],o=e[5],u=e[6],a=e[7],f=e[8],l=e[9],c=e[10],h=e[11],p=e[12],d=e[13],v=e[14],m=e[15],g=t*o-n*s,y=t*u-r*s,b=t*a-i*s,w=n*u-r*o,E=n*a-i*o,S=r*a-i*u,x=f*d-l*p,T=f*v-c*p,N=f*m-h*p,C=l*v-c*d,k=l*m-h*d,L=c*m-h*v;return g*L-y*k+b*C+w*N-E*T+S*x},h.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=t[9],p=t[10],d=t[11],v=t[12],m=t[13],g=t[14],y=t[15],b=n[0],w=n[1],E=n[2],S=n[3];return e[0]=b*r+w*u+E*c+S*v,e[1]=b*i+w*a+E*h+S*m,e[2]=b*s+w*f+E*p+S*g,e[3]=b*o+w*l+E*d+S*y,b=n[4],w=n[5],E=n[6],S=n[7],e[4]=b*r+w*u+E*c+S*v,e[5]=b*i+w*a+E*h+S*m,e[6]=b*s+w*f+E*p+S*g,e[7]=b*o+w*l+E*d+S*y,b=n[8],w=n[9],E=n[10],S=n[11],e[8]=b*r+w*u+E*c+S*v,e[9]=b*i+w*a+E*h+S*m,e[10]=b*s+w*f+E*p+S*g,e[11]=b*o+w*l+E*d+S*y,b=n[12],w=n[13],E=n[14],S=n[15],e[12]=b*r+w*u+E*c+S*v,e[13]=b*i+w*a+E*h+S*m,e[14]=b*s+w*f+E*p+S*g,e[15]=b*o+w*l+E*d+S*y,e},h.mul=h.multiply,h.translate=function(e,t,n){var r=n[0],i=n[1],s=n[2],o,u,a,f,l,c,h,p,d,v,m,g;return t===e?(e[12]=t[0]*r+t[4]*i+t[8]*s+t[12],e[13]=t[1]*r+t[5]*i+t[9]*s+t[13],e[14]=t[2]*r+t[6]*i+t[10]*s+t[14],e[15]=t[3]*r+t[7]*i+t[11]*s+t[15]):(o=t[0],u=t[1],a=t[2],f=t[3],l=t[4],c=t[5],h=t[6],p=t[7],d=t[8],v=t[9],m=t[10],g=t[11],e[0]=o,e[1]=u,e[2]=a,e[3]=f,e[4]=l,e[5]=c,e[6]=h,e[7]=p,e[8]=d,e[9]=v,e[10]=m,e[11]=g,e[12]=o*r+l*i+d*s+t[12],e[13]=u*r+c*i+v*s+t[13],e[14]=a*r+h*i+m*s+t[14],e[15]=f*r+p*i+g*s+t[15]),e},h.scale=function(e,t,n){var r=n[0],i=n[1],s=n[2];return e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r,e[3]=t[3]*r,e[4]=t[4]*i,e[5]=t[5]*i,e[6]=t[6]*i,e[7]=t[7]*i,e[8]=t[8]*s,e[9]=t[9]*s,e[10]=t[10]*s,e[11]=t[11]*s,e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},h.rotate=function(e,n,r,i){var s=i[0],o=i[1],u=i[2],a=Math.sqrt(s*s+o*o+u*u),f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A,O,M,_;return Math.abs(a)<t?null:(a=1/a,s*=a,o*=a,u*=a,f=Math.sin(r),l=Math.cos(r),c=1-l,h=n[0],p=n[1],d=n[2],v=n[3],m=n[4],g=n[5],y=n[6],b=n[7],w=n[8],E=n[9],S=n[10],x=n[11],T=s*s*c+l,N=o*s*c+u*f,C=u*s*c-o*f,k=s*o*c-u*f,L=o*o*c+l,A=u*o*c+s*f,O=s*u*c+o*f,M=o*u*c-s*f,_=u*u*c+l,e[0]=h*T+m*N+w*C,e[1]=p*T+g*N+E*C,e[2]=d*T+y*N+S*C,e[3]=v*T+b*N+x*C,e[4]=h*k+m*L+w*A,e[5]=p*k+g*L+E*A,e[6]=d*k+y*L+S*A,e[7]=v*k+b*L+x*A,e[8]=h*O+m*M+w*_,e[9]=p*O+g*M+E*_,e[10]=d*O+y*M+S*_,e[11]=v*O+b*M+x*_,n!==e&&(e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15]),e)},h.rotateX=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[4],o=t[5],u=t[6],a=t[7],f=t[8],l=t[9],c=t[10],h=t[11];return t!==e&&(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[4]=s*i+f*r,e[5]=o*i+l*r,e[6]=u*i+c*r,e[7]=a*i+h*r,e[8]=f*i-s*r,e[9]=l*i-o*r,e[10]=c*i-u*r,e[11]=h*i-a*r,e},h.rotateY=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[0],o=t[1],u=t[2],a=t[3],f=t[8],l=t[9],c=t[10],h=t[11];return t!==e&&(e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*i-f*r,e[1]=o*i-l*r,e[2]=u*i-c*r,e[3]=a*i-h*r,e[8]=s*r+f*i,e[9]=o*r+l*i,e[10]=u*r+c*i,e[11]=a*r+h*i,e},h.rotateZ=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[0],o=t[1],u=t[2],a=t[3],f=t[4],l=t[5],c=t[6],h=t[7];return t!==e&&(e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*i+f*r,e[1]=o*i+l*r,e[2]=u*i+c*r,e[3]=a*i+h*r,e[4]=f*i-s*r,e[5]=l*i-o*r,e[6]=c*i-u*r,e[7]=h*i-a*r,e},h.fromRotationTranslation=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=r+r,a=i+i,f=s+s,l=r*u,c=r*a,h=r*f,p=i*a,d=i*f,v=s*f,m=o*u,g=o*a,y=o*f;return e[0]=1-(p+v),e[1]=c+y,e[2]=h-g,e[3]=0,e[4]=c-y,e[5]=1-(l+v),e[6]=d+m,e[7]=0,e[8]=h+g,e[9]=d-m,e[10]=1-(l+p),e[11]=0,e[12]=n[0],e[13]=n[1],e[14]=n[2],e[15]=1,e},h.fromQuat=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n+n,u=r+r,a=i+i,f=n*o,l=r*o,c=r*u,h=i*o,p=i*u,d=i*a,v=s*o,m=s*u,g=s*a;return e[0]=1-c-d,e[1]=l+g,e[2]=h-m,e[3]=0,e[4]=l-g,e[5]=1-f-d,e[6]=p+v,e[7]=0,e[8]=h+m,e[9]=p-v,e[10]=1-f-c,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},h.frustum=function(e,t,n,r,i,s,o){var u=1/(n-t),a=1/(i-r),f=1/(s-o);return e[0]=s*2*u,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s*2*a,e[6]=0,e[7]=0,e[8]=(n+t)*u,e[9]=(i+r)*a,e[10]=(o+s)*f,e[11]=-1,e[12]=0,e[13]=0,e[14]=o*s*2*f,e[15]=0,e},h.perspective=function(e,t,n,r,i){var s=1/Math.tan(t/2),o=1/(r-i);return e[0]=s/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=(i+r)*o,e[11]=-1,e[12]=0,e[13]=0,e[14]=2*i*r*o,e[15]=0,e},h.ortho=function(e,t,n,r,i,s,o){var u=1/(t-n),a=1/(r-i),f=1/(s-o);return e[0]=-2*u,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=-2*a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=2*f,e[11]=0,e[12]=(t+n)*u,e[13]=(i+r)*a,e[14]=(o+s)*f,e[15]=1,e},h.lookAt=function(e,n,r,i){var s,o,u,a,f,l,c,p,d,v,m=n[0],g=n[1],y=n[2],b=i[0],w=i[1],E=i[2],S=r[0],x=r[1],T=r[2];return Math.abs(m-S)<t&&Math.abs(g-x)<t&&Math.abs(y-T)<t?h.identity(e):(c=m-S,p=g-x,d=y-T,v=1/Math.sqrt(c*c+p*p+d*d),c*=v,p*=v,d*=v,s=w*d-E*p,o=E*c-b*d,u=b*p-w*c,v=Math.sqrt(s*s+o*o+u*u),v?(v=1/v,s*=v,o*=v,u*=v):(s=0,o=0,u=0),a=p*u-d*o,f=d*s-c*u,l=c*o-p*s,v=Math.sqrt(a*a+f*f+l*l),v?(v=1/v,a*=v,f*=v,l*=v):(a=0,f=0,l=0),e[0]=s,e[1]=a,e[2]=c,e[3]=0,e[4]=o,e[5]=f,e[6]=p,e[7]=0,e[8]=u,e[9]=l,e[10]=d,e[11]=0,e[12]=-(s*m+o*g+u*y),e[13]=-(a*m+f*g+l*y),e[14]=-(c*m+p*g+d*y),e[15]=1,e)},h.str=function(e){return"mat4("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+", "+e[6]+", "+e[7]+", "+e[8]+", "+e[9]+", "+e[10]+", "+e[11]+", "+e[12]+", "+e[13]+", "+e[14]+", "+e[15]+")"},h.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2)+Math.pow(e[4],2)+Math.pow(e[5],2)+Math.pow(e[6],2)+Math.pow(e[6],2)+Math.pow(e[7],2)+Math.pow(e[8],2)+Math.pow(e[9],2)+Math.pow(e[10],2)+Math.pow(e[11],2)+Math.pow(e[12],2)+Math.pow(e[13],2)+Math.pow(e[14],2)+Math.pow(e[15],2))},typeof e!="undefined"&&(e.mat4=h);var p={};p.create=function(){var e=new n(4);return e[0]=0,e[1]=0,e[2]=0,e[3]=1,e},p.rotationTo=function(){var e=u.create(),t=u.fromValues(1,0,0),n=u.fromValues(0,1,0);return function(r,i,s){var o=u.dot(i,s);return o<-0.999999?(u.cross(e,t,i),u.length(e)<1e-6&&u.cross(e,n,i),u.normalize(e,e),p.setAxisAngle(r,e,Math.PI),r):o>.999999?(r[0]=0,r[1]=0,r[2]=0,r[3]=1,r):(u.cross(e,i,s),r[0]=e[0],r[1]=e[1],r[2]=e[2],r[3]=1+o,p.normalize(r,r))}}(),p.setAxes=function(){var e=c.create();return function(t,n,r,i){return e[0]=r[0],e[3]=r[1],e[6]=r[2],e[1]=i[0],e[4]=i[1],e[7]=i[2],e[2]=-n[0],e[5]=-n[1],e[8]=-n[2],p.normalize(t,p.fromMat3(t,e))}}(),p.clone=a.clone,p.fromValues=a.fromValues,p.copy=a.copy,p.set=a.set,p.identity=function(e){return e[0]=0,e[1]=0,e[2]=0,e[3]=1,e},p.setAxisAngle=function(e,t,n){n*=.5;var r=Math.sin(n);return e[0]=r*t[0],e[1]=r*t[1],e[2]=r*t[2],e[3]=Math.cos(n),e},p.add=a.add,p.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1],f=n[2],l=n[3];return e[0]=r*l+o*u+i*f-s*a,e[1]=i*l+o*a+s*u-r*f,e[2]=s*l+o*f+r*a-i*u,e[3]=o*l-r*u-i*a-s*f,e},p.mul=p.multiply,p.scale=a.scale,p.rotateX=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+o*u,e[1]=i*a+s*u,e[2]=s*a-i*u,e[3]=o*a-r*u,e},p.rotateY=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a-s*u,e[1]=i*a+o*u,e[2]=s*a+r*u,e[3]=o*a-i*u,e},p.rotateZ=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+i*u,e[1]=i*a-r*u,e[2]=s*a+o*u,e[3]=o*a-s*u,e},p.calculateW=function(e,t){var n=t[0],r=t[1],i=t[2];return e[0]=n,e[1]=r,e[2]=i,e[3]=-Math.sqrt(Math.abs(1-n*n-r*r-i*i)),e},p.dot=a.dot,p.lerp=a.lerp,p.slerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2],u=t[3],a=n[0],f=n[1],l=n[2],c=n[3],h,p,d,v,m;return p=i*a+s*f+o*l+u*c,p<0&&(p=-p,a=-a,f=-f,l=-l,c=-c),1-p>1e-6?(h=Math.acos(p),d=Math.sin(h),v=Math.sin((1-r)*h)/d,m=Math.sin(r*h)/d):(v=1-r,m=r),e[0]=v*i+m*a,e[1]=v*s+m*f,e[2]=v*o+m*l,e[3]=v*u+m*c,e},p.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*n+r*r+i*i+s*s,u=o?1/o:0;return e[0]=-n*u,e[1]=-r*u,e[2]=-i*u,e[3]=s*u,e},p.conjugate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e[3]=t[3],e},p.length=a.length,p.len=p.length,p.squaredLength=a.squaredLength,p.sqrLen=p.squaredLength,p.normalize=a.normalize,p.fromMat3=function(e,t){var n=t[0]+t[4]+t[8],r;if(n>0)r=Math.sqrt(n+1),e[3]=.5*r,r=.5/r,e[0]=(t[7]-t[5])*r,e[1]=(t[2]-t[6])*r,e[2]=(t[3]-t[1])*r;else{var i=0;t[4]>t[0]&&(i=1),t[8]>t[i*3+i]&&(i=2);var s=(i+1)%3,o=(i+2)%3;r=Math.sqrt(t[i*3+i]-t[s*3+s]-t[o*3+o]+1),e[i]=.5*r,r=.5/r,e[3]=(t[o*3+s]-t[s*3+o])*r,e[s]=(t[s*3+i]+t[i*3+s])*r,e[o]=(t[o*3+i]+t[i*3+o])*r}return e},p.str=function(e){return"quat("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},typeof e!="undefined"&&(e.quat=p)}(t.exports)})(this);

},{}],4:[function(require,module,exports){
/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.busyCover', [] )
    .directive( 'busyCover', [ '$rootScope',
        function ($rootScope) {

            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/busyCover.html',
                link: function (scope, element) {

                    scope.$watch(function() {

                        var result;

                        result = false;

                        if ($rootScope.loading) {

                            result = true;
                            scope.busyMessage = 'Loading...';

                        } else if ( $rootScope.initializing ){

                            result = true;

                            scope.busyMessage = 'Initializing...';

                        } else if ( $rootScope.busy ){

                            result = true;

                            if (!scope.busyMessage) {
                                scope.busyMessage = 'Just a second...';
                            }

                        }

                        return result;

                    }, function(newVal) {

                        if (newVal) {

                            element.removeClass('off');

                        } else {

                            element.addClass('off');

                        }

                    });


                }


            };
        }] );
},{}],5:[function(require,module,exports){
/*globals angular*/

'use strict';

require( './componentWireSegment' );

angular.module(
    'mms.designVisualization.componentWire', [
        'mms.designVisualization.componentWire.segment'
    ]
)
    .controller( 'ComponentWireController', function ( $scope ) {
        $scope.getSegments = function () {
            var endPositions,
                x1, y1, x2, y2;

            endPositions = $scope.wire.getEndPositions();

            x1 = endPositions.x1;
            x2 = endPositions.x2;
            y1 = endPositions.y1;
            y2 = endPositions.y2;

            return [
                endPositions
            ];

        };

        $scope.onSegmentClick = function ( wire, segment ) {
            console.log( wire, segment );
        };

        $scope.segments = $scope.getSegments();

    } )
    .directive(
        'componentWire',

        function () {

            return {
                scope: true,
                controller: 'ComponentWireController',
                restrict: 'E',
                replace: true,
                templateUrl: '/mmsApp/templates/componentWire.html',
                templateNamespace: 'SVG'
            };
        }
);
},{"./componentWireSegment":6}],6:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.componentWire.segment', []
)

.directive(
    'componentWireSegment',

    function () {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/mmsApp/templates/componentWireSegment.html',
            templateNamespace: 'SVG'
        };
    }
);
},{}],7:[function(require,module,exports){
/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.designEditor', [] )
    .controller( 'DesignEditorController', function(
        $scope, $rootScope, diagramService, $log, designService, $stateParams, designLayoutService) {

        var designCtx;

        $scope.diagram = null;

        designCtx = {
            db: $rootScope.mainDbConnectionId,
            regionId: 'Design_' + ( new Date() ).toISOString()
        };

        $scope.diagramContainerConfig = {

        };

        $scope.diagram = diagramService.getDiagram($stateParams.containerId);

        designLayoutService.watchChildrenPositions(designCtx, $rootScope.activeDesign.id, function (/*designStructureUpdateObject*/) {

        }).then(function (designStructure) {

            console.log(designStructure);

            $rootScope.activeContainerId = $stateParams.containerId || $rootScope.activeDesign.id;

            $log.debug($rootScope.activeContainerId);

            if ($stateParams.containerId === 'dummy') {

                $scope.diagram = diagramService.addDummyDiagram('dummy', 100, 50, 3000, 3000);

                $log.debug('Drawing dummy diagram:', $scope.diagram);

            } else {

                $scope.diagram = diagramService.getDiagram($stateParams.containerId);

            }


        });

    })
    .directive( 'designEditor', [
        function () {

            return {
                restrict: 'E',
                controller: 'DesignEditorController',
                $scope: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/designEditor.html'

            };
        }] );

},{}],8:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function ($scope, $timeout, $log) {

    var jsp,
        jspReinit,
        jspPane,

        scrollPositionX,
        scrollPositionY,

        updateVisibleArea,
        updatePromise,

        onWindowResize;


    updateVisibleArea = function () {

        var left,
            top,
            _updateVisibleArea;

        _updateVisibleArea = function(){

            $scope.visibleArea = {
                left: left || 0,
                top: top || 0,
                right: left + $scope.$contentPane.width(),
                bottom: top + $scope.$contentPane.height()
            };

        };

        if (jspPane) {

            left = scrollPositionX || 0;
            top = scrollPositionY || 0;

            if (updatePromise) {
                $timeout.cancel(updatePromise);
                updatePromise = null;
            }

            updatePromise = $timeout(_updateVisibleArea, 100);
        }
    };

    jspReinit = function () {

        if (angular.isObject(jsp)) {

            $log.debug('Reinitializing JSP.');
            jsp.reinitialise();

        }

    };

    $scope.$on('DiagramContainerInitialized', function () {

        $scope.$contentPane

            .bind('jsp-initialised',
            function () {
                jspPane = $scope.$contentPane.find('.jspPane');
                updateVisibleArea();
            }
        )
            .bind('jsp-scroll-y', function (event, aScrollPositionY) {

                scrollPositionY = aScrollPositionY;

                updateVisibleArea();
            }
        )
            .bind('jsp-scroll-x', function (event, aScrollPositionX) {

                scrollPositionX = aScrollPositionX;

                updateVisibleArea();
            }
        )
//            .bind(
//            'jsp-arrow-change',
//            function (event, isAtTop, isAtBottom, isAtLeft, isAtRight) {
//                console.log('Handle jsp-arrow-change', this,
//                    'isAtTop=', isAtTop,
//                    'isAtBottom=', isAtBottom,
//                    'isAtLeft=', isAtLeft,
//                    'isAtRight=', isAtRight);
//            }
//        )
            .jScrollPane(
            {
                verticalDragMinHeight: 60,
                verticalDragMaxHeight: 60,
                horizontalDragMinWidth: 60,
                horizontalDragMaxWidth: 60,
                animateScroll: true
            }
        );

        jsp = $scope.$contentPane.data('jsp');

        jspReinit();
    });

    $scope.$on('DiagramInitialized', function () {
        jspReinit();
    });


    onWindowResize = function() {
        jspReinit();
    };

    this.onWindowResize = onWindowResize;

    return this;

};

},{}],9:[function(require,module,exports){
/*globals angular, $*/

'use strict';

// Move this to GME eventually

require('../drawingGrid/drawingGrid.js');

angular.module('mms.designVisualization.diagramContainer', [
        'mms.designVisualization.drawingGrid',
        'panzoom',
        'panzoomwidget',
        'isis.ui.contextmenu'
    ])
    .controller('DiagramContainerController', [
        '$scope',
        '$timeout',
        '$log',
        'PanZoomService',
        '$window',
        function ($scope, $timeout, $log, PanZoomService, $window) {

            var self = this,

                $windowElement,

                compiledDirectives,

                ScrollHandler,
                scrollHandler;

            compiledDirectives = {};

            ScrollHandler = require('./classes/ScrollHandler');
            scrollHandler = new ScrollHandler($scope, $timeout, $log);


            $scope.panzoomId = 'panzoomId'; //scope.id + '-panzoomed';

            $scope.zoomLevel = 4;

            $scope.panzoomModel = {}; // always pass empty object

            $scope.panzoomConfig = {
                zoomLevels: 10,
                neutralZoomLevel: $scope.zoomLevel,
                scalePerZoomLevel: 1.25,
                friction: 50,
                haltSpeed: 50,

                modelChangedCallback: function (val) {
                    PanZoomService.getAPI($scope.panzoomId)
                        .then(function (api) {

                            var topLeftCorner, bottomRightCorner;

                            $scope.zoomLevel = val.zoomLevel;

                            topLeftCorner = api.getModelPosition({
                                x: 0,
                                y: 0
                            });

                            bottomRightCorner = api.getModelPosition({
                                x: $scope.canvasWidth,
                                y: $scope.canvasHeight
                            });

                            $scope.visibleArea = {
                                top: topLeftCorner.y,
                                left: topLeftCorner.x,
                                right: bottomRightCorner.x,
                                bottom: bottomRightCorner.y
                            };

                        });

                }
            };

            $windowElement = angular.element($window);

            $windowElement.bind(
                'resize', scrollHandler.onWindowResize
            );


            $scope.getCssClass = function () {

                var classString;

                classString = 'diagram-container';

                classString += ' zoom-level-' + $scope.zoomLevel;

                classString += self.isEditable() ? ' editable' : 'readonly';

                return classString;
            };

            this.getVisibleArea = function () {
                return $scope.visibleArea;
            };

            this.getId = function () {

                var diagramId;

                if (angular.isObject($scope.diagram)) {
                    diagramId = $scope.diagram.id;
                }

                return diagramId;
            };

            this.getDiagram = function () {
                return $scope.diagram;
            };

            this.getZoomLevel = function () {
                return $scope.zoomLevel;
            };

            this.getCompiledDirective = function (directive) {
                return compiledDirectives[directive];
            };

            this.setCompiledDirective = function (directive, compiledDirective) {
                compiledDirectives[directive] = compiledDirective;
            };

            this.isEditable = function () {

                if (angular.isObject($scope.diagram)) {

                    $scope.diagram.config = $scope.diagram.config || {};

                    return $scope.diagram.config.editable === true;

                }

            };

            this.isComponentSelected = function (component) {

                if (angular.isObject($scope.diagram)) {

                    return $scope.diagram.state.selectedComponentIds.indexOf(component.id) > -1;

                }

            };

            this.getConfig = function () {
                return $scope.config;
            };

            this.setInitialized = function(val) {
                $scope.initialized = val;
            };

        }
    ])
    .directive('diagramContainer', [
        'diagramService', '$log', '$timeout', 'PanZoomService',
        function (diagramService, $log, $timeout) {

            return {
                controller: 'DiagramContainerController',
                scope: {
                    diagram: '=',
                    config: '='
                },
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/diagramContainer.html',
                link: function (scope, element) {

                    $log.debug('In diagram container', scope.visibleArea);

                    scope.config = scope.config || {};

//                    scope.canvasWidth = $(element)
//                        .outerWidth();
//                    scope.canvasHeight = $(element)
//                        .outerHeight();
//
//
//                    scope.visibleArea = {
//                        top: 0,
//                        left: 0,
//                        right: scope.canvasWidth,
//                        bottom: scope.canvasHeight
//                    };

                    scope.$element = $(element);
                    scope.$contentPane = element.find('>.diagram-content-pane');

                    $timeout(function() {
                        scope.$broadcast('DiagramContainerInitialized');
                    });
                }

            };
        }
    ]);


},{"../drawingGrid/drawingGrid.js":10,"./classes/ScrollHandler":8}],10:[function(require,module,exports){
/*globals angular, $*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.drawingGrid', [] )
    .directive( 'drawingGrid', [ '$log',
        function () {

            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/drawingGrid.html',
                link: function (scope, element) {

                    var $element;

                    $element = $(element);

                    scope.$watch('diagram.config.width', function(newVal) {
                       $element.outerWidth(newVal);
                    });

                    scope.$watch('diagram.config.height', function(newVal) {
                        $element.outerHeight(newVal);
                    });

                }


            };
        }] );
},{}],11:[function(require,module,exports){
/*globals angular, fabric*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.fabricCanvas', [] )
    .controller( 'FabricCanvasController', function () {

    } )
    .directive( 'fabricCanvas', [
        '$log',
        'diagramService',
        function ( $log, diagramService ) {

            return {

                scope: {},
                controller: 'FabricCanvasController',
                require: '^diagramContainer',
                restrict: 'E',
                replace: true,
                templateUrl: '/mmsApp/templates/fabricCanvas.html',
                link: function ( scope, element, attributes, diagramContainerCtrl ) {

                    var
                    canvas,
                        renderDiagram;

                    scope.id = diagramContainerCtrl.getId() + 'fabric-canvas';

                    canvas = new fabric.Canvas( scope.id );

                    canvas.setBackgroundColor( 'rgba(255, 73, 64, 0.6)' );

                    renderDiagram = function () {

                        if ( angular.isObject( scope.diagramData ) ) {

                            if ( angular.isArray( scope.diagramData.symbols ) ) {

                                angular.forEach( scope.diagramData.symbols, function ( symbol ) {

                                    diagramService.getSVGForSymbolType( symbol.type )
                                        .then( function ( object ) {

                                            var svgObject;

                                            svgObject = object.set( {
                                                left: symbol.x,
                                                top: symbol.y,
                                                angle: 0
                                            } );

                                            //                  canvas.add(svgObject);

                                            var rect = new fabric.Rect( {
                                                left: 100,
                                                top: 50,
                                                width: 100,
                                                height: 100,
                                                fill: 'green',
                                                angle: 20,
                                                padding: 10
                                            } );

                                            canvas.add( rect );

                                            //                $log.debug('e', svgObject);

                                            canvas.renderAll();

                                        } );

                                } );

                            }

                        }

                        canvas.clear()
                            .renderAll();

                    };

                    scope.$watch( diagramContainerCtrl.getDiagramData, function ( value ) {
                        $log.debug( 'DiagramData is ', value );
                        scope.diagramData = value;
                        renderDiagram();

                    } );

                }

            };
        }
    ] );
},{}],12:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.port', []
)
    .controller( 'PortController', function ( $scope ) {
        $scope.getPortTransform = function () {
            var transformString;

            transformString = 'translate(' + $scope.portInstance.portSymbol.x + ',' + $scope.portInstance.portSymbol
                .y + ')';

            return transformString;
        };
    } )
    .directive(
        'port',

        function () {

            return {
                scope: false,
                controller: 'PortController',
                restrict: 'E',
                replace: true,
                templateUrl: '/mmsApp/templates/port.html',
                templateNamespace: 'SVG',
                require: [ '^svgDiagram', '^diagramContainer' ],
                link: function ( scope, element, attributes, controllers ) {

                    var svgDiagramController;

                    svgDiagramController = controllers[ 0 ];

                    scope.onPortClick = function ( port, $event ) {
                        svgDiagramController.onPortClick( scope.component, port, $event );
                    };

                    scope.onPortMouseDown = function ( port, $event ) {
                        svgDiagramController.onPortMouseDown( scope.component, port, $event );
                    };

                    scope.onPortMouseUp = function ( port, $event ) {
                        svgDiagramController.onPortMouseUp( scope.component, port, $event );
                    };

                }
            };
        }
);
},{}],13:[function(require,module,exports){
/*globals angular*/
'use strict';

var resizeToHeightModule = angular.module('mms.resizeToHeight', []);


resizeToHeightModule.directive('resizeToHeight', function ($window) {

    return {

        scope: {
            heightIsLessWith: '=?'
        },
        link: function (scope, element, attributes) {

            var window = angular.element(
                    $window
                ),
                minHeight = parseInt(attributes.mindHeight, 10) || 0,
                maxHeight = parseInt(attributes.maxHeight, 10) || Infinity,
                heightIsLessWith = parseInt(scope.heightIsLessWith, 10) || 0;

            scope.getWindowHeight = function () {

                var max, min,
                    height;

                height = ($window.innerHeight > 0) ? $window.innerHeight : screen.height;

                max = maxHeight;
                min = minHeight;

                return Math.max(Math.min(height - heightIsLessWith, max), min);
            };

            scope.$watch(scope.getWindowHeight,
                function (newValue) {
                    element.outerHeight(newValue);
                });

            window.bind('resize', function () {
                scope.$apply();
            });
        }
    };
});

module.exports = resizeToHeightModule;
},{}],14:[function(require,module,exports){
/*globals angular*/
'use strict';

var resizeToWindowModule = angular.module('mms.resizeToWindow', []);


resizeToWindowModule.directive('resizeToWindow', function ($window) {

  return function (scope, element, attributes) {

    var window = angular.element(
        $window
      ),
      minWidth = parseInt(attributes.minWidth, 10) || 0,
      minHeight = parseInt(attributes.mindHeight, 10) || 0,
      maxWidth = parseInt(attributes.maxWidth, 10) || Infinity,
      maxHeight = parseInt(attributes.maxHeight, 10) || Infinity,
      widthIsLessWith = parseInt(attributes.widthIsLessWith, 10) || 0,
      heightIsLessWith = parseInt(attributes.heightIsLessWith, 10) || 0,

      reverseInPortrait = true;

    scope.getWindowHeight = function () {

      var max, min,
        height, width;

      height = ($window.innerHeight > 0) ? $window.innerHeight : screen.height;
      width = ($window.innerWidth > 0) ? $window.innerWidth : screen.width;

      if (reverseInPortrait && height>width) {
        max = maxWidth;
        min = minWidth;
      } else {
        max = maxHeight;
        min = minHeight;
      }

      return Math.max(Math.min(height-heightIsLessWith, max), min);
    };

    scope.getWindowWidth = function () {

      var max, min,
        height, width;

      height = ($window.innerHeight > 0) ? $window.innerHeight : screen.height;
      width = ($window.innerWidth > 0) ? $window.innerWidth : screen.width;

      if (reverseInPortrait && height>width) {
        max = maxHeight;
        min = minHeight;
      } else {
        max = maxWidth;
        min = minWidth;
      }

      return Math.max(Math.min(width-widthIsLessWith, max), min);
    };

    scope.$watch(scope.getWindowWidth,
      function (newValue) {
        element.outerWidth(newValue);
      });

    scope.$watch(scope.getWindowHeight,
      function (newValue) {
        element.outerHeight(newValue);
      });

    window.bind('resize', function () {
      scope.$apply();
    });

  };
});

module.exports = resizeToWindowModule;
},{}],15:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function($scope, diagramService, wiringService, operationsManager, $log) {

    var self = this,
        getOffsetToMouse,
        possibbleDragTargetsDescriptor,
        dragTargetsDescriptor,

        onDiagramMouseUp,
        onDiagramMouseMove,
        onDiagramMouseLeave,
        onWindowBlur,
        onComponentMouseUp,
        onComponentMouseDown,

        startDrag,
        finishDrag,
        cancelDrag;


    getOffsetToMouse = function ( $event ) {

        var offset;

        offset = {
            x: $event.pageX - $scope.elementOffset.left,
            y: $event.pageY - $scope.elementOffset.top
        };

        return offset;

    };


    startDrag = function () {

        self.dragging = true;

        //self.dragOperation = operationsManager.initNew('setComponentPosition');

        dragTargetsDescriptor = possibbleDragTargetsDescriptor;
        possibbleDragTargetsDescriptor = null;

        $log.debug( 'Dragging', dragTargetsDescriptor );

    };

    cancelDrag = function() {

        possibbleDragTargetsDescriptor = null;

        if ( dragTargetsDescriptor ) {

            angular.forEach( dragTargetsDescriptor.targets, function ( target ) {

                target.component.setPosition(
                    target.originalPosition.x,
                    target.originalPosition.y
                );

            } );

            angular.forEach( dragTargetsDescriptor.affectedWires, function ( wire ) {

                wiringService.adjustWireEndSegments( wire );

            } );

            dragTargetsDescriptor = null;

        }

        self.dragging = false;

    };

    finishDrag = function () {

        self.dragging = false;

//        angular.forEach(dragTargetsDescriptor.targets, function(target) {
//
//            var position;
//
//            position = target.component.getPosition();
//
//            self.dragOperation.commit( target.component, position.x, position.y );
//        });


        dragTargetsDescriptor = null;

        $log.debug( 'Finish dragging' );

    };

    onDiagramMouseMove = function($event) {

        if ( possibbleDragTargetsDescriptor ) {
            startDrag();
        }

        if ( dragTargetsDescriptor ) {

            var offset;

            offset = getOffsetToMouse( $event );

            angular.forEach( dragTargetsDescriptor.targets, function ( target ) {

                target.component.setPosition(
                    offset.x + target.deltaToCursor.x,
                    offset.y + target.deltaToCursor.y
                );

            } );

            angular.forEach( dragTargetsDescriptor.affectedWires, function ( wire ) {

                wiringService.adjustWireEndSegments( wire );

            } );

        }

    };

    onDiagramMouseUp = function($event) {

        possibbleDragTargetsDescriptor = null;

        if ( dragTargetsDescriptor ) {
            finishDrag();
            $event.stopPropagation();
        }

    };

    onDiagramMouseLeave = function(/*$event*/) {

        cancelDrag();

    };

    onWindowBlur = function(/*$event*/) {

        cancelDrag();

    };

    onComponentMouseUp = function(component, $event) {

        possibbleDragTargetsDescriptor = null;

        if ( dragTargetsDescriptor ) {
            finishDrag();
            $event.stopPropagation();
        }

    };

    onComponentMouseDown = function (component, $event) {

        var componentsToDrag,
            getDragDescriptor;

        componentsToDrag = [];

        getDragDescriptor = function ( component ) {

            var offset = getOffsetToMouse( $event );

            return {
                component: component,
                originalPosition: {
                    x: component.x,
                    y: component.y
                },
                deltaToCursor: {
                    x: component.x - offset.x,
                    y: component.y - offset.y
                }
            };

        };

        $scope.diagram.config = $scope.diagram.config || {};

        if ( $scope.diagram.config.editable === true &&
            component.nonSelectable !== true &&
            component.locationLocked !== true ) {

            $event.stopPropagation();

            possibbleDragTargetsDescriptor = {
                targets: [ getDragDescriptor( component ) ]
            };

            componentsToDrag.push( component );

            if ( $scope.diagram.state.selectedComponentIds.indexOf( component.id ) > -1 ) {

                // Drag along other selected components

                angular.forEach( $scope.diagram.state.selectedComponentIds, function ( selectedComponentId ) {

                    var selectedComponent;

                    if ( component.id !== selectedComponentId ) {

                        selectedComponent = $scope.diagram.componentsById[ selectedComponentId ];

                        possibbleDragTargetsDescriptor.targets.push( getDragDescriptor(
                            selectedComponent ) );

                        componentsToDrag.push( selectedComponent );

                    }

                } );
            }

            possibbleDragTargetsDescriptor.affectedWires = $scope.diagram.getWiresForComponents(
                componentsToDrag
            );

        }

    };

    this.onDiagramMouseUp = onDiagramMouseUp;
    this.onDiagramMouseMove = onDiagramMouseMove;
    this.onDiagramMouseLeave = onDiagramMouseLeave;
    this.onWindowBlur = onWindowBlur;
    this.onComponentMouseUp = onComponentMouseUp;
    this.onComponentMouseDown = onComponentMouseDown;

    return this;

};

},{}],16:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function($scope, diagramService, gridService, $log) {

    var onComponentMouseUp,

        moveComponentElementToFront,
        toggleComponentSelected;


    moveComponentElementToFront = function ( componentId ) {

        var z,
            component,
            needsTobeReordered;

        needsTobeReordered = false;

        z = diagramService.getHighestZ();
        component = $scope.diagram.componentsById[ componentId ];

        if ( isNaN( component.z ) ) {
            component.z = z;
            needsTobeReordered = true;
        } else {
            if ( component.z < z ) {
                component.z = z + 1;
                needsTobeReordered = true;
            }
        }

        if ( needsTobeReordered ) {
            gridService.reorderVisibleComponents( $scope.id );
        }

    };


    toggleComponentSelected =  function ( component, $event ) {

        var index;

        $scope.diagram.config = $scope.diagram.config || {};

        if ( angular.isObject( component ) && $scope.diagram.config.disallowSelection !== true && component.nonSelectable !== true ) {

            index = $scope.diagram.state.selectedComponentIds.indexOf( component.id );

            if ( index > -1 ) {

                $scope.diagram.state.selectedComponentIds.splice( index, 1 );

            } else {

                if ( $scope.diagram.state.selectedComponentIds.length > 0 &&
                    $scope.diagram.config.multiSelect !== true &&
                    $event.shiftKey !== true ) {

                    angular.forEach( $scope.diagram.state.selectedComponentIds, function ( componentId ) {
                        $scope.diagram.componentsById[ componentId ].selected = false;
                    } );
                    $scope.diagram.state.selectedComponentIds = [];
                }

                $scope.diagram.state.selectedComponentIds.push( component.id );

                moveComponentElementToFront( component.id );

            }

            $log.debug('selecteds', $scope.diagram.state.selectedComponentIds);

        }

    };


    onComponentMouseUp = function(component, $event) {
        toggleComponentSelected( component, $event );

    };

    this.onComponentMouseUp = onComponentMouseUp;

    return this;

};

},{}],17:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function($scope, diagramService, wiringService, gridService, $log) {

    var self = this,

        Wire = require( '../../../services/diagramService/classes/Wire.js' ),

        wireStart,

        startWire,
        addCornerToNewWireLine,
        finishWire,
        cancelWire,

        onDiagramMouseUp,
        onDiagramMouseMove,
        onDiagramMouseLeave,
        onWindowBlur,
        onPortMouseDown;



    startWire = function (component, port) {

        wireStart = {
            component: component,
            port: port
        };

        $log.debug( 'Starting wire', wireStart );

        self.wiring = true;

    };

    addCornerToNewWireLine = function () {

        var lastSegment;

        $scope.newWireLine.lockedSegments = $scope.newWireLine.segments;

        lastSegment = $scope.newWireLine.lockedSegments[ $scope.newWireLine.lockedSegments.length - 1 ];

        $scope.newWireLine.activeSegmentStartPosition = {
            x: lastSegment.x2,
            y: lastSegment.y2
        };

    };

    finishWire = function ( component, port ) {

        var wire = new Wire( {
            id: 'new-wire-' + Math.round( Math.random() * 10000 ),
            end1: {
                component: wireStart.component,
                port: wireStart.port
            },
            end2: {
                component: component,
                port: port
            }
        } );

        wire.segments = angular.copy(
            $scope.newWireLine.lockedSegments.concat(
                wiringService.getSegmentsBetweenPositions( {
                        end1: $scope.newWireLine.activeSegmentStartPosition,
                        end2: port.getGridPosition()
                    },
                    'ElbowRouter'
                )
            ) );


        diagramService.addWire( $scope.id, wire );

        $scope.diagram.wires[ wire.id ] = wire;

        gridService.invalidateVisibleDiagramComponents( $scope.id );

        $log.debug( 'Finish wire', wire );

        wireStart = null;
        $scope.newWireLine = null;

        self.wiring = false;

    };

    cancelWire = function () {
        $scope.newWireLine = null;
        wireStart = null;
        self.wiring = false;
    };

    onDiagramMouseMove = function($event) {

        if ( wireStart ) {


            $scope.newWireLine = $scope.newWireLine || {};
            $scope.newWireLine.lockedSegments = $scope.newWireLine.lockedSegments || [];
            $scope.newWireLine.activeSegmentStartPosition =
                $scope.newWireLine.activeSegmentStartPosition || wireStart.port.getGridPosition();

            $scope.newWireLine.segments = $scope.newWireLine.lockedSegments.concat(
                wiringService.getSegmentsBetweenPositions( {
                        end1: $scope.newWireLine.activeSegmentStartPosition,
                        end2: {
                            x: $event.pageX - $scope.elementOffset.left - 3,
                            y: $event.pageY - $scope.elementOffset.top - 3
                        }
                    },
                    'ElbowRouter'
                )
            );

        }

    };

    onDiagramMouseUp = function() {

        if ( wireStart ) {

            addCornerToNewWireLine();

        } else {
            $scope.diagram.state.selectedComponentIds = [];
        }

    };

    onPortMouseDown = function( component, port, $event ) {

        if ( wireStart ) {

            $event.stopPropagation();

            if ( wireStart.port !== port ) {
                finishWire( component, port );
            } else {
                cancelWire();
            }

        } else {

            startWire(component, port);
            $event.stopPropagation();

        }

    };

    onDiagramMouseLeave = function(/*$event*/) {
        if (self.wiring) {
            cancelWire();
        }
    };

    onWindowBlur = function(/*$event*/) {
        if (self.wiring) {
            cancelWire();
        }
    };


    this.onDiagramMouseUp = onDiagramMouseUp;
    this.onDiagramMouseMove = onDiagramMouseMove;
    this.onDiagramMouseLeave = onDiagramMouseLeave;
    this.onWindowBlur = onWindowBlur;
    this.onPortMouseDown = onPortMouseDown;

    return this;

};

},{"../../../services/diagramService/classes/Wire.js":34}],18:[function(require,module,exports){
/*globals angular, $*/

'use strict';

module.exports = function ($scope, diagramService, $timeout, contextmenuService, operationsManager, $log) {

    var
        onComponentContextmenu,
        onPortContextmenu,
        onDiagramContextmenu,
        onDiagramMouseDown,

        openMenu;

    $log.debug('Initializing context menus.');

    openMenu = function($event) {

        contextmenuService.close();

        $timeout(function () {

            var openContextMenuEvent;

                openContextMenuEvent = angular.extend($.Event('openContextMenu'), {
                clientX: $event.clientX,
                clientY: $event.clientY,
                pageX: $event.pageX,
                pageY: $event.pageY,
                screenX: $event.screenX,
                screenY: $event.screenY,
                target: $event.target
            });

            $scope.$element.triggerHandler(openContextMenuEvent);

        });

    };

    onDiagramMouseDown = function() {
        contextmenuService.close();
    };

    onComponentContextmenu = function (component, $event) {

        $scope.contextMenuData = [
            {
                id: 'reposition',
                items: [
                    {
                        id: 'rotateCW',
                        label: 'Rotate CW',
                        iconClass: 'fa fa-rotate-right',
                        action: function () {

                            var operation;

                            operation = operationsManager.initNew('rotateComponents', component);
                            operation.set(90);
                            operation.commit();
                        }
                    },
                    {
                        id: 'rotateCCW',
                        label: 'Rotate CCW',
                        iconClass: 'fa fa-rotate-left',
                        action: function () {

                            var operation;

                            console.log('Rotating anti-clockwise');

                            operation = operationsManager.initNew('rotateComponents', component);
                            operation.set(-90);
                            operation.commit();

                        }
                    }
                ]
            }
        ];

        openMenu($event);

        $event.stopPropagation();

    };

    onPortContextmenu = function (component, port, $event) {

        $scope.contextMenuData = [
            {
                id: 'properties',
                items: [
                    {
                        id: 'info',
                        label: 'Info',
                        disabled: true,
                        iconClass: null,
                        action: function () {
                            console.log('Port info');
                        },
                        actionData: {}
                    }
                ]
            }
        ];

        openMenu($event);

        $event.stopPropagation();

        return false;

    };

    onDiagramContextmenu = function ($event) {

        $scope.contextMenuData = [
            {
                id: 'about',
                items: [
                    {
                        id: 'getStats',
                        label: 'Statistics',
                        disabled: true,
                        iconClass: 'glyphicon glyphicon-plus',
                        action: function () {
                            console.log('Statistics');
                        },
                        actionData: {}
                    }
                ]
            }
        ];

        openMenu($event);

        $event.stopPropagation();

    };

    this.onDiagramContextmenu = onDiagramContextmenu;
    this.onComponentContextmenu = onComponentContextmenu;
    this.onPortContextmenu = onPortContextmenu;
    this.onDiagramMouseDown = onDiagramMouseDown;

    return this;

};

},{}],19:[function(require,module,exports){
/*globals angular, $*/

'use strict';

// Move this to GME eventually

require('../componentWire/componentWire.js');

angular.module('mms.designVisualization.svgDiagram', [
    'mms.designVisualization.gridService',
    'mms.designVisualization.componentWire',
    'mms.designVisualization.operationsManager',
    'isis.ui.contextmenu'
])
    .controller('SVGDiagramController', function (
        $scope, $log, diagramService, wiringService, gridService, $window, $timeout, contextmenuService, operationsManager) {

        var

            ComponentSelectionHandler = require('./classes/ComponentSelectionHandler'),
            componentSelectionHandler,

            ComponentDragHandler = require('./classes/ComponentDragHandler'),
            componentDragHandler,

            WireDrawHandler = require('./classes/WireDrawHandler'),
            wireDrawHandler,

            ContextMenuHandler = require('./classes/contextMenuHandler'),
            contextMenuHandler,

            componentElements,

            $$window;

        $$window = $($window);

        componentDragHandler = new ComponentDragHandler(
            $scope,
            diagramService,
            wiringService,
            operationsManager,
            $log
        );

        componentSelectionHandler = new ComponentSelectionHandler(
            $scope,
            diagramService,
            gridService,
            $log
        );

        wireDrawHandler = new WireDrawHandler(
            $scope,
            diagramService,
            wiringService,
            gridService,
            $log
        );

        contextMenuHandler = new ContextMenuHandler(
            $scope,
            diagramService,
            $timeout,
            contextmenuService,
            operationsManager,
            $log
        );

        $scope.onDiagramMouseDown = function ($event) {



            if ($event.which === 3) {

                contextMenuHandler.onDiagramContextmenu($event);

            } else {

                contextMenuHandler.onDiagramMouseDown($event);

            }

        };


        $scope.onDiagramMouseUp = function ($event) {

            componentDragHandler.onDiagramMouseUp($event);
            wireDrawHandler.onDiagramMouseUp($event);

        };


        $scope.onDiagramClick = function (/*$event*/) {


        };

        $scope.onDiagramMouseMove = function ($event) {

            componentDragHandler.onDiagramMouseMove($event);
            wireDrawHandler.onDiagramMouseMove($event);

        };

        $scope.getCssClass = function () {

            var result = '';

            if (componentDragHandler.dragging) {
                result += 'dragging';
            }

            return result;

        };

        $scope.onDiagramMouseLeave = function ($event) {

            componentDragHandler.onDiagramMouseLeave($event);
            wireDrawHandler.onDiagramMouseLeave($event);

        };

        $$window.blur(function ($event) {

            componentDragHandler.onWindowBlur($event);
            wireDrawHandler.onWindowBlur($event);

        });


        // Interactions with components

        this.onComponentMouseUp = function (component, $event) {

            if (!componentDragHandler.dragging) {

                componentSelectionHandler.onComponentMouseUp(component, $event);
                $event.stopPropagation();

                componentDragHandler.onComponentMouseUp(component, $event);

            } else {
                componentDragHandler.onComponentMouseUp(component, $event);
            }
        };

        this.onPortMouseDown = function (component, port, $event) {

            if ( !wireDrawHandler.wiring && $event.which === 3 ) {

                contextMenuHandler.onPortContextmenu(component, port, $event);

            } else {
                wireDrawHandler.onPortMouseDown(component, port, $event);
            }

        };

        this.onPortMouseUp = function (component, port, $event) {

            $event.stopPropagation();

        };

        this.onPortClick = function (component, port, $event) {

            $event.stopPropagation();

        };

        this.onComponentMouseDown = function (component, $event) {

            if ($event.which === 3) {

                contextMenuHandler.onComponentContextmenu(component, $event);

            } else {

                componentDragHandler.onComponentMouseDown(component, $event);

            }
        };

        this.isEditable = function () {

            $scope.diagram.config = $scope.diagram.config || {};

            return $scope.diagram.config.editable === true;
        };

        this.disallowSelection = function () {

            $scope.diagram.config = $scope.diagram.config || {};

            return $scope.diagram.config.disallowSelection === true;
        };

        this.registerComponentElement = function (id, el) {

            componentElements = componentElements || {};

            componentElements[id] = el;

        };

        this.unregisterComponentElement = function (id) {

            componentElements = componentElements || {};

            delete componentElements[id];

        };

        operationsManager.registerOperation({
            id: 'rotateComponents',
            operationClass: function() {

                this.init = function(component) {

                    this.component = component;
                };

                this.set = function(angle) {
                    this.angle = angle;
                };

                this.commit = function() {

                    var componentsToRotate,
                        component,
                        angle,
                        affectedWires;

                    componentsToRotate = [];

                    component = this.component;
                    angle = this.angle;

                    componentsToRotate.push( this.component );

                    if ( $scope.diagram.state.selectedComponentIds.indexOf( this.component.id ) > -1 ) {

                        angular.forEach( $scope.diagram.state.selectedComponentIds, function ( selectedComponentId ) {

                            var selectedComponent;

                            if ( component.id !== selectedComponentId ) {

                                selectedComponent = $scope.diagram.componentsById   [ selectedComponentId ];

                                componentsToRotate.push( selectedComponent );

                            }

                        } );
                    }

                    affectedWires = $scope.diagram.getWiresForComponents(
                        componentsToRotate
                    );

                    angular.forEach(componentsToRotate, function(component) {
                        component.rotate(angle);
                    });


                    angular.forEach( affectedWires, function ( wire ) {
                        wiringService.adjustWireEndSegments( wire );
                    } );
                };
            }

        });

    })
    .directive('svgDiagram', [
        '$rootScope',
        '$log',
        'diagramService',
        'gridService',
        function ($rootScope, $log, diagramService, gridService) {

            return {
                controller: 'SVGDiagramController',
                require: '^diagramContainer',
                restrict: 'E',
                scope: false,
                replace: true,
                templateUrl: '/mmsApp/templates/svgDiagram.html',
                link: function (scope, element, attributes, diagramContainerController) {

                    var id,
                        $element,
                        killContextMenu;

                    $element = $(element);

                    killContextMenu = function($event) {

                        $log.debug('killing default contextmenu');

                        $event.stopPropagation();

                        return false;

                    };

                    scope.$watch('diagram', function(newDiagramValue) {

                        if (newDiagramValue) {

                            scope.diagram = scope.diagram || {};
                            scope.$element = $element;

                            $element.outerWidth(scope.diagram.config.width);
                            $element.outerHeight(scope.diagram.config.width);

                            scope.id = id = newDiagramValue.id;

                            diagramContainerController.setInitialized(false);
                            $rootScope.initializing = true;

                            $rootScope.$on('GridInitialized', function (event, data) {

                                if (data === id) {
                                    diagramContainerController.setInitialized(true);
                                    $rootScope.initializing = false;
                                }

                            });

                            scope.visibleObjects = gridService.createGrid(id,
                                scope.diagram
                            );


                            scope.$watch(
                                function () {
                                    return diagramContainerController.getVisibleArea();
                                }, function (visibleArea) {
                                    scope.elementOffset = scope.$element.offset();
                                    gridService.setVisibleArea(id, visibleArea);
                                });

                        }

                    });


                    $element.bind('contextmenu', killContextMenu);


                }

            };
        }
    ]);

},{"../componentWire/componentWire.js":5,"./classes/ComponentDragHandler":15,"./classes/ComponentSelectionHandler":16,"./classes/WireDrawHandler":17,"./classes/contextMenuHandler":18}],20:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.box', []
)
    .controller( 'BoxController', function ( $scope ) {

        $scope.portWires = [];

        angular.forEach( $scope.component.symbol.ports, function ( port ) {

            var toX = 0,
                toY = 0,
                portWireLength,
                width, height;

            portWireLength = $scope.component.symbol.portWireLength;
            width = $scope.component.symbol.width;
            height = $scope.component.symbol.height;

            if ( port.x === 0 ) {
                toX = portWireLength;
                toY = port.y;
            }

            if ( port.y === 0 ) {
                toY = portWireLength;
                toX = port.x;
            }

            if ( port.x === width ) {
                toX = width - portWireLength;
                toY = port.y;
            }

            if ( port.y === height ) {
                toY = height - portWireLength;
                toX = port.x;
            }

            $scope.portWires.push( {
                x1: port.x,
                y1: port.y,
                x2: toX,
                y2: toY
            } );
        } );

    } )
    .directive(
        'box',

        function () {

            return {
                scope: false,
                restrict: 'E',
                replace: true,
                controller: 'BoxController',
                templateUrl: '/mmsApp/templates/box.html',
                templateNamespace: 'SVG'
            };
        } );
},{}],21:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.capacitor', []
)
    .config( [ 'symbolManagerProvider',
        function ( symbolManagerProvider ) {
            symbolManagerProvider.registerSymbol( {
                type: 'capacitor',
                directive: null,
                svgDecoration: 'images/symbols.svg#icon-capacitor',
                labelPrefix: 'C',
                labelPosition: {
                    x: 10,
                    y: -8
                },
                width: 60,
                height: 15,
                ports: [ {
                    id: 'C',
                    wireAngle: 180,
                    wireLeadIn: 20,
                    label: 'C',
                    x: 0,
                    y: 7.5
                }, {
                    id: 'A',
                    wireAngle: 0,
                    wireLeadIn: 20,
                    label: 'A',
                    x: 60,
                    y: 7.5
                } ]
            } );
        }
    ] );
},{}],22:[function(require,module,exports){
/*globals angular, $*/

'use strict';

require( '../../services/symbolServices/symbolServices.js' );
require( '../port/port.js' );

require( './resistor/resistor.js' );
require( './jFetP/jFetP.js' );
require( './opAmp/opAmp.js' );
require( './diode/diode.js' );
require( './capacitor/capacitor.js' );
require( './inductor/inductor.js' );

require( './box/box.js' );

var symbolsModule = angular.module(
    'mms.designVisualization.symbols', [
        'mms.designVisualization.symbolServices',

        'mms.designVisualization.port',

        'mms.designVisualization.symbols.resistor',
        'mms.designVisualization.symbols.jFetP',
        'mms.designVisualization.symbols.opAmp',
        'mms.designVisualization.symbols.diode',
        'mms.designVisualization.symbols.capacitor',
        'mms.designVisualization.symbols.inductor',

        'mms.designVisualization.symbols.box'

    ] );

symbolsModule.controller(
    'SymbolController', function ( $scope ) {

        $scope.getSymbolTransform = function () {

            var transformString;

            //    transformString = 'translate(' + $scope.component.x + ',' + $scope.component.y + ') ';
            //    transformString +=
            //      'rotate(' + $scope.component.rotation + ' ' + $scope.component.symbol.width/2 + ' ' + $scope.component.symbol.height/2  + ') ';
            //    //transformString += 'scale(' + $scope.component.scaleX + ',' + $scope.component.scaleY + ') ';
            //
            //    console.log($scope.component.getTransformationMatrix().join(', '));

            transformString = 'matrix(' + $scope.component.getSVGTransformationString() + ')';

            return transformString;
        };

    } );

symbolsModule.directive(
    'componentSymbol',

    function ( $compile ) {

        return {
            scope: {
                component: '=',
                test: '=',
                page: '=',
                instance: '='
            },
            restrict: 'E',
            replace: true,
            controller: 'SymbolController',
            templateUrl: '/mmsApp/templates/componentSymbol.html',
            templateNamespace: 'SVG',
            require: [ '^svgDiagram', '^diagramContainer' ],
            link: function ( scope, element, attributes, controllers ) {

                var templateStr,
                    template,

                    diagramContainerController,
                    svgDiagramController,

                    $el,
                    compiledSymbol,
                    symbolComponent;

                svgDiagramController = controllers[ 0 ];
                diagramContainerController = controllers[ 1 ];

                scope.portsVisible = function () {
                    return true;
                };

                scope.detailsVisible = function () {
                    return diagramContainerController.getZoomLevel() > 1;
                };

                scope.getCssClass = function () {

                    var result;

                    result = scope.component.symbol.type;

                    if ( diagramContainerController.isComponentSelected( scope.component ) ) {
                        result += ' selected';
                    }

                    return result;

                };

                // Interactions

                scope.onMouseUp = function ( $event ) {
                    svgDiagramController.onComponentMouseUp( scope.component, $event );
                };

                scope.onMouseDown = function ( $event ) {
                    svgDiagramController.onComponentMouseDown( scope.component, $event );
                    $event.stopPropagation();
                };

                symbolComponent = scope.component.symbol.symbolComponent || 'generic-svg';

                compiledSymbol = diagramContainerController.getCompiledDirective( symbolComponent );

                if ( !angular.isFunction( compiledSymbol ) ) {

                    templateStr = '<' + symbolComponent + '>' +
                        '</' + symbolComponent + '>';

                    template = angular.element( templateStr );

                    compiledSymbol = $compile( template );

                    diagramContainerController.setCompiledDirective( symbolComponent, compiledSymbol );

                }

                $el = $( element );

                compiledSymbol( scope, function ( clonedElement ) {
                    $el.find( '.symbol-placeholder' )
                        .replaceWith( clonedElement );
                } );

                svgDiagramController.registerComponentElement( scope.component.id, $el );

                scope.$on( '$destroy', function () {
                    svgDiagramController.unregisterComponentElement( scope.component.id );
                } );

            }
        };
    }
);

symbolsModule.directive(
    'genericSvg',

    function () {

        return {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/mmsApp/templates/genericSvg.html',
            templateNamespace: 'SVG'
        };
    }
);

},{"../../services/symbolServices/symbolServices.js":38,"../port/port.js":12,"./box/box.js":20,"./capacitor/capacitor.js":21,"./diode/diode.js":23,"./inductor/inductor.js":24,"./jFetP/jFetP.js":25,"./opAmp/opAmp.js":26,"./resistor/resistor.js":27}],23:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.diode', []
)
    .config( [ 'symbolManagerProvider',
        function ( symbolManagerProvider ) {
            symbolManagerProvider.registerSymbol( {
                type: 'diode',
                directive: null,
                svgDecoration: 'images/symbols.svg#icon-diode',
                labelPrefix: 'D',
                labelPosition: {
                    x: 10,
                    y: -8
                },
                width: 60,
                height: 15,
                ports: [ {
                    id: 'C',
                    wireAngle: 0,
                    wireLeadIn: 20,
                    label: 'C',
                    x: 0,
                    y: 7
                }, {
                    id: 'A',
                    wireAngle: 180,
                    wireLeadIn: 20,
                    label: 'A',
                    x: 60,
                    y: 7
                } ]
            } );
        }
    ] );
},{}],24:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.inductor', []
)
    .config( [ 'symbolManagerProvider',
        function ( symbolManagerProvider ) {
            symbolManagerProvider.registerSymbol( {
                type: 'inductor',
                directive: null,
                svgDecoration: 'images/symbols.svg#icon-inductor',
                labelPrefix: 'L',
                labelPosition: {
                    x: 10,
                    y: -8
                },
                width: 50,
                height: 10,
                ports: [ {
                    id: 'p1',
                    wireAngle: 180,
                    wireLeadIn: 20,
                    label: 'p1',
                    x: 0,
                    y: 6.5
                }, {
                    id: 'p2',
                    wireAngle: 0,
                    wireLeadIn: 20,
                    label: 'p2',
                    x: 50,
                    y: 6.5
                } ]
            } );
        }
    ] );
},{}],25:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.jFetP', []
)
    .config( [ 'symbolManagerProvider',
        function ( symbolManagerProvider ) {
            symbolManagerProvider.registerSymbol( {
                type: 'jFetP',
                directive: null,
                svgDecoration: 'images/symbols.svg#icon-jFetP',
                labelPrefix: 'Q',
                labelPosition: {
                    x: 60,
                    y: 12
                },
                width: 62,
                height: 70,
                ports: [ {
                    id: 's',
                    wireAngle: 270,
                    wireLeadIn: 20,
                    label: 'S',
                    x: 47,
                    y: 0
                }, {
                    id: 'd',
                    wireAngle: 90,
                    wireLeadIn: 20,
                    label: 'D',
                    x: 47,
                    y: 70
                }, {
                    id: 'g',
                    wireAngle: 180,
                    wireLeadIn: 20,
                    label: 'G',
                    x: 0,
                    y: 26
                } ]
            } );
        }
    ] );
},{}],26:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.opAmp', []
)
    .config( [ 'symbolManagerProvider',
        function ( symbolManagerProvider ) {
            symbolManagerProvider.registerSymbol( {
                type: 'opAmp',
                directive: null,
                svgDecoration: 'images/symbols.svg#icon-opAmp',
                labelPrefix: 'A',
                labelPosition: {
                    x: 90,
                    y: 15
                },
                width: 140,
                height: 100,
                ports: [ {
                    id: 'Vs+',
                    wireAngle: 270,
                    wireLeadIn: 20,
                    label: 'Vs+',
                    x: 65,
                    y: 0
                }, {
                    id: 'Vout',
                    wireAngle: 0,
                    wireLeadIn: 20,
                    label: 'Vout',
                    x: 140,
                    y: 50
                }, {
                    id: 'Vs-',
                    wireAngle: 90,
                    wireLeadIn: 20,
                    label: 'Vs-',
                    x: 65,
                    y: 100
                }, {
                    id: 'V-',
                    wireAngle: 180,
                    wireLeadIn: 20,
                    label: 'V-',
                    x: 0,
                    y: 75
                }, {
                    id: 'V+',
                    wireAngle: 180,
                    wireLeadIn: 20,
                    label: 'V+',
                    x: 0,
                    y: 25
                } ]
            } );
        }
    ] );
},{}],27:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.resistor', []
)
    .config( [ 'symbolManagerProvider',
        function ( symbolManagerProvider ) {
            symbolManagerProvider.registerSymbol( {
                type: 'resistor',
                symbolComponent: null,
                svgDecoration: 'images/symbols.svg#icon-resistor',
                labelPrefix: 'R',
                labelPosition: {
                    x: 10,
                    y: -8
                },
                width: 60,
                height: 10,
                ports: [ {
                    id: 'p1',
                    wireAngle: 180,
                    wireLeadIn: 20,
                    label: 'p1',
                    x: 0,
                    y: 5
                }, {
                    id: 'p2',
                    wireAngle: 0,
                    wireLeadIn: 20,
                    label: 'p2',
                    x: 60,
                    y: 5
                } ]
            } );
        }
    ] );
},{}],28:[function(require,module,exports){

},{}],29:[function(require,module,exports){
/*globals angular*/

'use strict';

var glMatrix = require( 'glMatrix' );

var ComponentPort = function ( descriptor ) {

    angular.extend( this, descriptor );

};

ComponentPort.prototype.getGridPosition = function () {

    var position,
        positionVector;

    if ( angular.isObject( this.portSymbol ) && angular.isObject( this.parentComponent ) ) {

        positionVector = glMatrix.vec2.create();
        glMatrix.vec2.set( positionVector, this.portSymbol.x, this.portSymbol.y );

        glMatrix.vec2.transformMat3( positionVector, positionVector, this.parentComponent.getTransformationMatrix() );

        position = {

            x: positionVector[ 0 ],
            y: positionVector[ 1 ]

        };

    }

    return position;

};

module.exports = ComponentPort;
},{"glMatrix":3}],30:[function(require,module,exports){
/*globals angular*/

'use strict';

var Diagram = function (descriptor) {

    angular.extend(this, descriptor);

    this.components = [];
    this.componentsById = {};
    this.wires = [];
    this.wiresById = {};
    this.wiresByComponentId = {};

    this.config = {
        editable: true,
        disallowSelection: false,
        width: 5000,
        height: 5000
    };

    this.state = {
        selectedComponentIds: []
    };

};

Diagram.prototype.addComponent = function (aDiagramComponent) {

    if (angular.isObject(aDiagramComponent) && !angular.isDefined(this.componentsById[aDiagramComponent.id])) {

        this.componentsById[aDiagramComponent.id] = aDiagramComponent;
        this.components.push(aDiagramComponent);

    }

};

Diagram.prototype.addWire = function (aWire) {

    var self=this,
        registerWireForEnds;

    registerWireForEnds = function (wire) {

        var componentId;

        componentId = wire.end1.component.id;

        self.wiresByComponentId[componentId] = self.wiresByComponentId[componentId] || [];

        if (self.wiresByComponentId[componentId].indexOf(wire) === -1) {
            self.wiresByComponentId[componentId].push(wire);
        }

        componentId = wire.end2.component.id;

        self.wiresByComponentId[componentId] = self.wiresByComponentId[componentId] || [];

        if (self.wiresByComponentId[componentId].indexOf(wire) === -1) {
            self.wiresByComponentId[componentId].push(wire);
        }

    };


    if (angular.isObject(aWire) && !angular.isDefined(this.wiresById[aWire.id])) {

        this.wiresById[aWire.id] = aWire;
        this.wires.push(aWire);

        registerWireForEnds(aWire);

    }

};

Diagram.prototype.getWiresForComponents = function (components) {

    var self = this,
        setOfWires = [];

    angular.forEach(components, function (component) {

        angular.forEach(self.wiresByComponentId[component.id], function (wire) {

            if (setOfWires.indexOf(wire) === -1) {
                setOfWires.push(wire);
            }
        });

    });

    return setOfWires;

};


module.exports = Diagram;

},{}],31:[function(require,module,exports){
/*globals angular*/

'use strict';

var glMatrix = require( 'glMatrix' );

var DiagramComponent = function ( descriptor ) {

    if ( !angular.isObject( descriptor.symbol ) ) {
        throw new Error( 'No symbol found for component ' + this.id );
    }

    angular.extend( this, descriptor );

    // For rotation
    this._centerOffset = [ this.symbol.width / 2, this.symbol.height / 2 ];

};

DiagramComponent.prototype.isInViewPort = function ( viewPort, padding ) {

    //TODO: count width and height for orientation
    padding = padding || {
        x: 0,
        y: 0
    };

    return (
        angular.isObject( viewPort ) &&
        this.x + this.symbol.width >= ( viewPort.left + padding.x ) &&
        this.x <= ( viewPort.right - padding.x ) &&
        this.y + this.symbol.height >= ( viewPort.top + padding.y ) &&
        this.y <= ( viewPort.bottom - padding.y ) );
};

DiagramComponent.prototype.getTransformationMatrix = function () {

    if ( !angular.isArray( this.transformationMatrix ) ) {
        this.updateTransformationMatrix();
    }

    return this.transformationMatrix;

};


DiagramComponent.prototype.getSVGTransformationMatrix = function () {

    if ( !angular.isArray( this.svgTransformationMatrix ) ) {
        this.updateTransformationMatrix();
    }

    return this.svgTransformationMatrix;

};

DiagramComponent.prototype.getSVGTransformationString = function () {

    var transMatrix = this.getSVGTransformationMatrix();

    return transMatrix.join( ', ' );
};

DiagramComponent.prototype.updateTransformationMatrix = function () {

    var rotationRad,
        //sinA, cosA,
        translation,
        transformMat3,
        result;

    if ( angular.isNumber( this.rotation ) &&
        angular.isNumber( this.x ),
        angular.isNumber( this.y ) ) {

        rotationRad = this.rotation / 180 * Math.PI;

        transformMat3 = glMatrix.mat3.create();

        translation = glMatrix.vec2.create();

        glMatrix.vec2.set( translation, this.x + this._centerOffset[0], this.y + this._centerOffset[1]);

        glMatrix.mat3.translate(
            transformMat3,
            transformMat3,
            translation
        );

        glMatrix.mat3.rotate(
            transformMat3,
            transformMat3,
            rotationRad
        );

        glMatrix.vec2.set( translation, -this._centerOffset[0], -this._centerOffset[1]);

        glMatrix.mat3.translate(
            transformMat3,
            transformMat3,
            translation
        );

        this.transformationMatrix = transformMat3;

        this.svgTransformationMatrix = [
            transformMat3[ 0 ],
            transformMat3[ 1 ],
            transformMat3[ 3 ],
            transformMat3[ 4 ],
            transformMat3[ 6 ],
            transformMat3[ 7 ]
        ];

        result = this.transformationMatrix;

    }

    return result;

};

DiagramComponent.prototype.getPosition = function () {

    return {
        x: this.x,
        y: this.y
    };

};


DiagramComponent.prototype.setPosition = function ( x, y ) {

    if ( angular.isNumber( x ) && angular.isNumber( y ) ) {

        this.x = x;
        this.y = y;

        this.updateTransformationMatrix();

    } else {
        throw new Error( 'Coordinates must be numbers!' );
    }
};

DiagramComponent.prototype.rotate = function ( angle ) {

    if ( angular.isNumber( angle ) ) {

        this.rotation += angle;

        this.updateTransformationMatrix();

    } else {
        throw new Error( 'Angle must be number!' );
    }
};

DiagramComponent.prototype.registerPortInstances = function ( newPorts ) {

    var self = this;

    this.portInstances = this.portInstances || [];

    angular.forEach( newPorts, function ( newPort ) {

        newPort.parentComponent = self;
        self.portInstances.push( newPort );

    } );
};

DiagramComponent.prototype.getTransformedDimensions = function () {
    //  var width, height;
};

DiagramComponent.prototype.localToGlobal = function () {

    if ( !this.transformationMatrix ) {
        this.transformationMatrix = this.getTransformationMatrix();
    }



};

module.exports = DiagramComponent;
},{"glMatrix":3}],32:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function(symbolManager, diagramService, wiringService) {

    var getDiagram;

    getDiagram = function (countOfBoxes, countOfWires, canvasWidth, canvasHeight, symbolTypes) {

        var i, id,
            countOfTypes,
            symbol,
            typeId,
            type,
            x,
            y,
            symbolTypeIds,
            component1,
            component2,
            port1,
            port2,
            createdPorts,
            newDiagramComponent,

            portCreator,

            diagram,
            wire,

            Diagram,
            DiagramComponent,
            ComponentPort,
            Wire;

        Diagram = require('./Diagram');
        DiagramComponent = require('./DiagramComponent.js');
        ComponentPort = require('./ComponentPort');
        Wire = require('./Wire.js');

        diagram = new Diagram();

        portCreator = function (componentId, ports) {

            var portInstance,
                portInstances,
                portMapping;

            portInstances = [];
            portMapping = {};

            angular.forEach(ports, function (port) {

                portInstance = new ComponentPort({
                    id: componentId + '_' + port.id,
                    portSymbol: port
                });

                portInstances.push(portInstance);

                portMapping[ port.id ] = portInstance.id;
            });

            return {
                portInstances: portInstances,
                portMapping: portMapping
            };

        };

        symbolTypeIds = Object.keys(symbolTypes);

        countOfTypes = symbolTypeIds.length;

        diagram.config.width = canvasWidth;
        diagram.config.height = canvasHeight;

        for (i = 0; i < countOfBoxes; i++) {

            typeId = symbolTypeIds[ Math.floor(Math.random() * countOfTypes) ];
            type = symbolTypes[ typeId ];

            x = Math.round(Math.random() * ( canvasWidth - 1 ));
            y = Math.round(Math.random() * ( canvasHeight - 1 ));

            id = 'component_' + typeId + '_' + i;

            symbol = symbolManager.getSymbol(typeId);

            createdPorts = portCreator(id, symbol.ports);

            newDiagramComponent = new DiagramComponent({
                id: id,
                label: type.labelPrefix + i,
                x: x,
                y: y,
                z: i,
                rotation: Math.floor(Math.random() * 40) * 90,
                scaleX: 1, //[1, -1][Math.round(Math.random())],
                scaleY: 1, //[1, -1][Math.round(Math.random())],
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            newDiagramComponent.registerPortInstances(createdPorts.portInstances);

            newDiagramComponent.updateTransformationMatrix();

            diagram.addComponent(newDiagramComponent);


        }

        for (i = 0; i < countOfWires; i++) {

            id = 'wire_' + i;

            component1 = diagram.components.getRandomElement();

            port1 = component1.portInstances.getRandomElement();
            port2 = undefined;

            while (!angular.isDefined(port2) || port1 === port2) {

                component2 = diagram.components.getRandomElement();
                port2 = component2.portInstances.getRandomElement();
            }

            wire = new Wire({
                id: id,
                end1: {
                    component: component1,
                    port: port1
                },
                end2: {
                    component: component2,
                    port: port2
                }
            });

            wiringService.routeWire(wire, 'ElbowRouter');

            diagram.addWire(wire);

        }

        return diagram;

    };

    this.getDiagram = getDiagram;
};

},{"./ComponentPort":29,"./Diagram":30,"./DiagramComponent.js":31,"./Wire.js":34}],33:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function(symbolManagerProvider) {

    var generateSymbols;

    generateSymbols = function (count) {

        var i,
            portCount,
            symbol,
            makeARandomSymbol,
            makeSomePorts,
            minPorts = 6,
            maxPorts = 30,
            portWireLength = 20,

            spreadPortsAlongSide;

        spreadPortsAlongSide = function (somePorts, side, width, height) {
            var offset = 2 * portWireLength;

            angular.forEach(somePorts, function (aPort) {

                switch (side) {

                    case 'top':
                        aPort.x = offset;
                        aPort.y = 0;
                        aPort.wireAngle = -90;

                        offset += width / ( somePorts.length + 2 );

                        break;

                    case 'right':
                        aPort.x = width;
                        aPort.y = offset;
                        aPort.wireAngle = 0;

                        offset += height / ( somePorts.length + 2 );

                        break;

                    case 'bottom':
                        aPort.x = offset;
                        aPort.y = height;
                        aPort.wireAngle = 90;

                        offset += width / ( somePorts.length + 2 );

                        break;

                    case 'left':
                        aPort.x = 0;
                        aPort.y = offset;
                        aPort.wireAngle = 180;

                        offset += height / ( somePorts.length + 2 );

                        break;

                }

            });

        };


        makeSomePorts = function (countOfPorts) {

            var ports = [],
                port,
                placement,
                i,
                top = [],
                right = [],
                bottom = [],
                left = [],
                width, height,
                sides = [top, right, bottom, left],
                portSpacing = 20,
                minWidth = 140,
                minHeight = 80;

            for (i = 0; i < countOfPorts; i++) {

                port = {
                    id: 'p_' + i,
                    label: 'Port-' + i,
                    wireLeadIn: 20
                };

                placement = Math.round(Math.random() * 3);

                sides[placement].push(port);
            }

            width = Math.max(
                portSpacing * top.length + 4 * portWireLength,
                portSpacing * bottom.length + 4 * portWireLength,
                minWidth
            );

            height = Math.max(
                portSpacing * left.length + 4 * portWireLength,
                portSpacing * right.length + 4 * portWireLength,
                minHeight
            );

            spreadPortsAlongSide(top, 'top', width, height);
            spreadPortsAlongSide(right, 'right', width, height);
            spreadPortsAlongSide(bottom, 'bottom', width, height);
            spreadPortsAlongSide(left, 'left', width, height);


            ports = ports.concat(top)
                .concat(right)
                .concat(bottom)
                .concat(left);

            return {
                ports: ports,
                width: width,
                height: height
            };

        };

        makeARandomSymbol = function (idPostfix, countOfPorts) {

            var portsAndSizes = makeSomePorts(countOfPorts);

            return  {
                type: 'random_' + idPostfix,
                symbolComponent: 'box',
                svgDecoration: null,
                labelPrefix: 'RND_' + countOfPorts + '_' + idPostfix + ' ',
                labelPosition: {
                    x: portWireLength + 10,
                    y: portWireLength + 20
                },
                portWireLength: portWireLength,
                width: portsAndSizes.width,
                height: portsAndSizes.height,
                ports: portsAndSizes.ports,
                boxHeight: portsAndSizes.height - 2 * portWireLength,
                boxWidth: portsAndSizes.width - 2 * portWireLength
            };


        };

        for (i = 0; i < count; i++) {

            portCount = Math.max(
                Math.floor(Math.random() * maxPorts),
                minPorts
            );

            symbol = makeARandomSymbol(i, portCount);

            symbolManagerProvider.registerSymbol(symbol);

        }

    };



    this.generateSymbols = generateSymbols;

};

},{}],34:[function(require,module,exports){
/*globals angular*/

'use strict';

var Wire = function ( descriptor ) {

    angular.extend( this, descriptor );

    this.segments = [];

};

Wire.prototype.isInViewPort = function ( viewPort, padding ) {

    var j,
        shouldBeVisible,
        segment;

    padding = padding || {
        x: 0,
        y: 0
    };

    shouldBeVisible = false;

    if ( this.routerType === 'ElbowRouter' ) {

        if ( angular.isArray( this.segments ) ) {

            for ( j = 0; j < this.segments.length && !shouldBeVisible; j++ ) {

                segment = this.segments[ j ];

                if ( segment.orientation === 'vertical' ) {

                    if ( segment.x1 >= ( viewPort.left + padding.x ) &&
                        segment.x1 <= ( viewPort.right - padding.x ) ) {
                        shouldBeVisible = true;
                    }

                } else {

                    if ( segment.y1 >= ( viewPort.top + padding.y ) &&
                        segment.y1 <= ( viewPort.bottom - padding.y ) ) {
                        shouldBeVisible = true;
                    }

                }

            }

        }

    } else {
        shouldBeVisible = true;
    }

    return shouldBeVisible;

};

Wire.prototype.getEndPositions = function () {

    var port1Position,
        port2Position;

    port1Position = this.end1.port.getGridPosition();
    port2Position = this.end2.port.getGridPosition();

    return {

        end1: port1Position,
        end2: port2Position

    };

};

module.exports = Wire;
},{}],35:[function(require,module,exports){
/*globals angular */

'use strict';

angular.module('mms.designVisualization.diagramService', [
    'mms.designVisualization.symbolServices',
    'mms.designVisualization.operationsManager'
])
    .config(['symbolManagerProvider',
        'operationsManagerProvider',
        function (symbolManagerProvider) {

            var RandomSymbolGenerator,
                randomSymbolGenerator;


            RandomSymbolGenerator = require('./classes/RandomSymbolGenerator');
            randomSymbolGenerator = new RandomSymbolGenerator(symbolManagerProvider);

            randomSymbolGenerator.generateSymbols(7);

        }
    ])
    .service('diagramService', [
        '$q',
        '$timeout',
        'symbolManager',
        '$stateParams',
        'wiringService',
        'operationsManager',
        function ($q, $timeout, symbolManager, $stateParams, wiringService/*, operationsManager*/) {

            var
                self = this,

                diagrams,

                symbolTypes,

                DummyDiagramGenerator,
                dummyDiagramGenerator,

                DiagramComponent,
                ComponentPort,
                Wire;

            diagrams = {};

            DummyDiagramGenerator = require('./classes/DummyDiagramGenerator.js');

            DiagramComponent = require('./classes/DiagramComponent.js');
            ComponentPort = require('./classes/ComponentPort');
            Wire = require('./classes/Wire.js');

            dummyDiagramGenerator = new DummyDiagramGenerator(symbolManager, self, wiringService);

            symbolTypes = symbolManager.getAvailableSymbols();


            this.addComponent = function (diagramId, aDiagramComponent) {

                var diagram;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.addComponent(aDiagramComponent);

                }

            };

            this.addWire = function (diagramId, aWire) {

                var diagram;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.addWire(aWire);

                }

            };

            this.getWiresForComponents = function (diagramId, components) {

                var diagram;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.getWiresForComponents(components);

                }

            };

            this.getDiagram = function (diagramId) {

                var diagram;

                if (diagramId) {

                    diagram = diagrams[diagramId];

                }

                return diagram;

            };

            this.addDummyDiagram = function (diagramId, countOfBoxes, countOfWires, canvasWidth, canvasHeight) {

                var dummyDiagram;

                if (diagramId) {

                    dummyDiagram =
                        dummyDiagramGenerator.getDiagram(
                            countOfBoxes, countOfWires, canvasWidth, canvasHeight, symbolTypes
                        );

                    dummyDiagram.id = diagramId;

                    diagrams[diagramId] = dummyDiagram;

                }

                return dummyDiagram;

            };

            this.getHighestZ = function (diagramId) {

                var i,
                    component,
                    z;

                var diagram;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    for (i = 0; i < diagram.components.length; i++) {

                        component = diagram.components[i];

                        if (!isNaN(component.z)) {

                            if (isNaN(z)) {
                                z = component.z;
                            } else {

                                if (z < component.z) {
                                    z = component.z;
                                }

                            }

                        }
                    }

                    if (isNaN(z)) {
                        z = -1;
                    }

                }

                return z;

            };

//            operationsManager.registerOperation({
//                id: 'setComponentPosition',
//                commit: function (component, x, y) {
//
//                    if (angular.isObject(component)) {
//                        component.setPosition(x, y);
//                    }
//
//                }
//
//            });


            //this.generateDummyDiagram(1000, 200, 5000, 5000);
            //this.generateDummyDiagram(1000, 2000, 10000, 10000);
            //this.generateDummyDiagram(10, 5, 1200, 1200);
            //this.generateDummyDiagram( 100, 50, 3000, 3000 );

        }
    ]);

},{"./classes/ComponentPort":29,"./classes/DiagramComponent.js":31,"./classes/DummyDiagramGenerator.js":32,"./classes/RandomSymbolGenerator":33,"./classes/Wire.js":34}],36:[function(require,module,exports){
/*globals angular*/

'use strict';

var gridServicesModule = angular.module(
    'mms.designVisualization.gridService', [] );

gridServicesModule.service( 'gridService', [ '$log', '$rootScope', '$timeout',
    function ( $log, $rootScope, $timeout ) {

        var self = this,

            grids = {},

            numberOfChangesAllowedInOneCycle = 1,
            recalculateCycleDelay = 15,
            viewPortPadding = {
                x: -600,
                y: -600
            },

            recalculateVisibleDiagramComponents,
            _recalculateVisibleDiagramComponents,
            recalculateVisibleWires;

        recalculateVisibleWires = function ( grid ) {

            var index,
                i,
                wire;


            for (i = 0; i < grid.wires.length; i++) {

                wire = grid.wires[i];

                index = grid.visibleWires.indexOf(wire);

                if (wire.isInViewPort(grid.viewPort, viewPortPadding)) {

                    if (index === -1) {
                        grid.visibleWires.push(wire);
                    }

                } else {

                    if (index > -1) {
                        grid.visibleWires.splice(index, 1);
                    }

                }

            }

            //$log.debug( 'Number of visible wires: ' + grid.visibleWires.length );

        };

        recalculateVisibleDiagramComponents = function( grid, startIndex ) {

            if (angular.isArray(grid.components) && angular.isArray(grid.wires)) {

                if (grid.recalculateVisibleDiagramComponentsPromise) {

                    if ($timeout.cancel(grid.recalculateVisibleDiagramComponentsPromise)) {
                        console.log('had to kill');
                    }

                }

                grid.recalculateVisibleDiagramComponentsPromise = $timeout(
                    function () {
                        _recalculateVisibleDiagramComponents(grid, startIndex);
                    },

                    recalculateCycleDelay
                );
            }
        };

        _recalculateVisibleDiagramComponents = function ( grid, startIndex ) {

            var i, component,

                countOfChanges = 0,
                changesLimitReached = false,
                index;

            grid.insideVisibleDiagramComponentsRecalculate = true;


            if (!changesLimitReached) {
                recalculateVisibleWires( grid );
            }

            startIndex = startIndex || 0;

            for (i = startIndex; i< grid.components.length && changesLimitReached === false; i++) {

                component = grid.components[i];


                index = grid.visibleDiagramComponents.indexOf( component );

                if ( component.isInViewPort( grid.viewPort, viewPortPadding ) ) {

                    if ( index === -1 ) {
                        grid.visibleDiagramComponents.push( component );
                        countOfChanges++;
                    }
                } else {

                    if ( index > -1 ) {
                        grid.visibleDiagramComponents.splice( index, 1 );
                        //countOfChanges++;
                    }
                }

                if ( countOfChanges >= numberOfChangesAllowedInOneCycle ) {
                    changesLimitReached = true;
                }

            }

            //$log.debug( 'Number of changes compared to previous diagram state:', countOfChanges );

            if ( !changesLimitReached ) {

                self.reorderVisibleComponents( grid.id );

                grid.insideVisibleDiagramComponentsRecalculate = false;

                if (!grid.initialized) {

                    grid.initialized = true;

                    $timeout(function() {
                        $rootScope.$broadcast('GridInitialized', grid.id);
                    });

                }

            } else {

                recalculateVisibleDiagramComponents(grid, i);

            }

        };

        this.invalidateVisibleDiagramComponents = function ( gridId ) {

            var grid;

            grid = grids[ gridId ];

            if ( angular.isDefined( grid ) ) {

                if ( !grid.insideVisibleDiagramComponentsRecalculate ) {

                    recalculateVisibleDiagramComponents(grid);

                }
            }

        };


        this.createGrid = function ( id, diagram ) {

            var grid;

            if ( !angular.isDefined( grids[ id ] ) ) {
                grid = grids[ id ] = {
                    id: id,
                    components: diagram.components,
                    visibleDiagramComponents: [],
                    wires: diagram.wires,
                    visibleWires: [],
                    viewPort: {},
                    insideVisibleDiagramComponentsRecalculate: false,
                    initialized: false
                };
            } else {
                throw ( 'Grid was already defined!', id );
            }

            return {
                components: grid.visibleDiagramComponents,
                wires: grid.visibleWires
            };
        };


        this.setVisibleArea = function ( gridId, viewPort ) {
            var grid = grids[ gridId ];

            if ( angular.isDefined( grid ) ) {

                if ( angular.isDefined( viewPort ) ) {

                    grid.viewPort = viewPort;

                    self.invalidateVisibleDiagramComponents( grid.id );

                }

            } else {
                throw ( 'Grid was not defined!', gridId );
            }

        };

        this.reorderVisibleComponents = function ( gridId ) {

            var grid = grids[ gridId ];

            if ( angular.isDefined( grid ) ) {
                grid.visibleDiagramComponents.sort( function ( a, b ) {

                    if ( a.z > b.z ) {
                        return 1;
                    }

                    if ( a.z < b.z ) {
                        return -1;
                    }

                    return 0;

                } );
            }

        };

    }
] );

},{}],37:[function(require,module,exports){
/*globals angular*/

'use strict';

var operationsManagerModule = angular.module(
    'mms.designVisualization.operationsManager', []);

operationsManagerModule.provider('operationsManager', function OperationsManagerProvider() {
    var self,
        availableOperations;

    self = this;

    availableOperations = {};

    this.registerOperation = function (operationDescriptor) {

        if (angular.isObject(operationDescriptor) &&
            angular.isString(operationDescriptor.id)) {
            availableOperations[ operationDescriptor.id ] = operationDescriptor.operationClass;
        }
    };

    this.$get = [

        function () {

            var OperationsManager;

            OperationsManager = function () {

                this.registerOperation = function (operationDescriptor) {

                    if (angular.isObject(operationDescriptor) &&
                        angular.isString(operationDescriptor.id)) {
                        availableOperations[ operationDescriptor.id ] = operationDescriptor.operationClass;
                    }

                };

                this.getAvailableOperations = function () {
                    return availableOperations;
                };

                this.initNew = function (operationId) {

                    var OperationClass,
                        operationInstance;

                    OperationClass = availableOperations[ operationId ];

                    if (angular.isFunction(OperationClass)) {

                        operationInstance = new OperationClass();

                        Array.prototype.shift.call(arguments);

                        operationInstance.init.apply(operationInstance, arguments);

                    }

                    return operationInstance;
                };

            };

            return new OperationsManager();

        }
    ];
});
},{}],38:[function(require,module,exports){
/*globals angular*/

'use strict';

var symbolServicesModule = angular.module(
    'mms.designVisualization.symbolServices', [] );

symbolServicesModule.provider( 'symbolManager', function SymbolManagerProvider() {
    var availableSymbols = {};

    this.registerSymbol = function ( symbolDescriptor ) {

        if ( angular.isObject( symbolDescriptor ) &&
            angular.isString( symbolDescriptor.type ) ) {
            availableSymbols[ symbolDescriptor.type ] = symbolDescriptor;
        }
    };

    this.$get = [

        function () {

            var SymbolManager;

            SymbolManager = function () {

                this.getAvailableSymbols = function () {
                    return availableSymbols;
                };

                this.getSymbol = function ( symbolType ) {
                    return availableSymbols[ symbolType ];
                };

//                this.getSymbolElementForType = function ( symbolType ) {
//
//                    var result = availableSymbols[ symbolType ] && availableSymbols[ symbolType ].directive;
//
//                    if ( !result ) {
//                        result = 'resistor';
//                    }
//
//                    return result;
//                };
            };

            return new SymbolManager();

        }
    ];
} );
},{}],39:[function(require,module,exports){
/*globals angular*/

'use strict';

var ElbowRouter = function () {

    var self = this;

    this.name = 'ElbowRouter';

    this.makeSegments = function ( points, method ) {

        var i,
            point1, elbow, point2,
            segments;

        method = method || 'verticalFirst';

        if ( angular.isArray( points ) && points.length >= 2 ) {

            segments = [];

            for ( i = 0; i < points.length - 1; i++ ) {

                point1 = points[ i ];
                point2 = points[ i + 1 ];

                if ( method === 'verticalFirst' ) {

                    elbow = {
                        x: point1.x,
                        y: point2.y
                    };

                } else {

                    elbow = {
                        x: point1.y,
                        y: point2.x
                    };

                }

                segments.push( {

                    type: 'line',

                    x1: point1.x,
                    y1: point1.y,

                    x2: elbow.x,
                    y2: elbow.y,

                    router: self.name,
                    orientation: ( method === 'verticalFirst' ) ? 'vertical' : 'horizontal'

                }, {

                    type: 'line',

                    x1: elbow.x,
                    y1: elbow.y,

                    x2: point2.x,
                    y2: point2.y,

                    router: self.name,
                    orientation: ( method === 'verticalFirst' ) ? 'horizontal' : 'vertical'

                } );

            }

        }

        return segments;

    };

};

module.exports = ElbowRouter;
},{}],40:[function(require,module,exports){
/*globals angular*/

'use strict';

var SimpleRouter = function () {

    this.makeSegments = function ( points ) {

        var i,
            point1, point2,
            segments;

        if ( angular.isArray( points ) && points.length >= 2 ) {

            segments = [];

            for ( i = 0; i < points.length - 1; i++ ) {

                point1 = points[ i ];
                point2 = points[ i + 1 ];

                segments.push( {

                    type: 'line',

                    x1: point1.x,
                    y1: point1.y,

                    x2: point2.x,
                    y2: point2.y

                } );

            }

        }

        return segments;

    };

};

module.exports = SimpleRouter;
},{}],41:[function(require,module,exports){
/*globals angular*/

'use strict';

var wiringServicesModule = angular.module(
    'mms.designVisualization.wiringService', [] );

wiringServicesModule.service( 'wiringService', [ '$log', '$rootScope', '$timeout',
    function () {

        var self = this,
            SimpleRouter = require( './classes/SimpleRouter.js' ),
            ElbowRouter = require( './classes/ElbowRouter.js' ),
            routers = {

                SimpleRouter: new SimpleRouter(),
                ElbowRouter: new ElbowRouter()

            };

        this.getSegmentsBetweenPositions = function ( endPositions, routerType ) {

            var segments,
                router;

            router = routers[ routerType ];

            if ( angular.isObject( router ) && angular.isFunction( router.makeSegments ) ) {
                segments = router.makeSegments(
                    [ endPositions.end1, endPositions.end2 ] );
            }

            return segments;

        };

        this.routeWire = function ( wire, routerType ) {

            var router, endPositions;

            routerType = routerType || 'ElbowRouter';

            router = routers[ routerType ];

            if ( angular.isObject( router ) && angular.isFunction( router.makeSegments ) ) {

                endPositions = wire.getEndPositions();

                wire.segments = router.makeSegments(
                    [ endPositions.end1, endPositions.end2 ] );

                wire.routerType = routerType;
            }

        };

        this.adjustWireEndSegments = function ( wire ) {

            var firstSegment,
                secondSegment,
                secondToLastSegment,
                lastSegment,
                endPositions,
                newSegments,
                pos;

            endPositions = wire.getEndPositions();

            if ( angular.isArray( wire.segments ) && wire.segments.length > 1 ) {

                firstSegment = wire.segments[ 0 ];

                if ( firstSegment.x1 !== endPositions.end1.x || firstSegment.y1 !== endPositions.end1.y ) {

                    if ( firstSegment.router === 'ElbowRouter' ) {

                        secondSegment = wire.segments[ 1 ];

                        pos = {
                            x: secondSegment.x2,
                            y: secondSegment.y2
                        };

                        wire.segments.splice( 0, 2 );

                    } else {
                        pos = {
                            x: firstSegment.x2,
                            y: firstSegment.y2
                        };

                        wire.segments.splice( 0, 1 );
                    }

                    newSegments = self.getSegmentsBetweenPositions( {
                        end1: endPositions.end1,
                        end2: pos
                    }, firstSegment.router );

                    wire.segments = newSegments.concat( wire.segments );

                }

                lastSegment = wire.segments[ wire.segments.length - 1 ];

                if ( lastSegment.x2 !== endPositions.end2.x || lastSegment.y2 !== endPositions.end2.y ) {

                    if ( lastSegment.router === 'ElbowRouter' ) {

                        secondToLastSegment = wire.segments[ wire.segments.length - 2 ];

                        pos = {
                            x: secondToLastSegment.x1,
                            y: secondToLastSegment.y1
                        };

                        wire.segments.splice( wire.segments.length - 2, 2 );

                    } else {
                        pos = {
                            x: lastSegment.x1,
                            y: lastSegment.y1
                        };

                        wire.segments.splice( wire.segments.length - 1, 1 );
                    }

                    newSegments = self.getSegmentsBetweenPositions( {
                        end1: pos,
                        end2: endPositions.end2
                    }, lastSegment.router );

                    wire.segments = wire.segments.concat( newSegments );

                }

            } else {
                self.routeWire( wire );
            }

        };

    }
] );
},{"./classes/ElbowRouter.js":39,"./classes/SimpleRouter.js":40}],42:[function(require,module,exports){
'use strict';

require( 'Array.prototype.find' );

if ( !Array.prototype.findById ) {
    Array.prototype.findById = function ( id ) {
        return this.find( function ( a ) {
            return a.id !== undefined && a.id === id;
        } );
    };
}

if ( !Array.prototype.getRandomElement ) {
    Array.prototype.getRandomElement = function () {
        return this[ Math.round( Math.random() * ( this.length - 1 ) ) ];
    };
}

if ( !Array.prototype.shuffle ) {
    Array.prototype.shuffle = function () {
        var currentIndex = this.length,
            temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while ( 0 !== currentIndex ) {

            // Pick a remaining element...
            randomIndex = Math.floor( Math.random() * currentIndex );
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = this[ currentIndex ];
            this[ currentIndex ] = this[ randomIndex ];
            this[ randomIndex ] = temporaryValue;
        }

        return this;
    };
}
},{"Array.prototype.find":2}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvbW1zQXBwL2FwcC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvQXJyYXkucHJvdG90eXBlLmZpbmQvaW5kZXguanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9ib3dlcl9jb21wb25lbnRzL2dsLW1hdHJpeC9kaXN0L2dsLW1hdHJpeC1taW4uanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2J1c3lDb3Zlci9idXN5Q292ZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2NvbXBvbmVudFdpcmUvY29tcG9uZW50V2lyZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvY29tcG9uZW50V2lyZS9jb21wb25lbnRXaXJlU2VnbWVudC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGVzaWduRWRpdG9yL2Rlc2lnbkVkaXRvci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGlhZ3JhbUNvbnRhaW5lci9jbGFzc2VzL1Njcm9sbEhhbmRsZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2RpYWdyYW1Db250YWluZXIvZGlhZ3JhbUNvbnRhaW5lci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZHJhd2luZ0dyaWQvZHJhd2luZ0dyaWQuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2ZhYnJpY0NhbnZhcy9mYWJyaWNDYW52YXMuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3BvcnQvcG9ydC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvcmVzaXppbmcvcmVzaXplVG9IZWlnaHQuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3Jlc2l6aW5nL3Jlc2l6ZVRvV2luZG93LmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zdmdEaWFncmFtL2NsYXNzZXMvQ29tcG9uZW50RHJhZ0hhbmRsZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vY2xhc3Nlcy9Db21wb25lbnRTZWxlY3Rpb25IYW5kbGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zdmdEaWFncmFtL2NsYXNzZXMvV2lyZURyYXdIYW5kbGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zdmdEaWFncmFtL2NsYXNzZXMvY29udGV4dE1lbnVIYW5kbGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zdmdEaWFncmFtL3N2Z0RpYWdyYW0uanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvYm94L2JveC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9jYXBhY2l0b3IvY2FwYWNpdG9yLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2NvbXBvbmVudFN5bWJvbC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9kaW9kZS9kaW9kZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9pbmR1Y3Rvci9pbmR1Y3Rvci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9qRmV0UC9qRmV0UC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9vcEFtcC9vcEFtcC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9yZXNpc3Rvci9yZXNpc3Rvci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2xpYnJhcnlJbmNsdWRlcy5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvQ29tcG9uZW50UG9ydC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvRGlhZ3JhbS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvRGlhZ3JhbUNvbXBvbmVudC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvRHVtbXlEaWFncmFtR2VuZXJhdG9yLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvZGlhZ3JhbVNlcnZpY2UvY2xhc3Nlcy9SYW5kb21TeW1ib2xHZW5lcmF0b3IuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL1dpcmUuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9kaWFncmFtU2VydmljZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2dyaWRTZXJ2aWNlL2dyaWRTZXJ2aWNlLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvb3BlcmF0aW9uc01hbmFnZXIvb3BlcmF0aW9uc01hbmFnZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9zeW1ib2xTZXJ2aWNlcy9zeW1ib2xTZXJ2aWNlcy5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL3dpcmluZ1NlcnZpY2UvY2xhc3Nlcy9FbGJvd1JvdXRlci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL3dpcmluZ1NlcnZpY2UvY2xhc3Nlcy9TaW1wbGVSb3V0ZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy93aXJpbmdTZXJ2aWNlL3dpcmluZ1NlcnZpY2UuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25QQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL2xpYnJhcnlJbmNsdWRlcy5qcycpO1xuXG5yZXF1aXJlKCcuL3V0aWxzLmpzJyk7XG5cbnJlcXVpcmUoJy4vc2VydmljZXMvb3BlcmF0aW9uc01hbmFnZXIvb3BlcmF0aW9uc01hbmFnZXIuanMnKTtcblxucmVxdWlyZSgnLi9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9kaWFncmFtU2VydmljZS5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9ncmlkU2VydmljZS9ncmlkU2VydmljZS5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy93aXJpbmdTZXJ2aWNlL3dpcmluZ1NlcnZpY2UuanMnKTtcblxucmVxdWlyZSgnLi9kaXJlY3RpdmVzL2RpYWdyYW1Db250YWluZXIvZGlhZ3JhbUNvbnRhaW5lci5qcycpO1xucmVxdWlyZSgnLi9kaXJlY3RpdmVzL2ZhYnJpY0NhbnZhcy9mYWJyaWNDYW52YXMuanMnKTtcbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9zdmdEaWFncmFtL3N2Z0RpYWdyYW0uanMnKTtcblxucmVxdWlyZSgnLi9kaXJlY3RpdmVzL3N5bWJvbHMvY29tcG9uZW50U3ltYm9sLmpzJyk7XG5cbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9yZXNpemluZy9yZXNpemVUb0hlaWdodC5qcycpO1xucmVxdWlyZSgnLi9kaXJlY3RpdmVzL3Jlc2l6aW5nL3Jlc2l6ZVRvV2luZG93LmpzJyk7XG5cbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9idXN5Q292ZXIvYnVzeUNvdmVyLmpzJyk7XG5cbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9kZXNpZ25FZGl0b3IvZGVzaWduRWRpdG9yJyk7XG5cbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcbiAgICAndWkucm91dGVyJyxcblxuICAgICdnbWUuc2VydmljZXMnLFxuXG4gICAgJ2lzaXMudWkuY29tcG9uZW50cycsXG5cbiAgICAnY3lwaHkuY29tcG9uZW50cycsXG5cbiAgICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXG4gICAgJ2N5cGh5Lm1tc0FwcC50ZW1wbGF0ZXMnLFxuXG4gICAgJ3VpLmJvb3RzdHJhcCcsXG5cbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ub3BlcmF0aW9uc01hbmFnZXInLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi53aXJpbmdTZXJ2aWNlJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZGlhZ3JhbVNlcnZpY2UnLFxuXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRpYWdyYW1Db250YWluZXInLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5mYWJyaWNDYW52YXMnLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zdmdEaWFncmFtJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scycsXG4gICAgJ21tcy5yZXNpemVUb1dpbmRvdycsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmJ1c3lDb3ZlcicsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRlc2lnbkVkaXRvcicsXG5cbiAgICAnYW5ndWNvbXBsZXRlLWFsdCcsXG4gICAgJ25nVG91Y2gnLFxuXG4gICAgJ25nTWF0ZXJpYWwnXG5dKTtcblxuQ3lQaHlBcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cbiAgICB2YXIgc2VsZWN0UHJvamVjdDtcblxuICAgIHNlbGVjdFByb2plY3QgPSB7XG4gICAgICAgIGxvYWQ6IGZ1bmN0aW9uICgkcSwgJHN0YXRlUGFyYW1zLCAkcm9vdFNjb3BlLCAkc3RhdGUsICRsb2csIGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlLCB3b3Jrc3BhY2VTZXJ2aWNlLCBkZXNpZ25TZXJ2aWNlLCAkdGltZW91dCkge1xuICAgICAgICAgICAgdmFyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIGRlZmVycmVkO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLm1haW5EYkNvbm5lY3Rpb25JZCA9ICdtbXMtbWFpbi1kYi1jb25uZWN0aW9uLWlkJztcblxuICAgICAgICAgICAgY29ubmVjdGlvbklkID0gJHJvb3RTY29wZS5tYWluRGJDb25uZWN0aW9uSWQ7XG4gICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGRhdGFTdG9yZVNlcnZpY2UuY29ubmVjdFRvRGF0YWJhc2UoY29ubmVjdGlvbklkLCB7XG4gICAgICAgICAgICAgICAgaG9zdDogd2luZG93LmxvY2F0aW9uLmJhc2VuYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdChjb25uZWN0aW9uSWQsICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHByb2plY3RJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdQcm9qZWN0IHNlbGVjdGVkJywgcHJvamVjdElkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLnByb2plY3RJZCA9IHByb2plY3RJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgd3NDb250ZXh0O1xuXG5cbiAgICAgICAgICAgICAgICAgICAgd3NDb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGI6ICRyb290U2NvcGUubWFpbkRiQ29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdXb3JrU3BhY2VzXycgKyAoIG5ldyBEYXRlKCkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyh3c0NvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKHdzQ29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdXb3JrU3BhY2Ugd2F0Y2hlciBpbml0aWFsaXplZCwgZGVzdHJveWVkOicsIGRlc3Ryb3llZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXN0cm95ZWQgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoV29ya3NwYWNlcyh3c0NvbnRleHQsZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZCcsIHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlJywgdXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmxvYWQnLCB1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYXNGb3VuZEZpcnN0V29ya3NwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRm91bmRGaXJzdERlc2lnbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGb3VuZEZpcnN0V29ya3NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZvdW5kRmlyc3REZXNpZ24gPSBmYWxzZTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLndvcmtzcGFjZXMsIGZ1bmN0aW9uICh3b3JrU3BhY2UpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFoYXNGb3VuZEZpcnN0V29ya3NwYWNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGb3VuZEZpcnN0V29ya3NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmFjdGl2ZVdvcmtTcGFjZSA9IHdvcmtTcGFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdBY3RpdmUgd29ya3NwYWNlOicsICRyb290U2NvcGUuYWN0aXZlV29ya1NwYWNlKTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0ZvdW5kRmlyc3RXb3Jrc3BhY2UpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnbnMod3NDb250ZXh0LCAkcm9vdFNjb3BlLmFjdGl2ZVdvcmtTcGFjZS5pZCxmdW5jdGlvbiAoLypkZXNpZ25zVXBkYXRlT2JqZWN0Ki8pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGVzaWduc0RhdGEpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkZXNpZ25zRGF0YS5kZXNpZ25zLCBmdW5jdGlvbiAoZGVzaWduKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFoYXNGb3VuZEZpcnN0RGVzaWduKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZvdW5kRmlyc3REZXNpZ24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5hY3RpdmVEZXNpZ24gPSBkZXNpZ247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdBY3RpdmUgZGVzaWduOicsICRyb290U2NvcGUuYWN0aXZlRGVzaWduKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0ZvdW5kRmlyc3REZXNpZ24pIHtcblxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKHdzQ29udGV4dCwgJHJvb3RTY29wZS5hY3RpdmVEZXNpZ24uaWQsIGZ1bmN0aW9uKGRlc2lnbkludGVyZmFjZXNVcGRhdGVPYmplY3QpIHtcbi8vXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihkZXNpZ25JbnRlcmZhY2VzKSB7XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkZXNpZ25JbnRlcmZhY2VzKTtcbi8vXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdDb3VsZCBub3QgZmluZCBkZXNpZ25zIGluIHdvcmtzcGFjZS4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCc0MDQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6ICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnQ291bGQgbm90IGZpbmQgd29ya3NwYWNlcyBpbiBwcm9qZWN0LicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCc0MDQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiAkc3RhdGVQYXJhbXMucHJvamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnV29rcnNwYWNlU2VydmljZSBkZXN0cm95ZWQuLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdPcGVuaW5nIHByb2plY3QgZXJyb3JlZDonLCAkc3RhdGVQYXJhbXMucHJvamVjdElkLCByZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJzQwNCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogJHN0YXRlUGFyYW1zLnByb2plY3RJZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL25vUHJvamVjdCcpO1xuXG5cbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2VkaXRvcicsIHtcbiAgICAgICAgICAgIHVybDogJy9lZGl0b3IvOnByb2plY3RJZCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2VkaXRvci5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHNlbGVjdFByb2plY3QsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRWRpdG9yVmlld0NvbnRyb2xsZXInXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnZWRpdG9yLmluQ29udGFpbmVyJywge1xuICAgICAgICAgICAgdXJsOiAnLzpjb250YWluZXJJZCdcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdub1Byb2plY3QnLCB7XG4gICAgICAgICAgICB1cmw6ICcvbm9Qcm9qZWN0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvbm9Qcm9qZWN0U3BlY2lmaWVkLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ05vUHJvamVjdENvbnRyb2xsZXInXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnNDA0Jywge1xuICAgICAgICAgICAgdXJsOiAnLzQwNC86cHJvamVjdElkJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdOb1Byb2plY3RDb250cm9sbGVyJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvNDA0Lmh0bWwnXG4gICAgICAgIH0pO1xufSk7XG5cbkN5UGh5QXBwLmNvbnRyb2xsZXIoJ01haW5OYXZpZ2F0b3JDb250cm9sbGVyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgJHdpbmRvdykge1xuXG4gICAgdmFyIGRlZmF1bHROYXZpZ2F0b3JJdGVtcztcblxuICAgIGRlZmF1bHROYXZpZ2F0b3JJdGVtcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdyb290JyxcbiAgICAgICAgICAgIGxhYmVsOiAnTWV0YU1vcnBob3NpcycsXG4gICAgICAgICAgICBpdGVtQ2xhc3M6ICdjeXBoeS1yb290J1xuICAgICAgICB9XG4gICAgXTtcblxuICAgICRzY29wZS5uYXZpZ2F0b3IgPSB7XG4gICAgICAgIHNlcGFyYXRvcjogdHJ1ZSxcbiAgICAgICAgaXRlbXM6IGFuZ3VsYXIuY29weShkZWZhdWx0TmF2aWdhdG9ySXRlbXMsIFtdKVxuICAgIH07XG5cbiAgICAkcm9vdFNjb3BlLiR3YXRjaCgncHJvamVjdElkJywgZnVuY3Rpb24gKHByb2plY3RJZCkge1xuXG4gICAgICAgIGlmIChwcm9qZWN0SWQpIHtcblxuICAgICAgICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IGFuZ3VsYXIuY29weShkZWZhdWx0TmF2aWdhdG9ySXRlbXMsIFtdKTtcbiAgICAgICAgICAgICRzY29wZS5uYXZpZ2F0b3IuaXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6ICdwcm9qZWN0JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogcHJvamVjdElkLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD0nICsgcHJvamVjdElkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IGFuZ3VsYXIuY29weShkZWZhdWx0TmF2aWdhdG9ySXRlbXMsIFtdKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdFZGl0b3JWaWV3Q29udHJvbGxlcicsIGZ1bmN0aW9uICgpIHtcblxufSk7XG5cbkN5UGh5QXBwLmNvbnRyb2xsZXIoJ05vUHJvamVjdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlLCAkc3RhdGVQYXJhbXMsICRodHRwLCAkbG9nLCAkc3RhdGUsIGdyb3dsKSB7XG5cbiAgICAkc2NvcGUucHJvamVjdElkID0gJHN0YXRlUGFyYW1zLnByb2plY3RJZDtcbiAgICAkc2NvcGUuZXJyb3JlZCA9IGZhbHNlO1xuXG4gICAgJHNjb3BlLnN0YXJ0TmV3UHJvamVjdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAkcm9vdFNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXG4gICAgICAgICRsb2cuZGVidWcoJ05ldyBwcm9qZWN0IGNyZWF0aW9uJyk7XG5cbiAgICAgICAgJGh0dHAuZ2V0KCcvcmVzdC9leHRlcm5hbC9jb3B5cHJvamVjdC9ub3JlZGlyZWN0JylcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgIHN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgICRyb290U2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ05ldyBwcm9qZWN0IGNyZWF0aW9uIHN1Y2Nlc3NmdWwnLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2VkaXRvcicsIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiBkYXRhXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICBlcnJvcihmdW5jdGlvbiAoZGF0YSwgc3RhdHVzKSB7XG5cbiAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdOZXcgcHJvamVjdCBjcmVhdGlvbiBmYWlsZWQnLCBzdGF0dXMpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdBbiBlcnJvciBvY2N1cmVkIHdoaWxlIHByb2plY3QgY3JlYXRpb24uIFBsZWFzZSByZXRyeSBsYXRlci4nKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTtcbiIsIi8vIEFycmF5LnByb3RvdHlwZS5maW5kIC0gTUlUIExpY2Vuc2UgKGMpIDIwMTMgUGF1bCBNaWxsZXIgPGh0dHA6Ly9wYXVsbWlsbHIuY29tPlxuLy8gRm9yIGFsbCBkZXRhaWxzIGFuZCBkb2NzOiBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2FycmF5LnByb3RvdHlwZS5maW5kXG4vLyBGaXhlcyBhbmQgdGVzdHMgc3VwcGxpZWQgYnkgRHVuY2FuIEhhbGwgPGh0dHA6Ly9kdW5jYW5oYWxsLm5ldD4gXG4oZnVuY3Rpb24oZ2xvYmFscyl7XG4gIGlmIChBcnJheS5wcm90b3R5cGUuZmluZCkgcmV0dXJuO1xuXG4gIHZhciBmaW5kID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgdmFyIGxpc3QgPSBPYmplY3QodGhpcyk7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoIDwgMCA/IDAgOiBsaXN0Lmxlbmd0aCA+Pj4gMDsgLy8gRVMuVG9VaW50MzI7XG4gICAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJyB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJlZGljYXRlKSAhPT0gJ1tvYmplY3QgRnVuY3Rpb25dJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkjZmluZDogcHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICBmb3IgKHZhciBpID0gMCwgdmFsdWU7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9O1xuXG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHtcbiAgICB0cnkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgJ2ZpbmQnLCB7XG4gICAgICAgIHZhbHVlOiBmaW5kLCBjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuZmluZCkge1xuICAgIEFycmF5LnByb3RvdHlwZS5maW5kID0gZmluZDtcbiAgfVxufSkodGhpcyk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgZ2wtbWF0cml4IC0gSGlnaCBwZXJmb3JtYW5jZSBtYXRyaXggYW5kIHZlY3RvciBvcGVyYXRpb25zXG4gKiBAYXV0aG9yIEJyYW5kb24gSm9uZXNcbiAqIEBhdXRob3IgQ29saW4gTWFjS2VuemllIElWXG4gKiBAdmVyc2lvbiAyLjIuMVxuICovXG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cbihmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD17fTt0eXBlb2YgZXhwb3J0cz09XCJ1bmRlZmluZWRcIj90eXBlb2YgZGVmaW5lPT1cImZ1bmN0aW9uXCImJnR5cGVvZiBkZWZpbmUuYW1kPT1cIm9iamVjdFwiJiZkZWZpbmUuYW1kPyh0LmV4cG9ydHM9e30sZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIHQuZXhwb3J0c30pKTp0LmV4cG9ydHM9dHlwZW9mIHdpbmRvdyE9XCJ1bmRlZmluZWRcIj93aW5kb3c6ZTp0LmV4cG9ydHM9ZXhwb3J0cyxmdW5jdGlvbihlKXtpZighdCl2YXIgdD0xZS02O2lmKCFuKXZhciBuPXR5cGVvZiBGbG9hdDMyQXJyYXkhPVwidW5kZWZpbmVkXCI/RmxvYXQzMkFycmF5OkFycmF5O2lmKCFyKXZhciByPU1hdGgucmFuZG9tO3ZhciBpPXt9O2kuc2V0TWF0cml4QXJyYXlUeXBlPWZ1bmN0aW9uKGUpe249ZX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLmdsTWF0cml4PWkpO3ZhciBzPU1hdGguUEkvMTgwO2kudG9SYWRpYW49ZnVuY3Rpb24oZSl7cmV0dXJuIGUqc307dmFyIG89e307by5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigyKTtyZXR1cm4gZVswXT0wLGVbMV09MCxlfSxvLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDIpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHR9LG8uZnJvbVZhbHVlcz1mdW5jdGlvbihlLHQpe3ZhciByPW5ldyBuKDIpO3JldHVybiByWzBdPWUsclsxXT10LHJ9LG8uY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGV9LG8uc2V0PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10LGVbMV09bixlfSxvLmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGV9LG8uc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlfSxvLnN1Yj1vLnN1YnRyYWN0LG8ubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlfSxvLm11bD1vLm11bHRpcGx5LG8uZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZX0sby5kaXY9by5kaXZpZGUsby5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGV9LG8ubWF4PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1heCh0WzBdLG5bMF0pLGVbMV09TWF0aC5tYXgodFsxXSxuWzFdKSxlfSxvLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm4sZVsxXT10WzFdKm4sZX0sby5zY2FsZUFuZEFkZD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10WzBdK25bMF0qcixlWzFdPXRbMV0rblsxXSpyLGV9LG8uZGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV07cmV0dXJuIE1hdGguc3FydChuKm4rcipyKX0sby5kaXN0PW8uZGlzdGFuY2Usby5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV07cmV0dXJuIG4qbityKnJ9LG8uc3FyRGlzdD1vLnNxdWFyZWREaXN0YW5jZSxvLmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXTtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtuKm4pfSxvLmxlbj1vLmxlbmd0aCxvLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV07cmV0dXJuIHQqdCtuKm59LG8uc3FyTGVuPW8uc3F1YXJlZExlbmd0aCxvLm5lZ2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZX0sby5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPW4qbityKnI7cmV0dXJuIGk+MCYmKGk9MS9NYXRoLnNxcnQoaSksZVswXT10WzBdKmksZVsxXT10WzFdKmkpLGV9LG8uZG90PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0qdFswXStlWzFdKnRbMV19LG8uY3Jvc3M9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0qblsxXS10WzFdKm5bMF07cmV0dXJuIGVbMF09ZVsxXT0wLGVbMl09cixlfSxvLmxlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV07cmV0dXJuIGVbMF09aStyKihuWzBdLWkpLGVbMV09cytyKihuWzFdLXMpLGV9LG8ucmFuZG9tPWZ1bmN0aW9uKGUsdCl7dD10fHwxO3ZhciBuPXIoKSoyKk1hdGguUEk7cmV0dXJuIGVbMF09TWF0aC5jb3MobikqdCxlWzFdPU1hdGguc2luKG4pKnQsZX0sby50cmFuc2Zvcm1NYXQyPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblsyXSppLGVbMV09blsxXSpyK25bM10qaSxlfSxvLnRyYW5zZm9ybU1hdDJkPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblsyXSppK25bNF0sZVsxXT1uWzFdKnIrblszXSppK25bNV0sZX0sby50cmFuc2Zvcm1NYXQzPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblszXSppK25bNl0sZVsxXT1uWzFdKnIrbls0XSppK25bN10sZX0sby50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bMTJdLGVbMV09blsxXSpyK25bNV0qaStuWzEzXSxlfSxvLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT1vLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj0yKSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdO3JldHVybiB0fX0oKSxvLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzIoXCIrZVswXStcIiwgXCIrZVsxXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzI9byk7dmFyIHU9e307dS5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigzKTtyZXR1cm4gZVswXT0wLGVbMV09MCxlWzJdPTAsZX0sdS5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbigzKTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdH0sdS5mcm9tVmFsdWVzPWZ1bmN0aW9uKGUsdCxyKXt2YXIgaT1uZXcgbigzKTtyZXR1cm4gaVswXT1lLGlbMV09dCxpWzJdPXIsaX0sdS5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGV9LHUuc2V0PWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXQsZVsxXT1uLGVbMl09cixlfSx1LmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGVbMl09dFsyXStuWzJdLGV9LHUuc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlWzJdPXRbMl0tblsyXSxlfSx1LnN1Yj11LnN1YnRyYWN0LHUubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlWzJdPXRbMl0qblsyXSxlfSx1Lm11bD11Lm11bHRpcGx5LHUuZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZVsyXT10WzJdL25bMl0sZX0sdS5kaXY9dS5kaXZpZGUsdS5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGVbMl09TWF0aC5taW4odFsyXSxuWzJdKSxlfSx1Lm1heD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5tYXgodFswXSxuWzBdKSxlWzFdPU1hdGgubWF4KHRbMV0sblsxXSksZVsyXT1NYXRoLm1heCh0WzJdLG5bMl0pLGV9LHUuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qbixlWzFdPXRbMV0qbixlWzJdPXRbMl0qbixlfSx1LnNjYWxlQW5kQWRkPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXRbMF0rblswXSpyLGVbMV09dFsxXStuWzFdKnIsZVsyXT10WzJdK25bMl0qcixlfSx1LmRpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdO3JldHVybiBNYXRoLnNxcnQobipuK3IqcitpKmkpfSx1LmRpc3Q9dS5kaXN0YW5jZSx1LnNxdWFyZWREaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXSxpPXRbMl0tZVsyXTtyZXR1cm4gbipuK3IqcitpKml9LHUuc3FyRGlzdD11LnNxdWFyZWREaXN0YW5jZSx1Lmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl07cmV0dXJuIE1hdGguc3FydCh0KnQrbipuK3Iqcil9LHUubGVuPXUubGVuZ3RoLHUuc3F1YXJlZExlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl07cmV0dXJuIHQqdCtuKm4rcipyfSx1LnNxckxlbj11LnNxdWFyZWRMZW5ndGgsdS5uZWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZX0sdS5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz1uKm4rcipyK2kqaTtyZXR1cm4gcz4wJiYocz0xL01hdGguc3FydChzKSxlWzBdPXRbMF0qcyxlWzFdPXRbMV0qcyxlWzJdPXRbMl0qcyksZX0sdS5kb3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXSp0WzBdK2VbMV0qdFsxXStlWzJdKnRbMl19LHUuY3Jvc3M9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPW5bMF0sdT1uWzFdLGE9blsyXTtyZXR1cm4gZVswXT1pKmEtcyp1LGVbMV09cypvLXIqYSxlWzJdPXIqdS1pKm8sZX0sdS5sZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXTtyZXR1cm4gZVswXT1pK3IqKG5bMF0taSksZVsxXT1zK3IqKG5bMV0tcyksZVsyXT1vK3IqKG5bMl0tbyksZX0sdS5yYW5kb209ZnVuY3Rpb24oZSx0KXt0PXR8fDE7dmFyIG49cigpKjIqTWF0aC5QSSxpPXIoKSoyLTEscz1NYXRoLnNxcnQoMS1pKmkpKnQ7cmV0dXJuIGVbMF09TWF0aC5jb3MobikqcyxlWzFdPU1hdGguc2luKG4pKnMsZVsyXT1pKnQsZX0sdS50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl07cmV0dXJuIGVbMF09blswXSpyK25bNF0qaStuWzhdKnMrblsxMl0sZVsxXT1uWzFdKnIrbls1XSppK25bOV0qcytuWzEzXSxlWzJdPW5bMl0qcituWzZdKmkrblsxMF0qcytuWzE0XSxlfSx1LnRyYW5zZm9ybU1hdDM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXTtyZXR1cm4gZVswXT1yKm5bMF0raSpuWzNdK3Mqbls2XSxlWzFdPXIqblsxXStpKm5bNF0rcypuWzddLGVbMl09cipuWzJdK2kqbls1XStzKm5bOF0sZX0sdS50cmFuc2Zvcm1RdWF0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz1uWzBdLHU9blsxXSxhPW5bMl0sZj1uWzNdLGw9ZipyK3Uqcy1hKmksYz1mKmkrYSpyLW8qcyxoPWYqcytvKmktdSpyLHA9LW8qci11KmktYSpzO3JldHVybiBlWzBdPWwqZitwKi1vK2MqLWEtaCotdSxlWzFdPWMqZitwKi11K2gqLW8tbCotYSxlWzJdPWgqZitwKi1hK2wqLXUtYyotbyxlfSx1LnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9W10scz1bXTtyZXR1cm4gaVswXT10WzBdLW5bMF0saVsxXT10WzFdLW5bMV0saVsyXT10WzJdLW5bMl0sc1swXT1pWzBdLHNbMV09aVsxXSpNYXRoLmNvcyhyKS1pWzJdKk1hdGguc2luKHIpLHNbMl09aVsxXSpNYXRoLnNpbihyKStpWzJdKk1hdGguY29zKHIpLGVbMF09c1swXStuWzBdLGVbMV09c1sxXStuWzFdLGVbMl09c1syXStuWzJdLGV9LHUucm90YXRlWT1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT1bXSxzPVtdO3JldHVybiBpWzBdPXRbMF0tblswXSxpWzFdPXRbMV0tblsxXSxpWzJdPXRbMl0tblsyXSxzWzBdPWlbMl0qTWF0aC5zaW4ocikraVswXSpNYXRoLmNvcyhyKSxzWzFdPWlbMV0sc1syXT1pWzJdKk1hdGguY29zKHIpLWlbMF0qTWF0aC5zaW4ociksZVswXT1zWzBdK25bMF0sZVsxXT1zWzFdK25bMV0sZVsyXT1zWzJdK25bMl0sZX0sdS5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPVtdLHM9W107cmV0dXJuIGlbMF09dFswXS1uWzBdLGlbMV09dFsxXS1uWzFdLGlbMl09dFsyXS1uWzJdLHNbMF09aVswXSpNYXRoLmNvcyhyKS1pWzFdKk1hdGguc2luKHIpLHNbMV09aVswXSpNYXRoLnNpbihyKStpWzFdKk1hdGguY29zKHIpLHNbMl09aVsyXSxlWzBdPXNbMF0rblswXSxlWzFdPXNbMV0rblsxXSxlWzJdPXNbMl0rblsyXSxlfSx1LmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT11LmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj0zKSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0sZVsyXT10W3UrMl0scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdLHRbdSsyXT1lWzJdO3JldHVybiB0fX0oKSx1LnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzMoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzM9dSk7dmFyIGE9e307YS5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig0KTtyZXR1cm4gZVswXT0wLGVbMV09MCxlWzJdPTAsZVszXT0wLGV9LGEuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNCk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0fSxhLmZyb21WYWx1ZXM9ZnVuY3Rpb24oZSx0LHIsaSl7dmFyIHM9bmV3IG4oNCk7cmV0dXJuIHNbMF09ZSxzWzFdPXQsc1syXT1yLHNbM109aSxzfSxhLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGV9LGEuc2V0PWZ1bmN0aW9uKGUsdCxuLHIsaSl7cmV0dXJuIGVbMF09dCxlWzFdPW4sZVsyXT1yLGVbM109aSxlfSxhLmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGVbMl09dFsyXStuWzJdLGVbM109dFszXStuWzNdLGV9LGEuc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlWzJdPXRbMl0tblsyXSxlWzNdPXRbM10tblszXSxlfSxhLnN1Yj1hLnN1YnRyYWN0LGEubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlWzJdPXRbMl0qblsyXSxlWzNdPXRbM10qblszXSxlfSxhLm11bD1hLm11bHRpcGx5LGEuZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZVsyXT10WzJdL25bMl0sZVszXT10WzNdL25bM10sZX0sYS5kaXY9YS5kaXZpZGUsYS5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGVbMl09TWF0aC5taW4odFsyXSxuWzJdKSxlWzNdPU1hdGgubWluKHRbM10sblszXSksZX0sYS5tYXg9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWF4KHRbMF0sblswXSksZVsxXT1NYXRoLm1heCh0WzFdLG5bMV0pLGVbMl09TWF0aC5tYXgodFsyXSxuWzJdKSxlWzNdPU1hdGgubWF4KHRbM10sblszXSksZX0sYS5zY2FsZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuLGVbMV09dFsxXSpuLGVbMl09dFsyXSpuLGVbM109dFszXSpuLGV9LGEuc2NhbGVBbmRBZGQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dFswXStuWzBdKnIsZVsxXT10WzFdK25bMV0qcixlWzJdPXRbMl0rblsyXSpyLGVbM109dFszXStuWzNdKnIsZX0sYS5kaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXSxpPXRbMl0tZVsyXSxzPXRbM10tZVszXTtyZXR1cm4gTWF0aC5zcXJ0KG4qbityKnIraSppK3Mqcyl9LGEuZGlzdD1hLmRpc3RhbmNlLGEuc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdLHM9dFszXS1lWzNdO3JldHVybiBuKm4rcipyK2kqaStzKnN9LGEuc3FyRGlzdD1hLnNxdWFyZWREaXN0YW5jZSxhLmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl0saT1lWzNdO3JldHVybiBNYXRoLnNxcnQodCp0K24qbityKnIraSppKX0sYS5sZW49YS5sZW5ndGgsYS5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM107cmV0dXJuIHQqdCtuKm4rcipyK2kqaX0sYS5zcXJMZW49YS5zcXVhcmVkTGVuZ3RoLGEubmVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGVbM109LXRbM10sZX0sYS5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bipuK3IqcitpKmkrcypzO3JldHVybiBvPjAmJihvPTEvTWF0aC5zcXJ0KG8pLGVbMF09dFswXSpvLGVbMV09dFsxXSpvLGVbMl09dFsyXSpvLGVbM109dFszXSpvKSxlfSxhLmRvdD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdKnRbMF0rZVsxXSp0WzFdK2VbMl0qdFsyXStlWzNdKnRbM119LGEubGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXSxvPXRbMl0sdT10WzNdO3JldHVybiBlWzBdPWkrciooblswXS1pKSxlWzFdPXMrciooblsxXS1zKSxlWzJdPW8rciooblsyXS1vKSxlWzNdPXUrciooblszXS11KSxlfSxhLnJhbmRvbT1mdW5jdGlvbihlLHQpe3JldHVybiB0PXR8fDEsZVswXT1yKCksZVsxXT1yKCksZVsyXT1yKCksZVszXT1yKCksYS5ub3JtYWxpemUoZSxlKSxhLnNjYWxlKGUsZSx0KSxlfSxhLnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM107cmV0dXJuIGVbMF09blswXSpyK25bNF0qaStuWzhdKnMrblsxMl0qbyxlWzFdPW5bMV0qcituWzVdKmkrbls5XSpzK25bMTNdKm8sZVsyXT1uWzJdKnIrbls2XSppK25bMTBdKnMrblsxNF0qbyxlWzNdPW5bM10qcituWzddKmkrblsxMV0qcytuWzE1XSpvLGV9LGEudHJhbnNmb3JtUXVhdD1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89blswXSx1PW5bMV0sYT1uWzJdLGY9blszXSxsPWYqcit1KnMtYSppLGM9ZippK2Eqci1vKnMsaD1mKnMrbyppLXUqcixwPS1vKnItdSppLWEqcztyZXR1cm4gZVswXT1sKmYrcCotbytjKi1hLWgqLXUsZVsxXT1jKmYrcCotdStoKi1vLWwqLWEsZVsyXT1oKmYrcCotYStsKi11LWMqLW8sZX0sYS5mb3JFYWNoPWZ1bmN0aW9uKCl7dmFyIGU9YS5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24odCxuLHIsaSxzLG8pe3ZhciB1LGE7bnx8KG49NCkscnx8KHI9MCksaT9hPU1hdGgubWluKGkqbityLHQubGVuZ3RoKTphPXQubGVuZ3RoO2Zvcih1PXI7dTxhO3UrPW4pZVswXT10W3VdLGVbMV09dFt1KzFdLGVbMl09dFt1KzJdLGVbM109dFt1KzNdLHMoZSxlLG8pLHRbdV09ZVswXSx0W3UrMV09ZVsxXSx0W3UrMl09ZVsyXSx0W3UrM109ZVszXTtyZXR1cm4gdH19KCksYS5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJ2ZWM0KFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIpXCJ9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS52ZWM0PWEpO3ZhciBmPXt9O2YuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNCk7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxmLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDQpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdH0sZi5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlfSxmLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0sZi50cmFuc3Bvc2U9ZnVuY3Rpb24oZSx0KXtpZihlPT09dCl7dmFyIG49dFsxXTtlWzFdPXRbMl0sZVsyXT1ufWVsc2UgZVswXT10WzBdLGVbMV09dFsyXSxlWzJdPXRbMV0sZVszXT10WzNdO3JldHVybiBlfSxmLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKnMtaSpyO3JldHVybiBvPyhvPTEvbyxlWzBdPXMqbyxlWzFdPS1yKm8sZVsyXT0taSpvLGVbM109bipvLGUpOm51bGx9LGYuYWRqb2ludD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF07cmV0dXJuIGVbMF09dFszXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZVszXT1uLGV9LGYuZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF0qZVszXS1lWzJdKmVbMV19LGYubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXSxmPW5bMl0sbD1uWzNdO3JldHVybiBlWzBdPXIqdStzKmEsZVsxXT1pKnUrbyphLGVbMl09cipmK3MqbCxlWzNdPWkqZitvKmwsZX0sZi5tdWw9Zi5tdWx0aXBseSxmLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK3MqdSxlWzFdPWkqYStvKnUsZVsyXT1yKi11K3MqYSxlWzNdPWkqLXUrbyphLGV9LGYuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXTtyZXR1cm4gZVswXT1yKnUsZVsxXT1pKnUsZVsyXT1zKmEsZVszXT1vKmEsZX0sZi5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQyKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIpXCJ9LGYuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikpfSxmLkxEVT1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVsyXT1yWzJdL3JbMF0sblswXT1yWzBdLG5bMV09clsxXSxuWzNdPXJbM10tZVsyXSpuWzFdLFtlLHQsbl19LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQyPWYpO3ZhciBsPXt9O2wuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNik7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlWzRdPTAsZVs1XT0wLGV9LGwuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNik7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzRdPWVbNF0sdFs1XT1lWzVdLHR9LGwuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlfSxsLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTEsZVs0XT0wLGVbNV09MCxlfSxsLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPW4qcy1yKmk7cmV0dXJuIGE/KGE9MS9hLGVbMF09cyphLGVbMV09LXIqYSxlWzJdPS1pKmEsZVszXT1uKmEsZVs0XT0oaSp1LXMqbykqYSxlWzVdPShyKm8tbip1KSphLGUpOm51bGx9LGwuZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF0qZVszXS1lWzFdKmVbMl19LGwubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPW5bMF0sbD1uWzFdLGM9blsyXSxoPW5bM10scD1uWzRdLGQ9bls1XTtyZXR1cm4gZVswXT1yKmYrcypsLGVbMV09aSpmK28qbCxlWzJdPXIqYytzKmgsZVszXT1pKmMrbypoLGVbNF09cipwK3MqZCt1LGVbNV09aSpwK28qZCthLGV9LGwubXVsPWwubXVsdGlwbHksbC5yb3RhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPU1hdGguc2luKG4pLGw9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09cipsK3MqZixlWzFdPWkqbCtvKmYsZVsyXT1yKi1mK3MqbCxlWzNdPWkqLWYrbypsLGVbNF09dSxlWzVdPWEsZX0sbC5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV07cmV0dXJuIGVbMF09cipmLGVbMV09aSpmLGVbMl09cypsLGVbM109bypsLGVbNF09dSxlWzVdPWEsZX0sbC50cmFuc2xhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPW5bMF0sbD1uWzFdO3JldHVybiBlWzBdPXIsZVsxXT1pLGVbMl09cyxlWzNdPW8sZVs0XT1yKmYrcypsK3UsZVs1XT1pKmYrbypsK2EsZX0sbC5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQyZChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiLCBcIitlWzRdK1wiLCBcIitlWzVdK1wiKVwifSxsLmZyb2I9ZnVuY3Rpb24oZSl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhlWzBdLDIpK01hdGgucG93KGVbMV0sMikrTWF0aC5wb3coZVsyXSwyKStNYXRoLnBvdyhlWzNdLDIpK01hdGgucG93KGVbNF0sMikrTWF0aC5wb3coZVs1XSwyKSsxKX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDJkPWwpO3ZhciBjPXt9O2MuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oOSk7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTEsZVs1XT0wLGVbNl09MCxlWzddPTAsZVs4XT0xLGV9LGMuZnJvbU1hdDQ9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzRdLGVbNF09dFs1XSxlWzVdPXRbNl0sZVs2XT10WzhdLGVbN109dFs5XSxlWzhdPXRbMTBdLGV9LGMuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oOSk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzRdPWVbNF0sdFs1XT1lWzVdLHRbNl09ZVs2XSx0WzddPWVbN10sdFs4XT1lWzhdLHR9LGMuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlfSxjLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0xLGVbNV09MCxlWzZdPTAsZVs3XT0wLGVbOF09MSxlfSxjLnRyYW5zcG9zZT1mdW5jdGlvbihlLHQpe2lmKGU9PT10KXt2YXIgbj10WzFdLHI9dFsyXSxpPXRbNV07ZVsxXT10WzNdLGVbMl09dFs2XSxlWzNdPW4sZVs1XT10WzddLGVbNl09cixlWzddPWl9ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzNdLGVbMl09dFs2XSxlWzNdPXRbMV0sZVs0XT10WzRdLGVbNV09dFs3XSxlWzZdPXRbMl0sZVs3XT10WzVdLGVbOF09dFs4XTtyZXR1cm4gZX0sYy5pbnZlcnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz1sKm8tdSpmLGg9LWwqcyt1KmEscD1mKnMtbyphLGQ9bipjK3IqaCtpKnA7cmV0dXJuIGQ/KGQ9MS9kLGVbMF09YypkLGVbMV09KC1sKnIraSpmKSpkLGVbMl09KHUqci1pKm8pKmQsZVszXT1oKmQsZVs0XT0obCpuLWkqYSkqZCxlWzVdPSgtdSpuK2kqcykqZCxlWzZdPXAqZCxlWzddPSgtZipuK3IqYSkqZCxlWzhdPShvKm4tcipzKSpkLGUpOm51bGx9LGMuYWRqb2ludD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XTtyZXR1cm4gZVswXT1vKmwtdSpmLGVbMV09aSpmLXIqbCxlWzJdPXIqdS1pKm8sZVszXT11KmEtcypsLGVbNF09bipsLWkqYSxlWzVdPWkqcy1uKnUsZVs2XT1zKmYtbyphLGVbN109ciphLW4qZixlWzhdPW4qby1yKnMsZX0sYy5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl0saT1lWzNdLHM9ZVs0XSxvPWVbNV0sdT1lWzZdLGE9ZVs3XSxmPWVbOF07cmV0dXJuIHQqKGYqcy1vKmEpK24qKC1mKmkrbyp1KStyKihhKmktcyp1KX0sYy5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9blswXSxwPW5bMV0sZD1uWzJdLHY9blszXSxtPW5bNF0sZz1uWzVdLHk9bls2XSxiPW5bN10sdz1uWzhdO3JldHVybiBlWzBdPWgqcitwKm8rZCpmLGVbMV09aCppK3AqdStkKmwsZVsyXT1oKnMrcCphK2QqYyxlWzNdPXYqcittKm8rZypmLGVbNF09dippK20qdStnKmwsZVs1XT12KnMrbSphK2cqYyxlWzZdPXkqcitiKm8rdypmLGVbN109eSppK2IqdSt3KmwsZVs4XT15KnMrYiphK3cqYyxlfSxjLm11bD1jLm11bHRpcGx5LGMudHJhbnNsYXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD1uWzBdLHA9blsxXTtyZXR1cm4gZVswXT1yLGVbMV09aSxlWzJdPXMsZVszXT1vLGVbNF09dSxlWzVdPWEsZVs2XT1oKnIrcCpvK2YsZVs3XT1oKmkrcCp1K2wsZVs4XT1oKnMrcCphK2MsZX0sYy5yb3RhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPU1hdGguc2luKG4pLHA9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09cCpyK2gqbyxlWzFdPXAqaStoKnUsZVsyXT1wKnMraCphLGVbM109cCpvLWgqcixlWzRdPXAqdS1oKmksZVs1XT1wKmEtaCpzLGVbNl09ZixlWzddPWwsZVs4XT1jLGV9LGMuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPW5bMF0saT1uWzFdO3JldHVybiBlWzBdPXIqdFswXSxlWzFdPXIqdFsxXSxlWzJdPXIqdFsyXSxlWzNdPWkqdFszXSxlWzRdPWkqdFs0XSxlWzVdPWkqdFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlfSxjLmZyb21NYXQyZD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09MCxlWzNdPXRbMl0sZVs0XT10WzNdLGVbNV09MCxlWzZdPXRbNF0sZVs3XT10WzVdLGVbOF09MSxlfSxjLmZyb21RdWF0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4rbix1PXIrcixhPWkraSxmPW4qbyxsPXIqbyxjPXIqdSxoPWkqbyxwPWkqdSxkPWkqYSx2PXMqbyxtPXMqdSxnPXMqYTtyZXR1cm4gZVswXT0xLWMtZCxlWzNdPWwtZyxlWzZdPWgrbSxlWzFdPWwrZyxlWzRdPTEtZi1kLGVbN109cC12LGVbMl09aC1tLGVbNV09cCt2LGVbOF09MS1mLWMsZX0sYy5ub3JtYWxGcm9tTWF0ND1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPXRbOV0saD10WzEwXSxwPXRbMTFdLGQ9dFsxMl0sdj10WzEzXSxtPXRbMTRdLGc9dFsxNV0seT1uKnUtcipvLGI9biphLWkqbyx3PW4qZi1zKm8sRT1yKmEtaSp1LFM9cipmLXMqdSx4PWkqZi1zKmEsVD1sKnYtYypkLE49bCptLWgqZCxDPWwqZy1wKmQsaz1jKm0taCp2LEw9YypnLXAqdixBPWgqZy1wKm0sTz15KkEtYipMK3cqaytFKkMtUypOK3gqVDtyZXR1cm4gTz8oTz0xL08sZVswXT0odSpBLWEqTCtmKmspKk8sZVsxXT0oYSpDLW8qQS1mKk4pKk8sZVsyXT0obypMLXUqQytmKlQpKk8sZVszXT0oaSpMLXIqQS1zKmspKk8sZVs0XT0obipBLWkqQytzKk4pKk8sZVs1XT0ocipDLW4qTC1zKlQpKk8sZVs2XT0odip4LW0qUytnKkUpKk8sZVs3XT0obSp3LWQqeC1nKmIpKk8sZVs4XT0oZCpTLXYqdytnKnkpKk8sZSk6bnVsbH0sYy5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQzKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIsIFwiK2VbNl0rXCIsIFwiK2VbN10rXCIsIFwiK2VbOF0rXCIpXCJ9LGMuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs3XSwyKStNYXRoLnBvdyhlWzhdLDIpKX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDM9Yyk7dmFyIGg9e307aC5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigxNik7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTAsZVs1XT0xLGVbNl09MCxlWzddPTAsZVs4XT0wLGVbOV09MCxlWzEwXT0xLGVbMTFdPTAsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTAsZVsxNV09MSxlfSxoLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDE2KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdFs2XT1lWzZdLHRbN109ZVs3XSx0WzhdPWVbOF0sdFs5XT1lWzldLHRbMTBdPWVbMTBdLHRbMTFdPWVbMTFdLHRbMTJdPWVbMTJdLHRbMTNdPWVbMTNdLHRbMTRdPWVbMTRdLHRbMTVdPWVbMTVdLHR9LGguY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlWzldPXRbOV0sZVsxMF09dFsxMF0sZVsxMV09dFsxMV0sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0sZX0saC5pZGVudGl0eT1mdW5jdGlvbihlKXtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPTEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTEsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGgudHJhbnNwb3NlPWZ1bmN0aW9uKGUsdCl7aWYoZT09PXQpe3ZhciBuPXRbMV0scj10WzJdLGk9dFszXSxzPXRbNl0sbz10WzddLHU9dFsxMV07ZVsxXT10WzRdLGVbMl09dFs4XSxlWzNdPXRbMTJdLGVbNF09bixlWzZdPXRbOV0sZVs3XT10WzEzXSxlWzhdPXIsZVs5XT1zLGVbMTFdPXRbMTRdLGVbMTJdPWksZVsxM109byxlWzE0XT11fWVsc2UgZVswXT10WzBdLGVbMV09dFs0XSxlWzJdPXRbOF0sZVszXT10WzEyXSxlWzRdPXRbMV0sZVs1XT10WzVdLGVbNl09dFs5XSxlWzddPXRbMTNdLGVbOF09dFsyXSxlWzldPXRbNl0sZVsxMF09dFsxMF0sZVsxMV09dFsxNF0sZVsxMl09dFszXSxlWzEzXT10WzddLGVbMTRdPXRbMTFdLGVbMTVdPXRbMTVdO3JldHVybiBlfSxoLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPXRbOV0saD10WzEwXSxwPXRbMTFdLGQ9dFsxMl0sdj10WzEzXSxtPXRbMTRdLGc9dFsxNV0seT1uKnUtcipvLGI9biphLWkqbyx3PW4qZi1zKm8sRT1yKmEtaSp1LFM9cipmLXMqdSx4PWkqZi1zKmEsVD1sKnYtYypkLE49bCptLWgqZCxDPWwqZy1wKmQsaz1jKm0taCp2LEw9YypnLXAqdixBPWgqZy1wKm0sTz15KkEtYipMK3cqaytFKkMtUypOK3gqVDtyZXR1cm4gTz8oTz0xL08sZVswXT0odSpBLWEqTCtmKmspKk8sZVsxXT0oaSpMLXIqQS1zKmspKk8sZVsyXT0odip4LW0qUytnKkUpKk8sZVszXT0oaCpTLWMqeC1wKkUpKk8sZVs0XT0oYSpDLW8qQS1mKk4pKk8sZVs1XT0obipBLWkqQytzKk4pKk8sZVs2XT0obSp3LWQqeC1nKmIpKk8sZVs3XT0obCp4LWgqdytwKmIpKk8sZVs4XT0obypMLXUqQytmKlQpKk8sZVs5XT0ocipDLW4qTC1zKlQpKk8sZVsxMF09KGQqUy12KncrZyp5KSpPLGVbMTFdPShjKnctbCpTLXAqeSkqTyxlWzEyXT0odSpOLW8qay1hKlQpKk8sZVsxM109KG4qay1yKk4raSpUKSpPLGVbMTRdPSh2KmItZCpFLW0qeSkqTyxlWzE1XT0obCpFLWMqYitoKnkpKk8sZSk6bnVsbH0saC5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XTtyZXR1cm4gZVswXT11KihoKmctcCptKS1jKihhKmctZiptKSt2KihhKnAtZipoKSxlWzFdPS0ociooaCpnLXAqbSktYyooaSpnLXMqbSkrdiooaSpwLXMqaCkpLGVbMl09ciooYSpnLWYqbSktdSooaSpnLXMqbSkrdiooaSpmLXMqYSksZVszXT0tKHIqKGEqcC1mKmgpLXUqKGkqcC1zKmgpK2MqKGkqZi1zKmEpKSxlWzRdPS0obyooaCpnLXAqbSktbCooYSpnLWYqbSkrZCooYSpwLWYqaCkpLGVbNV09biooaCpnLXAqbSktbCooaSpnLXMqbSkrZCooaSpwLXMqaCksZVs2XT0tKG4qKGEqZy1mKm0pLW8qKGkqZy1zKm0pK2QqKGkqZi1zKmEpKSxlWzddPW4qKGEqcC1mKmgpLW8qKGkqcC1zKmgpK2wqKGkqZi1zKmEpLGVbOF09byooYypnLXAqdiktbCoodSpnLWYqdikrZCoodSpwLWYqYyksZVs5XT0tKG4qKGMqZy1wKnYpLWwqKHIqZy1zKnYpK2QqKHIqcC1zKmMpKSxlWzEwXT1uKih1KmctZip2KS1vKihyKmctcyp2KStkKihyKmYtcyp1KSxlWzExXT0tKG4qKHUqcC1mKmMpLW8qKHIqcC1zKmMpK2wqKHIqZi1zKnUpKSxlWzEyXT0tKG8qKGMqbS1oKnYpLWwqKHUqbS1hKnYpK2QqKHUqaC1hKmMpKSxlWzEzXT1uKihjKm0taCp2KS1sKihyKm0taSp2KStkKihyKmgtaSpjKSxlWzE0XT0tKG4qKHUqbS1hKnYpLW8qKHIqbS1pKnYpK2QqKHIqYS1pKnUpKSxlWzE1XT1uKih1KmgtYSpjKS1vKihyKmgtaSpjKStsKihyKmEtaSp1KSxlfSxoLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM10scz1lWzRdLG89ZVs1XSx1PWVbNl0sYT1lWzddLGY9ZVs4XSxsPWVbOV0sYz1lWzEwXSxoPWVbMTFdLHA9ZVsxMl0sZD1lWzEzXSx2PWVbMTRdLG09ZVsxNV0sZz10Km8tbipzLHk9dCp1LXIqcyxiPXQqYS1pKnMsdz1uKnUtcipvLEU9biphLWkqbyxTPXIqYS1pKnUseD1mKmQtbCpwLFQ9Zip2LWMqcCxOPWYqbS1oKnAsQz1sKnYtYypkLGs9bCptLWgqZCxMPWMqbS1oKnY7cmV0dXJuIGcqTC15KmsrYipDK3cqTi1FKlQrUyp4fSxoLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD10WzldLHA9dFsxMF0sZD10WzExXSx2PXRbMTJdLG09dFsxM10sZz10WzE0XSx5PXRbMTVdLGI9blswXSx3PW5bMV0sRT1uWzJdLFM9blszXTtyZXR1cm4gZVswXT1iKnIrdyp1K0UqYytTKnYsZVsxXT1iKmkrdyphK0UqaCtTKm0sZVsyXT1iKnMrdypmK0UqcCtTKmcsZVszXT1iKm8rdypsK0UqZCtTKnksYj1uWzRdLHc9bls1XSxFPW5bNl0sUz1uWzddLGVbNF09YipyK3cqdStFKmMrUyp2LGVbNV09YippK3cqYStFKmgrUyptLGVbNl09YipzK3cqZitFKnArUypnLGVbN109YipvK3cqbCtFKmQrUyp5LGI9bls4XSx3PW5bOV0sRT1uWzEwXSxTPW5bMTFdLGVbOF09YipyK3cqdStFKmMrUyp2LGVbOV09YippK3cqYStFKmgrUyptLGVbMTBdPWIqcyt3KmYrRSpwK1MqZyxlWzExXT1iKm8rdypsK0UqZCtTKnksYj1uWzEyXSx3PW5bMTNdLEU9blsxNF0sUz1uWzE1XSxlWzEyXT1iKnIrdyp1K0UqYytTKnYsZVsxM109YippK3cqYStFKmgrUyptLGVbMTRdPWIqcyt3KmYrRSpwK1MqZyxlWzE1XT1iKm8rdypsK0UqZCtTKnksZX0saC5tdWw9aC5tdWx0aXBseSxoLnRyYW5zbGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV0scz1uWzJdLG8sdSxhLGYsbCxjLGgscCxkLHYsbSxnO3JldHVybiB0PT09ZT8oZVsxMl09dFswXSpyK3RbNF0qaSt0WzhdKnMrdFsxMl0sZVsxM109dFsxXSpyK3RbNV0qaSt0WzldKnMrdFsxM10sZVsxNF09dFsyXSpyK3RbNl0qaSt0WzEwXSpzK3RbMTRdLGVbMTVdPXRbM10qcit0WzddKmkrdFsxMV0qcyt0WzE1XSk6KG89dFswXSx1PXRbMV0sYT10WzJdLGY9dFszXSxsPXRbNF0sYz10WzVdLGg9dFs2XSxwPXRbN10sZD10WzhdLHY9dFs5XSxtPXRbMTBdLGc9dFsxMV0sZVswXT1vLGVbMV09dSxlWzJdPWEsZVszXT1mLGVbNF09bCxlWzVdPWMsZVs2XT1oLGVbN109cCxlWzhdPWQsZVs5XT12LGVbMTBdPW0sZVsxMV09ZyxlWzEyXT1vKnIrbCppK2Qqcyt0WzEyXSxlWzEzXT11KnIrYyppK3Yqcyt0WzEzXSxlWzE0XT1hKnIraCppK20qcyt0WzE0XSxlWzE1XT1mKnIrcCppK2cqcyt0WzE1XSksZX0saC5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV0scz1uWzJdO3JldHVybiBlWzBdPXRbMF0qcixlWzFdPXRbMV0qcixlWzJdPXRbMl0qcixlWzNdPXRbM10qcixlWzRdPXRbNF0qaSxlWzVdPXRbNV0qaSxlWzZdPXRbNl0qaSxlWzddPXRbN10qaSxlWzhdPXRbOF0qcyxlWzldPXRbOV0qcyxlWzEwXT10WzEwXSpzLGVbMTFdPXRbMTFdKnMsZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0sZX0saC5yb3RhdGU9ZnVuY3Rpb24oZSxuLHIsaSl7dmFyIHM9aVswXSxvPWlbMV0sdT1pWzJdLGE9TWF0aC5zcXJ0KHMqcytvKm8rdSp1KSxmLGwsYyxoLHAsZCx2LG0sZyx5LGIsdyxFLFMseCxULE4sQyxrLEwsQSxPLE0sXztyZXR1cm4gTWF0aC5hYnMoYSk8dD9udWxsOihhPTEvYSxzKj1hLG8qPWEsdSo9YSxmPU1hdGguc2luKHIpLGw9TWF0aC5jb3MociksYz0xLWwsaD1uWzBdLHA9blsxXSxkPW5bMl0sdj1uWzNdLG09bls0XSxnPW5bNV0seT1uWzZdLGI9bls3XSx3PW5bOF0sRT1uWzldLFM9blsxMF0seD1uWzExXSxUPXMqcypjK2wsTj1vKnMqYyt1KmYsQz11KnMqYy1vKmYsaz1zKm8qYy11KmYsTD1vKm8qYytsLEE9dSpvKmMrcypmLE89cyp1KmMrbypmLE09byp1KmMtcypmLF89dSp1KmMrbCxlWzBdPWgqVCttKk4rdypDLGVbMV09cCpUK2cqTitFKkMsZVsyXT1kKlQreSpOK1MqQyxlWzNdPXYqVCtiKk4reCpDLGVbNF09aCprK20qTCt3KkEsZVs1XT1wKmsrZypMK0UqQSxlWzZdPWQqayt5KkwrUypBLGVbN109diprK2IqTCt4KkEsZVs4XT1oKk8rbSpNK3cqXyxlWzldPXAqTytnKk0rRSpfLGVbMTBdPWQqTyt5Kk0rUypfLGVbMTFdPXYqTytiKk0reCpfLG4hPT1lJiYoZVsxMl09blsxMl0sZVsxM109blsxM10sZVsxNF09blsxNF0sZVsxNV09blsxNV0pLGUpfSxoLnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPU1hdGguc2luKG4pLGk9TWF0aC5jb3Mobikscz10WzRdLG89dFs1XSx1PXRbNl0sYT10WzddLGY9dFs4XSxsPXRbOV0sYz10WzEwXSxoPXRbMTFdO3JldHVybiB0IT09ZSYmKGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSksZVs0XT1zKmkrZipyLGVbNV09byppK2wqcixlWzZdPXUqaStjKnIsZVs3XT1hKmkraCpyLGVbOF09ZippLXMqcixlWzldPWwqaS1vKnIsZVsxMF09YyppLXUqcixlWzExXT1oKmktYSpyLGV9LGgucm90YXRlWT1mdW5jdGlvbihlLHQsbil7dmFyIHI9TWF0aC5zaW4obiksaT1NYXRoLmNvcyhuKSxzPXRbMF0sbz10WzFdLHU9dFsyXSxhPXRbM10sZj10WzhdLGw9dFs5XSxjPXRbMTBdLGg9dFsxMV07cmV0dXJuIHQhPT1lJiYoZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzBdPXMqaS1mKnIsZVsxXT1vKmktbCpyLGVbMl09dSppLWMqcixlWzNdPWEqaS1oKnIsZVs4XT1zKnIrZippLGVbOV09bypyK2wqaSxlWzEwXT11KnIrYyppLGVbMTFdPWEqcitoKmksZX0saC5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1NYXRoLnNpbihuKSxpPU1hdGguY29zKG4pLHM9dFswXSxvPXRbMV0sdT10WzJdLGE9dFszXSxmPXRbNF0sbD10WzVdLGM9dFs2XSxoPXRbN107cmV0dXJuIHQhPT1lJiYoZVs4XT10WzhdLGVbOV09dFs5XSxlWzEwXT10WzEwXSxlWzExXT10WzExXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSksZVswXT1zKmkrZipyLGVbMV09byppK2wqcixlWzJdPXUqaStjKnIsZVszXT1hKmkraCpyLGVbNF09ZippLXMqcixlWzVdPWwqaS1vKnIsZVs2XT1jKmktdSpyLGVbN109aCppLWEqcixlfSxoLmZyb21Sb3RhdGlvblRyYW5zbGF0aW9uPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9cityLGE9aStpLGY9cytzLGw9cip1LGM9ciphLGg9cipmLHA9aSphLGQ9aSpmLHY9cypmLG09byp1LGc9byphLHk9bypmO3JldHVybiBlWzBdPTEtKHArdiksZVsxXT1jK3ksZVsyXT1oLWcsZVszXT0wLGVbNF09Yy15LGVbNV09MS0obCt2KSxlWzZdPWQrbSxlWzddPTAsZVs4XT1oK2csZVs5XT1kLW0sZVsxMF09MS0obCtwKSxlWzExXT0wLGVbMTJdPW5bMF0sZVsxM109blsxXSxlWzE0XT1uWzJdLGVbMTVdPTEsZX0saC5mcm9tUXVhdD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uK24sdT1yK3IsYT1pK2ksZj1uKm8sbD1yKm8sYz1yKnUsaD1pKm8scD1pKnUsZD1pKmEsdj1zKm8sbT1zKnUsZz1zKmE7cmV0dXJuIGVbMF09MS1jLWQsZVsxXT1sK2csZVsyXT1oLW0sZVszXT0wLGVbNF09bC1nLGVbNV09MS1mLWQsZVs2XT1wK3YsZVs3XT0wLGVbOF09aCttLGVbOV09cC12LGVbMTBdPTEtZi1jLGVbMTFdPTAsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTAsZVsxNV09MSxlfSxoLmZydXN0dW09ZnVuY3Rpb24oZSx0LG4scixpLHMsbyl7dmFyIHU9MS8obi10KSxhPTEvKGktciksZj0xLyhzLW8pO3JldHVybiBlWzBdPXMqMip1LGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPXMqMiphLGVbNl09MCxlWzddPTAsZVs4XT0obit0KSp1LGVbOV09KGkrcikqYSxlWzEwXT0obytzKSpmLGVbMTFdPS0xLGVbMTJdPTAsZVsxM109MCxlWzE0XT1vKnMqMipmLGVbMTVdPTAsZX0saC5wZXJzcGVjdGl2ZT1mdW5jdGlvbihlLHQsbixyLGkpe3ZhciBzPTEvTWF0aC50YW4odC8yKSxvPTEvKHItaSk7cmV0dXJuIGVbMF09cy9uLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPXMsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPShpK3IpKm8sZVsxMV09LTEsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTIqaSpyKm8sZVsxNV09MCxlfSxoLm9ydGhvPWZ1bmN0aW9uKGUsdCxuLHIsaSxzLG8pe3ZhciB1PTEvKHQtbiksYT0xLyhyLWkpLGY9MS8ocy1vKTtyZXR1cm4gZVswXT0tMip1LGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPS0yKmEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTIqZixlWzExXT0wLGVbMTJdPSh0K24pKnUsZVsxM109KGkrcikqYSxlWzE0XT0obytzKSpmLGVbMTVdPTEsZX0saC5sb29rQXQ9ZnVuY3Rpb24oZSxuLHIsaSl7dmFyIHMsbyx1LGEsZixsLGMscCxkLHYsbT1uWzBdLGc9blsxXSx5PW5bMl0sYj1pWzBdLHc9aVsxXSxFPWlbMl0sUz1yWzBdLHg9clsxXSxUPXJbMl07cmV0dXJuIE1hdGguYWJzKG0tUyk8dCYmTWF0aC5hYnMoZy14KTx0JiZNYXRoLmFicyh5LVQpPHQ/aC5pZGVudGl0eShlKTooYz1tLVMscD1nLXgsZD15LVQsdj0xL01hdGguc3FydChjKmMrcCpwK2QqZCksYyo9dixwKj12LGQqPXYscz13KmQtRSpwLG89RSpjLWIqZCx1PWIqcC13KmMsdj1NYXRoLnNxcnQocypzK28qbyt1KnUpLHY/KHY9MS92LHMqPXYsbyo9dix1Kj12KToocz0wLG89MCx1PTApLGE9cCp1LWQqbyxmPWQqcy1jKnUsbD1jKm8tcCpzLHY9TWF0aC5zcXJ0KGEqYStmKmYrbCpsKSx2Pyh2PTEvdixhKj12LGYqPXYsbCo9dik6KGE9MCxmPTAsbD0wKSxlWzBdPXMsZVsxXT1hLGVbMl09YyxlWzNdPTAsZVs0XT1vLGVbNV09ZixlWzZdPXAsZVs3XT0wLGVbOF09dSxlWzldPWwsZVsxMF09ZCxlWzExXT0wLGVbMTJdPS0ocyptK28qZyt1KnkpLGVbMTNdPS0oYSptK2YqZytsKnkpLGVbMTRdPS0oYyptK3AqZytkKnkpLGVbMTVdPTEsZSl9LGguc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwibWF0NChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiLCBcIitlWzRdK1wiLCBcIitlWzVdK1wiLCBcIitlWzZdK1wiLCBcIitlWzddK1wiLCBcIitlWzhdK1wiLCBcIitlWzldK1wiLCBcIitlWzEwXStcIiwgXCIrZVsxMV0rXCIsIFwiK2VbMTJdK1wiLCBcIitlWzEzXStcIiwgXCIrZVsxNF0rXCIsIFwiK2VbMTVdK1wiKVwifSxoLmZyb2I9ZnVuY3Rpb24oZSl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhlWzBdLDIpK01hdGgucG93KGVbMV0sMikrTWF0aC5wb3coZVsyXSwyKStNYXRoLnBvdyhlWzNdLDIpK01hdGgucG93KGVbNF0sMikrTWF0aC5wb3coZVs1XSwyKStNYXRoLnBvdyhlWzZdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs3XSwyKStNYXRoLnBvdyhlWzhdLDIpK01hdGgucG93KGVbOV0sMikrTWF0aC5wb3coZVsxMF0sMikrTWF0aC5wb3coZVsxMV0sMikrTWF0aC5wb3coZVsxMl0sMikrTWF0aC5wb3coZVsxM10sMikrTWF0aC5wb3coZVsxNF0sMikrTWF0aC5wb3coZVsxNV0sMikpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0ND1oKTt2YXIgcD17fTtwLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDQpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0scC5yb3RhdGlvblRvPWZ1bmN0aW9uKCl7dmFyIGU9dS5jcmVhdGUoKSx0PXUuZnJvbVZhbHVlcygxLDAsMCksbj11LmZyb21WYWx1ZXMoMCwxLDApO3JldHVybiBmdW5jdGlvbihyLGkscyl7dmFyIG89dS5kb3QoaSxzKTtyZXR1cm4gbzwtMC45OTk5OTk/KHUuY3Jvc3MoZSx0LGkpLHUubGVuZ3RoKGUpPDFlLTYmJnUuY3Jvc3MoZSxuLGkpLHUubm9ybWFsaXplKGUsZSkscC5zZXRBeGlzQW5nbGUocixlLE1hdGguUEkpLHIpOm8+Ljk5OTk5OT8oclswXT0wLHJbMV09MCxyWzJdPTAsclszXT0xLHIpOih1LmNyb3NzKGUsaSxzKSxyWzBdPWVbMF0sclsxXT1lWzFdLHJbMl09ZVsyXSxyWzNdPTErbyxwLm5vcm1hbGl6ZShyLHIpKX19KCkscC5zZXRBeGVzPWZ1bmN0aW9uKCl7dmFyIGU9Yy5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24odCxuLHIsaSl7cmV0dXJuIGVbMF09clswXSxlWzNdPXJbMV0sZVs2XT1yWzJdLGVbMV09aVswXSxlWzRdPWlbMV0sZVs3XT1pWzJdLGVbMl09LW5bMF0sZVs1XT0tblsxXSxlWzhdPS1uWzJdLHAubm9ybWFsaXplKHQscC5mcm9tTWF0Myh0LGUpKX19KCkscC5jbG9uZT1hLmNsb25lLHAuZnJvbVZhbHVlcz1hLmZyb21WYWx1ZXMscC5jb3B5PWEuY29weSxwLnNldD1hLnNldCxwLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0scC5zZXRBeGlzQW5nbGU9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPU1hdGguc2luKG4pO3JldHVybiBlWzBdPXIqdFswXSxlWzFdPXIqdFsxXSxlWzJdPXIqdFsyXSxlWzNdPU1hdGguY29zKG4pLGV9LHAuYWRkPWEuYWRkLHAubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXSxmPW5bMl0sbD1uWzNdO3JldHVybiBlWzBdPXIqbCtvKnUraSpmLXMqYSxlWzFdPWkqbCtvKmErcyp1LXIqZixlWzJdPXMqbCtvKmYrciphLWkqdSxlWzNdPW8qbC1yKnUtaSphLXMqZixlfSxwLm11bD1wLm11bHRpcGx5LHAuc2NhbGU9YS5zY2FsZSxwLnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYStvKnUsZVsxXT1pKmErcyp1LGVbMl09cyphLWkqdSxlWzNdPW8qYS1yKnUsZX0scC5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmEtcyp1LGVbMV09aSphK28qdSxlWzJdPXMqYStyKnUsZVszXT1vKmEtaSp1LGV9LHAucm90YXRlWj1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK2kqdSxlWzFdPWkqYS1yKnUsZVsyXT1zKmErbyp1LGVbM109byphLXMqdSxlfSxwLmNhbGN1bGF0ZVc9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl07cmV0dXJuIGVbMF09bixlWzFdPXIsZVsyXT1pLGVbM109LU1hdGguc3FydChNYXRoLmFicygxLW4qbi1yKnItaSppKSksZX0scC5kb3Q9YS5kb3QscC5sZXJwPWEubGVycCxwLnNsZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXSx1PXRbM10sYT1uWzBdLGY9blsxXSxsPW5bMl0sYz1uWzNdLGgscCxkLHYsbTtyZXR1cm4gcD1pKmErcypmK28qbCt1KmMscDwwJiYocD0tcCxhPS1hLGY9LWYsbD0tbCxjPS1jKSwxLXA+MWUtNj8oaD1NYXRoLmFjb3MocCksZD1NYXRoLnNpbihoKSx2PU1hdGguc2luKCgxLXIpKmgpL2QsbT1NYXRoLnNpbihyKmgpL2QpOih2PTEtcixtPXIpLGVbMF09dippK20qYSxlWzFdPXYqcyttKmYsZVsyXT12Km8rbSpsLGVbM109dip1K20qYyxlfSxwLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKm4rcipyK2kqaStzKnMsdT1vPzEvbzowO3JldHVybiBlWzBdPS1uKnUsZVsxXT0tcip1LGVbMl09LWkqdSxlWzNdPXMqdSxlfSxwLmNvbmp1Z2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlWzNdPXRbM10sZX0scC5sZW5ndGg9YS5sZW5ndGgscC5sZW49cC5sZW5ndGgscC5zcXVhcmVkTGVuZ3RoPWEuc3F1YXJlZExlbmd0aCxwLnNxckxlbj1wLnNxdWFyZWRMZW5ndGgscC5ub3JtYWxpemU9YS5ub3JtYWxpemUscC5mcm9tTWF0Mz1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0rdFs0XSt0WzhdLHI7aWYobj4wKXI9TWF0aC5zcXJ0KG4rMSksZVszXT0uNSpyLHI9LjUvcixlWzBdPSh0WzddLXRbNV0pKnIsZVsxXT0odFsyXS10WzZdKSpyLGVbMl09KHRbM10tdFsxXSkqcjtlbHNle3ZhciBpPTA7dFs0XT50WzBdJiYoaT0xKSx0WzhdPnRbaSozK2ldJiYoaT0yKTt2YXIgcz0oaSsxKSUzLG89KGkrMiklMztyPU1hdGguc3FydCh0W2kqMytpXS10W3MqMytzXS10W28qMytvXSsxKSxlW2ldPS41KnIscj0uNS9yLGVbM109KHRbbyozK3NdLXRbcyozK29dKSpyLGVbc109KHRbcyozK2ldK3RbaSozK3NdKSpyLGVbb109KHRbbyozK2ldK3RbaSozK29dKSpyfXJldHVybiBlfSxwLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInF1YXQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnF1YXQ9cCl9KHQuZXhwb3J0cyl9KSh0aGlzKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxuYW5ndWxhci5tb2R1bGUoICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5idXN5Q292ZXInLCBbXSApXG4gICAgLmRpcmVjdGl2ZSggJ2J1c3lDb3ZlcicsIFsgJyRyb290U2NvcGUnLFxuICAgICAgICBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvYnVzeUNvdmVyLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLmxvYWRpbmcpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYnVzeU1lc3NhZ2UgPSAnTG9hZGluZy4uLic7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoICRyb290U2NvcGUuaW5pdGlhbGl6aW5nICl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYnVzeU1lc3NhZ2UgPSAnSW5pdGlhbGl6aW5nLi4uJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggJHJvb3RTY29wZS5idXN5ICl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzY29wZS5idXN5TWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5idXN5TWVzc2FnZSA9ICdKdXN0IGEgc2Vjb25kLi4uJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihuZXdWYWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnb2ZmJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdvZmYnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSggJy4vY29tcG9uZW50V2lyZVNlZ21lbnQnICk7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlJywgW1xuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uY29tcG9uZW50V2lyZS5zZWdtZW50J1xuICAgIF1cbilcbiAgICAuY29udHJvbGxlciggJ0NvbXBvbmVudFdpcmVDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUgKSB7XG4gICAgICAgICRzY29wZS5nZXRTZWdtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlbmRQb3NpdGlvbnMsXG4gICAgICAgICAgICAgICAgeDEsIHkxLCB4MiwgeTI7XG5cbiAgICAgICAgICAgIGVuZFBvc2l0aW9ucyA9ICRzY29wZS53aXJlLmdldEVuZFBvc2l0aW9ucygpO1xuXG4gICAgICAgICAgICB4MSA9IGVuZFBvc2l0aW9ucy54MTtcbiAgICAgICAgICAgIHgyID0gZW5kUG9zaXRpb25zLngyO1xuICAgICAgICAgICAgeTEgPSBlbmRQb3NpdGlvbnMueTE7XG4gICAgICAgICAgICB5MiA9IGVuZFBvc2l0aW9ucy55MjtcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBlbmRQb3NpdGlvbnNcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub25TZWdtZW50Q2xpY2sgPSBmdW5jdGlvbiAoIHdpcmUsIHNlZ21lbnQgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggd2lyZSwgc2VnbWVudCApO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zZWdtZW50cyA9ICRzY29wZS5nZXRTZWdtZW50cygpO1xuXG4gICAgfSApXG4gICAgLmRpcmVjdGl2ZShcbiAgICAgICAgJ2NvbXBvbmVudFdpcmUnLFxuXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50V2lyZUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2NvbXBvbmVudFdpcmUuaHRtbCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVOYW1lc3BhY2U6ICdTVkcnXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uY29tcG9uZW50V2lyZS5zZWdtZW50JywgW11cbilcblxuLmRpcmVjdGl2ZShcbiAgICAnY29tcG9uZW50V2lyZVNlZ21lbnQnLFxuXG4gICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvY29tcG9uZW50V2lyZVNlZ21lbnQuaHRtbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgICAgICAgfTtcbiAgICB9XG4pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxuYW5ndWxhci5tb2R1bGUoICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kZXNpZ25FZGl0b3InLCBbXSApXG4gICAgLmNvbnRyb2xsZXIoICdEZXNpZ25FZGl0b3JDb250cm9sbGVyJywgZnVuY3Rpb24oXG4gICAgICAgICRzY29wZSwgJHJvb3RTY29wZSwgZGlhZ3JhbVNlcnZpY2UsICRsb2csIGRlc2lnblNlcnZpY2UsICRzdGF0ZVBhcmFtcywgZGVzaWduTGF5b3V0U2VydmljZSkge1xuXG4gICAgICAgIHZhciBkZXNpZ25DdHg7XG5cbiAgICAgICAgJHNjb3BlLmRpYWdyYW0gPSBudWxsO1xuXG4gICAgICAgIGRlc2lnbkN0eCA9IHtcbiAgICAgICAgICAgIGRiOiAkcm9vdFNjb3BlLm1haW5EYkNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgIHJlZ2lvbklkOiAnRGVzaWduXycgKyAoIG5ldyBEYXRlKCkgKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmRpYWdyYW1Db250YWluZXJDb25maWcgPSB7XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbSA9IGRpYWdyYW1TZXJ2aWNlLmdldERpYWdyYW0oJHN0YXRlUGFyYW1zLmNvbnRhaW5lcklkKTtcblxuICAgICAgICBkZXNpZ25MYXlvdXRTZXJ2aWNlLndhdGNoQ2hpbGRyZW5Qb3NpdGlvbnMoZGVzaWduQ3R4LCAkcm9vdFNjb3BlLmFjdGl2ZURlc2lnbi5pZCwgZnVuY3Rpb24gKC8qZGVzaWduU3RydWN0dXJlVXBkYXRlT2JqZWN0Ki8pIHtcblxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkZXNpZ25TdHJ1Y3R1cmUpIHtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coZGVzaWduU3RydWN0dXJlKTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS5hY3RpdmVDb250YWluZXJJZCA9ICRzdGF0ZVBhcmFtcy5jb250YWluZXJJZCB8fCAkcm9vdFNjb3BlLmFjdGl2ZURlc2lnbi5pZDtcblxuICAgICAgICAgICAgJGxvZy5kZWJ1Zygkcm9vdFNjb3BlLmFjdGl2ZUNvbnRhaW5lcklkKTtcblxuICAgICAgICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5jb250YWluZXJJZCA9PT0gJ2R1bW15Jykge1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0gPSBkaWFncmFtU2VydmljZS5hZGREdW1teURpYWdyYW0oJ2R1bW15JywgMTAwLCA1MCwgMzAwMCwgMzAwMCk7XG5cbiAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdEcmF3aW5nIGR1bW15IGRpYWdyYW06JywgJHNjb3BlLmRpYWdyYW0pO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0gPSBkaWFncmFtU2VydmljZS5nZXREaWFncmFtKCRzdGF0ZVBhcmFtcy5jb250YWluZXJJZCk7XG5cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgIH0pO1xuXG4gICAgfSlcbiAgICAuZGlyZWN0aXZlKCAnZGVzaWduRWRpdG9yJywgW1xuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduRWRpdG9yQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgJHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2Rlc2lnbkVkaXRvci5odG1sJ1xuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSApO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsICRsb2cpIHtcblxuICAgIHZhciBqc3AsXG4gICAgICAgIGpzcFJlaW5pdCxcbiAgICAgICAganNwUGFuZSxcblxuICAgICAgICBzY3JvbGxQb3NpdGlvblgsXG4gICAgICAgIHNjcm9sbFBvc2l0aW9uWSxcblxuICAgICAgICB1cGRhdGVWaXNpYmxlQXJlYSxcbiAgICAgICAgdXBkYXRlUHJvbWlzZSxcblxuICAgICAgICBvbldpbmRvd1Jlc2l6ZTtcblxuXG4gICAgdXBkYXRlVmlzaWJsZUFyZWEgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGxlZnQsXG4gICAgICAgICAgICB0b3AsXG4gICAgICAgICAgICBfdXBkYXRlVmlzaWJsZUFyZWE7XG5cbiAgICAgICAgX3VwZGF0ZVZpc2libGVBcmVhID0gZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgJHNjb3BlLnZpc2libGVBcmVhID0ge1xuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQgfHwgMCxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCB8fCAwLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiBsZWZ0ICsgJHNjb3BlLiRjb250ZW50UGFuZS53aWR0aCgpLFxuICAgICAgICAgICAgICAgIGJvdHRvbTogdG9wICsgJHNjb3BlLiRjb250ZW50UGFuZS5oZWlnaHQoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChqc3BQYW5lKSB7XG5cbiAgICAgICAgICAgIGxlZnQgPSBzY3JvbGxQb3NpdGlvblggfHwgMDtcbiAgICAgICAgICAgIHRvcCA9IHNjcm9sbFBvc2l0aW9uWSB8fCAwO1xuXG4gICAgICAgICAgICBpZiAodXBkYXRlUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbCh1cGRhdGVQcm9taXNlKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9ICR0aW1lb3V0KF91cGRhdGVWaXNpYmxlQXJlYSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBqc3BSZWluaXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoanNwKSkge1xuXG4gICAgICAgICAgICAkbG9nLmRlYnVnKCdSZWluaXRpYWxpemluZyBKU1AuJyk7XG4gICAgICAgICAgICBqc3AucmVpbml0aWFsaXNlKCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgICRzY29wZS4kb24oJ0RpYWdyYW1Db250YWluZXJJbml0aWFsaXplZCcsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAkc2NvcGUuJGNvbnRlbnRQYW5lXG5cbiAgICAgICAgICAgIC5iaW5kKCdqc3AtaW5pdGlhbGlzZWQnLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGpzcFBhbmUgPSAkc2NvcGUuJGNvbnRlbnRQYW5lLmZpbmQoJy5qc3BQYW5lJyk7XG4gICAgICAgICAgICAgICAgdXBkYXRlVmlzaWJsZUFyZWEoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgICAgICAgLmJpbmQoJ2pzcC1zY3JvbGwteScsIGZ1bmN0aW9uIChldmVudCwgYVNjcm9sbFBvc2l0aW9uWSkge1xuXG4gICAgICAgICAgICAgICAgc2Nyb2xsUG9zaXRpb25ZID0gYVNjcm9sbFBvc2l0aW9uWTtcblxuICAgICAgICAgICAgICAgIHVwZGF0ZVZpc2libGVBcmVhKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICAgICAgIC5iaW5kKCdqc3Atc2Nyb2xsLXgnLCBmdW5jdGlvbiAoZXZlbnQsIGFTY3JvbGxQb3NpdGlvblgpIHtcblxuICAgICAgICAgICAgICAgIHNjcm9sbFBvc2l0aW9uWCA9IGFTY3JvbGxQb3NpdGlvblg7XG5cbiAgICAgICAgICAgICAgICB1cGRhdGVWaXNpYmxlQXJlYSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICApXG4vLyAgICAgICAgICAgIC5iaW5kKFxuLy8gICAgICAgICAgICAnanNwLWFycm93LWNoYW5nZScsXG4vLyAgICAgICAgICAgIGZ1bmN0aW9uIChldmVudCwgaXNBdFRvcCwgaXNBdEJvdHRvbSwgaXNBdExlZnQsIGlzQXRSaWdodCkge1xuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0hhbmRsZSBqc3AtYXJyb3ctY2hhbmdlJywgdGhpcyxcbi8vICAgICAgICAgICAgICAgICAgICAnaXNBdFRvcD0nLCBpc0F0VG9wLFxuLy8gICAgICAgICAgICAgICAgICAgICdpc0F0Qm90dG9tPScsIGlzQXRCb3R0b20sXG4vLyAgICAgICAgICAgICAgICAgICAgJ2lzQXRMZWZ0PScsIGlzQXRMZWZ0LFxuLy8gICAgICAgICAgICAgICAgICAgICdpc0F0UmlnaHQ9JywgaXNBdFJpZ2h0KTtcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgIClcbiAgICAgICAgICAgIC5qU2Nyb2xsUGFuZShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbERyYWdNaW5IZWlnaHQ6IDYwLFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsRHJhZ01heEhlaWdodDogNjAsXG4gICAgICAgICAgICAgICAgaG9yaXpvbnRhbERyYWdNaW5XaWR0aDogNjAsXG4gICAgICAgICAgICAgICAgaG9yaXpvbnRhbERyYWdNYXhXaWR0aDogNjAsXG4gICAgICAgICAgICAgICAgYW5pbWF0ZVNjcm9sbDogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGpzcCA9ICRzY29wZS4kY29udGVudFBhbmUuZGF0YSgnanNwJyk7XG5cbiAgICAgICAganNwUmVpbml0KCk7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUuJG9uKCdEaWFncmFtSW5pdGlhbGl6ZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGpzcFJlaW5pdCgpO1xuICAgIH0pO1xuXG5cbiAgICBvbldpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBqc3BSZWluaXQoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5vbldpbmRvd1Jlc2l6ZSA9IG9uV2luZG93UmVzaXplO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbn07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgJCovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbnJlcXVpcmUoJy4uL2RyYXdpbmdHcmlkL2RyYXdpbmdHcmlkLmpzJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kaWFncmFtQ29udGFpbmVyJywgW1xuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZHJhd2luZ0dyaWQnLFxuICAgICAgICAncGFuem9vbScsXG4gICAgICAgICdwYW56b29td2lkZ2V0JyxcbiAgICAgICAgJ2lzaXMudWkuY29udGV4dG1lbnUnXG4gICAgXSlcbiAgICAuY29udHJvbGxlcignRGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXInLCBbXG4gICAgICAgICckc2NvcGUnLFxuICAgICAgICAnJHRpbWVvdXQnLFxuICAgICAgICAnJGxvZycsXG4gICAgICAgICdQYW5ab29tU2VydmljZScsXG4gICAgICAgICckd2luZG93JyxcbiAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsICRsb2csIFBhblpvb21TZXJ2aWNlLCAkd2luZG93KSB7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcblxuICAgICAgICAgICAgICAgICR3aW5kb3dFbGVtZW50LFxuXG4gICAgICAgICAgICAgICAgY29tcGlsZWREaXJlY3RpdmVzLFxuXG4gICAgICAgICAgICAgICAgU2Nyb2xsSGFuZGxlcixcbiAgICAgICAgICAgICAgICBzY3JvbGxIYW5kbGVyO1xuXG4gICAgICAgICAgICBjb21waWxlZERpcmVjdGl2ZXMgPSB7fTtcblxuICAgICAgICAgICAgU2Nyb2xsSGFuZGxlciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9TY3JvbGxIYW5kbGVyJyk7XG4gICAgICAgICAgICBzY3JvbGxIYW5kbGVyID0gbmV3IFNjcm9sbEhhbmRsZXIoJHNjb3BlLCAkdGltZW91dCwgJGxvZyk7XG5cblxuICAgICAgICAgICAgJHNjb3BlLnBhbnpvb21JZCA9ICdwYW56b29tSWQnOyAvL3Njb3BlLmlkICsgJy1wYW56b29tZWQnO1xuXG4gICAgICAgICAgICAkc2NvcGUuem9vbUxldmVsID0gNDtcblxuICAgICAgICAgICAgJHNjb3BlLnBhbnpvb21Nb2RlbCA9IHt9OyAvLyBhbHdheXMgcGFzcyBlbXB0eSBvYmplY3RcblxuICAgICAgICAgICAgJHNjb3BlLnBhbnpvb21Db25maWcgPSB7XG4gICAgICAgICAgICAgICAgem9vbUxldmVsczogMTAsXG4gICAgICAgICAgICAgICAgbmV1dHJhbFpvb21MZXZlbDogJHNjb3BlLnpvb21MZXZlbCxcbiAgICAgICAgICAgICAgICBzY2FsZVBlclpvb21MZXZlbDogMS4yNSxcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogNTAsXG4gICAgICAgICAgICAgICAgaGFsdFNwZWVkOiA1MCxcblxuICAgICAgICAgICAgICAgIG1vZGVsQ2hhbmdlZENhbGxiYWNrOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIFBhblpvb21TZXJ2aWNlLmdldEFQSSgkc2NvcGUucGFuem9vbUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFwaSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvcExlZnRDb3JuZXIsIGJvdHRvbVJpZ2h0Q29ybmVyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnpvb21MZXZlbCA9IHZhbC56b29tTGV2ZWw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BMZWZ0Q29ybmVyID0gYXBpLmdldE1vZGVsUG9zaXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3R0b21SaWdodENvcm5lciA9IGFwaS5nZXRNb2RlbFBvc2l0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogJHNjb3BlLmNhbnZhc1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAkc2NvcGUuY2FudmFzSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUudmlzaWJsZUFyZWEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogdG9wTGVmdENvcm5lci55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0b3BMZWZ0Q29ybmVyLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBib3R0b21SaWdodENvcm5lci54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3R0b206IGJvdHRvbVJpZ2h0Q29ybmVyLnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICR3aW5kb3dFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpO1xuXG4gICAgICAgICAgICAkd2luZG93RWxlbWVudC5iaW5kKFxuICAgICAgICAgICAgICAgICdyZXNpemUnLCBzY3JvbGxIYW5kbGVyLm9uV2luZG93UmVzaXplXG4gICAgICAgICAgICApO1xuXG5cbiAgICAgICAgICAgICRzY29wZS5nZXRDc3NDbGFzcyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBjbGFzc1N0cmluZztcblxuICAgICAgICAgICAgICAgIGNsYXNzU3RyaW5nID0gJ2RpYWdyYW0tY29udGFpbmVyJztcblxuICAgICAgICAgICAgICAgIGNsYXNzU3RyaW5nICs9ICcgem9vbS1sZXZlbC0nICsgJHNjb3BlLnpvb21MZXZlbDtcblxuICAgICAgICAgICAgICAgIGNsYXNzU3RyaW5nICs9IHNlbGYuaXNFZGl0YWJsZSgpID8gJyBlZGl0YWJsZScgOiAncmVhZG9ubHknO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXNzU3RyaW5nO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRWaXNpYmxlQXJlYSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnZpc2libGVBcmVhO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRJZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWFncmFtSWQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdCgkc2NvcGUuZGlhZ3JhbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbUlkID0gJHNjb3BlLmRpYWdyYW0uaWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpYWdyYW1JZDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RGlhZ3JhbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldFpvb21MZXZlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnpvb21MZXZlbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0Q29tcGlsZWREaXJlY3RpdmUgPSBmdW5jdGlvbiAoZGlyZWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkRGlyZWN0aXZlc1tkaXJlY3RpdmVdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5zZXRDb21waWxlZERpcmVjdGl2ZSA9IGZ1bmN0aW9uIChkaXJlY3RpdmUsIGNvbXBpbGVkRGlyZWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgY29tcGlsZWREaXJlY3RpdmVzW2RpcmVjdGl2ZV0gPSBjb21waWxlZERpcmVjdGl2ZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuaXNFZGl0YWJsZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KCRzY29wZS5kaWFncmFtKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLmNvbmZpZyA9ICRzY29wZS5kaWFncmFtLmNvbmZpZyB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW0uY29uZmlnLmVkaXRhYmxlID09PSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmlzQ29tcG9uZW50U2VsZWN0ZWQgPSBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdCgkc2NvcGUuZGlhZ3JhbSkpIHtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZihjb21wb25lbnQuaWQpID4gLTE7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0Q29uZmlnID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuY29uZmlnO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5zZXRJbml0aWFsaXplZCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5pbml0aWFsaXplZCA9IHZhbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfVxuICAgIF0pXG4gICAgLmRpcmVjdGl2ZSgnZGlhZ3JhbUNvbnRhaW5lcicsIFtcbiAgICAgICAgJ2RpYWdyYW1TZXJ2aWNlJywgJyRsb2cnLCAnJHRpbWVvdXQnLCAnUGFuWm9vbVNlcnZpY2UnLFxuICAgICAgICBmdW5jdGlvbiAoZGlhZ3JhbVNlcnZpY2UsICRsb2csICR0aW1lb3V0KSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0RpYWdyYW1Db250YWluZXJDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBkaWFncmFtOiAnPScsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogJz0nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2RpYWdyYW1Db250YWluZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnSW4gZGlhZ3JhbSBjb250YWluZXInLCBzY29wZS52aXNpYmxlQXJlYSk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY29uZmlnID0gc2NvcGUuY29uZmlnIHx8IHt9O1xuXG4vLyAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FudmFzV2lkdGggPSAkKGVsZW1lbnQpXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIC5vdXRlcldpZHRoKCk7XG4vLyAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FudmFzSGVpZ2h0ID0gJChlbGVtZW50KVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAub3V0ZXJIZWlnaHQoKTtcbi8vXG4vL1xuLy8gICAgICAgICAgICAgICAgICAgIHNjb3BlLnZpc2libGVBcmVhID0ge1xuLy8gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IDAsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBzY29wZS5jYW52YXNXaWR0aCxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiBzY29wZS5jYW52YXNIZWlnaHRcbi8vICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGNvbnRlbnRQYW5lID0gZWxlbWVudC5maW5kKCc+LmRpYWdyYW0tY29udGVudC1wYW5lJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYnJvYWRjYXN0KCdEaWFncmFtQ29udGFpbmVySW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG5cbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCAkKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxuYW5ndWxhci5tb2R1bGUoICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kcmF3aW5nR3JpZCcsIFtdIClcbiAgICAuZGlyZWN0aXZlKCAnZHJhd2luZ0dyaWQnLCBbICckbG9nJyxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZHJhd2luZ0dyaWQuaHRtbCcsXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyICRlbGVtZW50O1xuXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50ID0gJChlbGVtZW50KTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2goJ2RpYWdyYW0uY29uZmlnLndpZHRoJywgZnVuY3Rpb24obmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50Lm91dGVyV2lkdGgobmV3VmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdkaWFncmFtLmNvbmZpZy5oZWlnaHQnLCBmdW5jdGlvbihuZXdWYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50Lm91dGVySGVpZ2h0KG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGZhYnJpYyovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbmFuZ3VsYXIubW9kdWxlKCAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZmFicmljQ2FudmFzJywgW10gKVxuICAgIC5jb250cm9sbGVyKCAnRmFicmljQ2FudmFzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgpIHtcblxuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoICdmYWJyaWNDYW52YXMnLCBbXG4gICAgICAgICckbG9nJyxcbiAgICAgICAgJ2RpYWdyYW1TZXJ2aWNlJyxcbiAgICAgICAgZnVuY3Rpb24gKCAkbG9nLCBkaWFncmFtU2VydmljZSApIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRmFicmljQ2FudmFzQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgcmVxdWlyZTogJ15kaWFncmFtQ29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9mYWJyaWNDYW52YXMuaHRtbCcsXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKCBzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcywgZGlhZ3JhbUNvbnRhaW5lckN0cmwgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckRpYWdyYW07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuaWQgPSBkaWFncmFtQ29udGFpbmVyQ3RybC5nZXRJZCgpICsgJ2ZhYnJpYy1jYW52YXMnO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKCBzY29wZS5pZCApO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5zZXRCYWNrZ3JvdW5kQ29sb3IoICdyZ2JhKDI1NSwgNzMsIDY0LCAwLjYpJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckRpYWdyYW0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggc2NvcGUuZGlhZ3JhbURhdGEgKSApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0FycmF5KCBzY29wZS5kaWFncmFtRGF0YS5zeW1ib2xzICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBzY29wZS5kaWFncmFtRGF0YS5zeW1ib2xzLCBmdW5jdGlvbiAoIHN5bWJvbCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbVNlcnZpY2UuZ2V0U1ZHRm9yU3ltYm9sVHlwZSggc3ltYm9sLnR5cGUgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG9iamVjdCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3ZnT2JqZWN0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Z09iamVjdCA9IG9iamVjdC5zZXQoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN5bWJvbC54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBzeW1ib2wueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ2xlOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgIGNhbnZhcy5hZGQoc3ZnT2JqZWN0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVjdCA9IG5ldyBmYWJyaWMuUmVjdCgge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiA1MCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6ICdncmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmdsZTogMjAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAxMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLmFkZCggcmVjdCApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ2UnLCBzdmdPYmplY3QpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVuZGVyQWxsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2goIGRpYWdyYW1Db250YWluZXJDdHJsLmdldERpYWdyYW1EYXRhLCBmdW5jdGlvbiAoIHZhbHVlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZyggJ0RpYWdyYW1EYXRhIGlzICcsIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaWFncmFtRGF0YSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyRGlhZ3JhbSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnBvcnQnLCBbXVxuKVxuICAgIC5jb250cm9sbGVyKCAnUG9ydENvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcbiAgICAgICAgJHNjb3BlLmdldFBvcnRUcmFuc2Zvcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtU3RyaW5nO1xuXG4gICAgICAgICAgICB0cmFuc2Zvcm1TdHJpbmcgPSAndHJhbnNsYXRlKCcgKyAkc2NvcGUucG9ydEluc3RhbmNlLnBvcnRTeW1ib2wueCArICcsJyArICRzY29wZS5wb3J0SW5zdGFuY2UucG9ydFN5bWJvbFxuICAgICAgICAgICAgICAgIC55ICsgJyknO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtU3RyaW5nO1xuICAgICAgICB9O1xuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoXG4gICAgICAgICdwb3J0JyxcblxuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQb3J0Q29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvcG9ydC5odG1sJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRycsXG4gICAgICAgICAgICAgICAgcmVxdWlyZTogWyAnXnN2Z0RpYWdyYW0nLCAnXmRpYWdyYW1Db250YWluZXInIF0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKCBzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcywgY29udHJvbGxlcnMgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHN2Z0RpYWdyYW1Db250cm9sbGVyO1xuXG4gICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyID0gY29udHJvbGxlcnNbIDAgXTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS5vblBvcnRDbGljayA9IGZ1bmN0aW9uICggcG9ydCwgJGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIub25Qb3J0Q2xpY2soIHNjb3BlLmNvbXBvbmVudCwgcG9ydCwgJGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25Qb3J0TW91c2VEb3duID0gZnVuY3Rpb24gKCBwb3J0LCAkZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5vblBvcnRNb3VzZURvd24oIHNjb3BlLmNvbXBvbmVudCwgcG9ydCwgJGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25Qb3J0TW91c2VVcCA9IGZ1bmN0aW9uICggcG9ydCwgJGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIub25Qb3J0TW91c2VVcCggc2NvcGUuY29tcG9uZW50LCBwb3J0LCAkZXZlbnQgKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbik7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVzaXplVG9IZWlnaHRNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbW1zLnJlc2l6ZVRvSGVpZ2h0JywgW10pO1xuXG5cbnJlc2l6ZVRvSGVpZ2h0TW9kdWxlLmRpcmVjdGl2ZSgncmVzaXplVG9IZWlnaHQnLCBmdW5jdGlvbiAoJHdpbmRvdykge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgaGVpZ2h0SXNMZXNzV2l0aDogJz0/J1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcblxuICAgICAgICAgICAgdmFyIHdpbmRvdyA9IGFuZ3VsYXIuZWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvd1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0ID0gcGFyc2VJbnQoYXR0cmlidXRlcy5taW5kSGVpZ2h0LCAxMCkgfHwgMCxcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQgPSBwYXJzZUludChhdHRyaWJ1dGVzLm1heEhlaWdodCwgMTApIHx8IEluZmluaXR5LFxuICAgICAgICAgICAgICAgIGhlaWdodElzTGVzc1dpdGggPSBwYXJzZUludChzY29wZS5oZWlnaHRJc0xlc3NXaXRoLCAxMCkgfHwgMDtcblxuICAgICAgICAgICAgc2NvcGUuZ2V0V2luZG93SGVpZ2h0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIG1heCwgbWluLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICBoZWlnaHQgPSAoJHdpbmRvdy5pbm5lckhlaWdodCA+IDApID8gJHdpbmRvdy5pbm5lckhlaWdodCA6IHNjcmVlbi5oZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICBtYXggPSBtYXhIZWlnaHQ7XG4gICAgICAgICAgICAgICAgbWluID0gbWluSGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKGhlaWdodCAtIGhlaWdodElzTGVzc1dpdGgsIG1heCksIG1pbik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goc2NvcGUuZ2V0V2luZG93SGVpZ2h0LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm91dGVySGVpZ2h0KG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgd2luZG93LmJpbmQoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc2l6ZVRvSGVpZ2h0TW9kdWxlOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHJlc2l6ZVRvV2luZG93TW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ21tcy5yZXNpemVUb1dpbmRvdycsIFtdKTtcblxuXG5yZXNpemVUb1dpbmRvd01vZHVsZS5kaXJlY3RpdmUoJ3Jlc2l6ZVRvV2luZG93JywgZnVuY3Rpb24gKCR3aW5kb3cpIHtcblxuICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG5cbiAgICB2YXIgd2luZG93ID0gYW5ndWxhci5lbGVtZW50KFxuICAgICAgICAkd2luZG93XG4gICAgICApLFxuICAgICAgbWluV2lkdGggPSBwYXJzZUludChhdHRyaWJ1dGVzLm1pbldpZHRoLCAxMCkgfHwgMCxcbiAgICAgIG1pbkhlaWdodCA9IHBhcnNlSW50KGF0dHJpYnV0ZXMubWluZEhlaWdodCwgMTApIHx8IDAsXG4gICAgICBtYXhXaWR0aCA9IHBhcnNlSW50KGF0dHJpYnV0ZXMubWF4V2lkdGgsIDEwKSB8fCBJbmZpbml0eSxcbiAgICAgIG1heEhlaWdodCA9IHBhcnNlSW50KGF0dHJpYnV0ZXMubWF4SGVpZ2h0LCAxMCkgfHwgSW5maW5pdHksXG4gICAgICB3aWR0aElzTGVzc1dpdGggPSBwYXJzZUludChhdHRyaWJ1dGVzLndpZHRoSXNMZXNzV2l0aCwgMTApIHx8IDAsXG4gICAgICBoZWlnaHRJc0xlc3NXaXRoID0gcGFyc2VJbnQoYXR0cmlidXRlcy5oZWlnaHRJc0xlc3NXaXRoLCAxMCkgfHwgMCxcblxuICAgICAgcmV2ZXJzZUluUG9ydHJhaXQgPSB0cnVlO1xuXG4gICAgc2NvcGUuZ2V0V2luZG93SGVpZ2h0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgbWF4LCBtaW4sXG4gICAgICAgIGhlaWdodCwgd2lkdGg7XG5cbiAgICAgIGhlaWdodCA9ICgkd2luZG93LmlubmVySGVpZ2h0ID4gMCkgPyAkd2luZG93LmlubmVySGVpZ2h0IDogc2NyZWVuLmhlaWdodDtcbiAgICAgIHdpZHRoID0gKCR3aW5kb3cuaW5uZXJXaWR0aCA+IDApID8gJHdpbmRvdy5pbm5lcldpZHRoIDogc2NyZWVuLndpZHRoO1xuXG4gICAgICBpZiAocmV2ZXJzZUluUG9ydHJhaXQgJiYgaGVpZ2h0PndpZHRoKSB7XG4gICAgICAgIG1heCA9IG1heFdpZHRoO1xuICAgICAgICBtaW4gPSBtaW5XaWR0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heCA9IG1heEhlaWdodDtcbiAgICAgICAgbWluID0gbWluSGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gTWF0aC5tYXgoTWF0aC5taW4oaGVpZ2h0LWhlaWdodElzTGVzc1dpdGgsIG1heCksIG1pbik7XG4gICAgfTtcblxuICAgIHNjb3BlLmdldFdpbmRvd1dpZHRoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgbWF4LCBtaW4sXG4gICAgICAgIGhlaWdodCwgd2lkdGg7XG5cbiAgICAgIGhlaWdodCA9ICgkd2luZG93LmlubmVySGVpZ2h0ID4gMCkgPyAkd2luZG93LmlubmVySGVpZ2h0IDogc2NyZWVuLmhlaWdodDtcbiAgICAgIHdpZHRoID0gKCR3aW5kb3cuaW5uZXJXaWR0aCA+IDApID8gJHdpbmRvdy5pbm5lcldpZHRoIDogc2NyZWVuLndpZHRoO1xuXG4gICAgICBpZiAocmV2ZXJzZUluUG9ydHJhaXQgJiYgaGVpZ2h0PndpZHRoKSB7XG4gICAgICAgIG1heCA9IG1heEhlaWdodDtcbiAgICAgICAgbWluID0gbWluSGVpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF4ID0gbWF4V2lkdGg7XG4gICAgICAgIG1pbiA9IG1pbldpZHRoO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gTWF0aC5tYXgoTWF0aC5taW4od2lkdGgtd2lkdGhJc0xlc3NXaXRoLCBtYXgpLCBtaW4pO1xuICAgIH07XG5cbiAgICBzY29wZS4kd2F0Y2goc2NvcGUuZ2V0V2luZG93V2lkdGgsXG4gICAgICBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgZWxlbWVudC5vdXRlcldpZHRoKG5ld1ZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgc2NvcGUuJHdhdGNoKHNjb3BlLmdldFdpbmRvd0hlaWdodCxcbiAgICAgIGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICBlbGVtZW50Lm91dGVySGVpZ2h0KG5ld1ZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgd2luZG93LmJpbmQoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgIH0pO1xuXG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXNpemVUb1dpbmRvd01vZHVsZTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkc2NvcGUsIGRpYWdyYW1TZXJ2aWNlLCB3aXJpbmdTZXJ2aWNlLCBvcGVyYXRpb25zTWFuYWdlciwgJGxvZykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBnZXRPZmZzZXRUb01vdXNlLFxuICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IsXG4gICAgICAgIGRyYWdUYXJnZXRzRGVzY3JpcHRvcixcblxuICAgICAgICBvbkRpYWdyYW1Nb3VzZVVwLFxuICAgICAgICBvbkRpYWdyYW1Nb3VzZU1vdmUsXG4gICAgICAgIG9uRGlhZ3JhbU1vdXNlTGVhdmUsXG4gICAgICAgIG9uV2luZG93Qmx1cixcbiAgICAgICAgb25Db21wb25lbnRNb3VzZVVwLFxuICAgICAgICBvbkNvbXBvbmVudE1vdXNlRG93bixcblxuICAgICAgICBzdGFydERyYWcsXG4gICAgICAgIGZpbmlzaERyYWcsXG4gICAgICAgIGNhbmNlbERyYWc7XG5cblxuICAgIGdldE9mZnNldFRvTW91c2UgPSBmdW5jdGlvbiAoICRldmVudCApIHtcblxuICAgICAgICB2YXIgb2Zmc2V0O1xuXG4gICAgICAgIG9mZnNldCA9IHtcbiAgICAgICAgICAgIHg6ICRldmVudC5wYWdlWCAtICRzY29wZS5lbGVtZW50T2Zmc2V0LmxlZnQsXG4gICAgICAgICAgICB5OiAkZXZlbnQucGFnZVkgLSAkc2NvcGUuZWxlbWVudE9mZnNldC50b3BcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuXG4gICAgfTtcblxuXG4gICAgc3RhcnREcmFnID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHNlbGYuZHJhZ2dpbmcgPSB0cnVlO1xuXG4gICAgICAgIC8vc2VsZi5kcmFnT3BlcmF0aW9uID0gb3BlcmF0aW9uc01hbmFnZXIuaW5pdE5ldygnc2V0Q29tcG9uZW50UG9zaXRpb24nKTtcblxuICAgICAgICBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3I7XG4gICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvciA9IG51bGw7XG5cbiAgICAgICAgJGxvZy5kZWJ1ZyggJ0RyYWdnaW5nJywgZHJhZ1RhcmdldHNEZXNjcmlwdG9yICk7XG5cbiAgICB9O1xuXG4gICAgY2FuY2VsRHJhZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKCBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgKSB7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZHJhZ1RhcmdldHNEZXNjcmlwdG9yLnRhcmdldHMsIGZ1bmN0aW9uICggdGFyZ2V0ICkge1xuXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmNvbXBvbmVudC5zZXRQb3NpdGlvbihcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Lm9yaWdpbmFsUG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Lm9yaWdpbmFsUG9zaXRpb24ueVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IuYWZmZWN0ZWRXaXJlcywgZnVuY3Rpb24gKCB3aXJlICkge1xuXG4gICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5hZGp1c3RXaXJlRW5kU2VnbWVudHMoIHdpcmUgKTtcblxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLmRyYWdnaW5nID0gZmFsc2U7XG5cbiAgICB9O1xuXG4gICAgZmluaXNoRHJhZyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBzZWxmLmRyYWdnaW5nID0gZmFsc2U7XG5cbi8vICAgICAgICBhbmd1bGFyLmZvckVhY2goZHJhZ1RhcmdldHNEZXNjcmlwdG9yLnRhcmdldHMsIGZ1bmN0aW9uKHRhcmdldCkge1xuLy9cbi8vICAgICAgICAgICAgdmFyIHBvc2l0aW9uO1xuLy9cbi8vICAgICAgICAgICAgcG9zaXRpb24gPSB0YXJnZXQuY29tcG9uZW50LmdldFBvc2l0aW9uKCk7XG4vL1xuLy8gICAgICAgICAgICBzZWxmLmRyYWdPcGVyYXRpb24uY29tbWl0KCB0YXJnZXQuY29tcG9uZW50LCBwb3NpdGlvbi54LCBwb3NpdGlvbi55ICk7XG4vLyAgICAgICAgfSk7XG5cblxuICAgICAgICBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgICRsb2cuZGVidWcoICdGaW5pc2ggZHJhZ2dpbmcnICk7XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtTW91c2VNb3ZlID0gZnVuY3Rpb24oJGV2ZW50KSB7XG5cbiAgICAgICAgaWYgKCBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgKSB7XG4gICAgICAgICAgICBzdGFydERyYWcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggZHJhZ1RhcmdldHNEZXNjcmlwdG9yICkge1xuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0O1xuXG4gICAgICAgICAgICBvZmZzZXQgPSBnZXRPZmZzZXRUb01vdXNlKCAkZXZlbnQgKTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IudGFyZ2V0cywgZnVuY3Rpb24gKCB0YXJnZXQgKSB7XG5cbiAgICAgICAgICAgICAgICB0YXJnZXQuY29tcG9uZW50LnNldFBvc2l0aW9uKFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQueCArIHRhcmdldC5kZWx0YVRvQ3Vyc29yLngsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldC55ICsgdGFyZ2V0LmRlbHRhVG9DdXJzb3IueVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IuYWZmZWN0ZWRXaXJlcywgZnVuY3Rpb24gKCB3aXJlICkge1xuXG4gICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5hZGp1c3RXaXJlRW5kU2VnbWVudHMoIHdpcmUgKTtcblxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBvbkRpYWdyYW1Nb3VzZVVwID0gZnVuY3Rpb24oJGV2ZW50KSB7XG5cbiAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gbnVsbDtcblxuICAgICAgICBpZiAoIGRyYWdUYXJnZXRzRGVzY3JpcHRvciApIHtcbiAgICAgICAgICAgIGZpbmlzaERyYWcoKTtcbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIG9uRGlhZ3JhbU1vdXNlTGVhdmUgPSBmdW5jdGlvbigvKiRldmVudCovKSB7XG5cbiAgICAgICAgY2FuY2VsRHJhZygpO1xuXG4gICAgfTtcblxuICAgIG9uV2luZG93Qmx1ciA9IGZ1bmN0aW9uKC8qJGV2ZW50Ki8pIHtcblxuICAgICAgICBjYW5jZWxEcmFnKCk7XG5cbiAgICB9O1xuXG4gICAgb25Db21wb25lbnRNb3VzZVVwID0gZnVuY3Rpb24oY29tcG9uZW50LCAkZXZlbnQpIHtcblxuICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgIGlmICggZHJhZ1RhcmdldHNEZXNjcmlwdG9yICkge1xuICAgICAgICAgICAgZmluaXNoRHJhZygpO1xuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgb25Db21wb25lbnRNb3VzZURvd24gPSBmdW5jdGlvbiAoY29tcG9uZW50LCAkZXZlbnQpIHtcblxuICAgICAgICB2YXIgY29tcG9uZW50c1RvRHJhZyxcbiAgICAgICAgICAgIGdldERyYWdEZXNjcmlwdG9yO1xuXG4gICAgICAgIGNvbXBvbmVudHNUb0RyYWcgPSBbXTtcblxuICAgICAgICBnZXREcmFnRGVzY3JpcHRvciA9IGZ1bmN0aW9uICggY29tcG9uZW50ICkge1xuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gZ2V0T2Zmc2V0VG9Nb3VzZSggJGV2ZW50ICk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiBjb21wb25lbnQueCxcbiAgICAgICAgICAgICAgICAgICAgeTogY29tcG9uZW50LnlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlbHRhVG9DdXJzb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogY29tcG9uZW50LnggLSBvZmZzZXQueCxcbiAgICAgICAgICAgICAgICAgICAgeTogY29tcG9uZW50LnkgLSBvZmZzZXQueVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb25maWcgPSAkc2NvcGUuZGlhZ3JhbS5jb25maWcgfHwge307XG5cbiAgICAgICAgaWYgKCAkc2NvcGUuZGlhZ3JhbS5jb25maWcuZWRpdGFibGUgPT09IHRydWUgJiZcbiAgICAgICAgICAgIGNvbXBvbmVudC5ub25TZWxlY3RhYmxlICE9PSB0cnVlICYmXG4gICAgICAgICAgICBjb21wb25lbnQubG9jYXRpb25Mb2NrZWQgIT09IHRydWUgKSB7XG5cbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yID0ge1xuICAgICAgICAgICAgICAgIHRhcmdldHM6IFsgZ2V0RHJhZ0Rlc2NyaXB0b3IoIGNvbXBvbmVudCApIF1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbXBvbmVudHNUb0RyYWcucHVzaCggY29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgIGlmICggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZiggY29tcG9uZW50LmlkICkgPiAtMSApIHtcblxuICAgICAgICAgICAgICAgIC8vIERyYWcgYWxvbmcgb3RoZXIgc2VsZWN0ZWQgY29tcG9uZW50c1xuXG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcywgZnVuY3Rpb24gKCBzZWxlY3RlZENvbXBvbmVudElkICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZENvbXBvbmVudDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGNvbXBvbmVudC5pZCAhPT0gc2VsZWN0ZWRDb21wb25lbnRJZCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDb21wb25lbnQgPSAkc2NvcGUuZGlhZ3JhbS5jb21wb25lbnRzQnlJZFsgc2VsZWN0ZWRDb21wb25lbnRJZCBdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IudGFyZ2V0cy5wdXNoKCBnZXREcmFnRGVzY3JpcHRvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENvbXBvbmVudCApICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHNUb0RyYWcucHVzaCggc2VsZWN0ZWRDb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvci5hZmZlY3RlZFdpcmVzID0gJHNjb3BlLmRpYWdyYW0uZ2V0V2lyZXNGb3JDb21wb25lbnRzKFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHNUb0RyYWdcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHRoaXMub25EaWFncmFtTW91c2VVcCA9IG9uRGlhZ3JhbU1vdXNlVXA7XG4gICAgdGhpcy5vbkRpYWdyYW1Nb3VzZU1vdmUgPSBvbkRpYWdyYW1Nb3VzZU1vdmU7XG4gICAgdGhpcy5vbkRpYWdyYW1Nb3VzZUxlYXZlID0gb25EaWFncmFtTW91c2VMZWF2ZTtcbiAgICB0aGlzLm9uV2luZG93Qmx1ciA9IG9uV2luZG93Qmx1cjtcbiAgICB0aGlzLm9uQ29tcG9uZW50TW91c2VVcCA9IG9uQ29tcG9uZW50TW91c2VVcDtcbiAgICB0aGlzLm9uQ29tcG9uZW50TW91c2VEb3duID0gb25Db21wb25lbnRNb3VzZURvd247XG5cbiAgICByZXR1cm4gdGhpcztcblxufTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRzY29wZSwgZGlhZ3JhbVNlcnZpY2UsIGdyaWRTZXJ2aWNlLCAkbG9nKSB7XG5cbiAgICB2YXIgb25Db21wb25lbnRNb3VzZVVwLFxuXG4gICAgICAgIG1vdmVDb21wb25lbnRFbGVtZW50VG9Gcm9udCxcbiAgICAgICAgdG9nZ2xlQ29tcG9uZW50U2VsZWN0ZWQ7XG5cblxuICAgIG1vdmVDb21wb25lbnRFbGVtZW50VG9Gcm9udCA9IGZ1bmN0aW9uICggY29tcG9uZW50SWQgKSB7XG5cbiAgICAgICAgdmFyIHosXG4gICAgICAgICAgICBjb21wb25lbnQsXG4gICAgICAgICAgICBuZWVkc1RvYmVSZW9yZGVyZWQ7XG5cbiAgICAgICAgbmVlZHNUb2JlUmVvcmRlcmVkID0gZmFsc2U7XG5cbiAgICAgICAgeiA9IGRpYWdyYW1TZXJ2aWNlLmdldEhpZ2hlc3RaKCk7XG4gICAgICAgIGNvbXBvbmVudCA9ICRzY29wZS5kaWFncmFtLmNvbXBvbmVudHNCeUlkWyBjb21wb25lbnRJZCBdO1xuXG4gICAgICAgIGlmICggaXNOYU4oIGNvbXBvbmVudC56ICkgKSB7XG4gICAgICAgICAgICBjb21wb25lbnQueiA9IHo7XG4gICAgICAgICAgICBuZWVkc1RvYmVSZW9yZGVyZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCBjb21wb25lbnQueiA8IHogKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnogPSB6ICsgMTtcbiAgICAgICAgICAgICAgICBuZWVkc1RvYmVSZW9yZGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBuZWVkc1RvYmVSZW9yZGVyZWQgKSB7XG4gICAgICAgICAgICBncmlkU2VydmljZS5yZW9yZGVyVmlzaWJsZUNvbXBvbmVudHMoICRzY29wZS5pZCApO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG5cbiAgICB0b2dnbGVDb21wb25lbnRTZWxlY3RlZCA9ICBmdW5jdGlvbiAoIGNvbXBvbmVudCwgJGV2ZW50ICkge1xuXG4gICAgICAgIHZhciBpbmRleDtcblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb25maWcgPSAkc2NvcGUuZGlhZ3JhbS5jb25maWcgfHwge307XG5cbiAgICAgICAgaWYgKCBhbmd1bGFyLmlzT2JqZWN0KCBjb21wb25lbnQgKSAmJiAkc2NvcGUuZGlhZ3JhbS5jb25maWcuZGlzYWxsb3dTZWxlY3Rpb24gIT09IHRydWUgJiYgY29tcG9uZW50Lm5vblNlbGVjdGFibGUgIT09IHRydWUgKSB7XG5cbiAgICAgICAgICAgIGluZGV4ID0gJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZiggY29tcG9uZW50LmlkICk7XG5cbiAgICAgICAgICAgIGlmICggaW5kZXggPiAtMSApIHtcblxuICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLnNwbGljZSggaW5kZXgsIDEgKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGlmICggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb25maWcubXVsdGlTZWxlY3QgIT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnNoaWZ0S2V5ICE9PSB0cnVlICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMsIGZ1bmN0aW9uICggY29tcG9uZW50SWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb21wb25lbnRzQnlJZFsgY29tcG9uZW50SWQgXS5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMucHVzaCggY29tcG9uZW50LmlkICk7XG5cbiAgICAgICAgICAgICAgICBtb3ZlQ29tcG9uZW50RWxlbWVudFRvRnJvbnQoIGNvbXBvbmVudC5pZCApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRsb2cuZGVidWcoJ3NlbGVjdGVkcycsICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG5cbiAgICBvbkNvbXBvbmVudE1vdXNlVXAgPSBmdW5jdGlvbihjb21wb25lbnQsICRldmVudCkge1xuICAgICAgICB0b2dnbGVDb21wb25lbnRTZWxlY3RlZCggY29tcG9uZW50LCAkZXZlbnQgKTtcblxuICAgIH07XG5cbiAgICB0aGlzLm9uQ29tcG9uZW50TW91c2VVcCA9IG9uQ29tcG9uZW50TW91c2VVcDtcblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHNjb3BlLCBkaWFncmFtU2VydmljZSwgd2lyaW5nU2VydmljZSwgZ3JpZFNlcnZpY2UsICRsb2cpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcyxcblxuICAgICAgICBXaXJlID0gcmVxdWlyZSggJy4uLy4uLy4uL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvV2lyZS5qcycgKSxcblxuICAgICAgICB3aXJlU3RhcnQsXG5cbiAgICAgICAgc3RhcnRXaXJlLFxuICAgICAgICBhZGRDb3JuZXJUb05ld1dpcmVMaW5lLFxuICAgICAgICBmaW5pc2hXaXJlLFxuICAgICAgICBjYW5jZWxXaXJlLFxuXG4gICAgICAgIG9uRGlhZ3JhbU1vdXNlVXAsXG4gICAgICAgIG9uRGlhZ3JhbU1vdXNlTW92ZSxcbiAgICAgICAgb25EaWFncmFtTW91c2VMZWF2ZSxcbiAgICAgICAgb25XaW5kb3dCbHVyLFxuICAgICAgICBvblBvcnRNb3VzZURvd247XG5cblxuXG4gICAgc3RhcnRXaXJlID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCkge1xuXG4gICAgICAgIHdpcmVTdGFydCA9IHtcbiAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgcG9ydDogcG9ydFxuICAgICAgICB9O1xuXG4gICAgICAgICRsb2cuZGVidWcoICdTdGFydGluZyB3aXJlJywgd2lyZVN0YXJ0ICk7XG5cbiAgICAgICAgc2VsZi53aXJpbmcgPSB0cnVlO1xuXG4gICAgfTtcblxuICAgIGFkZENvcm5lclRvTmV3V2lyZUxpbmUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGxhc3RTZWdtZW50O1xuXG4gICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cyA9ICRzY29wZS5uZXdXaXJlTGluZS5zZWdtZW50cztcblxuICAgICAgICBsYXN0U2VnbWVudCA9ICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50c1sgJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzLmxlbmd0aCAtIDEgXTtcblxuICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUuYWN0aXZlU2VnbWVudFN0YXJ0UG9zaXRpb24gPSB7XG4gICAgICAgICAgICB4OiBsYXN0U2VnbWVudC54MixcbiAgICAgICAgICAgIHk6IGxhc3RTZWdtZW50LnkyXG4gICAgICAgIH07XG5cbiAgICB9O1xuXG4gICAgZmluaXNoV2lyZSA9IGZ1bmN0aW9uICggY29tcG9uZW50LCBwb3J0ICkge1xuXG4gICAgICAgIHZhciB3aXJlID0gbmV3IFdpcmUoIHtcbiAgICAgICAgICAgIGlkOiAnbmV3LXdpcmUtJyArIE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAxMDAwMCApLFxuICAgICAgICAgICAgZW5kMToge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogd2lyZVN0YXJ0LmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICBwb3J0OiB3aXJlU3RhcnQucG9ydFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVuZDI6IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICBwb3J0OiBwb3J0XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gKTtcblxuICAgICAgICB3aXJlLnNlZ21lbnRzID0gYW5ndWxhci5jb3B5KFxuICAgICAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzLmNvbmNhdChcbiAgICAgICAgICAgICAgICB3aXJpbmdTZXJ2aWNlLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucygge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMTogJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMjogcG9ydC5nZXRHcmlkUG9zaXRpb24oKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnRWxib3dSb3V0ZXInXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSApO1xuXG5cbiAgICAgICAgZGlhZ3JhbVNlcnZpY2UuYWRkV2lyZSggJHNjb3BlLmlkLCB3aXJlICk7XG5cbiAgICAgICAgJHNjb3BlLmRpYWdyYW0ud2lyZXNbIHdpcmUuaWQgXSA9IHdpcmU7XG5cbiAgICAgICAgZ3JpZFNlcnZpY2UuaW52YWxpZGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyggJHNjb3BlLmlkICk7XG5cbiAgICAgICAgJGxvZy5kZWJ1ZyggJ0ZpbmlzaCB3aXJlJywgd2lyZSApO1xuXG4gICAgICAgIHdpcmVTdGFydCA9IG51bGw7XG4gICAgICAgICRzY29wZS5uZXdXaXJlTGluZSA9IG51bGw7XG5cbiAgICAgICAgc2VsZi53aXJpbmcgPSBmYWxzZTtcblxuICAgIH07XG5cbiAgICBjYW5jZWxXaXJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUgPSBudWxsO1xuICAgICAgICB3aXJlU3RhcnQgPSBudWxsO1xuICAgICAgICBzZWxmLndpcmluZyA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBvbkRpYWdyYW1Nb3VzZU1vdmUgPSBmdW5jdGlvbigkZXZlbnQpIHtcblxuICAgICAgICBpZiAoIHdpcmVTdGFydCApIHtcblxuXG4gICAgICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUgPSAkc2NvcGUubmV3V2lyZUxpbmUgfHwge307XG4gICAgICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHMgPSAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHMgfHwgW107XG4gICAgICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUuYWN0aXZlU2VnbWVudFN0YXJ0UG9zaXRpb24gPVxuICAgICAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5hY3RpdmVTZWdtZW50U3RhcnRQb3NpdGlvbiB8fCB3aXJlU3RhcnQucG9ydC5nZXRHcmlkUG9zaXRpb24oKTtcblxuICAgICAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLnNlZ21lbnRzID0gJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzLmNvbmNhdChcbiAgICAgICAgICAgICAgICB3aXJpbmdTZXJ2aWNlLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucygge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMTogJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6ICRldmVudC5wYWdlWCAtICRzY29wZS5lbGVtZW50T2Zmc2V0LmxlZnQgLSAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6ICRldmVudC5wYWdlWSAtICRzY29wZS5lbGVtZW50T2Zmc2V0LnRvcCAtIDNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ0VsYm93Um91dGVyJ1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIG9uRGlhZ3JhbU1vdXNlVXAgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAoIHdpcmVTdGFydCApIHtcblxuICAgICAgICAgICAgYWRkQ29ybmVyVG9OZXdXaXJlTGluZSgpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcyA9IFtdO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgb25Qb3J0TW91c2VEb3duID0gZnVuY3Rpb24oIGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50ICkge1xuXG4gICAgICAgIGlmICggd2lyZVN0YXJ0ICkge1xuXG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmICggd2lyZVN0YXJ0LnBvcnQgIT09IHBvcnQgKSB7XG4gICAgICAgICAgICAgICAgZmluaXNoV2lyZSggY29tcG9uZW50LCBwb3J0ICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbmNlbFdpcmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBzdGFydFdpcmUoY29tcG9uZW50LCBwb3J0KTtcbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtTW91c2VMZWF2ZSA9IGZ1bmN0aW9uKC8qJGV2ZW50Ki8pIHtcbiAgICAgICAgaWYgKHNlbGYud2lyaW5nKSB7XG4gICAgICAgICAgICBjYW5jZWxXaXJlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25XaW5kb3dCbHVyID0gZnVuY3Rpb24oLyokZXZlbnQqLykge1xuICAgICAgICBpZiAoc2VsZi53aXJpbmcpIHtcbiAgICAgICAgICAgIGNhbmNlbFdpcmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIHRoaXMub25EaWFncmFtTW91c2VVcCA9IG9uRGlhZ3JhbU1vdXNlVXA7XG4gICAgdGhpcy5vbkRpYWdyYW1Nb3VzZU1vdmUgPSBvbkRpYWdyYW1Nb3VzZU1vdmU7XG4gICAgdGhpcy5vbkRpYWdyYW1Nb3VzZUxlYXZlID0gb25EaWFncmFtTW91c2VMZWF2ZTtcbiAgICB0aGlzLm9uV2luZG93Qmx1ciA9IG9uV2luZG93Qmx1cjtcbiAgICB0aGlzLm9uUG9ydE1vdXNlRG93biA9IG9uUG9ydE1vdXNlRG93bjtcblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIsICQqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRzY29wZSwgZGlhZ3JhbVNlcnZpY2UsICR0aW1lb3V0LCBjb250ZXh0bWVudVNlcnZpY2UsIG9wZXJhdGlvbnNNYW5hZ2VyLCAkbG9nKSB7XG5cbiAgICB2YXJcbiAgICAgICAgb25Db21wb25lbnRDb250ZXh0bWVudSxcbiAgICAgICAgb25Qb3J0Q29udGV4dG1lbnUsXG4gICAgICAgIG9uRGlhZ3JhbUNvbnRleHRtZW51LFxuICAgICAgICBvbkRpYWdyYW1Nb3VzZURvd24sXG5cbiAgICAgICAgb3Blbk1lbnU7XG5cbiAgICAkbG9nLmRlYnVnKCdJbml0aWFsaXppbmcgY29udGV4dCBtZW51cy4nKTtcblxuICAgIG9wZW5NZW51ID0gZnVuY3Rpb24oJGV2ZW50KSB7XG5cbiAgICAgICAgY29udGV4dG1lbnVTZXJ2aWNlLmNsb3NlKCk7XG5cbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgb3BlbkNvbnRleHRNZW51RXZlbnQ7XG5cbiAgICAgICAgICAgICAgICBvcGVuQ29udGV4dE1lbnVFdmVudCA9IGFuZ3VsYXIuZXh0ZW5kKCQuRXZlbnQoJ29wZW5Db250ZXh0TWVudScpLCB7XG4gICAgICAgICAgICAgICAgY2xpZW50WDogJGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICAgICAgY2xpZW50WTogJGV2ZW50LmNsaWVudFksXG4gICAgICAgICAgICAgICAgcGFnZVg6ICRldmVudC5wYWdlWCxcbiAgICAgICAgICAgICAgICBwYWdlWTogJGV2ZW50LnBhZ2VZLFxuICAgICAgICAgICAgICAgIHNjcmVlblg6ICRldmVudC5zY3JlZW5YLFxuICAgICAgICAgICAgICAgIHNjcmVlblk6ICRldmVudC5zY3JlZW5ZLFxuICAgICAgICAgICAgICAgIHRhcmdldDogJGV2ZW50LnRhcmdldFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICRzY29wZS4kZWxlbWVudC50cmlnZ2VySGFuZGxlcihvcGVuQ29udGV4dE1lbnVFdmVudCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtTW91c2VEb3duID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnRleHRtZW51U2VydmljZS5jbG9zZSgpO1xuICAgIH07XG5cbiAgICBvbkNvbXBvbmVudENvbnRleHRtZW51ID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgJGV2ZW50KSB7XG5cbiAgICAgICAgJHNjb3BlLmNvbnRleHRNZW51RGF0YSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ3JlcG9zaXRpb24nLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncm90YXRlQ1cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSb3RhdGUgQ1cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcm90YXRlLXJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9wZXJhdGlvbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbiA9IG9wZXJhdGlvbnNNYW5hZ2VyLmluaXROZXcoJ3JvdGF0ZUNvbXBvbmVudHMnLCBjb21wb25lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5zZXQoOTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5jb21taXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdyb3RhdGVDQ1cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSb3RhdGUgQ0NXJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXJvdGF0ZS1sZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9wZXJhdGlvbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSb3RhdGluZyBhbnRpLWNsb2Nrd2lzZScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uID0gb3BlcmF0aW9uc01hbmFnZXIuaW5pdE5ldygncm90YXRlQ29tcG9uZW50cycsIGNvbXBvbmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uLnNldCgtOTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5jb21taXQoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgIG9wZW5NZW51KCRldmVudCk7XG5cbiAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgfTtcblxuICAgIG9uUG9ydENvbnRleHRtZW51ID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KSB7XG5cbiAgICAgICAgJHNjb3BlLmNvbnRleHRNZW51RGF0YSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ3Byb3BlcnRpZXMnLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnaW5mbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0luZm8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUG9ydCBpbmZvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge31cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuICAgICAgICBvcGVuTWVudSgkZXZlbnQpO1xuXG4gICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtQ29udGV4dG1lbnUgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cbiAgICAgICAgJHNjb3BlLmNvbnRleHRNZW51RGF0YSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2Fib3V0JyxcbiAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2dldFN0YXRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU3RhdGlzdGljcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGx1cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU3RhdGlzdGljcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHt9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgb3Blbk1lbnUoJGV2ZW50KTtcblxuICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB9O1xuXG4gICAgdGhpcy5vbkRpYWdyYW1Db250ZXh0bWVudSA9IG9uRGlhZ3JhbUNvbnRleHRtZW51O1xuICAgIHRoaXMub25Db21wb25lbnRDb250ZXh0bWVudSA9IG9uQ29tcG9uZW50Q29udGV4dG1lbnU7XG4gICAgdGhpcy5vblBvcnRDb250ZXh0bWVudSA9IG9uUG9ydENvbnRleHRtZW51O1xuICAgIHRoaXMub25EaWFncmFtTW91c2VEb3duID0gb25EaWFncmFtTW91c2VEb3duO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbn07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgJCovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbnJlcXVpcmUoJy4uL2NvbXBvbmVudFdpcmUvY29tcG9uZW50V2lyZS5qcycpO1xuXG5hbmd1bGFyLm1vZHVsZSgnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ZnRGlhZ3JhbScsIFtcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZ3JpZFNlcnZpY2UnLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ub3BlcmF0aW9uc01hbmFnZXInLFxuICAgICdpc2lzLnVpLmNvbnRleHRtZW51J1xuXSlcbiAgICAuY29udHJvbGxlcignU1ZHRGlhZ3JhbUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoXG4gICAgICAgICRzY29wZSwgJGxvZywgZGlhZ3JhbVNlcnZpY2UsIHdpcmluZ1NlcnZpY2UsIGdyaWRTZXJ2aWNlLCAkd2luZG93LCAkdGltZW91dCwgY29udGV4dG1lbnVTZXJ2aWNlLCBvcGVyYXRpb25zTWFuYWdlcikge1xuXG4gICAgICAgIHZhclxuXG4gICAgICAgICAgICBDb21wb25lbnRTZWxlY3Rpb25IYW5kbGVyID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NvbXBvbmVudFNlbGVjdGlvbkhhbmRsZXInKSxcbiAgICAgICAgICAgIGNvbXBvbmVudFNlbGVjdGlvbkhhbmRsZXIsXG5cbiAgICAgICAgICAgIENvbXBvbmVudERyYWdIYW5kbGVyID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NvbXBvbmVudERyYWdIYW5kbGVyJyksXG4gICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlcixcblxuICAgICAgICAgICAgV2lyZURyYXdIYW5kbGVyID0gcmVxdWlyZSgnLi9jbGFzc2VzL1dpcmVEcmF3SGFuZGxlcicpLFxuICAgICAgICAgICAgd2lyZURyYXdIYW5kbGVyLFxuXG4gICAgICAgICAgICBDb250ZXh0TWVudUhhbmRsZXIgPSByZXF1aXJlKCcuL2NsYXNzZXMvY29udGV4dE1lbnVIYW5kbGVyJyksXG4gICAgICAgICAgICBjb250ZXh0TWVudUhhbmRsZXIsXG5cbiAgICAgICAgICAgIGNvbXBvbmVudEVsZW1lbnRzLFxuXG4gICAgICAgICAgICAkJHdpbmRvdztcblxuICAgICAgICAkJHdpbmRvdyA9ICQoJHdpbmRvdyk7XG5cbiAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIgPSBuZXcgQ29tcG9uZW50RHJhZ0hhbmRsZXIoXG4gICAgICAgICAgICAkc2NvcGUsXG4gICAgICAgICAgICBkaWFncmFtU2VydmljZSxcbiAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UsXG4gICAgICAgICAgICBvcGVyYXRpb25zTWFuYWdlcixcbiAgICAgICAgICAgICRsb2dcbiAgICAgICAgKTtcblxuICAgICAgICBjb21wb25lbnRTZWxlY3Rpb25IYW5kbGVyID0gbmV3IENvbXBvbmVudFNlbGVjdGlvbkhhbmRsZXIoXG4gICAgICAgICAgICAkc2NvcGUsXG4gICAgICAgICAgICBkaWFncmFtU2VydmljZSxcbiAgICAgICAgICAgIGdyaWRTZXJ2aWNlLFxuICAgICAgICAgICAgJGxvZ1xuICAgICAgICApO1xuXG4gICAgICAgIHdpcmVEcmF3SGFuZGxlciA9IG5ldyBXaXJlRHJhd0hhbmRsZXIoXG4gICAgICAgICAgICAkc2NvcGUsXG4gICAgICAgICAgICBkaWFncmFtU2VydmljZSxcbiAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UsXG4gICAgICAgICAgICBncmlkU2VydmljZSxcbiAgICAgICAgICAgICRsb2dcbiAgICAgICAgKTtcblxuICAgICAgICBjb250ZXh0TWVudUhhbmRsZXIgPSBuZXcgQ29udGV4dE1lbnVIYW5kbGVyKFxuICAgICAgICAgICAgJHNjb3BlLFxuICAgICAgICAgICAgZGlhZ3JhbVNlcnZpY2UsXG4gICAgICAgICAgICAkdGltZW91dCxcbiAgICAgICAgICAgIGNvbnRleHRtZW51U2VydmljZSxcbiAgICAgICAgICAgIG9wZXJhdGlvbnNNYW5hZ2VyLFxuICAgICAgICAgICAgJGxvZ1xuICAgICAgICApO1xuXG4gICAgICAgICRzY29wZS5vbkRpYWdyYW1Nb3VzZURvd24gPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cblxuXG4gICAgICAgICAgICBpZiAoJGV2ZW50LndoaWNoID09PSAzKSB7XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0TWVudUhhbmRsZXIub25EaWFncmFtQ29udGV4dG1lbnUoJGV2ZW50KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGNvbnRleHRNZW51SGFuZGxlci5vbkRpYWdyYW1Nb3VzZURvd24oJGV2ZW50KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cblxuICAgICAgICAkc2NvcGUub25EaWFncmFtTW91c2VVcCA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25EaWFncmFtTW91c2VVcCgkZXZlbnQpO1xuICAgICAgICAgICAgd2lyZURyYXdIYW5kbGVyLm9uRGlhZ3JhbU1vdXNlVXAoJGV2ZW50KTtcblxuICAgICAgICB9O1xuXG5cbiAgICAgICAgJHNjb3BlLm9uRGlhZ3JhbUNsaWNrID0gZnVuY3Rpb24gKC8qJGV2ZW50Ki8pIHtcblxuXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9uRGlhZ3JhbU1vdXNlTW92ZSA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25EaWFncmFtTW91c2VNb3ZlKCRldmVudCk7XG4gICAgICAgICAgICB3aXJlRHJhd0hhbmRsZXIub25EaWFncmFtTW91c2VNb3ZlKCRldmVudCk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZ2V0Q3NzQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAnJztcblxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudERyYWdIYW5kbGVyLmRyYWdnaW5nKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9ICdkcmFnZ2luZyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub25EaWFncmFtTW91c2VMZWF2ZSA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25EaWFncmFtTW91c2VMZWF2ZSgkZXZlbnQpO1xuICAgICAgICAgICAgd2lyZURyYXdIYW5kbGVyLm9uRGlhZ3JhbU1vdXNlTGVhdmUoJGV2ZW50KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgICQkd2luZG93LmJsdXIoZnVuY3Rpb24gKCRldmVudCkge1xuXG4gICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlci5vbldpbmRvd0JsdXIoJGV2ZW50KTtcbiAgICAgICAgICAgIHdpcmVEcmF3SGFuZGxlci5vbldpbmRvd0JsdXIoJGV2ZW50KTtcblxuICAgICAgICB9KTtcblxuXG4gICAgICAgIC8vIEludGVyYWN0aW9ucyB3aXRoIGNvbXBvbmVudHNcblxuICAgICAgICB0aGlzLm9uQ29tcG9uZW50TW91c2VVcCA9IGZ1bmN0aW9uIChjb21wb25lbnQsICRldmVudCkge1xuXG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudERyYWdIYW5kbGVyLmRyYWdnaW5nKSB7XG5cbiAgICAgICAgICAgICAgICBjb21wb25lbnRTZWxlY3Rpb25IYW5kbGVyLm9uQ29tcG9uZW50TW91c2VVcChjb21wb25lbnQsICRldmVudCk7XG4gICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25Db21wb25lbnRNb3VzZVVwKGNvbXBvbmVudCwgJGV2ZW50KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlci5vbkNvbXBvbmVudE1vdXNlVXAoY29tcG9uZW50LCAkZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25Qb3J0TW91c2VEb3duID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGlmICggIXdpcmVEcmF3SGFuZGxlci53aXJpbmcgJiYgJGV2ZW50LndoaWNoID09PSAzICkge1xuXG4gICAgICAgICAgICAgICAgY29udGV4dE1lbnVIYW5kbGVyLm9uUG9ydENvbnRleHRtZW51KGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aXJlRHJhd0hhbmRsZXIub25Qb3J0TW91c2VEb3duKGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25Qb3J0TW91c2VVcCA9IGZ1bmN0aW9uIChjb21wb25lbnQsIHBvcnQsICRldmVudCkge1xuXG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uUG9ydENsaWNrID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KSB7XG5cbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25Db21wb25lbnRNb3VzZURvd24gPSBmdW5jdGlvbiAoY29tcG9uZW50LCAkZXZlbnQpIHtcblxuICAgICAgICAgICAgaWYgKCRldmVudC53aGljaCA9PT0gMykge1xuXG4gICAgICAgICAgICAgICAgY29udGV4dE1lbnVIYW5kbGVyLm9uQ29tcG9uZW50Q29udGV4dG1lbnUoY29tcG9uZW50LCAkZXZlbnQpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25Db21wb25lbnRNb3VzZURvd24oY29tcG9uZW50LCAkZXZlbnQpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pc0VkaXRhYmxlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb25maWcgPSAkc2NvcGUuZGlhZ3JhbS5jb25maWcgfHwge307XG5cbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuZGlhZ3JhbS5jb25maWcuZWRpdGFibGUgPT09IHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kaXNhbGxvd1NlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW0uY29uZmlnLmRpc2FsbG93U2VsZWN0aW9uID09PSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJDb21wb25lbnRFbGVtZW50ID0gZnVuY3Rpb24gKGlkLCBlbCkge1xuXG4gICAgICAgICAgICBjb21wb25lbnRFbGVtZW50cyA9IGNvbXBvbmVudEVsZW1lbnRzIHx8IHt9O1xuXG4gICAgICAgICAgICBjb21wb25lbnRFbGVtZW50c1tpZF0gPSBlbDtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudW5yZWdpc3RlckNvbXBvbmVudEVsZW1lbnQgPSBmdW5jdGlvbiAoaWQpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50RWxlbWVudHMgPSBjb21wb25lbnRFbGVtZW50cyB8fCB7fTtcblxuICAgICAgICAgICAgZGVsZXRlIGNvbXBvbmVudEVsZW1lbnRzW2lkXTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIG9wZXJhdGlvbnNNYW5hZ2VyLnJlZ2lzdGVyT3BlcmF0aW9uKHtcbiAgICAgICAgICAgIGlkOiAncm90YXRlQ29tcG9uZW50cycsXG4gICAgICAgICAgICBvcGVyYXRpb25DbGFzczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmluaXQgPSBmdW5jdGlvbihjb21wb25lbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQgPSBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlID0gYW5nbGU7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY29tbWl0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudHNUb1JvdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWZmZWN0ZWRXaXJlcztcblxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9Sb3RhdGUgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUgPSB0aGlzLmFuZ2xlO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHNUb1JvdGF0ZS5wdXNoKCB0aGlzLmNvbXBvbmVudCApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZiggdGhpcy5jb21wb25lbnQuaWQgKSA+IC0xICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLCBmdW5jdGlvbiAoIHNlbGVjdGVkQ29tcG9uZW50SWQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWRDb21wb25lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNvbXBvbmVudC5pZCAhPT0gc2VsZWN0ZWRDb21wb25lbnRJZCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENvbXBvbmVudCA9ICRzY29wZS5kaWFncmFtLmNvbXBvbmVudHNCeUlkICAgWyBzZWxlY3RlZENvbXBvbmVudElkIF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c1RvUm90YXRlLnB1c2goIHNlbGVjdGVkQ29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGFmZmVjdGVkV2lyZXMgPSAkc2NvcGUuZGlhZ3JhbS5nZXRXaXJlc0ZvckNvbXBvbmVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9Sb3RhdGVcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goY29tcG9uZW50c1RvUm90YXRlLCBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5yb3RhdGUoYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggYWZmZWN0ZWRXaXJlcywgZnVuY3Rpb24gKCB3aXJlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5hZGp1c3RXaXJlRW5kU2VnbWVudHMoIHdpcmUgKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9KVxuICAgIC5kaXJlY3RpdmUoJ3N2Z0RpYWdyYW0nLCBbXG4gICAgICAgICckcm9vdFNjb3BlJyxcbiAgICAgICAgJyRsb2cnLFxuICAgICAgICAnZGlhZ3JhbVNlcnZpY2UnLFxuICAgICAgICAnZ3JpZFNlcnZpY2UnLFxuICAgICAgICBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvZywgZGlhZ3JhbVNlcnZpY2UsIGdyaWRTZXJ2aWNlKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NWR0RpYWdyYW1Db250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICByZXF1aXJlOiAnXmRpYWdyYW1Db250YWluZXInLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9zdmdEaWFncmFtLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcywgZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbGxDb250ZXh0TWVudTtcblxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAga2lsbENvbnRleHRNZW51ID0gZnVuY3Rpb24oJGV2ZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ2tpbGxpbmcgZGVmYXVsdCBjb250ZXh0bWVudScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnZGlhZ3JhbScsIGZ1bmN0aW9uKG5ld0RpYWdyYW1WYWx1ZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGlhZ3JhbVZhbHVlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaWFncmFtID0gc2NvcGUuZGlhZ3JhbSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kZWxlbWVudCA9ICRlbGVtZW50O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQub3V0ZXJXaWR0aChzY29wZS5kaWFncmFtLmNvbmZpZy53aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQub3V0ZXJIZWlnaHQoc2NvcGUuZGlhZ3JhbS5jb25maWcud2lkdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuaWQgPSBpZCA9IG5ld0RpYWdyYW1WYWx1ZS5pZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLnNldEluaXRpYWxpemVkKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignR3JpZEluaXRpYWxpemVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5zZXRJbml0aWFsaXplZCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudmlzaWJsZU9iamVjdHMgPSBncmlkU2VydmljZS5jcmVhdGVHcmlkKGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaWFncmFtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuZ2V0VmlzaWJsZUFyZWEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHZpc2libGVBcmVhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5lbGVtZW50T2Zmc2V0ID0gc2NvcGUuJGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkU2VydmljZS5zZXRWaXNpYmxlQXJlYShpZCwgdmlzaWJsZUFyZWEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuYmluZCgnY29udGV4dG1lbnUnLCBraWxsQ29udGV4dE1lbnUpO1xuXG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5ib3gnLCBbXVxuKVxuICAgIC5jb250cm9sbGVyKCAnQm94Q29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlICkge1xuXG4gICAgICAgICRzY29wZS5wb3J0V2lyZXMgPSBbXTtcblxuICAgICAgICBhbmd1bGFyLmZvckVhY2goICRzY29wZS5jb21wb25lbnQuc3ltYm9sLnBvcnRzLCBmdW5jdGlvbiAoIHBvcnQgKSB7XG5cbiAgICAgICAgICAgIHZhciB0b1ggPSAwLFxuICAgICAgICAgICAgICAgIHRvWSA9IDAsXG4gICAgICAgICAgICAgICAgcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgd2lkdGgsIGhlaWdodDtcblxuICAgICAgICAgICAgcG9ydFdpcmVMZW5ndGggPSAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5wb3J0V2lyZUxlbmd0aDtcbiAgICAgICAgICAgIHdpZHRoID0gJHNjb3BlLmNvbXBvbmVudC5zeW1ib2wud2lkdGg7XG4gICAgICAgICAgICBoZWlnaHQgPSAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5oZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmICggcG9ydC54ID09PSAwICkge1xuICAgICAgICAgICAgICAgIHRvWCA9IHBvcnRXaXJlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRvWSA9IHBvcnQueTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBwb3J0LnkgPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgdG9ZID0gcG9ydFdpcmVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdG9YID0gcG9ydC54O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHBvcnQueCA9PT0gd2lkdGggKSB7XG4gICAgICAgICAgICAgICAgdG9YID0gd2lkdGggLSBwb3J0V2lyZUxlbmd0aDtcbiAgICAgICAgICAgICAgICB0b1kgPSBwb3J0Lnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggcG9ydC55ID09PSBoZWlnaHQgKSB7XG4gICAgICAgICAgICAgICAgdG9ZID0gaGVpZ2h0IC0gcG9ydFdpcmVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdG9YID0gcG9ydC54O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUucG9ydFdpcmVzLnB1c2goIHtcbiAgICAgICAgICAgICAgICB4MTogcG9ydC54LFxuICAgICAgICAgICAgICAgIHkxOiBwb3J0LnksXG4gICAgICAgICAgICAgICAgeDI6IHRvWCxcbiAgICAgICAgICAgICAgICB5MjogdG9ZXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKTtcblxuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoXG4gICAgICAgICdib3gnLFxuXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzY29wZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdCb3hDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2JveC5odG1sJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuY2FwYWNpdG9yJywgW11cbilcbiAgICAuY29uZmlnKCBbICdzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICBmdW5jdGlvbiAoIHN5bWJvbE1hbmFnZXJQcm92aWRlciApIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCgge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXBhY2l0b3InLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tY2FwYWNpdG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ0MnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC04XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNjAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxNSxcbiAgICAgICAgICAgICAgICBwb3J0czogWyB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQycsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDJyxcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogNy41XG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0EnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0EnLFxuICAgICAgICAgICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgICAgICAgICAgeTogNy41XG4gICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICBdICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsICQqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoICcuLi8uLi9zZXJ2aWNlcy9zeW1ib2xTZXJ2aWNlcy9zeW1ib2xTZXJ2aWNlcy5qcycgKTtcbnJlcXVpcmUoICcuLi9wb3J0L3BvcnQuanMnICk7XG5cbnJlcXVpcmUoICcuL3Jlc2lzdG9yL3Jlc2lzdG9yLmpzJyApO1xucmVxdWlyZSggJy4vakZldFAvakZldFAuanMnICk7XG5yZXF1aXJlKCAnLi9vcEFtcC9vcEFtcC5qcycgKTtcbnJlcXVpcmUoICcuL2Rpb2RlL2Rpb2RlLmpzJyApO1xucmVxdWlyZSggJy4vY2FwYWNpdG9yL2NhcGFjaXRvci5qcycgKTtcbnJlcXVpcmUoICcuL2luZHVjdG9yL2luZHVjdG9yLmpzJyApO1xuXG5yZXF1aXJlKCAnLi9ib3gvYm94LmpzJyApO1xuXG52YXIgc3ltYm9sc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzJywgW1xuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9sU2VydmljZXMnLFxuXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5wb3J0JyxcblxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5yZXNpc3RvcicsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmpGZXRQJyxcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMub3BBbXAnLFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5kaW9kZScsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmNhcGFjaXRvcicsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmluZHVjdG9yJyxcblxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5ib3gnXG5cbiAgICBdICk7XG5cbnN5bWJvbHNNb2R1bGUuY29udHJvbGxlcihcbiAgICAnU3ltYm9sQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlICkge1xuXG4gICAgICAgICRzY29wZS5nZXRTeW1ib2xUcmFuc2Zvcm0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1TdHJpbmc7XG5cbiAgICAgICAgICAgIC8vICAgIHRyYW5zZm9ybVN0cmluZyA9ICd0cmFuc2xhdGUoJyArICRzY29wZS5jb21wb25lbnQueCArICcsJyArICRzY29wZS5jb21wb25lbnQueSArICcpICc7XG4gICAgICAgICAgICAvLyAgICB0cmFuc2Zvcm1TdHJpbmcgKz1cbiAgICAgICAgICAgIC8vICAgICAgJ3JvdGF0ZSgnICsgJHNjb3BlLmNvbXBvbmVudC5yb3RhdGlvbiArICcgJyArICRzY29wZS5jb21wb25lbnQuc3ltYm9sLndpZHRoLzIgKyAnICcgKyAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5oZWlnaHQvMiAgKyAnKSAnO1xuICAgICAgICAgICAgLy8gICAgLy90cmFuc2Zvcm1TdHJpbmcgKz0gJ3NjYWxlKCcgKyAkc2NvcGUuY29tcG9uZW50LnNjYWxlWCArICcsJyArICRzY29wZS5jb21wb25lbnQuc2NhbGVZICsgJykgJztcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAgICBjb25zb2xlLmxvZygkc2NvcGUuY29tcG9uZW50LmdldFRyYW5zZm9ybWF0aW9uTWF0cml4KCkuam9pbignLCAnKSk7XG5cbiAgICAgICAgICAgIHRyYW5zZm9ybVN0cmluZyA9ICdtYXRyaXgoJyArICRzY29wZS5jb21wb25lbnQuZ2V0U1ZHVHJhbnNmb3JtYXRpb25TdHJpbmcoKSArICcpJztcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVN0cmluZztcbiAgICAgICAgfTtcblxuICAgIH0gKTtcblxuc3ltYm9sc01vZHVsZS5kaXJlY3RpdmUoXG4gICAgJ2NvbXBvbmVudFN5bWJvbCcsXG5cbiAgICBmdW5jdGlvbiAoICRjb21waWxlICkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJz0nLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICc9JyxcbiAgICAgICAgICAgICAgICBwYWdlOiAnPScsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2U6ICc9J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1N5bWJvbENvbnRyb2xsZXInLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9jb21wb25lbnRTeW1ib2wuaHRtbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRycsXG4gICAgICAgICAgICByZXF1aXJlOiBbICdec3ZnRGlhZ3JhbScsICdeZGlhZ3JhbUNvbnRhaW5lcicgXSxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICggc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGNvbnRyb2xsZXJzICkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlU3RyLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSxcblxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIsXG5cbiAgICAgICAgICAgICAgICAgICAgJGVsLFxuICAgICAgICAgICAgICAgICAgICBjb21waWxlZFN5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sQ29tcG9uZW50O1xuXG4gICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIgPSBjb250cm9sbGVyc1sgMCBdO1xuICAgICAgICAgICAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyID0gY29udHJvbGxlcnNbIDEgXTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLnBvcnRzVmlzaWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLmRldGFpbHNWaXNpYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuZ2V0Wm9vbUxldmVsKCkgPiAxO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzY29wZS5nZXRDc3NDbGFzcyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNjb3BlLmNvbXBvbmVudC5zeW1ib2wudHlwZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLmlzQ29tcG9uZW50U2VsZWN0ZWQoIHNjb3BlLmNvbXBvbmVudCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9ICcgc2VsZWN0ZWQnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBJbnRlcmFjdGlvbnNcblxuICAgICAgICAgICAgICAgIHNjb3BlLm9uTW91c2VVcCA9IGZ1bmN0aW9uICggJGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5vbkNvbXBvbmVudE1vdXNlVXAoIHNjb3BlLmNvbXBvbmVudCwgJGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLm9uTW91c2VEb3duID0gZnVuY3Rpb24gKCAkZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uQ29tcG9uZW50TW91c2VEb3duKCBzY29wZS5jb21wb25lbnQsICRldmVudCApO1xuICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHN5bWJvbENvbXBvbmVudCA9IHNjb3BlLmNvbXBvbmVudC5zeW1ib2wuc3ltYm9sQ29tcG9uZW50IHx8ICdnZW5lcmljLXN2Zyc7XG5cbiAgICAgICAgICAgICAgICBjb21waWxlZFN5bWJvbCA9IGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLmdldENvbXBpbGVkRGlyZWN0aXZlKCBzeW1ib2xDb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgIGlmICggIWFuZ3VsYXIuaXNGdW5jdGlvbiggY29tcGlsZWRTeW1ib2wgKSApIHtcblxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVN0ciA9ICc8JyArIHN5bWJvbENvbXBvbmVudCArICc+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC8nICsgc3ltYm9sQ29tcG9uZW50ICsgJz4nO1xuXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gYW5ndWxhci5lbGVtZW50KCB0ZW1wbGF0ZVN0ciApO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkU3ltYm9sID0gJGNvbXBpbGUoIHRlbXBsYXRlICk7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuc2V0Q29tcGlsZWREaXJlY3RpdmUoIHN5bWJvbENvbXBvbmVudCwgY29tcGlsZWRTeW1ib2wgKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICRlbCA9ICQoIGVsZW1lbnQgKTtcblxuICAgICAgICAgICAgICAgIGNvbXBpbGVkU3ltYm9sKCBzY29wZSwgZnVuY3Rpb24gKCBjbG9uZWRFbGVtZW50ICkge1xuICAgICAgICAgICAgICAgICAgICAkZWwuZmluZCggJy5zeW1ib2wtcGxhY2Vob2xkZXInIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlV2l0aCggY2xvbmVkRWxlbWVudCApO1xuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLnJlZ2lzdGVyQ29tcG9uZW50RWxlbWVudCggc2NvcGUuY29tcG9uZW50LmlkLCAkZWwgKTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbiggJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci51bnJlZ2lzdGVyQ29tcG9uZW50RWxlbWVudCggc2NvcGUuY29tcG9uZW50LmlkICk7XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuKTtcblxuc3ltYm9sc01vZHVsZS5kaXJlY3RpdmUoXG4gICAgJ2dlbmVyaWNTdmcnLFxuXG4gICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzY29wZTogZmFsc2UsXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZ2VuZXJpY1N2Zy5odG1sJyxcbiAgICAgICAgICAgIHRlbXBsYXRlTmFtZXNwYWNlOiAnU1ZHJ1xuICAgICAgICB9O1xuICAgIH1cbik7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuZGlvZGUnLCBbXVxuKVxuICAgIC5jb25maWcoIFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uICggc3ltYm9sTWFuYWdlclByb3ZpZGVyICkge1xuICAgICAgICAgICAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Rpb2RlJyxcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLWRpb2RlJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ0QnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC04XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNjAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxNSxcbiAgICAgICAgICAgICAgICBwb3J0czogWyB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQycsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQycsXG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQScsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBJyxcbiAgICAgICAgICAgICAgICAgICAgeDogNjAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDdcbiAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgIF0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuaW5kdWN0b3InLCBbXVxuKVxuICAgIC5jb25maWcoIFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uICggc3ltYm9sTWFuYWdlclByb3ZpZGVyICkge1xuICAgICAgICAgICAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2luZHVjdG9yJyxcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLWluZHVjdG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ0wnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC04XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxMCxcbiAgICAgICAgICAgICAgICBwb3J0czogWyB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAncDEnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAncDEnLFxuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiA2LjVcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAncDInLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ3AyJyxcbiAgICAgICAgICAgICAgICAgICAgeDogNTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDYuNVxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5qRmV0UCcsIFtdXG4pXG4gICAgLmNvbmZpZyggWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKCBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIgKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnakZldFAnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24takZldFAnLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnUScsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgICAgICAgICAgeTogMTJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA2MixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDcwLFxuICAgICAgICAgICAgICAgIHBvcnRzOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdzJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAyNzAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1MnLFxuICAgICAgICAgICAgICAgICAgICB4OiA0NyxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdkJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiA5MCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRCcsXG4gICAgICAgICAgICAgICAgICAgIHg6IDQ3LFxuICAgICAgICAgICAgICAgICAgICB5OiA3MFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdnJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0cnLFxuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAyNlxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5vcEFtcCcsIFtdXG4pXG4gICAgLmNvbmZpZyggWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKCBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIgKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnb3BBbXAnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tb3BBbXAnLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnQScsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiA5MCxcbiAgICAgICAgICAgICAgICAgICAgeTogMTVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICAgICAgcG9ydHM6IFsge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ1ZzKycsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMjcwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWcysnLFxuICAgICAgICAgICAgICAgICAgICB4OiA2NSxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdWb3V0JyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWb3V0JyxcbiAgICAgICAgICAgICAgICAgICAgeDogMTQwLFxuICAgICAgICAgICAgICAgICAgICB5OiA1MFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdWcy0nLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDkwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWcy0nLFxuICAgICAgICAgICAgICAgICAgICB4OiA2NSxcbiAgICAgICAgICAgICAgICAgICAgeTogMTAwXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ1YtJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1YtJyxcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogNzVcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnVisnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVisnLFxuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAyNVxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5yZXNpc3RvcicsIFtdXG4pXG4gICAgLmNvbmZpZyggWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKCBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIgKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncmVzaXN0b3InLFxuICAgICAgICAgICAgICAgIHN5bWJvbENvbXBvbmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tcmVzaXN0b3InLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnUicsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLThcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA2MCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgICAgICAgIHBvcnRzOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDVcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAncDInLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ3AyJyxcbiAgICAgICAgICAgICAgICAgICAgeDogNjAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDVcbiAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgIF0gKTsiLG51bGwsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2xNYXRyaXggPSByZXF1aXJlKCAnZ2xNYXRyaXgnICk7XG5cbnZhciBDb21wb25lbnRQb3J0ID0gZnVuY3Rpb24gKCBkZXNjcmlwdG9yICkge1xuXG4gICAgYW5ndWxhci5leHRlbmQoIHRoaXMsIGRlc2NyaXB0b3IgKTtcblxufTtcblxuQ29tcG9uZW50UG9ydC5wcm90b3R5cGUuZ2V0R3JpZFBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHBvc2l0aW9uLFxuICAgICAgICBwb3NpdGlvblZlY3RvcjtcblxuICAgIGlmICggYW5ndWxhci5pc09iamVjdCggdGhpcy5wb3J0U3ltYm9sICkgJiYgYW5ndWxhci5pc09iamVjdCggdGhpcy5wYXJlbnRDb21wb25lbnQgKSApIHtcblxuICAgICAgICBwb3NpdGlvblZlY3RvciA9IGdsTWF0cml4LnZlYzIuY3JlYXRlKCk7XG4gICAgICAgIGdsTWF0cml4LnZlYzIuc2V0KCBwb3NpdGlvblZlY3RvciwgdGhpcy5wb3J0U3ltYm9sLngsIHRoaXMucG9ydFN5bWJvbC55ICk7XG5cbiAgICAgICAgZ2xNYXRyaXgudmVjMi50cmFuc2Zvcm1NYXQzKCBwb3NpdGlvblZlY3RvciwgcG9zaXRpb25WZWN0b3IsIHRoaXMucGFyZW50Q29tcG9uZW50LmdldFRyYW5zZm9ybWF0aW9uTWF0cml4KCkgKTtcblxuICAgICAgICBwb3NpdGlvbiA9IHtcblxuICAgICAgICAgICAgeDogcG9zaXRpb25WZWN0b3JbIDAgXSxcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uVmVjdG9yWyAxIF1cblxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9uO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudFBvcnQ7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBEaWFncmFtID0gZnVuY3Rpb24gKGRlc2NyaXB0b3IpIHtcblxuICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIGRlc2NyaXB0b3IpO1xuXG4gICAgdGhpcy5jb21wb25lbnRzID0gW107XG4gICAgdGhpcy5jb21wb25lbnRzQnlJZCA9IHt9O1xuICAgIHRoaXMud2lyZXMgPSBbXTtcbiAgICB0aGlzLndpcmVzQnlJZCA9IHt9O1xuICAgIHRoaXMud2lyZXNCeUNvbXBvbmVudElkID0ge307XG5cbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXG4gICAgICAgIGRpc2FsbG93U2VsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgd2lkdGg6IDUwMDAsXG4gICAgICAgIGhlaWdodDogNTAwMFxuICAgIH07XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBzZWxlY3RlZENvbXBvbmVudElkczogW11cbiAgICB9O1xuXG59O1xuXG5EaWFncmFtLnByb3RvdHlwZS5hZGRDb21wb25lbnQgPSBmdW5jdGlvbiAoYURpYWdyYW1Db21wb25lbnQpIHtcblxuICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGFEaWFncmFtQ29tcG9uZW50KSAmJiAhYW5ndWxhci5pc0RlZmluZWQodGhpcy5jb21wb25lbnRzQnlJZFthRGlhZ3JhbUNvbXBvbmVudC5pZF0pKSB7XG5cbiAgICAgICAgdGhpcy5jb21wb25lbnRzQnlJZFthRGlhZ3JhbUNvbXBvbmVudC5pZF0gPSBhRGlhZ3JhbUNvbXBvbmVudDtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goYURpYWdyYW1Db21wb25lbnQpO1xuXG4gICAgfVxuXG59O1xuXG5EaWFncmFtLnByb3RvdHlwZS5hZGRXaXJlID0gZnVuY3Rpb24gKGFXaXJlKSB7XG5cbiAgICB2YXIgc2VsZj10aGlzLFxuICAgICAgICByZWdpc3RlcldpcmVGb3JFbmRzO1xuXG4gICAgcmVnaXN0ZXJXaXJlRm9yRW5kcyA9IGZ1bmN0aW9uICh3aXJlKSB7XG5cbiAgICAgICAgdmFyIGNvbXBvbmVudElkO1xuXG4gICAgICAgIGNvbXBvbmVudElkID0gd2lyZS5lbmQxLmNvbXBvbmVudC5pZDtcblxuICAgICAgICBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0gPSBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0gfHwgW107XG5cbiAgICAgICAgaWYgKHNlbGYud2lyZXNCeUNvbXBvbmVudElkW2NvbXBvbmVudElkXS5pbmRleE9mKHdpcmUpID09PSAtMSkge1xuICAgICAgICAgICAgc2VsZi53aXJlc0J5Q29tcG9uZW50SWRbY29tcG9uZW50SWRdLnB1c2god2lyZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb21wb25lbnRJZCA9IHdpcmUuZW5kMi5jb21wb25lbnQuaWQ7XG5cbiAgICAgICAgc2VsZi53aXJlc0J5Q29tcG9uZW50SWRbY29tcG9uZW50SWRdID0gc2VsZi53aXJlc0J5Q29tcG9uZW50SWRbY29tcG9uZW50SWRdIHx8IFtdO1xuXG4gICAgICAgIGlmIChzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0uaW5kZXhPZih3aXJlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHNlbGYud2lyZXNCeUNvbXBvbmVudElkW2NvbXBvbmVudElkXS5wdXNoKHdpcmUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG5cbiAgICBpZiAoYW5ndWxhci5pc09iamVjdChhV2lyZSkgJiYgIWFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMud2lyZXNCeUlkW2FXaXJlLmlkXSkpIHtcblxuICAgICAgICB0aGlzLndpcmVzQnlJZFthV2lyZS5pZF0gPSBhV2lyZTtcbiAgICAgICAgdGhpcy53aXJlcy5wdXNoKGFXaXJlKTtcblxuICAgICAgICByZWdpc3RlcldpcmVGb3JFbmRzKGFXaXJlKTtcblxuICAgIH1cblxufTtcblxuRGlhZ3JhbS5wcm90b3R5cGUuZ2V0V2lyZXNGb3JDb21wb25lbnRzID0gZnVuY3Rpb24gKGNvbXBvbmVudHMpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgc2V0T2ZXaXJlcyA9IFtdO1xuXG4gICAgYW5ndWxhci5mb3JFYWNoKGNvbXBvbmVudHMsIGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgICBhbmd1bGFyLmZvckVhY2goc2VsZi53aXJlc0J5Q29tcG9uZW50SWRbY29tcG9uZW50LmlkXSwgZnVuY3Rpb24gKHdpcmUpIHtcblxuICAgICAgICAgICAgaWYgKHNldE9mV2lyZXMuaW5kZXhPZih3aXJlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzZXRPZldpcmVzLnB1c2god2lyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2V0T2ZXaXJlcztcblxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdyYW07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGdsTWF0cml4ID0gcmVxdWlyZSggJ2dsTWF0cml4JyApO1xuXG52YXIgRGlhZ3JhbUNvbXBvbmVudCA9IGZ1bmN0aW9uICggZGVzY3JpcHRvciApIHtcblxuICAgIGlmICggIWFuZ3VsYXIuaXNPYmplY3QoIGRlc2NyaXB0b3Iuc3ltYm9sICkgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ05vIHN5bWJvbCBmb3VuZCBmb3IgY29tcG9uZW50ICcgKyB0aGlzLmlkICk7XG4gICAgfVxuXG4gICAgYW5ndWxhci5leHRlbmQoIHRoaXMsIGRlc2NyaXB0b3IgKTtcblxuICAgIC8vIEZvciByb3RhdGlvblxuICAgIHRoaXMuX2NlbnRlck9mZnNldCA9IFsgdGhpcy5zeW1ib2wud2lkdGggLyAyLCB0aGlzLnN5bWJvbC5oZWlnaHQgLyAyIF07XG5cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmlzSW5WaWV3UG9ydCA9IGZ1bmN0aW9uICggdmlld1BvcnQsIHBhZGRpbmcgKSB7XG5cbiAgICAvL1RPRE86IGNvdW50IHdpZHRoIGFuZCBoZWlnaHQgZm9yIG9yaWVudGF0aW9uXG4gICAgcGFkZGluZyA9IHBhZGRpbmcgfHwge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIGFuZ3VsYXIuaXNPYmplY3QoIHZpZXdQb3J0ICkgJiZcbiAgICAgICAgdGhpcy54ICsgdGhpcy5zeW1ib2wud2lkdGggPj0gKCB2aWV3UG9ydC5sZWZ0ICsgcGFkZGluZy54ICkgJiZcbiAgICAgICAgdGhpcy54IDw9ICggdmlld1BvcnQucmlnaHQgLSBwYWRkaW5nLnggKSAmJlxuICAgICAgICB0aGlzLnkgKyB0aGlzLnN5bWJvbC5oZWlnaHQgPj0gKCB2aWV3UG9ydC50b3AgKyBwYWRkaW5nLnkgKSAmJlxuICAgICAgICB0aGlzLnkgPD0gKCB2aWV3UG9ydC5ib3R0b20gLSBwYWRkaW5nLnkgKSApO1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtYXRpb25NYXRyaXggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoICFhbmd1bGFyLmlzQXJyYXkoIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggKSApIHtcbiAgICAgICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4O1xuXG59O1xuXG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmdldFNWR1RyYW5zZm9ybWF0aW9uTWF0cml4ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCAhYW5ndWxhci5pc0FycmF5KCB0aGlzLnN2Z1RyYW5zZm9ybWF0aW9uTWF0cml4ICkgKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdmdUcmFuc2Zvcm1hdGlvbk1hdHJpeDtcblxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0U1ZHVHJhbnNmb3JtYXRpb25TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgdHJhbnNNYXRyaXggPSB0aGlzLmdldFNWR1RyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG5cbiAgICByZXR1cm4gdHJhbnNNYXRyaXguam9pbiggJywgJyApO1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgcm90YXRpb25SYWQsXG4gICAgICAgIC8vc2luQSwgY29zQSxcbiAgICAgICAgdHJhbnNsYXRpb24sXG4gICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgIHJlc3VsdDtcblxuICAgIGlmICggYW5ndWxhci5pc051bWJlciggdGhpcy5yb3RhdGlvbiApICYmXG4gICAgICAgIGFuZ3VsYXIuaXNOdW1iZXIoIHRoaXMueCApLFxuICAgICAgICBhbmd1bGFyLmlzTnVtYmVyKCB0aGlzLnkgKSApIHtcblxuICAgICAgICByb3RhdGlvblJhZCA9IHRoaXMucm90YXRpb24gLyAxODAgKiBNYXRoLlBJO1xuXG4gICAgICAgIHRyYW5zZm9ybU1hdDMgPSBnbE1hdHJpeC5tYXQzLmNyZWF0ZSgpO1xuXG4gICAgICAgIHRyYW5zbGF0aW9uID0gZ2xNYXRyaXgudmVjMi5jcmVhdGUoKTtcblxuICAgICAgICBnbE1hdHJpeC52ZWMyLnNldCggdHJhbnNsYXRpb24sIHRoaXMueCArIHRoaXMuX2NlbnRlck9mZnNldFswXSwgdGhpcy55ICsgdGhpcy5fY2VudGVyT2Zmc2V0WzFdKTtcblxuICAgICAgICBnbE1hdHJpeC5tYXQzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzLFxuICAgICAgICAgICAgdHJhbnNsYXRpb25cbiAgICAgICAgKTtcblxuICAgICAgICBnbE1hdHJpeC5tYXQzLnJvdGF0ZShcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzLFxuICAgICAgICAgICAgcm90YXRpb25SYWRcbiAgICAgICAgKTtcblxuICAgICAgICBnbE1hdHJpeC52ZWMyLnNldCggdHJhbnNsYXRpb24sIC10aGlzLl9jZW50ZXJPZmZzZXRbMF0sIC10aGlzLl9jZW50ZXJPZmZzZXRbMV0pO1xuXG4gICAgICAgIGdsTWF0cml4Lm1hdDMudHJhbnNsYXRlKFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0MyxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICB0cmFuc2xhdGlvblxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggPSB0cmFuc2Zvcm1NYXQzO1xuXG4gICAgICAgIHRoaXMuc3ZnVHJhbnNmb3JtYXRpb25NYXRyaXggPSBbXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyAwIF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyAxIF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyAzIF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyA0IF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyA2IF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyA3IF1cbiAgICAgICAgXTtcblxuICAgICAgICByZXN1bHQgPSB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4O1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcblxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueVxuICAgIH07XG5cbn07XG5cblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoIHgsIHkgKSB7XG5cbiAgICBpZiAoIGFuZ3VsYXIuaXNOdW1iZXIoIHggKSAmJiBhbmd1bGFyLmlzTnVtYmVyKCB5ICkgKSB7XG5cbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcblxuICAgICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdDb29yZGluYXRlcyBtdXN0IGJlIG51bWJlcnMhJyApO1xuICAgIH1cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uICggYW5nbGUgKSB7XG5cbiAgICBpZiAoIGFuZ3VsYXIuaXNOdW1iZXIoIGFuZ2xlICkgKSB7XG5cbiAgICAgICAgdGhpcy5yb3RhdGlvbiArPSBhbmdsZTtcblxuICAgICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdBbmdsZSBtdXN0IGJlIG51bWJlciEnICk7XG4gICAgfVxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUucmVnaXN0ZXJQb3J0SW5zdGFuY2VzID0gZnVuY3Rpb24gKCBuZXdQb3J0cyApIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMucG9ydEluc3RhbmNlcyA9IHRoaXMucG9ydEluc3RhbmNlcyB8fCBbXTtcblxuICAgIGFuZ3VsYXIuZm9yRWFjaCggbmV3UG9ydHMsIGZ1bmN0aW9uICggbmV3UG9ydCApIHtcblxuICAgICAgICBuZXdQb3J0LnBhcmVudENvbXBvbmVudCA9IHNlbGY7XG4gICAgICAgIHNlbGYucG9ydEluc3RhbmNlcy5wdXNoKCBuZXdQb3J0ICk7XG5cbiAgICB9ICk7XG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1lZERpbWVuc2lvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gIHZhciB3aWR0aCwgaGVpZ2h0O1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUubG9jYWxUb0dsb2JhbCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICggIXRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggPSB0aGlzLmdldFRyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG4gICAgfVxuXG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaWFncmFtQ29tcG9uZW50OyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN5bWJvbE1hbmFnZXIsIGRpYWdyYW1TZXJ2aWNlLCB3aXJpbmdTZXJ2aWNlKSB7XG5cbiAgICB2YXIgZ2V0RGlhZ3JhbTtcblxuICAgIGdldERpYWdyYW0gPSBmdW5jdGlvbiAoY291bnRPZkJveGVzLCBjb3VudE9mV2lyZXMsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIHN5bWJvbFR5cGVzKSB7XG5cbiAgICAgICAgdmFyIGksIGlkLFxuICAgICAgICAgICAgY291bnRPZlR5cGVzLFxuICAgICAgICAgICAgc3ltYm9sLFxuICAgICAgICAgICAgdHlwZUlkLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHgsXG4gICAgICAgICAgICB5LFxuICAgICAgICAgICAgc3ltYm9sVHlwZUlkcyxcbiAgICAgICAgICAgIGNvbXBvbmVudDEsXG4gICAgICAgICAgICBjb21wb25lbnQyLFxuICAgICAgICAgICAgcG9ydDEsXG4gICAgICAgICAgICBwb3J0MixcbiAgICAgICAgICAgIGNyZWF0ZWRQb3J0cyxcbiAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQsXG5cbiAgICAgICAgICAgIHBvcnRDcmVhdG9yLFxuXG4gICAgICAgICAgICBkaWFncmFtLFxuICAgICAgICAgICAgd2lyZSxcblxuICAgICAgICAgICAgRGlhZ3JhbSxcbiAgICAgICAgICAgIERpYWdyYW1Db21wb25lbnQsXG4gICAgICAgICAgICBDb21wb25lbnRQb3J0LFxuICAgICAgICAgICAgV2lyZTtcblxuICAgICAgICBEaWFncmFtID0gcmVxdWlyZSgnLi9EaWFncmFtJyk7XG4gICAgICAgIERpYWdyYW1Db21wb25lbnQgPSByZXF1aXJlKCcuL0RpYWdyYW1Db21wb25lbnQuanMnKTtcbiAgICAgICAgQ29tcG9uZW50UG9ydCA9IHJlcXVpcmUoJy4vQ29tcG9uZW50UG9ydCcpO1xuICAgICAgICBXaXJlID0gcmVxdWlyZSgnLi9XaXJlLmpzJyk7XG5cbiAgICAgICAgZGlhZ3JhbSA9IG5ldyBEaWFncmFtKCk7XG5cbiAgICAgICAgcG9ydENyZWF0b3IgPSBmdW5jdGlvbiAoY29tcG9uZW50SWQsIHBvcnRzKSB7XG5cbiAgICAgICAgICAgIHZhciBwb3J0SW5zdGFuY2UsXG4gICAgICAgICAgICAgICAgcG9ydEluc3RhbmNlcyxcbiAgICAgICAgICAgICAgICBwb3J0TWFwcGluZztcblxuICAgICAgICAgICAgcG9ydEluc3RhbmNlcyA9IFtdO1xuICAgICAgICAgICAgcG9ydE1hcHBpbmcgPSB7fTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHBvcnRzLCBmdW5jdGlvbiAocG9ydCkge1xuXG4gICAgICAgICAgICAgICAgcG9ydEluc3RhbmNlID0gbmV3IENvbXBvbmVudFBvcnQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQgKyAnXycgKyBwb3J0LmlkLFxuICAgICAgICAgICAgICAgICAgICBwb3J0U3ltYm9sOiBwb3J0XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzLnB1c2gocG9ydEluc3RhbmNlKTtcblxuICAgICAgICAgICAgICAgIHBvcnRNYXBwaW5nWyBwb3J0LmlkIF0gPSBwb3J0SW5zdGFuY2UuaWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzOiBwb3J0SW5zdGFuY2VzLFxuICAgICAgICAgICAgICAgIHBvcnRNYXBwaW5nOiBwb3J0TWFwcGluZ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHN5bWJvbFR5cGVJZHMgPSBPYmplY3Qua2V5cyhzeW1ib2xUeXBlcyk7XG5cbiAgICAgICAgY291bnRPZlR5cGVzID0gc3ltYm9sVHlwZUlkcy5sZW5ndGg7XG5cbiAgICAgICAgZGlhZ3JhbS5jb25maWcud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgICAgICAgZGlhZ3JhbS5jb25maWcuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudE9mQm94ZXM7IGkrKykge1xuXG4gICAgICAgICAgICB0eXBlSWQgPSBzeW1ib2xUeXBlSWRzWyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjb3VudE9mVHlwZXMpIF07XG4gICAgICAgICAgICB0eXBlID0gc3ltYm9sVHlwZXNbIHR5cGVJZCBdO1xuXG4gICAgICAgICAgICB4ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKCBjYW52YXNXaWR0aCAtIDEgKSk7XG4gICAgICAgICAgICB5ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKCBjYW52YXNIZWlnaHQgLSAxICkpO1xuXG4gICAgICAgICAgICBpZCA9ICdjb21wb25lbnRfJyArIHR5cGVJZCArICdfJyArIGk7XG5cbiAgICAgICAgICAgIHN5bWJvbCA9IHN5bWJvbE1hbmFnZXIuZ2V0U3ltYm9sKHR5cGVJZCk7XG5cbiAgICAgICAgICAgIGNyZWF0ZWRQb3J0cyA9IHBvcnRDcmVhdG9yKGlkLCBzeW1ib2wucG9ydHMpO1xuXG4gICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50ID0gbmV3IERpYWdyYW1Db21wb25lbnQoe1xuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICBsYWJlbDogdHlwZS5sYWJlbFByZWZpeCArIGksXG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgIHo6IGksXG4gICAgICAgICAgICAgICAgcm90YXRpb246IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQwKSAqIDkwLFxuICAgICAgICAgICAgICAgIHNjYWxlWDogMSwgLy9bMSwgLTFdW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSldLFxuICAgICAgICAgICAgICAgIHNjYWxlWTogMSwgLy9bMSwgLTFdW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSldLFxuICAgICAgICAgICAgICAgIHN5bWJvbDogc3ltYm9sLFxuICAgICAgICAgICAgICAgIG5vblNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGxvY2F0aW9uTG9ja2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50LnJlZ2lzdGVyUG9ydEluc3RhbmNlcyhjcmVhdGVkUG9ydHMucG9ydEluc3RhbmNlcyk7XG5cbiAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcblxuICAgICAgICAgICAgZGlhZ3JhbS5hZGRDb21wb25lbnQobmV3RGlhZ3JhbUNvbXBvbmVudCk7XG5cblxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvdW50T2ZXaXJlczsgaSsrKSB7XG5cbiAgICAgICAgICAgIGlkID0gJ3dpcmVfJyArIGk7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudDEgPSBkaWFncmFtLmNvbXBvbmVudHMuZ2V0UmFuZG9tRWxlbWVudCgpO1xuXG4gICAgICAgICAgICBwb3J0MSA9IGNvbXBvbmVudDEucG9ydEluc3RhbmNlcy5nZXRSYW5kb21FbGVtZW50KCk7XG4gICAgICAgICAgICBwb3J0MiA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgd2hpbGUgKCFhbmd1bGFyLmlzRGVmaW5lZChwb3J0MikgfHwgcG9ydDEgPT09IHBvcnQyKSB7XG5cbiAgICAgICAgICAgICAgICBjb21wb25lbnQyID0gZGlhZ3JhbS5jb21wb25lbnRzLmdldFJhbmRvbUVsZW1lbnQoKTtcbiAgICAgICAgICAgICAgICBwb3J0MiA9IGNvbXBvbmVudDIucG9ydEluc3RhbmNlcy5nZXRSYW5kb21FbGVtZW50KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpcmUgPSBuZXcgV2lyZSh7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGVuZDE6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQxLFxuICAgICAgICAgICAgICAgICAgICBwb3J0OiBwb3J0MVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZW5kMjoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudDIsXG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6IHBvcnQyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHdpcmluZ1NlcnZpY2Uucm91dGVXaXJlKHdpcmUsICdFbGJvd1JvdXRlcicpO1xuXG4gICAgICAgICAgICBkaWFncmFtLmFkZFdpcmUod2lyZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkaWFncmFtO1xuXG4gICAgfTtcblxuICAgIHRoaXMuZ2V0RGlhZ3JhbSA9IGdldERpYWdyYW07XG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3ltYm9sTWFuYWdlclByb3ZpZGVyKSB7XG5cbiAgICB2YXIgZ2VuZXJhdGVTeW1ib2xzO1xuXG4gICAgZ2VuZXJhdGVTeW1ib2xzID0gZnVuY3Rpb24gKGNvdW50KSB7XG5cbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgICBwb3J0Q291bnQsXG4gICAgICAgICAgICBzeW1ib2wsXG4gICAgICAgICAgICBtYWtlQVJhbmRvbVN5bWJvbCxcbiAgICAgICAgICAgIG1ha2VTb21lUG9ydHMsXG4gICAgICAgICAgICBtaW5Qb3J0cyA9IDYsXG4gICAgICAgICAgICBtYXhQb3J0cyA9IDMwLFxuICAgICAgICAgICAgcG9ydFdpcmVMZW5ndGggPSAyMCxcblxuICAgICAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGU7XG5cbiAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGUgPSBmdW5jdGlvbiAoc29tZVBvcnRzLCBzaWRlLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gMiAqIHBvcnRXaXJlTGVuZ3RoO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goc29tZVBvcnRzLCBmdW5jdGlvbiAoYVBvcnQpIHtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAoc2lkZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC54ID0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQueSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC53aXJlQW5nbGUgPSAtOTA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCArPSB3aWR0aCAvICggc29tZVBvcnRzLmxlbmd0aCArIDIgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQueCA9IHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQueSA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCArPSBoZWlnaHQgLyAoIHNvbWVQb3J0cy5sZW5ndGggKyAyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC54ID0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQueSA9IGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDkwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gd2lkdGggLyAoIHNvbWVQb3J0cy5sZW5ndGggKyAyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQueCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC55ID0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQud2lyZUFuZ2xlID0gMTgwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gaGVpZ2h0IC8gKCBzb21lUG9ydHMubGVuZ3RoICsgMiApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuXG4gICAgICAgIG1ha2VTb21lUG9ydHMgPSBmdW5jdGlvbiAoY291bnRPZlBvcnRzKSB7XG5cbiAgICAgICAgICAgIHZhciBwb3J0cyA9IFtdLFxuICAgICAgICAgICAgICAgIHBvcnQsXG4gICAgICAgICAgICAgICAgcGxhY2VtZW50LFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgdG9wID0gW10sXG4gICAgICAgICAgICAgICAgcmlnaHQgPSBbXSxcbiAgICAgICAgICAgICAgICBib3R0b20gPSBbXSxcbiAgICAgICAgICAgICAgICBsZWZ0ID0gW10sXG4gICAgICAgICAgICAgICAgd2lkdGgsIGhlaWdodCxcbiAgICAgICAgICAgICAgICBzaWRlcyA9IFt0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnRdLFxuICAgICAgICAgICAgICAgIHBvcnRTcGFjaW5nID0gMjAsXG4gICAgICAgICAgICAgICAgbWluV2lkdGggPSAxNDAsXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0ID0gODA7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudE9mUG9ydHM7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgcG9ydCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdwXycgKyBpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BvcnQtJyArIGksXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDMpO1xuXG4gICAgICAgICAgICAgICAgc2lkZXNbcGxhY2VtZW50XS5wdXNoKHBvcnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aWR0aCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgIHBvcnRTcGFjaW5nICogdG9wLmxlbmd0aCArIDQgKiBwb3J0V2lyZUxlbmd0aCxcbiAgICAgICAgICAgICAgICBwb3J0U3BhY2luZyAqIGJvdHRvbS5sZW5ndGggKyA0ICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgbWluV2lkdGhcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGhlaWdodCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgIHBvcnRTcGFjaW5nICogbGVmdC5sZW5ndGggKyA0ICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgcG9ydFNwYWNpbmcgKiByaWdodC5sZW5ndGggKyA0ICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBzcHJlYWRQb3J0c0Fsb25nU2lkZSh0b3AsICd0b3AnLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKHJpZ2h0LCAncmlnaHQnLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKGJvdHRvbSwgJ2JvdHRvbScsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGUobGVmdCwgJ2xlZnQnLCB3aWR0aCwgaGVpZ2h0KTtcblxuXG4gICAgICAgICAgICBwb3J0cyA9IHBvcnRzLmNvbmNhdCh0b3ApXG4gICAgICAgICAgICAgICAgLmNvbmNhdChyaWdodClcbiAgICAgICAgICAgICAgICAuY29uY2F0KGJvdHRvbSlcbiAgICAgICAgICAgICAgICAuY29uY2F0KGxlZnQpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBvcnRzOiBwb3J0cyxcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfTtcblxuICAgICAgICBtYWtlQVJhbmRvbVN5bWJvbCA9IGZ1bmN0aW9uIChpZFBvc3RmaXgsIGNvdW50T2ZQb3J0cykge1xuXG4gICAgICAgICAgICB2YXIgcG9ydHNBbmRTaXplcyA9IG1ha2VTb21lUG9ydHMoY291bnRPZlBvcnRzKTtcblxuICAgICAgICAgICAgcmV0dXJuICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3JhbmRvbV8nICsgaWRQb3N0Zml4LFxuICAgICAgICAgICAgICAgIHN5bWJvbENvbXBvbmVudDogJ2JveCcsXG4gICAgICAgICAgICAgICAgc3ZnRGVjb3JhdGlvbjogbnVsbCxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ1JORF8nICsgY291bnRPZlBvcnRzICsgJ18nICsgaWRQb3N0Zml4ICsgJyAnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogcG9ydFdpcmVMZW5ndGggKyAxMCxcbiAgICAgICAgICAgICAgICAgICAgeTogcG9ydFdpcmVMZW5ndGggKyAyMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9ydFdpcmVMZW5ndGg6IHBvcnRXaXJlTGVuZ3RoLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBwb3J0c0FuZFNpemVzLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogcG9ydHNBbmRTaXplcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzQW5kU2l6ZXMucG9ydHMsXG4gICAgICAgICAgICAgICAgYm94SGVpZ2h0OiBwb3J0c0FuZFNpemVzLmhlaWdodCAtIDIgKiBwb3J0V2lyZUxlbmd0aCxcbiAgICAgICAgICAgICAgICBib3hXaWR0aDogcG9ydHNBbmRTaXplcy53aWR0aCAtIDIgKiBwb3J0V2lyZUxlbmd0aFxuICAgICAgICAgICAgfTtcblxuXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcblxuICAgICAgICAgICAgcG9ydENvdW50ID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbWF4UG9ydHMpLFxuICAgICAgICAgICAgICAgIG1pblBvcnRzXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBzeW1ib2wgPSBtYWtlQVJhbmRvbVN5bWJvbChpLCBwb3J0Q291bnQpO1xuXG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woc3ltYm9sKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG5cblxuICAgIHRoaXMuZ2VuZXJhdGVTeW1ib2xzID0gZ2VuZXJhdGVTeW1ib2xzO1xuXG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBXaXJlID0gZnVuY3Rpb24gKCBkZXNjcmlwdG9yICkge1xuXG4gICAgYW5ndWxhci5leHRlbmQoIHRoaXMsIGRlc2NyaXB0b3IgKTtcblxuICAgIHRoaXMuc2VnbWVudHMgPSBbXTtcblxufTtcblxuV2lyZS5wcm90b3R5cGUuaXNJblZpZXdQb3J0ID0gZnVuY3Rpb24gKCB2aWV3UG9ydCwgcGFkZGluZyApIHtcblxuICAgIHZhciBqLFxuICAgICAgICBzaG91bGRCZVZpc2libGUsXG4gICAgICAgIHNlZ21lbnQ7XG5cbiAgICBwYWRkaW5nID0gcGFkZGluZyB8fCB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9O1xuXG4gICAgc2hvdWxkQmVWaXNpYmxlID0gZmFsc2U7XG5cbiAgICBpZiAoIHRoaXMucm91dGVyVHlwZSA9PT0gJ0VsYm93Um91dGVyJyApIHtcblxuICAgICAgICBpZiAoIGFuZ3VsYXIuaXNBcnJheSggdGhpcy5zZWdtZW50cyApICkge1xuXG4gICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IHRoaXMuc2VnbWVudHMubGVuZ3RoICYmICFzaG91bGRCZVZpc2libGU7IGorKyApIHtcblxuICAgICAgICAgICAgICAgIHNlZ21lbnQgPSB0aGlzLnNlZ21lbnRzWyBqIF07XG5cbiAgICAgICAgICAgICAgICBpZiAoIHNlZ21lbnQub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzZWdtZW50LngxID49ICggdmlld1BvcnQubGVmdCArIHBhZGRpbmcueCApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50LngxIDw9ICggdmlld1BvcnQucmlnaHQgLSBwYWRkaW5nLnggKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZEJlVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzZWdtZW50LnkxID49ICggdmlld1BvcnQudG9wICsgcGFkZGluZy55ICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQueTEgPD0gKCB2aWV3UG9ydC5ib3R0b20gLSBwYWRkaW5nLnkgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZEJlVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHNob3VsZEJlVmlzaWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNob3VsZEJlVmlzaWJsZTtcblxufTtcblxuV2lyZS5wcm90b3R5cGUuZ2V0RW5kUG9zaXRpb25zID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHBvcnQxUG9zaXRpb24sXG4gICAgICAgIHBvcnQyUG9zaXRpb247XG5cbiAgICBwb3J0MVBvc2l0aW9uID0gdGhpcy5lbmQxLnBvcnQuZ2V0R3JpZFBvc2l0aW9uKCk7XG4gICAgcG9ydDJQb3NpdGlvbiA9IHRoaXMuZW5kMi5wb3J0LmdldEdyaWRQb3NpdGlvbigpO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICBlbmQxOiBwb3J0MVBvc2l0aW9uLFxuICAgICAgICBlbmQyOiBwb3J0MlBvc2l0aW9uXG5cbiAgICB9O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdpcmU7IiwiLypnbG9iYWxzIGFuZ3VsYXIgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZGlhZ3JhbVNlcnZpY2UnLCBbXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbFNlcnZpY2VzJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ub3BlcmF0aW9uc01hbmFnZXInXG5dKVxuICAgIC5jb25maWcoWydzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICAnb3BlcmF0aW9uc01hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uIChzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpIHtcblxuICAgICAgICAgICAgdmFyIFJhbmRvbVN5bWJvbEdlbmVyYXRvcixcbiAgICAgICAgICAgICAgICByYW5kb21TeW1ib2xHZW5lcmF0b3I7XG5cblxuICAgICAgICAgICAgUmFuZG9tU3ltYm9sR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9jbGFzc2VzL1JhbmRvbVN5bWJvbEdlbmVyYXRvcicpO1xuICAgICAgICAgICAgcmFuZG9tU3ltYm9sR2VuZXJhdG9yID0gbmV3IFJhbmRvbVN5bWJvbEdlbmVyYXRvcihzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpO1xuXG4gICAgICAgICAgICByYW5kb21TeW1ib2xHZW5lcmF0b3IuZ2VuZXJhdGVTeW1ib2xzKDcpO1xuXG4gICAgICAgIH1cbiAgICBdKVxuICAgIC5zZXJ2aWNlKCdkaWFncmFtU2VydmljZScsIFtcbiAgICAgICAgJyRxJyxcbiAgICAgICAgJyR0aW1lb3V0JyxcbiAgICAgICAgJ3N5bWJvbE1hbmFnZXInLFxuICAgICAgICAnJHN0YXRlUGFyYW1zJyxcbiAgICAgICAgJ3dpcmluZ1NlcnZpY2UnLFxuICAgICAgICAnb3BlcmF0aW9uc01hbmFnZXInLFxuICAgICAgICBmdW5jdGlvbiAoJHEsICR0aW1lb3V0LCBzeW1ib2xNYW5hZ2VyLCAkc3RhdGVQYXJhbXMsIHdpcmluZ1NlcnZpY2UvKiwgb3BlcmF0aW9uc01hbmFnZXIqLykge1xuXG4gICAgICAgICAgICB2YXJcbiAgICAgICAgICAgICAgICBzZWxmID0gdGhpcyxcblxuICAgICAgICAgICAgICAgIGRpYWdyYW1zLFxuXG4gICAgICAgICAgICAgICAgc3ltYm9sVHlwZXMsXG5cbiAgICAgICAgICAgICAgICBEdW1teURpYWdyYW1HZW5lcmF0b3IsXG4gICAgICAgICAgICAgICAgZHVtbXlEaWFncmFtR2VuZXJhdG9yLFxuXG4gICAgICAgICAgICAgICAgRGlhZ3JhbUNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICBDb21wb25lbnRQb3J0LFxuICAgICAgICAgICAgICAgIFdpcmU7XG5cbiAgICAgICAgICAgIGRpYWdyYW1zID0ge307XG5cbiAgICAgICAgICAgIER1bW15RGlhZ3JhbUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9EdW1teURpYWdyYW1HZW5lcmF0b3IuanMnKTtcblxuICAgICAgICAgICAgRGlhZ3JhbUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9EaWFncmFtQ29tcG9uZW50LmpzJyk7XG4gICAgICAgICAgICBDb21wb25lbnRQb3J0ID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NvbXBvbmVudFBvcnQnKTtcbiAgICAgICAgICAgIFdpcmUgPSByZXF1aXJlKCcuL2NsYXNzZXMvV2lyZS5qcycpO1xuXG4gICAgICAgICAgICBkdW1teURpYWdyYW1HZW5lcmF0b3IgPSBuZXcgRHVtbXlEaWFncmFtR2VuZXJhdG9yKHN5bWJvbE1hbmFnZXIsIHNlbGYsIHdpcmluZ1NlcnZpY2UpO1xuXG4gICAgICAgICAgICBzeW1ib2xUeXBlcyA9IHN5bWJvbE1hbmFnZXIuZ2V0QXZhaWxhYmxlU3ltYm9scygpO1xuXG5cbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50ID0gZnVuY3Rpb24gKGRpYWdyYW1JZCwgYURpYWdyYW1Db21wb25lbnQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWFncmFtO1xuXG4gICAgICAgICAgICAgICAgZGlhZ3JhbSA9IGRpYWdyYW1zW2RpYWdyYW1JZF07XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChkaWFncmFtKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW0uYWRkQ29tcG9uZW50KGFEaWFncmFtQ29tcG9uZW50KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5hZGRXaXJlID0gZnVuY3Rpb24gKGRpYWdyYW1JZCwgYVdpcmUpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWFncmFtO1xuXG4gICAgICAgICAgICAgICAgZGlhZ3JhbSA9IGRpYWdyYW1zW2RpYWdyYW1JZF07XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChkaWFncmFtKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW0uYWRkV2lyZShhV2lyZSk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0V2lyZXNGb3JDb21wb25lbnRzID0gZnVuY3Rpb24gKGRpYWdyYW1JZCwgY29tcG9uZW50cykge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpYWdyYW07XG5cbiAgICAgICAgICAgICAgICBkaWFncmFtID0gZGlhZ3JhbXNbZGlhZ3JhbUlkXTtcblxuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGRpYWdyYW0pKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbS5nZXRXaXJlc0ZvckNvbXBvbmVudHMoY29tcG9uZW50cyk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RGlhZ3JhbSA9IGZ1bmN0aW9uIChkaWFncmFtSWQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWFncmFtO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRpYWdyYW1JZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW0gPSBkaWFncmFtc1tkaWFncmFtSWRdO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpYWdyYW07XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuYWRkRHVtbXlEaWFncmFtID0gZnVuY3Rpb24gKGRpYWdyYW1JZCwgY291bnRPZkJveGVzLCBjb3VudE9mV2lyZXMsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkdW1teURpYWdyYW07XG5cbiAgICAgICAgICAgICAgICBpZiAoZGlhZ3JhbUlkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZHVtbXlEaWFncmFtID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGR1bW15RGlhZ3JhbUdlbmVyYXRvci5nZXREaWFncmFtKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50T2ZCb3hlcywgY291bnRPZldpcmVzLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0LCBzeW1ib2xUeXBlc1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBkdW1teURpYWdyYW0uaWQgPSBkaWFncmFtSWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbXNbZGlhZ3JhbUlkXSA9IGR1bW15RGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBkdW1teURpYWdyYW07XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0SGlnaGVzdFogPSBmdW5jdGlvbiAoZGlhZ3JhbUlkKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICB6O1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpYWdyYW07XG5cbiAgICAgICAgICAgICAgICBkaWFncmFtID0gZGlhZ3JhbXNbZGlhZ3JhbUlkXTtcblxuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGRpYWdyYW0pKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGRpYWdyYW0uY29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBkaWFncmFtLmNvbXBvbmVudHNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4oY29tcG9uZW50LnopKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNOYU4oeikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeiA9IGNvbXBvbmVudC56O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHogPCBjb21wb25lbnQueikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeiA9IGNvbXBvbmVudC56O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc05hTih6KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeiA9IC0xO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gejtcblxuICAgICAgICAgICAgfTtcblxuLy8gICAgICAgICAgICBvcGVyYXRpb25zTWFuYWdlci5yZWdpc3Rlck9wZXJhdGlvbih7XG4vLyAgICAgICAgICAgICAgICBpZDogJ3NldENvbXBvbmVudFBvc2l0aW9uJyxcbi8vICAgICAgICAgICAgICAgIGNvbW1pdDogZnVuY3Rpb24gKGNvbXBvbmVudCwgeCwgeSkge1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChjb21wb25lbnQpKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zZXRQb3NpdGlvbih4LCB5KTtcbi8vICAgICAgICAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICAgICAgfVxuLy9cbi8vICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgLy90aGlzLmdlbmVyYXRlRHVtbXlEaWFncmFtKDEwMDAsIDIwMCwgNTAwMCwgNTAwMCk7XG4gICAgICAgICAgICAvL3RoaXMuZ2VuZXJhdGVEdW1teURpYWdyYW0oMTAwMCwgMjAwMCwgMTAwMDAsIDEwMDAwKTtcbiAgICAgICAgICAgIC8vdGhpcy5nZW5lcmF0ZUR1bW15RGlhZ3JhbSgxMCwgNSwgMTIwMCwgMTIwMCk7XG4gICAgICAgICAgICAvL3RoaXMuZ2VuZXJhdGVEdW1teURpYWdyYW0oIDEwMCwgNTAsIDMwMDAsIDMwMDAgKTtcblxuICAgICAgICB9XG4gICAgXSk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGdyaWRTZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5ncmlkU2VydmljZScsIFtdICk7XG5cbmdyaWRTZXJ2aWNlc01vZHVsZS5zZXJ2aWNlKCAnZ3JpZFNlcnZpY2UnLCBbICckbG9nJywgJyRyb290U2NvcGUnLCAnJHRpbWVvdXQnLFxuICAgIGZ1bmN0aW9uICggJGxvZywgJHJvb3RTY29wZSwgJHRpbWVvdXQgKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuXG4gICAgICAgICAgICBncmlkcyA9IHt9LFxuXG4gICAgICAgICAgICBudW1iZXJPZkNoYW5nZXNBbGxvd2VkSW5PbmVDeWNsZSA9IDEsXG4gICAgICAgICAgICByZWNhbGN1bGF0ZUN5Y2xlRGVsYXkgPSAxNSxcbiAgICAgICAgICAgIHZpZXdQb3J0UGFkZGluZyA9IHtcbiAgICAgICAgICAgICAgICB4OiAtNjAwLFxuICAgICAgICAgICAgICAgIHk6IC02MDBcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzLFxuICAgICAgICAgICAgX3JlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzLFxuICAgICAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlV2lyZXM7XG5cbiAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlV2lyZXMgPSBmdW5jdGlvbiAoIGdyaWQgKSB7XG5cbiAgICAgICAgICAgIHZhciBpbmRleCxcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgIHdpcmU7XG5cblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGdyaWQud2lyZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIHdpcmUgPSBncmlkLndpcmVzW2ldO1xuXG4gICAgICAgICAgICAgICAgaW5kZXggPSBncmlkLnZpc2libGVXaXJlcy5pbmRleE9mKHdpcmUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHdpcmUuaXNJblZpZXdQb3J0KGdyaWQudmlld1BvcnQsIHZpZXdQb3J0UGFkZGluZykpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnZpc2libGVXaXJlcy5wdXNoKHdpcmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnZpc2libGVXaXJlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8kbG9nLmRlYnVnKCAnTnVtYmVyIG9mIHZpc2libGUgd2lyZXM6ICcgKyBncmlkLnZpc2libGVXaXJlcy5sZW5ndGggKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzID0gZnVuY3Rpb24oIGdyaWQsIHN0YXJ0SW5kZXggKSB7XG5cbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoZ3JpZC5jb21wb25lbnRzKSAmJiBhbmd1bGFyLmlzQXJyYXkoZ3JpZC53aXJlcykpIHtcblxuICAgICAgICAgICAgICAgIGlmIChncmlkLnJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUHJvbWlzZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICgkdGltZW91dC5jYW5jZWwoZ3JpZC5yZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50c1Byb21pc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaGFkIHRvIGtpbGwnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZ3JpZC5yZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50c1Byb21pc2UgPSAkdGltZW91dChcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3JlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKGdyaWQsIHN0YXJ0SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIHJlY2FsY3VsYXRlQ3ljbGVEZWxheVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgX3JlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzID0gZnVuY3Rpb24gKCBncmlkLCBzdGFydEluZGV4ICkge1xuXG4gICAgICAgICAgICB2YXIgaSwgY29tcG9uZW50LFxuXG4gICAgICAgICAgICAgICAgY291bnRPZkNoYW5nZXMgPSAwLFxuICAgICAgICAgICAgICAgIGNoYW5nZXNMaW1pdFJlYWNoZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmRleDtcblxuICAgICAgICAgICAgZ3JpZC5pbnNpZGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNSZWNhbGN1bGF0ZSA9IHRydWU7XG5cblxuICAgICAgICAgICAgaWYgKCFjaGFuZ2VzTGltaXRSZWFjaGVkKSB7XG4gICAgICAgICAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlV2lyZXMoIGdyaWQgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggfHwgMDtcblxuICAgICAgICAgICAgZm9yIChpID0gc3RhcnRJbmRleDsgaTwgZ3JpZC5jb21wb25lbnRzLmxlbmd0aCAmJiBjaGFuZ2VzTGltaXRSZWFjaGVkID09PSBmYWxzZTsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBncmlkLmNvbXBvbmVudHNbaV07XG5cblxuICAgICAgICAgICAgICAgIGluZGV4ID0gZ3JpZC52aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMuaW5kZXhPZiggY29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIGNvbXBvbmVudC5pc0luVmlld1BvcnQoIGdyaWQudmlld1BvcnQsIHZpZXdQb3J0UGFkZGluZyApICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggaW5kZXggPT09IC0xICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZC52aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMucHVzaCggY29tcG9uZW50ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudE9mQ2hhbmdlcysrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGluZGV4ID4gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvdW50T2ZDaGFuZ2VzKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIGNvdW50T2ZDaGFuZ2VzID49IG51bWJlck9mQ2hhbmdlc0FsbG93ZWRJbk9uZUN5Y2xlICkge1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VzTGltaXRSZWFjaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8kbG9nLmRlYnVnKCAnTnVtYmVyIG9mIGNoYW5nZXMgY29tcGFyZWQgdG8gcHJldmlvdXMgZGlhZ3JhbSBzdGF0ZTonLCBjb3VudE9mQ2hhbmdlcyApO1xuXG4gICAgICAgICAgICBpZiAoICFjaGFuZ2VzTGltaXRSZWFjaGVkICkge1xuXG4gICAgICAgICAgICAgICAgc2VsZi5yZW9yZGVyVmlzaWJsZUNvbXBvbmVudHMoIGdyaWQuaWQgKTtcblxuICAgICAgICAgICAgICAgIGdyaWQuaW5zaWRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUmVjYWxjdWxhdGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmICghZ3JpZC5pbml0aWFsaXplZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGdyaWQuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdHcmlkSW5pdGlhbGl6ZWQnLCBncmlkLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyhncmlkLCBpKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzID0gZnVuY3Rpb24gKCBncmlkSWQgKSB7XG5cbiAgICAgICAgICAgIHZhciBncmlkO1xuXG4gICAgICAgICAgICBncmlkID0gZ3JpZHNbIGdyaWRJZCBdO1xuXG4gICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNEZWZpbmVkKCBncmlkICkgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoICFncmlkLmluc2lkZVZpc2libGVEaWFncmFtQ29tcG9uZW50c1JlY2FsY3VsYXRlICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKGdyaWQpO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cblxuICAgICAgICB0aGlzLmNyZWF0ZUdyaWQgPSBmdW5jdGlvbiAoIGlkLCBkaWFncmFtICkge1xuXG4gICAgICAgICAgICB2YXIgZ3JpZDtcblxuICAgICAgICAgICAgaWYgKCAhYW5ndWxhci5pc0RlZmluZWQoIGdyaWRzWyBpZCBdICkgKSB7XG4gICAgICAgICAgICAgICAgZ3JpZCA9IGdyaWRzWyBpZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGRpYWdyYW0uY29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZURpYWdyYW1Db21wb25lbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgd2lyZXM6IGRpYWdyYW0ud2lyZXMsXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGVXaXJlczogW10sXG4gICAgICAgICAgICAgICAgICAgIHZpZXdQb3J0OiB7fSxcbiAgICAgICAgICAgICAgICAgICAgaW5zaWRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUmVjYWxjdWxhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplZDogZmFsc2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyAoICdHcmlkIHdhcyBhbHJlYWR5IGRlZmluZWQhJywgaWQgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICB3aXJlczogZ3JpZC52aXNpYmxlV2lyZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG5cblxuICAgICAgICB0aGlzLnNldFZpc2libGVBcmVhID0gZnVuY3Rpb24gKCBncmlkSWQsIHZpZXdQb3J0ICkge1xuICAgICAgICAgICAgdmFyIGdyaWQgPSBncmlkc1sgZ3JpZElkIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0RlZmluZWQoIGdyaWQgKSApIHtcblxuICAgICAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0RlZmluZWQoIHZpZXdQb3J0ICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZ3JpZC52aWV3UG9ydCA9IHZpZXdQb3J0O1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW52YWxpZGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyggZ3JpZC5pZCApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93ICggJ0dyaWQgd2FzIG5vdCBkZWZpbmVkIScsIGdyaWRJZCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW9yZGVyVmlzaWJsZUNvbXBvbmVudHMgPSBmdW5jdGlvbiAoIGdyaWRJZCApIHtcblxuICAgICAgICAgICAgdmFyIGdyaWQgPSBncmlkc1sgZ3JpZElkIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0RlZmluZWQoIGdyaWQgKSApIHtcbiAgICAgICAgICAgICAgICBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cy5zb3J0KCBmdW5jdGlvbiAoIGEsIGIgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBhLnogPiBiLnogKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICggYS56IDwgYi56ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG5cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgIH1cbl0gKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgb3BlcmF0aW9uc01hbmFnZXJNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ub3BlcmF0aW9uc01hbmFnZXInLCBbXSk7XG5cbm9wZXJhdGlvbnNNYW5hZ2VyTW9kdWxlLnByb3ZpZGVyKCdvcGVyYXRpb25zTWFuYWdlcicsIGZ1bmN0aW9uIE9wZXJhdGlvbnNNYW5hZ2VyUHJvdmlkZXIoKSB7XG4gICAgdmFyIHNlbGYsXG4gICAgICAgIGF2YWlsYWJsZU9wZXJhdGlvbnM7XG5cbiAgICBzZWxmID0gdGhpcztcblxuICAgIGF2YWlsYWJsZU9wZXJhdGlvbnMgPSB7fTtcblxuICAgIHRoaXMucmVnaXN0ZXJPcGVyYXRpb24gPSBmdW5jdGlvbiAob3BlcmF0aW9uRGVzY3JpcHRvcikge1xuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KG9wZXJhdGlvbkRlc2NyaXB0b3IpICYmXG4gICAgICAgICAgICBhbmd1bGFyLmlzU3RyaW5nKG9wZXJhdGlvbkRlc2NyaXB0b3IuaWQpKSB7XG4gICAgICAgICAgICBhdmFpbGFibGVPcGVyYXRpb25zWyBvcGVyYXRpb25EZXNjcmlwdG9yLmlkIF0gPSBvcGVyYXRpb25EZXNjcmlwdG9yLm9wZXJhdGlvbkNsYXNzO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuJGdldCA9IFtcblxuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBPcGVyYXRpb25zTWFuYWdlcjtcblxuICAgICAgICAgICAgT3BlcmF0aW9uc01hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyT3BlcmF0aW9uID0gZnVuY3Rpb24gKG9wZXJhdGlvbkRlc2NyaXB0b3IpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChvcGVyYXRpb25EZXNjcmlwdG9yKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5pc1N0cmluZyhvcGVyYXRpb25EZXNjcmlwdG9yLmlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlT3BlcmF0aW9uc1sgb3BlcmF0aW9uRGVzY3JpcHRvci5pZCBdID0gb3BlcmF0aW9uRGVzY3JpcHRvci5vcGVyYXRpb25DbGFzcztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0QXZhaWxhYmxlT3BlcmF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF2YWlsYWJsZU9wZXJhdGlvbnM7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdE5ldyA9IGZ1bmN0aW9uIChvcGVyYXRpb25JZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBPcGVyYXRpb25DbGFzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbkluc3RhbmNlO1xuXG4gICAgICAgICAgICAgICAgICAgIE9wZXJhdGlvbkNsYXNzID0gYXZhaWxhYmxlT3BlcmF0aW9uc1sgb3BlcmF0aW9uSWQgXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKE9wZXJhdGlvbkNsYXNzKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25JbnN0YW5jZSA9IG5ldyBPcGVyYXRpb25DbGFzcygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25JbnN0YW5jZS5pbml0LmFwcGx5KG9wZXJhdGlvbkluc3RhbmNlLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3BlcmF0aW9uSW5zdGFuY2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBPcGVyYXRpb25zTWFuYWdlcigpO1xuXG4gICAgICAgIH1cbiAgICBdO1xufSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzeW1ib2xTZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xTZXJ2aWNlcycsIFtdICk7XG5cbnN5bWJvbFNlcnZpY2VzTW9kdWxlLnByb3ZpZGVyKCAnc3ltYm9sTWFuYWdlcicsIGZ1bmN0aW9uIFN5bWJvbE1hbmFnZXJQcm92aWRlcigpIHtcbiAgICB2YXIgYXZhaWxhYmxlU3ltYm9scyA9IHt9O1xuXG4gICAgdGhpcy5yZWdpc3RlclN5bWJvbCA9IGZ1bmN0aW9uICggc3ltYm9sRGVzY3JpcHRvciApIHtcblxuICAgICAgICBpZiAoIGFuZ3VsYXIuaXNPYmplY3QoIHN5bWJvbERlc2NyaXB0b3IgKSAmJlxuICAgICAgICAgICAgYW5ndWxhci5pc1N0cmluZyggc3ltYm9sRGVzY3JpcHRvci50eXBlICkgKSB7XG4gICAgICAgICAgICBhdmFpbGFibGVTeW1ib2xzWyBzeW1ib2xEZXNjcmlwdG9yLnR5cGUgXSA9IHN5bWJvbERlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy4kZ2V0ID0gW1xuXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIFN5bWJvbE1hbmFnZXI7XG5cbiAgICAgICAgICAgIFN5bWJvbE1hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdldEF2YWlsYWJsZVN5bWJvbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhdmFpbGFibGVTeW1ib2xzO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdldFN5bWJvbCA9IGZ1bmN0aW9uICggc3ltYm9sVHlwZSApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF2YWlsYWJsZVN5bWJvbHNbIHN5bWJvbFR5cGUgXTtcbiAgICAgICAgICAgICAgICB9O1xuXG4vLyAgICAgICAgICAgICAgICB0aGlzLmdldFN5bWJvbEVsZW1lbnRGb3JUeXBlID0gZnVuY3Rpb24gKCBzeW1ib2xUeXBlICkge1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gYXZhaWxhYmxlU3ltYm9sc1sgc3ltYm9sVHlwZSBdICYmIGF2YWlsYWJsZVN5bWJvbHNbIHN5bWJvbFR5cGUgXS5kaXJlY3RpdmU7XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgIGlmICggIXJlc3VsdCApIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gJ3Jlc2lzdG9yJztcbi8vICAgICAgICAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4vLyAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTeW1ib2xNYW5hZ2VyKCk7XG5cbiAgICAgICAgfVxuICAgIF07XG59ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBFbGJvd1JvdXRlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMubmFtZSA9ICdFbGJvd1JvdXRlcic7XG5cbiAgICB0aGlzLm1ha2VTZWdtZW50cyA9IGZ1bmN0aW9uICggcG9pbnRzLCBtZXRob2QgKSB7XG5cbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgICBwb2ludDEsIGVsYm93LCBwb2ludDIsXG4gICAgICAgICAgICBzZWdtZW50cztcblxuICAgICAgICBtZXRob2QgPSBtZXRob2QgfHwgJ3ZlcnRpY2FsRmlyc3QnO1xuXG4gICAgICAgIGlmICggYW5ndWxhci5pc0FycmF5KCBwb2ludHMgKSAmJiBwb2ludHMubGVuZ3RoID49IDIgKSB7XG5cbiAgICAgICAgICAgIHNlZ21lbnRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aCAtIDE7IGkrKyApIHtcblxuICAgICAgICAgICAgICAgIHBvaW50MSA9IHBvaW50c1sgaSBdO1xuICAgICAgICAgICAgICAgIHBvaW50MiA9IHBvaW50c1sgaSArIDEgXTtcblxuICAgICAgICAgICAgICAgIGlmICggbWV0aG9kID09PSAndmVydGljYWxGaXJzdCcgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxib3cgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwb2ludDEueCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBvaW50Mi55XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGVsYm93ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogcG9pbnQxLnksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBwb2ludDIueFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VnbWVudHMucHVzaCgge1xuXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcblxuICAgICAgICAgICAgICAgICAgICB4MTogcG9pbnQxLngsXG4gICAgICAgICAgICAgICAgICAgIHkxOiBwb2ludDEueSxcblxuICAgICAgICAgICAgICAgICAgICB4MjogZWxib3cueCxcbiAgICAgICAgICAgICAgICAgICAgeTI6IGVsYm93LnksXG5cbiAgICAgICAgICAgICAgICAgICAgcm91dGVyOiBzZWxmLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiAoIG1ldGhvZCA9PT0gJ3ZlcnRpY2FsRmlyc3QnICkgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnXG5cbiAgICAgICAgICAgICAgICB9LCB7XG5cbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuXG4gICAgICAgICAgICAgICAgICAgIHgxOiBlbGJvdy54LFxuICAgICAgICAgICAgICAgICAgICB5MTogZWxib3cueSxcblxuICAgICAgICAgICAgICAgICAgICB4MjogcG9pbnQyLngsXG4gICAgICAgICAgICAgICAgICAgIHkyOiBwb2ludDIueSxcblxuICAgICAgICAgICAgICAgICAgICByb3V0ZXI6IHNlbGYubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICggbWV0aG9kID09PSAndmVydGljYWxGaXJzdCcgKSA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCdcblxuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VnbWVudHM7XG5cbiAgICB9O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsYm93Um91dGVyOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUm91dGVyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5tYWtlU2VnbWVudHMgPSBmdW5jdGlvbiAoIHBvaW50cyApIHtcblxuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIHBvaW50MSwgcG9pbnQyLFxuICAgICAgICAgICAgc2VnbWVudHM7XG5cbiAgICAgICAgaWYgKCBhbmd1bGFyLmlzQXJyYXkoIHBvaW50cyApICYmIHBvaW50cy5sZW5ndGggPj0gMiApIHtcblxuICAgICAgICAgICAgc2VnbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgcG9pbnQxID0gcG9pbnRzWyBpIF07XG4gICAgICAgICAgICAgICAgcG9pbnQyID0gcG9pbnRzWyBpICsgMSBdO1xuXG4gICAgICAgICAgICAgICAgc2VnbWVudHMucHVzaCgge1xuXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcblxuICAgICAgICAgICAgICAgICAgICB4MTogcG9pbnQxLngsXG4gICAgICAgICAgICAgICAgICAgIHkxOiBwb2ludDEueSxcblxuICAgICAgICAgICAgICAgICAgICB4MjogcG9pbnQyLngsXG4gICAgICAgICAgICAgICAgICAgIHkyOiBwb2ludDIueVxuXG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWdtZW50cztcblxuICAgIH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlUm91dGVyOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgd2lyaW5nU2VydmljZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ud2lyaW5nU2VydmljZScsIFtdICk7XG5cbndpcmluZ1NlcnZpY2VzTW9kdWxlLnNlcnZpY2UoICd3aXJpbmdTZXJ2aWNlJywgWyAnJGxvZycsICckcm9vdFNjb3BlJywgJyR0aW1lb3V0JyxcbiAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgU2ltcGxlUm91dGVyID0gcmVxdWlyZSggJy4vY2xhc3Nlcy9TaW1wbGVSb3V0ZXIuanMnICksXG4gICAgICAgICAgICBFbGJvd1JvdXRlciA9IHJlcXVpcmUoICcuL2NsYXNzZXMvRWxib3dSb3V0ZXIuanMnICksXG4gICAgICAgICAgICByb3V0ZXJzID0ge1xuXG4gICAgICAgICAgICAgICAgU2ltcGxlUm91dGVyOiBuZXcgU2ltcGxlUm91dGVyKCksXG4gICAgICAgICAgICAgICAgRWxib3dSb3V0ZXI6IG5ldyBFbGJvd1JvdXRlcigpXG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMgPSBmdW5jdGlvbiAoIGVuZFBvc2l0aW9ucywgcm91dGVyVHlwZSApIHtcblxuICAgICAgICAgICAgdmFyIHNlZ21lbnRzLFxuICAgICAgICAgICAgICAgIHJvdXRlcjtcblxuICAgICAgICAgICAgcm91dGVyID0gcm91dGVyc1sgcm91dGVyVHlwZSBdO1xuXG4gICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNPYmplY3QoIHJvdXRlciApICYmIGFuZ3VsYXIuaXNGdW5jdGlvbiggcm91dGVyLm1ha2VTZWdtZW50cyApICkge1xuICAgICAgICAgICAgICAgIHNlZ21lbnRzID0gcm91dGVyLm1ha2VTZWdtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgWyBlbmRQb3NpdGlvbnMuZW5kMSwgZW5kUG9zaXRpb25zLmVuZDIgXSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2VnbWVudHM7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJvdXRlV2lyZSA9IGZ1bmN0aW9uICggd2lyZSwgcm91dGVyVHlwZSApIHtcblxuICAgICAgICAgICAgdmFyIHJvdXRlciwgZW5kUG9zaXRpb25zO1xuXG4gICAgICAgICAgICByb3V0ZXJUeXBlID0gcm91dGVyVHlwZSB8fCAnRWxib3dSb3V0ZXInO1xuXG4gICAgICAgICAgICByb3V0ZXIgPSByb3V0ZXJzWyByb3V0ZXJUeXBlIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggcm91dGVyICkgJiYgYW5ndWxhci5pc0Z1bmN0aW9uKCByb3V0ZXIubWFrZVNlZ21lbnRzICkgKSB7XG5cbiAgICAgICAgICAgICAgICBlbmRQb3NpdGlvbnMgPSB3aXJlLmdldEVuZFBvc2l0aW9ucygpO1xuXG4gICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cyA9IHJvdXRlci5tYWtlU2VnbWVudHMoXG4gICAgICAgICAgICAgICAgICAgIFsgZW5kUG9zaXRpb25zLmVuZDEsIGVuZFBvc2l0aW9ucy5lbmQyIF0gKTtcblxuICAgICAgICAgICAgICAgIHdpcmUucm91dGVyVHlwZSA9IHJvdXRlclR5cGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFkanVzdFdpcmVFbmRTZWdtZW50cyA9IGZ1bmN0aW9uICggd2lyZSApIHtcblxuICAgICAgICAgICAgdmFyIGZpcnN0U2VnbWVudCxcbiAgICAgICAgICAgICAgICBzZWNvbmRTZWdtZW50LFxuICAgICAgICAgICAgICAgIHNlY29uZFRvTGFzdFNlZ21lbnQsXG4gICAgICAgICAgICAgICAgbGFzdFNlZ21lbnQsXG4gICAgICAgICAgICAgICAgZW5kUG9zaXRpb25zLFxuICAgICAgICAgICAgICAgIG5ld1NlZ21lbnRzLFxuICAgICAgICAgICAgICAgIHBvcztcblxuICAgICAgICAgICAgZW5kUG9zaXRpb25zID0gd2lyZS5nZXRFbmRQb3NpdGlvbnMoKTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzQXJyYXkoIHdpcmUuc2VnbWVudHMgKSAmJiB3aXJlLnNlZ21lbnRzLmxlbmd0aCA+IDEgKSB7XG5cbiAgICAgICAgICAgICAgICBmaXJzdFNlZ21lbnQgPSB3aXJlLnNlZ21lbnRzWyAwIF07XG5cbiAgICAgICAgICAgICAgICBpZiAoIGZpcnN0U2VnbWVudC54MSAhPT0gZW5kUG9zaXRpb25zLmVuZDEueCB8fCBmaXJzdFNlZ21lbnQueTEgIT09IGVuZFBvc2l0aW9ucy5lbmQxLnkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBmaXJzdFNlZ21lbnQucm91dGVyID09PSAnRWxib3dSb3V0ZXInICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRTZWdtZW50ID0gd2lyZS5zZWdtZW50c1sgMSBdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogc2Vjb25kU2VnbWVudC54MixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBzZWNvbmRTZWdtZW50LnkyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzLnNwbGljZSggMCwgMiApO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogZmlyc3RTZWdtZW50LngyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGZpcnN0U2VnbWVudC55MlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cy5zcGxpY2UoIDAsIDEgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG5ld1NlZ21lbnRzID0gc2VsZi5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDE6IGVuZFBvc2l0aW9ucy5lbmQxLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMjogcG9zXG4gICAgICAgICAgICAgICAgICAgIH0sIGZpcnN0U2VnbWVudC5yb3V0ZXIgKTtcblxuICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzID0gbmV3U2VnbWVudHMuY29uY2F0KCB3aXJlLnNlZ21lbnRzICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXN0U2VnbWVudCA9IHdpcmUuc2VnbWVudHNbIHdpcmUuc2VnbWVudHMubGVuZ3RoIC0gMSBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBsYXN0U2VnbWVudC54MiAhPT0gZW5kUG9zaXRpb25zLmVuZDIueCB8fCBsYXN0U2VnbWVudC55MiAhPT0gZW5kUG9zaXRpb25zLmVuZDIueSApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGxhc3RTZWdtZW50LnJvdXRlciA9PT0gJ0VsYm93Um91dGVyJyApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kVG9MYXN0U2VnbWVudCA9IHdpcmUuc2VnbWVudHNbIHdpcmUuc2VnbWVudHMubGVuZ3RoIC0gMiBdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogc2Vjb25kVG9MYXN0U2VnbWVudC54MSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBzZWNvbmRUb0xhc3RTZWdtZW50LnkxXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzLnNwbGljZSggd2lyZS5zZWdtZW50cy5sZW5ndGggLSAyLCAyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBsYXN0U2VnbWVudC54MSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBsYXN0U2VnbWVudC55MVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cy5zcGxpY2UoIHdpcmUuc2VnbWVudHMubGVuZ3RoIC0gMSwgMSApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3U2VnbWVudHMgPSBzZWxmLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucygge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMTogcG9zLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMjogZW5kUG9zaXRpb25zLmVuZDJcbiAgICAgICAgICAgICAgICAgICAgfSwgbGFzdFNlZ21lbnQucm91dGVyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cyA9IHdpcmUuc2VnbWVudHMuY29uY2F0KCBuZXdTZWdtZW50cyApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYucm91dGVXaXJlKCB3aXJlICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgIH1cbl0gKTsiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoICdBcnJheS5wcm90b3R5cGUuZmluZCcgKTtcblxuaWYgKCAhQXJyYXkucHJvdG90eXBlLmZpbmRCeUlkICkge1xuICAgIEFycmF5LnByb3RvdHlwZS5maW5kQnlJZCA9IGZ1bmN0aW9uICggaWQgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmQoIGZ1bmN0aW9uICggYSApIHtcbiAgICAgICAgICAgIHJldHVybiBhLmlkICE9PSB1bmRlZmluZWQgJiYgYS5pZCA9PT0gaWQ7XG4gICAgICAgIH0gKTtcbiAgICB9O1xufVxuXG5pZiAoICFBcnJheS5wcm90b3R5cGUuZ2V0UmFuZG9tRWxlbWVudCApIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZ2V0UmFuZG9tRWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbIE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAoIHRoaXMubGVuZ3RoIC0gMSApICkgXTtcbiAgICB9O1xufVxuXG5pZiAoICFBcnJheS5wcm90b3R5cGUuc2h1ZmZsZSApIHtcbiAgICBBcnJheS5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMubGVuZ3RoLFxuICAgICAgICAgICAgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xuXG4gICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXG4gICAgICAgIHdoaWxlICggMCAhPT0gY3VycmVudEluZGV4ICkge1xuXG4gICAgICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cbiAgICAgICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleCApO1xuICAgICAgICAgICAgY3VycmVudEluZGV4IC09IDE7XG5cbiAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICAgICAgICAgIHRlbXBvcmFyeVZhbHVlID0gdGhpc1sgY3VycmVudEluZGV4IF07XG4gICAgICAgICAgICB0aGlzWyBjdXJyZW50SW5kZXggXSA9IHRoaXNbIHJhbmRvbUluZGV4IF07XG4gICAgICAgICAgICB0aGlzWyByYW5kb21JbmRleCBdID0gdGVtcG9yYXJ5VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xufSJdfQ==
