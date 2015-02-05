/*globals define*/

/**
 * Created by pmeijer on 4/22/2014.
 */

define([], function () {
    'use strict';
    var LoggerMock = function () {
        this.debug_messages = [];
        this.info_messages = [];
        this.warning_messages = [];
        this.error_messages = [];
    };

    LoggerMock.prototype.debug = function (msg) {
        this.debug_messages.push(msg);
    };

    LoggerMock.prototype.info = function (msg) {
        this.info_messages.push(msg);
    };

    LoggerMock.prototype.warning = function (msg) {
        this.warning_messages.push(msg);
    };

    LoggerMock.prototype.warn = function (msg) {
        this.warning_messages.push(msg);
    };

    LoggerMock.prototype.error = function (msg) {
        this.error_messages.push(msg);
    };

    return LoggerMock;
});
