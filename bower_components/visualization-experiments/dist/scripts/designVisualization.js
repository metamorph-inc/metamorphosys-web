(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console*/
'use strict';

require('./utils.js');

require('./services/diagramService/diagramService.js');
require('./services/gridService/gridService.js');
require('./services/wiringService/wiringService.js');

require('./directives/diagramContainer/diagramContainer.js');
require('./directives/fabricCanvas/fabricCanvas.js');
require('./directives/svgDiagram/svgDiagram.js');

require('./directives/symbols/componentSymbol.js');

var app = angular.module('mms.designVisualization', [
  'ui.bootstrap',
  'mms.designVisualization.templates',

  'mms.designVisualization.wiringService',
  'mms.designVisualization.diagramService',

  'mms.designVisualization.diagramContainer',
  'mms.designVisualization.fabricCanvas',
  'mms.designVisualization.svgDiagram',
  'mms.designVisualization.symbols'

])
.controller('AppController', function($scope, diagramService, $log){
  $scope.diagram = diagramService.getDiagram();

  $log.debug('Diagram:', $scope.diagram);

});

app.config(function() {
  console.log('In app config...');
});
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
.filter('inViewPort', function () {
  return function (input, viewPort, paddingRatio) {
    var output,
    padding;

    paddingRatio = paddingRatio || 0;

    padding = {
      x: paddingRatio * (viewPort.right - viewPort.left),
      y: paddingRatio * (viewPort.bottom - viewPort.top)
    };

    output = [];

    if (angular.isObject(viewPort) && angular.isArray(input)) {

      angular.forEach(input, function (component) {
        if (component.isInViewPort(viewPort, padding)) {
          output.push(component);
        }
      });

    }

    console.log('DiagramComponents on screen:', output.length);

    return output;
  };
})
.controller('DiagramContainerController', [
  '$scope',
  'PanZoomService',
  function ($scope,  PanZoomService) {

    var compiledDirectives;

    compiledDirectives = {};

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

    this.toggleSelected = function(component, $event) {

      var index;

      $scope.diagram.state = $scope.diagram.state || {};
      $scope.diagram.state.selectedComponentIds = $scope.diagram.state.selectedComponentIds || [];

      $scope.diagram.config = $scope.diagram.config || {};

      if (angular.isObject(component) && this.isEditable() && component.nonSelectable !== true) {

        index = $scope.diagram.state.selectedComponentIds.indexOf(component.id);

        if (component.selected === true) {

          if (index > -1) {
            $scope.diagram.state.selectedComponentIds.splice(index, 1);
          }

          component.selected = false;

        } else {

          if ($scope.diagram.state.selectedComponentIds.length > 0 &&
            $scope.diagram.config.multiSelect !== true &&
            $event.shiftKey !== true) {

            angular.forEach($scope.diagram.state.selectedComponentIds, function(componentId) {
              $scope.diagram.components[componentId].selected = false;
            });
            $scope.diagram.state.selectedComponentIds = [];
          }

          if (index === -1) {
            $scope.diagram.state.selectedComponentIds.push(component.id);
          }

          component.selected = true;

        }

      }
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
    templateNamespace: 'SVG'
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
.controller('SVGDiagramController', function () {


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
          gridService.setVisibleArea(id, visibleArea);
        });

//        $log.debug(scope.diagram);
      }

    };
  }
]);
},{"../componentWire/componentWire.js":4}],11:[function(require,module,exports){
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
      compiledSymbol,
      symbolComponent;

      diagramContainerController = controllers[1];

      scope.onPortClick = function(port) {
        console.log(port);
      };

      scope.portsVisible = function() {
        return true;
      };

      scope.detailsVisible = function() {
        return diagramContainerController.getZoomLevel() > 1;
      };

      scope.toggleSelected = function($event) {
        diagramContainerController.toggleSelected(scope.component, $event);
      };

      scope.getCssClass = function() {

        var result;

        result = scope.component.symbol.type;

        if (scope.component.selected) {
          result += ' selected';
        }

        return result;

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

      compiledSymbol(scope, function(clonedElement){
        $(element).find('.symbol-placeholder').replaceWith(clonedElement);
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

Wire.prototype.getEndPositions = function() {

//  return {
//    x1: this.end1.component.x + this.end1.port.portSymbol.x,
//    y1: this.end1.component.y + this.end1.port.portSymbol.y,
//
//    x2: this.end2.component.x + this.end2.port.portSymbol.x,
//    y2: this.end2.component.y + this.end2.port.portSymbol.y
//  };

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

    symbolTypes,

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
          rotation: Math.floor(Math.random() * 40) * 90,
          scaleX: 1, //[1, -1][Math.round(Math.random())],
          scaleY: 1, //[1, -1][Math.round(Math.random())],
          symbol: symbol,
          nonSelectable: false,
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

    this.addWire = function (aWire) {

      if (angular.isObject(aWire) && !angular.isDefined(wiresById[ aWire.id ])) {

        wiresById[ aWire.id ] = aWire;
        wires.push(aWire);

      }
    };

    this.getDiagram = function () {

      return {
        components: componentsById,
        wires: wiresById,
        config: {
          editable: true
        }
      };

    };

    //this.generateDummyDiagram(2000, 500, 10000, 10000);
    this.generateDummyDiagram(200, 200, 5000, 5000);

  }
]);
},{"./classes/ComponentPort":19,"./classes/DiagramComponent.js":20,"./classes/Wire.js":21}],23:[function(require,module,exports){
/*globals angular*/

'use strict';

var gridServicesModule = angular.module(
'mms.designVisualization.gridService',
[]);

gridServicesModule.service('gridService', [ '$log', '$rootScope', '$timeout', function ($log, $rootScope, $timeout) {

  var grids = {},

  numberOfChangesAllowedInOneCycle = 2000,
  recalculateCycleDelay = 10,

  recalculateVisibleDiagramComponents,
  invalidateVisibleDiagramComponents,
  recalculateVisibleWires;

  recalculateVisibleWires = function (grid) {

    angular.forEach(grid.wires, function (wire) {
      if (grid.visibleDiagramComponents[wire.end1.component.id] || grid.visibleDiagramComponents[wire.end2.component.id]) {
        if (!grid.visibleWires[wire.id]) {
          grid.visibleWires[wire.id] = wire;
        }
      } else {
        if (grid.visibleWires[wire.id]) {
          delete grid.visibleWires[wire.id];
        }
      }
    });

  };

  recalculateVisibleDiagramComponents = function (grid) {

    var countOfChanges = 0,
      changesLimitReached = false;

    grid.invisibleDiagramComponentsRecalculate = true;

    angular.forEach(grid.components, function (component) {

      if (!changesLimitReached) {

        if (component.isInViewPort(grid.viewPort, {x: -300, y: -200})) {

          if (!grid.visibleDiagramComponents[component.id]) {
            grid.visibleDiagramComponents[component.id] = component;
            countOfChanges++;
          }
        } else {

          if (grid.visibleDiagramComponents[component.id]) {
            delete grid.visibleDiagramComponents[component.id];
            //countOfChanges++;
          }
        }

        if (countOfChanges >= numberOfChangesAllowedInOneCycle) {
          changesLimitReached = true;
        }

      }

    });

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

  invalidateVisibleDiagramComponents = function(grid) {

    if (!grid.invisibleDiagramComponentsRecalculate) {
      $timeout(function () {
        recalculateVisibleDiagramComponents(grid);
      });
    }

  };

  this.createGrid = function (id, dimensions, diagram) {

    var grid;

    if (!angular.isDefined(grids[id])) {
      grid = grids[id] = {
        dimensions: dimensions,
        components: diagram.components,
        visibleDiagramComponents: {},
        wires: diagram.wires,
        visibleWires: {},
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

        invalidateVisibleDiagramComponents(grid);

      }

    } else {
      throw('Grid was not defined!', gridId);
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
          y2: elbow.y

        },{

          type: 'line',

          x1: elbow.x,
          y1: elbow.y,

          x2: point2.x,
          y2: point2.y

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

  var SimpleRouter = require('./classes/SimpleRouter.js'),
  ElbowRouter = require('./classes/ElbowRouter.js'),
  routers = {

    SimpleRouter: new SimpleRouter(),
    ElbowRouter: new ElbowRouter()

  };

  this.routeWire = function (wire, routerType) {

    var router, endPositions;

    router = routers[routerType];

    if (angular.isObject(router) && angular.isFunction(router.makeSegments)) {

      endPositions = wire.getEndPositions();

      wire.segments = router.makeSegments(
      [ endPositions.end1, endPositions.end2 ]);
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
},{"Array.prototype.find":2}]},{},[1]);
