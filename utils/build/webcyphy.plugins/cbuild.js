({
    name: 'webcyphy.plugins',
    out: '../../../public/gme_plugins_for_cyphy/webcyphy.plugins.build.js',
    baseUrl: '../../../',
    paths: {
        'webcyphy.plugins': './utils/build/webcyphy.plugins/webcyphy.plugins',
        util: './node_modules/webgme/src/common/util',
        eventDispatcher: './node_modules/webgme/src/common/EventDispatcher',
        core: './node_modules/webgme/src/common/core',
        coreclient: './node_modules/webgme/src/common/core/users',
        storage: './node_modules/webgme/src/common/storage',
        blob: './node_modules/webgme/src/common/blob',
        client: './node_modules/webgme/src/client/js/client',
        plugin: './node_modules/webgme/src/plugin',
        executor: './node_modules/webgme/src/common/executor',
        xmljsonconverter: './utils/xmljsonconverter',
        sax: './vendor/sax/sax',
        jszip: './node_modules/webgme/src/client/lib/jszip/jszip',
        ejs: './node_modules/webgme/src/common/util/ejs',
        superagent: './node_modules/webgme/node_modules/superagent/superagent',
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
