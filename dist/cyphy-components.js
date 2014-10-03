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

            ComponentService.watchComponentDetails(context, $scope.componentId, function (updateObject) {
                // Since watchComponentDetails keeps the data up-to-date there shouldn't be a need to do any
                // updates here..
            })
                .then(function (componentDetails) {
                    $scope.details.properties = componentDetails.interfaces.properties;
                    $scope.details.connectors = componentDetails.interfaces.connectors;
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
//                        {
//                            value: 0,
//                            toolTip: 'Components',
//                            iconClass: 'fa fa-puzzle-piece'
//                        }
                    ],
                    details    : 'Content',
                    detailsTemplateUrl: 'details.html'
                };

                componentItems[componentItem.id] = componentItem;
                items.push(componentItem);
            }
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
         *  Watches a component w.r.t. interfaces and included domain-models.
         * @param parentContext - context of controller.
         * @param componentId
         * @param updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchComponentDetails = function (parentContext, componentId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchComponentDetails_' + componentId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    id: componentId,
                    domainModels: {},   //domainModel: id: <string>, type: <string>
                    interfaces: {
                        properties: {}, //property: {id: <string>, name: <string>, dataType: <string>, valueType <string>}
                        connectors: {}  //connector: {id: <string>, name: <string>, domainPorts: <object> }
                    }
                },
                onPropertyUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDataType = this.getAttribute('DataType'),
                        newValueType = this.getAttribute('ValueType'),
                        hadChanges = false;
                    if (newName !== data.interfaces.properties[id].name) {
                        data.interfaces.properties[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDataType !== data.interfaces.properties[id].dataType) {
                        data.interfaces.properties[id].dataType = newDataType;
                        hadChanges = true;
                    }
                    if (newValueType !== data.interfaces.properties[id].valueType) {
                        data.interfaces.properties[id].valueType = newValueType;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data});
                    }
                },
                onPropertyUnload = function (id) {
                    delete data.interfaces.properties[id];
                    updateListener({id: id, type: 'unload', data: null});
                },
                onConnectorUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        hadChanges = false;
                    if (newName !== data.interfaces.connectors[id].name) {
                        data.interfaces.connectors[id].name = newName;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data});
                    }
                },
                onConnectorUnload = function (id) {
                    delete data.interfaces.connectors[id];
                    updateListener({id: id, type: 'unload', data: null});
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
                                if (childNode.isMetaTypeOf(meta.Property)) {
                                    data.interfaces.properties[childId] = {
                                        id: childId,
                                        name: childNode.getAttribute('name'),
                                        dataType: childNode.getAttribute('DataType'),
                                        valueType: childNode.getAttribute('ValueType')
                                    };
                                    childNode.onUpdate(onPropertyUpdate);
                                    childNode.onUnload(onPropertyUnload);
                                } else if (childNode.isMetaTypeOf(meta.Connector)) {
                                    data.interfaces.connectors[childId] = {
                                        id: childId,
                                        name: childNode.getAttribute('name'),
                                        domainPorts: {}
                                    };
                                    childNode.onUpdate(onConnectorUpdate);
                                    childNode.onUnload(onConnectorUnload);
                                    ///queueList.push(childNode.loadChildren(childNode));
                                } else if (childNode.isMetaTypeOf(meta.DomainModel)) {
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
                                if (newChild.isMetaTypeOf(meta.Property)) {
                                    data.interfaces.properties[childId] = {
                                        id: childId,
                                        name: newChild.getAttribute('name'),
                                        dataType: newChild.getAttribute('DataType'),
                                        valueType: newChild.getAttribute('ValueType')
                                    };
                                    newChild.onUpdate(onPropertyUpdate);
                                    newChild.onUnload(onPropertyUnload);
                                    updateListener({id: childId, type: 'load', data: data});
                                } else if (newChild.isMetaTypeOf(meta.Connector)) {
                                    data.interfaces.connectors[childId] = {
                                        id: childId,
                                        name: newChild.getAttribute('name'),
                                        domainPorts: {}
                                    };
                                    newChild.onUpdate(onConnectorUpdate);
                                    newChild.onUnload(onConnectorUnload);
                                    updateListener({id: childId, type: 'load', data: data});
                                    ///queueList.push(childNode.loadChildren(childNode));
                                } else if (newChild.isMetaTypeOf(meta.DomainModel)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxHSVRcXHdlYmdtZS1jeXBoeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCIuL3NyYy9saWJyYXJ5L2N5cGh5LWNvbXBvbmVudHMuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0NvbXBvbmVudERldGFpbHMvQ29tcG9uZW50RGV0YWlscy5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9EZXNpZ25MaXN0L0Rlc2lnbkxpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0Rlc2lnblRyZWUvRGVzaWduVHJlZS5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Xb3Jrc3BhY2VMaXN0L1dvcmtzcGFjZUxpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0NvbXBvbmVudFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Rlc2lnblNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0ZpbGVTZXJ2aWNlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9UZXN0QmVuY2hTZXJ2aWNlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9Xb3Jrc3BhY2VTZXJ2aWNlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9jeXBoeS1zZXJ2aWNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIHJlcXVpcmUsIGFuZ3VsYXIgKi9cclxuLyoqXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcbi8vIEV4dGVybmFsIGRlcGVuZGVuY2llc1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQtc2hpbScpO1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQnKTtcclxuXHJcbi8vIEludGVybmFsIGRlcGVuZGVuY2llc1xyXG5yZXF1aXJlKCcuL3NlcnZpY2VzL2N5cGh5LXNlcnZpY2VzJyk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycsIFsnY3lwaHkuc2VydmljZXMnLCAnY3lwaHkuY29tcG9uZW50cy50ZW1wbGF0ZXMnLCAnYW5ndWxhckZpbGVVcGxvYWQnXSk7XHJcblxyXG5yZXF1aXJlKCcuL1dvcmtzcGFjZUxpc3QvV29ya3NwYWNlTGlzdCcpO1xyXG5yZXF1aXJlKCcuL0NvbXBvbmVudERldGFpbHMvQ29tcG9uZW50RGV0YWlscycpO1xyXG5yZXF1aXJlKCcuL0NvbXBvbmVudExpc3QvQ29tcG9uZW50TGlzdCcpO1xyXG5yZXF1aXJlKCcuL0Rlc2lnbkxpc3QvRGVzaWduTGlzdCcpO1xyXG5yZXF1aXJlKCcuL0Rlc2lnblRyZWUvRGVzaWduVHJlZScpO1xyXG5yZXF1aXJlKCcuL1Rlc3RCZW5jaExpc3QvVGVzdEJlbmNoTGlzdCcpO1xyXG5cclxuIiwiLyoqIVxuICogQW5ndWxhckpTIGZpbGUgdXBsb2FkIHNoaW0gZm9yIEhUTUw1IEZvcm1EYXRhXG4gKiBAYXV0aG9yICBEYW5pYWwgIDxkYW5pYWwuZmFyaWRAZ21haWwuY29tPlxuICogQHZlcnNpb24gMS42LjEyXG4gKi9cbihmdW5jdGlvbigpIHtcblxudmFyIGhhc0ZsYXNoID0gZnVuY3Rpb24oKSB7XG5cdHRyeSB7XG5cdCAgdmFyIGZvID0gbmV3IEFjdGl2ZVhPYmplY3QoJ1Nob2Nrd2F2ZUZsYXNoLlNob2Nrd2F2ZUZsYXNoJyk7XG5cdCAgaWYgKGZvKSByZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaChlKSB7XG5cdCAgaWYgKG5hdmlnYXRvci5taW1lVHlwZXNbJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJ10gIT0gdW5kZWZpbmVkKSByZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbnZhciBwYXRjaFhIUiA9IGZ1bmN0aW9uKGZuTmFtZSwgbmV3Rm4pIHtcblx0d2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZVtmbk5hbWVdID0gbmV3Rm4od2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZVtmbk5hbWVdKTtcbn07XG5cbmlmICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QpIHtcblx0aWYgKHdpbmRvdy5Gb3JtRGF0YSAmJiAoIXdpbmRvdy5GaWxlQVBJIHx8ICFGaWxlQVBJLmZvcmNlTG9hZCkpIHtcblx0XHQvLyBhbGxvdyBhY2Nlc3MgdG8gQW5ndWxhciBYSFIgcHJpdmF0ZSBmaWVsZDogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9pc3N1ZXMvMTkzNFxuXHRcdHBhdGNoWEhSKCdzZXRSZXF1ZXN0SGVhZGVyJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcblx0XHRcdFx0aWYgKGhlYWRlciA9PT0gJ19fc2V0WEhSXycpIHtcblx0XHRcdFx0XHR2YXIgdmFsID0gdmFsdWUodGhpcyk7XG5cdFx0XHRcdFx0Ly8gZml4IGZvciBhbmd1bGFyIDwgMS4yLjBcblx0XHRcdFx0XHRpZiAodmFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdHZhbCh0aGlzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lciA9IGZ1bmN0aW9uKHhocikge1xuXHRcdFx0aWYgKCF4aHIuX19saXN0ZW5lcnMpIHtcblx0XHRcdFx0aWYgKCF4aHIudXBsb2FkKSB4aHIudXBsb2FkID0ge307XG5cdFx0XHRcdHhoci5fX2xpc3RlbmVycyA9IFtdO1xuXHRcdFx0XHR2YXIgb3JpZ0FkZEV2ZW50TGlzdGVuZXIgPSB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXI7XG5cdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHQsIGZuLCBiKSB7XG5cdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzW3RdID0gZm47XG5cdFx0XHRcdFx0b3JpZ0FkZEV2ZW50TGlzdGVuZXIgJiYgb3JpZ0FkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cGF0Y2hYSFIoJ29wZW4nLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24obSwgdXJsLCBiKSB7XG5cdFx0XHRcdGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lcih0aGlzKTtcblx0XHRcdFx0dGhpcy5fX3VybCA9IHVybDtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIFttLCB1cmwsIGJdKTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdGlmIChlLm1lc3NhZ2UuaW5kZXhPZignQWNjZXNzIGlzIGRlbmllZCcpID4gLTEpIHtcblx0XHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgW20sICdfZml4X2Zvcl9pZV9jcm9zc2RvbWFpbl9fJywgYl0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ2dldFJlc3BvbnNlSGVhZGVyJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGgpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmdldFJlc3BvbnNlSGVhZGVyID8gdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0UmVzcG9uc2VIZWFkZXIoaCkgOiAob3JpZyA9PSBudWxsID8gbnVsbCA6IG9yaWcuYXBwbHkodGhpcywgW2hdKSk7XG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ2dldEFsbFJlc3BvbnNlSGVhZGVycycsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmdldEFsbFJlc3BvbnNlSGVhZGVycyA/IHRoaXMuX19maWxlQXBpWEhSLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdhYm9ydCcsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmFib3J0ID8gdGhpcy5fX2ZpbGVBcGlYSFIuYWJvcnQoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignc2V0UmVxdWVzdEhlYWRlcicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihoZWFkZXIsIHZhbHVlKSB7XG5cdFx0XHRcdGlmIChoZWFkZXIgPT09ICdfX3NldFhIUl8nKSB7XG5cdFx0XHRcdFx0aW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyKHRoaXMpO1xuXHRcdFx0XHRcdHZhciB2YWwgPSB2YWx1ZSh0aGlzKTtcblx0XHRcdFx0XHQvLyBmaXggZm9yIGFuZ3VsYXIgPCAxLjIuMFxuXHRcdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuXHRcdFx0XHRcdFx0dmFsKHRoaXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9fcmVxdWVzdEhlYWRlcnMgPSB0aGlzLl9fcmVxdWVzdEhlYWRlcnMgfHwge307XG5cdFx0XHRcdFx0dGhpcy5fX3JlcXVlc3RIZWFkZXJzW2hlYWRlcl0gPSB2YWx1ZTtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdzZW5kJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgeGhyID0gdGhpcztcblx0XHRcdFx0aWYgKGFyZ3VtZW50c1swXSAmJiBhcmd1bWVudHNbMF0uX19pc1NoaW0pIHtcblx0XHRcdFx0XHR2YXIgZm9ybURhdGEgPSBhcmd1bWVudHNbMF07XG5cdFx0XHRcdFx0dmFyIGNvbmZpZyA9IHtcblx0XHRcdFx0XHRcdHVybDogeGhyLl9fdXJsLFxuXHRcdFx0XHRcdFx0anNvbnA6IGZhbHNlLCAvL3JlbW92ZXMgdGhlIGNhbGxiYWNrIGZvcm0gcGFyYW1cblx0XHRcdFx0XHRcdGNhY2hlOiB0cnVlLCAvL3JlbW92ZXMgdGhlID9maWxlYXBpWFhYIGluIHRoZSB1cmxcblx0XHRcdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbihlcnIsIGZpbGVBcGlYSFIpIHtcblx0XHRcdFx0XHRcdFx0eGhyLl9fY29tcGxldGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0aWYgKCFlcnIgJiYgeGhyLl9fbGlzdGVuZXJzWydsb2FkJ10pIFxuXHRcdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1snbG9hZCddKHt0eXBlOiAnbG9hZCcsIGxvYWRlZDogeGhyLl9fbG9hZGVkLCB0b3RhbDogeGhyLl9fdG90YWwsIHRhcmdldDogeGhyLCBsZW5ndGhDb21wdXRhYmxlOiB0cnVlfSk7XG5cdFx0XHRcdFx0XHRcdGlmICghZXJyICYmIHhoci5fX2xpc3RlbmVyc1snbG9hZGVuZCddKSBcblx0XHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ2xvYWRlbmQnXSh7dHlwZTogJ2xvYWRlbmQnLCBsb2FkZWQ6IHhoci5fX2xvYWRlZCwgdG90YWw6IHhoci5fX3RvdGFsLCB0YXJnZXQ6IHhociwgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyID09PSAnYWJvcnQnICYmIHhoci5fX2xpc3RlbmVyc1snYWJvcnQnXSkgXG5cdFx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydhYm9ydCddKHt0eXBlOiAnYWJvcnQnLCBsb2FkZWQ6IHhoci5fX2xvYWRlZCwgdG90YWw6IHhoci5fX3RvdGFsLCB0YXJnZXQ6IHhociwgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZmlsZUFwaVhIUi5zdGF0dXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3N0YXR1cycsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiAoZmlsZUFwaVhIUi5zdGF0dXMgPT0gMCAmJiBlcnIgJiYgZXJyICE9PSAnYWJvcnQnKSA/IDUwMCA6IGZpbGVBcGlYSFIuc3RhdHVzfX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZmlsZUFwaVhIUi5zdGF0dXNUZXh0ICE9PSB1bmRlZmluZWQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdzdGF0dXNUZXh0Jywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIGZpbGVBcGlYSFIuc3RhdHVzVGV4dH19KTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3JlYWR5U3RhdGUnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gNH19KTtcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGVBcGlYSFIucmVzcG9uc2UgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3Jlc3BvbnNlJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIGZpbGVBcGlYSFIucmVzcG9uc2V9fSk7XG5cdFx0XHRcdFx0XHRcdHZhciByZXNwID0gZmlsZUFwaVhIUi5yZXNwb25zZVRleHQgfHwgKGVyciAmJiBmaWxlQXBpWEhSLnN0YXR1cyA9PSAwICYmIGVyciAhPT0gJ2Fib3J0JyA/IGVyciA6IHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZXNwb25zZVRleHQnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gcmVzcH19KTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3Jlc3BvbnNlJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIHJlc3B9fSk7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdlcnInLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gZXJyfX0pO1xuXHRcdFx0XHRcdFx0XHR4aHIuX19maWxlQXBpWEhSID0gZmlsZUFwaVhIUjtcblx0XHRcdFx0XHRcdFx0aWYgKHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UpIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UoKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRmaWxlcHJvZ3Jlc3M6IGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdFx0ZS50YXJnZXQgPSB4aHI7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1sncHJvZ3Jlc3MnXSAmJiB4aHIuX19saXN0ZW5lcnNbJ3Byb2dyZXNzJ10oZSk7XG5cdFx0XHRcdFx0XHRcdHhoci5fX3RvdGFsID0gZS50b3RhbDtcblx0XHRcdFx0XHRcdFx0eGhyLl9fbG9hZGVkID0gZS5sb2FkZWQ7XG5cdFx0XHRcdFx0XHRcdGlmIChlLnRvdGFsID09PSBlLmxvYWRlZCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGZpeCBmbGFzaCBpc3N1ZSB0aGF0IGRvZXNuJ3QgY2FsbCBjb21wbGV0ZSBpZiB0aGVyZSBpcyBubyByZXNwb25zZSB0ZXh0IGZyb20gdGhlIHNlcnZlciAgXG5cdFx0XHRcdFx0XHRcdFx0dmFyIF90aGlzID0gdGhpc1xuXHRcdFx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIXhoci5fX2NvbXBsZXRlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID0gZnVuY3Rpb24oKXt9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRfdGhpcy5jb21wbGV0ZShudWxsLCB7c3RhdHVzOiAyMDQsIHN0YXR1c1RleHQ6ICdObyBDb250ZW50J30pO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0sIDEwMDAwKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGhlYWRlcnM6IHhoci5fX3JlcXVlc3RIZWFkZXJzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbmZpZy5kYXRhID0ge307XG5cdFx0XHRcdFx0Y29uZmlnLmZpbGVzID0ge31cblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZvcm1EYXRhLmRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBpdGVtID0gZm9ybURhdGEuZGF0YVtpXTtcblx0XHRcdFx0XHRcdGlmIChpdGVtLnZhbCAhPSBudWxsICYmIGl0ZW0udmFsLm5hbWUgIT0gbnVsbCAmJiBpdGVtLnZhbC5zaXplICE9IG51bGwgJiYgaXRlbS52YWwudHlwZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGNvbmZpZy5maWxlc1tpdGVtLmtleV0gPSBpdGVtLnZhbDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvbmZpZy5kYXRhW2l0ZW0ua2V5XSA9IGl0ZW0udmFsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZiAoIWhhc0ZsYXNoKCkpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgJ0Fkb2RlIEZsYXNoIFBsYXllciBuZWVkIHRvIGJlIGluc3RhbGxlZC4gVG8gY2hlY2sgYWhlYWQgdXNlIFwiRmlsZUFQSS5oYXNGbGFzaFwiJztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHhoci5fX2ZpbGVBcGlYSFIgPSBGaWxlQVBJLnVwbG9hZChjb25maWcpO1xuXHRcdFx0XHRcdH0sIDEpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkoeGhyLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0d2luZG93LlhNTEh0dHBSZXF1ZXN0Ll9faXNTaGltID0gdHJ1ZTtcbn1cblxuaWYgKCF3aW5kb3cuRm9ybURhdGEgfHwgKHdpbmRvdy5GaWxlQVBJICYmIEZpbGVBUEkuZm9yY2VMb2FkKSkge1xuXHR2YXIgYWRkRmxhc2ggPSBmdW5jdGlvbihlbGVtKSB7XG5cdFx0aWYgKCFoYXNGbGFzaCgpKSB7XG5cdFx0XHR0aHJvdyAnQWRvZGUgRmxhc2ggUGxheWVyIG5lZWQgdG8gYmUgaW5zdGFsbGVkLiBUbyBjaGVjayBhaGVhZCB1c2UgXCJGaWxlQVBJLmhhc0ZsYXNoXCInO1xuXHRcdH1cblx0XHR2YXIgZWwgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbSk7XG5cdFx0aWYgKCFlbC5hdHRyKCdkaXNhYmxlZCcpKSB7XG5cdFx0XHRpZiAoIWVsLmhhc0NsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKSAmJiAoZWxlbS5nZXRBdHRyaWJ1dGUoJ25nLWZpbGUtc2VsZWN0JykgIT0gbnVsbCB8fCBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1uZy1maWxlLXNlbGVjdCcpICE9IG51bGwpKSB7XG5cdFx0XHRcdGlmIChGaWxlQVBJLndyYXBJbnNpZGVEaXYpIHtcblx0XHRcdFx0XHR2YXIgd3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHRcdHdyYXAuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJqcy1maWxlYXBpLXdyYXBwZXJcIiBzdHlsZT1cInBvc2l0aW9uOnJlbGF0aXZlOyBvdmVyZmxvdzpoaWRkZW5cIj48L2Rpdj4nO1xuXHRcdFx0XHRcdHdyYXAgPSB3cmFwLmZpcnN0Q2hpbGQ7XG5cdFx0XHRcdFx0dmFyIHBhcmVudCA9IGVsZW0ucGFyZW50Tm9kZTtcblx0XHRcdFx0XHRwYXJlbnQuaW5zZXJ0QmVmb3JlKHdyYXAsIGVsZW0pO1xuXHRcdFx0XHRcdHBhcmVudC5yZW1vdmVDaGlsZChlbGVtKTtcblx0XHRcdFx0XHR3cmFwLmFwcGVuZENoaWxkKGVsZW0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGVsLmFkZENsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKTtcblx0XHRcdFx0XHRpZiAoZWwucGFyZW50KClbMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXykge1xuXHRcdFx0XHRcdFx0aWYgKGVsLnBhcmVudCgpLmNzcygncG9zaXRpb24nKSA9PT0gJycgfHwgZWwucGFyZW50KCkuY3NzKCdwb3NpdGlvbicpID09PSAnc3RhdGljJykge1xuXHRcdFx0XHRcdFx0XHRlbC5wYXJlbnQoKS5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbC5jc3MoJ3RvcCcsIDApLmNzcygnYm90dG9tJywgMCkuY3NzKCdsZWZ0JywgMCkuY3NzKCdyaWdodCcsIDApLmNzcygnd2lkdGgnLCAnMTAwJScpLmNzcygnaGVpZ2h0JywgJzEwMCUnKS5cblx0XHRcdFx0XHRcdFx0Y3NzKCdwYWRkaW5nJywgMCkuY3NzKCdtYXJnaW4nLCAwKTtcblx0XHRcdFx0XHRcdGVsLnBhcmVudCgpLnVuYmluZCgnY2xpY2snLCBlbC5wYXJlbnQoKVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHZhciBjaGFuZ2VGbldyYXBwZXIgPSBmdW5jdGlvbihmbikge1xuXHRcdHJldHVybiBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBmaWxlcyA9IEZpbGVBUEkuZ2V0RmlsZXMoZXZ0KTtcblx0XHRcdC8vanVzdCBhIGRvdWJsZSBjaGVjayBmb3IgIzIzM1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoZmlsZXNbaV0uc2l6ZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS5zaXplID0gMDtcblx0XHRcdFx0aWYgKGZpbGVzW2ldLm5hbWUgPT09IHVuZGVmaW5lZCkgZmlsZXNbaV0ubmFtZSA9ICdmaWxlJztcblx0XHRcdFx0aWYgKGZpbGVzW2ldLnR5cGUgPT09IHVuZGVmaW5lZCkgZmlsZXNbaV0udHlwZSA9ICd1bmRlZmluZWQnO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFldnQudGFyZ2V0KSB7XG5cdFx0XHRcdGV2dC50YXJnZXQgPSB7fTtcblx0XHRcdH1cblx0XHRcdGV2dC50YXJnZXQuZmlsZXMgPSBmaWxlcztcblx0XHRcdC8vIGlmIGV2dC50YXJnZXQuZmlsZXMgaXMgbm90IHdyaXRhYmxlIHVzZSBoZWxwZXIgZmllbGRcblx0XHRcdGlmIChldnQudGFyZ2V0LmZpbGVzICE9IGZpbGVzKSB7XG5cdFx0XHRcdGV2dC5fX2ZpbGVzXyA9IGZpbGVzO1xuXHRcdFx0fVxuXHRcdFx0KGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzKS5pdGVtID0gZnVuY3Rpb24oaSkge1xuXHRcdFx0XHRyZXR1cm4gKGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzKVtpXSB8fCBudWxsO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGZuKSBmbi5hcHBseSh0aGlzLCBbZXZ0XSk7XG5cdFx0fTtcblx0fTtcblx0dmFyIGlzRmlsZUNoYW5nZSA9IGZ1bmN0aW9uKGVsZW0sIGUpIHtcblx0XHRyZXR1cm4gKGUudG9Mb3dlckNhc2UoKSA9PT0gJ2NoYW5nZScgfHwgZS50b0xvd2VyQ2FzZSgpID09PSAnb25jaGFuZ2UnKSAmJiBlbGVtLmdldEF0dHJpYnV0ZSgndHlwZScpID09ICdmaWxlJztcblx0fVxuXHRpZiAoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSAoZnVuY3Rpb24ob3JpZ0FkZEV2ZW50TGlzdGVuZXIpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihlLCBmbiwgYiwgZCkge1xuXHRcdFx0XHRpZiAoaXNGaWxlQ2hhbmdlKHRoaXMsIGUpKSB7XG5cdFx0XHRcdFx0YWRkRmxhc2godGhpcyk7XG5cdFx0XHRcdFx0b3JpZ0FkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgW2UsIGNoYW5nZUZuV3JhcHBlcihmbiksIGIsIGRdKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBbZSwgZm4sIGIsIGRdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIpO1xuXHR9XG5cdGlmIChIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hdHRhY2hFdmVudCkge1xuXHRcdEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmF0dGFjaEV2ZW50ID0gKGZ1bmN0aW9uKG9yaWdBdHRhY2hFdmVudCkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGUsIGZuKSB7XG5cdFx0XHRcdGlmIChpc0ZpbGVDaGFuZ2UodGhpcywgZSkpIHtcblx0XHRcdFx0XHRhZGRGbGFzaCh0aGlzKTtcblx0XHRcdFx0XHRpZiAod2luZG93LmpRdWVyeSkge1xuXHRcdFx0XHRcdFx0Ly8gZml4IGZvciAjMjgxIGpRdWVyeSBvbiBJRThcblx0XHRcdFx0XHRcdGFuZ3VsYXIuZWxlbWVudCh0aGlzKS5iaW5kKCdjaGFuZ2UnLCBjaGFuZ2VGbldyYXBwZXIobnVsbCkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvcmlnQXR0YWNoRXZlbnQuYXBwbHkodGhpcywgW2UsIGNoYW5nZUZuV3JhcHBlcihmbildKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZ0F0dGFjaEV2ZW50LmFwcGx5KHRoaXMsIFtlLCBmbl0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYXR0YWNoRXZlbnQpO1xuXHR9XG5cblx0d2luZG93LkZvcm1EYXRhID0gRm9ybURhdGEgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YXBwZW5kOiBmdW5jdGlvbihrZXksIHZhbCwgbmFtZSkge1xuXHRcdFx0XHR0aGlzLmRhdGEucHVzaCh7XG5cdFx0XHRcdFx0a2V5OiBrZXksXG5cdFx0XHRcdFx0dmFsOiB2YWwsXG5cdFx0XHRcdFx0bmFtZTogbmFtZVxuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRkYXRhOiBbXSxcblx0XHRcdF9faXNTaGltOiB0cnVlXG5cdFx0fTtcblx0fTtcblxuXHQoZnVuY3Rpb24gKCkge1xuXHRcdC8vbG9hZCBGaWxlQVBJXG5cdFx0aWYgKCF3aW5kb3cuRmlsZUFQSSkge1xuXHRcdFx0d2luZG93LkZpbGVBUEkgPSB7fTtcblx0XHR9XG5cdFx0aWYgKEZpbGVBUEkuZm9yY2VMb2FkKSB7XG5cdFx0XHRGaWxlQVBJLmh0bWw1ID0gZmFsc2U7XG5cdFx0fVxuXHRcdFxuXHRcdGlmICghRmlsZUFQSS51cGxvYWQpIHtcblx0XHRcdHZhciBqc1VybCwgYmFzZVBhdGgsIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpLCBhbGxTY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpLCBpLCBpbmRleCwgc3JjO1xuXHRcdFx0aWYgKHdpbmRvdy5GaWxlQVBJLmpzVXJsKSB7XG5cdFx0XHRcdGpzVXJsID0gd2luZG93LkZpbGVBUEkuanNVcmw7XG5cdFx0XHR9IGVsc2UgaWYgKHdpbmRvdy5GaWxlQVBJLmpzUGF0aCkge1xuXHRcdFx0XHRiYXNlUGF0aCA9IHdpbmRvdy5GaWxlQVBJLmpzUGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBhbGxTY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0c3JjID0gYWxsU2NyaXB0c1tpXS5zcmM7XG5cdFx0XHRcdFx0aW5kZXggPSBzcmMuaW5kZXhPZignYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzJylcblx0XHRcdFx0XHRpZiAoaW5kZXggPT0gLTEpIHtcblx0XHRcdFx0XHRcdGluZGV4ID0gc3JjLmluZGV4T2YoJ2FuZ3VsYXItZmlsZS11cGxvYWQtc2hpbS5taW4uanMnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdFx0XHRcdGJhc2VQYXRoID0gc3JjLnN1YnN0cmluZygwLCBpbmRleCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKEZpbGVBUEkuc3RhdGljUGF0aCA9PSBudWxsKSBGaWxlQVBJLnN0YXRpY1BhdGggPSBiYXNlUGF0aDtcblx0XHRcdHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ3NyYycsIGpzVXJsIHx8IGJhc2VQYXRoICsgJ0ZpbGVBUEkubWluLmpzJyk7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cdFx0XHRGaWxlQVBJLmhhc0ZsYXNoID0gaGFzRmxhc2goKTtcblx0XHR9XG5cdH0pKCk7XG5cdEZpbGVBUEkuZGlzYWJsZUZpbGVJbnB1dCA9IGZ1bmN0aW9uKGVsZW0sIGRpc2FibGUpIHtcblx0XHRpZiAoZGlzYWJsZSkge1xuXHRcdFx0ZWxlbS5yZW1vdmVDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJylcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWxlbS5hZGRDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJyk7XG5cdFx0fVxuXHR9XG59XG5cblxuaWYgKCF3aW5kb3cuRmlsZVJlYWRlcikge1xuXHR3aW5kb3cuRmlsZVJlYWRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXMsIGxvYWRTdGFydGVkID0gZmFsc2U7XG5cdFx0dGhpcy5saXN0ZW5lcnMgPSB7fTtcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBmbikge1xuXHRcdFx0X3RoaXMubGlzdGVuZXJzW3R5cGVdID0gX3RoaXMubGlzdGVuZXJzW3R5cGVdIHx8IFtdO1xuXHRcdFx0X3RoaXMubGlzdGVuZXJzW3R5cGVdLnB1c2goZm4pO1xuXHRcdH07XG5cdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgZm4pIHtcblx0XHRcdF90aGlzLmxpc3RlbmVyc1t0eXBlXSAmJiBfdGhpcy5saXN0ZW5lcnNbdHlwZV0uc3BsaWNlKF90aGlzLmxpc3RlbmVyc1t0eXBlXS5pbmRleE9mKGZuKSwgMSk7XG5cdFx0fTtcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBsaXN0ID0gX3RoaXMubGlzdGVuZXJzW2V2dC50eXBlXTtcblx0XHRcdGlmIChsaXN0KSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGxpc3RbaV0uY2FsbChfdGhpcywgZXZ0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5vbmFib3J0ID0gdGhpcy5vbmVycm9yID0gdGhpcy5vbmxvYWQgPSB0aGlzLm9ubG9hZHN0YXJ0ID0gdGhpcy5vbmxvYWRlbmQgPSB0aGlzLm9ucHJvZ3Jlc3MgPSBudWxsO1xuXG5cdFx0dmFyIGNvbnN0cnVjdEV2ZW50ID0gZnVuY3Rpb24odHlwZSwgZXZ0KSB7XG5cdFx0XHR2YXIgZSA9IHt0eXBlOiB0eXBlLCB0YXJnZXQ6IF90aGlzLCBsb2FkZWQ6IGV2dC5sb2FkZWQsIHRvdGFsOiBldnQudG90YWwsIGVycm9yOiBldnQuZXJyb3J9O1xuXHRcdFx0aWYgKGV2dC5yZXN1bHQgIT0gbnVsbCkgZS50YXJnZXQucmVzdWx0ID0gZXZ0LnJlc3VsdDtcblx0XHRcdHJldHVybiBlO1xuXHRcdH07XG5cdFx0dmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRpZiAoIWxvYWRTdGFydGVkKSB7XG5cdFx0XHRcdGxvYWRTdGFydGVkID0gdHJ1ZTtcblx0XHRcdFx0X3RoaXMub25sb2Fkc3RhcnQgJiYgdGhpcy5vbmxvYWRzdGFydChjb25zdHJ1Y3RFdmVudCgnbG9hZHN0YXJ0JywgZXZ0KSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZXZ0LnR5cGUgPT09ICdsb2FkJykge1xuXHRcdFx0XHRfdGhpcy5vbmxvYWRlbmQgJiYgX3RoaXMub25sb2FkZW5kKGNvbnN0cnVjdEV2ZW50KCdsb2FkZW5kJywgZXZ0KSk7XG5cdFx0XHRcdHZhciBlID0gY29uc3RydWN0RXZlbnQoJ2xvYWQnLCBldnQpO1xuXHRcdFx0XHRfdGhpcy5vbmxvYWQgJiYgX3RoaXMub25sb2FkKGUpO1xuXHRcdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuXHRcdFx0fSBlbHNlIGlmIChldnQudHlwZSA9PT0gJ3Byb2dyZXNzJykge1xuXHRcdFx0XHR2YXIgZSA9IGNvbnN0cnVjdEV2ZW50KCdwcm9ncmVzcycsIGV2dCk7XG5cdFx0XHRcdF90aGlzLm9ucHJvZ3Jlc3MgJiYgX3RoaXMub25wcm9ncmVzcyhlKTtcblx0XHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBlID0gY29uc3RydWN0RXZlbnQoJ2Vycm9yJywgZXZ0KTtcblx0XHRcdFx0X3RoaXMub25lcnJvciAmJiBfdGhpcy5vbmVycm9yKGUpO1xuXHRcdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5yZWFkQXNBcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzQmluYXJ5U3RyaW5nKGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdFx0dGhpcy5yZWFkQXNCaW5hcnlTdHJpbmcgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc0JpbmFyeVN0cmluZyhmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHRcdHRoaXMucmVhZEFzRGF0YVVSTCA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzRGF0YVVSTChmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHRcdHRoaXMucmVhZEFzVGV4dCA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzVGV4dChmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHR9XG59XG5cbn0pKCk7XG4iLCIvKiohXG4gKiBBbmd1bGFySlMgZmlsZSB1cGxvYWQvZHJvcCBkaXJlY3RpdmUgd2l0aCBodHRwIHBvc3QgYW5kIHByb2dyZXNzXG4gKiBAYXV0aG9yICBEYW5pYWwgIDxkYW5pYWwuZmFyaWRAZ21haWwuY29tPlxuICogQHZlcnNpb24gMS42LjEyXG4gKi9cbihmdW5jdGlvbigpIHtcblxudmFyIGFuZ3VsYXJGaWxlVXBsb2FkID0gYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXJGaWxlVXBsb2FkJywgW10pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5zZXJ2aWNlKCckdXBsb2FkJywgWyckaHR0cCcsICckcScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRodHRwLCAkcSwgJHRpbWVvdXQpIHtcblx0ZnVuY3Rpb24gc2VuZEh0dHAoY29uZmlnKSB7XG5cdFx0Y29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QgfHwgJ1BPU1QnO1xuXHRcdGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cdFx0Y29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgPSBjb25maWcudHJhbnNmb3JtUmVxdWVzdCB8fCBmdW5jdGlvbihkYXRhLCBoZWFkZXJzR2V0dGVyKSB7XG5cdFx0XHRpZiAod2luZG93LkFycmF5QnVmZmVyICYmIGRhdGEgaW5zdGFuY2VvZiB3aW5kb3cuQXJyYXlCdWZmZXIpIHtcblx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gJGh0dHAuZGVmYXVsdHMudHJhbnNmb3JtUmVxdWVzdFswXShkYXRhLCBoZWFkZXJzR2V0dGVyKTtcblx0XHR9O1xuXHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cblx0XHRpZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0Ll9faXNTaGltKSB7XG5cdFx0XHRjb25maWcuaGVhZGVyc1snX19zZXRYSFJfJ10gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHhocikge1xuXHRcdFx0XHRcdGlmICgheGhyKSByZXR1cm47XG5cdFx0XHRcdFx0Y29uZmlnLl9fWEhSID0geGhyO1xuXHRcdFx0XHRcdGNvbmZpZy54aHJGbiAmJiBjb25maWcueGhyRm4oeGhyKTtcblx0XHRcdFx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFx0ZGVmZXJyZWQubm90aWZ5KGUpO1xuXHRcdFx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdFx0XHQvL2ZpeCBmb3IgZmlyZWZveCBub3QgZmlyaW5nIHVwbG9hZCBwcm9ncmVzcyBlbmQsIGFsc28gSUU4LTlcblx0XHRcdFx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XHRpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XG5cdFx0XHRcdFx0XHRcdGRlZmVycmVkLm5vdGlmeShlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdCRodHRwKGNvbmZpZykudGhlbihmdW5jdGlvbihyKXtkZWZlcnJlZC5yZXNvbHZlKHIpfSwgZnVuY3Rpb24oZSl7ZGVmZXJyZWQucmVqZWN0KGUpfSwgZnVuY3Rpb24obil7ZGVmZXJyZWQubm90aWZ5KG4pfSk7XG5cdFx0XG5cdFx0dmFyIHByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlO1xuXHRcdHByb21pc2Uuc3VjY2VzcyA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0Zm4ocmVzcG9uc2UuZGF0YSwgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5oZWFkZXJzLCBjb25maWcpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXG5cdFx0cHJvbWlzZS5lcnJvciA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRwcm9taXNlLnRoZW4obnVsbCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0Zm4ocmVzcG9uc2UuZGF0YSwgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5oZWFkZXJzLCBjb25maWcpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXG5cdFx0cHJvbWlzZS5wcm9ncmVzcyA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRwcm9taXNlLnRoZW4obnVsbCwgbnVsbCwgZnVuY3Rpb24odXBkYXRlKSB7XG5cdFx0XHRcdGZuKHVwZGF0ZSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cdFx0cHJvbWlzZS5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKGNvbmZpZy5fX1hIUikge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRjb25maWcuX19YSFIuYWJvcnQoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXHRcdHByb21pc2UueGhyID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdGNvbmZpZy54aHJGbiA9IChmdW5jdGlvbihvcmlnWGhyRm4pIHtcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdG9yaWdYaHJGbiAmJiBvcmlnWGhyRm4uYXBwbHkocHJvbWlzZSwgYXJndW1lbnRzKTtcblx0XHRcdFx0XHRmbi5hcHBseShwcm9taXNlLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KShjb25maWcueGhyRm4pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblx0XHRcblx0XHRyZXR1cm4gcHJvbWlzZTtcblx0fVxuXG5cdHRoaXMudXBsb2FkID0gZnVuY3Rpb24oY29uZmlnKSB7XG5cdFx0Y29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblx0XHRjb25maWcuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB1bmRlZmluZWQ7XG5cdFx0Y29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgPSBjb25maWcudHJhbnNmb3JtUmVxdWVzdCB8fCAkaHR0cC5kZWZhdWx0cy50cmFuc2Zvcm1SZXF1ZXN0O1xuXHRcdHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdHZhciBvcmlnVHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0O1xuXHRcdHZhciBvcmlnRGF0YSA9IGNvbmZpZy5kYXRhO1xuXHRcdGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID0gZnVuY3Rpb24oZm9ybURhdGEsIGhlYWRlckdldHRlcikge1xuXHRcdFx0aWYgKG9yaWdEYXRhKSB7XG5cdFx0XHRcdGlmIChjb25maWcuZm9ybURhdGFBcHBlbmRlcikge1xuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBvcmlnRGF0YSkge1xuXHRcdFx0XHRcdFx0dmFyIHZhbCA9IG9yaWdEYXRhW2tleV07XG5cdFx0XHRcdFx0XHRjb25maWcuZm9ybURhdGFBcHBlbmRlcihmb3JtRGF0YSwga2V5LCB2YWwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gb3JpZ0RhdGEpIHtcblx0XHRcdFx0XHRcdHZhciB2YWwgPSBvcmlnRGF0YVtrZXldO1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcmlnVHJhbnNmb3JtUmVxdWVzdCA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdHZhbCA9IG9yaWdUcmFuc2Zvcm1SZXF1ZXN0KHZhbCwgaGVhZGVyR2V0dGVyKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb3JpZ1RyYW5zZm9ybVJlcXVlc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdHJhbnNmb3JtRm4gPSBvcmlnVHJhbnNmb3JtUmVxdWVzdFtpXTtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHRyYW5zZm9ybUZuID09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhbCA9IHRyYW5zZm9ybUZuKHZhbCwgaGVhZGVyR2V0dGVyKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChrZXksIHZhbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb25maWcuZmlsZSAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBmaWxlRm9ybU5hbWUgPSBjb25maWcuZmlsZUZvcm1EYXRhTmFtZSB8fCAnZmlsZSc7XG5cblx0XHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChjb25maWcuZmlsZSkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcblx0XHRcdFx0XHR2YXIgaXNGaWxlRm9ybU5hbWVTdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZmlsZUZvcm1OYW1lKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWcuZmlsZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGlzRmlsZUZvcm1OYW1lU3RyaW5nID8gZmlsZUZvcm1OYW1lIDogZmlsZUZvcm1OYW1lW2ldLCBjb25maWcuZmlsZVtpXSwgXG5cdFx0XHRcdFx0XHRcdFx0KGNvbmZpZy5maWxlTmFtZSAmJiBjb25maWcuZmlsZU5hbWVbaV0pIHx8IGNvbmZpZy5maWxlW2ldLm5hbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmb3JtRGF0YS5hcHBlbmQoZmlsZUZvcm1OYW1lLCBjb25maWcuZmlsZSwgY29uZmlnLmZpbGVOYW1lIHx8IGNvbmZpZy5maWxlLm5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZm9ybURhdGE7XG5cdFx0fTtcblxuXHRcdGNvbmZpZy5kYXRhID0gZm9ybURhdGE7XG5cblx0XHRyZXR1cm4gc2VuZEh0dHAoY29uZmlnKTtcblx0fTtcblxuXHR0aGlzLmh0dHAgPSBmdW5jdGlvbihjb25maWcpIHtcblx0XHRyZXR1cm4gc2VuZEh0dHAoY29uZmlnKTtcblx0fVxufV0pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nRmlsZVNlbGVjdCcsIFsgJyRwYXJzZScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRwYXJzZSwgJHRpbWVvdXQpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRyKSB7XG5cdFx0dmFyIGZuID0gJHBhcnNlKGF0dHJbJ25nRmlsZVNlbGVjdCddKTtcblx0XHRpZiAoZWxlbVswXS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdpbnB1dCcgfHwgKGVsZW0uYXR0cigndHlwZScpICYmIGVsZW0uYXR0cigndHlwZScpLnRvTG93ZXJDYXNlKCkpICE9PSAnZmlsZScpIHtcblx0XHRcdHZhciBmaWxlRWxlbSA9IGFuZ3VsYXIuZWxlbWVudCgnPGlucHV0IHR5cGU9XCJmaWxlXCI+Jylcblx0XHRcdHZhciBhdHRycyA9IGVsZW1bMF0uYXR0cmlidXRlcztcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXR0cnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGF0dHJzW2ldLm5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ3R5cGUnKSB7XG5cdFx0XHRcdFx0ZmlsZUVsZW0uYXR0cihhdHRyc1tpXS5uYW1lLCBhdHRyc1tpXS52YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChhdHRyW1wibXVsdGlwbGVcIl0pIGZpbGVFbGVtLmF0dHIoXCJtdWx0aXBsZVwiLCBcInRydWVcIik7XG5cdFx0XHRmaWxlRWxlbS5jc3MoXCJ3aWR0aFwiLCBcIjFweFwiKS5jc3MoXCJoZWlnaHRcIiwgXCIxcHhcIikuY3NzKFwib3BhY2l0eVwiLCAwKS5jc3MoXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIpLmNzcygnZmlsdGVyJywgJ2FscGhhKG9wYWNpdHk9MCknKVxuXHRcdFx0XHRcdC5jc3MoXCJwYWRkaW5nXCIsIDApLmNzcyhcIm1hcmdpblwiLCAwKS5jc3MoXCJvdmVyZmxvd1wiLCBcImhpZGRlblwiKTtcblx0XHRcdGZpbGVFbGVtLmF0dHIoJ19fd3JhcHBlcl9mb3JfcGFyZW50XycsIHRydWUpO1xuXG4vL1x0XHRcdGZpbGVFbGVtLmNzcyhcInRvcFwiLCAwKS5jc3MoXCJib3R0b21cIiwgMCkuY3NzKFwibGVmdFwiLCAwKS5jc3MoXCJyaWdodFwiLCAwKS5jc3MoXCJ3aWR0aFwiLCBcIjEwMCVcIikuXG4vL1x0XHRcdFx0XHRjc3MoXCJvcGFjaXR5XCIsIDApLmNzcyhcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIikuY3NzKCdmaWx0ZXInLCAnYWxwaGEob3BhY2l0eT0wKScpLmNzcyhcInBhZGRpbmdcIiwgMCkuY3NzKFwibWFyZ2luXCIsIDApO1xuXHRcdFx0ZWxlbS5hcHBlbmQoZmlsZUVsZW0pO1xuXHRcdFx0ZWxlbVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfICA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmaWxlRWxlbVswXS5jbGljaygpO1xuXHRcdFx0fTsgXG5cdFx0XHRlbGVtLmJpbmQoJ2NsaWNrJywgZWxlbVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfKTtcblx0XHRcdGVsZW0uY3NzKFwib3ZlcmZsb3dcIiwgXCJoaWRkZW5cIik7XG4vL1x0XHRcdGlmIChmaWxlRWxlbS5wYXJlbnQoKVswXSAhPSBlbGVtWzBdKSB7XG4vL1x0XHRcdFx0Ly9maXggIzI5OCBidXR0b24gZWxlbWVudFxuLy9cdFx0XHRcdGVsZW0ud3JhcCgnPHNwYW4+Jyk7XG4vL1x0XHRcdFx0ZWxlbS5jc3MoXCJ6LWluZGV4XCIsIFwiLTEwMDBcIilcbi8vXHRcdFx0XHRlbGVtLnBhcmVudCgpLmFwcGVuZChmaWxlRWxlbSk7XG4vL1x0XHRcdFx0ZWxlbSA9IGVsZW0ucGFyZW50KCk7XG4vL1x0XHRcdH1cbi8vXHRcdFx0aWYgKGVsZW0uY3NzKFwicG9zaXRpb25cIikgPT09ICcnIHx8IGVsZW0uY3NzKFwicG9zaXRpb25cIikgPT09ICdzdGF0aWMnKSB7XG4vL1x0XHRcdFx0ZWxlbS5jc3MoXCJwb3NpdGlvblwiLCBcInJlbGF0aXZlXCIpO1xuLy9cdFx0XHR9XG5cdFx0XHRlbGVtID0gZmlsZUVsZW07XG5cdFx0fVxuXHRcdGVsZW0uYmluZCgnY2hhbmdlJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgZmlsZXMgPSBbXSwgZmlsZUxpc3QsIGk7XG5cdFx0XHRmaWxlTGlzdCA9IGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzO1xuXHRcdFx0aWYgKGZpbGVMaXN0ICE9IG51bGwpIHtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGZpbGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0ZmlsZXMucHVzaChmaWxlTGlzdC5pdGVtKGkpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZuKHNjb3BlLCB7XG5cdFx0XHRcdFx0JGZpbGVzIDogZmlsZXMsXG5cdFx0XHRcdFx0JGV2ZW50IDogZXZ0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0Ly8gcmVtb3ZlZCB0aGlzIHNpbmNlIGl0IHdhcyBjb25mdXNpbmcgaWYgdGhlIHVzZXIgY2xpY2sgb24gYnJvd3NlIGFuZCB0aGVuIGNhbmNlbCAjMTgxXG4vL1x0XHRlbGVtLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbi8vXHRcdFx0dGhpcy52YWx1ZSA9IG51bGw7XG4vL1x0XHR9KTtcblxuXHRcdC8vIHJlbW92ZWQgYmVjYXVzZSBvZiAjMjUzIGJ1Z1xuXHRcdC8vIHRvdWNoIHNjcmVlbnNcbi8vXHRcdGlmICgoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB8fFxuLy9cdFx0XHRcdChuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPiAwKSB8fCAobmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMgPiAwKSkge1xuLy9cdFx0XHRlbGVtLmJpbmQoJ3RvdWNoZW5kJywgZnVuY3Rpb24oZSkge1xuLy9cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcbi8vXHRcdFx0XHRlLnRhcmdldC5jbGljaygpO1xuLy9cdFx0XHR9KTtcbi8vXHRcdH1cblx0fTtcbn0gXSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdGaWxlRHJvcEF2YWlsYWJsZScsIFsgJyRwYXJzZScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRwYXJzZSwgJHRpbWVvdXQpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRyKSB7XG5cdFx0aWYgKCdkcmFnZ2FibGUnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSkge1xuXHRcdFx0dmFyIGZuID0gJHBhcnNlKGF0dHJbJ25nRmlsZURyb3BBdmFpbGFibGUnXSk7XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Zm4oc2NvcGUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufSBdKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ0ZpbGVEcm9wJywgWyAnJHBhcnNlJywgJyR0aW1lb3V0JywgJyRsb2NhdGlvbicsIGZ1bmN0aW9uKCRwYXJzZSwgJHRpbWVvdXQsICRsb2NhdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHIpIHtcblx0XHRpZiAoJ2RyYWdnYWJsZScgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpKSB7XG5cdFx0XHR2YXIgbGVhdmVUaW1lb3V0ID0gbnVsbDtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0JHRpbWVvdXQuY2FuY2VsKGxlYXZlVGltZW91dCk7XG5cdFx0XHRcdGlmICghZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pIHtcblx0XHRcdFx0XHRpZiAoYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddICYmIGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXS5zZWFyY2goL1xcKSAqJC8pID4gLTEpIHtcblx0XHRcdFx0XHRcdHZhciBkcmFnT3ZlckNsYXNzID0gJHBhcnNlKGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXSkoc2NvcGUsIHtcblx0XHRcdFx0XHRcdFx0JGV2ZW50IDogZXZ0XG5cdFx0XHRcdFx0XHR9KTtcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IGRyYWdPdmVyQ2xhc3M7IFxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXSB8fCBcImRyYWdvdmVyXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsZW0uYWRkQ2xhc3MoZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0bGVhdmVUaW1lb3V0ID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZWxlbS5yZW1vdmVDbGFzcyhlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyk7XG5cdFx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBudWxsO1xuXHRcdFx0XHR9LCBhdHRyWyduZ0ZpbGVEcmFnT3ZlckRlbGF5J10gfHwgMSk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHR2YXIgZm4gPSAkcGFyc2UoYXR0clsnbmdGaWxlRHJvcCddKTtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRlbGVtLnJlbW92ZUNsYXNzKGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKTtcblx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBudWxsO1xuXHRcdFx0XHRleHRyYWN0RmlsZXMoZXZ0LCBmdW5jdGlvbihmaWxlcykge1xuXHRcdFx0XHRcdGZuKHNjb3BlLCB7XG5cdFx0XHRcdFx0XHQkZmlsZXMgOiBmaWxlcyxcblx0XHRcdFx0XHRcdCRldmVudCA6IGV2dFxuXHRcdFx0XHRcdH0pO1x0XHRcdFx0XHRcblx0XHRcdFx0fSk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdGZ1bmN0aW9uIGlzQVNDSUkoc3RyKSB7XG5cdFx0XHRcdHJldHVybiAvXltcXDAwMC1cXDE3N10qJC8udGVzdChzdHIpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBleHRyYWN0RmlsZXMoZXZ0LCBjYWxsYmFjaykge1xuXHRcdFx0XHR2YXIgZmlsZXMgPSBbXSwgaXRlbXMgPSBldnQuZGF0YVRyYW5zZmVyLml0ZW1zO1xuXHRcdFx0XHRpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoID4gMCAmJiBpdGVtc1swXS53ZWJraXRHZXRBc0VudHJ5ICYmICRsb2NhdGlvbi5wcm90b2NvbCgpICE9ICdmaWxlJyAmJiBcblx0XHRcdFx0XHRcdGl0ZW1zWzBdLndlYmtpdEdldEFzRW50cnkoKS5pc0RpcmVjdG9yeSkge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBlbnRyeSA9IGl0ZW1zW2ldLndlYmtpdEdldEFzRW50cnkoKTtcblx0XHRcdFx0XHRcdGlmIChlbnRyeSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdC8vZml4IGZvciBjaHJvbWUgYnVnIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0xNDk3MzVcblx0XHRcdFx0XHRcdFx0aWYgKGlzQVNDSUkoZW50cnkubmFtZSkpIHtcblx0XHRcdFx0XHRcdFx0XHR0cmF2ZXJzZUZpbGVUcmVlKGZpbGVzLCBlbnRyeSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIWl0ZW1zW2ldLndlYmtpdEdldEFzRW50cnkoKS5pc0RpcmVjdG9yeSkge1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVzLnB1c2goaXRlbXNbaV0uZ2V0QXNGaWxlKCkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciBmaWxlTGlzdCA9IGV2dC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdFx0XHRcdFx0aWYgKGZpbGVMaXN0ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZUxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0ZmlsZXMucHVzaChmaWxlTGlzdC5pdGVtKGkpKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0KGZ1bmN0aW9uIHdhaXRGb3JQcm9jZXNzKGRlbGF5KSB7XG5cdFx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZiAoIXByb2Nlc3NpbmcpIHtcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2soZmlsZXMpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0d2FpdEZvclByb2Nlc3MoMTApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sIGRlbGF5IHx8IDApXG5cdFx0XHRcdH0pKCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHZhciBwcm9jZXNzaW5nID0gMDtcblx0XHRcdGZ1bmN0aW9uIHRyYXZlcnNlRmlsZVRyZWUoZmlsZXMsIGVudHJ5LCBwYXRoKSB7XG5cdFx0XHRcdGlmIChlbnRyeSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKGVudHJ5LmlzRGlyZWN0b3J5KSB7XG5cdFx0XHRcdFx0XHR2YXIgZGlyUmVhZGVyID0gZW50cnkuY3JlYXRlUmVhZGVyKCk7XG5cdFx0XHRcdFx0XHRwcm9jZXNzaW5nKys7XG5cdFx0XHRcdFx0XHRkaXJSZWFkZXIucmVhZEVudHJpZXMoZnVuY3Rpb24oZW50cmllcykge1xuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHR0cmF2ZXJzZUZpbGVUcmVlKGZpbGVzLCBlbnRyaWVzW2ldLCAocGF0aCA/IHBhdGggOiBcIlwiKSArIGVudHJ5Lm5hbWUgKyBcIi9cIik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cHJvY2Vzc2luZy0tO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHByb2Nlc3NpbmcrKztcblx0XHRcdFx0XHRcdGVudHJ5LmZpbGUoZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHRcdFx0XHRwcm9jZXNzaW5nLS07XG5cdFx0XHRcdFx0XHRcdGZpbGUuX3JlbGF0aXZlUGF0aCA9IChwYXRoID8gcGF0aCA6IFwiXCIpICsgZmlsZS5uYW1lO1xuXHRcdFx0XHRcdFx0XHRmaWxlcy5wdXNoKGZpbGUpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufSBdKTtcblxufSkoKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIENvbXBvbmVudFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7fSxcclxuICAgICAgICAgICAgcHJvcGVydGllcyA9IHt9LFxyXG4gICAgICAgICAgICBjb25uZWN0b3JzID0ge307XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlcicpO1xyXG5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnQ29tcG9uZW50RGV0YWlsc18nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRGVzdHJveWluZyA6JywgY29udGV4dC5yZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICBDb21wb25lbnRTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgIGNvbm5lY3RvcnM6IGNvbm5lY3RvcnNcclxuICAgICAgICB9O1xyXG4vLyAgICAgICAgZGF0YSA9IHtcclxuLy8gICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbi8vICAgICAgICAgICAgaWQ6IGNvbXBvbmVudElkLFxyXG4vLyAgICAgICAgICAgIGRvbWFpbk1vZGVsczoge30sICAgLy9kb21haW5Nb2RlbDogaWQ6IDxzdHJpbmc+LCB0eXBlOiA8c3RyaW5nPlxyXG4vLyAgICAgICAgICAgIGludGVyZmFjZXM6IHtcclxuLy8gICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sIC8vcHJvcGVydHk6IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkYXRhVHlwZTogPHN0cmluZz4sIHZhbHVlVHlwZSA8c3RyaW5nPn1cclxuLy8gICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30gIC8vY29ubmVjdG9yOiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZG9tYWluUG9ydHM6IDxvYmplY3Q+IH1cclxuLy8gICAgICAgICAgICB9XHJcbi8vICAgICAgICB9XHJcblxyXG4gICAgICAgIENvbXBvbmVudFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95KSB7XHJcbiAgICAgICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiB7fVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgLy9UT0RPOiBub3RpZnkgdXNlclxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXIgLSBpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgQ29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHMoY29udGV4dCwgJHNjb3BlLmNvbXBvbmVudElkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTaW5jZSB3YXRjaENvbXBvbmVudERldGFpbHMga2VlcHMgdGhlIGRhdGEgdXAtdG8tZGF0ZSB0aGVyZSBzaG91bGRuJ3QgYmUgYSBuZWVkIHRvIGRvIGFueVxyXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlcyBoZXJlLi5cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb21wb25lbnREZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucHJvcGVydGllcyA9IGNvbXBvbmVudERldGFpbHMuaW50ZXJmYWNlcy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLmNvbm5lY3RvcnMgPSBjb21wb25lbnREZXRhaWxzLmludGVyZmFjZXMuY29ubmVjdG9ycztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2NvbXBvbmVudERldGFpbHMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJyxcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudElkOiAnPWNvbXBvbmVudElkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db21wb25lbnREZXRhaWxzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdDb21wb25lbnRMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIENvbXBvbmVudFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdLFxyXG4gICAgICAgICAgICBjb21wb25lbnRJdGVtcyA9IHt9LFxyXG4gICAgICAgICAgICBzZXJ2aWNlRGF0YTJDb21wb25lbnRJdGVtLFxyXG4gICAgICAgICAgICBjb25maWcsXHJcbiAgICAgICAgICAgIGNvbnRleHQ7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21wb25lbnRMaXN0Q29udHJvbGxlcicpO1xyXG5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnQ29tcG9uZW50TGlzdENvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgQ29tcG9uZW50U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcgPSB7XHJcblxyXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxyXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcclxuXHJcbiAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXHJcblxyXG4gICAgICAgICAgICBpdGVtU29ydDogZnVuY3Rpb24gKGpRRXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2xpY2tlZDogJyArIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9ICcvY29tcG9uZW50LycgKyBpdGVtLmlkLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29udGV4dG1lbnUgd2FzIHRyaWdnZXJlZCBmb3Igbm9kZTonLCBpdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhwb3J0QXNYTUUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhwb3J0IGFzIFhNRScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2hhcmUtYWx0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9sYWJlbDogJ0V4dHJhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1wbHVzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb21wb25lbnRTZXJ2aWNlLmRlbGV0ZVdvcmtzcGFjZShjb250ZXh0LCBkYXRhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtcyxcclxuICAgICAgICAgICAgY29ubmVjdGlvbklkOiAkc2NvcGUuY29ubmVjdGlvbklkIC8vIEZJWE1FOiBUaGlzIGlzIHByb2JhYmx5IG5vdCB0aGUgcmlnaHQgd2F5IHRvIGRvIGl0Li5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG5cclxuICAgICAgICBzZXJ2aWNlRGF0YTJDb21wb25lbnRJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudEl0ZW07XHJcblxyXG4gICAgICAgICAgICBpZiAoY29tcG9uZW50SXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudEl0ZW0gPSBjb21wb25lbnRJdGVtc1tkYXRhLmlkXTtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudEl0ZW0ubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudEl0ZW0uZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50SXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdPcGVuIGl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IG5ldyBEYXRlKCksIC8vIFRPRE86IGdldCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnIC8vIFRPRE86IGdldCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0czogW1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdDb21wb25lbnRzJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcHV6emxlLXBpZWNlJ1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHMgICAgOiAnQ29udGVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsc1RlbXBsYXRlVXJsOiAnZGV0YWlscy5odG1sJ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRJdGVtc1tjb21wb25lbnRJdGVtLmlkXSA9IGNvbXBvbmVudEl0ZW07XHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGNvbXBvbmVudEl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgQ29tcG9uZW50U2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICAkc2NvcGUubGlzdERhdGEuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICAgICAgY29tcG9uZW50SXRlbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnZGVzdHJveSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ2luaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICBDb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50cyhjb250ZXh0LCAkc2NvcGUud29ya3NwYWNlSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmopIHtcclxuICAgICAgICAgICAgICAgIC8vVE9ETzogSW1wbGVtZW50IHRoZSB1cGRhdGluZyBmdW5jdGlvbmFsaXR5LlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50SWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWJ1Z2dlcjtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbXBvbmVudElkIGluIGRhdGEuY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb21wb25lbnRzLmhhc093blByb3BlcnR5KGNvbXBvbmVudElkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyQ29tcG9uZW50SXRlbShkYXRhLmNvbXBvbmVudHNbY29tcG9uZW50SWRdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2NvbXBvbmVudExpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCcsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db21wb25lbnRMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50TGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignRGVzaWduTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBEZXNpZ25TZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSxcclxuICAgICAgICAgICAgY29uZmlnO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnRGVzaWduTGlzdENvbnRyb2xsZXInKTtcclxuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUud29ya3NwYWNlSWQpO1xyXG5cclxuLy8gICAgICAgIGNvbmZpZyA9IHtcclxuLy9cclxuLy8gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXHJcbi8vICAgICAgICAgICAgc2Vjb25kYXJ5SXRlbU1lbnU6IHRydWUsXHJcbi8vICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4vLyAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxyXG4vLyAgICAgICAgICAgIGhpZGVEZXRhaWxzTGFiZWw6ICdIaWRlIGRldGFpbHMnLFxyXG4vL1xyXG4vLyAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXHJcbi8vXHJcbi8vICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkOiAnICsgaXRlbSk7XHJcbi8vICAgICAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggPVxyXG4vLyAgICAgICAgICAgICAgICAgICAgJy93b3Jrc3BhY2VEZXRhaWxzLy8nICsgaXRlbS5pZDtcclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgaXRlbSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29udGV4dG1lbnUgd2FzIHRyaWdnZXJlZCBmb3Igbm9kZTonLCBpdGVtKTtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuLy8gICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW5JbkVkaXRvcicsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCdcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkdXBsaWNhdGVXb3Jrc3BhY2UnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEdXBsaWNhdGUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtY29weSBjb3B5LWljb24nXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZWRpdFdvcmtzcGFjZScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCdcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc1hNRScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBhcyBYTUUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4vLyAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAvL2xhYmVsOiAnRXh0cmEnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXBsdXMnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2UuZGVsZXRlV29ya3NwYWNlKGRhdGEuaWQpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4vLyAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICBdO1xyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4vLyAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIG5ld0l0ZW1Gb3JtOiB7XHJcbi8vICAgICAgICAgICAgICAgIHRpdGxlOiAnQ3JlYXRlIG5ldyBpdGVtJyxcclxuLy8gICAgICAgICAgICAgICAgaXRlbVRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtzcGFjZU5ld0l0ZW0uaHRtbCcsXHJcbi8vICAgICAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcclxuLy8gICAgICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZUl0ZW0gPSBmdW5jdGlvbiAobmV3SXRlbSkge1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2UuY3JlYXRlV29ya3NwYWNlKG5ld0l0ZW0pO1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5uZXdJdGVtID0ge307XHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm5ld0l0ZW1Gb3JtLmV4cGFuZGVkID0gZmFsc2U7IC8vIHRoaXMgaXMgaG93IHlvdSBjbG9zZSB0aGUgZm9ybSBpdHNlbGZcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgIH07XHJcbi8vICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICB9LFxyXG4vL1xyXG4vLyAgICAgICAgICAgIGZpbHRlcjoge1xyXG4vLyAgICAgICAgICAgIH1cclxuLy9cclxuLy8gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbi8vICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2Rlc2lnbkxpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvRGVzaWduTGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnbkxpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnblRyZWVDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgRGVzaWduU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sXHJcbiAgICAgICAgICAgIGNvbmZpZztcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Rlc2lnblRyZWVDb250cm9sbGVyJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmRlc2lnbklkKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnRyZWVEYXRhID0ge307XHJcblxyXG4gICAgICAgIERlc2lnblNlcnZpY2Uud2F0Y2hEZXNpZ25TdHJ1Y3R1cmUobnVsbCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAoZXJyLCBzdHJ1Y3R1cmUpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRyZWVEYXRhID0gc3RydWN0dXJlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdkZXNpZ25UcmVlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduSWQ6ICc9ZGVzaWduSWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0Rlc2lnblRyZWUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEZXNpZ25UcmVlQ29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdUZXN0QmVuY2hMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIFRlc3RCZW5jaFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdLFxyXG4gICAgICAgICAgICBjb25maWc7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUZXN0QmVuY2hMaXN0Q29udHJvbGxlcicpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS53b3Jrc3BhY2VJZCk7XHJcblxyXG4vLyAgICAgICAgY29uZmlnID0ge1xyXG4vL1xyXG4vLyAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcclxuLy8gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcclxuLy8gICAgICAgICAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXHJcbi8vICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXHJcbi8vICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXHJcbi8vXHJcbi8vICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcclxuLy9cclxuLy8gICAgICAgICAgICBpdGVtU29ydDogZnVuY3Rpb24gKGpRRXZlbnQsIHVpKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NsaWNrZWQ6ICcgKyBpdGVtKTtcclxuLy8gICAgICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9XHJcbi8vICAgICAgICAgICAgICAgICAgICAnL3dvcmtzcGFjZURldGFpbHMvLycgKyBpdGVtLmlkO1xyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb250ZXh0bWVudSB3YXMgdHJpZ2dlcmVkIGZvciBub2RlOicsIGl0ZW0pO1xyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4vLyAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0J1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2R1cGxpY2F0ZVdvcmtzcGFjZScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0R1cGxpY2F0ZScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1jb3B5IGNvcHktaWNvbidcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0V29ya3NwYWNlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsJ1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2V4cG9ydEFzWE1FJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhwb3J0IGFzIFhNRScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNoYXJlLWFsdCcsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbi8vICAgICAgICAgICAgICAgICAgICB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIC8vbGFiZWw6ICdFeHRyYScsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcGx1cycsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UoZGF0YS5pZCk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbi8vICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgIF07XHJcbi8vICAgICAgICAgICAgfSxcclxuLy9cclxuLy8gICAgICAgICAgICBkZXRhaWxzUmVuZGVyZXI6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbi8vICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgbmV3SXRlbUZvcm06IHtcclxuLy8gICAgICAgICAgICAgICAgdGl0bGU6ICdDcmVhdGUgbmV3IGl0ZW0nLFxyXG4vLyAgICAgICAgICAgICAgICBpdGVtVGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvV29ya3NwYWNlTmV3SXRlbS5odG1sJyxcclxuLy8gICAgICAgICAgICAgICAgZXhwYW5kZWQ6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY3JlYXRlSXRlbSA9IGZ1bmN0aW9uIChuZXdJdGVtKSB7XHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5jcmVhdGVXb3Jrc3BhY2UobmV3SXRlbSk7XHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm5ld0l0ZW0gPSB7fTtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcubmV3SXRlbUZvcm0uZXhwYW5kZWQgPSBmYWxzZTsgLy8gdGhpcyBpcyBob3cgeW91IGNsb3NlIHRoZSBmb3JtIGl0c2VsZlxyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgfTtcclxuLy8gICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgICAgZmlsdGVyOiB7XHJcbi8vICAgICAgICAgICAgfVxyXG4vL1xyXG4vLyAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcclxuICAgICAgICB9O1xyXG5cclxuLy8gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgndGVzdEJlbmNoTGlzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUlkOiAnPXdvcmtzcGFjZUlkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9UZXN0QmVuY2hMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignV29ya3NwYWNlTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBXb3Jrc3BhY2VTZXJ2aWNlLCBGaWxlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sXHJcbiAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW1zID0ge30sXHJcbiAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgY29udGV4dCxcclxuICAgICAgICAgICAgc2VydmljZURhdGEyV29ya3NwYWNlSXRlbSxcclxuICAgICAgICAgICAgYWRkQ291bnRXYXRjaGVycztcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJyk7XHJcblxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZyA9IHtcclxuXHJcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2Vjb25kYXJ5SXRlbU1lbnU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbHNDb2xsYXBzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXHJcbiAgICAgICAgICAgIGhpZGVEZXRhaWxzTGFiZWw6ICdIaWRlIGRldGFpbHMnLFxyXG5cclxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Tb3J0OiBmdW5jdGlvbiAoalFFdmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkOiAnICsgaXRlbSk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5oYXNoID1cclxuICAgICAgICAgICAgICAgICAgICAnL3dvcmtzcGFjZURldGFpbHMvJyArIGl0ZW0uaWQucmVwbGFjZSgvXFwvL2csICctJyk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKGUsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb250ZXh0bWVudSB3YXMgdHJpZ2dlcmVkIGZvciBub2RlOicsIGl0ZW0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW5JbkVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkdXBsaWNhdGVXb3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRHVwbGljYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtY29weSBjb3B5LWljb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtpZDogaXRlbS5pZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLmR1cGxpY2F0ZVdvcmtzcGFjZShjb250ZXh0LCBkYXRhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZWRpdFdvcmtzcGFjZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc1hNRScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgYXMgWE1FJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHsgaWQ6IGl0ZW0uaWQgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2xhYmVsOiAnRXh0cmEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1wbHVzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLmRlbGV0ZVdvcmtzcGFjZShjb250ZXh0LCBkYXRhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBuZXdJdGVtRm9ybToge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDcmVhdGUgbmV3IHdvcmtzcGFjZScsXHJcbiAgICAgICAgICAgICAgICBpdGVtVGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvV29ya3NwYWNlTmV3SXRlbS5odG1sJyxcclxuICAgICAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3BwZWRGaWxlczogW11cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnT3ZlckNsYXNzID0gZnVuY3Rpb24gKCRldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHJhZ2dlZEl0ZW1zID0gJGV2ZW50LmRhdGFUcmFuc2Zlci5pdGVtcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGaWxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihkcmFnZ2VkSXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ2dlZEl0ZW1zID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGaWxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBkcmFnZ2VkSXRlbXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ2dlZEl0ZW1zW2ldLmtpbmQgPT09ICdmaWxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGaWxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGFzRmlsZSA/IFwiYmctc3VjY2VzcyBkcmFnb3ZlclwiIDogXCJiZy1kYW5nZXIgZHJhZ292ZXJcIjtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUub25Ecm9wcGVkRmlsZXMgPSBmdW5jdGlvbiAoJGZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEZpbGVTZXJ2aWNlLnNhdmVEcm9wcGVkRmlsZXMoJGZpbGVzLCB7emlwOiB0cnVlLCBhZG06IHRydWUsIGF0bTogdHJ1ZX0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZkluZm9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZkluZm9zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZkluZm9zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tb2RlbC5kcm9wcGVkRmlsZXMucHVzaChmSW5mb3NbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jcmVhdGVJdGVtID0gZnVuY3Rpb24gKG5ld0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAkc2NvcGUuZmlsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5maWxlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Xb3Jrc3BhY2VTZXJ2aWNlLmNyZWF0ZVdvcmtzcGFjZShjb250ZXh0LCBuZXdJdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vJHNjb3BlLm5ld0l0ZW0gPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uZmlnLm5ld0l0ZW1Gb3JtLmV4cGFuZGVkID0gZmFsc2U7IC8vIHRoaXMgaXMgaG93IHlvdSBjbG9zZSB0aGUgZm9ybSBpdHNlbGZcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGZpbHRlcjoge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcclxuXHJcblxyXG4gICAgICAgIHNlcnZpY2VEYXRhMldvcmtzcGFjZUl0ZW0gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgd29ya3NwYWNlSXRlbTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VJdGVtcy5oYXNPd25Qcm9wZXJ0eShkYXRhLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbSA9IHdvcmtzcGFjZUl0ZW1zW2RhdGEuaWRdO1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbS5uYW1lID0gZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ09wZW4gaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogbmV3IERhdGUoKSwgLy8gVE9ETzogZ2V0IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogJ04vQScgLy8gVE9ETzogZ2V0IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ0NvbXBvbmVudHMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcHV6emxlLXBpZWNlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdEZXNpZ24gU3BhY2VzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWN1YmVzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdUZXN0IGJlbmNoZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zYXZlZCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnUmVxdWlyZW1lbnRzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWJhci1jaGFydC1vJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJdGVtLmlkXSA9IHdvcmtzcGFjZUl0ZW07XHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHdvcmtzcGFjZUl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYWRkQ291bnRXYXRjaGVycyA9IGZ1bmN0aW9uICh3b3Jrc3BhY2VJZCkge1xyXG4gICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBmdW5jdGlvbiAodXBkYXRlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMF0udmFsdWUgPSB1cGRhdGVEYXRhLmRhdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMF0udmFsdWUgPSBkYXRhLmNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZEZXNpZ25zKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBmdW5jdGlvbiAodXBkYXRlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMV0udmFsdWUgPSB1cGRhdGVEYXRhLmRhdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMV0udmFsdWUgPSBkYXRhLmNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlcyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzJdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzJdLnZhbHVlID0gZGF0YS5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgYWxsIHZhcmlhYmxlc1xyXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogaXRlbXNcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd29ya3NwYWNlSXRlbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnZGVzdHJveSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyIC0gaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS53YXRjaFdvcmtzcGFjZXMoY29udGV4dCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyV29ya3NwYWNlSXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJXb3Jrc3BhY2VJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VJdGVtcy5oYXNPd25Qcm9wZXJ0eSh1cGRhdGVPYmplY3QuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaXRlbXMubWFwKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuaW5kZXhPZih1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkNvbXBvbmVudHNfJyArIHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mRGVzaWduc18nICsgdXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlc18nICsgdXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdvcmtzcGFjZUl0ZW1zW3VwZGF0ZU9iamVjdC5pZF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlSWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAod29ya3NwYWNlSWQgaW4gZGF0YS53b3Jrc3BhY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLndvcmtzcGFjZXMuaGFzT3duUHJvcGVydHkod29ya3NwYWNlSWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJXb3Jrc3BhY2VJdGVtKGRhdGEud29ya3NwYWNlc1t3b3Jrc3BhY2VJZF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkQ291bnRXYXRjaGVycyh3b3Jrc3BhY2VJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCd3b3Jrc3BhY2VMaXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvV29ya3NwYWNlTGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnQ29tcG9uZW50U2VydmljZScsIGZ1bmN0aW9uICgkcSwgTm9kZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHdhdGNoZXJzID0ge307XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgY29tcG9uZW50IGZyb20gdGhlIGNvbnRleHQgKGRiL3Byb2plY3QvYnJhbmNoKS5cclxuICAgICAgICAgKiBAcGFyYW0gY29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciwgTi5CLiBkb2VzIG5vdCBuZWVkIHRvIHNwZWNpZnkgcmVnaW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb21wb25lbnRJZFxyXG4gICAgICAgICAqIEBwYXJhbSBbbXNnXSAtIENvbW1pdCBtZXNzYWdlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZGVsZXRlQ29tcG9uZW50ID0gZnVuY3Rpb24gKGNvbnRleHQsIGNvbXBvbmVudElkLCBtc2cpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtc2cgfHwgJ0NvbXBvbmVudFNlcnZpY2UuZGVsZXRlQ29tcG9uZW50ICcgKyBjb21wb25lbnRJZDtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZGVzdHJveU5vZGUoY29udGV4dCwgY29tcG9uZW50SWQsIG1lc3NhZ2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZXhwb3J0Q29tcG9uZW50ID0gZnVuY3Rpb24gKGNvbnRleHQsIGNvbXBvbmVudElkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhbGwgY29tcG9uZW50cyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLiAgRGF0YSBpcyBhbiBvYmplY3QgaW4gZGF0YS5jb21wb25lbnRzLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hDb21wb25lbnRzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbXBvbmVudHMnLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiB7fSAvLyBjb21wb25lbnQge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIGF2bUlkOiA8c3RyaW5nPiwgcmVzb3VyY2U6IDxoYXNofHN0cmluZz4sIGNsYXNzaWZpY2F0aW9uczogPHN0cmluZz4gfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXZtSUQgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmVzb3VyY2UgPSB0aGlzLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2xhc3MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnQ2xhc3NpZmljYXRpb25zJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdBdm1JRCAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5hdm1JZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLmF2bUlkID0gbmV3QXZtSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UmVzb3VyY2UgIT09IGRhdGEuY29tcG9uZW50c1tpZF0ucmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2lkXS5yZXNvdXJjZSA9IG5ld1Jlc291cmNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NsYXNzICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLmNsYXNzaWZpY2F0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLmNsYXNzaWZpY2F0aW9ucyA9IG5ld0NsYXNzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEuY29tcG9uZW50c1tpZF19KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb21wb25lbnRzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudElkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2NvbXBvbmVudElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbXBvbmVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NpZmljYXRpb25zOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdDbGFzc2lmaWNhdGlvbnMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbY29tcG9uZW50SWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1Jlc291cmNlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzaWZpY2F0aW9uczogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdDbGFzc2lmaWNhdGlvbnMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNvbXBvbmVudElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhIGNvbXBvbmVudCB3LnIudC4gaW50ZXJmYWNlcyBhbmQgaW5jbHVkZWQgZG9tYWluLW1vZGVscy5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gY29tcG9uZW50SWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hDb21wb25lbnREZXRhaWxzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGNvbXBvbmVudElkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbXBvbmVudERldGFpbHNfJyArIGNvbXBvbmVudElkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluTW9kZWxzOiB7fSwgICAvL2RvbWFpbk1vZGVsOiBpZDogPHN0cmluZz4sIHR5cGU6IDxzdHJpbmc+XHJcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJmYWNlczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSwgLy9wcm9wZXJ0eToge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRhdGFUeXBlOiA8c3RyaW5nPiwgdmFsdWVUeXBlIDxzdHJpbmc+fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiB7fSAgLy9jb25uZWN0b3I6IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkb21haW5Qb3J0czogPG9iamVjdD4gfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblByb3BlcnR5VXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEYXRhVHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdEYXRhVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZVR5cGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnVmFsdWVUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5pbnRlcmZhY2VzLnByb3BlcnRpZXNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5pbnRlcmZhY2VzLnByb3BlcnRpZXNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0RhdGFUeXBlICE9PSBkYXRhLmludGVyZmFjZXMucHJvcGVydGllc1tpZF0uZGF0YVR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5pbnRlcmZhY2VzLnByb3BlcnRpZXNbaWRdLmRhdGFUeXBlID0gbmV3RGF0YVR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVUeXBlICE9PSBkYXRhLmludGVyZmFjZXMucHJvcGVydGllc1tpZF0udmFsdWVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaW50ZXJmYWNlcy5wcm9wZXJ0aWVzW2lkXS52YWx1ZVR5cGUgPSBuZXdWYWx1ZVR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblByb3BlcnR5VW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuaW50ZXJmYWNlcy5wcm9wZXJ0aWVzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uQ29ubmVjdG9yVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuaW50ZXJmYWNlcy5jb25uZWN0b3JzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaW50ZXJmYWNlcy5jb25uZWN0b3JzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uQ29ubmVjdG9yVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuaW50ZXJmYWNlcy5jb25uZWN0b3JzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uRG9tYWluTW9kZWxVcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VHlwZSAhPT0gZGF0YS5kb21haW5Nb2RlbHNbaWRdLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbaWRdLnR5cGUgPSBuZXdUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Eb21haW5Nb2RlbFVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmRvbWFpbk1vZGVsc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBjb21wb25lbnRJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29tcG9uZW50Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLlByb3BlcnR5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmludGVyZmFjZXMucHJvcGVydGllc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0RhdGFUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblByb3BlcnR5VXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uUHJvcGVydHlVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbm5lY3RvcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5pbnRlcmZhY2VzLmNvbm5lY3RvcnNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblBvcnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25Db25uZWN0b3JVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Db25uZWN0b3JVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRvbWFpbk1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRvbWFpbk1vZGVsc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvbkRvbWFpbk1vZGVsVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uRG9tYWluTW9kZWxVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuUHJvcGVydHkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaW50ZXJmYWNlcy5wcm9wZXJ0aWVzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0RhdGFUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVR5cGU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnVmFsdWVUeXBlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Qcm9wZXJ0eVVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uUHJvcGVydHlVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29ubmVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmludGVyZmFjZXMuY29ubmVjdG9yc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21haW5Qb3J0czoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Db25uZWN0b3JVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvbkNvbm5lY3RvclVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL3F1ZXVlTGlzdC5wdXNoKGNoaWxkTm9kZS5sb2FkQ2hpbGRyZW4oY2hpbGROb2RlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Eb21haW5Nb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1R5cGUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvbkRvbWFpbk1vZGVsVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25Eb21haW5Nb2RlbFVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgd2F0Y2hlcnMgc3Bhd25lZCBmcm9tIHBhcmVudENvbnRleHQsIHRoaXMgc2hvdWxkIHR5cGljYWxseSBiZSBpbnZva2VkIHdoZW4gdGhlIGNvbnRyb2xsZXIgaXMgZGVzdHJveWVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCkge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRXYXRjaGVycyxcclxuICAgICAgICAgICAgICAgIGtleTtcclxuICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZFdhdGNoZXJzID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBjaGlsZFdhdGNoZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkV2F0Y2hlcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5jbGVhblVwUmVnaW9uKGNoaWxkV2F0Y2hlcnNba2V5XS5kYiwgY2hpbGRXYXRjaGVyc1trZXldLnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHNwZWNpZmllZCB3YXRjaGVyIChyZWdpb25JZClcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24gb2YgYm90aCBwYXJlbnQgYW5kIHJlZ2lvbiB0byBiZSBkZWxldGVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZWdpb25JZCAtIFJlZ2lvbiBpZCBvZiB0aGUgc3Bhd25lZCByZWdpb24gdGhhdCBzaG91bGQgYmUgZGVsZXRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgcmVnaW9uSWQpIHtcclxuICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihwYXJlbnRDb250ZXh0LmRiLCByZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdGhpbmcgdG8gY2xlYW4tdXAuLicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Nhbm5vdCBjbGVhbi11cCByZWdpb24gc2luY2UgcGFyZW50Q29udGV4dCBpcyBub3QgcmVnaXN0ZXJlZC4uJywgcGFyZW50Q29udGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWdpc3RlcnMgYSB3YXRjaGVyIChjb250cm9sbGVyKSB0byB0aGUgc2VydmljZS4gQ2FsbGJhY2sgZnVuY3Rpb24gaXMgY2FsbGVkIHdoZW4gbm9kZXMgYmVjYW1lIGF2YWlsYWJsZSBvclxyXG4gICAgICAgICAqIHdoZW4gdGhleSBiZWNhbWUgdW5hdmFpbGFibGUuIFRoZXNlIGFyZSBhbHNvIGNhbGxlZCBkaXJlY3RseSB3aXRoIHRoZSBzdGF0ZSBvZiB0aGUgTm9kZVNlcml2Y2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQuZGIgLSBEYXRhYmFzZSBjb25uZWN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0gQ2FsbGVkIHdpdGggdHJ1ZSB3aGVuIHRoZXJlIGFyZSBubyBub2RlcyB1bmF2YWlsYWJsZSBhbmQgZmFsc2Ugd2hlbiB0aGVyZSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZm4pIHtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2Uub24ocGFyZW50Q29udGV4dC5kYiwgJ2luaXRpYWxpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBiZSBlbm91Z2gsIHRoZSByZWdpb25zIHdpbGwgYmUgY2xlYW5lZCB1cCBpbiBOb2RlU2VydmljZS5cclxuICAgICAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0ge307XHJcbiAgICAgICAgICAgICAgICBmbihmYWxzZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5vbihwYXJlbnRDb250ZXh0LmRiLCAnZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGVub3VnaCwgdGhlIHJlZ2lvbnMgc2hvdWxkIGJlIGNsZWFuZWQgdXAgaW4gTm9kZVNlcnZpY2UuXHJcbiAgICAgICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmbih0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dDb250ZXh0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9nQ29udGV4dChjb250ZXh0KTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdEZXNpZ25TZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCBOb2RlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgd2F0Y2hlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgdGhpcy5kZWxldGVEZXNpZ24gPSBmdW5jdGlvbiAoZGVzaWduSWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZXhwb3J0RGVzaWduID0gZnVuY3Rpb24gKGRlc2lnbklkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2F2ZUNvbmZpZ3VyYXRpb25TZXQgPSBmdW5jdGlvbiAoZGVzaWduSWQsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCBjb250YWluZXJzIChleGlzdGVuY2UgYW5kIHRoZWlyIGF0dHJpYnV0ZXMpIG9mIGEgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuICBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLmRlc2lnbnMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaERlc2lnbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWducycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogcGFyZW50Q29udGV4dC5wcm9qZWN0SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmNoSWQ6IHBhcmVudENvbnRleHQuYnJhbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzaWduczoge30gLy8gZGVzaWduIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz59XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuZGVzaWduc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEuZGVzaWduc1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zW2lkXS5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS5kZXNpZ25zW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmRlc2lnbnNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbklkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zW2Rlc2lnbklkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tkZXNpZ25JZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGRlc2lnbklkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuZGVzaWduc1tkZXNpZ25JZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYSBkZXNpZ24gdy5yLnQuIGludGVyZmFjZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIGRlc2lnbklkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoRGVzaWduRGV0YWlscyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBmdWxsIGhpZXJhcmNoeSBvZiBhIGRlc2lnbiB3LnIudC4gY29udGFpbmVycyBhbmQgY29tcG9uZW50cy5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gZGVzaWduSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hEZXNpZ25TdHJ1Y3R1cmUgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBGSVhNRTogd2F0Y2hDb25maWd1cmF0aW9uU2V0cyBhbmQgd2F0Y2hDb25maWd1cmF0aW9ucyBzaG91bGQgcHJvYmFibHkgZ28gdG8gYSBEZXNlcnRDb25maWd1cmF0aW9uLVNlcnZpY2UsXHJcbiAgICAgICAgLy8gd2l0aCBhIHJlbGF0ZWQgY29udHJvbGxlciBEZXNlcnRDb25maWd1cmF0aW9uU2V0TGlzdCwgd2hlcmUgZGV0YWlscyBhcmUgY29uZmlndXJhdGlvbnMuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGdlbmVyYXRlZCBEZXNlcnRDb25maWd1cmF0aW9uU2V0cyBpbnNpZGUgYSBEZXNpZ24uXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIGRlc2lnbklkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoQ29uZmlndXJhdGlvblNldHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNmZ1NldHM6IHt9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6IHBhcmVudENvbnRleHQucHJvamVjdElkLFxyXG4gICAgICAgICAgICAgICAgICAgIGJyYW5jaElkOiBwYXJlbnRDb250ZXh0LmJyYW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbmZpZ3VyYXRpb25TZXRzXycgKyBkZXNpZ25JZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZGF0YS5yZWdpb25JZCA9IGNvbnRleHQucmVnaW9uSWQ7XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FkZGVkIG5ldyB3YXRjaGVyOiAnLCB3YXRjaGVycyk7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvZ0NvbnRleHQoY29udGV4dCk7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBkZXNpZ25JZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGVzaWduTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm5hbWUgPSBkZXNpZ25Ob2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLmxvYWRDaGlsZHJlbihjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihuZXdOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmNmZ1NldHNbaWRdLm5hbWUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjICE9PSBkYXRhLmNmZ1NldHNbaWRdLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9kYXRhLmNmZ1NldHNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS53YXJuKCdjaGFuZ2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2Rlc1tpXS5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jZmdTZXRzW2NoaWxkTm9kZXNbaV0uZ2V0SWQoKV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkTm9kZXNbaV0uZ2V0SWQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1tpXS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzW2ldLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdjZmdTZXRzJywgY2ZnU2V0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vblVwZGF0ZShmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEZJWE1FOiBXYXRjaGluZyBjb25maWd1cmF0aW9ucyBpbnNpZGUgYSBjb25maWd1cmF0aW9uLXNldCBkb2VzIHByb2JhYmx5IG5vdCBiZWxvbmcgaGVyZS5cclxuLy8gICAgICAgIC8qKlxyXG4vLyAgICAgICAgICogIFdhdGNoZXMgdGhlIERlc2VydENvbmZpZ3VyYXRpb24gKHcuci50LiBleGlzdGVuY2UgYW5kIGF0dHJpYnV0ZXMpIGluc2lkZSBhIERlc2VydENvbmZpZ3VyYXRpb25TZXQuXHJcbi8vICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuLy8gICAgICAgICAqIEBwYXJhbSBjb25maWd1cmF0aW9uU2V0SWRcclxuLy8gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbi8vICAgICAgICAgKi9cclxuLy8gICAgICAgIHRoaXMud2F0Y2hDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBjb25maWd1cmF0aW9uU2V0SWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbi8vICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4vLyAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgd2F0Y2hlcnMgc3Bhd25lZCBmcm9tIHBhcmVudENvbnRleHQuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFdhdGNoZXJzLFxyXG4gICAgICAgICAgICAgICAga2V5O1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2F0Y2hlcnMgPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGNoaWxkV2F0Y2hlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRXYXRjaGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY2hpbGRXYXRjaGVyc1trZXldKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHNwZWNpZmllZCB3YXRjaGVyIChyZWdpb25JZClcclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dFxyXG4gICAgICAgICAqIEBwYXJhbSByZWdpb25JZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5jbGVhblVwUmVnaW9uKHJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGNsZWFuLXVwIHJlZ2lvbiBzaW5jZSBwYXJlbnRDb250ZXh0IGlzIG5vdCByZWdpc3RlcmVkLi4nLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgV2ViR01FR2xvYmFsLCBjb25zb2xlKi9cclxuXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ0ZpbGVTZXJ2aWNlJywgZnVuY3Rpb24gKCRxKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgYmxvYkNsaWVudCA9IG5ldyBXZWJHTUVHbG9iYWwuY2xhc3Nlcy5CbG9iQ2xpZW50KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2F2ZURyb3BwZWRGaWxlcyA9IGZ1bmN0aW9uIChmaWxlcywgdmFsaWRFeHRlbnNpb25zKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICAgICAgY291bnRlciA9IGZpbGVzLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIGFydGllID0gYmxvYkNsaWVudC5jcmVhdGVBcnRpZmFjdCgnZHJvcHBlZEZpbGVzJyksXHJcbiAgICAgICAgICAgICAgICBhZGRGaWxlLFxyXG4gICAgICAgICAgICAgICAgYWRkZWRGaWxlcyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgdXBkYXRlQ291bnRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGFkZGVkRmlsZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb3VudGVyID0gZmlsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgYWRkRmlsZSA9IGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmlsZUV4dGVuc2lvbiA9IHNlbGYuZ2V0RmlsZUV4dGVuc2lvbihmaWxlLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZEV4dGVuc2lvbnMgfHwgdmFsaWRFeHRlbnNpb25zW2ZpbGVFeHRlbnNpb25dKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJ0aWUuYWRkRmlsZUFzU29mdExpbmsoZmlsZS5uYW1lLCBmaWxlLCBmdW5jdGlvbiAoZXJyLCBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBhZGQgZmlsZSBcIicgKyBmaWxlLm5hbWUgKyAnXCIgdG8gYmxvYiwgZXJyOiAnICsgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRlZEZpbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGZpbGUubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGZpbGVFeHRlbnNpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplOiBzZWxmLmh1bWFuRmlsZVNpemUoZmlsZS5zaXplLCB0cnVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogYmxvYkNsaWVudC5nZXREb3dubG9hZFVSTChoYXNoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ291bnRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgYWRkRmlsZShmaWxlc1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGZpbGUgZXh0ZW5zaW9uIG9mIHRoZSBnaXZlbiBmaWxlbmFtZS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWVcclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHRoZSByZXN1bHRpbmcgZmlsZSBleHRlbnNpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5nZXRGaWxlRXh0ZW5zaW9uID0gZnVuY3Rpb24gKGZpbGVuYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBhID0gZmlsZW5hbWUuc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgICAgICBpZiAoYS5sZW5ndGggPT09IDEgfHwgKGFbMF0gPT09IFwiXCIgJiYgYS5sZW5ndGggPT09IDIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYS5wb3AoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZvcm1hdHMgdGhlIHNpemUgaW50byBhIGh1bWFuIHJlYWRhYmxlIHN0cmluZy5cclxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gYnl0ZXMgLSBzaXplIGluIGJ5dGVzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2kgLSByZXR1cm4gcmVzdWx0IGluIFNJVW5pdHMgb3Igbm90LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gZm9ybWF0dGVkIGZpbGUgc2l6ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmh1bWFuRmlsZVNpemUgPSBmdW5jdGlvbiAoYnl0ZXMsIHNpKSB7XHJcbiAgICAgICAgICAgIHZhciB0aHJlc2ggPSBzaSA/IDEwMDAgOiAxMDI0LFxyXG4gICAgICAgICAgICAgICAgdW5pdHMsXHJcbiAgICAgICAgICAgICAgICB1O1xyXG4gICAgICAgICAgICBpZiAoYnl0ZXMgPCB0aHJlc2gpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBieXRlcyArICcgQic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVuaXRzID0gc2kgPyBbJ2tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ10gOlxyXG4gICAgICAgICAgICAgICAgICAgIFsnS2lCJywgJ01pQicsICdHaUInLCAnVGlCJywgJ1BpQicsICdFaUInLCAnWmlCJywgJ1lpQiddO1xyXG4gICAgICAgICAgICB1ID0gLTE7XHJcblxyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBieXRlcyA9IGJ5dGVzIC8gdGhyZXNoO1xyXG4gICAgICAgICAgICAgICAgdSArPSAxO1xyXG4gICAgICAgICAgICB9IHdoaWxlIChieXRlcyA+PSB0aHJlc2gpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGJ5dGVzLnRvRml4ZWQoMSkgKyAnICcgKyB1bml0c1t1XTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ1Rlc3RCZW5jaFNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsIE5vZGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3YXRjaGVycyA9IHt9O1xyXG4gICAgICAgIHRoaXMuZGVsZXRlVGVzdEJlbmNoID0gZnVuY3Rpb24gKHRlc3RCZW5jaElkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmV4cG9ydFRlc3RCZW5jaCA9IGZ1bmN0aW9uICh0ZXN0QmVuY2hJZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRUb3BMZXZlbFN5c3RlbVVuZGVyVGVzdCA9IGZ1bmN0aW9uICh0ZXN0QmVuY2hJZCwgZGVzaWduSWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucnVuVGVzdEJlbmNoID0gZnVuY3Rpb24gKHRlc3RCZW5jaElkLCBjb25maWd1cmF0aW9uSWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCB0ZXN0LWJlbmNoZXMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS4gRGF0YSBpcyBhbiBvYmplY3QgaW4gZGF0YS50ZXN0QmVuY2hlcy5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoVGVzdEJlbmNoZXMnLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6IHBhcmVudENvbnRleHQucHJvamVjdElkLFxyXG4gICAgICAgICAgICAgICAgICAgIGJyYW5jaElkOiBwYXJlbnRDb250ZXh0LmJyYW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaGVzOiB7fSAvLyB0ZXN0QmVuY2gge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBwYXRoOiA8c3RyaW5nPiwgcmVzdWx0czogPGhhc2h8c3RyaW5nPiwgZmlsZXM6IDxoYXNofHN0cmluZz4gfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSZXN1bHRzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1Jlc3VsdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RmlsZXMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQYXRoICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5wYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLnBhdGggPSBuZXdQYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1Jlc3VsdHMgIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLnJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0ucmVzdWx0cyA9IG5ld1Jlc3VsdHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RmlsZXMgIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLmZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLmZpbGVzID0gbmV3RmlsZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS50ZXN0QmVuY2hlc1tpZF19KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS50ZXN0QmVuY2hlc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1UZXN0QmVuY2hNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbdGVzdEJlbmNoSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnUmVzdWx0cycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW3Rlc3RCZW5jaElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRlc3RCZW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnUmVzdWx0cycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdUZXN0QmVuY2hGaWxlcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogdGVzdEJlbmNoSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS50ZXN0QmVuY2hlc1t0ZXN0QmVuY2hJZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYSB0ZXN0LWJlbmNoIHcuci50LiBpbnRlcmZhY2VzLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB0ZXN0QmVuY2hJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaFRlc3RCZW5jaERldGFpbHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgdGVzdEJlbmNoSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIHlldC4nKTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdXb3Jrc3BhY2VTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCBOb2RlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgd2F0Y2hlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgdGhpcy5kdXBsaWNhdGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgb3RoZXJXb3Jrc3BhY2VJZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCB5ZXQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NyZWF0aW5nIG5ldyB3b3Jrc3BhY2UgYnV0IG5vdCB1c2luZyBkYXRhJywgZGF0YSk7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5jcmVhdGVOb2RlKGNvbnRleHQsICcnLCBtZXRhLldvcmtTcGFjZSwgJ1tXZWJDeVBoeV0gLSBXb3Jrc3BhY2VTZXJ2aWNlLmNyZWF0ZVdvcmtzcGFjZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChuZXdOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKG5ld05vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHdvcmstc3BhY2UgZnJvbSB0aGUgY29udGV4dCAoZGIvcHJvamVjdC9icmFuY2gpLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLCBOLkIuIGRvZXMgbm90IG5lZWQgdG8gc3BlY2lmeSByZWdpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIFttc2ddIC0gQ29tbWl0IG1lc3NhZ2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5kZWxldGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgd29ya3NwYWNlSWQsIG1zZykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1zZyB8fCAnV29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UgJyArIHdvcmtzcGFjZUlkO1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZCwgbWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBvcnRXb3Jrc3BhY2UgPSBmdW5jdGlvbiAod29ya3NwYWNlSWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgeWV0LicpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8gVE9ETzogbWFrZSBzdXJlIHRoZSBtZXRob2RzIGJlbG93IGdldHMgcmVzb2x2ZWQgYXQgZXJyb3IgdG9vLlxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSB3b3JrLXNwYWNlcyBkZWZpbmVkIGluIHRoZSByb290LW5vZGUgdy5yLnQuIGV4aXN0ZW5jZSBhbmQgYXR0cmlidXRlcy5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyBhbiBvYmplY3QgaW4gZGF0YS53b3Jrc3BhY2VzLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hXb3Jrc3BhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoV29ya3NwYWNlcycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZXM6IHt9IC8vIHdvcmtzcGFjZSA9IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz59XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEud29ya3NwYWNlc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLndvcmtzcGFjZXNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEud29ya3NwYWNlc1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW2lkXS5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS53b3Jrc3BhY2VzW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLndvcmtzcGFjZXNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgJycpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJvb3ROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3NJZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuV29ya1NwYWNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1t3c0lkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB3c0lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLldvcmtTcGFjZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3NJZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1t3c0lkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB3c0lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogd3NJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLndvcmtzcGFjZXNbd3NJZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29tcG9uZW50cyAoZGVmaW5lZCBpbiBBQ01Gb2xkZXJzKSBpbiB0aGUgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIHRoZSB1cGRhdGVkIGRhdGEuY291bnQuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaE51bWJlck9mQ29tcG9uZW50cyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkNvbXBvbmVudHNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgbnVtYmVyIG9mIGNvbnRhaW5lcnMgKGRlZmluZWQgaW4gQURNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZkRlc2lnbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZEZXNpZ25zXycgKyB3b3Jrc3BhY2VJZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50IC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnMuaGFzT3duUHJvcGVydHkocGFyZW50Q29udGV4dC5yZWdpb25JZCkgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnIGlzIG5vdCBhIHJlZ2lzdGVyZWQgd2F0Y2hlciEgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBcInRoaXMucmVnaXN0ZXJXYXRjaGVyXCIgYmVmb3JlIHRyeWluZyB0byBhY2Nlc3MgTm9kZSBPYmplY3RzLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgdGVzdC1iZW5jaGVzIChkZWZpbmVkIGluIEFUTUZvbGRlcnMpIGluIHRoZSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIgKG11c3QgaGF2ZSBhIHJlZ2lvbklkIGRlZmluZWQpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gY2FsbGVkIG9uIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLWJhc2UuIERhdGEgaXMgdGhlIHVwZGF0ZWQgZGF0YS5jb3VudC5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlcyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzXycgKyB3b3Jrc3BhY2VJZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50IC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1UZXN0QmVuY2hNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVk1UZXN0QmVuY2hNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgd2F0Y2hlcnMgc3Bhd25lZCBmcm9tIHBhcmVudENvbnRleHQsIHRoaXMgc2hvdWxkIHR5cGljYWxseSBiZSBpbnZva2VkIHdoZW4gdGhlIGNvbnRyb2xsZXIgaXMgZGVzdHJveWVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCkge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRXYXRjaGVycyxcclxuICAgICAgICAgICAgICAgIGtleTtcclxuICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZFdhdGNoZXJzID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBjaGlsZFdhdGNoZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkV2F0Y2hlcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBOb2RlU2VydmljZS5jbGVhblVwUmVnaW9uKGNoaWxkV2F0Y2hlcnNba2V5XS5kYiwgY2hpbGRXYXRjaGVyc1trZXldLnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHNwZWNpZmllZCB3YXRjaGVyIChyZWdpb25JZClcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24gb2YgYm90aCBwYXJlbnQgYW5kIHJlZ2lvbiB0byBiZSBkZWxldGVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZWdpb25JZCAtIFJlZ2lvbiBpZCBvZiB0aGUgc3Bhd25lZCByZWdpb24gdGhhdCBzaG91bGQgYmUgZGVsZXRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgcmVnaW9uSWQpIHtcclxuICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm9kZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihwYXJlbnRDb250ZXh0LmRiLCByZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdGhpbmcgdG8gY2xlYW4tdXAuLicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Nhbm5vdCBjbGVhbi11cCByZWdpb24gc2luY2UgcGFyZW50Q29udGV4dCBpcyBub3QgcmVnaXN0ZXJlZC4uJywgcGFyZW50Q29udGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWdpc3RlcnMgYSB3YXRjaGVyIChjb250cm9sbGVyKSB0byB0aGUgc2VydmljZS4gQ2FsbGJhY2sgZnVuY3Rpb24gaXMgY2FsbGVkIHdoZW4gbm9kZXMgYmVjYW1lIGF2YWlsYWJsZSBvclxyXG4gICAgICAgICAqIHdoZW4gdGhleSBiZWNhbWUgdW5hdmFpbGFibGUuIFRoZXNlIGFyZSBhbHNvIGNhbGxlZCBkaXJlY3RseSB3aXRoIHRoZSBzdGF0ZSBvZiB0aGUgTm9kZVNlcml2Y2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQuZGIgLSBEYXRhYmFzZSBjb25uZWN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0gQ2FsbGVkIHdpdGggdHJ1ZSB3aGVuIHRoZXJlIGFyZSBubyBub2RlcyB1bmF2YWlsYWJsZSBhbmQgZmFsc2Ugd2hlbiB0aGVyZSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZm4pIHtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2Uub24ocGFyZW50Q29udGV4dC5kYiwgJ2luaXRpYWxpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBiZSBlbm91Z2gsIHRoZSByZWdpb25zIHdpbGwgYmUgY2xlYW5lZCB1cCBpbiBOb2RlU2VydmljZS5cclxuICAgICAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0ge307XHJcbiAgICAgICAgICAgICAgICBmbihmYWxzZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBOb2RlU2VydmljZS5vbihwYXJlbnRDb250ZXh0LmRiLCAnZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGVub3VnaCwgdGhlIHJlZ2lvbnMgc2hvdWxkIGJlIGNsZWFuZWQgdXAgaW4gTm9kZVNlcnZpY2UuXHJcbiAgICAgICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmbih0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dDb250ZXh0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2UubG9nQ29udGV4dChjb250ZXh0KTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIHJlcXVpcmUsIGFuZ3VsYXIgKi9cclxuLyoqXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnLCBbJ2dtZS5zZXJ2aWNlcyddKTtcclxucmVxdWlyZSgnLi9GaWxlU2VydmljZScpO1xyXG5yZXF1aXJlKCcuL1dvcmtzcGFjZVNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9Db21wb25lbnRTZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vRGVzaWduU2VydmljZScpO1xyXG5yZXF1aXJlKCcuL1Rlc3RCZW5jaFNlcnZpY2UnKTsiXX0=
