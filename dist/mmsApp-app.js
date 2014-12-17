(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular*/

'use strict';

var CyPhyApp = angular.module('CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.mmsApp.templates',

    'ui.bootstrap',

    'mms.designVisualization.wiringService',
    'mms.designVisualization.diagramService',

    'mms.designVisualization.diagramContainer',
    'mms.designVisualization.fabricCanvas',
    'mms.designVisualization.svgDiagram',
    'mms.designVisualization.symbols',
    'ngMaterial'
]);

require('./utils.js');

require('./services/diagramService/diagramService.js');
require('./services/gridService/gridService.js');
require('./services/wiringService/wiringService.js');

require('./directives/diagramContainer/diagramContainer.js');
require('./directives/fabricCanvas/fabricCanvas.js');
require('./directives/svgDiagram/svgDiagram.js');

require('./directives/symbols/componentSymbol.js');

CyPhyApp.config(function ($stateProvider, $urlRouterProvider) {

    var selectProject;

    selectProject = {
        load: function ($q, $stateParams, $rootScope, $state, $log, dataStoreService, projectService, workspaceService) {
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
                    return projectService.selectProject(connectionId, $stateParams.projectId);
                })
                .then(function (projectId) {

                    var wsContext;

                    $rootScope.projectId = projectId;
                    $rootScope.loading = false;

                    wsContext = {
                        db: $rootScope.mainDbConnectionId,
                        regionId: 'WorkspaceListController_' + ( new Date() )
                            .toISOString()
                    };
                    //$scope.$on( '$destroy', function () {
                    //    workspaceService.cleanUpAllRegions( context );
                    //} );


                    workspaceService.registerWatcher(wsContext, function (destroyed) {

                        console.info('WorkspaceListController - initialize event raised');
                        workspaceService.watchWorkspaces(wsContext, function (updateObject) {
                            var index;

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
                                var workspaceId;

                                for (workspaceId in data.workspaces) {
                                    if (data.workspaces.hasOwnProperty(workspaceId)) {
                                    }
                                }
                            });
                        });


                        deferred.resolve(projectId);
                    })
                        .
                        catch(function (reason) {
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
        .state('project', {
            url: '/project/:projectId',
            templateUrl: '/mmsApp/templates/editor.html',
            resolve: selectProject,
            controller: 'ProjectViewController'
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

    defaultNavigatorItems = [{
        id: 'root',
        label: 'MMS App',
        itemClass: 'cyphy-root'
    }];

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

CyPhyApp.controller('ProjectViewController', function ($scope, $rootScope, diagramService, $log) {

    $scope.diagram = diagramService.getDiagram();


    $log.debug('Diagram:', $scope.diagram);

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
                $state.go('project', {
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

},{"./directives/diagramContainer/diagramContainer.js":6,"./directives/fabricCanvas/fabricCanvas.js":8,"./directives/svgDiagram/svgDiagram.js":10,"./directives/symbols/componentSymbol.js":13,"./services/diagramService/diagramService.js":22,"./services/gridService/gridService.js":23,"./services/wiringService/wiringService.js":27,"./utils.js":28}],2:[function(require,module,exports){
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
},{"./componentWireSegment":5}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
/*globals angular, $*/

'use strict';

// Move this to GME eventually

require( '../drawingCanvas/drawingCanvas.js' );

angular.module( 'mms.designVisualization.diagramContainer', [
    'mms.designVisualization.drawingCanvas',
    'panzoom',
    'panzoomwidget'
] )
    .controller( 'DiagramContainerController', [
        '$scope',
        'PanZoomService',
        function ( $scope, PanZoomService ) {

            var compiledDirectives;

            compiledDirectives = {};

            $scope.diagram.state = $scope.diagram.state || {};
            $scope.diagram.state.selectedComponentIds = $scope.diagram.state.selectedComponentIds || [];

            $scope.diagram.config = $scope.diagram.config || {};

            $scope.panzoomId = 'panzoomId'; //scope.id + '-panzoomed';

            $scope.zoomLevel = 4;

            $scope.panzoomModel = {}; // always pass empty object

            $scope.panzoomConfig = {
                zoomLevels: 10,
                neutralZoomLevel: $scope.zoomLevel,
                scalePerZoomLevel: 1.25,
                friction: 50,
                haltSpeed: 50,

                modelChangedCallback: function ( val ) {
                    PanZoomService.getAPI( $scope.panzoomId )
                        .then( function ( api ) {

                            var topLeftCorner, bottomRightCorner;

                            $scope.zoomLevel = val.zoomLevel;

                            topLeftCorner = api.getModelPosition( {
                                x: 0,
                                y: 0
                            } );

                            bottomRightCorner = api.getModelPosition( {
                                x: $scope.canvasWidth,
                                y: $scope.canvasHeight
                            } );

                            $scope.visibleArea = {
                                top: topLeftCorner.y,
                                left: topLeftCorner.x,
                                right: bottomRightCorner.x,
                                bottom: bottomRightCorner.y
                            };

                        } );

                }
            };

            $scope.getCssClass = function () {
                return 'zoom-level-' + $scope.zoomLevel;
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

            this.getCompiledDirective = function ( directive ) {
                return compiledDirectives[ directive ];
            };

            this.setCompiledDirective = function ( directive, compiledDirective ) {
                compiledDirectives[ directive ] = compiledDirective;
            };

            this.isEditable = function () {

                $scope.diagram.config = $scope.diagram.config || {};

                return $scope.diagram.config.editable === true;
            };

            this.isComponentSelected = function ( component ) {
                return $scope.diagram.state.selectedComponentIds.indexOf( component.id ) > -1;
            };

        }
    ] )
    .directive( 'diagramContainer', [
        'diagramService', '$log', 'PanZoomService',
        function ( diagramService, $log ) {

            return {
                controller: 'DiagramContainerController',
                scope: {
                    id: '@',
                    diagram: '='
                },
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/diagramContainer.html',
                link: function ( scope, element ) {

                    scope.canvasWidth = $( element )
                        .outerWidth();
                    scope.canvasHeight = $( element )
                        .outerHeight();


                    scope.visibleArea = {
                        top: 0,
                        left: 0,
                        right: scope.canvasWidth,
                        bottom: scope.canvasHeight
                    };

                    $log.debug( 'In canvas container', scope.visibleArea );


                }

            };
        }
    ] );
},{"../drawingCanvas/drawingCanvas.js":7}],7:[function(require,module,exports){
/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.drawingCanvas', [] )
    .directive( 'drawingCanvas',
        function () {

            return {

                scope: {
                    id: '@'
                },
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/drawingCanvas.html'

            };
        } );
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
/*globals angular*/

'use strict';

// Move this to GME eventually

require( '../componentWire/componentWire.js' );

angular.module( 'mms.designVisualization.svgDiagram', [
    'mms.designVisualization.gridService',
    'mms.designVisualization.componentWire'
] )
    .controller( 'SVGDiagramController', function ( $scope, $log, diagramService, wiringService, gridService ) {

        var possibbleDragTargetsDescriptor,
            startDrag,
            finishDrag,

            possibleWireStart,
            startWire,
            finishWire,
            cancelWire,

            moveComponentElementToFront,

            getOffsetToMouse,

            Wire = require( '../../services/diagramService/classes/Wire.js' ),

            addCornerToNewWireLine,

            componentElements;


        getOffsetToMouse = function ( $event ) {

            var offset;

            offset = {
                x: $event.pageX - $scope.elementOffset.left,
                y: $event.pageY - $scope.elementOffset.top
            };

            return offset;

        };

        startDrag = function () {

            $scope.dragTargetsDescriptor = possibbleDragTargetsDescriptor;
            possibbleDragTargetsDescriptor = null;

            $log.debug( 'Dragging', $scope.dragTargetsDescriptor );

        };

        startWire = function () {

            $scope.wireStart = possibleWireStart;
            possibleWireStart = null;

            $log.debug( 'Starting wire', $scope.wireStart );

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
                    component: $scope.wireStart.component,
                    port: $scope.wireStart.port
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

            console.log( wire.segments );


            diagramService.addWire( wire );

            $scope.diagram.wires[ wire.id ] = wire;

            gridService.invalidateVisibleDiagramComponents( $scope.id );

            $log.debug( 'Finish wire', wire );

            $scope.wireStart = null;
            $scope.newWireLine = null;

        };

        cancelWire = function () {
            $scope.wireStart = null;
        };

        finishDrag = function () {

            $scope.dragTargetsDescriptor = null;

            $log.debug( 'Finish dragging' );

        };

        $scope.onMouseUp = function () {
            //      if ($scope.dragTargetsDescriptor) {
            //        //finishDrag();
            //      }
        };


        $scope.onClick = function ( $event ) {

            if ( $scope.wireStart ) {

                $event.stopPropagation();

                addCornerToNewWireLine();

            } else {
                $scope.diagram.state.selectedComponentIds = [];
            }

        };

        $scope.onMouseMove = function ( $event ) {

            var offset;

            // Dragging

            if ( possibbleDragTargetsDescriptor ) {
                startDrag();
            }

            if ( $scope.dragTargetsDescriptor ) {

                angular.forEach( $scope.dragTargetsDescriptor.targets, function ( target ) {

                    //console.log($event.offsetY, target.deltaToCursor.y);

                    offset = getOffsetToMouse( $event );

                    target.component.setPosition(
                        offset.x + target.deltaToCursor.x,
                        offset.y + target.deltaToCursor.y
                    );

                } );

                angular.forEach( $scope.dragTargetsDescriptor.affectedWires, function ( wire ) {

                    wiringService.adjustWireEndSegments( wire );

                } );

            }

            // Wire drawing

            if ( possibleWireStart ) {
                startWire();
            }

            if ( $scope.wireStart ) {

                $scope.newWireLine = $scope.newWireLine || {};
                $scope.newWireLine.lockedSegments = $scope.newWireLine.lockedSegments || [];
                $scope.newWireLine.activeSegmentStartPosition =
                    $scope.newWireLine.activeSegmentStartPosition || $scope.wireStart.port.getGridPosition();

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

        $scope.getCssClass = function () {

            var result = '';

            if ( $scope.dragTargetsDescriptor ) {
                result += 'dragging';
            }

            return result;

        };

        $scope.contextMenuData = [ {
            id: 'context-menu-common',
            items: [ {
                id: 'newComponent',
                label: 'New component ...',
                iconClass: 'glyphicon glyphicon-plus',
                action: function () {
                    console.log( 'New component clicked' );
                },
                actionData: {}
            } ]
        } ];

        moveComponentElementToFront = function ( componentId ) {

            var z,
                component,
                needsTobeReordered;

            needsTobeReordered = false;

            z = diagramService.getHighestZ();
            component = $scope.diagram.components[ componentId ];

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

        // Interactions with components

        this.toggleComponentSelected = function ( component, $event ) {

            var index;

            if ( angular.isObject( component ) && !this.disallowSelection() && component.nonSelectable !== true ) {

                index = $scope.diagram.state.selectedComponentIds.indexOf( component.id );

                if ( index > -1 ) {

                    $scope.diagram.state.selectedComponentIds.splice( index, 1 );

                } else {

                    if ( $scope.diagram.state.selectedComponentIds.length > 0 &&
                        $scope.diagram.config.multiSelect !== true &&
                        $event.shiftKey !== true ) {

                        angular.forEach( $scope.diagram.state.selectedComponentIds, function ( componentId ) {
                            $scope.diagram.components[ componentId ].selected = false;
                        } );
                        $scope.diagram.state.selectedComponentIds = [];
                    }

                    $scope.diagram.state.selectedComponentIds.push( component.id );

                    moveComponentElementToFront( component.id );

                }

            }

        };

        this.onComponentClick = function ( component, $event ) {

            possibbleDragTargetsDescriptor = null;

            if ( $scope.dragTargetsDescriptor ) {
                finishDrag();
                $event.stopPropagation();
            } else {
                this.toggleComponentSelected( component, $event );
                $event.stopPropagation();
            }

        };

        this.onPortMouseDown = function ( component, port, $event ) {

            if ( !$scope.wireStart ) {
                possibleWireStart = {
                    component: component,
                    port: port
                };
            }

            $event.stopPropagation();

        };

        this.onPortMouseUp = function ( component, port, $event ) {

            $event.stopPropagation();

        };

        this.onPortClick = function ( component, port, $event ) {

            if ( possibbleDragTargetsDescriptor ) {
                possibbleDragTargetsDescriptor = null;
            }

            if ( $scope.wireStart ) {

                $event.stopPropagation();

                if ( $scope.wireStart.port !== port ) {
                    finishWire( component, port );
                } else {
                    cancelWire();
                }

            }

        };

        this.onComponentMouseDown = function ( component, $event ) {

            var componentsToDrag,
                getDragDescriptor,
                wires;

            if ( $event.which === 3 ) {

                component.rotate( 90 );

                wires = diagramService.getWiresForComponents( component );

                console.log( component );

                angular.forEach( wires, function ( wire ) {
                    wiringService.adjustWireEndSegments( wire );
                } );


                $event.preventDefault();

            } else {

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

                if ( this.isEditable() &&
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

                                selectedComponent = $scope.diagram.components[ selectedComponentId ];

                                possibbleDragTargetsDescriptor.targets.push( getDragDescriptor(
                                    selectedComponent ) );

                                componentsToDrag.push( selectedComponent );

                            }

                        } );
                    }

                    possibbleDragTargetsDescriptor.affectedWires = diagramService.getWiresForComponents(
                        componentsToDrag );

                }
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

        this.registerComponentElement = function ( id, el ) {

            componentElements = componentElements || {};

            componentElements[ id ] = el;

        };

        this.unregisterComponentElement = function ( id ) {

            componentElements = componentElements || {};

            delete componentElements[ id ];

        };

    } )
    .directive( 'svgDiagram', [
        '$log',
        'diagramService',
        'gridService',
        function ( $log, diagramService, gridService ) {

            return {
                controller: 'SVGDiagramController',
                require: '^diagramContainer',
                restrict: 'E',
                scope: false,
                replace: true,
                templateUrl: '/mmsApp/templates/svgDiagram.html',
                link: function ( scope, element, attributes, diagramContainerController ) {

                    var id;

                    id = diagramContainerController.getId();

                    scope.diagram = scope.diagram || {};
                    scope.$element = element;

                    scope.id = id;

                    scope.visibleObjects = gridService.createGrid( id, {
                            width: 10000,
                            height: 1000
                        },
                        scope.diagram
                    );

                    scope.$watch(
                        function () {
                            return diagramContainerController.getVisibleArea();
                        }, function ( visibleArea ) {
                            scope.elementOffset = scope.$element.offset();
                            gridService.setVisibleArea( id, visibleArea );
                        } );

                }

            };
        }
    ] );
},{"../../services/diagramService/classes/Wire.js":21,"../componentWire/componentWire.js":4}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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

                scope.onClick = function ( $event ) {
                    svgDiagramController.onComponentClick( scope.component, $event );
                };

                scope.onMouseDown = function ( $event ) {
                    svgDiagramController.onComponentMouseDown( scope.component, $event );
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
},{"../../services/symbolServices/symbolServices.js":24,"../port/port.js":9,"./box/box.js":11,"./capacitor/capacitor.js":12,"./diode/diode.js":14,"./inductor/inductor.js":15,"./jFetP/jFetP.js":16,"./opAmp/opAmp.js":17,"./resistor/resistor.js":18}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
                    x: 46,
                    y: 0
                }, {
                    id: 'd',
                    wireAngle: 90,
                    wireLeadIn: 20,
                    label: 'D',
                    x: 46,
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
},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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
},{"glMatrix":3}],20:[function(require,module,exports){
/*globals angular*/

'use strict';

var glMatrix = require( 'glMatrix' );

var DiagramComponent = function ( descriptor ) {

    if ( !angular.isObject( descriptor.symbol ) ) {
        throw new Error( 'No symbol found for component ' + this.id );
    }

    angular.extend( this, descriptor );

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
        glMatrix.vec2.set( translation, this.x, this.y );

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

        //    sinA = Math.sin(rotationRad);
        //    cosA = Math.cos(rotationRad);
        //
        //    this.transformationMatrix = [
        //      this.scaleX * cosA,
        //      sinA,
        //      -sinA,
        //      this.scaleY * cosA,
        //      this.x,
        //      this.y
        //    ];

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
},{"glMatrix":3}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
/*globals angular */

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.diagramService', [
    'mms.designVisualization.symbolServices'
] )
    .config( [ 'symbolManagerProvider',
        function ( symbolManagerProvider ) {

            var randomSymbolGenerator,
                kinds = 7;

            randomSymbolGenerator = function ( count ) {

                var i,
                    portCount,
                    symbol,
                    makeARandomSymbol,
                    makeSomePorts,
                    minPorts = 6,
                    maxPorts = 30,
                    portWireLength = 20,

                    spreadPortsAlongSide;

                spreadPortsAlongSide = function ( somePorts, side, width, height ) {
                    var offset = 2 * portWireLength;

                    angular.forEach( somePorts, function ( aPort ) {

                        switch ( side ) {

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

                    } );

                };


                makeSomePorts = function ( countOfPorts ) {

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

                    for ( i = 0; i < countOfPorts; i++ ) {

                        port = {
                            id: 'p_' + i,
                            label: 'Port-' + i,
                            wireLeadIn: 20
                        };

                        placement = Math.round( Math.random() * 3 );

                        sides[ placement ].push( port );
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

                    spreadPortsAlongSide( top, 'top', width, height );
                    spreadPortsAlongSide( right, 'right', width, height );
                    spreadPortsAlongSide( bottom, 'bottom', width, height );
                    spreadPortsAlongSide( left, 'left', width, height );


                    ports = ports.concat( top )
                        .concat( right )
                        .concat( bottom )
                        .concat( left );

                    return {
                        ports: ports,
                        width: width,
                        height: height
                    };

                };

                makeARandomSymbol = function ( idPostfix, countOfPorts ) {

                    var portsAndSizes = makeSomePorts( countOfPorts );

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

                for ( i = 0; i < count; i++ ) {

                    portCount = Math.max(
                        Math.floor( Math.random() * maxPorts ),
                        minPorts
                    );

                    symbol = makeARandomSymbol( i, portCount );

                    symbolManagerProvider.registerSymbol( symbol );

                }

            };

            randomSymbolGenerator( kinds );

        }
    ] )
    .service( 'diagramService', [
        '$q',
        '$timeout',
        'symbolManager',
        'wiringService',
        function ( $q, $timeout, symbolManager, wiringService ) {

            var
            self = this,
                components = [],
                componentsById = {},

                wires = [],
                wiresById = {},
                wiresByComponentId = {},

                symbolTypes,

                registerWireForEnds,

                DiagramComponent = require( './classes/DiagramComponent.js' ),
                ComponentPort = require( './classes/ComponentPort' ),
                Wire = require( './classes/Wire.js' );

            symbolTypes = symbolManager.getAvailableSymbols();

            this.generateDummyDiagram = function ( countOfBoxes, countOfWires, canvasWidth, canvasHeight ) {

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

                portCreator = function ( componentId, ports ) {

                    var portInstance,
                        portInstances,
                        portMapping;

                    portInstances = [];
                    portMapping = {};

                    angular.forEach( ports, function ( port ) {

                        portInstance = new ComponentPort( {
                            id: componentId + '_' + port.id,
                            portSymbol: port
                        } );

                        portInstances.push( portInstance );

                        portMapping[ port.id ] = portInstance.id;
                    } );

                    return {
                        portInstances: portInstances,
                        portMapping: portMapping
                    };

                };

                symbolTypeIds = Object.keys( symbolTypes );

                countOfTypes = symbolTypeIds.length;

                components = [];
                componentsById = {};

                for ( i = 0; i < countOfBoxes; i++ ) {

                    typeId = symbolTypeIds[ Math.floor( Math.random() * countOfTypes ) ];
                    type = symbolTypes[ typeId ];

                    x = Math.round( Math.random() * ( canvasWidth - 1 ) );
                    y = Math.round( Math.random() * ( canvasHeight - 1 ) );

                    id = 'component_' + typeId + '_' + i;

                    symbol = symbolManager.getSymbol( typeId );

                    createdPorts = portCreator( id, symbol.ports );

                    newDiagramComponent = new DiagramComponent( {
                        id: id,
                        label: type.labelPrefix + i,
                        x: x,
                        y: y,
                        z: i,
                        rotation: Math.floor( Math.random() * 40 ) * 90,
                        scaleX: 1, //[1, -1][Math.round(Math.random())],
                        scaleY: 1, //[1, -1][Math.round(Math.random())],
                        symbol: symbol,
                        nonSelectable: false,
                        locationLocked: false,
                        draggable: true

                        //          symbolConfig: {
                        //            x: 'x',
                        //            y: 'y',
                        //            label: 'label',
                        //            rotation: 'rotation',
                        //            scaleX: 'scaleX',
                        //            scaleY: 'scaleY',
                        //            ports: 'portInstances',
                        //            portMapping: createdPorts.portMapping
                        //          }
                    } );

                    newDiagramComponent.registerPortInstances( createdPorts.portInstances );

                    newDiagramComponent.updateTransformationMatrix();

                    self.addComponent( newDiagramComponent );

                }

                wires = [];
                wiresById = {};

                for ( i = 0; i < countOfWires; i++ ) {

                    id = 'wire_' + i;

                    component1 = components.getRandomElement();

                    port1 = component1.portInstances.getRandomElement();
                    port2 = undefined;

                    while ( !angular.isDefined( port2 ) || port1 === port2 ) {

                        component2 = components.getRandomElement();
                        port2 = component2.portInstances.getRandomElement();
                    }

                    wire = new Wire( {
                        id: id,
                        end1: {
                            component: component1,
                            port: port1
                        },
                        end2: {
                            component: component2,
                            port: port2
                        }
                    } );

                    wiringService.routeWire( wire, 'ElbowRouter' );

                    self.addWire( wire );

                }

            };

            this.addComponent = function ( aDiagramComponent ) {

                if ( angular.isObject( aDiagramComponent ) && !angular.isDefined( componentsById[ aDiagramComponent
                    .id ] ) ) {

                    componentsById[ aDiagramComponent.id ] = aDiagramComponent;
                    components.push( aDiagramComponent );

                }

            };

            registerWireForEnds = function ( wire ) {

                var componentId;

                componentId = wire.end1.component.id;

                wiresByComponentId[ componentId ] = wiresByComponentId[ componentId ] || [];

                if ( wiresByComponentId[ componentId ].indexOf( wire ) === -1 ) {
                    wiresByComponentId[ componentId ].push( wire );
                }

                componentId = wire.end2.component.id;

                wiresByComponentId[ componentId ] = wiresByComponentId[ componentId ] || [];

                if ( wiresByComponentId[ componentId ].indexOf( wire ) === -1 ) {
                    wiresByComponentId[ componentId ].push( wire );
                }

            };

            this.addWire = function ( aWire ) {

                if ( angular.isObject( aWire ) && !angular.isDefined( wiresById[ aWire.id ] ) ) {

                    wiresById[ aWire.id ] = aWire;
                    wires.push( aWire );

                    registerWireForEnds( aWire );

                }

            };

            this.getWiresForComponents = function ( components ) {

                var setOfWires = [];

                angular.forEach( components, function ( component ) {

                    angular.forEach( wiresByComponentId[ component.id ], function ( wire ) {

                        if ( setOfWires.indexOf( wire ) === -1 ) {
                            setOfWires.push( wire );
                        }
                    } );

                } );

                return setOfWires;

            };

            this.getDiagram = function () {

                return {
                    components: componentsById,
                    wires: wiresById,
                    config: {
                        editable: true,
                        disallowSelection: false
                    }
                };

            };

            this.getHighestZ = function () {

                var i,
                    component,
                    z;

                for ( i = 0; i < components.length; i++ ) {

                    component = components[ i ];

                    if ( !isNaN( component.z ) ) {

                        if ( isNaN( z ) ) {
                            z = component.z;
                        } else {

                            if ( z < component.z ) {
                                z = component.z;
                            }

                        }

                    }
                }

                if ( isNaN( z ) ) {
                    z = -1;
                }

                return z;

            };

            //this.generateDummyDiagram(2000, 500, 10000, 10000);
            //this.generateDummyDiagram(1000, 2000, 10000, 10000);
            this.generateDummyDiagram( 10, 2, 1200, 1200 );

        }
    ] );
},{"./classes/ComponentPort":19,"./classes/DiagramComponent.js":20,"./classes/Wire.js":21}],23:[function(require,module,exports){
/*globals angular*/

'use strict';

var gridServicesModule = angular.module(
    'mms.designVisualization.gridService', [] );

gridServicesModule.service( 'gridService', [ '$log', '$rootScope', '$timeout',
    function ( $log, $rootScope, $timeout ) {

        var self = this,

            grids = {},

            numberOfChangesAllowedInOneCycle = 2000,
            recalculateCycleDelay = 10,
            viewPortPadding = {
                x: -300,
                y: -200
            },

            recalculateVisibleDiagramComponents,
            recalculateVisibleWires;

        recalculateVisibleWires = function ( grid ) {

            var index;

            angular.forEach( grid.wires, function ( wire ) {

                index = grid.visibleWires.indexOf( wire );


                if ( wire.isInViewPort( grid.viewPort, viewPortPadding ) ) {

                    if ( index === -1 ) {
                        grid.visibleWires.push( wire );
                    }

                } else {

                    if ( index > -1 ) {
                        grid.visibleWires.splice( index, 1 );
                    }

                }

            } );

            $log.debug( 'Number of visible wires: ' + grid.visibleWires.length );

        };

        recalculateVisibleDiagramComponents = function ( grid ) {

            var i,
                component,
                countOfChanges = 0,
                changesLimitReached = false,
                index;

            grid.invisibleDiagramComponentsRecalculate = true;


            for ( i = 0; i < grid.components.length && !changesLimitReached; i++ ) {
                component = grid.components[ i ];
            }
            angular.forEach( grid.components, function ( component ) {

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

            } );

            self.reorderVisibleComponents( grid.id );

            recalculateVisibleWires( grid );

            $log.debug( 'Number of changes compared to previous diagram state:', countOfChanges );

            if ( !changesLimitReached ) {
                grid.invisibleDiagramComponentsRecalculate = false;
            } else {
                $timeout( function () {
                    recalculateVisibleDiagramComponents( grid );
                }, recalculateCycleDelay );
            }

        };

        this.invalidateVisibleDiagramComponents = function ( gridId ) {

            var grid;

            grid = grids[ gridId ];

            if ( angular.isDefined( grid ) ) {

                if ( !grid.invisibleDiagramComponentsRecalculate ) {
                    $timeout( function () {
                        recalculateVisibleDiagramComponents( grid );
                    } );
                }
            }

        };


        this.createGrid = function ( id, dimensions, diagram ) {

            var grid;

            if ( !angular.isDefined( grids[ id ] ) ) {
                grid = grids[ id ] = {
                    id: id,
                    dimensions: dimensions,
                    components: diagram.components,
                    visibleDiagramComponents: [],
                    wires: diagram.wires,
                    visibleWires: [],
                    viewPort: {},
                    invisibleDiagramComponentsRecalculate: false
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
},{}],24:[function(require,module,exports){
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

                this.getSymbolElementForType = function ( symbolType ) {

                    var result = availableSymbols[ symbolType ] && availableSymbols[ symbolType ].directive;

                    if ( !result ) {
                        result = 'resistor';
                    }

                    return result;
                };
            };

            return new SymbolManager();

        }
    ];
} );
},{}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
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
},{"./classes/ElbowRouter.js":25,"./classes/SimpleRouter.js":26}],28:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvbW1zQXBwL2FwcC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvQXJyYXkucHJvdG90eXBlLmZpbmQvaW5kZXguanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9ib3dlcl9jb21wb25lbnRzL2dsLW1hdHJpeC9kaXN0L2dsLW1hdHJpeC1taW4uanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2NvbXBvbmVudFdpcmUvY29tcG9uZW50V2lyZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvY29tcG9uZW50V2lyZS9jb21wb25lbnRXaXJlU2VnbWVudC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGlhZ3JhbUNvbnRhaW5lci9kaWFncmFtQ29udGFpbmVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9kcmF3aW5nQ2FudmFzL2RyYXdpbmdDYW52YXMuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2ZhYnJpY0NhbnZhcy9mYWJyaWNDYW52YXMuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3BvcnQvcG9ydC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ZnRGlhZ3JhbS9zdmdEaWFncmFtLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2JveC9ib3guanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvY2FwYWNpdG9yL2NhcGFjaXRvci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9jb21wb25lbnRTeW1ib2wuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvZGlvZGUvZGlvZGUuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvaW5kdWN0b3IvaW5kdWN0b3IuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvakZldFAvakZldFAuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvb3BBbXAvb3BBbXAuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvcmVzaXN0b3IvcmVzaXN0b3IuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL0NvbXBvbmVudFBvcnQuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL0RpYWdyYW1Db21wb25lbnQuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL1dpcmUuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9kaWFncmFtU2VydmljZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2dyaWRTZXJ2aWNlL2dyaWRTZXJ2aWNlLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvc3ltYm9sU2VydmljZXMvc3ltYm9sU2VydmljZXMuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy93aXJpbmdTZXJ2aWNlL2NsYXNzZXMvRWxib3dSb3V0ZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy93aXJpbmdTZXJ2aWNlL2NsYXNzZXMvU2ltcGxlUm91dGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvd2lyaW5nU2VydmljZS93aXJpbmdTZXJ2aWNlLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcbiAgICAndWkucm91dGVyJyxcblxuICAgICdnbWUuc2VydmljZXMnLFxuXG4gICAgJ2lzaXMudWkuY29tcG9uZW50cycsXG5cbiAgICAnY3lwaHkuY29tcG9uZW50cycsXG5cbiAgICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXG4gICAgJ2N5cGh5Lm1tc0FwcC50ZW1wbGF0ZXMnLFxuXG4gICAgJ3VpLmJvb3RzdHJhcCcsXG5cbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ud2lyaW5nU2VydmljZScsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRpYWdyYW1TZXJ2aWNlJyxcblxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kaWFncmFtQ29udGFpbmVyJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZmFicmljQ2FudmFzJyxcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ZnRGlhZ3JhbScsXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMnLFxuICAgICduZ01hdGVyaWFsJ1xuXSk7XG5cbnJlcXVpcmUoJy4vdXRpbHMuanMnKTtcblxucmVxdWlyZSgnLi9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9kaWFncmFtU2VydmljZS5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9ncmlkU2VydmljZS9ncmlkU2VydmljZS5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy93aXJpbmdTZXJ2aWNlL3dpcmluZ1NlcnZpY2UuanMnKTtcblxucmVxdWlyZSgnLi9kaXJlY3RpdmVzL2RpYWdyYW1Db250YWluZXIvZGlhZ3JhbUNvbnRhaW5lci5qcycpO1xucmVxdWlyZSgnLi9kaXJlY3RpdmVzL2ZhYnJpY0NhbnZhcy9mYWJyaWNDYW52YXMuanMnKTtcbnJlcXVpcmUoJy4vZGlyZWN0aXZlcy9zdmdEaWFncmFtL3N2Z0RpYWdyYW0uanMnKTtcblxucmVxdWlyZSgnLi9kaXJlY3RpdmVzL3N5bWJvbHMvY29tcG9uZW50U3ltYm9sLmpzJyk7XG5cbkN5UGh5QXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG4gICAgdmFyIHNlbGVjdFByb2plY3Q7XG5cbiAgICBzZWxlY3RQcm9qZWN0ID0ge1xuICAgICAgICBsb2FkOiBmdW5jdGlvbiAoJHEsICRzdGF0ZVBhcmFtcywgJHJvb3RTY29wZSwgJHN0YXRlLCAkbG9nLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSwgd29ya3NwYWNlU2VydmljZSkge1xuICAgICAgICAgICAgdmFyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIGRlZmVycmVkO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLm1haW5EYkNvbm5lY3Rpb25JZCA9ICdtbXMtbWFpbi1kYi1jb25uZWN0aW9uLWlkJztcblxuICAgICAgICAgICAgY29ubmVjdGlvbklkID0gJHJvb3RTY29wZS5tYWluRGJDb25uZWN0aW9uSWQ7XG4gICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGRhdGFTdG9yZVNlcnZpY2UuY29ubmVjdFRvRGF0YWJhc2UoY29ubmVjdGlvbklkLCB7XG4gICAgICAgICAgICAgICAgaG9zdDogd2luZG93LmxvY2F0aW9uLmJhc2VuYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoY29ubmVjdGlvbklkLCAkc3RhdGVQYXJhbXMucHJvamVjdElkKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChwcm9qZWN0SWQpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgd3NDb250ZXh0O1xuXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUucHJvamVjdElkID0gcHJvamVjdElkO1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICB3c0NvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYjogJHJvb3RTY29wZS5tYWluRGJDb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyXycgKyAoIG5ldyBEYXRlKCkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIC8vJHNjb3BlLiRvbiggJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKCBjb250ZXh0ICk7XG4gICAgICAgICAgICAgICAgICAgIC8vfSApO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5yZWdpc3RlcldhdGNoZXIod3NDb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnV29ya3NwYWNlTGlzdENvbnRyb2xsZXIgLSBpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaFdvcmtzcGFjZXMod3NDb250ZXh0LCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvYWQnLCB1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGUnLCB1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmxvYWQnLCB1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VJZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHdvcmtzcGFjZUlkIGluIGRhdGEud29ya3NwYWNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEud29ya3NwYWNlcy5oYXNPd25Qcm9wZXJ0eSh3b3Jrc3BhY2VJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShwcm9qZWN0SWQpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdPcGVuaW5nIHByb2plY3QgZXJyb3JlZDonLCAkc3RhdGVQYXJhbXMucHJvamVjdElkLCByZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCc0MDQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiAkc3RhdGVQYXJhbXMucHJvamVjdElkXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL25vUHJvamVjdCcpO1xuXG5cbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ3Byb2plY3QnLCB7XG4gICAgICAgICAgICB1cmw6ICcvcHJvamVjdC86cHJvamVjdElkJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZWRpdG9yLmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZTogc2VsZWN0UHJvamVjdCxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9qZWN0Vmlld0NvbnRyb2xsZXInXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnbm9Qcm9qZWN0Jywge1xuICAgICAgICAgICAgdXJsOiAnL25vUHJvamVjdCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL25vUHJvamVjdFNwZWNpZmllZC5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdOb1Byb2plY3RDb250cm9sbGVyJ1xuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJzQwNCcsIHtcbiAgICAgICAgICAgIHVybDogJy80MDQvOnByb2plY3RJZCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnTm9Qcm9qZWN0Q29udHJvbGxlcicsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzLzQwNC5odG1sJ1xuICAgICAgICB9KTtcbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdNYWluTmF2aWdhdG9yQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc2NvcGUsICR3aW5kb3cpIHtcblxuICAgIHZhciBkZWZhdWx0TmF2aWdhdG9ySXRlbXM7XG5cbiAgICBkZWZhdWx0TmF2aWdhdG9ySXRlbXMgPSBbe1xuICAgICAgICBpZDogJ3Jvb3QnLFxuICAgICAgICBsYWJlbDogJ01NUyBBcHAnLFxuICAgICAgICBpdGVtQ2xhc3M6ICdjeXBoeS1yb290J1xuICAgIH1dO1xuXG4gICAgJHNjb3BlLm5hdmlnYXRvciA9IHtcbiAgICAgICAgc2VwYXJhdG9yOiB0cnVlLFxuICAgICAgICBpdGVtczogYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pXG4gICAgfTtcblxuICAgICRyb290U2NvcGUuJHdhdGNoKCdwcm9qZWN0SWQnLCBmdW5jdGlvbiAocHJvamVjdElkKSB7XG5cbiAgICAgICAgaWYgKHByb2plY3RJZCkge1xuXG4gICAgICAgICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pO1xuICAgICAgICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogJ3Byb2plY3QnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBwcm9qZWN0SWQsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PScgKyBwcm9qZWN0SWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxufSk7XG5cbkN5UGh5QXBwLmNvbnRyb2xsZXIoJ1Byb2plY3RWaWV3Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsIGRpYWdyYW1TZXJ2aWNlLCAkbG9nKSB7XG5cbiAgICAkc2NvcGUuZGlhZ3JhbSA9IGRpYWdyYW1TZXJ2aWNlLmdldERpYWdyYW0oKTtcblxuXG4gICAgJGxvZy5kZWJ1ZygnRGlhZ3JhbTonLCAkc2NvcGUuZGlhZ3JhbSk7XG5cbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdOb1Byb2plY3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgJHN0YXRlUGFyYW1zLCAkaHR0cCwgJGxvZywgJHN0YXRlLCBncm93bCkge1xuXG4gICAgJHNjb3BlLnByb2plY3RJZCA9ICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWQ7XG4gICAgJHNjb3BlLmVycm9yZWQgPSBmYWxzZTtcblxuICAgICRzY29wZS5zdGFydE5ld1Byb2plY3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgJHJvb3RTY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcblxuICAgICAgICAkbG9nLmRlYnVnKCdOZXcgcHJvamVjdCBjcmVhdGlvbicpO1xuXG4gICAgICAgICRodHRwLmdldCgnL3Jlc3QvZXh0ZXJuYWwvY29weXByb2plY3Qvbm9yZWRpcmVjdCcpXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICBzdWNjZXNzKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdOZXcgcHJvamVjdCBjcmVhdGlvbiBzdWNjZXNzZnVsJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdwcm9qZWN0Jywge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6IGRhdGFcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgIGVycm9yKGZ1bmN0aW9uIChkYXRhLCBzdGF0dXMpIHtcblxuICAgICAgICAgICAgICAgICRsb2cuZGVidWcoJ05ldyBwcm9qZWN0IGNyZWF0aW9uIGZhaWxlZCcsIHN0YXR1cyk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ0FuIGVycm9yIG9jY3VyZWQgd2hpbGUgcHJvamVjdCBjcmVhdGlvbi4gUGxlYXNlIHJldHJ5IGxhdGVyLicpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pO1xuXG5cbi8vQ3lQaHlBcHAucnVuKGZ1bmN0aW9uICgkc3RhdGUsIGdyb3dsLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSkge1xuXG4vLyAgdmFyIGNvbm5lY3Rpb25JZCA9ICdtbXMtY29ubmVjdGlvbi1pZCc7XG4vL1xuLy8gIGRhdGFTdG9yZVNlcnZpY2UuY29ubmVjdFRvRGF0YWJhc2UoY29ubmVjdGlvbklkLCB7aG9zdDogd2luZG93LmxvY2F0aW9uLmJhc2VuYW1lfSlcbi8vICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbi8vICAgICAgLy8gc2VsZWN0IGRlZmF1bHQgcHJvamVjdCBhbmQgYnJhbmNoIChtYXN0ZXIpXG4vLyAgICAgIHJldHVybiBwcm9qZWN0U2VydmljZS5zZWxlY3RQcm9qZWN0KGNvbm5lY3Rpb25JZCwgJ0FETUVkaXRvcicpO1xuLy8gICAgfSlcbi8vICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4vLyAgICAgIGdyb3dsLmVycm9yKCdBRE1FZGl0b3IgZG9lcyBub3QgZXhpc3QuIENyZWF0ZSBhbmQgaW1wb3J0IGl0IHVzaW5nIHRoZSA8YSBocmVmPVwiJyArXG4vLyAgICAgICAgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArICdcIj4gd2ViZ21lIGludGVyZmFjZTwvYT4uJyk7XG4vLyAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbi8vICAgIH0pO1xuLy99KTtcbiIsIi8vIEFycmF5LnByb3RvdHlwZS5maW5kIC0gTUlUIExpY2Vuc2UgKGMpIDIwMTMgUGF1bCBNaWxsZXIgPGh0dHA6Ly9wYXVsbWlsbHIuY29tPlxuLy8gRm9yIGFsbCBkZXRhaWxzIGFuZCBkb2NzOiBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2FycmF5LnByb3RvdHlwZS5maW5kXG4vLyBGaXhlcyBhbmQgdGVzdHMgc3VwcGxpZWQgYnkgRHVuY2FuIEhhbGwgPGh0dHA6Ly9kdW5jYW5oYWxsLm5ldD4gXG4oZnVuY3Rpb24oZ2xvYmFscyl7XG4gIGlmIChBcnJheS5wcm90b3R5cGUuZmluZCkgcmV0dXJuO1xuXG4gIHZhciBmaW5kID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgdmFyIGxpc3QgPSBPYmplY3QodGhpcyk7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoIDwgMCA/IDAgOiBsaXN0Lmxlbmd0aCA+Pj4gMDsgLy8gRVMuVG9VaW50MzI7XG4gICAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJyB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJlZGljYXRlKSAhPT0gJ1tvYmplY3QgRnVuY3Rpb25dJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkjZmluZDogcHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICBmb3IgKHZhciBpID0gMCwgdmFsdWU7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9O1xuXG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHtcbiAgICB0cnkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgJ2ZpbmQnLCB7XG4gICAgICAgIHZhbHVlOiBmaW5kLCBjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuZmluZCkge1xuICAgIEFycmF5LnByb3RvdHlwZS5maW5kID0gZmluZDtcbiAgfVxufSkodGhpcyk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgZ2wtbWF0cml4IC0gSGlnaCBwZXJmb3JtYW5jZSBtYXRyaXggYW5kIHZlY3RvciBvcGVyYXRpb25zXG4gKiBAYXV0aG9yIEJyYW5kb24gSm9uZXNcbiAqIEBhdXRob3IgQ29saW4gTWFjS2VuemllIElWXG4gKiBAdmVyc2lvbiAyLjIuMVxuICovXG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cbihmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD17fTt0eXBlb2YgZXhwb3J0cz09XCJ1bmRlZmluZWRcIj90eXBlb2YgZGVmaW5lPT1cImZ1bmN0aW9uXCImJnR5cGVvZiBkZWZpbmUuYW1kPT1cIm9iamVjdFwiJiZkZWZpbmUuYW1kPyh0LmV4cG9ydHM9e30sZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIHQuZXhwb3J0c30pKTp0LmV4cG9ydHM9dHlwZW9mIHdpbmRvdyE9XCJ1bmRlZmluZWRcIj93aW5kb3c6ZTp0LmV4cG9ydHM9ZXhwb3J0cyxmdW5jdGlvbihlKXtpZighdCl2YXIgdD0xZS02O2lmKCFuKXZhciBuPXR5cGVvZiBGbG9hdDMyQXJyYXkhPVwidW5kZWZpbmVkXCI/RmxvYXQzMkFycmF5OkFycmF5O2lmKCFyKXZhciByPU1hdGgucmFuZG9tO3ZhciBpPXt9O2kuc2V0TWF0cml4QXJyYXlUeXBlPWZ1bmN0aW9uKGUpe249ZX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLmdsTWF0cml4PWkpO3ZhciBzPU1hdGguUEkvMTgwO2kudG9SYWRpYW49ZnVuY3Rpb24oZSl7cmV0dXJuIGUqc307dmFyIG89e307by5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigyKTtyZXR1cm4gZVswXT0wLGVbMV09MCxlfSxvLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDIpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHR9LG8uZnJvbVZhbHVlcz1mdW5jdGlvbihlLHQpe3ZhciByPW5ldyBuKDIpO3JldHVybiByWzBdPWUsclsxXT10LHJ9LG8uY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGV9LG8uc2V0PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10LGVbMV09bixlfSxvLmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGV9LG8uc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlfSxvLnN1Yj1vLnN1YnRyYWN0LG8ubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlfSxvLm11bD1vLm11bHRpcGx5LG8uZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZX0sby5kaXY9by5kaXZpZGUsby5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGV9LG8ubWF4PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1heCh0WzBdLG5bMF0pLGVbMV09TWF0aC5tYXgodFsxXSxuWzFdKSxlfSxvLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm4sZVsxXT10WzFdKm4sZX0sby5zY2FsZUFuZEFkZD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10WzBdK25bMF0qcixlWzFdPXRbMV0rblsxXSpyLGV9LG8uZGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV07cmV0dXJuIE1hdGguc3FydChuKm4rcipyKX0sby5kaXN0PW8uZGlzdGFuY2Usby5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV07cmV0dXJuIG4qbityKnJ9LG8uc3FyRGlzdD1vLnNxdWFyZWREaXN0YW5jZSxvLmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXTtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtuKm4pfSxvLmxlbj1vLmxlbmd0aCxvLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV07cmV0dXJuIHQqdCtuKm59LG8uc3FyTGVuPW8uc3F1YXJlZExlbmd0aCxvLm5lZ2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZX0sby5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPW4qbityKnI7cmV0dXJuIGk+MCYmKGk9MS9NYXRoLnNxcnQoaSksZVswXT10WzBdKmksZVsxXT10WzFdKmkpLGV9LG8uZG90PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0qdFswXStlWzFdKnRbMV19LG8uY3Jvc3M9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0qblsxXS10WzFdKm5bMF07cmV0dXJuIGVbMF09ZVsxXT0wLGVbMl09cixlfSxvLmxlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV07cmV0dXJuIGVbMF09aStyKihuWzBdLWkpLGVbMV09cytyKihuWzFdLXMpLGV9LG8ucmFuZG9tPWZ1bmN0aW9uKGUsdCl7dD10fHwxO3ZhciBuPXIoKSoyKk1hdGguUEk7cmV0dXJuIGVbMF09TWF0aC5jb3MobikqdCxlWzFdPU1hdGguc2luKG4pKnQsZX0sby50cmFuc2Zvcm1NYXQyPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblsyXSppLGVbMV09blsxXSpyK25bM10qaSxlfSxvLnRyYW5zZm9ybU1hdDJkPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblsyXSppK25bNF0sZVsxXT1uWzFdKnIrblszXSppK25bNV0sZX0sby50cmFuc2Zvcm1NYXQzPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblszXSppK25bNl0sZVsxXT1uWzFdKnIrbls0XSppK25bN10sZX0sby50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bMTJdLGVbMV09blsxXSpyK25bNV0qaStuWzEzXSxlfSxvLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT1vLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj0yKSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdO3JldHVybiB0fX0oKSxvLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzIoXCIrZVswXStcIiwgXCIrZVsxXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzI9byk7dmFyIHU9e307dS5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigzKTtyZXR1cm4gZVswXT0wLGVbMV09MCxlWzJdPTAsZX0sdS5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbigzKTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdH0sdS5mcm9tVmFsdWVzPWZ1bmN0aW9uKGUsdCxyKXt2YXIgaT1uZXcgbigzKTtyZXR1cm4gaVswXT1lLGlbMV09dCxpWzJdPXIsaX0sdS5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGV9LHUuc2V0PWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXQsZVsxXT1uLGVbMl09cixlfSx1LmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGVbMl09dFsyXStuWzJdLGV9LHUuc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlWzJdPXRbMl0tblsyXSxlfSx1LnN1Yj11LnN1YnRyYWN0LHUubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlWzJdPXRbMl0qblsyXSxlfSx1Lm11bD11Lm11bHRpcGx5LHUuZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZVsyXT10WzJdL25bMl0sZX0sdS5kaXY9dS5kaXZpZGUsdS5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGVbMl09TWF0aC5taW4odFsyXSxuWzJdKSxlfSx1Lm1heD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5tYXgodFswXSxuWzBdKSxlWzFdPU1hdGgubWF4KHRbMV0sblsxXSksZVsyXT1NYXRoLm1heCh0WzJdLG5bMl0pLGV9LHUuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qbixlWzFdPXRbMV0qbixlWzJdPXRbMl0qbixlfSx1LnNjYWxlQW5kQWRkPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXRbMF0rblswXSpyLGVbMV09dFsxXStuWzFdKnIsZVsyXT10WzJdK25bMl0qcixlfSx1LmRpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdO3JldHVybiBNYXRoLnNxcnQobipuK3IqcitpKmkpfSx1LmRpc3Q9dS5kaXN0YW5jZSx1LnNxdWFyZWREaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXSxpPXRbMl0tZVsyXTtyZXR1cm4gbipuK3IqcitpKml9LHUuc3FyRGlzdD11LnNxdWFyZWREaXN0YW5jZSx1Lmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl07cmV0dXJuIE1hdGguc3FydCh0KnQrbipuK3Iqcil9LHUubGVuPXUubGVuZ3RoLHUuc3F1YXJlZExlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl07cmV0dXJuIHQqdCtuKm4rcipyfSx1LnNxckxlbj11LnNxdWFyZWRMZW5ndGgsdS5uZWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZX0sdS5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz1uKm4rcipyK2kqaTtyZXR1cm4gcz4wJiYocz0xL01hdGguc3FydChzKSxlWzBdPXRbMF0qcyxlWzFdPXRbMV0qcyxlWzJdPXRbMl0qcyksZX0sdS5kb3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXSp0WzBdK2VbMV0qdFsxXStlWzJdKnRbMl19LHUuY3Jvc3M9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPW5bMF0sdT1uWzFdLGE9blsyXTtyZXR1cm4gZVswXT1pKmEtcyp1LGVbMV09cypvLXIqYSxlWzJdPXIqdS1pKm8sZX0sdS5sZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXTtyZXR1cm4gZVswXT1pK3IqKG5bMF0taSksZVsxXT1zK3IqKG5bMV0tcyksZVsyXT1vK3IqKG5bMl0tbyksZX0sdS5yYW5kb209ZnVuY3Rpb24oZSx0KXt0PXR8fDE7dmFyIG49cigpKjIqTWF0aC5QSSxpPXIoKSoyLTEscz1NYXRoLnNxcnQoMS1pKmkpKnQ7cmV0dXJuIGVbMF09TWF0aC5jb3MobikqcyxlWzFdPU1hdGguc2luKG4pKnMsZVsyXT1pKnQsZX0sdS50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl07cmV0dXJuIGVbMF09blswXSpyK25bNF0qaStuWzhdKnMrblsxMl0sZVsxXT1uWzFdKnIrbls1XSppK25bOV0qcytuWzEzXSxlWzJdPW5bMl0qcituWzZdKmkrblsxMF0qcytuWzE0XSxlfSx1LnRyYW5zZm9ybU1hdDM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXTtyZXR1cm4gZVswXT1yKm5bMF0raSpuWzNdK3Mqbls2XSxlWzFdPXIqblsxXStpKm5bNF0rcypuWzddLGVbMl09cipuWzJdK2kqbls1XStzKm5bOF0sZX0sdS50cmFuc2Zvcm1RdWF0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz1uWzBdLHU9blsxXSxhPW5bMl0sZj1uWzNdLGw9ZipyK3Uqcy1hKmksYz1mKmkrYSpyLW8qcyxoPWYqcytvKmktdSpyLHA9LW8qci11KmktYSpzO3JldHVybiBlWzBdPWwqZitwKi1vK2MqLWEtaCotdSxlWzFdPWMqZitwKi11K2gqLW8tbCotYSxlWzJdPWgqZitwKi1hK2wqLXUtYyotbyxlfSx1LnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9W10scz1bXTtyZXR1cm4gaVswXT10WzBdLW5bMF0saVsxXT10WzFdLW5bMV0saVsyXT10WzJdLW5bMl0sc1swXT1pWzBdLHNbMV09aVsxXSpNYXRoLmNvcyhyKS1pWzJdKk1hdGguc2luKHIpLHNbMl09aVsxXSpNYXRoLnNpbihyKStpWzJdKk1hdGguY29zKHIpLGVbMF09c1swXStuWzBdLGVbMV09c1sxXStuWzFdLGVbMl09c1syXStuWzJdLGV9LHUucm90YXRlWT1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT1bXSxzPVtdO3JldHVybiBpWzBdPXRbMF0tblswXSxpWzFdPXRbMV0tblsxXSxpWzJdPXRbMl0tblsyXSxzWzBdPWlbMl0qTWF0aC5zaW4ocikraVswXSpNYXRoLmNvcyhyKSxzWzFdPWlbMV0sc1syXT1pWzJdKk1hdGguY29zKHIpLWlbMF0qTWF0aC5zaW4ociksZVswXT1zWzBdK25bMF0sZVsxXT1zWzFdK25bMV0sZVsyXT1zWzJdK25bMl0sZX0sdS5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPVtdLHM9W107cmV0dXJuIGlbMF09dFswXS1uWzBdLGlbMV09dFsxXS1uWzFdLGlbMl09dFsyXS1uWzJdLHNbMF09aVswXSpNYXRoLmNvcyhyKS1pWzFdKk1hdGguc2luKHIpLHNbMV09aVswXSpNYXRoLnNpbihyKStpWzFdKk1hdGguY29zKHIpLHNbMl09aVsyXSxlWzBdPXNbMF0rblswXSxlWzFdPXNbMV0rblsxXSxlWzJdPXNbMl0rblsyXSxlfSx1LmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT11LmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj0zKSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0sZVsyXT10W3UrMl0scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdLHRbdSsyXT1lWzJdO3JldHVybiB0fX0oKSx1LnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzMoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzM9dSk7dmFyIGE9e307YS5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig0KTtyZXR1cm4gZVswXT0wLGVbMV09MCxlWzJdPTAsZVszXT0wLGV9LGEuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNCk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0fSxhLmZyb21WYWx1ZXM9ZnVuY3Rpb24oZSx0LHIsaSl7dmFyIHM9bmV3IG4oNCk7cmV0dXJuIHNbMF09ZSxzWzFdPXQsc1syXT1yLHNbM109aSxzfSxhLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGV9LGEuc2V0PWZ1bmN0aW9uKGUsdCxuLHIsaSl7cmV0dXJuIGVbMF09dCxlWzFdPW4sZVsyXT1yLGVbM109aSxlfSxhLmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGVbMl09dFsyXStuWzJdLGVbM109dFszXStuWzNdLGV9LGEuc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlWzJdPXRbMl0tblsyXSxlWzNdPXRbM10tblszXSxlfSxhLnN1Yj1hLnN1YnRyYWN0LGEubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlWzJdPXRbMl0qblsyXSxlWzNdPXRbM10qblszXSxlfSxhLm11bD1hLm11bHRpcGx5LGEuZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZVsyXT10WzJdL25bMl0sZVszXT10WzNdL25bM10sZX0sYS5kaXY9YS5kaXZpZGUsYS5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGVbMl09TWF0aC5taW4odFsyXSxuWzJdKSxlWzNdPU1hdGgubWluKHRbM10sblszXSksZX0sYS5tYXg9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWF4KHRbMF0sblswXSksZVsxXT1NYXRoLm1heCh0WzFdLG5bMV0pLGVbMl09TWF0aC5tYXgodFsyXSxuWzJdKSxlWzNdPU1hdGgubWF4KHRbM10sblszXSksZX0sYS5zY2FsZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuLGVbMV09dFsxXSpuLGVbMl09dFsyXSpuLGVbM109dFszXSpuLGV9LGEuc2NhbGVBbmRBZGQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dFswXStuWzBdKnIsZVsxXT10WzFdK25bMV0qcixlWzJdPXRbMl0rblsyXSpyLGVbM109dFszXStuWzNdKnIsZX0sYS5kaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXSxpPXRbMl0tZVsyXSxzPXRbM10tZVszXTtyZXR1cm4gTWF0aC5zcXJ0KG4qbityKnIraSppK3Mqcyl9LGEuZGlzdD1hLmRpc3RhbmNlLGEuc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdLHM9dFszXS1lWzNdO3JldHVybiBuKm4rcipyK2kqaStzKnN9LGEuc3FyRGlzdD1hLnNxdWFyZWREaXN0YW5jZSxhLmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl0saT1lWzNdO3JldHVybiBNYXRoLnNxcnQodCp0K24qbityKnIraSppKX0sYS5sZW49YS5sZW5ndGgsYS5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM107cmV0dXJuIHQqdCtuKm4rcipyK2kqaX0sYS5zcXJMZW49YS5zcXVhcmVkTGVuZ3RoLGEubmVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGVbM109LXRbM10sZX0sYS5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bipuK3IqcitpKmkrcypzO3JldHVybiBvPjAmJihvPTEvTWF0aC5zcXJ0KG8pLGVbMF09dFswXSpvLGVbMV09dFsxXSpvLGVbMl09dFsyXSpvLGVbM109dFszXSpvKSxlfSxhLmRvdD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdKnRbMF0rZVsxXSp0WzFdK2VbMl0qdFsyXStlWzNdKnRbM119LGEubGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXSxvPXRbMl0sdT10WzNdO3JldHVybiBlWzBdPWkrciooblswXS1pKSxlWzFdPXMrciooblsxXS1zKSxlWzJdPW8rciooblsyXS1vKSxlWzNdPXUrciooblszXS11KSxlfSxhLnJhbmRvbT1mdW5jdGlvbihlLHQpe3JldHVybiB0PXR8fDEsZVswXT1yKCksZVsxXT1yKCksZVsyXT1yKCksZVszXT1yKCksYS5ub3JtYWxpemUoZSxlKSxhLnNjYWxlKGUsZSx0KSxlfSxhLnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM107cmV0dXJuIGVbMF09blswXSpyK25bNF0qaStuWzhdKnMrblsxMl0qbyxlWzFdPW5bMV0qcituWzVdKmkrbls5XSpzK25bMTNdKm8sZVsyXT1uWzJdKnIrbls2XSppK25bMTBdKnMrblsxNF0qbyxlWzNdPW5bM10qcituWzddKmkrblsxMV0qcytuWzE1XSpvLGV9LGEudHJhbnNmb3JtUXVhdD1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89blswXSx1PW5bMV0sYT1uWzJdLGY9blszXSxsPWYqcit1KnMtYSppLGM9ZippK2Eqci1vKnMsaD1mKnMrbyppLXUqcixwPS1vKnItdSppLWEqcztyZXR1cm4gZVswXT1sKmYrcCotbytjKi1hLWgqLXUsZVsxXT1jKmYrcCotdStoKi1vLWwqLWEsZVsyXT1oKmYrcCotYStsKi11LWMqLW8sZX0sYS5mb3JFYWNoPWZ1bmN0aW9uKCl7dmFyIGU9YS5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24odCxuLHIsaSxzLG8pe3ZhciB1LGE7bnx8KG49NCkscnx8KHI9MCksaT9hPU1hdGgubWluKGkqbityLHQubGVuZ3RoKTphPXQubGVuZ3RoO2Zvcih1PXI7dTxhO3UrPW4pZVswXT10W3VdLGVbMV09dFt1KzFdLGVbMl09dFt1KzJdLGVbM109dFt1KzNdLHMoZSxlLG8pLHRbdV09ZVswXSx0W3UrMV09ZVsxXSx0W3UrMl09ZVsyXSx0W3UrM109ZVszXTtyZXR1cm4gdH19KCksYS5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJ2ZWM0KFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIpXCJ9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS52ZWM0PWEpO3ZhciBmPXt9O2YuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNCk7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxmLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDQpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdH0sZi5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlfSxmLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0sZi50cmFuc3Bvc2U9ZnVuY3Rpb24oZSx0KXtpZihlPT09dCl7dmFyIG49dFsxXTtlWzFdPXRbMl0sZVsyXT1ufWVsc2UgZVswXT10WzBdLGVbMV09dFsyXSxlWzJdPXRbMV0sZVszXT10WzNdO3JldHVybiBlfSxmLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKnMtaSpyO3JldHVybiBvPyhvPTEvbyxlWzBdPXMqbyxlWzFdPS1yKm8sZVsyXT0taSpvLGVbM109bipvLGUpOm51bGx9LGYuYWRqb2ludD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF07cmV0dXJuIGVbMF09dFszXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZVszXT1uLGV9LGYuZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF0qZVszXS1lWzJdKmVbMV19LGYubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXSxmPW5bMl0sbD1uWzNdO3JldHVybiBlWzBdPXIqdStzKmEsZVsxXT1pKnUrbyphLGVbMl09cipmK3MqbCxlWzNdPWkqZitvKmwsZX0sZi5tdWw9Zi5tdWx0aXBseSxmLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK3MqdSxlWzFdPWkqYStvKnUsZVsyXT1yKi11K3MqYSxlWzNdPWkqLXUrbyphLGV9LGYuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXTtyZXR1cm4gZVswXT1yKnUsZVsxXT1pKnUsZVsyXT1zKmEsZVszXT1vKmEsZX0sZi5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQyKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIpXCJ9LGYuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikpfSxmLkxEVT1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVsyXT1yWzJdL3JbMF0sblswXT1yWzBdLG5bMV09clsxXSxuWzNdPXJbM10tZVsyXSpuWzFdLFtlLHQsbl19LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQyPWYpO3ZhciBsPXt9O2wuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNik7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlWzRdPTAsZVs1XT0wLGV9LGwuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNik7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzRdPWVbNF0sdFs1XT1lWzVdLHR9LGwuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlfSxsLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTEsZVs0XT0wLGVbNV09MCxlfSxsLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPW4qcy1yKmk7cmV0dXJuIGE/KGE9MS9hLGVbMF09cyphLGVbMV09LXIqYSxlWzJdPS1pKmEsZVszXT1uKmEsZVs0XT0oaSp1LXMqbykqYSxlWzVdPShyKm8tbip1KSphLGUpOm51bGx9LGwuZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF0qZVszXS1lWzFdKmVbMl19LGwubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPW5bMF0sbD1uWzFdLGM9blsyXSxoPW5bM10scD1uWzRdLGQ9bls1XTtyZXR1cm4gZVswXT1yKmYrcypsLGVbMV09aSpmK28qbCxlWzJdPXIqYytzKmgsZVszXT1pKmMrbypoLGVbNF09cipwK3MqZCt1LGVbNV09aSpwK28qZCthLGV9LGwubXVsPWwubXVsdGlwbHksbC5yb3RhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPU1hdGguc2luKG4pLGw9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09cipsK3MqZixlWzFdPWkqbCtvKmYsZVsyXT1yKi1mK3MqbCxlWzNdPWkqLWYrbypsLGVbNF09dSxlWzVdPWEsZX0sbC5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV07cmV0dXJuIGVbMF09cipmLGVbMV09aSpmLGVbMl09cypsLGVbM109bypsLGVbNF09dSxlWzVdPWEsZX0sbC50cmFuc2xhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPW5bMF0sbD1uWzFdO3JldHVybiBlWzBdPXIsZVsxXT1pLGVbMl09cyxlWzNdPW8sZVs0XT1yKmYrcypsK3UsZVs1XT1pKmYrbypsK2EsZX0sbC5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQyZChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiLCBcIitlWzRdK1wiLCBcIitlWzVdK1wiKVwifSxsLmZyb2I9ZnVuY3Rpb24oZSl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhlWzBdLDIpK01hdGgucG93KGVbMV0sMikrTWF0aC5wb3coZVsyXSwyKStNYXRoLnBvdyhlWzNdLDIpK01hdGgucG93KGVbNF0sMikrTWF0aC5wb3coZVs1XSwyKSsxKX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDJkPWwpO3ZhciBjPXt9O2MuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oOSk7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTEsZVs1XT0wLGVbNl09MCxlWzddPTAsZVs4XT0xLGV9LGMuZnJvbU1hdDQ9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzRdLGVbNF09dFs1XSxlWzVdPXRbNl0sZVs2XT10WzhdLGVbN109dFs5XSxlWzhdPXRbMTBdLGV9LGMuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oOSk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzRdPWVbNF0sdFs1XT1lWzVdLHRbNl09ZVs2XSx0WzddPWVbN10sdFs4XT1lWzhdLHR9LGMuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlfSxjLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0xLGVbNV09MCxlWzZdPTAsZVs3XT0wLGVbOF09MSxlfSxjLnRyYW5zcG9zZT1mdW5jdGlvbihlLHQpe2lmKGU9PT10KXt2YXIgbj10WzFdLHI9dFsyXSxpPXRbNV07ZVsxXT10WzNdLGVbMl09dFs2XSxlWzNdPW4sZVs1XT10WzddLGVbNl09cixlWzddPWl9ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzNdLGVbMl09dFs2XSxlWzNdPXRbMV0sZVs0XT10WzRdLGVbNV09dFs3XSxlWzZdPXRbMl0sZVs3XT10WzVdLGVbOF09dFs4XTtyZXR1cm4gZX0sYy5pbnZlcnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz1sKm8tdSpmLGg9LWwqcyt1KmEscD1mKnMtbyphLGQ9bipjK3IqaCtpKnA7cmV0dXJuIGQ/KGQ9MS9kLGVbMF09YypkLGVbMV09KC1sKnIraSpmKSpkLGVbMl09KHUqci1pKm8pKmQsZVszXT1oKmQsZVs0XT0obCpuLWkqYSkqZCxlWzVdPSgtdSpuK2kqcykqZCxlWzZdPXAqZCxlWzddPSgtZipuK3IqYSkqZCxlWzhdPShvKm4tcipzKSpkLGUpOm51bGx9LGMuYWRqb2ludD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XTtyZXR1cm4gZVswXT1vKmwtdSpmLGVbMV09aSpmLXIqbCxlWzJdPXIqdS1pKm8sZVszXT11KmEtcypsLGVbNF09bipsLWkqYSxlWzVdPWkqcy1uKnUsZVs2XT1zKmYtbyphLGVbN109ciphLW4qZixlWzhdPW4qby1yKnMsZX0sYy5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl0saT1lWzNdLHM9ZVs0XSxvPWVbNV0sdT1lWzZdLGE9ZVs3XSxmPWVbOF07cmV0dXJuIHQqKGYqcy1vKmEpK24qKC1mKmkrbyp1KStyKihhKmktcyp1KX0sYy5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9blswXSxwPW5bMV0sZD1uWzJdLHY9blszXSxtPW5bNF0sZz1uWzVdLHk9bls2XSxiPW5bN10sdz1uWzhdO3JldHVybiBlWzBdPWgqcitwKm8rZCpmLGVbMV09aCppK3AqdStkKmwsZVsyXT1oKnMrcCphK2QqYyxlWzNdPXYqcittKm8rZypmLGVbNF09dippK20qdStnKmwsZVs1XT12KnMrbSphK2cqYyxlWzZdPXkqcitiKm8rdypmLGVbN109eSppK2IqdSt3KmwsZVs4XT15KnMrYiphK3cqYyxlfSxjLm11bD1jLm11bHRpcGx5LGMudHJhbnNsYXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD1uWzBdLHA9blsxXTtyZXR1cm4gZVswXT1yLGVbMV09aSxlWzJdPXMsZVszXT1vLGVbNF09dSxlWzVdPWEsZVs2XT1oKnIrcCpvK2YsZVs3XT1oKmkrcCp1K2wsZVs4XT1oKnMrcCphK2MsZX0sYy5yb3RhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPU1hdGguc2luKG4pLHA9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09cCpyK2gqbyxlWzFdPXAqaStoKnUsZVsyXT1wKnMraCphLGVbM109cCpvLWgqcixlWzRdPXAqdS1oKmksZVs1XT1wKmEtaCpzLGVbNl09ZixlWzddPWwsZVs4XT1jLGV9LGMuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPW5bMF0saT1uWzFdO3JldHVybiBlWzBdPXIqdFswXSxlWzFdPXIqdFsxXSxlWzJdPXIqdFsyXSxlWzNdPWkqdFszXSxlWzRdPWkqdFs0XSxlWzVdPWkqdFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlfSxjLmZyb21NYXQyZD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09MCxlWzNdPXRbMl0sZVs0XT10WzNdLGVbNV09MCxlWzZdPXRbNF0sZVs3XT10WzVdLGVbOF09MSxlfSxjLmZyb21RdWF0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4rbix1PXIrcixhPWkraSxmPW4qbyxsPXIqbyxjPXIqdSxoPWkqbyxwPWkqdSxkPWkqYSx2PXMqbyxtPXMqdSxnPXMqYTtyZXR1cm4gZVswXT0xLWMtZCxlWzNdPWwtZyxlWzZdPWgrbSxlWzFdPWwrZyxlWzRdPTEtZi1kLGVbN109cC12LGVbMl09aC1tLGVbNV09cCt2LGVbOF09MS1mLWMsZX0sYy5ub3JtYWxGcm9tTWF0ND1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPXRbOV0saD10WzEwXSxwPXRbMTFdLGQ9dFsxMl0sdj10WzEzXSxtPXRbMTRdLGc9dFsxNV0seT1uKnUtcipvLGI9biphLWkqbyx3PW4qZi1zKm8sRT1yKmEtaSp1LFM9cipmLXMqdSx4PWkqZi1zKmEsVD1sKnYtYypkLE49bCptLWgqZCxDPWwqZy1wKmQsaz1jKm0taCp2LEw9YypnLXAqdixBPWgqZy1wKm0sTz15KkEtYipMK3cqaytFKkMtUypOK3gqVDtyZXR1cm4gTz8oTz0xL08sZVswXT0odSpBLWEqTCtmKmspKk8sZVsxXT0oYSpDLW8qQS1mKk4pKk8sZVsyXT0obypMLXUqQytmKlQpKk8sZVszXT0oaSpMLXIqQS1zKmspKk8sZVs0XT0obipBLWkqQytzKk4pKk8sZVs1XT0ocipDLW4qTC1zKlQpKk8sZVs2XT0odip4LW0qUytnKkUpKk8sZVs3XT0obSp3LWQqeC1nKmIpKk8sZVs4XT0oZCpTLXYqdytnKnkpKk8sZSk6bnVsbH0sYy5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQzKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIsIFwiK2VbNl0rXCIsIFwiK2VbN10rXCIsIFwiK2VbOF0rXCIpXCJ9LGMuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs3XSwyKStNYXRoLnBvdyhlWzhdLDIpKX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDM9Yyk7dmFyIGg9e307aC5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigxNik7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTAsZVs1XT0xLGVbNl09MCxlWzddPTAsZVs4XT0wLGVbOV09MCxlWzEwXT0xLGVbMTFdPTAsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTAsZVsxNV09MSxlfSxoLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDE2KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdFs2XT1lWzZdLHRbN109ZVs3XSx0WzhdPWVbOF0sdFs5XT1lWzldLHRbMTBdPWVbMTBdLHRbMTFdPWVbMTFdLHRbMTJdPWVbMTJdLHRbMTNdPWVbMTNdLHRbMTRdPWVbMTRdLHRbMTVdPWVbMTVdLHR9LGguY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlWzldPXRbOV0sZVsxMF09dFsxMF0sZVsxMV09dFsxMV0sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0sZX0saC5pZGVudGl0eT1mdW5jdGlvbihlKXtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPTEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTEsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGgudHJhbnNwb3NlPWZ1bmN0aW9uKGUsdCl7aWYoZT09PXQpe3ZhciBuPXRbMV0scj10WzJdLGk9dFszXSxzPXRbNl0sbz10WzddLHU9dFsxMV07ZVsxXT10WzRdLGVbMl09dFs4XSxlWzNdPXRbMTJdLGVbNF09bixlWzZdPXRbOV0sZVs3XT10WzEzXSxlWzhdPXIsZVs5XT1zLGVbMTFdPXRbMTRdLGVbMTJdPWksZVsxM109byxlWzE0XT11fWVsc2UgZVswXT10WzBdLGVbMV09dFs0XSxlWzJdPXRbOF0sZVszXT10WzEyXSxlWzRdPXRbMV0sZVs1XT10WzVdLGVbNl09dFs5XSxlWzddPXRbMTNdLGVbOF09dFsyXSxlWzldPXRbNl0sZVsxMF09dFsxMF0sZVsxMV09dFsxNF0sZVsxMl09dFszXSxlWzEzXT10WzddLGVbMTRdPXRbMTFdLGVbMTVdPXRbMTVdO3JldHVybiBlfSxoLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPXRbOV0saD10WzEwXSxwPXRbMTFdLGQ9dFsxMl0sdj10WzEzXSxtPXRbMTRdLGc9dFsxNV0seT1uKnUtcipvLGI9biphLWkqbyx3PW4qZi1zKm8sRT1yKmEtaSp1LFM9cipmLXMqdSx4PWkqZi1zKmEsVD1sKnYtYypkLE49bCptLWgqZCxDPWwqZy1wKmQsaz1jKm0taCp2LEw9YypnLXAqdixBPWgqZy1wKm0sTz15KkEtYipMK3cqaytFKkMtUypOK3gqVDtyZXR1cm4gTz8oTz0xL08sZVswXT0odSpBLWEqTCtmKmspKk8sZVsxXT0oaSpMLXIqQS1zKmspKk8sZVsyXT0odip4LW0qUytnKkUpKk8sZVszXT0oaCpTLWMqeC1wKkUpKk8sZVs0XT0oYSpDLW8qQS1mKk4pKk8sZVs1XT0obipBLWkqQytzKk4pKk8sZVs2XT0obSp3LWQqeC1nKmIpKk8sZVs3XT0obCp4LWgqdytwKmIpKk8sZVs4XT0obypMLXUqQytmKlQpKk8sZVs5XT0ocipDLW4qTC1zKlQpKk8sZVsxMF09KGQqUy12KncrZyp5KSpPLGVbMTFdPShjKnctbCpTLXAqeSkqTyxlWzEyXT0odSpOLW8qay1hKlQpKk8sZVsxM109KG4qay1yKk4raSpUKSpPLGVbMTRdPSh2KmItZCpFLW0qeSkqTyxlWzE1XT0obCpFLWMqYitoKnkpKk8sZSk6bnVsbH0saC5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XTtyZXR1cm4gZVswXT11KihoKmctcCptKS1jKihhKmctZiptKSt2KihhKnAtZipoKSxlWzFdPS0ociooaCpnLXAqbSktYyooaSpnLXMqbSkrdiooaSpwLXMqaCkpLGVbMl09ciooYSpnLWYqbSktdSooaSpnLXMqbSkrdiooaSpmLXMqYSksZVszXT0tKHIqKGEqcC1mKmgpLXUqKGkqcC1zKmgpK2MqKGkqZi1zKmEpKSxlWzRdPS0obyooaCpnLXAqbSktbCooYSpnLWYqbSkrZCooYSpwLWYqaCkpLGVbNV09biooaCpnLXAqbSktbCooaSpnLXMqbSkrZCooaSpwLXMqaCksZVs2XT0tKG4qKGEqZy1mKm0pLW8qKGkqZy1zKm0pK2QqKGkqZi1zKmEpKSxlWzddPW4qKGEqcC1mKmgpLW8qKGkqcC1zKmgpK2wqKGkqZi1zKmEpLGVbOF09byooYypnLXAqdiktbCoodSpnLWYqdikrZCoodSpwLWYqYyksZVs5XT0tKG4qKGMqZy1wKnYpLWwqKHIqZy1zKnYpK2QqKHIqcC1zKmMpKSxlWzEwXT1uKih1KmctZip2KS1vKihyKmctcyp2KStkKihyKmYtcyp1KSxlWzExXT0tKG4qKHUqcC1mKmMpLW8qKHIqcC1zKmMpK2wqKHIqZi1zKnUpKSxlWzEyXT0tKG8qKGMqbS1oKnYpLWwqKHUqbS1hKnYpK2QqKHUqaC1hKmMpKSxlWzEzXT1uKihjKm0taCp2KS1sKihyKm0taSp2KStkKihyKmgtaSpjKSxlWzE0XT0tKG4qKHUqbS1hKnYpLW8qKHIqbS1pKnYpK2QqKHIqYS1pKnUpKSxlWzE1XT1uKih1KmgtYSpjKS1vKihyKmgtaSpjKStsKihyKmEtaSp1KSxlfSxoLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM10scz1lWzRdLG89ZVs1XSx1PWVbNl0sYT1lWzddLGY9ZVs4XSxsPWVbOV0sYz1lWzEwXSxoPWVbMTFdLHA9ZVsxMl0sZD1lWzEzXSx2PWVbMTRdLG09ZVsxNV0sZz10Km8tbipzLHk9dCp1LXIqcyxiPXQqYS1pKnMsdz1uKnUtcipvLEU9biphLWkqbyxTPXIqYS1pKnUseD1mKmQtbCpwLFQ9Zip2LWMqcCxOPWYqbS1oKnAsQz1sKnYtYypkLGs9bCptLWgqZCxMPWMqbS1oKnY7cmV0dXJuIGcqTC15KmsrYipDK3cqTi1FKlQrUyp4fSxoLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD10WzldLHA9dFsxMF0sZD10WzExXSx2PXRbMTJdLG09dFsxM10sZz10WzE0XSx5PXRbMTVdLGI9blswXSx3PW5bMV0sRT1uWzJdLFM9blszXTtyZXR1cm4gZVswXT1iKnIrdyp1K0UqYytTKnYsZVsxXT1iKmkrdyphK0UqaCtTKm0sZVsyXT1iKnMrdypmK0UqcCtTKmcsZVszXT1iKm8rdypsK0UqZCtTKnksYj1uWzRdLHc9bls1XSxFPW5bNl0sUz1uWzddLGVbNF09YipyK3cqdStFKmMrUyp2LGVbNV09YippK3cqYStFKmgrUyptLGVbNl09YipzK3cqZitFKnArUypnLGVbN109YipvK3cqbCtFKmQrUyp5LGI9bls4XSx3PW5bOV0sRT1uWzEwXSxTPW5bMTFdLGVbOF09YipyK3cqdStFKmMrUyp2LGVbOV09YippK3cqYStFKmgrUyptLGVbMTBdPWIqcyt3KmYrRSpwK1MqZyxlWzExXT1iKm8rdypsK0UqZCtTKnksYj1uWzEyXSx3PW5bMTNdLEU9blsxNF0sUz1uWzE1XSxlWzEyXT1iKnIrdyp1K0UqYytTKnYsZVsxM109YippK3cqYStFKmgrUyptLGVbMTRdPWIqcyt3KmYrRSpwK1MqZyxlWzE1XT1iKm8rdypsK0UqZCtTKnksZX0saC5tdWw9aC5tdWx0aXBseSxoLnRyYW5zbGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV0scz1uWzJdLG8sdSxhLGYsbCxjLGgscCxkLHYsbSxnO3JldHVybiB0PT09ZT8oZVsxMl09dFswXSpyK3RbNF0qaSt0WzhdKnMrdFsxMl0sZVsxM109dFsxXSpyK3RbNV0qaSt0WzldKnMrdFsxM10sZVsxNF09dFsyXSpyK3RbNl0qaSt0WzEwXSpzK3RbMTRdLGVbMTVdPXRbM10qcit0WzddKmkrdFsxMV0qcyt0WzE1XSk6KG89dFswXSx1PXRbMV0sYT10WzJdLGY9dFszXSxsPXRbNF0sYz10WzVdLGg9dFs2XSxwPXRbN10sZD10WzhdLHY9dFs5XSxtPXRbMTBdLGc9dFsxMV0sZVswXT1vLGVbMV09dSxlWzJdPWEsZVszXT1mLGVbNF09bCxlWzVdPWMsZVs2XT1oLGVbN109cCxlWzhdPWQsZVs5XT12LGVbMTBdPW0sZVsxMV09ZyxlWzEyXT1vKnIrbCppK2Qqcyt0WzEyXSxlWzEzXT11KnIrYyppK3Yqcyt0WzEzXSxlWzE0XT1hKnIraCppK20qcyt0WzE0XSxlWzE1XT1mKnIrcCppK2cqcyt0WzE1XSksZX0saC5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV0scz1uWzJdO3JldHVybiBlWzBdPXRbMF0qcixlWzFdPXRbMV0qcixlWzJdPXRbMl0qcixlWzNdPXRbM10qcixlWzRdPXRbNF0qaSxlWzVdPXRbNV0qaSxlWzZdPXRbNl0qaSxlWzddPXRbN10qaSxlWzhdPXRbOF0qcyxlWzldPXRbOV0qcyxlWzEwXT10WzEwXSpzLGVbMTFdPXRbMTFdKnMsZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0sZX0saC5yb3RhdGU9ZnVuY3Rpb24oZSxuLHIsaSl7dmFyIHM9aVswXSxvPWlbMV0sdT1pWzJdLGE9TWF0aC5zcXJ0KHMqcytvKm8rdSp1KSxmLGwsYyxoLHAsZCx2LG0sZyx5LGIsdyxFLFMseCxULE4sQyxrLEwsQSxPLE0sXztyZXR1cm4gTWF0aC5hYnMoYSk8dD9udWxsOihhPTEvYSxzKj1hLG8qPWEsdSo9YSxmPU1hdGguc2luKHIpLGw9TWF0aC5jb3MociksYz0xLWwsaD1uWzBdLHA9blsxXSxkPW5bMl0sdj1uWzNdLG09bls0XSxnPW5bNV0seT1uWzZdLGI9bls3XSx3PW5bOF0sRT1uWzldLFM9blsxMF0seD1uWzExXSxUPXMqcypjK2wsTj1vKnMqYyt1KmYsQz11KnMqYy1vKmYsaz1zKm8qYy11KmYsTD1vKm8qYytsLEE9dSpvKmMrcypmLE89cyp1KmMrbypmLE09byp1KmMtcypmLF89dSp1KmMrbCxlWzBdPWgqVCttKk4rdypDLGVbMV09cCpUK2cqTitFKkMsZVsyXT1kKlQreSpOK1MqQyxlWzNdPXYqVCtiKk4reCpDLGVbNF09aCprK20qTCt3KkEsZVs1XT1wKmsrZypMK0UqQSxlWzZdPWQqayt5KkwrUypBLGVbN109diprK2IqTCt4KkEsZVs4XT1oKk8rbSpNK3cqXyxlWzldPXAqTytnKk0rRSpfLGVbMTBdPWQqTyt5Kk0rUypfLGVbMTFdPXYqTytiKk0reCpfLG4hPT1lJiYoZVsxMl09blsxMl0sZVsxM109blsxM10sZVsxNF09blsxNF0sZVsxNV09blsxNV0pLGUpfSxoLnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPU1hdGguc2luKG4pLGk9TWF0aC5jb3Mobikscz10WzRdLG89dFs1XSx1PXRbNl0sYT10WzddLGY9dFs4XSxsPXRbOV0sYz10WzEwXSxoPXRbMTFdO3JldHVybiB0IT09ZSYmKGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSksZVs0XT1zKmkrZipyLGVbNV09byppK2wqcixlWzZdPXUqaStjKnIsZVs3XT1hKmkraCpyLGVbOF09ZippLXMqcixlWzldPWwqaS1vKnIsZVsxMF09YyppLXUqcixlWzExXT1oKmktYSpyLGV9LGgucm90YXRlWT1mdW5jdGlvbihlLHQsbil7dmFyIHI9TWF0aC5zaW4obiksaT1NYXRoLmNvcyhuKSxzPXRbMF0sbz10WzFdLHU9dFsyXSxhPXRbM10sZj10WzhdLGw9dFs5XSxjPXRbMTBdLGg9dFsxMV07cmV0dXJuIHQhPT1lJiYoZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzBdPXMqaS1mKnIsZVsxXT1vKmktbCpyLGVbMl09dSppLWMqcixlWzNdPWEqaS1oKnIsZVs4XT1zKnIrZippLGVbOV09bypyK2wqaSxlWzEwXT11KnIrYyppLGVbMTFdPWEqcitoKmksZX0saC5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1NYXRoLnNpbihuKSxpPU1hdGguY29zKG4pLHM9dFswXSxvPXRbMV0sdT10WzJdLGE9dFszXSxmPXRbNF0sbD10WzVdLGM9dFs2XSxoPXRbN107cmV0dXJuIHQhPT1lJiYoZVs4XT10WzhdLGVbOV09dFs5XSxlWzEwXT10WzEwXSxlWzExXT10WzExXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSksZVswXT1zKmkrZipyLGVbMV09byppK2wqcixlWzJdPXUqaStjKnIsZVszXT1hKmkraCpyLGVbNF09ZippLXMqcixlWzVdPWwqaS1vKnIsZVs2XT1jKmktdSpyLGVbN109aCppLWEqcixlfSxoLmZyb21Sb3RhdGlvblRyYW5zbGF0aW9uPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9cityLGE9aStpLGY9cytzLGw9cip1LGM9ciphLGg9cipmLHA9aSphLGQ9aSpmLHY9cypmLG09byp1LGc9byphLHk9bypmO3JldHVybiBlWzBdPTEtKHArdiksZVsxXT1jK3ksZVsyXT1oLWcsZVszXT0wLGVbNF09Yy15LGVbNV09MS0obCt2KSxlWzZdPWQrbSxlWzddPTAsZVs4XT1oK2csZVs5XT1kLW0sZVsxMF09MS0obCtwKSxlWzExXT0wLGVbMTJdPW5bMF0sZVsxM109blsxXSxlWzE0XT1uWzJdLGVbMTVdPTEsZX0saC5mcm9tUXVhdD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uK24sdT1yK3IsYT1pK2ksZj1uKm8sbD1yKm8sYz1yKnUsaD1pKm8scD1pKnUsZD1pKmEsdj1zKm8sbT1zKnUsZz1zKmE7cmV0dXJuIGVbMF09MS1jLWQsZVsxXT1sK2csZVsyXT1oLW0sZVszXT0wLGVbNF09bC1nLGVbNV09MS1mLWQsZVs2XT1wK3YsZVs3XT0wLGVbOF09aCttLGVbOV09cC12LGVbMTBdPTEtZi1jLGVbMTFdPTAsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTAsZVsxNV09MSxlfSxoLmZydXN0dW09ZnVuY3Rpb24oZSx0LG4scixpLHMsbyl7dmFyIHU9MS8obi10KSxhPTEvKGktciksZj0xLyhzLW8pO3JldHVybiBlWzBdPXMqMip1LGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPXMqMiphLGVbNl09MCxlWzddPTAsZVs4XT0obit0KSp1LGVbOV09KGkrcikqYSxlWzEwXT0obytzKSpmLGVbMTFdPS0xLGVbMTJdPTAsZVsxM109MCxlWzE0XT1vKnMqMipmLGVbMTVdPTAsZX0saC5wZXJzcGVjdGl2ZT1mdW5jdGlvbihlLHQsbixyLGkpe3ZhciBzPTEvTWF0aC50YW4odC8yKSxvPTEvKHItaSk7cmV0dXJuIGVbMF09cy9uLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPXMsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPShpK3IpKm8sZVsxMV09LTEsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTIqaSpyKm8sZVsxNV09MCxlfSxoLm9ydGhvPWZ1bmN0aW9uKGUsdCxuLHIsaSxzLG8pe3ZhciB1PTEvKHQtbiksYT0xLyhyLWkpLGY9MS8ocy1vKTtyZXR1cm4gZVswXT0tMip1LGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPS0yKmEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTIqZixlWzExXT0wLGVbMTJdPSh0K24pKnUsZVsxM109KGkrcikqYSxlWzE0XT0obytzKSpmLGVbMTVdPTEsZX0saC5sb29rQXQ9ZnVuY3Rpb24oZSxuLHIsaSl7dmFyIHMsbyx1LGEsZixsLGMscCxkLHYsbT1uWzBdLGc9blsxXSx5PW5bMl0sYj1pWzBdLHc9aVsxXSxFPWlbMl0sUz1yWzBdLHg9clsxXSxUPXJbMl07cmV0dXJuIE1hdGguYWJzKG0tUyk8dCYmTWF0aC5hYnMoZy14KTx0JiZNYXRoLmFicyh5LVQpPHQ/aC5pZGVudGl0eShlKTooYz1tLVMscD1nLXgsZD15LVQsdj0xL01hdGguc3FydChjKmMrcCpwK2QqZCksYyo9dixwKj12LGQqPXYscz13KmQtRSpwLG89RSpjLWIqZCx1PWIqcC13KmMsdj1NYXRoLnNxcnQocypzK28qbyt1KnUpLHY/KHY9MS92LHMqPXYsbyo9dix1Kj12KToocz0wLG89MCx1PTApLGE9cCp1LWQqbyxmPWQqcy1jKnUsbD1jKm8tcCpzLHY9TWF0aC5zcXJ0KGEqYStmKmYrbCpsKSx2Pyh2PTEvdixhKj12LGYqPXYsbCo9dik6KGE9MCxmPTAsbD0wKSxlWzBdPXMsZVsxXT1hLGVbMl09YyxlWzNdPTAsZVs0XT1vLGVbNV09ZixlWzZdPXAsZVs3XT0wLGVbOF09dSxlWzldPWwsZVsxMF09ZCxlWzExXT0wLGVbMTJdPS0ocyptK28qZyt1KnkpLGVbMTNdPS0oYSptK2YqZytsKnkpLGVbMTRdPS0oYyptK3AqZytkKnkpLGVbMTVdPTEsZSl9LGguc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwibWF0NChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiLCBcIitlWzRdK1wiLCBcIitlWzVdK1wiLCBcIitlWzZdK1wiLCBcIitlWzddK1wiLCBcIitlWzhdK1wiLCBcIitlWzldK1wiLCBcIitlWzEwXStcIiwgXCIrZVsxMV0rXCIsIFwiK2VbMTJdK1wiLCBcIitlWzEzXStcIiwgXCIrZVsxNF0rXCIsIFwiK2VbMTVdK1wiKVwifSxoLmZyb2I9ZnVuY3Rpb24oZSl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhlWzBdLDIpK01hdGgucG93KGVbMV0sMikrTWF0aC5wb3coZVsyXSwyKStNYXRoLnBvdyhlWzNdLDIpK01hdGgucG93KGVbNF0sMikrTWF0aC5wb3coZVs1XSwyKStNYXRoLnBvdyhlWzZdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs3XSwyKStNYXRoLnBvdyhlWzhdLDIpK01hdGgucG93KGVbOV0sMikrTWF0aC5wb3coZVsxMF0sMikrTWF0aC5wb3coZVsxMV0sMikrTWF0aC5wb3coZVsxMl0sMikrTWF0aC5wb3coZVsxM10sMikrTWF0aC5wb3coZVsxNF0sMikrTWF0aC5wb3coZVsxNV0sMikpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0ND1oKTt2YXIgcD17fTtwLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDQpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0scC5yb3RhdGlvblRvPWZ1bmN0aW9uKCl7dmFyIGU9dS5jcmVhdGUoKSx0PXUuZnJvbVZhbHVlcygxLDAsMCksbj11LmZyb21WYWx1ZXMoMCwxLDApO3JldHVybiBmdW5jdGlvbihyLGkscyl7dmFyIG89dS5kb3QoaSxzKTtyZXR1cm4gbzwtMC45OTk5OTk/KHUuY3Jvc3MoZSx0LGkpLHUubGVuZ3RoKGUpPDFlLTYmJnUuY3Jvc3MoZSxuLGkpLHUubm9ybWFsaXplKGUsZSkscC5zZXRBeGlzQW5nbGUocixlLE1hdGguUEkpLHIpOm8+Ljk5OTk5OT8oclswXT0wLHJbMV09MCxyWzJdPTAsclszXT0xLHIpOih1LmNyb3NzKGUsaSxzKSxyWzBdPWVbMF0sclsxXT1lWzFdLHJbMl09ZVsyXSxyWzNdPTErbyxwLm5vcm1hbGl6ZShyLHIpKX19KCkscC5zZXRBeGVzPWZ1bmN0aW9uKCl7dmFyIGU9Yy5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24odCxuLHIsaSl7cmV0dXJuIGVbMF09clswXSxlWzNdPXJbMV0sZVs2XT1yWzJdLGVbMV09aVswXSxlWzRdPWlbMV0sZVs3XT1pWzJdLGVbMl09LW5bMF0sZVs1XT0tblsxXSxlWzhdPS1uWzJdLHAubm9ybWFsaXplKHQscC5mcm9tTWF0Myh0LGUpKX19KCkscC5jbG9uZT1hLmNsb25lLHAuZnJvbVZhbHVlcz1hLmZyb21WYWx1ZXMscC5jb3B5PWEuY29weSxwLnNldD1hLnNldCxwLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0scC5zZXRBeGlzQW5nbGU9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPU1hdGguc2luKG4pO3JldHVybiBlWzBdPXIqdFswXSxlWzFdPXIqdFsxXSxlWzJdPXIqdFsyXSxlWzNdPU1hdGguY29zKG4pLGV9LHAuYWRkPWEuYWRkLHAubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXSxmPW5bMl0sbD1uWzNdO3JldHVybiBlWzBdPXIqbCtvKnUraSpmLXMqYSxlWzFdPWkqbCtvKmErcyp1LXIqZixlWzJdPXMqbCtvKmYrciphLWkqdSxlWzNdPW8qbC1yKnUtaSphLXMqZixlfSxwLm11bD1wLm11bHRpcGx5LHAuc2NhbGU9YS5zY2FsZSxwLnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYStvKnUsZVsxXT1pKmErcyp1LGVbMl09cyphLWkqdSxlWzNdPW8qYS1yKnUsZX0scC5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmEtcyp1LGVbMV09aSphK28qdSxlWzJdPXMqYStyKnUsZVszXT1vKmEtaSp1LGV9LHAucm90YXRlWj1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK2kqdSxlWzFdPWkqYS1yKnUsZVsyXT1zKmErbyp1LGVbM109byphLXMqdSxlfSxwLmNhbGN1bGF0ZVc9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl07cmV0dXJuIGVbMF09bixlWzFdPXIsZVsyXT1pLGVbM109LU1hdGguc3FydChNYXRoLmFicygxLW4qbi1yKnItaSppKSksZX0scC5kb3Q9YS5kb3QscC5sZXJwPWEubGVycCxwLnNsZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXSx1PXRbM10sYT1uWzBdLGY9blsxXSxsPW5bMl0sYz1uWzNdLGgscCxkLHYsbTtyZXR1cm4gcD1pKmErcypmK28qbCt1KmMscDwwJiYocD0tcCxhPS1hLGY9LWYsbD0tbCxjPS1jKSwxLXA+MWUtNj8oaD1NYXRoLmFjb3MocCksZD1NYXRoLnNpbihoKSx2PU1hdGguc2luKCgxLXIpKmgpL2QsbT1NYXRoLnNpbihyKmgpL2QpOih2PTEtcixtPXIpLGVbMF09dippK20qYSxlWzFdPXYqcyttKmYsZVsyXT12Km8rbSpsLGVbM109dip1K20qYyxlfSxwLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKm4rcipyK2kqaStzKnMsdT1vPzEvbzowO3JldHVybiBlWzBdPS1uKnUsZVsxXT0tcip1LGVbMl09LWkqdSxlWzNdPXMqdSxlfSxwLmNvbmp1Z2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlWzNdPXRbM10sZX0scC5sZW5ndGg9YS5sZW5ndGgscC5sZW49cC5sZW5ndGgscC5zcXVhcmVkTGVuZ3RoPWEuc3F1YXJlZExlbmd0aCxwLnNxckxlbj1wLnNxdWFyZWRMZW5ndGgscC5ub3JtYWxpemU9YS5ub3JtYWxpemUscC5mcm9tTWF0Mz1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0rdFs0XSt0WzhdLHI7aWYobj4wKXI9TWF0aC5zcXJ0KG4rMSksZVszXT0uNSpyLHI9LjUvcixlWzBdPSh0WzddLXRbNV0pKnIsZVsxXT0odFsyXS10WzZdKSpyLGVbMl09KHRbM10tdFsxXSkqcjtlbHNle3ZhciBpPTA7dFs0XT50WzBdJiYoaT0xKSx0WzhdPnRbaSozK2ldJiYoaT0yKTt2YXIgcz0oaSsxKSUzLG89KGkrMiklMztyPU1hdGguc3FydCh0W2kqMytpXS10W3MqMytzXS10W28qMytvXSsxKSxlW2ldPS41KnIscj0uNS9yLGVbM109KHRbbyozK3NdLXRbcyozK29dKSpyLGVbc109KHRbcyozK2ldK3RbaSozK3NdKSpyLGVbb109KHRbbyozK2ldK3RbaSozK29dKSpyfXJldHVybiBlfSxwLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInF1YXQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnF1YXQ9cCl9KHQuZXhwb3J0cyl9KSh0aGlzKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCAnLi9jb21wb25lbnRXaXJlU2VnbWVudCcgKTtcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmNvbXBvbmVudFdpcmUnLCBbXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlLnNlZ21lbnQnXG4gICAgXVxuKVxuICAgIC5jb250cm9sbGVyKCAnQ29tcG9uZW50V2lyZUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcbiAgICAgICAgJHNjb3BlLmdldFNlZ21lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVuZFBvc2l0aW9ucyxcbiAgICAgICAgICAgICAgICB4MSwgeTEsIHgyLCB5MjtcblxuICAgICAgICAgICAgZW5kUG9zaXRpb25zID0gJHNjb3BlLndpcmUuZ2V0RW5kUG9zaXRpb25zKCk7XG5cbiAgICAgICAgICAgIHgxID0gZW5kUG9zaXRpb25zLngxO1xuICAgICAgICAgICAgeDIgPSBlbmRQb3NpdGlvbnMueDI7XG4gICAgICAgICAgICB5MSA9IGVuZFBvc2l0aW9ucy55MTtcbiAgICAgICAgICAgIHkyID0gZW5kUG9zaXRpb25zLnkyO1xuXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIGVuZFBvc2l0aW9uc1xuICAgICAgICAgICAgXTtcblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vblNlZ21lbnRDbGljayA9IGZ1bmN0aW9uICggd2lyZSwgc2VnbWVudCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCB3aXJlLCBzZWdtZW50ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNlZ21lbnRzID0gJHNjb3BlLmdldFNlZ21lbnRzKCk7XG5cbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKFxuICAgICAgICAnY29tcG9uZW50V2lyZScsXG5cbiAgICAgICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb21wb25lbnRXaXJlQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvY29tcG9uZW50V2lyZS5odG1sJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbik7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlLnNlZ21lbnQnLCBbXVxuKVxuXG4uZGlyZWN0aXZlKFxuICAgICdjb21wb25lbnRXaXJlU2VnbWVudCcsXG5cbiAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9jb21wb25lbnRXaXJlU2VnbWVudC5odG1sJyxcbiAgICAgICAgICAgIHRlbXBsYXRlTmFtZXNwYWNlOiAnU1ZHJ1xuICAgICAgICB9O1xuICAgIH1cbik7IiwiLypnbG9iYWxzIGFuZ3VsYXIsICQqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5yZXF1aXJlKCAnLi4vZHJhd2luZ0NhbnZhcy9kcmF3aW5nQ2FudmFzLmpzJyApO1xuXG5hbmd1bGFyLm1vZHVsZSggJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRpYWdyYW1Db250YWluZXInLCBbXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRyYXdpbmdDYW52YXMnLFxuICAgICdwYW56b29tJyxcbiAgICAncGFuem9vbXdpZGdldCdcbl0gKVxuICAgIC5jb250cm9sbGVyKCAnRGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXInLCBbXG4gICAgICAgICckc2NvcGUnLFxuICAgICAgICAnUGFuWm9vbVNlcnZpY2UnLFxuICAgICAgICBmdW5jdGlvbiAoICRzY29wZSwgUGFuWm9vbVNlcnZpY2UgKSB7XG5cbiAgICAgICAgICAgIHZhciBjb21waWxlZERpcmVjdGl2ZXM7XG5cbiAgICAgICAgICAgIGNvbXBpbGVkRGlyZWN0aXZlcyA9IHt9O1xuXG4gICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5zdGF0ZSA9ICRzY29wZS5kaWFncmFtLnN0YXRlIHx8IHt9O1xuICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMgPSAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcyB8fCBbXTtcblxuICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgICAgICAkc2NvcGUucGFuem9vbUlkID0gJ3Bhbnpvb21JZCc7IC8vc2NvcGUuaWQgKyAnLXBhbnpvb21lZCc7XG5cbiAgICAgICAgICAgICRzY29wZS56b29tTGV2ZWwgPSA0O1xuXG4gICAgICAgICAgICAkc2NvcGUucGFuem9vbU1vZGVsID0ge307IC8vIGFsd2F5cyBwYXNzIGVtcHR5IG9iamVjdFxuXG4gICAgICAgICAgICAkc2NvcGUucGFuem9vbUNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICB6b29tTGV2ZWxzOiAxMCxcbiAgICAgICAgICAgICAgICBuZXV0cmFsWm9vbUxldmVsOiAkc2NvcGUuem9vbUxldmVsLFxuICAgICAgICAgICAgICAgIHNjYWxlUGVyWm9vbUxldmVsOiAxLjI1LFxuICAgICAgICAgICAgICAgIGZyaWN0aW9uOiA1MCxcbiAgICAgICAgICAgICAgICBoYWx0U3BlZWQ6IDUwLFxuXG4gICAgICAgICAgICAgICAgbW9kZWxDaGFuZ2VkQ2FsbGJhY2s6IGZ1bmN0aW9uICggdmFsICkge1xuICAgICAgICAgICAgICAgICAgICBQYW5ab29tU2VydmljZS5nZXRBUEkoICRzY29wZS5wYW56b29tSWQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggYXBpICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvcExlZnRDb3JuZXIsIGJvdHRvbVJpZ2h0Q29ybmVyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnpvb21MZXZlbCA9IHZhbC56b29tTGV2ZWw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BMZWZ0Q29ybmVyID0gYXBpLmdldE1vZGVsUG9zaXRpb24oIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbVJpZ2h0Q29ybmVyID0gYXBpLmdldE1vZGVsUG9zaXRpb24oIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogJHNjb3BlLmNhbnZhc1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAkc2NvcGUuY2FudmFzSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnZpc2libGVBcmVhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcExlZnRDb3JuZXIueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogdG9wTGVmdENvcm5lci54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByaWdodDogYm90dG9tUmlnaHRDb3JuZXIueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiBib3R0b21SaWdodENvcm5lci55XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJHNjb3BlLmdldENzc0NsYXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnem9vbS1sZXZlbC0nICsgJHNjb3BlLnpvb21MZXZlbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0VmlzaWJsZUFyZWEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS52aXNpYmxlQXJlYTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0SWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5pZDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RGlhZ3JhbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldFpvb21MZXZlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnpvb21MZXZlbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0Q29tcGlsZWREaXJlY3RpdmUgPSBmdW5jdGlvbiAoIGRpcmVjdGl2ZSApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWREaXJlY3RpdmVzWyBkaXJlY3RpdmUgXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuc2V0Q29tcGlsZWREaXJlY3RpdmUgPSBmdW5jdGlvbiAoIGRpcmVjdGl2ZSwgY29tcGlsZWREaXJlY3RpdmUgKSB7XG4gICAgICAgICAgICAgICAgY29tcGlsZWREaXJlY3RpdmVzWyBkaXJlY3RpdmUgXSA9IGNvbXBpbGVkRGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5pc0VkaXRhYmxlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5kaWFncmFtLmNvbmZpZy5lZGl0YWJsZSA9PT0gdHJ1ZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuaXNDb21wb25lbnRTZWxlY3RlZCA9IGZ1bmN0aW9uICggY29tcG9uZW50ICkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcy5pbmRleE9mKCBjb21wb25lbnQuaWQgKSA+IC0xO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB9XG4gICAgXSApXG4gICAgLmRpcmVjdGl2ZSggJ2RpYWdyYW1Db250YWluZXInLCBbXG4gICAgICAgICdkaWFncmFtU2VydmljZScsICckbG9nJywgJ1Bhblpvb21TZXJ2aWNlJyxcbiAgICAgICAgZnVuY3Rpb24gKCBkaWFncmFtU2VydmljZSwgJGxvZyApIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQCcsXG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW06ICc9J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9kaWFncmFtQ29udGFpbmVyLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICggc2NvcGUsIGVsZW1lbnQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FudmFzV2lkdGggPSAkKCBlbGVtZW50IClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vdXRlcldpZHRoKCk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNhbnZhc0hlaWdodCA9ICQoIGVsZW1lbnQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm91dGVySGVpZ2h0KCk7XG5cblxuICAgICAgICAgICAgICAgICAgICBzY29wZS52aXNpYmxlQXJlYSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogc2NvcGUuY2FudmFzV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3R0b206IHNjb3BlLmNhbnZhc0hlaWdodFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICRsb2cuZGVidWcoICdJbiBjYW52YXMgY29udGFpbmVyJywgc2NvcGUudmlzaWJsZUFyZWEgKTtcblxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxuYW5ndWxhci5tb2R1bGUoICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kcmF3aW5nQ2FudmFzJywgW10gKVxuICAgIC5kaXJlY3RpdmUoICdkcmF3aW5nQ2FudmFzJyxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9kcmF3aW5nQ2FudmFzLmh0bWwnXG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgZmFicmljKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxuYW5ndWxhci5tb2R1bGUoICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5mYWJyaWNDYW52YXMnLCBbXSApXG4gICAgLmNvbnRyb2xsZXIoICdGYWJyaWNDYW52YXNDb250cm9sbGVyJywgZnVuY3Rpb24gKCkge1xuXG4gICAgfSApXG4gICAgLmRpcmVjdGl2ZSggJ2ZhYnJpY0NhbnZhcycsIFtcbiAgICAgICAgJyRsb2cnLFxuICAgICAgICAnZGlhZ3JhbVNlcnZpY2UnLFxuICAgICAgICBmdW5jdGlvbiAoICRsb2csIGRpYWdyYW1TZXJ2aWNlICkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdGYWJyaWNDYW52YXNDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICByZXF1aXJlOiAnXmRpYWdyYW1Db250YWluZXInLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2ZhYnJpY0NhbnZhcy5odG1sJyxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoIHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzLCBkaWFncmFtQ29udGFpbmVyQ3RybCApIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXJcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyRGlhZ3JhbTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS5pZCA9IGRpYWdyYW1Db250YWluZXJDdHJsLmdldElkKCkgKyAnZmFicmljLWNhbnZhcyc7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXMoIHNjb3BlLmlkICk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLnNldEJhY2tncm91bmRDb2xvciggJ3JnYmEoMjU1LCA3MywgNjQsIDAuNiknICk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyRGlhZ3JhbSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzT2JqZWN0KCBzY29wZS5kaWFncmFtRGF0YSApICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzQXJyYXkoIHNjb3BlLmRpYWdyYW1EYXRhLnN5bWJvbHMgKSApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goIHNjb3BlLmRpYWdyYW1EYXRhLnN5bWJvbHMsIGZ1bmN0aW9uICggc3ltYm9sICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFncmFtU2VydmljZS5nZXRTVkdGb3JTeW1ib2xUeXBlKCBzeW1ib2wudHlwZSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggb2JqZWN0ICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdmdPYmplY3Q7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnT2JqZWN0ID0gb2JqZWN0LnNldCgge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogc3ltYm9sLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHN5bWJvbC55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5nbGU6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgY2FudmFzLmFkZChzdmdPYmplY3QpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWN0ID0gbmV3IGZhYnJpYy5SZWN0KCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IDUwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogJ2dyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ2xlOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDEwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMuYWRkKCByZWN0ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgJGxvZy5kZWJ1ZygnZScsIHN2Z09iamVjdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLnJlbmRlckFsbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW5kZXJBbGwoKTtcblxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCggZGlhZ3JhbUNvbnRhaW5lckN0cmwuZ2V0RGlhZ3JhbURhdGEsIGZ1bmN0aW9uICggdmFsdWUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCAnRGlhZ3JhbURhdGEgaXMgJywgdmFsdWUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmRpYWdyYW1EYXRhID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJEaWFncmFtKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ucG9ydCcsIFtdXG4pXG4gICAgLmNvbnRyb2xsZXIoICdQb3J0Q29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlICkge1xuICAgICAgICAkc2NvcGUuZ2V0UG9ydFRyYW5zZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1TdHJpbmc7XG5cbiAgICAgICAgICAgIHRyYW5zZm9ybVN0cmluZyA9ICd0cmFuc2xhdGUoJyArICRzY29wZS5wb3J0SW5zdGFuY2UucG9ydFN5bWJvbC54ICsgJywnICsgJHNjb3BlLnBvcnRJbnN0YW5jZS5wb3J0U3ltYm9sXG4gICAgICAgICAgICAgICAgLnkgKyAnKSc7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1TdHJpbmc7XG4gICAgICAgIH07XG4gICAgfSApXG4gICAgLmRpcmVjdGl2ZShcbiAgICAgICAgJ3BvcnQnLFxuXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzY29wZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1BvcnRDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9wb3J0Lmh0bWwnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlTmFtZXNwYWNlOiAnU1ZHJyxcbiAgICAgICAgICAgICAgICByZXF1aXJlOiBbICdec3ZnRGlhZ3JhbScsICdeZGlhZ3JhbUNvbnRhaW5lcicgXSxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoIHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzLCBjb250cm9sbGVycyApIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgc3ZnRGlhZ3JhbUNvbnRyb2xsZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIgPSBjb250cm9sbGVyc1sgMCBdO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUG9ydENsaWNrID0gZnVuY3Rpb24gKCBwb3J0LCAkZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5vblBvcnRDbGljayggc2NvcGUuY29tcG9uZW50LCBwb3J0LCAkZXZlbnQgKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS5vblBvcnRNb3VzZURvd24gPSBmdW5jdGlvbiAoIHBvcnQsICRldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uUG9ydE1vdXNlRG93biggc2NvcGUuY29tcG9uZW50LCBwb3J0LCAkZXZlbnQgKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS5vblBvcnRNb3VzZVVwID0gZnVuY3Rpb24gKCBwb3J0LCAkZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5vblBvcnRNb3VzZVVwKCBzY29wZS5jb21wb25lbnQsIHBvcnQsICRldmVudCApO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbnJlcXVpcmUoICcuLi9jb21wb25lbnRXaXJlL2NvbXBvbmVudFdpcmUuanMnICk7XG5cbmFuZ3VsYXIubW9kdWxlKCAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ZnRGlhZ3JhbScsIFtcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZ3JpZFNlcnZpY2UnLFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlJ1xuXSApXG4gICAgLmNvbnRyb2xsZXIoICdTVkdEaWFncmFtQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCAkbG9nLCBkaWFncmFtU2VydmljZSwgd2lyaW5nU2VydmljZSwgZ3JpZFNlcnZpY2UgKSB7XG5cbiAgICAgICAgdmFyIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvcixcbiAgICAgICAgICAgIHN0YXJ0RHJhZyxcbiAgICAgICAgICAgIGZpbmlzaERyYWcsXG5cbiAgICAgICAgICAgIHBvc3NpYmxlV2lyZVN0YXJ0LFxuICAgICAgICAgICAgc3RhcnRXaXJlLFxuICAgICAgICAgICAgZmluaXNoV2lyZSxcbiAgICAgICAgICAgIGNhbmNlbFdpcmUsXG5cbiAgICAgICAgICAgIG1vdmVDb21wb25lbnRFbGVtZW50VG9Gcm9udCxcblxuICAgICAgICAgICAgZ2V0T2Zmc2V0VG9Nb3VzZSxcblxuICAgICAgICAgICAgV2lyZSA9IHJlcXVpcmUoICcuLi8uLi9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL1dpcmUuanMnICksXG5cbiAgICAgICAgICAgIGFkZENvcm5lclRvTmV3V2lyZUxpbmUsXG5cbiAgICAgICAgICAgIGNvbXBvbmVudEVsZW1lbnRzO1xuXG5cbiAgICAgICAgZ2V0T2Zmc2V0VG9Nb3VzZSA9IGZ1bmN0aW9uICggJGV2ZW50ICkge1xuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0O1xuXG4gICAgICAgICAgICBvZmZzZXQgPSB7XG4gICAgICAgICAgICAgICAgeDogJGV2ZW50LnBhZ2VYIC0gJHNjb3BlLmVsZW1lbnRPZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICB5OiAkZXZlbnQucGFnZVkgLSAkc2NvcGUuZWxlbWVudE9mZnNldC50b3BcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBvZmZzZXQ7XG5cbiAgICAgICAgfTtcblxuICAgICAgICBzdGFydERyYWcgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICRzY29wZS5kcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3I7XG4gICAgICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgICAgICAkbG9nLmRlYnVnKCAnRHJhZ2dpbmcnLCAkc2NvcGUuZHJhZ1RhcmdldHNEZXNjcmlwdG9yICk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICBzdGFydFdpcmUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICRzY29wZS53aXJlU3RhcnQgPSBwb3NzaWJsZVdpcmVTdGFydDtcbiAgICAgICAgICAgIHBvc3NpYmxlV2lyZVN0YXJ0ID0gbnVsbDtcblxuICAgICAgICAgICAgJGxvZy5kZWJ1ZyggJ1N0YXJ0aW5nIHdpcmUnLCAkc2NvcGUud2lyZVN0YXJ0ICk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICBhZGRDb3JuZXJUb05ld1dpcmVMaW5lID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgbGFzdFNlZ21lbnQ7XG5cbiAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cyA9ICRzY29wZS5uZXdXaXJlTGluZS5zZWdtZW50cztcblxuICAgICAgICAgICAgbGFzdFNlZ21lbnQgPSAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHNbICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cy5sZW5ndGggLSAxIF07XG5cbiAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5hY3RpdmVTZWdtZW50U3RhcnRQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiBsYXN0U2VnbWVudC54MixcbiAgICAgICAgICAgICAgICB5OiBsYXN0U2VnbWVudC55MlxuICAgICAgICAgICAgfTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGZpbmlzaFdpcmUgPSBmdW5jdGlvbiAoIGNvbXBvbmVudCwgcG9ydCApIHtcblxuICAgICAgICAgICAgdmFyIHdpcmUgPSBuZXcgV2lyZSgge1xuICAgICAgICAgICAgICAgIGlkOiAnbmV3LXdpcmUtJyArIE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAxMDAwMCApLFxuICAgICAgICAgICAgICAgIGVuZDE6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAkc2NvcGUud2lyZVN0YXJ0LmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgICAgcG9ydDogJHNjb3BlLndpcmVTdGFydC5wb3J0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbmQyOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICBwb3J0OiBwb3J0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB3aXJlLnNlZ21lbnRzID0gYW5ndWxhci5jb3B5KFxuICAgICAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cy5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UuZ2V0U2VnbWVudHNCZXR3ZWVuUG9zaXRpb25zKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kMTogJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDI6IHBvcnQuZ2V0R3JpZFBvc2l0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAnRWxib3dSb3V0ZXInXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApICk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCB3aXJlLnNlZ21lbnRzICk7XG5cblxuICAgICAgICAgICAgZGlhZ3JhbVNlcnZpY2UuYWRkV2lyZSggd2lyZSApO1xuXG4gICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS53aXJlc1sgd2lyZS5pZCBdID0gd2lyZTtcblxuICAgICAgICAgICAgZ3JpZFNlcnZpY2UuaW52YWxpZGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyggJHNjb3BlLmlkICk7XG5cbiAgICAgICAgICAgICRsb2cuZGVidWcoICdGaW5pc2ggd2lyZScsIHdpcmUgKTtcblxuICAgICAgICAgICAgJHNjb3BlLndpcmVTdGFydCA9IG51bGw7XG4gICAgICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUgPSBudWxsO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgY2FuY2VsV2lyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS53aXJlU3RhcnQgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZpbmlzaERyYWcgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICRzY29wZS5kcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgICAgICAkbG9nLmRlYnVnKCAnRmluaXNoIGRyYWdnaW5nJyApO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9uTW91c2VVcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICAgaWYgKCRzY29wZS5kcmFnVGFyZ2V0c0Rlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAvL2ZpbmlzaERyYWcoKTtcbiAgICAgICAgICAgIC8vICAgICAgfVxuICAgICAgICB9O1xuXG5cbiAgICAgICAgJHNjb3BlLm9uQ2xpY2sgPSBmdW5jdGlvbiAoICRldmVudCApIHtcblxuICAgICAgICAgICAgaWYgKCAkc2NvcGUud2lyZVN0YXJ0ICkge1xuXG4gICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgYWRkQ29ybmVyVG9OZXdXaXJlTGluZSgpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub25Nb3VzZU1vdmUgPSBmdW5jdGlvbiAoICRldmVudCApIHtcblxuICAgICAgICAgICAgdmFyIG9mZnNldDtcblxuICAgICAgICAgICAgLy8gRHJhZ2dpbmdcblxuICAgICAgICAgICAgaWYgKCBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgKSB7XG4gICAgICAgICAgICAgICAgc3RhcnREcmFnKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggJHNjb3BlLmRyYWdUYXJnZXRzRGVzY3JpcHRvciApIHtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggJHNjb3BlLmRyYWdUYXJnZXRzRGVzY3JpcHRvci50YXJnZXRzLCBmdW5jdGlvbiAoIHRhcmdldCApIHtcblxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCRldmVudC5vZmZzZXRZLCB0YXJnZXQuZGVsdGFUb0N1cnNvci55KTtcblxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBnZXRPZmZzZXRUb01vdXNlKCAkZXZlbnQgKTtcblxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuY29tcG9uZW50LnNldFBvc2l0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0LnggKyB0YXJnZXQuZGVsdGFUb0N1cnNvci54LFxuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0LnkgKyB0YXJnZXQuZGVsdGFUb0N1cnNvci55XG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goICRzY29wZS5kcmFnVGFyZ2V0c0Rlc2NyaXB0b3IuYWZmZWN0ZWRXaXJlcywgZnVuY3Rpb24gKCB3aXJlICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UuYWRqdXN0V2lyZUVuZFNlZ21lbnRzKCB3aXJlICk7XG5cbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gV2lyZSBkcmF3aW5nXG5cbiAgICAgICAgICAgIGlmICggcG9zc2libGVXaXJlU3RhcnQgKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRXaXJlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggJHNjb3BlLndpcmVTdGFydCApIHtcblxuICAgICAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZSA9ICRzY29wZS5uZXdXaXJlTGluZSB8fCB7fTtcbiAgICAgICAgICAgICAgICAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHMgPSAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHMgfHwgW107XG4gICAgICAgICAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uIHx8ICRzY29wZS53aXJlU3RhcnQucG9ydC5nZXRHcmlkUG9zaXRpb24oKTtcblxuICAgICAgICAgICAgICAgICRzY29wZS5uZXdXaXJlTGluZS5zZWdtZW50cyA9ICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cy5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2UuZ2V0U2VnbWVudHNCZXR3ZWVuUG9zaXRpb25zKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kMTogJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogJGV2ZW50LnBhZ2VYIC0gJHNjb3BlLmVsZW1lbnRPZmZzZXQubGVmdCAtIDMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6ICRldmVudC5wYWdlWSAtICRzY29wZS5lbGVtZW50T2Zmc2V0LnRvcCAtIDNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0VsYm93Um91dGVyJ1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmdldENzc0NsYXNzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgICAgIGlmICggJHNjb3BlLmRyYWdUYXJnZXRzRGVzY3JpcHRvciApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gJ2RyYWdnaW5nJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jb250ZXh0TWVudURhdGEgPSBbIHtcbiAgICAgICAgICAgIGlkOiAnY29udGV4dC1tZW51LWNvbW1vbicsXG4gICAgICAgICAgICBpdGVtczogWyB7XG4gICAgICAgICAgICAgICAgaWQ6ICduZXdDb21wb25lbnQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTmV3IGNvbXBvbmVudCAuLi4nLFxuICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGx1cycsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTmV3IGNvbXBvbmVudCBjbGlja2VkJyApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge31cbiAgICAgICAgICAgIH0gXVxuICAgICAgICB9IF07XG5cbiAgICAgICAgbW92ZUNvbXBvbmVudEVsZW1lbnRUb0Zyb250ID0gZnVuY3Rpb24gKCBjb21wb25lbnRJZCApIHtcblxuICAgICAgICAgICAgdmFyIHosXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgICAgIG5lZWRzVG9iZVJlb3JkZXJlZDtcblxuICAgICAgICAgICAgbmVlZHNUb2JlUmVvcmRlcmVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHogPSBkaWFncmFtU2VydmljZS5nZXRIaWdoZXN0WigpO1xuICAgICAgICAgICAgY29tcG9uZW50ID0gJHNjb3BlLmRpYWdyYW0uY29tcG9uZW50c1sgY29tcG9uZW50SWQgXTtcblxuICAgICAgICAgICAgaWYgKCBpc05hTiggY29tcG9uZW50LnogKSApIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQueiA9IHo7XG4gICAgICAgICAgICAgICAgbmVlZHNUb2JlUmVvcmRlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCBjb21wb25lbnQueiA8IHogKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC56ID0geiArIDE7XG4gICAgICAgICAgICAgICAgICAgIG5lZWRzVG9iZVJlb3JkZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIG5lZWRzVG9iZVJlb3JkZXJlZCApIHtcbiAgICAgICAgICAgICAgICBncmlkU2VydmljZS5yZW9yZGVyVmlzaWJsZUNvbXBvbmVudHMoICRzY29wZS5pZCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJhY3Rpb25zIHdpdGggY29tcG9uZW50c1xuXG4gICAgICAgIHRoaXMudG9nZ2xlQ29tcG9uZW50U2VsZWN0ZWQgPSBmdW5jdGlvbiAoIGNvbXBvbmVudCwgJGV2ZW50ICkge1xuXG4gICAgICAgICAgICB2YXIgaW5kZXg7XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggY29tcG9uZW50ICkgJiYgIXRoaXMuZGlzYWxsb3dTZWxlY3Rpb24oKSAmJiBjb21wb25lbnQubm9uU2VsZWN0YWJsZSAhPT0gdHJ1ZSApIHtcblxuICAgICAgICAgICAgICAgIGluZGV4ID0gJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZiggY29tcG9uZW50LmlkICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIGluZGV4ID4gLTEgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuc3BsaWNlKCBpbmRleCwgMSApO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLmNvbmZpZy5tdWx0aVNlbGVjdCAhPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnNoaWZ0S2V5ICE9PSB0cnVlICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLCBmdW5jdGlvbiAoIGNvbXBvbmVudElkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLmNvbXBvbmVudHNbIGNvbXBvbmVudElkIF0uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcy5wdXNoKCBjb21wb25lbnQuaWQgKTtcblxuICAgICAgICAgICAgICAgICAgICBtb3ZlQ29tcG9uZW50RWxlbWVudFRvRnJvbnQoIGNvbXBvbmVudC5pZCApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uQ29tcG9uZW50Q2xpY2sgPSBmdW5jdGlvbiAoIGNvbXBvbmVudCwgJGV2ZW50ICkge1xuXG4gICAgICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoICRzY29wZS5kcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgKSB7XG4gICAgICAgICAgICAgICAgZmluaXNoRHJhZygpO1xuICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDb21wb25lbnRTZWxlY3RlZCggY29tcG9uZW50LCAkZXZlbnQgKTtcbiAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uUG9ydE1vdXNlRG93biA9IGZ1bmN0aW9uICggY29tcG9uZW50LCBwb3J0LCAkZXZlbnQgKSB7XG5cbiAgICAgICAgICAgIGlmICggISRzY29wZS53aXJlU3RhcnQgKSB7XG4gICAgICAgICAgICAgICAgcG9zc2libGVXaXJlU3RhcnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICBwb3J0OiBwb3J0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vblBvcnRNb3VzZVVwID0gZnVuY3Rpb24gKCBjb21wb25lbnQsIHBvcnQsICRldmVudCApIHtcblxuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vblBvcnRDbGljayA9IGZ1bmN0aW9uICggY29tcG9uZW50LCBwb3J0LCAkZXZlbnQgKSB7XG5cbiAgICAgICAgICAgIGlmICggcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yICkge1xuICAgICAgICAgICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvciA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggJHNjb3BlLndpcmVTdGFydCApIHtcblxuICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgIGlmICggJHNjb3BlLndpcmVTdGFydC5wb3J0ICE9PSBwb3J0ICkge1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hXaXJlKCBjb21wb25lbnQsIHBvcnQgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYW5jZWxXaXJlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uQ29tcG9uZW50TW91c2VEb3duID0gZnVuY3Rpb24gKCBjb21wb25lbnQsICRldmVudCApIHtcblxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudHNUb0RyYWcsXG4gICAgICAgICAgICAgICAgZ2V0RHJhZ0Rlc2NyaXB0b3IsXG4gICAgICAgICAgICAgICAgd2lyZXM7XG5cbiAgICAgICAgICAgIGlmICggJGV2ZW50LndoaWNoID09PSAzICkge1xuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnJvdGF0ZSggOTAgKTtcblxuICAgICAgICAgICAgICAgIHdpcmVzID0gZGlhZ3JhbVNlcnZpY2UuZ2V0V2lyZXNGb3JDb21wb25lbnRzKCBjb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBjb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggd2lyZXMsIGZ1bmN0aW9uICggd2lyZSApIHtcbiAgICAgICAgICAgICAgICAgICAgd2lyaW5nU2VydmljZS5hZGp1c3RXaXJlRW5kU2VnbWVudHMoIHdpcmUgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cblxuICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50c1RvRHJhZyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZ2V0RHJhZ0Rlc2NyaXB0b3IgPSBmdW5jdGlvbiAoIGNvbXBvbmVudCApIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gZ2V0T2Zmc2V0VG9Nb3VzZSggJGV2ZW50ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGNvbXBvbmVudC54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGNvbXBvbmVudC55XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFUb0N1cnNvcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGNvbXBvbmVudC54IC0gb2Zmc2V0LngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogY29tcG9uZW50LnkgLSBvZmZzZXQueVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmICggdGhpcy5pc0VkaXRhYmxlKCkgJiZcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Lm5vblNlbGVjdGFibGUgIT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LmxvY2F0aW9uTG9ja2VkICE9PSB0cnVlICkge1xuXG4gICAgICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRzOiBbIGdldERyYWdEZXNjcmlwdG9yKCBjb21wb25lbnQgKSBdXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c1RvRHJhZy5wdXNoKCBjb21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmluZGV4T2YoIGNvbXBvbmVudC5pZCApID4gLTEgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIERyYWcgYWxvbmcgb3RoZXIgc2VsZWN0ZWQgY29tcG9uZW50c1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLCBmdW5jdGlvbiAoIHNlbGVjdGVkQ29tcG9uZW50SWQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWRDb21wb25lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNvbXBvbmVudC5pZCAhPT0gc2VsZWN0ZWRDb21wb25lbnRJZCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENvbXBvbmVudCA9ICRzY29wZS5kaWFncmFtLmNvbXBvbmVudHNbIHNlbGVjdGVkQ29tcG9uZW50SWQgXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IudGFyZ2V0cy5wdXNoKCBnZXREcmFnRGVzY3JpcHRvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ29tcG9uZW50ICkgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzVG9EcmFnLnB1c2goIHNlbGVjdGVkQ29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvci5hZmZlY3RlZFdpcmVzID0gZGlhZ3JhbVNlcnZpY2UuZ2V0V2lyZXNGb3JDb21wb25lbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c1RvRHJhZyApO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaXNFZGl0YWJsZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW0uY29uZmlnLmVkaXRhYmxlID09PSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGlzYWxsb3dTZWxlY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICRzY29wZS5kaWFncmFtLmNvbmZpZyA9ICRzY29wZS5kaWFncmFtLmNvbmZpZyB8fCB7fTtcblxuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5kaWFncmFtLmNvbmZpZy5kaXNhbGxvd1NlbGVjdGlvbiA9PT0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50RWxlbWVudCA9IGZ1bmN0aW9uICggaWQsIGVsICkge1xuXG4gICAgICAgICAgICBjb21wb25lbnRFbGVtZW50cyA9IGNvbXBvbmVudEVsZW1lbnRzIHx8IHt9O1xuXG4gICAgICAgICAgICBjb21wb25lbnRFbGVtZW50c1sgaWQgXSA9IGVsO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy51bnJlZ2lzdGVyQ29tcG9uZW50RWxlbWVudCA9IGZ1bmN0aW9uICggaWQgKSB7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudEVsZW1lbnRzID0gY29tcG9uZW50RWxlbWVudHMgfHwge307XG5cbiAgICAgICAgICAgIGRlbGV0ZSBjb21wb25lbnRFbGVtZW50c1sgaWQgXTtcblxuICAgICAgICB9O1xuXG4gICAgfSApXG4gICAgLmRpcmVjdGl2ZSggJ3N2Z0RpYWdyYW0nLCBbXG4gICAgICAgICckbG9nJyxcbiAgICAgICAgJ2RpYWdyYW1TZXJ2aWNlJyxcbiAgICAgICAgJ2dyaWRTZXJ2aWNlJyxcbiAgICAgICAgZnVuY3Rpb24gKCAkbG9nLCBkaWFncmFtU2VydmljZSwgZ3JpZFNlcnZpY2UgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NWR0RpYWdyYW1Db250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICByZXF1aXJlOiAnXmRpYWdyYW1Db250YWluZXInLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9zdmdEaWFncmFtLmh0bWwnLFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICggc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpZDtcblxuICAgICAgICAgICAgICAgICAgICBpZCA9IGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLmdldElkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlhZ3JhbSA9IHNjb3BlLmRpYWdyYW0gfHwge307XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRlbGVtZW50ID0gZWxlbWVudDtcblxuICAgICAgICAgICAgICAgICAgICBzY29wZS5pZCA9IGlkO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnZpc2libGVPYmplY3RzID0gZ3JpZFNlcnZpY2UuY3JlYXRlR3JpZCggaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMTAwMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlhZ3JhbVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuZ2V0VmlzaWJsZUFyZWEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICggdmlzaWJsZUFyZWEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZWxlbWVudE9mZnNldCA9IHNjb3BlLiRlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRTZXJ2aWNlLnNldFZpc2libGVBcmVhKCBpZCwgdmlzaWJsZUFyZWEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4gICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuYm94JywgW11cbilcbiAgICAuY29udHJvbGxlciggJ0JveENvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcblxuICAgICAgICAkc2NvcGUucG9ydFdpcmVzID0gW107XG5cbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKCAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5wb3J0cywgZnVuY3Rpb24gKCBwb3J0ICkge1xuXG4gICAgICAgICAgICB2YXIgdG9YID0gMCxcbiAgICAgICAgICAgICAgICB0b1kgPSAwLFxuICAgICAgICAgICAgICAgIHBvcnRXaXJlTGVuZ3RoLFxuICAgICAgICAgICAgICAgIHdpZHRoLCBoZWlnaHQ7XG5cbiAgICAgICAgICAgIHBvcnRXaXJlTGVuZ3RoID0gJHNjb3BlLmNvbXBvbmVudC5zeW1ib2wucG9ydFdpcmVMZW5ndGg7XG4gICAgICAgICAgICB3aWR0aCA9ICRzY29wZS5jb21wb25lbnQuc3ltYm9sLndpZHRoO1xuICAgICAgICAgICAgaGVpZ2h0ID0gJHNjb3BlLmNvbXBvbmVudC5zeW1ib2wuaGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoIHBvcnQueCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICB0b1ggPSBwb3J0V2lyZUxlbmd0aDtcbiAgICAgICAgICAgICAgICB0b1kgPSBwb3J0Lnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggcG9ydC55ID09PSAwICkge1xuICAgICAgICAgICAgICAgIHRvWSA9IHBvcnRXaXJlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRvWCA9IHBvcnQueDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBwb3J0LnggPT09IHdpZHRoICkge1xuICAgICAgICAgICAgICAgIHRvWCA9IHdpZHRoIC0gcG9ydFdpcmVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdG9ZID0gcG9ydC55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHBvcnQueSA9PT0gaGVpZ2h0ICkge1xuICAgICAgICAgICAgICAgIHRvWSA9IGhlaWdodCAtIHBvcnRXaXJlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRvWCA9IHBvcnQueDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJHNjb3BlLnBvcnRXaXJlcy5wdXNoKCB7XG4gICAgICAgICAgICAgICAgeDE6IHBvcnQueCxcbiAgICAgICAgICAgICAgICB5MTogcG9ydC55LFxuICAgICAgICAgICAgICAgIHgyOiB0b1gsXG4gICAgICAgICAgICAgICAgeTI6IHRvWVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG5cbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKFxuICAgICAgICAnYm94JyxcblxuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQm94Q29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9ib3guaHRtbCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVOYW1lc3BhY2U6ICdTVkcnXG4gICAgICAgICAgICB9O1xuICAgICAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmNhcGFjaXRvcicsIFtdXG4pXG4gICAgLmNvbmZpZyggWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKCBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIgKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2FwYWNpdG9yJyxcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLWNhcGFjaXRvcicsXG4gICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICdDJyxcbiAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDEwLFxuICAgICAgICAgICAgICAgICAgICB5OiAtOFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2lkdGg6IDYwLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMTUsXG4gICAgICAgICAgICAgICAgcG9ydHM6IFsge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0MnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQycsXG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDcuNVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdBJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBJyxcbiAgICAgICAgICAgICAgICAgICAgeDogNjAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDcuNVxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCAkKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCAnLi4vLi4vc2VydmljZXMvc3ltYm9sU2VydmljZXMvc3ltYm9sU2VydmljZXMuanMnICk7XG5yZXF1aXJlKCAnLi4vcG9ydC9wb3J0LmpzJyApO1xuXG5yZXF1aXJlKCAnLi9yZXNpc3Rvci9yZXNpc3Rvci5qcycgKTtcbnJlcXVpcmUoICcuL2pGZXRQL2pGZXRQLmpzJyApO1xucmVxdWlyZSggJy4vb3BBbXAvb3BBbXAuanMnICk7XG5yZXF1aXJlKCAnLi9kaW9kZS9kaW9kZS5qcycgKTtcbnJlcXVpcmUoICcuL2NhcGFjaXRvci9jYXBhY2l0b3IuanMnICk7XG5yZXF1aXJlKCAnLi9pbmR1Y3Rvci9pbmR1Y3Rvci5qcycgKTtcblxucmVxdWlyZSggJy4vYm94L2JveC5qcycgKTtcblxudmFyIHN5bWJvbHNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scycsIFtcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbFNlcnZpY2VzJyxcblxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ucG9ydCcsXG5cbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMucmVzaXN0b3InLFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5qRmV0UCcsXG4gICAgICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLm9wQW1wJyxcbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuZGlvZGUnLFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5jYXBhY2l0b3InLFxuICAgICAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5pbmR1Y3RvcicsXG5cbiAgICAgICAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuYm94J1xuXG4gICAgXSApO1xuXG5zeW1ib2xzTW9kdWxlLmNvbnRyb2xsZXIoXG4gICAgJ1N5bWJvbENvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcblxuICAgICAgICAkc2NvcGUuZ2V0U3ltYm9sVHJhbnNmb3JtID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtU3RyaW5nO1xuXG4gICAgICAgICAgICAvLyAgICB0cmFuc2Zvcm1TdHJpbmcgPSAndHJhbnNsYXRlKCcgKyAkc2NvcGUuY29tcG9uZW50LnggKyAnLCcgKyAkc2NvcGUuY29tcG9uZW50LnkgKyAnKSAnO1xuICAgICAgICAgICAgLy8gICAgdHJhbnNmb3JtU3RyaW5nICs9XG4gICAgICAgICAgICAvLyAgICAgICdyb3RhdGUoJyArICRzY29wZS5jb21wb25lbnQucm90YXRpb24gKyAnICcgKyAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC53aWR0aC8yICsgJyAnICsgJHNjb3BlLmNvbXBvbmVudC5zeW1ib2wuaGVpZ2h0LzIgICsgJykgJztcbiAgICAgICAgICAgIC8vICAgIC8vdHJhbnNmb3JtU3RyaW5nICs9ICdzY2FsZSgnICsgJHNjb3BlLmNvbXBvbmVudC5zY2FsZVggKyAnLCcgKyAkc2NvcGUuY29tcG9uZW50LnNjYWxlWSArICcpICc7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgY29uc29sZS5sb2coJHNjb3BlLmNvbXBvbmVudC5nZXRUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpLmpvaW4oJywgJykpO1xuXG4gICAgICAgICAgICB0cmFuc2Zvcm1TdHJpbmcgPSAnbWF0cml4KCcgKyAkc2NvcGUuY29tcG9uZW50LmdldFNWR1RyYW5zZm9ybWF0aW9uU3RyaW5nKCkgKyAnKSc7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1TdHJpbmc7XG4gICAgICAgIH07XG5cbiAgICB9ICk7XG5cbnN5bWJvbHNNb2R1bGUuZGlyZWN0aXZlKFxuICAgICdjb21wb25lbnRTeW1ib2wnLFxuXG4gICAgZnVuY3Rpb24gKCAkY29tcGlsZSApIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICc9JyxcbiAgICAgICAgICAgICAgICB0ZXN0OiAnPScsXG4gICAgICAgICAgICAgICAgcGFnZTogJz0nLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlOiAnPSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTeW1ib2xDb250cm9sbGVyJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvY29tcG9uZW50U3ltYm9sLmh0bWwnLFxuICAgICAgICAgICAgdGVtcGxhdGVOYW1lc3BhY2U6ICdTVkcnLFxuICAgICAgICAgICAgcmVxdWlyZTogWyAnXnN2Z0RpYWdyYW0nLCAnXmRpYWdyYW1Db250YWluZXInIF0sXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoIHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzLCBjb250cm9sbGVycyApIHtcblxuICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZVN0cixcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGUsXG5cbiAgICAgICAgICAgICAgICAgICAgZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLFxuXG4gICAgICAgICAgICAgICAgICAgICRlbCxcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRTeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbENvbXBvbmVudDtcblxuICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyID0gY29udHJvbGxlcnNbIDAgXTtcbiAgICAgICAgICAgICAgICBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlciA9IGNvbnRyb2xsZXJzWyAxIF07XG5cbiAgICAgICAgICAgICAgICBzY29wZS5wb3J0c1Zpc2libGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzY29wZS5kZXRhaWxzVmlzaWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLmdldFpvb21MZXZlbCgpID4gMTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgc2NvcGUuZ2V0Q3NzQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBzY29wZS5jb21wb25lbnQuc3ltYm9sLnR5cGU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5pc0NvbXBvbmVudFNlbGVjdGVkKCBzY29wZS5jb21wb25lbnQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSAnIHNlbGVjdGVkJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gSW50ZXJhY3Rpb25zXG5cbiAgICAgICAgICAgICAgICBzY29wZS5vbkNsaWNrID0gZnVuY3Rpb24gKCAkZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uQ29tcG9uZW50Q2xpY2soIHNjb3BlLmNvbXBvbmVudCwgJGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLm9uTW91c2VEb3duID0gZnVuY3Rpb24gKCAkZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uQ29tcG9uZW50TW91c2VEb3duKCBzY29wZS5jb21wb25lbnQsICRldmVudCApO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzeW1ib2xDb21wb25lbnQgPSBzY29wZS5jb21wb25lbnQuc3ltYm9sLnN5bWJvbENvbXBvbmVudCB8fCAnZ2VuZXJpYy1zdmcnO1xuXG4gICAgICAgICAgICAgICAgY29tcGlsZWRTeW1ib2wgPSBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5nZXRDb21waWxlZERpcmVjdGl2ZSggc3ltYm9sQ29tcG9uZW50ICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoICFhbmd1bGFyLmlzRnVuY3Rpb24oIGNvbXBpbGVkU3ltYm9sICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVTdHIgPSAnPCcgKyBzeW1ib2xDb21wb25lbnQgKyAnPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvJyArIHN5bWJvbENvbXBvbmVudCArICc+JztcblxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IGFuZ3VsYXIuZWxlbWVudCggdGVtcGxhdGVTdHIgKTtcblxuICAgICAgICAgICAgICAgICAgICBjb21waWxlZFN5bWJvbCA9ICRjb21waWxlKCB0ZW1wbGF0ZSApO1xuXG4gICAgICAgICAgICAgICAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLnNldENvbXBpbGVkRGlyZWN0aXZlKCBzeW1ib2xDb21wb25lbnQsIGNvbXBpbGVkU3ltYm9sICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkZWwgPSAkKCBlbGVtZW50ICk7XG5cbiAgICAgICAgICAgICAgICBjb21waWxlZFN5bWJvbCggc2NvcGUsIGZ1bmN0aW9uICggY2xvbmVkRWxlbWVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgJGVsLmZpbmQoICcuc3ltYm9sLXBsYWNlaG9sZGVyJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZVdpdGgoIGNsb25lZEVsZW1lbnQgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5yZWdpc3RlckNvbXBvbmVudEVsZW1lbnQoIHNjb3BlLmNvbXBvbmVudC5pZCwgJGVsICk7XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kb24oICckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIudW5yZWdpc3RlckNvbXBvbmVudEVsZW1lbnQoIHNjb3BlLmNvbXBvbmVudC5pZCApO1xuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbik7XG5cbnN5bWJvbHNNb2R1bGUuZGlyZWN0aXZlKFxuICAgICdnZW5lcmljU3ZnJyxcblxuICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL2dlbmVyaWNTdmcuaHRtbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgICAgICAgfTtcbiAgICB9XG4pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5kaW9kZScsIFtdXG4pXG4gICAgLmNvbmZpZyggWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKCBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIgKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZGlvZGUnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tZGlvZGUnLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnRCcsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLThcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA2MCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDE1LFxuICAgICAgICAgICAgICAgIHBvcnRzOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdDJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDJyxcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogN1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdBJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0EnLFxuICAgICAgICAgICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgICAgICAgICAgeTogN1xuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5pbmR1Y3RvcicsIFtdXG4pXG4gICAgLmNvbmZpZyggWyAnc3ltYm9sTWFuYWdlclByb3ZpZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKCBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIgKSB7XG4gICAgICAgICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnaW5kdWN0b3InLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24taW5kdWN0b3InLFxuICAgICAgICAgICAgICAgIGxhYmVsUHJlZml4OiAnTCcsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiAxMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLThcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgICAgICAgIHBvcnRzOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdwMScsXG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDYuNVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdwMicsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAncDInLFxuICAgICAgICAgICAgICAgICAgICB4OiA1MCxcbiAgICAgICAgICAgICAgICAgICAgeTogNi41XG4gICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICBdICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmpGZXRQJywgW11cbilcbiAgICAuY29uZmlnKCBbICdzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICBmdW5jdGlvbiAoIHN5bWJvbE1hbmFnZXJQcm92aWRlciApIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCgge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdqRmV0UCcsXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiBudWxsLFxuICAgICAgICAgICAgICAgIHN2Z0RlY29yYXRpb246ICdpbWFnZXMvc3ltYm9scy5zdmcjaWNvbi1qRmV0UCcsXG4gICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICdRJyxcbiAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDYwLFxuICAgICAgICAgICAgICAgICAgICB5OiAxMlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2lkdGg6IDYyLFxuICAgICAgICAgICAgICAgIGhlaWdodDogNzAsXG4gICAgICAgICAgICAgICAgcG9ydHM6IFsge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ3MnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDI3MCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUycsXG4gICAgICAgICAgICAgICAgICAgIHg6IDQ2LFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ2QnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDkwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEJyxcbiAgICAgICAgICAgICAgICAgICAgeDogNDYsXG4gICAgICAgICAgICAgICAgICAgIHk6IDcwXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ2cnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRycsXG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDI2XG4gICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICBdICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLm9wQW1wJywgW11cbilcbiAgICAuY29uZmlnKCBbICdzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICBmdW5jdGlvbiAoIHN5bWJvbE1hbmFnZXJQcm92aWRlciApIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCgge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdvcEFtcCcsXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiBudWxsLFxuICAgICAgICAgICAgICAgIHN2Z0RlY29yYXRpb246ICdpbWFnZXMvc3ltYm9scy5zdmcjaWNvbi1vcEFtcCcsXG4gICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICdBJyxcbiAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDkwLFxuICAgICAgICAgICAgICAgICAgICB5OiAxNVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgICAgICBwb3J0czogWyB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnVnMrJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAyNzAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZzKycsXG4gICAgICAgICAgICAgICAgICAgIHg6IDY1LFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ1ZvdXQnLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZvdXQnLFxuICAgICAgICAgICAgICAgICAgICB4OiAxNDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDUwXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ1ZzLScsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogOTAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZzLScsXG4gICAgICAgICAgICAgICAgICAgIHg6IDY1LFxuICAgICAgICAgICAgICAgICAgICB5OiAxMDBcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnVi0nLFxuICAgICAgICAgICAgICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVi0nLFxuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiA3NVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdWKycsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWKycsXG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDI1XG4gICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICBdICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLnJlc2lzdG9yJywgW11cbilcbiAgICAuY29uZmlnKCBbICdzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLFxuICAgICAgICBmdW5jdGlvbiAoIHN5bWJvbE1hbmFnZXJQcm92aWRlciApIHtcbiAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCgge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdyZXNpc3RvcicsXG4gICAgICAgICAgICAgICAgc3ltYm9sQ29tcG9uZW50OiBudWxsLFxuICAgICAgICAgICAgICAgIHN2Z0RlY29yYXRpb246ICdpbWFnZXMvc3ltYm9scy5zdmcjaWNvbi1yZXNpc3RvcicsXG4gICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICdSJyxcbiAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDEwLFxuICAgICAgICAgICAgICAgICAgICB5OiAtOFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2lkdGg6IDYwLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMTAsXG4gICAgICAgICAgICAgICAgcG9ydHM6IFsge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ3AxJyxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ3AxJyxcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogNVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdwMicsXG4gICAgICAgICAgICAgICAgICAgIHdpcmVBbmdsZTogMCxcbiAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAncDInLFxuICAgICAgICAgICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgICAgICAgICAgeTogNVxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2xNYXRyaXggPSByZXF1aXJlKCAnZ2xNYXRyaXgnICk7XG5cbnZhciBDb21wb25lbnRQb3J0ID0gZnVuY3Rpb24gKCBkZXNjcmlwdG9yICkge1xuXG4gICAgYW5ndWxhci5leHRlbmQoIHRoaXMsIGRlc2NyaXB0b3IgKTtcblxufTtcblxuQ29tcG9uZW50UG9ydC5wcm90b3R5cGUuZ2V0R3JpZFBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHBvc2l0aW9uLFxuICAgICAgICBwb3NpdGlvblZlY3RvcjtcblxuICAgIGlmICggYW5ndWxhci5pc09iamVjdCggdGhpcy5wb3J0U3ltYm9sICkgJiYgYW5ndWxhci5pc09iamVjdCggdGhpcy5wYXJlbnRDb21wb25lbnQgKSApIHtcblxuICAgICAgICBwb3NpdGlvblZlY3RvciA9IGdsTWF0cml4LnZlYzIuY3JlYXRlKCk7XG4gICAgICAgIGdsTWF0cml4LnZlYzIuc2V0KCBwb3NpdGlvblZlY3RvciwgdGhpcy5wb3J0U3ltYm9sLngsIHRoaXMucG9ydFN5bWJvbC55ICk7XG5cbiAgICAgICAgZ2xNYXRyaXgudmVjMi50cmFuc2Zvcm1NYXQzKCBwb3NpdGlvblZlY3RvciwgcG9zaXRpb25WZWN0b3IsIHRoaXMucGFyZW50Q29tcG9uZW50LmdldFRyYW5zZm9ybWF0aW9uTWF0cml4KCkgKTtcblxuICAgICAgICBwb3NpdGlvbiA9IHtcblxuICAgICAgICAgICAgeDogcG9zaXRpb25WZWN0b3JbIDAgXSxcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uVmVjdG9yWyAxIF1cblxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9uO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudFBvcnQ7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBnbE1hdHJpeCA9IHJlcXVpcmUoICdnbE1hdHJpeCcgKTtcblxudmFyIERpYWdyYW1Db21wb25lbnQgPSBmdW5jdGlvbiAoIGRlc2NyaXB0b3IgKSB7XG5cbiAgICBpZiAoICFhbmd1bGFyLmlzT2JqZWN0KCBkZXNjcmlwdG9yLnN5bWJvbCApICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdObyBzeW1ib2wgZm91bmQgZm9yIGNvbXBvbmVudCAnICsgdGhpcy5pZCApO1xuICAgIH1cblxuICAgIGFuZ3VsYXIuZXh0ZW5kKCB0aGlzLCBkZXNjcmlwdG9yICk7XG5cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmlzSW5WaWV3UG9ydCA9IGZ1bmN0aW9uICggdmlld1BvcnQsIHBhZGRpbmcgKSB7XG5cbiAgICAvL1RPRE86IGNvdW50IHdpZHRoIGFuZCBoZWlnaHQgZm9yIG9yaWVudGF0aW9uXG4gICAgcGFkZGluZyA9IHBhZGRpbmcgfHwge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIGFuZ3VsYXIuaXNPYmplY3QoIHZpZXdQb3J0ICkgJiZcbiAgICAgICAgdGhpcy54ICsgdGhpcy5zeW1ib2wud2lkdGggPj0gKCB2aWV3UG9ydC5sZWZ0ICsgcGFkZGluZy54ICkgJiZcbiAgICAgICAgdGhpcy54IDw9ICggdmlld1BvcnQucmlnaHQgLSBwYWRkaW5nLnggKSAmJlxuICAgICAgICB0aGlzLnkgKyB0aGlzLnN5bWJvbC5oZWlnaHQgPj0gKCB2aWV3UG9ydC50b3AgKyBwYWRkaW5nLnkgKSAmJlxuICAgICAgICB0aGlzLnkgPD0gKCB2aWV3UG9ydC5ib3R0b20gLSBwYWRkaW5nLnkgKSApO1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtYXRpb25NYXRyaXggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoICFhbmd1bGFyLmlzQXJyYXkoIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggKSApIHtcbiAgICAgICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4O1xuXG59O1xuXG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmdldFNWR1RyYW5zZm9ybWF0aW9uTWF0cml4ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCAhYW5ndWxhci5pc0FycmF5KCB0aGlzLnN2Z1RyYW5zZm9ybWF0aW9uTWF0cml4ICkgKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdmdUcmFuc2Zvcm1hdGlvbk1hdHJpeDtcblxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0U1ZHVHJhbnNmb3JtYXRpb25TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgdHJhbnNNYXRyaXggPSB0aGlzLmdldFNWR1RyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG5cbiAgICByZXR1cm4gdHJhbnNNYXRyaXguam9pbiggJywgJyApO1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgcm90YXRpb25SYWQsXG4gICAgICAgIC8vc2luQSwgY29zQSxcbiAgICAgICAgdHJhbnNsYXRpb24sXG4gICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgIHJlc3VsdDtcblxuICAgIGlmICggYW5ndWxhci5pc051bWJlciggdGhpcy5yb3RhdGlvbiApICYmXG4gICAgICAgIGFuZ3VsYXIuaXNOdW1iZXIoIHRoaXMueCApLFxuICAgICAgICBhbmd1bGFyLmlzTnVtYmVyKCB0aGlzLnkgKSApIHtcblxuICAgICAgICByb3RhdGlvblJhZCA9IHRoaXMucm90YXRpb24gLyAxODAgKiBNYXRoLlBJO1xuXG4gICAgICAgIHRyYW5zZm9ybU1hdDMgPSBnbE1hdHJpeC5tYXQzLmNyZWF0ZSgpO1xuXG4gICAgICAgIHRyYW5zbGF0aW9uID0gZ2xNYXRyaXgudmVjMi5jcmVhdGUoKTtcbiAgICAgICAgZ2xNYXRyaXgudmVjMi5zZXQoIHRyYW5zbGF0aW9uLCB0aGlzLngsIHRoaXMueSApO1xuXG4gICAgICAgIGdsTWF0cml4Lm1hdDMudHJhbnNsYXRlKFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0MyxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICB0cmFuc2xhdGlvblxuICAgICAgICApO1xuXG4gICAgICAgIGdsTWF0cml4Lm1hdDMucm90YXRlKFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0MyxcbiAgICAgICAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICAgICAgICByb3RhdGlvblJhZFxuICAgICAgICApO1xuXG4gICAgICAgIC8vICAgIHNpbkEgPSBNYXRoLnNpbihyb3RhdGlvblJhZCk7XG4gICAgICAgIC8vICAgIGNvc0EgPSBNYXRoLmNvcyhyb3RhdGlvblJhZCk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggPSBbXG4gICAgICAgIC8vICAgICAgdGhpcy5zY2FsZVggKiBjb3NBLFxuICAgICAgICAvLyAgICAgIHNpbkEsXG4gICAgICAgIC8vICAgICAgLXNpbkEsXG4gICAgICAgIC8vICAgICAgdGhpcy5zY2FsZVkgKiBjb3NBLFxuICAgICAgICAvLyAgICAgIHRoaXMueCxcbiAgICAgICAgLy8gICAgICB0aGlzLnlcbiAgICAgICAgLy8gICAgXTtcblxuICAgICAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ID0gdHJhbnNmb3JtTWF0MztcblxuICAgICAgICB0aGlzLnN2Z1RyYW5zZm9ybWF0aW9uTWF0cml4ID0gW1xuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgMCBdLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgMSBdLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgMyBdLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgNCBdLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgNiBdLFxuICAgICAgICAgICAgdHJhbnNmb3JtTWF0M1sgNyBdXG4gICAgICAgIF07XG5cbiAgICAgICAgcmVzdWx0ID0gdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeDtcblxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG5cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24gKCB4LCB5ICkge1xuXG4gICAgaWYgKCBhbmd1bGFyLmlzTnVtYmVyKCB4ICkgJiYgYW5ndWxhci5pc051bWJlciggeSApICkge1xuXG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQ29vcmRpbmF0ZXMgbXVzdCBiZSBudW1iZXJzIScgKTtcbiAgICB9XG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbiAoIGFuZ2xlICkge1xuXG4gICAgaWYgKCBhbmd1bGFyLmlzTnVtYmVyKCBhbmdsZSApICkge1xuXG4gICAgICAgIHRoaXMucm90YXRpb24gKz0gYW5nbGU7XG5cbiAgICAgICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQW5nbGUgbXVzdCBiZSBudW1iZXIhJyApO1xuICAgIH1cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLnJlZ2lzdGVyUG9ydEluc3RhbmNlcyA9IGZ1bmN0aW9uICggbmV3UG9ydHMgKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnBvcnRJbnN0YW5jZXMgPSB0aGlzLnBvcnRJbnN0YW5jZXMgfHwgW107XG5cbiAgICBhbmd1bGFyLmZvckVhY2goIG5ld1BvcnRzLCBmdW5jdGlvbiAoIG5ld1BvcnQgKSB7XG5cbiAgICAgICAgbmV3UG9ydC5wYXJlbnRDb21wb25lbnQgPSBzZWxmO1xuICAgICAgICBzZWxmLnBvcnRJbnN0YW5jZXMucHVzaCggbmV3UG9ydCApO1xuXG4gICAgfSApO1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtZWREaW1lbnNpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vICB2YXIgd2lkdGgsIGhlaWdodDtcbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLmxvY2FsVG9HbG9iYWwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoICF0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ICkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ID0gdGhpcy5nZXRUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGlhZ3JhbUNvbXBvbmVudDsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFdpcmUgPSBmdW5jdGlvbiAoIGRlc2NyaXB0b3IgKSB7XG5cbiAgICBhbmd1bGFyLmV4dGVuZCggdGhpcywgZGVzY3JpcHRvciApO1xuXG4gICAgdGhpcy5zZWdtZW50cyA9IFtdO1xuXG59O1xuXG5XaXJlLnByb3RvdHlwZS5pc0luVmlld1BvcnQgPSBmdW5jdGlvbiAoIHZpZXdQb3J0LCBwYWRkaW5nICkge1xuXG4gICAgdmFyIGosXG4gICAgICAgIHNob3VsZEJlVmlzaWJsZSxcbiAgICAgICAgc2VnbWVudDtcblxuICAgIHBhZGRpbmcgPSBwYWRkaW5nIHx8IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBzaG91bGRCZVZpc2libGUgPSBmYWxzZTtcblxuICAgIGlmICggdGhpcy5yb3V0ZXJUeXBlID09PSAnRWxib3dSb3V0ZXInICkge1xuXG4gICAgICAgIGlmICggYW5ndWxhci5pc0FycmF5KCB0aGlzLnNlZ21lbnRzICkgKSB7XG5cbiAgICAgICAgICAgIGZvciAoIGogPSAwOyBqIDwgdGhpcy5zZWdtZW50cy5sZW5ndGggJiYgIXNob3VsZEJlVmlzaWJsZTsgaisrICkge1xuXG4gICAgICAgICAgICAgICAgc2VnbWVudCA9IHRoaXMuc2VnbWVudHNbIGogXTtcblxuICAgICAgICAgICAgICAgIGlmICggc2VnbWVudC5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJyApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIHNlZ21lbnQueDEgPj0gKCB2aWV3UG9ydC5sZWZ0ICsgcGFkZGluZy54ICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQueDEgPD0gKCB2aWV3UG9ydC5yaWdodCAtIHBhZGRpbmcueCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIHNlZ21lbnQueTEgPj0gKCB2aWV3UG9ydC50b3AgKyBwYWRkaW5nLnkgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudC55MSA8PSAoIHZpZXdQb3J0LmJvdHRvbSAtIHBhZGRpbmcueSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2hvdWxkQmVWaXNpYmxlO1xuXG59O1xuXG5XaXJlLnByb3RvdHlwZS5nZXRFbmRQb3NpdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgcG9ydDFQb3NpdGlvbixcbiAgICAgICAgcG9ydDJQb3NpdGlvbjtcblxuICAgIHBvcnQxUG9zaXRpb24gPSB0aGlzLmVuZDEucG9ydC5nZXRHcmlkUG9zaXRpb24oKTtcbiAgICBwb3J0MlBvc2l0aW9uID0gdGhpcy5lbmQyLnBvcnQuZ2V0R3JpZFBvc2l0aW9uKCk7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGVuZDE6IHBvcnQxUG9zaXRpb24sXG4gICAgICAgIGVuZDI6IHBvcnQyUG9zaXRpb25cblxuICAgIH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gV2lyZTsiLCIvKmdsb2JhbHMgYW5ndWxhciAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5hbmd1bGFyLm1vZHVsZSggJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRpYWdyYW1TZXJ2aWNlJywgW1xuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xTZXJ2aWNlcydcbl0gKVxuICAgIC5jb25maWcoIFsgJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uICggc3ltYm9sTWFuYWdlclByb3ZpZGVyICkge1xuXG4gICAgICAgICAgICB2YXIgcmFuZG9tU3ltYm9sR2VuZXJhdG9yLFxuICAgICAgICAgICAgICAgIGtpbmRzID0gNztcblxuICAgICAgICAgICAgcmFuZG9tU3ltYm9sR2VuZXJhdG9yID0gZnVuY3Rpb24gKCBjb3VudCApIHtcblxuICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICBwb3J0Q291bnQsXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgbWFrZUFSYW5kb21TeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgIG1ha2VTb21lUG9ydHMsXG4gICAgICAgICAgICAgICAgICAgIG1pblBvcnRzID0gNixcbiAgICAgICAgICAgICAgICAgICAgbWF4UG9ydHMgPSAzMCxcbiAgICAgICAgICAgICAgICAgICAgcG9ydFdpcmVMZW5ndGggPSAyMCxcblxuICAgICAgICAgICAgICAgICAgICBzcHJlYWRQb3J0c0Fsb25nU2lkZTtcblxuICAgICAgICAgICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlID0gZnVuY3Rpb24gKCBzb21lUG9ydHMsIHNpZGUsIHdpZHRoLCBoZWlnaHQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAyICogcG9ydFdpcmVMZW5ndGg7XG5cbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBzb21lUG9ydHMsIGZ1bmN0aW9uICggYVBvcnQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoIHNpZGUgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQueCA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC55ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC53aXJlQW5nbGUgPSAtOTA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gd2lkdGggLyAoIHNvbWVQb3J0cy5sZW5ndGggKyAyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LnggPSB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC55ID0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gaGVpZ2h0IC8gKCBzb21lUG9ydHMubGVuZ3RoICsgMiApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQueCA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhUG9ydC55ID0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDkwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHdpZHRoIC8gKCBzb21lUG9ydHMubGVuZ3RoICsgMiApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LnggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFQb3J0LnkgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYVBvcnQud2lyZUFuZ2xlID0gMTgwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ICs9IGhlaWdodCAvICggc29tZVBvcnRzLmxlbmd0aCArIDIgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgfTtcblxuXG4gICAgICAgICAgICAgICAgbWFrZVNvbWVQb3J0cyA9IGZ1bmN0aW9uICggY291bnRPZlBvcnRzICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwb3J0cyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBib3R0b20gPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoLCBoZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWRlcyA9IFsgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0IF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0U3BhY2luZyA9IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGggPSAxNDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5IZWlnaHQgPSA4MDtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNvdW50T2ZQb3J0czsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncF8nICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BvcnQtJyArIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lyZUxlYWRJbjogMjBcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9IE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAzICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZGVzWyBwbGFjZW1lbnQgXS5wdXNoKCBwb3J0ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydFNwYWNpbmcgKiB0b3AubGVuZ3RoICsgNCAqIHBvcnRXaXJlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydFNwYWNpbmcgKiBib3R0b20ubGVuZ3RoICsgNCAqIHBvcnRXaXJlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRTcGFjaW5nICogbGVmdC5sZW5ndGggKyA0ICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0U3BhY2luZyAqIHJpZ2h0Lmxlbmd0aCArIDQgKiBwb3J0V2lyZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodFxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKCB0b3AsICd0b3AnLCB3aWR0aCwgaGVpZ2h0ICk7XG4gICAgICAgICAgICAgICAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKCByaWdodCwgJ3JpZ2h0Jywgd2lkdGgsIGhlaWdodCApO1xuICAgICAgICAgICAgICAgICAgICBzcHJlYWRQb3J0c0Fsb25nU2lkZSggYm90dG9tLCAnYm90dG9tJywgd2lkdGgsIGhlaWdodCApO1xuICAgICAgICAgICAgICAgICAgICBzcHJlYWRQb3J0c0Fsb25nU2lkZSggbGVmdCwgJ2xlZnQnLCB3aWR0aCwgaGVpZ2h0ICk7XG5cblxuICAgICAgICAgICAgICAgICAgICBwb3J0cyA9IHBvcnRzLmNvbmNhdCggdG9wIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb25jYXQoIHJpZ2h0IClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb25jYXQoIGJvdHRvbSApXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29uY2F0KCBsZWZ0ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRzOiBwb3J0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgbWFrZUFSYW5kb21TeW1ib2wgPSBmdW5jdGlvbiAoIGlkUG9zdGZpeCwgY291bnRPZlBvcnRzICkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwb3J0c0FuZFNpemVzID0gbWFrZVNvbWVQb3J0cyggY291bnRPZlBvcnRzICk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHN5bWJvbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdyYW5kb21fJyArIGlkUG9zdGZpeCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbENvbXBvbmVudDogJ2JveCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdmdEZWNvcmF0aW9uOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxQcmVmaXg6ICdSTkRfJyArIGNvdW50T2ZQb3J0cyArICdfJyArIGlkUG9zdGZpeCArICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBwb3J0V2lyZUxlbmd0aCArIDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBvcnRXaXJlTGVuZ3RoICsgMjBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0V2lyZUxlbmd0aDogcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogcG9ydHNBbmRTaXplcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogcG9ydHNBbmRTaXplcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0czogcG9ydHNBbmRTaXplcy5wb3J0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveEhlaWdodDogcG9ydHNBbmRTaXplcy5oZWlnaHQgLSAyICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hXaWR0aDogcG9ydHNBbmRTaXplcy53aWR0aCAtIDIgKiBwb3J0V2lyZUxlbmd0aFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgZGVidWdnZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN5bWJvbDtcblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNvdW50OyBpKysgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgcG9ydENvdW50ID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogbWF4UG9ydHMgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pblBvcnRzXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sID0gbWFrZUFSYW5kb21TeW1ib2woIGksIHBvcnRDb3VudCApO1xuXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCggc3ltYm9sICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJhbmRvbVN5bWJvbEdlbmVyYXRvcigga2luZHMgKTtcblxuICAgICAgICB9XG4gICAgXSApXG4gICAgLnNlcnZpY2UoICdkaWFncmFtU2VydmljZScsIFtcbiAgICAgICAgJyRxJyxcbiAgICAgICAgJyR0aW1lb3V0JyxcbiAgICAgICAgJ3N5bWJvbE1hbmFnZXInLFxuICAgICAgICAnd2lyaW5nU2VydmljZScsXG4gICAgICAgIGZ1bmN0aW9uICggJHEsICR0aW1lb3V0LCBzeW1ib2xNYW5hZ2VyLCB3aXJpbmdTZXJ2aWNlICkge1xuXG4gICAgICAgICAgICB2YXJcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHMgPSBbXSxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzQnlJZCA9IHt9LFxuXG4gICAgICAgICAgICAgICAgd2lyZXMgPSBbXSxcbiAgICAgICAgICAgICAgICB3aXJlc0J5SWQgPSB7fSxcbiAgICAgICAgICAgICAgICB3aXJlc0J5Q29tcG9uZW50SWQgPSB7fSxcblxuICAgICAgICAgICAgICAgIHN5bWJvbFR5cGVzLFxuXG4gICAgICAgICAgICAgICAgcmVnaXN0ZXJXaXJlRm9yRW5kcyxcblxuICAgICAgICAgICAgICAgIERpYWdyYW1Db21wb25lbnQgPSByZXF1aXJlKCAnLi9jbGFzc2VzL0RpYWdyYW1Db21wb25lbnQuanMnICksXG4gICAgICAgICAgICAgICAgQ29tcG9uZW50UG9ydCA9IHJlcXVpcmUoICcuL2NsYXNzZXMvQ29tcG9uZW50UG9ydCcgKSxcbiAgICAgICAgICAgICAgICBXaXJlID0gcmVxdWlyZSggJy4vY2xhc3Nlcy9XaXJlLmpzJyApO1xuXG4gICAgICAgICAgICBzeW1ib2xUeXBlcyA9IHN5bWJvbE1hbmFnZXIuZ2V0QXZhaWxhYmxlU3ltYm9scygpO1xuXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlRHVtbXlEaWFncmFtID0gZnVuY3Rpb24gKCBjb3VudE9mQm94ZXMsIGNvdW50T2ZXaXJlcywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCApIHtcblxuICAgICAgICAgICAgICAgIHZhciBpLCBpZCxcbiAgICAgICAgICAgICAgICAgICAgY291bnRPZlR5cGVzLFxuICAgICAgICAgICAgICAgICAgICBzeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgIHR5cGVJZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgeCxcbiAgICAgICAgICAgICAgICAgICAgeSxcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sVHlwZUlkcyxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50MSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50MixcbiAgICAgICAgICAgICAgICAgICAgcG9ydDEsXG4gICAgICAgICAgICAgICAgICAgIHBvcnQyLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkUG9ydHMsXG4gICAgICAgICAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQsXG5cbiAgICAgICAgICAgICAgICAgICAgcG9ydENyZWF0b3IsXG5cbiAgICAgICAgICAgICAgICAgICAgd2lyZTtcblxuICAgICAgICAgICAgICAgIHBvcnRDcmVhdG9yID0gZnVuY3Rpb24gKCBjb21wb25lbnRJZCwgcG9ydHMgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBvcnRJbnN0YW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRJbnN0YW5jZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0TWFwcGluZztcblxuICAgICAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHBvcnRNYXBwaW5nID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBwb3J0cywgZnVuY3Rpb24gKCBwb3J0ICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2UgPSBuZXcgQ29tcG9uZW50UG9ydCgge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCArICdfJyArIHBvcnQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9ydFN5bWJvbDogcG9ydFxuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0SW5zdGFuY2VzLnB1c2goIHBvcnRJbnN0YW5jZSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0TWFwcGluZ1sgcG9ydC5pZCBdID0gcG9ydEluc3RhbmNlLmlkO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRJbnN0YW5jZXM6IHBvcnRJbnN0YW5jZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3J0TWFwcGluZzogcG9ydE1hcHBpbmdcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzeW1ib2xUeXBlSWRzID0gT2JqZWN0LmtleXMoIHN5bWJvbFR5cGVzICk7XG5cbiAgICAgICAgICAgICAgICBjb3VudE9mVHlwZXMgPSBzeW1ib2xUeXBlSWRzLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzQnlJZCA9IHt9O1xuXG4gICAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBjb3VudE9mQm94ZXM7IGkrKyApIHtcblxuICAgICAgICAgICAgICAgICAgICB0eXBlSWQgPSBzeW1ib2xUeXBlSWRzWyBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogY291bnRPZlR5cGVzICkgXTtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9IHN5bWJvbFR5cGVzWyB0eXBlSWQgXTtcblxuICAgICAgICAgICAgICAgICAgICB4ID0gTWF0aC5yb3VuZCggTWF0aC5yYW5kb20oKSAqICggY2FudmFzV2lkdGggLSAxICkgKTtcbiAgICAgICAgICAgICAgICAgICAgeSA9IE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAoIGNhbnZhc0hlaWdodCAtIDEgKSApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlkID0gJ2NvbXBvbmVudF8nICsgdHlwZUlkICsgJ18nICsgaTtcblxuICAgICAgICAgICAgICAgICAgICBzeW1ib2wgPSBzeW1ib2xNYW5hZ2VyLmdldFN5bWJvbCggdHlwZUlkICk7XG5cbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZFBvcnRzID0gcG9ydENyZWF0b3IoIGlkLCBzeW1ib2wucG9ydHMgKTtcblxuICAgICAgICAgICAgICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50ID0gbmV3IERpYWdyYW1Db21wb25lbnQoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0eXBlLmxhYmVsUHJlZml4ICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgICAgICAgICAgejogaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uOiBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogNDAgKSAqIDkwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVYOiAxLCAvL1sxLCAtMV1bTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZVk6IDEsIC8vWzEsIC0xXVtNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbDogc3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9uU2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbkxvY2tlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgc3ltYm9sQ29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIHg6ICd4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgeTogJ3knLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBsYWJlbDogJ2xhYmVsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgcm90YXRpb246ICdyb3RhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIHNjYWxlWDogJ3NjYWxlWCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIHNjYWxlWTogJ3NjYWxlWScsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIHBvcnRzOiAncG9ydEluc3RhbmNlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIHBvcnRNYXBwaW5nOiBjcmVhdGVkUG9ydHMucG9ydE1hcHBpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQucmVnaXN0ZXJQb3J0SW5zdGFuY2VzKCBjcmVhdGVkUG9ydHMucG9ydEluc3RhbmNlcyApO1xuXG4gICAgICAgICAgICAgICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmFkZENvbXBvbmVudCggbmV3RGlhZ3JhbUNvbXBvbmVudCApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2lyZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB3aXJlc0J5SWQgPSB7fTtcblxuICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY291bnRPZldpcmVzOyBpKysgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWQgPSAnd2lyZV8nICsgaTtcblxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQxID0gY29tcG9uZW50cy5nZXRSYW5kb21FbGVtZW50KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcG9ydDEgPSBjb21wb25lbnQxLnBvcnRJbnN0YW5jZXMuZ2V0UmFuZG9tRWxlbWVudCgpO1xuICAgICAgICAgICAgICAgICAgICBwb3J0MiA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoICFhbmd1bGFyLmlzRGVmaW5lZCggcG9ydDIgKSB8fCBwb3J0MSA9PT0gcG9ydDIgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDIgPSBjb21wb25lbnRzLmdldFJhbmRvbUVsZW1lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcnQyID0gY29tcG9uZW50Mi5wb3J0SW5zdGFuY2VzLmdldFJhbmRvbUVsZW1lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHdpcmUgPSBuZXcgV2lyZSgge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50MSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0OiBwb3J0MVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9ydDogcG9ydDJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgIHdpcmluZ1NlcnZpY2Uucm91dGVXaXJlKCB3aXJlLCAnRWxib3dSb3V0ZXInICk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRXaXJlKCB3aXJlICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50ID0gZnVuY3Rpb24gKCBhRGlhZ3JhbUNvbXBvbmVudCApIHtcblxuICAgICAgICAgICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggYURpYWdyYW1Db21wb25lbnQgKSAmJiAhYW5ndWxhci5pc0RlZmluZWQoIGNvbXBvbmVudHNCeUlkWyBhRGlhZ3JhbUNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICAuaWQgXSApICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHNCeUlkWyBhRGlhZ3JhbUNvbXBvbmVudC5pZCBdID0gYURpYWdyYW1Db21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaCggYURpYWdyYW1Db21wb25lbnQgKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVnaXN0ZXJXaXJlRm9yRW5kcyA9IGZ1bmN0aW9uICggd2lyZSApIHtcblxuICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRJZDtcblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudElkID0gd2lyZS5lbmQxLmNvbXBvbmVudC5pZDtcblxuICAgICAgICAgICAgICAgIHdpcmVzQnlDb21wb25lbnRJZFsgY29tcG9uZW50SWQgXSA9IHdpcmVzQnlDb21wb25lbnRJZFsgY29tcG9uZW50SWQgXSB8fCBbXTtcblxuICAgICAgICAgICAgICAgIGlmICggd2lyZXNCeUNvbXBvbmVudElkWyBjb21wb25lbnRJZCBdLmluZGV4T2YoIHdpcmUgKSA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpcmVzQnlDb21wb25lbnRJZFsgY29tcG9uZW50SWQgXS5wdXNoKCB3aXJlICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50SWQgPSB3aXJlLmVuZDIuY29tcG9uZW50LmlkO1xuXG4gICAgICAgICAgICAgICAgd2lyZXNCeUNvbXBvbmVudElkWyBjb21wb25lbnRJZCBdID0gd2lyZXNCeUNvbXBvbmVudElkWyBjb21wb25lbnRJZCBdIHx8IFtdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCB3aXJlc0J5Q29tcG9uZW50SWRbIGNvbXBvbmVudElkIF0uaW5kZXhPZiggd2lyZSApID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgd2lyZXNCeUNvbXBvbmVudElkWyBjb21wb25lbnRJZCBdLnB1c2goIHdpcmUgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuYWRkV2lyZSA9IGZ1bmN0aW9uICggYVdpcmUgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNPYmplY3QoIGFXaXJlICkgJiYgIWFuZ3VsYXIuaXNEZWZpbmVkKCB3aXJlc0J5SWRbIGFXaXJlLmlkIF0gKSApIHtcblxuICAgICAgICAgICAgICAgICAgICB3aXJlc0J5SWRbIGFXaXJlLmlkIF0gPSBhV2lyZTtcbiAgICAgICAgICAgICAgICAgICAgd2lyZXMucHVzaCggYVdpcmUgKTtcblxuICAgICAgICAgICAgICAgICAgICByZWdpc3RlcldpcmVGb3JFbmRzKCBhV2lyZSApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldFdpcmVzRm9yQ29tcG9uZW50cyA9IGZ1bmN0aW9uICggY29tcG9uZW50cyApIHtcblxuICAgICAgICAgICAgICAgIHZhciBzZXRPZldpcmVzID0gW107XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goIGNvbXBvbmVudHMsIGZ1bmN0aW9uICggY29tcG9uZW50ICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggd2lyZXNCeUNvbXBvbmVudElkWyBjb21wb25lbnQuaWQgXSwgZnVuY3Rpb24gKCB3aXJlICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHNldE9mV2lyZXMuaW5kZXhPZiggd2lyZSApID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRPZldpcmVzLnB1c2goIHdpcmUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldE9mV2lyZXM7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RGlhZ3JhbSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGNvbXBvbmVudHNCeUlkLFxuICAgICAgICAgICAgICAgICAgICB3aXJlczogd2lyZXNCeUlkLFxuICAgICAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWxsb3dTZWxlY3Rpb246IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmdldEhpZ2hlc3RaID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgICAgejtcblxuICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY29tcG9uZW50cy5sZW5ndGg7IGkrKyApIHtcblxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBjb21wb25lbnRzWyBpIF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCAhaXNOYU4oIGNvbXBvbmVudC56ICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggaXNOYU4oIHogKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6ID0gY29tcG9uZW50Lno7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB6IDwgY29tcG9uZW50LnogKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHogPSBjb21wb25lbnQuejtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCBpc05hTiggeiApICkge1xuICAgICAgICAgICAgICAgICAgICB6ID0gLTE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHo7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vdGhpcy5nZW5lcmF0ZUR1bW15RGlhZ3JhbSgyMDAwLCA1MDAsIDEwMDAwLCAxMDAwMCk7XG4gICAgICAgICAgICAvL3RoaXMuZ2VuZXJhdGVEdW1teURpYWdyYW0oMTAwMCwgMjAwMCwgMTAwMDAsIDEwMDAwKTtcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVEdW1teURpYWdyYW0oIDEwLCAyLCAxMjAwLCAxMjAwICk7XG5cbiAgICAgICAgfVxuICAgIF0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGdyaWRTZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5ncmlkU2VydmljZScsIFtdICk7XG5cbmdyaWRTZXJ2aWNlc01vZHVsZS5zZXJ2aWNlKCAnZ3JpZFNlcnZpY2UnLCBbICckbG9nJywgJyRyb290U2NvcGUnLCAnJHRpbWVvdXQnLFxuICAgIGZ1bmN0aW9uICggJGxvZywgJHJvb3RTY29wZSwgJHRpbWVvdXQgKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuXG4gICAgICAgICAgICBncmlkcyA9IHt9LFxuXG4gICAgICAgICAgICBudW1iZXJPZkNoYW5nZXNBbGxvd2VkSW5PbmVDeWNsZSA9IDIwMDAsXG4gICAgICAgICAgICByZWNhbGN1bGF0ZUN5Y2xlRGVsYXkgPSAxMCxcbiAgICAgICAgICAgIHZpZXdQb3J0UGFkZGluZyA9IHtcbiAgICAgICAgICAgICAgICB4OiAtMzAwLFxuICAgICAgICAgICAgICAgIHk6IC0yMDBcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzLFxuICAgICAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlV2lyZXM7XG5cbiAgICAgICAgcmVjYWxjdWxhdGVWaXNpYmxlV2lyZXMgPSBmdW5jdGlvbiAoIGdyaWQgKSB7XG5cbiAgICAgICAgICAgIHZhciBpbmRleDtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBncmlkLndpcmVzLCBmdW5jdGlvbiAoIHdpcmUgKSB7XG5cbiAgICAgICAgICAgICAgICBpbmRleCA9IGdyaWQudmlzaWJsZVdpcmVzLmluZGV4T2YoIHdpcmUgKTtcblxuXG4gICAgICAgICAgICAgICAgaWYgKCB3aXJlLmlzSW5WaWV3UG9ydCggZ3JpZC52aWV3UG9ydCwgdmlld1BvcnRQYWRkaW5nICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpbmRleCA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnZpc2libGVXaXJlcy5wdXNoKCB3aXJlICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpbmRleCA+IC0xICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZC52aXNpYmxlV2lyZXMuc3BsaWNlKCBpbmRleCwgMSApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgJGxvZy5kZWJ1ZyggJ051bWJlciBvZiB2aXNpYmxlIHdpcmVzOiAnICsgZ3JpZC52aXNpYmxlV2lyZXMubGVuZ3RoICk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyA9IGZ1bmN0aW9uICggZ3JpZCApIHtcblxuICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgICAgIGNvdW50T2ZDaGFuZ2VzID0gMCxcbiAgICAgICAgICAgICAgICBjaGFuZ2VzTGltaXRSZWFjaGVkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgaW5kZXg7XG5cbiAgICAgICAgICAgIGdyaWQuaW52aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNSZWNhbGN1bGF0ZSA9IHRydWU7XG5cblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBncmlkLmNvbXBvbmVudHMubGVuZ3RoICYmICFjaGFuZ2VzTGltaXRSZWFjaGVkOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50ID0gZ3JpZC5jb21wb25lbnRzWyBpIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goIGdyaWQuY29tcG9uZW50cywgZnVuY3Rpb24gKCBjb21wb25lbnQgKSB7XG5cbiAgICAgICAgICAgICAgICBpbmRleCA9IGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLmluZGV4T2YoIGNvbXBvbmVudCApO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBjb21wb25lbnQuaXNJblZpZXdQb3J0KCBncmlkLnZpZXdQb3J0LCB2aWV3UG9ydFBhZGRpbmcgKSApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGluZGV4ID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLnB1c2goIGNvbXBvbmVudCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRPZkNoYW5nZXMrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpbmRleCA+IC0xICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZC52aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMuc3BsaWNlKCBpbmRleCwgMSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb3VudE9mQ2hhbmdlcysrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCBjb3VudE9mQ2hhbmdlcyA+PSBudW1iZXJPZkNoYW5nZXNBbGxvd2VkSW5PbmVDeWNsZSApIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlc0xpbWl0UmVhY2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHNlbGYucmVvcmRlclZpc2libGVDb21wb25lbnRzKCBncmlkLmlkICk7XG5cbiAgICAgICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZVdpcmVzKCBncmlkICk7XG5cbiAgICAgICAgICAgICRsb2cuZGVidWcoICdOdW1iZXIgb2YgY2hhbmdlcyBjb21wYXJlZCB0byBwcmV2aW91cyBkaWFncmFtIHN0YXRlOicsIGNvdW50T2ZDaGFuZ2VzICk7XG5cbiAgICAgICAgICAgIGlmICggIWNoYW5nZXNMaW1pdFJlYWNoZWQgKSB7XG4gICAgICAgICAgICAgICAgZ3JpZC5pbnZpc2libGVEaWFncmFtQ29tcG9uZW50c1JlY2FsY3VsYXRlID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKCBncmlkICk7XG4gICAgICAgICAgICAgICAgfSwgcmVjYWxjdWxhdGVDeWNsZURlbGF5ICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmludmFsaWRhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMgPSBmdW5jdGlvbiAoIGdyaWRJZCApIHtcblxuICAgICAgICAgICAgdmFyIGdyaWQ7XG5cbiAgICAgICAgICAgIGdyaWQgPSBncmlkc1sgZ3JpZElkIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc0RlZmluZWQoIGdyaWQgKSApIHtcblxuICAgICAgICAgICAgICAgIGlmICggIWdyaWQuaW52aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNSZWNhbGN1bGF0ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY2FsY3VsYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKCBncmlkICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuY3JlYXRlR3JpZCA9IGZ1bmN0aW9uICggaWQsIGRpbWVuc2lvbnMsIGRpYWdyYW0gKSB7XG5cbiAgICAgICAgICAgIHZhciBncmlkO1xuXG4gICAgICAgICAgICBpZiAoICFhbmd1bGFyLmlzRGVmaW5lZCggZ3JpZHNbIGlkIF0gKSApIHtcbiAgICAgICAgICAgICAgICBncmlkID0gZ3JpZHNbIGlkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uczogZGltZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czogZGlhZ3JhbS5jb21wb25lbnRzLFxuICAgICAgICAgICAgICAgICAgICB2aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB3aXJlczogZGlhZ3JhbS53aXJlcyxcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZVdpcmVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgdmlld1BvcnQ6IHt9LFxuICAgICAgICAgICAgICAgICAgICBpbnZpc2libGVEaWFncmFtQ29tcG9uZW50c1JlY2FsY3VsYXRlOiBmYWxzZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93ICggJ0dyaWQgd2FzIGFscmVhZHkgZGVmaW5lZCEnLCBpZCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLFxuICAgICAgICAgICAgICAgIHdpcmVzOiBncmlkLnZpc2libGVXaXJlc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuc2V0VmlzaWJsZUFyZWEgPSBmdW5jdGlvbiAoIGdyaWRJZCwgdmlld1BvcnQgKSB7XG4gICAgICAgICAgICB2YXIgZ3JpZCA9IGdyaWRzWyBncmlkSWQgXTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzRGVmaW5lZCggZ3JpZCApICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzRGVmaW5lZCggdmlld1BvcnQgKSApIHtcblxuICAgICAgICAgICAgICAgICAgICBncmlkLnZpZXdQb3J0ID0gdmlld1BvcnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbnZhbGlkYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzKCBncmlkLmlkICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgKCAnR3JpZCB3YXMgbm90IGRlZmluZWQhJywgZ3JpZElkICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlb3JkZXJWaXNpYmxlQ29tcG9uZW50cyA9IGZ1bmN0aW9uICggZ3JpZElkICkge1xuXG4gICAgICAgICAgICB2YXIgZ3JpZCA9IGdyaWRzWyBncmlkSWQgXTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzRGVmaW5lZCggZ3JpZCApICkge1xuICAgICAgICAgICAgICAgIGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLnNvcnQoIGZ1bmN0aW9uICggYSwgYiApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGEueiA+IGIueiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBhLnogPCBiLnogKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcblxuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgfVxuXSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3ltYm9sU2VydmljZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcbiAgICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9sU2VydmljZXMnLCBbXSApO1xuXG5zeW1ib2xTZXJ2aWNlc01vZHVsZS5wcm92aWRlciggJ3N5bWJvbE1hbmFnZXInLCBmdW5jdGlvbiBTeW1ib2xNYW5hZ2VyUHJvdmlkZXIoKSB7XG4gICAgdmFyIGF2YWlsYWJsZVN5bWJvbHMgPSB7fTtcblxuICAgIHRoaXMucmVnaXN0ZXJTeW1ib2wgPSBmdW5jdGlvbiAoIHN5bWJvbERlc2NyaXB0b3IgKSB7XG5cbiAgICAgICAgaWYgKCBhbmd1bGFyLmlzT2JqZWN0KCBzeW1ib2xEZXNjcmlwdG9yICkgJiZcbiAgICAgICAgICAgIGFuZ3VsYXIuaXNTdHJpbmcoIHN5bWJvbERlc2NyaXB0b3IudHlwZSApICkge1xuICAgICAgICAgICAgYXZhaWxhYmxlU3ltYm9sc1sgc3ltYm9sRGVzY3JpcHRvci50eXBlIF0gPSBzeW1ib2xEZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuJGdldCA9IFtcblxuICAgICAgICBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBTeW1ib2xNYW5hZ2VyO1xuXG4gICAgICAgICAgICBTeW1ib2xNYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRBdmFpbGFibGVTeW1ib2xzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlU3ltYm9scztcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRTeW1ib2wgPSBmdW5jdGlvbiAoIHN5bWJvbFR5cGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhdmFpbGFibGVTeW1ib2xzWyBzeW1ib2xUeXBlIF07XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0U3ltYm9sRWxlbWVudEZvclR5cGUgPSBmdW5jdGlvbiAoIHN5bWJvbFR5cGUgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGF2YWlsYWJsZVN5bWJvbHNbIHN5bWJvbFR5cGUgXSAmJiBhdmFpbGFibGVTeW1ib2xzWyBzeW1ib2xUeXBlIF0uZGlyZWN0aXZlO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggIXJlc3VsdCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICdyZXNpc3Rvcic7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFN5bWJvbE1hbmFnZXIoKTtcblxuICAgICAgICB9XG4gICAgXTtcbn0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEVsYm93Um91dGVyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5uYW1lID0gJ0VsYm93Um91dGVyJztcblxuICAgIHRoaXMubWFrZVNlZ21lbnRzID0gZnVuY3Rpb24gKCBwb2ludHMsIG1ldGhvZCApIHtcblxuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIHBvaW50MSwgZWxib3csIHBvaW50MixcbiAgICAgICAgICAgIHNlZ21lbnRzO1xuXG4gICAgICAgIG1ldGhvZCA9IG1ldGhvZCB8fCAndmVydGljYWxGaXJzdCc7XG5cbiAgICAgICAgaWYgKCBhbmd1bGFyLmlzQXJyYXkoIHBvaW50cyApICYmIHBvaW50cy5sZW5ndGggPj0gMiApIHtcblxuICAgICAgICAgICAgc2VnbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgcG9pbnQxID0gcG9pbnRzWyBpIF07XG4gICAgICAgICAgICAgICAgcG9pbnQyID0gcG9pbnRzWyBpICsgMSBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBtZXRob2QgPT09ICd2ZXJ0aWNhbEZpcnN0JyApIHtcblxuICAgICAgICAgICAgICAgICAgICBlbGJvdyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBvaW50MS54LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogcG9pbnQyLnlcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxib3cgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwb2ludDEueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBvaW50Mi54XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWdtZW50cy5wdXNoKCB7XG5cbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuXG4gICAgICAgICAgICAgICAgICAgIHgxOiBwb2ludDEueCxcbiAgICAgICAgICAgICAgICAgICAgeTE6IHBvaW50MS55LFxuXG4gICAgICAgICAgICAgICAgICAgIHgyOiBlbGJvdy54LFxuICAgICAgICAgICAgICAgICAgICB5MjogZWxib3cueSxcblxuICAgICAgICAgICAgICAgICAgICByb3V0ZXI6IHNlbGYubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICggbWV0aG9kID09PSAndmVydGljYWxGaXJzdCcgKSA/ICd2ZXJ0aWNhbCcgOiAnaG9yaXpvbnRhbCdcblxuICAgICAgICAgICAgICAgIH0sIHtcblxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXG5cbiAgICAgICAgICAgICAgICAgICAgeDE6IGVsYm93LngsXG4gICAgICAgICAgICAgICAgICAgIHkxOiBlbGJvdy55LFxuXG4gICAgICAgICAgICAgICAgICAgIHgyOiBwb2ludDIueCxcbiAgICAgICAgICAgICAgICAgICAgeTI6IHBvaW50Mi55LFxuXG4gICAgICAgICAgICAgICAgICAgIHJvdXRlcjogc2VsZi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogKCBtZXRob2QgPT09ICd2ZXJ0aWNhbEZpcnN0JyApID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ1xuXG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWdtZW50cztcblxuICAgIH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWxib3dSb3V0ZXI7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVSb3V0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLm1ha2VTZWdtZW50cyA9IGZ1bmN0aW9uICggcG9pbnRzICkge1xuXG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgcG9pbnQxLCBwb2ludDIsXG4gICAgICAgICAgICBzZWdtZW50cztcblxuICAgICAgICBpZiAoIGFuZ3VsYXIuaXNBcnJheSggcG9pbnRzICkgJiYgcG9pbnRzLmxlbmd0aCA+PSAyICkge1xuXG4gICAgICAgICAgICBzZWdtZW50cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGggLSAxOyBpKysgKSB7XG5cbiAgICAgICAgICAgICAgICBwb2ludDEgPSBwb2ludHNbIGkgXTtcbiAgICAgICAgICAgICAgICBwb2ludDIgPSBwb2ludHNbIGkgKyAxIF07XG5cbiAgICAgICAgICAgICAgICBzZWdtZW50cy5wdXNoKCB7XG5cbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuXG4gICAgICAgICAgICAgICAgICAgIHgxOiBwb2ludDEueCxcbiAgICAgICAgICAgICAgICAgICAgeTE6IHBvaW50MS55LFxuXG4gICAgICAgICAgICAgICAgICAgIHgyOiBwb2ludDIueCxcbiAgICAgICAgICAgICAgICAgICAgeTI6IHBvaW50Mi55XG5cbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuXG4gICAgfTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVSb3V0ZXI7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB3aXJpbmdTZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuICAgICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi53aXJpbmdTZXJ2aWNlJywgW10gKTtcblxud2lyaW5nU2VydmljZXNNb2R1bGUuc2VydmljZSggJ3dpcmluZ1NlcnZpY2UnLCBbICckbG9nJywgJyRyb290U2NvcGUnLCAnJHRpbWVvdXQnLFxuICAgIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBTaW1wbGVSb3V0ZXIgPSByZXF1aXJlKCAnLi9jbGFzc2VzL1NpbXBsZVJvdXRlci5qcycgKSxcbiAgICAgICAgICAgIEVsYm93Um91dGVyID0gcmVxdWlyZSggJy4vY2xhc3Nlcy9FbGJvd1JvdXRlci5qcycgKSxcbiAgICAgICAgICAgIHJvdXRlcnMgPSB7XG5cbiAgICAgICAgICAgICAgICBTaW1wbGVSb3V0ZXI6IG5ldyBTaW1wbGVSb3V0ZXIoKSxcbiAgICAgICAgICAgICAgICBFbGJvd1JvdXRlcjogbmV3IEVsYm93Um91dGVyKClcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucyA9IGZ1bmN0aW9uICggZW5kUG9zaXRpb25zLCByb3V0ZXJUeXBlICkge1xuXG4gICAgICAgICAgICB2YXIgc2VnbWVudHMsXG4gICAgICAgICAgICAgICAgcm91dGVyO1xuXG4gICAgICAgICAgICByb3V0ZXIgPSByb3V0ZXJzWyByb3V0ZXJUeXBlIF07XG5cbiAgICAgICAgICAgIGlmICggYW5ndWxhci5pc09iamVjdCggcm91dGVyICkgJiYgYW5ndWxhci5pc0Z1bmN0aW9uKCByb3V0ZXIubWFrZVNlZ21lbnRzICkgKSB7XG4gICAgICAgICAgICAgICAgc2VnbWVudHMgPSByb3V0ZXIubWFrZVNlZ21lbnRzKFxuICAgICAgICAgICAgICAgICAgICBbIGVuZFBvc2l0aW9ucy5lbmQxLCBlbmRQb3NpdGlvbnMuZW5kMiBdICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzZWdtZW50cztcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucm91dGVXaXJlID0gZnVuY3Rpb24gKCB3aXJlLCByb3V0ZXJUeXBlICkge1xuXG4gICAgICAgICAgICB2YXIgcm91dGVyLCBlbmRQb3NpdGlvbnM7XG5cbiAgICAgICAgICAgIHJvdXRlclR5cGUgPSByb3V0ZXJUeXBlIHx8ICdFbGJvd1JvdXRlcic7XG5cbiAgICAgICAgICAgIHJvdXRlciA9IHJvdXRlcnNbIHJvdXRlclR5cGUgXTtcblxuICAgICAgICAgICAgaWYgKCBhbmd1bGFyLmlzT2JqZWN0KCByb3V0ZXIgKSAmJiBhbmd1bGFyLmlzRnVuY3Rpb24oIHJvdXRlci5tYWtlU2VnbWVudHMgKSApIHtcblxuICAgICAgICAgICAgICAgIGVuZFBvc2l0aW9ucyA9IHdpcmUuZ2V0RW5kUG9zaXRpb25zKCk7XG5cbiAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzID0gcm91dGVyLm1ha2VTZWdtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgWyBlbmRQb3NpdGlvbnMuZW5kMSwgZW5kUG9zaXRpb25zLmVuZDIgXSApO1xuXG4gICAgICAgICAgICAgICAgd2lyZS5yb3V0ZXJUeXBlID0gcm91dGVyVHlwZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWRqdXN0V2lyZUVuZFNlZ21lbnRzID0gZnVuY3Rpb24gKCB3aXJlICkge1xuXG4gICAgICAgICAgICB2YXIgZmlyc3RTZWdtZW50LFxuICAgICAgICAgICAgICAgIHNlY29uZFNlZ21lbnQsXG4gICAgICAgICAgICAgICAgc2Vjb25kVG9MYXN0U2VnbWVudCxcbiAgICAgICAgICAgICAgICBsYXN0U2VnbWVudCxcbiAgICAgICAgICAgICAgICBlbmRQb3NpdGlvbnMsXG4gICAgICAgICAgICAgICAgbmV3U2VnbWVudHMsXG4gICAgICAgICAgICAgICAgcG9zO1xuXG4gICAgICAgICAgICBlbmRQb3NpdGlvbnMgPSB3aXJlLmdldEVuZFBvc2l0aW9ucygpO1xuXG4gICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNBcnJheSggd2lyZS5zZWdtZW50cyApICYmIHdpcmUuc2VnbWVudHMubGVuZ3RoID4gMSApIHtcblxuICAgICAgICAgICAgICAgIGZpcnN0U2VnbWVudCA9IHdpcmUuc2VnbWVudHNbIDAgXTtcblxuICAgICAgICAgICAgICAgIGlmICggZmlyc3RTZWdtZW50LngxICE9PSBlbmRQb3NpdGlvbnMuZW5kMS54IHx8IGZpcnN0U2VnbWVudC55MSAhPT0gZW5kUG9zaXRpb25zLmVuZDEueSApIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGZpcnN0U2VnbWVudC5yb3V0ZXIgPT09ICdFbGJvd1JvdXRlcicgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZFNlZ21lbnQgPSB3aXJlLnNlZ21lbnRzWyAxIF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBzZWNvbmRTZWdtZW50LngyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHNlY29uZFNlZ21lbnQueTJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmUuc2VnbWVudHMuc3BsaWNlKCAwLCAyICk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBmaXJzdFNlZ21lbnQueDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogZmlyc3RTZWdtZW50LnkyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzLnNwbGljZSggMCwgMSApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3U2VnbWVudHMgPSBzZWxmLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucygge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kMTogZW5kUG9zaXRpb25zLmVuZDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQyOiBwb3NcbiAgICAgICAgICAgICAgICAgICAgfSwgZmlyc3RTZWdtZW50LnJvdXRlciApO1xuXG4gICAgICAgICAgICAgICAgICAgIHdpcmUuc2VnbWVudHMgPSBuZXdTZWdtZW50cy5jb25jYXQoIHdpcmUuc2VnbWVudHMgKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50ID0gd2lyZS5zZWdtZW50c1sgd2lyZS5zZWdtZW50cy5sZW5ndGggLSAxIF07XG5cbiAgICAgICAgICAgICAgICBpZiAoIGxhc3RTZWdtZW50LngyICE9PSBlbmRQb3NpdGlvbnMuZW5kMi54IHx8IGxhc3RTZWdtZW50LnkyICE9PSBlbmRQb3NpdGlvbnMuZW5kMi55ICkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggbGFzdFNlZ21lbnQucm91dGVyID09PSAnRWxib3dSb3V0ZXInICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRUb0xhc3RTZWdtZW50ID0gd2lyZS5zZWdtZW50c1sgd2lyZS5zZWdtZW50cy5sZW5ndGggLSAyIF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBzZWNvbmRUb0xhc3RTZWdtZW50LngxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHNlY29uZFRvTGFzdFNlZ21lbnQueTFcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmUuc2VnbWVudHMuc3BsaWNlKCB3aXJlLnNlZ21lbnRzLmxlbmd0aCAtIDIsIDIgKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGxhc3RTZWdtZW50LngxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGxhc3RTZWdtZW50LnkxXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzLnNwbGljZSggd2lyZS5zZWdtZW50cy5sZW5ndGggLSAxLCAxICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBuZXdTZWdtZW50cyA9IHNlbGYuZ2V0U2VnbWVudHNCZXR3ZWVuUG9zaXRpb25zKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQxOiBwb3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQyOiBlbmRQb3NpdGlvbnMuZW5kMlxuICAgICAgICAgICAgICAgICAgICB9LCBsYXN0U2VnbWVudC5yb3V0ZXIgKTtcblxuICAgICAgICAgICAgICAgICAgICB3aXJlLnNlZ21lbnRzID0gd2lyZS5zZWdtZW50cy5jb25jYXQoIG5ld1NlZ21lbnRzICk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yb3V0ZVdpcmUoIHdpcmUgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgfVxuXSApOyIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSggJ0FycmF5LnByb3RvdHlwZS5maW5kJyApO1xuXG5pZiAoICFBcnJheS5wcm90b3R5cGUuZmluZEJ5SWQgKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZpbmRCeUlkID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZCggZnVuY3Rpb24gKCBhICkge1xuICAgICAgICAgICAgcmV0dXJuIGEuaWQgIT09IHVuZGVmaW5lZCAmJiBhLmlkID09PSBpZDtcbiAgICAgICAgfSApO1xuICAgIH07XG59XG5cbmlmICggIUFycmF5LnByb3RvdHlwZS5nZXRSYW5kb21FbGVtZW50ICkge1xuICAgIEFycmF5LnByb3RvdHlwZS5nZXRSYW5kb21FbGVtZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpc1sgTWF0aC5yb3VuZCggTWF0aC5yYW5kb20oKSAqICggdGhpcy5sZW5ndGggLSAxICkgKSBdO1xuICAgIH07XG59XG5cbmlmICggIUFycmF5LnByb3RvdHlwZS5zaHVmZmxlICkge1xuICAgIEFycmF5LnByb3RvdHlwZS5zaHVmZmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY3VycmVudEluZGV4ID0gdGhpcy5sZW5ndGgsXG4gICAgICAgICAgICB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XG5cbiAgICAgICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cbiAgICAgICAgd2hpbGUgKCAwICE9PSBjdXJyZW50SW5kZXggKSB7XG5cbiAgICAgICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxuICAgICAgICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4ICk7XG4gICAgICAgICAgICBjdXJyZW50SW5kZXggLT0gMTtcblxuICAgICAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgICAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSB0aGlzWyBjdXJyZW50SW5kZXggXTtcbiAgICAgICAgICAgIHRoaXNbIGN1cnJlbnRJbmRleCBdID0gdGhpc1sgcmFuZG9tSW5kZXggXTtcbiAgICAgICAgICAgIHRoaXNbIHJhbmRvbUluZGV4IF0gPSB0ZW1wb3JhcnlWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG59Il19
