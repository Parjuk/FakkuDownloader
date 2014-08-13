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

		temp.name = '('+ i +') ['+ changeCase.pascalCase(value.content_language) +'] ' + value.content_name + ' ('+ i +')'

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
		if(!value.content_name)
		{
			return;
		}

		console.log('')
		console.log('┬─' + value.content_name)
		console.log('├────language : ' + changeCase.pascalCase(value.content_language))
		console.log('├────Caregory : ' + changeCase.pascalCase(value.content_category))
		console.log('├────Total Pages : ' + value.content_pages)
		console.log('├────Artist : ' + __.map(value.content_artists, function(value){ return changeCase.pascalCase(value.attribute) }))
		console.log('├────Translator : ' + __.map(value.content_translators, function(value){ return changeCase.pascalCase(value.attribute) }))
		console.log('└────Tags : ' + __.map(value.content_tags, function(value){ return changeCase.pascalCase(value.attribute) }))
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

utils.getNewest = function(pages, prevMangas)
{
	console.log('Gathering Information from %s'.info, api)

	request(api + '/index/page/' + pages , function(err, res, body)
	{
		if(err)
		{
			throw err;
		}

		console.log('Information Received'.info)
		
		var data = JSON.parse(body)

		var i = 1;

		var choices = utils.buildChoiseManga(data.index)

		choices.push({name: 'Next Page',value: 'nextPage'});

		inquirer.prompt([{
		
			type: 'checkbox',
			message: 'Newest Manga',
			name: 'manga',
			choices: choices

		}], function(answers)
		{
			if(__.indexOf(answers.manga, 'nextPage') >= 0)
			{
				utils.getNewest(pages + 1, answers.manga)

				return false;
			}

			var withoutNext = __.without(answers.manga, 'nextPage')
			prevMangas = __.without(prevMangas, 'nextPage')

			__.each(prevMangas, function(value, key, lists)
			{
				withoutNext.push(value);
			})

			utils.printMangaInfo(withoutNext);

			var toDownload = utils.buildChoiseMangaToDownload(withoutNext)

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
}

utils.getByTags = function(tag, pages, prevMangas)
{
	console.log('requesting from %s with tags %s'.info, api, tag)

	request(api + '/tags/' + tag + '/page/' + pages, function(err, res, body)
	{
		if(err)
		{
			console.log(err)

			return false;
		}

		var data = JSON.parse(body);

		var choices = utils.buildChoiseManga(data.content)

		choices.push({name: 'Next Page',value: 'nextPage'});

		inquirer.prompt([{

			type: 'checkbox',
			message: 'Manga(s) with tags ' + tag,
			name: 'manga',
			choices: choices

		}], function(answers)
		{
			if(__.indexOf(answers.manga, 'nextPage') >= 0)
			{
				utils.getByTags(tag, pages + 1, answers.manga)

				return false;
			}

			var withoutNext = __.without(answers.manga, 'nextPage')
			prevMangas = __.without(prevMangas, 'nextPage')

			__.each(prevMangas, function(value, key, lists)
			{
				withoutNext.push(value);
			})

			utils.printMangaInfo(withoutNext);

			var toDownload = utils.buildChoiseMangaToDownload(withoutNext)

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
}

utils.searchManga = function(query, pages, prevMangas)
{
	console.log('searching with "%s" keyword'.info, query)

	request(api + '/search/' + query + '/page/' + pages, function(err, res, body)
	{
		if(err)
		{
			console.log(err)

			return false;
		}

		var data = JSON.parse(body)

		var choices = utils.buildChoiseManga(data.content)

		choices.push({name: 'Next Page',value: 'nextPage'});

		inquirer.prompt([{

			type: 'checkbox',
			message: 'Search Result #' + pages,
			name: 'manga',
			choices: choices

		}], function(answers)
		{
			if(__.indexOf(answers.manga, 'nextPage') >= 0)
			{
				utils.searchManga(query, pages + 1, answers.manga)

				return false;
			}

			var withoutNext = __.without(answers.manga, 'nextPage')
			prevMangas = __.without(prevMangas, 'nextPage')

			__.each(prevMangas, function(value, key, lists)
			{
				withoutNext.push(value);
			})

			utils.printMangaInfo(withoutNext)

			var toDownload = utils.buildChoiseMangaToDownload(withoutNext)

			inquirer.prompt([{

				type: 'checkbox',
				message: 'Select Manga to Download',
				name: 'download',
				choices: toDownload

			}], function(answers)
			{
				utils.downloadBundle(answers.download)
			})
		})
	})
}

module.exports = utils