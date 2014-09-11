(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * angular-markdown-directive v0.3.0
 * (c) 2013-2014 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.markdown', ['ngSanitize']).
  provider('markdownConverter', function () {
    var opts = {};
    return {
      config: function (newOpts) {
        opts = newOpts;
      },
      $get: function () {
        return new Showdown.converter(opts);
      }
    };
  }).
  directive('btfMarkdown', function ($sanitize, markdownConverter) {
    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
        if (attrs.btfMarkdown) {
          scope.$watch(attrs.btfMarkdown, function (newVal) {
            var html = newVal ? $sanitize(markdownConverter.makeHtml(newVal)) : '';
            element.html(html);
          });
        } else {
          var html = $sanitize(markdownConverter.makeHtml(element.text()));
          element.html(html);
        }
      }
    };
  });

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/angular-markdown-directive/markdown.js","/../../node_modules/angular-markdown-directive")
},{"buffer":3,"rH1JPG":6}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 AngularJS v1.2.10
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(p,h,q){'use strict';function E(a){var e=[];s(e,h.noop).chars(a);return e.join("")}function k(a){var e={};a=a.split(",");var d;for(d=0;d<a.length;d++)e[a[d]]=!0;return e}function F(a,e){function d(a,b,d,g){b=h.lowercase(b);if(t[b])for(;f.last()&&u[f.last()];)c("",f.last());v[b]&&f.last()==b&&c("",b);(g=w[b]||!!g)||f.push(b);var l={};d.replace(G,function(a,b,e,c,d){l[b]=r(e||c||d||"")});e.start&&e.start(b,l,g)}function c(a,b){var c=0,d;if(b=h.lowercase(b))for(c=f.length-1;0<=c&&f[c]!=b;c--);
if(0<=c){for(d=f.length-1;d>=c;d--)e.end&&e.end(f[d]);f.length=c}}var b,g,f=[],l=a;for(f.last=function(){return f[f.length-1]};a;){g=!0;if(f.last()&&x[f.last()])a=a.replace(RegExp("(.*)<\\s*\\/\\s*"+f.last()+"[^>]*>","i"),function(b,a){a=a.replace(H,"$1").replace(I,"$1");e.chars&&e.chars(r(a));return""}),c("",f.last());else{if(0===a.indexOf("\x3c!--"))b=a.indexOf("--",4),0<=b&&a.lastIndexOf("--\x3e",b)===b&&(e.comment&&e.comment(a.substring(4,b)),a=a.substring(b+3),g=!1);else if(y.test(a)){if(b=a.match(y))a=
a.replace(b[0],""),g=!1}else if(J.test(a)){if(b=a.match(z))a=a.substring(b[0].length),b[0].replace(z,c),g=!1}else K.test(a)&&(b=a.match(A))&&(a=a.substring(b[0].length),b[0].replace(A,d),g=!1);g&&(b=a.indexOf("<"),g=0>b?a:a.substring(0,b),a=0>b?"":a.substring(b),e.chars&&e.chars(r(g)))}if(a==l)throw L("badparse",a);l=a}c()}function r(a){if(!a)return"";var e=M.exec(a);a=e[1];var d=e[3];if(e=e[2])n.innerHTML=e.replace(/</g,"&lt;"),e="textContent"in n?n.textContent:n.innerText;return a+e+d}function B(a){return a.replace(/&/g,
"&amp;").replace(N,function(a){return"&#"+a.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}function s(a,e){var d=!1,c=h.bind(a,a.push);return{start:function(a,g,f){a=h.lowercase(a);!d&&x[a]&&(d=a);d||!0!==C[a]||(c("<"),c(a),h.forEach(g,function(d,f){var g=h.lowercase(f),k="img"===a&&"src"===g||"background"===g;!0!==O[g]||!0===D[g]&&!e(d,k)||(c(" "),c(f),c('="'),c(B(d)),c('"'))}),c(f?"/>":">"))},end:function(a){a=h.lowercase(a);d||!0!==C[a]||(c("</"),c(a),c(">"));a==d&&(d=!1)},chars:function(a){d||
c(B(a))}}}var L=h.$$minErr("$sanitize"),A=/^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/,z=/^<\s*\/\s*([\w:-]+)[^>]*>/,G=/([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,K=/^</,J=/^<\s*\//,H=/\x3c!--(.*?)--\x3e/g,y=/<!DOCTYPE([^>]*?)>/i,I=/<!\[CDATA\[(.*?)]]\x3e/g,N=/([^\#-~| |!])/g,w=k("area,br,col,hr,img,wbr");p=k("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr");q=k("rp,rt");var v=h.extend({},q,p),t=h.extend({},p,k("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul")),
u=h.extend({},q,k("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")),x=k("script,style"),C=h.extend({},w,t,u,v),D=k("background,cite,href,longdesc,src,usemap"),O=h.extend({},D,k("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,target,title,type,valign,value,vspace,width")),
n=document.createElement("pre"),M=/^(\s*)([\s\S]*?)(\s*)$/;h.module("ngSanitize",[]).provider("$sanitize",function(){this.$get=["$$sanitizeUri",function(a){return function(e){var d=[];F(e,s(d,function(c,b){return!/^unsafe/.test(a(c,b))}));return d.join("")}}]});h.module("ngSanitize").filter("linky",["$sanitize",function(a){var e=/((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/,d=/^mailto:/;return function(c,b){function g(a){a&&m.push(E(a))}function f(a,c){m.push("<a ");h.isDefined(b)&&
(m.push('target="'),m.push(b),m.push('" '));m.push('href="');m.push(a);m.push('">');g(c);m.push("</a>")}if(!c)return c;for(var l,k=c,m=[],n,p;l=k.match(e);)n=l[0],l[2]==l[3]&&(n="mailto:"+n),p=l.index,g(k.substr(0,p)),f(n,l[0].replace(d,"")),k=k.substring(p+l[0].length);g(k);return a(m.join(""))}}])})(window,window.angular);
//# sourceMappingURL=angular-sanitize.min.js.map

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/angular-sanitize/angular-sanitize.min.js","/../../node_modules/angular-sanitize")
},{"buffer":3,"rH1JPG":6}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer")
},{"base64-js":4,"buffer":3,"ieee754":5,"rH1JPG":6}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib")
},{"buffer":3,"rH1JPG":6}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754")
},{"buffer":3,"rH1JPG":6}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/process/browser.js","/../../node_modules/process")
},{"buffer":3,"rH1JPG":6}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*globals angular, require*/
'use strict';

var components = [
  'searchBox',
  'itemList',
  'simpleDialog',
  'hierarchicalMenu',
  'contextmenu',
  'dropdownNavigator',
  'treeNavigator'
];

require( '../library/simpleDialog/docs/demo.js' );
require( '../library/hierarchicalMenu/docs/demo.js' );
require( '../library/contextmenu/docs/demo.js' );
require( '../library/dropdownNavigator/docs/demo.js' );
require( '../library/treeNavigator/docs/demo.js' );
require( '../library/itemList/docs/demo.js' );
require( '../library/searchBox/docs/demo.js' );

require( 'angular-sanitize' );
window.Showdown = require( 'showdown' );
require( 'angular-markdown-directive' );


var demoApp = angular.module(
  'isis.ui.demoApp', [
    'isis.ui.demoApp.templates',
    'btford.markdown'
  ].concat( components.map( function ( e ) {
    return 'isis.ui.' + e + '.demo';
  } ) )
);

demoApp.run( function () {
  console.log( 'DemoApp run...' );
} );

demoApp.controller(
  'UIComponentsDemoController',
  function ( $scope ) {

    $scope.components = components.map( function ( component ) {
      return {
        name: component,
        template: '/library/' + component + '/docs/demo.html',
        docs: '/library/' + component + '/docs/readme.md'
      };
    } );

  } );
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/docs_app.js","/")
},{"../library/contextmenu/docs/demo.js":8,"../library/dropdownNavigator/docs/demo.js":9,"../library/hierarchicalMenu/docs/demo.js":10,"../library/itemList/docs/demo.js":11,"../library/searchBox/docs/demo.js":12,"../library/simpleDialog/docs/demo.js":13,"../library/treeNavigator/docs/demo.js":14,"angular-markdown-directive":1,"angular-sanitize":2,"buffer":3,"rH1JPG":6,"showdown":15}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*globals console, angular*/

'use strict';

var demoApp = angular.module( 'isis.ui.contextmenu.demo', [ 'isis.ui.contextmenu' ] );

demoApp.controller( 'ContextmenuCustomTemplateController', function ( $scope, contextmenuService ) {
  $scope.parameter = {};

  $scope.closeClick = function () {
    console.log( 'closing this manually' );
    contextmenuService.close();
  };

  $scope.isValid = function ( num ) {
    console.log( 'Who knows if is valid?', num );

    if ( parseInt(num, 10) === 4 ) {
      $scope.parameter.invalid = false;
    } else {
      $scope.parameter.invalid = true;
    }
  };

});

