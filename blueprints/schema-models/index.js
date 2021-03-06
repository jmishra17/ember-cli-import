var Blueprint  = require('ember-cli/lib/models/blueprint');
var Promise    = require('ember-cli/lib/ext/promise');
var merge      = require('ember-cli/node_modules/lodash/object/merge');
var inflection = require('ember-cli/node_modules/inflection');
var sailsParser = require('./sails-parser');
module.exports = {
  description: '',

  // locals: function(options) {
  //   // Return custom template variables here.
  //   return {
  //     foo: options.entity.options.foo
  //   };
  // }

  // afterInstall: function(options) {
  //   // Perform extra work here.
  // }

  install: function(options) {
    return this._process('install', options);
  },

  uninstall: function(options) {
    return this._process('uninstall', options);
  },

  _processBlueprint: function(type, name, options) {
    var mainBlueprint = Blueprint.lookup(name, {
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return Promise.resolve()
      .then(function() {
        return mainBlueprint[type](options);
      })
      .then(function() {
        var testBlueprint = mainBlueprint.lookupBlueprint(name + '-test', {
          ui: this.ui,
          analytics: this.analytics,
          project: this.project,
          ignoreMissing: true
        });

        if (!testBlueprint) { return; }

        if (testBlueprint.locals === Blueprint.prototype.locals) {
          testBlueprint.locals = function(options) {
            return mainBlueprint.locals(options);
          };
        }

        return testBlueprint[type](options);
      });
  },

  _process:function(type, options){
    console.log('options -->', options);
    var path; var schemaType;
    if(!options.entity.name){
      throw new Error('no pathname mentioned');
    } 
    path = options.entity.name;
    if(!options.entity.options.schema){
      throw new Error('no schema type provided');
    }
    schemaType = options.entity.options.schema;
    delete options.entity.options.schema;

    var schema;
    if(schemaType == 'sails'){
      schema = sailsParser.getSchema(path);
    }
    var models;
    if(!schema.hasOwnProperty('models')){
      throw new Error('The given directory did not contain any models of the schema type '+ schemaType);
    }
    models = schema.models;
    var blueprintPromisesArr = [];

    for(var i=0;i<models.length;i++){
      var modelOptions = merge({}, options, {
        entity: {
          name:models[i].name,
          options:models[i].attrs
        }
      });
      var blueprintPromise = this._processBlueprint(type, 'model', modelOptions);
      blueprintPromisesArr.push(blueprintPromise);
    }

    return Promise.all(blueprintPromisesArr);


      // {
      //   models: [
      //      {
      //       name:user 
      //       attrs:{
      //           name:'attr;,
      //           hasMany:'comments'
      //        }
      //     },
      //     {
      //       name:comment
      //        attrs: {
      //          type:'string', 
      //          creationDate:'date',
      //          photo:'belongsTo'
      //       }
      //     }
      //   ]
      // }



    // var modelOptionsArr = [], blueprintPromisesArr = [];
    // var modelNames = ['user', 'comment', 'post', 'affiliation', 'reunion'];
    // for(var i=0;i<modelNames.length;i++){
    //   var modelOption = merge({},options, {
    //     entity: {
    //       name:inflection.singularize(modelNames[i])
    //     }
    //   });
    //   modelOptionsArr.push(modelOption);
    // }

    // for(var i=0;i<modelOptionsArr.length;i++){
    //   var blueprintPromise = this._processBlueprint(type, 'model', modelOptionsArr[i]);
    //   blueprintPromisesArr.push(blueprintPromise);
    // }
    // return Promise.all(blueprintPromisesArr);
    return Promise.resolve();
  }
};
