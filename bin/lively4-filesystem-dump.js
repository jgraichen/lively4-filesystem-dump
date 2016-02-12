#!/usr/bin/env nodejs
'use strict';

const
    Promise   = require('bluebird'),
    fs        = require('q-io/fs'),
    path      = require('path'),
    minimatch = require('minimatch'),
    mime      = require('mime');

// Long promise stack traces for debugging
Promise.longStackTraces();

const argv = require("argv").option([{
    name: 'ignore',
    type: 'list,string',
    short: 'i',
    description: 'Patterns to ignore, can be specified multiple times. Default: "node_modules", ".*"'
},{
    name: 'list',
    type: 'bool',
    short: 'l',
    description: 'Only list exported file paths'
},{
    name: 'output',
    type: 'path',
    short: 'o',
    description: 'Path to write dump; STDOUT if undefined'
},{
    name: 'pretty',
    type: 'bool',
    short: 'p',
    description: 'Output pretty JSON instead of minified'
}]);

const conf = Object.assign({}, {
    ignore: ['node_modules', '\.*']
}, argv.run().options);

const isExcluded = function(location) {
    const name = path.basename(location)

    for(let ignore of conf.ignore) {
        if(minimatch(location, ignore, {matchBase: true}))
            return true
    }

    return false
}

const collectMeta = Promise.coroutine(function* (root, location) {
    const realpath = path.normalize(path.join(root, location))
    const stat = yield fs.stat(realpath)

    if(stat.isFile()) {
        return [{
            type: 'file',
            name: path.basename(location),
            path: location,
            size: stat.size,
            mime: mime.lookup(realpath)
        }]
    }

    if(stat.isDirectory()) {
        var files = yield fs.list(realpath),
            files = files.map((name) => path.join(location, name))
            files = files.filter((path) => !isExcluded(path))

        var stats = files.map((file) => collectMeta(root, file)),
            stats = yield Promise.all(stats),
            stats = stats.filter((stat) => typeof stat !== 'undefined'),
            stats = Array.prototype.concat.apply([], stats)

        let content = stats
            .filter((stat) => files.indexOf(stat.path) !== -1)
            .map((stat) => stat.name)

        stats.push({
            type: 'directory',
            name: path.basename(location),
            path: location,
            content: content
        })

        return stats
    }
})

Promise.coroutine(function* () {
    let info = yield collectMeta('.', '/')

    if(conf.list) {
        info = info.map((stat) => stat.path)
    }

    let data = JSON.stringify(info, null, conf.pretty ? '\t' : null)

    if(conf.output) {
        yield fs.write(conf.output, data)
    } else {
        console.log(data)
    }
})()
