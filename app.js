var __			= require('lodash')
var http		= require('http')
var https		= require('https')
var request		= require('request')
var fs			= require('fs-extra')
var quefs		= require('graceful-fs')
var path		= require('path')
var dir			= require('node-dir')
var color		= require('colors');
var progress	= require('progress')
var inquirer	= require('inquirer-longer')
var changeCase	= require('change-case');
var utils		= require('./utils')
var async		= require('async')
var archiver	= require('archiver')
var args		= require('minimist')(process.argv.slice(2));

var api			= 'https://api.fakku.net'

color.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

if(args._)
{
	var otherArgs = __.map(args._, function(arg){ var a = {}; a[arg] = true; return a; })

	__.each(otherArgs, function(value, key)
	{
		__.extend(args, value);
	})
}

if(args.news)
{
	var page = 1;

	if(args.page && typeof args.page !== 'boolean')
	{
		page = args.page;
	}

	utils.getNewest(page);

} else if (args.dowmloaded || args.D) {

	var query = args.dowmloaded || args.D;

	if(typeof query == 'boolean' && query)
	{
		query = '*';
	}

	fs.readdir(__dirname + '/downloads', function(err, data)
	{
		if(err)
		{
			console.log(err)

			return false;
		}

		console.log('')
		console.log('=== Downloaded Manga(s) ===')
		console.log('')

		__.each(data, function(value, key, lists)
		{
			if(query !== '*')
			{
				var re = new RegExp(query.toLowerCase());

				var match = value.toLowerCase().match(re);

				if(match)
				{
					console.log('- %s'.info, value)
				}

			} else {

				console.log('- %s'.info, value)
			}
		})
	})

} else if (args.tags || args.T) {

	var query = args.tags || args.T;

	if(typeof query == 'boolean' && query)
	{
		query = '*';
	}

	console.log('requesting information from %s'.info, api + '/tags')

	request(api + '/tags', function(err, res, body)
	{
		if(err)
		{
			console.log(err)

			return false;
		}

		var data = JSON.parse(body);

		var choices = [];

		__.each(data.tags, function(value, key, lists)
		{
			var temp = {};

			temp.name = value.tag_name

			temp.value = value

			choices.push(temp)
		})

		inquirer.prompt([{

			type: 'list',
			message: 'Filter Manga by tags',
			name: 'tags',
			choices: choices

		}], function(answers){

			var page = 1;

			if(args.page && typeof args.page !== 'boolean')
			{
				page = args.page;
			}

			utils.getByTags(answers.tags.tag_name.toString().toLowerCase(), page);
		})
	})

} else if (args.search || args.S) {

	var query = args.search || args.S;

	if(typeof query == 'boolean' && query)
	{
		query = '';
	}

	var page = 1;

	if(args.page && typeof args.page !== 'boolean')
	{
		page = args.page;
	}

	utils.searchManga(query, page);

} else if (args.build || args.B) {

	fs.ensureDir(__dirname + '/builds');

	var buildPath = __dirname + '/builds/'

	var downloadPath = __dirname + '/downloads/'

	var que = [];

	var i = 1;

	fs.readdir(__dirname + '/downloads', function(err, data)
	{
		if(err)
		{
			console.log(err);

			return false
		}

		__.each(data, function(mangaName, key, lists)
		{
		
			que.push(function(callback)
			{
				// console.log('Creating %s.cbr'.info, mangaName)

				var zip = archiver('zip')

				var output = quefs.createWriteStream(buildPath + mangaName + '.cbr');

				output.on('close', function() 
				{
					// console.log(zip.pointer() + ' total bytes');
					// console.log('archiver has been finalized and the output file descriptor has closed.');
					console.log('%s.cbr Created!'.info, mangaName)
					callback(null, i)
				});

				zip.on('error', function(err) 
				{
					throw err;
				});

				zip.pipe(output);

				zip.bulk([
					{ 
						expand: true,
						cwd: downloadPath + mangaName,
						src: ['**']
					}
				])

				zip.finalize();
			})

			i++;	
		})

		async.series(que);
	})
}

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

setTimeout(function () {
  // console.log('This will still run.');
}, 500);

// Intentionally cause an exception, but don't catch it.
nonexistentFunc();
// console.log('This will not run.');