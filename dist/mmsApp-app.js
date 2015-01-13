(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular*/

'use strict';

require('./libraryIncludes.js');

require('ngDragDrop');



require('./utils.js');

require('./services/projectHandling/projectHandling.js');
require('./services/connectionHandling/connectionHandling.js');

require('./services/operationsManager/operationsManager.js');

require('./services/diagramService/diagramService.js');
require('./services/gridService/gridService.js');
require('./services/wiringService/wiringService.js');

require('./directives/headerButtons/headerButtons.js');

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

    'mms.connectionHandling',
    'mms.projectHandling',
    'mms.headerButtons',

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
    'ngMaterial',
    'ang-drag-drop',
    'ngCookies'
]);

CyPhyApp.config(function ($stateProvider, $urlRouterProvider) {

    var GMEProjectInitializers,
        gmeProjectInitializers;

    GMEProjectInitializers = require('./classes/GMEProjectInitializers');
    gmeProjectInitializers = new GMEProjectInitializers();

    $urlRouterProvider.otherwise('/404');


    $stateProvider

        .state('editor', {
            templateUrl: '/mmsApp/templates/editor.html',
            url: '/editor',
            abstract: true
        })
        .state('editor.branch', {
            url: '/:projectId/:branchId',
            resolve: {
                selectProjectBranchWorkspaceAndDesign: gmeProjectInitializers.selectProjectBranchWorkspaceAndDesign
            },
            controller: 'EditorViewController'
        })
        .state('createDesign', {
            url: '/createDesign/:projectId',
            resolve: {
                selectProject: gmeProjectInitializers.selectProject
            },
            controller: 'CreateDesignController'
        })
        .state('404', {
            url: '/404',
            templateUrl: '/mmsApp/templates/404.html',
            views: {
              'onCover': {
                  templateUrl: '/mmsApp/templates/404.html',
                  controller: 'NotFoundController'
              }
            }
        });
});



CyPhyApp.controller('MainNavigatorController', function ($rootScope, $scope, $window, $mdDialog) {

    var defaultNavigatorItems;

    defaultNavigatorItems = [
        {
            id: 'root',
            label: '',
            itemClass: 'cyphy-root',
            action: function(item, ev) {

                function DialogController($scope, $mdDialog) {
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
                    .then(function() {});

            }
        }
    ];

    $scope.navigator = {
        separator: true,
        items: angular.copy(defaultNavigatorItems, [])
    };

    $rootScope.$watch('activeDesign', function (activeDesign) {

        if (activeDesign && activeDesign.id) {


            $scope.navigator.items = angular.copy(defaultNavigatorItems, []);

            $scope.navigator.items.push({
                id: 'design',
                label: activeDesign.name
                //action: function () {
                //    $window.open('/?project=' + projectId);
                //}
            });

        } else {
            $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
        }

    });

});

CyPhyApp.controller('AppController', function ($rootScope) {

    $rootScope.busy = true;
    //window.dragStart = function(evt) {
    //    console.log('--------------' + evt);
    //    evt.dataTransfer.effectAllowed = 'copy';
    //    evt.dataTransfer.dropEffect = 'copy';
    //};

});

CyPhyApp.controller('EditorViewController', function () {
});

CyPhyApp.controller('NotFoundController', function ($rootScope) {

    $rootScope.stopBusy();

});

CyPhyApp.controller('CreateDesignController', function (
    $rootScope, $scope, $stateParams, $http, $log, $state, growl, projectHandling, workspaceService) {

    $scope.projectId = $stateParams.projectId;
    $scope.errored = false;
    $rootScope.processing = true;

    if ($rootScope.wsContext) {

        $log.debug('Cleaning up workspace regions');
        workspaceService.cleanUpAllRegions($rootScope.wsContext);

    }

    $rootScope.$emit('$destroy');

    $log.debug('New branch creation');

        projectHandling.cloneMaster()
            .then(function (data) {

            $rootScope.processing = false;
            $log.debug('New project creation successful', data);
            $state.go('editor.branch', {
                projectId: $scope.projectId,
                branchId: data
            });

        })
        .catch(function (data, status) {

            $log.debug('New project creation failed', status);
            $rootScope.processing = false;
            growl.error('An error occured while project creation. Please retry later.');

        });

});

},{"./classes/GMEProjectInitializers":5,"./directives/busyCover/busyCover.js":6,"./directives/designEditor/designEditor":10,"./directives/diagramContainer/diagramContainer.js":12,"./directives/fabricCanvas/fabricCanvas.js":14,"./directives/headerButtons/headerButtons.js":15,"./directives/resizing/resizeToHeight.js":17,"./directives/resizing/resizeToWindow.js":18,"./directives/svgDiagram/svgDiagram.js":23,"./directives/symbols/componentSymbol.js":26,"./libraryIncludes.js":35,"./services/connectionHandling/connectionHandling.js":36,"./services/diagramService/diagramService.js":43,"./services/gridService/gridService.js":44,"./services/operationsManager/operationsManager.js":45,"./services/projectHandling/projectHandling.js":46,"./services/wiringService/wiringService.js":51,"./utils.js":52,"ngDragDrop":3}],2:[function(require,module,exports){
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
 * Created with IntelliJ IDEA.
 * User: Ganaraj.Pr
 * Date: 11/10/13
 * Time: 11:27
 * To change this template use File | Settings | File Templates.
 */

(function(angular){

function isDnDsSupported(){
    return 'draggable' in document.createElement("span");
}

if(!isDnDsSupported()){
    return;
}

if (window.jQuery && (-1 == window.jQuery.event.props.indexOf("dataTransfer"))) {
    window.jQuery.event.props.push("dataTransfer");
}

var currentData;

angular.module("ang-drag-drop",[])
    .directive("uiDraggable", [
        '$parse',
        '$rootScope',
        '$dragImage',
        function ($parse, $rootScope, $dragImage) {
            return function (scope, element, attrs) {
                var dragData = "",
                    isDragHandleUsed = false,
                    dragHandleClass,
                    draggingClass = attrs.draggingClass || "on-dragging",
                    dragTarget;

                element.attr("draggable", false);

                attrs.$observe("uiDraggable", function (newValue) {
                    if(newValue){
                        element.attr("draggable", newValue);
                    }
                    else{
                        element.removeAttr("draggable");
                    }

                });

                if (attrs.drag) {
                    scope.$watch(attrs.drag, function (newValue) {
                        dragData = newValue || "";
                    });
                }

                if (angular.isString(attrs.dragHandleClass)) {
                    isDragHandleUsed = true;
                    dragHandleClass = attrs.dragHandleClass.trim() || "drag-handle";

                    element.bind("mousedown", function (e) {
                        dragTarget = e.target;
                    });
                }

                function dragendHandler(e) {
                    setTimeout(function() {
                      element.unbind('$destroy', dragendHandler);
                    }, 0);
                    var sendChannel = attrs.dragChannel || "defaultchannel";
                    $rootScope.$broadcast("ANGULAR_DRAG_END", sendChannel);
                    if (e.dataTransfer && e.dataTransfer.dropEffect !== "none") {
                        if (attrs.onDropSuccess) {
                            var fn = $parse(attrs.onDropSuccess);
                            scope.$apply(function () {
                                fn(scope, {$event: e});
                            });
                        } else {
                            if (attrs.onDropFailure) {
                                var fn = $parse(attrs.onDropFailure);
                                scope.$apply(function () {
                                    fn(scope, {$event: e});
                                });
                            }
                        }
                    }
                    element.removeClass(draggingClass);
                }

                element.bind("dragend", dragendHandler);

                element.bind("dragstart", function (e) {
                    var isDragAllowed = !isDragHandleUsed || dragTarget.classList.contains(dragHandleClass);

                    if (isDragAllowed) {
                        var sendChannel = attrs.dragChannel || "defaultchannel";
                        var sendData = angular.toJson({ data: dragData, channel: sendChannel });
                        var dragImage = attrs.dragImage || null;

                        element.addClass(draggingClass);
                        element.bind('$destroy', dragendHandler);

                        if (dragImage) {
                            var dragImageFn = $parse(attrs.dragImage);
                            scope.$apply(function() {
                                var dragImageParameters = dragImageFn(scope, {$event: e});
                                if (dragImageParameters) {
                                    if (angular.isString(dragImageParameters)) {
                                        dragImageParameters = $dragImage.generate(dragImageParameters);
                                    }
                                    if (dragImageParameters.image) {
                                        var xOffset = dragImageParameters.xOffset || 0,
                                            yOffset = dragImageParameters.yOffset || 0;
                                        e.dataTransfer.setDragImage(dragImageParameters.image, xOffset, yOffset);
                                    }
                                }
                            });
                        }

                        e.dataTransfer.setData("dataToSend", sendData);
                        currentData = angular.fromJson(sendData);
                        e.dataTransfer.effectAllowed = "copyMove";
                        $rootScope.$broadcast("ANGULAR_DRAG_START", sendChannel, currentData.data);
                    }
                    else {
                        e.preventDefault();
                    }
                });
            };
        }
    ])
    .directive("uiOnDrop", [
        '$parse',
        '$rootScope',
        function ($parse, $rootScope) {
            return function (scope, element, attr) {
                var dragging = 0; //Ref. http://stackoverflow.com/a/10906204
                var dropChannel = attr.dropChannel || "defaultchannel" ;
                var dragChannel = "";
                var dragEnterClass = attr.dragEnterClass || "on-drag-enter";
                var dragHoverClass = attr.dragHoverClass || "on-drag-hover";
                var customDragEnterEvent = $parse(attr.onDragEnter);
                var customDragLeaveEvent = $parse(attr.onDragLeave);

                function onDragOver(e) {
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }

                    var fn = $parse(attr.uiOnDragOver);
                    scope.$apply(function () {
                        fn(scope, {$event: e, $channel: dropChannel});
                    });

                    e.dataTransfer.dropEffect = e.shiftKey ? 'copy' : 'move';
                    return false;
                }

                function onDragLeave(e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }

                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    dragging--;

                    if (dragging == 0) {
                        scope.$apply(function () {
                            customDragEnterEvent(scope, {$event: e});
                        });
                        element.removeClass(dragHoverClass);
                    }

                    var fn = $parse(attr.uiOnDragLeave);
                    scope.$apply(function () {
                        fn(scope, {$event: e, $channel: dropChannel});
                    });
                }

                function onDragEnter(e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }

                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    dragging++;

                    var fn = $parse(attr.uiOnDragEnter);
                    scope.$apply(function () {
                        fn(scope, {$event: e, $channel: dropChannel});
                    });

                    $rootScope.$broadcast("ANGULAR_HOVER", dragChannel);
                    scope.$apply(function () {
                        customDragLeaveEvent(scope, {$event: e});
                    });
                    element.addClass(dragHoverClass);
                }

                function onDrop(e) {
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }
                    if (e.stopPropagation) {
                        e.stopPropagation(); // Necessary. Allows us to drop.
                    }

                    var sendData = e.dataTransfer.getData("dataToSend");
                    sendData = angular.fromJson(sendData);

                    var fn = $parse(attr.uiOnDrop);
                    scope.$apply(function () {
                        fn(scope, {$data: sendData.data, $event: e, $channel: sendData.channel});
                    });
                    element.removeClass(dragEnterClass);
                    dragging = 0;
                }

                function isDragChannelAccepted(dragChannel, dropChannel) {
                    if (dropChannel === "*") {
                        return true;
                    }

                    var channelMatchPattern = new RegExp("(\\s|[,])+(" + dragChannel + ")(\\s|[,])+", "i");

                    return channelMatchPattern.test("," + dropChannel + ",");
                }

                function preventNativeDnD(e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    e.dataTransfer.dropEffect = "none";
                    return false;
                }

			var deregisterDragStart = $rootScope.$on("ANGULAR_DRAG_START", function (event, channel) {
                    dragChannel = channel;
                    if (isDragChannelAccepted(channel, dropChannel)) {
                        if (attr.dropValidate) {
                            var validateFn = $parse(attr.dropValidate);
                            var valid = validateFn(scope, {$data: currentData.data, $channel: currentData.channel});
                            if (!valid) {
                                element.bind("dragover", preventNativeDnD);
                                element.bind("dragenter", preventNativeDnD);
                                element.bind("dragleave", preventNativeDnD);
                                element.bind("drop", preventNativeDnD);
								return;
                            }
                        }

                        element.bind("dragover", onDragOver);
                        element.bind("dragenter", onDragEnter);
                        element.bind("dragleave", onDragLeave);

                        element.bind("drop", onDrop);
                        element.addClass(dragEnterClass);
                    }
					else {
					    element.bind("dragover", preventNativeDnD);
					    element.bind("dragenter", preventNativeDnD);
					    element.bind("dragleave", preventNativeDnD);
					    element.bind("drop", preventNativeDnD);
					}

                });



                var deregisterDragEnd = $rootScope.$on("ANGULAR_DRAG_END", function (e, channel) {
                    dragChannel = "";
                    if (isDragChannelAccepted(channel, dropChannel)) {

                        element.unbind("dragover", onDragOver);
                        element.unbind("dragenter", onDragEnter);
                        element.unbind("dragleave", onDragLeave);

                        element.unbind("drop", onDrop);
                        element.removeClass(dragHoverClass);
                        element.removeClass(dragEnterClass);
                    }

					element.unbind("dragover", preventNativeDnD);
					element.unbind("dragenter", preventNativeDnD);
					element.unbind("dragleave", preventNativeDnD);
					element.unbind("drop", preventNativeDnD);
                });


                var deregisterDragHover = $rootScope.$on("ANGULAR_HOVER", function (e, channel) {
                    if (isDragChannelAccepted(channel, dropChannel)) {
                      element.removeClass(dragHoverClass);
                    }
                });


                scope.$on('$destroy', function () {
                    deregisterDragStart();
                    deregisterDragEnd();
                    deregisterDragHover();
                });


                attr.$observe('dropChannel', function (value) {
                    if (value) {
                        dropChannel = value;
                    }
                });


            };
        }
    ])
    .constant("$dragImageConfig", {
        height: 20,
        width: 200,
        padding: 10,
        font: 'bold 11px Arial',
        fontColor: '#eee8d5',
        backgroundColor: '#93a1a1',
        xOffset: 0,
        yOffset: 0
    })
    .service("$dragImage", [
        '$dragImageConfig',
        function (defaultConfig) {
            var ELLIPSIS = '…';

            function fitString(canvas, text, config) {
                var width = canvas.measureText(text).width;
                if (width < config.width) {
                    return text;
                }
                while (width + config.padding > config.width) {
                    text = text.substring(0, text.length - 1);
                    width = canvas.measureText(text + ELLIPSIS).width;
                }
                return text + ELLIPSIS;
            };

            this.generate = function (text, options) {
                var config = angular.extend({}, defaultConfig, options || {});
                var el = document.createElement('canvas');

                el.height = config.height;
                el.width = config.width;

                var canvas = el.getContext('2d');

                canvas.fillStyle = config.backgroundColor;
                canvas.fillRect(0, 0, config.width, config.height);
                canvas.font = config.font;
                canvas.fillStyle = config.fontColor;

                var title = fitString(canvas, text, config);
                canvas.fillText(title, 4, config.padding + 4);

                var image = new Image();
                image.src = el.toDataURL();

                return {
                    image: image,
                    xOffset: config.xOffset,
                    yOffset: config.yOffset
                };
            }
        }
    ]);

}(angular));

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
/*globals angular*/
'use strict';

