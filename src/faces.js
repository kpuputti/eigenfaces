/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global window: false, document: false, XMLHttpRequest: false  */

(function () {

    var log = function () {
        if (window.console && console.log && console.log.apply) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('Faces:');
            console.log.apply(console, args);
        }
    };

    var getXHR = function () {
        return new XMLHttpRequest();
    };

    var fetch = function (url, callback) {
        log('fetching data from url:', url);
        var req = getXHR();
        req.open('GET', url, false);
        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                callback(req.responseText);
            }
        };
        req.send();
    };

    var Faces = function (canvas, csvURL) {
        log('initialize Faces instance with canvas:', canvas,
            'and CSV URL:', csvURL);
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.csvURL = csvURL;
        this.init();
    };

    Faces.prototype.init = function () {
        var that = this;
        this.fetchCSV(function (response) {
            var parsed = that.parse(response);
        });
    };

    Faces.prototype.fetchCSV = function (callback) {
        fetch(this.csvURL, function (response) {
            log('received response:', response.substr(0, 50) + '...');
            callback(response);
        });
    };

    Faces.prototype.parse = function (csvText) {
        log('parsing CSV text with length:', csvText.length);
    };

    window.Faces = Faces;
}());
