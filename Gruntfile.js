/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var $asset = require('giant-asset'),
        packageNode = require('./package.json'),
        manifestNode = require('./manifest.json'),
        manifest = $asset.Manifest.create(manifestNode),
        multiTasks = [].toMultiTaskCollection(),
        gruntTasks = [].toGruntTaskCollection();

    $asset.GruntProxy.create()
        .setGruntObject(grunt);

    'concat'
        .toMultiTask({
            'default': {
                src : manifest.getAssets('js')
                    .getAssetNames(),
                dest: 'lib/' + packageNode.name + '.js'
            }
        })
        .setPackageName('grunt-contrib-concat')
        .addToCollection(multiTasks);

    'karma'
        .toMultiTask({
            'default': {
                configFile: 'karma.conf.js',
                singleRun : true
            }
        })
        .setPackageName('grunt-karma')
        .addToCollection(multiTasks);

    'build'
        .toAliasTask()
        .addSubTasks('karma', 'concat')
        .addToCollection(gruntTasks);

    // registering tasks
    multiTasks.toGruntConfig()
        .applyConfig()
        .getAliasTasksGroupedByTarget()
        .mergeWith(multiTasks.toGruntTaskCollection())
        .mergeWith(gruntTasks)
        .applyTask();
};
