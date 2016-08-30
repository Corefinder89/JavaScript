var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.urlencoded({
	extended:true
}));
app.use(bodyParser.json());

app.get('/',function(req,resp){
	resp.send('Hello World');
});

app.listen(5000,function(){
	console.log('Listening to port 5000');
});

app.get('/webhook',function(req,resp){

	if(req.query['hub.verify_token'] === 'verify_token')
		resp.send(req.query['hub.challenge']);
	else
		resp.send('Validated from Facebook');
});

app.post('/webhook',function(req,resp){
	var messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    var event = req.body.entry[0].messaging[i];
    var sender = event.sender.id;
    if (event.message && event.message.text) {
      var location = event.message.text;
      var weatherEndpoint = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + location + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
      request({
        url: weatherEndpoint,
        json: true
      }, function(error, response, body) {
        try {
          var condition = body.query.results.channel.item.condition;
          sendTextMessage(sender, "Today is " + condition.temp + " and " + condition.text + " in " + location);
        } catch(err) {
          console.error('error caught', err);
          sendTextMessage(sender, "There was an error.");
        }
      });
    }
  }
  resp.sendStatus(200);
});

function sendTextMessage(sender, text) {
  var access_token ='EAAW0dD02KiQBAC7XwOB2ZB96uW2jVMfxnrEr2ZAT637mJiAZBJTj2KPM7MLcYWKCLeEzr2WiicS5lunED2Iox9BmkTPrTzmZAFilFboW3oZAiX8FukKohmYpTzMnJcfwiNPiTdwHBEiHNJxlbE2h2P6ezjMFE6q02v1Ee4u4S8QZDZD';
  var messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:access_token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