module.exports = function () {

    return {

        selectDesign: function ($q) {

            var deferred;

            deferred = $q.defer();

            return deferred.promise;
        },

        selectProjectBranchWorkspaceAndDesign: function (
            $q, $stateParams, branchService, connectionHandling,
            $log, $rootScope, projectHandling, $state, projectService,
            workspaceService, designService, testBenchService) {

            var deferred,
                connectionId,

                selectBranchWhenHaveOne;

            $rootScope.loading = true;

            deferred = $q.defer();

            connectionId = connectionHandling.getMainGMEConnectionId();

            selectBranchWhenHaveOne = function(branchId) {
                branchService.selectBranch(connectionId, branchId)
                    .then(function(branchId){

                        var wsContext;

                        $log.debug('Branch selected', branchId);
                        $rootScope.branchId = branchId;

                        wsContext = $rootScope.wsContext = {
                            db: connectionId,
                            regionId: 'WorkSpaces_' + ( new Date() )
                                .toISOString()
                        };

                        $rootScope.$on('$destroy', function () {
                            workspaceService.cleanUpAllRegions(wsContext);
                        });


                        workspaceService.registerWatcher(wsContext, function (destroyed) {

                            $log.debug('WorkSpace watcher initialized, destroyed:', destroyed);

                            if (destroyed !== true) {
                                workspaceService.watchWorkspaces(wsContext, function (updateObject) {

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

                                        designService.watchDesigns(wsContext, $rootScope.activeWorkSpace.id, function (/*designsUpdateObject*/) {

                                        }).then(function (designsData) {

                                            angular.forEach(designsData.designs, function (design) {

                                                if (!hasFoundFirstDesign) {

                                                    hasFoundFirstDesign = true;
                                                    $rootScope.activeDesign = design;
                                                    $log.debug('Active design:', $rootScope.activeDesign);

                                                }

                                            });


                                            if (hasFoundFirstDesign) {

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

                                        testBenchService.watchTestBenches(
                                            wsContext,
                                            $rootScope.activeWorkSpace.id,
                                            function(){}
                                        ).then(function(testbenchesData) {

                                                var hasFoundFirstTestbench;

                                                angular.forEach(testbenchesData.testBenches, function(testbench){

                                                    if (!hasFoundFirstTestbench) {

                                                        hasFoundFirstTestbench = true;
                                                        $rootScope.activeTestbench = testbench;
                                                        $log.debug('Active testbench:', testbench);

                                                    }

                                                });

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

                    })
                    .catch(function (reason) {
                        $rootScope.loading = false;
                        $log.debug('Opening branch errored:', $stateParams.projectId, reason);
                        $state.go('404', {
                            projectId: $stateParams.projectId
                        });
                    });
            };

            connectionHandling.establishMainGMEConnection()
                .then(function(){
                projectService.selectProject(connectionHandling.getMainGMEConnectionId(), $stateParams.projectId)
                    .then(function (projectId) {

                        $log.debug('Project selected', projectId);
                        $rootScope.projectId = projectId;

                        selectBranchWhenHaveOne($stateParams.branchId);

                    }).catch(function (reason) {
                        $rootScope.loading = false;
                        $log.debug('Opening project errored:', $stateParams.projectId, reason);
                        $state.go('404', {
                            projectId: $stateParams.projectId
                        });
                    });
                });

            return deferred.promise;
        },

        selectProject: function (
            $q, projectService, connectionHandling, $stateParams, $log, $rootScope, projectHandling, $state) {

            var deferred;

            deferred = $q.defer();

            $rootScope.loading = true;

            connectionHandling.establishMainGMEConnection()
                .then(function(){


                    projectService.selectProject(connectionHandling.getMainGMEConnectionId(), $stateParams.projectId)
                        .then(function (projectId) {

                            $log.debug('Project selected', projectId);
                            $rootScope.projectId = projectId;

                            //projectHandling.findFirstBranch()
                            //    .then(function(branchId){
                            //
                            //        $stateParams.branchId = branchId;
                            //
                            //        console.log('First branch', branchId);
                            //
                            //        deferred.resolve();
                            //
                            //        $timeout(function() {
                            //            $state.go('editor.branch', {
                            //                projectId: projectId,
                            //                branchId: branchId
                            //            });
                            //        });
                            //
                            //
                            //    });


                            deferred.resolve(projectId);

                        });
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

};

},{}],6:[function(require,module,exports){
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

                        var isBusy;

                        if ($rootScope.loading) {

                            scope.busyMessage = 'Loading...';

                        } else if ( $rootScope.initializing ){

                            scope.busyMessage = 'Initializing...';

                        } else if ( $rootScope.busy ){

                            if (!scope.busyMessage) {
                                scope.busyMessage = 'Just a second...';
                            }

                        } else {
                            scope.busyMessage = '';
                        }

                        isBusy = $rootScope.loading ||
                            $rootScope.initializing ||
                            $rootScope.busy;

                        return isBusy;

                    }, function(isBusy) {

                        scope.busy = isBusy;

                        if (!isBusy) {

                            element.removeClass('busy');

                        } else {

                            element.addClass('busy');

                        }

                    });

                    scope.$watch(function() {

                        var isCovered;

                        isCovered = ( $rootScope.unCovered !== true );

                        return isCovered;

                    }, function(isCovered) {

                        if (isCovered) {

                            element.removeClass('off');

                        } else {

                            element.addClass('off');

                        }

                    });


                    $rootScope.stopBusy = function() {

                        $rootScope.loading = false;
                        $rootScope.initializing = false;
                        $rootScope.busy = false;

                    };

                    $rootScope.unCover = function() {

                        $rootScope.unCovered = true;

                    };
                }


            };
        }] );
},{}],7:[function(require,module,exports){
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

        //$scope.onSegmentClick = function ( wire, segment ) {
        //    console.log( wire, segment );
        //};


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
                templateNamespace: 'SVG',
                require: '^svgDiagram',
                link: function(scope, element, attributes, svgDiagramController) {

                    scope.onMouseUp = function ( segment, $event ) {
                        svgDiagramController.onWireMouseUp( scope.wire, segment, $event );
                    };

                    scope.onMouseDown = function ( segment, $event ) {
                        svgDiagramController.onWireMouseDown( scope.wire, segment, $event );
                        $event.stopPropagation();
                    };


                }
            };
        }
);
},{"./componentWireSegment":8}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
/*globals angular*/

'use strict';

// Move this to GME eventually

require('../testbenchActions/testbenchActions.js');

angular.module('mms.designVisualization.designEditor', [
    'mms.testbenchActions'
])
    .controller('DesignEditorController', function ($scope, $rootScope, diagramService, $log, connectionHandling,
                                                    designService, $stateParams, designLayoutService, symbolManager, $timeout,
                                                    nodeService, gridService, $cookies) {

        var RandomSymbolGenerator,
            randomSymbolGenerator,

            designCtx,

            setupDiagramEventHandlers,
            eventHandlersAreSet,
            lastComponentInstantiationPosition,

            justCreatedWires;


        justCreatedWires = [];

        $scope.diagram = null;

        $scope.mainGMEConnectionId = connectionHandling.getMainGMEConnectionId();

        designCtx = {
            db: $scope.mainGMEConnectionId,
            regionId: 'Design_' + ( new Date() ).toISOString()
        };

        $scope.diagramContainerConfig = {};

        $rootScope.$on('componentInstantiationMustBeDone', function ($event, componentData, position) {

            var nodesToCopy;

            $rootScope.processing = true;

            if (!position) {
                position = gridService.getViewPortCenter($rootScope.activeDiagramId);
            }

            if (!position) {
                position = {
                    x: 0,
                    y: 0
                };
            }

            lastComponentInstantiationPosition = position;

            if (componentData && componentData.id) {

                nodesToCopy = {};

                nodesToCopy[componentData.id] = {
                    registry: {
                        position: position,
                        rotation: 0
                    }
                };

                nodeService.copyMoreNodes(designCtx, $rootScope.activeContainerId, nodesToCopy);
            }

        });

        $rootScope.$on('wireCreationMustBeDone', function ($event, wire, msg) {

            $rootScope.processing = true;

            nodeService.getMetaNodes(designCtx)
                .then(function(meta) {

                    var metaId;

                    metaId = meta.byName.ConnectorComposition.id;

                    nodeService.createNode(designCtx, $rootScope.activeContainerId, metaId, msg || 'New wire' )
                        .then(function(node){

                            nodeService.startTransaction(designCtx, msg || 'New wire details');

                            console.log(wire.segments);

                            node.setRegistry('wireSegments', angular.copy(wire.segments));
                            node.makePointer('src', wire.end1.port.id );
                            node.makePointer('dst', wire.end2.port.id );

                            nodeService.completeTransaction(designCtx);

                            wire.id = node.id;
                            diagramService.addWire( $rootScope.activeDiagramId, wire );
                            gridService.invalidateVisibleDiagramComponents( $rootScope.activeDiagramId );


                            $rootScope.processing = false;

                        });

                });

        });

        $rootScope.$on('wireSegmentsMustBeSaved', function ($event, wire, message) {
            designLayoutService.setWireSegments(designCtx, wire.id, angular.copy(wire.segments), message || 'Updating wire');
        });

        $rootScope.$on('wireDeletionMustBeDone', function ($event, wire, message) {
            $rootScope.processing = true;
            nodeService.destroyNode(designCtx, wire.id, message || 'Deleting wire');
        });

        $rootScope.$on('componentDeletionMustBeDone', function ($event, components, msg) {

            var startDeletionOfComponent;

            startDeletionOfComponent = function (component) {

                var i,
                    wires,
                    deleteMessage,
                    nodeIdsToDelete;


                if (angular.isObject(component)) {

                    nodeIdsToDelete = [];

                    deleteMessage = 'Deleting design element';

                    wires = diagramService.getWiresForComponents($rootScope.activeDiagramId, [component]);

                    if (wires.length > 0) {

                        deleteMessage += ' with wires';

                        nodeIdsToDelete = wires.map(function (wire) {
                            return wire.id;
                        });

                    }

                    nodeIdsToDelete.unshift(component.id);

                    for (i = 0; i < nodeIdsToDelete.length; i++) {
                        nodeService.destroyNode(designCtx, nodeIdsToDelete[i], deleteMessage);
                    }

                }
            };

            $rootScope.processing = true;

            nodeService.startTransaction(designCtx, msg || 'Deleting design elements');

            if (angular.isArray(components)) {

                angular.forEach(components, function (component) {
                    startDeletionOfComponent(component);
                });

            } else {
                startDeletionOfComponent(components);
            }

            nodeService.completeTransaction(designCtx);

        });

        setupDiagramEventHandlers = function () {

            if (!eventHandlersAreSet) {

                eventHandlersAreSet = true;

                $scope.$on('componentsPositionChange', function (e, data) {

                    var i;

                    i = 1;

                    //nodeService.startTransaction(designCtx, data.message);

                    angular.forEach(data.components, function (component) {

                        $timeout(function () {

                            designLayoutService.setPosition(
                                designCtx,
                                component.id,
                                component.getPosition(),
                                data.message
                            );
                        }, 10 * i);

                        i++;

                    });

                    //nodeService.completeTransaction(designCtx);

                });

                $scope.$on('componentsRotationChange', function (e, data) {

                    var i;

                    i = 1;

                    //nodeService.startTransaction(designCtx, data.message);

                    angular.forEach(data.components, function (component) {

                        $timeout(function () {

                            designLayoutService.setRotation(
                                designCtx,
                                component.id,
                                component.rotation,
                                data.message
                            );
                        }, 10 * i);

                        i++;

                    });

                    //nodeService.completeTransaction(designCtx);

                });

            }
        };

        if ($stateParams.containerId === 'dummy') {

            RandomSymbolGenerator = require('./classes/RandomSymbolGenerator');
            randomSymbolGenerator = new RandomSymbolGenerator(symbolManager);

            randomSymbolGenerator.generateSymbols(7);


            $scope.diagram = diagramService.addDummyDiagram('dummy', 100, 50, 3000, 3000);

            $log.debug('Drawing dummy diagram:', $scope.diagram);
            $rootScope.loading = false;

        } else {

            $scope.designCtx = designCtx;

            designLayoutService.watchDiagramElements(designCtx, $rootScope.activeDesign.id, function (designStructureUpdateObject) {

                $log.debug('DiagramElementsUpdate', designStructureUpdateObject);

                switch (designStructureUpdateObject.type) {

                    case 'load':

                        if (!(designStructureUpdateObject.data.baseName === 'ConnectorComposition' &&
                            justCreatedWires.indexOf(designStructureUpdateObject.data.id) > -1)) {

                            diagramService.createNewComponentFromFromCyPhyElement(
                                $rootScope.activeDiagramId,
                                designStructureUpdateObject.data);

                            gridService.invalidateVisibleDiagramComponents($rootScope.activeDiagramId);
                        }

                        break;

                    case 'unload':

                        diagramService.deleteComponentOrWireById(
                            $rootScope.activeDiagramId,
                            designStructureUpdateObject.id);

                        gridService.invalidateVisibleDiagramComponents($rootScope.activeDiagramId, true);

                        break;

                    default :
                    case 'update':

                        if (designStructureUpdateObject.updateType === 'positionChange') {

                            diagramService.updateComponentsAndItsWiresPosition(
                                $rootScope.activeDiagramId,
                                designStructureUpdateObject.id,
                                designStructureUpdateObject.data.position
                            );
                        }

                        if (designStructureUpdateObject.updateType === 'rotationChange') {

                            diagramService.updateComponentsAndItsWiresRotation(
                                $rootScope.activeDiagramId,
                                designStructureUpdateObject.id,
                                designStructureUpdateObject.data.rotation
                            );
                        }

                        if (designStructureUpdateObject.updateType === 'detailsChange') {

                            diagramService.updateWireSegments(
                                $rootScope.activeDiagramId,
                                designStructureUpdateObject.id,
                                angular.copy(designStructureUpdateObject.data.details.wireSegments)
                            );
                        }

                        break;

                }

                $rootScope.processing = false;

            }).then(function (cyPhyLayout) {

                $log.debug('Diagram elements', cyPhyLayout);

                $rootScope.activeContainerId = $stateParams.containerId || $rootScope.activeDesign.id;

                $timeout(function () {

                    $rootScope.activeDiagramId = $rootScope.activeContainerId + '_' + ( new Date() ).toISOString();

                    $log.debug('Active diagram ID', $rootScope.activeDiagramId);

                    $scope.diagram =
                        diagramService.createDiagramFromCyPhyElements($rootScope.activeDiagramId, cyPhyLayout.elements);

                });


                $log.debug('Drawing diagram:', $scope.diagram);

                setupDiagramEventHandlers();

                $timeout(function () {
                    $rootScope.stopBusy();
                    $rootScope.unCover();

                    if ($cookies.seenMMSWelcome !== 'true') {

                        $rootScope.openHelpDialog();
                        $cookies.seenMMSWelcome = 'true';

                    }

                }, 500);

            });

            $scope.fabClick = function () {

                $log.debug('Fab was clicked');

            };

            $scope.$on('$destroy', function () {

                $rootScope.unCovered = false;

                if ($scope.designCtx) {
                    $log.debug('Celaning up designLayout watchers');
                    designLayoutService.cleanUpAllRegions($scope.designCtx);
                }

            });


        }

    })
    .directive('designEditor', [
        function () {

            return {
                restrict: 'E',
                controller: 'DesignEditorController',
                $scope: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/designEditor.html'

            };
        }]);

},{"../testbenchActions/testbenchActions.js":34,"./classes/RandomSymbolGenerator":9}],11:[function(require,module,exports){
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

        timedJSPReinit,
        jspReinitChillPeriod,
        jspReinitPromise,

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

    jspReinitChillPeriod = 200;

    timedJSPReinit = function() {

        if (angular.isObject(jsp)) {

            $log.debug('Reinitializing JSP.');
            jsp.reinitialise();

        }

    };

    jspReinit = function () {

        $timeout.cancel(jspReinitPromise);

        jspReinitPromise = $timeout(timedJSPReinit, jspReinitChillPeriod);

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

},{}],12:[function(require,module,exports){
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
        'componentBrowserService',
        '$rootScope',
        function ($scope, $timeout, $log, PanZoomService, $window, componentBrowserService, $rootScope) {

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


            $scope.somethingWasDroppedOnMe = function($event, $data) {

                var component,
                    position,
                    x,
                    y;

                component = componentBrowserService.getComponentById($data);

                if (component) {

                    if ($event && $event.originalEvent) {

                        x = $event.originalEvent.offsetX || 100;
                        y = $event.originalEvent.offsetY || 100;

                        position = {
                            x: x - 20,
                            y: y - 20
                        };

                    }

                    $rootScope.$emit('componentInstantiationMustBeDone', component, position);

                }

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

                    var $element;

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

                    $element = scope.$element = $(element);

                    //scope.$watch(function(){
                    //    return $element.attr('class');
                    //}, function(cssClass){
                    //    console.log(cssClass);
                    //});

                    scope.$contentPane = element.find('>.diagram-content-pane');

                    $timeout(function() {
                        scope.$broadcast('DiagramContainerInitialized');
                    });
                }

            };
        }
    ]);


},{"../drawingGrid/drawingGrid.js":13,"./classes/ScrollHandler":11}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.headerButtons', [ ] )
    .controller('HeaderButtonsController', function($scope, $rootScope, $mdDialog, $log){

        $scope.openSubscribeDialog = function(ev) {

            function DialogController($scope, $mdDialog) {

                $scope.user = {

                };

                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                $scope.send = function(userFields) {
                    $mdDialog.hide(userFields);
                };
            }

            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/mmsApp/templates/subscribeDialog.html',
                targetEvent: ev
            })
                .then(function(fields) {
                    $log.debug('Subscription', fields);
                }, function() {
                    $log.debug('Subscription cancelled.');
                });

        };


        $rootScope.openHelpDialog = $scope.openHelpDialog = function(ev) {

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


        $scope.openShareDialog = function(ev) {

            function DialogController($scope, $mdDialog, $window) {

                $scope.designUrl = $window.location.href;


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
    .directive( 'headerButtons', [ '$rootScope',
        function () {

            return {
                controller: 'HeaderButtonsController',
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/headerButtons.html'
            };
        }] );

},{}],16:[function(require,module,exports){
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

        $scope.getLabel = function() {

            var label;

            if (angular.isString($scope.portInstance.label)) {
                label = $scope.portInstance.label;
            } else if (angular.isFunction($scope.portInstance.label)){
                label = $scope.portInstance.label();
            } else {
                label = $scope.portInstance.portSymbol.label;
            }

            return label;
        };

        $scope.isPortLabelVisible = function() {

            return $scope.component.symbol.showPortLabels;

        };

        $scope.getCssClass = function() {

            var cssClass;

            cssClass = $scope.portInstance.portSymbol.cssClass;

            return cssClass;

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

},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function ($scope, diagramService, wiringService, operationsManager, $timeout, gridService, $log) {

    var self = this,
        getOffsetToMouse,
        possibbleDragTargetsDescriptor,
        dragTargetsDescriptor,

        dragTargetsWiresUpdate,
        wireUpdateWait,
        dragTargetsWiresUpdatePromises,

        onDiagramMouseUp,
        onDiagramMouseMove,
        onDiagramMouseLeave,
        onWindowBlur,
        onComponentMouseUp,
        onComponentMouseDown,

        startDrag,
        finishDrag,
        cancelDrag;


    getOffsetToMouse = function ($event) {

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

        $log.debug('Dragging', dragTargetsDescriptor);

    };

    cancelDrag = function () {

        possibbleDragTargetsDescriptor = null;

        if (dragTargetsDescriptor) {

            angular.forEach(dragTargetsDescriptor.targets, function (target) {

                target.component.setPosition(
                    target.originalPosition.x,
                    target.originalPosition.y
                );

            });

            angular.forEach(dragTargetsDescriptor.affectedWires, function (wire) {

                wiringService.adjustWireEndSegments(wire);

            });

            dragTargetsDescriptor = null;

        }

        self.dragging = false;

    };

    finishDrag = function () {

        var message,
            components;

        components = dragTargetsDescriptor.targets.map(
            function (target) {
                return target.component;
            });

        if (components.length > 1) {
            message = 'Dragging selection';
        } else {
            message = 'Dragging ' + components[0].label;
        }

        $scope.$emit('componentsPositionChange', {
            diagramId: $scope.diagram.id,
            components: components,
            message: message
        });

        //$scope.$emit('wiresChange', {
        //    diagramId: $scope.diagram.id,
        //    wires: dragTargetsDescriptor.affectedWires
        //});

        self.dragging = false;

        dragTargetsDescriptor = null;

        $log.debug('Finish dragging');

    };

    wireUpdateWait = 20;
    dragTargetsWiresUpdatePromises = {};

    dragTargetsWiresUpdate = function (affectedWires) {

        angular.forEach(affectedWires, function (wire) {

            $timeout.cancel(dragTargetsWiresUpdatePromises[wire.id]);

            dragTargetsWiresUpdatePromises[wire.id] = $timeout(function () {
                wiringService.adjustWireEndSegments(wire);
            }, wireUpdateWait);

        });

    };

    onDiagramMouseMove = function ($event) {

        var offset,
            i,
            target,
            snappedPosition;

        if (possibbleDragTargetsDescriptor) {
            startDrag();
        }

        if (dragTargetsDescriptor) {

            offset = getOffsetToMouse($event);

            for (i = 0; i < dragTargetsDescriptor.targets.length; i++) {

                target = dragTargetsDescriptor.targets[i];

                snappedPosition = gridService.getSnappedPosition({
                    x: offset.x + target.deltaToCursor.x,
                    y: offset.y + target.deltaToCursor.y
                });

                target.component.setPosition(
                    snappedPosition.x,
                    snappedPosition.y
                );

            }

            dragTargetsWiresUpdate(dragTargetsDescriptor.affectedWires);

        }

    };

    onDiagramMouseUp = function ($event) {

        possibbleDragTargetsDescriptor = null;

        if (dragTargetsDescriptor) {
            finishDrag();
            $event.stopPropagation();
        }

    };

    onDiagramMouseLeave = function (/*$event*/) {

        cancelDrag();

    };

    onWindowBlur = function (/*$event*/) {

        cancelDrag();

    };

    onComponentMouseUp = function (component, $event) {

        possibbleDragTargetsDescriptor = null;

        if (dragTargetsDescriptor) {
            finishDrag();
            $event.stopPropagation();
        }

    };

    onComponentMouseDown = function (component, $event) {

        var componentsToDrag,
            getDragDescriptor;

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

        $scope.diagram.config = $scope.diagram.config || {};

        if ($scope.diagram.config.editable === true &&
            component.nonSelectable !== true &&
            component.locationLocked !== true) {

            $event.stopPropagation();

            possibbleDragTargetsDescriptor = {
                targets: [getDragDescriptor(component)]
            };

            componentsToDrag.push(component);

            if ($scope.diagram.state.selectedComponentIds.indexOf(component.id) > -1) {

                // Drag along other selected components

                angular.forEach($scope.diagram.state.selectedComponentIds, function (selectedComponentId) {

                    var selectedComponent;

                    if (component.id !== selectedComponentId) {

                        selectedComponent = $scope.diagram.componentsById[selectedComponentId];

                        possibbleDragTargetsDescriptor.targets.push(getDragDescriptor(
                            selectedComponent));

                        componentsToDrag.push(selectedComponent);

                    }

                });
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

},{}],20:[function(require,module,exports){
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

        if (angular.isObject(component)) {

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

},{}],21:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function($scope, $rootScope, diagramService, wiringService, gridService, $timeout, $log) {

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
                    $scope.selectedRouter.type,
                    $scope.selectedRouter.params
                )
            ) );

        $rootScope.$emit('wireCreationMustBeDone', wire);

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
                    $scope.selectedRouter.type,
                    $scope.selectedRouter.params
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

    $scope.$on('keyupOnDiagram', function($event, e) {

        //console.log(e.keyCode);

        if (e.keyCode === 16) { // Esc
            cancelWire();
        }

        if (e.keyCode === 27) { // Esc
            cancelWire();
        }

    });

    this.onDiagramMouseUp = onDiagramMouseUp;
    this.onDiagramMouseMove = onDiagramMouseMove;
    this.onDiagramMouseLeave = onDiagramMouseLeave;
    this.onWindowBlur = onWindowBlur;
    this.onPortMouseDown = onPortMouseDown;

    return this;

};

},{"../../../services/diagramService/classes/Wire.js":42}],22:[function(require,module,exports){
/*globals angular, $*/

'use strict';

module.exports = function (
    $scope, $rootScope, diagramService, $timeout, contextmenuService, operationsManager, wiringService, $log) {

    var
        onComponentContextmenu,
        onWireContextmenu,
        onPortContextmenu,
        onDiagramContextmenu,
        onDiagramMouseDown,

        openMenu;

    $log.debug('Initializing context menus.');

    openMenu = function ($event) {

        contextmenuService.close();

        $timeout(function () {

            var openContextMenuEvent;

            openContextMenuEvent = angular.extend($.Event('openContextMenu'), {
                clientX: $event.clientX + 2,
                clientY: $event.clientY + 2,
                pageX: $event.pageX + 2,
                pageY: $event.pageY + 2,
                screenX: $event.screenX + 2,
                screenY: $event.screenY + 2,
                target: $event.target
            });

            $scope.$element.triggerHandler(openContextMenuEvent);

        });

    };

    onDiagramMouseDown = function () {
        contextmenuService.close();
    };

    onWireContextmenu = function (wire, segment, $event) {

        var wiringMenu;

        wiringMenu = [];

        angular.forEach($scope.routerTypes, function(routerType) {

            wiringMenu.push(
                {
                    id: routerType.id,
                    label: routerType.label,
                    action: function(){
                        wiringService.routeWire( wire, routerType.type, routerType.params);
                        $rootScope.$emit('wireSegmentsMustBeSaved', wire);
                    }
                }
            );

        });

        $scope.contextMenuData = [
            {
                id: 'adjust',
                items: [
                    {
                        id: 'redraw',
                        label: 'Redraw line',
                        menu: [
                            {
                                items: wiringMenu
                            }
                        ]
                    }
                ]
            },
            {
                id: 'delete',
                items: [
                    {
                        id: 'destroy',
                        label: 'Destroy wire',
                        iconClass: 'fa fa-trash-o',
                        action: function () {
                            $rootScope.$emit('wireDeletionMustBeDone', wire);
                        }
                    }
                ]
            }

        ];

        openMenu($event);

        $event.stopPropagation();

    };

    onComponentContextmenu = function (component, $event) {

        var inSelection,
            selectedComponents,
            destroyLabel;

        selectedComponents = $scope.diagram.getSelectedComponents();

        if ($scope.diagram.isComponentSelected(component) && selectedComponents.length > 1) {

            inSelection = true;

            destroyLabel = 'Destroy selected [' + selectedComponents.length + ']';

        } else {
            destroyLabel = 'Destroy';
        }

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
            },
            {
                id: 'delete',
                items: [
                    {
                        id: 'destroy',
                        label: destroyLabel,
                        iconClass: 'fa fa-trash-o',
                        action: function () {

                            if (!inSelection) {
                                $rootScope.$emit('componentDeletionMustBeDone', component);
                            } else {
                                $rootScope.$emit('componentDeletionMustBeDone', selectedComponents);
                            }


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

        var wiringMenu;

        wiringMenu = [];

        angular.forEach($scope.routerTypes, function(routerType) {
                var selected;

                selected = routerType.id === $scope.selectedRouter.id;

            wiringMenu.push(
                {
                    id: routerType.id,
                    label: routerType.label,
                    cssClass: selected ? 'selected' : 'not-selected',
                    iconClass: selected ? 'fa fa-check' : undefined,
                    action: function () {

                        $scope.selectedRouter = routerType;

                    }
                }
            );

        });


        $scope.contextMenuData = [
            {
                id: 'testbenches',
                items: [
                    {
                        id: 'generatePCB',
                        label: 'Generate PCB',
                        disabled: true,
                        iconClass: 'fa fa-play',
                        action: function () {
                            console.log('Statistics');
                        },
                        actionData: {}
                    }
                ]

            },
            {
                id: 'wiringMethods',
                label: 'Wiring method',
                items: wiringMenu
            }
        ];

        openMenu($event);

        $event.stopPropagation();

    };

    this.onDiagramContextmenu = onDiagramContextmenu;
    this.onComponentContextmenu = onComponentContextmenu;

    this.onWireContextmenu = onWireContextmenu;

    this.onPortContextmenu = onPortContextmenu;
    this.onDiagramMouseDown = onDiagramMouseDown;

    return this;

};

},{}],23:[function(require,module,exports){
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
        $scope, $rootScope, $log, diagramService, wiringService, gridService, $window, $timeout, contextmenuService, operationsManager) {

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
            $timeout,
            gridService,
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
            $rootScope,
            diagramService,
            wiringService,
            gridService,
            $timeout,
            $log
        );

        contextMenuHandler = new ContextMenuHandler(
            $scope,
            $rootScope,
            diagramService,
            $timeout,
            contextmenuService,
            operationsManager,
            wiringService,
            $log
        );

        $scope.routerTypes = wiringService.getRouterTypes();

        $scope.selectedRouter = $scope.routerTypes[0];

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

        this.onWireMouseUp = function (wire, segment, $event) {

            $event.stopPropagation();

        };

        this.onWireMouseDown = function (wire, segment, $event) {

            if ($event.which === 3) {

                contextMenuHandler.onWireContextmenu(wire, segment, $event);


            } else {

//                componentDragHandler.onWireMouseDown(component, $event);

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
                        affectedWires,
                        message;

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

                    if (componentsToRotate.length > 1) {
                        message = 'Rotating selection by ' + angle + 'deg';
                    } else {
                        message = 'Rotating ' + component.label + ' by ' + angle + 'deg';
                    }

                    $scope.$emit('componentsRotationChange', {
                        diagramId: $scope.diagram.id,
                        components: componentsToRotate,
                        message: message
                    });

                    //$scope.$emit('wiresChange', {
                    //    diagramId: $scope.diagram.id,
                    //    wires: affectedWires
                    //});

                };
            }

        });

        //$rootScope.snapToGrid = true;

    })
    .directive('svgDiagram', [
        '$rootScope',
        '$log',
        'diagramService',
        'gridService',
        '$timeout',
        function ($rootScope, $log, diagramService, gridService, $timeout) {

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

                    //scope.$watch(function(){
                    //    return $element.attr('class');
                    //}, function(cssClass){
                    //   console.log(cssClass);
                    //});

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
                                }

                                $rootScope.initializing = false;

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

                    //scope.$watch('visibleObjects.components', function(val) {
                    //    console.log('visible objects', val);
                    //});

                    $element.bind('contextmenu', killContextMenu);

                    $element.keyup(function(e){
                        $timeout(function() {
                            scope.$emit('keyupOnDiagram', e);
                        });

                    });

                }

            };
        }
    ]);

},{"../componentWire/componentWire.js":7,"./classes/ComponentDragHandler":19,"./classes/ComponentSelectionHandler":20,"./classes/WireDrawHandler":21,"./classes/contextMenuHandler":22}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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

},{"../../services/symbolServices/symbolServices.js":48,"../port/port.js":16,"./box/box.js":24,"./capacitor/capacitor.js":25,"./diode/diode.js":27,"./inductor/inductor.js":28,"./jFetP/jFetP.js":29,"./opAmp/opAmp.js":30,"./resistor/resistor.js":31,"./simpleConnector/simpleConnector.js":32,"./tvsDiode/tvsDiode.js":33}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
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
},{}],32:[function(require,module,exports){
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
                width: 120,
                height: 15,
                ports: {
                    p1: {
                        id: 'p1',
                        wireAngle: 0,
                        wireLeadIn: 0,
                        label: '',
                        x: 117,
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

},{}],33:[function(require,module,exports){
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
                labelPrefix: 'D',
                labelPosition: {
                    x: 10,
                    y: -8
                },
                width: 75,
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
                        x: 75,
                        y: 7.5
                    } }
            });
        }
    ]);

},{}],34:[function(require,module,exports){
/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module('mms.testbenchActions', [
    'ngMaterial'
])
    .controller('TestbenchActionsController', function ($scope, $rootScope, $mdDialog, $mdToast, $timeout, testBenchService, $log) {

        var progressMessage,
            tooltipMessage,
            progressTooltipMessage,

            findResultById;

        tooltipMessage = 'Generate PCB';
        progressTooltipMessage = 'PCB generation in progress...';
        progressMessage = 'PCB generation in progress. It will take a couple of minutes...';

        findResultById = function (id) {

            var result;

            angular.forEach($scope.testbenchResults, function (aResult) {

                if (aResult.id === id) {
                    result = aResult;
                }

            });

            return result;

        };

        $scope.testbenchResults = [
            //
            //{
            //
            //    id: 'testPCBResult1',
            //    name: 'Generated PCB 1',
            //    timestamp: Date.now(),
            //    visualUrl: 'images/testPCBResult.png',
            //    attachments: [
            //        {
            //            name: 'Download Eagle file',
            //            url: 'http://google.com'
            //        }
            //    ],
            //    status: 'SUCCESS'
            //
            //
            //},
            //
            //{
            //
            //    id: 'testPCBResult2',
            //    name: 'Generated PCB 2',
            //    timestamp: Date.now(),
            //    visualUrl: 'images/testPCBResult.png',
            //    attachments: [
            //        {
            //            name: 'Download Eagle file',
            //            url: 'http://google.com'
            //        }
            //    ],
            //    status: 'FAILURE'
            //
            //},
            //
            //{
            //
            //    id: 'testPCBResult3',
            //    name: 'Generated PCB 3',
            //    timestamp: Date.now(),
            //    visualUrl: 'images/testPCBResult.png',
            //    attachments: [
            //        {
            //            name: 'Download Eagle file',
            //            url: 'http://google.com'
            //        }
            //    ],
            //    status: 'FAILURE'
            //
            //}
            //

        ];

        $scope.setBusy = function () {

            $scope.busy = true;
            $scope.tooltipMessage = progressTooltipMessage;

        };

        $scope.setReady = function () {

            $scope.busy = false;
            $scope.tooltipMessage = tooltipMessage;

        };

        $scope.showResults = function (id, ev) {

            var result;

            function ShowResultsDialogController($scope, $mdDialog, results, currentResult) {

                $scope.results = results;
                $scope.state = {
                    currentResult: currentResult
                };

                $scope.selectedIndex = results.indexOf(currentResult);

                $scope.setSelected = function (index) {

                    $scope.selectedIndex = index;

                    $timeout(function () {
                        $scope.state.curretResult = results[index];
                        console.log(results[index]);
                    });

                };

                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.close = function () {
                    $mdDialog.hide();
                };
            }

            if (id !== undefined) {
                result = findResultById(id);
            } else {
                result = $scope.testbenchResults[0];
            }

            if (angular.isObject(result)) {


                $mdDialog.show({
                    controller: ShowResultsDialogController,
                    templateUrl: '/mmsApp/templates/testbenchResult.html',
                    locals: {
                        results: $scope.testbenchResults,
                        currentResult: result
                    },
                    targetEvent: ev
                })
                    .then(function () {
                    });
            }

        };

        $scope.startTestbench = function () {

            var onTestbenchFailed;

            onTestbenchFailed = function(e) {
                $log.error('Testbench execution failed!', e);
                $scope.testbenchResultNotify();
                $scope.setReady();
            };

            $scope.setBusy();

            $mdToast.show({
                    controller: 'TestbenchActionsToastController',
                    templateUrl: '/mmsApp/templates/testbenchToast.html',
                    locals: {
                        message: progressMessage
                    },
                    hideDelay: 5000
                }
            );

            testBenchService.runTestBench($rootScope.wsContext, $rootScope.activeTestbench.id)
                .then(function (resultData) {

                    var newResult,
                        visualUrl,
                        downloadUrl,
                        timestamp,
                        hash,
                        id;

                    if (resultData && resultData.success === true) {

                        $log.debug('testbench result', resultData);

                        hash = resultData.artifacts['all.zip'].hash;

                        visualUrl = '/rest/blob/view/' + hash + '/results/1x2_ara_module.png';
                        downloadUrl = '/rest/blob/download/' + hash + '/results/1x2_ara_module.brd';

                        timestamp = Date.now();
                        id = hash + '_' + timestamp;

                        newResult = {
                            id: id,
                            name: 'Generated PCB ' + ( $scope.testbenchResults.length + 1 ),
                            timestamp: timestamp,
                            visualUrl: visualUrl,
                            attachments: [
                                {
                                    name: 'Download Eagle File',
                                    url: downloadUrl
                                }
                            ],
                            status: 'SUCCESS'
                        };

                        $scope.testbenchResults.push(newResult);

                        $scope.testbenchResultNotify(id);
                        $scope.setReady();


                    } else {
                        onTestbenchFailed(resultData);
                    }

                }).
                catch(function (e) {
                    onTestbenchFailed(e);
                });

        };

        $scope.testbenchResultNotify = function (id) {

            var result,

                message,
                delay;

            result = findResultById(id);


            if (angular.isObject(result) && result.status === 'SUCCESS') {

                message = 'Generated PCB available.';
                delay = 0;


            } else {

                message = 'PCB generation errored.';
                delay = 0;

            }

            $mdToast.show({
                    controller: 'TestbenchResultToastController',
                    templateUrl: '/mmsApp/templates/testbenchResultToast.html',
                    locals: {
                        result: result,
                        message: message,
                        showAction: function (id, $event) {
                            $scope.showResults(id, $event);

                        }
                    },
                    hideDelay: delay
                }
            );

        };

        $scope.setReady();
//        $scope.showResults('testPCBResult1');
//        $scope.testbenchResultNotify('testPCBResult4');


    })
    .directive('testbenchActions', [
        function () {

            return {
                controller: 'TestbenchActionsController',
                restrict: 'E',
                scope: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/testbenchActions.html'
            };
        }])

    .controller('TestbenchResultToastController',
    function ($scope, $mdToast, message, result, showAction) {

        $scope.result = result;

        $scope.success = false;
        $scope.success = result && result.status === 'SUCCESS';

        $scope.progressMessage = message || 'Job execution has started...';


        $scope.closeToast = function () {
            $mdToast.hide();
        };

        $scope.showResult = function ($event) {

            $scope.closeToast();
            showAction(result.id, $event);

        };


    })
    .controller('TestbenchActionsToastController',
    function ($scope, $mdToast, message) {


        $scope.progressMessage = message || 'Job execution has started...';


        $scope.closeToast = function () {
            $mdToast.hide();
        };


    });


},{}],35:[function(require,module,exports){

},{}],36:[function(require,module,exports){
/*globals angular */

'use strict';

angular.module('mms.connectionHandling', [])
    .service('connectionHandling', function ($q, dataStoreService) {

        var mainConnectionId,
            mainConnectionEstablished,

            dataStorePromise;

        mainConnectionId = 'main-db-connection-id';
        mainConnectionEstablished = false;

        this.establishMainGMEConnection = function() {

            var deferred;

            deferred = $q.defer();

            if (!dataStorePromise && !mainConnectionEstablished) {

                dataStorePromise = dataStoreService.connectToDatabase(mainConnectionId, {
                    host: window.location.basename
                }).then(function () {

                    mainConnectionEstablished = true;

                    deferred.resolve();

                });

            } else {
                deferred.resolve();
            }

            return deferred.promise;

        };

        this.getMainGMEConnectionId = function(){
            return mainConnectionId;
        };

    });

},{}],37:[function(require,module,exports){
/*globals angular*/

'use strict';

var glMatrix = require('glMatrix');

var ComponentPort = function (descriptor) {

    angular.extend(this, descriptor);

};

ComponentPort.prototype.getGridPosition = function () {

    var position,
        positionVector,

        wireAngle,
        leadInTransformation,
        leadInVector;

    if (angular.isObject(this.portSymbol) && angular.isObject(this.parentComponent)) {

        positionVector = glMatrix.vec2.create();
        glMatrix.vec2.set(positionVector, this.portSymbol.x, this.portSymbol.y);

        glMatrix.vec2.transformMat3(positionVector, positionVector, this.parentComponent.getTransformationMatrix());

        position = {

            x: positionVector[0],
            y: positionVector[1]

        };

        if (this.portSymbol.wireLeadIn) {

            leadInVector = glMatrix.vec2.create();
            glMatrix.vec2.set(leadInVector, this.portSymbol.wireLeadIn, 0);

            leadInTransformation = glMatrix.mat2.create();

            if (isNaN(this.portSymbol.wireAngleRad)) {

                this.portSymbol.wireAngle = this.portSymbol.wireAngle || 0;
                this.portSymbol.wireAngleRad = this.portSymbol.wireAngle / 180 * Math.PI;

            }

            wireAngle = this.portSymbol.wireAngleRad;


            glMatrix.mat2.rotate(leadInTransformation, leadInTransformation, wireAngle);

            glMatrix.vec2.transformMat2(leadInVector, leadInVector, leadInTransformation);

            glMatrix.vec2.add(leadInVector, leadInVector, positionVector);

            position.leadInPosition = {

                x: leadInVector[0],
                y: leadInVector[1]

            };
        }

    }

    return position;

};

module.exports = ComponentPort;

},{"glMatrix":4}],38:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function (symbolManager, diagramService, wiringService) {

    var getDiagram,
        getDiagramElement,
        avmComponentModelParser,
        connectorParser,
        containerParser,
        labelParser,
        wireParser,

        Diagram,
        DiagramComponent,
        ComponentPort,
        Wire,

        minePortsFromInterfaces;



    Diagram = require('./Diagram');
    DiagramComponent = require('./DiagramComponent.js');
    ComponentPort = require('./ComponentPort');
    Wire = require('./Wire.js');

    minePortsFromInterfaces = function (element) {

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

                if (a.position.y > b.position.y) {
                    return 1;
                }

                if (a.position.y < b.position.y) {
                    return -1;
                }

                return 0;

            });

            median = (minX + maxX) / 2;

            angular.forEach(allInterConnectors, function (innerConnector) {

                var portSymbol;

                portSymbol = {
                    id: innerConnector.id,
                    label: labelParser(innerConnector.name)
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

            });
        }

        return {
            portDescriptors: portDescriptors,
            portInstances: portInstances
        };


    };


    labelParser = function (crappyName) {

        var result;

        result = crappyName.replace(/_/g, ' ');

        return result;

    };

    wireParser = function(element, diagram) {

        var sourcePort,
            destinationPort,
            wire;

        if (angular.isObject(element.details) && angular.isObject(diagram)) {

            sourcePort = diagram.portsById[element.details.sourceId];
            destinationPort = diagram.portsById[element.details.destinationId];

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

                if (angular.isArray(element.details.wireSegments) && element.details.wireSegments.length > 0) {

                    wire.segments = angular.copy(element.details.wireSegments);
                    wiringService.adjustWireEndSegments(wire);

                } else {

                    wiringService.routeWire(wire, 'ElbowRouter');

                }

            }
        }

        return wire;

    };

    connectorParser = function(element,  zIndex) {
        var portInstance,
            symbol,
            newDiagramComponent;

        symbol = symbolManager.getSymbol('simpleConnector');

        newDiagramComponent = new DiagramComponent({
            id: element.id,
            label: labelParser(element.name),
            x: element.position.x,
            y: element.position.y,
            z: zIndex,
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

        newDiagramComponent.registerPortInstances([portInstance]);

        return newDiagramComponent;

    };

    containerParser = function(element,  zIndex) {
        var symbol,
            newDiagramComponent,
            portStuff;

        zIndex = zIndex || 0;

        portStuff = minePortsFromInterfaces(element);

        symbol = symbolManager.makeBoxSymbol(element.name, {
                showPortLabels: true
            }, portStuff.portDescriptors,
            {
                minWidth: 200,
                portWireLeadInIncrement: 8
            });

        newDiagramComponent = new DiagramComponent({
            id: element.id,
            label: labelParser(element.name),
            x: element.position.x,
            y: element.position.y,
            z: zIndex,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            symbol: symbol,
            nonSelectable: false,
            locationLocked: false,
            draggable: true
        });

        newDiagramComponent.registerPortInstances(portStuff.portInstances);

        return newDiagramComponent;

    };

    avmComponentModelParser = function(element,  zIndex) {

        var portStuff,
            newModelComponent,
            symbol;

        zIndex = zIndex || 0;

        portStuff = minePortsFromInterfaces(element);

        if (angular.isString(element.name) &&
            element.name.charAt(0) === 'C' &&
            ( !isNaN(element.name.charAt(1)) ||
            element.name.charAt(1) === ' ' ||
            element.name.charAt(1) === '_')
        ) {

            // Cheap shot to figure if it is a capacitor

            symbol = symbolManager.getSymbol('capacitor');

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: zIndex,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
                }

            }

            newModelComponent.registerPortInstances(portStuff.portInstances);

        } else if (angular.isString(element.name) &&
            element.name.charAt(0) === 'L' &&
            ( !isNaN(element.name.charAt(1)) ||
            element.name.charAt(1) === ' ' ||
            element.name.charAt(1) === '_')
        ) {

            // Cheap shot to figure if it is a capacitor

            symbol = symbolManager.getSymbol('capacitor');

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: zIndex,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p1;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p2;
                }

            }

            newModelComponent.registerPortInstances(portStuff.portInstances);

        } else if (angular.isString(element.name) &&
            element.name.charAt(0) === 'R' &&
            ( !isNaN(element.name.charAt(1)) ||
            element.name.charAt(1) === ' ' ||
            element.name.charAt(1) === '_')
        ) {

            // Cheap shot to figure if it is a capacitor

            symbol = symbolManager.getSymbol('resistor');

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: zIndex,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p1;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p2;
                }

            }

            newModelComponent.registerPortInstances(portStuff.portInstances);

        } else if (angular.isString(element.name) &&
            element.name.charAt(0) === 'D' && !isNaN(element.name.charAt(1))
        ) {

            // Cheap shot to figure if it is a diode

            symbol = symbolManager.getSymbol('tvsDiode');

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: zIndex,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === '2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === '1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
                }

            }

            newModelComponent.registerPortInstances(portStuff.portInstances);

        } else {

            symbol = symbolManager.makeBoxSymbol(element.name, {
                    showPortLabels: true
                }, portStuff.portDescriptors,
                {
                    minWidth: 200,
                    portWireLeadInIncrement: 8
                });

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: zIndex,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            newModelComponent.registerPortInstances(portStuff.portInstances);

        }

        return newModelComponent;

    };


    getDiagram = function (diagramElements) {

        var i,
            newDiagramComponent,



            diagram,
            wire;


        diagram = new Diagram();

        if (angular.isObject(diagramElements)) {

            i = 0;

            diagram.config.width = 2500;
            diagram.config.height = 2500;

            angular.forEach(diagramElements.Connector, function (element) {

                newDiagramComponent = connectorParser(element,  i);

                diagram.addComponent(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.AVMComponentModel, function (element) {

                newDiagramComponent = avmComponentModelParser(element,  i);

                diagram.addComponent(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.Container, function (element) {

                newDiagramComponent = containerParser(element,  i);

                diagram.addComponent(newDiagramComponent);

                i++;

            });


            angular.forEach(diagramElements.ConnectorComposition, function (element) {

                wire = wireParser(element, diagram);

                diagram.addWire(wire);

            });

        }

        return diagram;

    };

    getDiagramElement = function(descriptor, zIndex, diagram) {

        var element;

        if (descriptor.baseName === 'AVMComponentModel') {

            element = avmComponentModelParser(descriptor, zIndex);

        } else if (descriptor.baseName === 'Connector') {

            element = avmComponentModelParser(descriptor, zIndex);

        } else if (descriptor.baseName === 'Container') {

            element = avmComponentModelParser(descriptor, zIndex);

        } else if (descriptor.baseName === 'ConnectorComposition') {

            element = wireParser(descriptor, diagram);

        }

        return element;


    };


    this.getDiagram = getDiagram;
    this.getDiagramElement = getDiagramElement;
};

},{"./ComponentPort":37,"./Diagram":39,"./DiagramComponent.js":40,"./Wire.js":42}],39:[function(require,module,exports){
/*globals angular*/

'use strict';

var Diagram = function (descriptor) {

    angular.extend(this, descriptor);

    this.components = [];
    this.componentsById = {};
    this.wires = [];
    this.wiresById = {};
    this.wiresByComponentId = {};
    this.portsById = {};

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

    var i,
        port;

    if (angular.isObject(aDiagramComponent) && !angular.isDefined(this.componentsById[aDiagramComponent.id])) {

        this.componentsById[aDiagramComponent.id] = aDiagramComponent;
        this.components.push(aDiagramComponent);

        for (i = 0; i < aDiagramComponent.portInstances.length; i++) {

            port = aDiagramComponent.portInstances[i];
            this.portsById[port.id] = port;

        }
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

Diagram.prototype.deleteWireById = function(anId) {

    var wire,
        self,
        componentId,
        index;

    self = this;

    wire = self.wiresById[anId];

    if (angular.isObject(wire)) {

        componentId = wire.end1.component.id;

        self.wiresByComponentId[componentId] = self.wiresByComponentId[componentId] || [];

        index = self.wiresByComponentId[componentId].indexOf(wire);

        if (index >  -1) {
            self.wiresByComponentId[componentId].splice(index,1);
        }

        componentId = wire.end2.component.id;

        self.wiresByComponentId[componentId] = self.wiresByComponentId[componentId] || [];

        index = self.wiresByComponentId[componentId].indexOf(wire);

        if (index >  -1) {
            self.wiresByComponentId[componentId].splice(index,1);
        }

        index = self.wires.indexOf(wire);
        self.wires.splice(index, 1);

        delete self.wiresById[wire.id];

    }

};

Diagram.prototype.deleteComponentById = function(anId) {

    var i,
        index,
        self,
        component;

    self = this;

    component = this.componentsById[anId];

    if (angular.isObject(component)) {


        angular.forEach(self.wiresByComponentId[component.id], function(wire) {
            self.deleteWireById(wire.id);
        });

        index = self.state.selectedComponentIds.indexOf(component.id);

        if (index > -1) {
            self.state.selectedComponentIds.splice(index, 1);
        }

        index = self.components.indexOf(component);
        self.components.splice(index, 1);

        delete self.wiresByComponentId[component.id];
        delete self.componentsById[component.id];

        for (i = 0; i < component.portInstances.length; i++) {
            delete this.portsById[component.portInstances[i].id];
        }

        component = null;

    }

};

Diagram.prototype.deleteComponentOrWireById = function(anId) {

    var self,
        element,
        success;

    self = this;

    success = false;

    element = self.componentsById[anId];

    if (angular.isObject(element)) {

        self.deleteComponentById(element.id);
        success = true;

    } else {

        element = self.wiresById[anId];

        if (angular.isObject(element)) {

            self.deleteWireById(element.id);
            success = true;

        }

    }

    return success;

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

Diagram.prototype.updateComponentPosition = function (componentId, newPosition) {

    var self = this,
        component;

        component = self.componentsById[componentId];

        if (angular.isObject(component)) {

            component.setPosition(newPosition.x, newPosition.y);

        }

};

Diagram.prototype.updateComponentRotation = function (componentId, newRotation) {

    var self = this,
        component;

    component = self.componentsById[componentId];

    if (angular.isObject(component)) {

        component.setRotation(newRotation);

    }

};

Diagram.prototype.isComponentSelected = function (component) {

    return this.state.selectedComponentIds.indexOf(component.id) > -1;

};

Diagram.prototype.getSelectedComponents = function () {

    var self,
        selectedComponents;

    self = this;
    selectedComponents = [];

    angular.forEach(this.state.selectedComponentIds, function(componentId){

        selectedComponents.push(self.componentsById[componentId]);

    });

    return selectedComponents;

};


module.exports = Diagram;

},{}],40:[function(require,module,exports){
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

DiagramComponent.prototype.setRotation = function ( newRotation ) {

    if ( angular.isNumber( newRotation ) ) {

        this.rotation = newRotation;

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
},{"glMatrix":4}],41:[function(require,module,exports){
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

},{"./ComponentPort":37,"./Diagram":39,"./DiagramComponent.js":40,"./Wire.js":42}],42:[function(require,module,exports){
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

    if ( this.router && this.router.type === 'ElbowRouter' ) {

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

},{}],43:[function(require,module,exports){
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

            this.updateComponentsAndItsWiresPosition = function( diagramId, componentId, newPosition) {

                var diagram,
                    setOfWires;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.updateComponentPosition(componentId, newPosition);

                    setOfWires = diagram.wiresByComponentId[componentId];

                    angular.forEach( setOfWires, function ( wire ) {

                        wiringService.adjustWireEndSegments( wire );

                    } );


                }

            };

            this.updateComponentsAndItsWiresRotation = function( diagramId, componentId, newRotation) {

                var diagram,
                    setOfWires;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.updateComponentRotation(componentId, newRotation);

                    setOfWires = diagram.wiresByComponentId[componentId];

                    angular.forEach( setOfWires, function ( wire ) {

                        wiringService.adjustWireEndSegments( wire );

                    } );


                }

            };

            this.updateWireSegments = function( diagramId, wireId, newSegments) {

                var diagram,
                    wire;

                console.log(newSegments);

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    wire = diagram.wiresById[wireId];

                    if (angular.isObject(wire)) {

                        wire.segments = newSegments;

                    }

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

                var diagram,
                    wires;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    wires = diagram.getWiresForComponents(components);

                }

                return wires || [];

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

            this.createNewComponentFromFromCyPhyElement = function(diagramId, diagramElementDescriptor) {

                var diagram,
                    newDiagramStuff;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram) && angular.isObject(diagramElementDescriptor)) {

                    newDiagramStuff = cyPhyDiagramParser.getDiagramElement(
                        diagramElementDescriptor,
                        self.getHighestZ() + 1,
                        diagram
                    );

                    if (diagramElementDescriptor.baseName === 'ConnectorComposition') {
                        diagram.addWire(newDiagramStuff);
                    } else {
                        diagram.addComponent(newDiagramStuff);
                    }


                }

                return newDiagramStuff;

            };

            this.getDiagram = function (diagramId) {

                var diagram;

                if (diagramId) {

                    diagram = diagrams[diagramId];

                }

                return diagram;

            };

            this.deleteComponentOrWireById = function(diagramId, elementId) {

                var diagram,
                    result;

                result = false;

                diagram = diagrams[diagramId];

                if (diagram) {

                    result = diagram.deleteComponentOrWireById(elementId);

                }

                return result;

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

},{"./classes/ComponentPort":37,"./classes/CyPhyDiagramParser.js":38,"./classes/DiagramComponent.js":40,"./classes/DummyDiagramGenerator.js":41,"./classes/Wire.js":42}],44:[function(require,module,exports){
/*globals angular*/

'use strict';

var gridServicesModule = angular.module(
    'mms.designVisualization.gridService', [] );

gridServicesModule.service( 'gridService', [ '$log', '$rootScope', '$timeout',
    function ( $log, $rootScope, $timeout ) {

        var self = this,

            gridSize,

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

        gridSize = 10;

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
                        $log.debug('Had to kill recalculateVisibleDiagramComponents');
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

        this.invalidateVisibleDiagramComponents = function ( gridId, hard ) {

            var grid;

            grid = grids[ gridId ];

            if ( angular.isDefined( grid ) ) {

                if (hard === true) {

                    grid.visibleWires = [];
                    grid.visibleDiagramComponents = [];

                    $timeout(function(){

                        recalculateVisibleDiagramComponents(grid);

                    });

                } else {

                    if (!grid.insideVisibleDiagramComponentsRecalculate) {

                        recalculateVisibleDiagramComponents(grid);

                    }
                }
            }

        };


        this.createGrid = function ( id, diagram ) {

            var grid;


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

            return grid;
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

        this.getViewPortCenter = function ( gridId ) {

            var grid,
                center;

                grid = grids[ gridId ];

            if ( angular.isDefined( grid ) && angular.isObject(grid.viewPort) ) {

                center = {

                    x: (grid.viewPort.left + grid.viewPort.right) / 2,
                    y: (grid.viewPort.top + grid.viewPort.bottom) / 2

                };
            }

            return center;

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

        this.getSnappedPosition = function(position) {

            var x,
                y;

            if ($rootScope.snapToGrid !== true) {
                return position;
            }

            x = 0;
            y = 0;

            if (isNaN(gridSize)) {
                gridSize  = 1;
            }

            if (angular.isObject(position)) {

                x = position.x || 0;
                y = position.y || 0;

                x = ( Math.round( x / gridSize ) * gridSize );
                y = ( Math.round( y / gridSize ) * gridSize );

                console.log(gridSize, x, y);

            }

            return {
                x: x,
                y: y
            };

        };

    }
] );

},{}],45:[function(require,module,exports){
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
},{}],46:[function(require,module,exports){
/*globals angular */

'use strict';

angular.module('mms.projectHandling', [])
    .service('projectHandling', function ($q, $log, branchService, connectionHandling, $http) {

        var randomString;

        randomString = function(length) {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

            if (! length) {
                length = Math.floor(Math.random() * chars.length);
            }

            var str = '';
            for (var i = 0; i < length; i++) {
                str += chars[Math.floor(Math.random() * chars.length)];
            }
            return str;
        };

        this.copyProject = function () {
            return $http.get('/rest/external/copyproject/noredirect');

        };

        this.cloneMaster = function () {

            var deferred,
                connectionId;

            deferred = $q.defer();

            connectionHandling.establishMainGMEConnection()
                .then(function () {

                    connectionId = connectionHandling.getMainGMEConnectionId();

                    branchService.getBranches(connectionId)
                        .then(function (branches) {

                            var newBranchId,
                                hashId,
                                i;

                            $log.debug('Available branches', branches);

                            if (!branches.length) {

                                $log.error('No branches, what now?');
                                deferred.reject();

                            } else {

                                for (i=0; i < branches.length; i++) {

                                    if (branches[i].name === 'master') {
                                        hashId = branches[i].commitId;
                                    }
                                }

                                if (!hashId) {
                                    deferred.reject('Could not find master branch!');
                                }

                                newBranchId = randomString(6) + (new Date()).getTime();

                                branchService.createBranch(
                                    connectionId,
                                    newBranchId,
                                    hashId
                                )
                                    .then(function () {
                                        deferred.resolve(newBranchId);
                                    })
                                    .catch(function (err) {
                                        deferred.reject(err);
                                    });


                            }

                        })
                        .catch(function (error) {
                            deferred.reject(error);
                        });

                });

            return deferred.promise;

        };

        this.findFirstBranch = function () {

            var deferred,
                connectionId;

            deferred = $q.defer();

            connectionId = connectionHandling.getMainGMEConnectionId();

            branchService.getBranches(connectionId)
                .then(function (branches) {

                    $log.debug('Available branches', branches);

                    if (!branches.length) {

                        $log.error('No branches, what now?');
                        deferred.reject();

                    } else {

                        deferred.resolve(branches[0].name);

                    }

                });

            return deferred.promise;

        };


    });

},{}],47:[function(require,module,exports){
/*globals angular*/
'use strict';

module.exports = function() {
    var keywordsBySymbols,
        symbolsByKeywords;

    keywordsBySymbols = {
        'capacitor': [
            'capacitors',
            'c'
        ],
        'resistors': [
            'resistors',
            'r'
        ],
        'diodes': [
            'diodes',
            'led'
        ],
        'inductors': [
            'inductors',
            'l'
        ],
        'transistors': [
            'jFetP'
        ]
    };

    symbolsByKeywords = {};

    angular.forEach(keywordsBySymbols, function(symbol, keywords){

        angular.forEach(keywords, function(keyword) {

            symbolsByKeywords[ keyword ] = symbol;

        });

    });

    return symbolsByKeywords;
};

},{}],48:[function(require,module,exports){
/*globals angular*/

'use strict';

var symbolServicesModule = angular.module(
    'mms.designVisualization.symbolServices', [] ),

    symbolTypesSearchIndex = require('./classes/SymbolTypesSearchIndex')();



symbolServicesModule.provider( 'symbolManager', function SymbolManagerProvider() {
    var provider = this,
        availableSymbols = {},

        portCreator,
        spreadPortsAlongSide,

        portHorizontalTranslation;


    spreadPortsAlongSide = function (somePorts, side, width, height, parameters) {

        var offset,
            increment,

            i,
            aPort,

            numberOfPorts,
            wireLeadIn;

        numberOfPorts = somePorts.length;

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

        portHorizontalTranslation = parameters.portWireLength + parameters.portLabelHorizontalPadding;

        wireLeadIn = 0;

        for (i=0; i < numberOfPorts; i++) {

            aPort = somePorts[i];

            if (i < numberOfPorts) {
                wireLeadIn += parameters.portWireLeadInIncrement;
            } else {
                wireLeadIn -= parameters.portWireLeadInIncrement;
            }

            switch (side) {

                case 'top':
                    aPort.x = offset;
                    aPort.y = 0;
                    aPort.wireAngle = -90;
                    aPort.cssClass = 'top';
                    aPort.labelPosition = {
                        x: 0,
                        y: 0
                    };

                    offset += increment;

                    break;

                case 'right':
                    aPort.x = width;
                    aPort.y = offset;
                    aPort.wireAngle = 0;
                    aPort.cssClass = 'right';
                    aPort.labelPosition = {
                        x: -portHorizontalTranslation,
                        y: parameters.portLabelVerticalPadding
                    };


                    offset += increment;

                    break;

                case 'bottom':
                    aPort.x = offset;
                    aPort.y = height;
                    aPort.wireAngle = 90;
                    aPort.cssClass = 'bottom';
                    aPort.labelPosition = {
                        x: 0,
                        y: 0
                    };

                    offset += increment;

                    break;

                case 'left':
                    aPort.x = 0;
                    aPort.y = offset;
                    aPort.wireAngle = 180;
                    aPort.cssClass = 'left';
                    aPort.labelPosition = {
                        x: portHorizontalTranslation,
                        y: parameters.portLabelVerticalPadding
                    };


                    offset += increment;

                    break;

            }

            aPort.wireLeadIn = wireLeadIn;

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
            topPortPadding: 25,
            bottomPortPadding: 0,
            portLabelHorizontalPadding: 5,
            portLabelVerticalPadding: 3,
            minWidth: 140,
            minHeight: 80,
            justifyPorts: false,
            portWireLeadInIncrement: 0

        }, givenParameters || {});

        if (angular.isObject(descriptor) && type) {

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


        }

        return symbol;
    };


    this.$get = [

        function () {

            var SymbolManager;

            SymbolManager = function () {

                var self;

                self = this;

                this.registerSymbol = provider.registerSymbol;

                this.makeBoxSymbol = provider.makeBoxSymbol;

                this.getAvailableSymbols = function () {
                    return availableSymbols;
                };

                this.getSymbol = function ( symbolType ) {
                    return availableSymbols[ symbolType ];
                };

                this.getAccurateSymbolType = function ( approximateName ) {

                    return symbolTypesSearchIndex[approximateName.toLowerCase()];

                };


            };

            return new SymbolManager();

        }
    ];
} );

},{"./classes/SymbolTypesSearchIndex":47}],49:[function(require,module,exports){
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
                        x: point2.x,
                        y: point1.y
                    };

                }

                segments.push( {

                    type: 'line',

                    x1: point1.x,
                    y1: point1.y,

                    x2: elbow.x,
                    y2: elbow.y,

                    router: {
                        type: self.name,
                        params: method
                    },

                    orientation: ( method === 'verticalFirst' ) ? 'vertical' : 'horizontal'

                }, {

                    type: 'line',

                    x1: elbow.x,
                    y1: elbow.y,

                    x2: point2.x,
                    y2: point2.y,

                    router: {
                        type: self.name,
                        params: method
                    },

                    orientation: ( method === 'verticalFirst' ) ? 'horizontal' : 'vertical'

                } );

            }

        }

        return segments;

    };

};

module.exports = ElbowRouter;
},{}],50:[function(require,module,exports){
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

                    router: {
                        type: 'SimpleRouter'
                    },

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
},{}],51:[function(require,module,exports){
/*globals angular*/

'use strict';

var wiringServicesModule = angular.module(
    'mms.designVisualization.wiringService', []);

wiringServicesModule.service('wiringService', ['$log', '$rootScope', '$timeout',
    function () {

        var self = this,
            SimpleRouter = require('./classes/SimpleRouter.js'),
            ElbowRouter = require('./classes/ElbowRouter.js'),
            routers = {

                SimpleRouter: new SimpleRouter(),
                ElbowRouter: new ElbowRouter()

            };

        this.getRouterTypes = function () {

            return [

                {
                    id: 'elbowHorizontal',
                    label: 'Elbow - horizontal first',
                    type: 'ElbowRouter',
                    params: 'horizontalFirst'
                },

                {
                    id: 'elbowVertical',
                    label: 'Elbow - vertical first',
                    type: 'ElbowRouter',
                    params: 'verticalFirst'
                },

                {
                    id: 'simpleRouter',
                    label: 'Straight wire',
                    type: 'SimpleRouter'
                }


            ];

        };

        this.getSegmentsBetweenPositions = function (endPositions, routerType, params) {

            var segments,
                router;

            router = routers[routerType] || 'SimpleRouter';

            if (angular.isObject(router) && angular.isFunction(router.makeSegments)) {
                segments = router.makeSegments(
                    [endPositions.end1, endPositions.end2],
                    params
                );
            }

            return segments;

        };

        this.routeWire = function (wire, routerType, params, ignoreLeadIn) {

            var router,
                simpleRouter,
                elbowRouter,

                endPositions,
                p1,
                p2,
                s1, s2, s3;


            simpleRouter = routers.SimpleRouter;
            elbowRouter = routers.ElbowRouter;

            router = routers[routerType] || simpleRouter;

            if (angular.isObject(router) && angular.isFunction(router.makeSegments)) {

                endPositions = wire.getEndPositions();

                if (endPositions) {

                    s1 = [];
                    s2 = [];
                    s3 = [];

                    if (endPositions.end1.leadInPosition && !ignoreLeadIn) {

                        s1 = elbowRouter.makeSegments([
                            endPositions.end1,
                            endPositions.end1.leadInPosition
                        ]);

                        p1 = endPositions.end1.leadInPosition;

                    } else {
                        p1 = endPositions.end1;
                    }


                    if (endPositions.end2.leadInPosition && !ignoreLeadIn) {

                        s3 = elbowRouter.makeSegments([
                            endPositions.end2.leadInPosition,
                            endPositions.end2
                        ]);

                        p2 = endPositions.end2.leadInPosition;

                    } else {
                        p2 = endPositions.end2;
                    }

                    s2 = router.makeSegments([
                        p1,
                        p2
                    ], params);


                    wire.segments = s1.concat(s2).concat(s3);

                }

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

                if (firstSegment.router && firstSegment.router.type === 'ElbowRouter') {

                    secondSegment = wire.segments[1];

                    pos = {
                        x: secondSegment.x2,
                        y: secondSegment.y2
                    };

                    wire.segments.splice(0, 2);

                } else {

                    // SimpleRouter

                    pos = {
                        x: firstSegment.x2,
                        y: firstSegment.y2
                    };

                    wire.segments.splice(0, 1);
                }

                newSegments = self.getSegmentsBetweenPositions({
                    end1: endPositions.end1,
                    end2: pos
                }, firstSegment.router.type, firstSegment.router.params);

                wire.segments = newSegments.concat(wire.segments);

                lastSegment = wire.segments[wire.segments.length - 1];

                if (lastSegment.router && lastSegment.router.type === 'ElbowRouter') {

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

                    wire.segments.splice(wire.segments.length - 1, 1);
                }

                newSegments = self.getSegmentsBetweenPositions({
                    end1: pos,
                    end2: endPositions.end2
                }, lastSegment.router.type, lastSegment.router.params);

                wire.segments = wire.segments.concat(newSegments);

            } else {

                //Simple-routing

                self.routeWire(wire, null, null, true);
            }

        };

    }
]);

},{"./classes/ElbowRouter.js":49,"./classes/SimpleRouter.js":50}],52:[function(require,module,exports){
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


//# sourceMappingURL=mmsApp-app.js.map