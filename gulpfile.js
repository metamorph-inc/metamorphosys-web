/*globals require, console, process*/
'use strict';

var argv = require('yargs').argv,
    livereloadport = 35729,
    serverport = 5000,

    debug = !argv.production,
    debugShim = false, //this is for toggling browserify shim debug

    doNotCompileApps = ['clientTest', 'perfTest'],

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
            'src/library/**/*.png',
            'src/library**/*.jpg',
            'src/library**/*.svg'
        ],
        appSourcesFolders: './src/app/',
        appImagePatterns: [
            '**/*.png',
            '**/*.jpg',
            '**/*.svg'
        ]
    },

    buildRoot = 'public/',

    cyphyLibraryRoot = buildRoot + '/cyphy-library/',
    docsRoot = buildRoot + '/docs/',

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
    template = require('gulp-template'),

    prettify = require('gulp-js-prettify'),
    shell = require('gulp-shell'),
    fs = require('fs'),
    path = require('path'),

    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin');


// Utility tasks

require('process');

function swallowError(error) {
    //If you want details of the error in the console
    console.log(error.toString());

    this.emit('end');
}

function loadAppLibs(appName) {

    var appLibs,
        appLibsJSON;

    appLibsJSON = sourcePaths.appSourcesFolders + appName  + '/libs.json';

    if (fs.existsSync(appLibsJSON)) {

        appLibs = JSON.parse(fs.readFileSync(appLibsJSON, 'utf8'));

    }

    return appLibs;
}

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

