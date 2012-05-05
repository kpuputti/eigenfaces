/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global require: false, process: false */

var fs = require('fs');
var sylvester = require('sylvester');
var underscore = require('underscore');

var CSV_PATH = process.env.PWD + '/data/data.csv';
var start = Date.now();

var log = function (s) {
    console.log(s);
};
var end = function () {
    log('ready in ' + (Date.now() - start) + 'ms');
};

var getMatrix = function (csv) {
    // matrix chunks are separated by a '-' character
    var chunks = csv.split('-').map(function (val) {
        // remove whitespace from the beginning and the end
        return val.replace(/^\s|\s$/g, '');
    }).filter(function (val) {
        // filter out empty values
        return !!val;
    });
    // parse the matrix data from the chunks
    var data = chunks.map(function (chunk) {
        var lines = chunk.split('\n');
        return lines.map(function (line) {
            return line.split(',').map(function (num) {
                return parseInt(num, 10);
            });
        });
    });

    log('parsed ' + data.length + ' image matrices with dimensions ' +
        data[0].length  + 'x' + data[0][0].length);

    var scanned = data.map(function (chunk) {
        return underscore.flatten(chunk);
    });
    var matrix = sylvester.Matrix.create(scanned);
    return matrix;
};

var main = function () {
    log('reading CSV file: ' + CSV_PATH);
    fs.readFile(CSV_PATH, function (err, csv) {
        if (err) {
            throw err;
        }
        log('read ' + csv.length + ' chars of data');
        var matrix = getMatrix(csv.toString());
        var dims = matrix.dimensions();
        log('parsed matrix with ' +
            dims.rows + ' rows and ' +
            dims.cols + ' columns');
        end();
    });
};
main();