demoApp.controller( 'ContextmenuDemoController', function ( $scope ) {

  var menuData = [
    {
      id: 'top',
      items: [
        {
          id: 'newProject',
          label: 'New project ...',
          iconClass: 'glyphicon glyphicon-plus',
          action: function () {
            console.log( 'New project clicked' );
          },
          actionData: {}
        },
        {
          id: 'importProject',
          label: 'Import project ...',
          iconClass: 'glyphicon glyphicon-import',
          action: function () {
            console.log( 'Import project clicked' );
          },
          actionData: {}
        }
      ]
    },
    {
      id: 'projects',
      label: 'Recent projects',
      totalItems: 20,
      items: [],
      showAllItems: function () {
        console.log( 'Recent projects clicked' );
      }
    },
    {
      id: 'preferences',
      label: 'preferences',
      items: [
        {
          id: 'showPreferences',
          label: 'Show preferences',
          action: function () {
            console.log( 'Show preferences' );
          },
          menu: [
            {
              items: [
                {
                  id: 'preferences 1',
                  label: 'Preferences 1'
                },
                {
                  id: 'preferences 2',
                  label: 'Preferences 2'
                },
                {
                  id: 'preferences 3',
                  label: 'Preferences 3',
                  menu: [
                    {
                      items: [
                        {
                          id: 'sub_preferences 1',
                          label: 'Sub preferences 1'
                        },
                        {
                          id: 'sub_preferences 2',
                          label: 'Sub preferences 2'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  $scope.menuConfig1 = {
    triggerEvent: 'click',
    position: 'right bottom'
  };

  $scope.menuConfig2 = {
    triggerEvent: 'mouseover',
    position: 'left bottom',
    contentTemplateUrl: 'contextmenu-custom-content.html',
    doNotAutoClose: true
  };

  $scope.menuData = menuData;

  $scope.preContextMenu = function ( e ) {
    console.log( 'In preContextMenu ', e );
  };


} );
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../library/contextmenu/docs/demo.js","/../library/contextmenu/docs")
},{"buffer":3,"rH1JPG":6}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*globals console, angular*/
'use strict';

var demoApp = angular.module( 'isis.ui.dropdownNavigator.demo', [ 'isis.ui.dropdownNavigator' ] );

demoApp.controller( 'DropdownDemoController', function ( $scope ) {
  var firstMenu,
    secondMenu;

  firstMenu = {
    id: 'root',
    label: 'GME',
    //            isSelected: true,
    itemClass: 'gme-root',
    menu: []
  };

  secondMenu = {
    id: 'secondItem',
    label: 'Projects',
    menu: []
  };

  firstMenu.menu = [ {
    id: 'top',
    items: [ {
      id: 'newProject',
      label: 'New project ...',
      iconClass: 'glyphicon glyphicon-plus',
      action: function () {
        console.log( 'New project clicked' );
      },
      actionData: {}
    }, {
      id: 'importProject',
      label: 'Import project ...',
      iconClass: 'glyphicon glyphicon-import',
      action: function () {
        console.log( 'Import project clicked' );
      },
      actionData: {}
    } ]
  }, {
    id: 'projects',
    label: 'Recent projects',
    totalItems: 20,
    items: [],
    showAllItems: function () {
      console.log( 'Recent projects clicked' );
    }
  }, {
    id: 'preferences',
    label: 'preferences',
    items: [ {
      id: 'showPreferences',
      label: 'Show preferences',
      action: function () {
        console.log( 'Show preferences' );
      },
      menu: [ {
        items: [ {
          id: 'preferences 1',
          label: 'Preferences 1'
        }, {
          id: 'preferences 2',
          label: 'Preferences 2'
        }, {
          id: 'preferences 3',
          label: 'Preferences 3',
          menu: [ {
            items: [ {
              id: 'sub_preferences 1',
              label: 'Sub preferences 1'
            }, {
              id: 'sub_preferences 2',
              label: 'Sub preferences 2'
            } ]
          } ]
        } ]
      } ]
    } ]
  } ];


  secondMenu = {
    id: 'secondItem',
    label: 'Projects',
    menu: []
  };

  secondMenu.menu = [ {
    id: 'secondMenuMenu',
    items: [

      {
        id: 'showPreferences',
        label: 'Show preferences',
        action: function () {
          console.log( 'Show preferences' );
        },
        menu: [ {
          items: [ {
            id: 'preferences 1',
            label: 'Preferences 1'
          }, {
            id: 'preferences 2',
            label: 'Preferences 2'
          }, {
            id: 'preferences 3',
            label: 'Preferences 3',
            menu: [ {
              items: [ {
                id: 'sub_preferences 1',
                label: 'Sub preferences 1'
              }, {
                id: 'sub_preferences 2',
                label: 'Sub preferences 2'
              } ]
            } ]
          } ]
        } ]
      }
    ]
  } ];

  $scope.navigator = {
    items: [
      firstMenu,
      secondMenu
    ],
    separator: true
  };


} );
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../library/dropdownNavigator/docs/demo.js","/../library/dropdownNavigator/docs")
},{"buffer":3,"rH1JPG":6}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*globals console, angular*/
'use strict';

var demoApp = angular.module( 'isis.ui.hierarchicalMenu.demo', [ 'ui.bootstrap',
  'isis.ui.hierarchicalMenu'
] );

demoApp.controller( 'HierarchicalMenuDemoController', function ( $scope ) {

  var menu;

  menu = [ {
    id: 'top',
    items: [ {
      id: 'newProject',
      label: 'New project ...',
      iconClass: 'glyphicon glyphicon-plus',
      action: function () {
        console.log( 'New project clicked' );
      },
      actionData: {}
    }, {
      id: 'importProject',
      label: 'Import project ...',
      iconClass: 'glyphicon glyphicon-import',
      action: function () {
        console.log( 'Import project clicked' );
      },
      actionData: {}
    } ]
  }, {
    id: 'projects',
    label: 'Recent projects',
    totalItems: 20,
    items: [],
    showAllItems: function () {
      console.log( 'Recent projects clicked' );
    }
  }, {
    id: 'preferences',
    label: 'preferences',
    items: [ {
      id: 'showPreferences',
      label: 'Show preferences',
      action: function () {
        console.log( 'Show preferences' );
      },
      menu: [ {
        items: [ {
          id: 'preferences 1',
          label: 'Preferences 1'
        }, {
          id: 'preferences 2',
          label: 'Preferences 2'
        }, {
          id: 'preferences 3',
          label: 'Preferences 3',
          menu: [ {
            items: [ {
              id: 'sub_preferences 1',
              label: 'Sub preferences 1'
            }, {
              id: 'sub_preferences 2',
              label: 'Sub preferences 2'
            } ]
          } ]
        } ]
      } ]
    } ]
  } ];

  $scope.menu = menu;

} );
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../library/hierarchicalMenu/docs/demo.js","/../library/hierarchicalMenu/docs")
},{"buffer":3,"rH1JPG":6}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*globals angular*/
'use strict';

var demoApp = angular.module( 'isis.ui.itemList.demo', [ 'isis.ui.itemList' ] );

demoApp.controller( 'ListItemDetailsDemoController', function ( $scope ) {
  $scope.parameter = {};

  $scope.isValid = function ( num ) {
    console.log( 'Who knows if is valid?', num );

    if ( parseInt( num, 10 ) === 4 ) {
      $scope.parameter.invalid = false;
    } else {
      $scope.parameter.invalid = true;
    }
  };


} );

demoApp.controller( 'ListItemDetailsDemoController2', function ( $scope ) {
  var i,
  items2 = [],
  itemGenerator2,
  config;

  itemGenerator2 = function ( id ) {
    return {
      id: id,
      title: 'List sub-item ' + id,
      toolTip: 'Open item',
      description: 'This is description here',
      lastUpdated: {
        time: Date.now(),
        user: 'N/A'

      },
      stats: [
        {
          value: id,
          tooltip: 'Orders',
          iconClass: 'fa fa-cubes'
        }
      ],
      details: 'Some detailed text. Lorem ipsum ama fea rin the poc ketofmyja cket.'
    };
  };


  for ( i = 0; i < 20; i++ ) {
    items2.push( itemGenerator2( i ) );
  }

  config = {

    sortable: true,
    secondaryItemMenu: true,
    detailsCollapsible: true,
    showDetailsLabel: 'Show details',
    hideDetailsLabel: 'Hide details',

    // Event handlers

    itemSort: function ( jQEvent, ui ) {
      console.log( 'Sort happened', jQEvent, ui );
    },

    itemClick: function ( event, item ) {
      console.log( 'Clicked: ' + item );
    },

    itemContextmenuRenderer: function ( e, item ) {
      console.log( 'Contextmenu was triggered for node:', item );

      return  [{
        items: [

          {
            id: 'create',
            label: 'Create new',
            disabled: true,
            iconClass: 'fa fa-plus'
          }
        ]
      }];
    },

    detailsRenderer: function ( item ) {
      item.details = 'My details are here now!';
    },

    newItemForm: {
      title: 'Create new item',
      itemTemplateUrl: '/library/itemList/docs/newItemTemplate.html',
      expanded: false,
      controller: function ( $scope ) {
        $scope.createItem = function ( newItem ) {

          newItem.url = 'something';
          newItem.toolTip = newItem.title;

          items2.push( newItem );

          $scope.newItem = {};

          config.newItemForm.expanded = false; // this is how you close the form itself

        };
      }
    },

    filter: {
    }

  };

  $scope.listData2 = {
    items: items2
  };

  $scope.config2 = config;

} )
;

demoApp.directive('demoSubList', function() {
  return {
    restrict: 'E',
    replace: false,
    scope: {
      listData: '=',
      config: '='
    },
    template: '<item-list list-data="listData" config="config" class="col-md-12"></item-list>'
  };
});

demoApp.controller( 'ItemListDemoController', function ( $scope ) {


  var
  i,

  items = [],

  itemGenerator,
  getItemContextmenu,
  config;

  itemGenerator = function ( id ) {
    return {
      id: id,
      title: 'List item ' + id,
      cssClass: 'my-item',
      toolTip: 'Open item',
      description: 'This is description here',
      lastUpdated: {
        time: Date.now(),
        user: 'N/A'

      },
      stats: [
        {
          value: id,
          tooltip: 'Orders',
          iconClass: 'fa fa-cubes'
        }
      ],
      details: 'Some detailed text. Lorem ipsum ama fea rin the poc ketofmyja cket.',
      detailsTemplateUrl: Math.random() < 0.5 ? 'list-item-details.html' : 'list-item-details2.html'
    };
  };


  for ( i = 0; i < 20; i++ ) {
    items.push( itemGenerator( i ) );
  }

  getItemContextmenu = function ( item ) {

    var defaultItemContextmenu = [
      {
        items: [
          {
            id: 'create',
            label: 'Create new',
            disabled: true,
            iconClass: 'fa fa-plus'
          },
          {
            id: 'dummy',
            label: 'Just for test ' + item.id,

            actionData: item,

            action: function ( data ) {
              console.log( 'testing ', data );
            }

          },
          {
            id: 'rename',
            label: 'Rename'
          },
          {
            id: 'preferences 3',
            label: 'Preferences 3',
            menu: [
              {
                items: [
                  {
                    id: 'sub_preferences 1',
                    label: 'Sub preferences 1'
                  },
                  {
                    id: 'sub_preferences 2',
                    label: 'Sub preferences 2',
                    action: function ( data ) {
                      console.log( 'testing2 ', data );
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    return defaultItemContextmenu;

  };

  config = {

    sortable: true,
    secondaryItemMenu: true,
    detailsCollapsible: true,
    showDetailsLabel: 'Show details',
    hideDetailsLabel: 'Hide details',

    // Event handlers

    itemSort: function ( jQEvent, ui ) {
      console.log( 'Sort happened', jQEvent, ui );
    },

    itemClick: function ( event, item ) {
      console.log( 'Clicked: ' + item );
    },

    itemContextmenuRenderer: function ( e, item ) {
      console.log( 'Contextmenu was triggered for node:', item );

      return getItemContextmenu( item );
    },

    detailsRenderer: function ( item ) {
      item.details = 'My details are here now!';
    },

    newItemForm: {
      title: 'Create new item',
      itemTemplateUrl: '/library/itemList/docs/newItemTemplate.html',
      expanded: false,
      controller: function ( $scope ) {
        $scope.createItem = function ( newItem ) {

          newItem.url = 'something';
          newItem.toolTip = newItem.title;

          items.push( newItem );

          $scope.newItem = {};

          config.newItemForm.expanded = false; // this is how you close the form itself

        };
      }
    },

    filter: {}

  };

  $scope.listData = {
    items: items
  };

  $scope.config = config;

} )
;
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../library/itemList/docs/demo.js","/../library/itemList/docs")
},{"buffer":3,"rH1JPG":6}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*globals angular*/
'use strict';

var demoApp = angular.module( 'isis.ui.searchBox.demo', [ 'isis.ui.searchBox' ] );

demoApp.controller( 'SearchBoxDemoController', function ( ) {

});

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../library/searchBox/docs/demo.js","/../library/searchBox/docs")
},{"buffer":3,"rH1JPG":6}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*globals console, angular*/

'use strict';

var isValid,
  demoApp = angular.module( 'isis.ui.simpleDialog.demo', [ 'isis.ui.simpleDialog' ] ),

  parameter = {
    value: 10,
    invalid: true
  };

demoApp.controller( 'ConfirmDialogDemoController', function ( $scope, $simpleDialog ) {

  isValid = function () {

    var result = ( Number( parameter.value ) === 4 );

    console.log( 'Validator was called' );
    console.log( 'Sum is: ' + parameter.value, result );
    parameter.invalid = !result;

    return result;

  };


  $scope.parameter = parameter;

  $scope.isValid = function () {
    isValid();
    if ( !$scope.$$phase ) {
      $scope.$apply();
    }
  };

  $scope.openDialog = function () {

    $simpleDialog.open( {
      dialogTitle: 'Are you sure?',
      dialogContentTemplate: 'confirm-content-template',
      onOk: function () {
        console.log( 'OK was picked' );
      },
      onCancel: function () {
        console.log( 'This was canceled' );
      },
      validator: isValid,
      size: 'lg', // can be sm or lg
      scope: $scope
    } );

  };


} );

demoApp.controller( 'ConfirmDialogDemoDataController', function () {

} );
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../library/simpleDialog/docs/demo.js","/../library/simpleDialog/docs")
},{"buffer":3,"rH1JPG":6}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*globals angular*/
'use strict';

var demoApp = angular.module( 'isis.ui.treeNavigator.demo', [ 'isis.ui.treeNavigator' ] );

demoApp.controller( 'TreeNavigatorDemoController', function ( $scope, $log, $q ) {

  var config,
    treeNodes = {},

    addNode,
    removeNode,
    getNodeContextmenu,
    dummyTreeDataGenerator,
    sortChildren;

  getNodeContextmenu = function(node) {

    var defaultNodeContextmenu = [
        {
          items: [
            {
              id: 'create',
              label: 'Create new',
              disabled: true,
              iconClass: 'fa fa-plus',
              menu: []
            },
            {
              id: 'dummy',
              label: 'Just for test ' + node.id,

              actionData: node,

              action: function ( data ) {
                $log.log( 'testing ', data );
              }

            },
            {
              id: 'rename',
              label: 'Rename'
            },
            {
              id: 'delete',
              label: 'Delete',
              iconClass: 'fa fa-minus',
              actionData: {
                id: node.id
              },
              action: function ( data ) {
                removeNode( data.id );
              }
            },
            {
              id: 'preferences 3',
              label: 'Preferences 3',
              menu: [
                {
                  items: [
                    {
                      id: 'sub_preferences 1',
                      label: 'Sub preferences 1'
                    },
                    {
                      id: 'sub_preferences 2',
                      label: 'Sub preferences 2',
                      action: function ( data ) {
                        $log.log( 'testing2 ', data );
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

    return defaultNodeContextmenu;

  };

  dummyTreeDataGenerator = function ( treeNode, name, maxCount, levels ) {
    var i,
      id,
      count,
      childNode;

    levels = levels || 0;

    count = Math.round(
      Math.random() * maxCount
    ) + 1;

    for ( i = 0; i < count; i += 1 ) {
      id = name + i;

      childNode = addNode( treeNode, id );

      if ( levels > 0 ) {
        dummyTreeDataGenerator( childNode, id + '.', maxCount, levels - 1 );
      }
    }
  };

  addNode = function ( parentTreeNode, id ) {
    var newTreeNode,
      children = [];


    // node structure
    newTreeNode = {
      label: id,
      extraInfo: 'Extra info',
      children: children,
      childrenCount: 0,
      nodeData: {},
      iconClass: 'fa fa-file-o',

      draggable: true,
      dragChannel: 'a',
      dropChannel: (Math.random() > 0.5) ? 'a' : 'b'
    };

    newTreeNode.id = id;

    // add the new node to the map
    treeNodes[ newTreeNode.id ] = newTreeNode;


    if ( parentTreeNode ) {
      // if a parent was given add the new node as a child node
      parentTreeNode.iconClass = undefined;
      parentTreeNode.children.push( newTreeNode );


      parentTreeNode.childrenCount = parentTreeNode.children.length;

      if ( newTreeNode.childrenCount === 0 ) {
        newTreeNode.childrenCount = Math.round( Math.random() );
      }


      if ( newTreeNode.childrenCount ) {
        newTreeNode.iconClass = undefined;
      }

      sortChildren( parentTreeNode.children );

      newTreeNode.parentId = parentTreeNode.id;
    } else {

      // if no parent is given replace the current root node with this node
      $scope.treeData = newTreeNode;
      $scope.treeData.unCollapsible = true;
      newTreeNode.parentId = null;
    }

    return newTreeNode;
  };

  removeNode = function ( id ) {
    var
      parentNode,
      nodeToDelete = treeNodes[ id ];

    $log.debug( 'Removing a node ' + id );

    if ( nodeToDelete ) {
      if ( nodeToDelete.parentId !== null && treeNodes[ nodeToDelete.parentId ] !== undefined ) {
        // find parent node
        parentNode = treeNodes[ nodeToDelete.parentId ];

        // remove nodeToDelete from parent node's children
        parentNode.children = parentNode.children.filter( function ( el ) {
          return el.id !== id;
        } );

        parentNode.childrenCount = parentNode.children.length;

        if ( parentNode.childrenCount === 0 ) {
          parentNode.iconClass = 'fa fa-file-o';
        }
      }

      delete treeNodes[ id ];
    }

  };

  sortChildren = function ( values ) {
    var orderBy = ['label', 'id'];

    values.sort( function ( a, b ) {
      var i,
        key,
        result;

      for ( i = 0; i < orderBy.length; i += 1 ) {
        key = orderBy[i];
        if ( a.hasOwnProperty( key ) && b.hasOwnProperty( key ) ) {
          result = a[key].toLowerCase().localeCompare( b[key].toLowerCase() );
          if ( result !== 0 ) {
            return result;
          }
        }
      }

      // a must be equal to b
      return 0;
    } );

    return values;
  };

  config = {

    scopeMenu: [
      {
        items: [
          {
            id: 'project',
            label: 'Project Hierarchy',
            action: function () {
              $scope.config.state.activeScope = 'project';
              $scope.config.selectedScope = $scope.config.scopeMenu[ 0 ].items[ 0 ];
            }
          },
          {
            id: 'composition',
            label: 'Composition',
            action: function () {
              $scope.config.state.activeScope = 'composition';
              $scope.config.selectedScope = $scope.config.scopeMenu[ 0 ].items[ 1 ];
            }
          }
        ]
      }

    ],

    preferencesMenu: [
      {
        items: [
          {
            id: 'preferences 1',
            label: 'Preferences 1'
          },

          {
            id: 'preferences 2',
            label: 'Preferences 2'
          },

          {
            id: 'preferences 3',
            label: 'Preferences 3',
            menu: [
              {
                items: [
                  {
                    id: 'sub_preferences 1',
                    label: 'Sub preferences 1'
                  },
                  {
                    id: 'sub_preferences 2',
                    label: 'Sub preferences 2',
                    action: function ( data ) {
                      $log.log( data );
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ],

    showRootLabel: true,

    // Tree Event callbacks

    nodeClick: function(e, node) {
      console.log('Node was clicked:', node);
    },

    nodeDblclick: function(e, node) {
      console.log('Node was double-clicked:', node);
    },

    nodeContextmenuRenderer: function(e, node) {
      console.log('Contextmenu was triggered for node:', node);

      return getNodeContextmenu(node);

    },

    nodeExpanderClick: function(e, node, isExpand) {
      console.log('Expander was clicked for node:', node, isExpand);
    },

    loadChildren: function(e, node) {
      var deferred = $q.defer();

      setTimeout(
      function () {
        dummyTreeDataGenerator( node, 'Async ' + node.id, 5, 0 );
        deferred.resolve();
      },
      2000
      );

      return deferred.promise;
    }


  };

  $scope.config = config;
  $scope.config.selectedScope = $scope.config.scopeMenu[ 0 ].items[ 0 ];
  $scope.treeData = {};
  $scope.config.state = {
    // id of activeNode
    activeNode: 'Node item 0.0',

    // ids of selected nodes
    selectedNodes: ['Node item 0.0'],

    expandedNodes: [ 'Node item 0', 'Node item 0.1'],

    // id of active scope
    activeScope: 'project'
  };


  addNode( null, 'ROOT' );
  dummyTreeDataGenerator( $scope.treeData, 'Node item ', 5, 3 );

} );
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../library/treeNavigator/docs/demo.js","/../library/treeNavigator/docs")
},{"buffer":3,"rH1JPG":6}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
//
// showdown.js -- A javascript port of Markdown.
//
// Copyright (c) 2007 John Fraser.
//
// Original Markdown Copyright (c) 2004-2005 John Gruber
//   <http://daringfireball.net/projects/markdown/>
//
// Redistributable under a BSD-style open source license.
// See license.txt for more information.
//
// The full source distribution is at:
//
//				A A L
//				T C A
//				T K B
//
//   <http://www.attacklab.net/>
//

//
// Wherever possible, Showdown is a straight, line-by-line port
// of the Perl version of Markdown.
//
// This is not a normal parser design; it's basically just a
// series of string substitutions.  It's hard to read and
// maintain this way,  but keeping Showdown close to the original
// design makes it easier to port new features.
//
// More importantly, Showdown behaves like markdown.pl in most
// edge cases.  So web applications can do client-side preview
// in Javascript, and then build identical HTML on the server.
//
// This port needs the new RegExp functionality of ECMA 262,
// 3rd Edition (i.e. Javascript 1.5).  Most modern web browsers
// should do fine.  Even with the new regular expression features,
// We do a lot of work to emulate Perl's regex functionality.
// The tricky changes in this file mostly have the "attacklab:"
// label.  Major or self-explanatory changes don't.
//
// Smart diff tools like Araxis Merge will be able to match up
// this file with markdown.pl in a useful way.  A little tweaking
// helps: in a copy of markdown.pl, replace "#" with "//" and
// replace "$text" with "text".  Be sure to ignore whitespace
// and line endings.
//


//
// Showdown usage:
//
//   var text = "Markdown *rocks*.";
//
//   var converter = new Showdown.converter();
//   var html = converter.makeHtml(text);
//
//   alert(html);
//
// Note: move the sample code to the bottom of this
// file before uncommenting it.
//


//
// Showdown namespace
//
var Showdown = { extensions: {} };

//
// forEach
//
var forEach = Showdown.forEach = function(obj, callback) {
	if (typeof obj.forEach === 'function') {
		obj.forEach(callback);
	} else {
		var i, len = obj.length;
		for (i = 0; i < len; i++) {
			callback(obj[i], i, obj);
		}
	}
};

//
// Standard extension naming
//
var stdExtName = function(s) {
	return s.replace(/[_-]||\s/g, '').toLowerCase();
};

//
// converter
//
// Wraps all "globals" so that the only thing
// exposed is makeHtml().
//
Showdown.converter = function(converter_options) {

//
// Globals:
//

// Global hashes, used by various utility routines
var g_urls;
var g_titles;
var g_html_blocks;

// Used to track when we're inside an ordered or unordered list
// (see _ProcessListItems() for details):
var g_list_level = 0;

// Global extensions
var g_lang_extensions = [];
var g_output_modifiers = [];


//
// Automatic Extension Loading (node only):
//

/*if (typeof module !== 'undefind' && typeof exports !== 'undefined' && typeof require !== 'undefind') {
	var fs = require('fs');

	if (fs) {
		// Search extensions folder
		var extensions = fs.readdirSync((__dirname || '.')+'/extensions').filter(function(file){
			return ~file.indexOf('.js');
		}).map(function(file){
			return file.replace(/\.js$/, '');
		});
		// Load extensions into Showdown namespace
		Showdown.forEach(extensions, function(ext){
			var name = stdExtName(ext);
			Showdown.extensions[name] = require('./extensions/' + ext);
		});
	}
}*/

this.makeHtml = function(text) {
//
// Main function. The order in which other subs are called here is
// essential. Link and image substitutions need to happen before
// _EscapeSpecialCharsWithinTagAttributes(), so that any *'s or _'s in the <a>
// and <img> tags get encoded.
//

	// Clear the global hashes. If we don't clear these, you get conflicts
	// from other articles when generating a page which contains more than
	// one article (e.g. an index page that shows the N most recent
	// articles):
	g_urls = {};
	g_titles = {};
	g_html_blocks = [];

	// attacklab: Replace ~ with ~T
	// This lets us use tilde as an escape char to avoid md5 hashes
	// The choice of character is arbitray; anything that isn't
	// magic in Markdown will work.
	text = text.replace(/~/g,"~T");

	// attacklab: Replace $ with ~D
	// RegExp interprets $ as a special character
	// when it's in a replacement string
	text = text.replace(/\$/g,"~D");

	// Standardize line endings
	text = text.replace(/\r\n/g,"\n"); // DOS to Unix
	text = text.replace(/\r/g,"\n"); // Mac to Unix

	// Make sure text begins and ends with a couple of newlines:
	text = "\n\n" + text + "\n\n";

	// Convert all tabs to spaces.
	text = _Detab(text);

	// Strip any lines consisting only of spaces and tabs.
	// This makes subsequent regexen easier to write, because we can
	// match consecutive blank lines with /\n+/ instead of something
	// contorted like /[ \t]*\n+/ .
	text = text.replace(/^[ \t]+$/mg,"");

	// Run language extensions
	Showdown.forEach(g_lang_extensions, function(x){
		text = _ExecuteExtension(x, text);
	});

	// Handle github codeblocks prior to running HashHTML so that
	// HTML contained within the codeblock gets escaped propertly
	text = _DoGithubCodeBlocks(text);

	// Turn block-level HTML blocks into hash entries
	text = _HashHTMLBlocks(text);

	// Strip link definitions, store in hashes.
	text = _StripLinkDefinitions(text);

	text = _RunBlockGamut(text);

	text = _UnescapeSpecialChars(text);

	// attacklab: Restore dollar signs
	text = text.replace(/~D/g,"$$");

	// attacklab: Restore tildes
	text = text.replace(/~T/g,"~");

	// Run output modifiers
	Showdown.forEach(g_output_modifiers, function(x){
		text = _ExecuteExtension(x, text);
	});

	return text;
};
//
// Options:
//

// Parse extensions options into separate arrays
if (converter_options && converter_options.extensions) {

  var self = this;

	// Iterate over each plugin
	Showdown.forEach(converter_options.extensions, function(plugin){

		// Assume it's a bundled plugin if a string is given
		if (typeof plugin === 'string') {
			plugin = Showdown.extensions[stdExtName(plugin)];
		}

		if (typeof plugin === 'function') {
			// Iterate over each extension within that plugin
			Showdown.forEach(plugin(self), function(ext){
				// Sort extensions by type
				if (ext.type) {
					if (ext.type === 'language' || ext.type === 'lang') {
						g_lang_extensions.push(ext);
					} else if (ext.type === 'output' || ext.type === 'html') {
						g_output_modifiers.push(ext);
					}
				} else {
					// Assume language extension
					g_output_modifiers.push(ext);
				}
			});
		} else {
			throw "Extension '" + plugin + "' could not be loaded.  It was either not found or is not a valid extension.";
		}
	});
}


var _ExecuteExtension = function(ext, text) {
	if (ext.regex) {
		var re = new RegExp(ext.regex, 'g');
		return text.replace(re, ext.replace);
	} else if (ext.filter) {
		return ext.filter(text);
	}
};

var _StripLinkDefinitions = function(text) {
//
// Strips link definitions from text, stores the URLs and titles in
// hash references.
//

	// Link defs are in the form: ^[id]: url "optional title"

	/*
		var text = text.replace(/
				^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1
				  [ \t]*
				  \n?				// maybe *one* newline
				  [ \t]*
				<?(\S+?)>?			// url = $2
				  [ \t]*
				  \n?				// maybe one newline
				  [ \t]*
				(?:
				  (\n*)				// any lines skipped = $3 attacklab: lookbehind removed
				  ["(]
				  (.+?)				// title = $4
				  [")]
				  [ \t]*
				)?					// title is optional
				(?:\n+|$)
			  /gm,
			  function(){...});
	*/

	// attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
	text += "~0";

	text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|(?=~0))/gm,
		function (wholeMatch,m1,m2,m3,m4) {
			m1 = m1.toLowerCase();
			g_urls[m1] = _EncodeAmpsAndAngles(m2);  // Link IDs are case-insensitive
			if (m3) {
				// Oops, found blank lines, so it's not a title.
				// Put back the parenthetical statement we stole.
				return m3+m4;
			} else if (m4) {
				g_titles[m1] = m4.replace(/"/g,"&quot;");
			}

			// Completely remove the definition from the text
			return "";
		}
	);

	// attacklab: strip sentinel
	text = text.replace(/~0/,"");

	return text;
}


var _HashHTMLBlocks = function(text) {
	// attacklab: Double up blank lines to reduce lookaround
	text = text.replace(/\n/g,"\n\n");

	// Hashify HTML blocks:
	// We only want to do this for block-level HTML tags, such as headers,
	// lists, and tables. That's because we still want to wrap <p>s around
	// "paragraphs" that are wrapped in non-block-level tags, such as anchors,
	// phrase emphasis, and spans. The list of tags we're looking for is
	// hard-coded:
	var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del|style|section|header|footer|nav|article|aside";
	var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside";

	// First, look for nested blocks, e.g.:
	//   <div>
	//     <div>
	//     tags for inner block must be indented.
	//     </div>
	//   </div>
	//
	// The outermost tags must start at the left margin for this to match, and
	// the inner nested divs must be indented.
	// We need to do this before the next, more liberal match, because the next
	// match will start at the first `<div>` and stop at the first `</div>`.

	// attacklab: This regex can be expensive when it fails.
	/*
		var text = text.replace(/
		(						// save in $1
			^					// start of line  (with /m)
			<($block_tags_a)	// start tag = $2
			\b					// word break
								// attacklab: hack around khtml/pcre bug...
			[^\r]*?\n			// any number of lines, minimally matching
			</\2>				// the matching end tag
			[ \t]*				// trailing spaces/tabs
			(?=\n+)				// followed by a newline
		)						// attacklab: there are sentinel newlines at end of document
		/gm,function(){...}};
	*/
	text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,hashElement);

	//
	// Now match more liberally, simply from `\n<tag>` to `</tag>\n`
	//

	/*
		var text = text.replace(/
		(						// save in $1
			^					// start of line  (with /m)
			<($block_tags_b)	// start tag = $2
			\b					// word break
								// attacklab: hack around khtml/pcre bug...
			[^\r]*?				// any number of lines, minimally matching
			</\2>				// the matching end tag
			[ \t]*				// trailing spaces/tabs
			(?=\n+)				// followed by a newline
		)						// attacklab: there are sentinel newlines at end of document
		/gm,function(){...}};
	*/
	text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside)\b[^\r]*?<\/\2>[ \t]*(?=\n+)\n)/gm,hashElement);

	// Special case just for <hr />. It was easier to make a special case than
	// to make the other regex more complicated.

	/*
		text = text.replace(/
		(						// save in $1
			\n\n				// Starting after a blank line
			[ ]{0,3}
			(<(hr)				// start tag = $2
			\b					// word break
			([^<>])*?			//
			\/?>)				// the matching end tag
			[ \t]*
			(?=\n{2,})			// followed by a blank line
		)
		/g,hashElement);
	*/
	text = text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,hashElement);

	// Special case for standalone HTML comments:

	/*
		text = text.replace(/
		(						// save in $1
			\n\n				// Starting after a blank line
			[ ]{0,3}			// attacklab: g_tab_width - 1
			<!
			(--[^\r]*?--\s*)+
			>
			[ \t]*
			(?=\n{2,})			// followed by a blank line
		)
		/g,hashElement);
	*/
	text = text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,hashElement);

	// PHP and ASP-style processor instructions (<?...?> and <%...%>)

	/*
		text = text.replace(/
		(?:
			\n\n				// Starting after a blank line
		)
		(						// save in $1
			[ ]{0,3}			// attacklab: g_tab_width - 1
			(?:
				<([?%])			// $2
				[^\r]*?
				\2>
			)
			[ \t]*
			(?=\n{2,})			// followed by a blank line
		)
		/g,hashElement);
	*/
	text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,hashElement);

	// attacklab: Undo double lines (see comment at top of this function)
	text = text.replace(/\n\n/g,"\n");
	return text;
}

var hashElement = function(wholeMatch,m1) {
	var blockText = m1;

	// Undo double lines
	blockText = blockText.replace(/\n\n/g,"\n");
	blockText = blockText.replace(/^\n/,"");

	// strip trailing blank lines
	blockText = blockText.replace(/\n+$/g,"");

	// Replace the element text with a marker ("~KxK" where x is its key)
	blockText = "\n\n~K" + (g_html_blocks.push(blockText)-1) + "K\n\n";

	return blockText;
};

var _RunBlockGamut = function(text) {
//
// These are all the transformations that form block-level
// tags like paragraphs, headers, and list items.
//
	text = _DoHeaders(text);

	// Do Horizontal Rules:
	var key = hashBlock("<hr />");
	text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,key);
	text = text.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,key);
	text = text.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,key);

	text = _DoLists(text);
	text = _DoCodeBlocks(text);
	text = _DoBlockQuotes(text);

	// We already ran _HashHTMLBlocks() before, in Markdown(), but that
	// was to escape raw HTML in the original Markdown source. This time,
	// we're escaping the markup we've just created, so that we don't wrap
	// <p> tags around block-level tags.
	text = _HashHTMLBlocks(text);
	text = _FormParagraphs(text);

	return text;
};


var _RunSpanGamut = function(text) {
//
// These are all the transformations that occur *within* block-level
// tags like paragraphs, headers, and list items.
//

	text = _DoCodeSpans(text);
	text = _EscapeSpecialCharsWithinTagAttributes(text);
	text = _EncodeBackslashEscapes(text);

	// Process anchor and image tags. Images must come first,
	// because ![foo][f] looks like an anchor.
	text = _DoImages(text);
	text = _DoAnchors(text);

	// Make links out of things like `<http://example.com/>`
	// Must come after _DoAnchors(), because you can use < and >
	// delimiters in inline links like [this](<url>).
	text = _DoAutoLinks(text);
	text = _EncodeAmpsAndAngles(text);
	text = _DoItalicsAndBold(text);

	// Do hard breaks:
	text = text.replace(/  +\n/g," <br />\n");

	return text;
}

var _EscapeSpecialCharsWithinTagAttributes = function(text) {
//
// Within tags -- meaning between < and > -- encode [\ ` * _] so they
// don't conflict with their use in Markdown for code, italics and strong.
//

	// Build a regex to find HTML tags and comments.  See Friedl's
	// "Mastering Regular Expressions", 2nd Ed., pp. 200-201.
	var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;

	text = text.replace(regex, function(wholeMatch) {
		var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g,"$1`");
		tag = escapeCharacters(tag,"\\`*_");
		return tag;
	});

	return text;
}

var _DoAnchors = function(text) {
//
// Turn Markdown link shortcuts into XHTML <a> tags.
//
	//
	// First, handle reference-style links: [link text] [id]
	//

	/*
		text = text.replace(/
		(							// wrap whole match in $1
			\[
			(
				(?:
					\[[^\]]*\]		// allow brackets nested one level
					|
					[^\[]			// or anything else
				)*
			)
			\]

			[ ]?					// one optional space
			(?:\n[ ]*)?				// one optional newline followed by spaces

			\[
			(.*?)					// id = $3
			\]
		)()()()()					// pad remaining backreferences
		/g,_DoAnchors_callback);
	*/
	text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeAnchorTag);

	//
	// Next, inline-style links: [link text](url "optional title")
	//

	/*
		text = text.replace(/
			(						// wrap whole match in $1
				\[
				(
					(?:
						\[[^\]]*\]	// allow brackets nested one level
					|
					[^\[\]]			// or anything else
				)
			)
			\]
			\(						// literal paren
			[ \t]*
			()						// no id, so leave $3 empty
			<?(.*?)>?				// href = $4
			[ \t]*
			(						// $5
				(['"])				// quote char = $6
				(.*?)				// Title = $7
				\6					// matching quote
				[ \t]*				// ignore any spaces/tabs between closing quote and )
			)?						// title is optional
			\)
		)
		/g,writeAnchorTag);
	*/
	text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?(?:\(.*?\).*?)?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeAnchorTag);

	//
	// Last, handle reference-style shortcuts: [link text]
	// These must come last in case you've also got [link test][1]
	// or [link test](/foo)
	//

	/*
		text = text.replace(/
		(		 					// wrap whole match in $1
			\[
			([^\[\]]+)				// link text = $2; can't contain '[' or ']'
			\]
		)()()()()()					// pad rest of backreferences
		/g, writeAnchorTag);
	*/
	text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);

	return text;
}

var writeAnchorTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {
	if (m7 == undefined) m7 = "";
	var whole_match = m1;
	var link_text   = m2;
	var link_id	 = m3.toLowerCase();
	var url		= m4;
	var title	= m7;

	if (url == "") {
		if (link_id == "") {
			// lower-case and turn embedded newlines into spaces
			link_id = link_text.toLowerCase().replace(/ ?\n/g," ");
		}
		url = "#"+link_id;

		if (g_urls[link_id] != undefined) {
			url = g_urls[link_id];
			if (g_titles[link_id] != undefined) {
				title = g_titles[link_id];
			}
		}
		else {
			if (whole_match.search(/\(\s*\)$/m)>-1) {
				// Special case for explicit empty url
				url = "";
			} else {
				return whole_match;
			}
		}
	}

	url = escapeCharacters(url,"*_");
	var result = "<a href=\"" + url + "\"";

	if (title != "") {
		title = title.replace(/"/g,"&quot;");
		title = escapeCharacters(title,"*_");
		result +=  " title=\"" + title + "\"";
	}

	result += ">" + link_text + "</a>";

	return result;
}


var _DoImages = function(text) {
//
// Turn Markdown image shortcuts into <img> tags.
//

	//
	// First, handle reference-style labeled images: ![alt text][id]
	//

	/*
		text = text.replace(/
		(						// wrap whole match in $1
			!\[
			(.*?)				// alt text = $2
			\]

			[ ]?				// one optional space
			(?:\n[ ]*)?			// one optional newline followed by spaces

			\[
			(.*?)				// id = $3
			\]
		)()()()()				// pad rest of backreferences
		/g,writeImageTag);
	*/
	text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeImageTag);

	//
	// Next, handle inline images:  ![alt text](url "optional title")
	// Don't forget: encode * and _

	/*
		text = text.replace(/
		(						// wrap whole match in $1
			!\[
			(.*?)				// alt text = $2
			\]
			\s?					// One optional whitespace character
			\(					// literal paren
			[ \t]*
			()					// no id, so leave $3 empty
			<?(\S+?)>?			// src url = $4
			[ \t]*
			(					// $5
				(['"])			// quote char = $6
				(.*?)			// title = $7
				\6				// matching quote
				[ \t]*
			)?					// title is optional
		\)
		)
		/g,writeImageTag);
	*/
	text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeImageTag);

	return text;
}

var writeImageTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {
	var whole_match = m1;
	var alt_text   = m2;
	var link_id	 = m3.toLowerCase();
	var url		= m4;
	var title	= m7;

	if (!title) title = "";

	if (url == "") {
		if (link_id == "") {
			// lower-case and turn embedded newlines into spaces
			link_id = alt_text.toLowerCase().replace(/ ?\n/g," ");
		}
		url = "#"+link_id;

		if (g_urls[link_id] != undefined) {
			url = g_urls[link_id];
			if (g_titles[link_id] != undefined) {
				title = g_titles[link_id];
			}
		}
		else {
			return whole_match;
		}
	}

	alt_text = alt_text.replace(/"/g,"&quot;");
	url = escapeCharacters(url,"*_");
	var result = "<img src=\"" + url + "\" alt=\"" + alt_text + "\"";

	// attacklab: Markdown.pl adds empty title attributes to images.
	// Replicate this bug.

	//if (title != "") {
		title = title.replace(/"/g,"&quot;");
		title = escapeCharacters(title,"*_");
		result +=  " title=\"" + title + "\"";
	//}

	result += " />";

	return result;
}


var _DoHeaders = function(text) {

	// Setext-style headers:
	//	Header 1
	//	========
	//
	//	Header 2
	//	--------
	//
	text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
		function(wholeMatch,m1){return hashBlock('<h1 id="' + headerId(m1) + '">' + _RunSpanGamut(m1) + "</h1>");});

	text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
		function(matchFound,m1){return hashBlock('<h2 id="' + headerId(m1) + '">' + _RunSpanGamut(m1) + "</h2>");});

	// atx-style headers:
	//  # Header 1
	//  ## Header 2
	//  ## Header 2 with closing hashes ##
	//  ...
	//  ###### Header 6
	//

	/*
		text = text.replace(/
			^(\#{1,6})				// $1 = string of #'s
			[ \t]*
			(.+?)					// $2 = Header text
			[ \t]*
			\#*						// optional closing #'s (not counted)
			\n+
		/gm, function() {...});
	*/

	text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,
		function(wholeMatch,m1,m2) {
			var h_level = m1.length;
			return hashBlock("<h" + h_level + ' id="' + headerId(m2) + '">' + _RunSpanGamut(m2) + "</h" + h_level + ">");
		});

	function headerId(m) {
		return m.replace(/[^\w]/g, '').toLowerCase();
	}
	return text;
}

// This declaration keeps Dojo compressor from outputting garbage:
var _ProcessListItems;

var _DoLists = function(text) {
//
// Form HTML ordered (numbered) and unordered (bulleted) lists.
//

	// attacklab: add sentinel to hack around khtml/safari bug:
	// http://bugs.webkit.org/show_bug.cgi?id=11231
	text += "~0";

	// Re-usable pattern to match any entirel ul or ol list:

	/*
		var whole_list = /
		(									// $1 = whole list
			(								// $2
				[ ]{0,3}					// attacklab: g_tab_width - 1
				([*+-]|\d+[.])				// $3 = first list item marker
				[ \t]+
			)
			[^\r]+?
			(								// $4
				~0							// sentinel for workaround; should be $
			|
				\n{2,}
				(?=\S)
				(?!							// Negative lookahead for another list item marker
					[ \t]*
					(?:[*+-]|\d+[.])[ \t]+
				)
			)
		)/g
	*/
	var whole_list = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

	if (g_list_level) {
		text = text.replace(whole_list,function(wholeMatch,m1,m2) {
			var list = m1;
			var list_type = (m2.search(/[*+-]/g)>-1) ? "ul" : "ol";

			// Turn double returns into triple returns, so that we can make a
			// paragraph for the last item in a list, if necessary:
			list = list.replace(/\n{2,}/g,"\n\n\n");;
			var result = _ProcessListItems(list);

			// Trim any trailing whitespace, to put the closing `</$list_type>`
			// up on the preceding line, to get it past the current stupid
			// HTML block parser. This is a hack to work around the terrible
			// hack that is the HTML block parser.
			result = result.replace(/\s+$/,"");
			result = "<"+list_type+">" + result + "</"+list_type+">\n";
			return result;
		});
	} else {
		whole_list = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
		text = text.replace(whole_list,function(wholeMatch,m1,m2,m3) {
			var runup = m1;
			var list = m2;

			var list_type = (m3.search(/[*+-]/g)>-1) ? "ul" : "ol";
			// Turn double returns into triple returns, so that we can make a
			// paragraph for the last item in a list, if necessary:
			var list = list.replace(/\n{2,}/g,"\n\n\n");;
			var result = _ProcessListItems(list);
			result = runup + "<"+list_type+">\n" + result + "</"+list_type+">\n";
			return result;
		});
	}

	// attacklab: strip sentinel
	text = text.replace(/~0/,"");

	return text;
}

_ProcessListItems = function(list_str) {
//
//  Process the contents of a single ordered or unordered list, splitting it
//  into individual list items.
//
	// The $g_list_level global keeps track of when we're inside a list.
	// Each time we enter a list, we increment it; when we leave a list,
	// we decrement. If it's zero, we're not in a list anymore.
	//
	// We do this because when we're not inside a list, we want to treat
	// something like this:
	//
	//    I recommend upgrading to version
	//    8. Oops, now this line is treated
	//    as a sub-list.
	//
	// As a single paragraph, despite the fact that the second line starts
	// with a digit-period-space sequence.
	//
	// Whereas when we're inside a list (or sub-list), that line will be
	// treated as the start of a sub-list. What a kludge, huh? This is
	// an aspect of Markdown's syntax that's hard to parse perfectly
	// without resorting to mind-reading. Perhaps the solution is to
	// change the syntax rules such that sub-lists must start with a
	// starting cardinal number; e.g. "1." or "a.".

	g_list_level++;

	// trim trailing blank lines:
	list_str = list_str.replace(/\n{2,}$/,"\n");

	// attacklab: add sentinel to emulate \z
	list_str += "~0";

	/*
		list_str = list_str.replace(/
			(\n)?							// leading line = $1
			(^[ \t]*)						// leading whitespace = $2
			([*+-]|\d+[.]) [ \t]+			// list marker = $3
			([^\r]+?						// list item text   = $4
			(\n{1,2}))
			(?= \n* (~0 | \2 ([*+-]|\d+[.]) [ \t]+))
		/gm, function(){...});
	*/
	list_str = list_str.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,
		function(wholeMatch,m1,m2,m3,m4){
			var item = m4;
			var leading_line = m1;
			var leading_space = m2;

			if (leading_line || (item.search(/\n{2,}/)>-1)) {
				item = _RunBlockGamut(_Outdent(item));
			}
			else {
				// Recursion for sub-lists:
				item = _DoLists(_Outdent(item));
				item = item.replace(/\n$/,""); // chomp(item)
				item = _RunSpanGamut(item);
			}

			return  "<li>" + item + "</li>\n";
		}
	);

	// attacklab: strip sentinel
	list_str = list_str.replace(/~0/g,"");

	g_list_level--;
	return list_str;
}


var _DoCodeBlocks = function(text) {
//
//  Process Markdown `<pre><code>` blocks.
//

	/*
		text = text.replace(text,
			/(?:\n\n|^)
			(								// $1 = the code block -- one or more lines, starting with a space/tab
				(?:
					(?:[ ]{4}|\t)			// Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width
					.*\n+
				)+
			)
			(\n*[ ]{0,3}[^ \t\n]|(?=~0))	// attacklab: g_tab_width
		/g,function(){...});
	*/

	// attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
	text += "~0";

	text = text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
		function(wholeMatch,m1,m2) {
			var codeblock = m1;
			var nextChar = m2;

			codeblock = _EncodeCode( _Outdent(codeblock));
			codeblock = _Detab(codeblock);
			codeblock = codeblock.replace(/^\n+/g,""); // trim leading newlines
			codeblock = codeblock.replace(/\n+$/g,""); // trim trailing whitespace

			codeblock = "<pre><code>" + codeblock + "\n</code></pre>";

			return hashBlock(codeblock) + nextChar;
		}
	);

	// attacklab: strip sentinel
	text = text.replace(/~0/,"");

	return text;
};

var _DoGithubCodeBlocks = function(text) {
//
//  Process Github-style code blocks
//  Example:
//  ```ruby
//  def hello_world(x)
//    puts "Hello, #{x}"
//  end
//  ```
//


	// attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
	text += "~0";

	text = text.replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g,
		function(wholeMatch,m1,m2) {
			var language = m1;
			var codeblock = m2;

			codeblock = _EncodeCode(codeblock);
			codeblock = _Detab(codeblock);
			codeblock = codeblock.replace(/^\n+/g,""); // trim leading newlines
			codeblock = codeblock.replace(/\n+$/g,""); // trim trailing whitespace

			codeblock = "<pre><code" + (language ? " class=\"" + language + '"' : "") + ">" + codeblock + "\n</code></pre>";

			return hashBlock(codeblock);
		}
	);

	// attacklab: strip sentinel
	text = text.replace(/~0/,"");

	return text;
}

var hashBlock = function(text) {
	text = text.replace(/(^\n+|\n+$)/g,"");
	return "\n\n~K" + (g_html_blocks.push(text)-1) + "K\n\n";
}

var _DoCodeSpans = function(text) {
//
//   *  Backtick quotes are used for <code></code> spans.
//
//   *  You can use multiple backticks as the delimiters if you want to
//	 include literal backticks in the code span. So, this input:
//
//		 Just type ``foo `bar` baz`` at the prompt.
//
//	   Will translate to:
//
//		 <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
//
//	There's no arbitrary limit to the number of backticks you
//	can use as delimters. If you need three consecutive backticks
//	in your code, use four for delimiters, etc.
//
//  *  You can use spaces to get literal backticks at the edges:
//
//		 ... type `` `bar` `` ...
//
//	   Turns to:
//
//		 ... type <code>`bar`</code> ...
//

	/*
		text = text.replace(/
			(^|[^\\])					// Character before opening ` can't be a backslash
			(`+)						// $2 = Opening run of `
			(							// $3 = The code block
				[^\r]*?
				[^`]					// attacklab: work around lack of lookbehind
			)
			\2							// Matching closer
			(?!`)
		/gm, function(){...});
	*/

	text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
		function(wholeMatch,m1,m2,m3,m4) {
			var c = m3;
			c = c.replace(/^([ \t]*)/g,"");	// leading whitespace
			c = c.replace(/[ \t]*$/g,"");	// trailing whitespace
			c = _EncodeCode(c);
			return m1+"<code>"+c+"</code>";
		});

	return text;
}

var _EncodeCode = function(text) {
//
// Encode/escape certain characters inside Markdown code runs.
// The point is that in code, these characters are literals,
// and lose their special Markdown meanings.
//
	// Encode all ampersands; HTML entities are not
	// entities within a Markdown code span.
	text = text.replace(/&/g,"&amp;");

	// Do the angle bracket song and dance:
	text = text.replace(/</g,"&lt;");
	text = text.replace(/>/g,"&gt;");

	// Now, escape characters that are magic in Markdown:
	text = escapeCharacters(text,"\*_{}[]\\",false);

// jj the line above breaks this:
//---

//* Item

//   1. Subitem

//            special char: *
//---

	return text;
}


var _DoItalicsAndBold = function(text) {

	// <strong> must go first:
	text = text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,
		"<strong>$2</strong>");

	text = text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,
		"<em>$2</em>");

	return text;
}


var _DoBlockQuotes = function(text) {

	/*
		text = text.replace(/
		(								// Wrap whole match in $1
			(
				^[ \t]*>[ \t]?			// '>' at the start of a line
				.+\n					// rest of the first line
				(.+\n)*					// subsequent consecutive lines
				\n*						// blanks
			)+
		)
		/gm, function(){...});
	*/

	text = text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,
		function(wholeMatch,m1) {
			var bq = m1;

			// attacklab: hack around Konqueror 3.5.4 bug:
			// "----------bug".replace(/^-/g,"") == "bug"

			bq = bq.replace(/^[ \t]*>[ \t]?/gm,"~0");	// trim one level of quoting

			// attacklab: clean up hack
			bq = bq.replace(/~0/g,"");

			bq = bq.replace(/^[ \t]+$/gm,"");		// trim whitespace-only lines
			bq = _RunBlockGamut(bq);				// recurse

			bq = bq.replace(/(^|\n)/g,"$1  ");
			// These leading spaces screw with <pre> content, so we need to fix that:
			bq = bq.replace(
					/(\s*<pre>[^\r]+?<\/pre>)/gm,
				function(wholeMatch,m1) {
					var pre = m1;
					// attacklab: hack around Konqueror 3.5.4 bug:
					pre = pre.replace(/^  /mg,"~0");
					pre = pre.replace(/~0/g,"");
					return pre;
				});

			return hashBlock("<blockquote>\n" + bq + "\n</blockquote>");
		});
	return text;
}


var _FormParagraphs = function(text) {
//
//  Params:
//    $text - string to process with html <p> tags
//

	// Strip leading and trailing lines:
	text = text.replace(/^\n+/g,"");
	text = text.replace(/\n+$/g,"");

	var grafs = text.split(/\n{2,}/g);
	var grafsOut = [];

	//
	// Wrap <p> tags.
	//
	var end = grafs.length;
	for (var i=0; i<end; i++) {
		var str = grafs[i];

		// if this is an HTML marker, copy it
		if (str.search(/~K(\d+)K/g) >= 0) {
			grafsOut.push(str);
		}
		else if (str.search(/\S/) >= 0) {
			str = _RunSpanGamut(str);
			str = str.replace(/^([ \t]*)/g,"<p>");
			str += "</p>"
			grafsOut.push(str);
		}

	}

	//
	// Unhashify HTML blocks
	//
	end = grafsOut.length;
	for (var i=0; i<end; i++) {
		// if this is a marker for an html block...
		while (grafsOut[i].search(/~K(\d+)K/) >= 0) {
			var blockText = g_html_blocks[RegExp.$1];
			blockText = blockText.replace(/\$/g,"$$$$"); // Escape any dollar signs
			grafsOut[i] = grafsOut[i].replace(/~K\d+K/,blockText);
		}
	}

	return grafsOut.join("\n\n");
}


var _EncodeAmpsAndAngles = function(text) {
// Smart processing for ampersands and angle brackets that need to be encoded.

	// Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
	//   http://bumppo.net/projects/amputator/
	text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;");

	// Encode naked <'s
	text = text.replace(/<(?![a-z\/?\$!])/gi,"&lt;");

	return text;
}


var _EncodeBackslashEscapes = function(text) {
//
//   Parameter:  String.
//   Returns:	The string, with after processing the following backslash
//			   escape sequences.
//

	// attacklab: The polite way to do this is with the new
	// escapeCharacters() function:
	//
	// 	text = escapeCharacters(text,"\\",true);
	// 	text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
	//
	// ...but we're sidestepping its use of the (slow) RegExp constructor
	// as an optimization for Firefox.  This function gets called a LOT.

	text = text.replace(/\\(\\)/g,escapeCharacters_callback);
	text = text.replace(/\\([`*_{}\[\]()>#+-.!])/g,escapeCharacters_callback);
	return text;
}


var _DoAutoLinks = function(text) {

	text = text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,"<a href=\"$1\">$1</a>");

	// Email addresses: <address@domain.foo>

	/*
		text = text.replace(/
			<
			(?:mailto:)?
			(
				[-.\w]+
				\@
				[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+
			)
			>
		/gi, _DoAutoLinks_callback());
	*/
	text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,
		function(wholeMatch,m1) {
			return _EncodeEmailAddress( _UnescapeSpecialChars(m1) );
		}
	);

	return text;
}


var _EncodeEmailAddress = function(addr) {
//
//  Input: an email address, e.g. "foo@example.com"
//
//  Output: the email address as a mailto link, with each character
//	of the address encoded as either a decimal or hex entity, in
//	the hopes of foiling most address harvesting spam bots. E.g.:
//
//	<a href="&#x6D;&#97;&#105;&#108;&#x74;&#111;:&#102;&#111;&#111;&#64;&#101;
//	   x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;">&#102;&#111;&#111;
//	   &#64;&#101;x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;</a>
//
//  Based on a filter by Matthew Wickline, posted to the BBEdit-Talk
//  mailing list: <http://tinyurl.com/yu7ue>
//

	var encode = [
		function(ch){return "&#"+ch.charCodeAt(0)+";";},
		function(ch){return "&#x"+ch.charCodeAt(0).toString(16)+";";},
		function(ch){return ch;}
	];

	addr = "mailto:" + addr;

	addr = addr.replace(/./g, function(ch) {
		if (ch == "@") {
		   	// this *must* be encoded. I insist.
			ch = encode[Math.floor(Math.random()*2)](ch);
		} else if (ch !=":") {
			// leave ':' alone (to spot mailto: later)
			var r = Math.random();
			// roughly 10% raw, 45% hex, 45% dec
			ch =  (
					r > .9  ?	encode[2](ch)   :
					r > .45 ?	encode[1](ch)   :
								encode[0](ch)
				);
		}
		return ch;
	});

	addr = "<a href=\"" + addr + "\">" + addr + "</a>";
	addr = addr.replace(/">.+:/g,"\">"); // strip the mailto: from the visible part

	return addr;
}


var _UnescapeSpecialChars = function(text) {
//
// Swap back in all the special characters we've hidden.
//
	text = text.replace(/~E(\d+)E/g,
		function(wholeMatch,m1) {
			var charCodeToReplace = parseInt(m1);
			return String.fromCharCode(charCodeToReplace);
		}
	);
	return text;
}


var _Outdent = function(text) {
//
// Remove one level of line-leading tabs or spaces
//

	// attacklab: hack around Konqueror 3.5.4 bug:
	// "----------bug".replace(/^-/g,"") == "bug"

	text = text.replace(/^(\t|[ ]{1,4})/gm,"~0"); // attacklab: g_tab_width

	// attacklab: clean up hack
	text = text.replace(/~0/g,"")

	return text;
}

var _Detab = function(text) {
// attacklab: Detab's completely rewritten for speed.
// In perl we could fix it by anchoring the regexp with \G.
// In javascript we're less fortunate.

	// expand first n-1 tabs
	text = text.replace(/\t(?=\t)/g,"    "); // attacklab: g_tab_width

	// replace the nth with two sentinels
	text = text.replace(/\t/g,"~A~B");

	// use the sentinel to anchor our regex so it doesn't explode
	text = text.replace(/~B(.+?)~A/g,
		function(wholeMatch,m1,m2) {
			var leadingText = m1;
			var numSpaces = 4 - leadingText.length % 4;  // attacklab: g_tab_width

			// there *must* be a better way to do this:
			for (var i=0; i<numSpaces; i++) leadingText+=" ";

			return leadingText;
		}
	);

	// clean up sentinels
	text = text.replace(/~A/g,"    ");  // attacklab: g_tab_width
	text = text.replace(/~B/g,"");

	return text;
}


//
//  attacklab: Utility functions
//


var escapeCharacters = function(text, charsToEscape, afterBackslash) {
	// First we have to escape the escape characters so that
	// we can build a character class out of them
	var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g,"\\$1") + "])";

	if (afterBackslash) {
		regexString = "\\\\" + regexString;
	}

	var regex = new RegExp(regexString,"g");
	text = text.replace(regex,escapeCharacters_callback);

	return text;
}


var escapeCharacters_callback = function(wholeMatch,m1) {
	var charCodeToEscape = m1.charCodeAt(0);
	return "~E"+charCodeToEscape+"E";
}

} // end of Showdown.converter


; browserify_shim__define__module__export__(typeof Showdown != "undefined" ? Showdown : window.Showdown);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../vendor/showdown_for_browserify.js","/../../vendor")
},{"buffer":3,"rH1JPG":6}]},{},[7])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Wb2x1bWVzL1Byb2plY3RzL3dlYmdtZS9pc2lzLXVpLWNvbXBvbmVudHMvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1ZvbHVtZXMvUHJvamVjdHMvd2ViZ21lL2lzaXMtdWktY29tcG9uZW50cy9ub2RlX21vZHVsZXMvYW5ndWxhci1tYXJrZG93bi1kaXJlY3RpdmUvbWFya2Rvd24uanMiLCIvVm9sdW1lcy9Qcm9qZWN0cy93ZWJnbWUvaXNpcy11aS1jb21wb25lbnRzL25vZGVfbW9kdWxlcy9hbmd1bGFyLXNhbml0aXplL2FuZ3VsYXItc2FuaXRpemUubWluLmpzIiwiL1ZvbHVtZXMvUHJvamVjdHMvd2ViZ21lL2lzaXMtdWktY29tcG9uZW50cy9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCIvVm9sdW1lcy9Qcm9qZWN0cy93ZWJnbWUvaXNpcy11aS1jb21wb25lbnRzL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCIvVm9sdW1lcy9Qcm9qZWN0cy93ZWJnbWUvaXNpcy11aS1jb21wb25lbnRzL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9Wb2x1bWVzL1Byb2plY3RzL3dlYmdtZS9pc2lzLXVpLWNvbXBvbmVudHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Wb2x1bWVzL1Byb2plY3RzL3dlYmdtZS9pc2lzLXVpLWNvbXBvbmVudHMvc3JjL2RvY3MvZG9jc19hcHAuanMiLCIvVm9sdW1lcy9Qcm9qZWN0cy93ZWJnbWUvaXNpcy11aS1jb21wb25lbnRzL3NyYy9saWJyYXJ5L2NvbnRleHRtZW51L2RvY3MvZGVtby5qcyIsIi9Wb2x1bWVzL1Byb2plY3RzL3dlYmdtZS9pc2lzLXVpLWNvbXBvbmVudHMvc3JjL2xpYnJhcnkvZHJvcGRvd25OYXZpZ2F0b3IvZG9jcy9kZW1vLmpzIiwiL1ZvbHVtZXMvUHJvamVjdHMvd2ViZ21lL2lzaXMtdWktY29tcG9uZW50cy9zcmMvbGlicmFyeS9oaWVyYXJjaGljYWxNZW51L2RvY3MvZGVtby5qcyIsIi9Wb2x1bWVzL1Byb2plY3RzL3dlYmdtZS9pc2lzLXVpLWNvbXBvbmVudHMvc3JjL2xpYnJhcnkvaXRlbUxpc3QvZG9jcy9kZW1vLmpzIiwiL1ZvbHVtZXMvUHJvamVjdHMvd2ViZ21lL2lzaXMtdWktY29tcG9uZW50cy9zcmMvbGlicmFyeS9zZWFyY2hCb3gvZG9jcy9kZW1vLmpzIiwiL1ZvbHVtZXMvUHJvamVjdHMvd2ViZ21lL2lzaXMtdWktY29tcG9uZW50cy9zcmMvbGlicmFyeS9zaW1wbGVEaWFsb2cvZG9jcy9kZW1vLmpzIiwiL1ZvbHVtZXMvUHJvamVjdHMvd2ViZ21lL2lzaXMtdWktY29tcG9uZW50cy9zcmMvbGlicmFyeS90cmVlTmF2aWdhdG9yL2RvY3MvZGVtby5qcyIsIi9Wb2x1bWVzL1Byb2plY3RzL3dlYmdtZS9pc2lzLXVpLWNvbXBvbmVudHMvdmVuZG9yL3Nob3dkb3duX2Zvcl9icm93c2VyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qXG4gKiBhbmd1bGFyLW1hcmtkb3duLWRpcmVjdGl2ZSB2MC4zLjBcbiAqIChjKSAyMDEzLTIwMTQgQnJpYW4gRm9yZCBodHRwOi8vYnJpYW50Zm9yZC5jb21cbiAqIExpY2Vuc2U6IE1JVFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2J0Zm9yZC5tYXJrZG93bicsIFsnbmdTYW5pdGl6ZSddKS5cbiAgcHJvdmlkZXIoJ21hcmtkb3duQ29udmVydGVyJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRzID0ge307XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbmZpZzogZnVuY3Rpb24gKG5ld09wdHMpIHtcbiAgICAgICAgb3B0cyA9IG5ld09wdHM7XG4gICAgICB9LFxuICAgICAgJGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFNob3dkb3duLmNvbnZlcnRlcihvcHRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KS5cbiAgZGlyZWN0aXZlKCdidGZNYXJrZG93bicsIGZ1bmN0aW9uICgkc2FuaXRpemUsIG1hcmtkb3duQ29udmVydGVyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICBpZiAoYXR0cnMuYnRmTWFya2Rvd24pIHtcbiAgICAgICAgICBzY29wZS4kd2F0Y2goYXR0cnMuYnRmTWFya2Rvd24sIGZ1bmN0aW9uIChuZXdWYWwpIHtcbiAgICAgICAgICAgIHZhciBodG1sID0gbmV3VmFsID8gJHNhbml0aXplKG1hcmtkb3duQ29udmVydGVyLm1ha2VIdG1sKG5ld1ZhbCkpIDogJyc7XG4gICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGh0bWwgPSAkc2FuaXRpemUobWFya2Rvd25Db252ZXJ0ZXIubWFrZUh0bWwoZWxlbWVudC50ZXh0KCkpKTtcbiAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9KTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvYW5ndWxhci1tYXJrZG93bi1kaXJlY3RpdmUvbWFya2Rvd24uanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvYW5ndWxhci1tYXJrZG93bi1kaXJlY3RpdmVcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKlxuIEFuZ3VsYXJKUyB2MS4yLjEwXG4gKGMpIDIwMTAtMjAxNCBHb29nbGUsIEluYy4gaHR0cDovL2FuZ3VsYXJqcy5vcmdcbiBMaWNlbnNlOiBNSVRcbiovXG4oZnVuY3Rpb24ocCxoLHEpeyd1c2Ugc3RyaWN0JztmdW5jdGlvbiBFKGEpe3ZhciBlPVtdO3MoZSxoLm5vb3ApLmNoYXJzKGEpO3JldHVybiBlLmpvaW4oXCJcIil9ZnVuY3Rpb24gayhhKXt2YXIgZT17fTthPWEuc3BsaXQoXCIsXCIpO3ZhciBkO2ZvcihkPTA7ZDxhLmxlbmd0aDtkKyspZVthW2RdXT0hMDtyZXR1cm4gZX1mdW5jdGlvbiBGKGEsZSl7ZnVuY3Rpb24gZChhLGIsZCxnKXtiPWgubG93ZXJjYXNlKGIpO2lmKHRbYl0pZm9yKDtmLmxhc3QoKSYmdVtmLmxhc3QoKV07KWMoXCJcIixmLmxhc3QoKSk7dltiXSYmZi5sYXN0KCk9PWImJmMoXCJcIixiKTsoZz13W2JdfHwhIWcpfHxmLnB1c2goYik7dmFyIGw9e307ZC5yZXBsYWNlKEcsZnVuY3Rpb24oYSxiLGUsYyxkKXtsW2JdPXIoZXx8Y3x8ZHx8XCJcIil9KTtlLnN0YXJ0JiZlLnN0YXJ0KGIsbCxnKX1mdW5jdGlvbiBjKGEsYil7dmFyIGM9MCxkO2lmKGI9aC5sb3dlcmNhc2UoYikpZm9yKGM9Zi5sZW5ndGgtMTswPD1jJiZmW2NdIT1iO2MtLSk7XG5pZigwPD1jKXtmb3IoZD1mLmxlbmd0aC0xO2Q+PWM7ZC0tKWUuZW5kJiZlLmVuZChmW2RdKTtmLmxlbmd0aD1jfX12YXIgYixnLGY9W10sbD1hO2ZvcihmLmxhc3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZltmLmxlbmd0aC0xXX07YTspe2c9ITA7aWYoZi5sYXN0KCkmJnhbZi5sYXN0KCldKWE9YS5yZXBsYWNlKFJlZ0V4cChcIiguKik8XFxcXHMqXFxcXC9cXFxccypcIitmLmxhc3QoKStcIltePl0qPlwiLFwiaVwiKSxmdW5jdGlvbihiLGEpe2E9YS5yZXBsYWNlKEgsXCIkMVwiKS5yZXBsYWNlKEksXCIkMVwiKTtlLmNoYXJzJiZlLmNoYXJzKHIoYSkpO3JldHVyblwiXCJ9KSxjKFwiXCIsZi5sYXN0KCkpO2Vsc2V7aWYoMD09PWEuaW5kZXhPZihcIlxceDNjIS0tXCIpKWI9YS5pbmRleE9mKFwiLS1cIiw0KSwwPD1iJiZhLmxhc3RJbmRleE9mKFwiLS1cXHgzZVwiLGIpPT09YiYmKGUuY29tbWVudCYmZS5jb21tZW50KGEuc3Vic3RyaW5nKDQsYikpLGE9YS5zdWJzdHJpbmcoYiszKSxnPSExKTtlbHNlIGlmKHkudGVzdChhKSl7aWYoYj1hLm1hdGNoKHkpKWE9XG5hLnJlcGxhY2UoYlswXSxcIlwiKSxnPSExfWVsc2UgaWYoSi50ZXN0KGEpKXtpZihiPWEubWF0Y2goeikpYT1hLnN1YnN0cmluZyhiWzBdLmxlbmd0aCksYlswXS5yZXBsYWNlKHosYyksZz0hMX1lbHNlIEsudGVzdChhKSYmKGI9YS5tYXRjaChBKSkmJihhPWEuc3Vic3RyaW5nKGJbMF0ubGVuZ3RoKSxiWzBdLnJlcGxhY2UoQSxkKSxnPSExKTtnJiYoYj1hLmluZGV4T2YoXCI8XCIpLGc9MD5iP2E6YS5zdWJzdHJpbmcoMCxiKSxhPTA+Yj9cIlwiOmEuc3Vic3RyaW5nKGIpLGUuY2hhcnMmJmUuY2hhcnMocihnKSkpfWlmKGE9PWwpdGhyb3cgTChcImJhZHBhcnNlXCIsYSk7bD1hfWMoKX1mdW5jdGlvbiByKGEpe2lmKCFhKXJldHVyblwiXCI7dmFyIGU9TS5leGVjKGEpO2E9ZVsxXTt2YXIgZD1lWzNdO2lmKGU9ZVsyXSluLmlubmVySFRNTD1lLnJlcGxhY2UoLzwvZyxcIiZsdDtcIiksZT1cInRleHRDb250ZW50XCJpbiBuP24udGV4dENvbnRlbnQ6bi5pbm5lclRleHQ7cmV0dXJuIGErZStkfWZ1bmN0aW9uIEIoYSl7cmV0dXJuIGEucmVwbGFjZSgvJi9nLFxuXCImYW1wO1wiKS5yZXBsYWNlKE4sZnVuY3Rpb24oYSl7cmV0dXJuXCImI1wiK2EuY2hhckNvZGVBdCgwKStcIjtcIn0pLnJlcGxhY2UoLzwvZyxcIiZsdDtcIikucmVwbGFjZSgvPi9nLFwiJmd0O1wiKX1mdW5jdGlvbiBzKGEsZSl7dmFyIGQ9ITEsYz1oLmJpbmQoYSxhLnB1c2gpO3JldHVybntzdGFydDpmdW5jdGlvbihhLGcsZil7YT1oLmxvd2VyY2FzZShhKTshZCYmeFthXSYmKGQ9YSk7ZHx8ITAhPT1DW2FdfHwoYyhcIjxcIiksYyhhKSxoLmZvckVhY2goZyxmdW5jdGlvbihkLGYpe3ZhciBnPWgubG93ZXJjYXNlKGYpLGs9XCJpbWdcIj09PWEmJlwic3JjXCI9PT1nfHxcImJhY2tncm91bmRcIj09PWc7ITAhPT1PW2ddfHwhMD09PURbZ10mJiFlKGQsayl8fChjKFwiIFwiKSxjKGYpLGMoJz1cIicpLGMoQihkKSksYygnXCInKSl9KSxjKGY/XCIvPlwiOlwiPlwiKSl9LGVuZDpmdW5jdGlvbihhKXthPWgubG93ZXJjYXNlKGEpO2R8fCEwIT09Q1thXXx8KGMoXCI8L1wiKSxjKGEpLGMoXCI+XCIpKTthPT1kJiYoZD0hMSl9LGNoYXJzOmZ1bmN0aW9uKGEpe2R8fFxuYyhCKGEpKX19fXZhciBMPWguJCRtaW5FcnIoXCIkc2FuaXRpemVcIiksQT0vXjxcXHMqKFtcXHc6LV0rKSgoPzpcXHMrW1xcdzotXSsoPzpcXHMqPVxccyooPzooPzpcIlteXCJdKlwiKXwoPzonW14nXSonKXxbXj5cXHNdKykpPykqKVxccyooXFwvPylcXHMqPi8sej0vXjxcXHMqXFwvXFxzKihbXFx3Oi1dKylbXj5dKj4vLEc9LyhbXFx3Oi1dKykoPzpcXHMqPVxccyooPzooPzpcIigoPzpbXlwiXSkqKVwiKXwoPzonKCg/OlteJ10pKiknKXwoW14+XFxzXSspKSk/L2csSz0vXjwvLEo9L148XFxzKlxcLy8sSD0vXFx4M2MhLS0oLio/KS0tXFx4M2UvZyx5PS88IURPQ1RZUEUoW14+XSo/KT4vaSxJPS88IVxcW0NEQVRBXFxbKC4qPyldXVxceDNlL2csTj0vKFteXFwjLX58IHwhXSkvZyx3PWsoXCJhcmVhLGJyLGNvbCxocixpbWcsd2JyXCIpO3A9ayhcImNvbGdyb3VwLGRkLGR0LGxpLHAsdGJvZHksdGQsdGZvb3QsdGgsdGhlYWQsdHJcIik7cT1rKFwicnAscnRcIik7dmFyIHY9aC5leHRlbmQoe30scSxwKSx0PWguZXh0ZW5kKHt9LHAsayhcImFkZHJlc3MsYXJ0aWNsZSxhc2lkZSxibG9ja3F1b3RlLGNhcHRpb24sY2VudGVyLGRlbCxkaXIsZGl2LGRsLGZpZ3VyZSxmaWdjYXB0aW9uLGZvb3RlcixoMSxoMixoMyxoNCxoNSxoNixoZWFkZXIsaGdyb3VwLGhyLGlucyxtYXAsbWVudSxuYXYsb2wscHJlLHNjcmlwdCxzZWN0aW9uLHRhYmxlLHVsXCIpKSxcbnU9aC5leHRlbmQoe30scSxrKFwiYSxhYmJyLGFjcm9ueW0sYixiZGksYmRvLGJpZyxicixjaXRlLGNvZGUsZGVsLGRmbixlbSxmb250LGksaW1nLGlucyxrYmQsbGFiZWwsbWFwLG1hcmsscSxydWJ5LHJwLHJ0LHMsc2FtcCxzbWFsbCxzcGFuLHN0cmlrZSxzdHJvbmcsc3ViLHN1cCx0aW1lLHR0LHUsdmFyXCIpKSx4PWsoXCJzY3JpcHQsc3R5bGVcIiksQz1oLmV4dGVuZCh7fSx3LHQsdSx2KSxEPWsoXCJiYWNrZ3JvdW5kLGNpdGUsaHJlZixsb25nZGVzYyxzcmMsdXNlbWFwXCIpLE89aC5leHRlbmQoe30sRCxrKFwiYWJicixhbGlnbixhbHQsYXhpcyxiZ2NvbG9yLGJvcmRlcixjZWxscGFkZGluZyxjZWxsc3BhY2luZyxjbGFzcyxjbGVhcixjb2xvcixjb2xzLGNvbHNwYW4sY29tcGFjdCxjb29yZHMsZGlyLGZhY2UsaGVhZGVycyxoZWlnaHQsaHJlZmxhbmcsaHNwYWNlLGlzbWFwLGxhbmcsbGFuZ3VhZ2Usbm9ocmVmLG5vd3JhcCxyZWwscmV2LHJvd3Mscm93c3BhbixydWxlcyxzY29wZSxzY3JvbGxpbmcsc2hhcGUsc2l6ZSxzcGFuLHN0YXJ0LHN1bW1hcnksdGFyZ2V0LHRpdGxlLHR5cGUsdmFsaWduLHZhbHVlLHZzcGFjZSx3aWR0aFwiKSksXG5uPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwcmVcIiksTT0vXihcXHMqKShbXFxzXFxTXSo/KShcXHMqKSQvO2gubW9kdWxlKFwibmdTYW5pdGl6ZVwiLFtdKS5wcm92aWRlcihcIiRzYW5pdGl6ZVwiLGZ1bmN0aW9uKCl7dGhpcy4kZ2V0PVtcIiQkc2FuaXRpemVVcmlcIixmdW5jdGlvbihhKXtyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIGQ9W107RihlLHMoZCxmdW5jdGlvbihjLGIpe3JldHVybiEvXnVuc2FmZS8udGVzdChhKGMsYikpfSkpO3JldHVybiBkLmpvaW4oXCJcIil9fV19KTtoLm1vZHVsZShcIm5nU2FuaXRpemVcIikuZmlsdGVyKFwibGlua3lcIixbXCIkc2FuaXRpemVcIixmdW5jdGlvbihhKXt2YXIgZT0vKChmdHB8aHR0cHM/KTpcXC9cXC98KG1haWx0bzopP1tBLVphLXowLTkuXyUrLV0rQClcXFMqW15cXHMuOywoKXt9PD5dLyxkPS9ebWFpbHRvOi87cmV0dXJuIGZ1bmN0aW9uKGMsYil7ZnVuY3Rpb24gZyhhKXthJiZtLnB1c2goRShhKSl9ZnVuY3Rpb24gZihhLGMpe20ucHVzaChcIjxhIFwiKTtoLmlzRGVmaW5lZChiKSYmXG4obS5wdXNoKCd0YXJnZXQ9XCInKSxtLnB1c2goYiksbS5wdXNoKCdcIiAnKSk7bS5wdXNoKCdocmVmPVwiJyk7bS5wdXNoKGEpO20ucHVzaCgnXCI+Jyk7ZyhjKTttLnB1c2goXCI8L2E+XCIpfWlmKCFjKXJldHVybiBjO2Zvcih2YXIgbCxrPWMsbT1bXSxuLHA7bD1rLm1hdGNoKGUpOyluPWxbMF0sbFsyXT09bFszXSYmKG49XCJtYWlsdG86XCIrbikscD1sLmluZGV4LGcoay5zdWJzdHIoMCxwKSksZihuLGxbMF0ucmVwbGFjZShkLFwiXCIpKSxrPWsuc3Vic3RyaW5nKHArbFswXS5sZW5ndGgpO2coayk7cmV0dXJuIGEobS5qb2luKFwiXCIpKX19XSl9KSh3aW5kb3csd2luZG93LmFuZ3VsYXIpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YW5ndWxhci1zYW5pdGl6ZS5taW4uanMubWFwXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2FuZ3VsYXItc2FuaXRpemUvYW5ndWxhci1zYW5pdGl6ZS5taW4uanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvYW5ndWxhci1zYW5pdGl6ZVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblxuXHRmdW5jdGlvbiBkZWNvZGUgKGVsdCkge1xuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcblx0XHRpZiAoY29kZSA9PT0gUExVUylcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0gpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24oYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBuQml0cyA9IC03LFxuICAgICAgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwLFxuICAgICAgZCA9IGlzTEUgPyAtMSA6IDEsXG4gICAgICBzID0gYnVmZmVyW29mZnNldCArIGldO1xuXG4gIGkgKz0gZDtcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgcyA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IGVMZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBlID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gbUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzO1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICBlID0gZSAtIGVCaWFzO1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pO1xufTtcblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKSxcbiAgICAgIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKSxcbiAgICAgIGQgPSBpc0xFID8gMSA6IC0xLFxuICAgICAgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMDtcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKTtcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMDtcbiAgICBlID0gZU1heDtcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMik7XG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tO1xuICAgICAgYyAqPSAyO1xuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gYztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrKztcbiAgICAgIGMgLz0gMjtcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwO1xuICAgICAgZSA9IGVNYXg7XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IGUgKyBlQmlhcztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IDA7XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCk7XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbTtcbiAgZUxlbiArPSBtTGVuO1xuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpO1xuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyODtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLypnbG9iYWxzIGFuZ3VsYXIsIHJlcXVpcmUqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tcG9uZW50cyA9IFtcbiAgJ3NlYXJjaEJveCcsXG4gICdpdGVtTGlzdCcsXG4gICdzaW1wbGVEaWFsb2cnLFxuICAnaGllcmFyY2hpY2FsTWVudScsXG4gICdjb250ZXh0bWVudScsXG4gICdkcm9wZG93bk5hdmlnYXRvcicsXG4gICd0cmVlTmF2aWdhdG9yJ1xuXTtcblxucmVxdWlyZSggJy4uL2xpYnJhcnkvc2ltcGxlRGlhbG9nL2RvY3MvZGVtby5qcycgKTtcbnJlcXVpcmUoICcuLi9saWJyYXJ5L2hpZXJhcmNoaWNhbE1lbnUvZG9jcy9kZW1vLmpzJyApO1xucmVxdWlyZSggJy4uL2xpYnJhcnkvY29udGV4dG1lbnUvZG9jcy9kZW1vLmpzJyApO1xucmVxdWlyZSggJy4uL2xpYnJhcnkvZHJvcGRvd25OYXZpZ2F0b3IvZG9jcy9kZW1vLmpzJyApO1xucmVxdWlyZSggJy4uL2xpYnJhcnkvdHJlZU5hdmlnYXRvci9kb2NzL2RlbW8uanMnICk7XG5yZXF1aXJlKCAnLi4vbGlicmFyeS9pdGVtTGlzdC9kb2NzL2RlbW8uanMnICk7XG5yZXF1aXJlKCAnLi4vbGlicmFyeS9zZWFyY2hCb3gvZG9jcy9kZW1vLmpzJyApO1xuXG5yZXF1aXJlKCAnYW5ndWxhci1zYW5pdGl6ZScgKTtcbndpbmRvdy5TaG93ZG93biA9IHJlcXVpcmUoICdzaG93ZG93bicgKTtcbnJlcXVpcmUoICdhbmd1bGFyLW1hcmtkb3duLWRpcmVjdGl2ZScgKTtcblxuXG52YXIgZGVtb0FwcCA9IGFuZ3VsYXIubW9kdWxlKFxuICAnaXNpcy51aS5kZW1vQXBwJywgW1xuICAgICdpc2lzLnVpLmRlbW9BcHAudGVtcGxhdGVzJyxcbiAgICAnYnRmb3JkLm1hcmtkb3duJ1xuICBdLmNvbmNhdCggY29tcG9uZW50cy5tYXAoIGZ1bmN0aW9uICggZSApIHtcbiAgICByZXR1cm4gJ2lzaXMudWkuJyArIGUgKyAnLmRlbW8nO1xuICB9ICkgKVxuKTtcblxuZGVtb0FwcC5ydW4oIGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coICdEZW1vQXBwIHJ1bi4uLicgKTtcbn0gKTtcblxuZGVtb0FwcC5jb250cm9sbGVyKFxuICAnVUlDb21wb25lbnRzRGVtb0NvbnRyb2xsZXInLFxuICBmdW5jdGlvbiAoICRzY29wZSApIHtcblxuICAgICRzY29wZS5jb21wb25lbnRzID0gY29tcG9uZW50cy5tYXAoIGZ1bmN0aW9uICggY29tcG9uZW50ICkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogY29tcG9uZW50LFxuICAgICAgICB0ZW1wbGF0ZTogJy9saWJyYXJ5LycgKyBjb21wb25lbnQgKyAnL2RvY3MvZGVtby5odG1sJyxcbiAgICAgICAgZG9jczogJy9saWJyYXJ5LycgKyBjb21wb25lbnQgKyAnL2RvY3MvcmVhZG1lLm1kJ1xuICAgICAgfTtcbiAgICB9ICk7XG5cbiAgfSApO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9kb2NzX2FwcC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qZ2xvYmFscyBjb25zb2xlLCBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVtb0FwcCA9IGFuZ3VsYXIubW9kdWxlKCAnaXNpcy51aS5jb250ZXh0bWVudS5kZW1vJywgWyAnaXNpcy51aS5jb250ZXh0bWVudScgXSApO1xuXG5kZW1vQXBwLmNvbnRyb2xsZXIoICdDb250ZXh0bWVudUN1c3RvbVRlbXBsYXRlQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCBjb250ZXh0bWVudVNlcnZpY2UgKSB7XG4gICRzY29wZS5wYXJhbWV0ZXIgPSB7fTtcblxuICAkc2NvcGUuY2xvc2VDbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZyggJ2Nsb3NpbmcgdGhpcyBtYW51YWxseScgKTtcbiAgICBjb250ZXh0bWVudVNlcnZpY2UuY2xvc2UoKTtcbiAgfTtcblxuICAkc2NvcGUuaXNWYWxpZCA9IGZ1bmN0aW9uICggbnVtICkge1xuICAgIGNvbnNvbGUubG9nKCAnV2hvIGtub3dzIGlmIGlzIHZhbGlkPycsIG51bSApO1xuXG4gICAgaWYgKCBwYXJzZUludChudW0sIDEwKSA9PT0gNCApIHtcbiAgICAgICRzY29wZS5wYXJhbWV0ZXIuaW52YWxpZCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucGFyYW1ldGVyLmludmFsaWQgPSB0cnVlO1xuICAgIH1cbiAgfTtcblxufSk7XG5cbmRlbW9BcHAuY29udHJvbGxlciggJ0NvbnRleHRtZW51RGVtb0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcblxuICB2YXIgbWVudURhdGEgPSBbXG4gICAge1xuICAgICAgaWQ6ICd0b3AnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiAnbmV3UHJvamVjdCcsXG4gICAgICAgICAgbGFiZWw6ICdOZXcgcHJvamVjdCAuLi4nLFxuICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGx1cycsXG4gICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggJ05ldyBwcm9qZWN0IGNsaWNrZWQnICk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhY3Rpb25EYXRhOiB7fVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6ICdpbXBvcnRQcm9qZWN0JyxcbiAgICAgICAgICBsYWJlbDogJ0ltcG9ydCBwcm9qZWN0IC4uLicsXG4gICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1pbXBvcnQnLFxuICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coICdJbXBvcnQgcHJvamVjdCBjbGlja2VkJyApO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYWN0aW9uRGF0YToge31cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdwcm9qZWN0cycsXG4gICAgICBsYWJlbDogJ1JlY2VudCBwcm9qZWN0cycsXG4gICAgICB0b3RhbEl0ZW1zOiAyMCxcbiAgICAgIGl0ZW1zOiBbXSxcbiAgICAgIHNob3dBbGxJdGVtczogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ1JlY2VudCBwcm9qZWN0cyBjbGlja2VkJyApO1xuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdwcmVmZXJlbmNlcycsXG4gICAgICBsYWJlbDogJ3ByZWZlcmVuY2VzJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogJ3Nob3dQcmVmZXJlbmNlcycsXG4gICAgICAgICAgbGFiZWw6ICdTaG93IHByZWZlcmVuY2VzJyxcbiAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnU2hvdyBwcmVmZXJlbmNlcycgKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1lbnU6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBpZDogJ3ByZWZlcmVuY2VzIDEnLFxuICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQcmVmZXJlbmNlcyAxJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdwcmVmZXJlbmNlcyAyJyxcbiAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUHJlZmVyZW5jZXMgMidcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAncHJlZmVyZW5jZXMgMycsXG4gICAgICAgICAgICAgICAgICBsYWJlbDogJ1ByZWZlcmVuY2VzIDMnLFxuICAgICAgICAgICAgICAgICAgbWVudTogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdzdWJfcHJlZmVyZW5jZXMgMScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU3ViIHByZWZlcmVuY2VzIDEnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ3N1Yl9wcmVmZXJlbmNlcyAyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdWIgcHJlZmVyZW5jZXMgMidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF07XG5cbiAgJHNjb3BlLm1lbnVDb25maWcxID0ge1xuICAgIHRyaWdnZXJFdmVudDogJ2NsaWNrJyxcbiAgICBwb3NpdGlvbjogJ3JpZ2h0IGJvdHRvbSdcbiAgfTtcblxuICAkc2NvcGUubWVudUNvbmZpZzIgPSB7XG4gICAgdHJpZ2dlckV2ZW50OiAnbW91c2VvdmVyJyxcbiAgICBwb3NpdGlvbjogJ2xlZnQgYm90dG9tJyxcbiAgICBjb250ZW50VGVtcGxhdGVVcmw6ICdjb250ZXh0bWVudS1jdXN0b20tY29udGVudC5odG1sJyxcbiAgICBkb05vdEF1dG9DbG9zZTogdHJ1ZVxuICB9O1xuXG4gICRzY29wZS5tZW51RGF0YSA9IG1lbnVEYXRhO1xuXG4gICRzY29wZS5wcmVDb250ZXh0TWVudSA9IGZ1bmN0aW9uICggZSApIHtcbiAgICBjb25zb2xlLmxvZyggJ0luIHByZUNvbnRleHRNZW51ICcsIGUgKTtcbiAgfTtcblxuXG59ICk7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2xpYnJhcnkvY29udGV4dG1lbnUvZG9jcy9kZW1vLmpzXCIsXCIvLi4vbGlicmFyeS9jb250ZXh0bWVudS9kb2NzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLypnbG9iYWxzIGNvbnNvbGUsIGFuZ3VsYXIqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVtb0FwcCA9IGFuZ3VsYXIubW9kdWxlKCAnaXNpcy51aS5kcm9wZG93bk5hdmlnYXRvci5kZW1vJywgWyAnaXNpcy51aS5kcm9wZG93bk5hdmlnYXRvcicgXSApO1xuXG5kZW1vQXBwLmNvbnRyb2xsZXIoICdEcm9wZG93bkRlbW9Db250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUgKSB7XG4gIHZhciBmaXJzdE1lbnUsXG4gICAgc2Vjb25kTWVudTtcblxuICBmaXJzdE1lbnUgPSB7XG4gICAgaWQ6ICdyb290JyxcbiAgICBsYWJlbDogJ0dNRScsXG4gICAgLy8gICAgICAgICAgICBpc1NlbGVjdGVkOiB0cnVlLFxuICAgIGl0ZW1DbGFzczogJ2dtZS1yb290JyxcbiAgICBtZW51OiBbXVxuICB9O1xuXG4gIHNlY29uZE1lbnUgPSB7XG4gICAgaWQ6ICdzZWNvbmRJdGVtJyxcbiAgICBsYWJlbDogJ1Byb2plY3RzJyxcbiAgICBtZW51OiBbXVxuICB9O1xuXG4gIGZpcnN0TWVudS5tZW51ID0gWyB7XG4gICAgaWQ6ICd0b3AnLFxuICAgIGl0ZW1zOiBbIHtcbiAgICAgIGlkOiAnbmV3UHJvamVjdCcsXG4gICAgICBsYWJlbDogJ05ldyBwcm9qZWN0IC4uLicsXG4gICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBsdXMnLFxuICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnTmV3IHByb2plY3QgY2xpY2tlZCcgKTtcbiAgICAgIH0sXG4gICAgICBhY3Rpb25EYXRhOiB7fVxuICAgIH0sIHtcbiAgICAgIGlkOiAnaW1wb3J0UHJvamVjdCcsXG4gICAgICBsYWJlbDogJ0ltcG9ydCBwcm9qZWN0IC4uLicsXG4gICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWltcG9ydCcsXG4gICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coICdJbXBvcnQgcHJvamVjdCBjbGlja2VkJyApO1xuICAgICAgfSxcbiAgICAgIGFjdGlvbkRhdGE6IHt9XG4gICAgfSBdXG4gIH0sIHtcbiAgICBpZDogJ3Byb2plY3RzJyxcbiAgICBsYWJlbDogJ1JlY2VudCBwcm9qZWN0cycsXG4gICAgdG90YWxJdGVtczogMjAsXG4gICAgaXRlbXM6IFtdLFxuICAgIHNob3dBbGxJdGVtczogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coICdSZWNlbnQgcHJvamVjdHMgY2xpY2tlZCcgKTtcbiAgICB9XG4gIH0sIHtcbiAgICBpZDogJ3ByZWZlcmVuY2VzJyxcbiAgICBsYWJlbDogJ3ByZWZlcmVuY2VzJyxcbiAgICBpdGVtczogWyB7XG4gICAgICBpZDogJ3Nob3dQcmVmZXJlbmNlcycsXG4gICAgICBsYWJlbDogJ1Nob3cgcHJlZmVyZW5jZXMnLFxuICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnU2hvdyBwcmVmZXJlbmNlcycgKTtcbiAgICAgIH0sXG4gICAgICBtZW51OiBbIHtcbiAgICAgICAgaXRlbXM6IFsge1xuICAgICAgICAgIGlkOiAncHJlZmVyZW5jZXMgMScsXG4gICAgICAgICAgbGFiZWw6ICdQcmVmZXJlbmNlcyAxJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgaWQ6ICdwcmVmZXJlbmNlcyAyJyxcbiAgICAgICAgICBsYWJlbDogJ1ByZWZlcmVuY2VzIDInXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBpZDogJ3ByZWZlcmVuY2VzIDMnLFxuICAgICAgICAgIGxhYmVsOiAnUHJlZmVyZW5jZXMgMycsXG4gICAgICAgICAgbWVudTogWyB7XG4gICAgICAgICAgICBpdGVtczogWyB7XG4gICAgICAgICAgICAgIGlkOiAnc3ViX3ByZWZlcmVuY2VzIDEnLFxuICAgICAgICAgICAgICBsYWJlbDogJ1N1YiBwcmVmZXJlbmNlcyAxJ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ3N1Yl9wcmVmZXJlbmNlcyAyJyxcbiAgICAgICAgICAgICAgbGFiZWw6ICdTdWIgcHJlZmVyZW5jZXMgMidcbiAgICAgICAgICAgIH0gXVxuICAgICAgICAgIH0gXVxuICAgICAgICB9IF1cbiAgICAgIH0gXVxuICAgIH0gXVxuICB9IF07XG5cblxuICBzZWNvbmRNZW51ID0ge1xuICAgIGlkOiAnc2Vjb25kSXRlbScsXG4gICAgbGFiZWw6ICdQcm9qZWN0cycsXG4gICAgbWVudTogW11cbiAgfTtcblxuICBzZWNvbmRNZW51Lm1lbnUgPSBbIHtcbiAgICBpZDogJ3NlY29uZE1lbnVNZW51JyxcbiAgICBpdGVtczogW1xuXG4gICAgICB7XG4gICAgICAgIGlkOiAnc2hvd1ByZWZlcmVuY2VzJyxcbiAgICAgICAgbGFiZWw6ICdTaG93IHByZWZlcmVuY2VzJyxcbiAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coICdTaG93IHByZWZlcmVuY2VzJyApO1xuICAgICAgICB9LFxuICAgICAgICBtZW51OiBbIHtcbiAgICAgICAgICBpdGVtczogWyB7XG4gICAgICAgICAgICBpZDogJ3ByZWZlcmVuY2VzIDEnLFxuICAgICAgICAgICAgbGFiZWw6ICdQcmVmZXJlbmNlcyAxJ1xuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAncHJlZmVyZW5jZXMgMicsXG4gICAgICAgICAgICBsYWJlbDogJ1ByZWZlcmVuY2VzIDInXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6ICdwcmVmZXJlbmNlcyAzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnUHJlZmVyZW5jZXMgMycsXG4gICAgICAgICAgICBtZW51OiBbIHtcbiAgICAgICAgICAgICAgaXRlbXM6IFsge1xuICAgICAgICAgICAgICAgIGlkOiAnc3ViX3ByZWZlcmVuY2VzIDEnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnU3ViIHByZWZlcmVuY2VzIDEnXG4gICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpZDogJ3N1Yl9wcmVmZXJlbmNlcyAyJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1N1YiBwcmVmZXJlbmNlcyAyJ1xuICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgIH0gXVxuICAgICAgICAgIH0gXVxuICAgICAgICB9IF1cbiAgICAgIH1cbiAgICBdXG4gIH0gXTtcblxuICAkc2NvcGUubmF2aWdhdG9yID0ge1xuICAgIGl0ZW1zOiBbXG4gICAgICBmaXJzdE1lbnUsXG4gICAgICBzZWNvbmRNZW51XG4gICAgXSxcbiAgICBzZXBhcmF0b3I6IHRydWVcbiAgfTtcblxuXG59ICk7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2xpYnJhcnkvZHJvcGRvd25OYXZpZ2F0b3IvZG9jcy9kZW1vLmpzXCIsXCIvLi4vbGlicmFyeS9kcm9wZG93bk5hdmlnYXRvci9kb2NzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLypnbG9iYWxzIGNvbnNvbGUsIGFuZ3VsYXIqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVtb0FwcCA9IGFuZ3VsYXIubW9kdWxlKCAnaXNpcy51aS5oaWVyYXJjaGljYWxNZW51LmRlbW8nLCBbICd1aS5ib290c3RyYXAnLFxuICAnaXNpcy51aS5oaWVyYXJjaGljYWxNZW51J1xuXSApO1xuXG5kZW1vQXBwLmNvbnRyb2xsZXIoICdIaWVyYXJjaGljYWxNZW51RGVtb0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcblxuICB2YXIgbWVudTtcblxuICBtZW51ID0gWyB7XG4gICAgaWQ6ICd0b3AnLFxuICAgIGl0ZW1zOiBbIHtcbiAgICAgIGlkOiAnbmV3UHJvamVjdCcsXG4gICAgICBsYWJlbDogJ05ldyBwcm9qZWN0IC4uLicsXG4gICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBsdXMnLFxuICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnTmV3IHByb2plY3QgY2xpY2tlZCcgKTtcbiAgICAgIH0sXG4gICAgICBhY3Rpb25EYXRhOiB7fVxuICAgIH0sIHtcbiAgICAgIGlkOiAnaW1wb3J0UHJvamVjdCcsXG4gICAgICBsYWJlbDogJ0ltcG9ydCBwcm9qZWN0IC4uLicsXG4gICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWltcG9ydCcsXG4gICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coICdJbXBvcnQgcHJvamVjdCBjbGlja2VkJyApO1xuICAgICAgfSxcbiAgICAgIGFjdGlvbkRhdGE6IHt9XG4gICAgfSBdXG4gIH0sIHtcbiAgICBpZDogJ3Byb2plY3RzJyxcbiAgICBsYWJlbDogJ1JlY2VudCBwcm9qZWN0cycsXG4gICAgdG90YWxJdGVtczogMjAsXG4gICAgaXRlbXM6IFtdLFxuICAgIHNob3dBbGxJdGVtczogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coICdSZWNlbnQgcHJvamVjdHMgY2xpY2tlZCcgKTtcbiAgICB9XG4gIH0sIHtcbiAgICBpZDogJ3ByZWZlcmVuY2VzJyxcbiAgICBsYWJlbDogJ3ByZWZlcmVuY2VzJyxcbiAgICBpdGVtczogWyB7XG4gICAgICBpZDogJ3Nob3dQcmVmZXJlbmNlcycsXG4gICAgICBsYWJlbDogJ1Nob3cgcHJlZmVyZW5jZXMnLFxuICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnU2hvdyBwcmVmZXJlbmNlcycgKTtcbiAgICAgIH0sXG4gICAgICBtZW51OiBbIHtcbiAgICAgICAgaXRlbXM6IFsge1xuICAgICAgICAgIGlkOiAncHJlZmVyZW5jZXMgMScsXG4gICAgICAgICAgbGFiZWw6ICdQcmVmZXJlbmNlcyAxJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgaWQ6ICdwcmVmZXJlbmNlcyAyJyxcbiAgICAgICAgICBsYWJlbDogJ1ByZWZlcmVuY2VzIDInXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBpZDogJ3ByZWZlcmVuY2VzIDMnLFxuICAgICAgICAgIGxhYmVsOiAnUHJlZmVyZW5jZXMgMycsXG4gICAgICAgICAgbWVudTogWyB7XG4gICAgICAgICAgICBpdGVtczogWyB7XG4gICAgICAgICAgICAgIGlkOiAnc3ViX3ByZWZlcmVuY2VzIDEnLFxuICAgICAgICAgICAgICBsYWJlbDogJ1N1YiBwcmVmZXJlbmNlcyAxJ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ3N1Yl9wcmVmZXJlbmNlcyAyJyxcbiAgICAgICAgICAgICAgbGFiZWw6ICdTdWIgcHJlZmVyZW5jZXMgMidcbiAgICAgICAgICAgIH0gXVxuICAgICAgICAgIH0gXVxuICAgICAgICB9IF1cbiAgICAgIH0gXVxuICAgIH0gXVxuICB9IF07XG5cbiAgJHNjb3BlLm1lbnUgPSBtZW51O1xuXG59ICk7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2xpYnJhcnkvaGllcmFyY2hpY2FsTWVudS9kb2NzL2RlbW8uanNcIixcIi8uLi9saWJyYXJ5L2hpZXJhcmNoaWNhbE1lbnUvZG9jc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qZ2xvYmFscyBhbmd1bGFyKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGRlbW9BcHAgPSBhbmd1bGFyLm1vZHVsZSggJ2lzaXMudWkuaXRlbUxpc3QuZGVtbycsIFsgJ2lzaXMudWkuaXRlbUxpc3QnIF0gKTtcblxuZGVtb0FwcC5jb250cm9sbGVyKCAnTGlzdEl0ZW1EZXRhaWxzRGVtb0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcbiAgJHNjb3BlLnBhcmFtZXRlciA9IHt9O1xuXG4gICRzY29wZS5pc1ZhbGlkID0gZnVuY3Rpb24gKCBudW0gKSB7XG4gICAgY29uc29sZS5sb2coICdXaG8ga25vd3MgaWYgaXMgdmFsaWQ/JywgbnVtICk7XG5cbiAgICBpZiAoIHBhcnNlSW50KCBudW0sIDEwICkgPT09IDQgKSB7XG4gICAgICAkc2NvcGUucGFyYW1ldGVyLmludmFsaWQgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnBhcmFtZXRlci5pbnZhbGlkID0gdHJ1ZTtcbiAgICB9XG4gIH07XG5cblxufSApO1xuXG5kZW1vQXBwLmNvbnRyb2xsZXIoICdMaXN0SXRlbURldGFpbHNEZW1vQ29udHJvbGxlcjInLCBmdW5jdGlvbiAoICRzY29wZSApIHtcbiAgdmFyIGksXG4gIGl0ZW1zMiA9IFtdLFxuICBpdGVtR2VuZXJhdG9yMixcbiAgY29uZmlnO1xuXG4gIGl0ZW1HZW5lcmF0b3IyID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgdGl0bGU6ICdMaXN0IHN1Yi1pdGVtICcgKyBpZCxcbiAgICAgIHRvb2xUaXA6ICdPcGVuIGl0ZW0nLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGlzIGlzIGRlc2NyaXB0aW9uIGhlcmUnLFxuICAgICAgbGFzdFVwZGF0ZWQ6IHtcbiAgICAgICAgdGltZTogRGF0ZS5ub3coKSxcbiAgICAgICAgdXNlcjogJ04vQSdcblxuICAgICAgfSxcbiAgICAgIHN0YXRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogaWQsXG4gICAgICAgICAgdG9vbHRpcDogJ09yZGVycycsXG4gICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtY3ViZXMnXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBkZXRhaWxzOiAnU29tZSBkZXRhaWxlZCB0ZXh0LiBMb3JlbSBpcHN1bSBhbWEgZmVhIHJpbiB0aGUgcG9jIGtldG9mbXlqYSBja2V0LidcbiAgICB9O1xuICB9O1xuXG5cbiAgZm9yICggaSA9IDA7IGkgPCAyMDsgaSsrICkge1xuICAgIGl0ZW1zMi5wdXNoKCBpdGVtR2VuZXJhdG9yMiggaSApICk7XG4gIH1cblxuICBjb25maWcgPSB7XG5cbiAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcbiAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXG4gICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXG4gICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXG5cbiAgICAvLyBFdmVudCBoYW5kbGVyc1xuXG4gICAgaXRlbVNvcnQ6IGZ1bmN0aW9uICggalFFdmVudCwgdWkgKSB7XG4gICAgICBjb25zb2xlLmxvZyggJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSApO1xuICAgIH0sXG5cbiAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uICggZXZlbnQsIGl0ZW0gKSB7XG4gICAgICBjb25zb2xlLmxvZyggJ0NsaWNrZWQ6ICcgKyBpdGVtICk7XG4gICAgfSxcblxuICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoIGUsIGl0ZW0gKSB7XG4gICAgICBjb25zb2xlLmxvZyggJ0NvbnRleHRtZW51IHdhcyB0cmlnZ2VyZWQgZm9yIG5vZGU6JywgaXRlbSApO1xuXG4gICAgICByZXR1cm4gIFt7XG4gICAgICAgIGl0ZW1zOiBbXG5cbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2NyZWF0ZScsXG4gICAgICAgICAgICBsYWJlbDogJ0NyZWF0ZSBuZXcnLFxuICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1wbHVzJ1xuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfV07XG4gICAgfSxcblxuICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKCBpdGVtICkge1xuICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XG4gICAgfSxcblxuICAgIG5ld0l0ZW1Gb3JtOiB7XG4gICAgICB0aXRsZTogJ0NyZWF0ZSBuZXcgaXRlbScsXG4gICAgICBpdGVtVGVtcGxhdGVVcmw6ICcvbGlicmFyeS9pdGVtTGlzdC9kb2NzL25ld0l0ZW1UZW1wbGF0ZS5odG1sJyxcbiAgICAgIGV4cGFuZGVkOiBmYWxzZSxcbiAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICggJHNjb3BlICkge1xuICAgICAgICAkc2NvcGUuY3JlYXRlSXRlbSA9IGZ1bmN0aW9uICggbmV3SXRlbSApIHtcblxuICAgICAgICAgIG5ld0l0ZW0udXJsID0gJ3NvbWV0aGluZyc7XG4gICAgICAgICAgbmV3SXRlbS50b29sVGlwID0gbmV3SXRlbS50aXRsZTtcblxuICAgICAgICAgIGl0ZW1zMi5wdXNoKCBuZXdJdGVtICk7XG5cbiAgICAgICAgICAkc2NvcGUubmV3SXRlbSA9IHt9O1xuXG4gICAgICAgICAgY29uZmlnLm5ld0l0ZW1Gb3JtLmV4cGFuZGVkID0gZmFsc2U7IC8vIHRoaXMgaXMgaG93IHlvdSBjbG9zZSB0aGUgZm9ybSBpdHNlbGZcblxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBmaWx0ZXI6IHtcbiAgICB9XG5cbiAgfTtcblxuICAkc2NvcGUubGlzdERhdGEyID0ge1xuICAgIGl0ZW1zOiBpdGVtczJcbiAgfTtcblxuICAkc2NvcGUuY29uZmlnMiA9IGNvbmZpZztcblxufSApXG47XG5cbmRlbW9BcHAuZGlyZWN0aXZlKCdkZW1vU3ViTGlzdCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgcmVwbGFjZTogZmFsc2UsXG4gICAgc2NvcGU6IHtcbiAgICAgIGxpc3REYXRhOiAnPScsXG4gICAgICBjb25maWc6ICc9J1xuICAgIH0sXG4gICAgdGVtcGxhdGU6ICc8aXRlbS1saXN0IGxpc3QtZGF0YT1cImxpc3REYXRhXCIgY29uZmlnPVwiY29uZmlnXCIgY2xhc3M9XCJjb2wtbWQtMTJcIj48L2l0ZW0tbGlzdD4nXG4gIH07XG59KTtcblxuZGVtb0FwcC5jb250cm9sbGVyKCAnSXRlbUxpc3REZW1vQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlICkge1xuXG5cbiAgdmFyXG4gIGksXG5cbiAgaXRlbXMgPSBbXSxcblxuICBpdGVtR2VuZXJhdG9yLFxuICBnZXRJdGVtQ29udGV4dG1lbnUsXG4gIGNvbmZpZztcblxuICBpdGVtR2VuZXJhdG9yID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgdGl0bGU6ICdMaXN0IGl0ZW0gJyArIGlkLFxuICAgICAgY3NzQ2xhc3M6ICdteS1pdGVtJyxcbiAgICAgIHRvb2xUaXA6ICdPcGVuIGl0ZW0nLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGlzIGlzIGRlc2NyaXB0aW9uIGhlcmUnLFxuICAgICAgbGFzdFVwZGF0ZWQ6IHtcbiAgICAgICAgdGltZTogRGF0ZS5ub3coKSxcbiAgICAgICAgdXNlcjogJ04vQSdcblxuICAgICAgfSxcbiAgICAgIHN0YXRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogaWQsXG4gICAgICAgICAgdG9vbHRpcDogJ09yZGVycycsXG4gICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtY3ViZXMnXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBkZXRhaWxzOiAnU29tZSBkZXRhaWxlZCB0ZXh0LiBMb3JlbSBpcHN1bSBhbWEgZmVhIHJpbiB0aGUgcG9jIGtldG9mbXlqYSBja2V0LicsXG4gICAgICBkZXRhaWxzVGVtcGxhdGVVcmw6IE1hdGgucmFuZG9tKCkgPCAwLjUgPyAnbGlzdC1pdGVtLWRldGFpbHMuaHRtbCcgOiAnbGlzdC1pdGVtLWRldGFpbHMyLmh0bWwnXG4gICAgfTtcbiAgfTtcblxuXG4gIGZvciAoIGkgPSAwOyBpIDwgMjA7IGkrKyApIHtcbiAgICBpdGVtcy5wdXNoKCBpdGVtR2VuZXJhdG9yKCBpICkgKTtcbiAgfVxuXG4gIGdldEl0ZW1Db250ZXh0bWVudSA9IGZ1bmN0aW9uICggaXRlbSApIHtcblxuICAgIHZhciBkZWZhdWx0SXRlbUNvbnRleHRtZW51ID0gW1xuICAgICAge1xuICAgICAgICBpdGVtczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnY3JlYXRlJyxcbiAgICAgICAgICAgIGxhYmVsOiAnQ3JlYXRlIG5ldycsXG4gICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXBsdXMnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2R1bW15JyxcbiAgICAgICAgICAgIGxhYmVsOiAnSnVzdCBmb3IgdGVzdCAnICsgaXRlbS5pZCxcblxuICAgICAgICAgICAgYWN0aW9uRGF0YTogaXRlbSxcblxuICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAndGVzdGluZyAnLCBkYXRhICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAncmVuYW1lJyxcbiAgICAgICAgICAgIGxhYmVsOiAnUmVuYW1lJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdwcmVmZXJlbmNlcyAzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnUHJlZmVyZW5jZXMgMycsXG4gICAgICAgICAgICBtZW51OiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ3N1Yl9wcmVmZXJlbmNlcyAxJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdWIgcHJlZmVyZW5jZXMgMSdcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnc3ViX3ByZWZlcmVuY2VzIDInLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N1YiBwcmVmZXJlbmNlcyAyJyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICd0ZXN0aW5nMiAnLCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdO1xuXG4gICAgcmV0dXJuIGRlZmF1bHRJdGVtQ29udGV4dG1lbnU7XG5cbiAgfTtcblxuICBjb25maWcgPSB7XG5cbiAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcbiAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXG4gICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXG4gICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXG5cbiAgICAvLyBFdmVudCBoYW5kbGVyc1xuXG4gICAgaXRlbVNvcnQ6IGZ1bmN0aW9uICggalFFdmVudCwgdWkgKSB7XG4gICAgICBjb25zb2xlLmxvZyggJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSApO1xuICAgIH0sXG5cbiAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uICggZXZlbnQsIGl0ZW0gKSB7XG4gICAgICBjb25zb2xlLmxvZyggJ0NsaWNrZWQ6ICcgKyBpdGVtICk7XG4gICAgfSxcblxuICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoIGUsIGl0ZW0gKSB7XG4gICAgICBjb25zb2xlLmxvZyggJ0NvbnRleHRtZW51IHdhcyB0cmlnZ2VyZWQgZm9yIG5vZGU6JywgaXRlbSApO1xuXG4gICAgICByZXR1cm4gZ2V0SXRlbUNvbnRleHRtZW51KCBpdGVtICk7XG4gICAgfSxcblxuICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKCBpdGVtICkge1xuICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XG4gICAgfSxcblxuICAgIG5ld0l0ZW1Gb3JtOiB7XG4gICAgICB0aXRsZTogJ0NyZWF0ZSBuZXcgaXRlbScsXG4gICAgICBpdGVtVGVtcGxhdGVVcmw6ICcvbGlicmFyeS9pdGVtTGlzdC9kb2NzL25ld0l0ZW1UZW1wbGF0ZS5odG1sJyxcbiAgICAgIGV4cGFuZGVkOiBmYWxzZSxcbiAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICggJHNjb3BlICkge1xuICAgICAgICAkc2NvcGUuY3JlYXRlSXRlbSA9IGZ1bmN0aW9uICggbmV3SXRlbSApIHtcblxuICAgICAgICAgIG5ld0l0ZW0udXJsID0gJ3NvbWV0aGluZyc7XG4gICAgICAgICAgbmV3SXRlbS50b29sVGlwID0gbmV3SXRlbS50aXRsZTtcblxuICAgICAgICAgIGl0ZW1zLnB1c2goIG5ld0l0ZW0gKTtcblxuICAgICAgICAgICRzY29wZS5uZXdJdGVtID0ge307XG5cbiAgICAgICAgICBjb25maWcubmV3SXRlbUZvcm0uZXhwYW5kZWQgPSBmYWxzZTsgLy8gdGhpcyBpcyBob3cgeW91IGNsb3NlIHRoZSBmb3JtIGl0c2VsZlxuXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSxcblxuICAgIGZpbHRlcjoge31cblxuICB9O1xuXG4gICRzY29wZS5saXN0RGF0YSA9IHtcbiAgICBpdGVtczogaXRlbXNcbiAgfTtcblxuICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xuXG59IClcbjtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbGlicmFyeS9pdGVtTGlzdC9kb2NzL2RlbW8uanNcIixcIi8uLi9saWJyYXJ5L2l0ZW1MaXN0L2RvY3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKmdsb2JhbHMgYW5ndWxhciovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkZW1vQXBwID0gYW5ndWxhci5tb2R1bGUoICdpc2lzLnVpLnNlYXJjaEJveC5kZW1vJywgWyAnaXNpcy51aS5zZWFyY2hCb3gnIF0gKTtcblxuZGVtb0FwcC5jb250cm9sbGVyKCAnU2VhcmNoQm94RGVtb0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoICkge1xuXG59KTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9saWJyYXJ5L3NlYXJjaEJveC9kb2NzL2RlbW8uanNcIixcIi8uLi9saWJyYXJ5L3NlYXJjaEJveC9kb2NzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLypnbG9iYWxzIGNvbnNvbGUsIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpc1ZhbGlkLFxuICBkZW1vQXBwID0gYW5ndWxhci5tb2R1bGUoICdpc2lzLnVpLnNpbXBsZURpYWxvZy5kZW1vJywgWyAnaXNpcy51aS5zaW1wbGVEaWFsb2cnIF0gKSxcblxuICBwYXJhbWV0ZXIgPSB7XG4gICAgdmFsdWU6IDEwLFxuICAgIGludmFsaWQ6IHRydWVcbiAgfTtcblxuZGVtb0FwcC5jb250cm9sbGVyKCAnQ29uZmlybURpYWxvZ0RlbW9Db250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICRzaW1wbGVEaWFsb2cgKSB7XG5cbiAgaXNWYWxpZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciByZXN1bHQgPSAoIE51bWJlciggcGFyYW1ldGVyLnZhbHVlICkgPT09IDQgKTtcblxuICAgIGNvbnNvbGUubG9nKCAnVmFsaWRhdG9yIHdhcyBjYWxsZWQnICk7XG4gICAgY29uc29sZS5sb2coICdTdW0gaXM6ICcgKyBwYXJhbWV0ZXIudmFsdWUsIHJlc3VsdCApO1xuICAgIHBhcmFtZXRlci5pbnZhbGlkID0gIXJlc3VsdDtcblxuICAgIHJldHVybiByZXN1bHQ7XG5cbiAgfTtcblxuXG4gICRzY29wZS5wYXJhbWV0ZXIgPSBwYXJhbWV0ZXI7XG5cbiAgJHNjb3BlLmlzVmFsaWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaXNWYWxpZCgpO1xuICAgIGlmICggISRzY29wZS4kJHBoYXNlICkge1xuICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUub3BlbkRpYWxvZyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICRzaW1wbGVEaWFsb2cub3Blbigge1xuICAgICAgZGlhbG9nVGl0bGU6ICdBcmUgeW91IHN1cmU/JyxcbiAgICAgIGRpYWxvZ0NvbnRlbnRUZW1wbGF0ZTogJ2NvbmZpcm0tY29udGVudC10ZW1wbGF0ZScsXG4gICAgICBvbk9rOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnT0sgd2FzIHBpY2tlZCcgKTtcbiAgICAgIH0sXG4gICAgICBvbkNhbmNlbDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ1RoaXMgd2FzIGNhbmNlbGVkJyApO1xuICAgICAgfSxcbiAgICAgIHZhbGlkYXRvcjogaXNWYWxpZCxcbiAgICAgIHNpemU6ICdsZycsIC8vIGNhbiBiZSBzbSBvciBsZ1xuICAgICAgc2NvcGU6ICRzY29wZVxuICAgIH0gKTtcblxuICB9O1xuXG5cbn0gKTtcblxuZGVtb0FwcC5jb250cm9sbGVyKCAnQ29uZmlybURpYWxvZ0RlbW9EYXRhQ29udHJvbGxlcicsIGZ1bmN0aW9uICgpIHtcblxufSApO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9saWJyYXJ5L3NpbXBsZURpYWxvZy9kb2NzL2RlbW8uanNcIixcIi8uLi9saWJyYXJ5L3NpbXBsZURpYWxvZy9kb2NzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLypnbG9iYWxzIGFuZ3VsYXIqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVtb0FwcCA9IGFuZ3VsYXIubW9kdWxlKCAnaXNpcy51aS50cmVlTmF2aWdhdG9yLmRlbW8nLCBbICdpc2lzLnVpLnRyZWVOYXZpZ2F0b3InIF0gKTtcblxuZGVtb0FwcC5jb250cm9sbGVyKCAnVHJlZU5hdmlnYXRvckRlbW9Db250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICRsb2csICRxICkge1xuXG4gIHZhciBjb25maWcsXG4gICAgdHJlZU5vZGVzID0ge30sXG5cbiAgICBhZGROb2RlLFxuICAgIHJlbW92ZU5vZGUsXG4gICAgZ2V0Tm9kZUNvbnRleHRtZW51LFxuICAgIGR1bW15VHJlZURhdGFHZW5lcmF0b3IsXG4gICAgc29ydENoaWxkcmVuO1xuXG4gIGdldE5vZGVDb250ZXh0bWVudSA9IGZ1bmN0aW9uKG5vZGUpIHtcblxuICAgIHZhciBkZWZhdWx0Tm9kZUNvbnRleHRtZW51ID0gW1xuICAgICAgICB7XG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6ICdjcmVhdGUnLFxuICAgICAgICAgICAgICBsYWJlbDogJ0NyZWF0ZSBuZXcnLFxuICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcGx1cycsXG4gICAgICAgICAgICAgIG1lbnU6IFtdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZDogJ2R1bW15JyxcbiAgICAgICAgICAgICAgbGFiZWw6ICdKdXN0IGZvciB0ZXN0ICcgKyBub2RlLmlkLFxuXG4gICAgICAgICAgICAgIGFjdGlvbkRhdGE6IG5vZGUsXG5cbiAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coICd0ZXN0aW5nICcsIGRhdGEgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZDogJ3JlbmFtZScsXG4gICAgICAgICAgICAgIGxhYmVsOiAnUmVuYW1lJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxuICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXG4gICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLW1pbnVzJyxcbiAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xuICAgICAgICAgICAgICAgIGlkOiBub2RlLmlkXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUoIGRhdGEuaWQgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6ICdwcmVmZXJlbmNlcyAzJyxcbiAgICAgICAgICAgICAgbGFiZWw6ICdQcmVmZXJlbmNlcyAzJyxcbiAgICAgICAgICAgICAgbWVudTogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZDogJ3N1Yl9wcmVmZXJlbmNlcyAxJyxcbiAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N1YiBwcmVmZXJlbmNlcyAxJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgaWQ6ICdzdWJfcHJlZmVyZW5jZXMgMicsXG4gICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdWIgcHJlZmVyZW5jZXMgMicsXG4gICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmxvZyggJ3Rlc3RpbmcyICcsIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICByZXR1cm4gZGVmYXVsdE5vZGVDb250ZXh0bWVudTtcblxuICB9O1xuXG4gIGR1bW15VHJlZURhdGFHZW5lcmF0b3IgPSBmdW5jdGlvbiAoIHRyZWVOb2RlLCBuYW1lLCBtYXhDb3VudCwgbGV2ZWxzICkge1xuICAgIHZhciBpLFxuICAgICAgaWQsXG4gICAgICBjb3VudCxcbiAgICAgIGNoaWxkTm9kZTtcblxuICAgIGxldmVscyA9IGxldmVscyB8fCAwO1xuXG4gICAgY291bnQgPSBNYXRoLnJvdW5kKFxuICAgICAgTWF0aC5yYW5kb20oKSAqIG1heENvdW50XG4gICAgKSArIDE7XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IGNvdW50OyBpICs9IDEgKSB7XG4gICAgICBpZCA9IG5hbWUgKyBpO1xuXG4gICAgICBjaGlsZE5vZGUgPSBhZGROb2RlKCB0cmVlTm9kZSwgaWQgKTtcblxuICAgICAgaWYgKCBsZXZlbHMgPiAwICkge1xuICAgICAgICBkdW1teVRyZWVEYXRhR2VuZXJhdG9yKCBjaGlsZE5vZGUsIGlkICsgJy4nLCBtYXhDb3VudCwgbGV2ZWxzIC0gMSApO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBhZGROb2RlID0gZnVuY3Rpb24gKCBwYXJlbnRUcmVlTm9kZSwgaWQgKSB7XG4gICAgdmFyIG5ld1RyZWVOb2RlLFxuICAgICAgY2hpbGRyZW4gPSBbXTtcblxuXG4gICAgLy8gbm9kZSBzdHJ1Y3R1cmVcbiAgICBuZXdUcmVlTm9kZSA9IHtcbiAgICAgIGxhYmVsOiBpZCxcbiAgICAgIGV4dHJhSW5mbzogJ0V4dHJhIGluZm8nLFxuICAgICAgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgY2hpbGRyZW5Db3VudDogMCxcbiAgICAgIG5vZGVEYXRhOiB7fSxcbiAgICAgIGljb25DbGFzczogJ2ZhIGZhLWZpbGUtbycsXG5cbiAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgIGRyYWdDaGFubmVsOiAnYScsXG4gICAgICBkcm9wQ2hhbm5lbDogKE1hdGgucmFuZG9tKCkgPiAwLjUpID8gJ2EnIDogJ2InXG4gICAgfTtcblxuICAgIG5ld1RyZWVOb2RlLmlkID0gaWQ7XG5cbiAgICAvLyBhZGQgdGhlIG5ldyBub2RlIHRvIHRoZSBtYXBcbiAgICB0cmVlTm9kZXNbIG5ld1RyZWVOb2RlLmlkIF0gPSBuZXdUcmVlTm9kZTtcblxuXG4gICAgaWYgKCBwYXJlbnRUcmVlTm9kZSApIHtcbiAgICAgIC8vIGlmIGEgcGFyZW50IHdhcyBnaXZlbiBhZGQgdGhlIG5ldyBub2RlIGFzIGEgY2hpbGQgbm9kZVxuICAgICAgcGFyZW50VHJlZU5vZGUuaWNvbkNsYXNzID0gdW5kZWZpbmVkO1xuICAgICAgcGFyZW50VHJlZU5vZGUuY2hpbGRyZW4ucHVzaCggbmV3VHJlZU5vZGUgKTtcblxuXG4gICAgICBwYXJlbnRUcmVlTm9kZS5jaGlsZHJlbkNvdW50ID0gcGFyZW50VHJlZU5vZGUuY2hpbGRyZW4ubGVuZ3RoO1xuXG4gICAgICBpZiAoIG5ld1RyZWVOb2RlLmNoaWxkcmVuQ291bnQgPT09IDAgKSB7XG4gICAgICAgIG5ld1RyZWVOb2RlLmNoaWxkcmVuQ291bnQgPSBNYXRoLnJvdW5kKCBNYXRoLnJhbmRvbSgpICk7XG4gICAgICB9XG5cblxuICAgICAgaWYgKCBuZXdUcmVlTm9kZS5jaGlsZHJlbkNvdW50ICkge1xuICAgICAgICBuZXdUcmVlTm9kZS5pY29uQ2xhc3MgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHNvcnRDaGlsZHJlbiggcGFyZW50VHJlZU5vZGUuY2hpbGRyZW4gKTtcblxuICAgICAgbmV3VHJlZU5vZGUucGFyZW50SWQgPSBwYXJlbnRUcmVlTm9kZS5pZDtcbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyBpZiBubyBwYXJlbnQgaXMgZ2l2ZW4gcmVwbGFjZSB0aGUgY3VycmVudCByb290IG5vZGUgd2l0aCB0aGlzIG5vZGVcbiAgICAgICRzY29wZS50cmVlRGF0YSA9IG5ld1RyZWVOb2RlO1xuICAgICAgJHNjb3BlLnRyZWVEYXRhLnVuQ29sbGFwc2libGUgPSB0cnVlO1xuICAgICAgbmV3VHJlZU5vZGUucGFyZW50SWQgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBuZXdUcmVlTm9kZTtcbiAgfTtcblxuICByZW1vdmVOb2RlID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICB2YXJcbiAgICAgIHBhcmVudE5vZGUsXG4gICAgICBub2RlVG9EZWxldGUgPSB0cmVlTm9kZXNbIGlkIF07XG5cbiAgICAkbG9nLmRlYnVnKCAnUmVtb3ZpbmcgYSBub2RlICcgKyBpZCApO1xuXG4gICAgaWYgKCBub2RlVG9EZWxldGUgKSB7XG4gICAgICBpZiAoIG5vZGVUb0RlbGV0ZS5wYXJlbnRJZCAhPT0gbnVsbCAmJiB0cmVlTm9kZXNbIG5vZGVUb0RlbGV0ZS5wYXJlbnRJZCBdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIC8vIGZpbmQgcGFyZW50IG5vZGVcbiAgICAgICAgcGFyZW50Tm9kZSA9IHRyZWVOb2Rlc1sgbm9kZVRvRGVsZXRlLnBhcmVudElkIF07XG5cbiAgICAgICAgLy8gcmVtb3ZlIG5vZGVUb0RlbGV0ZSBmcm9tIHBhcmVudCBub2RlJ3MgY2hpbGRyZW5cbiAgICAgICAgcGFyZW50Tm9kZS5jaGlsZHJlbiA9IHBhcmVudE5vZGUuY2hpbGRyZW4uZmlsdGVyKCBmdW5jdGlvbiAoIGVsICkge1xuICAgICAgICAgIHJldHVybiBlbC5pZCAhPT0gaWQ7XG4gICAgICAgIH0gKTtcblxuICAgICAgICBwYXJlbnROb2RlLmNoaWxkcmVuQ291bnQgPSBwYXJlbnROb2RlLmNoaWxkcmVuLmxlbmd0aDtcblxuICAgICAgICBpZiAoIHBhcmVudE5vZGUuY2hpbGRyZW5Db3VudCA9PT0gMCApIHtcbiAgICAgICAgICBwYXJlbnROb2RlLmljb25DbGFzcyA9ICdmYSBmYS1maWxlLW8nO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGRlbGV0ZSB0cmVlTm9kZXNbIGlkIF07XG4gICAgfVxuXG4gIH07XG5cbiAgc29ydENoaWxkcmVuID0gZnVuY3Rpb24gKCB2YWx1ZXMgKSB7XG4gICAgdmFyIG9yZGVyQnkgPSBbJ2xhYmVsJywgJ2lkJ107XG5cbiAgICB2YWx1ZXMuc29ydCggZnVuY3Rpb24gKCBhLCBiICkge1xuICAgICAgdmFyIGksXG4gICAgICAgIGtleSxcbiAgICAgICAgcmVzdWx0O1xuXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IG9yZGVyQnkubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgIGtleSA9IG9yZGVyQnlbaV07XG4gICAgICAgIGlmICggYS5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgJiYgYi5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG4gICAgICAgICAgcmVzdWx0ID0gYVtrZXldLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZSggYltrZXldLnRvTG93ZXJDYXNlKCkgKTtcbiAgICAgICAgICBpZiAoIHJlc3VsdCAhPT0gMCApIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGEgbXVzdCBiZSBlcXVhbCB0byBiXG4gICAgICByZXR1cm4gMDtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIGNvbmZpZyA9IHtcblxuICAgIHNjb3BlTWVudTogW1xuICAgICAge1xuICAgICAgICBpdGVtczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAncHJvamVjdCcsXG4gICAgICAgICAgICBsYWJlbDogJ1Byb2plY3QgSGllcmFyY2h5JyxcbiAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkc2NvcGUuY29uZmlnLnN0YXRlLmFjdGl2ZVNjb3BlID0gJ3Byb2plY3QnO1xuICAgICAgICAgICAgICAkc2NvcGUuY29uZmlnLnNlbGVjdGVkU2NvcGUgPSAkc2NvcGUuY29uZmlnLnNjb3BlTWVudVsgMCBdLml0ZW1zWyAwIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2NvbXBvc2l0aW9uJyxcbiAgICAgICAgICAgIGxhYmVsOiAnQ29tcG9zaXRpb24nLFxuICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICRzY29wZS5jb25maWcuc3RhdGUuYWN0aXZlU2NvcGUgPSAnY29tcG9zaXRpb24nO1xuICAgICAgICAgICAgICAkc2NvcGUuY29uZmlnLnNlbGVjdGVkU2NvcGUgPSAkc2NvcGUuY29uZmlnLnNjb3BlTWVudVsgMCBdLml0ZW1zWyAxIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG5cbiAgICBdLFxuXG4gICAgcHJlZmVyZW5jZXNNZW51OiBbXG4gICAgICB7XG4gICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdwcmVmZXJlbmNlcyAxJyxcbiAgICAgICAgICAgIGxhYmVsOiAnUHJlZmVyZW5jZXMgMSdcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdwcmVmZXJlbmNlcyAyJyxcbiAgICAgICAgICAgIGxhYmVsOiAnUHJlZmVyZW5jZXMgMidcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdwcmVmZXJlbmNlcyAzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnUHJlZmVyZW5jZXMgMycsXG4gICAgICAgICAgICBtZW51OiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ3N1Yl9wcmVmZXJlbmNlcyAxJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdWIgcHJlZmVyZW5jZXMgMSdcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnc3ViX3ByZWZlcmVuY2VzIDInLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N1YiBwcmVmZXJlbmNlcyAyJyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgJGxvZy5sb2coIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF0sXG5cbiAgICBzaG93Um9vdExhYmVsOiB0cnVlLFxuXG4gICAgLy8gVHJlZSBFdmVudCBjYWxsYmFja3NcblxuICAgIG5vZGVDbGljazogZnVuY3Rpb24oZSwgbm9kZSkge1xuICAgICAgY29uc29sZS5sb2coJ05vZGUgd2FzIGNsaWNrZWQ6Jywgbm9kZSk7XG4gICAgfSxcblxuICAgIG5vZGVEYmxjbGljazogZnVuY3Rpb24oZSwgbm9kZSkge1xuICAgICAgY29uc29sZS5sb2coJ05vZGUgd2FzIGRvdWJsZS1jbGlja2VkOicsIG5vZGUpO1xuICAgIH0sXG5cbiAgICBub2RlQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24oZSwgbm9kZSkge1xuICAgICAgY29uc29sZS5sb2coJ0NvbnRleHRtZW51IHdhcyB0cmlnZ2VyZWQgZm9yIG5vZGU6Jywgbm9kZSk7XG5cbiAgICAgIHJldHVybiBnZXROb2RlQ29udGV4dG1lbnUobm9kZSk7XG5cbiAgICB9LFxuXG4gICAgbm9kZUV4cGFuZGVyQ2xpY2s6IGZ1bmN0aW9uKGUsIG5vZGUsIGlzRXhwYW5kKSB7XG4gICAgICBjb25zb2xlLmxvZygnRXhwYW5kZXIgd2FzIGNsaWNrZWQgZm9yIG5vZGU6Jywgbm9kZSwgaXNFeHBhbmQpO1xuICAgIH0sXG5cbiAgICBsb2FkQ2hpbGRyZW46IGZ1bmN0aW9uKGUsIG5vZGUpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHNldFRpbWVvdXQoXG4gICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGR1bW15VHJlZURhdGFHZW5lcmF0b3IoIG5vZGUsICdBc3luYyAnICsgbm9kZS5pZCwgNSwgMCApO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICB9LFxuICAgICAgMjAwMFxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG5cbiAgfTtcblxuICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xuICAkc2NvcGUuY29uZmlnLnNlbGVjdGVkU2NvcGUgPSAkc2NvcGUuY29uZmlnLnNjb3BlTWVudVsgMCBdLml0ZW1zWyAwIF07XG4gICRzY29wZS50cmVlRGF0YSA9IHt9O1xuICAkc2NvcGUuY29uZmlnLnN0YXRlID0ge1xuICAgIC8vIGlkIG9mIGFjdGl2ZU5vZGVcbiAgICBhY3RpdmVOb2RlOiAnTm9kZSBpdGVtIDAuMCcsXG5cbiAgICAvLyBpZHMgb2Ygc2VsZWN0ZWQgbm9kZXNcbiAgICBzZWxlY3RlZE5vZGVzOiBbJ05vZGUgaXRlbSAwLjAnXSxcblxuICAgIGV4cGFuZGVkTm9kZXM6IFsgJ05vZGUgaXRlbSAwJywgJ05vZGUgaXRlbSAwLjEnXSxcblxuICAgIC8vIGlkIG9mIGFjdGl2ZSBzY29wZVxuICAgIGFjdGl2ZVNjb3BlOiAncHJvamVjdCdcbiAgfTtcblxuXG4gIGFkZE5vZGUoIG51bGwsICdST09UJyApO1xuICBkdW1teVRyZWVEYXRhR2VuZXJhdG9yKCAkc2NvcGUudHJlZURhdGEsICdOb2RlIGl0ZW0gJywgNSwgMyApO1xuXG59ICk7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2xpYnJhcnkvdHJlZU5hdmlnYXRvci9kb2NzL2RlbW8uanNcIixcIi8uLi9saWJyYXJ5L3RyZWVOYXZpZ2F0b3IvZG9jc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbjtfX2Jyb3dzZXJpZnlfc2hpbV9yZXF1aXJlX189cmVxdWlyZTsoZnVuY3Rpb24gYnJvd3NlcmlmeVNoaW0obW9kdWxlLCBleHBvcnRzLCByZXF1aXJlLCBkZWZpbmUsIGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKSB7XG4vL1xuLy8gc2hvd2Rvd24uanMgLS0gQSBqYXZhc2NyaXB0IHBvcnQgb2YgTWFya2Rvd24uXG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDA3IEpvaG4gRnJhc2VyLlxuLy9cbi8vIE9yaWdpbmFsIE1hcmtkb3duIENvcHlyaWdodCAoYykgMjAwNC0yMDA1IEpvaG4gR3J1YmVyXG4vLyAgIDxodHRwOi8vZGFyaW5nZmlyZWJhbGwubmV0L3Byb2plY3RzL21hcmtkb3duLz5cbi8vXG4vLyBSZWRpc3RyaWJ1dGFibGUgdW5kZXIgYSBCU0Qtc3R5bGUgb3BlbiBzb3VyY2UgbGljZW5zZS5cbi8vIFNlZSBsaWNlbnNlLnR4dCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbi8vXG4vLyBUaGUgZnVsbCBzb3VyY2UgZGlzdHJpYnV0aW9uIGlzIGF0OlxuLy9cbi8vXHRcdFx0XHRBIEEgTFxuLy9cdFx0XHRcdFQgQyBBXG4vL1x0XHRcdFx0VCBLIEJcbi8vXG4vLyAgIDxodHRwOi8vd3d3LmF0dGFja2xhYi5uZXQvPlxuLy9cblxuLy9cbi8vIFdoZXJldmVyIHBvc3NpYmxlLCBTaG93ZG93biBpcyBhIHN0cmFpZ2h0LCBsaW5lLWJ5LWxpbmUgcG9ydFxuLy8gb2YgdGhlIFBlcmwgdmVyc2lvbiBvZiBNYXJrZG93bi5cbi8vXG4vLyBUaGlzIGlzIG5vdCBhIG5vcm1hbCBwYXJzZXIgZGVzaWduOyBpdCdzIGJhc2ljYWxseSBqdXN0IGFcbi8vIHNlcmllcyBvZiBzdHJpbmcgc3Vic3RpdHV0aW9ucy4gIEl0J3MgaGFyZCB0byByZWFkIGFuZFxuLy8gbWFpbnRhaW4gdGhpcyB3YXksICBidXQga2VlcGluZyBTaG93ZG93biBjbG9zZSB0byB0aGUgb3JpZ2luYWxcbi8vIGRlc2lnbiBtYWtlcyBpdCBlYXNpZXIgdG8gcG9ydCBuZXcgZmVhdHVyZXMuXG4vL1xuLy8gTW9yZSBpbXBvcnRhbnRseSwgU2hvd2Rvd24gYmVoYXZlcyBsaWtlIG1hcmtkb3duLnBsIGluIG1vc3Rcbi8vIGVkZ2UgY2FzZXMuICBTbyB3ZWIgYXBwbGljYXRpb25zIGNhbiBkbyBjbGllbnQtc2lkZSBwcmV2aWV3XG4vLyBpbiBKYXZhc2NyaXB0LCBhbmQgdGhlbiBidWlsZCBpZGVudGljYWwgSFRNTCBvbiB0aGUgc2VydmVyLlxuLy9cbi8vIFRoaXMgcG9ydCBuZWVkcyB0aGUgbmV3IFJlZ0V4cCBmdW5jdGlvbmFsaXR5IG9mIEVDTUEgMjYyLFxuLy8gM3JkIEVkaXRpb24gKGkuZS4gSmF2YXNjcmlwdCAxLjUpLiAgTW9zdCBtb2Rlcm4gd2ViIGJyb3dzZXJzXG4vLyBzaG91bGQgZG8gZmluZS4gIEV2ZW4gd2l0aCB0aGUgbmV3IHJlZ3VsYXIgZXhwcmVzc2lvbiBmZWF0dXJlcyxcbi8vIFdlIGRvIGEgbG90IG9mIHdvcmsgdG8gZW11bGF0ZSBQZXJsJ3MgcmVnZXggZnVuY3Rpb25hbGl0eS5cbi8vIFRoZSB0cmlja3kgY2hhbmdlcyBpbiB0aGlzIGZpbGUgbW9zdGx5IGhhdmUgdGhlIFwiYXR0YWNrbGFiOlwiXG4vLyBsYWJlbC4gIE1ham9yIG9yIHNlbGYtZXhwbGFuYXRvcnkgY2hhbmdlcyBkb24ndC5cbi8vXG4vLyBTbWFydCBkaWZmIHRvb2xzIGxpa2UgQXJheGlzIE1lcmdlIHdpbGwgYmUgYWJsZSB0byBtYXRjaCB1cFxuLy8gdGhpcyBmaWxlIHdpdGggbWFya2Rvd24ucGwgaW4gYSB1c2VmdWwgd2F5LiAgQSBsaXR0bGUgdHdlYWtpbmdcbi8vIGhlbHBzOiBpbiBhIGNvcHkgb2YgbWFya2Rvd24ucGwsIHJlcGxhY2UgXCIjXCIgd2l0aCBcIi8vXCIgYW5kXG4vLyByZXBsYWNlIFwiJHRleHRcIiB3aXRoIFwidGV4dFwiLiAgQmUgc3VyZSB0byBpZ25vcmUgd2hpdGVzcGFjZVxuLy8gYW5kIGxpbmUgZW5kaW5ncy5cbi8vXG5cblxuLy9cbi8vIFNob3dkb3duIHVzYWdlOlxuLy9cbi8vICAgdmFyIHRleHQgPSBcIk1hcmtkb3duICpyb2NrcyouXCI7XG4vL1xuLy8gICB2YXIgY29udmVydGVyID0gbmV3IFNob3dkb3duLmNvbnZlcnRlcigpO1xuLy8gICB2YXIgaHRtbCA9IGNvbnZlcnRlci5tYWtlSHRtbCh0ZXh0KTtcbi8vXG4vLyAgIGFsZXJ0KGh0bWwpO1xuLy9cbi8vIE5vdGU6IG1vdmUgdGhlIHNhbXBsZSBjb2RlIHRvIHRoZSBib3R0b20gb2YgdGhpc1xuLy8gZmlsZSBiZWZvcmUgdW5jb21tZW50aW5nIGl0LlxuLy9cblxuXG4vL1xuLy8gU2hvd2Rvd24gbmFtZXNwYWNlXG4vL1xudmFyIFNob3dkb3duID0geyBleHRlbnNpb25zOiB7fSB9O1xuXG4vL1xuLy8gZm9yRWFjaFxuLy9cbnZhciBmb3JFYWNoID0gU2hvd2Rvd24uZm9yRWFjaCA9IGZ1bmN0aW9uKG9iaiwgY2FsbGJhY2spIHtcblx0aWYgKHR5cGVvZiBvYmouZm9yRWFjaCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdG9iai5mb3JFYWNoKGNhbGxiYWNrKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgaSwgbGVuID0gb2JqLmxlbmd0aDtcblx0XHRmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGNhbGxiYWNrKG9ialtpXSwgaSwgb2JqKTtcblx0XHR9XG5cdH1cbn07XG5cbi8vXG4vLyBTdGFuZGFyZCBleHRlbnNpb24gbmFtaW5nXG4vL1xudmFyIHN0ZEV4dE5hbWUgPSBmdW5jdGlvbihzKSB7XG5cdHJldHVybiBzLnJlcGxhY2UoL1tfLV18fFxccy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbn07XG5cbi8vXG4vLyBjb252ZXJ0ZXJcbi8vXG4vLyBXcmFwcyBhbGwgXCJnbG9iYWxzXCIgc28gdGhhdCB0aGUgb25seSB0aGluZ1xuLy8gZXhwb3NlZCBpcyBtYWtlSHRtbCgpLlxuLy9cblNob3dkb3duLmNvbnZlcnRlciA9IGZ1bmN0aW9uKGNvbnZlcnRlcl9vcHRpb25zKSB7XG5cbi8vXG4vLyBHbG9iYWxzOlxuLy9cblxuLy8gR2xvYmFsIGhhc2hlcywgdXNlZCBieSB2YXJpb3VzIHV0aWxpdHkgcm91dGluZXNcbnZhciBnX3VybHM7XG52YXIgZ190aXRsZXM7XG52YXIgZ19odG1sX2Jsb2NrcztcblxuLy8gVXNlZCB0byB0cmFjayB3aGVuIHdlJ3JlIGluc2lkZSBhbiBvcmRlcmVkIG9yIHVub3JkZXJlZCBsaXN0XG4vLyAoc2VlIF9Qcm9jZXNzTGlzdEl0ZW1zKCkgZm9yIGRldGFpbHMpOlxudmFyIGdfbGlzdF9sZXZlbCA9IDA7XG5cbi8vIEdsb2JhbCBleHRlbnNpb25zXG52YXIgZ19sYW5nX2V4dGVuc2lvbnMgPSBbXTtcbnZhciBnX291dHB1dF9tb2RpZmllcnMgPSBbXTtcblxuXG4vL1xuLy8gQXV0b21hdGljIEV4dGVuc2lvbiBMb2FkaW5nIChub2RlIG9ubHkpOlxuLy9cblxuLyppZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5kJyAmJiB0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHJlcXVpcmUgIT09ICd1bmRlZmluZCcpIHtcblx0dmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcblxuXHRpZiAoZnMpIHtcblx0XHQvLyBTZWFyY2ggZXh0ZW5zaW9ucyBmb2xkZXJcblx0XHR2YXIgZXh0ZW5zaW9ucyA9IGZzLnJlYWRkaXJTeW5jKChfX2Rpcm5hbWUgfHwgJy4nKSsnL2V4dGVuc2lvbnMnKS5maWx0ZXIoZnVuY3Rpb24oZmlsZSl7XG5cdFx0XHRyZXR1cm4gfmZpbGUuaW5kZXhPZignLmpzJyk7XG5cdFx0fSkubWFwKGZ1bmN0aW9uKGZpbGUpe1xuXHRcdFx0cmV0dXJuIGZpbGUucmVwbGFjZSgvXFwuanMkLywgJycpO1xuXHRcdH0pO1xuXHRcdC8vIExvYWQgZXh0ZW5zaW9ucyBpbnRvIFNob3dkb3duIG5hbWVzcGFjZVxuXHRcdFNob3dkb3duLmZvckVhY2goZXh0ZW5zaW9ucywgZnVuY3Rpb24oZXh0KXtcblx0XHRcdHZhciBuYW1lID0gc3RkRXh0TmFtZShleHQpO1xuXHRcdFx0U2hvd2Rvd24uZXh0ZW5zaW9uc1tuYW1lXSA9IHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy8nICsgZXh0KTtcblx0XHR9KTtcblx0fVxufSovXG5cbnRoaXMubWFrZUh0bWwgPSBmdW5jdGlvbih0ZXh0KSB7XG4vL1xuLy8gTWFpbiBmdW5jdGlvbi4gVGhlIG9yZGVyIGluIHdoaWNoIG90aGVyIHN1YnMgYXJlIGNhbGxlZCBoZXJlIGlzXG4vLyBlc3NlbnRpYWwuIExpbmsgYW5kIGltYWdlIHN1YnN0aXR1dGlvbnMgbmVlZCB0byBoYXBwZW4gYmVmb3JlXG4vLyBfRXNjYXBlU3BlY2lhbENoYXJzV2l0aGluVGFnQXR0cmlidXRlcygpLCBzbyB0aGF0IGFueSAqJ3Mgb3IgXydzIGluIHRoZSA8YT5cbi8vIGFuZCA8aW1nPiB0YWdzIGdldCBlbmNvZGVkLlxuLy9cblxuXHQvLyBDbGVhciB0aGUgZ2xvYmFsIGhhc2hlcy4gSWYgd2UgZG9uJ3QgY2xlYXIgdGhlc2UsIHlvdSBnZXQgY29uZmxpY3RzXG5cdC8vIGZyb20gb3RoZXIgYXJ0aWNsZXMgd2hlbiBnZW5lcmF0aW5nIGEgcGFnZSB3aGljaCBjb250YWlucyBtb3JlIHRoYW5cblx0Ly8gb25lIGFydGljbGUgKGUuZy4gYW4gaW5kZXggcGFnZSB0aGF0IHNob3dzIHRoZSBOIG1vc3QgcmVjZW50XG5cdC8vIGFydGljbGVzKTpcblx0Z191cmxzID0ge307XG5cdGdfdGl0bGVzID0ge307XG5cdGdfaHRtbF9ibG9ja3MgPSBbXTtcblxuXHQvLyBhdHRhY2tsYWI6IFJlcGxhY2UgfiB3aXRoIH5UXG5cdC8vIFRoaXMgbGV0cyB1cyB1c2UgdGlsZGUgYXMgYW4gZXNjYXBlIGNoYXIgdG8gYXZvaWQgbWQ1IGhhc2hlc1xuXHQvLyBUaGUgY2hvaWNlIG9mIGNoYXJhY3RlciBpcyBhcmJpdHJheTsgYW55dGhpbmcgdGhhdCBpc24ndFxuXHQvLyBtYWdpYyBpbiBNYXJrZG93biB3aWxsIHdvcmsuXG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoL34vZyxcIn5UXCIpO1xuXG5cdC8vIGF0dGFja2xhYjogUmVwbGFjZSAkIHdpdGggfkRcblx0Ly8gUmVnRXhwIGludGVycHJldHMgJCBhcyBhIHNwZWNpYWwgY2hhcmFjdGVyXG5cdC8vIHdoZW4gaXQncyBpbiBhIHJlcGxhY2VtZW50IHN0cmluZ1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXCQvZyxcIn5EXCIpO1xuXG5cdC8vIFN0YW5kYXJkaXplIGxpbmUgZW5kaW5nc1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXHJcXG4vZyxcIlxcblwiKTsgLy8gRE9TIHRvIFVuaXhcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvXFxyL2csXCJcXG5cIik7IC8vIE1hYyB0byBVbml4XG5cblx0Ly8gTWFrZSBzdXJlIHRleHQgYmVnaW5zIGFuZCBlbmRzIHdpdGggYSBjb3VwbGUgb2YgbmV3bGluZXM6XG5cdHRleHQgPSBcIlxcblxcblwiICsgdGV4dCArIFwiXFxuXFxuXCI7XG5cblx0Ly8gQ29udmVydCBhbGwgdGFicyB0byBzcGFjZXMuXG5cdHRleHQgPSBfRGV0YWIodGV4dCk7XG5cblx0Ly8gU3RyaXAgYW55IGxpbmVzIGNvbnNpc3Rpbmcgb25seSBvZiBzcGFjZXMgYW5kIHRhYnMuXG5cdC8vIFRoaXMgbWFrZXMgc3Vic2VxdWVudCByZWdleGVuIGVhc2llciB0byB3cml0ZSwgYmVjYXVzZSB3ZSBjYW5cblx0Ly8gbWF0Y2ggY29uc2VjdXRpdmUgYmxhbmsgbGluZXMgd2l0aCAvXFxuKy8gaW5zdGVhZCBvZiBzb21ldGhpbmdcblx0Ly8gY29udG9ydGVkIGxpa2UgL1sgXFx0XSpcXG4rLyAuXG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoL15bIFxcdF0rJC9tZyxcIlwiKTtcblxuXHQvLyBSdW4gbGFuZ3VhZ2UgZXh0ZW5zaW9uc1xuXHRTaG93ZG93bi5mb3JFYWNoKGdfbGFuZ19leHRlbnNpb25zLCBmdW5jdGlvbih4KXtcblx0XHR0ZXh0ID0gX0V4ZWN1dGVFeHRlbnNpb24oeCwgdGV4dCk7XG5cdH0pO1xuXG5cdC8vIEhhbmRsZSBnaXRodWIgY29kZWJsb2NrcyBwcmlvciB0byBydW5uaW5nIEhhc2hIVE1MIHNvIHRoYXRcblx0Ly8gSFRNTCBjb250YWluZWQgd2l0aGluIHRoZSBjb2RlYmxvY2sgZ2V0cyBlc2NhcGVkIHByb3BlcnRseVxuXHR0ZXh0ID0gX0RvR2l0aHViQ29kZUJsb2Nrcyh0ZXh0KTtcblxuXHQvLyBUdXJuIGJsb2NrLWxldmVsIEhUTUwgYmxvY2tzIGludG8gaGFzaCBlbnRyaWVzXG5cdHRleHQgPSBfSGFzaEhUTUxCbG9ja3ModGV4dCk7XG5cblx0Ly8gU3RyaXAgbGluayBkZWZpbml0aW9ucywgc3RvcmUgaW4gaGFzaGVzLlxuXHR0ZXh0ID0gX1N0cmlwTGlua0RlZmluaXRpb25zKHRleHQpO1xuXG5cdHRleHQgPSBfUnVuQmxvY2tHYW11dCh0ZXh0KTtcblxuXHR0ZXh0ID0gX1VuZXNjYXBlU3BlY2lhbENoYXJzKHRleHQpO1xuXG5cdC8vIGF0dGFja2xhYjogUmVzdG9yZSBkb2xsYXIgc2lnbnNcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvfkQvZyxcIiQkXCIpO1xuXG5cdC8vIGF0dGFja2xhYjogUmVzdG9yZSB0aWxkZXNcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvflQvZyxcIn5cIik7XG5cblx0Ly8gUnVuIG91dHB1dCBtb2RpZmllcnNcblx0U2hvd2Rvd24uZm9yRWFjaChnX291dHB1dF9tb2RpZmllcnMsIGZ1bmN0aW9uKHgpe1xuXHRcdHRleHQgPSBfRXhlY3V0ZUV4dGVuc2lvbih4LCB0ZXh0KTtcblx0fSk7XG5cblx0cmV0dXJuIHRleHQ7XG59O1xuLy9cbi8vIE9wdGlvbnM6XG4vL1xuXG4vLyBQYXJzZSBleHRlbnNpb25zIG9wdGlvbnMgaW50byBzZXBhcmF0ZSBhcnJheXNcbmlmIChjb252ZXJ0ZXJfb3B0aW9ucyAmJiBjb252ZXJ0ZXJfb3B0aW9ucy5leHRlbnNpb25zKSB7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG5cdC8vIEl0ZXJhdGUgb3ZlciBlYWNoIHBsdWdpblxuXHRTaG93ZG93bi5mb3JFYWNoKGNvbnZlcnRlcl9vcHRpb25zLmV4dGVuc2lvbnMsIGZ1bmN0aW9uKHBsdWdpbil7XG5cblx0XHQvLyBBc3N1bWUgaXQncyBhIGJ1bmRsZWQgcGx1Z2luIGlmIGEgc3RyaW5nIGlzIGdpdmVuXG5cdFx0aWYgKHR5cGVvZiBwbHVnaW4gPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRwbHVnaW4gPSBTaG93ZG93bi5leHRlbnNpb25zW3N0ZEV4dE5hbWUocGx1Z2luKV07XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBwbHVnaW4gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdC8vIEl0ZXJhdGUgb3ZlciBlYWNoIGV4dGVuc2lvbiB3aXRoaW4gdGhhdCBwbHVnaW5cblx0XHRcdFNob3dkb3duLmZvckVhY2gocGx1Z2luKHNlbGYpLCBmdW5jdGlvbihleHQpe1xuXHRcdFx0XHQvLyBTb3J0IGV4dGVuc2lvbnMgYnkgdHlwZVxuXHRcdFx0XHRpZiAoZXh0LnR5cGUpIHtcblx0XHRcdFx0XHRpZiAoZXh0LnR5cGUgPT09ICdsYW5ndWFnZScgfHwgZXh0LnR5cGUgPT09ICdsYW5nJykge1xuXHRcdFx0XHRcdFx0Z19sYW5nX2V4dGVuc2lvbnMucHVzaChleHQpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoZXh0LnR5cGUgPT09ICdvdXRwdXQnIHx8IGV4dC50eXBlID09PSAnaHRtbCcpIHtcblx0XHRcdFx0XHRcdGdfb3V0cHV0X21vZGlmaWVycy5wdXNoKGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIEFzc3VtZSBsYW5ndWFnZSBleHRlbnNpb25cblx0XHRcdFx0XHRnX291dHB1dF9tb2RpZmllcnMucHVzaChleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgXCJFeHRlbnNpb24gJ1wiICsgcGx1Z2luICsgXCInIGNvdWxkIG5vdCBiZSBsb2FkZWQuICBJdCB3YXMgZWl0aGVyIG5vdCBmb3VuZCBvciBpcyBub3QgYSB2YWxpZCBleHRlbnNpb24uXCI7XG5cdFx0fVxuXHR9KTtcbn1cblxuXG52YXIgX0V4ZWN1dGVFeHRlbnNpb24gPSBmdW5jdGlvbihleHQsIHRleHQpIHtcblx0aWYgKGV4dC5yZWdleCkge1xuXHRcdHZhciByZSA9IG5ldyBSZWdFeHAoZXh0LnJlZ2V4LCAnZycpO1xuXHRcdHJldHVybiB0ZXh0LnJlcGxhY2UocmUsIGV4dC5yZXBsYWNlKTtcblx0fSBlbHNlIGlmIChleHQuZmlsdGVyKSB7XG5cdFx0cmV0dXJuIGV4dC5maWx0ZXIodGV4dCk7XG5cdH1cbn07XG5cbnZhciBfU3RyaXBMaW5rRGVmaW5pdGlvbnMgPSBmdW5jdGlvbih0ZXh0KSB7XG4vL1xuLy8gU3RyaXBzIGxpbmsgZGVmaW5pdGlvbnMgZnJvbSB0ZXh0LCBzdG9yZXMgdGhlIFVSTHMgYW5kIHRpdGxlcyBpblxuLy8gaGFzaCByZWZlcmVuY2VzLlxuLy9cblxuXHQvLyBMaW5rIGRlZnMgYXJlIGluIHRoZSBmb3JtOiBeW2lkXTogdXJsIFwib3B0aW9uYWwgdGl0bGVcIlxuXG5cdC8qXG5cdFx0dmFyIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xuXHRcdFx0XHReWyBdezAsM31cXFsoLispXFxdOiAgLy8gaWQgPSAkMSAgYXR0YWNrbGFiOiBnX3RhYl93aWR0aCAtIDFcblx0XHRcdFx0ICBbIFxcdF0qXG5cdFx0XHRcdCAgXFxuP1x0XHRcdFx0Ly8gbWF5YmUgKm9uZSogbmV3bGluZVxuXHRcdFx0XHQgIFsgXFx0XSpcblx0XHRcdFx0PD8oXFxTKz8pPj9cdFx0XHQvLyB1cmwgPSAkMlxuXHRcdFx0XHQgIFsgXFx0XSpcblx0XHRcdFx0ICBcXG4/XHRcdFx0XHQvLyBtYXliZSBvbmUgbmV3bGluZVxuXHRcdFx0XHQgIFsgXFx0XSpcblx0XHRcdFx0KD86XG5cdFx0XHRcdCAgKFxcbiopXHRcdFx0XHQvLyBhbnkgbGluZXMgc2tpcHBlZCA9ICQzIGF0dGFja2xhYjogbG9va2JlaGluZCByZW1vdmVkXG5cdFx0XHRcdCAgW1wiKF1cblx0XHRcdFx0ICAoLis/KVx0XHRcdFx0Ly8gdGl0bGUgPSAkNFxuXHRcdFx0XHQgIFtcIildXG5cdFx0XHRcdCAgWyBcXHRdKlxuXHRcdFx0XHQpP1x0XHRcdFx0XHQvLyB0aXRsZSBpcyBvcHRpb25hbFxuXHRcdFx0XHQoPzpcXG4rfCQpXG5cdFx0XHQgIC9nbSxcblx0XHRcdCAgZnVuY3Rpb24oKXsuLi59KTtcblx0Ki9cblxuXHQvLyBhdHRhY2tsYWI6IHNlbnRpbmVsIHdvcmthcm91bmRzIGZvciBsYWNrIG9mIFxcQSBhbmQgXFxaLCBzYWZhcmlcXGtodG1sIGJ1Z1xuXHR0ZXh0ICs9IFwifjBcIjtcblxuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eWyBdezAsM31cXFsoLispXFxdOlsgXFx0XSpcXG4/WyBcXHRdKjw/KFxcUys/KT4/WyBcXHRdKlxcbj9bIFxcdF0qKD86KFxcbiopW1wiKF0oLis/KVtcIildWyBcXHRdKik/KD86XFxuK3woPz1+MCkpL2dtLFxuXHRcdGZ1bmN0aW9uICh3aG9sZU1hdGNoLG0xLG0yLG0zLG00KSB7XG5cdFx0XHRtMSA9IG0xLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRnX3VybHNbbTFdID0gX0VuY29kZUFtcHNBbmRBbmdsZXMobTIpOyAgLy8gTGluayBJRHMgYXJlIGNhc2UtaW5zZW5zaXRpdmVcblx0XHRcdGlmIChtMykge1xuXHRcdFx0XHQvLyBPb3BzLCBmb3VuZCBibGFuayBsaW5lcywgc28gaXQncyBub3QgYSB0aXRsZS5cblx0XHRcdFx0Ly8gUHV0IGJhY2sgdGhlIHBhcmVudGhldGljYWwgc3RhdGVtZW50IHdlIHN0b2xlLlxuXHRcdFx0XHRyZXR1cm4gbTMrbTQ7XG5cdFx0XHR9IGVsc2UgaWYgKG00KSB7XG5cdFx0XHRcdGdfdGl0bGVzW20xXSA9IG00LnJlcGxhY2UoL1wiL2csXCImcXVvdDtcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENvbXBsZXRlbHkgcmVtb3ZlIHRoZSBkZWZpbml0aW9uIGZyb20gdGhlIHRleHRcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0KTtcblxuXHQvLyBhdHRhY2tsYWI6IHN0cmlwIHNlbnRpbmVsXG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoL34wLyxcIlwiKTtcblxuXHRyZXR1cm4gdGV4dDtcbn1cblxuXG52YXIgX0hhc2hIVE1MQmxvY2tzID0gZnVuY3Rpb24odGV4dCkge1xuXHQvLyBhdHRhY2tsYWI6IERvdWJsZSB1cCBibGFuayBsaW5lcyB0byByZWR1Y2UgbG9va2Fyb3VuZFxuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXG4vZyxcIlxcblxcblwiKTtcblxuXHQvLyBIYXNoaWZ5IEhUTUwgYmxvY2tzOlxuXHQvLyBXZSBvbmx5IHdhbnQgdG8gZG8gdGhpcyBmb3IgYmxvY2stbGV2ZWwgSFRNTCB0YWdzLCBzdWNoIGFzIGhlYWRlcnMsXG5cdC8vIGxpc3RzLCBhbmQgdGFibGVzLiBUaGF0J3MgYmVjYXVzZSB3ZSBzdGlsbCB3YW50IHRvIHdyYXAgPHA+cyBhcm91bmRcblx0Ly8gXCJwYXJhZ3JhcGhzXCIgdGhhdCBhcmUgd3JhcHBlZCBpbiBub24tYmxvY2stbGV2ZWwgdGFncywgc3VjaCBhcyBhbmNob3JzLFxuXHQvLyBwaHJhc2UgZW1waGFzaXMsIGFuZCBzcGFucy4gVGhlIGxpc3Qgb2YgdGFncyB3ZSdyZSBsb29raW5nIGZvciBpc1xuXHQvLyBoYXJkLWNvZGVkOlxuXHR2YXIgYmxvY2tfdGFnc19hID0gXCJwfGRpdnxoWzEtNl18YmxvY2txdW90ZXxwcmV8dGFibGV8ZGx8b2x8dWx8c2NyaXB0fG5vc2NyaXB0fGZvcm18ZmllbGRzZXR8aWZyYW1lfG1hdGh8aW5zfGRlbHxzdHlsZXxzZWN0aW9ufGhlYWRlcnxmb290ZXJ8bmF2fGFydGljbGV8YXNpZGVcIjtcblx0dmFyIGJsb2NrX3RhZ3NfYiA9IFwicHxkaXZ8aFsxLTZdfGJsb2NrcXVvdGV8cHJlfHRhYmxlfGRsfG9sfHVsfHNjcmlwdHxub3NjcmlwdHxmb3JtfGZpZWxkc2V0fGlmcmFtZXxtYXRofHN0eWxlfHNlY3Rpb258aGVhZGVyfGZvb3RlcnxuYXZ8YXJ0aWNsZXxhc2lkZVwiO1xuXG5cdC8vIEZpcnN0LCBsb29rIGZvciBuZXN0ZWQgYmxvY2tzLCBlLmcuOlxuXHQvLyAgIDxkaXY+XG5cdC8vICAgICA8ZGl2PlxuXHQvLyAgICAgdGFncyBmb3IgaW5uZXIgYmxvY2sgbXVzdCBiZSBpbmRlbnRlZC5cblx0Ly8gICAgIDwvZGl2PlxuXHQvLyAgIDwvZGl2PlxuXHQvL1xuXHQvLyBUaGUgb3V0ZXJtb3N0IHRhZ3MgbXVzdCBzdGFydCBhdCB0aGUgbGVmdCBtYXJnaW4gZm9yIHRoaXMgdG8gbWF0Y2gsIGFuZFxuXHQvLyB0aGUgaW5uZXIgbmVzdGVkIGRpdnMgbXVzdCBiZSBpbmRlbnRlZC5cblx0Ly8gV2UgbmVlZCB0byBkbyB0aGlzIGJlZm9yZSB0aGUgbmV4dCwgbW9yZSBsaWJlcmFsIG1hdGNoLCBiZWNhdXNlIHRoZSBuZXh0XG5cdC8vIG1hdGNoIHdpbGwgc3RhcnQgYXQgdGhlIGZpcnN0IGA8ZGl2PmAgYW5kIHN0b3AgYXQgdGhlIGZpcnN0IGA8L2Rpdj5gLlxuXG5cdC8vIGF0dGFja2xhYjogVGhpcyByZWdleCBjYW4gYmUgZXhwZW5zaXZlIHdoZW4gaXQgZmFpbHMuXG5cdC8qXG5cdFx0dmFyIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xuXHRcdChcdFx0XHRcdFx0XHQvLyBzYXZlIGluICQxXG5cdFx0XHReXHRcdFx0XHRcdC8vIHN0YXJ0IG9mIGxpbmUgICh3aXRoIC9tKVxuXHRcdFx0PCgkYmxvY2tfdGFnc19hKVx0Ly8gc3RhcnQgdGFnID0gJDJcblx0XHRcdFxcYlx0XHRcdFx0XHQvLyB3b3JkIGJyZWFrXG5cdFx0XHRcdFx0XHRcdFx0Ly8gYXR0YWNrbGFiOiBoYWNrIGFyb3VuZCBraHRtbC9wY3JlIGJ1Zy4uLlxuXHRcdFx0W15cXHJdKj9cXG5cdFx0XHQvLyBhbnkgbnVtYmVyIG9mIGxpbmVzLCBtaW5pbWFsbHkgbWF0Y2hpbmdcblx0XHRcdDwvXFwyPlx0XHRcdFx0Ly8gdGhlIG1hdGNoaW5nIGVuZCB0YWdcblx0XHRcdFsgXFx0XSpcdFx0XHRcdC8vIHRyYWlsaW5nIHNwYWNlcy90YWJzXG5cdFx0XHQoPz1cXG4rKVx0XHRcdFx0Ly8gZm9sbG93ZWQgYnkgYSBuZXdsaW5lXG5cdFx0KVx0XHRcdFx0XHRcdC8vIGF0dGFja2xhYjogdGhlcmUgYXJlIHNlbnRpbmVsIG5ld2xpbmVzIGF0IGVuZCBvZiBkb2N1bWVudFxuXHRcdC9nbSxmdW5jdGlvbigpey4uLn19O1xuXHQqL1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eKDwocHxkaXZ8aFsxLTZdfGJsb2NrcXVvdGV8cHJlfHRhYmxlfGRsfG9sfHVsfHNjcmlwdHxub3NjcmlwdHxmb3JtfGZpZWxkc2V0fGlmcmFtZXxtYXRofGluc3xkZWwpXFxiW15cXHJdKj9cXG48XFwvXFwyPlsgXFx0XSooPz1cXG4rKSkvZ20saGFzaEVsZW1lbnQpO1xuXG5cdC8vXG5cdC8vIE5vdyBtYXRjaCBtb3JlIGxpYmVyYWxseSwgc2ltcGx5IGZyb20gYFxcbjx0YWc+YCB0byBgPC90YWc+XFxuYFxuXHQvL1xuXG5cdC8qXG5cdFx0dmFyIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xuXHRcdChcdFx0XHRcdFx0XHQvLyBzYXZlIGluICQxXG5cdFx0XHReXHRcdFx0XHRcdC8vIHN0YXJ0IG9mIGxpbmUgICh3aXRoIC9tKVxuXHRcdFx0PCgkYmxvY2tfdGFnc19iKVx0Ly8gc3RhcnQgdGFnID0gJDJcblx0XHRcdFxcYlx0XHRcdFx0XHQvLyB3b3JkIGJyZWFrXG5cdFx0XHRcdFx0XHRcdFx0Ly8gYXR0YWNrbGFiOiBoYWNrIGFyb3VuZCBraHRtbC9wY3JlIGJ1Zy4uLlxuXHRcdFx0W15cXHJdKj9cdFx0XHRcdC8vIGFueSBudW1iZXIgb2YgbGluZXMsIG1pbmltYWxseSBtYXRjaGluZ1xuXHRcdFx0PC9cXDI+XHRcdFx0XHQvLyB0aGUgbWF0Y2hpbmcgZW5kIHRhZ1xuXHRcdFx0WyBcXHRdKlx0XHRcdFx0Ly8gdHJhaWxpbmcgc3BhY2VzL3RhYnNcblx0XHRcdCg/PVxcbispXHRcdFx0XHQvLyBmb2xsb3dlZCBieSBhIG5ld2xpbmVcblx0XHQpXHRcdFx0XHRcdFx0Ly8gYXR0YWNrbGFiOiB0aGVyZSBhcmUgc2VudGluZWwgbmV3bGluZXMgYXQgZW5kIG9mIGRvY3VtZW50XG5cdFx0L2dtLGZ1bmN0aW9uKCl7Li4ufX07XG5cdCovXG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoL14oPChwfGRpdnxoWzEtNl18YmxvY2txdW90ZXxwcmV8dGFibGV8ZGx8b2x8dWx8c2NyaXB0fG5vc2NyaXB0fGZvcm18ZmllbGRzZXR8aWZyYW1lfG1hdGh8c3R5bGV8c2VjdGlvbnxoZWFkZXJ8Zm9vdGVyfG5hdnxhcnRpY2xlfGFzaWRlKVxcYlteXFxyXSo/PFxcL1xcMj5bIFxcdF0qKD89XFxuKylcXG4pL2dtLGhhc2hFbGVtZW50KTtcblxuXHQvLyBTcGVjaWFsIGNhc2UganVzdCBmb3IgPGhyIC8+LiBJdCB3YXMgZWFzaWVyIHRvIG1ha2UgYSBzcGVjaWFsIGNhc2UgdGhhblxuXHQvLyB0byBtYWtlIHRoZSBvdGhlciByZWdleCBtb3JlIGNvbXBsaWNhdGVkLlxuXG5cdC8qXG5cdFx0dGV4dCA9IHRleHQucmVwbGFjZSgvXG5cdFx0KFx0XHRcdFx0XHRcdC8vIHNhdmUgaW4gJDFcblx0XHRcdFxcblxcblx0XHRcdFx0Ly8gU3RhcnRpbmcgYWZ0ZXIgYSBibGFuayBsaW5lXG5cdFx0XHRbIF17MCwzfVxuXHRcdFx0KDwoaHIpXHRcdFx0XHQvLyBzdGFydCB0YWcgPSAkMlxuXHRcdFx0XFxiXHRcdFx0XHRcdC8vIHdvcmQgYnJlYWtcblx0XHRcdChbXjw+XSkqP1x0XHRcdC8vXG5cdFx0XHRcXC8/PilcdFx0XHRcdC8vIHRoZSBtYXRjaGluZyBlbmQgdGFnXG5cdFx0XHRbIFxcdF0qXG5cdFx0XHQoPz1cXG57Mix9KVx0XHRcdC8vIGZvbGxvd2VkIGJ5IGEgYmxhbmsgbGluZVxuXHRcdClcblx0XHQvZyxoYXNoRWxlbWVudCk7XG5cdCovXG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXG5bIF17MCwzfSg8KGhyKVxcYihbXjw+XSkqP1xcLz8+KVsgXFx0XSooPz1cXG57Mix9KSkvZyxoYXNoRWxlbWVudCk7XG5cblx0Ly8gU3BlY2lhbCBjYXNlIGZvciBzdGFuZGFsb25lIEhUTUwgY29tbWVudHM6XG5cblx0Lypcblx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cblx0XHQoXHRcdFx0XHRcdFx0Ly8gc2F2ZSBpbiAkMVxuXHRcdFx0XFxuXFxuXHRcdFx0XHQvLyBTdGFydGluZyBhZnRlciBhIGJsYW5rIGxpbmVcblx0XHRcdFsgXXswLDN9XHRcdFx0Ly8gYXR0YWNrbGFiOiBnX3RhYl93aWR0aCAtIDFcblx0XHRcdDwhXG5cdFx0XHQoLS1bXlxccl0qPy0tXFxzKikrXG5cdFx0XHQ+XG5cdFx0XHRbIFxcdF0qXG5cdFx0XHQoPz1cXG57Mix9KVx0XHRcdC8vIGZvbGxvd2VkIGJ5IGEgYmxhbmsgbGluZVxuXHRcdClcblx0XHQvZyxoYXNoRWxlbWVudCk7XG5cdCovXG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXG5cXG5bIF17MCwzfTwhKC0tW15cXHJdKj8tLVxccyopKz5bIFxcdF0qKD89XFxuezIsfSkpL2csaGFzaEVsZW1lbnQpO1xuXG5cdC8vIFBIUCBhbmQgQVNQLXN0eWxlIHByb2Nlc3NvciBpbnN0cnVjdGlvbnMgKDw/Li4uPz4gYW5kIDwlLi4uJT4pXG5cblx0Lypcblx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cblx0XHQoPzpcblx0XHRcdFxcblxcblx0XHRcdFx0Ly8gU3RhcnRpbmcgYWZ0ZXIgYSBibGFuayBsaW5lXG5cdFx0KVxuXHRcdChcdFx0XHRcdFx0XHQvLyBzYXZlIGluICQxXG5cdFx0XHRbIF17MCwzfVx0XHRcdC8vIGF0dGFja2xhYjogZ190YWJfd2lkdGggLSAxXG5cdFx0XHQoPzpcblx0XHRcdFx0PChbPyVdKVx0XHRcdC8vICQyXG5cdFx0XHRcdFteXFxyXSo/XG5cdFx0XHRcdFxcMj5cblx0XHRcdClcblx0XHRcdFsgXFx0XSpcblx0XHRcdCg/PVxcbnsyLH0pXHRcdFx0Ly8gZm9sbG93ZWQgYnkgYSBibGFuayBsaW5lXG5cdFx0KVxuXHRcdC9nLGhhc2hFbGVtZW50KTtcblx0Ki9cblx0dGV4dCA9IHRleHQucmVwbGFjZSgvKD86XFxuXFxuKShbIF17MCwzfSg/OjwoWz8lXSlbXlxccl0qP1xcMj4pWyBcXHRdKig/PVxcbnsyLH0pKS9nLGhhc2hFbGVtZW50KTtcblxuXHQvLyBhdHRhY2tsYWI6IFVuZG8gZG91YmxlIGxpbmVzIChzZWUgY29tbWVudCBhdCB0b3Agb2YgdGhpcyBmdW5jdGlvbilcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvXFxuXFxuL2csXCJcXG5cIik7XG5cdHJldHVybiB0ZXh0O1xufVxuXG52YXIgaGFzaEVsZW1lbnQgPSBmdW5jdGlvbih3aG9sZU1hdGNoLG0xKSB7XG5cdHZhciBibG9ja1RleHQgPSBtMTtcblxuXHQvLyBVbmRvIGRvdWJsZSBsaW5lc1xuXHRibG9ja1RleHQgPSBibG9ja1RleHQucmVwbGFjZSgvXFxuXFxuL2csXCJcXG5cIik7XG5cdGJsb2NrVGV4dCA9IGJsb2NrVGV4dC5yZXBsYWNlKC9eXFxuLyxcIlwiKTtcblxuXHQvLyBzdHJpcCB0cmFpbGluZyBibGFuayBsaW5lc1xuXHRibG9ja1RleHQgPSBibG9ja1RleHQucmVwbGFjZSgvXFxuKyQvZyxcIlwiKTtcblxuXHQvLyBSZXBsYWNlIHRoZSBlbGVtZW50IHRleHQgd2l0aCBhIG1hcmtlciAoXCJ+S3hLXCIgd2hlcmUgeCBpcyBpdHMga2V5KVxuXHRibG9ja1RleHQgPSBcIlxcblxcbn5LXCIgKyAoZ19odG1sX2Jsb2Nrcy5wdXNoKGJsb2NrVGV4dCktMSkgKyBcIktcXG5cXG5cIjtcblxuXHRyZXR1cm4gYmxvY2tUZXh0O1xufTtcblxudmFyIF9SdW5CbG9ja0dhbXV0ID0gZnVuY3Rpb24odGV4dCkge1xuLy9cbi8vIFRoZXNlIGFyZSBhbGwgdGhlIHRyYW5zZm9ybWF0aW9ucyB0aGF0IGZvcm0gYmxvY2stbGV2ZWxcbi8vIHRhZ3MgbGlrZSBwYXJhZ3JhcGhzLCBoZWFkZXJzLCBhbmQgbGlzdCBpdGVtcy5cbi8vXG5cdHRleHQgPSBfRG9IZWFkZXJzKHRleHQpO1xuXG5cdC8vIERvIEhvcml6b250YWwgUnVsZXM6XG5cdHZhciBrZXkgPSBoYXNoQmxvY2soXCI8aHIgLz5cIik7XG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoL15bIF17MCwyfShbIF0/XFwqWyBdPyl7Myx9WyBcXHRdKiQvZ20sa2V5KTtcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvXlsgXXswLDJ9KFsgXT9cXC1bIF0/KXszLH1bIFxcdF0qJC9nbSxrZXkpO1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eWyBdezAsMn0oWyBdP1xcX1sgXT8pezMsfVsgXFx0XSokL2dtLGtleSk7XG5cblx0dGV4dCA9IF9Eb0xpc3RzKHRleHQpO1xuXHR0ZXh0ID0gX0RvQ29kZUJsb2Nrcyh0ZXh0KTtcblx0dGV4dCA9IF9Eb0Jsb2NrUXVvdGVzKHRleHQpO1xuXG5cdC8vIFdlIGFscmVhZHkgcmFuIF9IYXNoSFRNTEJsb2NrcygpIGJlZm9yZSwgaW4gTWFya2Rvd24oKSwgYnV0IHRoYXRcblx0Ly8gd2FzIHRvIGVzY2FwZSByYXcgSFRNTCBpbiB0aGUgb3JpZ2luYWwgTWFya2Rvd24gc291cmNlLiBUaGlzIHRpbWUsXG5cdC8vIHdlJ3JlIGVzY2FwaW5nIHRoZSBtYXJrdXAgd2UndmUganVzdCBjcmVhdGVkLCBzbyB0aGF0IHdlIGRvbid0IHdyYXBcblx0Ly8gPHA+IHRhZ3MgYXJvdW5kIGJsb2NrLWxldmVsIHRhZ3MuXG5cdHRleHQgPSBfSGFzaEhUTUxCbG9ja3ModGV4dCk7XG5cdHRleHQgPSBfRm9ybVBhcmFncmFwaHModGV4dCk7XG5cblx0cmV0dXJuIHRleHQ7XG59O1xuXG5cbnZhciBfUnVuU3BhbkdhbXV0ID0gZnVuY3Rpb24odGV4dCkge1xuLy9cbi8vIFRoZXNlIGFyZSBhbGwgdGhlIHRyYW5zZm9ybWF0aW9ucyB0aGF0IG9jY3VyICp3aXRoaW4qIGJsb2NrLWxldmVsXG4vLyB0YWdzIGxpa2UgcGFyYWdyYXBocywgaGVhZGVycywgYW5kIGxpc3QgaXRlbXMuXG4vL1xuXG5cdHRleHQgPSBfRG9Db2RlU3BhbnModGV4dCk7XG5cdHRleHQgPSBfRXNjYXBlU3BlY2lhbENoYXJzV2l0aGluVGFnQXR0cmlidXRlcyh0ZXh0KTtcblx0dGV4dCA9IF9FbmNvZGVCYWNrc2xhc2hFc2NhcGVzKHRleHQpO1xuXG5cdC8vIFByb2Nlc3MgYW5jaG9yIGFuZCBpbWFnZSB0YWdzLiBJbWFnZXMgbXVzdCBjb21lIGZpcnN0LFxuXHQvLyBiZWNhdXNlICFbZm9vXVtmXSBsb29rcyBsaWtlIGFuIGFuY2hvci5cblx0dGV4dCA9IF9Eb0ltYWdlcyh0ZXh0KTtcblx0dGV4dCA9IF9Eb0FuY2hvcnModGV4dCk7XG5cblx0Ly8gTWFrZSBsaW5rcyBvdXQgb2YgdGhpbmdzIGxpa2UgYDxodHRwOi8vZXhhbXBsZS5jb20vPmBcblx0Ly8gTXVzdCBjb21lIGFmdGVyIF9Eb0FuY2hvcnMoKSwgYmVjYXVzZSB5b3UgY2FuIHVzZSA8IGFuZCA+XG5cdC8vIGRlbGltaXRlcnMgaW4gaW5saW5lIGxpbmtzIGxpa2UgW3RoaXNdKDx1cmw+KS5cblx0dGV4dCA9IF9Eb0F1dG9MaW5rcyh0ZXh0KTtcblx0dGV4dCA9IF9FbmNvZGVBbXBzQW5kQW5nbGVzKHRleHQpO1xuXHR0ZXh0ID0gX0RvSXRhbGljc0FuZEJvbGQodGV4dCk7XG5cblx0Ly8gRG8gaGFyZCBicmVha3M6XG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoLyAgK1xcbi9nLFwiIDxiciAvPlxcblwiKTtcblxuXHRyZXR1cm4gdGV4dDtcbn1cblxudmFyIF9Fc2NhcGVTcGVjaWFsQ2hhcnNXaXRoaW5UYWdBdHRyaWJ1dGVzID0gZnVuY3Rpb24odGV4dCkge1xuLy9cbi8vIFdpdGhpbiB0YWdzIC0tIG1lYW5pbmcgYmV0d2VlbiA8IGFuZCA+IC0tIGVuY29kZSBbXFwgYCAqIF9dIHNvIHRoZXlcbi8vIGRvbid0IGNvbmZsaWN0IHdpdGggdGhlaXIgdXNlIGluIE1hcmtkb3duIGZvciBjb2RlLCBpdGFsaWNzIGFuZCBzdHJvbmcuXG4vL1xuXG5cdC8vIEJ1aWxkIGEgcmVnZXggdG8gZmluZCBIVE1MIHRhZ3MgYW5kIGNvbW1lbnRzLiAgU2VlIEZyaWVkbCdzXG5cdC8vIFwiTWFzdGVyaW5nIFJlZ3VsYXIgRXhwcmVzc2lvbnNcIiwgMm5kIEVkLiwgcHAuIDIwMC0yMDEuXG5cdHZhciByZWdleCA9IC8oPFthLXpcXC8hJF0oXCJbXlwiXSpcInwnW14nXSonfFteJ1wiPl0pKj58PCEoLS0uKj8tLVxccyopKz4pL2dpO1xuXG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIGZ1bmN0aW9uKHdob2xlTWF0Y2gpIHtcblx0XHR2YXIgdGFnID0gd2hvbGVNYXRjaC5yZXBsYWNlKC8oLik8XFwvP2NvZGU+KD89LikvZyxcIiQxYFwiKTtcblx0XHR0YWcgPSBlc2NhcGVDaGFyYWN0ZXJzKHRhZyxcIlxcXFxgKl9cIik7XG5cdFx0cmV0dXJuIHRhZztcblx0fSk7XG5cblx0cmV0dXJuIHRleHQ7XG59XG5cbnZhciBfRG9BbmNob3JzID0gZnVuY3Rpb24odGV4dCkge1xuLy9cbi8vIFR1cm4gTWFya2Rvd24gbGluayBzaG9ydGN1dHMgaW50byBYSFRNTCA8YT4gdGFncy5cbi8vXG5cdC8vXG5cdC8vIEZpcnN0LCBoYW5kbGUgcmVmZXJlbmNlLXN0eWxlIGxpbmtzOiBbbGluayB0ZXh0XSBbaWRdXG5cdC8vXG5cblx0Lypcblx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cblx0XHQoXHRcdFx0XHRcdFx0XHQvLyB3cmFwIHdob2xlIG1hdGNoIGluICQxXG5cdFx0XHRcXFtcblx0XHRcdChcblx0XHRcdFx0KD86XG5cdFx0XHRcdFx0XFxbW15cXF1dKlxcXVx0XHQvLyBhbGxvdyBicmFja2V0cyBuZXN0ZWQgb25lIGxldmVsXG5cdFx0XHRcdFx0fFxuXHRcdFx0XHRcdFteXFxbXVx0XHRcdC8vIG9yIGFueXRoaW5nIGVsc2Vcblx0XHRcdFx0KSpcblx0XHRcdClcblx0XHRcdFxcXVxuXG5cdFx0XHRbIF0/XHRcdFx0XHRcdC8vIG9uZSBvcHRpb25hbCBzcGFjZVxuXHRcdFx0KD86XFxuWyBdKik/XHRcdFx0XHQvLyBvbmUgb3B0aW9uYWwgbmV3bGluZSBmb2xsb3dlZCBieSBzcGFjZXNcblxuXHRcdFx0XFxbXG5cdFx0XHQoLio/KVx0XHRcdFx0XHQvLyBpZCA9ICQzXG5cdFx0XHRcXF1cblx0XHQpKCkoKSgpKClcdFx0XHRcdFx0Ly8gcGFkIHJlbWFpbmluZyBiYWNrcmVmZXJlbmNlc1xuXHRcdC9nLF9Eb0FuY2hvcnNfY2FsbGJhY2spO1xuXHQqL1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oXFxbKCg/OlxcW1teXFxdXSpcXF18W15cXFtcXF1dKSopXFxdWyBdPyg/OlxcblsgXSopP1xcWyguKj8pXFxdKSgpKCkoKSgpL2csd3JpdGVBbmNob3JUYWcpO1xuXG5cdC8vXG5cdC8vIE5leHQsIGlubGluZS1zdHlsZSBsaW5rczogW2xpbmsgdGV4dF0odXJsIFwib3B0aW9uYWwgdGl0bGVcIilcblx0Ly9cblxuXHQvKlxuXHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xuXHRcdFx0KFx0XHRcdFx0XHRcdC8vIHdyYXAgd2hvbGUgbWF0Y2ggaW4gJDFcblx0XHRcdFx0XFxbXG5cdFx0XHRcdChcblx0XHRcdFx0XHQoPzpcblx0XHRcdFx0XHRcdFxcW1teXFxdXSpcXF1cdC8vIGFsbG93IGJyYWNrZXRzIG5lc3RlZCBvbmUgbGV2ZWxcblx0XHRcdFx0XHR8XG5cdFx0XHRcdFx0W15cXFtcXF1dXHRcdFx0Ly8gb3IgYW55dGhpbmcgZWxzZVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0XHRcXF1cblx0XHRcdFxcKFx0XHRcdFx0XHRcdC8vIGxpdGVyYWwgcGFyZW5cblx0XHRcdFsgXFx0XSpcblx0XHRcdCgpXHRcdFx0XHRcdFx0Ly8gbm8gaWQsIHNvIGxlYXZlICQzIGVtcHR5XG5cdFx0XHQ8PyguKj8pPj9cdFx0XHRcdC8vIGhyZWYgPSAkNFxuXHRcdFx0WyBcXHRdKlxuXHRcdFx0KFx0XHRcdFx0XHRcdC8vICQ1XG5cdFx0XHRcdChbJ1wiXSlcdFx0XHRcdC8vIHF1b3RlIGNoYXIgPSAkNlxuXHRcdFx0XHQoLio/KVx0XHRcdFx0Ly8gVGl0bGUgPSAkN1xuXHRcdFx0XHRcXDZcdFx0XHRcdFx0Ly8gbWF0Y2hpbmcgcXVvdGVcblx0XHRcdFx0WyBcXHRdKlx0XHRcdFx0Ly8gaWdub3JlIGFueSBzcGFjZXMvdGFicyBiZXR3ZWVuIGNsb3NpbmcgcXVvdGUgYW5kIClcblx0XHRcdCk/XHRcdFx0XHRcdFx0Ly8gdGl0bGUgaXMgb3B0aW9uYWxcblx0XHRcdFxcKVxuXHRcdClcblx0XHQvZyx3cml0ZUFuY2hvclRhZyk7XG5cdCovXG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXFsoKD86XFxbW15cXF1dKlxcXXxbXlxcW1xcXV0pKilcXF1cXChbIFxcdF0qKCk8PyguKj8oPzpcXCguKj9cXCkuKj8pPyk+P1sgXFx0XSooKFsnXCJdKSguKj8pXFw2WyBcXHRdKik/XFwpKS9nLHdyaXRlQW5jaG9yVGFnKTtcblxuXHQvL1xuXHQvLyBMYXN0LCBoYW5kbGUgcmVmZXJlbmNlLXN0eWxlIHNob3J0Y3V0czogW2xpbmsgdGV4dF1cblx0Ly8gVGhlc2UgbXVzdCBjb21lIGxhc3QgaW4gY2FzZSB5b3UndmUgYWxzbyBnb3QgW2xpbmsgdGVzdF1bMV1cblx0Ly8gb3IgW2xpbmsgdGVzdF0oL2Zvbylcblx0Ly9cblxuXHQvKlxuXHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xuXHRcdChcdFx0IFx0XHRcdFx0XHQvLyB3cmFwIHdob2xlIG1hdGNoIGluICQxXG5cdFx0XHRcXFtcblx0XHRcdChbXlxcW1xcXV0rKVx0XHRcdFx0Ly8gbGluayB0ZXh0ID0gJDI7IGNhbid0IGNvbnRhaW4gJ1snIG9yICddJ1xuXHRcdFx0XFxdXG5cdFx0KSgpKCkoKSgpKClcdFx0XHRcdFx0Ly8gcGFkIHJlc3Qgb2YgYmFja3JlZmVyZW5jZXNcblx0XHQvZywgd3JpdGVBbmNob3JUYWcpO1xuXHQqL1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oXFxbKFteXFxbXFxdXSspXFxdKSgpKCkoKSgpKCkvZywgd3JpdGVBbmNob3JUYWcpO1xuXG5cdHJldHVybiB0ZXh0O1xufVxuXG52YXIgd3JpdGVBbmNob3JUYWcgPSBmdW5jdGlvbih3aG9sZU1hdGNoLG0xLG0yLG0zLG00LG01LG02LG03KSB7XG5cdGlmIChtNyA9PSB1bmRlZmluZWQpIG03ID0gXCJcIjtcblx0dmFyIHdob2xlX21hdGNoID0gbTE7XG5cdHZhciBsaW5rX3RleHQgICA9IG0yO1xuXHR2YXIgbGlua19pZFx0ID0gbTMudG9Mb3dlckNhc2UoKTtcblx0dmFyIHVybFx0XHQ9IG00O1xuXHR2YXIgdGl0bGVcdD0gbTc7XG5cblx0aWYgKHVybCA9PSBcIlwiKSB7XG5cdFx0aWYgKGxpbmtfaWQgPT0gXCJcIikge1xuXHRcdFx0Ly8gbG93ZXItY2FzZSBhbmQgdHVybiBlbWJlZGRlZCBuZXdsaW5lcyBpbnRvIHNwYWNlc1xuXHRcdFx0bGlua19pZCA9IGxpbmtfdGV4dC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLyA/XFxuL2csXCIgXCIpO1xuXHRcdH1cblx0XHR1cmwgPSBcIiNcIitsaW5rX2lkO1xuXG5cdFx0aWYgKGdfdXJsc1tsaW5rX2lkXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdHVybCA9IGdfdXJsc1tsaW5rX2lkXTtcblx0XHRcdGlmIChnX3RpdGxlc1tsaW5rX2lkXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dGl0bGUgPSBnX3RpdGxlc1tsaW5rX2lkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAod2hvbGVfbWF0Y2guc2VhcmNoKC9cXChcXHMqXFwpJC9tKT4tMSkge1xuXHRcdFx0XHQvLyBTcGVjaWFsIGNhc2UgZm9yIGV4cGxpY2l0IGVtcHR5IHVybFxuXHRcdFx0XHR1cmwgPSBcIlwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHdob2xlX21hdGNoO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHVybCA9IGVzY2FwZUNoYXJhY3RlcnModXJsLFwiKl9cIik7XG5cdHZhciByZXN1bHQgPSBcIjxhIGhyZWY9XFxcIlwiICsgdXJsICsgXCJcXFwiXCI7XG5cblx0aWYgKHRpdGxlICE9IFwiXCIpIHtcblx0XHR0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL1wiL2csXCImcXVvdDtcIik7XG5cdFx0dGl0bGUgPSBlc2NhcGVDaGFyYWN0ZXJzKHRpdGxlLFwiKl9cIik7XG5cdFx0cmVzdWx0ICs9ICBcIiB0aXRsZT1cXFwiXCIgKyB0aXRsZSArIFwiXFxcIlwiO1xuXHR9XG5cblx0cmVzdWx0ICs9IFwiPlwiICsgbGlua190ZXh0ICsgXCI8L2E+XCI7XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuXG52YXIgX0RvSW1hZ2VzID0gZnVuY3Rpb24odGV4dCkge1xuLy9cbi8vIFR1cm4gTWFya2Rvd24gaW1hZ2Ugc2hvcnRjdXRzIGludG8gPGltZz4gdGFncy5cbi8vXG5cblx0Ly9cblx0Ly8gRmlyc3QsIGhhbmRsZSByZWZlcmVuY2Utc3R5bGUgbGFiZWxlZCBpbWFnZXM6ICFbYWx0IHRleHRdW2lkXVxuXHQvL1xuXG5cdC8qXG5cdFx0dGV4dCA9IHRleHQucmVwbGFjZSgvXG5cdFx0KFx0XHRcdFx0XHRcdC8vIHdyYXAgd2hvbGUgbWF0Y2ggaW4gJDFcblx0XHRcdCFcXFtcblx0XHRcdCguKj8pXHRcdFx0XHQvLyBhbHQgdGV4dCA9ICQyXG5cdFx0XHRcXF1cblxuXHRcdFx0WyBdP1x0XHRcdFx0Ly8gb25lIG9wdGlvbmFsIHNwYWNlXG5cdFx0XHQoPzpcXG5bIF0qKT9cdFx0XHQvLyBvbmUgb3B0aW9uYWwgbmV3bGluZSBmb2xsb3dlZCBieSBzcGFjZXNcblxuXHRcdFx0XFxbXG5cdFx0XHQoLio/KVx0XHRcdFx0Ly8gaWQgPSAkM1xuXHRcdFx0XFxdXG5cdFx0KSgpKCkoKSgpXHRcdFx0XHQvLyBwYWQgcmVzdCBvZiBiYWNrcmVmZXJlbmNlc1xuXHRcdC9nLHdyaXRlSW1hZ2VUYWcpO1xuXHQqL1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oIVxcWyguKj8pXFxdWyBdPyg/OlxcblsgXSopP1xcWyguKj8pXFxdKSgpKCkoKSgpL2csd3JpdGVJbWFnZVRhZyk7XG5cblx0Ly9cblx0Ly8gTmV4dCwgaGFuZGxlIGlubGluZSBpbWFnZXM6ICAhW2FsdCB0ZXh0XSh1cmwgXCJvcHRpb25hbCB0aXRsZVwiKVxuXHQvLyBEb24ndCBmb3JnZXQ6IGVuY29kZSAqIGFuZCBfXG5cblx0Lypcblx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cblx0XHQoXHRcdFx0XHRcdFx0Ly8gd3JhcCB3aG9sZSBtYXRjaCBpbiAkMVxuXHRcdFx0IVxcW1xuXHRcdFx0KC4qPylcdFx0XHRcdC8vIGFsdCB0ZXh0ID0gJDJcblx0XHRcdFxcXVxuXHRcdFx0XFxzP1x0XHRcdFx0XHQvLyBPbmUgb3B0aW9uYWwgd2hpdGVzcGFjZSBjaGFyYWN0ZXJcblx0XHRcdFxcKFx0XHRcdFx0XHQvLyBsaXRlcmFsIHBhcmVuXG5cdFx0XHRbIFxcdF0qXG5cdFx0XHQoKVx0XHRcdFx0XHQvLyBubyBpZCwgc28gbGVhdmUgJDMgZW1wdHlcblx0XHRcdDw/KFxcUys/KT4/XHRcdFx0Ly8gc3JjIHVybCA9ICQ0XG5cdFx0XHRbIFxcdF0qXG5cdFx0XHQoXHRcdFx0XHRcdC8vICQ1XG5cdFx0XHRcdChbJ1wiXSlcdFx0XHQvLyBxdW90ZSBjaGFyID0gJDZcblx0XHRcdFx0KC4qPylcdFx0XHQvLyB0aXRsZSA9ICQ3XG5cdFx0XHRcdFxcNlx0XHRcdFx0Ly8gbWF0Y2hpbmcgcXVvdGVcblx0XHRcdFx0WyBcXHRdKlxuXHRcdFx0KT9cdFx0XHRcdFx0Ly8gdGl0bGUgaXMgb3B0aW9uYWxcblx0XHRcXClcblx0XHQpXG5cdFx0L2csd3JpdGVJbWFnZVRhZyk7XG5cdCovXG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoLyghXFxbKC4qPylcXF1cXHM/XFwoWyBcXHRdKigpPD8oXFxTKz8pPj9bIFxcdF0qKChbJ1wiXSkoLio/KVxcNlsgXFx0XSopP1xcKSkvZyx3cml0ZUltYWdlVGFnKTtcblxuXHRyZXR1cm4gdGV4dDtcbn1cblxudmFyIHdyaXRlSW1hZ2VUYWcgPSBmdW5jdGlvbih3aG9sZU1hdGNoLG0xLG0yLG0zLG00LG01LG02LG03KSB7XG5cdHZhciB3aG9sZV9tYXRjaCA9IG0xO1xuXHR2YXIgYWx0X3RleHQgICA9IG0yO1xuXHR2YXIgbGlua19pZFx0ID0gbTMudG9Mb3dlckNhc2UoKTtcblx0dmFyIHVybFx0XHQ9IG00O1xuXHR2YXIgdGl0bGVcdD0gbTc7XG5cblx0aWYgKCF0aXRsZSkgdGl0bGUgPSBcIlwiO1xuXG5cdGlmICh1cmwgPT0gXCJcIikge1xuXHRcdGlmIChsaW5rX2lkID09IFwiXCIpIHtcblx0XHRcdC8vIGxvd2VyLWNhc2UgYW5kIHR1cm4gZW1iZWRkZWQgbmV3bGluZXMgaW50byBzcGFjZXNcblx0XHRcdGxpbmtfaWQgPSBhbHRfdGV4dC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLyA/XFxuL2csXCIgXCIpO1xuXHRcdH1cblx0XHR1cmwgPSBcIiNcIitsaW5rX2lkO1xuXG5cdFx0aWYgKGdfdXJsc1tsaW5rX2lkXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdHVybCA9IGdfdXJsc1tsaW5rX2lkXTtcblx0XHRcdGlmIChnX3RpdGxlc1tsaW5rX2lkXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dGl0bGUgPSBnX3RpdGxlc1tsaW5rX2lkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gd2hvbGVfbWF0Y2g7XG5cdFx0fVxuXHR9XG5cblx0YWx0X3RleHQgPSBhbHRfdGV4dC5yZXBsYWNlKC9cIi9nLFwiJnF1b3Q7XCIpO1xuXHR1cmwgPSBlc2NhcGVDaGFyYWN0ZXJzKHVybCxcIipfXCIpO1xuXHR2YXIgcmVzdWx0ID0gXCI8aW1nIHNyYz1cXFwiXCIgKyB1cmwgKyBcIlxcXCIgYWx0PVxcXCJcIiArIGFsdF90ZXh0ICsgXCJcXFwiXCI7XG5cblx0Ly8gYXR0YWNrbGFiOiBNYXJrZG93bi5wbCBhZGRzIGVtcHR5IHRpdGxlIGF0dHJpYnV0ZXMgdG8gaW1hZ2VzLlxuXHQvLyBSZXBsaWNhdGUgdGhpcyBidWcuXG5cblx0Ly9pZiAodGl0bGUgIT0gXCJcIikge1xuXHRcdHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXCIvZyxcIiZxdW90O1wiKTtcblx0XHR0aXRsZSA9IGVzY2FwZUNoYXJhY3RlcnModGl0bGUsXCIqX1wiKTtcblx0XHRyZXN1bHQgKz0gIFwiIHRpdGxlPVxcXCJcIiArIHRpdGxlICsgXCJcXFwiXCI7XG5cdC8vfVxuXG5cdHJlc3VsdCArPSBcIiAvPlwiO1xuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cblxudmFyIF9Eb0hlYWRlcnMgPSBmdW5jdGlvbih0ZXh0KSB7XG5cblx0Ly8gU2V0ZXh0LXN0eWxlIGhlYWRlcnM6XG5cdC8vXHRIZWFkZXIgMVxuXHQvL1x0PT09PT09PT1cblx0Ly9cblx0Ly9cdEhlYWRlciAyXG5cdC8vXHQtLS0tLS0tLVxuXHQvL1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eKC4rKVsgXFx0XSpcXG49K1sgXFx0XSpcXG4rL2dtLFxuXHRcdGZ1bmN0aW9uKHdob2xlTWF0Y2gsbTEpe3JldHVybiBoYXNoQmxvY2soJzxoMSBpZD1cIicgKyBoZWFkZXJJZChtMSkgKyAnXCI+JyArIF9SdW5TcGFuR2FtdXQobTEpICsgXCI8L2gxPlwiKTt9KTtcblxuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eKC4rKVsgXFx0XSpcXG4tK1sgXFx0XSpcXG4rL2dtLFxuXHRcdGZ1bmN0aW9uKG1hdGNoRm91bmQsbTEpe3JldHVybiBoYXNoQmxvY2soJzxoMiBpZD1cIicgKyBoZWFkZXJJZChtMSkgKyAnXCI+JyArIF9SdW5TcGFuR2FtdXQobTEpICsgXCI8L2gyPlwiKTt9KTtcblxuXHQvLyBhdHgtc3R5bGUgaGVhZGVyczpcblx0Ly8gICMgSGVhZGVyIDFcblx0Ly8gICMjIEhlYWRlciAyXG5cdC8vICAjIyBIZWFkZXIgMiB3aXRoIGNsb3NpbmcgaGFzaGVzICMjXG5cdC8vICAuLi5cblx0Ly8gICMjIyMjIyBIZWFkZXIgNlxuXHQvL1xuXG5cdC8qXG5cdFx0dGV4dCA9IHRleHQucmVwbGFjZSgvXG5cdFx0XHReKFxcI3sxLDZ9KVx0XHRcdFx0Ly8gJDEgPSBzdHJpbmcgb2YgIydzXG5cdFx0XHRbIFxcdF0qXG5cdFx0XHQoLis/KVx0XHRcdFx0XHQvLyAkMiA9IEhlYWRlciB0ZXh0XG5cdFx0XHRbIFxcdF0qXG5cdFx0XHRcXCMqXHRcdFx0XHRcdFx0Ly8gb3B0aW9uYWwgY2xvc2luZyAjJ3MgKG5vdCBjb3VudGVkKVxuXHRcdFx0XFxuK1xuXHRcdC9nbSwgZnVuY3Rpb24oKSB7Li4ufSk7XG5cdCovXG5cblx0dGV4dCA9IHRleHQucmVwbGFjZSgvXihcXCN7MSw2fSlbIFxcdF0qKC4rPylbIFxcdF0qXFwjKlxcbisvZ20sXG5cdFx0ZnVuY3Rpb24od2hvbGVNYXRjaCxtMSxtMikge1xuXHRcdFx0dmFyIGhfbGV2ZWwgPSBtMS5sZW5ndGg7XG5cdFx0XHRyZXR1cm4gaGFzaEJsb2NrKFwiPGhcIiArIGhfbGV2ZWwgKyAnIGlkPVwiJyArIGhlYWRlcklkKG0yKSArICdcIj4nICsgX1J1blNwYW5HYW11dChtMikgKyBcIjwvaFwiICsgaF9sZXZlbCArIFwiPlwiKTtcblx0XHR9KTtcblxuXHRmdW5jdGlvbiBoZWFkZXJJZChtKSB7XG5cdFx0cmV0dXJuIG0ucmVwbGFjZSgvW15cXHddL2csICcnKS50b0xvd2VyQ2FzZSgpO1xuXHR9XG5cdHJldHVybiB0ZXh0O1xufVxuXG4vLyBUaGlzIGRlY2xhcmF0aW9uIGtlZXBzIERvam8gY29tcHJlc3NvciBmcm9tIG91dHB1dHRpbmcgZ2FyYmFnZTpcbnZhciBfUHJvY2Vzc0xpc3RJdGVtcztcblxudmFyIF9Eb0xpc3RzID0gZnVuY3Rpb24odGV4dCkge1xuLy9cbi8vIEZvcm0gSFRNTCBvcmRlcmVkIChudW1iZXJlZCkgYW5kIHVub3JkZXJlZCAoYnVsbGV0ZWQpIGxpc3RzLlxuLy9cblxuXHQvLyBhdHRhY2tsYWI6IGFkZCBzZW50aW5lbCB0byBoYWNrIGFyb3VuZCBraHRtbC9zYWZhcmkgYnVnOlxuXHQvLyBodHRwOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xMTIzMVxuXHR0ZXh0ICs9IFwifjBcIjtcblxuXHQvLyBSZS11c2FibGUgcGF0dGVybiB0byBtYXRjaCBhbnkgZW50aXJlbCB1bCBvciBvbCBsaXN0OlxuXG5cdC8qXG5cdFx0dmFyIHdob2xlX2xpc3QgPSAvXG5cdFx0KFx0XHRcdFx0XHRcdFx0XHRcdC8vICQxID0gd2hvbGUgbGlzdFxuXHRcdFx0KFx0XHRcdFx0XHRcdFx0XHQvLyAkMlxuXHRcdFx0XHRbIF17MCwzfVx0XHRcdFx0XHQvLyBhdHRhY2tsYWI6IGdfdGFiX3dpZHRoIC0gMVxuXHRcdFx0XHQoWyorLV18XFxkK1suXSlcdFx0XHRcdC8vICQzID0gZmlyc3QgbGlzdCBpdGVtIG1hcmtlclxuXHRcdFx0XHRbIFxcdF0rXG5cdFx0XHQpXG5cdFx0XHRbXlxccl0rP1xuXHRcdFx0KFx0XHRcdFx0XHRcdFx0XHQvLyAkNFxuXHRcdFx0XHR+MFx0XHRcdFx0XHRcdFx0Ly8gc2VudGluZWwgZm9yIHdvcmthcm91bmQ7IHNob3VsZCBiZSAkXG5cdFx0XHR8XG5cdFx0XHRcdFxcbnsyLH1cblx0XHRcdFx0KD89XFxTKVxuXHRcdFx0XHQoPyFcdFx0XHRcdFx0XHRcdC8vIE5lZ2F0aXZlIGxvb2thaGVhZCBmb3IgYW5vdGhlciBsaXN0IGl0ZW0gbWFya2VyXG5cdFx0XHRcdFx0WyBcXHRdKlxuXHRcdFx0XHRcdCg/OlsqKy1dfFxcZCtbLl0pWyBcXHRdK1xuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KS9nXG5cdCovXG5cdHZhciB3aG9sZV9saXN0ID0gL14oKFsgXXswLDN9KFsqKy1dfFxcZCtbLl0pWyBcXHRdKylbXlxccl0rPyh+MHxcXG57Mix9KD89XFxTKSg/IVsgXFx0XSooPzpbKistXXxcXGQrWy5dKVsgXFx0XSspKSkvZ207XG5cblx0aWYgKGdfbGlzdF9sZXZlbCkge1xuXHRcdHRleHQgPSB0ZXh0LnJlcGxhY2Uod2hvbGVfbGlzdCxmdW5jdGlvbih3aG9sZU1hdGNoLG0xLG0yKSB7XG5cdFx0XHR2YXIgbGlzdCA9IG0xO1xuXHRcdFx0dmFyIGxpc3RfdHlwZSA9IChtMi5zZWFyY2goL1sqKy1dL2cpPi0xKSA/IFwidWxcIiA6IFwib2xcIjtcblxuXHRcdFx0Ly8gVHVybiBkb3VibGUgcmV0dXJucyBpbnRvIHRyaXBsZSByZXR1cm5zLCBzbyB0aGF0IHdlIGNhbiBtYWtlIGFcblx0XHRcdC8vIHBhcmFncmFwaCBmb3IgdGhlIGxhc3QgaXRlbSBpbiBhIGxpc3QsIGlmIG5lY2Vzc2FyeTpcblx0XHRcdGxpc3QgPSBsaXN0LnJlcGxhY2UoL1xcbnsyLH0vZyxcIlxcblxcblxcblwiKTs7XG5cdFx0XHR2YXIgcmVzdWx0ID0gX1Byb2Nlc3NMaXN0SXRlbXMobGlzdCk7XG5cblx0XHRcdC8vIFRyaW0gYW55IHRyYWlsaW5nIHdoaXRlc3BhY2UsIHRvIHB1dCB0aGUgY2xvc2luZyBgPC8kbGlzdF90eXBlPmBcblx0XHRcdC8vIHVwIG9uIHRoZSBwcmVjZWRpbmcgbGluZSwgdG8gZ2V0IGl0IHBhc3QgdGhlIGN1cnJlbnQgc3R1cGlkXG5cdFx0XHQvLyBIVE1MIGJsb2NrIHBhcnNlci4gVGhpcyBpcyBhIGhhY2sgdG8gd29yayBhcm91bmQgdGhlIHRlcnJpYmxlXG5cdFx0XHQvLyBoYWNrIHRoYXQgaXMgdGhlIEhUTUwgYmxvY2sgcGFyc2VyLlxuXHRcdFx0cmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1xccyskLyxcIlwiKTtcblx0XHRcdHJlc3VsdCA9IFwiPFwiK2xpc3RfdHlwZStcIj5cIiArIHJlc3VsdCArIFwiPC9cIitsaXN0X3R5cGUrXCI+XFxuXCI7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHdob2xlX2xpc3QgPSAvKFxcblxcbnxeXFxuPykoKFsgXXswLDN9KFsqKy1dfFxcZCtbLl0pWyBcXHRdKylbXlxccl0rPyh+MHxcXG57Mix9KD89XFxTKSg/IVsgXFx0XSooPzpbKistXXxcXGQrWy5dKVsgXFx0XSspKSkvZztcblx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKHdob2xlX2xpc3QsZnVuY3Rpb24od2hvbGVNYXRjaCxtMSxtMixtMykge1xuXHRcdFx0dmFyIHJ1bnVwID0gbTE7XG5cdFx0XHR2YXIgbGlzdCA9IG0yO1xuXG5cdFx0XHR2YXIgbGlzdF90eXBlID0gKG0zLnNlYXJjaCgvWyorLV0vZyk+LTEpID8gXCJ1bFwiIDogXCJvbFwiO1xuXHRcdFx0Ly8gVHVybiBkb3VibGUgcmV0dXJucyBpbnRvIHRyaXBsZSByZXR1cm5zLCBzbyB0aGF0IHdlIGNhbiBtYWtlIGFcblx0XHRcdC8vIHBhcmFncmFwaCBmb3IgdGhlIGxhc3QgaXRlbSBpbiBhIGxpc3QsIGlmIG5lY2Vzc2FyeTpcblx0XHRcdHZhciBsaXN0ID0gbGlzdC5yZXBsYWNlKC9cXG57Mix9L2csXCJcXG5cXG5cXG5cIik7O1xuXHRcdFx0dmFyIHJlc3VsdCA9IF9Qcm9jZXNzTGlzdEl0ZW1zKGxpc3QpO1xuXHRcdFx0cmVzdWx0ID0gcnVudXAgKyBcIjxcIitsaXN0X3R5cGUrXCI+XFxuXCIgKyByZXN1bHQgKyBcIjwvXCIrbGlzdF90eXBlK1wiPlxcblwiO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9KTtcblx0fVxuXG5cdC8vIGF0dGFja2xhYjogc3RyaXAgc2VudGluZWxcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvfjAvLFwiXCIpO1xuXG5cdHJldHVybiB0ZXh0O1xufVxuXG5fUHJvY2Vzc0xpc3RJdGVtcyA9IGZ1bmN0aW9uKGxpc3Rfc3RyKSB7XG4vL1xuLy8gIFByb2Nlc3MgdGhlIGNvbnRlbnRzIG9mIGEgc2luZ2xlIG9yZGVyZWQgb3IgdW5vcmRlcmVkIGxpc3QsIHNwbGl0dGluZyBpdFxuLy8gIGludG8gaW5kaXZpZHVhbCBsaXN0IGl0ZW1zLlxuLy9cblx0Ly8gVGhlICRnX2xpc3RfbGV2ZWwgZ2xvYmFsIGtlZXBzIHRyYWNrIG9mIHdoZW4gd2UncmUgaW5zaWRlIGEgbGlzdC5cblx0Ly8gRWFjaCB0aW1lIHdlIGVudGVyIGEgbGlzdCwgd2UgaW5jcmVtZW50IGl0OyB3aGVuIHdlIGxlYXZlIGEgbGlzdCxcblx0Ly8gd2UgZGVjcmVtZW50LiBJZiBpdCdzIHplcm8sIHdlJ3JlIG5vdCBpbiBhIGxpc3QgYW55bW9yZS5cblx0Ly9cblx0Ly8gV2UgZG8gdGhpcyBiZWNhdXNlIHdoZW4gd2UncmUgbm90IGluc2lkZSBhIGxpc3QsIHdlIHdhbnQgdG8gdHJlYXRcblx0Ly8gc29tZXRoaW5nIGxpa2UgdGhpczpcblx0Ly9cblx0Ly8gICAgSSByZWNvbW1lbmQgdXBncmFkaW5nIHRvIHZlcnNpb25cblx0Ly8gICAgOC4gT29wcywgbm93IHRoaXMgbGluZSBpcyB0cmVhdGVkXG5cdC8vICAgIGFzIGEgc3ViLWxpc3QuXG5cdC8vXG5cdC8vIEFzIGEgc2luZ2xlIHBhcmFncmFwaCwgZGVzcGl0ZSB0aGUgZmFjdCB0aGF0IHRoZSBzZWNvbmQgbGluZSBzdGFydHNcblx0Ly8gd2l0aCBhIGRpZ2l0LXBlcmlvZC1zcGFjZSBzZXF1ZW5jZS5cblx0Ly9cblx0Ly8gV2hlcmVhcyB3aGVuIHdlJ3JlIGluc2lkZSBhIGxpc3QgKG9yIHN1Yi1saXN0KSwgdGhhdCBsaW5lIHdpbGwgYmVcblx0Ly8gdHJlYXRlZCBhcyB0aGUgc3RhcnQgb2YgYSBzdWItbGlzdC4gV2hhdCBhIGtsdWRnZSwgaHVoPyBUaGlzIGlzXG5cdC8vIGFuIGFzcGVjdCBvZiBNYXJrZG93bidzIHN5bnRheCB0aGF0J3MgaGFyZCB0byBwYXJzZSBwZXJmZWN0bHlcblx0Ly8gd2l0aG91dCByZXNvcnRpbmcgdG8gbWluZC1yZWFkaW5nLiBQZXJoYXBzIHRoZSBzb2x1dGlvbiBpcyB0b1xuXHQvLyBjaGFuZ2UgdGhlIHN5bnRheCBydWxlcyBzdWNoIHRoYXQgc3ViLWxpc3RzIG11c3Qgc3RhcnQgd2l0aCBhXG5cdC8vIHN0YXJ0aW5nIGNhcmRpbmFsIG51bWJlcjsgZS5nLiBcIjEuXCIgb3IgXCJhLlwiLlxuXG5cdGdfbGlzdF9sZXZlbCsrO1xuXG5cdC8vIHRyaW0gdHJhaWxpbmcgYmxhbmsgbGluZXM6XG5cdGxpc3Rfc3RyID0gbGlzdF9zdHIucmVwbGFjZSgvXFxuezIsfSQvLFwiXFxuXCIpO1xuXG5cdC8vIGF0dGFja2xhYjogYWRkIHNlbnRpbmVsIHRvIGVtdWxhdGUgXFx6XG5cdGxpc3Rfc3RyICs9IFwifjBcIjtcblxuXHQvKlxuXHRcdGxpc3Rfc3RyID0gbGlzdF9zdHIucmVwbGFjZSgvXG5cdFx0XHQoXFxuKT9cdFx0XHRcdFx0XHRcdC8vIGxlYWRpbmcgbGluZSA9ICQxXG5cdFx0XHQoXlsgXFx0XSopXHRcdFx0XHRcdFx0Ly8gbGVhZGluZyB3aGl0ZXNwYWNlID0gJDJcblx0XHRcdChbKistXXxcXGQrWy5dKSBbIFxcdF0rXHRcdFx0Ly8gbGlzdCBtYXJrZXIgPSAkM1xuXHRcdFx0KFteXFxyXSs/XHRcdFx0XHRcdFx0Ly8gbGlzdCBpdGVtIHRleHQgICA9ICQ0XG5cdFx0XHQoXFxuezEsMn0pKVxuXHRcdFx0KD89IFxcbiogKH4wIHwgXFwyIChbKistXXxcXGQrWy5dKSBbIFxcdF0rKSlcblx0XHQvZ20sIGZ1bmN0aW9uKCl7Li4ufSk7XG5cdCovXG5cdGxpc3Rfc3RyID0gbGlzdF9zdHIucmVwbGFjZSgvKFxcbik/KF5bIFxcdF0qKShbKistXXxcXGQrWy5dKVsgXFx0XSsoW15cXHJdKz8oXFxuezEsMn0pKSg/PVxcbioofjB8XFwyKFsqKy1dfFxcZCtbLl0pWyBcXHRdKykpL2dtLFxuXHRcdGZ1bmN0aW9uKHdob2xlTWF0Y2gsbTEsbTIsbTMsbTQpe1xuXHRcdFx0dmFyIGl0ZW0gPSBtNDtcblx0XHRcdHZhciBsZWFkaW5nX2xpbmUgPSBtMTtcblx0XHRcdHZhciBsZWFkaW5nX3NwYWNlID0gbTI7XG5cblx0XHRcdGlmIChsZWFkaW5nX2xpbmUgfHwgKGl0ZW0uc2VhcmNoKC9cXG57Mix9Lyk+LTEpKSB7XG5cdFx0XHRcdGl0ZW0gPSBfUnVuQmxvY2tHYW11dChfT3V0ZGVudChpdGVtKSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Ly8gUmVjdXJzaW9uIGZvciBzdWItbGlzdHM6XG5cdFx0XHRcdGl0ZW0gPSBfRG9MaXN0cyhfT3V0ZGVudChpdGVtKSk7XG5cdFx0XHRcdGl0ZW0gPSBpdGVtLnJlcGxhY2UoL1xcbiQvLFwiXCIpOyAvLyBjaG9tcChpdGVtKVxuXHRcdFx0XHRpdGVtID0gX1J1blNwYW5HYW11dChpdGVtKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuICBcIjxsaT5cIiArIGl0ZW0gKyBcIjwvbGk+XFxuXCI7XG5cdFx0fVxuXHQpO1xuXG5cdC8vIGF0dGFja2xhYjogc3RyaXAgc2VudGluZWxcblx0bGlzdF9zdHIgPSBsaXN0X3N0ci5yZXBsYWNlKC9+MC9nLFwiXCIpO1xuXG5cdGdfbGlzdF9sZXZlbC0tO1xuXHRyZXR1cm4gbGlzdF9zdHI7XG59XG5cblxudmFyIF9Eb0NvZGVCbG9ja3MgPSBmdW5jdGlvbih0ZXh0KSB7XG4vL1xuLy8gIFByb2Nlc3MgTWFya2Rvd24gYDxwcmU+PGNvZGU+YCBibG9ja3MuXG4vL1xuXG5cdC8qXG5cdFx0dGV4dCA9IHRleHQucmVwbGFjZSh0ZXh0LFxuXHRcdFx0Lyg/OlxcblxcbnxeKVxuXHRcdFx0KFx0XHRcdFx0XHRcdFx0XHQvLyAkMSA9IHRoZSBjb2RlIGJsb2NrIC0tIG9uZSBvciBtb3JlIGxpbmVzLCBzdGFydGluZyB3aXRoIGEgc3BhY2UvdGFiXG5cdFx0XHRcdCg/OlxuXHRcdFx0XHRcdCg/OlsgXXs0fXxcXHQpXHRcdFx0Ly8gTGluZXMgbXVzdCBzdGFydCB3aXRoIGEgdGFiIG9yIGEgdGFiLXdpZHRoIG9mIHNwYWNlcyAtIGF0dGFja2xhYjogZ190YWJfd2lkdGhcblx0XHRcdFx0XHQuKlxcbitcblx0XHRcdFx0KStcblx0XHRcdClcblx0XHRcdChcXG4qWyBdezAsM31bXiBcXHRcXG5dfCg/PX4wKSlcdC8vIGF0dGFja2xhYjogZ190YWJfd2lkdGhcblx0XHQvZyxmdW5jdGlvbigpey4uLn0pO1xuXHQqL1xuXG5cdC8vIGF0dGFja2xhYjogc2VudGluZWwgd29ya2Fyb3VuZHMgZm9yIGxhY2sgb2YgXFxBIGFuZCBcXFosIHNhZmFyaVxca2h0bWwgYnVnXG5cdHRleHQgKz0gXCJ+MFwiO1xuXG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoLyg/OlxcblxcbnxeKSgoPzooPzpbIF17NH18XFx0KS4qXFxuKykrKShcXG4qWyBdezAsM31bXiBcXHRcXG5dfCg/PX4wKSkvZyxcblx0XHRmdW5jdGlvbih3aG9sZU1hdGNoLG0xLG0yKSB7XG5cdFx0XHR2YXIgY29kZWJsb2NrID0gbTE7XG5cdFx0XHR2YXIgbmV4dENoYXIgPSBtMjtcblxuXHRcdFx0Y29kZWJsb2NrID0gX0VuY29kZUNvZGUoIF9PdXRkZW50KGNvZGVibG9jaykpO1xuXHRcdFx0Y29kZWJsb2NrID0gX0RldGFiKGNvZGVibG9jayk7XG5cdFx0XHRjb2RlYmxvY2sgPSBjb2RlYmxvY2sucmVwbGFjZSgvXlxcbisvZyxcIlwiKTsgLy8gdHJpbSBsZWFkaW5nIG5ld2xpbmVzXG5cdFx0XHRjb2RlYmxvY2sgPSBjb2RlYmxvY2sucmVwbGFjZSgvXFxuKyQvZyxcIlwiKTsgLy8gdHJpbSB0cmFpbGluZyB3aGl0ZXNwYWNlXG5cblx0XHRcdGNvZGVibG9jayA9IFwiPHByZT48Y29kZT5cIiArIGNvZGVibG9jayArIFwiXFxuPC9jb2RlPjwvcHJlPlwiO1xuXG5cdFx0XHRyZXR1cm4gaGFzaEJsb2NrKGNvZGVibG9jaykgKyBuZXh0Q2hhcjtcblx0XHR9XG5cdCk7XG5cblx0Ly8gYXR0YWNrbGFiOiBzdHJpcCBzZW50aW5lbFxuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9+MC8sXCJcIik7XG5cblx0cmV0dXJuIHRleHQ7XG59O1xuXG52YXIgX0RvR2l0aHViQ29kZUJsb2NrcyA9IGZ1bmN0aW9uKHRleHQpIHtcbi8vXG4vLyAgUHJvY2VzcyBHaXRodWItc3R5bGUgY29kZSBibG9ja3Ncbi8vICBFeGFtcGxlOlxuLy8gIGBgYHJ1Ynlcbi8vICBkZWYgaGVsbG9fd29ybGQoeClcbi8vICAgIHB1dHMgXCJIZWxsbywgI3t4fVwiXG4vLyAgZW5kXG4vLyAgYGBgXG4vL1xuXG5cblx0Ly8gYXR0YWNrbGFiOiBzZW50aW5lbCB3b3JrYXJvdW5kcyBmb3IgbGFjayBvZiBcXEEgYW5kIFxcWiwgc2FmYXJpXFxraHRtbCBidWdcblx0dGV4dCArPSBcIn4wXCI7XG5cblx0dGV4dCA9IHRleHQucmVwbGFjZSgvKD86XnxcXG4pYGBgKC4qKVxcbihbXFxzXFxTXSo/KVxcbmBgYC9nLFxuXHRcdGZ1bmN0aW9uKHdob2xlTWF0Y2gsbTEsbTIpIHtcblx0XHRcdHZhciBsYW5ndWFnZSA9IG0xO1xuXHRcdFx0dmFyIGNvZGVibG9jayA9IG0yO1xuXG5cdFx0XHRjb2RlYmxvY2sgPSBfRW5jb2RlQ29kZShjb2RlYmxvY2spO1xuXHRcdFx0Y29kZWJsb2NrID0gX0RldGFiKGNvZGVibG9jayk7XG5cdFx0XHRjb2RlYmxvY2sgPSBjb2RlYmxvY2sucmVwbGFjZSgvXlxcbisvZyxcIlwiKTsgLy8gdHJpbSBsZWFkaW5nIG5ld2xpbmVzXG5cdFx0XHRjb2RlYmxvY2sgPSBjb2RlYmxvY2sucmVwbGFjZSgvXFxuKyQvZyxcIlwiKTsgLy8gdHJpbSB0cmFpbGluZyB3aGl0ZXNwYWNlXG5cblx0XHRcdGNvZGVibG9jayA9IFwiPHByZT48Y29kZVwiICsgKGxhbmd1YWdlID8gXCIgY2xhc3M9XFxcIlwiICsgbGFuZ3VhZ2UgKyAnXCInIDogXCJcIikgKyBcIj5cIiArIGNvZGVibG9jayArIFwiXFxuPC9jb2RlPjwvcHJlPlwiO1xuXG5cdFx0XHRyZXR1cm4gaGFzaEJsb2NrKGNvZGVibG9jayk7XG5cdFx0fVxuXHQpO1xuXG5cdC8vIGF0dGFja2xhYjogc3RyaXAgc2VudGluZWxcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvfjAvLFwiXCIpO1xuXG5cdHJldHVybiB0ZXh0O1xufVxuXG52YXIgaGFzaEJsb2NrID0gZnVuY3Rpb24odGV4dCkge1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oXlxcbit8XFxuKyQpL2csXCJcIik7XG5cdHJldHVybiBcIlxcblxcbn5LXCIgKyAoZ19odG1sX2Jsb2Nrcy5wdXNoKHRleHQpLTEpICsgXCJLXFxuXFxuXCI7XG59XG5cbnZhciBfRG9Db2RlU3BhbnMgPSBmdW5jdGlvbih0ZXh0KSB7XG4vL1xuLy8gICAqICBCYWNrdGljayBxdW90ZXMgYXJlIHVzZWQgZm9yIDxjb2RlPjwvY29kZT4gc3BhbnMuXG4vL1xuLy8gICAqICBZb3UgY2FuIHVzZSBtdWx0aXBsZSBiYWNrdGlja3MgYXMgdGhlIGRlbGltaXRlcnMgaWYgeW91IHdhbnQgdG9cbi8vXHQgaW5jbHVkZSBsaXRlcmFsIGJhY2t0aWNrcyBpbiB0aGUgY29kZSBzcGFuLiBTbywgdGhpcyBpbnB1dDpcbi8vXG4vL1x0XHQgSnVzdCB0eXBlIGBgZm9vIGBiYXJgIGJhemBgIGF0IHRoZSBwcm9tcHQuXG4vL1xuLy9cdCAgIFdpbGwgdHJhbnNsYXRlIHRvOlxuLy9cbi8vXHRcdCA8cD5KdXN0IHR5cGUgPGNvZGU+Zm9vIGBiYXJgIGJhejwvY29kZT4gYXQgdGhlIHByb21wdC48L3A+XG4vL1xuLy9cdFRoZXJlJ3Mgbm8gYXJiaXRyYXJ5IGxpbWl0IHRvIHRoZSBudW1iZXIgb2YgYmFja3RpY2tzIHlvdVxuLy9cdGNhbiB1c2UgYXMgZGVsaW10ZXJzLiBJZiB5b3UgbmVlZCB0aHJlZSBjb25zZWN1dGl2ZSBiYWNrdGlja3Ncbi8vXHRpbiB5b3VyIGNvZGUsIHVzZSBmb3VyIGZvciBkZWxpbWl0ZXJzLCBldGMuXG4vL1xuLy8gICogIFlvdSBjYW4gdXNlIHNwYWNlcyB0byBnZXQgbGl0ZXJhbCBiYWNrdGlja3MgYXQgdGhlIGVkZ2VzOlxuLy9cbi8vXHRcdCAuLi4gdHlwZSBgYCBgYmFyYCBgYCAuLi5cbi8vXG4vL1x0ICAgVHVybnMgdG86XG4vL1xuLy9cdFx0IC4uLiB0eXBlIDxjb2RlPmBiYXJgPC9jb2RlPiAuLi5cbi8vXG5cblx0Lypcblx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cblx0XHRcdChefFteXFxcXF0pXHRcdFx0XHRcdC8vIENoYXJhY3RlciBiZWZvcmUgb3BlbmluZyBgIGNhbid0IGJlIGEgYmFja3NsYXNoXG5cdFx0XHQoYCspXHRcdFx0XHRcdFx0Ly8gJDIgPSBPcGVuaW5nIHJ1biBvZiBgXG5cdFx0XHQoXHRcdFx0XHRcdFx0XHQvLyAkMyA9IFRoZSBjb2RlIGJsb2NrXG5cdFx0XHRcdFteXFxyXSo/XG5cdFx0XHRcdFteYF1cdFx0XHRcdFx0Ly8gYXR0YWNrbGFiOiB3b3JrIGFyb3VuZCBsYWNrIG9mIGxvb2tiZWhpbmRcblx0XHRcdClcblx0XHRcdFxcMlx0XHRcdFx0XHRcdFx0Ly8gTWF0Y2hpbmcgY2xvc2VyXG5cdFx0XHQoPyFgKVxuXHRcdC9nbSwgZnVuY3Rpb24oKXsuLi59KTtcblx0Ki9cblxuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oXnxbXlxcXFxdKShgKykoW15cXHJdKj9bXmBdKVxcMig/IWApL2dtLFxuXHRcdGZ1bmN0aW9uKHdob2xlTWF0Y2gsbTEsbTIsbTMsbTQpIHtcblx0XHRcdHZhciBjID0gbTM7XG5cdFx0XHRjID0gYy5yZXBsYWNlKC9eKFsgXFx0XSopL2csXCJcIik7XHQvLyBsZWFkaW5nIHdoaXRlc3BhY2Vcblx0XHRcdGMgPSBjLnJlcGxhY2UoL1sgXFx0XSokL2csXCJcIik7XHQvLyB0cmFpbGluZyB3aGl0ZXNwYWNlXG5cdFx0XHRjID0gX0VuY29kZUNvZGUoYyk7XG5cdFx0XHRyZXR1cm4gbTErXCI8Y29kZT5cIitjK1wiPC9jb2RlPlwiO1xuXHRcdH0pO1xuXG5cdHJldHVybiB0ZXh0O1xufVxuXG52YXIgX0VuY29kZUNvZGUgPSBmdW5jdGlvbih0ZXh0KSB7XG4vL1xuLy8gRW5jb2RlL2VzY2FwZSBjZXJ0YWluIGNoYXJhY3RlcnMgaW5zaWRlIE1hcmtkb3duIGNvZGUgcnVucy5cbi8vIFRoZSBwb2ludCBpcyB0aGF0IGluIGNvZGUsIHRoZXNlIGNoYXJhY3RlcnMgYXJlIGxpdGVyYWxzLFxuLy8gYW5kIGxvc2UgdGhlaXIgc3BlY2lhbCBNYXJrZG93biBtZWFuaW5ncy5cbi8vXG5cdC8vIEVuY29kZSBhbGwgYW1wZXJzYW5kczsgSFRNTCBlbnRpdGllcyBhcmUgbm90XG5cdC8vIGVudGl0aWVzIHdpdGhpbiBhIE1hcmtkb3duIGNvZGUgc3Bhbi5cblx0dGV4dCA9IHRleHQucmVwbGFjZSgvJi9nLFwiJmFtcDtcIik7XG5cblx0Ly8gRG8gdGhlIGFuZ2xlIGJyYWNrZXQgc29uZyBhbmQgZGFuY2U6XG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoLzwvZyxcIiZsdDtcIik7XG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoLz4vZyxcIiZndDtcIik7XG5cblx0Ly8gTm93LCBlc2NhcGUgY2hhcmFjdGVycyB0aGF0IGFyZSBtYWdpYyBpbiBNYXJrZG93bjpcblx0dGV4dCA9IGVzY2FwZUNoYXJhY3RlcnModGV4dCxcIlxcKl97fVtdXFxcXFwiLGZhbHNlKTtcblxuLy8gamogdGhlIGxpbmUgYWJvdmUgYnJlYWtzIHRoaXM6XG4vLy0tLVxuXG4vLyogSXRlbVxuXG4vLyAgIDEuIFN1Yml0ZW1cblxuLy8gICAgICAgICAgICBzcGVjaWFsIGNoYXI6ICpcbi8vLS0tXG5cblx0cmV0dXJuIHRleHQ7XG59XG5cblxudmFyIF9Eb0l0YWxpY3NBbmRCb2xkID0gZnVuY3Rpb24odGV4dCkge1xuXG5cdC8vIDxzdHJvbmc+IG11c3QgZ28gZmlyc3Q6XG5cdHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXCpcXCp8X18pKD89XFxTKShbXlxccl0qP1xcU1sqX10qKVxcMS9nLFxuXHRcdFwiPHN0cm9uZz4kMjwvc3Ryb25nPlwiKTtcblxuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oXFwqfF8pKD89XFxTKShbXlxccl0qP1xcUylcXDEvZyxcblx0XHRcIjxlbT4kMjwvZW0+XCIpO1xuXG5cdHJldHVybiB0ZXh0O1xufVxuXG5cbnZhciBfRG9CbG9ja1F1b3RlcyA9IGZ1bmN0aW9uKHRleHQpIHtcblxuXHQvKlxuXHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xuXHRcdChcdFx0XHRcdFx0XHRcdFx0Ly8gV3JhcCB3aG9sZSBtYXRjaCBpbiAkMVxuXHRcdFx0KFxuXHRcdFx0XHReWyBcXHRdKj5bIFxcdF0/XHRcdFx0Ly8gJz4nIGF0IHRoZSBzdGFydCBvZiBhIGxpbmVcblx0XHRcdFx0LitcXG5cdFx0XHRcdFx0Ly8gcmVzdCBvZiB0aGUgZmlyc3QgbGluZVxuXHRcdFx0XHQoLitcXG4pKlx0XHRcdFx0XHQvLyBzdWJzZXF1ZW50IGNvbnNlY3V0aXZlIGxpbmVzXG5cdFx0XHRcdFxcbipcdFx0XHRcdFx0XHQvLyBibGFua3Ncblx0XHRcdCkrXG5cdFx0KVxuXHRcdC9nbSwgZnVuY3Rpb24oKXsuLi59KTtcblx0Ki9cblxuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oKF5bIFxcdF0qPlsgXFx0XT8uK1xcbiguK1xcbikqXFxuKikrKS9nbSxcblx0XHRmdW5jdGlvbih3aG9sZU1hdGNoLG0xKSB7XG5cdFx0XHR2YXIgYnEgPSBtMTtcblxuXHRcdFx0Ly8gYXR0YWNrbGFiOiBoYWNrIGFyb3VuZCBLb25xdWVyb3IgMy41LjQgYnVnOlxuXHRcdFx0Ly8gXCItLS0tLS0tLS0tYnVnXCIucmVwbGFjZSgvXi0vZyxcIlwiKSA9PSBcImJ1Z1wiXG5cblx0XHRcdGJxID0gYnEucmVwbGFjZSgvXlsgXFx0XSo+WyBcXHRdPy9nbSxcIn4wXCIpO1x0Ly8gdHJpbSBvbmUgbGV2ZWwgb2YgcXVvdGluZ1xuXG5cdFx0XHQvLyBhdHRhY2tsYWI6IGNsZWFuIHVwIGhhY2tcblx0XHRcdGJxID0gYnEucmVwbGFjZSgvfjAvZyxcIlwiKTtcblxuXHRcdFx0YnEgPSBicS5yZXBsYWNlKC9eWyBcXHRdKyQvZ20sXCJcIik7XHRcdC8vIHRyaW0gd2hpdGVzcGFjZS1vbmx5IGxpbmVzXG5cdFx0XHRicSA9IF9SdW5CbG9ja0dhbXV0KGJxKTtcdFx0XHRcdC8vIHJlY3Vyc2VcblxuXHRcdFx0YnEgPSBicS5yZXBsYWNlKC8oXnxcXG4pL2csXCIkMSAgXCIpO1xuXHRcdFx0Ly8gVGhlc2UgbGVhZGluZyBzcGFjZXMgc2NyZXcgd2l0aCA8cHJlPiBjb250ZW50LCBzbyB3ZSBuZWVkIHRvIGZpeCB0aGF0OlxuXHRcdFx0YnEgPSBicS5yZXBsYWNlKFxuXHRcdFx0XHRcdC8oXFxzKjxwcmU+W15cXHJdKz88XFwvcHJlPikvZ20sXG5cdFx0XHRcdGZ1bmN0aW9uKHdob2xlTWF0Y2gsbTEpIHtcblx0XHRcdFx0XHR2YXIgcHJlID0gbTE7XG5cdFx0XHRcdFx0Ly8gYXR0YWNrbGFiOiBoYWNrIGFyb3VuZCBLb25xdWVyb3IgMy41LjQgYnVnOlxuXHRcdFx0XHRcdHByZSA9IHByZS5yZXBsYWNlKC9eICAvbWcsXCJ+MFwiKTtcblx0XHRcdFx0XHRwcmUgPSBwcmUucmVwbGFjZSgvfjAvZyxcIlwiKTtcblx0XHRcdFx0XHRyZXR1cm4gcHJlO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIGhhc2hCbG9jayhcIjxibG9ja3F1b3RlPlxcblwiICsgYnEgKyBcIlxcbjwvYmxvY2txdW90ZT5cIik7XG5cdFx0fSk7XG5cdHJldHVybiB0ZXh0O1xufVxuXG5cbnZhciBfRm9ybVBhcmFncmFwaHMgPSBmdW5jdGlvbih0ZXh0KSB7XG4vL1xuLy8gIFBhcmFtczpcbi8vICAgICR0ZXh0IC0gc3RyaW5nIHRvIHByb2Nlc3Mgd2l0aCBodG1sIDxwPiB0YWdzXG4vL1xuXG5cdC8vIFN0cmlwIGxlYWRpbmcgYW5kIHRyYWlsaW5nIGxpbmVzOlxuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eXFxuKy9nLFwiXCIpO1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXG4rJC9nLFwiXCIpO1xuXG5cdHZhciBncmFmcyA9IHRleHQuc3BsaXQoL1xcbnsyLH0vZyk7XG5cdHZhciBncmFmc091dCA9IFtdO1xuXG5cdC8vXG5cdC8vIFdyYXAgPHA+IHRhZ3MuXG5cdC8vXG5cdHZhciBlbmQgPSBncmFmcy5sZW5ndGg7XG5cdGZvciAodmFyIGk9MDsgaTxlbmQ7IGkrKykge1xuXHRcdHZhciBzdHIgPSBncmFmc1tpXTtcblxuXHRcdC8vIGlmIHRoaXMgaXMgYW4gSFRNTCBtYXJrZXIsIGNvcHkgaXRcblx0XHRpZiAoc3RyLnNlYXJjaCgvfksoXFxkKylLL2cpID49IDApIHtcblx0XHRcdGdyYWZzT3V0LnB1c2goc3RyKTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoc3RyLnNlYXJjaCgvXFxTLykgPj0gMCkge1xuXHRcdFx0c3RyID0gX1J1blNwYW5HYW11dChzdHIpO1xuXHRcdFx0c3RyID0gc3RyLnJlcGxhY2UoL14oWyBcXHRdKikvZyxcIjxwPlwiKTtcblx0XHRcdHN0ciArPSBcIjwvcD5cIlxuXHRcdFx0Z3JhZnNPdXQucHVzaChzdHIpO1xuXHRcdH1cblxuXHR9XG5cblx0Ly9cblx0Ly8gVW5oYXNoaWZ5IEhUTUwgYmxvY2tzXG5cdC8vXG5cdGVuZCA9IGdyYWZzT3V0Lmxlbmd0aDtcblx0Zm9yICh2YXIgaT0wOyBpPGVuZDsgaSsrKSB7XG5cdFx0Ly8gaWYgdGhpcyBpcyBhIG1hcmtlciBmb3IgYW4gaHRtbCBibG9jay4uLlxuXHRcdHdoaWxlIChncmFmc091dFtpXS5zZWFyY2goL35LKFxcZCspSy8pID49IDApIHtcblx0XHRcdHZhciBibG9ja1RleHQgPSBnX2h0bWxfYmxvY2tzW1JlZ0V4cC4kMV07XG5cdFx0XHRibG9ja1RleHQgPSBibG9ja1RleHQucmVwbGFjZSgvXFwkL2csXCIkJCQkXCIpOyAvLyBFc2NhcGUgYW55IGRvbGxhciBzaWduc1xuXHRcdFx0Z3JhZnNPdXRbaV0gPSBncmFmc091dFtpXS5yZXBsYWNlKC9+S1xcZCtLLyxibG9ja1RleHQpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBncmFmc091dC5qb2luKFwiXFxuXFxuXCIpO1xufVxuXG5cbnZhciBfRW5jb2RlQW1wc0FuZEFuZ2xlcyA9IGZ1bmN0aW9uKHRleHQpIHtcbi8vIFNtYXJ0IHByb2Nlc3NpbmcgZm9yIGFtcGVyc2FuZHMgYW5kIGFuZ2xlIGJyYWNrZXRzIHRoYXQgbmVlZCB0byBiZSBlbmNvZGVkLlxuXG5cdC8vIEFtcGVyc2FuZC1lbmNvZGluZyBiYXNlZCBlbnRpcmVseSBvbiBOYXQgSXJvbnMncyBBbXB1dGF0b3IgTVQgcGx1Z2luOlxuXHQvLyAgIGh0dHA6Ly9idW1wcG8ubmV0L3Byb2plY3RzL2FtcHV0YXRvci9cblx0dGV4dCA9IHRleHQucmVwbGFjZSgvJig/ISM/W3hYXT8oPzpbMC05YS1mQS1GXSt8XFx3Kyk7KS9nLFwiJmFtcDtcIik7XG5cblx0Ly8gRW5jb2RlIG5ha2VkIDwnc1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC88KD8hW2EtelxcLz9cXCQhXSkvZ2ksXCImbHQ7XCIpO1xuXG5cdHJldHVybiB0ZXh0O1xufVxuXG5cbnZhciBfRW5jb2RlQmFja3NsYXNoRXNjYXBlcyA9IGZ1bmN0aW9uKHRleHQpIHtcbi8vXG4vLyAgIFBhcmFtZXRlcjogIFN0cmluZy5cbi8vICAgUmV0dXJuczpcdFRoZSBzdHJpbmcsIHdpdGggYWZ0ZXIgcHJvY2Vzc2luZyB0aGUgZm9sbG93aW5nIGJhY2tzbGFzaFxuLy9cdFx0XHQgICBlc2NhcGUgc2VxdWVuY2VzLlxuLy9cblxuXHQvLyBhdHRhY2tsYWI6IFRoZSBwb2xpdGUgd2F5IHRvIGRvIHRoaXMgaXMgd2l0aCB0aGUgbmV3XG5cdC8vIGVzY2FwZUNoYXJhY3RlcnMoKSBmdW5jdGlvbjpcblx0Ly9cblx0Ly8gXHR0ZXh0ID0gZXNjYXBlQ2hhcmFjdGVycyh0ZXh0LFwiXFxcXFwiLHRydWUpO1xuXHQvLyBcdHRleHQgPSBlc2NhcGVDaGFyYWN0ZXJzKHRleHQsXCJgKl97fVtdKCk+IystLiFcIix0cnVlKTtcblx0Ly9cblx0Ly8gLi4uYnV0IHdlJ3JlIHNpZGVzdGVwcGluZyBpdHMgdXNlIG9mIHRoZSAoc2xvdykgUmVnRXhwIGNvbnN0cnVjdG9yXG5cdC8vIGFzIGFuIG9wdGltaXphdGlvbiBmb3IgRmlyZWZveC4gIFRoaXMgZnVuY3Rpb24gZ2V0cyBjYWxsZWQgYSBMT1QuXG5cblx0dGV4dCA9IHRleHQucmVwbGFjZSgvXFxcXChcXFxcKS9nLGVzY2FwZUNoYXJhY3RlcnNfY2FsbGJhY2spO1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXFxcKFtgKl97fVxcW1xcXSgpPiMrLS4hXSkvZyxlc2NhcGVDaGFyYWN0ZXJzX2NhbGxiYWNrKTtcblx0cmV0dXJuIHRleHQ7XG59XG5cblxudmFyIF9Eb0F1dG9MaW5rcyA9IGZ1bmN0aW9uKHRleHQpIHtcblxuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC88KChodHRwcz98ZnRwfGRpY3QpOlteJ1wiPlxcc10rKT4vZ2ksXCI8YSBocmVmPVxcXCIkMVxcXCI+JDE8L2E+XCIpO1xuXG5cdC8vIEVtYWlsIGFkZHJlc3NlczogPGFkZHJlc3NAZG9tYWluLmZvbz5cblxuXHQvKlxuXHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xuXHRcdFx0PFxuXHRcdFx0KD86bWFpbHRvOik/XG5cdFx0XHQoXG5cdFx0XHRcdFstLlxcd10rXG5cdFx0XHRcdFxcQFxuXHRcdFx0XHRbLWEtejAtOV0rKFxcLlstYS16MC05XSspKlxcLlthLXpdK1xuXHRcdFx0KVxuXHRcdFx0PlxuXHRcdC9naSwgX0RvQXV0b0xpbmtzX2NhbGxiYWNrKCkpO1xuXHQqL1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC88KD86bWFpbHRvOik/KFstLlxcd10rXFxAWy1hLXowLTldKyhcXC5bLWEtejAtOV0rKSpcXC5bYS16XSspPi9naSxcblx0XHRmdW5jdGlvbih3aG9sZU1hdGNoLG0xKSB7XG5cdFx0XHRyZXR1cm4gX0VuY29kZUVtYWlsQWRkcmVzcyggX1VuZXNjYXBlU3BlY2lhbENoYXJzKG0xKSApO1xuXHRcdH1cblx0KTtcblxuXHRyZXR1cm4gdGV4dDtcbn1cblxuXG52YXIgX0VuY29kZUVtYWlsQWRkcmVzcyA9IGZ1bmN0aW9uKGFkZHIpIHtcbi8vXG4vLyAgSW5wdXQ6IGFuIGVtYWlsIGFkZHJlc3MsIGUuZy4gXCJmb29AZXhhbXBsZS5jb21cIlxuLy9cbi8vICBPdXRwdXQ6IHRoZSBlbWFpbCBhZGRyZXNzIGFzIGEgbWFpbHRvIGxpbmssIHdpdGggZWFjaCBjaGFyYWN0ZXJcbi8vXHRvZiB0aGUgYWRkcmVzcyBlbmNvZGVkIGFzIGVpdGhlciBhIGRlY2ltYWwgb3IgaGV4IGVudGl0eSwgaW5cbi8vXHR0aGUgaG9wZXMgb2YgZm9pbGluZyBtb3N0IGFkZHJlc3MgaGFydmVzdGluZyBzcGFtIGJvdHMuIEUuZy46XG4vL1xuLy9cdDxhIGhyZWY9XCImI3g2RDsmIzk3OyYjMTA1OyYjMTA4OyYjeDc0OyYjMTExOzomIzEwMjsmIzExMTsmIzExMTsmIzY0OyYjMTAxO1xuLy9cdCAgIHgmI3g2MTsmIzEwOTsmI3g3MDsmIzEwODsmI3g2NTsmI3gyRTsmIzk5OyYjMTExOyYjMTA5O1wiPiYjMTAyOyYjMTExOyYjMTExO1xuLy9cdCAgICYjNjQ7JiMxMDE7eCYjeDYxOyYjMTA5OyYjeDcwOyYjMTA4OyYjeDY1OyYjeDJFOyYjOTk7JiMxMTE7JiMxMDk7PC9hPlxuLy9cbi8vICBCYXNlZCBvbiBhIGZpbHRlciBieSBNYXR0aGV3IFdpY2tsaW5lLCBwb3N0ZWQgdG8gdGhlIEJCRWRpdC1UYWxrXG4vLyAgbWFpbGluZyBsaXN0OiA8aHR0cDovL3Rpbnl1cmwuY29tL3l1N3VlPlxuLy9cblxuXHR2YXIgZW5jb2RlID0gW1xuXHRcdGZ1bmN0aW9uKGNoKXtyZXR1cm4gXCImI1wiK2NoLmNoYXJDb2RlQXQoMCkrXCI7XCI7fSxcblx0XHRmdW5jdGlvbihjaCl7cmV0dXJuIFwiJiN4XCIrY2guY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikrXCI7XCI7fSxcblx0XHRmdW5jdGlvbihjaCl7cmV0dXJuIGNoO31cblx0XTtcblxuXHRhZGRyID0gXCJtYWlsdG86XCIgKyBhZGRyO1xuXG5cdGFkZHIgPSBhZGRyLnJlcGxhY2UoLy4vZywgZnVuY3Rpb24oY2gpIHtcblx0XHRpZiAoY2ggPT0gXCJAXCIpIHtcblx0XHQgICBcdC8vIHRoaXMgKm11c3QqIGJlIGVuY29kZWQuIEkgaW5zaXN0LlxuXHRcdFx0Y2ggPSBlbmNvZGVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjIpXShjaCk7XG5cdFx0fSBlbHNlIGlmIChjaCAhPVwiOlwiKSB7XG5cdFx0XHQvLyBsZWF2ZSAnOicgYWxvbmUgKHRvIHNwb3QgbWFpbHRvOiBsYXRlcilcblx0XHRcdHZhciByID0gTWF0aC5yYW5kb20oKTtcblx0XHRcdC8vIHJvdWdobHkgMTAlIHJhdywgNDUlIGhleCwgNDUlIGRlY1xuXHRcdFx0Y2ggPSAgKFxuXHRcdFx0XHRcdHIgPiAuOSAgP1x0ZW5jb2RlWzJdKGNoKSAgIDpcblx0XHRcdFx0XHRyID4gLjQ1ID9cdGVuY29kZVsxXShjaCkgICA6XG5cdFx0XHRcdFx0XHRcdFx0ZW5jb2RlWzBdKGNoKVxuXHRcdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gY2g7XG5cdH0pO1xuXG5cdGFkZHIgPSBcIjxhIGhyZWY9XFxcIlwiICsgYWRkciArIFwiXFxcIj5cIiArIGFkZHIgKyBcIjwvYT5cIjtcblx0YWRkciA9IGFkZHIucmVwbGFjZSgvXCI+Lis6L2csXCJcXFwiPlwiKTsgLy8gc3RyaXAgdGhlIG1haWx0bzogZnJvbSB0aGUgdmlzaWJsZSBwYXJ0XG5cblx0cmV0dXJuIGFkZHI7XG59XG5cblxudmFyIF9VbmVzY2FwZVNwZWNpYWxDaGFycyA9IGZ1bmN0aW9uKHRleHQpIHtcbi8vXG4vLyBTd2FwIGJhY2sgaW4gYWxsIHRoZSBzcGVjaWFsIGNoYXJhY3RlcnMgd2UndmUgaGlkZGVuLlxuLy9cblx0dGV4dCA9IHRleHQucmVwbGFjZSgvfkUoXFxkKylFL2csXG5cdFx0ZnVuY3Rpb24od2hvbGVNYXRjaCxtMSkge1xuXHRcdFx0dmFyIGNoYXJDb2RlVG9SZXBsYWNlID0gcGFyc2VJbnQobTEpO1xuXHRcdFx0cmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGVUb1JlcGxhY2UpO1xuXHRcdH1cblx0KTtcblx0cmV0dXJuIHRleHQ7XG59XG5cblxudmFyIF9PdXRkZW50ID0gZnVuY3Rpb24odGV4dCkge1xuLy9cbi8vIFJlbW92ZSBvbmUgbGV2ZWwgb2YgbGluZS1sZWFkaW5nIHRhYnMgb3Igc3BhY2VzXG4vL1xuXG5cdC8vIGF0dGFja2xhYjogaGFjayBhcm91bmQgS29ucXVlcm9yIDMuNS40IGJ1Zzpcblx0Ly8gXCItLS0tLS0tLS0tYnVnXCIucmVwbGFjZSgvXi0vZyxcIlwiKSA9PSBcImJ1Z1wiXG5cblx0dGV4dCA9IHRleHQucmVwbGFjZSgvXihcXHR8WyBdezEsNH0pL2dtLFwifjBcIik7IC8vIGF0dGFja2xhYjogZ190YWJfd2lkdGhcblxuXHQvLyBhdHRhY2tsYWI6IGNsZWFuIHVwIGhhY2tcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvfjAvZyxcIlwiKVxuXG5cdHJldHVybiB0ZXh0O1xufVxuXG52YXIgX0RldGFiID0gZnVuY3Rpb24odGV4dCkge1xuLy8gYXR0YWNrbGFiOiBEZXRhYidzIGNvbXBsZXRlbHkgcmV3cml0dGVuIGZvciBzcGVlZC5cbi8vIEluIHBlcmwgd2UgY291bGQgZml4IGl0IGJ5IGFuY2hvcmluZyB0aGUgcmVnZXhwIHdpdGggXFxHLlxuLy8gSW4gamF2YXNjcmlwdCB3ZSdyZSBsZXNzIGZvcnR1bmF0ZS5cblxuXHQvLyBleHBhbmQgZmlyc3Qgbi0xIHRhYnNcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvXFx0KD89XFx0KS9nLFwiICAgIFwiKTsgLy8gYXR0YWNrbGFiOiBnX3RhYl93aWR0aFxuXG5cdC8vIHJlcGxhY2UgdGhlIG50aCB3aXRoIHR3byBzZW50aW5lbHNcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvXFx0L2csXCJ+QX5CXCIpO1xuXG5cdC8vIHVzZSB0aGUgc2VudGluZWwgdG8gYW5jaG9yIG91ciByZWdleCBzbyBpdCBkb2Vzbid0IGV4cGxvZGVcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvfkIoLis/KX5BL2csXG5cdFx0ZnVuY3Rpb24od2hvbGVNYXRjaCxtMSxtMikge1xuXHRcdFx0dmFyIGxlYWRpbmdUZXh0ID0gbTE7XG5cdFx0XHR2YXIgbnVtU3BhY2VzID0gNCAtIGxlYWRpbmdUZXh0Lmxlbmd0aCAlIDQ7ICAvLyBhdHRhY2tsYWI6IGdfdGFiX3dpZHRoXG5cblx0XHRcdC8vIHRoZXJlICptdXN0KiBiZSBhIGJldHRlciB3YXkgdG8gZG8gdGhpczpcblx0XHRcdGZvciAodmFyIGk9MDsgaTxudW1TcGFjZXM7IGkrKykgbGVhZGluZ1RleHQrPVwiIFwiO1xuXG5cdFx0XHRyZXR1cm4gbGVhZGluZ1RleHQ7XG5cdFx0fVxuXHQpO1xuXG5cdC8vIGNsZWFuIHVwIHNlbnRpbmVsc1xuXHR0ZXh0ID0gdGV4dC5yZXBsYWNlKC9+QS9nLFwiICAgIFwiKTsgIC8vIGF0dGFja2xhYjogZ190YWJfd2lkdGhcblx0dGV4dCA9IHRleHQucmVwbGFjZSgvfkIvZyxcIlwiKTtcblxuXHRyZXR1cm4gdGV4dDtcbn1cblxuXG4vL1xuLy8gIGF0dGFja2xhYjogVXRpbGl0eSBmdW5jdGlvbnNcbi8vXG5cblxudmFyIGVzY2FwZUNoYXJhY3RlcnMgPSBmdW5jdGlvbih0ZXh0LCBjaGFyc1RvRXNjYXBlLCBhZnRlckJhY2tzbGFzaCkge1xuXHQvLyBGaXJzdCB3ZSBoYXZlIHRvIGVzY2FwZSB0aGUgZXNjYXBlIGNoYXJhY3RlcnMgc28gdGhhdFxuXHQvLyB3ZSBjYW4gYnVpbGQgYSBjaGFyYWN0ZXIgY2xhc3Mgb3V0IG9mIHRoZW1cblx0dmFyIHJlZ2V4U3RyaW5nID0gXCIoW1wiICsgY2hhcnNUb0VzY2FwZS5yZXBsYWNlKC8oW1xcW1xcXVxcXFxdKS9nLFwiXFxcXCQxXCIpICsgXCJdKVwiO1xuXG5cdGlmIChhZnRlckJhY2tzbGFzaCkge1xuXHRcdHJlZ2V4U3RyaW5nID0gXCJcXFxcXFxcXFwiICsgcmVnZXhTdHJpbmc7XG5cdH1cblxuXHR2YXIgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4U3RyaW5nLFwiZ1wiKTtcblx0dGV4dCA9IHRleHQucmVwbGFjZShyZWdleCxlc2NhcGVDaGFyYWN0ZXJzX2NhbGxiYWNrKTtcblxuXHRyZXR1cm4gdGV4dDtcbn1cblxuXG52YXIgZXNjYXBlQ2hhcmFjdGVyc19jYWxsYmFjayA9IGZ1bmN0aW9uKHdob2xlTWF0Y2gsbTEpIHtcblx0dmFyIGNoYXJDb2RlVG9Fc2NhcGUgPSBtMS5jaGFyQ29kZUF0KDApO1xuXHRyZXR1cm4gXCJ+RVwiK2NoYXJDb2RlVG9Fc2NhcGUrXCJFXCI7XG59XG5cbn0gLy8gZW5kIG9mIFNob3dkb3duLmNvbnZlcnRlclxuXG5cbjsgYnJvd3NlcmlmeV9zaGltX19kZWZpbmVfX21vZHVsZV9fZXhwb3J0X18odHlwZW9mIFNob3dkb3duICE9IFwidW5kZWZpbmVkXCIgPyBTaG93ZG93biA6IHdpbmRvdy5TaG93ZG93bik7XG5cbn0pLmNhbGwoZ2xvYmFsLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZ1bmN0aW9uIGRlZmluZUV4cG9ydChleCkgeyBtb2R1bGUuZXhwb3J0cyA9IGV4OyB9KTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi92ZW5kb3Ivc2hvd2Rvd25fZm9yX2Jyb3dzZXJpZnkuanNcIixcIi8uLi8uLi92ZW5kb3JcIikiXX0=
