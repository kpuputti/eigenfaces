/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global window: false, document: false, XMLHttpRequest: false  */

(function () {

    // Helper function for safe logging
    var log = function () {
        if (window.console && console.log && console.log.apply) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('Faces:');
            console.log.apply(console, args);
        }
    };

    // Get the XHR object
    var getXHR = function () {
        return new XMLHttpRequest();
    };

    // Fetch the contents of the given URL
    var fetch = function (url, callback) {
        log('fetching data from url:', url);
        var req = getXHR();
        req.open('GET', url, false);
        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                callback(req.responseText);
            } else if (req.readyState === 4) {
                alert('Cannot load data from URL: ' + url);
            }
        };
        req.send();
    };

    // Flatten a matrix
    var flatten = function (arr) {
        var flattened = [];
        arr.forEach(function (subarr) {
            flattened.push.apply(flattened, subarr);
        });
        return flattened;
    };

    // Constructor function for the Faces prototype
    var Faces = function () {
        this.canvasOriginal = document.querySelector('canvas.original');
        this.controls = document.querySelector('.controls');
        this.csvURL = '../data/data.csv';
        this.init();
    };

    // Initialize data for the instance
    Faces.prototype.init = function () {
        var that = this;
        this.fetchCSV(function (response) {
            that.data = that.parse(response);
            that.matrix = that.collectMatrix(that.data);
            that.start();
        });
    };

    // Fetch CSV data
    Faces.prototype.fetchCSV = function (callback) {
        fetch(this.csvURL, function (response) {
            log('received response:', response.substr(0, 50) + '...');
            callback(response);
        });
    };

    // Parse CSV data into matrices
    Faces.prototype.parse = function (csvText) {
        log('parsing CSV text with length:', csvText.length);

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

    // Collect a large matrix from the individual data matrices
    Faces.prototype.collectMatrix = function (data) {
        var matrix = [];
        data.forEach(function (chunk) {
            matrix.push(flatten(chunk));
        });
        return matrix;
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

    // Select the image with the given index, draws the image to a
    // canvas
    Faces.prototype.selectIndex = function (index) {
        log('select image with index:', index);
        this.drawData(this.data[index], this.canvasOriginal);
        this.controls.querySelector('.data-selector').selectedIndex = index + 1;
    };

    // Initialize the application controls
    Faces.prototype.initControls = function () {
        log('initializing controls');

        var len = this.data.length;
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

    // Start the application
    Faces.prototype.start = function () {
        this.initControls();

        var hash = window.location.hash.replace(/^#/, '') || 'application';
        window.setTimeout(function () {
            document.body.className = hash;
            window.location.hash = hash;
        }, 200);
        window.addEventListener('hashchange', function () {
            document.body.className = window.location.hash.replace(/^#/, '');
        }, false);
    };

    // Expose the Faces prototype to the global scope
    window.Faces = Faces;
}());
