/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global window: false, document: false, XMLHttpRequest: false,
  _: false, Sylvester: false */

(function () {

    'use strict';

    // Helper function for safe logging
    var log = function () {
        if (window.console && console.log && console.log.apply) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(Date.now() + ' Faces:');
            console.log.apply(console, args);
        }
    };

    // Constructor function for the Faces prototype
    var Faces = function () {
        this.startTime = Date.now();

        this.pixelSize = 3;

        this.canvasOriginals = document.querySelector('canvas.originals');
        this.canvasEigenfaces = document.querySelector('canvas.eigenfaces');

        this.canvasMean = document.querySelector('canvas.mean');

        this.canvasOriginal = document.querySelector('canvas.original');
        this.canvasEigenface = document.querySelector('canvas.eigenface');

        this.controls = document.querySelector('.controls');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.csvURL = '../data/data.csv';
        this.eigenvaluesURL = '../data/eigenvalues.json';
        this.avgDataURL = '../data/avgdata.json';
        this.init();
    };

    // Get the XHR object
    Faces.prototype.getXHR = function () {
        return new XMLHttpRequest();
    };

    // Fetch the contents of the given URL
    Faces.prototype.fetch = function (url, callback) {
        log('fetching data from url:', url);
        var req = this.getXHR();
        req.open('GET', url, false);
        req.onreadystatechange = function () {
            if (req.readyState === 4 && (req.status === 200 || req.status === 0)) {
                callback(req.responseText);
            } else if (req.readyState === 4) {
                alert('Cannot load data from URL: ' + url);
            }
        };
        req.send();
    };

    Faces.prototype.normalize = function (arr, range) {
        var min = _.min(arr);
        var max = _.max(arr);
        var diff = max - min;
        return arr.map(function (val) {
            return Math.round((val - min) / diff * range);
        });
    };

    Faces.prototype.reshape = function (arr, n) {
        var reshaped = _.range(n).map(function (val, index) {
            return arr.slice(index * n, index * n + n);
        });
        return reshaped;
    };

    // Initialize data for the instance
    Faces.prototype.init = function () {
        var that = this;
        this.loadingIndicator.innerHTML = 'fetching data...';
        var fetched = 0;
        var filesToFetch = 3;
        this.fetch(this.csvURL, function (response) {
            log('fetched CSV data');
            that.imageData = that.parse(response);
            fetched++;
            if (fetched === filesToFetch) {
                that.start();
            }
        });
        this.fetch(this.eigenvaluesURL, function (response) {
            var data = JSON.parse(response);
            that.eigenvalues = data.eigenvalues;
            that.eigenvectors = data.eigenvectors;
            log('fetched', that.eigenvalues.length, 'eigenvalues and',
                that.eigenvectors.length, 'eigenvectors');
            fetched++;
            if (fetched === filesToFetch) {
                that.start();
            }
        });
        this.fetch(this.avgDataURL, function (response) {
            var data  = JSON.parse(response);
            that.avgMatrix = data.avgMatrix;
            that.mean = data.mean;
            fetched++;
            if (fetched === filesToFetch) {
                that.start();
            }
        });
    };

    // Parse CSV data into matrices
    Faces.prototype.parse = function (csvText) {
        log('parsing CSV text with length:', csvText.length);
        this.loadingIndicator.innerHTML = 'parsing CSV data...';

        var chunks = csvText.split('-').map(function (val) {
            // remove whitespace from the beginning and the end
            return val.replace(/^\s|\s$/g, '');
        }).filter(function (val) {
            // filter out empty values
            return !!val;
        });

        log('parsed', chunks.length, 'chunks');

        // parse the matrix data from the chunks
        var data = chunks.map(function (chunk) {
            var lines = chunk.split('\n');
            return lines.map(function (line) {
                return line.split(',').map(function (num) {
                    return window.parseInt(num, 10);
                });
            });
        });
        return data;
    };

    // Draw the given data to the given canvas
    Faces.prototype.drawData = function (data, canvas) {
        // clear canvas
        canvas.width = canvas.width;
        var context = canvas.getContext('2d');

        var side = canvas.width / data[0].length;
        var row, val;
        for (var i = 0, len1 = data.length; i < len1; ++i) {
            row = data[i];
            for (var j = 0, len2 = row.length; j < len2; ++j) {
                val = row[j];
                context.fillStyle = 'rgb(' +
                    val + ', ' + val + ', ' + val +
                    ')';
                context.fillRect(j * side, i * side, side, side);
            }
        }
    };

    Faces.prototype.getEigenface = function (index) {
        var colMatrix = Sylvester.Matrix.create(this.eigenvectors).col(index + 1);
        var col = colMatrix.elements;
        var row = this.eigenvectors[index];
        var arr = col;
        var norm = this.normalize(arr, 255);
        var shaped = this.reshape(norm, 19);

        var meanMatrix = Sylvester.Matrix.create(this.reshape(this.mean, 19));
        var data = this.reshape(colMatrix.elements, 19);
        data = this.reshape(this.eigenvectors[index], 19);
        var multiplied = Sylvester.Matrix.create(data).x(meanMatrix);

        var result = this.reshape(this.normalize(_.flatten(multiplied.elements), 255), 19);

        return shaped;
    };

    // Select the image with the given index, draws the image to a
    // canvas
    Faces.prototype.selectIndex = function (index) {
        this.drawData(this.imageData[index], this.canvasOriginal);
        this.controls.querySelector('.data-selector').selectedIndex = index + 1;
    };

    // Initialize the application controls
    Faces.prototype.initControls = function () {
        log('initializing controls');

        var len = this.imageData.length;
        var dataSelector = this.controls.querySelector('.data-selector');
        var option;
        for (var i = 0; i < len; ++i) {
            option = document.createElement('option');
            option.value = i;
            option.innerHTML = i;
            dataSelector.appendChild(option);
        }

        var that = this;
        dataSelector.addEventListener('change', function () {
            var value = window.parseInt(dataSelector.value, 10);
            if (!isNaN(value)) {
                that.selectIndex(value);
            }
        }, false);
    };

    Faces.prototype.draw = function (matrix, offsetX, offsetY, canvas, row, col) {
        var context = canvas.getContext('2d');
        var val;
        for (var i = 0, len1 = matrix.length; i < len1; ++i) {
            for (var j = 0, len2 = matrix[i].length; j < len2; ++j) {
                val = matrix[i][j];
                context.fillStyle = 'rgb(' +
                    val + ', ' + val + ', ' + val +
                    ')';
                var x = offsetX + i * this.pixelSize;
                var y = offsetY + j * this.pixelSize;
                context.fillRect(y, x, this.pixelSize, this.pixelSize);
            }
        }
    };

    Faces.prototype.drawOriginals = function () {
        var imageRows = this.reshape(this.imageData, 10);
        var row, img, offsetX, offsetY;
        for (var i = 0, len1 = imageRows.length; i < len1; ++i) {
            row = imageRows[i];
            for (var j = 0, len2 = row.length; j < len2; ++j) {
                img = row[j];
                offsetX = 19 * i * this.pixelSize;
                offsetY = 19 * j * this.pixelSize;
                this.draw(img, offsetX, offsetY, this.canvasOriginals, i, j);
            }
        }
    };

    Faces.prototype.drawEigenfaces = function () {
        var index, offsetX, offsetY, eigenData;
        for (var i = 0; i < 10; ++i) {
            for (var j = 0; j < 10; ++j) {
                index = 10 * i + j;
                if (index >= this.imageData.length) {
                    return;
                }
                offsetX = 19 * i * this.pixelSize;
                offsetY = 19 * j * this.pixelSize;
                //eigenData = this.normalize(_.flatten(this.getEigenface(index)), 255);
                //this.draw(this.reshape(eigenData, 19), offsetX, offsetY,
                //this.canvasEigenfaces, i, j);
                eigenData = this.getEigenface(index);
                this.draw(eigenData, offsetX, offsetY, this.canvasEigenfaces, i, j);
            }
        }
    };

    Faces.prototype.initCanvases = function () {
        this.canvasOriginals.setAttribute('width', 190 * this.pixelSize);
        this.canvasOriginals.setAttribute('height', 190 * this.pixelSize);
        this.canvasEigenfaces.setAttribute('width', 190 * this.pixelSize);
        this.canvasEigenfaces.setAttribute('height', 190 * this.pixelSize);

        this.drawOriginals();
        this.drawEigenfaces();
    };

    // Start the application
    Faces.prototype.start = function () {
        this.initControls();
        this.initCanvases();

        this.loadingIndicator.innerHTML = 'done';

        var meanNorm = this.normalize(this.mean, 255);
        this.drawData(this.reshape(meanNorm, 19), this.canvasMean);

        var hash = window.location.hash.replace(/^#/, '') || 'application';
        document.body.className = hash;
        window.location.hash = hash;
        window.addEventListener('hashchange', function () {
            document.body.className = window.location.hash.replace(/^#/, '');
        }, false);

        var elapsed = Date.now() - this.startTime;
        log('Faces ready in', elapsed, 'ms');
    };

    // Expose the Faces prototype to the global scope
    window.Faces = Faces;
}());
