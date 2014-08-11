var __			= require('lodash')
var http		= require('http')
var https		= require('https')
var request		= require('request')
var fs			= require('fs-extra')
var path		= require('path')
var dir			= require('node-dir')
var color		= require('colors');
var progress	= require('progress')
var inquirer	= require('inquirer')
var changeCase	= require('change-case');
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

	request(api + '/index', function(err, res, body)
	{
		if(err)
		{
			throw err;
		}

		console.log('Information Received'.info)
		// console.log('Building User Interface'.info)

		var data = JSON.parse(body)

		var bar = new progress('Building User Interface [:bar] :percent', 
		{
			complete: '=',
			incomplete: ' ',
			width: 50,
			total: __.size(data.index)

		})

		var i = 1;

		var choices = [];

		__.each(data.index, function(value, key, list)
		{
			bar.tick();

			var temp = {};

			temp.name = '['+ changeCase.pascalCase(value.content_language) +'] ' + value.content_name

			temp.value = value;

			choices.push(temp)

			i++;
		})

		inquirer.prompt([{
		
			type: 'checkbox',
			message: 'Newest Manga',
			name: 'manga',
			choices: choices

		}], function(answers)
		{
			var toDownload = [];

			__.each(answers.manga, function(value, key, list)
			{
				console.log('┬─' + value.content_name)
				console.log('├────language : ' + changeCase.pascalCase(value.content_language))
				console.log('├────Caregory : ' + changeCase.pascalCase(value.content_category))
				console.log('├────Total Pages : ' + value.content_pages)
				console.log('└────tags : ' + __.map(value.content_tags, function(value){ return changeCase.pascalCase(value.attribute) }))
				console.log('')

				toDownload.push({
					name: value.content_name,
					value: value
				})
			})

			inquirer.prompt([{

				type: 'checkbox',
				message: 'Select Manga to Download',
				name: 'download',
				choices: toDownload

			}], function(answers)
			{
				__.each(answers.download, function(value, key, lists)
				{
					console.log('Getting Download Information for %s', value.content_name)

					request(api + value.content_url.replace('http://www.fakku.net', '') + '/read', function(err, res, body)
					{
						if(err)
						{
							console.log(err)

							return false;
						}

						var data = JSON.parse(body)

						fs.ensureDir(__dirname + '/downloads/' + value.content_name);

						var que = 1;

						var bar = new progress('Downloading '+value.content_name+' [:bar] :percent', 
						{
							complete: '=',
							incomplete: ' ',
							width: 50,
							total: value.content_pages

						})

						__.each(data.pages, function(_value, _key, _lists)
						{
							request(_value.image, function(err, res, body)
							{
								if(err)
								{
									console.log(err)

									return false;
								}

								bar.tick();

							}).pipe(fs.createWriteStream(__dirname + '/downloads/' + value.content_name + '/' + que + '.jpg'))

							que++;
						})

					})
				})
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

}