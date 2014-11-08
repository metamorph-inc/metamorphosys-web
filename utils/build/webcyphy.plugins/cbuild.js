({
    name: "webcyphy.plugins",
    out: "../../../dist/webcyphy.plugins.build.js",
    baseUrl: "../../../",
    paths: {
        "webcyphy.plugins": "./utils/build/webcyphy.plugins/webcyphy.plugins",
        util: "./node_modules/webgme/src/common/util",
        eventDispatcher: "./node_modules/webgme/src/common/EventDispatcher",
        core: "./node_modules/webgme/src/common/core",
        coreclient: "./node_modules/webgme/src/common/core/users",
        storage: "./node_modules/webgme/src/common/storage",
        logManager: "./node_modules/webgme/src/common/LogManager",
        blob: "./node_modules/webgme/src/middleware/blob",
        client: "./node_modules/webgme/src/client/js/client",
        plugin: "./node_modules/webgme/src/plugin",
        xmljsonconverter: "./node_modules/webgme-domain-tools/lib/xmljsonconverter",
        sax: "./node_modules/webgme-domain-tools/support/sax/sax",
        jszip: "./node_modules/webgme/node_modules/jszip/dist/jszip",
        ejs: "./node_modules/webgme-domain-tools/support/ejs/ejs.min",
        executor: "./node_modules/webgme-domain-tools/src/rest/executor",
        superagent: './node_modules/webgme-domain-tools/node_modules/superagent/superagent',
        "plugin/AdmExporter": "./src/plugins/ADMEditor",
        "plugin/TestBenchRunner": "./src/plugins/ADMEditor",
        "plugin/AtmExporter": "./src/plugins/ADMEditor",
        "plugin/AcmImporter": "./src/plugins/ADMEditor",
        "plugin/AdmImporter": "./src/plugins/ADMEditor",
        "plugin/AtmImporter": "./src/plugins/ADMEditor",
        "plugin/ExportWorkspace": "./src/plugins/ADMEditor"
    },
    optimize: "none",
    insertRequire: ["webcyphy.plugins"],
    include: ['./node_modules/requirejs/require'],
    wrap: {
        start: "var WebGMEGlobal = WebGMEGlobal || {}; WebGMEGlobal.plugins = WebGMEGlobal.plugins || {};(function(){",
        end: "}());"
    }
})