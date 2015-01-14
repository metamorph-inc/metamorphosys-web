/*globals process, __dirname */
// find 'C:\Users\kevin\Documents\meta-tonka\META\test\InterchangeTest\ComponentInterchangeTest\ImportTestModels' -iname \*acm | while read -r file ; do echo "$file";  echo "$file" | sed 's!.*\\!!; s!ImportTestModels.!!; s!/!_!'; done
/*
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * Author: Zsolt Lattmann, Patrik Meijer
 *
 * This script will combine all acm files in the current directory (recursively)
 * into one Templates.js file. By importing this file as TEMPLATE you can retrieve the
 * content of each original acm file through TEMPLATES['plugin.js.acm'].
 *
 * Usage: Run this script in the directory with the acm-templates, e.g. '%YourPlugin%/Templates'.
 */

function hasExtension(fileName, ext) {
    'use strict';
    var ending = ext,
        lastIndex = fileName.lastIndexOf(ending);
    return (lastIndex !== -1) && (lastIndex + ending.length === fileName.length);
}

var main = function () {
    'use strict';
    var fs = require('fs'),
        isacmFile = function (str) {
            return ['.acm', '.adm', '.json'].map(function (ext) {
                    return hasExtension(str, ext);
                }).indexOf(true) !== -1;
        },
        walk = function (dir, done) {
            var results = [];
            fs.readdir(dir, function (err, list) {
                if (err) {
                    return done(err);
                }
                var i = 0;
                (function next() {
                    var file = list[i];
                    if (!file) {
                        return done(null, results);
                    }
                    i += 1;
                    file = dir + '/' + file;
                    fs.stat(file, function (err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, function (err, res) {
                                results = results.concat(res);
                                next();
                            });
                        } else {
                            results.push(file);
                            next();
                        }
                    });
                })();
            });
        },
        fileName,
        i,
        templateContent;

    ['acm/unit', 'adm/unit'].forEach(function (dir) {
        walk(dir, function (err, results) {
            var content = {};
            if (err) {
                throw err;
            }

            for (i = 0; i < results.length; i += 1) {
                fileName = results[i];
                // console.info(fileName);
                if (isacmFile(fileName)) {
                    var relFilename = fileName.substring(1 + dir.length);
                    content[relFilename] = fs.readFileSync(fileName, {'encoding': 'utf-8'});
                    if (hasExtension(fileName, ".json")) {
                        content[relFilename] = JSON.stringify(JSON.parse(content[relFilename]));
                    }
                }
            }

            //console.info(content);
            templateContent = '';
            templateContent += '/* global define,require */\r\n';
            templateContent += '/* Generated file based on acm templates */\r\n';
            templateContent += 'define([], function() {\r\n';
            templateContent += '"use strict";\r\n';
            templateContent += '    return ' + JSON.stringify(content, null, 4) + ';';
            templateContent += '});';

            fs.writeFileSync(dir + '/Templates.js', templateContent);
            console.info('Created Templates.js');
        });
    });
};

if (require.main === module) {
    process.chdir(__dirname);
    main();
}