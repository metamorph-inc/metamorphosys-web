(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
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

require('./WorkspaceList/WorkspaceList');
require('./ComponentDetails/ComponentDetails');
require('./ComponentList/ComponentList');
require('./DesignList/DesignList');
require('./DesignTree/DesignTree');
require('./TestBenchList/TestBenchList');


},{"../../bower_components/angular-growl/build/angular-growl.min":2,"../../bower_components/ng-file-upload/angular-file-upload":4,"../../bower_components/ng-file-upload/angular-file-upload-shim":3,"./ComponentDetails/ComponentDetails":5,"./ComponentList/ComponentList":6,"./DesignList/DesignList":7,"./DesignTree/DesignTree":8,"./TestBenchList/TestBenchList":9,"./WorkspaceList/WorkspaceList":10,"./services/cyphy-services":16}],2:[function(require,module,exports){
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
    .controller('ComponentDetailsController', function ($scope, ComponentService) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {};

        console.log('ComponentDetailsController');

        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'ComponentDetails_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                console.log('Destroying :', context.regionId);
                ComponentService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }
        $scope.details = {
            properties: properties,
            connectors: connectors
        };
//        data = {
//            regionId: regionId,
//            id: componentId,
//            domainModels: {},   //domainModel: id: <string>, type: <string>
//            interfaces: {
//                properties: {}, //property: {id: <string>, name: <string>, dataType: <string>, valueType <string>}
//                connectors: {}  //connector: {id: <string>, name: <string>, domainPorts: <object> }
//            }
//        }

        ComponentService.registerWatcher(context, function (destroy) {
            $scope.details = {
                properties: {},
                connectors: {}
            };
            if (destroy) {
                //TODO: notify user
                return;
            }
            console.info('ComponentDetailsController - initialize event raised');

            ComponentService.watchComponentInterfaces(context, $scope.componentId, function (updateObject) {
                // Since watchComponentDetails keeps the data up-to-date there shouldn't be a need to do any
                // updates here..
            })
                .then(function (componentInterfaces) {
                    $scope.details.properties = componentInterfaces.properties;
                    $scope.details.connectors = componentInterfaces.connectors;
                });
        });
    })
    .directive('componentDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                connectionId: '=connectionId',
                componentId: '=componentId'
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
    .controller('ComponentListController', function ($scope, $window, growl, ComponentService, FileService) {
        'use strict';
        var self = this,
            items = [],             // Items that are passed to the item-list ui-component.
            componentItems = {},    // Same items are stored in a dictionary.
            serviceData2ListItem,
            addDomainWatcher,
            config,
            context;

        console.log('ComponentListController');

        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'ComponentListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                ComponentService.cleanUpAllRegions(context);
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
                console.log('Clicked: ' + item);
                document.location.hash = '/component/' + item.id.replace(/\//g, '-');
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
                                iconClass: 'glyphicon glyphicon-edit',
                                action: function () {
                                    $window.open('/?project=ADMEditor&activeObject=' + item.id, '_blank');
                                }
                            },
                            {
                                id: 'exportAsAdm',
                                label: 'Export ACM',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: {resource: item.resource},
                                action: function (data) {
                                    var hash = data.resource,
                                        url = FileService.getDownloadUrl(hash);
                                    if (url) {
                                        $window.open(url);
                                    } else {
                                        growl.warning('Component does not have a resource.');
                                    }
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
                                iconClass: 'glyphicon glyphicon-remove',
                                actionData: { id: item.id },
                                action: function (data) {
                                    ComponentService.deleteWorkspace(context, data.id);
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
            items: items,
            connectionId: $scope.connectionId // FIXME: This is probably not the right way to do it..
        };

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function (data) {
            var listItem;

            if (componentItems.hasOwnProperty(data.id)) {
                listItem = componentItems[data.id];
                listItem.name = data.name;
                listItem.description = data.description;
                listItem.resource = data.resource; // FIXME: This is probably not the right way to do it..
            } else {
                listItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open item',
                    description: data.description,
                    lastUpdated: {
                        time: new Date(),   // TODO: get this in the future.
                        user: 'N/A'         // TODO: get this in the future.
                    },
                    stats: [ ],
                    details    : 'Content',
                    detailsTemplateUrl: 'details.html',
                    resource: data.resource // FIXME: This is probably not the right way to do it..
                };
                // Add the list-item to the items list and the dictionary.
                items.push(listItem);
                componentItems[listItem.id] = listItem;
            }
        };

        addDomainWatcher = function (componentId) {
            var domainModelsToStat = function (domainModels) {
                var stats = [],
                    labelMap = {
                        CAD:           { value: 0, toolTip: 'CAD',           iconClass: 'glyphicon glyphicon-stop' },
                        Cyber:         { value: 0, toolTip: 'Cyber',         iconClass: 'glyphicon glyphicon-stop' },
                        Manufacturing: { value: 0, toolTip: 'Manufacturing', iconClass: 'glyphicon glyphicon-stop' },
                        Modelica:      { value: 0, toolTip: 'Modelica',      iconClass: 'glyphicon glyphicon-stop' }
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

            ComponentService.watchComponentDomains(context, componentId, function (updateData) {
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

        ComponentService.registerWatcher(context, function (destroyed) {
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

            ComponentService.watchComponents(context, $scope.workspaceId, function (updateObj) {
                //TODO: Implement the updating functionality.
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
    .directive('componentList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ComponentList.html',
            controller: 'ComponentListController'
        };
    });

},{}],7:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('DesignListController', function ($scope, DesignService) {
        'use strict';
        var self = this,
            items = [],
            config;

        console.log('DesignListController');
        console.log($scope.workspaceId);

//        config = {
//
//            sortable: false,
//            secondaryItemMenu: true,
//            detailsCollapsible: true,
//            showDetailsLabel: 'Show details',
//            hideDetailsLabel: 'Hide details',
//
//            // Event handlers
//
//            itemSort: function (jQEvent, ui) {
//                console.log('Sort happened', jQEvent, ui);
//            },
//
//            itemClick: function (event, item) {
//                console.log('Clicked: ' + item);
//                document.location.hash =
//                    '/workspaceDetails//' + item.id;
//            },
//
//            itemContextmenuRenderer: function (e, item) {
//                console.log('Contextmenu was triggered for node:', item);
//
//                return [
//                    {
//                        items: [
//
//                            {
//                                id: 'openInEditor',
//                                label: 'Open in Editor',
//                                disabled: false,
//                                iconClass: 'glyphicon glyphicon-edit'
//                            },
//                            {
//                                id: 'duplicateWorkspace',
//                                label: 'Duplicate',
//                                disabled: false,
//                                iconClass: 'fa fa-copy copy-icon'
//                            },
//                            {
//                                id: 'editWorkspace',
//                                label: 'Edit',
//                                disabled: true,
//                                iconClass: 'glyphicon glyphicon-pencil'
//                            },
//                            {
//                                id: 'exportAsXME',
//                                label: 'Export as XME',
//                                disabled: false,
//                                iconClass: 'glyphicon glyphicon-share-alt',
//                                actionData: { id: item.id },
//                                action: function (data) {
//                                    console.log(data);
//                                }
//                            }
//                        ]
//                    },
//                    {
//                        //label: 'Extra',
//                        items: [
//
//                            {
//                                id: 'delete',
//                                label: 'Delete',
//                                disabled: false,
//                                iconClass: 'fa fa-plus',
//                                actionData: { id: item.id },
//                                action: function (data) {
//                                    WorkspaceService.deleteWorkspace(data.id);
//                                }
//                            }
//                        ]
//                    }
//                ];
//            },
//
//            detailsRenderer: function (item) {
//                //                item.details = 'My details are here now!';
//            },
//
//            newItemForm: {
//                title: 'Create new item',
//                itemTemplateUrl: '/cyphy-components/templates/WorkspaceNewItem.html',
//                expanded: false,
//                controller: function ($scope) {
//                    $scope.createItem = function (newItem) {
//
//                        WorkspaceService.createWorkspace(newItem);
//
//                        $scope.newItem = {};
//
//                        config.newItemForm.expanded = false; // this is how you close the form itself
//
//                    };
//                }
//            },
//
//            filter: {
//            }
//
//        };

        $scope.listData = {
            items: items
        };

//        $scope.config = config;
    })
    .directive('designList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/DesignList.html',
            controller: 'DesignListController'
        };
    });

},{}],8:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('DesignTreeController', function ($scope, DesignService) {
        'use strict';
        var self = this,
            items = [],
            config;

        console.log('DesignTreeController');
        console.log($scope.designId);

        $scope.treeData = {};

        DesignService.watchDesignStructure(null, $scope.designId, function (err, structure) {
            $scope.treeData = structure;
        });

    })
    .directive('designTree', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                designId: '=designId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/DesignTree.html',
            controller: 'DesignTreeController'
        };
    });

},{}],9:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('TestBenchListController', function ($scope, TestBenchService) {
        'use strict';
        var self = this,
            items = [],
            config;

        console.log('TestBenchListController');
        console.log($scope.workspaceId);

//        config = {
//
//            sortable: false,
//            secondaryItemMenu: true,
//            detailsCollapsible: true,
//            showDetailsLabel: 'Show details',
//            hideDetailsLabel: 'Hide details',
//
//            // Event handlers
//
//            itemSort: function (jQEvent, ui) {
//                console.log('Sort happened', jQEvent, ui);
//            },
//
//            itemClick: function (event, item) {
//                console.log('Clicked: ' + item);
//                document.location.hash =
//                    '/workspaceDetails//' + item.id;
//            },
//
//            itemContextmenuRenderer: function (e, item) {
//                console.log('Contextmenu was triggered for node:', item);
//
//                return [
//                    {
//                        items: [
//
//                            {
//                                id: 'openInEditor',
//                                label: 'Open in Editor',
//                                disabled: false,
//                                iconClass: 'glyphicon glyphicon-edit'
//                            },
//                            {
//                                id: 'duplicateWorkspace',
//                                label: 'Duplicate',
//                                disabled: false,
//                                iconClass: 'fa fa-copy copy-icon'
//                            },
//                            {
//                                id: 'editWorkspace',
//                                label: 'Edit',
//                                disabled: true,
//                                iconClass: 'glyphicon glyphicon-pencil'
//                            },
//                            {
//                                id: 'exportAsXME',
//                                label: 'Export as XME',
//                                disabled: false,
//                                iconClass: 'glyphicon glyphicon-share-alt',
//                                actionData: { id: item.id },
//                                action: function (data) {
//                                    console.log(data);
//                                }
//                            }
//                        ]
//                    },
//                    {
//                        //label: 'Extra',
//                        items: [
//
//                            {
//                                id: 'delete',
//                                label: 'Delete',
//                                disabled: false,
//                                iconClass: 'fa fa-plus',
//                                actionData: { id: item.id },
//                                action: function (data) {
//                                    WorkspaceService.deleteWorkspace(data.id);
//                                }
//                            }
//                        ]
//                    }
//                ];
//            },
//
//            detailsRenderer: function (item) {
//                //                item.details = 'My details are here now!';
//            },
//
//            newItemForm: {
//                title: 'Create new item',
//                itemTemplateUrl: '/cyphy-components/templates/WorkspaceNewItem.html',
//                expanded: false,
//                controller: function ($scope) {
//                    $scope.createItem = function (newItem) {
//
//                        WorkspaceService.createWorkspace(newItem);
//
//                        $scope.newItem = {};
//
//                        config.newItemForm.expanded = false; // this is how you close the form itself
//
//                    };
//                }
//            },
//
//            filter: {
//            }
//
//        };

        $scope.listData = {
            items: items
        };

//        $scope.config = config;
    })
    .directive('testBenchList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/TestBenchList.html',
            controller: 'TestBenchListController'
        };
    });

},{}],10:[function(require,module,exports){
/*globals angular, console, document*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('WorkspaceListController', function ($scope, growl, WorkspaceService, FileService) {
        'use strict';
        var self = this,
            items = [],
            workspaceItems = {},
            config,
            context,
            serviceData2WorkspaceItem,
            addCountWatchers;

        console.log('WorkspaceListController');

        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'WorkspaceListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                WorkspaceService.cleanUpAllRegions(context);
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
                document.location.hash =
                    '/workspaceDetails/' + item.id.replace(/\//g, '-');
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
                                    WorkspaceService.duplicateWorkspace(context, data.id);
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
                                    WorkspaceService.deleteWorkspace(context, data.id);
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
                        FileService.saveDroppedFiles($files, {zip: true, adm: true, atm: true})
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
                        //WorkspaceService.createWorkspace(context, newItem);

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


        serviceData2WorkspaceItem = function (data) {
            var workspaceItem;

            if (workspaceItems.hasOwnProperty(data.id)) {
                workspaceItem = workspaceItems[data.id];
                workspaceItem.name = data.name;
                workspaceItem.description = data.description;
            } else {
                workspaceItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open item',
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
            WorkspaceService.watchNumberOfComponents(context, workspaceId, function (updateData) {
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
            WorkspaceService.watchNumberOfDesigns(context, workspaceId, function (updateData) {
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
            WorkspaceService.watchNumberOfTestBenches(context, workspaceId, function (updateData) {
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

        WorkspaceService.registerWatcher(context, function (destroyed) {
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
            WorkspaceService.watchWorkspaces(context, function (updateObject) {
                var index;

                if (updateObject.type === 'load') {
                    serviceData2WorkspaceItem(updateObject.data);
                    addCountWatchers(updateObject.id);

                } else if (updateObject.type === 'update') {
                    serviceData2WorkspaceItem(updateObject.data);

                } else if (updateObject.type === 'unload') {
                    if (workspaceItems.hasOwnProperty(updateObject.id)) {
                        index = items.map(function (e) {
                            return e.id;
                        }).indexOf(updateObject.id);
                        if (index > -1) {
                            items.splice(index, 1);
                        }
                        WorkspaceService.cleanUpRegion(context, context.regionId + '_watchNumberOfComponents_' + updateObject.id);
                        WorkspaceService.cleanUpRegion(context, context.regionId + '_watchNumberOfDesigns_' + updateObject.id);
                        WorkspaceService.cleanUpRegion(context, context.regionId + '_watchNumberOfTestBenches_' + updateObject.id);
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
                            serviceData2WorkspaceItem(data.workspaces[workspaceId]);
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

},{}],11:[function(require,module,exports){
/*globals angular*/


/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('ComponentService', function ($q, NodeService) {
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
            NodeService.destroyNode(context, componentId, message);
        };

        this.exportComponent = function (context, componentId) {
            throw new Error('Not implemented yet.');
        };

        /**
         *  Watches all components (existence and their attributes) of a workspace.
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data.  Data is an object in data.components.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchComponents = function (parentContext, workspaceId, updateListener) {
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

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ACMFolder)) {
                                watchFromFolderRec(newChild, meta);
                            } else if (newChild.isMetaTypeOf(meta.AVMComponentModel)) {
                                componentId = newChild.getId();
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
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, workspaceId)
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
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, componentId)
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
         *  Watches the interfaces of a component.
         * @param parentContext - context of controller.
         * @param componentId
         * @param updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchComponentInterfaces = function (parentContext, componentId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchComponentInterfaces_' + componentId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    id: componentId,
                    properties: {}, //property: {id: <string>, name: <string>, dataType: <string>, valueType <string>}
                    connectors: {}  //connector: {id: <string>, name: <string>, domainPorts: <object> }
                },
                onPropertyUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDataType = this.getAttribute('DataType'),
                        newValueType = this.getAttribute('ValueType'),
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
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, componentId)
                    .then(function (componentNode) {
                        componentNode.loadChildren().then(function (children) {
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
                                        valueType: childNode.getAttribute('ValueType')
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
                                }
                            }
                            componentNode.onNewChildLoaded(function (newChild) {
                                childId = newChild.getId();
                                if (newChild.isMetaTypeOf(meta.Property)) {
                                    data.properties[childId] = {
                                        id: childId,
                                        name: newChild.getAttribute('name'),
                                        dataType: newChild.getAttribute('DataType'),
                                        valueType: newChild.getAttribute('ValueType')
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
         * Removes all watchers spawned from parentContext, this should typically be invoked when the controller is destroyed.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         */
        this.cleanUpAllRegions = function (parentContext) {
            var childWatchers,
                key;
            if (watchers[parentContext.regionId]) {
                childWatchers = watchers[parentContext.regionId];
                for (key in childWatchers) {
                    if (childWatchers.hasOwnProperty(key)) {
                        NodeService.cleanUpRegion(childWatchers[key].db, childWatchers[key].regionId);
                    }
                }
                delete watchers[parentContext.regionId];
            } else {
                console.log('Nothing to clean-up..');
            }
        };

        /**
         * Removes specified watcher (regionId)
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.db - Database connection of both parent and region to be deleted.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         * @param {string} regionId - Region id of the spawned region that should be deleted.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            if (watchers[parentContext.regionId]) {
                if (watchers[parentContext.regionId][regionId]) {
                    NodeService.cleanUpRegion(parentContext.db, regionId);
                    delete watchers[parentContext.regionId][regionId];
                } else {
                    console.log('Nothing to clean-up..');
                }
            } else {
                console.log('Cannot clean-up region since parentContext is not registered..', parentContext);
            }
        };

        /**
         * Registers a watcher (controller) to the service. Callback function is called when nodes became available or
         * when they became unavailable. These are also called directly with the state of the NodeSerivce.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.db - Database connection.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         * @param {function} fn - Called with true when there are no nodes unavailable and false when there are.
         */
        this.registerWatcher = function (parentContext, fn) {
            NodeService.on(parentContext.db, 'initialize', function () {
                // This should be enough, the regions will be cleaned up in NodeService.
                watchers[parentContext.regionId] = {};
                fn(false);
            });
            NodeService.on(parentContext.db, 'destroy', function () {
                // This should be enough, the regions should be cleaned up in NodeService.
                if (watchers[parentContext.regionId]) {
                    delete watchers[parentContext.regionId];
                }
                fn(true);
            });
        };

        this.logContext = function (context) {
            NodeService.logContext(context);
        };
    });
},{}],12:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('DesignService', function ($q, NodeService) {
        'use strict';
        var watchers = {};

        this.deleteDesign = function (designId) {
            throw new Error('Not implemented yet.');
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
         * @param updateListener - invoked when there are (filtered) changes in data.  Data is an object in data.designs.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesigns = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesigns',
                context = {
                    db: parentContext.db,
                    projectId: parentContext.projectId,
                    branchId: parentContext.branchId,
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
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, workspaceId)
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
         *  Watches a design w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesignDetails = function (parentContext, designId, updateListener) {
            throw new Error('Not implemented yet.');
        };

        /**
         *  Watches the full hierarchy of a design w.r.t. containers and components.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchDesignStructure = function (parentContext, designId, updateListener) {
            throw new Error('Not implemented yet.');
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
            NodeService.logContext(context);
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, designId)
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

        // FIXME: Watching configurations inside a configuration-set does probably not belong here.
//        /**
//         *  Watches the DesertConfiguration (w.r.t. existence and attributes) inside a DesertConfigurationSet.
//         * @param parentContext - context of controller.
//         * @param configurationSetId
//         * @param updateListener - invoked when there are (filtered) changes in data.
//         */
//        this.watchConfigurations = function (parentContext, configurationSetId, updateListener) {
//            throw new Error('Not implemented yet.');
//        };

        /**
         * Removes all watchers spawned from parentContext.
         * @param parentContext - context of controller.
         */
        this.cleanUpAllRegions = function (parentContext) {
            var childWatchers,
                key;
            if (watchers[parentContext.regionId]) {
                childWatchers = watchers[parentContext.regionId];
                for (key in childWatchers) {
                    if (childWatchers.hasOwnProperty(key)) {
                        NodeService.cleanUpRegion(childWatchers[key]);
                    }
                }
                delete watchers[parentContext.regionId];
            } else {
                console.log('Nothing to clean-up..');
            }
        };

        /**
         * Removes specified watcher (regionId)
         * @param parentContext
         * @param regionId
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            if (watchers[parentContext.regionId]) {
                if (watchers[parentContext.regionId][regionId]) {
                    NodeService.cleanUpRegion(regionId);
                    delete watchers[parentContext.regionId][regionId];
                } else {
                    console.log('Nothing to clean-up..');
                }
            } else {
                console.log('Cannot clean-up region since parentContext is not registered..', parentContext);
            }
        };
    });
},{}],13:[function(require,module,exports){
/*globals angular, WebGMEGlobal, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services')
    .service('FileService', function ($q) {
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
},{}],14:[function(require,module,exports){
/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.services')
    .service('TestBenchService', function ($q, NodeService) {
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
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data. Data is an object in data.testBenches.
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
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, workspaceId)
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
            throw new Error('Not implemented yet.');
        };
    });
},{}],15:[function(require,module,exports){
/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('WorkspaceService', function ($q, NodeService) {
        'use strict';
        var watchers = {};

        this.duplicateWorkspace = function (context, otherWorkspaceId) {
            throw new Error('Not implemented yet.');
        };

        this.createWorkspace = function (context, data) {
            var deferred = $q.defer();
            console.warn('Creating new workspace but not using data', data);
            NodeService.getMetaNodes(context)
                .then(function (meta) {
                    NodeService.createNode(context, '', meta.WorkSpace, '[WebCyPhy] - WorkspaceService.createWorkspace')
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
            NodeService.destroyNode(context, workspaceId, message);
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
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, '')
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
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, workspaceId)
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
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, workspaceId)
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
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, workspaceId)
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
         * Removes all watchers spawned from parentContext, this should typically be invoked when the controller is destroyed.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         */
        this.cleanUpAllRegions = function (parentContext) {
            var childWatchers,
                key;
            if (watchers[parentContext.regionId]) {
                childWatchers = watchers[parentContext.regionId];
                for (key in childWatchers) {
                    if (childWatchers.hasOwnProperty(key)) {
                        NodeService.cleanUpRegion(childWatchers[key].db, childWatchers[key].regionId);
                    }
                }
                delete watchers[parentContext.regionId];
            } else {
                console.log('Nothing to clean-up..');
            }
        };

        /**
         * Removes specified watcher (regionId)
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.db - Database connection of both parent and region to be deleted.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         * @param {string} regionId - Region id of the spawned region that should be deleted.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            if (watchers[parentContext.regionId]) {
                if (watchers[parentContext.regionId][regionId]) {
                    NodeService.cleanUpRegion(parentContext.db, regionId);
                    delete watchers[parentContext.regionId][regionId];
                } else {
                    console.log('Nothing to clean-up..');
                }
            } else {
                console.log('Cannot clean-up region since parentContext is not registered..', parentContext);
            }
        };

        /**
         * Registers a watcher (controller) to the service. Callback function is called when nodes became available or
         * when they became unavailable. These are also called directly with the state of the NodeSerivce.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.db - Database connection.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         * @param {function} fn - Called with true when there are no nodes unavailable and false when there are.
         */
        this.registerWatcher = function (parentContext, fn) {
            NodeService.on(parentContext.db, 'initialize', function () {
                // This should be enough, the regions will be cleaned up in NodeService.
                watchers[parentContext.regionId] = {};
                fn(false);
            });
            NodeService.on(parentContext.db, 'destroy', function () {
                // This should be enough, the regions should be cleaned up in NodeService.
                if (watchers[parentContext.regionId]) {
                    delete watchers[parentContext.regionId];
                }
                fn(true);
            });
        };

        this.logContext = function (context) {
            NodeService.logContext(context);
        };
    });
},{}],16:[function(require,module,exports){
/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.services', ['gme.services']);
require('./FileService');
require('./WorkspaceService');
require('./ComponentService');
require('./DesignService');
require('./TestBenchService');
},{"./ComponentService":11,"./DesignService":12,"./FileService":13,"./TestBenchService":14,"./WorkspaceService":15}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvbGlicmFyeS9jeXBoeS1jb21wb25lbnRzLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL2FuZ3VsYXItZ3Jvd2wvYnVpbGQvYW5ndWxhci1ncm93bC5taW4uanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0NvbXBvbmVudERldGFpbHMvQ29tcG9uZW50RGV0YWlscy5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9EZXNpZ25MaXN0L0Rlc2lnbkxpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0Rlc2lnblRyZWUvRGVzaWduVHJlZS5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Xb3Jrc3BhY2VMaXN0L1dvcmtzcGFjZUxpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0NvbXBvbmVudFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Rlc2lnblNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0ZpbGVTZXJ2aWNlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9UZXN0QmVuY2hTZXJ2aWNlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9Xb3Jrc3BhY2VTZXJ2aWNlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9jeXBoeS1zZXJ2aWNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzllQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyByZXF1aXJlLCBhbmd1bGFyICovXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG4vLyBFeHRlcm5hbCBkZXBlbmRlbmNpZXNcclxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9uZy1maWxlLXVwbG9hZC9hbmd1bGFyLWZpbGUtdXBsb2FkLXNoaW0nKTtcclxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9uZy1maWxlLXVwbG9hZC9hbmd1bGFyLWZpbGUtdXBsb2FkJyk7XHJcbi8vcmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9hbmd1bGFyLWFuaW1hdGUvYW5ndWxhci1hbmltYXRlLm1pbicpO1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2FuZ3VsYXItZ3Jvd2wvYnVpbGQvYW5ndWxhci1ncm93bC5taW4nKTtcclxuXHJcbi8vIEludGVybmFsIGRlcGVuZGVuY2llc1xyXG5yZXF1aXJlKCcuL3NlcnZpY2VzL2N5cGh5LXNlcnZpY2VzJyk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycsIFtcclxuICAgICdjeXBoeS5zZXJ2aWNlcycsXHJcbiAgICAnY3lwaHkuY29tcG9uZW50cy50ZW1wbGF0ZXMnLFxyXG4gICAgJ2FuZ3VsYXJGaWxlVXBsb2FkJyxcclxuLy8gICAgJ25nQW5pbWF0ZScsXHJcbiAgICAnYW5ndWxhci1ncm93bCdcclxuXSkuY29uZmlnKFsnZ3Jvd2xQcm92aWRlcicsIGZ1bmN0aW9uIChncm93bFByb3ZpZGVyKSB7XHJcbiAgICBncm93bFByb3ZpZGVyLmdsb2JhbFRpbWVUb0xpdmUoe3N1Y2Nlc3M6IDUwMDAsIGVycm9yOiAtMSwgd2FybmluZzogMjAwMDAsIGluZm86IDUwMDB9KTtcclxufV0pO1xyXG5cclxucmVxdWlyZSgnLi9Xb3Jrc3BhY2VMaXN0L1dvcmtzcGFjZUxpc3QnKTtcclxucmVxdWlyZSgnLi9Db21wb25lbnREZXRhaWxzL0NvbXBvbmVudERldGFpbHMnKTtcclxucmVxdWlyZSgnLi9Db21wb25lbnRMaXN0L0NvbXBvbmVudExpc3QnKTtcclxucmVxdWlyZSgnLi9EZXNpZ25MaXN0L0Rlc2lnbkxpc3QnKTtcclxucmVxdWlyZSgnLi9EZXNpZ25UcmVlL0Rlc2lnblRyZWUnKTtcclxucmVxdWlyZSgnLi9UZXN0QmVuY2hMaXN0L1Rlc3RCZW5jaExpc3QnKTtcclxuXHJcbiIsIi8qKlxuICogYW5ndWxhci1ncm93bC12MiAtIHYwLjcuMCAtIDIwMTQtMDgtMTBcbiAqIGh0dHA6Ly9qYW5zdGV2ZW5zLmdpdGh1Yi5pby9hbmd1bGFyLWdyb3dsLTJcbiAqIENvcHlyaWdodCAoYykgMjAxNCBNYXJjbyBSaW5jayxKYW4gU3RldmVuczsgTGljZW5zZWQgTUlUXG4gKi9cbmFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhci1ncm93bFwiLFtdKSxhbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZ3Jvd2xcIikuZGlyZWN0aXZlKFwiZ3Jvd2xcIixbXCIkcm9vdFNjb3BlXCIsXCIkc2NlXCIsZnVuY3Rpb24oYSxiKXtcInVzZSBzdHJpY3RcIjtyZXR1cm57cmVzdHJpY3Q6XCJBXCIsdGVtcGxhdGVVcmw6XCJ0ZW1wbGF0ZXMvZ3Jvd2wvZ3Jvd2wuaHRtbFwiLHJlcGxhY2U6ITEsc2NvcGU6e3JlZmVyZW5jZTpcIkBcIixpbmxpbmU6XCJAXCIsbGltaXRNZXNzYWdlczpcIj1cIn0sY29udHJvbGxlcjpbXCIkc2NvcGVcIixcIiR0aW1lb3V0XCIsXCJncm93bFwiLGZ1bmN0aW9uKGMsZCxlKXtmdW5jdGlvbiBmKGEpe2QoZnVuY3Rpb24oKXt2YXIgZixoO2lmKCFnfHwoYW5ndWxhci5mb3JFYWNoKGMubWVzc2FnZXMsZnVuY3Rpb24oYyl7aD1iLmdldFRydXN0ZWRIdG1sKGMudGV4dCksYS50ZXh0PT09aCYmYS5zZXZlcml0eT09PWMuc2V2ZXJpdHkmJmMudGl0bGU9PT1jLnRpdGxlJiYoZj0hMCl9KSwhZikpe2lmKGEudGV4dD1iLnRydXN0QXNIdG1sKFN0cmluZyhhLnRleHQpKSxhLnR0bCYmLTEhPT1hLnR0bCYmKGEuY291bnRkb3duPWEudHRsLzFlMyxhLnByb21pc2VzPVtdLGEuY2xvc2U9ITEsYS5jb3VudGRvd25GdW5jdGlvbj1mdW5jdGlvbigpe2EuY291bnRkb3duPjE/KGEuY291bnRkb3duLS0sYS5wcm9taXNlcy5wdXNoKGQoYS5jb3VudGRvd25GdW5jdGlvbiwxZTMpKSk6YS5jb3VudGRvd24tLX0pLGFuZ3VsYXIuaXNEZWZpbmVkKGMubGltaXRNZXNzYWdlcykpe3ZhciBpPWMubWVzc2FnZXMubGVuZ3RoLShjLmxpbWl0TWVzc2FnZXMtMSk7aT4wJiZjLm1lc3NhZ2VzLnNwbGljZShjLmxpbWl0TWVzc2FnZXMtMSxpKX1lLnJldmVyc2VPcmRlcigpP2MubWVzc2FnZXMudW5zaGlmdChhKTpjLm1lc3NhZ2VzLnB1c2goYSksYS50dGwmJi0xIT09YS50dGwmJihhLnByb21pc2VzLnB1c2goZChmdW5jdGlvbigpe2MuZGVsZXRlTWVzc2FnZShhKX0sYS50dGwpKSxhLnByb21pc2VzLnB1c2goZChhLmNvdW50ZG93bkZ1bmN0aW9uLDFlMykpKX19LCEwKX12YXIgZz1lLm9ubHlVbmlxdWUoKTtjLm1lc3NhZ2VzPVtdO3ZhciBoPWMucmVmZXJlbmNlfHwwO2MuaW5saW5lTWVzc2FnZT1jLmlubGluZXx8ZS5pbmxpbmVNZXNzYWdlcygpLGEuJG9uKFwiZ3Jvd2xNZXNzYWdlXCIsZnVuY3Rpb24oYSxiKXtwYXJzZUludChoLDEwKT09PXBhcnNlSW50KGIucmVmZXJlbmNlSWQsMTApJiZmKGIpfSksYy5kZWxldGVNZXNzYWdlPWZ1bmN0aW9uKGEpe3ZhciBiPWMubWVzc2FnZXMuaW5kZXhPZihhKTtiPi0xJiZjLm1lc3NhZ2VzLnNwbGljZShiLDEpfSxjLnN0b3BUaW1lb3V0Q2xvc2U9ZnVuY3Rpb24oYSl7YW5ndWxhci5mb3JFYWNoKGEucHJvbWlzZXMsZnVuY3Rpb24oYSl7ZC5jYW5jZWwoYSl9KSxhLmNsb3NlP2MuZGVsZXRlTWVzc2FnZShhKTphLmNsb3NlPSEwfSxjLmFsZXJ0Q2xhc3Nlcz1mdW5jdGlvbihhKXtyZXR1cm57XCJhbGVydC1zdWNjZXNzXCI6XCJzdWNjZXNzXCI9PT1hLnNldmVyaXR5LFwiYWxlcnQtZXJyb3JcIjpcImVycm9yXCI9PT1hLnNldmVyaXR5LFwiYWxlcnQtZGFuZ2VyXCI6XCJlcnJvclwiPT09YS5zZXZlcml0eSxcImFsZXJ0LWluZm9cIjpcImluZm9cIj09PWEuc2V2ZXJpdHksXCJhbGVydC13YXJuaW5nXCI6XCJ3YXJuaW5nXCI9PT1hLnNldmVyaXR5LGljb246YS5kaXNhYmxlSWNvbnM9PT0hMSxcImFsZXJ0LWRpc21pc3NhYmxlXCI6IWEuZGlzYWJsZUNsb3NlQnV0dG9ufX0sYy5zaG93Q291bnREb3duPWZ1bmN0aW9uKGEpe3JldHVybiFhLmRpc2FibGVDb3VudERvd24mJmEudHRsPjB9LGMud3JhcHBlckNsYXNzZXM9ZnVuY3Rpb24oKXt2YXIgYT17fTtyZXR1cm4gYVtcImdyb3dsLWZpeGVkXCJdPSFjLmlubGluZU1lc3NhZ2UsYVtlLnBvc2l0aW9uKCldPSEwLGF9LGMuY29tcHV0ZVRpdGxlPWZ1bmN0aW9uKGEpe3ZhciBiPXtzdWNjZXNzOlwiU3VjY2Vzc1wiLGVycm9yOlwiRXJyb3JcIixpbmZvOlwiSW5mb3JtYXRpb25cIix3YXJuOlwiV2FybmluZ1wifTtyZXR1cm4gYlthLnNldmVyaXR5XX19XX19XSksYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWdyb3dsXCIpLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGEpe1widXNlIHN0cmljdFwiO3ZvaWQgMD09PWEuZ2V0KFwidGVtcGxhdGVzL2dyb3dsL2dyb3dsLmh0bWxcIikmJmEucHV0KFwidGVtcGxhdGVzL2dyb3dsL2dyb3dsLmh0bWxcIiwnPGRpdiBjbGFzcz1cImdyb3dsLWNvbnRhaW5lclwiIG5nLWNsYXNzPVwid3JhcHBlckNsYXNzZXMoKVwiPjxkaXYgY2xhc3M9XCJncm93bC1pdGVtIGFsZXJ0XCIgbmctcmVwZWF0PVwibWVzc2FnZSBpbiBtZXNzYWdlc1wiIG5nLWNsYXNzPVwiYWxlcnRDbGFzc2VzKG1lc3NhZ2UpXCIgbmctY2xpY2s9XCJzdG9wVGltZW91dENsb3NlKG1lc3NhZ2UpXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgbmctY2xpY2s9XCJkZWxldGVNZXNzYWdlKG1lc3NhZ2UpXCIgbmctc2hvdz1cIiFtZXNzYWdlLmRpc2FibGVDbG9zZUJ1dHRvblwiPiZ0aW1lczs8L2J1dHRvbj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgbmctc2hvdz1cInNob3dDb3VudERvd24obWVzc2FnZSlcIj57e21lc3NhZ2UuY291bnRkb3dufX08L2J1dHRvbj48aDQgY2xhc3M9XCJncm93bC10aXRsZVwiIG5nLXNob3c9XCJtZXNzYWdlLnRpdGxlXCIgbmctYmluZD1cIm1lc3NhZ2UudGl0bGVcIj48L2g0PjxkaXYgY2xhc3M9XCJncm93bC1tZXNzYWdlXCIgbmctYmluZC1odG1sPVwibWVzc2FnZS50ZXh0XCI+PC9kaXY+PC9kaXY+PC9kaXY+Jyl9XSksYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWdyb3dsXCIpLnByb3ZpZGVyKFwiZ3Jvd2xcIixmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciBhPXtzdWNjZXNzOm51bGwsZXJyb3I6bnVsbCx3YXJuaW5nOm51bGwsaW5mbzpudWxsfSxiPVwibWVzc2FnZXNcIixjPVwidGV4dFwiLGQ9XCJ0aXRsZVwiLGU9XCJzZXZlcml0eVwiLGY9ITAsZz1cInZhcmlhYmxlc1wiLGg9MCxpPSExLGo9XCJ0b3AtcmlnaHRcIixrPSExLGw9ITEsbT0hMSxuPSExO3RoaXMuZ2xvYmFsVGltZVRvTGl2ZT1mdW5jdGlvbihiKXtpZihcIm9iamVjdFwiPT10eXBlb2YgYilmb3IodmFyIGMgaW4gYiliLmhhc093blByb3BlcnR5KGMpJiYoYVtjXT1iW2NdKTtlbHNlIGZvcih2YXIgZCBpbiBhKWEuaGFzT3duUHJvcGVydHkoZCkmJihhW2RdPWIpfSx0aGlzLmdsb2JhbERpc2FibGVDbG9zZUJ1dHRvbj1mdW5jdGlvbihhKXtrPWF9LHRoaXMuZ2xvYmFsRGlzYWJsZUljb25zPWZ1bmN0aW9uKGEpe2w9YX0sdGhpcy5nbG9iYWxSZXZlcnNlZE9yZGVyPWZ1bmN0aW9uKGEpe209YX0sdGhpcy5nbG9iYWxEaXNhYmxlQ291bnREb3duPWZ1bmN0aW9uKGEpe249YX0sdGhpcy5tZXNzYWdlVmFyaWFibGVLZXk9ZnVuY3Rpb24oYSl7Zz1hfSx0aGlzLmdsb2JhbElubGluZU1lc3NhZ2VzPWZ1bmN0aW9uKGEpe2k9YX0sdGhpcy5nbG9iYWxQb3NpdGlvbj1mdW5jdGlvbihhKXtqPWF9LHRoaXMubWVzc2FnZXNLZXk9ZnVuY3Rpb24oYSl7Yj1hfSx0aGlzLm1lc3NhZ2VUZXh0S2V5PWZ1bmN0aW9uKGEpe2M9YX0sdGhpcy5tZXNzYWdlVGl0bGVLZXk9ZnVuY3Rpb24oYSl7ZD1hfSx0aGlzLm1lc3NhZ2VTZXZlcml0eUtleT1mdW5jdGlvbihhKXtlPWF9LHRoaXMub25seVVuaXF1ZU1lc3NhZ2VzPWZ1bmN0aW9uKGEpe2Y9YX0sdGhpcy5zZXJ2ZXJNZXNzYWdlc0ludGVyY2VwdG9yPVtcIiRxXCIsXCJncm93bFwiLGZ1bmN0aW9uKGEsYyl7ZnVuY3Rpb24gZChhKXthLmRhdGFbYl0mJmEuZGF0YVtiXS5sZW5ndGg+MCYmYy5hZGRTZXJ2ZXJNZXNzYWdlcyhhLmRhdGFbYl0pfXJldHVybntyZXNwb25zZTpmdW5jdGlvbihhKXtyZXR1cm4gZChhKSxhfSxyZXNwb25zZUVycm9yOmZ1bmN0aW9uKGIpe3JldHVybiBkKGIpLGEucmVqZWN0KGIpfX19XSx0aGlzLiRnZXQ9W1wiJHJvb3RTY29wZVwiLFwiJGludGVycG9sYXRlXCIsXCIkZmlsdGVyXCIsZnVuY3Rpb24oYixvLHApe2Z1bmN0aW9uIHEoYSl7aWYoQilhLnRleHQ9QihhLnRleHQsYS52YXJpYWJsZXMpO2Vsc2V7dmFyIGM9byhhLnRleHQpO2EudGV4dD1jKGEudmFyaWFibGVzKX1iLiRicm9hZGNhc3QoXCJncm93bE1lc3NhZ2VcIixhKX1mdW5jdGlvbiByKGIsYyxkKXt2YXIgZSxmPWN8fHt9O2U9e3RleHQ6Yix0aXRsZTpmLnRpdGxlLHNldmVyaXR5OmQsdHRsOmYudHRsfHxhW2RdLHZhcmlhYmxlczpmLnZhcmlhYmxlc3x8e30sZGlzYWJsZUNsb3NlQnV0dG9uOnZvaWQgMD09PWYuZGlzYWJsZUNsb3NlQnV0dG9uP2s6Zi5kaXNhYmxlQ2xvc2VCdXR0b24sZGlzYWJsZUljb25zOnZvaWQgMD09PWYuZGlzYWJsZUljb25zP2w6Zi5kaXNhYmxlSWNvbnMsZGlzYWJsZUNvdW50RG93bjp2b2lkIDA9PT1mLmRpc2FibGVDb3VudERvd24/bjpmLmRpc2FibGVDb3VudERvd24scG9zaXRpb246Zi5wb3NpdGlvbnx8aixyZWZlcmVuY2VJZDpmLnJlZmVyZW5jZUlkfHxofSxxKGUpfWZ1bmN0aW9uIHMoYSxiKXtyKGEsYixcIndhcm5pbmdcIil9ZnVuY3Rpb24gdChhLGIpe3IoYSxiLFwiZXJyb3JcIil9ZnVuY3Rpb24gdShhLGIpe3IoYSxiLFwiaW5mb1wiKX1mdW5jdGlvbiB2KGEsYil7cihhLGIsXCJzdWNjZXNzXCIpfWZ1bmN0aW9uIHcoYSl7dmFyIGIsZixoLGk7Zm9yKGk9YS5sZW5ndGgsYj0wO2k+YjtiKyspaWYoZj1hW2JdLGZbY10pe2g9ZltlXXx8XCJlcnJvclwiO3ZhciBqPXt9O2oudmFyaWFibGVzPWZbZ118fHt9LGoudGl0bGU9ZltkXSxyKGZbY10saixoKX19ZnVuY3Rpb24geCgpe3JldHVybiBmfWZ1bmN0aW9uIHkoKXtyZXR1cm4gbX1mdW5jdGlvbiB6KCl7cmV0dXJuIGl9ZnVuY3Rpb24gQSgpe3JldHVybiBqfXZhciBCO3RyeXtCPXAoXCJ0cmFuc2xhdGVcIil9Y2F0Y2goQyl7fXJldHVybnt3YXJuaW5nOnMsZXJyb3I6dCxpbmZvOnUsc3VjY2Vzczp2LGFkZFNlcnZlck1lc3NhZ2VzOncsb25seVVuaXF1ZTp4LHJldmVyc2VPcmRlcjp5LGlubGluZU1lc3NhZ2VzOnoscG9zaXRpb246QX19XX0pOyIsIi8qKiFcbiAqIEFuZ3VsYXJKUyBmaWxlIHVwbG9hZCBzaGltIGZvciBIVE1MNSBGb3JtRGF0YVxuICogQGF1dGhvciAgRGFuaWFsICA8ZGFuaWFsLmZhcmlkQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDEuNi4xMlxuICovXG4oZnVuY3Rpb24oKSB7XG5cbnZhciBoYXNGbGFzaCA9IGZ1bmN0aW9uKCkge1xuXHR0cnkge1xuXHQgIHZhciBmbyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaCcpO1xuXHQgIGlmIChmbykgcmV0dXJuIHRydWU7XG5cdH0gY2F0Y2goZSkge1xuXHQgIGlmIChuYXZpZ2F0b3IubWltZVR5cGVzWydhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCddICE9IHVuZGVmaW5lZCkgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG52YXIgcGF0Y2hYSFIgPSBmdW5jdGlvbihmbk5hbWUsIG5ld0ZuKSB7XG5cdHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5wcm90b3R5cGVbZm5OYW1lXSA9IG5ld0ZuKHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5wcm90b3R5cGVbZm5OYW1lXSk7XG59O1xuXG5pZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7XG5cdGlmICh3aW5kb3cuRm9ybURhdGEgJiYgKCF3aW5kb3cuRmlsZUFQSSB8fCAhRmlsZUFQSS5mb3JjZUxvYWQpKSB7XG5cdFx0Ly8gYWxsb3cgYWNjZXNzIHRvIEFuZ3VsYXIgWEhSIHByaXZhdGUgZmllbGQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvaXNzdWVzLzE5MzRcblx0XHRwYXRjaFhIUignc2V0UmVxdWVzdEhlYWRlcicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihoZWFkZXIsIHZhbHVlKSB7XG5cdFx0XHRcdGlmIChoZWFkZXIgPT09ICdfX3NldFhIUl8nKSB7XG5cdFx0XHRcdFx0dmFyIHZhbCA9IHZhbHVlKHRoaXMpO1xuXHRcdFx0XHRcdC8vIGZpeCBmb3IgYW5ndWxhciA8IDEuMi4wXG5cdFx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHR2YWwodGhpcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBpbml0aWFsaXplVXBsb2FkTGlzdGVuZXIgPSBmdW5jdGlvbih4aHIpIHtcblx0XHRcdGlmICgheGhyLl9fbGlzdGVuZXJzKSB7XG5cdFx0XHRcdGlmICgheGhyLnVwbG9hZCkgeGhyLnVwbG9hZCA9IHt9O1xuXHRcdFx0XHR4aHIuX19saXN0ZW5lcnMgPSBbXTtcblx0XHRcdFx0dmFyIG9yaWdBZGRFdmVudExpc3RlbmVyID0geGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyO1xuXHRcdFx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0LCBmbiwgYikge1xuXHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1t0XSA9IGZuO1xuXHRcdFx0XHRcdG9yaWdBZGRFdmVudExpc3RlbmVyICYmIG9yaWdBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHBhdGNoWEhSKCdvcGVuJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKG0sIHVybCwgYikge1xuXHRcdFx0XHRpbml0aWFsaXplVXBsb2FkTGlzdGVuZXIodGhpcyk7XG5cdFx0XHRcdHRoaXMuX191cmwgPSB1cmw7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBbbSwgdXJsLCBiXSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRpZiAoZS5tZXNzYWdlLmluZGV4T2YoJ0FjY2VzcyBpcyBkZW5pZWQnKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIFttLCAnX2ZpeF9mb3JfaWVfY3Jvc3Nkb21haW5fXycsIGJdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdnZXRSZXNwb25zZUhlYWRlcicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihoKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5nZXRSZXNwb25zZUhlYWRlciA/IHRoaXMuX19maWxlQXBpWEhSLmdldFJlc3BvbnNlSGVhZGVyKGgpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMsIFtoXSkpO1xuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdnZXRBbGxSZXNwb25zZUhlYWRlcnMnLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5nZXRBbGxSZXNwb25zZUhlYWRlcnMgPyB0aGlzLl9fZmlsZUFwaVhIUi5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignYWJvcnQnLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5hYm9ydCA/IHRoaXMuX19maWxlQXBpWEhSLmFib3J0KCkgOiAob3JpZyA9PSBudWxsID8gbnVsbCA6IG9yaWcuYXBwbHkodGhpcykpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ3NldFJlcXVlc3RIZWFkZXInLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oaGVhZGVyLCB2YWx1ZSkge1xuXHRcdFx0XHRpZiAoaGVhZGVyID09PSAnX19zZXRYSFJfJykge1xuXHRcdFx0XHRcdGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lcih0aGlzKTtcblx0XHRcdFx0XHR2YXIgdmFsID0gdmFsdWUodGhpcyk7XG5cdFx0XHRcdFx0Ly8gZml4IGZvciBhbmd1bGFyIDwgMS4yLjBcblx0XHRcdFx0XHRpZiAodmFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdHZhbCh0aGlzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5fX3JlcXVlc3RIZWFkZXJzID0gdGhpcy5fX3JlcXVlc3RIZWFkZXJzIHx8IHt9O1xuXHRcdFx0XHRcdHRoaXMuX19yZXF1ZXN0SGVhZGVyc1toZWFkZXJdID0gdmFsdWU7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignc2VuZCcsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHhociA9IHRoaXM7XG5cdFx0XHRcdGlmIChhcmd1bWVudHNbMF0gJiYgYXJndW1lbnRzWzBdLl9faXNTaGltKSB7XG5cdFx0XHRcdFx0dmFyIGZvcm1EYXRhID0gYXJndW1lbnRzWzBdO1xuXHRcdFx0XHRcdHZhciBjb25maWcgPSB7XG5cdFx0XHRcdFx0XHR1cmw6IHhoci5fX3VybCxcblx0XHRcdFx0XHRcdGpzb25wOiBmYWxzZSwgLy9yZW1vdmVzIHRoZSBjYWxsYmFjayBmb3JtIHBhcmFtXG5cdFx0XHRcdFx0XHRjYWNoZTogdHJ1ZSwgLy9yZW1vdmVzIHRoZSA/ZmlsZWFwaVhYWCBpbiB0aGUgdXJsXG5cdFx0XHRcdFx0XHRjb21wbGV0ZTogZnVuY3Rpb24oZXJyLCBmaWxlQXBpWEhSKSB7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2NvbXBsZXRlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGlmICghZXJyICYmIHhoci5fX2xpc3RlbmVyc1snbG9hZCddKSBcblx0XHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ2xvYWQnXSh7dHlwZTogJ2xvYWQnLCBsb2FkZWQ6IHhoci5fX2xvYWRlZCwgdG90YWw6IHhoci5fX3RvdGFsLCB0YXJnZXQ6IHhociwgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoIWVyciAmJiB4aHIuX19saXN0ZW5lcnNbJ2xvYWRlbmQnXSkgXG5cdFx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydsb2FkZW5kJ10oe3R5cGU6ICdsb2FkZW5kJywgbG9hZGVkOiB4aHIuX19sb2FkZWQsIHRvdGFsOiB4aHIuX190b3RhbCwgdGFyZ2V0OiB4aHIsIGxlbmd0aENvbXB1dGFibGU6IHRydWV9KTtcblx0XHRcdFx0XHRcdFx0aWYgKGVyciA9PT0gJ2Fib3J0JyAmJiB4aHIuX19saXN0ZW5lcnNbJ2Fib3J0J10pIFxuXHRcdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1snYWJvcnQnXSh7dHlwZTogJ2Fib3J0JywgbG9hZGVkOiB4aHIuX19sb2FkZWQsIHRvdGFsOiB4aHIuX190b3RhbCwgdGFyZ2V0OiB4aHIsIGxlbmd0aENvbXB1dGFibGU6IHRydWV9KTtcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGVBcGlYSFIuc3RhdHVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdzdGF0dXMnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gKGZpbGVBcGlYSFIuc3RhdHVzID09IDAgJiYgZXJyICYmIGVyciAhPT0gJ2Fib3J0JykgPyA1MDAgOiBmaWxlQXBpWEhSLnN0YXR1c319KTtcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGVBcGlYSFIuc3RhdHVzVGV4dCAhPT0gdW5kZWZpbmVkKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAnc3RhdHVzVGV4dCcsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiBmaWxlQXBpWEhSLnN0YXR1c1RleHR9fSk7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZWFkeVN0YXRlJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIDR9fSk7XG5cdFx0XHRcdFx0XHRcdGlmIChmaWxlQXBpWEhSLnJlc3BvbnNlICE9PSB1bmRlZmluZWQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZXNwb25zZScsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiBmaWxlQXBpWEhSLnJlc3BvbnNlfX0pO1xuXHRcdFx0XHRcdFx0XHR2YXIgcmVzcCA9IGZpbGVBcGlYSFIucmVzcG9uc2VUZXh0IHx8IChlcnIgJiYgZmlsZUFwaVhIUi5zdGF0dXMgPT0gMCAmJiBlcnIgIT09ICdhYm9ydCcgPyBlcnIgOiB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVzcG9uc2VUZXh0Jywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIHJlc3B9fSk7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZXNwb25zZScsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiByZXNwfX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAnZXJyJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIGVycn19KTtcblx0XHRcdFx0XHRcdFx0eGhyLl9fZmlsZUFwaVhIUiA9IGZpbGVBcGlYSFI7XG5cdFx0XHRcdFx0XHRcdGlmICh4aHIub25yZWFkeXN0YXRlY2hhbmdlKSB4aHIub25yZWFkeXN0YXRlY2hhbmdlKCk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0ZmlsZXByb2dyZXNzOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XHRcdGUudGFyZ2V0ID0geGhyO1xuXHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ3Byb2dyZXNzJ10gJiYgeGhyLl9fbGlzdGVuZXJzWydwcm9ncmVzcyddKGUpO1xuXHRcdFx0XHRcdFx0XHR4aHIuX190b3RhbCA9IGUudG90YWw7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2xvYWRlZCA9IGUubG9hZGVkO1xuXHRcdFx0XHRcdFx0XHRpZiAoZS50b3RhbCA9PT0gZS5sb2FkZWQpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBmaXggZmxhc2ggaXNzdWUgdGhhdCBkb2Vzbid0IGNhbGwgY29tcGxldGUgaWYgdGhlcmUgaXMgbm8gcmVzcG9uc2UgdGV4dCBmcm9tIHRoZSBzZXJ2ZXIgIFxuXHRcdFx0XHRcdFx0XHRcdHZhciBfdGhpcyA9IHRoaXNcblx0XHRcdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCF4aHIuX19jb21wbGV0ZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0eGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycyA9IGZ1bmN0aW9uKCl7fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0X3RoaXMuY29tcGxldGUobnVsbCwge3N0YXR1czogMjA0LCBzdGF0dXNUZXh0OiAnTm8gQ29udGVudCd9KTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9LCAxMDAwMCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRoZWFkZXJzOiB4aHIuX19yZXF1ZXN0SGVhZGVyc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25maWcuZGF0YSA9IHt9O1xuXHRcdFx0XHRcdGNvbmZpZy5maWxlcyA9IHt9XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmb3JtRGF0YS5kYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgaXRlbSA9IGZvcm1EYXRhLmRhdGFbaV07XG5cdFx0XHRcdFx0XHRpZiAoaXRlbS52YWwgIT0gbnVsbCAmJiBpdGVtLnZhbC5uYW1lICE9IG51bGwgJiYgaXRlbS52YWwuc2l6ZSAhPSBudWxsICYmIGl0ZW0udmFsLnR5cGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRjb25maWcuZmlsZXNbaXRlbS5rZXldID0gaXRlbS52YWw7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb25maWcuZGF0YVtpdGVtLmtleV0gPSBpdGVtLnZhbDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFoYXNGbGFzaCgpKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93ICdBZG9kZSBGbGFzaCBQbGF5ZXIgbmVlZCB0byBiZSBpbnN0YWxsZWQuIFRvIGNoZWNrIGFoZWFkIHVzZSBcIkZpbGVBUEkuaGFzRmxhc2hcIic7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR4aHIuX19maWxlQXBpWEhSID0gRmlsZUFQSS51cGxvYWQoY29uZmlnKTtcblx0XHRcdFx0XHR9LCAxKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHhociwgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5fX2lzU2hpbSA9IHRydWU7XG59XG5cbmlmICghd2luZG93LkZvcm1EYXRhIHx8ICh3aW5kb3cuRmlsZUFQSSAmJiBGaWxlQVBJLmZvcmNlTG9hZCkpIHtcblx0dmFyIGFkZEZsYXNoID0gZnVuY3Rpb24oZWxlbSkge1xuXHRcdGlmICghaGFzRmxhc2goKSkge1xuXHRcdFx0dGhyb3cgJ0Fkb2RlIEZsYXNoIFBsYXllciBuZWVkIHRvIGJlIGluc3RhbGxlZC4gVG8gY2hlY2sgYWhlYWQgdXNlIFwiRmlsZUFQSS5oYXNGbGFzaFwiJztcblx0XHR9XG5cdFx0dmFyIGVsID0gYW5ndWxhci5lbGVtZW50KGVsZW0pO1xuXHRcdGlmICghZWwuYXR0cignZGlzYWJsZWQnKSkge1xuXHRcdFx0aWYgKCFlbC5oYXNDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJykgJiYgKGVsZW0uZ2V0QXR0cmlidXRlKCduZy1maWxlLXNlbGVjdCcpICE9IG51bGwgfHwgZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmctZmlsZS1zZWxlY3QnKSAhPSBudWxsKSkge1xuXHRcdFx0XHRpZiAoRmlsZUFQSS53cmFwSW5zaWRlRGl2KSB7XG5cdFx0XHRcdFx0dmFyIHdyYXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0XHR3cmFwLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwianMtZmlsZWFwaS13cmFwcGVyXCIgc3R5bGU9XCJwb3NpdGlvbjpyZWxhdGl2ZTsgb3ZlcmZsb3c6aGlkZGVuXCI+PC9kaXY+Jztcblx0XHRcdFx0XHR3cmFwID0gd3JhcC5maXJzdENoaWxkO1xuXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cdFx0XHRcdFx0cGFyZW50Lmluc2VydEJlZm9yZSh3cmFwLCBlbGVtKTtcblx0XHRcdFx0XHRwYXJlbnQucmVtb3ZlQ2hpbGQoZWxlbSk7XG5cdFx0XHRcdFx0d3JhcC5hcHBlbmRDaGlsZChlbGVtKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlbC5hZGRDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJyk7XG5cdFx0XHRcdFx0aWYgKGVsLnBhcmVudCgpWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8pIHtcblx0XHRcdFx0XHRcdGlmIChlbC5wYXJlbnQoKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICcnIHx8IGVsLnBhcmVudCgpLmNzcygncG9zaXRpb24nKSA9PT0gJ3N0YXRpYycpIHtcblx0XHRcdFx0XHRcdFx0ZWwucGFyZW50KCkuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWwuY3NzKCd0b3AnLCAwKS5jc3MoJ2JvdHRvbScsIDApLmNzcygnbGVmdCcsIDApLmNzcygncmlnaHQnLCAwKS5jc3MoJ3dpZHRoJywgJzEwMCUnKS5jc3MoJ2hlaWdodCcsICcxMDAlJykuXG5cdFx0XHRcdFx0XHRcdGNzcygncGFkZGluZycsIDApLmNzcygnbWFyZ2luJywgMCk7XG5cdFx0XHRcdFx0XHRlbC5wYXJlbnQoKS51bmJpbmQoJ2NsaWNrJywgZWwucGFyZW50KClbMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHR2YXIgY2hhbmdlRm5XcmFwcGVyID0gZnVuY3Rpb24oZm4pIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgZmlsZXMgPSBGaWxlQVBJLmdldEZpbGVzKGV2dCk7XG5cdFx0XHQvL2p1c3QgYSBkb3VibGUgY2hlY2sgZm9yICMyMzNcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGZpbGVzW2ldLnNpemUgPT09IHVuZGVmaW5lZCkgZmlsZXNbaV0uc2l6ZSA9IDA7XG5cdFx0XHRcdGlmIChmaWxlc1tpXS5uYW1lID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLm5hbWUgPSAnZmlsZSc7XG5cdFx0XHRcdGlmIChmaWxlc1tpXS50eXBlID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLnR5cGUgPSAndW5kZWZpbmVkJztcblx0XHRcdH1cblx0XHRcdGlmICghZXZ0LnRhcmdldCkge1xuXHRcdFx0XHRldnQudGFyZ2V0ID0ge307XG5cdFx0XHR9XG5cdFx0XHRldnQudGFyZ2V0LmZpbGVzID0gZmlsZXM7XG5cdFx0XHQvLyBpZiBldnQudGFyZ2V0LmZpbGVzIGlzIG5vdCB3cml0YWJsZSB1c2UgaGVscGVyIGZpZWxkXG5cdFx0XHRpZiAoZXZ0LnRhcmdldC5maWxlcyAhPSBmaWxlcykge1xuXHRcdFx0XHRldnQuX19maWxlc18gPSBmaWxlcztcblx0XHRcdH1cblx0XHRcdChldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcykuaXRlbSA9IGZ1bmN0aW9uKGkpIHtcblx0XHRcdFx0cmV0dXJuIChldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcylbaV0gfHwgbnVsbDtcblx0XHRcdH1cblx0XHRcdGlmIChmbikgZm4uYXBwbHkodGhpcywgW2V2dF0pO1xuXHRcdH07XG5cdH07XG5cdHZhciBpc0ZpbGVDaGFuZ2UgPSBmdW5jdGlvbihlbGVtLCBlKSB7XG5cdFx0cmV0dXJuIChlLnRvTG93ZXJDYXNlKCkgPT09ICdjaGFuZ2UnIHx8IGUudG9Mb3dlckNhc2UoKSA9PT0gJ29uY2hhbmdlJykgJiYgZWxlbS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSA9PSAnZmlsZSc7XG5cdH1cblx0aWYgKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIpIHtcblx0XHRIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gKGZ1bmN0aW9uKG9yaWdBZGRFdmVudExpc3RlbmVyKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oZSwgZm4sIGIsIGQpIHtcblx0XHRcdFx0aWYgKGlzRmlsZUNoYW5nZSh0aGlzLCBlKSkge1xuXHRcdFx0XHRcdGFkZEZsYXNoKHRoaXMpO1xuXHRcdFx0XHRcdG9yaWdBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIFtlLCBjaGFuZ2VGbldyYXBwZXIoZm4pLCBiLCBkXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZ0FkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgW2UsIGZuLCBiLCBkXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KShIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyKTtcblx0fVxuXHRpZiAoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYXR0YWNoRXZlbnQpIHtcblx0XHRIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hdHRhY2hFdmVudCA9IChmdW5jdGlvbihvcmlnQXR0YWNoRXZlbnQpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihlLCBmbikge1xuXHRcdFx0XHRpZiAoaXNGaWxlQ2hhbmdlKHRoaXMsIGUpKSB7XG5cdFx0XHRcdFx0YWRkRmxhc2godGhpcyk7XG5cdFx0XHRcdFx0aWYgKHdpbmRvdy5qUXVlcnkpIHtcblx0XHRcdFx0XHRcdC8vIGZpeCBmb3IgIzI4MSBqUXVlcnkgb24gSUU4XG5cdFx0XHRcdFx0XHRhbmd1bGFyLmVsZW1lbnQodGhpcykuYmluZCgnY2hhbmdlJywgY2hhbmdlRm5XcmFwcGVyKG51bGwpKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b3JpZ0F0dGFjaEV2ZW50LmFwcGx5KHRoaXMsIFtlLCBjaGFuZ2VGbldyYXBwZXIoZm4pXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWdBdHRhY2hFdmVudC5hcHBseSh0aGlzLCBbZSwgZm5dKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmF0dGFjaEV2ZW50KTtcblx0fVxuXG5cdHdpbmRvdy5Gb3JtRGF0YSA9IEZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGFwcGVuZDogZnVuY3Rpb24oa2V5LCB2YWwsIG5hbWUpIHtcblx0XHRcdFx0dGhpcy5kYXRhLnB1c2goe1xuXHRcdFx0XHRcdGtleToga2V5LFxuXHRcdFx0XHRcdHZhbDogdmFsLFxuXHRcdFx0XHRcdG5hbWU6IG5hbWVcblx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0ZGF0YTogW10sXG5cdFx0XHRfX2lzU2hpbTogdHJ1ZVxuXHRcdH07XG5cdH07XG5cblx0KGZ1bmN0aW9uICgpIHtcblx0XHQvL2xvYWQgRmlsZUFQSVxuXHRcdGlmICghd2luZG93LkZpbGVBUEkpIHtcblx0XHRcdHdpbmRvdy5GaWxlQVBJID0ge307XG5cdFx0fVxuXHRcdGlmIChGaWxlQVBJLmZvcmNlTG9hZCkge1xuXHRcdFx0RmlsZUFQSS5odG1sNSA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIUZpbGVBUEkudXBsb2FkKSB7XG5cdFx0XHR2YXIganNVcmwsIGJhc2VQYXRoLCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSwgYWxsU2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSwgaSwgaW5kZXgsIHNyYztcblx0XHRcdGlmICh3aW5kb3cuRmlsZUFQSS5qc1VybCkge1xuXHRcdFx0XHRqc1VybCA9IHdpbmRvdy5GaWxlQVBJLmpzVXJsO1xuXHRcdFx0fSBlbHNlIGlmICh3aW5kb3cuRmlsZUFQSS5qc1BhdGgpIHtcblx0XHRcdFx0YmFzZVBhdGggPSB3aW5kb3cuRmlsZUFQSS5qc1BhdGg7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgYWxsU2NyaXB0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHNyYyA9IGFsbFNjcmlwdHNbaV0uc3JjO1xuXHRcdFx0XHRcdGluZGV4ID0gc3JjLmluZGV4T2YoJ2FuZ3VsYXItZmlsZS11cGxvYWQtc2hpbS5qcycpXG5cdFx0XHRcdFx0aWYgKGluZGV4ID09IC0xKSB7XG5cdFx0XHRcdFx0XHRpbmRleCA9IHNyYy5pbmRleE9mKCdhbmd1bGFyLWZpbGUtdXBsb2FkLXNoaW0ubWluLmpzJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRcdFx0XHRiYXNlUGF0aCA9IHNyYy5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChGaWxlQVBJLnN0YXRpY1BhdGggPT0gbnVsbCkgRmlsZUFQSS5zdGF0aWNQYXRoID0gYmFzZVBhdGg7XG5cdFx0XHRzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBqc1VybCB8fCBiYXNlUGF0aCArICdGaWxlQVBJLm1pbi5qcycpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuXHRcdFx0RmlsZUFQSS5oYXNGbGFzaCA9IGhhc0ZsYXNoKCk7XG5cdFx0fVxuXHR9KSgpO1xuXHRGaWxlQVBJLmRpc2FibGVGaWxlSW5wdXQgPSBmdW5jdGlvbihlbGVtLCBkaXNhYmxlKSB7XG5cdFx0aWYgKGRpc2FibGUpIHtcblx0XHRcdGVsZW0ucmVtb3ZlQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGVsZW0uYWRkQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpO1xuXHRcdH1cblx0fVxufVxuXG5cbmlmICghd2luZG93LkZpbGVSZWFkZXIpIHtcblx0d2luZG93LkZpbGVSZWFkZXIgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzLCBsb2FkU3RhcnRlZCA9IGZhbHNlO1xuXHRcdHRoaXMubGlzdGVuZXJzID0ge307XG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgZm4pIHtcblx0XHRcdF90aGlzLmxpc3RlbmVyc1t0eXBlXSA9IF90aGlzLmxpc3RlbmVyc1t0eXBlXSB8fCBbXTtcblx0XHRcdF90aGlzLmxpc3RlbmVyc1t0eXBlXS5wdXNoKGZuKTtcblx0XHR9O1xuXHRcdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGZuKSB7XG5cdFx0XHRfdGhpcy5saXN0ZW5lcnNbdHlwZV0gJiYgX3RoaXMubGlzdGVuZXJzW3R5cGVdLnNwbGljZShfdGhpcy5saXN0ZW5lcnNbdHlwZV0uaW5kZXhPZihmbiksIDEpO1xuXHRcdH07XG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgbGlzdCA9IF90aGlzLmxpc3RlbmVyc1tldnQudHlwZV07XG5cdFx0XHRpZiAobGlzdCkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRsaXN0W2ldLmNhbGwoX3RoaXMsIGV2dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMub25hYm9ydCA9IHRoaXMub25lcnJvciA9IHRoaXMub25sb2FkID0gdGhpcy5vbmxvYWRzdGFydCA9IHRoaXMub25sb2FkZW5kID0gdGhpcy5vbnByb2dyZXNzID0gbnVsbDtcblxuXHRcdHZhciBjb25zdHJ1Y3RFdmVudCA9IGZ1bmN0aW9uKHR5cGUsIGV2dCkge1xuXHRcdFx0dmFyIGUgPSB7dHlwZTogdHlwZSwgdGFyZ2V0OiBfdGhpcywgbG9hZGVkOiBldnQubG9hZGVkLCB0b3RhbDogZXZ0LnRvdGFsLCBlcnJvcjogZXZ0LmVycm9yfTtcblx0XHRcdGlmIChldnQucmVzdWx0ICE9IG51bGwpIGUudGFyZ2V0LnJlc3VsdCA9IGV2dC5yZXN1bHQ7XG5cdFx0XHRyZXR1cm4gZTtcblx0XHR9O1xuXHRcdHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0aWYgKCFsb2FkU3RhcnRlZCkge1xuXHRcdFx0XHRsb2FkU3RhcnRlZCA9IHRydWU7XG5cdFx0XHRcdF90aGlzLm9ubG9hZHN0YXJ0ICYmIHRoaXMub25sb2Fkc3RhcnQoY29uc3RydWN0RXZlbnQoJ2xvYWRzdGFydCcsIGV2dCkpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGV2dC50eXBlID09PSAnbG9hZCcpIHtcblx0XHRcdFx0X3RoaXMub25sb2FkZW5kICYmIF90aGlzLm9ubG9hZGVuZChjb25zdHJ1Y3RFdmVudCgnbG9hZGVuZCcsIGV2dCkpO1xuXHRcdFx0XHR2YXIgZSA9IGNvbnN0cnVjdEV2ZW50KCdsb2FkJywgZXZ0KTtcblx0XHRcdFx0X3RoaXMub25sb2FkICYmIF90aGlzLm9ubG9hZChlKTtcblx0XHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcblx0XHRcdH0gZWxzZSBpZiAoZXZ0LnR5cGUgPT09ICdwcm9ncmVzcycpIHtcblx0XHRcdFx0dmFyIGUgPSBjb25zdHJ1Y3RFdmVudCgncHJvZ3Jlc3MnLCBldnQpO1xuXHRcdFx0XHRfdGhpcy5vbnByb2dyZXNzICYmIF90aGlzLm9ucHJvZ3Jlc3MoZSk7XG5cdFx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgZSA9IGNvbnN0cnVjdEV2ZW50KCdlcnJvcicsIGV2dCk7XG5cdFx0XHRcdF90aGlzLm9uZXJyb3IgJiYgX3RoaXMub25lcnJvcihlKTtcblx0XHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMucmVhZEFzQXJyYXlCdWZmZXIgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc0JpbmFyeVN0cmluZyhmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHRcdHRoaXMucmVhZEFzQmluYXJ5U3RyaW5nID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNCaW5hcnlTdHJpbmcoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0XHR0aGlzLnJlYWRBc0RhdGFVUkwgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc0RhdGFVUkwoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0XHR0aGlzLnJlYWRBc1RleHQgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc1RleHQoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0fVxufVxuXG59KSgpO1xuIiwiLyoqIVxuICogQW5ndWxhckpTIGZpbGUgdXBsb2FkL2Ryb3AgZGlyZWN0aXZlIHdpdGggaHR0cCBwb3N0IGFuZCBwcm9ncmVzc1xuICogQGF1dGhvciAgRGFuaWFsICA8ZGFuaWFsLmZhcmlkQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDEuNi4xMlxuICovXG4oZnVuY3Rpb24oKSB7XG5cbnZhciBhbmd1bGFyRmlsZVVwbG9hZCA9IGFuZ3VsYXIubW9kdWxlKCdhbmd1bGFyRmlsZVVwbG9hZCcsIFtdKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuc2VydmljZSgnJHVwbG9hZCcsIFsnJGh0dHAnLCAnJHEnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkaHR0cCwgJHEsICR0aW1lb3V0KSB7XG5cdGZ1bmN0aW9uIHNlbmRIdHRwKGNvbmZpZykge1xuXHRcdGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kIHx8ICdQT1NUJztcblx0XHRjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXHRcdGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID0gY29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgfHwgZnVuY3Rpb24oZGF0YSwgaGVhZGVyc0dldHRlcikge1xuXHRcdFx0aWYgKHdpbmRvdy5BcnJheUJ1ZmZlciAmJiBkYXRhIGluc3RhbmNlb2Ygd2luZG93LkFycmF5QnVmZmVyKSB7XG5cdFx0XHRcdHJldHVybiBkYXRhO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuICRodHRwLmRlZmF1bHRzLnRyYW5zZm9ybVJlcXVlc3RbMF0oZGF0YSwgaGVhZGVyc0dldHRlcik7XG5cdFx0fTtcblx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG5cdFx0aWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5fX2lzU2hpbSkge1xuXHRcdFx0Y29uZmlnLmhlYWRlcnNbJ19fc2V0WEhSXyddID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbih4aHIpIHtcblx0XHRcdFx0XHRpZiAoIXhocikgcmV0dXJuO1xuXHRcdFx0XHRcdGNvbmZpZy5fX1hIUiA9IHhocjtcblx0XHRcdFx0XHRjb25maWcueGhyRm4gJiYgY29uZmlnLnhockZuKHhocik7XG5cdFx0XHRcdFx0eGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdGRlZmVycmVkLm5vdGlmeShlKTtcblx0XHRcdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRcdFx0Ly9maXggZm9yIGZpcmVmb3ggbm90IGZpcmluZyB1cGxvYWQgcHJvZ3Jlc3MgZW5kLCBhbHNvIElFOC05XG5cdFx0XHRcdFx0eGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFx0aWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xuXHRcdFx0XHRcdFx0XHRkZWZlcnJlZC5ub3RpZnkoZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQkaHR0cChjb25maWcpLnRoZW4oZnVuY3Rpb24ocil7ZGVmZXJyZWQucmVzb2x2ZShyKX0sIGZ1bmN0aW9uKGUpe2RlZmVycmVkLnJlamVjdChlKX0sIGZ1bmN0aW9uKG4pe2RlZmVycmVkLm5vdGlmeShuKX0pO1xuXHRcdFxuXHRcdHZhciBwcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZTtcblx0XHRwcm9taXNlLnN1Y2Nlc3MgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0cHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGZuKHJlc3BvbnNlLmRhdGEsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2UuaGVhZGVycywgY29uZmlnKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblxuXHRcdHByb21pc2UuZXJyb3IgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0cHJvbWlzZS50aGVuKG51bGwsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGZuKHJlc3BvbnNlLmRhdGEsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2UuaGVhZGVycywgY29uZmlnKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblxuXHRcdHByb21pc2UucHJvZ3Jlc3MgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0cHJvbWlzZS50aGVuKG51bGwsIG51bGwsIGZ1bmN0aW9uKHVwZGF0ZSkge1xuXHRcdFx0XHRmbih1cGRhdGUpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXHRcdHByb21pc2UuYWJvcnQgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmIChjb25maWcuX19YSFIpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Y29uZmlnLl9fWEhSLmFib3J0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblx0XHRwcm9taXNlLnhociA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRjb25maWcueGhyRm4gPSAoZnVuY3Rpb24ob3JpZ1hockZuKSB7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRvcmlnWGhyRm4gJiYgb3JpZ1hockZuLmFwcGx5KHByb21pc2UsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdFx0Zm4uYXBwbHkocHJvbWlzZSwgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkoY29uZmlnLnhockZuKTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cdFx0XG5cdFx0cmV0dXJuIHByb21pc2U7XG5cdH1cblxuXHR0aGlzLnVwbG9hZCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cdFx0Y29uZmlnLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdW5kZWZpbmVkO1xuXHRcdGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID0gY29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgfHwgJGh0dHAuZGVmYXVsdHMudHJhbnNmb3JtUmVxdWVzdDtcblx0XHR2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHR2YXIgb3JpZ1RyYW5zZm9ybVJlcXVlc3QgPSBjb25maWcudHJhbnNmb3JtUmVxdWVzdDtcblx0XHR2YXIgb3JpZ0RhdGEgPSBjb25maWcuZGF0YTtcblx0XHRjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGZ1bmN0aW9uKGZvcm1EYXRhLCBoZWFkZXJHZXR0ZXIpIHtcblx0XHRcdGlmIChvcmlnRGF0YSkge1xuXHRcdFx0XHRpZiAoY29uZmlnLmZvcm1EYXRhQXBwZW5kZXIpIHtcblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gb3JpZ0RhdGEpIHtcblx0XHRcdFx0XHRcdHZhciB2YWwgPSBvcmlnRGF0YVtrZXldO1xuXHRcdFx0XHRcdFx0Y29uZmlnLmZvcm1EYXRhQXBwZW5kZXIoZm9ybURhdGEsIGtleSwgdmFsKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9yaWdEYXRhKSB7XG5cdFx0XHRcdFx0XHR2YXIgdmFsID0gb3JpZ0RhdGFba2V5XTtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3JpZ1RyYW5zZm9ybVJlcXVlc3QgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHR2YWwgPSBvcmlnVHJhbnNmb3JtUmVxdWVzdCh2YWwsIGhlYWRlckdldHRlcik7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9yaWdUcmFuc2Zvcm1SZXF1ZXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRyYW5zZm9ybUZuID0gb3JpZ1RyYW5zZm9ybVJlcXVlc3RbaV07XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiB0cmFuc2Zvcm1GbiA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YWwgPSB0cmFuc2Zvcm1Gbih2YWwsIGhlYWRlckdldHRlcik7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRmb3JtRGF0YS5hcHBlbmQoa2V5LCB2YWwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29uZmlnLmZpbGUgIT0gbnVsbCkge1xuXHRcdFx0XHR2YXIgZmlsZUZvcm1OYW1lID0gY29uZmlnLmZpbGVGb3JtRGF0YU5hbWUgfHwgJ2ZpbGUnO1xuXG5cdFx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoY29uZmlnLmZpbGUpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG5cdFx0XHRcdFx0dmFyIGlzRmlsZUZvcm1OYW1lU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGZpbGVGb3JtTmFtZSkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY29uZmlnLmZpbGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChpc0ZpbGVGb3JtTmFtZVN0cmluZyA/IGZpbGVGb3JtTmFtZSA6IGZpbGVGb3JtTmFtZVtpXSwgY29uZmlnLmZpbGVbaV0sIFxuXHRcdFx0XHRcdFx0XHRcdChjb25maWcuZmlsZU5hbWUgJiYgY29uZmlnLmZpbGVOYW1lW2ldKSB8fCBjb25maWcuZmlsZVtpXS5uYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGZpbGVGb3JtTmFtZSwgY29uZmlnLmZpbGUsIGNvbmZpZy5maWxlTmFtZSB8fCBjb25maWcuZmlsZS5uYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZvcm1EYXRhO1xuXHRcdH07XG5cblx0XHRjb25maWcuZGF0YSA9IGZvcm1EYXRhO1xuXG5cdFx0cmV0dXJuIHNlbmRIdHRwKGNvbmZpZyk7XG5cdH07XG5cblx0dGhpcy5odHRwID0gZnVuY3Rpb24oY29uZmlnKSB7XG5cdFx0cmV0dXJuIHNlbmRIdHRwKGNvbmZpZyk7XG5cdH1cbn1dKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ0ZpbGVTZWxlY3QnLCBbICckcGFyc2UnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkcGFyc2UsICR0aW1lb3V0KSB7XG5cdHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cikge1xuXHRcdHZhciBmbiA9ICRwYXJzZShhdHRyWyduZ0ZpbGVTZWxlY3QnXSk7XG5cdFx0aWYgKGVsZW1bMF0udGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnaW5wdXQnIHx8IChlbGVtLmF0dHIoJ3R5cGUnKSAmJiBlbGVtLmF0dHIoJ3R5cGUnKS50b0xvd2VyQ2FzZSgpKSAhPT0gJ2ZpbGUnKSB7XG5cdFx0XHR2YXIgZmlsZUVsZW0gPSBhbmd1bGFyLmVsZW1lbnQoJzxpbnB1dCB0eXBlPVwiZmlsZVwiPicpXG5cdFx0XHR2YXIgYXR0cnMgPSBlbGVtWzBdLmF0dHJpYnV0ZXM7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChhdHRyc1tpXS5uYW1lLnRvTG93ZXJDYXNlKCkgIT09ICd0eXBlJykge1xuXHRcdFx0XHRcdGZpbGVFbGVtLmF0dHIoYXR0cnNbaV0ubmFtZSwgYXR0cnNbaV0udmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoYXR0cltcIm11bHRpcGxlXCJdKSBmaWxlRWxlbS5hdHRyKFwibXVsdGlwbGVcIiwgXCJ0cnVlXCIpO1xuXHRcdFx0ZmlsZUVsZW0uY3NzKFwid2lkdGhcIiwgXCIxcHhcIikuY3NzKFwiaGVpZ2h0XCIsIFwiMXB4XCIpLmNzcyhcIm9wYWNpdHlcIiwgMCkuY3NzKFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiKS5jc3MoJ2ZpbHRlcicsICdhbHBoYShvcGFjaXR5PTApJylcblx0XHRcdFx0XHQuY3NzKFwicGFkZGluZ1wiLCAwKS5jc3MoXCJtYXJnaW5cIiwgMCkuY3NzKFwib3ZlcmZsb3dcIiwgXCJoaWRkZW5cIik7XG5cdFx0XHRmaWxlRWxlbS5hdHRyKCdfX3dyYXBwZXJfZm9yX3BhcmVudF8nLCB0cnVlKTtcblxuLy9cdFx0XHRmaWxlRWxlbS5jc3MoXCJ0b3BcIiwgMCkuY3NzKFwiYm90dG9tXCIsIDApLmNzcyhcImxlZnRcIiwgMCkuY3NzKFwicmlnaHRcIiwgMCkuY3NzKFwid2lkdGhcIiwgXCIxMDAlXCIpLlxuLy9cdFx0XHRcdFx0Y3NzKFwib3BhY2l0eVwiLCAwKS5jc3MoXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIpLmNzcygnZmlsdGVyJywgJ2FscGhhKG9wYWNpdHk9MCknKS5jc3MoXCJwYWRkaW5nXCIsIDApLmNzcyhcIm1hcmdpblwiLCAwKTtcblx0XHRcdGVsZW0uYXBwZW5kKGZpbGVFbGVtKTtcblx0XHRcdGVsZW1bMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXyAgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0ZmlsZUVsZW1bMF0uY2xpY2soKTtcblx0XHRcdH07IFxuXHRcdFx0ZWxlbS5iaW5kKCdjbGljaycsIGVsZW1bMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXyk7XG5cdFx0XHRlbGVtLmNzcyhcIm92ZXJmbG93XCIsIFwiaGlkZGVuXCIpO1xuLy9cdFx0XHRpZiAoZmlsZUVsZW0ucGFyZW50KClbMF0gIT0gZWxlbVswXSkge1xuLy9cdFx0XHRcdC8vZml4ICMyOTggYnV0dG9uIGVsZW1lbnRcbi8vXHRcdFx0XHRlbGVtLndyYXAoJzxzcGFuPicpO1xuLy9cdFx0XHRcdGVsZW0uY3NzKFwiei1pbmRleFwiLCBcIi0xMDAwXCIpXG4vL1x0XHRcdFx0ZWxlbS5wYXJlbnQoKS5hcHBlbmQoZmlsZUVsZW0pO1xuLy9cdFx0XHRcdGVsZW0gPSBlbGVtLnBhcmVudCgpO1xuLy9cdFx0XHR9XG4vL1x0XHRcdGlmIChlbGVtLmNzcyhcInBvc2l0aW9uXCIpID09PSAnJyB8fCBlbGVtLmNzcyhcInBvc2l0aW9uXCIpID09PSAnc3RhdGljJykge1xuLy9cdFx0XHRcdGVsZW0uY3NzKFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiKTtcbi8vXHRcdFx0fVxuXHRcdFx0ZWxlbSA9IGZpbGVFbGVtO1xuXHRcdH1cblx0XHRlbGVtLmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIGZpbGVzID0gW10sIGZpbGVMaXN0LCBpO1xuXHRcdFx0ZmlsZUxpc3QgPSBldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcztcblx0XHRcdGlmIChmaWxlTGlzdCAhPSBudWxsKSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBmaWxlTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGZpbGVzLnB1c2goZmlsZUxpc3QuaXRlbShpKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmbihzY29wZSwge1xuXHRcdFx0XHRcdCRmaWxlcyA6IGZpbGVzLFxuXHRcdFx0XHRcdCRldmVudCA6IGV2dFxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdC8vIHJlbW92ZWQgdGhpcyBzaW5jZSBpdCB3YXMgY29uZnVzaW5nIGlmIHRoZSB1c2VyIGNsaWNrIG9uIGJyb3dzZSBhbmQgdGhlbiBjYW5jZWwgIzE4MVxuLy9cdFx0ZWxlbS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4vL1x0XHRcdHRoaXMudmFsdWUgPSBudWxsO1xuLy9cdFx0fSk7XG5cblx0XHQvLyByZW1vdmVkIGJlY2F1c2Ugb2YgIzI1MyBidWdcblx0XHQvLyB0b3VjaCBzY3JlZW5zXG4vL1x0XHRpZiAoKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykgfHxcbi8vXHRcdFx0XHQobmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMCkgfHwgKG5hdmlnYXRvci5tc01heFRvdWNoUG9pbnRzID4gMCkpIHtcbi8vXHRcdFx0ZWxlbS5iaW5kKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpIHtcbi8vXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG4vL1x0XHRcdFx0ZS50YXJnZXQuY2xpY2soKTtcbi8vXHRcdFx0fSk7XG4vL1x0XHR9XG5cdH07XG59IF0pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nRmlsZURyb3BBdmFpbGFibGUnLCBbICckcGFyc2UnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkcGFyc2UsICR0aW1lb3V0KSB7XG5cdHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cikge1xuXHRcdGlmICgnZHJhZ2dhYmxlJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJykpIHtcblx0XHRcdHZhciBmbiA9ICRwYXJzZShhdHRyWyduZ0ZpbGVEcm9wQXZhaWxhYmxlJ10pO1xuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZuKHNjb3BlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0gXSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdGaWxlRHJvcCcsIFsgJyRwYXJzZScsICckdGltZW91dCcsICckbG9jYXRpb24nLCBmdW5jdGlvbigkcGFyc2UsICR0aW1lb3V0LCAkbG9jYXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRyKSB7XG5cdFx0aWYgKCdkcmFnZ2FibGUnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSkge1xuXHRcdFx0dmFyIGxlYXZlVGltZW91dCA9IG51bGw7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdCR0aW1lb3V0LmNhbmNlbChsZWF2ZVRpbWVvdXQpO1xuXHRcdFx0XHRpZiAoIWVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKSB7XG5cdFx0XHRcdFx0aWYgKGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXSAmJiBhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10uc2VhcmNoKC9cXCkgKiQvKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHR2YXIgZHJhZ092ZXJDbGFzcyA9ICRwYXJzZShhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10pKHNjb3BlLCB7XG5cdFx0XHRcdFx0XHRcdCRldmVudCA6IGV2dFxuXHRcdFx0XHRcdFx0fSk7XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBkcmFnT3ZlckNsYXNzOyBcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10gfHwgXCJkcmFnb3ZlclwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbGVtLmFkZENsYXNzKGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGxlYXZlVGltZW91dCA9ICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGVsZW0ucmVtb3ZlQ2xhc3MoZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pO1xuXHRcdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gbnVsbDtcblx0XHRcdFx0fSwgYXR0clsnbmdGaWxlRHJhZ092ZXJEZWxheSddIHx8IDEpO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0dmFyIGZuID0gJHBhcnNlKGF0dHJbJ25nRmlsZURyb3AnXSk7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0ZWxlbS5yZW1vdmVDbGFzcyhlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyk7XG5cdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gbnVsbDtcblx0XHRcdFx0ZXh0cmFjdEZpbGVzKGV2dCwgZnVuY3Rpb24oZmlsZXMpIHtcblx0XHRcdFx0XHRmbihzY29wZSwge1xuXHRcdFx0XHRcdFx0JGZpbGVzIDogZmlsZXMsXG5cdFx0XHRcdFx0XHQkZXZlbnQgOiBldnRcblx0XHRcdFx0XHR9KTtcdFx0XHRcdFx0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRmdW5jdGlvbiBpc0FTQ0lJKHN0cikge1xuXHRcdFx0XHRyZXR1cm4gL15bXFwwMDAtXFwxNzddKiQvLnRlc3Qoc3RyKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gZXh0cmFjdEZpbGVzKGV2dCwgY2FsbGJhY2spIHtcblx0XHRcdFx0dmFyIGZpbGVzID0gW10sIGl0ZW1zID0gZXZ0LmRhdGFUcmFuc2Zlci5pdGVtcztcblx0XHRcdFx0aWYgKGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCA+IDAgJiYgaXRlbXNbMF0ud2Via2l0R2V0QXNFbnRyeSAmJiAkbG9jYXRpb24ucHJvdG9jb2woKSAhPSAnZmlsZScgJiYgXG5cdFx0XHRcdFx0XHRpdGVtc1swXS53ZWJraXRHZXRBc0VudHJ5KCkuaXNEaXJlY3RvcnkpIHtcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgZW50cnkgPSBpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5KCk7XG5cdFx0XHRcdFx0XHRpZiAoZW50cnkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHQvL2ZpeCBmb3IgY2hyb21lIGJ1ZyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTQ5NzM1XG5cdFx0XHRcdFx0XHRcdGlmIChpc0FTQ0lJKGVudHJ5Lm5hbWUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0dHJhdmVyc2VGaWxlVHJlZShmaWxlcywgZW50cnkpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCFpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5KCkuaXNEaXJlY3RvcnkpIHtcblx0XHRcdFx0XHRcdFx0XHRmaWxlcy5wdXNoKGl0ZW1zW2ldLmdldEFzRmlsZSgpKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YXIgZmlsZUxpc3QgPSBldnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHRcdFx0XHRcdGlmIChmaWxlTGlzdCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdGZpbGVzLnB1c2goZmlsZUxpc3QuaXRlbShpKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdChmdW5jdGlvbiB3YWl0Rm9yUHJvY2VzcyhkZWxheSkge1xuXHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFwcm9jZXNzaW5nKSB7XG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrKGZpbGVzKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHdhaXRGb3JQcm9jZXNzKDEwKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCBkZWxheSB8fCAwKVxuXHRcdFx0XHR9KSgpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR2YXIgcHJvY2Vzc2luZyA9IDA7XG5cdFx0XHRmdW5jdGlvbiB0cmF2ZXJzZUZpbGVUcmVlKGZpbGVzLCBlbnRyeSwgcGF0aCkge1xuXHRcdFx0XHRpZiAoZW50cnkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGlmIChlbnRyeS5pc0RpcmVjdG9yeSkge1xuXHRcdFx0XHRcdFx0dmFyIGRpclJlYWRlciA9IGVudHJ5LmNyZWF0ZVJlYWRlcigpO1xuXHRcdFx0XHRcdFx0cHJvY2Vzc2luZysrO1xuXHRcdFx0XHRcdFx0ZGlyUmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uKGVudHJpZXMpIHtcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0dHJhdmVyc2VGaWxlVHJlZShmaWxlcywgZW50cmllc1tpXSwgKHBhdGggPyBwYXRoIDogXCJcIikgKyBlbnRyeS5uYW1lICsgXCIvXCIpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NpbmctLTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwcm9jZXNzaW5nKys7XG5cdFx0XHRcdFx0XHRlbnRyeS5maWxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdFx0cHJvY2Vzc2luZy0tO1xuXHRcdFx0XHRcdFx0XHRmaWxlLl9yZWxhdGl2ZVBhdGggPSAocGF0aCA/IHBhdGggOiBcIlwiKSArIGZpbGUubmFtZTtcblx0XHRcdFx0XHRcdFx0ZmlsZXMucHVzaChmaWxlKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn0gXSk7XG5cbn0pKCk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBDb21wb25lbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge30sXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fSxcclxuICAgICAgICAgICAgY29ubmVjdG9ycyA9IHt9O1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXInKTtcclxuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0NvbXBvbmVudERldGFpbHNfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Rlc3Ryb3lpbmcgOicsIGNvbnRleHQucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgQ29tcG9uZW50U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICBjb25uZWN0b3JzOiBjb25uZWN0b3JzXHJcbiAgICAgICAgfTtcclxuLy8gICAgICAgIGRhdGEgPSB7XHJcbi8vICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4vLyAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcclxuLy8gICAgICAgICAgICBkb21haW5Nb2RlbHM6IHt9LCAgIC8vZG9tYWluTW9kZWw6IGlkOiA8c3RyaW5nPiwgdHlwZTogPHN0cmluZz5cclxuLy8gICAgICAgICAgICBpbnRlcmZhY2VzOiB7XHJcbi8vICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LCAvL3Byb3BlcnR5OiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGF0YVR5cGU6IDxzdHJpbmc+LCB2YWx1ZVR5cGUgPHN0cmluZz59XHJcbi8vICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9ICAvL2Nvbm5lY3Rvcjoge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRvbWFpblBvcnRzOiA8b2JqZWN0PiB9XHJcbi8vICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgfVxyXG5cclxuICAgICAgICBDb21wb25lbnRTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdG9yczoge31cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgIC8vVE9ETzogbm90aWZ5IHVzZXJcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyIC0gaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnRJbnRlcmZhY2VzKGNvbnRleHQsICRzY29wZS5jb21wb25lbnRJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgLy8gU2luY2Ugd2F0Y2hDb21wb25lbnREZXRhaWxzIGtlZXBzIHRoZSBkYXRhIHVwLXRvLWRhdGUgdGhlcmUgc2hvdWxkbid0IGJlIGEgbmVlZCB0byBkbyBhbnlcclxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZXMgaGVyZS4uXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29tcG9uZW50SW50ZXJmYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLnByb3BlcnRpZXMgPSBjb21wb25lbnRJbnRlcmZhY2VzLnByb3BlcnRpZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMuY29ubmVjdG9ycyA9IGNvbXBvbmVudEludGVyZmFjZXMuY29ubmVjdG9ycztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2NvbXBvbmVudERldGFpbHMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJyxcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudElkOiAnPWNvbXBvbmVudElkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db21wb25lbnREZXRhaWxzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdDb21wb25lbnRMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICR3aW5kb3csIGdyb3dsLCBDb21wb25lbnRTZXJ2aWNlLCBGaWxlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sICAgICAgICAgICAgIC8vIEl0ZW1zIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgaXRlbS1saXN0IHVpLWNvbXBvbmVudC5cclxuICAgICAgICAgICAgY29tcG9uZW50SXRlbXMgPSB7fSwgICAgLy8gU2FtZSBpdGVtcyBhcmUgc3RvcmVkIGluIGEgZGljdGlvbmFyeS5cclxuICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0sXHJcbiAgICAgICAgICAgIGFkZERvbWFpbldhdGNoZXIsXHJcbiAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgY29udGV4dDtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NvbXBvbmVudExpc3RDb250cm9sbGVyJyk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0NvbXBvbmVudExpc3RDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29uZmlndXJhdGlvbiBmb3IgdGhlIGl0ZW0gbGlzdCB1aSBjb21wb25lbnQuXHJcbiAgICAgICAgY29uZmlnID0ge1xyXG5cclxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBzaG93RGV0YWlsc0xhYmVsOiAnU2hvdyBkZXRhaWxzJyxcclxuICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXHJcblxyXG4gICAgICAgICAgICAvLyBFdmVudCBoYW5kbGVyc1xyXG5cclxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NsaWNrZWQ6ICcgKyBpdGVtKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggPSAnL2NvbXBvbmVudC8nICsgaXRlbS5pZC5yZXBsYWNlKC9cXC8vZywgJy0nKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NvbnRleHRtZW51IHdhcyB0cmlnZ2VyZWQgZm9yIG5vZGU6JywgaXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgaXRlbS5pZCwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc0FkbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgQUNNJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtyZXNvdXJjZTogaXRlbS5yZXNvdXJjZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGFzaCA9IGRhdGEucmVzb3VyY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBGaWxlU2VydmljZS5nZXREb3dubG9hZFVybChoYXNoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKHVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdDb21wb25lbnQgZG9lcyBub3QgaGF2ZSBhIHJlc291cmNlLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbGFiZWw6ICdFeHRyYScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHsgaWQ6IGl0ZW0uaWQgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2UuZGVsZXRlV29ya3NwYWNlKGNvbnRleHQsIGRhdGEuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBkZXRhaWxzUmVuZGVyZXI6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGZpbHRlcjoge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICBpdGVtczogaXRlbXMsXHJcbiAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogJHNjb3BlLmNvbm5lY3Rpb25JZCAvLyBGSVhNRTogVGhpcyBpcyBwcm9iYWJseSBub3QgdGhlIHJpZ2h0IHdheSB0byBkbyBpdC4uXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSByYXcgc2VydmljZSBub2RlIGRhdGEgdG8gaXRlbXMgZm9yIHRoZSBsaXN0LlxyXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGxpc3RJdGVtO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudEl0ZW1zLmhhc093blByb3BlcnR5KGRhdGEuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IGNvbXBvbmVudEl0ZW1zW2RhdGEuaWRdO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0ubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnJlc291cmNlID0gZGF0YS5yZXNvdXJjZTsgLy8gRklYTUU6IFRoaXMgaXMgcHJvYmFibHkgbm90IHRoZSByaWdodCB3YXkgdG8gZG8gaXQuLlxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnT3BlbiBpdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpLCAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnICAgICAgICAgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzOiBbIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlscyAgICA6ICdDb250ZW50JyxcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzVGVtcGxhdGVVcmw6ICdkZXRhaWxzLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBkYXRhLnJlc291cmNlIC8vIEZJWE1FOiBUaGlzIGlzIHByb2JhYmx5IG5vdCB0aGUgcmlnaHQgd2F5IHRvIGRvIGl0Li5cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3QtaXRlbSB0byB0aGUgaXRlbXMgbGlzdCBhbmQgdGhlIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zW2xpc3RJdGVtLmlkXSA9IGxpc3RJdGVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYWRkRG9tYWluV2F0Y2hlciA9IGZ1bmN0aW9uIChjb21wb25lbnRJZCkge1xyXG4gICAgICAgICAgICB2YXIgZG9tYWluTW9kZWxzVG9TdGF0ID0gZnVuY3Rpb24gKGRvbWFpbk1vZGVscykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRzID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxNYXAgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENBRDogICAgICAgICAgIHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdDQUQnLCAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zdG9wJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBDeWJlcjogICAgICAgICB7IHZhbHVlOiAwLCB0b29sVGlwOiAnQ3liZXInLCAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc3RvcCcgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWFudWZhY3R1cmluZzogeyB2YWx1ZTogMCwgdG9vbFRpcDogJ01hbnVmYWN0dXJpbmcnLCBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXN0b3AnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vZGVsaWNhOiAgICAgIHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdNb2RlbGljYScsICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zdG9wJyB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBrZXk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBkb21haW5Nb2RlbHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tYWluTW9kZWxzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVsTWFwW2RvbWFpbk1vZGVsc1trZXldLnR5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbE1hcFtkb21haW5Nb2RlbHNba2V5XS50eXBlXS52YWx1ZSArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5leHBlY3RlZCBkb21haW4tbW9kZWwgdHlwZScsIGRvbWFpbk1vZGVsc1trZXldLnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gbGFiZWxNYXApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxNYXBba2V5XS52YWx1ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRzLnB1c2gobGFiZWxNYXBba2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBDb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50RG9tYWlucyhjb250ZXh0LCBjb21wb25lbnRJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbSA9IGNvbXBvbmVudEl0ZW1zW2NvbXBvbmVudElkXTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEb21haW5Nb2RlbHMgdXBkYXRlZCwgZXZlbnQgdHlwZTonLCB1cGRhdGVEYXRhLnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxpc3RJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHMgPSBkb21haW5Nb2RlbHNUb1N0YXQodXBkYXRlRGF0YS5kb21haW5Nb2RlbHMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0RvbWFpbk1vZGVsIGRhdGEgZGlkIG5vdCBoYXZlIG1hdGNoaW5nIGNvbXBvbmVudERhdGEnLCBjb21wb25lbnRJZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbSA9IGNvbXBvbmVudEl0ZW1zW2NvbXBvbmVudElkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGlzdEl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHMgPSBkb21haW5Nb2RlbHNUb1N0YXQoZGF0YS5kb21haW5Nb2RlbHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRG9tYWluTW9kZWwgZGF0YSBkaWQgbm90IGhhdmUgbWF0Y2hpbmcgY29tcG9uZW50RGF0YScsIGNvbXBvbmVudElkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBDb21wb25lbnRTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5saXN0RGF0YS5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgICAgICBjb21wb25lbnRJdGVtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnRzKGNvbnRleHQsICRzY29wZS53b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iaikge1xyXG4gICAgICAgICAgICAgICAgLy9UT0RPOiBJbXBsZW1lbnQgdGhlIHVwZGF0aW5nIGZ1bmN0aW9uYWxpdHkuXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRJZDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbXBvbmVudElkIGluIGRhdGEuY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb21wb25lbnRzLmhhc093blByb3BlcnR5KGNvbXBvbmVudElkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oZGF0YS5jb21wb25lbnRzW2NvbXBvbmVudElkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGREb21haW5XYXRjaGVyKGNvbXBvbmVudElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2NvbXBvbmVudExpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCcsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db21wb25lbnRMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50TGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignRGVzaWduTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBEZXNpZ25TZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSxcclxuICAgICAgICAgICAgY29uZmlnO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnRGVzaWduTGlzdENvbnRyb2xsZXInKTtcclxuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUud29ya3NwYWNlSWQpO1xyXG5cclxuLy8gICAgICAgIGNvbmZpZyA9IHtcclxuLy9cclxuLy8gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXHJcbi8vICAgICAgICAgICAgc2Vjb25kYXJ5SXRlbU1lbnU6IHRydWUsXHJcbi8vICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4vLyAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxyXG4vLyAgICAgICAgICAgIGhpZGVEZXRhaWxzTGFiZWw6ICdIaWRlIGRldGFpbHMnLFxyXG4vL1xyXG4vLyAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXHJcbi8vXHJcbi8vICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkOiAnICsgaXRlbSk7XHJcbi8vICAgICAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggPVxyXG4vLyAgICAgICAgICAgICAgICAgICAgJy93b3Jrc3BhY2VEZXRhaWxzLy8nICsgaXRlbS5pZDtcclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgaXRlbSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29udGV4dG1lbnUgd2FzIHRyaWdnZXJlZCBmb3Igbm9kZTonLCBpdGVtKTtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuLy8gICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW5JbkVkaXRvcicsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCdcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkdXBsaWNhdGVXb3Jrc3BhY2UnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEdXBsaWNhdGUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtY29weSBjb3B5LWljb24nXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZWRpdFdvcmtzcGFjZScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCdcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc1hNRScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBhcyBYTUUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4vLyAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAvL2xhYmVsOiAnRXh0cmEnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXBsdXMnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2UuZGVsZXRlV29ya3NwYWNlKGRhdGEuaWQpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4vLyAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICBdO1xyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4vLyAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIG5ld0l0ZW1Gb3JtOiB7XHJcbi8vICAgICAgICAgICAgICAgIHRpdGxlOiAnQ3JlYXRlIG5ldyBpdGVtJyxcclxuLy8gICAgICAgICAgICAgICAgaXRlbVRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtzcGFjZU5ld0l0ZW0uaHRtbCcsXHJcbi8vICAgICAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZUl0ZW0gPSBmdW5jdGlvbiAobmV3SXRlbSkge1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2UuY3JlYXRlV29ya3NwYWNlKG5ld0l0ZW0pO1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5uZXdJdGVtID0ge307XHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm5ld0l0ZW1Gb3JtLmV4cGFuZGVkID0gZmFsc2U7IC8vIHRoaXMgaXMgaG93IHlvdSBjbG9zZSB0aGUgZm9ybSBpdHNlbGZcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgIH07XHJcbi8vICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIGZpbHRlcjoge1xyXG4vLyAgICAgICAgICAgIH1cclxuLy9cclxuLy8gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbi8vICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2Rlc2lnbkxpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvRGVzaWduTGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnbkxpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnblRyZWVDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgRGVzaWduU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sXHJcbiAgICAgICAgICAgIGNvbmZpZztcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Rlc2lnblRyZWVDb250cm9sbGVyJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmRlc2lnbklkKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnRyZWVEYXRhID0ge307XHJcblxyXG4gICAgICAgIERlc2lnblNlcnZpY2Uud2F0Y2hEZXNpZ25TdHJ1Y3R1cmUobnVsbCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAoZXJyLCBzdHJ1Y3R1cmUpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRyZWVEYXRhID0gc3RydWN0dXJlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdkZXNpZ25UcmVlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduSWQ6ICc9ZGVzaWduSWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0Rlc2lnblRyZWUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEZXNpZ25UcmVlQ29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdUZXN0QmVuY2hMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIFRlc3RCZW5jaFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdLFxyXG4gICAgICAgICAgICBjb25maWc7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUZXN0QmVuY2hMaXN0Q29udHJvbGxlcicpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS53b3Jrc3BhY2VJZCk7XHJcblxyXG4vLyAgICAgICAgY29uZmlnID0ge1xyXG4vL1xyXG4vLyAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcclxuLy8gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcclxuLy8gICAgICAgICAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXHJcbi8vICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXHJcbi8vICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXHJcbi8vXHJcbi8vICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcclxuLy9cclxuLy8gICAgICAgICAgICBpdGVtU29ydDogZnVuY3Rpb24gKGpRRXZlbnQsIHVpKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NsaWNrZWQ6ICcgKyBpdGVtKTtcclxuLy8gICAgICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9XHJcbi8vICAgICAgICAgICAgICAgICAgICAnL3dvcmtzcGFjZURldGFpbHMvLycgKyBpdGVtLmlkO1xyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb250ZXh0bWVudSB3YXMgdHJpZ2dlcmVkIGZvciBub2RlOicsIGl0ZW0pO1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4vLyAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0J1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2R1cGxpY2F0ZVdvcmtzcGFjZScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0R1cGxpY2F0ZScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1jb3B5IGNvcHktaWNvbidcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0V29ya3NwYWNlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsJ1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2V4cG9ydEFzWE1FJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhwb3J0IGFzIFhNRScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNoYXJlLWFsdCcsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbi8vICAgICAgICAgICAgICAgICAgICB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIC8vbGFiZWw6ICdFeHRyYScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcGx1cycsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UoZGF0YS5pZCk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbi8vICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgIF07XHJcbi8vICAgICAgICAgICAgfSxcclxuLy9cclxuLy8gICAgICAgICAgICBkZXRhaWxzUmVuZGVyZXI6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbi8vICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgbmV3SXRlbUZvcm06IHtcclxuLy8gICAgICAgICAgICAgICAgdGl0bGU6ICdDcmVhdGUgbmV3IGl0ZW0nLFxyXG4vLyAgICAgICAgICAgICAgICBpdGVtVGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvV29ya3NwYWNlTmV3SXRlbS5odG1sJyxcclxuLy8gICAgICAgICAgICAgICAgZXhwYW5kZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY3JlYXRlSXRlbSA9IGZ1bmN0aW9uIChuZXdJdGVtKSB7XHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5jcmVhdGVXb3Jrc3BhY2UobmV3SXRlbSk7XHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm5ld0l0ZW0gPSB7fTtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcubmV3SXRlbUZvcm0uZXhwYW5kZWQgPSBmYWxzZTsgLy8gdGhpcyBpcyBob3cgeW91IGNsb3NlIHRoZSBmb3JtIGl0c2VsZlxyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgfTtcclxuLy8gICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgZmlsdGVyOiB7XHJcbi8vICAgICAgICAgICAgfVxyXG4vL1xyXG4vLyAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcclxuICAgICAgICB9O1xyXG5cclxuLy8gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgndGVzdEJlbmNoTGlzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUlkOiAnPXdvcmtzcGFjZUlkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9UZXN0QmVuY2hMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignV29ya3NwYWNlTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBncm93bCwgV29ya3NwYWNlU2VydmljZSwgRmlsZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdLFxyXG4gICAgICAgICAgICB3b3Jrc3BhY2VJdGVtcyA9IHt9LFxyXG4gICAgICAgICAgICBjb25maWcsXHJcbiAgICAgICAgICAgIGNvbnRleHQsXHJcbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMldvcmtzcGFjZUl0ZW0sXHJcbiAgICAgICAgICAgIGFkZENvdW50V2F0Y2hlcnM7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlcicpO1xyXG5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnV29ya3NwYWNlTGlzdENvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcgPSB7XHJcblxyXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxyXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcclxuXHJcbiAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXHJcblxyXG4gICAgICAgICAgICBpdGVtU29ydDogZnVuY3Rpb24gKGpRRXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2xpY2tlZDogJyArIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9XHJcbiAgICAgICAgICAgICAgICAgICAgJy93b3Jrc3BhY2VEZXRhaWxzLycgKyBpdGVtLmlkLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29udGV4dG1lbnUgd2FzIHRyaWdnZXJlZCBmb3Igbm9kZTonLCBpdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZHVwbGljYXRlV29ya3NwYWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0R1cGxpY2F0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWNvcHkgY29weS1pY29uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7aWQ6IGl0ZW0uaWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5kdXBsaWNhdGVXb3Jrc3BhY2UoY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2VkaXRXb3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7aWQ6IGl0ZW0uaWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnTm90IEltcGxlbWVudGVkLCBpZDogJyArIGRhdGEuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc1hNRScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgYXMgWE1FJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHsgaWQ6IGl0ZW0uaWQgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmluZm8oJ05vdCBJbXBsZW1lbnRlZCwgaWQ6ICcgKyBkYXRhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9sYWJlbDogJ0V4dHJhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcGx1cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UoY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbmV3SXRlbUZvcm06IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ3JlYXRlIG5ldyB3b3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgaXRlbVRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtzcGFjZU5ld0l0ZW0uaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBleHBhbmRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wcGVkRmlsZXM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ092ZXJDbGFzcyA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWRJdGVtcyA9ICRldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZHJhZ2dlZEl0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWRJdGVtcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZHJhZ2dlZEl0ZW1zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWRJdGVtc1tpXS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhc0ZpbGUgPyBcImJnLXN1Y2Nlc3MgZHJhZ292ZXJcIiA6IFwiYmctZGFuZ2VyIGRyYWdvdmVyXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uRHJvcHBlZEZpbGVzID0gZnVuY3Rpb24gKCRmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBGaWxlU2VydmljZS5zYXZlRHJvcHBlZEZpbGVzKCRmaWxlcywge3ppcDogdHJ1ZSwgYWRtOiB0cnVlLCBhdG06IHRydWV9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGZJbmZvcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGZJbmZvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZJbmZvcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzLnB1c2goZkluZm9zW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY3JlYXRlSXRlbSA9IGZ1bmN0aW9uIChuZXdJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgJHNjb3BlLmZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuZmlsZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vV29ya3NwYWNlU2VydmljZS5jcmVhdGVXb3Jrc3BhY2UoY29udGV4dCwgbmV3SXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS5uZXdJdGVtID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbmZpZy5uZXdJdGVtRm9ybS5leHBhbmRlZCA9IGZhbHNlOyAvLyB0aGlzIGlzIGhvdyB5b3UgY2xvc2UgdGhlIGZvcm0gaXRzZWxmXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcblxyXG5cclxuICAgICAgICBzZXJ2aWNlRGF0YTJXb3Jrc3BhY2VJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHdvcmtzcGFjZUl0ZW07XHJcblxyXG4gICAgICAgICAgICBpZiAod29ya3NwYWNlSXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0gPSB3b3Jrc3BhY2VJdGVtc1tkYXRhLmlkXTtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0ubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0uZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdPcGVuIGl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IG5ldyBEYXRlKCksIC8vIFRPRE86IGdldCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnIC8vIFRPRE86IGdldCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdDb21wb25lbnRzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXB1enpsZS1waWVjZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnRGVzaWduIFNwYWNlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1jdWJlcydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnVGVzdCBiZW5jaGVzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2F2ZWQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ1JlcXVpcmVtZW50cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1iYXItY2hhcnQtbydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSXRlbS5pZF0gPSB3b3Jrc3BhY2VJdGVtO1xyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh3b3Jrc3BhY2VJdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGFkZENvdW50V2F0Y2hlcnMgPSBmdW5jdGlvbiAod29ya3NwYWNlSWQpIHtcclxuICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mQ29tcG9uZW50cyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzBdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzBdLnZhbHVlID0gZGF0YS5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mRGVzaWducyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzFdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzFdLnZhbHVlID0gZGF0YS5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mVGVzdEJlbmNoZXMoY29udGV4dCwgd29ya3NwYWNlSWQsIGZ1bmN0aW9uICh1cGRhdGVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1syXS52YWx1ZSA9IHVwZGF0ZURhdGEuZGF0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1syXS52YWx1ZSA9IGRhdGEuY291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgV29ya3NwYWNlU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIGFsbCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hXb3Jrc3BhY2VzKGNvbnRleHQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMldvcmtzcGFjZUl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZENvdW50V2F0Y2hlcnModXBkYXRlT2JqZWN0LmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMldvcmtzcGFjZUl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZUl0ZW1zLmhhc093blByb3BlcnR5KHVwZGF0ZU9iamVjdC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mQ29tcG9uZW50c18nICsgdXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZEZXNpZ25zXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgd29ya3NwYWNlSXRlbXNbdXBkYXRlT2JqZWN0LmlkXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodXBkYXRlT2JqZWN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VJZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh3b3Jrc3BhY2VJZCBpbiBkYXRhLndvcmtzcGFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEud29ya3NwYWNlcy5oYXNPd25Qcm9wZXJ0eSh3b3Jrc3BhY2VJZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMldvcmtzcGFjZUl0ZW0oZGF0YS53b3Jrc3BhY2VzW3dvcmtzcGFjZUlkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDb3VudFdhdGNoZXJzKHdvcmtzcGFjZUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ3dvcmtzcGFjZUxpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya3NwYWNlTGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXHJcblxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdDb21wb25lbnRTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCBOb2RlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgd2F0Y2hlcnMgPSB7fTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBjb21wb25lbnQgZnJvbSB0aGUgY29udGV4dCAoZGIvcHJvamVjdC9icmFuY2gpLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLCBOLkIuIGRvZXMgbm90IG5lZWQgdG8gc3BlY2lmeSByZWdpb24uXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBvbmVudElkXHJcbiAgICAgICAgICogQHBhcmFtIFttc2ddIC0gQ29tbWl0IG1lc3NhZ2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5kZWxldGVDb21wb25lbnQgPSBmdW5jdGlvbiAoY29udGV4dCwgY29tcG9uZW50SWQsIG1zZykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1zZyB8fCAnQ29tcG9uZW50U2VydmljZS5kZWxldGVDb21wb25lbnQgJyArIGNvbXBvbmVudElkO1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCBjb21wb25lbnRJZCwgbWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBvcnRDb21wb25lbnQgPSBmdW5jdGlvbiAoY29udGV4dCwgY29tcG9uZW50SWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCBjb21wb25lbnRzIChleGlzdGVuY2UgYW5kIHRoZWlyIGF0dHJpYnV0ZXMpIG9mIGEgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuICBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLmNvbXBvbmVudHMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaENvbXBvbmVudHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50cycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9IC8vIGNvbXBvbmVudCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgYXZtSWQ6IDxzdHJpbmc+LCByZXNvdXJjZTogPGhhc2h8c3RyaW5nPiwgY2xhc3NpZmljYXRpb25zOiA8c3RyaW5nPiB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBdm1JRCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSZXNvdXJjZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdSZXNvdXJjZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdDbGFzcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdDbGFzc2lmaWNhdGlvbnMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXNjICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0F2bUlEICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLmF2bUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uYXZtSWQgPSBuZXdBdm1JRDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdSZXNvdXJjZSAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5yZXNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLnJlc291cmNlID0gbmV3UmVzb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2xhc3MgIT09IGRhdGEuY29tcG9uZW50c1tpZF0uY2xhc3NpZmljYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uY2xhc3NpZmljYXRpb25zID0gbmV3Q2xhc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS5jb21wb25lbnRzW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbXBvbmVudHNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbY29tcG9uZW50SWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWQ6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdSZXNvdXJjZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2lmaWNhdGlvbnM6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWQ6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NpZmljYXRpb25zOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY29tcG9uZW50SWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb21wb25lbnRzW2NvbXBvbmVudElkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBkb21haW4tbW9kZWxzIG9mIGEgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb21wb25lbnRJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaENvbXBvbmVudERvbWFpbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgY29tcG9uZW50SWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50RG9tYWluc18nICsgY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICBkb21haW5Nb2RlbHM6IHt9ICAgLy9kb21haW5Nb2RlbDogaWQ6IDxzdHJpbmc+LCB0eXBlOiA8c3RyaW5nPlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uRG9tYWluTW9kZWxVcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VHlwZSAhPT0gZGF0YS5kb21haW5Nb2RlbHNbaWRdLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbaWRdLnR5cGUgPSBuZXdUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Eb21haW5Nb2RlbFVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmRvbWFpbk1vZGVsc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBjb21wb25lbnRJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29tcG9uZW50Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRvbWFpbk1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRvbWFpbk1vZGVsc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvbkRvbWFpbk1vZGVsVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uRG9tYWluTW9kZWxVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuRG9tYWluTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZG9tYWluTW9kZWxzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Eb21haW5Nb2RlbFVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uRG9tYWluTW9kZWxVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBpbnRlcmZhY2VzIG9mIGEgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb21wb25lbnRJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaENvbXBvbmVudEludGVyZmFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgY29tcG9uZW50SWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50SW50ZXJmYWNlc18nICsgY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSwgLy9wcm9wZXJ0eToge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRhdGFUeXBlOiA8c3RyaW5nPiwgdmFsdWVUeXBlIDxzdHJpbmc+fVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9ICAvL2Nvbm5lY3Rvcjoge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRvbWFpblBvcnRzOiA8b2JqZWN0PiB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Qcm9wZXJ0eVVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGF0YVR5cGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnRGF0YVR5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEucHJvcGVydGllc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0RhdGFUeXBlICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLmRhdGFUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tpZF0uZGF0YVR5cGUgPSBuZXdEYXRhVHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZVR5cGUgIT09IGRhdGEucHJvcGVydGllc1tpZF0udmFsdWVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tpZF0udmFsdWVUeXBlID0gbmV3VmFsdWVUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Qcm9wZXJ0eVVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnByb3BlcnRpZXNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Db25uZWN0b3JVcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb25uZWN0b3JzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29ubmVjdG9yc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkNvbm5lY3RvclVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbm5lY3RvcnNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgY29tcG9uZW50SWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbXBvbmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Tm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Qcm9wZXJ0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnRGF0YVR5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlVHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVmFsdWVUeXBlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uUHJvcGVydHlVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Qcm9wZXJ0eVVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQ29ubmVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbm5lY3RvcnNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblBvcnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25Db25uZWN0b3JVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Db25uZWN0b3JVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuUHJvcGVydHkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdEYXRhVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVUeXBlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uUHJvcGVydHlVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblByb3BlcnR5VW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbm5lY3RvcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25uZWN0b3JzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblBvcnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvbkNvbm5lY3RvclVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uQ29ubmVjdG9yVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vcXVldWVMaXN0LnB1c2goY2hpbGROb2RlLmxvYWRDaGlsZHJlbihjaGlsZE5vZGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCB3YXRjaGVycyBzcGF3bmVkIGZyb20gcGFyZW50Q29udGV4dCwgdGhpcyBzaG91bGQgdHlwaWNhbGx5IGJlIGludm9rZWQgd2hlbiB0aGUgY29udHJvbGxlciBpcyBkZXN0cm95ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFdhdGNoZXJzLFxyXG4gICAgICAgICAgICAgICAga2V5O1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2F0Y2hlcnMgPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGNoaWxkV2F0Y2hlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRXYXRjaGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY2hpbGRXYXRjaGVyc1trZXldLmRiLCBjaGlsZFdhdGNoZXJzW2tleV0ucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgc3BlY2lmaWVkIHdhdGNoZXIgKHJlZ2lvbklkKVxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LmRiIC0gRGF0YWJhc2UgY29ubmVjdGlvbiBvZiBib3RoIHBhcmVudCBhbmQgcmVnaW9uIHRvIGJlIGRlbGV0ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHJlZ2lvbklkIC0gUmVnaW9uIGlkIG9mIHRoZSBzcGF3bmVkIHJlZ2lvbiB0aGF0IHNob3VsZCBiZSBkZWxldGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5jbGVhblVwUmVnaW9uKHBhcmVudENvbnRleHQuZGIsIHJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGNsZWFuLXVwIHJlZ2lvbiBzaW5jZSBwYXJlbnRDb250ZXh0IGlzIG5vdCByZWdpc3RlcmVkLi4nLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdGVycyBhIHdhdGNoZXIgKGNvbnRyb2xsZXIpIHRvIHRoZSBzZXJ2aWNlLiBDYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbiBub2RlcyBiZWNhbWUgYXZhaWxhYmxlIG9yXHJcbiAgICAgICAgICogd2hlbiB0aGV5IGJlY2FtZSB1bmF2YWlsYWJsZS4gVGhlc2UgYXJlIGFsc28gY2FsbGVkIGRpcmVjdGx5IHdpdGggdGhlIHN0YXRlIG9mIHRoZSBOb2RlU2VyaXZjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gLSBDYWxsZWQgd2l0aCB0cnVlIHdoZW4gdGhlcmUgYXJlIG5vIG5vZGVzIHVuYXZhaWxhYmxlIGFuZCBmYWxzZSB3aGVuIHRoZXJlIGFyZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5vbihwYXJlbnRDb250ZXh0LmRiLCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGVub3VnaCwgdGhlIHJlZ2lvbnMgd2lsbCBiZSBjbGVhbmVkIHVwIGluIE5vZGVTZXJ2aWNlLlxyXG4gICAgICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZuKGZhbHNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLm9uKHBhcmVudENvbnRleHQuZGIsICdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgZW5vdWdoLCB0aGUgcmVnaW9ucyBzaG91bGQgYmUgY2xlYW5lZCB1cCBpbiBOb2RlU2VydmljZS5cclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZuKHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ0NvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5sb2dDb250ZXh0KGNvbnRleHQpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ0Rlc2lnblNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsIE5vZGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLmRlbGV0ZURlc2lnbiA9IGZ1bmN0aW9uIChkZXNpZ25JZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBvcnREZXNpZ24gPSBmdW5jdGlvbiAoZGVzaWduSWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlQ29uZmlndXJhdGlvblNldCA9IGZ1bmN0aW9uIChkZXNpZ25JZCwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIGNvbnRhaW5lcnMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS4gIERhdGEgaXMgYW4gb2JqZWN0IGluIGRhdGEuZGVzaWducy5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoRGVzaWducyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hEZXNpZ25zJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiBwYXJlbnRDb250ZXh0LnByb2plY3RJZCxcclxuICAgICAgICAgICAgICAgICAgICBicmFuY2hJZDogcGFyZW50Q29udGV4dC5icmFuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBkZXNpZ25zOiB7fSAvLyBkZXNpZ24ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5kZXNpZ25zW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS5kZXNpZ25zW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLmRlc2lnbnNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuZGVzaWduc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbZGVzaWduSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25JZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zW2Rlc2lnbklkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogZGVzaWduSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5kZXNpZ25zW2Rlc2lnbklkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhIGRlc2lnbiB3LnIudC4gaW50ZXJmYWNlcy5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gZGVzaWduSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hEZXNpZ25EZXRhaWxzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGZ1bGwgaGllcmFyY2h5IG9mIGEgZGVzaWduIHcuci50LiBjb250YWluZXJzIGFuZCBjb21wb25lbnRzLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBkZXNpZ25JZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaERlc2lnblN0cnVjdHVyZSA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEZJWE1FOiB3YXRjaENvbmZpZ3VyYXRpb25TZXRzIGFuZCB3YXRjaENvbmZpZ3VyYXRpb25zIHNob3VsZCBwcm9iYWJseSBnbyB0byBhIERlc2VydENvbmZpZ3VyYXRpb24tU2VydmljZSxcclxuICAgICAgICAvLyB3aXRoIGEgcmVsYXRlZCBjb250cm9sbGVyIERlc2VydENvbmZpZ3VyYXRpb25TZXRMaXN0LCB3aGVyZSBkZXRhaWxzIGFyZSBjb25maWd1cmF0aW9ucy5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZ2VuZXJhdGVkIERlc2VydENvbmZpZ3VyYXRpb25TZXRzIGluc2lkZSBhIERlc2lnbi5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gZGVzaWduSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hDb25maWd1cmF0aW9uU2V0cyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnU2V0czoge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogcGFyZW50Q29udGV4dC5wcm9qZWN0SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmNoSWQ6IHBhcmVudENvbnRleHQuYnJhbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29uZmlndXJhdGlvblNldHNfJyArIGRlc2lnbklkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkYXRhLnJlZ2lvbklkID0gY29udGV4dC5yZWdpb25JZDtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQWRkZWQgbmV3IHdhdGNoZXI6ICcsIHdhdGNoZXJzKTtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9nQ29udGV4dChjb250ZXh0KTtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGRlc2lnbklkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkZXNpZ25Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubmFtZSA9IGRlc2lnbk5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUubG9hZENoaWxkcmVuKGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG5ld05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuY2ZnU2V0c1tpZF0ubmFtZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgIT09IGRhdGEuY2ZnU2V0c1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2RhdGEuY2ZnU2V0c1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLndhcm4oJ2NoYW5nZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGVzW2ldLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNmZ1NldHNbY2hpbGROb2Rlc1tpXS5nZXRJZCgpXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGROb2Rlc1tpXS5nZXRJZCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZXNbaV0uZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZXNbaV0uZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzW2ldLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXNbaV0ub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2NmZ1NldHMnLCBjZmdTZXRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvblNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uVXBkYXRlKGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gRklYTUU6IFdhdGNoaW5nIGNvbmZpZ3VyYXRpb25zIGluc2lkZSBhIGNvbmZpZ3VyYXRpb24tc2V0IGRvZXMgcHJvYmFibHkgbm90IGJlbG9uZyBoZXJlLlxyXG4vLyAgICAgICAgLyoqXHJcbi8vICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgRGVzZXJ0Q29uZmlndXJhdGlvbiAody5yLnQuIGV4aXN0ZW5jZSBhbmQgYXR0cmlidXRlcykgaW5zaWRlIGEgRGVzZXJ0Q29uZmlndXJhdGlvblNldC5cclxuLy8gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4vLyAgICAgICAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb25TZXRJZFxyXG4vLyAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuLy8gICAgICAgICAqL1xyXG4vLyAgICAgICAgdGhpcy53YXRjaENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGNvbmZpZ3VyYXRpb25TZXRJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuLy8gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbi8vICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCB3YXRjaGVycyBzcGF3bmVkIGZyb20gcGFyZW50Q29udGV4dC5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkV2F0Y2hlcnMsXHJcbiAgICAgICAgICAgICAgICBrZXk7XHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXYXRjaGVycyA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gY2hpbGRXYXRjaGVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZFdhdGNoZXJzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjaGlsZFdhdGNoZXJzW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgc3BlY2lmaWVkIHdhdGNoZXIgKHJlZ2lvbklkKVxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0XHJcbiAgICAgICAgICogQHBhcmFtIHJlZ2lvbklkXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24ocmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYW5ub3QgY2xlYW4tdXAgcmVnaW9uIHNpbmNlIHBhcmVudENvbnRleHQgaXMgbm90IHJlZ2lzdGVyZWQuLicsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBXZWJHTUVHbG9iYWwsIGNvbnNvbGUqL1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnRmlsZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBibG9iQ2xpZW50ID0gbmV3IFdlYkdNRUdsb2JhbC5jbGFzc2VzLkJsb2JDbGllbnQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlRHJvcHBlZEZpbGVzID0gZnVuY3Rpb24gKGZpbGVzLCB2YWxpZEV4dGVuc2lvbnMpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGksXHJcbiAgICAgICAgICAgICAgICBjb3VudGVyID0gZmlsZXMubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgYXJ0aWUgPSBibG9iQ2xpZW50LmNyZWF0ZUFydGlmYWN0KCdkcm9wcGVkRmlsZXMnKSxcclxuICAgICAgICAgICAgICAgIGFkZEZpbGUsXHJcbiAgICAgICAgICAgICAgICBhZGRlZEZpbGVzID0gW10sXHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY291bnRlciA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYWRkZWRGaWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvdW50ZXIgPSBmaWxlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBhZGRGaWxlID0gZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlRXh0ZW5zaW9uID0gc2VsZi5nZXRGaWxlRXh0ZW5zaW9uKGZpbGUubmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkRXh0ZW5zaW9ucyB8fCB2YWxpZEV4dGVuc2lvbnNbZmlsZUV4dGVuc2lvbl0pIHtcclxuICAgICAgICAgICAgICAgICAgICBhcnRpZS5hZGRGaWxlQXNTb2Z0TGluayhmaWxlLm5hbWUsIGZpbGUsIGZ1bmN0aW9uIChlcnIsIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGFkZCBmaWxlIFwiJyArIGZpbGUubmFtZSArICdcIiB0byBibG9iLCBlcnI6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ291bnRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZGVkRmlsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogZmlsZUV4dGVuc2lvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHNlbGYuaHVtYW5GaWxlU2l6ZShmaWxlLnNpemUsIHRydWUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBibG9iQ2xpZW50LmdldERvd25sb2FkVVJMKGhhc2gpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBhZGRGaWxlKGZpbGVzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZG93bmxvYWQgdXJsIGZvciB0aGUgZ2l2ZW4gaGFzaC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaGFzaCAtIGhhc2ggdG8gYmxvYiBmaWxlLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gdGhlIGRvd25sb2FkIHVybCAobnVsbCBpZiBoYXNoIGlzIGVtcHR5KS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmdldERvd25sb2FkVXJsID0gZnVuY3Rpb24gKGhhc2gpIHtcclxuICAgICAgICAgICAgdmFyIHVybDtcclxuICAgICAgICAgICAgaWYgKGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIHVybCA9IGJsb2JDbGllbnQuZ2V0RG93bmxvYWRVUkwoaGFzaCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGhhc2ggdG8gYmxvYiBmaWxlIGdpdmVuJyk7XHJcbiAgICAgICAgICAgICAgICB1cmwgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZmlsZSBleHRlbnNpb24gb2YgdGhlIGdpdmVuIGZpbGVuYW1lLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gdGhlIHJlc3VsdGluZyBmaWxlIGV4dGVuc2lvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmdldEZpbGVFeHRlbnNpb24gPSBmdW5jdGlvbiAoZmlsZW5hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGEgPSBmaWxlbmFtZS5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgIGlmIChhLmxlbmd0aCA9PT0gMSB8fCAoYVswXSA9PT0gXCJcIiAmJiBhLmxlbmd0aCA9PT0gMikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhLnBvcCgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRm9ybWF0cyB0aGUgc2l6ZSBpbnRvIGEgaHVtYW4gcmVhZGFibGUgc3RyaW5nLlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBieXRlcyAtIHNpemUgaW4gYnl0ZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBzaSAtIHJldHVybiByZXN1bHQgaW4gU0lVbml0cyBvciBub3QuXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gLSBmb3JtYXR0ZWQgZmlsZSBzaXplLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuaHVtYW5GaWxlU2l6ZSA9IGZ1bmN0aW9uIChieXRlcywgc2kpIHtcclxuICAgICAgICAgICAgdmFyIHRocmVzaCA9IHNpID8gMTAwMCA6IDEwMjQsXHJcbiAgICAgICAgICAgICAgICB1bml0cyxcclxuICAgICAgICAgICAgICAgIHU7XHJcbiAgICAgICAgICAgIGlmIChieXRlcyA8IHRocmVzaCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ5dGVzICsgJyBCJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdW5pdHMgPSBzaSA/IFsna0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXSA6XHJcbiAgICAgICAgICAgICAgICAgICAgWydLaUInLCAnTWlCJywgJ0dpQicsICdUaUInLCAnUGlCJywgJ0VpQicsICdaaUInLCAnWWlCJ107XHJcbiAgICAgICAgICAgIHUgPSAtMTtcclxuXHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGJ5dGVzID0gYnl0ZXMgLyB0aHJlc2g7XHJcbiAgICAgICAgICAgICAgICB1ICs9IDE7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKGJ5dGVzID49IHRocmVzaCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnl0ZXMudG9GaXhlZCgxKSArICcgJyArIHVuaXRzW3VdO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnVGVzdEJlbmNoU2VydmljZScsIGZ1bmN0aW9uICgkcSwgTm9kZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHdhdGNoZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5kZWxldGVUZXN0QmVuY2ggPSBmdW5jdGlvbiAodGVzdEJlbmNoSWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZXhwb3J0VGVzdEJlbmNoID0gZnVuY3Rpb24gKHRlc3RCZW5jaElkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNldFRvcExldmVsU3lzdGVtVW5kZXJUZXN0ID0gZnVuY3Rpb24gKHRlc3RCZW5jaElkLCBkZXNpZ25JZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5ydW5UZXN0QmVuY2ggPSBmdW5jdGlvbiAodGVzdEJlbmNoSWQsIGNvbmZpZ3VyYXRpb25JZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIHRlc3QtYmVuY2hlcyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLnRlc3RCZW5jaGVzLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hUZXN0QmVuY2hlcyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2hlcycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogcGFyZW50Q29udGV4dC5wcm9qZWN0SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmNoSWQ6IHBhcmVudENvbnRleHQuYnJhbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoZXM6IHt9IC8vIHRlc3RCZW5jaCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIHBhdGg6IDxzdHJpbmc+LCByZXN1bHRzOiA8aGFzaHxzdHJpbmc+LCBmaWxlczogPGhhc2h8c3RyaW5nPiB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Jlc3VsdHMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnUmVzdWx0cycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdGaWxlcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdUZXN0QmVuY2hGaWxlcycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BhdGggIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLnBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0ucGF0aCA9IG5ld1BhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UmVzdWx0cyAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0ucmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5yZXN1bHRzID0gbmV3UmVzdWx0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdGaWxlcyAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0uZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0uZmlsZXMgPSBuZXdGaWxlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLnRlc3RCZW5jaGVzW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnRlc3RCZW5jaGVzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaElkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1t0ZXN0QmVuY2hJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUZXN0QmVuY2hGaWxlcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbdGVzdEJlbmNoSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1Rlc3RCZW5jaEZpbGVzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiB0ZXN0QmVuY2hJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLnRlc3RCZW5jaGVzW3Rlc3RCZW5jaElkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhIHRlc3QtYmVuY2ggdy5yLnQuIGludGVyZmFjZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHRlc3RCZW5jaElkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoRGV0YWlscyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB0ZXN0QmVuY2hJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ1dvcmtzcGFjZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsIE5vZGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLmR1cGxpY2F0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBvdGhlcldvcmtzcGFjZUlkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ3JlYXRpbmcgbmV3IHdvcmtzcGFjZSBidXQgbm90IHVzaW5nIGRhdGEnLCBkYXRhKTtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoY29udGV4dCwgJycsIG1ldGEuV29ya1NwYWNlLCAnW1dlYkN5UGh5XSAtIFdvcmtzcGFjZVNlcnZpY2UuY3JlYXRlV29ya3NwYWNlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG5ld05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobmV3Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgd29yay1zcGFjZSBmcm9tIHRoZSBjb250ZXh0IChkYi9wcm9qZWN0L2JyYW5jaCkuXHJcbiAgICAgICAgICogQHBhcmFtIGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIsIE4uQi4gZG9lcyBub3QgbmVlZCB0byBzcGVjaWZ5IHJlZ2lvbi5cclxuICAgICAgICAgKiBAcGFyYW0gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmRlbGV0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCB3b3Jrc3BhY2VJZCwgbXNnKSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICdXb3Jrc3BhY2VTZXJ2aWNlLmRlbGV0ZVdvcmtzcGFjZSAnICsgd29ya3NwYWNlSWQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmRlc3Ryb3lOb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBtZXNzYWdlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmV4cG9ydFdvcmtzcGFjZSA9IGZ1bmN0aW9uICh3b3Jrc3BhY2VJZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBUT0RPOiBtYWtlIHN1cmUgdGhlIG1ldGhvZHMgYmVsb3cgZ2V0cyByZXNvbHZlZCBhdCBlcnJvciB0b28uXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIHdvcmstc3BhY2VzIGRlZmluZWQgaW4gdGhlIHJvb3Qtbm9kZSB3LnIudC4gZXhpc3RlbmNlIGFuZCBhdHRyaWJ1dGVzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLndvcmtzcGFjZXMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaFdvcmtzcGFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hXb3Jrc3BhY2VzJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlczoge30gLy8gd29ya3NwYWNlID0ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS53b3Jrc3BhY2VzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS53b3Jrc3BhY2VzW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLndvcmtzcGFjZXNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLndvcmtzcGFjZXNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEud29ya3NwYWNlc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCAnJylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocm9vdE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Xb3JrU3BhY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdzSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW3dzSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHdzSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuV29ya1NwYWNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW3dzSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHdzSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiB3c0lkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEud29ya3NwYWNlc1t3c0lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBjb21wb25lbnRzIChkZWZpbmVkIGluIEFDTUZvbGRlcnMpIGluIHRoZSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIgKG11c3QgaGF2ZSBhIHJlZ2lvbklkIGRlZmluZWQpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gY2FsbGVkIG9uIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLWJhc2UuIERhdGEgaXMgdGhlIHVwZGF0ZWQgZGF0YS5jb3VudC5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mQ29tcG9uZW50c18nICsgd29ya3NwYWNlSWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50OiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29udGFpbmVycyAoZGVmaW5lZCBpbiBBRE1Gb2xkZXJzKSBpbiB0aGUgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIHRoZSB1cGRhdGVkIGRhdGEuY291bnQuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaE51bWJlck9mRGVzaWducyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkRlc2lnbnNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRDb250ZXh0LnJlZ2lvbklkKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocGFyZW50Q29udGV4dC5yZWdpb25JZCArICcgaXMgbm90IGEgcmVnaXN0ZXJlZCB3YXRjaGVyISAnICtcclxuICAgICAgICAgICAgICAgICAgICAnVXNlIFwidGhpcy5yZWdpc3RlcldhdGNoZXJcIiBiZWZvcmUgdHJ5aW5nIHRvIGFjY2VzcyBOb2RlIE9iamVjdHMuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiB0ZXN0LWJlbmNoZXMgKGRlZmluZWQgaW4gQVRNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mVGVzdEJlbmNoZXNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCB3YXRjaGVycyBzcGF3bmVkIGZyb20gcGFyZW50Q29udGV4dCwgdGhpcyBzaG91bGQgdHlwaWNhbGx5IGJlIGludm9rZWQgd2hlbiB0aGUgY29udHJvbGxlciBpcyBkZXN0cm95ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFdhdGNoZXJzLFxyXG4gICAgICAgICAgICAgICAga2V5O1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2F0Y2hlcnMgPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGNoaWxkV2F0Y2hlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRXYXRjaGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY2hpbGRXYXRjaGVyc1trZXldLmRiLCBjaGlsZFdhdGNoZXJzW2tleV0ucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgc3BlY2lmaWVkIHdhdGNoZXIgKHJlZ2lvbklkKVxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LmRiIC0gRGF0YWJhc2UgY29ubmVjdGlvbiBvZiBib3RoIHBhcmVudCBhbmQgcmVnaW9uIHRvIGJlIGRlbGV0ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHJlZ2lvbklkIC0gUmVnaW9uIGlkIG9mIHRoZSBzcGF3bmVkIHJlZ2lvbiB0aGF0IHNob3VsZCBiZSBkZWxldGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5jbGVhblVwUmVnaW9uKHBhcmVudENvbnRleHQuZGIsIHJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGNsZWFuLXVwIHJlZ2lvbiBzaW5jZSBwYXJlbnRDb250ZXh0IGlzIG5vdCByZWdpc3RlcmVkLi4nLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdGVycyBhIHdhdGNoZXIgKGNvbnRyb2xsZXIpIHRvIHRoZSBzZXJ2aWNlLiBDYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbiBub2RlcyBiZWNhbWUgYXZhaWxhYmxlIG9yXHJcbiAgICAgICAgICogd2hlbiB0aGV5IGJlY2FtZSB1bmF2YWlsYWJsZS4gVGhlc2UgYXJlIGFsc28gY2FsbGVkIGRpcmVjdGx5IHdpdGggdGhlIHN0YXRlIG9mIHRoZSBOb2RlU2VyaXZjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gLSBDYWxsZWQgd2l0aCB0cnVlIHdoZW4gdGhlcmUgYXJlIG5vIG5vZGVzIHVuYXZhaWxhYmxlIGFuZCBmYWxzZSB3aGVuIHRoZXJlIGFyZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5vbihwYXJlbnRDb250ZXh0LmRiLCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGVub3VnaCwgdGhlIHJlZ2lvbnMgd2lsbCBiZSBjbGVhbmVkIHVwIGluIE5vZGVTZXJ2aWNlLlxyXG4gICAgICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZuKGZhbHNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLm9uKHBhcmVudENvbnRleHQuZGIsICdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgZW5vdWdoLCB0aGUgcmVnaW9ucyBzaG91bGQgYmUgY2xlYW5lZCB1cCBpbiBOb2RlU2VydmljZS5cclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZuKHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ0NvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5sb2dDb250ZXh0KGNvbnRleHQpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgcmVxdWlyZSwgYW5ndWxhciAqL1xyXG4vKipcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycsIFsnZ21lLnNlcnZpY2VzJ10pO1xyXG5yZXF1aXJlKCcuL0ZpbGVTZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vV29ya3NwYWNlU2VydmljZScpO1xyXG5yZXF1aXJlKCcuL0NvbXBvbmVudFNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9EZXNpZ25TZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vVGVzdEJlbmNoU2VydmljZScpOyJdfQ==
