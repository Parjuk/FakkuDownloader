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


var api			= 'https://api.fakku.net'

var utils = {};

utils.buildChoiseManga = function(data)
{
	var choices = [];

	var i = 1;

	__.each(data, function(value, key, lists)
	{
		var temp = {};

		temp.name = i +') ['+ changeCase.pascalCase(value.content_language) +'] ' + value.content_name

		temp.value = value;

		choices.push(temp)

		i++;
	})

	return choices;
}

utils.printMangaInfo = function(data)
{
	__.each(data, function(value, key, lists)
	{
		console.log('')
		console.log('┬─' + value.content_name)
		console.log('├────language : ' + changeCase.pascalCase(value.content_language))
		console.log('├────Caregory : ' + changeCase.pascalCase(value.content_category))
		console.log('├────Total Pages : ' + value.content_pages)
		console.log('└────tags : ' + __.map(value.content_tags, function(value){ return changeCase.pascalCase(value.attribute) }))
		console.log('')

	})

	return this;
}

utils.buildChoiseMangaToDownload = function(data)
{
	var choices = [];

	__.each(data, function(value, key, lists)
	{
		var temp = {};

		temp.name = value.content_name

		temp.value = value;

		choices.push(temp)
	})

	return choices;
}

utils.downloadBundle = function(data)
{
	__.each(data, function(value, key, lists)
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
}

module.exports = utils