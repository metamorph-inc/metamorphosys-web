/*globals define, WebGMEGlobal */
define('webcyphy.plugins',
    [
        'xmljsonconverter',
        'executor/ExecutorClient',
        'plugin/AdmExporter/AdmExporter/AdmExporter',
        'plugin/TestBenchRunner/TestBenchRunner/TestBenchRunner'
    ], function (Converters, ExecutorClient, AdmExporter, TestBenchRunner) {
        'use strict';
        WebGMEGlobal.classes = WebGMEGlobal.classes || {};
        WebGMEGlobal.classes.ExecutorClient = ExecutorClient;
        WebGMEGlobal.classes.Converters = Converters;
        WebGMEGlobal.plugins.AdmExporter = AdmExporter;
        WebGMEGlobal.plugins.TestBenchRunner = TestBenchRunner;
    });
