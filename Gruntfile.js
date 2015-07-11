/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'js/namespace.js',
            'js/utils/IrregularNumber.js',
            'js/utils/MultiArray.js',
            'js/RowSignature.js',
            'js/Index.js',
            'js/IndexCollection.js',
            'js/Table.js',
            'js/exports.js'
        ],

        test: [
            'js/jsTestDriver.conf'
        ],

        globals: {}
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};
