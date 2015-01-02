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


//CyPhyApp.run(function ($state, growl, dataStoreService, projectService) {

//  var connectionId = 'mms-connection-id';
//
//  dataStoreService.connectToDatabase(connectionId, {host: window.location.basename})
//    .then(function () {
//      // select default project and branch (master)
//      return projectService.selectProject(connectionId, 'ADMEditor');
//    })
//    .catch(function (reason) {
//      growl.error('ADMEditor does not exist. Create and import it using the <a href="' +
//        window.location.origin + '"> webgme interface</a>.');
//      console.error(reason);
//    });
//});

},{"./directives/busyCover/busyCover.js":4,"./directives/designEditor/designEditor":7,"./directives/diagramContainer/diagramContainer.js":9,"./directives/fabricCanvas/fabricCanvas.js":11,"./directives/resizing/resizeToHeight.js":13,"./directives/resizing/resizeToWindow.js":14,"./directives/svgDiagram/svgDiagram.js":19,"./directives/symbols/componentSymbol.js":22,"./libraryIncludes.js":28,"./services/diagramService/diagramService.js":32,"./services/gridService/gridService.js":33,"./services/operationsManager/operationsManager.js":34,"./services/wiringService/wiringService.js":38,"./utils.js":39}],2:[function(require,module,exports){
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
    .controller( 'DesignEditorController', function($scope, $rootScope, diagramService, $log, designService, $stateParams) {

        var designCtx;

        $scope.diagram = {};

        designCtx = {
            db: $rootScope.mainDbConnectionId,
            regionId: 'Design_' + ( new Date() ).toISOString()
        };

        $scope.diagramContainerConfig = {

        };

        if ($stateParams.containerId === 'dummy') {

            $scope.diagram = diagramService.getDiagram();

            $log.debug('Loading dummy diagram:', $scope.diagram);


        } else {


            designService.watchDesignStructure(designCtx, $rootScope.activeDesign.id, function (/*designStructureUpdateObject*/) {

            }).then(function (designStructure) {

                console.log(designStructure);

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
                return $scope.id;
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

                $scope.diagram.config = $scope.diagram.config || {};

                return $scope.diagram.config.editable === true;
            };

            this.isComponentSelected = function (component) {
                return $scope.diagram.state.selectedComponentIds.indexOf(component.id) > -1;
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
                    id: '@',
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

            possibbleDragTargetsDescriptor.affectedWires = diagramService.getWiresForComponents(
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


        diagramService.addWire( wire );

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

},{"../../../services/diagramService/classes/Wire.js":31}],18:[function(require,module,exports){
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

                    affectedWires = diagramService.getWiresForComponents(
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

                    id = diagramContainerController.getId();

                    scope.$watch('diagram', function(newDiagramValue) {

                        if (newDiagramValue) {

                            scope.diagram = scope.diagram || {};
                            scope.$element = $element;

                            $element.outerWidth(scope.diagram.config.width);
                            $element.outerHeight(scope.diagram.config.width);

                            scope.id = id;

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

},{"../../services/symbolServices/symbolServices.js":35,"../port/port.js":12,"./box/box.js":20,"./capacitor/capacitor.js":21,"./diode/diode.js":23,"./inductor/inductor.js":24,"./jFetP/jFetP.js":25,"./opAmp/opAmp.js":26,"./resistor/resistor.js":27}],23:[function(require,module,exports){
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
},{"glMatrix":3}],31:[function(require,module,exports){
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
},{}],32:[function(require,module,exports){
/*globals angular */

'use strict';

// Move this to GME eventually

angular.module('mms.designVisualization.diagramService', [
        'mms.designVisualization.symbolServices',
        'mms.designVisualization.operationsManager'
    ])
    .config([ 'symbolManagerProvider',
        'operationsManagerProvider',
        function (symbolManagerProvider) {

            var randomSymbolGenerator,
                kinds = 7;

            randomSymbolGenerator = function (count) {

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
                        sides = [ top, right, bottom, left ],
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

                        sides[ placement ].push(port);
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

                    var symbol = {
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

                    //      debugger;

                    return symbol;

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

            randomSymbolGenerator(kinds);

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
                components = [],
                componentsById = {},

                wires = [],
                wiresById = {},
                wiresByComponentId = {},

                width = 5000,
                height = 5000,

                symbolTypes,

                registerWireForEnds,

                DiagramComponent = require('./classes/DiagramComponent.js'),
                ComponentPort = require('./classes/ComponentPort'),
                Wire = require('./classes/Wire.js');

            symbolTypes = symbolManager.getAvailableSymbols();

            this.generateDummyDiagram = function (countOfBoxes, countOfWires, canvasWidth, canvasHeight) {

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

                    wire;

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

                components = [];
                componentsById = {};

                width = canvasWidth;
                height = canvasHeight;

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

                    self.addComponent(newDiagramComponent);

                }

                wires = [];
                wiresById = {};

                for (i = 0; i < countOfWires; i++) {

                    id = 'wire_' + i;

                    component1 = components.getRandomElement();

                    port1 = component1.portInstances.getRandomElement();
                    port2 = undefined;

                    while (!angular.isDefined(port2) || port1 === port2) {

                        component2 = components.getRandomElement();
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

                    self.addWire(wire);

                }

            };

            this.addComponent = function (aDiagramComponent) {

                if (angular.isObject(aDiagramComponent) && !angular.isDefined(componentsById[ aDiagramComponent
                    .id ])) {

                    componentsById[ aDiagramComponent.id ] = aDiagramComponent;
                    components.push(aDiagramComponent);

                }

            };

            registerWireForEnds = function (wire) {

                var componentId;

                componentId = wire.end1.component.id;

                wiresByComponentId[ componentId ] = wiresByComponentId[ componentId ] || [];

                if (wiresByComponentId[ componentId ].indexOf(wire) === -1) {
                    wiresByComponentId[ componentId ].push(wire);
                }

                componentId = wire.end2.component.id;

                wiresByComponentId[ componentId ] = wiresByComponentId[ componentId ] || [];

                if (wiresByComponentId[ componentId ].indexOf(wire) === -1) {
                    wiresByComponentId[ componentId ].push(wire);
                }

            };

            this.addWire = function (aWire) {

                if (angular.isObject(aWire) && !angular.isDefined(wiresById[ aWire.id ])) {

                    wiresById[ aWire.id ] = aWire;
                    wires.push(aWire);

                    registerWireForEnds(aWire);

                }

            };

            this.getWiresForComponents = function (components) {

                var setOfWires = [];

                angular.forEach(components, function (component) {

                    angular.forEach(wiresByComponentId[ component.id ], function (wire) {

                        if (setOfWires.indexOf(wire) === -1) {
                            setOfWires.push(wire);
                        }
                    });

                });

                return setOfWires;

            };

            this.getDiagram = function () {

                return {
                    components: components,
                    componentsById: componentsById,
                    wires: wires,
                    wiresById: wiresById,
                    config: {
                        editable: true,
                        disallowSelection: false,
                        width: width,
                        height: height
                    },
                    state: {
                        selectedComponentIds: []
                    }
                };

            };

            this.getHighestZ = function () {

                var i,
                    component,
                    z;

                for (i = 0; i < components.length; i++) {

                    component = components[ i ];

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
            this.generateDummyDiagram( 100, 50, 3000, 3000 );

        }
    ]);

},{"./classes/ComponentPort":29,"./classes/DiagramComponent.js":30,"./classes/Wire.js":31}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
},{}],36:[function(require,module,exports){
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
},{}],37:[function(require,module,exports){
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
},{}],38:[function(require,module,exports){
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
},{"./classes/ElbowRouter.js":36,"./classes/SimpleRouter.js":37}],39:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvbW1zQXBwL2FwcC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvQXJyYXkucHJvdG90eXBlLmZpbmQvaW5kZXguanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9ib3dlcl9jb21wb25lbnRzL2dsLW1hdHJpeC9kaXN0L2dsLW1hdHJpeC1taW4uanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2J1c3lDb3Zlci9idXN5Q292ZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2NvbXBvbmVudFdpcmUvY29tcG9uZW50V2lyZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvY29tcG9uZW50V2lyZS9jb21wb25lbnRXaXJlU2VnbWVudC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGVzaWduRWRpdG9yL2Rlc2lnbkVkaXRvci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGlhZ3JhbUNvbnRhaW5lci9jbGFzc2VzL1Njcm9sbEhhbmRsZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2RpYWdyYW1Db250YWluZXIvZGlhZ3JhbUNvbnRhaW5lci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZHJhd2luZ0dyaWQvZHJhd2luZ0dyaWQuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2ZhYnJpY0NhbnZhcy9mYWJyaWNDYW52YXMuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3BvcnQvcG9ydC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvcmVzaXppbmcvcmVzaXplVG9IZWlnaHQuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3Jlc2l6aW5nL3Jlc2l6ZVRvV2luZG93LmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zdmdEaWFncmFtL2NsYXNzZXMvQ29tcG9uZW50RHJhZ0hhbmRsZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vY2xhc3Nlcy9Db21wb25lbnRTZWxlY3Rpb25IYW5kbGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zdmdEaWFncmFtL2NsYXNzZXMvV2lyZURyYXdIYW5kbGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zdmdEaWFncmFtL2NsYXNzZXMvY29udGV4dE1lbnVIYW5kbGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zdmdEaWFncmFtL3N2Z0RpYWdyYW0uanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvYm94L2JveC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9jYXBhY2l0b3IvY2FwYWNpdG9yLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2NvbXBvbmVudFN5bWJvbC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9kaW9kZS9kaW9kZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9pbmR1Y3Rvci9pbmR1Y3Rvci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9qRmV0UC9qRmV0UC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9vcEFtcC9vcEFtcC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9yZXNpc3Rvci9yZXNpc3Rvci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2xpYnJhcnlJbmNsdWRlcy5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvQ29tcG9uZW50UG9ydC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvRGlhZ3JhbUNvbXBvbmVudC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2NsYXNzZXMvV2lyZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2RpYWdyYW1TZXJ2aWNlLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvZ3JpZFNlcnZpY2UvZ3JpZFNlcnZpY2UuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9vcGVyYXRpb25zTWFuYWdlci9vcGVyYXRpb25zTWFuYWdlci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL3N5bWJvbFNlcnZpY2VzL3N5bWJvbFNlcnZpY2VzLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvd2lyaW5nU2VydmljZS9jbGFzc2VzL0VsYm93Um91dGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvd2lyaW5nU2VydmljZS9jbGFzc2VzL1NpbXBsZVJvdXRlci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL3dpcmluZ1NlcnZpY2Uvd2lyaW5nU2VydmljZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vbGlicmFyeUluY2x1ZGVzLmpzJyk7XG5cbnJlcXVpcmUoJy4vdXRpbHMuanMnKTtcblxucmVxdWlyZSgnLi9zZXJ2aWNlcy9vcGVyYXRpb25zTWFuYWdlci9vcGVyYXRpb25zTWFuYWdlci5qcycpO1xuXG5yZXF1aXJlKCcuL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2RpYWdyYW1TZXJ2aWNlLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL2dyaWRTZXJ2aWNlL2dyaWRTZXJ2aWNlLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL3dpcmluZ1NlcnZpY2Uvd2lyaW5nU2VydmljZS5qcycpO1xuXG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZGlhZ3JhbUNvbnRhaW5lci9kaWFncmFtQ29udGFpbmVyLmpzJyk7XG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZmFicmljQ2FudmFzL2ZhYnJpY0NhbnZhcy5qcycpO1xucmVxdWlyZSgnLi9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vc3ZnRGlhZ3JhbS5qcycpO1xuXG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvc3ltYm9scy9jb21wb25lbnRTeW1ib2wuanMnKTtcblxucmVxdWlyZSgnLi9kaXJlY3RpdmVzL3Jlc2l6aW5nL3Jlc2l6ZVRvSGVpZ2h0LmpzJyk7XG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvcmVzaXppbmcvcmVzaXplVG9XaW5kb3cuanMnKTtcblxucmVxdWlyZSgnLi9kaXJlY3RpdmVzL2J1c3lDb3Zlci9idXN5Q292ZXIuanMnKTtcblxucmVxdWlyZSgnLi9kaXJlY3RpdmVzL2Rlc2lnbkVkaXRvci9kZXNpZ25FZGl0b3InKTtcblxudmFyIEN5UGh5QXBwID0gYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJywgW1xuICAgICd1aS5yb3V0ZXInLFxuXG4gICAgJ2dtZS5zZXJ2aWNlcycsXG5cbiAgICAnaXNpcy51aS5jb21wb25lbnRzJyxcblxuICAgICdjeXBoeS5jb21wb25lbnRzJyxcblxuICAgIC8vIGFwcCBzcGVjaWZpYyB0ZW1wbGF0ZXNcbiAgICAnY3lwaHkubW1zQXBwLnRlbXBsYXRlcycsXG5cbiAgICAndWkuYm9vdHN0cmFwJyxcblxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5vcGVyYXRpb25zTWFuYWdlcicsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLndpcmluZ1NlcnZpY2UnLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kaWFncmFtU2VydmljZScsXG5cbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZGlhZ3JhbUNvbnRhaW5lcicsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmZhYnJpY0NhbnZhcycsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN2Z0RpYWdyYW0nLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzJyxcbiAgICAnbW1zLnJlc2l6ZVRvV2luZG93JyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uYnVzeUNvdmVyJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZGVzaWduRWRpdG9yJyxcblxuICAgICdhbmd1Y29tcGxldGUtYWx0JyxcbiAgICAnbmdUb3VjaCcsXG5cbiAgICAnbmdNYXRlcmlhbCdcbl0pO1xuXG5DeVBoeUFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICAgIHZhciBzZWxlY3RQcm9qZWN0O1xuXG4gICAgc2VsZWN0UHJvamVjdCA9IHtcbiAgICAgICAgbG9hZDogZnVuY3Rpb24gKCRxLCAkc3RhdGVQYXJhbXMsICRyb290U2NvcGUsICRzdGF0ZSwgJGxvZywgZGF0YVN0b3JlU2VydmljZSwgcHJvamVjdFNlcnZpY2UsIHdvcmtzcGFjZVNlcnZpY2UsIGRlc2lnblNlcnZpY2UsICR0aW1lb3V0KSB7XG4gICAgICAgICAgICB2YXJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQ7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUubWFpbkRiQ29ubmVjdGlvbklkID0gJ21tcy1tYWluLWRiLWNvbm5lY3Rpb24taWQnO1xuXG4gICAgICAgICAgICBjb25uZWN0aW9uSWQgPSAkcm9vdFNjb3BlLm1haW5EYkNvbm5lY3Rpb25JZDtcbiAgICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZShjb25uZWN0aW9uSWQsIHtcbiAgICAgICAgICAgICAgICBob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0U2VydmljZS5zZWxlY3RQcm9qZWN0KGNvbm5lY3Rpb25JZCwgJHN0YXRlUGFyYW1zLnByb2plY3RJZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocHJvamVjdElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ1Byb2plY3Qgc2VsZWN0ZWQnLCBwcm9qZWN0SWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUucHJvamVjdElkID0gcHJvamVjdElkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB3c0NvbnRleHQ7XG5cblxuICAgICAgICAgICAgICAgICAgICB3c0NvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYjogJHJvb3RTY29wZS5tYWluRGJDb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogJ1dvcmtTcGFjZXNfJyArICggbmV3IERhdGUoKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKHdzQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5yZWdpc3RlcldhdGNoZXIod3NDb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ1dvcmtTcGFjZSB3YXRjaGVyIGluaXRpYWxpemVkLCBkZXN0cm95ZWQ6JywgZGVzdHJveWVkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hXb3Jrc3BhY2VzKHdzQ29udGV4dCxmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsb2FkJywgdXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGUnLCB1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VubG9hZCcsIHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodXBkYXRlT2JqZWN0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhhc0ZvdW5kRmlyc3RXb3Jrc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGb3VuZEZpcnN0RGVzaWduO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZvdW5kRmlyc3RXb3Jrc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRm91bmRGaXJzdERlc2lnbiA9IGZhbHNlO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEud29ya3NwYWNlcywgZnVuY3Rpb24gKHdvcmtTcGFjZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWhhc0ZvdW5kRmlyc3RXb3Jrc3BhY2UpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZvdW5kRmlyc3RXb3Jrc3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuYWN0aXZlV29ya1NwYWNlID0gd29ya1NwYWNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ0FjdGl2ZSB3b3Jrc3BhY2U6JywgJHJvb3RTY29wZS5hY3RpdmVXb3JrU3BhY2UpO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzRm91bmRGaXJzdFdvcmtzcGFjZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWducyh3c0NvbnRleHQsICRyb290U2NvcGUuYWN0aXZlV29ya1NwYWNlLmlkLGZ1bmN0aW9uICgvKmRlc2lnbnNVcGRhdGVPYmplY3QqLykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkZXNpZ25zRGF0YSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRlc2lnbnNEYXRhLmRlc2lnbnMsIGZ1bmN0aW9uIChkZXNpZ24pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWhhc0ZvdW5kRmlyc3REZXNpZ24pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRm91bmRGaXJzdERlc2lnbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmFjdGl2ZURlc2lnbiA9IGRlc2lnbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ0FjdGl2ZSBkZXNpZ246JywgJHJvb3RTY29wZS5hY3RpdmVEZXNpZ24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzRm91bmRGaXJzdERlc2lnbikge1xuXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaEludGVyZmFjZXMod3NDb250ZXh0LCAkcm9vdFNjb3BlLmFjdGl2ZURlc2lnbi5pZCwgZnVuY3Rpb24oZGVzaWduSW50ZXJmYWNlc1VwZGF0ZU9iamVjdCkge1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKGRlc2lnbkludGVyZmFjZXMpIHtcbi8vXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRlc2lnbkludGVyZmFjZXMpO1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ0NvdWxkIG5vdCBmaW5kIGRlc2lnbnMgaW4gd29ya3NwYWNlLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJzQwNCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogJHN0YXRlUGFyYW1zLnByb2plY3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdDb3VsZCBub3QgZmluZCB3b3Jrc3BhY2VzIGluIHByb2plY3QuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJzQwNCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6ICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdXb2tyc3BhY2VTZXJ2aWNlIGRlc3Ryb3llZC4uLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ09wZW5pbmcgcHJvamVjdCBlcnJvcmVkOicsICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWQsIHJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnNDA0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiAkc3RhdGVQYXJhbXMucHJvamVjdElkXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvbm9Qcm9qZWN0Jyk7XG5cblxuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnZWRpdG9yJywge1xuICAgICAgICAgICAgdXJsOiAnL2VkaXRvci86cHJvamVjdElkJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZWRpdG9yLmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZTogc2VsZWN0UHJvamVjdCxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdFZGl0b3JWaWV3Q29udHJvbGxlcidcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdlZGl0b3IuaW5Db250YWluZXInLCB7XG4gICAgICAgICAgICB1cmw6ICcvOmNvbnRhaW5lcklkJ1xuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ25vUHJvamVjdCcsIHtcbiAgICAgICAgICAgIHVybDogJy9ub1Byb2plY3QnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9ub1Byb2plY3RTcGVjaWZpZWQuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnTm9Qcm9qZWN0Q29udHJvbGxlcidcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCc0MDQnLCB7XG4gICAgICAgICAgICB1cmw6ICcvNDA0Lzpwcm9qZWN0SWQnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ05vUHJvamVjdENvbnRyb2xsZXInLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy80MDQuaHRtbCdcbiAgICAgICAgfSk7XG59KTtcblxuQ3lQaHlBcHAuY29udHJvbGxlcignTWFpbk5hdmlnYXRvckNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlLCAkd2luZG93KSB7XG5cbiAgICB2YXIgZGVmYXVsdE5hdmlnYXRvckl0ZW1zO1xuXG4gICAgZGVmYXVsdE5hdmlnYXRvckl0ZW1zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3Jvb3QnLFxuICAgICAgICAgICAgbGFiZWw6ICdNZXRhTW9ycGhvc2lzJyxcbiAgICAgICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnXG4gICAgICAgIH1cbiAgICBdO1xuXG4gICAgJHNjb3BlLm5hdmlnYXRvciA9IHtcbiAgICAgICAgc2VwYXJhdG9yOiB0cnVlLFxuICAgICAgICBpdGVtczogYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pXG4gICAgfTtcblxuICAgICRyb290U2NvcGUuJHdhdGNoKCdwcm9qZWN0SWQnLCBmdW5jdGlvbiAocHJvamVjdElkKSB7XG5cbiAgICAgICAgaWYgKHByb2plY3RJZCkge1xuXG4gICAgICAgICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pO1xuICAgICAgICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogJ3Byb2plY3QnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBwcm9qZWN0SWQsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PScgKyBwcm9qZWN0SWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxufSk7XG5cbkN5UGh5QXBwLmNvbnRyb2xsZXIoJ0VkaXRvclZpZXdDb250cm9sbGVyJywgZnVuY3Rpb24gKCkge1xuXG5cbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdOb1Byb2plY3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgJHN0YXRlUGFyYW1zLCAkaHR0cCwgJGxvZywgJHN0YXRlLCBncm93bCkge1xuXG4gICAgJHNjb3BlLnByb2plY3RJZCA9ICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWQ7XG4gICAgJHNjb3BlLmVycm9yZWQgPSBmYWxzZTtcblxuICAgICRzY29wZS5zdGFydE5ld1Byb2plY3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgJHJvb3RTY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcblxuICAgICAgICAkbG9nLmRlYnVnKCdOZXcgcHJvamVjdCBjcmVhdGlvbicpO1xuXG4gICAgICAgICRodHRwLmdldCgnL3Jlc3QvZXh0ZXJuYWwvY29weXByb2plY3Qvbm9yZWRpcmVjdCcpXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICBzdWNjZXNzKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdOZXcgcHJvamVjdCBjcmVhdGlvbiBzdWNjZXNzZnVsJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdlZGl0b3InLCB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogZGF0YVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgZXJyb3IoZnVuY3Rpb24gKGRhdGEsIHN0YXR1cykge1xuXG4gICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnTmV3IHByb2plY3QgY3JlYXRpb24gZmFpbGVkJywgc3RhdHVzKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBncm93bC5lcnJvcignQW4gZXJyb3Igb2NjdXJlZCB3aGlsZSBwcm9qZWN0IGNyZWF0aW9uLiBQbGVhc2UgcmV0cnkgbGF0ZXIuJyk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7XG5cblxuLy9DeVBoeUFwcC5ydW4oZnVuY3Rpb24gKCRzdGF0ZSwgZ3Jvd2wsIGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlKSB7XG5cbi8vICB2YXIgY29ubmVjdGlvbklkID0gJ21tcy1jb25uZWN0aW9uLWlkJztcbi8vXG4vLyAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZShjb25uZWN0aW9uSWQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxuLy8gICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuLy8gICAgICAvLyBzZWxlY3QgZGVmYXVsdCBwcm9qZWN0IGFuZCBicmFuY2ggKG1hc3Rlcilcbi8vICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoY29ubmVjdGlvbklkLCAnQURNRWRpdG9yJyk7XG4vLyAgICB9KVxuLy8gICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbi8vICAgICAgZ3Jvd2wuZXJyb3IoJ0FETUVkaXRvciBkb2VzIG5vdCBleGlzdC4gQ3JlYXRlIGFuZCBpbXBvcnQgaXQgdXNpbmcgdGhlIDxhIGhyZWY9XCInICtcbi8vICAgICAgICB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJ1wiPiB3ZWJnbWUgaW50ZXJmYWNlPC9hPi4nKTtcbi8vICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuLy8gICAgfSk7XG4vL30pO1xuIiwiLy8gQXJyYXkucHJvdG90eXBlLmZpbmQgLSBNSVQgTGljZW5zZSAoYykgMjAxMyBQYXVsIE1pbGxlciA8aHR0cDovL3BhdWxtaWxsci5jb20+XG4vLyBGb3IgYWxsIGRldGFpbHMgYW5kIGRvY3M6IGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsbWlsbHIvYXJyYXkucHJvdG90eXBlLmZpbmRcbi8vIEZpeGVzIGFuZCB0ZXN0cyBzdXBwbGllZCBieSBEdW5jYW4gSGFsbCA8aHR0cDovL2R1bmNhbmhhbGwubmV0PiBcbihmdW5jdGlvbihnbG9iYWxzKXtcbiAgaWYgKEFycmF5LnByb3RvdHlwZS5maW5kKSByZXR1cm47XG5cbiAgdmFyIGZpbmQgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICB2YXIgbGlzdCA9IE9iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGggPCAwID8gMCA6IGxpc3QubGVuZ3RoID4+PiAwOyAvLyBFUy5Ub1VpbnQzMjtcbiAgICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgcHJlZGljYXRlICE9PSAnZnVuY3Rpb24nIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcmVkaWNhdGUpICE9PSAnW29iamVjdCBGdW5jdGlvbl0nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheSNmaW5kOiBwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzFdO1xuICAgIGZvciAodmFyIGkgPSAwLCB2YWx1ZTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG5cbiAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkge1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCAnZmluZCcsIHtcbiAgICAgICAgdmFsdWU6IGZpbmQsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZpbmQgPSBmaW5kO1xuICB9XG59KSh0aGlzKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcbiAqIEBhdXRob3IgQnJhbmRvbiBKb25lc1xuICogQGF1dGhvciBDb2xpbiBNYWNLZW56aWUgSVZcbiAqIEB2ZXJzaW9uIDIuMi4xXG4gKi9cbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb25cbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRVxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuKGZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PXt9O3R5cGVvZiBleHBvcnRzPT1cInVuZGVmaW5lZFwiP3R5cGVvZiBkZWZpbmU9PVwiZnVuY3Rpb25cIiYmdHlwZW9mIGRlZmluZS5hbWQ9PVwib2JqZWN0XCImJmRlZmluZS5hbWQ/KHQuZXhwb3J0cz17fSxkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gdC5leHBvcnRzfSkpOnQuZXhwb3J0cz10eXBlb2Ygd2luZG93IT1cInVuZGVmaW5lZFwiP3dpbmRvdzplOnQuZXhwb3J0cz1leHBvcnRzLGZ1bmN0aW9uKGUpe2lmKCF0KXZhciB0PTFlLTY7aWYoIW4pdmFyIG49dHlwZW9mIEZsb2F0MzJBcnJheSE9XCJ1bmRlZmluZWRcIj9GbG9hdDMyQXJyYXk6QXJyYXk7aWYoIXIpdmFyIHI9TWF0aC5yYW5kb207dmFyIGk9e307aS5zZXRNYXRyaXhBcnJheVR5cGU9ZnVuY3Rpb24oZSl7bj1lfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUuZ2xNYXRyaXg9aSk7dmFyIHM9TWF0aC5QSS8xODA7aS50b1JhZGlhbj1mdW5jdGlvbihlKXtyZXR1cm4gZSpzfTt2YXIgbz17fTtvLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDIpO3JldHVybiBlWzBdPTAsZVsxXT0wLGV9LG8uY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMik7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdH0sby5mcm9tVmFsdWVzPWZ1bmN0aW9uKGUsdCl7dmFyIHI9bmV3IG4oMik7cmV0dXJuIHJbMF09ZSxyWzFdPXQscn0sby5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZX0sby5zZXQ9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXQsZVsxXT1uLGV9LG8uYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZX0sby5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGV9LG8uc3ViPW8uc3VidHJhY3Qsby5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGV9LG8ubXVsPW8ubXVsdGlwbHksby5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlfSxvLmRpdj1vLmRpdmlkZSxvLm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZX0sby5tYXg9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWF4KHRbMF0sblswXSksZVsxXT1NYXRoLm1heCh0WzFdLG5bMV0pLGV9LG8uc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qbixlWzFdPXRbMV0qbixlfSxvLnNjYWxlQW5kQWRkPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXRbMF0rblswXSpyLGVbMV09dFsxXStuWzFdKnIsZX0sby5kaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXTtyZXR1cm4gTWF0aC5zcXJ0KG4qbityKnIpfSxvLmRpc3Q9by5kaXN0YW5jZSxvLnNxdWFyZWREaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXTtyZXR1cm4gbipuK3Iqcn0sby5zcXJEaXN0PW8uc3F1YXJlZERpc3RhbmNlLG8ubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdO3JldHVybiBNYXRoLnNxcnQodCp0K24qbil9LG8ubGVuPW8ubGVuZ3RoLG8uc3F1YXJlZExlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXTtyZXR1cm4gdCp0K24qbn0sby5zcXJMZW49by5zcXVhcmVkTGVuZ3RoLG8ubmVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlfSxvLm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9bipuK3IqcjtyZXR1cm4gaT4wJiYoaT0xL01hdGguc3FydChpKSxlWzBdPXRbMF0qaSxlWzFdPXRbMV0qaSksZX0sby5kb3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXSp0WzBdK2VbMV0qdFsxXX0sby5jcm9zcz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSpuWzFdLXRbMV0qblswXTtyZXR1cm4gZVswXT1lWzFdPTAsZVsyXT1yLGV9LG8ubGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXTtyZXR1cm4gZVswXT1pK3IqKG5bMF0taSksZVsxXT1zK3IqKG5bMV0tcyksZX0sby5yYW5kb209ZnVuY3Rpb24oZSx0KXt0PXR8fDE7dmFyIG49cigpKjIqTWF0aC5QSTtyZXR1cm4gZVswXT1NYXRoLmNvcyhuKSp0LGVbMV09TWF0aC5zaW4obikqdCxlfSxvLnRyYW5zZm9ybU1hdDI9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzJdKmksZVsxXT1uWzFdKnIrblszXSppLGV9LG8udHJhbnNmb3JtTWF0MmQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzJdKmkrbls0XSxlWzFdPW5bMV0qcituWzNdKmkrbls1XSxlfSxvLnRyYW5zZm9ybU1hdDM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzNdKmkrbls2XSxlWzFdPW5bMV0qcituWzRdKmkrbls3XSxlfSxvLnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzRdKmkrblsxMl0sZVsxXT1uWzFdKnIrbls1XSppK25bMTNdLGV9LG8uZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPW8uY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTIpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV07cmV0dXJuIHR9fSgpLG8uc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjMihcIitlWzBdK1wiLCBcIitlWzFdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjMj1vKTt2YXIgdT17fTt1LmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDMpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlfSx1LmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDMpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0fSx1LmZyb21WYWx1ZXM9ZnVuY3Rpb24oZSx0LHIpe3ZhciBpPW5ldyBuKDMpO3JldHVybiBpWzBdPWUsaVsxXT10LGlbMl09cixpfSx1LmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZX0sdS5zZXQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dCxlWzFdPW4sZVsyXT1yLGV9LHUuYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZVsyXT10WzJdK25bMl0sZX0sdS5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGVbMl09dFsyXS1uWzJdLGV9LHUuc3ViPXUuc3VidHJhY3QsdS5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGVbMl09dFsyXSpuWzJdLGV9LHUubXVsPXUubXVsdGlwbHksdS5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlWzJdPXRbMl0vblsyXSxlfSx1LmRpdj11LmRpdmlkZSx1Lm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZVsyXT1NYXRoLm1pbih0WzJdLG5bMl0pLGV9LHUubWF4PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1heCh0WzBdLG5bMF0pLGVbMV09TWF0aC5tYXgodFsxXSxuWzFdKSxlWzJdPU1hdGgubWF4KHRbMl0sblsyXSksZX0sdS5zY2FsZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuLGVbMV09dFsxXSpuLGVbMl09dFsyXSpuLGV9LHUuc2NhbGVBbmRBZGQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dFswXStuWzBdKnIsZVsxXT10WzFdK25bMV0qcixlWzJdPXRbMl0rblsyXSpyLGV9LHUuZGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl07cmV0dXJuIE1hdGguc3FydChuKm4rcipyK2kqaSl9LHUuZGlzdD11LmRpc3RhbmNlLHUuc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdO3JldHVybiBuKm4rcipyK2kqaX0sdS5zcXJEaXN0PXUuc3F1YXJlZERpc3RhbmNlLHUubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXTtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtuKm4rcipyKX0sdS5sZW49dS5sZW5ndGgsdS5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXTtyZXR1cm4gdCp0K24qbityKnJ9LHUuc3FyTGVuPXUuc3F1YXJlZExlbmd0aCx1Lm5lZ2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlfSx1Lm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPW4qbityKnIraSppO3JldHVybiBzPjAmJihzPTEvTWF0aC5zcXJ0KHMpLGVbMF09dFswXSpzLGVbMV09dFsxXSpzLGVbMl09dFsyXSpzKSxlfSx1LmRvdD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdKnRbMF0rZVsxXSp0WzFdK2VbMl0qdFsyXX0sdS5jcm9zcz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89blswXSx1PW5bMV0sYT1uWzJdO3JldHVybiBlWzBdPWkqYS1zKnUsZVsxXT1zKm8tciphLGVbMl09cip1LWkqbyxlfSx1LmxlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdO3JldHVybiBlWzBdPWkrciooblswXS1pKSxlWzFdPXMrciooblsxXS1zKSxlWzJdPW8rciooblsyXS1vKSxlfSx1LnJhbmRvbT1mdW5jdGlvbihlLHQpe3Q9dHx8MTt2YXIgbj1yKCkqMipNYXRoLlBJLGk9cigpKjItMSxzPU1hdGguc3FydCgxLWkqaSkqdDtyZXR1cm4gZVswXT1NYXRoLmNvcyhuKSpzLGVbMV09TWF0aC5zaW4obikqcyxlWzJdPWkqdCxlfSx1LnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bOF0qcytuWzEyXSxlWzFdPW5bMV0qcituWzVdKmkrbls5XSpzK25bMTNdLGVbMl09blsyXSpyK25bNl0qaStuWzEwXSpzK25bMTRdLGV9LHUudHJhbnNmb3JtTWF0Mz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdO3JldHVybiBlWzBdPXIqblswXStpKm5bM10rcypuWzZdLGVbMV09cipuWzFdK2kqbls0XStzKm5bN10sZVsyXT1yKm5bMl0raSpuWzVdK3Mqbls4XSxlfSx1LnRyYW5zZm9ybVF1YXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPW5bMF0sdT1uWzFdLGE9blsyXSxmPW5bM10sbD1mKnIrdSpzLWEqaSxjPWYqaSthKnItbypzLGg9ZipzK28qaS11KnIscD0tbypyLXUqaS1hKnM7cmV0dXJuIGVbMF09bCpmK3AqLW8rYyotYS1oKi11LGVbMV09YypmK3AqLXUraCotby1sKi1hLGVbMl09aCpmK3AqLWErbCotdS1jKi1vLGV9LHUucm90YXRlWD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT1bXSxzPVtdO3JldHVybiBpWzBdPXRbMF0tblswXSxpWzFdPXRbMV0tblsxXSxpWzJdPXRbMl0tblsyXSxzWzBdPWlbMF0sc1sxXT1pWzFdKk1hdGguY29zKHIpLWlbMl0qTWF0aC5zaW4ociksc1syXT1pWzFdKk1hdGguc2luKHIpK2lbMl0qTWF0aC5jb3MociksZVswXT1zWzBdK25bMF0sZVsxXT1zWzFdK25bMV0sZVsyXT1zWzJdK25bMl0sZX0sdS5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPVtdLHM9W107cmV0dXJuIGlbMF09dFswXS1uWzBdLGlbMV09dFsxXS1uWzFdLGlbMl09dFsyXS1uWzJdLHNbMF09aVsyXSpNYXRoLnNpbihyKStpWzBdKk1hdGguY29zKHIpLHNbMV09aVsxXSxzWzJdPWlbMl0qTWF0aC5jb3MociktaVswXSpNYXRoLnNpbihyKSxlWzBdPXNbMF0rblswXSxlWzFdPXNbMV0rblsxXSxlWzJdPXNbMl0rblsyXSxlfSx1LnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9W10scz1bXTtyZXR1cm4gaVswXT10WzBdLW5bMF0saVsxXT10WzFdLW5bMV0saVsyXT10WzJdLW5bMl0sc1swXT1pWzBdKk1hdGguY29zKHIpLWlbMV0qTWF0aC5zaW4ociksc1sxXT1pWzBdKk1hdGguc2luKHIpK2lbMV0qTWF0aC5jb3Mociksc1syXT1pWzJdLGVbMF09c1swXStuWzBdLGVbMV09c1sxXStuWzFdLGVbMl09c1syXStuWzJdLGV9LHUuZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPXUuY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTMpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxlWzJdPXRbdSsyXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV0sdFt1KzJdPWVbMl07cmV0dXJuIHR9fSgpLHUuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjMyhcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjMz11KTt2YXIgYT17fTthLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDQpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTAsZX0sYS5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig0KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHR9LGEuZnJvbVZhbHVlcz1mdW5jdGlvbihlLHQscixpKXt2YXIgcz1uZXcgbig0KTtyZXR1cm4gc1swXT1lLHNbMV09dCxzWzJdPXIsc1szXT1pLHN9LGEuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZX0sYS5zZXQ9ZnVuY3Rpb24oZSx0LG4scixpKXtyZXR1cm4gZVswXT10LGVbMV09bixlWzJdPXIsZVszXT1pLGV9LGEuYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZVsyXT10WzJdK25bMl0sZVszXT10WzNdK25bM10sZX0sYS5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGVbMl09dFsyXS1uWzJdLGVbM109dFszXS1uWzNdLGV9LGEuc3ViPWEuc3VidHJhY3QsYS5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGVbMl09dFsyXSpuWzJdLGVbM109dFszXSpuWzNdLGV9LGEubXVsPWEubXVsdGlwbHksYS5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlWzJdPXRbMl0vblsyXSxlWzNdPXRbM10vblszXSxlfSxhLmRpdj1hLmRpdmlkZSxhLm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZVsyXT1NYXRoLm1pbih0WzJdLG5bMl0pLGVbM109TWF0aC5taW4odFszXSxuWzNdKSxlfSxhLm1heD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5tYXgodFswXSxuWzBdKSxlWzFdPU1hdGgubWF4KHRbMV0sblsxXSksZVsyXT1NYXRoLm1heCh0WzJdLG5bMl0pLGVbM109TWF0aC5tYXgodFszXSxuWzNdKSxlfSxhLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm4sZVsxXT10WzFdKm4sZVsyXT10WzJdKm4sZVszXT10WzNdKm4sZX0sYS5zY2FsZUFuZEFkZD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10WzBdK25bMF0qcixlWzFdPXRbMV0rblsxXSpyLGVbMl09dFsyXStuWzJdKnIsZVszXT10WzNdK25bM10qcixlfSxhLmRpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdLHM9dFszXS1lWzNdO3JldHVybiBNYXRoLnNxcnQobipuK3IqcitpKmkrcypzKX0sYS5kaXN0PWEuZGlzdGFuY2UsYS5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl0scz10WzNdLWVbM107cmV0dXJuIG4qbityKnIraSppK3Mqc30sYS5zcXJEaXN0PWEuc3F1YXJlZERpc3RhbmNlLGEubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM107cmV0dXJuIE1hdGguc3FydCh0KnQrbipuK3IqcitpKmkpfSxhLmxlbj1hLmxlbmd0aCxhLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXTtyZXR1cm4gdCp0K24qbityKnIraSppfSxhLnNxckxlbj1hLnNxdWFyZWRMZW5ndGgsYS5uZWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZVszXT0tdFszXSxlfSxhLm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKm4rcipyK2kqaStzKnM7cmV0dXJuIG8+MCYmKG89MS9NYXRoLnNxcnQobyksZVswXT10WzBdKm8sZVsxXT10WzFdKm8sZVsyXT10WzJdKm8sZVszXT10WzNdKm8pLGV9LGEuZG90PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0qdFswXStlWzFdKnRbMV0rZVsyXSp0WzJdK2VbM10qdFszXX0sYS5sZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXSx1PXRbM107cmV0dXJuIGVbMF09aStyKihuWzBdLWkpLGVbMV09cytyKihuWzFdLXMpLGVbMl09bytyKihuWzJdLW8pLGVbM109dStyKihuWzNdLXUpLGV9LGEucmFuZG9tPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIHQ9dHx8MSxlWzBdPXIoKSxlWzFdPXIoKSxlWzJdPXIoKSxlWzNdPXIoKSxhLm5vcm1hbGl6ZShlLGUpLGEuc2NhbGUoZSxlLHQpLGV9LGEudHJhbnNmb3JtTWF0ND1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bOF0qcytuWzEyXSpvLGVbMV09blsxXSpyK25bNV0qaStuWzldKnMrblsxM10qbyxlWzJdPW5bMl0qcituWzZdKmkrblsxMF0qcytuWzE0XSpvLGVbM109blszXSpyK25bN10qaStuWzExXSpzK25bMTVdKm8sZX0sYS50cmFuc2Zvcm1RdWF0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz1uWzBdLHU9blsxXSxhPW5bMl0sZj1uWzNdLGw9ZipyK3Uqcy1hKmksYz1mKmkrYSpyLW8qcyxoPWYqcytvKmktdSpyLHA9LW8qci11KmktYSpzO3JldHVybiBlWzBdPWwqZitwKi1vK2MqLWEtaCotdSxlWzFdPWMqZitwKi11K2gqLW8tbCotYSxlWzJdPWgqZitwKi1hK2wqLXUtYyotbyxlfSxhLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT1hLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj00KSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0sZVsyXT10W3UrMl0sZVszXT10W3UrM10scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdLHRbdSsyXT1lWzJdLHRbdSszXT1lWzNdO3JldHVybiB0fX0oKSxhLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzQ9YSk7dmFyIGY9e307Zi5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig0KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGV9LGYuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNCk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0fSxmLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGV9LGYuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxmLnRyYW5zcG9zZT1mdW5jdGlvbihlLHQpe2lmKGU9PT10KXt2YXIgbj10WzFdO2VbMV09dFsyXSxlWzJdPW59ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzJdLGVbMl09dFsxXSxlWzNdPXRbM107cmV0dXJuIGV9LGYuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qcy1pKnI7cmV0dXJuIG8/KG89MS9vLGVbMF09cypvLGVbMV09LXIqbyxlWzJdPS1pKm8sZVszXT1uKm8sZSk6bnVsbH0sZi5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXTtyZXR1cm4gZVswXT10WzNdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlWzNdPW4sZX0sZi5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXtyZXR1cm4gZVswXSplWzNdLWVbMl0qZVsxXX0sZi5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdLGY9blsyXSxsPW5bM107cmV0dXJuIGVbMF09cip1K3MqYSxlWzFdPWkqdStvKmEsZVsyXT1yKmYrcypsLGVbM109aSpmK28qbCxlfSxmLm11bD1mLm11bHRpcGx5LGYucm90YXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmErcyp1LGVbMV09aSphK28qdSxlWzJdPXIqLXUrcyphLGVbM109aSotdStvKmEsZX0sZi5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdO3JldHVybiBlWzBdPXIqdSxlWzFdPWkqdSxlWzJdPXMqYSxlWzNdPW8qYSxlfSxmLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDIoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sZi5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKSl9LGYuTERVPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzJdPXJbMl0vclswXSxuWzBdPXJbMF0sblsxXT1yWzFdLG5bM109clszXS1lWzJdKm5bMV0sW2UsdCxuXX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDI9Zik7dmFyIGw9e307bC5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig2KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGVbNF09MCxlWzVdPTAsZX0sbC5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig2KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdH0sbC5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGV9LGwuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlWzRdPTAsZVs1XT0wLGV9LGwuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9bipzLXIqaTtyZXR1cm4gYT8oYT0xL2EsZVswXT1zKmEsZVsxXT0tciphLGVbMl09LWkqYSxlWzNdPW4qYSxlWzRdPShpKnUtcypvKSphLGVbNV09KHIqby1uKnUpKmEsZSk6bnVsbH0sbC5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXtyZXR1cm4gZVswXSplWzNdLWVbMV0qZVsyXX0sbC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV0sYz1uWzJdLGg9blszXSxwPW5bNF0sZD1uWzVdO3JldHVybiBlWzBdPXIqZitzKmwsZVsxXT1pKmYrbypsLGVbMl09cipjK3MqaCxlWzNdPWkqYytvKmgsZVs0XT1yKnArcypkK3UsZVs1XT1pKnArbypkK2EsZX0sbC5tdWw9bC5tdWx0aXBseSxsLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9TWF0aC5zaW4obiksbD1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmwrcypmLGVbMV09aSpsK28qZixlWzJdPXIqLWYrcypsLGVbM109aSotZitvKmwsZVs0XT11LGVbNV09YSxlfSxsLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj1uWzBdLGw9blsxXTtyZXR1cm4gZVswXT1yKmYsZVsxXT1pKmYsZVsyXT1zKmwsZVszXT1vKmwsZVs0XT11LGVbNV09YSxlfSxsLnRyYW5zbGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV07cmV0dXJuIGVbMF09cixlWzFdPWksZVsyXT1zLGVbM109byxlWzRdPXIqZitzKmwrdSxlWzVdPWkqZitvKmwrYSxlfSxsLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDJkKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIpXCJ9LGwuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpKzEpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0MmQ9bCk7dmFyIGM9e307Yy5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig5KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MSxlWzVdPTAsZVs2XT0wLGVbN109MCxlWzhdPTEsZX0sYy5mcm9tTWF0ND1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbNF0sZVs0XT10WzVdLGVbNV09dFs2XSxlWzZdPXRbOF0sZVs3XT10WzldLGVbOF09dFsxMF0sZX0sYy5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig5KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdFs2XT1lWzZdLHRbN109ZVs3XSx0WzhdPWVbOF0sdH0sYy5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGV9LGMuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTEsZVs1XT0wLGVbNl09MCxlWzddPTAsZVs4XT0xLGV9LGMudHJhbnNwb3NlPWZ1bmN0aW9uKGUsdCl7aWYoZT09PXQpe3ZhciBuPXRbMV0scj10WzJdLGk9dFs1XTtlWzFdPXRbM10sZVsyXT10WzZdLGVbM109bixlWzVdPXRbN10sZVs2XT1yLGVbN109aX1lbHNlIGVbMF09dFswXSxlWzFdPXRbM10sZVsyXT10WzZdLGVbM109dFsxXSxlWzRdPXRbNF0sZVs1XT10WzddLGVbNl09dFsyXSxlWzddPXRbNV0sZVs4XT10WzhdO3JldHVybiBlfSxjLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPWwqby11KmYsaD0tbCpzK3UqYSxwPWYqcy1vKmEsZD1uKmMrcipoK2kqcDtyZXR1cm4gZD8oZD0xL2QsZVswXT1jKmQsZVsxXT0oLWwqcitpKmYpKmQsZVsyXT0odSpyLWkqbykqZCxlWzNdPWgqZCxlWzRdPShsKm4taSphKSpkLGVbNV09KC11Km4raSpzKSpkLGVbNl09cCpkLGVbN109KC1mKm4rciphKSpkLGVbOF09KG8qbi1yKnMpKmQsZSk6bnVsbH0sYy5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdO3JldHVybiBlWzBdPW8qbC11KmYsZVsxXT1pKmYtcipsLGVbMl09cip1LWkqbyxlWzNdPXUqYS1zKmwsZVs0XT1uKmwtaSphLGVbNV09aSpzLW4qdSxlWzZdPXMqZi1vKmEsZVs3XT1yKmEtbipmLGVbOF09bipvLXIqcyxlfSxjLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM10scz1lWzRdLG89ZVs1XSx1PWVbNl0sYT1lWzddLGY9ZVs4XTtyZXR1cm4gdCooZipzLW8qYSkrbiooLWYqaStvKnUpK3IqKGEqaS1zKnUpfSxjLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD1uWzBdLHA9blsxXSxkPW5bMl0sdj1uWzNdLG09bls0XSxnPW5bNV0seT1uWzZdLGI9bls3XSx3PW5bOF07cmV0dXJuIGVbMF09aCpyK3AqbytkKmYsZVsxXT1oKmkrcCp1K2QqbCxlWzJdPWgqcytwKmErZCpjLGVbM109dipyK20qbytnKmYsZVs0XT12KmkrbSp1K2cqbCxlWzVdPXYqcyttKmErZypjLGVbNl09eSpyK2Iqbyt3KmYsZVs3XT15KmkrYip1K3cqbCxlWzhdPXkqcytiKmErdypjLGV9LGMubXVsPWMubXVsdGlwbHksYy50cmFuc2xhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPW5bMF0scD1uWzFdO3JldHVybiBlWzBdPXIsZVsxXT1pLGVbMl09cyxlWzNdPW8sZVs0XT11LGVbNV09YSxlWzZdPWgqcitwKm8rZixlWzddPWgqaStwKnUrbCxlWzhdPWgqcytwKmErYyxlfSxjLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9TWF0aC5zaW4obikscD1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1wKnIraCpvLGVbMV09cCppK2gqdSxlWzJdPXAqcytoKmEsZVszXT1wKm8taCpyLGVbNF09cCp1LWgqaSxlWzVdPXAqYS1oKnMsZVs2XT1mLGVbN109bCxlWzhdPWMsZX0sYy5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV07cmV0dXJuIGVbMF09cip0WzBdLGVbMV09cip0WzFdLGVbMl09cip0WzJdLGVbM109aSp0WzNdLGVbNF09aSp0WzRdLGVbNV09aSp0WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGV9LGMuZnJvbU1hdDJkPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT0wLGVbM109dFsyXSxlWzRdPXRbM10sZVs1XT0wLGVbNl09dFs0XSxlWzddPXRbNV0sZVs4XT0xLGV9LGMuZnJvbVF1YXQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bituLHU9cityLGE9aStpLGY9bipvLGw9cipvLGM9cip1LGg9aSpvLHA9aSp1LGQ9aSphLHY9cypvLG09cyp1LGc9cyphO3JldHVybiBlWzBdPTEtYy1kLGVbM109bC1nLGVbNl09aCttLGVbMV09bCtnLGVbNF09MS1mLWQsZVs3XT1wLXYsZVsyXT1oLW0sZVs1XT1wK3YsZVs4XT0xLWYtYyxlfSxjLm5vcm1hbEZyb21NYXQ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XSx5PW4qdS1yKm8sYj1uKmEtaSpvLHc9bipmLXMqbyxFPXIqYS1pKnUsUz1yKmYtcyp1LHg9aSpmLXMqYSxUPWwqdi1jKmQsTj1sKm0taCpkLEM9bCpnLXAqZCxrPWMqbS1oKnYsTD1jKmctcCp2LEE9aCpnLXAqbSxPPXkqQS1iKkwrdyprK0UqQy1TKk4reCpUO3JldHVybiBPPyhPPTEvTyxlWzBdPSh1KkEtYSpMK2YqaykqTyxlWzFdPShhKkMtbypBLWYqTikqTyxlWzJdPShvKkwtdSpDK2YqVCkqTyxlWzNdPShpKkwtcipBLXMqaykqTyxlWzRdPShuKkEtaSpDK3MqTikqTyxlWzVdPShyKkMtbipMLXMqVCkqTyxlWzZdPSh2KngtbSpTK2cqRSkqTyxlWzddPShtKnctZCp4LWcqYikqTyxlWzhdPShkKlMtdip3K2cqeSkqTyxlKTpudWxsfSxjLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDMoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIiwgXCIrZVs0XStcIiwgXCIrZVs1XStcIiwgXCIrZVs2XStcIiwgXCIrZVs3XStcIiwgXCIrZVs4XStcIilcIn0sYy5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKStNYXRoLnBvdyhlWzRdLDIpK01hdGgucG93KGVbNV0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzddLDIpK01hdGgucG93KGVbOF0sMikpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0Mz1jKTt2YXIgaD17fTtoLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDE2KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPTEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTEsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGguY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMTYpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdFs0XT1lWzRdLHRbNV09ZVs1XSx0WzZdPWVbNl0sdFs3XT1lWzddLHRbOF09ZVs4XSx0WzldPWVbOV0sdFsxMF09ZVsxMF0sdFsxMV09ZVsxMV0sdFsxMl09ZVsxMl0sdFsxM109ZVsxM10sdFsxNF09ZVsxNF0sdFsxNV09ZVsxNV0sdH0saC5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGVbOV09dFs5XSxlWzEwXT10WzEwXSxlWzExXT10WzExXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSxlfSxoLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09MSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MSxlWzExXT0wLGVbMTJdPTAsZVsxM109MCxlWzE0XT0wLGVbMTVdPTEsZX0saC50cmFuc3Bvc2U9ZnVuY3Rpb24oZSx0KXtpZihlPT09dCl7dmFyIG49dFsxXSxyPXRbMl0saT10WzNdLHM9dFs2XSxvPXRbN10sdT10WzExXTtlWzFdPXRbNF0sZVsyXT10WzhdLGVbM109dFsxMl0sZVs0XT1uLGVbNl09dFs5XSxlWzddPXRbMTNdLGVbOF09cixlWzldPXMsZVsxMV09dFsxNF0sZVsxMl09aSxlWzEzXT1vLGVbMTRdPXV9ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzRdLGVbMl09dFs4XSxlWzNdPXRbMTJdLGVbNF09dFsxXSxlWzVdPXRbNV0sZVs2XT10WzldLGVbN109dFsxM10sZVs4XT10WzJdLGVbOV09dFs2XSxlWzEwXT10WzEwXSxlWzExXT10WzE0XSxlWzEyXT10WzNdLGVbMTNdPXRbN10sZVsxNF09dFsxMV0sZVsxNV09dFsxNV07cmV0dXJuIGV9LGguaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XSx5PW4qdS1yKm8sYj1uKmEtaSpvLHc9bipmLXMqbyxFPXIqYS1pKnUsUz1yKmYtcyp1LHg9aSpmLXMqYSxUPWwqdi1jKmQsTj1sKm0taCpkLEM9bCpnLXAqZCxrPWMqbS1oKnYsTD1jKmctcCp2LEE9aCpnLXAqbSxPPXkqQS1iKkwrdyprK0UqQy1TKk4reCpUO3JldHVybiBPPyhPPTEvTyxlWzBdPSh1KkEtYSpMK2YqaykqTyxlWzFdPShpKkwtcipBLXMqaykqTyxlWzJdPSh2KngtbSpTK2cqRSkqTyxlWzNdPShoKlMtYyp4LXAqRSkqTyxlWzRdPShhKkMtbypBLWYqTikqTyxlWzVdPShuKkEtaSpDK3MqTikqTyxlWzZdPShtKnctZCp4LWcqYikqTyxlWzddPShsKngtaCp3K3AqYikqTyxlWzhdPShvKkwtdSpDK2YqVCkqTyxlWzldPShyKkMtbipMLXMqVCkqTyxlWzEwXT0oZCpTLXYqdytnKnkpKk8sZVsxMV09KGMqdy1sKlMtcCp5KSpPLGVbMTJdPSh1Kk4tbyprLWEqVCkqTyxlWzEzXT0obiprLXIqTitpKlQpKk8sZVsxNF09KHYqYi1kKkUtbSp5KSpPLGVbMTVdPShsKkUtYypiK2gqeSkqTyxlKTpudWxsfSxoLmFkam9pbnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz10WzldLGg9dFsxMF0scD10WzExXSxkPXRbMTJdLHY9dFsxM10sbT10WzE0XSxnPXRbMTVdO3JldHVybiBlWzBdPXUqKGgqZy1wKm0pLWMqKGEqZy1mKm0pK3YqKGEqcC1mKmgpLGVbMV09LShyKihoKmctcCptKS1jKihpKmctcyptKSt2KihpKnAtcypoKSksZVsyXT1yKihhKmctZiptKS11KihpKmctcyptKSt2KihpKmYtcyphKSxlWzNdPS0ociooYSpwLWYqaCktdSooaSpwLXMqaCkrYyooaSpmLXMqYSkpLGVbNF09LShvKihoKmctcCptKS1sKihhKmctZiptKStkKihhKnAtZipoKSksZVs1XT1uKihoKmctcCptKS1sKihpKmctcyptKStkKihpKnAtcypoKSxlWzZdPS0obiooYSpnLWYqbSktbyooaSpnLXMqbSkrZCooaSpmLXMqYSkpLGVbN109biooYSpwLWYqaCktbyooaSpwLXMqaCkrbCooaSpmLXMqYSksZVs4XT1vKihjKmctcCp2KS1sKih1KmctZip2KStkKih1KnAtZipjKSxlWzldPS0obiooYypnLXAqdiktbCoocipnLXMqdikrZCoocipwLXMqYykpLGVbMTBdPW4qKHUqZy1mKnYpLW8qKHIqZy1zKnYpK2QqKHIqZi1zKnUpLGVbMTFdPS0obioodSpwLWYqYyktbyoocipwLXMqYykrbCoocipmLXMqdSkpLGVbMTJdPS0obyooYyptLWgqdiktbCoodSptLWEqdikrZCoodSpoLWEqYykpLGVbMTNdPW4qKGMqbS1oKnYpLWwqKHIqbS1pKnYpK2QqKHIqaC1pKmMpLGVbMTRdPS0obioodSptLWEqdiktbyoociptLWkqdikrZCoociphLWkqdSkpLGVbMTVdPW4qKHUqaC1hKmMpLW8qKHIqaC1pKmMpK2wqKHIqYS1pKnUpLGV9LGguZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXSxzPWVbNF0sbz1lWzVdLHU9ZVs2XSxhPWVbN10sZj1lWzhdLGw9ZVs5XSxjPWVbMTBdLGg9ZVsxMV0scD1lWzEyXSxkPWVbMTNdLHY9ZVsxNF0sbT1lWzE1XSxnPXQqby1uKnMseT10KnUtcipzLGI9dCphLWkqcyx3PW4qdS1yKm8sRT1uKmEtaSpvLFM9ciphLWkqdSx4PWYqZC1sKnAsVD1mKnYtYypwLE49ZiptLWgqcCxDPWwqdi1jKmQsaz1sKm0taCpkLEw9YyptLWgqdjtyZXR1cm4gZypMLXkqaytiKkMrdypOLUUqVCtTKnh9LGgubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPXRbOV0scD10WzEwXSxkPXRbMTFdLHY9dFsxMl0sbT10WzEzXSxnPXRbMTRdLHk9dFsxNV0sYj1uWzBdLHc9blsxXSxFPW5bMl0sUz1uWzNdO3JldHVybiBlWzBdPWIqcit3KnUrRSpjK1MqdixlWzFdPWIqaSt3KmErRSpoK1MqbSxlWzJdPWIqcyt3KmYrRSpwK1MqZyxlWzNdPWIqbyt3KmwrRSpkK1MqeSxiPW5bNF0sdz1uWzVdLEU9bls2XSxTPW5bN10sZVs0XT1iKnIrdyp1K0UqYytTKnYsZVs1XT1iKmkrdyphK0UqaCtTKm0sZVs2XT1iKnMrdypmK0UqcCtTKmcsZVs3XT1iKm8rdypsK0UqZCtTKnksYj1uWzhdLHc9bls5XSxFPW5bMTBdLFM9blsxMV0sZVs4XT1iKnIrdyp1K0UqYytTKnYsZVs5XT1iKmkrdyphK0UqaCtTKm0sZVsxMF09YipzK3cqZitFKnArUypnLGVbMTFdPWIqbyt3KmwrRSpkK1MqeSxiPW5bMTJdLHc9blsxM10sRT1uWzE0XSxTPW5bMTVdLGVbMTJdPWIqcit3KnUrRSpjK1MqdixlWzEzXT1iKmkrdyphK0UqaCtTKm0sZVsxNF09YipzK3cqZitFKnArUypnLGVbMTVdPWIqbyt3KmwrRSpkK1MqeSxlfSxoLm11bD1oLm11bHRpcGx5LGgudHJhbnNsYXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXSxzPW5bMl0sbyx1LGEsZixsLGMsaCxwLGQsdixtLGc7cmV0dXJuIHQ9PT1lPyhlWzEyXT10WzBdKnIrdFs0XSppK3RbOF0qcyt0WzEyXSxlWzEzXT10WzFdKnIrdFs1XSppK3RbOV0qcyt0WzEzXSxlWzE0XT10WzJdKnIrdFs2XSppK3RbMTBdKnMrdFsxNF0sZVsxNV09dFszXSpyK3RbN10qaSt0WzExXSpzK3RbMTVdKToobz10WzBdLHU9dFsxXSxhPXRbMl0sZj10WzNdLGw9dFs0XSxjPXRbNV0saD10WzZdLHA9dFs3XSxkPXRbOF0sdj10WzldLG09dFsxMF0sZz10WzExXSxlWzBdPW8sZVsxXT11LGVbMl09YSxlWzNdPWYsZVs0XT1sLGVbNV09YyxlWzZdPWgsZVs3XT1wLGVbOF09ZCxlWzldPXYsZVsxMF09bSxlWzExXT1nLGVbMTJdPW8qcitsKmkrZCpzK3RbMTJdLGVbMTNdPXUqcitjKmkrdipzK3RbMTNdLGVbMTRdPWEqcitoKmkrbSpzK3RbMTRdLGVbMTVdPWYqcitwKmkrZypzK3RbMTVdKSxlfSxoLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXSxzPW5bMl07cmV0dXJuIGVbMF09dFswXSpyLGVbMV09dFsxXSpyLGVbMl09dFsyXSpyLGVbM109dFszXSpyLGVbNF09dFs0XSppLGVbNV09dFs1XSppLGVbNl09dFs2XSppLGVbN109dFs3XSppLGVbOF09dFs4XSpzLGVbOV09dFs5XSpzLGVbMTBdPXRbMTBdKnMsZVsxMV09dFsxMV0qcyxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSxlfSxoLnJvdGF0ZT1mdW5jdGlvbihlLG4scixpKXt2YXIgcz1pWzBdLG89aVsxXSx1PWlbMl0sYT1NYXRoLnNxcnQocypzK28qbyt1KnUpLGYsbCxjLGgscCxkLHYsbSxnLHksYix3LEUsUyx4LFQsTixDLGssTCxBLE8sTSxfO3JldHVybiBNYXRoLmFicyhhKTx0P251bGw6KGE9MS9hLHMqPWEsbyo9YSx1Kj1hLGY9TWF0aC5zaW4ociksbD1NYXRoLmNvcyhyKSxjPTEtbCxoPW5bMF0scD1uWzFdLGQ9blsyXSx2PW5bM10sbT1uWzRdLGc9bls1XSx5PW5bNl0sYj1uWzddLHc9bls4XSxFPW5bOV0sUz1uWzEwXSx4PW5bMTFdLFQ9cypzKmMrbCxOPW8qcypjK3UqZixDPXUqcypjLW8qZixrPXMqbypjLXUqZixMPW8qbypjK2wsQT11Km8qYytzKmYsTz1zKnUqYytvKmYsTT1vKnUqYy1zKmYsXz11KnUqYytsLGVbMF09aCpUK20qTit3KkMsZVsxXT1wKlQrZypOK0UqQyxlWzJdPWQqVCt5Kk4rUypDLGVbM109dipUK2IqTit4KkMsZVs0XT1oKmsrbSpMK3cqQSxlWzVdPXAqaytnKkwrRSpBLGVbNl09ZCprK3kqTCtTKkEsZVs3XT12KmsrYipMK3gqQSxlWzhdPWgqTyttKk0rdypfLGVbOV09cCpPK2cqTStFKl8sZVsxMF09ZCpPK3kqTStTKl8sZVsxMV09dipPK2IqTSt4Kl8sbiE9PWUmJihlWzEyXT1uWzEyXSxlWzEzXT1uWzEzXSxlWzE0XT1uWzE0XSxlWzE1XT1uWzE1XSksZSl9LGgucm90YXRlWD1mdW5jdGlvbihlLHQsbil7dmFyIHI9TWF0aC5zaW4obiksaT1NYXRoLmNvcyhuKSxzPXRbNF0sbz10WzVdLHU9dFs2XSxhPXRbN10sZj10WzhdLGw9dFs5XSxjPXRbMTBdLGg9dFsxMV07cmV0dXJuIHQhPT1lJiYoZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzRdPXMqaStmKnIsZVs1XT1vKmkrbCpyLGVbNl09dSppK2MqcixlWzddPWEqaStoKnIsZVs4XT1mKmktcypyLGVbOV09bCppLW8qcixlWzEwXT1jKmktdSpyLGVbMTFdPWgqaS1hKnIsZX0saC5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1NYXRoLnNpbihuKSxpPU1hdGguY29zKG4pLHM9dFswXSxvPXRbMV0sdT10WzJdLGE9dFszXSxmPXRbOF0sbD10WzldLGM9dFsxMF0saD10WzExXTtyZXR1cm4gdCE9PWUmJihlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0pLGVbMF09cyppLWYqcixlWzFdPW8qaS1sKnIsZVsyXT11KmktYypyLGVbM109YSppLWgqcixlWzhdPXMqcitmKmksZVs5XT1vKnIrbCppLGVbMTBdPXUqcitjKmksZVsxMV09YSpyK2gqaSxlfSxoLnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPU1hdGguc2luKG4pLGk9TWF0aC5jb3Mobikscz10WzBdLG89dFsxXSx1PXRbMl0sYT10WzNdLGY9dFs0XSxsPXRbNV0sYz10WzZdLGg9dFs3XTtyZXR1cm4gdCE9PWUmJihlWzhdPXRbOF0sZVs5XT10WzldLGVbMTBdPXRbMTBdLGVbMTFdPXRbMTFdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzBdPXMqaStmKnIsZVsxXT1vKmkrbCpyLGVbMl09dSppK2MqcixlWzNdPWEqaStoKnIsZVs0XT1mKmktcypyLGVbNV09bCppLW8qcixlWzZdPWMqaS11KnIsZVs3XT1oKmktYSpyLGV9LGguZnJvbVJvdGF0aW9uVHJhbnNsYXRpb249ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1yK3IsYT1pK2ksZj1zK3MsbD1yKnUsYz1yKmEsaD1yKmYscD1pKmEsZD1pKmYsdj1zKmYsbT1vKnUsZz1vKmEseT1vKmY7cmV0dXJuIGVbMF09MS0ocCt2KSxlWzFdPWMreSxlWzJdPWgtZyxlWzNdPTAsZVs0XT1jLXksZVs1XT0xLShsK3YpLGVbNl09ZCttLGVbN109MCxlWzhdPWgrZyxlWzldPWQtbSxlWzEwXT0xLShsK3ApLGVbMTFdPTAsZVsxMl09blswXSxlWzEzXT1uWzFdLGVbMTRdPW5bMl0sZVsxNV09MSxlfSxoLmZyb21RdWF0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4rbix1PXIrcixhPWkraSxmPW4qbyxsPXIqbyxjPXIqdSxoPWkqbyxwPWkqdSxkPWkqYSx2PXMqbyxtPXMqdSxnPXMqYTtyZXR1cm4gZVswXT0xLWMtZCxlWzFdPWwrZyxlWzJdPWgtbSxlWzNdPTAsZVs0XT1sLWcsZVs1XT0xLWYtZCxlWzZdPXArdixlWzddPTAsZVs4XT1oK20sZVs5XT1wLXYsZVsxMF09MS1mLWMsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGguZnJ1c3R1bT1mdW5jdGlvbihlLHQsbixyLGkscyxvKXt2YXIgdT0xLyhuLXQpLGE9MS8oaS1yKSxmPTEvKHMtbyk7cmV0dXJuIGVbMF09cyoyKnUsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09cyoyKmEsZVs2XT0wLGVbN109MCxlWzhdPShuK3QpKnUsZVs5XT0oaStyKSphLGVbMTBdPShvK3MpKmYsZVsxMV09LTEsZVsxMl09MCxlWzEzXT0wLGVbMTRdPW8qcyoyKmYsZVsxNV09MCxlfSxoLnBlcnNwZWN0aXZlPWZ1bmN0aW9uKGUsdCxuLHIsaSl7dmFyIHM9MS9NYXRoLnRhbih0LzIpLG89MS8oci1pKTtyZXR1cm4gZVswXT1zL24sZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09cyxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09KGkrcikqbyxlWzExXT0tMSxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MippKnIqbyxlWzE1XT0wLGV9LGgub3J0aG89ZnVuY3Rpb24oZSx0LG4scixpLHMsbyl7dmFyIHU9MS8odC1uKSxhPTEvKHItaSksZj0xLyhzLW8pO3JldHVybiBlWzBdPS0yKnUsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09LTIqYSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MipmLGVbMTFdPTAsZVsxMl09KHQrbikqdSxlWzEzXT0oaStyKSphLGVbMTRdPShvK3MpKmYsZVsxNV09MSxlfSxoLmxvb2tBdD1mdW5jdGlvbihlLG4scixpKXt2YXIgcyxvLHUsYSxmLGwsYyxwLGQsdixtPW5bMF0sZz1uWzFdLHk9blsyXSxiPWlbMF0sdz1pWzFdLEU9aVsyXSxTPXJbMF0seD1yWzFdLFQ9clsyXTtyZXR1cm4gTWF0aC5hYnMobS1TKTx0JiZNYXRoLmFicyhnLXgpPHQmJk1hdGguYWJzKHktVCk8dD9oLmlkZW50aXR5KGUpOihjPW0tUyxwPWcteCxkPXktVCx2PTEvTWF0aC5zcXJ0KGMqYytwKnArZCpkKSxjKj12LHAqPXYsZCo9dixzPXcqZC1FKnAsbz1FKmMtYipkLHU9YipwLXcqYyx2PU1hdGguc3FydChzKnMrbypvK3UqdSksdj8odj0xL3Yscyo9dixvKj12LHUqPXYpOihzPTAsbz0wLHU9MCksYT1wKnUtZCpvLGY9ZCpzLWMqdSxsPWMqby1wKnMsdj1NYXRoLnNxcnQoYSphK2YqZitsKmwpLHY/KHY9MS92LGEqPXYsZio9dixsKj12KTooYT0wLGY9MCxsPTApLGVbMF09cyxlWzFdPWEsZVsyXT1jLGVbM109MCxlWzRdPW8sZVs1XT1mLGVbNl09cCxlWzddPTAsZVs4XT11LGVbOV09bCxlWzEwXT1kLGVbMTFdPTAsZVsxMl09LShzKm0rbypnK3UqeSksZVsxM109LShhKm0rZipnK2wqeSksZVsxNF09LShjKm0rcCpnK2QqeSksZVsxNV09MSxlKX0saC5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQ0KFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIsIFwiK2VbNl0rXCIsIFwiK2VbN10rXCIsIFwiK2VbOF0rXCIsIFwiK2VbOV0rXCIsIFwiK2VbMTBdK1wiLCBcIitlWzExXStcIiwgXCIrZVsxMl0rXCIsIFwiK2VbMTNdK1wiLCBcIitlWzE0XStcIiwgXCIrZVsxNV0rXCIpXCJ9LGguZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzddLDIpK01hdGgucG93KGVbOF0sMikrTWF0aC5wb3coZVs5XSwyKStNYXRoLnBvdyhlWzEwXSwyKStNYXRoLnBvdyhlWzExXSwyKStNYXRoLnBvdyhlWzEyXSwyKStNYXRoLnBvdyhlWzEzXSwyKStNYXRoLnBvdyhlWzE0XSwyKStNYXRoLnBvdyhlWzE1XSwyKSl9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQ0PWgpO3ZhciBwPXt9O3AuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNCk7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxwLnJvdGF0aW9uVG89ZnVuY3Rpb24oKXt2YXIgZT11LmNyZWF0ZSgpLHQ9dS5mcm9tVmFsdWVzKDEsMCwwKSxuPXUuZnJvbVZhbHVlcygwLDEsMCk7cmV0dXJuIGZ1bmN0aW9uKHIsaSxzKXt2YXIgbz11LmRvdChpLHMpO3JldHVybiBvPC0wLjk5OTk5OT8odS5jcm9zcyhlLHQsaSksdS5sZW5ndGgoZSk8MWUtNiYmdS5jcm9zcyhlLG4saSksdS5ub3JtYWxpemUoZSxlKSxwLnNldEF4aXNBbmdsZShyLGUsTWF0aC5QSSkscik6bz4uOTk5OTk5PyhyWzBdPTAsclsxXT0wLHJbMl09MCxyWzNdPTEscik6KHUuY3Jvc3MoZSxpLHMpLHJbMF09ZVswXSxyWzFdPWVbMV0sclsyXT1lWzJdLHJbM109MStvLHAubm9ybWFsaXplKHIscikpfX0oKSxwLnNldEF4ZXM9ZnVuY3Rpb24oKXt2YXIgZT1jLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpKXtyZXR1cm4gZVswXT1yWzBdLGVbM109clsxXSxlWzZdPXJbMl0sZVsxXT1pWzBdLGVbNF09aVsxXSxlWzddPWlbMl0sZVsyXT0tblswXSxlWzVdPS1uWzFdLGVbOF09LW5bMl0scC5ub3JtYWxpemUodCxwLmZyb21NYXQzKHQsZSkpfX0oKSxwLmNsb25lPWEuY2xvbmUscC5mcm9tVmFsdWVzPWEuZnJvbVZhbHVlcyxwLmNvcHk9YS5jb3B5LHAuc2V0PWEuc2V0LHAuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxwLnNldEF4aXNBbmdsZT1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9TWF0aC5zaW4obik7cmV0dXJuIGVbMF09cip0WzBdLGVbMV09cip0WzFdLGVbMl09cip0WzJdLGVbM109TWF0aC5jb3MobiksZX0scC5hZGQ9YS5hZGQscC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdLGY9blsyXSxsPW5bM107cmV0dXJuIGVbMF09cipsK28qdStpKmYtcyphLGVbMV09aSpsK28qYStzKnUtcipmLGVbMl09cypsK28qZityKmEtaSp1LGVbM109bypsLXIqdS1pKmEtcypmLGV9LHAubXVsPXAubXVsdGlwbHkscC5zY2FsZT1hLnNjYWxlLHAucm90YXRlWD1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK28qdSxlWzFdPWkqYStzKnUsZVsyXT1zKmEtaSp1LGVbM109byphLXIqdSxlfSxwLnJvdGF0ZVk9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYS1zKnUsZVsxXT1pKmErbyp1LGVbMl09cyphK3IqdSxlWzNdPW8qYS1pKnUsZX0scC5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmEraSp1LGVbMV09aSphLXIqdSxlWzJdPXMqYStvKnUsZVszXT1vKmEtcyp1LGV9LHAuY2FsY3VsYXRlVz1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXTtyZXR1cm4gZVswXT1uLGVbMV09cixlWzJdPWksZVszXT0tTWF0aC5zcXJ0KE1hdGguYWJzKDEtbipuLXIqci1pKmkpKSxlfSxwLmRvdD1hLmRvdCxwLmxlcnA9YS5sZXJwLHAuc2xlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdLHU9dFszXSxhPW5bMF0sZj1uWzFdLGw9blsyXSxjPW5bM10saCxwLGQsdixtO3JldHVybiBwPWkqYStzKmYrbypsK3UqYyxwPDAmJihwPS1wLGE9LWEsZj0tZixsPS1sLGM9LWMpLDEtcD4xZS02PyhoPU1hdGguYWNvcyhwKSxkPU1hdGguc2luKGgpLHY9TWF0aC5zaW4oKDEtcikqaCkvZCxtPU1hdGguc2luKHIqaCkvZCk6KHY9MS1yLG09ciksZVswXT12KmkrbSphLGVbMV09dipzK20qZixlWzJdPXYqbyttKmwsZVszXT12KnUrbSpjLGV9LHAuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qbityKnIraSppK3Mqcyx1PW8/MS9vOjA7cmV0dXJuIGVbMF09LW4qdSxlWzFdPS1yKnUsZVsyXT0taSp1LGVbM109cyp1LGV9LHAuY29uanVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGVbM109dFszXSxlfSxwLmxlbmd0aD1hLmxlbmd0aCxwLmxlbj1wLmxlbmd0aCxwLnNxdWFyZWRMZW5ndGg9YS5zcXVhcmVkTGVuZ3RoLHAuc3FyTGVuPXAuc3F1YXJlZExlbmd0aCxwLm5vcm1hbGl6ZT1hLm5vcm1hbGl6ZSxwLmZyb21NYXQzPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSt0WzRdK3RbOF0scjtpZihuPjApcj1NYXRoLnNxcnQobisxKSxlWzNdPS41KnIscj0uNS9yLGVbMF09KHRbN10tdFs1XSkqcixlWzFdPSh0WzJdLXRbNl0pKnIsZVsyXT0odFszXS10WzFdKSpyO2Vsc2V7dmFyIGk9MDt0WzRdPnRbMF0mJihpPTEpLHRbOF0+dFtpKjMraV0mJihpPTIpO3ZhciBzPShpKzEpJTMsbz0oaSsyKSUzO3I9TWF0aC5zcXJ0KHRbaSozK2ldLXRbcyozK3NdLXRbbyozK29dKzEpLGVbaV09LjUqcixyPS41L3IsZVszXT0odFtvKjMrc10tdFtzKjMrb10pKnIsZVtzXT0odFtzKjMraV0rdFtpKjMrc10pKnIsZVtvXT0odFtvKjMraV0rdFtpKjMrb10pKnJ9cmV0dXJuIGV9LHAuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwicXVhdChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUucXVhdD1wKX0odC5leHBvcnRzKX0pKHRoaXMpO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5hbmd1bGFyLm1vZHVsZSggJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmJ1c3lDb3ZlcicsIFtdIClcbiAgICAuZGlyZWN0aXZlKCAnYnVzeUNvdmVyJywgWyAnJHJvb3RTY29wZScsXG4gICAgICAgIGZ1bmN0aW9uICgkcm9vdFNjb3BlKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9idXN5Q292ZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRyb290U2NvcGUubG9hZGluZykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5idXN5TWVzc2FnZSA9ICdMb2FkaW5nLi4uJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggJHJvb3RTY29wZS5pbml0aWFsaXppbmcgKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5idXN5TWVzc2FnZSA9ICdJbml0aWFsaXppbmcuLi4nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCAkcm9vdFNjb3BlLmJ1c3kgKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNjb3BlLmJ1c3lNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmJ1c3lNZXNzYWdlID0gJ0p1c3QgYSBzZWNvbmQuLi4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKG5ld1ZhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdvZmYnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ29mZicpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCAnLi9jb21wb25lbnRXaXJlU2VnbWVudCcgKTtcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmNvbXBvbmVudFdpcmUnLCBbXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlLnNlZ21lbnQnXG4gICAgXVxuKVxuICAgIC5jb250cm9sbGVyKCAnQ29tcG9uZW50V2lyZUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcbiAgICAgICAgJHNjb3BlLmdldFNlZ21lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVuZFBvc2l0aW9ucyxcbiAgICAgICAgICAgICAgICB4MSwgeTEsIHgyLCB5MjtcblxuICAgICAgICAgICAgZW5kUG9zaXRpb25zID0gJHNjb3BlLndpcmUuZ2V0RW5kUG9zaXRpb25zKCk7XG5cbiAgICAgICAgICAgIHgxID0gZW5kUG9zaXRpb25zLngxO1xuICAgICAgICAgICAgeDIgPSBlbmRQb3NpdGlvbnMueDI7XG4gICAgICAgICAgICB5MSA9IGVuZFBvc2l0aW9ucy55MTtcbiAgICAgICAgICAgIHkyID0gZW5kUG9zaXRpb25zLnkyO1xuXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIGVuZFBvc2l0aW9uc1xuICAgICAgICAgICAgXTtcblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vblNlZ21lbnRDbGljayA9IGZ1bmN0aW9uICggd2lyZSwgc2VnbWVudCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCB3aXJlLCBzZWdtZW50ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNlZ21lbnRzID0gJHNjb3BlLmdldFNlZ21lbnRzKCk7XG5cbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKFxuICAgICAgICAnY29tcG9uZW50V2lyZScsXG5cbiAgICAgICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb21wb25lbnRXaXJlQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvY29tcG9uZW50V2lyZS5odG1sJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbik7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlLnNlZ21lbnQnLCBbXVxuKVxuXG4uZGlyZWN0aXZlKFxuICAgICdjb21wb25lbnRXaXJlU2VnbWVudCcsXG5cbiAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9jb21wb25lbnRXaXJlU2VnbWVudC5odG1sJyxcbiAgICAgICAgICAgIHRlbXBsYXRlTmFtZXNwYWNlOiAnU1ZHJ1xuICAgICAgICB9O1xuICAgIH1cbik7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5hbmd1bGFyLm1vZHVsZSggJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRlc2lnbkVkaXRvcicsIFtdIClcbiAgICAuY29udHJvbGxlciggJ0Rlc2lnbkVkaXRvckNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsIGRpYWdyYW1TZXJ2aWNlLCAkbG9nLCBkZXNpZ25TZXJ2aWNlLCAkc3RhdGVQYXJhbXMpIHtcblxuICAgICAgICB2YXIgZGVzaWduQ3R4O1xuXG4gICAgICAgICRzY29wZS5kaWFncmFtID0ge307XG5cbiAgICAgICAgZGVzaWduQ3R4ID0ge1xuICAgICAgICAgICAgZGI6ICRyb290U2NvcGUubWFpbkRiQ29ubmVjdGlvbklkLFxuICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25fJyArICggbmV3IERhdGUoKSApLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbUNvbnRhaW5lckNvbmZpZyA9IHtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICgkc3RhdGVQYXJhbXMuY29udGFpbmVySWQgPT09ICdkdW1teScpIHtcblxuICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0gPSBkaWFncmFtU2VydmljZS5nZXREaWFncmFtKCk7XG5cbiAgICAgICAgICAgICRsb2cuZGVidWcoJ0xvYWRpbmcgZHVtbXkgZGlhZ3JhbTonLCAkc2NvcGUuZGlhZ3JhbSk7XG5cblxuICAgICAgICB9IGVsc2Uge1xuXG5cbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hEZXNpZ25TdHJ1Y3R1cmUoZGVzaWduQ3R4LCAkcm9vdFNjb3BlLmFjdGl2ZURlc2lnbi5pZCwgZnVuY3Rpb24gKC8qZGVzaWduU3RydWN0dXJlVXBkYXRlT2JqZWN0Ki8pIHtcblxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGVzaWduU3RydWN0dXJlKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkZXNpZ25TdHJ1Y3R1cmUpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cblxuXG4gICAgfSlcbiAgICAuZGlyZWN0aXZlKCAnZGVzaWduRWRpdG9yJywgW1xuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduRWRpdG9yQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgJHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2Rlc2lnbkVkaXRvci5odG1sJ1xuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSApO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsICRsb2cpIHtcblxuICAgIHZhciBqc3AsXG4gICAgICAgIGpzcFJlaW5pdCxcbiAgICAgICAganNwUGFuZSxcblxuICAgICAgICBzY3JvbGxQb3NpdGlvblgsXG4gICAgICAgIHNjcm9sbFBvc2l0aW9uWSxcblxuICAgICAgICB1cGRhdGVWaXNpYmxlQXJlYSxcbiAgICAgICAgdXBkYXRlUHJvbWlzZSxcblxuICAgICAgICBvbldpbmRvd1Jlc2l6ZTtcblxuXG4gICAgdXBkYXRlVmlzaWJsZUFyZWEgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGxlZnQsXG4gICAgICAgICAgICB0b3AsXG4gICAgICAgICAgICBfdXBkYXRlVmlzaWJsZUFyZWE7XG5cbiAgICAgICAgX3VwZGF0ZVZpc2libGVBcmVhID0gZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgJHNjb3BlLnZpc2libGVBcmVhID0ge1xuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQgfHwgMCxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCB8fCAwLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiBsZWZ0ICsgJHNjb3BlLiRjb250ZW50UGFuZS53aWR0aCgpLFxuICAgICAgICAgICAgICAgIGJvdHRvbTogdG9wICsgJHNjb3BlLiRjb250ZW50UGFuZS5oZWlnaHQoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChqc3BQYW5lKSB7XG5cbiAgICAgICAgICAgIGxlZnQgPSBzY3JvbGxQb3NpdGlvblggfHwgMDtcbiAgICAgICAgICAgIHRvcCA9IHNjcm9sbFBvc2l0aW9uWSB8fCAwO1xuXG4gICAgICAgICAgICBpZiAodXBkYXRlUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbCh1cGRhdGVQcm9taXNlKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9ICR0aW1lb3V0KF91cGRhdGVWaXNpYmxlQXJlYSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBqc3BSZWluaXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoanNwKSkge1xuXG4gICAgICAgICAgICAkbG9nLmRlYnVnKCdSZWluaXRpYWxpemluZyBKU1AuJyk7XG4gICAgICAgICAgICBqc3AucmVpbml0aWFsaXNlKCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgICRzY29wZS4kb24oJ0RpYWdyYW1Db250YWluZXJJbml0aWFsaXplZCcsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAkc2NvcGUuJGNvbnRlbnRQYW5lXG5cbiAgICAgICAgICAgIC5iaW5kKCdqc3AtaW5pdGlhbGlzZWQnLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGpzcFBhbmUgPSAkc2NvcGUuJGNvbnRlbnRQYW5lLmZpbmQoJy5qc3BQYW5lJyk7XG4gICAgICAgICAgICAgICAgdXBkYXRlVmlzaWJsZUFyZWEoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgICAgICAgLmJpbmQoJ2pzcC1zY3JvbGwteScsIGZ1bmN0aW9uIChldmVudCwgYVNjcm9sbFBvc2l0aW9uWSkge1xuXG4gICAgICAgICAgICAgICAgc2Nyb2xsUG9zaXRpb25ZID0gYVNjcm9sbFBvc2l0aW9uWTtcblxuICAgICAgICAgICAgICAgIHVwZGF0ZVZpc2libGVBcmVhKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICAgICAgIC5iaW5kKCdqc3Atc2Nyb2xsLXgnLCBmdW5jdGlvbiAoZXZlbnQsIGFTY3JvbGxQb3NpdGlvblgpIHtcblxuICAgICAgICAgICAgICAgIHNjcm9sbFBvc2l0aW9uWCA9IGFTY3JvbGxQb3NpdGlvblg7XG5cbiAgICAgICAgICAgICAgICB1cGRhdGVWaXNpYmxlQXJlYSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICApXG4vLyAgICAgICAgICAgIC5iaW5kKFxuLy8gICAgICAgICAgICAnanNwLWFycm93LWNoYW5nZScsXG4vLyAgICAgICAgICAgIGZ1bmN0aW9uIChldmVudCwgaXNBdFRvcCwgaXNBdEJvdHRvbSwgaXNBdExlZnQsIGlzQXRSaWdodCkge1xuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0hhbmRsZSBqc3AtYXJyb3ctY2hhbmdlJywgdGhpcyxcbi8vICAgICAgICAgICAgICAgICAgICAnaXNBdFRvcD0nLCBpc0F0VG9wLFxuLy8gICAgICAgICAgICAgICAgICAgICdpc0F0Qm90dG9tPScsIGlzQXRCb3R0b20sXG4vLyAgICAgICAgICAgICAgICAgICAgJ2lzQXRMZWZ0PScsIGlzQXRMZWZ0LFxuLy8gICAgICAgICAgICAgICAgICAgICdpc0F0UmlnaHQ9JywgaXNBdFJpZ2h0KTtcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgIClcbiAgICAgICAgICAgIC5qU2Nyb2xsUGFuZShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbERyYWdNaW5IZWlnaHQ6IDYwLFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsRHJhZ01heEhlaWdodDogNjAsXG4gICAgICAgICAgICAgICAgaG9yaXpvbnRhbERyYWdNaW5XaWR0aDogNjAsXG4gICAgICAgICAgICAgICAgaG9yaXpvbnRhbERyYWdNYXhXaWR0aDogNjAsXG4gICAgICAgICAgICAgICAgYW5pbWF0ZVNjcm9sbDogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGpzcCA9ICRzY29wZS4kY29udGVudFBhbmUuZGF0YSgnanNwJyk7XG5cbiAgICAgICAganNwUmVpbml0KCk7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUuJG9uKCdEaWFncmFtSW5pdGlhbGl6ZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGpzcFJlaW5pdCgpO1xuICAgIH0pO1xuXG5cbiAgICBvbldpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBqc3BSZWluaXQoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5vbldpbmRvd1Jlc2l6ZSA9IG9uV2luZG93UmVzaXplO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbn07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgJCovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbnJlcXVpcmUoJy4uL2RyYXdpbmdHcmlkL2RyYXdpbmdHcmlkLmpzJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kaWFncmFtQ29udGFpbmVyJywgW1xuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZHJhd2luZ0dyaWQnLFxuICAgICAgICAncGFuem9vbScsXG4gICAgICAgICdwYW56b29td2lkZ2V0JyxcbiAgICAgICAgJ2lzaXMudWkuY29udGV4dG1lbnUnXG4gICAgXSlcbiAgICAuY29udHJvbGxlcignRGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXInLCBbXG4gICAgICAgICckc2NvcGUnLFxuICAgICAgICAnJHRpbWVvdXQnLFxuICAgICAgICAnJGxvZycsXG4gICAgICAgICdQYW5ab29tU2VydmljZScsXG4gICAgICAgICckd2luZG93JyxcbiAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsICRsb2csIFBhblpvb21TZXJ2aWNlLCAkd2luZG93KSB7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcblxuICAgICAgICAgICAgICAgICR3aW5kb3dFbGVtZW50LFxuXG4gICAgICAgICAgICAgICAgY29tcGlsZWREaXJlY3RpdmVzLFxuXG4gICAgICAgICAgICAgICAgU2Nyb2xsSGFuZGxlcixcbiAgICAgICAgICAgICAgICBzY3JvbGxIYW5kbGVyO1xuXG4gICAgICAgICAgICBjb21waWxlZERpcmVjdGl2ZXMgPSB7fTtcblxuICAgICAgICAgICAgU2Nyb2xsSGFuZGxlciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9TY3JvbGxIYW5kbGVyJyk7XG4gICAgICAgICAgICBzY3JvbGxIYW5kbGVyID0gbmV3IFNjcm9sbEhhbmRsZXIoJHNjb3BlLCAkdGltZW91dCwgJGxvZyk7XG5cblxuICAgICAgICAgICAgJHNjb3BlLnBhbnpvb21JZCA9ICdwYW56b29tSWQnOyAvL3Njb3BlLmlkICsgJy1wYW56b29tZWQnO1xuXG4gICAgICAgICAgICAkc2NvcGUuem9vbUxldmVsID0gNDtcblxuICAgICAgICAgICAgJHNjb3BlLnBhbnpvb21Nb2RlbCA9IHt9OyAvLyBhbHdheXMgcGFzcyBlbXB0eSBvYmplY3RcblxuICAgICAgICAgICAgJHNjb3BlLnBhbnpvb21Db25maWcgPSB7XG4gICAgICAgICAgICAgICAgem9vbUxldmVsczogMTAsXG4gICAgICAgICAgICAgICAgbmV1dHJhbFpvb21MZXZlbDogJHNjb3BlLnpvb21MZXZlbCxcbiAgICAgICAgICAgICAgICBzY2FsZVBlclpvb21MZXZlbDogMS4yNSxcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogNTAsXG4gICAgICAgICAgICAgICAgaGFsdFNwZWVkOiA1MCxcblxuICAgICAgICAgICAgICAgIG1vZGVsQ2hhbmdlZENhbGxiYWNrOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIFBhblpvb21TZXJ2aWNlLmdldEFQSSgkc2NvcGUucGFuem9vbUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFwaSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvcExlZnRDb3JuZXIsIGJvdHRvbVJpZ2h0Q29ybmVyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnpvb21MZXZlbCA9IHZhbC56b29tTGV2ZWw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BMZWZ0Q29ybmVyID0gYXBpLmdldE1vZGVsUG9zaXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3R0b21SaWdodENvcm5lciA9IGFwaS5nZXRNb2RlbFBvc2l0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogJHNjb3BlLmNhbnZhc1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAkc2NvcGUuY2FudmFzSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUudmlzaWJsZUFyZWEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogdG9wTGVmdENvcm5lci55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0b3BMZWZ0Q29ybmVyLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBib3R0b21SaWdodENvcm5lci54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3R0b206IGJvdHRvbVJpZ2h0Q29ybmVyLnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICR3aW5kb3dFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpO1xuXG4gICAgICAgICAgICAkd2luZG93RWxlbWVudC5iaW5kKFxuICAgICAgICAgICAgICAgICdyZXNpemUnLCBzY3JvbGxIYW5kbGVyLm9uV2luZG93UmVzaXplXG4gICAgICAgICAgICApO1xuXG5cbiAgICAgICAgICAgICRzY29wZS5nZXRDc3NDbGFzcyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBjbGFzc1N0cmluZztcblxuICAgICAgICAgICAgICAgIGNsYXNzU3RyaW5nID0gJ2RpYWdyYW0tY29udGFpbmVyJztcblxuICAgICAgICAgICAgICAgIGNsYXNzU3RyaW5nICs9ICcgem9vbS1sZXZlbC0nICsgJHNjb3BlLnpvb21MZXZlbDtcblxuICAgICAgICAgICAgICAgIGNsYXNzU3RyaW5nICs9IHNlbGYuaXNFZGl0YWJsZSgpID8gJyBlZGl0YWJsZScgOiAncmVhZG9ubHknO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXNzU3RyaW5nO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRWaXNpYmxlQXJlYSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnZpc2libGVBcmVhO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRJZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmlkO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXREaWFncmFtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuZGlhZ3JhbTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0Wm9vbUxldmVsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuem9vbUxldmVsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRDb21waWxlZERpcmVjdGl2ZSA9IGZ1bmN0aW9uIChkaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWREaXJlY3RpdmVzW2RpcmVjdGl2ZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLnNldENvbXBpbGVkRGlyZWN0aXZlID0gZnVuY3Rpb24gKGRpcmVjdGl2ZSwgY29tcGlsZWREaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBjb21waWxlZERpcmVjdGl2ZXNbZGlyZWN0aXZlXSA9IGNvbXBpbGVkRGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5pc0VkaXRhYmxlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5kaWFncmFtLmNvbmZpZy5lZGl0YWJsZSA9PT0gdHJ1ZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuaXNDb21wb25lbnRTZWxlY3RlZCA9IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZihjb21wb25lbnQuaWQpID4gLTE7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldENvbmZpZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmNvbmZpZztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuc2V0SW5pdGlhbGl6ZWQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuaW5pdGlhbGl6ZWQgPSB2YWw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH1cbiAgICBdKVxuICAgIC5kaXJlY3RpdmUoJ2RpYWdyYW1Db250YWluZXInLCBbXG4gICAgICAgICdkaWFncmFtU2VydmljZScsICckbG9nJywgJyR0aW1lb3V0JywgJ1Bhblpvb21TZXJ2aWNlJyxcbiAgICAgICAgZnVuY3Rpb24gKGRpYWdyYW1TZXJ2aWNlLCAkbG9nLCAkdGltZW91dCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEaWFncmFtQ29udGFpbmVyQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAJyxcbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbTogJz0nLFxuICAgICAgICAgICAgICAgICAgICBjb25maWc6ICc9J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9kaWFncmFtQ29udGFpbmVyLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ0luIGRpYWdyYW0gY29udGFpbmVyJywgc2NvcGUudmlzaWJsZUFyZWEpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbmZpZyA9IHNjb3BlLmNvbmZpZyB8fCB7fTtcblxuLy8gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNhbnZhc1dpZHRoID0gJChlbGVtZW50KVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAub3V0ZXJXaWR0aCgpO1xuLy8gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNhbnZhc0hlaWdodCA9ICQoZWxlbWVudClcbi8vICAgICAgICAgICAgICAgICAgICAgICAgLm91dGVySGVpZ2h0KCk7XG4vL1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICBzY29wZS52aXNpYmxlQXJlYSA9IHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAwLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogc2NvcGUuY2FudmFzV2lkdGgsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbTogc2NvcGUuY2FudmFzSGVpZ2h0XG4vLyAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRjb250ZW50UGFuZSA9IGVsZW1lbnQuZmluZCgnPi5kaWFncmFtLWNvbnRlbnQtcGFuZScpO1xuXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGJyb2FkY2FzdCgnRGlhZ3JhbUNvbnRhaW5lckluaXRpYWxpemVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xuXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgJCovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbmFuZ3VsYXIubW9kdWxlKCAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZHJhd2luZ0dyaWQnLCBbXSApXG4gICAgLmRpcmVjdGl2ZSggJ2RyYXdpbmdHcmlkJywgWyAnJGxvZycsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2RyYXdpbmdHcmlkLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciAkZWxlbWVudDtcblxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdkaWFncmFtLmNvbmZpZy53aWR0aCcsIGZ1bmN0aW9uKG5ld1ZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5vdXRlcldpZHRoKG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnZGlhZ3JhbS5jb25maWcuaGVpZ2h0JywgZnVuY3Rpb24obmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5vdXRlckhlaWdodChuZXdWYWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBmYWJyaWMqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5hbmd1bGFyLm1vZHVsZSggJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmZhYnJpY0NhbnZhcycsIFtdIClcbiAgICAuY29udHJvbGxlciggJ0ZhYnJpY0NhbnZhc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKCAnZmFicmljQ2FudmFzJywgW1xuICAgICAgICAnJGxvZycsXG4gICAgICAgICdkaWFncmFtU2VydmljZScsXG4gICAgICAgIGZ1bmN0aW9uICggJGxvZywgZGlhZ3JhbVNlcnZpY2UgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgICAgICBzY29wZToge30sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0ZhYnJpY0NhbnZhc0NvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIHJlcXVpcmU6ICdeZGlhZ3JhbUNvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZmFicmljQ2FudmFzLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICggc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGRpYWdyYW1Db250YWluZXJDdHJsICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhclxuICAgICAgICAgICAgICAgICAgICBjYW52YXMsXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJEaWFncmFtO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmlkID0gZGlhZ3JhbUNvbnRhaW5lckN0cmwuZ2V0SWQoKSArICdmYWJyaWMtY2FudmFzJztcblxuICAgICAgICAgICAgICAgICAgICBjYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcyggc2NvcGUuaWQgKTtcblxuICAgICAgICAgICAgICAgICAgICBjYW52YXMuc2V0QmFja2dyb3VuZENvbG9yKCAncmdiYSgyNTUsIDczLCA2NCwgMC42KScgKTtcblxuICAgICAgICAgICAgICAgICAgICByZW5kZXJEaWFncmFtID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNPYmplY3QoIHNjb3BlLmRpYWdyYW1EYXRhICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNBcnJheSggc2NvcGUuZGlhZ3JhbURhdGEuc3ltYm9scyApICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggc2NvcGUuZGlhZ3JhbURhdGEuc3ltYm9scywgZnVuY3Rpb24gKCBzeW1ib2wgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWdyYW1TZXJ2aWNlLmdldFNWR0ZvclN5bWJvbFR5cGUoIHN5bWJvbC50eXBlIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBvYmplY3QgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN2Z09iamVjdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmdPYmplY3QgPSBvYmplY3Quc2V0KCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzeW1ib2wueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogc3ltYm9sLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmdsZTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICBjYW52YXMuYWRkKHN2Z09iamVjdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlY3QgPSBuZXcgZmFicmljLlJlY3QoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogNTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiAnZ3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5nbGU6IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogMTBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5hZGQoIHJlY3QgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdlJywgc3ZnT2JqZWN0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMucmVuZGVyQWxsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlbmRlckFsbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCBkaWFncmFtQ29udGFpbmVyQ3RybC5nZXREaWFncmFtRGF0YSwgZnVuY3Rpb24gKCB2YWx1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoICdEaWFncmFtRGF0YSBpcyAnLCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlhZ3JhbURhdGEgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckRpYWdyYW0oKTtcblxuICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5wb3J0JywgW11cbilcbiAgICAuY29udHJvbGxlciggJ1BvcnRDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUgKSB7XG4gICAgICAgICRzY29wZS5nZXRQb3J0VHJhbnNmb3JtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybVN0cmluZztcblxuICAgICAgICAgICAgdHJhbnNmb3JtU3RyaW5nID0gJ3RyYW5zbGF0ZSgnICsgJHNjb3BlLnBvcnRJbnN0YW5jZS5wb3J0U3ltYm9sLnggKyAnLCcgKyAkc2NvcGUucG9ydEluc3RhbmNlLnBvcnRTeW1ib2xcbiAgICAgICAgICAgICAgICAueSArICcpJztcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVN0cmluZztcbiAgICAgICAgfTtcbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKFxuICAgICAgICAncG9ydCcsXG5cbiAgICAgICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNjb3BlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUG9ydENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL3BvcnQuaHRtbCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVOYW1lc3BhY2U6ICdTVkcnLFxuICAgICAgICAgICAgICAgIHJlcXVpcmU6IFsgJ15zdmdEaWFncmFtJywgJ15kaWFncmFtQ29udGFpbmVyJyBdLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICggc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGNvbnRyb2xsZXJzICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdmdEaWFncmFtQ29udHJvbGxlcjtcblxuICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlciA9IGNvbnRyb2xsZXJzWyAwIF07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25Qb3J0Q2xpY2sgPSBmdW5jdGlvbiAoIHBvcnQsICRldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uUG9ydENsaWNrKCBzY29wZS5jb21wb25lbnQsIHBvcnQsICRldmVudCApO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUG9ydE1vdXNlRG93biA9IGZ1bmN0aW9uICggcG9ydCwgJGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIub25Qb3J0TW91c2VEb3duKCBzY29wZS5jb21wb25lbnQsIHBvcnQsICRldmVudCApO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUG9ydE1vdXNlVXAgPSBmdW5jdGlvbiAoIHBvcnQsICRldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uUG9ydE1vdXNlVXAoIHNjb3BlLmNvbXBvbmVudCwgcG9ydCwgJGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHJlc2l6ZVRvSGVpZ2h0TW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ21tcy5yZXNpemVUb0hlaWdodCcsIFtdKTtcblxuXG5yZXNpemVUb0hlaWdodE1vZHVsZS5kaXJlY3RpdmUoJ3Jlc2l6ZVRvSGVpZ2h0JywgZnVuY3Rpb24gKCR3aW5kb3cpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGhlaWdodElzTGVzc1dpdGg6ICc9PydcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG5cbiAgICAgICAgICAgIHZhciB3aW5kb3cgPSBhbmd1bGFyLmVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3dcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG1pbkhlaWdodCA9IHBhcnNlSW50KGF0dHJpYnV0ZXMubWluZEhlaWdodCwgMTApIHx8IDAsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0ID0gcGFyc2VJbnQoYXR0cmlidXRlcy5tYXhIZWlnaHQsIDEwKSB8fCBJbmZpbml0eSxcbiAgICAgICAgICAgICAgICBoZWlnaHRJc0xlc3NXaXRoID0gcGFyc2VJbnQoc2NvcGUuaGVpZ2h0SXNMZXNzV2l0aCwgMTApIHx8IDA7XG5cbiAgICAgICAgICAgIHNjb3BlLmdldFdpbmRvd0hlaWdodCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBtYXgsIG1pbixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gKCR3aW5kb3cuaW5uZXJIZWlnaHQgPiAwKSA/ICR3aW5kb3cuaW5uZXJIZWlnaHQgOiBzY3JlZW4uaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgbWF4ID0gbWF4SGVpZ2h0O1xuICAgICAgICAgICAgICAgIG1pbiA9IG1pbkhlaWdodDtcblxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLm1heChNYXRoLm1pbihoZWlnaHQgLSBoZWlnaHRJc0xlc3NXaXRoLCBtYXgpLCBtaW4pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKHNjb3BlLmdldFdpbmRvd0hlaWdodCxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vdXRlckhlaWdodChuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5iaW5kKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXNpemVUb0hlaWdodE1vZHVsZTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG4ndXNlIHN0cmljdCc7XG5cbnZhciByZXNpemVUb1dpbmRvd01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdtbXMucmVzaXplVG9XaW5kb3cnLCBbXSk7XG5cblxucmVzaXplVG9XaW5kb3dNb2R1bGUuZGlyZWN0aXZlKCdyZXNpemVUb1dpbmRvdycsIGZ1bmN0aW9uICgkd2luZG93KSB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuXG4gICAgdmFyIHdpbmRvdyA9IGFuZ3VsYXIuZWxlbWVudChcbiAgICAgICAgJHdpbmRvd1xuICAgICAgKSxcbiAgICAgIG1pbldpZHRoID0gcGFyc2VJbnQoYXR0cmlidXRlcy5taW5XaWR0aCwgMTApIHx8IDAsXG4gICAgICBtaW5IZWlnaHQgPSBwYXJzZUludChhdHRyaWJ1dGVzLm1pbmRIZWlnaHQsIDEwKSB8fCAwLFxuICAgICAgbWF4V2lkdGggPSBwYXJzZUludChhdHRyaWJ1dGVzLm1heFdpZHRoLCAxMCkgfHwgSW5maW5pdHksXG4gICAgICBtYXhIZWlnaHQgPSBwYXJzZUludChhdHRyaWJ1dGVzLm1heEhlaWdodCwgMTApIHx8IEluZmluaXR5LFxuICAgICAgd2lkdGhJc0xlc3NXaXRoID0gcGFyc2VJbnQoYXR0cmlidXRlcy53aWR0aElzTGVzc1dpdGgsIDEwKSB8fCAwLFxuICAgICAgaGVpZ2h0SXNMZXNzV2l0aCA9IHBhcnNlSW50KGF0dHJpYnV0ZXMuaGVpZ2h0SXNMZXNzV2l0aCwgMTApIHx8IDAsXG5cbiAgICAgIHJldmVyc2VJblBvcnRyYWl0ID0gdHJ1ZTtcblxuICAgIHNjb3BlLmdldFdpbmRvd0hlaWdodCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIG1heCwgbWluLFxuICAgICAgICBoZWlnaHQsIHdpZHRoO1xuXG4gICAgICBoZWlnaHQgPSAoJHdpbmRvdy5pbm5lckhlaWdodCA+IDApID8gJHdpbmRvdy5pbm5lckhlaWdodCA6IHNjcmVlbi5oZWlnaHQ7XG4gICAgICB3aWR0aCA9ICgkd2luZG93LmlubmVyV2lkdGggPiAwKSA/ICR3aW5kb3cuaW5uZXJXaWR0aCA6IHNjcmVlbi53aWR0aDtcblxuICAgICAgaWYgKHJldmVyc2VJblBvcnRyYWl0ICYmIGhlaWdodD53aWR0aCkge1xuICAgICAgICBtYXggPSBtYXhXaWR0aDtcbiAgICAgICAgbWluID0gbWluV2lkdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXggPSBtYXhIZWlnaHQ7XG4gICAgICAgIG1pbiA9IG1pbkhlaWdodDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKGhlaWdodC1oZWlnaHRJc0xlc3NXaXRoLCBtYXgpLCBtaW4pO1xuICAgIH07XG5cbiAgICBzY29wZS5nZXRXaW5kb3dXaWR0aCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIG1heCwgbWluLFxuICAgICAgICBoZWlnaHQsIHdpZHRoO1xuXG4gICAgICBoZWlnaHQgPSAoJHdpbmRvdy5pbm5lckhlaWdodCA+IDApID8gJHdpbmRvdy5pbm5lckhlaWdodCA6IHNjcmVlbi5oZWlnaHQ7XG4gICAgICB3aWR0aCA9ICgkd2luZG93LmlubmVyV2lkdGggPiAwKSA/ICR3aW5kb3cuaW5uZXJXaWR0aCA6IHNjcmVlbi53aWR0aDtcblxuICAgICAgaWYgKHJldmVyc2VJblBvcnRyYWl0ICYmIGhlaWdodD53aWR0aCkge1xuICAgICAgICBtYXggPSBtYXhIZWlnaHQ7XG4gICAgICAgIG1pbiA9IG1pbkhlaWdodDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heCA9IG1heFdpZHRoO1xuICAgICAgICBtaW4gPSBtaW5XaWR0aDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKHdpZHRoLXdpZHRoSXNMZXNzV2l0aCwgbWF4KSwgbWluKTtcbiAgICB9O1xuXG4gICAgc2NvcGUuJHdhdGNoKHNjb3BlLmdldFdpbmRvd1dpZHRoLFxuICAgICAgZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgIGVsZW1lbnQub3V0ZXJXaWR0aChuZXdWYWx1ZSk7XG4gICAgICB9KTtcblxuICAgIHNjb3BlLiR3YXRjaChzY29wZS5nZXRXaW5kb3dIZWlnaHQsXG4gICAgICBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgZWxlbWVudC5vdXRlckhlaWdodChuZXdWYWx1ZSk7XG4gICAgICB9KTtcblxuICAgIHdpbmRvdy5iaW5kKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICB9KTtcblxuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzaXplVG9XaW5kb3dNb2R1bGU7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHNjb3BlLCBkaWFncmFtU2VydmljZSwgd2lyaW5nU2VydmljZSwgb3BlcmF0aW9uc01hbmFnZXIsICRsb2cpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZ2V0T2Zmc2V0VG9Nb3VzZSxcbiAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yLFxuICAgICAgICBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IsXG5cbiAgICAgICAgb25EaWFncmFtTW91c2VVcCxcbiAgICAgICAgb25EaWFncmFtTW91c2VNb3ZlLFxuICAgICAgICBvbkRpYWdyYW1Nb3VzZUxlYXZlLFxuICAgICAgICBvbldpbmRvd0JsdXIsXG4gICAgICAgIG9uQ29tcG9uZW50TW91c2VVcCxcbiAgICAgICAgb25Db21wb25lbnRNb3VzZURvd24sXG5cbiAgICAgICAgc3RhcnREcmFnLFxuICAgICAgICBmaW5pc2hEcmFnLFxuICAgICAgICBjYW5jZWxEcmFnO1xuXG5cbiAgICBnZXRPZmZzZXRUb01vdXNlID0gZnVuY3Rpb24gKCAkZXZlbnQgKSB7XG5cbiAgICAgICAgdmFyIG9mZnNldDtcblxuICAgICAgICBvZmZzZXQgPSB7XG4gICAgICAgICAgICB4OiAkZXZlbnQucGFnZVggLSAkc2NvcGUuZWxlbWVudE9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgeTogJGV2ZW50LnBhZ2VZIC0gJHNjb3BlLmVsZW1lbnRPZmZzZXQudG9wXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG9mZnNldDtcblxuICAgIH07XG5cblxuICAgIHN0YXJ0RHJhZyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBzZWxmLmRyYWdnaW5nID0gdHJ1ZTtcblxuICAgICAgICAvL3NlbGYuZHJhZ09wZXJhdGlvbiA9IG9wZXJhdGlvbnNNYW5hZ2VyLmluaXROZXcoJ3NldENvbXBvbmVudFBvc2l0aW9uJyk7XG5cbiAgICAgICAgZHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yO1xuICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgICRsb2cuZGVidWcoICdEcmFnZ2luZycsIGRyYWdUYXJnZXRzRGVzY3JpcHRvciApO1xuXG4gICAgfTtcblxuICAgIGNhbmNlbERyYWcgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgIGlmICggZHJhZ1RhcmdldHNEZXNjcmlwdG9yICkge1xuXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goIGRyYWdUYXJnZXRzRGVzY3JpcHRvci50YXJnZXRzLCBmdW5jdGlvbiAoIHRhcmdldCApIHtcblxuICAgICAgICAgICAgICAgIHRhcmdldC5jb21wb25lbnQuc2V0UG9zaXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5vcmlnaW5hbFBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5vcmlnaW5hbFBvc2l0aW9uLnlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZHJhZ1RhcmdldHNEZXNjcmlwdG9yLmFmZmVjdGVkV2lyZXMsIGZ1bmN0aW9uICggd2lyZSApIHtcblxuICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UuYWRqdXN0V2lyZUVuZFNlZ21lbnRzKCB3aXJlICk7XG5cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgZHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gbnVsbDtcblxuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5kcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgfTtcblxuICAgIGZpbmlzaERyYWcgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgc2VsZi5kcmFnZ2luZyA9IGZhbHNlO1xuXG4vLyAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRyYWdUYXJnZXRzRGVzY3JpcHRvci50YXJnZXRzLCBmdW5jdGlvbih0YXJnZXQpIHtcbi8vXG4vLyAgICAgICAgICAgIHZhciBwb3NpdGlvbjtcbi8vXG4vLyAgICAgICAgICAgIHBvc2l0aW9uID0gdGFyZ2V0LmNvbXBvbmVudC5nZXRQb3NpdGlvbigpO1xuLy9cbi8vICAgICAgICAgICAgc2VsZi5kcmFnT3BlcmF0aW9uLmNvbW1pdCggdGFyZ2V0LmNvbXBvbmVudCwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSApO1xuLy8gICAgICAgIH0pO1xuXG5cbiAgICAgICAgZHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gbnVsbDtcblxuICAgICAgICAkbG9nLmRlYnVnKCAnRmluaXNoIGRyYWdnaW5nJyApO1xuXG4gICAgfTtcblxuICAgIG9uRGlhZ3JhbU1vdXNlTW92ZSA9IGZ1bmN0aW9uKCRldmVudCkge1xuXG4gICAgICAgIGlmICggcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yICkge1xuICAgICAgICAgICAgc3RhcnREcmFnKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGRyYWdUYXJnZXRzRGVzY3JpcHRvciApIHtcblxuICAgICAgICAgICAgdmFyIG9mZnNldDtcblxuICAgICAgICAgICAgb2Zmc2V0ID0gZ2V0T2Zmc2V0VG9Nb3VzZSggJGV2ZW50ICk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZHJhZ1RhcmdldHNEZXNjcmlwdG9yLnRhcmdldHMsIGZ1bmN0aW9uICggdGFyZ2V0ICkge1xuXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmNvbXBvbmVudC5zZXRQb3NpdGlvbihcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0LnggKyB0YXJnZXQuZGVsdGFUb0N1cnNvci54LFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQueSArIHRhcmdldC5kZWx0YVRvQ3Vyc29yLnlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZHJhZ1RhcmdldHNEZXNjcmlwdG9yLmFmZmVjdGVkV2lyZXMsIGZ1bmN0aW9uICggd2lyZSApIHtcblxuICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UuYWRqdXN0V2lyZUVuZFNlZ21lbnRzKCB3aXJlICk7XG5cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtTW91c2VVcCA9IGZ1bmN0aW9uKCRldmVudCkge1xuXG4gICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKCBkcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgKSB7XG4gICAgICAgICAgICBmaW5pc2hEcmFnKCk7XG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBvbkRpYWdyYW1Nb3VzZUxlYXZlID0gZnVuY3Rpb24oLyokZXZlbnQqLykge1xuXG4gICAgICAgIGNhbmNlbERyYWcoKTtcblxuICAgIH07XG5cbiAgICBvbldpbmRvd0JsdXIgPSBmdW5jdGlvbigvKiRldmVudCovKSB7XG5cbiAgICAgICAgY2FuY2VsRHJhZygpO1xuXG4gICAgfTtcblxuICAgIG9uQ29tcG9uZW50TW91c2VVcCA9IGZ1bmN0aW9uKGNvbXBvbmVudCwgJGV2ZW50KSB7XG5cbiAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gbnVsbDtcblxuICAgICAgICBpZiAoIGRyYWdUYXJnZXRzRGVzY3JpcHRvciApIHtcbiAgICAgICAgICAgIGZpbmlzaERyYWcoKTtcbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIG9uQ29tcG9uZW50TW91c2VEb3duID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgJGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIGNvbXBvbmVudHNUb0RyYWcsXG4gICAgICAgICAgICBnZXREcmFnRGVzY3JpcHRvcjtcblxuICAgICAgICBjb21wb25lbnRzVG9EcmFnID0gW107XG5cbiAgICAgICAgZ2V0RHJhZ0Rlc2NyaXB0b3IgPSBmdW5jdGlvbiAoIGNvbXBvbmVudCApIHtcblxuICAgICAgICAgICAgdmFyIG9mZnNldCA9IGdldE9mZnNldFRvTW91c2UoICRldmVudCApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogY29tcG9uZW50LngsXG4gICAgICAgICAgICAgICAgICAgIHk6IGNvbXBvbmVudC55XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkZWx0YVRvQ3Vyc29yOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IGNvbXBvbmVudC54IC0gb2Zmc2V0LngsXG4gICAgICAgICAgICAgICAgICAgIHk6IGNvbXBvbmVudC55IC0gb2Zmc2V0LnlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgIGlmICggJHNjb3BlLmRpYWdyYW0uY29uZmlnLmVkaXRhYmxlID09PSB0cnVlICYmXG4gICAgICAgICAgICBjb21wb25lbnQubm9uU2VsZWN0YWJsZSAhPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgY29tcG9uZW50LmxvY2F0aW9uTG9ja2VkICE9PSB0cnVlICkge1xuXG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvciA9IHtcbiAgICAgICAgICAgICAgICB0YXJnZXRzOiBbIGdldERyYWdEZXNjcmlwdG9yKCBjb21wb25lbnQgKSBdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb21wb25lbnRzVG9EcmFnLnB1c2goIGNvbXBvbmVudCApO1xuXG4gICAgICAgICAgICBpZiAoICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmluZGV4T2YoIGNvbXBvbmVudC5pZCApID4gLTEgKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBEcmFnIGFsb25nIG90aGVyIHNlbGVjdGVkIGNvbXBvbmVudHNcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMsIGZ1bmN0aW9uICggc2VsZWN0ZWRDb21wb25lbnRJZCApIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWRDb21wb25lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBjb21wb25lbnQuaWQgIT09IHNlbGVjdGVkQ29tcG9uZW50SWQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ29tcG9uZW50ID0gJHNjb3BlLmRpYWdyYW0uY29tcG9uZW50c0J5SWRbIHNlbGVjdGVkQ29tcG9uZW50SWQgXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yLnRhcmdldHMucHVzaCggZ2V0RHJhZ0Rlc2NyaXB0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDb21wb25lbnQgKSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9EcmFnLnB1c2goIHNlbGVjdGVkQ29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IuYWZmZWN0ZWRXaXJlcyA9IGRpYWdyYW1TZXJ2aWNlLmdldFdpcmVzRm9yQ29tcG9uZW50cyhcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9EcmFnXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB0aGlzLm9uRGlhZ3JhbU1vdXNlVXAgPSBvbkRpYWdyYW1Nb3VzZVVwO1xuICAgIHRoaXMub25EaWFncmFtTW91c2VNb3ZlID0gb25EaWFncmFtTW91c2VNb3ZlO1xuICAgIHRoaXMub25EaWFncmFtTW91c2VMZWF2ZSA9IG9uRGlhZ3JhbU1vdXNlTGVhdmU7XG4gICAgdGhpcy5vbldpbmRvd0JsdXIgPSBvbldpbmRvd0JsdXI7XG4gICAgdGhpcy5vbkNvbXBvbmVudE1vdXNlVXAgPSBvbkNvbXBvbmVudE1vdXNlVXA7XG4gICAgdGhpcy5vbkNvbXBvbmVudE1vdXNlRG93biA9IG9uQ29tcG9uZW50TW91c2VEb3duO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbn07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkc2NvcGUsIGRpYWdyYW1TZXJ2aWNlLCBncmlkU2VydmljZSwgJGxvZykge1xuXG4gICAgdmFyIG9uQ29tcG9uZW50TW91c2VVcCxcblxuICAgICAgICBtb3ZlQ29tcG9uZW50RWxlbWVudFRvRnJvbnQsXG4gICAgICAgIHRvZ2dsZUNvbXBvbmVudFNlbGVjdGVkO1xuXG5cbiAgICBtb3ZlQ29tcG9uZW50RWxlbWVudFRvRnJvbnQgPSBmdW5jdGlvbiAoIGNvbXBvbmVudElkICkge1xuXG4gICAgICAgIHZhciB6LFxuICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgbmVlZHNUb2JlUmVvcmRlcmVkO1xuXG4gICAgICAgIG5lZWRzVG9iZVJlb3JkZXJlZCA9IGZhbHNlO1xuXG4gICAgICAgIHogPSBkaWFncmFtU2VydmljZS5nZXRIaWdoZXN0WigpO1xuICAgICAgICBjb21wb25lbnQgPSAkc2NvcGUuZGlhZ3JhbS5jb21wb25lbnRzQnlJZFsgY29tcG9uZW50SWQgXTtcblxuICAgICAgICBpZiAoIGlzTmFOKCBjb21wb25lbnQueiApICkge1xuICAgICAgICAgICAgY29tcG9uZW50LnogPSB6O1xuICAgICAgICAgICAgbmVlZHNUb2JlUmVvcmRlcmVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICggY29tcG9uZW50LnogPCB6ICkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC56ID0geiArIDE7XG4gICAgICAgICAgICAgICAgbmVlZHNUb2JlUmVvcmRlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggbmVlZHNUb2JlUmVvcmRlcmVkICkge1xuICAgICAgICAgICAgZ3JpZFNlcnZpY2UucmVvcmRlclZpc2libGVDb21wb25lbnRzKCAkc2NvcGUuaWQgKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgdG9nZ2xlQ29tcG9uZW50U2VsZWN0ZWQgPSAgZnVuY3Rpb24gKCBjb21wb25lbnQsICRldmVudCApIHtcblxuICAgICAgICB2YXIgaW5kZXg7XG5cbiAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggY29tcG9uZW50ICkgJiYgJHNjb3BlLmRpYWdyYW0uY29uZmlnLmRpc2FsbG93U2VsZWN0aW9uICE9PSB0cnVlICYmIGNvbXBvbmVudC5ub25TZWxlY3RhYmxlICE9PSB0cnVlICkge1xuXG4gICAgICAgICAgICBpbmRleCA9ICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmluZGV4T2YoIGNvbXBvbmVudC5pZCApO1xuXG4gICAgICAgICAgICBpZiAoIGluZGV4ID4gLTEgKSB7XG5cbiAgICAgICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcy5zcGxpY2UoIGluZGV4LCAxICk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnLm11bHRpU2VsZWN0ICE9PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICAgICRldmVudC5zaGlmdEtleSAhPT0gdHJ1ZSApIHtcblxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLCBmdW5jdGlvbiAoIGNvbXBvbmVudElkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29tcG9uZW50c0J5SWRbIGNvbXBvbmVudElkIF0uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLnB1c2goIGNvbXBvbmVudC5pZCApO1xuXG4gICAgICAgICAgICAgICAgbW92ZUNvbXBvbmVudEVsZW1lbnRUb0Zyb250KCBjb21wb25lbnQuaWQgKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkbG9nLmRlYnVnKCdzZWxlY3RlZHMnLCAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcyk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgb25Db21wb25lbnRNb3VzZVVwID0gZnVuY3Rpb24oY29tcG9uZW50LCAkZXZlbnQpIHtcbiAgICAgICAgdG9nZ2xlQ29tcG9uZW50U2VsZWN0ZWQoIGNvbXBvbmVudCwgJGV2ZW50ICk7XG5cbiAgICB9O1xuXG4gICAgdGhpcy5vbkNvbXBvbmVudE1vdXNlVXAgPSBvbkNvbXBvbmVudE1vdXNlVXA7XG5cbiAgICByZXR1cm4gdGhpcztcblxufTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRzY29wZSwgZGlhZ3JhbVNlcnZpY2UsIHdpcmluZ1NlcnZpY2UsIGdyaWRTZXJ2aWNlLCAkbG9nKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXMsXG5cbiAgICAgICAgV2lyZSA9IHJlcXVpcmUoICcuLi8uLi8uLi9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL1dpcmUuanMnICksXG5cbiAgICAgICAgd2lyZVN0YXJ0LFxuXG4gICAgICAgIHN0YXJ0V2lyZSxcbiAgICAgICAgYWRkQ29ybmVyVG9OZXdXaXJlTGluZSxcbiAgICAgICAgZmluaXNoV2lyZSxcbiAgICAgICAgY2FuY2VsV2lyZSxcblxuICAgICAgICBvbkRpYWdyYW1Nb3VzZVVwLFxuICAgICAgICBvbkRpYWdyYW1Nb3VzZU1vdmUsXG4gICAgICAgIG9uRGlhZ3JhbU1vdXNlTGVhdmUsXG4gICAgICAgIG9uV2luZG93Qmx1cixcbiAgICAgICAgb25Qb3J0TW91c2VEb3duO1xuXG5cblxuICAgIHN0YXJ0V2lyZSA9IGZ1bmN0aW9uIChjb21wb25lbnQsIHBvcnQpIHtcblxuICAgICAgICB3aXJlU3RhcnQgPSB7XG4gICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudCxcbiAgICAgICAgICAgIHBvcnQ6IHBvcnRcbiAgICAgICAgfTtcblxuICAgICAgICAkbG9nLmRlYnVnKCAnU3RhcnRpbmcgd2lyZScsIHdpcmVTdGFydCApO1xuXG4gICAgICAgIHNlbGYud2lyaW5nID0gdHJ1ZTtcblxuICAgIH07XG5cbiAgICBhZGRDb3JuZXJUb05ld1dpcmVMaW5lID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBsYXN0U2VnbWVudDtcblxuICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHMgPSAkc2NvcGUubmV3V2lyZUxpbmUuc2VnbWVudHM7XG5cbiAgICAgICAgbGFzdFNlZ21lbnQgPSAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHNbICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cy5sZW5ndGggLSAxIF07XG5cbiAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDogbGFzdFNlZ21lbnQueDIsXG4gICAgICAgICAgICB5OiBsYXN0U2VnbWVudC55MlxuICAgICAgICB9O1xuXG4gICAgfTtcblxuICAgIGZpbmlzaFdpcmUgPSBmdW5jdGlvbiAoIGNvbXBvbmVudCwgcG9ydCApIHtcblxuICAgICAgICB2YXIgd2lyZSA9IG5ldyBXaXJlKCB7XG4gICAgICAgICAgICBpZDogJ25ldy13aXJlLScgKyBNYXRoLnJvdW5kKCBNYXRoLnJhbmRvbSgpICogMTAwMDAgKSxcbiAgICAgICAgICAgIGVuZDE6IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHdpcmVTdGFydC5jb21wb25lbnQsXG4gICAgICAgICAgICAgICAgcG9ydDogd2lyZVN0YXJ0LnBvcnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbmQyOiB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgcG9ydDogcG9ydFxuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgd2lyZS5zZWdtZW50cyA9IGFuZ3VsYXIuY29weShcbiAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cy5jb25jYXQoXG4gICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDE6ICRzY29wZS5uZXdXaXJlTGluZS5hY3RpdmVTZWdtZW50U3RhcnRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDI6IHBvcnQuZ2V0R3JpZFBvc2l0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ0VsYm93Um91dGVyJ1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkgKTtcblxuXG4gICAgICAgIGRpYWdyYW1TZXJ2aWNlLmFkZFdpcmUoIHdpcmUgKTtcblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbS53aXJlc1sgd2lyZS5pZCBdID0gd2lyZTtcblxuICAgICAgICBncmlkU2VydmljZS5pbnZhbGlkYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKCAkc2NvcGUuaWQgKTtcblxuICAgICAgICAkbG9nLmRlYnVnKCAnRmluaXNoIHdpcmUnLCB3aXJlICk7XG5cbiAgICAgICAgd2lyZVN0YXJ0ID0gbnVsbDtcbiAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lID0gbnVsbDtcblxuICAgICAgICBzZWxmLndpcmluZyA9IGZhbHNlO1xuXG4gICAgfTtcblxuICAgIGNhbmNlbFdpcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5uZXdXaXJlTGluZSA9IG51bGw7XG4gICAgICAgIHdpcmVTdGFydCA9IG51bGw7XG4gICAgICAgIHNlbGYud2lyaW5nID0gZmFsc2U7XG4gICAgfTtcblxuICAgIG9uRGlhZ3JhbU1vdXNlTW92ZSA9IGZ1bmN0aW9uKCRldmVudCkge1xuXG4gICAgICAgIGlmICggd2lyZVN0YXJ0ICkge1xuXG5cbiAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZSA9ICRzY29wZS5uZXdXaXJlTGluZSB8fCB7fTtcbiAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cyA9ICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cyB8fCBbXTtcbiAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5hY3RpdmVTZWdtZW50U3RhcnRQb3NpdGlvbiA9XG4gICAgICAgICAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uIHx8IHdpcmVTdGFydC5wb3J0LmdldEdyaWRQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUuc2VnbWVudHMgPSAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHMuY29uY2F0KFxuICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UuZ2V0U2VnbWVudHNCZXR3ZWVuUG9zaXRpb25zKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQxOiAkc2NvcGUubmV3V2lyZUxpbmUuYWN0aXZlU2VnbWVudFN0YXJ0UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogJGV2ZW50LnBhZ2VYIC0gJHNjb3BlLmVsZW1lbnRPZmZzZXQubGVmdCAtIDMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogJGV2ZW50LnBhZ2VZIC0gJHNjb3BlLmVsZW1lbnRPZmZzZXQudG9wIC0gM1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnRWxib3dSb3V0ZXInXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgb25EaWFncmFtTW91c2VVcCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmICggd2lyZVN0YXJ0ICkge1xuXG4gICAgICAgICAgICBhZGRDb3JuZXJUb05ld1dpcmVMaW5lKCk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzID0gW107XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBvblBvcnRNb3VzZURvd24gPSBmdW5jdGlvbiggY29tcG9uZW50LCBwb3J0LCAkZXZlbnQgKSB7XG5cbiAgICAgICAgaWYgKCB3aXJlU3RhcnQgKSB7XG5cbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgaWYgKCB3aXJlU3RhcnQucG9ydCAhPT0gcG9ydCApIHtcbiAgICAgICAgICAgICAgICBmaW5pc2hXaXJlKCBjb21wb25lbnQsIHBvcnQgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FuY2VsV2lyZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHN0YXJ0V2lyZShjb21wb25lbnQsIHBvcnQpO1xuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBvbkRpYWdyYW1Nb3VzZUxlYXZlID0gZnVuY3Rpb24oLyokZXZlbnQqLykge1xuICAgICAgICBpZiAoc2VsZi53aXJpbmcpIHtcbiAgICAgICAgICAgIGNhbmNlbFdpcmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbldpbmRvd0JsdXIgPSBmdW5jdGlvbigvKiRldmVudCovKSB7XG4gICAgICAgIGlmIChzZWxmLndpcmluZykge1xuICAgICAgICAgICAgY2FuY2VsV2lyZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdGhpcy5vbkRpYWdyYW1Nb3VzZVVwID0gb25EaWFncmFtTW91c2VVcDtcbiAgICB0aGlzLm9uRGlhZ3JhbU1vdXNlTW92ZSA9IG9uRGlhZ3JhbU1vdXNlTW92ZTtcbiAgICB0aGlzLm9uRGlhZ3JhbU1vdXNlTGVhdmUgPSBvbkRpYWdyYW1Nb3VzZUxlYXZlO1xuICAgIHRoaXMub25XaW5kb3dCbHVyID0gb25XaW5kb3dCbHVyO1xuICAgIHRoaXMub25Qb3J0TW91c2VEb3duID0gb25Qb3J0TW91c2VEb3duO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbn07XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgJCovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJHNjb3BlLCBkaWFncmFtU2VydmljZSwgJHRpbWVvdXQsIGNvbnRleHRtZW51U2VydmljZSwgb3BlcmF0aW9uc01hbmFnZXIsICRsb2cpIHtcblxuICAgIHZhclxuICAgICAgICBvbkNvbXBvbmVudENvbnRleHRtZW51LFxuICAgICAgICBvblBvcnRDb250ZXh0bWVudSxcbiAgICAgICAgb25EaWFncmFtQ29udGV4dG1lbnUsXG4gICAgICAgIG9uRGlhZ3JhbU1vdXNlRG93bixcblxuICAgICAgICBvcGVuTWVudTtcblxuICAgICRsb2cuZGVidWcoJ0luaXRpYWxpemluZyBjb250ZXh0IG1lbnVzLicpO1xuXG4gICAgb3Blbk1lbnUgPSBmdW5jdGlvbigkZXZlbnQpIHtcblxuICAgICAgICBjb250ZXh0bWVudVNlcnZpY2UuY2xvc2UoKTtcblxuICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBvcGVuQ29udGV4dE1lbnVFdmVudDtcblxuICAgICAgICAgICAgICAgIG9wZW5Db250ZXh0TWVudUV2ZW50ID0gYW5ndWxhci5leHRlbmQoJC5FdmVudCgnb3BlbkNvbnRleHRNZW51JyksIHtcbiAgICAgICAgICAgICAgICBjbGllbnRYOiAkZXZlbnQuY2xpZW50WCxcbiAgICAgICAgICAgICAgICBjbGllbnRZOiAkZXZlbnQuY2xpZW50WSxcbiAgICAgICAgICAgICAgICBwYWdlWDogJGV2ZW50LnBhZ2VYLFxuICAgICAgICAgICAgICAgIHBhZ2VZOiAkZXZlbnQucGFnZVksXG4gICAgICAgICAgICAgICAgc2NyZWVuWDogJGV2ZW50LnNjcmVlblgsXG4gICAgICAgICAgICAgICAgc2NyZWVuWTogJGV2ZW50LnNjcmVlblksXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAkZXZlbnQudGFyZ2V0XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHNjb3BlLiRlbGVtZW50LnRyaWdnZXJIYW5kbGVyKG9wZW5Db250ZXh0TWVudUV2ZW50KTtcblxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBvbkRpYWdyYW1Nb3VzZURvd24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY29udGV4dG1lbnVTZXJ2aWNlLmNsb3NlKCk7XG4gICAgfTtcblxuICAgIG9uQ29tcG9uZW50Q29udGV4dG1lbnUgPSBmdW5jdGlvbiAoY29tcG9uZW50LCAkZXZlbnQpIHtcblxuICAgICAgICAkc2NvcGUuY29udGV4dE1lbnVEYXRhID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAncmVwb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdyb3RhdGVDVycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1JvdGF0ZSBDVycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1yb3RhdGUtcmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3BlcmF0aW9uO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uID0gb3BlcmF0aW9uc01hbmFnZXIuaW5pdE5ldygncm90YXRlQ29tcG9uZW50cycsIGNvbXBvbmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uLnNldCg5MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uLmNvbW1pdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ3JvdGF0ZUNDVycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1JvdGF0ZSBDQ1cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcm90YXRlLWxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3BlcmF0aW9uO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JvdGF0aW5nIGFudGktY2xvY2t3aXNlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24gPSBvcGVyYXRpb25zTWFuYWdlci5pbml0TmV3KCdyb3RhdGVDb21wb25lbnRzJywgY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24uc2V0KC05MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uLmNvbW1pdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgb3Blbk1lbnUoJGV2ZW50KTtcblxuICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB9O1xuXG4gICAgb25Qb3J0Q29udGV4dG1lbnUgPSBmdW5jdGlvbiAoY29tcG9uZW50LCBwb3J0LCAkZXZlbnQpIHtcblxuICAgICAgICAkc2NvcGUuY29udGV4dE1lbnVEYXRhID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAncHJvcGVydGllcycsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdpbmZvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnSW5mbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3J0IGluZm8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7fVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgIG9wZW5NZW51KCRldmVudCk7XG5cbiAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIH07XG5cbiAgICBvbkRpYWdyYW1Db250ZXh0bWVudSA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcblxuICAgICAgICAkc2NvcGUuY29udGV4dE1lbnVEYXRhID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnYWJvdXQnLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZ2V0U3RhdHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdGF0aXN0aWNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdGF0aXN0aWNzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge31cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuICAgICAgICBvcGVuTWVudSgkZXZlbnQpO1xuXG4gICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIH07XG5cbiAgICB0aGlzLm9uRGlhZ3JhbUNvbnRleHRtZW51ID0gb25EaWFncmFtQ29udGV4dG1lbnU7XG4gICAgdGhpcy5vbkNvbXBvbmVudENvbnRleHRtZW51ID0gb25Db21wb25lbnRDb250ZXh0bWVudTtcbiAgICB0aGlzLm9uUG9ydENvbnRleHRtZW51ID0gb25Qb3J0Q29udGV4dG1lbnU7XG4gICAgdGhpcy5vbkRpYWdyYW1Nb3VzZURvd24gPSBvbkRpYWdyYW1Nb3VzZURvd247XG5cbiAgICByZXR1cm4gdGhpcztcblxufTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCAkKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxucmVxdWlyZSgnLi4vY29tcG9uZW50V2lyZS9jb21wb25lbnRXaXJlLmpzJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zdmdEaWFncmFtJywgW1xuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5ncmlkU2VydmljZScsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmNvbXBvbmVudFdpcmUnLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5vcGVyYXRpb25zTWFuYWdlcicsXG4gICAgJ2lzaXMudWkuY29udGV4dG1lbnUnXG5dKVxuICAgIC5jb250cm9sbGVyKCdTVkdEaWFncmFtQ29udHJvbGxlcicsIGZ1bmN0aW9uIChcbiAgICAgICAgJHNjb3BlLCAkbG9nLCBkaWFncmFtU2VydmljZSwgd2lyaW5nU2VydmljZSwgZ3JpZFNlcnZpY2UsICR3aW5kb3csICR0aW1lb3V0LCBjb250ZXh0bWVudVNlcnZpY2UsIG9wZXJhdGlvbnNNYW5hZ2VyKSB7XG5cbiAgICAgICAgdmFyXG5cbiAgICAgICAgICAgIENvbXBvbmVudFNlbGVjdGlvbkhhbmRsZXIgPSByZXF1aXJlKCcuL2NsYXNzZXMvQ29tcG9uZW50U2VsZWN0aW9uSGFuZGxlcicpLFxuICAgICAgICAgICAgY29tcG9uZW50U2VsZWN0aW9uSGFuZGxlcixcblxuICAgICAgICAgICAgQ29tcG9uZW50RHJhZ0hhbmRsZXIgPSByZXF1aXJlKCcuL2NsYXNzZXMvQ29tcG9uZW50RHJhZ0hhbmRsZXInKSxcbiAgICAgICAgICAgIGNvbXBvbmVudERyYWdIYW5kbGVyLFxuXG4gICAgICAgICAgICBXaXJlRHJhd0hhbmRsZXIgPSByZXF1aXJlKCcuL2NsYXNzZXMvV2lyZURyYXdIYW5kbGVyJyksXG4gICAgICAgICAgICB3aXJlRHJhd0hhbmRsZXIsXG5cbiAgICAgICAgICAgIENvbnRleHRNZW51SGFuZGxlciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9jb250ZXh0TWVudUhhbmRsZXInKSxcbiAgICAgICAgICAgIGNvbnRleHRNZW51SGFuZGxlcixcblxuICAgICAgICAgICAgY29tcG9uZW50RWxlbWVudHMsXG5cbiAgICAgICAgICAgICQkd2luZG93O1xuXG4gICAgICAgICQkd2luZG93ID0gJCgkd2luZG93KTtcblxuICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlciA9IG5ldyBDb21wb25lbnREcmFnSGFuZGxlcihcbiAgICAgICAgICAgICRzY29wZSxcbiAgICAgICAgICAgIGRpYWdyYW1TZXJ2aWNlLFxuICAgICAgICAgICAgd2lyaW5nU2VydmljZSxcbiAgICAgICAgICAgIG9wZXJhdGlvbnNNYW5hZ2VyLFxuICAgICAgICAgICAgJGxvZ1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbXBvbmVudFNlbGVjdGlvbkhhbmRsZXIgPSBuZXcgQ29tcG9uZW50U2VsZWN0aW9uSGFuZGxlcihcbiAgICAgICAgICAgICRzY29wZSxcbiAgICAgICAgICAgIGRpYWdyYW1TZXJ2aWNlLFxuICAgICAgICAgICAgZ3JpZFNlcnZpY2UsXG4gICAgICAgICAgICAkbG9nXG4gICAgICAgICk7XG5cbiAgICAgICAgd2lyZURyYXdIYW5kbGVyID0gbmV3IFdpcmVEcmF3SGFuZGxlcihcbiAgICAgICAgICAgICRzY29wZSxcbiAgICAgICAgICAgIGRpYWdyYW1TZXJ2aWNlLFxuICAgICAgICAgICAgd2lyaW5nU2VydmljZSxcbiAgICAgICAgICAgIGdyaWRTZXJ2aWNlLFxuICAgICAgICAgICAgJGxvZ1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnRleHRNZW51SGFuZGxlciA9IG5ldyBDb250ZXh0TWVudUhhbmRsZXIoXG4gICAgICAgICAgICAkc2NvcGUsXG4gICAgICAgICAgICBkaWFncmFtU2VydmljZSxcbiAgICAgICAgICAgICR0aW1lb3V0LFxuICAgICAgICAgICAgY29udGV4dG1lbnVTZXJ2aWNlLFxuICAgICAgICAgICAgb3BlcmF0aW9uc01hbmFnZXIsXG4gICAgICAgICAgICAkbG9nXG4gICAgICAgICk7XG5cbiAgICAgICAgJHNjb3BlLm9uRGlhZ3JhbU1vdXNlRG93biA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcblxuXG5cbiAgICAgICAgICAgIGlmICgkZXZlbnQud2hpY2ggPT09IDMpIHtcblxuICAgICAgICAgICAgICAgIGNvbnRleHRNZW51SGFuZGxlci5vbkRpYWdyYW1Db250ZXh0bWVudSgkZXZlbnQpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgY29udGV4dE1lbnVIYW5kbGVyLm9uRGlhZ3JhbU1vdXNlRG93bigkZXZlbnQpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuXG4gICAgICAgICRzY29wZS5vbkRpYWdyYW1Nb3VzZVVwID0gZnVuY3Rpb24gKCRldmVudCkge1xuXG4gICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlci5vbkRpYWdyYW1Nb3VzZVVwKCRldmVudCk7XG4gICAgICAgICAgICB3aXJlRHJhd0hhbmRsZXIub25EaWFncmFtTW91c2VVcCgkZXZlbnQpO1xuXG4gICAgICAgIH07XG5cblxuICAgICAgICAkc2NvcGUub25EaWFncmFtQ2xpY2sgPSBmdW5jdGlvbiAoLyokZXZlbnQqLykge1xuXG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub25EaWFncmFtTW91c2VNb3ZlID0gZnVuY3Rpb24gKCRldmVudCkge1xuXG4gICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlci5vbkRpYWdyYW1Nb3VzZU1vdmUoJGV2ZW50KTtcbiAgICAgICAgICAgIHdpcmVEcmF3SGFuZGxlci5vbkRpYWdyYW1Nb3VzZU1vdmUoJGV2ZW50KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5nZXRDc3NDbGFzcyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xuXG4gICAgICAgICAgICBpZiAoY29tcG9uZW50RHJhZ0hhbmRsZXIuZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gJ2RyYWdnaW5nJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vbkRpYWdyYW1Nb3VzZUxlYXZlID0gZnVuY3Rpb24gKCRldmVudCkge1xuXG4gICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlci5vbkRpYWdyYW1Nb3VzZUxlYXZlKCRldmVudCk7XG4gICAgICAgICAgICB3aXJlRHJhd0hhbmRsZXIub25EaWFncmFtTW91c2VMZWF2ZSgkZXZlbnQpO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgJCR3aW5kb3cuYmx1cihmdW5jdGlvbiAoJGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudERyYWdIYW5kbGVyLm9uV2luZG93Qmx1cigkZXZlbnQpO1xuICAgICAgICAgICAgd2lyZURyYXdIYW5kbGVyLm9uV2luZG93Qmx1cigkZXZlbnQpO1xuXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy8gSW50ZXJhY3Rpb25zIHdpdGggY29tcG9uZW50c1xuXG4gICAgICAgIHRoaXMub25Db21wb25lbnRNb3VzZVVwID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgJGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGlmICghY29tcG9uZW50RHJhZ0hhbmRsZXIuZHJhZ2dpbmcpIHtcblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlbGVjdGlvbkhhbmRsZXIub25Db21wb25lbnRNb3VzZVVwKGNvbXBvbmVudCwgJGV2ZW50KTtcbiAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlci5vbkNvbXBvbmVudE1vdXNlVXAoY29tcG9uZW50LCAkZXZlbnQpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudERyYWdIYW5kbGVyLm9uQ29tcG9uZW50TW91c2VVcChjb21wb25lbnQsICRldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vblBvcnRNb3VzZURvd24gPSBmdW5jdGlvbiAoY29tcG9uZW50LCBwb3J0LCAkZXZlbnQpIHtcblxuICAgICAgICAgICAgaWYgKCAhd2lyZURyYXdIYW5kbGVyLndpcmluZyAmJiAkZXZlbnQud2hpY2ggPT09IDMgKSB7XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0TWVudUhhbmRsZXIub25Qb3J0Q29udGV4dG1lbnUoY29tcG9uZW50LCBwb3J0LCAkZXZlbnQpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpcmVEcmF3SGFuZGxlci5vblBvcnRNb3VzZURvd24oY29tcG9uZW50LCBwb3J0LCAkZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vblBvcnRNb3VzZVVwID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KSB7XG5cbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25Qb3J0Q2xpY2sgPSBmdW5jdGlvbiAoY29tcG9uZW50LCBwb3J0LCAkZXZlbnQpIHtcblxuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vbkNvbXBvbmVudE1vdXNlRG93biA9IGZ1bmN0aW9uIChjb21wb25lbnQsICRldmVudCkge1xuXG4gICAgICAgICAgICBpZiAoJGV2ZW50LndoaWNoID09PSAzKSB7XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0TWVudUhhbmRsZXIub25Db21wb25lbnRDb250ZXh0bWVudShjb21wb25lbnQsICRldmVudCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBjb21wb25lbnREcmFnSGFuZGxlci5vbkNvbXBvbmVudE1vdXNlRG93bihjb21wb25lbnQsICRldmVudCk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmlzRWRpdGFibGUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICRzY29wZS5kaWFncmFtLmNvbmZpZyA9ICRzY29wZS5kaWFncmFtLmNvbmZpZyB8fCB7fTtcblxuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5kaWFncmFtLmNvbmZpZy5lZGl0YWJsZSA9PT0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpc2FsbG93U2VsZWN0aW9uID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb25maWcgPSAkc2NvcGUuZGlhZ3JhbS5jb25maWcgfHwge307XG5cbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuZGlhZ3JhbS5jb25maWcuZGlzYWxsb3dTZWxlY3Rpb24gPT09IHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlckNvbXBvbmVudEVsZW1lbnQgPSBmdW5jdGlvbiAoaWQsIGVsKSB7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudEVsZW1lbnRzID0gY29tcG9uZW50RWxlbWVudHMgfHwge307XG5cbiAgICAgICAgICAgIGNvbXBvbmVudEVsZW1lbnRzW2lkXSA9IGVsO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy51bnJlZ2lzdGVyQ29tcG9uZW50RWxlbWVudCA9IGZ1bmN0aW9uIChpZCkge1xuXG4gICAgICAgICAgICBjb21wb25lbnRFbGVtZW50cyA9IGNvbXBvbmVudEVsZW1lbnRzIHx8IHt9O1xuXG4gICAgICAgICAgICBkZWxldGUgY29tcG9uZW50RWxlbWVudHNbaWRdO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgb3BlcmF0aW9uc01hbmFnZXIucmVnaXN0ZXJPcGVyYXRpb24oe1xuICAgICAgICAgICAgaWQ6ICdyb3RhdGVDb21wb25lbnRzJyxcbiAgICAgICAgICAgIG9wZXJhdGlvbkNsYXNzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcG9uZW50ID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldCA9IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jb21taXQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50c1RvUm90YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5nbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhZmZlY3RlZFdpcmVzO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHNUb1JvdGF0ZSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICBhbmdsZSA9IHRoaXMuYW5nbGU7XG5cbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c1RvUm90YXRlLnB1c2goIHRoaXMuY29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcy5pbmRleE9mKCB0aGlzLmNvbXBvbmVudC5pZCApID4gLTEgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMsIGZ1bmN0aW9uICggc2VsZWN0ZWRDb21wb25lbnRJZCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZENvbXBvbmVudDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY29tcG9uZW50LmlkICE9PSBzZWxlY3RlZENvbXBvbmVudElkICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ29tcG9uZW50ID0gJHNjb3BlLmRpYWdyYW0uY29tcG9uZW50c0J5SWQgICBbIHNlbGVjdGVkQ29tcG9uZW50SWQgXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9Sb3RhdGUucHVzaCggc2VsZWN0ZWRDb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYWZmZWN0ZWRXaXJlcyA9IGRpYWdyYW1TZXJ2aWNlLmdldFdpcmVzRm9yQ29tcG9uZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHNUb1JvdGF0ZVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChjb21wb25lbnRzVG9Sb3RhdGUsIGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnJvdGF0ZShhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBhZmZlY3RlZFdpcmVzLCBmdW5jdGlvbiAoIHdpcmUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJpbmdTZXJ2aWNlLmFkanVzdFdpcmVFbmRTZWdtZW50cyggd2lyZSApO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH0pXG4gICAgLmRpcmVjdGl2ZSgnc3ZnRGlhZ3JhbScsIFtcbiAgICAgICAgJyRyb290U2NvcGUnLFxuICAgICAgICAnJGxvZycsXG4gICAgICAgICdkaWFncmFtU2VydmljZScsXG4gICAgICAgICdncmlkU2VydmljZScsXG4gICAgICAgIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkbG9nLCBkaWFncmFtU2VydmljZSwgZ3JpZFNlcnZpY2UpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU1ZHRGlhZ3JhbUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIHJlcXVpcmU6ICdeZGlhZ3JhbUNvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICBzY29wZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL3N2Z0RpYWdyYW0uaHRtbCcsXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzLCBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAga2lsbENvbnRleHRNZW51O1xuXG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50ID0gJChlbGVtZW50KTtcblxuICAgICAgICAgICAgICAgICAgICBraWxsQ29udGV4dE1lbnUgPSBmdW5jdGlvbigkZXZlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5kZWJ1Zygna2lsbGluZyBkZWZhdWx0IGNvbnRleHRtZW51Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWQgPSBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5nZXRJZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnZGlhZ3JhbScsIGZ1bmN0aW9uKG5ld0RpYWdyYW1WYWx1ZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGlhZ3JhbVZhbHVlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaWFncmFtID0gc2NvcGUuZGlhZ3JhbSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kZWxlbWVudCA9ICRlbGVtZW50O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQub3V0ZXJXaWR0aChzY29wZS5kaWFncmFtLmNvbmZpZy53aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQub3V0ZXJIZWlnaHQoc2NvcGUuZGlhZ3JhbS5jb25maWcud2lkdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuaWQgPSBpZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLnNldEluaXRpYWxpemVkKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignR3JpZEluaXRpYWxpemVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5zZXRJbml0aWFsaXplZCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudmlzaWJsZU9iamVjdHMgPSBncmlkU2VydmljZS5jcmVhdGVHcmlkKGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaWFncmFtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuZ2V0VmlzaWJsZUFyZWEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHZpc2libGVBcmVhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5lbGVtZW50T2Zmc2V0ID0gc2NvcGUuJGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkU2VydmljZS5zZXRWaXNpYmxlQXJlYShpZCwgdmlzaWJsZUFyZWEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuYmluZCgnY29udGV4dG1lbnUnLCBraWxsQ29udGV4dE1lbnUpO1xuXG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5ib3gnLCBbXVxuKVxuICAgIC5jb250cm9sbGVyKCAnQm94Q29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlICkge1xuXG4gICAgICAgICRzY29wZS5wb3J0V2lyZXMgPSBbXTtcblxuICAgICAgICBhbmd1bGFyLmZvckVhY2goICRzY29wZS5jb21wb25lbnQuc3ltYm9sLnBvcnRzLCBmdW5jdGlvbiAoIHBvcnQgKSB7XG5cbiAgICAgICAgICAgIHZhciB0b1ggPSAwLFxuICAgICAgICAgICAgICAgIHRvWSA9IDAsXG4gICAgICAgICAgICAgICAgcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgd2lkdGgsIGhlaWdodDtcblxuICAgICAgICAgICAgcG9ydFdpcmVMZW5ndGggPSAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5wb3J0V2lyZUxlbmd0aDtcbiAgICAgICAgICAgIHdpZHRoID0gJHNjb3BlLmNvbXBvbmVudC5zeW1ib2wud2lkdGg7XG4gICAgICAgICAgICBoZWlnaHQgPSAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5oZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmICggcG9ydC54ID09PSAwICkge1xuICAgICAgICAgICAgICAgIHRvWCA9IHBvcnRXaXJlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRvWSA9IHBvcnQueTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBwb3J0LnkgPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgdG9ZID0gcG9ydFdpcmVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdG9YID0gcG9ydC54O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHBvcnQueCA9PT0gd2lkdGggKSB7XG4gICAgICAgICAgICAgICAgdG9YID0gd2lkdGggLSBwb3J0V2lyZUxlbmd0aDtcbiAgICAgICAgICAgICAgICB0b1kgPSBwb3J0Lnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggcG9ydC55ID09PSBoZWlnaHQgKSB7XG4gICAgICAgICAgICAgICAgdG9ZID0gaGVpZ2h0IC0gcG9ydFdpcmVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdG9YID0gcG9ydC54O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUucG9ydFdpcmVzLnB1c2goIHtcbiAgICAgICAgICAgICAgICB4MTogcG9ydC54LFxuICAgICAgICAgICAgICAgIHkxOiBwb3J0LnksXG4gICAgICAgICAgICAgICAgeDI6IHRvWCxcbiAgICAgICAgICAgICAgICB5MjogdG9ZXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKTtcblxuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoXG4gICAgICAgICdib3gnLFxuXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzY29wZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdCb3hDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2JveC5odG1sJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuY2FwYWNpdG9yJywgW11cbilcbiAgICAuY29uZmlnKCBbICdzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICBmdW5jdGlvbiAoIHN5bWJvbE1hbmFnZXJQcm92aWRlciApIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCgge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXBhY2l0b3InLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tY2FwYWNpdG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ0MnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC04XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNjAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxNSxcbiAgICAgICAgICAgICAgICBwb3J0czogWyB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQycsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDJyxcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogNy41XG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0EnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0EnLFxuICAgICAgICAgICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgICAgICAgICAgeTogNy41XG4gICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICBdICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsICQqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoICcuLi8uLi9zZXJ2aWNlcy9zeW1ib2xTZXJ2aWNlcy9zeW1ib2xTZXJ2aWNlcy5qcycgKTtcbnJlcXVpcmUoICcuLi9wb3J0L3BvcnQuanMnICk7XG5cbnJlcXVpcmUoICcuL3Jlc2lzdG9yL3Jlc2lzdG9yLmpzJyApO1xucmVxdWlyZSggJy4vakZldFAvakZldFAuanMnICk7XG5yZXF1aXJlKCAnLi9vcEFtcC9vcEFtcC5qcycgKTtcbnJlcXVpcmUoICcuL2Rpb2RlL2Rpb2RlLmpzJyApO1xucmVxdWlyZSggJy4vY2FwYWNpdG9yL2NhcGFjaXRvci5qcycgKTtcbnJlcXVpcmUoICcuL2luZHVjdG9yL2luZHVjdG9yLmpzJyApO1xuXG5yZXF1aXJlKCAnLi9ib3gvYm94LmpzJyApO1xuXG52YXIgc3ltYm9sc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzJywgW1xuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9sU2VydmljZXMnLFxuXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5wb3J0JyxcblxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5yZXNpc3RvcicsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmpGZXRQJyxcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMub3BBbXAnLFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5kaW9kZScsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmNhcGFjaXRvcicsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmluZHVjdG9yJyxcblxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5ib3gnXG5cbiAgICBdICk7XG5cbnN5bWJvbHNNb2R1bGUuY29udHJvbGxlcihcbiAgICAnU3ltYm9sQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlICkge1xuXG4gICAgICAgICRzY29wZS5nZXRTeW1ib2xUcmFuc2Zvcm0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1TdHJpbmc7XG5cbiAgICAgICAgICAgIC8vICAgIHRyYW5zZm9ybVN0cmluZyA9ICd0cmFuc2xhdGUoJyArICRzY29wZS5jb21wb25lbnQueCArICcsJyArICRzY29wZS5jb21wb25lbnQueSArICcpICc7XG4gICAgICAgICAgICAvLyAgICB0cmFuc2Zvcm1TdHJpbmcgKz1cbiAgICAgICAgICAgIC8vICAgICAgJ3JvdGF0ZSgnICsgJHNjb3BlLmNvbXBvbmVudC5yb3RhdGlvbiArICcgJyArICRzY29wZS5jb21wb25lbnQuc3ltYm9sLndpZHRoLzIgKyAnICcgKyAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5oZWlnaHQvMiAgKyAnKSAnO1xuICAgICAgICAgICAgLy8gICAgLy90cmFuc2Zvcm1TdHJpbmcgKz0gJ3NjYWxlKCcgKyAkc2NvcGUuY29tcG9uZW50LnNjYWxlWCArICcsJyArICRzY29wZS5jb21wb25lbnQuc2NhbGVZICsgJykgJztcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAgICBjb25zb2xlLmxvZygkc2NvcGUuY29tcG9uZW50LmdldFRyYW5zZm9ybWF0aW9uTWF0cml4KCkuam9pbignLCAnKSk7XG5cbiAgICAgICAgICAgIHRyYW5zZm9ybVN0cmluZyA9ICdtYXRyaXgoJyArICRzY29wZS5jb21wb25lbnQuZ2V0U1ZHVHJhbnNmb3JtYXRpb25TdHJpbmcoKSArICcpJztcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVN0cmluZztcbiAgICAgICAgfTtcblxuICAgIH0gKTtcblxuc3ltYm9sc01vZHVsZS5kaXJlY3RpdmUoXG4gICAgJ2NvbXBvbmVudFN5bWJvbCcsXG5cbiAgICBmdW5jdGlvbiAoICRjb21waWxlICkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJz0nLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICc9JyxcbiAgICAgICAgICAgICAgICBwYWdlOiAnPScsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2U6ICc9J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1N5bWJvbENvbnRyb2xsZXInLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9jb21wb25lbnRTeW1ib2wuaHRtbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRycsXG4gICAgICAgICAgICByZXF1aXJlOiBbICdec3ZnRGlhZ3JhbScsICdeZGlhZ3JhbUNvbnRhaW5lcicgXSxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICggc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGNvbnRyb2xsZXJzICkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlU3RyLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSxcblxuICAgICAgICAgICAgICAgICAgICBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIsXG5cbiAgICAgICAgICAgICAgICAgICAgJGVsLFxuICAgICAgICAgICAgICAgICAgICBjb21waWxlZFN5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sQ29tcG9uZW50O1xuXG4gICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIgPSBjb250cm9sbGVyc1sgMCBdO1xuICAgICAgICAgICAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyID0gY29udHJvbGxlcnNbIDEgXTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLnBvcnRzVmlzaWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLmRldGFpbHNWaXNpYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuZ2V0Wm9vbUxldmVsKCkgPiAxO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzY29wZS5nZXRDc3NDbGFzcyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNjb3BlLmNvbXBvbmVudC5zeW1ib2wudHlwZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLmlzQ29tcG9uZW50U2VsZWN0ZWQoIHNjb3BlLmNvbXBvbmVudCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9ICcgc2VsZWN0ZWQnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBJbnRlcmFjdGlvbnNcblxuICAgICAgICAgICAgICAgIHNjb3BlLm9uTW91c2VVcCA9IGZ1bmN0aW9uICggJGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5vbkNvbXBvbmVudE1vdXNlVXAoIHNjb3BlLmNvbXBvbmVudCwgJGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLm9uTW91c2VEb3duID0gZnVuY3Rpb24gKCAkZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uQ29tcG9uZW50TW91c2VEb3duKCBzY29wZS5jb21wb25lbnQsICRldmVudCApO1xuICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHN5bWJvbENvbXBvbmVudCA9IHNjb3BlLmNvbXBvbmVudC5zeW1ib2wuc3ltYm9sQ29tcG9uZW50IHx8ICdnZW5lcmljLXN2Zyc7XG5cbiAgICAgICAgICAgICAgICBjb21waWxlZFN5bWJvbCA9IGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLmdldENvbXBpbGVkRGlyZWN0aXZlKCBzeW1ib2xDb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgIGlmICggIWFuZ3VsYXIuaXNGdW5jdGlvbiggY29tcGlsZWRTeW1ib2wgKSApIHtcblxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVN0ciA9ICc8JyArIHN5bWJvbENvbXBvbmVudCArICc+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC8nICsgc3ltYm9sQ29tcG9uZW50ICsgJz4nO1xuXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gYW5ndWxhci5lbGVtZW50KCB0ZW1wbGF0ZVN0ciApO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkU3ltYm9sID0gJGNvbXBpbGUoIHRlbXBsYXRlICk7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuc2V0Q29tcGlsZWREaXJlY3RpdmUoIHN5bWJvbENvbXBvbmVudCwgY29tcGlsZWRTeW1ib2wgKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICRlbCA9ICQoIGVsZW1lbnQgKTtcblxuICAgICAgICAgICAgICAgIGNvbXBpbGVkU3ltYm9sKCBzY29wZSwgZnVuY3Rpb24gKCBjbG9uZWRFbGVtZW50ICkge1xuICAgICAgICAgICAgICAgICAgICAkZWwuZmluZCggJy5zeW1ib2wtcGxhY2Vob2xkZXInIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlV2l0aCggY2xvbmVkRWxlbWVudCApO1xuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLnJlZ2lzdGVyQ29tcG9uZW50RWxlbWVudCggc2NvcGUuY29tcG9uZW50LmlkLCAkZWwgKTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbiggJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci51bnJlZ2lzdGVyQ29tcG9uZW50RWxlbWVudCggc2NvcGUuY29tcG9uZW50LmlkICk7XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuKTtcblxuc3ltYm9sc01vZHVsZS5kaXJlY3RpdmUoXG4gICAgJ2dlbmVyaWNTdmcnLFxuXG4gICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzY29wZTogZmFsc2UsXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZ2VuZXJpY1N2Zy5odG1sJyxcbiAgICAgICAgICAgIHRlbXBsYXRlTmFtZXNwYWNlOiAnU1ZHJ1xuICAgICAgICB9O1xuICAgIH1cbik7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuZGlvZGUnLCBbXVxuKVxuICAgIC5jb25maWcoIFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uICggc3ltYm9sTWFuYWdlclByb3ZpZGVyICkge1xuICAgICAgICAgICAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Rpb2RlJyxcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLWRpb2RlJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ0QnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC04XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNjAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxNSxcbiAgICAgICAgICAgICAgICBwb3J0czogWyB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQycsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQycsXG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQScsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBJyxcbiAgICAgICAgICAgICAgICAgICAgeDogNjAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDdcbiAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgIF0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuaW5kdWN0b3InLCBbXVxuKVxuICAgIC5jb25maWcoIFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uICggc3ltYm9sTWFuYWdlclByb3ZpZGVyICkge1xuICAgICAgICAgICAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2luZHVjdG9yJyxcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLWluZHVjdG9yJyxcbiAgICAgICAgICAgICAgICBsYWJlbFByZWZpeDogJ0wnLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC04XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxMCxcbiAgICAgICAgICAgICAgICBwb3J0czogWyB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAncDEnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAncDEnLFxuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiA2LjVcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAncDInLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ3AyJyxcbiAgICAgICAgICAgICAgICAgICAgeDogNTAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDYuNVxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5qRmV0UCcsIFtdXG4pXG4gICAgLmNvbmZpZyggWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKCBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIgKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnakZldFAnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24takZldFAnLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnUScsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgICAgICAgICAgeTogMTJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA2MixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDcwLFxuICAgICAgICAgICAgICAgIHBvcnRzOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdzJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAyNzAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1MnLFxuICAgICAgICAgICAgICAgICAgICB4OiA0NyxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdkJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiA5MCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRCcsXG4gICAgICAgICAgICAgICAgICAgIHg6IDQ3LFxuICAgICAgICAgICAgICAgICAgICB5OiA3MFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdnJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0cnLFxuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAyNlxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5vcEFtcCcsIFtdXG4pXG4gICAgLmNvbmZpZyggWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKCBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIgKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnb3BBbXAnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tb3BBbXAnLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnQScsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiA5MCxcbiAgICAgICAgICAgICAgICAgICAgeTogMTVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICAgICAgcG9ydHM6IFsge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ1ZzKycsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMjcwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWcysnLFxuICAgICAgICAgICAgICAgICAgICB4OiA2NSxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdWb3V0JyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWb3V0JyxcbiAgICAgICAgICAgICAgICAgICAgeDogMTQwLFxuICAgICAgICAgICAgICAgICAgICB5OiA1MFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdWcy0nLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDkwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWcy0nLFxuICAgICAgICAgICAgICAgICAgICB4OiA2NSxcbiAgICAgICAgICAgICAgICAgICAgeTogMTAwXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ1YtJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1YtJyxcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogNzVcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnVisnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVisnLFxuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAyNVxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5yZXNpc3RvcicsIFtdXG4pXG4gICAgLmNvbmZpZyggWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKCBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIgKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncmVzaXN0b3InLFxuICAgICAgICAgICAgICAgIHN5bWJvbENvbXBvbmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tcmVzaXN0b3InLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnUicsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLThcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA2MCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgICAgICAgIHBvcnRzOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDVcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAncDInLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ3AyJyxcbiAgICAgICAgICAgICAgICAgICAgeDogNjAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDVcbiAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgIF0gKTsiLG51bGwsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2xNYXRyaXggPSByZXF1aXJlKCAnZ2xNYXRyaXgnICk7XG5cbnZhciBDb21wb25lbnRQb3J0ID0gZnVuY3Rpb24gKCBkZXNjcmlwdG9yICkge1xuXG4gICAgYW5ndWxhci5leHRlbmQoIHRoaXMsIGRlc2NyaXB0b3IgKTtcblxufTtcblxuQ29tcG9uZW50UG9ydC5wcm90b3R5cGUuZ2V0R3JpZFBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHBvc2l0aW9uLFxuICAgICAgICBwb3NpdGlvblZlY3RvcjtcblxuICAgIGlmICggYW5ndWxhci5pc09iamVjdCggdGhpcy5wb3J0U3ltYm9sICkgJiYgYW5ndWxhci5pc09iamVjdCggdGhpcy5wYXJlbnRDb21wb25lbnQgKSApIHtcblxuICAgICAgICBwb3NpdGlvblZlY3RvciA9IGdsTWF0cml4LnZlYzIuY3JlYXRlKCk7XG4gICAgICAgIGdsTWF0cml4LnZlYzIuc2V0KCBwb3NpdGlvblZlY3RvciwgdGhpcy5wb3J0U3ltYm9sLngsIHRoaXMucG9ydFN5bWJvbC55ICk7XG5cbiAgICAgICAgZ2xNYXRyaXgudmVjMi50cmFuc2Zvcm1NYXQzKCBwb3NpdGlvblZlY3RvciwgcG9zaXRpb25WZWN0b3IsIHRoaXMucGFyZW50Q29tcG9uZW50LmdldFRyYW5zZm9ybWF0aW9uTWF0cml4KCkgKTtcblxuICAgICAgICBwb3NpdGlvbiA9IHtcblxuICAgICAgICAgICAgeDogcG9zaXRpb25WZWN0b3JbIDAgXSxcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uVmVjdG9yWyAxIF1cblxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9uO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudFBvcnQ7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBnbE1hdHJpeCA9IHJlcXVpcmUoICdnbE1hdHJpeCcgKTtcblxudmFyIERpYWdyYW1Db21wb25lbnQgPSBmdW5jdGlvbiAoIGRlc2NyaXB0b3IgKSB7XG5cbiAgICBpZiAoICFhbmd1bGFyLmlzT2JqZWN0KCBkZXNjcmlwdG9yLnN5bWJvbCApICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdObyBzeW1ib2wgZm91bmQgZm9yIGNvbXBvbmVudCAnICsgdGhpcy5pZCApO1xuICAgIH1cblxuICAgIGFuZ3VsYXIuZXh0ZW5kKCB0aGlzLCBkZXNjcmlwdG9yICk7XG5cbiAgICAvLyBGb3Igcm90YXRpb25cbiAgICB0aGlzLl9jZW50ZXJPZmZzZXQgPSBbIHRoaXMuc3ltYm9sLndpZHRoIC8gMiwgdGhpcy5zeW1ib2wuaGVpZ2h0IC8gMiBdO1xuXG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5pc0luVmlld1BvcnQgPSBmdW5jdGlvbiAoIHZpZXdQb3J0LCBwYWRkaW5nICkge1xuXG4gICAgLy9UT0RPOiBjb3VudCB3aWR0aCBhbmQgaGVpZ2h0IGZvciBvcmllbnRhdGlvblxuICAgIHBhZGRpbmcgPSBwYWRkaW5nIHx8IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgICBhbmd1bGFyLmlzT2JqZWN0KCB2aWV3UG9ydCApICYmXG4gICAgICAgIHRoaXMueCArIHRoaXMuc3ltYm9sLndpZHRoID49ICggdmlld1BvcnQubGVmdCArIHBhZGRpbmcueCApICYmXG4gICAgICAgIHRoaXMueCA8PSAoIHZpZXdQb3J0LnJpZ2h0IC0gcGFkZGluZy54ICkgJiZcbiAgICAgICAgdGhpcy55ICsgdGhpcy5zeW1ib2wuaGVpZ2h0ID49ICggdmlld1BvcnQudG9wICsgcGFkZGluZy55ICkgJiZcbiAgICAgICAgdGhpcy55IDw9ICggdmlld1BvcnQuYm90dG9tIC0gcGFkZGluZy55ICkgKTtcbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmdldFRyYW5zZm9ybWF0aW9uTWF0cml4ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCAhYW5ndWxhci5pc0FycmF5KCB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ICkgKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeDtcblxufTtcblxuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5nZXRTVkdUcmFuc2Zvcm1hdGlvbk1hdHJpeCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICggIWFuZ3VsYXIuaXNBcnJheSggdGhpcy5zdmdUcmFuc2Zvcm1hdGlvbk1hdHJpeCApICkge1xuICAgICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3ZnVHJhbnNmb3JtYXRpb25NYXRyaXg7XG5cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmdldFNWR1RyYW5zZm9ybWF0aW9uU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHRyYW5zTWF0cml4ID0gdGhpcy5nZXRTVkdUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuXG4gICAgcmV0dXJuIHRyYW5zTWF0cml4LmpvaW4oICcsICcgKTtcbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybWF0aW9uTWF0cml4ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHJvdGF0aW9uUmFkLFxuICAgICAgICAvL3NpbkEsIGNvc0EsXG4gICAgICAgIHRyYW5zbGF0aW9uLFxuICAgICAgICB0cmFuc2Zvcm1NYXQzLFxuICAgICAgICByZXN1bHQ7XG5cbiAgICBpZiAoIGFuZ3VsYXIuaXNOdW1iZXIoIHRoaXMucm90YXRpb24gKSAmJlxuICAgICAgICBhbmd1bGFyLmlzTnVtYmVyKCB0aGlzLnggKSxcbiAgICAgICAgYW5ndWxhci5pc051bWJlciggdGhpcy55ICkgKSB7XG5cbiAgICAgICAgcm90YXRpb25SYWQgPSB0aGlzLnJvdGF0aW9uIC8gMTgwICogTWF0aC5QSTtcblxuICAgICAgICB0cmFuc2Zvcm1NYXQzID0gZ2xNYXRyaXgubWF0My5jcmVhdGUoKTtcblxuICAgICAgICB0cmFuc2xhdGlvbiA9IGdsTWF0cml4LnZlYzIuY3JlYXRlKCk7XG5cbiAgICAgICAgZ2xNYXRyaXgudmVjMi5zZXQoIHRyYW5zbGF0aW9uLCB0aGlzLnggKyB0aGlzLl9jZW50ZXJPZmZzZXRbMF0sIHRoaXMueSArIHRoaXMuX2NlbnRlck9mZnNldFsxXSk7XG5cbiAgICAgICAgZ2xNYXRyaXgubWF0My50cmFuc2xhdGUoXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0MyxcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uXG4gICAgICAgICk7XG5cbiAgICAgICAgZ2xNYXRyaXgubWF0My5yb3RhdGUoXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0MyxcbiAgICAgICAgICAgIHJvdGF0aW9uUmFkXG4gICAgICAgICk7XG5cbiAgICAgICAgZ2xNYXRyaXgudmVjMi5zZXQoIHRyYW5zbGF0aW9uLCAtdGhpcy5fY2VudGVyT2Zmc2V0WzBdLCAtdGhpcy5fY2VudGVyT2Zmc2V0WzFdKTtcblxuICAgICAgICBnbE1hdHJpeC5tYXQzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICB0cmFuc2Zvcm1NYXQzLFxuICAgICAgICAgICAgdHJhbnNsYXRpb25cbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ID0gdHJhbnNmb3JtTWF0MztcblxuICAgICAgICB0aGlzLnN2Z1RyYW5zZm9ybWF0aW9uTWF0cml4ID0gW1xuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgMCBdLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgMSBdLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgMyBdLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgNCBdLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgNiBdLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgNyBdXG4gICAgICAgIF07XG5cbiAgICAgICAgcmVzdWx0ID0gdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeDtcblxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG5cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnlcbiAgICB9O1xuXG59O1xuXG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24gKCB4LCB5ICkge1xuXG4gICAgaWYgKCBhbmd1bGFyLmlzTnVtYmVyKCB4ICkgJiYgYW5ndWxhci5pc051bWJlciggeSApICkge1xuXG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQ29vcmRpbmF0ZXMgbXVzdCBiZSBudW1iZXJzIScgKTtcbiAgICB9XG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbiAoIGFuZ2xlICkge1xuXG4gICAgaWYgKCBhbmd1bGFyLmlzTnVtYmVyKCBhbmdsZSApICkge1xuXG4gICAgICAgIHRoaXMucm90YXRpb24gKz0gYW5nbGU7XG5cbiAgICAgICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQW5nbGUgbXVzdCBiZSBudW1iZXIhJyApO1xuICAgIH1cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLnJlZ2lzdGVyUG9ydEluc3RhbmNlcyA9IGZ1bmN0aW9uICggbmV3UG9ydHMgKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnBvcnRJbnN0YW5jZXMgPSB0aGlzLnBvcnRJbnN0YW5jZXMgfHwgW107XG5cbiAgICBhbmd1bGFyLmZvckVhY2goIG5ld1BvcnRzLCBmdW5jdGlvbiAoIG5ld1BvcnQgKSB7XG5cbiAgICAgICAgbmV3UG9ydC5wYXJlbnRDb21wb25lbnQgPSBzZWxmO1xuICAgICAgICBzZWxmLnBvcnRJbnN0YW5jZXMucHVzaCggbmV3UG9ydCApO1xuXG4gICAgfSApO1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtZWREaW1lbnNpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vICB2YXIgd2lkdGgsIGhlaWdodDtcbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmxvY2FsVG9HbG9iYWwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoICF0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ICkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ID0gdGhpcy5nZXRUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGlhZ3JhbUNvbXBvbmVudDsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFdpcmUgPSBmdW5jdGlvbiAoIGRlc2NyaXB0b3IgKSB7XG5cbiAgICBhbmd1bGFyLmV4dGVuZCggdGhpcywgZGVzY3JpcHRvciApO1xuXG4gICAgdGhpcy5zZWdtZW50cyA9IFtdO1xuXG59O1xuXG5XaXJlLnByb3RvdHlwZS5pc0luVmlld1BvcnQgPSBmdW5jdGlvbiAoIHZpZXdQb3J0LCBwYWRkaW5nICkge1xuXG4gICAgdmFyIGosXG4gICAgICAgIHNob3VsZEJlVmlzaWJsZSxcbiAgICAgICAgc2VnbWVudDtcblxuICAgIHBhZGRpbmcgPSBwYWRkaW5nIHx8IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBzaG91bGRCZVZpc2libGUgPSBmYWxzZTtcblxuICAgIGlmICggdGhpcy5yb3V0ZXJUeXBlID09PSAnRWxib3dSb3V0ZXInICkge1xuXG4gICAgICAgIGlmICggYW5ndWxhci5pc0FycmF5KCB0aGlzLnNlZ21lbnRzICkgKSB7XG5cbiAgICAgICAgICAgIGZvciAoIGogPSAwOyBqIDwgdGhpcy5zZWdtZW50cy5sZW5ndGggJiYgIXNob3VsZEJlVmlzaWJsZTsgaisrICkge1xuXG4gICAgICAgICAgICAgICAgc2VnbWVudCA9IHRoaXMuc2VnbWVudHNbIGogXTtcblxuICAgICAgICAgICAgICAgIGlmICggc2VnbWVudC5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJyApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIHNlZ21lbnQueDEgPj0gKCB2aWV3UG9ydC5sZWZ0ICsgcGFkZGluZy54ICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQueDEgPD0gKCB2aWV3UG9ydC5yaWdodCAtIHBhZGRpbmcueCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIHNlZ21lbnQueTEgPj0gKCB2aWV3UG9ydC50b3AgKyBwYWRkaW5nLnkgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudC55MSA8PSAoIHZpZXdQb3J0LmJvdHRvbSAtIHBhZGRpbmcueSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2hvdWxkQmVWaXNpYmxlO1xuXG59O1xuXG5XaXJlLnByb3RvdHlwZS5nZXRFbmRQb3NpdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgcG9ydDFQb3NpdGlvbixcbiAgICAgICAgcG9ydDJQb3NpdGlvbjtcblxuICAgIHBvcnQxUG9zaXRpb24gPSB0aGlzLmVuZDEucG9ydC5nZXRHcmlkUG9zaXRpb24oKTtcbiAgICBwb3J0MlBvc2l0aW9uID0gdGhpcy5lbmQyLnBvcnQuZ2V0R3JpZFBvc2l0aW9uKCk7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGVuZDE6IHBvcnQxUG9zaXRpb24sXG4gICAgICAgIGVuZDI6IHBvcnQyUG9zaXRpb25cblxuICAgIH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gV2lyZTsiLCIvKmdsb2JhbHMgYW5ndWxhciAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5hbmd1bGFyLm1vZHVsZSgnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZGlhZ3JhbVNlcnZpY2UnLCBbXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xTZXJ2aWNlcycsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5vcGVyYXRpb25zTWFuYWdlcidcbiAgICBdKVxuICAgIC5jb25maWcoWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgJ29wZXJhdGlvbnNNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICBmdW5jdGlvbiAoc3ltYm9sTWFuYWdlclByb3ZpZGVyKSB7XG5cbiAgICAgICAgICAgIHZhciByYW5kb21TeW1ib2xHZW5lcmF0b3IsXG4gICAgICAgICAgICAgICAga2luZHMgPSA3O1xuXG4gICAgICAgICAgICByYW5kb21TeW1ib2xHZW5lcmF0b3IgPSBmdW5jdGlvbiAoY291bnQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICBwb3J0Q291bnQsXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgbWFrZUFSYW5kb21TeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgIG1ha2VTb21lUG9ydHMsXG4gICAgICAgICAgICAgICAgICAgIG1pblBvcnRzID0gNixcbiAgICAgICAgICAgICAgICAgICAgbWF4UG9ydHMgPSAzMCxcbiAgICAgICAgICAgICAgICAgICAgcG9ydFdpcmVMZW5ndGggPSAyMCxcblxuICAgICAgICAgICAgICAgICAgICBzcHJlYWRQb3J0c0Fsb25nU2lkZTtcblxuICAgICAgICAgICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlID0gZnVuY3Rpb24gKHNvbWVQb3J0cywgc2lkZSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gMiAqIHBvcnRXaXJlTGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzb21lUG9ydHMsIGZ1bmN0aW9uIChhUG9ydCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHNpZGUpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LnggPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LnkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC53aXJlQW5nbGUgPSAtOTA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHdpZHRoIC8gKCBzb21lUG9ydHMubGVuZ3RoICsgMiApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC54ID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LnkgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ICs9IGhlaWdodCAvICggc29tZVBvcnRzLmxlbmd0aCArIDIgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LnggPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LnkgPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDkwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCArPSB3aWR0aCAvICggc29tZVBvcnRzLmxlbmd0aCArIDIgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC54ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQueSA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQud2lyZUFuZ2xlID0gMTgwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCArPSBoZWlnaHQgLyAoIHNvbWVQb3J0cy5sZW5ndGggKyAyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH07XG5cblxuICAgICAgICAgICAgICAgIG1ha2VTb21lUG9ydHMgPSBmdW5jdGlvbiAoY291bnRPZlBvcnRzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBvcnRzID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbSA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGgsIGhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZGVzID0gWyB0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRTcGFjaW5nID0gMjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aCA9IDE0MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodCA9IDgwO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudE9mUG9ydHM7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncF8nICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BvcnQtJyArIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjBcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWRlc1sgcGxhY2VtZW50IF0ucHVzaChwb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0U3BhY2luZyAqIHRvcC5sZW5ndGggKyA0ICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0U3BhY2luZyAqIGJvdHRvbS5sZW5ndGggKyA0ICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aFxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydFNwYWNpbmcgKiBsZWZ0Lmxlbmd0aCArIDQgKiBwb3J0V2lyZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRTcGFjaW5nICogcmlnaHQubGVuZ3RoICsgNCAqIHBvcnRXaXJlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGUodG9wLCAndG9wJywgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKHJpZ2h0LCAncmlnaHQnLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGUoYm90dG9tLCAnYm90dG9tJywgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKGxlZnQsICdsZWZ0Jywgd2lkdGgsIGhlaWdodCk7XG5cblxuICAgICAgICAgICAgICAgICAgICBwb3J0cyA9IHBvcnRzLmNvbmNhdCh0b3ApXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29uY2F0KHJpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChib3R0b20pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29uY2F0KGxlZnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0czogcG9ydHMsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIG1ha2VBUmFuZG9tU3ltYm9sID0gZnVuY3Rpb24gKGlkUG9zdGZpeCwgY291bnRPZlBvcnRzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBvcnRzQW5kU2l6ZXMgPSBtYWtlU29tZVBvcnRzKGNvdW50T2ZQb3J0cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHN5bWJvbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdyYW5kb21fJyArIGlkUG9zdGZpeCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbENvbXBvbmVudDogJ2JveCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICdSTkRfJyArIGNvdW50T2ZQb3J0cyArICdfJyArIGlkUG9zdGZpeCArICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBwb3J0V2lyZUxlbmd0aCArIDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBvcnRXaXJlTGVuZ3RoICsgMjBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0V2lyZUxlbmd0aDogcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogcG9ydHNBbmRTaXplcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogcG9ydHNBbmRTaXplcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0czogcG9ydHNBbmRTaXplcy5wb3J0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveEhlaWdodDogcG9ydHNBbmRTaXplcy5oZWlnaHQgLSAyICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hXaWR0aDogcG9ydHNBbmRTaXplcy53aWR0aCAtIDIgKiBwb3J0V2lyZUxlbmd0aFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgZGVidWdnZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN5bWJvbDtcblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHBvcnRDb3VudCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbWF4UG9ydHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluUG9ydHNcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBzeW1ib2wgPSBtYWtlQVJhbmRvbVN5bWJvbChpLCBwb3J0Q291bnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbChzeW1ib2wpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByYW5kb21TeW1ib2xHZW5lcmF0b3Ioa2luZHMpO1xuXG4gICAgICAgIH1cbiAgICBdKVxuICAgIC5zZXJ2aWNlKCdkaWFncmFtU2VydmljZScsIFtcbiAgICAgICAgJyRxJyxcbiAgICAgICAgJyR0aW1lb3V0JyxcbiAgICAgICAgJ3N5bWJvbE1hbmFnZXInLFxuICAgICAgICAnJHN0YXRlUGFyYW1zJyxcbiAgICAgICAgJ3dpcmluZ1NlcnZpY2UnLFxuICAgICAgICAnb3BlcmF0aW9uc01hbmFnZXInLFxuICAgICAgICBmdW5jdGlvbiAoJHEsICR0aW1lb3V0LCBzeW1ib2xNYW5hZ2VyLCAkc3RhdGVQYXJhbXMsIHdpcmluZ1NlcnZpY2UvKiwgb3BlcmF0aW9uc01hbmFnZXIqLykge1xuXG4gICAgICAgICAgICB2YXJcbiAgICAgICAgICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzID0gW10sXG4gICAgICAgICAgICAgICAgY29tcG9uZW50c0J5SWQgPSB7fSxcblxuICAgICAgICAgICAgICAgIHdpcmVzID0gW10sXG4gICAgICAgICAgICAgICAgd2lyZXNCeUlkID0ge30sXG4gICAgICAgICAgICAgICAgd2lyZXNCeUNvbXBvbmVudElkID0ge30sXG5cbiAgICAgICAgICAgICAgICB3aWR0aCA9IDUwMDAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gNTAwMCxcblxuICAgICAgICAgICAgICAgIHN5bWJvbFR5cGVzLFxuXG4gICAgICAgICAgICAgICAgcmVnaXN0ZXJXaXJlRm9yRW5kcyxcblxuICAgICAgICAgICAgICAgIERpYWdyYW1Db21wb25lbnQgPSByZXF1aXJlKCcuL2NsYXNzZXMvRGlhZ3JhbUNvbXBvbmVudC5qcycpLFxuICAgICAgICAgICAgICAgIENvbXBvbmVudFBvcnQgPSByZXF1aXJlKCcuL2NsYXNzZXMvQ29tcG9uZW50UG9ydCcpLFxuICAgICAgICAgICAgICAgIFdpcmUgPSByZXF1aXJlKCcuL2NsYXNzZXMvV2lyZS5qcycpO1xuXG4gICAgICAgICAgICBzeW1ib2xUeXBlcyA9IHN5bWJvbE1hbmFnZXIuZ2V0QXZhaWxhYmxlU3ltYm9scygpO1xuXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlRHVtbXlEaWFncmFtID0gZnVuY3Rpb24gKGNvdW50T2ZCb3hlcywgY291bnRPZldpcmVzLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgaSwgaWQsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50T2ZUeXBlcyxcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICB0eXBlSWQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHgsXG4gICAgICAgICAgICAgICAgICAgIHksXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbFR5cGVJZHMsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDEsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDIsXG4gICAgICAgICAgICAgICAgICAgIHBvcnQxLFxuICAgICAgICAgICAgICAgICAgICBwb3J0MixcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZFBvcnRzLFxuICAgICAgICAgICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50LFxuXG4gICAgICAgICAgICAgICAgICAgIHBvcnRDcmVhdG9yLFxuXG4gICAgICAgICAgICAgICAgICAgIHdpcmU7XG5cbiAgICAgICAgICAgICAgICBwb3J0Q3JlYXRvciA9IGZ1bmN0aW9uIChjb21wb25lbnRJZCwgcG9ydHMpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcG9ydEluc3RhbmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydEluc3RhbmNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRNYXBwaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgIHBvcnRJbnN0YW5jZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgcG9ydE1hcHBpbmcgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocG9ydHMsIGZ1bmN0aW9uIChwb3J0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRJbnN0YW5jZSA9IG5ldyBDb21wb25lbnRQb3J0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQgKyAnXycgKyBwb3J0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRTeW1ib2w6IHBvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzLnB1c2gocG9ydEluc3RhbmNlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydE1hcHBpbmdbIHBvcnQuaWQgXSA9IHBvcnRJbnN0YW5jZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRJbnN0YW5jZXM6IHBvcnRJbnN0YW5jZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0TWFwcGluZzogcG9ydE1hcHBpbmdcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzeW1ib2xUeXBlSWRzID0gT2JqZWN0LmtleXMoc3ltYm9sVHlwZXMpO1xuXG4gICAgICAgICAgICAgICAgY291bnRPZlR5cGVzID0gc3ltYm9sVHlwZUlkcy5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICBjb21wb25lbnRzID0gW107XG4gICAgICAgICAgICAgICAgY29tcG9uZW50c0J5SWQgPSB7fTtcblxuICAgICAgICAgICAgICAgIHdpZHRoID0gY2FudmFzV2lkdGg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvdW50T2ZCb3hlczsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdHlwZUlkID0gc3ltYm9sVHlwZUlkc1sgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY291bnRPZlR5cGVzKSBdO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID0gc3ltYm9sVHlwZXNbIHR5cGVJZCBdO1xuXG4gICAgICAgICAgICAgICAgICAgIHggPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAoIGNhbnZhc1dpZHRoIC0gMSApKTtcbiAgICAgICAgICAgICAgICAgICAgeSA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqICggY2FudmFzSGVpZ2h0IC0gMSApKTtcblxuICAgICAgICAgICAgICAgICAgICBpZCA9ICdjb21wb25lbnRfJyArIHR5cGVJZCArICdfJyArIGk7XG5cbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sID0gc3ltYm9sTWFuYWdlci5nZXRTeW1ib2wodHlwZUlkKTtcblxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkUG9ydHMgPSBwb3J0Q3JlYXRvcihpZCwgc3ltYm9sLnBvcnRzKTtcblxuICAgICAgICAgICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50ID0gbmV3IERpYWdyYW1Db21wb25lbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHR5cGUubGFiZWxQcmVmaXggKyBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRpb246IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQwKSAqIDkwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVYOiAxLCAvL1sxLCAtMV1bTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZVk6IDEsIC8vWzEsIC0xXVtNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbDogc3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9uU2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbkxvY2tlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudC5yZWdpc3RlclBvcnRJbnN0YW5jZXMoY3JlYXRlZFBvcnRzLnBvcnRJbnN0YW5jZXMpO1xuXG4gICAgICAgICAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmFkZENvbXBvbmVudChuZXdEaWFncmFtQ29tcG9uZW50KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdpcmVzID0gW107XG4gICAgICAgICAgICAgICAgd2lyZXNCeUlkID0ge307XG5cbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnRPZldpcmVzOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICBpZCA9ICd3aXJlXycgKyBpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDEgPSBjb21wb25lbnRzLmdldFJhbmRvbUVsZW1lbnQoKTtcblxuICAgICAgICAgICAgICAgICAgICBwb3J0MSA9IGNvbXBvbmVudDEucG9ydEluc3RhbmNlcy5nZXRSYW5kb21FbGVtZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHBvcnQyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICghYW5ndWxhci5pc0RlZmluZWQocG9ydDIpIHx8IHBvcnQxID09PSBwb3J0Mikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQyID0gY29tcG9uZW50cy5nZXRSYW5kb21FbGVtZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0MiA9IGNvbXBvbmVudDIucG9ydEluc3RhbmNlcy5nZXRSYW5kb21FbGVtZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB3aXJlID0gbmV3IFdpcmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50MSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0OiBwb3J0MVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9ydDogcG9ydDJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5yb3V0ZVdpcmUod2lyZSwgJ0VsYm93Um91dGVyJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRXaXJlKHdpcmUpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudCA9IGZ1bmN0aW9uIChhRGlhZ3JhbUNvbXBvbmVudCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoYURpYWdyYW1Db21wb25lbnQpICYmICFhbmd1bGFyLmlzRGVmaW5lZChjb21wb25lbnRzQnlJZFsgYURpYWdyYW1Db21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgLmlkIF0pKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c0J5SWRbIGFEaWFncmFtQ29tcG9uZW50LmlkIF0gPSBhRGlhZ3JhbUNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKGFEaWFncmFtQ29tcG9uZW50KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVnaXN0ZXJXaXJlRm9yRW5kcyA9IGZ1bmN0aW9uICh3aXJlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50SWQ7XG5cbiAgICAgICAgICAgICAgICBjb21wb25lbnRJZCA9IHdpcmUuZW5kMS5jb21wb25lbnQuaWQ7XG5cbiAgICAgICAgICAgICAgICB3aXJlc0J5Q29tcG9uZW50SWRbIGNvbXBvbmVudElkIF0gPSB3aXJlc0J5Q29tcG9uZW50SWRbIGNvbXBvbmVudElkIF0gfHwgW107XG5cbiAgICAgICAgICAgICAgICBpZiAod2lyZXNCeUNvbXBvbmVudElkWyBjb21wb25lbnRJZCBdLmluZGV4T2Yod2lyZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpcmVzQnlDb21wb25lbnRJZFsgY29tcG9uZW50SWQgXS5wdXNoKHdpcmUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudElkID0gd2lyZS5lbmQyLmNvbXBvbmVudC5pZDtcblxuICAgICAgICAgICAgICAgIHdpcmVzQnlDb21wb25lbnRJZFsgY29tcG9uZW50SWQgXSA9IHdpcmVzQnlDb21wb25lbnRJZFsgY29tcG9uZW50SWQgXSB8fCBbXTtcblxuICAgICAgICAgICAgICAgIGlmICh3aXJlc0J5Q29tcG9uZW50SWRbIGNvbXBvbmVudElkIF0uaW5kZXhPZih3aXJlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgd2lyZXNCeUNvbXBvbmVudElkWyBjb21wb25lbnRJZCBdLnB1c2god2lyZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmFkZFdpcmUgPSBmdW5jdGlvbiAoYVdpcmUpIHtcblxuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGFXaXJlKSAmJiAhYW5ndWxhci5pc0RlZmluZWQod2lyZXNCeUlkWyBhV2lyZS5pZCBdKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHdpcmVzQnlJZFsgYVdpcmUuaWQgXSA9IGFXaXJlO1xuICAgICAgICAgICAgICAgICAgICB3aXJlcy5wdXNoKGFXaXJlKTtcblxuICAgICAgICAgICAgICAgICAgICByZWdpc3RlcldpcmVGb3JFbmRzKGFXaXJlKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRXaXJlc0ZvckNvbXBvbmVudHMgPSBmdW5jdGlvbiAoY29tcG9uZW50cykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHNldE9mV2lyZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChjb21wb25lbnRzLCBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHdpcmVzQnlDb21wb25lbnRJZFsgY29tcG9uZW50LmlkIF0sIGZ1bmN0aW9uICh3aXJlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXRPZldpcmVzLmluZGV4T2Yod2lyZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0T2ZXaXJlcy5wdXNoKHdpcmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldE9mV2lyZXM7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RGlhZ3JhbSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGNvbXBvbmVudHMsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHNCeUlkOiBjb21wb25lbnRzQnlJZCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZXM6IHdpcmVzLFxuICAgICAgICAgICAgICAgICAgICB3aXJlc0J5SWQ6IHdpcmVzQnlJZCxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FsbG93U2VsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENvbXBvbmVudElkczogW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0SGlnaGVzdFogPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICB6O1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBjb21wb25lbnRzWyBpIF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihjb21wb25lbnQueikpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKHopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeiA9IGNvbXBvbmVudC56O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh6IDwgY29tcG9uZW50LnopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeiA9IGNvbXBvbmVudC56O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4oeikpIHtcbiAgICAgICAgICAgICAgICAgICAgeiA9IC0xO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB6O1xuXG4gICAgICAgICAgICB9O1xuXG4vLyAgICAgICAgICAgIG9wZXJhdGlvbnNNYW5hZ2VyLnJlZ2lzdGVyT3BlcmF0aW9uKHtcbi8vICAgICAgICAgICAgICAgIGlkOiAnc2V0Q29tcG9uZW50UG9zaXRpb24nLFxuLy8gICAgICAgICAgICAgICAgY29tbWl0OiBmdW5jdGlvbiAoY29tcG9uZW50LCB4LCB5KSB7XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGNvbXBvbmVudCkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNldFBvc2l0aW9uKHgsIHkpO1xuLy8gICAgICAgICAgICAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAvL3RoaXMuZ2VuZXJhdGVEdW1teURpYWdyYW0oMTAwMCwgMjAwLCA1MDAwLCA1MDAwKTtcbiAgICAgICAgICAgIC8vdGhpcy5nZW5lcmF0ZUR1bW15RGlhZ3JhbSgxMDAwLCAyMDAwLCAxMDAwMCwgMTAwMDApO1xuICAgICAgICAgICAgLy90aGlzLmdlbmVyYXRlRHVtbXlEaWFncmFtKDEwLCA1LCAxMjAwLCAxMjAwKTtcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVEdW1teURpYWdyYW0oIDEwMCwgNTAsIDMwMDAsIDMwMDAgKTtcblxuICAgICAgICB9XG4gICAgXSk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGdyaWRTZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5ncmlkU2VydmljZScsIFtdICk7XG5cbmdyaWRTZXJ2aWNlc01vZHVsZS5zZXJ2aWNlKCAnZ3JpZFNlcnZpY2UnLCBbICckbG9nJywgJyRyb290U2NvcGUnLCAnJHRpbWVvdXQnLFxuICAgIGZ1bmN0aW9uICggJGxvZywgJHJvb3RTY29wZSwgJHRpbWVvdXQgKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuXG4gICAgICAgICAgICBncmlkcyA9IHt9LFxuXG4gICAgICAgICAgICBudW1iZXJPZkNoYW5nZXNBbGxvd2VkSW5PbmVDeWNsZSA9IDEsXG4gICAgICAgICAgICByZWNhbGN1bGF0ZUN5Y2xlRGVsYXkgPSAxNSxcbiAgICAgICAgICAgIHZpZXdQb3J0UGFkZGluZyA9IHtcbiAgICAgICAgICAgICAgICB4OiAtNjAwLFxuICAgICAgICAgICAgICAgIHk6IC02MDBcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzLFxuICAgICAgICAgICAgX3JlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzLFxuICAgICAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlV2lyZXM7XG5cbiAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlV2lyZXMgPSBmdW5jdGlvbiAoIGdyaWQgKSB7XG5cbiAgICAgICAgICAgIHZhciBpbmRleCxcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgIHdpcmU7XG5cblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGdyaWQud2lyZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIHdpcmUgPSBncmlkLndpcmVzW2ldO1xuXG4gICAgICAgICAgICAgICAgaW5kZXggPSBncmlkLnZpc2libGVXaXJlcy5pbmRleE9mKHdpcmUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHdpcmUuaXNJblZpZXdQb3J0KGdyaWQudmlld1BvcnQsIHZpZXdQb3J0UGFkZGluZykpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnZpc2libGVXaXJlcy5wdXNoKHdpcmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnZpc2libGVXaXJlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8kbG9nLmRlYnVnKCAnTnVtYmVyIG9mIHZpc2libGUgd2lyZXM6ICcgKyBncmlkLnZpc2libGVXaXJlcy5sZW5ndGggKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzID0gZnVuY3Rpb24oIGdyaWQsIHN0YXJ0SW5kZXggKSB7XG5cbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoZ3JpZC5jb21wb25lbnRzKSAmJiBhbmd1bGFyLmlzQXJyYXkoZ3JpZC53aXJlcykpIHtcblxuICAgICAgICAgICAgICAgIGlmIChncmlkLnJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUHJvbWlzZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICgkdGltZW91dC5jYW5jZWwoZ3JpZC5yZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50c1Byb21pc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaGFkIHRvIGtpbGwnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZ3JpZC5yZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50c1Byb21pc2UgPSAkdGltZW91dChcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3JlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKGdyaWQsIHN0YXJ0SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIHJlY2FsY3VsYXRlQ3ljbGVEZWxheVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgX3JlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzID0gZnVuY3Rpb24gKCBncmlkLCBzdGFydEluZGV4ICkge1xuXG4gICAgICAgICAgICB2YXIgaSwgY29tcG9uZW50LFxuXG4gICAgICAgICAgICAgICAgY291bnRPZkNoYW5nZXMgPSAwLFxuICAgICAgICAgICAgICAgIGNoYW5nZXNMaW1pdFJlYWNoZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmRleDtcblxuICAgICAgICAgICAgZ3JpZC5pbnNpZGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNSZWNhbGN1bGF0ZSA9IHRydWU7XG5cblxuICAgICAgICAgICAgaWYgKCFjaGFuZ2VzTGltaXRSZWFjaGVkKSB7XG4gICAgICAgICAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlV2lyZXMoIGdyaWQgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggfHwgMDtcblxuICAgICAgICAgICAgZm9yIChpID0gc3RhcnRJbmRleDsgaTwgZ3JpZC5jb21wb25lbnRzLmxlbmd0aCAmJiBjaGFuZ2VzTGltaXRSZWFjaGVkID09PSBmYWxzZTsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBncmlkLmNvbXBvbmVudHNbaV07XG5cblxuICAgICAgICAgICAgICAgIGluZGV4ID0gZ3JpZC52aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMuaW5kZXhPZiggY29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIGNvbXBvbmVudC5pc0luVmlld1BvcnQoIGdyaWQudmlld1BvcnQsIHZpZXdQb3J0UGFkZGluZyApICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggaW5kZXggPT09IC0xICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZC52aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMucHVzaCggY29tcG9uZW50ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudE9mQ2hhbmdlcysrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGluZGV4ID4gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvdW50T2ZDaGFuZ2VzKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIGNvdW50T2ZDaGFuZ2VzID49IG51bWJlck9mQ2hhbmdlc0FsbG93ZWRJbk9uZUN5Y2xlICkge1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VzTGltaXRSZWFjaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8kbG9nLmRlYnVnKCAnTnVtYmVyIG9mIGNoYW5nZXMgY29tcGFyZWQgdG8gcHJldmlvdXMgZGlhZ3JhbSBzdGF0ZTonLCBjb3VudE9mQ2hhbmdlcyApO1xuXG4gICAgICAgICAgICBpZiAoICFjaGFuZ2VzTGltaXRSZWFjaGVkICkge1xuXG4gICAgICAgICAgICAgICAgc2VsZi5yZW9yZGVyVmlzaWJsZUNvbXBvbmVudHMoIGdyaWQuaWQgKTtcblxuICAgICAgICAgICAgICAgIGdyaWQuaW5zaWRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUmVjYWxjdWxhdGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmICghZ3JpZC5pbml0aWFsaXplZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGdyaWQuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdHcmlkSW5pdGlhbGl6ZWQnLCBncmlkLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyhncmlkLCBpKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzID0gZnVuY3Rpb24gKCBncmlkSWQgKSB7XG5cbiAgICAgICAgICAgIHZhciBncmlkO1xuXG4gICAgICAgICAgICBncmlkID0gZ3JpZHNbIGdyaWRJZCBdO1xuXG4gICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNEZWZpbmVkKCBncmlkICkgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoICFncmlkLmluc2lkZVZpc2libGVEaWFncmFtQ29tcG9uZW50c1JlY2FsY3VsYXRlICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKGdyaWQpO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cblxuICAgICAgICB0aGlzLmNyZWF0ZUdyaWQgPSBmdW5jdGlvbiAoIGlkLCBkaWFncmFtICkge1xuXG4gICAgICAgICAgICB2YXIgZ3JpZDtcblxuICAgICAgICAgICAgaWYgKCAhYW5ndWxhci5pc0RlZmluZWQoIGdyaWRzWyBpZCBdICkgKSB7XG4gICAgICAgICAgICAgICAgZ3JpZCA9IGdyaWRzWyBpZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGRpYWdyYW0uY29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZURpYWdyYW1Db21wb25lbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgd2lyZXM6IGRpYWdyYW0ud2lyZXMsXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGVXaXJlczogW10sXG4gICAgICAgICAgICAgICAgICAgIHZpZXdQb3J0OiB7fSxcbiAgICAgICAgICAgICAgICAgICAgaW5zaWRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzUmVjYWxjdWxhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplZDogZmFsc2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyAoICdHcmlkIHdhcyBhbHJlYWR5IGRlZmluZWQhJywgaWQgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICB3aXJlczogZ3JpZC52aXNpYmxlV2lyZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG5cblxuICAgICAgICB0aGlzLnNldFZpc2libGVBcmVhID0gZnVuY3Rpb24gKCBncmlkSWQsIHZpZXdQb3J0ICkge1xuICAgICAgICAgICAgdmFyIGdyaWQgPSBncmlkc1sgZ3JpZElkIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0RlZmluZWQoIGdyaWQgKSApIHtcblxuICAgICAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0RlZmluZWQoIHZpZXdQb3J0ICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZ3JpZC52aWV3UG9ydCA9IHZpZXdQb3J0O1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW52YWxpZGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyggZ3JpZC5pZCApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93ICggJ0dyaWQgd2FzIG5vdCBkZWZpbmVkIScsIGdyaWRJZCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW9yZGVyVmlzaWJsZUNvbXBvbmVudHMgPSBmdW5jdGlvbiAoIGdyaWRJZCApIHtcblxuICAgICAgICAgICAgdmFyIGdyaWQgPSBncmlkc1sgZ3JpZElkIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0RlZmluZWQoIGdyaWQgKSApIHtcbiAgICAgICAgICAgICAgICBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cy5zb3J0KCBmdW5jdGlvbiAoIGEsIGIgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBhLnogPiBiLnogKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICggYS56IDwgYi56ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG5cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgIH1cbl0gKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgb3BlcmF0aW9uc01hbmFnZXJNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ub3BlcmF0aW9uc01hbmFnZXInLCBbXSk7XG5cbm9wZXJhdGlvbnNNYW5hZ2VyTW9kdWxlLnByb3ZpZGVyKCdvcGVyYXRpb25zTWFuYWdlcicsIGZ1bmN0aW9uIE9wZXJhdGlvbnNNYW5hZ2VyUHJvdmlkZXIoKSB7XG4gICAgdmFyIHNlbGYsXG4gICAgICAgIGF2YWlsYWJsZU9wZXJhdGlvbnM7XG5cbiAgICBzZWxmID0gdGhpcztcblxuICAgIGF2YWlsYWJsZU9wZXJhdGlvbnMgPSB7fTtcblxuICAgIHRoaXMucmVnaXN0ZXJPcGVyYXRpb24gPSBmdW5jdGlvbiAob3BlcmF0aW9uRGVzY3JpcHRvcikge1xuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KG9wZXJhdGlvbkRlc2NyaXB0b3IpICYmXG4gICAgICAgICAgICBhbmd1bGFyLmlzU3RyaW5nKG9wZXJhdGlvbkRlc2NyaXB0b3IuaWQpKSB7XG4gICAgICAgICAgICBhdmFpbGFibGVPcGVyYXRpb25zWyBvcGVyYXRpb25EZXNjcmlwdG9yLmlkIF0gPSBvcGVyYXRpb25EZXNjcmlwdG9yLm9wZXJhdGlvbkNsYXNzO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuJGdldCA9IFtcblxuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBPcGVyYXRpb25zTWFuYWdlcjtcblxuICAgICAgICAgICAgT3BlcmF0aW9uc01hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyT3BlcmF0aW9uID0gZnVuY3Rpb24gKG9wZXJhdGlvbkRlc2NyaXB0b3IpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChvcGVyYXRpb25EZXNjcmlwdG9yKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5pc1N0cmluZyhvcGVyYXRpb25EZXNjcmlwdG9yLmlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlT3BlcmF0aW9uc1sgb3BlcmF0aW9uRGVzY3JpcHRvci5pZCBdID0gb3BlcmF0aW9uRGVzY3JpcHRvci5vcGVyYXRpb25DbGFzcztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0QXZhaWxhYmxlT3BlcmF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF2YWlsYWJsZU9wZXJhdGlvbnM7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdE5ldyA9IGZ1bmN0aW9uIChvcGVyYXRpb25JZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBPcGVyYXRpb25DbGFzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbkluc3RhbmNlO1xuXG4gICAgICAgICAgICAgICAgICAgIE9wZXJhdGlvbkNsYXNzID0gYXZhaWxhYmxlT3BlcmF0aW9uc1sgb3BlcmF0aW9uSWQgXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKE9wZXJhdGlvbkNsYXNzKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25JbnN0YW5jZSA9IG5ldyBPcGVyYXRpb25DbGFzcygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25JbnN0YW5jZS5pbml0LmFwcGx5KG9wZXJhdGlvbkluc3RhbmNlLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3BlcmF0aW9uSW5zdGFuY2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBPcGVyYXRpb25zTWFuYWdlcigpO1xuXG4gICAgICAgIH1cbiAgICBdO1xufSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzeW1ib2xTZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xTZXJ2aWNlcycsIFtdICk7XG5cbnN5bWJvbFNlcnZpY2VzTW9kdWxlLnByb3ZpZGVyKCAnc3ltYm9sTWFuYWdlcicsIGZ1bmN0aW9uIFN5bWJvbE1hbmFnZXJQcm92aWRlcigpIHtcbiAgICB2YXIgYXZhaWxhYmxlU3ltYm9scyA9IHt9O1xuXG4gICAgdGhpcy5yZWdpc3RlclN5bWJvbCA9IGZ1bmN0aW9uICggc3ltYm9sRGVzY3JpcHRvciApIHtcblxuICAgICAgICBpZiAoIGFuZ3VsYXIuaXNPYmplY3QoIHN5bWJvbERlc2NyaXB0b3IgKSAmJlxuICAgICAgICAgICAgYW5ndWxhci5pc1N0cmluZyggc3ltYm9sRGVzY3JpcHRvci50eXBlICkgKSB7XG4gICAgICAgICAgICBhdmFpbGFibGVTeW1ib2xzWyBzeW1ib2xEZXNjcmlwdG9yLnR5cGUgXSA9IHN5bWJvbERlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy4kZ2V0ID0gW1xuXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIFN5bWJvbE1hbmFnZXI7XG5cbiAgICAgICAgICAgIFN5bWJvbE1hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdldEF2YWlsYWJsZVN5bWJvbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhdmFpbGFibGVTeW1ib2xzO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdldFN5bWJvbCA9IGZ1bmN0aW9uICggc3ltYm9sVHlwZSApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF2YWlsYWJsZVN5bWJvbHNbIHN5bWJvbFR5cGUgXTtcbiAgICAgICAgICAgICAgICB9O1xuXG4vLyAgICAgICAgICAgICAgICB0aGlzLmdldFN5bWJvbEVsZW1lbnRGb3JUeXBlID0gZnVuY3Rpb24gKCBzeW1ib2xUeXBlICkge1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gYXZhaWxhYmxlU3ltYm9sc1sgc3ltYm9sVHlwZSBdICYmIGF2YWlsYWJsZVN5bWJvbHNbIHN5bWJvbFR5cGUgXS5kaXJlY3RpdmU7XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgIGlmICggIXJlc3VsdCApIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gJ3Jlc2lzdG9yJztcbi8vICAgICAgICAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4vLyAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTeW1ib2xNYW5hZ2VyKCk7XG5cbiAgICAgICAgfVxuICAgIF07XG59ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBFbGJvd1JvdXRlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMubmFtZSA9ICdFbGJvd1JvdXRlcic7XG5cbiAgICB0aGlzLm1ha2VTZWdtZW50cyA9IGZ1bmN0aW9uICggcG9pbnRzLCBtZXRob2QgKSB7XG5cbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgICBwb2ludDEsIGVsYm93LCBwb2ludDIsXG4gICAgICAgICAgICBzZWdtZW50cztcblxuICAgICAgICBtZXRob2QgPSBtZXRob2QgfHwgJ3ZlcnRpY2FsRmlyc3QnO1xuXG4gICAgICAgIGlmICggYW5ndWxhci5pc0FycmF5KCBwb2ludHMgKSAmJiBwb2ludHMubGVuZ3RoID49IDIgKSB7XG5cbiAgICAgICAgICAgIHNlZ21lbnRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aCAtIDE7IGkrKyApIHtcblxuICAgICAgICAgICAgICAgIHBvaW50MSA9IHBvaW50c1sgaSBdO1xuICAgICAgICAgICAgICAgIHBvaW50MiA9IHBvaW50c1sgaSArIDEgXTtcblxuICAgICAgICAgICAgICAgIGlmICggbWV0aG9kID09PSAndmVydGljYWxGaXJzdCcgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxib3cgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwb2ludDEueCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBvaW50Mi55XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGVsYm93ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogcG9pbnQxLnksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBwb2ludDIueFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VnbWVudHMucHVzaCgge1xuXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcblxuICAgICAgICAgICAgICAgICAgICB4MTogcG9pbnQxLngsXG4gICAgICAgICAgICAgICAgICAgIHkxOiBwb2ludDEueSxcblxuICAgICAgICAgICAgICAgICAgICB4MjogZWxib3cueCxcbiAgICAgICAgICAgICAgICAgICAgeTI6IGVsYm93LnksXG5cbiAgICAgICAgICAgICAgICAgICAgcm91dGVyOiBzZWxmLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiAoIG1ldGhvZCA9PT0gJ3ZlcnRpY2FsRmlyc3QnICkgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnXG5cbiAgICAgICAgICAgICAgICB9LCB7XG5cbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuXG4gICAgICAgICAgICAgICAgICAgIHgxOiBlbGJvdy54LFxuICAgICAgICAgICAgICAgICAgICB5MTogZWxib3cueSxcblxuICAgICAgICAgICAgICAgICAgICB4MjogcG9pbnQyLngsXG4gICAgICAgICAgICAgICAgICAgIHkyOiBwb2ludDIueSxcblxuICAgICAgICAgICAgICAgICAgICByb3V0ZXI6IHNlbGYubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICggbWV0aG9kID09PSAndmVydGljYWxGaXJzdCcgKSA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCdcblxuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VnbWVudHM7XG5cbiAgICB9O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsYm93Um91dGVyOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUm91dGVyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5tYWtlU2VnbWVudHMgPSBmdW5jdGlvbiAoIHBvaW50cyApIHtcblxuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIHBvaW50MSwgcG9pbnQyLFxuICAgICAgICAgICAgc2VnbWVudHM7XG5cbiAgICAgICAgaWYgKCBhbmd1bGFyLmlzQXJyYXkoIHBvaW50cyApICYmIHBvaW50cy5sZW5ndGggPj0gMiApIHtcblxuICAgICAgICAgICAgc2VnbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgcG9pbnQxID0gcG9pbnRzWyBpIF07XG4gICAgICAgICAgICAgICAgcG9pbnQyID0gcG9pbnRzWyBpICsgMSBdO1xuXG4gICAgICAgICAgICAgICAgc2VnbWVudHMucHVzaCgge1xuXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcblxuICAgICAgICAgICAgICAgICAgICB4MTogcG9pbnQxLngsXG4gICAgICAgICAgICAgICAgICAgIHkxOiBwb2ludDEueSxcblxuICAgICAgICAgICAgICAgICAgICB4MjogcG9pbnQyLngsXG4gICAgICAgICAgICAgICAgICAgIHkyOiBwb2ludDIueVxuXG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWdtZW50cztcblxuICAgIH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlUm91dGVyOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgd2lyaW5nU2VydmljZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ud2lyaW5nU2VydmljZScsIFtdICk7XG5cbndpcmluZ1NlcnZpY2VzTW9kdWxlLnNlcnZpY2UoICd3aXJpbmdTZXJ2aWNlJywgWyAnJGxvZycsICckcm9vdFNjb3BlJywgJyR0aW1lb3V0JyxcbiAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgU2ltcGxlUm91dGVyID0gcmVxdWlyZSggJy4vY2xhc3Nlcy9TaW1wbGVSb3V0ZXIuanMnICksXG4gICAgICAgICAgICBFbGJvd1JvdXRlciA9IHJlcXVpcmUoICcuL2NsYXNzZXMvRWxib3dSb3V0ZXIuanMnICksXG4gICAgICAgICAgICByb3V0ZXJzID0ge1xuXG4gICAgICAgICAgICAgICAgU2ltcGxlUm91dGVyOiBuZXcgU2ltcGxlUm91dGVyKCksXG4gICAgICAgICAgICAgICAgRWxib3dSb3V0ZXI6IG5ldyBFbGJvd1JvdXRlcigpXG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMgPSBmdW5jdGlvbiAoIGVuZFBvc2l0aW9ucywgcm91dGVyVHlwZSApIHtcblxuICAgICAgICAgICAgdmFyIHNlZ21lbnRzLFxuICAgICAgICAgICAgICAgIHJvdXRlcjtcblxuICAgICAgICAgICAgcm91dGVyID0gcm91dGVyc1sgcm91dGVyVHlwZSBdO1xuXG4gICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNPYmplY3QoIHJvdXRlciApICYmIGFuZ3VsYXIuaXNGdW5jdGlvbiggcm91dGVyLm1ha2VTZWdtZW50cyApICkge1xuICAgICAgICAgICAgICAgIHNlZ21lbnRzID0gcm91dGVyLm1ha2VTZWdtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgWyBlbmRQb3NpdGlvbnMuZW5kMSwgZW5kUG9zaXRpb25zLmVuZDIgXSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2VnbWVudHM7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJvdXRlV2lyZSA9IGZ1bmN0aW9uICggd2lyZSwgcm91dGVyVHlwZSApIHtcblxuICAgICAgICAgICAgdmFyIHJvdXRlciwgZW5kUG9zaXRpb25zO1xuXG4gICAgICAgICAgICByb3V0ZXJUeXBlID0gcm91dGVyVHlwZSB8fCAnRWxib3dSb3V0ZXInO1xuXG4gICAgICAgICAgICByb3V0ZXIgPSByb3V0ZXJzWyByb3V0ZXJUeXBlIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggcm91dGVyICkgJiYgYW5ndWxhci5pc0Z1bmN0aW9uKCByb3V0ZXIubWFrZVNlZ21lbnRzICkgKSB7XG5cbiAgICAgICAgICAgICAgICBlbmRQb3NpdGlvbnMgPSB3aXJlLmdldEVuZFBvc2l0aW9ucygpO1xuXG4gICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cyA9IHJvdXRlci5tYWtlU2VnbWVudHMoXG4gICAgICAgICAgICAgICAgICAgIFsgZW5kUG9zaXRpb25zLmVuZDEsIGVuZFBvc2l0aW9ucy5lbmQyIF0gKTtcblxuICAgICAgICAgICAgICAgIHdpcmUucm91dGVyVHlwZSA9IHJvdXRlclR5cGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFkanVzdFdpcmVFbmRTZWdtZW50cyA9IGZ1bmN0aW9uICggd2lyZSApIHtcblxuICAgICAgICAgICAgdmFyIGZpcnN0U2VnbWVudCxcbiAgICAgICAgICAgICAgICBzZWNvbmRTZWdtZW50LFxuICAgICAgICAgICAgICAgIHNlY29uZFRvTGFzdFNlZ21lbnQsXG4gICAgICAgICAgICAgICAgbGFzdFNlZ21lbnQsXG4gICAgICAgICAgICAgICAgZW5kUG9zaXRpb25zLFxuICAgICAgICAgICAgICAgIG5ld1NlZ21lbnRzLFxuICAgICAgICAgICAgICAgIHBvcztcblxuICAgICAgICAgICAgZW5kUG9zaXRpb25zID0gd2lyZS5nZXRFbmRQb3NpdGlvbnMoKTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzQXJyYXkoIHdpcmUuc2VnbWVudHMgKSAmJiB3aXJlLnNlZ21lbnRzLmxlbmd0aCA+IDEgKSB7XG5cbiAgICAgICAgICAgICAgICBmaXJzdFNlZ21lbnQgPSB3aXJlLnNlZ21lbnRzWyAwIF07XG5cbiAgICAgICAgICAgICAgICBpZiAoIGZpcnN0U2VnbWVudC54MSAhPT0gZW5kUG9zaXRpb25zLmVuZDEueCB8fCBmaXJzdFNlZ21lbnQueTEgIT09IGVuZFBvc2l0aW9ucy5lbmQxLnkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBmaXJzdFNlZ21lbnQucm91dGVyID09PSAnRWxib3dSb3V0ZXInICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRTZWdtZW50ID0gd2lyZS5zZWdtZW50c1sgMSBdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogc2Vjb25kU2VnbWVudC54MixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBzZWNvbmRTZWdtZW50LnkyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzLnNwbGljZSggMCwgMiApO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogZmlyc3RTZWdtZW50LngyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGZpcnN0U2VnbWVudC55MlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cy5zcGxpY2UoIDAsIDEgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG5ld1NlZ21lbnRzID0gc2VsZi5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDE6IGVuZFBvc2l0aW9ucy5lbmQxLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMjogcG9zXG4gICAgICAgICAgICAgICAgICAgIH0sIGZpcnN0U2VnbWVudC5yb3V0ZXIgKTtcblxuICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzID0gbmV3U2VnbWVudHMuY29uY2F0KCB3aXJlLnNlZ21lbnRzICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXN0U2VnbWVudCA9IHdpcmUuc2VnbWVudHNbIHdpcmUuc2VnbWVudHMubGVuZ3RoIC0gMSBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBsYXN0U2VnbWVudC54MiAhPT0gZW5kUG9zaXRpb25zLmVuZDIueCB8fCBsYXN0U2VnbWVudC55MiAhPT0gZW5kUG9zaXRpb25zLmVuZDIueSApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGxhc3RTZWdtZW50LnJvdXRlciA9PT0gJ0VsYm93Um91dGVyJyApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kVG9MYXN0U2VnbWVudCA9IHdpcmUuc2VnbWVudHNbIHdpcmUuc2VnbWVudHMubGVuZ3RoIC0gMiBdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogc2Vjb25kVG9MYXN0U2VnbWVudC54MSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBzZWNvbmRUb0xhc3RTZWdtZW50LnkxXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzLnNwbGljZSggd2lyZS5zZWdtZW50cy5sZW5ndGggLSAyLCAyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBsYXN0U2VnbWVudC54MSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBsYXN0U2VnbWVudC55MVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cy5zcGxpY2UoIHdpcmUuc2VnbWVudHMubGVuZ3RoIC0gMSwgMSApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3U2VnbWVudHMgPSBzZWxmLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucygge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMTogcG9zLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMjogZW5kUG9zaXRpb25zLmVuZDJcbiAgICAgICAgICAgICAgICAgICAgfSwgbGFzdFNlZ21lbnQucm91dGVyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2lyZS5zZWdtZW50cyA9IHdpcmUuc2VnbWVudHMuY29uY2F0KCBuZXdTZWdtZW50cyApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYucm91dGVXaXJlKCB3aXJlICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgIH1cbl0gKTsiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoICdBcnJheS5wcm90b3R5cGUuZmluZCcgKTtcblxuaWYgKCAhQXJyYXkucHJvdG90eXBlLmZpbmRCeUlkICkge1xuICAgIEFycmF5LnByb3RvdHlwZS5maW5kQnlJZCA9IGZ1bmN0aW9uICggaWQgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmQoIGZ1bmN0aW9uICggYSApIHtcbiAgICAgICAgICAgIHJldHVybiBhLmlkICE9PSB1bmRlZmluZWQgJiYgYS5pZCA9PT0gaWQ7XG4gICAgICAgIH0gKTtcbiAgICB9O1xufVxuXG5pZiAoICFBcnJheS5wcm90b3R5cGUuZ2V0UmFuZG9tRWxlbWVudCApIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZ2V0UmFuZG9tRWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbIE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAoIHRoaXMubGVuZ3RoIC0gMSApICkgXTtcbiAgICB9O1xufVxuXG5pZiAoICFBcnJheS5wcm90b3R5cGUuc2h1ZmZsZSApIHtcbiAgICBBcnJheS5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMubGVuZ3RoLFxuICAgICAgICAgICAgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xuXG4gICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXG4gICAgICAgIHdoaWxlICggMCAhPT0gY3VycmVudEluZGV4ICkge1xuXG4gICAgICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cbiAgICAgICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleCApO1xuICAgICAgICAgICAgY3VycmVudEluZGV4IC09IDE7XG5cbiAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICAgICAgICAgIHRlbXBvcmFyeVZhbHVlID0gdGhpc1sgY3VycmVudEluZGV4IF07XG4gICAgICAgICAgICB0aGlzWyBjdXJyZW50SW5kZXggXSA9IHRoaXNbIHJhbmRvbUluZGV4IF07XG4gICAgICAgICAgICB0aGlzWyByYW5kb21JbmRleCBdID0gdGVtcG9yYXJ5VmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xufSJdfQ==
