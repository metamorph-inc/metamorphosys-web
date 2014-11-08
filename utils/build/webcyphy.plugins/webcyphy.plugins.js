/*globals define, WebGMEGlobal */
define('webcyphy.plugins',
    [
        'xmljsonconverter',
        'executor/ExecutorClient',
        'plugin/AcmImporter/AcmImporter/AcmImporter',
        'plugin/AdmImporter/AdmImporter/AdmImporter',
        'plugin/AtmImporter/AtmImporter/AtmImporter',
        'plugin/AdmExporter/AdmExporter/AdmExporter',
        'plugin/TestBenchRunner/TestBenchRunner/TestBenchRunner',
        'plugin/ExportWorkspace/ExportWorkspace/ExportWorkspace'
    ], function (Converters,
                 ExecutorClient,
                 AcmImporter,
                 AdmImporter,
                 AtmImporter,
                 AdmExporter,
                 TestBenchRunner,
                 ExportWorkspace) {
        'use strict';
        WebGMEGlobal.classes = WebGMEGlobal.classes || {};
        WebGMEGlobal.classes.ExecutorClient = ExecutorClient;
        WebGMEGlobal.classes.Converters = Converters;
        WebGMEGlobal.plugins.AcmImporter = AcmImporter;
        WebGMEGlobal.plugins.AdmImporter = AdmImporter;
        WebGMEGlobal.plugins.AtmImporter = AtmImporter;
        WebGMEGlobal.plugins.AdmExporter = AdmExporter;
        WebGMEGlobal.plugins.ExportWorkspace = ExportWorkspace;
        WebGMEGlobal.plugins.TestBenchRunner = TestBenchRunner;
    });
