(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 */
// External dependencies
require('../../bower_components/ng-file-upload/angular-file-upload-shim');
require('../../bower_components/ng-file-upload/angular-file-upload');

// Internal dependencies
require('./services/cyphy-services');

angular.module('cyphy.components', ['cyphy.services', 'cyphy.components.templates', 'angularFileUpload']);

require('./WorkspaceList/WorkspaceList');
require('./ComponentDetails/ComponentDetails');
require('./ComponentList/ComponentList');
require('./DesignList/DesignList');
require('./DesignTree/DesignTree');
require('./TestBenchList/TestBenchList');


},{"../../bower_components/ng-file-upload/angular-file-upload":3,"../../bower_components/ng-file-upload/angular-file-upload-shim":2,"./ComponentDetails/ComponentDetails":4,"./ComponentList/ComponentList":5,"./DesignList/DesignList":6,"./DesignTree/DesignTree":7,"./TestBenchList/TestBenchList":8,"./WorkspaceList/WorkspaceList":9,"./services/cyphy-services":15}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('ComponentListController', function ($scope, ComponentService) {
        'use strict';
        var self = this,
            items = [],
            componentItems = {},
            serviceData2ComponentItem,
            addDomainWatcher,
            config,
            context;

        console.log('ComponentListController');

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
                                iconClass: 'glyphicon glyphicon-edit'
                            },
                            {
                                id: 'exportAsXME',
                                label: 'Export as XME',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: { id: item.id },
                                action: function (data) {
                                    console.log(data);
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

        $scope.listData = {
            items: items,
            connectionId: $scope.connectionId // FIXME: This is probably not the right way to do it..
        };

        $scope.config = config;

        serviceData2ComponentItem = function (data) {
            var componentItem;

            if (componentItems.hasOwnProperty(data.id)) {
                componentItem = componentItems[data.id];
                componentItem.name = data.name;
                componentItem.description = data.description;
            } else {
                componentItem = {
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
                            toolTip: 'Domain Models (not final)',
                            iconClass: 'glyphicon glyphicon-tint'
                        }
                    ],
                    details    : 'Content',
                    detailsTemplateUrl: 'details.html'
                };

                componentItems[componentItem.id] = componentItem;
                items.push(componentItem);
            }
        };

        addDomainWatcher = function (componentId) {
            debugger;
            ComponentService.watchComponentDomains(context, componentId, function (updateData) {
                //TODO: Implement the updating functionality.
            })
                .then(function (data) {
                    debugger;
                    var componentData = componentItems[componentId],
                        key;
                    if (componentData) {
                        for (key in data.domainModels) {
                            if (data.domainModels.hasOwnProperty(key)) {
                                componentData.stats[0].value += 1;
                            }
                        }
                    }
                });
        };

        ComponentService.registerWatcher(context, function (destroyed) {
            items = [];
            $scope.listData.items = items;
            componentItems = {};

            if (destroyed) {
                console.info('destroy event raised');
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
                    //debugger;
                    for (componentId in data.components) {
                        if (data.components.hasOwnProperty(componentId)) {
                            serviceData2ComponentItem(data.components[componentId]);
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
/*globals angular, console, document*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('WorkspaceListController', function ($scope, WorkspaceService, FileService) {
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
                                disabled: true,
                                iconClass: 'glyphicon glyphicon-pencil'
                            },
                            {
                                id: 'exportAsXME',
                                label: 'Export as XME',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: { id: item.id },
                                action: function (data) {
                                    console.log(data);
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

},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{"./ComponentService":10,"./DesignService":11,"./FileService":12,"./TestBenchService":13,"./WorkspaceService":14}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxHSVRcXHdlYmdtZS1jeXBoeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCIuL3NyYy9saWJyYXJ5L2N5cGh5LWNvbXBvbmVudHMuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0NvbXBvbmVudERldGFpbHMvQ29tcG9uZW50RGV0YWlscy5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9EZXNpZ25MaXN0L0Rlc2lnbkxpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0Rlc2lnblRyZWUvRGVzaWduVHJlZS5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Xb3Jrc3BhY2VMaXN0L1dvcmtzcGFjZUxpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0NvbXBvbmVudFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Rlc2lnblNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0ZpbGVTZXJ2aWNlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9UZXN0QmVuY2hTZXJ2aWNlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9Xb3Jrc3BhY2VTZXJ2aWNlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9jeXBoeS1zZXJ2aWNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgcmVxdWlyZSwgYW5ndWxhciAqL1xyXG4vKipcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuLy8gRXh0ZXJuYWwgZGVwZW5kZW5jaWVzXHJcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltJyk7XHJcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZCcpO1xyXG5cclxuLy8gSW50ZXJuYWwgZGVwZW5kZW5jaWVzXHJcbnJlcXVpcmUoJy4vc2VydmljZXMvY3lwaHktc2VydmljZXMnKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJywgWydjeXBoeS5zZXJ2aWNlcycsICdjeXBoeS5jb21wb25lbnRzLnRlbXBsYXRlcycsICdhbmd1bGFyRmlsZVVwbG9hZCddKTtcclxuXHJcbnJlcXVpcmUoJy4vV29ya3NwYWNlTGlzdC9Xb3Jrc3BhY2VMaXN0Jyk7XHJcbnJlcXVpcmUoJy4vQ29tcG9uZW50RGV0YWlscy9Db21wb25lbnREZXRhaWxzJyk7XHJcbnJlcXVpcmUoJy4vQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0Jyk7XHJcbnJlcXVpcmUoJy4vRGVzaWduTGlzdC9EZXNpZ25MaXN0Jyk7XHJcbnJlcXVpcmUoJy4vRGVzaWduVHJlZS9EZXNpZ25UcmVlJyk7XHJcbnJlcXVpcmUoJy4vVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hMaXN0Jyk7XHJcblxyXG4iLCIvKiohXG4gKiBBbmd1bGFySlMgZmlsZSB1cGxvYWQgc2hpbSBmb3IgSFRNTDUgRm9ybURhdGFcbiAqIEBhdXRob3IgIERhbmlhbCAgPGRhbmlhbC5mYXJpZEBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAxLjYuMTJcbiAqL1xuKGZ1bmN0aW9uKCkge1xuXG52YXIgaGFzRmxhc2ggPSBmdW5jdGlvbigpIHtcblx0dHJ5IHtcblx0ICB2YXIgZm8gPSBuZXcgQWN0aXZlWE9iamVjdCgnU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2gnKTtcblx0ICBpZiAoZm8pIHJldHVybiB0cnVlO1xuXHR9IGNhdGNoKGUpIHtcblx0ICBpZiAobmF2aWdhdG9yLm1pbWVUeXBlc1snYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnXSAhPSB1bmRlZmluZWQpIHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxudmFyIHBhdGNoWEhSID0gZnVuY3Rpb24oZm5OYW1lLCBuZXdGbikge1xuXHR3aW5kb3cuWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlW2ZuTmFtZV0gPSBuZXdGbih3aW5kb3cuWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlW2ZuTmFtZV0pO1xufTtcblxuaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuXHRpZiAod2luZG93LkZvcm1EYXRhICYmICghd2luZG93LkZpbGVBUEkgfHwgIUZpbGVBUEkuZm9yY2VMb2FkKSkge1xuXHRcdC8vIGFsbG93IGFjY2VzcyB0byBBbmd1bGFyIFhIUiBwcml2YXRlIGZpZWxkOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2lzc3Vlcy8xOTM0XG5cdFx0cGF0Y2hYSFIoJ3NldFJlcXVlc3RIZWFkZXInLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oaGVhZGVyLCB2YWx1ZSkge1xuXHRcdFx0XHRpZiAoaGVhZGVyID09PSAnX19zZXRYSFJfJykge1xuXHRcdFx0XHRcdHZhciB2YWwgPSB2YWx1ZSh0aGlzKTtcblx0XHRcdFx0XHQvLyBmaXggZm9yIGFuZ3VsYXIgPCAxLjIuMFxuXHRcdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuXHRcdFx0XHRcdFx0dmFsKHRoaXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgaW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyID0gZnVuY3Rpb24oeGhyKSB7XG5cdFx0XHRpZiAoIXhoci5fX2xpc3RlbmVycykge1xuXHRcdFx0XHRpZiAoIXhoci51cGxvYWQpIHhoci51cGxvYWQgPSB7fTtcblx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzID0gW107XG5cdFx0XHRcdHZhciBvcmlnQWRkRXZlbnRMaXN0ZW5lciA9IHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcjtcblx0XHRcdFx0eGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odCwgZm4sIGIpIHtcblx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbdF0gPSBmbjtcblx0XHRcdFx0XHRvcmlnQWRkRXZlbnRMaXN0ZW5lciAmJiBvcmlnQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRwYXRjaFhIUignb3BlbicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihtLCB1cmwsIGIpIHtcblx0XHRcdFx0aW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyKHRoaXMpO1xuXHRcdFx0XHR0aGlzLl9fdXJsID0gdXJsO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgW20sIHVybCwgYl0pO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0aWYgKGUubWVzc2FnZS5pbmRleE9mKCdBY2Nlc3MgaXMgZGVuaWVkJykgPiAtMSkge1xuXHRcdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBbbSwgJ19maXhfZm9yX2llX2Nyb3NzZG9tYWluX18nLCBiXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignZ2V0UmVzcG9uc2VIZWFkZXInLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oaCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX2ZpbGVBcGlYSFIgJiYgdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0UmVzcG9uc2VIZWFkZXIgPyB0aGlzLl9fZmlsZUFwaVhIUi5nZXRSZXNwb25zZUhlYWRlcihoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzLCBbaF0pKTtcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX2ZpbGVBcGlYSFIgJiYgdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID8gdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgOiAob3JpZyA9PSBudWxsID8gbnVsbCA6IG9yaWcuYXBwbHkodGhpcykpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ2Fib3J0JywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX2ZpbGVBcGlYSFIgJiYgdGhpcy5fX2ZpbGVBcGlYSFIuYWJvcnQgPyB0aGlzLl9fZmlsZUFwaVhIUi5hYm9ydCgpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdzZXRSZXF1ZXN0SGVhZGVyJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcblx0XHRcdFx0aWYgKGhlYWRlciA9PT0gJ19fc2V0WEhSXycpIHtcblx0XHRcdFx0XHRpbml0aWFsaXplVXBsb2FkTGlzdGVuZXIodGhpcyk7XG5cdFx0XHRcdFx0dmFyIHZhbCA9IHZhbHVlKHRoaXMpO1xuXHRcdFx0XHRcdC8vIGZpeCBmb3IgYW5ndWxhciA8IDEuMi4wXG5cdFx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHR2YWwodGhpcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuX19yZXF1ZXN0SGVhZGVycyA9IHRoaXMuX19yZXF1ZXN0SGVhZGVycyB8fCB7fTtcblx0XHRcdFx0XHR0aGlzLl9fcmVxdWVzdEhlYWRlcnNbaGVhZGVyXSA9IHZhbHVlO1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ3NlbmQnLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB4aHIgPSB0aGlzO1xuXHRcdFx0XHRpZiAoYXJndW1lbnRzWzBdICYmIGFyZ3VtZW50c1swXS5fX2lzU2hpbSkge1xuXHRcdFx0XHRcdHZhciBmb3JtRGF0YSA9IGFyZ3VtZW50c1swXTtcblx0XHRcdFx0XHR2YXIgY29uZmlnID0ge1xuXHRcdFx0XHRcdFx0dXJsOiB4aHIuX191cmwsXG5cdFx0XHRcdFx0XHRqc29ucDogZmFsc2UsIC8vcmVtb3ZlcyB0aGUgY2FsbGJhY2sgZm9ybSBwYXJhbVxuXHRcdFx0XHRcdFx0Y2FjaGU6IHRydWUsIC8vcmVtb3ZlcyB0aGUgP2ZpbGVhcGlYWFggaW4gdGhlIHVybFxuXHRcdFx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKGVyciwgZmlsZUFwaVhIUikge1xuXHRcdFx0XHRcdFx0XHR4aHIuX19jb21wbGV0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRpZiAoIWVyciAmJiB4aHIuX19saXN0ZW5lcnNbJ2xvYWQnXSkgXG5cdFx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydsb2FkJ10oe3R5cGU6ICdsb2FkJywgbG9hZGVkOiB4aHIuX19sb2FkZWQsIHRvdGFsOiB4aHIuX190b3RhbCwgdGFyZ2V0OiB4aHIsIGxlbmd0aENvbXB1dGFibGU6IHRydWV9KTtcblx0XHRcdFx0XHRcdFx0aWYgKCFlcnIgJiYgeGhyLl9fbGlzdGVuZXJzWydsb2FkZW5kJ10pIFxuXHRcdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1snbG9hZGVuZCddKHt0eXBlOiAnbG9hZGVuZCcsIGxvYWRlZDogeGhyLl9fbG9hZGVkLCB0b3RhbDogeGhyLl9fdG90YWwsIHRhcmdldDogeGhyLCBsZW5ndGhDb21wdXRhYmxlOiB0cnVlfSk7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIgPT09ICdhYm9ydCcgJiYgeGhyLl9fbGlzdGVuZXJzWydhYm9ydCddKSBcblx0XHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ2Fib3J0J10oe3R5cGU6ICdhYm9ydCcsIGxvYWRlZDogeGhyLl9fbG9hZGVkLCB0b3RhbDogeGhyLl9fdG90YWwsIHRhcmdldDogeGhyLCBsZW5ndGhDb21wdXRhYmxlOiB0cnVlfSk7XG5cdFx0XHRcdFx0XHRcdGlmIChmaWxlQXBpWEhSLnN0YXR1cyAhPT0gdW5kZWZpbmVkKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAnc3RhdHVzJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIChmaWxlQXBpWEhSLnN0YXR1cyA9PSAwICYmIGVyciAmJiBlcnIgIT09ICdhYm9ydCcpID8gNTAwIDogZmlsZUFwaVhIUi5zdGF0dXN9fSk7XG5cdFx0XHRcdFx0XHRcdGlmIChmaWxlQXBpWEhSLnN0YXR1c1RleHQgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3N0YXR1c1RleHQnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gZmlsZUFwaVhIUi5zdGF0dXNUZXh0fX0pO1xuXHRcdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVhZHlTdGF0ZScsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiA0fX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZmlsZUFwaVhIUi5yZXNwb25zZSAhPT0gdW5kZWZpbmVkKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVzcG9uc2UnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gZmlsZUFwaVhIUi5yZXNwb25zZX19KTtcblx0XHRcdFx0XHRcdFx0dmFyIHJlc3AgPSBmaWxlQXBpWEhSLnJlc3BvbnNlVGV4dCB8fCAoZXJyICYmIGZpbGVBcGlYSFIuc3RhdHVzID09IDAgJiYgZXJyICE9PSAnYWJvcnQnID8gZXJyIDogdW5kZWZpbmVkKTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3Jlc3BvbnNlVGV4dCcsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiByZXNwfX0pO1xuXHRcdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVzcG9uc2UnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gcmVzcH19KTtcblx0XHRcdFx0XHRcdFx0aWYgKGVycikgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ2VycicsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiBlcnJ9fSk7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2ZpbGVBcGlYSFIgPSBmaWxlQXBpWEhSO1xuXHRcdFx0XHRcdFx0XHRpZiAoeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSkgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSgpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGZpbGVwcm9ncmVzczogZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFx0XHRlLnRhcmdldCA9IHhocjtcblx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydwcm9ncmVzcyddICYmIHhoci5fX2xpc3RlbmVyc1sncHJvZ3Jlc3MnXShlKTtcblx0XHRcdFx0XHRcdFx0eGhyLl9fdG90YWwgPSBlLnRvdGFsO1xuXHRcdFx0XHRcdFx0XHR4aHIuX19sb2FkZWQgPSBlLmxvYWRlZDtcblx0XHRcdFx0XHRcdFx0aWYgKGUudG90YWwgPT09IGUubG9hZGVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gZml4IGZsYXNoIGlzc3VlIHRoYXQgZG9lc24ndCBjYWxsIGNvbXBsZXRlIGlmIHRoZXJlIGlzIG5vIHJlc3BvbnNlIHRleHQgZnJvbSB0aGUgc2VydmVyICBcblx0XHRcdFx0XHRcdFx0XHR2YXIgX3RoaXMgPSB0aGlzXG5cdFx0XHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICgheGhyLl9fY29tcGxldGVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMgPSBmdW5jdGlvbigpe307XG5cdFx0XHRcdFx0XHRcdFx0XHRcdF90aGlzLmNvbXBsZXRlKG51bGwsIHtzdGF0dXM6IDIwNCwgc3RhdHVzVGV4dDogJ05vIENvbnRlbnQnfSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSwgMTAwMDApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0aGVhZGVyczogeGhyLl9fcmVxdWVzdEhlYWRlcnNcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uZmlnLmRhdGEgPSB7fTtcblx0XHRcdFx0XHRjb25maWcuZmlsZXMgPSB7fVxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZm9ybURhdGEuZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGl0ZW0gPSBmb3JtRGF0YS5kYXRhW2ldO1xuXHRcdFx0XHRcdFx0aWYgKGl0ZW0udmFsICE9IG51bGwgJiYgaXRlbS52YWwubmFtZSAhPSBudWxsICYmIGl0ZW0udmFsLnNpemUgIT0gbnVsbCAmJiBpdGVtLnZhbC50eXBlICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Y29uZmlnLmZpbGVzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uZmlnLmRhdGFbaXRlbS5rZXldID0gaXRlbS52YWw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICghaGFzRmxhc2goKSkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyAnQWRvZGUgRmxhc2ggUGxheWVyIG5lZWQgdG8gYmUgaW5zdGFsbGVkLiBUbyBjaGVjayBhaGVhZCB1c2UgXCJGaWxlQVBJLmhhc0ZsYXNoXCInO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0eGhyLl9fZmlsZUFwaVhIUiA9IEZpbGVBUEkudXBsb2FkKGNvbmZpZyk7XG5cdFx0XHRcdFx0fSwgMSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh4aHIsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHR3aW5kb3cuWE1MSHR0cFJlcXVlc3QuX19pc1NoaW0gPSB0cnVlO1xufVxuXG5pZiAoIXdpbmRvdy5Gb3JtRGF0YSB8fCAod2luZG93LkZpbGVBUEkgJiYgRmlsZUFQSS5mb3JjZUxvYWQpKSB7XG5cdHZhciBhZGRGbGFzaCA9IGZ1bmN0aW9uKGVsZW0pIHtcblx0XHRpZiAoIWhhc0ZsYXNoKCkpIHtcblx0XHRcdHRocm93ICdBZG9kZSBGbGFzaCBQbGF5ZXIgbmVlZCB0byBiZSBpbnN0YWxsZWQuIFRvIGNoZWNrIGFoZWFkIHVzZSBcIkZpbGVBUEkuaGFzRmxhc2hcIic7XG5cdFx0fVxuXHRcdHZhciBlbCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtKTtcblx0XHRpZiAoIWVsLmF0dHIoJ2Rpc2FibGVkJykpIHtcblx0XHRcdGlmICghZWwuaGFzQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpICYmIChlbGVtLmdldEF0dHJpYnV0ZSgnbmctZmlsZS1zZWxlY3QnKSAhPSBudWxsIHx8IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLW5nLWZpbGUtc2VsZWN0JykgIT0gbnVsbCkpIHtcblx0XHRcdFx0aWYgKEZpbGVBUEkud3JhcEluc2lkZURpdikge1xuXHRcdFx0XHRcdHZhciB3cmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdFx0d3JhcC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImpzLWZpbGVhcGktd3JhcHBlclwiIHN0eWxlPVwicG9zaXRpb246cmVsYXRpdmU7IG92ZXJmbG93OmhpZGRlblwiPjwvZGl2Pic7XG5cdFx0XHRcdFx0d3JhcCA9IHdyYXAuZmlyc3RDaGlsZDtcblx0XHRcdFx0XHR2YXIgcGFyZW50ID0gZWxlbS5wYXJlbnROb2RlO1xuXHRcdFx0XHRcdHBhcmVudC5pbnNlcnRCZWZvcmUod3JhcCwgZWxlbSk7XG5cdFx0XHRcdFx0cGFyZW50LnJlbW92ZUNoaWxkKGVsZW0pO1xuXHRcdFx0XHRcdHdyYXAuYXBwZW5kQ2hpbGQoZWxlbSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZWwuYWRkQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpO1xuXHRcdFx0XHRcdGlmIChlbC5wYXJlbnQoKVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfKSB7XG5cdFx0XHRcdFx0XHRpZiAoZWwucGFyZW50KCkuY3NzKCdwb3NpdGlvbicpID09PSAnJyB8fCBlbC5wYXJlbnQoKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG5cdFx0XHRcdFx0XHRcdGVsLnBhcmVudCgpLmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsLmNzcygndG9wJywgMCkuY3NzKCdib3R0b20nLCAwKS5jc3MoJ2xlZnQnLCAwKS5jc3MoJ3JpZ2h0JywgMCkuY3NzKCd3aWR0aCcsICcxMDAlJykuY3NzKCdoZWlnaHQnLCAnMTAwJScpLlxuXHRcdFx0XHRcdFx0XHRjc3MoJ3BhZGRpbmcnLCAwKS5jc3MoJ21hcmdpbicsIDApO1xuXHRcdFx0XHRcdFx0ZWwucGFyZW50KCkudW5iaW5kKCdjbGljaycsIGVsLnBhcmVudCgpWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0dmFyIGNoYW5nZUZuV3JhcHBlciA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIGZpbGVzID0gRmlsZUFQSS5nZXRGaWxlcyhldnQpO1xuXHRcdFx0Ly9qdXN0IGEgZG91YmxlIGNoZWNrIGZvciAjMjMzXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChmaWxlc1tpXS5zaXplID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLnNpemUgPSAwO1xuXHRcdFx0XHRpZiAoZmlsZXNbaV0ubmFtZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS5uYW1lID0gJ2ZpbGUnO1xuXHRcdFx0XHRpZiAoZmlsZXNbaV0udHlwZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS50eXBlID0gJ3VuZGVmaW5lZCc7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIWV2dC50YXJnZXQpIHtcblx0XHRcdFx0ZXZ0LnRhcmdldCA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0ZXZ0LnRhcmdldC5maWxlcyA9IGZpbGVzO1xuXHRcdFx0Ly8gaWYgZXZ0LnRhcmdldC5maWxlcyBpcyBub3Qgd3JpdGFibGUgdXNlIGhlbHBlciBmaWVsZFxuXHRcdFx0aWYgKGV2dC50YXJnZXQuZmlsZXMgIT0gZmlsZXMpIHtcblx0XHRcdFx0ZXZ0Ll9fZmlsZXNfID0gZmlsZXM7XG5cdFx0XHR9XG5cdFx0XHQoZXZ0Ll9fZmlsZXNfIHx8IGV2dC50YXJnZXQuZmlsZXMpLml0ZW0gPSBmdW5jdGlvbihpKSB7XG5cdFx0XHRcdHJldHVybiAoZXZ0Ll9fZmlsZXNfIHx8IGV2dC50YXJnZXQuZmlsZXMpW2ldIHx8IG51bGw7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZm4pIGZuLmFwcGx5KHRoaXMsIFtldnRdKTtcblx0XHR9O1xuXHR9O1xuXHR2YXIgaXNGaWxlQ2hhbmdlID0gZnVuY3Rpb24oZWxlbSwgZSkge1xuXHRcdHJldHVybiAoZS50b0xvd2VyQ2FzZSgpID09PSAnY2hhbmdlJyB8fCBlLnRvTG93ZXJDYXNlKCkgPT09ICdvbmNoYW5nZScpICYmIGVsZW0uZ2V0QXR0cmlidXRlKCd0eXBlJykgPT0gJ2ZpbGUnO1xuXHR9XG5cdGlmIChIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyKSB7XG5cdFx0SFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IChmdW5jdGlvbihvcmlnQWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGUsIGZuLCBiLCBkKSB7XG5cdFx0XHRcdGlmIChpc0ZpbGVDaGFuZ2UodGhpcywgZSkpIHtcblx0XHRcdFx0XHRhZGRGbGFzaCh0aGlzKTtcblx0XHRcdFx0XHRvcmlnQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBbZSwgY2hhbmdlRm5XcmFwcGVyKGZuKSwgYiwgZF0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWdBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIFtlLCBmbiwgYiwgZF0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcik7XG5cdH1cblx0aWYgKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmF0dGFjaEV2ZW50KSB7XG5cdFx0SFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYXR0YWNoRXZlbnQgPSAoZnVuY3Rpb24ob3JpZ0F0dGFjaEV2ZW50KSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oZSwgZm4pIHtcblx0XHRcdFx0aWYgKGlzRmlsZUNoYW5nZSh0aGlzLCBlKSkge1xuXHRcdFx0XHRcdGFkZEZsYXNoKHRoaXMpO1xuXHRcdFx0XHRcdGlmICh3aW5kb3cualF1ZXJ5KSB7XG5cdFx0XHRcdFx0XHQvLyBmaXggZm9yICMyODEgalF1ZXJ5IG9uIElFOFxuXHRcdFx0XHRcdFx0YW5ndWxhci5lbGVtZW50KHRoaXMpLmJpbmQoJ2NoYW5nZScsIGNoYW5nZUZuV3JhcHBlcihudWxsKSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9yaWdBdHRhY2hFdmVudC5hcHBseSh0aGlzLCBbZSwgY2hhbmdlRm5XcmFwcGVyKGZuKV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnQXR0YWNoRXZlbnQuYXBwbHkodGhpcywgW2UsIGZuXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KShIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hdHRhY2hFdmVudCk7XG5cdH1cblxuXHR3aW5kb3cuRm9ybURhdGEgPSBGb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRhcHBlbmQ6IGZ1bmN0aW9uKGtleSwgdmFsLCBuYW1lKSB7XG5cdFx0XHRcdHRoaXMuZGF0YS5wdXNoKHtcblx0XHRcdFx0XHRrZXk6IGtleSxcblx0XHRcdFx0XHR2YWw6IHZhbCxcblx0XHRcdFx0XHRuYW1lOiBuYW1lXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdGRhdGE6IFtdLFxuXHRcdFx0X19pc1NoaW06IHRydWVcblx0XHR9O1xuXHR9O1xuXG5cdChmdW5jdGlvbiAoKSB7XG5cdFx0Ly9sb2FkIEZpbGVBUElcblx0XHRpZiAoIXdpbmRvdy5GaWxlQVBJKSB7XG5cdFx0XHR3aW5kb3cuRmlsZUFQSSA9IHt9O1xuXHRcdH1cblx0XHRpZiAoRmlsZUFQSS5mb3JjZUxvYWQpIHtcblx0XHRcdEZpbGVBUEkuaHRtbDUgPSBmYWxzZTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKCFGaWxlQVBJLnVwbG9hZCkge1xuXHRcdFx0dmFyIGpzVXJsLCBiYXNlUGF0aCwgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JyksIGFsbFNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JyksIGksIGluZGV4LCBzcmM7XG5cdFx0XHRpZiAod2luZG93LkZpbGVBUEkuanNVcmwpIHtcblx0XHRcdFx0anNVcmwgPSB3aW5kb3cuRmlsZUFQSS5qc1VybDtcblx0XHRcdH0gZWxzZSBpZiAod2luZG93LkZpbGVBUEkuanNQYXRoKSB7XG5cdFx0XHRcdGJhc2VQYXRoID0gd2luZG93LkZpbGVBUEkuanNQYXRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGFsbFNjcmlwdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRzcmMgPSBhbGxTY3JpcHRzW2ldLnNyYztcblx0XHRcdFx0XHRpbmRleCA9IHNyYy5pbmRleE9mKCdhbmd1bGFyLWZpbGUtdXBsb2FkLXNoaW0uanMnKVxuXHRcdFx0XHRcdGlmIChpbmRleCA9PSAtMSkge1xuXHRcdFx0XHRcdFx0aW5kZXggPSBzcmMuaW5kZXhPZignYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLm1pbi5qcycpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0XHRcdFx0YmFzZVBhdGggPSBzcmMuc3Vic3RyaW5nKDAsIGluZGV4KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoRmlsZUFQSS5zdGF0aWNQYXRoID09IG51bGwpIEZpbGVBUEkuc3RhdGljUGF0aCA9IGJhc2VQYXRoO1xuXHRcdFx0c2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywganNVcmwgfHwgYmFzZVBhdGggKyAnRmlsZUFQSS5taW4uanMnKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblx0XHRcdEZpbGVBUEkuaGFzRmxhc2ggPSBoYXNGbGFzaCgpO1xuXHRcdH1cblx0fSkoKTtcblx0RmlsZUFQSS5kaXNhYmxlRmlsZUlucHV0ID0gZnVuY3Rpb24oZWxlbSwgZGlzYWJsZSkge1xuXHRcdGlmIChkaXNhYmxlKSB7XG5cdFx0XHRlbGVtLnJlbW92ZUNsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbGVtLmFkZENsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKTtcblx0XHR9XG5cdH1cbn1cblxuXG5pZiAoIXdpbmRvdy5GaWxlUmVhZGVyKSB7XG5cdHdpbmRvdy5GaWxlUmVhZGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcywgbG9hZFN0YXJ0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLmxpc3RlbmVycyA9IHt9O1xuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGZuKSB7XG5cdFx0XHRfdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSBfdGhpcy5saXN0ZW5lcnNbdHlwZV0gfHwgW107XG5cdFx0XHRfdGhpcy5saXN0ZW5lcnNbdHlwZV0ucHVzaChmbik7XG5cdFx0fTtcblx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBmbikge1xuXHRcdFx0X3RoaXMubGlzdGVuZXJzW3R5cGVdICYmIF90aGlzLmxpc3RlbmVyc1t0eXBlXS5zcGxpY2UoX3RoaXMubGlzdGVuZXJzW3R5cGVdLmluZGV4T2YoZm4pLCAxKTtcblx0XHR9O1xuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIGxpc3QgPSBfdGhpcy5saXN0ZW5lcnNbZXZ0LnR5cGVdO1xuXHRcdFx0aWYgKGxpc3QpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bGlzdFtpXS5jYWxsKF90aGlzLCBldnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLm9uYWJvcnQgPSB0aGlzLm9uZXJyb3IgPSB0aGlzLm9ubG9hZCA9IHRoaXMub25sb2Fkc3RhcnQgPSB0aGlzLm9ubG9hZGVuZCA9IHRoaXMub25wcm9ncmVzcyA9IG51bGw7XG5cblx0XHR2YXIgY29uc3RydWN0RXZlbnQgPSBmdW5jdGlvbih0eXBlLCBldnQpIHtcblx0XHRcdHZhciBlID0ge3R5cGU6IHR5cGUsIHRhcmdldDogX3RoaXMsIGxvYWRlZDogZXZ0LmxvYWRlZCwgdG90YWw6IGV2dC50b3RhbCwgZXJyb3I6IGV2dC5lcnJvcn07XG5cdFx0XHRpZiAoZXZ0LnJlc3VsdCAhPSBudWxsKSBlLnRhcmdldC5yZXN1bHQgPSBldnQucmVzdWx0O1xuXHRcdFx0cmV0dXJuIGU7XG5cdFx0fTtcblx0XHR2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbihldnQpIHtcblx0XHRcdGlmICghbG9hZFN0YXJ0ZWQpIHtcblx0XHRcdFx0bG9hZFN0YXJ0ZWQgPSB0cnVlO1xuXHRcdFx0XHRfdGhpcy5vbmxvYWRzdGFydCAmJiB0aGlzLm9ubG9hZHN0YXJ0KGNvbnN0cnVjdEV2ZW50KCdsb2Fkc3RhcnQnLCBldnQpKTtcblx0XHRcdH1cblx0XHRcdGlmIChldnQudHlwZSA9PT0gJ2xvYWQnKSB7XG5cdFx0XHRcdF90aGlzLm9ubG9hZGVuZCAmJiBfdGhpcy5vbmxvYWRlbmQoY29uc3RydWN0RXZlbnQoJ2xvYWRlbmQnLCBldnQpKTtcblx0XHRcdFx0dmFyIGUgPSBjb25zdHJ1Y3RFdmVudCgnbG9hZCcsIGV2dCk7XG5cdFx0XHRcdF90aGlzLm9ubG9hZCAmJiBfdGhpcy5vbmxvYWQoZSk7XG5cdFx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG5cdFx0XHR9IGVsc2UgaWYgKGV2dC50eXBlID09PSAncHJvZ3Jlc3MnKSB7XG5cdFx0XHRcdHZhciBlID0gY29uc3RydWN0RXZlbnQoJ3Byb2dyZXNzJywgZXZ0KTtcblx0XHRcdFx0X3RoaXMub25wcm9ncmVzcyAmJiBfdGhpcy5vbnByb2dyZXNzKGUpO1xuXHRcdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGUgPSBjb25zdHJ1Y3RFdmVudCgnZXJyb3InLCBldnQpO1xuXHRcdFx0XHRfdGhpcy5vbmVycm9yICYmIF90aGlzLm9uZXJyb3IoZSk7XG5cdFx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLnJlYWRBc0FycmF5QnVmZmVyID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNCaW5hcnlTdHJpbmcoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0XHR0aGlzLnJlYWRBc0JpbmFyeVN0cmluZyA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzQmluYXJ5U3RyaW5nKGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdFx0dGhpcy5yZWFkQXNEYXRhVVJMID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNEYXRhVVJMKGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdFx0dGhpcy5yZWFkQXNUZXh0ID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNUZXh0KGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdH1cbn1cblxufSkoKTtcbiIsIi8qKiFcbiAqIEFuZ3VsYXJKUyBmaWxlIHVwbG9hZC9kcm9wIGRpcmVjdGl2ZSB3aXRoIGh0dHAgcG9zdCBhbmQgcHJvZ3Jlc3NcbiAqIEBhdXRob3IgIERhbmlhbCAgPGRhbmlhbC5mYXJpZEBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAxLjYuMTJcbiAqL1xuKGZ1bmN0aW9uKCkge1xuXG52YXIgYW5ndWxhckZpbGVVcGxvYWQgPSBhbmd1bGFyLm1vZHVsZSgnYW5ndWxhckZpbGVVcGxvYWQnLCBbXSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLnNlcnZpY2UoJyR1cGxvYWQnLCBbJyRodHRwJywgJyRxJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJGh0dHAsICRxLCAkdGltZW91dCkge1xuXHRmdW5jdGlvbiBzZW5kSHR0cChjb25maWcpIHtcblx0XHRjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZCB8fCAnUE9TVCc7XG5cdFx0Y29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblx0XHRjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0IHx8IGZ1bmN0aW9uKGRhdGEsIGhlYWRlcnNHZXR0ZXIpIHtcblx0XHRcdGlmICh3aW5kb3cuQXJyYXlCdWZmZXIgJiYgZGF0YSBpbnN0YW5jZW9mIHdpbmRvdy5BcnJheUJ1ZmZlcikge1xuXHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAkaHR0cC5kZWZhdWx0cy50cmFuc2Zvcm1SZXF1ZXN0WzBdKGRhdGEsIGhlYWRlcnNHZXR0ZXIpO1xuXHRcdH07XG5cdFx0dmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuXHRcdGlmICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QuX19pc1NoaW0pIHtcblx0XHRcdGNvbmZpZy5oZWFkZXJzWydfX3NldFhIUl8nXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oeGhyKSB7XG5cdFx0XHRcdFx0aWYgKCF4aHIpIHJldHVybjtcblx0XHRcdFx0XHRjb25maWcuX19YSFIgPSB4aHI7XG5cdFx0XHRcdFx0Y29uZmlnLnhockZuICYmIGNvbmZpZy54aHJGbih4aHIpO1xuXHRcdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XHRkZWZlcnJlZC5ub3RpZnkoZSk7XG5cdFx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHRcdC8vZml4IGZvciBmaXJlZm94IG5vdCBmaXJpbmcgdXBsb2FkIHByb2dyZXNzIGVuZCwgYWxzbyBJRTgtOVxuXHRcdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdGlmIChlLmxlbmd0aENvbXB1dGFibGUpIHtcblx0XHRcdFx0XHRcdFx0ZGVmZXJyZWQubm90aWZ5KGUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdFx0fTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0JGh0dHAoY29uZmlnKS50aGVuKGZ1bmN0aW9uKHIpe2RlZmVycmVkLnJlc29sdmUocil9LCBmdW5jdGlvbihlKXtkZWZlcnJlZC5yZWplY3QoZSl9LCBmdW5jdGlvbihuKXtkZWZlcnJlZC5ub3RpZnkobil9KTtcblx0XHRcblx0XHR2YXIgcHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2U7XG5cdFx0cHJvbWlzZS5zdWNjZXNzID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRmbihyZXNwb25zZS5kYXRhLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlLmhlYWRlcnMsIGNvbmZpZyk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cblx0XHRwcm9taXNlLmVycm9yID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdHByb21pc2UudGhlbihudWxsLCBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRmbihyZXNwb25zZS5kYXRhLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlLmhlYWRlcnMsIGNvbmZpZyk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cblx0XHRwcm9taXNlLnByb2dyZXNzID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdHByb21pc2UudGhlbihudWxsLCBudWxsLCBmdW5jdGlvbih1cGRhdGUpIHtcblx0XHRcdFx0Zm4odXBkYXRlKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblx0XHRwcm9taXNlLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoY29uZmlnLl9fWEhSKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGNvbmZpZy5fX1hIUi5hYm9ydCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cdFx0cHJvbWlzZS54aHIgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0Y29uZmlnLnhockZuID0gKGZ1bmN0aW9uKG9yaWdYaHJGbikge1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0b3JpZ1hockZuICYmIG9yaWdYaHJGbi5hcHBseShwcm9taXNlLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdGZuLmFwcGx5KHByb21pc2UsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKGNvbmZpZy54aHJGbik7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXHRcdFxuXHRcdHJldHVybiBwcm9taXNlO1xuXHR9XG5cblx0dGhpcy51cGxvYWQgPSBmdW5jdGlvbihjb25maWcpIHtcblx0XHRjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXHRcdGNvbmZpZy5oZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHVuZGVmaW5lZDtcblx0XHRjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0IHx8ICRodHRwLmRlZmF1bHRzLnRyYW5zZm9ybVJlcXVlc3Q7XG5cdFx0dmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0dmFyIG9yaWdUcmFuc2Zvcm1SZXF1ZXN0ID0gY29uZmlnLnRyYW5zZm9ybVJlcXVlc3Q7XG5cdFx0dmFyIG9yaWdEYXRhID0gY29uZmlnLmRhdGE7XG5cdFx0Y29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgPSBmdW5jdGlvbihmb3JtRGF0YSwgaGVhZGVyR2V0dGVyKSB7XG5cdFx0XHRpZiAob3JpZ0RhdGEpIHtcblx0XHRcdFx0aWYgKGNvbmZpZy5mb3JtRGF0YUFwcGVuZGVyKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9yaWdEYXRhKSB7XG5cdFx0XHRcdFx0XHR2YXIgdmFsID0gb3JpZ0RhdGFba2V5XTtcblx0XHRcdFx0XHRcdGNvbmZpZy5mb3JtRGF0YUFwcGVuZGVyKGZvcm1EYXRhLCBrZXksIHZhbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBvcmlnRGF0YSkge1xuXHRcdFx0XHRcdFx0dmFyIHZhbCA9IG9yaWdEYXRhW2tleV07XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9yaWdUcmFuc2Zvcm1SZXF1ZXN0ID09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0dmFsID0gb3JpZ1RyYW5zZm9ybVJlcXVlc3QodmFsLCBoZWFkZXJHZXR0ZXIpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvcmlnVHJhbnNmb3JtUmVxdWVzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdHZhciB0cmFuc2Zvcm1GbiA9IG9yaWdUcmFuc2Zvcm1SZXF1ZXN0W2ldO1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdHJhbnNmb3JtRm4gPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFsID0gdHJhbnNmb3JtRm4odmFsLCBoZWFkZXJHZXR0ZXIpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGtleSwgdmFsKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbmZpZy5maWxlICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIGZpbGVGb3JtTmFtZSA9IGNvbmZpZy5maWxlRm9ybURhdGFOYW1lIHx8ICdmaWxlJztcblxuXHRcdFx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGNvbmZpZy5maWxlKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuXHRcdFx0XHRcdHZhciBpc0ZpbGVGb3JtTmFtZVN0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChmaWxlRm9ybU5hbWUpID09PSAnW29iamVjdCBTdHJpbmddJztcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNvbmZpZy5maWxlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRmb3JtRGF0YS5hcHBlbmQoaXNGaWxlRm9ybU5hbWVTdHJpbmcgPyBmaWxlRm9ybU5hbWUgOiBmaWxlRm9ybU5hbWVbaV0sIGNvbmZpZy5maWxlW2ldLCBcblx0XHRcdFx0XHRcdFx0XHQoY29uZmlnLmZpbGVOYW1lICYmIGNvbmZpZy5maWxlTmFtZVtpXSkgfHwgY29uZmlnLmZpbGVbaV0ubmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChmaWxlRm9ybU5hbWUsIGNvbmZpZy5maWxlLCBjb25maWcuZmlsZU5hbWUgfHwgY29uZmlnLmZpbGUubmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmb3JtRGF0YTtcblx0XHR9O1xuXG5cdFx0Y29uZmlnLmRhdGEgPSBmb3JtRGF0YTtcblxuXHRcdHJldHVybiBzZW5kSHR0cChjb25maWcpO1xuXHR9O1xuXG5cdHRoaXMuaHR0cCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdHJldHVybiBzZW5kSHR0cChjb25maWcpO1xuXHR9XG59XSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdGaWxlU2VsZWN0JywgWyAnJHBhcnNlJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJHBhcnNlLCAkdGltZW91dCkge1xuXHRyZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHIpIHtcblx0XHR2YXIgZm4gPSAkcGFyc2UoYXR0clsnbmdGaWxlU2VsZWN0J10pO1xuXHRcdGlmIChlbGVtWzBdLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2lucHV0JyB8fCAoZWxlbS5hdHRyKCd0eXBlJykgJiYgZWxlbS5hdHRyKCd0eXBlJykudG9Mb3dlckNhc2UoKSkgIT09ICdmaWxlJykge1xuXHRcdFx0dmFyIGZpbGVFbGVtID0gYW5ndWxhci5lbGVtZW50KCc8aW5wdXQgdHlwZT1cImZpbGVcIj4nKVxuXHRcdFx0dmFyIGF0dHJzID0gZWxlbVswXS5hdHRyaWJ1dGVzO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoYXR0cnNbaV0ubmFtZS50b0xvd2VyQ2FzZSgpICE9PSAndHlwZScpIHtcblx0XHRcdFx0XHRmaWxlRWxlbS5hdHRyKGF0dHJzW2ldLm5hbWUsIGF0dHJzW2ldLnZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGF0dHJbXCJtdWx0aXBsZVwiXSkgZmlsZUVsZW0uYXR0cihcIm11bHRpcGxlXCIsIFwidHJ1ZVwiKTtcblx0XHRcdGZpbGVFbGVtLmNzcyhcIndpZHRoXCIsIFwiMXB4XCIpLmNzcyhcImhlaWdodFwiLCBcIjFweFwiKS5jc3MoXCJvcGFjaXR5XCIsIDApLmNzcyhcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIikuY3NzKCdmaWx0ZXInLCAnYWxwaGEob3BhY2l0eT0wKScpXG5cdFx0XHRcdFx0LmNzcyhcInBhZGRpbmdcIiwgMCkuY3NzKFwibWFyZ2luXCIsIDApLmNzcyhcIm92ZXJmbG93XCIsIFwiaGlkZGVuXCIpO1xuXHRcdFx0ZmlsZUVsZW0uYXR0cignX193cmFwcGVyX2Zvcl9wYXJlbnRfJywgdHJ1ZSk7XG5cbi8vXHRcdFx0ZmlsZUVsZW0uY3NzKFwidG9wXCIsIDApLmNzcyhcImJvdHRvbVwiLCAwKS5jc3MoXCJsZWZ0XCIsIDApLmNzcyhcInJpZ2h0XCIsIDApLmNzcyhcIndpZHRoXCIsIFwiMTAwJVwiKS5cbi8vXHRcdFx0XHRcdGNzcyhcIm9wYWNpdHlcIiwgMCkuY3NzKFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiKS5jc3MoJ2ZpbHRlcicsICdhbHBoYShvcGFjaXR5PTApJykuY3NzKFwicGFkZGluZ1wiLCAwKS5jc3MoXCJtYXJnaW5cIiwgMCk7XG5cdFx0XHRlbGVtLmFwcGVuZChmaWxlRWxlbSk7XG5cdFx0XHRlbGVtWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8gID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZpbGVFbGVtWzBdLmNsaWNrKCk7XG5cdFx0XHR9OyBcblx0XHRcdGVsZW0uYmluZCgnY2xpY2snLCBlbGVtWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8pO1xuXHRcdFx0ZWxlbS5jc3MoXCJvdmVyZmxvd1wiLCBcImhpZGRlblwiKTtcbi8vXHRcdFx0aWYgKGZpbGVFbGVtLnBhcmVudCgpWzBdICE9IGVsZW1bMF0pIHtcbi8vXHRcdFx0XHQvL2ZpeCAjMjk4IGJ1dHRvbiBlbGVtZW50XG4vL1x0XHRcdFx0ZWxlbS53cmFwKCc8c3Bhbj4nKTtcbi8vXHRcdFx0XHRlbGVtLmNzcyhcInotaW5kZXhcIiwgXCItMTAwMFwiKVxuLy9cdFx0XHRcdGVsZW0ucGFyZW50KCkuYXBwZW5kKGZpbGVFbGVtKTtcbi8vXHRcdFx0XHRlbGVtID0gZWxlbS5wYXJlbnQoKTtcbi8vXHRcdFx0fVxuLy9cdFx0XHRpZiAoZWxlbS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJycgfHwgZWxlbS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJ3N0YXRpYycpIHtcbi8vXHRcdFx0XHRlbGVtLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XG4vL1x0XHRcdH1cblx0XHRcdGVsZW0gPSBmaWxlRWxlbTtcblx0XHR9XG5cdFx0ZWxlbS5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBmaWxlcyA9IFtdLCBmaWxlTGlzdCwgaTtcblx0XHRcdGZpbGVMaXN0ID0gZXZ0Ll9fZmlsZXNfIHx8IGV2dC50YXJnZXQuZmlsZXM7XG5cdFx0XHRpZiAoZmlsZUxpc3QgIT0gbnVsbCkge1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgZmlsZUxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRmaWxlcy5wdXNoKGZpbGVMaXN0Lml0ZW0oaSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Zm4oc2NvcGUsIHtcblx0XHRcdFx0XHQkZmlsZXMgOiBmaWxlcyxcblx0XHRcdFx0XHQkZXZlbnQgOiBldnRcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHQvLyByZW1vdmVkIHRoaXMgc2luY2UgaXQgd2FzIGNvbmZ1c2luZyBpZiB0aGUgdXNlciBjbGljayBvbiBicm93c2UgYW5kIHRoZW4gY2FuY2VsICMxODFcbi8vXHRcdGVsZW0uYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuLy9cdFx0XHR0aGlzLnZhbHVlID0gbnVsbDtcbi8vXHRcdH0pO1xuXG5cdFx0Ly8gcmVtb3ZlZCBiZWNhdXNlIG9mICMyNTMgYnVnXG5cdFx0Ly8gdG91Y2ggc2NyZWVuc1xuLy9cdFx0aWYgKCgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHx8XG4vL1x0XHRcdFx0KG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDApIHx8IChuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyA+IDApKSB7XG4vL1x0XHRcdGVsZW0uYmluZCgndG91Y2hlbmQnLCBmdW5jdGlvbihlKSB7XG4vL1x0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy9cdFx0XHRcdGUudGFyZ2V0LmNsaWNrKCk7XG4vL1x0XHRcdH0pO1xuLy9cdFx0fVxuXHR9O1xufSBdKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ0ZpbGVEcm9wQXZhaWxhYmxlJywgWyAnJHBhcnNlJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJHBhcnNlLCAkdGltZW91dCkge1xuXHRyZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHIpIHtcblx0XHRpZiAoJ2RyYWdnYWJsZScgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpKSB7XG5cdFx0XHR2YXIgZm4gPSAkcGFyc2UoYXR0clsnbmdGaWxlRHJvcEF2YWlsYWJsZSddKTtcblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmbihzY29wZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59IF0pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nRmlsZURyb3AnLCBbICckcGFyc2UnLCAnJHRpbWVvdXQnLCAnJGxvY2F0aW9uJywgZnVuY3Rpb24oJHBhcnNlLCAkdGltZW91dCwgJGxvY2F0aW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cikge1xuXHRcdGlmICgnZHJhZ2dhYmxlJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJykpIHtcblx0XHRcdHZhciBsZWF2ZVRpbWVvdXQgPSBudWxsO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHQkdGltZW91dC5jYW5jZWwobGVhdmVUaW1lb3V0KTtcblx0XHRcdFx0aWYgKCFlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXykge1xuXHRcdFx0XHRcdGlmIChhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10gJiYgYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddLnNlYXJjaCgvXFwpICokLykgPiAtMSkge1xuXHRcdFx0XHRcdFx0dmFyIGRyYWdPdmVyQ2xhc3MgPSAkcGFyc2UoYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddKShzY29wZSwge1xuXHRcdFx0XHRcdFx0XHQkZXZlbnQgOiBldnRcblx0XHRcdFx0XHRcdH0pO1x0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gZHJhZ092ZXJDbGFzczsgXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddIHx8IFwiZHJhZ292ZXJcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxlbS5hZGRDbGFzcyhlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRsZWF2ZVRpbWVvdXQgPSAkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRlbGVtLnJlbW92ZUNsYXNzKGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKTtcblx0XHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IG51bGw7XG5cdFx0XHRcdH0sIGF0dHJbJ25nRmlsZURyYWdPdmVyRGVsYXknXSB8fCAxKTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdHZhciBmbiA9ICRwYXJzZShhdHRyWyduZ0ZpbGVEcm9wJ10pO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGVsZW0ucmVtb3ZlQ2xhc3MoZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pO1xuXHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IG51bGw7XG5cdFx0XHRcdGV4dHJhY3RGaWxlcyhldnQsIGZ1bmN0aW9uKGZpbGVzKSB7XG5cdFx0XHRcdFx0Zm4oc2NvcGUsIHtcblx0XHRcdFx0XHRcdCRmaWxlcyA6IGZpbGVzLFxuXHRcdFx0XHRcdFx0JGV2ZW50IDogZXZ0XG5cdFx0XHRcdFx0fSk7XHRcdFx0XHRcdFxuXHRcdFx0XHR9KTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0ZnVuY3Rpb24gaXNBU0NJSShzdHIpIHtcblx0XHRcdFx0cmV0dXJuIC9eW1xcMDAwLVxcMTc3XSokLy50ZXN0KHN0cik7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGV4dHJhY3RGaWxlcyhldnQsIGNhbGxiYWNrKSB7XG5cdFx0XHRcdHZhciBmaWxlcyA9IFtdLCBpdGVtcyA9IGV2dC5kYXRhVHJhbnNmZXIuaXRlbXM7XG5cdFx0XHRcdGlmIChpdGVtcyAmJiBpdGVtcy5sZW5ndGggPiAwICYmIGl0ZW1zWzBdLndlYmtpdEdldEFzRW50cnkgJiYgJGxvY2F0aW9uLnByb3RvY29sKCkgIT0gJ2ZpbGUnICYmIFxuXHRcdFx0XHRcdFx0aXRlbXNbMF0ud2Via2l0R2V0QXNFbnRyeSgpLmlzRGlyZWN0b3J5KSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGVudHJ5ID0gaXRlbXNbaV0ud2Via2l0R2V0QXNFbnRyeSgpO1xuXHRcdFx0XHRcdFx0aWYgKGVudHJ5ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Ly9maXggZm9yIGNocm9tZSBidWcgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTE0OTczNVxuXHRcdFx0XHRcdFx0XHRpZiAoaXNBU0NJSShlbnRyeS5uYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRcdHRyYXZlcnNlRmlsZVRyZWUoZmlsZXMsIGVudHJ5KTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmICghaXRlbXNbaV0ud2Via2l0R2V0QXNFbnRyeSgpLmlzRGlyZWN0b3J5KSB7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXMucHVzaChpdGVtc1tpXS5nZXRBc0ZpbGUoKSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFyIGZpbGVMaXN0ID0gZXZ0LmRhdGFUcmFuc2Zlci5maWxlcztcblx0XHRcdFx0XHRpZiAoZmlsZUxpc3QgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRmaWxlcy5wdXNoKGZpbGVMaXN0Lml0ZW0oaSkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQoZnVuY3Rpb24gd2FpdEZvclByb2Nlc3MoZGVsYXkpIHtcblx0XHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICghcHJvY2Vzc2luZykge1xuXHRcdFx0XHRcdFx0XHRjYWxsYmFjayhmaWxlcyk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR3YWl0Rm9yUHJvY2VzcygxMCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgZGVsYXkgfHwgMClcblx0XHRcdFx0fSkoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dmFyIHByb2Nlc3NpbmcgPSAwO1xuXHRcdFx0ZnVuY3Rpb24gdHJhdmVyc2VGaWxlVHJlZShmaWxlcywgZW50cnksIHBhdGgpIHtcblx0XHRcdFx0aWYgKGVudHJ5ICE9IG51bGwpIHtcblx0XHRcdFx0XHRpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcblx0XHRcdFx0XHRcdHZhciBkaXJSZWFkZXIgPSBlbnRyeS5jcmVhdGVSZWFkZXIoKTtcblx0XHRcdFx0XHRcdHByb2Nlc3NpbmcrKztcblx0XHRcdFx0XHRcdGRpclJlYWRlci5yZWFkRW50cmllcyhmdW5jdGlvbihlbnRyaWVzKSB7XG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdHRyYXZlcnNlRmlsZVRyZWUoZmlsZXMsIGVudHJpZXNbaV0sIChwYXRoID8gcGF0aCA6IFwiXCIpICsgZW50cnkubmFtZSArIFwiL1wiKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRwcm9jZXNzaW5nLS07XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cHJvY2Vzc2luZysrO1xuXHRcdFx0XHRcdFx0ZW50cnkuZmlsZShmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NpbmctLTtcblx0XHRcdFx0XHRcdFx0ZmlsZS5fcmVsYXRpdmVQYXRoID0gKHBhdGggPyBwYXRoIDogXCJcIikgKyBmaWxlLm5hbWU7XG5cdFx0XHRcdFx0XHRcdGZpbGVzLnB1c2goZmlsZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG59IF0pO1xuXG59KSgpO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgQ29tcG9uZW50U2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgY29udGV4dCA9IHt9LFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0ge30sXHJcbiAgICAgICAgICAgIGNvbm5lY3RvcnMgPSB7fTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyJyk7XHJcblxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdDb21wb25lbnREZXRhaWxzXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEZXN0cm95aW5nIDonLCBjb250ZXh0LnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcclxuICAgICAgICAgICAgcHJvcGVydGllczogcHJvcGVydGllcyxcclxuICAgICAgICAgICAgY29ubmVjdG9yczogY29ubmVjdG9yc1xyXG4gICAgICAgIH07XHJcbi8vICAgICAgICBkYXRhID0ge1xyXG4vLyAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuLy8gICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXHJcbi8vICAgICAgICAgICAgZG9tYWluTW9kZWxzOiB7fSwgICAvL2RvbWFpbk1vZGVsOiBpZDogPHN0cmluZz4sIHR5cGU6IDxzdHJpbmc+XHJcbi8vICAgICAgICAgICAgaW50ZXJmYWNlczoge1xyXG4vLyAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSwgLy9wcm9wZXJ0eToge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRhdGFUeXBlOiA8c3RyaW5nPiwgdmFsdWVUeXBlIDxzdHJpbmc+fVxyXG4vLyAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiB7fSAgLy9jb25uZWN0b3I6IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkb21haW5Qb3J0czogPG9iamVjdD4gfVxyXG4vLyAgICAgICAgICAgIH1cclxuLy8gICAgICAgIH1cclxuXHJcbiAgICAgICAgQ29tcG9uZW50U2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95KSB7XHJcbiAgICAgICAgICAgICAgICAvL1RPRE86IG5vdGlmeSB1c2VyXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICBDb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50SW50ZXJmYWNlcyhjb250ZXh0LCAkc2NvcGUuY29tcG9uZW50SWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIC8vIFNpbmNlIHdhdGNoQ29tcG9uZW50RGV0YWlscyBrZWVwcyB0aGUgZGF0YSB1cC10by1kYXRlIHRoZXJlIHNob3VsZG4ndCBiZSBhIG5lZWQgdG8gZG8gYW55XHJcbiAgICAgICAgICAgICAgICAvLyB1cGRhdGVzIGhlcmUuLlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbXBvbmVudEludGVyZmFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wcm9wZXJ0aWVzID0gY29tcG9uZW50SW50ZXJmYWNlcy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLmNvbm5lY3RvcnMgPSBjb21wb25lbnRJbnRlcmZhY2VzLmNvbm5lY3RvcnM7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdjb21wb25lbnREZXRhaWxzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCcsXHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRJZDogJz1jb21wb25lbnRJZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29tcG9uZW50RGV0YWlscy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignQ29tcG9uZW50TGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBDb21wb25lbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSxcclxuICAgICAgICAgICAgY29tcG9uZW50SXRlbXMgPSB7fSxcclxuICAgICAgICAgICAgc2VydmljZURhdGEyQ29tcG9uZW50SXRlbSxcclxuICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlcixcclxuICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICBjb250ZXh0O1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnQ29tcG9uZW50TGlzdENvbnRyb2xsZXInKTtcclxuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0NvbXBvbmVudExpc3RDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnID0ge1xyXG5cclxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBzaG93RGV0YWlsc0xhYmVsOiAnU2hvdyBkZXRhaWxzJyxcclxuICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXHJcblxyXG4gICAgICAgICAgICAvLyBFdmVudCBoYW5kbGVyc1xyXG5cclxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NsaWNrZWQ6ICcgKyBpdGVtKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggPSAnL2NvbXBvbmVudC8nICsgaXRlbS5pZC5yZXBsYWNlKC9cXC8vZywgJy0nKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NvbnRleHRtZW51IHdhcyB0cmlnZ2VyZWQgZm9yIG5vZGU6JywgaXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2V4cG9ydEFzWE1FJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBhcyBYTUUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNoYXJlLWFsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbGFiZWw6ICdFeHRyYScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcGx1cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50U2VydmljZS5kZWxldGVXb3Jrc3BhY2UoY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZmlsdGVyOiB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICBpdGVtczogaXRlbXMsXHJcbiAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogJHNjb3BlLmNvbm5lY3Rpb25JZCAvLyBGSVhNRTogVGhpcyBpcyBwcm9iYWJseSBub3QgdGhlIHJpZ2h0IHdheSB0byBkbyBpdC4uXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcclxuXHJcbiAgICAgICAgc2VydmljZURhdGEyQ29tcG9uZW50SXRlbSA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRJdGVtO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudEl0ZW1zLmhhc093blByb3BlcnR5KGRhdGEuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRJdGVtID0gY29tcG9uZW50SXRlbXNbZGF0YS5pZF07XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRJdGVtLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudEl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnT3BlbiBpdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpLCAvLyBUT0RPOiBnZXQgdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAnTi9BJyAvLyBUT0RPOiBnZXQgdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnRG9tYWluIE1vZGVscyAobm90IGZpbmFsKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXRpbnQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHMgICAgOiAnQ29udGVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsc1RlbXBsYXRlVXJsOiAnZGV0YWlscy5odG1sJ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRJdGVtc1tjb21wb25lbnRJdGVtLmlkXSA9IGNvbXBvbmVudEl0ZW07XHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNvbXBvbmVudEl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYWRkRG9tYWluV2F0Y2hlciA9IGZ1bmN0aW9uIChjb21wb25lbnRJZCkge1xyXG4gICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgQ29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERvbWFpbnMoY29udGV4dCwgY29tcG9uZW50SWQsIGZ1bmN0aW9uICh1cGRhdGVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAvL1RPRE86IEltcGxlbWVudCB0aGUgdXBkYXRpbmcgZnVuY3Rpb25hbGl0eS5cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudERhdGEgPSBjb21wb25lbnRJdGVtc1tjb21wb25lbnRJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50RGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBkYXRhLmRvbWFpbk1vZGVscykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuZG9tYWluTW9kZWxzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREYXRhLnN0YXRzWzBdLnZhbHVlICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBDb21wb25lbnRTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5saXN0RGF0YS5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgICAgICBjb21wb25lbnRJdGVtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnRzKGNvbnRleHQsICRzY29wZS53b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iaikge1xyXG4gICAgICAgICAgICAgICAgLy9UT0RPOiBJbXBsZW1lbnQgdGhlIHVwZGF0aW5nIGZ1bmN0aW9uYWxpdHkuXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRJZDtcclxuICAgICAgICAgICAgICAgICAgICAvL2RlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29tcG9uZW50SWQgaW4gZGF0YS5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbXBvbmVudHMuaGFzT3duUHJvcGVydHkoY29tcG9uZW50SWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJDb21wb25lbnRJdGVtKGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlcihjb21wb25lbnRJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdjb21wb25lbnRMaXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSWQ6ICc9d29ya3NwYWNlSWQnLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29tcG9uZW50TGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbXBvbmVudExpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnbkxpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgRGVzaWduU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sXHJcbiAgICAgICAgICAgIGNvbmZpZztcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Rlc2lnbkxpc3RDb250cm9sbGVyJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLndvcmtzcGFjZUlkKTtcclxuXHJcbi8vICAgICAgICBjb25maWcgPSB7XHJcbi8vXHJcbi8vICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxyXG4vLyAgICAgICAgICAgIGRldGFpbHNDb2xsYXBzaWJsZTogdHJ1ZSxcclxuLy8gICAgICAgICAgICBzaG93RGV0YWlsc0xhYmVsOiAnU2hvdyBkZXRhaWxzJyxcclxuLy8gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcclxuLy9cclxuLy8gICAgICAgICAgICAvLyBFdmVudCBoYW5kbGVyc1xyXG4vL1xyXG4vLyAgICAgICAgICAgIGl0ZW1Tb3J0OiBmdW5jdGlvbiAoalFFdmVudCwgdWkpIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSk7XHJcbi8vICAgICAgICAgICAgfSxcclxuLy9cclxuLy8gICAgICAgICAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2xpY2tlZDogJyArIGl0ZW0pO1xyXG4vLyAgICAgICAgICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5oYXNoID1cclxuLy8gICAgICAgICAgICAgICAgICAgICcvd29ya3NwYWNlRGV0YWlscy8vJyArIGl0ZW0uaWQ7XHJcbi8vICAgICAgICAgICAgfSxcclxuLy9cclxuLy8gICAgICAgICAgICBpdGVtQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKGUsIGl0ZW0pIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NvbnRleHRtZW51IHdhcyB0cmlnZ2VyZWQgZm9yIG5vZGU6JywgaXRlbSk7XHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbi8vICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZHVwbGljYXRlV29ya3NwYWNlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRHVwbGljYXRlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWNvcHkgY29weS1pY29uJ1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2VkaXRXb3Jrc3BhY2UnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0JyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0cnVlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWwnXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhwb3J0QXNYTUUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgYXMgWE1FJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2hhcmUtYWx0JyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHsgaWQ6IGl0ZW0uaWQgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuLy8gICAgICAgICAgICAgICAgICAgIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgLy9sYWJlbDogJ0V4dHJhJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2RlbGV0ZScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1wbHVzJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHsgaWQ6IGl0ZW0uaWQgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLmRlbGV0ZVdvcmtzcGFjZShkYXRhLmlkKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuLy8gICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgXTtcclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcclxuLy8gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XHJcbi8vICAgICAgICAgICAgfSxcclxuLy9cclxuLy8gICAgICAgICAgICBuZXdJdGVtRm9ybToge1xyXG4vLyAgICAgICAgICAgICAgICB0aXRsZTogJ0NyZWF0ZSBuZXcgaXRlbScsXHJcbi8vICAgICAgICAgICAgICAgIGl0ZW1UZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VOZXdJdGVtLmh0bWwnLFxyXG4vLyAgICAgICAgICAgICAgICBleHBhbmRlZDogZmFsc2UsXHJcbi8vICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICRzY29wZS5jcmVhdGVJdGVtID0gZnVuY3Rpb24gKG5ld0l0ZW0pIHtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLmNyZWF0ZVdvcmtzcGFjZShuZXdJdGVtKTtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubmV3SXRlbSA9IHt9O1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5uZXdJdGVtRm9ybS5leHBhbmRlZCA9IGZhbHNlOyAvLyB0aGlzIGlzIGhvdyB5b3UgY2xvc2UgdGhlIGZvcm0gaXRzZWxmXHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICB9O1xyXG4vLyAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgfSxcclxuLy9cclxuLy8gICAgICAgICAgICBmaWx0ZXI6IHtcclxuLy8gICAgICAgICAgICB9XHJcbi8vXHJcbi8vICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xyXG4gICAgICAgIH07XHJcblxyXG4vLyAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdkZXNpZ25MaXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSWQ6ICc9d29ya3NwYWNlSWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0Rlc2lnbkxpc3QuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEZXNpZ25MaXN0Q29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdEZXNpZ25UcmVlQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIERlc2lnblNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdLFxyXG4gICAgICAgICAgICBjb25maWc7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXNpZ25UcmVlQ29udHJvbGxlcicpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5kZXNpZ25JZCk7XHJcblxyXG4gICAgICAgICRzY29wZS50cmVlRGF0YSA9IHt9O1xyXG5cclxuICAgICAgICBEZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWduU3RydWN0dXJlKG51bGwsICRzY29wZS5kZXNpZ25JZCwgZnVuY3Rpb24gKGVyciwgc3RydWN0dXJlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS50cmVlRGF0YSA9IHN0cnVjdHVyZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnZGVzaWduVHJlZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGRlc2lnbklkOiAnPWRlc2lnbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9EZXNpZ25UcmVlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduVHJlZUNvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBUZXN0QmVuY2hTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSxcclxuICAgICAgICAgICAgY29uZmlnO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInKTtcclxuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUud29ya3NwYWNlSWQpO1xyXG5cclxuLy8gICAgICAgIGNvbmZpZyA9IHtcclxuLy9cclxuLy8gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXHJcbi8vICAgICAgICAgICAgc2Vjb25kYXJ5SXRlbU1lbnU6IHRydWUsXHJcbi8vICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4vLyAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxyXG4vLyAgICAgICAgICAgIGhpZGVEZXRhaWxzTGFiZWw6ICdIaWRlIGRldGFpbHMnLFxyXG4vL1xyXG4vLyAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXHJcbi8vXHJcbi8vICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkOiAnICsgaXRlbSk7XHJcbi8vICAgICAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggPVxyXG4vLyAgICAgICAgICAgICAgICAgICAgJy93b3Jrc3BhY2VEZXRhaWxzLy8nICsgaXRlbS5pZDtcclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgaXRlbSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29udGV4dG1lbnUgd2FzIHRyaWdnZXJlZCBmb3Igbm9kZTonLCBpdGVtKTtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuLy8gICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW5JbkVkaXRvcicsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCdcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkdXBsaWNhdGVXb3Jrc3BhY2UnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEdXBsaWNhdGUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtY29weSBjb3B5LWljb24nXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZWRpdFdvcmtzcGFjZScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCdcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc1hNRScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBhcyBYTUUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4vLyAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAvL2xhYmVsOiAnRXh0cmEnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXBsdXMnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2UuZGVsZXRlV29ya3NwYWNlKGRhdGEuaWQpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4vLyAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICBdO1xyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4vLyAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIG5ld0l0ZW1Gb3JtOiB7XHJcbi8vICAgICAgICAgICAgICAgIHRpdGxlOiAnQ3JlYXRlIG5ldyBpdGVtJyxcclxuLy8gICAgICAgICAgICAgICAgaXRlbVRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtzcGFjZU5ld0l0ZW0uaHRtbCcsXHJcbi8vICAgICAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZUl0ZW0gPSBmdW5jdGlvbiAobmV3SXRlbSkge1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2UuY3JlYXRlV29ya3NwYWNlKG5ld0l0ZW0pO1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5uZXdJdGVtID0ge307XHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm5ld0l0ZW1Gb3JtLmV4cGFuZGVkID0gZmFsc2U7IC8vIHRoaXMgaXMgaG93IHlvdSBjbG9zZSB0aGUgZm9ybSBpdHNlbGZcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgIH07XHJcbi8vICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIGZpbHRlcjoge1xyXG4vLyAgICAgICAgICAgIH1cclxuLy9cclxuLy8gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbi8vICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ3Rlc3RCZW5jaExpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvVGVzdEJlbmNoTGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50Ki9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgV29ya3NwYWNlU2VydmljZSwgRmlsZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdLFxyXG4gICAgICAgICAgICB3b3Jrc3BhY2VJdGVtcyA9IHt9LFxyXG4gICAgICAgICAgICBjb25maWcsXHJcbiAgICAgICAgICAgIGNvbnRleHQsXHJcbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMldvcmtzcGFjZUl0ZW0sXHJcbiAgICAgICAgICAgIGFkZENvdW50V2F0Y2hlcnM7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlcicpO1xyXG5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnV29ya3NwYWNlTGlzdENvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcgPSB7XHJcblxyXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxyXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcclxuXHJcbiAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXHJcblxyXG4gICAgICAgICAgICBpdGVtU29ydDogZnVuY3Rpb24gKGpRRXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2xpY2tlZDogJyArIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9XHJcbiAgICAgICAgICAgICAgICAgICAgJy93b3Jrc3BhY2VEZXRhaWxzLycgKyBpdGVtLmlkLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29udGV4dG1lbnUgd2FzIHRyaWdnZXJlZCBmb3Igbm9kZTonLCBpdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZHVwbGljYXRlV29ya3NwYWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0R1cGxpY2F0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWNvcHkgY29weS1pY29uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7aWQ6IGl0ZW0uaWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5kdXBsaWNhdGVXb3Jrc3BhY2UoY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2VkaXRXb3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWwnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhwb3J0QXNYTUUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhwb3J0IGFzIFhNRScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2hhcmUtYWx0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9sYWJlbDogJ0V4dHJhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcGx1cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UoY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbmV3SXRlbUZvcm06IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ3JlYXRlIG5ldyB3b3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgaXRlbVRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtzcGFjZU5ld0l0ZW0uaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBleHBhbmRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wcGVkRmlsZXM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ092ZXJDbGFzcyA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWRJdGVtcyA9ICRldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZHJhZ2dlZEl0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWRJdGVtcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZHJhZ2dlZEl0ZW1zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWRJdGVtc1tpXS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhc0ZpbGUgPyBcImJnLXN1Y2Nlc3MgZHJhZ292ZXJcIiA6IFwiYmctZGFuZ2VyIGRyYWdvdmVyXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uRHJvcHBlZEZpbGVzID0gZnVuY3Rpb24gKCRmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBGaWxlU2VydmljZS5zYXZlRHJvcHBlZEZpbGVzKCRmaWxlcywge3ppcDogdHJ1ZSwgYWRtOiB0cnVlLCBhdG06IHRydWV9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGZJbmZvcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGZJbmZvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZJbmZvcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzLnB1c2goZkluZm9zW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY3JlYXRlSXRlbSA9IGZ1bmN0aW9uIChuZXdJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgJHNjb3BlLmZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuZmlsZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vV29ya3NwYWNlU2VydmljZS5jcmVhdGVXb3Jrc3BhY2UoY29udGV4dCwgbmV3SXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS5uZXdJdGVtID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbmZpZy5uZXdJdGVtRm9ybS5leHBhbmRlZCA9IGZhbHNlOyAvLyB0aGlzIGlzIGhvdyB5b3UgY2xvc2UgdGhlIGZvcm0gaXRzZWxmXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcblxyXG5cclxuICAgICAgICBzZXJ2aWNlRGF0YTJXb3Jrc3BhY2VJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHdvcmtzcGFjZUl0ZW07XHJcblxyXG4gICAgICAgICAgICBpZiAod29ya3NwYWNlSXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0gPSB3b3Jrc3BhY2VJdGVtc1tkYXRhLmlkXTtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0ubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0uZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdPcGVuIGl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IG5ldyBEYXRlKCksIC8vIFRPRE86IGdldCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnIC8vIFRPRE86IGdldCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdDb21wb25lbnRzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXB1enpsZS1waWVjZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnRGVzaWduIFNwYWNlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1jdWJlcydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnVGVzdCBiZW5jaGVzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2F2ZWQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ1JlcXVpcmVtZW50cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1iYXItY2hhcnQtbydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSXRlbS5pZF0gPSB3b3Jrc3BhY2VJdGVtO1xyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh3b3Jrc3BhY2VJdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGFkZENvdW50V2F0Y2hlcnMgPSBmdW5jdGlvbiAod29ya3NwYWNlSWQpIHtcclxuICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mQ29tcG9uZW50cyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzBdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzBdLnZhbHVlID0gZGF0YS5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mRGVzaWducyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzFdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzFdLnZhbHVlID0gZGF0YS5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mVGVzdEJlbmNoZXMoY29udGV4dCwgd29ya3NwYWNlSWQsIGZ1bmN0aW9uICh1cGRhdGVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1syXS52YWx1ZSA9IHVwZGF0ZURhdGEuZGF0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1syXS52YWx1ZSA9IGRhdGEuY291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgV29ya3NwYWNlU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIGFsbCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hXb3Jrc3BhY2VzKGNvbnRleHQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMldvcmtzcGFjZUl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZENvdW50V2F0Y2hlcnModXBkYXRlT2JqZWN0LmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMldvcmtzcGFjZUl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZUl0ZW1zLmhhc093blByb3BlcnR5KHVwZGF0ZU9iamVjdC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mQ29tcG9uZW50c18nICsgdXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZEZXNpZ25zXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgd29ya3NwYWNlSXRlbXNbdXBkYXRlT2JqZWN0LmlkXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodXBkYXRlT2JqZWN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VJZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh3b3Jrc3BhY2VJZCBpbiBkYXRhLndvcmtzcGFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEud29ya3NwYWNlcy5oYXNPd25Qcm9wZXJ0eSh3b3Jrc3BhY2VJZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMldvcmtzcGFjZUl0ZW0oZGF0YS53b3Jrc3BhY2VzW3dvcmtzcGFjZUlkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDb3VudFdhdGNoZXJzKHdvcmtzcGFjZUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ3dvcmtzcGFjZUxpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya3NwYWNlTGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXHJcblxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdDb21wb25lbnRTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCBOb2RlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgd2F0Y2hlcnMgPSB7fTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBjb21wb25lbnQgZnJvbSB0aGUgY29udGV4dCAoZGIvcHJvamVjdC9icmFuY2gpLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLCBOLkIuIGRvZXMgbm90IG5lZWQgdG8gc3BlY2lmeSByZWdpb24uXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBvbmVudElkXHJcbiAgICAgICAgICogQHBhcmFtIFttc2ddIC0gQ29tbWl0IG1lc3NhZ2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5kZWxldGVDb21wb25lbnQgPSBmdW5jdGlvbiAoY29udGV4dCwgY29tcG9uZW50SWQsIG1zZykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1zZyB8fCAnQ29tcG9uZW50U2VydmljZS5kZWxldGVDb21wb25lbnQgJyArIGNvbXBvbmVudElkO1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCBjb21wb25lbnRJZCwgbWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBvcnRDb21wb25lbnQgPSBmdW5jdGlvbiAoY29udGV4dCwgY29tcG9uZW50SWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCBjb21wb25lbnRzIChleGlzdGVuY2UgYW5kIHRoZWlyIGF0dHJpYnV0ZXMpIG9mIGEgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuICBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLmNvbXBvbmVudHMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaENvbXBvbmVudHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50cycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9IC8vIGNvbXBvbmVudCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgYXZtSWQ6IDxzdHJpbmc+LCByZXNvdXJjZTogPGhhc2h8c3RyaW5nPiwgY2xhc3NpZmljYXRpb25zOiA8c3RyaW5nPiB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBdm1JRCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSZXNvdXJjZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdSZXNvdXJjZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdDbGFzcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdDbGFzc2lmaWNhdGlvbnMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXNjICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0F2bUlEICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLmF2bUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uYXZtSWQgPSBuZXdBdm1JRDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdSZXNvdXJjZSAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5yZXNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLnJlc291cmNlID0gbmV3UmVzb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2xhc3MgIT09IGRhdGEuY29tcG9uZW50c1tpZF0uY2xhc3NpZmljYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uY2xhc3NpZmljYXRpb25zID0gbmV3Q2xhc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS5jb21wb25lbnRzW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbXBvbmVudHNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbY29tcG9uZW50SWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWQ6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdSZXNvdXJjZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2lmaWNhdGlvbnM6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWQ6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NpZmljYXRpb25zOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY29tcG9uZW50SWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb21wb25lbnRzW2NvbXBvbmVudElkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBkb21haW4tbW9kZWxzIG9mIGEgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb21wb25lbnRJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaENvbXBvbmVudERvbWFpbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgY29tcG9uZW50SWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50RG9tYWluc18nICsgY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICBkb21haW5Nb2RlbHM6IHt9ICAgLy9kb21haW5Nb2RlbDogaWQ6IDxzdHJpbmc+LCB0eXBlOiA8c3RyaW5nPlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uRG9tYWluTW9kZWxVcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VHlwZSAhPT0gZGF0YS5kb21haW5Nb2RlbHNbaWRdLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbaWRdLnR5cGUgPSBuZXdUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Eb21haW5Nb2RlbFVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmRvbWFpbk1vZGVsc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBjb21wb25lbnRJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29tcG9uZW50Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRvbWFpbk1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRvbWFpbk1vZGVsc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvbkRvbWFpbk1vZGVsVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uRG9tYWluTW9kZWxVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuRG9tYWluTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZG9tYWluTW9kZWxzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Eb21haW5Nb2RlbFVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uRG9tYWluTW9kZWxVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBpbnRlcmZhY2VzIG9mIGEgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb21wb25lbnRJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaENvbXBvbmVudEludGVyZmFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgY29tcG9uZW50SWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50SW50ZXJmYWNlc18nICsgY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSwgLy9wcm9wZXJ0eToge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRhdGFUeXBlOiA8c3RyaW5nPiwgdmFsdWVUeXBlIDxzdHJpbmc+fVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9ICAvL2Nvbm5lY3Rvcjoge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRvbWFpblBvcnRzOiA8b2JqZWN0PiB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Qcm9wZXJ0eVVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGF0YVR5cGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnRGF0YVR5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEucHJvcGVydGllc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0RhdGFUeXBlICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLmRhdGFUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tpZF0uZGF0YVR5cGUgPSBuZXdEYXRhVHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZVR5cGUgIT09IGRhdGEucHJvcGVydGllc1tpZF0udmFsdWVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tpZF0udmFsdWVUeXBlID0gbmV3VmFsdWVUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Qcm9wZXJ0eVVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnByb3BlcnRpZXNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Db25uZWN0b3JVcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb25uZWN0b3JzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29ubmVjdG9yc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkNvbm5lY3RvclVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbm5lY3RvcnNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgY29tcG9uZW50SWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbXBvbmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Tm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Qcm9wZXJ0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnRGF0YVR5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlVHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVmFsdWVUeXBlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uUHJvcGVydHlVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Qcm9wZXJ0eVVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQ29ubmVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbm5lY3RvcnNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblBvcnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25Db25uZWN0b3JVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Db25uZWN0b3JVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuUHJvcGVydHkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdEYXRhVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVUeXBlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uUHJvcGVydHlVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblByb3BlcnR5VW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbm5lY3RvcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25uZWN0b3JzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblBvcnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvbkNvbm5lY3RvclVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uQ29ubmVjdG9yVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vcXVldWVMaXN0LnB1c2goY2hpbGROb2RlLmxvYWRDaGlsZHJlbihjaGlsZE5vZGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCB3YXRjaGVycyBzcGF3bmVkIGZyb20gcGFyZW50Q29udGV4dCwgdGhpcyBzaG91bGQgdHlwaWNhbGx5IGJlIGludm9rZWQgd2hlbiB0aGUgY29udHJvbGxlciBpcyBkZXN0cm95ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFdhdGNoZXJzLFxyXG4gICAgICAgICAgICAgICAga2V5O1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2F0Y2hlcnMgPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGNoaWxkV2F0Y2hlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRXYXRjaGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY2hpbGRXYXRjaGVyc1trZXldLmRiLCBjaGlsZFdhdGNoZXJzW2tleV0ucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgc3BlY2lmaWVkIHdhdGNoZXIgKHJlZ2lvbklkKVxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LmRiIC0gRGF0YWJhc2UgY29ubmVjdGlvbiBvZiBib3RoIHBhcmVudCBhbmQgcmVnaW9uIHRvIGJlIGRlbGV0ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHJlZ2lvbklkIC0gUmVnaW9uIGlkIG9mIHRoZSBzcGF3bmVkIHJlZ2lvbiB0aGF0IHNob3VsZCBiZSBkZWxldGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5jbGVhblVwUmVnaW9uKHBhcmVudENvbnRleHQuZGIsIHJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGNsZWFuLXVwIHJlZ2lvbiBzaW5jZSBwYXJlbnRDb250ZXh0IGlzIG5vdCByZWdpc3RlcmVkLi4nLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdGVycyBhIHdhdGNoZXIgKGNvbnRyb2xsZXIpIHRvIHRoZSBzZXJ2aWNlLiBDYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbiBub2RlcyBiZWNhbWUgYXZhaWxhYmxlIG9yXHJcbiAgICAgICAgICogd2hlbiB0aGV5IGJlY2FtZSB1bmF2YWlsYWJsZS4gVGhlc2UgYXJlIGFsc28gY2FsbGVkIGRpcmVjdGx5IHdpdGggdGhlIHN0YXRlIG9mIHRoZSBOb2RlU2VyaXZjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gLSBDYWxsZWQgd2l0aCB0cnVlIHdoZW4gdGhlcmUgYXJlIG5vIG5vZGVzIHVuYXZhaWxhYmxlIGFuZCBmYWxzZSB3aGVuIHRoZXJlIGFyZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5vbihwYXJlbnRDb250ZXh0LmRiLCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGVub3VnaCwgdGhlIHJlZ2lvbnMgd2lsbCBiZSBjbGVhbmVkIHVwIGluIE5vZGVTZXJ2aWNlLlxyXG4gICAgICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZuKGZhbHNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLm9uKHBhcmVudENvbnRleHQuZGIsICdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgZW5vdWdoLCB0aGUgcmVnaW9ucyBzaG91bGQgYmUgY2xlYW5lZCB1cCBpbiBOb2RlU2VydmljZS5cclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZuKHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ0NvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5sb2dDb250ZXh0KGNvbnRleHQpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ0Rlc2lnblNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsIE5vZGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLmRlbGV0ZURlc2lnbiA9IGZ1bmN0aW9uIChkZXNpZ25JZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBvcnREZXNpZ24gPSBmdW5jdGlvbiAoZGVzaWduSWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlQ29uZmlndXJhdGlvblNldCA9IGZ1bmN0aW9uIChkZXNpZ25JZCwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIGNvbnRhaW5lcnMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS4gIERhdGEgaXMgYW4gb2JqZWN0IGluIGRhdGEuZGVzaWducy5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoRGVzaWducyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hEZXNpZ25zJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiBwYXJlbnRDb250ZXh0LnByb2plY3RJZCxcclxuICAgICAgICAgICAgICAgICAgICBicmFuY2hJZDogcGFyZW50Q29udGV4dC5icmFuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBkZXNpZ25zOiB7fSAvLyBkZXNpZ24ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5kZXNpZ25zW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS5kZXNpZ25zW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLmRlc2lnbnNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuZGVzaWduc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbZGVzaWduSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25JZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zW2Rlc2lnbklkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogZGVzaWduSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5kZXNpZ25zW2Rlc2lnbklkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhIGRlc2lnbiB3LnIudC4gaW50ZXJmYWNlcy5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gZGVzaWduSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hEZXNpZ25EZXRhaWxzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGZ1bGwgaGllcmFyY2h5IG9mIGEgZGVzaWduIHcuci50LiBjb250YWluZXJzIGFuZCBjb21wb25lbnRzLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBkZXNpZ25JZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaERlc2lnblN0cnVjdHVyZSA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEZJWE1FOiB3YXRjaENvbmZpZ3VyYXRpb25TZXRzIGFuZCB3YXRjaENvbmZpZ3VyYXRpb25zIHNob3VsZCBwcm9iYWJseSBnbyB0byBhIERlc2VydENvbmZpZ3VyYXRpb24tU2VydmljZSxcclxuICAgICAgICAvLyB3aXRoIGEgcmVsYXRlZCBjb250cm9sbGVyIERlc2VydENvbmZpZ3VyYXRpb25TZXRMaXN0LCB3aGVyZSBkZXRhaWxzIGFyZSBjb25maWd1cmF0aW9ucy5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZ2VuZXJhdGVkIERlc2VydENvbmZpZ3VyYXRpb25TZXRzIGluc2lkZSBhIERlc2lnbi5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gZGVzaWduSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hDb25maWd1cmF0aW9uU2V0cyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnU2V0czoge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogcGFyZW50Q29udGV4dC5wcm9qZWN0SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmNoSWQ6IHBhcmVudENvbnRleHQuYnJhbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29uZmlndXJhdGlvblNldHNfJyArIGRlc2lnbklkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkYXRhLnJlZ2lvbklkID0gY29udGV4dC5yZWdpb25JZDtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQWRkZWQgbmV3IHdhdGNoZXI6ICcsIHdhdGNoZXJzKTtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9nQ29udGV4dChjb250ZXh0KTtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGRlc2lnbklkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkZXNpZ25Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubmFtZSA9IGRlc2lnbk5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUubG9hZENoaWxkcmVuKGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG5ld05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuY2ZnU2V0c1tpZF0ubmFtZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgIT09IGRhdGEuY2ZnU2V0c1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2RhdGEuY2ZnU2V0c1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLndhcm4oJ2NoYW5nZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGVzW2ldLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNmZ1NldHNbY2hpbGROb2Rlc1tpXS5nZXRJZCgpXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGROb2Rlc1tpXS5nZXRJZCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZXNbaV0uZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZXNbaV0uZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzW2ldLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXNbaV0ub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2NmZ1NldHMnLCBjZmdTZXRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvblNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uVXBkYXRlKGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gRklYTUU6IFdhdGNoaW5nIGNvbmZpZ3VyYXRpb25zIGluc2lkZSBhIGNvbmZpZ3VyYXRpb24tc2V0IGRvZXMgcHJvYmFibHkgbm90IGJlbG9uZyBoZXJlLlxyXG4vLyAgICAgICAgLyoqXHJcbi8vICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgRGVzZXJ0Q29uZmlndXJhdGlvbiAody5yLnQuIGV4aXN0ZW5jZSBhbmQgYXR0cmlidXRlcykgaW5zaWRlIGEgRGVzZXJ0Q29uZmlndXJhdGlvblNldC5cclxuLy8gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4vLyAgICAgICAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb25TZXRJZFxyXG4vLyAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuLy8gICAgICAgICAqL1xyXG4vLyAgICAgICAgdGhpcy53YXRjaENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGNvbmZpZ3VyYXRpb25TZXRJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuLy8gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbi8vICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCB3YXRjaGVycyBzcGF3bmVkIGZyb20gcGFyZW50Q29udGV4dC5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkV2F0Y2hlcnMsXHJcbiAgICAgICAgICAgICAgICBrZXk7XHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXYXRjaGVycyA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gY2hpbGRXYXRjaGVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZFdhdGNoZXJzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjaGlsZFdhdGNoZXJzW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgc3BlY2lmaWVkIHdhdGNoZXIgKHJlZ2lvbklkKVxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0XHJcbiAgICAgICAgICogQHBhcmFtIHJlZ2lvbklkXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24ocmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYW5ub3QgY2xlYW4tdXAgcmVnaW9uIHNpbmNlIHBhcmVudENvbnRleHQgaXMgbm90IHJlZ2lzdGVyZWQuLicsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBXZWJHTUVHbG9iYWwsIGNvbnNvbGUqL1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnRmlsZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBibG9iQ2xpZW50ID0gbmV3IFdlYkdNRUdsb2JhbC5jbGFzc2VzLkJsb2JDbGllbnQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlRHJvcHBlZEZpbGVzID0gZnVuY3Rpb24gKGZpbGVzLCB2YWxpZEV4dGVuc2lvbnMpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGksXHJcbiAgICAgICAgICAgICAgICBjb3VudGVyID0gZmlsZXMubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgYXJ0aWUgPSBibG9iQ2xpZW50LmNyZWF0ZUFydGlmYWN0KCdkcm9wcGVkRmlsZXMnKSxcclxuICAgICAgICAgICAgICAgIGFkZEZpbGUsXHJcbiAgICAgICAgICAgICAgICBhZGRlZEZpbGVzID0gW10sXHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY291bnRlciA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYWRkZWRGaWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvdW50ZXIgPSBmaWxlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBhZGRGaWxlID0gZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlRXh0ZW5zaW9uID0gc2VsZi5nZXRGaWxlRXh0ZW5zaW9uKGZpbGUubmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkRXh0ZW5zaW9ucyB8fCB2YWxpZEV4dGVuc2lvbnNbZmlsZUV4dGVuc2lvbl0pIHtcclxuICAgICAgICAgICAgICAgICAgICBhcnRpZS5hZGRGaWxlQXNTb2Z0TGluayhmaWxlLm5hbWUsIGZpbGUsIGZ1bmN0aW9uIChlcnIsIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGFkZCBmaWxlIFwiJyArIGZpbGUubmFtZSArICdcIiB0byBibG9iLCBlcnI6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ291bnRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZGVkRmlsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogZmlsZUV4dGVuc2lvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHNlbGYuaHVtYW5GaWxlU2l6ZShmaWxlLnNpemUsIHRydWUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBibG9iQ2xpZW50LmdldERvd25sb2FkVVJMKGhhc2gpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBhZGRGaWxlKGZpbGVzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZmlsZSBleHRlbnNpb24gb2YgdGhlIGdpdmVuIGZpbGVuYW1lLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gdGhlIHJlc3VsdGluZyBmaWxlIGV4dGVuc2lvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmdldEZpbGVFeHRlbnNpb24gPSBmdW5jdGlvbiAoZmlsZW5hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGEgPSBmaWxlbmFtZS5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgIGlmIChhLmxlbmd0aCA9PT0gMSB8fCAoYVswXSA9PT0gXCJcIiAmJiBhLmxlbmd0aCA9PT0gMikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhLnBvcCgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRm9ybWF0cyB0aGUgc2l6ZSBpbnRvIGEgaHVtYW4gcmVhZGFibGUgc3RyaW5nLlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBieXRlcyAtIHNpemUgaW4gYnl0ZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBzaSAtIHJldHVybiByZXN1bHQgaW4gU0lVbml0cyBvciBub3QuXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gLSBmb3JtYXR0ZWQgZmlsZSBzaXplLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuaHVtYW5GaWxlU2l6ZSA9IGZ1bmN0aW9uIChieXRlcywgc2kpIHtcclxuICAgICAgICAgICAgdmFyIHRocmVzaCA9IHNpID8gMTAwMCA6IDEwMjQsXHJcbiAgICAgICAgICAgICAgICB1bml0cyxcclxuICAgICAgICAgICAgICAgIHU7XHJcbiAgICAgICAgICAgIGlmIChieXRlcyA8IHRocmVzaCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ5dGVzICsgJyBCJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdW5pdHMgPSBzaSA/IFsna0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXSA6XHJcbiAgICAgICAgICAgICAgICAgICAgWydLaUInLCAnTWlCJywgJ0dpQicsICdUaUInLCAnUGlCJywgJ0VpQicsICdaaUInLCAnWWlCJ107XHJcbiAgICAgICAgICAgIHUgPSAtMTtcclxuXHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGJ5dGVzID0gYnl0ZXMgLyB0aHJlc2g7XHJcbiAgICAgICAgICAgICAgICB1ICs9IDE7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKGJ5dGVzID49IHRocmVzaCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnl0ZXMudG9GaXhlZCgxKSArICcgJyArIHVuaXRzW3VdO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnVGVzdEJlbmNoU2VydmljZScsIGZ1bmN0aW9uICgkcSwgTm9kZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHdhdGNoZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5kZWxldGVUZXN0QmVuY2ggPSBmdW5jdGlvbiAodGVzdEJlbmNoSWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZXhwb3J0VGVzdEJlbmNoID0gZnVuY3Rpb24gKHRlc3RCZW5jaElkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNldFRvcExldmVsU3lzdGVtVW5kZXJUZXN0ID0gZnVuY3Rpb24gKHRlc3RCZW5jaElkLCBkZXNpZ25JZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5ydW5UZXN0QmVuY2ggPSBmdW5jdGlvbiAodGVzdEJlbmNoSWQsIGNvbmZpZ3VyYXRpb25JZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIHRlc3QtYmVuY2hlcyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLnRlc3RCZW5jaGVzLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hUZXN0QmVuY2hlcyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2hlcycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogcGFyZW50Q29udGV4dC5wcm9qZWN0SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmNoSWQ6IHBhcmVudENvbnRleHQuYnJhbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoZXM6IHt9IC8vIHRlc3RCZW5jaCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIHBhdGg6IDxzdHJpbmc+LCByZXN1bHRzOiA8aGFzaHxzdHJpbmc+LCBmaWxlczogPGhhc2h8c3RyaW5nPiB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Jlc3VsdHMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnUmVzdWx0cycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdGaWxlcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdUZXN0QmVuY2hGaWxlcycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BhdGggIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLnBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0ucGF0aCA9IG5ld1BhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UmVzdWx0cyAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0ucmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5yZXN1bHRzID0gbmV3UmVzdWx0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdGaWxlcyAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0uZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0uZmlsZXMgPSBuZXdGaWxlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLnRlc3RCZW5jaGVzW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnRlc3RCZW5jaGVzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaElkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1t0ZXN0QmVuY2hJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUZXN0QmVuY2hGaWxlcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbdGVzdEJlbmNoSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1Rlc3RCZW5jaEZpbGVzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiB0ZXN0QmVuY2hJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLnRlc3RCZW5jaGVzW3Rlc3RCZW5jaElkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhIHRlc3QtYmVuY2ggdy5yLnQuIGludGVyZmFjZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHRlc3RCZW5jaElkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoRGV0YWlscyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB0ZXN0QmVuY2hJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ1dvcmtzcGFjZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsIE5vZGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLmR1cGxpY2F0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBvdGhlcldvcmtzcGFjZUlkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ3JlYXRpbmcgbmV3IHdvcmtzcGFjZSBidXQgbm90IHVzaW5nIGRhdGEnLCBkYXRhKTtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoY29udGV4dCwgJycsIG1ldGEuV29ya1NwYWNlLCAnW1dlYkN5UGh5XSAtIFdvcmtzcGFjZVNlcnZpY2UuY3JlYXRlV29ya3NwYWNlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG5ld05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobmV3Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgd29yay1zcGFjZSBmcm9tIHRoZSBjb250ZXh0IChkYi9wcm9qZWN0L2JyYW5jaCkuXHJcbiAgICAgICAgICogQHBhcmFtIGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIsIE4uQi4gZG9lcyBub3QgbmVlZCB0byBzcGVjaWZ5IHJlZ2lvbi5cclxuICAgICAgICAgKiBAcGFyYW0gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmRlbGV0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCB3b3Jrc3BhY2VJZCwgbXNnKSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICdXb3Jrc3BhY2VTZXJ2aWNlLmRlbGV0ZVdvcmtzcGFjZSAnICsgd29ya3NwYWNlSWQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmRlc3Ryb3lOb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBtZXNzYWdlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmV4cG9ydFdvcmtzcGFjZSA9IGZ1bmN0aW9uICh3b3Jrc3BhY2VJZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBUT0RPOiBtYWtlIHN1cmUgdGhlIG1ldGhvZHMgYmVsb3cgZ2V0cyByZXNvbHZlZCBhdCBlcnJvciB0b28uXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIHdvcmstc3BhY2VzIGRlZmluZWQgaW4gdGhlIHJvb3Qtbm9kZSB3LnIudC4gZXhpc3RlbmNlIGFuZCBhdHRyaWJ1dGVzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLndvcmtzcGFjZXMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaFdvcmtzcGFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hXb3Jrc3BhY2VzJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlczoge30gLy8gd29ya3NwYWNlID0ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS53b3Jrc3BhY2VzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS53b3Jrc3BhY2VzW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLndvcmtzcGFjZXNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLndvcmtzcGFjZXNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEud29ya3NwYWNlc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCAnJylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocm9vdE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Xb3JrU3BhY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdzSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW3dzSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHdzSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuV29ya1NwYWNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW3dzSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHdzSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiB3c0lkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEud29ya3NwYWNlc1t3c0lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBjb21wb25lbnRzIChkZWZpbmVkIGluIEFDTUZvbGRlcnMpIGluIHRoZSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIgKG11c3QgaGF2ZSBhIHJlZ2lvbklkIGRlZmluZWQpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gY2FsbGVkIG9uIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLWJhc2UuIERhdGEgaXMgdGhlIHVwZGF0ZWQgZGF0YS5jb3VudC5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mQ29tcG9uZW50c18nICsgd29ya3NwYWNlSWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50OiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29udGFpbmVycyAoZGVmaW5lZCBpbiBBRE1Gb2xkZXJzKSBpbiB0aGUgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIHRoZSB1cGRhdGVkIGRhdGEuY291bnQuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaE51bWJlck9mRGVzaWducyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkRlc2lnbnNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRDb250ZXh0LnJlZ2lvbklkKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocGFyZW50Q29udGV4dC5yZWdpb25JZCArICcgaXMgbm90IGEgcmVnaXN0ZXJlZCB3YXRjaGVyISAnICtcclxuICAgICAgICAgICAgICAgICAgICAnVXNlIFwidGhpcy5yZWdpc3RlcldhdGNoZXJcIiBiZWZvcmUgdHJ5aW5nIHRvIGFjY2VzcyBOb2RlIE9iamVjdHMuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiB0ZXN0LWJlbmNoZXMgKGRlZmluZWQgaW4gQVRNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mVGVzdEJlbmNoZXNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCB3YXRjaGVycyBzcGF3bmVkIGZyb20gcGFyZW50Q29udGV4dCwgdGhpcyBzaG91bGQgdHlwaWNhbGx5IGJlIGludm9rZWQgd2hlbiB0aGUgY29udHJvbGxlciBpcyBkZXN0cm95ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFdhdGNoZXJzLFxyXG4gICAgICAgICAgICAgICAga2V5O1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2F0Y2hlcnMgPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGNoaWxkV2F0Y2hlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRXYXRjaGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY2hpbGRXYXRjaGVyc1trZXldLmRiLCBjaGlsZFdhdGNoZXJzW2tleV0ucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgc3BlY2lmaWVkIHdhdGNoZXIgKHJlZ2lvbklkKVxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LmRiIC0gRGF0YWJhc2UgY29ubmVjdGlvbiBvZiBib3RoIHBhcmVudCBhbmQgcmVnaW9uIHRvIGJlIGRlbGV0ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHJlZ2lvbklkIC0gUmVnaW9uIGlkIG9mIHRoZSBzcGF3bmVkIHJlZ2lvbiB0aGF0IHNob3VsZCBiZSBkZWxldGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5jbGVhblVwUmVnaW9uKHBhcmVudENvbnRleHQuZGIsIHJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGNsZWFuLXVwIHJlZ2lvbiBzaW5jZSBwYXJlbnRDb250ZXh0IGlzIG5vdCByZWdpc3RlcmVkLi4nLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdGVycyBhIHdhdGNoZXIgKGNvbnRyb2xsZXIpIHRvIHRoZSBzZXJ2aWNlLiBDYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbiBub2RlcyBiZWNhbWUgYXZhaWxhYmxlIG9yXHJcbiAgICAgICAgICogd2hlbiB0aGV5IGJlY2FtZSB1bmF2YWlsYWJsZS4gVGhlc2UgYXJlIGFsc28gY2FsbGVkIGRpcmVjdGx5IHdpdGggdGhlIHN0YXRlIG9mIHRoZSBOb2RlU2VyaXZjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gLSBDYWxsZWQgd2l0aCB0cnVlIHdoZW4gdGhlcmUgYXJlIG5vIG5vZGVzIHVuYXZhaWxhYmxlIGFuZCBmYWxzZSB3aGVuIHRoZXJlIGFyZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5vbihwYXJlbnRDb250ZXh0LmRiLCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGVub3VnaCwgdGhlIHJlZ2lvbnMgd2lsbCBiZSBjbGVhbmVkIHVwIGluIE5vZGVTZXJ2aWNlLlxyXG4gICAgICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZuKGZhbHNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLm9uKHBhcmVudENvbnRleHQuZGIsICdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgZW5vdWdoLCB0aGUgcmVnaW9ucyBzaG91bGQgYmUgY2xlYW5lZCB1cCBpbiBOb2RlU2VydmljZS5cclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZuKHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ0NvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5sb2dDb250ZXh0KGNvbnRleHQpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgcmVxdWlyZSwgYW5ndWxhciAqL1xyXG4vKipcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycsIFsnZ21lLnNlcnZpY2VzJ10pO1xyXG5yZXF1aXJlKCcuL0ZpbGVTZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vV29ya3NwYWNlU2VydmljZScpO1xyXG5yZXF1aXJlKCcuL0NvbXBvbmVudFNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9EZXNpZ25TZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vVGVzdEJlbmNoU2VydmljZScpOyJdfQ==
