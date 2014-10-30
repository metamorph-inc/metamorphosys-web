define('webcyphy.plugins',
    [
        'executor/ExecutorClient',
        'plugin/AdmExporter/AdmExporter/AdmExporter',
        'plugin/TestBenchRunner/TestBenchRunner/TestBenchRunner'
    ], function (ExecutorClient, AdmExporter, TestBenchRunner) {
        WebGMEGlobal.classes = WebGMEGlobal.classes || {};
        WebGMEGlobal.classes.ExecutorClient = ExecutorClient;
        WebGMEGlobal.plugins.AdmExporter = AdmExporter;
        WebGMEGlobal.plugins.TestBenchRunner = TestBenchRunner;
    });
