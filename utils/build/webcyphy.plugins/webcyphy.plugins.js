/*globals define, GME, WebGMEGlobal */
define('webcyphy.plugins',
    [
        'xmljsonconverter',
        'executor/ExecutorClient',
        'plugin/AcmImporter/AcmImporter/AcmImporter',
        'plugin/AdmImporter/AdmImporter/AdmImporter',
        'plugin/AtmImporter/AtmImporter/AtmImporter',
        'plugin/AdmExporter/AdmExporter/AdmExporter',
        'plugin/TestBenchRunner/TestBenchRunner/TestBenchRunner',
        'plugin/ExportWorkspace/ExportWorkspace/ExportWorkspace',
        'plugin/GenerateDashboard/GenerateDashboard/GenerateDashboard',
        'plugin/SaveDesertConfigurations/SaveDesertConfigurations/SaveDesertConfigurations'
    ], function (Converters,
                 ExecutorClient,
                 AcmImporter,
                 AdmImporter,
                 AtmImporter,
                 AdmExporter,
                 TestBenchRunner,
                 ExportWorkspace,
                 GenerateDashboard,
                 SaveDesertConfigurations) {
        'use strict';
        GME.classes = GME.classes || {};
        GME.classes.ExecutorClient = ExecutorClient;
        GME.classes.Converters = Converters;

        WebGMEGlobal.plugins = WebGMEGlobal.plugins || {};
        WebGMEGlobal.plugins.AcmImporter = AcmImporter;
        WebGMEGlobal.plugins.AdmImporter = AdmImporter;
        WebGMEGlobal.plugins.AtmImporter = AtmImporter;
        WebGMEGlobal.plugins.AdmExporter = AdmExporter;
        WebGMEGlobal.plugins.ExportWorkspace = ExportWorkspace;
        WebGMEGlobal.plugins.TestBenchRunner = TestBenchRunner;
        WebGMEGlobal.plugins.GenerateDashboard = GenerateDashboard;
        WebGMEGlobal.plugins.SaveDesertConfigurations = SaveDesertConfigurations;
    });
