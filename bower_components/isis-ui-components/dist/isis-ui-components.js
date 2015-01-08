(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular*/

require( './services/isisUIServices.js' );

require( './simpleDialog/simpleDialog.js' );
require( './hierarchicalMenu/hierarchicalMenu.js' );
require( './contextmenu/contextmenu.js' );
require( './dropdownNavigator/dropdownNavigator.js' );
require( './treeNavigator/treeNavigator.js' );
require( './itemList/itemList.js' );
require( './searchBox/searchBox.js' );
require( './valueWidgets/valueWidgets.js' );
require( './decisionTable/decisionTable.js' );
require( './taxonomyTerms/taxonomyTerms.js' );

angular.module( 'isis.ui.components', [
  'isis.ui.components.templates',
  'isis.ui.services',

  'isis.ui.simpleDialog',
  'isis.ui.hierarchicalMenu',
  'isis.ui.contextmenu',
  'isis.ui.dropdownNavigator',
  'isis.ui.treeNavigator',
  'isis.ui.itemList',
  'isis.ui.searchBox',
  'isis.ui.valueWidgets',
  'isis.ui.decisionTable'

] );
},{"./contextmenu/contextmenu.js":5,"./decisionTable/decisionTable.js":8,"./dropdownNavigator/dropdownNavigator.js":9,"./hierarchicalMenu/hierarchicalMenu.js":11,"./itemList/itemList.js":14,"./searchBox/searchBox.js":21,"./services/isisUIServices.js":22,"./simpleDialog/simpleDialog.js":23,"./taxonomyTerms/taxonomyTerms.js":25,"./treeNavigator/treeNavigator.js":27,"./valueWidgets/valueWidgets.js":36}],2:[function(require,module,exports){
!function(){"use strict";function a(a,b){return a.module("angularMoment",[]).constant("angularMomentConfig",{preprocess:null,timezone:"",format:null}).constant("moment",b).constant("amTimeAgoConfig",{withoutSuffix:!1,serverTime:null}).directive("amTimeAgo",["$window","moment","amMoment","amTimeAgoConfig","angularMomentConfig",function(b,c,d,e,f){return function(g,h,i){function j(){var a;if(e.serverTime){var b=(new Date).getTime(),d=b-t+e.serverTime;a=c(d)}else a=c();return a}function k(){q&&(b.clearTimeout(q),q=null)}function l(a){if(h.text(a.from(j(),s)),!w){var c=Math.abs(j().diff(a,"minute")),d=3600;1>c?d=1:60>c?d=30:180>c&&(d=300),q=b.setTimeout(function(){l(a)},1e3*d)}}function m(a){x&&h.attr("datetime",a)}function n(){if(k(),o){var a=d.preprocessDate(o,u,r);l(a),m(a.toISOString())}}var o,p,q=null,r=f.format,s=e.withoutSuffix,t=(new Date).getTime(),u=f.preprocess,v=i.amTimeAgo.replace(/^::/,""),w=0===i.amTimeAgo.indexOf("::"),x="TIME"===h[0].nodeName.toUpperCase();p=g.$watch(v,function(a){return"undefined"==typeof a||null===a||""===a?(k(),void(o&&(h.text(""),m(""),o=null))):(o=a,n(),void(void 0!==a&&w&&p()))}),a.isDefined(i.amWithoutSuffix)&&g.$watch(i.amWithoutSuffix,function(a){"boolean"==typeof a?(s=a,n()):s=e.withoutSuffix}),i.$observe("amFormat",function(a){"undefined"!=typeof a&&(r=a,n())}),i.$observe("amPreprocess",function(a){u=a,n()}),g.$on("$destroy",function(){k()}),g.$on("amMoment:localeChanged",function(){n()})}}]).service("amMoment",["moment","$rootScope","$log","angularMomentConfig",function(b,c,d,e){var f=this;this.preprocessors={utc:b.utc,unix:b.unix},this.changeLocale=function(d){var e=(b.locale||b.lang)(d);return a.isDefined(d)&&(c.$broadcast("amMoment:localeChanged"),c.$broadcast("amMoment:languageChange")),e},this.changeLanguage=function(a){return d.warn("angular-moment: Usage of amMoment.changeLanguage() is deprecated. Please use changeLocale()"),f.changeLocale(a)},this.preprocessDate=function(c,f,g){return a.isUndefined(f)&&(f=e.preprocess),this.preprocessors[f]?this.preprocessors[f](c,g):(f&&d.warn("angular-moment: Ignoring unsupported value for preprocess: "+f),!isNaN(parseFloat(c))&&isFinite(c)?b(parseInt(c,10)):b(c,g))},this.applyTimezone=function(a){var b=e.timezone;return a&&b&&(a.tz?a=a.tz(b):d.warn("angular-moment: timezone specified but moment.tz() is undefined. Did you forget to include moment-timezone.js?")),a}}]).filter("amCalendar",["moment","amMoment",function(a,b){return function(c,d){if("undefined"==typeof c||null===c)return"";c=b.preprocessDate(c,d);var e=a(c);return e.isValid()?b.applyTimezone(e).calendar():""}}]).filter("amDateFormat",["moment","amMoment",function(a,b){return function(c,d,e){if("undefined"==typeof c||null===c)return"";c=b.preprocessDate(c,e);var f=a(c);return f.isValid()?b.applyTimezone(f).format(d):""}}]).filter("amDurationFormat",["moment",function(a){return function(b,c,d){return"undefined"==typeof b||null===b?"":a.duration(b,c).humanize(d)}}])}"function"==typeof define&&define.amd?define("angular-moment",["angular","moment"],a):a(angular,window.moment)}();
//# sourceMappingURL=angular-moment.min.js.map
},{}],3:[function(require,module,exports){
!function(a,b){"use strict";b.module("ui.sortable",[]).value("uiSortableConfig",{}).directive("uiSortable",["uiSortableConfig","$timeout","$log",function(a,c,d){return{require:"?ngModel",link:function(e,f,g,h){function i(a,b){return b&&"function"==typeof b?function(c,d){a(c,d),b(c,d)}:a}function j(a,b){var c=a.sortable("option","helper");return"clone"===c||"function"==typeof c&&b.item.sortable.isCustomHelperUsed()}var k,l={},m={receive:null,remove:null,start:null,stop:null,update:null},n={helper:null};return b.extend(l,a,e.$eval(g.uiSortable)),b.element.fn&&b.element.fn.jquery?(h?(e.$watch(g.ngModel+".length",function(){c(function(){f.data("ui-sortable")&&f.sortable("refresh")})}),m.start=function(a,b){b.item.sortable={index:b.item.index(),cancel:function(){b.item.sortable._isCanceled=!0},isCanceled:function(){return b.item.sortable._isCanceled},isCustomHelperUsed:function(){return!!b.item.sortable._isCustomHelperUsed},_isCanceled:!1,_isCustomHelperUsed:b.item.sortable._isCustomHelperUsed}},m.activate=function(){k=f.contents();var a=f.sortable("option","placeholder");if(a&&a.element&&"function"==typeof a.element){var c=a.element();c=b.element(c);var d=f.find('[class="'+c.attr("class")+'"]');k=k.not(d)}},m.update=function(a,b){b.item.sortable.received||(b.item.sortable.dropindex=b.item.index(),b.item.sortable.droptarget=b.item.parent(),f.sortable("cancel")),j(f,b)&&!b.item.sortable.received&&"parent"===f.sortable("option","appendTo")&&(k=k.not(k.last())),k.appendTo(f),b.item.sortable.received&&(k=null),b.item.sortable.received&&!b.item.sortable.isCanceled()&&e.$apply(function(){h.$modelValue.splice(b.item.sortable.dropindex,0,b.item.sortable.moved)})},m.stop=function(a,b){!b.item.sortable.received&&"dropindex"in b.item.sortable&&!b.item.sortable.isCanceled()?e.$apply(function(){h.$modelValue.splice(b.item.sortable.dropindex,0,h.$modelValue.splice(b.item.sortable.index,1)[0])}):"dropindex"in b.item.sortable&&!b.item.sortable.isCanceled()||j(f,b)||k.appendTo(f),k=null},m.receive=function(a,b){b.item.sortable.received=!0},m.remove=function(a,b){"dropindex"in b.item.sortable||(f.sortable("cancel"),b.item.sortable.cancel()),b.item.sortable.isCanceled()||e.$apply(function(){b.item.sortable.moved=h.$modelValue.splice(b.item.sortable.index,1)[0]})},n.helper=function(a){return a&&"function"==typeof a?function(b,c){var d=a(b,c);return c.sortable._isCustomHelperUsed=c!==d,d}:a},e.$watch(g.uiSortable,function(a){f.data("ui-sortable")&&b.forEach(a,function(a,b){m[b]?("stop"===b&&(a=i(a,function(){e.$apply()})),a=i(m[b],a)):n[b]&&(a=n[b](a)),f.sortable("option",b,a)})},!0),b.forEach(m,function(a,b){l[b]=i(a,l[b])})):d.info("ui.sortable: ngModel not provided!",f),void f.sortable(l)):void d.error("ui.sortable: jQuery should be included before AngularJS!")}}}])}(window,window.angular);
},{}],4:[function(require,module,exports){
(function (global){
//! moment.js
//! version : 2.8.4
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {
    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = '2.8.4',
        // the global-scope this is NOT the global object in Node.js
        globalScope = typeof global !== 'undefined' ? global : this,
        oldGlobalMoment,
        round = Math.round,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

        // internal storage for locale config files
        locales = {},

        // extra moment internal properties (plugins register props here)
        momentProperties = [],

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenOffsetMs = /[\+\-]?\d+/, // 1234567890123
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

        //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-15', '30']
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

        // format function strings
        formatFunctions = {},

        // default relative time thresholds
        relativeTimeThresholds = {
            s: 45,  // seconds to minute
            m: 45,  // minutes to hour
            h: 22,  // hours to day
            d: 26,  // days to month
            M: 11   // months to year
        },

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.localeData().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.localeData().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.localeData().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.localeData().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.localeData().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            x    : function () {
                return this.valueOf();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        deprecations = {},

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

    // Pick the first defined of two or three arguments. dfl comes from
    // default.
    function dfl(a, b, c) {
        switch (arguments.length) {
            case 2: return a != null ? a : b;
            case 3: return a != null ? a : b != null ? b : c;
            default: throw new Error('Implement me');
        }
    }

    function hasOwnProp(a, b) {
        return hasOwnProperty.call(a, b);
    }

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function printMsg(msg) {
        if (moment.suppressDeprecationWarnings === false &&
                typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            if (firstTime) {
                printMsg(msg);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            printMsg(msg);
            deprecations[name] = true;
        }
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.localeData().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Locale() {
    }

    // Moment prototype object
    function Moment(config, skipOverflow) {
        if (skipOverflow !== false) {
            checkOverflow(config);
        }
        copyConfig(this, config);
        this._d = new Date(+config._d);
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = moment.localeData();

        this._bubble();
    }

    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = from._pf;
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = makeAs(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = moment.duration(val, period);
            addOrSubtractDurationFromMoment(this, dur, direction);
            return this;
        };
    }

    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' ||
            input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment._locale[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment._locale, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                m._a[HOUR] < 0 || m._a[HOUR] > 24 ||
                    (m._a[HOUR] === 24 && (m._a[MINUTE] !== 0 ||
                                           m._a[SECOND] !== 0 ||
                                           m._a[MILLISECOND] !== 0)) ? HOUR :
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 &&
                !m._pf.empty &&
                !m._pf.invalidMonth &&
                !m._pf.nullInput &&
                !m._pf.invalidFormat &&
                !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0 &&
                    m._pf.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && hasModule) {
            try {
                oldLocale = moment.locale();
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function makeAs(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (moment.isMoment(input) || isDate(input) ?
                    +input : +moment(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            moment.updateOffset(res, false);
            return res;
        } else {
            return moment(input).local();
        }
    }

    /************************************
        Locale
    ************************************/


    extend(Locale.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _ordinalParseLenient.
            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
        },

        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName, format, strict) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = moment.utc([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
                }
                if (!strict && !this._monthsParse[i]) {
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                    return i;
                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LTS : 'h:mm:ss A',
            LT : 'h:mm A',
            L : 'MM/DD/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM D, YYYY LT'
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom, now) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom, [now]) : output;
        },

        _relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },

        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },

        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace('%d', number);
        },
        _ordinal : '%d',
        _ordinalParse : /\d{1,2}/,

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
        case 'Q':
            return parseTokenOneDigit;
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
        case 'GGGG':
        case 'gggg':
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
        case 'Y':
        case 'G':
        case 'g':
            return parseTokenSignedNumber;
        case 'YYYYYY':
        case 'YYYYY':
        case 'GGGGG':
        case 'ggggg':
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
        case 'S':
            if (strict) {
                return parseTokenOneDigit;
            }
            /* falls through */
        case 'SS':
            if (strict) {
                return parseTokenTwoDigits;
            }
            /* falls through */
        case 'SSS':
            if (strict) {
                return parseTokenThreeDigits;
            }
            /* falls through */
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return config._locale._meridiemParse;
        case 'x':
            return parseTokenOffsetMs;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'SSSS':
            return parseTokenDigits;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'GG':
        case 'gg':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'ww':
        case 'WW':
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
            return parseTokenOneOrTwoDigits;
        case 'Do':
            return strict ? config._locale._ordinalParse : config._locale._ordinalParseLenient;
        default :
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
            return a;
        }
    }

    function timezoneMinutesFromString(string) {
        string = string || '';
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // QUARTER
        case 'Q':
            if (input != null) {
                datePartArray[MONTH] = (toInt(input) - 1) * 3;
            }
            break;
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = config._locale.monthsParse(input, token, config._strict);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DD
        case 'DD' :
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;
        case 'Do' :
            if (input != null) {
                datePartArray[DATE] = toInt(parseInt(
                            input.match(/\d{1,2}/)[0], 10));
            }
            break;
        // DAY OF YEAR
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                config._dayOfYear = toInt(input);
            }

            break;
        // YEAR
        case 'YY' :
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;
        case 'YYYY' :
        case 'YYYYY' :
        case 'YYYYYY' :
            datePartArray[YEAR] = toInt(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = config._locale.isPM(input);
            break;
        // HOUR
        case 'h' : // fall through to hh
        case 'hh' :
            config._pf.bigHour = true;
            /* falls through */
        case 'H' : // fall through to HH
        case 'HH' :
            datePartArray[HOUR] = toInt(input);
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[MINUTE] = toInt(input);
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[SECOND] = toInt(input);
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
        case 'SSSS' :
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
            break;
        // UNIX OFFSET (MILLISECONDS)
        case 'x':
            config._d = new Date(toInt(input));
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        // WEEKDAY - human
        case 'dd':
        case 'ddd':
        case 'dddd':
            a = config._locale.weekdaysParse(input);
            // if we didn't get a weekday name, mark the date as invalid
            if (a != null) {
                config._w = config._w || {};
                config._w['d'] = a;
            } else {
                config._pf.invalidWeekday = input;
            }
            break;
        // WEEK, WEEK DAY - numeric
        case 'w':
        case 'ww':
        case 'W':
        case 'WW':
        case 'd':
        case 'e':
        case 'E':
            token = token.substr(0, 1);
            /* falls through */
        case 'gggg':
        case 'GGGG':
        case 'GGGGG':
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = toInt(input);
            }
            break;
        case 'gg':
        case 'GG':
            config._w = config._w || {};
            config._w[token] = moment.parseTwoDigitYear(input);
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        // Apply timezone offset from input. The actual zone can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day || normalizedInput.date,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._pf.bigHour === true && config._a[HOUR] <= 12) {
            config._pf.bigHour = undefined;
        }
        // handle am pm
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }
        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function parseISO(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be 'T' or undefined
                    config._f = isoDates[i][0] + (match[6] || ' ');
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += 'Z';
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function makeDateFromString(config) {
        parseISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function makeDateFromInput(config) {
        var input = config._i, matched;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            dateFromConfig(config);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, locale) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = locale.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = moment.duration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            years = round(duration.as('y')),

            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < relativeTimeThresholds.h && ['hh', hours] ||
                days === 1 && ['d'] ||
                days < relativeTimeThresholds.d && ['dd', days] ||
                months === 1 && ['M'] ||
                months < relativeTimeThresholds.M && ['MM', months] ||
                years === 1 && ['y'] || ['yy', years];

        args[2] = withoutSuffix;
        args[3] = +posNegDuration > 0;
        args[4] = locale;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        d = d === 0 ? 7 : d;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f,
            res;

        config._locale = config._locale || moment.localeData(config._l);

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (moment.isMoment(input)) {
            return new Moment(input, true);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        res = new Moment(config);
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    moment = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = locale;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return moment();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    moment.min = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    };

    moment.max = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    };

    // creating with utc
    moment.utc = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso,
            diffRes;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        } else if (typeof duration === 'object' &&
                ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // constant that refers to the ISO standard
    moment.ISO_8601 = function () {};

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function allows you to set a threshold for relative time strings
    moment.relativeTimeThreshold = function (threshold, limit) {
        if (relativeTimeThresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return relativeTimeThresholds[threshold];
        }
        relativeTimeThresholds[threshold] = limit;
        return true;
    };

    moment.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        function (key, value) {
            return moment.locale(key, value);
        }
    );

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    moment.locale = function (key, values) {
        var data;
        if (key) {
            if (typeof(values) !== 'undefined') {
                data = moment.defineLocale(key, values);
            }
            else {
                data = moment.localeData(key);
            }

            if (data) {
                moment.duration._locale = moment._locale = data;
            }
        }

        return moment._locale._abbr;
    };

    moment.defineLocale = function (name, values) {
        if (values !== null) {
            values.abbr = name;
            if (!locales[name]) {
                locales[name] = new Locale();
            }
            locales[name].set(values);

            // backwards compat for now: also set the locale
            moment.locale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    };

    moment.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        function (key) {
            return moment.localeData(key);
        }
    );

    // returns locale data
    moment.localeData = function (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return moment._locale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null && hasOwnProp(obj, '_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    /************************************
        Moment Prototype
    ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                if ('function' === typeof Date.prototype.toISOString) {
                    // native implementation is ~50x faster, use it when we can
                    return this.toDate().toISOString();
                } else {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                }
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {
            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function (keepLocalTime) {
            return this.zone(0, keepLocalTime);
        },

        local : function (keepLocalTime) {
            if (this._isUTC) {
                this.zone(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.add(this._dateTzOffset(), 'm');
                }
            }
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.localeData().postformat(output);
        },

        add : createAdder(1, 'add'),

        subtract : createAdder(-1, 'subtract'),

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output, daysAdjust;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                daysAdjust = (this - moment(this).startOf('month')) -
                    (that - moment(that).startOf('month'));
                // same as above but with zones, to negate all dst
                daysAdjust -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4;
                output += daysAdjust / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function (time) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're zone'd or not.
            var now = time || moment(),
                sod = makeAs(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.localeData().calendar(format, this, moment(now)));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf : function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond') {
                return this;
            }
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        },

        isAfter: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this > +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return inputMs < +this.clone().startOf(units);
            }
        },

        isBefore: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this < +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return +this.clone().endOf(units) < inputMs;
            }
        },

        isSame: function (input, units) {
            var inputMs;
            units = normalizeUnits(units || 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this === +input;
            } else {
                inputMs = +moment(input);
                return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
            }
        },

        min: deprecate(
                 'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
                 function (other) {
                     other = moment.apply(null, arguments);
                     return other < this ? this : other;
                 }
         ),

        max: deprecate(
                'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
                function (other) {
                    other = moment.apply(null, arguments);
                    return other > this ? this : other;
                }
        ),

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[zone(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist int zone
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        zone : function (input, keepLocalTime) {
            var offset = this._offset || 0,
                localAdjust;
            if (input != null) {
                if (typeof input === 'string') {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = this._dateTzOffset();
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.subtract(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                                moment.duration(offset - input, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
            } else {
                return this._isUTC ? offset : this._dateTzOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? 'UTC' : '';
        },

        zoneName : function () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        },

        parseZone : function () {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === 'string') {
                this.zone(this._i);
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).zone();
            }

            return (this.zone() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        week : function (input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                this[units](value);
            }
            return this;
        },

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        locale : function (key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = moment.localeData(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        },

        lang : deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        ),

        localeData : function () {
            return this._locale;
        },

        _dateTzOffset : function () {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return Math.round(this._d.getTimezoneOffset() / 15) * 15;
        }
    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
                daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    function daysToYears (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        return days * 400 / 146097;
    }

    function yearsToDays (years) {
        // years * 365 + absRound(years / 4) -
        //     absRound(years / 100) + absRound(years / 400);
        return years * 146097 / 400;
    }

    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years = 0;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);

            // Accurately convert days to years, assume start from year 0.
            years = absRound(daysToYears(days));
            days -= absRound(yearsToDays(years));

            // 30 days to a month
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
            months += absRound(days / 30);
            days %= 30;

            // 12 months -> 1 year
            years += absRound(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;
        },

        abs : function () {
            this._milliseconds = Math.abs(this._milliseconds);
            this._days = Math.abs(this._days);
            this._months = Math.abs(this._months);

            this._data.milliseconds = Math.abs(this._data.milliseconds);
            this._data.seconds = Math.abs(this._data.seconds);
            this._data.minutes = Math.abs(this._data.minutes);
            this._data.hours = Math.abs(this._data.hours);
            this._data.months = Math.abs(this._data.months);
            this._data.years = Math.abs(this._data.years);

            return this;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var output = relativeTime(this, !withSuffix, this.localeData());

            if (withSuffix) {
                output = this.localeData().pastFuture(+this, output);
            }

            return this.localeData().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            var days, months;
            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days = this._days + this._milliseconds / 864e5;
                months = this._months + daysToYears(days) * 12;
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(yearsToDays(this._months / 12));
                switch (units) {
                    case 'week': return days / 7 + this._milliseconds / 6048e5;
                    case 'day': return days + this._milliseconds / 864e5;
                    case 'hour': return days * 24 + this._milliseconds / 36e5;
                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;
                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        },

        lang : moment.fn.lang,
        locale : moment.fn.locale,

        toIsoString : deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead ' +
            '(notice the capitals)',
            function () {
                return this.toISOString();
            }
        ),

        toISOString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        },

        localeData : function () {
            return this._locale;
        }
    });

    moment.duration.fn.toString = moment.duration.fn.toISOString;

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    for (i in unitMillisecondFactors) {
        if (hasOwnProp(unitMillisecondFactors, i)) {
            makeDurationGetter(i.toLowerCase());
        }
    }

    moment.duration.fn.asMilliseconds = function () {
        return this.as('ms');
    };
    moment.duration.fn.asSeconds = function () {
        return this.as('s');
    };
    moment.duration.fn.asMinutes = function () {
        return this.as('m');
    };
    moment.duration.fn.asHours = function () {
        return this.as('h');
    };
    moment.duration.fn.asDays = function () {
        return this.as('d');
    };
    moment.duration.fn.asWeeks = function () {
        return this.as('weeks');
    };
    moment.duration.fn.asMonths = function () {
        return this.as('M');
    };
    moment.duration.fn.asYears = function () {
        return this.as('y');
    };

    /************************************
        Default Locale
    ************************************/


    // Set default locale, other locale will inherit from English.
    moment.locale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    /* EMBED_LOCALES */

    /************************************
        Exposing Moment
    ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate(
                    'Accessing Moment through the global scope is ' +
                    'deprecated, and will be removed in an upcoming ' +
                    'release.',
                    moment);
        } else {
            globalScope.moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === 'function' && define.amd) {
        define('moment', function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
/*globals angular, $*/
'use strict';

