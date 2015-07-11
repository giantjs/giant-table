/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'src/namespace.js',
            'src/utils/IrregularNumber.js',
            'src/utils/MultiArray.js',
            'src/RowSignature.js',
            'src/Index.js',
            'src/IndexCollection.js',
            'src/Table.js',
            'src/exports.js'
        ],

        test: [
            'src/jsTestDriver.conf'
        ],

        globals: {}
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};
