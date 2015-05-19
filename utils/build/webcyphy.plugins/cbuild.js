({
    name: 'webcyphy.plugins',
    out: '../../../public/gme_plugins_for_cyphy/webcyphy.plugins.build.js',
    baseUrl: '../../../',
    paths: {
        'webcyphy.plugins': './utils/build/webcyphy.plugins/webcyphy.plugins',
        js: './node_modules/webgme/src/client/js',
        debug: './node_modules/webgme/src/client/lib/debug/debug',
        common: './node_modules/webgme/src/common',
        blob: './node_modules/webgme/src/common/blob',
        plugin: './node_modules/webgme/src/plugin',
        xmljsonconverter: './utils/xmljsonconverter',
        sax: './vendor/sax/sax',
        jszip: './node_modules/webgme/src/client/lib/jszip/jszip',
        ejs: './node_modules/webgme/src/common/util/ejs',
        q: './node_modules/q/q',
        executor: './node_modules/webgme/src/common/executor',
        superagent: './node_modules/webgme/src/client/lib/superagent/superagent-1.1.0',
        'plugin/AdmExporter': './src/plugins/ADMEditor',
        'plugin/TestBenchRunner': './src/plugins/ADMEditor',
        'plugin/AtmExporter': './src/plugins/ADMEditor',
        'plugin/AcmImporter': './src/plugins/ADMEditor',
        'plugin/AdmImporter': './src/plugins/ADMEditor',
        'plugin/AtmImporter': './src/plugins/ADMEditor',
        'plugin/ExportWorkspace': './src/plugins/ADMEditor',
        'plugin/GenerateDashboard': './src/plugins/ADMEditor',
        'plugin/SaveDesertConfigurations': './src/plugins/ADMEditor'
    },
    optimize: 'none',
    generateSourceMaps: true,
    insertRequire: ['webcyphy.plugins'],
    include: ['./node_modules/requirejs/require'],
    wrap: {
        start: 'var GME = GME || {}, WebGMEGlobal = {} ;(function(){',
        end: '}());'
    }
})
