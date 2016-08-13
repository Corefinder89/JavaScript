var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var app = express();

app.get('/scrape',function(req,resp){
	url='http://www.imdb.com/title/tt1229340/';
	request(url,function(error,response,html){
		if(!error){
			var $ = cheerio.load(html);
			var title,contentRating,genre,release,rating;
			var json={title:"",contentRating:"",genre:"",release:"",rating:""};

			$('.title_wrapper').filter(function(){
				var data=$(this);
				title = data.children().first().text().trim();
				json.title=title;
			});

			$('.subtext').filter(function(){
				var data=$(this);
				contentRating=data.children().attr('content');
				json.contentRating=contentRating;
			});

			$('.subtext>:nth-child(5)').filter(function(){
				var data = $(this);
				genre = data.first().text();
				json.genre = genre;
			});

			$('.subtext>:nth-child(7)').filter(function(){
				var data = $(this);
				release = data.first().text().trim();
				json.release = release;
			});

			$('.ratingValue').filter(function(){
				var data = $(this);
				rating = data.children().first().children().text();
				json.rating = rating;
			});
		}

		fs.writeFile('Scrape.json',JSON.stringify(json,null,4),function(){
			console.log("Scraped data in JSON format");
		});

		resp.send("Check console for output!!")
	});
})

app.listen(8081);