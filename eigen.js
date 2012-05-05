/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global require: false, process: false */

var fs = require('fs');
var sylvester = require('sylvester');
var underscore = require('underscore');
var exec = require('child_process').exec;

var PWD = process.env.PWD;
var CSV_PATH = PWD + '/data/data.csv';
var EIGENVALUES_FILE = PWD + '/data/eigenvalues.json';

var start = Date.now();

var log = function (s) {
    console.log(s);
};
var end = function () {
    log('ready in ' + (Date.now() - start) + 'ms');
};

var avg = function (arr) {
    return arr.reduce(function (a, b) {
        return a + b;
    }) / arr.length;
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
    return matrix.transpose();
};

var calculateEigenvalues = function (covmatrixFile, callback) {
    log('calculating eigenvalues from file: ' + covmatrixFile);
    var cmd = 'python eigvals.py ' + covmatrixFile;
    log('running command: ' + cmd);
    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            throw err;
        }
        callback(JSON.parse(stdout));
    });
};

var writeCovMatrix = function (matrix, callback) {
    log('calculating covmatrix');
    var covmatrix = matrix.x(matrix.transpose());
    var covdims = covmatrix.dimensions();
    log('covmatrix with ' + covdims.rows + ' rows and ' +
        covdims.cols + ' columns');

    var outfile = PWD + '/tmp/covmatrix.json';
    log('writing output json file: ' + outfile);

    var json = JSON.stringify(covmatrix.toArray());
    fs.writeFile(outfile, json, function (err) {
        if (err) {
            throw err;
        }
        callback(outfile);
    });
};

var getAvgMatrix = function (matrix) {
    var averages = matrix.toArray().map(function (row) {
        return avg(row);
    });
    var avgMatrix = matrix.toArray().map(function (row, rowIndex) {
        // take out the row average from each cell of the row
        return row.map(function (cell) {
            return cell - averages[rowIndex];
        });
    });
    return sylvester.Matrix.create(avgMatrix);
};

var saveEigenvalues = function (covMatrixFile, eigfile, callback) {
    calculateEigenvalues(covMatrixFile, function (eigvals) {
        log('got ' + eigvals.length + ' eigenvalues');
        var eigData = JSON.stringify(eigvals);
        fs.writeFile(eigfile, eigData, function (err) {
            if (err) {
                throw err;
            }
            callback();
        });
    });
};

var savePCAData = function (matrix, callback) {
    // a. remove averages from each dimension

    // TODO: check this, something weird happening here

    var avgMatrix = getAvgMatrix(matrix);

    // b. calculate covariance matrix
    writeCovMatrix(avgMatrix, function (covMatrixFile) {

        // c. calculate the eigenvectors and eigenvalues of the
        // covariance matrix

        var eigfile = EIGENVALUES_FILE;
        saveEigenvalues(covMatrixFile, eigfile, function () {
            log('saved eigenvalues to file: ' + eigfile);
            callback();
        });
    });
};

var processCSV = function (csv, callback) {
    log('read ' + csv.length + ' chars of data');
    var matrix = getMatrix(csv.toString());
    var dims = matrix.dimensions();
    log('parsed matrix with ' +
        dims.rows + ' rows and ' +
        dims.cols + ' columns');

    savePCAData(matrix, callback);
};

var main = function () {
    log('reading CSV file: ' + CSV_PATH);
    fs.readFile(CSV_PATH, function (err, csv) {
        if (err) {
            throw err;
        }
        processCSV(csv, function () {
            end();
        });
    });
};
main();
