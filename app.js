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
var shell		= require('shelljs');
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

if (args.dowmloaded || args.D) {

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

} else {

	utils.mainMenu(true)

}

// process.stdin.resume();//so the program will not close instantly

// function exitHandler(options, err) 
// {
//     if (options.cleanup) 
//     {
//     	utils.mainMenu(false)
//     	process.stdin.resume();
//     	return
//     }

//     if (err) console.log(err.stack);
//     if (options.exit) process.exit();
// }

// //do something when app is closing
// process.on('exit', exitHandler.bind(null,{cleanup:true}));

// //catches ctrl+c event
// process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// //catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}));