angular.module(
  'isis.ui.contextmenu', [ 'isis.ui.hierarchicalMenu' ]
)
  .factory(
    'contextmenuService', [ '$document', '$compile', '$window', '$templateCache',
      function ( $document, $compile, $window, $templateCache ) {

        var
        service = {},
          setPosition,
          body = $document.find( 'body' )
            .eq( 0 ),
          widthWatcher, heightWatcher,
          menuScope,
          opened = false,
          handleKeyUpEvent,
          handleMouseDownEvent,
          handleClickEvent,
          handleScrollEvent,
          handleResizeEvent,
          handleBlurEvent,
          bindEvents,

          autoCloseOnClick = true,

          window = angular.element(
            $window
          );

        handleKeyUpEvent = function ( event ) {
          if ( opened && event.keyCode === 27 ) {
            service.close();
          }
        };

        handleMouseDownEvent = function ( event ) {

          if ( opened &&
            service.menuElement && !$.contains( service.menuElement[ 0 ], event.target ) &&
            event.target !== service.triggerElement ) {
            service.close();
          }
        };

        handleClickEvent = function ( event ) {

          if ( opened &&
            ( autoCloseOnClick || ( service.menuElement && !$.contains( service.menuElement[ 0 ],
              event.target ) ) ) &&
            ( event.target !== service.triggerElement ) ) {

            service.close();
            return false;
          }

        };

        handleScrollEvent = function () {
          if ( opened ) {
            service.close();
          }
        };

        handleResizeEvent = function () {
          if ( opened ) {
            service.close();
          }
        };

        handleBlurEvent = function () {
          if ( opened ) {
            service.close();
          }
        };

        bindEvents = function () {
          $document.bind(
            'keyup', handleKeyUpEvent
          );
          // Firefox treats a right-click as a click and a contextmenu event while other browsers
          // just treat it as a contextmenu event

          $document.bind(
            'scroll', handleScrollEvent
          );

          window.bind(
            'resize', handleResizeEvent
          );
          window.bind(
            'blur', handleBlurEvent
          );

          $document.bind(
            'click', handleClickEvent
          );
          $document.bind(
            'mousedown', handleMouseDownEvent
          );
          $document.bind(
            'contextmenu', handleClickEvent
          );

        };

        setPosition = function ( position, menuElement ) {

          var menuBounds = menuElement[ 0 ].getBoundingClientRect(),
            menuWidth = menuBounds.right - menuBounds.left,
            menuHeight = menuBounds.bottom - menuBounds.top,

            windowHeight = window[ 0 ].innerHeight,
            windowWidth = window[ 0 ].innerWidth,

            windowLeftEdge = window[ 0 ].pageXOffset,
            windowTopEdge = window[ 0 ].pageYOffset,

            windowRightEdge = windowWidth + windowLeftEdge,
            windowBottomEdge = windowHeight + windowTopEdge,

            top = Math.max(
              position.pageY, windowTopEdge
            ),

            left = Math.max(
              position.pageX, windowLeftEdge
            ),

            totalHeightNeeded = menuHeight + top,
            totalWidthNeeded = menuWidth + left,

            overLeftEdge = totalWidthNeeded - windowRightEdge,
            overBottomEdge = totalHeightNeeded - windowBottomEdge;


          //console.log(top, menuHeight, windowTopEdge, windowHeight);


          if ( overBottomEdge > 0 ) {
            top = top - overBottomEdge;
          }

          if ( overLeftEdge > 0 ) {
            left = left - overLeftEdge;
          }

          menuElement.css(
            'top', top + 'px'
          );
          menuElement.css(
            'left', left + 'px'
          );


          // Setting property of menu to drop on left side if no room on right for sub menus

        };

        service.open = function ( triggerElement, contentTemplateUrl, aScope, position,
          doNotAutocloseOnClick, menuCssClass) {

          var shellAngularElement = angular.element( $templateCache.get(
            '/isis-ui-components/templates/contextmenu.html' ) ),
            menuDOMElement,
            sameTriggerElement = ( service.triggerElement === triggerElement );

          autoCloseOnClick = doNotAutocloseOnClick !== true;

          if ( opened ) {
            service.close();
          }

          if ( !sameTriggerElement ) {

            // do not re-open if the same triggerelement was clicked

            menuScope = aScope.$new();

            menuScope.contentTemplateUrl = contentTemplateUrl;
            menuScope.menuCssClass = menuCssClass;


            body.append( shellAngularElement );
            menuDOMElement = $compile( shellAngularElement )( menuScope );

            service.menuElement = menuDOMElement;
            service.triggerElement = triggerElement;

            setPosition( position, menuDOMElement );

            widthWatcher = menuScope.$watch(
              function () {
                return menuDOMElement[ 0 ].scrollWidth;
              },

              function () {
                setPosition( position, menuDOMElement );
              }
            );

            heightWatcher = menuScope.$watch(
              function () {
                return menuDOMElement[ 0 ].scrollHeight;
              },

              function () {
                setPosition( position, menuDOMElement );
              }
            );

            bindEvents();
            opened = true;
          }

        };

        service.close = function () {

          if ( angular.isObject( menuScope ) && angular.isFunction( menuScope.$destroy ) ) {

            service.menuElement.remove();
            menuScope.$destroy();
            menuScope = undefined;

            service.menuElement = null;
            service.triggerElement = null;

            opened = false;
          }
        };

        service.triggerElement = null;

        return service;

      }
    ] )
  .directive(
    'isisContextmenu',

    [ '$document', 'contextmenuService', '$window', '$rootScope',
      function ( $document, contextmenuService ) {

        return {
          restrict: 'A',
          scope: {
            contextmenuConfig: '=',
            contextmenuData: '=',
            callback: '&contextmenu',
            disabled: '&contextmenuDisabled'
          },

          link: function ( scope, element ) {

            var open,
              handleContextmenuEvent,
              options = {
                triggerEvent: 'contextmenu',
                contentTemplateUrl: '/isis-ui-components/templates/contextmenu.DefaultContents.html'
              };

            if ( !angular.isFunction( scope.disabled ) ) {
              scope.disabled = function () {
                return false;
              };
            }

            if ( angular.isObject( scope.contextmenuConfig ) ) {
              angular.extend( options, scope.contextmenuConfig );
            }

            element.addClass( 'context-menu-trigger' );

            open = function ( event ) {

              var position,
                bounds,
                menuParentScope;

              position = {
                pageX: event.pageX,
                pageY: event.pageY
              };

              if ( scope.contextmenuConfig && scope.contextmenuConfig.position ) {

                bounds = element[ 0 ].getBoundingClientRect();

                if ( scope.contextmenuConfig.position === 'left bottom' ) {

                  position.pageX = bounds.left + window.pageXOffset;
                  position.pageY = bounds.bottom + window.pageYOffset;

                } else if ( scope.contextmenuConfig.position === 'right bottom' ) {

                  position.pageX = bounds.right + window.pageXOffset;
                  position.pageY = bounds.bottom + window.pageYOffset;

                }
              }

              if ( !scope.disabled() ) {

                menuParentScope = options.menuParentScope || scope;

                contextmenuService.open(
                  event.target, options.contentTemplateUrl, menuParentScope, position, options.doNotAutoClose,
                  options.menuCssClass
                );

              }
            };

            handleContextmenuEvent = function ( event ) {
              if ( !scope.disabled() ) {

                if ( event.target !== contextmenuService.triggerElement ) {

                  event.preventDefault();
                  event.stopPropagation();

                  scope.$apply(
                    function () {
                      scope.callback( {
                        $event: event
                      } );
                      open( event );
                    }
                  );

                } else {

                  event.preventDefault();
                  event.stopPropagation();

                  contextmenuService.close();
                }
              }
            };

            element.bind(
              options.triggerEvent, handleContextmenuEvent
            );

            scope.$on(
              '$destroy', function () {
                element.unbind(
                  options.triggerEvent, handleContextmenuEvent
                );
              }
            );
          }

        };
      }
    ] );
},{}],6:[function(require,module,exports){
/*globals angular*/

'use strict';

var tableRowHeight = 31,
  tableHeaderHeight = 31,
  cellTemplate;

cellTemplate = '<div class="ngCellText decisions" ng-class="col.colIndex()"><span ng-cell-text>{{COL_FIELD CUSTOM_FILTERS}}</span></div>';

angular.module(
'isis.ui.decisionTable.decisions', ['ngGrid']

)
.controller('DecisionTableDecisionsController', function ($scope) {

  $scope.getDecisionTableGridStyle = function() {

    var height = tableHeaderHeight + 'px';

    if (angular.isArray($scope.decisionsData)) {
      height = tableHeaderHeight + tableRowHeight * $scope.decisionsData.length + 'px';
    }

    return {
      height: height
    };
  };

  angular.forEach($scope.decisionsOptions.columnDefs, function() {
    //columnDef.cellTemplate = cellTemplate;
  });


})
.directive(
'decisionTableDecisions',
function () {

  return {
    controller: 'DecisionTableDecisionsController',
    scope: {
      decisionsData: '=',
      decisionsOptions: '='
    },
    restrict: 'E',
    replace: true,
    templateUrl: '/isis-ui-components/templates/decisionTable.decisions.html'

  };
});


},{}],7:[function(require,module,exports){
/*globals angular*/

'use strict';

var tableRowHeight = 31,
  tableHeaderHeight = 31;

angular.module(
'isis.ui.decisionTable.declarations', ['ngGrid']

)
.controller('DecisionTableDeclarationsController', function ($scope) {

  $scope.getDeclarationTableGridStyle = function() {

    var height = tableHeaderHeight + 'px';

    if (angular.isArray($scope.declarationsData)) {
      height = tableHeaderHeight + tableRowHeight * $scope.declarationsData.length + 'px';
    }

    return {
      height: height
    };
  };

})
.directive(
'decisionTableDeclarations',
function () {

  return {
    controller: 'DecisionTableDeclarationsController',
    scope: {
      declarationsData: '=',
      declarationsOptions: '='
    },
    restrict: 'E',
    replace: true,
    templateUrl: '/isis-ui-components/templates/decisionTable.declarations.html'

  };
});


},{}],8:[function(require,module,exports){
/*globals angular*/
'use strict';

require('./decisionTable.decisions.js');
require('./decisionTable.declarations.js');

angular.module(
'isis.ui.decisionTable', ['isis.ui.decisionTable.decisions', 'isis.ui.decisionTable.declarations']

)
.controller('DecisionTableController', function ($scope) {

  $scope.declarationsOptions = {
    data: 'declarationsData',
    columnDefs: $scope.tableData.declarations.columnDefs
  };

  $scope.decisionsOptions = {
    data: 'decisionsData',
    columnDefs: $scope.tableData.decisions.columnDefs
  };

})
.directive(
'decisionTable',
function () {

  return {
    scope: {
      tableData: '=',
      config: '='
    },
    controller: 'DecisionTableController',
    restrict: 'E',
    replace: true,
    templateUrl: '/isis-ui-components/templates/decisionTable.html'

  };
});


},{"./decisionTable.decisions.js":6,"./decisionTable.declarations.js":7}],9:[function(require,module,exports){
/*globals angular*/
'use strict';

angular.module(
  'isis.ui.dropdownNavigator', [ 'isis.ui.hierarchicalMenu' ]
)
  .directive(
    'dropdownNavigator',
    function () {

      return {
        scope: {
          navigator: '='
        },
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/dropdownNavigator.html'
      };
    } );
},{}],10:[function(require,module,exports){
/*globals angular*/
'use strict';

/*
 * An Angular service which helps with creating recursive directives.
 * @author Mark Lagendijk
 * @license MIT
 */
angular.module( 'RecursionHelper', [] )
  .factory( 'RecursionHelper', [ '$compile',
    function ( $compile ) {
      return {
        /**
         * Manually compiles the element, fixing the recursion loop.
         * @param element
         * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
         * @returns An object containing the linking functions.
         */
        compile: function ( element, link ) {
          // Normalize the link parameter
          if ( angular.isFunction( link ) ) {
            link = {
              post: link
            };
          }

          // Break the recursion loop by removing the contents
          var contents = element.contents()
            .remove();
          var compiledContents;
          return {
            pre: ( link && link.pre ) ? link.pre : null,
            /**
             * Compiles and re-adds the contents
             */
            post: function ( scope, element ) {
              // Compile the contents
              if ( !compiledContents ) {
                compiledContents = $compile( contents );
              }
              // Re-add the compiled contents to the element
              compiledContents( scope, function ( clone ) {
                element.append( clone );
              } );

              // Call the post-linking function, if any
              if ( link && link.post ) {
                link.post.apply( null, arguments );
              }
            }
          };
        }
      };
    }
  ] );
},{}],11:[function(require,module,exports){
/*globals angular*/
'use strict';

angular.module(
  'isis.ui.hierarchicalMenu', [
    'ui.bootstrap',
    'isis.ui.components'
  ]
)
  .directive(
    'hierarchicalMenu', [ '$window', '$document',
      function ( $window, $document ) {

        var window = angular.element(
          $window
        );

        return {
          scope: {
            menu: '=',
            config: '='
          },
          restrict: 'E',

          replace: true,
          templateUrl: '/isis-ui-components/templates/hierarchicalMenu.html',

          link: function ( $scope, element ) {

            var whichSideToDropSubs;

            whichSideToDropSubs = function () {

              var elementBounds = element[ 0 ].getBoundingClientRect(),
                windowLeftEdge = window[ 0 ].pageXOffset,
                width = elementBounds.right - elementBounds.left,
                rightBorderX = elementBounds.right,
                leftBorderX = elementBounds.left,
                windowWidth = window[ 0 ].innerWidth,
                windowRightEdge = windowWidth + windowLeftEdge,
                wouldBeRightBorderOfSub = width + rightBorderX;

              if ( windowRightEdge < wouldBeRightBorderOfSub && leftBorderX > width ) {
                element.addClass( 'drop-left' );
              } else {
                element.removeClass( 'drop-left' );
              }

            };

            $scope.$watch(
              function () {
                return element[ 0 ].scrollWidth;
              },

              function () {
                whichSideToDropSubs();
              }
            );

            $document.bind(
              'scroll', whichSideToDropSubs
            );

            window.bind(
              'resize', whichSideToDropSubs
            );

            $scope.$on( '$destroy', function () {
              $document.unbind(
                'scroll', whichSideToDropSubs
              );

              window.unbind(
                'resize', whichSideToDropSubs
              );
            } );
          }
        };
      }
    ] );
},{}],12:[function(require,module,exports){
/*globals angular*/
'use strict';

angular.module(
  'isis.ui.itemList.item.details', []
)
  .controller( 'ItemListItemDetailsController', function ( $scope ) {

    $scope.config.showDetailsLabel = $scope.config.showDetailsLabel || 'Details';
    $scope.config.hideDetailsLabel = $scope.config.hideDetailsLabel || 'Details';

    $scope.expanded = false;

    $scope.getExpanderClass = function () {
      if ( $scope.expanded ) {
        return 'glyphicon glyphicon-chevron-up';
      } else {
        return 'glyphicon glyphicon-chevron-right';
      }
    };

    $scope.getExpanderLabel = function () {
      if ( $scope.expanded ) {
        return $scope.config.hideDetailsLabel;
      } else {
        return $scope.config.showDetailsLabel;
      }
    };

    $scope.detailsCollapserClick = function () {
      $scope.expanded = !$scope.expanded;
    };

  } )
  .directive(

    'ilItemDetails',

    function () {

      return {
        restrict: 'E',
        replace: true,
        require: '^itemList',
        controller: 'ItemListItemDetailsController',
        templateUrl: '/isis-ui-components/templates/itemDetails.html'
      };


    } );
},{}],13:[function(require,module,exports){
/*globals angular*/
'use strict';

angular.module(
  'isis.ui.itemList.item.header', []
)
  .directive(

    'ilItemHeader',

    function () {

      return {
        restrict: 'E',
        replace: true,
        require: '^itemList',
        templateUrl: '/isis-ui-components/templates/itemHeader.html'
      };


    } );
},{}],14:[function(require,module,exports){
/*globals angular*/
'use strict';

require( './listItemGroup.js' );
require( './itemListFilter.js' );
require( './itemListNewItem.js' );
require( '../contextmenu/contextmenu.js' );

angular.module(
  'isis.ui.itemList', [
    'isis.ui.itemList.newItem',
    'isis.ui.itemList.filter',
    'isis.ui.itemList.itemGroup',
    'isis.ui.contextmenu',
    'isis.ui.taxonomyTerms'
  ]
)
  .controller(
    'ItemListController', function ( $scope ) {

      // Event handlers

      $scope.sortableOptions = {
        update: function ( e, ui ) {

          if ( angular.isFunction( $scope.config.itemSort ) ) {
            $scope.config.itemSort( event, ui );
          }

        },
        axis: 'y'
      };

      $scope.itemClick = function ( $event, item ) {

        if ( angular.isFunction( $scope.config.itemClick ) ) {
          $scope.config.itemClick( $event, item );
        }
      };

      $scope.itemContextmenu = function ( $event, node ) {

        if ( angular.isFunction( $scope.config.itemContextmenuRenderer ) ) {
          $scope.itemContextMenuData = $scope.config.itemContextmenuRenderer( $event, node );
        }

      };

      $scope.itemMenuConfig = {
        triggerEvent: 'click',
        position: 'left bottom'
      };

      $scope.config = $scope.config || {};
      $scope.config.noItemsMessage = $scope.config.noItemsMessage || 'No items to show.';

    } )

.directive(
  'itemList',
  function () {

    return {
      scope: {
        listData: '=',
        config: '='
      },
      restrict: 'E',
      replace: true,
      templateUrl: '/isis-ui-components/templates/itemList.html',
      controller: 'ItemListController'
    };
  }
);
},{"../contextmenu/contextmenu.js":5,"./itemListFilter.js":15,"./itemListNewItem.js":17,"./listItemGroup.js":20}],15:[function(require,module,exports){
/*globals angular*/
'use strict';

angular.module(
  'isis.ui.itemList.filter', []
)
  .directive(
    'itemListFilter',
    function () {

      return {
        scope: false,
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/itemListFilter.html',
        require: '^itemList'
      };
    } );
},{}],16:[function(require,module,exports){
/*globals angular*/
'use strict';

require( './itemStats.js' );
require( './itemMenu.js' );
require( './itemDetails.js' );
require( './itemHeader.js' );

angular.module(
  'isis.ui.itemList.item', [
    'isis.ui.itemList.item.stats',
    'isis.ui.itemList.item.menu',
    'isis.ui.itemList.item.details',
    'isis.ui.itemList.item.header'
  ]
)
  .directive(
    'itemListItem',
    function () {

      return {
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/itemListItem.html'
      };
    }
);
},{"./itemDetails.js":12,"./itemHeader.js":13,"./itemMenu.js":18,"./itemStats.js":19}],17:[function(require,module,exports){
/*globals angular*/
'use strict';

angular.module(
  'isis.ui.itemList.newItem', []
)
  .directive(
    'itemListNewItem',
    function () {

      return {
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/itemListNewItem.html',
        require: '^itemList',
        compile: function () {

          return {

            pre: function ( scope, el, attr, itemListCtl ) {

              if ( angular.isObject( scope.config ) && angular.isObject( scope.config.newItemForm ) ) {

                scope.config.newItemForm.controller = scope.config.newItemForm.controller ||
                  function () {
                    return itemListCtl;
                };

                scope.formConfig = scope.config.newItemForm;

              }
            }

          };
        }
      };
    } );
},{}],18:[function(require,module,exports){
/*globals angular*/
'use strict';

angular.module(
  'isis.ui.itemList.item.menu', []
)
  .directive(

    'ilItemMenu',

    function () {

      return {
        restrict: 'E',
        replace: true,
        require: '^itemList',
        templateUrl: '/isis-ui-components/templates/itemMenu.html'
      };


    } );
},{}],19:[function(require,module,exports){
/*globals angular, window*/
'use strict';

window.moment = window.moment || require( 'moment' );
require( 'angular-moment' );

angular.module(
  'isis.ui.itemList.item.stats', [ angular.isFunction( window.define ) ? 'angular-moment' :
    'angularMoment'
  ]
)
  .directive(
    'ilItemStats',
    function () {

      return {
        scope: false,
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/itemStats.html',
        require: '^itemList'
      };
    } );
},{"angular-moment":2,"moment":4}],20:[function(require,module,exports){
/*globals angular*/
'use strict';

require( './itemListItem.js' );
require( 'angular-ui-sortable' );

angular.module(
  'isis.ui.itemList.itemGroup', [
    'isis.ui.itemList.item',
    'ui.sortable'
  ]
)
  .directive(
    'listItemGroup',
    function ( $compile ) {

      return {
        require: '^itemList',
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/listItemGroup.html',
        link: function ( scope, element ) {

          var listElement = element.find('>ul' );

          if ( scope.listData && scope.config && scope.config.sortable === true ) {
            listElement.attr( 'ui-sortable', 'sortableOptions' );
            element.attr( 'ng-model', 'listData.items' );
            $compile( element )( scope );
          }
        }
      };
    } );
},{"./itemListItem.js":16,"angular-ui-sortable":3}],21:[function(require,module,exports){
/*globals angular*/


'use strict';

angular.module(
  'isis.ui.searchBox', []

)
  .directive(
    'searchBox',
    function () {

      return {
        scope: {
          handlers: '=',
          config: '='
        },
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/searchBox.html'

      };
    } );
},{}],22:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
  'isis.ui.services', []
)

