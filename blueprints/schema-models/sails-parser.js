var fs  = require('fs');
module.exports = {
	requireFiles:function(dir){
		var files = require(dir);
	},
	getSchema:function(dirname){
		return {
			models:[
				{	
					name:'user',
					attrs:{
						'name':'string',
						'age':'number',
						'creation-date':'date'
					}
				},
				{
					name:'comment',
					attrs:{
						'context-type':'string',
						'context-text':'string',
						'creation-date':'date',
						'school-id':'number',
						'grad-year':'number'
					}
				}
			]
		};
	},

	getAttributes:function(fileName){

	},
	
	readAttributes:function(attrsObjs){

	}
}