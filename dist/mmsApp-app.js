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
  'mms.designVisualization.svgDiagram'
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
    load: function ($q, $stateParams, $rootScope, $state, $log, dataStoreService, projectService) {
      var
        connectionId,
        deferred;

      $rootScope.mainDbConnectionId = 'mms-main-db-connection-id';

      connectionId = $rootScope.mainDbConnectionId;
      deferred = $q.defer();

      $rootScope.loading = true;

      dataStoreService.connectToDatabase(connectionId, {host: window.location.basename})
        .then(function () {
          return projectService.selectProject(connectionId, $stateParams.projectId);
        })
        .then(function (projectId) {
          $rootScope.projectId = projectId;
          $rootScope.loading = false;
          deferred.resolve(projectId);
        })
        .catch(function (reason) {
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

  defaultNavigatorItems = [
      {
        id: 'root',
        label: 'MMS App',
        itemClass: 'cyphy-root'
      }
    ];

  $scope.navigator = {
    separator: true,
    items: angular.copy(defaultNavigatorItems, [])
  };

  $rootScope.$watch('projectId', function(projectId) {

    if (projectId) {

      $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
      $scope.navigator.items.push({
        id: 'project',
        label: projectId,
        action: function() {
          $window.open('/?project=' + projectId);
        }
      });

    } else {
      $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
    }

  });

});

CyPhyApp.controller('ProjectViewController', function ($scope, diagramService, $log) {

  $scope.diagram = diagramService.getDiagram();

  $log.debug('Diagram:', $scope.diagram);

});

CyPhyApp.controller('NoProjectController', function ($rootScope, $scope, $stateParams, $http, $log, $state, growl) {

  $scope.projectId = $stateParams.projectId;
  $scope.errored = false;

  $scope.startNewProject = function () {

    $rootScope.processing = true;

    $log.debug('New project creation');

    $http.get('/rest/external/copyproject/noredirect').
      success(function (data) {

        $rootScope.processing = false;
        $log.debug('New project creation successful', data);
        $state.go('project', {
          projectId: data
        });

      }).
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

require('./componentWireSegment');

angular.module(
'mms.designVisualization.componentWire',
[
  'mms.designVisualization.componentWire.segment'
]
)
.controller('ComponentWireController', function ($scope) {
  $scope.getSegments = function() {
    var endPositions,
      x1,y1,x2,y2;

    endPositions = $scope.wire.getEndPositions();

    x1 = endPositions.x1;
    x2 = endPositions.x2;
    y1 = endPositions.y1;
    y2 = endPositions.y2;

    return [
      endPositions
    ];

  };

  $scope.onSegmentClick = function(wire, segment) {
    console.log(wire, segment);
  };

  $scope.segments = $scope.getSegments();

})
.directive(
'componentWire',

function () {

  return {
    scope: true,
    controller: 'ComponentWireController',
    restrict: 'E',
    replace: true,
    templateUrl: '/designVisualization/templates/componentWire.html',
    templateNamespace: 'SVG'
  };
}
);
},{"./componentWireSegment":5}],5:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.componentWire.segment',
[]
)

.directive(
'componentWireSegment',

function () {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/designVisualization/templates/componentWireSegment.html',
    templateNamespace: 'SVG'
  };
}
);
},{}],6:[function(require,module,exports){
/*globals angular, $*/

'use strict';

// Move this to GME eventually

require('../drawingCanvas/drawingCanvas.js');

angular.module('mms.designVisualization.diagramContainer', [
  'mms.designVisualization.drawingCanvas',
  'panzoom',
  'panzoomwidget'
])
.controller('DiagramContainerController', [
  '$scope',
  'PanZoomService',
  function ($scope,  PanZoomService) {

    var compiledDirectives;

    compiledDirectives = {};

    $scope.diagram.state = $scope.diagram.state || {};
    $scope.diagram.state.selectedComponentIds = $scope.diagram.state.selectedComponentIds || [];

    $scope.diagram.config = $scope.diagram.config || {};

    $scope.panzoomId = 'panzoomId';//scope.id + '-panzoomed';

    $scope.zoomLevel = 4;

    $scope.panzoomModel = {}; // always pass empty object

    $scope.panzoomConfig = {
      zoomLevels: 10,
      neutralZoomLevel: $scope.zoomLevel,
      scalePerZoomLevel: 1.25,
      friction: 50,
      haltSpeed: 50,

      modelChangedCallback: function (val) {
        PanZoomService.getAPI($scope.panzoomId).then(function (api) {

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

    $scope.getCssClass = function() {
      return 'zoom-level-' + $scope.zoomLevel;
    };

    this.getVisibleArea = function() {
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

    this.getCompiledDirective = function(directive) {
      return compiledDirectives[directive];
    };

    this.setCompiledDirective = function(directive, compiledDirective) {
      compiledDirectives[directive] = compiledDirective;
    };

    this.isEditable = function() {

      $scope.diagram.config = $scope.diagram.config || {};

      return $scope.diagram.config.editable === true;
    };

    this.isComponentSelected = function(component) {
      return $scope.diagram.state.selectedComponentIds.indexOf(component.id) > -1;
    };

  }
])
.directive('diagramContainer', [
  'diagramService', '$log', 'PanZoomService',
  function (diagramService, $log) {

    return {
      controller: 'DiagramContainerController',
      scope: {
        id: '@',
        diagram: '='
      },
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: '/designVisualization/templates/diagramContainer.html',
      link: function (scope, element) {

        scope.canvasWidth = $(element).outerWidth();
        scope.canvasHeight = $(element).outerHeight();


        scope.visibleArea = {
          top: 0,
          left: 0,
          right: scope.canvasWidth,
          bottom: scope.canvasHeight
        };

        $log.debug('In canvas container', scope.visibleArea);


      }

    };
  }
]);
},{"../drawingCanvas/drawingCanvas.js":7}],7:[function(require,module,exports){
/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module('mms.designVisualization.drawingCanvas', [
])
.directive('drawingCanvas',
function () {

  return {

    scope: {
      id: '@'
    },
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: '/designVisualization/templates/drawingCanvas.html'

  };
});
},{}],8:[function(require,module,exports){
/*globals angular, fabric*/

'use strict';

// Move this to GME eventually

angular.module('mms.designVisualization.fabricCanvas', [
])
.controller('FabricCanvasController', function () {

})
.directive('fabricCanvas', [
  '$log',
  'diagramService',
  function ($log, diagramService) {

    return {

      scope: {
      },
      controller: 'FabricCanvasController',
      require: '^diagramContainer',
      restrict: 'E',
      replace: true,
      templateUrl: '/designVisualization/templates/fabricCanvas.html',
      link: function (scope, element, attributes, diagramContainerCtrl) {

        var
        canvas,
        renderDiagram;

        scope.id = diagramContainerCtrl.getId() + 'fabric-canvas';

        canvas = new fabric.Canvas(scope.id);

        canvas.setBackgroundColor('rgba(255, 73, 64, 0.6)');

        renderDiagram = function () {

          if (angular.isObject(scope.diagramData)) {

            if (angular.isArray(scope.diagramData.symbols)) {

              angular.forEach(scope.diagramData.symbols, function (symbol) {

                diagramService.getSVGForSymbolType(symbol.type).then(function (object) {

                  var svgObject;

                  svgObject = object.set({ left: symbol.x, top: symbol.y, angle: 0 });

//                  canvas.add(svgObject);

                  var rect = new fabric.Rect({
                    left: 100,
                    top: 50,
                    width: 100,
                    height: 100,
                    fill: 'green',
                    angle: 20,
                    padding: 10
                  });

                  canvas.add(rect);

  //                $log.debug('e', svgObject);

                  canvas.renderAll();

                });

              });

            }

          }

          canvas.clear().renderAll();

        };

        scope.$watch(diagramContainerCtrl.getDiagramData, function (value) {
          $log.debug('DiagramData is ', value);
          scope.diagramData = value;
          renderDiagram();

        });

      }

    };
  }]);
},{}],9:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.port',
[]
)
.controller('PortController', function ($scope) {
  $scope.getPortTransform = function() {
    var transformString;

    transformString = 'translate(' + $scope.portInstance.portSymbol.x + ',' + $scope.portInstance.portSymbol.y + ')';

    return transformString;
  };
})
.directive(
'port',

function () {

  return {
    scope: false,
    controller: 'PortController',
    restrict: 'E',
    replace: true,
    templateUrl: '/designVisualization/templates/port.html',
    templateNamespace: 'SVG',
    require: ['^svgDiagram', '^diagramContainer'],
    link: function(scope, element, attributes, controllers) {

      var svgDiagramController;

      svgDiagramController = controllers[0];

      scope.onPortClick = function(port, $event) {
        svgDiagramController.onPortClick(scope.component, port, $event);
      };

      scope.onPortMouseDown = function(port, $event) {
        svgDiagramController.onPortMouseDown(scope.component, port, $event);
      };

      scope.onPortMouseUp = function(port, $event) {
        svgDiagramController.onPortMouseUp(scope.component, port, $event);
      };

    }
  };
}
);
},{}],10:[function(require,module,exports){
/*globals angular*/

'use strict';

// Move this to GME eventually

require('../componentWire/componentWire.js');

angular.module('mms.designVisualization.svgDiagram', [
  'mms.designVisualization.gridService',
  'mms.designVisualization.componentWire'
])
.controller('SVGDiagramController', function ($scope, $log, diagramService, wiringService, gridService) {

  var possibbleDragTargetsDescriptor,
  startDrag,
  finishDrag,

  possibleWireStart,
  startWire,
  finishWire,
  cancelWire,

  moveComponentElementToFront,

  getOffsetToMouse,

  Wire = require('../../services/diagramService/classes/Wire.js'),

  addCornerToNewWireLine,

  componentElements;


  getOffsetToMouse = function ($event) {

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

    $log.debug('Dragging', $scope.dragTargetsDescriptor);

  };

  startWire = function () {

    $scope.wireStart = possibleWireStart;
    possibleWireStart = null;

    $log.debug('Starting wire', $scope.wireStart);

  };

  addCornerToNewWireLine = function () {

    var lastSegment;

    $scope.newWireLine.lockedSegments = $scope.newWireLine.segments;

    lastSegment = $scope.newWireLine.lockedSegments[$scope.newWireLine.lockedSegments.length - 1];

    $scope.newWireLine.activeSegmentStartPosition = {
      x: lastSegment.x2,
      y: lastSegment.y2
    };

  };

  finishWire = function (component, port) {

    var wire = new Wire({
      id: 'new-wire-' + Math.round(Math.random() * 10000),
      end1: {
        component: $scope.wireStart.component,
        port: $scope.wireStart.port
      },
      end2: {
        component: component,
        port: port
      }
    });

    wire.segments = angular.copy(
    $scope.newWireLine.lockedSegments.concat(
    wiringService.getSegmentsBetweenPositions(
    {
      end1: $scope.newWireLine.activeSegmentStartPosition,
      end2: port.getGridPosition()
    },
    'ElbowRouter'
    )
    ));

    console.log(wire.segments);


    diagramService.addWire(wire);

    $scope.diagram.wires[ wire.id ] = wire;

    gridService.invalidateVisibleDiagramComponents($scope.id);

    $log.debug('Finish wire', wire);

    $scope.wireStart = null;
    $scope.newWireLine = null;

  };

  cancelWire = function () {
    $scope.wireStart = null;
  };

  finishDrag = function () {

    $scope.dragTargetsDescriptor = null;

    $log.debug('Finish dragging');

  };

  $scope.onMouseUp = function () {
//      if ($scope.dragTargetsDescriptor) {
//        //finishDrag();
//      }
  };


  $scope.onClick = function ($event) {

    if ($scope.wireStart) {

      $event.stopPropagation();

      addCornerToNewWireLine();

    } else {
      $scope.diagram.state.selectedComponentIds = [];
    }

  };

  $scope.onMouseMove = function ($event) {

    var offset;

    // Dragging

    if (possibbleDragTargetsDescriptor) {
      startDrag();
    }

    if ($scope.dragTargetsDescriptor) {

      angular.forEach($scope.dragTargetsDescriptor.targets, function (target) {

        //console.log($event.offsetY, target.deltaToCursor.y);

        offset = getOffsetToMouse($event);

        target.component.setPosition(
        offset.x + target.deltaToCursor.x,
        offset.y + target.deltaToCursor.y
        );

      });

      angular.forEach($scope.dragTargetsDescriptor.affectedWires, function (wire) {

        wiringService.adjustWireEndSegments(wire);

      });

    }

    // Wire drawing

    if (possibleWireStart) {
      startWire();
    }

    if ($scope.wireStart) {

      $scope.newWireLine = $scope.newWireLine || {};
      $scope.newWireLine.lockedSegments = $scope.newWireLine.lockedSegments || [];
      $scope.newWireLine.activeSegmentStartPosition =
      $scope.newWireLine.activeSegmentStartPosition || $scope.wireStart.port.getGridPosition();

      $scope.newWireLine.segments = $scope.newWireLine.lockedSegments.concat(
      wiringService.getSegmentsBetweenPositions(
      {
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

    if ($scope.dragTargetsDescriptor) {
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
    }]
  }];

  moveComponentElementToFront = function (componentId) {

    var z,
    component,
    needsTobeReordered;

    needsTobeReordered = false;

    z = diagramService.getHighestZ();
    component = $scope.diagram.components[componentId];

    if (isNaN(component.z)) {
      component.z = z;
      needsTobeReordered = true;
    } else {
      if (component.z < z) {
        component.z = z + 1;
        needsTobeReordered = true;
      }
    }

    if (needsTobeReordered) {
      gridService.reorderVisibleComponents($scope.id);
    }

  };

  // Interactions with components

  this.toggleComponentSelected = function (component, $event) {

    var index;

    if (angular.isObject(component) && !this.disallowSelection() && component.nonSelectable !== true) {

      index = $scope.diagram.state.selectedComponentIds.indexOf(component.id);

      if (index > -1) {

        $scope.diagram.state.selectedComponentIds.splice(index, 1);

      } else {

        if ($scope.diagram.state.selectedComponentIds.length > 0 &&
        $scope.diagram.config.multiSelect !== true &&
        $event.shiftKey !== true) {

          angular.forEach($scope.diagram.state.selectedComponentIds, function (componentId) {
            $scope.diagram.components[componentId].selected = false;
          });
          $scope.diagram.state.selectedComponentIds = [];
        }

        $scope.diagram.state.selectedComponentIds.push(component.id);

        moveComponentElementToFront(component.id);

      }

    }

  };

  this.onComponentClick = function (component, $event) {

    possibbleDragTargetsDescriptor = null;

    if ($scope.dragTargetsDescriptor) {
      finishDrag();
      $event.stopPropagation();
    } else {
      this.toggleComponentSelected(component, $event);
      $event.stopPropagation();
    }

  };

  this.onPortMouseDown = function (component, port, $event) {

    if (!$scope.wireStart) {
      possibleWireStart = {
        component: component,
        port: port
      };
    }

    $event.stopPropagation();

  };

  this.onPortMouseUp = function (component, port, $event) {

    $event.stopPropagation();

  };

  this.onPortClick = function (component, port, $event) {

    if (possibbleDragTargetsDescriptor) {
      possibbleDragTargetsDescriptor = null;
    }

    if ($scope.wireStart) {

      $event.stopPropagation();

      if ($scope.wireStart.port !== port) {
        finishWire(component, port);
      } else {
        cancelWire();
      }

    }

  };

  this.onComponentMouseDown = function (component, $event) {

    var componentsToDrag,
    getDragDescriptor,
    wires;

    if ($event.which === 3) {

      component.rotate(90);

      wires = diagramService.getWiresForComponents(component);

      console.log(component);

      angular.forEach(wires, function (wire) {
        wiringService.adjustWireEndSegments(wire);
      });


      $event.preventDefault();

    } else {

      componentsToDrag = [];

      getDragDescriptor = function (component) {

        var offset = getOffsetToMouse($event);

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

      if (this.isEditable() &&
      component.nonSelectable !== true &&
      component.locationLocked !== true) {

        $event.stopPropagation();

        possibbleDragTargetsDescriptor = {
          targets: [ getDragDescriptor(component) ]
        };

        componentsToDrag.push(component);

        if ($scope.diagram.state.selectedComponentIds.indexOf(component.id) > -1) {

          // Drag along other selected components

          angular.forEach($scope.diagram.state.selectedComponentIds, function (selectedComponentId) {

            var selectedComponent;

            if (component.id !== selectedComponentId) {

              selectedComponent = $scope.diagram.components[selectedComponentId];

              possibbleDragTargetsDescriptor.targets.push(getDragDescriptor(selectedComponent));

              componentsToDrag.push(selectedComponent);

            }

          });
        }

        possibbleDragTargetsDescriptor.affectedWires = diagramService.getWiresForComponents(componentsToDrag);

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

  this.registerComponentElement = function (id, el) {

    componentElements = componentElements || {};

    componentElements[id] = el;

  };

  this.unregisterComponentElement = function (id) {

    componentElements = componentElements || {};

    delete componentElements[id];

  };

})
.directive('svgDiagram', [
  '$log',
  'diagramService',
  'gridService',
  function ($log, diagramService, gridService) {

    return {
      controller: 'SVGDiagramController',
      require: '^diagramContainer',
      restrict: 'E',
      scope: false,
      replace: true,
      templateUrl: '/designVisualization/templates/svgDiagram.html',
      link: function (scope, element, attributes, diagramContainerController) {

        var id;

        id = diagramContainerController.getId();

        scope.diagram = scope.diagram || {};
        scope.$element = element;

        scope.id = id;

        scope.visibleObjects = gridService.createGrid(id,
        {
          width: 10000,
          height: 1000
        },
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

    };
  }
]);
},{"../../services/diagramService/classes/Wire.js":21,"../componentWire/componentWire.js":4}],11:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.symbols.box',
[]
).controller('BoxController', function($scope) {

  $scope.portWires = [];

  angular.forEach($scope.component.symbol.ports, function(port) {

    var toX = 0, toY=0,
    portWireLength,
    width, height;

    portWireLength = $scope.component.symbol.portWireLength;
    width = $scope.component.symbol.width;
    height = $scope.component.symbol.height;

    if (port.x === 0) {
      toX = portWireLength;
      toY = port.y;
    }

    if (port.y === 0) {
      toY = portWireLength;
      toX = port.x;
    }

    if (port.x === width) {
      toX = width-portWireLength;
      toY = port.y;
    }

    if (port.y === height) {
      toY = height-portWireLength;
      toX = port.x;
    }

    $scope.portWires.push({
      x1: port.x,
      y1: port.y,
      x2: toX,
      y2: toY
    });
  });

})
.directive(
'box',

function () {

  return {
    scope: false,
    restrict: 'E',
    replace: true,
    controller: 'BoxController',
    templateUrl: '/designVisualization/templates/box.html',
    templateNamespace: 'SVG'
  };
});
},{}],12:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.symbols.capacitor',
[]
)
.config(['symbolManagerProvider', function(symbolManagerProvider){
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
    ports: [
      {
        id: 'C',
        wireAngle: 180,
        wireLeadIn: 20,
        label: 'C',
        x: 0,
        y: 7.5
      },
      {
        id: 'A',
        wireAngle: 0,
        wireLeadIn: 20,
        label: 'A',
        x: 60,
        y: 7.5
      }
    ]
  });
}]);
},{}],13:[function(require,module,exports){
/*globals angular, $*/

'use strict';

require('../../services/symbolServices/symbolServices.js');
require('../port/port.js');

require('./resistor/resistor.js');
require('./jFetP/jFetP.js');
require('./opAmp/opAmp.js');
require('./diode/diode.js');
require('./capacitor/capacitor.js');
require('./inductor/inductor.js');

require('./box/box.js');

var symbolsModule = angular.module(
'mms.designVisualization.symbols',
[
  'mms.designVisualization.symbolServices',

  'mms.designVisualization.port',

  'mms.designVisualization.symbols.resistor',
  'mms.designVisualization.symbols.jFetP',
  'mms.designVisualization.symbols.opAmp',
  'mms.designVisualization.symbols.diode',
  'mms.designVisualization.symbols.capacitor',
  'mms.designVisualization.symbols.inductor',

  'mms.designVisualization.symbols.box'

]);

symbolsModule.controller(
'SymbolController', function($scope) {

  $scope.getSymbolTransform = function() {

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

});

symbolsModule.directive(
'componentSymbol',

function ($compile) {

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
    templateUrl: '/designVisualization/templates/componentSymbol.html',
    templateNamespace: 'SVG',
    require: ['^svgDiagram', '^diagramContainer'],
    link: function (scope, element, attributes, controllers) {

      var templateStr,
      template,

      diagramContainerController,
      svgDiagramController,

      $el,
      compiledSymbol,
      symbolComponent;

      svgDiagramController = controllers[0];
      diagramContainerController = controllers[1];

      scope.portsVisible = function() {
        return true;
      };

      scope.detailsVisible = function() {
        return diagramContainerController.getZoomLevel() > 1;
      };

      scope.getCssClass = function() {

        var result;

        result = scope.component.symbol.type;

        if (diagramContainerController.isComponentSelected(scope.component)) {
          result += ' selected';
        }

        return result;

      };

      // Interactions

      scope.onClick = function($event) {
        svgDiagramController.onComponentClick(scope.component, $event);
      };

      scope.onMouseDown = function($event) {
        svgDiagramController.onComponentMouseDown(scope.component, $event);
      };

      symbolComponent = scope.component.symbol.symbolComponent || 'generic-svg';
      
      compiledSymbol = diagramContainerController.getCompiledDirective(symbolComponent);

      if (!angular.isFunction(compiledSymbol)) {

        templateStr = '<' + symbolComponent + '>' +
        '</' + symbolComponent + '>';

        template = angular.element(templateStr);

        compiledSymbol = $compile(template);

        diagramContainerController.setCompiledDirective(symbolComponent, compiledSymbol);

      }

      $el = $(element);

      compiledSymbol(scope, function(clonedElement){
        $el.find('.symbol-placeholder').replaceWith(clonedElement);
      });

      svgDiagramController.registerComponentElement(scope.component.id, $el);

      scope.$on('$destroy', function(){
        svgDiagramController.unregisterComponentElement(scope.component.id);
      });

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
    templateUrl: '/designVisualization/templates/genericSvg.html',
    templateNamespace: 'SVG'
  };
}
);
},{"../../services/symbolServices/symbolServices.js":24,"../port/port.js":9,"./box/box.js":11,"./capacitor/capacitor.js":12,"./diode/diode.js":14,"./inductor/inductor.js":15,"./jFetP/jFetP.js":16,"./opAmp/opAmp.js":17,"./resistor/resistor.js":18}],14:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.symbols.diode',
[]
)
.config(['symbolManagerProvider', function(symbolManagerProvider){
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
    ports: [
      {
        id: 'C',
        wireAngle: 0,
        wireLeadIn: 20,
        label: 'C',
        x: 0,
        y: 7
      },
      {
        id: 'A',
        wireAngle: 180,
        wireLeadIn: 20,
        label: 'A',
        x: 60,
        y: 7
      }
    ]
  });
}]);
},{}],15:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.symbols.inductor',
[]
)
.config(['symbolManagerProvider', function(symbolManagerProvider){
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
    ports: [
      {
        id: 'p1',
        wireAngle: 180,
        wireLeadIn: 20,
        label: 'p1',
        x: 0,
        y: 6.5
      },
      {
        id: 'p2',
        wireAngle: 0,
        wireLeadIn: 20,
        label: 'p2',
        x: 50,
        y: 6.5
      }
    ]
  });
}]);
},{}],16:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.symbols.jFetP',
[]
)
.config(['symbolManagerProvider', function(symbolManagerProvider){
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
    ports: [
      {
        id: 's',
        wireAngle: 270,
        wireLeadIn: 20,
        label: 'S',
        x: 46,
        y: 0
      },
      {
        id: 'd',
        wireAngle: 90,
        wireLeadIn: 20,
        label: 'D',
        x: 46,
        y: 70
      },
      {
        id: 'g',
        wireAngle: 180,
        wireLeadIn: 20,
        label: 'G',
        x: 0,
        y: 26
      }
    ]
  });
}]);
},{}],17:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.symbols.opAmp',
[]
)
.config(['symbolManagerProvider', function(symbolManagerProvider){
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
    ports: [
      {
        id: 'Vs+',
        wireAngle: 270,
        wireLeadIn: 20,
        label: 'Vs+',
        x: 65,
        y: 0
      },
      {
        id: 'Vout',
        wireAngle: 0,
        wireLeadIn: 20,
        label: 'Vout',
        x: 140,
        y: 50
      },
      {
        id: 'Vs-',
        wireAngle: 90,
        wireLeadIn: 20,
        label: 'Vs-',
        x: 65,
        y: 100
      },
      {
        id: 'V-',
        wireAngle: 180,
        wireLeadIn: 20,
        label: 'V-',
        x: 0,
        y: 75
      },
      {
        id: 'V+',
        wireAngle: 180,
        wireLeadIn: 20,
        label: 'V+',
        x: 0,
        y: 25
      }
    ]
  });
}]);
},{}],18:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.symbols.resistor',
[]
)
.config(['symbolManagerProvider', function(symbolManagerProvider){
  symbolManagerProvider.registerSymbol({
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
    ports: [
      {
        id: 'p1',
        wireAngle: 180,
        wireLeadIn: 20,
        label: 'p1',
        x: 0,
        y: 5
      },
      {
        id: 'p2',
        wireAngle: 0,
        wireLeadIn: 20,
        label: 'p2',
        x: 60,
        y: 5
      }
    ]
  });
}]);
},{}],19:[function(require,module,exports){
/*globals angular*/

'use strict';

var glMatrix = require('glMatrix');

var ComponentPort = function (descriptor) {

  angular.extend(this, descriptor);

};

ComponentPort.prototype.getGridPosition = function() {

  var position,
    positionVector;

  if (angular.isObject(this.portSymbol) && angular.isObject(this.parentComponent)) {

    positionVector = glMatrix.vec2.create();
    glMatrix.vec2.set(positionVector, this.portSymbol.x, this.portSymbol.y);

    glMatrix.vec2.transformMat3(positionVector, positionVector, this.parentComponent.getTransformationMatrix());

    position = {

      x: positionVector[0],
      y: positionVector[1]

    };

  }

  return position;

};

module.exports = ComponentPort;
},{"glMatrix":3}],20:[function(require,module,exports){
/*globals angular*/

'use strict';

var glMatrix = require('glMatrix');

var DiagramComponent = function (descriptor) {

  if (!angular.isObject(descriptor.symbol)) {
    throw new Error('No symbol found for component ' + this.id);
  }

  angular.extend(this, descriptor);

};

DiagramComponent.prototype.isInViewPort = function (viewPort, padding) {

  //TODO: count width and height for orientation
  padding = padding || {x: 0, y: 0};

  return (
  angular.isObject(viewPort) &&
  this.x + this.symbol.width >= ( viewPort.left + padding.x ) &&
  this.x <= ( viewPort.right - padding.x ) &&
  this.y + this.symbol.height >= ( viewPort.top + padding.y ) &&
  this.y <= ( viewPort.bottom - padding.y ) );
};

DiagramComponent.prototype.getTransformationMatrix = function() {

  if (!angular.isArray(this.transformationMatrix)) {
    this.updateTransformationMatrix();
  }

  return this.transformationMatrix;

};


DiagramComponent.prototype.getSVGTransformationMatrix = function() {

  if (!angular.isArray(this.svgTransformationMatrix)) {
    this.updateTransformationMatrix();
  }

  return this.svgTransformationMatrix;

};

DiagramComponent.prototype.getSVGTransformationString = function() {

  var transMatrix = this.getSVGTransformationMatrix();

  return transMatrix.join(', ');
};

DiagramComponent.prototype.updateTransformationMatrix = function() {

  var rotationRad,
  //sinA, cosA,
  translation,
  transformMat3,
  result;

  if (angular.isNumber(this.rotation) &&
  angular.isNumber(this.x),
  angular.isNumber(this.y)) {

    rotationRad = this.rotation/180 * Math.PI;

    transformMat3 = glMatrix.mat3.create();

    translation = glMatrix.vec2.create();
    glMatrix.vec2.set(translation, this.x, this.y);

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
      transformMat3[0],
      transformMat3[1],
      transformMat3[3],
      transformMat3[4],
      transformMat3[6],
      transformMat3[7]
    ];

    result =  this.transformationMatrix;

  }

  return result;

};

DiagramComponent.prototype.setPosition = function(x, y) {

  if (angular.isNumber(x) && angular.isNumber(y)) {

    this.x = x;
    this.y = y;

    this.updateTransformationMatrix();

  } else {
    throw new Error('Coordinates must be numbers!');
  }
};

DiagramComponent.prototype.rotate = function(angle) {

  if (angular.isNumber(angle)) {

    this.rotation += angle;

    this.updateTransformationMatrix();

  } else {
    throw new Error('Angle must be number!');
  }
};

DiagramComponent.prototype.registerPortInstances = function(newPorts) {

  var self = this;

  this.portInstances = this.portInstances || [];

  angular.forEach(newPorts, function(newPort) {

    newPort.parentComponent = self;
    self.portInstances.push(newPort);

  });
};

DiagramComponent.prototype.getTransformedDimensions = function() {
//  var width, height;
};

DiagramComponent.prototype.localToGlobal = function() {

  if (!this.transformationMatrix) {
    this.transformationMatrix = this.getTransformationMatrix();
  }



};

module.exports = DiagramComponent;
},{"glMatrix":3}],21:[function(require,module,exports){
/*globals angular*/

'use strict';

var Wire = function (descriptor) {

  angular.extend(this, descriptor);

  this.segments = [];

};

Wire.prototype.isInViewPort = function (viewPort, padding) {

  var j,
    shouldBeVisible,
  segment;

  padding = padding || {x: 0, y: 0};

  shouldBeVisible = false;

  if ( this.routerType === 'ElbowRouter') {

    if (angular.isArray(this.segments)) {

      for (j=0; j < this.segments.length && !shouldBeVisible; j++) {

        segment = this.segments[j];

        if (segment.orientation === 'vertical') {

          if ( segment.x1 >= ( viewPort.left + padding.x ) &&
            segment.x1 <= ( viewPort.right - padding.x )) {
            shouldBeVisible = true;
          }

        } else {

          if ( segment.y1 >= ( viewPort.top + padding.y ) &&
          segment.y1 <= ( viewPort.bottom - padding.y )) {
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

Wire.prototype.getEndPositions = function() {

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

angular.module('mms.designVisualization.diagramService', [
  'mms.designVisualization.symbolServices'
])
.config(['symbolManagerProvider', function (symbolManagerProvider) {

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

            offset += width / (somePorts.length + 2);

            break;

          case 'right':
            aPort.x = width;
            aPort.y = offset;
            aPort.wireAngle = 0;

            offset += height / (somePorts.length + 2);

            break;

          case 'bottom':
            aPort.x = offset;
            aPort.y = height;
            aPort.wireAngle = 90;

            offset += width / (somePorts.length + 2);

            break;

          case 'left':
            aPort.x = 0;
            aPort.y = offset;
            aPort.wireAngle = 180;

            offset += height / (somePorts.length + 2);

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


      ports = ports.concat(top).concat(right).concat(bottom).concat(left);

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

}])
.service('diagramService', [
  '$q',
  '$timeout',
  'symbolManager',
  'wiringService',
  function ($q, $timeout, symbolManager, wiringService) {

    var
    self = this,
    components = [],
    componentsById = {},

    wires = [],
    wiresById = {},
    wiresByComponentId = {},

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

      portCreator = function(componentId, ports) {

        var portInstance,
          portInstances,
          portMapping;

        portInstances = [];
        portMapping = {};

        angular.forEach(ports, function(port) {

          portInstance = new ComponentPort({
            id: componentId + '_' + port.id,
            portSymbol: port
          });

          portInstances.push(portInstance);

          portMapping[port.id] = portInstance.id;
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

      for (i = 0; i < countOfBoxes; i++) {

        typeId = symbolTypeIds[Math.floor(Math.random() * countOfTypes)];
        type = symbolTypes[typeId];

        x = Math.round(Math.random() * (canvasWidth - 1));
        y = Math.round(Math.random() * (canvasHeight - 1));

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
        }
        );

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

      if (angular.isObject(aDiagramComponent) && !angular.isDefined(componentsById[ aDiagramComponent.id ])) {

        componentsById[ aDiagramComponent.id ] = aDiagramComponent;
        components.push(aDiagramComponent);

      }

    };

    registerWireForEnds = function(wire) {

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
    
    this.addWire = function(aWire) {
      
      if (angular.isObject(aWire) && !angular.isDefined(wiresById[ aWire.id ])) {

        wiresById[ aWire.id ] = aWire;
        wires.push(aWire);

        registerWireForEnds(aWire);

      }

    };

    this.getWiresForComponents = function(components) {

      var setOfWires = [];

      angular.forEach(components, function(component) {

        angular.forEach(wiresByComponentId[component.id], function(wire) {

          if (setOfWires.indexOf(wire) === -1) {
            setOfWires.push(wire);
          }
        });

      });

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

    this.getHighestZ = function() {

      var i,
        component,
        z;

      for (i=0; i<components.length; i++) {

        component = components[i];

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

    //this.generateDummyDiagram(2000, 500, 10000, 10000);
    //this.generateDummyDiagram(1000, 2000, 10000, 10000);
    this.generateDummyDiagram(10, 2, 1200, 1200);

  }
]);
},{"./classes/ComponentPort":19,"./classes/DiagramComponent.js":20,"./classes/Wire.js":21}],23:[function(require,module,exports){
/*globals angular*/

'use strict';

var gridServicesModule = angular.module(
'mms.designVisualization.gridService',
[]);

gridServicesModule.service('gridService', [ '$log', '$rootScope', '$timeout', function ($log, $rootScope, $timeout) {

  var self = this,

  grids = {},

  numberOfChangesAllowedInOneCycle = 2000,
  recalculateCycleDelay = 10,
  viewPortPadding = {x: -300, y: -200},

  recalculateVisibleDiagramComponents,
  recalculateVisibleWires;

  recalculateVisibleWires = function (grid) {

    var index;

    angular.forEach(grid.wires, function(wire) {

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

    });

    $log.debug('Number of visible wires: ' + grid.visibleWires.length);

  };

  recalculateVisibleDiagramComponents = function (grid) {

    var i,
      component,
      countOfChanges = 0,
      changesLimitReached = false,
      index;

    grid.invisibleDiagramComponentsRecalculate = true;


    for (i=0; i < grid.components.length && !changesLimitReached; i++) {
      component = grid.components[i];
    }
    angular.forEach(grid.components, function (component) {

      index = grid.visibleDiagramComponents.indexOf(component);

      if (component.isInViewPort(grid.viewPort, viewPortPadding)) {

        if (index === -1) {
          grid.visibleDiagramComponents.push(component);
          countOfChanges++;
        }
      } else {

        if (index > -1) {
          grid.visibleDiagramComponents.splice(index, 1);
          //countOfChanges++;
        }
      }

      if (countOfChanges >= numberOfChangesAllowedInOneCycle) {
        changesLimitReached = true;
      }

    });

    self.reorderVisibleComponents(grid.id);

    recalculateVisibleWires(grid);

    $log.debug('Number of changes compared to previous diagram state:', countOfChanges);

    if (!changesLimitReached) {
      grid.invisibleDiagramComponentsRecalculate = false;
    } else {
      $timeout(function () {
        recalculateVisibleDiagramComponents(grid);
      }, recalculateCycleDelay);
    }

  };

  this.invalidateVisibleDiagramComponents = function(gridId) {

    var grid;

    grid = grids[gridId];

    if (angular.isDefined(grid)) {

      if (!grid.invisibleDiagramComponentsRecalculate) {
        $timeout(function () {
          recalculateVisibleDiagramComponents(grid);
        });
      }
    }

  };


  this.createGrid = function (id, dimensions, diagram) {

    var grid;

    if (!angular.isDefined(grids[id])) {
      grid = grids[id] = {
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
      throw('Grid was already defined!', id);
    }

    return {
      components: grid.visibleDiagramComponents,
      wires: grid.visibleWires
    };
  };


  this.setVisibleArea = function (gridId, viewPort) {
    var grid = grids[gridId];

    if (angular.isDefined(grid)) {

      if (angular.isDefined(viewPort)) {

        grid.viewPort = viewPort;

        self.invalidateVisibleDiagramComponents(grid.id);

      }

    } else {
      throw('Grid was not defined!', gridId);
    }

  };

  this.reorderVisibleComponents = function(gridId) {

    var grid = grids[gridId];

    if (angular.isDefined(grid)) {
      grid.visibleDiagramComponents.sort(function(a,b) {

        if (a.z > b.z) {
          return 1;
        }

        if (a.z < b.z) {
          return -1;
        }

        return 0;

      });
    }

  };

}]);


},{}],24:[function(require,module,exports){
/*globals angular*/

'use strict';

var symbolServicesModule = angular.module(
'mms.designVisualization.symbolServices',
[]);

symbolServicesModule.provider('symbolManager', function SymbolManagerProvider() {
  var availableSymbols = {};

  this.registerSymbol = function (symbolDescriptor) {

    if (angular.isObject(symbolDescriptor) &&
    angular.isString(symbolDescriptor.type)) {
      availableSymbols[symbolDescriptor.type] = symbolDescriptor;
    }
  };

  this.$get = [ function () {

    var SymbolManager;

    SymbolManager = function () {

      this.getAvailableSymbols = function () {
        return availableSymbols;
      };

      this.getSymbol = function(symbolType) {
        return availableSymbols[symbolType];
      };

      this.getSymbolElementForType = function (symbolType) {

        var result = availableSymbols[ symbolType ] && availableSymbols[ symbolType ].directive;

        if (!result) {
          result = 'resistor';
        }

        return result;
      };
    };

    return new SymbolManager();

  }];
});


},{}],25:[function(require,module,exports){
/*globals angular*/

'use strict';

var ElbowRouter = function() {

  var self = this;

  this.name = 'ElbowRouter';

  this.makeSegments = function(points, method) {

    var i,
    point1, elbow, point2,
    segments;

    method = method || 'verticalFirst';

    if (angular.isArray(points) && points.length >= 2) {

      segments = [];

      for (i=0; i<points.length-1; i++) {

        point1 = points[i];
        point2 = points[i+1];

        if (method === 'verticalFirst') {

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

        segments.push({

          type: 'line',

          x1: point1.x,
          y1: point1.y,

          x2: elbow.x,
          y2: elbow.y,

          router: self.name,
          orientation: (method === 'verticalFirst') ? 'vertical' : 'horizontal'

        },{

          type: 'line',

          x1: elbow.x,
          y1: elbow.y,

          x2: point2.x,
          y2: point2.y,

          router: self.name,
          orientation: (method === 'verticalFirst') ? 'horizontal' : 'vertical'

        });

      }

    }

    return segments;

  };

};

module.exports = ElbowRouter;
},{}],26:[function(require,module,exports){
/*globals angular*/

'use strict';

var SimpleRouter = function() {

  this.makeSegments = function(points) {

    var i,
      point1, point2,
      segments;

    if (angular.isArray(points) && points.length >= 2) {

      segments = [];

      for (i=0; i<points.length-1; i++) {

        point1 = points[i];
        point2 = points[i+1];

        segments.push({

          type: 'line',

          x1: point1.x,
          y1: point1.y,

          x2: point2.x,
          y2: point2.y

        });

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
'mms.designVisualization.wiringService',
[]);

wiringServicesModule.service('wiringService', [ '$log', '$rootScope', '$timeout', function () {

  var self = this,
  SimpleRouter = require('./classes/SimpleRouter.js'),
  ElbowRouter = require('./classes/ElbowRouter.js'),
  routers = {

    SimpleRouter: new SimpleRouter(),
    ElbowRouter: new ElbowRouter()

  };

  this.getSegmentsBetweenPositions = function (endPositions, routerType) {

    var segments,
    router;

    router = routers[routerType];

    if (angular.isObject(router) && angular.isFunction(router.makeSegments)) {
      segments = router.makeSegments(
      [ endPositions.end1, endPositions.end2 ]);
    }

    return segments;

  };

  this.routeWire = function (wire, routerType) {

    var router, endPositions;

    routerType = routerType || 'ElbowRouter';

    router = routers[routerType];

    if (angular.isObject(router) && angular.isFunction(router.makeSegments)) {

      endPositions = wire.getEndPositions();

      wire.segments = router.makeSegments(
      [ endPositions.end1, endPositions.end2 ]);

      wire.routerType = routerType;
    }

  };

  this.adjustWireEndSegments = function (wire) {

    var firstSegment,
    secondSegment,
    secondToLastSegment,
    lastSegment,
    endPositions,
    newSegments,
    pos;

    endPositions = wire.getEndPositions();

    if (angular.isArray(wire.segments) && wire.segments.length > 1) {

      firstSegment = wire.segments[0];

      if (firstSegment.x1 !== endPositions.end1.x || firstSegment.y1 !== endPositions.end1.y) {

        if (firstSegment.router === 'ElbowRouter') {

          secondSegment = wire.segments[1];

          pos = {
            x: secondSegment.x2,
            y: secondSegment.y2
          };

          wire.segments.splice(0,2);

        } else {
          pos = {
            x: firstSegment.x2,
            y: firstSegment.y2
          };

          wire.segments.splice(0,1);
        }

        newSegments = self.getSegmentsBetweenPositions(
        {
          end1: endPositions.end1,
          end2: pos
        },firstSegment.router);

        wire.segments = newSegments.concat(wire.segments);

      }

      lastSegment = wire.segments[wire.segments.length - 1];

      if (lastSegment.x2 !== endPositions.end2.x || lastSegment.y2 !== endPositions.end2.y) {

        if (lastSegment.router === 'ElbowRouter') {

          secondToLastSegment = wire.segments[wire.segments.length - 2];

          pos = {
            x: secondToLastSegment.x1,
            y: secondToLastSegment.y1
          };

          wire.segments.splice(wire.segments.length - 2, 2);

        } else {
          pos = {
            x: lastSegment.x1,
            y: lastSegment.y1
          };

          wire.segments.splice(wire.segments.length - 1,1);
        }

        newSegments = self.getSegmentsBetweenPositions(
        {
          end1: pos,
          end2: endPositions.end2
        },lastSegment.router);

        wire.segments = wire.segments.concat(newSegments);

      }

    } else {
      self.routeWire(wire);
    }

  };

}]);


},{"./classes/ElbowRouter.js":25,"./classes/SimpleRouter.js":26}],28:[function(require,module,exports){
'use strict';

require('Array.prototype.find');

if (!Array.prototype.findById) {
  Array.prototype.findById = function(id) {
    return this.find(function(a) {
      return a.id !== undefined && a.id === id;
    });
  };
}

if (!Array.prototype.getRandomElement) {
  Array.prototype.getRandomElement = function() {
    return this[ Math.round(Math.random() * (this.length -1 ))];
  };
}

if (!Array.prototype.shuffle) {
  Array.prototype.shuffle = function() {
    var currentIndex = this.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = this[currentIndex];
      this[currentIndex] = this[randomIndex];
      this[randomIndex] = temporaryValue;
    }

    return this;
  };
}
},{"Array.prototype.find":2}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvbW1zQXBwL2FwcC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvQXJyYXkucHJvdG90eXBlLmZpbmQvaW5kZXguanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9ib3dlcl9jb21wb25lbnRzL2dsLW1hdHJpeC9kaXN0L2dsLW1hdHJpeC1taW4uanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2NvbXBvbmVudFdpcmUvY29tcG9uZW50V2lyZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvY29tcG9uZW50V2lyZS9jb21wb25lbnRXaXJlU2VnbWVudC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvZGlhZ3JhbUNvbnRhaW5lci9kaWFncmFtQ29udGFpbmVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9kcmF3aW5nQ2FudmFzL2RyYXdpbmdDYW52YXMuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL2ZhYnJpY0NhbnZhcy9mYWJyaWNDYW52YXMuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3BvcnQvcG9ydC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ZnRGlhZ3JhbS9zdmdEaWFncmFtLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvZGlyZWN0aXZlcy9zeW1ib2xzL2JveC9ib3guanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvY2FwYWNpdG9yL2NhcGFjaXRvci5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL2RpcmVjdGl2ZXMvc3ltYm9scy9jb21wb25lbnRTeW1ib2wuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvZGlvZGUvZGlvZGUuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvaW5kdWN0b3IvaW5kdWN0b3IuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvakZldFAvakZldFAuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvb3BBbXAvb3BBbXAuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9kaXJlY3RpdmVzL3N5bWJvbHMvcmVzaXN0b3IvcmVzaXN0b3IuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL0NvbXBvbmVudFBvcnQuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL0RpYWdyYW1Db21wb25lbnQuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9jbGFzc2VzL1dpcmUuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy9kaWFncmFtU2VydmljZS9kaWFncmFtU2VydmljZS5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9hcHAvbW1zQXBwL3NlcnZpY2VzL2dyaWRTZXJ2aWNlL2dyaWRTZXJ2aWNlLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvc3ltYm9sU2VydmljZXMvc3ltYm9sU2VydmljZXMuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy93aXJpbmdTZXJ2aWNlL2NsYXNzZXMvRWxib3dSb3V0ZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC9zZXJ2aWNlcy93aXJpbmdTZXJ2aWNlL2NsYXNzZXMvU2ltcGxlUm91dGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvc2VydmljZXMvd2lyaW5nU2VydmljZS93aXJpbmdTZXJ2aWNlLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9tbXNBcHAvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnLCBbXG4gICd1aS5yb3V0ZXInLFxuXG4gICdnbWUuc2VydmljZXMnLFxuXG4gICdpc2lzLnVpLmNvbXBvbmVudHMnLFxuXG4gICdjeXBoeS5jb21wb25lbnRzJyxcblxuICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXG4gICdjeXBoeS5tbXNBcHAudGVtcGxhdGVzJyxcblxuICAndWkuYm9vdHN0cmFwJyxcblxuICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ud2lyaW5nU2VydmljZScsXG4gICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kaWFncmFtU2VydmljZScsXG5cbiAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRpYWdyYW1Db250YWluZXInLFxuICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZmFicmljQ2FudmFzJyxcbiAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN2Z0RpYWdyYW0nXG5dKTtcblxucmVxdWlyZSgnLi91dGlscy5qcycpO1xuXG5yZXF1aXJlKCcuL3NlcnZpY2VzL2RpYWdyYW1TZXJ2aWNlL2RpYWdyYW1TZXJ2aWNlLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL2dyaWRTZXJ2aWNlL2dyaWRTZXJ2aWNlLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL3dpcmluZ1NlcnZpY2Uvd2lyaW5nU2VydmljZS5qcycpO1xuXG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZGlhZ3JhbUNvbnRhaW5lci9kaWFncmFtQ29udGFpbmVyLmpzJyk7XG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZmFicmljQ2FudmFzL2ZhYnJpY0NhbnZhcy5qcycpO1xucmVxdWlyZSgnLi9kaXJlY3RpdmVzL3N2Z0RpYWdyYW0vc3ZnRGlhZ3JhbS5qcycpO1xuXG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMvc3ltYm9scy9jb21wb25lbnRTeW1ib2wuanMnKTtcblxuQ3lQaHlBcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cbiAgdmFyIHNlbGVjdFByb2plY3Q7XG5cbiAgc2VsZWN0UHJvamVjdCA9IHtcbiAgICBsb2FkOiBmdW5jdGlvbiAoJHEsICRzdGF0ZVBhcmFtcywgJHJvb3RTY29wZSwgJHN0YXRlLCAkbG9nLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSkge1xuICAgICAgdmFyXG4gICAgICAgIGNvbm5lY3Rpb25JZCxcbiAgICAgICAgZGVmZXJyZWQ7XG5cbiAgICAgICRyb290U2NvcGUubWFpbkRiQ29ubmVjdGlvbklkID0gJ21tcy1tYWluLWRiLWNvbm5lY3Rpb24taWQnO1xuXG4gICAgICBjb25uZWN0aW9uSWQgPSAkcm9vdFNjb3BlLm1haW5EYkNvbm5lY3Rpb25JZDtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gdHJ1ZTtcblxuICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZShjb25uZWN0aW9uSWQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoY29ubmVjdGlvbklkLCAkc3RhdGVQYXJhbXMucHJvamVjdElkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHByb2plY3RJZCkge1xuICAgICAgICAgICRyb290U2NvcGUucHJvamVjdElkID0gcHJvamVjdElkO1xuICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvamVjdElkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkbG9nLmRlYnVnKCdPcGVuaW5nIHByb2plY3QgZXJyb3JlZDonLCAkc3RhdGVQYXJhbXMucHJvamVjdElkLCByZWFzb24pO1xuICAgICAgICAgICRzdGF0ZS5nbygnNDA0Jywge1xuICAgICAgICAgICAgcHJvamVjdElkOiAkc3RhdGVQYXJhbXMucHJvamVjdElkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL25vUHJvamVjdCcpO1xuXG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ3Byb2plY3QnLCB7XG4gICAgICB1cmw6ICcvcHJvamVjdC86cHJvamVjdElkJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZWRpdG9yLmh0bWwnLFxuICAgICAgcmVzb2x2ZTogc2VsZWN0UHJvamVjdCxcbiAgICAgIGNvbnRyb2xsZXI6ICdQcm9qZWN0Vmlld0NvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ25vUHJvamVjdCcsIHtcbiAgICAgIHVybDogJy9ub1Byb2plY3QnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9ub1Byb2plY3RTcGVjaWZpZWQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTm9Qcm9qZWN0Q29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnNDA0Jywge1xuICAgICAgdXJsOiAnLzQwNC86cHJvamVjdElkJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdOb1Byb2plY3RDb250cm9sbGVyJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvNDA0Lmh0bWwnXG4gICAgfSk7XG59KTtcblxuQ3lQaHlBcHAuY29udHJvbGxlcignTWFpbk5hdmlnYXRvckNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlLCAkd2luZG93KSB7XG5cbiAgdmFyIGRlZmF1bHROYXZpZ2F0b3JJdGVtcztcblxuICBkZWZhdWx0TmF2aWdhdG9ySXRlbXMgPSBbXG4gICAgICB7XG4gICAgICAgIGlkOiAncm9vdCcsXG4gICAgICAgIGxhYmVsOiAnTU1TIEFwcCcsXG4gICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnXG4gICAgICB9XG4gICAgXTtcblxuICAkc2NvcGUubmF2aWdhdG9yID0ge1xuICAgIHNlcGFyYXRvcjogdHJ1ZSxcbiAgICBpdGVtczogYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pXG4gIH07XG5cbiAgJHJvb3RTY29wZS4kd2F0Y2goJ3Byb2plY3RJZCcsIGZ1bmN0aW9uKHByb2plY3RJZCkge1xuXG4gICAgaWYgKHByb2plY3RJZCkge1xuXG4gICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pO1xuICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcy5wdXNoKHtcbiAgICAgICAgaWQ6ICdwcm9qZWN0JyxcbiAgICAgICAgbGFiZWw6IHByb2plY3RJZCxcbiAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD0nICsgcHJvamVjdElkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IGFuZ3VsYXIuY29weShkZWZhdWx0TmF2aWdhdG9ySXRlbXMsIFtdKTtcbiAgICB9XG5cbiAgfSk7XG5cbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdQcm9qZWN0Vmlld0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBkaWFncmFtU2VydmljZSwgJGxvZykge1xuXG4gICRzY29wZS5kaWFncmFtID0gZGlhZ3JhbVNlcnZpY2UuZ2V0RGlhZ3JhbSgpO1xuXG4gICRsb2cuZGVidWcoJ0RpYWdyYW06JywgJHNjb3BlLmRpYWdyYW0pO1xuXG59KTtcblxuQ3lQaHlBcHAuY29udHJvbGxlcignTm9Qcm9qZWN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc2NvcGUsICRzdGF0ZVBhcmFtcywgJGh0dHAsICRsb2csICRzdGF0ZSwgZ3Jvd2wpIHtcblxuICAkc2NvcGUucHJvamVjdElkID0gJHN0YXRlUGFyYW1zLnByb2plY3RJZDtcbiAgJHNjb3BlLmVycm9yZWQgPSBmYWxzZTtcblxuICAkc2NvcGUuc3RhcnROZXdQcm9qZWN0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgJHJvb3RTY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcblxuICAgICRsb2cuZGVidWcoJ05ldyBwcm9qZWN0IGNyZWF0aW9uJyk7XG5cbiAgICAkaHR0cC5nZXQoJy9yZXN0L2V4dGVybmFsL2NvcHlwcm9qZWN0L25vcmVkaXJlY3QnKS5cbiAgICAgIHN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAkcm9vdFNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJGxvZy5kZWJ1ZygnTmV3IHByb2plY3QgY3JlYXRpb24gc3VjY2Vzc2Z1bCcsIGRhdGEpO1xuICAgICAgICAkc3RhdGUuZ28oJ3Byb2plY3QnLCB7XG4gICAgICAgICAgcHJvamVjdElkOiBkYXRhXG4gICAgICAgIH0pO1xuXG4gICAgICB9KS5cbiAgICAgIGVycm9yKGZ1bmN0aW9uIChkYXRhLCBzdGF0dXMpIHtcblxuICAgICAgICAkbG9nLmRlYnVnKCdOZXcgcHJvamVjdCBjcmVhdGlvbiBmYWlsZWQnLCBzdGF0dXMpO1xuICAgICAgICAkcm9vdFNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgZ3Jvd2wuZXJyb3IoJ0FuIGVycm9yIG9jY3VyZWQgd2hpbGUgcHJvamVjdCBjcmVhdGlvbi4gUGxlYXNlIHJldHJ5IGxhdGVyLicpO1xuXG4gICAgICB9KTtcblxuICB9O1xuXG59KTtcblxuXG4vL0N5UGh5QXBwLnJ1bihmdW5jdGlvbiAoJHN0YXRlLCBncm93bCwgZGF0YVN0b3JlU2VydmljZSwgcHJvamVjdFNlcnZpY2UpIHtcblxuLy8gIHZhciBjb25uZWN0aW9uSWQgPSAnbW1zLWNvbm5lY3Rpb24taWQnO1xuLy9cbi8vICBkYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKGNvbm5lY3Rpb25JZCwge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXG4vLyAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4vLyAgICAgIC8vIHNlbGVjdCBkZWZhdWx0IHByb2plY3QgYW5kIGJyYW5jaCAobWFzdGVyKVxuLy8gICAgICByZXR1cm4gcHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdChjb25uZWN0aW9uSWQsICdBRE1FZGl0b3InKTtcbi8vICAgIH0pXG4vLyAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuLy8gICAgICBncm93bC5lcnJvcignQURNRWRpdG9yIGRvZXMgbm90IGV4aXN0LiBDcmVhdGUgYW5kIGltcG9ydCBpdCB1c2luZyB0aGUgPGEgaHJlZj1cIicgK1xuLy8gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnXCI+IHdlYmdtZSBpbnRlcmZhY2U8L2E+LicpO1xuLy8gICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XG4vLyAgICB9KTtcbi8vfSk7IiwiLy8gQXJyYXkucHJvdG90eXBlLmZpbmQgLSBNSVQgTGljZW5zZSAoYykgMjAxMyBQYXVsIE1pbGxlciA8aHR0cDovL3BhdWxtaWxsci5jb20+XG4vLyBGb3IgYWxsIGRldGFpbHMgYW5kIGRvY3M6IGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsbWlsbHIvYXJyYXkucHJvdG90eXBlLmZpbmRcbi8vIEZpeGVzIGFuZCB0ZXN0cyBzdXBwbGllZCBieSBEdW5jYW4gSGFsbCA8aHR0cDovL2R1bmNhbmhhbGwubmV0PiBcbihmdW5jdGlvbihnbG9iYWxzKXtcbiAgaWYgKEFycmF5LnByb3RvdHlwZS5maW5kKSByZXR1cm47XG5cbiAgdmFyIGZpbmQgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICB2YXIgbGlzdCA9IE9iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGggPCAwID8gMCA6IGxpc3QubGVuZ3RoID4+PiAwOyAvLyBFUy5Ub1VpbnQzMjtcbiAgICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgcHJlZGljYXRlICE9PSAnZnVuY3Rpb24nIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcmVkaWNhdGUpICE9PSAnW29iamVjdCBGdW5jdGlvbl0nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheSNmaW5kOiBwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzFdO1xuICAgIGZvciAodmFyIGkgPSAwLCB2YWx1ZTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG5cbiAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkge1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCAnZmluZCcsIHtcbiAgICAgICAgdmFsdWU6IGZpbmQsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZpbmQgPSBmaW5kO1xuICB9XG59KSh0aGlzKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcbiAqIEBhdXRob3IgQnJhbmRvbiBKb25lc1xuICogQGF1dGhvciBDb2xpbiBNYWNLZW56aWUgSVZcbiAqIEB2ZXJzaW9uIDIuMi4xXG4gKi9cbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb25cbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRVxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuKGZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PXt9O3R5cGVvZiBleHBvcnRzPT1cInVuZGVmaW5lZFwiP3R5cGVvZiBkZWZpbmU9PVwiZnVuY3Rpb25cIiYmdHlwZW9mIGRlZmluZS5hbWQ9PVwib2JqZWN0XCImJmRlZmluZS5hbWQ/KHQuZXhwb3J0cz17fSxkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gdC5leHBvcnRzfSkpOnQuZXhwb3J0cz10eXBlb2Ygd2luZG93IT1cInVuZGVmaW5lZFwiP3dpbmRvdzplOnQuZXhwb3J0cz1leHBvcnRzLGZ1bmN0aW9uKGUpe2lmKCF0KXZhciB0PTFlLTY7aWYoIW4pdmFyIG49dHlwZW9mIEZsb2F0MzJBcnJheSE9XCJ1bmRlZmluZWRcIj9GbG9hdDMyQXJyYXk6QXJyYXk7aWYoIXIpdmFyIHI9TWF0aC5yYW5kb207dmFyIGk9e307aS5zZXRNYXRyaXhBcnJheVR5cGU9ZnVuY3Rpb24oZSl7bj1lfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUuZ2xNYXRyaXg9aSk7dmFyIHM9TWF0aC5QSS8xODA7aS50b1JhZGlhbj1mdW5jdGlvbihlKXtyZXR1cm4gZSpzfTt2YXIgbz17fTtvLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDIpO3JldHVybiBlWzBdPTAsZVsxXT0wLGV9LG8uY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMik7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdH0sby5mcm9tVmFsdWVzPWZ1bmN0aW9uKGUsdCl7dmFyIHI9bmV3IG4oMik7cmV0dXJuIHJbMF09ZSxyWzFdPXQscn0sby5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZX0sby5zZXQ9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXQsZVsxXT1uLGV9LG8uYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZX0sby5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGV9LG8uc3ViPW8uc3VidHJhY3Qsby5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGV9LG8ubXVsPW8ubXVsdGlwbHksby5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlfSxvLmRpdj1vLmRpdmlkZSxvLm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZX0sby5tYXg9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWF4KHRbMF0sblswXSksZVsxXT1NYXRoLm1heCh0WzFdLG5bMV0pLGV9LG8uc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qbixlWzFdPXRbMV0qbixlfSxvLnNjYWxlQW5kQWRkPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXRbMF0rblswXSpyLGVbMV09dFsxXStuWzFdKnIsZX0sby5kaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXTtyZXR1cm4gTWF0aC5zcXJ0KG4qbityKnIpfSxvLmRpc3Q9by5kaXN0YW5jZSxvLnNxdWFyZWREaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXTtyZXR1cm4gbipuK3Iqcn0sby5zcXJEaXN0PW8uc3F1YXJlZERpc3RhbmNlLG8ubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdO3JldHVybiBNYXRoLnNxcnQodCp0K24qbil9LG8ubGVuPW8ubGVuZ3RoLG8uc3F1YXJlZExlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXTtyZXR1cm4gdCp0K24qbn0sby5zcXJMZW49by5zcXVhcmVkTGVuZ3RoLG8ubmVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlfSxvLm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9bipuK3IqcjtyZXR1cm4gaT4wJiYoaT0xL01hdGguc3FydChpKSxlWzBdPXRbMF0qaSxlWzFdPXRbMV0qaSksZX0sby5kb3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXSp0WzBdK2VbMV0qdFsxXX0sby5jcm9zcz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSpuWzFdLXRbMV0qblswXTtyZXR1cm4gZVswXT1lWzFdPTAsZVsyXT1yLGV9LG8ubGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXTtyZXR1cm4gZVswXT1pK3IqKG5bMF0taSksZVsxXT1zK3IqKG5bMV0tcyksZX0sby5yYW5kb209ZnVuY3Rpb24oZSx0KXt0PXR8fDE7dmFyIG49cigpKjIqTWF0aC5QSTtyZXR1cm4gZVswXT1NYXRoLmNvcyhuKSp0LGVbMV09TWF0aC5zaW4obikqdCxlfSxvLnRyYW5zZm9ybU1hdDI9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzJdKmksZVsxXT1uWzFdKnIrblszXSppLGV9LG8udHJhbnNmb3JtTWF0MmQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzJdKmkrbls0XSxlWzFdPW5bMV0qcituWzNdKmkrbls1XSxlfSxvLnRyYW5zZm9ybU1hdDM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzNdKmkrbls2XSxlWzFdPW5bMV0qcituWzRdKmkrbls3XSxlfSxvLnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzRdKmkrblsxMl0sZVsxXT1uWzFdKnIrbls1XSppK25bMTNdLGV9LG8uZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPW8uY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTIpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV07cmV0dXJuIHR9fSgpLG8uc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjMihcIitlWzBdK1wiLCBcIitlWzFdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjMj1vKTt2YXIgdT17fTt1LmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDMpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlfSx1LmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDMpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0fSx1LmZyb21WYWx1ZXM9ZnVuY3Rpb24oZSx0LHIpe3ZhciBpPW5ldyBuKDMpO3JldHVybiBpWzBdPWUsaVsxXT10LGlbMl09cixpfSx1LmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZX0sdS5zZXQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dCxlWzFdPW4sZVsyXT1yLGV9LHUuYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZVsyXT10WzJdK25bMl0sZX0sdS5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGVbMl09dFsyXS1uWzJdLGV9LHUuc3ViPXUuc3VidHJhY3QsdS5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGVbMl09dFsyXSpuWzJdLGV9LHUubXVsPXUubXVsdGlwbHksdS5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlWzJdPXRbMl0vblsyXSxlfSx1LmRpdj11LmRpdmlkZSx1Lm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZVsyXT1NYXRoLm1pbih0WzJdLG5bMl0pLGV9LHUubWF4PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1heCh0WzBdLG5bMF0pLGVbMV09TWF0aC5tYXgodFsxXSxuWzFdKSxlWzJdPU1hdGgubWF4KHRbMl0sblsyXSksZX0sdS5zY2FsZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuLGVbMV09dFsxXSpuLGVbMl09dFsyXSpuLGV9LHUuc2NhbGVBbmRBZGQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dFswXStuWzBdKnIsZVsxXT10WzFdK25bMV0qcixlWzJdPXRbMl0rblsyXSpyLGV9LHUuZGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl07cmV0dXJuIE1hdGguc3FydChuKm4rcipyK2kqaSl9LHUuZGlzdD11LmRpc3RhbmNlLHUuc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdO3JldHVybiBuKm4rcipyK2kqaX0sdS5zcXJEaXN0PXUuc3F1YXJlZERpc3RhbmNlLHUubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXTtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtuKm4rcipyKX0sdS5sZW49dS5sZW5ndGgsdS5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXTtyZXR1cm4gdCp0K24qbityKnJ9LHUuc3FyTGVuPXUuc3F1YXJlZExlbmd0aCx1Lm5lZ2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlfSx1Lm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPW4qbityKnIraSppO3JldHVybiBzPjAmJihzPTEvTWF0aC5zcXJ0KHMpLGVbMF09dFswXSpzLGVbMV09dFsxXSpzLGVbMl09dFsyXSpzKSxlfSx1LmRvdD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdKnRbMF0rZVsxXSp0WzFdK2VbMl0qdFsyXX0sdS5jcm9zcz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89blswXSx1PW5bMV0sYT1uWzJdO3JldHVybiBlWzBdPWkqYS1zKnUsZVsxXT1zKm8tciphLGVbMl09cip1LWkqbyxlfSx1LmxlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdO3JldHVybiBlWzBdPWkrciooblswXS1pKSxlWzFdPXMrciooblsxXS1zKSxlWzJdPW8rciooblsyXS1vKSxlfSx1LnJhbmRvbT1mdW5jdGlvbihlLHQpe3Q9dHx8MTt2YXIgbj1yKCkqMipNYXRoLlBJLGk9cigpKjItMSxzPU1hdGguc3FydCgxLWkqaSkqdDtyZXR1cm4gZVswXT1NYXRoLmNvcyhuKSpzLGVbMV09TWF0aC5zaW4obikqcyxlWzJdPWkqdCxlfSx1LnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bOF0qcytuWzEyXSxlWzFdPW5bMV0qcituWzVdKmkrbls5XSpzK25bMTNdLGVbMl09blsyXSpyK25bNl0qaStuWzEwXSpzK25bMTRdLGV9LHUudHJhbnNmb3JtTWF0Mz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdO3JldHVybiBlWzBdPXIqblswXStpKm5bM10rcypuWzZdLGVbMV09cipuWzFdK2kqbls0XStzKm5bN10sZVsyXT1yKm5bMl0raSpuWzVdK3Mqbls4XSxlfSx1LnRyYW5zZm9ybVF1YXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPW5bMF0sdT1uWzFdLGE9blsyXSxmPW5bM10sbD1mKnIrdSpzLWEqaSxjPWYqaSthKnItbypzLGg9ZipzK28qaS11KnIscD0tbypyLXUqaS1hKnM7cmV0dXJuIGVbMF09bCpmK3AqLW8rYyotYS1oKi11LGVbMV09YypmK3AqLXUraCotby1sKi1hLGVbMl09aCpmK3AqLWErbCotdS1jKi1vLGV9LHUucm90YXRlWD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT1bXSxzPVtdO3JldHVybiBpWzBdPXRbMF0tblswXSxpWzFdPXRbMV0tblsxXSxpWzJdPXRbMl0tblsyXSxzWzBdPWlbMF0sc1sxXT1pWzFdKk1hdGguY29zKHIpLWlbMl0qTWF0aC5zaW4ociksc1syXT1pWzFdKk1hdGguc2luKHIpK2lbMl0qTWF0aC5jb3MociksZVswXT1zWzBdK25bMF0sZVsxXT1zWzFdK25bMV0sZVsyXT1zWzJdK25bMl0sZX0sdS5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPVtdLHM9W107cmV0dXJuIGlbMF09dFswXS1uWzBdLGlbMV09dFsxXS1uWzFdLGlbMl09dFsyXS1uWzJdLHNbMF09aVsyXSpNYXRoLnNpbihyKStpWzBdKk1hdGguY29zKHIpLHNbMV09aVsxXSxzWzJdPWlbMl0qTWF0aC5jb3MociktaVswXSpNYXRoLnNpbihyKSxlWzBdPXNbMF0rblswXSxlWzFdPXNbMV0rblsxXSxlWzJdPXNbMl0rblsyXSxlfSx1LnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9W10scz1bXTtyZXR1cm4gaVswXT10WzBdLW5bMF0saVsxXT10WzFdLW5bMV0saVsyXT10WzJdLW5bMl0sc1swXT1pWzBdKk1hdGguY29zKHIpLWlbMV0qTWF0aC5zaW4ociksc1sxXT1pWzBdKk1hdGguc2luKHIpK2lbMV0qTWF0aC5jb3Mociksc1syXT1pWzJdLGVbMF09c1swXStuWzBdLGVbMV09c1sxXStuWzFdLGVbMl09c1syXStuWzJdLGV9LHUuZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPXUuY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTMpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxlWzJdPXRbdSsyXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV0sdFt1KzJdPWVbMl07cmV0dXJuIHR9fSgpLHUuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjMyhcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjMz11KTt2YXIgYT17fTthLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDQpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTAsZX0sYS5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig0KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHR9LGEuZnJvbVZhbHVlcz1mdW5jdGlvbihlLHQscixpKXt2YXIgcz1uZXcgbig0KTtyZXR1cm4gc1swXT1lLHNbMV09dCxzWzJdPXIsc1szXT1pLHN9LGEuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZX0sYS5zZXQ9ZnVuY3Rpb24oZSx0LG4scixpKXtyZXR1cm4gZVswXT10LGVbMV09bixlWzJdPXIsZVszXT1pLGV9LGEuYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZVsyXT10WzJdK25bMl0sZVszXT10WzNdK25bM10sZX0sYS5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGVbMl09dFsyXS1uWzJdLGVbM109dFszXS1uWzNdLGV9LGEuc3ViPWEuc3VidHJhY3QsYS5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGVbMl09dFsyXSpuWzJdLGVbM109dFszXSpuWzNdLGV9LGEubXVsPWEubXVsdGlwbHksYS5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlWzJdPXRbMl0vblsyXSxlWzNdPXRbM10vblszXSxlfSxhLmRpdj1hLmRpdmlkZSxhLm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZVsyXT1NYXRoLm1pbih0WzJdLG5bMl0pLGVbM109TWF0aC5taW4odFszXSxuWzNdKSxlfSxhLm1heD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5tYXgodFswXSxuWzBdKSxlWzFdPU1hdGgubWF4KHRbMV0sblsxXSksZVsyXT1NYXRoLm1heCh0WzJdLG5bMl0pLGVbM109TWF0aC5tYXgodFszXSxuWzNdKSxlfSxhLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm4sZVsxXT10WzFdKm4sZVsyXT10WzJdKm4sZVszXT10WzNdKm4sZX0sYS5zY2FsZUFuZEFkZD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10WzBdK25bMF0qcixlWzFdPXRbMV0rblsxXSpyLGVbMl09dFsyXStuWzJdKnIsZVszXT10WzNdK25bM10qcixlfSxhLmRpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdLHM9dFszXS1lWzNdO3JldHVybiBNYXRoLnNxcnQobipuK3IqcitpKmkrcypzKX0sYS5kaXN0PWEuZGlzdGFuY2UsYS5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl0scz10WzNdLWVbM107cmV0dXJuIG4qbityKnIraSppK3Mqc30sYS5zcXJEaXN0PWEuc3F1YXJlZERpc3RhbmNlLGEubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM107cmV0dXJuIE1hdGguc3FydCh0KnQrbipuK3IqcitpKmkpfSxhLmxlbj1hLmxlbmd0aCxhLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXTtyZXR1cm4gdCp0K24qbityKnIraSppfSxhLnNxckxlbj1hLnNxdWFyZWRMZW5ndGgsYS5uZWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZVszXT0tdFszXSxlfSxhLm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKm4rcipyK2kqaStzKnM7cmV0dXJuIG8+MCYmKG89MS9NYXRoLnNxcnQobyksZVswXT10WzBdKm8sZVsxXT10WzFdKm8sZVsyXT10WzJdKm8sZVszXT10WzNdKm8pLGV9LGEuZG90PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0qdFswXStlWzFdKnRbMV0rZVsyXSp0WzJdK2VbM10qdFszXX0sYS5sZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXSx1PXRbM107cmV0dXJuIGVbMF09aStyKihuWzBdLWkpLGVbMV09cytyKihuWzFdLXMpLGVbMl09bytyKihuWzJdLW8pLGVbM109dStyKihuWzNdLXUpLGV9LGEucmFuZG9tPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIHQ9dHx8MSxlWzBdPXIoKSxlWzFdPXIoKSxlWzJdPXIoKSxlWzNdPXIoKSxhLm5vcm1hbGl6ZShlLGUpLGEuc2NhbGUoZSxlLHQpLGV9LGEudHJhbnNmb3JtTWF0ND1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bOF0qcytuWzEyXSpvLGVbMV09blsxXSpyK25bNV0qaStuWzldKnMrblsxM10qbyxlWzJdPW5bMl0qcituWzZdKmkrblsxMF0qcytuWzE0XSpvLGVbM109blszXSpyK25bN10qaStuWzExXSpzK25bMTVdKm8sZX0sYS50cmFuc2Zvcm1RdWF0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz1uWzBdLHU9blsxXSxhPW5bMl0sZj1uWzNdLGw9ZipyK3Uqcy1hKmksYz1mKmkrYSpyLW8qcyxoPWYqcytvKmktdSpyLHA9LW8qci11KmktYSpzO3JldHVybiBlWzBdPWwqZitwKi1vK2MqLWEtaCotdSxlWzFdPWMqZitwKi11K2gqLW8tbCotYSxlWzJdPWgqZitwKi1hK2wqLXUtYyotbyxlfSxhLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT1hLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj00KSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0sZVsyXT10W3UrMl0sZVszXT10W3UrM10scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdLHRbdSsyXT1lWzJdLHRbdSszXT1lWzNdO3JldHVybiB0fX0oKSxhLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzQ9YSk7dmFyIGY9e307Zi5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig0KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGV9LGYuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNCk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0fSxmLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGV9LGYuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxmLnRyYW5zcG9zZT1mdW5jdGlvbihlLHQpe2lmKGU9PT10KXt2YXIgbj10WzFdO2VbMV09dFsyXSxlWzJdPW59ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzJdLGVbMl09dFsxXSxlWzNdPXRbM107cmV0dXJuIGV9LGYuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qcy1pKnI7cmV0dXJuIG8/KG89MS9vLGVbMF09cypvLGVbMV09LXIqbyxlWzJdPS1pKm8sZVszXT1uKm8sZSk6bnVsbH0sZi5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXTtyZXR1cm4gZVswXT10WzNdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlWzNdPW4sZX0sZi5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXtyZXR1cm4gZVswXSplWzNdLWVbMl0qZVsxXX0sZi5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdLGY9blsyXSxsPW5bM107cmV0dXJuIGVbMF09cip1K3MqYSxlWzFdPWkqdStvKmEsZVsyXT1yKmYrcypsLGVbM109aSpmK28qbCxlfSxmLm11bD1mLm11bHRpcGx5LGYucm90YXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmErcyp1LGVbMV09aSphK28qdSxlWzJdPXIqLXUrcyphLGVbM109aSotdStvKmEsZX0sZi5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdO3JldHVybiBlWzBdPXIqdSxlWzFdPWkqdSxlWzJdPXMqYSxlWzNdPW8qYSxlfSxmLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDIoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sZi5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKSl9LGYuTERVPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzJdPXJbMl0vclswXSxuWzBdPXJbMF0sblsxXT1yWzFdLG5bM109clszXS1lWzJdKm5bMV0sW2UsdCxuXX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDI9Zik7dmFyIGw9e307bC5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig2KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGVbNF09MCxlWzVdPTAsZX0sbC5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig2KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdH0sbC5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGV9LGwuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlWzRdPTAsZVs1XT0wLGV9LGwuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9bipzLXIqaTtyZXR1cm4gYT8oYT0xL2EsZVswXT1zKmEsZVsxXT0tciphLGVbMl09LWkqYSxlWzNdPW4qYSxlWzRdPShpKnUtcypvKSphLGVbNV09KHIqby1uKnUpKmEsZSk6bnVsbH0sbC5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXtyZXR1cm4gZVswXSplWzNdLWVbMV0qZVsyXX0sbC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV0sYz1uWzJdLGg9blszXSxwPW5bNF0sZD1uWzVdO3JldHVybiBlWzBdPXIqZitzKmwsZVsxXT1pKmYrbypsLGVbMl09cipjK3MqaCxlWzNdPWkqYytvKmgsZVs0XT1yKnArcypkK3UsZVs1XT1pKnArbypkK2EsZX0sbC5tdWw9bC5tdWx0aXBseSxsLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9TWF0aC5zaW4obiksbD1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmwrcypmLGVbMV09aSpsK28qZixlWzJdPXIqLWYrcypsLGVbM109aSotZitvKmwsZVs0XT11LGVbNV09YSxlfSxsLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj1uWzBdLGw9blsxXTtyZXR1cm4gZVswXT1yKmYsZVsxXT1pKmYsZVsyXT1zKmwsZVszXT1vKmwsZVs0XT11LGVbNV09YSxlfSxsLnRyYW5zbGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV07cmV0dXJuIGVbMF09cixlWzFdPWksZVsyXT1zLGVbM109byxlWzRdPXIqZitzKmwrdSxlWzVdPWkqZitvKmwrYSxlfSxsLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDJkKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIpXCJ9LGwuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpKzEpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0MmQ9bCk7dmFyIGM9e307Yy5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig5KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MSxlWzVdPTAsZVs2XT0wLGVbN109MCxlWzhdPTEsZX0sYy5mcm9tTWF0ND1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbNF0sZVs0XT10WzVdLGVbNV09dFs2XSxlWzZdPXRbOF0sZVs3XT10WzldLGVbOF09dFsxMF0sZX0sYy5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig5KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdFs2XT1lWzZdLHRbN109ZVs3XSx0WzhdPWVbOF0sdH0sYy5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGV9LGMuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTEsZVs1XT0wLGVbNl09MCxlWzddPTAsZVs4XT0xLGV9LGMudHJhbnNwb3NlPWZ1bmN0aW9uKGUsdCl7aWYoZT09PXQpe3ZhciBuPXRbMV0scj10WzJdLGk9dFs1XTtlWzFdPXRbM10sZVsyXT10WzZdLGVbM109bixlWzVdPXRbN10sZVs2XT1yLGVbN109aX1lbHNlIGVbMF09dFswXSxlWzFdPXRbM10sZVsyXT10WzZdLGVbM109dFsxXSxlWzRdPXRbNF0sZVs1XT10WzddLGVbNl09dFsyXSxlWzddPXRbNV0sZVs4XT10WzhdO3JldHVybiBlfSxjLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPWwqby11KmYsaD0tbCpzK3UqYSxwPWYqcy1vKmEsZD1uKmMrcipoK2kqcDtyZXR1cm4gZD8oZD0xL2QsZVswXT1jKmQsZVsxXT0oLWwqcitpKmYpKmQsZVsyXT0odSpyLWkqbykqZCxlWzNdPWgqZCxlWzRdPShsKm4taSphKSpkLGVbNV09KC11Km4raSpzKSpkLGVbNl09cCpkLGVbN109KC1mKm4rciphKSpkLGVbOF09KG8qbi1yKnMpKmQsZSk6bnVsbH0sYy5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdO3JldHVybiBlWzBdPW8qbC11KmYsZVsxXT1pKmYtcipsLGVbMl09cip1LWkqbyxlWzNdPXUqYS1zKmwsZVs0XT1uKmwtaSphLGVbNV09aSpzLW4qdSxlWzZdPXMqZi1vKmEsZVs3XT1yKmEtbipmLGVbOF09bipvLXIqcyxlfSxjLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM10scz1lWzRdLG89ZVs1XSx1PWVbNl0sYT1lWzddLGY9ZVs4XTtyZXR1cm4gdCooZipzLW8qYSkrbiooLWYqaStvKnUpK3IqKGEqaS1zKnUpfSxjLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD1uWzBdLHA9blsxXSxkPW5bMl0sdj1uWzNdLG09bls0XSxnPW5bNV0seT1uWzZdLGI9bls3XSx3PW5bOF07cmV0dXJuIGVbMF09aCpyK3AqbytkKmYsZVsxXT1oKmkrcCp1K2QqbCxlWzJdPWgqcytwKmErZCpjLGVbM109dipyK20qbytnKmYsZVs0XT12KmkrbSp1K2cqbCxlWzVdPXYqcyttKmErZypjLGVbNl09eSpyK2Iqbyt3KmYsZVs3XT15KmkrYip1K3cqbCxlWzhdPXkqcytiKmErdypjLGV9LGMubXVsPWMubXVsdGlwbHksYy50cmFuc2xhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPW5bMF0scD1uWzFdO3JldHVybiBlWzBdPXIsZVsxXT1pLGVbMl09cyxlWzNdPW8sZVs0XT11LGVbNV09YSxlWzZdPWgqcitwKm8rZixlWzddPWgqaStwKnUrbCxlWzhdPWgqcytwKmErYyxlfSxjLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9TWF0aC5zaW4obikscD1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1wKnIraCpvLGVbMV09cCppK2gqdSxlWzJdPXAqcytoKmEsZVszXT1wKm8taCpyLGVbNF09cCp1LWgqaSxlWzVdPXAqYS1oKnMsZVs2XT1mLGVbN109bCxlWzhdPWMsZX0sYy5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV07cmV0dXJuIGVbMF09cip0WzBdLGVbMV09cip0WzFdLGVbMl09cip0WzJdLGVbM109aSp0WzNdLGVbNF09aSp0WzRdLGVbNV09aSp0WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGV9LGMuZnJvbU1hdDJkPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT0wLGVbM109dFsyXSxlWzRdPXRbM10sZVs1XT0wLGVbNl09dFs0XSxlWzddPXRbNV0sZVs4XT0xLGV9LGMuZnJvbVF1YXQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bituLHU9cityLGE9aStpLGY9bipvLGw9cipvLGM9cip1LGg9aSpvLHA9aSp1LGQ9aSphLHY9cypvLG09cyp1LGc9cyphO3JldHVybiBlWzBdPTEtYy1kLGVbM109bC1nLGVbNl09aCttLGVbMV09bCtnLGVbNF09MS1mLWQsZVs3XT1wLXYsZVsyXT1oLW0sZVs1XT1wK3YsZVs4XT0xLWYtYyxlfSxjLm5vcm1hbEZyb21NYXQ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XSx5PW4qdS1yKm8sYj1uKmEtaSpvLHc9bipmLXMqbyxFPXIqYS1pKnUsUz1yKmYtcyp1LHg9aSpmLXMqYSxUPWwqdi1jKmQsTj1sKm0taCpkLEM9bCpnLXAqZCxrPWMqbS1oKnYsTD1jKmctcCp2LEE9aCpnLXAqbSxPPXkqQS1iKkwrdyprK0UqQy1TKk4reCpUO3JldHVybiBPPyhPPTEvTyxlWzBdPSh1KkEtYSpMK2YqaykqTyxlWzFdPShhKkMtbypBLWYqTikqTyxlWzJdPShvKkwtdSpDK2YqVCkqTyxlWzNdPShpKkwtcipBLXMqaykqTyxlWzRdPShuKkEtaSpDK3MqTikqTyxlWzVdPShyKkMtbipMLXMqVCkqTyxlWzZdPSh2KngtbSpTK2cqRSkqTyxlWzddPShtKnctZCp4LWcqYikqTyxlWzhdPShkKlMtdip3K2cqeSkqTyxlKTpudWxsfSxjLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDMoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIiwgXCIrZVs0XStcIiwgXCIrZVs1XStcIiwgXCIrZVs2XStcIiwgXCIrZVs3XStcIiwgXCIrZVs4XStcIilcIn0sYy5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKStNYXRoLnBvdyhlWzRdLDIpK01hdGgucG93KGVbNV0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzddLDIpK01hdGgucG93KGVbOF0sMikpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0Mz1jKTt2YXIgaD17fTtoLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDE2KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPTEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTEsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGguY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMTYpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdFs0XT1lWzRdLHRbNV09ZVs1XSx0WzZdPWVbNl0sdFs3XT1lWzddLHRbOF09ZVs4XSx0WzldPWVbOV0sdFsxMF09ZVsxMF0sdFsxMV09ZVsxMV0sdFsxMl09ZVsxMl0sdFsxM109ZVsxM10sdFsxNF09ZVsxNF0sdFsxNV09ZVsxNV0sdH0saC5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGVbOV09dFs5XSxlWzEwXT10WzEwXSxlWzExXT10WzExXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSxlfSxoLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09MSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MSxlWzExXT0wLGVbMTJdPTAsZVsxM109MCxlWzE0XT0wLGVbMTVdPTEsZX0saC50cmFuc3Bvc2U9ZnVuY3Rpb24oZSx0KXtpZihlPT09dCl7dmFyIG49dFsxXSxyPXRbMl0saT10WzNdLHM9dFs2XSxvPXRbN10sdT10WzExXTtlWzFdPXRbNF0sZVsyXT10WzhdLGVbM109dFsxMl0sZVs0XT1uLGVbNl09dFs5XSxlWzddPXRbMTNdLGVbOF09cixlWzldPXMsZVsxMV09dFsxNF0sZVsxMl09aSxlWzEzXT1vLGVbMTRdPXV9ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzRdLGVbMl09dFs4XSxlWzNdPXRbMTJdLGVbNF09dFsxXSxlWzVdPXRbNV0sZVs2XT10WzldLGVbN109dFsxM10sZVs4XT10WzJdLGVbOV09dFs2XSxlWzEwXT10WzEwXSxlWzExXT10WzE0XSxlWzEyXT10WzNdLGVbMTNdPXRbN10sZVsxNF09dFsxMV0sZVsxNV09dFsxNV07cmV0dXJuIGV9LGguaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XSx5PW4qdS1yKm8sYj1uKmEtaSpvLHc9bipmLXMqbyxFPXIqYS1pKnUsUz1yKmYtcyp1LHg9aSpmLXMqYSxUPWwqdi1jKmQsTj1sKm0taCpkLEM9bCpnLXAqZCxrPWMqbS1oKnYsTD1jKmctcCp2LEE9aCpnLXAqbSxPPXkqQS1iKkwrdyprK0UqQy1TKk4reCpUO3JldHVybiBPPyhPPTEvTyxlWzBdPSh1KkEtYSpMK2YqaykqTyxlWzFdPShpKkwtcipBLXMqaykqTyxlWzJdPSh2KngtbSpTK2cqRSkqTyxlWzNdPShoKlMtYyp4LXAqRSkqTyxlWzRdPShhKkMtbypBLWYqTikqTyxlWzVdPShuKkEtaSpDK3MqTikqTyxlWzZdPShtKnctZCp4LWcqYikqTyxlWzddPShsKngtaCp3K3AqYikqTyxlWzhdPShvKkwtdSpDK2YqVCkqTyxlWzldPShyKkMtbipMLXMqVCkqTyxlWzEwXT0oZCpTLXYqdytnKnkpKk8sZVsxMV09KGMqdy1sKlMtcCp5KSpPLGVbMTJdPSh1Kk4tbyprLWEqVCkqTyxlWzEzXT0obiprLXIqTitpKlQpKk8sZVsxNF09KHYqYi1kKkUtbSp5KSpPLGVbMTVdPShsKkUtYypiK2gqeSkqTyxlKTpudWxsfSxoLmFkam9pbnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz10WzldLGg9dFsxMF0scD10WzExXSxkPXRbMTJdLHY9dFsxM10sbT10WzE0XSxnPXRbMTVdO3JldHVybiBlWzBdPXUqKGgqZy1wKm0pLWMqKGEqZy1mKm0pK3YqKGEqcC1mKmgpLGVbMV09LShyKihoKmctcCptKS1jKihpKmctcyptKSt2KihpKnAtcypoKSksZVsyXT1yKihhKmctZiptKS11KihpKmctcyptKSt2KihpKmYtcyphKSxlWzNdPS0ociooYSpwLWYqaCktdSooaSpwLXMqaCkrYyooaSpmLXMqYSkpLGVbNF09LShvKihoKmctcCptKS1sKihhKmctZiptKStkKihhKnAtZipoKSksZVs1XT1uKihoKmctcCptKS1sKihpKmctcyptKStkKihpKnAtcypoKSxlWzZdPS0obiooYSpnLWYqbSktbyooaSpnLXMqbSkrZCooaSpmLXMqYSkpLGVbN109biooYSpwLWYqaCktbyooaSpwLXMqaCkrbCooaSpmLXMqYSksZVs4XT1vKihjKmctcCp2KS1sKih1KmctZip2KStkKih1KnAtZipjKSxlWzldPS0obiooYypnLXAqdiktbCoocipnLXMqdikrZCoocipwLXMqYykpLGVbMTBdPW4qKHUqZy1mKnYpLW8qKHIqZy1zKnYpK2QqKHIqZi1zKnUpLGVbMTFdPS0obioodSpwLWYqYyktbyoocipwLXMqYykrbCoocipmLXMqdSkpLGVbMTJdPS0obyooYyptLWgqdiktbCoodSptLWEqdikrZCoodSpoLWEqYykpLGVbMTNdPW4qKGMqbS1oKnYpLWwqKHIqbS1pKnYpK2QqKHIqaC1pKmMpLGVbMTRdPS0obioodSptLWEqdiktbyoociptLWkqdikrZCoociphLWkqdSkpLGVbMTVdPW4qKHUqaC1hKmMpLW8qKHIqaC1pKmMpK2wqKHIqYS1pKnUpLGV9LGguZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXSxzPWVbNF0sbz1lWzVdLHU9ZVs2XSxhPWVbN10sZj1lWzhdLGw9ZVs5XSxjPWVbMTBdLGg9ZVsxMV0scD1lWzEyXSxkPWVbMTNdLHY9ZVsxNF0sbT1lWzE1XSxnPXQqby1uKnMseT10KnUtcipzLGI9dCphLWkqcyx3PW4qdS1yKm8sRT1uKmEtaSpvLFM9ciphLWkqdSx4PWYqZC1sKnAsVD1mKnYtYypwLE49ZiptLWgqcCxDPWwqdi1jKmQsaz1sKm0taCpkLEw9YyptLWgqdjtyZXR1cm4gZypMLXkqaytiKkMrdypOLUUqVCtTKnh9LGgubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPXRbOV0scD10WzEwXSxkPXRbMTFdLHY9dFsxMl0sbT10WzEzXSxnPXRbMTRdLHk9dFsxNV0sYj1uWzBdLHc9blsxXSxFPW5bMl0sUz1uWzNdO3JldHVybiBlWzBdPWIqcit3KnUrRSpjK1MqdixlWzFdPWIqaSt3KmErRSpoK1MqbSxlWzJdPWIqcyt3KmYrRSpwK1MqZyxlWzNdPWIqbyt3KmwrRSpkK1MqeSxiPW5bNF0sdz1uWzVdLEU9bls2XSxTPW5bN10sZVs0XT1iKnIrdyp1K0UqYytTKnYsZVs1XT1iKmkrdyphK0UqaCtTKm0sZVs2XT1iKnMrdypmK0UqcCtTKmcsZVs3XT1iKm8rdypsK0UqZCtTKnksYj1uWzhdLHc9bls5XSxFPW5bMTBdLFM9blsxMV0sZVs4XT1iKnIrdyp1K0UqYytTKnYsZVs5XT1iKmkrdyphK0UqaCtTKm0sZVsxMF09YipzK3cqZitFKnArUypnLGVbMTFdPWIqbyt3KmwrRSpkK1MqeSxiPW5bMTJdLHc9blsxM10sRT1uWzE0XSxTPW5bMTVdLGVbMTJdPWIqcit3KnUrRSpjK1MqdixlWzEzXT1iKmkrdyphK0UqaCtTKm0sZVsxNF09YipzK3cqZitFKnArUypnLGVbMTVdPWIqbyt3KmwrRSpkK1MqeSxlfSxoLm11bD1oLm11bHRpcGx5LGgudHJhbnNsYXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXSxzPW5bMl0sbyx1LGEsZixsLGMsaCxwLGQsdixtLGc7cmV0dXJuIHQ9PT1lPyhlWzEyXT10WzBdKnIrdFs0XSppK3RbOF0qcyt0WzEyXSxlWzEzXT10WzFdKnIrdFs1XSppK3RbOV0qcyt0WzEzXSxlWzE0XT10WzJdKnIrdFs2XSppK3RbMTBdKnMrdFsxNF0sZVsxNV09dFszXSpyK3RbN10qaSt0WzExXSpzK3RbMTVdKToobz10WzBdLHU9dFsxXSxhPXRbMl0sZj10WzNdLGw9dFs0XSxjPXRbNV0saD10WzZdLHA9dFs3XSxkPXRbOF0sdj10WzldLG09dFsxMF0sZz10WzExXSxlWzBdPW8sZVsxXT11LGVbMl09YSxlWzNdPWYsZVs0XT1sLGVbNV09YyxlWzZdPWgsZVs3XT1wLGVbOF09ZCxlWzldPXYsZVsxMF09bSxlWzExXT1nLGVbMTJdPW8qcitsKmkrZCpzK3RbMTJdLGVbMTNdPXUqcitjKmkrdipzK3RbMTNdLGVbMTRdPWEqcitoKmkrbSpzK3RbMTRdLGVbMTVdPWYqcitwKmkrZypzK3RbMTVdKSxlfSxoLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXSxzPW5bMl07cmV0dXJuIGVbMF09dFswXSpyLGVbMV09dFsxXSpyLGVbMl09dFsyXSpyLGVbM109dFszXSpyLGVbNF09dFs0XSppLGVbNV09dFs1XSppLGVbNl09dFs2XSppLGVbN109dFs3XSppLGVbOF09dFs4XSpzLGVbOV09dFs5XSpzLGVbMTBdPXRbMTBdKnMsZVsxMV09dFsxMV0qcyxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSxlfSxoLnJvdGF0ZT1mdW5jdGlvbihlLG4scixpKXt2YXIgcz1pWzBdLG89aVsxXSx1PWlbMl0sYT1NYXRoLnNxcnQocypzK28qbyt1KnUpLGYsbCxjLGgscCxkLHYsbSxnLHksYix3LEUsUyx4LFQsTixDLGssTCxBLE8sTSxfO3JldHVybiBNYXRoLmFicyhhKTx0P251bGw6KGE9MS9hLHMqPWEsbyo9YSx1Kj1hLGY9TWF0aC5zaW4ociksbD1NYXRoLmNvcyhyKSxjPTEtbCxoPW5bMF0scD1uWzFdLGQ9blsyXSx2PW5bM10sbT1uWzRdLGc9bls1XSx5PW5bNl0sYj1uWzddLHc9bls4XSxFPW5bOV0sUz1uWzEwXSx4PW5bMTFdLFQ9cypzKmMrbCxOPW8qcypjK3UqZixDPXUqcypjLW8qZixrPXMqbypjLXUqZixMPW8qbypjK2wsQT11Km8qYytzKmYsTz1zKnUqYytvKmYsTT1vKnUqYy1zKmYsXz11KnUqYytsLGVbMF09aCpUK20qTit3KkMsZVsxXT1wKlQrZypOK0UqQyxlWzJdPWQqVCt5Kk4rUypDLGVbM109dipUK2IqTit4KkMsZVs0XT1oKmsrbSpMK3cqQSxlWzVdPXAqaytnKkwrRSpBLGVbNl09ZCprK3kqTCtTKkEsZVs3XT12KmsrYipMK3gqQSxlWzhdPWgqTyttKk0rdypfLGVbOV09cCpPK2cqTStFKl8sZVsxMF09ZCpPK3kqTStTKl8sZVsxMV09dipPK2IqTSt4Kl8sbiE9PWUmJihlWzEyXT1uWzEyXSxlWzEzXT1uWzEzXSxlWzE0XT1uWzE0XSxlWzE1XT1uWzE1XSksZSl9LGgucm90YXRlWD1mdW5jdGlvbihlLHQsbil7dmFyIHI9TWF0aC5zaW4obiksaT1NYXRoLmNvcyhuKSxzPXRbNF0sbz10WzVdLHU9dFs2XSxhPXRbN10sZj10WzhdLGw9dFs5XSxjPXRbMTBdLGg9dFsxMV07cmV0dXJuIHQhPT1lJiYoZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzRdPXMqaStmKnIsZVs1XT1vKmkrbCpyLGVbNl09dSppK2MqcixlWzddPWEqaStoKnIsZVs4XT1mKmktcypyLGVbOV09bCppLW8qcixlWzEwXT1jKmktdSpyLGVbMTFdPWgqaS1hKnIsZX0saC5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1NYXRoLnNpbihuKSxpPU1hdGguY29zKG4pLHM9dFswXSxvPXRbMV0sdT10WzJdLGE9dFszXSxmPXRbOF0sbD10WzldLGM9dFsxMF0saD10WzExXTtyZXR1cm4gdCE9PWUmJihlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0pLGVbMF09cyppLWYqcixlWzFdPW8qaS1sKnIsZVsyXT11KmktYypyLGVbM109YSppLWgqcixlWzhdPXMqcitmKmksZVs5XT1vKnIrbCppLGVbMTBdPXUqcitjKmksZVsxMV09YSpyK2gqaSxlfSxoLnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPU1hdGguc2luKG4pLGk9TWF0aC5jb3Mobikscz10WzBdLG89dFsxXSx1PXRbMl0sYT10WzNdLGY9dFs0XSxsPXRbNV0sYz10WzZdLGg9dFs3XTtyZXR1cm4gdCE9PWUmJihlWzhdPXRbOF0sZVs5XT10WzldLGVbMTBdPXRbMTBdLGVbMTFdPXRbMTFdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzBdPXMqaStmKnIsZVsxXT1vKmkrbCpyLGVbMl09dSppK2MqcixlWzNdPWEqaStoKnIsZVs0XT1mKmktcypyLGVbNV09bCppLW8qcixlWzZdPWMqaS11KnIsZVs3XT1oKmktYSpyLGV9LGguZnJvbVJvdGF0aW9uVHJhbnNsYXRpb249ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1yK3IsYT1pK2ksZj1zK3MsbD1yKnUsYz1yKmEsaD1yKmYscD1pKmEsZD1pKmYsdj1zKmYsbT1vKnUsZz1vKmEseT1vKmY7cmV0dXJuIGVbMF09MS0ocCt2KSxlWzFdPWMreSxlWzJdPWgtZyxlWzNdPTAsZVs0XT1jLXksZVs1XT0xLShsK3YpLGVbNl09ZCttLGVbN109MCxlWzhdPWgrZyxlWzldPWQtbSxlWzEwXT0xLShsK3ApLGVbMTFdPTAsZVsxMl09blswXSxlWzEzXT1uWzFdLGVbMTRdPW5bMl0sZVsxNV09MSxlfSxoLmZyb21RdWF0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4rbix1PXIrcixhPWkraSxmPW4qbyxsPXIqbyxjPXIqdSxoPWkqbyxwPWkqdSxkPWkqYSx2PXMqbyxtPXMqdSxnPXMqYTtyZXR1cm4gZVswXT0xLWMtZCxlWzFdPWwrZyxlWzJdPWgtbSxlWzNdPTAsZVs0XT1sLWcsZVs1XT0xLWYtZCxlWzZdPXArdixlWzddPTAsZVs4XT1oK20sZVs5XT1wLXYsZVsxMF09MS1mLWMsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGguZnJ1c3R1bT1mdW5jdGlvbihlLHQsbixyLGkscyxvKXt2YXIgdT0xLyhuLXQpLGE9MS8oaS1yKSxmPTEvKHMtbyk7cmV0dXJuIGVbMF09cyoyKnUsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09cyoyKmEsZVs2XT0wLGVbN109MCxlWzhdPShuK3QpKnUsZVs5XT0oaStyKSphLGVbMTBdPShvK3MpKmYsZVsxMV09LTEsZVsxMl09MCxlWzEzXT0wLGVbMTRdPW8qcyoyKmYsZVsxNV09MCxlfSxoLnBlcnNwZWN0aXZlPWZ1bmN0aW9uKGUsdCxuLHIsaSl7dmFyIHM9MS9NYXRoLnRhbih0LzIpLG89MS8oci1pKTtyZXR1cm4gZVswXT1zL24sZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09cyxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09KGkrcikqbyxlWzExXT0tMSxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MippKnIqbyxlWzE1XT0wLGV9LGgub3J0aG89ZnVuY3Rpb24oZSx0LG4scixpLHMsbyl7dmFyIHU9MS8odC1uKSxhPTEvKHItaSksZj0xLyhzLW8pO3JldHVybiBlWzBdPS0yKnUsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09LTIqYSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MipmLGVbMTFdPTAsZVsxMl09KHQrbikqdSxlWzEzXT0oaStyKSphLGVbMTRdPShvK3MpKmYsZVsxNV09MSxlfSxoLmxvb2tBdD1mdW5jdGlvbihlLG4scixpKXt2YXIgcyxvLHUsYSxmLGwsYyxwLGQsdixtPW5bMF0sZz1uWzFdLHk9blsyXSxiPWlbMF0sdz1pWzFdLEU9aVsyXSxTPXJbMF0seD1yWzFdLFQ9clsyXTtyZXR1cm4gTWF0aC5hYnMobS1TKTx0JiZNYXRoLmFicyhnLXgpPHQmJk1hdGguYWJzKHktVCk8dD9oLmlkZW50aXR5KGUpOihjPW0tUyxwPWcteCxkPXktVCx2PTEvTWF0aC5zcXJ0KGMqYytwKnArZCpkKSxjKj12LHAqPXYsZCo9dixzPXcqZC1FKnAsbz1FKmMtYipkLHU9YipwLXcqYyx2PU1hdGguc3FydChzKnMrbypvK3UqdSksdj8odj0xL3Yscyo9dixvKj12LHUqPXYpOihzPTAsbz0wLHU9MCksYT1wKnUtZCpvLGY9ZCpzLWMqdSxsPWMqby1wKnMsdj1NYXRoLnNxcnQoYSphK2YqZitsKmwpLHY/KHY9MS92LGEqPXYsZio9dixsKj12KTooYT0wLGY9MCxsPTApLGVbMF09cyxlWzFdPWEsZVsyXT1jLGVbM109MCxlWzRdPW8sZVs1XT1mLGVbNl09cCxlWzddPTAsZVs4XT11LGVbOV09bCxlWzEwXT1kLGVbMTFdPTAsZVsxMl09LShzKm0rbypnK3UqeSksZVsxM109LShhKm0rZipnK2wqeSksZVsxNF09LShjKm0rcCpnK2QqeSksZVsxNV09MSxlKX0saC5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQ0KFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIsIFwiK2VbNl0rXCIsIFwiK2VbN10rXCIsIFwiK2VbOF0rXCIsIFwiK2VbOV0rXCIsIFwiK2VbMTBdK1wiLCBcIitlWzExXStcIiwgXCIrZVsxMl0rXCIsIFwiK2VbMTNdK1wiLCBcIitlWzE0XStcIiwgXCIrZVsxNV0rXCIpXCJ9LGguZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzddLDIpK01hdGgucG93KGVbOF0sMikrTWF0aC5wb3coZVs5XSwyKStNYXRoLnBvdyhlWzEwXSwyKStNYXRoLnBvdyhlWzExXSwyKStNYXRoLnBvdyhlWzEyXSwyKStNYXRoLnBvdyhlWzEzXSwyKStNYXRoLnBvdyhlWzE0XSwyKStNYXRoLnBvdyhlWzE1XSwyKSl9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQ0PWgpO3ZhciBwPXt9O3AuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNCk7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxwLnJvdGF0aW9uVG89ZnVuY3Rpb24oKXt2YXIgZT11LmNyZWF0ZSgpLHQ9dS5mcm9tVmFsdWVzKDEsMCwwKSxuPXUuZnJvbVZhbHVlcygwLDEsMCk7cmV0dXJuIGZ1bmN0aW9uKHIsaSxzKXt2YXIgbz11LmRvdChpLHMpO3JldHVybiBvPC0wLjk5OTk5OT8odS5jcm9zcyhlLHQsaSksdS5sZW5ndGgoZSk8MWUtNiYmdS5jcm9zcyhlLG4saSksdS5ub3JtYWxpemUoZSxlKSxwLnNldEF4aXNBbmdsZShyLGUsTWF0aC5QSSkscik6bz4uOTk5OTk5PyhyWzBdPTAsclsxXT0wLHJbMl09MCxyWzNdPTEscik6KHUuY3Jvc3MoZSxpLHMpLHJbMF09ZVswXSxyWzFdPWVbMV0sclsyXT1lWzJdLHJbM109MStvLHAubm9ybWFsaXplKHIscikpfX0oKSxwLnNldEF4ZXM9ZnVuY3Rpb24oKXt2YXIgZT1jLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpKXtyZXR1cm4gZVswXT1yWzBdLGVbM109clsxXSxlWzZdPXJbMl0sZVsxXT1pWzBdLGVbNF09aVsxXSxlWzddPWlbMl0sZVsyXT0tblswXSxlWzVdPS1uWzFdLGVbOF09LW5bMl0scC5ub3JtYWxpemUodCxwLmZyb21NYXQzKHQsZSkpfX0oKSxwLmNsb25lPWEuY2xvbmUscC5mcm9tVmFsdWVzPWEuZnJvbVZhbHVlcyxwLmNvcHk9YS5jb3B5LHAuc2V0PWEuc2V0LHAuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxwLnNldEF4aXNBbmdsZT1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9TWF0aC5zaW4obik7cmV0dXJuIGVbMF09cip0WzBdLGVbMV09cip0WzFdLGVbMl09cip0WzJdLGVbM109TWF0aC5jb3MobiksZX0scC5hZGQ9YS5hZGQscC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdLGY9blsyXSxsPW5bM107cmV0dXJuIGVbMF09cipsK28qdStpKmYtcyphLGVbMV09aSpsK28qYStzKnUtcipmLGVbMl09cypsK28qZityKmEtaSp1LGVbM109bypsLXIqdS1pKmEtcypmLGV9LHAubXVsPXAubXVsdGlwbHkscC5zY2FsZT1hLnNjYWxlLHAucm90YXRlWD1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK28qdSxlWzFdPWkqYStzKnUsZVsyXT1zKmEtaSp1LGVbM109byphLXIqdSxlfSxwLnJvdGF0ZVk9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYS1zKnUsZVsxXT1pKmErbyp1LGVbMl09cyphK3IqdSxlWzNdPW8qYS1pKnUsZX0scC5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmEraSp1LGVbMV09aSphLXIqdSxlWzJdPXMqYStvKnUsZVszXT1vKmEtcyp1LGV9LHAuY2FsY3VsYXRlVz1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXTtyZXR1cm4gZVswXT1uLGVbMV09cixlWzJdPWksZVszXT0tTWF0aC5zcXJ0KE1hdGguYWJzKDEtbipuLXIqci1pKmkpKSxlfSxwLmRvdD1hLmRvdCxwLmxlcnA9YS5sZXJwLHAuc2xlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdLHU9dFszXSxhPW5bMF0sZj1uWzFdLGw9blsyXSxjPW5bM10saCxwLGQsdixtO3JldHVybiBwPWkqYStzKmYrbypsK3UqYyxwPDAmJihwPS1wLGE9LWEsZj0tZixsPS1sLGM9LWMpLDEtcD4xZS02PyhoPU1hdGguYWNvcyhwKSxkPU1hdGguc2luKGgpLHY9TWF0aC5zaW4oKDEtcikqaCkvZCxtPU1hdGguc2luKHIqaCkvZCk6KHY9MS1yLG09ciksZVswXT12KmkrbSphLGVbMV09dipzK20qZixlWzJdPXYqbyttKmwsZVszXT12KnUrbSpjLGV9LHAuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qbityKnIraSppK3Mqcyx1PW8/MS9vOjA7cmV0dXJuIGVbMF09LW4qdSxlWzFdPS1yKnUsZVsyXT0taSp1LGVbM109cyp1LGV9LHAuY29uanVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGVbM109dFszXSxlfSxwLmxlbmd0aD1hLmxlbmd0aCxwLmxlbj1wLmxlbmd0aCxwLnNxdWFyZWRMZW5ndGg9YS5zcXVhcmVkTGVuZ3RoLHAuc3FyTGVuPXAuc3F1YXJlZExlbmd0aCxwLm5vcm1hbGl6ZT1hLm5vcm1hbGl6ZSxwLmZyb21NYXQzPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSt0WzRdK3RbOF0scjtpZihuPjApcj1NYXRoLnNxcnQobisxKSxlWzNdPS41KnIscj0uNS9yLGVbMF09KHRbN10tdFs1XSkqcixlWzFdPSh0WzJdLXRbNl0pKnIsZVsyXT0odFszXS10WzFdKSpyO2Vsc2V7dmFyIGk9MDt0WzRdPnRbMF0mJihpPTEpLHRbOF0+dFtpKjMraV0mJihpPTIpO3ZhciBzPShpKzEpJTMsbz0oaSsyKSUzO3I9TWF0aC5zcXJ0KHRbaSozK2ldLXRbcyozK3NdLXRbbyozK29dKzEpLGVbaV09LjUqcixyPS41L3IsZVszXT0odFtvKjMrc10tdFtzKjMrb10pKnIsZVtzXT0odFtzKjMraV0rdFtpKjMrc10pKnIsZVtvXT0odFtvKjMraV0rdFtpKjMrb10pKnJ9cmV0dXJuIGV9LHAuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwicXVhdChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUucXVhdD1wKX0odC5leHBvcnRzKX0pKHRoaXMpO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vY29tcG9uZW50V2lyZVNlZ21lbnQnKTtcblxuYW5ndWxhci5tb2R1bGUoXG4nbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uY29tcG9uZW50V2lyZScsXG5bXG4gICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlLnNlZ21lbnQnXG5dXG4pXG4uY29udHJvbGxlcignQ29tcG9uZW50V2lyZUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICRzY29wZS5nZXRTZWdtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbmRQb3NpdGlvbnMsXG4gICAgICB4MSx5MSx4Mix5MjtcblxuICAgIGVuZFBvc2l0aW9ucyA9ICRzY29wZS53aXJlLmdldEVuZFBvc2l0aW9ucygpO1xuXG4gICAgeDEgPSBlbmRQb3NpdGlvbnMueDE7XG4gICAgeDIgPSBlbmRQb3NpdGlvbnMueDI7XG4gICAgeTEgPSBlbmRQb3NpdGlvbnMueTE7XG4gICAgeTIgPSBlbmRQb3NpdGlvbnMueTI7XG5cbiAgICByZXR1cm4gW1xuICAgICAgZW5kUG9zaXRpb25zXG4gICAgXTtcblxuICB9O1xuXG4gICRzY29wZS5vblNlZ21lbnRDbGljayA9IGZ1bmN0aW9uKHdpcmUsIHNlZ21lbnQpIHtcbiAgICBjb25zb2xlLmxvZyh3aXJlLCBzZWdtZW50KTtcbiAgfTtcblxuICAkc2NvcGUuc2VnbWVudHMgPSAkc2NvcGUuZ2V0U2VnbWVudHMoKTtcblxufSlcbi5kaXJlY3RpdmUoXG4nY29tcG9uZW50V2lyZScsXG5cbmZ1bmN0aW9uICgpIHtcblxuICByZXR1cm4ge1xuICAgIHNjb3BlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6ICdDb21wb25lbnRXaXJlQ29udHJvbGxlcicsXG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHRlbXBsYXRlVXJsOiAnL2Rlc2lnblZpc3VhbGl6YXRpb24vdGVtcGxhdGVzL2NvbXBvbmVudFdpcmUuaHRtbCcsXG4gICAgdGVtcGxhdGVOYW1lc3BhY2U6ICdTVkcnXG4gIH07XG59XG4pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbidtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5jb21wb25lbnRXaXJlLnNlZ21lbnQnLFxuW11cbilcblxuLmRpcmVjdGl2ZShcbidjb21wb25lbnRXaXJlU2VnbWVudCcsXG5cbmZ1bmN0aW9uICgpIHtcblxuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZVVybDogJy9kZXNpZ25WaXN1YWxpemF0aW9uL3RlbXBsYXRlcy9jb21wb25lbnRXaXJlU2VnbWVudC5odG1sJyxcbiAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgfTtcbn1cbik7IiwiLypnbG9iYWxzIGFuZ3VsYXIsICQqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1vdmUgdGhpcyB0byBHTUUgZXZlbnR1YWxseVxuXG5yZXF1aXJlKCcuLi9kcmF3aW5nQ2FudmFzL2RyYXdpbmdDYW52YXMuanMnKTtcblxuYW5ndWxhci5tb2R1bGUoJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmRpYWdyYW1Db250YWluZXInLCBbXG4gICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kcmF3aW5nQ2FudmFzJyxcbiAgJ3Bhbnpvb20nLFxuICAncGFuem9vbXdpZGdldCdcbl0pXG4uY29udHJvbGxlcignRGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXInLCBbXG4gICckc2NvcGUnLFxuICAnUGFuWm9vbVNlcnZpY2UnLFxuICBmdW5jdGlvbiAoJHNjb3BlLCAgUGFuWm9vbVNlcnZpY2UpIHtcblxuICAgIHZhciBjb21waWxlZERpcmVjdGl2ZXM7XG5cbiAgICBjb21waWxlZERpcmVjdGl2ZXMgPSB7fTtcblxuICAgICRzY29wZS5kaWFncmFtLnN0YXRlID0gJHNjb3BlLmRpYWdyYW0uc3RhdGUgfHwge307XG4gICAgJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMgPSAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcyB8fCBbXTtcblxuICAgICRzY29wZS5kaWFncmFtLmNvbmZpZyA9ICRzY29wZS5kaWFncmFtLmNvbmZpZyB8fCB7fTtcblxuICAgICRzY29wZS5wYW56b29tSWQgPSAncGFuem9vbUlkJzsvL3Njb3BlLmlkICsgJy1wYW56b29tZWQnO1xuXG4gICAgJHNjb3BlLnpvb21MZXZlbCA9IDQ7XG5cbiAgICAkc2NvcGUucGFuem9vbU1vZGVsID0ge307IC8vIGFsd2F5cyBwYXNzIGVtcHR5IG9iamVjdFxuXG4gICAgJHNjb3BlLnBhbnpvb21Db25maWcgPSB7XG4gICAgICB6b29tTGV2ZWxzOiAxMCxcbiAgICAgIG5ldXRyYWxab29tTGV2ZWw6ICRzY29wZS56b29tTGV2ZWwsXG4gICAgICBzY2FsZVBlclpvb21MZXZlbDogMS4yNSxcbiAgICAgIGZyaWN0aW9uOiA1MCxcbiAgICAgIGhhbHRTcGVlZDogNTAsXG5cbiAgICAgIG1vZGVsQ2hhbmdlZENhbGxiYWNrOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIFBhblpvb21TZXJ2aWNlLmdldEFQSSgkc2NvcGUucGFuem9vbUlkKS50aGVuKGZ1bmN0aW9uIChhcGkpIHtcblxuICAgICAgICAgIHZhciB0b3BMZWZ0Q29ybmVyLCBib3R0b21SaWdodENvcm5lcjtcblxuICAgICAgICAgICRzY29wZS56b29tTGV2ZWwgPSB2YWwuem9vbUxldmVsO1xuXG4gICAgICAgICAgdG9wTGVmdENvcm5lciA9IGFwaS5nZXRNb2RlbFBvc2l0aW9uKHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBib3R0b21SaWdodENvcm5lciA9IGFwaS5nZXRNb2RlbFBvc2l0aW9uKHtcbiAgICAgICAgICAgIHg6ICRzY29wZS5jYW52YXNXaWR0aCxcbiAgICAgICAgICAgIHk6ICRzY29wZS5jYW52YXNIZWlnaHRcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgICRzY29wZS52aXNpYmxlQXJlYSA9IHtcbiAgICAgICAgICAgIHRvcDogdG9wTGVmdENvcm5lci55LFxuICAgICAgICAgICAgbGVmdDogdG9wTGVmdENvcm5lci54LFxuICAgICAgICAgICAgcmlnaHQ6IGJvdHRvbVJpZ2h0Q29ybmVyLngsXG4gICAgICAgICAgICBib3R0b206IGJvdHRvbVJpZ2h0Q29ybmVyLnlcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5nZXRDc3NDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICd6b29tLWxldmVsLScgKyAkc2NvcGUuem9vbUxldmVsO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFZpc2libGVBcmVhID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLnZpc2libGVBcmVhO1xuICAgIH07XG5cbiAgICB0aGlzLmdldElkID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICRzY29wZS5pZDtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXREaWFncmFtID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICRzY29wZS5kaWFncmFtO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFpvb21MZXZlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuem9vbUxldmVsO1xuICAgIH07XG5cbiAgICB0aGlzLmdldENvbXBpbGVkRGlyZWN0aXZlID0gZnVuY3Rpb24oZGlyZWN0aXZlKSB7XG4gICAgICByZXR1cm4gY29tcGlsZWREaXJlY3RpdmVzW2RpcmVjdGl2ZV07XG4gICAgfTtcblxuICAgIHRoaXMuc2V0Q29tcGlsZWREaXJlY3RpdmUgPSBmdW5jdGlvbihkaXJlY3RpdmUsIGNvbXBpbGVkRGlyZWN0aXZlKSB7XG4gICAgICBjb21waWxlZERpcmVjdGl2ZXNbZGlyZWN0aXZlXSA9IGNvbXBpbGVkRGlyZWN0aXZlO1xuICAgIH07XG5cbiAgICB0aGlzLmlzRWRpdGFibGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgICByZXR1cm4gJHNjb3BlLmRpYWdyYW0uY29uZmlnLmVkaXRhYmxlID09PSB0cnVlO1xuICAgIH07XG5cbiAgICB0aGlzLmlzQ29tcG9uZW50U2VsZWN0ZWQgPSBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcy5pbmRleE9mKGNvbXBvbmVudC5pZCkgPiAtMTtcbiAgICB9O1xuXG4gIH1cbl0pXG4uZGlyZWN0aXZlKCdkaWFncmFtQ29udGFpbmVyJywgW1xuICAnZGlhZ3JhbVNlcnZpY2UnLCAnJGxvZycsICdQYW5ab29tU2VydmljZScsXG4gIGZ1bmN0aW9uIChkaWFncmFtU2VydmljZSwgJGxvZykge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdEaWFncmFtQ29udGFpbmVyQ29udHJvbGxlcicsXG4gICAgICBzY29wZToge1xuICAgICAgICBpZDogJ0AnLFxuICAgICAgICBkaWFncmFtOiAnPSdcbiAgICAgIH0sXG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9kZXNpZ25WaXN1YWxpemF0aW9uL3RlbXBsYXRlcy9kaWFncmFtQ29udGFpbmVyLmh0bWwnLFxuICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG5cbiAgICAgICAgc2NvcGUuY2FudmFzV2lkdGggPSAkKGVsZW1lbnQpLm91dGVyV2lkdGgoKTtcbiAgICAgICAgc2NvcGUuY2FudmFzSGVpZ2h0ID0gJChlbGVtZW50KS5vdXRlckhlaWdodCgpO1xuXG5cbiAgICAgICAgc2NvcGUudmlzaWJsZUFyZWEgPSB7XG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IHNjb3BlLmNhbnZhc1dpZHRoLFxuICAgICAgICAgIGJvdHRvbTogc2NvcGUuY2FudmFzSGVpZ2h0XG4gICAgICAgIH07XG5cbiAgICAgICAgJGxvZy5kZWJ1ZygnSW4gY2FudmFzIGNvbnRhaW5lcicsIHNjb3BlLnZpc2libGVBcmVhKTtcblxuXG4gICAgICB9XG5cbiAgICB9O1xuICB9XG5dKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbmFuZ3VsYXIubW9kdWxlKCdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kcmF3aW5nQ2FudmFzJywgW1xuXSlcbi5kaXJlY3RpdmUoJ2RyYXdpbmdDYW52YXMnLFxuZnVuY3Rpb24gKCkge1xuXG4gIHJldHVybiB7XG5cbiAgICBzY29wZToge1xuICAgICAgaWQ6ICdAJ1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgdGVtcGxhdGVVcmw6ICcvZGVzaWduVmlzdWFsaXphdGlvbi90ZW1wbGF0ZXMvZHJhd2luZ0NhbnZhcy5odG1sJ1xuXG4gIH07XG59KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgZmFicmljKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxuYW5ndWxhci5tb2R1bGUoJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLmZhYnJpY0NhbnZhcycsIFtcbl0pXG4uY29udHJvbGxlcignRmFicmljQ2FudmFzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgpIHtcblxufSlcbi5kaXJlY3RpdmUoJ2ZhYnJpY0NhbnZhcycsIFtcbiAgJyRsb2cnLFxuICAnZGlhZ3JhbVNlcnZpY2UnLFxuICBmdW5jdGlvbiAoJGxvZywgZGlhZ3JhbVNlcnZpY2UpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgIHNjb3BlOiB7XG4gICAgICB9LFxuICAgICAgY29udHJvbGxlcjogJ0ZhYnJpY0NhbnZhc0NvbnRyb2xsZXInLFxuICAgICAgcmVxdWlyZTogJ15kaWFncmFtQ29udGFpbmVyJyxcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvZGVzaWduVmlzdWFsaXphdGlvbi90ZW1wbGF0ZXMvZmFicmljQ2FudmFzLmh0bWwnLFxuICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzLCBkaWFncmFtQ29udGFpbmVyQ3RybCkge1xuXG4gICAgICAgIHZhclxuICAgICAgICBjYW52YXMsXG4gICAgICAgIHJlbmRlckRpYWdyYW07XG5cbiAgICAgICAgc2NvcGUuaWQgPSBkaWFncmFtQ29udGFpbmVyQ3RybC5nZXRJZCgpICsgJ2ZhYnJpYy1jYW52YXMnO1xuXG4gICAgICAgIGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKHNjb3BlLmlkKTtcblxuICAgICAgICBjYW52YXMuc2V0QmFja2dyb3VuZENvbG9yKCdyZ2JhKDI1NSwgNzMsIDY0LCAwLjYpJyk7XG5cbiAgICAgICAgcmVuZGVyRGlhZ3JhbSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHNjb3BlLmRpYWdyYW1EYXRhKSkge1xuXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KHNjb3BlLmRpYWdyYW1EYXRhLnN5bWJvbHMpKSB7XG5cbiAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHNjb3BlLmRpYWdyYW1EYXRhLnN5bWJvbHMsIGZ1bmN0aW9uIChzeW1ib2wpIHtcblxuICAgICAgICAgICAgICAgIGRpYWdyYW1TZXJ2aWNlLmdldFNWR0ZvclN5bWJvbFR5cGUoc3ltYm9sLnR5cGUpLnRoZW4oZnVuY3Rpb24gKG9iamVjdCkge1xuXG4gICAgICAgICAgICAgICAgICB2YXIgc3ZnT2JqZWN0O1xuXG4gICAgICAgICAgICAgICAgICBzdmdPYmplY3QgPSBvYmplY3Quc2V0KHsgbGVmdDogc3ltYm9sLngsIHRvcDogc3ltYm9sLnksIGFuZ2xlOiAwIH0pO1xuXG4vLyAgICAgICAgICAgICAgICAgIGNhbnZhcy5hZGQoc3ZnT2JqZWN0KTtcblxuICAgICAgICAgICAgICAgICAgdmFyIHJlY3QgPSBuZXcgZmFicmljLlJlY3Qoe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogNTAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgICAgICAgICBmaWxsOiAnZ3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICBhbmdsZTogMjAsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDEwXG4gICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgY2FudmFzLmFkZChyZWN0KTtcblxuICAvLyAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKCdlJywgc3ZnT2JqZWN0KTtcblxuICAgICAgICAgICAgICAgICAgY2FudmFzLnJlbmRlckFsbCgpO1xuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhbnZhcy5jbGVhcigpLnJlbmRlckFsbCgpO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgc2NvcGUuJHdhdGNoKGRpYWdyYW1Db250YWluZXJDdHJsLmdldERpYWdyYW1EYXRhLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAkbG9nLmRlYnVnKCdEaWFncmFtRGF0YSBpcyAnLCB2YWx1ZSk7XG4gICAgICAgICAgc2NvcGUuZGlhZ3JhbURhdGEgPSB2YWx1ZTtcbiAgICAgICAgICByZW5kZXJEaWFncmFtKCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH1cblxuICAgIH07XG4gIH1dKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4nbW1zLmRlc2lnblZpc3VhbGl6YXRpb24ucG9ydCcsXG5bXVxuKVxuLmNvbnRyb2xsZXIoJ1BvcnRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAkc2NvcGUuZ2V0UG9ydFRyYW5zZm9ybSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cmFuc2Zvcm1TdHJpbmc7XG5cbiAgICB0cmFuc2Zvcm1TdHJpbmcgPSAndHJhbnNsYXRlKCcgKyAkc2NvcGUucG9ydEluc3RhbmNlLnBvcnRTeW1ib2wueCArICcsJyArICRzY29wZS5wb3J0SW5zdGFuY2UucG9ydFN5bWJvbC55ICsgJyknO1xuXG4gICAgcmV0dXJuIHRyYW5zZm9ybVN0cmluZztcbiAgfTtcbn0pXG4uZGlyZWN0aXZlKFxuJ3BvcnQnLFxuXG5mdW5jdGlvbiAoKSB7XG5cbiAgcmV0dXJuIHtcbiAgICBzY29wZTogZmFsc2UsXG4gICAgY29udHJvbGxlcjogJ1BvcnRDb250cm9sbGVyJyxcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgdGVtcGxhdGVVcmw6ICcvZGVzaWduVmlzdWFsaXphdGlvbi90ZW1wbGF0ZXMvcG9ydC5odG1sJyxcbiAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRycsXG4gICAgcmVxdWlyZTogWydec3ZnRGlhZ3JhbScsICdeZGlhZ3JhbUNvbnRhaW5lciddLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzLCBjb250cm9sbGVycykge1xuXG4gICAgICB2YXIgc3ZnRGlhZ3JhbUNvbnRyb2xsZXI7XG5cbiAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyID0gY29udHJvbGxlcnNbMF07XG5cbiAgICAgIHNjb3BlLm9uUG9ydENsaWNrID0gZnVuY3Rpb24ocG9ydCwgJGV2ZW50KSB7XG4gICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uUG9ydENsaWNrKHNjb3BlLmNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KTtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLm9uUG9ydE1vdXNlRG93biA9IGZ1bmN0aW9uKHBvcnQsICRldmVudCkge1xuICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5vblBvcnRNb3VzZURvd24oc2NvcGUuY29tcG9uZW50LCBwb3J0LCAkZXZlbnQpO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUub25Qb3J0TW91c2VVcCA9IGZ1bmN0aW9uKHBvcnQsICRldmVudCkge1xuICAgICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5vblBvcnRNb3VzZVVwKHNjb3BlLmNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KTtcbiAgICAgIH07XG5cbiAgICB9XG4gIH07XG59XG4pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNb3ZlIHRoaXMgdG8gR01FIGV2ZW50dWFsbHlcblxucmVxdWlyZSgnLi4vY29tcG9uZW50V2lyZS9jb21wb25lbnRXaXJlLmpzJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zdmdEaWFncmFtJywgW1xuICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uZ3JpZFNlcnZpY2UnLFxuICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uY29tcG9uZW50V2lyZSdcbl0pXG4uY29udHJvbGxlcignU1ZHRGlhZ3JhbUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbG9nLCBkaWFncmFtU2VydmljZSwgd2lyaW5nU2VydmljZSwgZ3JpZFNlcnZpY2UpIHtcblxuICB2YXIgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yLFxuICBzdGFydERyYWcsXG4gIGZpbmlzaERyYWcsXG5cbiAgcG9zc2libGVXaXJlU3RhcnQsXG4gIHN0YXJ0V2lyZSxcbiAgZmluaXNoV2lyZSxcbiAgY2FuY2VsV2lyZSxcblxuICBtb3ZlQ29tcG9uZW50RWxlbWVudFRvRnJvbnQsXG5cbiAgZ2V0T2Zmc2V0VG9Nb3VzZSxcblxuICBXaXJlID0gcmVxdWlyZSgnLi4vLi4vc2VydmljZXMvZGlhZ3JhbVNlcnZpY2UvY2xhc3Nlcy9XaXJlLmpzJyksXG5cbiAgYWRkQ29ybmVyVG9OZXdXaXJlTGluZSxcblxuICBjb21wb25lbnRFbGVtZW50cztcblxuXG4gIGdldE9mZnNldFRvTW91c2UgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cbiAgICB2YXIgb2Zmc2V0O1xuXG4gICAgb2Zmc2V0ID0ge1xuICAgICAgeDogJGV2ZW50LnBhZ2VYIC0gJHNjb3BlLmVsZW1lbnRPZmZzZXQubGVmdCxcbiAgICAgIHk6ICRldmVudC5wYWdlWSAtICRzY29wZS5lbGVtZW50T2Zmc2V0LnRvcFxuICAgIH07XG5cbiAgICByZXR1cm4gb2Zmc2V0O1xuXG4gIH07XG5cbiAgc3RhcnREcmFnID0gZnVuY3Rpb24gKCkge1xuXG4gICAgJHNjb3BlLmRyYWdUYXJnZXRzRGVzY3JpcHRvciA9IHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvcjtcbiAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSBudWxsO1xuXG4gICAgJGxvZy5kZWJ1ZygnRHJhZ2dpbmcnLCAkc2NvcGUuZHJhZ1RhcmdldHNEZXNjcmlwdG9yKTtcblxuICB9O1xuXG4gIHN0YXJ0V2lyZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICRzY29wZS53aXJlU3RhcnQgPSBwb3NzaWJsZVdpcmVTdGFydDtcbiAgICBwb3NzaWJsZVdpcmVTdGFydCA9IG51bGw7XG5cbiAgICAkbG9nLmRlYnVnKCdTdGFydGluZyB3aXJlJywgJHNjb3BlLndpcmVTdGFydCk7XG5cbiAgfTtcblxuICBhZGRDb3JuZXJUb05ld1dpcmVMaW5lID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGxhc3RTZWdtZW50O1xuXG4gICAgJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzID0gJHNjb3BlLm5ld1dpcmVMaW5lLnNlZ21lbnRzO1xuXG4gICAgbGFzdFNlZ21lbnQgPSAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHNbJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgJHNjb3BlLm5ld1dpcmVMaW5lLmFjdGl2ZVNlZ21lbnRTdGFydFBvc2l0aW9uID0ge1xuICAgICAgeDogbGFzdFNlZ21lbnQueDIsXG4gICAgICB5OiBsYXN0U2VnbWVudC55MlxuICAgIH07XG5cbiAgfTtcblxuICBmaW5pc2hXaXJlID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCkge1xuXG4gICAgdmFyIHdpcmUgPSBuZXcgV2lyZSh7XG4gICAgICBpZDogJ25ldy13aXJlLScgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwMCksXG4gICAgICBlbmQxOiB7XG4gICAgICAgIGNvbXBvbmVudDogJHNjb3BlLndpcmVTdGFydC5jb21wb25lbnQsXG4gICAgICAgIHBvcnQ6ICRzY29wZS53aXJlU3RhcnQucG9ydFxuICAgICAgfSxcbiAgICAgIGVuZDI6IHtcbiAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gICAgICAgIHBvcnQ6IHBvcnRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHdpcmUuc2VnbWVudHMgPSBhbmd1bGFyLmNvcHkoXG4gICAgJHNjb3BlLm5ld1dpcmVMaW5lLmxvY2tlZFNlZ21lbnRzLmNvbmNhdChcbiAgICB3aXJpbmdTZXJ2aWNlLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucyhcbiAgICB7XG4gICAgICBlbmQxOiAkc2NvcGUubmV3V2lyZUxpbmUuYWN0aXZlU2VnbWVudFN0YXJ0UG9zaXRpb24sXG4gICAgICBlbmQyOiBwb3J0LmdldEdyaWRQb3NpdGlvbigpXG4gICAgfSxcbiAgICAnRWxib3dSb3V0ZXInXG4gICAgKVxuICAgICkpO1xuXG4gICAgY29uc29sZS5sb2cod2lyZS5zZWdtZW50cyk7XG5cblxuICAgIGRpYWdyYW1TZXJ2aWNlLmFkZFdpcmUod2lyZSk7XG5cbiAgICAkc2NvcGUuZGlhZ3JhbS53aXJlc1sgd2lyZS5pZCBdID0gd2lyZTtcblxuICAgIGdyaWRTZXJ2aWNlLmludmFsaWRhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMoJHNjb3BlLmlkKTtcblxuICAgICRsb2cuZGVidWcoJ0ZpbmlzaCB3aXJlJywgd2lyZSk7XG5cbiAgICAkc2NvcGUud2lyZVN0YXJ0ID0gbnVsbDtcbiAgICAkc2NvcGUubmV3V2lyZUxpbmUgPSBudWxsO1xuXG4gIH07XG5cbiAgY2FuY2VsV2lyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkc2NvcGUud2lyZVN0YXJ0ID0gbnVsbDtcbiAgfTtcblxuICBmaW5pc2hEcmFnID0gZnVuY3Rpb24gKCkge1xuXG4gICAgJHNjb3BlLmRyYWdUYXJnZXRzRGVzY3JpcHRvciA9IG51bGw7XG5cbiAgICAkbG9nLmRlYnVnKCdGaW5pc2ggZHJhZ2dpbmcnKTtcblxuICB9O1xuXG4gICRzY29wZS5vbk1vdXNlVXAgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICAgIGlmICgkc2NvcGUuZHJhZ1RhcmdldHNEZXNjcmlwdG9yKSB7XG4vLyAgICAgICAgLy9maW5pc2hEcmFnKCk7XG4vLyAgICAgIH1cbiAgfTtcblxuXG4gICRzY29wZS5vbkNsaWNrID0gZnVuY3Rpb24gKCRldmVudCkge1xuXG4gICAgaWYgKCRzY29wZS53aXJlU3RhcnQpIHtcblxuICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBhZGRDb3JuZXJUb05ld1dpcmVMaW5lKCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMgPSBbXTtcbiAgICB9XG5cbiAgfTtcblxuICAkc2NvcGUub25Nb3VzZU1vdmUgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cbiAgICB2YXIgb2Zmc2V0O1xuXG4gICAgLy8gRHJhZ2dpbmdcblxuICAgIGlmIChwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IpIHtcbiAgICAgIHN0YXJ0RHJhZygpO1xuICAgIH1cblxuICAgIGlmICgkc2NvcGUuZHJhZ1RhcmdldHNEZXNjcmlwdG9yKSB7XG5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUuZHJhZ1RhcmdldHNEZXNjcmlwdG9yLnRhcmdldHMsIGZ1bmN0aW9uICh0YXJnZXQpIHtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKCRldmVudC5vZmZzZXRZLCB0YXJnZXQuZGVsdGFUb0N1cnNvci55KTtcblxuICAgICAgICBvZmZzZXQgPSBnZXRPZmZzZXRUb01vdXNlKCRldmVudCk7XG5cbiAgICAgICAgdGFyZ2V0LmNvbXBvbmVudC5zZXRQb3NpdGlvbihcbiAgICAgICAgb2Zmc2V0LnggKyB0YXJnZXQuZGVsdGFUb0N1cnNvci54LFxuICAgICAgICBvZmZzZXQueSArIHRhcmdldC5kZWx0YVRvQ3Vyc29yLnlcbiAgICAgICAgKTtcblxuICAgICAgfSk7XG5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUuZHJhZ1RhcmdldHNEZXNjcmlwdG9yLmFmZmVjdGVkV2lyZXMsIGZ1bmN0aW9uICh3aXJlKSB7XG5cbiAgICAgICAgd2lyaW5nU2VydmljZS5hZGp1c3RXaXJlRW5kU2VnbWVudHMod2lyZSk7XG5cbiAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLy8gV2lyZSBkcmF3aW5nXG5cbiAgICBpZiAocG9zc2libGVXaXJlU3RhcnQpIHtcbiAgICAgIHN0YXJ0V2lyZSgpO1xuICAgIH1cblxuICAgIGlmICgkc2NvcGUud2lyZVN0YXJ0KSB7XG5cbiAgICAgICRzY29wZS5uZXdXaXJlTGluZSA9ICRzY29wZS5uZXdXaXJlTGluZSB8fCB7fTtcbiAgICAgICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cyA9ICRzY29wZS5uZXdXaXJlTGluZS5sb2NrZWRTZWdtZW50cyB8fCBbXTtcbiAgICAgICRzY29wZS5uZXdXaXJlTGluZS5hY3RpdmVTZWdtZW50U3RhcnRQb3NpdGlvbiA9XG4gICAgICAkc2NvcGUubmV3V2lyZUxpbmUuYWN0aXZlU2VnbWVudFN0YXJ0UG9zaXRpb24gfHwgJHNjb3BlLndpcmVTdGFydC5wb3J0LmdldEdyaWRQb3NpdGlvbigpO1xuXG4gICAgICAkc2NvcGUubmV3V2lyZUxpbmUuc2VnbWVudHMgPSAkc2NvcGUubmV3V2lyZUxpbmUubG9ja2VkU2VnbWVudHMuY29uY2F0KFxuICAgICAgd2lyaW5nU2VydmljZS5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMoXG4gICAgICB7XG4gICAgICAgIGVuZDE6ICRzY29wZS5uZXdXaXJlTGluZS5hY3RpdmVTZWdtZW50U3RhcnRQb3NpdGlvbixcbiAgICAgICAgZW5kMjoge1xuICAgICAgICAgIHg6ICRldmVudC5wYWdlWCAtICRzY29wZS5lbGVtZW50T2Zmc2V0LmxlZnQgLSAzLFxuICAgICAgICAgIHk6ICRldmVudC5wYWdlWSAtICRzY29wZS5lbGVtZW50T2Zmc2V0LnRvcCAtIDNcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICdFbGJvd1JvdXRlcidcbiAgICAgIClcbiAgICAgICk7XG5cbiAgICB9XG5cbiAgfTtcblxuICAkc2NvcGUuZ2V0Q3NzQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgcmVzdWx0ID0gJyc7XG5cbiAgICBpZiAoJHNjb3BlLmRyYWdUYXJnZXRzRGVzY3JpcHRvcikge1xuICAgICAgcmVzdWx0ICs9ICdkcmFnZ2luZyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcblxuICB9O1xuXG4gICRzY29wZS5jb250ZXh0TWVudURhdGEgPSBbIHtcbiAgICBpZDogJ2NvbnRleHQtbWVudS1jb21tb24nLFxuICAgIGl0ZW1zOiBbIHtcbiAgICAgIGlkOiAnbmV3Q29tcG9uZW50JyxcbiAgICAgIGxhYmVsOiAnTmV3IGNvbXBvbmVudCAuLi4nLFxuICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzJyxcbiAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ05ldyBjb21wb25lbnQgY2xpY2tlZCcgKTtcbiAgICAgIH0sXG4gICAgICBhY3Rpb25EYXRhOiB7fVxuICAgIH1dXG4gIH1dO1xuXG4gIG1vdmVDb21wb25lbnRFbGVtZW50VG9Gcm9udCA9IGZ1bmN0aW9uIChjb21wb25lbnRJZCkge1xuXG4gICAgdmFyIHosXG4gICAgY29tcG9uZW50LFxuICAgIG5lZWRzVG9iZVJlb3JkZXJlZDtcblxuICAgIG5lZWRzVG9iZVJlb3JkZXJlZCA9IGZhbHNlO1xuXG4gICAgeiA9IGRpYWdyYW1TZXJ2aWNlLmdldEhpZ2hlc3RaKCk7XG4gICAgY29tcG9uZW50ID0gJHNjb3BlLmRpYWdyYW0uY29tcG9uZW50c1tjb21wb25lbnRJZF07XG5cbiAgICBpZiAoaXNOYU4oY29tcG9uZW50LnopKSB7XG4gICAgICBjb21wb25lbnQueiA9IHo7XG4gICAgICBuZWVkc1RvYmVSZW9yZGVyZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY29tcG9uZW50LnogPCB6KSB7XG4gICAgICAgIGNvbXBvbmVudC56ID0geiArIDE7XG4gICAgICAgIG5lZWRzVG9iZVJlb3JkZXJlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG5lZWRzVG9iZVJlb3JkZXJlZCkge1xuICAgICAgZ3JpZFNlcnZpY2UucmVvcmRlclZpc2libGVDb21wb25lbnRzKCRzY29wZS5pZCk7XG4gICAgfVxuXG4gIH07XG5cbiAgLy8gSW50ZXJhY3Rpb25zIHdpdGggY29tcG9uZW50c1xuXG4gIHRoaXMudG9nZ2xlQ29tcG9uZW50U2VsZWN0ZWQgPSBmdW5jdGlvbiAoY29tcG9uZW50LCAkZXZlbnQpIHtcblxuICAgIHZhciBpbmRleDtcblxuICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGNvbXBvbmVudCkgJiYgIXRoaXMuZGlzYWxsb3dTZWxlY3Rpb24oKSAmJiBjb21wb25lbnQubm9uU2VsZWN0YWJsZSAhPT0gdHJ1ZSkge1xuXG4gICAgICBpbmRleCA9ICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLmluZGV4T2YoY29tcG9uZW50LmlkKTtcblxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIGlmICgkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcy5sZW5ndGggPiAwICYmXG4gICAgICAgICRzY29wZS5kaWFncmFtLmNvbmZpZy5tdWx0aVNlbGVjdCAhPT0gdHJ1ZSAmJlxuICAgICAgICAkZXZlbnQuc2hpZnRLZXkgIT09IHRydWUpIHtcblxuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcywgZnVuY3Rpb24gKGNvbXBvbmVudElkKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGlhZ3JhbS5jb21wb25lbnRzW2NvbXBvbmVudElkXS5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgICRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzID0gW107XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZGlhZ3JhbS5zdGF0ZS5zZWxlY3RlZENvbXBvbmVudElkcy5wdXNoKGNvbXBvbmVudC5pZCk7XG5cbiAgICAgICAgbW92ZUNvbXBvbmVudEVsZW1lbnRUb0Zyb250KGNvbXBvbmVudC5pZCk7XG5cbiAgICAgIH1cblxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMub25Db21wb25lbnRDbGljayA9IGZ1bmN0aW9uIChjb21wb25lbnQsICRldmVudCkge1xuXG4gICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yID0gbnVsbDtcblxuICAgIGlmICgkc2NvcGUuZHJhZ1RhcmdldHNEZXNjcmlwdG9yKSB7XG4gICAgICBmaW5pc2hEcmFnKCk7XG4gICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudG9nZ2xlQ29tcG9uZW50U2VsZWN0ZWQoY29tcG9uZW50LCAkZXZlbnQpO1xuICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICB9O1xuXG4gIHRoaXMub25Qb3J0TW91c2VEb3duID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgcG9ydCwgJGV2ZW50KSB7XG5cbiAgICBpZiAoISRzY29wZS53aXJlU3RhcnQpIHtcbiAgICAgIHBvc3NpYmxlV2lyZVN0YXJ0ID0ge1xuICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudCxcbiAgICAgICAgcG9ydDogcG9ydFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgfTtcblxuICB0aGlzLm9uUG9ydE1vdXNlVXAgPSBmdW5jdGlvbiAoY29tcG9uZW50LCBwb3J0LCAkZXZlbnQpIHtcblxuICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICB9O1xuXG4gIHRoaXMub25Qb3J0Q2xpY2sgPSBmdW5jdGlvbiAoY29tcG9uZW50LCBwb3J0LCAkZXZlbnQpIHtcblxuICAgIGlmIChwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IpIHtcbiAgICAgIHBvc3NpYmJsZURyYWdUYXJnZXRzRGVzY3JpcHRvciA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCRzY29wZS53aXJlU3RhcnQpIHtcblxuICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBpZiAoJHNjb3BlLndpcmVTdGFydC5wb3J0ICE9PSBwb3J0KSB7XG4gICAgICAgIGZpbmlzaFdpcmUoY29tcG9uZW50LCBwb3J0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbmNlbFdpcmUoKTtcbiAgICAgIH1cblxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMub25Db21wb25lbnRNb3VzZURvd24gPSBmdW5jdGlvbiAoY29tcG9uZW50LCAkZXZlbnQpIHtcblxuICAgIHZhciBjb21wb25lbnRzVG9EcmFnLFxuICAgIGdldERyYWdEZXNjcmlwdG9yLFxuICAgIHdpcmVzO1xuXG4gICAgaWYgKCRldmVudC53aGljaCA9PT0gMykge1xuXG4gICAgICBjb21wb25lbnQucm90YXRlKDkwKTtcblxuICAgICAgd2lyZXMgPSBkaWFncmFtU2VydmljZS5nZXRXaXJlc0ZvckNvbXBvbmVudHMoY29tcG9uZW50KTtcblxuICAgICAgY29uc29sZS5sb2coY29tcG9uZW50KTtcblxuICAgICAgYW5ndWxhci5mb3JFYWNoKHdpcmVzLCBmdW5jdGlvbiAod2lyZSkge1xuICAgICAgICB3aXJpbmdTZXJ2aWNlLmFkanVzdFdpcmVFbmRTZWdtZW50cyh3aXJlKTtcbiAgICAgIH0pO1xuXG5cbiAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgY29tcG9uZW50c1RvRHJhZyA9IFtdO1xuXG4gICAgICBnZXREcmFnRGVzY3JpcHRvciA9IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgICB2YXIgb2Zmc2V0ID0gZ2V0T2Zmc2V0VG9Nb3VzZSgkZXZlbnQpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbjoge1xuICAgICAgICAgICAgeDogY29tcG9uZW50LngsXG4gICAgICAgICAgICB5OiBjb21wb25lbnQueVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZGVsdGFUb0N1cnNvcjoge1xuICAgICAgICAgICAgeDogY29tcG9uZW50LnggLSBvZmZzZXQueCxcbiAgICAgICAgICAgIHk6IGNvbXBvbmVudC55IC0gb2Zmc2V0LnlcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLmlzRWRpdGFibGUoKSAmJlxuICAgICAgY29tcG9uZW50Lm5vblNlbGVjdGFibGUgIT09IHRydWUgJiZcbiAgICAgIGNvbXBvbmVudC5sb2NhdGlvbkxvY2tlZCAhPT0gdHJ1ZSkge1xuXG4gICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBwb3NzaWJibGVEcmFnVGFyZ2V0c0Rlc2NyaXB0b3IgPSB7XG4gICAgICAgICAgdGFyZ2V0czogWyBnZXREcmFnRGVzY3JpcHRvcihjb21wb25lbnQpIF1cbiAgICAgICAgfTtcblxuICAgICAgICBjb21wb25lbnRzVG9EcmFnLnB1c2goY29tcG9uZW50KTtcblxuICAgICAgICBpZiAoJHNjb3BlLmRpYWdyYW0uc3RhdGUuc2VsZWN0ZWRDb21wb25lbnRJZHMuaW5kZXhPZihjb21wb25lbnQuaWQpID4gLTEpIHtcblxuICAgICAgICAgIC8vIERyYWcgYWxvbmcgb3RoZXIgc2VsZWN0ZWQgY29tcG9uZW50c1xuXG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5kaWFncmFtLnN0YXRlLnNlbGVjdGVkQ29tcG9uZW50SWRzLCBmdW5jdGlvbiAoc2VsZWN0ZWRDb21wb25lbnRJZCkge1xuXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWRDb21wb25lbnQ7XG5cbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuaWQgIT09IHNlbGVjdGVkQ29tcG9uZW50SWQpIHtcblxuICAgICAgICAgICAgICBzZWxlY3RlZENvbXBvbmVudCA9ICRzY29wZS5kaWFncmFtLmNvbXBvbmVudHNbc2VsZWN0ZWRDb21wb25lbnRJZF07XG5cbiAgICAgICAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yLnRhcmdldHMucHVzaChnZXREcmFnRGVzY3JpcHRvcihzZWxlY3RlZENvbXBvbmVudCkpO1xuXG4gICAgICAgICAgICAgIGNvbXBvbmVudHNUb0RyYWcucHVzaChzZWxlY3RlZENvbXBvbmVudCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9zc2liYmxlRHJhZ1RhcmdldHNEZXNjcmlwdG9yLmFmZmVjdGVkV2lyZXMgPSBkaWFncmFtU2VydmljZS5nZXRXaXJlc0ZvckNvbXBvbmVudHMoY29tcG9uZW50c1RvRHJhZyk7XG5cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdGhpcy5pc0VkaXRhYmxlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgcmV0dXJuICRzY29wZS5kaWFncmFtLmNvbmZpZy5lZGl0YWJsZSA9PT0gdHJ1ZTtcbiAgfTtcblxuICB0aGlzLmRpc2FsbG93U2VsZWN0aW9uID0gZnVuY3Rpb24gKCkge1xuXG4gICAgJHNjb3BlLmRpYWdyYW0uY29uZmlnID0gJHNjb3BlLmRpYWdyYW0uY29uZmlnIHx8IHt9O1xuXG4gICAgcmV0dXJuICRzY29wZS5kaWFncmFtLmNvbmZpZy5kaXNhbGxvd1NlbGVjdGlvbiA9PT0gdHJ1ZTtcbiAgfTtcblxuICB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50RWxlbWVudCA9IGZ1bmN0aW9uIChpZCwgZWwpIHtcblxuICAgIGNvbXBvbmVudEVsZW1lbnRzID0gY29tcG9uZW50RWxlbWVudHMgfHwge307XG5cbiAgICBjb21wb25lbnRFbGVtZW50c1tpZF0gPSBlbDtcblxuICB9O1xuXG4gIHRoaXMudW5yZWdpc3RlckNvbXBvbmVudEVsZW1lbnQgPSBmdW5jdGlvbiAoaWQpIHtcblxuICAgIGNvbXBvbmVudEVsZW1lbnRzID0gY29tcG9uZW50RWxlbWVudHMgfHwge307XG5cbiAgICBkZWxldGUgY29tcG9uZW50RWxlbWVudHNbaWRdO1xuXG4gIH07XG5cbn0pXG4uZGlyZWN0aXZlKCdzdmdEaWFncmFtJywgW1xuICAnJGxvZycsXG4gICdkaWFncmFtU2VydmljZScsXG4gICdncmlkU2VydmljZScsXG4gIGZ1bmN0aW9uICgkbG9nLCBkaWFncmFtU2VydmljZSwgZ3JpZFNlcnZpY2UpIHtcblxuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnU1ZHRGlhZ3JhbUNvbnRyb2xsZXInLFxuICAgICAgcmVxdWlyZTogJ15kaWFncmFtQ29udGFpbmVyJyxcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBzY29wZTogZmFsc2UsXG4gICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvZGVzaWduVmlzdWFsaXphdGlvbi90ZW1wbGF0ZXMvc3ZnRGlhZ3JhbS5odG1sJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcywgZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIpIHtcblxuICAgICAgICB2YXIgaWQ7XG5cbiAgICAgICAgaWQgPSBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5nZXRJZCgpO1xuXG4gICAgICAgIHNjb3BlLmRpYWdyYW0gPSBzY29wZS5kaWFncmFtIHx8IHt9O1xuICAgICAgICBzY29wZS4kZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICAgICAgc2NvcGUuaWQgPSBpZDtcblxuICAgICAgICBzY29wZS52aXNpYmxlT2JqZWN0cyA9IGdyaWRTZXJ2aWNlLmNyZWF0ZUdyaWQoaWQsXG4gICAgICAgIHtcbiAgICAgICAgICB3aWR0aDogMTAwMDAsXG4gICAgICAgICAgaGVpZ2h0OiAxMDAwXG4gICAgICAgIH0sXG4gICAgICAgIHNjb3BlLmRpYWdyYW1cbiAgICAgICAgKTtcblxuICAgICAgICBzY29wZS4kd2F0Y2goXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIuZ2V0VmlzaWJsZUFyZWEoKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKHZpc2libGVBcmVhKSB7XG4gICAgICAgICAgc2NvcGUuZWxlbWVudE9mZnNldCA9IHNjb3BlLiRlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAgIGdyaWRTZXJ2aWNlLnNldFZpc2libGVBcmVhKGlkLCB2aXNpYmxlQXJlYSk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG5cbiAgICB9O1xuICB9XG5dKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4nbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5ib3gnLFxuW11cbikuY29udHJvbGxlcignQm94Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge1xuXG4gICRzY29wZS5wb3J0V2lyZXMgPSBbXTtcblxuICBhbmd1bGFyLmZvckVhY2goJHNjb3BlLmNvbXBvbmVudC5zeW1ib2wucG9ydHMsIGZ1bmN0aW9uKHBvcnQpIHtcblxuICAgIHZhciB0b1ggPSAwLCB0b1k9MCxcbiAgICBwb3J0V2lyZUxlbmd0aCxcbiAgICB3aWR0aCwgaGVpZ2h0O1xuXG4gICAgcG9ydFdpcmVMZW5ndGggPSAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5wb3J0V2lyZUxlbmd0aDtcbiAgICB3aWR0aCA9ICRzY29wZS5jb21wb25lbnQuc3ltYm9sLndpZHRoO1xuICAgIGhlaWdodCA9ICRzY29wZS5jb21wb25lbnQuc3ltYm9sLmhlaWdodDtcblxuICAgIGlmIChwb3J0LnggPT09IDApIHtcbiAgICAgIHRvWCA9IHBvcnRXaXJlTGVuZ3RoO1xuICAgICAgdG9ZID0gcG9ydC55O1xuICAgIH1cblxuICAgIGlmIChwb3J0LnkgPT09IDApIHtcbiAgICAgIHRvWSA9IHBvcnRXaXJlTGVuZ3RoO1xuICAgICAgdG9YID0gcG9ydC54O1xuICAgIH1cblxuICAgIGlmIChwb3J0LnggPT09IHdpZHRoKSB7XG4gICAgICB0b1ggPSB3aWR0aC1wb3J0V2lyZUxlbmd0aDtcbiAgICAgIHRvWSA9IHBvcnQueTtcbiAgICB9XG5cbiAgICBpZiAocG9ydC55ID09PSBoZWlnaHQpIHtcbiAgICAgIHRvWSA9IGhlaWdodC1wb3J0V2lyZUxlbmd0aDtcbiAgICAgIHRvWCA9IHBvcnQueDtcbiAgICB9XG5cbiAgICAkc2NvcGUucG9ydFdpcmVzLnB1c2goe1xuICAgICAgeDE6IHBvcnQueCxcbiAgICAgIHkxOiBwb3J0LnksXG4gICAgICB4MjogdG9YLFxuICAgICAgeTI6IHRvWVxuICAgIH0pO1xuICB9KTtcblxufSlcbi5kaXJlY3RpdmUoXG4nYm94JyxcblxuZnVuY3Rpb24gKCkge1xuXG4gIHJldHVybiB7XG4gICAgc2NvcGU6IGZhbHNlLFxuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyOiAnQm94Q29udHJvbGxlcicsXG4gICAgdGVtcGxhdGVVcmw6ICcvZGVzaWduVmlzdWFsaXphdGlvbi90ZW1wbGF0ZXMvYm94Lmh0bWwnLFxuICAgIHRlbXBsYXRlTmFtZXNwYWNlOiAnU1ZHJ1xuICB9O1xufSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuY2FwYWNpdG9yJyxcbltdXG4pXG4uY29uZmlnKFsnc3ltYm9sTWFuYWdlclByb3ZpZGVyJywgZnVuY3Rpb24oc3ltYm9sTWFuYWdlclByb3ZpZGVyKXtcbiAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKHtcbiAgICB0eXBlOiAnY2FwYWNpdG9yJyxcbiAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLWNhcGFjaXRvcicsXG4gICAgbGFiZWxQcmVmaXg6ICdDJyxcbiAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICB4OiAxMCxcbiAgICAgIHk6IC04XG4gICAgfSxcbiAgICB3aWR0aDogNjAsXG4gICAgaGVpZ2h0OiAxNSxcbiAgICBwb3J0czogW1xuICAgICAge1xuICAgICAgICBpZDogJ0MnLFxuICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgIGxhYmVsOiAnQycsXG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDcuNVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdBJyxcbiAgICAgICAgd2lyZUFuZ2xlOiAwLFxuICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgbGFiZWw6ICdBJyxcbiAgICAgICAgeDogNjAsXG4gICAgICAgIHk6IDcuNVxuICAgICAgfVxuICAgIF1cbiAgfSk7XG59XSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsICQqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4uLy4uL3NlcnZpY2VzL3N5bWJvbFNlcnZpY2VzL3N5bWJvbFNlcnZpY2VzLmpzJyk7XG5yZXF1aXJlKCcuLi9wb3J0L3BvcnQuanMnKTtcblxucmVxdWlyZSgnLi9yZXNpc3Rvci9yZXNpc3Rvci5qcycpO1xucmVxdWlyZSgnLi9qRmV0UC9qRmV0UC5qcycpO1xucmVxdWlyZSgnLi9vcEFtcC9vcEFtcC5qcycpO1xucmVxdWlyZSgnLi9kaW9kZS9kaW9kZS5qcycpO1xucmVxdWlyZSgnLi9jYXBhY2l0b3IvY2FwYWNpdG9yLmpzJyk7XG5yZXF1aXJlKCcuL2luZHVjdG9yL2luZHVjdG9yLmpzJyk7XG5cbnJlcXVpcmUoJy4vYm94L2JveC5qcycpO1xuXG52YXIgc3ltYm9sc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMnLFxuW1xuICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9sU2VydmljZXMnLFxuXG4gICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5wb3J0JyxcblxuICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5yZXNpc3RvcicsXG4gICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmpGZXRQJyxcbiAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMub3BBbXAnLFxuICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5kaW9kZScsXG4gICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmNhcGFjaXRvcicsXG4gICdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLmluZHVjdG9yJyxcblxuICAnbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5ib3gnXG5cbl0pO1xuXG5zeW1ib2xzTW9kdWxlLmNvbnRyb2xsZXIoXG4nU3ltYm9sQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge1xuXG4gICRzY29wZS5nZXRTeW1ib2xUcmFuc2Zvcm0gPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciB0cmFuc2Zvcm1TdHJpbmc7XG5cbi8vICAgIHRyYW5zZm9ybVN0cmluZyA9ICd0cmFuc2xhdGUoJyArICRzY29wZS5jb21wb25lbnQueCArICcsJyArICRzY29wZS5jb21wb25lbnQueSArICcpICc7XG4vLyAgICB0cmFuc2Zvcm1TdHJpbmcgKz1cbi8vICAgICAgJ3JvdGF0ZSgnICsgJHNjb3BlLmNvbXBvbmVudC5yb3RhdGlvbiArICcgJyArICRzY29wZS5jb21wb25lbnQuc3ltYm9sLndpZHRoLzIgKyAnICcgKyAkc2NvcGUuY29tcG9uZW50LnN5bWJvbC5oZWlnaHQvMiAgKyAnKSAnO1xuLy8gICAgLy90cmFuc2Zvcm1TdHJpbmcgKz0gJ3NjYWxlKCcgKyAkc2NvcGUuY29tcG9uZW50LnNjYWxlWCArICcsJyArICRzY29wZS5jb21wb25lbnQuc2NhbGVZICsgJykgJztcbi8vXG4vLyAgICBjb25zb2xlLmxvZygkc2NvcGUuY29tcG9uZW50LmdldFRyYW5zZm9ybWF0aW9uTWF0cml4KCkuam9pbignLCAnKSk7XG5cbiAgICB0cmFuc2Zvcm1TdHJpbmcgPSAnbWF0cml4KCcgKyAkc2NvcGUuY29tcG9uZW50LmdldFNWR1RyYW5zZm9ybWF0aW9uU3RyaW5nKCkgKyAnKSc7XG5cbiAgICByZXR1cm4gdHJhbnNmb3JtU3RyaW5nO1xuICB9O1xuXG59KTtcblxuc3ltYm9sc01vZHVsZS5kaXJlY3RpdmUoXG4nY29tcG9uZW50U3ltYm9sJyxcblxuZnVuY3Rpb24gKCRjb21waWxlKSB7XG5cbiAgcmV0dXJuIHtcbiAgICBzY29wZToge1xuICAgICAgY29tcG9uZW50OiAnPScsXG4gICAgICB0ZXN0OiAnPScsXG4gICAgICBwYWdlOiAnPScsXG4gICAgICBpbnN0YW5jZTogJz0nXG4gICAgfSxcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgY29udHJvbGxlcjogJ1N5bWJvbENvbnRyb2xsZXInLFxuICAgIHRlbXBsYXRlVXJsOiAnL2Rlc2lnblZpc3VhbGl6YXRpb24vdGVtcGxhdGVzL2NvbXBvbmVudFN5bWJvbC5odG1sJyxcbiAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRycsXG4gICAgcmVxdWlyZTogWydec3ZnRGlhZ3JhbScsICdeZGlhZ3JhbUNvbnRhaW5lciddLFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcywgY29udHJvbGxlcnMpIHtcblxuICAgICAgdmFyIHRlbXBsYXRlU3RyLFxuICAgICAgdGVtcGxhdGUsXG5cbiAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLFxuICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIsXG5cbiAgICAgICRlbCxcbiAgICAgIGNvbXBpbGVkU3ltYm9sLFxuICAgICAgc3ltYm9sQ29tcG9uZW50O1xuXG4gICAgICBzdmdEaWFncmFtQ29udHJvbGxlciA9IGNvbnRyb2xsZXJzWzBdO1xuICAgICAgZGlhZ3JhbUNvbnRhaW5lckNvbnRyb2xsZXIgPSBjb250cm9sbGVyc1sxXTtcblxuICAgICAgc2NvcGUucG9ydHNWaXNpYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUuZGV0YWlsc1Zpc2libGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLmdldFpvb21MZXZlbCgpID4gMTtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLmdldENzc0NsYXNzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICByZXN1bHQgPSBzY29wZS5jb21wb25lbnQuc3ltYm9sLnR5cGU7XG5cbiAgICAgICAgaWYgKGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLmlzQ29tcG9uZW50U2VsZWN0ZWQoc2NvcGUuY29tcG9uZW50KSkge1xuICAgICAgICAgIHJlc3VsdCArPSAnIHNlbGVjdGVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAgIH07XG5cbiAgICAgIC8vIEludGVyYWN0aW9uc1xuXG4gICAgICBzY29wZS5vbkNsaWNrID0gZnVuY3Rpb24oJGV2ZW50KSB7XG4gICAgICAgIHN2Z0RpYWdyYW1Db250cm9sbGVyLm9uQ29tcG9uZW50Q2xpY2soc2NvcGUuY29tcG9uZW50LCAkZXZlbnQpO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUub25Nb3VzZURvd24gPSBmdW5jdGlvbigkZXZlbnQpIHtcbiAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIub25Db21wb25lbnRNb3VzZURvd24oc2NvcGUuY29tcG9uZW50LCAkZXZlbnQpO1xuICAgICAgfTtcblxuICAgICAgc3ltYm9sQ29tcG9uZW50ID0gc2NvcGUuY29tcG9uZW50LnN5bWJvbC5zeW1ib2xDb21wb25lbnQgfHwgJ2dlbmVyaWMtc3ZnJztcbiAgICAgIFxuICAgICAgY29tcGlsZWRTeW1ib2wgPSBkaWFncmFtQ29udGFpbmVyQ29udHJvbGxlci5nZXRDb21waWxlZERpcmVjdGl2ZShzeW1ib2xDb21wb25lbnQpO1xuXG4gICAgICBpZiAoIWFuZ3VsYXIuaXNGdW5jdGlvbihjb21waWxlZFN5bWJvbCkpIHtcblxuICAgICAgICB0ZW1wbGF0ZVN0ciA9ICc8JyArIHN5bWJvbENvbXBvbmVudCArICc+JyArXG4gICAgICAgICc8LycgKyBzeW1ib2xDb21wb25lbnQgKyAnPic7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBhbmd1bGFyLmVsZW1lbnQodGVtcGxhdGVTdHIpO1xuXG4gICAgICAgIGNvbXBpbGVkU3ltYm9sID0gJGNvbXBpbGUodGVtcGxhdGUpO1xuXG4gICAgICAgIGRpYWdyYW1Db250YWluZXJDb250cm9sbGVyLnNldENvbXBpbGVkRGlyZWN0aXZlKHN5bWJvbENvbXBvbmVudCwgY29tcGlsZWRTeW1ib2wpO1xuXG4gICAgICB9XG5cbiAgICAgICRlbCA9ICQoZWxlbWVudCk7XG5cbiAgICAgIGNvbXBpbGVkU3ltYm9sKHNjb3BlLCBmdW5jdGlvbihjbG9uZWRFbGVtZW50KXtcbiAgICAgICAgJGVsLmZpbmQoJy5zeW1ib2wtcGxhY2Vob2xkZXInKS5yZXBsYWNlV2l0aChjbG9uZWRFbGVtZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICBzdmdEaWFncmFtQ29udHJvbGxlci5yZWdpc3RlckNvbXBvbmVudEVsZW1lbnQoc2NvcGUuY29tcG9uZW50LmlkLCAkZWwpO1xuXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKXtcbiAgICAgICAgc3ZnRGlhZ3JhbUNvbnRyb2xsZXIudW5yZWdpc3RlckNvbXBvbmVudEVsZW1lbnQoc2NvcGUuY29tcG9uZW50LmlkKTtcbiAgICAgIH0pO1xuXG4gICAgfVxuICB9O1xufVxuKTtcblxuc3ltYm9sc01vZHVsZS5kaXJlY3RpdmUoXG4nZ2VuZXJpY1N2ZycsXG5cbmZ1bmN0aW9uICgpIHtcblxuICByZXR1cm4ge1xuICAgIHNjb3BlOiBmYWxzZSxcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgdGVtcGxhdGVVcmw6ICcvZGVzaWduVmlzdWFsaXphdGlvbi90ZW1wbGF0ZXMvZ2VuZXJpY1N2Zy5odG1sJyxcbiAgICB0ZW1wbGF0ZU5hbWVzcGFjZTogJ1NWRydcbiAgfTtcbn1cbik7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuZGlvZGUnLFxuW11cbilcbi5jb25maWcoWydzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLCBmdW5jdGlvbihzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpe1xuICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woe1xuICAgIHR5cGU6ICdkaW9kZScsXG4gICAgZGlyZWN0aXZlOiBudWxsLFxuICAgIHN2Z0RlY29yYXRpb246ICdpbWFnZXMvc3ltYm9scy5zdmcjaWNvbi1kaW9kZScsXG4gICAgbGFiZWxQcmVmaXg6ICdEJyxcbiAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICB4OiAxMCxcbiAgICAgIHk6IC04XG4gICAgfSxcbiAgICB3aWR0aDogNjAsXG4gICAgaGVpZ2h0OiAxNSxcbiAgICBwb3J0czogW1xuICAgICAge1xuICAgICAgICBpZDogJ0MnLFxuICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICBsYWJlbDogJ0MnLFxuICAgICAgICB4OiAwLFxuICAgICAgICB5OiA3XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogJ0EnLFxuICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgIGxhYmVsOiAnQScsXG4gICAgICAgIHg6IDYwLFxuICAgICAgICB5OiA3XG4gICAgICB9XG4gICAgXVxuICB9KTtcbn1dKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4nbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5pbmR1Y3RvcicsXG5bXVxuKVxuLmNvbmZpZyhbJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsIGZ1bmN0aW9uKHN5bWJvbE1hbmFnZXJQcm92aWRlcil7XG4gIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCh7XG4gICAgdHlwZTogJ2luZHVjdG9yJyxcbiAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLWluZHVjdG9yJyxcbiAgICBsYWJlbFByZWZpeDogJ0wnLFxuICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgIHg6IDEwLFxuICAgICAgeTogLThcbiAgICB9LFxuICAgIHdpZHRoOiA1MCxcbiAgICBoZWlnaHQ6IDEwLFxuICAgIHBvcnRzOiBbXG4gICAgICB7XG4gICAgICAgIGlkOiAncDEnLFxuICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgIGxhYmVsOiAncDEnLFxuICAgICAgICB4OiAwLFxuICAgICAgICB5OiA2LjVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAncDInLFxuICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICBsYWJlbDogJ3AyJyxcbiAgICAgICAgeDogNTAsXG4gICAgICAgIHk6IDYuNVxuICAgICAgfVxuICAgIF1cbiAgfSk7XG59XSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKFxuJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbHMuakZldFAnLFxuW11cbilcbi5jb25maWcoWydzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLCBmdW5jdGlvbihzeW1ib2xNYW5hZ2VyUHJvdmlkZXIpe1xuICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woe1xuICAgIHR5cGU6ICdqRmV0UCcsXG4gICAgZGlyZWN0aXZlOiBudWxsLFxuICAgIHN2Z0RlY29yYXRpb246ICdpbWFnZXMvc3ltYm9scy5zdmcjaWNvbi1qRmV0UCcsXG4gICAgbGFiZWxQcmVmaXg6ICdRJyxcbiAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICB4OiA2MCxcbiAgICAgIHk6IDEyXG4gICAgfSxcbiAgICB3aWR0aDogNjIsXG4gICAgaGVpZ2h0OiA3MCxcbiAgICBwb3J0czogW1xuICAgICAge1xuICAgICAgICBpZDogJ3MnLFxuICAgICAgICB3aXJlQW5nbGU6IDI3MCxcbiAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgIGxhYmVsOiAnUycsXG4gICAgICAgIHg6IDQ2LFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogJ2QnLFxuICAgICAgICB3aXJlQW5nbGU6IDkwLFxuICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgbGFiZWw6ICdEJyxcbiAgICAgICAgeDogNDYsXG4gICAgICAgIHk6IDcwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogJ2cnLFxuICAgICAgICB3aXJlQW5nbGU6IDE4MCxcbiAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgIGxhYmVsOiAnRycsXG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDI2XG4gICAgICB9XG4gICAgXVxuICB9KTtcbn1dKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoXG4nbW1zLmRlc2lnblZpc3VhbGl6YXRpb24uc3ltYm9scy5vcEFtcCcsXG5bXVxuKVxuLmNvbmZpZyhbJ3N5bWJvbE1hbmFnZXJQcm92aWRlcicsIGZ1bmN0aW9uKHN5bWJvbE1hbmFnZXJQcm92aWRlcil7XG4gIHN5bWJvbE1hbmFnZXJQcm92aWRlci5yZWdpc3RlclN5bWJvbCh7XG4gICAgdHlwZTogJ29wQW1wJyxcbiAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgc3ZnRGVjb3JhdGlvbjogJ2ltYWdlcy9zeW1ib2xzLnN2ZyNpY29uLW9wQW1wJyxcbiAgICBsYWJlbFByZWZpeDogJ0EnLFxuICAgIGxhYmVsUG9zaXRpb246IHtcbiAgICAgIHg6IDkwLFxuICAgICAgeTogMTVcbiAgICB9LFxuICAgIHdpZHRoOiAxNDAsXG4gICAgaGVpZ2h0OiAxMDAsXG4gICAgcG9ydHM6IFtcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdWcysnLFxuICAgICAgICB3aXJlQW5nbGU6IDI3MCxcbiAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgIGxhYmVsOiAnVnMrJyxcbiAgICAgICAgeDogNjUsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAnVm91dCcsXG4gICAgICAgIHdpcmVBbmdsZTogMCxcbiAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgIGxhYmVsOiAnVm91dCcsXG4gICAgICAgIHg6IDE0MCxcbiAgICAgICAgeTogNTBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAnVnMtJyxcbiAgICAgICAgd2lyZUFuZ2xlOiA5MCxcbiAgICAgICAgd2lyZUxlYWRJbjogMjAsXG4gICAgICAgIGxhYmVsOiAnVnMtJyxcbiAgICAgICAgeDogNjUsXG4gICAgICAgIHk6IDEwMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdWLScsXG4gICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgbGFiZWw6ICdWLScsXG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDc1XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogJ1YrJyxcbiAgICAgICAgd2lyZUFuZ2xlOiAxODAsXG4gICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICBsYWJlbDogJ1YrJyxcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMjVcbiAgICAgIH1cbiAgICBdXG4gIH0pO1xufV0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZShcbidtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5zeW1ib2xzLnJlc2lzdG9yJyxcbltdXG4pXG4uY29uZmlnKFsnc3ltYm9sTWFuYWdlclByb3ZpZGVyJywgZnVuY3Rpb24oc3ltYm9sTWFuYWdlclByb3ZpZGVyKXtcbiAgc3ltYm9sTWFuYWdlclByb3ZpZGVyLnJlZ2lzdGVyU3ltYm9sKHtcbiAgICB0eXBlOiAncmVzaXN0b3InLFxuICAgIHN5bWJvbENvbXBvbmVudDogbnVsbCxcbiAgICBzdmdEZWNvcmF0aW9uOiAnaW1hZ2VzL3N5bWJvbHMuc3ZnI2ljb24tcmVzaXN0b3InLFxuICAgIGxhYmVsUHJlZml4OiAnUicsXG4gICAgbGFiZWxQb3NpdGlvbjoge1xuICAgICAgeDogMTAsXG4gICAgICB5OiAtOFxuICAgIH0sXG4gICAgd2lkdGg6IDYwLFxuICAgIGhlaWdodDogMTAsXG4gICAgcG9ydHM6IFtcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdwMScsXG4gICAgICAgIHdpcmVBbmdsZTogMTgwLFxuICAgICAgICB3aXJlTGVhZEluOiAyMCxcbiAgICAgICAgbGFiZWw6ICdwMScsXG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAncDInLFxuICAgICAgICB3aXJlQW5nbGU6IDAsXG4gICAgICAgIHdpcmVMZWFkSW46IDIwLFxuICAgICAgICBsYWJlbDogJ3AyJyxcbiAgICAgICAgeDogNjAsXG4gICAgICAgIHk6IDVcbiAgICAgIH1cbiAgICBdXG4gIH0pO1xufV0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2xNYXRyaXggPSByZXF1aXJlKCdnbE1hdHJpeCcpO1xuXG52YXIgQ29tcG9uZW50UG9ydCA9IGZ1bmN0aW9uIChkZXNjcmlwdG9yKSB7XG5cbiAgYW5ndWxhci5leHRlbmQodGhpcywgZGVzY3JpcHRvcik7XG5cbn07XG5cbkNvbXBvbmVudFBvcnQucHJvdG90eXBlLmdldEdyaWRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gIHZhciBwb3NpdGlvbixcbiAgICBwb3NpdGlvblZlY3RvcjtcblxuICBpZiAoYW5ndWxhci5pc09iamVjdCh0aGlzLnBvcnRTeW1ib2wpICYmIGFuZ3VsYXIuaXNPYmplY3QodGhpcy5wYXJlbnRDb21wb25lbnQpKSB7XG5cbiAgICBwb3NpdGlvblZlY3RvciA9IGdsTWF0cml4LnZlYzIuY3JlYXRlKCk7XG4gICAgZ2xNYXRyaXgudmVjMi5zZXQocG9zaXRpb25WZWN0b3IsIHRoaXMucG9ydFN5bWJvbC54LCB0aGlzLnBvcnRTeW1ib2wueSk7XG5cbiAgICBnbE1hdHJpeC52ZWMyLnRyYW5zZm9ybU1hdDMocG9zaXRpb25WZWN0b3IsIHBvc2l0aW9uVmVjdG9yLCB0aGlzLnBhcmVudENvbXBvbmVudC5nZXRUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpKTtcblxuICAgIHBvc2l0aW9uID0ge1xuXG4gICAgICB4OiBwb3NpdGlvblZlY3RvclswXSxcbiAgICAgIHk6IHBvc2l0aW9uVmVjdG9yWzFdXG5cbiAgICB9O1xuXG4gIH1cblxuICByZXR1cm4gcG9zaXRpb247XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50UG9ydDsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGdsTWF0cml4ID0gcmVxdWlyZSgnZ2xNYXRyaXgnKTtcblxudmFyIERpYWdyYW1Db21wb25lbnQgPSBmdW5jdGlvbiAoZGVzY3JpcHRvcikge1xuXG4gIGlmICghYW5ndWxhci5pc09iamVjdChkZXNjcmlwdG9yLnN5bWJvbCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHN5bWJvbCBmb3VuZCBmb3IgY29tcG9uZW50ICcgKyB0aGlzLmlkKTtcbiAgfVxuXG4gIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIGRlc2NyaXB0b3IpO1xuXG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5pc0luVmlld1BvcnQgPSBmdW5jdGlvbiAodmlld1BvcnQsIHBhZGRpbmcpIHtcblxuICAvL1RPRE86IGNvdW50IHdpZHRoIGFuZCBoZWlnaHQgZm9yIG9yaWVudGF0aW9uXG4gIHBhZGRpbmcgPSBwYWRkaW5nIHx8IHt4OiAwLCB5OiAwfTtcblxuICByZXR1cm4gKFxuICBhbmd1bGFyLmlzT2JqZWN0KHZpZXdQb3J0KSAmJlxuICB0aGlzLnggKyB0aGlzLnN5bWJvbC53aWR0aCA+PSAoIHZpZXdQb3J0LmxlZnQgKyBwYWRkaW5nLnggKSAmJlxuICB0aGlzLnggPD0gKCB2aWV3UG9ydC5yaWdodCAtIHBhZGRpbmcueCApICYmXG4gIHRoaXMueSArIHRoaXMuc3ltYm9sLmhlaWdodCA+PSAoIHZpZXdQb3J0LnRvcCArIHBhZGRpbmcueSApICYmXG4gIHRoaXMueSA8PSAoIHZpZXdQb3J0LmJvdHRvbSAtIHBhZGRpbmcueSApICk7XG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1hdGlvbk1hdHJpeCA9IGZ1bmN0aW9uKCkge1xuXG4gIGlmICghYW5ndWxhci5pc0FycmF5KHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXgpKSB7XG4gICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXg7XG5cbn07XG5cblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0U1ZHVHJhbnNmb3JtYXRpb25NYXRyaXggPSBmdW5jdGlvbigpIHtcblxuICBpZiAoIWFuZ3VsYXIuaXNBcnJheSh0aGlzLnN2Z1RyYW5zZm9ybWF0aW9uTWF0cml4KSkge1xuICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLnN2Z1RyYW5zZm9ybWF0aW9uTWF0cml4O1xuXG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5nZXRTVkdUcmFuc2Zvcm1hdGlvblN0cmluZyA9IGZ1bmN0aW9uKCkge1xuXG4gIHZhciB0cmFuc01hdHJpeCA9IHRoaXMuZ2V0U1ZHVHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcblxuICByZXR1cm4gdHJhbnNNYXRyaXguam9pbignLCAnKTtcbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybWF0aW9uTWF0cml4ID0gZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHJvdGF0aW9uUmFkLFxuICAvL3NpbkEsIGNvc0EsXG4gIHRyYW5zbGF0aW9uLFxuICB0cmFuc2Zvcm1NYXQzLFxuICByZXN1bHQ7XG5cbiAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIodGhpcy5yb3RhdGlvbikgJiZcbiAgYW5ndWxhci5pc051bWJlcih0aGlzLngpLFxuICBhbmd1bGFyLmlzTnVtYmVyKHRoaXMueSkpIHtcblxuICAgIHJvdGF0aW9uUmFkID0gdGhpcy5yb3RhdGlvbi8xODAgKiBNYXRoLlBJO1xuXG4gICAgdHJhbnNmb3JtTWF0MyA9IGdsTWF0cml4Lm1hdDMuY3JlYXRlKCk7XG5cbiAgICB0cmFuc2xhdGlvbiA9IGdsTWF0cml4LnZlYzIuY3JlYXRlKCk7XG4gICAgZ2xNYXRyaXgudmVjMi5zZXQodHJhbnNsYXRpb24sIHRoaXMueCwgdGhpcy55KTtcblxuICAgIGdsTWF0cml4Lm1hdDMudHJhbnNsYXRlKFxuICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgdHJhbnNmb3JtTWF0MyxcbiAgICB0cmFuc2xhdGlvblxuICAgICk7XG5cbiAgICBnbE1hdHJpeC5tYXQzLnJvdGF0ZShcbiAgICAgIHRyYW5zZm9ybU1hdDMsXG4gICAgICB0cmFuc2Zvcm1NYXQzLFxuICAgICAgcm90YXRpb25SYWRcbiAgICApO1xuXG4vLyAgICBzaW5BID0gTWF0aC5zaW4ocm90YXRpb25SYWQpO1xuLy8gICAgY29zQSA9IE1hdGguY29zKHJvdGF0aW9uUmFkKTtcbi8vXG4vLyAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ID0gW1xuLy8gICAgICB0aGlzLnNjYWxlWCAqIGNvc0EsXG4vLyAgICAgIHNpbkEsXG4vLyAgICAgIC1zaW5BLFxuLy8gICAgICB0aGlzLnNjYWxlWSAqIGNvc0EsXG4vLyAgICAgIHRoaXMueCxcbi8vICAgICAgdGhpcy55XG4vLyAgICBdO1xuXG4gICAgdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeCA9IHRyYW5zZm9ybU1hdDM7XG4gICAgXG4gICAgdGhpcy5zdmdUcmFuc2Zvcm1hdGlvbk1hdHJpeCA9IFtcbiAgICAgIHRyYW5zZm9ybU1hdDNbMF0sXG4gICAgICB0cmFuc2Zvcm1NYXQzWzFdLFxuICAgICAgdHJhbnNmb3JtTWF0M1szXSxcbiAgICAgIHRyYW5zZm9ybU1hdDNbNF0sXG4gICAgICB0cmFuc2Zvcm1NYXQzWzZdLFxuICAgICAgdHJhbnNmb3JtTWF0M1s3XVxuICAgIF07XG5cbiAgICByZXN1bHQgPSAgdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeDtcblxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcblxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbih4LCB5KSB7XG5cbiAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIoeCkgJiYgYW5ndWxhci5pc051bWJlcih5KSkge1xuXG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuXG4gICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIG51bWJlcnMhJyk7XG4gIH1cbn07XG5cbkRpYWdyYW1Db21wb25lbnQucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uKGFuZ2xlKSB7XG5cbiAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIoYW5nbGUpKSB7XG5cbiAgICB0aGlzLnJvdGF0aW9uICs9IGFuZ2xlO1xuXG4gICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1hdGlvbk1hdHJpeCgpO1xuXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBbmdsZSBtdXN0IGJlIG51bWJlciEnKTtcbiAgfVxufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUucmVnaXN0ZXJQb3J0SW5zdGFuY2VzID0gZnVuY3Rpb24obmV3UG9ydHMpIHtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdGhpcy5wb3J0SW5zdGFuY2VzID0gdGhpcy5wb3J0SW5zdGFuY2VzIHx8IFtdO1xuXG4gIGFuZ3VsYXIuZm9yRWFjaChuZXdQb3J0cywgZnVuY3Rpb24obmV3UG9ydCkge1xuXG4gICAgbmV3UG9ydC5wYXJlbnRDb21wb25lbnQgPSBzZWxmO1xuICAgIHNlbGYucG9ydEluc3RhbmNlcy5wdXNoKG5ld1BvcnQpO1xuXG4gIH0pO1xufTtcblxuRGlhZ3JhbUNvbXBvbmVudC5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtZWREaW1lbnNpb25zID0gZnVuY3Rpb24oKSB7XG4vLyAgdmFyIHdpZHRoLCBoZWlnaHQ7XG59O1xuXG5EaWFncmFtQ29tcG9uZW50LnByb3RvdHlwZS5sb2NhbFRvR2xvYmFsID0gZnVuY3Rpb24oKSB7XG5cbiAgaWYgKCF0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4KSB7XG4gICAgdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeCA9IHRoaXMuZ2V0VHJhbnNmb3JtYXRpb25NYXRyaXgoKTtcbiAgfVxuXG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaWFncmFtQ29tcG9uZW50OyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgV2lyZSA9IGZ1bmN0aW9uIChkZXNjcmlwdG9yKSB7XG5cbiAgYW5ndWxhci5leHRlbmQodGhpcywgZGVzY3JpcHRvcik7XG5cbiAgdGhpcy5zZWdtZW50cyA9IFtdO1xuXG59O1xuXG5XaXJlLnByb3RvdHlwZS5pc0luVmlld1BvcnQgPSBmdW5jdGlvbiAodmlld1BvcnQsIHBhZGRpbmcpIHtcblxuICB2YXIgaixcbiAgICBzaG91bGRCZVZpc2libGUsXG4gIHNlZ21lbnQ7XG5cbiAgcGFkZGluZyA9IHBhZGRpbmcgfHwge3g6IDAsIHk6IDB9O1xuXG4gIHNob3VsZEJlVmlzaWJsZSA9IGZhbHNlO1xuXG4gIGlmICggdGhpcy5yb3V0ZXJUeXBlID09PSAnRWxib3dSb3V0ZXInKSB7XG5cbiAgICBpZiAoYW5ndWxhci5pc0FycmF5KHRoaXMuc2VnbWVudHMpKSB7XG5cbiAgICAgIGZvciAoaj0wOyBqIDwgdGhpcy5zZWdtZW50cy5sZW5ndGggJiYgIXNob3VsZEJlVmlzaWJsZTsgaisrKSB7XG5cbiAgICAgICAgc2VnbWVudCA9IHRoaXMuc2VnbWVudHNbal07XG5cbiAgICAgICAgaWYgKHNlZ21lbnQub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcpIHtcblxuICAgICAgICAgIGlmICggc2VnbWVudC54MSA+PSAoIHZpZXdQb3J0LmxlZnQgKyBwYWRkaW5nLnggKSAmJlxuICAgICAgICAgICAgc2VnbWVudC54MSA8PSAoIHZpZXdQb3J0LnJpZ2h0IC0gcGFkZGluZy54ICkpIHtcbiAgICAgICAgICAgIHNob3VsZEJlVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICBpZiAoIHNlZ21lbnQueTEgPj0gKCB2aWV3UG9ydC50b3AgKyBwYWRkaW5nLnkgKSAmJlxuICAgICAgICAgIHNlZ21lbnQueTEgPD0gKCB2aWV3UG9ydC5ib3R0b20gLSBwYWRkaW5nLnkgKSkge1xuICAgICAgICAgICAgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICBzaG91bGRCZVZpc2libGUgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHNob3VsZEJlVmlzaWJsZTtcblxufTtcblxuV2lyZS5wcm90b3R5cGUuZ2V0RW5kUG9zaXRpb25zID0gZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHBvcnQxUG9zaXRpb24sXG4gICAgcG9ydDJQb3NpdGlvbjtcblxuICBwb3J0MVBvc2l0aW9uID0gdGhpcy5lbmQxLnBvcnQuZ2V0R3JpZFBvc2l0aW9uKCk7XG4gIHBvcnQyUG9zaXRpb24gPSB0aGlzLmVuZDIucG9ydC5nZXRHcmlkUG9zaXRpb24oKTtcblxuICByZXR1cm4ge1xuXG4gICAgZW5kMTogcG9ydDFQb3NpdGlvbixcbiAgICBlbmQyOiBwb3J0MlBvc2l0aW9uXG5cbiAgfTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXaXJlOyIsIi8qZ2xvYmFscyBhbmd1bGFyICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW92ZSB0aGlzIHRvIEdNRSBldmVudHVhbGx5XG5cbmFuZ3VsYXIubW9kdWxlKCdtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5kaWFncmFtU2VydmljZScsIFtcbiAgJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbFNlcnZpY2VzJ1xuXSlcbi5jb25maWcoWydzeW1ib2xNYW5hZ2VyUHJvdmlkZXInLCBmdW5jdGlvbiAoc3ltYm9sTWFuYWdlclByb3ZpZGVyKSB7XG5cbiAgdmFyIHJhbmRvbVN5bWJvbEdlbmVyYXRvcixcbiAga2luZHMgPSA3O1xuXG4gIHJhbmRvbVN5bWJvbEdlbmVyYXRvciA9IGZ1bmN0aW9uIChjb3VudCkge1xuXG4gICAgdmFyIGksXG4gICAgcG9ydENvdW50LFxuICAgIHN5bWJvbCxcbiAgICBtYWtlQVJhbmRvbVN5bWJvbCxcbiAgICBtYWtlU29tZVBvcnRzLFxuICAgIG1pblBvcnRzID0gNixcbiAgICBtYXhQb3J0cyA9IDMwLFxuICAgIHBvcnRXaXJlTGVuZ3RoID0gMjAsXG5cbiAgICBzcHJlYWRQb3J0c0Fsb25nU2lkZTtcblxuICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlID0gZnVuY3Rpb24gKHNvbWVQb3J0cywgc2lkZSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgdmFyIG9mZnNldCA9IDIgKiBwb3J0V2lyZUxlbmd0aDtcblxuICAgICAgYW5ndWxhci5mb3JFYWNoKHNvbWVQb3J0cywgZnVuY3Rpb24gKGFQb3J0KSB7XG5cbiAgICAgICAgc3dpdGNoIChzaWRlKSB7XG5cbiAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgYVBvcnQueCA9IG9mZnNldDtcbiAgICAgICAgICAgIGFQb3J0LnkgPSAwO1xuICAgICAgICAgICAgYVBvcnQud2lyZUFuZ2xlID0gLTkwO1xuXG4gICAgICAgICAgICBvZmZzZXQgKz0gd2lkdGggLyAoc29tZVBvcnRzLmxlbmd0aCArIDIpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgIGFQb3J0LnggPSB3aWR0aDtcbiAgICAgICAgICAgIGFQb3J0LnkgPSBvZmZzZXQ7XG4gICAgICAgICAgICBhUG9ydC53aXJlQW5nbGUgPSAwO1xuXG4gICAgICAgICAgICBvZmZzZXQgKz0gaGVpZ2h0IC8gKHNvbWVQb3J0cy5sZW5ndGggKyAyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgYVBvcnQueCA9IG9mZnNldDtcbiAgICAgICAgICAgIGFQb3J0LnkgPSBoZWlnaHQ7XG4gICAgICAgICAgICBhUG9ydC53aXJlQW5nbGUgPSA5MDtcblxuICAgICAgICAgICAgb2Zmc2V0ICs9IHdpZHRoIC8gKHNvbWVQb3J0cy5sZW5ndGggKyAyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgIGFQb3J0LnggPSAwO1xuICAgICAgICAgICAgYVBvcnQueSA9IG9mZnNldDtcbiAgICAgICAgICAgIGFQb3J0LndpcmVBbmdsZSA9IDE4MDtcblxuICAgICAgICAgICAgb2Zmc2V0ICs9IGhlaWdodCAvIChzb21lUG9ydHMubGVuZ3RoICsgMik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIH1cblxuICAgICAgfSk7XG5cbiAgICB9O1xuXG5cbiAgICBtYWtlU29tZVBvcnRzID0gZnVuY3Rpb24gKGNvdW50T2ZQb3J0cykge1xuXG4gICAgICB2YXIgcG9ydHMgPSBbXSxcbiAgICAgIHBvcnQsXG4gICAgICBwbGFjZW1lbnQsXG4gICAgICBpLFxuICAgICAgdG9wID0gW10sXG4gICAgICByaWdodCA9IFtdLFxuICAgICAgYm90dG9tID0gW10sXG4gICAgICBsZWZ0ID0gW10sXG4gICAgICB3aWR0aCwgaGVpZ2h0LFxuICAgICAgc2lkZXMgPSBbdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0XSxcbiAgICAgIHBvcnRTcGFjaW5nID0gMjAsXG4gICAgICBtaW5XaWR0aCA9IDE0MCxcbiAgICAgIG1pbkhlaWdodCA9IDgwO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnRPZlBvcnRzOyBpKyspIHtcblxuICAgICAgICBwb3J0ID0ge1xuICAgICAgICAgIGlkOiAncF8nICsgaSxcbiAgICAgICAgICBsYWJlbDogJ1BvcnQtJyArIGksXG4gICAgICAgICAgd2lyZUxlYWRJbjogMjBcbiAgICAgICAgfTtcblxuICAgICAgICBwbGFjZW1lbnQgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAzKTtcblxuICAgICAgICBzaWRlc1twbGFjZW1lbnRdLnB1c2gocG9ydCk7XG4gICAgICB9XG5cbiAgICAgIHdpZHRoID0gTWF0aC5tYXgoXG4gICAgICBwb3J0U3BhY2luZyAqIHRvcC5sZW5ndGggKyA0ICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICBwb3J0U3BhY2luZyAqIGJvdHRvbS5sZW5ndGggKyA0ICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICBtaW5XaWR0aFxuICAgICAgKTtcblxuICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgoXG4gICAgICBwb3J0U3BhY2luZyAqIGxlZnQubGVuZ3RoICsgNCAqIHBvcnRXaXJlTGVuZ3RoLFxuICAgICAgcG9ydFNwYWNpbmcgKiByaWdodC5sZW5ndGggKyA0ICogcG9ydFdpcmVMZW5ndGgsXG4gICAgICBtaW5IZWlnaHRcbiAgICAgICk7XG5cbiAgICAgIHNwcmVhZFBvcnRzQWxvbmdTaWRlKHRvcCwgJ3RvcCcsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGUocmlnaHQsICdyaWdodCcsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgc3ByZWFkUG9ydHNBbG9uZ1NpZGUoYm90dG9tLCAnYm90dG9tJywgd2lkdGgsIGhlaWdodCk7XG4gICAgICBzcHJlYWRQb3J0c0Fsb25nU2lkZShsZWZ0LCAnbGVmdCcsIHdpZHRoLCBoZWlnaHQpO1xuXG5cbiAgICAgIHBvcnRzID0gcG9ydHMuY29uY2F0KHRvcCkuY29uY2F0KHJpZ2h0KS5jb25jYXQoYm90dG9tKS5jb25jYXQobGVmdCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBvcnRzOiBwb3J0cyxcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgfTtcblxuICAgIH07XG5cbiAgICBtYWtlQVJhbmRvbVN5bWJvbCA9IGZ1bmN0aW9uIChpZFBvc3RmaXgsIGNvdW50T2ZQb3J0cykge1xuXG4gICAgICB2YXIgcG9ydHNBbmRTaXplcyA9IG1ha2VTb21lUG9ydHMoY291bnRPZlBvcnRzKTtcblxuICAgICAgdmFyIHN5bWJvbCA9IHtcbiAgICAgICAgdHlwZTogJ3JhbmRvbV8nICsgaWRQb3N0Zml4LFxuICAgICAgICBzeW1ib2xDb21wb25lbnQ6ICdib3gnLFxuICAgICAgICBzdmdEZWNvcmF0aW9uOiBudWxsLFxuICAgICAgICBsYWJlbFByZWZpeDogJ1JORF8nICsgY291bnRPZlBvcnRzICsgJ18nICsgaWRQb3N0Zml4ICsgJyAnLFxuICAgICAgICBsYWJlbFBvc2l0aW9uOiB7XG4gICAgICAgICAgeDogcG9ydFdpcmVMZW5ndGggKyAxMCxcbiAgICAgICAgICB5OiBwb3J0V2lyZUxlbmd0aCArIDIwXG4gICAgICAgIH0sXG4gICAgICAgIHBvcnRXaXJlTGVuZ3RoOiBwb3J0V2lyZUxlbmd0aCxcbiAgICAgICAgd2lkdGg6IHBvcnRzQW5kU2l6ZXMud2lkdGgsXG4gICAgICAgIGhlaWdodDogcG9ydHNBbmRTaXplcy5oZWlnaHQsXG4gICAgICAgIHBvcnRzOiBwb3J0c0FuZFNpemVzLnBvcnRzLFxuICAgICAgICBib3hIZWlnaHQ6IHBvcnRzQW5kU2l6ZXMuaGVpZ2h0IC0gMiAqIHBvcnRXaXJlTGVuZ3RoLFxuICAgICAgICBib3hXaWR0aDogcG9ydHNBbmRTaXplcy53aWR0aCAtIDIgKiBwb3J0V2lyZUxlbmd0aFxuICAgICAgfTtcblxuLy8gICAgICBkZWJ1Z2dlcjtcblxuICAgICAgcmV0dXJuIHN5bWJvbDtcblxuICAgIH07XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuXG4gICAgICBwb3J0Q291bnQgPSBNYXRoLm1heChcbiAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG1heFBvcnRzKSxcbiAgICAgIG1pblBvcnRzXG4gICAgICApO1xuXG4gICAgICBzeW1ib2wgPSBtYWtlQVJhbmRvbVN5bWJvbChpLCBwb3J0Q291bnQpO1xuXG4gICAgICBzeW1ib2xNYW5hZ2VyUHJvdmlkZXIucmVnaXN0ZXJTeW1ib2woc3ltYm9sKTtcblxuICAgIH1cblxuICB9O1xuXG4gIHJhbmRvbVN5bWJvbEdlbmVyYXRvcihraW5kcyk7XG5cbn1dKVxuLnNlcnZpY2UoJ2RpYWdyYW1TZXJ2aWNlJywgW1xuICAnJHEnLFxuICAnJHRpbWVvdXQnLFxuICAnc3ltYm9sTWFuYWdlcicsXG4gICd3aXJpbmdTZXJ2aWNlJyxcbiAgZnVuY3Rpb24gKCRxLCAkdGltZW91dCwgc3ltYm9sTWFuYWdlciwgd2lyaW5nU2VydmljZSkge1xuXG4gICAgdmFyXG4gICAgc2VsZiA9IHRoaXMsXG4gICAgY29tcG9uZW50cyA9IFtdLFxuICAgIGNvbXBvbmVudHNCeUlkID0ge30sXG5cbiAgICB3aXJlcyA9IFtdLFxuICAgIHdpcmVzQnlJZCA9IHt9LFxuICAgIHdpcmVzQnlDb21wb25lbnRJZCA9IHt9LFxuXG4gICAgc3ltYm9sVHlwZXMsXG5cbiAgICByZWdpc3RlcldpcmVGb3JFbmRzLFxuXG4gICAgRGlhZ3JhbUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9EaWFncmFtQ29tcG9uZW50LmpzJyksXG4gICAgQ29tcG9uZW50UG9ydCA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9Db21wb25lbnRQb3J0JyksXG4gICAgV2lyZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9XaXJlLmpzJyk7XG5cbiAgICBzeW1ib2xUeXBlcyA9IHN5bWJvbE1hbmFnZXIuZ2V0QXZhaWxhYmxlU3ltYm9scygpO1xuXG4gICAgdGhpcy5nZW5lcmF0ZUR1bW15RGlhZ3JhbSA9IGZ1bmN0aW9uIChjb3VudE9mQm94ZXMsIGNvdW50T2ZXaXJlcywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xuXG4gICAgICB2YXIgaSwgaWQsXG4gICAgICBjb3VudE9mVHlwZXMsXG4gICAgICBzeW1ib2wsXG4gICAgICB0eXBlSWQsXG4gICAgICB0eXBlLFxuICAgICAgeCxcbiAgICAgIHksXG4gICAgICBzeW1ib2xUeXBlSWRzLFxuICAgICAgY29tcG9uZW50MSxcbiAgICAgIGNvbXBvbmVudDIsXG4gICAgICBwb3J0MSxcbiAgICAgIHBvcnQyLFxuICAgICAgY3JlYXRlZFBvcnRzLFxuICAgICAgbmV3RGlhZ3JhbUNvbXBvbmVudCxcblxuICAgICAgcG9ydENyZWF0b3IsXG5cbiAgICAgIHdpcmU7XG5cbiAgICAgIHBvcnRDcmVhdG9yID0gZnVuY3Rpb24oY29tcG9uZW50SWQsIHBvcnRzKSB7XG5cbiAgICAgICAgdmFyIHBvcnRJbnN0YW5jZSxcbiAgICAgICAgICBwb3J0SW5zdGFuY2VzLFxuICAgICAgICAgIHBvcnRNYXBwaW5nO1xuXG4gICAgICAgIHBvcnRJbnN0YW5jZXMgPSBbXTtcbiAgICAgICAgcG9ydE1hcHBpbmcgPSB7fTtcblxuICAgICAgICBhbmd1bGFyLmZvckVhY2gocG9ydHMsIGZ1bmN0aW9uKHBvcnQpIHtcblxuICAgICAgICAgIHBvcnRJbnN0YW5jZSA9IG5ldyBDb21wb25lbnRQb3J0KHtcbiAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCArICdfJyArIHBvcnQuaWQsXG4gICAgICAgICAgICBwb3J0U3ltYm9sOiBwb3J0XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBwb3J0SW5zdGFuY2VzLnB1c2gocG9ydEluc3RhbmNlKTtcblxuICAgICAgICAgIHBvcnRNYXBwaW5nW3BvcnQuaWRdID0gcG9ydEluc3RhbmNlLmlkO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHBvcnRJbnN0YW5jZXM6IHBvcnRJbnN0YW5jZXMsXG4gICAgICAgICAgcG9ydE1hcHBpbmc6IHBvcnRNYXBwaW5nXG4gICAgICAgIH07XG5cbiAgICAgIH07XG5cbiAgICAgIHN5bWJvbFR5cGVJZHMgPSBPYmplY3Qua2V5cyhzeW1ib2xUeXBlcyk7XG5cbiAgICAgIGNvdW50T2ZUeXBlcyA9IHN5bWJvbFR5cGVJZHMubGVuZ3RoO1xuXG4gICAgICBjb21wb25lbnRzID0gW107XG4gICAgICBjb21wb25lbnRzQnlJZCA9IHt9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnRPZkJveGVzOyBpKyspIHtcblxuICAgICAgICB0eXBlSWQgPSBzeW1ib2xUeXBlSWRzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvdW50T2ZUeXBlcyldO1xuICAgICAgICB0eXBlID0gc3ltYm9sVHlwZXNbdHlwZUlkXTtcblxuICAgICAgICB4ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKGNhbnZhc1dpZHRoIC0gMSkpO1xuICAgICAgICB5ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKGNhbnZhc0hlaWdodCAtIDEpKTtcblxuICAgICAgICBpZCA9ICdjb21wb25lbnRfJyArIHR5cGVJZCArICdfJyArIGk7XG5cbiAgICAgICAgc3ltYm9sID0gc3ltYm9sTWFuYWdlci5nZXRTeW1ib2wodHlwZUlkKTtcblxuICAgICAgICBjcmVhdGVkUG9ydHMgPSBwb3J0Q3JlYXRvcihpZCwgc3ltYm9sLnBvcnRzKTtcblxuICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50ID0gbmV3IERpYWdyYW1Db21wb25lbnQoe1xuICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICBsYWJlbDogdHlwZS5sYWJlbFByZWZpeCArIGksXG4gICAgICAgICAgeDogeCxcbiAgICAgICAgICB5OiB5LFxuICAgICAgICAgIHo6IGksXG4gICAgICAgICAgcm90YXRpb246IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQwKSAqIDkwLFxuICAgICAgICAgIHNjYWxlWDogMSwgLy9bMSwgLTFdW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSldLFxuICAgICAgICAgIHNjYWxlWTogMSwgLy9bMSwgLTFdW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSldLFxuICAgICAgICAgIHN5bWJvbDogc3ltYm9sLFxuICAgICAgICAgIG5vblNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgIGxvY2F0aW9uTG9ja2VkOiBmYWxzZSxcbiAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcblxuLy8gICAgICAgICAgc3ltYm9sQ29uZmlnOiB7XG4vLyAgICAgICAgICAgIHg6ICd4Jyxcbi8vICAgICAgICAgICAgeTogJ3knLFxuLy8gICAgICAgICAgICBsYWJlbDogJ2xhYmVsJyxcbi8vICAgICAgICAgICAgcm90YXRpb246ICdyb3RhdGlvbicsXG4vLyAgICAgICAgICAgIHNjYWxlWDogJ3NjYWxlWCcsXG4vLyAgICAgICAgICAgIHNjYWxlWTogJ3NjYWxlWScsXG4vLyAgICAgICAgICAgIHBvcnRzOiAncG9ydEluc3RhbmNlcycsXG4vLyAgICAgICAgICAgIHBvcnRNYXBwaW5nOiBjcmVhdGVkUG9ydHMucG9ydE1hcHBpbmdcbi8vICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIG5ld0RpYWdyYW1Db21wb25lbnQucmVnaXN0ZXJQb3J0SW5zdGFuY2VzKGNyZWF0ZWRQb3J0cy5wb3J0SW5zdGFuY2VzKTtcblxuICAgICAgICBuZXdEaWFncmFtQ29tcG9uZW50LnVwZGF0ZVRyYW5zZm9ybWF0aW9uTWF0cml4KCk7XG5cbiAgICAgICAgc2VsZi5hZGRDb21wb25lbnQobmV3RGlhZ3JhbUNvbXBvbmVudCk7XG5cbiAgICAgIH1cblxuICAgICAgd2lyZXMgPSBbXTtcbiAgICAgIHdpcmVzQnlJZCA9IHt9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnRPZldpcmVzOyBpKyspIHtcblxuICAgICAgICBpZCA9ICd3aXJlXycgKyBpO1xuXG4gICAgICAgIGNvbXBvbmVudDEgPSBjb21wb25lbnRzLmdldFJhbmRvbUVsZW1lbnQoKTtcblxuICAgICAgICBwb3J0MSA9IGNvbXBvbmVudDEucG9ydEluc3RhbmNlcy5nZXRSYW5kb21FbGVtZW50KCk7XG4gICAgICAgIHBvcnQyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHdoaWxlICghYW5ndWxhci5pc0RlZmluZWQocG9ydDIpIHx8IHBvcnQxID09PSBwb3J0Mikge1xuXG4gICAgICAgICAgY29tcG9uZW50MiA9IGNvbXBvbmVudHMuZ2V0UmFuZG9tRWxlbWVudCgpO1xuICAgICAgICAgIHBvcnQyID0gY29tcG9uZW50Mi5wb3J0SW5zdGFuY2VzLmdldFJhbmRvbUVsZW1lbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpcmUgPSBuZXcgV2lyZSh7XG4gICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgIGVuZDE6IHtcbiAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50MSxcbiAgICAgICAgICAgIHBvcnQ6IHBvcnQxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBlbmQyOiB7XG4gICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudDIsXG4gICAgICAgICAgICBwb3J0OiBwb3J0MlxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2lyaW5nU2VydmljZS5yb3V0ZVdpcmUod2lyZSwgJ0VsYm93Um91dGVyJyk7XG5cbiAgICAgICAgc2VsZi5hZGRXaXJlKHdpcmUpO1xuXG4gICAgICB9XG5cbiAgICB9O1xuXG4gICAgdGhpcy5hZGRDb21wb25lbnQgPSBmdW5jdGlvbiAoYURpYWdyYW1Db21wb25lbnQpIHtcblxuICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoYURpYWdyYW1Db21wb25lbnQpICYmICFhbmd1bGFyLmlzRGVmaW5lZChjb21wb25lbnRzQnlJZFsgYURpYWdyYW1Db21wb25lbnQuaWQgXSkpIHtcblxuICAgICAgICBjb21wb25lbnRzQnlJZFsgYURpYWdyYW1Db21wb25lbnQuaWQgXSA9IGFEaWFncmFtQ29tcG9uZW50O1xuICAgICAgICBjb21wb25lbnRzLnB1c2goYURpYWdyYW1Db21wb25lbnQpO1xuXG4gICAgICB9XG5cbiAgICB9O1xuXG4gICAgcmVnaXN0ZXJXaXJlRm9yRW5kcyA9IGZ1bmN0aW9uKHdpcmUpIHtcblxuICAgICAgdmFyIGNvbXBvbmVudElkO1xuXG4gICAgICBjb21wb25lbnRJZCA9IHdpcmUuZW5kMS5jb21wb25lbnQuaWQ7XG5cbiAgICAgIHdpcmVzQnlDb21wb25lbnRJZFsgY29tcG9uZW50SWQgXSA9IHdpcmVzQnlDb21wb25lbnRJZFsgY29tcG9uZW50SWQgXSB8fCBbXTtcblxuICAgICAgaWYgKHdpcmVzQnlDb21wb25lbnRJZFsgY29tcG9uZW50SWQgXS5pbmRleE9mKHdpcmUpID09PSAtMSkge1xuICAgICAgICB3aXJlc0J5Q29tcG9uZW50SWRbIGNvbXBvbmVudElkIF0ucHVzaCh3aXJlKTtcbiAgICAgIH1cblxuICAgICAgY29tcG9uZW50SWQgPSB3aXJlLmVuZDIuY29tcG9uZW50LmlkO1xuXG4gICAgICB3aXJlc0J5Q29tcG9uZW50SWRbIGNvbXBvbmVudElkIF0gPSB3aXJlc0J5Q29tcG9uZW50SWRbIGNvbXBvbmVudElkIF0gfHwgW107XG5cbiAgICAgIGlmICh3aXJlc0J5Q29tcG9uZW50SWRbIGNvbXBvbmVudElkIF0uaW5kZXhPZih3aXJlKSA9PT0gLTEpIHtcbiAgICAgICAgd2lyZXNCeUNvbXBvbmVudElkWyBjb21wb25lbnRJZCBdLnB1c2god2lyZSk7XG4gICAgICB9XG5cbiAgICB9O1xuICAgIFxuICAgIHRoaXMuYWRkV2lyZSA9IGZ1bmN0aW9uKGFXaXJlKSB7XG4gICAgICBcbiAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGFXaXJlKSAmJiAhYW5ndWxhci5pc0RlZmluZWQod2lyZXNCeUlkWyBhV2lyZS5pZCBdKSkge1xuXG4gICAgICAgIHdpcmVzQnlJZFsgYVdpcmUuaWQgXSA9IGFXaXJlO1xuICAgICAgICB3aXJlcy5wdXNoKGFXaXJlKTtcblxuICAgICAgICByZWdpc3RlcldpcmVGb3JFbmRzKGFXaXJlKTtcblxuICAgICAgfVxuXG4gICAgfTtcblxuICAgIHRoaXMuZ2V0V2lyZXNGb3JDb21wb25lbnRzID0gZnVuY3Rpb24oY29tcG9uZW50cykge1xuXG4gICAgICB2YXIgc2V0T2ZXaXJlcyA9IFtdO1xuXG4gICAgICBhbmd1bGFyLmZvckVhY2goY29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG5cbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHdpcmVzQnlDb21wb25lbnRJZFtjb21wb25lbnQuaWRdLCBmdW5jdGlvbih3aXJlKSB7XG5cbiAgICAgICAgICBpZiAoc2V0T2ZXaXJlcy5pbmRleE9mKHdpcmUpID09PSAtMSkge1xuICAgICAgICAgICAgc2V0T2ZXaXJlcy5wdXNoKHdpcmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2V0T2ZXaXJlcztcblxuICAgIH07XG5cbiAgICB0aGlzLmdldERpYWdyYW0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBvbmVudHM6IGNvbXBvbmVudHNCeUlkLFxuICAgICAgICB3aXJlczogd2lyZXNCeUlkLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgICBkaXNhbGxvd1NlbGVjdGlvbjogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgIH07XG5cbiAgICB0aGlzLmdldEhpZ2hlc3RaID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBpLFxuICAgICAgICBjb21wb25lbnQsXG4gICAgICAgIHo7XG5cbiAgICAgIGZvciAoaT0wOyBpPGNvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBjb21wb25lbnQgPSBjb21wb25lbnRzW2ldO1xuXG4gICAgICAgIGlmICghaXNOYU4oY29tcG9uZW50LnopKSB7XG5cbiAgICAgICAgICBpZiAoaXNOYU4oeikpIHtcbiAgICAgICAgICAgIHogPSBjb21wb25lbnQuejtcbiAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoeiA8IGNvbXBvbmVudC56KSB7XG4gICAgICAgICAgICAgIHogPSBjb21wb25lbnQuejtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpc05hTih6KSkge1xuICAgICAgICB6ID0gLTE7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB6O1xuXG4gICAgfTtcblxuICAgIC8vdGhpcy5nZW5lcmF0ZUR1bW15RGlhZ3JhbSgyMDAwLCA1MDAsIDEwMDAwLCAxMDAwMCk7XG4gICAgLy90aGlzLmdlbmVyYXRlRHVtbXlEaWFncmFtKDEwMDAsIDIwMDAsIDEwMDAwLCAxMDAwMCk7XG4gICAgdGhpcy5nZW5lcmF0ZUR1bW15RGlhZ3JhbSgxMCwgMiwgMTIwMCwgMTIwMCk7XG5cbiAgfVxuXSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBncmlkU2VydmljZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcbidtbXMuZGVzaWduVmlzdWFsaXphdGlvbi5ncmlkU2VydmljZScsXG5bXSk7XG5cbmdyaWRTZXJ2aWNlc01vZHVsZS5zZXJ2aWNlKCdncmlkU2VydmljZScsIFsgJyRsb2cnLCAnJHJvb3RTY29wZScsICckdGltZW91dCcsIGZ1bmN0aW9uICgkbG9nLCAkcm9vdFNjb3BlLCAkdGltZW91dCkge1xuXG4gIHZhciBzZWxmID0gdGhpcyxcblxuICBncmlkcyA9IHt9LFxuXG4gIG51bWJlck9mQ2hhbmdlc0FsbG93ZWRJbk9uZUN5Y2xlID0gMjAwMCxcbiAgcmVjYWxjdWxhdGVDeWNsZURlbGF5ID0gMTAsXG4gIHZpZXdQb3J0UGFkZGluZyA9IHt4OiAtMzAwLCB5OiAtMjAwfSxcblxuICByZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyxcbiAgcmVjYWxjdWxhdGVWaXNpYmxlV2lyZXM7XG5cbiAgcmVjYWxjdWxhdGVWaXNpYmxlV2lyZXMgPSBmdW5jdGlvbiAoZ3JpZCkge1xuXG4gICAgdmFyIGluZGV4O1xuXG4gICAgYW5ndWxhci5mb3JFYWNoKGdyaWQud2lyZXMsIGZ1bmN0aW9uKHdpcmUpIHtcblxuICAgICAgaW5kZXggPSBncmlkLnZpc2libGVXaXJlcy5pbmRleE9mKHdpcmUpO1xuXG5cbiAgICAgIGlmICh3aXJlLmlzSW5WaWV3UG9ydChncmlkLnZpZXdQb3J0LCB2aWV3UG9ydFBhZGRpbmcpKSB7XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgIGdyaWQudmlzaWJsZVdpcmVzLnB1c2god2lyZSk7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIGdyaWQudmlzaWJsZVdpcmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICAkbG9nLmRlYnVnKCdOdW1iZXIgb2YgdmlzaWJsZSB3aXJlczogJyArIGdyaWQudmlzaWJsZVdpcmVzLmxlbmd0aCk7XG5cbiAgfTtcblxuICByZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyA9IGZ1bmN0aW9uIChncmlkKSB7XG5cbiAgICB2YXIgaSxcbiAgICAgIGNvbXBvbmVudCxcbiAgICAgIGNvdW50T2ZDaGFuZ2VzID0gMCxcbiAgICAgIGNoYW5nZXNMaW1pdFJlYWNoZWQgPSBmYWxzZSxcbiAgICAgIGluZGV4O1xuXG4gICAgZ3JpZC5pbnZpc2libGVEaWFncmFtQ29tcG9uZW50c1JlY2FsY3VsYXRlID0gdHJ1ZTtcblxuXG4gICAgZm9yIChpPTA7IGkgPCBncmlkLmNvbXBvbmVudHMubGVuZ3RoICYmICFjaGFuZ2VzTGltaXRSZWFjaGVkOyBpKyspIHtcbiAgICAgIGNvbXBvbmVudCA9IGdyaWQuY29tcG9uZW50c1tpXTtcbiAgICB9XG4gICAgYW5ndWxhci5mb3JFYWNoKGdyaWQuY29tcG9uZW50cywgZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuXG4gICAgICBpbmRleCA9IGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLmluZGV4T2YoY29tcG9uZW50KTtcblxuICAgICAgaWYgKGNvbXBvbmVudC5pc0luVmlld1BvcnQoZ3JpZC52aWV3UG9ydCwgdmlld1BvcnRQYWRkaW5nKSkge1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgICAgY291bnRPZkNoYW5nZXMrKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIGdyaWQudmlzaWJsZURpYWdyYW1Db21wb25lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgLy9jb3VudE9mQ2hhbmdlcysrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjb3VudE9mQ2hhbmdlcyA+PSBudW1iZXJPZkNoYW5nZXNBbGxvd2VkSW5PbmVDeWNsZSkge1xuICAgICAgICBjaGFuZ2VzTGltaXRSZWFjaGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgc2VsZi5yZW9yZGVyVmlzaWJsZUNvbXBvbmVudHMoZ3JpZC5pZCk7XG5cbiAgICByZWNhbGN1bGF0ZVZpc2libGVXaXJlcyhncmlkKTtcblxuICAgICRsb2cuZGVidWcoJ051bWJlciBvZiBjaGFuZ2VzIGNvbXBhcmVkIHRvIHByZXZpb3VzIGRpYWdyYW0gc3RhdGU6JywgY291bnRPZkNoYW5nZXMpO1xuXG4gICAgaWYgKCFjaGFuZ2VzTGltaXRSZWFjaGVkKSB7XG4gICAgICBncmlkLmludmlzaWJsZURpYWdyYW1Db21wb25lbnRzUmVjYWxjdWxhdGUgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyhncmlkKTtcbiAgICAgIH0sIHJlY2FsY3VsYXRlQ3ljbGVEZWxheSk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5pbnZhbGlkYXRlVmlzaWJsZURpYWdyYW1Db21wb25lbnRzID0gZnVuY3Rpb24oZ3JpZElkKSB7XG5cbiAgICB2YXIgZ3JpZDtcblxuICAgIGdyaWQgPSBncmlkc1tncmlkSWRdO1xuXG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGdyaWQpKSB7XG5cbiAgICAgIGlmICghZ3JpZC5pbnZpc2libGVEaWFncmFtQ29tcG9uZW50c1JlY2FsY3VsYXRlKSB7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZWNhbGN1bGF0ZVZpc2libGVEaWFncmFtQ29tcG9uZW50cyhncmlkKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cblxuICB0aGlzLmNyZWF0ZUdyaWQgPSBmdW5jdGlvbiAoaWQsIGRpbWVuc2lvbnMsIGRpYWdyYW0pIHtcblxuICAgIHZhciBncmlkO1xuXG4gICAgaWYgKCFhbmd1bGFyLmlzRGVmaW5lZChncmlkc1tpZF0pKSB7XG4gICAgICBncmlkID0gZ3JpZHNbaWRdID0ge1xuICAgICAgICBpZDogaWQsXG4gICAgICAgIGRpbWVuc2lvbnM6IGRpbWVuc2lvbnMsXG4gICAgICAgIGNvbXBvbmVudHM6IGRpYWdyYW0uY29tcG9uZW50cyxcbiAgICAgICAgdmlzaWJsZURpYWdyYW1Db21wb25lbnRzOiBbXSxcbiAgICAgICAgd2lyZXM6IGRpYWdyYW0ud2lyZXMsXG4gICAgICAgIHZpc2libGVXaXJlczogW10sXG4gICAgICAgIHZpZXdQb3J0OiB7fSxcbiAgICAgICAgaW52aXNpYmxlRGlhZ3JhbUNvbXBvbmVudHNSZWNhbGN1bGF0ZTogZmFsc2VcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93KCdHcmlkIHdhcyBhbHJlYWR5IGRlZmluZWQhJywgaWQpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjb21wb25lbnRzOiBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cyxcbiAgICAgIHdpcmVzOiBncmlkLnZpc2libGVXaXJlc1xuICAgIH07XG4gIH07XG5cblxuICB0aGlzLnNldFZpc2libGVBcmVhID0gZnVuY3Rpb24gKGdyaWRJZCwgdmlld1BvcnQpIHtcbiAgICB2YXIgZ3JpZCA9IGdyaWRzW2dyaWRJZF07XG5cbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoZ3JpZCkpIHtcblxuICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHZpZXdQb3J0KSkge1xuXG4gICAgICAgIGdyaWQudmlld1BvcnQgPSB2aWV3UG9ydDtcblxuICAgICAgICBzZWxmLmludmFsaWRhdGVWaXNpYmxlRGlhZ3JhbUNvbXBvbmVudHMoZ3JpZC5pZCk7XG5cbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdygnR3JpZCB3YXMgbm90IGRlZmluZWQhJywgZ3JpZElkKTtcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLnJlb3JkZXJWaXNpYmxlQ29tcG9uZW50cyA9IGZ1bmN0aW9uKGdyaWRJZCkge1xuXG4gICAgdmFyIGdyaWQgPSBncmlkc1tncmlkSWRdO1xuXG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGdyaWQpKSB7XG4gICAgICBncmlkLnZpc2libGVEaWFncmFtQ29tcG9uZW50cy5zb3J0KGZ1bmN0aW9uKGEsYikge1xuXG4gICAgICAgIGlmIChhLnogPiBiLnopIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhLnogPCBiLnopIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gMDtcblxuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbn1dKTtcblxuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzeW1ib2xTZXJ2aWNlc01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFxuJ21tcy5kZXNpZ25WaXN1YWxpemF0aW9uLnN5bWJvbFNlcnZpY2VzJyxcbltdKTtcblxuc3ltYm9sU2VydmljZXNNb2R1bGUucHJvdmlkZXIoJ3N5bWJvbE1hbmFnZXInLCBmdW5jdGlvbiBTeW1ib2xNYW5hZ2VyUHJvdmlkZXIoKSB7XG4gIHZhciBhdmFpbGFibGVTeW1ib2xzID0ge307XG5cbiAgdGhpcy5yZWdpc3RlclN5bWJvbCA9IGZ1bmN0aW9uIChzeW1ib2xEZXNjcmlwdG9yKSB7XG5cbiAgICBpZiAoYW5ndWxhci5pc09iamVjdChzeW1ib2xEZXNjcmlwdG9yKSAmJlxuICAgIGFuZ3VsYXIuaXNTdHJpbmcoc3ltYm9sRGVzY3JpcHRvci50eXBlKSkge1xuICAgICAgYXZhaWxhYmxlU3ltYm9sc1tzeW1ib2xEZXNjcmlwdG9yLnR5cGVdID0gc3ltYm9sRGVzY3JpcHRvcjtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy4kZ2V0ID0gWyBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgU3ltYm9sTWFuYWdlcjtcblxuICAgIFN5bWJvbE1hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuZ2V0QXZhaWxhYmxlU3ltYm9scyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGF2YWlsYWJsZVN5bWJvbHM7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmdldFN5bWJvbCA9IGZ1bmN0aW9uKHN5bWJvbFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIGF2YWlsYWJsZVN5bWJvbHNbc3ltYm9sVHlwZV07XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmdldFN5bWJvbEVsZW1lbnRGb3JUeXBlID0gZnVuY3Rpb24gKHN5bWJvbFR5cGUpIHtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gYXZhaWxhYmxlU3ltYm9sc1sgc3ltYm9sVHlwZSBdICYmIGF2YWlsYWJsZVN5bWJvbHNbIHN5bWJvbFR5cGUgXS5kaXJlY3RpdmU7XG5cbiAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSAncmVzaXN0b3InO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgU3ltYm9sTWFuYWdlcigpO1xuXG4gIH1dO1xufSk7XG5cbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgRWxib3dSb3V0ZXIgPSBmdW5jdGlvbigpIHtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdGhpcy5uYW1lID0gJ0VsYm93Um91dGVyJztcblxuICB0aGlzLm1ha2VTZWdtZW50cyA9IGZ1bmN0aW9uKHBvaW50cywgbWV0aG9kKSB7XG5cbiAgICB2YXIgaSxcbiAgICBwb2ludDEsIGVsYm93LCBwb2ludDIsXG4gICAgc2VnbWVudHM7XG5cbiAgICBtZXRob2QgPSBtZXRob2QgfHwgJ3ZlcnRpY2FsRmlyc3QnO1xuXG4gICAgaWYgKGFuZ3VsYXIuaXNBcnJheShwb2ludHMpICYmIHBvaW50cy5sZW5ndGggPj0gMikge1xuXG4gICAgICBzZWdtZW50cyA9IFtdO1xuXG4gICAgICBmb3IgKGk9MDsgaTxwb2ludHMubGVuZ3RoLTE7IGkrKykge1xuXG4gICAgICAgIHBvaW50MSA9IHBvaW50c1tpXTtcbiAgICAgICAgcG9pbnQyID0gcG9pbnRzW2krMV07XG5cbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gJ3ZlcnRpY2FsRmlyc3QnKSB7XG5cbiAgICAgICAgICBlbGJvdyA9IHtcbiAgICAgICAgICAgIHg6IHBvaW50MS54LFxuICAgICAgICAgICAgeTogcG9pbnQyLnlcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICBlbGJvdyA9IHtcbiAgICAgICAgICAgIHg6IHBvaW50MS55LFxuICAgICAgICAgICAgeTogcG9pbnQyLnhcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH1cblxuICAgICAgICBzZWdtZW50cy5wdXNoKHtcblxuICAgICAgICAgIHR5cGU6ICdsaW5lJyxcblxuICAgICAgICAgIHgxOiBwb2ludDEueCxcbiAgICAgICAgICB5MTogcG9pbnQxLnksXG5cbiAgICAgICAgICB4MjogZWxib3cueCxcbiAgICAgICAgICB5MjogZWxib3cueSxcblxuICAgICAgICAgIHJvdXRlcjogc2VsZi5uYW1lLFxuICAgICAgICAgIG9yaWVudGF0aW9uOiAobWV0aG9kID09PSAndmVydGljYWxGaXJzdCcpID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJ1xuXG4gICAgICAgIH0se1xuXG4gICAgICAgICAgdHlwZTogJ2xpbmUnLFxuXG4gICAgICAgICAgeDE6IGVsYm93LngsXG4gICAgICAgICAgeTE6IGVsYm93LnksXG5cbiAgICAgICAgICB4MjogcG9pbnQyLngsXG4gICAgICAgICAgeTI6IHBvaW50Mi55LFxuXG4gICAgICAgICAgcm91dGVyOiBzZWxmLm5hbWUsXG4gICAgICAgICAgb3JpZW50YXRpb246IChtZXRob2QgPT09ICd2ZXJ0aWNhbEZpcnN0JykgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH1cblxuICAgIH1cblxuICAgIHJldHVybiBzZWdtZW50cztcblxuICB9O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsYm93Um91dGVyOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUm91dGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgdGhpcy5tYWtlU2VnbWVudHMgPSBmdW5jdGlvbihwb2ludHMpIHtcblxuICAgIHZhciBpLFxuICAgICAgcG9pbnQxLCBwb2ludDIsXG4gICAgICBzZWdtZW50cztcblxuICAgIGlmIChhbmd1bGFyLmlzQXJyYXkocG9pbnRzKSAmJiBwb2ludHMubGVuZ3RoID49IDIpIHtcblxuICAgICAgc2VnbWVudHMgPSBbXTtcblxuICAgICAgZm9yIChpPTA7IGk8cG9pbnRzLmxlbmd0aC0xOyBpKyspIHtcblxuICAgICAgICBwb2ludDEgPSBwb2ludHNbaV07XG4gICAgICAgIHBvaW50MiA9IHBvaW50c1tpKzFdO1xuXG4gICAgICAgIHNlZ21lbnRzLnB1c2goe1xuXG4gICAgICAgICAgdHlwZTogJ2xpbmUnLFxuXG4gICAgICAgICAgeDE6IHBvaW50MS54LFxuICAgICAgICAgIHkxOiBwb2ludDEueSxcblxuICAgICAgICAgIHgyOiBwb2ludDIueCxcbiAgICAgICAgICB5MjogcG9pbnQyLnlcblxuICAgICAgICB9KTtcblxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgcmV0dXJuIHNlZ21lbnRzO1xuXG4gIH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlUm91dGVyOyIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgd2lyaW5nU2VydmljZXNNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcbidtbXMuZGVzaWduVmlzdWFsaXphdGlvbi53aXJpbmdTZXJ2aWNlJyxcbltdKTtcblxud2lyaW5nU2VydmljZXNNb2R1bGUuc2VydmljZSgnd2lyaW5nU2VydmljZScsIFsgJyRsb2cnLCAnJHJvb3RTY29wZScsICckdGltZW91dCcsIGZ1bmN0aW9uICgpIHtcblxuICB2YXIgc2VsZiA9IHRoaXMsXG4gIFNpbXBsZVJvdXRlciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9TaW1wbGVSb3V0ZXIuanMnKSxcbiAgRWxib3dSb3V0ZXIgPSByZXF1aXJlKCcuL2NsYXNzZXMvRWxib3dSb3V0ZXIuanMnKSxcbiAgcm91dGVycyA9IHtcblxuICAgIFNpbXBsZVJvdXRlcjogbmV3IFNpbXBsZVJvdXRlcigpLFxuICAgIEVsYm93Um91dGVyOiBuZXcgRWxib3dSb3V0ZXIoKVxuXG4gIH07XG5cbiAgdGhpcy5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMgPSBmdW5jdGlvbiAoZW5kUG9zaXRpb25zLCByb3V0ZXJUeXBlKSB7XG5cbiAgICB2YXIgc2VnbWVudHMsXG4gICAgcm91dGVyO1xuXG4gICAgcm91dGVyID0gcm91dGVyc1tyb3V0ZXJUeXBlXTtcblxuICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHJvdXRlcikgJiYgYW5ndWxhci5pc0Z1bmN0aW9uKHJvdXRlci5tYWtlU2VnbWVudHMpKSB7XG4gICAgICBzZWdtZW50cyA9IHJvdXRlci5tYWtlU2VnbWVudHMoXG4gICAgICBbIGVuZFBvc2l0aW9ucy5lbmQxLCBlbmRQb3NpdGlvbnMuZW5kMiBdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VnbWVudHM7XG5cbiAgfTtcblxuICB0aGlzLnJvdXRlV2lyZSA9IGZ1bmN0aW9uICh3aXJlLCByb3V0ZXJUeXBlKSB7XG5cbiAgICB2YXIgcm91dGVyLCBlbmRQb3NpdGlvbnM7XG5cbiAgICByb3V0ZXJUeXBlID0gcm91dGVyVHlwZSB8fCAnRWxib3dSb3V0ZXInO1xuXG4gICAgcm91dGVyID0gcm91dGVyc1tyb3V0ZXJUeXBlXTtcblxuICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHJvdXRlcikgJiYgYW5ndWxhci5pc0Z1bmN0aW9uKHJvdXRlci5tYWtlU2VnbWVudHMpKSB7XG5cbiAgICAgIGVuZFBvc2l0aW9ucyA9IHdpcmUuZ2V0RW5kUG9zaXRpb25zKCk7XG5cbiAgICAgIHdpcmUuc2VnbWVudHMgPSByb3V0ZXIubWFrZVNlZ21lbnRzKFxuICAgICAgWyBlbmRQb3NpdGlvbnMuZW5kMSwgZW5kUG9zaXRpb25zLmVuZDIgXSk7XG5cbiAgICAgIHdpcmUucm91dGVyVHlwZSA9IHJvdXRlclR5cGU7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5hZGp1c3RXaXJlRW5kU2VnbWVudHMgPSBmdW5jdGlvbiAod2lyZSkge1xuXG4gICAgdmFyIGZpcnN0U2VnbWVudCxcbiAgICBzZWNvbmRTZWdtZW50LFxuICAgIHNlY29uZFRvTGFzdFNlZ21lbnQsXG4gICAgbGFzdFNlZ21lbnQsXG4gICAgZW5kUG9zaXRpb25zLFxuICAgIG5ld1NlZ21lbnRzLFxuICAgIHBvcztcblxuICAgIGVuZFBvc2l0aW9ucyA9IHdpcmUuZ2V0RW5kUG9zaXRpb25zKCk7XG5cbiAgICBpZiAoYW5ndWxhci5pc0FycmF5KHdpcmUuc2VnbWVudHMpICYmIHdpcmUuc2VnbWVudHMubGVuZ3RoID4gMSkge1xuXG4gICAgICBmaXJzdFNlZ21lbnQgPSB3aXJlLnNlZ21lbnRzWzBdO1xuXG4gICAgICBpZiAoZmlyc3RTZWdtZW50LngxICE9PSBlbmRQb3NpdGlvbnMuZW5kMS54IHx8IGZpcnN0U2VnbWVudC55MSAhPT0gZW5kUG9zaXRpb25zLmVuZDEueSkge1xuXG4gICAgICAgIGlmIChmaXJzdFNlZ21lbnQucm91dGVyID09PSAnRWxib3dSb3V0ZXInKSB7XG5cbiAgICAgICAgICBzZWNvbmRTZWdtZW50ID0gd2lyZS5zZWdtZW50c1sxXTtcblxuICAgICAgICAgIHBvcyA9IHtcbiAgICAgICAgICAgIHg6IHNlY29uZFNlZ21lbnQueDIsXG4gICAgICAgICAgICB5OiBzZWNvbmRTZWdtZW50LnkyXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHdpcmUuc2VnbWVudHMuc3BsaWNlKDAsMik7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwb3MgPSB7XG4gICAgICAgICAgICB4OiBmaXJzdFNlZ21lbnQueDIsXG4gICAgICAgICAgICB5OiBmaXJzdFNlZ21lbnQueTJcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgd2lyZS5zZWdtZW50cy5zcGxpY2UoMCwxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ld1NlZ21lbnRzID0gc2VsZi5nZXRTZWdtZW50c0JldHdlZW5Qb3NpdGlvbnMoXG4gICAgICAgIHtcbiAgICAgICAgICBlbmQxOiBlbmRQb3NpdGlvbnMuZW5kMSxcbiAgICAgICAgICBlbmQyOiBwb3NcbiAgICAgICAgfSxmaXJzdFNlZ21lbnQucm91dGVyKTtcblxuICAgICAgICB3aXJlLnNlZ21lbnRzID0gbmV3U2VnbWVudHMuY29uY2F0KHdpcmUuc2VnbWVudHMpO1xuXG4gICAgICB9XG5cbiAgICAgIGxhc3RTZWdtZW50ID0gd2lyZS5zZWdtZW50c1t3aXJlLnNlZ21lbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgICBpZiAobGFzdFNlZ21lbnQueDIgIT09IGVuZFBvc2l0aW9ucy5lbmQyLnggfHwgbGFzdFNlZ21lbnQueTIgIT09IGVuZFBvc2l0aW9ucy5lbmQyLnkpIHtcblxuICAgICAgICBpZiAobGFzdFNlZ21lbnQucm91dGVyID09PSAnRWxib3dSb3V0ZXInKSB7XG5cbiAgICAgICAgICBzZWNvbmRUb0xhc3RTZWdtZW50ID0gd2lyZS5zZWdtZW50c1t3aXJlLnNlZ21lbnRzLmxlbmd0aCAtIDJdO1xuXG4gICAgICAgICAgcG9zID0ge1xuICAgICAgICAgICAgeDogc2Vjb25kVG9MYXN0U2VnbWVudC54MSxcbiAgICAgICAgICAgIHk6IHNlY29uZFRvTGFzdFNlZ21lbnQueTFcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgd2lyZS5zZWdtZW50cy5zcGxpY2Uod2lyZS5zZWdtZW50cy5sZW5ndGggLSAyLCAyKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBvcyA9IHtcbiAgICAgICAgICAgIHg6IGxhc3RTZWdtZW50LngxLFxuICAgICAgICAgICAgeTogbGFzdFNlZ21lbnQueTFcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgd2lyZS5zZWdtZW50cy5zcGxpY2Uod2lyZS5zZWdtZW50cy5sZW5ndGggLSAxLDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3U2VnbWVudHMgPSBzZWxmLmdldFNlZ21lbnRzQmV0d2VlblBvc2l0aW9ucyhcbiAgICAgICAge1xuICAgICAgICAgIGVuZDE6IHBvcyxcbiAgICAgICAgICBlbmQyOiBlbmRQb3NpdGlvbnMuZW5kMlxuICAgICAgICB9LGxhc3RTZWdtZW50LnJvdXRlcik7XG5cbiAgICAgICAgd2lyZS5zZWdtZW50cyA9IHdpcmUuc2VnbWVudHMuY29uY2F0KG5ld1NlZ21lbnRzKTtcblxuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYucm91dGVXaXJlKHdpcmUpO1xuICAgIH1cblxuICB9O1xuXG59XSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnQXJyYXkucHJvdG90eXBlLmZpbmQnKTtcblxuaWYgKCFBcnJheS5wcm90b3R5cGUuZmluZEJ5SWQpIHtcbiAgQXJyYXkucHJvdG90eXBlLmZpbmRCeUlkID0gZnVuY3Rpb24oaWQpIHtcbiAgICByZXR1cm4gdGhpcy5maW5kKGZ1bmN0aW9uKGEpIHtcbiAgICAgIHJldHVybiBhLmlkICE9PSB1bmRlZmluZWQgJiYgYS5pZCA9PT0gaWQ7XG4gICAgfSk7XG4gIH07XG59XG5cbmlmICghQXJyYXkucHJvdG90eXBlLmdldFJhbmRvbUVsZW1lbnQpIHtcbiAgQXJyYXkucHJvdG90eXBlLmdldFJhbmRvbUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpc1sgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKHRoaXMubGVuZ3RoIC0xICkpXTtcbiAgfTtcbn1cblxuaWYgKCFBcnJheS5wcm90b3R5cGUuc2h1ZmZsZSkge1xuICBBcnJheS5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjdXJyZW50SW5kZXggPSB0aGlzLmxlbmd0aCwgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4IDtcblxuICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXG4gICAgd2hpbGUgKDAgIT09IGN1cnJlbnRJbmRleCkge1xuXG4gICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cbiAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcbiAgICAgIGN1cnJlbnRJbmRleCAtPSAxO1xuXG4gICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gICAgICB0ZW1wb3JhcnlWYWx1ZSA9IHRoaXNbY3VycmVudEluZGV4XTtcbiAgICAgIHRoaXNbY3VycmVudEluZGV4XSA9IHRoaXNbcmFuZG9tSW5kZXhdO1xuICAgICAgdGhpc1tyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn0iXX0=