.service( 'isisTemplateService', [ '$http', '$templateCache', '$q',
  function ( $http, $templateCache, $q ) {

    this.getTemplate = function ( template, templateUrl ) {

      var deferred,
        cachedTemplate;

      deferred = $q.defer();

      if ( template ) {

        deferred.resolve( template );

      } else if ( templateUrl ) {

        cachedTemplate = $templateCache.get( templateUrl );

        if ( cachedTemplate ) {
          deferred.resolve( cachedTemplate );
        } else {

          $http( {
            method: 'GET',
            url: templateUrl,
            cache: true
          } )
            .then( function ( result ) {

              $templateCache.put( templateUrl, result.data );
              deferred.resolve( result.data );

            } )
            .
          catch ( function ( error ) {
            deferred.reject( error );
          } );

        }
      } else {
        deferred.reject( 'No template or templateUrl has been specified.' );
      }

      return deferred.promise;
    };


  }
] );
},{}],23:[function(require,module,exports){
/*globals angular*/
'use strict';

angular.module(
  'isis.ui.simpleDialog', [
    'ui.bootstrap',
    'isis.ui.components'
  ]
)
  .provider( '$simpleDialog', function () {

    var $simpleDialogProvider = {
      options: {},
      $get: [ '$modal',

        function ( $modal ) {

          var $simpleDialog = {},
            ConfirmDialogController;

          ConfirmDialogController = function ( $scope, $modalInstance, dialogTitle,
            dialogContentTemplate, onOk, onCancel, validator ) {

            $scope.dialogTitle = dialogTitle;
            $scope.dialogContentTemplate = dialogContentTemplate;

            $scope.ok = function () {

              if ( angular.isFunction( validator ) ? validator( $scope ) : true ) {
                $modalInstance.close();
                if ( angular.isFunction( onOk ) ) {
                  onOk();
                }
              }
            };


            $scope.cancel = function () {
              $modalInstance.dismiss( 'cancel' );
              if ( angular.isFunction( onCancel ) ) {
                onCancel();
              }
            };
          };

          $simpleDialog.open = function ( options ) {

            var modalOptions = {
              templateUrl: '/isis-ui-components/templates/simpleDialog.html',
              controller: ConfirmDialogController
            };

            modalOptions = angular.extend( modalOptions, options );

            modalOptions.resolve = angular.extend( modalOptions.resolve || {
              dialogTitle: function () {
                return options.dialogTitle;
              },
              dialogContentTemplate: function () {
                return options.dialogContentTemplate;
              },
              onOk: function () {
                return options.onOk;
              },
              onCancel: function () {
                return options.onCancel;
              },
              validator: function () {
                return options.validator;
              }
            } );


            var simpleDialogInstance = $modal.open( modalOptions );


            return simpleDialogInstance;

          };

          return $simpleDialog;

        }
      ]
    };

    return $simpleDialogProvider;
  } );
},{}],24:[function(require,module,exports){
/*globals angular*/
'use strict';

angular.module(
'isis.ui.taxonomyTerm', []

)
.controller('TaxonomyTermController', function ($scope) {

  $scope.getTermUrl = function() {
    return ($scope.term && $scope.term.url) || '#';
  };

})
.directive(
'taxonomyTerm',
function () {

  return {
    scope: {
      term: '='
    },
    controller: 'TaxonomyTermController',
    restrict: 'E',
    replace: true,
    templateUrl: '/isis-ui-components/templates/taxonomyTerm.html'

  };
});


},{}],25:[function(require,module,exports){
/*globals angular*/
'use strict';

require( './taxonomyTerm.js' );

angular.module(
'isis.ui.taxonomyTerms', [
  'isis.ui.taxonomyTerm'
]

)
.controller('TaxonomyTermsController', function () {

})
.directive(
'taxonomyTerms',
function () {

  return {
    scope: {
      terms: '='
    },
    controller: 'TaxonomyTermsController',
    restrict: 'E',
    replace: true,
    templateUrl: '/isis-ui-components/templates/taxonomyTerms.html'

  };
});


},{"./taxonomyTerm.js":24}],26:[function(require,module,exports){
/*globals angular*/

'use strict';

require( '../contextmenu/contextmenu.js' );

angular.module(
  'isis.ui.treeNavigator.header', [
    'isis.ui.contextmenu'
  ]

)
  .directive(
    'treeNavigatorHeader', function () {
      return {
        scope: false,
        require: '^treeNavigator',
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/treeNavigator.header.html'

      };
    }
);
},{"../contextmenu/contextmenu.js":5}],27:[function(require,module,exports){
/*globals angular*/

'use strict';

require( './treeNavigator.nodeList.js' );
require( './treeNavigator.header.js' );
require( './treeNavigator.node.label.js' );

angular.module(
  'isis.ui.treeNavigator', [
    'isis.ui.treeNavigator.nodeList',
    'isis.ui.treeNavigator.header',
    'isis.ui.treeNavigator.node.label'
  ] )

.controller( 'TreeNavigatorController', function ( $scope ) {

  $scope.scopeMenuConfig = {
    triggerEvent: 'click',
    position: 'left bottom'
  };

  $scope.preferencesMenuConfig = {
    triggerEvent: 'click',
    position: 'right bottom'
  };


  $scope.config = $scope.config || {};

  $scope.config.collapsedIconClass = $scope.config.collapsedIconClass || 'icon-arrow-right';
  $scope.config.expandedIconClass = $scope.config.expandedIconClass || 'icon-arrow-down';

  $scope.config.extraInfoTemplateUrl = $scope.config.extraInfoTemplateUrl ||
                    '/isis-ui-components/templates/treeNavigator.node.extraInfo.html';

} )

.directive(
  'treeNavigator', function () {
    return {
      scope: {
        treeData: '=',
        config: '='
      },

      restrict: 'E',
      replace: true,
      templateUrl: '/isis-ui-components/templates/treeNavigator.html',
      controller: 'TreeNavigatorController'

    };
  }
);
},{"./treeNavigator.header.js":26,"./treeNavigator.node.label.js":29,"./treeNavigator.nodeList.js":30}],28:[function(require,module,exports){
/*globals angular*/

'use strict';

require( './treeNavigator.node.label.js' );

angular.module(
  'isis.ui.treeNavigator.node', [
    'isis.ui.treeNavigator.node.label'
  ]

)
  .directive(
    'treeNavigatorNode', function () {
      return {
        require: '^treeNavigatorNodeList',
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/treeNavigator.node.html'
      };
    }
);
},{"./treeNavigator.node.label.js":29}],29:[function(require,module,exports){
/*globals angular*/

'use strict';

require( '../contextmenu/contextmenu.js' );

angular.module(
  'isis.ui.treeNavigator.node.label', [
    'isis.ui.contextmenu',
  ]

)
  .directive(
    'treeNavigatorNodeLabel', function () {
      return {
        require: '^treeNavigatorNodeList',
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/treeNavigator.node.label.html'
      };
    }
);
},{"../contextmenu/contextmenu.js":5}],30:[function(require,module,exports){
/*globals angular*/

'use strict';

require( './treeNavigator.node.js' );
require( '../helpers/angular-recursion.js' );

angular.module(
'isis.ui.treeNavigator.nodeList', [
  'isis.ui.treeNavigator.node',
  'RecursionHelper'
]
)

.controller( 'TreeNavigatorNodeListController', function ( $scope, $log ) {

  var initializeScope,
  updateSelection,
  removeNodeFromList,
  markNodeExpanded;

  // Tree helpers

  //  nodeParents = {},
  //  walkTree,
  //  getPathFromRoot,
  //  findFirstCommonParent;


  removeNodeFromList = function ( list, node ) {
    var index;

    if ( angular.isArray( list ) && angular.isObject( node ) ) {

      index = list.indexOf( node.id );

      if ( index > -1 ) {
        list.splice( index, 1 );
      }

    }
  };

  initializeScope = function () {

    var defaultTreeState = {

      activeNode: null,
      selectedNodes: [],
      expandedNodes: [],
      loadingNodes: [],

      activeScope: null

    };

    $scope.config = $scope.config || {};

    $scope.config.state = angular.extend( defaultTreeState, $scope.config.state || {} );

  };
  //
  //  getPathFromRoot = function(root, node) {
  //    var path = [];
  //
  //    return path;
  //  };
  //
  //  findFirstCommonParent = function(nodeA, nodeB) {
  //
  //    var parent = null;
  //
  //    return parent;
  //
  //  };

  updateSelection = function ( $event, node ) {
    var index;

    if ( node ) {

      if ( $event ) {
        if ( $event.shiftKey ) {
          // TODO: properly update selected nodes
          // start node is active node
          // end node is theNode
          // select all opened tree elements between the two nodes
          $scope.config.state.selectedNodes = [ node.id ];
          $log.warn( 'Range selection is not implemented properly yet.' );


        } else if ( $event.ctrlKey || $event.metaKey ) {
          index = $scope.config.state.selectedNodes.indexOf( node.id );

          if ( index > -1 ) {
            // already selected, remove this node
            $scope.config.state.selectedNodes.splice( index, 1 );
          } else {
            // select it
            $scope.config.state.selectedNodes.push( node.id );
          }

        } else {
          $scope.config.state.selectedNodes = [ node.id ];

        }

      } else {
        // event is not given
        $scope.config.state.selectedNodes = [ node.id ];
      }

      // active node is the clicked node
      $scope.config.state.activeNode = node.id;

    } else {
      $scope.config.state.selectedNodes = [];
      $scope.config.state.activeNode = null;
    }
  };

  initializeScope();


  // Node state helper/watcher functions

  $scope.isNodeExpanded = function ( node ) {
    return ( $scope.config.state.expandedNodes.indexOf( node.id ) > -1 );
  };

  $scope.isNodeSelected = function ( node ) {
    return ( $scope.config.state.selectedNodes.indexOf( node.id ) > -1 );
  };

  $scope.isNodeLoading = function ( node ) {
    return ( $scope.config.state.loadingNodes.indexOf( node.id ) > -1 );
  };

  $scope.canNodeExpand = function ( node ) {
    return node.childrenCount > 0;
  };

  $scope.canNodeCollapse = function ( node ) {
    return node.unCollapsible !== true;
  };

  $scope.getNodeClass = function (node) {
    var cssClassStr = '';

    if ($scope.isNodeExpanded(node)) {
      cssClassStr += 'expanded';
    }

    if ($scope.config.state.activeNode === node.id) {
      cssClassStr += ' active-node';
    }

    if ($scope.isNodeSelected(node)) {
      cssClassStr += ' selected-node';
    }

    if (angular.isFunction($scope.config.nodeClassGetter)) {
      cssClassStr += ' ' + $scope.config.nodeClassGetter(node);
    }

    return cssClassStr;
  };

  // Node event handlers

  $scope.nodeClick = function ( $event, node ) {

    if ( angular.isFunction( $scope.config.nodeClick ) ) {
      $scope.config.nodeClick( $event, node );
    }

    if (!$scope.config.disableManualSelection) {
      updateSelection( $event, node );
    }

  };

  $scope.nodeContextmenu = function ( $event, node ) {

    if ( angular.isFunction( $scope.config.nodeContextmenuRenderer ) ) {
      $scope.nodeContextMenuData = $scope.config.nodeContextmenuRenderer( $event, node );
    }

  };

  $scope.nodeDblclick = function ( $event, node ) {

    if ( angular.isFunction( $scope.config.nodeDblclick ) ) {
      $scope.config.nodeDblclick( $event, node );
    }

    $scope.nodeExpanderClick( $event, node );

  };

  markNodeExpanded = function ( $event, node ) {
    $scope.config.state.expandedNodes.push( node.id );

    if ( angular.isFunction( $scope.config.nodeExpanderClick ) ) {
      $scope.config.nodeExpanderClick( $event, node, true );
    }
  };

  $scope.nodeExpanderClick = function ( $event, node ) {

    if ( !$scope.isNodeLoading( node ) ) {
      if ( $scope.isNodeExpanded( node ) ) {
        if ( $scope.canNodeCollapse( node ) ) {

          removeNodeFromList( $scope.config.state.expandedNodes, node );

          if ( angular.isFunction( $scope.config.nodeExpanderClick ) ) {
            $scope.config.nodeExpanderClick( $event, node, false );
          }
        }
      } else {
        if ( $scope.canNodeExpand( node ) ) {
          if ( node.children.length === 0 ) {

            // Need to load children
            if ( angular.isFunction( $scope.config.loadChildren ) ) {
              $scope.config.state.loadingNodes.push( node.id );
              $scope.config.loadChildren( $event, node )
              .then( function () {
                removeNodeFromList( $scope.config.state.loadingNodes, node );
                markNodeExpanded( $event, node );
              } );
            }

          } else {
            // No need to load just mark it expanded
            markNodeExpanded( $event, node );

          }
        }
      }
    }
  };

  $scope.nodeDrop = function ( $event, node, $data ) {
    console.log( $data, 'Dropped on ', node );
  };

  //  $rootScope.$on('ANGULAR_DRAG_START', function($event){
  //    console.log($event);
  //  });

} )

.directive(
'treeNavigatorNodeList', function ( RecursionHelper ) {
  return {
    scope: {
      nodes: '=',
      config: '='
    },
    restrict: 'E',
    replace: true,
    templateUrl: '/isis-ui-components/templates/treeNavigator.nodeList.html',
    controller: 'TreeNavigatorNodeListController',
    compile: function ( element ) {
      return RecursionHelper.compile( element );
    }

  };
}
);
},{"../helpers/angular-recursion.js":10,"./treeNavigator.node.js":28}],31:[function(require,module,exports){
/*globals angular*/
'use strict';

require('../contextmenu/contextmenu.js');

angular.module(
    'isis.ui.validationErrorMarker', [ 'isis.ui.contextmenu' ]
  )
  .controller(
  'ValidationMarkerController',
  function ($scope) {

    $scope.errorMenuConfig = {
      triggerEvent: 'click',
      position: 'right bottom',
      contentTemplateUrl: '/isis-ui-components/templates/validationErrorMarkerMessages.html',
      doNotAutoClose: true,
      menuParentScope: $scope
    };

    $scope.getValidationErrorMessages = function () {

      var messages = [];

      angular.forEach($scope.validationErrors, function (v, key) {
        messages.push($scope.errorMessages[key]);
      });

      return messages;
    };

  }
)
// .controller(
//  'ValidationErrorMarkerMessagesController',
//  function () {
//  }
//)
  .directive(
  'validationErrorMarker',
  function () {

    return {
      scope: {
        errorMessages: '=',
        embedded: '='
      },
      restrict: 'E',
      replace: true,
      controller: 'ValidationMarkerController',
      templateUrl: '/isis-ui-components/templates/validationErrorMarker.html',
      require: '^ngModel',
      link: function (scope, element, attributes, ngModel) {

        scope.validationErrors = [];
        scope.invalid = false;

        scope.$watch(
          function () {
            return ngModel.$invalid;
          },
          function (newVal) {

            scope.invalid = newVal;

            if (scope.invalid) {

            }

            scope.validationErrors = ngModel.$error;

          }
        );

      }
    };
  });
},{"../contextmenu/contextmenu.js":5}],32:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'isis.ui.checkboxWidget', [ ]

)
.controller(
'CheckboxWidgetController', function ($scope) {

  $scope.trueLabel = $scope.widgetConfig.trueLabel || 'True';
  $scope.falseLabel = $scope.widgetConfig.falseLabel || 'False';

})
.directive(
'checkboxWidget', [ 'valueWidgetsService',
  function (valueWidgetsService) {

    var defaultTemplateUrl = '/isis-ui-components/templates/checkboxWidget.html';

    return {
      restrict: 'E',
      scope: true,
      replace: true,
      require: '^ngModel',
      controller: 'CheckboxWidgetController',
      link: function ( scope, element, attributes, ngModel ) {

        scope.myValue = {

        };

        valueWidgetsService.getAndCompileWidgetTemplate( element, scope, defaultTemplateUrl );

        ngModel.$formatters.push(function(modelValue) {
          return modelValue;
        });

        ngModel.$render = function() {
          scope.myValue.value = ngModel.$viewValue;
        };

        ngModel.$parsers.push(function(viewValue) {
          return viewValue;
        });

        scope.$watch('myValue.value', function(val) {
          ngModel.$setViewValue(val);
        });

        ngModel.$render();

      }

    };
  }
] );
},{}],33:[function(require,module,exports){
/*globals angular*/


'use strict';

angular.module(
  'isis.ui.compoundWidget', [ 'isis.ui.services' ]

)
  .directive(
    'compoundWidget', [ 'isisTemplateService', '$compile',
      function ( isisTemplateService, $compile ) {

        var defaultTemplateUrl = '/isis-ui-components/templates/compoundWidget.html';

        return {
          restrict: 'E',
          replace: true,
          require: 'ngModel',
          scope: {
            config: '='
          },
          link: function ( scope, element, attributes, ngModel ) {

            var templateUrl;

            templateUrl = scope.config && scope.config.templateUrl || defaultTemplateUrl;

            isisTemplateService.getTemplate( scope.config.template, templateUrl )
              .then( function ( template ) {
                element.replaceWidth( $compile( template, scope ) );
              } );

            console.log( ngModel.$viewValue );

          }


        };
      }
    ] );
},{}],34:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(
'isis.ui.selectWidget', [ ]

)
.controller(
'SelectWidgetController', function ($scope) {

  $scope.getDisplayValue = function () {
    var displayValue,
        labelsList;


    if ($scope.modelConfig.multiple) {

      displayValue = $scope.modelConfig.placeHolder;

      if ($scope.myValue && angular.isArray($scope.myValue.value)) {

        labelsList = [];

        angular.forEach($scope.myValue.value, function(opt) {
          labelsList.push(opt.label);
          displayValue = labelsList.join(', ');
        });
      }

    } else {
      displayValue = ($scope.myValue.value && $scope.myValue.value.label) || $scope.modelConfig.placeHolder || '';
    }

    return displayValue;
  };


})
.directive(
'selectWidget', [ 'valueWidgetsService',
  function (valueWidgetsService) {

    var defaultTemplateUrl = '/isis-ui-components/templates/selectWidget.html';

    return {
      restrict: 'E',
      scope: true,
      replace: true,
      require: '^ngModel',
      controller: 'SelectWidgetController',
      link: function (scope, element, attributes, ngModel) {

        scope.myValue = {

        };

        scope.optionsList = scope.modelConfig.options;

        valueWidgetsService.getAndCompileWidgetTemplate(element, scope, defaultTemplateUrl);

        ngModel.$formatters.push(function (modelValue) {
          return modelValue;
        });

        ngModel.$render = function () {
          scope.myValue.value = ngModel.$viewValue;
        };

        ngModel.$parsers.push(function (viewValue) {
          return viewValue;
        });

        scope.$watch('myValue.value', function (val) {
          ngModel.$setViewValue(val);
        });

        ngModel.$render();

      }

    };
  }
]);
},{}],35:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module(

'isis.ui.stringWidget', [ 'isis.ui.services', 'ui.utils' ]
)
.controller(
'StringWidgetController', function ( $scope ) {


  $scope.getDisplayValue = function () {
    var displayValue;

    displayValue = $scope.myValue.value || $scope.modelConfig.placeHolder || '';

    return displayValue;
  };

  if ( $scope.widgetConfig.mask ) {
    $scope.placeHolder = undefined;
  }


} )
.directive(
'stringWidget', [ 'valueWidgetsService',
  function ( valueWidgetsService ) {

    var defaultTemplateUrl = '/isis-ui-components/templates/stringWidget.html';

    return {
      restrict: 'E',
      scope: true,
      replace: true,
      require: '^ngModel',
      controller: 'StringWidgetController',
      link: function ( scope, element, attributes, ngModel ) {

        scope.myValue = {

        };

        valueWidgetsService.getAndCompileWidgetTemplate( element, scope, defaultTemplateUrl );

        ngModel.$formatters.push( function ( modelValue ) {
          return modelValue;
        } );

        ngModel.$render = function () {
          scope.myValue.value = ngModel.$viewValue;
        };

        ngModel.$parsers.push( function ( viewValue ) {
          return viewValue;
        } );

        scope.$watch( 'myValue.value', function ( val ) {
          ngModel.$setViewValue( val );
        } );

        ngModel.$render();


      }

    };
  }
] )
.directive(
'autoComplete', ['$timeout', function ( $timeout ) {
  return {
    scope: {
      'autoComplete': '=autoComplete'
    },
    restrict: 'A',
    link: function ( scope, element ) {

      var autoCompleteItems = scope.autoComplete;
      if ( autoCompleteItems ) {
        element.autocomplete( {
          source: autoCompleteItems,
          select: function () {
            $timeout( function () {
              element.trigger( 'input' );
            }, 0 );
          }
        } );
      }
    }
  };
}] );
},{}],36:[function(require,module,exports){
/*globals angular*/

'use strict';

require( '../validationErrorMarker/validationErrorMarker.js' );

require( './checkboxWidget.js' );
require( './compoundWidget.js' );
require( './selectWidget.js' );
require( './stringWidget.js' );

//require( 'angular-bindonce');

var availableWidgets = {
  'string': [ 'stringWidget', 'string-widget' ],
  'compound': [ 'compoundWidget', 'compound-widget' ],
  'checkbox': [ 'checkboxWidget', 'checkbox-widget' ],
  'select': [ 'selectWidget', 'select-widget' ]
},

widgetModules = [];

angular.forEach( availableWidgets, function ( value ) {
  this.push( 'isis.ui.' + value[ 0 ] );
}, widgetModules );

angular.module( 'isis.ui.valueWidgets', [ 'isis.ui.validationErrorMarker' ].concat( widgetModules ) )

.factory( 'valueWidgetsService', function ( isisTemplateService, $compile ) {

  var services = {

    getWidgetElementForType: function ( type ) {

      var result = availableWidgets[ type ] && availableWidgets[ type ][ 1 ];

      if ( !result ) {
        result = 'string-widget';
      }

      return result;

    },

    getAndCompileWidgetTemplate: function ( widgetElement, $scope, defaultTemplateUrl ) {

      var templateUrl,
      templateElement;

      templateUrl = $scope.widgetConfig && $scope.widgetConfig.templateUrl || defaultTemplateUrl;

      isisTemplateService.getTemplate( $scope.widgetConfig.template, templateUrl )
      .then( function ( template ) {
        templateElement = angular.element( template );
        widgetElement.replaceWith( templateElement );
        $compile( templateElement )( $scope );
      } );
    }
  };

  return services;

} )
.controller( 'ValueWidgetController', function () {

} )
.directive( 'valueWidget',
function () {
  return {
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    templateUrl: '/isis-ui-components/templates/valueWidget.html',
    scope: {
      model: '=ngModel',
      modelConfig: '=?',

      inputConfig: '=?',

      widgetType: '=?',
      widgetMode: '=?',
      widgetConfig: '=?',
      widgetDisabled: '=?'

    },
    priority: 0,
    controller: 'ValueWidgetController',
    link: function ( scope, element, attributes, ngModel ) {

      scope.modelConfig = scope.modelConfig || {};
      scope.widgetConfig = scope.widgetConfig || {};
      scope.inputConfig = scope.inputConfig || {};

      scope.placeHolder = scope.modelConfig.placeHolder || 'Enter value';

      if ( angular.isObject( scope.modelConfig.validators ) ) {

        ngModel.$validators = ngModel.$validators || {};
        scope.validatorMessages = scope.validatorMessages || {};

        angular.forEach( scope.modelConfig.validators, function ( validatorDescriptor ) {
          if ( angular.isFunction( validatorDescriptor.method ) ) {
            ngModel.$validators[validatorDescriptor.id] = validatorDescriptor.method;
            scope.validatorMessages[validatorDescriptor.id] = validatorDescriptor.errorMessage;
          }
        } );

      }

      if ( angular.isFunction( scope.modelConfig.modelChange ) ) {
        ngModel.$viewChangeListeners.push( function () {
          scope.modelConfig.modelChange(ngModel.$modelValue);
        } );

      }
    }
  };
})
.
directive( 'valueWidgetBody', [ '$log', '$compile', 'valueWidgetsService',
  function ( $log, $compile, valueWidgetsService ) {

    return {
      restrict: 'E',
      replace: true,
      require: ['^ngModel', '^valueWidget'],
      templateUrl: '/isis-ui-components/templates/valueWidget.body.html',
      priority: 0,

      compile: function () {
        return {
          pre: function ( scope ) {

            if ( !scope.widgetMode ) {
              scope.widgetMode = 'edit';
            }

          },
          post: function ( scope, element ) {

            var
            widgetTemplateStr,
            widgetElement,
            widgetType,
            widgetDirective,
            newWidgetDirective,
            linkIt;

            linkIt = function () {

              if ( scope.widgetType ) {
                widgetType = scope.widgetType;
              } else {

                if ( typeof scope.model === 'boolean' ) {
                  widgetType = 'checkbox';
                }

              }

              newWidgetDirective = valueWidgetsService.getWidgetElementForType( widgetType );

              if ( widgetDirective !== newWidgetDirective ) {

                widgetDirective = newWidgetDirective;

                widgetTemplateStr = '<' + widgetDirective + '>' +
                '</' + widgetDirective + '>';

                $log.log( widgetTemplateStr );

                widgetElement = angular.element( widgetTemplateStr );

                element.empty();
                element.append( widgetElement );
                $compile( widgetElement )( scope );

              }

            };

            scope.$watch( 'widgetType', function () {
              linkIt();
            } );

            scope.$watch( 'widgetMode', function () {
              linkIt();
            } );

          }
        };
      }
    };

  }
] );
},{"../validationErrorMarker/validationErrorMarker.js":31,"./checkboxWidget.js":32,"./compoundWidget.js":33,"./selectWidget.js":34,"./stringWidget.js":35}]},{},[1]);
