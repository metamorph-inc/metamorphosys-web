(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */
// External dependencies
require('../../bower_components/ng-file-upload/angular-file-upload-shim');
require('../../bower_components/ng-file-upload/angular-file-upload');
//require('../../bower_components/angular-animate/angular-animate.min');
require('../../bower_components/angular-growl/build/angular-growl.min');

// Internal dependencies
require('./services/cyphy-services');

angular.module('cyphy.components', [
    'cyphy.services',
    'cyphy.components.templates',
    'angularFileUpload',
//    'ngAnimate',
    'angular-growl'
]).config(['growlProvider', function (growlProvider) {
    growlProvider.globalTimeToLive({success: 5000, error: -1, warning: 20000, info: 5000});
}]);

require('./SimpleModal/SimpleModal');
require('./WorkspaceList/WorkspaceList');

require('./ComponentDetails/ComponentDetails');
require('./ComponentList/ComponentList');

require('./DesignDetails/DesignDetails');
require('./DesignList/DesignList');
require('./DesignTree/DesignTree');

require('./TestBenchDetails/TestBenchDetails');
require('./TestBenchList/TestBenchList');


},{"../../bower_components/angular-growl/build/angular-growl.min":2,"../../bower_components/ng-file-upload/angular-file-upload":4,"../../bower_components/ng-file-upload/angular-file-upload-shim":3,"./ComponentDetails/ComponentDetails":5,"./ComponentList/ComponentList":6,"./DesignDetails/DesignDetails":7,"./DesignList/DesignList":8,"./DesignTree/DesignTree":9,"./SimpleModal/SimpleModal":10,"./TestBenchDetails/TestBenchDetails":11,"./TestBenchList/TestBenchList":12,"./WorkspaceList/WorkspaceList":13,"./services/cyphy-services":21}],2:[function(require,module,exports){
/**
 * angular-growl-v2 - v0.7.0 - 2014-08-10
 * http://janstevens.github.io/angular-growl-2
 * Copyright (c) 2014 Marco Rinck,Jan Stevens; Licensed MIT
 */
angular.module("angular-growl",[]),angular.module("angular-growl").directive("growl",["$rootScope","$sce",function(a,b){"use strict";return{restrict:"A",templateUrl:"templates/growl/growl.html",replace:!1,scope:{reference:"@",inline:"@",limitMessages:"="},controller:["$scope","$timeout","growl",function(c,d,e){function f(a){d(function(){var f,h;if(!g||(angular.forEach(c.messages,function(c){h=b.getTrustedHtml(c.text),a.text===h&&a.severity===c.severity&&c.title===c.title&&(f=!0)}),!f)){if(a.text=b.trustAsHtml(String(a.text)),a.ttl&&-1!==a.ttl&&(a.countdown=a.ttl/1e3,a.promises=[],a.close=!1,a.countdownFunction=function(){a.countdown>1?(a.countdown--,a.promises.push(d(a.countdownFunction,1e3))):a.countdown--}),angular.isDefined(c.limitMessages)){var i=c.messages.length-(c.limitMessages-1);i>0&&c.messages.splice(c.limitMessages-1,i)}e.reverseOrder()?c.messages.unshift(a):c.messages.push(a),a.ttl&&-1!==a.ttl&&(a.promises.push(d(function(){c.deleteMessage(a)},a.ttl)),a.promises.push(d(a.countdownFunction,1e3)))}},!0)}var g=e.onlyUnique();c.messages=[];var h=c.reference||0;c.inlineMessage=c.inline||e.inlineMessages(),a.$on("growlMessage",function(a,b){parseInt(h,10)===parseInt(b.referenceId,10)&&f(b)}),c.deleteMessage=function(a){var b=c.messages.indexOf(a);b>-1&&c.messages.splice(b,1)},c.stopTimeoutClose=function(a){angular.forEach(a.promises,function(a){d.cancel(a)}),a.close?c.deleteMessage(a):a.close=!0},c.alertClasses=function(a){return{"alert-success":"success"===a.severity,"alert-error":"error"===a.severity,"alert-danger":"error"===a.severity,"alert-info":"info"===a.severity,"alert-warning":"warning"===a.severity,icon:a.disableIcons===!1,"alert-dismissable":!a.disableCloseButton}},c.showCountDown=function(a){return!a.disableCountDown&&a.ttl>0},c.wrapperClasses=function(){var a={};return a["growl-fixed"]=!c.inlineMessage,a[e.position()]=!0,a},c.computeTitle=function(a){var b={success:"Success",error:"Error",info:"Information",warn:"Warning"};return b[a.severity]}}]}}]),angular.module("angular-growl").run(["$templateCache",function(a){"use strict";void 0===a.get("templates/growl/growl.html")&&a.put("templates/growl/growl.html",'<div class="growl-container" ng-class="wrapperClasses()"><div class="growl-item alert" ng-repeat="message in messages" ng-class="alertClasses(message)" ng-click="stopTimeoutClose(message)"><button type="button" class="close" data-dismiss="alert" aria-hidden="true" ng-click="deleteMessage(message)" ng-show="!message.disableCloseButton">&times;</button><button type="button" class="close" aria-hidden="true" ng-show="showCountDown(message)">{{message.countdown}}</button><h4 class="growl-title" ng-show="message.title" ng-bind="message.title"></h4><div class="growl-message" ng-bind-html="message.text"></div></div></div>')}]),angular.module("angular-growl").provider("growl",function(){"use strict";var a={success:null,error:null,warning:null,info:null},b="messages",c="text",d="title",e="severity",f=!0,g="variables",h=0,i=!1,j="top-right",k=!1,l=!1,m=!1,n=!1;this.globalTimeToLive=function(b){if("object"==typeof b)for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);else for(var d in a)a.hasOwnProperty(d)&&(a[d]=b)},this.globalDisableCloseButton=function(a){k=a},this.globalDisableIcons=function(a){l=a},this.globalReversedOrder=function(a){m=a},this.globalDisableCountDown=function(a){n=a},this.messageVariableKey=function(a){g=a},this.globalInlineMessages=function(a){i=a},this.globalPosition=function(a){j=a},this.messagesKey=function(a){b=a},this.messageTextKey=function(a){c=a},this.messageTitleKey=function(a){d=a},this.messageSeverityKey=function(a){e=a},this.onlyUniqueMessages=function(a){f=a},this.serverMessagesInterceptor=["$q","growl",function(a,c){function d(a){a.data[b]&&a.data[b].length>0&&c.addServerMessages(a.data[b])}return{response:function(a){return d(a),a},responseError:function(b){return d(b),a.reject(b)}}}],this.$get=["$rootScope","$interpolate","$filter",function(b,o,p){function q(a){if(B)a.text=B(a.text,a.variables);else{var c=o(a.text);a.text=c(a.variables)}b.$broadcast("growlMessage",a)}function r(b,c,d){var e,f=c||{};e={text:b,title:f.title,severity:d,ttl:f.ttl||a[d],variables:f.variables||{},disableCloseButton:void 0===f.disableCloseButton?k:f.disableCloseButton,disableIcons:void 0===f.disableIcons?l:f.disableIcons,disableCountDown:void 0===f.disableCountDown?n:f.disableCountDown,position:f.position||j,referenceId:f.referenceId||h},q(e)}function s(a,b){r(a,b,"warning")}function t(a,b){r(a,b,"error")}function u(a,b){r(a,b,"info")}function v(a,b){r(a,b,"success")}function w(a){var b,f,h,i;for(i=a.length,b=0;i>b;b++)if(f=a[b],f[c]){h=f[e]||"error";var j={};j.variables=f[g]||{},j.title=f[d],r(f[c],j,h)}}function x(){return f}function y(){return m}function z(){return i}function A(){return j}var B;try{B=p("translate")}catch(C){}return{warning:s,error:t,info:u,success:v,addServerMessages:w,onlyUnique:x,reverseOrder:y,inlineMessages:z,position:A}}]});
},{}],3:[function(require,module,exports){
/**!
 * AngularJS file upload shim for HTML5 FormData
 * @author  Danial  <danial.farid@gmail.com>
 * @version 1.6.12
 */
(function() {

var hasFlash = function() {
	try {
	  var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	  if (fo) return true;
	} catch(e) {
	  if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) return true;
	}
	return false;
}

var patchXHR = function(fnName, newFn) {
	window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
};

if (window.XMLHttpRequest) {
	if (window.FormData && (!window.FileAPI || !FileAPI.forceLoad)) {
		// allow access to Angular XHR private field: https://github.com/angular/angular.js/issues/1934
		patchXHR('setRequestHeader', function(orig) {
			return function(header, value) {
				if (header === '__setXHR_') {
					var val = value(this);
					// fix for angular < 1.2.0
					if (val instanceof Function) {
						val(this);
					}
				} else {
					orig.apply(this, arguments);
				}
			}
		});
	} else {
		var initializeUploadListener = function(xhr) {
			if (!xhr.__listeners) {
				if (!xhr.upload) xhr.upload = {};
				xhr.__listeners = [];
				var origAddEventListener = xhr.upload.addEventListener;
				xhr.upload.addEventListener = function(t, fn, b) {
					xhr.__listeners[t] = fn;
					origAddEventListener && origAddEventListener.apply(this, arguments);
				};
			}
		}
		
		patchXHR('open', function(orig) {
			return function(m, url, b) {
				initializeUploadListener(this);
				this.__url = url;
				try {
					orig.apply(this, [m, url, b]);
				} catch (e) {
					if (e.message.indexOf('Access is denied') > -1) {
						orig.apply(this, [m, '_fix_for_ie_crossdomain__', b]);
					}
				}
			}
		});

		patchXHR('getResponseHeader', function(orig) {
			return function(h) {
				return this.__fileApiXHR && this.__fileApiXHR.getResponseHeader ? this.__fileApiXHR.getResponseHeader(h) : (orig == null ? null : orig.apply(this, [h]));
			};
		});

		patchXHR('getAllResponseHeaders', function(orig) {
			return function() {
				return this.__fileApiXHR && this.__fileApiXHR.getAllResponseHeaders ? this.__fileApiXHR.getAllResponseHeaders() : (orig == null ? null : orig.apply(this));
			}
		});

		patchXHR('abort', function(orig) {
			return function() {
				return this.__fileApiXHR && this.__fileApiXHR.abort ? this.__fileApiXHR.abort() : (orig == null ? null : orig.apply(this));
			}
		});

		patchXHR('setRequestHeader', function(orig) {
			return function(header, value) {
				if (header === '__setXHR_') {
					initializeUploadListener(this);
					var val = value(this);
					// fix for angular < 1.2.0
					if (val instanceof Function) {
						val(this);
					}
				} else {
					this.__requestHeaders = this.__requestHeaders || {};
					this.__requestHeaders[header] = value;
					orig.apply(this, arguments);
				}
			}
		});

		patchXHR('send', function(orig) {
			return function() {
				var xhr = this;
				if (arguments[0] && arguments[0].__isShim) {
					var formData = arguments[0];
					var config = {
						url: xhr.__url,
						jsonp: false, //removes the callback form param
						cache: true, //removes the ?fileapiXXX in the url
						complete: function(err, fileApiXHR) {
							xhr.__completed = true;
							if (!err && xhr.__listeners['load']) 
								xhr.__listeners['load']({type: 'load', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
							if (!err && xhr.__listeners['loadend']) 
								xhr.__listeners['loadend']({type: 'loadend', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
							if (err === 'abort' && xhr.__listeners['abort']) 
								xhr.__listeners['abort']({type: 'abort', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
							if (fileApiXHR.status !== undefined) Object.defineProperty(xhr, 'status', {get: function() {return (fileApiXHR.status == 0 && err && err !== 'abort') ? 500 : fileApiXHR.status}});
							if (fileApiXHR.statusText !== undefined) Object.defineProperty(xhr, 'statusText', {get: function() {return fileApiXHR.statusText}});
							Object.defineProperty(xhr, 'readyState', {get: function() {return 4}});
							if (fileApiXHR.response !== undefined) Object.defineProperty(xhr, 'response', {get: function() {return fileApiXHR.response}});
							var resp = fileApiXHR.responseText || (err && fileApiXHR.status == 0 && err !== 'abort' ? err : undefined);
							Object.defineProperty(xhr, 'responseText', {get: function() {return resp}});
							Object.defineProperty(xhr, 'response', {get: function() {return resp}});
							if (err) Object.defineProperty(xhr, 'err', {get: function() {return err}});
							xhr.__fileApiXHR = fileApiXHR;
							if (xhr.onreadystatechange) xhr.onreadystatechange();
						},
						fileprogress: function(e) {
							e.target = xhr;
							xhr.__listeners['progress'] && xhr.__listeners['progress'](e);
							xhr.__total = e.total;
							xhr.__loaded = e.loaded;
							if (e.total === e.loaded) {
								// fix flash issue that doesn't call complete if there is no response text from the server  
								var _this = this
								setTimeout(function() {
									if (!xhr.__completed) {
										xhr.getAllResponseHeaders = function(){};
										_this.complete(null, {status: 204, statusText: 'No Content'});
									}
								}, 10000);
							}
						},
						headers: xhr.__requestHeaders
					}
					config.data = {};
					config.files = {}
					for (var i = 0; i < formData.data.length; i++) {
						var item = formData.data[i];
						if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
							config.files[item.key] = item.val;
						} else {
							config.data[item.key] = item.val;
						}
					}

					setTimeout(function() {
						if (!hasFlash()) {
							throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
						}
						xhr.__fileApiXHR = FileAPI.upload(config);
					}, 1);
				} else {
					orig.apply(xhr, arguments);
				}
			}
		});
	}
	window.XMLHttpRequest.__isShim = true;
}

if (!window.FormData || (window.FileAPI && FileAPI.forceLoad)) {
	var addFlash = function(elem) {
		if (!hasFlash()) {
			throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
		}
		var el = angular.element(elem);
		if (!el.attr('disabled')) {
			if (!el.hasClass('js-fileapi-wrapper') && (elem.getAttribute('ng-file-select') != null || elem.getAttribute('data-ng-file-select') != null)) {
				if (FileAPI.wrapInsideDiv) {
					var wrap = document.createElement('div');
					wrap.innerHTML = '<div class="js-fileapi-wrapper" style="position:relative; overflow:hidden"></div>';
					wrap = wrap.firstChild;
					var parent = elem.parentNode;
					parent.insertBefore(wrap, elem);
					parent.removeChild(elem);
					wrap.appendChild(elem);
				} else {
					el.addClass('js-fileapi-wrapper');
					if (el.parent()[0].__file_click_fn_delegate_) {
						if (el.parent().css('position') === '' || el.parent().css('position') === 'static') {
							el.parent().css('position', 'relative');
						}
						el.css('top', 0).css('bottom', 0).css('left', 0).css('right', 0).css('width', '100%').css('height', '100%').
							css('padding', 0).css('margin', 0);
						el.parent().unbind('click', el.parent()[0].__file_click_fn_delegate_);
					}
				}
			}
		}
	};
	var changeFnWrapper = function(fn) {
		return function(evt) {
			var files = FileAPI.getFiles(evt);
			//just a double check for #233
			for (var i = 0; i < files.length; i++) {
				if (files[i].size === undefined) files[i].size = 0;
				if (files[i].name === undefined) files[i].name = 'file';
				if (files[i].type === undefined) files[i].type = 'undefined';
			}
			if (!evt.target) {
				evt.target = {};
			}
			evt.target.files = files;
			// if evt.target.files is not writable use helper field
			if (evt.target.files != files) {
				evt.__files_ = files;
			}
			(evt.__files_ || evt.target.files).item = function(i) {
				return (evt.__files_ || evt.target.files)[i] || null;
			}
			if (fn) fn.apply(this, [evt]);
		};
	};
	var isFileChange = function(elem, e) {
		return (e.toLowerCase() === 'change' || e.toLowerCase() === 'onchange') && elem.getAttribute('type') == 'file';
	}
	if (HTMLInputElement.prototype.addEventListener) {
		HTMLInputElement.prototype.addEventListener = (function(origAddEventListener) {
			return function(e, fn, b, d) {
				if (isFileChange(this, e)) {
					addFlash(this);
					origAddEventListener.apply(this, [e, changeFnWrapper(fn), b, d]);
				} else {
					origAddEventListener.apply(this, [e, fn, b, d]);
				}
			}
		})(HTMLInputElement.prototype.addEventListener);
	}
	if (HTMLInputElement.prototype.attachEvent) {
		HTMLInputElement.prototype.attachEvent = (function(origAttachEvent) {
			return function(e, fn) {
				if (isFileChange(this, e)) {
					addFlash(this);
					if (window.jQuery) {
						// fix for #281 jQuery on IE8
						angular.element(this).bind('change', changeFnWrapper(null));
					} else {
						origAttachEvent.apply(this, [e, changeFnWrapper(fn)]);
					}
				} else {
					origAttachEvent.apply(this, [e, fn]);
				}
			}
		})(HTMLInputElement.prototype.attachEvent);
	}

	window.FormData = FormData = function() {
		return {
			append: function(key, val, name) {
				this.data.push({
					key: key,
					val: val,
					name: name
				});
			},
			data: [],
			__isShim: true
		};
	};

	(function () {
		//load FileAPI
		if (!window.FileAPI) {
			window.FileAPI = {};
		}
		if (FileAPI.forceLoad) {
			FileAPI.html5 = false;
		}
		
		if (!FileAPI.upload) {
			var jsUrl, basePath, script = document.createElement('script'), allScripts = document.getElementsByTagName('script'), i, index, src;
			if (window.FileAPI.jsUrl) {
				jsUrl = window.FileAPI.jsUrl;
			} else if (window.FileAPI.jsPath) {
				basePath = window.FileAPI.jsPath;
			} else {
				for (i = 0; i < allScripts.length; i++) {
					src = allScripts[i].src;
					index = src.indexOf('angular-file-upload-shim.js')
					if (index == -1) {
						index = src.indexOf('angular-file-upload-shim.min.js');
					}
					if (index > -1) {
						basePath = src.substring(0, index);
						break;
					}
				}
			}

			if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
			script.setAttribute('src', jsUrl || basePath + 'FileAPI.min.js');
			document.getElementsByTagName('head')[0].appendChild(script);
			FileAPI.hasFlash = hasFlash();
		}
	})();
	FileAPI.disableFileInput = function(elem, disable) {
		if (disable) {
			elem.removeClass('js-fileapi-wrapper')
		} else {
			elem.addClass('js-fileapi-wrapper');
		}
	}
}


if (!window.FileReader) {
	window.FileReader = function() {
		var _this = this, loadStarted = false;
		this.listeners = {};
		this.addEventListener = function(type, fn) {
			_this.listeners[type] = _this.listeners[type] || [];
			_this.listeners[type].push(fn);
		};
		this.removeEventListener = function(type, fn) {
			_this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
		};
		this.dispatchEvent = function(evt) {
			var list = _this.listeners[evt.type];
			if (list) {
				for (var i = 0; i < list.length; i++) {
					list[i].call(_this, evt);
				}
			}
		};
		this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;

		var constructEvent = function(type, evt) {
			var e = {type: type, target: _this, loaded: evt.loaded, total: evt.total, error: evt.error};
			if (evt.result != null) e.target.result = evt.result;
			return e;
		};
		var listener = function(evt) {
			if (!loadStarted) {
				loadStarted = true;
				_this.onloadstart && this.onloadstart(constructEvent('loadstart', evt));
			}
			if (evt.type === 'load') {
				_this.onloadend && _this.onloadend(constructEvent('loadend', evt));
				var e = constructEvent('load', evt);
				_this.onload && _this.onload(e);
				_this.dispatchEvent(e);
			} else if (evt.type === 'progress') {
				var e = constructEvent('progress', evt);
				_this.onprogress && _this.onprogress(e);
				_this.dispatchEvent(e);
			} else {
				var e = constructEvent('error', evt);
				_this.onerror && _this.onerror(e);
				_this.dispatchEvent(e);
			}
		};
		this.readAsArrayBuffer = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsBinaryString = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsDataURL = function(file) {
			FileAPI.readAsDataURL(file, listener);
		}
		this.readAsText = function(file) {
			FileAPI.readAsText(file, listener);
		}
	}
}

})();

},{}],4:[function(require,module,exports){
/**!
 * AngularJS file upload/drop directive with http post and progress
 * @author  Danial  <danial.farid@gmail.com>
 * @version 1.6.12
 */
(function() {

var angularFileUpload = angular.module('angularFileUpload', []);

angularFileUpload.service('$upload', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
	function sendHttp(config) {
		config.method = config.method || 'POST';
		config.headers = config.headers || {};
		config.transformRequest = config.transformRequest || function(data, headersGetter) {
			if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
				return data;
			}
			return $http.defaults.transformRequest[0](data, headersGetter);
		};
		var deferred = $q.defer();

		if (window.XMLHttpRequest.__isShim) {
			config.headers['__setXHR_'] = function() {
				return function(xhr) {
					if (!xhr) return;
					config.__XHR = xhr;
					config.xhrFn && config.xhrFn(xhr);
					xhr.upload.addEventListener('progress', function(e) {
						deferred.notify(e);
					}, false);
					//fix for firefox not firing upload progress end, also IE8-9
					xhr.upload.addEventListener('load', function(e) {
						if (e.lengthComputable) {
							deferred.notify(e);
						}
					}, false);
				};
			};
		}

		$http(config).then(function(r){deferred.resolve(r)}, function(e){deferred.reject(e)}, function(n){deferred.notify(n)});
		
		var promise = deferred.promise;
		promise.success = function(fn) {
			promise.then(function(response) {
				fn(response.data, response.status, response.headers, config);
			});
			return promise;
		};

		promise.error = function(fn) {
			promise.then(null, function(response) {
				fn(response.data, response.status, response.headers, config);
			});
			return promise;
		};

		promise.progress = function(fn) {
			promise.then(null, null, function(update) {
				fn(update);
			});
			return promise;
		};
		promise.abort = function() {
			if (config.__XHR) {
				$timeout(function() {
					config.__XHR.abort();
				});
			}
			return promise;
		};
		promise.xhr = function(fn) {
			config.xhrFn = (function(origXhrFn) {
				return function() {
					origXhrFn && origXhrFn.apply(promise, arguments);
					fn.apply(promise, arguments);
				}
			})(config.xhrFn);
			return promise;
		};
		
		return promise;
	}

	this.upload = function(config) {
		config.headers = config.headers || {};
		config.headers['Content-Type'] = undefined;
		config.transformRequest = config.transformRequest || $http.defaults.transformRequest;
		var formData = new FormData();
		var origTransformRequest = config.transformRequest;
		var origData = config.data;
		config.transformRequest = function(formData, headerGetter) {
			if (origData) {
				if (config.formDataAppender) {
					for (var key in origData) {
						var val = origData[key];
						config.formDataAppender(formData, key, val);
					}
				} else {
					for (var key in origData) {
						var val = origData[key];
						if (typeof origTransformRequest == 'function') {
							val = origTransformRequest(val, headerGetter);
						} else {
							for (var i = 0; i < origTransformRequest.length; i++) {
								var transformFn = origTransformRequest[i];
								if (typeof transformFn == 'function') {
									val = transformFn(val, headerGetter);
								}
							}
						}
						formData.append(key, val);
					}
				}
			}

			if (config.file != null) {
				var fileFormName = config.fileFormDataName || 'file';

				if (Object.prototype.toString.call(config.file) === '[object Array]') {
					var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]';
					for (var i = 0; i < config.file.length; i++) {
						formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i], 
								(config.fileName && config.fileName[i]) || config.file[i].name);
					}
				} else {
					formData.append(fileFormName, config.file, config.fileName || config.file.name);
				}
			}
			return formData;
		};

		config.data = formData;

		return sendHttp(config);
	};

	this.http = function(config) {
		return sendHttp(config);
	}
}]);

angularFileUpload.directive('ngFileSelect', [ '$parse', '$timeout', function($parse, $timeout) {
	return function(scope, elem, attr) {
		var fn = $parse(attr['ngFileSelect']);
		if (elem[0].tagName.toLowerCase() !== 'input' || (elem.attr('type') && elem.attr('type').toLowerCase()) !== 'file') {
			var fileElem = angular.element('<input type="file">')
			var attrs = elem[0].attributes;
			for (var i = 0; i < attrs.length; i++) {
				if (attrs[i].name.toLowerCase() !== 'type') {
					fileElem.attr(attrs[i].name, attrs[i].value);
				}
			}
			if (attr["multiple"]) fileElem.attr("multiple", "true");
			fileElem.css("width", "1px").css("height", "1px").css("opacity", 0).css("position", "absolute").css('filter', 'alpha(opacity=0)')
					.css("padding", 0).css("margin", 0).css("overflow", "hidden");
			fileElem.attr('__wrapper_for_parent_', true);

//			fileElem.css("top", 0).css("bottom", 0).css("left", 0).css("right", 0).css("width", "100%").
//					css("opacity", 0).css("position", "absolute").css('filter', 'alpha(opacity=0)').css("padding", 0).css("margin", 0);
			elem.append(fileElem);
			elem[0].__file_click_fn_delegate_  = function() {
				fileElem[0].click();
			}; 
			elem.bind('click', elem[0].__file_click_fn_delegate_);
			elem.css("overflow", "hidden");
//			if (fileElem.parent()[0] != elem[0]) {
//				//fix #298 button element
//				elem.wrap('<span>');
//				elem.css("z-index", "-1000")
//				elem.parent().append(fileElem);
//				elem = elem.parent();
//			}
//			if (elem.css("position") === '' || elem.css("position") === 'static') {
//				elem.css("position", "relative");
//			}
			elem = fileElem;
		}
		elem.bind('change', function(evt) {
			var files = [], fileList, i;
			fileList = evt.__files_ || evt.target.files;
			if (fileList != null) {
				for (i = 0; i < fileList.length; i++) {
					files.push(fileList.item(i));
				}
			}
			$timeout(function() {
				fn(scope, {
					$files : files,
					$event : evt
				});
			});
		});
		// removed this since it was confusing if the user click on browse and then cancel #181
//		elem.bind('click', function(){
//			this.value = null;
//		});

		// removed because of #253 bug
		// touch screens
//		if (('ontouchstart' in window) ||
//				(navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
//			elem.bind('touchend', function(e) {
//				e.preventDefault();
//				e.target.click();
//			});
//		}
	};
} ]);

angularFileUpload.directive('ngFileDropAvailable', [ '$parse', '$timeout', function($parse, $timeout) {
	return function(scope, elem, attr) {
		if ('draggable' in document.createElement('span')) {
			var fn = $parse(attr['ngFileDropAvailable']);
			$timeout(function() {
				fn(scope);
			});
		}
	};
} ]);

angularFileUpload.directive('ngFileDrop', [ '$parse', '$timeout', '$location', function($parse, $timeout, $location) {
	return function(scope, elem, attr) {
		if ('draggable' in document.createElement('span')) {
			var leaveTimeout = null;
			elem[0].addEventListener("dragover", function(evt) {
				evt.preventDefault();
				$timeout.cancel(leaveTimeout);
				if (!elem[0].__drag_over_class_) {
					if (attr['ngFileDragOverClass'] && attr['ngFileDragOverClass'].search(/\) *$/) > -1) {
						var dragOverClass = $parse(attr['ngFileDragOverClass'])(scope, {
							$event : evt
						});					
						elem[0].__drag_over_class_ = dragOverClass; 
					} else {
						elem[0].__drag_over_class_ = attr['ngFileDragOverClass'] || "dragover";
					}
				}
				elem.addClass(elem[0].__drag_over_class_);
			}, false);
			elem[0].addEventListener("dragenter", function(evt) {
				evt.preventDefault();
			}, false);
			elem[0].addEventListener("dragleave", function(evt) {
				leaveTimeout = $timeout(function() {
					elem.removeClass(elem[0].__drag_over_class_);
					elem[0].__drag_over_class_ = null;
				}, attr['ngFileDragOverDelay'] || 1);
			}, false);
			var fn = $parse(attr['ngFileDrop']);
			elem[0].addEventListener("drop", function(evt) {
				evt.preventDefault();
				elem.removeClass(elem[0].__drag_over_class_);
				elem[0].__drag_over_class_ = null;
				extractFiles(evt, function(files) {
					fn(scope, {
						$files : files,
						$event : evt
					});					
				});
			}, false);
						
			function isASCII(str) {
				return /^[\000-\177]*$/.test(str);
			}

			function extractFiles(evt, callback) {
				var files = [], items = evt.dataTransfer.items;
				if (items && items.length > 0 && items[0].webkitGetAsEntry && $location.protocol() != 'file' && 
						items[0].webkitGetAsEntry().isDirectory) {
					for (var i = 0; i < items.length; i++) {
						var entry = items[i].webkitGetAsEntry();
						if (entry != null) {
							//fix for chrome bug https://code.google.com/p/chromium/issues/detail?id=149735
							if (isASCII(entry.name)) {
								traverseFileTree(files, entry);
							} else if (!items[i].webkitGetAsEntry().isDirectory) {
								files.push(items[i].getAsFile());
							}
						}
					}
				} else {
					var fileList = evt.dataTransfer.files;
					if (fileList != null) {
						for (var i = 0; i < fileList.length; i++) {
							files.push(fileList.item(i));
						}
					}
				}
				(function waitForProcess(delay) {
					$timeout(function() {
						if (!processing) {
							callback(files);
						} else {
							waitForProcess(10);
						}
					}, delay || 0)
				})();
			}
			
			var processing = 0;
			function traverseFileTree(files, entry, path) {
				if (entry != null) {
					if (entry.isDirectory) {
						var dirReader = entry.createReader();
						processing++;
						dirReader.readEntries(function(entries) {
							for (var i = 0; i < entries.length; i++) {
								traverseFileTree(files, entries[i], (path ? path : "") + entry.name + "/");
							}
							processing--;
						});
					} else {
						processing++;
						entry.file(function(file) {
							processing--;
							file._relativePath = (path ? path : "") + file.name;
							files.push(file);
						});
					}
				}
			}
		}
	};
} ]);

})();

},{}],5:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('ComponentDetailsController', function ($scope, componentService) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {},
            ports = {};

        console.log('ComponentDetailsController');
        $scope.init = function (connectionId) {
            $scope.connectionId = connectionId;
            if ($scope.connectionId && angular.isString($scope.connectionId)) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'ComponentDetails_' + (new Date()).toISOString()
                };
                $scope.$on('$destroy', function () {
                    console.log('Destroying :', context.regionId);
                    componentService.cleanUpAllRegions(context);
                });
            } else {
                throw new Error('connectionId must be defined and it must be a string');
            }
            $scope.details = {
                properties: properties,
                connectors: connectors,
                ports: ports
            };

            componentService.registerWatcher(context, function (destroy) {
                $scope.details = {
                    properties: {},
                    connectors: {},
                    ports: {}
                };
                if (destroy) {
                    //TODO: notify user
                    return;
                }
                console.info('ComponentDetailsController - initialize event raised');

                componentService.watchInterfaces(context, $scope.componentId, function (updateObject) {
                    // Since watchInterfaces keeps the data up-to-date there shouldn't be a need to do any
                    // updates here..
                    console.log('watchInterfaces', updateObject);
                })
                    .then(function (componentInterfaces) {
                        $scope.details.properties = componentInterfaces.properties;
                        $scope.details.connectors = componentInterfaces.connectors;
                        $scope.details.ports = componentInterfaces.ports;
                    });
            });
        };
    })
    .directive('componentDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                componentId: '=componentId'
            },
            require: '^componentList',
            link: function (scope, elem, attr, componetListController) {
                var connectionId = componetListController.getConnectionId();
                scope.init(connectionId);
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ComponentDetails.html',
            controller: 'ComponentDetailsController'
        };
    });
},{}],6:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('ComponentListController', function ($scope, $window, $modal, growl, componentService, fileService) {
        'use strict';
        var self = this,
            items = [],             // Items that are passed to the item-list ui-component.
            componentItems = {},    // Same items are stored in a dictionary.
            serviceData2ListItem,
            addDomainWatcher,
            config,
            context;

        console.log('ComponentListController', $scope.avmIds);
        this.getConnectionId = function () {
            return $scope.connectionId;
        };
        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'ComponentListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                componentService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        // Configuration for the item list ui component.
        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                $scope.$emit('displayInstancesUp', {name: item.title, ids: item.data.instanceIds});
            },

            itemContextmenuRenderer: function (e, item) {
                return [
                    {
                        items: [
                            {
                                id: 'openInEditor',
                                label: 'Open in Editor',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-edit',
                                action: function () {
                                    $window.open('/?project=ADMEditor&activeObject=' + item.id, '_blank');
                                }
                            },
                            {
                                id: 'editComponent',
                                label: 'Edit',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-pencil',
                                actionData: {description: item.description, id: item.id},
                                action: function (data) {
                                    var editContext = {
                                            db: context.db,
                                            regionId: context.regionId + '_watchComponents'
                                        },
                                        modalInstance = $modal.open({
                                            templateUrl: '/cyphy-components/templates/ComponentEdit.html',
                                            controller: 'ComponentEditController',
                                            //size: size,
                                            resolve: { data: function () {
                                                return data;
                                            } }
                                        });

                                    modalInstance.result.then(function (editedData) {
                                        var attrs = {
                                            'INFO': editedData.description
                                        };
                                        componentService.setComponentAttributes(editContext, data.id, attrs)
                                            .then(function () {
                                                console.log('Attribute updated');
                                            });
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            },
                            {
                                id: 'exportAsAcm',
                                label: 'Export ACM',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: {resource: item.data.resource, name: item.title},
                                action: function (data) {
                                    var hash = data.resource,
                                        url = fileService.getDownloadUrl(hash);
                                    if (url) {
                                        growl.success('ACM file for <a href="' + url + '">' + data.name + '</a> exported.');
                                    } else {
                                        growl.warning(data.name + ' does not have a resource.');
                                    }
                                }
                            }
                        ]
                    },
                    {
                        items: [
                            {
                                id: 'delete',
                                label: 'Delete',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-remove',
                                actionData: { id: item.id, name: item.title },
                                action: function (data) {
                                    var modalInstance = $modal.open({
                                        templateUrl: '/cyphy-components/templates/SimpleModal.html',
                                        controller: 'SimpleModalController',
                                        resolve: {
                                            data: function () {
                                                return {
                                                    title: 'Delete Component',
                                                    details: 'This will delete ' + data.name +
                                                        ' from the workspace.'
                                                };
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                        componentService.deleteComponent(context, data.id);
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            }
                        ]
                    }
                ];
            },

            detailsRenderer: function (item) {
                //                item.details = 'My details are here now!';
            },

            filter: {
            }

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function (data) {
            var listItem;

            if (componentItems.hasOwnProperty(data.id)) {
                listItem = componentItems[data.id];
                listItem.title = data.name;
                listItem.description = data.description;
                listItem.data.resource = data.resource;
            } else {
                listItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: $scope.avmIds ? 'Highlight instances' : '',
                    description: data.description,
                    lastUpdated: {
                        time: 'N/A',   // TODO: get this in the future.
                        user: 'N/A'    // TODO: get this in the future.
                    },
                    stats: [ ],
                    details: 'Content',
                    detailsTemplateUrl: 'componentDetails.html',
                    data: { resource: data.resource }
                };
                if ($scope.avmIds) {
                    listItem.data.instanceIds = $scope.avmIds[data.avmId];
                }
                // Add the list-item to the items list and the dictionary.
                items.push(listItem);
                componentItems[listItem.id] = listItem;
            }
        };

        addDomainWatcher = function (componentId) {
            var domainModelsToStat = function (domainModels) {
                var stats = [],
                    labelMap = {
                        CAD: { value: 0, toolTip: 'CAD', iconClass: 'glyphicon glyphicon-stop' },
                        Cyber: { value: 0, toolTip: 'Cyber', iconClass: 'glyphicon glyphicon-stop' },
                        Manufacturing: { value: 0, toolTip: 'Manufacturing', iconClass: 'glyphicon glyphicon-stop' },
                        Modelica: { value: 0, toolTip: 'Modelica', iconClass: 'glyphicon glyphicon-stop' }
                    },
                    key;
                for (key in domainModels) {
                    if (domainModels.hasOwnProperty(key)) {
                        if (labelMap[domainModels[key].type]) {
                            labelMap[domainModels[key].type].value += 1;
                        } else {
                            console.error('Unexpected domain-model type', domainModels[key].type);
                        }
                    }
                }
                for (key in labelMap) {
                    if (labelMap.hasOwnProperty(key)) {
                        if (labelMap[key].value > 0) {
                            stats.push(labelMap[key]);
                        }
                    }
                }
                return stats;
            };

            componentService.watchComponentDomains(context, componentId, function (updateData) {
                var listItem = componentItems[componentId];
                console.log('DomainModels updated, event type:', updateData.type);
                if (listItem) {
                    listItem.stats = domainModelsToStat(updateData.domainModels);
                } else {
                    console.warn('DomainModel data did not have matching componentData', componentId);
                }
            })
                .then(function (data) {
                    var listItem = componentItems[componentId];
                    if (listItem) {
                        listItem.stats = domainModelsToStat(data.domainModels);
                    } else {
                        console.warn('DomainModel data did not have matching componentData', componentId);
                    }
                });
        };

        componentService.registerWatcher(context, function (destroyed) {
            items = [];
            $scope.listData.items = items;
            componentItems = {};

            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            componentService.watchComponents(context, $scope.workspaceId, $scope.avmIds, function (updateObject) {
                var index;
                //console.warn(updateObject);
                if (updateObject.type === 'load') {
                    serviceData2ListItem(updateObject.data);
                    addDomainWatcher(updateObject.id);

                } else if (updateObject.type === 'update') {
                    serviceData2ListItem(updateObject.data);

                } else if (updateObject.type === 'unload') {
                    if (componentItems.hasOwnProperty(updateObject.id)) {
                        index = items.map(function (e) {
                            return e.id;
                        }).indexOf(updateObject.id);
                        if (index > -1) {
                            items.splice(index, 1);
                        }
                        componentService.cleanUpRegion(context, context.regionId + '_watchComponentDomains_' + updateObject.id);
                        delete componentItems[updateObject.id];
                    }
                } else {
                    throw new Error(updateObject);
                }
            })
                .then(function (data) {
                    var componentId;
                    for (componentId in data.components) {
                        if (data.components.hasOwnProperty(componentId)) {
                            serviceData2ListItem(data.components[componentId]);
                            addDomainWatcher(componentId);
                        }
                    }
                });
        });
    })
    .controller('ComponentEditController', function ($scope, $modalInstance, data) {
        'use strict';
        $scope.data = {
            description: data.description
        };

        $scope.ok = function () {
            $modalInstance.close($scope.data);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .directive('componentList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId',
                avmIds: '=avmIds'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ComponentList.html',
            controller: 'ComponentListController'
        };
    });

},{}],7:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('DesignDetailsController', function ($scope, designService) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {},
            ports = {};

        console.log('DesignDetailsController');
        $scope.init = function (connectionId) {
            $scope.connectionId = connectionId;
            if ($scope.connectionId && angular.isString($scope.connectionId)) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'DesignDetails_' + (new Date()).toISOString()
                };
                $scope.$on('$destroy', function () {
                    console.log('Destroying :', context.regionId);
                    designService.cleanUpAllRegions(context);
                });
            } else {
                throw new Error('connectionId must be defined and it must be a string');
            }
            $scope.details = {
                properties: properties,
                connectors: connectors,
                ports: ports
            };

            designService.registerWatcher(context, function (destroy) {
                $scope.details = {
                    properties: {},
                    connectors: {},
                    ports: {}
                };
                if (destroy) {
                    //TODO: notify user
                    return;
                }
                console.info('DesignDetailsController - initialize event raised');

                designService.watchInterfaces(context, $scope.designId, function (updateObject) {
                    // Since watchInterfaces keeps the data up-to-date there shouldn't be a need to do any
                    // updates here..
                    console.log('watchInterfaces', updateObject);
                })
                    .then(function (designInterfaces) {
                        $scope.details.properties = designInterfaces.properties;
                        $scope.details.connectors = designInterfaces.connectors;
                        $scope.details.ports = designInterfaces.ports;
                    });
            });
        };
    })
    .directive('designDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                designId: '=designId'
            },
            require: '^designList',
            link: function (scope, elem, attr, designListController) {
                var connectionId = designListController.getConnectionId();
                scope.init(connectionId);
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/DesignDetails.html',
            controller: 'DesignDetailsController'
        };
    });
},{}],8:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('DesignListController', function ($scope, $window, $modal, designService, growl) {
        'use strict';
        var self = this,
            items = [],             // Items that are passed to the item-list ui-component.
            designItems = {},       // Same items are stored in a dictionary.
            serviceData2ListItem,
            config,
            addConfigurationWatcher,
            context;

        console.log('DesignListController');
        this.getConnectionId = function () {
            return $scope.connectionId;
        };
        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'DesignListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                designService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        // Configuration for the item list ui component.
        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                var newUrl = '/designSpace/' + $scope.workspaceId.replace(/\//g, '-') + '/' + item.id.replace(/\//g, '-');
                console.log(newUrl);
                document.location.hash = newUrl;
            },

            itemContextmenuRenderer: function (e, item) {
                return [
                    {
                        items: [
                            {
                                id: 'openInEditor',
                                label: 'Open in Editor',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-edit',
                                action: function () {
                                    $window.open('/?project=ADMEditor&activeObject=' + item.id, '_blank');
                                }
                            },
                            {
                                id: 'editDesign',
                                label: 'Edit',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-pencil',
                                actionData: {
                                    id: item.id,
                                    description: item.description,
                                    name: item.title
                                },
                                action: function (data) {
                                    var editContext = {
                                            db: context.db,
                                            regionId: context.regionId + '_watchDesigns'
                                        },
                                        modalInstance = $modal.open({
                                            templateUrl: '/cyphy-components/templates/DesignEdit.html',
                                            controller: 'DesignEditController',
                                            //size: size,
                                            resolve: { data: function () { return data; } }
                                        });

                                    modalInstance.result.then(function (editedData) {
                                        var attrs = {
                                            'name': editedData.name,
                                            'INFO': editedData.description
                                        };
                                        designService.setDesignAttributes(editContext, data.id, attrs)
                                            .then(function () {
                                                console.log('Attribute updated');
                                            });
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            },
                            {
                                id: 'exportAsAdm',
                                label: 'Export ADM',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: {id: item.id, name: item.title},
                                action: function (data) {
                                    growl.warning('Not Implemented!');
//                                    var hash = data.resource,
//                                        url = FileService.getDownloadUrl(hash);
//                                    if (url) {
//                                        growl.success('ACM file for <a href="' + url + '">' + data.name + '</a> exported.');
//                                    } else {
//                                        growl.warning(data.name + ' does not have a resource.');
//                                    }
                                }
                            }
                        ]
                    },
                    {
                        items: [
                            {
                                id: 'delete',
                                label: 'Delete',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-remove',
                                actionData: { id: item.id, name: item.title },
                                action: function (data) {
                                    var modalInstance = $modal.open({
                                        templateUrl: '/cyphy-components/templates/SimpleModal.html',
                                        controller: 'SimpleModalController',
                                        resolve: {
                                            data: function () {
                                                return {
                                                    title: 'Delete Design Space',
                                                    details: 'This will delete ' + data.name +
                                                        ' from the workspace.'
                                                };
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                        designService.deleteDesign(context, data.id);
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            }
                        ]
                    }
                ];
            },

            detailsRenderer: function (item) {
                //                item.details = 'My details are here now!';
            },

            filter: {
            }

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function (data) {
            var listItem;

            if (designItems.hasOwnProperty(data.id)) {
                listItem = designItems[data.id];
                listItem.title = data.name;
                listItem.description = data.description;
            } else {
                listItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open item',
                    description: data.description,
                    lastUpdated: {
                        time: 'N/A',   // TODO: get this in the future.
                        user: 'N/A'    // TODO: get this in the future.
                    },
                    stats: [
                        {
                            value: 0,
                            toolTip: 'Configuration Sets',
                            iconClass: 'glyphicon glyphicon-th-large'
                        },
                        {
                            value: 0,
                            toolTip: 'Configurations',
                            iconClass: 'glyphicon glyphicon-th'
                        },
                        {
                            value: 0,
                            toolTip: 'Results',
                            iconClass: 'glyphicon glyphicon-stats'
                        }
                    ],
                    details    : 'Content',
                    detailsTemplateUrl: 'designDetails.html'
                };
                // Add the list-item to the items list and the dictionary.
                items.push(listItem);
                designItems[listItem.id] = listItem;
            }
        };

        addConfigurationWatcher = function (designId) {
            designService.watchNbrOfConfigurations(context, designId, function (updateObject) {
                var listItem = designItems[designId];
                console.log(updateObject);
                listItem.stats[0].value = updateObject.data.counters.sets;
                listItem.stats[1].value = updateObject.data.counters.configurations;
                listItem.stats[2].value = updateObject.data.counters.results;
            }).then(function (data) {
                var listItem = designItems[designId];
                listItem.stats[0].value = data.counters.sets;
                listItem.stats[1].value = data.counters.configurations;
                listItem.stats[2].value = data.counters.results;
            });
        };

        designService.registerWatcher(context, function (destroyed) {
            items = [];
            $scope.listData.items = items;
            designItems = {};

            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            designService.watchDesigns(context, $scope.workspaceId, function (updateObject) {
                var index;
                console.warn(updateObject);
                if (updateObject.type === 'load') {
                    serviceData2ListItem(updateObject.data);
                    addConfigurationWatcher(updateObject.id);
                } else if (updateObject.type === 'update') {
                    serviceData2ListItem(updateObject.data);
                } else if (updateObject.type === 'unload') {
                    if (designItems.hasOwnProperty(updateObject.id)) {
                        index = items.map(function (e) {
                            return e.id;
                        }).indexOf(updateObject.id);
                        if (index > -1) {
                            items.splice(index, 1);
                        }
                        designService.cleanUpRegion(context, context.regionId + '_watchNbrOfConfigurations_' + updateObject.id);
                        delete designItems[updateObject.id];
                    }
                } else {
                    throw new Error(updateObject);
                }
            })
                .then(function (data) {
                    var designId;
                    for (designId in data.designs) {
                        if (data.designs.hasOwnProperty(designId)) {
                            serviceData2ListItem(data.designs[designId]);
                            addConfigurationWatcher(designId);
                        }
                    }
                });
        });
    })
    .controller('DesignEditController', function ($scope, $modalInstance, data) {
        'use strict';
        $scope.data = {
            description: data.description,
            name: data.name
        };

        $scope.ok = function () {
            $modalInstance.close($scope.data);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .directive('designList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/DesignList.html',
            controller: 'DesignListController'
        };
    });

},{}],9:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('DesignTreeController', function ($scope, $window, designService) {
        'use strict';
        var self = this,
            items = [],
            context,
            config,
            treeData,
            rootNode,
            avmIds = {},
            buildTreeStructure;

        console.log('DesignTreeController');

        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'DesignTreeController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                designService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        config = {
            nodeContextmenuRenderer: function (e, node) {
                return [{
                    items: [{
                        id: 'create',
                        label: 'Open in Editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        actionData: {id: node.id},
                        action: function (data) {
                            $window.open('/?project=ADMEditor&activeObject=' + data.id, '_blank');
                        }
                    }]
                }];
            },
            nodeClick: function ( e, node ) {
                console.log( 'Node was clicked:', node, $scope );
            }
//            nodeDblclick: function ( e, node ) {
//                console.log( 'Node was double-clicked:', node );
//            },
//            nodeExpanderClick: function ( e, node, isExpand ) {
//                console.log( 'Expander was clicked for node:', node, isExpand );
//            }
        };

        rootNode = {
            id: $scope.designId,
            label: 'Loading Design Space Nodes..',
            extraInfo: '',
            children: [],
            childrenCount: 0
        };

        treeData = {
            id: '',
            label: '',
            extraInfo: '',
            unCollapsible: true,
            children: [
                rootNode
            ],
            childrenCount: 1
        };
        $scope.config = config;
        $scope.treeData = treeData;
        $scope.$on('displayInstancesDown', function (event, data) {
            $scope.config.state.selectedNodes = data;
        });
        buildTreeStructure = function (container, parentTreeNode) {
            var key,
                childData,
                treeNode;
            if (parentTreeNode) {
                treeNode = {
                    id: null,
                    label: null,
                    extraInfo: null,
                    children: [],
                    childrenCount: 0
                };
                parentTreeNode.children.push(treeNode);
                parentTreeNode.childrenCount += 1;
            } else {
                treeNode = rootNode;
            }
            treeNode.id = container.id;
            treeNode.label = container.name;
            treeNode.extraInfo = container.type;
            $scope.config.state.expandedNodes.push(treeNode.id);
            for (key in container.components) {
                if (container.components.hasOwnProperty(key)) {
                    childData = container.components[key];
                    treeNode.children.push({
                        id: childData.id,
                        label: childData.name
                    });
                    treeNode.childrenCount += 1;
                    if (avmIds[childData.avmId]) {
                        avmIds[childData.avmId].push(childData.id);
                    } else {
                        avmIds[childData.avmId] = [childData.id];
                    }
                }
            }
            for (key in container.subContainers) {
                if (container.subContainers.hasOwnProperty(key)) {
                    childData = container.subContainers[key];
                    buildTreeStructure(childData, treeNode);
                }
            }
        };

        designService.registerWatcher(context, function (destroyed) {
            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            designService.watchDesignStructure(context, $scope.designId, function (updateObject) {
                console.warn(updateObject);
            })
                .then(function (data) {
                    var rootContainer = data.containers[data.rootId];
                    buildTreeStructure(rootContainer);
                    $scope.$emit('designTreeLoaded', avmIds);
                });
        });
    })
    .directive('designTree', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                designId: '=designId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/DesignTree.html',
            controller: 'DesignTreeController'
        };
    });

},{}],10:[function(require,module,exports){
/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('SimpleModalController', function ($scope, $modalInstance, data) {
        'use strict';
        $scope.data = {
            title: data.title,
            details: data.details
        };

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

},{}],11:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('TestBenchDetailsController', function ($scope, testBenchService) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {},
            ports = {},
            watchInterfaces;

        console.log('TestBenchDetailsController');
        $scope.init = function (connectionId) {
            $scope.connectionId = connectionId;
            if ($scope.connectionId && angular.isString($scope.connectionId)) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'TestBenchDetails_' + (new Date()).toISOString()
                };
                $scope.$on('$destroy', function () {
                    console.log('Destroying :', context.regionId);
                    testBenchService.cleanUpAllRegions(context);
                });
            } else {
                throw new Error('connectionId must be defined and it must be a string');
            }
            $scope.details = {
                properties: properties,
                connectors: connectors,
                ports: ports
            };
            watchInterfaces = function (containerId) {
                testBenchService.watchInterfaces(context, containerId, function (updateObject) {
                    // Since watchInterfaces keeps the data up-to-date there shouldn't be a need to do any
                    // updates here..
                    console.log('watchInterfaces', updateObject);
                })
                    .then(function (containerInterfaces) {
                        $scope.details.properties = containerInterfaces.properties;
                        $scope.details.connectors = containerInterfaces.connectors;
                        $scope.details.ports = containerInterfaces.ports;
                    });
            };

            testBenchService.registerWatcher(context, function (destroy) {
                $scope.details = {
                    properties: {},
                    connectors: {},
                    ports: {}
                };
                if (destroy) {
                    //TODO: notify user
                    return;
                }
                console.info('TestBenchDetailsController - initialize event raised');
                testBenchService.watchTestBenchDetails(context, $scope.testBenchId, function (updatedObj) {
                    console.warn('watchTestBenchDetails updates', updatedObj);
                })
                    .then(function (data) {
                        if (data.containerIds.length === 0) {
                            console.warn('No container defined!');
                        } else if (data.containerIds.length === 1) {
                            watchInterfaces(data.containerIds[0]);
                        } else {
                            console.error('More than one container defined!');
                        }
                    });
            });
        };
    })
    .directive('testBenchDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                testBenchId: '=testBenchId'
            },
            require: '^testBenchList',
            link: function (scope, elem, attr, testBenchListController) {
                var connectionId = testBenchListController.getConnectionId();
                scope.init(connectionId);
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/TestBenchDetails.html',
            controller: 'TestBenchDetailsController'
        };
    });
},{}],12:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('TestBenchListController', function ($scope, $window, $modal, growl, testBenchService) {
        'use strict';
        var self = this,
            items = [],             // Items that are passed to the item-list ui-component.
            testBenchItems = {},    // Same items are stored in a dictionary.
            serviceData2ListItem,
            config,
            context;

        console.log('TestBenchListController');

        this.getConnectionId = function () {
            return $scope.connectionId;
        };

        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'TestBenchListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                testBenchService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        // Configuration for the item list ui component.
        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                growl.warning('Not Implemented!');
                //document.location.hash = '/component/' + item.id.replace(/\//g, '-');
            },

            itemContextmenuRenderer: function (e, item) {
                return [
                    {
                        items: [
                            {
                                id: 'openInEditor',
                                label: 'Open in Editor',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-edit',
                                action: function () {
                                    $window.open('/?project=ADMEditor&activeObject=' + item.id, '_blank');
                                }
                            },
                            {
                                id: 'editTestBench',
                                label: 'Edit',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-pencil',
                                actionData: {
                                    id: item.id,
                                    description: item.description,
                                    name: item.title,
                                    files: item.data.files,
                                    path: item.data.path
                                },
                                action: function (data) {
                                    var editContext = {
                                            db: context.db,
                                            regionId: context.regionId + '_watchComponents'
                                        },
                                        modalInstance = $modal.open({
                                            templateUrl: '/cyphy-components/templates/TestBenchEdit.html',
                                            controller: 'TestBenchEditController',
                                            //size: size,
                                            resolve: { data: function () { return data; } }
                                        });

                                    modalInstance.result.then(function (editedData) {
                                        var attrs = {
                                            INFO: editedData.description,
                                            name: editedData.name,
                                            TestBenchFiles: editedData.files,
                                            ID: editedData.path
                                        };
                                        testBenchService.setComponentAttributes(editContext, data.id, attrs)
                                            .then(function () {
                                                console.log('Attribute updated');
                                            });
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            },
                            {
                                id: 'executeTestBench',
                                label: 'Execute Test Bench',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-expand',
                                actionData: {id: item.id},
                                action: function (data) {
                                    var modalInstance = $modal.open({
                                        templateUrl: '/cyphy-components/templates/SimpleModal.html',
                                        controller: 'SimpleModalController',
                                        resolve: {
                                            data: function () {
                                                return {
                                                    title: 'Execute Test Bench',
                                                    details: 'This will run the simulations for all possible ' +
                                                        'combinations of the design space as one job. The compound ' +
                                                        'result will be attached to the test-bench (rather than ' +
                                                        'saved to results objects in the associated design).' +
                                                        'The other path is to generated configurations for your ' +
                                                        'design and open up the test-bench and execute a selected ' +
                                                        'set of designs. This way you can add new results as you add ' +
                                                        'more test-benches or configurations.'
                                                };
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                        growl.warning('Not Implemented!');
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            }
                        ]
                    },
                    {
                        items: [
                            {
                                id: 'delete',
                                label: 'Delete',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-remove',
                                actionData: { id: item.id, name: item.title },
                                action: function (data) {
                                    var modalInstance = $modal.open({
                                        templateUrl: '/cyphy-components/templates/SimpleModal.html',
                                        controller: 'SimpleModalController',
                                        resolve: {
                                            data: function () {
                                                return {
                                                    title: 'Delete Test Bench',
                                                    details: 'This will delete ' + data.name +
                                                        ' from the workspace.'
                                                };
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                        testBenchService.deleteComponent(context, data.id);
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            }
                        ]
                    }
                ];
            },

            detailsRenderer: function (item) {
                //                item.details = 'My details are here now!';
            },

            filter: {
            }

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function (data) {
            var listItem;

            if (testBenchItems.hasOwnProperty(data.id)) {
                listItem = testBenchItems[data.id];
                listItem.title = data.name;
                listItem.description = data.description;
                listItem.data.files = data.files;
                listItem.data.path = data.path;
                listItem.data.results = data.results;
            } else {
                listItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open Test Bench',
                    description: data.description,
                    lastUpdated: {
                        time: 'N/A',   // TODO: get this in the future.
                        user: 'N/A'    // TODO: get this in the future.
                    },
                    stats: [ ],
                    details    : 'Content',
                    detailsTemplateUrl: 'testBenchDetails.html',
                    data: {
                        files: data.files,
                        path: data.path,
                        results: data.results
                    }
                };
                // Add the list-item to the items list and the dictionary.
                items.push(listItem);
                testBenchItems[listItem.id] = listItem;
            }
        };

        testBenchService.registerWatcher(context, function (destroyed) {
            items = [];
            $scope.listData.items = items;
            testBenchItems = {};

            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            testBenchService.watchTestBenches(context, $scope.workspaceId, function (updateObject) {
                var index;
                //console.warn(updateObject);
                if (updateObject.type === 'load') {
                    serviceData2ListItem(updateObject.data);

                } else if (updateObject.type === 'update') {
                    serviceData2ListItem(updateObject.data);

                } else if (updateObject.type === 'unload') {
                    if (testBenchItems.hasOwnProperty(updateObject.id)) {
                        index = items.map(function (e) {
                            return e.id;
                        }).indexOf(updateObject.id);
                        if (index > -1) {
                            items.splice(index, 1);
                        }
//                        testBenchService.cleanUpRegion(context, context.regionId + '_watchTestBench_' + updateObject.id);
                        delete testBenchItems[updateObject.id];
                    }
                } else {
                    throw new Error(updateObject);
                }
            })
                .then(function (data) {
                    var testBenchId;
                    for (testBenchId in data.testBenches) {
                        if (data.testBenches.hasOwnProperty(testBenchId)) {
                            serviceData2ListItem(data.testBenches[testBenchId]);
                            //addTestBenchWatcher(testBenchId);
                        }
                    }
                });
        });
    })
    .controller('TestBenchEditController', function ($scope, $modalInstance, data) {
        'use strict';
        $scope.data = {
            description: data.description,
            name: data.name,
            files: data.files,
            path: data.path
        };

        $scope.ok = function () {
            $modalInstance.close($scope.data);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .directive('testBenchList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/TestBenchList.html',
            controller: 'TestBenchListController'
        };
    });

},{}],13:[function(require,module,exports){
/*globals angular, console, document*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('WorkspaceListController', function ($scope, growl, workspaceService, fileService) {
        'use strict';
        var self = this,
            items = [],
            workspaceItems = {},
            config,
            context,
            serviceData2ListItem,
            addCountWatchers;

        console.log('WorkspaceListController');

        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'WorkspaceListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                workspaceService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                console.log('Clicked: ' + item);
                document.location.hash = '/workspaceDetails/' + item.id.replace(/\//g, '-');
            },

            itemContextmenuRenderer: function (e, item) {
                console.log('Contextmenu was triggered for node:', item);

                return [
                    {
                        items: [

                            {
                                id: 'openInEditor',
                                label: 'Open in Editor',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-edit'
                            },
                            {
                                id: 'duplicateWorkspace',
                                label: 'Duplicate',
                                disabled: false,
                                iconClass: 'fa fa-copy copy-icon',
                                actionData: {id: item.id},
                                action: function (data) {
                                    workspaceService.duplicateWorkspace(context, data.id);
                                }
                            },
                            {
                                id: 'editWorkspace',
                                label: 'Edit',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-pencil',
                                actionData: {id: item.id},
                                action: function (data) {
                                    growl.warning('Not Implemented, id: ' + data.id);
                                }
                            },
                            {
                                id: 'exportAsXME',
                                label: 'Export as XME',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: { id: item.id },
                                action: function (data) {
                                    growl.info('Not Implemented, id: ' + data.id);
                                }
                            }
                        ]
                    },
                    {
                        //label: 'Extra',
                        items: [

                            {
                                id: 'delete',
                                label: 'Delete',
                                disabled: false,
                                iconClass: 'fa fa-plus',
                                actionData: { id: item.id },
                                action: function (data) {
                                    workspaceService.deleteWorkspace(context, data.id);
                                }
                            }
                        ]
                    }
                ];
            },

            detailsRenderer: function (item) {
                //                item.details = 'My details are here now!';
            },

            newItemForm: {
                title: 'Create new workspace',
                itemTemplateUrl: '/cyphy-components/templates/WorkspaceNewItem.html',
                expanded: false,
                controller: function ($scope) {
                    $scope.model = {
                        droppedFiles: []
                    };
                    $scope.dragOverClass = function ($event) {
                        var draggedItems = $event.dataTransfer.items,
                            i,
                            hasFile = false;
                        console.warn(draggedItems);
                        if (draggedItems === null) {
                            hasFile = true;
                        } else {
                            for (i = 0; i < draggedItems.length; i += 1) {
                                if (draggedItems[i].kind === 'file') {
                                    hasFile = true;
                                    break;
                                }
                            }
                        }

                        return hasFile ? "bg-success dragover" : "bg-danger dragover";
                    };

                    $scope.onDroppedFiles = function ($files) {
                        fileService.saveDroppedFiles($files, {zip: true, adm: true, atm: true})
                            .then(function (fInfos) {
                                var i;
                                console.log(fInfos);
                                for (i = 0; i < fInfos.length; i += 1) {
                                    $scope.model.droppedFiles.push(fInfos[i]);
                                }
                            });
                    };

                    $scope.createItem = function (newItem) {
                        var i;
                        for (i = 0; i < $scope.files.length; i += 1) {
                            console.log($scope.files[i]);
                        }
                        //workspaceService.createWorkspace(context, newItem);

                        //$scope.newItem = {};

                        //config.newItemForm.expanded = false; // this is how you close the form itself

                    };
                }
            },

            filter: {
            }

        };

        $scope.listData = {
            items: items
        };

        $scope.config = config;

        serviceData2ListItem = function (data) {
            var workspaceItem;

            if (workspaceItems.hasOwnProperty(data.id)) {
                workspaceItem = workspaceItems[data.id];
                workspaceItem.title = data.name;
                workspaceItem.description = data.description;
            } else {
                workspaceItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open Workspace',
                    description: data.description,
                    lastUpdated: {
                        time: new Date(), // TODO: get this
                        user: 'N/A' // TODO: get this
                    },
                    stats: [
                        {
                            value: 0,
                            toolTip: 'Components',
                            iconClass: 'fa fa-puzzle-piece'
                        },
                        {
                            value: 0,
                            toolTip: 'Design Spaces',
                            iconClass: 'fa fa-cubes'
                        },
                        {
                            value: 0,
                            toolTip: 'Test benches',
                            iconClass: 'glyphicon glyphicon-saved'
                        },
                        {
                            value: 0,
                            toolTip: 'Requirements',
                            iconClass: 'fa fa-bar-chart-o'
                        }
                    ]
                };

                workspaceItems[workspaceItem.id] = workspaceItem;
                items.push(workspaceItem);
            }
        };

        addCountWatchers = function (workspaceId) {
            workspaceService.watchNumberOfComponents(context, workspaceId, function (updateData) {
                var workspaceData = workspaceItems[workspaceId];
                if (workspaceData) {
                    workspaceData.stats[0].value = updateData.data;
                }
            })
                .then(function (data) {
                    var workspaceData = workspaceItems[workspaceId];
                    if (workspaceData) {
                        workspaceData.stats[0].value = data.count;
                    }
                });
            workspaceService.watchNumberOfDesigns(context, workspaceId, function (updateData) {
                var workspaceData = workspaceItems[workspaceId];
                if (workspaceData) {
                    workspaceData.stats[1].value = updateData.data;
                }
            })
                .then(function (data) {
                    var workspaceData = workspaceItems[workspaceId];
                    if (workspaceData) {
                        workspaceData.stats[1].value = data.count;
                    }
                });
            workspaceService.watchNumberOfTestBenches(context, workspaceId, function (updateData) {
                var workspaceData = workspaceItems[workspaceId];
                if (workspaceData) {
                    workspaceData.stats[2].value = updateData.data;
                }
            })
                .then(function (data) {
                    var workspaceData = workspaceItems[workspaceId];
                    if (workspaceData) {
                        workspaceData.stats[2].value = data.count;
                    }
                });
        };

        workspaceService.registerWatcher(context, function (destroyed) {
            // initialize all variables
            items = [];
            $scope.listData = {
                items: items
            };
            workspaceItems = {};

            if (destroyed) {
                console.info('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('WorkspaceListController - initialize event raised');
            workspaceService.watchWorkspaces(context, function (updateObject) {
                var index;

                if (updateObject.type === 'load') {
                    serviceData2ListItem(updateObject.data);
                    addCountWatchers(updateObject.id);

                } else if (updateObject.type === 'update') {
                    serviceData2ListItem(updateObject.data);

                } else if (updateObject.type === 'unload') {
                    if (workspaceItems.hasOwnProperty(updateObject.id)) {
                        index = items.map(function (e) {
                            return e.id;
                        }).indexOf(updateObject.id);
                        if (index > -1) {
                            items.splice(index, 1);
                        }
                        workspaceService.cleanUpRegion(context, context.regionId + '_watchNumberOfComponents_' + updateObject.id);
                        workspaceService.cleanUpRegion(context, context.regionId + '_watchNumberOfDesigns_' + updateObject.id);
                        workspaceService.cleanUpRegion(context, context.regionId + '_watchNumberOfTestBenches_' + updateObject.id);
                        delete workspaceItems[updateObject.id];
                    }

                } else {
                    throw new Error(updateObject);

                }
            })
                .then(function (data) {
                    var workspaceId;

                    for (workspaceId in data.workspaces) {
                        if (data.workspaces.hasOwnProperty(workspaceId)) {
                            serviceData2ListItem(data.workspaces[workspaceId]);
                            addCountWatchers(workspaceId);
                        }
                    }
                });
        });
    })
    .directive('workspaceList', function () {
        'use strict';
        return {
            restrict: 'E',
            replace: true,
            scope: {
                connectionId: '=connectionId'
            },
            templateUrl: '/cyphy-components/templates/WorkspaceList.html',
            controller: 'WorkspaceListController'
        };
    });

},{}],14:[function(require,module,exports){
/*globals angular, console*/

/**
 * This service contains functionality shared amongst the different services. It should not be used
 * directly in a controller - only as part of other services.
 *
 * @author pmeijer / https://github.com/pmeijer
 */


angular.module('cyphy.services')
    .service('baseCyPhyService', function ($q, nodeService) {
        'use strict';

        /**
         * Registers a watcher (controller) to the service. Callback function is called when nodes became available or
         * when they became unavailable. These are also called directly with the state of the nodeService.
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.db - Database connection.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         * @param {function} fn - Called with true when there are no nodes unavailable and false when there are.
         */
        this.registerWatcher = function (watchers, parentContext, fn) {
            nodeService.on(parentContext.db, 'initialize', function () {
                // This should be enough, the regions will be cleaned up in nodeService.
                watchers[parentContext.regionId] = {};
                fn(false);
            });
            nodeService.on(parentContext.db, 'destroy', function () {
                // This should be enough, the regions should be cleaned up in nodeService.
                if (watchers[parentContext.regionId]) {
                    delete watchers[parentContext.regionId];
                }
                fn(true);
            });
        };

        /**
         * Removes all watchers spawned from parentContext, this should typically be invoked when the controller is destroyed.
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         */
        this.cleanUpAllRegions = function (watchers, parentContext) {
            var childWatchers,
                key;
            if (watchers[parentContext.regionId]) {
                childWatchers = watchers[parentContext.regionId];
                for (key in childWatchers) {
                    if (childWatchers.hasOwnProperty(key)) {
                        nodeService.cleanUpRegion(childWatchers[key].db, childWatchers[key].regionId);
                    }
                }
                delete watchers[parentContext.regionId];
            } else {
                console.log('Nothing to clean-up..');
            }
        };

        /**
         * Removes specified watcher (regionId)
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.db - Database connection of both parent and region to be deleted.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         * @param {string} regionId - Region id of the spawned region that should be deleted.
         */
        this.cleanUpRegion = function (watchers, parentContext, regionId) {
            if (watchers[parentContext.regionId]) {
                if (watchers[parentContext.regionId][regionId]) {
                    nodeService.cleanUpRegion(parentContext.db, regionId);
                    delete watchers[parentContext.regionId][regionId];
                } else {
                    console.log('Nothing to clean-up..');
                }
            } else {
                console.log('Cannot clean-up region since parentContext is not registered..', parentContext);
            }
        };

        /**
         * Updates the given attributes of a node.
         * @param {object} context - Must exist within watchers and contain the component.
         * @param {string} context.db - Must exist within watchers and contain the component.
         * @param {string} context.regionId - Must exist within watchers and contain the component.
         * @param {string} id - Path to node.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setNodeAttributes = function (context, id, attrs) {
            var deferred = $q.defer();
            nodeService.loadNode(context, id)
                .then(function (nodeObj) {
                    var key;
                    for (key in attrs) {
                        if (attrs.hasOwnProperty(key)) {
                            console.log('setNodeAttributes', key, attrs[key]);
                            nodeObj.setAttribute(key, attrs[key], 'webCyPhy - setNodeAttributes');
                        }
                    }
                    deferred.resolve();
                });

            return deferred.promise;
        };

        /** TODO: Watch domainPorts inside Connectors and check if properties are derived.
         *  Watches the interfaces (Properties, Connectors and DomainPorts) of a model.
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} id - Path to model.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchInterfaces = function (watchers, parentContext, id, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchInterfaces_' + id,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    id: id,
                    properties: {}, //property:  {id: <string>, name: <string>, dataType: <string>, valueType <string>, derived <boolean>}
                    connectors: {}, //connector: {id: <string>, name: <string>, domainPorts: <object> }
                    ports: {}       //port:      {id: <string>, name: <string>, type: <string>, class: <string> }
                },
                onPropertyUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDataType = this.getAttribute('DataType'),
                        newValueType = this.getAttribute('ValueType'),
                        newDerived = isPropertyDerived(this),
                        hadChanges = false;
                    if (newName !== data.properties[id].name) {
                        data.properties[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDataType !== data.properties[id].dataType) {
                        data.properties[id].dataType = newDataType;
                        hadChanges = true;
                    }
                    if (newValueType !== data.properties[id].valueType) {
                        data.properties[id].valueType = newValueType;
                        hadChanges = true;
                    }
                    if (newDerived !== data.properties[id].derived) {
                        data.properties[id].derived = newDerived;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data});
                    }
                },
                onPropertyUnload = function (id) {
                    delete data.properties[id];
                    updateListener({id: id, type: 'unload', data: null});
                },
                onConnectorUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        hadChanges = false;
                    if (newName !== data.connectors[id].name) {
                        data.connectors[id].name = newName;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data});
                    }
                },
                onConnectorUnload = function (id) {
                    delete data.connectors[id];
                    updateListener({id: id, type: 'unload', data: null});
                },
                onPortUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newType = this.getAttribute('Type'),
                        newClass = this.getAttribute('Class'),
                        hadChanges = false;
                    if (newName !== data.ports[id].name) {
                        data.ports[id].name = newName;
                        hadChanges = true;
                    }
                    if (newType !== data.ports[id].dataType) {
                        data.ports[id].type = newType;
                        hadChanges = true;
                    }
                    if (newClass !== data.ports[id].class) {
                        data.ports[id].class = newClass;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data});
                    }
                },
                onPortUnload = function (id) {
                    delete data.ports[id];
                    updateListener({id: id, type: 'unload', data: null});
                },
                isPropertyDerived = function (node) {
                    return node.getCollectionPaths('dst').length > 0;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, id)
                    .then(function (modelNode) {
                        modelNode.loadChildren().then(function (children) {
                            var i,
                                childId,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                childId = childNode.getId();
                                if (childNode.isMetaTypeOf(meta.Property)) {
                                    data.properties[childId] = {
                                        id: childId,
                                        name: childNode.getAttribute('name'),
                                        dataType: childNode.getAttribute('DataType'),
                                        valueType: childNode.getAttribute('ValueType'),
                                        derived: isPropertyDerived(childNode)
                                    };
                                    childNode.onUpdate(onPropertyUpdate);
                                    childNode.onUnload(onPropertyUnload);
                                } else if (childNode.isMetaTypeOf(meta.Connector)) {
                                    data.connectors[childId] = {
                                        id: childId,
                                        name: childNode.getAttribute('name'),
                                        domainPorts: {}
                                    };
                                    childNode.onUpdate(onConnectorUpdate);
                                    childNode.onUnload(onConnectorUnload);
                                    ///queueList.push(childNode.loadChildren(childNode));
                                } else if (childNode.isMetaTypeOf(meta.DomainPort)) {
                                    data.ports[childId] = {
                                        id: childId,
                                        name: childNode.getAttribute('name'),
                                        type: childNode.getAttribute('Type'),
                                        class: childNode.getAttribute('Class')
                                    };
                                    childNode.onUpdate(onPortUpdate);
                                    childNode.onUnload(onPortUnload);
                                    ///queueList.push(childNode.loadChildren(childNode));
                                }
                            }
                            modelNode.onNewChildLoaded(function (newChild) {
                                childId = newChild.getId();
                                if (newChild.isMetaTypeOf(meta.Property)) {
                                    data.properties[childId] = {
                                        id: childId,
                                        name: newChild.getAttribute('name'),
                                        dataType: newChild.getAttribute('DataType'),
                                        valueType: newChild.getAttribute('ValueType'),
                                        derived: isPropertyDerived(newChild)
                                    };
                                    newChild.onUpdate(onPropertyUpdate);
                                    newChild.onUnload(onPropertyUnload);
                                    updateListener({id: childId, type: 'load', data: data});
                                } else if (newChild.isMetaTypeOf(meta.Connector)) {
                                    data.connectors[childId] = {
                                        id: childId,
                                        name: newChild.getAttribute('name'),
                                        domainPorts: {}
                                    };
                                    newChild.onUpdate(onConnectorUpdate);
                                    newChild.onUnload(onConnectorUnload);
                                    updateListener({id: childId, type: 'load', data: data});
                                    ///queueList.push(childNode.loadChildren(childNode));
                                } else if (newChild.isMetaTypeOf(meta.DomainPort)) {
                                    data.ports[childId] = {
                                        id: childId,
                                        name: childNode.getAttribute('name'),
                                        type: childNode.getAttribute('Type'),
                                        class: childNode.getAttribute('Class')
                                    };
                                    newChild.onUpdate(onPortUpdate);
                                    newChild.onUnload(onPortUnload);
                                    updateListener({id: childId, type: 'load', data: data});
                                }
                            });

                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

    });
},{}],15:[function(require,module,exports){
/*globals angular, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('componentService', function ($q, nodeService, baseCyPhyService) {
        'use strict';
        var watchers = {};

        /**
         * Removes the component from the context (db/project/branch).
         * @param context - context of controller, N.B. does not need to specify region.
         * @param componentId
         * @param [msg] - Commit message.
         */
        this.deleteComponent = function (context, componentId, msg) {
            var message = msg || 'ComponentService.deleteComponent ' + componentId;
            nodeService.destroyNode(context, componentId, message);
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the component.
         * @param {string} context.db - Must exist within watchers and contain the component.
         * @param {string} context.regionId - Must exist within watchers and contain the component.
         * @param {string} componentId - Path to component.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setComponentAttributes = function (context, componentId, attrs) {
            return baseCyPhyService.setNodeAttributes(context, componentId, attrs);
        };

        /**
         *  Watches all components (existence and their attributes) of a workspace.
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data.  Data is an object in data.components.
         * @param {object} avmIds - An optional filter that only watches components with IDs that evaluates to true.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchComponents = function (parentContext, workspaceId, avmIds, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchComponents',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    components: {} // component {id: <string>, name: <string>, description: <string>,
                                   //            avmId: <string>, resource: <hash|string>, classifications: <string> }
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        newAvmID = this.getAttribute('ID'),
                        newResource = this.getAttribute('Resource'),
                        newClass = this.getAttribute('Classifications'),
                        hadChanges = false;
                    if (newName !== data.components[id].name) {
                        data.components[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.components[id].description) {
                        data.components[id].description = newDesc;
                        hadChanges = true;
                    }
                    if (newAvmID !== data.components[id].avmId) {
                        data.components[id].avmId = newAvmID;
                        hadChanges = true;
                    }
                    if (newResource !== data.components[id].resource) {
                        data.components[id].resource = newResource;
                        hadChanges = true;
                    }
                    if (newClass !== data.components[id].classifications) {
                        data.components[id].classifications = newClass;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data.components[id]});
                    }
                },
                onUnload = function (id) {
                    delete data.components[id];
                    updateListener({id: id, type: 'unload', data: null});
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            componentId,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ACMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                componentId = childNode.getId();
                                if (!avmIds || avmIds.hasOwnProperty(childNode.getAttribute('ID'))) {
                                    data.components[componentId] = {
                                        id: componentId,
                                        name: childNode.getAttribute('name'),
                                        description: childNode.getAttribute('INFO'),
                                        avmId: childNode.getAttribute('ID'),
                                        resource: childNode.getAttribute('Resource'),
                                        classifications: childNode.getAttribute('Classifications')
                                    };
                                    childNode.onUnload(onUnload);
                                    childNode.onUpdate(onUpdate);
                                }
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ACMFolder)) {
                                watchFromFolderRec(newChild, meta);
                            } else if (newChild.isMetaTypeOf(meta.AVMComponentModel)) {
                                componentId = newChild.getId();
                                if (!avmIds || avmIds.hasOwnProperty(newChild.getAttribute('ID'))) {
                                    data.components[componentId] = {
                                        id: componentId,
                                        name: newChild.getAttribute('name'),
                                        description: newChild.getAttribute('INFO'),
                                        avmId: newChild.getAttribute('ID'),
                                        resource: newChild.getAttribute('Resource'),
                                        classifications: newChild.getAttribute('Classifications')
                                    };
                                    newChild.onUnload(onUnload);
                                    newChild.onUpdate(onUpdate);
                                    updateListener({id: componentId, type: 'load', data: data.components[componentId]});
                                }
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ACMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ACMFolder)) {
                                    watchFromFolderRec(newChild, meta);
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches the domain-models of a component.
         * @param parentContext - context of controller.
         * @param componentId
         * @param updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchComponentDomains = function (parentContext, componentId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchComponentDomains_' + componentId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    id: componentId,
                    domainModels: {}   //domainModel: id: <string>, type: <string>
                },
                onDomainModelUpdate = function (id) {
                    var newType = this.getAttribute('Type'),
                        hadChanges = false;
                    if (newType !== data.domainModels[id].type) {
                        data.domainModels[id].type = newType;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data});
                    }
                },
                onDomainModelUnload = function (id) {
                    delete data.domainModels[id];
                    updateListener({id: id, type: 'unload', data: null});
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, componentId)
                    .then(function (componentNode) {
                        componentNode.loadChildren().then(function (children) {
                            var i,
                                childId,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                childId = childNode.getId();
                                if (childNode.isMetaTypeOf(meta.DomainModel)) {
                                    data.domainModels[childId] = {
                                        id: childId,
                                        type: childNode.getAttribute('Type')
                                    };
                                    childNode.onUpdate(onDomainModelUpdate);
                                    childNode.onUnload(onDomainModelUnload);
                                }
                            }
                            componentNode.onNewChildLoaded(function (newChild) {
                                childId = newChild.getId();
                                if (newChild.isMetaTypeOf(meta.DomainModel)) {
                                    data.domainModels[childId] = {
                                        id: childId,
                                        type: childNode.getAttribute('Type')
                                    };
                                    newChild.onUpdate(onDomainModelUpdate);
                                    newChild.onUnload(onDomainModelUnload);
                                    updateListener({id: childId, type: 'load', data: data});
                                }
                            });

                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.watchInterfaces.
         */
        this.watchInterfaces = function (parentContext, id, updateListener) {
            return baseCyPhyService.watchInterfaces(watchers, parentContext, id, updateListener);
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            baseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            baseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            baseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };

        this.logContext = function (context) {
            nodeService.logContext(context);
        };
    });
},{}],16:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('designService', function ($q, nodeService, baseCyPhyService) {
        'use strict';
        var watchers = {};

        this.deleteDesign = function (designId) {
            throw new Error('Not implemented yet.');
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the component.
         * @param {string} context.db - Must exist within watchers and contain the component.
         * @param {string} context.regionId - Must exist within watchers and contain the component.
         * @param {string} designId - Path to design-space.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setDesignAttributes = function (context, designId, attrs) {
            return baseCyPhyService.setNodeAttributes(context, designId, attrs);
        };

        this.exportDesign = function (designId) {
            throw new Error('Not implemented yet.');
        };

        this.calculateConfigurations = function (data) {
            throw new Error('Not implemented yet.');
        };

        this.saveConfigurationSet = function (designId, data) {
            throw new Error('Not implemented yet.');
        };

        /**
         *  Watches all containers (existence and their attributes) of a workspace.
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data. Data is an object in data.designs.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesigns = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesigns',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    designs: {} // design {id: <string>, name: <string>, description: <string>}
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        hadChanges = false;
                    if (newName !== data.designs[id].name) {
                        data.designs[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.designs[id].description) {
                        data.designs[id].description = newDesc;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data.designs[id]});
                    }
                },
                onUnload = function (id) {
                    delete data.designs[id];
                    updateListener({id: id, type: 'unload', data: null});
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            designId,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ADMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.Container)) {
                                designId = childNode.getId();
                                data.designs[designId] = {
                                    id: designId,
                                    name: childNode.getAttribute('name'),
                                    description: childNode.getAttribute('INFO')
                                };
                                childNode.onUnload(onUnload);
                                childNode.onUpdate(onUpdate);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ADMFolder)) {
                                watchFromFolderRec(newChild, meta);
                            } else if (newChild.isMetaTypeOf(meta.Container)) {
                                designId = newChild.getId();
                                data.designs[designId] = {
                                    id: designId,
                                    name: newChild.getAttribute('name'),
                                    description: newChild.getAttribute('INFO')
                                };
                                newChild.onUnload(onUnload);
                                newChild.onUpdate(onUpdate);
                                updateListener({id: designId, type: 'load', data: data.designs[designId]});
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ADMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ADMFolder)) {
                                    watchFromFolderRec(newChild, meta);
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches all containers (existence and their attributes) of a workspace.
         * @param {object} parentContext - context of controller.
         * @param {string} designId
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNbrOfConfigurations = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNbrOfConfigurations_' + designId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    counters: {
                        sets: 0,
                        configurations: 0,
                        results: 0
                    }
                },
                watchConfiguration = function (cfgNode, meta, wasCreated) {
                    var cfgDeferred = $q.defer(),
                        resultOnUnload = function (id) {
                            data.counters.results -= 1;
                            updateListener({id: id, type: 'unload', data: data.counters});
                        };
                    // Count this set and add an unload handle.
                    data.counters.configurations += 1;
                    if (wasCreated) {
                        updateListener({id: cfgNode.getId(), type: 'load', data: data.counters});
                    }
                    cfgNode.onUnload(function (id) {
                        data.counters.configurations -= 1;
                        updateListener({id: id, type: 'unload', data: data.counters});
                    });
                    cfgNode.loadChildren().then(function (children) {
                        var i,
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.Result)) {
                                data.counters.results += 1;
                                childNode.onUnload(resultOnUnload);
                            }
                        }
                        cfgNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.Result)) {
                                data.counters.results += 1;
                                updateListener({id: newChild.getId(), type: 'load', data: data.counters});
                                childNode.onUnload(resultOnUnload);
                            }
                        });
                        cfgDeferred.resolve();
                    });

                    return cfgDeferred.promise;
                },
                watchConfigurationSet = function (setNode, meta, wasCreated) {
                    var setDeferred = $q.defer();
                    // Count this set and add an unload handle.
                    data.counters.sets += 1;
                    if (wasCreated) {
                        updateListener({id: setNode.getId(), type: 'load', data: data.counters});
                    }
                    setNode.onUnload(function (id) {
                        data.counters.sets -= 1;
                        updateListener({id: id, type: 'unload', data: data.counters});
                    });
                    setNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.DesertConfiguration)) {
                                queueList.push(watchConfiguration(childNode, meta));
                            }
                        }
                        setNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.DesertConfiguration)) {
                                watchConfiguration(newChild, meta, true);
                            }
                        });
                        if (queueList.length === 0) {
                            setDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                setDeferred.resolve();
                            });
                        }
                    });

                    return setDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, designId)
                    .then(function (designNode) {
                        designNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                    queueList.push(watchConfigurationSet(childNode, meta));
                                }
                            }
                            designNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                    watchConfigurationSet(newChild, meta, true);
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches a design(space) w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchInterfaces = function (parentContext, designId, updateListener) {
            return baseCyPhyService.watchInterfaces(watchers, parentContext, designId, updateListener);
        };

        /**
         *  Watches the full hierarchy of a design w.r.t. containers and components.
         * @param {object} parentContext - context of controller.
         * @param {string} designId - path to root container.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesignStructure = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesignStructure_' + designId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    rootId: designId,
                    containers: {}, // container: {id: <string>, name: <string>, parentId: <string>, type: <string>,
                                    //             subContainers: {id:<string>: <container>},
                                    //             components:    {id:<string>: <container>}}
                    components: {}  // component: {id: <string>, name: <string>, parentId: <string>,
                                    //             , avmId: <string> }
                },
                getComponentInfo = function (node, parentId) {
                    return {
                        id: node.getId(),
                        name: node.getAttribute('name'),
                        parentId: parentId,
                        avmId: node.getAttribute('ID')
                    };
                },
                watchFromContainerRec = function (containerNode, rootContainer, meta) {
                    var recDeferred = $q.defer();
                    containerNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode,
                            onUnload = function (id) {
                                //updateListener({id: id, type: 'unload', data: data.count});
                            },
                            container = {
                                id: containerNode.getId(),
                                name: containerNode.getAttribute('name'),
                                type: containerNode.getAttribute('Type'),
                                subContainers: {},
                                components: {}
                            },
                            component;

                        rootContainer.subContainers[containerNode.getId()] = container;
                        data.containers[containerNode.getId()] = container;

                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.Container)) {
                                queueList.push(watchFromContainerRec(childNode, container, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                component = getComponentInfo(childNode, container.id);
                                container.components[childNode.getId()] = component;
                                data.components[childNode.getId()] = component;
                            }
                        }

//                        containerNode.onNewChildLoaded(function (newChild) {
//                            if (newChild.isMetaTypeOf(meta.Container)) {
//                                watchFromContainerRec(newChild, container, meta).then(function () {
//                                    updateListener({id: newChild.getId(), type: 'load', data: data});
//                                });
//                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
//                                container[childNode.getId()] = getComponentInfo(childNode, container.id);
//                                updateListener({id: newChild.getId(), type: 'load', data: data});
//                            }
//                        });

                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, designId)
                    .then(function (rootNode) {
                        rootNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode,
                                rootContainer = {
                                    id: rootNode.getId(),
                                    name: rootNode.getAttribute('name'),
                                    type: rootNode.getAttribute('Type'),
                                    subContainers: {},
                                    components: {}
                                },
                                component;

                            data.containers[rootContainer.id] = rootContainer;
                            data.containers[rootContainer.id] = rootContainer;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.Container)) {
                                    queueList.push(watchFromContainerRec(childNode, rootContainer, meta));
                                } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                    component = getComponentInfo(childNode, rootContainer.id);
                                    rootContainer.components[childNode.getId()] = component;
                                    data.components[childNode.getId()] = component;
                                }
                            }
//                            rootNode.onNewChildLoaded(function (newChild) {
//                                if (newChild.isMetaTypeOf(meta.Container)) {
//                                    watchFromContainerRec(newChild, rootContainer, meta).then(function () {
//                                        updateListener({id: newChild.getId(), type: 'load', data: data});
//                                    });
//                                } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
//                                    rootContainer.components[childNode.getId()] = getComponentInfo(childNode, rootContainer.id);
//                                    updateListener({id: newChild.getId(), type: 'load', data: data});
//                                }
//
//                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        // FIXME: watchConfigurationSets and watchConfigurations should probably go to a DesertConfiguration-Service,
        // with a related controller DesertConfigurationSetList, where details are configurations.
        /**
         *  Watches the generated DesertConfigurationSets inside a Design.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchConfigurationSets = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                data = {
                    name: null,
                    id: designId,
                    regionId: null,
                    cfgSets: {}
                },
                context = {
                    db: parentContext.db,
                    projectId: parentContext.projectId,
                    branchId: parentContext.branchId,
                    regionId: parentContext.regionId + '_watchConfigurationSets_' + designId
                };
            data.regionId = context.regionId;
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            console.log('Added new watcher: ', watchers);
            nodeService.logContext(context);
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, designId)
                    .then(function (designNode) {
                        data.name = designNode.getAttribute('name');
                        designNode.loadChildren(context)
                            .then(function (childNodes) {
                                var i,
                                    onUpdate = function (id) {
                                        var newName = this.getAttribute('name'),
                                            newDesc = this.getAttribute('INFO');
                                        console.warn(newName);
                                        if (newName !== data.cfgSets[id].name ||
                                            newDesc !== data.cfgSets[id].description) {
                                            //data.cfgSets[id].name = newName;
                                            //console.warn('changed');
                                            updateListener(true);
                                        }
                                    },
                                    onUnload = function (id) {
                                        updateListener(true);
                                    };
                                for (i = 0; i < childNodes.length; i += 1) {
                                    if (childNodes[i].isMetaTypeOf(meta.DesertConfigurationSet)) {
                                        data.cfgSets[childNodes[i].getId()] = {
                                            id: childNodes[i].getId(),
                                            name: childNodes[i].getAttribute('name'),
                                            description: childNodes[i].getAttribute('INFO')
                                        };
                                        childNodes[i].onUpdate(onUpdate);
                                        childNodes[i].onUnload(onUnload);
                                    }
                                }
                                //console.log('cfgSets', cfgSets);
                                designNode.onNewChildLoaded(function (newNode) {
                                    if (newNode.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                        updateListener(true);
                                    }
                                });
                                deferred.resolve(data);
                            });
                        designNode.onUpdate(function (id) {
                            var newName = this.getAttribute('name');
                            if (newName !== data.name) {
                                data.name = newName;
                                updateListener(true);
                            }
                        });
                    });
            });
            return deferred.promise;
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            baseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            baseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            baseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };
    });
},{}],17:[function(require,module,exports){
/*globals angular, WebGMEGlobal, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services')
    .service('fileService', function ($q) {
        'use strict';
        var self = this,
            blobClient = new WebGMEGlobal.classes.BlobClient();

        this.saveDroppedFiles = function (files, validExtensions) {
            var deferred = $q.defer(),
                i,
                counter = files.length,
                artie = blobClient.createArtifact('droppedFiles'),
                addFile,
                addedFiles = [],
                updateCounter = function () {
                    counter -= 1;
                    if (counter <= 0) {
                        deferred.resolve(addedFiles);
                    }
                };

            counter = files.length;

            addFile = function (file) {
                var fileExtension = self.getFileExtension(file.name);
                if (!validExtensions || validExtensions[fileExtension]) {
                    artie.addFileAsSoftLink(file.name, file, function (err, hash) {
                        if (err) {
                            console.error('Could not add file "' + file.name + '" to blob, err: ' + err);
                            updateCounter();
                            return;
                        }
                        addedFiles.push({
                            hash: hash,
                            name: file.name,
                            type: fileExtension,
                            size: self.humanFileSize(file.size, true),
                            url: blobClient.getDownloadURL(hash)
                        });
                        updateCounter();
                    });
                } else {
                    updateCounter();
                }
            };
            for (i = 0; i < files.length; i += 1) {
                addFile(files[i]);
            }

            return deferred.promise;
        };

        /**
         * Returns the download url for the given hash.
         * @param {string} hash - hash to blob file.
         * @returns {string} - the download url (null if hash is empty).
         */
        this.getDownloadUrl = function (hash) {
            var url;
            if (hash) {
                url = blobClient.getDownloadURL(hash);
            } else {
                console.warn('No hash to blob file given');
                url = null;
            }

            return url;
        };

        /**
         * Returns the file extension of the given filename.
         * @param {string} filename
         * @returns {string} - the resulting file extension.
         */
        this.getFileExtension = function (filename) {
            var a = filename.split(".");
            if (a.length === 1 || (a[0] === "" && a.length === 2)) {
                return "";
            }
            return a.pop().toLowerCase();
        };

        /**
         * Formats the size into a human readable string.
         * @param {number} bytes - size in bytes.
         * @param {boolean} si - return result in SIUnits or not.
         * @returns {string} - formatted file size.
         */
        this.humanFileSize = function (bytes, si) {
            var thresh = si ? 1000 : 1024,
                units,
                u;
            if (bytes < thresh) {
                return bytes + ' B';
            }

            units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] :
                    ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
            u = -1;

            do {
                bytes = bytes / thresh;
                u += 1;
            } while (bytes >= thresh);

            return bytes.toFixed(1) + ' ' + units[u];
        };
    });
},{}],18:[function(require,module,exports){
/*globals angular, WebGMEGlobal, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services')
    .service('pluginService', function ($q, dataStoreService) {
        'use strict';
        this.testRunPlugin = function (context, pluginName, config) {
            var dbConn = dataStoreService.getDatabaseConnection(context.db),
                interpreterManager = new WebGMEGlobal.classes.InterpreterManager(dbConn.client);

            interpreterManager.run('AdmExporter', {activeNode: '/1586421660/958919425/239534238'}, function (a, b, c) {
                console.log(a, b, c);
            });
        };
    });
},{}],19:[function(require,module,exports){
/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.services')
    .service('testBenchService', function ($q, nodeService, baseCyPhyService) {
        'use strict';
        var watchers = {};

        this.deleteTestBench = function (testBenchId) {
            throw new Error('Not implemented yet.');
        };

        this.exportTestBench = function (testBenchId) {
            throw new Error('Not implemented yet.');
        };

        this.setTopLevelSystemUnderTest = function (testBenchId, designId) {
            throw new Error('Not implemented yet.');
        };

        this.runTestBench = function (testBenchId, configurationId) {
            throw new Error('Not implemented yet.');
        };

        /**
         *  Watches all test-benches (existence and their attributes) of a workspace.
         * @param {object} parentContext - context of controller.
         * @param {string} workspaceId - Path to workspace that should be watched.
         * @param {function} updateListener - invoked when there are (filtered) changes in data. Data is an object in data.testBenches.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchTestBenches = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBenches',
                context = {
                    db: parentContext.db,
                    projectId: parentContext.projectId,
                    branchId: parentContext.branchId,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    testBenches: {} // testBench {id: <string>, name: <string>, description: <string>,
                                    //            path: <string>, results: <hash|string>, files: <hash|string> }
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        newPath = this.getAttribute('ID'),
                        newResults = this.getAttribute('Results'),
                        newFiles = this.getAttribute('TestBenchFiles'),
                        hadChanges = false;
                    if (newName !== data.testBenches[id].name) {
                        data.testBenches[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.testBenches[id].description) {
                        data.testBenches[id].description = newDesc;
                        hadChanges = true;
                    }
                    if (newPath !== data.testBenches[id].path) {
                        data.testBenches[id].path = newPath;
                        hadChanges = true;
                    }
                    if (newResults !== data.testBenches[id].results) {
                        data.testBenches[id].results = newResults;
                        hadChanges = true;
                    }
                    if (newFiles !== data.testBenches[id].files) {
                        data.testBenches[id].files = newFiles;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data.testBenches[id]});
                    }
                },
                onUnload = function (id) {
                    delete data.testBenches[id];
                    updateListener({id: id, type: 'unload', data: null});
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            testBenchId,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ATMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMTestBenchModel)) {
                                testBenchId = childNode.getId();
                                data.testBenches[testBenchId] = {
                                    id: testBenchId,
                                    name: childNode.getAttribute('name'),
                                    description: childNode.getAttribute('INFO'),
                                    path: childNode.getAttribute('ID'),
                                    results: childNode.getAttribute('Results'),
                                    files: childNode.getAttribute('TestBenchFiles')
                                };
                                childNode.onUnload(onUnload);
                                childNode.onUpdate(onUpdate);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ATMFolder)) {
                                watchFromFolderRec(newChild, meta);
                            } else if (newChild.isMetaTypeOf(meta.AVMTestBenchModel)) {
                                testBenchId = newChild.getId();
                                data.testBenches[testBenchId] = {
                                    id: testBenchId,
                                    name: newChild.getAttribute('name'),
                                    description: newChild.getAttribute('INFO'),
                                    path: newChild.getAttribute('ID'),
                                    results: newChild.getAttribute('Results'),
                                    files: newChild.getAttribute('TestBenchFiles')
                                };
                                newChild.onUnload(onUnload);
                                newChild.onUpdate(onUpdate);
                                updateListener({id: testBenchId, type: 'load', data: data.testBenches[testBenchId]});
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ATMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ATMFolder)) {
                                    watchFromFolderRec(newChild, meta);
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches a test-bench w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param testBenchId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchTestBenchDetails = function (parentContext, testBenchId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBenchDetails_' + testBenchId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    containerIds: [],
                    tlsut: null
                },
                onUnload = function (id) {
                    var index = data.containerIds.indexOf(id);
                    if (index > -1) {
                        data.containerIds.splice(index, 1);
                        updateListener({id: id, type: 'unload', data: data});
                    }
                };
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, testBenchId)
                    .then(function (testBenchNode) {
                        testBenchNode.loadChildren()
                            .then(function (children) {
                                var i;
                                for (i = 0; i < children.length; i += 1) {
                                    if (children[i].isMetaTypeOf(meta.Container)) {
                                        data.containerIds.push(children[i].getId());
                                        children[i].onUnload(onUnload);
                                    }
                                }
                                testBenchNode.onNewChildLoaded(function (newChild) {
                                    data.containerIds.push(newChild.getId());
                                    newChild.onUnload(onUnload);
                                    updateListener({id: newChild.getId(), type: 'load', data: data});
                                });
                                deferred.resolve(data);
                            });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches a test-bench w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param containerId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchInterfaces = function (parentContext, containerId, updateListener) {
            return baseCyPhyService.watchInterfaces(watchers, parentContext, containerId, updateListener);
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            baseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            baseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            baseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };
    });
},{}],20:[function(require,module,exports){
/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('workspaceService', function ($q, nodeService, baseCyPhyService) {
        'use strict';
        var watchers = {};

        this.duplicateWorkspace = function (context, otherWorkspaceId) {
            throw new Error('Not implemented yet.');
        };

        this.createWorkspace = function (context, data) {
            var deferred = $q.defer();
            console.warn('Creating new workspace but not using data', data);
            nodeService.getMetaNodes(context)
                .then(function (meta) {
                    nodeService.createNode(context, '', meta.WorkSpace, '[WebCyPhy] - WorkspaceService.createWorkspace')
                        .then(function (newNode) {
                            deferred.resolve(newNode);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                })
                .catch(function (reason) {
                    deferred.reject(reason);
                });

            return deferred.promise;
        };

        /**
         * Removes the work-space from the context (db/project/branch).
         * @param context - context of controller, N.B. does not need to specify region.
         * @param workspaceId
         * @param [msg] - Commit message.
         */
        this.deleteWorkspace = function (context, workspaceId, msg) {
            var message = msg || 'WorkspaceService.deleteWorkspace ' + workspaceId;
            nodeService.destroyNode(context, workspaceId, message);
        };

        this.exportWorkspace = function (workspaceId) {
            throw new Error('Not implemented yet.');
        };
        // TODO: make sure the methods below gets resolved at error too.
        /**
         * Keeps track of the work-spaces defined in the root-node w.r.t. existence and attributes.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is an object in data.workspaces.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchWorkspaces = function (parentContext, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchWorkspaces',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    workspaces: {} // workspace = {id: <string>, name: <string>, description: <string>}
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        hadChanges = false;
                    if (newName !== data.workspaces[id].name) {
                        data.workspaces[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.workspaces[id].description) {
                        data.workspaces[id].description = newDesc;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data.workspaces[id]});
                    }
                },
                onUnload = function (id) {
                    delete data.workspaces[id];
                    updateListener({id: id, type: 'unload', data: null});
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, '')
                    .then(function (rootNode) {
                        rootNode.loadChildren().then(function (children) {
                            var i,
                                childNode,
                                wsId;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.WorkSpace)) {
                                    wsId = childNode.getId();
                                    data.workspaces[wsId] = {
                                        id: wsId,
                                        name: childNode.getAttribute('name'),
                                        description: childNode.getAttribute('INFO')
                                    };
                                    childNode.onUpdate(onUpdate);
                                    childNode.onUnload(onUnload);
                                }
                            }
                            rootNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.WorkSpace)) {
                                    wsId = newChild.getId();
                                    data.workspaces[wsId] = {
                                        id: wsId,
                                        name: newChild.getAttribute('name'),
                                        description: newChild.getAttribute('INFO')
                                    };
                                    newChild.onUpdate(onUpdate);
                                    newChild.onUnload(onUnload);
                                    updateListener({id: wsId, type: 'load', data: data.workspaces[wsId]});
                                }
                            });
                            deferred.resolve(data);
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         * Keeps track of the number of components (defined in ACMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfComponents = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNumberOfComponents_' + workspaceId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    count: 0
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode,
                            onUnload = function (id) {
                                data.count -= 1;
                                updateListener({id: id, type: 'unload', data: data.count});
                            };
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ACMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                data.count += 1;
                                childNode.onUnload(onUnload);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ACMFolder)) {
                                watchFromFolderRec(newChild, meta).then(function () {
                                    updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                });
                            } else if (newChild.isMetaTypeOf(meta.AVMComponentModel)) {
                                data.count += 1;
                                newChild.onUnload(onUnload);
                                updateListener({id: newChild.getId(), type: 'load', data: data.count});
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ACMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ACMFolder)) {
                                    watchFromFolderRec(newChild, meta).then(function () {
                                        updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                    });
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         * Keeps track of the number of containers (defined in ADMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfDesigns = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNumberOfDesigns_' + workspaceId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    count: 0
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode,
                            onUnload = function (id) {
                                data.count -= 1;
                                updateListener({id: id, type: 'unload', data: data.count});
                            };
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ADMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.Container)) {
                                data.count += 1;
                                childNode.onUnload(onUnload);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ADMFolder)) {
                                watchFromFolderRec(newChild, meta).then(function () {
                                    updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                });
                            } else if (newChild.isMetaTypeOf(meta.Container)) {
                                data.count += 1;
                                newChild.onUnload(onUnload);
                                updateListener({id: newChild.getId(), type: 'load', data: data.count});
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            if (watchers.hasOwnProperty(parentContext.regionId) === false) {
                console.error(parentContext.regionId + ' is not a registered watcher! ' +
                    'Use "this.registerWatcher" before trying to access Node Objects.');
            }
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ADMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ADMFolder)) {
                                    watchFromFolderRec(newChild, meta).then(function () {
                                        updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                    });
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         * Keeps track of the number of test-benches (defined in ATMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfTestBenches = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNumberOfTestBenches_' + workspaceId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    count: 0
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode,
                            onUnload = function (id) {
                                data.count -= 1;
                                updateListener({id: id, type: 'unload', data: data.count});
                            };
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ATMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMTestBenchModel)) {
                                data.count += 1;
                                childNode.onUnload(onUnload);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ATMFolder)) {
                                watchFromFolderRec(newChild, meta).then(function () {
                                    updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                });
                            } else if (newChild.isMetaTypeOf(meta.AVMTestBenchModel)) {
                                data.count += 1;
                                newChild.onUnload(onUnload);
                                updateListener({id: newChild.getId(), type: 'load', data: data.count});
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ATMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ATMFolder)) {
                                    watchFromFolderRec(newChild, meta).then(function () {
                                        updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                    });
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            baseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            baseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            baseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };

        this.logContext = function (context) {
            nodeService.logContext(context);
        };
    });
},{}],21:[function(require,module,exports){
/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services', ['gme.services']);
require('./BaseCyPhyService');
require('./PluginService');
require('./FileService');
require('./WorkspaceService');
require('./ComponentService');
require('./DesignService');
require('./TestBenchService');
},{"./BaseCyPhyService":14,"./ComponentService":15,"./DesignService":16,"./FileService":17,"./PluginService":18,"./TestBenchService":19,"./WorkspaceService":20}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvbGlicmFyeS9jeXBoeS1jb21wb25lbnRzLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL2FuZ3VsYXItZ3Jvd2wvYnVpbGQvYW5ndWxhci1ncm93bC5taW4uanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0NvbXBvbmVudERldGFpbHMvQ29tcG9uZW50RGV0YWlscy5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9EZXNpZ25EZXRhaWxzL0Rlc2lnbkRldGFpbHMuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0Rlc2lnbkxpc3QvRGVzaWduTGlzdC5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvRGVzaWduVHJlZS9EZXNpZ25UcmVlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9TaW1wbGVNb2RhbC9TaW1wbGVNb2RhbC5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvVGVzdEJlbmNoRGV0YWlscy9UZXN0QmVuY2hEZXRhaWxzLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9UZXN0QmVuY2hMaXN0L1Rlc3RCZW5jaExpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L1dvcmtzcGFjZUxpc3QvV29ya3NwYWNlTGlzdC5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvQmFzZUN5UGh5U2VydmljZS5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvQ29tcG9uZW50U2VydmljZS5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvRGVzaWduU2VydmljZS5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvRmlsZVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1BsdWdpblNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1Rlc3RCZW5jaFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1dvcmtzcGFjZVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL2N5cGh5LXNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIHJlcXVpcmUsIGFuZ3VsYXIgKi9cclxuLyoqXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcbi8vIEV4dGVybmFsIGRlcGVuZGVuY2llc1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQtc2hpbScpO1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQnKTtcclxuLy9yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2FuZ3VsYXItYW5pbWF0ZS9hbmd1bGFyLWFuaW1hdGUubWluJyk7XHJcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvYW5ndWxhci1ncm93bC9idWlsZC9hbmd1bGFyLWdyb3dsLm1pbicpO1xyXG5cclxuLy8gSW50ZXJuYWwgZGVwZW5kZW5jaWVzXHJcbnJlcXVpcmUoJy4vc2VydmljZXMvY3lwaHktc2VydmljZXMnKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJywgW1xyXG4gICAgJ2N5cGh5LnNlcnZpY2VzJyxcclxuICAgICdjeXBoeS5jb21wb25lbnRzLnRlbXBsYXRlcycsXHJcbiAgICAnYW5ndWxhckZpbGVVcGxvYWQnLFxyXG4vLyAgICAnbmdBbmltYXRlJyxcclxuICAgICdhbmd1bGFyLWdyb3dsJ1xyXG5dKS5jb25maWcoWydncm93bFByb3ZpZGVyJywgZnVuY3Rpb24gKGdyb3dsUHJvdmlkZXIpIHtcclxuICAgIGdyb3dsUHJvdmlkZXIuZ2xvYmFsVGltZVRvTGl2ZSh7c3VjY2VzczogNTAwMCwgZXJyb3I6IC0xLCB3YXJuaW5nOiAyMDAwMCwgaW5mbzogNTAwMH0pO1xyXG59XSk7XHJcblxyXG5yZXF1aXJlKCcuL1NpbXBsZU1vZGFsL1NpbXBsZU1vZGFsJyk7XHJcbnJlcXVpcmUoJy4vV29ya3NwYWNlTGlzdC9Xb3Jrc3BhY2VMaXN0Jyk7XHJcblxyXG5yZXF1aXJlKCcuL0NvbXBvbmVudERldGFpbHMvQ29tcG9uZW50RGV0YWlscycpO1xyXG5yZXF1aXJlKCcuL0NvbXBvbmVudExpc3QvQ29tcG9uZW50TGlzdCcpO1xyXG5cclxucmVxdWlyZSgnLi9EZXNpZ25EZXRhaWxzL0Rlc2lnbkRldGFpbHMnKTtcclxucmVxdWlyZSgnLi9EZXNpZ25MaXN0L0Rlc2lnbkxpc3QnKTtcclxucmVxdWlyZSgnLi9EZXNpZ25UcmVlL0Rlc2lnblRyZWUnKTtcclxuXHJcbnJlcXVpcmUoJy4vVGVzdEJlbmNoRGV0YWlscy9UZXN0QmVuY2hEZXRhaWxzJyk7XHJcbnJlcXVpcmUoJy4vVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hMaXN0Jyk7XHJcblxyXG4iLCIvKipcbiAqIGFuZ3VsYXItZ3Jvd2wtdjIgLSB2MC43LjAgLSAyMDE0LTA4LTEwXG4gKiBodHRwOi8vamFuc3RldmVucy5naXRodWIuaW8vYW5ndWxhci1ncm93bC0yXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgTWFyY28gUmluY2ssSmFuIFN0ZXZlbnM7IExpY2Vuc2VkIE1JVFxuICovXG5hbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZ3Jvd2xcIixbXSksYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWdyb3dsXCIpLmRpcmVjdGl2ZShcImdyb3dsXCIsW1wiJHJvb3RTY29wZVwiLFwiJHNjZVwiLGZ1bmN0aW9uKGEsYil7XCJ1c2Ugc3RyaWN0XCI7cmV0dXJue3Jlc3RyaWN0OlwiQVwiLHRlbXBsYXRlVXJsOlwidGVtcGxhdGVzL2dyb3dsL2dyb3dsLmh0bWxcIixyZXBsYWNlOiExLHNjb3BlOntyZWZlcmVuY2U6XCJAXCIsaW5saW5lOlwiQFwiLGxpbWl0TWVzc2FnZXM6XCI9XCJ9LGNvbnRyb2xsZXI6W1wiJHNjb3BlXCIsXCIkdGltZW91dFwiLFwiZ3Jvd2xcIixmdW5jdGlvbihjLGQsZSl7ZnVuY3Rpb24gZihhKXtkKGZ1bmN0aW9uKCl7dmFyIGYsaDtpZighZ3x8KGFuZ3VsYXIuZm9yRWFjaChjLm1lc3NhZ2VzLGZ1bmN0aW9uKGMpe2g9Yi5nZXRUcnVzdGVkSHRtbChjLnRleHQpLGEudGV4dD09PWgmJmEuc2V2ZXJpdHk9PT1jLnNldmVyaXR5JiZjLnRpdGxlPT09Yy50aXRsZSYmKGY9ITApfSksIWYpKXtpZihhLnRleHQ9Yi50cnVzdEFzSHRtbChTdHJpbmcoYS50ZXh0KSksYS50dGwmJi0xIT09YS50dGwmJihhLmNvdW50ZG93bj1hLnR0bC8xZTMsYS5wcm9taXNlcz1bXSxhLmNsb3NlPSExLGEuY291bnRkb3duRnVuY3Rpb249ZnVuY3Rpb24oKXthLmNvdW50ZG93bj4xPyhhLmNvdW50ZG93bi0tLGEucHJvbWlzZXMucHVzaChkKGEuY291bnRkb3duRnVuY3Rpb24sMWUzKSkpOmEuY291bnRkb3duLS19KSxhbmd1bGFyLmlzRGVmaW5lZChjLmxpbWl0TWVzc2FnZXMpKXt2YXIgaT1jLm1lc3NhZ2VzLmxlbmd0aC0oYy5saW1pdE1lc3NhZ2VzLTEpO2k+MCYmYy5tZXNzYWdlcy5zcGxpY2UoYy5saW1pdE1lc3NhZ2VzLTEsaSl9ZS5yZXZlcnNlT3JkZXIoKT9jLm1lc3NhZ2VzLnVuc2hpZnQoYSk6Yy5tZXNzYWdlcy5wdXNoKGEpLGEudHRsJiYtMSE9PWEudHRsJiYoYS5wcm9taXNlcy5wdXNoKGQoZnVuY3Rpb24oKXtjLmRlbGV0ZU1lc3NhZ2UoYSl9LGEudHRsKSksYS5wcm9taXNlcy5wdXNoKGQoYS5jb3VudGRvd25GdW5jdGlvbiwxZTMpKSl9fSwhMCl9dmFyIGc9ZS5vbmx5VW5pcXVlKCk7Yy5tZXNzYWdlcz1bXTt2YXIgaD1jLnJlZmVyZW5jZXx8MDtjLmlubGluZU1lc3NhZ2U9Yy5pbmxpbmV8fGUuaW5saW5lTWVzc2FnZXMoKSxhLiRvbihcImdyb3dsTWVzc2FnZVwiLGZ1bmN0aW9uKGEsYil7cGFyc2VJbnQoaCwxMCk9PT1wYXJzZUludChiLnJlZmVyZW5jZUlkLDEwKSYmZihiKX0pLGMuZGVsZXRlTWVzc2FnZT1mdW5jdGlvbihhKXt2YXIgYj1jLm1lc3NhZ2VzLmluZGV4T2YoYSk7Yj4tMSYmYy5tZXNzYWdlcy5zcGxpY2UoYiwxKX0sYy5zdG9wVGltZW91dENsb3NlPWZ1bmN0aW9uKGEpe2FuZ3VsYXIuZm9yRWFjaChhLnByb21pc2VzLGZ1bmN0aW9uKGEpe2QuY2FuY2VsKGEpfSksYS5jbG9zZT9jLmRlbGV0ZU1lc3NhZ2UoYSk6YS5jbG9zZT0hMH0sYy5hbGVydENsYXNzZXM9ZnVuY3Rpb24oYSl7cmV0dXJue1wiYWxlcnQtc3VjY2Vzc1wiOlwic3VjY2Vzc1wiPT09YS5zZXZlcml0eSxcImFsZXJ0LWVycm9yXCI6XCJlcnJvclwiPT09YS5zZXZlcml0eSxcImFsZXJ0LWRhbmdlclwiOlwiZXJyb3JcIj09PWEuc2V2ZXJpdHksXCJhbGVydC1pbmZvXCI6XCJpbmZvXCI9PT1hLnNldmVyaXR5LFwiYWxlcnQtd2FybmluZ1wiOlwid2FybmluZ1wiPT09YS5zZXZlcml0eSxpY29uOmEuZGlzYWJsZUljb25zPT09ITEsXCJhbGVydC1kaXNtaXNzYWJsZVwiOiFhLmRpc2FibGVDbG9zZUJ1dHRvbn19LGMuc2hvd0NvdW50RG93bj1mdW5jdGlvbihhKXtyZXR1cm4hYS5kaXNhYmxlQ291bnREb3duJiZhLnR0bD4wfSxjLndyYXBwZXJDbGFzc2VzPWZ1bmN0aW9uKCl7dmFyIGE9e307cmV0dXJuIGFbXCJncm93bC1maXhlZFwiXT0hYy5pbmxpbmVNZXNzYWdlLGFbZS5wb3NpdGlvbigpXT0hMCxhfSxjLmNvbXB1dGVUaXRsZT1mdW5jdGlvbihhKXt2YXIgYj17c3VjY2VzczpcIlN1Y2Nlc3NcIixlcnJvcjpcIkVycm9yXCIsaW5mbzpcIkluZm9ybWF0aW9uXCIsd2FybjpcIldhcm5pbmdcIn07cmV0dXJuIGJbYS5zZXZlcml0eV19fV19fV0pLGFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhci1ncm93bFwiKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihhKXtcInVzZSBzdHJpY3RcIjt2b2lkIDA9PT1hLmdldChcInRlbXBsYXRlcy9ncm93bC9ncm93bC5odG1sXCIpJiZhLnB1dChcInRlbXBsYXRlcy9ncm93bC9ncm93bC5odG1sXCIsJzxkaXYgY2xhc3M9XCJncm93bC1jb250YWluZXJcIiBuZy1jbGFzcz1cIndyYXBwZXJDbGFzc2VzKClcIj48ZGl2IGNsYXNzPVwiZ3Jvd2wtaXRlbSBhbGVydFwiIG5nLXJlcGVhdD1cIm1lc3NhZ2UgaW4gbWVzc2FnZXNcIiBuZy1jbGFzcz1cImFsZXJ0Q2xhc3NlcyhtZXNzYWdlKVwiIG5nLWNsaWNrPVwic3RvcFRpbWVvdXRDbG9zZShtZXNzYWdlKVwiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIG5nLWNsaWNrPVwiZGVsZXRlTWVzc2FnZShtZXNzYWdlKVwiIG5nLXNob3c9XCIhbWVzc2FnZS5kaXNhYmxlQ2xvc2VCdXR0b25cIj4mdGltZXM7PC9idXR0b24+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIG5nLXNob3c9XCJzaG93Q291bnREb3duKG1lc3NhZ2UpXCI+e3ttZXNzYWdlLmNvdW50ZG93bn19PC9idXR0b24+PGg0IGNsYXNzPVwiZ3Jvd2wtdGl0bGVcIiBuZy1zaG93PVwibWVzc2FnZS50aXRsZVwiIG5nLWJpbmQ9XCJtZXNzYWdlLnRpdGxlXCI+PC9oND48ZGl2IGNsYXNzPVwiZ3Jvd2wtbWVzc2FnZVwiIG5nLWJpbmQtaHRtbD1cIm1lc3NhZ2UudGV4dFwiPjwvZGl2PjwvZGl2PjwvZGl2PicpfV0pLGFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhci1ncm93bFwiKS5wcm92aWRlcihcImdyb3dsXCIsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgYT17c3VjY2VzczpudWxsLGVycm9yOm51bGwsd2FybmluZzpudWxsLGluZm86bnVsbH0sYj1cIm1lc3NhZ2VzXCIsYz1cInRleHRcIixkPVwidGl0bGVcIixlPVwic2V2ZXJpdHlcIixmPSEwLGc9XCJ2YXJpYWJsZXNcIixoPTAsaT0hMSxqPVwidG9wLXJpZ2h0XCIsaz0hMSxsPSExLG09ITEsbj0hMTt0aGlzLmdsb2JhbFRpbWVUb0xpdmU9ZnVuY3Rpb24oYil7aWYoXCJvYmplY3RcIj09dHlwZW9mIGIpZm9yKHZhciBjIGluIGIpYi5oYXNPd25Qcm9wZXJ0eShjKSYmKGFbY109YltjXSk7ZWxzZSBmb3IodmFyIGQgaW4gYSlhLmhhc093blByb3BlcnR5KGQpJiYoYVtkXT1iKX0sdGhpcy5nbG9iYWxEaXNhYmxlQ2xvc2VCdXR0b249ZnVuY3Rpb24oYSl7az1hfSx0aGlzLmdsb2JhbERpc2FibGVJY29ucz1mdW5jdGlvbihhKXtsPWF9LHRoaXMuZ2xvYmFsUmV2ZXJzZWRPcmRlcj1mdW5jdGlvbihhKXttPWF9LHRoaXMuZ2xvYmFsRGlzYWJsZUNvdW50RG93bj1mdW5jdGlvbihhKXtuPWF9LHRoaXMubWVzc2FnZVZhcmlhYmxlS2V5PWZ1bmN0aW9uKGEpe2c9YX0sdGhpcy5nbG9iYWxJbmxpbmVNZXNzYWdlcz1mdW5jdGlvbihhKXtpPWF9LHRoaXMuZ2xvYmFsUG9zaXRpb249ZnVuY3Rpb24oYSl7aj1hfSx0aGlzLm1lc3NhZ2VzS2V5PWZ1bmN0aW9uKGEpe2I9YX0sdGhpcy5tZXNzYWdlVGV4dEtleT1mdW5jdGlvbihhKXtjPWF9LHRoaXMubWVzc2FnZVRpdGxlS2V5PWZ1bmN0aW9uKGEpe2Q9YX0sdGhpcy5tZXNzYWdlU2V2ZXJpdHlLZXk9ZnVuY3Rpb24oYSl7ZT1hfSx0aGlzLm9ubHlVbmlxdWVNZXNzYWdlcz1mdW5jdGlvbihhKXtmPWF9LHRoaXMuc2VydmVyTWVzc2FnZXNJbnRlcmNlcHRvcj1bXCIkcVwiLFwiZ3Jvd2xcIixmdW5jdGlvbihhLGMpe2Z1bmN0aW9uIGQoYSl7YS5kYXRhW2JdJiZhLmRhdGFbYl0ubGVuZ3RoPjAmJmMuYWRkU2VydmVyTWVzc2FnZXMoYS5kYXRhW2JdKX1yZXR1cm57cmVzcG9uc2U6ZnVuY3Rpb24oYSl7cmV0dXJuIGQoYSksYX0scmVzcG9uc2VFcnJvcjpmdW5jdGlvbihiKXtyZXR1cm4gZChiKSxhLnJlamVjdChiKX19fV0sdGhpcy4kZ2V0PVtcIiRyb290U2NvcGVcIixcIiRpbnRlcnBvbGF0ZVwiLFwiJGZpbHRlclwiLGZ1bmN0aW9uKGIsbyxwKXtmdW5jdGlvbiBxKGEpe2lmKEIpYS50ZXh0PUIoYS50ZXh0LGEudmFyaWFibGVzKTtlbHNle3ZhciBjPW8oYS50ZXh0KTthLnRleHQ9YyhhLnZhcmlhYmxlcyl9Yi4kYnJvYWRjYXN0KFwiZ3Jvd2xNZXNzYWdlXCIsYSl9ZnVuY3Rpb24gcihiLGMsZCl7dmFyIGUsZj1jfHx7fTtlPXt0ZXh0OmIsdGl0bGU6Zi50aXRsZSxzZXZlcml0eTpkLHR0bDpmLnR0bHx8YVtkXSx2YXJpYWJsZXM6Zi52YXJpYWJsZXN8fHt9LGRpc2FibGVDbG9zZUJ1dHRvbjp2b2lkIDA9PT1mLmRpc2FibGVDbG9zZUJ1dHRvbj9rOmYuZGlzYWJsZUNsb3NlQnV0dG9uLGRpc2FibGVJY29uczp2b2lkIDA9PT1mLmRpc2FibGVJY29ucz9sOmYuZGlzYWJsZUljb25zLGRpc2FibGVDb3VudERvd246dm9pZCAwPT09Zi5kaXNhYmxlQ291bnREb3duP246Zi5kaXNhYmxlQ291bnREb3duLHBvc2l0aW9uOmYucG9zaXRpb258fGoscmVmZXJlbmNlSWQ6Zi5yZWZlcmVuY2VJZHx8aH0scShlKX1mdW5jdGlvbiBzKGEsYil7cihhLGIsXCJ3YXJuaW5nXCIpfWZ1bmN0aW9uIHQoYSxiKXtyKGEsYixcImVycm9yXCIpfWZ1bmN0aW9uIHUoYSxiKXtyKGEsYixcImluZm9cIil9ZnVuY3Rpb24gdihhLGIpe3IoYSxiLFwic3VjY2Vzc1wiKX1mdW5jdGlvbiB3KGEpe3ZhciBiLGYsaCxpO2ZvcihpPWEubGVuZ3RoLGI9MDtpPmI7YisrKWlmKGY9YVtiXSxmW2NdKXtoPWZbZV18fFwiZXJyb3JcIjt2YXIgaj17fTtqLnZhcmlhYmxlcz1mW2ddfHx7fSxqLnRpdGxlPWZbZF0scihmW2NdLGosaCl9fWZ1bmN0aW9uIHgoKXtyZXR1cm4gZn1mdW5jdGlvbiB5KCl7cmV0dXJuIG19ZnVuY3Rpb24geigpe3JldHVybiBpfWZ1bmN0aW9uIEEoKXtyZXR1cm4gan12YXIgQjt0cnl7Qj1wKFwidHJhbnNsYXRlXCIpfWNhdGNoKEMpe31yZXR1cm57d2FybmluZzpzLGVycm9yOnQsaW5mbzp1LHN1Y2Nlc3M6dixhZGRTZXJ2ZXJNZXNzYWdlczp3LG9ubHlVbmlxdWU6eCxyZXZlcnNlT3JkZXI6eSxpbmxpbmVNZXNzYWdlczp6LHBvc2l0aW9uOkF9fV19KTsiLCIvKiohXG4gKiBBbmd1bGFySlMgZmlsZSB1cGxvYWQgc2hpbSBmb3IgSFRNTDUgRm9ybURhdGFcbiAqIEBhdXRob3IgIERhbmlhbCAgPGRhbmlhbC5mYXJpZEBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAxLjYuMTJcbiAqL1xuKGZ1bmN0aW9uKCkge1xuXG52YXIgaGFzRmxhc2ggPSBmdW5jdGlvbigpIHtcblx0dHJ5IHtcblx0ICB2YXIgZm8gPSBuZXcgQWN0aXZlWE9iamVjdCgnU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2gnKTtcblx0ICBpZiAoZm8pIHJldHVybiB0cnVlO1xuXHR9IGNhdGNoKGUpIHtcblx0ICBpZiAobmF2aWdhdG9yLm1pbWVUeXBlc1snYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnXSAhPSB1bmRlZmluZWQpIHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxudmFyIHBhdGNoWEhSID0gZnVuY3Rpb24oZm5OYW1lLCBuZXdGbikge1xuXHR3aW5kb3cuWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlW2ZuTmFtZV0gPSBuZXdGbih3aW5kb3cuWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlW2ZuTmFtZV0pO1xufTtcblxuaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuXHRpZiAod2luZG93LkZvcm1EYXRhICYmICghd2luZG93LkZpbGVBUEkgfHwgIUZpbGVBUEkuZm9yY2VMb2FkKSkge1xuXHRcdC8vIGFsbG93IGFjY2VzcyB0byBBbmd1bGFyIFhIUiBwcml2YXRlIGZpZWxkOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2lzc3Vlcy8xOTM0XG5cdFx0cGF0Y2hYSFIoJ3NldFJlcXVlc3RIZWFkZXInLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oaGVhZGVyLCB2YWx1ZSkge1xuXHRcdFx0XHRpZiAoaGVhZGVyID09PSAnX19zZXRYSFJfJykge1xuXHRcdFx0XHRcdHZhciB2YWwgPSB2YWx1ZSh0aGlzKTtcblx0XHRcdFx0XHQvLyBmaXggZm9yIGFuZ3VsYXIgPCAxLjIuMFxuXHRcdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuXHRcdFx0XHRcdFx0dmFsKHRoaXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgaW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyID0gZnVuY3Rpb24oeGhyKSB7XG5cdFx0XHRpZiAoIXhoci5fX2xpc3RlbmVycykge1xuXHRcdFx0XHRpZiAoIXhoci51cGxvYWQpIHhoci51cGxvYWQgPSB7fTtcblx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzID0gW107XG5cdFx0XHRcdHZhciBvcmlnQWRkRXZlbnRMaXN0ZW5lciA9IHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcjtcblx0XHRcdFx0eGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odCwgZm4sIGIpIHtcblx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbdF0gPSBmbjtcblx0XHRcdFx0XHRvcmlnQWRkRXZlbnRMaXN0ZW5lciAmJiBvcmlnQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRwYXRjaFhIUignb3BlbicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihtLCB1cmwsIGIpIHtcblx0XHRcdFx0aW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyKHRoaXMpO1xuXHRcdFx0XHR0aGlzLl9fdXJsID0gdXJsO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgW20sIHVybCwgYl0pO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0aWYgKGUubWVzc2FnZS5pbmRleE9mKCdBY2Nlc3MgaXMgZGVuaWVkJykgPiAtMSkge1xuXHRcdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBbbSwgJ19maXhfZm9yX2llX2Nyb3NzZG9tYWluX18nLCBiXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignZ2V0UmVzcG9uc2VIZWFkZXInLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oaCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX2ZpbGVBcGlYSFIgJiYgdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0UmVzcG9uc2VIZWFkZXIgPyB0aGlzLl9fZmlsZUFwaVhIUi5nZXRSZXNwb25zZUhlYWRlcihoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzLCBbaF0pKTtcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX2ZpbGVBcGlYSFIgJiYgdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID8gdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgOiAob3JpZyA9PSBudWxsID8gbnVsbCA6IG9yaWcuYXBwbHkodGhpcykpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ2Fib3J0JywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX2ZpbGVBcGlYSFIgJiYgdGhpcy5fX2ZpbGVBcGlYSFIuYWJvcnQgPyB0aGlzLl9fZmlsZUFwaVhIUi5hYm9ydCgpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdzZXRSZXF1ZXN0SGVhZGVyJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcblx0XHRcdFx0aWYgKGhlYWRlciA9PT0gJ19fc2V0WEhSXycpIHtcblx0XHRcdFx0XHRpbml0aWFsaXplVXBsb2FkTGlzdGVuZXIodGhpcyk7XG5cdFx0XHRcdFx0dmFyIHZhbCA9IHZhbHVlKHRoaXMpO1xuXHRcdFx0XHRcdC8vIGZpeCBmb3IgYW5ndWxhciA8IDEuMi4wXG5cdFx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHR2YWwodGhpcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuX19yZXF1ZXN0SGVhZGVycyA9IHRoaXMuX19yZXF1ZXN0SGVhZGVycyB8fCB7fTtcblx0XHRcdFx0XHR0aGlzLl9fcmVxdWVzdEhlYWRlcnNbaGVhZGVyXSA9IHZhbHVlO1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ3NlbmQnLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB4aHIgPSB0aGlzO1xuXHRcdFx0XHRpZiAoYXJndW1lbnRzWzBdICYmIGFyZ3VtZW50c1swXS5fX2lzU2hpbSkge1xuXHRcdFx0XHRcdHZhciBmb3JtRGF0YSA9IGFyZ3VtZW50c1swXTtcblx0XHRcdFx0XHR2YXIgY29uZmlnID0ge1xuXHRcdFx0XHRcdFx0dXJsOiB4aHIuX191cmwsXG5cdFx0XHRcdFx0XHRqc29ucDogZmFsc2UsIC8vcmVtb3ZlcyB0aGUgY2FsbGJhY2sgZm9ybSBwYXJhbVxuXHRcdFx0XHRcdFx0Y2FjaGU6IHRydWUsIC8vcmVtb3ZlcyB0aGUgP2ZpbGVhcGlYWFggaW4gdGhlIHVybFxuXHRcdFx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKGVyciwgZmlsZUFwaVhIUikge1xuXHRcdFx0XHRcdFx0XHR4aHIuX19jb21wbGV0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRpZiAoIWVyciAmJiB4aHIuX19saXN0ZW5lcnNbJ2xvYWQnXSkgXG5cdFx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydsb2FkJ10oe3R5cGU6ICdsb2FkJywgbG9hZGVkOiB4aHIuX19sb2FkZWQsIHRvdGFsOiB4aHIuX190b3RhbCwgdGFyZ2V0OiB4aHIsIGxlbmd0aENvbXB1dGFibGU6IHRydWV9KTtcblx0XHRcdFx0XHRcdFx0aWYgKCFlcnIgJiYgeGhyLl9fbGlzdGVuZXJzWydsb2FkZW5kJ10pIFxuXHRcdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1snbG9hZGVuZCddKHt0eXBlOiAnbG9hZGVuZCcsIGxvYWRlZDogeGhyLl9fbG9hZGVkLCB0b3RhbDogeGhyLl9fdG90YWwsIHRhcmdldDogeGhyLCBsZW5ndGhDb21wdXRhYmxlOiB0cnVlfSk7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIgPT09ICdhYm9ydCcgJiYgeGhyLl9fbGlzdGVuZXJzWydhYm9ydCddKSBcblx0XHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ2Fib3J0J10oe3R5cGU6ICdhYm9ydCcsIGxvYWRlZDogeGhyLl9fbG9hZGVkLCB0b3RhbDogeGhyLl9fdG90YWwsIHRhcmdldDogeGhyLCBsZW5ndGhDb21wdXRhYmxlOiB0cnVlfSk7XG5cdFx0XHRcdFx0XHRcdGlmIChmaWxlQXBpWEhSLnN0YXR1cyAhPT0gdW5kZWZpbmVkKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAnc3RhdHVzJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIChmaWxlQXBpWEhSLnN0YXR1cyA9PSAwICYmIGVyciAmJiBlcnIgIT09ICdhYm9ydCcpID8gNTAwIDogZmlsZUFwaVhIUi5zdGF0dXN9fSk7XG5cdFx0XHRcdFx0XHRcdGlmIChmaWxlQXBpWEhSLnN0YXR1c1RleHQgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3N0YXR1c1RleHQnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gZmlsZUFwaVhIUi5zdGF0dXNUZXh0fX0pO1xuXHRcdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVhZHlTdGF0ZScsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiA0fX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZmlsZUFwaVhIUi5yZXNwb25zZSAhPT0gdW5kZWZpbmVkKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVzcG9uc2UnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gZmlsZUFwaVhIUi5yZXNwb25zZX19KTtcblx0XHRcdFx0XHRcdFx0dmFyIHJlc3AgPSBmaWxlQXBpWEhSLnJlc3BvbnNlVGV4dCB8fCAoZXJyICYmIGZpbGVBcGlYSFIuc3RhdHVzID09IDAgJiYgZXJyICE9PSAnYWJvcnQnID8gZXJyIDogdW5kZWZpbmVkKTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3Jlc3BvbnNlVGV4dCcsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiByZXNwfX0pO1xuXHRcdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVzcG9uc2UnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gcmVzcH19KTtcblx0XHRcdFx0XHRcdFx0aWYgKGVycikgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ2VycicsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiBlcnJ9fSk7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2ZpbGVBcGlYSFIgPSBmaWxlQXBpWEhSO1xuXHRcdFx0XHRcdFx0XHRpZiAoeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSkgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSgpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGZpbGVwcm9ncmVzczogZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFx0XHRlLnRhcmdldCA9IHhocjtcblx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydwcm9ncmVzcyddICYmIHhoci5fX2xpc3RlbmVyc1sncHJvZ3Jlc3MnXShlKTtcblx0XHRcdFx0XHRcdFx0eGhyLl9fdG90YWwgPSBlLnRvdGFsO1xuXHRcdFx0XHRcdFx0XHR4aHIuX19sb2FkZWQgPSBlLmxvYWRlZDtcblx0XHRcdFx0XHRcdFx0aWYgKGUudG90YWwgPT09IGUubG9hZGVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gZml4IGZsYXNoIGlzc3VlIHRoYXQgZG9lc24ndCBjYWxsIGNvbXBsZXRlIGlmIHRoZXJlIGlzIG5vIHJlc3BvbnNlIHRleHQgZnJvbSB0aGUgc2VydmVyICBcblx0XHRcdFx0XHRcdFx0XHR2YXIgX3RoaXMgPSB0aGlzXG5cdFx0XHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICgheGhyLl9fY29tcGxldGVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMgPSBmdW5jdGlvbigpe307XG5cdFx0XHRcdFx0XHRcdFx0XHRcdF90aGlzLmNvbXBsZXRlKG51bGwsIHtzdGF0dXM6IDIwNCwgc3RhdHVzVGV4dDogJ05vIENvbnRlbnQnfSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSwgMTAwMDApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0aGVhZGVyczogeGhyLl9fcmVxdWVzdEhlYWRlcnNcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uZmlnLmRhdGEgPSB7fTtcblx0XHRcdFx0XHRjb25maWcuZmlsZXMgPSB7fVxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZm9ybURhdGEuZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGl0ZW0gPSBmb3JtRGF0YS5kYXRhW2ldO1xuXHRcdFx0XHRcdFx0aWYgKGl0ZW0udmFsICE9IG51bGwgJiYgaXRlbS52YWwubmFtZSAhPSBudWxsICYmIGl0ZW0udmFsLnNpemUgIT0gbnVsbCAmJiBpdGVtLnZhbC50eXBlICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Y29uZmlnLmZpbGVzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uZmlnLmRhdGFbaXRlbS5rZXldID0gaXRlbS52YWw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICghaGFzRmxhc2goKSkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyAnQWRvZGUgRmxhc2ggUGxheWVyIG5lZWQgdG8gYmUgaW5zdGFsbGVkLiBUbyBjaGVjayBhaGVhZCB1c2UgXCJGaWxlQVBJLmhhc0ZsYXNoXCInO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0eGhyLl9fZmlsZUFwaVhIUiA9IEZpbGVBUEkudXBsb2FkKGNvbmZpZyk7XG5cdFx0XHRcdFx0fSwgMSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh4aHIsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHR3aW5kb3cuWE1MSHR0cFJlcXVlc3QuX19pc1NoaW0gPSB0cnVlO1xufVxuXG5pZiAoIXdpbmRvdy5Gb3JtRGF0YSB8fCAod2luZG93LkZpbGVBUEkgJiYgRmlsZUFQSS5mb3JjZUxvYWQpKSB7XG5cdHZhciBhZGRGbGFzaCA9IGZ1bmN0aW9uKGVsZW0pIHtcblx0XHRpZiAoIWhhc0ZsYXNoKCkpIHtcblx0XHRcdHRocm93ICdBZG9kZSBGbGFzaCBQbGF5ZXIgbmVlZCB0byBiZSBpbnN0YWxsZWQuIFRvIGNoZWNrIGFoZWFkIHVzZSBcIkZpbGVBUEkuaGFzRmxhc2hcIic7XG5cdFx0fVxuXHRcdHZhciBlbCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtKTtcblx0XHRpZiAoIWVsLmF0dHIoJ2Rpc2FibGVkJykpIHtcblx0XHRcdGlmICghZWwuaGFzQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpICYmIChlbGVtLmdldEF0dHJpYnV0ZSgnbmctZmlsZS1zZWxlY3QnKSAhPSBudWxsIHx8IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLW5nLWZpbGUtc2VsZWN0JykgIT0gbnVsbCkpIHtcblx0XHRcdFx0aWYgKEZpbGVBUEkud3JhcEluc2lkZURpdikge1xuXHRcdFx0XHRcdHZhciB3cmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdFx0d3JhcC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImpzLWZpbGVhcGktd3JhcHBlclwiIHN0eWxlPVwicG9zaXRpb246cmVsYXRpdmU7IG92ZXJmbG93OmhpZGRlblwiPjwvZGl2Pic7XG5cdFx0XHRcdFx0d3JhcCA9IHdyYXAuZmlyc3RDaGlsZDtcblx0XHRcdFx0XHR2YXIgcGFyZW50ID0gZWxlbS5wYXJlbnROb2RlO1xuXHRcdFx0XHRcdHBhcmVudC5pbnNlcnRCZWZvcmUod3JhcCwgZWxlbSk7XG5cdFx0XHRcdFx0cGFyZW50LnJlbW92ZUNoaWxkKGVsZW0pO1xuXHRcdFx0XHRcdHdyYXAuYXBwZW5kQ2hpbGQoZWxlbSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZWwuYWRkQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpO1xuXHRcdFx0XHRcdGlmIChlbC5wYXJlbnQoKVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfKSB7XG5cdFx0XHRcdFx0XHRpZiAoZWwucGFyZW50KCkuY3NzKCdwb3NpdGlvbicpID09PSAnJyB8fCBlbC5wYXJlbnQoKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG5cdFx0XHRcdFx0XHRcdGVsLnBhcmVudCgpLmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsLmNzcygndG9wJywgMCkuY3NzKCdib3R0b20nLCAwKS5jc3MoJ2xlZnQnLCAwKS5jc3MoJ3JpZ2h0JywgMCkuY3NzKCd3aWR0aCcsICcxMDAlJykuY3NzKCdoZWlnaHQnLCAnMTAwJScpLlxuXHRcdFx0XHRcdFx0XHRjc3MoJ3BhZGRpbmcnLCAwKS5jc3MoJ21hcmdpbicsIDApO1xuXHRcdFx0XHRcdFx0ZWwucGFyZW50KCkudW5iaW5kKCdjbGljaycsIGVsLnBhcmVudCgpWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0dmFyIGNoYW5nZUZuV3JhcHBlciA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIGZpbGVzID0gRmlsZUFQSS5nZXRGaWxlcyhldnQpO1xuXHRcdFx0Ly9qdXN0IGEgZG91YmxlIGNoZWNrIGZvciAjMjMzXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChmaWxlc1tpXS5zaXplID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLnNpemUgPSAwO1xuXHRcdFx0XHRpZiAoZmlsZXNbaV0ubmFtZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS5uYW1lID0gJ2ZpbGUnO1xuXHRcdFx0XHRpZiAoZmlsZXNbaV0udHlwZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS50eXBlID0gJ3VuZGVmaW5lZCc7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIWV2dC50YXJnZXQpIHtcblx0XHRcdFx0ZXZ0LnRhcmdldCA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0ZXZ0LnRhcmdldC5maWxlcyA9IGZpbGVzO1xuXHRcdFx0Ly8gaWYgZXZ0LnRhcmdldC5maWxlcyBpcyBub3Qgd3JpdGFibGUgdXNlIGhlbHBlciBmaWVsZFxuXHRcdFx0aWYgKGV2dC50YXJnZXQuZmlsZXMgIT0gZmlsZXMpIHtcblx0XHRcdFx0ZXZ0Ll9fZmlsZXNfID0gZmlsZXM7XG5cdFx0XHR9XG5cdFx0XHQoZXZ0Ll9fZmlsZXNfIHx8IGV2dC50YXJnZXQuZmlsZXMpLml0ZW0gPSBmdW5jdGlvbihpKSB7XG5cdFx0XHRcdHJldHVybiAoZXZ0Ll9fZmlsZXNfIHx8IGV2dC50YXJnZXQuZmlsZXMpW2ldIHx8IG51bGw7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZm4pIGZuLmFwcGx5KHRoaXMsIFtldnRdKTtcblx0XHR9O1xuXHR9O1xuXHR2YXIgaXNGaWxlQ2hhbmdlID0gZnVuY3Rpb24oZWxlbSwgZSkge1xuXHRcdHJldHVybiAoZS50b0xvd2VyQ2FzZSgpID09PSAnY2hhbmdlJyB8fCBlLnRvTG93ZXJDYXNlKCkgPT09ICdvbmNoYW5nZScpICYmIGVsZW0uZ2V0QXR0cmlidXRlKCd0eXBlJykgPT0gJ2ZpbGUnO1xuXHR9XG5cdGlmIChIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyKSB7XG5cdFx0SFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IChmdW5jdGlvbihvcmlnQWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGUsIGZuLCBiLCBkKSB7XG5cdFx0XHRcdGlmIChpc0ZpbGVDaGFuZ2UodGhpcywgZSkpIHtcblx0XHRcdFx0XHRhZGRGbGFzaCh0aGlzKTtcblx0XHRcdFx0XHRvcmlnQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBbZSwgY2hhbmdlRm5XcmFwcGVyKGZuKSwgYiwgZF0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWdBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIFtlLCBmbiwgYiwgZF0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcik7XG5cdH1cblx0aWYgKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmF0dGFjaEV2ZW50KSB7XG5cdFx0SFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYXR0YWNoRXZlbnQgPSAoZnVuY3Rpb24ob3JpZ0F0dGFjaEV2ZW50KSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oZSwgZm4pIHtcblx0XHRcdFx0aWYgKGlzRmlsZUNoYW5nZSh0aGlzLCBlKSkge1xuXHRcdFx0XHRcdGFkZEZsYXNoKHRoaXMpO1xuXHRcdFx0XHRcdGlmICh3aW5kb3cualF1ZXJ5KSB7XG5cdFx0XHRcdFx0XHQvLyBmaXggZm9yICMyODEgalF1ZXJ5IG9uIElFOFxuXHRcdFx0XHRcdFx0YW5ndWxhci5lbGVtZW50KHRoaXMpLmJpbmQoJ2NoYW5nZScsIGNoYW5nZUZuV3JhcHBlcihudWxsKSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9yaWdBdHRhY2hFdmVudC5hcHBseSh0aGlzLCBbZSwgY2hhbmdlRm5XcmFwcGVyKGZuKV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnQXR0YWNoRXZlbnQuYXBwbHkodGhpcywgW2UsIGZuXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KShIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hdHRhY2hFdmVudCk7XG5cdH1cblxuXHR3aW5kb3cuRm9ybURhdGEgPSBGb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRhcHBlbmQ6IGZ1bmN0aW9uKGtleSwgdmFsLCBuYW1lKSB7XG5cdFx0XHRcdHRoaXMuZGF0YS5wdXNoKHtcblx0XHRcdFx0XHRrZXk6IGtleSxcblx0XHRcdFx0XHR2YWw6IHZhbCxcblx0XHRcdFx0XHRuYW1lOiBuYW1lXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdGRhdGE6IFtdLFxuXHRcdFx0X19pc1NoaW06IHRydWVcblx0XHR9O1xuXHR9O1xuXG5cdChmdW5jdGlvbiAoKSB7XG5cdFx0Ly9sb2FkIEZpbGVBUElcblx0XHRpZiAoIXdpbmRvdy5GaWxlQVBJKSB7XG5cdFx0XHR3aW5kb3cuRmlsZUFQSSA9IHt9O1xuXHRcdH1cblx0XHRpZiAoRmlsZUFQSS5mb3JjZUxvYWQpIHtcblx0XHRcdEZpbGVBUEkuaHRtbDUgPSBmYWxzZTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKCFGaWxlQVBJLnVwbG9hZCkge1xuXHRcdFx0dmFyIGpzVXJsLCBiYXNlUGF0aCwgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JyksIGFsbFNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JyksIGksIGluZGV4LCBzcmM7XG5cdFx0XHRpZiAod2luZG93LkZpbGVBUEkuanNVcmwpIHtcblx0XHRcdFx0anNVcmwgPSB3aW5kb3cuRmlsZUFQSS5qc1VybDtcblx0XHRcdH0gZWxzZSBpZiAod2luZG93LkZpbGVBUEkuanNQYXRoKSB7XG5cdFx0XHRcdGJhc2VQYXRoID0gd2luZG93LkZpbGVBUEkuanNQYXRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGFsbFNjcmlwdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRzcmMgPSBhbGxTY3JpcHRzW2ldLnNyYztcblx0XHRcdFx0XHRpbmRleCA9IHNyYy5pbmRleE9mKCdhbmd1bGFyLWZpbGUtdXBsb2FkLXNoaW0uanMnKVxuXHRcdFx0XHRcdGlmIChpbmRleCA9PSAtMSkge1xuXHRcdFx0XHRcdFx0aW5kZXggPSBzcmMuaW5kZXhPZignYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLm1pbi5qcycpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0XHRcdFx0YmFzZVBhdGggPSBzcmMuc3Vic3RyaW5nKDAsIGluZGV4KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoRmlsZUFQSS5zdGF0aWNQYXRoID09IG51bGwpIEZpbGVBUEkuc3RhdGljUGF0aCA9IGJhc2VQYXRoO1xuXHRcdFx0c2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywganNVcmwgfHwgYmFzZVBhdGggKyAnRmlsZUFQSS5taW4uanMnKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblx0XHRcdEZpbGVBUEkuaGFzRmxhc2ggPSBoYXNGbGFzaCgpO1xuXHRcdH1cblx0fSkoKTtcblx0RmlsZUFQSS5kaXNhYmxlRmlsZUlucHV0ID0gZnVuY3Rpb24oZWxlbSwgZGlzYWJsZSkge1xuXHRcdGlmIChkaXNhYmxlKSB7XG5cdFx0XHRlbGVtLnJlbW92ZUNsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbGVtLmFkZENsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKTtcblx0XHR9XG5cdH1cbn1cblxuXG5pZiAoIXdpbmRvdy5GaWxlUmVhZGVyKSB7XG5cdHdpbmRvdy5GaWxlUmVhZGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcywgbG9hZFN0YXJ0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLmxpc3RlbmVycyA9IHt9O1xuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGZuKSB7XG5cdFx0XHRfdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSBfdGhpcy5saXN0ZW5lcnNbdHlwZV0gfHwgW107XG5cdFx0XHRfdGhpcy5saXN0ZW5lcnNbdHlwZV0ucHVzaChmbik7XG5cdFx0fTtcblx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBmbikge1xuXHRcdFx0X3RoaXMubGlzdGVuZXJzW3R5cGVdICYmIF90aGlzLmxpc3RlbmVyc1t0eXBlXS5zcGxpY2UoX3RoaXMubGlzdGVuZXJzW3R5cGVdLmluZGV4T2YoZm4pLCAxKTtcblx0XHR9O1xuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIGxpc3QgPSBfdGhpcy5saXN0ZW5lcnNbZXZ0LnR5cGVdO1xuXHRcdFx0aWYgKGxpc3QpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bGlzdFtpXS5jYWxsKF90aGlzLCBldnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLm9uYWJvcnQgPSB0aGlzLm9uZXJyb3IgPSB0aGlzLm9ubG9hZCA9IHRoaXMub25sb2Fkc3RhcnQgPSB0aGlzLm9ubG9hZGVuZCA9IHRoaXMub25wcm9ncmVzcyA9IG51bGw7XG5cblx0XHR2YXIgY29uc3RydWN0RXZlbnQgPSBmdW5jdGlvbih0eXBlLCBldnQpIHtcblx0XHRcdHZhciBlID0ge3R5cGU6IHR5cGUsIHRhcmdldDogX3RoaXMsIGxvYWRlZDogZXZ0LmxvYWRlZCwgdG90YWw6IGV2dC50b3RhbCwgZXJyb3I6IGV2dC5lcnJvcn07XG5cdFx0XHRpZiAoZXZ0LnJlc3VsdCAhPSBudWxsKSBlLnRhcmdldC5yZXN1bHQgPSBldnQucmVzdWx0O1xuXHRcdFx0cmV0dXJuIGU7XG5cdFx0fTtcblx0XHR2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbihldnQpIHtcblx0XHRcdGlmICghbG9hZFN0YXJ0ZWQpIHtcblx0XHRcdFx0bG9hZFN0YXJ0ZWQgPSB0cnVlO1xuXHRcdFx0XHRfdGhpcy5vbmxvYWRzdGFydCAmJiB0aGlzLm9ubG9hZHN0YXJ0KGNvbnN0cnVjdEV2ZW50KCdsb2Fkc3RhcnQnLCBldnQpKTtcblx0XHRcdH1cblx0XHRcdGlmIChldnQudHlwZSA9PT0gJ2xvYWQnKSB7XG5cdFx0XHRcdF90aGlzLm9ubG9hZGVuZCAmJiBfdGhpcy5vbmxvYWRlbmQoY29uc3RydWN0RXZlbnQoJ2xvYWRlbmQnLCBldnQpKTtcblx0XHRcdFx0dmFyIGUgPSBjb25zdHJ1Y3RFdmVudCgnbG9hZCcsIGV2dCk7XG5cdFx0XHRcdF90aGlzLm9ubG9hZCAmJiBfdGhpcy5vbmxvYWQoZSk7XG5cdFx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG5cdFx0XHR9IGVsc2UgaWYgKGV2dC50eXBlID09PSAncHJvZ3Jlc3MnKSB7XG5cdFx0XHRcdHZhciBlID0gY29uc3RydWN0RXZlbnQoJ3Byb2dyZXNzJywgZXZ0KTtcblx0XHRcdFx0X3RoaXMub25wcm9ncmVzcyAmJiBfdGhpcy5vbnByb2dyZXNzKGUpO1xuXHRcdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGUgPSBjb25zdHJ1Y3RFdmVudCgnZXJyb3InLCBldnQpO1xuXHRcdFx0XHRfdGhpcy5vbmVycm9yICYmIF90aGlzLm9uZXJyb3IoZSk7XG5cdFx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLnJlYWRBc0FycmF5QnVmZmVyID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNCaW5hcnlTdHJpbmcoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0XHR0aGlzLnJlYWRBc0JpbmFyeVN0cmluZyA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzQmluYXJ5U3RyaW5nKGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdFx0dGhpcy5yZWFkQXNEYXRhVVJMID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNEYXRhVVJMKGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdFx0dGhpcy5yZWFkQXNUZXh0ID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNUZXh0KGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdH1cbn1cblxufSkoKTtcbiIsIi8qKiFcbiAqIEFuZ3VsYXJKUyBmaWxlIHVwbG9hZC9kcm9wIGRpcmVjdGl2ZSB3aXRoIGh0dHAgcG9zdCBhbmQgcHJvZ3Jlc3NcbiAqIEBhdXRob3IgIERhbmlhbCAgPGRhbmlhbC5mYXJpZEBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAxLjYuMTJcbiAqL1xuKGZ1bmN0aW9uKCkge1xuXG52YXIgYW5ndWxhckZpbGVVcGxvYWQgPSBhbmd1bGFyLm1vZHVsZSgnYW5ndWxhckZpbGVVcGxvYWQnLCBbXSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLnNlcnZpY2UoJyR1cGxvYWQnLCBbJyRodHRwJywgJyRxJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJGh0dHAsICRxLCAkdGltZW91dCkge1xuXHRmdW5jdGlvbiBzZW5kSHR0cChjb25maWcpIHtcblx0XHRjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZCB8fCAnUE9TVCc7XG5cdFx0Y29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblx0XHRjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0IHx8IGZ1bmN0aW9uKGRhdGEsIGhlYWRlcnNHZXR0ZXIpIHtcblx0XHRcdGlmICh3aW5kb3cuQXJyYXlCdWZmZXIgJiYgZGF0YSBpbnN0YW5jZW9mIHdpbmRvdy5BcnJheUJ1ZmZlcikge1xuXHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAkaHR0cC5kZWZhdWx0cy50cmFuc2Zvcm1SZXF1ZXN0WzBdKGRhdGEsIGhlYWRlcnNHZXR0ZXIpO1xuXHRcdH07XG5cdFx0dmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuXHRcdGlmICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QuX19pc1NoaW0pIHtcblx0XHRcdGNvbmZpZy5oZWFkZXJzWydfX3NldFhIUl8nXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oeGhyKSB7XG5cdFx0XHRcdFx0aWYgKCF4aHIpIHJldHVybjtcblx0XHRcdFx0XHRjb25maWcuX19YSFIgPSB4aHI7XG5cdFx0XHRcdFx0Y29uZmlnLnhockZuICYmIGNvbmZpZy54aHJGbih4aHIpO1xuXHRcdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XHRkZWZlcnJlZC5ub3RpZnkoZSk7XG5cdFx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHRcdC8vZml4IGZvciBmaXJlZm94IG5vdCBmaXJpbmcgdXBsb2FkIHByb2dyZXNzIGVuZCwgYWxzbyBJRTgtOVxuXHRcdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdGlmIChlLmxlbmd0aENvbXB1dGFibGUpIHtcblx0XHRcdFx0XHRcdFx0ZGVmZXJyZWQubm90aWZ5KGUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdFx0fTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0JGh0dHAoY29uZmlnKS50aGVuKGZ1bmN0aW9uKHIpe2RlZmVycmVkLnJlc29sdmUocil9LCBmdW5jdGlvbihlKXtkZWZlcnJlZC5yZWplY3QoZSl9LCBmdW5jdGlvbihuKXtkZWZlcnJlZC5ub3RpZnkobil9KTtcblx0XHRcblx0XHR2YXIgcHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2U7XG5cdFx0cHJvbWlzZS5zdWNjZXNzID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRmbihyZXNwb25zZS5kYXRhLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlLmhlYWRlcnMsIGNvbmZpZyk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cblx0XHRwcm9taXNlLmVycm9yID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdHByb21pc2UudGhlbihudWxsLCBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRmbihyZXNwb25zZS5kYXRhLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlLmhlYWRlcnMsIGNvbmZpZyk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cblx0XHRwcm9taXNlLnByb2dyZXNzID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdHByb21pc2UudGhlbihudWxsLCBudWxsLCBmdW5jdGlvbih1cGRhdGUpIHtcblx0XHRcdFx0Zm4odXBkYXRlKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblx0XHRwcm9taXNlLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoY29uZmlnLl9fWEhSKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGNvbmZpZy5fX1hIUi5hYm9ydCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cdFx0cHJvbWlzZS54aHIgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0Y29uZmlnLnhockZuID0gKGZ1bmN0aW9uKG9yaWdYaHJGbikge1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0b3JpZ1hockZuICYmIG9yaWdYaHJGbi5hcHBseShwcm9taXNlLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdGZuLmFwcGx5KHByb21pc2UsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKGNvbmZpZy54aHJGbik7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXHRcdFxuXHRcdHJldHVybiBwcm9taXNlO1xuXHR9XG5cblx0dGhpcy51cGxvYWQgPSBmdW5jdGlvbihjb25maWcpIHtcblx0XHRjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXHRcdGNvbmZpZy5oZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHVuZGVmaW5lZDtcblx0XHRjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0IHx8ICRodHRwLmRlZmF1bHRzLnRyYW5zZm9ybVJlcXVlc3Q7XG5cdFx0dmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0dmFyIG9yaWdUcmFuc2Zvcm1SZXF1ZXN0ID0gY29uZmlnLnRyYW5zZm9ybVJlcXVlc3Q7XG5cdFx0dmFyIG9yaWdEYXRhID0gY29uZmlnLmRhdGE7XG5cdFx0Y29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgPSBmdW5jdGlvbihmb3JtRGF0YSwgaGVhZGVyR2V0dGVyKSB7XG5cdFx0XHRpZiAob3JpZ0RhdGEpIHtcblx0XHRcdFx0aWYgKGNvbmZpZy5mb3JtRGF0YUFwcGVuZGVyKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9yaWdEYXRhKSB7XG5cdFx0XHRcdFx0XHR2YXIgdmFsID0gb3JpZ0RhdGFba2V5XTtcblx0XHRcdFx0XHRcdGNvbmZpZy5mb3JtRGF0YUFwcGVuZGVyKGZvcm1EYXRhLCBrZXksIHZhbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBvcmlnRGF0YSkge1xuXHRcdFx0XHRcdFx0dmFyIHZhbCA9IG9yaWdEYXRhW2tleV07XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9yaWdUcmFuc2Zvcm1SZXF1ZXN0ID09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0dmFsID0gb3JpZ1RyYW5zZm9ybVJlcXVlc3QodmFsLCBoZWFkZXJHZXR0ZXIpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvcmlnVHJhbnNmb3JtUmVxdWVzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdHZhciB0cmFuc2Zvcm1GbiA9IG9yaWdUcmFuc2Zvcm1SZXF1ZXN0W2ldO1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdHJhbnNmb3JtRm4gPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFsID0gdHJhbnNmb3JtRm4odmFsLCBoZWFkZXJHZXR0ZXIpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGtleSwgdmFsKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbmZpZy5maWxlICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIGZpbGVGb3JtTmFtZSA9IGNvbmZpZy5maWxlRm9ybURhdGFOYW1lIHx8ICdmaWxlJztcblxuXHRcdFx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGNvbmZpZy5maWxlKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuXHRcdFx0XHRcdHZhciBpc0ZpbGVGb3JtTmFtZVN0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChmaWxlRm9ybU5hbWUpID09PSAnW29iamVjdCBTdHJpbmddJztcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNvbmZpZy5maWxlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRmb3JtRGF0YS5hcHBlbmQoaXNGaWxlRm9ybU5hbWVTdHJpbmcgPyBmaWxlRm9ybU5hbWUgOiBmaWxlRm9ybU5hbWVbaV0sIGNvbmZpZy5maWxlW2ldLCBcblx0XHRcdFx0XHRcdFx0XHQoY29uZmlnLmZpbGVOYW1lICYmIGNvbmZpZy5maWxlTmFtZVtpXSkgfHwgY29uZmlnLmZpbGVbaV0ubmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChmaWxlRm9ybU5hbWUsIGNvbmZpZy5maWxlLCBjb25maWcuZmlsZU5hbWUgfHwgY29uZmlnLmZpbGUubmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmb3JtRGF0YTtcblx0XHR9O1xuXG5cdFx0Y29uZmlnLmRhdGEgPSBmb3JtRGF0YTtcblxuXHRcdHJldHVybiBzZW5kSHR0cChjb25maWcpO1xuXHR9O1xuXG5cdHRoaXMuaHR0cCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdHJldHVybiBzZW5kSHR0cChjb25maWcpO1xuXHR9XG59XSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdGaWxlU2VsZWN0JywgWyAnJHBhcnNlJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJHBhcnNlLCAkdGltZW91dCkge1xuXHRyZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHIpIHtcblx0XHR2YXIgZm4gPSAkcGFyc2UoYXR0clsnbmdGaWxlU2VsZWN0J10pO1xuXHRcdGlmIChlbGVtWzBdLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2lucHV0JyB8fCAoZWxlbS5hdHRyKCd0eXBlJykgJiYgZWxlbS5hdHRyKCd0eXBlJykudG9Mb3dlckNhc2UoKSkgIT09ICdmaWxlJykge1xuXHRcdFx0dmFyIGZpbGVFbGVtID0gYW5ndWxhci5lbGVtZW50KCc8aW5wdXQgdHlwZT1cImZpbGVcIj4nKVxuXHRcdFx0dmFyIGF0dHJzID0gZWxlbVswXS5hdHRyaWJ1dGVzO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoYXR0cnNbaV0ubmFtZS50b0xvd2VyQ2FzZSgpICE9PSAndHlwZScpIHtcblx0XHRcdFx0XHRmaWxlRWxlbS5hdHRyKGF0dHJzW2ldLm5hbWUsIGF0dHJzW2ldLnZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGF0dHJbXCJtdWx0aXBsZVwiXSkgZmlsZUVsZW0uYXR0cihcIm11bHRpcGxlXCIsIFwidHJ1ZVwiKTtcblx0XHRcdGZpbGVFbGVtLmNzcyhcIndpZHRoXCIsIFwiMXB4XCIpLmNzcyhcImhlaWdodFwiLCBcIjFweFwiKS5jc3MoXCJvcGFjaXR5XCIsIDApLmNzcyhcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIikuY3NzKCdmaWx0ZXInLCAnYWxwaGEob3BhY2l0eT0wKScpXG5cdFx0XHRcdFx0LmNzcyhcInBhZGRpbmdcIiwgMCkuY3NzKFwibWFyZ2luXCIsIDApLmNzcyhcIm92ZXJmbG93XCIsIFwiaGlkZGVuXCIpO1xuXHRcdFx0ZmlsZUVsZW0uYXR0cignX193cmFwcGVyX2Zvcl9wYXJlbnRfJywgdHJ1ZSk7XG5cbi8vXHRcdFx0ZmlsZUVsZW0uY3NzKFwidG9wXCIsIDApLmNzcyhcImJvdHRvbVwiLCAwKS5jc3MoXCJsZWZ0XCIsIDApLmNzcyhcInJpZ2h0XCIsIDApLmNzcyhcIndpZHRoXCIsIFwiMTAwJVwiKS5cbi8vXHRcdFx0XHRcdGNzcyhcIm9wYWNpdHlcIiwgMCkuY3NzKFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiKS5jc3MoJ2ZpbHRlcicsICdhbHBoYShvcGFjaXR5PTApJykuY3NzKFwicGFkZGluZ1wiLCAwKS5jc3MoXCJtYXJnaW5cIiwgMCk7XG5cdFx0XHRlbGVtLmFwcGVuZChmaWxlRWxlbSk7XG5cdFx0XHRlbGVtWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8gID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZpbGVFbGVtWzBdLmNsaWNrKCk7XG5cdFx0XHR9OyBcblx0XHRcdGVsZW0uYmluZCgnY2xpY2snLCBlbGVtWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8pO1xuXHRcdFx0ZWxlbS5jc3MoXCJvdmVyZmxvd1wiLCBcImhpZGRlblwiKTtcbi8vXHRcdFx0aWYgKGZpbGVFbGVtLnBhcmVudCgpWzBdICE9IGVsZW1bMF0pIHtcbi8vXHRcdFx0XHQvL2ZpeCAjMjk4IGJ1dHRvbiBlbGVtZW50XG4vL1x0XHRcdFx0ZWxlbS53cmFwKCc8c3Bhbj4nKTtcbi8vXHRcdFx0XHRlbGVtLmNzcyhcInotaW5kZXhcIiwgXCItMTAwMFwiKVxuLy9cdFx0XHRcdGVsZW0ucGFyZW50KCkuYXBwZW5kKGZpbGVFbGVtKTtcbi8vXHRcdFx0XHRlbGVtID0gZWxlbS5wYXJlbnQoKTtcbi8vXHRcdFx0fVxuLy9cdFx0XHRpZiAoZWxlbS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJycgfHwgZWxlbS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJ3N0YXRpYycpIHtcbi8vXHRcdFx0XHRlbGVtLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XG4vL1x0XHRcdH1cblx0XHRcdGVsZW0gPSBmaWxlRWxlbTtcblx0XHR9XG5cdFx0ZWxlbS5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBmaWxlcyA9IFtdLCBmaWxlTGlzdCwgaTtcblx0XHRcdGZpbGVMaXN0ID0gZXZ0Ll9fZmlsZXNfIHx8IGV2dC50YXJnZXQuZmlsZXM7XG5cdFx0XHRpZiAoZmlsZUxpc3QgIT0gbnVsbCkge1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgZmlsZUxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRmaWxlcy5wdXNoKGZpbGVMaXN0Lml0ZW0oaSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Zm4oc2NvcGUsIHtcblx0XHRcdFx0XHQkZmlsZXMgOiBmaWxlcyxcblx0XHRcdFx0XHQkZXZlbnQgOiBldnRcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHQvLyByZW1vdmVkIHRoaXMgc2luY2UgaXQgd2FzIGNvbmZ1c2luZyBpZiB0aGUgdXNlciBjbGljayBvbiBicm93c2UgYW5kIHRoZW4gY2FuY2VsICMxODFcbi8vXHRcdGVsZW0uYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuLy9cdFx0XHR0aGlzLnZhbHVlID0gbnVsbDtcbi8vXHRcdH0pO1xuXG5cdFx0Ly8gcmVtb3ZlZCBiZWNhdXNlIG9mICMyNTMgYnVnXG5cdFx0Ly8gdG91Y2ggc2NyZWVuc1xuLy9cdFx0aWYgKCgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHx8XG4vL1x0XHRcdFx0KG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDApIHx8IChuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyA+IDApKSB7XG4vL1x0XHRcdGVsZW0uYmluZCgndG91Y2hlbmQnLCBmdW5jdGlvbihlKSB7XG4vL1x0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy9cdFx0XHRcdGUudGFyZ2V0LmNsaWNrKCk7XG4vL1x0XHRcdH0pO1xuLy9cdFx0fVxuXHR9O1xufSBdKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ0ZpbGVEcm9wQXZhaWxhYmxlJywgWyAnJHBhcnNlJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJHBhcnNlLCAkdGltZW91dCkge1xuXHRyZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHIpIHtcblx0XHRpZiAoJ2RyYWdnYWJsZScgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpKSB7XG5cdFx0XHR2YXIgZm4gPSAkcGFyc2UoYXR0clsnbmdGaWxlRHJvcEF2YWlsYWJsZSddKTtcblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmbihzY29wZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59IF0pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nRmlsZURyb3AnLCBbICckcGFyc2UnLCAnJHRpbWVvdXQnLCAnJGxvY2F0aW9uJywgZnVuY3Rpb24oJHBhcnNlLCAkdGltZW91dCwgJGxvY2F0aW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cikge1xuXHRcdGlmICgnZHJhZ2dhYmxlJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJykpIHtcblx0XHRcdHZhciBsZWF2ZVRpbWVvdXQgPSBudWxsO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHQkdGltZW91dC5jYW5jZWwobGVhdmVUaW1lb3V0KTtcblx0XHRcdFx0aWYgKCFlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXykge1xuXHRcdFx0XHRcdGlmIChhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10gJiYgYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddLnNlYXJjaCgvXFwpICokLykgPiAtMSkge1xuXHRcdFx0XHRcdFx0dmFyIGRyYWdPdmVyQ2xhc3MgPSAkcGFyc2UoYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddKShzY29wZSwge1xuXHRcdFx0XHRcdFx0XHQkZXZlbnQgOiBldnRcblx0XHRcdFx0XHRcdH0pO1x0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gZHJhZ092ZXJDbGFzczsgXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddIHx8IFwiZHJhZ292ZXJcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxlbS5hZGRDbGFzcyhlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRsZWF2ZVRpbWVvdXQgPSAkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRlbGVtLnJlbW92ZUNsYXNzKGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKTtcblx0XHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IG51bGw7XG5cdFx0XHRcdH0sIGF0dHJbJ25nRmlsZURyYWdPdmVyRGVsYXknXSB8fCAxKTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdHZhciBmbiA9ICRwYXJzZShhdHRyWyduZ0ZpbGVEcm9wJ10pO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGVsZW0ucmVtb3ZlQ2xhc3MoZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pO1xuXHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IG51bGw7XG5cdFx0XHRcdGV4dHJhY3RGaWxlcyhldnQsIGZ1bmN0aW9uKGZpbGVzKSB7XG5cdFx0XHRcdFx0Zm4oc2NvcGUsIHtcblx0XHRcdFx0XHRcdCRmaWxlcyA6IGZpbGVzLFxuXHRcdFx0XHRcdFx0JGV2ZW50IDogZXZ0XG5cdFx0XHRcdFx0fSk7XHRcdFx0XHRcdFxuXHRcdFx0XHR9KTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0ZnVuY3Rpb24gaXNBU0NJSShzdHIpIHtcblx0XHRcdFx0cmV0dXJuIC9eW1xcMDAwLVxcMTc3XSokLy50ZXN0KHN0cik7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGV4dHJhY3RGaWxlcyhldnQsIGNhbGxiYWNrKSB7XG5cdFx0XHRcdHZhciBmaWxlcyA9IFtdLCBpdGVtcyA9IGV2dC5kYXRhVHJhbnNmZXIuaXRlbXM7XG5cdFx0XHRcdGlmIChpdGVtcyAmJiBpdGVtcy5sZW5ndGggPiAwICYmIGl0ZW1zWzBdLndlYmtpdEdldEFzRW50cnkgJiYgJGxvY2F0aW9uLnByb3RvY29sKCkgIT0gJ2ZpbGUnICYmIFxuXHRcdFx0XHRcdFx0aXRlbXNbMF0ud2Via2l0R2V0QXNFbnRyeSgpLmlzRGlyZWN0b3J5KSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGVudHJ5ID0gaXRlbXNbaV0ud2Via2l0R2V0QXNFbnRyeSgpO1xuXHRcdFx0XHRcdFx0aWYgKGVudHJ5ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Ly9maXggZm9yIGNocm9tZSBidWcgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTE0OTczNVxuXHRcdFx0XHRcdFx0XHRpZiAoaXNBU0NJSShlbnRyeS5uYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRcdHRyYXZlcnNlRmlsZVRyZWUoZmlsZXMsIGVudHJ5KTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmICghaXRlbXNbaV0ud2Via2l0R2V0QXNFbnRyeSgpLmlzRGlyZWN0b3J5KSB7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXMucHVzaChpdGVtc1tpXS5nZXRBc0ZpbGUoKSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFyIGZpbGVMaXN0ID0gZXZ0LmRhdGFUcmFuc2Zlci5maWxlcztcblx0XHRcdFx0XHRpZiAoZmlsZUxpc3QgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRmaWxlcy5wdXNoKGZpbGVMaXN0Lml0ZW0oaSkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQoZnVuY3Rpb24gd2FpdEZvclByb2Nlc3MoZGVsYXkpIHtcblx0XHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICghcHJvY2Vzc2luZykge1xuXHRcdFx0XHRcdFx0XHRjYWxsYmFjayhmaWxlcyk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR3YWl0Rm9yUHJvY2VzcygxMCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgZGVsYXkgfHwgMClcblx0XHRcdFx0fSkoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dmFyIHByb2Nlc3NpbmcgPSAwO1xuXHRcdFx0ZnVuY3Rpb24gdHJhdmVyc2VGaWxlVHJlZShmaWxlcywgZW50cnksIHBhdGgpIHtcblx0XHRcdFx0aWYgKGVudHJ5ICE9IG51bGwpIHtcblx0XHRcdFx0XHRpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcblx0XHRcdFx0XHRcdHZhciBkaXJSZWFkZXIgPSBlbnRyeS5jcmVhdGVSZWFkZXIoKTtcblx0XHRcdFx0XHRcdHByb2Nlc3NpbmcrKztcblx0XHRcdFx0XHRcdGRpclJlYWRlci5yZWFkRW50cmllcyhmdW5jdGlvbihlbnRyaWVzKSB7XG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdHRyYXZlcnNlRmlsZVRyZWUoZmlsZXMsIGVudHJpZXNbaV0sIChwYXRoID8gcGF0aCA6IFwiXCIpICsgZW50cnkubmFtZSArIFwiL1wiKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRwcm9jZXNzaW5nLS07XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cHJvY2Vzc2luZysrO1xuXHRcdFx0XHRcdFx0ZW50cnkuZmlsZShmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NpbmctLTtcblx0XHRcdFx0XHRcdFx0ZmlsZS5fcmVsYXRpdmVQYXRoID0gKHBhdGggPyBwYXRoIDogXCJcIikgKyBmaWxlLm5hbWU7XG5cdFx0XHRcdFx0XHRcdGZpbGVzLnB1c2goZmlsZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG59IF0pO1xuXG59KSgpO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgY29tcG9uZW50U2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgY29udGV4dCA9IHt9LFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0ge30sXHJcbiAgICAgICAgICAgIGNvbm5lY3RvcnMgPSB7fSxcclxuICAgICAgICAgICAgcG9ydHMgPSB7fTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyJyk7XHJcbiAgICAgICAgJHNjb3BlLmluaXQgPSBmdW5jdGlvbiAoY29ubmVjdGlvbklkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdDb21wb25lbnREZXRhaWxzXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEZXN0cm95aW5nIDonLCBjb250ZXh0LnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiBjb25uZWN0b3JzLFxyXG4gICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHt9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1RPRE86IG5vdGlmeSB1c2VyXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaEludGVyZmFjZXMoY29udGV4dCwgJHNjb3BlLmNvbXBvbmVudElkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2Ugd2F0Y2hJbnRlcmZhY2VzIGtlZXBzIHRoZSBkYXRhIHVwLXRvLWRhdGUgdGhlcmUgc2hvdWxkbid0IGJlIGEgbmVlZCB0byBkbyBhbnlcclxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGVzIGhlcmUuLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaEludGVyZmFjZXMnLCB1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29tcG9uZW50SW50ZXJmYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wcm9wZXJ0aWVzID0gY29tcG9uZW50SW50ZXJmYWNlcy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5jb25uZWN0b3JzID0gY29tcG9uZW50SW50ZXJmYWNlcy5jb25uZWN0b3JzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wb3J0cyA9IGNvbXBvbmVudEludGVyZmFjZXMucG9ydHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnY29tcG9uZW50RGV0YWlscycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudElkOiAnPWNvbXBvbmVudElkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlOiAnXmNvbXBvbmVudExpc3QnLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIGNvbXBvbmV0TGlzdENvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSBjb21wb25ldExpc3RDb250cm9sbGVyLmdldENvbm5lY3Rpb25JZCgpO1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuaW5pdChjb25uZWN0aW9uSWQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db21wb25lbnREZXRhaWxzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdDb21wb25lbnRMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICR3aW5kb3csICRtb2RhbCwgZ3Jvd2wsIGNvbXBvbmVudFNlcnZpY2UsIGZpbGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSwgICAgICAgICAgICAgLy8gSXRlbXMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBpdGVtLWxpc3QgdWktY29tcG9uZW50LlxyXG4gICAgICAgICAgICBjb21wb25lbnRJdGVtcyA9IHt9LCAgICAvLyBTYW1lIGl0ZW1zIGFyZSBzdG9yZWQgaW4gYSBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSxcclxuICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlcixcclxuICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICBjb250ZXh0O1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnQ29tcG9uZW50TGlzdENvbnRyb2xsZXInLCAkc2NvcGUuYXZtSWRzKTtcclxuICAgICAgICB0aGlzLmdldENvbm5lY3Rpb25JZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5jb25uZWN0aW9uSWQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdDb21wb25lbnRMaXN0Q29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBpdGVtIGxpc3QgdWkgY29tcG9uZW50LlxyXG4gICAgICAgIGNvbmZpZyA9IHtcclxuXHJcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2Vjb25kYXJ5SXRlbU1lbnU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbHNDb2xsYXBzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXHJcbiAgICAgICAgICAgIGhpZGVEZXRhaWxzTGFiZWw6ICdIaWRlIGRldGFpbHMnLFxyXG5cclxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Tb3J0OiBmdW5jdGlvbiAoalFFdmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgnZGlzcGxheUluc3RhbmNlc1VwJywge25hbWU6IGl0ZW0udGl0bGUsIGlkczogaXRlbS5kYXRhLmluc3RhbmNlSWRzfSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKGUsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgaXRlbS5pZCwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0Q29tcG9uZW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge2Rlc2NyaXB0aW9uOiBpdGVtLmRlc2NyaXB0aW9uLCBpZDogaXRlbS5pZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdENvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50cydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0NvbXBvbmVudEVkaXQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbXBvbmVudEVkaXRDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NpemU6IHNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTogeyBkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uIChlZGl0ZWREYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXR0cnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lORk8nOiBlZGl0ZWREYXRhLmRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5zZXRDb21wb25lbnRBdHRyaWJ1dGVzKGVkaXRDb250ZXh0LCBkYXRhLmlkLCBhdHRycylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdHRyaWJ1dGUgdXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc0FjbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgQUNNJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtyZXNvdXJjZTogaXRlbS5kYXRhLnJlc291cmNlLCBuYW1lOiBpdGVtLnRpdGxlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYXNoID0gZGF0YS5yZXNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKGhhc2gpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdBQ00gZmlsZSBmb3IgPGEgaHJlZj1cIicgKyB1cmwgKyAnXCI+JyArIGRhdGEubmFtZSArICc8L2E+IGV4cG9ydGVkLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyhkYXRhLm5hbWUgKyAnIGRvZXMgbm90IGhhdmUgYSByZXNvdXJjZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkLCBuYW1lOiBpdGVtLnRpdGxlIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1NpbXBsZU1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NpbXBsZU1vZGFsQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUgQ29tcG9uZW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdUaGlzIHdpbGwgZGVsZXRlICcgKyBkYXRhLm5hbWUgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgZnJvbSB0aGUgd29ya3NwYWNlLidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLmRlbGV0ZUNvbXBvbmVudChjb250ZXh0LCBkYXRhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSByYXcgc2VydmljZSBub2RlIGRhdGEgdG8gaXRlbXMgZm9yIHRoZSBsaXN0LlxyXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGxpc3RJdGVtO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudEl0ZW1zLmhhc093blByb3BlcnR5KGRhdGEuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IGNvbXBvbmVudEl0ZW1zW2RhdGEuaWRdO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0udGl0bGUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kYXRhLnJlc291cmNlID0gZGF0YS5yZXNvdXJjZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJHNjb3BlLmF2bUlkcyA/ICdIaWdobGlnaHQgaW5zdGFuY2VzJyA6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6ICdOL0EnLCAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnICAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0czogWyBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdDb250ZW50JyxcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzVGVtcGxhdGVVcmw6ICdjb21wb25lbnREZXRhaWxzLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHsgcmVzb3VyY2U6IGRhdGEucmVzb3VyY2UgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYXZtSWRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGF0YS5pbnN0YW5jZUlkcyA9ICRzY29wZS5hdm1JZHNbZGF0YS5hdm1JZF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3QtaXRlbSB0byB0aGUgaXRlbXMgbGlzdCBhbmQgdGhlIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zW2xpc3RJdGVtLmlkXSA9IGxpc3RJdGVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYWRkRG9tYWluV2F0Y2hlciA9IGZ1bmN0aW9uIChjb21wb25lbnRJZCkge1xyXG4gICAgICAgICAgICB2YXIgZG9tYWluTW9kZWxzVG9TdGF0ID0gZnVuY3Rpb24gKGRvbWFpbk1vZGVscykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRzID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxNYXAgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENBRDogeyB2YWx1ZTogMCwgdG9vbFRpcDogJ0NBRCcsIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc3RvcCcgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ3liZXI6IHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdDeWJlcicsIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc3RvcCcgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWFudWZhY3R1cmluZzogeyB2YWx1ZTogMCwgdG9vbFRpcDogJ01hbnVmYWN0dXJpbmcnLCBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXN0b3AnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vZGVsaWNhOiB7IHZhbHVlOiAwLCB0b29sVGlwOiAnTW9kZWxpY2EnLCBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXN0b3AnIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGtleTtcclxuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGRvbWFpbk1vZGVscykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21haW5Nb2RlbHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxNYXBbZG9tYWluTW9kZWxzW2tleV0udHlwZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsTWFwW2RvbWFpbk1vZGVsc1trZXldLnR5cGVdLnZhbHVlICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmV4cGVjdGVkIGRvbWFpbi1tb2RlbCB0eXBlJywgZG9tYWluTW9kZWxzW2tleV0udHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBsYWJlbE1hcCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbE1hcC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbE1hcFtrZXldLnZhbHVlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHMucHVzaChsYWJlbE1hcFtrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0cztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnREb21haW5zKGNvbnRleHQsIGNvbXBvbmVudElkLCBmdW5jdGlvbiAodXBkYXRlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtID0gY29tcG9uZW50SXRlbXNbY29tcG9uZW50SWRdO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0RvbWFpbk1vZGVscyB1cGRhdGVkLCBldmVudCB0eXBlOicsIHVwZGF0ZURhdGEudHlwZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlzdEl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0cyA9IGRvbWFpbk1vZGVsc1RvU3RhdCh1cGRhdGVEYXRhLmRvbWFpbk1vZGVscyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRG9tYWluTW9kZWwgZGF0YSBkaWQgbm90IGhhdmUgbWF0Y2hpbmcgY29tcG9uZW50RGF0YScsIGNvbXBvbmVudElkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtID0gY29tcG9uZW50SXRlbXNbY29tcG9uZW50SWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaXN0SXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0cyA9IGRvbWFpbk1vZGVsc1RvU3RhdChkYXRhLmRvbWFpbk1vZGVscyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdEb21haW5Nb2RlbCBkYXRhIGRpZCBub3QgaGF2ZSBtYXRjaGluZyBjb21wb25lbnREYXRhJywgY29tcG9uZW50SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbXBvbmVudFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhLml0ZW1zID0gaXRlbXM7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudHMoY29udGV4dCwgJHNjb3BlLndvcmtzcGFjZUlkLCAkc2NvcGUuYXZtSWRzLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUud2Fybih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlcih1cGRhdGVPYmplY3QuaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudEl0ZW1zLmhhc093blByb3BlcnR5KHVwZGF0ZU9iamVjdC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbXBvbmVudERvbWFpbnNfJyArIHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb21wb25lbnRJdGVtc1t1cGRhdGVPYmplY3QuaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRJZDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbXBvbmVudElkIGluIGRhdGEuY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb21wb25lbnRzLmhhc093blByb3BlcnR5KGNvbXBvbmVudElkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oZGF0YS5jb21wb25lbnRzW2NvbXBvbmVudElkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGREb21haW5XYXRjaGVyKGNvbXBvbmVudElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jb250cm9sbGVyKCdDb21wb25lbnRFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBkYXRhKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgICRzY29wZS5kYXRhID0ge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoJHNjb3BlLmRhdGEpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnY29tcG9uZW50TGlzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUlkOiAnPXdvcmtzcGFjZUlkJyxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogJz1jb25uZWN0aW9uSWQnLFxyXG4gICAgICAgICAgICAgICAgYXZtSWRzOiAnPWF2bUlkcydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29tcG9uZW50TGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbXBvbmVudExpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnbkRldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgZGVzaWduU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgY29udGV4dCA9IHt9LFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0ge30sXHJcbiAgICAgICAgICAgIGNvbm5lY3RvcnMgPSB7fSxcclxuICAgICAgICAgICAgcG9ydHMgPSB7fTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Rlc2lnbkRldGFpbHNDb250cm9sbGVyJyk7XHJcbiAgICAgICAgJHNjb3BlLmluaXQgPSBmdW5jdGlvbiAoY29ubmVjdGlvbklkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25EZXRhaWxzXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEZXN0cm95aW5nIDonLCBjb250ZXh0LnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiBjb25uZWN0b3JzLFxyXG4gICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHt9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1RPRE86IG5vdGlmeSB1c2VyXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdEZXNpZ25EZXRhaWxzQ29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaEludGVyZmFjZXMoY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2Ugd2F0Y2hJbnRlcmZhY2VzIGtlZXBzIHRoZSBkYXRhIHVwLXRvLWRhdGUgdGhlcmUgc2hvdWxkbid0IGJlIGEgbmVlZCB0byBkbyBhbnlcclxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGVzIGhlcmUuLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaEludGVyZmFjZXMnLCB1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGVzaWduSW50ZXJmYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wcm9wZXJ0aWVzID0gZGVzaWduSW50ZXJmYWNlcy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5jb25uZWN0b3JzID0gZGVzaWduSW50ZXJmYWNlcy5jb25uZWN0b3JzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wb3J0cyA9IGRlc2lnbkludGVyZmFjZXMucG9ydHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnZGVzaWduRGV0YWlscycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGRlc2lnbklkOiAnPWRlc2lnbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlOiAnXmRlc2lnbkxpc3QnLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIGRlc2lnbkxpc3RDb250cm9sbGVyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdGlvbklkID0gZGVzaWduTGlzdENvbnRyb2xsZXIuZ2V0Q29ubmVjdGlvbklkKCk7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5pbml0KGNvbm5lY3Rpb25JZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0Rlc2lnbkRldGFpbHMuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEZXNpZ25EZXRhaWxzQ29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnbkxpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHdpbmRvdywgJG1vZGFsLCBkZXNpZ25TZXJ2aWNlLCBncm93bCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sICAgICAgICAgICAgIC8vIEl0ZW1zIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgaXRlbS1saXN0IHVpLWNvbXBvbmVudC5cclxuICAgICAgICAgICAgZGVzaWduSXRlbXMgPSB7fSwgICAgICAgLy8gU2FtZSBpdGVtcyBhcmUgc3RvcmVkIGluIGEgZGljdGlvbmFyeS5cclxuICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0sXHJcbiAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgYWRkQ29uZmlndXJhdGlvbldhdGNoZXIsXHJcbiAgICAgICAgICAgIGNvbnRleHQ7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXNpZ25MaXN0Q29udHJvbGxlcicpO1xyXG4gICAgICAgIHRoaXMuZ2V0Q29ubmVjdGlvbklkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLmNvbm5lY3Rpb25JZDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0Rlc2lnbkxpc3RDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29uZmlndXJhdGlvbiBmb3IgdGhlIGl0ZW0gbGlzdCB1aSBjb21wb25lbnQuXHJcbiAgICAgICAgY29uZmlnID0ge1xyXG5cclxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBzaG93RGV0YWlsc0xhYmVsOiAnU2hvdyBkZXRhaWxzJyxcclxuICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXHJcblxyXG4gICAgICAgICAgICAvLyBFdmVudCBoYW5kbGVyc1xyXG5cclxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1VybCA9ICcvZGVzaWduU3BhY2UvJyArICRzY29wZS53b3Jrc3BhY2VJZC5yZXBsYWNlKC9cXC8vZywgJy0nKSArICcvJyArIGl0ZW0uaWQucmVwbGFjZSgvXFwvL2csICctJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdVcmwpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9IG5ld1VybDtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBpdGVtLmlkLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2VkaXREZXNpZ24nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogaXRlbS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdENvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWducydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0Rlc2lnbkVkaXQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnbkVkaXRDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NpemU6IHNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTogeyBkYXRhOiBmdW5jdGlvbiAoKSB7IHJldHVybiBkYXRhOyB9IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoZWRpdGVkRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHJzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICduYW1lJzogZWRpdGVkRGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJTkZPJzogZWRpdGVkRGF0YS5kZXNjcmlwdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uuc2V0RGVzaWduQXR0cmlidXRlcyhlZGl0Q29udGV4dCwgZGF0YS5pZCwgYXR0cnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0cmlidXRlIHVwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhwb3J0QXNBZG0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhwb3J0IEFETScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2hhcmUtYWx0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7aWQ6IGl0ZW0uaWQsIG5hbWU6IGl0ZW0udGl0bGV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnTm90IEltcGxlbWVudGVkIScpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYXNoID0gZGF0YS5yZXNvdXJjZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gRmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwoaGFzaCk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVybCkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdBQ00gZmlsZSBmb3IgPGEgaHJlZj1cIicgKyB1cmwgKyAnXCI+JyArIGRhdGEubmFtZSArICc8L2E+IGV4cG9ydGVkLicpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoZGF0YS5uYW1lICsgJyBkb2VzIG5vdCBoYXZlIGEgcmVzb3VyY2UuJyk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkLCBuYW1lOiBpdGVtLnRpdGxlIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1NpbXBsZU1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NpbXBsZU1vZGFsQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUgRGVzaWduIFNwYWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdUaGlzIHdpbGwgZGVsZXRlICcgKyBkYXRhLm5hbWUgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgZnJvbSB0aGUgd29ya3NwYWNlLidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmRlbGV0ZURlc2lnbihjb250ZXh0LCBkYXRhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSByYXcgc2VydmljZSBub2RlIGRhdGEgdG8gaXRlbXMgZm9yIHRoZSBsaXN0LlxyXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGxpc3RJdGVtO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc2lnbkl0ZW1zLmhhc093blByb3BlcnR5KGRhdGEuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IGRlc2lnbkl0ZW1zW2RhdGEuaWRdO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0udGl0bGUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdPcGVuIGl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6ICdOL0EnLCAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnICAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdDb25maWd1cmF0aW9uIFNldHMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi10aC1sYXJnZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnQ29uZmlndXJhdGlvbnMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi10aCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnUmVzdWx0cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXN0YXRzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzICAgIDogJ0NvbnRlbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHNUZW1wbGF0ZVVybDogJ2Rlc2lnbkRldGFpbHMuaHRtbCdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3QtaXRlbSB0byB0aGUgaXRlbXMgbGlzdCBhbmQgdGhlIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgICAgIGRlc2lnbkl0ZW1zW2xpc3RJdGVtLmlkXSA9IGxpc3RJdGVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYWRkQ29uZmlndXJhdGlvbldhdGNoZXIgPSBmdW5jdGlvbiAoZGVzaWduSWQpIHtcclxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaE5ick9mQ29uZmlndXJhdGlvbnMoY29udGV4dCwgZGVzaWduSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbSA9IGRlc2lnbkl0ZW1zW2Rlc2lnbklkXTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1swXS52YWx1ZSA9IHVwZGF0ZU9iamVjdC5kYXRhLmNvdW50ZXJzLnNldHM7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1sxXS52YWx1ZSA9IHVwZGF0ZU9iamVjdC5kYXRhLmNvdW50ZXJzLmNvbmZpZ3VyYXRpb25zO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbMl0udmFsdWUgPSB1cGRhdGVPYmplY3QuZGF0YS5jb3VudGVycy5yZXN1bHRzO1xyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlzdEl0ZW0gPSBkZXNpZ25JdGVtc1tkZXNpZ25JZF07XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1swXS52YWx1ZSA9IGRhdGEuY291bnRlcnMuc2V0cztcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWzFdLnZhbHVlID0gZGF0YS5jb3VudGVycy5jb25maWd1cmF0aW9ucztcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWzJdLnZhbHVlID0gZGF0YS5jb3VudGVycy5yZXN1bHRzO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5saXN0RGF0YS5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgICAgICBkZXNpZ25JdGVtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hEZXNpZ25zKGNvbnRleHQsICRzY29wZS53b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4O1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBhZGRDb25maWd1cmF0aW9uV2F0Y2hlcih1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXNpZ25JdGVtcy5oYXNPd25Qcm9wZXJ0eSh1cGRhdGVPYmplY3QuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaXRlbXMubWFwKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuaW5kZXhPZih1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOYnJPZkNvbmZpZ3VyYXRpb25zXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGVzaWduSXRlbXNbdXBkYXRlT2JqZWN0LmlkXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVzaWduSWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChkZXNpZ25JZCBpbiBkYXRhLmRlc2lnbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuZGVzaWducy5oYXNPd25Qcm9wZXJ0eShkZXNpZ25JZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKGRhdGEuZGVzaWduc1tkZXNpZ25JZF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkQ29uZmlndXJhdGlvbldhdGNoZXIoZGVzaWduSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnbkVkaXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGRhdGEpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBuYW1lOiBkYXRhLm5hbWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5kYXRhKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2Rlc2lnbkxpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCcsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9EZXNpZ25MaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduTGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnblRyZWVDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHdpbmRvdywgZGVzaWduU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sXHJcbiAgICAgICAgICAgIGNvbnRleHQsXHJcbiAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgdHJlZURhdGEsXHJcbiAgICAgICAgICAgIHJvb3ROb2RlLFxyXG4gICAgICAgICAgICBhdm1JZHMgPSB7fSxcclxuICAgICAgICAgICAgYnVpbGRUcmVlU3RydWN0dXJlO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnRGVzaWduVHJlZUNvbnRyb2xsZXInKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnRGVzaWduVHJlZUNvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgIG5vZGVDb250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY3JlYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge2lkOiBub2RlLmlkfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgZGF0YS5pZCwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgIH1dO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBub2RlQ2xpY2s6IGZ1bmN0aW9uICggZSwgbm9kZSApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTm9kZSB3YXMgY2xpY2tlZDonLCBub2RlLCAkc2NvcGUgKTtcclxuICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgIG5vZGVEYmxjbGljazogZnVuY3Rpb24gKCBlLCBub2RlICkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ05vZGUgd2FzIGRvdWJsZS1jbGlja2VkOicsIG5vZGUgKTtcclxuLy8gICAgICAgICAgICB9LFxyXG4vLyAgICAgICAgICAgIG5vZGVFeHBhbmRlckNsaWNrOiBmdW5jdGlvbiAoIGUsIG5vZGUsIGlzRXhwYW5kICkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ0V4cGFuZGVyIHdhcyBjbGlja2VkIGZvciBub2RlOicsIG5vZGUsIGlzRXhwYW5kICk7XHJcbi8vICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJvb3ROb2RlID0ge1xyXG4gICAgICAgICAgICBpZDogJHNjb3BlLmRlc2lnbklkLFxyXG4gICAgICAgICAgICBsYWJlbDogJ0xvYWRpbmcgRGVzaWduIFNwYWNlIE5vZGVzLi4nLFxyXG4gICAgICAgICAgICBleHRyYUluZm86ICcnLFxyXG4gICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgIGNoaWxkcmVuQ291bnQ6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cmVlRGF0YSA9IHtcclxuICAgICAgICAgICAgaWQ6ICcnLFxyXG4gICAgICAgICAgICBsYWJlbDogJycsXHJcbiAgICAgICAgICAgIGV4dHJhSW5mbzogJycsXHJcbiAgICAgICAgICAgIHVuQ29sbGFwc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgICAgICByb290Tm9kZVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBjaGlsZHJlbkNvdW50OiAxXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICRzY29wZS50cmVlRGF0YSA9IHRyZWVEYXRhO1xyXG4gICAgICAgICRzY29wZS4kb24oJ2Rpc3BsYXlJbnN0YW5jZXNEb3duJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jb25maWcuc3RhdGUuc2VsZWN0ZWROb2RlcyA9IGRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYnVpbGRUcmVlU3RydWN0dXJlID0gZnVuY3Rpb24gKGNvbnRhaW5lciwgcGFyZW50VHJlZU5vZGUpIHtcclxuICAgICAgICAgICAgdmFyIGtleSxcclxuICAgICAgICAgICAgICAgIGNoaWxkRGF0YSxcclxuICAgICAgICAgICAgICAgIHRyZWVOb2RlO1xyXG4gICAgICAgICAgICBpZiAocGFyZW50VHJlZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRyZWVOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhSW5mbzogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5Db3VudDogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHBhcmVudFRyZWVOb2RlLmNoaWxkcmVuLnB1c2godHJlZU5vZGUpO1xyXG4gICAgICAgICAgICAgICAgcGFyZW50VHJlZU5vZGUuY2hpbGRyZW5Db3VudCArPSAxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdHJlZU5vZGUgPSByb290Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cmVlTm9kZS5pZCA9IGNvbnRhaW5lci5pZDtcclxuICAgICAgICAgICAgdHJlZU5vZGUubGFiZWwgPSBjb250YWluZXIubmFtZTtcclxuICAgICAgICAgICAgdHJlZU5vZGUuZXh0cmFJbmZvID0gY29udGFpbmVyLnR5cGU7XHJcbiAgICAgICAgICAgICRzY29wZS5jb25maWcuc3RhdGUuZXhwYW5kZWROb2Rlcy5wdXNoKHRyZWVOb2RlLmlkKTtcclxuICAgICAgICAgICAgZm9yIChrZXkgaW4gY29udGFpbmVyLmNvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIuY29tcG9uZW50cy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLmNvbXBvbmVudHNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB0cmVlTm9kZS5jaGlsZHJlbi5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkRGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGNoaWxkRGF0YS5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJlZU5vZGUuY2hpbGRyZW5Db3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdm1JZHNbY2hpbGREYXRhLmF2bUlkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdm1JZHNbY2hpbGREYXRhLmF2bUlkXS5wdXNoKGNoaWxkRGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWRzW2NoaWxkRGF0YS5hdm1JZF0gPSBbY2hpbGREYXRhLmlkXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChrZXkgaW4gY29udGFpbmVyLnN1YkNvbnRhaW5lcnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIuc3ViQ29udGFpbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLnN1YkNvbnRhaW5lcnNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBidWlsZFRyZWVTdHJ1Y3R1cmUoY2hpbGREYXRhLCB0cmVlTm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZGVzdHJveSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ2luaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWduU3RydWN0dXJlKGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByb290Q29udGFpbmVyID0gZGF0YS5jb250YWluZXJzW2RhdGEucm9vdElkXTtcclxuICAgICAgICAgICAgICAgICAgICBidWlsZFRyZWVTdHJ1Y3R1cmUocm9vdENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdkZXNpZ25UcmVlTG9hZGVkJywgYXZtSWRzKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2Rlc2lnblRyZWUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25JZDogJz1kZXNpZ25JZCcsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9EZXNpZ25UcmVlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduVHJlZUNvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignU2ltcGxlTW9kYWxDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGRhdGEpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxyXG4gICAgICAgICAgICBkZXRhaWxzOiBkYXRhLmRldGFpbHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignVGVzdEJlbmNoRGV0YWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCB0ZXN0QmVuY2hTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge30sXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fSxcclxuICAgICAgICAgICAgY29ubmVjdG9ycyA9IHt9LFxyXG4gICAgICAgICAgICBwb3J0cyA9IHt9LFxyXG4gICAgICAgICAgICB3YXRjaEludGVyZmFjZXM7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUZXN0QmVuY2hEZXRhaWxzQ29udHJvbGxlcicpO1xyXG4gICAgICAgICRzY29wZS5pbml0ID0gZnVuY3Rpb24gKGNvbm5lY3Rpb25JZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gY29ubmVjdGlvbklkO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnVGVzdEJlbmNoRGV0YWlsc18nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRGVzdHJveWluZyA6JywgY29udGV4dC5yZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdG9yczogY29ubmVjdG9ycyxcclxuICAgICAgICAgICAgICAgIHBvcnRzOiBwb3J0c1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3YXRjaEludGVyZmFjZXMgPSBmdW5jdGlvbiAoY29udGFpbmVySWQpIHtcclxuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKGNvbnRleHQsIGNvbnRhaW5lcklkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2Ugd2F0Y2hJbnRlcmZhY2VzIGtlZXBzIHRoZSBkYXRhIHVwLXRvLWRhdGUgdGhlcmUgc2hvdWxkbid0IGJlIGEgbmVlZCB0byBkbyBhbnlcclxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGVzIGhlcmUuLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaEludGVyZmFjZXMnLCB1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29udGFpbmVySW50ZXJmYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wcm9wZXJ0aWVzID0gY29udGFpbmVySW50ZXJmYWNlcy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5jb25uZWN0b3JzID0gY29udGFpbmVySW50ZXJmYWNlcy5jb25uZWN0b3JzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wb3J0cyA9IGNvbnRhaW5lckludGVyZmFjZXMucG9ydHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHt9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1RPRE86IG5vdGlmeSB1c2VyXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdUZXN0QmVuY2hEZXRhaWxzQ29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLndhdGNoVGVzdEJlbmNoRGV0YWlscyhjb250ZXh0LCAkc2NvcGUudGVzdEJlbmNoSWQsIGZ1bmN0aW9uICh1cGRhdGVkT2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCd3YXRjaFRlc3RCZW5jaERldGFpbHMgdXBkYXRlcycsIHVwZGF0ZWRPYmopO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb250YWluZXJJZHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGNvbnRhaW5lciBkZWZpbmVkIScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEuY29udGFpbmVySWRzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hJbnRlcmZhY2VzKGRhdGEuY29udGFpbmVySWRzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ01vcmUgdGhhbiBvbmUgY29udGFpbmVyIGRlZmluZWQhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCd0ZXN0QmVuY2hEZXRhaWxzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQ6ICc9dGVzdEJlbmNoSWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcXVpcmU6ICdedGVzdEJlbmNoTGlzdCcsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgdGVzdEJlbmNoTGlzdENvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSB0ZXN0QmVuY2hMaXN0Q29udHJvbGxlci5nZXRDb25uZWN0aW9uSWQoKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmluaXQoY29ubmVjdGlvbklkKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvVGVzdEJlbmNoRGV0YWlscy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaERldGFpbHNDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkd2luZG93LCAkbW9kYWwsIGdyb3dsLCB0ZXN0QmVuY2hTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSwgICAgICAgICAgICAgLy8gSXRlbXMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBpdGVtLWxpc3QgdWktY29tcG9uZW50LlxyXG4gICAgICAgICAgICB0ZXN0QmVuY2hJdGVtcyA9IHt9LCAgICAvLyBTYW1lIGl0ZW1zIGFyZSBzdG9yZWQgaW4gYSBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSxcclxuICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICBjb250ZXh0O1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInKTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRDb25uZWN0aW9uSWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuY29ubmVjdGlvbklkO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29uZmlndXJhdGlvbiBmb3IgdGhlIGl0ZW0gbGlzdCB1aSBjb21wb25lbnQuXHJcbiAgICAgICAgY29uZmlnID0ge1xyXG5cclxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBzaG93RGV0YWlsc0xhYmVsOiAnU2hvdyBkZXRhaWxzJyxcclxuICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXHJcblxyXG4gICAgICAgICAgICAvLyBFdmVudCBoYW5kbGVyc1xyXG5cclxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnTm90IEltcGxlbWVudGVkIScpO1xyXG4gICAgICAgICAgICAgICAgLy9kb2N1bWVudC5sb2NhdGlvbi5oYXNoID0gJy9jb21wb25lbnQvJyArIGl0ZW0uaWQucmVwbGFjZSgvXFwvL2csICctJyk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKGUsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgaXRlbS5pZCwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0VGVzdEJlbmNoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0uZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBpdGVtLmRhdGEuZmlsZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGl0ZW0uZGF0YS5wYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0Q29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYjogY29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb21wb25lbnRzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvVGVzdEJlbmNoRWRpdC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVGVzdEJlbmNoRWRpdENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vc2l6ZTogc2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7IGRhdGE6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRhdGE7IH0gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uIChlZGl0ZWREYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXR0cnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSU5GTzogZWRpdGVkRGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBlZGl0ZWREYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGVzdEJlbmNoRmlsZXM6IGVkaXRlZERhdGEuZmlsZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSUQ6IGVkaXRlZERhdGEucGF0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uuc2V0Q29tcG9uZW50QXR0cmlidXRlcyhlZGl0Q29udGV4dCwgZGF0YS5pZCwgYXR0cnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0cmlidXRlIHVwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhlY3V0ZVRlc3RCZW5jaCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeGVjdXRlIFRlc3QgQmVuY2gnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWV4cGFuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge2lkOiBpdGVtLmlkfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvU2ltcGxlTW9kYWwuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2ltcGxlTW9kYWxDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0V4ZWN1dGUgVGVzdCBCZW5jaCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiAnVGhpcyB3aWxsIHJ1biB0aGUgc2ltdWxhdGlvbnMgZm9yIGFsbCBwb3NzaWJsZSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29tYmluYXRpb25zIG9mIHRoZSBkZXNpZ24gc3BhY2UgYXMgb25lIGpvYi4gVGhlIGNvbXBvdW5kICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdyZXN1bHQgd2lsbCBiZSBhdHRhY2hlZCB0byB0aGUgdGVzdC1iZW5jaCAocmF0aGVyIHRoYW4gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NhdmVkIHRvIHJlc3VsdHMgb2JqZWN0cyBpbiB0aGUgYXNzb2NpYXRlZCBkZXNpZ24pLicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdUaGUgb3RoZXIgcGF0aCBpcyB0byBnZW5lcmF0ZWQgY29uZmlndXJhdGlvbnMgZm9yIHlvdXIgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Rlc2lnbiBhbmQgb3BlbiB1cCB0aGUgdGVzdC1iZW5jaCBhbmQgZXhlY3V0ZSBhIHNlbGVjdGVkICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzZXQgb2YgZGVzaWducy4gVGhpcyB3YXkgeW91IGNhbiBhZGQgbmV3IHJlc3VsdHMgYXMgeW91IGFkZCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbW9yZSB0ZXN0LWJlbmNoZXMgb3IgY29uZmlndXJhdGlvbnMuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ05vdCBJbXBsZW1lbnRlZCEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCwgbmFtZTogaXRlbS50aXRsZSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9TaW1wbGVNb2RhbC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW1wbGVNb2RhbENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlIFRlc3QgQmVuY2gnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ1RoaXMgd2lsbCBkZWxldGUgJyArIGRhdGEubmFtZSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBmcm9tIHRoZSB3b3Jrc3BhY2UuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UuZGVsZXRlQ29tcG9uZW50KGNvbnRleHQsIGRhdGEuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBkZXRhaWxzUmVuZGVyZXI6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGZpbHRlcjoge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIHJhdyBzZXJ2aWNlIG5vZGUgZGF0YSB0byBpdGVtcyBmb3IgdGhlIGxpc3QuXHJcbiAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgbGlzdEl0ZW07XHJcblxyXG4gICAgICAgICAgICBpZiAodGVzdEJlbmNoSXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0gdGVzdEJlbmNoSXRlbXNbZGF0YS5pZF07XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS50aXRsZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEuZmlsZXMgPSBkYXRhLmZpbGVzO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGF0YS5wYXRoID0gZGF0YS5wYXRoO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGF0YS5yZXN1bHRzID0gZGF0YS5yZXN1bHRzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnT3BlbiBUZXN0IEJlbmNoJyxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiAnTi9BJywgICAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAnTi9BJyAgICAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHM6IFsgXSxcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzICAgIDogJ0NvbnRlbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHNUZW1wbGF0ZVVybDogJ3Rlc3RCZW5jaERldGFpbHMuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogZGF0YS5maWxlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogZGF0YS5wYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBkYXRhLnJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBsaXN0LWl0ZW0gdG8gdGhlIGl0ZW1zIGxpc3QgYW5kIHRoZSBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChsaXN0SXRlbSk7XHJcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJdGVtc1tsaXN0SXRlbS5pZF0gPSBsaXN0SXRlbTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhLml0ZW1zID0gaXRlbXM7XHJcbiAgICAgICAgICAgIHRlc3RCZW5jaEl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS53YXRjaFRlc3RCZW5jaGVzKGNvbnRleHQsICRzY29wZS53b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4O1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3RCZW5jaEl0ZW1zLmhhc093blByb3BlcnR5KHVwZGF0ZU9iamVjdC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoVGVzdEJlbmNoXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGVzdEJlbmNoSXRlbXNbdXBkYXRlT2JqZWN0LmlkXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVzdEJlbmNoSWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh0ZXN0QmVuY2hJZCBpbiBkYXRhLnRlc3RCZW5jaGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnRlc3RCZW5jaGVzLmhhc093blByb3BlcnR5KHRlc3RCZW5jaElkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oZGF0YS50ZXN0QmVuY2hlc1t0ZXN0QmVuY2hJZF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGRUZXN0QmVuY2hXYXRjaGVyKHRlc3RCZW5jaElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jb250cm9sbGVyKCdUZXN0QmVuY2hFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBkYXRhKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgICRzY29wZS5kYXRhID0ge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgbmFtZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICBmaWxlczogZGF0YS5maWxlcyxcclxuICAgICAgICAgICAgcGF0aDogZGF0YS5wYXRoXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgkc2NvcGUuZGF0YSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCd0ZXN0QmVuY2hMaXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSWQ6ICc9d29ya3NwYWNlSWQnLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvVGVzdEJlbmNoTGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50Ki9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgZ3Jvd2wsIHdvcmtzcGFjZVNlcnZpY2UsIGZpbGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSxcclxuICAgICAgICAgICAgd29ya3NwYWNlSXRlbXMgPSB7fSxcclxuICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICBjb250ZXh0LFxyXG4gICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSxcclxuICAgICAgICAgICAgYWRkQ291bnRXYXRjaGVycztcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJyk7XHJcblxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZyA9IHtcclxuXHJcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2Vjb25kYXJ5SXRlbU1lbnU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbHNDb2xsYXBzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXHJcbiAgICAgICAgICAgIGhpZGVEZXRhaWxzTGFiZWw6ICdIaWRlIGRldGFpbHMnLFxyXG5cclxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Tb3J0OiBmdW5jdGlvbiAoalFFdmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkOiAnICsgaXRlbSk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5oYXNoID0gJy93b3Jrc3BhY2VEZXRhaWxzLycgKyBpdGVtLmlkLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29udGV4dG1lbnUgd2FzIHRyaWdnZXJlZCBmb3Igbm9kZTonLCBpdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZHVwbGljYXRlV29ya3NwYWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0R1cGxpY2F0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWNvcHkgY29weS1pY29uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7aWQ6IGl0ZW0uaWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5kdXBsaWNhdGVXb3Jrc3BhY2UoY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2VkaXRXb3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7aWQ6IGl0ZW0uaWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnTm90IEltcGxlbWVudGVkLCBpZDogJyArIGRhdGEuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc1hNRScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgYXMgWE1FJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHsgaWQ6IGl0ZW0uaWQgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmluZm8oJ05vdCBJbXBsZW1lbnRlZCwgaWQ6ICcgKyBkYXRhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9sYWJlbDogJ0V4dHJhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcGx1cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UoY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbmV3SXRlbUZvcm06IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ3JlYXRlIG5ldyB3b3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgaXRlbVRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtzcGFjZU5ld0l0ZW0uaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBleHBhbmRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wcGVkRmlsZXM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ092ZXJDbGFzcyA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWRJdGVtcyA9ICRldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZHJhZ2dlZEl0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWRJdGVtcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZHJhZ2dlZEl0ZW1zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWRJdGVtc1tpXS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhc0ZpbGUgPyBcImJnLXN1Y2Nlc3MgZHJhZ292ZXJcIiA6IFwiYmctZGFuZ2VyIGRyYWdvdmVyXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uRHJvcHBlZEZpbGVzID0gZnVuY3Rpb24gKCRmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlU2VydmljZS5zYXZlRHJvcHBlZEZpbGVzKCRmaWxlcywge3ppcDogdHJ1ZSwgYWRtOiB0cnVlLCBhdG06IHRydWV9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGZJbmZvcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGZJbmZvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZJbmZvcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzLnB1c2goZkluZm9zW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY3JlYXRlSXRlbSA9IGZ1bmN0aW9uIChuZXdJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgJHNjb3BlLmZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuZmlsZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vd29ya3NwYWNlU2VydmljZS5jcmVhdGVXb3Jrc3BhY2UoY29udGV4dCwgbmV3SXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS5uZXdJdGVtID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbmZpZy5uZXdJdGVtRm9ybS5leHBhbmRlZCA9IGZhbHNlOyAvLyB0aGlzIGlzIGhvdyB5b3UgY2xvc2UgdGhlIGZvcm0gaXRzZWxmXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcblxyXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHdvcmtzcGFjZUl0ZW07XHJcblxyXG4gICAgICAgICAgICBpZiAod29ya3NwYWNlSXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0gPSB3b3Jrc3BhY2VJdGVtc1tkYXRhLmlkXTtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0udGl0bGUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnT3BlbiBXb3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IG5ldyBEYXRlKCksIC8vIFRPRE86IGdldCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnIC8vIFRPRE86IGdldCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdDb21wb25lbnRzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXB1enpsZS1waWVjZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnRGVzaWduIFNwYWNlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1jdWJlcydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnVGVzdCBiZW5jaGVzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2F2ZWQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ1JlcXVpcmVtZW50cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1iYXItY2hhcnQtbydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSXRlbS5pZF0gPSB3b3Jrc3BhY2VJdGVtO1xyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh3b3Jrc3BhY2VJdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGFkZENvdW50V2F0Y2hlcnMgPSBmdW5jdGlvbiAod29ya3NwYWNlSWQpIHtcclxuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mQ29tcG9uZW50cyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzBdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzBdLnZhbHVlID0gZGF0YS5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mRGVzaWducyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzFdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzFdLnZhbHVlID0gZGF0YS5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mVGVzdEJlbmNoZXMoY29udGV4dCwgd29ya3NwYWNlSWQsIGZ1bmN0aW9uICh1cGRhdGVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1syXS52YWx1ZSA9IHVwZGF0ZURhdGEuZGF0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1syXS52YWx1ZSA9IGRhdGEuY291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgd29ya3NwYWNlU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIGFsbCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hXb3Jrc3BhY2VzKGNvbnRleHQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBhZGRDb3VudFdhdGNoZXJzKHVwZGF0ZU9iamVjdC5pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlSXRlbXMuaGFzT3duUHJvcGVydHkodXBkYXRlT2JqZWN0LmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGl0ZW1zLm1hcChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmluZGV4T2YodXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZDb21wb25lbnRzXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkRlc2lnbnNfJyArIHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mVGVzdEJlbmNoZXNfJyArIHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3b3Jrc3BhY2VJdGVtc1t1cGRhdGVPYmplY3QuaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZUlkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHdvcmtzcGFjZUlkIGluIGRhdGEud29ya3NwYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS53b3Jrc3BhY2VzLmhhc093blByb3BlcnR5KHdvcmtzcGFjZUlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oZGF0YS53b3Jrc3BhY2VzW3dvcmtzcGFjZUlkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDb3VudFdhdGNoZXJzKHdvcmtzcGFjZUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ3dvcmtzcGFjZUxpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya3NwYWNlTGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogVGhpcyBzZXJ2aWNlIGNvbnRhaW5zIGZ1bmN0aW9uYWxpdHkgc2hhcmVkIGFtb25nc3QgdGhlIGRpZmZlcmVudCBzZXJ2aWNlcy4gSXQgc2hvdWxkIG5vdCBiZSB1c2VkXHJcbiAqIGRpcmVjdGx5IGluIGEgY29udHJvbGxlciAtIG9ubHkgYXMgcGFydCBvZiBvdGhlciBzZXJ2aWNlcy5cclxuICpcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdiYXNlQ3lQaHlTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCBub2RlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVnaXN0ZXJzIGEgd2F0Y2hlciAoY29udHJvbGxlcikgdG8gdGhlIHNlcnZpY2UuIENhbGxiYWNrIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aGVuIG5vZGVzIGJlY2FtZSBhdmFpbGFibGUgb3JcclxuICAgICAgICAgKiB3aGVuIHRoZXkgYmVjYW1lIHVuYXZhaWxhYmxlLiBUaGVzZSBhcmUgYWxzbyBjYWxsZWQgZGlyZWN0bHkgd2l0aCB0aGUgc3RhdGUgb2YgdGhlIG5vZGVTZXJ2aWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3YXRjaGVycyAtIFdhdGNoZXJzIGZyb20gdGhlIHNlcnZpY2UgdXRpbGl6aW5nIHRoaXMgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQuZGIgLSBEYXRhYmFzZSBjb25uZWN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0gQ2FsbGVkIHdpdGggdHJ1ZSB3aGVuIHRoZXJlIGFyZSBubyBub2RlcyB1bmF2YWlsYWJsZSBhbmQgZmFsc2Ugd2hlbiB0aGVyZSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGZuKSB7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLm9uKHBhcmVudENvbnRleHQuZGIsICdpbml0aWFsaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgZW5vdWdoLCB0aGUgcmVnaW9ucyB3aWxsIGJlIGNsZWFuZWQgdXAgaW4gbm9kZVNlcnZpY2UuXHJcbiAgICAgICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm4oZmFsc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2Uub24ocGFyZW50Q29udGV4dC5kYiwgJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBiZSBlbm91Z2gsIHRoZSByZWdpb25zIHNob3VsZCBiZSBjbGVhbmVkIHVwIGluIG5vZGVTZXJ2aWNlLlxyXG4gICAgICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm4odHJ1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIHdhdGNoZXJzIHNwYXduZWQgZnJvbSBwYXJlbnRDb250ZXh0LCB0aGlzIHNob3VsZCB0eXBpY2FsbHkgYmUgaW52b2tlZCB3aGVuIHRoZSBjb250cm9sbGVyIGlzIGRlc3Ryb3llZC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd2F0Y2hlcnMgLSBXYXRjaGVycyBmcm9tIHRoZSBzZXJ2aWNlIHV0aWxpemluZyB0aGlzIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAod2F0Y2hlcnMsIHBhcmVudENvbnRleHQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkV2F0Y2hlcnMsXHJcbiAgICAgICAgICAgICAgICBrZXk7XHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXYXRjaGVycyA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gY2hpbGRXYXRjaGVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZFdhdGNoZXJzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjaGlsZFdhdGNoZXJzW2tleV0uZGIsIGNoaWxkV2F0Y2hlcnNba2V5XS5yZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdGhpbmcgdG8gY2xlYW4tdXAuLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBzcGVjaWZpZWQgd2F0Y2hlciAocmVnaW9uSWQpXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdhdGNoZXJzIC0gV2F0Y2hlcnMgZnJvbSB0aGUgc2VydmljZSB1dGlsaXppbmcgdGhpcyBmdW5jdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24gb2YgYm90aCBwYXJlbnQgYW5kIHJlZ2lvbiB0byBiZSBkZWxldGVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZWdpb25JZCAtIFJlZ2lvbiBpZCBvZiB0aGUgc3Bhd25lZCByZWdpb24gdGhhdCBzaG91bGQgYmUgZGVsZXRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24ocGFyZW50Q29udGV4dC5kYiwgcmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYW5ub3QgY2xlYW4tdXAgcmVnaW9uIHNpbmNlIHBhcmVudENvbnRleHQgaXMgbm90IHJlZ2lzdGVyZWQuLicsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvZiBhIG5vZGUuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gUGF0aCB0byBub2RlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhdHRycyAtIEtleXMgYXJlIG5hbWVzIG9mIGF0dHJpYnV0ZXMgYW5kIHZhbHVlcyBhcmUgdGhlIHdhbnRlZCB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnNldE5vZGVBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGNvbnRleHQsIGlkLCBhdHRycykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBpZClcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChub2RlT2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBhdHRycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NldE5vZGVBdHRyaWJ1dGVzJywga2V5LCBhdHRyc1trZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVPYmouc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSwgJ3dlYkN5UGh5IC0gc2V0Tm9kZUF0dHJpYnV0ZXMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKiBUT0RPOiBXYXRjaCBkb21haW5Qb3J0cyBpbnNpZGUgQ29ubmVjdG9ycyBhbmQgY2hlY2sgaWYgcHJvcGVydGllcyBhcmUgZGVyaXZlZC5cclxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgaW50ZXJmYWNlcyAoUHJvcGVydGllcywgQ29ubmVjdG9ycyBhbmQgRG9tYWluUG9ydHMpIG9mIGEgbW9kZWwuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdhdGNoZXJzIC0gV2F0Y2hlcnMgZnJvbSB0aGUgc2VydmljZSB1dGlsaXppbmcgdGhpcyBmdW5jdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBQYXRoIHRvIG1vZGVsLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoSW50ZXJmYWNlcyA9IGZ1bmN0aW9uICh3YXRjaGVycywgcGFyZW50Q29udGV4dCwgaWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoSW50ZXJmYWNlc18nICsgaWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSwgLy9wcm9wZXJ0eTogIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkYXRhVHlwZTogPHN0cmluZz4sIHZhbHVlVHlwZSA8c3RyaW5nPiwgZGVyaXZlZCA8Ym9vbGVhbj59XHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30sIC8vY29ubmVjdG9yOiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZG9tYWluUG9ydHM6IDxvYmplY3Q+IH1cclxuICAgICAgICAgICAgICAgICAgICBwb3J0czoge30gICAgICAgLy9wb3J0OiAgICAgIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCB0eXBlOiA8c3RyaW5nPiwgY2xhc3M6IDxzdHJpbmc+IH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblByb3BlcnR5VXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEYXRhVHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdEYXRhVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZVR5cGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnVmFsdWVUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlcml2ZWQgPSBpc1Byb3BlcnR5RGVyaXZlZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEYXRhVHlwZSAhPT0gZGF0YS5wcm9wZXJ0aWVzW2lkXS5kYXRhVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLmRhdGFUeXBlID0gbmV3RGF0YVR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVUeXBlICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLnZhbHVlVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLnZhbHVlVHlwZSA9IG5ld1ZhbHVlVHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXJpdmVkICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLmRlcml2ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2lkXS5kZXJpdmVkID0gbmV3RGVyaXZlZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uUHJvcGVydHlVbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5wcm9wZXJ0aWVzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uQ29ubmVjdG9yVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuY29ubmVjdG9yc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbm5lY3RvcnNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Db25uZWN0b3JVbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb25uZWN0b3JzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uUG9ydFVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NsYXNzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0NsYXNzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5wb3J0c1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdUeXBlICE9PSBkYXRhLnBvcnRzW2lkXS5kYXRhVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzW2lkXS50eXBlID0gbmV3VHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdDbGFzcyAhPT0gZGF0YS5wb3J0c1tpZF0uY2xhc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1tpZF0uY2xhc3MgPSBuZXdDbGFzcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uUG9ydFVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnBvcnRzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGlzUHJvcGVydHlEZXJpdmVkID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5nZXRDb2xsZWN0aW9uUGF0aHMoJ2RzdCcpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG1vZGVsTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbE5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuUHJvcGVydHkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0RhdGFUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVyaXZlZDogaXNQcm9wZXJ0eURlcml2ZWQoY2hpbGROb2RlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25Qcm9wZXJ0eVVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblByb3BlcnR5VW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Db25uZWN0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29ubmVjdG9yc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluUG9ydHM6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvbkNvbm5lY3RvclVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvbkNvbm5lY3RvclVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL3F1ZXVlTGlzdC5wdXNoKGNoaWxkTm9kZS5sb2FkQ2hpbGRyZW4oY2hpbGROb2RlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRG9tYWluUG9ydCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0NsYXNzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uUG9ydFVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblBvcnRVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Qcm9wZXJ0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0RhdGFUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVR5cGU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnVmFsdWVUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXJpdmVkOiBpc1Byb3BlcnR5RGVyaXZlZChuZXdDaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Qcm9wZXJ0eVVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uUHJvcGVydHlVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29ubmVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbm5lY3RvcnNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluUG9ydHM6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uQ29ubmVjdG9yVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25Db25uZWN0b3JVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuRG9tYWluUG9ydCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0NsYXNzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Qb3J0VXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25Qb3J0VW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ2NvbXBvbmVudFNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBjb21wb25lbnQgZnJvbSB0aGUgY29udGV4dCAoZGIvcHJvamVjdC9icmFuY2gpLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLCBOLkIuIGRvZXMgbm90IG5lZWQgdG8gc3BlY2lmeSByZWdpb24uXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBvbmVudElkXHJcbiAgICAgICAgICogQHBhcmFtIFttc2ddIC0gQ29tbWl0IG1lc3NhZ2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5kZWxldGVDb21wb25lbnQgPSBmdW5jdGlvbiAoY29udGV4dCwgY29tcG9uZW50SWQsIG1zZykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1zZyB8fCAnQ29tcG9uZW50U2VydmljZS5kZWxldGVDb21wb25lbnQgJyArIGNvbXBvbmVudElkO1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCBjb21wb25lbnRJZCwgbWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgZ2l2ZW4gYXR0cmlidXRlc1xyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQucmVnaW9uSWQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb21wb25lbnRJZCAtIFBhdGggdG8gY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhdHRycyAtIEtleXMgYXJlIG5hbWVzIG9mIGF0dHJpYnV0ZXMgYW5kIHZhbHVlcyBhcmUgdGhlIHdhbnRlZCB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnNldENvbXBvbmVudEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoY29udGV4dCwgY29tcG9uZW50SWQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLnNldE5vZGVBdHRyaWJ1dGVzKGNvbnRleHQsIGNvbXBvbmVudElkLCBhdHRycyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIGNvbXBvbmVudHMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS4gIERhdGEgaXMgYW4gb2JqZWN0IGluIGRhdGEuY29tcG9uZW50cy5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXZtSWRzIC0gQW4gb3B0aW9uYWwgZmlsdGVyIHRoYXQgb25seSB3YXRjaGVzIGNvbXBvbmVudHMgd2l0aCBJRHMgdGhhdCBldmFsdWF0ZXMgdG8gdHJ1ZS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoQ29tcG9uZW50cyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgYXZtSWRzLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbXBvbmVudHMnLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiB7fSAvLyBjb21wb25lbnQge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIGF2bUlkOiA8c3RyaW5nPiwgcmVzb3VyY2U6IDxoYXNofHN0cmluZz4sIGNsYXNzaWZpY2F0aW9uczogPHN0cmluZz4gfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXZtSUQgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmVzb3VyY2UgPSB0aGlzLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2xhc3MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnQ2xhc3NpZmljYXRpb25zJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdBdm1JRCAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5hdm1JZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLmF2bUlkID0gbmV3QXZtSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UmVzb3VyY2UgIT09IGRhdGEuY29tcG9uZW50c1tpZF0ucmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2lkXS5yZXNvdXJjZSA9IG5ld1Jlc291cmNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NsYXNzICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLmNsYXNzaWZpY2F0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLmNsYXNzaWZpY2F0aW9ucyA9IG5ld0NsYXNzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEuY29tcG9uZW50c1tpZF19KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb21wb25lbnRzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudElkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhdm1JZHMgfHwgYXZtSWRzLmhhc093blByb3BlcnR5KGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJykpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWQ6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzaWZpY2F0aW9uczogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnQ2xhc3NpZmljYXRpb25zJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXZtSWRzIHx8IGF2bUlkcy5oYXNPd25Qcm9wZXJ0eShuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lEJykpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdSZXNvdXJjZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NpZmljYXRpb25zOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNvbXBvbmVudElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGRvbWFpbi1tb2RlbHMgb2YgYSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBvbmVudElkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoQ29tcG9uZW50RG9tYWlucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBjb21wb25lbnRJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb21wb25lbnREb21haW5zXycgKyBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbXBvbmVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbk1vZGVsczoge30gICAvL2RvbWFpbk1vZGVsOiBpZDogPHN0cmluZz4sIHR5cGU6IDxzdHJpbmc+XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Eb21haW5Nb2RlbFVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1R5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdUeXBlICE9PSBkYXRhLmRvbWFpbk1vZGVsc1tpZF0udHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRvbWFpbk1vZGVsc1tpZF0udHlwZSA9IG5ld1R5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkRvbWFpbk1vZGVsVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuZG9tYWluTW9kZWxzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGNvbXBvbmVudElkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb21wb25lbnROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRG9tYWluTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZG9tYWluTW9kZWxzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uRG9tYWluTW9kZWxVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Eb21haW5Nb2RlbFVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Tm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Eb21haW5Nb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1R5cGUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvbkRvbWFpbk1vZGVsVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25Eb21haW5Nb2RlbFVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGlkLCB1cGRhdGVMaXN0ZW5lcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZm4pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9nQ29udGV4dCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvZ0NvbnRleHQoY29udGV4dCk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnZGVzaWduU2VydmljZScsIGZ1bmN0aW9uICgkcSwgbm9kZVNlcnZpY2UsIGJhc2VDeVBoeVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHdhdGNoZXJzID0ge307XHJcblxyXG4gICAgICAgIHRoaXMuZGVsZXRlRGVzaWduID0gZnVuY3Rpb24gKGRlc2lnbklkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBnaXZlbiBhdHRyaWJ1dGVzXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkIC0gUGF0aCB0byBkZXNpZ24tc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF0dHJzIC0gS2V5cyBhcmUgbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdmFsdWVzIGFyZSB0aGUgd2FudGVkIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2V0RGVzaWduQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCBkZXNpZ25JZCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2VDeVBoeVNlcnZpY2Uuc2V0Tm9kZUF0dHJpYnV0ZXMoY29udGV4dCwgZGVzaWduSWQsIGF0dHJzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmV4cG9ydERlc2lnbiA9IGZ1bmN0aW9uIChkZXNpZ25JZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVDb25maWd1cmF0aW9uU2V0ID0gZnVuY3Rpb24gKGRlc2lnbklkLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhbGwgY29udGFpbmVycyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLmRlc2lnbnMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaERlc2lnbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWducycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2lnbnM6IHt9IC8vIGRlc2lnbiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmRlc2lnbnNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXNjICE9PSBkYXRhLmRlc2lnbnNbaWRdLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tpZF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEuZGVzaWduc1tpZF19KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5kZXNpZ25zW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25JZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tkZXNpZ25JZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbklkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbZGVzaWduSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBkZXNpZ25JZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmRlc2lnbnNbZGVzaWduSWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCBjb250YWluZXJzIChleGlzdGVuY2UgYW5kIHRoZWlyIGF0dHJpYnV0ZXMpIG9mIGEgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZFxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoTmJyT2ZDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOYnJPZkNvbmZpZ3VyYXRpb25zXycgKyBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0czogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IDBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hDb25maWd1cmF0aW9uID0gZnVuY3Rpb24gKGNmZ05vZGUsIG1ldGEsIHdhc0NyZWF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2ZnRGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRPblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudGVycy5yZXN1bHRzIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudGVyc30pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvdW50IHRoaXMgc2V0IGFuZCBhZGQgYW4gdW5sb2FkIGhhbmRsZS5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLmNvbmZpZ3VyYXRpb25zICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdhc0NyZWF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjZmdOb2RlLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudGVyc30pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjZmdOb2RlLm9uVW5sb2FkKGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLmNvbmZpZ3VyYXRpb25zIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhLmNvdW50ZXJzfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuUmVzdWx0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMucmVzdWx0cyArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChyZXN1bHRPblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLlJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnJlc3VsdHMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudGVyc30pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChyZXN1bHRPblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZmdEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjZmdEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvblNldCA9IGZ1bmN0aW9uIChzZXROb2RlLCBtZXRhLCB3YXNDcmVhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNldERlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb3VudCB0aGlzIHNldCBhbmQgYWRkIGFuIHVubG9hZCBoYW5kbGUuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudGVycy5zZXRzICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdhc0NyZWF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBzZXROb2RlLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudGVyc30pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzZXROb2RlLm9uVW5sb2FkKGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnNldHMgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGEuY291bnRlcnN9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBzZXROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hDb25maWd1cmF0aW9uKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvbihuZXdDaGlsZCwgbWV0YSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldERlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgZGVzaWduSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRlc2lnbk5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaENvbmZpZ3VyYXRpb25TZXQoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaENvbmZpZ3VyYXRpb25TZXQobmV3Q2hpbGQsIG1ldGEsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYSBkZXNpZ24oc3BhY2UpIHcuci50LiBpbnRlcmZhY2VzLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBkZXNpZ25JZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaEludGVyZmFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyh3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZnVsbCBoaWVyYXJjaHkgb2YgYSBkZXNpZ24gdy5yLnQuIGNvbnRhaW5lcnMgYW5kIGNvbXBvbmVudHMuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkIC0gcGF0aCB0byByb290IGNvbnRhaW5lci5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaERlc2lnblN0cnVjdHVyZSA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hEZXNpZ25TdHJ1Y3R1cmVfJyArIGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICByb290SWQ6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcnM6IHt9LCAvLyBjb250YWluZXI6IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBwYXJlbnRJZDogPHN0cmluZz4sIHR5cGU6IDxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBzdWJDb250YWluZXJzOiB7aWQ6PHN0cmluZz46IDxjb250YWluZXI+fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgY29tcG9uZW50czogICAge2lkOjxzdHJpbmc+OiA8Y29udGFpbmVyPn19XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czoge30gIC8vIGNvbXBvbmVudDoge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIHBhcmVudElkOiA8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgLCBhdm1JZDogPHN0cmluZz4gfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdldENvbXBvbmVudEluZm8gPSBmdW5jdGlvbiAobm9kZSwgcGFyZW50SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogbm9kZS5nZXRJZCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJZDogcGFyZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkOiBub2RlLmdldEF0dHJpYnV0ZSgnSUQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tQ29udGFpbmVyUmVjID0gZnVuY3Rpb24gKGNvbnRhaW5lck5vZGUsIHJvb3RDb250YWluZXIsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy91cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29udGFpbmVyTm9kZS5nZXRJZCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbnRhaW5lck5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY29udGFpbmVyTm9kZS5nZXRBdHRyaWJ1dGUoJ1R5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJDb250YWluZXJzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIuc3ViQ29udGFpbmVyc1tjb250YWluZXJOb2RlLmdldElkKCldID0gY29udGFpbmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbnRhaW5lcnNbY29udGFpbmVyTm9kZS5nZXRJZCgpXSA9IGNvbnRhaW5lcjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Db250YWluZXJSZWMoY2hpbGROb2RlLCBjb250YWluZXIsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IGdldENvbXBvbmVudEluZm8oY2hpbGROb2RlLCBjb250YWluZXIuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jb21wb25lbnRzW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUNvbnRhaW5lclJlYyhuZXdDaGlsZCwgY29udGFpbmVyLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGdldENvbXBvbmVudEluZm8oY2hpbGROb2RlLCBjb250YWluZXIuaWQpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGRlc2lnbklkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyb290Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByb290Tm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiByb290Tm9kZS5nZXRJZCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YkNvbnRhaW5lcnM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVyc1tyb290Q29udGFpbmVyLmlkXSA9IHJvb3RDb250YWluZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbnRhaW5lcnNbcm9vdENvbnRhaW5lci5pZF0gPSByb290Q29udGFpbmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUNvbnRhaW5lclJlYyhjaGlsZE5vZGUsIHJvb3RDb250YWluZXIsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50ID0gZ2V0Q29tcG9uZW50SW5mbyhjaGlsZE5vZGUsIHJvb3RDb250YWluZXIuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Q29udGFpbmVyLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tQ29udGFpbmVyUmVjKG5ld0NoaWxkLCByb290Q29udGFpbmVyLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIuY29tcG9uZW50c1tjaGlsZE5vZGUuZ2V0SWQoKV0gPSBnZXRDb21wb25lbnRJbmZvKGNoaWxkTm9kZSwgcm9vdENvbnRhaW5lci5pZCk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBGSVhNRTogd2F0Y2hDb25maWd1cmF0aW9uU2V0cyBhbmQgd2F0Y2hDb25maWd1cmF0aW9ucyBzaG91bGQgcHJvYmFibHkgZ28gdG8gYSBEZXNlcnRDb25maWd1cmF0aW9uLVNlcnZpY2UsXHJcbiAgICAgICAgLy8gd2l0aCBhIHJlbGF0ZWQgY29udHJvbGxlciBEZXNlcnRDb25maWd1cmF0aW9uU2V0TGlzdCwgd2hlcmUgZGV0YWlscyBhcmUgY29uZmlndXJhdGlvbnMuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGdlbmVyYXRlZCBEZXNlcnRDb25maWd1cmF0aW9uU2V0cyBpbnNpZGUgYSBEZXNpZ24uXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIGRlc2lnbklkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoQ29uZmlndXJhdGlvblNldHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNmZ1NldHM6IHt9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6IHBhcmVudENvbnRleHQucHJvamVjdElkLFxyXG4gICAgICAgICAgICAgICAgICAgIGJyYW5jaElkOiBwYXJlbnRDb250ZXh0LmJyYW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbmZpZ3VyYXRpb25TZXRzXycgKyBkZXNpZ25JZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZGF0YS5yZWdpb25JZCA9IGNvbnRleHQucmVnaW9uSWQ7XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FkZGVkIG5ldyB3YXRjaGVyOiAnLCB3YXRjaGVycyk7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvZ0NvbnRleHQoY29udGV4dCk7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBkZXNpZ25JZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGVzaWduTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm5hbWUgPSBkZXNpZ25Ob2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLmxvYWRDaGlsZHJlbihjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihuZXdOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmNmZ1NldHNbaWRdLm5hbWUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjICE9PSBkYXRhLmNmZ1NldHNbaWRdLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9kYXRhLmNmZ1NldHNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS53YXJuKCdjaGFuZ2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2Rlc1tpXS5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jZmdTZXRzW2NoaWxkTm9kZXNbaV0uZ2V0SWQoKV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkTm9kZXNbaV0uZ2V0SWQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1tpXS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzW2ldLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdjZmdTZXRzJywgY2ZnU2V0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vblVwZGF0ZShmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCkge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24od2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIHJlZ2lvbklkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZm4pIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGZuKTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIFdlYkdNRUdsb2JhbCwgY29uc29sZSovXHJcblxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdmaWxlU2VydmljZScsIGZ1bmN0aW9uICgkcSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGJsb2JDbGllbnQgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuQmxvYkNsaWVudCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVEcm9wcGVkRmlsZXMgPSBmdW5jdGlvbiAoZmlsZXMsIHZhbGlkRXh0ZW5zaW9ucykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgaSxcclxuICAgICAgICAgICAgICAgIGNvdW50ZXIgPSBmaWxlcy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBhcnRpZSA9IGJsb2JDbGllbnQuY3JlYXRlQXJ0aWZhY3QoJ2Ryb3BwZWRGaWxlcycpLFxyXG4gICAgICAgICAgICAgICAgYWRkRmlsZSxcclxuICAgICAgICAgICAgICAgIGFkZGVkRmlsZXMgPSBbXSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3VudGVyIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhZGRlZEZpbGVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY291bnRlciA9IGZpbGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGFkZEZpbGUgPSBmdW5jdGlvbiAoZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbGVFeHRlbnNpb24gPSBzZWxmLmdldEZpbGVFeHRlbnNpb24oZmlsZS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsaWRFeHRlbnNpb25zIHx8IHZhbGlkRXh0ZW5zaW9uc1tmaWxlRXh0ZW5zaW9uXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFydGllLmFkZEZpbGVBc1NvZnRMaW5rKGZpbGUubmFtZSwgZmlsZSwgZnVuY3Rpb24gKGVyciwgaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgYWRkIGZpbGUgXCInICsgZmlsZS5uYW1lICsgJ1wiIHRvIGJsb2IsIGVycjogJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkZWRGaWxlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2gsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBmaWxlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBmaWxlRXh0ZW5zaW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogc2VsZi5odW1hbkZpbGVTaXplKGZpbGUuc2l6ZSwgdHJ1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGJsb2JDbGllbnQuZ2V0RG93bmxvYWRVUkwoaGFzaClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ291bnRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGFkZEZpbGUoZmlsZXNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBkb3dubG9hZCB1cmwgZm9yIHRoZSBnaXZlbiBoYXNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBoYXNoIC0gaGFzaCB0byBibG9iIGZpbGUuXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gLSB0aGUgZG93bmxvYWQgdXJsIChudWxsIGlmIGhhc2ggaXMgZW1wdHkpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZ2V0RG93bmxvYWRVcmwgPSBmdW5jdGlvbiAoaGFzaCkge1xyXG4gICAgICAgICAgICB2YXIgdXJsO1xyXG4gICAgICAgICAgICBpZiAoaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgdXJsID0gYmxvYkNsaWVudC5nZXREb3dubG9hZFVSTChoYXNoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gaGFzaCB0byBibG9iIGZpbGUgZ2l2ZW4nKTtcclxuICAgICAgICAgICAgICAgIHVybCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB1cmw7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZmlsZSBleHRlbnNpb24gb2YgdGhlIGdpdmVuIGZpbGVuYW1lLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gdGhlIHJlc3VsdGluZyBmaWxlIGV4dGVuc2lvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmdldEZpbGVFeHRlbnNpb24gPSBmdW5jdGlvbiAoZmlsZW5hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGEgPSBmaWxlbmFtZS5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgIGlmIChhLmxlbmd0aCA9PT0gMSB8fCAoYVswXSA9PT0gXCJcIiAmJiBhLmxlbmd0aCA9PT0gMikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhLnBvcCgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRm9ybWF0cyB0aGUgc2l6ZSBpbnRvIGEgaHVtYW4gcmVhZGFibGUgc3RyaW5nLlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBieXRlcyAtIHNpemUgaW4gYnl0ZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBzaSAtIHJldHVybiByZXN1bHQgaW4gU0lVbml0cyBvciBub3QuXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gLSBmb3JtYXR0ZWQgZmlsZSBzaXplLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuaHVtYW5GaWxlU2l6ZSA9IGZ1bmN0aW9uIChieXRlcywgc2kpIHtcclxuICAgICAgICAgICAgdmFyIHRocmVzaCA9IHNpID8gMTAwMCA6IDEwMjQsXHJcbiAgICAgICAgICAgICAgICB1bml0cyxcclxuICAgICAgICAgICAgICAgIHU7XHJcbiAgICAgICAgICAgIGlmIChieXRlcyA8IHRocmVzaCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ5dGVzICsgJyBCJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdW5pdHMgPSBzaSA/IFsna0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXSA6XHJcbiAgICAgICAgICAgICAgICAgICAgWydLaUInLCAnTWlCJywgJ0dpQicsICdUaUInLCAnUGlCJywgJ0VpQicsICdaaUInLCAnWWlCJ107XHJcbiAgICAgICAgICAgIHUgPSAtMTtcclxuXHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGJ5dGVzID0gYnl0ZXMgLyB0aHJlc2g7XHJcbiAgICAgICAgICAgICAgICB1ICs9IDE7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKGJ5dGVzID49IHRocmVzaCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnl0ZXMudG9GaXhlZCgxKSArICcgJyArIHVuaXRzW3VdO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgV2ViR01FR2xvYmFsLCBjb25zb2xlKi9cclxuXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ3BsdWdpblNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsIGRhdGFTdG9yZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdGhpcy50ZXN0UnVuUGx1Z2luID0gZnVuY3Rpb24gKGNvbnRleHQsIHBsdWdpbk5hbWUsIGNvbmZpZykge1xyXG4gICAgICAgICAgICB2YXIgZGJDb25uID0gZGF0YVN0b3JlU2VydmljZS5nZXREYXRhYmFzZUNvbm5lY3Rpb24oY29udGV4dC5kYiksXHJcbiAgICAgICAgICAgICAgICBpbnRlcnByZXRlck1hbmFnZXIgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuSW50ZXJwcmV0ZXJNYW5hZ2VyKGRiQ29ubi5jbGllbnQpO1xyXG5cclxuICAgICAgICAgICAgaW50ZXJwcmV0ZXJNYW5hZ2VyLnJ1bignQWRtRXhwb3J0ZXInLCB7YWN0aXZlTm9kZTogJy8xNTg2NDIxNjYwLzk1ODkxOTQyNS8yMzk1MzQyMzgnfSwgZnVuY3Rpb24gKGEsIGIsIGMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGEsIGIsIGMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ3Rlc3RCZW5jaFNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLmRlbGV0ZVRlc3RCZW5jaCA9IGZ1bmN0aW9uICh0ZXN0QmVuY2hJZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBvcnRUZXN0QmVuY2ggPSBmdW5jdGlvbiAodGVzdEJlbmNoSWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3QgPSBmdW5jdGlvbiAodGVzdEJlbmNoSWQsIGRlc2lnbklkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJ1blRlc3RCZW5jaCA9IGZ1bmN0aW9uICh0ZXN0QmVuY2hJZCwgY29uZmlndXJhdGlvbklkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhbGwgdGVzdC1iZW5jaGVzIChleGlzdGVuY2UgYW5kIHRoZWlyIGF0dHJpYnV0ZXMpIG9mIGEgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZCAtIFBhdGggdG8gd29ya3NwYWNlIHRoYXQgc2hvdWxkIGJlIHdhdGNoZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLnRlc3RCZW5jaGVzLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hUZXN0QmVuY2hlcyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2hlcycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogcGFyZW50Q29udGV4dC5wcm9qZWN0SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmNoSWQ6IHBhcmVudENvbnRleHQuYnJhbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoZXM6IHt9IC8vIHRlc3RCZW5jaCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIHBhdGg6IDxzdHJpbmc+LCByZXN1bHRzOiA8aGFzaHxzdHJpbmc+LCBmaWxlczogPGhhc2h8c3RyaW5nPiB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Jlc3VsdHMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnUmVzdWx0cycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdGaWxlcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdUZXN0QmVuY2hGaWxlcycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BhdGggIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLnBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0ucGF0aCA9IG5ld1BhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UmVzdWx0cyAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0ucmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5yZXN1bHRzID0gbmV3UmVzdWx0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdGaWxlcyAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0uZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0uZmlsZXMgPSBuZXdGaWxlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLnRlc3RCZW5jaGVzW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnRlc3RCZW5jaGVzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaElkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1t0ZXN0QmVuY2hJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUZXN0QmVuY2hGaWxlcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbdGVzdEJlbmNoSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1Rlc3RCZW5jaEZpbGVzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiB0ZXN0QmVuY2hJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLnRlc3RCZW5jaGVzW3Rlc3RCZW5jaElkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhIHRlc3QtYmVuY2ggdy5yLnQuIGludGVyZmFjZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHRlc3RCZW5jaElkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoRGV0YWlscyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB0ZXN0QmVuY2hJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2hEZXRhaWxzXycgKyB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVySWRzOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICB0bHN1dDogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gZGF0YS5jb250YWluZXJJZHMuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb250YWluZXJJZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB0ZXN0QmVuY2hJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodGVzdEJlbmNoTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hOb2RlLmxvYWRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVySWRzLnB1c2goY2hpbGRyZW5baV0uZ2V0SWQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbltpXS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbnRhaW5lcklkcy5wdXNoKG5ld0NoaWxkLmdldElkKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGEgdGVzdC1iZW5jaCB3LnIudC4gaW50ZXJmYWNlcy5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gY29udGFpbmVySWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGNvbnRhaW5lcklkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGNvbnRhaW5lcklkLCB1cGRhdGVMaXN0ZW5lcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZm4pO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ3dvcmtzcGFjZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLmR1cGxpY2F0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBvdGhlcldvcmtzcGFjZUlkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ3JlYXRpbmcgbmV3IHdvcmtzcGFjZSBidXQgbm90IHVzaW5nIGRhdGEnLCBkYXRhKTtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoY29udGV4dCwgJycsIG1ldGEuV29ya1NwYWNlLCAnW1dlYkN5UGh5XSAtIFdvcmtzcGFjZVNlcnZpY2UuY3JlYXRlV29ya3NwYWNlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG5ld05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobmV3Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgd29yay1zcGFjZSBmcm9tIHRoZSBjb250ZXh0IChkYi9wcm9qZWN0L2JyYW5jaCkuXHJcbiAgICAgICAgICogQHBhcmFtIGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIsIE4uQi4gZG9lcyBub3QgbmVlZCB0byBzcGVjaWZ5IHJlZ2lvbi5cclxuICAgICAgICAgKiBAcGFyYW0gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmRlbGV0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCB3b3Jrc3BhY2VJZCwgbXNnKSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICdXb3Jrc3BhY2VTZXJ2aWNlLmRlbGV0ZVdvcmtzcGFjZSAnICsgd29ya3NwYWNlSWQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmRlc3Ryb3lOb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBtZXNzYWdlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmV4cG9ydFdvcmtzcGFjZSA9IGZ1bmN0aW9uICh3b3Jrc3BhY2VJZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBUT0RPOiBtYWtlIHN1cmUgdGhlIG1ldGhvZHMgYmVsb3cgZ2V0cyByZXNvbHZlZCBhdCBlcnJvciB0b28uXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIHdvcmstc3BhY2VzIGRlZmluZWQgaW4gdGhlIHJvb3Qtbm9kZSB3LnIudC4gZXhpc3RlbmNlIGFuZCBhdHRyaWJ1dGVzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLndvcmtzcGFjZXMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaFdvcmtzcGFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hXb3Jrc3BhY2VzJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlczoge30gLy8gd29ya3NwYWNlID0ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS53b3Jrc3BhY2VzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS53b3Jrc3BhY2VzW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLndvcmtzcGFjZXNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLndvcmtzcGFjZXNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEud29ya3NwYWNlc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCAnJylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocm9vdE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Xb3JrU3BhY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdzSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW3dzSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHdzSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuV29ya1NwYWNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW3dzSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHdzSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiB3c0lkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEud29ya3NwYWNlc1t3c0lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBjb21wb25lbnRzIChkZWZpbmVkIGluIEFDTUZvbGRlcnMpIGluIHRoZSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIgKG11c3QgaGF2ZSBhIHJlZ2lvbklkIGRlZmluZWQpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gY2FsbGVkIG9uIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLWJhc2UuIERhdGEgaXMgdGhlIHVwZGF0ZWQgZGF0YS5jb3VudC5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mQ29tcG9uZW50c18nICsgd29ya3NwYWNlSWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50OiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29udGFpbmVycyAoZGVmaW5lZCBpbiBBRE1Gb2xkZXJzKSBpbiB0aGUgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIHRoZSB1cGRhdGVkIGRhdGEuY291bnQuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaE51bWJlck9mRGVzaWducyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkRlc2lnbnNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRDb250ZXh0LnJlZ2lvbklkKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocGFyZW50Q29udGV4dC5yZWdpb25JZCArICcgaXMgbm90IGEgcmVnaXN0ZXJlZCB3YXRjaGVyISAnICtcclxuICAgICAgICAgICAgICAgICAgICAnVXNlIFwidGhpcy5yZWdpc3RlcldhdGNoZXJcIiBiZWZvcmUgdHJ5aW5nIHRvIGFjY2VzcyBOb2RlIE9iamVjdHMuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiB0ZXN0LWJlbmNoZXMgKGRlZmluZWQgaW4gQVRNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mVGVzdEJlbmNoZXNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucy5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQpIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyh3YXRjaGVycywgcGFyZW50Q29udGV4dCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgcmVnaW9uSWQpIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJXYXRjaGVyID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGZuKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBmbik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dDb250ZXh0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9nQ29udGV4dChjb250ZXh0KTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIHJlcXVpcmUsIGFuZ3VsYXIgKi9cclxuLyoqXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnLCBbJ2dtZS5zZXJ2aWNlcyddKTtcclxucmVxdWlyZSgnLi9CYXNlQ3lQaHlTZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vUGx1Z2luU2VydmljZScpO1xyXG5yZXF1aXJlKCcuL0ZpbGVTZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vV29ya3NwYWNlU2VydmljZScpO1xyXG5yZXF1aXJlKCcuL0NvbXBvbmVudFNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9EZXNpZ25TZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vVGVzdEJlbmNoU2VydmljZScpOyJdfQ==
