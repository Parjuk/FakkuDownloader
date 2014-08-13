var __			= require('lodash')
var http		= require('http')
var https		= require('https')
var request		= require('request')
var fs			= require('fs-extra')
var path		= require('path')
var dir			= require('node-dir')
var color		= require('colors');
var progress	= require('progress')
var inquirer	= require('inquirer-longer')
var changeCase	= require('change-case');
var utils		= require('./utils')
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
	console.log()
	console.log('Gathering Information from %s'.info, api)

	request(api + '/index/page/2', function(err, res, body)
	{
		if(err)
		{
			throw err;
		}

		console.log('Information Received'.info)
		
		var data = JSON.parse(body)

		var i = 1;

		var choices = utils.buildChoiseManga(data.index)

		inquirer.prompt([{
		
			type: 'checkbox',
			message: 'Newest Manga',
			name: 'manga',
			choices: choices

		}], function(answers)
		{
			var toDownload = utils.buildChoiseMangaToDownload(answers.manga)

			utils.printMangaInfo(answers.manga);

			inquirer.prompt([{

				type: 'checkbox',
				message: 'Select Manga to Download',
				name: 'download',
				choices: toDownload

			}], function(answers)
			{
				utils.downloadBundle(answers.download);
			})
		})

	})

} else if (args.search || args.S) {

	var query = args.search || args.S;

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

			console.log('requesting from %s with tags %s'.info, api, answers.tags.tag_name)

			request(api + '/tags/' + answers.tags.tag_name.toString().toLowerCase(), function(err, res, body)
			{
				if(err)
				{
					console.log(err)

					return false;
				}

				var data = JSON.parse(body);

				var choices = utils.buildChoiseManga(data.content)

				inquirer.prompt([{

					type: 'checkbox',
					message: 'Manga(s) with tags ' + answers.tags.tag_name,
					name: 'manga',
					choices: choices

				}], function(answers)
				{
					utils.printMangaInfo(answers.manga);

					var toDownload = utils.buildChoiseMangaToDownload(answers.manga)

					inquirer.prompt([{

						type: 'checkbox',
						message: 'Select Manga(s) to Download',
						name: 'download',
						choices: toDownload

					}], function(answers)
					{
						utils.downloadBundle(answers.download)
					})
				})
			})
		})
	})
}