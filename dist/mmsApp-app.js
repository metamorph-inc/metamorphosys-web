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

},{"./directives/busyCover/busyCover.js":4,"./directives/designEditor/designEditor":8,"./directives/diagramContainer/diagramContainer.js":10,"./directives/fabricCanvas/fabricCanvas.js":12,"./directives/resizing/resizeToHeight.js":14,"./directives/resizing/resizeToWindow.js":15,"./directives/svgDiagram/svgDiagram.js":20,"./directives/symbols/componentSymbol.js":23,"./libraryIncludes.js":30,"./services/diagramService/diagramService.js":37,"./services/gridService/gridService.js":38,"./services/operationsManager/operationsManager.js":39,"./services/wiringService/wiringService.js":43,"./utils.js":44}],2:[function(require,module,exports){
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

},{"../../../services/diagramService/classes/Wire.js":36}],19:[function(require,module,exports){
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

},{"../../services/symbolServices/symbolServices.js":40,"../port/port.js":13,"./box/box.js":21,"./capacitor/capacitor.js":22,"./diode/diode.js":24,"./inductor/inductor.js":25,"./jFetP/jFetP.js":26,"./opAmp/opAmp.js":27,"./resistor/resistor.js":28,"./simpleConnector/simpleConnector.js":29}],24:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
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
},{"glMatrix":3}],32:[function(require,module,exports){
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

},{"./ComponentPort":31,"./Diagram":33,"./DiagramComponent.js":34,"./Wire.js":36}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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
},{"glMatrix":3}],35:[function(require,module,exports){
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

},{"./ComponentPort":31,"./Diagram":33,"./DiagramComponent.js":34,"./Wire.js":36}],36:[function(require,module,exports){
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
},{}],37:[function(require,module,exports){
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

},{"./classes/ComponentPort":31,"./classes/CyPhyDiagramParser.js":32,"./classes/DiagramComponent.js":34,"./classes/DummyDiagramGenerator.js":35,"./classes/Wire.js":36}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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
},{}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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
},{}],42:[function(require,module,exports){
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
},{}],43:[function(require,module,exports){
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
},{"./classes/ElbowRouter.js":41,"./classes/SimpleRouter.js":42}],44:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvbW1zQXBwL2FwcC5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9ib3dlcl9jb21wb25lbnRzL0FycmF5LnByb3RvdHlwZS5maW5kL2luZGV4LmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvZ2wtbWF0cml4L2Rpc3QvZ2wtbWF0cml4LW1pbi5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2J1c3lDb3Zlci9idXN5Q292ZXIuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9jb21wb25lbnRXaXJlL2NvbXBvbmVudFdpcmUuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9jb21wb25lbnRXaXJlL2NvbXBvbmVudFdpcmVTZWdtZW50LmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGVzaWduRWRpdG9yL2NsYXNzZXMvUmFuZG9tU3ltYm9sR2VuZXJhdG9yLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGVzaWduRWRpdG9yL2Rlc2lnbkVkaXRvci5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2RpYWdyYW1Db250YWluZXIvY2xhc3Nlcy9TY3JvbGxIYW5kbGVyLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGlhZ3JhbUNvbnRhaW5lci9kaWFncmFtQ29udGFpbmVyLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZHJhd2luZ0dyaWQvZHJhd2luZ0dyaWQuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9mYWJyaWNDYW52YXMvZmFicmljQ2FudmFzLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvcG9ydC9wb3J0LmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvcmVzaXppbmcvcmVzaXplVG9IZWlnaHQuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9yZXNpemluZy9yZXNpemVUb1dpbmRvdy5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vY2xhc3Nlcy9Db21wb25lbnREcmFnSGFuZGxlci5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vY2xhc3Nlcy9Db21wb25lbnRTZWxlY3Rpb25IYW5kbGVyLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ZnRGlhZ3JhbS9jbGFzc2VzL1dpcmVEcmF3SGFuZGxlci5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vY2xhc3Nlcy9jb250ZXh0TWVudUhhbmRsZXIuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zdmdEaWFncmFtL3N2Z0RpYWdyYW0uanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2JveC9ib3guanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2NhcGFjaXRvci9jYXBhY2l0b3IuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2NvbXBvbmVudFN5bWJvbC5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvZGlvZGUvZGlvZGUuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2luZHVjdG9yL2luZHVjdG9yLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9qRmV0UC9qRmV0UC5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvb3BBbXAvb3BBbXAuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL3Jlc2lzdG9yL3Jlc2lzdG9yLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9zaW1wbGVDb25uZWN0b3Ivc2ltcGxlQ29ubmVjdG9yLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2xpYnJhcnlJbmNsdWRlcy5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL0NvbXBvbmVudFBvcnQuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvZGlhZ3JhbVNlcnZpY2UvY2xhc3Nlcy9DeVBoeURpYWdyYW1QYXJzZXIuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvZGlhZ3JhbVNlcnZpY2UvY2xhc3Nlcy9EaWFncmFtLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvRGlhZ3JhbUNvbXBvbmVudC5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL0R1bW15RGlhZ3JhbUdlbmVyYXRvci5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL1dpcmUuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvZGlhZ3JhbVNlcnZpY2UvZGlhZ3JhbVNlcnZpY2UuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvZ3JpZFNlcnZpY2UvZ3JpZFNlcnZpY2UuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvb3BlcmF0aW9uc01hbmFnZXIvb3BlcmF0aW9uc01hbmFnZXIuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvc3ltYm9sU2VydmljZXMvc3ltYm9sU2VydmljZXMuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvd2lyaW5nU2VydmljZS9jbGFzc2VzL0VsYm93Um91dGVyLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL3dpcmluZ1NlcnZpY2UvY2xhc3Nlcy9TaW1wbGVSb3V0ZXIuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvd2lyaW5nU2VydmljZS93aXJpbmdTZXJ2aWNlLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL2xpYnJhcnlJbmNsdWRlcy5qcycpO1xuXG5yZXF1aXJlKCcuL3V0aWxzLmpzJyk7XG5cbnJlcXVpcmUoJy4vc2VydmljZXMvb3BlcmF0aW9uc01hbmFnZXIvb3BlcmF0aW9uc01hbmFnZXIuanMnKTtcblxucmVxdWlyZSgnLi9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9kaWFncmFtU2VydmljZS5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9ncmlkU2VydmljZS9ncmlkU2VydmljZS5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy93aXJpbmdTZXJ2aWNlL3dpcmluZ1NlcnZpY2UuanMnKTtcblxucmVxdWlyZSgnLi9kaXJlY3RpdmVzL2RpYWdyYW1Db250YWluZXIvZGlhZ3JhbUNvbnRhaW5lci5qcycpO1xucmVxdWlyZSgnLi9kaXJlY3RpdmVzL2ZhYnJpY0NhbnZhcy9mYWJyaWNDYW52YXMuanMnKTtcbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9zdmdEaWFncmFtL3N2Z0RpYWdyYW0uanMnKTtcblxucmVxdWlyZSgnLi9kaXJlY3RpdmVzL3N5bWJvbHMvY29tcG9uZW50U3ltYm9sLmpzJyk7XG5cbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9yZXNpemluZy9yZXNpemVUb0hlaWdodC5qcycpO1xucmVxdWlyZSgnLi9kaXJlY3RpdmVzL3Jlc2l6aW5nL3Jlc2l6ZVRvV2luZG93LmpzJyk7XG5cbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9idXN5Q292ZXIvYnVzeUNvdmVyLmpzJyk7XG5cbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9kZXNpZ25FZGl0b3IvZGVzaWduRWRpdG9yJyk7XG5cbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcbiAgICAndWkucm91dGVyJyxcblxuICAgICdnbWUuc2VydmljZXMnLFxuXG4gICAgJ2lzaXMudWkuY29tcG9uZW50cycsXG5cbiAgICAnY3lwaHkuY29tcG9uZW50cycsXG5cbiAgICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXG4gICAgJ2N5cGh5Lm1tc0FwcC50ZW1wbGF0ZXMnLFxuXG4gICAgJ3VpLmJvb3RzdHJhcCcsXG5cbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ub3BlcmF0aW9uc01hbmFnZXInLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi53aXJpbmdTZXJ2aWNlJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZGlhZ3JhbVNlcnZpY2UnLFxuXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRpYWdyYW1Db250YWluZXInLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5mYWJyaWNDYW52YXMnLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zdmdEaWFncmFtJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scycsXG4gICAgJ21tcy5yZXNpemVUb1dpbmRvdycsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmJ1c3lDb3ZlcicsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRlc2lnbkVkaXRvcicsXG5cbiAgICAnYW5ndWNvbXBsZXRlLWFsdCcsXG4gICAgJ25nVG91Y2gnLFxuXG4gICAgJ25nTWF0ZXJpYWwnXG5dKTtcblxuQ3lQaHlBcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cbiAgICB2YXIgc2VsZWN0UHJvamVjdDtcblxuICAgIHNlbGVjdFByb2plY3QgPSB7XG4gICAgICAgIGxvYWQ6IGZ1bmN0aW9uICgkcSwgJHN0YXRlUGFyYW1zLCAkcm9vdFNjb3BlLCAkc3RhdGUsICRsb2csIGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlLCB3b3Jrc3BhY2VTZXJ2aWNlLCBkZXNpZ25TZXJ2aWNlLCAkdGltZW91dCkge1xuICAgICAgICAgICAgdmFyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIGRlZmVycmVkO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLm1haW5EYkNvbm5lY3Rpb25JZCA9ICdtbXMtbWFpbi1kYi1jb25uZWN0aW9uLWlkJztcblxuICAgICAgICAgICAgY29ubmVjdGlvbklkID0gJHJvb3RTY29wZS5tYWluRGJDb25uZWN0aW9uSWQ7XG4gICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGRhdGFTdG9yZVNlcnZpY2UuY29ubmVjdFRvRGF0YWJhc2UoY29ubmVjdGlvbklkLCB7XG4gICAgICAgICAgICAgICAgaG9zdDogd2luZG93LmxvY2F0aW9uLmJhc2VuYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdChjb25uZWN0aW9uSWQsICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHByb2plY3RJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdQcm9qZWN0IHNlbGVjdGVkJywgcHJvamVjdElkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLnByb2plY3RJZCA9IHByb2plY3RJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgd3NDb250ZXh0O1xuXG5cbiAgICAgICAgICAgICAgICAgICAgd3NDb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGI6ICRyb290U2NvcGUubWFpbkRiQ29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdXb3JrU3BhY2VzXycgKyAoIG5ldyBEYXRlKCkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyh3c0NvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKHdzQ29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdXb3JrU3BhY2Ugd2F0Y2hlciBpbml0aWFsaXplZCwgZGVzdHJveWVkOicsIGRlc3Ryb3llZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXN0cm95ZWQgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoV29ya3NwYWNlcyh3c0NvbnRleHQsZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZCcsIHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlJywgdXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmxvYWQnLCB1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYXNGb3VuZEZpcnN0V29ya3NwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRm91bmRGaXJzdERlc2lnbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGb3VuZEZpcnN0V29ya3NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZvdW5kRmlyc3REZXNpZ24gPSBmYWxzZTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLndvcmtzcGFjZXMsIGZ1bmN0aW9uICh3b3JrU3BhY2UpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFoYXNGb3VuZEZpcnN0V29ya3NwYWNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGb3VuZEZpcnN0V29ya3NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmFjdGl2ZVdvcmtTcGFjZSA9IHdvcmtTcGFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdBY3RpdmUgd29ya3NwYWNlOicsICRyb290U2NvcGUuYWN0aXZlV29ya1NwYWNlKTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0ZvdW5kRmlyc3RXb3Jrc3BhY2UpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnbnMod3NDb250ZXh0LCAkcm9vdFNjb3BlLmFjdGl2ZVdvcmtTcGFjZS5pZCxmdW5jdGlvbiAoLypkZXNpZ25zVXBkYXRlT2JqZWN0Ki8pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGVzaWduc0RhdGEpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkZXNpZ25zRGF0YS5kZXNpZ25zLCBmdW5jdGlvbiAoZGVzaWduKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFoYXNGb3VuZEZpcnN0RGVzaWduKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZvdW5kRmlyc3REZXNpZ24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5hY3RpdmVEZXNpZ24gPSBkZXNpZ247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdBY3RpdmUgZGVzaWduOicsICRyb290U2NvcGUuYWN0aXZlRGVzaWduKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0ZvdW5kRmlyc3REZXNpZ24pIHtcblxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKHdzQ29udGV4dCwgJHJvb3RTY29wZS5hY3RpdmVEZXNpZ24uaWQsIGZ1bmN0aW9uKGRlc2lnbkludGVyZmFjZXNVcGRhdGVPYmplY3QpIHtcbi8vXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihkZXNpZ25JbnRlcmZhY2VzKSB7XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkZXNpZ25JbnRlcmZhY2VzKTtcbi8vXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ0NvdWxkIG5vdCBmaW5kIGRlc2lnbnMgaW4gd29ya3NwYWNlLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJzQwNCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogJHN0YXRlUGFyYW1zLnByb2plY3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdDb3VsZCBub3QgZmluZCB3b3Jrc3BhY2VzIGluIHByb2plY3QuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJzQwNCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6ICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdXb2tyc3BhY2VTZXJ2aWNlIGRlc3Ryb3llZC4uLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ09wZW5pbmcgcHJvamVjdCBlcnJvcmVkOicsICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWQsIHJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnNDA0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiAkc3RhdGVQYXJhbXMucHJvamVjdElkXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvbm9Qcm9qZWN0Jyk7XG5cblxuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnZWRpdG9yJywge1xuICAgICAgICAgICAgdXJsOiAnL2VkaXRvci86cHJvamVjdElkJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZWRpdG9yLmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZTogc2VsZWN0UHJvamVjdCxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdFZGl0b3JWaWV3Q29udHJvbGxlcidcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdlZGl0b3IuaW5Db250YWluZXInLCB7XG4gICAgICAgICAgICB1cmw6ICcvOmNvbnRhaW5lcklkJ1xuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ25vUHJvamVjdCcsIHtcbiAgICAgICAgICAgIHVybDogJy9ub1Byb2plY3QnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9ub1Byb2plY3RTcGVjaWZpZWQuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnTm9Qcm9qZWN0Q29udHJvbGxlcidcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCc0MDQnLCB7XG4gICAgICAgICAgICB1cmw6ICcvNDA0Lzpwcm9qZWN0SWQnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ05vUHJvamVjdENvbnRyb2xsZXInLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy80MDQuaHRtbCdcbiAgICAgICAgfSk7XG59KTtcblxuQ3lQaHlBcHAuY29udHJvbGxlcignTWFpbk5hdmlnYXRvckNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlLCAkd2luZG93KSB7XG5cbiAgICB2YXIgZGVmYXVsdE5hdmlnYXRvckl0ZW1zO1xuXG4gICAgZGVmYXVsdE5hdmlnYXRvckl0ZW1zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3Jvb3QnLFxuICAgICAgICAgICAgbGFiZWw6ICdNZXRhTW9ycGhvc2lzJyxcbiAgICAgICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnXG4gICAgICAgIH1cbiAgICBdO1xuXG4gICAgJHNjb3BlLm5hdmlnYXRvciA9IHtcbiAgICAgICAgc2VwYXJhdG9yOiB0cnVlLFxuICAgICAgICBpdGVtczogYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pXG4gICAgfTtcblxuICAgICRyb290U2NvcGUuJHdhdGNoKCdwcm9qZWN0SWQnLCBmdW5jdGlvbiAocHJvamVjdElkKSB7XG5cbiAgICAgICAgaWYgKHByb2plY3RJZCkge1xuXG4gICAgICAgICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pO1xuICAgICAgICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogJ3Byb2plY3QnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBwcm9qZWN0SWQsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PScgKyBwcm9qZWN0SWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxufSk7XG5cbkN5UGh5QXBwLmNvbnRyb2xsZXIoJ0VkaXRvclZpZXdDb250cm9sbGVyJywgZnVuY3Rpb24gKCkge1xuXG59KTtcblxuQ3lQaHlBcHAuY29udHJvbGxlcignTm9Qcm9qZWN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc2NvcGUsICRzdGF0ZVBhcmFtcywgJGh0dHAsICRsb2csICRzdGF0ZSwgZ3Jvd2wpIHtcblxuICAgICRzY29wZS5wcm9qZWN0SWQgPSAkc3RhdGVQYXJhbXMucHJvamVjdElkO1xuICAgICRzY29wZS5lcnJvcmVkID0gZmFsc2U7XG5cbiAgICAkc2NvcGUuc3RhcnROZXdQcm9qZWN0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICRyb290U2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG5cbiAgICAgICAgJGxvZy5kZWJ1ZygnTmV3IHByb2plY3QgY3JlYXRpb24nKTtcblxuICAgICAgICAkaHR0cC5nZXQoJy9yZXN0L2V4dGVybmFsL2NvcHlwcm9qZWN0L25vcmVkaXJlY3QnKVxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnTmV3IHByb2plY3QgY3JlYXRpb24gc3VjY2Vzc2Z1bCcsIGRhdGEpO1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnZWRpdG9yJywge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6IGRhdGFcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgIGVycm9yKGZ1bmN0aW9uIChkYXRhLCBzdGF0dXMpIHtcblxuICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ05ldyBwcm9qZWN0IGNyZWF0aW9uIGZhaWxlZCcsIHN0YXR1cyk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ0FuIGVycm9yIG9jY3VyZWQgd2hpbGUgcHJvamVjdCBjcmVhdGlvbi4gUGxlYXNlIHJldHJ5IGxhdGVyLicpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pO1xuIiwiLy8gQXJyYXkucHJvdG90eXBlLmZpbmQgLSBNSVQgTGljZW5zZSAoYykgMjAxMyBQYXVsIE1pbGxlciA8aHR0cDovL3BhdWxtaWxsci5jb20+XG4vLyBGb3IgYWxsIGRldGFpbHMgYW5kIGRvY3M6IGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsbWlsbHIvYXJyYXkucHJvdG90eXBlLmZpbmRcbi8vIEZpeGVzIGFuZCB0ZXN0cyBzdXBwbGllZCBieSBEdW5jYW4gSGFsbCA8aHR0cDovL2R1bmNhbmhhbGwubmV0PiBcbihmdW5jdGlvbihnbG9iYWxzKXtcbiAgaWYgKEFycmF5LnByb3RvdHlwZS5maW5kKSByZXR1cm47XG5cbiAgdmFyIGZpbmQgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICB2YXIgbGlzdCA9IE9iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGggPCAwID8gMCA6IGxpc3QubGVuZ3RoID4+PiAwOyAvLyBFUy5Ub1VpbnQzMjtcbiAgICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgcHJlZGljYXRlICE9PSAnZnVuY3Rpb24nIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcmVkaWNhdGUpICE9PSAnW29iamVjdCBGdW5jdGlvbl0nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheSNmaW5kOiBwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzFdO1xuICAgIGZvciAodmFyIGkgPSAwLCB2YWx1ZTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG5cbiAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkge1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCAnZmluZCcsIHtcbiAgICAgICAgdmFsdWU6IGZpbmQsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZpbmQgPSBmaW5kO1xuICB9XG59KSh0aGlzKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcbiAqIEBhdXRob3IgQnJhbmRvbiBKb25lc1xuICogQGF1dGhvciBDb2xpbiBNYWNLZW56aWUgSVZcbiAqIEB2ZXJzaW9uIDIuMi4xXG4gKi9cbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb25cbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRVxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuKGZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PXt9O3R5cGVvZiBleHBvcnRzPT1cInVuZGVmaW5lZFwiP3R5cGVvZiBkZWZpbmU9PVwiZnVuY3Rpb25cIiYmdHlwZW9mIGRlZmluZS5hbWQ9PVwib2JqZWN0XCImJmRlZmluZS5hbWQ/KHQuZXhwb3J0cz17fSxkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gdC5leHBvcnRzfSkpOnQuZXhwb3J0cz10eXBlb2Ygd2luZG93IT1cInVuZGVmaW5lZFwiP3dpbmRvdzplOnQuZXhwb3J0cz1leHBvcnRzLGZ1bmN0aW9uKGUpe2lmKCF0KXZhciB0PTFlLTY7aWYoIW4pdmFyIG49dHlwZW9mIEZsb2F0MzJBcnJheSE9XCJ1bmRlZmluZWRcIj9GbG9hdDMyQXJyYXk6QXJyYXk7aWYoIXIpdmFyIHI9TWF0aC5yYW5kb207dmFyIGk9e307aS5zZXRNYXRyaXhBcnJheVR5cGU9ZnVuY3Rpb24oZSl7bj1lfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUuZ2xNYXRyaXg9aSk7dmFyIHM9TWF0aC5QSS8xODA7aS50b1JhZGlhbj1mdW5jdGlvbihlKXtyZXR1cm4gZSpzfTt2YXIgbz17fTtvLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDIpO3JldHVybiBlWzBdPTAsZVsxXT0wLGV9LG8uY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMik7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdH0sby5mcm9tVmFsdWVzPWZ1bmN0aW9uKGUsdCl7dmFyIHI9bmV3IG4oMik7cmV0dXJuIHJbMF09ZSxyWzFdPXQscn0sby5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZX0sby5zZXQ9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXQsZVsxXT1uLGV9LG8uYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZX0sby5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGV9LG8uc3ViPW8uc3VidHJhY3Qsby5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGV9LG8ubXVsPW8ubXVsdGlwbHksby5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlfSxvLmRpdj1vLmRpdmlkZSxvLm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZX0sby5tYXg9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWF4KHRbMF0sblswXSksZVsxXT1NYXRoLm1heCh0WzFdLG5bMV0pLGV9LG8uc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qbixlWzFdPXRbMV0qbixlfSxvLnNjYWxlQW5kQWRkPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXRbMF0rblswXSpyLGVbMV09dFsxXStuWzFdKnIsZX0sby5kaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXTtyZXR1cm4gTWF0aC5zcXJ0KG4qbityKnIpfSxvLmRpc3Q9by5kaXN0YW5jZSxvLnNxdWFyZWREaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXTtyZXR1cm4gbipuK3Iqcn0sby5zcXJEaXN0PW8uc3F1YXJlZERpc3RhbmNlLG8ubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdO3JldHVybiBNYXRoLnNxcnQodCp0K24qbil9LG8ubGVuPW8ubGVuZ3RoLG8uc3F1YXJlZExlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXTtyZXR1cm4gdCp0K24qbn0sby5zcXJMZW49by5zcXVhcmVkTGVuZ3RoLG8ubmVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlfSxvLm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9bipuK3IqcjtyZXR1cm4gaT4wJiYoaT0xL01hdGguc3FydChpKSxlWzBdPXRbMF0qaSxlWzFdPXRbMV0qaSksZX0sby5kb3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXSp0WzBdK2VbMV0qdFsxXX0sby5jcm9zcz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSpuWzFdLXRbMV0qblswXTtyZXR1cm4gZVswXT1lWzFdPTAsZVsyXT1yLGV9LG8ubGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXTtyZXR1cm4gZVswXT1pK3IqKG5bMF0taSksZVsxXT1zK3IqKG5bMV0tcyksZX0sby5yYW5kb209ZnVuY3Rpb24oZSx0KXt0PXR8fDE7dmFyIG49cigpKjIqTWF0aC5QSTtyZXR1cm4gZVswXT1NYXRoLmNvcyhuKSp0LGVbMV09TWF0aC5zaW4obikqdCxlfSxvLnRyYW5zZm9ybU1hdDI9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzJdKmksZVsxXT1uWzFdKnIrblszXSppLGV9LG8udHJhbnNmb3JtTWF0MmQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzJdKmkrbls0XSxlWzFdPW5bMV0qcituWzNdKmkrbls1XSxlfSxvLnRyYW5zZm9ybU1hdDM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzNdKmkrbls2XSxlWzFdPW5bMV0qcituWzRdKmkrbls3XSxlfSxvLnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzRdKmkrblsxMl0sZVsxXT1uWzFdKnIrbls1XSppK25bMTNdLGV9LG8uZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPW8uY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTIpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV07cmV0dXJuIHR9fSgpLG8uc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjMihcIitlWzBdK1wiLCBcIitlWzFdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjMj1vKTt2YXIgdT17fTt1LmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDMpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlfSx1LmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDMpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0fSx1LmZyb21WYWx1ZXM9ZnVuY3Rpb24oZSx0LHIpe3ZhciBpPW5ldyBuKDMpO3JldHVybiBpWzBdPWUsaVsxXT10LGlbMl09cixpfSx1LmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZX0sdS5zZXQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dCxlWzFdPW4sZVsyXT1yLGV9LHUuYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZVsyXT10WzJdK25bMl0sZX0sdS5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGVbMl09dFsyXS1uWzJdLGV9LHUuc3ViPXUuc3VidHJhY3QsdS5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGVbMl09dFsyXSpuWzJdLGV9LHUubXVsPXUubXVsdGlwbHksdS5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlWzJdPXRbMl0vblsyXSxlfSx1LmRpdj11LmRpdmlkZSx1Lm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZVsyXT1NYXRoLm1pbih0WzJdLG5bMl0pLGV9LHUubWF4PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1heCh0WzBdLG5bMF0pLGVbMV09TWF0aC5tYXgodFsxXSxuWzFdKSxlWzJdPU1hdGgubWF4KHRbMl0sblsyXSksZX0sdS5zY2FsZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuLGVbMV09dFsxXSpuLGVbMl09dFsyXSpuLGV9LHUuc2NhbGVBbmRBZGQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dFswXStuWzBdKnIsZVsxXT10WzFdK25bMV0qcixlWzJdPXRbMl0rblsyXSpyLGV9LHUuZGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl07cmV0dXJuIE1hdGguc3FydChuKm4rcipyK2kqaSl9LHUuZGlzdD11LmRpc3RhbmNlLHUuc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdO3JldHVybiBuKm4rcipyK2kqaX0sdS5zcXJEaXN0PXUuc3F1YXJlZERpc3RhbmNlLHUubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXTtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtuKm4rcipyKX0sdS5sZW49dS5sZW5ndGgsdS5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXTtyZXR1cm4gdCp0K24qbityKnJ9LHUuc3FyTGVuPXUuc3F1YXJlZExlbmd0aCx1Lm5lZ2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlfSx1Lm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPW4qbityKnIraSppO3JldHVybiBzPjAmJihzPTEvTWF0aC5zcXJ0KHMpLGVbMF09dFswXSpzLGVbMV09dFsxXSpzLGVbMl09dFsyXSpzKSxlfSx1LmRvdD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdKnRbMF0rZVsxXSp0WzFdK2VbMl0qdFsyXX0sdS5jcm9zcz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89blswXSx1PW5bMV0sYT1uWzJdO3JldHVybiBlWzBdPWkqYS1zKnUsZVsxXT1zKm8tciphLGVbMl09cip1LWkqbyxlfSx1LmxlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdO3JldHVybiBlWzBdPWkrciooblswXS1pKSxlWzFdPXMrciooblsxXS1zKSxlWzJdPW8rciooblsyXS1vKSxlfSx1LnJhbmRvbT1mdW5jdGlvbihlLHQpe3Q9dHx8MTt2YXIgbj1yKCkqMipNYXRoLlBJLGk9cigpKjItMSxzPU1hdGguc3FydCgxLWkqaSkqdDtyZXR1cm4gZVswXT1NYXRoLmNvcyhuKSpzLGVbMV09TWF0aC5zaW4obikqcyxlWzJdPWkqdCxlfSx1LnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bOF0qcytuWzEyXSxlWzFdPW5bMV0qcituWzVdKmkrbls5XSpzK25bMTNdLGVbMl09blsyXSpyK25bNl0qaStuWzEwXSpzK25bMTRdLGV9LHUudHJhbnNmb3JtTWF0Mz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdO3JldHVybiBlWzBdPXIqblswXStpKm5bM10rcypuWzZdLGVbMV09cipuWzFdK2kqbls0XStzKm5bN10sZVsyXT1yKm5bMl0raSpuWzVdK3Mqbls4XSxlfSx1LnRyYW5zZm9ybVF1YXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPW5bMF0sdT1uWzFdLGE9blsyXSxmPW5bM10sbD1mKnIrdSpzLWEqaSxjPWYqaSthKnItbypzLGg9ZipzK28qaS11KnIscD0tbypyLXUqaS1hKnM7cmV0dXJuIGVbMF09bCpmK3AqLW8rYyotYS1oKi11LGVbMV09YypmK3AqLXUraCotby1sKi1hLGVbMl09aCpmK3AqLWErbCotdS1jKi1vLGV9LHUucm90YXRlWD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT1bXSxzPVtdO3JldHVybiBpWzBdPXRbMF0tblswXSxpWzFdPXRbMV0tblsxXSxpWzJdPXRbMl0tblsyXSxzWzBdPWlbMF0sc1sxXT1pWzFdKk1hdGguY29zKHIpLWlbMl0qTWF0aC5zaW4ociksc1syXT1pWzFdKk1hdGguc2luKHIpK2lbMl0qTWF0aC5jb3MociksZVswXT1zWzBdK25bMF0sZVsxXT1zWzFdK25bMV0sZVsyXT1zWzJdK25bMl0sZX0sdS5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPVtdLHM9W107cmV0dXJuIGlbMF09dFswXS1uWzBdLGlbMV09dFsxXS1uWzFdLGlbMl09dFsyXS1uWzJdLHNbMF09aVsyXSpNYXRoLnNpbihyKStpWzBdKk1hdGguY29zKHIpLHNbMV09aVsxXSxzWzJdPWlbMl0qTWF0aC5jb3MociktaVswXSpNYXRoLnNpbihyKSxlWzBdPXNbMF0rblswXSxlWzFdPXNbMV0rblsxXSxlWzJdPXNbMl0rblsyXSxlfSx1LnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9W10scz1bXTtyZXR1cm4gaVswXT10WzBdLW5bMF0saVsxXT10WzFdLW5bMV0saVsyXT10WzJdLW5bMl0sc1swXT1pWzBdKk1hdGguY29zKHIpLWlbMV0qTWF0aC5zaW4ociksc1sxXT1pWzBdKk1hdGguc2luKHIpK2lbMV0qTWF0aC5jb3Mociksc1syXT1pWzJdLGVbMF09c1swXStuWzBdLGVbMV09c1sxXStuWzFdLGVbMl09c1syXStuWzJdLGV9LHUuZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPXUuY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTMpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxlWzJdPXRbdSsyXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV0sdFt1KzJdPWVbMl07cmV0dXJuIHR9fSgpLHUuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjMyhcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjMz11KTt2YXIgYT17fTthLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDQpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTAsZX0sYS5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig0KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHR9LGEuZnJvbVZhbHVlcz1mdW5jdGlvbihlLHQscixpKXt2YXIgcz1uZXcgbig0KTtyZXR1cm4gc1swXT1lLHNbMV09dCxzWzJdPXIsc1szXT1pLHN9LGEuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZX0sYS5zZXQ9ZnVuY3Rpb24oZSx0LG4scixpKXtyZXR1cm4gZVswXT10LGVbMV09bixlWzJdPXIsZVszXT1pLGV9LGEuYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZVsyXT10WzJdK25bMl0sZVszXT10WzNdK25bM10sZX0sYS5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGVbMl09dFsyXS1uWzJdLGVbM109dFszXS1uWzNdLGV9LGEuc3ViPWEuc3VidHJhY3QsYS5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGVbMl09dFsyXSpuWzJdLGVbM109dFszXSpuWzNdLGV9LGEubXVsPWEubXVsdGlwbHksYS5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlWzJdPXRbMl0vblsyXSxlWzNdPXRbM10vblszXSxlfSxhLmRpdj1hLmRpdmlkZSxhLm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZVsyXT1NYXRoLm1pbih0WzJdLG5bMl0pLGVbM109TWF0aC5taW4odFszXSxuWzNdKSxlfSxhLm1heD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5tYXgodFswXSxuWzBdKSxlWzFdPU1hdGgubWF4KHRbMV0sblsxXSksZVsyXT1NYXRoLm1heCh0WzJdLG5bMl0pLGVbM109TWF0aC5tYXgodFszXSxuWzNdKSxlfSxhLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm4sZVsxXT10WzFdKm4sZVsyXT10WzJdKm4sZVszXT10WzNdKm4sZX0sYS5zY2FsZUFuZEFkZD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10WzBdK25bMF0qcixlWzFdPXRbMV0rblsxXSpyLGVbMl09dFsyXStuWzJdKnIsZVszXT10WzNdK25bM10qcixlfSxhLmRpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdLHM9dFszXS1lWzNdO3JldHVybiBNYXRoLnNxcnQobipuK3IqcitpKmkrcypzKX0sYS5kaXN0PWEuZGlzdGFuY2UsYS5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl0scz10WzNdLWVbM107cmV0dXJuIG4qbityKnIraSppK3Mqc30sYS5zcXJEaXN0PWEuc3F1YXJlZERpc3RhbmNlLGEubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM107cmV0dXJuIE1hdGguc3FydCh0KnQrbipuK3IqcitpKmkpfSxhLmxlbj1hLmxlbmd0aCxhLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXTtyZXR1cm4gdCp0K24qbityKnIraSppfSxhLnNxckxlbj1hLnNxdWFyZWRMZW5ndGgsYS5uZWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZVszXT0tdFszXSxlfSxhLm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKm4rcipyK2kqaStzKnM7cmV0dXJuIG8+MCYmKG89MS9NYXRoLnNxcnQobyksZVswXT10WzBdKm8sZVsxXT10WzFdKm8sZVsyXT10WzJdKm8sZVszXT10WzNdKm8pLGV9LGEuZG90PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0qdFswXStlWzFdKnRbMV0rZVsyXSp0WzJdK2VbM10qdFszXX0sYS5sZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXSx1PXRbM107cmV0dXJuIGVbMF09aStyKihuWzBdLWkpLGVbMV09cytyKihuWzFdLXMpLGVbMl09bytyKihuWzJdLW8pLGVbM109dStyKihuWzNdLXUpLGV9LGEucmFuZG9tPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIHQ9dHx8MSxlWzBdPXIoKSxlWzFdPXIoKSxlWzJdPXIoKSxlWzNdPXIoKSxhLm5vcm1hbGl6ZShlLGUpLGEuc2NhbGUoZSxlLHQpLGV9LGEudHJhbnNmb3JtTWF0ND1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bOF0qcytuWzEyXSpvLGVbMV09blsxXSpyK25bNV0qaStuWzldKnMrblsxM10qbyxlWzJdPW5bMl0qcituWzZdKmkrblsxMF0qcytuWzE0XSpvLGVbM109blszXSpyK25bN10qaStuWzExXSpzK25bMTVdKm8sZX0sYS50cmFuc2Zvcm1RdWF0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz1uWzBdLHU9blsxXSxhPW5bMl0sZj1uWzNdLGw9ZipyK3Uqcy1hKmksYz1mKmkrYSpyLW8qcyxoPWYqcytvKmktdSpyLHA9LW8qci11KmktYSpzO3JldHVybiBlWzBdPWwqZitwKi1vK2MqLWEtaCotdSxlWzFdPWMqZitwKi11K2gqLW8tbCotYSxlWzJdPWgqZitwKi1hK2wqLXUtYyotbyxlfSxhLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT1hLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj00KSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0sZVsyXT10W3UrMl0sZVszXT10W3UrM10scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdLHRbdSsyXT1lWzJdLHRbdSszXT1lWzNdO3JldHVybiB0fX0oKSxhLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzQ9YSk7dmFyIGY9e307Zi5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig0KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGV9LGYuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNCk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0fSxmLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGV9LGYuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxmLnRyYW5zcG9zZT1mdW5jdGlvbihlLHQpe2lmKGU9PT10KXt2YXIgbj10WzFdO2VbMV09dFsyXSxlWzJdPW59ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzJdLGVbMl09dFsxXSxlWzNdPXRbM107cmV0dXJuIGV9LGYuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qcy1pKnI7cmV0dXJuIG8/KG89MS9vLGVbMF09cypvLGVbMV09LXIqbyxlWzJdPS1pKm8sZVszXT1uKm8sZSk6bnVsbH0sZi5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXTtyZXR1cm4gZVswXT10WzNdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlWzNdPW4sZX0sZi5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXtyZXR1cm4gZVswXSplWzNdLWVbMl0qZVsxXX0sZi5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdLGY9blsyXSxsPW5bM107cmV0dXJuIGVbMF09cip1K3MqYSxlWzFdPWkqdStvKmEsZVsyXT1yKmYrcypsLGVbM109aSpmK28qbCxlfSxmLm11bD1mLm11bHRpcGx5LGYucm90YXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmErcyp1LGVbMV09aSphK28qdSxlWzJdPXIqLXUrcyphLGVbM109aSotdStvKmEsZX0sZi5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdO3JldHVybiBlWzBdPXIqdSxlWzFdPWkqdSxlWzJdPXMqYSxlWzNdPW8qYSxlfSxmLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDIoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sZi5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKSl9LGYuTERVPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzJdPXJbMl0vclswXSxuWzBdPXJbMF0sblsxXT1yWzFdLG5bM109clszXS1lWzJdKm5bMV0sW2UsdCxuXX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDI9Zik7dmFyIGw9e307bC5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig2KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGVbNF09MCxlWzVdPTAsZX0sbC5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig2KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdH0sbC5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGV9LGwuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlWzRdPTAsZVs1XT0wLGV9LGwuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9bipzLXIqaTtyZXR1cm4gYT8oYT0xL2EsZVswXT1zKmEsZVsxXT0tciphLGVbMl09LWkqYSxlWzNdPW4qYSxlWzRdPShpKnUtcypvKSphLGVbNV09KHIqby1uKnUpKmEsZSk6bnVsbH0sbC5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXtyZXR1cm4gZVswXSplWzNdLWVbMV0qZVsyXX0sbC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV0sYz1uWzJdLGg9blszXSxwPW5bNF0sZD1uWzVdO3JldHVybiBlWzBdPXIqZitzKmwsZVsxXT1pKmYrbypsLGVbMl09cipjK3MqaCxlWzNdPWkqYytvKmgsZVs0XT1yKnArcypkK3UsZVs1XT1pKnArbypkK2EsZX0sbC5tdWw9bC5tdWx0aXBseSxsLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9TWF0aC5zaW4obiksbD1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmwrcypmLGVbMV09aSpsK28qZixlWzJdPXIqLWYrcypsLGVbM109aSotZitvKmwsZVs0XT11LGVbNV09YSxlfSxsLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj1uWzBdLGw9blsxXTtyZXR1cm4gZVswXT1yKmYsZVsxXT1pKmYsZVsyXT1zKmwsZVszXT1vKmwsZVs0XT11LGVbNV09YSxlfSxsLnRyYW5zbGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV07cmV0dXJuIGVbMF09cixlWzFdPWksZVsyXT1zLGVbM109byxlWzRdPXIqZitzKmwrdSxlWzVdPWkqZitvKmwrYSxlfSxsLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDJkKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIpXCJ9LGwuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpKzEpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0MmQ9bCk7dmFyIGM9e307Yy5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig5KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MSxlWzVdPTAsZVs2XT0wLGVbN109MCxlWzhdPTEsZX0sYy5mcm9tTWF0ND1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbNF0sZVs0XT10WzVdLGVbNV09dFs2XSxlWzZdPXRbOF0sZVs3XT10WzldLGVbOF09dFsxMF0sZX0sYy5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig5KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdFs2XT1lWzZdLHRbN109ZVs3XSx0WzhdPWVbOF0sdH0sYy5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGV9LGMuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTEsZVs1XT0wLGVbNl09MCxlWzddPTAsZVs4XT0xLGV9LGMudHJhbnNwb3NlPWZ1bmN0aW9uKGUsdCl7aWYoZT09PXQpe3ZhciBuPXRbMV0scj10WzJdLGk9dFs1XTtlWzFdPXRbM10sZVsyXT10WzZdLGVbM109bixlWzVdPXRbN10sZVs2XT1yLGVbN109aX1lbHNlIGVbMF09dFswXSxlWzFdPXRbM10sZVsyXT10WzZdLGVbM109dFsxXSxlWzRdPXRbNF0sZVs1XT10WzddLGVbNl09dFsyXSxlWzddPXRbNV0sZVs4XT10WzhdO3JldHVybiBlfSxjLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPWwqby11KmYsaD0tbCpzK3UqYSxwPWYqcy1vKmEsZD1uKmMrcipoK2kqcDtyZXR1cm4gZD8oZD0xL2QsZVswXT1jKmQsZVsxXT0oLWwqcitpKmYpKmQsZVsyXT0odSpyLWkqbykqZCxlWzNdPWgqZCxlWzRdPShsKm4taSphKSpkLGVbNV09KC11Km4raSpzKSpkLGVbNl09cCpkLGVbN109KC1mKm4rciphKSpkLGVbOF09KG8qbi1yKnMpKmQsZSk6bnVsbH0sYy5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdO3JldHVybiBlWzBdPW8qbC11KmYsZVsxXT1pKmYtcipsLGVbMl09cip1LWkqbyxlWzNdPXUqYS1zKmwsZVs0XT1uKmwtaSphLGVbNV09aSpzLW4qdSxlWzZdPXMqZi1vKmEsZVs3XT1yKmEtbipmLGVbOF09bipvLXIqcyxlfSxjLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM10scz1lWzRdLG89ZVs1XSx1PWVbNl0sYT1lWzddLGY9ZVs4XTtyZXR1cm4gdCooZipzLW8qYSkrbiooLWYqaStvKnUpK3IqKGEqaS1zKnUpfSxjLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD1uWzBdLHA9blsxXSxkPW5bMl0sdj1uWzNdLG09bls0XSxnPW5bNV0seT1uWzZdLGI9bls3XSx3PW5bOF07cmV0dXJuIGVbMF09aCpyK3AqbytkKmYsZVsxXT1oKmkrcCp1K2QqbCxlWzJdPWgqcytwKmErZCpjLGVbM109dipyK20qbytnKmYsZVs0XT12KmkrbSp1K2cqbCxlWzVdPXYqcyttKmErZypjLGVbNl09eSpyK2Iqbyt3KmYsZVs3XT15KmkrYip1K3cqbCxlWzhdPXkqcytiKmErdypjLGV9LGMubXVsPWMubXVsdGlwbHksYy50cmFuc2xhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPW5bMF0scD1uWzFdO3JldHVybiBlWzBdPXIsZVsxXT1pLGVbMl09cyxlWzNdPW8sZVs0XT11LGVbNV09YSxlWzZdPWgqcitwKm8rZixlWzddPWgqaStwKnUrbCxlWzhdPWgqcytwKmErYyxlfSxjLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9TWF0aC5zaW4obikscD1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1wKnIraCpvLGVbMV09cCppK2gqdSxlWzJdPXAqcytoKmEsZVszXT1wKm8taCpyLGVbNF09cCp1LWgqaSxlWzVdPXAqYS1oKnMsZVs2XT1mLGVbN109bCxlWzhdPWMsZX0sYy5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV07cmV0dXJuIGVbMF09cip0WzBdLGVbMV09cip0WzFdLGVbMl09cip0WzJdLGVbM109aSp0WzNdLGVbNF09aSp0WzRdLGVbNV09aSp0WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGV9LGMuZnJvbU1hdDJkPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT0wLGVbM109dFsyXSxlWzRdPXRbM10sZVs1XT0wLGVbNl09dFs0XSxlWzddPXRbNV0sZVs4XT0xLGV9LGMuZnJvbVF1YXQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bituLHU9cityLGE9aStpLGY9bipvLGw9cipvLGM9cip1LGg9aSpvLHA9aSp1LGQ9aSphLHY9cypvLG09cyp1LGc9cyphO3JldHVybiBlWzBdPTEtYy1kLGVbM109bC1nLGVbNl09aCttLGVbMV09bCtnLGVbNF09MS1mLWQsZVs3XT1wLXYsZVsyXT1oLW0sZVs1XT1wK3YsZVs4XT0xLWYtYyxlfSxjLm5vcm1hbEZyb21NYXQ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XSx5PW4qdS1yKm8sYj1uKmEtaSpvLHc9bipmLXMqbyxFPXIqYS1pKnUsUz1yKmYtcyp1LHg9aSpmLXMqYSxUPWwqdi1jKmQsTj1sKm0taCpkLEM9bCpnLXAqZCxrPWMqbS1oKnYsTD1jKmctcCp2LEE9aCpnLXAqbSxPPXkqQS1iKkwrdyprK0UqQy1TKk4reCpUO3JldHVybiBPPyhPPTEvTyxlWzBdPSh1KkEtYSpMK2YqaykqTyxlWzFdPShhKkMtbypBLWYqTikqTyxlWzJdPShvKkwtdSpDK2YqVCkqTyxlWzNdPShpKkwtcipBLXMqaykqTyxlWzRdPShuKkEtaSpDK3MqTikqTyxlWzVdPShyKkMtbipMLXMqVCkqTyxlWzZdPSh2KngtbSpTK2cqRSkqTyxlWzddPShtKnctZCp4LWcqYikqTyxlWzhdPShkKlMtdip3K2cqeSkqTyxlKTpudWxsfSxjLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDMoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIiwgXCIrZVs0XStcIiwgXCIrZVs1XStcIiwgXCIrZVs2XStcIiwgXCIrZVs3XStcIiwgXCIrZVs4XStcIilcIn0sYy5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKStNYXRoLnBvdyhlWzRdLDIpK01hdGgucG93KGVbNV0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzddLDIpK01hdGgucG93KGVbOF0sMikpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0Mz1jKTt2YXIgaD17fTtoLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDE2KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPTEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTEsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGguY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMTYpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdFs0XT1lWzRdLHRbNV09ZVs1XSx0WzZdPWVbNl0sdFs3XT1lWzddLHRbOF09ZVs4XSx0WzldPWVbOV0sdFsxMF09ZVsxMF0sdFsxMV09ZVsxMV0sdFsxMl09ZVsxMl0sdFsxM109ZVsxM10sdFsxNF09ZVsxNF0sdFsxNV09ZVsxNV0sdH0saC5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGVbOV09dFs5XSxlWzEwXT10WzEwXSxlWzExXT10WzExXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSxlfSxoLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09MSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MSxlWzExXT0wLGVbMTJdPTAsZVsxM109MCxlWzE0XT0wLGVbMTVdPTEsZX0saC50cmFuc3Bvc2U9ZnVuY3Rpb24oZSx0KXtpZihlPT09dCl7dmFyIG49dFsxXSxyPXRbMl0saT10WzNdLHM9dFs2XSxvPXRbN10sdT10WzExXTtlWzFdPXRbNF0sZVsyXT10WzhdLGVbM109dFsxMl0sZVs0XT1uLGVbNl09dFs5XSxlWzddPXRbMTNdLGVbOF09cixlWzldPXMsZVsxMV09dFsxNF0sZVsxMl09aSxlWzEzXT1vLGVbMTRdPXV9ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzRdLGVbMl09dFs4XSxlWzNdPXRbMTJdLGVbNF09dFsxXSxlWzVdPXRbNV0sZVs2XT10WzldLGVbN109dFsxM10sZVs4XT10WzJdLGVbOV09dFs2XSxlWzEwXT10WzEwXSxlWzExXT10WzE0XSxlWzEyXT10WzNdLGVbMTNdPXRbN10sZVsxNF09dFsxMV0sZVsxNV09dFsxNV07cmV0dXJuIGV9LGguaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XSx5PW4qdS1yKm8sYj1uKmEtaSpvLHc9bipmLXMqbyxFPXIqYS1pKnUsUz1yKmYtcyp1LHg9aSpmLXMqYSxUPWwqdi1jKmQsTj1sKm0taCpkLEM9bCpnLXAqZCxrPWMqbS1oKnYsTD1jKmctcCp2LEE9aCpnLXAqbSxPPXkqQS1iKkwrdyprK0UqQy1TKk4reCpUO3JldHVybiBPPyhPPTEvTyxlWzBdPSh1KkEtYSpMK2YqaykqTyxlWzFdPShpKkwtcipBLXMqaykqTyxlWzJdPSh2KngtbSpTK2cqRSkqTyxlWzNdPShoKlMtYyp4LXAqRSkqTyxlWzRdPShhKkMtbypBLWYqTikqTyxlWzVdPShuKkEtaSpDK3MqTikqTyxlWzZdPShtKnctZCp4LWcqYikqTyxlWzddPShsKngtaCp3K3AqYikqTyxlWzhdPShvKkwtdSpDK2YqVCkqTyxlWzldPShyKkMtbipMLXMqVCkqTyxlWzEwXT0oZCpTLXYqdytnKnkpKk8sZVsxMV09KGMqdy1sKlMtcCp5KSpPLGVbMTJdPSh1Kk4tbyprLWEqVCkqTyxlWzEzXT0obiprLXIqTitpKlQpKk8sZVsxNF09KHYqYi1kKkUtbSp5KSpPLGVbMTVdPShsKkUtYypiK2gqeSkqTyxlKTpudWxsfSxoLmFkam9pbnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz10WzldLGg9dFsxMF0scD10WzExXSxkPXRbMTJdLHY9dFsxM10sbT10WzE0XSxnPXRbMTVdO3JldHVybiBlWzBdPXUqKGgqZy1wKm0pLWMqKGEqZy1mKm0pK3YqKGEqcC1mKmgpLGVbMV09LShyKihoKmctcCptKS1jKihpKmctcyptKSt2KihpKnAtcypoKSksZVsyXT1yKihhKmctZiptKS11KihpKmctcyptKSt2KihpKmYtcyphKSxlWzNdPS0ociooYSpwLWYqaCktdSooaSpwLXMqaCkrYyooaSpmLXMqYSkpLGVbNF09LShvKihoKmctcCptKS1sKihhKmctZiptKStkKihhKnAtZipoKSksZVs1XT1uKihoKmctcCptKS1sKihpKmctcyptKStkKihpKnAtcypoKSxlWzZdPS0obiooYSpnLWYqbSktbyooaSpnLXMqbSkrZCooaSpmLXMqYSkpLGVbN109biooYSpwLWYqaCktbyooaSpwLXMqaCkrbCooaSpmLXMqYSksZVs4XT1vKihjKmctcCp2KS1sKih1KmctZip2KStkKih1KnAtZipjKSxlWzldPS0obiooYypnLXAqdiktbCoocipnLXMqdikrZCoocipwLXMqYykpLGVbMTBdPW4qKHUqZy1mKnYpLW8qKHIqZy1zKnYpK2QqKHIqZi1zKnUpLGVbMTFdPS0obioodSpwLWYqYyktbyoocipwLXMqYykrbCoocipmLXMqdSkpLGVbMTJdPS0obyooYyptLWgqdiktbCoodSptLWEqdikrZCoodSpoLWEqYykpLGVbMTNdPW4qKGMqbS1oKnYpLWwqKHIqbS1pKnYpK2QqKHIqaC1pKmMpLGVbMTRdPS0obioodSptLWEqdiktbyoociptLWkqdikrZCoociphLWkqdSkpLGVbMTVdPW4qKHUqaC1hKmMpLW8qKHIqaC1pKmMpK2wqKHIqYS1pKnUpLGV9LGguZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXSxzPWVbNF0sbz1lWzVdLHU9ZVs2XSxhPWVbN10sZj1lWzhdLGw9ZVs5XSxjPWVbMTBdLGg9ZVsxMV0scD1lWzEyXSxkPWVbMTNdLHY9ZVsxNF0sbT1lWzE1XSxnPXQqby1uKnMseT10KnUtcipzLGI9dCphLWkqcyx3PW4qdS1yKm8sRT1uKmEtaSpvLFM9ciphLWkqdSx4PWYqZC1sKnAsVD1mKnYtYypwLE49ZiptLWgqcCxDPWwqdi1jKmQsaz1sKm0taCpkLEw9YyptLWgqdjtyZXR1cm4gZypMLXkqaytiKkMrdypOLUUqVCtTKnh9LGgubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPXRbOV0scD10WzEwXSxkPXRbMTFdLHY9dFsxMl0sbT10WzEzXSxnPXRbMTRdLHk9dFsxNV0sYj1uWzBdLHc9blsxXSxFPW5bMl0sUz1uWzNdO3JldHVybiBlWzBdPWIqcit3KnUrRSpjK1MqdixlWzFdPWIqaSt3KmErRSpoK1MqbSxlWzJdPWIqcyt3KmYrRSpwK1MqZyxlWzNdPWIqbyt3KmwrRSpkK1MqeSxiPW5bNF0sdz1uWzVdLEU9bls2XSxTPW5bN10sZVs0XT1iKnIrdyp1K0UqYytTKnYsZVs1XT1iKmkrdyphK0UqaCtTKm0sZVs2XT1iKnMrdypmK0UqcCtTKmcsZVs3XT1iKm8rdypsK0UqZCtTKnksYj1uWzhdLHc9bls5XSxFPW5bMTBdLFM9blsxMV0sZVs4XT1iKnIrdyp1K0UqYytTKnYsZVs5XT1iKmkrdyphK0UqaCtTKm0sZVsxMF09YipzK3cqZitFKnArUypnLGVbMTFdPWIqbyt3KmwrRSpkK1MqeSxiPW5bMTJdLHc9blsxM10sRT1uWzE0XSxTPW5bMTVdLGVbMTJdPWIqcit3KnUrRSpjK1MqdixlWzEzXT1iKmkrdyphK0UqaCtTKm0sZVsxNF09YipzK3cqZitFKnArUypnLGVbMTVdPWIqbyt3KmwrRSpkK1MqeSxlfSxoLm11bD1oLm11bHRpcGx5LGgudHJhbnNsYXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXSxzPW5bMl0sbyx1LGEsZixsLGMsaCxwLGQsdixtLGc7cmV0dXJuIHQ9PT1lPyhlWzEyXT10WzBdKnIrdFs0XSppK3RbOF0qcyt0WzEyXSxlWzEzXT10WzFdKnIrdFs1XSppK3RbOV0qcyt0WzEzXSxlWzE0XT10WzJdKnIrdFs2XSppK3RbMTBdKnMrdFsxNF0sZVsxNV09dFszXSpyK3RbN10qaSt0WzExXSpzK3RbMTVdKToobz10WzBdLHU9dFsxXSxhPXRbMl0sZj10WzNdLGw9dFs0XSxjPXRbNV0saD10WzZdLHA9dFs3XSxkPXRbOF0sdj10WzldLG09dFsxMF0sZz10WzExXSxlWzBdPW8sZVsxXT11LGVbMl09YSxlWzNdPWYsZVs0XT1sLGVbNV09YyxlWzZdPWgsZVs3XT1wLGVbOF09ZCxlWzldPXYsZVsxMF09bSxlWzExXT1nLGVbMTJdPW8qcitsKmkrZCpzK3RbMTJdLGVbMTNdPXUqcitjKmkrdipzK3RbMTNdLGVbMTRdPWEqcitoKmkrbSpzK3RbMTRdLGVbMTVdPWYqcitwKmkrZypzK3RbMTVdKSxlfSxoLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXSxzPW5bMl07cmV0dXJuIGVbMF09dFswXSpyLGVbMV09dFsxXSpyLGVbMl09dFsyXSpyLGVbM109dFszXSpyLGVbNF09dFs0XSppLGVbNV09dFs1XSppLGVbNl09dFs2XSppLGVbN109dFs3XSppLGVbOF09dFs4XSpzLGVbOV09dFs5XSpzLGVbMTBdPXRbMTBdKnMsZVsxMV09dFsxMV0qcyxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSxlfSxoLnJvdGF0ZT1mdW5jdGlvbihlLG4scixpKXt2YXIgcz1pWzBdLG89aVsxXSx1PWlbMl0sYT1NYXRoLnNxcnQocypzK28qbyt1KnUpLGYsbCxjLGgscCxkLHYsbSxnLHksYix3LEUsUyx4LFQsTixDLGssTCxBLE8sTSxfO3JldHVybiBNYXRoLmFicyhhKTx0P251bGw6KGE9MS9hLHMqPWEsbyo9YSx1Kj1hLGY9TWF0aC5zaW4ociksbD1NYXRoLmNvcyhyKSxjPTEtbCxoPW5bMF0scD1uWzFdLGQ9blsyXSx2PW5bM10sbT1uWzRdLGc9bls1XSx5PW5bNl0sYj1uWzddLHc9bls4XSxFPW5bOV0sUz1uWzEwXSx4PW5bMTFdLFQ9cypzKmMrbCxOPW8qcypjK3UqZixDPXUqcypjLW8qZixrPXMqbypjLXUqZixMPW8qbypjK2wsQT11Km8qYytzKmYsTz1zKnUqYytvKmYsTT1vKnUqYy1zKmYsXz11KnUqYytsLGVbMF09aCpUK20qTit3KkMsZVsxXT1wKlQrZypOK0UqQyxlWzJdPWQqVCt5Kk4rUypDLGVbM109dipUK2IqTit4KkMsZVs0XT1oKmsrbSpMK3cqQSxlWzVdPXAqaytnKkwrRSpBLGVbNl09ZCprK3kqTCtTKkEsZVs3XT12KmsrYipMK3gqQSxlWzhdPWgqTyttKk0rdypfLGVbOV09cCpPK2cqTStFKl8sZVsxMF09ZCpPK3kqTStTKl8sZVsxMV09dipPK2IqTSt4Kl8sbiE9PWUmJihlWzEyXT1uWzEyXSxlWzEzXT1uWzEzXSxlWzE0XT1uWzE0XSxlWzE1XT1uWzE1XSksZSl9LGgucm90YXRlWD1mdW5jdGlvbihlLHQsbil7dmFyIHI9TWF0aC5zaW4obiksaT1NYXRoLmNvcyhuKSxzPXRbNF0sbz10WzVdLHU9dFs2XSxhPXRbN10sZj10WzhdLGw9dFs5XSxjPXRbMTBdLGg9dFsxMV07cmV0dXJuIHQhPT1lJiYoZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzRdPXMqaStmKnIsZVs1XT1vKmkrbCpyLGVbNl09dSppK2MqcixlWzddPWEqaStoKnIsZVs4XT1mKmktcypyLGVbOV09bCppLW8qcixlWzEwXT1jKmktdSpyLGVbMTFdPWgqaS1hKnIsZX0saC5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1NYXRoLnNpbihuKSxpPU1hdGguY29zKG4pLHM9dFswXSxvPXRbMV0sdT10WzJdLGE9dFszXSxmPXRbOF0sbD10WzldLGM9dFsxMF0saD10WzExXTtyZXR1cm4gdCE9PWUmJihlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0pLGVbMF09cyppLWYqcixlWzFdPW8qaS1sKnIsZVsyXT11KmktYypyLGVbM109YSppLWgqcixlWzhdPXMqcitmKmksZVs5XT1vKnIrbCppLGVbMTBdPXUqcitjKmksZVsxMV09YSpyK2gqaSxlfSxoLnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPU1hdGguc2luKG4pLGk9TWF0aC5jb3Mobikscz10WzBdLG89dFsxXSx1PXRbMl0sYT10WzNdLGY9dFs0XSxsPXRbNV0sYz10WzZdLGg9dFs3XTtyZXR1cm4gdCE9PWUmJihlWzhdPXRbOF0sZVs5XT10WzldLGVbMTBdPXRbMTBdLGVbMTFdPXRbMTFdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzBdPXMqaStmKnIsZVsxXT1vKmkrbCpyLGVbMl09dSppK2MqcixlWzNdPWEqaStoKnIsZVs0XT1mKmktcypyLGVbNV09bCppLW8qcixlWzZdPWMqaS11KnIsZVs3XT1oKmktYSpyLGV9LGguZnJvbVJvdGF0aW9uVHJhbnNsYXRpb249ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1yK3IsYT1pK2ksZj1zK3MsbD1yKnUsYz1yKmEsaD1yKmYscD1pKmEsZD1pKmYsdj1zKmYsbT1vKnUsZz1vKmEseT1vKmY7cmV0dXJuIGVbMF09MS0ocCt2KSxlWzFdPWMreSxlWzJdPWgtZyxlWzNdPTAsZVs0XT1jLXksZVs1XT0xLShsK3YpLGVbNl09ZCttLGVbN109MCxlWzhdPWgrZyxlWzldPWQtbSxlWzEwXT0xLShsK3ApLGVbMTFdPTAsZVsxMl09blswXSxlWzEzXT1uWzFdLGVbMTRdPW5bMl0sZVsxNV09MSxlfSxoLmZyb21RdWF0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4rbix1PXIrcixhPWkraSxmPW4qbyxsPXIqbyxjPXIqdSxoPWkqbyxwPWkqdSxkPWkqYSx2PXMqbyxtPXMqdSxnPXMqYTtyZXR1cm4gZVswXT0xLWMtZCxlWzFdPWwrZyxlWzJdPWgtbSxlWzNdPTAsZVs0XT1sLWcsZVs1XT0xLWYtZCxlWzZdPXArdixlWzddPTAsZVs4XT1oK20sZVs5XT1wLXYsZVsxMF09MS1mLWMsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGguZnJ1c3R1bT1mdW5jdGlvbihlLHQsbixyLGkscyxvKXt2YXIgdT0xLyhuLXQpLGE9MS8oaS1yKSxmPTEvKHMtbyk7cmV0dXJuIGVbMF09cyoyKnUsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09cyoyKmEsZVs2XT0wLGVbN109MCxlWzhdPShuK3QpKnUsZVs5XT0oaStyKSphLGVbMTBdPShvK3MpKmYsZVsxMV09LTEsZVsxMl09MCxlWzEzXT0wLGVbMTRdPW8qcyoyKmYsZVsxNV09MCxlfSxoLnBlcnNwZWN0aXZlPWZ1bmN0aW9uKGUsdCxuLHIsaSl7dmFyIHM9MS9NYXRoLnRhbih0LzIpLG89MS8oci1pKTtyZXR1cm4gZVswXT1zL24sZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09cyxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09KGkrcikqbyxlWzExXT0tMSxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MippKnIqbyxlWzE1XT0wLGV9LGgub3J0aG89ZnVuY3Rpb24oZSx0LG4scixpLHMsbyl7dmFyIHU9MS8odC1uKSxhPTEvKHItaSksZj0xLyhzLW8pO3JldHVybiBlWzBdPS0yKnUsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09LTIqYSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MipmLGVbMTFdPTAsZVsxMl09KHQrbikqdSxlWzEzXT0oaStyKSphLGVbMTRdPShvK3MpKmYsZVsxNV09MSxlfSxoLmxvb2tBdD1mdW5jdGlvbihlLG4scixpKXt2YXIgcyxvLHUsYSxmLGwsYyxwLGQsdixtPW5bMF0sZz1uWzFdLHk9blsyXSxiPWlbMF0sdz1pWzFdLEU9aVsyXSxTPXJbMF0seD1yWzFdLFQ9clsyXTtyZXR1cm4gTWF0aC5hYnMobS1TKTx0JiZNYXRoLmFicyhnLXgpPHQmJk1hdGguYWJzKHktVCk8dD9oLmlkZW50aXR5KGUpOihjPW0tUyxwPWcteCxkPXktVCx2PTEvTWF0aC5zcXJ0KGMqYytwKnArZCpkKSxjKj12LHAqPXYsZCo9dixzPXcqZC1FKnAsbz1FKmMtYipkLHU9YipwLXcqYyx2PU1hdGguc3FydChzKnMrbypvK3UqdSksdj8odj0xL3Yscyo9dixvKj12LHUqPXYpOihzPTAsbz0wLHU9MCksYT1wKnUtZCpvLGY9ZCpzLWMqdSxsPWMqby1wKnMsdj1NYXRoLnNxcnQoYSphK2YqZitsKmwpLHY/KHY9MS92LGEqPXYsZio9dixsKj12KTooYT0wLGY9MCxsPTApLGVbMF09cyxlWzFdPWEsZVsyXT1jLGVbM109MCxlWzRdPW8sZVs1XT1mLGVbNl09cCxlWzddPTAsZVs4XT11LGVbOV09bCxlWzEwXT1kLGVbMTFdPTAsZVsxMl09LShzKm0rbypnK3UqeSksZVsxM109LShhKm0rZipnK2wqeSksZVsxNF09LShjKm0rcCpnK2QqeSksZVsxNV09MSxlKX0saC5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQ0KFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIsIFwiK2VbNl0rXCIsIFwiK2VbN10rXCIsIFwiK2VbOF0rXCIsIFwiK2VbOV0rXCIsIFwiK2VbMTBdK1wiLCBcIitlWzExXStcIiwgXCIrZVsxMl0rXCIsIFwiK2VbMTNdK1wiLCBcIitlWzE0XStcIiwgXCIrZVsxNV0rXCIpXCJ9LGguZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzddLDIpK01hdGgucG93KGVbOF0sMikrTWF0aC5wb3coZVs5XSwyKStNYXRoLnBvdyhlWzEwXSwyKStNYXRoLnBvdyhlWzExXSwyKStNYXRoLnBvdyhlWzEyXSwyKStNYXRoLnBvdyhlWzEzXSwyKStNYXRoLnBvdyhlWzE0XSwyKStNYXRoLnBvdyhlWzE1XSwyKSl9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQ0PWgpO3ZhciBwPXt9O3AuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNCk7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxwLnJvdGF0aW9uVG89ZnVuY3Rpb24oKXt2YXIgZT11LmNyZWF0ZSgpLHQ9dS5mcm9tVmFsdWVzKDEsMCwwKSxuPXUuZnJvbVZhbHVlcygwLDEsMCk7cmV0dXJuIGZ1bmN0aW9uKHIsaSxzKXt2YXIgbz11LmRvdChpLHMpO3JldHVybiBvPC0wLjk5OTk5OT8odS5jcm9zcyhlLHQsaSksdS5sZW5ndGgoZSk8MWUtNiYmdS5jcm9zcyhlLG4saSksdS5ub3JtYWxpemUoZSxlKSxwLnNldEF4aXNBbmdsZShyLGUsTWF0aC5QSSkscik6bz4uOTk5OTk5PyhyWzBdPTAsclsxXT0wLHJbMl09MCxyWzNdPTEscik6KHUuY3Jvc3MoZSxpLHMpLHJbMF09ZVswXSxyWzFdPWVbMV0sclsyXT1lWzJdLHJbM109MStvLHAubm9ybWFsaXplKHIscikpfX0oKSxwLnNldEF4ZXM9ZnVuY3Rpb24oKXt2YXIgZT1jLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpKXtyZXR1cm4gZVswXT1yWzBdLGVbM109clsxXSxlWzZdPXJbMl0sZVsxXT1pWzBdLGVbNF09aVsxXSxlWzddPWlbMl0sZVsyXT0tblswXSxlWzVdPS1uWzFdLGVbOF09LW5bMl0scC5ub3JtYWxpemUodCxwLmZyb21NYXQzKHQsZSkpfX0oKSxwLmNsb25lPWEuY2xvbmUscC5mcm9tVmFsdWVzPWEuZnJvbVZhbHVlcyxwLmNvcHk9YS5jb3B5LHAuc2V0PWEuc2V0LHAuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxwLnNldEF4aXNBbmdsZT1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9TWF0aC5zaW4obik7cmV0dXJuIGVbMF09cip0WzBdLGVbMV09cip0WzFdLGVbMl09cip0WzJdLGVbM109TWF0aC5jb3MobiksZX0scC5hZGQ9YS5hZGQscC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdLGY9blsyXSxsPW5bM107cmV0dXJuIGVbMF09cipsK28qdStpKmYtcyphLGVbMV09aSpsK28qYStzKnUtcipmLGVbMl09cypsK28qZityKmEtaSp1LGVbM109bypsLXIqdS1pKmEtcypmLGV9LHAubXVsPXAubXVsdGlwbHkscC5zY2FsZT1hLnNjYWxlLHAucm90YXRlWD1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK28qdSxlWzFdPWkqYStzKnUsZVsyXT1zKmEtaSp1LGVbM109byphLXIqdSxlfSxwLnJvdGF0ZVk9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYS1zKnUsZVsxXT1pKmErbyp1LGVbMl09cyphK3IqdSxlWzNdPW8qYS1pKnUsZX0scC5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmEraSp1LGVbMV09aSphLXIqdSxlWzJdPXMqYStvKnUsZVszXT1vKmEtcyp1LGV9LHAuY2FsY3VsYXRlVz1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXTtyZXR1cm4gZVswXT1uLGVbMV09cixlWzJdPWksZVszXT0tTWF0aC5zcXJ0KE1hdGguYWJzKDEtbipuLXIqci1pKmkpKSxlfSxwLmRvdD1hLmRvdCxwLmxlcnA9YS5sZXJwLHAuc2xlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdLHU9dFszXSxhPW5bMF0sZj1uWzFdLGw9blsyXSxjPW5bM10saCxwLGQsdixtO3JldHVybiBwPWkqYStzKmYrbypsK3UqYyxwPDAmJihwPS1wLGE9LWEsZj0tZixsPS1sLGM9LWMpLDEtcD4xZS02PyhoPU1hdGguYWNvcyhwKSxkPU1hdGguc2luKGgpLHY9TWF0aC5zaW4oKDEtcikqaCkvZCxtPU1hdGguc2luKHIqaCkvZCk6KHY9MS1yLG09ciksZVswXT12KmkrbSphLGVbMV09dipzK20qZixlWzJdPXYqbyttKmwsZVszXT12KnUrbSpjLGV9LHAuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qbityKnIraSppK3Mqcyx1PW8/MS9vOjA7cmV0dXJuIGVbMF09LW4qdSxlWzFdPS1yKnUsZVsyXT0taSp1LGVbM109cyp1LGV9LHAuY29uanVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGVbM109dFszXSxlfSxwLmxlbmd0aD1hLmxlbmd0aCxwLmxlbj1wLmxlbmd0aCxwLnNxdWFyZWRMZW5ndGg9YS5zcXVhcmVkTGVuZ3RoLHAuc3FyTGVuPXAuc3F1YXJlZExlbmd0aCxwLm5vcm1hbGl6ZT1hLm5vcm1hbGl6ZSxwLmZyb21NYXQzPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSt0WzRdK3RbOF0scjtpZihuPjApcj1NYXRoLnNxcnQobisxKSxlWzNdPS41KnIscj0uNS9yLGVbMF09KHRbN10tdFs1XSkqcixlWzFdPSh0WzJdLXRbNl0pKnIsZVsyXT0odFszXS10WzFdKSpyO2Vsc2V7dmFyIGk9MDt0WzRdPnRbMF0mJihpPTEpLHRbOF0+dFtpKjMraV0mJihpPTIpO3ZhciBzPShpKzEpJTMsbz0oaSsyKSUzO3I9TWF0aC5zcXJ0KHRbaSozK2ldLXRbcyozK3NdLXRbbyozK29dKzEpLGVbaV09LjUqcixyPS41L3IsZVszXT0odFtvKjMrc10tdFtzKjMrb10pKnIsZVtzXT0odFtzKjMraV0rdFtpKjMrc10pKnIsZVtvXT0odFtvKjMraV0rdFtpKjMrb10pKnJ9cmV0dXJuIGV9LHAuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwicXVhdChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUucXVhdD1wKX0odC5leHBvcnRzKX0pKHRoaXMpO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5hbmd1bGFyLm1vZHVsZSggJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmJ1c3lDb3ZlcicsIFtdIClcbiAgICAuZGlyZWN0aXZlKCAnYnVzeUNvdmVyJywgWyAnJHJvb3RTY29wZScsXG4gICAgICAgIGZ1bmN0aW9uICgkcm9vdFNjb3BlKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9idXN5Q292ZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRyb290U2NvcGUubG9hZGluZykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5idXN5TWVzc2FnZSA9ICdMb2FkaW5nLi4uJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggJHJvb3RTY29wZS5pbml0aWFsaXppbmcgKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5idXN5TWVzc2FnZSA9ICdJbml0aWFsaXppbmcuLi4nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCAkcm9vdFNjb3BlLmJ1c3kgKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNjb3BlLmJ1c3lNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmJ1c3lNZXNzYWdlID0gJ0p1c3QgYSBzZWNvbmQuLi4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKG5ld1ZhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdvZmYnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ29mZicpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCAnLi9jb21wb25lbnRXaXJlU2VnbWVudCcgKTtcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmNvbXBvbmVudFdpcmUnLCBbXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlLnNlZ21lbnQnXG4gICAgXVxuKVxuICAgIC5jb250cm9sbGVyKCAnQ29tcG9uZW50V2lyZUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcbiAgICAgICAgJHNjb3BlLmdldFNlZ21lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVuZFBvc2l0aW9ucyxcbiAgICAgICAgICAgICAgICB4MSwgeTEsIHgyLCB5MjtcblxuICAgICAgICAgICAgZW5kUG9zaXRpb25zID0gJHNjb3BlLndpcmUuZ2V0RW5kUG9zaXRpb25zKCk7XG5cbiAgICAgICAgICAgIHgxID0gZW5kUG9zaXRpb25zLngxO1xuICAgICAgICAgICAgeDIgPSBlbmRQb3NpdGlvbnMueDI7XG4gICAgICAgICAgICB5MSA9IGVuZFBvc2l0aW9ucy55MTtcbiAgICAgICAgICAgIHkyID0gZW5kUG9zaXRpb25zLnkyO1xuXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIGVuZFBvc2l0aW9uc1xuICAgICAgICAgICAgXTtcblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vblNlZ21lbnRDbGljayA9IGZ1bmN0aW9uICggd2lyZSwgc2VnbWVudCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCB3aXJlLCBzZWdtZW50ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNlZ21lbnRzID0gJHNjb3BlLmdldFNlZ21lbnRzKCk7XG5cbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKFxuICAgICAgICAnY29tcG9uZW50V2lyZScsXG5cbiAgICAgICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb21wb25lbnRXaXJlQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvY29tcG9uZW50V2lyZS5odG1sJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbik7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlLnNlZ21lbnQnLCBbXVxuKVxuXG4uZGlyZWN0aXZlKFxuICAgICdjb21wb25lbnRXaXJlU2VnbWVudCcsXG5cbiAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9jb21wb25lbnRXaXJlU2VnbWVudC5odG1sJyxcbiAgICAgICAgICAgIHRlbXBsYXRlTmFtZXNwYWNlOiAnU1ZHJ1xuICAgICAgICB9O1xuICAgIH1cbik7IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN5bWJvbE1hbmFnZXJQcm92aWRlcikge1xuXG4gICAgdmFyIGdlbmVyYXRlU3ltYm9scztcblxuICAgIGdlbmVyYXRlU3ltYm9scyA9IGZ1bmN0aW9uIChjb3VudCkge1xuXG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgcG9ydENvdW50LFxuICAgICAgICAgICAgbWFrZUFSYW5kb21TeW1ib2wsXG4gICAgICAgICAgICBtYWtlU29tZVBvcnRzLFxuICAgICAgICAgICAgbWluUG9ydHMgPSA2LFxuICAgICAgICAgICAgbWF4UG9ydHMgPSAzMCxcbiAgICAgICAgICAgIHBsYWNlbWVudHMgPSBbJ3RvcCcsICdyaWdodCcsICdib3R0b20nLCAnbGVmdCddO1xuXG4gICAgICAgIG1ha2VTb21lUG9ydHMgPSBmdW5jdGlvbiAoY291bnRPZlBvcnRzKSB7XG5cbiAgICAgICAgICAgIHZhciBzaWRlcyxcbiAgICAgICAgICAgICAgICBwb3J0LFxuICAgICAgICAgICAgICAgIHBsYWNlbWVudCxcbiAgICAgICAgICAgICAgICBqO1xuXG4gICAgICAgICAgICBzaWRlcyA9IHtcbiAgICAgICAgICAgICAgICB0b3A6IFtdLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiBbXSxcbiAgICAgICAgICAgICAgICBib3R0b206IFtdLFxuICAgICAgICAgICAgICAgIGxlZnQ6IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgY291bnRPZlBvcnRzOyBqKyspIHtcblxuICAgICAgICAgICAgICAgIHBvcnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAncF8nICsgaixcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQb3J0LScgKyBqXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9IHBsYWNlbWVudHMuZ2V0UmFuZG9tRWxlbWVudCgpO1xuXG4gICAgICAgICAgICAgICAgc2lkZXNbcGxhY2VtZW50XS5wdXNoKHBvcnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2lkZXM7XG5cbiAgICAgICAgfTtcblxuICAgICAgICBtYWtlQVJhbmRvbVN5bWJvbCA9IGZ1bmN0aW9uIChpZFBvc3RmaXgsIGNvdW50T2ZQb3J0cykge1xuXG4gICAgICAgICAgICB2YXIgcG9ydERlc2NyaXB0b3JzLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0b3I7XG5cbiAgICAgICAgICAgIHBvcnREZXNjcmlwdG9ycyA9IG1ha2VTb21lUG9ydHMoY291bnRPZlBvcnRzKTtcblxuICAgICAgICAgICAgZGVzY3JpcHRvciA9ICB7XG4gICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICdyYW5kb21fJyArIGlkUG9zdGZpeCxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ1JORF8nICsgY291bnRPZlBvcnRzICsgJ18nICsgaWRQb3N0Zml4ICsgJyAnXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIubWFrZUJveFN5bWJvbChcbiAgICAgICAgICAgICAgICAncmFuZG9tXycgKyBpZFBvc3RmaXgsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRvcixcbiAgICAgICAgICAgICAgICBwb3J0RGVzY3JpcHRvcnMsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5UG9ydHM6IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG5cbiAgICAgICAgICAgIHBvcnRDb3VudCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG1heFBvcnRzKSxcbiAgICAgICAgICAgICAgICBtaW5Qb3J0c1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgbWFrZUFSYW5kb21TeW1ib2woaSwgcG9ydENvdW50KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG5cblxuICAgIHRoaXMuZ2VuZXJhdGVTeW1ib2xzID0gZ2VuZXJhdGVTeW1ib2xzO1xuXG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5hbmd1bGFyLm1vZHVsZSggJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRlc2lnbkVkaXRvcicsIFtdIClcbiAgICAuY29udHJvbGxlciggJ0Rlc2lnbkVkaXRvckNvbnRyb2xsZXInLCBmdW5jdGlvbihcbiAgICAgICAgJHNjb3BlLCAkcm9vdFNjb3BlLCBkaWFncmFtU2VydmljZSwgJGxvZywgZGVzaWduU2VydmljZSwgJHN0YXRlUGFyYW1zLCBkZXNpZ25MYXlvdXRTZXJ2aWNlLCBzeW1ib2xNYW5hZ2VyKSB7XG5cbiAgICAgICAgdmFyIFJhbmRvbVN5bWJvbEdlbmVyYXRvcixcbiAgICAgICAgICAgIHJhbmRvbVN5bWJvbEdlbmVyYXRvcixcblxuICAgICAgICAgICAgZGVzaWduQ3R4O1xuXG4gICAgICAgICRzY29wZS5kaWFncmFtID0gbnVsbDtcblxuICAgICAgICBkZXNpZ25DdHggPSB7XG4gICAgICAgICAgICBkYjogJHJvb3RTY29wZS5tYWluRGJDb25uZWN0aW9uSWQsXG4gICAgICAgICAgICByZWdpb25JZDogJ0Rlc2lnbl8nICsgKCBuZXcgRGF0ZSgpICkudG9JU09TdHJpbmcoKVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5kaWFncmFtQ29udGFpbmVyQ29uZmlnID0ge1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5jb250YWluZXJJZCA9PT0gJ2R1bW15Jykge1xuXG4gICAgICAgICAgICBSYW5kb21TeW1ib2xHZW5lcmF0b3IgPSByZXF1aXJlKCcuL2NsYXNzZXMvUmFuZG9tU3ltYm9sR2VuZXJhdG9yJyk7XG4gICAgICAgICAgICByYW5kb21TeW1ib2xHZW5lcmF0b3IgPSBuZXcgUmFuZG9tU3ltYm9sR2VuZXJhdG9yKHN5bWJvbE1hbmFnZXIpO1xuXG4gICAgICAgICAgICByYW5kb21TeW1ib2xHZW5lcmF0b3IuZ2VuZXJhdGVTeW1ib2xzKDcpO1xuXG5cbiAgICAgICAgICAgICRzY29wZS5kaWFncmFtID0gZGlhZ3JhbVNlcnZpY2UuYWRkRHVtbXlEaWFncmFtKCdkdW1teScsIDEwMCwgNTAsIDMwMDAsIDMwMDApO1xuXG4gICAgICAgICAgICAkbG9nLmRlYnVnKCdEcmF3aW5nIGR1bW15IGRpYWdyYW06JywgJHNjb3BlLmRpYWdyYW0pO1xuICAgICAgICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gZmFsc2U7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgZGVzaWduTGF5b3V0U2VydmljZS53YXRjaERpYWdyYW1FbGVtZW50cyhkZXNpZ25DdHgsICRyb290U2NvcGUuYWN0aXZlRGVzaWduLmlkLCBmdW5jdGlvbiAoLypkZXNpZ25TdHJ1Y3R1cmVVcGRhdGVPYmplY3QqLykge1xuXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChjeVBoeUxheW91dCkge1xuXG4gICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnRGlhZ3JhbSBlbGVtZW50cycsIGN5UGh5TGF5b3V0KTtcblxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuYWN0aXZlQ29udGFpbmVySWQgPSAkc3RhdGVQYXJhbXMuY29udGFpbmVySWQgfHwgJHJvb3RTY29wZS5hY3RpdmVEZXNpZ24uaWQ7XG5cbiAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCRyb290U2NvcGUuYWN0aXZlQ29udGFpbmVySWQpO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0gPVxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtU2VydmljZS5jcmVhdGVEaWFncmFtRnJvbUN5UGh5RWxlbWVudHMoJHJvb3RTY29wZS5hY3RpdmVDb250YWluZXJJZCwgY3lQaHlMYXlvdXQuZWxlbWVudHMpO1xuXG4gICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnRHJhd2luZyBkaWFncmFtOicsICRzY29wZS5kaWFncmFtKTtcblxuICAgICAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfSlcbiAgICAuZGlyZWN0aXZlKCAnZGVzaWduRWRpdG9yJywgW1xuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduRWRpdG9yQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgJHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2Rlc2lnbkVkaXRvci5odG1sJ1xuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSApO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsICRsb2cpIHtcblxuICAgIHZhciBqc3AsXG4gICAgICAgIGpzcFJlaW5pdCxcbiAgICAgICAganNwUGFuZSxcblxuICAgICAgICBzY3JvbGxQb3NpdGlvblgsXG4gICAgICAgIHNjcm9sbFBvc2l0aW9uWSxcblxuICAgICAgICB1cGRhdGVWaXNpYmxlQXJlYSxcbiAgICAgICAgdXBkYXRlUHJvbWlzZSxcblxuICAgICAgICBvbldpbmRvd1Jlc2l6ZTtcblxuXG4gICAgdXBkYXRlVmlzaWJsZUFyZWEgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGxlZnQsXG4gICAgICAgICAgICB0b3AsXG4gICAgICAgICAgICBfdXBkYXRlVmlzaWJsZUFyZWE7XG5cbiAgICAgICAgX3VwZGF0ZVZpc2libGVBcmVhID0gZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgJHNjb3BlLnZpc2libGVBcmVhID0ge1xuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQgfHwgMCxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCB8fCAwLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiBsZWZ0ICsgJHNjb3BlLiRjb250ZW50UGFuZS53aWR0aCgpLFxuICAgICAgICAgICAgICAgIGJvdHRvbTogdG9wICsgJHNjb3BlLiRjb250ZW50UGFuZS5oZWlnaHQoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChqc3BQYW5lKSB7XG5cbiAgICAgICAgICAgIGxlZnQgPSBzY3JvbGxQb3NpdGlvblggfHwgMDtcbiAgICAgICAgICAgIHRvcCA9IHNjcm9sbFBvc2l0aW9uWSB8fCAwO1xuXG4gICAgICAgICAgICBpZiAodXBkYXRlUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbCh1cGRhdGVQcm9taXNlKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9ICR0aW1lb3V0KF91cGRhdGVWaXNpYmxlQXJlYSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBqc3BSZWluaXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoanNwKSkge1xuXG4gICAgICAgICAgICAkbG9nLmRlYnVnKCdSZWluaXRpYWxpemluZyBKU1AuJyk7XG4gICAgICAgICAgICBqc3AucmVpbml0aWFsaXNlKCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgICRzY29wZS4kb24oJ0RpYWdyYW1Db250YWluZXJJbml0aWFsaXplZCcsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAkc2NvcGUuJGNvbnRlbnRQYW5lXG5cbiAgICAgICAgICAgIC5iaW5kKCdqc3AtaW5pdGlhbGlzZWQnLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGpzcFBhbmUgPSAkc2NvcGUuJGNvbnRlbnRQYW5lLmZpbmQoJy5qc3BQYW5lJyk7XG4gICAgICAgICAgICAgICAgdXBkYXRlVmlzaWJsZUFyZWEoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgICAgICAgLmJpbmQoJ2pzcC1zY3JvbGwteScsIGZ1bmN0aW9uIChldmVudCwgYVNjcm9sbFBvc2l0aW9uWSkge1xuXG4gICAgICAgICAgICAgICAgc2Nyb2xsUG9zaXRpb25ZID0gYVNjcm9sbFBvc2l0aW9uWTtcblxuICAgICAgICAgICAgICAgIHVwZGF0ZVZpc2libGVBcmVhKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICAgICAgIC5iaW5kKCdqc3Atc2Nyb2xsLXgnLCBmdW5jdGlvbiAoZXZlbnQsIGFTY3JvbGxQb3NpdGlvblgpIHtcblxuICAgICAgICAgICAgICAgIHNjcm9sbFBvc2l0aW9uWCA9IGFTY3JvbGxQb3NpdGlvblg7XG5cbiAgICAgICAgICAgICAgICB1cGRhdGVWaXNpYmxlQXJlYSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICApXG4vLyAgICAgICAgICAgIC5iaW5kKFxuLy8gICAgICAgICAgICAnanNwLWFycm93LWNoYW5nZScsXG4vLyAgICAgICAgICAgIGZ1bmN0aW9uIChldmVudCwgaXNBdFRvcCwgaXNBdEJvdHRvbSwgaXNBdExlZnQsIGlzQXRSaWdodCkge1xuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0hhbmRsZSBqc3AtYXJyb3ctY2hhbmdlJywgdGhpcyxcbi8vICAgICAgICAgICAgICAgICAgICAnaXNBdFRvcD0nLCBpc0F0VG9wLFxuLy8gICAgICAgICAgICAgICAgICAgICdpc0F0Qm90dG9tPScsIGlzQXRCb3R0b20sXG4vLyAgICAgICAgICAgICAgICAgICAgJ2lzQXRMZWZ0PScsIGlzQXRMZWZ0LFxuLy8gICAgICAgICAgICAgICAgICAgICdpc0F0UmlnaHQ9JywgaXNBdFJpZ2h0KTtcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgIClcbiAgICAgICAgICAgIC5qU2Nyb2xsUGFuZShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbERyYWdNaW5IZWlnaHQ6IDYwLFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsRHJhZ01heEhlaWdodDogNjAsXG4gICAgICAgICAgICAgICAgaG9yaXpvbnRhbERyYWdNaW5XaWR0aDogNjAsXG4gICAgICAgICAgICAgICAgaG9yaXpvbnRhbERyYWdNYXhXaWR0aDogNjAsXG4gICAgICAgICAgICAgICAgYW5pbWF0ZVNjcm9sbDogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGpzcCA9ICRzY29wZS4kY29udGVudFBhbmUuZGF0YSgnanNwJyk7XG5cbiAgICAgICAganNwUmVpbml0KCk7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUuJG9uKCdEaWFncmFtSW5pdGlhbGl6ZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGpzcFJlaW5pdCgpO1xuICAgIH0pO1xuXG5cbiAgICBvbldpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBqc3BSZWluaXQoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5vbldpbmRvd1Jlc2l6ZSA9IG9uV2luZG93UmVzaXplO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbn07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgJCovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbnJlcXVpcmUoJy4uL2RyYXdpbmdHcmlkL2RyYXdpbmdHcmlkLmpzJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kaWFncmFtQ29udGFpbmVyJywgW1xuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZHJhd2luZ0dyaWQnLFxuICAgICAgICAncGFuem9vbScsXG4gICAgICAgICdwYW56b29td2lkZ2V0JyxcbiAgICAgICAgJ2lzaXMudWkuY29udGV4dG1lbnUnXG4gICAgXSlcbiAgICAuY29udHJvbGxlcignRGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXInLCBbXG4gICAgICAgICckc2NvcGUnLFxuICAgICAgICAnJHRpbWVvdXQnLFxuICAgICAgICAnJGxvZycsXG4gICAgICAgICdQYW5ab29tU2VydmljZScsXG4gICAgICAgICckd2luZG93JyxcbiAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsICRsb2csIFBhblpvb21TZXJ2aWNlLCAkd2luZG93KSB7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcblxuICAgICAgICAgICAgICAgICR3aW5kb3dFbGVtZW50LFxuXG4gICAgICAgICAgICAgICAgY29tcGlsZWREaXJlY3RpdmVzLFxuXG4gICAgICAgICAgICAgICAgU2Nyb2xsSGFuZGxlcixcbiAgICAgICAgICAgICAgICBzY3JvbGxIYW5kbGVyO1xuXG4gICAgICAgICAgICBjb21waWxlZERpcmVjdGl2ZXMgPSB7fTtcblxuICAgICAgICAgICAgU2Nyb2xsSGFuZGxlciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9TY3JvbGxIYW5kbGVyJyk7XG4gICAgICAgICAgICBzY3JvbGxIYW5kbGVyID0gbmV3IFNjcm9sbEhhbmRsZXIoJHNjb3BlLCAkdGltZW91dCwgJGxvZyk7XG5cblxuICAgICAgICAgICAgJHNjb3BlLnBhbnpvb21JZCA9ICdwYW56b29tSWQnOyAvL3Njb3BlLmlkICsgJy1wYW56b29tZWQnO1xuXG4gICAgICAgICAgICAkc2NvcGUuem9vbUxldmVsID0gNDtcblxuICAgICAgICAgICAgJHNjb3BlLnBhbnpvb21Nb2RlbCA9IHt9OyAvLyBhbHdheXMgcGFzcyBlbXB0eSBvYmplY3RcblxuICAgICAgICAgICAgJHNjb3BlLnBhbnpvb21Db25maWcgPSB7XG4gICAgICAgICAgICAgICAgem9vbUxldmVsczogMTAsXG4gICAgICAgICAgICAgICAgbmV1dHJhbFpvb21MZXZlbDogJHNjb3BlLnpvb21MZXZlbCxcbiAgICAgICAgICAgICAgICBzY2FsZVBlclpvb21MZXZlbDogMS4yNSxcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogNTAsXG4gICAgICAgICAgICAgICAgaGFsdFNwZWVkOiA1MCxcblxuICAgICAgICAgICAgICAgIG1vZGVsQ2hhbmdlZENhbGxiYWNrOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIFBhblpvb21TZXJ2aWNlLmdldEFQSSgkc2NvcGUucGFuem9vbUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFwaSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvcExlZnRDb3JuZXIsIGJvdHRvbVJpZ2h0Q29ybmVyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnpvb21MZXZlbCA9IHZhbC56b29tTGV2ZWw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BMZWZ0Q29ybmVyID0gYXBpLmdldE1vZGVsUG9zaXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3R0b21SaWdodENvcm5lciA9IGFwaS5nZXRNb2RlbFBvc2l0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogJHNjb3BlLmNhbnZhc1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAkc2NvcGUuY2FudmFzSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUudmlzaWJsZUFyZWEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogdG9wTGVmdENvcm5lci55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0b3BMZWZ0Q29ybmVyLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBib3R0b21SaWdodENvcm5lci54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3R0b206IGJvdHRvbVJpZ2h0Q29ybmVyLnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICR3aW5kb3dFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpO1xuXG4gICAgICAgICAgICAkd2luZG93RWxlbWVudC5iaW5kKFxuICAgICAgICAgICAgICAgICdyZXNpemUnLCBzY3JvbGxIYW5kbGVyLm9uV2luZG93UmVzaXplXG4gICAgICAgICAgICApO1xuXG5cbiAgICAgICAgICAgICRzY29wZS5nZXRDc3NDbGFzcyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBjbGFzc1N0cmluZztcblxuICAgICAgICAgICAgICAgIGNsYXNzU3RyaW5nID0gJ2RpYWdyYW0tY29udGFpbmVyJztcblxuICAgICAgICAgICAgICAgIGNsYXNzU3RyaW5nICs9ICcgem9vbS1sZXZlbC0nICsgJHNjb3BlLnpvb21MZXZlbDtcblxuICAgICAgICAgICAgICAgIGNsYXNzU3RyaW5nICs9IHNlbGYuaXNFZGl0YWJsZSgpID8gJyBlZGl0YWJsZScgOiAncmVhZG9ubHknO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXNzU3RyaW5nO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRWaXNpYmxlQXJlYSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnZpc2libGVBcmVhO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRJZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWFncmFtSWQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdCgkc2NvcGUuZGlhZ3JhbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbUlkID0gJHNjb3BlLmRpYWdyYW0uaWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpYWdyYW1JZDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RGlhZ3JhbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldFpvb21MZXZlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnpvb21MZXZlbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0Q29tcGlsZWREaXJlY3RpdmUgPSBmdW5jdGlvbiAoZGlyZWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkRGlyZWN0aXZlc1tkaXJlY3RpdmVdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5zZXRDb21waWxlZERpcmVjdGl2ZSA9IGZ1bmN0aW9uIChkaXJlY3RpdmUsIGNvbXBpbGVkRGlyZWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgY29tcGlsZWREaXJlY3RpdmVzW2RpcmVjdGl2ZV0gPSBjb21waWxlZERpcmVjdGl2ZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuaXNFZGl0YWJsZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KCRzY29wZS5kaWFncmFtKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLmNvbmZpZyA9ICRzY29wZS5kaWFncmFtLmNvbmZpZyB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW0uY29uZmlnLmVkaXRhYmxlID09PSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmlzQ29tcG9uZW50U2VsZWN0ZWQgPSBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdCgkc2NvcGUuZGlhZ3JhbSkpIHtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZihjb21wb25lbnQuaWQpID4gLTE7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0Q29uZmlnID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuY29uZmlnO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5zZXRJbml0aWFsaXplZCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5pbml0aWFsaXplZCA9IHZhbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfVxuICAgIF0pXG4gICAgLmRpcmVjdGl2ZSgnZGlhZ3JhbUNvbnRhaW5lcicsIFtcbiAgICAgICAgJ2RpYWdyYW1TZXJ2aWNlJywgJyRsb2cnLCAnJHRpbWVvdXQnLCAnUGFuWm9vbVNlcnZpY2UnLFxuICAgICAgICBmdW5jdGlvbiAoZGlhZ3JhbVNlcnZpY2UsICRsb2csICR0aW1lb3V0KSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0RpYWdyYW1Db250YWluZXJDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBkaWFncmFtOiAnPScsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogJz0nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2RpYWdyYW1Db250YWluZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnSW4gZGlhZ3JhbSBjb250YWluZXInLCBzY29wZS52aXNpYmxlQXJlYSk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY29uZmlnID0gc2NvcGUuY29uZmlnIHx8IHt9O1xuXG4vLyAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FudmFzV2lkdGggPSAkKGVsZW1lbnQpXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIC5vdXRlcldpZHRoKCk7XG4vLyAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FudmFzSGVpZ2h0ID0gJChlbGVtZW50KVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAub3V0ZXJIZWlnaHQoKTtcbi8vXG4vL1xuLy8gICAgICAgICAgICAgICAgICAgIHNjb3BlLnZpc2libGVBcmVhID0ge1xuLy8gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IDAsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBzY29wZS5jYW52YXNXaWR0aCxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiBzY29wZS5jYW52YXNIZWlnaHRcbi8vICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGNvbnRlbnRQYW5lID0gZWxlbWVudC5maW5kKCc+LmRpYWdyYW0tY29udGVudC1wYW5lJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYnJvYWRjYXN0KCdEaWFncmFtQ29udGFpbmVySW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG5cbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCAkKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxuYW5ndWxhci5tb2R1bGUoICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kcmF3aW5nR3JpZCcsIFtdIClcbiAgICAuZGlyZWN0aXZlKCAnZHJhd2luZ0dyaWQnLCBbICckbG9nJyxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZHJhd2luZ0dyaWQuaHRtbCcsXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyICRlbGVtZW50O1xuXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50ID0gJChlbGVtZW50KTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2goJ2RpYWdyYW0uY29uZmlnLndpZHRoJywgZnVuY3Rpb24obmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50Lm91dGVyV2lkdGgobmV3VmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdkaWFncmFtLmNvbmZpZy5oZWlnaHQnLCBmdW5jdGlvbihuZXdWYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50Lm91dGVySGVpZ2h0KG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGZhYnJpYyovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbmFuZ3VsYXIubW9kdWxlKCAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZmFicmljQ2FudmFzJywgW10gKVxuICAgIC5jb250cm9sbGVyKCAnRmFicmljQ2FudmFzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgpIHtcblxuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoICdmYWJyaWNDYW52YXMnLCBbXG4gICAgICAgICckbG9nJyxcbiAgICAgICAgJ2RpYWdyYW1TZXJ2aWNlJyxcbiAgICAgICAgZnVuY3Rpb24gKCAkbG9nLCBkaWFncmFtU2VydmljZSApIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRmFicmljQ2FudmFzQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgcmVxdWlyZTogJ15kaWFncmFtQ29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9mYWJyaWNDYW52YXMuaHRtbCcsXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKCBzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcywgZGlhZ3JhbUNvbnRhaW5lckN0cmwgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckRpYWdyYW07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuaWQgPSBkaWFncmFtQ29udGFpbmVyQ3RybC5nZXRJZCgpICsgJ2ZhYnJpYy1jYW52YXMnO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKCBzY29wZS5pZCApO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5zZXRCYWNrZ3JvdW5kQ29sb3IoICdyZ2JhKDI1NSwgNzMsIDY0LCAwLjYpJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckRpYWdyYW0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggc2NvcGUuZGlhZ3JhbURhdGEgKSApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0FycmF5KCBzY29wZS5kaWFncmFtRGF0YS5zeW1ib2xzICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBzY29wZS5kaWFncmFtRGF0YS5zeW1ib2xzLCBmdW5jdGlvbiAoIHN5bWJvbCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbVNlcnZpY2UuZ2V0U1ZHRm9yU3ltYm9sVHlwZSggc3ltYm9sLnR5cGUgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG9iamVjdCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3ZnT2JqZWN0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Z09iamVjdCA9IG9iamVjdC5zZXQoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN5bWJvbC54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBzeW1ib2wueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ2xlOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgIGNhbnZhcy5hZGQoc3ZnT2JqZWN0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVjdCA9IG5ldyBmYWJyaWMuUmVjdCgge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiA1MCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6ICdncmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmdsZTogMjAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAxMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLmFkZCggcmVjdCApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ2UnLCBzdmdPYmplY3QpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVuZGVyQWxsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2goIGRpYWdyYW1Db250YWluZXJDdHJsLmdldERpYWdyYW1EYXRhLCBmdW5jdGlvbiAoIHZhbHVlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZyggJ0RpYWdyYW1EYXRhIGlzICcsIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaWFncmFtRGF0YSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyRGlhZ3JhbSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnBvcnQnLCBbXVxuKVxuICAgIC5jb250cm9sbGVyKCAnUG9ydENvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcbiAgICAgICAgJHNjb3BlLmdldFBvcnRUcmFuc2Zvcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtU3RyaW5nO1xuXG4gICAgICAgICAgICB0cmFuc2Zvcm1TdHJpbmcgPSAndHJhbnNsYXRlKCcgKyAkc2NvcGUucG9ydEluc3RhbmNlLnBvcnRTeW1ib2wueCArICcsJyArICRzY29wZS5wb3J0SW5zdGFuY2UucG9ydFN5bWJvbFxuICAgICAgICAgICAgICAgIC55ICsgJyknO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtU3RyaW5nO1xuICAgICAgICB9O1xuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoXG4gICAgICAgICdwb3J0JyxcblxuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQb3J0Q29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvcG9ydC5odG1sJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRycsXG4gICAgICAgICAgICAgICAgcmVxdWlyZTogWyAnXnN2Z0RpYWdyYW0nLCAnXmRpYWdyYW1Db250YWluZXInIF0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKCBzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcywgY29udHJvbGxlcnMgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHN2Z0RpYWdyYW1Db250cm9sbGVyO1xuXG4gICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyID0gY29udHJvbGxlcnNbIDAgXTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS5vblBvcnRDbGljayA9IGZ1bmN0aW9uICggcG9ydCwgJGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIub25Qb3J0Q2xpY2soIHNjb3BlLmNvbXBvbmVudCwgcG9ydCwgJGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25Qb3J0TW91c2VEb3duID0gZnVuY3Rpb24gKCBwb3J0LCAkZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5vblBvcnRNb3VzZURvd24oIHNjb3BlLmNvbXBvbmVudCwgcG9ydCwgJGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25Qb3J0TW91c2VVcCA9IGZ1bmN0aW9uICggcG9ydCwgJGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIub25Qb3J0TW91c2VVcCggc2NvcGUuY29tcG9uZW50LCBwb3J0LCAkZXZlbnQgKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbik7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVzaXplVG9IZWlnaHRNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbW1zLnJlc2l6ZVRvSGVpZ2h0JywgW10pO1xuXG5cbnJlc2l6ZVRvSGVpZ2h0TW9kdWxlLmRpcmVjdGl2ZSgncmVzaXplVG9IZWlnaHQnLCBmdW5jdGlvbiAoJHdpbmRvdykge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgaGVpZ2h0SXNMZXNzV2l0aDogJz0/J1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcblxuICAgICAgICAgICAgdmFyIHdpbmRvdyA9IGFuZ3VsYXIuZWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvd1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0ID0gcGFyc2VJbnQoYXR0cmlidXRlcy5taW5kSGVpZ2h0LCAxMCkgfHwgMCxcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQgPSBwYXJzZUludChhdHRyaWJ1dGVzLm1heEhlaWdodCwgMTApIHx8IEluZmluaXR5LFxuICAgICAgICAgICAgICAgIGhlaWdodElzTGVzc1dpdGggPSBwYXJzZUludChzY29wZS5oZWlnaHRJc0xlc3NXaXRoLCAxMCkgfHwgMDtcblxuICAgICAgICAgICAgc2NvcGUuZ2V0V2luZG93SGVpZ2h0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIG1heCwgbWluLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICBoZWlnaHQgPSAoJHdpbmRvdy5pbm5lckhlaWdodCA+IDApID8gJHdpbmRvdy5pbm5lckhlaWdodCA6IHNjcmVlbi5oZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICBtYXggPSBtYXhIZWlnaHQ7XG4gICAgICAgICAgICAgICAgbWluID0gbWluSGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKGhlaWdodCAtIGhlaWdodElzTGVzc1dpdGgsIG1heCksIG1pbik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goc2NvcGUuZ2V0V2luZG93SGVpZ2h0LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm91dGVySGVpZ2h0KG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgd2luZG93LmJpbmQoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc2l6ZVRvSGVpZ2h0TW9kdWxlOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHJlc2l6ZVRvV2luZG93TW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ21tcy5yZXNpemVUb1dpbmRvdycsIFtdKTtcblxuXG5yZXNpemVUb1dpbmRvd01vZHVsZS5kaXJlY3RpdmUoJ3Jlc2l6ZVRvV2luZG93JywgZnVuY3Rpb24gKCR3aW5kb3cpIHtcblxuICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG5cbiAgICB2YXIgd2luZG93ID0gYW5ndWxhci5lbGVtZW50KFxuICAgICAgICAkd2luZG93XG4gICAgICApLFxuICAgICAgbWluV2lkdGggPSBwYXJzZUludChhdHRyaWJ1dGVzLm1pbldpZHRoLCAxMCkgfHwgMCxcbiAgICAgIG1pbkhlaWdodCA9IHBhcnNlSW50KGF0dHJpYnV0ZXMubWluZEhlaWdodCwgMTApIHx8IDAsXG4gICAgICBtYXhXaWR0aCA9IHBhcnNlSW50KGF0dHJpYnV0ZXMubWF4V2lkdGgsIDEwKSB8fCBJbmZpbml0eSxcbiAgICAgIG1heEhlaWdodCA9IHBhcnNlSW50KGF0dHJpYnV0ZXMubWF4SGVpZ2h0LCAxMCkgfHwgSW5maW5pdHksXG4gICAgICB3aWR0aElzTGVzc1dpdGggPSBwYXJzZUludChhdHRyaWJ1dGVzLndpZHRoSXNMZXNzV2l0aCwgMTApIHx8IDAsXG4gICAgICBoZWlnaHRJc0xlc3NXaXRoID0gcGFyc2VJbnQoYXR0cmlidXRlcy5oZWlnaHRJc0xlc3NXaXRoLCAxMCkgfHwgMCxcblxuICAgICAgcmV2ZXJzZUluUG9ydHJhaXQgPSB0cnVlO1xuXG4gICAgc2NvcGUuZ2V0V2luZG93SGVpZ2h0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgbWF4LCBtaW4sXG4gICAgICAgIGhlaWdodCwgd2lkdGg7XG5cbiAgICAgIGhlaWdodCA9ICgkd2luZG93LmlubmVySGVpZ2h0ID4gMCkgPyAkd2luZG93LmlubmVySGVpZ2h0IDogc2NyZWVuLmhlaWdodDtcbiAgICAgIHdpZHRoID0gKCR3aW5kb3cuaW5uZXJXaWR0aCA+IDApID8gJHdpbmRvdy5pbm5lcldpZHRoIDogc2NyZWVuLndpZHRoO1xuXG4gICAgICBpZiAocmV2ZXJzZUluUG9ydHJhaXQgJiYgaGVpZ2h0PndpZHRoKSB7XG4gICAgICAgIG1heCA9IG1heFdpZHRoO1xuICAgICAgICBtaW4gPSBtaW5XaWR0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heCA9IG1heEhlaWdodDtcbiAgICAgICAgbWluID0gbWluSGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gTWF0aC5tYXgoTWF0aC5taW4oaGVpZ2h0LWhlaWdodElzTGVzc1dpdGgsIG1heCksIG1pbik7XG4gICAgfTtcblxuICAgIHNjb3BlLmdldFdpbmRvd1dpZHRoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgbWF4LCBtaW4sXG4gICAgICAgIGhlaWdodCwgd2lkdGg7XG5cbiAgICAgIGhlaWdodCA9ICgkd2luZG93LmlubmVySGVpZ2h0ID4gMCkgPyAkd2luZG93LmlubmVySGVpZ2h0IDogc2NyZWVuLmhlaWdodDtcbiAgICAgIHdpZHRoID0gKCR3aW5kb3cuaW5uZXJXaWR0aCA+IDApID8gJHdpbmRvdy5pbm5lcldpZHRoIDogc2NyZWVuLndpZHRoO1xuXG4gICAgICBpZiAocmV2ZXJzZUluUG9ydHJhaXQgJiYgaGVpZ2h0PndpZHRoKSB7XG4gICAgICAgIG1heCA9IG1heEhlaWdodDtcbiAgICAgICAgbWluID0gbWluSGVpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF4ID0gbWF4V2lkdGg7XG4gICAgICAgIG1pbiA9IG1pbldpZHRoO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gTWF0aC5tYXgoTWF0aC5taW4od2lkdGgtd2lkdGhJc0xlc3NXaXRoLCBtYXgpLCBtaW4pO1xuICAgIH07XG5cbiAgICBzY29wZS4kd2F0Y2goc2NvcGUuZ2V0V2luZG93V2lkdGgsXG4gICAgICBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgZWxlbWVudC5vdXRlcldpZHRoKG5ld1ZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgc2NvcGUuJHdhdGNoKHNjb3BlLmdldFdpbmRvd0hlaWdodCxcbiAgICAgIGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICBlbGVtZW50Lm91dGVySGVpZ2h0KG5ld1ZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgd2luZG93LmJpbmQoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgIH0pO1xuXG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXNpemVUb1dpbmRvd01vZHVsZTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkc2NvcGUsIGRpYWdyYW1TZXJ2aWNlLCB3aXJpbmdTZXJ2aWNlLCBvcGVyYXRpb25zTWFuYWdlciwgJGxvZykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBnZXRPZmZzZXRUb01vdXNlLFxuICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IsXG4gICAgICAgIGRyYWdUYXJnZXRzRGVzY3JpcHRvcixcblxuICAgICAgICBvbkRpYWdyYW1Nb3VzZVVwLFxuICAgICAgICBvbkRpYWdyYW1Nb3VzZU1vdmUsXG4gICAgICAgIG9uRGlhZ3JhbU1vdXNlTGVhdmUsXG4gICAgICAgIG9uV2luZG93Qmx1cixcbiAgICAgICAgb25Db21wb25lbnRNb3VzZVVwLFxuICAgICAgICBvbkNvbXBvbmVudE1vdXNlRG93bixcblxuICAgICAgICBzdGFydERyYWcsXG4gICAgICAgIGZpbmlzaERyYWcsXG4gICAgICAgIGNhbmNlbERyYWc7XG5cblxuICAgIGdldE9mZnNldFRvTW91c2UgPSBmdW5jdGlvbiAoICRldmVudCApIHtcblxuICAgICAgICB2YXIgb2Zmc2V0O1xuXG4gICAgICAgIG9mZnNldCA9IHtcbiAgICAgICAgICAgIHg6ICRldmVudC5wYWdlWCAtICRzY29wZS5lbGVtZW50T2Zmc2V0LmxlZnQsXG4gICAgICAgICAgICB5OiAkZXZlbnQucGFnZVkgLSAkc2NvcGUuZWxlbWVudE9mZnNldC50b3BcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuXG4gICAgfTtcblxuXG4gICAgc3RhcnREcmFnID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHNlbGYuZHJhZ2dpbmcgPSB0cnVlO1xuXG4gICAgICAgIC8vc2VsZi5kcmFnT3BlcmF0aW9uID0gb3BlcmF0aW9uc01hbmFnZXIuaW5pdE5ldygnc2V0Q29tcG9uZW50UG9zaXRpb24nKTtcblxuICAgICAgICBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3I7XG4gICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvciA9IG51bGw7XG5cbiAgICAgICAgJGxvZy5kZWJ1ZyggJ0RyYWdnaW5nJywgZHJhZ1RhcmdldHNEZXNjcmlwdG9yICk7XG5cbiAgICB9O1xuXG4gICAgY2FuY2VsRHJhZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKCBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgKSB7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZHJhZ1RhcmdldHNEZXNjcmlwdG9yLnRhcmdldHMsIGZ1bmN0aW9uICggdGFyZ2V0ICkge1xuXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmNvbXBvbmVudC5zZXRQb3NpdGlvbihcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Lm9yaWdpbmFsUG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Lm9yaWdpbmFsUG9zaXRpb24ueVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IuYWZmZWN0ZWRXaXJlcywgZnVuY3Rpb24gKCB3aXJlICkge1xuXG4gICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5hZGp1c3RXaXJlRW5kU2VnbWVudHMoIHdpcmUgKTtcblxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLmRyYWdnaW5nID0gZmFsc2U7XG5cbiAgICB9O1xuXG4gICAgZmluaXNoRHJhZyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBzZWxmLmRyYWdnaW5nID0gZmFsc2U7XG5cbi8vICAgICAgICBhbmd1bGFyLmZvckVhY2goZHJhZ1RhcmdldHNEZXNjcmlwdG9yLnRhcmdldHMsIGZ1bmN0aW9uKHRhcmdldCkge1xuLy9cbi8vICAgICAgICAgICAgdmFyIHBvc2l0aW9uO1xuLy9cbi8vICAgICAgICAgICAgcG9zaXRpb24gPSB0YXJnZXQuY29tcG9uZW50LmdldFBvc2l0aW9uKCk7XG4vL1xuLy8gICAgICAgICAgICBzZWxmLmRyYWdPcGVyYXRpb24uY29tbWl0KCB0YXJnZXQuY29tcG9uZW50LCBwb3NpdGlvbi54LCBwb3NpdGlvbi55ICk7XG4vLyAgICAgICAgfSk7XG5cblxuICAgICAgICBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgICRsb2cuZGVidWcoICdGaW5pc2ggZHJhZ2dpbmcnICk7XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtTW91c2VNb3ZlID0gZnVuY3Rpb24oJGV2ZW50KSB7XG5cbiAgICAgICAgaWYgKCBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgKSB7XG4gICAgICAgICAgICBzdGFydERyYWcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggZHJhZ1RhcmdldHNEZXNjcmlwdG9yICkge1xuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0O1xuXG4gICAgICAgICAgICBvZmZzZXQgPSBnZXRPZmZzZXRUb01vdXNlKCAkZXZlbnQgKTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IudGFyZ2V0cywgZnVuY3Rpb24gKCB0YXJnZXQgKSB7XG5cbiAgICAgICAgICAgICAgICB0YXJnZXQuY29tcG9uZW50LnNldFBvc2l0aW9uKFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQueCArIHRhcmdldC5kZWx0YVRvQ3Vyc29yLngsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldC55ICsgdGFyZ2V0LmRlbHRhVG9DdXJzb3IueVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IuYWZmZWN0ZWRXaXJlcywgZnVuY3Rpb24gKCB3aXJlICkge1xuXG4gICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5hZGp1c3RXaXJlRW5kU2VnbWVudHMoIHdpcmUgKTtcblxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBvbkRpYWdyYW1Nb3VzZVVwID0gZnVuY3Rpb24oJGV2ZW50KSB7XG5cbiAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gbnVsbDtcblxuICAgICAgICBpZiAoIGRyYWdUYXJnZXRzRGVzY3JpcHRvciApIHtcbiAgICAgICAgICAgIGZpbmlzaERyYWcoKTtcbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIG9uRGlhZ3JhbU1vdXNlTGVhdmUgPSBmdW5jdGlvbigvKiRldmVudCovKSB7XG5cbiAgICAgICAgY2FuY2VsRHJhZygpO1xuXG4gICAgfTtcblxuICAgIG9uV2luZG93Qmx1ciA9IGZ1bmN0aW9uKC8qJGV2ZW50Ki8pIHtcblxuICAgICAgICBjYW5jZWxEcmFnKCk7XG5cbiAgICB9O1xuXG4gICAgb25Db21wb25lbnRNb3VzZVVwID0gZnVuY3Rpb24oY29tcG9uZW50LCAkZXZlbnQpIHtcblxuICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgIGlmICggZHJhZ1RhcmdldHNEZXNjcmlwdG9yICkge1xuICAgICAgICAgICAgZmluaXNoRHJhZygpO1xuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgb25Db21wb25lbnRNb3VzZURvd24gPSBmdW5jdGlvbiAoY29tcG9uZW50LCAkZXZlbnQpIHtcblxuICAgICAgICB2YXIgY29tcG9uZW50c1RvRHJhZyxcbiAgICAgICAgICAgIGdldERyYWdEZXNjcmlwdG9yO1xuXG4gICAgICAgIGNvbXBvbmVudHNUb0RyYWcgPSBbXTtcblxuICAgICAgICBnZXREcmFnRGVzY3JpcHRvciA9IGZ1bmN0aW9uICggY29tcG9uZW50ICkge1xuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gZ2V0T2Zmc2V0VG9Nb3VzZSggJGV2ZW50ICk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiBjb21wb25lbnQueCxcbiAgICAgICAgICAgICAgICAgICAgeTogY29tcG9uZW50LnlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlbHRhVG9DdXJzb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogY29tcG9uZW50LnggLSBvZmZzZXQueCxcbiAgICAgICAgICAgICAgICAgICAgeTogY29tcG9uZW50LnkgLSBvZmZzZXQueVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb25maWcgPSAkc2NvcGUuZGlhZ3JhbS5jb25maWcgfHwge307XG5cbiAgICAgICAgaWYgKCAkc2NvcGUuZGlhZ3JhbS5jb25maWcuZWRpdGFibGUgPT09IHRydWUgJiZcbiAgICAgICAgICAgIGNvbXBvbmVudC5ub25TZWxlY3RhYmxlICE9PSB0cnVlICYmXG4gICAgICAgICAgICBjb21wb25lbnQubG9jYXRpb25Mb2NrZWQgIT09IHRydWUgKSB7XG5cbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yID0ge1xuICAgICAgICAgICAgICAgIHRhcmdldHM6IFsgZ2V0RHJhZ0Rlc2NyaXB0b3IoIGNvbXBvbmVudCApIF1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbXBvbmVudHNUb0RyYWcucHVzaCggY29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgIGlmICggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZiggY29tcG9uZW50LmlkICkgPiAtMSApIHtcblxuICAgICAgICAgICAgICAgIC8vIERyYWcgYWxvbmcgb3RoZXIgc2VsZWN0ZWQgY29tcG9uZW50c1xuXG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcywgZnVuY3Rpb24gKCBzZWxlY3RlZENvbXBvbmVudElkICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZENvbXBvbmVudDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGNvbXBvbmVudC5pZCAhPT0gc2VsZWN0ZWRDb21wb25lbnRJZCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDb21wb25lbnQgPSAkc2NvcGUuZGlhZ3JhbS5jb21wb25lbnRzQnlJZFsgc2VsZWN0ZWRDb21wb25lbnRJZCBdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IudGFyZ2V0cy5wdXNoKCBnZXREcmFnRGVzY3JpcHRvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENvbXBvbmVudCApICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHNUb0RyYWcucHVzaCggc2VsZWN0ZWRDb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvci5hZmZlY3RlZFdpcmVzID0gJHNjb3BlLmRpYWdyYW0uZ2V0V2lyZXNGb3JDb21wb25lbnRzKFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHNUb0RyYWdcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHRoaXMub25EaWFncmFtTW91c2VVcCA9IG9uRGlhZ3JhbU1vdXNlVXA7XG4gICAgdGhpcy5vbkRpYWdyYW1Nb3VzZU1vdmUgPSBvbkRpYWdyYW1Nb3VzZU1vdmU7XG4gICAgdGhpcy5vbkRpYWdyYW1Nb3VzZUxlYXZlID0gb25EaWFncmFtTW91c2VMZWF2ZTtcbiAgICB0aGlzLm9uV2luZG93Qmx1ciA9IG9uV2luZG93Qmx1cjtcbiAgICB0aGlzLm9uQ29tcG9uZW50TW91c2VVcCA9IG9uQ29tcG9uZW50TW91c2VVcDtcbiAgICB0aGlzLm9uQ29tcG9uZW50TW91c2VEb3duID0gb25Db21wb25lbnRNb3VzZURvd247XG5cbiAgICByZXR1cm4gdGhpcztcblxufTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRzY29wZSwgZGlhZ3JhbVNlcnZpY2UsIGdyaWRTZXJ2aWNlLCAkbG9nKSB7XG5cbiAgICB2YXIgb25Db21wb25lbnRNb3VzZVVwLFxuXG4gICAgICAgIG1vdmVDb21wb25lbnRFbGVtZW50VG9Gcm9udCxcbiAgICAgICAgdG9nZ2xlQ29tcG9uZW50U2VsZWN0ZWQ7XG5cblxuICAgIG1vdmVDb21wb25lbnRFbGVtZW50VG9Gcm9udCA9IGZ1bmN0aW9uICggY29tcG9uZW50SWQgKSB7XG5cbiAgICAgICAgdmFyIHosXG4gICAgICAgICAgICBjb21wb25lbnQsXG4gICAgICAgICAgICBuZWVkc1RvYmVSZW9yZGVyZWQ7XG5cbiAgICAgICAgbmVlZHNUb2JlUmVvcmRlcmVkID0gZmFsc2U7XG5cbiAgICAgICAgeiA9IGRpYWdyYW1TZXJ2aWNlLmdldEhpZ2hlc3RaKCk7XG4gICAgICAgIGNvbXBvbmVudCA9ICRzY29wZS5kaWFncmFtLmNvbXBvbmVudHNCeUlkWyBjb21wb25lbnRJZCBdO1xuXG4gICAgICAgIGlmICggaXNOYU4oIGNvbXBvbmVudC56ICkgKSB7XG4gICAgICAgICAgICBjb21wb25lbnQueiA9IHo7XG4gICAgICAgICAgICBuZWVkc1RvYmVSZW9yZGVyZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCBjb21wb25lbnQueiA8IHogKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnogPSB6ICsgMTtcbiAgICAgICAgICAgICAgICBuZWVkc1RvYmVSZW9yZGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBuZWVkc1RvYmVSZW9yZGVyZWQgKSB7XG4gICAgICAgICAgICBncmlkU2VydmljZS5yZW9yZGVyVmlzaWJsZUNvbXBvbmVudHMoICRzY29wZS5pZCApO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG5cbiAgICB0b2dnbGVDb21wb25lbnRTZWxlY3RlZCA9ICBmdW5jdGlvbiAoIGNvbXBvbmVudCwgJGV2ZW50ICkge1xuXG4gICAgICAgIHZhciBpbmRleDtcblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb25maWcgPSAkc2NvcGUuZGlhZ3JhbS5jb25maWcgfHwge307XG5cbiAgICAgICAgaWYgKCBhbmd1bGFyLmlzT2JqZWN0KCBjb21wb25lbnQgKSAmJiAkc2NvcGUuZGlhZ3JhbS5jb25maWcuZGlzYWxsb3dTZWxlY3Rpb24gIT09IHRydWUgJiYgY29tcG9uZW50Lm5vblNlbGVjdGFibGUgIT09IHRydWUgKSB7XG5cbiAgICAgICAgICAgIGluZGV4ID0gJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZiggY29tcG9uZW50LmlkICk7XG5cbiAgICAgICAgICAgIGlmICggaW5kZXggPiAtMSApIHtcblxuICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLnNwbGljZSggaW5kZXgsIDEgKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGlmICggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb25maWcubXVsdGlTZWxlY3QgIT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnNoaWZ0S2V5ICE9PSB0cnVlICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMsIGZ1bmN0aW9uICggY29tcG9uZW50SWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb21wb25lbnRzQnlJZFsgY29tcG9uZW50SWQgXS5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMucHVzaCggY29tcG9uZW50LmlkICk7XG5cbiAgICAgICAgICAgICAgICBtb3ZlQ29tcG9uZW50RWxlbWVudFRvRnJvbnQoIGNvbXBvbmVudC5pZCApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRsb2cuZGVidWcoJ3NlbGVjdGVkcycsICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG5cbiAgICBvbkNvbXBvbmVudE1vdXNlVXAgPSBmdW5jdGlvbihjb21wb25lbnQsICRldmVudCkge1xuICAgICAgICB0b2dnbGVDb21wb25lbnRTZWxlY3RlZCggY29tcG9uZW50LCAkZXZlbnQgKTtcblxuICAgIH07XG5cbiAgICB0aGlzLm9uQ29tcG9uZW50TW91c2VVcCA9IG9uQ29tcG9uZW50TW91c2VVcDtcblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHNjb3BlLCBkaWFncmFtU2VydmljZSwgd2lyaW5nU2VydmljZSwgZ3JpZFNlcnZpY2UsICRsb2cpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcyxcblxuICAgICAgICBXaXJlID0gcmVxdWlyZSggJy4uLy4uLy4uL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvV2lyZS5qcycgKSxcblxuICAgICAgICB3aXJlU3RhcnQsXG5cbiAgICAgICAgc3RhcnRXaXJlLFxuICAgICAgICBhZGRDb3JuZXJUb05ld1dpcmVMaW5lLFxuICAgICAgICBmaW5pc2hXaXJlLFxuICAgICAgICBjYW5jZWxXaXJlLFxuXG4gICAgICAgIG9uRGlhZ3JhbU1vdXNlVXAsXG4gICAgICAgIG9uRGlhZ3JhbU1vdXNlTW92ZSxcbiAgICAgICAgb25EaWFncmFtTW91c2VMZWF2ZSxcbiAgICAgICAgb25XaW5kb3dCbHVyLFxuICAgICAgICBvblBvcnRNb3VzZURvd247XG5cblxuXG4gICAgc3RhcnRXaXJlID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCkge1xuXG4gICAgICAgIHdpcmVTdGFydCA9IHtcbiAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgcG9ydDogcG9ydFxuICAgICAgICB9O1xuXG4gICAgICAgICRsb2cuZGVidWcoICdTdGFydGluZyB3aXJlJywgd2lyZVN0YXJ0ICk7XG5cbiAgICAgICAgc2VsZi53aXJpbmcgPSB0cnVlO1xuXG4gICAgfTtcblxuICAgIGFkZENvcm5lclRvTmV3V2lyZUxpbmUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGxhc3RTZWdtZW50O1xuXG4gICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cyA9ICRzY29wZS5uZXdXaXJlTGluZS5zZWdtZW50cztcblxuICAgICAgICBsYXN0U2VnbWVudCA9ICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50c1sgJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzLmxlbmd0aCAtIDEgXTtcblxuICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUuYWN0aXZlU2VnbWVudFN0YXJ0UG9zaXRpb24gPSB7XG4gICAgICAgICAgICB4OiBsYXN0U2VnbWVudC54MixcbiAgICAgICAgICAgIHk6IGxhc3RTZWdtZW50LnkyXG4gICAgICAgIH07XG5cbiAgICB9O1xuXG4gICAgZmluaXNoV2lyZSA9IGZ1bmN0aW9uICggY29tcG9uZW50LCBwb3J0ICkge1xuXG4gICAgICAgIHZhciB3aXJlID0gbmV3IFdpcmUoIHtcbiAgICAgICAgICAgIGlkOiAnbmV3LXdpcmUtJyArIE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAxMDAwMCApLFxuICAgICAgICAgICAgZW5kMToge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogd2lyZVN0YXJ0LmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICBwb3J0OiB3aXJlU3RhcnQucG9ydFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVuZDI6IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICBwb3J0OiBwb3J0XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gKTtcblxuICAgICAgICB3aXJlLnNlZ21lbnRzID0gYW5ndWxhci5jb3B5KFxuICAgICAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzLmNvbmNhdChcbiAgICAgICAgICAgICAgICB3aXJpbmdTZXJ2aWNlLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucygge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMTogJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMjogcG9ydC5nZXRHcmlkUG9zaXRpb24oKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnRWxib3dSb3V0ZXInXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSApO1xuXG5cbiAgICAgICAgZGlhZ3JhbVNlcnZpY2UuYWRkV2lyZSggJHNjb3BlLmlkLCB3aXJlICk7XG5cbiAgICAgICAgJHNjb3BlLmRpYWdyYW0ud2lyZXNbIHdpcmUuaWQgXSA9IHdpcmU7XG5cbiAgICAgICAgZ3JpZFNlcnZpY2UuaW52YWxpZGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyggJHNjb3BlLmlkICk7XG5cbiAgICAgICAgJGxvZy5kZWJ1ZyggJ0ZpbmlzaCB3aXJlJywgd2lyZSApO1xuXG4gICAgICAgIHdpcmVTdGFydCA9IG51bGw7XG4gICAgICAgICRzY29wZS5uZXdXaXJlTGluZSA9IG51bGw7XG5cbiAgICAgICAgc2VsZi53aXJpbmcgPSBmYWxzZTtcblxuICAgIH07XG5cbiAgICBjYW5jZWxXaXJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUgPSBudWxsO1xuICAgICAgICB3aXJlU3RhcnQgPSBudWxsO1xuICAgICAgICBzZWxmLndpcmluZyA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBvbkRpYWdyYW1Nb3VzZU1vdmUgPSBmdW5jdGlvbigkZXZlbnQpIHtcblxuICAgICAgICBpZiAoIHdpcmVTdGFydCApIHtcblxuXG4gICAgICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUgPSAkc2NvcGUubmV3V2lyZUxpbmUgfHwge307XG4gICAgICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHMgPSAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHMgfHwgW107XG4gICAgICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUuYWN0aXZlU2VnbWVudFN0YXJ0UG9zaXRpb24gPVxuICAgICAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5hY3RpdmVTZWdtZW50U3RhcnRQb3NpdGlvbiB8fCB3aXJlU3RhcnQucG9ydC5nZXRHcmlkUG9zaXRpb24oKTtcblxuICAgICAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLnNlZ21lbnRzID0gJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzLmNvbmNhdChcbiAgICAgICAgICAgICAgICB3aXJpbmdTZXJ2aWNlLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucygge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMTogJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6ICRldmVudC5wYWdlWCAtICRzY29wZS5lbGVtZW50T2Zmc2V0LmxlZnQgLSAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6ICRldmVudC5wYWdlWSAtICRzY29wZS5lbGVtZW50T2Zmc2V0LnRvcCAtIDNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ0VsYm93Um91dGVyJ1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIG9uRGlhZ3JhbU1vdXNlVXAgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAoIHdpcmVTdGFydCApIHtcblxuICAgICAgICAgICAgYWRkQ29ybmVyVG9OZXdXaXJlTGluZSgpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcyA9IFtdO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgb25Qb3J0TW91c2VEb3duID0gZnVuY3Rpb24oIGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50ICkge1xuXG4gICAgICAgIGlmICggd2lyZVN0YXJ0ICkge1xuXG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmICggd2lyZVN0YXJ0LnBvcnQgIT09IHBvcnQgKSB7XG4gICAgICAgICAgICAgICAgZmluaXNoV2lyZSggY29tcG9uZW50LCBwb3J0ICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbmNlbFdpcmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBzdGFydFdpcmUoY29tcG9uZW50LCBwb3J0KTtcbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtTW91c2VMZWF2ZSA9IGZ1bmN0aW9uKC8qJGV2ZW50Ki8pIHtcbiAgICAgICAgaWYgKHNlbGYud2lyaW5nKSB7XG4gICAgICAgICAgICBjYW5jZWxXaXJlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25XaW5kb3dCbHVyID0gZnVuY3Rpb24oLyokZXZlbnQqLykge1xuICAgICAgICBpZiAoc2VsZi53aXJpbmcpIHtcbiAgICAgICAgICAgIGNhbmNlbFdpcmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIHRoaXMub25EaWFncmFtTW91c2VVcCA9IG9uRGlhZ3JhbU1vdXNlVXA7XG4gICAgdGhpcy5vbkRpYWdyYW1Nb3VzZU1vdmUgPSBvbkRpYWdyYW1Nb3VzZU1vdmU7XG4gICAgdGhpcy5vbkRpYWdyYW1Nb3VzZUxlYXZlID0gb25EaWFncmFtTW91c2VMZWF2ZTtcbiAgICB0aGlzLm9uV2luZG93Qmx1ciA9IG9uV2luZG93Qmx1cjtcbiAgICB0aGlzLm9uUG9ydE1vdXNlRG93biA9IG9uUG9ydE1vdXNlRG93bjtcblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIsICQqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRzY29wZSwgZGlhZ3JhbVNlcnZpY2UsICR0aW1lb3V0LCBjb250ZXh0bWVudVNlcnZpY2UsIG9wZXJhdGlvbnNNYW5hZ2VyLCAkbG9nKSB7XG5cbiAgICB2YXJcbiAgICAgICAgb25Db21wb25lbnRDb250ZXh0bWVudSxcbiAgICAgICAgb25Qb3J0Q29udGV4dG1lbnUsXG4gICAgICAgIG9uRGlhZ3JhbUNvbnRleHRtZW51LFxuICAgICAgICBvbkRpYWdyYW1Nb3VzZURvd24sXG5cbiAgICAgICAgb3Blbk1lbnU7XG5cbiAgICAkbG9nLmRlYnVnKCdJbml0aWFsaXppbmcgY29udGV4dCBtZW51cy4nKTtcblxuICAgIG9wZW5NZW51ID0gZnVuY3Rpb24oJGV2ZW50KSB7XG5cbiAgICAgICAgY29udGV4dG1lbnVTZXJ2aWNlLmNsb3NlKCk7XG5cbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgb3BlbkNvbnRleHRNZW51RXZlbnQ7XG5cbiAgICAgICAgICAgICAgICBvcGVuQ29udGV4dE1lbnVFdmVudCA9IGFuZ3VsYXIuZXh0ZW5kKCQuRXZlbnQoJ29wZW5Db250ZXh0TWVudScpLCB7XG4gICAgICAgICAgICAgICAgY2xpZW50WDogJGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICAgICAgY2xpZW50WTogJGV2ZW50LmNsaWVudFksXG4gICAgICAgICAgICAgICAgcGFnZVg6ICRldmVudC5wYWdlWCxcbiAgICAgICAgICAgICAgICBwYWdlWTogJGV2ZW50LnBhZ2VZLFxuICAgICAgICAgICAgICAgIHNjcmVlblg6ICRldmVudC5zY3JlZW5YLFxuICAgICAgICAgICAgICAgIHNjcmVlblk6ICRldmVudC5zY3JlZW5ZLFxuICAgICAgICAgICAgICAgIHRhcmdldDogJGV2ZW50LnRhcmdldFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICRzY29wZS4kZWxlbWVudC50cmlnZ2VySGFuZGxlcihvcGVuQ29udGV4dE1lbnVFdmVudCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtTW91c2VEb3duID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnRleHRtZW51U2VydmljZS5jbG9zZSgpO1xuICAgIH07XG5cbiAgICBvbkNvbXBvbmVudENvbnRleHRtZW51ID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgJGV2ZW50KSB7XG5cbiAgICAgICAgJHNjb3BlLmNvbnRleHRNZW51RGF0YSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ3JlcG9zaXRpb24nLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncm90YXRlQ1cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSb3RhdGUgQ1cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcm90YXRlLXJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9wZXJhdGlvbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbiA9IG9wZXJhdGlvbnNNYW5hZ2VyLmluaXROZXcoJ3JvdGF0ZUNvbXBvbmVudHMnLCBjb21wb25lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5zZXQoOTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5jb21taXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdyb3RhdGVDQ1cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSb3RhdGUgQ0NXJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXJvdGF0ZS1sZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9wZXJhdGlvbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSb3RhdGluZyBhbnRpLWNsb2Nrd2lzZScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uID0gb3BlcmF0aW9uc01hbmFnZXIuaW5pdE5ldygncm90YXRlQ29tcG9uZW50cycsIGNvbXBvbmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uLnNldCgtOTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5jb21taXQoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgIG9wZW5NZW51KCRldmVudCk7XG5cbiAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgfTtcblxuICAgIG9uUG9ydENvbnRleHRtZW51ID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KSB7XG5cbiAgICAgICAgJHNjb3BlLmNvbnRleHRNZW51RGF0YSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ3Byb3BlcnRpZXMnLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnaW5mbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0luZm8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUG9ydCBpbmZvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge31cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuICAgICAgICBvcGVuTWVudSgkZXZlbnQpO1xuXG4gICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtQ29udGV4dG1lbnUgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cbiAgICAgICAgJHNjb3BlLmNvbnRleHRNZW51RGF0YSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2Fib3V0JyxcbiAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2dldFN0YXRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU3RhdGlzdGljcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGx1cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU3RhdGlzdGljcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHt9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgb3Blbk1lbnUoJGV2ZW50KTtcblxuICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB9O1xuXG4gICAgdGhpcy5vbkRpYWdyYW1Db250ZXh0bWVudSA9IG9uRGlhZ3JhbUNvbnRleHRtZW51O1xuICAgIHRoaXMub25Db21wb25lbnRDb250ZXh0bWVudSA9IG9uQ29tcG9uZW50Q29udGV4dG1lbnU7XG4gICAgdGhpcy5vblBvcnRDb250ZXh0bWVudSA9IG9uUG9ydENvbnRleHRtZW51O1xuICAgIHRoaXMub25EaWFncmFtTW91c2VEb3duID0gb25EaWFncmFtTW91c2VEb3duO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbn07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgJCovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbnJlcXVpcmUoJy4uL2NvbXBvbmVudFdpcmUvY29tcG9uZW50V2lyZS5qcycpO1xuXG5hbmd1bGFyLm1vZHVsZSgnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ZnRGlhZ3JhbScsIFtcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZ3JpZFNlcnZpY2UnLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ub3BlcmF0aW9uc01hbmFnZXInLFxuICAgICdpc2lzLnVpLmNvbnRleHRtZW51J1xuXSlcbiAgICAuY29udHJvbGxlcignU1ZHRGlhZ3JhbUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoXG4gICAgICAgICRzY29wZSwgJGxvZywgZGlhZ3JhbVNlcnZpY2UsIHdpcmluZ1NlcnZpY2UsIGdyaWRTZXJ2aWNlLCAkd2luZG93LCAkdGltZW91dCwgY29udGV4dG1lbnVTZXJ2aWNlLCBvcGVyYXRpb25zTWFuYWdlcikge1xuXG4gICAgICAgIHZhclxuXG4gICAgICAgICAgICBDb21wb25lbnRTZWxlY3Rpb25IYW5kbGVyID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NvbXBvbmVudFNlbGVjdGlvbkhhbmRsZXInKSxcbiAgICAgICAgICAgIGNvbXBvbmVudFNlbGVjdGlvbkhhbmRsZXIsXG5cbiAgICAgICAgICAgIENvbXBvbmVudERyYWdIYW5kbGVyID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NvbXBvbmVudERyYWdIYW5kbGVyJyksXG4gICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlcixcblxuICAgICAgICAgICAgV2lyZURyYXdIYW5kbGVyID0gcmVxdWlyZSgnLi9jbGFzc2VzL1dpcmVEcmF3SGFuZGxlcicpLFxuICAgICAgICAgICAgd2lyZURyYXdIYW5kbGVyLFxuXG4gICAgICAgICAgICBDb250ZXh0TWVudUhhbmRsZXIgPSByZXF1aXJlKCcuL2NsYXNzZXMvY29udGV4dE1lbnVIYW5kbGVyJyksXG4gICAgICAgICAgICBjb250ZXh0TWVudUhhbmRsZXIsXG5cbiAgICAgICAgICAgIGNvbXBvbmVudEVsZW1lbnRzLFxuXG4gICAgICAgICAgICAkJHdpbmRvdztcblxuICAgICAgICAkJHdpbmRvdyA9ICQoJHdpbmRvdyk7XG5cbiAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIgPSBuZXcgQ29tcG9uZW50RHJhZ0hhbmRsZXIoXG4gICAgICAgICAgICAkc2NvcGUsXG4gICAgICAgICAgICBkaWFncmFtU2VydmljZSxcbiAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UsXG4gICAgICAgICAgICBvcGVyYXRpb25zTWFuYWdlcixcbiAgICAgICAgICAgICRsb2dcbiAgICAgICAgKTtcblxuICAgICAgICBjb21wb25lbnRTZWxlY3Rpb25IYW5kbGVyID0gbmV3IENvbXBvbmVudFNlbGVjdGlvbkhhbmRsZXIoXG4gICAgICAgICAgICAkc2NvcGUsXG4gICAgICAgICAgICBkaWFncmFtU2VydmljZSxcbiAgICAgICAgICAgIGdyaWRTZXJ2aWNlLFxuICAgICAgICAgICAgJGxvZ1xuICAgICAgICApO1xuXG4gICAgICAgIHdpcmVEcmF3SGFuZGxlciA9IG5ldyBXaXJlRHJhd0hhbmRsZXIoXG4gICAgICAgICAgICAkc2NvcGUsXG4gICAgICAgICAgICBkaWFncmFtU2VydmljZSxcbiAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UsXG4gICAgICAgICAgICBncmlkU2VydmljZSxcbiAgICAgICAgICAgICRsb2dcbiAgICAgICAgKTtcblxuICAgICAgICBjb250ZXh0TWVudUhhbmRsZXIgPSBuZXcgQ29udGV4dE1lbnVIYW5kbGVyKFxuICAgICAgICAgICAgJHNjb3BlLFxuICAgICAgICAgICAgZGlhZ3JhbVNlcnZpY2UsXG4gICAgICAgICAgICAkdGltZW91dCxcbiAgICAgICAgICAgIGNvbnRleHRtZW51U2VydmljZSxcbiAgICAgICAgICAgIG9wZXJhdGlvbnNNYW5hZ2VyLFxuICAgICAgICAgICAgJGxvZ1xuICAgICAgICApO1xuXG4gICAgICAgICRzY29wZS5vbkRpYWdyYW1Nb3VzZURvd24gPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cblxuXG4gICAgICAgICAgICBpZiAoJGV2ZW50LndoaWNoID09PSAzKSB7XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0TWVudUhhbmRsZXIub25EaWFncmFtQ29udGV4dG1lbnUoJGV2ZW50KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGNvbnRleHRNZW51SGFuZGxlci5vbkRpYWdyYW1Nb3VzZURvd24oJGV2ZW50KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cblxuICAgICAgICAkc2NvcGUub25EaWFncmFtTW91c2VVcCA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25EaWFncmFtTW91c2VVcCgkZXZlbnQpO1xuICAgICAgICAgICAgd2lyZURyYXdIYW5kbGVyLm9uRGlhZ3JhbU1vdXNlVXAoJGV2ZW50KTtcblxuICAgICAgICB9O1xuXG5cbiAgICAgICAgJHNjb3BlLm9uRGlhZ3JhbUNsaWNrID0gZnVuY3Rpb24gKC8qJGV2ZW50Ki8pIHtcblxuXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9uRGlhZ3JhbU1vdXNlTW92ZSA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25EaWFncmFtTW91c2VNb3ZlKCRldmVudCk7XG4gICAgICAgICAgICB3aXJlRHJhd0hhbmRsZXIub25EaWFncmFtTW91c2VNb3ZlKCRldmVudCk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZ2V0Q3NzQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAnJztcblxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudERyYWdIYW5kbGVyLmRyYWdnaW5nKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9ICdkcmFnZ2luZyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub25EaWFncmFtTW91c2VMZWF2ZSA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25EaWFncmFtTW91c2VMZWF2ZSgkZXZlbnQpO1xuICAgICAgICAgICAgd2lyZURyYXdIYW5kbGVyLm9uRGlhZ3JhbU1vdXNlTGVhdmUoJGV2ZW50KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgICQkd2luZG93LmJsdXIoZnVuY3Rpb24gKCRldmVudCkge1xuXG4gICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlci5vbldpbmRvd0JsdXIoJGV2ZW50KTtcbiAgICAgICAgICAgIHdpcmVEcmF3SGFuZGxlci5vbldpbmRvd0JsdXIoJGV2ZW50KTtcblxuICAgICAgICB9KTtcblxuXG4gICAgICAgIC8vIEludGVyYWN0aW9ucyB3aXRoIGNvbXBvbmVudHNcblxuICAgICAgICB0aGlzLm9uQ29tcG9uZW50TW91c2VVcCA9IGZ1bmN0aW9uIChjb21wb25lbnQsICRldmVudCkge1xuXG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudERyYWdIYW5kbGVyLmRyYWdnaW5nKSB7XG5cbiAgICAgICAgICAgICAgICBjb21wb25lbnRTZWxlY3Rpb25IYW5kbGVyLm9uQ29tcG9uZW50TW91c2VVcChjb21wb25lbnQsICRldmVudCk7XG4gICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25Db21wb25lbnRNb3VzZVVwKGNvbXBvbmVudCwgJGV2ZW50KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlci5vbkNvbXBvbmVudE1vdXNlVXAoY29tcG9uZW50LCAkZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25Qb3J0TW91c2VEb3duID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGlmICggIXdpcmVEcmF3SGFuZGxlci53aXJpbmcgJiYgJGV2ZW50LndoaWNoID09PSAzICkge1xuXG4gICAgICAgICAgICAgICAgY29udGV4dE1lbnVIYW5kbGVyLm9uUG9ydENvbnRleHRtZW51KGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aXJlRHJhd0hhbmRsZXIub25Qb3J0TW91c2VEb3duKGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25Qb3J0TW91c2VVcCA9IGZ1bmN0aW9uIChjb21wb25lbnQsIHBvcnQsICRldmVudCkge1xuXG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uUG9ydENsaWNrID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KSB7XG5cbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25Db21wb25lbnRNb3VzZURvd24gPSBmdW5jdGlvbiAoY29tcG9uZW50LCAkZXZlbnQpIHtcblxuICAgICAgICAgICAgaWYgKCRldmVudC53aGljaCA9PT0gMykge1xuXG4gICAgICAgICAgICAgICAgY29udGV4dE1lbnVIYW5kbGVyLm9uQ29tcG9uZW50Q29udGV4dG1lbnUoY29tcG9uZW50LCAkZXZlbnQpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50RHJhZ0hhbmRsZXIub25Db21wb25lbnRNb3VzZURvd24oY29tcG9uZW50LCAkZXZlbnQpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pc0VkaXRhYmxlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb25maWcgPSAkc2NvcGUuZGlhZ3JhbS5jb25maWcgfHwge307XG5cbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuZGlhZ3JhbS5jb25maWcuZWRpdGFibGUgPT09IHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kaXNhbGxvd1NlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW0uY29uZmlnLmRpc2FsbG93U2VsZWN0aW9uID09PSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJDb21wb25lbnRFbGVtZW50ID0gZnVuY3Rpb24gKGlkLCBlbCkge1xuXG4gICAgICAgICAgICBjb21wb25lbnRFbGVtZW50cyA9IGNvbXBvbmVudEVsZW1lbnRzIHx8IHt9O1xuXG4gICAgICAgICAgICBjb21wb25lbnRFbGVtZW50c1tpZF0gPSBlbDtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudW5yZWdpc3RlckNvbXBvbmVudEVsZW1lbnQgPSBmdW5jdGlvbiAoaWQpIHtcblxuICAgICAgICAgICAgY29tcG9uZW50RWxlbWVudHMgPSBjb21wb25lbnRFbGVtZW50cyB8fCB7fTtcblxuICAgICAgICAgICAgZGVsZXRlIGNvbXBvbmVudEVsZW1lbnRzW2lkXTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIG9wZXJhdGlvbnNNYW5hZ2VyLnJlZ2lzdGVyT3BlcmF0aW9uKHtcbiAgICAgICAgICAgIGlkOiAncm90YXRlQ29tcG9uZW50cycsXG4gICAgICAgICAgICBvcGVyYXRpb25DbGFzczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmluaXQgPSBmdW5jdGlvbihjb21wb25lbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQgPSBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlID0gYW5nbGU7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY29tbWl0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudHNUb1JvdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWZmZWN0ZWRXaXJlcztcblxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9Sb3RhdGUgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUgPSB0aGlzLmFuZ2xlO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHNUb1JvdGF0ZS5wdXNoKCB0aGlzLmNvbXBvbmVudCApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZiggdGhpcy5jb21wb25lbnQuaWQgKSA+IC0xICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLCBmdW5jdGlvbiAoIHNlbGVjdGVkQ29tcG9uZW50SWQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWRDb21wb25lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNvbXBvbmVudC5pZCAhPT0gc2VsZWN0ZWRDb21wb25lbnRJZCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENvbXBvbmVudCA9ICRzY29wZS5kaWFncmFtLmNvbXBvbmVudHNCeUlkICAgWyBzZWxlY3RlZENvbXBvbmVudElkIF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c1RvUm90YXRlLnB1c2goIHNlbGVjdGVkQ29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGFmZmVjdGVkV2lyZXMgPSAkc2NvcGUuZGlhZ3JhbS5nZXRXaXJlc0ZvckNvbXBvbmVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9Sb3RhdGVcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goY29tcG9uZW50c1RvUm90YXRlLCBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5yb3RhdGUoYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggYWZmZWN0ZWRXaXJlcywgZnVuY3Rpb24gKCB3aXJlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5hZGp1c3RXaXJlRW5kU2VnbWVudHMoIHdpcmUgKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9KVxuICAgIC5kaXJlY3RpdmUoJ3N2Z0RpYWdyYW0nLCBbXG4gICAgICAgICckcm9vdFNjb3BlJyxcbiAgICAgICAgJyRsb2cnLFxuICAgICAgICAnZGlhZ3JhbVNlcnZpY2UnLFxuICAgICAgICAnZ3JpZFNlcnZpY2UnLFxuICAgICAgICBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvZywgZGlhZ3JhbVNlcnZpY2UsIGdyaWRTZXJ2aWNlKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NWR0RpYWdyYW1Db250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICByZXF1aXJlOiAnXmRpYWdyYW1Db250YWluZXInLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9zdmdEaWFncmFtLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcywgZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbGxDb250ZXh0TWVudTtcblxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAga2lsbENvbnRleHRNZW51ID0gZnVuY3Rpb24oJGV2ZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ2tpbGxpbmcgZGVmYXVsdCBjb250ZXh0bWVudScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnZGlhZ3JhbScsIGZ1bmN0aW9uKG5ld0RpYWdyYW1WYWx1ZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGlhZ3JhbVZhbHVlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaWFncmFtID0gc2NvcGUuZGlhZ3JhbSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kZWxlbWVudCA9ICRlbGVtZW50O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQub3V0ZXJXaWR0aChzY29wZS5kaWFncmFtLmNvbmZpZy53aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQub3V0ZXJIZWlnaHQoc2NvcGUuZGlhZ3JhbS5jb25maWcud2lkdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuaWQgPSBpZCA9IG5ld0RpYWdyYW1WYWx1ZS5pZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLnNldEluaXRpYWxpemVkKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignR3JpZEluaXRpYWxpemVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5zZXRJbml0aWFsaXplZCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudmlzaWJsZU9iamVjdHMgPSBncmlkU2VydmljZS5jcmVhdGVHcmlkKGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaWFncmFtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuZ2V0VmlzaWJsZUFyZWEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHZpc2libGVBcmVhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5lbGVtZW50T2Zmc2V0ID0gc2NvcGUuJGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkU2VydmljZS5zZXRWaXNpYmxlQXJlYShpZCwgdmlzaWJsZUFyZWEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRlbWl0KCdEaWFncmFtSW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmJpbmQoJ2NvbnRleHRtZW51Jywga2lsbENvbnRleHRNZW51KTtcblxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuYm94JywgW11cbilcbiAgICAuY29udHJvbGxlciggJ0JveENvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcblxuICAgICAgICAkc2NvcGUucG9ydFdpcmVzID0gW107XG5cbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKCAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5wb3J0cywgZnVuY3Rpb24gKCBwb3J0ICkge1xuXG4gICAgICAgICAgICB2YXIgdG9YID0gMCxcbiAgICAgICAgICAgICAgICB0b1kgPSAwLFxuICAgICAgICAgICAgICAgIHBvcnRXaXJlTGVuZ3RoLFxuICAgICAgICAgICAgICAgIHdpZHRoLCBoZWlnaHQ7XG5cbiAgICAgICAgICAgIHBvcnRXaXJlTGVuZ3RoID0gJHNjb3BlLmNvbXBvbmVudC5zeW1ib2wucG9ydFdpcmVMZW5ndGg7XG4gICAgICAgICAgICB3aWR0aCA9ICRzY29wZS5jb21wb25lbnQuc3ltYm9sLndpZHRoO1xuICAgICAgICAgICAgaGVpZ2h0ID0gJHNjb3BlLmNvbXBvbmVudC5zeW1ib2wuaGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoIHBvcnQueCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICB0b1ggPSBwb3J0V2lyZUxlbmd0aDtcbiAgICAgICAgICAgICAgICB0b1kgPSBwb3J0Lnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggcG9ydC55ID09PSAwICkge1xuICAgICAgICAgICAgICAgIHRvWSA9IHBvcnRXaXJlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRvWCA9IHBvcnQueDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBwb3J0LnggPT09IHdpZHRoICkge1xuICAgICAgICAgICAgICAgIHRvWCA9IHdpZHRoIC0gcG9ydFdpcmVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdG9ZID0gcG9ydC55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHBvcnQueSA9PT0gaGVpZ2h0ICkge1xuICAgICAgICAgICAgICAgIHRvWSA9IGhlaWdodCAtIHBvcnRXaXJlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRvWCA9IHBvcnQueDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJHNjb3BlLnBvcnRXaXJlcy5wdXNoKCB7XG4gICAgICAgICAgICAgICAgeDE6IHBvcnQueCxcbiAgICAgICAgICAgICAgICB5MTogcG9ydC55LFxuICAgICAgICAgICAgICAgIHgyOiB0b1gsXG4gICAgICAgICAgICAgICAgeTI6IHRvWVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG5cbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKFxuICAgICAgICAnYm94JyxcblxuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQm94Q29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9ib3guaHRtbCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVOYW1lc3BhY2U6ICdTVkcnXG4gICAgICAgICAgICB9O1xuICAgICAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5jYXBhY2l0b3InLCBbXVxuICAgIClcbiAgICAuY29uZmlnKFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uIChzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhcGFjaXRvcicsXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiBudWxsLFxuICAgICAgICAgICAgICAgIHN2Z0RlY29yYXRpb246ICdpbWFnZXMvc3ltYm9scy5zdmcjaWNvbi1jYXBhY2l0b3InLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnQycsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLThcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA2MCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDE1LFxuICAgICAgICAgICAgICAgIHBvcnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIEM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnQycsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiA3LjVcbiAgICAgICAgICAgICAgICAgICAgfSwgQToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IDYwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogNy41XG4gICAgICAgICAgICAgICAgICAgIH0gfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICBdKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgJCovXG5cbid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSggJy4uLy4uL3NlcnZpY2VzL3N5bWJvbFNlcnZpY2VzL3N5bWJvbFNlcnZpY2VzLmpzJyApO1xucmVxdWlyZSggJy4uL3BvcnQvcG9ydC5qcycgKTtcblxucmVxdWlyZSggJy4vcmVzaXN0b3IvcmVzaXN0b3IuanMnICk7XG5yZXF1aXJlKCAnLi9qRmV0UC9qRmV0UC5qcycgKTtcbnJlcXVpcmUoICcuL29wQW1wL29wQW1wLmpzJyApO1xucmVxdWlyZSggJy4vZGlvZGUvZGlvZGUuanMnICk7XG5yZXF1aXJlKCAnLi9jYXBhY2l0b3IvY2FwYWNpdG9yLmpzJyApO1xucmVxdWlyZSggJy4vaW5kdWN0b3IvaW5kdWN0b3IuanMnICk7XG5yZXF1aXJlKCAnLi9zaW1wbGVDb25uZWN0b3Ivc2ltcGxlQ29ubmVjdG9yLmpzJyApO1xuXG5yZXF1aXJlKCAnLi9ib3gvYm94LmpzJyApO1xuXG52YXIgc3ltYm9sc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzJywgW1xuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9sU2VydmljZXMnLFxuXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5wb3J0JyxcblxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5yZXNpc3RvcicsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmpGZXRQJyxcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMub3BBbXAnLFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5kaW9kZScsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmNhcGFjaXRvcicsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmluZHVjdG9yJyxcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuc2ltcGxlQ29ubmVjdG9yJyxcblxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5ib3gnXG5cbiAgICBdICk7XG5cbnN5bWJvbHNNb2R1bGUuY29udHJvbGxlcihcbiAgICAnU3ltYm9sQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlICkge1xuXG4gICAgICAgICRzY29wZS5nZXRTeW1ib2xUcmFuc2Zvcm0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1TdHJpbmc7XG5cbiAgICAgICAgICAgIC8vICAgIHRyYW5zZm9ybVN0cmluZyA9ICd0cmFuc2xhdGUoJyArICRzY29wZS5jb21wb25lbnQueCArICcsJyArICRzY29wZS5jb21wb25lbnQueSArICcpICc7XG4gICAgICAgICAgICAvLyAgICB0cmFuc2Zvcm1TdHJpbmcgKz1cbiAgICAgICAgICAgIC8vICAgICAgJ3JvdGF0ZSgnICsgJHNjb3BlLmNvbXBvbmVudC5yb3RhdGlvbiArICcgJyArICRzY29wZS5jb21wb25lbnQuc3ltYm9sLndpZHRoLzIgKyAnICcgKyAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5oZWlnaHQvMiAgKyAnKSAnO1xuICAgICAgICAgICAgLy8gICAgLy90cmFuc2Zvcm1TdHJpbmcgKz0gJ3NjYWxlKCcgKyAkc2NvcGUuY29tcG9uZW50LnNjYWxlWCArICcsJyArICRzY29wZS5jb21wb25lbnQuc2NhbGVZICsgJykgJztcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAgICBjb25zb2xlLmxvZygkc2NvcGUuY29tcG9uZW50LmdldFRyYW5zZm9ybWF0aW9uTWF0cml4KCkuam9pbignLCAnKSk7XG5cbiAgICAgICAgICAgIHRyYW5zZm9ybVN0cmluZyA9ICdtYXRyaXgoJyArICRzY29wZS5jb21wb25lbnQuZ2V0U1ZHVHJhbnNmb3JtYXRpb25TdHJpbmcoKSArICcpJztcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVN0cmluZztcbiAgICAgICAgfTtcblxuICAgIH0gKTtcblxuc3ltYm9sc01vZHVsZS5kaXJlY3RpdmUoXG4gICAgJ2NvbXBvbmVudFN5bWJvbCcsXG5cbiAgICBmdW5jdGlvbiAoICRjb21waWxlICkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJz0nLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICc9JyxcbiAgICAgICAgICAgICAgICBwYWdlOiAnPScsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2U6ICc9J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1N5bWJvbENvbnRyb2xsZXInLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9jb21wb25lbnRTeW1ib2wuaHRtbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRycsXG4gICAgICAgICAgICByZXF1aXJlOiBbICdec3ZnRGlhZ3JhbScsICdeZGlhZ3JhbUNvbnRhaW5lcicgXSxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICggc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGNvbnRyb2xsZXJzICkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlU3RyLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSxcblxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIsXG5cbiAgICAgICAgICAgICAgICAgICAgJGVsLFxuICAgICAgICAgICAgICAgICAgICBjb21waWxlZFN5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sRGlyZWN0aXZlO1xuXG4gICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIgPSBjb250cm9sbGVyc1sgMCBdO1xuICAgICAgICAgICAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyID0gY29udHJvbGxlcnNbIDEgXTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLnBvcnRzVmlzaWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLmRldGFpbHNWaXNpYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuZ2V0Wm9vbUxldmVsKCkgPiAxO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzY29wZS5nZXRDc3NDbGFzcyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNjb3BlLmNvbXBvbmVudC5zeW1ib2wuY3NzQ2xhc3MgPyBzY29wZS5jb21wb25lbnQuc3ltYm9sLmNzc0NsYXNzIDogc2NvcGUuY29tcG9uZW50LnN5bWJvbC50eXBlO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuaXNDb21wb25lbnRTZWxlY3RlZCggc2NvcGUuY29tcG9uZW50ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gJyBzZWxlY3RlZCc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIEludGVyYWN0aW9uc1xuXG4gICAgICAgICAgICAgICAgc2NvcGUub25Nb3VzZVVwID0gZnVuY3Rpb24gKCAkZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uQ29tcG9uZW50TW91c2VVcCggc2NvcGUuY29tcG9uZW50LCAkZXZlbnQgKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgc2NvcGUub25Nb3VzZURvd24gPSBmdW5jdGlvbiAoICRldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIub25Db21wb25lbnRNb3VzZURvd24oIHNjb3BlLmNvbXBvbmVudCwgJGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgc3ltYm9sRGlyZWN0aXZlID0gc2NvcGUuY29tcG9uZW50LnN5bWJvbC5zeW1ib2xEaXJlY3RpdmUgfHwgJ2dlbmVyaWMtc3ZnJztcblxuICAgICAgICAgICAgICAgIGNvbXBpbGVkU3ltYm9sID0gZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuZ2V0Q29tcGlsZWREaXJlY3RpdmUoIHN5bWJvbERpcmVjdGl2ZSApO1xuXG4gICAgICAgICAgICAgICAgaWYgKCAhYW5ndWxhci5pc0Z1bmN0aW9uKCBjb21waWxlZFN5bWJvbCApICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlU3RyID0gJzwnICsgc3ltYm9sRGlyZWN0aXZlICsgJz4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8LycgKyBzeW1ib2xEaXJlY3RpdmUgKyAnPic7XG5cbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGUgPSBhbmd1bGFyLmVsZW1lbnQoIHRlbXBsYXRlU3RyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRTeW1ib2wgPSAkY29tcGlsZSggdGVtcGxhdGUgKTtcblxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5zZXRDb21waWxlZERpcmVjdGl2ZSggc3ltYm9sRGlyZWN0aXZlLCBjb21waWxlZFN5bWJvbCApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJGVsID0gJCggZWxlbWVudCApO1xuXG4gICAgICAgICAgICAgICAgY29tcGlsZWRTeW1ib2woIHNjb3BlLCBmdW5jdGlvbiAoIGNsb25lZEVsZW1lbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICRlbC5maW5kKCAnLnN5bWJvbC1wbGFjZWhvbGRlcicgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2VXaXRoKCBjbG9uZWRFbGVtZW50ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIucmVnaXN0ZXJDb21wb25lbnRFbGVtZW50KCBzY29wZS5jb21wb25lbnQuaWQsICRlbCApO1xuXG4gICAgICAgICAgICAgICAgc2NvcGUuJG9uKCAnJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLnVucmVnaXN0ZXJDb21wb25lbnRFbGVtZW50KCBzY29wZS5jb21wb25lbnQuaWQgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4pO1xuXG5zeW1ib2xzTW9kdWxlLmRpcmVjdGl2ZShcbiAgICAnZ2VuZXJpY1N2ZycsXG5cbiAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNjb3BlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9nZW5lcmljU3ZnLmh0bWwnLFxuICAgICAgICAgICAgdGVtcGxhdGVOYW1lc3BhY2U6ICdTVkcnXG4gICAgICAgIH07XG4gICAgfVxuKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuZGlvZGUnLCBbXVxuICAgIClcbiAgICAuY29uZmlnKFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uIChzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Rpb2RlJyxcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLWRpb2RlJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ0QnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC04XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNjAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxNSxcbiAgICAgICAgICAgICAgICBwb3J0czoge1xuICAgICAgICAgICAgICAgICAgICBDOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ0MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDdcbiAgICAgICAgICAgICAgICAgICAgfSwgQToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogNjAsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiA3XG4gICAgICAgICAgICAgICAgICAgIH0gfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICBdKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmluZHVjdG9yJywgW11cbiAgICApXG4gICAgLmNvbmZpZyhbICdzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICBmdW5jdGlvbiAoc3ltYm9sTWFuYWdlclByb3ZpZGVyKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdpbmR1Y3RvcicsXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiBudWxsLFxuICAgICAgICAgICAgICAgIHN2Z0RlY29yYXRpb246ICdpbWFnZXMvc3ltYm9scy5zdmcjaWNvbi1pbmR1Y3RvcicsXG4gICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICdMJyxcbiAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDEwLFxuICAgICAgICAgICAgICAgICAgICB5OiAtOFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMTAsXG4gICAgICAgICAgICAgICAgcG9ydHM6IHtcbiAgICAgICAgICAgICAgICAgICAgcDE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAncDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDYuNVxuICAgICAgICAgICAgICAgICAgICB9LCBwMjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdwMicsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAncDInLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogNTAsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiA2LjVcbiAgICAgICAgICAgICAgICAgICAgfSB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIF0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuakZldFAnLCBbXVxuICAgIClcbiAgICAuY29uZmlnKFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uIChzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2pGZXRQJyxcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLWpGZXRQJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ1EnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogNjAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDEyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNjIsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA3MCxcbiAgICAgICAgICAgICAgICBwb3J0czoge1xuICAgICAgICAgICAgICAgICAgICBzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAyNzAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUycsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiA0NyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICAgICAgfSwgZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogOTAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiA0NyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDcwXG4gICAgICAgICAgICAgICAgICAgIH0sIGc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZycsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdHJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiAyNlxuICAgICAgICAgICAgICAgICAgICB9IH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgXSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5vcEFtcCcsIFtdXG4gICAgKVxuICAgIC5jb25maWcoWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKHN5bWJvbE1hbmFnZXJQcm92aWRlcikge1xuICAgICAgICAgICAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnb3BBbXAnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tb3BBbXAnLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnQScsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiA5MCxcbiAgICAgICAgICAgICAgICAgICAgeTogMTVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICAgICAgcG9ydHM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ1ZzKyc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnVnMrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMjcwLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZzKycsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiA2NSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICAgICAgfSwgJ1ZvdXQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ1ZvdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZvdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogMTQwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogNTBcbiAgICAgICAgICAgICAgICAgICAgfSwgJ1ZzLSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnVnMtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogOTAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVnMtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IDY1LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogMTAwXG4gICAgICAgICAgICAgICAgICAgIH0sICdWLSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnVi0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVi0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDc1XG4gICAgICAgICAgICAgICAgICAgIH0sICdWKyc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnVisnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVisnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDI1XG4gICAgICAgICAgICAgICAgICAgIH0gfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICBdKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLnJlc2lzdG9yJywgW11cbiAgICApXG4gICAgLmNvbmZpZyhbICdzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICBmdW5jdGlvbiAoc3ltYm9sTWFuYWdlclByb3ZpZGVyKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdyZXNpc3RvcicsXG4gICAgICAgICAgICAgICAgc3ltYm9sRGlyZWN0aXZlOiBudWxsLFxuICAgICAgICAgICAgICAgIHN2Z0RlY29yYXRpb246ICdpbWFnZXMvc3ltYm9scy5zdmcjaWNvbi1yZXNpc3RvcicsXG4gICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICdSJyxcbiAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDEwLFxuICAgICAgICAgICAgICAgICAgICB5OiAtOFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2lkdGg6IDYwLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMTAsXG4gICAgICAgICAgICAgICAgcG9ydHM6IHtcbiAgICAgICAgICAgICAgICAgICAgcDE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAncDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDVcbiAgICAgICAgICAgICAgICAgICAgfSwgcDI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncDInLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ3AyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IDYwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogNVxuICAgICAgICAgICAgICAgICAgICB9IH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgXSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5zaW1wbGVDb25uZWN0b3InLCBbXVxuICAgICkuY29uZmlnKFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uIChzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3NpbXBsZUNvbm5lY3RvcicsXG4gICAgICAgICAgICAgICAgc3ltYm9sRGlyZWN0aXZlOiAnc2ltcGxlLWNvbm5lY3RvcicsXG4gICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICcnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMyxcbiAgICAgICAgICAgICAgICAgICAgeTogMTFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxNSxcbiAgICAgICAgICAgICAgICBwb3J0czoge1xuICAgICAgICAgICAgICAgICAgICBwMToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogOTcsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiA3XG4gICAgICAgICAgICAgICAgICAgIH0gfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICBdKVxuICAgIC5jb250cm9sbGVyKCdTaW1wbGVDb25uZWN0b3JDb250cm9sbGVyJywgZnVuY3Rpb24gKCkge1xuICAgIH0pXG4gICAgLmRpcmVjdGl2ZShcbiAgICAnc2ltcGxlQ29ubmVjdG9yJyxcblxuICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnU2ltcGxlQ29ubmVjdG9yQ29udHJvbGxlcicsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL3NpbXBsZUNvbm5lY3Rvci5odG1sJyxcbiAgICAgICAgICAgIHRlbXBsYXRlTmFtZXNwYWNlOiAnU1ZHJ1xuICAgICAgICB9O1xuICAgIH0pOyIsbnVsbCwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBnbE1hdHJpeCA9IHJlcXVpcmUoICdnbE1hdHJpeCcgKTtcblxudmFyIENvbXBvbmVudFBvcnQgPSBmdW5jdGlvbiAoIGRlc2NyaXB0b3IgKSB7XG5cbiAgICBhbmd1bGFyLmV4dGVuZCggdGhpcywgZGVzY3JpcHRvciApO1xuXG59O1xuXG5Db21wb25lbnRQb3J0LnByb3RvdHlwZS5nZXRHcmlkUG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgcG9zaXRpb24sXG4gICAgICAgIHBvc2l0aW9uVmVjdG9yO1xuXG4gICAgaWYgKCBhbmd1bGFyLmlzT2JqZWN0KCB0aGlzLnBvcnRTeW1ib2wgKSAmJiBhbmd1bGFyLmlzT2JqZWN0KCB0aGlzLnBhcmVudENvbXBvbmVudCApICkge1xuXG4gICAgICAgIHBvc2l0aW9uVmVjdG9yID0gZ2xNYXRyaXgudmVjMi5jcmVhdGUoKTtcbiAgICAgICAgZ2xNYXRyaXgudmVjMi5zZXQoIHBvc2l0aW9uVmVjdG9yLCB0aGlzLnBvcnRTeW1ib2wueCwgdGhpcy5wb3J0U3ltYm9sLnkgKTtcblxuICAgICAgICBnbE1hdHJpeC52ZWMyLnRyYW5zZm9ybU1hdDMoIHBvc2l0aW9uVmVjdG9yLCBwb3NpdGlvblZlY3RvciwgdGhpcy5wYXJlbnRDb21wb25lbnQuZ2V0VHJhbnNmb3JtYXRpb25NYXRyaXgoKSApO1xuXG4gICAgICAgIHBvc2l0aW9uID0ge1xuXG4gICAgICAgICAgICB4OiBwb3NpdGlvblZlY3RvclsgMCBdLFxuICAgICAgICAgICAgeTogcG9zaXRpb25WZWN0b3JbIDEgXVxuXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50UG9ydDsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3ltYm9sTWFuYWdlciwgZGlhZ3JhbVNlcnZpY2UsIHdpcmluZ1NlcnZpY2UpIHtcblxuICAgIHZhciBnZXREaWFncmFtO1xuXG4gICAgZ2V0RGlhZ3JhbSA9IGZ1bmN0aW9uIChkaWFncmFtRWxlbWVudHMpIHtcblxuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIHN5bWJvbCxcbiAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQsXG5cbiAgICAgICAgICAgIGFsbFBvcnRzQnlJZCxcblxuICAgICAgICAgICAgbWluZVBvcnRzRnJvbUludGVyZmFjZXMsXG5cbiAgICAgICAgICAgIGRpYWdyYW0sXG4gICAgICAgICAgICB3aXJlLFxuXG4gICAgICAgICAgICBEaWFncmFtLFxuICAgICAgICAgICAgRGlhZ3JhbUNvbXBvbmVudCxcbiAgICAgICAgICAgIENvbXBvbmVudFBvcnQsXG4gICAgICAgICAgICBXaXJlO1xuXG4gICAgICAgIERpYWdyYW0gPSByZXF1aXJlKCcuL0RpYWdyYW0nKTtcbiAgICAgICAgRGlhZ3JhbUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vRGlhZ3JhbUNvbXBvbmVudC5qcycpO1xuICAgICAgICBDb21wb25lbnRQb3J0ID0gcmVxdWlyZSgnLi9Db21wb25lbnRQb3J0Jyk7XG4gICAgICAgIFdpcmUgPSByZXF1aXJlKCcuL1dpcmUuanMnKTtcblxuICAgICAgICBhbGxQb3J0c0J5SWQgPSB7fTtcblxuICAgICAgICBtaW5lUG9ydHNGcm9tSW50ZXJmYWNlcyA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb2xsZWN0b3IpIHtcblxuICAgICAgICAgICAgdmFyIG1pblgsXG4gICAgICAgICAgICAgICAgbWF4WCxcbiAgICAgICAgICAgICAgICBwb3J0RGVzY3JpcHRvcnMsXG4gICAgICAgICAgICAgICAgbWVkaWFuLFxuICAgICAgICAgICAgICAgIGFsbEludGVyQ29ubmVjdG9ycyxcbiAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzLFxuICAgICAgICAgICAgICAgIG5ld1BvcnQ7XG5cbiAgICAgICAgICAgIHBvcnREZXNjcmlwdG9ycyA9IHt9O1xuICAgICAgICAgICAgcG9ydEluc3RhbmNlcyA9IFtdO1xuXG4gICAgICAgICAgICBhbGxJbnRlckNvbm5lY3RvcnMgPSBbXTtcblxuICAgICAgICAgICAgcG9ydERlc2NyaXB0b3JzLnRvcCA9IFtdO1xuICAgICAgICAgICAgcG9ydERlc2NyaXB0b3JzLnJpZ2h0ID0gW107XG4gICAgICAgICAgICBwb3J0RGVzY3JpcHRvcnMuYm90dG9tID0gW107XG4gICAgICAgICAgICBwb3J0RGVzY3JpcHRvcnMubGVmdCA9IFtdO1xuXG4gICAgICAgICAgICBtaW5YID0gbnVsbDtcbiAgICAgICAgICAgIG1heFggPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChlbGVtZW50LmludGVyZmFjZXMpKSB7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZWxlbWVudC5pbnRlcmZhY2VzLmNvbm5lY3RvcnMsIGZ1bmN0aW9uIChpbm5lckNvbm5lY3Rvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB4O1xuXG4gICAgICAgICAgICAgICAgICAgIHggPSBpbm5lckNvbm5lY3Rvci5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtaW5YID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5YID0geDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXhYID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhYID0geDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh4IDwgbWluWCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluWCA9IHg7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoeCA+IG1heFgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFggPSB4O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsSW50ZXJDb25uZWN0b3JzLnB1c2goaW5uZXJDb25uZWN0b3IpO1xuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhbGxJbnRlckNvbm5lY3RvcnMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhLnBvc2l0aW9uLnggPiBiLnBvc2l0aW9uLngpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGEucG9zaXRpb24ueCA8IGIucG9zaXRpb24ueCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbWVkaWFuID0gKG1pblggKyBtYXhYKSAvIDI7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goYWxsSW50ZXJDb25uZWN0b3JzLCBmdW5jdGlvbiAoaW5uZXJDb25uZWN0b3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcG9ydFN5bWJvbDtcblxuICAgICAgICAgICAgICAgICAgICBwb3J0U3ltYm9sID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlubmVyQ29ubmVjdG9yLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGlubmVyQ29ubmVjdG9yLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXJDb25uZWN0b3IucG9zaXRpb24ueCA8IG1lZGlhbikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0RGVzY3JpcHRvcnMubGVmdC5wdXNoKHBvcnRTeW1ib2wpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnREZXNjcmlwdG9ycy5yaWdodC5wdXNoKHBvcnRTeW1ib2wpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBuZXdQb3J0ID0gbmV3IENvbXBvbmVudFBvcnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlubmVyQ29ubmVjdG9yLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydFN5bWJvbDogcG9ydFN5bWJvbFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzLnB1c2gobmV3UG9ydCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoY29sbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdG9yWyBpbm5lckNvbm5lY3Rvci5pZCBdID0gbmV3UG9ydDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcG9ydERlc2NyaXB0b3JzOiBwb3J0RGVzY3JpcHRvcnMsXG4gICAgICAgICAgICAgICAgcG9ydEluc3RhbmNlczogcG9ydEluc3RhbmNlc1xuICAgICAgICAgICAgfTtcblxuXG4gICAgICAgIH07XG5cbiAgICAgICAgZGlhZ3JhbSA9IG5ldyBEaWFncmFtKCk7XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoZGlhZ3JhbUVsZW1lbnRzKSkge1xuXG4gICAgICAgICAgICBpID0gMDtcblxuICAgICAgICAgICAgZGlhZ3JhbS5jb25maWcud2lkdGggPSAyMDAwO1xuICAgICAgICAgICAgZGlhZ3JhbS5jb25maWcuaGVpZ2h0ID0gMjAwMDtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRpYWdyYW1FbGVtZW50cy5Db25uZWN0b3IsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcG9ydEluc3RhbmNlO1xuXG4gICAgICAgICAgICAgICAgc3ltYm9sID0gc3ltYm9sTWFuYWdlci5nZXRTeW1ib2woJ3NpbXBsZUNvbm5lY3RvcicpO1xuXG4gICAgICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudCA9IG5ldyBEaWFncmFtQ29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGVsZW1lbnQuaWQsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBlbGVtZW50Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHg6IGVsZW1lbnQucG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICAgICAgeTogZWxlbWVudC5wb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgICAgICB6OiBpLFxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGVYOiAxLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZVk6IDEsXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbDogc3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICBub25TZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25Mb2NrZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHBvcnRJbnN0YW5jZSA9IG5ldyBDb21wb25lbnRQb3J0KHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGVsZW1lbnQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHBvcnRTeW1ib2w6IHN5bWJvbC5wb3J0cy5wMVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYWxsUG9ydHNCeUlkW2VsZW1lbnQuaWRdID0gcG9ydEluc3RhbmNlO1xuXG4gICAgICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudC5yZWdpc3RlclBvcnRJbnN0YW5jZXMoWyBwb3J0SW5zdGFuY2UgXSk7XG4gICAgICAgICAgICAgICAgZGlhZ3JhbS5hZGRDb21wb25lbnQobmV3RGlhZ3JhbUNvbXBvbmVudCk7XG5cbiAgICAgICAgICAgICAgICBpKys7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGlhZ3JhbUVsZW1lbnRzLkFWTUNvbXBvbmVudE1vZGVsLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHBvcnRTdHVmZjtcblxuICAgICAgICAgICAgICAgIHBvcnRTdHVmZiA9IG1pbmVQb3J0c0Zyb21JbnRlcmZhY2VzKGVsZW1lbnQsIGFsbFBvcnRzQnlJZCk7XG5cbiAgICAgICAgICAgICAgICBzeW1ib2wgPSBzeW1ib2xNYW5hZ2VyLm1ha2VCb3hTeW1ib2woZWxlbWVudC5uYW1lLCB7fSwgcG9ydFN0dWZmLnBvcnREZXNjcmlwdG9ycyk7XG5cbiAgICAgICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50ID0gbmV3IERpYWdyYW1Db21wb25lbnQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGVsZW1lbnQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgeDogZWxlbWVudC5wb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgICAgICB5OiBlbGVtZW50LnBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgICAgIHo6IGksXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uOiAwLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZVg6IDEsXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlWTogMSxcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgIG5vblNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbkxvY2tlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudC5yZWdpc3RlclBvcnRJbnN0YW5jZXMocG9ydFN0dWZmLnBvcnRJbnN0YW5jZXMpO1xuICAgICAgICAgICAgICAgIGRpYWdyYW0uYWRkQ29tcG9uZW50KG5ld0RpYWdyYW1Db21wb25lbnQpO1xuXG4gICAgICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRpYWdyYW1FbGVtZW50cy5Db250YWluZXIsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcG9ydFN0dWZmO1xuXG4gICAgICAgICAgICAgICAgcG9ydFN0dWZmID0gbWluZVBvcnRzRnJvbUludGVyZmFjZXMoZWxlbWVudCwgYWxsUG9ydHNCeUlkKTtcblxuICAgICAgICAgICAgICAgIHN5bWJvbCA9IHN5bWJvbE1hbmFnZXIubWFrZUJveFN5bWJvbChlbGVtZW50Lm5hbWUsIHt9LCBwb3J0U3R1ZmYucG9ydERlc2NyaXB0b3JzKTtcblxuICAgICAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQgPSBuZXcgRGlhZ3JhbUNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogZWxlbWVudC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB4OiBlbGVtZW50LnBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgIHk6IGVsZW1lbnQucG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICAgICAgejogaSxcbiAgICAgICAgICAgICAgICAgICAgcm90YXRpb246IDAsXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlWDogMSxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGVZOiAxLFxuICAgICAgICAgICAgICAgICAgICBzeW1ib2w6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgbm9uU2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uTG9ja2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50LnJlZ2lzdGVyUG9ydEluc3RhbmNlcyhwb3J0U3R1ZmYucG9ydEluc3RhbmNlcyk7XG4gICAgICAgICAgICAgICAgZGlhZ3JhbS5hZGRDb21wb25lbnQobmV3RGlhZ3JhbUNvbXBvbmVudCk7XG5cbiAgICAgICAgICAgICAgICBpKys7XG5cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkaWFncmFtRWxlbWVudHMuQ29ubmVjdG9yQ29tcG9zaXRpb24sIGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgc291cmNlUG9ydCxcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb25Qb3J0O1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoZWxlbWVudC5kZXRhaWxzKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZVBvcnQgPSBhbGxQb3J0c0J5SWRbZWxlbWVudC5kZXRhaWxzLnNvdXJjZUlkXTtcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb25Qb3J0ID0gYWxsUG9ydHNCeUlkW2VsZW1lbnQuZGV0YWlscy5kZXN0aW5hdGlvbklkXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlUG9ydCAmJiBkZXN0aW5hdGlvblBvcnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZSA9IG5ldyBXaXJlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQxOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogc291cmNlUG9ydC5wYXJlbnRDb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcnQ6IHNvdXJjZVBvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBkZXN0aW5hdGlvblBvcnQucGFyZW50Q29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0OiBkZXN0aW5hdGlvblBvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5yb3V0ZVdpcmUod2lyZSwgJ0VsYm93Um91dGVyJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpYWdyYW0uYWRkV2lyZSh3aXJlKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRpYWdyYW07XG5cbiAgICB9O1xuXG4gICAgdGhpcy5nZXREaWFncmFtID0gZ2V0RGlhZ3JhbTtcbn07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIERpYWdyYW0gPSBmdW5jdGlvbiAoZGVzY3JpcHRvcikge1xuXG4gICAgYW5ndWxhci5leHRlbmQodGhpcywgZGVzY3JpcHRvcik7XG5cbiAgICB0aGlzLmNvbXBvbmVudHMgPSBbXTtcbiAgICB0aGlzLmNvbXBvbmVudHNCeUlkID0ge307XG4gICAgdGhpcy53aXJlcyA9IFtdO1xuICAgIHRoaXMud2lyZXNCeUlkID0ge307XG4gICAgdGhpcy53aXJlc0J5Q29tcG9uZW50SWQgPSB7fTtcblxuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgZGlzYWxsb3dTZWxlY3Rpb246IGZhbHNlLFxuICAgICAgICB3aWR0aDogNTAwMCxcbiAgICAgICAgaGVpZ2h0OiA1MDAwXG4gICAgfTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHNlbGVjdGVkQ29tcG9uZW50SWRzOiBbXVxuICAgIH07XG5cbn07XG5cbkRpYWdyYW0ucHJvdG90eXBlLmFkZENvbXBvbmVudCA9IGZ1bmN0aW9uIChhRGlhZ3JhbUNvbXBvbmVudCkge1xuXG4gICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoYURpYWdyYW1Db21wb25lbnQpICYmICFhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLmNvbXBvbmVudHNCeUlkW2FEaWFncmFtQ29tcG9uZW50LmlkXSkpIHtcblxuICAgICAgICB0aGlzLmNvbXBvbmVudHNCeUlkW2FEaWFncmFtQ29tcG9uZW50LmlkXSA9IGFEaWFncmFtQ29tcG9uZW50O1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaChhRGlhZ3JhbUNvbXBvbmVudCk7XG5cbiAgICB9XG5cbn07XG5cbkRpYWdyYW0ucHJvdG90eXBlLmFkZFdpcmUgPSBmdW5jdGlvbiAoYVdpcmUpIHtcblxuICAgIHZhciBzZWxmPXRoaXMsXG4gICAgICAgIHJlZ2lzdGVyV2lyZUZvckVuZHM7XG5cbiAgICByZWdpc3RlcldpcmVGb3JFbmRzID0gZnVuY3Rpb24gKHdpcmUpIHtcblxuICAgICAgICB2YXIgY29tcG9uZW50SWQ7XG5cbiAgICAgICAgY29tcG9uZW50SWQgPSB3aXJlLmVuZDEuY29tcG9uZW50LmlkO1xuXG4gICAgICAgIHNlbGYud2lyZXNCeUNvbXBvbmVudElkW2NvbXBvbmVudElkXSA9IHNlbGYud2lyZXNCeUNvbXBvbmVudElkW2NvbXBvbmVudElkXSB8fCBbXTtcblxuICAgICAgICBpZiAoc2VsZi53aXJlc0J5Q29tcG9uZW50SWRbY29tcG9uZW50SWRdLmluZGV4T2Yod2lyZSkgPT09IC0xKSB7XG4gICAgICAgICAgICBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0ucHVzaCh3aXJlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbXBvbmVudElkID0gd2lyZS5lbmQyLmNvbXBvbmVudC5pZDtcblxuICAgICAgICBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0gPSBzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnRJZF0gfHwgW107XG5cbiAgICAgICAgaWYgKHNlbGYud2lyZXNCeUNvbXBvbmVudElkW2NvbXBvbmVudElkXS5pbmRleE9mKHdpcmUpID09PSAtMSkge1xuICAgICAgICAgICAgc2VsZi53aXJlc0J5Q29tcG9uZW50SWRbY29tcG9uZW50SWRdLnB1c2god2lyZSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cblxuICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGFXaXJlKSAmJiAhYW5ndWxhci5pc0RlZmluZWQodGhpcy53aXJlc0J5SWRbYVdpcmUuaWRdKSkge1xuXG4gICAgICAgIHRoaXMud2lyZXNCeUlkW2FXaXJlLmlkXSA9IGFXaXJlO1xuICAgICAgICB0aGlzLndpcmVzLnB1c2goYVdpcmUpO1xuXG4gICAgICAgIHJlZ2lzdGVyV2lyZUZvckVuZHMoYVdpcmUpO1xuXG4gICAgfVxuXG59O1xuXG5EaWFncmFtLnByb3RvdHlwZS5nZXRXaXJlc0ZvckNvbXBvbmVudHMgPSBmdW5jdGlvbiAoY29tcG9uZW50cykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBzZXRPZldpcmVzID0gW107XG5cbiAgICBhbmd1bGFyLmZvckVhY2goY29tcG9uZW50cywgZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzZWxmLndpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnQuaWRdLCBmdW5jdGlvbiAod2lyZSkge1xuXG4gICAgICAgICAgICBpZiAoc2V0T2ZXaXJlcy5pbmRleE9mKHdpcmUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHNldE9mV2lyZXMucHVzaCh3aXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBzZXRPZldpcmVzO1xuXG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRGlhZ3JhbTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2xNYXRyaXggPSByZXF1aXJlKCAnZ2xNYXRyaXgnICk7XG5cbnZhciBEaWFncmFtQ29tcG9uZW50ID0gZnVuY3Rpb24gKCBkZXNjcmlwdG9yICkge1xuXG4gICAgaWYgKCAhYW5ndWxhci5pc09iamVjdCggZGVzY3JpcHRvci5zeW1ib2wgKSApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTm8gc3ltYm9sIGZvdW5kIGZvciBjb21wb25lbnQgJyArIHRoaXMuaWQgKTtcbiAgICB9XG5cbiAgICBhbmd1bGFyLmV4dGVuZCggdGhpcywgZGVzY3JpcHRvciApO1xuXG4gICAgLy8gRm9yIHJvdGF0aW9uXG4gICAgdGhpcy5fY2VudGVyT2Zmc2V0ID0gWyB0aGlzLnN5bWJvbC53aWR0aCAvIDIsIHRoaXMuc3ltYm9sLmhlaWdodCAvIDIgXTtcblxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuaXNJblZpZXdQb3J0ID0gZnVuY3Rpb24gKCB2aWV3UG9ydCwgcGFkZGluZyApIHtcblxuICAgIC8vVE9ETzogY291bnQgd2lkdGggYW5kIGhlaWdodCBmb3Igb3JpZW50YXRpb25cbiAgICBwYWRkaW5nID0gcGFkZGluZyB8fCB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgYW5ndWxhci5pc09iamVjdCggdmlld1BvcnQgKSAmJlxuICAgICAgICB0aGlzLnggKyB0aGlzLnN5bWJvbC53aWR0aCA+PSAoIHZpZXdQb3J0LmxlZnQgKyBwYWRkaW5nLnggKSAmJlxuICAgICAgICB0aGlzLnggPD0gKCB2aWV3UG9ydC5yaWdodCAtIHBhZGRpbmcueCApICYmXG4gICAgICAgIHRoaXMueSArIHRoaXMuc3ltYm9sLmhlaWdodCA+PSAoIHZpZXdQb3J0LnRvcCArIHBhZGRpbmcueSApICYmXG4gICAgICAgIHRoaXMueSA8PSAoIHZpZXdQb3J0LmJvdHRvbSAtIHBhZGRpbmcueSApICk7XG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1hdGlvbk1hdHJpeCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICggIWFuZ3VsYXIuaXNBcnJheSggdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeCApICkge1xuICAgICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXg7XG5cbn07XG5cblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0U1ZHVHJhbnNmb3JtYXRpb25NYXRyaXggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoICFhbmd1bGFyLmlzQXJyYXkoIHRoaXMuc3ZnVHJhbnNmb3JtYXRpb25NYXRyaXggKSApIHtcbiAgICAgICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnN2Z1RyYW5zZm9ybWF0aW9uTWF0cml4O1xuXG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5nZXRTVkdUcmFuc2Zvcm1hdGlvblN0cmluZyA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciB0cmFuc01hdHJpeCA9IHRoaXMuZ2V0U1ZHVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcblxuICAgIHJldHVybiB0cmFuc01hdHJpeC5qb2luKCAnLCAnICk7XG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciByb3RhdGlvblJhZCxcbiAgICAgICAgLy9zaW5BLCBjb3NBLFxuICAgICAgICB0cmFuc2xhdGlvbixcbiAgICAgICAgdHJhbnNmb3JtTWF0MyxcbiAgICAgICAgcmVzdWx0O1xuXG4gICAgaWYgKCBhbmd1bGFyLmlzTnVtYmVyKCB0aGlzLnJvdGF0aW9uICkgJiZcbiAgICAgICAgYW5ndWxhci5pc051bWJlciggdGhpcy54ICksXG4gICAgICAgIGFuZ3VsYXIuaXNOdW1iZXIoIHRoaXMueSApICkge1xuXG4gICAgICAgIHJvdGF0aW9uUmFkID0gdGhpcy5yb3RhdGlvbiAvIDE4MCAqIE1hdGguUEk7XG5cbiAgICAgICAgdHJhbnNmb3JtTWF0MyA9IGdsTWF0cml4Lm1hdDMuY3JlYXRlKCk7XG5cbiAgICAgICAgdHJhbnNsYXRpb24gPSBnbE1hdHJpeC52ZWMyLmNyZWF0ZSgpO1xuXG4gICAgICAgIGdsTWF0cml4LnZlYzIuc2V0KCB0cmFuc2xhdGlvbiwgdGhpcy54ICsgdGhpcy5fY2VudGVyT2Zmc2V0WzBdLCB0aGlzLnkgKyB0aGlzLl9jZW50ZXJPZmZzZXRbMV0pO1xuXG4gICAgICAgIGdsTWF0cml4Lm1hdDMudHJhbnNsYXRlKFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0MyxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICB0cmFuc2xhdGlvblxuICAgICAgICApO1xuXG4gICAgICAgIGdsTWF0cml4Lm1hdDMucm90YXRlKFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0MyxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICByb3RhdGlvblJhZFxuICAgICAgICApO1xuXG4gICAgICAgIGdsTWF0cml4LnZlYzIuc2V0KCB0cmFuc2xhdGlvbiwgLXRoaXMuX2NlbnRlck9mZnNldFswXSwgLXRoaXMuX2NlbnRlck9mZnNldFsxXSk7XG5cbiAgICAgICAgZ2xNYXRyaXgubWF0My50cmFuc2xhdGUoXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0MyxcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeCA9IHRyYW5zZm9ybU1hdDM7XG5cbiAgICAgICAgdGhpcy5zdmdUcmFuc2Zvcm1hdGlvbk1hdHJpeCA9IFtcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDNbIDAgXSxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDNbIDEgXSxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDNbIDMgXSxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDNbIDQgXSxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDNbIDYgXSxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDNbIDcgXVxuICAgICAgICBdO1xuXG4gICAgICAgIHJlc3VsdCA9IHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXg7XG5cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuXG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgfTtcblxufTtcblxuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uICggeCwgeSApIHtcblxuICAgIGlmICggYW5ndWxhci5pc051bWJlciggeCApICYmIGFuZ3VsYXIuaXNOdW1iZXIoIHkgKSApIHtcblxuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuXG4gICAgICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ0Nvb3JkaW5hdGVzIG11c3QgYmUgbnVtYmVycyEnICk7XG4gICAgfVxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24gKCBhbmdsZSApIHtcblxuICAgIGlmICggYW5ndWxhci5pc051bWJlciggYW5nbGUgKSApIHtcblxuICAgICAgICB0aGlzLnJvdGF0aW9uICs9IGFuZ2xlO1xuXG4gICAgICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ0FuZ2xlIG11c3QgYmUgbnVtYmVyIScgKTtcbiAgICB9XG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5yZWdpc3RlclBvcnRJbnN0YW5jZXMgPSBmdW5jdGlvbiAoIG5ld1BvcnRzICkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5wb3J0SW5zdGFuY2VzID0gdGhpcy5wb3J0SW5zdGFuY2VzIHx8IFtdO1xuXG4gICAgYW5ndWxhci5mb3JFYWNoKCBuZXdQb3J0cywgZnVuY3Rpb24gKCBuZXdQb3J0ICkge1xuXG4gICAgICAgIG5ld1BvcnQucGFyZW50Q29tcG9uZW50ID0gc2VsZjtcbiAgICAgICAgc2VsZi5wb3J0SW5zdGFuY2VzLnB1c2goIG5ld1BvcnQgKTtcblxuICAgIH0gKTtcbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmdldFRyYW5zZm9ybWVkRGltZW5zaW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgdmFyIHdpZHRoLCBoZWlnaHQ7XG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5sb2NhbFRvR2xvYmFsID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCAhdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeCApIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeCA9IHRoaXMuZ2V0VHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcbiAgICB9XG5cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdyYW1Db21wb25lbnQ7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3ltYm9sTWFuYWdlciwgZGlhZ3JhbVNlcnZpY2UsIHdpcmluZ1NlcnZpY2UpIHtcblxuICAgIHZhciBnZXREaWFncmFtO1xuXG4gICAgZ2V0RGlhZ3JhbSA9IGZ1bmN0aW9uIChjb3VudE9mQm94ZXMsIGNvdW50T2ZXaXJlcywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgc3ltYm9sVHlwZXMpIHtcblxuICAgICAgICB2YXIgaSwgaWQsXG4gICAgICAgICAgICBjb3VudE9mVHlwZXMsXG4gICAgICAgICAgICBzeW1ib2wsXG4gICAgICAgICAgICB0eXBlSWQsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgeCxcbiAgICAgICAgICAgIHksXG4gICAgICAgICAgICBzeW1ib2xUeXBlSWRzLFxuICAgICAgICAgICAgY29tcG9uZW50MSxcbiAgICAgICAgICAgIGNvbXBvbmVudDIsXG4gICAgICAgICAgICBwb3J0MSxcbiAgICAgICAgICAgIHBvcnQyLFxuICAgICAgICAgICAgY3JlYXRlZFBvcnRzLFxuICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudCxcblxuICAgICAgICAgICAgcG9ydENyZWF0b3IsXG5cbiAgICAgICAgICAgIGRpYWdyYW0sXG4gICAgICAgICAgICB3aXJlLFxuXG4gICAgICAgICAgICBEaWFncmFtLFxuICAgICAgICAgICAgRGlhZ3JhbUNvbXBvbmVudCxcbiAgICAgICAgICAgIENvbXBvbmVudFBvcnQsXG4gICAgICAgICAgICBXaXJlO1xuXG4gICAgICAgIERpYWdyYW0gPSByZXF1aXJlKCcuL0RpYWdyYW0nKTtcbiAgICAgICAgRGlhZ3JhbUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vRGlhZ3JhbUNvbXBvbmVudC5qcycpO1xuICAgICAgICBDb21wb25lbnRQb3J0ID0gcmVxdWlyZSgnLi9Db21wb25lbnRQb3J0Jyk7XG4gICAgICAgIFdpcmUgPSByZXF1aXJlKCcuL1dpcmUuanMnKTtcblxuICAgICAgICBkaWFncmFtID0gbmV3IERpYWdyYW0oKTtcblxuICAgICAgICBwb3J0Q3JlYXRvciA9IGZ1bmN0aW9uIChjb21wb25lbnRJZCwgcG9ydHMpIHtcblxuICAgICAgICAgICAgdmFyIHBvcnRJbnN0YW5jZSxcbiAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzLFxuICAgICAgICAgICAgICAgIHBvcnRNYXBwaW5nO1xuXG4gICAgICAgICAgICBwb3J0SW5zdGFuY2VzID0gW107XG4gICAgICAgICAgICBwb3J0TWFwcGluZyA9IHt9O1xuXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocG9ydHMsIGZ1bmN0aW9uIChwb3J0KSB7XG5cbiAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2UgPSBuZXcgQ29tcG9uZW50UG9ydCh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCArICdfJyArIHBvcnQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHBvcnRTeW1ib2w6IHBvcnRcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHBvcnRJbnN0YW5jZXMucHVzaChwb3J0SW5zdGFuY2UpO1xuXG4gICAgICAgICAgICAgICAgcG9ydE1hcHBpbmdbIHBvcnQuaWQgXSA9IHBvcnRJbnN0YW5jZS5pZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBvcnRJbnN0YW5jZXM6IHBvcnRJbnN0YW5jZXMsXG4gICAgICAgICAgICAgICAgcG9ydE1hcHBpbmc6IHBvcnRNYXBwaW5nXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgc3ltYm9sVHlwZUlkcyA9IE9iamVjdC5rZXlzKHN5bWJvbFR5cGVzKTtcblxuICAgICAgICBjb3VudE9mVHlwZXMgPSBzeW1ib2xUeXBlSWRzLmxlbmd0aDtcblxuICAgICAgICBkaWFncmFtLmNvbmZpZy53aWR0aCA9IGNhbnZhc1dpZHRoO1xuICAgICAgICBkaWFncmFtLmNvbmZpZy5oZWlnaHQgPSBjYW52YXNIZWlnaHQ7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvdW50T2ZCb3hlczsgaSsrKSB7XG5cbiAgICAgICAgICAgIHR5cGVJZCA9IHN5bWJvbFR5cGVJZHNbIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvdW50T2ZUeXBlcykgXTtcbiAgICAgICAgICAgIHR5cGUgPSBzeW1ib2xUeXBlc1sgdHlwZUlkIF07XG5cbiAgICAgICAgICAgIHggPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAoIGNhbnZhc1dpZHRoIC0gMSApKTtcbiAgICAgICAgICAgIHkgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAoIGNhbnZhc0hlaWdodCAtIDEgKSk7XG5cbiAgICAgICAgICAgIGlkID0gJ2NvbXBvbmVudF8nICsgdHlwZUlkICsgJ18nICsgaTtcblxuICAgICAgICAgICAgc3ltYm9sID0gc3ltYm9sTWFuYWdlci5nZXRTeW1ib2wodHlwZUlkKTtcblxuICAgICAgICAgICAgY3JlYXRlZFBvcnRzID0gcG9ydENyZWF0b3IoaWQsIHN5bWJvbC5wb3J0cyk7XG5cbiAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQgPSBuZXcgRGlhZ3JhbUNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0eXBlLmxhYmVsUHJlZml4ICsgaSxcbiAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgejogaSxcbiAgICAgICAgICAgICAgICByb3RhdGlvbjogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNDApICogOTAsXG4gICAgICAgICAgICAgICAgc2NhbGVYOiAxLCAvL1sxLCAtMV1bTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKV0sXG4gICAgICAgICAgICAgICAgc2NhbGVZOiAxLCAvL1sxLCAtMV1bTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKV0sXG4gICAgICAgICAgICAgICAgc3ltYm9sOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgbm9uU2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbG9jYXRpb25Mb2NrZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQucmVnaXN0ZXJQb3J0SW5zdGFuY2VzKGNyZWF0ZWRQb3J0cy5wb3J0SW5zdGFuY2VzKTtcblxuICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudC51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuXG4gICAgICAgICAgICBkaWFncmFtLmFkZENvbXBvbmVudChuZXdEaWFncmFtQ29tcG9uZW50KTtcblxuXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnRPZldpcmVzOyBpKyspIHtcblxuICAgICAgICAgICAgaWQgPSAnd2lyZV8nICsgaTtcblxuICAgICAgICAgICAgY29tcG9uZW50MSA9IGRpYWdyYW0uY29tcG9uZW50cy5nZXRSYW5kb21FbGVtZW50KCk7XG5cbiAgICAgICAgICAgIHBvcnQxID0gY29tcG9uZW50MS5wb3J0SW5zdGFuY2VzLmdldFJhbmRvbUVsZW1lbnQoKTtcbiAgICAgICAgICAgIHBvcnQyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB3aGlsZSAoIWFuZ3VsYXIuaXNEZWZpbmVkKHBvcnQyKSB8fCBwb3J0MSA9PT0gcG9ydDIpIHtcblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudDIgPSBkaWFncmFtLmNvbXBvbmVudHMuZ2V0UmFuZG9tRWxlbWVudCgpO1xuICAgICAgICAgICAgICAgIHBvcnQyID0gY29tcG9uZW50Mi5wb3J0SW5zdGFuY2VzLmdldFJhbmRvbUVsZW1lbnQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2lyZSA9IG5ldyBXaXJlKHtcbiAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgZW5kMToge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudDEsXG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6IHBvcnQxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbmQyOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50MixcbiAgICAgICAgICAgICAgICAgICAgcG9ydDogcG9ydDJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgd2lyaW5nU2VydmljZS5yb3V0ZVdpcmUod2lyZSwgJ0VsYm93Um91dGVyJyk7XG5cbiAgICAgICAgICAgIGRpYWdyYW0uYWRkV2lyZSh3aXJlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRpYWdyYW07XG5cbiAgICB9O1xuXG4gICAgdGhpcy5nZXREaWFncmFtID0gZ2V0RGlhZ3JhbTtcbn07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFdpcmUgPSBmdW5jdGlvbiAoIGRlc2NyaXB0b3IgKSB7XG5cbiAgICBhbmd1bGFyLmV4dGVuZCggdGhpcywgZGVzY3JpcHRvciApO1xuXG4gICAgdGhpcy5zZWdtZW50cyA9IFtdO1xuXG59O1xuXG5XaXJlLnByb3RvdHlwZS5pc0luVmlld1BvcnQgPSBmdW5jdGlvbiAoIHZpZXdQb3J0LCBwYWRkaW5nICkge1xuXG4gICAgdmFyIGosXG4gICAgICAgIHNob3VsZEJlVmlzaWJsZSxcbiAgICAgICAgc2VnbWVudDtcblxuICAgIHBhZGRpbmcgPSBwYWRkaW5nIHx8IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBzaG91bGRCZVZpc2libGUgPSBmYWxzZTtcblxuICAgIGlmICggdGhpcy5yb3V0ZXJUeXBlID09PSAnRWxib3dSb3V0ZXInICkge1xuXG4gICAgICAgIGlmICggYW5ndWxhci5pc0FycmF5KCB0aGlzLnNlZ21lbnRzICkgKSB7XG5cbiAgICAgICAgICAgIGZvciAoIGogPSAwOyBqIDwgdGhpcy5zZWdtZW50cy5sZW5ndGggJiYgIXNob3VsZEJlVmlzaWJsZTsgaisrICkge1xuXG4gICAgICAgICAgICAgICAgc2VnbWVudCA9IHRoaXMuc2VnbWVudHNbIGogXTtcblxuICAgICAgICAgICAgICAgIGlmICggc2VnbWVudC5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJyApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIHNlZ21lbnQueDEgPj0gKCB2aWV3UG9ydC5sZWZ0ICsgcGFkZGluZy54ICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQueDEgPD0gKCB2aWV3UG9ydC5yaWdodCAtIHBhZGRpbmcueCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIHNlZ21lbnQueTEgPj0gKCB2aWV3UG9ydC50b3AgKyBwYWRkaW5nLnkgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudC55MSA8PSAoIHZpZXdQb3J0LmJvdHRvbSAtIHBhZGRpbmcueSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2hvdWxkQmVWaXNpYmxlO1xuXG59O1xuXG5XaXJlLnByb3RvdHlwZS5nZXRFbmRQb3NpdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgcG9ydDFQb3NpdGlvbixcbiAgICAgICAgcG9ydDJQb3NpdGlvbjtcblxuICAgIHBvcnQxUG9zaXRpb24gPSB0aGlzLmVuZDEucG9ydC5nZXRHcmlkUG9zaXRpb24oKTtcbiAgICBwb3J0MlBvc2l0aW9uID0gdGhpcy5lbmQyLnBvcnQuZ2V0R3JpZFBvc2l0aW9uKCk7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGVuZDE6IHBvcnQxUG9zaXRpb24sXG4gICAgICAgIGVuZDI6IHBvcnQyUG9zaXRpb25cblxuICAgIH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gV2lyZTsiLCIvKmdsb2JhbHMgYW5ndWxhciAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kaWFncmFtU2VydmljZScsIFtcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9sU2VydmljZXMnLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5vcGVyYXRpb25zTWFuYWdlcidcbl0pXG4gICAgLnNlcnZpY2UoJ2RpYWdyYW1TZXJ2aWNlJywgW1xuICAgICAgICAnJHEnLFxuICAgICAgICAnJHRpbWVvdXQnLFxuICAgICAgICAnc3ltYm9sTWFuYWdlcicsXG4gICAgICAgICckc3RhdGVQYXJhbXMnLFxuICAgICAgICAnd2lyaW5nU2VydmljZScsXG4gICAgICAgICdvcGVyYXRpb25zTWFuYWdlcicsXG4gICAgICAgIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQsIHN5bWJvbE1hbmFnZXIsICRzdGF0ZVBhcmFtcywgd2lyaW5nU2VydmljZS8qLCBvcGVyYXRpb25zTWFuYWdlciovKSB7XG5cbiAgICAgICAgICAgIHZhclxuICAgICAgICAgICAgICAgIHNlbGYgPSB0aGlzLFxuXG4gICAgICAgICAgICAgICAgZGlhZ3JhbXMsXG5cbiAgICAgICAgICAgICAgICBzeW1ib2xUeXBlcyxcblxuICAgICAgICAgICAgICAgIER1bW15RGlhZ3JhbUdlbmVyYXRvcixcbiAgICAgICAgICAgICAgICBkdW1teURpYWdyYW1HZW5lcmF0b3IsXG5cbiAgICAgICAgICAgICAgICBDeVBoeURpYWdyYW1QYXJzZXIsXG4gICAgICAgICAgICAgICAgY3lQaHlEaWFncmFtUGFyc2VyLFxuXG4gICAgICAgICAgICAgICAgRGlhZ3JhbUNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICBDb21wb25lbnRQb3J0LFxuICAgICAgICAgICAgICAgIFdpcmU7XG5cbiAgICAgICAgICAgIGRpYWdyYW1zID0ge307XG5cbiAgICAgICAgICAgIER1bW15RGlhZ3JhbUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9EdW1teURpYWdyYW1HZW5lcmF0b3IuanMnKTtcbiAgICAgICAgICAgIEN5UGh5RGlhZ3JhbVBhcnNlciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DeVBoeURpYWdyYW1QYXJzZXIuanMnKTtcblxuICAgICAgICAgICAgRGlhZ3JhbUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9EaWFncmFtQ29tcG9uZW50LmpzJyk7XG4gICAgICAgICAgICBDb21wb25lbnRQb3J0ID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NvbXBvbmVudFBvcnQnKTtcbiAgICAgICAgICAgIFdpcmUgPSByZXF1aXJlKCcuL2NsYXNzZXMvV2lyZS5qcycpO1xuXG4gICAgICAgICAgICBkdW1teURpYWdyYW1HZW5lcmF0b3IgPSBuZXcgRHVtbXlEaWFncmFtR2VuZXJhdG9yKHN5bWJvbE1hbmFnZXIsIHNlbGYsIHdpcmluZ1NlcnZpY2UpO1xuICAgICAgICAgICAgY3lQaHlEaWFncmFtUGFyc2VyID0gbmV3IEN5UGh5RGlhZ3JhbVBhcnNlcihzeW1ib2xNYW5hZ2VyLCBzZWxmLCB3aXJpbmdTZXJ2aWNlKTtcblxuICAgICAgICAgICAgc3ltYm9sVHlwZXMgPSBzeW1ib2xNYW5hZ2VyLmdldEF2YWlsYWJsZVN5bWJvbHMoKTtcblxuXG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCA9IGZ1bmN0aW9uIChkaWFncmFtSWQsIGFEaWFncmFtQ29tcG9uZW50KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIGRpYWdyYW0gPSBkaWFncmFtc1tkaWFncmFtSWRdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoZGlhZ3JhbSkpIHtcblxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtLmFkZENvbXBvbmVudChhRGlhZ3JhbUNvbXBvbmVudCk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuYWRkV2lyZSA9IGZ1bmN0aW9uIChkaWFncmFtSWQsIGFXaXJlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIGRpYWdyYW0gPSBkaWFncmFtc1tkaWFncmFtSWRdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoZGlhZ3JhbSkpIHtcblxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtLmFkZFdpcmUoYVdpcmUpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldFdpcmVzRm9yQ29tcG9uZW50cyA9IGZ1bmN0aW9uIChkaWFncmFtSWQsIGNvbXBvbmVudHMpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWFncmFtO1xuXG4gICAgICAgICAgICAgICAgZGlhZ3JhbSA9IGRpYWdyYW1zW2RpYWdyYW1JZF07XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChkaWFncmFtKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW0uZ2V0V2lyZXNGb3JDb21wb25lbnRzKGNvbXBvbmVudHMpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZURpYWdyYW1Gcm9tQ3lQaHlFbGVtZW50cyA9IGZ1bmN0aW9uKGRpYWdyYW1JZCwgZGlhZ3JhbUVsZW1lbnRzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIGlmIChkaWFncmFtSWQgJiYgYW5ndWxhci5pc09iamVjdChkaWFncmFtRWxlbWVudHMpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbSA9IGN5UGh5RGlhZ3JhbVBhcnNlci5nZXREaWFncmFtKGRpYWdyYW1FbGVtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW0uaWQgPSBkaWFncmFtSWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbXNbZGlhZ3JhbUlkXSA9IGRpYWdyYW07XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXREaWFncmFtID0gZnVuY3Rpb24gKGRpYWdyYW1JZCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpYWdyYW07XG5cbiAgICAgICAgICAgICAgICBpZiAoZGlhZ3JhbUlkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbSA9IGRpYWdyYW1zW2RpYWdyYW1JZF07XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5hZGREdW1teURpYWdyYW0gPSBmdW5jdGlvbiAoZGlhZ3JhbUlkLCBjb3VudE9mQm94ZXMsIGNvdW50T2ZXaXJlcywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGR1bW15RGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIGlmIChkaWFncmFtSWQpIHtcblxuICAgICAgICAgICAgICAgICAgICBkdW1teURpYWdyYW0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgZHVtbXlEaWFncmFtR2VuZXJhdG9yLmdldERpYWdyYW0oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRPZkJveGVzLCBjb3VudE9mV2lyZXMsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIHN5bWJvbFR5cGVzXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGR1bW15RGlhZ3JhbS5pZCA9IGRpYWdyYW1JZDtcblxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtc1tkaWFncmFtSWRdID0gZHVtbXlEaWFncmFtO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGR1bW15RGlhZ3JhbTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRIaWdoZXN0WiA9IGZ1bmN0aW9uIChkaWFncmFtSWQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICAgIHo7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgIGRpYWdyYW0gPSBkaWFncmFtc1tkaWFncmFtSWRdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoZGlhZ3JhbSkpIHtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZGlhZ3JhbS5jb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IGRpYWdyYW0uY29tcG9uZW50c1tpXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihjb21wb25lbnQueikpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc05hTih6KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6ID0gY29tcG9uZW50Lno7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeiA8IGNvbXBvbmVudC56KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6ID0gY29tcG9uZW50Lno7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKHopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB6ID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB6O1xuXG4gICAgICAgICAgICB9O1xuXG4vLyAgICAgICAgICAgIG9wZXJhdGlvbnNNYW5hZ2VyLnJlZ2lzdGVyT3BlcmF0aW9uKHtcbi8vICAgICAgICAgICAgICAgIGlkOiAnc2V0Q29tcG9uZW50UG9zaXRpb24nLFxuLy8gICAgICAgICAgICAgICAgY29tbWl0OiBmdW5jdGlvbiAoY29tcG9uZW50LCB4LCB5KSB7XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGNvbXBvbmVudCkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNldFBvc2l0aW9uKHgsIHkpO1xuLy8gICAgICAgICAgICAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAvL3RoaXMuZ2VuZXJhdGVEdW1teURpYWdyYW0oMTAwMCwgMjAwLCA1MDAwLCA1MDAwKTtcbiAgICAgICAgICAgIC8vdGhpcy5nZW5lcmF0ZUR1bW15RGlhZ3JhbSgxMDAwLCAyMDAwLCAxMDAwMCwgMTAwMDApO1xuICAgICAgICAgICAgLy90aGlzLmdlbmVyYXRlRHVtbXlEaWFncmFtKDEwLCA1LCAxMjAwLCAxMjAwKTtcbiAgICAgICAgICAgIC8vdGhpcy5nZW5lcmF0ZUR1bW15RGlhZ3JhbSggMTAwLCA1MCwgMzAwMCwgMzAwMCApO1xuXG4gICAgICAgIH1cbiAgICBdKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ3JpZFNlcnZpY2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmdyaWRTZXJ2aWNlJywgW10gKTtcblxuZ3JpZFNlcnZpY2VzTW9kdWxlLnNlcnZpY2UoICdncmlkU2VydmljZScsIFsgJyRsb2cnLCAnJHJvb3RTY29wZScsICckdGltZW91dCcsXG4gICAgZnVuY3Rpb24gKCAkbG9nLCAkcm9vdFNjb3BlLCAkdGltZW91dCApIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG5cbiAgICAgICAgICAgIGdyaWRzID0ge30sXG5cbiAgICAgICAgICAgIG51bWJlck9mQ2hhbmdlc0FsbG93ZWRJbk9uZUN5Y2xlID0gMSxcbiAgICAgICAgICAgIHJlY2FsY3VsYXRlQ3ljbGVEZWxheSA9IDE1LFxuICAgICAgICAgICAgdmlld1BvcnRQYWRkaW5nID0ge1xuICAgICAgICAgICAgICAgIHg6IC02MDAsXG4gICAgICAgICAgICAgICAgeTogLTYwMFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMsXG4gICAgICAgICAgICBfcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMsXG4gICAgICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVXaXJlcztcblxuICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVXaXJlcyA9IGZ1bmN0aW9uICggZ3JpZCApIHtcblxuICAgICAgICAgICAgdmFyIGluZGV4LFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgd2lyZTtcblxuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZ3JpZC53aXJlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgd2lyZSA9IGdyaWQud2lyZXNbaV07XG5cbiAgICAgICAgICAgICAgICBpbmRleCA9IGdyaWQudmlzaWJsZVdpcmVzLmluZGV4T2Yod2lyZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAod2lyZS5pc0luVmlld1BvcnQoZ3JpZC52aWV3UG9ydCwgdmlld1BvcnRQYWRkaW5nKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQudmlzaWJsZVdpcmVzLnB1c2god2lyZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQudmlzaWJsZVdpcmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyRsb2cuZGVidWcoICdOdW1iZXIgb2YgdmlzaWJsZSB3aXJlczogJyArIGdyaWQudmlzaWJsZVdpcmVzLmxlbmd0aCApO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMgPSBmdW5jdGlvbiggZ3JpZCwgc3RhcnRJbmRleCApIHtcblxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShncmlkLmNvbXBvbmVudHMpICYmIGFuZ3VsYXIuaXNBcnJheShncmlkLndpcmVzKSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKGdyaWQucmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNQcm9taXNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCR0aW1lb3V0LmNhbmNlbChncmlkLnJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUHJvbWlzZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdoYWQgdG8ga2lsbCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBncmlkLnJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUHJvbWlzZSA9ICR0aW1lb3V0KFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMoZ3JpZCwgc3RhcnRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgcmVjYWxjdWxhdGVDeWNsZURlbGF5XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBfcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMgPSBmdW5jdGlvbiAoIGdyaWQsIHN0YXJ0SW5kZXggKSB7XG5cbiAgICAgICAgICAgIHZhciBpLCBjb21wb25lbnQsXG5cbiAgICAgICAgICAgICAgICBjb3VudE9mQ2hhbmdlcyA9IDAsXG4gICAgICAgICAgICAgICAgY2hhbmdlc0xpbWl0UmVhY2hlZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIGluZGV4O1xuXG4gICAgICAgICAgICBncmlkLmluc2lkZVZpc2libGVEaWFncmFtQ29tcG9uZW50c1JlY2FsY3VsYXRlID0gdHJ1ZTtcblxuXG4gICAgICAgICAgICBpZiAoIWNoYW5nZXNMaW1pdFJlYWNoZWQpIHtcbiAgICAgICAgICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVXaXJlcyggZ3JpZCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCB8fCAwO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSBzdGFydEluZGV4OyBpPCBncmlkLmNvbXBvbmVudHMubGVuZ3RoICYmIGNoYW5nZXNMaW1pdFJlYWNoZWQgPT09IGZhbHNlOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IGdyaWQuY29tcG9uZW50c1tpXTtcblxuXG4gICAgICAgICAgICAgICAgaW5kZXggPSBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cy5pbmRleE9mKCBjb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgIGlmICggY29tcG9uZW50LmlzSW5WaWV3UG9ydCggZ3JpZC52aWV3UG9ydCwgdmlld1BvcnRQYWRkaW5nICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpbmRleCA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cy5wdXNoKCBjb21wb25lbnQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50T2ZDaGFuZ2VzKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggaW5kZXggPiAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY291bnRPZkNoYW5nZXMrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICggY291bnRPZkNoYW5nZXMgPj0gbnVtYmVyT2ZDaGFuZ2VzQWxsb3dlZEluT25lQ3ljbGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZXNMaW1pdFJlYWNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyRsb2cuZGVidWcoICdOdW1iZXIgb2YgY2hhbmdlcyBjb21wYXJlZCB0byBwcmV2aW91cyBkaWFncmFtIHN0YXRlOicsIGNvdW50T2ZDaGFuZ2VzICk7XG5cbiAgICAgICAgICAgIGlmICggIWNoYW5nZXNMaW1pdFJlYWNoZWQgKSB7XG5cbiAgICAgICAgICAgICAgICBzZWxmLnJlb3JkZXJWaXNpYmxlQ29tcG9uZW50cyggZ3JpZC5pZCApO1xuXG4gICAgICAgICAgICAgICAgZ3JpZC5pbnNpZGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNSZWNhbGN1bGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFncmlkLmluaXRpYWxpemVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5pbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0dyaWRJbml0aWFsaXplZCcsIGdyaWQuaWQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKGdyaWQsIGkpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmludmFsaWRhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMgPSBmdW5jdGlvbiAoIGdyaWRJZCApIHtcblxuICAgICAgICAgICAgdmFyIGdyaWQ7XG5cbiAgICAgICAgICAgIGdyaWQgPSBncmlkc1sgZ3JpZElkIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0RlZmluZWQoIGdyaWQgKSApIHtcblxuICAgICAgICAgICAgICAgIGlmICggIWdyaWQuaW5zaWRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUmVjYWxjdWxhdGUgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMoZ3JpZCk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuY3JlYXRlR3JpZCA9IGZ1bmN0aW9uICggaWQsIGRpYWdyYW0gKSB7XG5cbiAgICAgICAgICAgIHZhciBncmlkO1xuXG4gICAgICAgICAgICBpZiAoICFhbmd1bGFyLmlzRGVmaW5lZCggZ3JpZHNbIGlkIF0gKSApIHtcbiAgICAgICAgICAgICAgICBncmlkID0gZ3JpZHNbIGlkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czogZGlhZ3JhbS5jb21wb25lbnRzLFxuICAgICAgICAgICAgICAgICAgICB2aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB3aXJlczogZGlhZ3JhbS53aXJlcyxcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZVdpcmVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgdmlld1BvcnQ6IHt9LFxuICAgICAgICAgICAgICAgICAgICBpbnNpZGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNSZWNhbGN1bGF0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxpemVkOiBmYWxzZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93ICggJ0dyaWQgd2FzIGFscmVhZHkgZGVmaW5lZCEnLCBpZCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLFxuICAgICAgICAgICAgICAgIHdpcmVzOiBncmlkLnZpc2libGVXaXJlc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuc2V0VmlzaWJsZUFyZWEgPSBmdW5jdGlvbiAoIGdyaWRJZCwgdmlld1BvcnQgKSB7XG4gICAgICAgICAgICB2YXIgZ3JpZCA9IGdyaWRzWyBncmlkSWQgXTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzRGVmaW5lZCggZ3JpZCApICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzRGVmaW5lZCggdmlld1BvcnQgKSApIHtcblxuICAgICAgICAgICAgICAgICAgICBncmlkLnZpZXdQb3J0ID0gdmlld1BvcnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnZhbGlkYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKCBncmlkLmlkICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgKCAnR3JpZCB3YXMgbm90IGRlZmluZWQhJywgZ3JpZElkICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlb3JkZXJWaXNpYmxlQ29tcG9uZW50cyA9IGZ1bmN0aW9uICggZ3JpZElkICkge1xuXG4gICAgICAgICAgICB2YXIgZ3JpZCA9IGdyaWRzWyBncmlkSWQgXTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzRGVmaW5lZCggZ3JpZCApICkge1xuICAgICAgICAgICAgICAgIGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLnNvcnQoIGZ1bmN0aW9uICggYSwgYiApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGEueiA+IGIueiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBhLnogPCBiLnogKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcblxuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgfVxuXSApO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBvcGVyYXRpb25zTWFuYWdlck1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5vcGVyYXRpb25zTWFuYWdlcicsIFtdKTtcblxub3BlcmF0aW9uc01hbmFnZXJNb2R1bGUucHJvdmlkZXIoJ29wZXJhdGlvbnNNYW5hZ2VyJywgZnVuY3Rpb24gT3BlcmF0aW9uc01hbmFnZXJQcm92aWRlcigpIHtcbiAgICB2YXIgc2VsZixcbiAgICAgICAgYXZhaWxhYmxlT3BlcmF0aW9ucztcblxuICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgYXZhaWxhYmxlT3BlcmF0aW9ucyA9IHt9O1xuXG4gICAgdGhpcy5yZWdpc3Rlck9wZXJhdGlvbiA9IGZ1bmN0aW9uIChvcGVyYXRpb25EZXNjcmlwdG9yKSB7XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3Qob3BlcmF0aW9uRGVzY3JpcHRvcikgJiZcbiAgICAgICAgICAgIGFuZ3VsYXIuaXNTdHJpbmcob3BlcmF0aW9uRGVzY3JpcHRvci5pZCkpIHtcbiAgICAgICAgICAgIGF2YWlsYWJsZU9wZXJhdGlvbnNbIG9wZXJhdGlvbkRlc2NyaXB0b3IuaWQgXSA9IG9wZXJhdGlvbkRlc2NyaXB0b3Iub3BlcmF0aW9uQ2xhc3M7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy4kZ2V0ID0gW1xuXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIE9wZXJhdGlvbnNNYW5hZ2VyO1xuXG4gICAgICAgICAgICBPcGVyYXRpb25zTWFuYWdlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJPcGVyYXRpb24gPSBmdW5jdGlvbiAob3BlcmF0aW9uRGVzY3JpcHRvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KG9wZXJhdGlvbkRlc2NyaXB0b3IpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmlzU3RyaW5nKG9wZXJhdGlvbkRlc2NyaXB0b3IuaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVPcGVyYXRpb25zWyBvcGVyYXRpb25EZXNjcmlwdG9yLmlkIF0gPSBvcGVyYXRpb25EZXNjcmlwdG9yLm9wZXJhdGlvbkNsYXNzO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRBdmFpbGFibGVPcGVyYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlT3BlcmF0aW9ucztcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0TmV3ID0gZnVuY3Rpb24gKG9wZXJhdGlvbklkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIE9wZXJhdGlvbkNsYXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uSW5zdGFuY2U7XG5cbiAgICAgICAgICAgICAgICAgICAgT3BlcmF0aW9uQ2xhc3MgPSBhdmFpbGFibGVPcGVyYXRpb25zWyBvcGVyYXRpb25JZCBdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oT3BlcmF0aW9uQ2xhc3MpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbkluc3RhbmNlID0gbmV3IE9wZXJhdGlvbkNsYXNzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbkluc3RhbmNlLmluaXQuYXBwbHkob3BlcmF0aW9uSW5zdGFuY2UsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYXRpb25JbnN0YW5jZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IE9wZXJhdGlvbnNNYW5hZ2VyKCk7XG5cbiAgICAgICAgfVxuICAgIF07XG59KTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN5bWJvbFNlcnZpY2VzTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbFNlcnZpY2VzJywgW10gKTtcblxuc3ltYm9sU2VydmljZXNNb2R1bGUucHJvdmlkZXIoICdzeW1ib2xNYW5hZ2VyJywgZnVuY3Rpb24gU3ltYm9sTWFuYWdlclByb3ZpZGVyKCkge1xuICAgIHZhciBwcm92aWRlciA9IHRoaXMsXG4gICAgICAgIGF2YWlsYWJsZVN5bWJvbHMgPSB7fSxcblxuICAgICAgICBwb3J0Q3JlYXRvcixcbiAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGU7XG5cblxuICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlID0gZnVuY3Rpb24gKHNvbWVQb3J0cywgc2lkZSwgd2lkdGgsIGhlaWdodCwgcGFyYW1ldGVycykge1xuXG4gICAgICAgIHZhciBvZmZzZXQsXG4gICAgICAgICAgICBpbmNyZW1lbnQsXG5cbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBhUG9ydDtcblxuICAgICAgICBvZmZzZXQgPSBwYXJhbWV0ZXJzLnBvcnRXaXJlTGVuZ3RoICsgcGFyYW1ldGVycy5wb3J0U3BhY2luZztcblxuICAgICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0JyB8fCBzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgIG9mZnNldCArPSBwYXJhbWV0ZXJzLnRvcFBvcnRQYWRkaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtZXRlcnMuanVzdGlmeVBvcnRzKSB7XG5cbiAgICAgICAgICAgIGlmIChzaWRlID09PSAndG9wJyB8fCBzaWRlID09PSAnYm90dG9tJykge1xuICAgICAgICAgICAgICAgIGluY3JlbWVudCA9ICh3aWR0aCAtIDIgKiBwYXJhbWV0ZXJzLnBvcnRTcGFjaW5nKSAvICggc29tZVBvcnRzLmxlbmd0aCArIDEgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5jcmVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgKCBoZWlnaHQgLVxuICAgICAgICAgICAgICAgICAgICAgICAgMiAqIHBhcmFtZXRlcnMucG9ydFNwYWNpbmcgLVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1ldGVycy50b3BQb3J0UGFkZGluZyAtIHBhcmFtZXRlcnMuYm90dG9tUG9ydFBhZGRpbmcpIC8gKCBzb21lUG9ydHMubGVuZ3RoICsgMSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmNyZW1lbnQgPSBwYXJhbWV0ZXJzLnBvcnRTcGFjaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpPTA7IGkgPCBzb21lUG9ydHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgYVBvcnQgPSBzb21lUG9ydHNbaV07XG5cbiAgICAgICAgICAgIHN3aXRjaCAoc2lkZSkge1xuXG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgYVBvcnQueCA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYVBvcnQueSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IC05MDtcblxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gaW5jcmVtZW50O1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICBhUG9ydC54ID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LnkgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ICs9IGluY3JlbWVudDtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LnggPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LnkgPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDkwO1xuXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCArPSBpbmNyZW1lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgYVBvcnQueCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LnkgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDE4MDtcblxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gaW5jcmVtZW50O1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgcG9ydENyZWF0b3IgPSBmdW5jdGlvbihwb3J0RGVzY3JpcHRvcnMsIHBhcmFtZXRlcnMpIHtcblxuICAgICAgICB2YXIgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICBwb3J0cyxcblxuICAgICAgICAgICAgdG9wLFxuICAgICAgICAgICAgcmlnaHQsXG4gICAgICAgICAgICBib3R0b20sXG4gICAgICAgICAgICBsZWZ0O1xuXG4gICAgICAgIHBvcnREZXNjcmlwdG9ycyA9IHBvcnREZXNjcmlwdG9ycyB8fCB7fTtcbiAgICAgICAgcG9ydHMgPSBbXTtcblxuICAgICAgICB0b3AgPSBwb3J0RGVzY3JpcHRvcnMudG9wIHx8IFtdO1xuICAgICAgICByaWdodCA9IHBvcnREZXNjcmlwdG9ycy5yaWdodCB8fCBbXTtcbiAgICAgICAgYm90dG9tID0gcG9ydERlc2NyaXB0b3JzLmJvdHRvbSB8fCBbXTtcbiAgICAgICAgbGVmdCA9IHBvcnREZXNjcmlwdG9ycy5sZWZ0IHx8IFtdO1xuXG4gICAgICAgIHdpZHRoID0gTWF0aC5tYXgoXG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnBvcnRTcGFjaW5nICogKCB0b3AubGVuZ3RoICsgMyApLFxuICAgICAgICAgICAgcGFyYW1ldGVycy5wb3J0U3BhY2luZyAqICggYm90dG9tLmxlbmd0aCArIDMpLFxuICAgICAgICAgICAgcGFyYW1ldGVycy5taW5XaWR0aFxuICAgICAgICApO1xuXG4gICAgICAgIGhlaWdodCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgcGFyYW1ldGVycy5wb3J0U3BhY2luZyAqICggbGVmdC5sZW5ndGggKyAzKSArIHBhcmFtZXRlcnMudG9wUG9ydFBhZGRpbmcgKyBwYXJhbWV0ZXJzLmJvdHRvbVBvcnRQYWRkaW5nLFxuICAgICAgICAgICAgcGFyYW1ldGVycy5wb3J0U3BhY2luZyAqICggcmlnaHQubGVuZ3RoICsgMykgKyBwYXJhbWV0ZXJzLnRvcFBvcnRQYWRkaW5nICsgcGFyYW1ldGVycy5ib3R0b21Qb3J0UGFkZGluZyxcbiAgICAgICAgICAgIHBhcmFtZXRlcnMubWluSGVpZ2h0XG4gICAgICAgICk7XG5cbiAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGUodG9wLCAndG9wJywgd2lkdGgsIGhlaWdodCwgcGFyYW1ldGVycyk7XG4gICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKHJpZ2h0LCAncmlnaHQnLCB3aWR0aCwgaGVpZ2h0LCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGUoYm90dG9tLCAnYm90dG9tJywgd2lkdGgsIGhlaWdodCwgcGFyYW1ldGVycyk7XG4gICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKGxlZnQsICdsZWZ0Jywgd2lkdGgsIGhlaWdodCwgcGFyYW1ldGVycyk7XG5cbiAgICAgICAgcG9ydHMgPSBwb3J0cy5jb25jYXQodG9wKVxuICAgICAgICAgICAgLmNvbmNhdChyaWdodClcbiAgICAgICAgICAgIC5jb25jYXQoYm90dG9tKVxuICAgICAgICAgICAgLmNvbmNhdChsZWZ0KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcG9ydHM6IHBvcnRzLFxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfTtcblxuICAgIH07XG5cblxuICAgIHRoaXMucmVnaXN0ZXJTeW1ib2wgPSBmdW5jdGlvbiAoIHN5bWJvbERlc2NyaXB0b3IgKSB7XG5cbiAgICAgICAgaWYgKCBhbmd1bGFyLmlzT2JqZWN0KCBzeW1ib2xEZXNjcmlwdG9yICkgJiZcbiAgICAgICAgICAgIGFuZ3VsYXIuaXNTdHJpbmcoIHN5bWJvbERlc2NyaXB0b3IudHlwZSApICkge1xuICAgICAgICAgICAgYXZhaWxhYmxlU3ltYm9sc1sgc3ltYm9sRGVzY3JpcHRvci50eXBlIF0gPSBzeW1ib2xEZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMubWFrZUJveFN5bWJvbCA9IGZ1bmN0aW9uKCB0eXBlLCBkZXNjcmlwdG9yLCBwb3J0RGVzY3JpcHRvcnMsIGdpdmVuUGFyYW1ldGVycyApIHtcblxuICAgICAgICB2YXIgc3ltYm9sLFxuICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgIHBvcnRzQW5kU2l6ZXMsXG4gICAgICAgICAgICBjc3NDbGFzcztcblxuICAgICAgICBwYXJhbWV0ZXJzID0gYW5ndWxhci5leHRlbmQoe1xuICAgICAgICAgICAgcG9ydFdpcmVMZW5ndGg6IDIwLFxuICAgICAgICAgICAgcG9ydFNwYWNpbmc6IDIwLFxuICAgICAgICAgICAgdG9wUG9ydFBhZGRpbmc6IDIwLFxuICAgICAgICAgICAgYm90dG9tUG9ydFBhZGRpbmc6IDAsXG4gICAgICAgICAgICBtaW5XaWR0aDogMTQwLFxuICAgICAgICAgICAgbWluSGVpZ2h0OiA4MCxcbiAgICAgICAgICAgIGp1c3RpZnlQb3J0czogZmFsc2VcbiAgICAgICAgfSwgZ2l2ZW5QYXJhbWV0ZXJzIHx8IHt9KTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChkZXNjcmlwdG9yKSAmJiB0eXBlKSB7XG5cbiAgICAgICAgICAgIGlmICghYXZhaWxhYmxlU3ltYm9sc1t0eXBlXSkge1xuXG4gICAgICAgICAgICAgICAgcG9ydERlc2NyaXB0b3JzID0gcG9ydERlc2NyaXB0b3JzIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgcG9ydHNBbmRTaXplcyA9IHBvcnRDcmVhdG9yKHBvcnREZXNjcmlwdG9ycywgcGFyYW1ldGVycyk7XG5cbiAgICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdib3gnO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtZXRlcnMuY3NzQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3MgKz0gJyBwYXJhbWV0ZXJzLmNzc0NsYXNzJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzeW1ib2wgPSBhbmd1bGFyLmV4dGVuZChkZXNjcmlwdG9yLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6IGNzc0NsYXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sRGlyZWN0aXZlOiAnYm94JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0RlY29yYXRpb246IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogcG9ydHNBbmRTaXplcy53aWR0aC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBhcmFtZXRlcnMucG9ydFdpcmVMZW5ndGggKyAyNFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRXaXJlTGVuZ3RoOiBwYXJhbWV0ZXJzLnBvcnRXaXJlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHBvcnRzQW5kU2l6ZXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHBvcnRzQW5kU2l6ZXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzQW5kU2l6ZXMucG9ydHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hIZWlnaHQ6IHBvcnRzQW5kU2l6ZXMuaGVpZ2h0IC0gMiAqIHBhcmFtZXRlcnMucG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hXaWR0aDogcG9ydHNBbmRTaXplcy53aWR0aCAtIDIgKiBwYXJhbWV0ZXJzLnBvcnRXaXJlTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woc3ltYm9sKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzeW1ib2wgPSBhdmFpbGFibGVTeW1ib2xzW3R5cGVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3ltYm9sO1xuICAgIH07XG5cblxuICAgIHRoaXMuJGdldCA9IFtcblxuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBTeW1ib2xNYW5hZ2VyO1xuXG4gICAgICAgICAgICBTeW1ib2xNYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlclN5bWJvbCA9IHByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tYWtlQm94U3ltYm9sID0gcHJvdmlkZXIubWFrZUJveFN5bWJvbDtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0QXZhaWxhYmxlU3ltYm9scyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF2YWlsYWJsZVN5bWJvbHM7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0U3ltYm9sID0gZnVuY3Rpb24gKCBzeW1ib2xUeXBlICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlU3ltYm9sc1sgc3ltYm9sVHlwZSBdO1xuICAgICAgICAgICAgICAgIH07XG5cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTeW1ib2xNYW5hZ2VyKCk7XG5cbiAgICAgICAgfVxuICAgIF07XG59ICk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEVsYm93Um91dGVyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5uYW1lID0gJ0VsYm93Um91dGVyJztcblxuICAgIHRoaXMubWFrZVNlZ21lbnRzID0gZnVuY3Rpb24gKCBwb2ludHMsIG1ldGhvZCApIHtcblxuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIHBvaW50MSwgZWxib3csIHBvaW50MixcbiAgICAgICAgICAgIHNlZ21lbnRzO1xuXG4gICAgICAgIG1ldGhvZCA9IG1ldGhvZCB8fCAndmVydGljYWxGaXJzdCc7XG5cbiAgICAgICAgaWYgKCBhbmd1bGFyLmlzQXJyYXkoIHBvaW50cyApICYmIHBvaW50cy5sZW5ndGggPj0gMiApIHtcblxuICAgICAgICAgICAgc2VnbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgcG9pbnQxID0gcG9pbnRzWyBpIF07XG4gICAgICAgICAgICAgICAgcG9pbnQyID0gcG9pbnRzWyBpICsgMSBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBtZXRob2QgPT09ICd2ZXJ0aWNhbEZpcnN0JyApIHtcblxuICAgICAgICAgICAgICAgICAgICBlbGJvdyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBvaW50MS54LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogcG9pbnQyLnlcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxib3cgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwb2ludDEueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBvaW50Mi54XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWdtZW50cy5wdXNoKCB7XG5cbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuXG4gICAgICAgICAgICAgICAgICAgIHgxOiBwb2ludDEueCxcbiAgICAgICAgICAgICAgICAgICAgeTE6IHBvaW50MS55LFxuXG4gICAgICAgICAgICAgICAgICAgIHgyOiBlbGJvdy54LFxuICAgICAgICAgICAgICAgICAgICB5MjogZWxib3cueSxcblxuICAgICAgICAgICAgICAgICAgICByb3V0ZXI6IHNlbGYubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICggbWV0aG9kID09PSAndmVydGljYWxGaXJzdCcgKSA/ICd2ZXJ0aWNhbCcgOiAnaG9yaXpvbnRhbCdcblxuICAgICAgICAgICAgICAgIH0sIHtcblxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG5cbiAgICAgICAgICAgICAgICAgICAgeDE6IGVsYm93LngsXG4gICAgICAgICAgICAgICAgICAgIHkxOiBlbGJvdy55LFxuXG4gICAgICAgICAgICAgICAgICAgIHgyOiBwb2ludDIueCxcbiAgICAgICAgICAgICAgICAgICAgeTI6IHBvaW50Mi55LFxuXG4gICAgICAgICAgICAgICAgICAgIHJvdXRlcjogc2VsZi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogKCBtZXRob2QgPT09ICd2ZXJ0aWNhbEZpcnN0JyApID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ1xuXG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWdtZW50cztcblxuICAgIH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWxib3dSb3V0ZXI7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVSb3V0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLm1ha2VTZWdtZW50cyA9IGZ1bmN0aW9uICggcG9pbnRzICkge1xuXG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgcG9pbnQxLCBwb2ludDIsXG4gICAgICAgICAgICBzZWdtZW50cztcblxuICAgICAgICBpZiAoIGFuZ3VsYXIuaXNBcnJheSggcG9pbnRzICkgJiYgcG9pbnRzLmxlbmd0aCA+PSAyICkge1xuXG4gICAgICAgICAgICBzZWdtZW50cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGggLSAxOyBpKysgKSB7XG5cbiAgICAgICAgICAgICAgICBwb2ludDEgPSBwb2ludHNbIGkgXTtcbiAgICAgICAgICAgICAgICBwb2ludDIgPSBwb2ludHNbIGkgKyAxIF07XG5cbiAgICAgICAgICAgICAgICBzZWdtZW50cy5wdXNoKCB7XG5cbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuXG4gICAgICAgICAgICAgICAgICAgIHgxOiBwb2ludDEueCxcbiAgICAgICAgICAgICAgICAgICAgeTE6IHBvaW50MS55LFxuXG4gICAgICAgICAgICAgICAgICAgIHgyOiBwb2ludDIueCxcbiAgICAgICAgICAgICAgICAgICAgeTI6IHBvaW50Mi55XG5cbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuXG4gICAgfTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVSb3V0ZXI7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB3aXJpbmdTZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi53aXJpbmdTZXJ2aWNlJywgW10gKTtcblxud2lyaW5nU2VydmljZXNNb2R1bGUuc2VydmljZSggJ3dpcmluZ1NlcnZpY2UnLCBbICckbG9nJywgJyRyb290U2NvcGUnLCAnJHRpbWVvdXQnLFxuICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBTaW1wbGVSb3V0ZXIgPSByZXF1aXJlKCAnLi9jbGFzc2VzL1NpbXBsZVJvdXRlci5qcycgKSxcbiAgICAgICAgICAgIEVsYm93Um91dGVyID0gcmVxdWlyZSggJy4vY2xhc3Nlcy9FbGJvd1JvdXRlci5qcycgKSxcbiAgICAgICAgICAgIHJvdXRlcnMgPSB7XG5cbiAgICAgICAgICAgICAgICBTaW1wbGVSb3V0ZXI6IG5ldyBTaW1wbGVSb3V0ZXIoKSxcbiAgICAgICAgICAgICAgICBFbGJvd1JvdXRlcjogbmV3IEVsYm93Um91dGVyKClcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucyA9IGZ1bmN0aW9uICggZW5kUG9zaXRpb25zLCByb3V0ZXJUeXBlICkge1xuXG4gICAgICAgICAgICB2YXIgc2VnbWVudHMsXG4gICAgICAgICAgICAgICAgcm91dGVyO1xuXG4gICAgICAgICAgICByb3V0ZXIgPSByb3V0ZXJzWyByb3V0ZXJUeXBlIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggcm91dGVyICkgJiYgYW5ndWxhci5pc0Z1bmN0aW9uKCByb3V0ZXIubWFrZVNlZ21lbnRzICkgKSB7XG4gICAgICAgICAgICAgICAgc2VnbWVudHMgPSByb3V0ZXIubWFrZVNlZ21lbnRzKFxuICAgICAgICAgICAgICAgICAgICBbIGVuZFBvc2l0aW9ucy5lbmQxLCBlbmRQb3NpdGlvbnMuZW5kMiBdICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzZWdtZW50cztcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucm91dGVXaXJlID0gZnVuY3Rpb24gKCB3aXJlLCByb3V0ZXJUeXBlICkge1xuXG4gICAgICAgICAgICB2YXIgcm91dGVyLCBlbmRQb3NpdGlvbnM7XG5cbiAgICAgICAgICAgIHJvdXRlclR5cGUgPSByb3V0ZXJUeXBlIHx8ICdFbGJvd1JvdXRlcic7XG5cbiAgICAgICAgICAgIHJvdXRlciA9IHJvdXRlcnNbIHJvdXRlclR5cGUgXTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzT2JqZWN0KCByb3V0ZXIgKSAmJiBhbmd1bGFyLmlzRnVuY3Rpb24oIHJvdXRlci5tYWtlU2VnbWVudHMgKSApIHtcblxuICAgICAgICAgICAgICAgIGVuZFBvc2l0aW9ucyA9IHdpcmUuZ2V0RW5kUG9zaXRpb25zKCk7XG5cbiAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzID0gcm91dGVyLm1ha2VTZWdtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgWyBlbmRQb3NpdGlvbnMuZW5kMSwgZW5kUG9zaXRpb25zLmVuZDIgXSApO1xuXG4gICAgICAgICAgICAgICAgd2lyZS5yb3V0ZXJUeXBlID0gcm91dGVyVHlwZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWRqdXN0V2lyZUVuZFNlZ21lbnRzID0gZnVuY3Rpb24gKCB3aXJlICkge1xuXG4gICAgICAgICAgICB2YXIgZmlyc3RTZWdtZW50LFxuICAgICAgICAgICAgICAgIHNlY29uZFNlZ21lbnQsXG4gICAgICAgICAgICAgICAgc2Vjb25kVG9MYXN0U2VnbWVudCxcbiAgICAgICAgICAgICAgICBsYXN0U2VnbWVudCxcbiAgICAgICAgICAgICAgICBlbmRQb3NpdGlvbnMsXG4gICAgICAgICAgICAgICAgbmV3U2VnbWVudHMsXG4gICAgICAgICAgICAgICAgcG9zO1xuXG4gICAgICAgICAgICBlbmRQb3NpdGlvbnMgPSB3aXJlLmdldEVuZFBvc2l0aW9ucygpO1xuXG4gICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNBcnJheSggd2lyZS5zZWdtZW50cyApICYmIHdpcmUuc2VnbWVudHMubGVuZ3RoID4gMSApIHtcblxuICAgICAgICAgICAgICAgIGZpcnN0U2VnbWVudCA9IHdpcmUuc2VnbWVudHNbIDAgXTtcblxuICAgICAgICAgICAgICAgIGlmICggZmlyc3RTZWdtZW50LngxICE9PSBlbmRQb3NpdGlvbnMuZW5kMS54IHx8IGZpcnN0U2VnbWVudC55MSAhPT0gZW5kUG9zaXRpb25zLmVuZDEueSApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGZpcnN0U2VnbWVudC5yb3V0ZXIgPT09ICdFbGJvd1JvdXRlcicgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZFNlZ21lbnQgPSB3aXJlLnNlZ21lbnRzWyAxIF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBzZWNvbmRTZWdtZW50LngyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHNlY29uZFNlZ21lbnQueTJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmUuc2VnbWVudHMuc3BsaWNlKCAwLCAyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBmaXJzdFNlZ21lbnQueDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogZmlyc3RTZWdtZW50LnkyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzLnNwbGljZSggMCwgMSApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3U2VnbWVudHMgPSBzZWxmLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucygge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMTogZW5kUG9zaXRpb25zLmVuZDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQyOiBwb3NcbiAgICAgICAgICAgICAgICAgICAgfSwgZmlyc3RTZWdtZW50LnJvdXRlciApO1xuXG4gICAgICAgICAgICAgICAgICAgIHdpcmUuc2VnbWVudHMgPSBuZXdTZWdtZW50cy5jb25jYXQoIHdpcmUuc2VnbWVudHMgKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50ID0gd2lyZS5zZWdtZW50c1sgd2lyZS5zZWdtZW50cy5sZW5ndGggLSAxIF07XG5cbiAgICAgICAgICAgICAgICBpZiAoIGxhc3RTZWdtZW50LngyICE9PSBlbmRQb3NpdGlvbnMuZW5kMi54IHx8IGxhc3RTZWdtZW50LnkyICE9PSBlbmRQb3NpdGlvbnMuZW5kMi55ICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggbGFzdFNlZ21lbnQucm91dGVyID09PSAnRWxib3dSb3V0ZXInICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRUb0xhc3RTZWdtZW50ID0gd2lyZS5zZWdtZW50c1sgd2lyZS5zZWdtZW50cy5sZW5ndGggLSAyIF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBzZWNvbmRUb0xhc3RTZWdtZW50LngxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHNlY29uZFRvTGFzdFNlZ21lbnQueTFcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmUuc2VnbWVudHMuc3BsaWNlKCB3aXJlLnNlZ21lbnRzLmxlbmd0aCAtIDIsIDIgKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGxhc3RTZWdtZW50LngxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGxhc3RTZWdtZW50LnkxXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzLnNwbGljZSggd2lyZS5zZWdtZW50cy5sZW5ndGggLSAxLCAxICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBuZXdTZWdtZW50cyA9IHNlbGYuZ2V0U2VnbWVudHNCZXR3ZWVuUG9zaXRpb25zKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQxOiBwb3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQyOiBlbmRQb3NpdGlvbnMuZW5kMlxuICAgICAgICAgICAgICAgICAgICB9LCBsYXN0U2VnbWVudC5yb3V0ZXIgKTtcblxuICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzID0gd2lyZS5zZWdtZW50cy5jb25jYXQoIG5ld1NlZ21lbnRzICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yb3V0ZVdpcmUoIHdpcmUgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgfVxuXSApOyIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSggJ0FycmF5LnByb3RvdHlwZS5maW5kJyApO1xuXG5pZiAoICFBcnJheS5wcm90b3R5cGUuZmluZEJ5SWQgKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZpbmRCeUlkID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZCggZnVuY3Rpb24gKCBhICkge1xuICAgICAgICAgICAgcmV0dXJuIGEuaWQgIT09IHVuZGVmaW5lZCAmJiBhLmlkID09PSBpZDtcbiAgICAgICAgfSApO1xuICAgIH07XG59XG5cbmlmICggIUFycmF5LnByb3RvdHlwZS5nZXRSYW5kb21FbGVtZW50ICkge1xuICAgIEFycmF5LnByb3RvdHlwZS5nZXRSYW5kb21FbGVtZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpc1sgTWF0aC5yb3VuZCggTWF0aC5yYW5kb20oKSAqICggdGhpcy5sZW5ndGggLSAxICkgKSBdO1xuICAgIH07XG59XG5cbmlmICggIUFycmF5LnByb3RvdHlwZS5zaHVmZmxlICkge1xuICAgIEFycmF5LnByb3RvdHlwZS5zaHVmZmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY3VycmVudEluZGV4ID0gdGhpcy5sZW5ndGgsXG4gICAgICAgICAgICB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XG5cbiAgICAgICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cbiAgICAgICAgd2hpbGUgKCAwICE9PSBjdXJyZW50SW5kZXggKSB7XG5cbiAgICAgICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxuICAgICAgICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4ICk7XG4gICAgICAgICAgICBjdXJyZW50SW5kZXggLT0gMTtcblxuICAgICAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgICAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSB0aGlzWyBjdXJyZW50SW5kZXggXTtcbiAgICAgICAgICAgIHRoaXNbIGN1cnJlbnRJbmRleCBdID0gdGhpc1sgcmFuZG9tSW5kZXggXTtcbiAgICAgICAgICAgIHRoaXNbIHJhbmRvbUluZGV4IF0gPSB0ZW1wb3JhcnlWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG59Il19
