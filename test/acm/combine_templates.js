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

var main = function () {
    'use strict';
    var fs = require('fs'),
        isacmFile = function (str) {
            return ['.acm', '.json'].map(function (ext) {
                var ending = ext,
                    lastIndex = str.lastIndexOf(ending);
                return (lastIndex !== -1) && (lastIndex + ending.length === str.length);
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
        content = {},
        fileName,
        i,
        templateContent;

    walk('.', function (err, results) {
        if (err) {
            throw err;
        }

        for (i = 0; i < results.length; i += 1) {
            fileName = results[i];
            console.info(fileName);
            if (isacmFile(fileName)) {
                content[fileName.substring(2)] = fs.readFileSync(fileName, {'encoding': 'utf-8'});
            }
        }

        console.info(content);
        templateContent = '';
        templateContent += '/* Generated file based on acm templates */\r\n';
        templateContent += 'define([], function() {\r\n';
        templateContent += '    return ' + JSON.stringify(content, null, 4);
        templateContent += '});';

        fs.writeFileSync('Templates.js', templateContent);
        console.info('Created Templates.js');
    });
};

if (require.main === module) {
    main();
}