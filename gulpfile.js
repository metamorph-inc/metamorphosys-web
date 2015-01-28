/*globals require, console, process*/
'use strict';

var argv = require('yargs').argv,
    livereloadport = 35729,
    serverport = 5000,

    debug = !argv.production,
    debugShim = false, //this is for toggling browserify shim debug

    libraryName = 'cyphy-components',
    libraryTemplatesModule = 'cyphy.components.templates',

    docTemplatesModule = 'cyphy.demoApp.templates',

    sourcePaths = {

        docsSourceIndex: 'src/docs/cyphy_components_docs.html',
        docsApp: './src/docs/docs_app.js',
        docsScripts: [
            'src/**/docs/*.js'
        ],
        docsTemplates: [
            'src/**/docs/*.html',
            'src/**/docs/*.js',
            'src/**/docs/readme.md'
        ],
        docsStyles: [
            'src/docs/styles/*.scss',
            'src/library/*/docs/**/*.scss'
        ],


        libraryModuleScript: './src/library/cyphy-components.js',
        libraryScripts: [
            'src/library/services/*.js',
            'src/library/SimpleModal/*.js',
            'src/library/WorkspaceList/*.js',
            'src/library/ComponentList/*.js',
            'src/library/componentBrowser/*.js',
            'src/library/propertyList/*.js',
            'src/library/ComponentBrowser/classes/*.js',
            'src/library/DesignList/*.js',
            'src/library/DesignTree/*.js',
            'src/library/TestBenchList/*.js',
            'src/library/InterfaceDetails/*.js',
            'src/library/ConfigurationTable/*.js',
            'src/library/ConfigurationSetSelector/*.js',
            'src/library/WorkersList/*.js'
        ],
        libraryTemplates: [
            'src/library/**/templates/**/*.html'
        ],
        libraryStyles: [
            'src/library/*/styles/*.scss'
        ],
        libraryImages: [
            'src/**/*.png',
            'src/**/*.jpg',
            'src/**/*.svg'
        ]
    },

    buildPaths = {

        root: 'dist',
        docsRoot: 'dist/docs',

        scripts: 'dist',
        templates: 'dist/templates',
        styles: 'dist/styles',
        images: 'dist/images'
    },

    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    browserify = require('browserify'),
    concat = require('gulp-concat'),
    buffer = require('gulp-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    source = require('vinyl-source-stream'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    runSequence = require('run-sequence'),
    clean = require('gulp-clean'),
    templateCache = require('gulp-angular-templatecache'),

    express = require('express'),
    server = express(),
    livereload = require('connect-livereload'),
    refresh = require('gulp-livereload'),
    lrserver = require('tiny-lr')(),
    prettify = require('gulp-js-prettify'),

    shell = require('gulp-shell'),
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin');

// Utility tasks

require('process');
require('path');

function swallowError( error ) {
    //If you want details of the error in the console
    console.log( error.toString() );

    this.emit( 'end' );
}


gulp.task('clean-build', function () {
    return gulp.src(buildPaths.root).pipe(clean());
});


// Docs tasks

gulp.task('lint-docs', function () {

    console.log('Linting docs...');

    gulp.src(sourcePaths.docsScripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));

});

