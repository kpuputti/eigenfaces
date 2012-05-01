/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global window: false */

(function () {
    var lib = {};

    // Calculate the sum of the array items
    lib.sum = function (arr) {
        return arr.reduce(function (a, b) {
            return a + b;
        });
    };

    // Calculate the average of the array items
    lib.avg = function (arr) {
        return arr.reduce(function (a, b) {
            return a + b;
        }) / arr.length;
    };

    // Flatten a matrix
    lib.flatten = function (matrix) {
        return matrix.reduce(function (a, b) {
            return a.concat(b);
        });
    };

    // Create a matrix with the given dimensions with zero in each
    // cell
    lib.zeros = function (rows, cols) {
        var matrix = [];
        for (var i = 0; i < rows; ++i) {
            matrix[i] = [];
            for (var j = 0; j < cols; ++j) {
                matrix[i][j] = 0;
            }
        }
        return matrix;
    };

    // Calculate the dot product of the given vectors
    lib.dotProduct = function (vector1, vector2) {
        if (vector1.length !== vector2.length) {
            throw new Error('Cannot calculate dot product ' +
                            'with vectors of different length.');
        }
        return lib.sum(vector1.map(function (val, index) {
            return val * vector2[index];
        }));
    };

    // Get the nth column of the given matrix
    lib.getMatrixColumn = function (matrix, n) {
        var column = [];
        matrix.forEach(function (row) {
            column.push(row[n]);
        });
        return column;
    };

    // Transpose a matrix
    lib.transpose = function (matrix) {
        // init new matrix with as many rows as there are columns in
        // the given matrix
        var transposed = lib.zeros(matrix[0].length, matrix.length);

        // Transpose the matrix values
        matrix.forEach(function (row, rowIndex) {
            row.forEach(function (val, colIndex) {
                transposed[colIndex][rowIndex] = val;
            });
        });
        return transposed;
    };

    // Multiply the given matrices
    lib.multiply = function (matrix1, matrix2) {
        if (matrix1.length === 0 || matrix1[0].length !== matrix2.length) {
            throw new Error('Cannot multiply matrices with the given dimensions.');
        }
        var result = lib.zeros(matrix1.length, matrix2[0].length);
        for (var i = 0, len1 = result.length; i < len1; ++i) {
            for (var j = 0, len2 = result[i].length; j < len2; ++j) {
                result[i][j] = lib.dotProduct(matrix1[i],
                                              lib.getMatrixColumn(matrix2, j));
            }
        }
        return result;
    };

    window.algebralib = lib;
}());