gulp.task('clean-build', function () {
    return gulp.src(buildRoot).pipe(clean());
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

    bundle = function () {
        return bundler
            .bundle()
            .on('error', swallowError)
            .pipe(source(libraryName + '-docs.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            // Add transformation tasks to the pipeline here.
            //.pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(docsRoot));
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
        .pipe(gulp.dest(docsRoot));
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
        .pipe(gulp.dest(docsRoot));
});

gulp.task('compile-docs',
    ['lint-docs', 'browserify-docs', 'compile-docs-templates', 'compile-docs-styles'],
    function () {

        console.log('Compiling docs...');

        gulp.src(sourcePaths.docsSourceIndex)
            .pipe(rename(libraryName + '-docs.html'))
            .pipe(gulp.dest(docsRoot));

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

    bundle = function () {
        return bundler
            .bundle()
            .on('error', swallowError)
            .pipe(source(libraryName + '.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            // Add transformation tasks to the pipeline here.
            //.pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(cyphyLibraryRoot));
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
        .pipe(gulp.dest(cyphyLibraryRoot));
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
        .pipe(gulp.dest(cyphyLibraryRoot));
});

gulp.task('compile-library-images', function () {

    console.log('Compiling images...');

    gulp.src(sourcePaths.libraryImages)
        .pipe(rename(function (path) {
            path.dirname = '';
        }))
        .pipe(gulp.dest(cyphyLibraryRoot + '/images'));
});


gulp.task('compile-library',
    ['lint-library', 'browserify-library', 'compile-library-templates', 'compile-library-styles', 'compile-library-images'],
    function () {
        console.log('Compiling scripts...');
    });


// Application tasks
var applications,
    i,
    registerAppTasks,
    gulpAppTaskNames = [];

applications = getDirectories( sourcePaths.appSourcesFolders ).filter(
    function(folder) {
        return doNotCompileApps.indexOf(folder) === -1;
    }
)

registerAppTasks = function (appName) {

    var appSourceRoot = sourcePaths.appSourcesFolders + appName + '/',
        appBuildRoot = buildRoot + 'apps/' + appName + '/',

        appSources = [appSourceRoot + '**/*.js'],
        appModuleScript = appSourceRoot + 'app.js',

        appIndexFile = appSourceRoot + 'index.html',
        appTemplates = [appSourceRoot + '*/**/*.html'],

        appTemplateModule = 'cyphy.' + appName + '.templates',

        appStyles = [appSourceRoot + '**/*.scss'],

        appSvgSymbols = [appSourceRoot + '**/symbols/**/*.svg'],

        appImages = sourcePaths.appImagePatterns.map(function (imageType) {
            return appSourceRoot + imageType;
        }),

        stylesFilePath = 'styles/' + appName + '-app.css',
        appFilePath = 'scripts/' + appName + '-app.js',
        templateFilePath = 'scripts/' + appName + '-app-templates.js';

    gulp.task('generate-svg-map-' + appName, function () {
        return gulp.src( appSvgSymbols )
            .pipe(svgmin())
            .pipe(svgstore({ fileName: 'symbols.svg', prefix: 'icon-' }))
            .pipe(gulp.dest( appBuildRoot + 'images/' ));
    });

    gulp.task('lint-' + appName, function () {

        console.log('Linting ' + appName + '-app...');

        gulp.src(appSources)
            .pipe(jshint())
            .pipe(jshint.reporter('default'));

    });

    gulp.task('browserify-' + appName, function () {

        var bundler, bundle;
        console.log('Browserifying ' + appName + '-app...');

        if (debugShim) {
            process.env.BROWSERIFYSHIM_DIAGNOSTICS = 1;
        }
        bundler = browserify({
            entries: [appModuleScript],
            debug: true
        });

        bundle = function () {
            return bundler
                .bundle()
                .on('error', swallowError)
                .pipe(source(appSourceRoot + 'app.js'))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(rename(function (path) {
                    path.dirname = '';
                    path.basename = appName + '-app';
                    path.extname = '.js';
                }))
                // Add transformation tasks to the pipeline here.
                //.pipe(uglify())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(appBuildRoot + 'scripts/'));
        };

        return bundle();
    });

    gulp.task('copy-' + appName + '-libs', function () {

        var styleMapFileNames,
            scriptMapFileNames,
            scriptMapMapFileNames,
            appLibs;

        appLibs = loadAppLibs(appName);

        if (appLibs) {

            console.log('Copying ' + appName + '-libs...');

            styleMapFileNames = appLibs.styles.map(function (fileName) {
                return path.join(
                    path.dirname(fileName),
                    path.basename(fileName, '.css') + '.map'
                );
            });

            scriptMapFileNames = appLibs.scripts.map(function (fileName) {
                return path.join(
                    path.dirname(fileName),
                    path.basename(fileName, '.js') + '.map'
                );
            });

            scriptMapMapFileNames = appLibs.scripts.map(function (fileName) {
                return path.join(
                    path.dirname(fileName),
                    path.basename(fileName) + '.map'
                );
            });

            gulp.src(appLibs.styles)
                .pipe(rename(function (path) {
                    path.dirname = 'libs';
                }))
                .pipe(gulp.dest(appBuildRoot));

            gulp.src(appLibs.scripts)
                .pipe(rename(function (path) {
                    path.dirname = 'libs';
                }))
                .pipe(gulp.dest(appBuildRoot));

            gulp.src(styleMapFileNames)
                .pipe(rename(function (path) {
                    path.dirname = 'libs';
                }))
                .pipe(gulp.dest(appBuildRoot));

            gulp.src(scriptMapFileNames)
                .pipe(rename(function (path) {
                    path.dirname = 'libs';
                }))
                .pipe(gulp.dest(appBuildRoot));

            gulp.src(scriptMapMapFileNames)
                .pipe(rename(function (path) {
                    path.dirname = 'libs';
                }))
                .pipe(gulp.dest(appBuildRoot));

            if (appLibs.fonts) {
                gulp.src(appLibs.fonts)
                    .pipe(rename(function (path) {
                        path.dirname = 'fonts';
                    }))
                    .pipe(gulp.dest(appBuildRoot));
            }

            if (appLibs.misc) {
                gulp.src(appLibs.misc)
                    .pipe(rename(function (path) {
                        path.dirname = 'libs';
                    }))
                    .pipe(gulp.dest(appBuildRoot));
            }

        }

    });

    gulp.task('compile-' + appName + '-templates', function () {

        var scriptFileNames,
            styleFileNames,
            appLibs;

        console.log('Compiling ' + appName + '-app-templates...');

        appLibs = loadAppLibs(appName);

        gulp.src(appTemplates)
            .pipe(rename(function (path) {
                path.dirname = 'templates';
            }))
            .pipe(templateCache(appName + '-app-templates.js', {
                module: appTemplateModule,
                standalone: true,
                root: '/' + appName + '/'
            }))
            .pipe(gulp.dest(appBuildRoot + '/scripts/'));

        if (appLibs && appLibs.scripts) {

            scriptFileNames = appLibs.scripts.map(function (fileName) {
                return 'libs/' + path.basename(fileName);
            });

        } else {
            scriptFileNames = [];
        }

        if (appLibs && appLibs.styles) {

            styleFileNames = appLibs.styles.map(function (fileName) {
                return 'libs/' + path.basename(fileName);
            });

        } else {
            styleFileNames = [];
        }

        gulp.src(appIndexFile)
            .pipe(template({
                stylesFilePath: stylesFilePath,
                appFilePath: appFilePath,
                templateFilePath: templateFilePath,
                scripts: scriptFileNames,
                styles: styleFileNames
            }))
            .pipe(gulp.dest(appBuildRoot));
    });

    gulp.task('compile-' + appName + '-images', function () {

        console.log('Compiling images...');

        gulp.src(appImages)
            .pipe(rename(function (path) {
                path.dirname = '';
            }))
            .pipe(gulp.dest(appBuildRoot + 'images/'));
    });


    gulp.task('compile-' + appName + '-styles', function () {

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
            .pipe(gulp.dest(appBuildRoot + 'styles/'));
    });

    gulp.task('compile-' + appName + '-scripts',
        ['lint-' + appName,
            'browserify-' + appName],
        function () {
            console.log('Compiling ' + appName + ' scripts');
        }
    );

    gulp.task('compile-' + appName,
        [
            'compile-' + appName + '-scripts',
            'generate-svg-map-' + appName,
            'compile-' + appName + '-templates',
            'compile-' + appName + '-styles',
            'compile-' + appName + '-images',
            'copy-' + appName + '-libs'
        ],
        function () {
            console.log('Compiling ' + appName);
        });

    gulpAppTaskNames.push('compile-' + appName);

};


for (i = 0; i < applications.length; i += 1) {
    registerAppTasks(applications[i]);
}

gulp.task('build-plugins', shell.task(['node ./node_modules/requirejs/bin/r.js -o ./utils/build/webcyphy.plugins/cbuild.js']));

gulp.task('compile-all', function (cb) {
    runSequence(
        'clean-build',
        [
            'compile-docs',
            'compile-library'
        ],
        'build-plugins',
        gulpAppTaskNames,
        cb);
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


gulp.task('register-watchers', ['compile-all'], function (cb) {
    var i,
        registerAppWatchers;

    gulp.watch(sourcePaths.index, ['compile-index']);

    gulp.watch(sourcePaths.docsSourceIndex, ['compile-docs']);
    gulp.watch(sourcePaths.docsApp, ['compile-docs']);
    gulp.watch(sourcePaths.docsScripts, ['compile-docs']);
    gulp.watch(sourcePaths.docsTemplates, ['compile-docs-templates']);
    gulp.watch(sourcePaths.docsStyles, ['compile-docs-styles']);

    gulp.watch(sourcePaths.libraryModuleScript, ['compile-library']);
    gulp.watch(sourcePaths.libraryScripts, ['compile-library']);
    gulp.watch(sourcePaths.libraryTemplates, ['compile-library-templates']);
    gulp.watch(sourcePaths.libraryStyles, ['compile-library-styles']);
    gulp.watch(sourcePaths.libraryImages, ['compile-library-images']);


    registerAppWatchers = function (appName) {

        var
            appSourceRoot = sourcePaths.appSourcesFolders + appName + '/',

            appSources = [ appSourceRoot + '*.js', appSourceRoot + '**/*.js' ],

            appHtmls = [ appSourceRoot + '**/*.html'],

            appLibsJSON = appSourceRoot + 'libs.json',

            appStyles = [ appSourceRoot + '/**/*.scss'],

            appImages = sourcePaths.appImagePatterns.map(function(imageType) {
                return appSourceRoot + imageType;
            });

        gulp.watch(appSources, [ 'compile-' + appName + '-scripts' ]);
        gulp.watch(appHtmls, [ 'compile-' + appName + '-templates' ]);
        gulp.watch(appStyles, [ 'compile-' + appName + '-styles' ]);
        gulp.watch(appImages, [ 'compile-' + appName + '-images' ]);
        gulp.watch(appLibsJSON, [ 'compile-' + appName ]);
    };

    for (i = 0; i < applications.length; i += 1) {
        registerAppWatchers(applications[i]);
    }

    gulp.watch('src/plugins/**', ['build-plugins']);
    return cb;
});
