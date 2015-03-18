/*
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * Author: Zsolt Lattmann, Patrik Meijer
 *
 * This script will combine all ejs files in the current directory (recursively)
 * into one Templates.js file. By importing this file as TEMPLATE you can retrieve the
 * content of each original ejs file through TEMPLATES['plugin.js.ejs'].
 *
 * Usage: Run this script in the directory with the ejs-templates, e.g. '%YourPlugin%/Templates'.
 */

var main = function () {
    'use strict';
    var fs = require('fs'),
        path = require('path'),
        walk = require('walk'),
        walker  = walk.walk('.', { followLinks: false }),
        files = {},
        content = {},
        templateContent;

    walker.on('file', function (root, stat, next) {
        // Add this file to the list of files
        if (path.extname(stat.name) === '.ejs') {
            files[stat.name] = root + '/' + stat.name;
            content[stat.name] = fs.readFileSync(root + '/' + stat.name, {'encoding': 'utf-8'});
        }
        next();
    });

    walker.on('end', function () {
        console.log(files);
        console.log(content);

        templateContent = '';
        templateContent += '/* Generated file based on ejs templates */\r\n';
        templateContent += 'define([], function() {\r\n';
        templateContent += '    return ' + JSON.stringify(content, null, 4);
        templateContent += '});';

        fs.writeFileSync('Templates.js', templateContent);
    });
};

if (require.main === module) {
    main();
}