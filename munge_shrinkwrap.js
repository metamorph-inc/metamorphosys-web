var fs = require('fs');
var http = require('https');

var shrinkwrap = JSON.parse(fs.readFileSync('npm-shrinkwrap.json'), {encoding: 'utf-8'});

var get_queue = [];
function get(path, callback) {
    get_queue.push({path: path, callback: callback});
}

setInterval(function() {
    if (get_queue.length) {
        var g = get_queue.pop();
        http.get({hostname: 'api.github.com', port: 443, path: g.path, headers: 
            {'User-Agent': 'curl/7.30.0',
            'Accept': '*/*',
            'Host': 'api.github.com'
            }}, function(res) {
            g.callback(res);
        }).on('error', function(e) {
            return g.callback("Got error: " + e.message);
        });
    }
}, 1000);

function fixup(o, key, callback) {
    var match;
    // https://github.com/webgme/webgme-domain-tools/tarball/master
    match = /github.com\/(.*)\/(.*)\/tarball\/(.*)/.exec(o[key])
    if (match) {
        var owner = match[1];
        var project = match[2];
        var tree = match[3];
        if (tree.length === 40) return;
        fixups++;
        get('/repos/' + owner + '/' + project + '/git/refs/heads/' + tree, function(res) {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body = body + chunk;
            });
            res.on('end', function() {
                if (res.statusCode !== 200) {
                    return callback("got " + res.statusCode + " for " + project + ": " + body);
                }
                var sha = JSON.parse(body).object.sha
                console.log("project: " + sha)
                o[key] = 'https://github.com/' + owner + '/' + project + '/tarball/' + sha
                callback(null);
            });
        });
    }
}

var fixups = 0;
function cb(err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    if (--fixups === 0) {
        done();
        process.exit(0);
    }
}
function munge(o) {
    for (var i in o.dependencies || []) {
        //console.log(i)
        munge(o.dependencies[i]);
    }
    if (o.from) {
        //fixup(o, 'from', cb);
    }
    if (o.resolved) {
        fixup(o, 'resolved', cb);
    }
}

munge(shrinkwrap);
if (fixups === 0) {
    console.error("nothing to do. Did you `npm install` when npm-shrinkwrap.json already existed?");
}
function done() {
    fs.writeFileSync('npm-shrinkwrap_munge.json', JSON.stringify(shrinkwrap, null, 2), {encoding: 'utf-8'});
}
