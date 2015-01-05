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

},{"./directives/busyCover/busyCover.js":4,"./directives/designEditor/designEditor":8,"./directives/diagramContainer/diagramContainer.js":10,"./directives/fabricCanvas/fabricCanvas.js":12,"./directives/resizing/resizeToHeight.js":14,"./directives/resizing/resizeToWindow.js":15,"./directives/svgDiagram/svgDiagram.js":20,"./directives/symbols/componentSymbol.js":23,"./libraryIncludes.js":31,"./services/diagramService/diagramService.js":38,"./services/gridService/gridService.js":39,"./services/operationsManager/operationsManager.js":40,"./services/wiringService/wiringService.js":44,"./utils.js":45}],2:[function(require,module,exports){
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
'use strict';

module.exports = function(symbolManagerProvider) {

    var generateSymbols;

    generateSymbols = function (count) {

        var i,
            portCount,
            makeARandomSymbol,
            makeSomePorts,
            minPorts = 6,
            maxPorts = 30,
            placements = ['top', 'right', 'bottom', 'left'];

        makeSomePorts = function (countOfPorts) {

            var sides,
                port,
                placement,
                j;

            sides = {
                top: [],
                right: [],
                bottom: [],
                left: []
            };

            for (j = 0; j < countOfPorts; j++) {

                port = {
                    id: 'p_' + j,
                    label: 'Port-' + j
                };

                placement = placements.getRandomElement();

                sides[placement].push(port);
            }

            return sides;

        };

        makeARandomSymbol = function (idPostfix, countOfPorts) {

            var portDescriptors,
                descriptor;

            portDescriptors = makeSomePorts(countOfPorts);

            descriptor =  {
                cssClass: 'random_' + idPostfix,
                labelPrefix: 'RND_' + countOfPorts + '_' + idPostfix + ' '
            };

            symbolManagerProvider.makeBoxSymbol(
                'random_' + idPostfix,
                descriptor,
                portDescriptors,
                {
                    justifyPorts: false
                }
            );

        };

        for (i = 0; i < count; i++) {

            portCount = Math.max(
                Math.floor(Math.random() * maxPorts),
                minPorts
            );

            makeARandomSymbol(i, portCount);

        }

    };



    this.generateSymbols = generateSymbols;

};

},{}],8:[function(require,module,exports){
/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.designEditor', [] )
    .controller( 'DesignEditorController', function(
        $scope, $rootScope, diagramService, $log, designService, $stateParams, designLayoutService, symbolManager) {

        var RandomSymbolGenerator,
            randomSymbolGenerator,

            designCtx;

        $scope.diagram = null;

        designCtx = {
            db: $rootScope.mainDbConnectionId,
            regionId: 'Design_' + ( new Date() ).toISOString()
        };

        $scope.diagramContainerConfig = {

        };

        if ($stateParams.containerId === 'dummy') {

            RandomSymbolGenerator = require('./classes/RandomSymbolGenerator');
            randomSymbolGenerator = new RandomSymbolGenerator(symbolManager);

            randomSymbolGenerator.generateSymbols(7);


            $scope.diagram = diagramService.addDummyDiagram('dummy', 100, 50, 3000, 3000);

            $log.debug('Drawing dummy diagram:', $scope.diagram);
            $rootScope.loading = false;

        } else {

            designLayoutService.watchDiagramElements(designCtx, $rootScope.activeDesign.id, function (/*designStructureUpdateObject*/) {

            }).then(function (cyPhyLayout) {

                $log.debug('Diagram elements', cyPhyLayout);

                $rootScope.activeContainerId = $stateParams.containerId || $rootScope.activeDesign.id;

                $log.debug($rootScope.activeContainerId);

                $scope.diagram =
                    diagramService.createDiagramFromCyPhyElements($rootScope.activeContainerId, cyPhyLayout.elements);

                $log.debug('Drawing diagram:', $scope.diagram);

                $rootScope.loading = false;

            });
        }

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

},{"./classes/RandomSymbolGenerator":7}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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


},{"../drawingGrid/drawingGrid.js":11,"./classes/ScrollHandler":9}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{"../../../services/diagramService/classes/Wire.js":37}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

                            scope.$emit('DiagramInitialized');
                        }

                    });


                    $element.bind('contextmenu', killContextMenu);


                }

            };
        }
    ]);

},{"../componentWire/componentWire.js":5,"./classes/ComponentDragHandler":16,"./classes/ComponentSelectionHandler":17,"./classes/WireDrawHandler":18,"./classes/contextMenuHandler":19}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.capacitor', []
    )
    .config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
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
                ports: {
                    C: {
                        id: 'C',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'C',
                        x: 0,
                        y: 7.5
                    }, A: {
                        id: 'A',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: 'A',
                        x: 60,
                        y: 7.5
                    } }
            });
        }
    ]);
},{}],23:[function(require,module,exports){
/*globals angular, $*/

'use strict';

require( '../../services/symbolServices/symbolServices.js' );
require( '../port/port.js' );

require( './resistor/resistor.js' );
require( './jFetP/jFetP.js' );
require( './opAmp/opAmp.js' );
require( './diode/diode.js' );
require( './tvsDiode/tvsDiode.js' );
require( './capacitor/capacitor.js' );
require( './inductor/inductor.js' );
require( './simpleConnector/simpleConnector.js' );

require( './box/box.js' );

var symbolsModule = angular.module(
    'mms.designVisualization.symbols', [
        'mms.designVisualization.symbolServices',

        'mms.designVisualization.port',

        'mms.designVisualization.symbols.resistor',
        'mms.designVisualization.symbols.jFetP',
        'mms.designVisualization.symbols.opAmp',
        'mms.designVisualization.symbols.diode',
        'mms.designVisualization.symbols.tvsDiode',
        'mms.designVisualization.symbols.capacitor',
        'mms.designVisualization.symbols.inductor',
        'mms.designVisualization.symbols.simpleConnector',

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
                    symbolDirective;

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

                    result = scope.component.symbol.cssClass ? scope.component.symbol.cssClass : scope.component.symbol.type;

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

                symbolDirective = scope.component.symbol.symbolDirective || 'generic-svg';

                compiledSymbol = diagramContainerController.getCompiledDirective( symbolDirective );

                if ( !angular.isFunction( compiledSymbol ) ) {

                    templateStr = '<' + symbolDirective + '>' +
                        '</' + symbolDirective + '>';

                    template = angular.element( templateStr );

                    compiledSymbol = $compile( template );

                    diagramContainerController.setCompiledDirective( symbolDirective, compiledSymbol );

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

},{"../../services/symbolServices/symbolServices.js":41,"../port/port.js":13,"./box/box.js":21,"./capacitor/capacitor.js":22,"./diode/diode.js":24,"./inductor/inductor.js":25,"./jFetP/jFetP.js":26,"./opAmp/opAmp.js":27,"./resistor/resistor.js":28,"./simpleConnector/simpleConnector.js":29,"./tvsDiode/tvsDiode.js":30}],24:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.diode', []
    )
    .config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
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
                ports: {
                    C: {
                        id: 'C',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: 'C',
                        x: 0,
                        y: 7
                    }, A: {
                        id: 'A',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'A',
                        x: 60,
                        y: 7
                    } }
            });
        }
    ]);
},{}],25:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.inductor', []
    )
    .config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
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
                ports: {
                    p1: {
                        id: 'p1',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'p1',
                        x: 0,
                        y: 6.5
                    }, p2: {
                        id: 'p2',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: 'p2',
                        x: 50,
                        y: 6.5
                    } }
            });
        }
    ]);
},{}],26:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.jFetP', []
    )
    .config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
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
                ports: {
                    s: {
                        id: 's',
                        wireAngle: 270,
                        wireLeadIn: 20,
                        label: 'S',
                        x: 47,
                        y: 0
                    }, d: {
                        id: 'd',
                        wireAngle: 90,
                        wireLeadIn: 20,
                        label: 'D',
                        x: 47,
                        y: 70
                    }, g: {
                        id: 'g',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'G',
                        x: 0,
                        y: 26
                    } }
            });
        }
    ]);
},{}],27:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.opAmp', []
    )
    .config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
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
                ports: {
                    'Vs+': {
                        id: 'Vs+',
                        wireAngle: 270,
                        wireLeadIn: 20,
                        label: 'Vs+',
                        x: 65,
                        y: 0
                    }, 'Vout': {
                        id: 'Vout',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: 'Vout',
                        x: 140,
                        y: 50
                    }, 'Vs-': {
                        id: 'Vs-',
                        wireAngle: 90,
                        wireLeadIn: 20,
                        label: 'Vs-',
                        x: 65,
                        y: 100
                    }, 'V-': {
                        id: 'V-',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'V-',
                        x: 0,
                        y: 75
                    }, 'V+': {
                        id: 'V+',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'V+',
                        x: 0,
                        y: 25
                    } }
            });
        }
    ]);
},{}],28:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.resistor', []
    )
    .config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
                type: 'resistor',
                symbolDirective: null,
                svgDecoration: 'images/symbols.svg#icon-resistor',
                labelPrefix: 'R',
                labelPosition: {
                    x: 10,
                    y: -8
                },
                width: 60,
                height: 10,
                ports: {
                    p1: {
                        id: 'p1',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'p1',
                        x: 0,
                        y: 5
                    }, p2: {
                        id: 'p2',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: 'p2',
                        x: 60,
                        y: 5
                    } }
            });
        }
    ]);
},{}],29:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.simpleConnector', []
    ).config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
                type: 'simpleConnector',
                symbolDirective: 'simple-connector',
                labelPrefix: '',
                labelPosition: {
                    x: 3,
                    y: 11
                },
                width: 100,
                height: 15,
                ports: {
                    p1: {
                        id: 'p1',
                        wireAngle: 0,
                        wireLeadIn: 0,
                        label: '',
                        x: 97,
                        y: 7
                    } }
            });
        }
    ])
    .controller('SimpleConnectorController', function () {
    })
    .directive(
    'simpleConnector',

    function () {

        return {
            scope: false,
            restrict: 'E',
            replace: true,
            controller: 'SimpleConnectorController',
            templateUrl: '/mmsApp/templates/simpleConnector.html',
            templateNamespace: 'SVG'
        };
    });
},{}],30:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.tvsDiode', []
    )
    .config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
                type: 'tvsDiode',
                directive: null,
                svgDecoration: 'images/symbols.svg#icon-tvsDiode',
                labelPrefix: 'TVSD',
                labelPosition: {
                    x: 10,
                    y: -8
                },
                width: 60,
                height: 15,
                ports: {
                    C: {
                        id: 'C',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: 'C',
                        x: 0,
                        y: 7
                    }, A: {
                        id: 'A',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'A',
                        x: 60,
                        y: 7
                    } }
            });
        }
    ]);

},{}],31:[function(require,module,exports){

},{}],32:[function(require,module,exports){
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
},{"glMatrix":3}],33:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function (symbolManager, diagramService, wiringService) {

    var getDiagram;

    getDiagram = function (diagramElements) {

        var i,
            symbol,
            newDiagramComponent,

            allPortsById,

            minePortsFromInterfaces,

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

        allPortsById = {};

        minePortsFromInterfaces = function (element, collector) {

            var minX,
                maxX,
                portDescriptors,
                median,
                allInterConnectors,
                portInstances,
                newPort;

            portDescriptors = {};
            portInstances = [];

            allInterConnectors = [];

            portDescriptors.top = [];
            portDescriptors.right = [];
            portDescriptors.bottom = [];
            portDescriptors.left = [];

            minX = null;
            maxX = null;

            if (angular.isObject(element.interfaces)) {

                angular.forEach(element.interfaces.connectors, function (innerConnector) {

                    var x;

                    x = innerConnector.position.x;

                    if (minX === null) {
                        minX = x;
                    }

                    if (maxX === null) {
                        maxX = x;
                    }

                    if (x < minX) {
                        minX = x;
                    }

                    if (x > maxX) {
                        maxX = x;
                    }

                    allInterConnectors.push(innerConnector);

                });

                allInterConnectors.sort(function (a, b) {

                    if (a.position.x > b.position.x) {
                        return 1;
                    }

                    if (a.position.x < b.position.x) {
                        return 1;
                    }

                    return 0;

                });

                median = (minX + maxX) / 2;

                angular.forEach(allInterConnectors, function (innerConnector) {

                    var portSymbol;

                    portSymbol = {
                        id: innerConnector.id,
                        label: innerConnector.name
                    };

                    if (innerConnector.position.x < median) {

                        portDescriptors.left.push(portSymbol);

                    } else {

                        portDescriptors.right.push(portSymbol);

                    }

                    newPort = new ComponentPort({
                        id: innerConnector.id,
                        portSymbol: portSymbol
                    });

                    portInstances.push(newPort);

                    if (angular.isObject(collector)) {
                        collector[ innerConnector.id ] = newPort;
                    }

                });
            }

            return {
                portDescriptors: portDescriptors,
                portInstances: portInstances
            };


        };

        diagram = new Diagram();

        if (angular.isObject(diagramElements)) {

            i = 0;

            diagram.config.width = 2000;
            diagram.config.height = 2000;

            angular.forEach(diagramElements.Connector, function (element) {

                var portInstance;

                symbol = symbolManager.getSymbol('simpleConnector');

                newDiagramComponent = new DiagramComponent({
                    id: element.id,
                    label: element.name,
                    x: element.position.x,
                    y: element.position.y,
                    z: i,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                    symbol: symbol,
                    nonSelectable: false,
                    locationLocked: false,
                    draggable: true
                });

                portInstance = new ComponentPort({
                    id: element.id,
                    portSymbol: symbol.ports.p1
                });

                allPortsById[element.id] = portInstance;

                newDiagramComponent.registerPortInstances([ portInstance ]);
                diagram.addComponent(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.AVMComponentModel, function (element) {

                var portStuff,
                    i;

                portStuff = minePortsFromInterfaces(element, allPortsById);

                if (angular.isString(element.name) &&
                    element.name.charAt(0) === 'C' &&
                    !isNaN(element.name.charAt(1))
                ) {

                    // Cheap shot to figure if it is a capacitor

                    symbol = symbolManager.getSymbol('capacitor');

                    newDiagramComponent = new DiagramComponent({
                        id: element.id,
                        label: element.name,
                        x: element.position.x,
                        y: element.position.y,
                        z: i,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        symbol: symbol,
                        nonSelectable: false,
                        locationLocked: false,
                        draggable: true
                    });

                    //p1 = new ComponentPort({
                    //    id: element.id,
                    //    portSymbol: symbol.ports.C
                    //});
                    //
                    //p2 = new ComponentPort({
                    //    id: element.id,
                    //    portSymbol: symbol.ports.A
                    //});
                    //
                    //allPortsById[element.id] = p1;
                    //allPortsById[element.id] = p2;

                    for (i=0; i < portStuff.portInstances.length; i++) {

                        if (portStuff.portInstances[i].portSymbol.label === 'P2') {
                            portStuff.portInstances[i].portSymbol = symbol.ports.C;
                        }

                        if (portStuff.portInstances[i].portSymbol.label === 'P1') {
                            portStuff.portInstances[i].portSymbol = symbol.ports.A;
                        }

                    }

                    newDiagramComponent.registerPortInstances(portStuff.portInstances);

                } else {

                    symbol = symbolManager.makeBoxSymbol(element.name, {}, portStuff.portDescriptors);

                    newDiagramComponent = new DiagramComponent({
                        id: element.id,
                        label: element.name,
                        x: element.position.x,
                        y: element.position.y,
                        z: i,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        symbol: symbol,
                        nonSelectable: false,
                        locationLocked: false,
                        draggable: true
                    });

                    newDiagramComponent.registerPortInstances(portStuff.portInstances);


                }

                diagram.addComponent(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.Container, function (element) {

                var portStuff;

                portStuff = minePortsFromInterfaces(element, allPortsById);

                symbol = symbolManager.makeBoxSymbol(element.name, {}, portStuff.portDescriptors);

                newDiagramComponent = new DiagramComponent({
                    id: element.id,
                    label: element.name,
                    x: element.position.x,
                    y: element.position.y,
                    z: i,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                    symbol: symbol,
                    nonSelectable: false,
                    locationLocked: false,
                    draggable: true
                });

                newDiagramComponent.registerPortInstances(portStuff.portInstances);
                diagram.addComponent(newDiagramComponent);

                i++;

            });


            angular.forEach(diagramElements.ConnectorComposition, function (element) {

                var sourcePort,
                    destinationPort;

                if (angular.isObject(element.details)) {

                    sourcePort = allPortsById[element.details.sourceId];
                    destinationPort = allPortsById[element.details.destinationId];

                    if (sourcePort && destinationPort) {

                        wire = new Wire({
                            id: element.id,
                            end1: {
                                component: sourcePort.parentComponent,
                                port: sourcePort
                            },
                            end2: {
                                component: destinationPort.parentComponent,
                                port: destinationPort
                            }
                        });

                        wiringService.routeWire(wire, 'ElbowRouter');

                        diagram.addWire(wire);

                    }
                }

            });

        }

        return diagram;

    };

    this.getDiagram = getDiagram;
};

},{"./ComponentPort":32,"./Diagram":34,"./DiagramComponent.js":35,"./Wire.js":37}],34:[function(require,module,exports){
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

        if (angular.isObject(wire.end1.component) && angular.isObject(wire.end2.component)) {

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

},{}],35:[function(require,module,exports){
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
},{"glMatrix":3}],36:[function(require,module,exports){
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

},{"./ComponentPort":32,"./Diagram":34,"./DiagramComponent.js":35,"./Wire.js":37}],37:[function(require,module,exports){
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
        port2Position,
        positions;

    port1Position = this.end1.port.getGridPosition();
    port2Position = this.end2.port.getGridPosition();

    if (port1Position && port2Position) {

        positions = {

            end1: port1Position,
            end2: port2Position

        };

    }

    return positions;

};

module.exports = Wire;

},{}],38:[function(require,module,exports){
/*globals angular */

'use strict';

angular.module('mms.designVisualization.diagramService', [
    'mms.designVisualization.symbolServices',
    'mms.designVisualization.operationsManager'
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

                CyPhyDiagramParser,
                cyPhyDiagramParser,

                DiagramComponent,
                ComponentPort,
                Wire;

            diagrams = {};

            DummyDiagramGenerator = require('./classes/DummyDiagramGenerator.js');
            CyPhyDiagramParser = require('./classes/CyPhyDiagramParser.js');

            DiagramComponent = require('./classes/DiagramComponent.js');
            ComponentPort = require('./classes/ComponentPort');
            Wire = require('./classes/Wire.js');

            dummyDiagramGenerator = new DummyDiagramGenerator(symbolManager, self, wiringService);
            cyPhyDiagramParser = new CyPhyDiagramParser(symbolManager, self, wiringService);

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

            this.createDiagramFromCyPhyElements = function(diagramId, diagramElements) {

                var diagram;

                if (diagramId && angular.isObject(diagramElements)) {

                    diagram = cyPhyDiagramParser.getDiagram(diagramElements);
                    diagram.id = diagramId;

                    diagrams[diagramId] = diagram;

                }

                return diagram;

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

},{"./classes/ComponentPort":32,"./classes/CyPhyDiagramParser.js":33,"./classes/DiagramComponent.js":35,"./classes/DummyDiagramGenerator.js":36,"./classes/Wire.js":37}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
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
},{}],41:[function(require,module,exports){
/*globals angular*/

'use strict';

var symbolServicesModule = angular.module(
    'mms.designVisualization.symbolServices', [] );

symbolServicesModule.provider( 'symbolManager', function SymbolManagerProvider() {
    var provider = this,
        availableSymbols = {},

        portCreator,
        spreadPortsAlongSide;


    spreadPortsAlongSide = function (somePorts, side, width, height, parameters) {

        var offset,
            increment,

            i,
            aPort;

        offset = parameters.portWireLength + parameters.portSpacing;

        if (side === 'right' || side === 'left') {
            offset += parameters.topPortPadding;
        }

        if (parameters.justifyPorts) {

            if (side === 'top' || side === 'bottom') {
                increment = (width - 2 * parameters.portSpacing) / ( somePorts.length + 1 );
            } else {
                increment =
                    ( height -
                        2 * parameters.portSpacing -
                        parameters.topPortPadding - parameters.bottomPortPadding) / ( somePorts.length + 1 );
            }

        } else {
            increment = parameters.portSpacing;
        }

        for (i=0; i < somePorts.length; i++) {

            aPort = somePorts[i];

            switch (side) {

                case 'top':
                    aPort.x = offset;
                    aPort.y = 0;
                    aPort.wireAngle = -90;

                    offset += increment;

                    break;

                case 'right':
                    aPort.x = width;
                    aPort.y = offset;
                    aPort.wireAngle = 0;

                    offset += increment;

                    break;

                case 'bottom':
                    aPort.x = offset;
                    aPort.y = height;
                    aPort.wireAngle = 90;

                    offset += increment;

                    break;

                case 'left':
                    aPort.x = 0;
                    aPort.y = offset;
                    aPort.wireAngle = 180;

                    offset += increment;

                    break;

            }

        }

    };


    portCreator = function(portDescriptors, parameters) {

        var width,
            height,
            ports,

            top,
            right,
            bottom,
            left;

        portDescriptors = portDescriptors || {};
        ports = [];

        top = portDescriptors.top || [];
        right = portDescriptors.right || [];
        bottom = portDescriptors.bottom || [];
        left = portDescriptors.left || [];

        width = Math.max(
            parameters.portSpacing * ( top.length + 3 ),
            parameters.portSpacing * ( bottom.length + 3),
            parameters.minWidth
        );

        height = Math.max(
            parameters.portSpacing * ( left.length + 3) + parameters.topPortPadding + parameters.bottomPortPadding,
            parameters.portSpacing * ( right.length + 3) + parameters.topPortPadding + parameters.bottomPortPadding,
            parameters.minHeight
        );

        spreadPortsAlongSide(top, 'top', width, height, parameters);
        spreadPortsAlongSide(right, 'right', width, height, parameters);
        spreadPortsAlongSide(bottom, 'bottom', width, height, parameters);
        spreadPortsAlongSide(left, 'left', width, height, parameters);

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


    this.registerSymbol = function ( symbolDescriptor ) {

        if ( angular.isObject( symbolDescriptor ) &&
            angular.isString( symbolDescriptor.type ) ) {
            availableSymbols[ symbolDescriptor.type ] = symbolDescriptor;
        }
    };

    this.makeBoxSymbol = function( type, descriptor, portDescriptors, givenParameters ) {

        var symbol,
            parameters,
            portsAndSizes,
            cssClass;

        parameters = angular.extend({
            portWireLength: 20,
            portSpacing: 20,
            topPortPadding: 20,
            bottomPortPadding: 0,
            minWidth: 140,
            minHeight: 80,
            justifyPorts: false
        }, givenParameters || {});

        if (angular.isObject(descriptor) && type) {

            if (!availableSymbols[type]) {

                portDescriptors = portDescriptors || {};

                portsAndSizes = portCreator(portDescriptors, parameters);

                cssClass = 'box';

                if (parameters.cssClass) {
                    cssClass += ' parameters.cssClass';
                }

                symbol = angular.extend(descriptor,
                    {
                        type: type,
                        cssClass: cssClass,
                        symbolDirective: 'box',
                        svgDecoration: null,
                        labelPosition: {
                            x: portsAndSizes.width/2,
                            y: parameters.portWireLength + 24
                        },
                        portWireLength: parameters.portWireLength,
                        width: portsAndSizes.width,
                        height: portsAndSizes.height,
                        ports: portsAndSizes.ports,
                        boxHeight: portsAndSizes.height - 2 * parameters.portWireLength,
                        boxWidth: portsAndSizes.width - 2 * parameters.portWireLength
                    });

                provider.registerSymbol(symbol);

            } else {
                symbol = availableSymbols[type];
            }

        }

        return symbol;
    };


    this.$get = [

        function () {

            var SymbolManager;

            SymbolManager = function () {

                this.registerSymbol = provider.registerSymbol;

                this.makeBoxSymbol = provider.makeBoxSymbol;

                this.getAvailableSymbols = function () {
                    return availableSymbols;
                };

                this.getSymbol = function ( symbolType ) {
                    return availableSymbols[ symbolType ];
                };


            };

            return new SymbolManager();

        }
    ];
} );

},{}],42:[function(require,module,exports){
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
},{}],43:[function(require,module,exports){
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
},{}],44:[function(require,module,exports){
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

                if (endPositions) {

                    wire.segments = router.makeSegments(
                        [endPositions.end1, endPositions.end2]);

                }

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

},{"./classes/ElbowRouter.js":42,"./classes/SimpleRouter.js":43}],45:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvbW1zQXBwL2FwcC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvQXJyYXkucHJvdG90eXBlLmZpbmQvaW5kZXguanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9ib3dlcl9jb21wb25lbnRzL2dsLW1hdHJpeC9kaXN0L2dsLW1hdHJpeC1taW4uanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2J1c3lDb3Zlci9idXN5Q292ZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2NvbXBvbmVudFdpcmUvY29tcG9uZW50V2lyZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvY29tcG9uZW50V2lyZS9jb21wb25lbnRXaXJlU2VnbWVudC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGVzaWduRWRpdG9yL2NsYXNzZXMvUmFuZG9tU3ltYm9sR2VuZXJhdG9yLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9kZXNpZ25FZGl0b3IvZGVzaWduRWRpdG9yLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9kaWFncmFtQ29udGFpbmVyL2NsYXNzZXMvU2Nyb2xsSGFuZGxlci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGlhZ3JhbUNvbnRhaW5lci9kaWFncmFtQ29udGFpbmVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9kcmF3aW5nR3JpZC9kcmF3aW5nR3JpZC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZmFicmljQ2FudmFzL2ZhYnJpY0NhbnZhcy5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvcG9ydC9wb3J0LmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9yZXNpemluZy9yZXNpemVUb0hlaWdodC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvcmVzaXppbmcvcmVzaXplVG9XaW5kb3cuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vY2xhc3Nlcy9Db21wb25lbnREcmFnSGFuZGxlci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ZnRGlhZ3JhbS9jbGFzc2VzL0NvbXBvbmVudFNlbGVjdGlvbkhhbmRsZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vY2xhc3Nlcy9XaXJlRHJhd0hhbmRsZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vY2xhc3Nlcy9jb250ZXh0TWVudUhhbmRsZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vc3ZnRGlhZ3JhbS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9ib3gvYm94LmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2NhcGFjaXRvci9jYXBhY2l0b3IuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvY29tcG9uZW50U3ltYm9sLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2Rpb2RlL2Rpb2RlLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2luZHVjdG9yL2luZHVjdG9yLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2pGZXRQL2pGZXRQLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL29wQW1wL29wQW1wLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL3Jlc2lzdG9yL3Jlc2lzdG9yLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL3NpbXBsZUNvbm5lY3Rvci9zaW1wbGVDb25uZWN0b3IuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvdHZzRGlvZGUvdHZzRGlvZGUuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9saWJyYXJ5SW5jbHVkZXMuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL0NvbXBvbmVudFBvcnQuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL0N5UGh5RGlhZ3JhbVBhcnNlci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvRGlhZ3JhbS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvRGlhZ3JhbUNvbXBvbmVudC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvRHVtbXlEaWFncmFtR2VuZXJhdG9yLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvZGlhZ3JhbVNlcnZpY2UvY2xhc3Nlcy9XaXJlLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvZGlhZ3JhbVNlcnZpY2UvZGlhZ3JhbVNlcnZpY2UuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9ncmlkU2VydmljZS9ncmlkU2VydmljZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL29wZXJhdGlvbnNNYW5hZ2VyL29wZXJhdGlvbnNNYW5hZ2VyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvc3ltYm9sU2VydmljZXMvc3ltYm9sU2VydmljZXMuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy93aXJpbmdTZXJ2aWNlL2NsYXNzZXMvRWxib3dSb3V0ZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy93aXJpbmdTZXJ2aWNlL2NsYXNzZXMvU2ltcGxlUm91dGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvd2lyaW5nU2VydmljZS93aXJpbmdTZXJ2aWNlLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9saWJyYXJ5SW5jbHVkZXMuanMnKTtcblxucmVxdWlyZSgnLi91dGlscy5qcycpO1xuXG5yZXF1aXJlKCcuL3NlcnZpY2VzL29wZXJhdGlvbnNNYW5hZ2VyL29wZXJhdGlvbnNNYW5hZ2VyLmpzJyk7XG5cbnJlcXVpcmUoJy4vc2VydmljZXMvZGlhZ3JhbVNlcnZpY2UvZGlhZ3JhbVNlcnZpY2UuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvZ3JpZFNlcnZpY2UvZ3JpZFNlcnZpY2UuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvd2lyaW5nU2VydmljZS93aXJpbmdTZXJ2aWNlLmpzJyk7XG5cbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9kaWFncmFtQ29udGFpbmVyL2RpYWdyYW1Db250YWluZXIuanMnKTtcbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9mYWJyaWNDYW52YXMvZmFicmljQ2FudmFzLmpzJyk7XG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvc3ZnRGlhZ3JhbS9zdmdEaWFncmFtLmpzJyk7XG5cbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9zeW1ib2xzL2NvbXBvbmVudFN5bWJvbC5qcycpO1xuXG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvcmVzaXppbmcvcmVzaXplVG9IZWlnaHQuanMnKTtcbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9yZXNpemluZy9yZXNpemVUb1dpbmRvdy5qcycpO1xuXG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvYnVzeUNvdmVyL2J1c3lDb3Zlci5qcycpO1xuXG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZGVzaWduRWRpdG9yL2Rlc2lnbkVkaXRvcicpO1xuXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG5cbiAgICAnZ21lLnNlcnZpY2VzJyxcblxuICAgICdpc2lzLnVpLmNvbXBvbmVudHMnLFxuXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnLFxuXG4gICAgLy8gYXBwIHNwZWNpZmljIHRlbXBsYXRlc1xuICAgICdjeXBoeS5tbXNBcHAudGVtcGxhdGVzJyxcblxuICAgICd1aS5ib290c3RyYXAnLFxuXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLm9wZXJhdGlvbnNNYW5hZ2VyJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ud2lyaW5nU2VydmljZScsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRpYWdyYW1TZXJ2aWNlJyxcblxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kaWFncmFtQ29udGFpbmVyJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZmFicmljQ2FudmFzJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ZnRGlhZ3JhbScsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMnLFxuICAgICdtbXMucmVzaXplVG9XaW5kb3cnLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5idXN5Q292ZXInLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kZXNpZ25FZGl0b3InLFxuXG4gICAgJ2FuZ3Vjb21wbGV0ZS1hbHQnLFxuICAgICduZ1RvdWNoJyxcblxuICAgICduZ01hdGVyaWFsJ1xuXSk7XG5cbkN5UGh5QXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG4gICAgdmFyIHNlbGVjdFByb2plY3Q7XG5cbiAgICBzZWxlY3RQcm9qZWN0ID0ge1xuICAgICAgICBsb2FkOiBmdW5jdGlvbiAoJHEsICRzdGF0ZVBhcmFtcywgJHJvb3RTY29wZSwgJHN0YXRlLCAkbG9nLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSwgd29ya3NwYWNlU2VydmljZSwgZGVzaWduU2VydmljZSwgJHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHZhclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICBkZWZlcnJlZDtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS5tYWluRGJDb25uZWN0aW9uSWQgPSAnbW1zLW1haW4tZGItY29ubmVjdGlvbi1pZCc7XG5cbiAgICAgICAgICAgIGNvbm5lY3Rpb25JZCA9ICRyb290U2NvcGUubWFpbkRiQ29ubmVjdGlvbklkO1xuICAgICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBkYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKGNvbm5lY3Rpb25JZCwge1xuICAgICAgICAgICAgICAgIGhvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoY29ubmVjdGlvbklkLCAkc3RhdGVQYXJhbXMucHJvamVjdElkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChwcm9qZWN0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnUHJvamVjdCBzZWxlY3RlZCcsIHByb2plY3RJZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5wcm9qZWN0SWQgPSBwcm9qZWN0SWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHdzQ29udGV4dDtcblxuXG4gICAgICAgICAgICAgICAgICAgIHdzQ29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRiOiAkcm9vdFNjb3BlLm1haW5EYkNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnV29ya1NwYWNlc18nICsgKCBuZXcgRGF0ZSgpIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMod3NDb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcih3c0NvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnV29ya1NwYWNlIHdhdGNoZXIgaW5pdGlhbGl6ZWQsIGRlc3Ryb3llZDonLCBkZXN0cm95ZWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVzdHJveWVkICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaFdvcmtzcGFjZXMod3NDb250ZXh0LGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvYWQnLCB1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZScsIHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5sb2FkJywgdXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGFzRm91bmRGaXJzdFdvcmtzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZvdW5kRmlyc3REZXNpZ247XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRm91bmRGaXJzdFdvcmtzcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGb3VuZEZpcnN0RGVzaWduID0gZmFsc2U7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YS53b3Jrc3BhY2VzLCBmdW5jdGlvbiAod29ya1NwYWNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaGFzRm91bmRGaXJzdFdvcmtzcGFjZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRm91bmRGaXJzdFdvcmtzcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5hY3RpdmVXb3JrU3BhY2UgPSB3b3JrU3BhY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnQWN0aXZlIHdvcmtzcGFjZTonLCAkcm9vdFNjb3BlLmFjdGl2ZVdvcmtTcGFjZSk7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYXNGb3VuZEZpcnN0V29ya3NwYWNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hEZXNpZ25zKHdzQ29udGV4dCwgJHJvb3RTY29wZS5hY3RpdmVXb3JrU3BhY2UuaWQsZnVuY3Rpb24gKC8qZGVzaWduc1VwZGF0ZU9iamVjdCovKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRlc2lnbnNEYXRhKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGVzaWduc0RhdGEuZGVzaWducywgZnVuY3Rpb24gKGRlc2lnbikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaGFzRm91bmRGaXJzdERlc2lnbikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGb3VuZEZpcnN0RGVzaWduID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuYWN0aXZlRGVzaWduID0gZGVzaWduO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnQWN0aXZlIGRlc2lnbjonLCAkcm9vdFNjb3BlLmFjdGl2ZURlc2lnbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYXNGb3VuZEZpcnN0RGVzaWduKSB7XG5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyh3c0NvbnRleHQsICRyb290U2NvcGUuYWN0aXZlRGVzaWduLmlkLCBmdW5jdGlvbihkZXNpZ25JbnRlcmZhY2VzVXBkYXRlT2JqZWN0KSB7XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGVzaWduSW50ZXJmYWNlcykge1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGVzaWduSW50ZXJmYWNlcyk7XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdDb3VsZCBub3QgZmluZCBkZXNpZ25zIGluIHdvcmtzcGFjZS4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCc0MDQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6ICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnQ291bGQgbm90IGZpbmQgd29ya3NwYWNlcyBpbiBwcm9qZWN0LicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCc0MDQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiAkc3RhdGVQYXJhbXMucHJvamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnV29rcnNwYWNlU2VydmljZSBkZXN0cm95ZWQuLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdPcGVuaW5nIHByb2plY3QgZXJyb3JlZDonLCAkc3RhdGVQYXJhbXMucHJvamVjdElkLCByZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJzQwNCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogJHN0YXRlUGFyYW1zLnByb2plY3RJZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL25vUHJvamVjdCcpO1xuXG5cbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2VkaXRvcicsIHtcbiAgICAgICAgICAgIHVybDogJy9lZGl0b3IvOnByb2plY3RJZCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2VkaXRvci5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHNlbGVjdFByb2plY3QsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRWRpdG9yVmlld0NvbnRyb2xsZXInXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnZWRpdG9yLmluQ29udGFpbmVyJywge1xuICAgICAgICAgICAgdXJsOiAnLzpjb250YWluZXJJZCdcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdub1Byb2plY3QnLCB7XG4gICAgICAgICAgICB1cmw6ICcvbm9Qcm9qZWN0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvbm9Qcm9qZWN0U3BlY2lmaWVkLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ05vUHJvamVjdENvbnRyb2xsZXInXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnNDA0Jywge1xuICAgICAgICAgICAgdXJsOiAnLzQwNC86cHJvamVjdElkJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdOb1Byb2plY3RDb250cm9sbGVyJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvNDA0Lmh0bWwnXG4gICAgICAgIH0pO1xufSk7XG5cbkN5UGh5QXBwLmNvbnRyb2xsZXIoJ01haW5OYXZpZ2F0b3JDb250cm9sbGVyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgJHdpbmRvdykge1xuXG4gICAgdmFyIGRlZmF1bHROYXZpZ2F0b3JJdGVtcztcblxuICAgIGRlZmF1bHROYXZpZ2F0b3JJdGVtcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdyb290JyxcbiAgICAgICAgICAgIGxhYmVsOiAnTWV0YU1vcnBob3NpcycsXG4gICAgICAgICAgICBpdGVtQ2xhc3M6ICdjeXBoeS1yb290J1xuICAgICAgICB9XG4gICAgXTtcblxuICAgICRzY29wZS5uYXZpZ2F0b3IgPSB7XG4gICAgICAgIHNlcGFyYXRvcjogdHJ1ZSxcbiAgICAgICAgaXRlbXM6IGFuZ3VsYXIuY29weShkZWZhdWx0TmF2aWdhdG9ySXRlbXMsIFtdKVxuICAgIH07XG5cbiAgICAkcm9vdFNjb3BlLiR3YXRjaCgncHJvamVjdElkJywgZnVuY3Rpb24gKHByb2plY3RJZCkge1xuXG4gICAgICAgIGlmIChwcm9qZWN0SWQpIHtcblxuICAgICAgICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IGFuZ3VsYXIuY29weShkZWZhdWx0TmF2aWdhdG9ySXRlbXMsIFtdKTtcbiAgICAgICAgICAgICRzY29wZS5uYXZpZ2F0b3IuaXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6ICdwcm9qZWN0JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogcHJvamVjdElkLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD0nICsgcHJvamVjdElkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IGFuZ3VsYXIuY29weShkZWZhdWx0TmF2aWdhdG9ySXRlbXMsIFtdKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdFZGl0b3JWaWV3Q29udHJvbGxlcicsIGZ1bmN0aW9uICgpIHtcblxufSk7XG5cbkN5UGh5QXBwLmNvbnRyb2xsZXIoJ05vUHJvamVjdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlLCAkc3RhdGVQYXJhbXMsICRodHRwLCAkbG9nLCAkc3RhdGUsIGdyb3dsKSB7XG5cbiAgICAkc2NvcGUucHJvamVjdElkID0gJHN0YXRlUGFyYW1zLnByb2plY3RJZDtcbiAgICAkc2NvcGUuZXJyb3JlZCA9IGZhbHNlO1xuXG4gICAgJHNjb3BlLnN0YXJ0TmV3UHJvamVjdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAkcm9vdFNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXG4gICAgICAgICRsb2cuZGVidWcoJ05ldyBwcm9qZWN0IGNyZWF0aW9uJyk7XG5cbiAgICAgICAgJGh0dHAuZ2V0KCcvcmVzdC9leHRlcm5hbC9jb3B5cHJvamVjdC9ub3JlZGlyZWN0JylcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgIHN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgICRyb290U2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ05ldyBwcm9qZWN0IGNyZWF0aW9uIHN1Y2Nlc3NmdWwnLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2VkaXRvcicsIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiBkYXRhXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICBlcnJvcihmdW5jdGlvbiAoZGF0YSwgc3RhdHVzKSB7XG5cbiAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdOZXcgcHJvamVjdCBjcmVhdGlvbiBmYWlsZWQnLCBzdGF0dXMpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdBbiBlcnJvciBvY2N1cmVkIHdoaWxlIHByb2plY3QgY3JlYXRpb24uIFBsZWFzZSByZXRyeSBsYXRlci4nKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTtcbiIsIi8vIEFycmF5LnByb3RvdHlwZS5maW5kIC0gTUlUIExpY2Vuc2UgKGMpIDIwMTMgUGF1bCBNaWxsZXIgPGh0dHA6Ly9wYXVsbWlsbHIuY29tPlxuLy8gRm9yIGFsbCBkZXRhaWxzIGFuZCBkb2NzOiBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2FycmF5LnByb3RvdHlwZS5maW5kXG4vLyBGaXhlcyBhbmQgdGVzdHMgc3VwcGxpZWQgYnkgRHVuY2FuIEhhbGwgPGh0dHA6Ly9kdW5jYW5oYWxsLm5ldD4gXG4oZnVuY3Rpb24oZ2xvYmFscyl7XG4gIGlmIChBcnJheS5wcm90b3R5cGUuZmluZCkgcmV0dXJuO1xuXG4gIHZhciBmaW5kID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgdmFyIGxpc3QgPSBPYmplY3QodGhpcyk7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoIDwgMCA/IDAgOiBsaXN0Lmxlbmd0aCA+Pj4gMDsgLy8gRVMuVG9VaW50MzI7XG4gICAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJyB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJlZGljYXRlKSAhPT0gJ1tvYmplY3QgRnVuY3Rpb25dJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkjZmluZDogcHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICBmb3IgKHZhciBpID0gMCwgdmFsdWU7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9O1xuXG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHtcbiAgICB0cnkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgJ2ZpbmQnLCB7XG4gICAgICAgIHZhbHVlOiBmaW5kLCBjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuZmluZCkge1xuICAgIEFycmF5LnByb3RvdHlwZS5maW5kID0gZmluZDtcbiAgfVxufSkodGhpcyk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgZ2wtbWF0cml4IC0gSGlnaCBwZXJmb3JtYW5jZSBtYXRyaXggYW5kIHZlY3RvciBvcGVyYXRpb25zXG4gKiBAYXV0aG9yIEJyYW5kb24gSm9uZXNcbiAqIEBhdXRob3IgQ29saW4gTWFjS2VuemllIElWXG4gKiBAdmVyc2lvbiAyLjIuMVxuICovXG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cbihmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD17fTt0eXBlb2YgZXhwb3J0cz09XCJ1bmRlZmluZWRcIj90eXBlb2YgZGVmaW5lPT1cImZ1bmN0aW9uXCImJnR5cGVvZiBkZWZpbmUuYW1kPT1cIm9iamVjdFwiJiZkZWZpbmUuYW1kPyh0LmV4cG9ydHM9e30sZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIHQuZXhwb3J0c30pKTp0LmV4cG9ydHM9dHlwZW9mIHdpbmRvdyE9XCJ1bmRlZmluZWRcIj93aW5kb3c6ZTp0LmV4cG9ydHM9ZXhwb3J0cyxmdW5jdGlvbihlKXtpZighdCl2YXIgdD0xZS02O2lmKCFuKXZhciBuPXR5cGVvZiBGbG9hdDMyQXJyYXkhPVwidW5kZWZpbmVkXCI/RmxvYXQzMkFycmF5OkFycmF5O2lmKCFyKXZhciByPU1hdGgucmFuZG9tO3ZhciBpPXt9O2kuc2V0TWF0cml4QXJyYXlUeXBlPWZ1bmN0aW9uKGUpe249ZX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLmdsTWF0cml4PWkpO3ZhciBzPU1hdGguUEkvMTgwO2kudG9SYWRpYW49ZnVuY3Rpb24oZSl7cmV0dXJuIGUqc307dmFyIG89e307by5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigyKTtyZXR1cm4gZVswXT0wLGVbMV09MCxlfSxvLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDIpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHR9LG8uZnJvbVZhbHVlcz1mdW5jdGlvbihlLHQpe3ZhciByPW5ldyBuKDIpO3JldHVybiByWzBdPWUsclsxXT10LHJ9LG8uY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGV9LG8uc2V0PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10LGVbMV09bixlfSxvLmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGV9LG8uc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlfSxvLnN1Yj1vLnN1YnRyYWN0LG8ubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlfSxvLm11bD1vLm11bHRpcGx5LG8uZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZX0sby5kaXY9by5kaXZpZGUsby5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGV9LG8ubWF4PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1heCh0WzBdLG5bMF0pLGVbMV09TWF0aC5tYXgodFsxXSxuWzFdKSxlfSxvLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm4sZVsxXT10WzFdKm4sZX0sby5zY2FsZUFuZEFkZD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10WzBdK25bMF0qcixlWzFdPXRbMV0rblsxXSpyLGV9LG8uZGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV07cmV0dXJuIE1hdGguc3FydChuKm4rcipyKX0sby5kaXN0PW8uZGlzdGFuY2Usby5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV07cmV0dXJuIG4qbityKnJ9LG8uc3FyRGlzdD1vLnNxdWFyZWREaXN0YW5jZSxvLmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXTtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtuKm4pfSxvLmxlbj1vLmxlbmd0aCxvLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV07cmV0dXJuIHQqdCtuKm59LG8uc3FyTGVuPW8uc3F1YXJlZExlbmd0aCxvLm5lZ2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZX0sby5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPW4qbityKnI7cmV0dXJuIGk+MCYmKGk9MS9NYXRoLnNxcnQoaSksZVswXT10WzBdKmksZVsxXT10WzFdKmkpLGV9LG8uZG90PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0qdFswXStlWzFdKnRbMV19LG8uY3Jvc3M9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0qblsxXS10WzFdKm5bMF07cmV0dXJuIGVbMF09ZVsxXT0wLGVbMl09cixlfSxvLmxlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV07cmV0dXJuIGVbMF09aStyKihuWzBdLWkpLGVbMV09cytyKihuWzFdLXMpLGV9LG8ucmFuZG9tPWZ1bmN0aW9uKGUsdCl7dD10fHwxO3ZhciBuPXIoKSoyKk1hdGguUEk7cmV0dXJuIGVbMF09TWF0aC5jb3MobikqdCxlWzFdPU1hdGguc2luKG4pKnQsZX0sby50cmFuc2Zvcm1NYXQyPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblsyXSppLGVbMV09blsxXSpyK25bM10qaSxlfSxvLnRyYW5zZm9ybU1hdDJkPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblsyXSppK25bNF0sZVsxXT1uWzFdKnIrblszXSppK25bNV0sZX0sby50cmFuc2Zvcm1NYXQzPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblszXSppK25bNl0sZVsxXT1uWzFdKnIrbls0XSppK25bN10sZX0sby50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bMTJdLGVbMV09blsxXSpyK25bNV0qaStuWzEzXSxlfSxvLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT1vLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj0yKSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdO3JldHVybiB0fX0oKSxvLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzIoXCIrZVswXStcIiwgXCIrZVsxXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzI9byk7dmFyIHU9e307dS5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigzKTtyZXR1cm4gZVswXT0wLGVbMV09MCxlWzJdPTAsZX0sdS5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbigzKTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdH0sdS5mcm9tVmFsdWVzPWZ1bmN0aW9uKGUsdCxyKXt2YXIgaT1uZXcgbigzKTtyZXR1cm4gaVswXT1lLGlbMV09dCxpWzJdPXIsaX0sdS5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGV9LHUuc2V0PWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXQsZVsxXT1uLGVbMl09cixlfSx1LmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGVbMl09dFsyXStuWzJdLGV9LHUuc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlWzJdPXRbMl0tblsyXSxlfSx1LnN1Yj11LnN1YnRyYWN0LHUubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlWzJdPXRbMl0qblsyXSxlfSx1Lm11bD11Lm11bHRpcGx5LHUuZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZVsyXT10WzJdL25bMl0sZX0sdS5kaXY9dS5kaXZpZGUsdS5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGVbMl09TWF0aC5taW4odFsyXSxuWzJdKSxlfSx1Lm1heD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5tYXgodFswXSxuWzBdKSxlWzFdPU1hdGgubWF4KHRbMV0sblsxXSksZVsyXT1NYXRoLm1heCh0WzJdLG5bMl0pLGV9LHUuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qbixlWzFdPXRbMV0qbixlWzJdPXRbMl0qbixlfSx1LnNjYWxlQW5kQWRkPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXRbMF0rblswXSpyLGVbMV09dFsxXStuWzFdKnIsZVsyXT10WzJdK25bMl0qcixlfSx1LmRpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdO3JldHVybiBNYXRoLnNxcnQobipuK3IqcitpKmkpfSx1LmRpc3Q9dS5kaXN0YW5jZSx1LnNxdWFyZWREaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXSxpPXRbMl0tZVsyXTtyZXR1cm4gbipuK3IqcitpKml9LHUuc3FyRGlzdD11LnNxdWFyZWREaXN0YW5jZSx1Lmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl07cmV0dXJuIE1hdGguc3FydCh0KnQrbipuK3Iqcil9LHUubGVuPXUubGVuZ3RoLHUuc3F1YXJlZExlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl07cmV0dXJuIHQqdCtuKm4rcipyfSx1LnNxckxlbj11LnNxdWFyZWRMZW5ndGgsdS5uZWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZX0sdS5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz1uKm4rcipyK2kqaTtyZXR1cm4gcz4wJiYocz0xL01hdGguc3FydChzKSxlWzBdPXRbMF0qcyxlWzFdPXRbMV0qcyxlWzJdPXRbMl0qcyksZX0sdS5kb3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXSp0WzBdK2VbMV0qdFsxXStlWzJdKnRbMl19LHUuY3Jvc3M9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPW5bMF0sdT1uWzFdLGE9blsyXTtyZXR1cm4gZVswXT1pKmEtcyp1LGVbMV09cypvLXIqYSxlWzJdPXIqdS1pKm8sZX0sdS5sZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXTtyZXR1cm4gZVswXT1pK3IqKG5bMF0taSksZVsxXT1zK3IqKG5bMV0tcyksZVsyXT1vK3IqKG5bMl0tbyksZX0sdS5yYW5kb209ZnVuY3Rpb24oZSx0KXt0PXR8fDE7dmFyIG49cigpKjIqTWF0aC5QSSxpPXIoKSoyLTEscz1NYXRoLnNxcnQoMS1pKmkpKnQ7cmV0dXJuIGVbMF09TWF0aC5jb3MobikqcyxlWzFdPU1hdGguc2luKG4pKnMsZVsyXT1pKnQsZX0sdS50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl07cmV0dXJuIGVbMF09blswXSpyK25bNF0qaStuWzhdKnMrblsxMl0sZVsxXT1uWzFdKnIrbls1XSppK25bOV0qcytuWzEzXSxlWzJdPW5bMl0qcituWzZdKmkrblsxMF0qcytuWzE0XSxlfSx1LnRyYW5zZm9ybU1hdDM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXTtyZXR1cm4gZVswXT1yKm5bMF0raSpuWzNdK3Mqbls2XSxlWzFdPXIqblsxXStpKm5bNF0rcypuWzddLGVbMl09cipuWzJdK2kqbls1XStzKm5bOF0sZX0sdS50cmFuc2Zvcm1RdWF0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz1uWzBdLHU9blsxXSxhPW5bMl0sZj1uWzNdLGw9ZipyK3Uqcy1hKmksYz1mKmkrYSpyLW8qcyxoPWYqcytvKmktdSpyLHA9LW8qci11KmktYSpzO3JldHVybiBlWzBdPWwqZitwKi1vK2MqLWEtaCotdSxlWzFdPWMqZitwKi11K2gqLW8tbCotYSxlWzJdPWgqZitwKi1hK2wqLXUtYyotbyxlfSx1LnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9W10scz1bXTtyZXR1cm4gaVswXT10WzBdLW5bMF0saVsxXT10WzFdLW5bMV0saVsyXT10WzJdLW5bMl0sc1swXT1pWzBdLHNbMV09aVsxXSpNYXRoLmNvcyhyKS1pWzJdKk1hdGguc2luKHIpLHNbMl09aVsxXSpNYXRoLnNpbihyKStpWzJdKk1hdGguY29zKHIpLGVbMF09c1swXStuWzBdLGVbMV09c1sxXStuWzFdLGVbMl09c1syXStuWzJdLGV9LHUucm90YXRlWT1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT1bXSxzPVtdO3JldHVybiBpWzBdPXRbMF0tblswXSxpWzFdPXRbMV0tblsxXSxpWzJdPXRbMl0tblsyXSxzWzBdPWlbMl0qTWF0aC5zaW4ocikraVswXSpNYXRoLmNvcyhyKSxzWzFdPWlbMV0sc1syXT1pWzJdKk1hdGguY29zKHIpLWlbMF0qTWF0aC5zaW4ociksZVswXT1zWzBdK25bMF0sZVsxXT1zWzFdK25bMV0sZVsyXT1zWzJdK25bMl0sZX0sdS5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPVtdLHM9W107cmV0dXJuIGlbMF09dFswXS1uWzBdLGlbMV09dFsxXS1uWzFdLGlbMl09dFsyXS1uWzJdLHNbMF09aVswXSpNYXRoLmNvcyhyKS1pWzFdKk1hdGguc2luKHIpLHNbMV09aVswXSpNYXRoLnNpbihyKStpWzFdKk1hdGguY29zKHIpLHNbMl09aVsyXSxlWzBdPXNbMF0rblswXSxlWzFdPXNbMV0rblsxXSxlWzJdPXNbMl0rblsyXSxlfSx1LmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT11LmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj0zKSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0sZVsyXT10W3UrMl0scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdLHRbdSsyXT1lWzJdO3JldHVybiB0fX0oKSx1LnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzMoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzM9dSk7dmFyIGE9e307YS5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig0KTtyZXR1cm4gZVswXT0wLGVbMV09MCxlWzJdPTAsZVszXT0wLGV9LGEuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNCk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0fSxhLmZyb21WYWx1ZXM9ZnVuY3Rpb24oZSx0LHIsaSl7dmFyIHM9bmV3IG4oNCk7cmV0dXJuIHNbMF09ZSxzWzFdPXQsc1syXT1yLHNbM109aSxzfSxhLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGV9LGEuc2V0PWZ1bmN0aW9uKGUsdCxuLHIsaSl7cmV0dXJuIGVbMF09dCxlWzFdPW4sZVsyXT1yLGVbM109aSxlfSxhLmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGVbMl09dFsyXStuWzJdLGVbM109dFszXStuWzNdLGV9LGEuc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlWzJdPXRbMl0tblsyXSxlWzNdPXRbM10tblszXSxlfSxhLnN1Yj1hLnN1YnRyYWN0LGEubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlWzJdPXRbMl0qblsyXSxlWzNdPXRbM10qblszXSxlfSxhLm11bD1hLm11bHRpcGx5LGEuZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZVsyXT10WzJdL25bMl0sZVszXT10WzNdL25bM10sZX0sYS5kaXY9YS5kaXZpZGUsYS5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGVbMl09TWF0aC5taW4odFsyXSxuWzJdKSxlWzNdPU1hdGgubWluKHRbM10sblszXSksZX0sYS5tYXg9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWF4KHRbMF0sblswXSksZVsxXT1NYXRoLm1heCh0WzFdLG5bMV0pLGVbMl09TWF0aC5tYXgodFsyXSxuWzJdKSxlWzNdPU1hdGgubWF4KHRbM10sblszXSksZX0sYS5zY2FsZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuLGVbMV09dFsxXSpuLGVbMl09dFsyXSpuLGVbM109dFszXSpuLGV9LGEuc2NhbGVBbmRBZGQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dFswXStuWzBdKnIsZVsxXT10WzFdK25bMV0qcixlWzJdPXRbMl0rblsyXSpyLGVbM109dFszXStuWzNdKnIsZX0sYS5kaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXSxpPXRbMl0tZVsyXSxzPXRbM10tZVszXTtyZXR1cm4gTWF0aC5zcXJ0KG4qbityKnIraSppK3Mqcyl9LGEuZGlzdD1hLmRpc3RhbmNlLGEuc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdLHM9dFszXS1lWzNdO3JldHVybiBuKm4rcipyK2kqaStzKnN9LGEuc3FyRGlzdD1hLnNxdWFyZWREaXN0YW5jZSxhLmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl0saT1lWzNdO3JldHVybiBNYXRoLnNxcnQodCp0K24qbityKnIraSppKX0sYS5sZW49YS5sZW5ndGgsYS5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM107cmV0dXJuIHQqdCtuKm4rcipyK2kqaX0sYS5zcXJMZW49YS5zcXVhcmVkTGVuZ3RoLGEubmVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGVbM109LXRbM10sZX0sYS5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bipuK3IqcitpKmkrcypzO3JldHVybiBvPjAmJihvPTEvTWF0aC5zcXJ0KG8pLGVbMF09dFswXSpvLGVbMV09dFsxXSpvLGVbMl09dFsyXSpvLGVbM109dFszXSpvKSxlfSxhLmRvdD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdKnRbMF0rZVsxXSp0WzFdK2VbMl0qdFsyXStlWzNdKnRbM119LGEubGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXSxvPXRbMl0sdT10WzNdO3JldHVybiBlWzBdPWkrciooblswXS1pKSxlWzFdPXMrciooblsxXS1zKSxlWzJdPW8rciooblsyXS1vKSxlWzNdPXUrciooblszXS11KSxlfSxhLnJhbmRvbT1mdW5jdGlvbihlLHQpe3JldHVybiB0PXR8fDEsZVswXT1yKCksZVsxXT1yKCksZVsyXT1yKCksZVszXT1yKCksYS5ub3JtYWxpemUoZSxlKSxhLnNjYWxlKGUsZSx0KSxlfSxhLnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM107cmV0dXJuIGVbMF09blswXSpyK25bNF0qaStuWzhdKnMrblsxMl0qbyxlWzFdPW5bMV0qcituWzVdKmkrbls5XSpzK25bMTNdKm8sZVsyXT1uWzJdKnIrbls2XSppK25bMTBdKnMrblsxNF0qbyxlWzNdPW5bM10qcituWzddKmkrblsxMV0qcytuWzE1XSpvLGV9LGEudHJhbnNmb3JtUXVhdD1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89blswXSx1PW5bMV0sYT1uWzJdLGY9blszXSxsPWYqcit1KnMtYSppLGM9ZippK2Eqci1vKnMsaD1mKnMrbyppLXUqcixwPS1vKnItdSppLWEqcztyZXR1cm4gZVswXT1sKmYrcCotbytjKi1hLWgqLXUsZVsxXT1jKmYrcCotdStoKi1vLWwqLWEsZVsyXT1oKmYrcCotYStsKi11LWMqLW8sZX0sYS5mb3JFYWNoPWZ1bmN0aW9uKCl7dmFyIGU9YS5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24odCxuLHIsaSxzLG8pe3ZhciB1LGE7bnx8KG49NCkscnx8KHI9MCksaT9hPU1hdGgubWluKGkqbityLHQubGVuZ3RoKTphPXQubGVuZ3RoO2Zvcih1PXI7dTxhO3UrPW4pZVswXT10W3VdLGVbMV09dFt1KzFdLGVbMl09dFt1KzJdLGVbM109dFt1KzNdLHMoZSxlLG8pLHRbdV09ZVswXSx0W3UrMV09ZVsxXSx0W3UrMl09ZVsyXSx0W3UrM109ZVszXTtyZXR1cm4gdH19KCksYS5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJ2ZWM0KFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIpXCJ9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS52ZWM0PWEpO3ZhciBmPXt9O2YuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNCk7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxmLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDQpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdH0sZi5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlfSxmLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0sZi50cmFuc3Bvc2U9ZnVuY3Rpb24oZSx0KXtpZihlPT09dCl7dmFyIG49dFsxXTtlWzFdPXRbMl0sZVsyXT1ufWVsc2UgZVswXT10WzBdLGVbMV09dFsyXSxlWzJdPXRbMV0sZVszXT10WzNdO3JldHVybiBlfSxmLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKnMtaSpyO3JldHVybiBvPyhvPTEvbyxlWzBdPXMqbyxlWzFdPS1yKm8sZVsyXT0taSpvLGVbM109bipvLGUpOm51bGx9LGYuYWRqb2ludD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF07cmV0dXJuIGVbMF09dFszXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZVszXT1uLGV9LGYuZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF0qZVszXS1lWzJdKmVbMV19LGYubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXSxmPW5bMl0sbD1uWzNdO3JldHVybiBlWzBdPXIqdStzKmEsZVsxXT1pKnUrbyphLGVbMl09cipmK3MqbCxlWzNdPWkqZitvKmwsZX0sZi5tdWw9Zi5tdWx0aXBseSxmLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK3MqdSxlWzFdPWkqYStvKnUsZVsyXT1yKi11K3MqYSxlWzNdPWkqLXUrbyphLGV9LGYuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXTtyZXR1cm4gZVswXT1yKnUsZVsxXT1pKnUsZVsyXT1zKmEsZVszXT1vKmEsZX0sZi5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQyKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIpXCJ9LGYuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikpfSxmLkxEVT1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVsyXT1yWzJdL3JbMF0sblswXT1yWzBdLG5bMV09clsxXSxuWzNdPXJbM10tZVsyXSpuWzFdLFtlLHQsbl19LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQyPWYpO3ZhciBsPXt9O2wuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNik7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlWzRdPTAsZVs1XT0wLGV9LGwuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNik7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzRdPWVbNF0sdFs1XT1lWzVdLHR9LGwuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlfSxsLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTEsZVs0XT0wLGVbNV09MCxlfSxsLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPW4qcy1yKmk7cmV0dXJuIGE/KGE9MS9hLGVbMF09cyphLGVbMV09LXIqYSxlWzJdPS1pKmEsZVszXT1uKmEsZVs0XT0oaSp1LXMqbykqYSxlWzVdPShyKm8tbip1KSphLGUpOm51bGx9LGwuZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF0qZVszXS1lWzFdKmVbMl19LGwubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPW5bMF0sbD1uWzFdLGM9blsyXSxoPW5bM10scD1uWzRdLGQ9bls1XTtyZXR1cm4gZVswXT1yKmYrcypsLGVbMV09aSpmK28qbCxlWzJdPXIqYytzKmgsZVszXT1pKmMrbypoLGVbNF09cipwK3MqZCt1LGVbNV09aSpwK28qZCthLGV9LGwubXVsPWwubXVsdGlwbHksbC5yb3RhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPU1hdGguc2luKG4pLGw9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09cipsK3MqZixlWzFdPWkqbCtvKmYsZVsyXT1yKi1mK3MqbCxlWzNdPWkqLWYrbypsLGVbNF09dSxlWzVdPWEsZX0sbC5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV07cmV0dXJuIGVbMF09cipmLGVbMV09aSpmLGVbMl09cypsLGVbM109bypsLGVbNF09dSxlWzVdPWEsZX0sbC50cmFuc2xhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPW5bMF0sbD1uWzFdO3JldHVybiBlWzBdPXIsZVsxXT1pLGVbMl09cyxlWzNdPW8sZVs0XT1yKmYrcypsK3UsZVs1XT1pKmYrbypsK2EsZX0sbC5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQyZChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiLCBcIitlWzRdK1wiLCBcIitlWzVdK1wiKVwifSxsLmZyb2I9ZnVuY3Rpb24oZSl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhlWzBdLDIpK01hdGgucG93KGVbMV0sMikrTWF0aC5wb3coZVsyXSwyKStNYXRoLnBvdyhlWzNdLDIpK01hdGgucG93KGVbNF0sMikrTWF0aC5wb3coZVs1XSwyKSsxKX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDJkPWwpO3ZhciBjPXt9O2MuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oOSk7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTEsZVs1XT0wLGVbNl09MCxlWzddPTAsZVs4XT0xLGV9LGMuZnJvbU1hdDQ9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzRdLGVbNF09dFs1XSxlWzVdPXRbNl0sZVs2XT10WzhdLGVbN109dFs5XSxlWzhdPXRbMTBdLGV9LGMuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oOSk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzRdPWVbNF0sdFs1XT1lWzVdLHRbNl09ZVs2XSx0WzddPWVbN10sdFs4XT1lWzhdLHR9LGMuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlfSxjLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0xLGVbNV09MCxlWzZdPTAsZVs3XT0wLGVbOF09MSxlfSxjLnRyYW5zcG9zZT1mdW5jdGlvbihlLHQpe2lmKGU9PT10KXt2YXIgbj10WzFdLHI9dFsyXSxpPXRbNV07ZVsxXT10WzNdLGVbMl09dFs2XSxlWzNdPW4sZVs1XT10WzddLGVbNl09cixlWzddPWl9ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzNdLGVbMl09dFs2XSxlWzNdPXRbMV0sZVs0XT10WzRdLGVbNV09dFs3XSxlWzZdPXRbMl0sZVs3XT10WzVdLGVbOF09dFs4XTtyZXR1cm4gZX0sYy5pbnZlcnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz1sKm8tdSpmLGg9LWwqcyt1KmEscD1mKnMtbyphLGQ9bipjK3IqaCtpKnA7cmV0dXJuIGQ/KGQ9MS9kLGVbMF09YypkLGVbMV09KC1sKnIraSpmKSpkLGVbMl09KHUqci1pKm8pKmQsZVszXT1oKmQsZVs0XT0obCpuLWkqYSkqZCxlWzVdPSgtdSpuK2kqcykqZCxlWzZdPXAqZCxlWzddPSgtZipuK3IqYSkqZCxlWzhdPShvKm4tcipzKSpkLGUpOm51bGx9LGMuYWRqb2ludD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XTtyZXR1cm4gZVswXT1vKmwtdSpmLGVbMV09aSpmLXIqbCxlWzJdPXIqdS1pKm8sZVszXT11KmEtcypsLGVbNF09bipsLWkqYSxlWzVdPWkqcy1uKnUsZVs2XT1zKmYtbyphLGVbN109ciphLW4qZixlWzhdPW4qby1yKnMsZX0sYy5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl0saT1lWzNdLHM9ZVs0XSxvPWVbNV0sdT1lWzZdLGE9ZVs3XSxmPWVbOF07cmV0dXJuIHQqKGYqcy1vKmEpK24qKC1mKmkrbyp1KStyKihhKmktcyp1KX0sYy5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9blswXSxwPW5bMV0sZD1uWzJdLHY9blszXSxtPW5bNF0sZz1uWzVdLHk9bls2XSxiPW5bN10sdz1uWzhdO3JldHVybiBlWzBdPWgqcitwKm8rZCpmLGVbMV09aCppK3AqdStkKmwsZVsyXT1oKnMrcCphK2QqYyxlWzNdPXYqcittKm8rZypmLGVbNF09dippK20qdStnKmwsZVs1XT12KnMrbSphK2cqYyxlWzZdPXkqcitiKm8rdypmLGVbN109eSppK2IqdSt3KmwsZVs4XT15KnMrYiphK3cqYyxlfSxjLm11bD1jLm11bHRpcGx5LGMudHJhbnNsYXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD1uWzBdLHA9blsxXTtyZXR1cm4gZVswXT1yLGVbMV09aSxlWzJdPXMsZVszXT1vLGVbNF09dSxlWzVdPWEsZVs2XT1oKnIrcCpvK2YsZVs3XT1oKmkrcCp1K2wsZVs4XT1oKnMrcCphK2MsZX0sYy5yb3RhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPU1hdGguc2luKG4pLHA9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09cCpyK2gqbyxlWzFdPXAqaStoKnUsZVsyXT1wKnMraCphLGVbM109cCpvLWgqcixlWzRdPXAqdS1oKmksZVs1XT1wKmEtaCpzLGVbNl09ZixlWzddPWwsZVs4XT1jLGV9LGMuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPW5bMF0saT1uWzFdO3JldHVybiBlWzBdPXIqdFswXSxlWzFdPXIqdFsxXSxlWzJdPXIqdFsyXSxlWzNdPWkqdFszXSxlWzRdPWkqdFs0XSxlWzVdPWkqdFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlfSxjLmZyb21NYXQyZD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09MCxlWzNdPXRbMl0sZVs0XT10WzNdLGVbNV09MCxlWzZdPXRbNF0sZVs3XT10WzVdLGVbOF09MSxlfSxjLmZyb21RdWF0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4rbix1PXIrcixhPWkraSxmPW4qbyxsPXIqbyxjPXIqdSxoPWkqbyxwPWkqdSxkPWkqYSx2PXMqbyxtPXMqdSxnPXMqYTtyZXR1cm4gZVswXT0xLWMtZCxlWzNdPWwtZyxlWzZdPWgrbSxlWzFdPWwrZyxlWzRdPTEtZi1kLGVbN109cC12LGVbMl09aC1tLGVbNV09cCt2LGVbOF09MS1mLWMsZX0sYy5ub3JtYWxGcm9tTWF0ND1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPXRbOV0saD10WzEwXSxwPXRbMTFdLGQ9dFsxMl0sdj10WzEzXSxtPXRbMTRdLGc9dFsxNV0seT1uKnUtcipvLGI9biphLWkqbyx3PW4qZi1zKm8sRT1yKmEtaSp1LFM9cipmLXMqdSx4PWkqZi1zKmEsVD1sKnYtYypkLE49bCptLWgqZCxDPWwqZy1wKmQsaz1jKm0taCp2LEw9YypnLXAqdixBPWgqZy1wKm0sTz15KkEtYipMK3cqaytFKkMtUypOK3gqVDtyZXR1cm4gTz8oTz0xL08sZVswXT0odSpBLWEqTCtmKmspKk8sZVsxXT0oYSpDLW8qQS1mKk4pKk8sZVsyXT0obypMLXUqQytmKlQpKk8sZVszXT0oaSpMLXIqQS1zKmspKk8sZVs0XT0obipBLWkqQytzKk4pKk8sZVs1XT0ocipDLW4qTC1zKlQpKk8sZVs2XT0odip4LW0qUytnKkUpKk8sZVs3XT0obSp3LWQqeC1nKmIpKk8sZVs4XT0oZCpTLXYqdytnKnkpKk8sZSk6bnVsbH0sYy5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQzKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIsIFwiK2VbNl0rXCIsIFwiK2VbN10rXCIsIFwiK2VbOF0rXCIpXCJ9LGMuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs3XSwyKStNYXRoLnBvdyhlWzhdLDIpKX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDM9Yyk7dmFyIGg9e307aC5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigxNik7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTAsZVs1XT0xLGVbNl09MCxlWzddPTAsZVs4XT0wLGVbOV09MCxlWzEwXT0xLGVbMTFdPTAsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTAsZVsxNV09MSxlfSxoLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDE2KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdFs2XT1lWzZdLHRbN109ZVs3XSx0WzhdPWVbOF0sdFs5XT1lWzldLHRbMTBdPWVbMTBdLHRbMTFdPWVbMTFdLHRbMTJdPWVbMTJdLHRbMTNdPWVbMTNdLHRbMTRdPWVbMTRdLHRbMTVdPWVbMTVdLHR9LGguY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlWzldPXRbOV0sZVsxMF09dFsxMF0sZVsxMV09dFsxMV0sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0sZX0saC5pZGVudGl0eT1mdW5jdGlvbihlKXtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPTEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTEsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGgudHJhbnNwb3NlPWZ1bmN0aW9uKGUsdCl7aWYoZT09PXQpe3ZhciBuPXRbMV0scj10WzJdLGk9dFszXSxzPXRbNl0sbz10WzddLHU9dFsxMV07ZVsxXT10WzRdLGVbMl09dFs4XSxlWzNdPXRbMTJdLGVbNF09bixlWzZdPXRbOV0sZVs3XT10WzEzXSxlWzhdPXIsZVs5XT1zLGVbMTFdPXRbMTRdLGVbMTJdPWksZVsxM109byxlWzE0XT11fWVsc2UgZVswXT10WzBdLGVbMV09dFs0XSxlWzJdPXRbOF0sZVszXT10WzEyXSxlWzRdPXRbMV0sZVs1XT10WzVdLGVbNl09dFs5XSxlWzddPXRbMTNdLGVbOF09dFsyXSxlWzldPXRbNl0sZVsxMF09dFsxMF0sZVsxMV09dFsxNF0sZVsxMl09dFszXSxlWzEzXT10WzddLGVbMTRdPXRbMTFdLGVbMTVdPXRbMTVdO3JldHVybiBlfSxoLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPXRbOV0saD10WzEwXSxwPXRbMTFdLGQ9dFsxMl0sdj10WzEzXSxtPXRbMTRdLGc9dFsxNV0seT1uKnUtcipvLGI9biphLWkqbyx3PW4qZi1zKm8sRT1yKmEtaSp1LFM9cipmLXMqdSx4PWkqZi1zKmEsVD1sKnYtYypkLE49bCptLWgqZCxDPWwqZy1wKmQsaz1jKm0taCp2LEw9YypnLXAqdixBPWgqZy1wKm0sTz15KkEtYipMK3cqaytFKkMtUypOK3gqVDtyZXR1cm4gTz8oTz0xL08sZVswXT0odSpBLWEqTCtmKmspKk8sZVsxXT0oaSpMLXIqQS1zKmspKk8sZVsyXT0odip4LW0qUytnKkUpKk8sZVszXT0oaCpTLWMqeC1wKkUpKk8sZVs0XT0oYSpDLW8qQS1mKk4pKk8sZVs1XT0obipBLWkqQytzKk4pKk8sZVs2XT0obSp3LWQqeC1nKmIpKk8sZVs3XT0obCp4LWgqdytwKmIpKk8sZVs4XT0obypMLXUqQytmKlQpKk8sZVs5XT0ocipDLW4qTC1zKlQpKk8sZVsxMF09KGQqUy12KncrZyp5KSpPLGVbMTFdPShjKnctbCpTLXAqeSkqTyxlWzEyXT0odSpOLW8qay1hKlQpKk8sZVsxM109KG4qay1yKk4raSpUKSpPLGVbMTRdPSh2KmItZCpFLW0qeSkqTyxlWzE1XT0obCpFLWMqYitoKnkpKk8sZSk6bnVsbH0saC5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XTtyZXR1cm4gZVswXT11KihoKmctcCptKS1jKihhKmctZiptKSt2KihhKnAtZipoKSxlWzFdPS0ociooaCpnLXAqbSktYyooaSpnLXMqbSkrdiooaSpwLXMqaCkpLGVbMl09ciooYSpnLWYqbSktdSooaSpnLXMqbSkrdiooaSpmLXMqYSksZVszXT0tKHIqKGEqcC1mKmgpLXUqKGkqcC1zKmgpK2MqKGkqZi1zKmEpKSxlWzRdPS0obyooaCpnLXAqbSktbCooYSpnLWYqbSkrZCooYSpwLWYqaCkpLGVbNV09biooaCpnLXAqbSktbCooaSpnLXMqbSkrZCooaSpwLXMqaCksZVs2XT0tKG4qKGEqZy1mKm0pLW8qKGkqZy1zKm0pK2QqKGkqZi1zKmEpKSxlWzddPW4qKGEqcC1mKmgpLW8qKGkqcC1zKmgpK2wqKGkqZi1zKmEpLGVbOF09byooYypnLXAqdiktbCoodSpnLWYqdikrZCoodSpwLWYqYyksZVs5XT0tKG4qKGMqZy1wKnYpLWwqKHIqZy1zKnYpK2QqKHIqcC1zKmMpKSxlWzEwXT1uKih1KmctZip2KS1vKihyKmctcyp2KStkKihyKmYtcyp1KSxlWzExXT0tKG4qKHUqcC1mKmMpLW8qKHIqcC1zKmMpK2wqKHIqZi1zKnUpKSxlWzEyXT0tKG8qKGMqbS1oKnYpLWwqKHUqbS1hKnYpK2QqKHUqaC1hKmMpKSxlWzEzXT1uKihjKm0taCp2KS1sKihyKm0taSp2KStkKihyKmgtaSpjKSxlWzE0XT0tKG4qKHUqbS1hKnYpLW8qKHIqbS1pKnYpK2QqKHIqYS1pKnUpKSxlWzE1XT1uKih1KmgtYSpjKS1vKihyKmgtaSpjKStsKihyKmEtaSp1KSxlfSxoLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM10scz1lWzRdLG89ZVs1XSx1PWVbNl0sYT1lWzddLGY9ZVs4XSxsPWVbOV0sYz1lWzEwXSxoPWVbMTFdLHA9ZVsxMl0sZD1lWzEzXSx2PWVbMTRdLG09ZVsxNV0sZz10Km8tbipzLHk9dCp1LXIqcyxiPXQqYS1pKnMsdz1uKnUtcipvLEU9biphLWkqbyxTPXIqYS1pKnUseD1mKmQtbCpwLFQ9Zip2LWMqcCxOPWYqbS1oKnAsQz1sKnYtYypkLGs9bCptLWgqZCxMPWMqbS1oKnY7cmV0dXJuIGcqTC15KmsrYipDK3cqTi1FKlQrUyp4fSxoLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD10WzldLHA9dFsxMF0sZD10WzExXSx2PXRbMTJdLG09dFsxM10sZz10WzE0XSx5PXRbMTVdLGI9blswXSx3PW5bMV0sRT1uWzJdLFM9blszXTtyZXR1cm4gZVswXT1iKnIrdyp1K0UqYytTKnYsZVsxXT1iKmkrdyphK0UqaCtTKm0sZVsyXT1iKnMrdypmK0UqcCtTKmcsZVszXT1iKm8rdypsK0UqZCtTKnksYj1uWzRdLHc9bls1XSxFPW5bNl0sUz1uWzddLGVbNF09YipyK3cqdStFKmMrUyp2LGVbNV09YippK3cqYStFKmgrUyptLGVbNl09YipzK3cqZitFKnArUypnLGVbN109YipvK3cqbCtFKmQrUyp5LGI9bls4XSx3PW5bOV0sRT1uWzEwXSxTPW5bMTFdLGVbOF09YipyK3cqdStFKmMrUyp2LGVbOV09YippK3cqYStFKmgrUyptLGVbMTBdPWIqcyt3KmYrRSpwK1MqZyxlWzExXT1iKm8rdypsK0UqZCtTKnksYj1uWzEyXSx3PW5bMTNdLEU9blsxNF0sUz1uWzE1XSxlWzEyXT1iKnIrdyp1K0UqYytTKnYsZVsxM109YippK3cqYStFKmgrUyptLGVbMTRdPWIqcyt3KmYrRSpwK1MqZyxlWzE1XT1iKm8rdypsK0UqZCtTKnksZX0saC5tdWw9aC5tdWx0aXBseSxoLnRyYW5zbGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV0scz1uWzJdLG8sdSxhLGYsbCxjLGgscCxkLHYsbSxnO3JldHVybiB0PT09ZT8oZVsxMl09dFswXSpyK3RbNF0qaSt0WzhdKnMrdFsxMl0sZVsxM109dFsxXSpyK3RbNV0qaSt0WzldKnMrdFsxM10sZVsxNF09dFsyXSpyK3RbNl0qaSt0WzEwXSpzK3RbMTRdLGVbMTVdPXRbM10qcit0WzddKmkrdFsxMV0qcyt0WzE1XSk6KG89dFswXSx1PXRbMV0sYT10WzJdLGY9dFszXSxsPXRbNF0sYz10WzVdLGg9dFs2XSxwPXRbN10sZD10WzhdLHY9dFs5XSxtPXRbMTBdLGc9dFsxMV0sZVswXT1vLGVbMV09dSxlWzJdPWEsZVszXT1mLGVbNF09bCxlWzVdPWMsZVs2XT1oLGVbN109cCxlWzhdPWQsZVs5XT12LGVbMTBdPW0sZVsxMV09ZyxlWzEyXT1vKnIrbCppK2Qqcyt0WzEyXSxlWzEzXT11KnIrYyppK3Yqcyt0WzEzXSxlWzE0XT1hKnIraCppK20qcyt0WzE0XSxlWzE1XT1mKnIrcCppK2cqcyt0WzE1XSksZX0saC5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV0scz1uWzJdO3JldHVybiBlWzBdPXRbMF0qcixlWzFdPXRbMV0qcixlWzJdPXRbMl0qcixlWzNdPXRbM10qcixlWzRdPXRbNF0qaSxlWzVdPXRbNV0qaSxlWzZdPXRbNl0qaSxlWzddPXRbN10qaSxlWzhdPXRbOF0qcyxlWzldPXRbOV0qcyxlWzEwXT10WzEwXSpzLGVbMTFdPXRbMTFdKnMsZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0sZX0saC5yb3RhdGU9ZnVuY3Rpb24oZSxuLHIsaSl7dmFyIHM9aVswXSxvPWlbMV0sdT1pWzJdLGE9TWF0aC5zcXJ0KHMqcytvKm8rdSp1KSxmLGwsYyxoLHAsZCx2LG0sZyx5LGIsdyxFLFMseCxULE4sQyxrLEwsQSxPLE0sXztyZXR1cm4gTWF0aC5hYnMoYSk8dD9udWxsOihhPTEvYSxzKj1hLG8qPWEsdSo9YSxmPU1hdGguc2luKHIpLGw9TWF0aC5jb3MociksYz0xLWwsaD1uWzBdLHA9blsxXSxkPW5bMl0sdj1uWzNdLG09bls0XSxnPW5bNV0seT1uWzZdLGI9bls3XSx3PW5bOF0sRT1uWzldLFM9blsxMF0seD1uWzExXSxUPXMqcypjK2wsTj1vKnMqYyt1KmYsQz11KnMqYy1vKmYsaz1zKm8qYy11KmYsTD1vKm8qYytsLEE9dSpvKmMrcypmLE89cyp1KmMrbypmLE09byp1KmMtcypmLF89dSp1KmMrbCxlWzBdPWgqVCttKk4rdypDLGVbMV09cCpUK2cqTitFKkMsZVsyXT1kKlQreSpOK1MqQyxlWzNdPXYqVCtiKk4reCpDLGVbNF09aCprK20qTCt3KkEsZVs1XT1wKmsrZypMK0UqQSxlWzZdPWQqayt5KkwrUypBLGVbN109diprK2IqTCt4KkEsZVs4XT1oKk8rbSpNK3cqXyxlWzldPXAqTytnKk0rRSpfLGVbMTBdPWQqTyt5Kk0rUypfLGVbMTFdPXYqTytiKk0reCpfLG4hPT1lJiYoZVsxMl09blsxMl0sZVsxM109blsxM10sZVsxNF09blsxNF0sZVsxNV09blsxNV0pLGUpfSxoLnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPU1hdGguc2luKG4pLGk9TWF0aC5jb3Mobikscz10WzRdLG89dFs1XSx1PXRbNl0sYT10WzddLGY9dFs4XSxsPXRbOV0sYz10WzEwXSxoPXRbMTFdO3JldHVybiB0IT09ZSYmKGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSksZVs0XT1zKmkrZipyLGVbNV09byppK2wqcixlWzZdPXUqaStjKnIsZVs3XT1hKmkraCpyLGVbOF09ZippLXMqcixlWzldPWwqaS1vKnIsZVsxMF09YyppLXUqcixlWzExXT1oKmktYSpyLGV9LGgucm90YXRlWT1mdW5jdGlvbihlLHQsbil7dmFyIHI9TWF0aC5zaW4obiksaT1NYXRoLmNvcyhuKSxzPXRbMF0sbz10WzFdLHU9dFsyXSxhPXRbM10sZj10WzhdLGw9dFs5XSxjPXRbMTBdLGg9dFsxMV07cmV0dXJuIHQhPT1lJiYoZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzBdPXMqaS1mKnIsZVsxXT1vKmktbCpyLGVbMl09dSppLWMqcixlWzNdPWEqaS1oKnIsZVs4XT1zKnIrZippLGVbOV09bypyK2wqaSxlWzEwXT11KnIrYyppLGVbMTFdPWEqcitoKmksZX0saC5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1NYXRoLnNpbihuKSxpPU1hdGguY29zKG4pLHM9dFswXSxvPXRbMV0sdT10WzJdLGE9dFszXSxmPXRbNF0sbD10WzVdLGM9dFs2XSxoPXRbN107cmV0dXJuIHQhPT1lJiYoZVs4XT10WzhdLGVbOV09dFs5XSxlWzEwXT10WzEwXSxlWzExXT10WzExXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSksZVswXT1zKmkrZipyLGVbMV09byppK2wqcixlWzJdPXUqaStjKnIsZVszXT1hKmkraCpyLGVbNF09ZippLXMqcixlWzVdPWwqaS1vKnIsZVs2XT1jKmktdSpyLGVbN109aCppLWEqcixlfSxoLmZyb21Sb3RhdGlvblRyYW5zbGF0aW9uPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9cityLGE9aStpLGY9cytzLGw9cip1LGM9ciphLGg9cipmLHA9aSphLGQ9aSpmLHY9cypmLG09byp1LGc9byphLHk9bypmO3JldHVybiBlWzBdPTEtKHArdiksZVsxXT1jK3ksZVsyXT1oLWcsZVszXT0wLGVbNF09Yy15LGVbNV09MS0obCt2KSxlWzZdPWQrbSxlWzddPTAsZVs4XT1oK2csZVs5XT1kLW0sZVsxMF09MS0obCtwKSxlWzExXT0wLGVbMTJdPW5bMF0sZVsxM109blsxXSxlWzE0XT1uWzJdLGVbMTVdPTEsZX0saC5mcm9tUXVhdD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uK24sdT1yK3IsYT1pK2ksZj1uKm8sbD1yKm8sYz1yKnUsaD1pKm8scD1pKnUsZD1pKmEsdj1zKm8sbT1zKnUsZz1zKmE7cmV0dXJuIGVbMF09MS1jLWQsZVsxXT1sK2csZVsyXT1oLW0sZVszXT0wLGVbNF09bC1nLGVbNV09MS1mLWQsZVs2XT1wK3YsZVs3XT0wLGVbOF09aCttLGVbOV09cC12LGVbMTBdPTEtZi1jLGVbMTFdPTAsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTAsZVsxNV09MSxlfSxoLmZydXN0dW09ZnVuY3Rpb24oZSx0LG4scixpLHMsbyl7dmFyIHU9MS8obi10KSxhPTEvKGktciksZj0xLyhzLW8pO3JldHVybiBlWzBdPXMqMip1LGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPXMqMiphLGVbNl09MCxlWzddPTAsZVs4XT0obit0KSp1LGVbOV09KGkrcikqYSxlWzEwXT0obytzKSpmLGVbMTFdPS0xLGVbMTJdPTAsZVsxM109MCxlWzE0XT1vKnMqMipmLGVbMTVdPTAsZX0saC5wZXJzcGVjdGl2ZT1mdW5jdGlvbihlLHQsbixyLGkpe3ZhciBzPTEvTWF0aC50YW4odC8yKSxvPTEvKHItaSk7cmV0dXJuIGVbMF09cy9uLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPXMsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPShpK3IpKm8sZVsxMV09LTEsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTIqaSpyKm8sZVsxNV09MCxlfSxoLm9ydGhvPWZ1bmN0aW9uKGUsdCxuLHIsaSxzLG8pe3ZhciB1PTEvKHQtbiksYT0xLyhyLWkpLGY9MS8ocy1vKTtyZXR1cm4gZVswXT0tMip1LGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPS0yKmEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTIqZixlWzExXT0wLGVbMTJdPSh0K24pKnUsZVsxM109KGkrcikqYSxlWzE0XT0obytzKSpmLGVbMTVdPTEsZX0saC5sb29rQXQ9ZnVuY3Rpb24oZSxuLHIsaSl7dmFyIHMsbyx1LGEsZixsLGMscCxkLHYsbT1uWzBdLGc9blsxXSx5PW5bMl0sYj1pWzBdLHc9aVsxXSxFPWlbMl0sUz1yWzBdLHg9clsxXSxUPXJbMl07cmV0dXJuIE1hdGguYWJzKG0tUyk8dCYmTWF0aC5hYnMoZy14KTx0JiZNYXRoLmFicyh5LVQpPHQ/aC5pZGVudGl0eShlKTooYz1tLVMscD1nLXgsZD15LVQsdj0xL01hdGguc3FydChjKmMrcCpwK2QqZCksYyo9dixwKj12LGQqPXYscz13KmQtRSpwLG89RSpjLWIqZCx1PWIqcC13KmMsdj1NYXRoLnNxcnQocypzK28qbyt1KnUpLHY/KHY9MS92LHMqPXYsbyo9dix1Kj12KToocz0wLG89MCx1PTApLGE9cCp1LWQqbyxmPWQqcy1jKnUsbD1jKm8tcCpzLHY9TWF0aC5zcXJ0KGEqYStmKmYrbCpsKSx2Pyh2PTEvdixhKj12LGYqPXYsbCo9dik6KGE9MCxmPTAsbD0wKSxlWzBdPXMsZVsxXT1hLGVbMl09YyxlWzNdPTAsZVs0XT1vLGVbNV09ZixlWzZdPXAsZVs3XT0wLGVbOF09dSxlWzldPWwsZVsxMF09ZCxlWzExXT0wLGVbMTJdPS0ocyptK28qZyt1KnkpLGVbMTNdPS0oYSptK2YqZytsKnkpLGVbMTRdPS0oYyptK3AqZytkKnkpLGVbMTVdPTEsZSl9LGguc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwibWF0NChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiLCBcIitlWzRdK1wiLCBcIitlWzVdK1wiLCBcIitlWzZdK1wiLCBcIitlWzddK1wiLCBcIitlWzhdK1wiLCBcIitlWzldK1wiLCBcIitlWzEwXStcIiwgXCIrZVsxMV0rXCIsIFwiK2VbMTJdK1wiLCBcIitlWzEzXStcIiwgXCIrZVsxNF0rXCIsIFwiK2VbMTVdK1wiKVwifSxoLmZyb2I9ZnVuY3Rpb24oZSl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhlWzBdLDIpK01hdGgucG93KGVbMV0sMikrTWF0aC5wb3coZVsyXSwyKStNYXRoLnBvdyhlWzNdLDIpK01hdGgucG93KGVbNF0sMikrTWF0aC5wb3coZVs1XSwyKStNYXRoLnBvdyhlWzZdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs3XSwyKStNYXRoLnBvdyhlWzhdLDIpK01hdGgucG93KGVbOV0sMikrTWF0aC5wb3coZVsxMF0sMikrTWF0aC5wb3coZVsxMV0sMikrTWF0aC5wb3coZVsxMl0sMikrTWF0aC5wb3coZVsxM10sMikrTWF0aC5wb3coZVsxNF0sMikrTWF0aC5wb3coZVsxNV0sMikpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0ND1oKTt2YXIgcD17fTtwLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDQpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0scC5yb3RhdGlvblRvPWZ1bmN0aW9uKCl7dmFyIGU9dS5jcmVhdGUoKSx0PXUuZnJvbVZhbHVlcygxLDAsMCksbj11LmZyb21WYWx1ZXMoMCwxLDApO3JldHVybiBmdW5jdGlvbihyLGkscyl7dmFyIG89dS5kb3QoaSxzKTtyZXR1cm4gbzwtMC45OTk5OTk/KHUuY3Jvc3MoZSx0LGkpLHUubGVuZ3RoKGUpPDFlLTYmJnUuY3Jvc3MoZSxuLGkpLHUubm9ybWFsaXplKGUsZSkscC5zZXRBeGlzQW5nbGUocixlLE1hdGguUEkpLHIpOm8+Ljk5OTk5OT8oclswXT0wLHJbMV09MCxyWzJdPTAsclszXT0xLHIpOih1LmNyb3NzKGUsaSxzKSxyWzBdPWVbMF0sclsxXT1lWzFdLHJbMl09ZVsyXSxyWzNdPTErbyxwLm5vcm1hbGl6ZShyLHIpKX19KCkscC5zZXRBeGVzPWZ1bmN0aW9uKCl7dmFyIGU9Yy5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24odCxuLHIsaSl7cmV0dXJuIGVbMF09clswXSxlWzNdPXJbMV0sZVs2XT1yWzJdLGVbMV09aVswXSxlWzRdPWlbMV0sZVs3XT1pWzJdLGVbMl09LW5bMF0sZVs1XT0tblsxXSxlWzhdPS1uWzJdLHAubm9ybWFsaXplKHQscC5mcm9tTWF0Myh0LGUpKX19KCkscC5jbG9uZT1hLmNsb25lLHAuZnJvbVZhbHVlcz1hLmZyb21WYWx1ZXMscC5jb3B5PWEuY29weSxwLnNldD1hLnNldCxwLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0scC5zZXRBeGlzQW5nbGU9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPU1hdGguc2luKG4pO3JldHVybiBlWzBdPXIqdFswXSxlWzFdPXIqdFsxXSxlWzJdPXIqdFsyXSxlWzNdPU1hdGguY29zKG4pLGV9LHAuYWRkPWEuYWRkLHAubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXSxmPW5bMl0sbD1uWzNdO3JldHVybiBlWzBdPXIqbCtvKnUraSpmLXMqYSxlWzFdPWkqbCtvKmErcyp1LXIqZixlWzJdPXMqbCtvKmYrciphLWkqdSxlWzNdPW8qbC1yKnUtaSphLXMqZixlfSxwLm11bD1wLm11bHRpcGx5LHAuc2NhbGU9YS5zY2FsZSxwLnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYStvKnUsZVsxXT1pKmErcyp1LGVbMl09cyphLWkqdSxlWzNdPW8qYS1yKnUsZX0scC5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmEtcyp1LGVbMV09aSphK28qdSxlWzJdPXMqYStyKnUsZVszXT1vKmEtaSp1LGV9LHAucm90YXRlWj1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK2kqdSxlWzFdPWkqYS1yKnUsZVsyXT1zKmErbyp1LGVbM109byphLXMqdSxlfSxwLmNhbGN1bGF0ZVc9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl07cmV0dXJuIGVbMF09bixlWzFdPXIsZVsyXT1pLGVbM109LU1hdGguc3FydChNYXRoLmFicygxLW4qbi1yKnItaSppKSksZX0scC5kb3Q9YS5kb3QscC5sZXJwPWEubGVycCxwLnNsZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXSx1PXRbM10sYT1uWzBdLGY9blsxXSxsPW5bMl0sYz1uWzNdLGgscCxkLHYsbTtyZXR1cm4gcD1pKmErcypmK28qbCt1KmMscDwwJiYocD0tcCxhPS1hLGY9LWYsbD0tbCxjPS1jKSwxLXA+MWUtNj8oaD1NYXRoLmFjb3MocCksZD1NYXRoLnNpbihoKSx2PU1hdGguc2luKCgxLXIpKmgpL2QsbT1NYXRoLnNpbihyKmgpL2QpOih2PTEtcixtPXIpLGVbMF09dippK20qYSxlWzFdPXYqcyttKmYsZVsyXT12Km8rbSpsLGVbM109dip1K20qYyxlfSxwLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKm4rcipyK2kqaStzKnMsdT1vPzEvbzowO3JldHVybiBlWzBdPS1uKnUsZVsxXT0tcip1LGVbMl09LWkqdSxlWzNdPXMqdSxlfSxwLmNvbmp1Z2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlWzNdPXRbM10sZX0scC5sZW5ndGg9YS5sZW5ndGgscC5sZW49cC5sZW5ndGgscC5zcXVhcmVkTGVuZ3RoPWEuc3F1YXJlZExlbmd0aCxwLnNxckxlbj1wLnNxdWFyZWRMZW5ndGgscC5ub3JtYWxpemU9YS5ub3JtYWxpemUscC5mcm9tTWF0Mz1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0rdFs0XSt0WzhdLHI7aWYobj4wKXI9TWF0aC5zcXJ0KG4rMSksZVszXT0uNSpyLHI9LjUvcixlWzBdPSh0WzddLXRbNV0pKnIsZVsxXT0odFsyXS10WzZdKSpyLGVbMl09KHRbM10tdFsxXSkqcjtlbHNle3ZhciBpPTA7dFs0XT50WzBdJiYoaT0xKSx0WzhdPnRbaSozK2ldJiYoaT0yKTt2YXIgcz0oaSsxKSUzLG89KGkrMiklMztyPU1hdGguc3FydCh0W2kqMytpXS10W3MqMytzXS10W28qMytvXSsxKSxlW2ldPS41KnIscj0uNS9yLGVbM109KHRbbyozK3NdLXRbcyozK29dKSpyLGVbc109KHRbcyozK2ldK3RbaSozK3NdKSpyLGVbb109KHRbbyozK2ldK3RbaSozK29dKSpyfXJldHVybiBlfSxwLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInF1YXQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnF1YXQ9cCl9KHQuZXhwb3J0cyl9KSh0aGlzKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxuYW5ndWxhci5tb2R1bGUoICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5idXN5Q292ZXInLCBbXSApXG4gICAgLmRpcmVjdGl2ZSggJ2J1c3lDb3ZlcicsIFsgJyRyb290U2NvcGUnLFxuICAgICAgICBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvYnVzeUNvdmVyLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLmxvYWRpbmcpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYnVzeU1lc3NhZ2UgPSAnTG9hZGluZy4uLic7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoICRyb290U2NvcGUuaW5pdGlhbGl6aW5nICl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYnVzeU1lc3NhZ2UgPSAnSW5pdGlhbGl6aW5nLi4uJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggJHJvb3RTY29wZS5idXN5ICl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzY29wZS5idXN5TWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5idXN5TWVzc2FnZSA9ICdKdXN0IGEgc2Vjb25kLi4uJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihuZXdWYWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnb2ZmJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdvZmYnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSggJy4vY29tcG9uZW50V2lyZVNlZ21lbnQnICk7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlJywgW1xuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uY29tcG9uZW50V2lyZS5zZWdtZW50J1xuICAgIF1cbilcbiAgICAuY29udHJvbGxlciggJ0NvbXBvbmVudFdpcmVDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUgKSB7XG4gICAgICAgICRzY29wZS5nZXRTZWdtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlbmRQb3NpdGlvbnMsXG4gICAgICAgICAgICAgICAgeDEsIHkxLCB4MiwgeTI7XG5cbiAgICAgICAgICAgIGVuZFBvc2l0aW9ucyA9ICRzY29wZS53aXJlLmdldEVuZFBvc2l0aW9ucygpO1xuXG4gICAgICAgICAgICB4MSA9IGVuZFBvc2l0aW9ucy54MTtcbiAgICAgICAgICAgIHgyID0gZW5kUG9zaXRpb25zLngyO1xuICAgICAgICAgICAgeTEgPSBlbmRQb3NpdGlvbnMueTE7XG4gICAgICAgICAgICB5MiA9IGVuZFBvc2l0aW9ucy55MjtcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBlbmRQb3NpdGlvbnNcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub25TZWdtZW50Q2xpY2sgPSBmdW5jdGlvbiAoIHdpcmUsIHNlZ21lbnQgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggd2lyZSwgc2VnbWVudCApO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zZWdtZW50cyA9ICRzY29wZS5nZXRTZWdtZW50cygpO1xuXG4gICAgfSApXG4gICAgLmRpcmVjdGl2ZShcbiAgICAgICAgJ2NvbXBvbmVudFdpcmUnLFxuXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50V2lyZUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2NvbXBvbmVudFdpcmUuaHRtbCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVOYW1lc3BhY2U6ICdTVkcnXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uY29tcG9uZW50V2lyZS5zZWdtZW50JywgW11cbilcblxuLmRpcmVjdGl2ZShcbiAgICAnY29tcG9uZW50V2lyZVNlZ21lbnQnLFxuXG4gICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvY29tcG9uZW50V2lyZVNlZ21lbnQuaHRtbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgICAgICAgfTtcbiAgICB9XG4pOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpIHtcblxuICAgIHZhciBnZW5lcmF0ZVN5bWJvbHM7XG5cbiAgICBnZW5lcmF0ZVN5bWJvbHMgPSBmdW5jdGlvbiAoY291bnQpIHtcblxuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIHBvcnRDb3VudCxcbiAgICAgICAgICAgIG1ha2VBUmFuZG9tU3ltYm9sLFxuICAgICAgICAgICAgbWFrZVNvbWVQb3J0cyxcbiAgICAgICAgICAgIG1pblBvcnRzID0gNixcbiAgICAgICAgICAgIG1heFBvcnRzID0gMzAsXG4gICAgICAgICAgICBwbGFjZW1lbnRzID0gWyd0b3AnLCAncmlnaHQnLCAnYm90dG9tJywgJ2xlZnQnXTtcblxuICAgICAgICBtYWtlU29tZVBvcnRzID0gZnVuY3Rpb24gKGNvdW50T2ZQb3J0cykge1xuXG4gICAgICAgICAgICB2YXIgc2lkZXMsXG4gICAgICAgICAgICAgICAgcG9ydCxcbiAgICAgICAgICAgICAgICBwbGFjZW1lbnQsXG4gICAgICAgICAgICAgICAgajtcblxuICAgICAgICAgICAgc2lkZXMgPSB7XG4gICAgICAgICAgICAgICAgdG9wOiBbXSxcbiAgICAgICAgICAgICAgICByaWdodDogW10sXG4gICAgICAgICAgICAgICAgYm90dG9tOiBbXSxcbiAgICAgICAgICAgICAgICBsZWZ0OiBbXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGNvdW50T2ZQb3J0czsgaisrKSB7XG5cbiAgICAgICAgICAgICAgICBwb3J0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ3BfJyArIGosXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUG9ydC0nICsgalxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPSBwbGFjZW1lbnRzLmdldFJhbmRvbUVsZW1lbnQoKTtcblxuICAgICAgICAgICAgICAgIHNpZGVzW3BsYWNlbWVudF0ucHVzaChwb3J0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNpZGVzO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgbWFrZUFSYW5kb21TeW1ib2wgPSBmdW5jdGlvbiAoaWRQb3N0Zml4LCBjb3VudE9mUG9ydHMpIHtcblxuICAgICAgICAgICAgdmFyIHBvcnREZXNjcmlwdG9ycyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdG9yO1xuXG4gICAgICAgICAgICBwb3J0RGVzY3JpcHRvcnMgPSBtYWtlU29tZVBvcnRzKGNvdW50T2ZQb3J0cyk7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IgPSAge1xuICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAncmFuZG9tXycgKyBpZFBvc3RmaXgsXG4gICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICdSTkRfJyArIGNvdW50T2ZQb3J0cyArICdfJyArIGlkUG9zdGZpeCArICcgJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLm1ha2VCb3hTeW1ib2woXG4gICAgICAgICAgICAgICAgJ3JhbmRvbV8nICsgaWRQb3N0Zml4LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0b3IsXG4gICAgICAgICAgICAgICAgcG9ydERlc2NyaXB0b3JzLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAganVzdGlmeVBvcnRzOiBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuXG4gICAgICAgICAgICBwb3J0Q291bnQgPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBtYXhQb3J0cyksXG4gICAgICAgICAgICAgICAgbWluUG9ydHNcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIG1ha2VBUmFuZG9tU3ltYm9sKGksIHBvcnRDb3VudCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG5cbiAgICB0aGlzLmdlbmVyYXRlU3ltYm9scyA9IGdlbmVyYXRlU3ltYm9scztcblxufTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxuYW5ndWxhci5tb2R1bGUoICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kZXNpZ25FZGl0b3InLCBbXSApXG4gICAgLmNvbnRyb2xsZXIoICdEZXNpZ25FZGl0b3JDb250cm9sbGVyJywgZnVuY3Rpb24oXG4gICAgICAgICRzY29wZSwgJHJvb3RTY29wZSwgZGlhZ3JhbVNlcnZpY2UsICRsb2csIGRlc2lnblNlcnZpY2UsICRzdGF0ZVBhcmFtcywgZGVzaWduTGF5b3V0U2VydmljZSwgc3ltYm9sTWFuYWdlcikge1xuXG4gICAgICAgIHZhciBSYW5kb21TeW1ib2xHZW5lcmF0b3IsXG4gICAgICAgICAgICByYW5kb21TeW1ib2xHZW5lcmF0b3IsXG5cbiAgICAgICAgICAgIGRlc2lnbkN0eDtcblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbSA9IG51bGw7XG5cbiAgICAgICAgZGVzaWduQ3R4ID0ge1xuICAgICAgICAgICAgZGI6ICRyb290U2NvcGUubWFpbkRiQ29ubmVjdGlvbklkLFxuICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25fJyArICggbmV3IERhdGUoKSApLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbUNvbnRhaW5lckNvbmZpZyA9IHtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICgkc3RhdGVQYXJhbXMuY29udGFpbmVySWQgPT09ICdkdW1teScpIHtcblxuICAgICAgICAgICAgUmFuZG9tU3ltYm9sR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9jbGFzc2VzL1JhbmRvbVN5bWJvbEdlbmVyYXRvcicpO1xuICAgICAgICAgICAgcmFuZG9tU3ltYm9sR2VuZXJhdG9yID0gbmV3IFJhbmRvbVN5bWJvbEdlbmVyYXRvcihzeW1ib2xNYW5hZ2VyKTtcblxuICAgICAgICAgICAgcmFuZG9tU3ltYm9sR2VuZXJhdG9yLmdlbmVyYXRlU3ltYm9scyg3KTtcblxuXG4gICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbSA9IGRpYWdyYW1TZXJ2aWNlLmFkZER1bW15RGlhZ3JhbSgnZHVtbXknLCAxMDAsIDUwLCAzMDAwLCAzMDAwKTtcblxuICAgICAgICAgICAgJGxvZy5kZWJ1ZygnRHJhd2luZyBkdW1teSBkaWFncmFtOicsICRzY29wZS5kaWFncmFtKTtcbiAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGRlc2lnbkxheW91dFNlcnZpY2Uud2F0Y2hEaWFncmFtRWxlbWVudHMoZGVzaWduQ3R4LCAkcm9vdFNjb3BlLmFjdGl2ZURlc2lnbi5pZCwgZnVuY3Rpb24gKC8qZGVzaWduU3RydWN0dXJlVXBkYXRlT2JqZWN0Ki8pIHtcblxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoY3lQaHlMYXlvdXQpIHtcblxuICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ0RpYWdyYW0gZWxlbWVudHMnLCBjeVBoeUxheW91dCk7XG5cbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmFjdGl2ZUNvbnRhaW5lcklkID0gJHN0YXRlUGFyYW1zLmNvbnRhaW5lcklkIHx8ICRyb290U2NvcGUuYWN0aXZlRGVzaWduLmlkO1xuXG4gICAgICAgICAgICAgICAgJGxvZy5kZWJ1Zygkcm9vdFNjb3BlLmFjdGl2ZUNvbnRhaW5lcklkKTtcblxuICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtID1cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbVNlcnZpY2UuY3JlYXRlRGlhZ3JhbUZyb21DeVBoeUVsZW1lbnRzKCRyb290U2NvcGUuYWN0aXZlQ29udGFpbmVySWQsIGN5UGh5TGF5b3V0LmVsZW1lbnRzKTtcblxuICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ0RyYXdpbmcgZGlhZ3JhbTonLCAkc2NvcGUuZGlhZ3JhbSk7XG5cbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pXG4gICAgLmRpcmVjdGl2ZSggJ2Rlc2lnbkVkaXRvcicsIFtcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnbkVkaXRvckNvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgICRzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9kZXNpZ25FZGl0b3IuaHRtbCdcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0gKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkc2NvcGUsICR0aW1lb3V0LCAkbG9nKSB7XG5cbiAgICB2YXIganNwLFxuICAgICAgICBqc3BSZWluaXQsXG4gICAgICAgIGpzcFBhbmUsXG5cbiAgICAgICAgc2Nyb2xsUG9zaXRpb25YLFxuICAgICAgICBzY3JvbGxQb3NpdGlvblksXG5cbiAgICAgICAgdXBkYXRlVmlzaWJsZUFyZWEsXG4gICAgICAgIHVwZGF0ZVByb21pc2UsXG5cbiAgICAgICAgb25XaW5kb3dSZXNpemU7XG5cblxuICAgIHVwZGF0ZVZpc2libGVBcmVhID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBsZWZ0LFxuICAgICAgICAgICAgdG9wLFxuICAgICAgICAgICAgX3VwZGF0ZVZpc2libGVBcmVhO1xuXG4gICAgICAgIF91cGRhdGVWaXNpYmxlQXJlYSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICRzY29wZS52aXNpYmxlQXJlYSA9IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0IHx8IDAsXG4gICAgICAgICAgICAgICAgdG9wOiB0b3AgfHwgMCxcbiAgICAgICAgICAgICAgICByaWdodDogbGVmdCArICRzY29wZS4kY29udGVudFBhbmUud2lkdGgoKSxcbiAgICAgICAgICAgICAgICBib3R0b206IHRvcCArICRzY29wZS4kY29udGVudFBhbmUuaGVpZ2h0KClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoanNwUGFuZSkge1xuXG4gICAgICAgICAgICBsZWZ0ID0gc2Nyb2xsUG9zaXRpb25YIHx8IDA7XG4gICAgICAgICAgICB0b3AgPSBzY3JvbGxQb3NpdGlvblkgfHwgMDtcblxuICAgICAgICAgICAgaWYgKHVwZGF0ZVByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAkdGltZW91dC5jYW5jZWwodXBkYXRlUHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHVwZGF0ZVByb21pc2UgPSAkdGltZW91dChfdXBkYXRlVmlzaWJsZUFyZWEsIDEwMCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAganNwUmVpbml0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGpzcCkpIHtcblxuICAgICAgICAgICAgJGxvZy5kZWJ1ZygnUmVpbml0aWFsaXppbmcgSlNQLicpO1xuICAgICAgICAgICAganNwLnJlaW5pdGlhbGlzZSgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICAkc2NvcGUuJG9uKCdEaWFncmFtQ29udGFpbmVySW5pdGlhbGl6ZWQnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgJHNjb3BlLiRjb250ZW50UGFuZVxuXG4gICAgICAgICAgICAuYmluZCgnanNwLWluaXRpYWxpc2VkJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBqc3BQYW5lID0gJHNjb3BlLiRjb250ZW50UGFuZS5maW5kKCcuanNwUGFuZScpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZVZpc2libGVBcmVhKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICAgICAgIC5iaW5kKCdqc3Atc2Nyb2xsLXknLCBmdW5jdGlvbiAoZXZlbnQsIGFTY3JvbGxQb3NpdGlvblkpIHtcblxuICAgICAgICAgICAgICAgIHNjcm9sbFBvc2l0aW9uWSA9IGFTY3JvbGxQb3NpdGlvblk7XG5cbiAgICAgICAgICAgICAgICB1cGRhdGVWaXNpYmxlQXJlYSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgICAgICAgICAuYmluZCgnanNwLXNjcm9sbC14JywgZnVuY3Rpb24gKGV2ZW50LCBhU2Nyb2xsUG9zaXRpb25YKSB7XG5cbiAgICAgICAgICAgICAgICBzY3JvbGxQb3NpdGlvblggPSBhU2Nyb2xsUG9zaXRpb25YO1xuXG4gICAgICAgICAgICAgICAgdXBkYXRlVmlzaWJsZUFyZWEoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuLy8gICAgICAgICAgICAuYmluZChcbi8vICAgICAgICAgICAgJ2pzcC1hcnJvdy1jaGFuZ2UnLFxuLy8gICAgICAgICAgICBmdW5jdGlvbiAoZXZlbnQsIGlzQXRUb3AsIGlzQXRCb3R0b20sIGlzQXRMZWZ0LCBpc0F0UmlnaHQpIHtcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIYW5kbGUganNwLWFycm93LWNoYW5nZScsIHRoaXMsXG4vLyAgICAgICAgICAgICAgICAgICAgJ2lzQXRUb3A9JywgaXNBdFRvcCxcbi8vICAgICAgICAgICAgICAgICAgICAnaXNBdEJvdHRvbT0nLCBpc0F0Qm90dG9tLFxuLy8gICAgICAgICAgICAgICAgICAgICdpc0F0TGVmdD0nLCBpc0F0TGVmdCxcbi8vICAgICAgICAgICAgICAgICAgICAnaXNBdFJpZ2h0PScsIGlzQXRSaWdodCk7XG4vLyAgICAgICAgICAgIH1cbi8vICAgICAgICApXG4gICAgICAgICAgICAualNjcm9sbFBhbmUoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVydGljYWxEcmFnTWluSGVpZ2h0OiA2MCxcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbERyYWdNYXhIZWlnaHQ6IDYwLFxuICAgICAgICAgICAgICAgIGhvcml6b250YWxEcmFnTWluV2lkdGg6IDYwLFxuICAgICAgICAgICAgICAgIGhvcml6b250YWxEcmFnTWF4V2lkdGg6IDYwLFxuICAgICAgICAgICAgICAgIGFuaW1hdGVTY3JvbGw6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBqc3AgPSAkc2NvcGUuJGNvbnRlbnRQYW5lLmRhdGEoJ2pzcCcpO1xuXG4gICAgICAgIGpzcFJlaW5pdCgpO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLiRvbignRGlhZ3JhbUluaXRpYWxpemVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBqc3BSZWluaXQoKTtcbiAgICB9KTtcblxuXG4gICAgb25XaW5kb3dSZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAganNwUmVpbml0KCk7XG4gICAgfTtcblxuICAgIHRoaXMub25XaW5kb3dSZXNpemUgPSBvbldpbmRvd1Jlc2l6ZTtcblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIsICQqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5yZXF1aXJlKCcuLi9kcmF3aW5nR3JpZC9kcmF3aW5nR3JpZC5qcycpO1xuXG5hbmd1bGFyLm1vZHVsZSgnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZGlhZ3JhbUNvbnRhaW5lcicsIFtcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRyYXdpbmdHcmlkJyxcbiAgICAgICAgJ3Bhbnpvb20nLFxuICAgICAgICAncGFuem9vbXdpZGdldCcsXG4gICAgICAgICdpc2lzLnVpLmNvbnRleHRtZW51J1xuICAgIF0pXG4gICAgLmNvbnRyb2xsZXIoJ0RpYWdyYW1Db250YWluZXJDb250cm9sbGVyJywgW1xuICAgICAgICAnJHNjb3BlJyxcbiAgICAgICAgJyR0aW1lb3V0JyxcbiAgICAgICAgJyRsb2cnLFxuICAgICAgICAnUGFuWm9vbVNlcnZpY2UnLFxuICAgICAgICAnJHdpbmRvdycsXG4gICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICR0aW1lb3V0LCAkbG9nLCBQYW5ab29tU2VydmljZSwgJHdpbmRvdykge1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG5cbiAgICAgICAgICAgICAgICAkd2luZG93RWxlbWVudCxcblxuICAgICAgICAgICAgICAgIGNvbXBpbGVkRGlyZWN0aXZlcyxcblxuICAgICAgICAgICAgICAgIFNjcm9sbEhhbmRsZXIsXG4gICAgICAgICAgICAgICAgc2Nyb2xsSGFuZGxlcjtcblxuICAgICAgICAgICAgY29tcGlsZWREaXJlY3RpdmVzID0ge307XG5cbiAgICAgICAgICAgIFNjcm9sbEhhbmRsZXIgPSByZXF1aXJlKCcuL2NsYXNzZXMvU2Nyb2xsSGFuZGxlcicpO1xuICAgICAgICAgICAgc2Nyb2xsSGFuZGxlciA9IG5ldyBTY3JvbGxIYW5kbGVyKCRzY29wZSwgJHRpbWVvdXQsICRsb2cpO1xuXG5cbiAgICAgICAgICAgICRzY29wZS5wYW56b29tSWQgPSAncGFuem9vbUlkJzsgLy9zY29wZS5pZCArICctcGFuem9vbWVkJztcblxuICAgICAgICAgICAgJHNjb3BlLnpvb21MZXZlbCA9IDQ7XG5cbiAgICAgICAgICAgICRzY29wZS5wYW56b29tTW9kZWwgPSB7fTsgLy8gYWx3YXlzIHBhc3MgZW1wdHkgb2JqZWN0XG5cbiAgICAgICAgICAgICRzY29wZS5wYW56b29tQ29uZmlnID0ge1xuICAgICAgICAgICAgICAgIHpvb21MZXZlbHM6IDEwLFxuICAgICAgICAgICAgICAgIG5ldXRyYWxab29tTGV2ZWw6ICRzY29wZS56b29tTGV2ZWwsXG4gICAgICAgICAgICAgICAgc2NhbGVQZXJab29tTGV2ZWw6IDEuMjUsXG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IDUwLFxuICAgICAgICAgICAgICAgIGhhbHRTcGVlZDogNTAsXG5cbiAgICAgICAgICAgICAgICBtb2RlbENoYW5nZWRDYWxsYmFjazogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICBQYW5ab29tU2VydmljZS5nZXRBUEkoJHNjb3BlLnBhbnpvb21JZClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhcGkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0b3BMZWZ0Q29ybmVyLCBib3R0b21SaWdodENvcm5lcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS56b29tTGV2ZWwgPSB2YWwuem9vbUxldmVsO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wTGVmdENvcm5lciA9IGFwaS5nZXRNb2RlbFBvc2l0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tUmlnaHRDb3JuZXIgPSBhcGkuZ2V0TW9kZWxQb3NpdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6ICRzY29wZS5jYW52YXNXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogJHNjb3BlLmNhbnZhc0hlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnZpc2libGVBcmVhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcExlZnRDb3JuZXIueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogdG9wTGVmdENvcm5lci54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByaWdodDogYm90dG9tUmlnaHRDb3JuZXIueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiBib3R0b21SaWdodENvcm5lci55XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkd2luZG93RWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KTtcblxuICAgICAgICAgICAgJHdpbmRvd0VsZW1lbnQuYmluZChcbiAgICAgICAgICAgICAgICAncmVzaXplJywgc2Nyb2xsSGFuZGxlci5vbldpbmRvd1Jlc2l6ZVxuICAgICAgICAgICAgKTtcblxuXG4gICAgICAgICAgICAkc2NvcGUuZ2V0Q3NzQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2xhc3NTdHJpbmc7XG5cbiAgICAgICAgICAgICAgICBjbGFzc1N0cmluZyA9ICdkaWFncmFtLWNvbnRhaW5lcic7XG5cbiAgICAgICAgICAgICAgICBjbGFzc1N0cmluZyArPSAnIHpvb20tbGV2ZWwtJyArICRzY29wZS56b29tTGV2ZWw7XG5cbiAgICAgICAgICAgICAgICBjbGFzc1N0cmluZyArPSBzZWxmLmlzRWRpdGFibGUoKSA/ICcgZWRpdGFibGUnIDogJ3JlYWRvbmx5JztcblxuICAgICAgICAgICAgICAgIHJldHVybiBjbGFzc1N0cmluZztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0VmlzaWJsZUFyZWEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS52aXNpYmxlQXJlYTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0SWQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhZ3JhbUlkO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoJHNjb3BlLmRpYWdyYW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW1JZCA9ICRzY29wZS5kaWFncmFtLmlkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBkaWFncmFtSWQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldERpYWdyYW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5kaWFncmFtO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRab29tTGV2ZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS56b29tTGV2ZWw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldENvbXBpbGVkRGlyZWN0aXZlID0gZnVuY3Rpb24gKGRpcmVjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZERpcmVjdGl2ZXNbZGlyZWN0aXZlXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuc2V0Q29tcGlsZWREaXJlY3RpdmUgPSBmdW5jdGlvbiAoZGlyZWN0aXZlLCBjb21waWxlZERpcmVjdGl2ZSkge1xuICAgICAgICAgICAgICAgIGNvbXBpbGVkRGlyZWN0aXZlc1tkaXJlY3RpdmVdID0gY29tcGlsZWREaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmlzRWRpdGFibGUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdCgkc2NvcGUuZGlhZ3JhbSkpIHtcblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb25maWcgPSAkc2NvcGUuZGlhZ3JhbS5jb25maWcgfHwge307XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5kaWFncmFtLmNvbmZpZy5lZGl0YWJsZSA9PT0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5pc0NvbXBvbmVudFNlbGVjdGVkID0gZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoJHNjb3BlLmRpYWdyYW0pKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmluZGV4T2YoY29tcG9uZW50LmlkKSA+IC0xO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldENvbmZpZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmNvbmZpZztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuc2V0SW5pdGlhbGl6ZWQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuaW5pdGlhbGl6ZWQgPSB2YWw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH1cbiAgICBdKVxuICAgIC5kaXJlY3RpdmUoJ2RpYWdyYW1Db250YWluZXInLCBbXG4gICAgICAgICdkaWFncmFtU2VydmljZScsICckbG9nJywgJyR0aW1lb3V0JywgJ1Bhblpvb21TZXJ2aWNlJyxcbiAgICAgICAgZnVuY3Rpb24gKGRpYWdyYW1TZXJ2aWNlLCAkbG9nLCAkdGltZW91dCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEaWFncmFtQ29udGFpbmVyQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbTogJz0nLFxuICAgICAgICAgICAgICAgICAgICBjb25maWc6ICc9J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9kaWFncmFtQ29udGFpbmVyLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ0luIGRpYWdyYW0gY29udGFpbmVyJywgc2NvcGUudmlzaWJsZUFyZWEpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbmZpZyA9IHNjb3BlLmNvbmZpZyB8fCB7fTtcblxuLy8gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNhbnZhc1dpZHRoID0gJChlbGVtZW50KVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAub3V0ZXJXaWR0aCgpO1xuLy8gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNhbnZhc0hlaWdodCA9ICQoZWxlbWVudClcbi8vICAgICAgICAgICAgICAgICAgICAgICAgLm91dGVySGVpZ2h0KCk7XG4vL1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICBzY29wZS52aXNpYmxlQXJlYSA9IHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAwLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogc2NvcGUuY2FudmFzV2lkdGgsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbTogc2NvcGUuY2FudmFzSGVpZ2h0XG4vLyAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRjb250ZW50UGFuZSA9IGVsZW1lbnQuZmluZCgnPi5kaWFncmFtLWNvbnRlbnQtcGFuZScpO1xuXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGJyb2FkY2FzdCgnRGlhZ3JhbUNvbnRhaW5lckluaXRpYWxpemVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xuXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgJCovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbmFuZ3VsYXIubW9kdWxlKCAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZHJhd2luZ0dyaWQnLCBbXSApXG4gICAgLmRpcmVjdGl2ZSggJ2RyYXdpbmdHcmlkJywgWyAnJGxvZycsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2RyYXdpbmdHcmlkLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciAkZWxlbWVudDtcblxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdkaWFncmFtLmNvbmZpZy53aWR0aCcsIGZ1bmN0aW9uKG5ld1ZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5vdXRlcldpZHRoKG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnZGlhZ3JhbS5jb25maWcuaGVpZ2h0JywgZnVuY3Rpb24obmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5vdXRlckhlaWdodChuZXdWYWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBmYWJyaWMqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5hbmd1bGFyLm1vZHVsZSggJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmZhYnJpY0NhbnZhcycsIFtdIClcbiAgICAuY29udHJvbGxlciggJ0ZhYnJpY0NhbnZhc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKCAnZmFicmljQ2FudmFzJywgW1xuICAgICAgICAnJGxvZycsXG4gICAgICAgICdkaWFncmFtU2VydmljZScsXG4gICAgICAgIGZ1bmN0aW9uICggJGxvZywgZGlhZ3JhbVNlcnZpY2UgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgICAgICBzY29wZToge30sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0ZhYnJpY0NhbnZhc0NvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIHJlcXVpcmU6ICdeZGlhZ3JhbUNvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZmFicmljQ2FudmFzLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICggc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGRpYWdyYW1Db250YWluZXJDdHJsICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhclxuICAgICAgICAgICAgICAgICAgICBjYW52YXMsXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJEaWFncmFtO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmlkID0gZGlhZ3JhbUNvbnRhaW5lckN0cmwuZ2V0SWQoKSArICdmYWJyaWMtY2FudmFzJztcblxuICAgICAgICAgICAgICAgICAgICBjYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcyggc2NvcGUuaWQgKTtcblxuICAgICAgICAgICAgICAgICAgICBjYW52YXMuc2V0QmFja2dyb3VuZENvbG9yKCAncmdiYSgyNTUsIDczLCA2NCwgMC42KScgKTtcblxuICAgICAgICAgICAgICAgICAgICByZW5kZXJEaWFncmFtID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNPYmplY3QoIHNjb3BlLmRpYWdyYW1EYXRhICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNBcnJheSggc2NvcGUuZGlhZ3JhbURhdGEuc3ltYm9scyApICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggc2NvcGUuZGlhZ3JhbURhdGEuc3ltYm9scywgZnVuY3Rpb24gKCBzeW1ib2wgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWdyYW1TZXJ2aWNlLmdldFNWR0ZvclN5bWJvbFR5cGUoIHN5bWJvbC50eXBlIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBvYmplY3QgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN2Z09iamVjdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmdPYmplY3QgPSBvYmplY3Quc2V0KCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzeW1ib2wueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogc3ltYm9sLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmdsZTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICBjYW52YXMuYWRkKHN2Z09iamVjdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlY3QgPSBuZXcgZmFicmljLlJlY3QoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogNTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiAnZ3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5nbGU6IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogMTBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5hZGQoIHJlY3QgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdlJywgc3ZnT2JqZWN0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMucmVuZGVyQWxsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlbmRlckFsbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCBkaWFncmFtQ29udGFpbmVyQ3RybC5nZXREaWFncmFtRGF0YSwgZnVuY3Rpb24gKCB2YWx1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoICdEaWFncmFtRGF0YSBpcyAnLCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlhZ3JhbURhdGEgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckRpYWdyYW0oKTtcblxuICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5wb3J0JywgW11cbilcbiAgICAuY29udHJvbGxlciggJ1BvcnRDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUgKSB7XG4gICAgICAgICRzY29wZS5nZXRQb3J0VHJhbnNmb3JtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybVN0cmluZztcblxuICAgICAgICAgICAgdHJhbnNmb3JtU3RyaW5nID0gJ3RyYW5zbGF0ZSgnICsgJHNjb3BlLnBvcnRJbnN0YW5jZS5wb3J0U3ltYm9sLnggKyAnLCcgKyAkc2NvcGUucG9ydEluc3RhbmNlLnBvcnRTeW1ib2xcbiAgICAgICAgICAgICAgICAueSArICcpJztcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVN0cmluZztcbiAgICAgICAgfTtcbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKFxuICAgICAgICAncG9ydCcsXG5cbiAgICAgICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNjb3BlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUG9ydENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL3BvcnQuaHRtbCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVOYW1lc3BhY2U6ICdTVkcnLFxuICAgICAgICAgICAgICAgIHJlcXVpcmU6IFsgJ15zdmdEaWFncmFtJywgJ15kaWFncmFtQ29udGFpbmVyJyBdLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICggc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGNvbnRyb2xsZXJzICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdmdEaWFncmFtQ29udHJvbGxlcjtcblxuICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlciA9IGNvbnRyb2xsZXJzWyAwIF07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25Qb3J0Q2xpY2sgPSBmdW5jdGlvbiAoIHBvcnQsICRldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uUG9ydENsaWNrKCBzY29wZS5jb21wb25lbnQsIHBvcnQsICRldmVudCApO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUG9ydE1vdXNlRG93biA9IGZ1bmN0aW9uICggcG9ydCwgJGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIub25Qb3J0TW91c2VEb3duKCBzY29wZS5jb21wb25lbnQsIHBvcnQsICRldmVudCApO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUG9ydE1vdXNlVXAgPSBmdW5jdGlvbiAoIHBvcnQsICRldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uUG9ydE1vdXNlVXAoIHNjb3BlLmNvbXBvbmVudCwgcG9ydCwgJGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHJlc2l6ZVRvSGVpZ2h0TW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ21tcy5yZXNpemVUb0hlaWdodCcsIFtdKTtcblxuXG5yZXNpemVUb0hlaWdodE1vZHVsZS5kaXJlY3RpdmUoJ3Jlc2l6ZVRvSGVpZ2h0JywgZnVuY3Rpb24gKCR3aW5kb3cpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGhlaWdodElzTGVzc1dpdGg6ICc9PydcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG5cbiAgICAgICAgICAgIHZhciB3aW5kb3cgPSBhbmd1bGFyLmVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3dcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG1pbkhlaWdodCA9IHBhcnNlSW50KGF0dHJpYnV0ZXMubWluZEhlaWdodCwgMTApIHx8IDAsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0ID0gcGFyc2VJbnQoYXR0cmlidXRlcy5tYXhIZWlnaHQsIDEwKSB8fCBJbmZpbml0eSxcbiAgICAgICAgICAgICAgICBoZWlnaHRJc0xlc3NXaXRoID0gcGFyc2VJbnQoc2NvcGUuaGVpZ2h0SXNMZXNzV2l0aCwgMTApIHx8IDA7XG5cbiAgICAgICAgICAgIHNjb3BlLmdldFdpbmRvd0hlaWdodCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBtYXgsIG1pbixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gKCR3aW5kb3cuaW5uZXJIZWlnaHQgPiAwKSA/ICR3aW5kb3cuaW5uZXJIZWlnaHQgOiBzY3JlZW4uaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgbWF4ID0gbWF4SGVpZ2h0O1xuICAgICAgICAgICAgICAgIG1pbiA9IG1pbkhlaWdodDtcblxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLm1heChNYXRoLm1pbihoZWlnaHQgLSBoZWlnaHRJc0xlc3NXaXRoLCBtYXgpLCBtaW4pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKHNjb3BlLmdldFdpbmRvd0hlaWdodCxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vdXRlckhlaWdodChuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5iaW5kKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXNpemVUb0hlaWdodE1vZHVsZTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG4ndXNlIHN0cmljdCc7XG5cbnZhciByZXNpemVUb1dpbmRvd01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdtbXMucmVzaXplVG9XaW5kb3cnLCBbXSk7XG5cblxucmVzaXplVG9XaW5kb3dNb2R1bGUuZGlyZWN0aXZlKCdyZXNpemVUb1dpbmRvdycsIGZ1bmN0aW9uICgkd2luZG93KSB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuXG4gICAgdmFyIHdpbmRvdyA9IGFuZ3VsYXIuZWxlbWVudChcbiAgICAgICAgJHdpbmRvd1xuICAgICAgKSxcbiAgICAgIG1pbldpZHRoID0gcGFyc2VJbnQoYXR0cmlidXRlcy5taW5XaWR0aCwgMTApIHx8IDAsXG4gICAgICBtaW5IZWlnaHQgPSBwYXJzZUludChhdHRyaWJ1dGVzLm1pbmRIZWlnaHQsIDEwKSB8fCAwLFxuICAgICAgbWF4V2lkdGggPSBwYXJzZUludChhdHRyaWJ1dGVzLm1heFdpZHRoLCAxMCkgfHwgSW5maW5pdHksXG4gICAgICBtYXhIZWlnaHQgPSBwYXJzZUludChhdHRyaWJ1dGVzLm1heEhlaWdodCwgMTApIHx8IEluZmluaXR5LFxuICAgICAgd2lkdGhJc0xlc3NXaXRoID0gcGFyc2VJbnQoYXR0cmlidXRlcy53aWR0aElzTGVzc1dpdGgsIDEwKSB8fCAwLFxuICAgICAgaGVpZ2h0SXNMZXNzV2l0aCA9IHBhcnNlSW50KGF0dHJpYnV0ZXMuaGVpZ2h0SXNMZXNzV2l0aCwgMTApIHx8IDAsXG5cbiAgICAgIHJldmVyc2VJblBvcnRyYWl0ID0gdHJ1ZTtcblxuICAgIHNjb3BlLmdldFdpbmRvd0hlaWdodCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIG1heCwgbWluLFxuICAgICAgICBoZWlnaHQsIHdpZHRoO1xuXG4gICAgICBoZWlnaHQgPSAoJHdpbmRvdy5pbm5lckhlaWdodCA+IDApID8gJHdpbmRvdy5pbm5lckhlaWdodCA6IHNjcmVlbi5oZWlnaHQ7XG4gICAgICB3aWR0aCA9ICgkd2luZG93LmlubmVyV2lkdGggPiAwKSA/ICR3aW5kb3cuaW5uZXJXaWR0aCA6IHNjcmVlbi53aWR0aDtcblxuICAgICAgaWYgKHJldmVyc2VJblBvcnRyYWl0ICYmIGhlaWdodD53aWR0aCkge1xuICAgICAgICBtYXggPSBtYXhXaWR0aDtcbiAgICAgICAgbWluID0gbWluV2lkdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXggPSBtYXhIZWlnaHQ7XG4gICAgICAgIG1pbiA9IG1pbkhlaWdodDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKGhlaWdodC1oZWlnaHRJc0xlc3NXaXRoLCBtYXgpLCBtaW4pO1xuICAgIH07XG5cbiAgICBzY29wZS5nZXRXaW5kb3dXaWR0aCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIG1heCwgbWluLFxuICAgICAgICBoZWlnaHQsIHdpZHRoO1xuXG4gICAgICBoZWlnaHQgPSAoJHdpbmRvdy5pbm5lckhlaWdodCA+IDApID8gJHdpbmRvdy5pbm5lckhlaWdodCA6IHNjcmVlbi5oZWlnaHQ7XG4gICAgICB3aWR0aCA9ICgkd2luZG93LmlubmVyV2lkdGggPiAwKSA/ICR3aW5kb3cuaW5uZXJXaWR0aCA6IHNjcmVlbi53aWR0aDtcblxuICAgICAgaWYgKHJldmVyc2VJblBvcnRyYWl0ICYmIGhlaWdodD53aWR0aCkge1xuICAgICAgICBtYXggPSBtYXhIZWlnaHQ7XG4gICAgICAgIG1pbiA9IG1pbkhlaWdodDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heCA9IG1heFdpZHRoO1xuICAgICAgICBtaW4gPSBtaW5XaWR0aDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKHdpZHRoLXdpZHRoSXNMZXNzV2l0aCwgbWF4KSwgbWluKTtcbiAgICB9O1xuXG4gICAgc2NvcGUuJHdhdGNoKHNjb3BlLmdldFdpbmRvd1dpZHRoLFxuICAgICAgZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgIGVsZW1lbnQub3V0ZXJXaWR0aChuZXdWYWx1ZSk7XG4gICAgICB9KTtcblxuICAgIHNjb3BlLiR3YXRjaChzY29wZS5nZXRXaW5kb3dIZWlnaHQsXG4gICAgICBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgZWxlbWVudC5vdXRlckhlaWdodChuZXdWYWx1ZSk7XG4gICAgICB9KTtcblxuICAgIHdpbmRvdy5iaW5kKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICB9KTtcblxuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzaXplVG9XaW5kb3dNb2R1bGU7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHNjb3BlLCBkaWFncmFtU2VydmljZSwgd2lyaW5nU2VydmljZSwgb3BlcmF0aW9uc01hbmFnZXIsICRsb2cpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZ2V0T2Zmc2V0VG9Nb3VzZSxcbiAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yLFxuICAgICAgICBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IsXG5cbiAgICAgICAgb25EaWFncmFtTW91c2VVcCxcbiAgICAgICAgb25EaWFncmFtTW91c2VNb3ZlLFxuICAgICAgICBvbkRpYWdyYW1Nb3VzZUxlYXZlLFxuICAgICAgICBvbldpbmRvd0JsdXIsXG4gICAgICAgIG9uQ29tcG9uZW50TW91c2VVcCxcbiAgICAgICAgb25Db21wb25lbnRNb3VzZURvd24sXG5cbiAgICAgICAgc3RhcnREcmFnLFxuICAgICAgICBmaW5pc2hEcmFnLFxuICAgICAgICBjYW5jZWxEcmFnO1xuXG5cbiAgICBnZXRPZmZzZXRUb01vdXNlID0gZnVuY3Rpb24gKCAkZXZlbnQgKSB7XG5cbiAgICAgICAgdmFyIG9mZnNldDtcblxuICAgICAgICBvZmZzZXQgPSB7XG4gICAgICAgICAgICB4OiAkZXZlbnQucGFnZVggLSAkc2NvcGUuZWxlbWVudE9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgeTogJGV2ZW50LnBhZ2VZIC0gJHNjb3BlLmVsZW1lbnRPZmZzZXQudG9wXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG9mZnNldDtcblxuICAgIH07XG5cblxuICAgIHN0YXJ0RHJhZyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBzZWxmLmRyYWdnaW5nID0gdHJ1ZTtcblxuICAgICAgICAvL3NlbGYuZHJhZ09wZXJhdGlvbiA9IG9wZXJhdGlvbnNNYW5hZ2VyLmluaXROZXcoJ3NldENvbXBvbmVudFBvc2l0aW9uJyk7XG5cbiAgICAgICAgZHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yO1xuICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgICRsb2cuZGVidWcoICdEcmFnZ2luZycsIGRyYWdUYXJnZXRzRGVzY3JpcHRvciApO1xuXG4gICAgfTtcblxuICAgIGNhbmNlbERyYWcgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgIGlmICggZHJhZ1RhcmdldHNEZXNjcmlwdG9yICkge1xuXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goIGRyYWdUYXJnZXRzRGVzY3JpcHRvci50YXJnZXRzLCBmdW5jdGlvbiAoIHRhcmdldCApIHtcblxuICAgICAgICAgICAgICAgIHRhcmdldC5jb21wb25lbnQuc2V0UG9zaXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5vcmlnaW5hbFBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5vcmlnaW5hbFBvc2l0aW9uLnlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZHJhZ1RhcmdldHNEZXNjcmlwdG9yLmFmZmVjdGVkV2lyZXMsIGZ1bmN0aW9uICggd2lyZSApIHtcblxuICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UuYWRqdXN0V2lyZUVuZFNlZ21lbnRzKCB3aXJlICk7XG5cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgZHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gbnVsbDtcblxuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5kcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgfTtcblxuICAgIGZpbmlzaERyYWcgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgc2VsZi5kcmFnZ2luZyA9IGZhbHNlO1xuXG4vLyAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRyYWdUYXJnZXRzRGVzY3JpcHRvci50YXJnZXRzLCBmdW5jdGlvbih0YXJnZXQpIHtcbi8vXG4vLyAgICAgICAgICAgIHZhciBwb3NpdGlvbjtcbi8vXG4vLyAgICAgICAgICAgIHBvc2l0aW9uID0gdGFyZ2V0LmNvbXBvbmVudC5nZXRQb3NpdGlvbigpO1xuLy9cbi8vICAgICAgICAgICAgc2VsZi5kcmFnT3BlcmF0aW9uLmNvbW1pdCggdGFyZ2V0LmNvbXBvbmVudCwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSApO1xuLy8gICAgICAgIH0pO1xuXG5cbiAgICAgICAgZHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gbnVsbDtcblxuICAgICAgICAkbG9nLmRlYnVnKCAnRmluaXNoIGRyYWdnaW5nJyApO1xuXG4gICAgfTtcblxuICAgIG9uRGlhZ3JhbU1vdXNlTW92ZSA9IGZ1bmN0aW9uKCRldmVudCkge1xuXG4gICAgICAgIGlmICggcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yICkge1xuICAgICAgICAgICAgc3RhcnREcmFnKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGRyYWdUYXJnZXRzRGVzY3JpcHRvciApIHtcblxuICAgICAgICAgICAgdmFyIG9mZnNldDtcblxuICAgICAgICAgICAgb2Zmc2V0ID0gZ2V0T2Zmc2V0VG9Nb3VzZSggJGV2ZW50ICk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZHJhZ1RhcmdldHNEZXNjcmlwdG9yLnRhcmdldHMsIGZ1bmN0aW9uICggdGFyZ2V0ICkge1xuXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmNvbXBvbmVudC5zZXRQb3NpdGlvbihcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0LnggKyB0YXJnZXQuZGVsdGFUb0N1cnNvci54LFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQueSArIHRhcmdldC5kZWx0YVRvQ3Vyc29yLnlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZHJhZ1RhcmdldHNEZXNjcmlwdG9yLmFmZmVjdGVkV2lyZXMsIGZ1bmN0aW9uICggd2lyZSApIHtcblxuICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UuYWRqdXN0V2lyZUVuZFNlZ21lbnRzKCB3aXJlICk7XG5cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtTW91c2VVcCA9IGZ1bmN0aW9uKCRldmVudCkge1xuXG4gICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKCBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgKSB7XG4gICAgICAgICAgICBmaW5pc2hEcmFnKCk7XG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBvbkRpYWdyYW1Nb3VzZUxlYXZlID0gZnVuY3Rpb24oLyokZXZlbnQqLykge1xuXG4gICAgICAgIGNhbmNlbERyYWcoKTtcblxuICAgIH07XG5cbiAgICBvbldpbmRvd0JsdXIgPSBmdW5jdGlvbigvKiRldmVudCovKSB7XG5cbiAgICAgICAgY2FuY2VsRHJhZygpO1xuXG4gICAgfTtcblxuICAgIG9uQ29tcG9uZW50TW91c2VVcCA9IGZ1bmN0aW9uKGNvbXBvbmVudCwgJGV2ZW50KSB7XG5cbiAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gbnVsbDtcblxuICAgICAgICBpZiAoIGRyYWdUYXJnZXRzRGVzY3JpcHRvciApIHtcbiAgICAgICAgICAgIGZpbmlzaERyYWcoKTtcbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIG9uQ29tcG9uZW50TW91c2VEb3duID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgJGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIGNvbXBvbmVudHNUb0RyYWcsXG4gICAgICAgICAgICBnZXREcmFnRGVzY3JpcHRvcjtcblxuICAgICAgICBjb21wb25lbnRzVG9EcmFnID0gW107XG5cbiAgICAgICAgZ2V0RHJhZ0Rlc2NyaXB0b3IgPSBmdW5jdGlvbiAoIGNvbXBvbmVudCApIHtcblxuICAgICAgICAgICAgdmFyIG9mZnNldCA9IGdldE9mZnNldFRvTW91c2UoICRldmVudCApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogY29tcG9uZW50LngsXG4gICAgICAgICAgICAgICAgICAgIHk6IGNvbXBvbmVudC55XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkZWx0YVRvQ3Vyc29yOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IGNvbXBvbmVudC54IC0gb2Zmc2V0LngsXG4gICAgICAgICAgICAgICAgICAgIHk6IGNvbXBvbmVudC55IC0gb2Zmc2V0LnlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgIGlmICggJHNjb3BlLmRpYWdyYW0uY29uZmlnLmVkaXRhYmxlID09PSB0cnVlICYmXG4gICAgICAgICAgICBjb21wb25lbnQubm9uU2VsZWN0YWJsZSAhPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgY29tcG9uZW50LmxvY2F0aW9uTG9ja2VkICE9PSB0cnVlICkge1xuXG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvciA9IHtcbiAgICAgICAgICAgICAgICB0YXJnZXRzOiBbIGdldERyYWdEZXNjcmlwdG9yKCBjb21wb25lbnQgKSBdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb21wb25lbnRzVG9EcmFnLnB1c2goIGNvbXBvbmVudCApO1xuXG4gICAgICAgICAgICBpZiAoICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmluZGV4T2YoIGNvbXBvbmVudC5pZCApID4gLTEgKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBEcmFnIGFsb25nIG90aGVyIHNlbGVjdGVkIGNvbXBvbmVudHNcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMsIGZ1bmN0aW9uICggc2VsZWN0ZWRDb21wb25lbnRJZCApIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWRDb21wb25lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBjb21wb25lbnQuaWQgIT09IHNlbGVjdGVkQ29tcG9uZW50SWQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ29tcG9uZW50ID0gJHNjb3BlLmRpYWdyYW0uY29tcG9uZW50c0J5SWRbIHNlbGVjdGVkQ29tcG9uZW50SWQgXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yLnRhcmdldHMucHVzaCggZ2V0RHJhZ0Rlc2NyaXB0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDb21wb25lbnQgKSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9EcmFnLnB1c2goIHNlbGVjdGVkQ29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IuYWZmZWN0ZWRXaXJlcyA9ICRzY29wZS5kaWFncmFtLmdldFdpcmVzRm9yQ29tcG9uZW50cyhcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9EcmFnXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB0aGlzLm9uRGlhZ3JhbU1vdXNlVXAgPSBvbkRpYWdyYW1Nb3VzZVVwO1xuICAgIHRoaXMub25EaWFncmFtTW91c2VNb3ZlID0gb25EaWFncmFtTW91c2VNb3ZlO1xuICAgIHRoaXMub25EaWFncmFtTW91c2VMZWF2ZSA9IG9uRGlhZ3JhbU1vdXNlTGVhdmU7XG4gICAgdGhpcy5vbldpbmRvd0JsdXIgPSBvbldpbmRvd0JsdXI7XG4gICAgdGhpcy5vbkNvbXBvbmVudE1vdXNlVXAgPSBvbkNvbXBvbmVudE1vdXNlVXA7XG4gICAgdGhpcy5vbkNvbXBvbmVudE1vdXNlRG93biA9IG9uQ29tcG9uZW50TW91c2VEb3duO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbn07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkc2NvcGUsIGRpYWdyYW1TZXJ2aWNlLCBncmlkU2VydmljZSwgJGxvZykge1xuXG4gICAgdmFyIG9uQ29tcG9uZW50TW91c2VVcCxcblxuICAgICAgICBtb3ZlQ29tcG9uZW50RWxlbWVudFRvRnJvbnQsXG4gICAgICAgIHRvZ2dsZUNvbXBvbmVudFNlbGVjdGVkO1xuXG5cbiAgICBtb3ZlQ29tcG9uZW50RWxlbWVudFRvRnJvbnQgPSBmdW5jdGlvbiAoIGNvbXBvbmVudElkICkge1xuXG4gICAgICAgIHZhciB6LFxuICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgbmVlZHNUb2JlUmVvcmRlcmVkO1xuXG4gICAgICAgIG5lZWRzVG9iZVJlb3JkZXJlZCA9IGZhbHNlO1xuXG4gICAgICAgIHogPSBkaWFncmFtU2VydmljZS5nZXRIaWdoZXN0WigpO1xuICAgICAgICBjb21wb25lbnQgPSAkc2NvcGUuZGlhZ3JhbS5jb21wb25lbnRzQnlJZFsgY29tcG9uZW50SWQgXTtcblxuICAgICAgICBpZiAoIGlzTmFOKCBjb21wb25lbnQueiApICkge1xuICAgICAgICAgICAgY29tcG9uZW50LnogPSB6O1xuICAgICAgICAgICAgbmVlZHNUb2JlUmVvcmRlcmVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICggY29tcG9uZW50LnogPCB6ICkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC56ID0geiArIDE7XG4gICAgICAgICAgICAgICAgbmVlZHNUb2JlUmVvcmRlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggbmVlZHNUb2JlUmVvcmRlcmVkICkge1xuICAgICAgICAgICAgZ3JpZFNlcnZpY2UucmVvcmRlclZpc2libGVDb21wb25lbnRzKCAkc2NvcGUuaWQgKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgdG9nZ2xlQ29tcG9uZW50U2VsZWN0ZWQgPSAgZnVuY3Rpb24gKCBjb21wb25lbnQsICRldmVudCApIHtcblxuICAgICAgICB2YXIgaW5kZXg7XG5cbiAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggY29tcG9uZW50ICkgJiYgJHNjb3BlLmRpYWdyYW0uY29uZmlnLmRpc2FsbG93U2VsZWN0aW9uICE9PSB0cnVlICYmIGNvbXBvbmVudC5ub25TZWxlY3RhYmxlICE9PSB0cnVlICkge1xuXG4gICAgICAgICAgICBpbmRleCA9ICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmluZGV4T2YoIGNvbXBvbmVudC5pZCApO1xuXG4gICAgICAgICAgICBpZiAoIGluZGV4ID4gLTEgKSB7XG5cbiAgICAgICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcy5zcGxpY2UoIGluZGV4LCAxICk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnLm11bHRpU2VsZWN0ICE9PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICAgICRldmVudC5zaGlmdEtleSAhPT0gdHJ1ZSApIHtcblxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLCBmdW5jdGlvbiAoIGNvbXBvbmVudElkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29tcG9uZW50c0J5SWRbIGNvbXBvbmVudElkIF0uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLnB1c2goIGNvbXBvbmVudC5pZCApO1xuXG4gICAgICAgICAgICAgICAgbW92ZUNvbXBvbmVudEVsZW1lbnRUb0Zyb250KCBjb21wb25lbnQuaWQgKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkbG9nLmRlYnVnKCdzZWxlY3RlZHMnLCAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcyk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgb25Db21wb25lbnRNb3VzZVVwID0gZnVuY3Rpb24oY29tcG9uZW50LCAkZXZlbnQpIHtcbiAgICAgICAgdG9nZ2xlQ29tcG9uZW50U2VsZWN0ZWQoIGNvbXBvbmVudCwgJGV2ZW50ICk7XG5cbiAgICB9O1xuXG4gICAgdGhpcy5vbkNvbXBvbmVudE1vdXNlVXAgPSBvbkNvbXBvbmVudE1vdXNlVXA7XG5cbiAgICByZXR1cm4gdGhpcztcblxufTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRzY29wZSwgZGlhZ3JhbVNlcnZpY2UsIHdpcmluZ1NlcnZpY2UsIGdyaWRTZXJ2aWNlLCAkbG9nKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXMsXG5cbiAgICAgICAgV2lyZSA9IHJlcXVpcmUoICcuLi8uLi8uLi9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL1dpcmUuanMnICksXG5cbiAgICAgICAgd2lyZVN0YXJ0LFxuXG4gICAgICAgIHN0YXJ0V2lyZSxcbiAgICAgICAgYWRkQ29ybmVyVG9OZXdXaXJlTGluZSxcbiAgICAgICAgZmluaXNoV2lyZSxcbiAgICAgICAgY2FuY2VsV2lyZSxcblxuICAgICAgICBvbkRpYWdyYW1Nb3VzZVVwLFxuICAgICAgICBvbkRpYWdyYW1Nb3VzZU1vdmUsXG4gICAgICAgIG9uRGlhZ3JhbU1vdXNlTGVhdmUsXG4gICAgICAgIG9uV2luZG93Qmx1cixcbiAgICAgICAgb25Qb3J0TW91c2VEb3duO1xuXG5cblxuICAgIHN0YXJ0V2lyZSA9IGZ1bmN0aW9uIChjb21wb25lbnQsIHBvcnQpIHtcblxuICAgICAgICB3aXJlU3RhcnQgPSB7XG4gICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudCxcbiAgICAgICAgICAgIHBvcnQ6IHBvcnRcbiAgICAgICAgfTtcblxuICAgICAgICAkbG9nLmRlYnVnKCAnU3RhcnRpbmcgd2lyZScsIHdpcmVTdGFydCApO1xuXG4gICAgICAgIHNlbGYud2lyaW5nID0gdHJ1ZTtcblxuICAgIH07XG5cbiAgICBhZGRDb3JuZXJUb05ld1dpcmVMaW5lID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBsYXN0U2VnbWVudDtcblxuICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHMgPSAkc2NvcGUubmV3V2lyZUxpbmUuc2VnbWVudHM7XG5cbiAgICAgICAgbGFzdFNlZ21lbnQgPSAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHNbICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cy5sZW5ndGggLSAxIF07XG5cbiAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDogbGFzdFNlZ21lbnQueDIsXG4gICAgICAgICAgICB5OiBsYXN0U2VnbWVudC55MlxuICAgICAgICB9O1xuXG4gICAgfTtcblxuICAgIGZpbmlzaFdpcmUgPSBmdW5jdGlvbiAoIGNvbXBvbmVudCwgcG9ydCApIHtcblxuICAgICAgICB2YXIgd2lyZSA9IG5ldyBXaXJlKCB7XG4gICAgICAgICAgICBpZDogJ25ldy13aXJlLScgKyBNYXRoLnJvdW5kKCBNYXRoLnJhbmRvbSgpICogMTAwMDAgKSxcbiAgICAgICAgICAgIGVuZDE6IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHdpcmVTdGFydC5jb21wb25lbnQsXG4gICAgICAgICAgICAgICAgcG9ydDogd2lyZVN0YXJ0LnBvcnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbmQyOiB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgcG9ydDogcG9ydFxuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgd2lyZS5zZWdtZW50cyA9IGFuZ3VsYXIuY29weShcbiAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cy5jb25jYXQoXG4gICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDE6ICRzY29wZS5uZXdXaXJlTGluZS5hY3RpdmVTZWdtZW50U3RhcnRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDI6IHBvcnQuZ2V0R3JpZFBvc2l0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ0VsYm93Um91dGVyJ1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkgKTtcblxuXG4gICAgICAgIGRpYWdyYW1TZXJ2aWNlLmFkZFdpcmUoICRzY29wZS5pZCwgd2lyZSApO1xuXG4gICAgICAgICRzY29wZS5kaWFncmFtLndpcmVzWyB3aXJlLmlkIF0gPSB3aXJlO1xuXG4gICAgICAgIGdyaWRTZXJ2aWNlLmludmFsaWRhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMoICRzY29wZS5pZCApO1xuXG4gICAgICAgICRsb2cuZGVidWcoICdGaW5pc2ggd2lyZScsIHdpcmUgKTtcblxuICAgICAgICB3aXJlU3RhcnQgPSBudWxsO1xuICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUgPSBudWxsO1xuXG4gICAgICAgIHNlbGYud2lyaW5nID0gZmFsc2U7XG5cbiAgICB9O1xuXG4gICAgY2FuY2VsV2lyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lID0gbnVsbDtcbiAgICAgICAgd2lyZVN0YXJ0ID0gbnVsbDtcbiAgICAgICAgc2VsZi53aXJpbmcgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgb25EaWFncmFtTW91c2VNb3ZlID0gZnVuY3Rpb24oJGV2ZW50KSB7XG5cbiAgICAgICAgaWYgKCB3aXJlU3RhcnQgKSB7XG5cblxuICAgICAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lID0gJHNjb3BlLm5ld1dpcmVMaW5lIHx8IHt9O1xuICAgICAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzID0gJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzIHx8IFtdO1xuICAgICAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uID1cbiAgICAgICAgICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUuYWN0aXZlU2VnbWVudFN0YXJ0UG9zaXRpb24gfHwgd2lyZVN0YXJ0LnBvcnQuZ2V0R3JpZFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5zZWdtZW50cyA9ICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cy5jb25jYXQoXG4gICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDE6ICRzY29wZS5uZXdXaXJlTGluZS5hY3RpdmVTZWdtZW50U3RhcnRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAkZXZlbnQucGFnZVggLSAkc2NvcGUuZWxlbWVudE9mZnNldC5sZWZ0IC0gMyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAkZXZlbnQucGFnZVkgLSAkc2NvcGUuZWxlbWVudE9mZnNldC50b3AgLSAzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdFbGJvd1JvdXRlcidcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBvbkRpYWdyYW1Nb3VzZVVwID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKCB3aXJlU3RhcnQgKSB7XG5cbiAgICAgICAgICAgIGFkZENvcm5lclRvTmV3V2lyZUxpbmUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIG9uUG9ydE1vdXNlRG93biA9IGZ1bmN0aW9uKCBjb21wb25lbnQsIHBvcnQsICRldmVudCApIHtcblxuICAgICAgICBpZiAoIHdpcmVTdGFydCApIHtcblxuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICBpZiAoIHdpcmVTdGFydC5wb3J0ICE9PSBwb3J0ICkge1xuICAgICAgICAgICAgICAgIGZpbmlzaFdpcmUoIGNvbXBvbmVudCwgcG9ydCApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYW5jZWxXaXJlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgc3RhcnRXaXJlKGNvbXBvbmVudCwgcG9ydCk7XG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIG9uRGlhZ3JhbU1vdXNlTGVhdmUgPSBmdW5jdGlvbigvKiRldmVudCovKSB7XG4gICAgICAgIGlmIChzZWxmLndpcmluZykge1xuICAgICAgICAgICAgY2FuY2VsV2lyZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uV2luZG93Qmx1ciA9IGZ1bmN0aW9uKC8qJGV2ZW50Ki8pIHtcbiAgICAgICAgaWYgKHNlbGYud2lyaW5nKSB7XG4gICAgICAgICAgICBjYW5jZWxXaXJlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICB0aGlzLm9uRGlhZ3JhbU1vdXNlVXAgPSBvbkRpYWdyYW1Nb3VzZVVwO1xuICAgIHRoaXMub25EaWFncmFtTW91c2VNb3ZlID0gb25EaWFncmFtTW91c2VNb3ZlO1xuICAgIHRoaXMub25EaWFncmFtTW91c2VMZWF2ZSA9IG9uRGlhZ3JhbU1vdXNlTGVhdmU7XG4gICAgdGhpcy5vbldpbmRvd0JsdXIgPSBvbldpbmRvd0JsdXI7XG4gICAgdGhpcy5vblBvcnRNb3VzZURvd24gPSBvblBvcnRNb3VzZURvd247XG5cbiAgICByZXR1cm4gdGhpcztcblxufTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCAkKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkc2NvcGUsIGRpYWdyYW1TZXJ2aWNlLCAkdGltZW91dCwgY29udGV4dG1lbnVTZXJ2aWNlLCBvcGVyYXRpb25zTWFuYWdlciwgJGxvZykge1xuXG4gICAgdmFyXG4gICAgICAgIG9uQ29tcG9uZW50Q29udGV4dG1lbnUsXG4gICAgICAgIG9uUG9ydENvbnRleHRtZW51LFxuICAgICAgICBvbkRpYWdyYW1Db250ZXh0bWVudSxcbiAgICAgICAgb25EaWFncmFtTW91c2VEb3duLFxuXG4gICAgICAgIG9wZW5NZW51O1xuXG4gICAgJGxvZy5kZWJ1ZygnSW5pdGlhbGl6aW5nIGNvbnRleHQgbWVudXMuJyk7XG5cbiAgICBvcGVuTWVudSA9IGZ1bmN0aW9uKCRldmVudCkge1xuXG4gICAgICAgIGNvbnRleHRtZW51U2VydmljZS5jbG9zZSgpO1xuXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIG9wZW5Db250ZXh0TWVudUV2ZW50O1xuXG4gICAgICAgICAgICAgICAgb3BlbkNvbnRleHRNZW51RXZlbnQgPSBhbmd1bGFyLmV4dGVuZCgkLkV2ZW50KCdvcGVuQ29udGV4dE1lbnUnKSwge1xuICAgICAgICAgICAgICAgIGNsaWVudFg6ICRldmVudC5jbGllbnRYLFxuICAgICAgICAgICAgICAgIGNsaWVudFk6ICRldmVudC5jbGllbnRZLFxuICAgICAgICAgICAgICAgIHBhZ2VYOiAkZXZlbnQucGFnZVgsXG4gICAgICAgICAgICAgICAgcGFnZVk6ICRldmVudC5wYWdlWSxcbiAgICAgICAgICAgICAgICBzY3JlZW5YOiAkZXZlbnQuc2NyZWVuWCxcbiAgICAgICAgICAgICAgICBzY3JlZW5ZOiAkZXZlbnQuc2NyZWVuWSxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICRldmVudC50YXJnZXRcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkc2NvcGUuJGVsZW1lbnQudHJpZ2dlckhhbmRsZXIob3BlbkNvbnRleHRNZW51RXZlbnQpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIG9uRGlhZ3JhbU1vdXNlRG93biA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb250ZXh0bWVudVNlcnZpY2UuY2xvc2UoKTtcbiAgICB9O1xuXG4gICAgb25Db21wb25lbnRDb250ZXh0bWVudSA9IGZ1bmN0aW9uIChjb21wb25lbnQsICRldmVudCkge1xuXG4gICAgICAgICRzY29wZS5jb250ZXh0TWVudURhdGEgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICdyZXBvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ3JvdGF0ZUNXJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUm90YXRlIENXJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXJvdGF0ZS1yaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcGVyYXRpb247XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24gPSBvcGVyYXRpb25zTWFuYWdlci5pbml0TmV3KCdyb3RhdGVDb21wb25lbnRzJywgY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24uc2V0KDkwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tbWl0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncm90YXRlQ0NXJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUm90YXRlIENDVycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1yb3RhdGUtbGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcGVyYXRpb247XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUm90YXRpbmcgYW50aS1jbG9ja3dpc2UnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbiA9IG9wZXJhdGlvbnNNYW5hZ2VyLmluaXROZXcoJ3JvdGF0ZUNvbXBvbmVudHMnLCBjb21wb25lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5zZXQoLTkwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tbWl0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuICAgICAgICBvcGVuTWVudSgkZXZlbnQpO1xuXG4gICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIH07XG5cbiAgICBvblBvcnRDb250ZXh0bWVudSA9IGZ1bmN0aW9uIChjb21wb25lbnQsIHBvcnQsICRldmVudCkge1xuXG4gICAgICAgICRzY29wZS5jb250ZXh0TWVudURhdGEgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICdwcm9wZXJ0aWVzJyxcbiAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2luZm8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdJbmZvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BvcnQgaW5mbycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHt9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgb3Blbk1lbnUoJGV2ZW50KTtcblxuICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgfTtcblxuICAgIG9uRGlhZ3JhbUNvbnRleHRtZW51ID0gZnVuY3Rpb24gKCRldmVudCkge1xuXG4gICAgICAgICRzY29wZS5jb250ZXh0TWVudURhdGEgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICdhYm91dCcsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdnZXRTdGF0cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N0YXRpc3RpY3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBsdXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1N0YXRpc3RpY3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7fVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgIG9wZW5NZW51KCRldmVudCk7XG5cbiAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgfTtcblxuICAgIHRoaXMub25EaWFncmFtQ29udGV4dG1lbnUgPSBvbkRpYWdyYW1Db250ZXh0bWVudTtcbiAgICB0aGlzLm9uQ29tcG9uZW50Q29udGV4dG1lbnUgPSBvbkNvbXBvbmVudENvbnRleHRtZW51O1xuICAgIHRoaXMub25Qb3J0Q29udGV4dG1lbnUgPSBvblBvcnRDb250ZXh0bWVudTtcbiAgICB0aGlzLm9uRGlhZ3JhbU1vdXNlRG93biA9IG9uRGlhZ3JhbU1vdXNlRG93bjtcblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIsICQqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5yZXF1aXJlKCcuLi9jb21wb25lbnRXaXJlL2NvbXBvbmVudFdpcmUuanMnKTtcblxuYW5ndWxhci5tb2R1bGUoJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN2Z0RpYWdyYW0nLCBbXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmdyaWRTZXJ2aWNlJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uY29tcG9uZW50V2lyZScsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLm9wZXJhdGlvbnNNYW5hZ2VyJyxcbiAgICAnaXNpcy51aS5jb250ZXh0bWVudSdcbl0pXG4gICAgLmNvbnRyb2xsZXIoJ1NWR0RpYWdyYW1Db250cm9sbGVyJywgZnVuY3Rpb24gKFxuICAgICAgICAkc2NvcGUsICRsb2csIGRpYWdyYW1TZXJ2aWNlLCB3aXJpbmdTZXJ2aWNlLCBncmlkU2VydmljZSwgJHdpbmRvdywgJHRpbWVvdXQsIGNvbnRleHRtZW51U2VydmljZSwgb3BlcmF0aW9uc01hbmFnZXIpIHtcblxuICAgICAgICB2YXJcblxuICAgICAgICAgICAgQ29tcG9uZW50U2VsZWN0aW9uSGFuZGxlciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9Db21wb25lbnRTZWxlY3Rpb25IYW5kbGVyJyksXG4gICAgICAgICAgICBjb21wb25lbnRTZWxlY3Rpb25IYW5kbGVyLFxuXG4gICAgICAgICAgICBDb21wb25lbnREcmFnSGFuZGxlciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9Db21wb25lbnREcmFnSGFuZGxlcicpLFxuICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIsXG5cbiAgICAgICAgICAgIFdpcmVEcmF3SGFuZGxlciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9XaXJlRHJhd0hhbmRsZXInKSxcbiAgICAgICAgICAgIHdpcmVEcmF3SGFuZGxlcixcblxuICAgICAgICAgICAgQ29udGV4dE1lbnVIYW5kbGVyID0gcmVxdWlyZSgnLi9jbGFzc2VzL2NvbnRleHRNZW51SGFuZGxlcicpLFxuICAgICAgICAgICAgY29udGV4dE1lbnVIYW5kbGVyLFxuXG4gICAgICAgICAgICBjb21wb25lbnRFbGVtZW50cyxcblxuICAgICAgICAgICAgJCR3aW5kb3c7XG5cbiAgICAgICAgJCR3aW5kb3cgPSAkKCR3aW5kb3cpO1xuXG4gICAgICAgIGNvbXBvbmVudERyYWdIYW5kbGVyID0gbmV3IENvbXBvbmVudERyYWdIYW5kbGVyKFxuICAgICAgICAgICAgJHNjb3BlLFxuICAgICAgICAgICAgZGlhZ3JhbVNlcnZpY2UsXG4gICAgICAgICAgICB3aXJpbmdTZXJ2aWNlLFxuICAgICAgICAgICAgb3BlcmF0aW9uc01hbmFnZXIsXG4gICAgICAgICAgICAkbG9nXG4gICAgICAgICk7XG5cbiAgICAgICAgY29tcG9uZW50U2VsZWN0aW9uSGFuZGxlciA9IG5ldyBDb21wb25lbnRTZWxlY3Rpb25IYW5kbGVyKFxuICAgICAgICAgICAgJHNjb3BlLFxuICAgICAgICAgICAgZGlhZ3JhbVNlcnZpY2UsXG4gICAgICAgICAgICBncmlkU2VydmljZSxcbiAgICAgICAgICAgICRsb2dcbiAgICAgICAgKTtcblxuICAgICAgICB3aXJlRHJhd0hhbmRsZXIgPSBuZXcgV2lyZURyYXdIYW5kbGVyKFxuICAgICAgICAgICAgJHNjb3BlLFxuICAgICAgICAgICAgZGlhZ3JhbVNlcnZpY2UsXG4gICAgICAgICAgICB3aXJpbmdTZXJ2aWNlLFxuICAgICAgICAgICAgZ3JpZFNlcnZpY2UsXG4gICAgICAgICAgICAkbG9nXG4gICAgICAgICk7XG5cbiAgICAgICAgY29udGV4dE1lbnVIYW5kbGVyID0gbmV3IENvbnRleHRNZW51SGFuZGxlcihcbiAgICAgICAgICAgICRzY29wZSxcbiAgICAgICAgICAgIGRpYWdyYW1TZXJ2aWNlLFxuICAgICAgICAgICAgJHRpbWVvdXQsXG4gICAgICAgICAgICBjb250ZXh0bWVudVNlcnZpY2UsXG4gICAgICAgICAgICBvcGVyYXRpb25zTWFuYWdlcixcbiAgICAgICAgICAgICRsb2dcbiAgICAgICAgKTtcblxuICAgICAgICAkc2NvcGUub25EaWFncmFtTW91c2VEb3duID0gZnVuY3Rpb24gKCRldmVudCkge1xuXG5cblxuICAgICAgICAgICAgaWYgKCRldmVudC53aGljaCA9PT0gMykge1xuXG4gICAgICAgICAgICAgICAgY29udGV4dE1lbnVIYW5kbGVyLm9uRGlhZ3JhbUNvbnRleHRtZW51KCRldmVudCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0TWVudUhhbmRsZXIub25EaWFncmFtTW91c2VEb3duKCRldmVudCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG5cbiAgICAgICAgJHNjb3BlLm9uRGlhZ3JhbU1vdXNlVXAgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudERyYWdIYW5kbGVyLm9uRGlhZ3JhbU1vdXNlVXAoJGV2ZW50KTtcbiAgICAgICAgICAgIHdpcmVEcmF3SGFuZGxlci5vbkRpYWdyYW1Nb3VzZVVwKCRldmVudCk7XG5cbiAgICAgICAgfTtcblxuXG4gICAgICAgICRzY29wZS5vbkRpYWdyYW1DbGljayA9IGZ1bmN0aW9uICgvKiRldmVudCovKSB7XG5cblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vbkRpYWdyYW1Nb3VzZU1vdmUgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudERyYWdIYW5kbGVyLm9uRGlhZ3JhbU1vdXNlTW92ZSgkZXZlbnQpO1xuICAgICAgICAgICAgd2lyZURyYXdIYW5kbGVyLm9uRGlhZ3JhbU1vdXNlTW92ZSgkZXZlbnQpO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmdldENzc0NsYXNzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgICAgIGlmIChjb21wb25lbnREcmFnSGFuZGxlci5kcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSAnZHJhZ2dpbmcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9uRGlhZ3JhbU1vdXNlTGVhdmUgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudERyYWdIYW5kbGVyLm9uRGlhZ3JhbU1vdXNlTGVhdmUoJGV2ZW50KTtcbiAgICAgICAgICAgIHdpcmVEcmF3SGFuZGxlci5vbkRpYWdyYW1Nb3VzZUxlYXZlKCRldmVudCk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkJHdpbmRvdy5ibHVyKGZ1bmN0aW9uICgkZXZlbnQpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25XaW5kb3dCbHVyKCRldmVudCk7XG4gICAgICAgICAgICB3aXJlRHJhd0hhbmRsZXIub25XaW5kb3dCbHVyKCRldmVudCk7XG5cbiAgICAgICAgfSk7XG5cblxuICAgICAgICAvLyBJbnRlcmFjdGlvbnMgd2l0aCBjb21wb25lbnRzXG5cbiAgICAgICAgdGhpcy5vbkNvbXBvbmVudE1vdXNlVXAgPSBmdW5jdGlvbiAoY29tcG9uZW50LCAkZXZlbnQpIHtcblxuICAgICAgICAgICAgaWYgKCFjb21wb25lbnREcmFnSGFuZGxlci5kcmFnZ2luZykge1xuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50U2VsZWN0aW9uSGFuZGxlci5vbkNvbXBvbmVudE1vdXNlVXAoY29tcG9uZW50LCAkZXZlbnQpO1xuICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudERyYWdIYW5kbGVyLm9uQ29tcG9uZW50TW91c2VVcChjb21wb25lbnQsICRldmVudCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25Db21wb25lbnRNb3VzZVVwKGNvbXBvbmVudCwgJGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uUG9ydE1vdXNlRG93biA9IGZ1bmN0aW9uIChjb21wb25lbnQsIHBvcnQsICRldmVudCkge1xuXG4gICAgICAgICAgICBpZiAoICF3aXJlRHJhd0hhbmRsZXIud2lyaW5nICYmICRldmVudC53aGljaCA9PT0gMyApIHtcblxuICAgICAgICAgICAgICAgIGNvbnRleHRNZW51SGFuZGxlci5vblBvcnRDb250ZXh0bWVudShjb21wb25lbnQsIHBvcnQsICRldmVudCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2lyZURyYXdIYW5kbGVyLm9uUG9ydE1vdXNlRG93bihjb21wb25lbnQsIHBvcnQsICRldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uUG9ydE1vdXNlVXAgPSBmdW5jdGlvbiAoY29tcG9uZW50LCBwb3J0LCAkZXZlbnQpIHtcblxuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vblBvcnRDbGljayA9IGZ1bmN0aW9uIChjb21wb25lbnQsIHBvcnQsICRldmVudCkge1xuXG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uQ29tcG9uZW50TW91c2VEb3duID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgJGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGlmICgkZXZlbnQud2hpY2ggPT09IDMpIHtcblxuICAgICAgICAgICAgICAgIGNvbnRleHRNZW51SGFuZGxlci5vbkNvbXBvbmVudENvbnRleHRtZW51KGNvbXBvbmVudCwgJGV2ZW50KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudERyYWdIYW5kbGVyLm9uQ29tcG9uZW50TW91c2VEb3duKGNvbXBvbmVudCwgJGV2ZW50KTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaXNFZGl0YWJsZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW0uY29uZmlnLmVkaXRhYmxlID09PSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGlzYWxsb3dTZWxlY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICRzY29wZS5kaWFncmFtLmNvbmZpZyA9ICRzY29wZS5kaWFncmFtLmNvbmZpZyB8fCB7fTtcblxuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5kaWFncmFtLmNvbmZpZy5kaXNhbGxvd1NlbGVjdGlvbiA9PT0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50RWxlbWVudCA9IGZ1bmN0aW9uIChpZCwgZWwpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50RWxlbWVudHMgPSBjb21wb25lbnRFbGVtZW50cyB8fCB7fTtcblxuICAgICAgICAgICAgY29tcG9uZW50RWxlbWVudHNbaWRdID0gZWw7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnVucmVnaXN0ZXJDb21wb25lbnRFbGVtZW50ID0gZnVuY3Rpb24gKGlkKSB7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudEVsZW1lbnRzID0gY29tcG9uZW50RWxlbWVudHMgfHwge307XG5cbiAgICAgICAgICAgIGRlbGV0ZSBjb21wb25lbnRFbGVtZW50c1tpZF07XG5cbiAgICAgICAgfTtcblxuICAgICAgICBvcGVyYXRpb25zTWFuYWdlci5yZWdpc3Rlck9wZXJhdGlvbih7XG4gICAgICAgICAgICBpZDogJ3JvdGF0ZUNvbXBvbmVudHMnLFxuICAgICAgICAgICAgb3BlcmF0aW9uQ2xhc3M6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0ID0gZnVuY3Rpb24oY29tcG9uZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0ID0gZnVuY3Rpb24oYW5nbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRzVG9Sb3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmdsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFmZmVjdGVkV2lyZXM7XG5cbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c1RvUm90YXRlID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50ID0gdGhpcy5jb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlID0gdGhpcy5hbmdsZTtcblxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9Sb3RhdGUucHVzaCggdGhpcy5jb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmluZGV4T2YoIHRoaXMuY29tcG9uZW50LmlkICkgPiAtMSApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcywgZnVuY3Rpb24gKCBzZWxlY3RlZENvbXBvbmVudElkICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkQ29tcG9uZW50O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjb21wb25lbnQuaWQgIT09IHNlbGVjdGVkQ29tcG9uZW50SWQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDb21wb25lbnQgPSAkc2NvcGUuZGlhZ3JhbS5jb21wb25lbnRzQnlJZCAgIFsgc2VsZWN0ZWRDb21wb25lbnRJZCBdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHNUb1JvdGF0ZS5wdXNoKCBzZWxlY3RlZENvbXBvbmVudCApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBhZmZlY3RlZFdpcmVzID0gJHNjb3BlLmRpYWdyYW0uZ2V0V2lyZXNGb3JDb21wb25lbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c1RvUm90YXRlXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGNvbXBvbmVudHNUb1JvdGF0ZSwgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQucm90YXRlKGFuZ2xlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goIGFmZmVjdGVkV2lyZXMsIGZ1bmN0aW9uICggd2lyZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UuYWRqdXN0V2lyZUVuZFNlZ21lbnRzKCB3aXJlICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgfSlcbiAgICAuZGlyZWN0aXZlKCdzdmdEaWFncmFtJywgW1xuICAgICAgICAnJHJvb3RTY29wZScsXG4gICAgICAgICckbG9nJyxcbiAgICAgICAgJ2RpYWdyYW1TZXJ2aWNlJyxcbiAgICAgICAgJ2dyaWRTZXJ2aWNlJyxcbiAgICAgICAgZnVuY3Rpb24gKCRyb290U2NvcGUsICRsb2csIGRpYWdyYW1TZXJ2aWNlLCBncmlkU2VydmljZSkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTVkdEaWFncmFtQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgcmVxdWlyZTogJ15kaWFncmFtQ29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvc3ZnRGlhZ3JhbS5odG1sJyxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBraWxsQ29udGV4dE1lbnU7XG5cbiAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGtpbGxDb250ZXh0TWVudSA9IGZ1bmN0aW9uKCRldmVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdraWxsaW5nIGRlZmF1bHQgY29udGV4dG1lbnUnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2goJ2RpYWdyYW0nLCBmdW5jdGlvbihuZXdEaWFncmFtVmFsdWUpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0RpYWdyYW1WYWx1ZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlhZ3JhbSA9IHNjb3BlLmRpYWdyYW0gfHwge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGVsZW1lbnQgPSAkZWxlbWVudDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50Lm91dGVyV2lkdGgoc2NvcGUuZGlhZ3JhbS5jb25maWcud2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50Lm91dGVySGVpZ2h0KHNjb3BlLmRpYWdyYW0uY29uZmlnLndpZHRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmlkID0gaWQgPSBuZXdEaWFncmFtVmFsdWUuaWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5zZXRJbml0aWFsaXplZChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5pbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJ0dyaWRJbml0aWFsaXplZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhID09PSBpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuc2V0SW5pdGlhbGl6ZWQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnZpc2libGVPYmplY3RzID0gZ3JpZFNlcnZpY2UuY3JlYXRlR3JpZChpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlhZ3JhbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLmdldFZpc2libGVBcmVhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh2aXNpYmxlQXJlYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZWxlbWVudE9mZnNldCA9IHNjb3BlLiRlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZFNlcnZpY2Uuc2V0VmlzaWJsZUFyZWEoaWQsIHZpc2libGVBcmVhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kZW1pdCgnRGlhZ3JhbUluaXRpYWxpemVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5iaW5kKCdjb250ZXh0bWVudScsIGtpbGxDb250ZXh0TWVudSk7XG5cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmJveCcsIFtdXG4pXG4gICAgLmNvbnRyb2xsZXIoICdCb3hDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUgKSB7XG5cbiAgICAgICAgJHNjb3BlLnBvcnRXaXJlcyA9IFtdO1xuXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggJHNjb3BlLmNvbXBvbmVudC5zeW1ib2wucG9ydHMsIGZ1bmN0aW9uICggcG9ydCApIHtcblxuICAgICAgICAgICAgdmFyIHRvWCA9IDAsXG4gICAgICAgICAgICAgICAgdG9ZID0gMCxcbiAgICAgICAgICAgICAgICBwb3J0V2lyZUxlbmd0aCxcbiAgICAgICAgICAgICAgICB3aWR0aCwgaGVpZ2h0O1xuXG4gICAgICAgICAgICBwb3J0V2lyZUxlbmd0aCA9ICRzY29wZS5jb21wb25lbnQuc3ltYm9sLnBvcnRXaXJlTGVuZ3RoO1xuICAgICAgICAgICAgd2lkdGggPSAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC53aWR0aDtcbiAgICAgICAgICAgIGhlaWdodCA9ICRzY29wZS5jb21wb25lbnQuc3ltYm9sLmhlaWdodDtcblxuICAgICAgICAgICAgaWYgKCBwb3J0LnggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgdG9YID0gcG9ydFdpcmVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdG9ZID0gcG9ydC55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHBvcnQueSA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICB0b1kgPSBwb3J0V2lyZUxlbmd0aDtcbiAgICAgICAgICAgICAgICB0b1ggPSBwb3J0Lng7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggcG9ydC54ID09PSB3aWR0aCApIHtcbiAgICAgICAgICAgICAgICB0b1ggPSB3aWR0aCAtIHBvcnRXaXJlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRvWSA9IHBvcnQueTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBwb3J0LnkgPT09IGhlaWdodCApIHtcbiAgICAgICAgICAgICAgICB0b1kgPSBoZWlnaHQgLSBwb3J0V2lyZUxlbmd0aDtcbiAgICAgICAgICAgICAgICB0b1ggPSBwb3J0Lng7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRzY29wZS5wb3J0V2lyZXMucHVzaCgge1xuICAgICAgICAgICAgICAgIHgxOiBwb3J0LngsXG4gICAgICAgICAgICAgICAgeTE6IHBvcnQueSxcbiAgICAgICAgICAgICAgICB4MjogdG9YLFxuICAgICAgICAgICAgICAgIHkyOiB0b1lcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuXG4gICAgfSApXG4gICAgLmRpcmVjdGl2ZShcbiAgICAgICAgJ2JveCcsXG5cbiAgICAgICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNjb3BlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0JveENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvYm94Lmh0bWwnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlTmFtZXNwYWNlOiAnU1ZHJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuY2FwYWNpdG9yJywgW11cbiAgICApXG4gICAgLmNvbmZpZyhbICdzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICBmdW5jdGlvbiAoc3ltYm9sTWFuYWdlclByb3ZpZGVyKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXBhY2l0b3InLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tY2FwYWNpdG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ0MnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC04XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNjAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxNSxcbiAgICAgICAgICAgICAgICBwb3J0czoge1xuICAgICAgICAgICAgICAgICAgICBDOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ0MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQycsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogNy41XG4gICAgICAgICAgICAgICAgICAgIH0sIEE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnQScsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQScsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDcuNVxuICAgICAgICAgICAgICAgICAgICB9IH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgXSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsICQqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoICcuLi8uLi9zZXJ2aWNlcy9zeW1ib2xTZXJ2aWNlcy9zeW1ib2xTZXJ2aWNlcy5qcycgKTtcbnJlcXVpcmUoICcuLi9wb3J0L3BvcnQuanMnICk7XG5cbnJlcXVpcmUoICcuL3Jlc2lzdG9yL3Jlc2lzdG9yLmpzJyApO1xucmVxdWlyZSggJy4vakZldFAvakZldFAuanMnICk7XG5yZXF1aXJlKCAnLi9vcEFtcC9vcEFtcC5qcycgKTtcbnJlcXVpcmUoICcuL2Rpb2RlL2Rpb2RlLmpzJyApO1xucmVxdWlyZSggJy4vdHZzRGlvZGUvdHZzRGlvZGUuanMnICk7XG5yZXF1aXJlKCAnLi9jYXBhY2l0b3IvY2FwYWNpdG9yLmpzJyApO1xucmVxdWlyZSggJy4vaW5kdWN0b3IvaW5kdWN0b3IuanMnICk7XG5yZXF1aXJlKCAnLi9zaW1wbGVDb25uZWN0b3Ivc2ltcGxlQ29ubmVjdG9yLmpzJyApO1xuXG5yZXF1aXJlKCAnLi9ib3gvYm94LmpzJyApO1xuXG52YXIgc3ltYm9sc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzJywgW1xuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9sU2VydmljZXMnLFxuXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5wb3J0JyxcblxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5yZXNpc3RvcicsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmpGZXRQJyxcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMub3BBbXAnLFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5kaW9kZScsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLnR2c0Rpb2RlJyxcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuY2FwYWNpdG9yJyxcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuaW5kdWN0b3InLFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5zaW1wbGVDb25uZWN0b3InLFxuXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmJveCdcblxuICAgIF0gKTtcblxuc3ltYm9sc01vZHVsZS5jb250cm9sbGVyKFxuICAgICdTeW1ib2xDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUgKSB7XG5cbiAgICAgICAgJHNjb3BlLmdldFN5bWJvbFRyYW5zZm9ybSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybVN0cmluZztcblxuICAgICAgICAgICAgLy8gICAgdHJhbnNmb3JtU3RyaW5nID0gJ3RyYW5zbGF0ZSgnICsgJHNjb3BlLmNvbXBvbmVudC54ICsgJywnICsgJHNjb3BlLmNvbXBvbmVudC55ICsgJykgJztcbiAgICAgICAgICAgIC8vICAgIHRyYW5zZm9ybVN0cmluZyArPVxuICAgICAgICAgICAgLy8gICAgICAncm90YXRlKCcgKyAkc2NvcGUuY29tcG9uZW50LnJvdGF0aW9uICsgJyAnICsgJHNjb3BlLmNvbXBvbmVudC5zeW1ib2wud2lkdGgvMiArICcgJyArICRzY29wZS5jb21wb25lbnQuc3ltYm9sLmhlaWdodC8yICArICcpICc7XG4gICAgICAgICAgICAvLyAgICAvL3RyYW5zZm9ybVN0cmluZyArPSAnc2NhbGUoJyArICRzY29wZS5jb21wb25lbnQuc2NhbGVYICsgJywnICsgJHNjb3BlLmNvbXBvbmVudC5zY2FsZVkgKyAnKSAnO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCRzY29wZS5jb21wb25lbnQuZ2V0VHJhbnNmb3JtYXRpb25NYXRyaXgoKS5qb2luKCcsICcpKTtcblxuICAgICAgICAgICAgdHJhbnNmb3JtU3RyaW5nID0gJ21hdHJpeCgnICsgJHNjb3BlLmNvbXBvbmVudC5nZXRTVkdUcmFuc2Zvcm1hdGlvblN0cmluZygpICsgJyknO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtU3RyaW5nO1xuICAgICAgICB9O1xuXG4gICAgfSApO1xuXG5zeW1ib2xzTW9kdWxlLmRpcmVjdGl2ZShcbiAgICAnY29tcG9uZW50U3ltYm9sJyxcblxuICAgIGZ1bmN0aW9uICggJGNvbXBpbGUgKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiAnPScsXG4gICAgICAgICAgICAgICAgdGVzdDogJz0nLFxuICAgICAgICAgICAgICAgIHBhZ2U6ICc9JyxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZTogJz0nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnU3ltYm9sQ29udHJvbGxlcicsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2NvbXBvbmVudFN5bWJvbC5odG1sJyxcbiAgICAgICAgICAgIHRlbXBsYXRlTmFtZXNwYWNlOiAnU1ZHJyxcbiAgICAgICAgICAgIHJlcXVpcmU6IFsgJ15zdmdEaWFncmFtJywgJ15kaWFncmFtQ29udGFpbmVyJyBdLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKCBzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcywgY29udHJvbGxlcnMgKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGVTdHIsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlLFxuXG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLFxuICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlcixcblxuICAgICAgICAgICAgICAgICAgICAkZWwsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkU3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICBzeW1ib2xEaXJlY3RpdmU7XG5cbiAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlciA9IGNvbnRyb2xsZXJzWyAwIF07XG4gICAgICAgICAgICAgICAgZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIgPSBjb250cm9sbGVyc1sgMSBdO1xuXG4gICAgICAgICAgICAgICAgc2NvcGUucG9ydHNWaXNpYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgc2NvcGUuZGV0YWlsc1Zpc2libGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5nZXRab29tTGV2ZWwoKSA+IDE7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLmdldENzc0NsYXNzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gc2NvcGUuY29tcG9uZW50LnN5bWJvbC5jc3NDbGFzcyA/IHNjb3BlLmNvbXBvbmVudC5zeW1ib2wuY3NzQ2xhc3MgOiBzY29wZS5jb21wb25lbnQuc3ltYm9sLnR5cGU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5pc0NvbXBvbmVudFNlbGVjdGVkKCBzY29wZS5jb21wb25lbnQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSAnIHNlbGVjdGVkJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gSW50ZXJhY3Rpb25zXG5cbiAgICAgICAgICAgICAgICBzY29wZS5vbk1vdXNlVXAgPSBmdW5jdGlvbiAoICRldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIub25Db21wb25lbnRNb3VzZVVwKCBzY29wZS5jb21wb25lbnQsICRldmVudCApO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzY29wZS5vbk1vdXNlRG93biA9IGZ1bmN0aW9uICggJGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5vbkNvbXBvbmVudE1vdXNlRG93biggc2NvcGUuY29tcG9uZW50LCAkZXZlbnQgKTtcbiAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzeW1ib2xEaXJlY3RpdmUgPSBzY29wZS5jb21wb25lbnQuc3ltYm9sLnN5bWJvbERpcmVjdGl2ZSB8fCAnZ2VuZXJpYy1zdmcnO1xuXG4gICAgICAgICAgICAgICAgY29tcGlsZWRTeW1ib2wgPSBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5nZXRDb21waWxlZERpcmVjdGl2ZSggc3ltYm9sRGlyZWN0aXZlICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoICFhbmd1bGFyLmlzRnVuY3Rpb24oIGNvbXBpbGVkU3ltYm9sICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVTdHIgPSAnPCcgKyBzeW1ib2xEaXJlY3RpdmUgKyAnPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvJyArIHN5bWJvbERpcmVjdGl2ZSArICc+JztcblxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IGFuZ3VsYXIuZWxlbWVudCggdGVtcGxhdGVTdHIgKTtcblxuICAgICAgICAgICAgICAgICAgICBjb21waWxlZFN5bWJvbCA9ICRjb21waWxlKCB0ZW1wbGF0ZSApO1xuXG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLnNldENvbXBpbGVkRGlyZWN0aXZlKCBzeW1ib2xEaXJlY3RpdmUsIGNvbXBpbGVkU3ltYm9sICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkZWwgPSAkKCBlbGVtZW50ICk7XG5cbiAgICAgICAgICAgICAgICBjb21waWxlZFN5bWJvbCggc2NvcGUsIGZ1bmN0aW9uICggY2xvbmVkRWxlbWVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgJGVsLmZpbmQoICcuc3ltYm9sLXBsYWNlaG9sZGVyJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZVdpdGgoIGNsb25lZEVsZW1lbnQgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5yZWdpc3RlckNvbXBvbmVudEVsZW1lbnQoIHNjb3BlLmNvbXBvbmVudC5pZCwgJGVsICk7XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kb24oICckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIudW5yZWdpc3RlckNvbXBvbmVudEVsZW1lbnQoIHNjb3BlLmNvbXBvbmVudC5pZCApO1xuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbik7XG5cbnN5bWJvbHNNb2R1bGUuZGlyZWN0aXZlKFxuICAgICdnZW5lcmljU3ZnJyxcblxuICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2dlbmVyaWNTdmcuaHRtbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgICAgICAgfTtcbiAgICB9XG4pO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5kaW9kZScsIFtdXG4gICAgKVxuICAgIC5jb25maWcoWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKHN5bWJvbE1hbmFnZXJQcm92aWRlcikge1xuICAgICAgICAgICAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZGlvZGUnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tZGlvZGUnLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnRCcsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLThcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA2MCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDE1LFxuICAgICAgICAgICAgICAgIHBvcnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIEM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnQycsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQycsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogN1xuICAgICAgICAgICAgICAgICAgICB9LCBBOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ0EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQScsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDdcbiAgICAgICAgICAgICAgICAgICAgfSB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIF0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuaW5kdWN0b3InLCBbXVxuICAgIClcbiAgICAuY29uZmlnKFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uIChzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2luZHVjdG9yJyxcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLWluZHVjdG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ0wnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC04XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxMCxcbiAgICAgICAgICAgICAgICBwb3J0czoge1xuICAgICAgICAgICAgICAgICAgICBwMToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogNi41XG4gICAgICAgICAgICAgICAgICAgIH0sIHAyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ3AyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdwMicsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiA1MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDYuNVxuICAgICAgICAgICAgICAgICAgICB9IH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgXSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5qRmV0UCcsIFtdXG4gICAgKVxuICAgIC5jb25maWcoWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKHN5bWJvbE1hbmFnZXJQcm92aWRlcikge1xuICAgICAgICAgICAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnakZldFAnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24takZldFAnLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnUScsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgICAgICAgICAgeTogMTJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA2MixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDcwLFxuICAgICAgICAgICAgICAgIHBvcnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncycsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDI3MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IDQ3LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgICAgICB9LCBkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiA5MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IDQ3LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogNzBcbiAgICAgICAgICAgICAgICAgICAgfSwgZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDI2XG4gICAgICAgICAgICAgICAgICAgIH0gfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICBdKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLm9wQW1wJywgW11cbiAgICApXG4gICAgLmNvbmZpZyhbICdzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICBmdW5jdGlvbiAoc3ltYm9sTWFuYWdlclByb3ZpZGVyKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdvcEFtcCcsXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiBudWxsLFxuICAgICAgICAgICAgICAgIHN2Z0RlY29yYXRpb246ICdpbWFnZXMvc3ltYm9scy5zdmcjaWNvbi1vcEFtcCcsXG4gICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICdBJyxcbiAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDkwLFxuICAgICAgICAgICAgICAgICAgICB5OiAxNVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgICAgICBwb3J0czoge1xuICAgICAgICAgICAgICAgICAgICAnVnMrJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdWcysnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAyNzAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVnMrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IDY1LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgICAgICB9LCAnVm91dCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnVm91dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVm91dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiAxNDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiA1MFxuICAgICAgICAgICAgICAgICAgICB9LCAnVnMtJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdWcy0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiA5MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWcy0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogNjUsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiAxMDBcbiAgICAgICAgICAgICAgICAgICAgfSwgJ1YtJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdWLScsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWLScsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogNzVcbiAgICAgICAgICAgICAgICAgICAgfSwgJ1YrJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdWKycsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWKycsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogMjVcbiAgICAgICAgICAgICAgICAgICAgfSB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIF0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMucmVzaXN0b3InLCBbXVxuICAgIClcbiAgICAuY29uZmlnKFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uIChzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3Jlc2lzdG9yJyxcbiAgICAgICAgICAgICAgICBzeW1ib2xEaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLXJlc2lzdG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ1InLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC04XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNjAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxMCxcbiAgICAgICAgICAgICAgICBwb3J0czoge1xuICAgICAgICAgICAgICAgICAgICBwMToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogNVxuICAgICAgICAgICAgICAgICAgICB9LCBwMjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdwMicsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAncDInLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogNjAsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiA1XG4gICAgICAgICAgICAgICAgICAgIH0gfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICBdKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLnNpbXBsZUNvbm5lY3RvcicsIFtdXG4gICAgKS5jb25maWcoWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKHN5bWJvbE1hbmFnZXJQcm92aWRlcikge1xuICAgICAgICAgICAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc2ltcGxlQ29ubmVjdG9yJyxcbiAgICAgICAgICAgICAgICBzeW1ib2xEaXJlY3RpdmU6ICdzaW1wbGUtY29ubmVjdG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJycsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiAzLFxuICAgICAgICAgICAgICAgICAgICB5OiAxMVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDE1LFxuICAgICAgICAgICAgICAgIHBvcnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIHAxOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ3AxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiA5NyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDdcbiAgICAgICAgICAgICAgICAgICAgfSB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIF0pXG4gICAgLmNvbnRyb2xsZXIoJ1NpbXBsZUNvbm5lY3RvckNvbnRyb2xsZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgfSlcbiAgICAuZGlyZWN0aXZlKFxuICAgICdzaW1wbGVDb25uZWN0b3InLFxuXG4gICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzY29wZTogZmFsc2UsXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW1wbGVDb25uZWN0b3JDb250cm9sbGVyJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvc2ltcGxlQ29ubmVjdG9yLmh0bWwnLFxuICAgICAgICAgICAgdGVtcGxhdGVOYW1lc3BhY2U6ICdTVkcnXG4gICAgICAgIH07XG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy50dnNEaW9kZScsIFtdXG4gICAgKVxuICAgIC5jb25maWcoWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKHN5bWJvbE1hbmFnZXJQcm92aWRlcikge1xuICAgICAgICAgICAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndHZzRGlvZGUnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tdHZzRGlvZGUnLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnVFZTRCcsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLThcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA2MCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDE1LFxuICAgICAgICAgICAgICAgIHBvcnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIEM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnQycsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQycsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogN1xuICAgICAgICAgICAgICAgICAgICB9LCBBOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ0EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQScsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDdcbiAgICAgICAgICAgICAgICAgICAgfSB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIF0pO1xuIixudWxsLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGdsTWF0cml4ID0gcmVxdWlyZSggJ2dsTWF0cml4JyApO1xuXG52YXIgQ29tcG9uZW50UG9ydCA9IGZ1bmN0aW9uICggZGVzY3JpcHRvciApIHtcblxuICAgIGFuZ3VsYXIuZXh0ZW5kKCB0aGlzLCBkZXNjcmlwdG9yICk7XG5cbn07XG5cbkNvbXBvbmVudFBvcnQucHJvdG90eXBlLmdldEdyaWRQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBwb3NpdGlvbixcbiAgICAgICAgcG9zaXRpb25WZWN0b3I7XG5cbiAgICBpZiAoIGFuZ3VsYXIuaXNPYmplY3QoIHRoaXMucG9ydFN5bWJvbCApICYmIGFuZ3VsYXIuaXNPYmplY3QoIHRoaXMucGFyZW50Q29tcG9uZW50ICkgKSB7XG5cbiAgICAgICAgcG9zaXRpb25WZWN0b3IgPSBnbE1hdHJpeC52ZWMyLmNyZWF0ZSgpO1xuICAgICAgICBnbE1hdHJpeC52ZWMyLnNldCggcG9zaXRpb25WZWN0b3IsIHRoaXMucG9ydFN5bWJvbC54LCB0aGlzLnBvcnRTeW1ib2wueSApO1xuXG4gICAgICAgIGdsTWF0cml4LnZlYzIudHJhbnNmb3JtTWF0MyggcG9zaXRpb25WZWN0b3IsIHBvc2l0aW9uVmVjdG9yLCB0aGlzLnBhcmVudENvbXBvbmVudC5nZXRUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpICk7XG5cbiAgICAgICAgcG9zaXRpb24gPSB7XG5cbiAgICAgICAgICAgIHg6IHBvc2l0aW9uVmVjdG9yWyAwIF0sXG4gICAgICAgICAgICB5OiBwb3NpdGlvblZlY3RvclsgMSBdXG5cbiAgICAgICAgfTtcblxuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbjtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnRQb3J0OyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzeW1ib2xNYW5hZ2VyLCBkaWFncmFtU2VydmljZSwgd2lyaW5nU2VydmljZSkge1xuXG4gICAgdmFyIGdldERpYWdyYW07XG5cbiAgICBnZXREaWFncmFtID0gZnVuY3Rpb24gKGRpYWdyYW1FbGVtZW50cykge1xuXG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgc3ltYm9sLFxuICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudCxcblxuICAgICAgICAgICAgYWxsUG9ydHNCeUlkLFxuXG4gICAgICAgICAgICBtaW5lUG9ydHNGcm9tSW50ZXJmYWNlcyxcblxuICAgICAgICAgICAgZGlhZ3JhbSxcbiAgICAgICAgICAgIHdpcmUsXG5cbiAgICAgICAgICAgIERpYWdyYW0sXG4gICAgICAgICAgICBEaWFncmFtQ29tcG9uZW50LFxuICAgICAgICAgICAgQ29tcG9uZW50UG9ydCxcbiAgICAgICAgICAgIFdpcmU7XG5cbiAgICAgICAgRGlhZ3JhbSA9IHJlcXVpcmUoJy4vRGlhZ3JhbScpO1xuICAgICAgICBEaWFncmFtQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9EaWFncmFtQ29tcG9uZW50LmpzJyk7XG4gICAgICAgIENvbXBvbmVudFBvcnQgPSByZXF1aXJlKCcuL0NvbXBvbmVudFBvcnQnKTtcbiAgICAgICAgV2lyZSA9IHJlcXVpcmUoJy4vV2lyZS5qcycpO1xuXG4gICAgICAgIGFsbFBvcnRzQnlJZCA9IHt9O1xuXG4gICAgICAgIG1pbmVQb3J0c0Zyb21JbnRlcmZhY2VzID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbGxlY3Rvcikge1xuXG4gICAgICAgICAgICB2YXIgbWluWCxcbiAgICAgICAgICAgICAgICBtYXhYLFxuICAgICAgICAgICAgICAgIHBvcnREZXNjcmlwdG9ycyxcbiAgICAgICAgICAgICAgICBtZWRpYW4sXG4gICAgICAgICAgICAgICAgYWxsSW50ZXJDb25uZWN0b3JzLFxuICAgICAgICAgICAgICAgIHBvcnRJbnN0YW5jZXMsXG4gICAgICAgICAgICAgICAgbmV3UG9ydDtcblxuICAgICAgICAgICAgcG9ydERlc2NyaXB0b3JzID0ge307XG4gICAgICAgICAgICBwb3J0SW5zdGFuY2VzID0gW107XG5cbiAgICAgICAgICAgIGFsbEludGVyQ29ubmVjdG9ycyA9IFtdO1xuXG4gICAgICAgICAgICBwb3J0RGVzY3JpcHRvcnMudG9wID0gW107XG4gICAgICAgICAgICBwb3J0RGVzY3JpcHRvcnMucmlnaHQgPSBbXTtcbiAgICAgICAgICAgIHBvcnREZXNjcmlwdG9ycy5ib3R0b20gPSBbXTtcbiAgICAgICAgICAgIHBvcnREZXNjcmlwdG9ycy5sZWZ0ID0gW107XG5cbiAgICAgICAgICAgIG1pblggPSBudWxsO1xuICAgICAgICAgICAgbWF4WCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGVsZW1lbnQuaW50ZXJmYWNlcykpIHtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChlbGVtZW50LmludGVyZmFjZXMuY29ubmVjdG9ycywgZnVuY3Rpb24gKGlubmVyQ29ubmVjdG9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHg7XG5cbiAgICAgICAgICAgICAgICAgICAgeCA9IGlubmVyQ29ubmVjdG9yLnBvc2l0aW9uLng7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pblggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pblggPSB4O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1heFggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFggPSB4O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHggPCBtaW5YKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5YID0geDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh4ID4gbWF4WCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4WCA9IHg7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBhbGxJbnRlckNvbm5lY3RvcnMucHVzaChpbm5lckNvbm5lY3Rvcik7XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGFsbEludGVyQ29ubmVjdG9ycy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGEucG9zaXRpb24ueCA+IGIucG9zaXRpb24ueCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoYS5wb3NpdGlvbi54IDwgYi5wb3NpdGlvbi54KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBtZWRpYW4gPSAobWluWCArIG1heFgpIC8gMjtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChhbGxJbnRlckNvbm5lY3RvcnMsIGZ1bmN0aW9uIChpbm5lckNvbm5lY3Rvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwb3J0U3ltYm9sO1xuXG4gICAgICAgICAgICAgICAgICAgIHBvcnRTeW1ib2wgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogaW5uZXJDb25uZWN0b3IuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogaW5uZXJDb25uZWN0b3IubmFtZVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbm5lckNvbm5lY3Rvci5wb3NpdGlvbi54IDwgbWVkaWFuKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnREZXNjcmlwdG9ycy5sZWZ0LnB1c2gocG9ydFN5bWJvbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydERlc2NyaXB0b3JzLnJpZ2h0LnB1c2gocG9ydFN5bWJvbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG5ld1BvcnQgPSBuZXcgQ29tcG9uZW50UG9ydCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogaW5uZXJDb25uZWN0b3IuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0U3ltYm9sOiBwb3J0U3ltYm9sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHBvcnRJbnN0YW5jZXMucHVzaChuZXdQb3J0KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChjb2xsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0b3JbIGlubmVyQ29ubmVjdG9yLmlkIF0gPSBuZXdQb3J0O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwb3J0RGVzY3JpcHRvcnM6IHBvcnREZXNjcmlwdG9ycyxcbiAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzOiBwb3J0SW5zdGFuY2VzXG4gICAgICAgICAgICB9O1xuXG5cbiAgICAgICAgfTtcblxuICAgICAgICBkaWFncmFtID0gbmV3IERpYWdyYW0oKTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChkaWFncmFtRWxlbWVudHMpKSB7XG5cbiAgICAgICAgICAgIGkgPSAwO1xuXG4gICAgICAgICAgICBkaWFncmFtLmNvbmZpZy53aWR0aCA9IDIwMDA7XG4gICAgICAgICAgICBkaWFncmFtLmNvbmZpZy5oZWlnaHQgPSAyMDAwO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGlhZ3JhbUVsZW1lbnRzLkNvbm5lY3RvciwgZnVuY3Rpb24gKGVsZW1lbnQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBwb3J0SW5zdGFuY2U7XG5cbiAgICAgICAgICAgICAgICBzeW1ib2wgPSBzeW1ib2xNYW5hZ2VyLmdldFN5bWJvbCgnc2ltcGxlQ29ubmVjdG9yJyk7XG5cbiAgICAgICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50ID0gbmV3IERpYWdyYW1Db21wb25lbnQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGVsZW1lbnQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgeDogZWxlbWVudC5wb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgICAgICB5OiBlbGVtZW50LnBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgICAgIHo6IGksXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uOiAwLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZVg6IDEsXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlWTogMSxcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgIG5vblNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbkxvY2tlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcG9ydEluc3RhbmNlID0gbmV3IENvbXBvbmVudFBvcnQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICAgICAgcG9ydFN5bWJvbDogc3ltYm9sLnBvcnRzLnAxXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhbGxQb3J0c0J5SWRbZWxlbWVudC5pZF0gPSBwb3J0SW5zdGFuY2U7XG5cbiAgICAgICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50LnJlZ2lzdGVyUG9ydEluc3RhbmNlcyhbIHBvcnRJbnN0YW5jZSBdKTtcbiAgICAgICAgICAgICAgICBkaWFncmFtLmFkZENvbXBvbmVudChuZXdEaWFncmFtQ29tcG9uZW50KTtcblxuICAgICAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkaWFncmFtRWxlbWVudHMuQVZNQ29tcG9uZW50TW9kZWwsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcG9ydFN0dWZmLFxuICAgICAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICAgICAgcG9ydFN0dWZmID0gbWluZVBvcnRzRnJvbUludGVyZmFjZXMoZWxlbWVudCwgYWxsUG9ydHNCeUlkKTtcblxuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGVsZW1lbnQubmFtZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5uYW1lLmNoYXJBdCgwKSA9PT0gJ0MnICYmXG4gICAgICAgICAgICAgICAgICAgICFpc05hTihlbGVtZW50Lm5hbWUuY2hhckF0KDEpKVxuICAgICAgICAgICAgICAgICkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWFwIHNob3QgdG8gZmlndXJlIGlmIGl0IGlzIGEgY2FwYWNpdG9yXG5cbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sID0gc3ltYm9sTWFuYWdlci5nZXRTeW1ib2woJ2NhcGFjaXRvcicpO1xuXG4gICAgICAgICAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQgPSBuZXcgRGlhZ3JhbUNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBlbGVtZW50Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBlbGVtZW50LnBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBlbGVtZW50LnBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRpb246IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZVg6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZVk6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2w6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vblNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25Mb2NrZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vcDEgPSBuZXcgQ29tcG9uZW50UG9ydCh7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGlkOiBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgICAgICAvLyAgICBwb3J0U3ltYm9sOiBzeW1ib2wucG9ydHMuQ1xuICAgICAgICAgICAgICAgICAgICAvL30pO1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvL3AyID0gbmV3IENvbXBvbmVudFBvcnQoe1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBpZDogZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgcG9ydFN5bWJvbDogc3ltYm9sLnBvcnRzLkFcbiAgICAgICAgICAgICAgICAgICAgLy99KTtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy9hbGxQb3J0c0J5SWRbZWxlbWVudC5pZF0gPSBwMTtcbiAgICAgICAgICAgICAgICAgICAgLy9hbGxQb3J0c0J5SWRbZWxlbWVudC5pZF0gPSBwMjtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGk9MDsgaSA8IHBvcnRTdHVmZi5wb3J0SW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb3J0U3R1ZmYucG9ydEluc3RhbmNlc1tpXS5wb3J0U3ltYm9sLmxhYmVsID09PSAnUDInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9ydFN0dWZmLnBvcnRJbnN0YW5jZXNbaV0ucG9ydFN5bWJvbCA9IHN5bWJvbC5wb3J0cy5DO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9ydFN0dWZmLnBvcnRJbnN0YW5jZXNbaV0ucG9ydFN5bWJvbC5sYWJlbCA9PT0gJ1AxJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRTdHVmZi5wb3J0SW5zdGFuY2VzW2ldLnBvcnRTeW1ib2wgPSBzeW1ib2wucG9ydHMuQTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudC5yZWdpc3RlclBvcnRJbnN0YW5jZXMocG9ydFN0dWZmLnBvcnRJbnN0YW5jZXMpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBzeW1ib2wgPSBzeW1ib2xNYW5hZ2VyLm1ha2VCb3hTeW1ib2woZWxlbWVudC5uYW1lLCB7fSwgcG9ydFN0dWZmLnBvcnREZXNjcmlwdG9ycyk7XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudCA9IG5ldyBEaWFncmFtQ29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGVsZW1lbnQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IGVsZW1lbnQucG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IGVsZW1lbnQucG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHo6IGksXG4gICAgICAgICAgICAgICAgICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlWDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlWTogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbDogc3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9uU2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbkxvY2tlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudC5yZWdpc3RlclBvcnRJbnN0YW5jZXMocG9ydFN0dWZmLnBvcnRJbnN0YW5jZXMpO1xuXG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkaWFncmFtLmFkZENvbXBvbmVudChuZXdEaWFncmFtQ29tcG9uZW50KTtcblxuICAgICAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkaWFncmFtRWxlbWVudHMuQ29udGFpbmVyLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHBvcnRTdHVmZjtcblxuICAgICAgICAgICAgICAgIHBvcnRTdHVmZiA9IG1pbmVQb3J0c0Zyb21JbnRlcmZhY2VzKGVsZW1lbnQsIGFsbFBvcnRzQnlJZCk7XG5cbiAgICAgICAgICAgICAgICBzeW1ib2wgPSBzeW1ib2xNYW5hZ2VyLm1ha2VCb3hTeW1ib2woZWxlbWVudC5uYW1lLCB7fSwgcG9ydFN0dWZmLnBvcnREZXNjcmlwdG9ycyk7XG5cbiAgICAgICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50ID0gbmV3IERpYWdyYW1Db21wb25lbnQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGVsZW1lbnQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgeDogZWxlbWVudC5wb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgICAgICB5OiBlbGVtZW50LnBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgICAgIHo6IGksXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uOiAwLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZVg6IDEsXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlWTogMSxcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgIG5vblNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbkxvY2tlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudC5yZWdpc3RlclBvcnRJbnN0YW5jZXMocG9ydFN0dWZmLnBvcnRJbnN0YW5jZXMpO1xuICAgICAgICAgICAgICAgIGRpYWdyYW0uYWRkQ29tcG9uZW50KG5ld0RpYWdyYW1Db21wb25lbnQpO1xuXG4gICAgICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGlhZ3JhbUVsZW1lbnRzLkNvbm5lY3RvckNvbXBvc2l0aW9uLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHNvdXJjZVBvcnQsXG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uUG9ydDtcblxuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGVsZW1lbnQuZGV0YWlscykpIHtcblxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VQb3J0ID0gYWxsUG9ydHNCeUlkW2VsZW1lbnQuZGV0YWlscy5zb3VyY2VJZF07XG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uUG9ydCA9IGFsbFBvcnRzQnlJZFtlbGVtZW50LmRldGFpbHMuZGVzdGluYXRpb25JZF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZVBvcnQgJiYgZGVzdGluYXRpb25Qb3J0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmUgPSBuZXcgV2lyZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGVsZW1lbnQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kMToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHNvdXJjZVBvcnQucGFyZW50Q29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0OiBzb3VyY2VQb3J0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogZGVzdGluYXRpb25Qb3J0LnBhcmVudENvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9ydDogZGVzdGluYXRpb25Qb3J0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2Uucm91dGVXaXJlKHdpcmUsICdFbGJvd1JvdXRlcicpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWFncmFtLmFkZFdpcmUod2lyZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkaWFncmFtO1xuXG4gICAgfTtcblxuICAgIHRoaXMuZ2V0RGlhZ3JhbSA9IGdldERpYWdyYW07XG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBEaWFncmFtID0gZnVuY3Rpb24gKGRlc2NyaXB0b3IpIHtcblxuICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIGRlc2NyaXB0b3IpO1xuXG4gICAgdGhpcy5jb21wb25lbnRzID0gW107XG4gICAgdGhpcy5jb21wb25lbnRzQnlJZCA9IHt9O1xuICAgIHRoaXMud2lyZXMgPSBbXTtcbiAgICB0aGlzLndpcmVzQnlJZCA9IHt9O1xuICAgIHRoaXMud2lyZXNCeUNvbXBvbmVudElkID0ge307XG5cbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXG4gICAgICAgIGRpc2FsbG93U2VsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgd2lkdGg6IDUwMDAsXG4gICAgICAgIGhlaWdodDogNTAwMFxuICAgIH07XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBzZWxlY3RlZENvbXBvbmVudElkczogW11cbiAgICB9O1xuXG59O1xuXG5EaWFncmFtLnByb3RvdHlwZS5hZGRDb21wb25lbnQgPSBmdW5jdGlvbiAoYURpYWdyYW1Db21wb25lbnQpIHtcblxuICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGFEaWFncmFtQ29tcG9uZW50KSAmJiAhYW5ndWxhci5pc0RlZmluZWQodGhpcy5jb21wb25lbnRzQnlJZFthRGlhZ3JhbUNvbXBvbmVudC5pZF0pKSB7XG5cbiAgICAgICAgdGhpcy5jb21wb25lbnRzQnlJZFthRGlhZ3JhbUNvbXBvbmVudC5pZF0gPSBhRGlhZ3JhbUNvbXBvbmVudDtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goYURpYWdyYW1Db21wb25lbnQpO1xuXG4gICAgfVxuXG59O1xuXG5EaWFncmFtLnByb3RvdHlwZS5hZGRXaXJlID0gZnVuY3Rpb24gKGFXaXJlKSB7XG5cbiAgICB2YXIgc2VsZj10aGlzLFxuICAgICAgICByZWdpc3RlcldpcmVGb3JFbmRzO1xuXG4gICAgcmVnaXN0ZXJXaXJlRm9yRW5kcyA9IGZ1bmN0aW9uICh3aXJlKSB7XG5cbiAgICAgICAgdmFyIGNvbXBvbmVudElkO1xuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHdpcmUuZW5kMS5jb21wb25lbnQpICYmIGFuZ3VsYXIuaXNPYmplY3Qod2lyZS5lbmQyLmNvbXBvbmVudCkpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50SWQgPSB3aXJlLmVuZDEuY29tcG9uZW50LmlkO1xuXG4gICAgICAgICAgICBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0gPSBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0gfHwgW107XG5cbiAgICAgICAgICAgIGlmIChzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0uaW5kZXhPZih3aXJlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0ucHVzaCh3aXJlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29tcG9uZW50SWQgPSB3aXJlLmVuZDIuY29tcG9uZW50LmlkO1xuXG4gICAgICAgICAgICBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0gPSBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0gfHwgW107XG5cbiAgICAgICAgICAgIGlmIChzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0uaW5kZXhPZih3aXJlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0ucHVzaCh3aXJlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG5cbiAgICBpZiAoYW5ndWxhci5pc09iamVjdChhV2lyZSkgJiYgIWFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMud2lyZXNCeUlkW2FXaXJlLmlkXSkpIHtcblxuICAgICAgICB0aGlzLndpcmVzQnlJZFthV2lyZS5pZF0gPSBhV2lyZTtcbiAgICAgICAgdGhpcy53aXJlcy5wdXNoKGFXaXJlKTtcblxuICAgICAgICByZWdpc3RlcldpcmVGb3JFbmRzKGFXaXJlKTtcblxuICAgIH1cblxufTtcblxuRGlhZ3JhbS5wcm90b3R5cGUuZ2V0V2lyZXNGb3JDb21wb25lbnRzID0gZnVuY3Rpb24gKGNvbXBvbmVudHMpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgc2V0T2ZXaXJlcyA9IFtdO1xuXG4gICAgYW5ndWxhci5mb3JFYWNoKGNvbXBvbmVudHMsIGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgICBhbmd1bGFyLmZvckVhY2goc2VsZi53aXJlc0J5Q29tcG9uZW50SWRbY29tcG9uZW50LmlkXSwgZnVuY3Rpb24gKHdpcmUpIHtcblxuICAgICAgICAgICAgaWYgKHNldE9mV2lyZXMuaW5kZXhPZih3aXJlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzZXRPZldpcmVzLnB1c2god2lyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2V0T2ZXaXJlcztcblxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdyYW07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGdsTWF0cml4ID0gcmVxdWlyZSggJ2dsTWF0cml4JyApO1xuXG52YXIgRGlhZ3JhbUNvbXBvbmVudCA9IGZ1bmN0aW9uICggZGVzY3JpcHRvciApIHtcblxuICAgIGlmICggIWFuZ3VsYXIuaXNPYmplY3QoIGRlc2NyaXB0b3Iuc3ltYm9sICkgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ05vIHN5bWJvbCBmb3VuZCBmb3IgY29tcG9uZW50ICcgKyB0aGlzLmlkICk7XG4gICAgfVxuXG4gICAgYW5ndWxhci5leHRlbmQoIHRoaXMsIGRlc2NyaXB0b3IgKTtcblxuICAgIC8vIEZvciByb3RhdGlvblxuICAgIHRoaXMuX2NlbnRlck9mZnNldCA9IFsgdGhpcy5zeW1ib2wud2lkdGggLyAyLCB0aGlzLnN5bWJvbC5oZWlnaHQgLyAyIF07XG5cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmlzSW5WaWV3UG9ydCA9IGZ1bmN0aW9uICggdmlld1BvcnQsIHBhZGRpbmcgKSB7XG5cbiAgICAvL1RPRE86IGNvdW50IHdpZHRoIGFuZCBoZWlnaHQgZm9yIG9yaWVudGF0aW9uXG4gICAgcGFkZGluZyA9IHBhZGRpbmcgfHwge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIGFuZ3VsYXIuaXNPYmplY3QoIHZpZXdQb3J0ICkgJiZcbiAgICAgICAgdGhpcy54ICsgdGhpcy5zeW1ib2wud2lkdGggPj0gKCB2aWV3UG9ydC5sZWZ0ICsgcGFkZGluZy54ICkgJiZcbiAgICAgICAgdGhpcy54IDw9ICggdmlld1BvcnQucmlnaHQgLSBwYWRkaW5nLnggKSAmJlxuICAgICAgICB0aGlzLnkgKyB0aGlzLnN5bWJvbC5oZWlnaHQgPj0gKCB2aWV3UG9ydC50b3AgKyBwYWRkaW5nLnkgKSAmJlxuICAgICAgICB0aGlzLnkgPD0gKCB2aWV3UG9ydC5ib3R0b20gLSBwYWRkaW5nLnkgKSApO1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtYXRpb25NYXRyaXggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoICFhbmd1bGFyLmlzQXJyYXkoIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggKSApIHtcbiAgICAgICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4O1xuXG59O1xuXG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmdldFNWR1RyYW5zZm9ybWF0aW9uTWF0cml4ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCAhYW5ndWxhci5pc0FycmF5KCB0aGlzLnN2Z1RyYW5zZm9ybWF0aW9uTWF0cml4ICkgKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdmdUcmFuc2Zvcm1hdGlvbk1hdHJpeDtcblxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0U1ZHVHJhbnNmb3JtYXRpb25TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgdHJhbnNNYXRyaXggPSB0aGlzLmdldFNWR1RyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG5cbiAgICByZXR1cm4gdHJhbnNNYXRyaXguam9pbiggJywgJyApO1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgcm90YXRpb25SYWQsXG4gICAgICAgIC8vc2luQSwgY29zQSxcbiAgICAgICAgdHJhbnNsYXRpb24sXG4gICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgIHJlc3VsdDtcblxuICAgIGlmICggYW5ndWxhci5pc051bWJlciggdGhpcy5yb3RhdGlvbiApICYmXG4gICAgICAgIGFuZ3VsYXIuaXNOdW1iZXIoIHRoaXMueCApLFxuICAgICAgICBhbmd1bGFyLmlzTnVtYmVyKCB0aGlzLnkgKSApIHtcblxuICAgICAgICByb3RhdGlvblJhZCA9IHRoaXMucm90YXRpb24gLyAxODAgKiBNYXRoLlBJO1xuXG4gICAgICAgIHRyYW5zZm9ybU1hdDMgPSBnbE1hdHJpeC5tYXQzLmNyZWF0ZSgpO1xuXG4gICAgICAgIHRyYW5zbGF0aW9uID0gZ2xNYXRyaXgudmVjMi5jcmVhdGUoKTtcblxuICAgICAgICBnbE1hdHJpeC52ZWMyLnNldCggdHJhbnNsYXRpb24sIHRoaXMueCArIHRoaXMuX2NlbnRlck9mZnNldFswXSwgdGhpcy55ICsgdGhpcy5fY2VudGVyT2Zmc2V0WzFdKTtcblxuICAgICAgICBnbE1hdHJpeC5tYXQzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzLFxuICAgICAgICAgICAgdHJhbnNsYXRpb25cbiAgICAgICAgKTtcblxuICAgICAgICBnbE1hdHJpeC5tYXQzLnJvdGF0ZShcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzLFxuICAgICAgICAgICAgcm90YXRpb25SYWRcbiAgICAgICAgKTtcblxuICAgICAgICBnbE1hdHJpeC52ZWMyLnNldCggdHJhbnNsYXRpb24sIC10aGlzLl9jZW50ZXJPZmZzZXRbMF0sIC10aGlzLl9jZW50ZXJPZmZzZXRbMV0pO1xuXG4gICAgICAgIGdsTWF0cml4Lm1hdDMudHJhbnNsYXRlKFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0MyxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICB0cmFuc2xhdGlvblxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggPSB0cmFuc2Zvcm1NYXQzO1xuXG4gICAgICAgIHRoaXMuc3ZnVHJhbnNmb3JtYXRpb25NYXRyaXggPSBbXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyAwIF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyAxIF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyAzIF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyA0IF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyA2IF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzWyA3IF1cbiAgICAgICAgXTtcblxuICAgICAgICByZXN1bHQgPSB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4O1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcblxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueVxuICAgIH07XG5cbn07XG5cblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoIHgsIHkgKSB7XG5cbiAgICBpZiAoIGFuZ3VsYXIuaXNOdW1iZXIoIHggKSAmJiBhbmd1bGFyLmlzTnVtYmVyKCB5ICkgKSB7XG5cbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcblxuICAgICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdDb29yZGluYXRlcyBtdXN0IGJlIG51bWJlcnMhJyApO1xuICAgIH1cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uICggYW5nbGUgKSB7XG5cbiAgICBpZiAoIGFuZ3VsYXIuaXNOdW1iZXIoIGFuZ2xlICkgKSB7XG5cbiAgICAgICAgdGhpcy5yb3RhdGlvbiArPSBhbmdsZTtcblxuICAgICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdBbmdsZSBtdXN0IGJlIG51bWJlciEnICk7XG4gICAgfVxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUucmVnaXN0ZXJQb3J0SW5zdGFuY2VzID0gZnVuY3Rpb24gKCBuZXdQb3J0cyApIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMucG9ydEluc3RhbmNlcyA9IHRoaXMucG9ydEluc3RhbmNlcyB8fCBbXTtcblxuICAgIGFuZ3VsYXIuZm9yRWFjaCggbmV3UG9ydHMsIGZ1bmN0aW9uICggbmV3UG9ydCApIHtcblxuICAgICAgICBuZXdQb3J0LnBhcmVudENvbXBvbmVudCA9IHNlbGY7XG4gICAgICAgIHNlbGYucG9ydEluc3RhbmNlcy5wdXNoKCBuZXdQb3J0ICk7XG5cbiAgICB9ICk7XG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1lZERpbWVuc2lvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gIHZhciB3aWR0aCwgaGVpZ2h0O1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUubG9jYWxUb0dsb2JhbCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICggIXRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggPSB0aGlzLmdldFRyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG4gICAgfVxuXG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaWFncmFtQ29tcG9uZW50OyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN5bWJvbE1hbmFnZXIsIGRpYWdyYW1TZXJ2aWNlLCB3aXJpbmdTZXJ2aWNlKSB7XG5cbiAgICB2YXIgZ2V0RGlhZ3JhbTtcblxuICAgIGdldERpYWdyYW0gPSBmdW5jdGlvbiAoY291bnRPZkJveGVzLCBjb3VudE9mV2lyZXMsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIHN5bWJvbFR5cGVzKSB7XG5cbiAgICAgICAgdmFyIGksIGlkLFxuICAgICAgICAgICAgY291bnRPZlR5cGVzLFxuICAgICAgICAgICAgc3ltYm9sLFxuICAgICAgICAgICAgdHlwZUlkLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHgsXG4gICAgICAgICAgICB5LFxuICAgICAgICAgICAgc3ltYm9sVHlwZUlkcyxcbiAgICAgICAgICAgIGNvbXBvbmVudDEsXG4gICAgICAgICAgICBjb21wb25lbnQyLFxuICAgICAgICAgICAgcG9ydDEsXG4gICAgICAgICAgICBwb3J0MixcbiAgICAgICAgICAgIGNyZWF0ZWRQb3J0cyxcbiAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQsXG5cbiAgICAgICAgICAgIHBvcnRDcmVhdG9yLFxuXG4gICAgICAgICAgICBkaWFncmFtLFxuICAgICAgICAgICAgd2lyZSxcblxuICAgICAgICAgICAgRGlhZ3JhbSxcbiAgICAgICAgICAgIERpYWdyYW1Db21wb25lbnQsXG4gICAgICAgICAgICBDb21wb25lbnRQb3J0LFxuICAgICAgICAgICAgV2lyZTtcblxuICAgICAgICBEaWFncmFtID0gcmVxdWlyZSgnLi9EaWFncmFtJyk7XG4gICAgICAgIERpYWdyYW1Db21wb25lbnQgPSByZXF1aXJlKCcuL0RpYWdyYW1Db21wb25lbnQuanMnKTtcbiAgICAgICAgQ29tcG9uZW50UG9ydCA9IHJlcXVpcmUoJy4vQ29tcG9uZW50UG9ydCcpO1xuICAgICAgICBXaXJlID0gcmVxdWlyZSgnLi9XaXJlLmpzJyk7XG5cbiAgICAgICAgZGlhZ3JhbSA9IG5ldyBEaWFncmFtKCk7XG5cbiAgICAgICAgcG9ydENyZWF0b3IgPSBmdW5jdGlvbiAoY29tcG9uZW50SWQsIHBvcnRzKSB7XG5cbiAgICAgICAgICAgIHZhciBwb3J0SW5zdGFuY2UsXG4gICAgICAgICAgICAgICAgcG9ydEluc3RhbmNlcyxcbiAgICAgICAgICAgICAgICBwb3J0TWFwcGluZztcblxuICAgICAgICAgICAgcG9ydEluc3RhbmNlcyA9IFtdO1xuICAgICAgICAgICAgcG9ydE1hcHBpbmcgPSB7fTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHBvcnRzLCBmdW5jdGlvbiAocG9ydCkge1xuXG4gICAgICAgICAgICAgICAgcG9ydEluc3RhbmNlID0gbmV3IENvbXBvbmVudFBvcnQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQgKyAnXycgKyBwb3J0LmlkLFxuICAgICAgICAgICAgICAgICAgICBwb3J0U3ltYm9sOiBwb3J0XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzLnB1c2gocG9ydEluc3RhbmNlKTtcblxuICAgICAgICAgICAgICAgIHBvcnRNYXBwaW5nWyBwb3J0LmlkIF0gPSBwb3J0SW5zdGFuY2UuaWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzOiBwb3J0SW5zdGFuY2VzLFxuICAgICAgICAgICAgICAgIHBvcnRNYXBwaW5nOiBwb3J0TWFwcGluZ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHN5bWJvbFR5cGVJZHMgPSBPYmplY3Qua2V5cyhzeW1ib2xUeXBlcyk7XG5cbiAgICAgICAgY291bnRPZlR5cGVzID0gc3ltYm9sVHlwZUlkcy5sZW5ndGg7XG5cbiAgICAgICAgZGlhZ3JhbS5jb25maWcud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgICAgICAgZGlhZ3JhbS5jb25maWcuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudE9mQm94ZXM7IGkrKykge1xuXG4gICAgICAgICAgICB0eXBlSWQgPSBzeW1ib2xUeXBlSWRzWyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjb3VudE9mVHlwZXMpIF07XG4gICAgICAgICAgICB0eXBlID0gc3ltYm9sVHlwZXNbIHR5cGVJZCBdO1xuXG4gICAgICAgICAgICB4ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKCBjYW52YXNXaWR0aCAtIDEgKSk7XG4gICAgICAgICAgICB5ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKCBjYW52YXNIZWlnaHQgLSAxICkpO1xuXG4gICAgICAgICAgICBpZCA9ICdjb21wb25lbnRfJyArIHR5cGVJZCArICdfJyArIGk7XG5cbiAgICAgICAgICAgIHN5bWJvbCA9IHN5bWJvbE1hbmFnZXIuZ2V0U3ltYm9sKHR5cGVJZCk7XG5cbiAgICAgICAgICAgIGNyZWF0ZWRQb3J0cyA9IHBvcnRDcmVhdG9yKGlkLCBzeW1ib2wucG9ydHMpO1xuXG4gICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50ID0gbmV3IERpYWdyYW1Db21wb25lbnQoe1xuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICBsYWJlbDogdHlwZS5sYWJlbFByZWZpeCArIGksXG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgIHo6IGksXG4gICAgICAgICAgICAgICAgcm90YXRpb246IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQwKSAqIDkwLFxuICAgICAgICAgICAgICAgIHNjYWxlWDogMSwgLy9bMSwgLTFdW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSldLFxuICAgICAgICAgICAgICAgIHNjYWxlWTogMSwgLy9bMSwgLTFdW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSldLFxuICAgICAgICAgICAgICAgIHN5bWJvbDogc3ltYm9sLFxuICAgICAgICAgICAgICAgIG5vblNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGxvY2F0aW9uTG9ja2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50LnJlZ2lzdGVyUG9ydEluc3RhbmNlcyhjcmVhdGVkUG9ydHMucG9ydEluc3RhbmNlcyk7XG5cbiAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcblxuICAgICAgICAgICAgZGlhZ3JhbS5hZGRDb21wb25lbnQobmV3RGlhZ3JhbUNvbXBvbmVudCk7XG5cblxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvdW50T2ZXaXJlczsgaSsrKSB7XG5cbiAgICAgICAgICAgIGlkID0gJ3dpcmVfJyArIGk7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudDEgPSBkaWFncmFtLmNvbXBvbmVudHMuZ2V0UmFuZG9tRWxlbWVudCgpO1xuXG4gICAgICAgICAgICBwb3J0MSA9IGNvbXBvbmVudDEucG9ydEluc3RhbmNlcy5nZXRSYW5kb21FbGVtZW50KCk7XG4gICAgICAgICAgICBwb3J0MiA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgd2hpbGUgKCFhbmd1bGFyLmlzRGVmaW5lZChwb3J0MikgfHwgcG9ydDEgPT09IHBvcnQyKSB7XG5cbiAgICAgICAgICAgICAgICBjb21wb25lbnQyID0gZGlhZ3JhbS5jb21wb25lbnRzLmdldFJhbmRvbUVsZW1lbnQoKTtcbiAgICAgICAgICAgICAgICBwb3J0MiA9IGNvbXBvbmVudDIucG9ydEluc3RhbmNlcy5nZXRSYW5kb21FbGVtZW50KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpcmUgPSBuZXcgV2lyZSh7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGVuZDE6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQxLFxuICAgICAgICAgICAgICAgICAgICBwb3J0OiBwb3J0MVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZW5kMjoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudDIsXG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6IHBvcnQyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHdpcmluZ1NlcnZpY2Uucm91dGVXaXJlKHdpcmUsICdFbGJvd1JvdXRlcicpO1xuXG4gICAgICAgICAgICBkaWFncmFtLmFkZFdpcmUod2lyZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkaWFncmFtO1xuXG4gICAgfTtcblxuICAgIHRoaXMuZ2V0RGlhZ3JhbSA9IGdldERpYWdyYW07XG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBXaXJlID0gZnVuY3Rpb24gKCBkZXNjcmlwdG9yICkge1xuXG4gICAgYW5ndWxhci5leHRlbmQoIHRoaXMsIGRlc2NyaXB0b3IgKTtcblxuICAgIHRoaXMuc2VnbWVudHMgPSBbXTtcblxufTtcblxuV2lyZS5wcm90b3R5cGUuaXNJblZpZXdQb3J0ID0gZnVuY3Rpb24gKCB2aWV3UG9ydCwgcGFkZGluZyApIHtcblxuICAgIHZhciBqLFxuICAgICAgICBzaG91bGRCZVZpc2libGUsXG4gICAgICAgIHNlZ21lbnQ7XG5cbiAgICBwYWRkaW5nID0gcGFkZGluZyB8fCB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9O1xuXG4gICAgc2hvdWxkQmVWaXNpYmxlID0gZmFsc2U7XG5cbiAgICBpZiAoIHRoaXMucm91dGVyVHlwZSA9PT0gJ0VsYm93Um91dGVyJyApIHtcblxuICAgICAgICBpZiAoIGFuZ3VsYXIuaXNBcnJheSggdGhpcy5zZWdtZW50cyApICkge1xuXG4gICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IHRoaXMuc2VnbWVudHMubGVuZ3RoICYmICFzaG91bGRCZVZpc2libGU7IGorKyApIHtcblxuICAgICAgICAgICAgICAgIHNlZ21lbnQgPSB0aGlzLnNlZ21lbnRzWyBqIF07XG5cbiAgICAgICAgICAgICAgICBpZiAoIHNlZ21lbnQub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzZWdtZW50LngxID49ICggdmlld1BvcnQubGVmdCArIHBhZGRpbmcueCApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50LngxIDw9ICggdmlld1BvcnQucmlnaHQgLSBwYWRkaW5nLnggKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZEJlVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzZWdtZW50LnkxID49ICggdmlld1BvcnQudG9wICsgcGFkZGluZy55ICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQueTEgPD0gKCB2aWV3UG9ydC5ib3R0b20gLSBwYWRkaW5nLnkgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZEJlVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHNob3VsZEJlVmlzaWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNob3VsZEJlVmlzaWJsZTtcblxufTtcblxuV2lyZS5wcm90b3R5cGUuZ2V0RW5kUG9zaXRpb25zID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHBvcnQxUG9zaXRpb24sXG4gICAgICAgIHBvcnQyUG9zaXRpb24sXG4gICAgICAgIHBvc2l0aW9ucztcblxuICAgIHBvcnQxUG9zaXRpb24gPSB0aGlzLmVuZDEucG9ydC5nZXRHcmlkUG9zaXRpb24oKTtcbiAgICBwb3J0MlBvc2l0aW9uID0gdGhpcy5lbmQyLnBvcnQuZ2V0R3JpZFBvc2l0aW9uKCk7XG5cbiAgICBpZiAocG9ydDFQb3NpdGlvbiAmJiBwb3J0MlBvc2l0aW9uKSB7XG5cbiAgICAgICAgcG9zaXRpb25zID0ge1xuXG4gICAgICAgICAgICBlbmQxOiBwb3J0MVBvc2l0aW9uLFxuICAgICAgICAgICAgZW5kMjogcG9ydDJQb3NpdGlvblxuXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICByZXR1cm4gcG9zaXRpb25zO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdpcmU7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kaWFncmFtU2VydmljZScsIFtcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9sU2VydmljZXMnLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5vcGVyYXRpb25zTWFuYWdlcidcbl0pXG4gICAgLnNlcnZpY2UoJ2RpYWdyYW1TZXJ2aWNlJywgW1xuICAgICAgICAnJHEnLFxuICAgICAgICAnJHRpbWVvdXQnLFxuICAgICAgICAnc3ltYm9sTWFuYWdlcicsXG4gICAgICAgICckc3RhdGVQYXJhbXMnLFxuICAgICAgICAnd2lyaW5nU2VydmljZScsXG4gICAgICAgICdvcGVyYXRpb25zTWFuYWdlcicsXG4gICAgICAgIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQsIHN5bWJvbE1hbmFnZXIsICRzdGF0ZVBhcmFtcywgd2lyaW5nU2VydmljZS8qLCBvcGVyYXRpb25zTWFuYWdlciovKSB7XG5cbiAgICAgICAgICAgIHZhclxuICAgICAgICAgICAgICAgIHNlbGYgPSB0aGlzLFxuXG4gICAgICAgICAgICAgICAgZGlhZ3JhbXMsXG5cbiAgICAgICAgICAgICAgICBzeW1ib2xUeXBlcyxcblxuICAgICAgICAgICAgICAgIER1bW15RGlhZ3JhbUdlbmVyYXRvcixcbiAgICAgICAgICAgICAgICBkdW1teURpYWdyYW1HZW5lcmF0b3IsXG5cbiAgICAgICAgICAgICAgICBDeVBoeURpYWdyYW1QYXJzZXIsXG4gICAgICAgICAgICAgICAgY3lQaHlEaWFncmFtUGFyc2VyLFxuXG4gICAgICAgICAgICAgICAgRGlhZ3JhbUNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICBDb21wb25lbnRQb3J0LFxuICAgICAgICAgICAgICAgIFdpcmU7XG5cbiAgICAgICAgICAgIGRpYWdyYW1zID0ge307XG5cbiAgICAgICAgICAgIER1bW15RGlhZ3JhbUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9EdW1teURpYWdyYW1HZW5lcmF0b3IuanMnKTtcbiAgICAgICAgICAgIEN5UGh5RGlhZ3JhbVBhcnNlciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DeVBoeURpYWdyYW1QYXJzZXIuanMnKTtcblxuICAgICAgICAgICAgRGlhZ3JhbUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9EaWFncmFtQ29tcG9uZW50LmpzJyk7XG4gICAgICAgICAgICBDb21wb25lbnRQb3J0ID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NvbXBvbmVudFBvcnQnKTtcbiAgICAgICAgICAgIFdpcmUgPSByZXF1aXJlKCcuL2NsYXNzZXMvV2lyZS5qcycpO1xuXG4gICAgICAgICAgICBkdW1teURpYWdyYW1HZW5lcmF0b3IgPSBuZXcgRHVtbXlEaWFncmFtR2VuZXJhdG9yKHN5bWJvbE1hbmFnZXIsIHNlbGYsIHdpcmluZ1NlcnZpY2UpO1xuICAgICAgICAgICAgY3lQaHlEaWFncmFtUGFyc2VyID0gbmV3IEN5UGh5RGlhZ3JhbVBhcnNlcihzeW1ib2xNYW5hZ2VyLCBzZWxmLCB3aXJpbmdTZXJ2aWNlKTtcblxuICAgICAgICAgICAgc3ltYm9sVHlwZXMgPSBzeW1ib2xNYW5hZ2VyLmdldEF2YWlsYWJsZVN5bWJvbHMoKTtcblxuXG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCA9IGZ1bmN0aW9uIChkaWFncmFtSWQsIGFEaWFncmFtQ29tcG9uZW50KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIGRpYWdyYW0gPSBkaWFncmFtc1tkaWFncmFtSWRdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoZGlhZ3JhbSkpIHtcblxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtLmFkZENvbXBvbmVudChhRGlhZ3JhbUNvbXBvbmVudCk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuYWRkV2lyZSA9IGZ1bmN0aW9uIChkaWFncmFtSWQsIGFXaXJlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIGRpYWdyYW0gPSBkaWFncmFtc1tkaWFncmFtSWRdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoZGlhZ3JhbSkpIHtcblxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtLmFkZFdpcmUoYVdpcmUpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldFdpcmVzRm9yQ29tcG9uZW50cyA9IGZ1bmN0aW9uIChkaWFncmFtSWQsIGNvbXBvbmVudHMpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWFncmFtO1xuXG4gICAgICAgICAgICAgICAgZGlhZ3JhbSA9IGRpYWdyYW1zW2RpYWdyYW1JZF07XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChkaWFncmFtKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW0uZ2V0V2lyZXNGb3JDb21wb25lbnRzKGNvbXBvbmVudHMpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZURpYWdyYW1Gcm9tQ3lQaHlFbGVtZW50cyA9IGZ1bmN0aW9uKGRpYWdyYW1JZCwgZGlhZ3JhbUVsZW1lbnRzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIGlmIChkaWFncmFtSWQgJiYgYW5ndWxhci5pc09iamVjdChkaWFncmFtRWxlbWVudHMpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbSA9IGN5UGh5RGlhZ3JhbVBhcnNlci5nZXREaWFncmFtKGRpYWdyYW1FbGVtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW0uaWQgPSBkaWFncmFtSWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbXNbZGlhZ3JhbUlkXSA9IGRpYWdyYW07XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXREaWFncmFtID0gZnVuY3Rpb24gKGRpYWdyYW1JZCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpYWdyYW07XG5cbiAgICAgICAgICAgICAgICBpZiAoZGlhZ3JhbUlkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbSA9IGRpYWdyYW1zW2RpYWdyYW1JZF07XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5hZGREdW1teURpYWdyYW0gPSBmdW5jdGlvbiAoZGlhZ3JhbUlkLCBjb3VudE9mQm94ZXMsIGNvdW50T2ZXaXJlcywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGR1bW15RGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIGlmIChkaWFncmFtSWQpIHtcblxuICAgICAgICAgICAgICAgICAgICBkdW1teURpYWdyYW0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgZHVtbXlEaWFncmFtR2VuZXJhdG9yLmdldERpYWdyYW0oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRPZkJveGVzLCBjb3VudE9mV2lyZXMsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIHN5bWJvbFR5cGVzXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGR1bW15RGlhZ3JhbS5pZCA9IGRpYWdyYW1JZDtcblxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtc1tkaWFncmFtSWRdID0gZHVtbXlEaWFncmFtO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGR1bW15RGlhZ3JhbTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRIaWdoZXN0WiA9IGZ1bmN0aW9uIChkaWFncmFtSWQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICAgIHo7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIGRpYWdyYW0gPSBkaWFncmFtc1tkaWFncmFtSWRdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoZGlhZ3JhbSkpIHtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZGlhZ3JhbS5jb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IGRpYWdyYW0uY29tcG9uZW50c1tpXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihjb21wb25lbnQueikpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc05hTih6KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6ID0gY29tcG9uZW50Lno7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeiA8IGNvbXBvbmVudC56KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6ID0gY29tcG9uZW50Lno7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKHopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB6ID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB6O1xuXG4gICAgICAgICAgICB9O1xuXG4vLyAgICAgICAgICAgIG9wZXJhdGlvbnNNYW5hZ2VyLnJlZ2lzdGVyT3BlcmF0aW9uKHtcbi8vICAgICAgICAgICAgICAgIGlkOiAnc2V0Q29tcG9uZW50UG9zaXRpb24nLFxuLy8gICAgICAgICAgICAgICAgY29tbWl0OiBmdW5jdGlvbiAoY29tcG9uZW50LCB4LCB5KSB7XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGNvbXBvbmVudCkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNldFBvc2l0aW9uKHgsIHkpO1xuLy8gICAgICAgICAgICAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAvL3RoaXMuZ2VuZXJhdGVEdW1teURpYWdyYW0oMTAwMCwgMjAwLCA1MDAwLCA1MDAwKTtcbiAgICAgICAgICAgIC8vdGhpcy5nZW5lcmF0ZUR1bW15RGlhZ3JhbSgxMDAwLCAyMDAwLCAxMDAwMCwgMTAwMDApO1xuICAgICAgICAgICAgLy90aGlzLmdlbmVyYXRlRHVtbXlEaWFncmFtKDEwLCA1LCAxMjAwLCAxMjAwKTtcbiAgICAgICAgICAgIC8vdGhpcy5nZW5lcmF0ZUR1bW15RGlhZ3JhbSggMTAwLCA1MCwgMzAwMCwgMzAwMCApO1xuXG4gICAgICAgIH1cbiAgICBdKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ3JpZFNlcnZpY2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmdyaWRTZXJ2aWNlJywgW10gKTtcblxuZ3JpZFNlcnZpY2VzTW9kdWxlLnNlcnZpY2UoICdncmlkU2VydmljZScsIFsgJyRsb2cnLCAnJHJvb3RTY29wZScsICckdGltZW91dCcsXG4gICAgZnVuY3Rpb24gKCAkbG9nLCAkcm9vdFNjb3BlLCAkdGltZW91dCApIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG5cbiAgICAgICAgICAgIGdyaWRzID0ge30sXG5cbiAgICAgICAgICAgIG51bWJlck9mQ2hhbmdlc0FsbG93ZWRJbk9uZUN5Y2xlID0gMSxcbiAgICAgICAgICAgIHJlY2FsY3VsYXRlQ3ljbGVEZWxheSA9IDE1LFxuICAgICAgICAgICAgdmlld1BvcnRQYWRkaW5nID0ge1xuICAgICAgICAgICAgICAgIHg6IC02MDAsXG4gICAgICAgICAgICAgICAgeTogLTYwMFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMsXG4gICAgICAgICAgICBfcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMsXG4gICAgICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVXaXJlcztcblxuICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVXaXJlcyA9IGZ1bmN0aW9uICggZ3JpZCApIHtcblxuICAgICAgICAgICAgdmFyIGluZGV4LFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgd2lyZTtcblxuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZ3JpZC53aXJlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgd2lyZSA9IGdyaWQud2lyZXNbaV07XG5cbiAgICAgICAgICAgICAgICBpbmRleCA9IGdyaWQudmlzaWJsZVdpcmVzLmluZGV4T2Yod2lyZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAod2lyZS5pc0luVmlld1BvcnQoZ3JpZC52aWV3UG9ydCwgdmlld1BvcnRQYWRkaW5nKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQudmlzaWJsZVdpcmVzLnB1c2god2lyZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQudmlzaWJsZVdpcmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyRsb2cuZGVidWcoICdOdW1iZXIgb2YgdmlzaWJsZSB3aXJlczogJyArIGdyaWQudmlzaWJsZVdpcmVzLmxlbmd0aCApO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMgPSBmdW5jdGlvbiggZ3JpZCwgc3RhcnRJbmRleCApIHtcblxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShncmlkLmNvbXBvbmVudHMpICYmIGFuZ3VsYXIuaXNBcnJheShncmlkLndpcmVzKSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKGdyaWQucmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNQcm9taXNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCR0aW1lb3V0LmNhbmNlbChncmlkLnJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUHJvbWlzZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdoYWQgdG8ga2lsbCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBncmlkLnJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUHJvbWlzZSA9ICR0aW1lb3V0KFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMoZ3JpZCwgc3RhcnRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgcmVjYWxjdWxhdGVDeWNsZURlbGF5XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBfcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMgPSBmdW5jdGlvbiAoIGdyaWQsIHN0YXJ0SW5kZXggKSB7XG5cbiAgICAgICAgICAgIHZhciBpLCBjb21wb25lbnQsXG5cbiAgICAgICAgICAgICAgICBjb3VudE9mQ2hhbmdlcyA9IDAsXG4gICAgICAgICAgICAgICAgY2hhbmdlc0xpbWl0UmVhY2hlZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIGluZGV4O1xuXG4gICAgICAgICAgICBncmlkLmluc2lkZVZpc2libGVEaWFncmFtQ29tcG9uZW50c1JlY2FsY3VsYXRlID0gdHJ1ZTtcblxuXG4gICAgICAgICAgICBpZiAoIWNoYW5nZXNMaW1pdFJlYWNoZWQpIHtcbiAgICAgICAgICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVXaXJlcyggZ3JpZCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCB8fCAwO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSBzdGFydEluZGV4OyBpPCBncmlkLmNvbXBvbmVudHMubGVuZ3RoICYmIGNoYW5nZXNMaW1pdFJlYWNoZWQgPT09IGZhbHNlOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IGdyaWQuY29tcG9uZW50c1tpXTtcblxuXG4gICAgICAgICAgICAgICAgaW5kZXggPSBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cy5pbmRleE9mKCBjb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgIGlmICggY29tcG9uZW50LmlzSW5WaWV3UG9ydCggZ3JpZC52aWV3UG9ydCwgdmlld1BvcnRQYWRkaW5nICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpbmRleCA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cy5wdXNoKCBjb21wb25lbnQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50T2ZDaGFuZ2VzKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggaW5kZXggPiAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY291bnRPZkNoYW5nZXMrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICggY291bnRPZkNoYW5nZXMgPj0gbnVtYmVyT2ZDaGFuZ2VzQWxsb3dlZEluT25lQ3ljbGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZXNMaW1pdFJlYWNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyRsb2cuZGVidWcoICdOdW1iZXIgb2YgY2hhbmdlcyBjb21wYXJlZCB0byBwcmV2aW91cyBkaWFncmFtIHN0YXRlOicsIGNvdW50T2ZDaGFuZ2VzICk7XG5cbiAgICAgICAgICAgIGlmICggIWNoYW5nZXNMaW1pdFJlYWNoZWQgKSB7XG5cbiAgICAgICAgICAgICAgICBzZWxmLnJlb3JkZXJWaXNpYmxlQ29tcG9uZW50cyggZ3JpZC5pZCApO1xuXG4gICAgICAgICAgICAgICAgZ3JpZC5pbnNpZGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNSZWNhbGN1bGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFncmlkLmluaXRpYWxpemVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5pbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0dyaWRJbml0aWFsaXplZCcsIGdyaWQuaWQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKGdyaWQsIGkpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmludmFsaWRhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMgPSBmdW5jdGlvbiAoIGdyaWRJZCApIHtcblxuICAgICAgICAgICAgdmFyIGdyaWQ7XG5cbiAgICAgICAgICAgIGdyaWQgPSBncmlkc1sgZ3JpZElkIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0RlZmluZWQoIGdyaWQgKSApIHtcblxuICAgICAgICAgICAgICAgIGlmICggIWdyaWQuaW5zaWRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUmVjYWxjdWxhdGUgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMoZ3JpZCk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuY3JlYXRlR3JpZCA9IGZ1bmN0aW9uICggaWQsIGRpYWdyYW0gKSB7XG5cbiAgICAgICAgICAgIHZhciBncmlkO1xuXG4gICAgICAgICAgICBpZiAoICFhbmd1bGFyLmlzRGVmaW5lZCggZ3JpZHNbIGlkIF0gKSApIHtcbiAgICAgICAgICAgICAgICBncmlkID0gZ3JpZHNbIGlkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czogZGlhZ3JhbS5jb21wb25lbnRzLFxuICAgICAgICAgICAgICAgICAgICB2aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB3aXJlczogZGlhZ3JhbS53aXJlcyxcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZVdpcmVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgdmlld1BvcnQ6IHt9LFxuICAgICAgICAgICAgICAgICAgICBpbnNpZGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNSZWNhbGN1bGF0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxpemVkOiBmYWxzZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93ICggJ0dyaWQgd2FzIGFscmVhZHkgZGVmaW5lZCEnLCBpZCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLFxuICAgICAgICAgICAgICAgIHdpcmVzOiBncmlkLnZpc2libGVXaXJlc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuc2V0VmlzaWJsZUFyZWEgPSBmdW5jdGlvbiAoIGdyaWRJZCwgdmlld1BvcnQgKSB7XG4gICAgICAgICAgICB2YXIgZ3JpZCA9IGdyaWRzWyBncmlkSWQgXTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzRGVmaW5lZCggZ3JpZCApICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzRGVmaW5lZCggdmlld1BvcnQgKSApIHtcblxuICAgICAgICAgICAgICAgICAgICBncmlkLnZpZXdQb3J0ID0gdmlld1BvcnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnZhbGlkYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKCBncmlkLmlkICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgKCAnR3JpZCB3YXMgbm90IGRlZmluZWQhJywgZ3JpZElkICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlb3JkZXJWaXNpYmxlQ29tcG9uZW50cyA9IGZ1bmN0aW9uICggZ3JpZElkICkge1xuXG4gICAgICAgICAgICB2YXIgZ3JpZCA9IGdyaWRzWyBncmlkSWQgXTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzRGVmaW5lZCggZ3JpZCApICkge1xuICAgICAgICAgICAgICAgIGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLnNvcnQoIGZ1bmN0aW9uICggYSwgYiApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGEueiA+IGIueiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBhLnogPCBiLnogKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcblxuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgfVxuXSApO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBvcGVyYXRpb25zTWFuYWdlck1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5vcGVyYXRpb25zTWFuYWdlcicsIFtdKTtcblxub3BlcmF0aW9uc01hbmFnZXJNb2R1bGUucHJvdmlkZXIoJ29wZXJhdGlvbnNNYW5hZ2VyJywgZnVuY3Rpb24gT3BlcmF0aW9uc01hbmFnZXJQcm92aWRlcigpIHtcbiAgICB2YXIgc2VsZixcbiAgICAgICAgYXZhaWxhYmxlT3BlcmF0aW9ucztcblxuICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgYXZhaWxhYmxlT3BlcmF0aW9ucyA9IHt9O1xuXG4gICAgdGhpcy5yZWdpc3Rlck9wZXJhdGlvbiA9IGZ1bmN0aW9uIChvcGVyYXRpb25EZXNjcmlwdG9yKSB7XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3Qob3BlcmF0aW9uRGVzY3JpcHRvcikgJiZcbiAgICAgICAgICAgIGFuZ3VsYXIuaXNTdHJpbmcob3BlcmF0aW9uRGVzY3JpcHRvci5pZCkpIHtcbiAgICAgICAgICAgIGF2YWlsYWJsZU9wZXJhdGlvbnNbIG9wZXJhdGlvbkRlc2NyaXB0b3IuaWQgXSA9IG9wZXJhdGlvbkRlc2NyaXB0b3Iub3BlcmF0aW9uQ2xhc3M7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy4kZ2V0ID0gW1xuXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIE9wZXJhdGlvbnNNYW5hZ2VyO1xuXG4gICAgICAgICAgICBPcGVyYXRpb25zTWFuYWdlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJPcGVyYXRpb24gPSBmdW5jdGlvbiAob3BlcmF0aW9uRGVzY3JpcHRvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KG9wZXJhdGlvbkRlc2NyaXB0b3IpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmlzU3RyaW5nKG9wZXJhdGlvbkRlc2NyaXB0b3IuaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVPcGVyYXRpb25zWyBvcGVyYXRpb25EZXNjcmlwdG9yLmlkIF0gPSBvcGVyYXRpb25EZXNjcmlwdG9yLm9wZXJhdGlvbkNsYXNzO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRBdmFpbGFibGVPcGVyYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlT3BlcmF0aW9ucztcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0TmV3ID0gZnVuY3Rpb24gKG9wZXJhdGlvbklkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIE9wZXJhdGlvbkNsYXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uSW5zdGFuY2U7XG5cbiAgICAgICAgICAgICAgICAgICAgT3BlcmF0aW9uQ2xhc3MgPSBhdmFpbGFibGVPcGVyYXRpb25zWyBvcGVyYXRpb25JZCBdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oT3BlcmF0aW9uQ2xhc3MpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbkluc3RhbmNlID0gbmV3IE9wZXJhdGlvbkNsYXNzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbkluc3RhbmNlLmluaXQuYXBwbHkob3BlcmF0aW9uSW5zdGFuY2UsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYXRpb25JbnN0YW5jZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IE9wZXJhdGlvbnNNYW5hZ2VyKCk7XG5cbiAgICAgICAgfVxuICAgIF07XG59KTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN5bWJvbFNlcnZpY2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbFNlcnZpY2VzJywgW10gKTtcblxuc3ltYm9sU2VydmljZXNNb2R1bGUucHJvdmlkZXIoICdzeW1ib2xNYW5hZ2VyJywgZnVuY3Rpb24gU3ltYm9sTWFuYWdlclByb3ZpZGVyKCkge1xuICAgIHZhciBwcm92aWRlciA9IHRoaXMsXG4gICAgICAgIGF2YWlsYWJsZVN5bWJvbHMgPSB7fSxcblxuICAgICAgICBwb3J0Q3JlYXRvcixcbiAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGU7XG5cblxuICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlID0gZnVuY3Rpb24gKHNvbWVQb3J0cywgc2lkZSwgd2lkdGgsIGhlaWdodCwgcGFyYW1ldGVycykge1xuXG4gICAgICAgIHZhciBvZmZzZXQsXG4gICAgICAgICAgICBpbmNyZW1lbnQsXG5cbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBhUG9ydDtcblxuICAgICAgICBvZmZzZXQgPSBwYXJhbWV0ZXJzLnBvcnRXaXJlTGVuZ3RoICsgcGFyYW1ldGVycy5wb3J0U3BhY2luZztcblxuICAgICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0JyB8fCBzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgIG9mZnNldCArPSBwYXJhbWV0ZXJzLnRvcFBvcnRQYWRkaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtZXRlcnMuanVzdGlmeVBvcnRzKSB7XG5cbiAgICAgICAgICAgIGlmIChzaWRlID09PSAndG9wJyB8fCBzaWRlID09PSAnYm90dG9tJykge1xuICAgICAgICAgICAgICAgIGluY3JlbWVudCA9ICh3aWR0aCAtIDIgKiBwYXJhbWV0ZXJzLnBvcnRTcGFjaW5nKSAvICggc29tZVBvcnRzLmxlbmd0aCArIDEgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5jcmVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgKCBoZWlnaHQgLVxuICAgICAgICAgICAgICAgICAgICAgICAgMiAqIHBhcmFtZXRlcnMucG9ydFNwYWNpbmcgLVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1ldGVycy50b3BQb3J0UGFkZGluZyAtIHBhcmFtZXRlcnMuYm90dG9tUG9ydFBhZGRpbmcpIC8gKCBzb21lUG9ydHMubGVuZ3RoICsgMSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmNyZW1lbnQgPSBwYXJhbWV0ZXJzLnBvcnRTcGFjaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpPTA7IGkgPCBzb21lUG9ydHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgYVBvcnQgPSBzb21lUG9ydHNbaV07XG5cbiAgICAgICAgICAgIHN3aXRjaCAoc2lkZSkge1xuXG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgYVBvcnQueCA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYVBvcnQueSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IC05MDtcblxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gaW5jcmVtZW50O1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICBhUG9ydC54ID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LnkgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ICs9IGluY3JlbWVudDtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LnggPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LnkgPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDkwO1xuXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCArPSBpbmNyZW1lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgYVBvcnQueCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LnkgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDE4MDtcblxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gaW5jcmVtZW50O1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgcG9ydENyZWF0b3IgPSBmdW5jdGlvbihwb3J0RGVzY3JpcHRvcnMsIHBhcmFtZXRlcnMpIHtcblxuICAgICAgICB2YXIgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICBwb3J0cyxcblxuICAgICAgICAgICAgdG9wLFxuICAgICAgICAgICAgcmlnaHQsXG4gICAgICAgICAgICBib3R0b20sXG4gICAgICAgICAgICBsZWZ0O1xuXG4gICAgICAgIHBvcnREZXNjcmlwdG9ycyA9IHBvcnREZXNjcmlwdG9ycyB8fCB7fTtcbiAgICAgICAgcG9ydHMgPSBbXTtcblxuICAgICAgICB0b3AgPSBwb3J0RGVzY3JpcHRvcnMudG9wIHx8IFtdO1xuICAgICAgICByaWdodCA9IHBvcnREZXNjcmlwdG9ycy5yaWdodCB8fCBbXTtcbiAgICAgICAgYm90dG9tID0gcG9ydERlc2NyaXB0b3JzLmJvdHRvbSB8fCBbXTtcbiAgICAgICAgbGVmdCA9IHBvcnREZXNjcmlwdG9ycy5sZWZ0IHx8IFtdO1xuXG4gICAgICAgIHdpZHRoID0gTWF0aC5tYXgoXG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnBvcnRTcGFjaW5nICogKCB0b3AubGVuZ3RoICsgMyApLFxuICAgICAgICAgICAgcGFyYW1ldGVycy5wb3J0U3BhY2luZyAqICggYm90dG9tLmxlbmd0aCArIDMpLFxuICAgICAgICAgICAgcGFyYW1ldGVycy5taW5XaWR0aFxuICAgICAgICApO1xuXG4gICAgICAgIGhlaWdodCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgcGFyYW1ldGVycy5wb3J0U3BhY2luZyAqICggbGVmdC5sZW5ndGggKyAzKSArIHBhcmFtZXRlcnMudG9wUG9ydFBhZGRpbmcgKyBwYXJhbWV0ZXJzLmJvdHRvbVBvcnRQYWRkaW5nLFxuICAgICAgICAgICAgcGFyYW1ldGVycy5wb3J0U3BhY2luZyAqICggcmlnaHQubGVuZ3RoICsgMykgKyBwYXJhbWV0ZXJzLnRvcFBvcnRQYWRkaW5nICsgcGFyYW1ldGVycy5ib3R0b21Qb3J0UGFkZGluZyxcbiAgICAgICAgICAgIHBhcmFtZXRlcnMubWluSGVpZ2h0XG4gICAgICAgICk7XG5cbiAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGUodG9wLCAndG9wJywgd2lkdGgsIGhlaWdodCwgcGFyYW1ldGVycyk7XG4gICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKHJpZ2h0LCAncmlnaHQnLCB3aWR0aCwgaGVpZ2h0LCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGUoYm90dG9tLCAnYm90dG9tJywgd2lkdGgsIGhlaWdodCwgcGFyYW1ldGVycyk7XG4gICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKGxlZnQsICdsZWZ0Jywgd2lkdGgsIGhlaWdodCwgcGFyYW1ldGVycyk7XG5cbiAgICAgICAgcG9ydHMgPSBwb3J0cy5jb25jYXQodG9wKVxuICAgICAgICAgICAgLmNvbmNhdChyaWdodClcbiAgICAgICAgICAgIC5jb25jYXQoYm90dG9tKVxuICAgICAgICAgICAgLmNvbmNhdChsZWZ0KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcG9ydHM6IHBvcnRzLFxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfTtcblxuICAgIH07XG5cblxuICAgIHRoaXMucmVnaXN0ZXJTeW1ib2wgPSBmdW5jdGlvbiAoIHN5bWJvbERlc2NyaXB0b3IgKSB7XG5cbiAgICAgICAgaWYgKCBhbmd1bGFyLmlzT2JqZWN0KCBzeW1ib2xEZXNjcmlwdG9yICkgJiZcbiAgICAgICAgICAgIGFuZ3VsYXIuaXNTdHJpbmcoIHN5bWJvbERlc2NyaXB0b3IudHlwZSApICkge1xuICAgICAgICAgICAgYXZhaWxhYmxlU3ltYm9sc1sgc3ltYm9sRGVzY3JpcHRvci50eXBlIF0gPSBzeW1ib2xEZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMubWFrZUJveFN5bWJvbCA9IGZ1bmN0aW9uKCB0eXBlLCBkZXNjcmlwdG9yLCBwb3J0RGVzY3JpcHRvcnMsIGdpdmVuUGFyYW1ldGVycyApIHtcblxuICAgICAgICB2YXIgc3ltYm9sLFxuICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgIHBvcnRzQW5kU2l6ZXMsXG4gICAgICAgICAgICBjc3NDbGFzcztcblxuICAgICAgICBwYXJhbWV0ZXJzID0gYW5ndWxhci5leHRlbmQoe1xuICAgICAgICAgICAgcG9ydFdpcmVMZW5ndGg6IDIwLFxuICAgICAgICAgICAgcG9ydFNwYWNpbmc6IDIwLFxuICAgICAgICAgICAgdG9wUG9ydFBhZGRpbmc6IDIwLFxuICAgICAgICAgICAgYm90dG9tUG9ydFBhZGRpbmc6IDAsXG4gICAgICAgICAgICBtaW5XaWR0aDogMTQwLFxuICAgICAgICAgICAgbWluSGVpZ2h0OiA4MCxcbiAgICAgICAgICAgIGp1c3RpZnlQb3J0czogZmFsc2VcbiAgICAgICAgfSwgZ2l2ZW5QYXJhbWV0ZXJzIHx8IHt9KTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChkZXNjcmlwdG9yKSAmJiB0eXBlKSB7XG5cbiAgICAgICAgICAgIGlmICghYXZhaWxhYmxlU3ltYm9sc1t0eXBlXSkge1xuXG4gICAgICAgICAgICAgICAgcG9ydERlc2NyaXB0b3JzID0gcG9ydERlc2NyaXB0b3JzIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgcG9ydHNBbmRTaXplcyA9IHBvcnRDcmVhdG9yKHBvcnREZXNjcmlwdG9ycywgcGFyYW1ldGVycyk7XG5cbiAgICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdib3gnO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtZXRlcnMuY3NzQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3MgKz0gJyBwYXJhbWV0ZXJzLmNzc0NsYXNzJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzeW1ib2wgPSBhbmd1bGFyLmV4dGVuZChkZXNjcmlwdG9yLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6IGNzc0NsYXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sRGlyZWN0aXZlOiAnYm94JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0RlY29yYXRpb246IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogcG9ydHNBbmRTaXplcy53aWR0aC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBhcmFtZXRlcnMucG9ydFdpcmVMZW5ndGggKyAyNFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRXaXJlTGVuZ3RoOiBwYXJhbWV0ZXJzLnBvcnRXaXJlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHBvcnRzQW5kU2l6ZXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHBvcnRzQW5kU2l6ZXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzQW5kU2l6ZXMucG9ydHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hIZWlnaHQ6IHBvcnRzQW5kU2l6ZXMuaGVpZ2h0IC0gMiAqIHBhcmFtZXRlcnMucG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hXaWR0aDogcG9ydHNBbmRTaXplcy53aWR0aCAtIDIgKiBwYXJhbWV0ZXJzLnBvcnRXaXJlTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woc3ltYm9sKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzeW1ib2wgPSBhdmFpbGFibGVTeW1ib2xzW3R5cGVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3ltYm9sO1xuICAgIH07XG5cblxuICAgIHRoaXMuJGdldCA9IFtcblxuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBTeW1ib2xNYW5hZ2VyO1xuXG4gICAgICAgICAgICBTeW1ib2xNYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlclN5bWJvbCA9IHByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tYWtlQm94U3ltYm9sID0gcHJvdmlkZXIubWFrZUJveFN5bWJvbDtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0QXZhaWxhYmxlU3ltYm9scyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF2YWlsYWJsZVN5bWJvbHM7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0U3ltYm9sID0gZnVuY3Rpb24gKCBzeW1ib2xUeXBlICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlU3ltYm9sc1sgc3ltYm9sVHlwZSBdO1xuICAgICAgICAgICAgICAgIH07XG5cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTeW1ib2xNYW5hZ2VyKCk7XG5cbiAgICAgICAgfVxuICAgIF07XG59ICk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEVsYm93Um91dGVyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5uYW1lID0gJ0VsYm93Um91dGVyJztcblxuICAgIHRoaXMubWFrZVNlZ21lbnRzID0gZnVuY3Rpb24gKCBwb2ludHMsIG1ldGhvZCApIHtcblxuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIHBvaW50MSwgZWxib3csIHBvaW50MixcbiAgICAgICAgICAgIHNlZ21lbnRzO1xuXG4gICAgICAgIG1ldGhvZCA9IG1ldGhvZCB8fCAndmVydGljYWxGaXJzdCc7XG5cbiAgICAgICAgaWYgKCBhbmd1bGFyLmlzQXJyYXkoIHBvaW50cyApICYmIHBvaW50cy5sZW5ndGggPj0gMiApIHtcblxuICAgICAgICAgICAgc2VnbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgcG9pbnQxID0gcG9pbnRzWyBpIF07XG4gICAgICAgICAgICAgICAgcG9pbnQyID0gcG9pbnRzWyBpICsgMSBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBtZXRob2QgPT09ICd2ZXJ0aWNhbEZpcnN0JyApIHtcblxuICAgICAgICAgICAgICAgICAgICBlbGJvdyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBvaW50MS54LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogcG9pbnQyLnlcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxib3cgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwb2ludDEueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBvaW50Mi54XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWdtZW50cy5wdXNoKCB7XG5cbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuXG4gICAgICAgICAgICAgICAgICAgIHgxOiBwb2ludDEueCxcbiAgICAgICAgICAgICAgICAgICAgeTE6IHBvaW50MS55LFxuXG4gICAgICAgICAgICAgICAgICAgIHgyOiBlbGJvdy54LFxuICAgICAgICAgICAgICAgICAgICB5MjogZWxib3cueSxcblxuICAgICAgICAgICAgICAgICAgICByb3V0ZXI6IHNlbGYubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICggbWV0aG9kID09PSAndmVydGljYWxGaXJzdCcgKSA/ICd2ZXJ0aWNhbCcgOiAnaG9yaXpvbnRhbCdcblxuICAgICAgICAgICAgICAgIH0sIHtcblxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG5cbiAgICAgICAgICAgICAgICAgICAgeDE6IGVsYm93LngsXG4gICAgICAgICAgICAgICAgICAgIHkxOiBlbGJvdy55LFxuXG4gICAgICAgICAgICAgICAgICAgIHgyOiBwb2ludDIueCxcbiAgICAgICAgICAgICAgICAgICAgeTI6IHBvaW50Mi55LFxuXG4gICAgICAgICAgICAgICAgICAgIHJvdXRlcjogc2VsZi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogKCBtZXRob2QgPT09ICd2ZXJ0aWNhbEZpcnN0JyApID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ1xuXG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWdtZW50cztcblxuICAgIH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWxib3dSb3V0ZXI7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVSb3V0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLm1ha2VTZWdtZW50cyA9IGZ1bmN0aW9uICggcG9pbnRzICkge1xuXG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgcG9pbnQxLCBwb2ludDIsXG4gICAgICAgICAgICBzZWdtZW50cztcblxuICAgICAgICBpZiAoIGFuZ3VsYXIuaXNBcnJheSggcG9pbnRzICkgJiYgcG9pbnRzLmxlbmd0aCA+PSAyICkge1xuXG4gICAgICAgICAgICBzZWdtZW50cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGggLSAxOyBpKysgKSB7XG5cbiAgICAgICAgICAgICAgICBwb2ludDEgPSBwb2ludHNbIGkgXTtcbiAgICAgICAgICAgICAgICBwb2ludDIgPSBwb2ludHNbIGkgKyAxIF07XG5cbiAgICAgICAgICAgICAgICBzZWdtZW50cy5wdXNoKCB7XG5cbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuXG4gICAgICAgICAgICAgICAgICAgIHgxOiBwb2ludDEueCxcbiAgICAgICAgICAgICAgICAgICAgeTE6IHBvaW50MS55LFxuXG4gICAgICAgICAgICAgICAgICAgIHgyOiBwb2ludDIueCxcbiAgICAgICAgICAgICAgICAgICAgeTI6IHBvaW50Mi55XG5cbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuXG4gICAgfTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVSb3V0ZXI7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB3aXJpbmdTZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi53aXJpbmdTZXJ2aWNlJywgW10gKTtcblxud2lyaW5nU2VydmljZXNNb2R1bGUuc2VydmljZSggJ3dpcmluZ1NlcnZpY2UnLCBbICckbG9nJywgJyRyb290U2NvcGUnLCAnJHRpbWVvdXQnLFxuICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBTaW1wbGVSb3V0ZXIgPSByZXF1aXJlKCAnLi9jbGFzc2VzL1NpbXBsZVJvdXRlci5qcycgKSxcbiAgICAgICAgICAgIEVsYm93Um91dGVyID0gcmVxdWlyZSggJy4vY2xhc3Nlcy9FbGJvd1JvdXRlci5qcycgKSxcbiAgICAgICAgICAgIHJvdXRlcnMgPSB7XG5cbiAgICAgICAgICAgICAgICBTaW1wbGVSb3V0ZXI6IG5ldyBTaW1wbGVSb3V0ZXIoKSxcbiAgICAgICAgICAgICAgICBFbGJvd1JvdXRlcjogbmV3IEVsYm93Um91dGVyKClcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucyA9IGZ1bmN0aW9uICggZW5kUG9zaXRpb25zLCByb3V0ZXJUeXBlICkge1xuXG4gICAgICAgICAgICB2YXIgc2VnbWVudHMsXG4gICAgICAgICAgICAgICAgcm91dGVyO1xuXG4gICAgICAgICAgICByb3V0ZXIgPSByb3V0ZXJzWyByb3V0ZXJUeXBlIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggcm91dGVyICkgJiYgYW5ndWxhci5pc0Z1bmN0aW9uKCByb3V0ZXIubWFrZVNlZ21lbnRzICkgKSB7XG4gICAgICAgICAgICAgICAgc2VnbWVudHMgPSByb3V0ZXIubWFrZVNlZ21lbnRzKFxuICAgICAgICAgICAgICAgICAgICBbIGVuZFBvc2l0aW9ucy5lbmQxLCBlbmRQb3NpdGlvbnMuZW5kMiBdICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzZWdtZW50cztcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucm91dGVXaXJlID0gZnVuY3Rpb24gKCB3aXJlLCByb3V0ZXJUeXBlICkge1xuXG4gICAgICAgICAgICB2YXIgcm91dGVyLCBlbmRQb3NpdGlvbnM7XG5cbiAgICAgICAgICAgIHJvdXRlclR5cGUgPSByb3V0ZXJUeXBlIHx8ICdFbGJvd1JvdXRlcic7XG5cbiAgICAgICAgICAgIHJvdXRlciA9IHJvdXRlcnNbIHJvdXRlclR5cGUgXTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzT2JqZWN0KCByb3V0ZXIgKSAmJiBhbmd1bGFyLmlzRnVuY3Rpb24oIHJvdXRlci5tYWtlU2VnbWVudHMgKSApIHtcblxuICAgICAgICAgICAgICAgIGVuZFBvc2l0aW9ucyA9IHdpcmUuZ2V0RW5kUG9zaXRpb25zKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZW5kUG9zaXRpb25zKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cyA9IHJvdXRlci5tYWtlU2VnbWVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICBbZW5kUG9zaXRpb25zLmVuZDEsIGVuZFBvc2l0aW9ucy5lbmQyXSk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aXJlLnJvdXRlclR5cGUgPSByb3V0ZXJUeXBlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5hZGp1c3RXaXJlRW5kU2VnbWVudHMgPSBmdW5jdGlvbiAoIHdpcmUgKSB7XG5cbiAgICAgICAgICAgIHZhciBmaXJzdFNlZ21lbnQsXG4gICAgICAgICAgICAgICAgc2Vjb25kU2VnbWVudCxcbiAgICAgICAgICAgICAgICBzZWNvbmRUb0xhc3RTZWdtZW50LFxuICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50LFxuICAgICAgICAgICAgICAgIGVuZFBvc2l0aW9ucyxcbiAgICAgICAgICAgICAgICBuZXdTZWdtZW50cyxcbiAgICAgICAgICAgICAgICBwb3M7XG5cbiAgICAgICAgICAgIGVuZFBvc2l0aW9ucyA9IHdpcmUuZ2V0RW5kUG9zaXRpb25zKCk7XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0FycmF5KCB3aXJlLnNlZ21lbnRzICkgJiYgd2lyZS5zZWdtZW50cy5sZW5ndGggPiAxICkge1xuXG4gICAgICAgICAgICAgICAgZmlyc3RTZWdtZW50ID0gd2lyZS5zZWdtZW50c1sgMCBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBmaXJzdFNlZ21lbnQueDEgIT09IGVuZFBvc2l0aW9ucy5lbmQxLnggfHwgZmlyc3RTZWdtZW50LnkxICE9PSBlbmRQb3NpdGlvbnMuZW5kMS55ICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggZmlyc3RTZWdtZW50LnJvdXRlciA9PT0gJ0VsYm93Um91dGVyJyApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kU2VnbWVudCA9IHdpcmUuc2VnbWVudHNbIDEgXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHNlY29uZFNlZ21lbnQueDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogc2Vjb25kU2VnbWVudC55MlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cy5zcGxpY2UoIDAsIDIgKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGZpcnN0U2VnbWVudC54MixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBmaXJzdFNlZ21lbnQueTJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmUuc2VnbWVudHMuc3BsaWNlKCAwLCAxICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBuZXdTZWdtZW50cyA9IHNlbGYuZ2V0U2VnbWVudHNCZXR3ZWVuUG9zaXRpb25zKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQxOiBlbmRQb3NpdGlvbnMuZW5kMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDI6IHBvc1xuICAgICAgICAgICAgICAgICAgICB9LCBmaXJzdFNlZ21lbnQucm91dGVyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cyA9IG5ld1NlZ21lbnRzLmNvbmNhdCggd2lyZS5zZWdtZW50cyApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFzdFNlZ21lbnQgPSB3aXJlLnNlZ21lbnRzWyB3aXJlLnNlZ21lbnRzLmxlbmd0aCAtIDEgXTtcblxuICAgICAgICAgICAgICAgIGlmICggbGFzdFNlZ21lbnQueDIgIT09IGVuZFBvc2l0aW9ucy5lbmQyLnggfHwgbGFzdFNlZ21lbnQueTIgIT09IGVuZFBvc2l0aW9ucy5lbmQyLnkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBsYXN0U2VnbWVudC5yb3V0ZXIgPT09ICdFbGJvd1JvdXRlcicgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZFRvTGFzdFNlZ21lbnQgPSB3aXJlLnNlZ21lbnRzWyB3aXJlLnNlZ21lbnRzLmxlbmd0aCAtIDIgXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHNlY29uZFRvTGFzdFNlZ21lbnQueDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogc2Vjb25kVG9MYXN0U2VnbWVudC55MVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cy5zcGxpY2UoIHdpcmUuc2VnbWVudHMubGVuZ3RoIC0gMiwgMiApO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogbGFzdFNlZ21lbnQueDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogbGFzdFNlZ21lbnQueTFcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmUuc2VnbWVudHMuc3BsaWNlKCB3aXJlLnNlZ21lbnRzLmxlbmd0aCAtIDEsIDEgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG5ld1NlZ21lbnRzID0gc2VsZi5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDE6IHBvcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDI6IGVuZFBvc2l0aW9ucy5lbmQyXG4gICAgICAgICAgICAgICAgICAgIH0sIGxhc3RTZWdtZW50LnJvdXRlciApO1xuXG4gICAgICAgICAgICAgICAgICAgIHdpcmUuc2VnbWVudHMgPSB3aXJlLnNlZ21lbnRzLmNvbmNhdCggbmV3U2VnbWVudHMgKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJvdXRlV2lyZSggd2lyZSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICB9XG5dICk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoICdBcnJheS5wcm90b3R5cGUuZmluZCcgKTtcblxuaWYgKCAhQXJyYXkucHJvdG90eXBlLmZpbmRCeUlkICkge1xuICAgIEFycmF5LnByb3RvdHlwZS5maW5kQnlJZCA9IGZ1bmN0aW9uICggaWQgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmQoIGZ1bmN0aW9uICggYSApIHtcbiAgICAgICAgICAgIHJldHVybiBhLmlkICE9PSB1bmRlZmluZWQgJiYgYS5pZCA9PT0gaWQ7XG4gICAgICAgIH0gKTtcbiAgICB9O1xufVxuXG5pZiAoICFBcnJheS5wcm90b3R5cGUuZ2V0UmFuZG9tRWxlbWVudCApIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZ2V0UmFuZG9tRWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbIE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAoIHRoaXMubGVuZ3RoIC0gMSApICkgXTtcbiAgICB9O1xufVxuXG5pZiAoICFBcnJheS5wcm90b3R5cGUuc2h1ZmZsZSApIHtcbiAgICBBcnJheS5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMubGVuZ3RoLFxuICAgICAgICAgICAgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xuXG4gICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXG4gICAgICAgIHdoaWxlICggMCAhPT0gY3VycmVudEluZGV4ICkge1xuXG4gICAgICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cbiAgICAgICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleCApO1xuICAgICAgICAgICAgY3VycmVudEluZGV4IC09IDE7XG5cbiAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICAgICAgICAgIHRlbXBvcmFyeVZhbHVlID0gdGhpc1sgY3VycmVudEluZGV4IF07XG4gICAgICAgICAgICB0aGlzWyBjdXJyZW50SW5kZXggXSA9IHRoaXNbIHJhbmRvbUluZGV4IF07XG4gICAgICAgICAgICB0aGlzWyByYW5kb21JbmRleCBdID0gdGVtcG9yYXJ5VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xufSJdfQ==