gulp.task('browserify-docs', function () {
    var bundler, bundle;
    console.log('Browserifying docs...');

    if (debugShim) {
        process.env.BROWSERIFYSHIM_DIAGNOSTICS = 1;
    }
    bundler = browserify({
        entries: [sourcePaths.docsApp],
        debug: true
    });

    bundle = function() {
        return bundler
            .bundle()
            .on('error', swallowError)
            .pipe(source(libraryName + '-docs.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            // Add transformation tasks to the pipeline here.
            //.pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(buildPaths.docsRoot));
    };
    return bundle();
});

gulp.task('compile-docs-templates', function () {

    console.log('Compiling docs templates...');

    gulp.src(sourcePaths.docsTemplates)
        .pipe(templateCache(libraryName + '-doc-templates.js', {
            root: '/',
            module: docTemplatesModule,
            standalone: true
        }))
        .pipe(gulp.dest(buildPaths.docsRoot));
});


gulp.task('compile-docs-styles', function () {
    var processWinPath = function (file) {
        var path = require('path');
        if (process.platform === 'win32') {
            file.path = path.relative('.', file.path);
            file.path = file.path.replace(/\\/g, '/');
        }
    };

    console.log('Compiling styles...');

    gulp.src(sourcePaths.docsStyles)
        .on('data', processWinPath)
        .pipe(sass({
            errLogToConsole: true,
            sourceComments: 'map'
        }))
        .pipe(rename(function (path) {
            path.dirname = '';
        }))
        .pipe(concat(libraryName + '-docs.css'))
        .pipe(gulp.dest(buildPaths.docsRoot));
});

gulp.task('compile-docs',
    [ 'lint-docs', 'browserify-docs', 'compile-docs-templates', 'compile-docs-styles' ],
    function () {

        console.log('Compiling docs...');

        gulp.src(sourcePaths.docsSourceIndex)
            .pipe(rename(libraryName + '-docs.html'))
            .pipe(gulp.dest(buildPaths.docsRoot));

    });


// Library tasks

gulp.task('lint-library', function () {

    console.log('Linting library...');

    gulp.src(sourcePaths.libraryScripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));

});

gulp.task('browserify-library', function () {
    var bundler, bundle;
    console.log('Browserifying library...');

    if (debugShim) {
        process.env.BROWSERIFYSHIM_DIAGNOSTICS = 1;
    }
    bundler = browserify({
        entries: [sourcePaths.libraryModuleScript],
        debug: true
    });

    bundle = function() {
        return bundler
            .bundle()
            .on('error', swallowError)
            .pipe(source(libraryName + '.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            // Add transformation tasks to the pipeline here.
            //.pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(buildPaths.scripts));
    };

    return bundle();
});

gulp.task('compile-library-templates', function () {

    console.log('Compiling templates...');

    gulp.src(sourcePaths.libraryTemplates)
        .pipe(rename(function (path) {
            path.dirname = 'templates';
        }))
        .pipe(templateCache(libraryName + '-templates.js', {
            module: libraryTemplatesModule,
            standalone: true,
            root: '/' + libraryName + '/'
        }))
        .pipe(gulp.dest(buildPaths.root));
});


gulp.task('compile-library-styles', function () {

    console.log('Compiling styles...');

    gulp.src(sourcePaths.libraryStyles)
        // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
        .pipe(sass({
            errLogToConsole: true,
            sourceComments: 'map'
        }))
        .pipe(rename(function (path) {
            path.dirname = '';
        }))
        .pipe(concat(libraryName + '.css'))
        .pipe(gulp.dest(buildPaths.root));
});

gulp.task('compile-library-images', function () {

    console.log('Compiling images...');

    gulp.src(sourcePaths.libraryImages)
        .pipe(rename(function (path) {
            path.dirname = '';
        }))
        .pipe(gulp.dest(buildPaths.images));
});


gulp.task('compile-library',
    [ 'lint-library', 'browserify-library', 'compile-library-templates', 'compile-library-styles', 'compile-library-images'],
    function () {
        console.log('Compiling scripts...');
    });


// Application tasks
var applications = ['default', 'sample', 'servicetest', 'mmsApp'],
    i,
    registerAppTasks,
    gulpAppTaskNames = [];


registerAppTasks = function (appName) {
    var appSources = ['./src/app/' + appName + '/**/*.js'],
        appModuleScript = './src/app/' + appName + '/app.js',

        appTemplates = ['src/app/' + appName + '/**/*.html'],
        appTemplateModule = 'cyphy.' + appName + '.templates',

        appStyles = ['src/app/' + appName + '/**/*.scss'],

        appSvgSymbols = ['src/app/' + appName + '/**/symbols/**/*.svg'],
        appSvgSymbol2ndCopyDestination = 'src/app/' + appName + '/images/';


    gulp.task('lint-' + appName + '-app', function () {

        console.log('Linting ' + appName + '-app...');

        gulp.src(appSources)
            .pipe(jshint())
            .pipe(jshint.reporter('default'));

    });

    gulp.task('generate-svg-map-' + appName + '-app', function () {
      return gulp.src( appSvgSymbols )
      .pipe(svgmin())
      .pipe(svgstore({ fileName: 'symbols.svg', prefix: 'icon-' }))
      .pipe(gulp.dest( buildPaths.images ))
      .pipe(gulp.dest(appSvgSymbol2ndCopyDestination));
    });

    gulp.task('browserify-' + appName + '-app', function () {
        var bundler, bundle;
        console.log('Browserifying ' + appName + '-app...');

        if (debugShim) {
            process.env.BROWSERIFYSHIM_DIAGNOSTICS = 1;
        }
        bundler = browserify({
            entries: [appModuleScript],
            debug: true
        });

        bundle = function() {
            return bundler
                .bundle()
                .on('error', swallowError)
                .pipe(source(appName + '-app.js'))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                // Add transformation tasks to the pipeline here.
                //.pipe(uglify())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(buildPaths.scripts));
        };

        return bundle();
    });

    gulp.task('compile-' + appName + '-app-templates', function () {

        console.log('Compiling ' + appName + '-app-templates...');

        gulp.src(appTemplates)
            .pipe(rename(function (path) {
                path.dirname = 'templates';
            }))
            .pipe(templateCache(appName + '-app-templates.js', {
                module: appTemplateModule,
                standalone: true,
                root: '/' + appName + '/'
            }))
            .pipe(gulp.dest(buildPaths.root));
    });

    gulp.task('compile-' + appName + '-app-styles', function () {

        console.log('Compiling ' + appName + '-app styles...');

        gulp.src(appStyles)
            // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
            .pipe(sass({
                errLogToConsole: true,
                sourceComments: 'map'
            }))
            .pipe(rename(function (path) {
                path.dirname = '';
            }))
            .pipe(concat(appName + '-app.css'))
            .pipe(gulp.dest(buildPaths.root));
    });

    gulp.task('compile-' + appName + '-app',
        [ 'lint-' + appName + '-app',
          'generate-svg-map-' + appName + '-app',
          'browserify-' + appName + '-app',
          'compile-' + appName + '-app-templates',
          'compile-' + appName + '-app-styles'],
        function () {
            console.log('Compiling ' + appName + '-app scripts...');
        });

    gulpAppTaskNames.push('compile-' + appName + '-app');

};


for (i = 0; i < applications.length; i += 1) {
    registerAppTasks(applications[i]);
}

gulp.task('rjs-build', shell.task(['node ./node_modules/requirejs/bin/r.js -o ./utils/build/webcyphy.plugins/cbuild.js']));

gulp.task('compile-all', function (cb) {
    runSequence('clean-build', [
        'compile-docs', 'compile-library', 'rjs-build'
    ].concat(gulpAppTaskNames), cb);
});


// Prettifying
gulp.task('prettify', function () {
    gulp.src('./src/**/*.js')
        .pipe(prettify({
            'indent_size': 4,
            'indent_char': ' ',
            'space_in_paren': true,
            'indent_level': 0,
            'indent_with_tabs': false,
            'preserve_newlines': true,
            'max_preserve_newlines': 10,
            'jslint_happy': true,
            'brace_style': 'collapse',
            'keep_array_indentation': false,
            'keep_function_indentation': false,
            'space_before_conditional': true,
            'break_chained_methods': true,
            'eval_code': false,
            'unescape_strings': false,
            'wrap_line_length': 120
        }))
        .pipe(gulp.dest('./src')); // edit in place
});

// Server scripts

gulp.task('start-server', function () {

    console.log('Starting server...');

    server.use(livereload({ port: livereloadport }));
    server.use(express.static(buildPaths.root));


    server.get('/', function (req, res) {
        res.sendFile(buildPaths.index, {
            root: buildPaths.root
        });
    });

    server.listen(serverport);
    lrserver.listen(livereloadport);

});


gulp.task('refresh-server', function () {

    console.log('Refreshing server...');

    refresh(lrserver);
});


gulp.task('register-watchers', ['compile-all'], function (cb) {
    var i,
        registerAppWatchers;

    gulp.watch(sourcePaths.index, [ 'compile-index', 'refresh-server' ]);

    gulp.watch(sourcePaths.docsSourceIndex, [ 'compile-docs', 'refresh-server' ]);
    gulp.watch(sourcePaths.docsApp, [ 'compile-docs', 'refresh-server' ]);
    gulp.watch(sourcePaths.docsScripts, [ 'compile-docs', 'refresh-server' ]);
    gulp.watch(sourcePaths.docsTemplates, [ 'compile-docs-templates', 'refresh-server' ]);
    gulp.watch(sourcePaths.docsStyles, [ 'compile-docs-styles', 'refresh-server' ]);

    gulp.watch(sourcePaths.libraryModuleScript, [ 'compile-library', 'refresh-server' ]);
    gulp.watch(sourcePaths.libraryScripts, [ 'compile-library', 'refresh-server' ]);
    gulp.watch(sourcePaths.libraryTemplates, [ 'compile-library-templates', 'refresh-server' ]);
    gulp.watch(sourcePaths.libraryStyles, [ 'compile-library-styles', 'refresh-server' ]);
    gulp.watch(sourcePaths.libraryImages, [ 'compile-library-images', 'refresh-server' ]);


    registerAppWatchers = function (appName) {
        var appSources = ['./src/app/' + appName + '/**/*.js'],
            appModuleScript = './src/app/' + appName + '/app.js',

            appTemplates = ['src/app/' + appName + '/**/*.html'],
            appTemplateModule = 'cyphy.' + appName + '.templates',

            appStyles = ['src/app/' + appName + '/**/*.scss'];

        gulp.watch(appModuleScript, [ 'compile-' + appName + '-app', 'refresh-server' ]);
        gulp.watch(appSources, [ 'compile-' + appName + '-app', 'refresh-server' ]);
        gulp.watch(appTemplates, [ 'compile-' + appName + '-app-templates', 'refresh-server' ]);
        gulp.watch(appStyles, [ 'compile-' + appName + '-app-styles', 'refresh-server' ]);
//        gulp.watch(sourcePaths.libraryImages, [ 'compile-' + appName + '-app-images', 'refresh-server' ]);

    };

    for (i = 0; i < applications.length; i += 1) {
        registerAppWatchers(applications[i]);
    }

    gulp.watch('src/plugins/**', ['rjs-build']);
    return cb;
});

// Dev task
gulp.task('dev', function (cb) {

    runSequence('start-server', 'register-watchers', cb);

});
