/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global window: false, document: false  */

(function () {

    var log = function () {
        if (window.console && console.log && console.log.apply) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('Faces:');
            console.log.apply(console, args);
        }
    };

    var Faces = function (canvas) {
        log('initialize Faces instance with canvas:', canvas);
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
    };

    window.Faces = Faces;
}());
